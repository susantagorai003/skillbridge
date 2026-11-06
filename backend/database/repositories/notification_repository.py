"""Notification repository."""
from database.repositories.base import BaseRepository


class NotificationRepository(BaseRepository):
    def __init__(self):
        super().__init__('notifications')

    def find_by_user(self, user_id, unread_only=False, page=1, page_size=20):
        filter_dict = {'user_id': str(user_id)}
        if unread_only:
            filter_dict['is_read'] = False
        return self.paginate(filter_dict, page=page, page_size=page_size, sort=[('created_at', -1)])

    def mark_read(self, notification_id):
        return self.update_one(notification_id, {'is_read': True})

    def mark_all_read(self, user_id):
        return self.update_many(
            {'user_id': str(user_id), 'is_read': False},
            {'is_read': True}
        )

    def unread_count(self, user_id):
        return self.count({'user_id': str(user_id), 'is_read': False})

    def create_notification(self, user_id, type, title, message, data=None):
        return self.insert_one({
            'user_id': str(user_id),
            'type': type,
            'title': title,
            'message': message,
            'data': data or {},
            'is_read': False,
        })
