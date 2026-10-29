# AI-Based Career Guidance Framework - Python FastAPI Backend

## Architecture Overview
This backend replaces the legacy Node.js server with a high-performance **Python FastAPI** service, powered by:
- **Independent Career Intelligence Engine (Python)**: Zero-external-dependency algorithms for career recommendations, skill-gap analysis, employability scoring, learning roadmap generation, assessment evaluation, and resume parsing.
- **Relational Persistence**: SQLite database via SQLAlchemy with automatic migrations and schema generation (`career_guidance.db`).
- **Idempotent Database Seeding**: Pre-populates 15 comprehensive industry career roles and 14 verified learning resources.
- **Optional Gemini Integration**: Google GenAI integration exclusively for the conversational career advisor chatbot, with an automatic deterministic local fallback when `GEMINI_API_KEY` is omitted or quota is exceeded.

## Directory Structure
```
backend/
├── app/
│   ├── database.py           # SQLite engine, SessionLocal, Base ORM
│   ├── models.py             # SQLAlchemy models (User, CareerProfile, CareerRole, Assessment, etc.)
│   ├── schemas.py            # Pydantic v2 schemas and ApiResponse standard envelope
│   ├── auth.py               # Bcrypt password hashing & PyJWT token handling
│   ├── seed.py               # Idempotent database seeder (15 roles, 14 verified resources)
│   ├── main.py               # FastAPI application, CORS middleware, lifespan initialization
│   ├── services/
│   │   ├── career_engine.py      # Multi-factor explainable recommendation algorithm
│   │   ├── skill_gap.py          # 4-tier competency diagnostic & resource mapping
│   │   ├── employability.py      # 6-factor deterministic readiness scoring
│   │   ├── roadmap_generator.py  # 5-phase career progression roadmap synthesizer
│   │   ├── resume_analyzer.py    # ATS section parsing & metric bullet rewriting
│   │   ├── gemini_service.py     # Gemini client + graceful local advisor fallback
│   │   └── assessment_questions.py # 12 multi-option assessment questions
│   └── routers/
│       ├── auth.py           # /api/auth (register, login, me, password, account)
│       ├── users.py          # /api/profile (onboarding, profile update, target career)
│       ├── careers.py        # /api/careers (catalog, recommendations, compare, gap-analysis)
│       ├── assessments.py    # /api/assessment (questions, current, save-progress, submit)
│       ├── roadmaps.py       # /api/roadmap (get, generate, task toggle)
│       ├── resumes.py        # /api/resume (analyze, history, detail)
│       ├── chatbot.py        # /api/chat (message, history)
│       ├── learning.py       # /api/learning (resources catalog)
│       ├── evidence.py       # /api/evidence (CRUD for verified skill proofs)
│       ├── interviews.py     # /api/interviews (mock interview generation & grading)
│       ├── progress.py       # /api/progress (timeline milestones & readiness breakdown)
│       └── insights.py       # /api/insights (contextual action triggers & refresh)
├── tests/
│   └── test_api_suite.py     # 17-step end-to-end integration test suite
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
└── .env                      # Local environment configuration
```

## Setup & Running

### 1. Activate Virtual Environment
```powershell
# Windows
.\backend\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies (if not already installed)
```powershell
python -m pip install -r backend/requirements.txt
```

### 3. Run FastAPI Backend
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 4. Run Integration Tests
```powershell
python backend/tests/test_api_suite.py
```
All 17 integration verification steps execute against the live SQLite test database.
