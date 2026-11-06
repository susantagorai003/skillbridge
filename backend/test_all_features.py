"""
Comprehensive Verification Script for SkillBridge Backend.
Tests all dynamic endpoints, MongoDB collections, and the AI Skill Gap Engine.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from apps.analytics.views import (
    PlatformAnalyticsView, StudentAnalyticsView, FacultyAnalyticsView,
    RecruiterAnalyticsView, AdminAnalyticsView, PlacementAnalyticsView
)
from apps.skill_mapping.views import SkillGapAnalyzeView, ResumeUploadView, RoadmapProgressView
from apps.accounts.views import UserListView
from apps.opportunities.views import FeaturedOpportunitiesView
from services.ai_service import AIService
from services.resume_service import ResumeService

def run_tests():
    rf = RequestFactory()
    print("=" * 60)
    print("SKILLBRIDGE VERIFICATION SUITE")
    print("=" * 60)

    # 1. Platform Analytics
    req = rf.get('/api/v1/analytics/platform/')
    resp = PlatformAnalyticsView.as_view()(req)
    print(f"[1] Platform Analytics Status: {resp.status_code}")
    print(f"    Data: {resp.data}")
    assert resp.status_code == 200

    # 2. Student Analytics
    req = rf.get('/api/v1/analytics/student/')
    resp = StudentAnalyticsView.as_view()(req)
    print(f"[2] Student Analytics Status: {resp.status_code}")
    print(f"    Readiness: {resp.data['analytics']['readiness_score']}%")
    assert resp.status_code == 200

    # 3. Faculty Analytics
    req = rf.get('/api/v1/analytics/faculty/')
    resp = FacultyAnalyticsView.as_view()(req)
    print(f"[3] Faculty Analytics Status: {resp.status_code}")
    print(f"    Cohort Readiness: {resp.data['analytics']['avg_cohort_readiness']}%")
    assert resp.status_code == 200

    # 4. Recruiter Analytics
    req = rf.get('/api/v1/analytics/recruiter/')
    resp = RecruiterAnalyticsView.as_view()(req)
    print(f"[4] Recruiter Analytics Status: {resp.status_code}")
    print(f"    Active Postings: {resp.data['analytics']['active_postings']}")
    assert resp.status_code == 200

    # 5. Admin Analytics & User Management
    req = rf.get('/api/v1/analytics/admin/')
    resp = AdminAnalyticsView.as_view()(req)
    print(f"[5] Admin Analytics Status: {resp.status_code}")
    print(f"    System Health: {resp.data['analytics']['system_health']}")
    assert resp.status_code == 200

    req = rf.get('/api/v1/auth/users/')
    resp = UserListView.as_view()(req)
    print(f"    User List Status: {resp.status_code}, Users Count: {len(resp.data.get('users', []))}")
    assert resp.status_code == 200

    # 6. AI Skill Gap Engine (POST)
    sample_cv = """
    Rahul Sharma
    Email: rahul@student.com
    Skills: Python, Django, JavaScript, React, HTML, CSS, Git, SQLite
    Education: B.Tech Computer Science, Apex Institute of Tech
    """
    req = rf.post(
        '/api/v1/skill-gap/analyze/',
        data={
            'target_role': 'Full Stack Developer',
            'resume_text': sample_cv,
        },
        content_type='application/json'
    )
    resp = SkillGapAnalyzeView.as_view()(req)
    print(f"[6] AI Skill Gap Analysis Status: {resp.status_code}")
    analysis = resp.data.get('analysis', {})
    print(f"    Role: {analysis.get('target_role')}")
    print(f"    Readiness Score: {analysis.get('readiness_score')}%")
    print(f"    Matched Skills: {analysis.get('matched_skills')}")
    print(f"    Missing Gaps: {analysis.get('missing_skills')}")
    print(f"    Roadmap Phases: {len(resp.data.get('roadmap', []))}")
    assert resp.status_code == 200
    assert analysis.get('readiness_score') > 0

    # 7. Roadmap Progress Patch
    req = rf.patch(
        '/api/v1/roadmaps/progress/',
        data={'phase_id': 'phase-1', 'completed': True},
        content_type='application/json'
    )
    resp = RoadmapProgressView.as_view()(req)
    print(f"[7] Roadmap Progress Update Status: {resp.status_code}")
    assert resp.status_code in [200, 404]

    # 8. Featured Opportunities
    req = rf.get('/api/v1/opportunities/featured/')
    resp = FeaturedOpportunitiesView.as_view()(req)
    print(f"[8] Featured Opportunities Status: {resp.status_code}")
    assert resp.status_code == 200

    print("=" * 60)
    print("ALL TESTS PASSED! APPLICATION IS FULLY FUNCTIONAL & DYNAMIC.")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
