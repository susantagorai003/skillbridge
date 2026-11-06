"""
Job Matching Service.
Calculates weighted match scores between students and opportunities.
"""
from database.repositories.skill_repository import StudentSkillRepository, SkillRepository
from database.repositories.student_repository import StudentRepository
from database.repositories.opportunity_repository import OpportunityRepository


class MatchingService:
    """
    Calculates explainable match scores between students and opportunities.
    
    Match Score = (Weighted Matching Competency / Total Required Competency Weight) × 100
    
    Weights:
    - Mandatory skill match: 3 points per level matched
    - Optional skill match: 1 point per level matched
    - CGPA bonus: up to 5 points
    - Department match: 5 points
    """

    def __init__(self):
        self.student_skill_repo = StudentSkillRepository()
        self.student_repo = StudentRepository()
        self.opportunity_repo = OpportunityRepository()
        self.skill_repo = SkillRepository()

    def calculate_match(self, student_id, opportunity_id):
        """Calculate detailed match between a student and an opportunity."""
        # Get opportunity details
        opportunity = self.opportunity_repo.find_by_id(opportunity_id)
        if not opportunity and str(opportunity_id).startswith('ishala-'):
            from services.internshala_service import REALISTIC_TECH_INTERNSHIPS, is_skill_match
            from database.connection import get_collection
            target = next((item for item in REALISTIC_TECH_INTERNSHIPS if item['internship_id'] == str(opportunity_id)), None)
            if target:
                req_skills = target.get('skills', [])
                # Get student skills from profile or resumes
                st_skills = []
                try:
                    prof = get_collection('student_profiles').find_one({'user_id': str(student_id)})
                    if prof and prof.get('extracted_skills'):
                        st_skills = prof.get('extracted_skills')
                    else:
                        res = get_collection('resumes').find_one({'user_id': str(student_id)}, sort=[('created_at', -1)])
                        if res and res.get('extracted_skills'):
                            st_skills = res.get('extracted_skills')
                except Exception:
                    pass
                
                matched = []
                missing = []
                for req in req_skills:
                    if any(is_skill_match(st, req) for st in st_skills):
                        matched.append({'skill_name': req, 'status': 'matched'})
                    else:
                        missing.append({'skill_name': req, 'status': 'missing'})
                
                score = int(round((len(matched) / len(req_skills)) * 100)) if req_skills else 85
                score = max(35, min(100, score))
                return {
                    'match_score': score,
                    'eligible': True,
                    'eligibility_issues': [],
                    'matching_skills': matched,
                    'missing_skills': missing,
                    'recommendation': f"Verified compatibility for {target['title']} at {target['company']}."
                }
            return None

        if not opportunity:
            return None

        # Get student profile
        student_profile = self.student_repo.find_by_user_id(student_id)
        
        # Get student skills
        student_skills_raw = self.student_skill_repo.find_by_student(student_id)
        student_skills = {}
        for ss in student_skills_raw:
            student_skills[ss['skill_id']] = ss.get('proficiency_level', 1)

        required_skills = opportunity.get('required_skills', [])
        optional_skills = opportunity.get('optional_skills', [])

        matching_skills = []
        missing_skills = []
        proficiency_gaps = []
        total_weight = 0
        matched_weight = 0

        # Evaluate required skills (weight: 3)
        for req_skill in required_skills:
            skill_id = req_skill.get('skill_id', req_skill) if isinstance(req_skill, dict) else str(req_skill)
            req_level = req_skill.get('proficiency', 2) if isinstance(req_skill, dict) else 2
            weight = 3

            skill_info = self.skill_repo.find_by_id(skill_id)
            skill_name = skill_info.get('name', 'Unknown') if skill_info else skill_id

            total_weight += weight * req_level

            if skill_id in student_skills:
                student_level = student_skills[skill_id]
                level_match = min(student_level, req_level)
                matched_weight += weight * level_match

                if student_level >= req_level:
                    matching_skills.append({
                        'skill_name': skill_name,
                        'required': req_level,
                        'current': student_level,
                        'status': 'matched'
                    })
                else:
                    proficiency_gaps.append({
                        'skill_name': skill_name,
                        'required': req_level,
                        'current': student_level,
                        'gap': req_level - student_level
                    })
            else:
                missing_skills.append({
                    'skill_name': skill_name,
                    'required': req_level,
                    'type': 'required'
                })

        # Evaluate optional skills (weight: 1)
        for opt_skill in optional_skills:
            skill_id = opt_skill.get('skill_id', opt_skill) if isinstance(opt_skill, dict) else str(opt_skill)
            opt_level = opt_skill.get('proficiency', 1) if isinstance(opt_skill, dict) else 1
            weight = 1
            total_weight += weight * opt_level

            skill_info = self.skill_repo.find_by_id(skill_id)
            skill_name = skill_info.get('name', 'Unknown') if skill_info else skill_id

            if skill_id in student_skills:
                student_level = student_skills[skill_id]
                level_match = min(student_level, opt_level)
                matched_weight += weight * level_match
                matching_skills.append({
                    'skill_name': skill_name,
                    'required': opt_level,
                    'current': student_level,
                    'status': 'bonus'
                })

        # Calculate match score
        match_score = round((matched_weight / total_weight * 100) if total_weight > 0 else 0, 1)

        # Check eligibility
        eligible = True
        eligibility_issues = []

        min_cgpa = opportunity.get('min_cgpa', 0)
        if student_profile and min_cgpa > 0:
            student_cgpa = student_profile.get('cgpa', 0)
            if student_cgpa < min_cgpa:
                eligible = False
                eligibility_issues.append(f"CGPA {student_cgpa} below minimum {min_cgpa}")

        eligible_depts = opportunity.get('eligible_departments', [])
        if eligible_depts and student_profile:
            student_dept = student_profile.get('department_id', '')
            if student_dept and student_dept not in eligible_depts:
                eligible = False
                eligibility_issues.append("Department not eligible")

        return {
            'student_id': student_id,
            'opportunity_id': opportunity_id,
            'match_score': match_score,
            'eligible': eligible,
            'eligibility_issues': eligibility_issues,
            'matching_skills': matching_skills,
            'missing_skills': missing_skills,
            'proficiency_gaps': proficiency_gaps,
            'recommendation': self._get_recommendation(match_score, eligible),
        }

    def _get_recommendation(self, score, eligible):
        if not eligible:
            return 'Not eligible — check requirements'
        if score >= 85:
            return 'Excellent match — strongly recommended'
        elif score >= 70:
            return 'Good match — recommended'
        elif score >= 50:
            return 'Moderate match — consider applying'
        else:
            return 'Low match — significant skill gaps'

    def find_matches_for_student(self, student_id, page=1, page_size=10):
        """Find and rank all active opportunities for a student."""
        opportunities = self.opportunity_repo.find_active(page=1, page_size=100)
        matches = []
        for opp in opportunities.get('items', []):
            match = self.calculate_match(student_id, opp['id'])
            if match and match['eligible']:
                matches.append({**match, 'opportunity': opp})
        
        # Sort by match score
        matches.sort(key=lambda m: m['match_score'], reverse=True)

        # Paginate
        start = (page - 1) * page_size
        end = start + page_size
        return {
            'items': matches[start:end],
            'total': len(matches),
            'page': page,
            'page_size': page_size,
        }
