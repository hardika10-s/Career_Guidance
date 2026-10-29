import uuid
import hashlib
import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, Interview, CareerProfile, ProgressTimeline
from backend.app.schemas import ApiResponse
from backend.app.auth import get_current_user
from backend.app.services.interview_service import (
    generate_interview_opening,
    generate_interview_starter_code,
    evaluate_answer_and_steer,
    generate_coaching_hint,
    generate_comprehensive_report,
    normalize_role,
    normalize_format,
    normalize_difficulty
)
from backend.app.services.gemini_service import GeminiUnavailableError

router = APIRouter(prefix="/api/interviews", tags=["Interview Arena"])


def format_interview(i: Interview) -> dict:
    """
    Authoritative formatting for interview session representation.
    Calculates scores deterministically from validated answers.
    Never invents scores for sessions with 0 answers.
    """
    summary = dict(i.final_summary or {})
    answers = list(i.answers or [])

    # Filter strictly valid evaluated answers (handling current and legacy records)
    valid_answers = []
    valid_scores = []
    for a in answers:
        if not isinstance(a, dict):
            continue
        ev = a.get("evaluation") or {}
        sc = ev.get("score")
        if sc is None:
            sc = ev.get("relevanceScore") if ev.get("relevanceScore") is not None else ev.get("technicalCorrectnessScore")
        if isinstance(sc, (int, float)) and not isinstance(sc, bool) and 0 <= sc <= 100:
            valid_answers.append(a)
            valid_scores.append(int(round(sc)))

    # Authoritative presentation status
    authoritative_status = i.status
    if authoritative_status == "completed":
        if not valid_answers:
            # 0 answers cannot be a completed interview
            authoritative_status = "ended_early"
    elif authoritative_status == "in_progress":
        session_meta = summary.get("sessionConfig") or {}
        target_count = int(session_meta.get("targetQuestionCount") or len(i.questions or []) or 5)
        if len(valid_answers) >= target_count and valid_scores:
            authoritative_status = "completed"

    # Overall score: strictly None for active sessions or sessions without valid answers
    if authoritative_status in {"in_progress", "created"} or not valid_answers:
        overall_score = None
    else:
        stored_score = summary.get("overallScore")
        if isinstance(stored_score, (int, float)) and not isinstance(stored_score, bool) and 0 <= stored_score <= 100:
            overall_score = int(round(stored_score))
        else:
            overall_score = int(round(sum(valid_scores) / len(valid_scores)))

    session_meta = dict(summary.get("sessionConfig") or {})
    conversation = list(summary.get("conversation") or [])

    # Reconstruct turns for legacy records if conversation list is empty
    if not conversation and i.questions:
        conversation = []
        for q in i.questions:
            q_text = q.get("question") or q.get("questionText") or ""
            conversation.append({
                "id": f"msg_q_{q.get('id', '1')}",
                "role": "interviewer",
                "text": q_text,
                "questionText": q_text,
                "type": "question",
                "questionId": q.get("id"),
                "timestamp": i.created_at
            })
            ans = next((a for a in answers if a.get("questionId") == q.get("id")), None)
            if ans:
                conversation.append({
                    "id": f"msg_a_{q.get('id', '1')}",
                    "role": "candidate",
                    "text": ans.get("answerText") or ans.get("answer") or "",
                    "type": "answer",
                    "timestamp": ans.get("timestamp") or i.created_at
                })

    # Accurately count main questions (distinguishing follow-ups)
    main_questions = [q for q in (i.questions or []) if not q.get("isFollowUp")]
    main_q_count = len(main_questions) if main_questions else (len(i.questions or []) or 1)

    # Sanitize finalSummary to maintain integrity
    if overall_score is None:
        summary["overallScore"] = None
        summary["dimensions"] = None
        summary["rubricDimensions"] = None
        if not valid_answers and not summary.get("summaryText"):
            summary["summaryText"] = "Session concluded without answered questions. No evaluation score is available."
    else:
        summary["overallScore"] = overall_score
        summary["questionsAnswered"] = len(valid_answers)
        if not summary.get("tier"):
            summary["tier"] = (
                "Market-Competitive Ready" if overall_score >= 82
                else "Developing Foundation" if overall_score >= 65
                else "Needs Practice"
            )
        if not summary.get("dimensions"):
            dim_keys = ["technicalAccuracy", "problemSolving", "communication", "depthOfUnderstanding", "practicalApplication"]
            aggregated_dims = {}
            for dk in dim_keys:
                vals = [a["evaluation"].get(dk, a["evaluation"].get("score", overall_score)) for a in valid_answers if a.get("evaluation")]
                aggregated_dims[dk] = int(round(sum(vals) / len(vals))) if vals else overall_score
            summary["dimensions"] = aggregated_dims

    return {
        "id": i.id,
        "userId": i.user_id,
        "careerTitle": i.career_title,
        "difficulty": i.difficulty,
        "interviewType": i.interview_type,
        "format": session_meta.get("format", i.interview_type),
        "mode": session_meta.get("mode", "realistic"),
        "durationMinutes": session_meta.get("durationMinutes", 15),
        "targetQuestionCount": session_meta.get("targetQuestionCount", len(i.questions or []) or 5),
        "mainQuestionCount": main_q_count,
        "status": authoritative_status,
        "questions": i.questions or [],
        "answers": answers,
        "conversation": conversation,
        "overallScore": overall_score,
        "finalSummary": summary if summary else None,
        "sessionConfig": session_meta,
        "createdAt": i.created_at,
        "completedAt": i.completed_at,
    }


@router.get("", response_model=ApiResponse)
def get_interviews(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all past and active interview sessions for the authenticated user."""
    items = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).order_by(Interview.created_at.desc()).all()
    return ApiResponse(success=True, data=[format_interview(i) for i in items])


@router.get("/{id}", response_model=ApiResponse)
def get_interview_by_id(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve details for a specific interview session owned by the authenticated user."""
    interview = db.query(Interview).filter(
        Interview.id == id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found or access denied.")
    return ApiResponse(success=True, data=format_interview(interview))


@router.delete("/{id}", response_model=ApiResponse)
def delete_interview(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete one interview session owned by the authenticated user."""
    interview = db.query(Interview).filter(
        Interview.id == id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found or access denied.")

    db.delete(interview)
    db.commit()
    return ApiResponse(success=True, data={"id": id}, message="Interview session deleted.")


@router.post("/start", response_model=ApiResponse)
async def start_interview(data: dict = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Initializes a new interactive AI mock interview session.
    Configures format, role, difficulty, duration, and generates opening interviewer greeting and question.
    """
    data = data or {}
    request_id = str(data.get("requestId") or "").strip()
    if not request_id:
        request_id = uuid.uuid4().hex[:16]
    elif len(request_id) > 80:
        raise HTTPException(status_code=400, detail="requestId too long.")

    career_title = data.get("careerTitle") or "Software Developer"
    difficulty = data.get("difficulty") or "Intermediate"
    format_name = data.get("format") or data.get("interviewType") or "Technical Interview"

    try:
        duration_mins = int(data.get("durationMinutes") or 15)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Duration must be between 5 and 60 minutes.")
    if not 5 <= duration_mins <= 60:
        raise HTTPException(status_code=400, detail="Duration must be between 5 and 60 minutes.")

    mode = data.get("mode") or "realistic"
    code_language = str(data.get("language") or "python").strip().lower()
    if code_language not in {"python", "javascript", "typescript", "java", "cpp", "sql"}:
        raise HTTPException(status_code=400, detail="Choose a supported coding language.")

    default_q_count = 3 if duration_mins <= 10 else 5 if duration_mins <= 20 else 8
    try:
        target_q_count = int(data.get("questionCount") or default_q_count)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Question count must be between 2 and 12.")
    if not 2 <= target_q_count <= 12:
        raise HTTPException(status_code=400, detail="Question count must be between 2 and 12.")

    if not isinstance(career_title, str) or not career_title.strip() or len(career_title) > 120:
        raise HTTPException(status_code=400, detail="Choose a valid target role.")
    if not isinstance(format_name, str) or not format_name.strip() or len(format_name) > 120:
        raise HTTPException(status_code=400, detail="Choose a valid interview format.")
    if str(difficulty).strip().lower() not in {
        "beginner", "entry-level", "entry level", "junior", "intermediate", "advanced", "senior"
    }:
        raise HTTPException(status_code=400, detail="Choose Beginner, Intermediate, or Advanced difficulty.")

    # Idempotent session identifier
    session_id = "int_" + uuid.uuid5(uuid.NAMESPACE_URL, f"{current_user.id}:{request_id}").hex[:20]
    prior = db.query(Interview).filter(Interview.id == session_id, Interview.user_id == current_user.id).first()
    if prior and (prior.questions or prior.status != "created"):
        return ApiResponse(success=True, data=format_interview(prior), message="Interview session already created.")

    # Pull user profile context for personalization
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    candidate_profile = None
    if profile:
        candidate_profile = {
            "name": current_user.name,
            "userName": current_user.name,
            "targetRole": profile.current_direction or career_title,
            "technicalSkills": profile.technical_skills or [],
            "experience": profile.experience or {}
        }

    prior_sessions = db.query(Interview).filter(
        Interview.user_id == current_user.id,
        Interview.id != session_id,
    ).order_by(Interview.created_at.desc()).limit(5).all()
    prior_questions = [
        question
        for old_session in prior_sessions
        for question in (old_session.questions or [])
        if isinstance(question, dict)
    ][-30:]

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    session_config = {
        "format": format_name,
        "difficulty": difficulty,
        "mode": mode,
        "codeLanguage": code_language,
        "durationMinutes": duration_mins,
        "targetQuestionCount": target_q_count,
        "currentQuestionIndex": 1,
        "requestId": request_id
    }

    if prior:
        session_config = dict((prior.final_summary or {}).get("sessionConfig") or session_config)
        career_title, format_name = prior.career_title, prior.interview_type
        difficulty = prior.difficulty
    else:
        prior = Interview(
            id=session_id,
            user_id=current_user.id,
            career_title=career_title,
            difficulty=difficulty,
            interview_type=format_name,
            status="created",
            questions=[],
            answers=[],
            final_summary={"sessionConfig": session_config, "conversation": [], "overallScore": None},
            created_at=now
        )
        db.add(prior)
        db.commit()
        db.refresh(prior)

    # Generate initial greeting and Question 1 via Gemini AI
    greeting, first_q = await generate_interview_opening(
        career_title=career_title,
        format_name=format_name,
        difficulty=difficulty,
        candidate_profile=candidate_profile,
        prior_questions=prior_questions,
        code_language=code_language,
    )

    conversation = [
        {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "role": "interviewer",
            "text": greeting,
            "type": "greeting",
            "timestamp": now
        },
        {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "role": "interviewer",
            "text": first_q["questionText"],
            "questionText": first_q["questionText"],
            "topic": first_q.get("topic"),
            "starterCode": first_q.get("starterCode"),
            "codeContext": first_q.get("codeContext"),
            "type": "question",
            "questionId": first_q["id"],
            "questionMeta": first_q,
            "timestamp": now
        }
    ]

    session_config["activeQuestion"] = first_q

    initial_summary = {
        "sessionConfig": session_config,
        "conversation": conversation,
        "overallScore": None
    }

    prior.status = "in_progress"
    prior.questions = [first_q]
    prior.final_summary = initial_summary
    db.commit()
    db.refresh(prior)

    return ApiResponse(
        success=True,
        data=format_interview(prior),
        message="AI mock interview session initialized."
    )


@router.post("/{id}/message", response_model=ApiResponse)
async def send_interview_message(id: str, data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Submits candidate turn (answer or hint request) to the active interview.
    Evaluates response, handles follow-ups, and progresses conversation.
    """
    interview = db.query(Interview).filter(
        Interview.id == id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found or access denied.")

    if interview.status != "in_progress":
        raise HTTPException(status_code=409, detail="This interview session is not active.")

    request_hint = data.get("requestHint", False)
    answer_text = (data.get("answer") or data.get("message") or data.get("answerText") or "").strip()
    code_snippet = data.get("codeSnippet")
    summary = dict(interview.final_summary or {})
    conversation = list(summary.get("conversation") or [])
    session_config = dict(summary.get("sessionConfig") or {})
    code_lang = str(data.get("language") or session_config.get("codeLanguage") or "python").strip().lower()
    if code_lang not in {"python", "javascript", "typescript", "java", "cpp", "sql"}:
        raise HTTPException(status_code=400, detail="Choose a supported coding language.")

    active_q = session_config.get("activeQuestion") or (interview.questions[-1] if interview.questions else {"questionText": "Question", "id": "q1"})

    supplied_q_id = data.get("questionId")
    if not request_hint and supplied_q_id and supplied_q_id != active_q.get("id") and supplied_q_id != active_q.get("parentQuestionId"):
        raise HTTPException(status_code=409, detail="This question is no longer active. Refresh the interview to continue.")

    current_q_idx = session_config.get("currentQuestionIndex", 1)
    target_q_count = session_config.get("targetQuestionCount", 5)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # 1. Handle Coaching Hint Request
    if request_hint:
        hint_text = await generate_coaching_hint(
            career_title=interview.career_title,
            format_name=interview.interview_type,
            current_question=active_q
        )
        hint_turn = {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "role": "coach",
            "text": hint_text,
            "type": "hint",
            "timestamp": now
        }
        conversation.append(hint_turn)
        summary["conversation"] = conversation
        interview.final_summary = summary
        db.commit()
        db.refresh(interview)
        return ApiResponse(
            success=True,
            data=format_interview(interview),
            message="Coaching hint generated."
        )

    if not answer_text and not code_snippet:
        raise HTTPException(status_code=400, detail="Please provide your answer or code submission.")

    full_candidate_text = answer_text
    if code_snippet:
        full_candidate_text = f"{answer_text}\n\n```{code_lang or ''}\n{code_snippet}\n```".strip()

    # Idempotent submission identification
    submission_id = str(data.get("submissionId") or "").strip()
    if not submission_id:
        submission_id = hashlib.sha256(f"{active_q.get('id')}:{full_candidate_text}".encode("utf-8")).hexdigest()[:24]

    answers = list(interview.answers or [])
    prior_answer = next((a for a in answers if a.get("submissionId") == submission_id), None)
    if prior_answer and prior_answer.get("evaluation"):
        return ApiResponse(success=True, data=format_interview(interview), message="Answer was already processed.")

    # Check for an unevaluated pending answer on this active question (e.g. edited retry)
    pending_idx = next(
        (idx for idx, a in enumerate(answers)
         if (a.get("questionId") == active_q.get("id") or a.get("submissionId") == submission_id)
         and not a.get("evaluation")),
        None
    )

    old_pending_sub_id = None
    if pending_idx is not None:
        old_pending_sub_id = answers[pending_idx].get("submissionId")
        answers[pending_idx]["submissionId"] = submission_id
        answers[pending_idx]["answerText"] = full_candidate_text
        answers[pending_idx]["timestamp"] = now
        answers[pending_idx]["isFollowUp"] = bool(active_q.get("isFollowUp"))
        prior_answer = answers[pending_idx]
        interview.answers = answers
        db.commit()
    elif not prior_answer:
        pending_answer = {
            "id": "ans_" + uuid.uuid4().hex[:12],
            "submissionId": submission_id,
            "questionId": active_q.get("id", f"q{current_q_idx}"),
            "questionText": active_q.get("questionText") or active_q.get("question"),
            "answerText": full_candidate_text,
            "evaluation": None,
            "isFollowUp": bool(active_q.get("isFollowUp")),
            "timestamp": now
        }
        answers.append(pending_answer)
        interview.answers = answers
        db.commit()
        prior_answer = pending_answer

    # Add or update candidate turn in conversation
    cand_turn = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "role": "candidate",
        "text": full_candidate_text,
        "type": "answer",
        "codeSnippet": code_snippet,
        "language": code_lang,
        "submissionId": submission_id,
        "timestamp": now
    }
    cand_turn_idx = next(
        (idx for idx, t in enumerate(conversation)
         if t.get("role") == "candidate" and (t.get("submissionId") == submission_id or (old_pending_sub_id and t.get("submissionId") == old_pending_sub_id))),
        None
    )
    if cand_turn_idx is not None:
        conversation[cand_turn_idx] = cand_turn
    elif not any(t.get("submissionId") == submission_id for t in conversation):
        conversation.append(cand_turn)

    # Persist the candidate bubble before the slower AI evaluation so refreshes and
    # retries never make a submitted response disappear from the conversation.
    session_config["codeLanguage"] = code_lang
    summary["conversation"] = conversation
    summary["sessionConfig"] = session_config
    interview.final_summary = summary
    db.commit()

    # Determine if last interviewer turn was already a follow-up
    last_interviewer_turn = next(
        (t for t in reversed(conversation) if t.get("role") == "interviewer"),
        None
    )
    already_followed_up = (
        last_interviewer_turn is not None and (
            last_interviewer_turn.get("type") == "follow_up" or
            last_interviewer_turn.get("isFollowUp") is True
        )
    )

    # 2. Evaluate Candidate Response & Steer Next Turn with Gemini AI
    steer_result = await evaluate_answer_and_steer(
        career_title=interview.career_title,
        format_name=interview.interview_type,
        difficulty=interview.difficulty,
        current_question=active_q,
        candidate_answer=full_candidate_text,
        conversation_history=conversation,
        current_q_num=current_q_idx,
        total_q_target=target_q_count,
        already_followed_up=already_followed_up,
        is_coaching_mode=(session_config.get("mode") == "coaching"),
        prior_questions=list(interview.questions or []),
        code_language=str(code_lang or session_config.get("codeLanguage") or "python").strip().lower(),
    )

    evaluation = steer_result["evaluation"]
    is_follow_up = steer_result.get("isFollowUp", False)
    interviewer_reply = steer_result.get("interviewerReply") or "Thank you for sharing your approach."
    next_question = steer_result.get("nextQuestion")

    # Attach validated evaluation to the persisted answer record
    answers = list(interview.answers or [])
    ans_idx = next((idx for idx, a in enumerate(answers) if a.get("submissionId") == submission_id), None)
    if ans_idx is not None:
        answer_record = dict(answers[ans_idx])
        answer_record.update({
            "evaluation": evaluation,
            "isFollowUp": bool(active_q.get("isFollowUp")),
            "followUpRequested": is_follow_up,
        })
        answers[ans_idx] = answer_record
    interview.answers = answers

    # Progress tracking: main questions advance progress, follow-ups do not increment main question count
    reached_limit = False
    if not is_follow_up:
        current_q_idx += 1
        session_config["currentQuestionIndex"] = current_q_idx
        if current_q_idx > target_q_count:
            reached_limit = True

    if reached_limit:
        closing_msg = (
            "Thank you very much. That concludes all the planned questions for today's mock interview simulation! "
            "You can now review your comprehensive performance report and dimensional evaluation."
        )
        interviewer_turn = {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "role": "interviewer",
            "text": closing_msg,
            "questionText": closing_msg,
            "type": "conclusion",
            "timestamp": now
        }
        conversation.append(interviewer_turn)
        session_config["isCompleted"] = True
    else:
        if next_question:
            session_config["activeQuestion"] = next_question
            existing_q_ids = {q.get("id") for q in (interview.questions or [])}
            if next_question.get("id") not in existing_q_ids:
                q_list = list(interview.questions or [])
                q_list.append(next_question)
                interview.questions = q_list

            interviewer_turn = {
                "id": f"msg_{uuid.uuid4().hex[:8]}",
                "role": "interviewer",
                "text": interviewer_reply,
                "questionText": next_question.get("questionText") or next_question.get("question"),
                "topic": next_question.get("topic"),
                "starterCode": next_question.get("starterCode"),
                "codeContext": next_question.get("codeContext"),
                "type": "question",
                "isFollowUp": False,
                "timestamp": now
            }
        else:
            follow_q_text = steer_result.get("followUpQuestionText") or interviewer_reply
            follow_up_q = {
                "id": f"q_{uuid.uuid4().hex[:12]}",
                "question": follow_q_text,
                "questionText": follow_q_text,
                "topic": f"Follow-up: {active_q.get('topic', 'Clarification')}",
                "type": interview.interview_type,
                "evaluationFormat": active_q.get("evaluationFormat") or normalize_format(interview.interview_type),
                "difficulty": interview.difficulty,
                "isFollowUp": True,
                "parentQuestionId": active_q.get("id"),
            }
            session_config["activeQuestion"] = follow_up_q
            q_list = list(interview.questions or [])
            if not any(q.get("id") == follow_up_q["id"] for q in q_list):
                q_list.append(follow_up_q)
                interview.questions = q_list

            interviewer_turn = {
                "id": f"msg_{uuid.uuid4().hex[:8]}",
                "role": "interviewer",
                "text": interviewer_reply,
                "questionText": follow_q_text,
                "questionId": follow_up_q["id"],
                "type": "follow_up",
                "isFollowUp": True,
                "evaluationFormat": follow_up_q["evaluationFormat"],
                "timestamp": now
            }
        conversation.append(interviewer_turn)

    summary["conversation"] = conversation
    summary["sessionConfig"] = session_config
    interview.final_summary = summary

    # Auto-finalize report when target limit reached
    if reached_limit:
        report = await generate_comprehensive_report(
            career_title=interview.career_title,
            format_name=interview.interview_type,
            difficulty=interview.difficulty,
            answers_data=interview.answers,
            status="completed"
        )
        report["sessionConfig"] = session_config
        report["conversation"] = conversation
        interview.final_summary = report
        interview.status = "completed"
        interview.completed_at = now

        profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
        if profile and report.get("overallScore") is not None:
            profile.readiness_breakdown = profile.readiness_breakdown or {}
            profile.readiness_breakdown["interviewReadiness"] = max(
                profile.readiness_breakdown.get("interviewReadiness", 0), report["overallScore"]
            )
            profile.readiness_score = min(98, profile.readiness_score + 2)
            profile.updated_at = now

        db.add(ProgressTimeline(
            id="ev_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            type="interview",
            title=f"Mock Interview Completed ({interview.career_title})",
            description=f"Achieved overall score of {report['overallScore']}% across {len(answers)} answers.",
            timestamp=now
        ))

    db.commit()
    db.refresh(interview)

    return ApiResponse(
        success=True,
        data=format_interview(interview),
        message="Response evaluated and conversation progressed."
    )


@router.post("/{id}/starter-code", response_model=ApiResponse)
async def get_interview_starter_code(id: str, data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(
        Interview.id == id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found or access denied.")

    session_config = dict((interview.final_summary or {}).get("sessionConfig") or {})
    active_question = session_config.get("activeQuestion") or {}
    requested_question_id = str(data.get("questionId") or "")
    if requested_question_id != str(active_question.get("id") or ""):
        raise HTTPException(status_code=409, detail="This question is no longer active. Refresh the interview to continue.")
    if normalize_format(active_question.get("evaluationFormat") or active_question.get("type") or interview.interview_type) != "coding":
        raise HTTPException(status_code=400, detail="Starter code is only available for coding questions.")

    code_language = str(data.get("language") or "").strip().lower()
    if code_language not in {"python", "javascript", "typescript", "java", "cpp", "sql"}:
        raise HTTPException(status_code=400, detail="Choose a supported coding language.")

    session_config["codeLanguage"] = code_language
    interview.final_summary = {**(interview.final_summary or {}), "sessionConfig": session_config}
    db.commit()

    starter_code = await generate_interview_starter_code(
        career_title=interview.career_title,
        difficulty=interview.difficulty,
        question=active_question,
        code_language=code_language,
    )
    return ApiResponse(success=True, data={"starterCode": starter_code, "language": code_language})


@router.post("/{id}/answer", response_model=ApiResponse)
async def submit_legacy_answer(id: str, data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Backward-compatible answer endpoint for legacy integrations and automated tests.
    """
    answer_text = (data.get("answerText") or data.get("answer") or "").strip()
    question_id = data.get("questionId")
    if not question_id or not answer_text:
        raise HTTPException(status_code=400, detail="Question ID and answer text are required.")

    submission_id = hashlib.sha256(f"{question_id}:{answer_text}".encode("utf-8")).hexdigest()[:24]
    return await send_interview_message(id, {
        "questionId": question_id,
        "answer": answer_text,
        "submissionId": submission_id
    }, current_user, db)


@router.post("/{id}/finalize", response_model=ApiResponse)
async def finalize_interview(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Concludes the interview and compiles the comprehensive performance report.
    """
    interview = db.query(Interview).filter(
        Interview.id == id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    if interview.status in {"completed", "ended_early", "incomplete"}:
        return ApiResponse(success=True, data=format_interview(interview), message="Interview is already finalized.")

    answers = interview.answers or []
    session_config = ((interview.final_summary or {}).get("sessionConfig") or {})
    target = int(session_config.get("targetQuestionCount", 5))

    valid_answers = [a for a in answers if a.get("evaluation")]
    completed = len(valid_answers) >= target
    status = "completed" if completed else ("ended_early" if valid_answers else "incomplete")

    report = await generate_comprehensive_report(
        career_title=interview.career_title,
        format_name=interview.interview_type,
        difficulty=interview.difficulty,
        answers_data=answers,
        status=status
    )

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    interview.status = report["status"]
    interview.completed_at = now

    summary = dict(interview.final_summary or {})
    report["sessionConfig"] = summary.get("sessionConfig")
    report["conversation"] = summary.get("conversation")
    interview.final_summary = report

    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if profile and report.get("overallScore") is not None and completed:
        profile.readiness_breakdown = profile.readiness_breakdown or {}
        profile.readiness_breakdown["interviewReadiness"] = max(
            profile.readiness_breakdown.get("interviewReadiness", 60),
            report["overallScore"]
        )
        profile.readiness_score = min(98, profile.readiness_score + 2)
        profile.updated_at = now

    if interview.status == "completed" and report.get("overallScore") is not None:
        db.add(ProgressTimeline(
            id="ev_" + uuid.uuid4().hex[:10],
            user_id=current_user.id,
            type="interview",
            title=f"Mock Interview Completed ({interview.career_title})",
            description=f"Achieved overall score of {report['overallScore']}% across {len(valid_answers)} answers.",
            timestamp=now
        ))

    db.commit()
    db.refresh(interview)

    return ApiResponse(success=True, data=format_interview(interview), message="Interview finalized.")


@router.post("/{id}/end-early", response_model=ApiResponse)
async def end_interview_early(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Gracefully ends an interview ahead of schedule, compiling an honest evaluation of answered questions.
    """
    interview = db.query(Interview).filter(
        Interview.id == id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    if interview.status in {"completed", "ended_early", "incomplete"}:
        return ApiResponse(success=True, data=format_interview(interview), message="Interview is already finalized.")

    answers = interview.answers or []
    valid_answers = [a for a in answers if a.get("evaluation")]
    status = "ended_early" if valid_answers else "incomplete"

    report = await generate_comprehensive_report(
        career_title=interview.career_title,
        format_name=interview.interview_type,
        difficulty=interview.difficulty,
        answers_data=answers,
        status=status
    )

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    interview.status = report["status"]
    interview.completed_at = now

    summary = dict(interview.final_summary or {})
    report["sessionConfig"] = summary.get("sessionConfig")
    report["conversation"] = summary.get("conversation")
    interview.final_summary = report

    db.commit()
    db.refresh(interview)

    return ApiResponse(success=True, data=format_interview(interview), message="Interview concluded early.")
