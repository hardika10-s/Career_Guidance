import re
from typing import List, Dict, Any, Optional

def is_skill_match(candidate_skill: str, required_skill: str) -> bool:
    c = candidate_skill.lower().strip()
    r = required_skill.lower().strip()
    if c == r:
        return True
    if r in c or c in r:
        return True
    c_tokens = [w for w in re.split(r"[\s,./&+-]+", c) if len(w) > 2]
    r_tokens = [w for w in re.split(r"[\s,./&+-]+", r) if len(w) > 2]
    return any(ct in r_tokens or any(rt in ct or ct in rt for rt in r_tokens) for ct in c_tokens)

def calculate_career_recommendations(
    profile_data: Dict[str, Any],
    assessment_data: Optional[Dict[str, Any]],
    catalog_careers: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    if not catalog_careers:
        return []

    user_skills = profile_data.get("technical_skills") or profile_data.get("technicalSkills") or []
    user_interests = [i.lower() for i in (profile_data.get("interests") or [])]
    user_experience = profile_data.get("experience") or {}
    user_projects = user_experience.get("projects") or []
    user_internships = user_experience.get("internships") or []
    user_certifications = user_experience.get("certifications") or []
    career_goals = profile_data.get("career_goals") or profile_data.get("careerGoals") or {}
    desired_role = (career_goals.get("desiredRole") or career_goals.get("desired_role") or "").lower()
    
    education = profile_data.get("education") or {}
    degree = (education.get("degree") or "").lower()
    department = (education.get("department") or "").lower()

    scored_careers = []

    for idx, career in enumerate(catalog_careers):
        core_skills = career.get("core_technical_skills") or career.get("coreTechnicalSkills") or []
        
        # 1. Skill Match Score (Weight: 45%)
        skill_score_sum = 0.0
        total_skill_weight = 0.0
        strong_factors = []
        missing_factors = []
        matched_skill_names = set()

        for req_skill in core_skills:
            importance = req_skill.get("importance", "High")
            importance_weight = 1.0 if importance == "Essential" else 0.75 if importance == "High" else 0.5
            total_skill_weight += importance_weight

            req_name = req_skill.get("name", "")
            target_benchmark = req_skill.get("defaultLevel", 75)

            matched_user_skill = None
            for us in user_skills:
                us_name = us.get("name", "")
                if is_skill_match(us_name, req_name):
                    matched_user_skill = us
                    break

            if matched_user_skill:
                matched_skill_names.add(req_name)
                level = matched_user_skill.get("level", 50)
                level_ratio = min(1.15, level / max(1, target_benchmark))
                skill_point = level_ratio * 100 * importance_weight
                skill_score_sum += min(100.0 * importance_weight, skill_point)

                if level >= 65 and len(strong_factors) < 3:
                    strong_factors.append(f"Demonstrated proficiency in {req_name} ({level}%)")
            else:
                if importance in ("Essential", "High") and len(missing_factors) < 3:
                    missing_factors.append(f"{req_name} benchmark proficiency")

        skill_score = (skill_score_sum / total_skill_weight) if total_skill_weight > 0 else 50.0

        # 2. Interest & Goal Alignment (Weight: 20%)
        interest_score = 40.0
        title_lower = career.get("title", "").lower()
        category_lower = career.get("category", "").lower()
        desc_lower = career.get("description", "").lower()

        if desired_role and (desired_role in title_lower or title_lower in desired_role):
            interest_score += 45.0
            strong_factors.append(f"Direct alignment with your declared career goal: \"{career.get('title')}\"")

        for interest in user_interests:
            if interest in title_lower or interest in category_lower or interest in desc_lower:
                interest_score += 15.0
        interest_score = min(100.0, interest_score)

        # 3. Education Relevance Score (Weight: 15%)
        education_score = 65.0
        tech_depts = ["computer", "software", "information", "data", "ai", "electrical", "electronic", "mathematics"]
        if any(d in department or d in degree for d in tech_depts):
            education_score = 88.0
        
        perf = (education.get("academicPerformance") or "").lower()
        if any(k in perf for k in ["9", "8.", "85%", "90%", "first class"]):
            education_score = min(100.0, education_score + 7.0)

        # 4. Experience & Practical Projects (Weight: 10%)
        experience_score = 40.0
        matching_projects = 0
        for proj in user_projects:
            p_stack = " ".join(proj.get("techStack") or []).lower()
            p_text = f"{proj.get('title', '')} {proj.get('description', '')}".lower()
            has_overlap = any(
                s.get("name", "").lower() in p_stack or s.get("name", "").lower() in p_text
                for s in core_skills
            )
            if has_overlap:
                matching_projects += 1

        experience_score += matching_projects * 18.0
        if user_internships:
            experience_score += 15.0
        if user_certifications:
            experience_score += 10.0
        experience_score = min(100.0, experience_score)

        if matching_projects > 0 and len(strong_factors) < 3:
            strong_factors.append(f"Practical project experience applied in {matching_projects} relevant domain project(s)")

        # 5. Assessment Signals (Weight: 10%)
        assessment_score = 70.0
        if assessment_data and assessment_data.get("is_completed"):
            ai_analysis = assessment_data.get("ai_analysis") or {}
            dominant = (ai_analysis.get("dominantArchetype") or "").lower()
            c_id = career.get("id", "")
            if "systems" in dominant and ("developer" in c_id or "cloud" in c_id or "backend" in c_id):
                assessment_score += 20.0
            elif "data" in dominant and ("data" in c_id or "analyst" in c_id or "scientist" in c_id):
                assessment_score += 20.0
            elif "builder" in dominant and ("full-stack" in c_id or "software" in c_id or "frontend" in c_id):
                assessment_score += 20.0

            prob_score = (assessment_data.get("category_scores") or {}).get("Problem Solving", 70)
            assessment_score = (assessment_score + prob_score) / 2.0

        # Weighted aggregate
        raw_total = (
            skill_score * 0.45 +
            interest_score * 0.20 +
            education_score * 0.15 +
            experience_score * 0.10 +
            assessment_score * 0.10
        )

        match_percentage = int(min(96, max(35, round(raw_total))))

        if not strong_factors:
            strong_factors = ["Transferable computational foundation", "Academic coursework relevance"]
        if not missing_factors:
            missing_factors = ["Production-scale deployment experience", "Automated integration testing"]

        match_explanation = (
            f"Calculated compatibility of {match_percentage}% for {career.get('title')} based on "
            f"demonstrated technical alignment in {len(matched_skill_names)} of {len(core_skills)} core competencies, "
            f"supported by your academic foundation and project experience."
        )

        scored_careers.append({
            "careerId": career.get("id"),
            "title": career.get("title"),
            "matchPercentage": match_percentage,
            "matchExplanation": match_explanation,
            "strongFactors": strong_factors[:3],
            "missingFactors": missing_factors[:3],
            "recommendedPriority": 1
        })

    # Sort descending by match percentage
    scored_careers.sort(key=lambda x: x["matchPercentage"], reverse=True)

    for i, item in enumerate(scored_careers):
        item["recommendedPriority"] = i + 1

    return scored_careers[:6]
