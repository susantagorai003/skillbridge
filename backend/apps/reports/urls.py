from django.urls import path
from apps.reports.views import ReportSummaryView, AccreditationReportView, CurriculumBenchmarkView

urlpatterns = [
    path('', ReportSummaryView.as_view(), name='report-summary'),
    path('accreditation/', AccreditationReportView.as_view(), name='report-accreditation'),
    path('curriculum-benchmark/', CurriculumBenchmarkView.as_view(), name='report-curriculum-benchmark'),
]
