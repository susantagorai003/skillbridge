"""
Authentication API views.
"""
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated
from apps.accounts.services import AuthService
from apps.accounts.serializers import (
    RegisterSerializer, LoginSerializer, TokenRefreshSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    UserSerializer, UserUpdateSerializer,
)

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """POST /api/v1/auth/register/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = AuthService()
        result = service.register(serializer.validated_data)

        if not result['success']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'message': 'Registration successful',
            'user': result['user'],
            'tokens': result['tokens'],
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/v1/auth/login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = AuthService()
        result = service.login(
            serializer.validated_data['email'],
            serializer.validated_data['password']
        )

        if not result['success']:
            return Response(result, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'success': True,
            'message': 'Login successful',
            'user': result['user'],
            'tokens': result['tokens'],
        })


class TokenRefreshView(APIView):
    """POST /api/v1/auth/refresh/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = AuthService()
        result = service.refresh_token(serializer.validated_data['refresh_token'])

        if not result['success']:
            return Response(result, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'success': True,
            'tokens': result['tokens'],
        })


class LogoutView(APIView):
    """POST /api/v1/auth/logout/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        service = AuthService()
        service.logout(request.user.id)
        return Response({
            'success': True,
            'message': 'Logged out successfully',
        })


class CurrentUserView(APIView):
    """GET/PUT /api/v1/auth/me/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = AuthService()
        user = service.get_current_user(request.user.id)
        if not user:
            return Response(
                {'success': False, 'errors': {'user': 'User not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({'success': True, 'user': user})

    def put(self, request):
        serializer = UserUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = AuthService()
        result = service.update_user(request.user.id, serializer.validated_data)

        if not result['success']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True, 'user': result['user']})


class ForgotPasswordView(APIView):
    """POST /api/v1/auth/forgot-password/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = AuthService()
        result = service.forgot_password(serializer.validated_data['email'])
        return Response(result)


class ResetPasswordView(APIView):
    """POST /api/v1/auth/reset-password/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = AuthService()
        result = service.reset_password(
            serializer.validated_data['token'],
            serializer.validated_data['new_password']
        )

        if not result['success']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response(result)


class VerifyEmailView(APIView):
    """GET /api/v1/auth/verify-email/?token=..."""
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response(
                {'success': False, 'errors': {'token': 'Verification token required'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = AuthService()
        result = service.verify_email(token)

        if not result['success']:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response(result)



from bson import ObjectId
from database.connection import get_collection

class UserListView(APIView):
    """GET /api/v1/auth/users/ and PATCH /api/v1/auth/users/<id>/"""
    permission_classes = [AllowAny]

    def get(self, request):
        role = request.query_params.get('role')
        search = request.query_params.get('search', '').strip()
        query = {}
        if role:
            query['role'] = role
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
            ]
        
        users_col = get_collection('users')
        docs = list(users_col.find(query).sort('created_at', -1).limit(50))
        result = []
        for d in docs:
            result.append({
                'id': str(d.get('_id')),
                'name': d.get('name', ''),
                'email': d.get('email', ''),
                'role': d.get('role', 'student'),
                'is_active': d.get('is_active', True),
                'is_verified': d.get('is_verified', True),
                'created_at': d.get('created_at', ''),
            })
        return Response({'success': True, 'users': result})

    def patch(self, request, user_id=None):
        uid = user_id or request.data.get('user_id')
        if not uid:
            return Response({'success': False, 'message': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        update_fields = {}
        if 'is_active' in request.data:
            update_fields['is_active'] = request.data['is_active']
        if 'is_verified' in request.data:
            update_fields['is_verified'] = request.data['is_verified']
        if 'role' in request.data:
            update_fields['role'] = request.data['role']

        try:
            oid = ObjectId(uid)
            get_collection('users').update_one({'_id': oid}, {'$set': update_fields})
            return Response({'success': True, 'message': 'User updated successfully'})
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
