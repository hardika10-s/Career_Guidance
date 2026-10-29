import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import (
    User, CareerProfile, CareerRole, LearningRoadmap, CareerAnalysis,
    ProgressTimeline, CareerInsight, SkillEvidence, Interview, Assessment
)
from backend.app.schemas import (
    OnboardingRequest, ProfileUpdateRequest, TargetCareerRequest, ApiResponse
)
from backend.app.auth import get_current_user
from backend.app.services.employability import calculate_employability
from backend.app.services.career_engine import calculate_career_recommendations
from backend.app.services.roadmap_generator import generate_personalized_roadmap

router = APIRouter(prefix="/api/profile", tags=["Profile & Onboarding"])

def format_profile_dict(profile: CareerProfile) -> dict:
    return {
        "id": profile.id,
        "userId": profile.user_id,
        "education": profile.education or {},
        "technicalSkills": profile.technical_skills or [],
        "softSkills": profile.soft_skills or [],
        "interests": profile.interests or [],
        "experience": profile.experience or {},
        "careerGoals": profile.career_goals or {},
        "workPreferences": profile.work_preferences or {},
        "readinessScore": profile.readiness_score,
        "readinessBreakdown": profile.readiness_breakdown or {},
        "currentDirection": profile.current_direction,
        "matchPercentage": profile.match_percentage,
        "directionExplanation": profile.direction_explanation,
        "biggestOpportunity": profile.biggest_opportunity,
        "nextBestAction": profile.next_best_action,
        "createdAt": profile.created_at,
        "updatedAt": profile.updated_at,
    }

@router.get("", response_model=ApiResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile has not been created yet.")
    return ApiResponse(success=True, data=format_profile_dict(profile))

@router.post("/onboarding", response_model=ApiResponse)
def submit_onboarding(req: OnboardingRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id

    # Collect existing assessment/evidences/interviews if any
    assessment = db.query(Assessment).filter(Assessment.user_id == user_id).first()
    evidences = [e.__dict__ for e in db.query(SkillEvidence).filter(SkillEvidence.user_id == user_id).all()]
    interviews = [i.__dict__ for i in db.query(Interview).filter(Interview.user_id == user_id).all()]

    req_dict = req.model_dump()
    scored = calculate_employability(req_dict, assessment.__dict__ if assessment else None, evidences, interviews)

    desired_role = (req.careerGoals.desiredRole if req.careerGoals else None) or "Software Developer"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    existing_profile = db.query(CareerProfile).filter(CareerProfile.user_id == user_id).first()
    if existing_profile:
        profile = existing_profile
        profile.education = req_dict["education"]
        profile.technical_skills = req_dict["technicalSkills"]
        profile.soft_skills = req_dict["softSkills"]
        profile.interests = req_dict["interests"]
        profile.experience = req_dict.get("experience") or {}
        profile.career_goals = req_dict.get("careerGoals") or {}
        profile.work_preferences = req_dict.get("workPreferences") or {}
        profile.readiness_score = scored["readinessScore"]
        profile.readiness_breakdown = scored["readinessBreakdown"]
        profile.current_direction = desired_role
        profile.match_percentage = min(94, max(68, scored["readinessScore"] + 10))
        profile.direction_explanation = f"Your academic profile in {req.education.degree} ({req.education.department}) and technical skills establish a solid foundation for {desired_role}."
        profile.biggest_opportunity = scored["biggestOpportunity"]
        profile.next_best_action = scored["nextBestAction"]
        profile.updated_at = now
    else:
        profile = CareerProfile(
            id="prof_" + uuid.uuid4().hex[:10],
            user_id=user_id,
            education=req_dict["education"],
            technical_skills=req_dict["technicalSkills"],
            soft_skills=req_dict["softSkills"],
            interests=req_dict["interests"],
            experience=req_dict.get("experience") or {},
            career_goals=req_dict.get("careerGoals") or {},
            work_preferences=req_dict.get("workPreferences") or {},
            readiness_score=scored["readinessScore"],
            readiness_breakdown=scored["readinessBreakdown"],
            current_direction=desired_role,
            match_percentage=min(94, max(68, scored["readinessScore"] + 10)),
            direction_explanation=f"Your academic profile in {req.education.degree} ({req.education.department}) and technical skills establish a solid foundation for {desired_role}.",
            biggest_opportunity=scored["biggestOpportunity"],
            next_best_action=scored["nextBestAction"],
            created_at=now,
            updated_at=now,
        )
        db.add(profile)

    current_user.is_onboarded = True
    current_user.target_career_id = desired_role

    # Generate initial roadmap
    target_role_row = db.query(CareerRole).filter(
        (CareerRole.title.ilike(desired_role)) | (CareerRole.id == desired_role) | (CareerRole.slug == desired_role)
    ).first()
    if not target_role_row:
        target_role_row = db.query(CareerRole).first()

    catalog = [c.__dict__ for c in db.query(CareerRole).all()]

    if target_role_row:
        phases = generate_personalized_roadmap(req_dict, target_role_row.__dict__)
        roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == user_id).first()
        if roadmap:
            roadmap.target_career_id = target_role_row.id
            roadmap.target_career_title = target_role_row.title
            roadmap.phases = phases
            roadmap.overall_progress = 10
            roadmap.updated_at = now
        else:
            roadmap = LearningRoadmap(
                id="rdm_" + uuid.uuid4().hex[:10],
                user_id=user_id,
                target_career_id=target_role_row.id,
                target_career_title=target_role_row.title,
                phases=phases,
                overall_progress=10,
                generated_at=now,
                updated_at=now,
            )
            db.add(roadmap)

    # Initial career analysis record
    recs = calculate_career_recommendations(req_dict, assessment.__dict__ if assessment else None, catalog)
    analysis = CareerAnalysis(
        id="ca_" + uuid.uuid4().hex[:10],
        user_id=user_id,
        analysis_date=now,
        recommended_roles=[{"careerId": r["careerId"], "title": r["title"], "matchPercentage": r["matchPercentage"]} for r in recs],
        readiness_score=scored["readinessScore"],
        target_role=desired_role,
    )
    db.add(analysis)

    # Timeline event
    db.add(ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=user_id,
        type="skill",
        title="Career Profile Created",
        description=f"Completed profile setup with target focus in {desired_role}.",
        timestamp=now
    ))

    # Initial actionable insights
    if not db.query(CareerInsight).filter(CareerInsight.user_id == user_id).first():
        db.add(CareerInsight(
            id="ins_" + uuid.uuid4().hex[:10],
            user_id=user_id,
            title="Roadmap Initialized",
            observation=f"Personalized roadmap established for {desired_role}.",
            suggested_action="Review Phase 1 fundamentals in your Personalized Roadmap.",
            action_route="/roadmap",
            category="momentum",
            is_read=False,
            created_at=now
        ))

    db.commit()
    db.refresh(profile)

    return ApiResponse(success=True, data=format_profile_dict(profile), message="Career profile created successfully.")

@router.put("", response_model=ApiResponse)
def update_profile(req: ProfileUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding first.")

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    req_dict = req.model_dump(exclude_unset=True)

    if "education" in req_dict and req_dict["education"] is not None:
        profile.education = req_dict["education"]
    if "technicalSkills" in req_dict and req_dict["technicalSkills"] is not None:
        profile.technical_skills = req_dict["technicalSkills"]
    if "softSkills" in req_dict and req_dict["softSkills"] is not None:
        profile.soft_skills = req_dict["softSkills"]
    if "interests" in req_dict and req_dict["interests"] is not None:
        profile.interests = req_dict["interests"]
    if "experience" in req_dict and req_dict["experience"] is not None:
        profile.experience = req_dict["experience"]
    if "careerGoals" in req_dict and req_dict["careerGoals"] is not None:
        profile.career_goals = req_dict["careerGoals"]
    if "workPreferences" in req_dict and req_dict["workPreferences"] is not None:
        profile.work_preferences = req_dict["workPreferences"]

    # Recalculate employability
    prof_dict = format_profile_dict(profile)
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    evidences = [e.__dict__ for e in db.query(SkillEvidence).filter(SkillEvidence.user_id == current_user.id).all()]
    interviews = [i.__dict__ for i in db.query(Interview).filter(Interview.user_id == current_user.id).all()]

    scored = calculate_employability(prof_dict, assessment.__dict__ if assessment else None, evidences, interviews)
    profile.readiness_score = scored["readinessScore"]
    profile.readiness_breakdown = scored["readinessBreakdown"]
    profile.biggest_opportunity = scored["biggestOpportunity"]
    profile.next_best_action = scored["nextBestAction"]
    profile.updated_at = now

    db.add(ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=current_user.id,
        type="skill",
        title="Profile Updated",
        description="Updated skills or preferences. Readiness score refreshed.",
        timestamp=now
    ))

    db.commit()
    db.refresh(profile)
    return ApiResponse(success=True, data=format_profile_dict(profile), message="Profile updated successfully.")

@router.post("/target-career", response_model=ApiResponse)
def set_target_career(req: TargetCareerRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    career = db.query(CareerRole).filter(
        (CareerRole.id == req.careerId) | (CareerRole.slug == req.careerId) | (CareerRole.title.ilike(req.careerId))
    ).first()
    if not career:
        raise HTTPException(status_code=404, detail="Target career role not found.")

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    profile.current_direction = career.title
    goals = profile.career_goals or {}
    goals["desiredRole"] = career.title
    profile.career_goals = goals
    profile.updated_at = now

    current_user.target_career_id = career.id

    # Regenerate roadmap
    phases = generate_personalized_roadmap(format_profile_dict(profile), career.__dict__)
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).first()
    if roadmap:
        roadmap.target_career_id = career.id
        roadmap.target_career_title = career.title
        roadmap.phases = phases
        roadmap.overall_progress = 10
        roadmap.updated_at = now
    else:
        roadmap = LearningRoadmap(
            id="rdm_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            target_career_id=career.id,
            target_career_title=career.title,
            phases=phases,
            overall_progress=10,
            generated_at=now,
            updated_at=now,
        )
        db.add(roadmap)

    db.add(ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=current_user.id,
        type="roadmap",
        title="Target Career Changed",
        description=f"Target career set to {career.title}. Roadmap adjusted.",
        timestamp=now
    ))

    db.commit()
    db.refresh(profile)
    return ApiResponse(success=True, data=format_profile_dict(profile), message=f"Target career set to {career.title}.")
