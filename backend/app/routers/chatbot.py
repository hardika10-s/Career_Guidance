import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, ChatMessage, CareerProfile, CareerRole, Assessment, SkillEvidence
from backend.app.schemas import ChatRequest, ApiResponse
from backend.app.auth import get_current_user
from backend.app.services.gemini_service import chat_with_advisor, GeminiUnavailableError
from backend.app.mongodb import get_mongo_db, is_mongo_connected

router = APIRouter(prefix="/api/chat", tags=["AI Career Chatbot"])

@router.post("/message", response_model=ApiResponse)
async def send_chat_message(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message text is required.")

    user_msg = req.message.strip()
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    target_role_title = profile.current_direction if profile else "Software Developer"
    career = db.query(CareerRole).filter(
        (CareerRole.title.ilike(target_role_title)) | (CareerRole.id == target_role_title)
    ).first() or db.query(CareerRole).first()

    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    evidences = db.query(SkillEvidence).filter(SkillEvidence.user_id == current_user.id).all()

    user_skills = [f"{s.get('name')} ({s.get('level')}%)" for s in (profile.technical_skills if profile else [])]
    core_skills = [s.get("name") for s in (career.core_technical_skills if career else [])]
    missing = [
        cs for cs in core_skills
        if not any(cs.lower() in us.lower() for us in user_skills)
    ]

    context = {
        "userName": current_user.name,
        "targetRole": career.title if career else target_role_title,
        "readinessScore": profile.readiness_score if profile else 65,
        "dominantArchetype": (assessment.ai_analysis or {}).get("dominantArchetype", "Practical Builder") if assessment else "Practical Builder",
        "userSkills": user_skills,
        "missingSkills": missing,
        "evidenceCount": len(evidences),
    }

    # Fetch recent history (from Mongo if available, else SQLite)
    history = []
    mongo_db = get_mongo_db() if is_mongo_connected() else None
    if mongo_db is not None:
        try:
            m_records = list(mongo_db.chat_history.find(
                {"user_id": current_user.id}
            ).sort("timestamp", -1).limit(10))
            history = [{"role": h.get("role"), "content": h.get("content")} for h in reversed(m_records)]
        except Exception:
            history = []

    if not history:
        history_records = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id
        ).order_by(ChatMessage.timestamp.desc()).limit(10).all()
        history = [{"role": h.role, "content": h.content} for h in reversed(history_records)]

    try:
        reply, mode = await chat_with_advisor(user_msg, context, history)
    except GeminiUnavailableError as e:
        raise HTTPException(
            status_code=503,
            detail={"message": str(e), "code": "GEMINI_UNAVAILABLE"}
        )

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    u_id = "msg_" + uuid.uuid4().hex[:10]
    a_id = "msg_" + uuid.uuid4().hex[:10]

    # Save to SQLite
    db.add(ChatMessage(
        id=u_id,
        user_id=current_user.id,
        role="user",
        content=user_msg,
        mode=mode,
        timestamp=now
    ))
    db.add(ChatMessage(
        id=a_id,
        user_id=current_user.id,
        role="assistant",
        content=reply,
        mode=mode,
        timestamp=now
    ))
    db.commit()

    # Save to MongoDB
    if mongo_db is not None:
        try:
            mongo_db.chat_history.insert_many([
                {"id": u_id, "user_id": current_user.id, "role": "user", "content": user_msg, "mode": mode, "timestamp": now},
                {"id": a_id, "user_id": current_user.id, "role": "assistant", "content": reply, "mode": mode, "timestamp": now},
            ])
        except Exception as err:
            pass

    return ApiResponse(
        success=True,
        data={
            "reply": reply,
            "mode": mode,
            "timestamp": now,
        },
        message="Message processed successfully."
    )

@router.get("/history", response_model=ApiResponse)
def get_chat_history(limit: int = Query(50), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mongo_db = get_mongo_db() if is_mongo_connected() else None
    if mongo_db is not None:
        try:
            docs = list(mongo_db.chat_history.find({"user_id": current_user.id}).sort("timestamp", 1).limit(limit))
            if docs:
                data = [
                    {
                        "id": m.get("id"),
                        "userId": m.get("user_id"),
                        "role": m.get("role"),
                        "content": m.get("content"),
                        "mode": m.get("mode"),
                        "timestamp": m.get("timestamp"),
                    }
                    for m in docs
                ]
                return ApiResponse(success=True, data=data)
        except Exception:
            pass

    msgs = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.timestamp.asc()).all()
    data = [
        {
            "id": m.id,
            "userId": m.user_id,
            "role": m.role,
            "content": m.content,
            "mode": m.mode,
            "timestamp": m.timestamp,
        }
        for m in msgs[-limit:]
    ]
    return ApiResponse(success=True, data=data)

@router.delete("/history", response_model=ApiResponse)
def clear_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mongo_db = get_mongo_db() if is_mongo_connected() else None
    if mongo_db is not None:
        try:
            mongo_db.chat_history.delete_many({"user_id": current_user.id})
        except Exception:
            pass

    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return ApiResponse(success=True, message="Chat history cleared.")
