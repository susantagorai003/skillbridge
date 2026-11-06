import os
import uuid
from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from database.connection import get_collection
from database.repositories.skill_repository import JobRoleRepository, SkillRepository
from database.repositories.student_repository import StudentRepository
from services.resume_service import ResumeService
from services.ai_service import AIService, ROLE_BENCHMARKS
from services.skill_gap_service import SkillGapService


class ResumeUploadView(APIView):
    """
    Upload and parse student CV / Resume (PDF or raw text).
    Extracts candidate profile, skills, education, and projects,
    and persists record into MongoDB 'resumes' collection.
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        resume_service = ResumeService()
        raw_text = ""
        filename = "pasted_resume.txt"

        # Check for uploaded file
        if 'file' in request.FILES or 'resume' in request.FILES:
            uploaded_file = request.FILES.get('file') or request.FILES.get('resume')
            filename = uploaded_file.name
            
            if filename.lower().endswith('.pdf'):
                # Extract using PyMuPDF from bytes
                raw_text = resume_service.extract_text_from_pdf(uploaded_file.read())
            else:
                # Text or other format
                try:
                    raw_text = uploaded_file.read().decode('utf-8', errors='ignore')
                except Exception:
                    raw_text = ""
        elif 'resume_text' in request.data:
            raw_text = request.data.get('resume_text', '')
            filename = request.data.get('filename', 'resume_submission.txt')

        if not raw_text or len(raw_text.strip()) < 20:
            return Response({
                'success': False,
                'errors': {'detail': 'Could not extract readable text from the provided resume. Please upload a clear PDF or paste resume text.'}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Parse content
        parsed_data = resume_service.parse_resume_content(raw_text)

        # Determine student / user identity
        user_id = None
        if request.user and request.user.is_authenticated:
            user_id = str(request.user.id)
        elif request.data.get('student_id'):
            user_id = str(request.data.get('student_id'))

        # Save to MongoDB resumes collection
        resume_doc = {
            'resume_id': str(uuid.uuid4()),
            'user_id': user_id,
            'filename': filename,
            'parsed_data': parsed_data,
            'extracted_skills': parsed_data['skills'],
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
        }
        resumes_col = get_collection('resumes')
        insert_res = resumes_col.insert_one(resume_doc)
        resume_doc['id'] = str(insert_res.inserted_id)
        resume_doc.pop('_id', None)

        # If user exists, update student profile skills in MongoDB
        if user_id:
            student_col = get_collection('student_profiles')
            student_col.update_one(
                {'user_id': user_id},
                {
                    '$set': {
                        'latest_resume_id': resume_doc['resume_id'],
                        'extracted_skills': parsed_data['skills'],
                        'education': parsed_data['education'],
                        'updated_at': datetime.now(timezone.utc),
                    }
                },
                upsert=True
            )

        return Response({
            'success': True,
            'message': 'Resume successfully analyzed and profile extracted.',
            'resume_id': resume_doc['resume_id'],
            'parsed_data': parsed_data,
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        """Retrieve uploaded resumes for the current user."""
        user_id = str(request.user.id) if request.user and request.user.is_authenticated else request.query_params.get('student_id')
        if not user_id:
            return Response({'success': True, 'resumes': []})

        docs = list(get_collection('resumes').find({'user_id': user_id}).sort('created_at', -1).limit(10))
        for d in docs:
            d['id'] = str(d.pop('_id'))
        return Response({'success': True, 'resumes': docs})


class SkillGapAnalyzeView(APIView):
    """
    Perform deep AI skill gap analysis against a target career role or custom JD.
    Takes candidate skills directly, or extracts them from provided resume text/ID.
    Saves report and dynamic learning roadmap into MongoDB.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        target_role = request.data.get('target_role', 'Full Stack Developer')
        custom_jd = request.data.get('custom_job_description', '')
        candidate_skills = request.data.get('skills', [])
        resume_text = request.data.get('resume_text', '')
        resume_id = request.data.get('resume_id')

        # If resume text provided, extract skills on the fly
        if resume_text and len(resume_text.strip()) > 30:
            parsed = ResumeService().parse_resume_content(resume_text)
            candidate_skills = list(set(candidate_skills + parsed['skills']))

        # If resume_id provided, fetch extracted skills from MongoDB
        elif resume_id:
            doc = get_collection('resumes').find_one({'resume_id': str(resume_id)})
            if doc and 'extracted_skills' in doc:
                candidate_skills = list(set(candidate_skills + doc['extracted_skills']))

        # If authenticated student with no explicit skills passed, pull student skills
        elif not candidate_skills and request.user and request.user.is_authenticated:
            student_profile = get_collection('student_profiles').find_one({'user_id': str(request.user.id)})
            if student_profile and 'extracted_skills' in student_profile:
                candidate_skills = student_profile.get('extracted_skills', [])

        # If candidate still has empty skills, do not fabricate dummy score
        if not candidate_skills:
            return Response({
                'success': False,
                'errors': {'detail': 'Please upload a resume or provide candidate skills to run the analysis.'}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Run AI Skill Gap Engine
        ai_service = AIService()
        analysis = ai_service.analyze_skill_gap(
            candidate_skills=candidate_skills,
            target_role=target_role,
            custom_job_description=custom_jd
        )

        user_id = str(request.user.id) if request.user and request.user.is_authenticated else request.data.get('student_id')

        # Persist report to MongoDB
        report_id = str(uuid.uuid4())
        report_doc = {
            'report_id': report_id,
            'user_id': user_id,
            'target_role': target_role,
            'candidate_skills': candidate_skills,
            'analysis': analysis,
            'created_at': datetime.now(timezone.utc),
        }
        get_collection('skill_gap_reports').insert_one(report_doc)
        report_doc.pop('_id', None)

        # Persist generated roadmap to MongoDB
        roadmap_doc = {
            'roadmap_id': str(uuid.uuid4()),
            'report_id': report_id,
            'user_id': user_id,
            'target_role': target_role,
            'phases': analysis['roadmap'],
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
        }
        get_collection('learning_roadmaps').insert_one(roadmap_doc)
        roadmap_doc.pop('_id', None)

        return Response({
            'success': True,
            'report_id': report_id,
            'analysis': analysis,
            'roadmap': analysis['roadmap'],
            'interview_prep': analysis['interview_prep'],
        }, status=status.HTTP_200_OK)

    def get(self, request):
        """
        Legacy GET support: analyze student against role_id from query params.
        """
        role_id = request.query_params.get('role_id')
        role_name = request.query_params.get('role_name', 'Full Stack Developer')
        
        # If role_id provided, look up title
        if role_id:
            role_info = JobRoleRepository().find_by_id(role_id)
            if role_info and 'title' in role_info:
                role_name = role_info['title']

        # Get student's current skills
        student_id = str(request.user.id) if request.user and request.user.is_authenticated else request.query_params.get('student_id')
        student_skills = []
        if student_id:
            profile = get_collection('student_profiles').find_one({'user_id': student_id})
            if profile:
                student_skills = profile.get('extracted_skills', [])

        if not student_skills:
            student_skills = ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'Python']

        ai_service = AIService()
        analysis = ai_service.analyze_skill_gap(candidate_skills=student_skills, target_role=role_name)

        return Response({
            'success': True,
            'analysis': analysis,
            'available_roles': list(ROLE_BENCHMARKS.keys()),
        })


class RoadmapProgressView(APIView):
    """
    Manage student personalized learning roadmap progress in MongoDB.
    Allows marking phases/topics as completed and tracks progress %.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = str(request.user.id) if request.user and request.user.is_authenticated else request.query_params.get('student_id')
        query = {'user_id': user_id} if user_id else {}
        roadmap = get_collection('learning_roadmaps').find_one(query, sort=[('created_at', -1)])
        
        if not roadmap:
            # Generate default Full Stack roadmap
            default_phases = AIService()._generate_roadmap(
                target_role='Full Stack Developer',
                missing_core=['TypeScript', 'Docker'],
                missing_preferred=['CI/CD', 'Jest']
            )
            return Response({'success': True, 'roadmap': {'phases': default_phases}})

        roadmap['id'] = str(roadmap.pop('_id'))
        return Response({'success': True, 'roadmap': roadmap})

    def patch(self, request, roadmap_id=None):
        phase_id = request.data.get('phase_id')
        completed = request.data.get('completed', True)
        
        query = {}
        if roadmap_id:
            query = {'roadmap_id': str(roadmap_id)}
        elif request.user and request.user.is_authenticated:
            query = {'user_id': str(request.user.id)}

        roadmap = get_collection('learning_roadmaps').find_one(query, sort=[('created_at', -1)])
        if not roadmap:
            return Response({'success': False, 'message': 'Roadmap not found'}, status=status.HTTP_404_NOT_FOUND)

        phases = roadmap.get('phases', [])
        for p in phases:
            if p.get('id') == phase_id or str(p.get('phase')) == str(phase_id):
                p['completed'] = completed
                p['status'] = 'completed' if completed else 'in_progress'

        get_collection('learning_roadmaps').update_one(
            {'_id': roadmap['_id']},
            {'$set': {'phases': phases, 'updated_at': datetime.now(timezone.utc)}}
        )

        return Response({'success': True, 'phases': phases, 'message': 'Progress updated successfully.'})


class CurriculumMappingView(APIView):
    """
    Curriculum vs Industry Skill Gap Matrix for Universities and Faculty.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        dept_id = request.query_params.get('department_id')
        skill_repo = SkillRepository()
        popular_skills = skill_repo.get_popular_skills(limit=15)

        matrix = [
            {'subject': 'Modern Full-Stack Engineering', 'skills': ['React', 'Node.js', 'MongoDB', 'REST API'], 'industry_demand': '95%', 'syllabus_coverage': '88%'},
            {'subject': 'Data Engineering & SQL Systems', 'skills': ['PostgreSQL', 'SQL', 'Redis', 'Python'], 'industry_demand': '92%', 'syllabus_coverage': '85%'},
            {'subject': 'Cloud & DevOps Automation', 'skills': ['Docker', 'Kubernetes', 'CI/CD', 'Linux'], 'industry_demand': '89%', 'syllabus_coverage': '72%'},
            {'subject': 'Applied AI & Machine Learning', 'skills': ['Python', 'PyTorch', 'Scikit-learn', 'NLP'], 'industry_demand': '94%', 'syllabus_coverage': '75%'},
            {'subject': 'Information & Cyber Security', 'skills': ['Networking', 'Linux', 'Security Fundamentals'], 'industry_demand': '84%', 'syllabus_coverage': '78%'},
        ]

        return Response({
            'success': True,
            'department_id': dept_id,
            'curriculum_matrix': matrix,
            'top_industry_skills': popular_skills,
            'available_roles': list(ROLE_BENCHMARKS.keys()),
        })


class SkillTutorialsView(APIView):
    """
    Search and retrieve live YouTube tutorials and crash courses for any technical skill.
    Powered by RapidAPI youtube138 with caching and fallback.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        skill = request.query_params.get('skill', 'Docker')
        query = request.query_params.get('query', '')
        limit = int(request.query_params.get('limit', 4))

        from services.youtube_service import youtube_service
        videos = youtube_service.search_tutorials(skill=skill, query=query, limit=limit)

        return Response({
            'success': True,
            'skill': skill,
            'count': len(videos),
            'videos': videos
        })
