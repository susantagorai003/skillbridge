"""Skill and skill category repositories."""
from database.repositories.base import BaseRepository


class SkillCategoryRepository(BaseRepository):
    def __init__(self):
        super().__init__('skill_categories')

    def find_by_name(self, name):
        return self.find_one({'name': {'$regex': f'^{name}$', '$options': 'i'}})

    def get_all_with_skills(self):
        pipeline = [
            {'$lookup': {
                'from': 'skills',
                'localField': '_id',
                'foreignField': 'category_id',
                'as': 'skills'
            }},
            {'$sort': {'name': 1}}
        ]
        return self.aggregate(pipeline)


class SkillRepository(BaseRepository):
    def __init__(self):
        super().__init__('skills')

    def find_by_name(self, name):
        return self.find_one({'name': {'$regex': f'^{name}$', '$options': 'i'}})

    def find_by_category(self, category_id):
        return self.find_many({'category_id': str(category_id)}, sort=[('name', 1)])

    def search_skills(self, query, category_id=None, page=1, page_size=50):
        filter_dict = {}
        if query:
            filter_dict['name'] = {'$regex': query, '$options': 'i'}
        if category_id:
            filter_dict['category_id'] = str(category_id)
        return self.paginate(filter_dict, page=page, page_size=page_size, sort=[('name', 1)])

    def get_popular_skills(self, limit=20):
        pipeline = [
            {'$lookup': {
                'from': 'student_skills',
                'localField': '_id',
                'foreignField': 'skill_id',
                'as': 'students'
            }},
            {'$addFields': {'student_count': {'$size': '$students'}}},
            {'$sort': {'student_count': -1}},
            {'$limit': limit},
            {'$project': {'students': 0}}
        ]
        return self.aggregate(pipeline)


class StudentSkillRepository(BaseRepository):
    def __init__(self):
        super().__init__('student_skills')

    def find_by_student(self, student_id):
        return self.find_many({'student_id': str(student_id)})

    def find_student_skill(self, student_id, skill_id):
        return self.find_one({'student_id': str(student_id), 'skill_id': str(skill_id)})

    def upsert_skill(self, student_id, skill_id, data):
        existing = self.find_student_skill(student_id, skill_id)
        if existing:
            return self.update_one(existing['id'], data)
        data['student_id'] = str(student_id)
        data['skill_id'] = str(skill_id)
        return self.insert_one(data)

    def remove_skill(self, student_id, skill_id):
        result = self.collection.delete_one({
            'student_id': str(student_id),
            'skill_id': str(skill_id)
        })
        return result.deleted_count > 0


class JobRoleRepository(BaseRepository):
    def __init__(self):
        super().__init__('job_roles')

    def find_by_title(self, title):
        return self.find_one({'title': {'$regex': f'^{title}$', '$options': 'i'}})

    def search(self, query='', page=1, page_size=20):
        filter_dict = {}
        if query:
            filter_dict['title'] = {'$regex': query, '$options': 'i'}
        return self.paginate(filter_dict, page=page, page_size=page_size)


class JobRoleSkillRepository(BaseRepository):
    def __init__(self):
        super().__init__('job_role_skills')

    def find_by_role(self, job_role_id):
        return self.find_many({'job_role_id': str(job_role_id)})

    def find_by_role_with_skills(self, job_role_id):
        pipeline = [
            {'$match': {'job_role_id': str(job_role_id)}},
            {'$lookup': {
                'from': 'skills',
                'let': {'sid': {'$toObjectId': '$skill_id'}},
                'pipeline': [{'$match': {'$expr': {'$eq': ['$_id', '$$sid']}}}],
                'as': 'skill_info'
            }},
            {'$unwind': {'path': '$skill_info', 'preserveNullAndEmptyArrays': True}}
        ]
        return self.aggregate(pipeline)
