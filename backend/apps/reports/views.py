from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from services.analytics_service import AnalyticsService
from services.curriculum_service import CurriculumBenchmarkService


class ReportSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = AnalyticsService()
        platform_stats = service.get_platform_stats()
        placements = service.get_placement_stats()
        skill_demand = service.get_skill_demand(10)

        report = {
            'generated_at': '2026-11-05',
            'portal': 'SkillBridge - Academia–Industry Collaboration Portal',
            'summary': platform_stats,
            'department_placements': placements,
            'high_demand_skills': skill_demand,
        }
        return Response({'success': True, 'report': report})


class AccreditationReportView(APIView):
    """
    Generates official NAAC Criterion 5.2.1 and NIRF Placement Metrics.
    Supports JSON response or direct CSV download attachment.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        download_format = request.query_params.get('format', '').lower()
        if download_format == 'csv':
            csv_content = CurriculumBenchmarkService.generate_csv_report()
            response = HttpResponse(csv_content, content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="SkillBridge_NAAC_NIRF_Accreditation_Report.csv"'
            return response

        report = CurriculumBenchmarkService.generate_accreditation_report()
        return Response({'success': True, 'report': report})


class CurriculumBenchmarkView(APIView):
    """
    Evaluates department course syllabi against active industry tech market demands.
    Returns alignment index, strongly aligned modules, and recommended curriculum bootcamps.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        department = request.query_params.get('department')
        benchmark = CurriculumBenchmarkService.get_curriculum_alignment(department=department)
        return Response(benchmark)
