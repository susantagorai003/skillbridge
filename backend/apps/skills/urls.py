from django.urls import path
from apps.skills.views import (
    SkillCategoryListView, SkillListView, JobRoleListView, JobRoleDetailView
)

urlpatterns = [
    path('', SkillListView.as_view(), name='skill-list'),
    path('categories/', SkillCategoryListView.as_view(), name='skill-category-list'),
    path('job-roles/', JobRoleListView.as_view(), name='job-role-list'),
    path('job-roles/<str:role_id>/skills/', JobRoleDetailView.as_view(), name='job-role-skills'),
]
