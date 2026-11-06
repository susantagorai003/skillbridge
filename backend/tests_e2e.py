import os
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from apps.accounts.services import AuthService
from services.skill_gap_service import SkillGapService
from services.matching_service import MatchingService
from database.repositories.user_repository import UserRepository
from database.repositories.skill_repository import JobRoleRepository, SkillRepository
from database.repositories.opportunity_repository import OpportunityRepository


def run_tests():
    print("🧪 Running SkillBridge Test Suite...")
    passed = 0
    total = 0

    # 1. Test Auth Service (Login existing demo user)
    total += 1
    print("\n[Test 1] Testing Authentication...")
    auth = AuthService()
    login_res = auth.login('rahul@student.com', 'student12345')
    if login_res.get('success') and 'access_token' in login_res.get('tokens', {}):
        print("  ✅ Student login successful with JWT access and refresh tokens")
        passed += 1
    else:
        print(f"  ❌ Student login failed: {login_res}")

    # 2. Test Refresh Token
    total += 1
    print("\n[Test 2] Testing Token Refresh...")
    refresh_token = login_res['tokens']['refresh_token']
    refresh_res = auth.refresh_token(refresh_token)
    if refresh_res.get('success') and 'access_token' in refresh_res.get('tokens', {}):
        print("  ✅ Token refresh rotation successful")
        passed += 1
    else:
        print(f"  ❌ Token refresh failed: {refresh_res}")

    # 3. Test MongoDB Repository
    total += 1
    print("\n[Test 3] Testing MongoDB Repositories...")
    user_repo = UserRepository()
    user = user_repo.find_by_email('rahul@student.com')
    if user and user.get('role') == 'student':
        print(f"  ✅ Found user doc in MongoDB Atlas with id={user['id']}")
        passed += 1
    else:
        print(f"  ❌ User lookup failed: {user}")

    # 4. Test Skill Gap Engine
    total += 1
    print("\n[Test 4] Testing Skill Gap Analysis Engine...")
    role_repo = JobRoleRepository()
    role = role_repo.find_by_title('Full Stack Developer')
    if role and user:
        gap_service = SkillGapService()
        gap_res = gap_service.analyze_gap(student_id=user['id'], job_role_id=role['id'])
        score = gap_res.get('readiness_score')
        strong = len(gap_res.get('strong_skills', []))
        weak = len(gap_res.get('weak_skills', []))
        missing = len(gap_res.get('missing_skills', []))
        recs = len(gap_res.get('recommendations', []))
        print(f"  ✅ Readiness: {score}%, Strong: {strong}, Weak: {weak}, Missing: {missing}, Recs: {recs}")
        assert isinstance(score, (int, float))
        passed += 1
    else:
        print("  ❌ Role or User not found for gap analysis")

    # 5. Test Matching Algorithm
    total += 1
    print("\n[Test 5] Testing Explainable Matching Algorithm...")
    opp_repo = OpportunityRepository()
    opps = opp_repo.find_active()
    if opps.get('items') and user:
        first_opp = opps['items'][0]
        matcher = MatchingService()
        match_res = matcher.calculate_match(user['id'], first_opp['id'])
        match_score = match_res.get('match_score')
        eligible = match_res.get('eligible')
        rec = match_res.get('recommendation')
        print(f"  ✅ Match Score: {match_score}%, Eligible: {eligible}, Recommendation: '{rec}'")
        assert match_score >= 0 and match_score <= 100
        passed += 1
    else:
        print("  ❌ Opportunity not found for matching")

    print(f"\n==========================================")
    print(f"Test Suite Results: {passed}/{total} Passed ({round(passed/total*100)}%)")
    print(f"==========================================\n")


if __name__ == '__main__':
    run_tests()
