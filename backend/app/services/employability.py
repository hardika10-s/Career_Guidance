from typing import List, Dict, Any, Optional

def calculate_employability(
    profile_data: Dict[str, Any],
    assessment_data: Optional[Dict[str, Any]] = None,
    evidences: List[Dict[str, Any]] = [],
    interviews: List[Dict[str, Any]] = []
) -> Dict[str, Any]:
    technical_skills = profile_data.get("technical_skills") or profile_data.get("technicalSkills") or []
    soft_skills = profile_data.get("soft_skills") or profile_data.get("softSkills") or []
    experience = profile_data.get("experience") or {}
    projects = experience.get("projects") or []
    internships = experience.get("internships") or []
    certifications = experience.get("certifications") or []

    # 1. Technical Skills Score (0-100)
    tech_score = 35
    if technical_skills:
        avg_prof = sum(s.get("level", 50) for s in technical_skills) / len(technical_skills)
        breadth = min(25, len(technical_skills) * 3.5)
        tech_score = int(min(95, round(avg_prof * 0.7 + breadth)))

    # 2. Practical Projects Score (0-100)
    project_score = 30
    if projects:
        pts = len(projects) * 18
        for p in projects:
            if p.get("link"):
                pts += 8
            if len(p.get("techStack") or []) >= 3:
                pts += 6
            if len(p.get("description") or "") > 50:
                pts += 6
        project_score = int(min(95, round(30 + pts)))
    if internships:
        project_score = int(min(98, project_score + len(internships) * 10))

    # 3. Soft Skills & Communication (0-100)
    comm_score = 45
    if len(soft_skills) >= 4:
        comm_score = 80
    elif len(soft_skills) >= 2:
        comm_score = 65
    elif len(soft_skills) >= 1:
        comm_score = 55

    # 4. Problem Solving (0-100)
    prob_score = 50
    if assessment_data and assessment_data.get("is_completed"):
        cat_scores = assessment_data.get("category_scores") or {}
        prob_score = int(min(95, round(cat_scores.get("Problem Solving", cat_scores.get("Skills", 70)))))
    elif any("algorithm" in s.get("name", "").lower() or "structure" in s.get("name", "").lower() for s in technical_skills):
        prob_score = 72

    # 5. Certifications & Evidence (0-100)
    cert_score = 25
    if certifications:
        cert_score = int(min(90, 40 + len(certifications) * 18))
    if evidences:
        cert_score = int(min(95, cert_score + len(evidences) * 12))

    # 6. Interview Simulation Readiness (0-100)
    interview_score = 40
    completed_interviews = [i for i in interviews if i.get("status") == "completed"]
    if completed_interviews:
        avg_int = sum((i.get("final_summary") or {}).get("overallScore", 70) for i in completed_interviews) / len(completed_interviews)
        interview_score = int(min(95, round(avg_int)))
    elif internships:
        interview_score = 62

    # Multi-factor weighted aggregate
    overall = int(round(
        tech_score * 0.30 +
        project_score * 0.25 +
        prob_score * 0.15 +
        comm_score * 0.10 +
        cert_score * 0.10 +
        interview_score * 0.10
    ))

    bounded_overall = min(95, max(30, overall))

    # Strengths
    strengths = []
    if tech_score >= 75:
        strengths.append(f"Demonstrated technical competencies across {len(technical_skills)} declared skills")
    if project_score >= 70:
        strengths.append(f"Hands-on project execution with {len(projects)} portfolio projects")
    if interview_score >= 70:
        strengths.append("Demonstrated clarity in mock interview scenarios")
    if cert_score >= 70:
        strengths.append("Verifiable proof through external portfolio evidence and certifications")
    if not strengths:
        strengths = ["Academic foundation and coursework completion", "Structured career trajectory alignment"]

    # Areas for Improvement
    areas_for_improvement = []
    if not evidences:
        areas_for_improvement.append("Add verifiable public GitHub repositories or live project demos to Proof of Skills")
    if not completed_interviews:
        areas_for_improvement.append("Complete at least one technical mock interview session in the Interview Arena")
    if project_score < 65:
        areas_for_improvement.append("Build a production-grade capstone project with automated tests and CI/CD pipelines")
    if not areas_for_improvement:
        areas_for_improvement.append("Profile query latency and document system architecture benchmarks")

    next_best_action = "Build and deploy a full-stack project demonstrating API error handling and database modeling."
    if not evidences:
        next_best_action = "Submit your primary project GitHub repository into the Proof of Skills tracker."
    elif not completed_interviews:
        next_best_action = "Start a 5-question Technical Mock Interview session in the Interview Arena."
    elif len(technical_skills) < 5:
        next_best_action = "Add your primary programming and web development proficiencies to your profile."

    biggest_opportunity = areas_for_improvement[0] if areas_for_improvement else "Deepen automated test coverage and containerization"

    score_explanation = (
        f"Overall employability readiness of {bounded_overall}% is synthesized from your Technical Skills ({tech_score}%), "
        f"Projects ({project_score}%), Problem Solving ({prob_score}%), Soft Skills ({comm_score}%), "
        f"Evidence & Certifications ({cert_score}%), and Interview Simulation ({interview_score}%). "
        f"Note: This is an internal developmental benchmark, not a commercial hiring guarantee."
    )

    confidence = "High" if len(technical_skills) >= 4 and len(projects) >= 2 else "Moderate" if len(technical_skills) >= 2 else "Preliminary"

    return {
        "readinessScore": bounded_overall,
        "readinessBreakdown": {
            "technicalSkills": tech_score,
            "projects": project_score,
            "communication": comm_score,
            "problemSolving": prob_score,
            "certifications": cert_score,
            "interviewReadiness": interview_score,
        },
        "strengths": strengths,
        "areasForImprovement": areas_for_improvement,
        "nextBestAction": next_best_action,
        "biggestOpportunity": biggest_opportunity,
        "scoreExplanation": score_explanation,
        "confidenceIndicator": confidence,
    }
