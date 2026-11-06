"""Company repository."""
from database.repositories.base import BaseRepository


class CompanyRepository(BaseRepository):
    def __init__(self):
        super().__init__('companies')

    def find_by_user_id(self, user_id):
        return self.find_one({'user_id': str(user_id)})

    def find_verified(self, page=1, page_size=20):
        return self.paginate({'is_verified': True}, page=page, page_size=page_size)

    def find_pending_verification(self, page=1, page_size=20):
        return self.paginate({'is_verified': False}, page=page, page_size=page_size)

    def verify_company(self, company_id):
        return self.update_one(company_id, {'is_verified': True, 'verification_status': 'approved'})

    def reject_company(self, company_id, reason=''):
        return self.update_one(company_id, {'is_verified': False, 'verification_status': 'rejected', 'rejection_reason': reason})

    def search_companies(self, query, industry=None, page=1, page_size=20):
        filter_dict = {'is_verified': True}
        if query:
            filter_dict['$or'] = [
                {'name': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}}
            ]
        if industry:
            filter_dict['industry'] = industry
        return self.paginate(filter_dict, page=page, page_size=page_size)
