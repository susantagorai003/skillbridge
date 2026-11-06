from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated
from database.repositories.collaboration_repository import CollaborationRepository


class CollaborationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = CollaborationRepository()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        result = repo.paginate({}, page=page, page_size=page_size, sort=[('created_at', -1)])
        if not result.get('items'):
            # Sample collaborations
            sample = [
                {
                    'id': 'demo_collab_1',
                    'title': 'AI in Healthcare Live Industry Project',
                    'company_name': 'TechCorp Solutions',
                    'university_name': 'Indian Institute of Technology Delhi',
                    'description': 'Mentoring 15 undergraduate students on real-world medical image diagnostics.',
                    'status': 'active',
                    'students_count': 15,
                    'duration': '4 months',
                },
                {
                    'id': 'demo_collab_2',
                    'title': 'Cloud Microservices Curriculum Revamp',
                    'company_name': 'TechCorp Solutions',
                    'university_name': 'National Institute of Technology Rourkela',
                    'description': 'Industry input to update the 7th-semester cloud computing lab curriculum.',
                    'status': 'approved',
                    'students_count': 60,
                    'duration': '1 semester',
                }
            ]
            return Response({'success': True, 'items': sample, 'total': len(sample)})

        return Response({'success': True, **result})

    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'success': False, 'errors': {'detail': 'Authentication required'}}, status=status.HTTP_401_UNAUTHORIZED)

        repo = CollaborationRepository()
        data = {
            'title': request.data.get('title'),
            'company_id': request.data.get('company_id', str(request.user.id)),
            'company_name': request.data.get('company_name', request.user.name),
            'university_id': request.data.get('university_id'),
            'university_name': request.data.get('university_name', 'Partner University'),
            'description': request.data.get('description', ''),
            'objectives': request.data.get('objectives', []),
            'status': 'pending',
        }
        created = repo.insert_one(data)
        return Response({'success': True, 'collaboration': created}, status=status.HTTP_201_CREATED)


class CollaborationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        repo = CollaborationRepository()
        collab = repo.find_by_id(pk)
        if not collab:
            return Response({'success': False, 'errors': {'detail': 'Collaboration not found'}}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status', 'approved')
        notes = request.data.get('notes', '')
        updated = repo.update_status(pk, new_status, notes)
        return Response({'success': True, 'collaboration': updated})
