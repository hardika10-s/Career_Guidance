import uuid
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, Assessment, CareerProfile, CareerRole, ProgressTimeline, CareerAnalysis
from backend.app.schemas import (
    AssessmentSubmitRequest, AssessmentSaveProgressRequest, ChallengeValidateRequest, ApiResponse
)
from backend.app.auth import get_current_user
from backend.app.services.assessment_questions import DIMENSIONS, ADAPTIVE_QUESTION_BANK
from backend.app.services.gemini_service import call_gemini_structured

router = APIRouter(prefix="/api/assessment", tags=["Assessments"])
MAX_ASSESSMENT_QUESTIONS = 10

@router.get("/questions", response_model=ApiResponse)
def get_questions():
    return ApiResponse(success=True, data={"totalQuestions": MAX_ASSESSMENT_QUESTIONS, "dimensions": DIMENSIONS, "questions": ADAPTIVE_QUESTION_BANK[:MAX_ASSESSMENT_QUESTIONS]})

@router.get("/current", response_model=ApiResponse)
def get_current_assessment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves the current in-progress or completed assessment for authenticated user.
    """
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    if not assessment:
        return ApiResponse(
            success=True,
            data={
                "isCompleted": False,
                "currentQuestionIndex": 0,
                "answers": [],
                "categoryScores": {},
                "dimensions": DIMENSIONS,
            }
        )
    return ApiResponse(
        success=True,
        data={
            "id": assessment.id,
            "userId": assessment.user_id,
            "isCompleted": assessment.is_completed,
            "currentQuestionIndex": assessment.current_question_index,
            "answers": assessment.answers or [],
            "categoryScores": assessment.category_scores or {},
            "aiAnalysis": assessment.ai_analysis or {},
            "dimensions": DIMENSIONS,
            "startedAt": assessment.started_at,
            "completedAt": assessment.completed_at,
        }
    )

@router.post("/start", response_model=ApiResponse)
def start_new_assessment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Initiates a new adaptive assessment session, resetting any previous in-progress state.
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()

    if assessment:
        assessment.is_completed = False
        assessment.current_question_index = 0
        assessment.answers = []
        assessment.category_scores = {}
        assessment.ai_analysis = {}
        assessment.started_at = now
        assessment.completed_at = None
    else:
        assessment = Assessment(
            id="ass_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            current_question_index=0,
            is_completed=False,
            answers=[],
            category_scores={},
            ai_analysis={},
            started_at=now,
        )
        db.add(assessment)

    db.commit()
    db.refresh(assessment)

    return ApiResponse(
        success=True,
        data={
            "id": assessment.id,
            "isCompleted": False,
            "currentQuestionIndex": 0,
            "answers": [],
            "startedAt": assessment.started_at,
        },
        message="New adaptive assessment initiated."
    )

@router.post("/save-progress", response_model=ApiResponse)
def save_progress(req: AssessmentSaveProgressRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Autosaves user progress, answers, and question index so they can pause and resume.
    """
    if len(req.answers) > MAX_ASSESSMENT_QUESTIONS:
        raise HTTPException(status_code=400, detail="Career assessments are limited to 10 questions.")

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()

    answers_list = [a.model_dump() for a in req.answers]

    if assessment:
        assessment.current_question_index = req.currentQuestionIndex
        assessment.answers = answers_list
        assessment.category_scores = req.categoryScores
    else:
        assessment = Assessment(
            id="ass_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            current_question_index=req.currentQuestionIndex,
            is_completed=False,
            answers=answers_list,
            category_scores=req.categoryScores,
            started_at=now
        )
        db.add(assessment)

    db.commit()
    return ApiResponse(success=True, message="Assessment progress saved.")

@router.post("/next-question", response_model=ApiResponse)
async def get_next_adaptive_question(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates current answers and adaptively selects the next optimal question from the bank.
    """
    answered_ids = payload.get("answeredIds", [])
    current_answers = payload.get("currentAnswers", [])
    target_role = payload.get("targetRole", "software-developer")

    # Fetch profile target career if not supplied
    if not target_role:
        profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
        if profile and profile.current_direction:
            target_role = profile.current_direction

    if len(answered_ids) >= MAX_ASSESSMENT_QUESTIONS:
        return ApiResponse(success=True, data={"nextQuestion": None, "canConclude": True})

    question_schema = {
        "type": "OBJECT",
        "required": ["category", "dimension", "type", "difficulty", "questionText", "options"],
        "properties": {
            "category": {"type": "STRING"},
            "dimension": {"type": "STRING"},
            "type": {"type": "STRING"},
            "difficulty": {"type": "STRING"},
            "language": {"type": "STRING"},
            "codeSnippet": {"type": "STRING"},
            "questionText": {"type": "STRING"},
            "options": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "required": ["text", "score"],
                    "properties": {"text": {"type": "STRING"}, "score": {"type": "INTEGER"}},
                },
            },
        },
    }
    recent_answers = [
        {
            "dimension": answer.get("dimension"),
            "question": (answer.get("questionText") or "")[:160],
            "selectedOption": answer.get("selectedOption"),
            "score": answer.get("score"),
        }
        for answer in current_answers[-(MAX_ASSESSMENT_QUESTIONS - 1):]
    ]
    prompt = (
        f"Create one concise, role-specific multiple-choice career assessment question for {target_role}. "
        "Assess practical readiness. Return 4 distinct options with competency scores from 0 to 100. "
        "Do not repeat these previous questions. Use a concise snake_case dimension. "
        f"Recent answered questions: {json.dumps(recent_answers, ensure_ascii=False)}"
    )
    question = await call_gemini_structured(prompt, question_schema)
    question["id"] = "gem_" + uuid.uuid4().hex[:12]
    return ApiResponse(
        success=True,
        data={
            "nextQuestion": question,
            "canConclude": len(answered_ids) + 1 >= MAX_ASSESSMENT_QUESTIONS,
            "progressPercent": min(100, int(((len(answered_ids) + 1) / MAX_ASSESSMENT_QUESTIONS) * 100)),
            "currentQuestionNumber": len(answered_ids) + 1,
            "totalQuestionsTarget": MAX_ASSESSMENT_QUESTIONS,
        },
    )

@router.post("/submit", response_model=ApiResponse)
async def submit_assessment(req: AssessmentSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Evaluates and scores the completed assessment, generating:
    - 10-dimension normalized skill scorecard
    - Top 3 evidence-based career matches
    - Practical Skill Validation Challenge
    - Actionable 3-step improvement plan
    """
    if not req.answers:
        raise HTTPException(status_code=400, detail="Assessment answers are required.")
    if len(req.answers) > MAX_ASSESSMENT_QUESTIONS:
        raise HTTPException(status_code=400, detail="Career assessments are limited to 10 questions.")

    # Get user profile and target role
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    target_role = profile.current_direction if profile and profile.current_direction else "software-developer"
    career_catalog = [
        {"careerId": role.id, "title": role.title, "coreSkills": role.core_technical_skills or []}
        for role in db.query(CareerRole).all()
    ]

    answers_dicts = [a.model_dump() for a in req.answers]
    prompt = (
        f"Evaluate this candidate's answers for the {target_role} role. Ground every score and recommendation in the supplied answers. "
        "Use the question text, selected option, and option score supplied with each answer. Return 0-100 scores, "
        "provide 10 dimension entries with id/title/category/score/evidenceCount/evaluated/isObjective, "
        "up to 3 career matches with careerId/title/compatibilityScore/matchRationale/contributingStrengths/identifiedGaps, "
        "3 concise improvement plan entries with skill/recommendation/practicalTask/targetMilestone/actionRoute, "
        "and a practical skill validation question with id/question/options (each option has text/isCorrect/explanation). "
        "Also return categoryScores with integer scores for Problem Solving, Skills, Work Style, Interests, and Career Preferences. "
        "Return overallScore, demonstratedTechnicalScore, collaborationScore, projectMaturityScore, tier, "
        "evidenceCoveragePercent, evaluatedSignalsCount, strongestSkills, weakestSkills, dominantArchetype, summary, disclaimer. "
        "Career matches must use careerId and title exactly as listed in the supplied catalog; return no invented roles. "
        f"Career catalog: {json.dumps(career_catalog, ensure_ascii=False)}. "
        f"Answers: {json.dumps(answers_dicts, ensure_ascii=False)}"
    )
    string_array = {"type": "ARRAY", "items": {"type": "STRING"}}
    dimension_schema = {
        "type": "OBJECT",
        "properties": {
            "id": {"type": "STRING"}, "title": {"type": "STRING"},
            "category": {"type": "STRING"}, "score": {"type": "INTEGER"},
            "evidenceCount": {"type": "INTEGER"}, "evaluated": {"type": "BOOLEAN"},
            "isObjective": {"type": "BOOLEAN"},
        },
    }
    match_schema = {
        "type": "OBJECT",
        "properties": {
            "careerId": {"type": "STRING"}, "title": {"type": "STRING"},
            "compatibilityScore": {"type": "INTEGER"}, "matchRationale": {"type": "STRING"},
            "contributingStrengths": string_array, "identifiedGaps": string_array,
        },
    }
    option_schema = {
        "type": "OBJECT",
        "properties": {"text": {"type": "STRING"}, "isCorrect": {"type": "BOOLEAN"}, "explanation": {"type": "STRING"}},
    }
    improvement_schema = {
        "type": "OBJECT",
        "properties": {
            "skill": {"type": "STRING"}, "recommendation": {"type": "STRING"},
            "practicalTask": {"type": "STRING"}, "targetMilestone": {"type": "STRING"},
            "actionRoute": {"type": "STRING"},
        },
    }
    evaluation_schema = {
        "type": "OBJECT",
        "required": ["overallScore", "demonstratedTechnicalScore", "collaborationScore", "projectMaturityScore", "tier", "evidenceCoveragePercent", "evaluatedSignalsCount", "dimensionScores", "categoryScores", "strongestSkills", "weakestSkills", "topCareerMatches", "skillValidationChallenge", "improvementPlan", "summary", "disclaimer"],
        "properties": {
            "overallScore": {"type": "INTEGER"}, "demonstratedTechnicalScore": {"type": "INTEGER"},
            "collaborationScore": {"type": "INTEGER"}, "projectMaturityScore": {"type": "INTEGER"},
            "tier": {"type": "STRING"}, "evidenceCoveragePercent": {"type": "INTEGER"},
            "evaluatedSignalsCount": {"type": "INTEGER"},
            "dimensionScores": {"type": "OBJECT", "properties": {
                key: dimension_schema for key in DIMENSIONS
            }},
            "categoryScores": {"type": "OBJECT", "properties": {
                "Problem Solving": {"type": "INTEGER"}, "Skills": {"type": "INTEGER"},
                "Work Style": {"type": "INTEGER"}, "Interests": {"type": "INTEGER"},
                "Career Preferences": {"type": "INTEGER"},
            }},
            "strongestSkills": string_array, "weakestSkills": string_array,
            "topCareerMatches": {"type": "ARRAY", "items": match_schema},
            "skillValidationChallenge": {
                "type": "OBJECT",
                "properties": {
                    "id": {"type": "STRING"}, "question": {"type": "STRING"},
                    "options": {"type": "ARRAY", "items": option_schema},
                },
            },
            "improvementPlan": {"type": "ARRAY", "items": improvement_schema},
            "summary": {"type": "STRING"}, "disclaimer": {"type": "STRING"},
        },
    }
    evaluation = await call_gemini_structured(prompt, evaluation_schema)
    challenge = evaluation.get("skillValidationChallenge") or {}
    challenge["id"] = challenge.get("id") or "chal_" + uuid.uuid4().hex[:10]
    evaluation["skillValidationChallenge"] = challenge

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    category_scores = evaluation["categoryScores"]

    # Dominant archetype
    top_matches = evaluation.get("topCareerMatches", [])
    primary_role_title = top_matches[0].get("title", target_role) if top_matches else target_role
    dominant_archetype = f"Targeted {primary_role_title} Candidate"

    ai_analysis = {
        "overallScore": evaluation["overallScore"],
        "demonstratedTechnicalScore": evaluation["demonstratedTechnicalScore"],
        "collaborationScore": evaluation["collaborationScore"],
        "projectMaturityScore": evaluation["projectMaturityScore"],
        "tier": evaluation["tier"],
        "evidenceCoveragePercent": evaluation["evidenceCoveragePercent"],
        "evaluatedSignalsCount": evaluation["evaluatedSignalsCount"],
        "dimensionScores": evaluation["dimensionScores"],
        "strongestSkills": evaluation["strongestSkills"],
        "weakestSkills": evaluation["weakestSkills"],
        "topCareerMatches": evaluation["topCareerMatches"],
        "skillValidationChallenge": evaluation["skillValidationChallenge"],
        "improvementPlan": evaluation["improvementPlan"],
        "dominantArchetype": dominant_archetype,
        "summary": f"Assessment benchmark evaluated {evaluation['evaluatedSignalsCount']} competency signals across {evaluation['evidenceCoveragePercent']}% dimension coverage. Overall readiness score: {evaluation['overallScore']}%.",
        "keyStrengths": evaluation["strongestSkills"],
        "growthAreas": evaluation["weakestSkills"],
        "recommendedCareerFocus": [m.get("careerId", "") for m in top_matches],
        "disclaimer": evaluation["disclaimer"],
    }

    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    if assessment:
        assessment.is_completed = True
        assessment.current_question_index = len(req.answers)
        assessment.answers = answers_dicts
        assessment.category_scores = category_scores
        assessment.ai_analysis = ai_analysis
        assessment.completed_at = now
    else:
        assessment = Assessment(
            id="ass_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            current_question_index=len(req.answers),
            is_completed=True,
            answers=answers_dicts,
            category_scores=category_scores,
            ai_analysis=ai_analysis,
            started_at=now,
            completed_at=now
        )
        db.add(assessment)

    # Update profile readiness breakdown
    if profile:
        profile.readiness_breakdown = profile.readiness_breakdown or {}
        profile.readiness_breakdown["problemSolving"] = evaluation["demonstratedTechnicalScore"]
        profile.readiness_breakdown["technicalFoundation"] = evaluation["demonstratedTechnicalScore"]
        profile.readiness_breakdown["interviewReadiness"] = max(profile.readiness_breakdown.get("interviewReadiness", 60), evaluation["collaborationScore"])
        profile.readiness_score = evaluation["overallScore"]
        profile.updated_at = now

        db.add(CareerAnalysis(
            id="ca_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            analysis_date=now,
            recommended_roles=[{"careerId": r.get("careerId", ""), "title": r.get("title", ""), "matchPercentage": r.get("compatibilityScore", 0)} for r in top_matches],
            readiness_score=evaluation["overallScore"],
            target_role=profile.current_direction,
        ))

    db.add(ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=current_user.id,
        type="assessment",
        title="Adaptive Career Assessment Completed",
        description=f"Evaluated {evaluation['evaluatedSignalsCount']} competency signals with {evaluation['overallScore']}% overall readiness score.",
        timestamp=now
    ))

    db.commit()
    db.refresh(assessment)

    return ApiResponse(
        success=True,
        data={
            "id": assessment.id,
            "userId": assessment.user_id,
            "isCompleted": True,
            "currentQuestionIndex": assessment.current_question_index,
            "answers": assessment.answers,
            "categoryScores": assessment.category_scores,
            "aiAnalysis": assessment.ai_analysis,
            "startedAt": assessment.started_at,
            "completedAt": assessment.completed_at,
        },
        message="Adaptive assessment submitted and analyzed successfully."
    )

@router.post("/validate-challenge", response_model=ApiResponse)
async def validate_skill_challenge(req: ChallengeValidateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Evaluates the candidate's response to the post-assessment Practical Skill Validation Challenge.
    """
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    challenge = (assessment.ai_analysis or {}).get("skillValidationChallenge") if assessment and assessment.ai_analysis else None
    if not challenge or challenge.get("id") != req.challengeId:
        raise HTTPException(status_code=404, detail="Validation challenge not found.")

    selected_opt = next((o for o in challenge["options"] if o["text"] == req.selectedOptionText), None)
    if not selected_opt:
        raise HTTPException(status_code=400, detail="Selected challenge option is not valid.")
    result = await call_gemini_structured(
        "Evaluate the candidate's selected answer against this assessment challenge. Determine correctness from the challenge and options. "
        "Return an objective explanation and confidenceBoost of 5 only if correct, otherwise 0. "
        f"Challenge: {json.dumps(challenge, ensure_ascii=False)}. Selected answer: {req.selectedOptionText}",
        {"type": "OBJECT", "required": ["isCorrect", "explanation", "confidenceBoost"], "properties": {
            "isCorrect": {"type": "BOOLEAN"}, "explanation": {"type": "STRING"}, "confidenceBoost": {"type": "INTEGER"},
        }},
    )
    is_correct = bool(result.get("isCorrect"))
    explanation = result.get("explanation", "Answer reviewed.")

    # Update assessment record with validated challenge result
    if assessment and assessment.ai_analysis:
        analysis = dict(assessment.ai_analysis)
        analysis["validatedChallengeResult"] = {
            "challengeId": req.challengeId,
            "selectedOptionText": req.selectedOptionText,
            "isCorrect": is_correct,
            "explanation": explanation,
            "validatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        assessment.ai_analysis = analysis
        db.commit()

    return ApiResponse(
        success=True,
        data={
            "challengeId": req.challengeId,
            "isCorrect": is_correct,
            "explanation": explanation,
            "confidenceBoost": 5 if is_correct else 0,
        },
        message="Practical skill validation evaluated successfully."
    )

@router.get("/history", response_model=ApiResponse)
def get_assessment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns assessment historical completion record.
    """
    assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).first()
    if not assessment or not assessment.is_completed:
        return ApiResponse(success=True, data=[])

    return ApiResponse(
        success=True,
        data=[{
            "id": assessment.id,
            "completedAt": assessment.completed_at,
            "overallScore": assessment.ai_analysis.get("overallScore", 70) if assessment.ai_analysis else 70,
            "tier": assessment.ai_analysis.get("tier", "Industry Competitive") if assessment.ai_analysis else "Industry Competitive",
            "signalsCount": len(assessment.answers) if assessment.answers else 0,
        }]
    )
