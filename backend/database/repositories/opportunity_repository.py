"""Opportunity repository."""
from datetime import datetime, timezone
from database.repositories.base import BaseRepository


class OpportunityRepository(BaseRepository):
    def __init__(self):
        super().__init__('opportunities')

    def find_active(self, page=1, page_size=20, filters=None):
        filter_dict = {
            'status': 'active',
            'deadline': {'$gte': datetime.now(timezone.utc)}
        }
        if filters:
            if filters.get('type'):
                filter_dict['type'] = filters['type']
            if filters.get('company_id'):
                filter_dict['company_id'] = str(filters['company_id'])
            if filters.get('location'):
                filter_dict['location'] = {'$regex': filters['location'], '$options': 'i'}
            if filters.get('skills'):
                filter_dict['required_skills'] = {'$in': filters['skills']}
            if filters.get('min_salary'):
                filter_dict['salary_max'] = {'$gte': filters['min_salary']}
        return self.paginate(filter_dict, page=page, page_size=page_size, sort=[('created_at', -1)])

    def find_by_company(self, company_id, page=1, page_size=20):
        return self.paginate({'company_id': str(company_id)}, page=page, page_size=page_size, sort=[('created_at', -1)])

    def get_featured(self, limit=6):
        return self.find_many(
            {'status': 'active', 'is_featured': True, 'deadline': {'$gte': datetime.now(timezone.utc)}},
            limit=limit,
            sort=[('created_at', -1)]
        )

    def get_stats(self):
        pipeline = [
            {'$group': {
                '_id': '$type',
                'count': {'$sum': 1},
                'active': {'$sum': {'$cond': [{'$eq': ['$status', 'active']}, 1, 0]}}
            }}
        ]
        return self.aggregate(pipeline)
