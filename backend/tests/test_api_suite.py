import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_lifecycle():
    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["engine"] == "local_career_intelligence"

    # 2. Register user
    reg_payload = {
        "email": "test_student@example.com",
        "password": "SecurePassword123!",
        "name": "Jane Doe",
        "currentEducation": "Undergraduate",
        "fieldOfStudy": "Computer Science",
        "yearOfStudy": "3rd Year",
        "targetCareer": "software-developer"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    if res.status_code in [400, 409] and ("already" in res.text or "exists" in res.text):
        # User already registered from previous run, log in
        login_res = client.post("/api/auth/login", json={
            "email": "test_student@example.com",
            "password": "SecurePassword123!"
        })
        assert login_res.status_code == 200
        token = login_res.json()["data"]["token"]
    else:
        assert res.status_code == 200
        token = res.json()["data"]["token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Check /api/auth/me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_info = me_res.json()["data"]
    assert user_info["email"] == "test_student@example.com"

    # 4. Onboarding profile update
    onboarding_payload = {
        "education": {
            "degree": "Bachelor of Technology / B.S.",
            "department": "Computer Science & Engineering",
            "institution": "Tech University",
            "graduationYear": "2026",
            "academicPerformance": "85% / 3.8 CGPA"
        },
        "technicalSkills": [
            {"name": "Python", "category": "Programming", "level": 80},
            {"name": "React", "category": "Web Development", "level": 65},
            {"name": "SQL", "category": "Databases", "level": 75},
            {"name": "Git", "category": "Tools & Others", "level": 85}
        ],
        "softSkills": ["Problem Solving", "Technical Communication", "Agile Collaboration"],
        "interests": ["Full-Stack Web Development", "Cloud & Distributed Systems"],
        "experience": {
            "projects": [
                {
                    "title": "Campus Resource Planner",
                    "description": "Full-stack web application with role-based access",
                    "techStack": ["React", "FastAPI", "PostgreSQL"]
                }
            ],
            "internships": [],
            "certifications": [],
            "hackathons": [],
            "achievements": []
        },
        "careerGoals": {
            "preferredAreas": ["Software Engineering"],
            "desiredRole": "Software Developer"
        },
        "workPreferences": {
            "workStyle": "Flexible",
            "focus": "Product Engineering",
            "domain": "Web Development",
            "orgType": "Startup",
            "location": "Hybrid"
        }
    }
    onb_res = client.post("/api/profile/onboarding", json=onboarding_payload, headers=headers)
    assert onb_res.status_code == 200
    profile_data = onb_res.json()["data"]
    assert profile_data["readinessScore"] > 0
    assert profile_data["matchPercentage"] > 0

    # 5. Career catalog
    cat_res = client.get("/api/careers/catalog")
    assert cat_res.status_code == 200
    catalog = cat_res.json()["data"]
    assert len(catalog) >= 10

    # 6. Career recommendations (Independent Python Engine)
    recs_res = client.get("/api/careers/recommendations", headers=headers)
    assert recs_res.status_code == 200
    recs = recs_res.json()["data"]
    assert len(recs) > 0
    top_role = recs[0]
    assert "matchPercentage" in top_role
    assert "matchExplanation" in top_role
    assert "strongFactors" in top_role
    assert "missingFactors" in top_role

    # 7. Skill-gap analysis (Independent Python Engine)
    gap_res = client.get("/api/careers/gap-analysis?role=software-developer", headers=headers)
    assert gap_res.status_code == 200
    gap = gap_res.json()["data"]
    assert "skills" in gap
    assert "categorized" in gap
    assert "missingEssential" in gap["categorized"]
    assert "summary" in gap

    # 8. Assessment questions
    q_res = client.get("/api/assessment/questions")
    assert q_res.status_code == 200
    questions = q_res.json()["data"]["questions"]
    assert len(questions) >= 10

    # 9. Submit assessment
    answers = [
        {"questionId": q["id"], "selectedOption": q["options"][0]["text"]}
        for q in questions
    ]
    sub_res = client.post("/api/assessment/submit", json={"answers": answers}, headers=headers)
    assert sub_res.status_code == 200
    assessment_result = sub_res.json()["data"]
    assert assessment_result["isCompleted"] is True
    assert len(assessment_result["categoryScores"]) > 0

    # 10. Generate and fetch Learning Roadmap
    rm_gen = client.post("/api/roadmap/generate", json={"careerId": "software-developer"}, headers=headers)
    assert rm_gen.status_code == 200
    rm = rm_gen.json()["data"]
    assert len(rm["phases"]) >= 4

    phase0 = rm["phases"][0]
    task0 = phase0["learningTasks"][0]
    
    # 11. Toggle task progress
    toggle_res = client.patch("/api/roadmap/task", json={
        "phaseId": phase0["id"],
        "taskId": task0["id"],
        "taskType": "learning"
    }, headers=headers)
    assert toggle_res.status_code == 200
    updated_rm = toggle_res.json()["data"]
    assert updated_rm["overallProgress"] >= 0

    # 12. Skill Evidence CRUD
    ev_res = client.post("/api/evidence", json={
        "skillName": "Python",
        "evidenceType": "github_repo",
        "title": "Full-Stack Task API in FastAPI",
        "url": "https://github.com/janedoe/fastapi-task-api",
        "description": "Production REST API with JWT and SQLAlchemy SQLite persistence"
    }, headers=headers)
    assert ev_res.status_code == 200
    ev_id = ev_res.json()["data"]["id"]

    ev_list = client.get("/api/evidence", headers=headers)
    assert ev_list.status_code == 200
    assert len(ev_list.json()["data"]) >= 1

    # 13. Interview Arena simulation
    interview_start = client.post("/api/interviews/start", json={
        "careerTitle": "Software Developer",
        "difficulty": "Entry-Level",
        "interviewType": "Technical"
    }, headers=headers)
    if interview_start.status_code == 503:
        body = interview_start.json()
        assert body.get("code") == "GEMINI_UNAVAILABLE"
        assert "GEMINI_API_KEY" in body.get("message", "")
        print("Interview Arena correctly reports missing Gemini configuration; live generation safely guarded.")
    else:
        assert interview_start.status_code == 200
        interview = interview_start.json()["data"]
        interview_id = interview["id"]
        first_q = interview["questions"][0]

        # Answer question
        ans_res = client.post(f"/api/interviews/{interview_id}/answer", json={
            "questionId": first_q["id"],
            "answerText": "A REST API uses HTTP methods like GET, POST, PUT, DELETE with stateless communication, resource URIs, and standard JSON formats."
        }, headers=headers)
        if ans_res.status_code == 503:
            assert ans_res.json().get("code") == "GEMINI_UNAVAILABLE"
        else:
            assert ans_res.status_code == 200
            fin_res = client.post(f"/api/interviews/{interview_id}/finalize", headers=headers)
            assert fin_res.status_code == 200
            fin_data = fin_res.json()["data"]
            assert fin_data["status"] in ["completed", "ended_early"]
            assert fin_data["finalSummary"]["overallScore"] is not None

    # 14. Employability Readiness & Timeline
    emp_res = client.get("/api/progress/employability", headers=headers)
    assert emp_res.status_code == 200
    emp_data = emp_res.json()["data"]
    assert "overallEstimate" in emp_data
    assert "metrics" in emp_data

    timeline_res = client.get("/api/progress/timeline", headers=headers)
    assert timeline_res.status_code == 200
    assert len(timeline_res.json()["data"]) >= 1

    # 15. Insights
    insights_res = client.get("/api/insights", headers=headers)
    assert insights_res.status_code == 200
    insights = insights_res.json()["data"]
    assert len(insights) > 0

    # 16. Resume Analysis (Independent Python Text Engine)
    sample_resume = """
    Jane Doe
    Software Developer | jane@example.com | github.com/janedoe
    
    Summary:
    Motivated computer science student with hands-on experience developing REST APIs, web apps, and relational database systems.
    
    Education:
    B.S. in Computer Science, Tech University, Expected 2027. GPA: 3.8/4.0.
    
    Technical Skills:
    Python, FastAPI, React, TypeScript, JavaScript, SQL, PostgreSQL, Docker, Git, REST APIs, System Design.
    
    Projects:
    Full-Stack Task Planner:
    - Developed full-stack web application using React and FastAPI.
    - Improved query execution speed by 35% using indexing and connection pooling.
    - Containerized application with Docker and orchestrated with docker-compose.
    """
    resume_res = client.post("/api/resume/analyze", json={
        "targetRole": "Software Developer",
        "resumeText": sample_resume
    }, headers=headers)
    assert resume_res.status_code == 200
    analysis = resume_res.json()["data"]
    assert analysis["overallScore"] >= 50
    assert "Python" in analysis["detectedSkills"]
    assert "FastAPI" in analysis["detectedSkills"]
    assert len(analysis["sections"]) >= 3

    # 17. Chatbot (Graceful local advisor engine test)
    chat_res = client.post("/api/chat/message", json={
        "message": "What skills do I need to learn next for software developer?"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()["data"]
    assert len(chat_data["reply"]) > 20
    assert "mode" in chat_data

    chat_hist = client.get("/api/chat/history", headers=headers)
    assert chat_hist.status_code == 200
    assert len(chat_hist.json()["data"]) >= 2

    print("ALL API AND LOCAL CAREER ENGINE INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_lifecycle()
