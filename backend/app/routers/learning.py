import re
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import LearningResource, User, CareerProfile, CareerRole
from backend.app.schemas import ApiResponse
from backend.app.auth import get_current_user
from backend.app.services.gemini_service import call_gemini_structured

router = APIRouter(prefix="/api/learning", tags=["Learning Hub"])

def format_resource(r: LearningResource) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "provider": r.provider,
        "url": r.url,
        "category": r.category,
        "difficulty": r.difficulty,
        "estimatedDuration": r.estimated_duration,
        "resourceType": r.resource_type,
        "relatedSkills": r.related_skills or [],
        "isVerified": r.is_verified,
    }

@router.get("/resources", response_model=ApiResponse)
def get_resources(
    category: str = Query(None),
    difficulty: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(LearningResource)
    if category and category != "All":
        query = query.filter(LearningResource.category.ilike(category))
    if difficulty and difficulty != "All":
        query = query.filter(LearningResource.difficulty.ilike(difficulty))
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            (LearningResource.title.ilike(s)) | (LearningResource.provider.ilike(s))
        )

    items = query.all()
    return ApiResponse(success=True, data=[format_resource(r) for r in items])

@router.get("/resources/{id}", response_model=ApiResponse)
def get_resource_by_id(id: str, db: Session = Depends(get_db)):
    res = db.query(LearningResource).filter(LearningResource.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Learning resource not found.")
    return ApiResponse(success=True, data=format_resource(res))


@router.post("/projects/generate", response_model=ApiResponse)
async def generate_role_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding first.")
    role_name = profile.current_direction or "Software Developer"
    career = db.query(CareerRole).filter(
        (CareerRole.title.ilike(role_name)) | (CareerRole.id == role_name) | (CareerRole.slug == role_name)
    ).first() or db.query(CareerRole).first()
    if not career:
        raise HTTPException(status_code=404, detail="No career role is available for project recommendations.")

    schema = {
        "type": "OBJECT", "required": ["projects"], "properties": {
            "projects": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
                "title": {"type": "STRING"}, "difficulty": {"type": "STRING"}, "skills": {"type": "ARRAY", "items": {"type": "STRING"}},
                "description": {"type": "STRING"}, "deliverables": {"type": "ARRAY", "items": {"type": "STRING"}},
            }}}
        }
    }
    prompt = (
        "Recommend 10 to 15 distinct, realistic portfolio projects for the candidate's target job role. "
        "Progress from beginner to advanced, match projects to actual role skills, and make each project buildable by an individual. "
        "Include a concise project description, relevant technology skills, and 2-4 demonstrable deliverables. "
        "Avoid claiming that projects guarantee employment. Return exactly 12 projects. "
        f"Target role: {career.title}. Required skills: {career.core_technical_skills or []}. "
        f"Candidate's existing skills: {profile.technical_skills or []}."
    )
    result = await call_gemini_structured(prompt, schema)
    projects = result.get("projects")
    if not isinstance(projects, list) or not 10 <= len(projects) <= 15:
        raise HTTPException(status_code=502, detail="AI returned an invalid number of project recommendations. Please refresh.")
    for project in projects:
        project["id"] = re.sub(r"[^a-z0-9]+", "-", project.get("title", "project").lower()).strip("-")
        project["difficulty"] = project.get("difficulty", "Intermediate").title()
    return ApiResponse(success=True, data={"careerTitle": career.title, "projects": projects})
