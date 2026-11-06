from django.urls import path
from apps.universities.tpo_views import (
    TPOOverviewView,
    PlacementDriveView,
    TPODriveStatusView,
    TPOEligibilityEngineView,
    TPOStudentDirectoryView,
    TPOVerifyStudentView,
    TPOCompanyDirectoryView,
    TPOVerifyCompanyView,
    EligibleStudentsFilterView,
    ExportEligibleStudentsCSV,
    TPOTrainingsView,
    TPOSkillGapOverview,
    TPOAnnouncementView,
)

urlpatterns = [
    path('overview/', TPOOverviewView.as_view(), name='tpo-overview'),
    path('drives/', PlacementDriveView.as_view(), name='tpo-drives'),
    path('drives/<str:drive_id>/status/', TPODriveStatusView.as_view(), name='tpo-drive-status'),
    path('drives/<str:drive_id>/eligibility/', TPOEligibilityEngineView.as_view(), name='tpo-drive-eligibility'),
    path('students/', TPOStudentDirectoryView.as_view(), name='tpo-students'),
    path('students/<str:student_id>/verify/', TPOVerifyStudentView.as_view(), name='tpo-verify-student'),
    path('companies/', TPOCompanyDirectoryView.as_view(), name='tpo-companies'),
    path('companies/<str:company_id>/verify/', TPOVerifyCompanyView.as_view(), name='tpo-verify-company'),
    path('eligible-students/', EligibleStudentsFilterView.as_view(), name='tpo-eligible-students'),
    path('export-eligible/', ExportEligibleStudentsCSV.as_view(), name='tpo-export-eligible'),
    path('trainings/', TPOTrainingsView.as_view(), name='tpo-trainings'),
    path('skill-gaps/', TPOSkillGapOverview.as_view(), name='tpo-skill-gaps'),
    path('announcements/', TPOAnnouncementView.as_view(), name='tpo-announcements'),
]
