"""Collaboration repository."""
from database.repositories.base import BaseRepository


class CollaborationRepository(BaseRepository):
    def __init__(self):
        super().__init__('collaboration_requests')

    def find_by_company(self, company_id, page=1, page_size=20):
        return self.paginate({'company_id': str(company_id)}, page=page, page_size=page_size, sort=[('created_at', -1)])

    def find_by_university(self, university_id, page=1, page_size=20):
        return self.paginate({'university_id': str(university_id)}, page=page, page_size=page_size, sort=[('created_at', -1)])

    def find_pending(self, page=1, page_size=20):
        return self.paginate({'status': 'pending'}, page=page, page_size=page_size)

    def update_status(self, request_id, status, notes=''):
        return self.update_one(request_id, {'status': status, 'review_notes': notes})
