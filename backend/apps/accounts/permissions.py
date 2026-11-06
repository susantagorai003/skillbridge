"""
Permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission


class IsAuthenticated(BasePermission):
    """Check if the user is authenticated via MongoDB JWT."""

    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'is_authenticated')
            and request.user.is_authenticated
        )


class IsStudent(BasePermission):
    """Allow access only to students."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role == 'student'
        )


class IsCompany(BasePermission):
    """Allow access only to company/recruiter users."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role == 'company'
        )


class IsFaculty(BasePermission):
    """Allow access only to faculty users."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role == 'faculty'
        )


class IsTPO(BasePermission):
    """Allow access only to TPO users."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role == 'tpo'
        )


class IsSuperAdmin(BasePermission):
    """Allow access only to super admin users."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role == 'admin'
        )


class IsCompanyOrAdmin(BasePermission):
    """Allow access to company users or admins."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role in ('company', 'admin')
        )


class IsFacultyOrTPO(BasePermission):
    """Allow access to faculty or TPO users."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role in ('faculty', 'tpo')
        )


class IsFacultyOrTPOOrAdmin(BasePermission):
    """Allow access to faculty, TPO, or admin users."""
    def has_permission(self, request, view):
        return (
            request.user is not None
            and hasattr(request.user, 'role')
            and request.user.role in ('faculty', 'tpo', 'admin')
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow access only to the resource owner or admins."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # obj should have a user_id or id field
        obj_user_id = obj.get('user_id') or obj.get('id')
        return str(obj_user_id) == str(request.user.id)
