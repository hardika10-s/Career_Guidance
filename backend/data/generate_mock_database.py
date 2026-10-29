"""
Synthetic Database Generator for AI Career Guidance Framework.
Generates realistic, statistically consistent historical benchmark datasets of 300 students,
tracking academic backgrounds, skill evaluations, assessment scores, mock interview ratings,
resume ATS scores, and placement outcomes.
"""

import json
import csv
import random
import os
from datetime import datetime, timezone

random.seed(42)  # Deterministic seed for reproducible academic analysis

DEPARTMENTS = [
    ("Computer Science & Engineering", 0.40),
    ("Information Technology", 0.25),
    ("Artificial Intelligence & Data Science", 0.20),
    ("Electronics & Communication", 0.15)
]

CAREER_TRACKS = [
    "Software Developer",
    "Full-Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "Data Analyst",
    "Data Scientist",
    "AI Engineer",
    "Machine Learning Engineer",
    "Cloud Engineer",
    "DevOps Engineer",
    "Cybersecurity Analyst",
    "Database Developer",
    "Software Tester / QA Engineer",
    "Java Developer",
    "Python Developer"
]

SKILLS_POOL = {
    "Programming": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "SQL"],
    "Web Development": ["React", "Node.js", "Express", "FastAPI", "HTML/CSS", "Tailwind CSS", "Next.js", "Vue.js"],
    "Databases": ["PostgreSQL", "MongoDB", "MySQL", "SQLite", "Redis", "Elasticsearch"],
    "Cloud & DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "CI/CD Pipelines", "Linux / Bash", "Git"],
    "Data & AI": ["Pandas", "NumPy", "Scikit-Learn", "PyTorch", "TensorFlow", "Power BI", "Tableau", "Data Warehousing"],
    "Soft Skills": ["Problem Solving", "Technical Communication", "Agile Collaboration", "Critical Thinking", "Time Management"]
}

FIRST_NAMES = ["Aarav", "Aditi", "Rohan", "Priya", "Vikram", "Sneha", "Karan", "Ananya", "Rahul", "Pooja", 
               "Siddharth", "Meera", "Arjun", "Divya", "Kavya", "Naveen", "Deepa", "Varun", "Neha", "Amit",
               "Sanjay", "Tanvi", "Gaurav", "Swati", "Manish", "Ishaan", "Rhea", "Harish", "Shreya", "Aditya"]

LAST_NAMES = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Rao", "Gupta", "Singh", "Kumar",
              "Das", "Choudhury", "Bhatt", "Joshi", "Menon", "Pillai", "Mehta", "Kulkarni", "Deshmukh", "Kapoor"]

COMPANIES = [
    {"name": "Google", "tier": "Tier-1 Tech", "min_score": 85},
    {"name": "Microsoft", "tier": "Tier-1 Tech", "min_score": 85},
    {"name": "Amazon", "tier": "Tier-1 Tech", "min_score": 82},
    {"name": "Cisco", "tier": "Tier-2 Enterprise", "min_score": 75},
    {"name": "Oracle", "tier": "Tier-2 Enterprise", "min_score": 75},
    {"name": "Deloitte", "tier": "Tier-2 Consulting", "min_score": 70},
    {"name": "Infosys", "tier": "Tier-3 Services", "min_score": 58},
    {"name": "TCS", "tier": "Tier-3 Services", "min_score": 55},
    {"name": "Wipro", "tier": "Tier-3 Services", "min_score": 55},
    {"name": "Cognizant", "tier": "Tier-3 Services", "min_score": 56},
    {"name": "High-Growth FinTech Startup", "tier": "Tier-1 Startup", "min_score": 80},
    {"name": "AI SaaS Startup", "tier": "Tier-1 Startup", "min_score": 78}
]

def generate_students(count=300):
    students = []
    for i in range(1, count + 1):
        dept_choice = random.choices(
            [d[0] for d in DEPARTMENTS],
            weights=[d[1] for d in DEPARTMENTS]
        )[0]

        target_role = random.choice(CAREER_TRACKS)
        cgpa = round(random.gauss(7.8, 0.9), 2)
        cgpa = max(5.5, min(9.9, cgpa))

        # Skill profile based on department and role
        known_skills = {}
        for category, skills in SKILLS_POOL.items():
            if category == "Soft Skills":
                continue
            num_skills = random.randint(1, 3)
            sampled = random.sample(skills, min(num_skills, len(skills)))
            for s in sampled:
                known_skills[s] = random.randint(45, 95)

        # Experience indicators
        projects_count = random.choices([0, 1, 2, 3, 4], weights=[0.05, 0.25, 0.40, 0.20, 0.10])[0]
        internships_count = random.choices([0, 1, 2], weights=[0.55, 0.35, 0.10])[0]
        certifications_count = random.choices([0, 1, 2, 3], weights=[0.30, 0.40, 0.20, 0.10])[0]

        # Diagnostic scores
        assessment_score = int(round(max(40, min(98, random.gauss(65 + (cgpa - 7.0) * 8, 10)))))
        interview_score = int(round(max(35, min(96, random.gauss(55 + (projects_count * 7) + (internships_count * 10), 12)))))
        resume_ats_score = int(round(max(40, min(95, random.gauss(50 + (projects_count * 8) + (certifications_count * 5), 10)))))

        # Employability Readiness Score calculation
        # Weights: Technical Skills (30%), Projects (20%), Assessment (15%), Interview (15%), Resume (10%), CGPA (10%)
        tech_avg = sum(known_skills.values()) / max(1, len(known_skills))
        project_metric = min(100, projects_count * 28 + (15 if projects_count > 0 else 0))
        cgpa_metric = (cgpa / 10.0) * 100

        readiness_score = int(round(
            (tech_avg * 0.30) +
            (project_metric * 0.20) +
            (assessment_score * 0.15) +
            (interview_score * 0.15) +
            (resume_ats_score * 0.10) +
            (cgpa_metric * 0.10)
        ))
        readiness_score = max(35, min(98, readiness_score))

        # Placement Outcome Determination
        if readiness_score >= 82:
            placement_status = "Placed (High Package)"
            tier_candidates = [c for c in COMPANIES if c["min_score"] <= readiness_score and "Tier-1" in c["tier"]]
            company = random.choice(tier_candidates) if tier_candidates else COMPANIES[0]
            salary_lpa = round(random.uniform(14.0, 32.0), 1)
        elif readiness_score >= 68:
            placement_status = "Placed (Standard Tier)"
            tier_candidates = [c for c in COMPANIES if c["min_score"] <= readiness_score and "Tier-2" in c["tier"]]
            company = random.choice(tier_candidates) if tier_candidates else COMPANIES[3]
            salary_lpa = round(random.uniform(6.5, 13.5), 1)
        elif readiness_score >= 55:
            placement_status = "Placed (Entry Services)"
            tier_candidates = [c for c in COMPANIES if c["min_score"] <= readiness_score and "Tier-3" in c["tier"]]
            company = random.choice(tier_candidates) if tier_candidates else COMPANIES[6]
            salary_lpa = round(random.uniform(3.8, 6.0), 1)
        else:
            placement_status = "In Upskilling / Developing"
            company = {"name": "Unplaced / In Training", "tier": "Upskilling", "min_score": 0}
            salary_lpa = 0.0

        student = {
            "student_id": f"STU_{2026000 + i}",
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "department": dept_choice,
            "graduation_year": 2026,
            "cgpa": cgpa,
            "target_career": target_role,
            "known_skills_count": len(known_skills),
            "top_skills": list(known_skills.keys())[:5],
            "technical_skill_avg": round(tech_avg, 1),
            "projects_count": projects_count,
            "internships_count": internships_count,
            "certifications_count": certifications_count,
            "assessment_score": assessment_score,
            "mock_interview_score": interview_score,
            "resume_ats_score": resume_ats_score,
            "employability_readiness_score": readiness_score,
            "placement_status": placement_status,
            "hiring_company": company["name"],
            "company_tier": company["tier"],
            "salary_package_lpa": salary_lpa
        }
        students.append(student)

    return students

def generate_market_benchmarks():
    benchmarks = {
        "Software Developer": {"market_demand_index": 95, "avg_starting_lpa": 8.5, "avg_student_gap_pct": 28, "top_deficit_skill": "System Design & Architecture"},
        "Full-Stack Developer": {"market_demand_index": 92, "avg_starting_lpa": 9.2, "avg_student_gap_pct": 32, "top_deficit_skill": "Full-Stack State Management"},
        "Backend Developer": {"market_demand_index": 90, "avg_starting_lpa": 9.5, "avg_student_gap_pct": 30, "top_deficit_skill": "Database Query Optimization"},
        "Frontend Developer": {"market_demand_index": 85, "avg_starting_lpa": 7.5, "avg_student_gap_pct": 24, "top_deficit_skill": "TypeScript & Performance Profiling"},
        "Data Analyst": {"market_demand_index": 88, "avg_starting_lpa": 7.0, "avg_student_gap_pct": 25, "top_deficit_skill": "Advanced SQL & BI Dashboards"},
        "Data Scientist": {"market_demand_index": 86, "avg_starting_lpa": 11.0, "avg_student_gap_pct": 40, "top_deficit_skill": "Statistical Modeling & Feature Engineering"},
        "AI Engineer": {"market_demand_index": 96, "avg_starting_lpa": 13.5, "avg_student_gap_pct": 42, "top_deficit_skill": "RAG Architectures & LLM Fine-Tuning"},
        "Machine Learning Engineer": {"market_demand_index": 91, "avg_starting_lpa": 12.0, "avg_student_gap_pct": 38, "top_deficit_skill": "MLOps & Model Deployment"},
        "Cloud Engineer": {"market_demand_index": 89, "avg_starting_lpa": 9.0, "avg_student_gap_pct": 35, "top_deficit_skill": "Docker Containerization & Kubernetes"},
        "DevOps Engineer": {"market_demand_index": 87, "avg_starting_lpa": 9.8, "avg_student_gap_pct": 36, "top_deficit_skill": "CI/CD Pipeline Automation"},
        "Cybersecurity Analyst": {"market_demand_index": 84, "avg_starting_lpa": 8.0, "avg_student_gap_pct": 34, "top_deficit_skill": "Vulnerability Assessment & Network Forensics"},
        "Database Developer": {"market_demand_index": 80, "avg_starting_lpa": 7.8, "avg_student_gap_pct": 26, "top_deficit_skill": "Relational Index Tuning & Stored Procedures"},
        "Software Tester / QA Engineer": {"market_demand_index": 78, "avg_starting_lpa": 6.2, "avg_student_gap_pct": 22, "top_deficit_skill": "Automated Testing Frameworks (Selenium/Jest)"},
        "Java Developer": {"market_demand_index": 88, "avg_starting_lpa": 8.2, "avg_student_gap_pct": 27, "top_deficit_skill": "Spring Boot Microservices"},
        "Python Developer": {"market_demand_index": 90, "avg_starting_lpa": 8.8, "avg_student_gap_pct": 26, "top_deficit_skill": "FastAPI & Async IO"}
    }
    return benchmarks

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(base_dir, exist_ok=True)

    students = generate_students(300)
    market = generate_market_benchmarks()

    # 1. Save JSON Dataset
    json_path = os.path.join(base_dir, "synthetic_students_dataset.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(students, f, indent=2)

    # 2. Save CSV Dataset for tabular inspection and Excel
    csv_path = os.path.join(base_dir, "synthetic_students_dataset.csv")
    fieldnames = list(students[0].keys())
    # Convert list of skills to string for CSV
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for s in students:
            row = dict(s)
            row["top_skills"] = "; ".join(row["top_skills"])
            writer.writerow(row)

    # 3. Save Market Benchmarks JSON
    market_path = os.path.join(base_dir, "career_market_benchmarks.json")
    with open(market_path, "w", encoding="utf-8") as f:
        json.dump(market, f, indent=2)

    print(f"Generated {len(students)} synthetic student records in:\n- {json_path}\n- {csv_path}")
    print(f"Generated market benchmarks in:\n- {market_path}")

if __name__ == "__main__":
    main()
