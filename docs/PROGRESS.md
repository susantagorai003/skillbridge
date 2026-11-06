# SkillBridge — Development Progress & Architecture Report

## Status Overview

| Component | Status | Details |
|---|---|---|
| **Database** | ✅ **Active** | **MongoDB Atlas** (`cluster0.m019mtj.mongodb.net`, database: `skillbridge`) |
| **Backend API** | ✅ **Active** | Django 4.2 + DRF + PyMongo (`http://127.0.0.1:8000/api/v1/`) |
| **Frontend** | ✅ **Active** | React + Vite + Tailwind v4 + GSAP + Three.js (`http://localhost:5173/`) |
| **Authentication** | ✅ **Verified** | Custom JWT compatible with MongoDB (`/api/v1/auth/`) |
| **Core Skill Engine** | ✅ **Verified** | 52 taxonomy skills, 10 job roles, explainable gap engine |
| **Matching Engine** | ✅ **Verified** | Weighted algorithmic scoring (100% test coverage) |
| **Recruitment Portal** | ✅ **Verified** | Internships, candidate discovery, multi-stage lifecycle |
| **Test Suite** | ✅ **100% Passed** | 5/5 End-to-End backend test cases verified live on Atlas |

---

## Live MongoDB Atlas Connection

- **Cluster**: `cluster0.m019mtj.mongodb.net`
- **Database**: `skillbridge`
- **Username**: `sksusanta18_db_user`
- **Collections Active**:
  1. `users` (Admin, Student, Company, Faculty, TPO)
  2. `student_profiles`
  3. `companies`
  4. `universities`
  5. `departments`
  6. `skills` (52 skills)
  7. `skill_categories` (12 categories)
  8. `student_skills`
  9. `job_roles` (10 roles)
  10. `job_role_skills`
  11. `opportunities`
  12. `applications`
  13. `assessments` & `assessment_results`
  14. `notifications`
  15. `collaboration_requests`
  16. `industry_projects`
  17. `placement_records`

---

## Verified Demo Credentials

| Role | Email | Password | Access Path |
|---|---|---|---|
| **Student** | `rahul@student.com` | `student12345` | `/student` |
| **Company** | `recruiter@techcorp.com` | `company12345` | `/company` |
| **Admin** | `admin@skillbridge.com` | `admin12345` | `/admin` |

---

## Server URLs

- **Frontend Application**: `http://localhost:5173/`
- **Backend API**: `http://127.0.0.1:8000/api/v1/`
- **Swagger / OpenAPI Documentation**: `http://127.0.0.1:8000/api/docs/`
