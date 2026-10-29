import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, SkillEvidence, ProgressTimeline, CareerProfile
from backend.app.schemas import EvidenceCreateRequest, ApiResponse
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/evidence", tags=["Skill Evidence"])

def format_evidence(e: SkillEvidence) -> dict:
    return {
        "id": e.id,
        "userId": e.user_id,
        "skillName": e.skill_name,
        "evidenceType": e.evidence_type,
        "title": e.title,
        "url": e.url,
        "description": e.description,
        "verifiedStatus": e.verified_status,
        "strength": e.strength,
        "createdAt": e.created_at,
    }

@router.get("", response_model=ApiResponse)
def get_evidences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    evidences = db.query(SkillEvidence).filter(
        SkillEvidence.user_id == current_user.id
    ).order_by(SkillEvidence.created_at.desc()).all()
    return ApiResponse(success=True, data=[format_evidence(e) for e in evidences])

@router.post("", response_model=ApiResponse)
def create_evidence(req: EvidenceCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    ev_id = "evi_" + uuid.uuid4().hex[:10]

    evidence = SkillEvidence(
        id=ev_id,
        user_id=current_user.id,
        skill_name=req.skillName,
        evidence_type=req.evidenceType,
        title=req.title,
        url=req.url,
        description=req.description,
        verified_status=req.verifiedStatus or "Evidence Added",
        strength=req.strength or "Moderate",
        created_at=now,
    )
    db.add(evidence)

    # Boost profile certification/evidence breakdown
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if profile:
        profile.readiness_breakdown = profile.readiness_breakdown or {}
        profile.readiness_breakdown["certifications"] = min(95, profile.readiness_breakdown.get("certifications", 40) + 10)
        profile.readiness_score = min(96, profile.readiness_score + 2)
        profile.updated_at = now

    db.add(ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=current_user.id,
        type="evidence",
        title=f"Evidence Added: {req.title}",
        description=f"Linked verification artifact for {req.skillName}.",
        timestamp=now
    ))

    db.commit()
    db.refresh(evidence)

    return ApiResponse(success=True, data=format_evidence(evidence), message="Skill evidence added successfully.")

@router.delete("/{id}", response_model=ApiResponse)
def delete_evidence(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    evidence = db.query(SkillEvidence).filter(
        SkillEvidence.id == id,
        SkillEvidence.user_id == current_user.id
    ).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Skill evidence not found.")
    db.delete(evidence)
    db.commit()
    return ApiResponse(success=True, message="Skill evidence deleted.")
