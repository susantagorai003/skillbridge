"""
MongoDB Schema Validators for SkillBridge collections.
Apply these validators to enforce document structure at the database level.
"""
from database.connection import get_db


def apply_validators():
    """Apply MongoDB schema validators to all collections."""
    db = get_db()

    # Users collection validator
    db.command('collMod', 'users', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['name', 'email', 'password', 'role'],
            'properties': {
                'name': {
                    'bsonType': 'string',
                    'minLength': 2,
                    'maxLength': 100,
                    'description': 'Full name is required'
                },
                'email': {
                    'bsonType': 'string',
                    'pattern': '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    'description': 'Valid email is required'
                },
                'password': {
                    'bsonType': 'string',
                    'description': 'Hashed password is required'
                },
                'role': {
                    'bsonType': 'string',
                    'enum': ['student', 'company', 'faculty', 'tpo', 'admin'],
                    'description': 'Valid role is required'
                },
                'is_active': {'bsonType': 'bool'},
                'is_verified': {'bsonType': 'bool'},
                'profile_completed': {'bsonType': 'bool'},
            }
        }
    }, validationLevel='moderate')

    # Opportunities collection validator
    db.command('collMod', 'opportunities', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['title', 'company_id', 'type', 'status'],
            'properties': {
                'title': {
                    'bsonType': 'string',
                    'minLength': 3,
                },
                'type': {
                    'bsonType': 'string',
                    'enum': ['internship', 'full_time', 'part_time', 'contract'],
                },
                'status': {
                    'bsonType': 'string',
                    'enum': ['draft', 'active', 'closed', 'expired'],
                },
            }
        }
    }, validationLevel='moderate')

    # Applications collection validator
    db.command('collMod', 'applications', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['student_id', 'opportunity_id', 'status'],
            'properties': {
                'status': {
                    'bsonType': 'string',
                    'enum': ['applied', 'under_review', 'shortlisted',
                             'interview_scheduled', 'selected', 'rejected'],
                },
            }
        }
    }, validationLevel='moderate')


def ensure_collections_exist():
    """Create collections with validators if they don't exist."""
    db = get_db()
    collection_names = db.list_collection_names()

    collections_to_create = [
        'users', 'student_profiles', 'faculty_profiles',
        'companies', 'universities', 'departments',
        'skills', 'skill_categories', 'student_skills',
        'job_roles', 'job_role_skills', 'curricula', 'curriculum_skills',
        'assessments', 'assessment_questions', 'assessment_results',
        'opportunities', 'applications', 'interviews',
        'match_results', 'skill_gaps',
        'industry_projects', 'project_teams', 'project_submissions',
        'mentorships', 'notifications', 'placement_records',
        'audit_logs', 'collaboration_requests',
    ]

    for col_name in collections_to_create:
        if col_name not in collection_names:
            db.create_collection(col_name)

    # Apply validators after collections exist
    try:
        apply_validators()
    except Exception as e:
        print(f"Warning: Could not apply all validators: {e}")
