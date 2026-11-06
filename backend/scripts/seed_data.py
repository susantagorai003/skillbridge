"""
Seed data script for SkillBridge development.
Creates demo data for development and testing.
All data is clearly identified as demonstration content.
"""
import os
import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from datetime import datetime, timezone, timedelta
from django.contrib.auth.hashers import make_password
from database.connection import get_db
from database.indexes import create_all_indexes


def seed_data():
    db = get_db()
    print("🌱 Seeding SkillBridge database...")

    # ---------------------------------------------------------------
    # Skill Categories
    # ---------------------------------------------------------------
    categories = [
        {'name': 'Programming Languages', 'description': 'Core programming languages', 'icon': 'code'},
        {'name': 'Frontend Development', 'description': 'Client-side web development', 'icon': 'layout'},
        {'name': 'Backend Development', 'description': 'Server-side development', 'icon': 'server'},
        {'name': 'Databases', 'description': 'Database management systems', 'icon': 'database'},
        {'name': 'Cloud Computing', 'description': 'Cloud platforms and services', 'icon': 'cloud'},
        {'name': 'DevOps', 'description': 'Development operations and CI/CD', 'icon': 'settings'},
        {'name': 'Artificial Intelligence', 'description': 'AI and machine learning', 'icon': 'brain'},
        {'name': 'Data Science', 'description': 'Data analysis and visualization', 'icon': 'bar-chart'},
        {'name': 'Cybersecurity', 'description': 'Information security', 'icon': 'shield'},
        {'name': 'Soft Skills', 'description': 'Professional and interpersonal skills', 'icon': 'users'},
        {'name': 'Mobile Development', 'description': 'Mobile app development', 'icon': 'smartphone'},
        {'name': 'Design', 'description': 'UI/UX and graphic design', 'icon': 'palette'},
    ]

    db.skill_categories.delete_many({})
    now = datetime.now(timezone.utc)
    for cat in categories:
        cat['created_at'] = now
        cat['updated_at'] = now
    result = db.skill_categories.insert_many(categories)
    cat_ids = {cat['name']: str(id) for cat, id in zip(categories, result.inserted_ids)}
    print(f"  ✅ Created {len(categories)} skill categories")

    # ---------------------------------------------------------------
    # Skills
    # ---------------------------------------------------------------
    skills = [
        # Programming Languages
        {'name': 'Python', 'category_id': cat_ids['Programming Languages'], 'description': 'General-purpose programming language'},
        {'name': 'JavaScript', 'category_id': cat_ids['Programming Languages'], 'description': 'Web programming language'},
        {'name': 'Java', 'category_id': cat_ids['Programming Languages'], 'description': 'Object-oriented programming language'},
        {'name': 'C++', 'category_id': cat_ids['Programming Languages'], 'description': 'Systems programming language'},
        {'name': 'TypeScript', 'category_id': cat_ids['Programming Languages'], 'description': 'Typed superset of JavaScript'},
        {'name': 'Go', 'category_id': cat_ids['Programming Languages'], 'description': 'Systems programming language by Google'},
        {'name': 'Rust', 'category_id': cat_ids['Programming Languages'], 'description': 'Memory-safe systems language'},
        {'name': 'C#', 'category_id': cat_ids['Programming Languages'], 'description': 'Microsoft .NET language'},
        {'name': 'PHP', 'category_id': cat_ids['Programming Languages'], 'description': 'Web scripting language'},
        {'name': 'SQL', 'category_id': cat_ids['Programming Languages'], 'description': 'Database query language'},
        # Frontend
        {'name': 'React', 'category_id': cat_ids['Frontend Development'], 'description': 'JavaScript UI library'},
        {'name': 'Angular', 'category_id': cat_ids['Frontend Development'], 'description': 'TypeScript web framework'},
        {'name': 'Vue.js', 'category_id': cat_ids['Frontend Development'], 'description': 'Progressive JavaScript framework'},
        {'name': 'HTML5', 'category_id': cat_ids['Frontend Development'], 'description': 'Web markup language'},
        {'name': 'CSS3', 'category_id': cat_ids['Frontend Development'], 'description': 'Web styling language'},
        {'name': 'Tailwind CSS', 'category_id': cat_ids['Frontend Development'], 'description': 'Utility-first CSS framework'},
        {'name': 'Next.js', 'category_id': cat_ids['Frontend Development'], 'description': 'React full-stack framework'},
        # Backend
        {'name': 'Django', 'category_id': cat_ids['Backend Development'], 'description': 'Python web framework'},
        {'name': 'Node.js', 'category_id': cat_ids['Backend Development'], 'description': 'JavaScript runtime'},
        {'name': 'Express.js', 'category_id': cat_ids['Backend Development'], 'description': 'Node.js web framework'},
        {'name': 'Spring Boot', 'category_id': cat_ids['Backend Development'], 'description': 'Java web framework'},
        {'name': 'Flask', 'category_id': cat_ids['Backend Development'], 'description': 'Python micro-framework'},
        {'name': 'FastAPI', 'category_id': cat_ids['Backend Development'], 'description': 'Modern Python API framework'},
        {'name': 'REST API', 'category_id': cat_ids['Backend Development'], 'description': 'RESTful API design'},
        {'name': 'GraphQL', 'category_id': cat_ids['Backend Development'], 'description': 'Query language for APIs'},
        # Databases
        {'name': 'MongoDB', 'category_id': cat_ids['Databases'], 'description': 'NoSQL document database'},
        {'name': 'PostgreSQL', 'category_id': cat_ids['Databases'], 'description': 'Relational database'},
        {'name': 'MySQL', 'category_id': cat_ids['Databases'], 'description': 'Relational database'},
        {'name': 'Redis', 'category_id': cat_ids['Databases'], 'description': 'In-memory data store'},
        {'name': 'Elasticsearch', 'category_id': cat_ids['Databases'], 'description': 'Search engine'},
        # Cloud
        {'name': 'AWS', 'category_id': cat_ids['Cloud Computing'], 'description': 'Amazon Web Services'},
        {'name': 'Azure', 'category_id': cat_ids['Cloud Computing'], 'description': 'Microsoft Azure'},
        {'name': 'Google Cloud', 'category_id': cat_ids['Cloud Computing'], 'description': 'Google Cloud Platform'},
        # DevOps
        {'name': 'Docker', 'category_id': cat_ids['DevOps'], 'description': 'Container platform'},
        {'name': 'Kubernetes', 'category_id': cat_ids['DevOps'], 'description': 'Container orchestration'},
        {'name': 'Git', 'category_id': cat_ids['DevOps'], 'description': 'Version control system'},
        {'name': 'CI/CD', 'category_id': cat_ids['DevOps'], 'description': 'Continuous integration/deployment'},
        {'name': 'Linux', 'category_id': cat_ids['DevOps'], 'description': 'Operating system'},
        # AI/ML
        {'name': 'Machine Learning', 'category_id': cat_ids['Artificial Intelligence'], 'description': 'ML algorithms and models'},
        {'name': 'Deep Learning', 'category_id': cat_ids['Artificial Intelligence'], 'description': 'Neural networks'},
        {'name': 'TensorFlow', 'category_id': cat_ids['Artificial Intelligence'], 'description': 'ML framework'},
        {'name': 'PyTorch', 'category_id': cat_ids['Artificial Intelligence'], 'description': 'ML framework'},
        {'name': 'NLP', 'category_id': cat_ids['Artificial Intelligence'], 'description': 'Natural language processing'},
        # Data Science
        {'name': 'Pandas', 'category_id': cat_ids['Data Science'], 'description': 'Data analysis library'},
        {'name': 'NumPy', 'category_id': cat_ids['Data Science'], 'description': 'Numerical computing'},
        {'name': 'Data Visualization', 'category_id': cat_ids['Data Science'], 'description': 'Charts and dashboards'},
        {'name': 'Power BI', 'category_id': cat_ids['Data Science'], 'description': 'Business intelligence'},
        # Soft Skills
        {'name': 'Communication', 'category_id': cat_ids['Soft Skills'], 'description': 'Verbal and written communication'},
        {'name': 'Leadership', 'category_id': cat_ids['Soft Skills'], 'description': 'Team leadership'},
        {'name': 'Problem Solving', 'category_id': cat_ids['Soft Skills'], 'description': 'Analytical thinking'},
        {'name': 'Teamwork', 'category_id': cat_ids['Soft Skills'], 'description': 'Collaboration skills'},
        {'name': 'Time Management', 'category_id': cat_ids['Soft Skills'], 'description': 'Productivity and planning'},
    ]

    db.skills.delete_many({})
    for skill in skills:
        skill['created_at'] = now
        skill['updated_at'] = now
    result = db.skills.insert_many(skills)
    skill_ids = {skill['name']: str(id) for skill, id in zip(skills, result.inserted_ids)}
    print(f"  ✅ Created {len(skills)} skills")

    # ---------------------------------------------------------------
    # Job Roles
    # ---------------------------------------------------------------
    job_roles = [
        {'title': 'Full Stack Developer', 'description': 'Develops both frontend and backend applications'},
        {'title': 'Frontend Developer', 'description': 'Specializes in client-side web development'},
        {'title': 'Backend Developer', 'description': 'Specializes in server-side development'},
        {'title': 'Data Scientist', 'description': 'Analyzes data and builds ML models'},
        {'title': 'Machine Learning Engineer', 'description': 'Develops and deploys ML systems'},
        {'title': 'DevOps Engineer', 'description': 'Manages CI/CD and infrastructure'},
        {'title': 'Cloud Engineer', 'description': 'Designs cloud infrastructure'},
        {'title': 'Mobile Developer', 'description': 'Develops mobile applications'},
        {'title': 'Software Engineer', 'description': 'General software development'},
        {'title': 'QA Engineer', 'description': 'Software testing and quality assurance'},
    ]

    db.job_roles.delete_many({})
    for jr in job_roles:
        jr['created_at'] = now
        jr['updated_at'] = now
    result = db.job_roles.insert_many(job_roles)
    role_ids = {jr['title']: str(id) for jr, id in zip(job_roles, result.inserted_ids)}
    print(f"  ✅ Created {len(job_roles)} job roles")

    # Job Role Skills mapping
    role_skills = [
        # Full Stack Developer
        {'job_role_id': role_ids['Full Stack Developer'], 'skill_id': skill_ids['JavaScript'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Full Stack Developer'], 'skill_id': skill_ids['React'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Full Stack Developer'], 'skill_id': skill_ids['Node.js'], 'required_proficiency': 2, 'importance': 'required'},
        {'job_role_id': role_ids['Full Stack Developer'], 'skill_id': skill_ids['MongoDB'], 'required_proficiency': 2, 'importance': 'required'},
        {'job_role_id': role_ids['Full Stack Developer'], 'skill_id': skill_ids['Git'], 'required_proficiency': 2, 'importance': 'required'},
        {'job_role_id': role_ids['Full Stack Developer'], 'skill_id': skill_ids['Docker'], 'required_proficiency': 1, 'importance': 'preferred'},
        {'job_role_id': role_ids['Full Stack Developer'], 'skill_id': skill_ids['TypeScript'], 'required_proficiency': 2, 'importance': 'preferred'},
        # Frontend Developer
        {'job_role_id': role_ids['Frontend Developer'], 'skill_id': skill_ids['JavaScript'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Frontend Developer'], 'skill_id': skill_ids['React'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Frontend Developer'], 'skill_id': skill_ids['HTML5'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Frontend Developer'], 'skill_id': skill_ids['CSS3'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Frontend Developer'], 'skill_id': skill_ids['Tailwind CSS'], 'required_proficiency': 2, 'importance': 'preferred'},
        {'job_role_id': role_ids['Frontend Developer'], 'skill_id': skill_ids['TypeScript'], 'required_proficiency': 2, 'importance': 'preferred'},
        # Data Scientist
        {'job_role_id': role_ids['Data Scientist'], 'skill_id': skill_ids['Python'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Data Scientist'], 'skill_id': skill_ids['Pandas'], 'required_proficiency': 3, 'importance': 'required'},
        {'job_role_id': role_ids['Data Scientist'], 'skill_id': skill_ids['Machine Learning'], 'required_proficiency': 2, 'importance': 'required'},
        {'job_role_id': role_ids['Data Scientist'], 'skill_id': skill_ids['SQL'], 'required_proficiency': 2, 'importance': 'required'},
        {'job_role_id': role_ids['Data Scientist'], 'skill_id': skill_ids['Data Visualization'], 'required_proficiency': 2, 'importance': 'required'},
        {'job_role_id': role_ids['Data Scientist'], 'skill_id': skill_ids['Deep Learning'], 'required_proficiency': 2, 'importance': 'preferred'},
    ]

    db.job_role_skills.delete_many({})
    for rs in role_skills:
        rs['created_at'] = now
        rs['updated_at'] = now
    db.job_role_skills.insert_many(role_skills)
    print(f"  ✅ Created {len(role_skills)} job role-skill mappings")

    # ---------------------------------------------------------------
    # Universities & Departments
    # ---------------------------------------------------------------
    universities = [
        {'name': 'Indian Institute of Technology Delhi', 'location': 'New Delhi', 'website': 'https://iitd.ac.in', 'is_verified': True},
        {'name': 'National Institute of Technology Rourkela', 'location': 'Rourkela, Odisha', 'website': 'https://nitrkl.ac.in', 'is_verified': True},
        {'name': 'Birla Institute of Technology Mesra', 'location': 'Ranchi, Jharkhand', 'website': 'https://bitmesra.ac.in', 'is_verified': True},
    ]

    db.universities.delete_many({})
    for uni in universities:
        uni['created_at'] = now
        uni['updated_at'] = now
    result = db.universities.insert_many(universities)
    uni_ids = {uni['name']: str(id) for uni, id in zip(universities, result.inserted_ids)}
    print(f"  ✅ Created {len(universities)} universities")

    departments = []
    dept_names = ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering']
    for uni_name, uid in uni_ids.items():
        for dept in dept_names:
            departments.append({
                'name': dept,
                'university_id': uid,
                'created_at': now,
                'updated_at': now,
            })

    db.departments.delete_many({})
    result = db.departments.insert_many(departments)
    print(f"  ✅ Created {len(departments)} departments")

    # ---------------------------------------------------------------
    # Demo Users
    # ---------------------------------------------------------------
    db.users.delete_many({})
    
    # Admin
    admin_password = make_password('admin12345')
    admin = {
        'name': 'Admin User',
        'email': 'admin@skillbridge.com',
        'password': admin_password,
        'role': 'admin',
        'is_active': True,
        'is_verified': True,
        'profile_completed': True,
        'created_at': now,
        'updated_at': now,
    }
    admin_result = db.users.insert_one(admin)
    print(f"  ✅ Created admin user (admin@skillbridge.com / admin12345)")

    # Demo student
    student_password = make_password('student12345')
    student = {
        'name': 'Rahul Sharma',
        'email': 'rahul@student.com',
        'password': student_password,
        'role': 'student',
        'is_active': True,
        'is_verified': True,
        'profile_completed': True,
        'created_at': now,
        'updated_at': now,
    }
    student_result = db.users.insert_one(student)
    student_id = str(student_result.inserted_id)

    # Student profile
    first_uni_id = list(uni_ids.values())[0]
    cse_dept = db.departments.find_one({'name': 'Computer Science & Engineering', 'university_id': first_uni_id})
    cse_dept_id = str(cse_dept['_id']) if cse_dept else None

    db.student_profiles.delete_many({})
    student_profile = {
        'user_id': student_id,
        'university_id': first_uni_id,
        'department_id': cse_dept_id,
        'degree': 'B.Tech',
        'semester': 6,
        'cgpa': 8.5,
        'phone': '+91-9876543210',
        'career_interests': ['Full Stack Developer', 'Backend Developer'],
        'skills': ['Python', 'JavaScript', 'React', 'Django', 'MongoDB'],
        'github': 'https://github.com/rahulsharma',
        'linkedin': 'https://linkedin.com/in/rahulsharma',
        'created_at': now,
        'updated_at': now,
    }
    db.student_profiles.insert_one(student_profile)

    # Student skills
    db.student_skills.delete_many({})
    student_skill_entries = [
        {'student_id': student_id, 'skill_id': skill_ids['Python'], 'proficiency_level': 3, 'is_verified': False, 'source': 'self_reported'},
        {'student_id': student_id, 'skill_id': skill_ids['JavaScript'], 'proficiency_level': 2, 'is_verified': False, 'source': 'self_reported'},
        {'student_id': student_id, 'skill_id': skill_ids['React'], 'proficiency_level': 3, 'is_verified': False, 'source': 'self_reported'},
        {'student_id': student_id, 'skill_id': skill_ids['Django'], 'proficiency_level': 2, 'is_verified': False, 'source': 'self_reported'},
        {'student_id': student_id, 'skill_id': skill_ids['MongoDB'], 'proficiency_level': 1, 'is_verified': False, 'source': 'self_reported'},
        {'student_id': student_id, 'skill_id': skill_ids['Git'], 'proficiency_level': 3, 'is_verified': False, 'source': 'self_reported'},
        {'student_id': student_id, 'skill_id': skill_ids['HTML5'], 'proficiency_level': 3, 'is_verified': False, 'source': 'self_reported'},
        {'student_id': student_id, 'skill_id': skill_ids['CSS3'], 'proficiency_level': 2, 'is_verified': False, 'source': 'self_reported'},
    ]
    for entry in student_skill_entries:
        entry['created_at'] = now
        entry['updated_at'] = now
    db.student_skills.insert_many(student_skill_entries)
    print(f"  ✅ Created demo student (rahul@student.com / student12345)")

    # Demo company
    company_password = make_password('company12345')
    company_user = {
        'name': 'TechCorp Recruiter',
        'email': 'recruiter@techcorp.com',
        'password': company_password,
        'role': 'company',
        'is_active': True,
        'is_verified': True,
        'profile_completed': True,
        'created_at': now,
        'updated_at': now,
    }
    company_result = db.users.insert_one(company_user)
    company_user_id = str(company_result.inserted_id)

    db.companies.delete_many({})
    company = {
        'user_id': company_user_id,
        'name': 'TechCorp Solutions',
        'industry': 'Information Technology',
        'website': 'https://techcorp.example.com',
        'description': 'A leading technology solutions company specializing in web and mobile applications. [DEMO DATA]',
        'location': 'Bangalore, Karnataka',
        'logo': None,
        'is_verified': True,
        'verification_status': 'approved',
        'employee_count': '500-1000',
        'created_at': now,
        'updated_at': now,
    }
    company_insert = db.companies.insert_one(company)
    company_id = str(company_insert.inserted_id)
    print(f"  ✅ Created demo company (recruiter@techcorp.com / company12345)")

    # ---------------------------------------------------------------
    # Demo Opportunities
    # ---------------------------------------------------------------
    db.opportunities.delete_many({})
    opportunities = [
        {
            'title': 'Full Stack Developer Intern',
            'company_id': company_id,
            'company_name': 'TechCorp Solutions',
            'type': 'internship',
            'status': 'active',
            'description': 'Join our team as a Full Stack Developer Intern and work on exciting web applications. [DEMO DATA]',
            'location': 'Bangalore, Karnataka',
            'work_mode': 'hybrid',
            'duration': '6 months',
            'salary_min': 15000,
            'salary_max': 25000,
            'salary_type': 'monthly',
            'required_skills': [
                {'skill_id': skill_ids['JavaScript'], 'proficiency': 2},
                {'skill_id': skill_ids['React'], 'proficiency': 2},
                {'skill_id': skill_ids['Node.js'], 'proficiency': 1},
                {'skill_id': skill_ids['MongoDB'], 'proficiency': 1},
            ],
            'optional_skills': [
                {'skill_id': skill_ids['TypeScript'], 'proficiency': 1},
                {'skill_id': skill_ids['Docker'], 'proficiency': 1},
            ],
            'min_cgpa': 7.0,
            'eligible_departments': [],
            'deadline': now + timedelta(days=30),
            'is_featured': True,
            'created_at': now,
            'updated_at': now,
        },
        {
            'title': 'Data Science Intern',
            'company_id': company_id,
            'company_name': 'TechCorp Solutions',
            'type': 'internship',
            'status': 'active',
            'description': 'Work on cutting-edge data science projects with real-world datasets. [DEMO DATA]',
            'location': 'Remote',
            'work_mode': 'remote',
            'duration': '3 months',
            'salary_min': 20000,
            'salary_max': 30000,
            'salary_type': 'monthly',
            'required_skills': [
                {'skill_id': skill_ids['Python'], 'proficiency': 3},
                {'skill_id': skill_ids['Pandas'], 'proficiency': 2},
                {'skill_id': skill_ids['Machine Learning'], 'proficiency': 2},
            ],
            'optional_skills': [
                {'skill_id': skill_ids['Deep Learning'], 'proficiency': 1},
            ],
            'min_cgpa': 7.5,
            'eligible_departments': [],
            'deadline': now + timedelta(days=45),
            'is_featured': True,
            'created_at': now,
            'updated_at': now,
        },
        {
            'title': 'Backend Developer',
            'company_id': company_id,
            'company_name': 'TechCorp Solutions',
            'type': 'full_time',
            'status': 'active',
            'description': 'Build and maintain scalable backend services. [DEMO DATA]',
            'location': 'Hyderabad, Telangana',
            'work_mode': 'onsite',
            'salary_min': 800000,
            'salary_max': 1200000,
            'salary_type': 'annual',
            'required_skills': [
                {'skill_id': skill_ids['Python'], 'proficiency': 3},
                {'skill_id': skill_ids['Django'], 'proficiency': 3},
                {'skill_id': skill_ids['PostgreSQL'], 'proficiency': 2},
                {'skill_id': skill_ids['REST API'], 'proficiency': 3},
            ],
            'optional_skills': [
                {'skill_id': skill_ids['Docker'], 'proficiency': 2},
                {'skill_id': skill_ids['AWS'], 'proficiency': 1},
            ],
            'min_cgpa': 7.0,
            'eligible_departments': [],
            'deadline': now + timedelta(days=60),
            'is_featured': True,
            'created_at': now,
            'updated_at': now,
        },
    ]
    db.opportunities.insert_many(opportunities)
    print(f"  ✅ Created {len(opportunities)} demo opportunities")

    # ---------------------------------------------------------------
    # Create indexes
    # ---------------------------------------------------------------
    print("\n📇 Creating indexes...")
    create_all_indexes()

    print("\n✅ Seed data complete!")
    print("\n📋 Demo Accounts:")
    print("  Admin:   admin@skillbridge.com / admin12345")
    print("  Student: rahul@student.com / student12345")
    print("  Company: recruiter@techcorp.com / company12345")


if __name__ == '__main__':
    seed_data()
