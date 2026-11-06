from django.urls import path
from apps.analytics.views import (
    PlatformAnalyticsView,
    StudentAnalyticsView,
    FacultyAnalyticsView,
    RecruiterAnalyticsView,
    AdminAnalyticsView,
    PlacementAnalyticsView,
    SkillDemandAnalyticsView,
    ApplicationTrendsView
)
from apps.reports.views import CurriculumBenchmarkView

urlpatterns = [
    path('', PlatformAnalyticsView.as_view(), name='platform-analytics'),
    path('platform/', PlatformAnalyticsView.as_view(), name='platform-analytics-alt'),
    path('student/', StudentAnalyticsView.as_view(), name='student-analytics'),
    path('faculty/', FacultyAnalyticsView.as_view(), name='faculty-analytics'),
    path('recruiter/', RecruiterAnalyticsView.as_view(), name='recruiter-analytics'),
    path('admin/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('placements/', PlacementAnalyticsView.as_view(), name='placement-analytics'),
    path('skills/', SkillDemandAnalyticsView.as_view(), name='skill-demand-analytics'),
    path('trends/', ApplicationTrendsView.as_view(), name='application-trends'),
    path('curriculum-benchmark/', CurriculumBenchmarkView.as_view(), name='curriculum-benchmark'),
]
