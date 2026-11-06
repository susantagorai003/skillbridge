"""
DRF Serializers for authentication endpoints.
"""
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=['student', 'company', 'faculty', 'tpo'],
        default='student'
    )

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TokenRefreshSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)


class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    profile_completed = serializers.BooleanField(read_only=True)
    last_login = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True, allow_null=True, required=False)
    avatar = serializers.CharField(read_only=True, allow_null=True, required=False)


class UserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100, required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)
