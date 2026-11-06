from django.urls import path
from apps.assessments.views import (
    AssessmentListView, AssessmentQuestionsView, AssessmentSubmitView, AssessmentResultsView
)

urlpatterns = [
    path('', AssessmentListView.as_view(), name='assessment-list'),
    path('<str:assessment_id>/questions/', AssessmentQuestionsView.as_view(), name='assessment-questions'),
    path('<str:assessment_id>/submit/', AssessmentSubmitView.as_view(), name='assessment-submit'),
    path('results/', AssessmentResultsView.as_view(), name='assessment-results'),
]
