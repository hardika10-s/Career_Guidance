import re
from typing import Dict, Any, List

TECH_SKILLS_DICT = {
    "javascript": "JavaScript", "typescript": "TypeScript", "python": "Python",
    "java": "Java", "c++": "C++", "c#": "C#", "golang": "Go", "rust": "Rust",
    "html": "HTML5", "html5": "HTML5", "css": "CSS3", "css3": "CSS3",
    "tailwind": "Tailwind CSS", "react": "React", "react.js": "React",
    "vue": "Vue.js", "angular": "Angular", "next.js": "Next.js",
    "node": "Node.js", "node.js": "Node.js", "express": "Express",
    "spring": "Spring Boot", "spring boot": "Spring Boot", "django": "Django",
    "fastapi": "FastAPI", "flask": "Flask", "sql": "SQL", "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL", "mysql": "MySQL", "mongodb": "MongoDB",
    "redis": "Redis", "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    "aws": "AWS", "gcp": "Google Cloud Platform", "azure": "Microsoft Azure",
    "terraform": "Terraform", "git": "Git", "github": "GitHub", "gitlab": "GitLab",
    "ci/cd": "CI/CD", "github actions": "GitHub Actions", "jest": "Jest",
    "pytest": "Pytest", "playwright": "Playwright", "cypress": "Cypress",
    "pandas": "Pandas", "numpy": "NumPy", "pytorch": "PyTorch", "tensorflow": "TensorFlow",
    "scikit-learn": "Scikit-Learn", "rest api": "RESTful APIs", "graphql": "GraphQL",
    "microservices": "Microservices", "linux": "Linux", "bash": "Bash",
    "tableau": "Tableau", "power bi": "Power BI"
}

SOFT_SKILLS = [
    "problem solving", "communication", "leadership", "collaboration",
    "teamwork", "critical thinking", "adaptability", "agile", "scrum",
    "time management", "mentoring", "ownership", "analytical"
]

ACTION_VERBS = [
    "architected", "engineered", "developed", "built", "implemented",
    "optimized", "reduced", "increased", "designed", "streamlined",
    "automated", "deployed", "scaled", "refactored", "orchestrated"
]

def analyze_resume_text(
    text: str,
    target_career: Dict[str, Any],
    file_name: str = "Pasted_Resume"
) -> Dict[str, Any]:
    clean_text = text.replace("\r\n", "\n")
    lower = clean_text.lower()
    target_title = target_career.get("title", "Software Developer")
    core_skills = target_career.get("core_technical_skills") or target_career.get("coreTechnicalSkills") or []

    # 1. Detected Technical Skills
    detected_skills_set = set()
    for key, normalized in TECH_SKILLS_DICT.items():
        if re.search(r"\b" + re.escape(key) + r"\b", lower):
            detected_skills_set.add(normalized)
    detected_skills = sorted(list(detected_skills_set))

    # 2. Soft Skills
    soft_skills_detected = [
        s.capitalize() for s in SOFT_SKILLS
        if re.search(r"\b" + re.escape(s) + r"\b", lower)
    ]

    # 3. Target Role Match & Missing Skills
    matched_req_count = 0
    missing_skills = []
    for req in core_skills:
        req_name = req.get("name", "")
        if any(req_name.lower() in ds.lower() or ds.lower() in req_name.lower() for ds in detected_skills):
            matched_req_count += 1
        else:
            missing_skills.append(req_name)

    keyword_match_score = int(round((matched_req_count / max(1, len(core_skills))) * 100))

    # 4. Section Completeness Analysis
    sections = []

    # Contact Info
    has_email = bool(re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", clean_text))
    has_phone = bool(re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", clean_text))
    has_links = bool(re.search(r"linkedin\.com|github\.com|portfolio", lower))
    contact_score = (40 if has_email else 0) + (30 if has_phone else 0) + (30 if has_links else 0)
    sections.append({
        "name": "Contact Information",
        "status": "complete" if contact_score >= 90 else "needs_improvement" if contact_score >= 60 else "missing",
        "score": contact_score,
        "feedback": "Complete contact header with verified email, phone, and professional portfolio profiles." if contact_score >= 90
        else "Ensure your resume explicitly includes an email, phone number, and clickable GitHub / LinkedIn portfolio links."
    })

    # Education
    has_edu = bool(re.search(r"education|university|college|bachelor|master|b\.tech|b\.e|degree|cgpa|gpa", lower))
    edu_score = 90 if has_edu else 30
    sections.append({
        "name": "Education & Academics",
        "status": "complete" if edu_score >= 80 else "needs_improvement",
        "score": edu_score,
        "feedback": "Education section identified with relevant degree and academic credentials." if has_edu
        else "Add clear degree title, graduation year, institution name, and academic performance."
    })

    # Skills Section
    skills_score = min(100, max(30, len(detected_skills) * 9))
    sections.append({
        "name": "Technical Skills",
        "status": "complete" if skills_score >= 75 else "needs_improvement" if skills_score >= 45 else "missing",
        "score": skills_score,
        "feedback": f"Detected {len(detected_skills)} technical skills. Categorize skills by Languages, Frameworks, Databases, and Tools for optimal ATS parsing."
    })

    # Projects
    has_proj = bool(re.search(r"project|developed|built|created|engineered|github", lower))
    proj_score = 85 if has_proj else 35
    sections.append({
        "name": "Projects & Portfolio",
        "status": "complete" if proj_score >= 75 else "needs_improvement",
        "score": proj_score,
        "feedback": "Projects section detected. Ensure every project mentions the technologies used, problem solved, and measurable impact." if has_proj
        else "Include at least 2 relevant projects featuring your target role's technology stack with public GitHub links."
    })

    # Experience / Internships
    has_exp = bool(re.search(r"experience|internship|work history|employment|role|developer at", lower))
    exp_score = 85 if has_exp else 50
    sections.append({
        "name": "Experience & Internships",
        "status": "complete" if exp_score >= 80 else "needs_improvement",
        "score": exp_score,
        "feedback": "Experience or internship details located." if has_exp
        else "For entry-level roles, list academic internships, freelance engagements, open source contributions, or intensive bootcamps."
    })

    completeness_score = int(round(sum(s["score"] for s in sections) / len(sections)))

    # 5. Quantifiable Impact & Action Verb Score
    num_matches = len(re.findall(r"\b\d+(%|\+|x|k|ms|s)?\b", clean_text))
    verb_matches = sum(1 for v in ACTION_VERBS if re.search(r"\b" + re.escape(v) + r"\b", lower))
    impact_score = min(100, int(round(35 + num_matches * 5 + verb_matches * 6)))

    # 6. Overall ATS Score
    overall_score = int(round(
        keyword_match_score * 0.45 +
        completeness_score * 0.30 +
        impact_score * 0.25
    ))

    # 7. Suggestions
    suggestions = []
    if missing_skills:
        suggestions.append(f"Integrate missing high-priority target role keywords: {', '.join(missing_skills[:4])}.")
    if impact_score < 70:
        suggestions.append("Quantify your achievements using metrics (e.g. 'improved query speed by 35%', 'handled 5,000+ records', 'achieved 92% test coverage').")
    if not has_links:
        suggestions.append("Add clickable hyperlinks to your GitHub profile and live deployed web applications.")
    suggestions.append(f"Align your professional summary directly with the {target_title} role.")

    # Rewrite only actual resume bullets. Do not invent technologies, scope, or outcomes.
    bullet_lines = [
        re.sub(r"^\s*[-*•]\s*", "", line).strip()
        for line in clean_text.splitlines()
        if re.match(r"^\s*[-*•]\s+\S", line)
    ]
    weak_openings = (
        (r"^worked on\s+", "Contributed to "),
        (r"^responsible for\s+", "Handled "),
        (r"^helped with\s+", "Supported "),
        (r"^helped\s+", "Supported "),
        (r"^was responsible for\s+", "Handled "),
    )
    bullet_point_rewrites = []
    for original in bullet_lines:
        improved = original
        for pattern, replacement in weak_openings:
            if re.match(pattern, original, flags=re.IGNORECASE):
                improved = re.sub(pattern, replacement, original, count=1, flags=re.IGNORECASE)
                break
        if improved != original:
            bullet_point_rewrites.append({
                "original": original,
                "improved": improved,
                "rationale": "Uses a clearer opening while preserving the facts in your original bullet.",
            })
        if len(bullet_point_rewrites) >= 3:
            break

    return {
        "targetRole": target_title,
        "fileName": file_name,
        "overallScore": overall_score,
        "completenessScore": completeness_score,
        "keywordMatchScore": keyword_match_score,
        "impactScore": impact_score,
        "detectedSkills": detected_skills,
        "missingSkills": missing_skills,
        "softSkillsDetected": soft_skills_detected,
        "sections": sections,
        "suggestions": suggestions,
        "bulletPointRewrites": bullet_point_rewrites,
    }
