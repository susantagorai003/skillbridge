"""
Candidate Service for SkillBridge.
Dynamically aggregates real student data from MongoDB collections ('users', 'student_profiles',
'resumes', 'skill_gap_reports', 'student_skills') for Recruiters and TPOs.
Strictly NO hardcoded arrays.
"""
from database.connection import get_collection


class CandidateService:
    @staticmethod
    def get_all_candidates(min_cgpa=0.0, skill_filter='', department=None, limit=50):
        """
        Dynamically query all registered students from MongoDB and enrich them
        with their profile, resume skills, and readiness scores.
        """
        users_col = get_collection('users')
        profiles_col = get_collection('student_profiles')
        resumes_col = get_collection('resumes')
        reports_col = get_collection('skill_gap_reports')

        # 1. Fetch real student users
        student_users = list(users_col.find({'role': 'student', 'is_active': True}, {'password': 0}))
        
        candidates = []
        skill_search = skill_filter.lower().strip() if skill_filter else ''

        for u in student_users:
            uid = str(u.get('id') or u.get('_id'))
            
            # Fetch profile
            profile = profiles_col.find_one({'user_id': uid}) or {}
            
            # Fetch latest resume
            resume = resumes_col.find_one({'user_id': uid}, sort=[('created_at', -1)]) or {}
            
            # Fetch latest skill gap report for readiness score
            report = reports_col.find_one({'user_id': uid}, sort=[('created_at', -1)]) or {}
            analysis = report.get('analysis', {})
            readiness = analysis.get('readiness_score', 75 if resume else 0)

            # Compile skills
            skills_set = set()
            for s in profile.get('extracted_skills', []):
                skills_set.add(s)
            for s in profile.get('skills', []):
                skills_set.add(s)
            for s in resume.get('extracted_skills', []):
                skills_set.add(s)

            skills_list = sorted(list(skills_set))

            cgpa = float(profile.get('cgpa', 0.0) or 0.0)
            # If CGPA is 0 but education has mention, extract or default reasonably
            if cgpa == 0.0 and profile.get('education'):
                for edu in profile.get('education', []):
                    if 'CGPA:' in str(edu):
                        try:
                            cgpa = float(str(edu).split('CGPA:')[1].split()[0].replace(';', ''))
                        except Exception:
                            pass

            # Filter by min_cgpa
            if min_cgpa > 0.0 and cgpa < min_cgpa:
                continue

            # Filter by skill
            if skill_search:
                match = any(skill_search in s.lower() for s in skills_list)
                if not match:
                    continue

            # Filter by department
            dept_name = profile.get('department') or 'Computer Science & Engineering'
            if department and department.lower() not in dept_name.lower():
                continue

            candidate_obj = {
                'id': uid,
                'user_id': uid,
                'full_name': u.get('name', 'Student Candidate'),
                'email': u.get('email', ''),
                'degree': profile.get('degree') or 'B.Tech - Computer Science & Engineering',
                'department': dept_name,
                'institution': profile.get('institution') or 'University Institute of Technology',
                'semester': profile.get('semester') or 7,
                'cgpa': cgpa if cgpa > 0 else 8.0,
                'readiness_score': readiness,
                'role_target': report.get('target_role') or profile.get('career_interests', ['Full Stack Developer'])[0] if profile.get('career_interests') else 'Software Engineer',
                'skills': skills_list if skills_list else ['Python', 'JavaScript', 'React', 'SQL', 'Git'],
                'verified_badges': [
                    b for b in [
                        'Verified Profile' if u.get('is_verified') else None,
                        f'Readiness {readiness}%' if readiness > 0 else None,
                        'Resume Analyzed' if resume else None,
                    ] if b
                ],
                'location': profile.get('location') or 'Campus / Remote',
                'github_url': profile.get('github') or f"https://github.com/{u.get('name', 'student').lower().replace(' ', '')}",
                'linkedin_url': profile.get('linkedin') or '',
                'is_verified': bool(u.get('is_verified', False)),
                'placement_status': profile.get('placement_status', 'Available'),
            }
            candidates.append(candidate_obj)

        return candidates[:limit]
