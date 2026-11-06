from django.urls import path
from apps.applications.views import ApplicationListView, ApplicationStatusUpdateView

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application-list'),
    path('<str:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application-status-update'),
]
