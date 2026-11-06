"""Application repository."""
from database.repositories.base import BaseRepository


class ApplicationRepository(BaseRepository):
    def __init__(self):
        super().__init__('applications')

    def find_by_student(self, student_id, page=1, page_size=20):
        return self.paginate({'student_id': str(student_id)}, page=page, page_size=page_size, sort=[('created_at', -1)])

    def find_by_opportunity(self, opportunity_id, page=1, page_size=20, status_filter=None):
        filter_dict = {'opportunity_id': str(opportunity_id)}
        if status_filter:
            filter_dict['status'] = status_filter
        return self.paginate(filter_dict, page=page, page_size=page_size, sort=[('created_at', -1)])

    def has_applied(self, student_id, opportunity_id):
        return self.exists({
            'student_id': str(student_id),
            'opportunity_id': str(opportunity_id)
        })

    def update_status(self, application_id, new_status, notes=''):
        return self.update_one(application_id, {
            'status': new_status,
            'status_notes': notes
        })

    def get_stats_by_opportunity(self, opportunity_id):
        pipeline = [
            {'$match': {'opportunity_id': str(opportunity_id)}},
            {'$group': {'_id': '$status', 'count': {'$sum': 1}}}
        ]
        return self.aggregate(pipeline)
