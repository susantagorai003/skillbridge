"""
Super Admin API Suite for SkillBridge.
Provides institutional governance, role approval workflows, user deactivation,
department management, platform announcements, and system audit logging.
"""
from datetime import datetime, timezone
import uuid
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from database.connection import get_collection
from services.notification_service import NotificationService
from services.audit_service import AuditService
from services.messaging_service import MessagingService


class AdminUserManagementView(APIView):
    """
    Super Admin User Management:
    Lists users, approves registrations, activates/deactivates accounts, or updates roles.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        role = request.query_params.get('role')
        search = request.query_params.get('search', '').strip().lower()
        status_filter = request.query_params.get('status')  # 'active', 'inactive', 'pending'

        query = {}
        if role:
            query['role'] = role
        if status_filter == 'active':
            query['is_active'] = True
        elif status_filter == 'inactive':
            query['is_active'] = False
        elif status_filter == 'pending':
            query['is_verified'] = False

        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
            ]

        col = get_collection('users')
        users = []
        for u in col.find(query, {'password': 0}).sort('created_at', -1).limit(100):
            users.append({
                'id': str(u.get('id') or u.get('_id')),
                'name': u.get('name', ''),
                'email': u.get('email', ''),
                'role': u.get('role', 'student'),
                'is_active': bool(u.get('is_active', True)),
                'is_verified': bool(u.get('is_verified', False)),
                'created_at': u.get('created_at', ''),
                'last_login': u.get('last_login', '')
            })

        return Response({
            'success': True,
            'users': users,
            'total': len(users)
        })

    def patch(self, request, user_id=None):
        uid = user_id or request.data.get('user_id')
        if not uid:
            return Response({'success': False, 'errors': {'user_id': 'user_id required'}}, status=status.HTTP_400_BAD_REQUEST)

        col = get_collection('users')
        user = col.find_one({'$or': [{'id': uid}, {'_id': ObjectId(uid) if ObjectId.is_valid(uid) else None}]})
        if not user:
            return Response({'success': False, 'errors': {'detail': 'User not found'}}, status=status.HTTP_404_NOT_FOUND)

        updates = {}
        if 'is_active' in request.data:
            updates['is_active'] = bool(request.data['is_active'])
        if 'is_verified' in request.data:
            updates['is_verified'] = bool(request.data['is_verified'])
        if 'role' in request.data:
            updates['role'] = request.data['role']

        col.update_one({'_id': user['_id']}, {'$set': updates})

        AuditService.log_event(
            action='User Account Updated by SuperAdmin',
            actor_role='admin',
            actor_name='SuperAdmin',
            resource_type='user',
            resource_id=uid,
            details=f"Updated user {user.get('email')}: {updates}"
        )

        return Response({'success': True, 'message': 'User updated successfully!'})


class AdminApproveUserView(APIView):
    """Super Admin approves pending TPO, Faculty, or Company account registration."""
    permission_classes = [AllowAny]

    def post(self, request, user_id):
        action = request.data.get('action', 'approve')
        is_approved = (action == 'approve')

        col = get_collection('users')
        user = col.find_one({'$or': [{'id': user_id}, {'_id': ObjectId(user_id) if ObjectId.is_valid(user_id) else None}]})
        if not user:
            return Response({'success': False, 'errors': {'detail': 'User not found'}}, status=status.HTTP_404_NOT_FOUND)

        col.update_one({'_id': user['_id']}, {'$set': {'is_verified': is_approved, 'is_active': is_approved}})

        NotificationService.send_notification(
            recipient_id=str(user.get('id') or user['_id']),
            title='Account Registration Approved' if is_approved else 'Registration Rejected',
            message=f"Your {user.get('role', '').capitalize()} account on SkillBridge has been {'approved and activated' if is_approved else 'rejected'} by the SuperAdmin.",
            notification_type='account_approval',
            link='/login'
        )

        AuditService.log_event(
            action=f"Account Registration {action.capitalize()}d",
            actor_role='admin',
            actor_name='SuperAdmin',
            resource_type='user',
            resource_id=user_id,
            details=f"Approved: {is_approved} for {user.get('email')} ({user.get('role')})."
        )

        return Response({'success': True, 'message': f"Account {action}d successfully!"})


class AdminDepartmentView(APIView):
    """Super Admin Department & Academic Batches Management."""
    permission_classes = [AllowAny]

    def get(self, request):
        depts_col = get_collection('departments')
        profiles_col = get_collection('student_profiles')
        
        departments = list(depts_col.find({}, {'_id': 0}))
        for d in departments:
            d_name = d.get('name')
            d['enrolled_students'] = profiles_col.count_documents({'department': d_name})

        return Response({'success': True, 'departments': departments, 'total': len(departments)})

    def post(self, request):
        name = request.data.get('name')
        code = request.data.get('code')
        if not name or not code:
            return Response({'success': False, 'errors': {'detail': 'Department name and code required'}}, status=status.HTTP_400_BAD_REQUEST)

        doc = {
            'id': f"dept-{uuid.uuid4().hex[:8]}",
            'name': name,
            'code': code.upper(),
            'hod_name': request.data.get('hod_name', 'Department Head'),
            'academic_batches': request.data.get('academic_batches', ['2023-2027', '2024-2028']),
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        col = get_collection('departments')
        col.insert_one(doc)
        doc.pop('_id', None)

        AuditService.log_event(
            action='Department Created',
            actor_role='admin',
            actor_name='SuperAdmin',
            resource_type='department',
            resource_id=doc['id'],
            details=f"Created department {name} ({code})."
        )

        return Response({'success': True, 'department': doc, 'message': 'Department created successfully!'}, status=status.HTTP_201_CREATED)


class AdminAuditLogsView(APIView):
    """View real system audit logs."""
    permission_classes = [AllowAny]

    def get(self, request):
        role_filter = request.query_params.get('role')
        logs = AuditService.get_recent_logs(limit=50, actor_role=role_filter)
        return Response({'success': True, 'logs': logs, 'total': len(logs)})


class AdminAnnouncementView(APIView):
    """Broadcast platform-wide announcement to all roles."""
    permission_classes = [AllowAny]

    def post(self, request):
        title = request.data.get('title')
        message = request.data.get('message')
        target_role = request.data.get('target_role', 'all')

        if not title or not message:
            return Response({'success': False, 'errors': {'detail': 'Title and message required'}}, status=status.HTTP_400_BAD_REQUEST)

        if target_role == 'all':
            for r in ['student', 'faculty', 'company', 'tpo']:
                NotificationService.broadcast_to_role(r, title, message, 'announcement')
        else:
            NotificationService.broadcast_to_role(target_role, title, message, 'announcement')

        ann_doc = {
            'id': f"ann-{uuid.uuid4().hex[:8]}",
            'title': title,
            'message': message,
            'target_role': target_role,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        get_collection('announcements').insert_one(ann_doc)
        ann_doc.pop('_id', None)

        AuditService.log_event(
            action='Platform Announcement Broadcasted',
            actor_role='admin',
            actor_name='SuperAdmin',
            resource_type='announcement',
            resource_id=ann_doc['id'],
            details=f"Announcement '{title}' sent to {target_role}."
        )

        return Response({'success': True, 'announcement': ann_doc, 'message': 'Platform announcement broadcasted successfully!'}, status=status.HTTP_201_CREATED)


class AdminTestMessagingView(APIView):
    """
    Test and verify Email and WhatsApp delivery in production.
    Accepts target_email and target_phone.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        target_email = request.data.get('email')
        target_phone = request.data.get('phone')

        if not target_email and not target_phone:
            return Response({'success': False, 'message': 'Provide at least email or phone number to test.'}, status=status.HTTP_400_BAD_REQUEST)

        results = MessagingService.test_delivery(target_email=target_email, target_phone=target_phone)
        return Response({'success': True, 'results': results, 'message': 'Test notification processed.'})
