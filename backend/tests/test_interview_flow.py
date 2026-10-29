import os
import sys
import uuid
from unittest.mock import patch, AsyncMock

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models import Interview, User, CareerProfile


def test_interview_full_flow():
    client = TestClient(app)

    # 1. Login or Register
    email = f"arena_tester_{uuid.uuid4().hex[:8]}@example.com"
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "name": "Alex Tester",
        "targetCareer": "software-developer"
    })
    assert reg_res.status_code == 200, reg_res.text
    token = reg_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Missing Gemini Configuration Behavior (Clean 503 error without crashing)
    print("\n--- 1. Testing Unconfigured Gemini Handling ---")
    with patch("backend.app.services.gemini_service.get_gemini_client", return_value=None):
        start_no_key = client.post("/api/interviews/start", json={
            "careerTitle": "Frontend Developer",
            "format": "Technical Interview",
            "difficulty": "Intermediate",
            "durationMinutes": 15,
            "questionCount": 3
        }, headers=headers)
        assert start_no_key.status_code == 503
        body = start_no_key.json()
        assert body.get("code") == "GEMINI_UNAVAILABLE"
        assert "GEMINI_API_KEY" in body.get("message", "")
    print("[PASS] Successfully confirmed clear 503 GEMINI_UNAVAILABLE response without synthetic fallbacks.")

    # 3. Test Full Lifecycle with Mocked Gemini AI Calls
    print("\n--- 2. Testing End-to-End Mocked Interview Lifecycle ---")
    mock_opening_q = {
        "id": "q_test_101",
        "question": "Can you explain the Virtual DOM in React and how the reconciliation process optimizes DOM updates?",
        "questionText": "Can you explain the Virtual DOM in React and how the reconciliation process optimizes DOM updates?",
        "topic": "React Reconciliation & Virtual DOM",
        "type": "Technical Interview",
        "difficulty": "Intermediate",
        "starterCode": None,
        "codeContext": None,
        "isFollowUp": False,
    }

    mock_q2 = {
        "id": "q_test_102",
        "question": "How do you manage client-side state in complex SPAs? Contrast Context API with external state libraries.",
        "questionText": "How do you manage client-side state in complex SPAs? Contrast Context API with external state libraries.",
        "topic": "State Management Architecture",
        "type": "Technical Interview",
        "difficulty": "Intermediate",
        "starterCode": None,
        "codeContext": None,
        "isFollowUp": False,
    }

    # Test Session Creation (Start Interview)
    req_id = f"req_{uuid.uuid4().hex[:12]}"
    with patch("backend.app.routers.interviews.generate_interview_opening", new=AsyncMock(return_value=("Welcome to your Frontend interview!", mock_opening_q))):
        start_res = client.post("/api/interviews/start", json={
            "careerTitle": "Frontend Developer",
            "format": "Technical Interview",
            "difficulty": "Intermediate",
            "durationMinutes": 15,
            "questionCount": 2,
            "requestId": req_id
        }, headers=headers)

    assert start_res.status_code == 200, start_res.text
    session_data = start_res.json()["data"]
    interview_id = session_data["id"]
    assert session_data["status"] == "in_progress"
    assert len(session_data["questions"]) == 1
    assert session_data["questions"][0]["questionText"] == mock_opening_q["questionText"]
    print("[PASS] Started session:", interview_id)

    # Test Idempotency: Repeating start request with same requestId returns existing session
    with patch("backend.app.routers.interviews.generate_interview_opening", new=AsyncMock(return_value=("Welcome again!", mock_opening_q))):
        dup_start = client.post("/api/interviews/start", json={
            "careerTitle": "Frontend Developer",
            "format": "Technical Interview",
            "difficulty": "Intermediate",
            "durationMinutes": 15,
            "questionCount": 2,
            "requestId": req_id
        }, headers=headers)
    assert dup_start.status_code == 200
    assert dup_start.json()["data"]["id"] == interview_id
    print("[PASS] Confirmed session creation idempotency with requestId.")

    # Test Coaching Hint Generation
    print("\n--- 3. Testing Coaching Hint ---")
    with patch("backend.app.routers.interviews.generate_coaching_hint", new=AsyncMock(return_value="Think about how diffing algorithms work and why direct DOM manipulations are computationally expensive.")):
        hint_res = client.post(f"/api/interviews/{interview_id}/message", json={
            "requestHint": True,
            "questionId": "q_test_101"
        }, headers=headers)
    assert hint_res.status_code == 200
    conv = hint_res.json()["data"]["conversation"]
    assert any(turn.get("role") == "coach" for turn in conv)
    print("[PASS] Successfully requested and received coaching guidance.")

    # Test Submitting Answer 1 (Triggers Follow-up)
    print("\n--- 4. Testing Follow-up Generation & Progress Preservation ---")
    sub_id_1 = f"sub_{uuid.uuid4().hex[:10]}"
    mock_eval_1 = {
        "evaluation": {
            "score": 78,
            "technicalAccuracy": 80,
            "problemSolving": 75,
            "depthOfUnderstanding": 78,
            "practicalApplication": 79,
            "communication": 80,
            "rubricScores": {"technicalAccuracy": 80, "problemSolving": 75, "depthOfUnderstanding": 78, "practicalApplication": 79},
            "strengths": ["Understands that React uses an in-memory representation of real DOM elements."],
            "improvements": ["Could explain the diffing heuristic O(N) complexity assumptions."],
            "suggestedImprovement": "Explain how key props help React identify which items have changed.",
            "idealAnswer": "React reconciliation compares Virtual DOM trees in O(N) time using type and key heuristics."
        },
        "isFollowUp": True,
        "followUpQuestionText": "Could you elaborate on how React's diffing heuristic handles lists with dynamic keys?",
        "interviewerReply": "Good point about in-memory representations.",
        "nextQuestion": None
    }

    with patch("backend.app.routers.interviews.evaluate_answer_and_steer", new=AsyncMock(return_value=mock_eval_1)):
        ans1_res = client.post(f"/api/interviews/{interview_id}/message", json={
            "questionId": "q_test_101",
            "answer": "The Virtual DOM is a lightweight JavaScript representation of the DOM. React updates it first, compares it with the previous snapshot, and only patches the real DOM where needed.",
            "submissionId": sub_id_1
        }, headers=headers)

    assert ans1_res.status_code == 200, ans1_res.text
    ans1_data = ans1_res.json()["data"]
    assert ans1_data["status"] == "in_progress"
    # Main question count should still be 1 because this was a follow-up
    last_turn = ans1_data["conversation"][-1]
    assert last_turn.get("isFollowUp") is True
    assert "keys" in last_turn.get("questionText", "").lower()
    print("[PASS] Successfully generated and received contextual follow-up question.")

    # Test Idempotent Answer: Resubmitting identical submissionId does not duplicate
    dup_ans_res = client.post(f"/api/interviews/{interview_id}/message", json={
        "questionId": "q_test_101",
        "answer": "The Virtual DOM is a lightweight JavaScript representation of the DOM...",
        "submissionId": sub_id_1
    }, headers=headers)
    assert dup_ans_res.status_code == 200
    assert len(dup_ans_res.json()["data"]["answers"]) == 1
    print("[PASS] Confirmed answer submission idempotency with submissionId.")

    # Test Answering Follow-up (Advances to Question 2)
    print("\n--- 5. Testing Follow-up Answer & Advancement to Question 2 ---")
    mock_eval_followup = {
        "evaluation": {
            "score": 85,
            "technicalAccuracy": 85,
            "problemSolving": 85,
            "depthOfUnderstanding": 84,
            "practicalApplication": 86,
            "communication": 85,
            "rubricScores": {"technicalAccuracy": 85, "problemSolving": 85, "depthOfUnderstanding": 84, "practicalApplication": 86},
            "strengths": ["Correctly highlighted that stable keys prevent complete subtree re-mounting."],
            "improvements": ["Briefly mention why index keys can cause state bugs in sorted lists."],
            "suggestedImprovement": "Warn against using array indices for reorderable collections.",
            "idealAnswer": "Unique keys preserve component state across renders."
        },
        "isFollowUp": False,
        "interviewerReply": "Excellent explanation of list keys.",
        "nextQuestion": mock_q2
    }

    sub_id_followup = f"sub_{uuid.uuid4().hex[:10]}"
    with patch("backend.app.routers.interviews.evaluate_answer_and_steer", new=AsyncMock(return_value=mock_eval_followup)):
        ans_fu_res = client.post(f"/api/interviews/{interview_id}/message", json={
            "questionId": "q_test_101",
            "answer": "Keys provide identity to elements in a list. Without keys, React re-renders every item. Stable keys enable efficient reordering and state preservation.",
            "submissionId": sub_id_followup
        }, headers=headers)

    assert ans_fu_res.status_code == 200, ans_fu_res.text
    ans_fu_data = ans_fu_res.json()["data"]
    assert len(ans_fu_data["questions"]) in [2, 3]
    assert any(q["id"] == "q_test_102" for q in ans_fu_data["questions"])
    print("[PASS] Answered follow-up and advanced to Question 2.")

    # Test Answering Question 2 (Completes Target Limit of 2 Questions)
    print("\n--- 6. Testing Final Question & Auto-Finalization ---")
    mock_eval_q2 = {
        "evaluation": {
            "score": 88,
            "technicalAccuracy": 90,
            "problemSolving": 88,
            "depthOfUnderstanding": 86,
            "practicalApplication": 88,
            "communication": 90,
            "rubricScores": {"technicalAccuracy": 90, "problemSolving": 88, "depthOfUnderstanding": 86, "practicalApplication": 88},
            "strengths": ["Clear breakdown between prop drilling and external store subscriptions."],
            "improvements": ["Quantify re-render impacts with selector patterns."],
            "suggestedImprovement": "Discuss useSyncExternalStore or Zustand atomic selectors.",
            "idealAnswer": "Use Context for infrequent global data and external stores for high-velocity updates."
        },
        "isFollowUp": False,
        "interviewerReply": "Very clear architectural comparison.",
        "nextQuestion": None
    }

    sub_id_q2 = f"sub_{uuid.uuid4().hex[:10]}"
    with patch("backend.app.routers.interviews.evaluate_answer_and_steer", new=AsyncMock(return_value=mock_eval_q2)):
        ans_q2_res = client.post(f"/api/interviews/{interview_id}/message", json={
            "questionId": "q_test_102",
            "answer": "Context API is ideal for low-frequency updates like themes or user authentication. For high-frequency state, external stores like Zustand or Redux Toolkit prevent unnecessary consumer re-renders via selectors.",
            "submissionId": sub_id_q2
        }, headers=headers)

    assert ans_q2_res.status_code == 200, ans_q2_res.text
    final_data = ans_q2_res.json()["data"]
    assert final_data["status"] == "completed"
    assert final_data["overallScore"] is not None
    # Score is average of evaluated answers (78, 85, 88) -> 84%
    assert 80 <= final_data["overallScore"] <= 90
    assert final_data["finalSummary"]["questionsAnswered"] == 3
    assert len(final_data["finalSummary"]["perQuestionFeedback"]) == 3
    print(f"[PASS] Interview completed! Final Score: {final_data['overallScore']}%, Status: {final_data['status']}")

    # 4. Test Ending Early with 0 Answers (Must NOT Invent a 60% Passing Score!)
    print("\n--- 7. Testing End Early with 0 Answers ---")
    with patch("backend.app.routers.interviews.generate_interview_opening", new=AsyncMock(return_value=("Welcome!", mock_opening_q))):
        zero_session = client.post("/api/interviews/start", json={
            "careerTitle": "Backend Developer",
            "format": "Technical Interview",
            "difficulty": "Beginner",
            "durationMinutes": 10,
            "questionCount": 3,
            "requestId": f"req_zero_{uuid.uuid4().hex[:8]}"
        }, headers=headers).json()["data"]

    zero_id = zero_session["id"]
    end_early_res = client.post(f"/api/interviews/{zero_id}/end-early", headers=headers)
    assert end_early_res.status_code == 200
    zero_report = end_early_res.json()["data"]
    assert zero_report["status"] in {"ended_early", "incomplete"}
    assert zero_report["overallScore"] is None, "Session with 0 answers must have overallScore as None, NEVER 60%!"
    print("[PASS] Confirmed: Session ended with 0 answers has overallScore=None and status=ended_early/incomplete.")

    # 5. Test History and Resumption
    print("\n--- 8. Testing History Retrieval & Session Resumption ---")
    hist_res = client.get("/api/interviews", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()["data"]
    assert len(history) >= 2
    # Verify the completed session has valid overallScore, and zero-answer session has None
    completed_in_hist = next(s for s in history if s["id"] == interview_id)
    assert completed_in_hist["status"] == "completed"
    assert completed_in_hist["overallScore"] is not None

    zero_in_hist = next(s for s in history if s["id"] == zero_id)
    assert zero_in_hist["status"] in {"ended_early", "incomplete"}
    assert zero_in_hist["overallScore"] is None
    print("[PASS] History statistics and statuses accurately match persisted backend state.")

    # 6. Test Security: Another user cannot access or submit to this session
    print("\n--- 9. Testing Authentication & Session Ownership Security ---")
    other_reg = client.post("/api/auth/register", json={
        "email": f"other_user_{uuid.uuid4().hex[:8]}@example.com",
        "password": "SecurePassword123!",
        "name": "Intruder User",
        "targetCareer": "backend-developer"
    })
    other_token = other_reg.json()["data"]["token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    forbidden_get = client.get(f"/api/interviews/{interview_id}", headers=other_headers)
    assert forbidden_get.status_code == 404, "User must not access another candidate's interview"

    forbidden_msg = client.post(f"/api/interviews/{interview_id}/message", json={"answer": "Hacked response"}, headers=other_headers)
    assert forbidden_msg.status_code == 404, "User must not submit messages to another candidate's interview"
    print("[PASS] Confirmed strict session ownership and unauthorized access rejection.")

    print("\n=======================================================")
    print("ALL 9 CRITICAL INTERVIEW ARENA INTEGRATION TESTS PASSED!")
    print("=======================================================")


if __name__ == "__main__":
    test_interview_full_flow()
