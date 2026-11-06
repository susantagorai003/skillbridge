from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAuthenticated
from database.repositories.assessment_repository import (
    AssessmentRepository, AssessmentQuestionRepository, AssessmentResultRepository
)
from database.repositories.skill_repository import StudentSkillRepository


class AssessmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repo = AssessmentRepository()
        skill_id = request.query_params.get('skill_id')
        result = repo.find_active(skill_id=skill_id)
        if not result.get('items'):
            # Provide sample assessments
            sample_assessments = [
                {
                    'id': 'demo_assess_1',
                    'title': 'Python & Backend Development Assessment',
                    'skill_name': 'Python',
                    'difficulty': 'Intermediate',
                    'duration_minutes': 20,
                    'total_questions': 5,
                    'passing_score': 70,
                    'description': 'Test your core Python concepts, data structures, and backend principles.',
                },
                {
                    'id': 'demo_assess_2',
                    'title': 'React & Frontend Fundamentals',
                    'skill_name': 'React',
                    'difficulty': 'Intermediate',
                    'duration_minutes': 15,
                    'total_questions': 5,
                    'passing_score': 70,
                    'description': 'Assess your knowledge of React hooks, state management, and modern component design.',
                },
                {
                    'id': 'demo_assess_3',
                    'title': 'MongoDB & Database Architecture',
                    'skill_name': 'MongoDB',
                    'difficulty': 'Beginner',
                    'duration_minutes': 15,
                    'total_questions': 5,
                    'passing_score': 60,
                    'description': 'Evaluate your document schema design, indexing, and query aggregation knowledge.',
                }
            ]
            return Response({'success': True, 'items': sample_assessments, 'total': len(sample_assessments)})

        return Response({'success': True, **result})


class AssessmentQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assessment_id):
        # Demo questions
        questions = [
            {
                'id': 1,
                'question': 'Which of the following is true regarding MongoDB document structure?',
                'options': [
                    'Documents are stored in BSON format',
                    'Every document in a collection must have the exact same schema',
                    'Documents cannot contain nested arrays or objects',
                    'MongoDB documents do not support indexes'
                ],
            },
            {
                'id': 2,
                'question': 'In React, what hook is used to manage side effects such as data fetching?',
                'options': [
                    'useEffect',
                    'useState',
                    'useContext',
                    'useMemo'
                ],
            },
            {
                'id': 3,
                'question': 'What is the time complexity of searching by indexed field in a B-Tree index?',
                'options': [
                    'O(log n)',
                    'O(n)',
                    'O(1)',
                    'O(n^2)'
                ],
            },
            {
                'id': 4,
                'question': 'In RESTful APIs, which HTTP method is typically idempotent and used to replace a resource?',
                'options': [
                    'PUT',
                    'POST',
                    'PATCH',
                    'DELETE'
                ],
            },
            {
                'id': 5,
                'question': 'What does JWT stand for and where is it commonly placed in HTTP requests?',
                'options': [
                    'JSON Web Token, in Authorization header as Bearer token',
                    'Java Web Tool, in the Cookie body',
                    'JavaScript Worker Thread, in HTTP parameter',
                    'Joint Web Transaction, in URL query string'
                ],
            }
        ]
        return Response({'success': True, 'assessment_id': assessment_id, 'questions': questions})


class AssessmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assessment_id):
        answers = request.data.get('answers', {})
        # Correct answer indices (0-indexed)
        correct_answers = {
            '1': 0, # BSON
            '2': 0, # useEffect
            '3': 0, # O(log n)
            '4': 0, # PUT
            '5': 0, # JSON Web Token
        }

        correct_count = 0
        total = len(correct_answers)

        for q_id, correct_idx in correct_answers.items():
            if str(answers.get(q_id)) == str(correct_idx):
                correct_count += 1

        percentage = round((correct_count / total) * 100, 1)
        passed = percentage >= 60

        result_doc = {
            'student_id': str(request.user.id),
            'assessment_id': assessment_id,
            'score': percentage,
            'total_questions': total,
            'correct_answers': correct_count,
            'passed': passed,
            'completed_at': datetime.now(timezone.utc).isoformat(),
        }

        AssessmentResultRepository().insert_one(result_doc)

        # If passed, upgrade/verify student skill!
        if passed:
            skill_id = request.data.get('skill_id')
            if skill_id:
                StudentSkillRepository().upsert_skill(
                    request.user.id,
                    skill_id,
                    {'is_verified': True, 'source': 'assessment_verified'}
                )

        return Response({
            'success': True,
            'result': result_doc,
            'message': 'Congratulations! You passed and verified your skill.' if passed else 'You completed the assessment. Practice more to verify this skill.'
        })


class AssessmentResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        repo = AssessmentResultRepository()
        results = repo.find_by_student(request.user.id)
        return Response({'success': True, 'results': results})
