"""Project repository."""
from database.repositories.base import BaseRepository


class ProjectRepository(BaseRepository):
    def __init__(self):
        super().__init__('industry_projects')

    def find_by_company(self, company_id, page=1, page_size=20):
        return self.paginate({'company_id': str(company_id)}, page=page, page_size=page_size)

    def find_active(self, page=1, page_size=20):
        return self.paginate({'status': 'active'}, page=page, page_size=page_size)

    def find_by_university(self, university_id, page=1, page_size=20):
        return self.paginate({'university_id': str(university_id)}, page=page, page_size=page_size)


class ProjectTeamRepository(BaseRepository):
    def __init__(self):
        super().__init__('project_teams')

    def find_by_project(self, project_id):
        return self.find_many({'project_id': str(project_id)})

    def find_by_student(self, student_id):
        return self.find_many({'student_id': str(student_id)})


class ProjectSubmissionRepository(BaseRepository):
    def __init__(self):
        super().__init__('project_submissions')

    def find_by_project(self, project_id):
        return self.find_many({'project_id': str(project_id)}, sort=[('submitted_at', -1)])
