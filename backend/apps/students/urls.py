from django.urls import path
from apps.students.views import (
    StudentProfileView, StudentSkillListView, StudentSkillDetailView,
    ResumeUploadView, StudentDashboardView,
    StudentPlacementDrivesView, StudentInterviewsView, StudentOffersView, StudentTrainingsView
)

urlpatterns = [
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('skills/', StudentSkillListView.as_view(), name='student-skills'),
    path('skills/<str:skill_id>/', StudentSkillDetailView.as_view(), name='student-skill-detail'),
    path('resume/', ResumeUploadView.as_view(), name='student-resume-upload'),
    path('dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),

    # Additive cross-role integration endpoints
    path('drives/', StudentPlacementDrivesView.as_view(), name='student-drives'),
    path('interviews/', StudentInterviewsView.as_view(), name='student-interviews'),
    path('offers/', StudentOffersView.as_view(), name='student-offers'),
    path('offers/<str:offer_id>/respond/', StudentOffersView.as_view(), name='student-offer-respond'),
    path('trainings/', StudentTrainingsView.as_view(), name='student-trainings'),
]
