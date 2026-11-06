from django.urls import path
from apps.notifications.views import (
    NotificationListView, MarkReadView, MarkAllReadView, UnreadCountView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<str:pk>/read/', MarkReadView.as_view(), name='notification-mark-read'),
    path('read-all/', MarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('unread-count/', UnreadCountView.as_view(), name='notification-unread-count'),
]
