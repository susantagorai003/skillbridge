"""Student profile repository."""
from database.repositories.base import BaseRepository


class StudentRepository(BaseRepository):
    def __init__(self):
        super().__init__('student_profiles')

    def find_by_user_id(self, user_id):
        return self.find_one({'user_id': str(user_id)})

    def find_by_university(self, university_id, page=1, page_size=20):
        return self.paginate({'university_id': str(university_id)}, page=page, page_size=page_size)

    def find_by_department(self, department_id, page=1, page_size=20):
        return self.paginate({'department_id': str(department_id)}, page=page, page_size=page_size)

    def find_eligible(self, min_cgpa=0, department_id=None, skills=None, page=1, page_size=20):
        filter_dict = {'cgpa': {'$gte': min_cgpa}}
        if department_id:
            filter_dict['department_id'] = str(department_id)
        if skills:
            filter_dict['skills'] = {'$all': skills}
        return self.paginate(filter_dict, page=page, page_size=page_size, sort=[('cgpa', -1)])

    def get_skill_distribution(self, university_id=None):
        pipeline = [
            {'$unwind': '$skills'},
            {'$group': {'_id': '$skills', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 20}
        ]
        if university_id:
            pipeline.insert(0, {'$match': {'university_id': str(university_id)}})
        return self.aggregate(pipeline)
