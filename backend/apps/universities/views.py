from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from database.repositories.university_repository import UniversityRepository
from database.repositories.department_repository import DepartmentRepository


class UniversityListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = UniversityRepository()
        query = request.query_params.get('query', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        result = repo.search(query=query, page=page, page_size=page_size)
        return Response({'success': True, **result})


class UniversityDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        uni_repo = UniversityRepository()
        dept_repo = DepartmentRepository()
        uni = uni_repo.find_by_id(pk)
        if not uni:
            return Response({'success': False, 'errors': {'detail': 'University not found'}}, status=status.HTTP_404_NOT_FOUND)

        departments = dept_repo.find_by_university(pk)
        return Response({'success': True, 'university': uni, 'departments': departments})
