import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Load only the backend environment file; secrets never enter the frontend build.
backend_env = Path(__file__).resolve().parents[1] / ".env"
if backend_env.is_file():
    for env_line in backend_env.read_text(encoding="utf-8").splitlines():
        env_line = env_line.strip()
        if env_line and not env_line.startswith("#") and "=" in env_line:
            env_name, env_value = env_line.split("=", 1)
            env_name, env_value = env_name.strip(), env_value.strip().strip("\"'")
            if env_name:
                os.environ.setdefault(env_name, env_value)

from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database
from backend.app.routers import (
    auth,
    users,
    careers,
    assessments,
    roadmaps,
    resumes,
    chatbot,
    learning,
    evidence,
    interviews,
    progress,
    insights,
)
from backend.app.services.gemini_service import GeminiUnavailableError
from backend.app.mongodb import init_mongo_indexes, setup_mongo_orm_sync, is_mongo_connected

@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("ENVIRONMENT", "development").lower() == "production":
        jwt_secret = os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET")
        if not jwt_secret or len(jwt_secret) < 32 or jwt_secret == "career-guidance-super-secret-jwt-key-2026":
            raise RuntimeError("Production requires JWT_SECRET_KEY with at least 32 characters.")
        mongo_uri = os.getenv("MONGODB_URI") or os.getenv("DATABASE_URL", "")
        if not mongo_uri.startswith(("mongodb://", "mongodb+srv://")):
            raise RuntimeError("Production requires persistent MongoDB via MONGODB_URI.")
        if not os.getenv("FRONTEND_ORIGINS"):
            raise RuntimeError("Production requires FRONTEND_ORIGINS with the deployed frontend origin.")
    # 1. Initialize Database Tables
    print(">> Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # 2. Initialize MongoDB Cloud Connection, Indexes & Real-Time Sync
    if is_mongo_connected():
        print(">> MongoDB Atlas connected. Initializing indexes and real-time ORM sync...")
        init_mongo_indexes()
        setup_mongo_orm_sync()
    else:
        print(">> Note: Running with local database fallback.")

    # 3. Seed initial career roles and learning resources
    print(">> Checking and seeding database catalog...")
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"Warning during seed: {e}")
    finally:
        db.close()
    print(">> Database initialization complete.")
    yield
    print(">> Shutting down FastAPI application...")

app = FastAPI(
    title="AI-Based Career Guidance Framework for Employability Development API",
    description="Python FastAPI backend powered by an independent career intelligence engine and SQL persistence.",
    version="2.0.0",
    lifespan=lifespan,
)


@app.exception_handler(GeminiUnavailableError)
async def gemini_unavailable_handler(request, exc: GeminiUnavailableError):
    return JSONResponse(status_code=503, content={"success": False, "message": str(exc), "code": "GEMINI_UNAVAILABLE"})

# Configure CORS
local_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
configured_origins = [origin.strip().rstrip("/") for origin in os.getenv("FRONTEND_ORIGINS", "").split(",") if origin.strip()]
origins = configured_origins or local_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(careers.router)
app.include_router(assessments.router)
app.include_router(roadmaps.router)
app.include_router(resumes.router)
app.include_router(chatbot.router)
app.include_router(learning.router)
app.include_router(evidence.router)
app.include_router(interviews.router)
app.include_router(progress.router)
app.include_router(insights.router)

@app.get("/")
def root():
    return {
        "framework": "AI-Based Career Guidance Framework for Employability Development",
        "version": "2.0.0",
        "status": "online",
        "engine": "Independent Python Career Intelligence Engine",
        "docs": "/docs",
    }

@app.get("/api/health")
def health():
    mongo_ok = is_mongo_connected()
    return {
        "status": "healthy" if mongo_ok else "degraded",
        "database": "mongodb",
        "database_connected": mongo_ok,
        "mongodb_connected": mongo_ok,
        "engine": "local_career_intelligence",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")),
    }
