"""
Audit Log Service for SkillBridge.
Persists all platform events, role status changes, recruitment stage transitions,
and administrative actions into MongoDB 'audit_logs' collection.
"""
from datetime import datetime, timezone
import uuid
from database.connection import get_collection


class AuditService:
    @staticmethod
    def log_event(action, actor_id=None, actor_role='system', actor_name='System', resource_type=None, resource_id=None, details=''):
        """Record an immutable audit log entry."""
        try:
            col = get_collection('audit_logs')
            doc = {
                'id': f"log-{uuid.uuid4().hex[:12]}",
                'action': action,
                'actor_id': str(actor_id) if actor_id else 'system',
                'actor_role': actor_role,
                'actor_name': actor_name,
                'resource_type': resource_type or 'general',
                'resource_id': str(resource_id) if resource_id else '',
                'details': details,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            col.insert_one(doc)
            doc.pop('_id', None)
            return doc
        except Exception as e:
            # Audit logging failure must never crash core operations
            return None

    @staticmethod
    def get_recent_logs(limit=25, actor_role=None):
        """Retrieve recent audit logs."""
        try:
            col = get_collection('audit_logs')
            query = {}
            if actor_role:
                query['actor_role'] = actor_role
            logs = list(col.find(query, {'_id': 0}).sort('timestamp', -1).limit(limit))
            return logs
        except Exception:
            return []
