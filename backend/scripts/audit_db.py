import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from database.connection import get_collection, get_db

def audit():
    db = get_db()
    collections = db.list_collection_names()
    print("=== MONGODB COLLECTIONS ===")
    for c in sorted(collections):
        count = db[c].count_documents({})
        print(f" - {c}: {count} records")

    print("\n=== USERS BREAKDOWN ===")
    users_col = get_collection('users')
    for role in ['admin', 'tpo', 'faculty', 'company', 'student', 'trainer']:
        count = users_col.count_documents({'role': role})
        print(f" - Role '{role}': {count}")

    print("\n=== SAMPLE USERS ===")
    for u in users_col.find({}, {'name': 1, 'email': 1, 'role': 1, 'is_active': 1}).limit(15):
        print(f" - {u.get('email')} | {u.get('name')} | role={u.get('role')} | active={u.get('is_active')}")

if __name__ == '__main__':
    audit()
