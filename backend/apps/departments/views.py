from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from database.repositories.department_repository import DepartmentRepository


class DepartmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = DepartmentRepository()
        university_id = request.query_params.get('university_id')
        if university_id:
            departments = repo.find_by_university(university_id)
        else:
            departments = repo.find_many(sort=[('name', 1)])
        return Response({'success': True, 'departments': departments})
