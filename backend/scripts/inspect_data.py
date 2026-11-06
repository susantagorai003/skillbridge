import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from database.connection import get_collection

def show_data():
    print("--- STUDENT PROFILES ---")
    for sp in get_collection('student_profiles').find({}, {'_id': 0}):
        print(sp)

    print("\n--- RESUMES ---")
    for r in get_collection('resumes').find({}, {'_id': 0, 'raw_text': 0}).limit(3):
        print(r)

    print("\n--- PLACEMENT DRIVES ---")
    for d in get_collection('placement_drives').find({}, {'_id': 0}):
        print(d.get('id'), d.get('company_name'), d.get('role_title'), d.get('ctc_lpa'), d.get('min_cgpa'))

if __name__ == '__main__':
    show_data()
