from typing import List, Dict, Any, Optional

def match_skill_level(user_skills: List[Dict[str, Any]], target_name: str) -> int:
    t = target_name.lower().strip()
    for s in user_skills:
        u = s.get("name", "").lower().strip()
        if u == t or t in u or u in t:
            return s.get("level", 50)
        # Token overlap
        u_toks = [w for w in u.split() if len(w) > 2]
        t_toks = [w for w in t.split() if len(w) > 2]
        if any(ut in t_toks for ut in u_toks):
            return s.get("level", 50)
    return 0

def calculate_skill_gap(
    profile_data: Dict[str, Any],
    target_career: Dict[str, Any],
    learning_resources: List[Dict[str, Any]] = []
) -> Dict[str, Any]:
    user_skills = profile_data.get("technical_skills") or profile_data.get("technicalSkills") or []
    core_skills = target_career.get("core_technical_skills") or target_career.get("coreTechnicalSkills") or []
    target_title = target_career.get("title", "Target Role")
    target_id = target_career.get("id", "")

    total_gap_points = 0
    total_benchmark_points = 0
    evaluated_skills = []

    for req in core_skills:
        req_name = req.get("name", "")
        current_lvl = match_skill_level(user_skills, req_name)
        target_lvl = req.get("defaultLevel", 80)
        gap = max(0, target_lvl - current_lvl)
        importance = req.get("importance", "High")
        cat = req.get("category", "Programming")

        if current_lvl >= 75:
            status = "have"
        elif current_lvl >= 40:
            status = "developing"
        elif importance in ("Medium", "Optional"):
            status = "optional"
        else:
            status = "need"

        total_gap_points += gap
        total_benchmark_points += target_lvl

        # Match learning resource
        matched_resource = None
        for res in learning_resources:
            related = [r.lower() for r in (res.get("related_skills") or res.get("relatedSkills") or [])]
            if any(req_name.lower() in r or r in req_name.lower() for r in related) or res.get("category") == cat:
                matched_resource = res
                break

        why_it_matters = f"Essential industry standard for professional {target_title} execution and code quality."
        if "SQL" in req_name or "Database" in req_name:
            why_it_matters = "Crucial for transactional data integrity, schema normalization, and query performance."
        elif "Docker" in req_name or "Cloud" in req_name or "DevOps" in req_name:
            why_it_matters = "Required for repeatable container packaging, environment parity, and CI/CD pipelines."
        elif "React" in req_name or "Frontend" in req_name or "UI" in req_name:
            why_it_matters = "Foundational for responsive component state architecture, client routing, and accessibility."
        elif "Test" in req_name or "QA" in req_name:
            why_it_matters = "Guarantees software stability, automated regression prevention, and clean releases."

        if status == "have":
            action = f"Document verifiable GitHub proof and complete an advanced benchmark or code review."
        elif status == "developing":
            action = f"Implement an end-to-end hands-on project utilizing {req_name} with automated tests."
        else:
            action = f"Complete foundational coursework on {req_name} fundamentals followed by interactive sandboxes."

        evaluated_skills.append({
            "name": req_name,
            "category": cat,
            "status": status,
            "currentLevel": current_lvl,
            "targetLevel": target_lvl,
            "gap": gap,
            "importance": importance,
            "whyItMatters": why_it_matters,
            "recommendedAction": action,
            "recommendedResourceUrl": matched_resource.get("url") if matched_resource else None,
            "recommendedResourceTitle": matched_resource.get("title") if matched_resource else None,
        })

    demonstrated = [s for s in evaluated_skills if s["status"] == "have"]
    developing = [s for s in evaluated_skills if s["status"] == "developing"]
    missing_essential = [s for s in evaluated_skills if s["status"] == "need"]
    optional_opps = [s for s in evaluated_skills if s["status"] == "optional"]

    overall_gap_score = int(round((total_gap_points / max(1, total_benchmark_points)) * 100))

    summary = (
        f"Skill-gap evaluation against {target_title}: You have demonstrated mastery in {len(demonstrated)} "
        f"of {len(evaluated_skills)} competencies, with {len(developing)} skills in active development "
        f"and {len(missing_essential)} essential competencies requiring targeted focus."
    )

    return {
        "targetRole": target_title,
        "careerTitle": target_title,
        "targetRoleId": target_id,
        "summary": summary,
        "overallGapScore": overall_gap_score,
        "matchPercentage": max(30, 100 - overall_gap_score),
        "overallReadiness": max(30, 100 - overall_gap_score),
        "skills": evaluated_skills,
        "categorized": {
            "demonstrated": demonstrated,
            "developing": developing,
            "missingEssential": missing_essential,
            "optionalOpportunities": optional_opps,
        }
    }
