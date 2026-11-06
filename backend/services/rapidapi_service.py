"""
RapidAPI Integration Service for SkillBridge.
Provides cloud-powered CV parsing and AI-driven Skill Gap Analysis using RapidAPI endpoints.
Includes graceful error handling and local fallback if API limits or network blocks occur.
"""
import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class RapidAPIService:
    """Service to interact with RapidAPI for Resume Parsing and Skill Gap Analysis."""

    def __init__(self):
        self.api_key = os.environ.get('RAPIDAPI_KEY', '48efeb9953msh77f362c12e4d4b8p1e7ebejsnd071a475693a').strip()
        self.llm_host = os.environ.get('RAPIDAPI_LLM_HOST', 'cheapest-gpt-4-turbo-gpt-4-chatgpt.p.rapidapi.com').strip()
        self.resume_host = os.environ.get('RAPIDAPI_RESUME_HOST', 'ai-resume-parser.p.rapidapi.com').strip()

    def is_configured(self) -> bool:
        """Check if a valid RapidAPI key is set."""
        return bool(self.api_key and len(self.api_key) > 10)

    def parse_resume_with_ai(self, resume_text: str) -> Optional[Dict[str, Any]]:
        """
        Parse resume text using RapidAPI AI endpoint.
        Extracts personal info, skills, education, experience, and projects.
        """
        if not self.is_configured() or not resume_text:
            return None

        prompt = (
            "You are a professional HR Resume Parser. Analyze the following resume text and output ONLY valid JSON "
            "with this exact structure:\n"
            "{\n"
            '  "name": "Candidate Full Name or empty",\n'
            '  "email": "candidate@example.com or empty",\n'
            '  "phone": "Phone number or empty",\n'
            '  "education": "Degree, Major, University or empty",\n'
            '  "skills": ["Skill1", "Skill2", "Skill3"],\n'
            '  "skills_by_category": {\n'
            '    "programming_languages": [],\n'
            '    "frontend": [],\n'
            '    "backend": [],\n'
            '    "databases": [],\n'
            '    "devops_cloud": [],\n'
            '    "ai_data_science": [],\n'
            '    "tools_testing": []\n'
            "  },\n"
            '  "experience_years": 0,\n'
            '  "projects": ["Project 1 summary", "Project 2 summary"]\n'
            "}\n\n"
            f"Resume Text:\n{resume_text[:4000]}"
        )

        try:
            response_text = self._call_rapidapi_chat(prompt)
            if not response_text:
                return None

            # Clean JSON from response text (remove markdown ```json ... ``` wrappers)
            clean_json = self._extract_json_block(response_text)
            data = json.loads(clean_json)
            logger.info("Successfully parsed resume via RapidAPI AI")
            return data
        except Exception as e:
            logger.warning(f"RapidAPI Resume Parsing failed or unreachable: {e}. Falling back to local NLP.")
            return None

    def analyze_skill_gap_with_ai(
        self,
        candidate_skills: List[str],
        target_role: str,
        job_description: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Analyze skill gaps against target role / job description using RapidAPI AI.
        Returns match score, missing skills with priority, learning roadmap, and interview prep.
        """
        if not self.is_configured():
            return None

        skills_str = ", ".join(candidate_skills)
        jd_context = f"\nSpecific Job Description:\n{job_description[:2000]}" if job_description else ""

        prompt = (
            f"You are an expert AI Technical Career Coach and Placement Officer.\n"
            f"Perform a comprehensive skill gap analysis for a candidate applying for the role: '{target_role}'.\n"
            f"Candidate Extracted Skills: [{skills_str}]\n"
            f"{jd_context}\n\n"
            "Respond ONLY with a valid JSON object formatted as follows:\n"
            "{\n"
            '  "match_score": 75,\n'
            '  "role_readiness_level": "Intermediate",\n'
            '  "matching_skills": ["Skill1", "Skill2"],\n'
            '  "missing_skills": [\n'
            '    {"name": "SkillName", "priority": "high", "category": "backend", "reason": "Essential for role"},\n'
            '    {"name": "SkillName2", "priority": "medium", "category": "devops_cloud", "reason": "Preferred by top firms"}\n'
            '  ],\n'
            '  "summary": "Brief 2-sentence executive summary of the candidate readiness.",\n'
            '  "strengths": ["Strength 1", "Strength 2"],\n'
            '  "roadmap": [\n'
            '    {\n'
            '      "phase": 1,\n'
            '      "title": "Phase 1: Core Fundamentals",\n'
            '      "duration": "2 Weeks",\n'
            '      "topics": ["Topic A", "Topic B"],\n'
            '      "assignments": ["Build X feature with tests"],\n'
            '      "resources": [{"title": "Official Docs", "type": "Documentation"}]\n'
            '    }\n'
            '  ],\n'
            '  "interview_questions": [\n'
            '    "Technical interview question 1 relating to missing or core skills",\n'
            '    "Technical interview question 2",\n'
            '    "Technical interview question 3",\n'
            '    "Technical interview question 4",\n'
            '    "Technical interview question 5"\n'
            '  ]\n'
            "}"
        )

        try:
            response_text = self._call_rapidapi_chat(prompt)
            if not response_text:
                return None

            clean_json = self._extract_json_block(response_text)
            data = json.loads(clean_json)
            logger.info(f"Successfully generated skill gap analysis via RapidAPI for role: {target_role}")
            return data
        except Exception as e:
            logger.warning(f"RapidAPI Skill Gap Analysis failed or unreachable: {e}. Falling back to benchmark heuristics.")
            return None

    def _call_rapidapi_chat(self, user_prompt: str) -> Optional[str]:
        """Call RapidAPI ChatGPT/LLM endpoint with fast timeout, SSL resilience, and error handling."""
        import ssl

        payload = {
            "messages": [
                {"role": "system", "content": "You are a professional AI Career & Technical Assessment Engine. Always respond in valid JSON only."},
                {"role": "user", "content": user_prompt}
            ],
            "model": "gpt-4o-mini",
            "temperature": 0.3,
            "max_tokens": 1500
        }

        url = f"https://{self.llm_host}/v1/chat/completions"
        headers = {
            "content-type": "application/json",
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": self.llm_host,
            "User-Agent": "SkillBridge-Platform/1.0"
        }

        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, context=ctx, timeout=3.5) as response:
                if response.status == 200:
                    res_body = response.read().decode('utf-8')
                    res_json = json.loads(res_body)
                    choices = res_json.get('choices', [])
                    if choices and 'message' in choices[0]:
                        return choices[0]['message'].get('content', '')
                    elif 'result' in res_json:
                        return res_json['result']
                    elif 'response' in res_json:
                        return res_json['response']
                    return res_body
                return None
        except Exception as e:
            logger.debug(f"RapidAPI request skipped: {e}")
            return None

    def _extract_json_block(self, text: str) -> str:
        """Strip markdown code fence wrappers from JSON string."""
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip().startswith("```"):
                lines = lines[:-1]
            return "\n".join(lines).strip()
        return text


# Global Singleton
rapidapi_service = RapidAPIService()
