from django.urls import path
from apps.skill_mapping.faculty_views import (
    FacultyOverviewView,
    FacultyStudentRosterView,
    FacultyMentoringView,
    FacultyRecommendTrainingView,
    FacultyCurriculumView,
    ExportDepartmentReportCSV
)

urlpatterns = [
    path('overview/', FacultyOverviewView.as_view(), name='faculty-overview'),
    path('students/', FacultyStudentRosterView.as_view(), name='faculty-students'),
    path('mentoring/', FacultyMentoringView.as_view(), name='faculty-mentoring'),
    path('recommend-training/', FacultyRecommendTrainingView.as_view(), name='faculty-recommend-training'),
    path('curriculum/', FacultyCurriculumView.as_view(), name='faculty-curriculum'),
    path('curriculum/add-skill/', FacultyCurriculumView.as_view(), name='faculty-curriculum-add-skill'),
    path('export-report/', ExportDepartmentReportCSV.as_view(), name='faculty-export-report'),
]
