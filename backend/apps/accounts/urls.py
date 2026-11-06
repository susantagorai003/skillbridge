from django.urls import path
from apps.accounts.views import (
    RegisterView, LoginView, TokenRefreshView, LogoutView,
    CurrentUserView, ForgotPasswordView, ResetPasswordView, VerifyEmailView,
    UserListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth-verify-email'),
    path('users/', UserListView.as_view(), name='auth-users-list'),
    path('users/<str:user_id>/', UserListView.as_view(), name='auth-user-detail'),
]
