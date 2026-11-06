from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated
from services.matching_service import MatchingService


class MatchCalculationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        student_id = request.query_params.get('student_id')
        opportunity_id = request.query_params.get('opportunity_id')

        if not student_id and request.user and request.user.is_authenticated:
            student_id = str(request.user.id)

        if not student_id or not opportunity_id:
            return Response({'success': False, 'errors': {'detail': 'student_id and opportunity_id required'}}, status=status.HTTP_400_BAD_REQUEST)

        service = MatchingService()
        result = service.calculate_match(student_id, opportunity_id)
        if not result:
            return Response({'success': False, 'errors': {'detail': 'Opportunity not found'}}, status=status.HTTP_404_NOT_FOUND)

        return Response({'success': True, 'match': result})


class RecommendedOpportunitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = MatchingService()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))

        result = service.find_matches_for_student(request.user.id, page=page, page_size=page_size)
        return Response({'success': True, **result})
