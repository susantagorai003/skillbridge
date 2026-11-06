import os
from datetime import datetime, timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated, IsStudent
from database.repositories.student_repository import StudentRepository
from database.repositories.skill_repository import StudentSkillRepository, SkillRepository
from database.repositories.application_repository import ApplicationRepository
from database.repositories.user_repository import UserRepository
from apps.students.serializers import StudentProfileSerializer, StudentSkillSerializer
from services.resume_service import ResumeService


class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repo = StudentRepository()
        target_user_id = request.query_params.get('user_id', request.user.id)
        profile = repo.find_by_user_id(target_user_id)
        user = UserRepository().find_by_id(target_user_id) or {}
        if not profile:
            profile = {
                'user_id': str(target_user_id),
                'university_id': None,
                'department_id': None,
                'degree': '',
                'semester': 1,
                'cgpa': 0.0,
                'phone': user.get('phone', ''),
                'career_interests': [],
                'skills': [],
            }
        else:
            if not profile.get('phone') and user.get('phone'):
                profile['phone'] = user.get('phone')
        return Response({'success': True, 'profile': profile})

    def put(self, request):
        repo = StudentRepository()
        serializer = StudentProfileSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        existing = repo.find_by_user_id(request.user.id)
        if existing:
            doc_id = existing.get('id') or existing.get('_id')
            updated = repo.update_one(doc_id, data) or existing
        else:
            data['user_id'] = str(request.user.id)
            updated = repo.insert_one(data)

        # Mark profile completed in users AND sync phone number
        user_updates = {'profile_completed': True}
        if data.get('phone'):
            user_updates['phone'] = data.get('phone')
        UserRepository().update_one(request.user.id, user_updates)
        return Response({'success': True, 'profile': updated})


class StudentSkillListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repo = StudentSkillRepository()
        skill_repo = SkillRepository()
        student_id = request.query_params.get('student_id', request.user.id)
        skills = repo.find_by_student(student_id)

        for s in skills:
            info = skill_repo.find_by_id(s['skill_id'])
            s['skill_name'] = info.get('name', 'Unknown') if info else 'Unknown'

        return Response({'success': True, 'skills': skills})

    def post(self, request):
        repo = StudentSkillRepository()
        serializer = StudentSkillSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        skill_data = serializer.validated_data
        result = repo.upsert_skill(
            student_id=request.user.id,
            skill_id=skill_data['skill_id'],
            data={
                'proficiency_level': skill_data.get('proficiency_level', 1),
                'is_verified': False,
                'source': 'self_reported'
            }
        )
        return Response({'success': True, 'skill': result}, status=status.HTTP_201_CREATED)


class StudentSkillDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, skill_id):
        repo = StudentSkillRepository()
        existing = repo.find_student_skill(request.user.id, skill_id)
        if not existing:
            return Response({'success': False, 'errors': {'detail': 'Skill not found'}}, status=status.HTTP_404_NOT_FOUND)

        proficiency = int(request.data.get('proficiency_level', existing.get('proficiency_level', 1)))
        updated = repo.update_one(existing['id'], {'proficiency_level': proficiency})
        return Response({'success': True, 'skill': updated})

    def delete(self, request, skill_id):
        repo = StudentSkillRepository()
        removed = repo.remove_skill(request.user.id, skill_id)
        return Response({'success': removed})


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'resume' not in request.FILES:
            return Response({'success': False, 'errors': {'detail': 'No resume file uploaded'}}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['resume']
        if not file_obj.name.lower().endswith('.pdf'):
            return Response({'success': False, 'errors': {'detail': 'Only PDF resumes are supported'}}, status=status.HTTP_400_BAD_REQUEST)

        # Save temporarily
        os.makedirs(settings.MEDIA_ROOT / 'resumes', exist_ok=True)
        file_path = settings.MEDIA_ROOT / 'resumes' / f"{request.user.id}_{file_obj.name}"
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # Parse with PyMuPDF service
        service = ResumeService()
        analysis = service.analyze_resume(str(file_path))

        # Update student profile with resume path
        StudentRepository().update_one(
            request.user.id,
            {'resume_url': f"/media/resumes/{request.user.id}_{file_obj.name}"}
        )

        return Response({'success': True, 'analysis': analysis})


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student_id = str(request.user.id)
        student_repo = StudentRepository()
        skill_repo = StudentSkillRepository()
        app_repo = ApplicationRepository()

        profile = student_repo.find_by_user_id(student_id)
        skills = skill_repo.find_by_student(student_id)
        apps = app_repo.find_by_student(student_id)

        verified_skills = sum(1 for s in skills if s.get('is_verified'))
        avg_proficiency = sum(s.get('proficiency_level', 1) for s in skills) / max(1, len(skills))
        readiness_score = round(min(100, (len(skills) * 8 + avg_proficiency * 12 + (15 if profile and profile.get('cgpa', 0) > 7.0 else 5))), 1)

        return Response({
            'success': True,
            'stats': {
                'total_skills': len(skills),
                'verified_skills': verified_skills,
                'avg_proficiency': round(avg_proficiency, 1),
                'readiness_score': readiness_score,
                'active_applications': len(apps.get('items', [])),
                'profile_completed': bool(profile and profile.get('cgpa')),
            },
            'recent_applications': apps.get('items', [])[:5],
            'skills': skills,
        })


from database.connection import get_collection
from services.notification_service import NotificationService
from services.audit_service import AuditService
from services.messaging_service import MessagingService

def match_student_branch(student_dept, eligible_branches):
    if not eligible_branches or 'all' in [b.lower() for b in eligible_branches]:
        return True
    s_lower = student_dept.lower()
    for b in eligible_branches:
        b_lower = b.lower()
        if b_lower in s_lower or s_lower in b_lower:
            return True
        if b_lower == 'cse' and ('computer science' in s_lower or 'computer engineering' in s_lower):
            return True
        if b_lower == 'it' and 'information technology' in s_lower:
            return True
        if b_lower == 'ece' and 'electronics' in s_lower:
            return True
    return False


class StudentPlacementDrivesView(APIView):
    """
    Additive integration view:
    Returns active placement drives announced by TPO, with automatic eligibility check for this student.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = str(request.user.id) if (request.user and request.user.is_authenticated) else request.query_params.get('student_id')
        
        # Student profile
        profiles_col = get_collection('student_profiles')
        prof = profiles_col.find_one({'user_id': user_id}) or {}
        student_cgpa = float(prof.get('cgpa', 8.0) or 8.0)
        student_dept = prof.get('department', 'Computer Science & Engineering').lower()

        # Check existing applications
        apps_col = get_collection('applications')
        applied_drive_ids = set()
        if user_id:
            for a in apps_col.find({'student_id': user_id}, {'opportunity_id': 1}):
                applied_drive_ids.add(str(a.get('opportunity_id')))

        # Active drives
        drives_col = get_collection('placement_drives')
        drives = list(drives_col.find({'status': {'$in': ['Active', 'active', 'published']}}, {'_id': 0}).sort('created_at', -1))

        enriched = []
        for d in drives:
            did = str(d.get('id'))
            min_cgpa = float(d.get('min_cgpa', 0.0))
            eligible_branches = [b.lower() for b in d.get('eligible_branches', [])]
            
            reasons = []
            if student_cgpa < min_cgpa:
                reasons.append(f"Min CGPA required is {min_cgpa} (yours: {student_cgpa})")
            if eligible_branches and not match_student_branch(student_dept, d.get('eligible_branches', [])):
                reasons.append(f"Eligible branches: {', '.join(d.get('eligible_branches', []))}")

            enriched.append({
                **d,
                'is_eligible': len(reasons) == 0,
                'ineligibility_reasons': reasons,
                'has_applied': did in applied_drive_ids
            })

        return Response({'success': True, 'drives': enriched, 'total': len(enriched)})


class StudentInterviewsView(APIView):
    """Additive integration: View interviews scheduled for this student."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = str(request.user.id) if (request.user and request.user.is_authenticated) else request.query_params.get('student_id')
        query = {'candidate_id': user_id} if user_id else {}
        col = get_collection('interviews')
        interviews = list(col.find(query, {'_id': 0}).sort('interview_date', 1))
        return Response({'success': True, 'interviews': interviews, 'total': len(interviews)})


class StudentOffersView(APIView):
    """Additive integration: View and respond to formal job/internship offers."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = str(request.user.id) if (request.user and request.user.is_authenticated) else request.query_params.get('student_id')
        query = {'candidate_id': user_id} if user_id else {}
        col = get_collection('offers')
        offers = list(col.find(query, {'_id': 0}).sort('issued_at', -1))
        return Response({'success': True, 'offers': offers, 'total': len(offers)})

    def post(self, request, offer_id):
        action = request.data.get('action', 'accept')  # 'accept' or 'decline'
        new_status = 'offer_accepted' if action == 'accept' else 'offer_declined'

        col = get_collection('offers')
        offer = col.find_one({'id': offer_id})
        if not offer:
            return Response({'success': False, 'errors': {'detail': 'Offer not found'}}, status=status.HTTP_404_NOT_FOUND)

        col.update_one({'id': offer_id}, {'$set': {'status': new_status, 'responded_at': datetime.now(timezone.utc).isoformat()}})

        # Update application status
        get_collection('applications').update_many(
            {'$or': [{'offer_id': offer_id}, {'student_id': str(offer.get('candidate_id'))}]},
            {'$set': {'status': new_status}}
        )

        AuditService.log_event(
            action=f"Offer {action.capitalize()}ed by Student",
            actor_role='student',
            actor_name=offer.get('candidate_name', 'Student'),
            resource_type='offer',
            resource_id=offer_id,
            details=f"Student {action}ed offer from {offer.get('company_name')} for {offer.get('role_title')}."
        )

        return Response({'success': True, 'message': f"Offer {action}ed successfully!", 'status': new_status})


class StudentTrainingsView(APIView):
    """
    Additive integration:
    - GET: View all active TPO bootcamps & upskilling programs with student enrollment status.
    - POST: Student registration / enrollment for a TPO training bootcamp.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = str(request.user.id) if (request.user and request.user.is_authenticated) else request.query_params.get('student_id')
        user_email = request.user.email if (request.user and request.user.is_authenticated) else request.query_params.get('student_email')

        profiles_col = get_collection('student_profiles')
        prof = profiles_col.find_one({'user_id': user_id}) or {}
        dept_name = prof.get('department', 'Computer Science & Engineering')

        col = get_collection('training_programs')
        trainings = list(col.find({'status': {'$in': ['active', 'Active', 'published']}}, {'_id': 0}).sort('created_at', -1))

        enrolled_count = 0
        for t in trainings:
            reg_list = t.get('registered_students', [])
            is_enrolled = any(
                (user_id and str(r.get('student_id')) == str(user_id)) or
                (user_email and str(r.get('student_email', '')).lower() == str(user_email).lower())
                for r in reg_list
            )
            t['is_enrolled'] = is_enrolled
            if is_enrolled:
                enrolled_count += 1

            t_dept = (t.get('department') or 'All Departments').strip()
            t['is_recommended'] = (
                t_dept in ['All Departments', 'All Cohorts', 'All', ''] or
                dept_name.lower() in t_dept.lower() or
                t_dept.lower() in dept_name.lower() or
                ('cse' in t_dept.lower() and 'computer' in dept_name.lower())
            )

        return Response({
            'success': True,
            'trainings': trainings,
            'total': len(trainings),
            'enrolled_count': enrolled_count,
            'student_department': dept_name
        })

    def post(self, request):
        training_id = request.data.get('training_id')
        if not training_id:
            return Response({'success': False, 'errors': {'training_id': 'Training program ID required'}}, status=status.HTTP_400_BAD_REQUEST)

        col = get_collection('training_programs')
        training = col.find_one({'id': training_id})
        if not training:
            return Response({'success': False, 'message': 'Training program not found.'}, status=status.HTTP_404_NOT_FOUND)

        student_id = str(request.user.id) if (request.user and request.user.is_authenticated) else request.data.get('student_id')
        student_email = request.user.email if (request.user and request.user.is_authenticated) else request.data.get('student_email')
        student_name = getattr(request.user, 'name', None) if (request.user and request.user.is_authenticated) else request.data.get('student_name', 'Student')

        profiles_col = get_collection('student_profiles')
        prof = profiles_col.find_one({'user_id': student_id}) or {}
        student_phone = request.data.get('phone') or prof.get('phone') or getattr(request.user, 'phone', '')
        dept_name = prof.get('department', 'Computer Science & Engineering')

        # Check if already enrolled
        registered_students = training.get('registered_students', [])
        already_enrolled = any(
            (student_id and str(r.get('student_id')) == str(student_id)) or
            (student_email and str(r.get('student_email', '')).lower() == str(student_email).lower())
            for r in registered_students
        )

        if already_enrolled:
            return Response({
                'success': True,
                'message': f"You are already enrolled in '{training.get('title')}'!",
                'is_enrolled': True
            })

        enrollment_entry = {
            'student_id': str(student_id),
            'student_name': student_name or 'Student',
            'student_email': student_email or '',
            'phone': student_phone,
            'department': dept_name,
            'registered_at': datetime.now(timezone.utc).isoformat()
        }

        col.update_one(
            {'id': training_id},
            {
                '$push': {'registered_students': enrollment_entry},
                '$inc': {'enrolled_students_count': 1}
            }
        )

        # 1. In-App notification
        if student_id:
            NotificationService.send_notification(
                recipient_id=student_id,
                title="Bootcamp Enrollment Confirmed",
                message=f"You are successfully registered for '{training.get('title')}'. First session begins {training.get('start_date', 'soon')}.",
                notification_type='training_enrolled',
                link='/student/trainings'
            )

        # 2. Multi-channel Email & WhatsApp notification
        student_info = {
            'id': student_id,
            'name': student_name or 'Student',
            'email': student_email,
            'phone': student_phone
        }
        MessagingService.notify_training_registration(student_info, training)

        # 3. Audit Log
        AuditService.log_event(
            action='Student Enrolled in Bootcamp',
            actor_role='student',
            actor_name=student_name or 'Student',
            resource_type='training',
            resource_id=training_id,
            details=f"Student {student_name} ({student_email}) enrolled in bootcamp '{training.get('title')}'."
        )

        return Response({
            'success': True,
            'message': f"Successfully registered for '{training.get('title')}'! Check your schedule below.",
            'is_enrolled': True
        }, status=status.HTTP_200_OK)
