# SkillBridge

## Academia–Industry Collaboration Portal for Skill Mapping, Internships and Placement

SkillBridge connects students, universities, faculty, training & placement officers (TPOs), and companies through intelligent skill mapping, skill gap analysis, internships, placements, industry projects, and career recommendations.

---

## 🎨 Brand Identity

SkillBridge uses the **Forest & Ivory** colour palette — a premium, editorial design language.

| Colour | Hex | Usage |
|---|---|---|
| Deep Forest Green | `#142C27` | Primary backgrounds, navigation |
| Dark Olive | `#203B33` | Secondary sections |
| Warm Ivory | `#F5F0E6` | Page backgrounds, typography |
| Terracotta | `#D97745` | CTA buttons, highlights |
| Sage Green | `#A8B9A5` | Accents, progress indicators |
| Pure White | `#FFFFFF` | Cards, content areas |
| Charcoal | `#202722` | Body text |
| Muted Sage Grey | `#87948A` | Subtle text, borders |
| Warm Border | `#DDDCD2` | Dividers, borders |

---

## 🛠 Technology Stack

### Frontend
- React.js + Vite
- JavaScript (no TypeScript)
- Tailwind CSS
- React Router DOM
- Axios
- GSAP + ScrollTrigger
- Three.js / React Three Fiber / Drei
- Framer Motion
- Recharts
- Lucide React
- React Hook Form + Zod

### Backend
- Python + Django
- Django REST Framework
- PyMongo (MongoDB driver)
- JWT Authentication
- Celery + Redis
- Pillow
- PyMuPDF
- Swagger/OpenAPI

### Database
- **MongoDB** (primary and only application database)
- Redis (caching & task queue)

---

## 📁 Project Structure

```
skillbridge/
├── frontend/          # React + Vite application
├── backend/           # Django REST API
├── docs/              # Documentation
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 6+
- Redis (optional, for Celery)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Edit with your settings
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` in the backend directory and configure:
- `MONGODB_URI` — MongoDB connection string
- `MONGODB_NAME` — Database name
- `SECRET_KEY` — Django secret key
- `JWT_SECRET_KEY` — JWT signing key
- `CORS_ALLOWED_ORIGINS` — Frontend URL

---

## 👥 User Roles

1. **Student** — Skill profiles, gap analysis, opportunities, applications
2. **Company/Recruiter** — Job postings, candidate discovery, interviews
3. **Faculty** — Student monitoring, department analytics
4. **TPO** — Placement management, analytics, drives
5. **Super Admin** — Platform management, verification, moderation

---

## 🔑 Key Features

- ✅ Intelligent skill mapping & taxonomy
- ✅ AI-assisted skill gap analysis
- ✅ Explainable job matching engine
- ✅ Resume analyzer (PDF extraction)
- ✅ Internship & placement management
- ✅ Industry-academia collaboration marketplace
- ✅ Employability readiness analytics
- ✅ Real-time notifications
- ✅ Role-based dashboards
- ✅ Interactive 3D visualizations

---

## 📄 API Documentation

API docs available at: `http://localhost:8000/api/docs/`

Base API path: `/api/v1/`

---

## 📝 License

MIT License
