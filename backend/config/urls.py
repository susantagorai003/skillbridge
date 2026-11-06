from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from apps.skill_mapping.views import ResumeUploadView, RoadmapProgressView, SkillTutorialsView

schema_view = get_schema_view(
    openapi.Info(
        title="SkillBridge API",
        default_version='v1',
        description="Academia–Industry Collaboration Portal API",
        contact=openapi.Contact(email="admin@skillbridge.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Core API v1 Routes
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/students/', include('apps.students.urls')),
    path('api/v1/companies/', include('apps.companies.urls')),
    path('api/v1/universities/', include('apps.universities.urls')),
    path('api/v1/departments/', include('apps.departments.urls')),
    path('api/v1/skills/', include('apps.skills.urls')),
    path('api/v1/skill-mapping/', include('apps.skill_mapping.urls')),
    path('api/v1/skill-gap/', include('apps.skill_mapping.urls')),
    path('api/v1/resumes/', ResumeUploadView.as_view(), name='resumes-endpoint'),
    path('api/v1/resumes/upload/', ResumeUploadView.as_view(), name='resumes-upload-endpoint'),
    path('api/v1/tutorials/', SkillTutorialsView.as_view(), name='tutorials-endpoint'),
    path('api/v1/roadmaps/', RoadmapProgressView.as_view(), name='roadmaps-endpoint'),
    path('api/v1/roadmaps/<str:roadmap_id>/progress/', RoadmapProgressView.as_view(), name='roadmaps-progress-endpoint'),
    path('api/v1/assessments/', include('apps.assessments.urls')),
    path('api/v1/opportunities/', include('apps.opportunities.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/matching/', include('apps.matching.urls')),
    path('api/v1/collaborations/', include('apps.collaborations.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/tpo/', include('apps.universities.tpo_urls')),
    path('api/v1/faculty/', include('apps.skill_mapping.faculty_urls')),
    path('api/v1/admin/', include('apps.accounts.admin_urls')),

    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
