import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, CareerProfile, CareerRole, Assessment, CareerAnalysis, LearningResource
from backend.app.schemas import ApiResponse
from backend.app.auth import get_current_user
from backend.app.services.career_engine import calculate_career_recommendations
from backend.app.services.skill_gap import calculate_skill_gap

router = APIRouter(prefix="/api/careers", tags=["Careers & Recommendations"])

def format_role(role: CareerRole) -> dict:
    return {
        "id": role.id,
        "title": role.title,
        "slug": role.slug,
        "category": role.category,
        "description": role.description,
        "whatTheyDo": role.what_they_do or [],
        "coreTechnicalSkills": role.core_technical_skills or [],
        "softSkills": role.soft_skills or [],
        "commonTools": role.common_tools or [],
        "entryLevelExpectations": role.entry_level_expectations or [],
        "suggestedProjects": role.suggested_projects or [],
        "careerProgression": role.career_progression or [],
        "relatedCareers": role.related_careers or [],
    }

@router.get("/catalog", response_model=ApiResponse)
def get_catalog(db: Session = Depends(get_db)):
    roles = db.query(CareerRole).all()
    return ApiResponse(success=True, data=[format_role(r) for r in roles])

@router.get("/catalog/{id}", response_model=ApiResponse)
def get_role_by_id(id: str, db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(
        (CareerRole.id == id) | (CareerRole.slug == id) | (CareerRole.title.ilike(id))
    ).first()
    if not role:
        raise HTTPException(status_code=404, detail="Career role not found.")
    return ApiResponse(success=True, data=format_role(role))

@router.get("/catalog/{id}/compare", response_model=ApiResponse)
def compare_role(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(
        (CareerRole.id == id) | (CareerRole.slug == id) | (CareerRole.title.ilike(id))
    ).first()
    if not role:
        raise HTTPException(status_code=404, detail="Career role not found.")

    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding first.")

    resources = [resource.__dict__ for resource in db.query(LearningResource).all()]
    gap = calculate_skill_gap(profile.__dict__, role.__dict__, resources)

    return ApiResponse(success=True, data={
        "career": format_role(role),
        "profileSkills": profile.technical_skills or [],
        "gapAnalysis": gap,
        "readinessScore": profile.readiness_score,
    })

@router.get("/recommendations", response_model=ApiResponse)
def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        return ApiResponse(success=True, data=[])

    latest = db.query(CareerAnalysis).filter(CareerAnalysis.user_id == current_user.id).order_by(CareerAnalysis.analysis_date.desc()).first()
    saved = latest.recommended_roles or [] if latest else []
    if latest and latest.target_role == profile.current_direction and saved and saved[0].get("source") == "python":
        recs = [{k: v for k, v in row.items() if k != "source"} for row in saved]
    else:
        assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
        catalog = [role.__dict__ for role in db.query(CareerRole).all()]
        recs = calculate_career_recommendations(profile.__dict__, assessment.__dict__ if assessment else None, catalog)
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        db.add(CareerAnalysis(
            id="ca_" + uuid.uuid4().hex[:10], user_id=current_user.id, analysis_date=now,
            recommended_roles=[{"source": "python", **row} for row in recs],
            readiness_score=profile.readiness_score, target_role=profile.current_direction,
        ))
        db.commit()
    return ApiResponse(success=True, data=recs)

@router.post("/recommendations/recalculate", response_model=ApiResponse)
def recalculate_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    catalog = [role.__dict__ for role in db.query(CareerRole).all()]
    recs = calculate_career_recommendations(profile.__dict__, assessment.__dict__ if assessment else None, catalog)

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    analysis = CareerAnalysis(
        id="ca_" + uuid.uuid4().hex[:10],
        user_id=current_user.id,
        analysis_date=now,
        recommended_roles=[{"source": "python", **r} for r in recs],
        readiness_score=profile.readiness_score,
        target_role=profile.current_direction,
    )
    db.add(analysis)
    db.commit()

    return ApiResponse(success=True, data=recs, message="Recommendations recalculated.")

@router.get("/gap-analysis", response_model=ApiResponse)
def get_gap_analysis(
    role: str = Query(None),
    fresh: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding first.")

    target_name = role or profile.current_direction or "Software Developer"
    career = db.query(CareerRole).filter(
        (CareerRole.title.ilike(target_name)) | (CareerRole.id == target_name) | (CareerRole.slug == target_name)
    ).first()
    if not career:
        career = db.query(CareerRole).first()
    if not career:
        raise HTTPException(status_code=404, detail="No career roles are available in the catalog.")

    resources = [resource.__dict__ for resource in db.query(LearningResource).all()]
    gap = calculate_skill_gap(profile.__dict__, career.__dict__, resources)
    return ApiResponse(success=True, data=gap)
