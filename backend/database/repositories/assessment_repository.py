"""Assessment repository."""
from database.repositories.base import BaseRepository


class AssessmentRepository(BaseRepository):
    def __init__(self):
        super().__init__('assessments')

    def find_active(self, skill_id=None, page=1, page_size=20):
        filter_dict = {'is_active': True}
        if skill_id:
            filter_dict['skill_id'] = str(skill_id)
        return self.paginate(filter_dict, page=page, page_size=page_size)

    def find_by_creator(self, user_id):
        return self.find_many({'created_by': str(user_id)})


class AssessmentQuestionRepository(BaseRepository):
    def __init__(self):
        super().__init__('assessment_questions')

    def find_by_assessment(self, assessment_id):
        return self.find_many({'assessment_id': str(assessment_id)}, sort=[('order', 1)])


class AssessmentResultRepository(BaseRepository):
    def __init__(self):
        super().__init__('assessment_results')

    def find_by_student(self, student_id):
        return self.find_many({'student_id': str(student_id)}, sort=[('completed_at', -1)])

    def find_result(self, student_id, assessment_id):
        return self.find_one({'student_id': str(student_id), 'assessment_id': str(assessment_id)})
