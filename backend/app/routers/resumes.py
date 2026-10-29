import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, ResumeAnalysis, CareerRole, CareerProfile, ProgressTimeline
from backend.app.schemas import ResumeAnalyzeRequest, ApiResponse
from backend.app.auth import get_current_user
from backend.app.services.resume_analyzer import analyze_resume_text

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis"])

def format_resume(r: ResumeAnalysis) -> dict:
    return {
        "id": r.id,
        "userId": r.user_id,
        "targetRole": r.target_role,
        "fileName": r.file_name,
        "overallScore": r.overall_score,
        "completenessScore": r.completeness_score,
        "keywordMatchScore": r.keyword_match_score,
        "impactScore": r.impact_score,
        "detectedSkills": r.detected_skills or [],
        "missingSkills": r.missing_skills or [],
        "softSkillsDetected": r.soft_skills_detected or [],
        "sections": r.sections or [],
        "suggestions": r.suggestions or [],
        "bulletPointRewrites": r.bullet_point_rewrites or [],
        "analyzedAt": r.analyzed_at,
    }

@router.post("/analyze", response_model=ApiResponse)
def analyze_resume(req: ResumeAnalyzeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.resumeText or len(req.resumeText.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume content is too short. Please provide at least 50 characters.")

    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    target_name = req.targetRole or (profile.current_direction if profile else None) or "Software Developer"

    career = db.query(CareerRole).filter(
        (CareerRole.title.ilike(target_name)) | (CareerRole.id == target_name) | (CareerRole.slug == target_name)
    ).first() or db.query(CareerRole).first()
    if not career:
        raise HTTPException(status_code=404, detail="Target career role was not found in the catalog.")

    if not career:
        raise HTTPException(status_code=404, detail="Target career role was not found in the catalog.")
    result = analyze_resume_text(
        req.resumeText,
        career.__dict__,
        req.fileName or "Pasted_Resume",
    )

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    analysis_id = "res_" + uuid.uuid4().hex[:10]

    resume_doc = ResumeAnalysis(
        id=analysis_id,
        user_id=current_user.id,
        target_role=result["targetRole"],
        file_name=result["fileName"],
        overall_score=result["overallScore"],
        completeness_score=result["completenessScore"],
        keyword_match_score=result["keywordMatchScore"],
        impact_score=result["impactScore"],
        detected_skills=result["detectedSkills"],
        missing_skills=result["missingSkills"],
        soft_skills_detected=result["softSkillsDetected"],
        sections=result["sections"],
        suggestions=result["suggestions"],
        bullet_point_rewrites=result["bulletPointRewrites"],
        analyzed_at=now
    )
    db.add(resume_doc)

    db.add(ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=current_user.id,
        type="resume",
        title="Resume Analyzed",
        description=f"Evaluated against {result['targetRole']}. ATS score: {result['overallScore']}%.",
        timestamp=now
    ))

    db.commit()
    db.refresh(resume_doc)

    return ApiResponse(
        success=True,
        data=format_resume(resume_doc),
        message=f"Resume analyzed successfully against {result['targetRole']}."
    )

@router.get("/history", response_model=ApiResponse)
def get_resume_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.user_id == current_user.id
    ).order_by(ResumeAnalysis.analyzed_at.desc()).all()
    return ApiResponse(success=True, data=[format_resume(r) for r in items])

@router.get("/{id}", response_model=ApiResponse)
def get_resume_by_id(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.id == id,
        ResumeAnalysis.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Resume analysis record not found.")
    return ApiResponse(success=True, data=format_resume(doc))

@router.delete("/{id}", response_model=ApiResponse)
def delete_resume_analysis(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.id == id,
        ResumeAnalysis.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Resume analysis record not found.")
    db.delete(doc)
    db.commit()
    return ApiResponse(success=True, message="Resume analysis record deleted.")
