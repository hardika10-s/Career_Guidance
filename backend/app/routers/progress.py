import uuid
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, CareerProfile, LearningRoadmap, SkillEvidence, Interview, ProgressTimeline, Assessment
from backend.app.schemas import ApiResponse
from backend.app.auth import get_current_user
from backend.app.services.employability import calculate_employability

router = APIRouter(prefix="/api/progress", tags=["Progress & Employability"])

def format_timeline_event(event: ProgressTimeline) -> dict:
    return {
        "id": event.id,
        "userId": event.user_id,
        "type": event.type,
        "title": event.title,
        "description": event.description,
        "timestamp": event.timestamp,
        "meta": event.meta or {},
    }

@router.get("/timeline", response_model=ApiResponse)
def get_timeline(
    type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ProgressTimeline).filter(ProgressTimeline.user_id == current_user.id)
    if type and type != "all":
        query = query.filter(ProgressTimeline.type == type)

    events = query.order_by(ProgressTimeline.timestamp.desc()).all()

    # If timeline is empty, generate initial milestones based on user state
    if not events:
        profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
        initial_events = []
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        account_event = ProgressTimeline(
            id="evt_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            type="profile",
            title="Account Created & Profile Setup",
            description=f"Welcome to the AI Career Guidance Framework! Profile initiated.",
            timestamp=current_user.created_at or now,
            meta={"category": "account"}
        )
        db.add(account_event)
        initial_events.append(account_event)

        if profile and profile.current_direction:
            career_event = ProgressTimeline(
                id="evt_" + uuid.uuid4().hex[:10],
                user_id=current_user.id,
                type="career",
                title=f"Target Career Selected: {profile.current_direction}",
                description=f"Calibrated career path for {profile.current_direction} with {profile.match_percentage}% initial alignment.",
                timestamp=profile.updated_at or now,
                meta={"career": profile.current_direction}
            )
            db.add(career_event)
            initial_events.append(career_event)

        db.commit()
        events = initial_events

    return ApiResponse(success=True, data=[format_timeline_event(e) for e in events])

@router.get("/employability", response_model=ApiResponse)
def get_employability_readiness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding first.")

    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).first()
    evidences = db.query(SkillEvidence).filter(SkillEvidence.user_id == current_user.id).all()
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    completed_interviews = [i for i in interviews if i.status == "completed"]

    evidences_dicts = [e.__dict__ for e in evidences]
    interviews_dicts = [i.__dict__ for i in interviews]
    assessment_dict = assessment.__dict__ if assessment else None

    profile_dict = {
        "technical_skills": profile.technical_skills or [],
        "soft_skills": profile.soft_skills or [],
        "experience": profile.experience or {},
    }

    scored = calculate_employability(profile_dict, assessment_dict, evidences_dicts, interviews_dicts)

    overall_score = profile.readiness_score or scored["readinessScore"] or 70
    career_title = profile.current_direction or "Software Developer"
    direction_match = profile.match_percentage or 80

    if overall_score >= 85:
        tier = "Job-Ready Candidate"
    elif overall_score >= 70:
        tier = "Industry Competitive"
    elif overall_score >= 50:
        tier = "Developing Foundation"
    else:
        tier = "Early Explorer"

    # Evidence strength score
    if len(evidences) >= 3:
        evidence_strength_score = 85
    elif len(evidences) >= 1:
        evidence_strength_score = 65
    else:
        evidence_strength_score = 40

    # Interview readiness score
    readiness_breakdown = profile.readiness_breakdown or scored["readinessBreakdown"]
    interview_readiness_score = readiness_breakdown.get("interviewReadiness", 60)
    if completed_interviews:
        scores = []
        for i in completed_interviews:
            if i.final_summary and isinstance(i.final_summary, dict) and "overallScore" in i.final_summary:
                scores.append(i.final_summary["overallScore"])
        if scores:
            interview_readiness_score = round(sum(scores) / len(scores))

    # Experience score
    exp = profile.experience or {}
    internships = exp.get("internships", [])
    certs = exp.get("certifications", [])
    experience_score = min(95, 50 + (len(internships) * 15) + (len(certs) * 10))

    assessment_score = 70
    if assessment and assessment.is_completed:
        cat_scores = assessment.category_scores or {}
        assessment_score = int(round(cat_scores.get("Problem Solving", cat_scores.get("Skills", 75))))
    elif profile.match_percentage:
        assessment_score = min(92, max(60, profile.match_percentage - 5))

    # Dynamic actionable next priority
    if len(evidences) == 0:
        next_priority = "Add at least one verified GitHub project repository or certificate to strengthen your Skill Evidence portfolio."
    elif len(completed_interviews) == 0:
        next_priority = "Complete your first Technical Mock Interview session to establish an interview readiness baseline."
    elif roadmap and (roadmap.overall_progress or 0) < 40:
        next_priority = "Complete Phase 2 milestone tasks to bridge core database and testing skill gaps."
    else:
        next_priority = "Focus on Phase 3 and 4 advanced system architecture projects to maximize placement readiness."

    factors = {
        "technical": readiness_breakdown.get("technicalSkills", 75),
        "projects": readiness_breakdown.get("projects", 70),
        "assessment": assessment_score,
        "interview": interview_readiness_score,
        "problemSolving": readiness_breakdown.get("problemSolving", 72),
        "softSkills": readiness_breakdown.get("communication", 70),
    }

    metrics = {
        "skillReadiness": readiness_breakdown.get("technicalSkills", 75),
        "projectReadiness": readiness_breakdown.get("projects", 70),
        "experienceScore": experience_score,
        "communicationScore": readiness_breakdown.get("communication", 70),
        "interviewReadiness": interview_readiness_score,
        "evidenceStrength": evidence_strength_score,
    }

    return ApiResponse(success=True, data={
        "overallScore": overall_score,
        "overallEstimate": overall_score,
        "careerTitle": career_title,
        "targetRole": career_title,
        "directionMatch": direction_match,
        "tier": tier,
        "strengths": scored.get("strengths") or [
            "Demonstrated core technical competencies in modern development",
            "Clear career trajectory alignment"
        ],
        "bottlenecks": scored.get("areasForImprovement") or [
            "Complete at least one technical mock interview simulation",
            "Expand verifiable public GitHub project repositories"
        ],
        "factors": factors,
        "metrics": metrics,
        "nextPriority": next_priority,
        "evidenceCount": len(evidences),
        "interviewsCount": len(completed_interviews),
        "roadmapProgress": roadmap.overall_progress if roadmap else 0,
        "biggestOpportunity": scored.get("biggestOpportunity", ""),
        "nextBestAction": scored.get("nextBestAction", next_priority),
        "scoreExplanation": scored.get("scoreExplanation", ""),
        "confidenceIndicator": scored.get("confidenceIndicator", "Moderate"),
    })
