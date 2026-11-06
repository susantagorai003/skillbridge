"""
Faculty / Department Placement Coordinator API Suite for SkillBridge.
Provides department-scoped operations strictly backed by MongoDB:
1. Faculty Dashboard Overview (department-scoped KPIs)
2. Department Student Roster & Academic Monitoring
3. Mentoring Sessions & Mock Interview Feedback
4. Remedial Bootcamp & Training Recommendations to TPO
5. Curriculum Competency Alignment & Syllabus Editor
6. Department Reports Exporter
"""
from datetime import datetime, timezone
import uuid
import csv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from database.connection import get_collection
from services.candidate_service import CandidateService
from services.notification_service import NotificationService
from services.audit_service import AuditService

INITIAL_COURSES = [
    {
        'course_code': 'CS301',
        'title': 'Web Technologies & Frontend Architectures',
        'semester': 5,
        'department': 'Computer Science & Engineering',
        'instructor': 'Dr. S. K. Mukherjee',
        'alignment_score': 76.0,
        'syllabus_topics': ['HTML5 Semantic Layouts', 'CSS3 & Flexbox', 'JavaScript ES6+', 'React Components', 'SQL Basics'],
        'missing_industry_skills': ['Docker Containerization', 'TypeScript', 'REST API Design', 'Tailwind CSS'],
        'recommendation': 'Update lab exercises to include TypeScript and Docker for containerized deployment.'
    },
    {
        'course_code': 'CS402',
        'title': 'Database Engineering & Distributed Data Systems',
        'semester': 6,
        'department': 'Computer Science & Engineering',
        'instructor': 'Prof. Ananya Sen',
        'alignment_score': 81.0,
        'syllabus_topics': ['Relational Modeling', 'SQL Joins & Indexing', 'ACID Transactions', 'Stored Procedures'],
        'missing_industry_skills': ['MongoDB / NoSQL', 'Redis In-Memory Caching', 'Database Sharding'],
        'recommendation': 'Add a 2-week module on NoSQL database modeling with MongoDB.'
    },
    {
        'course_code': 'CS505',
        'title': 'Cloud Infrastructure, Containers & DevOps',
        'semester': 7,
        'department': 'Computer Science & Engineering',
        'instructor': 'Dr. Rajesh Rao',
        'alignment_score': 74.0,
        'syllabus_topics': ['Virtualization Concepts', 'Linux Administration', 'IaaS vs PaaS Fundamentals'],
        'missing_industry_skills': ['CI/CD GitHub Actions', 'Kubernetes Orchestration', 'AWS S3 & EC2 Deployment'],
        'recommendation': 'Incorporate live cloud deployment using GitHub Actions continuous integration.'
    }
]


class FacultyOverviewView(APIView):
    """Department-level dynamic KPI overview."""
    permission_classes = [AllowAny]

    def get(self, request):
        dept_name = request.query_params.get('department', 'Computer Science & Engineering')
        
        users_col = get_collection('users')
        profiles_col = get_collection('student_profiles')
        apps_col = get_collection('applications')
        drives_col = get_collection('placement_drives')
        curriculum_col = get_collection('curriculum_matrix')
        trainings_col = get_collection('training_programs')

        # Department students
        dept_candidates = CandidateService.get_all_candidates(department=dept_name, limit=100)
        total_students = len(dept_candidates)

        # Placed vs unplaced
        placed_students_set = set()
        for app in apps_col.find({'department': dept_name, 'status': {'$in': ['selected', 'offer_released', 'offer_accepted']}}, {'student_id': 1}):
            placed_students_set.add(str(app.get('student_id')))

        total_placed = len(placed_students_set)
        total_unplaced = max(total_students - total_placed, 0)
        placement_pct = round((total_placed / total_students * 100), 1) if total_students > 0 else 0.0

        # Department drives
        upcoming_drives = drives_col.count_documents({
            'eligible_branches': {'$in': ['CSE', 'CS', dept_name, 'All']},
            'status': {'$in': ['Active', 'active', 'published']}
        })

        # Average readiness
        avg_readiness = round(sum(c.get('readiness_score', 75) for c in dept_candidates) / total_students, 1) if dept_candidates else 75.0

        # Curriculum alignment
        courses = list(curriculum_col.find({}, {'_id': 0})) or INITIAL_COURSES
        avg_alignment = round(sum(c.get('alignment_score', 75.0) for c in courses) / len(courses), 1) if courses else 78.0

        # Students requiring training
        at_risk = sum(1 for c in dept_candidates if c.get('readiness_score', 80) < 75)

        return Response({
            'success': True,
            'department': dept_name,
            'stats': {
                'total_students': total_students,
                'total_placed': total_placed,
                'total_unplaced': total_unplaced,
                'placement_percentage': placement_pct,
                'upcoming_placement_drives': upcoming_drives,
                'average_readiness_score': avg_readiness,
                'curriculum_alignment_score': avg_alignment,
                'students_requiring_training': at_risk,
                'active_training_programs': trainings_col.count_documents({'department': dept_name, 'status': 'active'}),
            }
        })


class FacultyStudentRosterView(APIView):
    """Department-scoped student roster with academic history, skills, and preparation tracking."""
    permission_classes = [AllowAny]

    def get(self, request):
        dept_name = request.query_params.get('department', 'Computer Science & Engineering')
        search = request.query_params.get('search', '').strip().lower()

        candidates = CandidateService.get_all_candidates(department=dept_name, limit=100)
        if search:
            candidates = [
                c for c in candidates
                if search in c.get('full_name', '').lower() or search in c.get('email', '').lower()
            ]

        return Response({
            'success': True,
            'department': dept_name,
            'students': candidates,
            'total': len(candidates)
        })


class FacultyMentoringView(APIView):
    """Record mentoring feedback, mock interview evaluations, and academic interventions."""
    permission_classes = [AllowAny]

    def get(self, request):
        col = get_collection('mentorships')
        student_id = request.query_params.get('student_id')
        query = {'student_id': str(student_id)} if student_id else {}
        records = list(col.find(query, {'_id': 0}).sort('created_at', -1))
        return Response({'success': True, 'records': records, 'total': len(records)})

    def post(self, request):
        student_id = request.data.get('student_id')
        feedback = request.data.get('feedback')
        mock_score = request.data.get('mock_score', 8.0)
        session_topic = request.data.get('session_topic', 'Technical DSA & System Design Review')
        mentor_name = request.data.get('mentor_name', 'Faculty Mentor')

        if not student_id or not feedback:
            return Response({'success': False, 'errors': {'detail': 'student_id and feedback required'}}, status=status.HTTP_400_BAD_REQUEST)

        doc = {
            'id': f"mentor-{uuid.uuid4().hex[:8]}",
            'student_id': str(student_id),
            'student_name': request.data.get('student_name', 'Student Candidate'),
            'mentor_name': mentor_name,
            'session_topic': session_topic,
            'mock_score': float(mock_score),
            'feedback': feedback,
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        col = get_collection('mentorships')
        col.insert_one(doc)
        doc.pop('_id', None)

        NotificationService.send_notification(
            recipient_id=student_id,
            title='Mentoring Feedback Added',
            message=f"{mentor_name} recorded feedback for '{session_topic}' (Score: {mock_score}/10): {feedback[:90]}...",
            notification_type='mentoring_feedback',
            link='/student'
        )

        AuditService.log_event(
            action='Mentoring Feedback Logged',
            actor_role='faculty',
            actor_name=mentor_name,
            resource_type='mentorship',
            resource_id=doc['id'],
            details=f"Mentoring session recorded for student {student_id}."
        )

        return Response({'success': True, 'record': doc, 'message': 'Mentoring session logged successfully!'}, status=status.HTTP_201_CREATED)


class FacultyRecommendTrainingView(APIView):
    """Faculty recommends a remedial or specialized training program to TPO."""
    permission_classes = [AllowAny]

    def post(self, request):
        topic = request.data.get('topic')
        skills = request.data.get('skills', ['Docker', 'CI/CD'])
        department = request.data.get('department', 'Computer Science & Engineering')
        justification = request.data.get('justification', 'Based on recent student mock interview skill gaps.')
        faculty_name = request.data.get('faculty_name', 'Department Placement Coordinator')

        if not topic:
            return Response({'success': False, 'errors': {'topic': 'Training topic required'}}, status=status.HTTP_400_BAD_REQUEST)

        rec_doc = {
            'id': f"train-rec-{uuid.uuid4().hex[:8]}",
            'topic': topic,
            'department': department,
            'skills': skills if isinstance(skills, list) else [s.strip() for s in str(skills).split(',')],
            'justification': justification,
            'faculty_name': faculty_name,
            'status': 'pending_tpo_review',
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        col = get_collection('training_recommendations')
        col.insert_one(rec_doc)
        rec_doc.pop('_id', None)

        # Notify TPO
        NotificationService.broadcast_to_role(
            target_role='tpo',
            title='New Training Program Recommendation',
            message=f"{faculty_name} ({department}) recommended a new training program: '{topic}'.",
            notification_type='training_recommendation',
            link='/tpo/trainings'
        )

        AuditService.log_event(
            action='Training Program Recommended to TPO',
            actor_role='faculty',
            actor_name=faculty_name,
            resource_type='training_recommendation',
            resource_id=rec_doc['id'],
            details=f"Recommended training on {topic} for {department}."
        )

        return Response({'success': True, 'recommendation': rec_doc, 'message': 'Training recommendation submitted to TPO!'}, status=status.HTTP_201_CREATED)


class FacultyCurriculumView(APIView):
    """Curriculum Competency Alignment & Syllabus Editor for Faculty."""
    permission_classes = [AllowAny]

    def get(self, request):
        col = get_collection('curriculum_matrix')
        courses = list(col.find({}, {'_id': 0}))
        if not courses:
            for c in INITIAL_COURSES:
                col.insert_one(dict(c))
            courses = list(INITIAL_COURSES)

        avg_score = round(sum(c.get('alignment_score', 75.0) for c in courses) / len(courses), 1) if courses else 80.0

        return Response({
            'success': True,
            'department': 'Computer Science & Engineering',
            'department_alignment_score': avg_score,
            'courses': courses,
            'total_courses': len(courses)
        })

    def post(self, request):
        """Add a missing industry skill to a course syllabus."""
        course_code = request.data.get('course_code')
        skill_name = request.data.get('skill_name')

        if not course_code or not skill_name:
            return Response({'success': False, 'errors': {'detail': 'course_code and skill_name required'}}, status=status.HTTP_400_BAD_REQUEST)

        col = get_collection('curriculum_matrix')
        course = col.find_one({'course_code': course_code})
        if not course:
            course = next((c for c in INITIAL_COURSES if c['course_code'] == course_code), None)
            if not course:
                return Response({'success': False, 'errors': {'detail': 'Course not found'}}, status=status.HTTP_404_NOT_FOUND)
            col.insert_one(dict(course))

        topics = course.get('syllabus_topics', [])
        missing = course.get('missing_industry_skills', [])

        if skill_name not in topics:
            topics.append(skill_name)
        if skill_name in missing:
            missing.remove(skill_name)

        new_score = min(round(course.get('alignment_score', 75.0) + 5.5, 1), 98.0)

        col.update_one(
            {'course_code': course_code},
            {'$set': {
                'syllabus_topics': topics,
                'missing_industry_skills': missing,
                'alignment_score': new_score,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }}
        )

        all_courses = list(col.find({}, {'alignment_score': 1}))
        dept_alignment = round(sum(c.get('alignment_score', 75.0) for c in all_courses) / len(all_courses), 1)

        AuditService.log_event(
            action='Course Syllabus Updated',
            actor_role='faculty',
            actor_name='Course Instructor',
            resource_type='course',
            resource_id=course_code,
            details=f"Added '{skill_name}' to {course_code} syllabus. New alignment: {new_score}%."
        )

        return Response({
            'success': True,
            'message': f"Added '{skill_name}' to {course_code} syllabus!",
            'course_code': course_code,
            'new_alignment_score': new_score,
            'new_department_alignment': dept_alignment
        })


class ExportDepartmentReportCSV(APIView):
    """Exports department placement and skill analytics directly as CSV."""
    permission_classes = [AllowAny]

    def get(self, request):
        dept_name = request.query_params.get('department', 'Computer Science & Engineering')
        candidates = CandidateService.get_all_candidates(department=dept_name, limit=200)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="SkillBridge_{dept_name.replace(" ", "_")}_Report.csv"'

        writer = csv.writer(response)
        writer.writerow(['Student Name', 'Email', 'Degree', 'Semester', 'CGPA', 'Readiness Score', 'Verified Skills', 'Placement Status'])

        for c in candidates:
            writer.writerow([
                c.get('full_name', ''),
                c.get('email', ''),
                c.get('degree', ''),
                c.get('semester', 7),
                c.get('cgpa', 8.0),
                f"{c.get('readiness_score', 80)}%",
                ", ".join(c.get('skills', [])),
                c.get('placement_status', 'Available')
            ])

        return response
