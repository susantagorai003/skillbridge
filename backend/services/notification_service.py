"""
Notification Service for SkillBridge.
Handles database-backed in-app notifications for students, recruiters, faculty, and TPO.
"""
from datetime import datetime, timezone
import uuid
from database.connection import get_collection


class NotificationService:
    @staticmethod
    def send_notification(recipient_id, title, message, notification_type='info', link='', metadata=None):
        """Send a notification to a specific user."""
        try:
            col = get_collection('notifications')
            doc = {
                'id': f"notif-{uuid.uuid4().hex[:12]}",
                'recipient_id': str(recipient_id),
                'user_id': str(recipient_id),
                'title': title,
                'message': message,
                'type': notification_type,
                'link': link,
                'metadata': metadata or {},
                'is_read': False,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            col.insert_one(doc)
            doc.pop('_id', None)
            return doc
        except Exception:
            return None

    @staticmethod
    def broadcast_to_role(target_role, title, message, notification_type='announcement', link=''):
        """Broadcast notification to all active users with a specific role (e.g. all students)."""
        try:
            users_col = get_collection('users')
            recipients = list(users_col.find({'role': target_role, 'is_active': True}))
            created = []
            for u in recipients:
                uid = str(u.get('id') or u.get('_id'))
                if uid:
                    res = NotificationService.send_notification(uid, title, message, notification_type, link)
                    if res:
                        created.append(res)
            return created
        except Exception:
            return []

    @staticmethod
    def broadcast_to_department(department_name, title, message, notification_type='announcement', link=''):
        """Broadcast notification to all students in a specific department."""
        try:
            profiles_col = get_collection('student_profiles')
            students = list(profiles_col.find({'department': department_name}))
            created = []
            for s in students:
                uid = str(s.get('user_id') or s.get('id') or s.get('_id'))
                if uid:
                    res = NotificationService.send_notification(uid, title, message, notification_type, link)
                    if res:
                        created.append(res)
            return created
        except Exception:
            return []
