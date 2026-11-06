"""
User Repository for MongoDB.
Handles user document CRUD operations.
"""
from datetime import datetime, timezone
from database.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    """Repository for user collection operations."""

    def __init__(self):
        super().__init__('users')

    def find_by_email(self, email):
        """Find a user by email address."""
        return self.find_one({'email': email.lower().strip()})

    def find_by_role(self, role, skip=0, limit=20):
        """Find users by role."""
        return self.find_many({'role': role}, skip=skip, limit=limit)

    def email_exists(self, email):
        """Check if an email is already registered."""
        return self.exists({'email': email.lower().strip()})

    def create_user(self, user_data):
        """Create a new user document."""
        user_data['email'] = user_data['email'].lower().strip()
        user_data['is_active'] = True
        user_data['is_verified'] = False
        user_data['profile_completed'] = False
        user_data['last_login'] = None
        return self.insert_one(user_data)

    def update_last_login(self, user_id):
        """Update the last login timestamp."""
        return self.update_one(user_id, {
            'last_login': datetime.now(timezone.utc)
        })

    def set_verified(self, user_id):
        """Mark user email as verified."""
        return self.update_one(user_id, {'is_verified': True})

    def set_verification_token(self, user_id, token):
        """Store email verification token."""
        return self.update_one(user_id, {
            'verification_token': token,
            'verification_token_created': datetime.now(timezone.utc)
        })

    def find_by_verification_token(self, token):
        """Find user by verification token."""
        return self.find_one({'verification_token': token})

    def set_password_reset_token(self, user_id, token):
        """Store password reset token."""
        return self.update_one(user_id, {
            'password_reset_token': token,
            'password_reset_token_created': datetime.now(timezone.utc)
        })

    def find_by_reset_token(self, token):
        """Find user by password reset token."""
        return self.find_one({'password_reset_token': token})

    def clear_reset_token(self, user_id):
        """Clear password reset token after use."""
        return self.update_one(user_id, {
            'password_reset_token': None,
            'password_reset_token_created': None
        })

    def update_password(self, user_id, hashed_password):
        """Update user password hash."""
        return self.update_one(user_id, {'password': hashed_password})

    def deactivate_user(self, user_id):
        """Deactivate a user account."""
        return self.update_one(user_id, {'is_active': False})

    def activate_user(self, user_id):
        """Activate a user account."""
        return self.update_one(user_id, {'is_active': True})

    def get_users_stats(self):
        """Get user statistics by role."""
        pipeline = [
            {'$group': {
                '_id': '$role',
                'count': {'$sum': 1}
            }},
            {'$project': {
                'role': '$_id',
                'count': 1,
                '_id': 0
            }}
        ]
        results = list(self.collection.aggregate(pipeline))
        stats = {r['role']: r['count'] for r in results}
        stats['total'] = sum(stats.values())
        return stats

    def search_users(self, query, role=None, page=1, page_size=20):
        """Search users by name or email."""
        filter_dict = {
            '$or': [
                {'name': {'$regex': query, '$options': 'i'}},
                {'email': {'$regex': query, '$options': 'i'}}
            ]
        }
        if role:
            filter_dict['role'] = role
        return self.paginate(filter_dict, page=page, page_size=page_size,
                           sort=[('created_at', -1)])

    def store_refresh_token(self, user_id, token_hash):
        """Store hashed refresh token for the user."""
        return self.update_one(user_id, {'refresh_token_hash': token_hash})

    def clear_refresh_token(self, user_id):
        """Clear stored refresh token (logout)."""
        return self.update_one(user_id, {'refresh_token_hash': None})
