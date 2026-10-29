import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, CareerProfile, LearningRoadmap, SkillEvidence, Interview, CareerInsight
from backend.app.schemas import ApiResponse
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/insights", tags=["Career Insights"])

def format_insight(insight: CareerInsight) -> dict:
    return {
        "id": insight.id,
        "userId": insight.user_id,
        "title": insight.title,
        "observation": insight.observation,
        "suggestedAction": insight.suggested_action,
        "actionRoute": insight.action_route,
        "category": insight.category,
        "isRead": insight.is_read,
        "createdAt": insight.created_at,
    }

def generate_local_insights(user_id: str, profile: CareerProfile, roadmap: LearningRoadmap = None, evidences: list = None, interviews: list = None) -> List[CareerInsight]:
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    evidences = evidences or []
    interviews = interviews or []
    completed_interviews = [i for i in interviews if i.status == "completed"]
    generated = []

    # 1. Interview Readiness Opportunity
    if len(completed_interviews) == 0:
        generated.append(CareerInsight(
            id=f"insight-interview-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            title="Interview Readiness Opportunity",
            observation="Your technical project foundation is developing, but you haven't completed a mock interview simulation yet. Practicing verbal deconstruction increases hiring confidence significantly.",
            suggested_action="Complete an Entry-Level Technical mock session in the Interview Arena.",
            action_route="/interview",
            category="interview",
            is_read=False,
            created_at=now
        ))

    # 2. Portfolio Evidence Strength
    if len(evidences) < 2:
        generated.append(CareerInsight(
            id=f"insight-evidence-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            title="Portfolio Evidence Gap",
            observation=f"Recruiters evaluate candidate credibility through verified repositories and project artifacts. You currently have {len(evidences)} verified evidence entries.",
            suggested_action="Submit verified GitHub repositories or certifications in the Skill Evidence dashboard.",
            action_route="/evidence",
            category="portfolio",
            is_read=False,
            created_at=now
        ))

    # 3. Roadmap Execution Velocity
    roadmap_progress = roadmap.overall_progress if roadmap else 0
    if roadmap_progress < 50:
        generated.append(CareerInsight(
            id=f"insight-roadmap-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            title="Milestone Completion Momentum",
            observation=f"Your targeted roadmap for {profile.current_direction or 'your career path'} is currently at {roadmap_progress}% completion.",
            suggested_action="Review Phase 2 learning milestones and check off completed technical modules.",
            action_route="/roadmap",
            category="momentum",
            is_read=False,
            created_at=now
        ))
    else:
        generated.append(CareerInsight(
            id=f"insight-readiness-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            title="Advanced Skill Specialization",
            observation=f"You have attained solid foundational milestones ({roadmap_progress}%). Transitioning into deployment, cloud, and production architecture will elevate your candidate tier.",
            suggested_action="Explore advanced system design and full-stack deployment tasks.",
            action_route="/learning",
            category="readiness",
            is_read=False,
            created_at=now
        ))

    return generated[:3]

@router.get("", response_model=ApiResponse)
def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    insights = db.query(CareerInsight).filter(CareerInsight.user_id == current_user.id).order_by(CareerInsight.created_at.desc()).all()

    if not insights:
        profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
        if profile:
            roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).first()
            evidences = db.query(SkillEvidence).filter(SkillEvidence.user_id == current_user.id).all()
            interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()

            new_insights = generate_local_insights(current_user.id, profile, roadmap, evidences, interviews)
            for ins in new_insights:
                db.add(ins)
            db.commit()
            insights = new_insights

    return ApiResponse(success=True, data=[format_insight(i) for i in insights])

@router.post("/refresh", response_model=ApiResponse)
def refresh_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).first()
    evidences = db.query(SkillEvidence).filter(SkillEvidence.user_id == current_user.id).all()
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()

    # Clear old insights and regenerate
    db.query(CareerInsight).filter(CareerInsight.user_id == current_user.id).delete()
    new_insights = generate_local_insights(current_user.id, profile, roadmap, evidences, interviews)
    for ins in new_insights:
        db.add(ins)
    db.commit()

    return ApiResponse(success=True, data=[format_insight(i) for i in new_insights], message="Insights refreshed successfully.")

@router.patch("/{id}/read", response_model=ApiResponse)
def mark_insight_read(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    insight = db.query(CareerInsight).filter(
        CareerInsight.id == id,
        CareerInsight.user_id == current_user.id
    ).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found.")

    insight.is_read = True
    db.commit()
    db.refresh(insight)

    return ApiResponse(success=True, data=format_insight(insight))
