"""
Custom JWT Authentication for MongoDB users.
Integrates with Django REST Framework's authentication system.
"""
import jwt
import logging
from datetime import datetime, timezone
from django.conf import settings
from rest_framework import authentication, exceptions
from database.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)


class MongoUser:
    """
    Wrapper for MongoDB user document.
    Compatible with DRF's authentication system.
    """

    def __init__(self, user_dict):
        self._data = user_dict
        self.pk = user_dict.get('id')

    @property
    def id(self):
        return self._data.get('id')

    @property
    def email(self):
        return self._data.get('email')

    @property
    def name(self):
        return self._data.get('name')

    @property
    def role(self):
        return self._data.get('role')

    @property
    def is_active(self):
        return self._data.get('is_active', True)

    @property
    def is_verified(self):
        return self._data.get('is_verified', False)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def profile_completed(self):
        return self._data.get('profile_completed', False)

    def get(self, key, default=None):
        return self._data.get(key, default)

    def to_dict(self):
        """Return safe user data (no password or tokens)."""
        safe_fields = [
            'id', 'name', 'email', 'role', 'is_active', 'is_verified',
            'profile_completed', 'last_login', 'created_at', 'phone',
            'avatar'
        ]
        return {k: self._data.get(k) for k in safe_fields if k in self._data}

    def __str__(self):
        return f"{self.name} ({self.email})"


class MongoDBJWTAuthentication(authentication.BaseAuthentication):
    """
    Custom JWT authentication class for MongoDB users.
    Reads the JWT from the Authorization header and validates it.
    """
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if not auth_header:
            return None

        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Access token has expired')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')

        # Verify token type
        if payload.get('type') != 'access':
            raise exceptions.AuthenticationFailed('Invalid token type')

        # Look up user in MongoDB
        user_id = payload.get('user_id')
        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        user_repo = UserRepository()
        user_data = user_repo.find_by_id(user_id)

        if not user_data:
            raise exceptions.AuthenticationFailed('User not found')

        if not user_data.get('is_active', False):
            raise exceptions.AuthenticationFailed('User account is deactivated')

        user = MongoUser(user_data)
        return (user, token)

    def authenticate_header(self, request):
        return self.keyword
