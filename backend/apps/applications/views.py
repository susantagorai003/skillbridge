from datetime import datetime, timezone
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated
from database.connection import get_collection
from database.repositories.application_repository import ApplicationRepository
from database.repositories.opportunity_repository import OpportunityRepository
from services.notification_service import NotificationService
from services.audit_service import AuditService
from services.internshala_service import REALISTIC_TECH_INTERNSHIPS


class ApplicationListView(APIView):
    """
    Lists student applications or submits a new application.
    Backed strictly by MongoDB collection 'applications'.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        repo = ApplicationRepository()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        
        user_id = str(request.user.id) if (request.user and request.user.is_authenticated) else request.query_params.get('student_id')
        role = getattr(request.user, 'role', None) if (request.user and request.user.is_authenticated) else request.query_params.get('role')

        query = {}
        if role == 'student' and user_id:
            query['student_id'] = user_id
        elif role == 'company' and user_id:
            query['company_user_id'] = user_id
        elif request.query_params.get('company_id'):
            query['company_id'] = request.query_params.get('company_id')
        elif request.query_params.get('drive_id'):
            query['drive_id'] = request.query_params.get('drive_id')
        elif request.query_params.get('status'):
            query['status'] = request.query_params.get('status')

        result = repo.paginate(query, page=page, page_size=page_size, sort=[('created_at', -1)])
        return Response({'success': True, **result})

    def post(self, request):
        opp_id = request.data.get('opportunity_id') or request.data.get('drive_id')
        if not opp_id:
            return Response({'success': False, 'errors': {'opportunity_id': 'Opportunity or Placement Drive ID required'}}, status=status.HTTP_400_BAD_REQUEST)

        repo = ApplicationRepository()
        student_id = str(request.user.id) if (request.user and request.user.is_authenticated) else request.data.get('student_id', 'demo-student')

        # Check existing application to prevent duplicates
        existing = repo.find_one({'student_id': student_id, 'opportunity_id': str(opp_id)})
        if existing:
            return Response({'success': False, 'errors': {'detail': 'You have already applied for this opportunity.'}}, status=status.HTTP_400_BAD_REQUEST)

        # Look up in opportunities or placement_drives
        opp_repo = OpportunityRepository()
        opportunity = opp_repo.find_by_id(opp_id)
        
        if not opportunity:
            drives_col = get_collection('placement_drives')
            drive = drives_col.find_one({'id': str(opp_id)})
            if drive:
                opportunity = {
                    'id': drive.get('id'),
                    'title': drive.get('role_title'),
                    'company_name': drive.get('company_name'),
                    'company_id': drive.get('company_user_id', 'tpo_partner'),
                    'status': 'active',
                    'type': 'placement_drive'
                }

        if not opportunity and str(opp_id).startswith('ishala-'):
            for item in REALISTIC_TECH_INTERNSHIPS:
                if item['internship_id'] == str(opp_id):
                    opportunity = {
                        'id': str(opp_id),
                        'title': item['title'],
                        'company_name': item['company'],
                        'company_id': 'internshala_partner',
                        'status': 'active',
                        'type': 'internship'
                    }
                    break

        title = opportunity.get('title') if opportunity else request.data.get('title', 'Software Engineer')
        company_name = opportunity.get('company_name') if opportunity else request.data.get('company_name', 'Partner Company')
        company_id = opportunity.get('company_id') if opportunity else request.data.get('company_id', '')

        # Student info
        student_name = request.data.get('student_name', 'Student Candidate')
        student_email = request.data.get('student_email', '')
        if request.user and request.user.is_authenticated:
            student_name = request.user.name or student_name
            student_email = request.user.email or student_email

        # Fetch student profile for department and CGPA
        student_profiles = get_collection('student_profiles')
        prof = student_profiles.find_one({'user_id': student_id}) or {}
        department = prof.get('department') or 'Computer Science & Engineering'
        cgpa = prof.get('cgpa') or 8.0

        app_id = f"app-{uuid.uuid4().hex[:10]}"
        application_data = {
            'id': app_id,
            'student_id': student_id,
            'student_name': student_name,
            'student_email': student_email,
            'department': department,
            'cgpa': cgpa,
            'opportunity_id': str(opp_id),
            'opportunity_title': title,
            'company_id': str(company_id),
            'company_name': company_name,
            'status': 'applied',
            'status_notes': 'Application submitted for initial screening.',
            'cover_letter': request.data.get('cover_letter', ''),
            'resume_url': request.data.get('resume_url', ''),
            'match_score': request.data.get('match_score', 85),
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        created = repo.insert_one(application_data)
        
        # Increment registered_count if drive
        get_collection('placement_drives').update_one(
            {'id': str(opp_id)},
            {'$inc': {'registered_count': 1}}
        )

        AuditService.log_event(
            action='Application Submitted',
            actor_id=student_id,
            actor_role='student',
            actor_name=student_name,
            resource_type='application',
            resource_id=app_id,
            details=f"Applied for '{title}' at {company_name}."
        )

        NotificationService.send_notification(
            recipient_id=student_id,
            title='Application Submitted',
            message=f"Your application for '{title}' at {company_name} was submitted successfully.",
            notification_type='application_submitted',
            link='/student/applications'
        )

        return Response({'success': True, 'application': created}, status=status.HTTP_201_CREATED)


class ApplicationStatusUpdateView(APIView):
    """
    Recruiter or TPO updates candidate application status in the 8-stage pipeline:
    applied -> under_review -> shortlisted -> assessment -> interview_scheduled -> selected/rejected -> offer_released -> offer_accepted
    """
    permission_classes = [AllowAny]

    def put(self, request, pk):
        repo = ApplicationRepository()
        new_status = request.data.get('status')
        notes = request.data.get('status_notes', '')

        valid_statuses = [
            'applied', 'under_review', 'shortlisted', 'assessment',
            'interview_scheduled', 'selected', 'rejected',
            'offer_released', 'offer_accepted', 'offer_declined'
        ]
        if new_status not in valid_statuses:
            return Response({'success': False, 'errors': {'status': f'Must be one of {valid_statuses}'}}, status=status.HTTP_400_BAD_REQUEST)

        existing = repo.find_by_id(pk) or repo.find_one({'id': pk})
        if not existing:
            return Response({'success': False, 'errors': {'detail': 'Application not found'}}, status=status.HTTP_404_NOT_FOUND)

        update_data = {
            'status': new_status,
            'status_notes': notes or f"Moved to stage '{new_status.replace('_', ' ').title()}'.",
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        if 'rating' in request.data:
            update_data['rating'] = request.data.get('rating')
        if 'interview_date' in request.data:
            update_data['interview_date'] = request.data.get('interview_date')
        if 'ctc_lpa' in request.data:
            update_data['ctc_lpa'] = float(request.data.get('ctc_lpa'))

        updated = repo.update_one(existing.get('id', pk), update_data)

        # Notify the student about the stage change
        student_id = existing.get('student_id')
        opp_title = existing.get('opportunity_title', 'Opportunity')
        company = existing.get('company_name', 'Recruiter')
        
        status_label = new_status.replace('_', ' ').title()
        NotificationService.send_notification(
            recipient_id=student_id,
            title=f"Application Update: {status_label}",
            message=f"Your application for '{opp_title}' at {company} has been moved to '{status_label}'. {notes}",
            notification_type='application_status_update',
            link='/student/applications'
        )

        AuditService.log_event(
            action=f"Application Stage: {status_label}",
            actor_id=str(request.user.id) if (request.user and request.user.is_authenticated) else 'recruiter',
            actor_role='company',
            actor_name=company,
            resource_type='application',
            resource_id=pk,
            details=f"Candidate {existing.get('student_name')} status changed to {new_status}."
        )

        return Response({
            'success': True,
            'application': updated,
            'message': f"Candidate moved to '{status_label}' successfully."
        })
