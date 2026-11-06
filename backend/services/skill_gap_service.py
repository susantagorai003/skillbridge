"""
Skill Gap Analysis Service.
Calculates gaps between student competencies and job role requirements.
"""
from database.repositories.skill_repository import (
    StudentSkillRepository, JobRoleSkillRepository, SkillRepository
)


PROFICIENCY_LEVELS = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4,
}

PROFICIENCY_LABELS = {1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert'}


class SkillGapService:
    """Analyzes skill gaps between student competencies and job requirements."""

    def __init__(self):
        self.student_skill_repo = StudentSkillRepository()
        self.job_role_skill_repo = JobRoleSkillRepository()
        self.skill_repo = SkillRepository()

    def analyze_gap(self, student_id, job_role_id):
        """
        Perform skill gap analysis for a student against a job role.
        Returns detailed breakdown of strong, moderate, weak, and missing skills.
        """
        # Get student skills
        student_skills_raw = self.student_skill_repo.find_by_student(student_id)
        student_skills = {}
        for ss in student_skills_raw:
            student_skills[ss['skill_id']] = {
                'proficiency': ss.get('proficiency_level', 1),
                'verified': ss.get('is_verified', False),
                'source': ss.get('source', 'self_reported'),
            }

        # Get job role requirements
        role_skills_raw = self.job_role_skill_repo.find_by_role(job_role_id)

        strong_skills = []
        moderate_skills = []
        weak_skills = []
        missing_skills = []
        total_weight = 0
        matched_weight = 0

        for rs in role_skills_raw:
            skill_id = rs.get('skill_id')
            required_level = rs.get('required_proficiency', 2)
            importance = rs.get('importance', 'required')  # required, preferred, nice_to_have
            weight = {'required': 3, 'preferred': 2, 'nice_to_have': 1}.get(importance, 2)
            total_weight += weight

            # Get skill name
            skill_info = self.skill_repo.find_by_id(skill_id)
            skill_name = skill_info.get('name', 'Unknown') if skill_info else 'Unknown'

            if skill_id in student_skills:
                student_level = student_skills[skill_id]['proficiency']
                gap = required_level - student_level

                skill_data = {
                    'skill_id': skill_id,
                    'skill_name': skill_name,
                    'required_level': required_level,
                    'required_label': PROFICIENCY_LABELS.get(required_level, 'Unknown'),
                    'current_level': student_level,
                    'current_label': PROFICIENCY_LABELS.get(student_level, 'Unknown'),
                    'gap': max(0, gap),
                    'importance': importance,
                    'verified': student_skills[skill_id]['verified'],
                }

                if gap <= 0:
                    strong_skills.append(skill_data)
                    matched_weight += weight
                elif gap == 1:
                    moderate_skills.append(skill_data)
                    matched_weight += weight * 0.6
                else:
                    weak_skills.append(skill_data)
                    matched_weight += weight * 0.2
            else:
                missing_skills.append({
                    'skill_id': skill_id,
                    'skill_name': skill_name,
                    'required_level': required_level,
                    'required_label': PROFICIENCY_LABELS.get(required_level, 'Unknown'),
                    'current_level': 0,
                    'current_label': 'Not Acquired',
                    'gap': required_level,
                    'importance': importance,
                })

        # Calculate overall readiness
        readiness_score = round((matched_weight / total_weight * 100) if total_weight > 0 else 0, 1)

        # Generate recommendations (ordered by priority)
        recommendations = []
        for skill in missing_skills:
            if skill['importance'] == 'required':
                recommendations.append({
                    'skill_name': skill['skill_name'],
                    'action': f"Learn {skill['skill_name']} — required for this role",
                    'priority': 'high',
                    'target_level': skill['required_label'],
                })
        for skill in weak_skills:
            recommendations.append({
                'skill_name': skill['skill_name'],
                'action': f"Improve {skill['skill_name']} from {skill['current_label']} to {skill['required_label']}",
                'priority': 'medium',
                'target_level': skill['required_label'],
            })
        for skill in moderate_skills:
            recommendations.append({
                'skill_name': skill['skill_name'],
                'action': f"Advance {skill['skill_name']} to {skill['required_label']}",
                'priority': 'low',
                'target_level': skill['required_label'],
            })
        for skill in missing_skills:
            if skill['importance'] != 'required':
                recommendations.append({
                    'skill_name': skill['skill_name'],
                    'action': f"Consider learning {skill['skill_name']} ({skill['importance']})",
                    'priority': 'optional',
                    'target_level': skill['required_label'],
                })

        return {
            'student_id': student_id,
            'job_role_id': job_role_id,
            'readiness_score': readiness_score,
            'strong_skills': strong_skills,
            'moderate_skills': moderate_skills,
            'weak_skills': weak_skills,
            'missing_skills': missing_skills,
            'recommendations': recommendations,
            'summary': {
                'total_required': len(role_skills_raw),
                'strong_count': len(strong_skills),
                'moderate_count': len(moderate_skills),
                'weak_count': len(weak_skills),
                'missing_count': len(missing_skills),
            }
        }
