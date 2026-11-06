"""
MongoDB indexes for all SkillBridge collections.
Run this after database setup to ensure indexes exist.
"""
import logging
from pymongo import ASCENDING, DESCENDING, TEXT
from database.connection import get_db

logger = logging.getLogger(__name__)


def create_all_indexes():
    """Create all MongoDB indexes for the application."""
    db = get_db()

    # Users collection
    db.users.create_index([('email', ASCENDING)], unique=True)
    db.users.create_index([('role', ASCENDING)])
    db.users.create_index([('is_active', ASCENDING)])
    db.users.create_index([('verification_token', ASCENDING)], sparse=True)
    db.users.create_index([('password_reset_token', ASCENDING)], sparse=True)
    db.users.create_index([('name', TEXT), ('email', TEXT)])

    # Student profiles
    db.student_profiles.create_index([('user_id', ASCENDING)], unique=True)
    db.student_profiles.create_index([('university_id', ASCENDING)])
    db.student_profiles.create_index([('department_id', ASCENDING)])
    db.student_profiles.create_index([('cgpa', DESCENDING)])
    db.student_profiles.create_index([('skills', ASCENDING)])

    # Faculty profiles
    db.faculty_profiles.create_index([('user_id', ASCENDING)], unique=True)
    db.faculty_profiles.create_index([('university_id', ASCENDING)])
    db.faculty_profiles.create_index([('department_id', ASCENDING)])

    # Companies
    db.companies.create_index([('user_id', ASCENDING)], unique=True)
    db.companies.create_index([('is_verified', ASCENDING)])
    db.companies.create_index([('industry', ASCENDING)])
    db.companies.create_index([('name', TEXT), ('description', TEXT)])

    # Universities
    db.universities.create_index([('name', ASCENDING)], unique=True)
    db.universities.create_index([('name', TEXT)])

    # Departments
    db.departments.create_index([('university_id', ASCENDING), ('name', ASCENDING)], unique=True)

    # Skills
    db.skills.create_index([('name', ASCENDING)], unique=True)
    db.skills.create_index([('category_id', ASCENDING)])
    db.skills.create_index([('name', TEXT), ('description', TEXT)])

    # Skill categories
    db.skill_categories.create_index([('name', ASCENDING)], unique=True)

    # Student skills
    db.student_skills.create_index([('student_id', ASCENDING), ('skill_id', ASCENDING)], unique=True)
    db.student_skills.create_index([('student_id', ASCENDING)])
    db.student_skills.create_index([('skill_id', ASCENDING)])
    db.student_skills.create_index([('proficiency_level', ASCENDING)])

    # Job roles
    db.job_roles.create_index([('title', ASCENDING)], unique=True)
    db.job_roles.create_index([('title', TEXT)])

    # Job role skills
    db.job_role_skills.create_index([('job_role_id', ASCENDING), ('skill_id', ASCENDING)], unique=True)

    # Curricula
    db.curricula.create_index([('university_id', ASCENDING), ('department_id', ASCENDING)])

    # Curriculum skills
    db.curriculum_skills.create_index([('curriculum_id', ASCENDING), ('skill_id', ASCENDING)], unique=True)

    # Assessments
    db.assessments.create_index([('skill_id', ASCENDING)])
    db.assessments.create_index([('created_by', ASCENDING)])
    db.assessments.create_index([('is_active', ASCENDING)])
    db.assessments.create_index([('title', TEXT)])

    # Assessment questions
    db.assessment_questions.create_index([('assessment_id', ASCENDING)])

    # Assessment results
    db.assessment_results.create_index([('student_id', ASCENDING), ('assessment_id', ASCENDING)])
    db.assessment_results.create_index([('student_id', ASCENDING)])

    # Opportunities
    db.opportunities.create_index([('company_id', ASCENDING)])
    db.opportunities.create_index([('type', ASCENDING)])
    db.opportunities.create_index([('status', ASCENDING)])
    db.opportunities.create_index([('deadline', ASCENDING)])
    db.opportunities.create_index([('required_skills', ASCENDING)])
    db.opportunities.create_index([('location', ASCENDING)])
    db.opportunities.create_index([('title', TEXT), ('description', TEXT)])

    # Applications
    db.applications.create_index([('student_id', ASCENDING), ('opportunity_id', ASCENDING)], unique=True)
    db.applications.create_index([('student_id', ASCENDING)])
    db.applications.create_index([('opportunity_id', ASCENDING)])
    db.applications.create_index([('status', ASCENDING)])

    # Interviews
    db.interviews.create_index([('application_id', ASCENDING)])
    db.interviews.create_index([('scheduled_at', ASCENDING)])

    # Match results
    db.match_results.create_index([('student_id', ASCENDING), ('opportunity_id', ASCENDING)], unique=True)
    db.match_results.create_index([('match_score', DESCENDING)])

    # Skill gaps
    db.skill_gaps.create_index([('student_id', ASCENDING), ('job_role_id', ASCENDING)])

    # Industry projects
    db.industry_projects.create_index([('company_id', ASCENDING)])
    db.industry_projects.create_index([('university_id', ASCENDING)])
    db.industry_projects.create_index([('status', ASCENDING)])
    db.industry_projects.create_index([('title', TEXT)])

    # Project teams
    db.project_teams.create_index([('project_id', ASCENDING)])
    db.project_teams.create_index([('student_id', ASCENDING)])

    # Project submissions
    db.project_submissions.create_index([('project_id', ASCENDING), ('team_id', ASCENDING)])

    # Mentorships
    db.mentorships.create_index([('mentor_id', ASCENDING)])
    db.mentorships.create_index([('mentee_id', ASCENDING)])

    # Notifications
    db.notifications.create_index([('user_id', ASCENDING), ('is_read', ASCENDING)])
    db.notifications.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])
    db.notifications.create_index([('type', ASCENDING)])

    # Placement records
    db.placement_records.create_index([('student_id', ASCENDING)])
    db.placement_records.create_index([('company_id', ASCENDING)])
    db.placement_records.create_index([('university_id', ASCENDING)])
    db.placement_records.create_index([('academic_year', ASCENDING)])

    # Audit logs
    db.audit_logs.create_index([('user_id', ASCENDING)])
    db.audit_logs.create_index([('action', ASCENDING)])
    db.audit_logs.create_index([('created_at', DESCENDING)])

    # Collaboration requests
    db.collaboration_requests.create_index([('company_id', ASCENDING)])
    db.collaboration_requests.create_index([('university_id', ASCENDING)])
    db.collaboration_requests.create_index([('status', ASCENDING)])

    logger.info("All MongoDB indexes created successfully")


if __name__ == '__main__':
    create_all_indexes()
