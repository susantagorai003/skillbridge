"""
AI Service for SkillBridge.
Provides intelligent CV analysis, role-specific skill gap analysis, personalized learning roadmaps,
and tailored interview preparation.
Supports configurable external LLMs (Google Gemini / OpenAI) with intelligent local heuristics fallback.
"""
import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Standard Benchmarks for Major Career Roles
ROLE_BENCHMARKS = {
    'Frontend Developer': {
        'required': ['JavaScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'Git'],
        'preferred': ['TypeScript', 'Next.js', 'Redux', 'Jest', 'Three.js', 'REST API'],
        'optional': ['GraphQL', 'Vite', 'Figma', 'Webpack', 'Accessibility'],
        'role_focus': 'UI responsiveness, modern component architecture, state management, and performance.',
        'interview_topics': [
            'Explain the React Virtual DOM, reconciliation, and useEffect lifecycle.',
            'How do you optimize render performance and prevent unnecessary re-renders in React?',
            'Explain CSS Grid vs Flexbox and your approach to responsive mobile-first layouts.',
            'What are the core differences between JavaScript closures, promises, and async/await?',
            'How would you manage complex global state across large scale frontend applications?'
        ]
    },
    'Backend Developer': {
        'required': ['Python', 'Django', 'REST API', 'SQL', 'PostgreSQL', 'Git'],
        'preferred': ['FastAPI', 'Node.js', 'Docker', 'Redis', 'Celery', 'MongoDB'],
        'optional': ['Microservices', 'GraphQL', 'Kubernetes', 'gRPC', 'AWS'],
        'role_focus': 'Robust API architecture, database query optimization, security, caching, and background tasks.',
        'interview_topics': [
            'How do you design RESTful endpoints adhering to idempotent HTTP methods?',
            'Explain database indexing strategies, query execution plans, and N+1 query problem.',
            'How do you implement secure JWT token authentication with rotation and refresh mechanisms?',
            'What caching strategies (write-through, cache-aside) do you employ with Redis?',
            'How do you handle asynchronous tasks and queue monitoring using Celery or message brokers?'
        ]
    },
    'Full Stack Developer': {
        'required': ['JavaScript', 'React', 'Python', 'Node.js', 'SQL', 'MongoDB', 'Git'],
        'preferred': ['TypeScript', 'Django', 'Docker', 'Tailwind CSS', 'REST API', 'CI/CD'],
        'optional': ['AWS', 'Next.js', 'Redis', 'GraphQL', 'Kubernetes'],
        'role_focus': 'End-to-end web system integration, client-server contract, and deployment pipelines.',
        'interview_topics': [
            'How do you structure an end-to-end full stack architecture for high maintainability?',
            'Walk through authenticating a React SPA with a stateless Django/Node backend.',
            'When would you choose MongoDB document stores over relational PostgreSQL databases?',
            'How do you containerize a multi-service application with Docker and Docker Compose?',
            'Describe how you monitor and debug errors propagating from frontend to backend logs.'
        ]
    },
    'Data Scientist': {
        'required': ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Machine Learning'],
        'preferred': ['Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Matplotlib'],
        'optional': ['NLP', 'Computer Vision', 'Tableau', 'Docker', 'AWS'],
        'role_focus': 'Statistical modeling, exploratory data analysis, feature engineering, and model validation.',
        'interview_topics': [
            'Explain bias-variance tradeoff and methods to mitigate overfitting in complex models.',
            'How do you evaluate classifier performance when dealing with heavily imbalanced classes?',
            'Explain feature selection and dimensionality reduction techniques like PCA.',
            'How does gradient descent optimization work, and what is the difference between Adam and SGD?',
            'Walk through your pipeline for data cleaning, handling missing values, and normalization.'
        ]
    },
    'AI / ML Engineer': {
        'required': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Git'],
        'preferred': ['NLP', 'Transformers', 'LLM', 'RAG', 'LangChain', 'Docker'],
        'optional': ['Hugging Face', 'Computer Vision', 'CUDA', 'FastAPI', 'Kubernetes'],
        'role_focus': 'Model fine-tuning, retrieval-augmented generation (RAG), vector embeddings, and inference serving.',
        'interview_topics': [
            'Explain the transformer architecture, self-attention mechanism, and positional encoding.',
            'How do you build and optimize a Retrieval-Augmented Generation (RAG) pipeline?',
            'What strategies do you use for LLM quantization, fine-tuning (LoRA), and efficient inference?',
            'How do you prevent hallucinations and evaluate the factual consistency of LLM responses?',
            'How would you deploy a deep learning model for real-time low-latency microservice inference?'
        ]
    },
    'DevOps Engineer': {
        'required': ['Linux', 'Docker', 'Git', 'CI/CD', 'Bash', 'AWS'],
        'preferred': ['Kubernetes', 'Terraform', 'GitHub Actions', 'Jenkins', 'Nginx'],
        'optional': ['Ansible', 'Prometheus', 'Grafana', 'GCP', 'Azure'],
        'role_focus': 'Infrastructure as Code, container orchestration, automated delivery pipelines, and observability.',
        'interview_topics': [
            'How do you construct a production-ready, multi-stage Docker build for minimal image size?',
            'Explain the core primitives of Kubernetes (Pods, Deployments, Services, Ingress).',
            'How do you write declarative Infrastructure as Code using Terraform with remote state locking?',
            'Design an automated zero-downtime CI/CD pipeline from git push to production release.',
            'How do you monitor distributed systems with Prometheus alerts and Grafana dashboards?'
        ]
    },
    'Data Analyst': {
        'required': ['SQL', 'Python', 'Pandas', 'Excel', 'Problem Solving'],
        'preferred': ['Tableau', 'Power BI', 'Matplotlib', 'Data Science', 'Communication'],
        'optional': ['R', 'PostgreSQL', 'MySQL', 'Statistics', 'Jira'],
        'role_focus': 'Business intelligence, KPI dash-boarding, SQL data wrangling, and actionable insights.',
        'interview_topics': [
            'Write and explain complex SQL queries utilizing window functions (ROW_NUMBER, RANK).',
            'How do you design an executive dashboard that clearly communicates business trends?',
            'How do you identify outliers and anomalies in financial or operational datasets?',
            'Explain how you present technical data findings to non-technical stakeholders.',
            'How do you validate data integrity across disparate database sources?'
        ]
    },
    'Cybersecurity Analyst': {
        'required': ['Linux', 'Networking', 'Python', 'Problem Solving', 'Git'],
        'preferred': ['Bash', 'Security Fundamentals', 'Docker', 'SQL', 'Postman'],
        'optional': ['Vulnerability Assessment', 'Penetration Testing', 'SIEM', 'Cryptography', 'AWS'],
        'role_focus': 'Defensive security, network protocol analysis, threat modeling, and vulnerability remediation.',
        'interview_topics': [
            'Explain the OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, SSRF) and mitigation techniques.',
            'How does the TLS/SSL handshake operate and how is cryptographic authenticity verified?',
            'How do you conduct incident response when unauthorized access is suspected on a server?',
            'What role does network segmentation and least-privilege identity access management play?',
            'Explain how you automate security scanning in a CI/CD development pipeline.'
        ]
    }
}

# Semantic Skill Equivalence & Alias Mappings
# Prevents candidate skills (e.g. MySQL, NodeJS, REST endpoints) from being falsely marked as missing gaps
SKILL_EQUIVALENTS = {
    'sql': {'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'sqlite3', 'oracle', 'mariadb', 'mssql', 'sql server', 'relational database'},
    'mysql': {'mysql', 'sql', 'mariadb'},
    'postgresql': {'postgresql', 'postgres', 'sql'},
    'mongodb': {'mongodb', 'mongo', 'nosql', 'mongoose', 'documentdb'},
    'node.js': {'node.js', 'nodejs', 'node', 'express', 'express.js', 'expressjs', 'nestjs'},
    'express': {'express', 'express.js', 'expressjs', 'node.js', 'nodejs'},
    'react': {'react', 'react.js', 'reactjs', 'react native'},
    'tailwind css': {'tailwind css', 'tailwind', 'tailwindcss'},
    'tailwind': {'tailwind css', 'tailwind', 'tailwindcss'},
    'rest api': {'rest api', 'rest apis', 'rest', 'restful', 'restful api', 'restful apis', 'rest endpoints', 'api development'},
    'git': {'git', 'github', 'gitlab', 'version control', 'bitbucket'},
    'python': {'python', 'python3'},
    'django': {'django', 'django rest framework', 'drf'},
    'docker': {'docker', 'containerization', 'containers', 'docker compose', 'docker-compose'},
    'ci/cd': {'ci/cd', 'github actions', 'jenkins', 'gitlab ci', 'continuous integration', 'devops'},
    'typescript': {'typescript', 'ts'},
    'javascript': {'javascript', 'js', 'es6', 'es6+', 'ecmascript'},
    'html': {'html', 'html5'},
    'css': {'css', 'css3', 'scss', 'sass', 'tailwind css', 'tailwind'},
    'redis': {'redis', 'caching'},
    'c++': {'c++', 'cpp'},
    'c': {'c'},
    'java': {'java', 'spring', 'spring boot'},
    'problem solving': {'problem solving', 'problem-solving', 'dsa', 'data structures', 'algorithms'},
    'communication': {'communication', 'team player', 'teamwork', 'collaboration'},
    'adaptability': {'adaptability', 'quick learner', 'flexible'},
}


class AIService:
    """Intelligent AI Engine for CV Analysis, Gap Detection, Roadmap Generation, and Interview Prep."""

    def __init__(self):
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY', '')
        self.openai_api_key = os.environ.get('OPENAI_API_KEY', '')

    def get_role_benchmark(self, role_name: str) -> Dict[str, Any]:
        """Find the closest role benchmark or construct a standard baseline."""
        for title, data in ROLE_BENCHMARKS.items():
            if title.lower() in role_name.lower() or role_name.lower() in title.lower():
                return data

        # Default fallback benchmark for custom/unrecognized roles
        return {
            'required': ['Python', 'JavaScript', 'SQL', 'Git', 'Problem Solving'],
            'preferred': ['REST API', 'Docker', 'Linux', 'Communication'],
            'optional': ['CI/CD', 'Cloud', 'Agile'],
            'role_focus': 'Industry engineering best practices, modern tools, and domain problem solving.',
            'interview_topics': [
                f'How do you approach learning and mastering the primary tech stack for {role_name}?',
                'Walk through a complex technical bug you encountered and how you systematically debugged it.',
                'Explain how you write scalable, maintainable, and clean code with automated unit tests.',
                'How do you collaborate within an agile engineering team using Git workflow and code reviews?'
            ]
        }

    def is_skill_satisfied(self, benchmark_skill: str, candidate_skills: List[str]) -> bool:
        """
        Check if a benchmark skill is satisfied by candidate skills either directly,
        via case-insensitive matching, or semantic equivalence/alias mapping.
        """
        b_norm = benchmark_skill.strip().lower()
        cand_norm = {s.strip().lower() for s in candidate_skills}

        # 1. Direct match
        if b_norm in cand_norm:
            return True

        # 2. Check canonical equivalence dictionary
        aliases = SKILL_EQUIVALENTS.get(b_norm, set())
        if aliases & cand_norm:
            return True

        # 3. Reverse check (if candidate has a skill whose aliases include benchmark_skill)
        for c in cand_norm:
            if b_norm in SKILL_EQUIVALENTS.get(c, set()):
                return True

        return False

    def analyze_skill_gap(
        self,
        candidate_skills: List[str],
        target_role: str,
        custom_job_description: str = ""
    ) -> Dict[str, Any]:
        """
        Deep skill gap analysis comparing extracted candidate skills against target role or custom JD.
        Utilizes RapidAPI AI cloud evaluation if reachable, with seamless fallback to standardized benchmarks.
        """
        # 1. Attempt RapidAPI AI cloud evaluation
        try:
            from services.rapidapi_service import rapidapi_service
            if rapidapi_service.is_configured():
                ai_res = rapidapi_service.analyze_skill_gap_with_ai(
                    candidate_skills=candidate_skills,
                    target_role=target_role,
                    job_description=custom_job_description
                )
                if ai_res and 'match_score' in ai_res:
                    # Successfully analyzed with RapidAPI
                    raw_missing = ai_res.get('missing_skills', [])
                    skill_gaps = []
                    matched = list(ai_res.get('matching_skills', []))

                    for item in raw_missing:
                        skill_name = item.get('name', 'Competency') if isinstance(item, dict) else str(item)
                        # Ensure candidate skills are not falsely marked as missing
                        if self.is_skill_satisfied(skill_name, candidate_skills):
                            if skill_name not in matched:
                                matched.append(skill_name)
                            continue

                        if isinstance(item, dict):
                            skill_gaps.append({
                                'skill': item.get('name', 'Competency'),
                                'priority': item.get('priority', 'High').title(),
                                'category': item.get('category', 'Technical Gap').title(),
                                'reason': item.get('reason', f'Recommended for {target_role}'),
                                'estimated_weeks': 2
                            })
                        else:
                            skill_gaps.append({
                                'skill': item,
                                'priority': 'High',
                                'category': 'Core Requirement',
                                'reason': f'Essential competency for {target_role}',
                                'estimated_weeks': 2
                            })

                    missing_names = [g['skill'] for g in skill_gaps]
                    for s in candidate_skills:
                        if s not in missing_names and s not in matched:
                            matched.append(s)

                    # Format roadmap phases
                    phases = []
                    for idx, p in enumerate(ai_res.get('roadmap', []), start=1):
                        phases.append({
                            'id': f"phase-{idx}",
                            'phase': idx,
                            'title': p.get('title', f"Phase {idx}: Skill Mastery"),
                            'duration': p.get('duration', '2-3 Weeks'),
                            'status': 'in_progress' if idx == 1 else 'pending',
                            'completed': False,
                            'description': p.get('description', f"Focused learning for {target_role}."),
                            'topics': p.get('topics', []),
                            'assignments': p.get('assignments', []),
                            'resources': p.get('resources', [{'title': 'Documentation & Guides', 'type': 'Curriculum'}])
                        })

                    # If roadmap was empty in AI response, generate structured roadmap
                    if not phases:
                        phases = self._generate_roadmap(target_role, missing_names[:3], missing_names[3:])

                    return {
                        'target_role': target_role,
                        'readiness_score': float(ai_res.get('match_score', 65)),
                        'role_readiness_level': ai_res.get('role_readiness_level', 'Intermediate'),
                        'matched_skills': matched,
                        'missing_skills': missing_names,
                        'strong_skills': matched[:4],
                        'moderate_skills': matched[4:],
                        'skill_gaps': skill_gaps,
                        'roadmap': phases,
                        'interview_prep': {
                            'role': target_role,
                            'focus_area': ai_res.get('summary', f'Technical preparation for {target_role}'),
                            'technical_questions': ai_res.get('interview_questions', self.get_role_benchmark(target_role)['interview_topics']),
                            'ai_tips': ai_res.get('strengths', [f'Leverage your background in {", ".join(matched[:2]) if matched else "fundamentals"}.'])
                        },
                        'summary': {
                            'total_role_skills': len(matched) + len(missing_names),
                            'matched_count': len(matched),
                            'missing_count': len(missing_names),
                            'readiness_score': float(ai_res.get('match_score', 65)),
                        },
                        'engine': 'rapidapi_gpt4'
                    }
        except Exception as e:
            logger.warning(f"RapidAPI AI skill gap error: {e}. Executing benchmark engine.")

        # 2. Resilient Benchmark Engine Fallback
        benchmark = self.get_role_benchmark(target_role)
        
        # If custom JD is provided, extract skills from it
        if custom_job_description and len(custom_job_description) > 50:
            from services.resume_service import ResumeService
            jd_extracted = ResumeService().extract_skills(custom_job_description)
            if jd_extracted['skills']:
                required_skills = jd_extracted['skills'][:8]
                preferred_skills = jd_extracted['skills'][8:14]
            else:
                required_skills = benchmark['required']
                preferred_skills = benchmark['preferred']
        else:
            required_skills = benchmark['required']
            preferred_skills = benchmark['preferred']

        # Classify Skills using Semantic Equivalence Engine
        matched_required = [s for s in required_skills if self.is_skill_satisfied(s, candidate_skills)]
        missing_required = [s for s in required_skills if not self.is_skill_satisfied(s, candidate_skills)]
        matched_preferred = [s for s in preferred_skills if self.is_skill_satisfied(s, candidate_skills)]
        missing_preferred = [s for s in preferred_skills if not self.is_skill_satisfied(s, candidate_skills)]

        # Calculate readiness percentage
        total_req_points = len(required_skills) * 3 + len(preferred_skills) * 1.5
        earned_points = len(matched_required) * 3 + len(matched_preferred) * 1.5
        readiness_score = round((earned_points / total_req_points * 100) if total_req_points > 0 else 50, 1)

        # Build prioritized gaps
        skill_gaps = []
        for s in missing_required:
            skill_gaps.append({
                'skill': s,
                'priority': 'High',
                'category': 'Core Requirement',
                'reason': f"Essential standard requirement for {target_role}.",
                'estimated_weeks': 2
            })
        for s in missing_preferred:
            skill_gaps.append({
                'skill': s,
                'priority': 'Medium',
                'category': 'Competitive Edge',
                'reason': f"Highly valued across top industry job postings for {target_role}.",
                'estimated_weeks': 1
            })

        # Generate Tailored Multi-Phase Roadmap
        roadmap = self._generate_roadmap(target_role, missing_required, missing_preferred)

        # Generate Interview Questions & Tips
        interview_prep = {
            'role': target_role,
            'focus_area': benchmark['role_focus'],
            'technical_questions': benchmark['interview_topics'],
            'ai_tips': [
                f"Highlight your experience with {', '.join(matched_required[:3]) if matched_required else 'core fundamentals'} in projects.",
                f"Prepare to answer practical coding questions on {missing_required[0] if missing_required else 'system design'}.",
                "Structure answers using the STAR method (Situation, Task, Action, Result) for behavioral questions."
            ]
        }

        return {
            'target_role': target_role,
            'readiness_score': readiness_score,
            'matched_skills': matched_required + matched_preferred,
            'missing_skills': missing_required + missing_preferred,
            'strong_skills': matched_required,
            'moderate_skills': matched_preferred,
            'skill_gaps': skill_gaps,
            'roadmap': roadmap,
            'interview_prep': interview_prep,
            'summary': {
                'total_role_skills': len(required_skills) + len(preferred_skills),
                'matched_count': len(matched_required) + len(matched_preferred),
                'missing_count': len(missing_required) + len(missing_preferred),
                'readiness_score': readiness_score,
            }
        }

    def _generate_roadmap(
        self,
        target_role: str,
        missing_core: List[str],
        missing_preferred: List[str]
    ) -> List[Dict[str, Any]]:
        """Construct structured, actionable multi-phase learning roadmap with real YouTube tutorial videos."""
        from services.youtube_service import youtube_service

        phases = []
        phase_num = 1

        # Phase 1: Core Fundamentals & Immediate Gaps
        if missing_core:
            primary_focus = missing_core[:2]
            vids1 = youtube_service.search_tutorials(primary_focus[0], limit=2)
            phases.append({
                'id': f"phase-{phase_num}",
                'phase': phase_num,
                'title': f"Foundation: Master {', '.join(primary_focus)}",
                'duration': '2-3 Weeks',
                'status': 'in_progress',
                'completed': False,
                'description': f"Build solid proficiency in {', '.join(primary_focus)} to meet minimum industry requirements.",
                'topics': [
                    f"Core syntax, data flow, and architectural patterns of {primary_focus[0]}",
                    f"Writing clean, modular code with hands-on exercises in {primary_focus[0]}",
                    f"Understanding standard library and tooling for {primary_focus[-1]}"
                ],
                'assignments': [
                    f"Develop a standalone module or CLI applying {primary_focus[0]} with unit tests.",
                    "Review official documentation and complete interactive coding katas."
                ],
                'resources': [
                    {'title': f"{primary_focus[0]} Official Documentation", 'type': 'Documentation'},
                    {'title': 'Roadmap.sh Developer Guides', 'type': 'Curriculum'},
                    {'title': 'Interactive Practice Challenges', 'type': 'Hands-on'}
                ],
                'videos': vids1
            })
            phase_num += 1

        # Phase 2: Secondary Core or Tooling Gaps
        remaining_core = missing_core[2:] if len(missing_core) > 2 else []
        if remaining_core or missing_preferred:
            secondary_focus = (remaining_core + missing_preferred)[:3]
            vids2 = youtube_service.search_tutorials(secondary_focus[0], limit=2)
            phases.append({
                'id': f"phase-{phase_num}",
                'phase': phase_num,
                'title': f"Integration & Tooling: {', '.join(secondary_focus[:2])}",
                'duration': '2-3 Weeks',
                'status': 'pending',
                'completed': False,
                'description': f"Integrate {secondary_focus[0]} into practical engineering workflows.",
                'topics': [
                    f"Advanced design patterns and asynchronous workflows in {secondary_focus[0]}",
                    "Debugging, performance optimization, and API error handling",
                    "Configuring modern developer tooling and CI/CD validation"
                ],
                'assignments': [
                    f"Build an end-to-end feature integrating {secondary_focus[0]} with a persistent backend.",
                    "Write automated test suites achieving >80% code coverage."
                ],
                'resources': [
                    {'title': 'FreeCodeCamp Technical Guides', 'type': 'Tutorial'},
                    {'title': 'GitHub Open Source Reference Projects', 'type': 'Codebase'}
                ],
                'videos': vids2
            })
            phase_num += 1

        # Phase Final: Production Capstone Project & Portfolio
        vids3 = youtube_service.search_tutorials(f"{target_role} project", limit=2)
        phases.append({
            'id': f"phase-{phase_num}",
            'phase': phase_num,
            'title': f"Industry Capstone: Production-Grade {target_role} System",
            'duration': '3-4 Weeks',
            'status': 'pending',
            'completed': False,
            'description': f"Synthesize all skills into a comprehensive portfolio project designed for technical recruiters.",
            'topics': [
                "System architecture design, data flow diagrams, and API documentation",
                "Containerization, environment configuration, and cloud deployment",
                "Writing a compelling GitHub README with live demo link and architectural highlights"
            ],
            'assignments': [
                f"Design, build, and deploy a full-scale {target_role} application to a cloud host.",
                "Record a 2-minute walkthrough demo video for recruiters and portfolio showcasing."
            ],
            'resources': [
                {'title': 'System Design Primer', 'type': 'Architecture'},
                {'title': 'Production Deployment Checklist', 'type': 'DevOps'}
            ],
            'videos': vids3
        })

        return phases
