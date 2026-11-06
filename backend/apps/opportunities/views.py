from datetime import datetime, timedelta, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated, IsCompany
from database.repositories.opportunity_repository import OpportunityRepository
from database.repositories.company_repository import CompanyRepository
from database.repositories.student_repository import StudentRepository
from database.connection import get_collection
from apps.opportunities.serializers import OpportunitySerializer
from services.internshala_service import InternshalaService, REALISTIC_TECH_INTERNSHIPS
from services.ai_job_service import AIJobService


def _get_student_skills_for_request(request) -> list:
    """Helper to detect student skills from query params, profile, or latest resume."""
    skills = []
    # 1. Explicit query param
    param_skills = request.query_params.get('skills')
    if param_skills:
        return [s.strip() for s in param_skills.split(',') if s.strip()]

    # 2. Check authenticated student
    user_id = None
    if request.user and request.user.is_authenticated:
        user_id = str(request.user.id)
    elif request.query_params.get('student_id'):
        user_id = str(request.query_params.get('student_id'))

    if user_id:
        try:
            student_col = get_collection('student_profiles')
            profile = student_col.find_one({'user_id': user_id})
            if profile and profile.get('extracted_skills'):
                return profile.get('extracted_skills')

            # Check latest resume
            resumes_col = get_collection('resumes')
            resume = resumes_col.find_one({'user_id': user_id}, sort=[('created_at', -1)])
            if resume and resume.get('extracted_skills'):
                return resume.get('extracted_skills')
        except Exception:
            pass

    return skills


class OpportunityListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = OpportunityRepository()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        filters = {}
        if request.query_params.get('type'):
            filters['type'] = request.query_params.get('type')
        if request.query_params.get('location'):
            filters['location'] = request.query_params.get('location')
        if request.query_params.get('min_salary'):
            try:
                filters['min_salary'] = int(request.query_params.get('min_salary'))
            except ValueError:
                pass
        if request.query_params.get('skills'):
            filters['skills'] = [s.strip() for s in request.query_params.get('skills').split(',')]

        result = repo.find_active(page=page, page_size=page_size, filters=filters)

        # If repo is empty, seed with verified tech opportunities so users have live content
        if not result.get('items') or len(result.get('items', [])) == 0:
            student_skills = _get_student_skills_for_request(request)
            internshala = InternshalaService()
            ishala_res = internshala.search_internships(
                queries=request.query_params.get('search') or request.query_params.get('q') or "*",
                student_skills=student_skills
            )
            return Response({
                'success': True,
                'items': ishala_res.get('internships', []),
                'total': ishala_res.get('count', 0),
                'page': 1,
                'page_size': page_size,
                'is_live_feed': True,
                'source': 'internshala'
            })

        return Response({'success': True, **result})

    def post(self, request):
        # Company only
        if not request.user or not request.user.is_authenticated or request.user.role not in ('company', 'admin'):
            return Response({'success': False, 'errors': {'detail': 'Only companies can post opportunities'}}, status=status.HTTP_403_FORBIDDEN)

        serializer = OpportunitySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        company_repo = CompanyRepository()
        company = company_repo.find_by_user_id(request.user.id)
        if not company:
            return Response({'success': False, 'errors': {'detail': 'Company profile not found'}}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        data['company_id'] = str(company['id'])
        data['company_name'] = company.get('name', 'Company')

        repo = OpportunityRepository()
        new_opp = repo.insert_one(data)
        return Response({'success': True, 'opportunity': new_opp}, status=status.HTTP_201_CREATED)


class InternshalaOpportunitiesView(APIView):
    """
    Live Internship & Job Search powered by RapidAPI Internshala Search API
    with real-time candidate skill gap scoring.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        queries = request.query_params.get('queries') or request.query_params.get('q') or request.query_params.get('search') or "*"
        
        # Parse boolean filters
        wfh = None
        if request.query_params.get('work_from_home') is not None:
            wfh = request.query_params.get('work_from_home').lower() in ('true', '1', 'yes')
        
        part_time = None
        if request.query_params.get('part_time') is not None:
            part_time = request.query_params.get('part_time').lower() in ('true', '1', 'yes')

        location = request.query_params.get('location')
        cursor = request.query_params.get('cursor')

        duration = None
        if request.query_params.get('duration'):
            try:
                duration = int(request.query_params.get('duration'))
            except ValueError:
                pass

        stipend = None
        if request.query_params.get('stipend'):
            try:
                stipend = int(request.query_params.get('stipend'))
            except ValueError:
                pass

        # Retrieve student skills for live compatibility calculation
        student_skills = _get_student_skills_for_request(request)

        service = InternshalaService()
        result = service.search_internships(
            queries=queries,
            work_from_home=wfh,
            location=location,
            duration=duration,
            stipend=stipend,
            part_time=part_time,
            cursor=cursor,
            student_skills=student_skills
        )

        return Response({
            'success': True,
            **result,
            'student_skills': student_skills
        })


class FeaturedOpportunitiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = OpportunityRepository()
        limit = int(request.query_params.get('limit', 6))
        items = repo.get_featured(limit=limit)

        if not items or len(items) == 0:
            # Provide high quality featured internships
            student_skills = _get_student_skills_for_request(request)
            service = InternshalaService()
            featured_data = service.search_internships(queries="*", student_skills=student_skills)
            return Response({
                'success': True,
                'opportunities': featured_data.get('internships', [])[:limit]
            })

        return Response({'success': True, 'opportunities': items})


class MyOpportunitiesView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company_repo = CompanyRepository()
        company = company_repo.find_by_user_id(request.user.id)
        if not company:
            return Response({'success': True, 'items': [], 'total': 0})

        repo = OpportunityRepository()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        result = repo.find_by_company(company['id'], page=page, page_size=page_size)
        return Response({'success': True, **result})


class OpportunityDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        repo = OpportunityRepository()
        opp = repo.find_by_id(pk)
        
        # Check if it is an Internshala opportunity
        if not opp and pk.startswith('ishala-'):
            student_skills = _get_student_skills_for_request(request)
            service = InternshalaService()
            res = service.search_internships(queries="*", student_skills=student_skills)
            for item in res.get('internships', []):
                if item.get('internship_id') == pk or str(item.get('id')) == pk:
                    return Response({'success': True, 'opportunity': item})
            
            # Check static fallback
            for item in REALISTIC_TECH_INTERNSHIPS:
                if item['internship_id'] == pk:
                    return Response({'success': True, 'opportunity': item})

        if not opp:
            return Response({'success': False, 'errors': {'detail': 'Opportunity not found'}}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'opportunity': opp})

    def put(self, request, pk):
        if not request.user or not request.user.is_authenticated or request.user.role not in ('company', 'admin'):
            return Response({'success': False, 'errors': {'detail': 'Unauthorized'}}, status=status.HTTP_403_FORBIDDEN)

        repo = OpportunityRepository()
        opp = repo.find_by_id(pk)
        if not opp:
            return Response({'success': False, 'errors': {'detail': 'Opportunity not found'}}, status=status.HTTP_404_NOT_FOUND)

        company_repo = CompanyRepository()
        company = company_repo.find_by_user_id(request.user.id)
        if request.user.role != 'admin' and (not company or str(opp.get('company_id')) != str(company['id'])):
            return Response({'success': False, 'errors': {'detail': 'Not allowed'}}, status=status.HTTP_403_FORBIDDEN)

        updated = repo.update_one(pk, request.data)
        return Response({'success': True, 'opportunity': updated})

    def delete(self, request, pk):
        if not request.user or not request.user.is_authenticated or request.user.role not in ('company', 'admin'):
            return Response({'success': False, 'errors': {'detail': 'Unauthorized'}}, status=status.HTTP_403_FORBIDDEN)

        repo = OpportunityRepository()
        opp = repo.find_by_id(pk)
        if not opp:
            return Response({'success': False, 'errors': {'detail': 'Opportunity not found'}}, status=status.HTTP_404_NOT_FOUND)

        company_repo = CompanyRepository()
        company = company_repo.find_by_user_id(request.user.id)
        if request.user.role != 'admin' and (not company or str(opp.get('company_id')) != str(company['id'])):
            return Response({'success': False, 'errors': {'detail': 'Not allowed'}}, status=status.HTTP_403_FORBIDDEN)

        repo.delete_one(pk)
        return Response({'success': True, 'message': 'Opportunity deleted'})


class AIGenerateJobPostingView(APIView):
    """
    AI-powered Job Description and Required Skills generator for recruiters.
    Takes a job title and drafts market-aligned requirements in seconds.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        title = request.data.get('title', '')
        company_name = request.data.get('company_name', 'Hiring Company')
        result = AIJobService.generate_job_posting(title=title, company_name=company_name)
        return Response(result)
