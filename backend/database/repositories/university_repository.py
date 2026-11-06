"""University repository."""
from database.repositories.base import BaseRepository


class UniversityRepository(BaseRepository):
    def __init__(self):
        super().__init__('universities')

    def find_by_name(self, name):
        return self.find_one({'name': {'$regex': f'^{name}$', '$options': 'i'}})

    def search(self, query, page=1, page_size=20):
        filter_dict = {'name': {'$regex': query, '$options': 'i'}} if query else {}
        return self.paginate(filter_dict, page=page, page_size=page_size)
