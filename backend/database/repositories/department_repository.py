"""Department repository."""
from database.repositories.base import BaseRepository


class DepartmentRepository(BaseRepository):
    def __init__(self):
        super().__init__('departments')

    def find_by_university(self, university_id):
        return self.find_many({'university_id': str(university_id)}, sort=[('name', 1)])

    def find_by_name_and_university(self, name, university_id):
        return self.find_one({'name': name, 'university_id': str(university_id)})
