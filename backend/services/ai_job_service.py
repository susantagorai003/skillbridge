"""
AI Job Description and Competency Extraction Service.
Generates comprehensive, industry-standard job postings and extracts
standardized required skills, recommended stipends, and screening questions.
"""
import re
from typing import Dict, Any, List

JOB_TEMPLATES = {
    'full stack': {
        'title': 'Full Stack Web Developer Intern',
        'type': 'internship',
        'location': 'Bangalore, Karnataka (Hybrid)',
        'work_mode': 'hybrid',
        'duration': '6 months',
        'salary_min': 25000,
        'salary_max': 35000,
        'salary_type': 'monthly',
        'min_cgpa': 7.0,
        'description': (
            "We are seeking an ambitious Full Stack Web Developer Intern to join our engineering team.\n\n"
            "Key Responsibilities:\n"
            "• Build, test, and deploy responsive web interfaces using modern React and Tailwind CSS.\n"
            "• Design scalable RESTful microservices and database schemas in Node.js and MongoDB/SQL.\n"
            "• Optimize web application performance, ensuring fast load times and clean code architecture.\n"
            "• Collaborate in daily Agile standups, code reviews, and Git version control workflows.\n\n"
            "Requirements:\n"
            "• Solid proficiency in JavaScript/TypeScript, React, and Node.js.\n"
            "• Hands-on familiarity with REST API design and database query optimization.\n"
            "• Strong problem-solving aptitude and passion for building scalable software products."
        ),
        'skills': [
            {'name': 'React', 'proficiency': 2},
            {'name': 'Node.js', 'proficiency': 2},
            {'name': 'JavaScript', 'proficiency': 3},
            {'name': 'MongoDB', 'proficiency': 2},
            {'name': 'REST API', 'proficiency': 2},
            {'name': 'Git', 'proficiency': 2},
        ],
        'screening_questions': [
            "Describe a full-stack application you built from scratch and the architecture you chose.",
            "How do you handle state management and API error states in React?",
        ]
    },
    'frontend': {
        'title': 'Frontend React Engineer Intern',
        'type': 'internship',
        'location': 'Bangalore, Karnataka (Remote)',
        'work_mode': 'remote',
        'duration': '6 months',
        'salary_min': 22000,
        'salary_max': 30000,
        'salary_type': 'monthly',
        'min_cgpa': 6.5,
        'description': (
            "Join our frontend product engineering squad to build fluid, high-performance web applications.\n\n"
            "Key Responsibilities:\n"
            "• Develop reusable UI components and client workflows using React, TypeScript, and Tailwind.\n"
            "• Ensure responsive design, cross-browser compatibility, and accessibility standards.\n"
            "• Integrate frontend views seamlessly with backend REST APIs.\n"
            "• Write clean, testable frontend code and optimize core web vitals."
        ),
        'skills': [
            {'name': 'React', 'proficiency': 3},
            {'name': 'JavaScript', 'proficiency': 3},
            {'name': 'TypeScript', 'proficiency': 2},
            {'name': 'Tailwind CSS', 'proficiency': 2},
            {'name': 'Git', 'proficiency': 2},
        ],
        'screening_questions': [
            "How do you optimize render performance for large lists in React?",
            "What advantages does TypeScript provide over plain JavaScript in a production codebase?",
        ]
    },
    'backend': {
        'title': 'Python & Backend Systems Intern',
        'type': 'internship',
        'location': 'Hyderabad, Telangana (Hybrid)',
        'work_mode': 'hybrid',
        'duration': '6 months',
        'salary_min': 25000,
        'salary_max': 35000,
        'salary_type': 'monthly',
        'min_cgpa': 7.0,
        'description': (
            "We are looking for a Backend Systems Intern passionate about building robust, high-throughput APIs.\n\n"
            "Key Responsibilities:\n"
            "• Design and maintain scalable REST APIs using Python and Django/FastAPI.\n"
            "• Write optimized SQL queries and manage relational database migrations.\n"
            "• Containerize microservices with Docker and implement automated unit test suites.\n"
            "• Assist in performance profiling, caching strategies, and API security hardening."
        ),
        'skills': [
            {'name': 'Python', 'proficiency': 3},
            {'name': 'Django', 'proficiency': 2},
            {'name': 'SQL', 'proficiency': 2},
            {'name': 'REST API', 'proficiency': 2},
            {'name': 'Docker', 'proficiency': 1},
            {'name': 'Git', 'proficiency': 2},
        ],
        'screening_questions': [
            "Explain how database indexing works and when you would add an index.",
            "How do you design an idempotent REST API endpoint for financial transactions?",
        ]
    },
    'ai': {
        'title': 'AI & Machine Learning Research Intern',
        'type': 'internship',
        'location': 'Bangalore, Karnataka (Work from home)',
        'work_mode': 'remote',
        'duration': '6 months',
        'salary_min': 30000,
        'salary_max': 45000,
        'salary_type': 'monthly',
        'min_cgpa': 7.5,
        'description': (
            "Work alongside our AI research team to develop, train, and deploy predictive ML and NLP models.\n\n"
            "Key Responsibilities:\n"
            "• Build end-to-end data pipelines for preprocessing, feature engineering, and model evaluation.\n"
            "• Train and fine-tune machine learning and deep learning models using PyTorch or Scikit-Learn.\n"
            "• Deploy inference APIs and monitor model accuracy against real-world user datasets.\n"
            "• Stay updated on state-of-the-art developments in generative AI and LLMs."
        ),
        'skills': [
            {'name': 'Python', 'proficiency': 3},
            {'name': 'Machine Learning', 'proficiency': 2},
            {'name': 'SQL', 'proficiency': 2},
            {'name': 'Git', 'proficiency': 2},
        ],
        'screening_questions': [
            "How do you address overfitting when training a complex machine learning model?",
            "Explain the difference between precision, recall, and F1-score with an example.",
        ]
    },
    'devops': {
        'title': 'Cloud & DevOps Automation Intern',
        'type': 'internship',
        'location': 'Pune, Maharashtra (Remote)',
        'work_mode': 'remote',
        'duration': '3-6 months',
        'salary_min': 22000,
        'salary_max': 30000,
        'salary_type': 'monthly',
        'min_cgpa': 6.5,
        'description': (
            "Help us build robust CI/CD automation pipelines and maintain high-availability cloud infrastructure.\n\n"
            "Key Responsibilities:\n"
            "• Package application services into Docker containers and configure container networks.\n"
            "• Maintain GitHub Actions CI/CD workflows for automated testing and deployment.\n"
            "• Monitor cloud server health, latency, and system resource metrics.\n"
            "• Write shell scripts for routine maintenance and automated backups."
        ),
        'skills': [
            {'name': 'Docker', 'proficiency': 2},
            {'name': 'CI/CD', 'proficiency': 2},
            {'name': 'Git', 'proficiency': 2},
            {'name': 'Python', 'proficiency': 2},
        ],
        'screening_questions': [
            "What is the difference between a Docker image and a Docker container?",
            "Describe the stages of a complete CI/CD deployment pipeline.",
        ]
    }
}


class AIJobService:
    """Service to automatically generate and enhance job postings with skill taxonomies."""

    @staticmethod
    def generate_job_posting(title: str, company_name: str = "Our Company") -> Dict[str, Any]:
        """Generate a complete job description and required skills based on role title."""
        t_clean = (title or "").lower()
        matched_key = 'full stack'

        if any(k in t_clean for k in ['front', 'react', 'ui', 'web']):
            matched_key = 'frontend'
        elif any(k in t_clean for k in ['back', 'python', 'django', 'node', 'api']):
            matched_key = 'backend'
        elif any(k in t_clean for k in ['ai', 'machine learning', 'data', 'ml', 'nlp']):
            matched_key = 'ai'
        elif any(k in t_clean for k in ['devops', 'cloud', 'docker', 'infra']):
            matched_key = 'devops'
        elif any(k in t_clean for k in ['full', 'mern', 'stack', 'software']):
            matched_key = 'full stack'

        base = dict(JOB_TEMPLATES.get(matched_key, JOB_TEMPLATES['full stack']))
        
        # Customize title if user provided one
        if title and len(title.strip()) > 3:
            base['title'] = title.strip()

        return {
            'success': True,
            'role_category': matched_key,
            **base
        }
