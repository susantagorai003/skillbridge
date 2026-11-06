from django.urls import path
from apps.skill_mapping.views import (
    SkillGapAnalyzeView,
    ResumeUploadView,
    RoadmapProgressView,
    CurriculumMappingView,
    SkillTutorialsView
)

urlpatterns = [
    # Skill Gap Analysis
    path('', SkillGapAnalyzeView.as_view(), name='skill-gap-analysis'),
    path('analyze/', SkillGapAnalyzeView.as_view(), name='skill-gap-analyze-post'),
    path('tutorials/', SkillTutorialsView.as_view(), name='skill-tutorials'),
    path('videos/', SkillTutorialsView.as_view(), name='skill-videos'),
    
    # Resume Upload & Parsing
    path('resume/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('resumes/', ResumeUploadView.as_view(), name='resume-list'),
    
    # Dynamic Personalized Roadmap Progress
    path('roadmap/', RoadmapProgressView.as_view(), name='roadmap-detail'),
    path('roadmap/<str:roadmap_id>/progress/', RoadmapProgressView.as_view(), name='roadmap-progress'),
    path('roadmaps/progress/', RoadmapProgressView.as_view(), name='roadmap-progress-user'),

    # Curriculum & Industry Alignment Matrix
    path('curriculum/', CurriculumMappingView.as_view(), name='curriculum-mapping'),
]
