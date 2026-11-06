from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from database.repositories.skill_repository import (
    SkillRepository, SkillCategoryRepository, JobRoleRepository, JobRoleSkillRepository
)
from apps.skills.serializers import (
    SkillSerializer, SkillCategorySerializer, JobRoleSerializer, JobRoleSkillSerializer
)


class SkillCategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = SkillCategoryRepository()
        categories = repo.find_many(sort=[('name', 1)])
        return Response({'success': True, 'categories': categories})


class SkillListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = SkillRepository()
        query = request.query_params.get('query', '')
        category_id = request.query_params.get('category_id')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))

        result = repo.search_skills(query=query, category_id=category_id, page=page, page_size=page_size)
        return Response({'success': True, **result})


class JobRoleListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = JobRoleRepository()
        query = request.query_params.get('query', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        result = repo.search(query=query, page=page, page_size=page_size)
        return Response({'success': True, **result})


class JobRoleDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, role_id):
        role_repo = JobRoleRepository()
        skill_repo = JobRoleSkillRepository()

        role = role_repo.find_by_id(role_id)
        if not role:
            return Response({'success': False, 'errors': {'detail': 'Job role not found'}}, status=status.HTTP_404_NOT_FOUND)

        skills = skill_repo.find_by_role_with_skills(role_id)
        return Response({'success': True, 'job_role': role, 'required_skills': skills})
