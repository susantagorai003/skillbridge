from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated
from database.repositories.project_repository import (
    ProjectRepository, ProjectTeamRepository, ProjectSubmissionRepository
)


class ProjectListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = ProjectRepository()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        result = repo.paginate({}, page=page, page_size=page_size)

        if not result.get('items'):
            sample_projects = [
                {
                    'id': 'demo_proj_1',
                    'title': 'Autonomous Drone Delivery Routing System',
                    'company_name': 'TechCorp Solutions',
                    'skills_required': ['Python', 'Machine Learning', 'Algorithms'],
                    'difficulty': 'Advanced',
                    'status': 'active',
                    'description': 'Develop optimized pathfinding algorithms for multi-drone delivery networks under weather constraints.',
                    'milestones': ['Research & Algorithm Design', 'Prototype Simulation', 'Field Testing Analysis'],
                },
                {
                    'id': 'demo_proj_2',
                    'title': 'Scalable E-Commerce Analytics Pipeline',
                    'company_name': 'TechCorp Solutions',
                    'skills_required': ['MongoDB', 'Node.js', 'Redis', 'Docker'],
                    'difficulty': 'Intermediate',
                    'status': 'active',
                    'description': 'Build an end-to-end event-driven architecture streaming user browsing patterns into real-time dashboards.',
                    'milestones': ['Event Schema Definition', 'Pipeline Implementation', 'Performance Benchmarking'],
                }
            ]
            return Response({'success': True, 'items': sample_projects, 'total': len(sample_projects)})

        return Response({'success': True, **result})

    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'success': False, 'errors': {'detail': 'Authentication required'}}, status=status.HTTP_401_UNAUTHORIZED)

        repo = ProjectRepository()
        data = {
            'title': request.data.get('title'),
            'company_id': str(request.user.id),
            'company_name': request.user.name,
            'description': request.data.get('description', ''),
            'skills_required': request.data.get('skills_required', []),
            'difficulty': request.data.get('difficulty', 'Intermediate'),
            'status': 'active',
        }
        created = repo.insert_one(data)
        return Response({'success': True, 'project': created}, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        repo = ProjectRepository()
        proj = repo.find_by_id(pk)
        if not proj:
            return Response({'success': False, 'errors': {'detail': 'Project not found'}}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'project': proj})


class ProjectSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        repo = ProjectSubmissionRepository()
        submission = {
            'project_id': project_id,
            'student_id': str(request.user.id),
            'student_name': request.user.name,
            'github_url': request.data.get('github_url', ''),
            'live_url': request.data.get('live_url', ''),
            'documentation': request.data.get('documentation', ''),
            'submitted_at': datetime.now(timezone.utc).isoformat(),
            'status': 'submitted',
        }
        created = repo.insert_one(submission)
        return Response({'success': True, 'submission': created}, status=status.HTTP_201_CREATED)
