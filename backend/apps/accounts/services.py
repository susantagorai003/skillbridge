"""
Authentication service — handles registration, login, JWT tokens,
password reset and email verification.
"""
import jwt
import uuid
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from database.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)

VALID_ROLES_FOR_REGISTRATION = ['student', 'company', 'faculty', 'tpo']


class AuthService:
    """Service layer for authentication operations."""

    def __init__(self):
        self.user_repo = UserRepository()

    # ------------------------------------------------------------------ #
    #  Token helpers
    # ------------------------------------------------------------------ #

    def _generate_access_token(self, user_id, role):
        payload = {
            'user_id': str(user_id),
            'role': role,
            'type': 'access',
            'exp': datetime.now(timezone.utc) + timedelta(
                minutes=settings.JWT_ACCESS_TOKEN_LIFETIME
            ),
            'iat': datetime.now(timezone.utc),
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY,
                          algorithm=settings.JWT_ALGORITHM)

    def _generate_refresh_token(self, user_id, role):
        payload = {
            'user_id': str(user_id),
            'role': role,
            'type': 'refresh',
            'exp': datetime.now(timezone.utc) + timedelta(
                minutes=settings.JWT_REFRESH_TOKEN_LIFETIME
            ),
            'iat': datetime.now(timezone.utc),
            'jti': str(uuid.uuid4()),
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY,
                          algorithm=settings.JWT_ALGORITHM)

    def _generate_tokens(self, user_id, role):
        access = self._generate_access_token(user_id, role)
        refresh = self._generate_refresh_token(user_id, role)
        # Store hashed refresh token
        token_hash = hashlib.sha256(refresh.encode()).hexdigest()
        self.user_repo.store_refresh_token(user_id, token_hash)
        return {'access_token': access, 'refresh_token': refresh}

    # ------------------------------------------------------------------ #
    #  Registration
    # ------------------------------------------------------------------ #

    def register(self, data):
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        role = data.get('role', 'student')

        # Validation
        errors = {}
        if not name or len(name) < 2:
            errors['name'] = 'Name must be at least 2 characters'
        if not email:
            errors['email'] = 'Email is required'
        if not password or len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters'
        if password != confirm_password:
            errors['confirm_password'] = 'Passwords do not match'
        if role not in VALID_ROLES_FOR_REGISTRATION:
            errors['role'] = f'Invalid role. Must be one of: {", ".join(VALID_ROLES_FOR_REGISTRATION)}'

        if errors:
            return {'success': False, 'errors': errors}

        # Check duplicate email
        if self.user_repo.email_exists(email):
            return {'success': False, 'errors': {'email': 'Email already registered'}}

        # Create user
        hashed = make_password(password)
        user_data = {
            'name': name,
            'email': email,
            'password': hashed,
            'role': role,
        }
        user = self.user_repo.create_user(user_data)

        # Generate verification token
        verification_token = str(uuid.uuid4())
        self.user_repo.set_verification_token(user['id'], verification_token)

        # Generate JWT tokens
        tokens = self._generate_tokens(user['id'], role)

        # Safe user data (no password)
        safe_user = {
            'id': user['id'],
            'name': name,
            'email': email,
            'role': role,
            'is_verified': False,
            'profile_completed': False,
        }

        return {
            'success': True,
            'user': safe_user,
            'tokens': tokens,
            'verification_token': verification_token,
        }

    # ------------------------------------------------------------------ #
    #  Login
    # ------------------------------------------------------------------ #

    def login(self, email, password):
        email = email.strip().lower()

        user = self.user_repo.find_by_email(email)
        if not user:
            return {'success': False, 'errors': {'email': 'Invalid credentials'}}

        if not check_password(password, user.get('password', '')):
            return {'success': False, 'errors': {'email': 'Invalid credentials'}}

        if not user.get('is_active', True):
            return {'success': False, 'errors': {'email': 'Account is deactivated'}}

        # Update last login
        self.user_repo.update_last_login(user['id'])

        tokens = self._generate_tokens(user['id'], user['role'])

        safe_user = {
            'id': user['id'],
            'name': user.get('name'),
            'email': user.get('email'),
            'role': user.get('role'),
            'is_verified': user.get('is_verified', False),
            'profile_completed': user.get('profile_completed', False),
            'avatar': user.get('avatar'),
        }

        return {'success': True, 'user': safe_user, 'tokens': tokens}

    # ------------------------------------------------------------------ #
    #  Token refresh
    # ------------------------------------------------------------------ #

    def refresh_token(self, refresh_token):
        try:
            payload = jwt.decode(
                refresh_token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except jwt.ExpiredSignatureError:
            return {'success': False, 'errors': {'token': 'Refresh token expired'}}
        except jwt.InvalidTokenError:
            return {'success': False, 'errors': {'token': 'Invalid refresh token'}}

        if payload.get('type') != 'refresh':
            return {'success': False, 'errors': {'token': 'Invalid token type'}}

        user_id = payload.get('user_id')
        user = self.user_repo.find_by_id(user_id)
        if not user:
            return {'success': False, 'errors': {'token': 'User not found'}}

        # Verify the refresh token hash matches
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        if user.get('refresh_token_hash') != token_hash:
            return {'success': False, 'errors': {'token': 'Token has been revoked'}}

        # Issue new tokens (rotate)
        tokens = self._generate_tokens(user_id, user['role'])

        return {'success': True, 'tokens': tokens}

    # ------------------------------------------------------------------ #
    #  Logout
    # ------------------------------------------------------------------ #

    def logout(self, user_id):
        self.user_repo.clear_refresh_token(user_id)
        return {'success': True}

    # ------------------------------------------------------------------ #
    #  Email verification
    # ------------------------------------------------------------------ #

    def verify_email(self, token):
        user = self.user_repo.find_by_verification_token(token)
        if not user:
            return {'success': False, 'errors': {'token': 'Invalid verification token'}}

        self.user_repo.set_verified(user['id'])
        self.user_repo.update_one(user['id'], {'verification_token': None})
        return {'success': True, 'message': 'Email verified successfully'}

    # ------------------------------------------------------------------ #
    #  Password reset
    # ------------------------------------------------------------------ #

    def forgot_password(self, email):
        user = self.user_repo.find_by_email(email)
        if not user:
            # Don't reveal whether the email exists
            return {'success': True, 'message': 'If the email exists, a reset link has been sent'}

        reset_token = str(uuid.uuid4())
        self.user_repo.set_password_reset_token(user['id'], reset_token)

        # In production, send email; in dev, log to console
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        logger.info(f"Password reset URL (dev only): {reset_url}")

        return {'success': True, 'message': 'If the email exists, a reset link has been sent'}

    def reset_password(self, token, new_password):
        if len(new_password) < 8:
            return {'success': False, 'errors': {'password': 'Password must be at least 8 characters'}}

        user = self.user_repo.find_by_reset_token(token)
        if not user:
            return {'success': False, 'errors': {'token': 'Invalid or expired reset token'}}

        # Check token age (valid for 1 hour)
        token_created = user.get('password_reset_token_created')
        if token_created:
            if isinstance(token_created, str):
                token_created = datetime.fromisoformat(token_created)
            if datetime.now(timezone.utc) - token_created.replace(tzinfo=timezone.utc) > timedelta(hours=1):
                return {'success': False, 'errors': {'token': 'Reset token has expired'}}

        hashed = make_password(new_password)
        self.user_repo.update_password(user['id'], hashed)
        self.user_repo.clear_reset_token(user['id'])
        # Also revoke refresh tokens
        self.user_repo.clear_refresh_token(user['id'])

        return {'success': True, 'message': 'Password reset successfully'}

    # ------------------------------------------------------------------ #
    #  Current user
    # ------------------------------------------------------------------ #

    def get_current_user(self, user_id):
        user = self.user_repo.find_by_id(user_id)
        if not user:
            return None
        # Remove sensitive fields
        user.pop('password', None)
        user.pop('refresh_token_hash', None)
        user.pop('verification_token', None)
        user.pop('password_reset_token', None)
        user.pop('password_reset_token_created', None)
        user.pop('verification_token_created', None)
        return user

    def update_user(self, user_id, data):
        """Update user profile fields (not password)."""
        # Disallow updating sensitive fields
        forbidden = ['password', 'role', 'email', 'is_active', 'refresh_token_hash',
                     'verification_token', 'password_reset_token']
        clean = {k: v for k, v in data.items() if k not in forbidden}
        if not clean:
            return {'success': False, 'errors': {'data': 'No valid fields to update'}}
        updated = self.user_repo.update_one(user_id, clean)
        if updated:
            updated.pop('password', None)
            updated.pop('refresh_token_hash', None)
            return {'success': True, 'user': updated}
        return {'success': False, 'errors': {'user': 'User not found'}}
