from django.urls import path
from apps.collaborations.views import CollaborationListView, CollaborationStatusView

urlpatterns = [
    path('', CollaborationListView.as_view(), name='collaboration-list'),
    path('<str:pk>/status/', CollaborationStatusView.as_view(), name='collaboration-status'),
]
