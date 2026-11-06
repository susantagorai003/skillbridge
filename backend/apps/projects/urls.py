from django.urls import path
from apps.projects.views import ProjectListView, ProjectDetailView, ProjectSubmissionView

urlpatterns = [
    path('', ProjectListView.as_view(), name='project-list'),
    path('<str:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<str:project_id>/submit/', ProjectSubmissionView.as_view(), name='project-submit'),
]
