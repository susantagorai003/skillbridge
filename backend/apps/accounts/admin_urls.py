from django.urls import path
from apps.accounts.admin_views import (
    AdminUserManagementView,
    AdminApproveUserView,
    AdminDepartmentView,
    AdminAuditLogsView,
    AdminAnnouncementView,
    AdminTestMessagingView,
)

urlpatterns = [
    path('users/', AdminUserManagementView.as_view(), name='admin-users'),
    path('users/<str:user_id>/', AdminUserManagementView.as_view(), name='admin-user-detail'),
    path('users/<str:user_id>/approve/', AdminApproveUserView.as_view(), name='admin-user-approve'),
    path('departments/', AdminDepartmentView.as_view(), name='admin-departments'),
    path('logs/', AdminAuditLogsView.as_view(), name='admin-logs'),
    path('announcements/', AdminAnnouncementView.as_view(), name='admin-announcements'),
    path('test-messaging/', AdminTestMessagingView.as_view(), name='admin-test-messaging'),
]
