import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, LearningRoadmap, CareerProfile, CareerRole, ProgressTimeline
from backend.app.schemas import RoadmapToggleRequest, ApiResponse
from backend.app.auth import get_current_user
from backend.app.services.gemini_service import call_gemini_structured

router = APIRouter(prefix="/api/roadmap", tags=["Learning Roadmaps"])

def normalize_phase_tasks(phase: dict) -> bool:
    """Keep each phase to the four checklist items shown in the UI."""
    changed = False
    phase_number = phase.get("phaseNumber", 1)
    for task_type, label in (("learningTasks", "Learning"), ("practiceTasks", "Practice")):
        current = phase.get(task_type) or []
        tasks = [task for task in current[:2] if isinstance(task, dict)]
        if len(tasks) != len(current):
            changed = True
        while len(tasks) < 2:
            number = len(tasks) + 1
            tasks.append({
                "id": f"phase-{phase_number}-{task_type}-{number}",
                "title": f"Complete {label.lower()} milestone {number}",
                "description": f"Complete a focused {label.lower()} milestone for this phase.",
                "completed": False,
            })
            changed = True
        phase[task_type] = tasks
    return changed

def unlock_all_phases(phases: list) -> bool:
    """Keep every roadmap phase available to the user."""
    changed = False
    for phase in phases:
        if phase.get("isUnlocked") is not True:
            phase["isUnlocked"] = True
            changed = True
    return changed

def format_roadmap(roadmap: LearningRoadmap) -> dict:
    return {
        "id": roadmap.id,
        "userId": roadmap.user_id,
        "targetCareerId": roadmap.target_career_id,
        "targetCareerTitle": roadmap.target_career_title,
        "careerTitle": roadmap.target_career_title,
        "phases": roadmap.phases or [],
        "overallProgress": roadmap.overall_progress,
        "generatedAt": roadmap.generated_at,
        "updatedAt": roadmap.updated_at,
    }

async def generate_gemini_roadmap(profile: CareerProfile, career: CareerRole) -> list:
    profile_data = {
        "skills": profile.technical_skills or [],
        "experience": profile.experience or {},
        "education": profile.education or {},
        "goals": profile.career_goals or {},
    }
    role_data = {
        "title": career.title,
        "description": career.description,
        "skills": career.core_technical_skills or [],
        "projects": career.suggested_projects or [],
    }
    schema = {
        "type": "OBJECT", "required": ["phases"],
        "properties": {"phases": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "phaseNumber": {"type": "INTEGER"}, "title": {"type": "STRING"}, "description": {"type": "STRING"}, "estimatedEffort": {"type": "STRING"}, "skills": {"type": "ARRAY", "items": {"type": "STRING"}},
            "learningTasks": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {"title": {"type": "STRING"}, "description": {"type": "STRING"}}}},
            "practiceTasks": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {"title": {"type": "STRING"}, "description": {"type": "STRING"}}}},
            "project": {"type": "OBJECT", "properties": {"title": {"type": "STRING"}, "description": {"type": "STRING"}, "deliverables": {"type": "ARRAY", "items": {"type": "STRING"}}}},
        }}}},
    }
    result = await call_gemini_structured(
        "Build a realistic, personalized career learning roadmap for this candidate. Return exactly five ordered phases, "
        "from foundational gaps to job-ready proof. Tailor skills/tasks/projects to role requirements and the candidate's existing skills. "
        "Each phase must contain exactly two learning tasks and exactly two practice tasks. "
        "Learning and practice tasks should be specific, measurable, and sequenced. Do not claim certifications or guarantees. "
        f"Role details: {role_data}. Candidate profile: {profile_data}", schema
    )
    phases = result.get("phases")
    if not isinstance(phases, list) or len(phases) != 5:
        raise ValueError("Gemini did not return a five-phase roadmap.")
    for index, phase in enumerate(phases, start=1):
        phase["id"] = f"gemini-phase-{index}"
        phase["phaseNumber"] = index
        phase["isUnlocked"] = True
        normalize_phase_tasks(phase)
        phase["learningTasks"] = [{"id": f"g{index}-l{n}", "completed": False, **task} for n, task in enumerate(phase.get("learningTasks", []), 1)]
        phase["practiceTasks"] = [{"id": f"g{index}-p{n}", "completed": False, **task} for n, task in enumerate(phase.get("practiceTasks", []), 1)]
        phase["project"] = {"completed": False, "deliverables": [], **(phase.get("project") or {})}
    return phases

@router.get("", response_model=ApiResponse)
async def get_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).first()
    if not roadmap:
        profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Roadmap not found. Please complete onboarding first.")

        target_name = profile.current_direction or "Software Developer"
        career = db.query(CareerRole).filter(
            (CareerRole.title.ilike(target_name)) | (CareerRole.id == target_name) | (CareerRole.slug == target_name)
        ).first() or db.query(CareerRole).first()

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        phases = await generate_gemini_roadmap(profile, career)
        phases[0]["generatedBy"] = "gemini"
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
        db.commit()
        db.refresh(roadmap)

    elif not (roadmap.phases and roadmap.phases[0].get("generatedBy") == "gemini") or (
        (profile := db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first())
        and profile.current_direction
        and profile.current_direction.lower() != roadmap.target_career_title.lower()
    ):
        profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
        target_name = profile.current_direction if profile else roadmap.target_career_title
        career = db.query(CareerRole).filter(
            (CareerRole.title.ilike(target_name)) | (CareerRole.id == target_name) | (CareerRole.slug == target_name)
        ).first() or db.query(CareerRole).filter(CareerRole.id == roadmap.target_career_id).first()
        if profile and career:
            roadmap.phases = await generate_gemini_roadmap(profile, career)
            roadmap.phases[0]["generatedBy"] = "gemini"
            roadmap.target_career_id = career.id
            roadmap.target_career_title = career.title
            roadmap.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            db.commit()
            db.refresh(roadmap)
    phases = list(roadmap.phases or [])
    changed = False
    for phase in phases:
        changed = normalize_phase_tasks(phase) or changed
    if unlock_all_phases(phases):
        changed = True
    if changed:
        roadmap.phases = phases
        roadmap.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        db.commit()
        db.refresh(roadmap)
    return ApiResponse(success=True, data=format_roadmap(roadmap))

@router.post("/generate", response_model=ApiResponse)
async def regenerate_roadmap(data: dict = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    target_id = (data or {}).get("careerId") or profile.current_direction or "Software Developer"
    career = db.query(CareerRole).filter(
        (CareerRole.id == target_id) | (CareerRole.slug == target_id) | (CareerRole.title.ilike(target_id))
    ).first() or db.query(CareerRole).first()

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    phases = await generate_gemini_roadmap(profile, career)
    phases[0]["generatedBy"] = "gemini"

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
        title="Personalized Roadmap Regenerated",
        description=f"Updated learning milestones for {career.title}.",
        timestamp=now
    ))
    db.commit()
    db.refresh(roadmap)

    return ApiResponse(success=True, data=format_roadmap(roadmap), message="Roadmap regenerated successfully.")

@router.patch("/task", response_model=ApiResponse)
def toggle_roadmap_task(req: RoadmapToggleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    phases = list(roadmap.phases or [])
    target_phase = next((p for p in phases if p.get("id") == req.phaseId), None)
    if not target_phase:
        raise HTTPException(status_code=404, detail="Roadmap phase not found.")
    task_title = ""
    if req.taskType == "learning":
        t = next((task for task in target_phase.get("learningTasks", []) if task.get("id") == req.taskId), None)
        if not t:
            raise HTTPException(status_code=404, detail="Learning task not found.")
        t["completed"] = not t.get("completed", False)
        task_title = t.get("title", "")
    elif req.taskType == "practice":
        t = next((task for task in target_phase.get("practiceTasks", []) if task.get("id") == req.taskId), None)
        if not t:
            raise HTTPException(status_code=404, detail="Practice task not found.")
        t["completed"] = not t.get("completed", False)
        task_title = t.get("title", "")
    elif req.taskType == "project":
        proj = target_phase.get("project", {})
        if req.taskId != "project" or not proj:
            raise HTTPException(status_code=404, detail="Project not found.")
        proj["completed"] = not proj.get("completed", False)
        task_title = proj.get("title", "")
    else:
        raise HTTPException(status_code=400, detail="Unsupported roadmap task type.")

    # Calculate overall progress
    total_tasks = 0
    completed_tasks = 0
    for p in phases:
        for lt in p.get("learningTasks", []):
            total_tasks += 1
            if lt.get("completed"):
                completed_tasks += 1
        for pt in p.get("practiceTasks", []):
            total_tasks += 1
            if pt.get("completed"):
                completed_tasks += 1
        total_tasks += 1
        if p.get("project", {}).get("completed"):
            completed_tasks += 1

    # Preserve all-phase access even for roadmaps with older saved lock flags.
    unlock_all_phases(phases)

    progress = int(round((completed_tasks / max(1, total_tasks)) * 100))
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    roadmap.phases = phases
    roadmap.overall_progress = progress
    roadmap.updated_at = now

    # Update profile readiness
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if profile:
        profile.readiness_breakdown = profile.readiness_breakdown or {}
        profile.readiness_breakdown["projects"] = min(95, profile.readiness_breakdown.get("projects", 50) + 1)
        profile.readiness_score = min(96, max(profile.readiness_score, int(round(55 + progress * 0.4))))
        profile.updated_at = now

    db.add(ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=current_user.id,
        type="roadmap",
        title=f"Task Progress: {task_title or 'Milestone'}",
        description=f"Roadmap progress is now {progress}%.",
        timestamp=now
    ))

    db.commit()
    db.refresh(roadmap)

    return ApiResponse(success=True, data=format_roadmap(roadmap), message="Task progress updated.")
