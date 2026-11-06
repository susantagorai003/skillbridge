from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from services.analytics_service import AnalyticsService


class PlatformAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        stats = service.get_platform_stats()
        return Response({'success': True, 'stats': stats})


class StudentAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        user_id = str(request.user.id) if request.user and request.user.is_authenticated else request.query_params.get('student_id')
        analytics = service.get_student_analytics(user_id)
        return Response({'success': True, 'analytics': analytics})


class FacultyAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        dept_id = request.query_params.get('department_id')
        analytics = service.get_faculty_analytics(dept_id)
        return Response({'success': True, 'analytics': analytics})


class RecruiterAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        company_id = request.query_params.get('company_id')
        analytics = service.get_recruiter_analytics(company_id)
        return Response({'success': True, 'analytics': analytics})


class AdminAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        analytics = service.get_admin_analytics()
        return Response({'success': True, 'analytics': analytics})


class PlacementAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        uni_id = request.query_params.get('university_id')
        stats = service.get_placement_stats(uni_id)
        return Response({'success': True, 'placements': stats})


class SkillDemandAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        demand = service.get_skill_demand()
        return Response({'success': True, 'skill_demand': demand})


class ApplicationTrendsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        days = int(request.query_params.get('days', 30))
        trends = service.get_application_trends(days)
        return Response({'success': True, 'trends': trends})
