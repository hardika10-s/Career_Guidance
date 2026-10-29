import os
import sys
import uuid
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from backend.app.main import app

def test_live_interview_journey():
    client = TestClient(app)

    # 1. Register a test student
    email = f"live_tester_{uuid.uuid4().hex[:8]}@example.com"
    reg = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "name": "Live Candidate",
        "targetCareer": "software-developer"
    })
    assert reg.status_code == 200, reg.text
    token = reg.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check health endpoint
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["gemini_configured"] is True, "Gemini should be configured"
    print("[PASS] Gemini is confirmed configured.")

    # 3. Start a live interview session with real Gemini AI
    print("[INFO] Starting interview with live Gemini AI...")
    req_id = f"req_{uuid.uuid4().hex[:12]}"
    start_res = client.post("/api/interviews/start", json={
        "careerTitle": "Software Developer",
        "format": "Technical Interview",
        "difficulty": "Intermediate",
        "durationMinutes": 10,
        "questionCount": 2,
        "mode": "coaching",
        "requestId": req_id
    }, headers=headers)

    assert start_res.status_code == 200, f"Failed to start live session: {start_res.text}"
    session = start_res.json()["data"]
    interview_id = session["id"]
    assert session["status"] == "in_progress"
    assert len(session["questions"]) == 1
    q1 = session["questions"][0]
    assert len(q1.get("questionText", "")) > 10
    print(f"[PASS] Started live session {interview_id}.")
    print(f"       Question 1: {q1['questionText'][:80]}...")

    # 4. Request a live coaching hint
    print("[INFO] Requesting coaching hint with live Gemini AI...")
    hint_res = client.post(f"/api/interviews/{interview_id}/message", json={
        "requestHint": True,
        "questionId": q1["id"]
    }, headers=headers)
    assert hint_res.status_code == 200
    hint_data = hint_res.json()["data"]
    last_hint_turn = hint_data["conversation"][-1]
    assert last_hint_turn["role"] == "coach"
    assert len(last_hint_turn["text"]) > 10
    print(f"[PASS] Received coaching hint: {last_hint_turn['text'][:80]}...")

    # 5. Submit candidate answer with real Gemini evaluation
    print("[INFO] Submitting answer to Question 1 with live Gemini evaluation...")
    sub_id_1 = f"sub_{uuid.uuid4().hex[:10]}"
    ans_res = client.post(f"/api/interviews/{interview_id}/message", json={
        "questionId": q1["id"],
        "answer": "In relational databases, indexes use B-Tree data structures to provide O(log N) lookup time. Without an index, the engine must perform a full table scan. Proper indexing on foreign keys and frequently queried columns prevents slow queries.",
        "submissionId": sub_id_1
    }, headers=headers)

    assert ans_res.status_code == 200, f"Evaluation failed: {ans_res.text}"
    ans_data = ans_res.json()["data"]
    assert len(ans_data["answers"]) == 1
    eval1 = ans_data["answers"][0]["evaluation"]
    assert eval1 is not None
    assert 0 <= eval1["score"] <= 100
    assert "rubricScores" in eval1
    print(f"[PASS] Question 1 evaluated! Score: {eval1['score']}%.")
    print(f"       Strengths: {eval1.get('strengths', [])[:2]}")

    # 6. Test ending early and verifying honest report
    print("[INFO] Concluding interview and checking honest report...")
    fin_res = client.post(f"/api/interviews/{interview_id}/end-early", headers=headers)
    assert fin_res.status_code == 200
    fin_data = fin_res.json()["data"]
    assert fin_data["status"] == "ended_early"
    assert fin_data["overallScore"] == eval1["score"]
    report = fin_data["finalSummary"]
    assert report["questionsAnswered"] == 1
    assert len(report["perQuestionFeedback"]) == 1
    assert report["perQuestionFeedback"][0]["score"] == eval1["score"]
    print(f"[PASS] Report compiled with honest score: {fin_data['overallScore']}%.")

    # 7. Check historical session retrieval
    hist_res = client.get(f"/api/interviews/{interview_id}", headers=headers)
    assert hist_res.status_code == 200
    retrieved = hist_res.json()["data"]
    assert retrieved["id"] == interview_id
    assert retrieved["overallScore"] == fin_data["overallScore"]
    print(f"[PASS] Reopening persisted report verified.")

    print("\n=======================================================")
    print("LIVE GEMINI END-TO-END INTERVIEW JOURNEY FULLY VERIFIED!")
    print("=======================================================")

if __name__ == "__main__":
    test_live_interview_journey()
