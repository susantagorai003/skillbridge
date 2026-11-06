"""
Comprehensive Resume Parsing & Analysis Service.
Extracts structured information from PDF resumes or raw text using PyMuPDF and NLP entity extraction.
Stores extracted information cleanly into MongoDB.
"""
import re
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Broad taxonomy of industry recognized skills categorized
SKILL_TAXONOMY = {
    'programming_languages': [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang',
        'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'R', 'Scala', 'Dart', 'SQL', 'Bash', 'Shell'
    ],
    'frontend': [
        'React', 'React.js', 'Next.js', 'Vue.js', 'Vue', 'Angular', 'Svelte',
        'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Tailwind', 'Bootstrap',
        'Redux', 'Zustand', 'Sass', 'SCSS', 'Webpack', 'Vite', 'Three.js', 'GSAP'
    ],
    'backend': [
        'Node.js', 'NodeJS', 'Node', 'Express.js', 'Express', 'Django', 'Django REST Framework',
        'FastAPI', 'Flask', 'Spring Boot', 'Spring', 'NestJS', 'ASP.NET', 'Ruby on Rails',
        'REST API', 'REST', 'RESTful', 'REST endpoints', 'GraphQL', 'gRPC', 'Microservices', 'Celery', 'WebSockets', 'JWT'
    ],
    'databases': [
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'SQLite',
        'Cassandra', 'DynamoDB', 'Firebase', 'Supabase', 'Oracle', 'MariaDB'
    ],
    'devops_cloud': [
        'Docker', 'Kubernetes', 'AWS', 'Amazon Web Services', 'GCP', 'Google Cloud',
        'Azure', 'Terraform', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'Linux',
        'Nginx', 'Apache', 'Jenkins', 'GitHub Actions', 'Ansible', 'Prometheus', 'Grafana'
    ],
    'ai_data_science': [
        'Machine Learning', 'Deep Learning', 'Data Science', 'Artificial Intelligence',
        'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
        'Natural Language Processing', 'NLP', 'Computer Vision', 'OpenCV',
        'LLM', 'Large Language Models', 'RAG', 'LangChain', 'Hugging Face', 'Transformers'
    ],
    'tools_testing': [
        'Jest', 'PyTest', 'Selenium', 'Cypress', 'Postman', 'Swagger', 'Figma',
        'Jira', 'Agile', 'Scrum', 'Trello', 'Tableau', 'Power BI'
    ],
    'soft_skills': [
        'Problem Solving', 'Communication', 'Teamwork', 'Leadership', 'Critical Thinking',
        'Time Management', 'Adaptability', 'Collaboration', 'Analytical Skills', 'Quick Learner', 'Team Player'
    ]
}

# Regex patterns for canonical multi-word & punctuation-sensitive skills
CANONICAL_SKILL_PATTERNS = [
    (r'\bnode(?:\.?js)?\b', 'Node.js', 'backend'),
    (r'\brest(?:\s*endpoints?|\s*apis?|ful(?:\s*apis?)?)?\b', 'REST API', 'backend'),
    (r'\btailwind(?:\s*css)?\b', 'Tailwind CSS', 'frontend'),
    (r'\b(mysql|postgresql|postgres|sqlite|oracle|mariadb)\b', 'SQL', 'programming_languages'),
    (r'\bmysql\b', 'MySQL', 'databases'),
    (r'\b(mongodb|mongo)\b', 'MongoDB', 'databases'),
    (r'\bgithub\b', 'Git', 'devops_cloud'),
    (r'\bgithub\b', 'GitHub', 'devops_cloud'),
    (r'\bexpress(?:\.?js)?\b', 'Express', 'backend'),
    (r'\bproblem[\s-]solving\b', 'Problem Solving', 'soft_skills'),
    (r'\bteam[\s-]player\b', 'Teamwork', 'soft_skills'),
    (r'\bquick[\s-]learner\b', 'Adaptability', 'soft_skills'),
    (r'\bjwt\b', 'JWT', 'backend'),
    (r'\bredis\b', 'Redis', 'databases'),
]

# Flattened list for quick regex matching
ALL_KNOWN_SKILLS = []
for cat, skills in SKILL_TAXONOMY.items():
    ALL_KNOWN_SKILLS.extend(skills)

EDUCATION_PATTERNS = [
    r'(?i)\b(B\.?Tech|B\.?E\.?|B\.?Sc|B\.?C\.?A|M\.?Tech|M\.?E\.?|M\.?Sc|M\.?C\.?A|MBA|Ph\.?D|Diploma|Bachelor|Master)\b[^\n\r,.]*',
    r'(?i)\b(Computer Science|Information Technology|Electronics|Mechanical|Electrical|Civil|Data Science|Artificial Intelligence)\b[^\n\r,.]*',
]


class ResumeService:
    """Production service for parsing resumes, extracting structured data, and comparing competencies."""

    def extract_text_from_pdf(self, file_path_or_bytes) -> str:
        """Extract plain text from a PDF file path or byte stream using PyMuPDF."""
        try:
            import fitz  # PyMuPDF
            if isinstance(file_path_or_bytes, (str, os.PathLike)):
                doc = fitz.open(file_path_or_bytes)
            else:
                doc = fitz.open(stream=file_path_or_bytes, filetype="pdf")

            text = []
            for page in doc:
                text.append(page.get_text())
            doc.close()
            return "\n".join(text)
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            return ""

    def extract_skills(self, text: str) -> Dict[str, List[str]]:
        """
        Extract skills grouped by categories and return a deduplicated overall list.
        Applies canonical patterns and synonyms so candidate competencies are never missed.
        """
        text_lower = f" {text.lower()} "
        found_by_category = {}
        all_found = set()

        for category, skills in SKILL_TAXONOMY.items():
            found_in_cat = []
            for skill in skills:
                # Handle single-letter C language specifically to avoid matching letter 'c'
                if skill == 'C':
                    pattern = r'(?<![A-Za-z0-9_])c(?![A-Za-z0-9_+#])'
                else:
                    escaped = re.escape(skill.lower())
                    pattern = rf'(?<!\w){escaped}(?!\w)'

                if re.search(pattern, text_lower):
                    found_in_cat.append(skill)
                    all_found.add(skill)

            if found_in_cat:
                found_by_category[category] = found_in_cat

        # Apply canonical synonym patterns to ensure modern variants & multi-word concepts are detected
        for pattern, canonical_name, category in CANONICAL_SKILL_PATTERNS:
            if re.search(pattern, text_lower):
                all_found.add(canonical_name)
                cat_list = found_by_category.setdefault(category, [])
                if canonical_name not in cat_list:
                    cat_list.append(canonical_name)

        return {
            'categorized': found_by_category,
            'skills': sorted(list(all_found))
        }

    def extract_contact_info(self, text: str) -> Dict[str, Any]:
        """Extract candidate email, phone, GitHub, and LinkedIn URLs."""
        email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
        phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        
        # Name heuristic: typically the first non-empty line of the resume
        candidate_name = ""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        for line in lines[:5]:
            if len(line) < 40 and not re.search(r'@|http|\+?\d{5,}|resume|curriculum', line, re.I):
                candidate_name = line.title()
                break

        # Social links
        github_match = re.search(r'https?://(?:www\.)?github\.com/[\w-]+', text, re.I)
        linkedin_match = re.search(r'https?://(?:www\.)?linkedin\.com/in/[\w-]+', text, re.I)

        return {
            'name': candidate_name,
            'email': email_match.group(0) if email_match else "",
            'phone': phone_match.group(0).strip() if phone_match else "",
            'github': github_match.group(0) if github_match else "",
            'linkedin': linkedin_match.group(0) if linkedin_match else "",
        }

    def extract_education(self, text: str) -> List[str]:
        """Extract education mentions (degrees, university, specialization)."""
        degrees = []
        for pattern in EDUCATION_PATTERNS:
            for match in re.finditer(pattern, text):
                matched_str = match.group(0).strip()
                if matched_str and matched_str not in degrees and len(matched_str) > 3:
                    degrees.append(matched_str)
        return degrees[:5]

    def extract_projects_and_experience(self, text: str) -> Dict[str, List[str]]:
        """Identify key project mentions or bullet points."""
        projects = []
        experience = []
        
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        current_section = None

        for line in lines:
            line_lower = line.lower()
            if any(h in line_lower for h in ['projects', 'academic projects', 'personal projects']):
                current_section = 'projects'
                continue
            elif any(h in line_lower for h in ['experience', 'work experience', 'internship', 'employment']):
                current_section = 'experience'
                continue
            elif any(h in line_lower for h in ['education', 'skills', 'certifications', 'achievements', 'awards']):
                current_section = None
                continue

            if current_section == 'projects' and len(projects) < 8:
                if len(line) > 10 and not line.startswith(('http', 'Page')):
                    projects.append(line.lstrip('•-–►* '))
            elif current_section == 'experience' and len(experience) < 8:
                if len(line) > 10 and not line.startswith(('http', 'Page')):
                    experience.append(line.lstrip('•-–►* '))

        return {
            'projects': projects[:6],
            'experience': experience[:6],
        }

    def parse_resume_content(self, raw_text: str) -> Dict[str, Any]:
        """Complete structured parsing pipeline from raw resume text, with RapidAPI AI augmentation."""
        contact = self.extract_contact_info(raw_text)
        skill_data = self.extract_skills(raw_text)
        education = self.extract_education(raw_text)
        proj_exp = self.extract_projects_and_experience(raw_text)

        # Attempt RapidAPI AI cloud parsing if key is configured
        ai_data = None
        try:
            from services.rapidapi_service import rapidapi_service
            if rapidapi_service.is_configured():
                ai_data = rapidapi_service.parse_resume_with_ai(raw_text)
        except Exception as e:
            logger.warning(f"Could not reach RapidAPI parser: {e}")

        # If RapidAPI returned enriched data, merge with high-precision local extraction
        if ai_data:
            if ai_data.get('name') and not contact.get('name'):
                contact['name'] = ai_data['name']
            if ai_data.get('email') and not contact.get('email'):
                contact['email'] = ai_data['email']
            if ai_data.get('phone') and not contact.get('phone'):
                contact['phone'] = ai_data['phone']
            if ai_data.get('education') and not education:
                education = [ai_data['education']] if isinstance(ai_data['education'], str) else ai_data['education']
            if ai_data.get('skills'):
                # Merge and deduplicate skills
                merged_skills = list(dict.fromkeys(skill_data['skills'] + ai_data['skills']))
                skill_data['skills'] = merged_skills
            if ai_data.get('projects') and not proj_exp['projects']:
                proj_exp['projects'] = ai_data['projects']

        return {
            'name': contact.get('name', ''),
            'email': contact.get('email', ''),
            'phone': contact.get('phone', ''),
            'github': contact.get('github', ''),
            'linkedin': contact.get('linkedin', ''),
            'skills': skill_data['skills'],
            'categorized_skills': skill_data['categorized'],
            'education': education,
            'projects': proj_exp['projects'],
            'experience': proj_exp['experience'],
            'raw_text_length': len(raw_text),
            'summary': f"Extracted {len(skill_data['skills'])} skills, {len(education)} education entries, and {len(proj_exp['projects'])} projects.",
            'parser_engine': 'rapidapi_ai' if ai_data else 'pymupdf_nlp',
        }


    def analyze_resume(self, file_path_or_bytes):
        """Unified resume analysis for compatibility with both endpoints."""
        text = self.extract_text_from_pdf(file_path_or_bytes)
        parsed = self.parse_resume_content(text)
        return {
            'success': True,
            'extracted_skills': parsed['skills'],
            'education': parsed['education'],
            'email': parsed['email'],
            'phone': parsed['phone'],
            'projects': parsed['projects'],
            'experience': parsed['experience'],
            'parsed_data': parsed,
        }
