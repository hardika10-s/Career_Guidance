"""
Employability Statistical Analysis Engine.
Analyzes statistical correlations, feature distributions, and placement predictability
across the synthetic historical benchmark database.
"""

import os
import json
import math

def calculate_mean(values):
    return sum(values) / len(values) if values else 0.0

def calculate_std(values, mean):
    if len(values) < 2:
        return 0.0
    variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    return math.sqrt(variance)

def calculate_pearson_correlation(x, y):
    n = len(x)
    if n != len(y) or n == 0:
        return 0.0
    mean_x = calculate_mean(x)
    mean_y = calculate_mean(y)
    numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    denom_x = math.sqrt(sum((x[i] - mean_x) ** 2 for i in range(n)))
    denom_y = math.sqrt(sum((y[i] - mean_y) ** 2 for i in range(n)))
    if denom_x == 0 or denom_y == 0:
        return 0.0
    return numerator / (denom_x * denom_y)

def run_analysis():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "synthetic_students_dataset.json")

    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}. Run generate_mock_database.py first.")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        students = json.load(f)

    total_count = len(students)
    print("=" * 80)
    print("      AI CAREER GUIDANCE FRAMEWORK - STATISTICAL EMPLOYABILITY AUDIT")
    print(f"      Total Historical Student Cohort: {total_count} records")
    print("=" * 80)

    # 1. Metric Extractions
    readiness_scores = [s["employability_readiness_score"] for s in students]
    cgpa_scores = [s["cgpa"] for s in students]
    tech_skills = [s["technical_skill_avg"] for s in students]
    projects_count = [s["projects_count"] for s in students]
    mock_interviews = [s["mock_interview_score"] for s in students]
    resume_scores = [s["resume_ats_score"] for s in students]
    salaries = [s["salary_package_lpa"] for s in students if s["salary_package_lpa"] > 0]

    mean_readiness = calculate_mean(readiness_scores)
    std_readiness = calculate_std(readiness_scores, mean_readiness)

    mean_cgpa = calculate_mean(cgpa_scores)
    std_cgpa = calculate_std(cgpa_scores, mean_cgpa)

    mean_salary = calculate_mean(salaries)
    std_salary = calculate_std(salaries, mean_salary)

    print("\n--- 1. DESCRIPTIVE METRIC DISTRIBUTIONS ---")
    print(f"Employability Readiness Score: Mean = {mean_readiness:.1f}%, StdDev = {std_readiness:.1f}%")
    print(f"Academic CGPA (out of 10.0) : Mean = {mean_cgpa:.2f}, StdDev = {std_cgpa:.2f}")
    print(f"Offered Compensation (LPA)  : Mean = {mean_salary:.1f} LPA, StdDev = {std_salary:.1f} LPA (Placed Cohort)")

    # 2. Pearson Correlation Matrix with Employability Readiness
    corr_tech = calculate_pearson_correlation(tech_skills, readiness_scores)
    corr_projects = calculate_pearson_correlation(projects_count, readiness_scores)
    corr_interview = calculate_pearson_correlation(mock_interviews, readiness_scores)
    corr_resume = calculate_pearson_correlation(resume_scores, readiness_scores)
    corr_cgpa = calculate_pearson_correlation(cgpa_scores, readiness_scores)
    corr_salary = calculate_pearson_correlation(readiness_scores, [s["salary_package_lpa"] for s in students])

    print("\n--- 2. CORRELATION WITH EMPLOYABILITY READINESS SCORE ---")
    print(f"| Factor                        | Correlation (r) | Significance Trend                     |")
    print(f"|-------------------------------|-----------------|----------------------------------------|")
    print(f"| Technical Competency Depth    | r = +{corr_tech:.3f}     | Very High Positive Correlation        |")
    print(f"| Practical Project Count       | r = +{corr_projects:.3f}     | High Positive Correlation             |")
    print(f"| Mock Interview Evaluation     | r = +{corr_interview:.3f}     | High Positive Correlation             |")
    print(f"| Resume ATS Optimization Score | r = +{corr_resume:.3f}     | Moderate Positive Correlation         |")
    print(f"| Academic CGPA                 | r = +{corr_cgpa:.3f}     | Moderate Applied Correlation          |")
    print(f"| Final Placed Package (LPA)    | r = +{corr_salary:.3f}     | Strong Placement Tier Predictability  |")

    # 3. Placement Rates by Readiness Band
    bands = {
        "High Readiness (80% - 100%)": [s for s in students if s["employability_readiness_score"] >= 80],
        "Moderate Readiness (68% - 79%)": [s for s in students if 68 <= s["employability_readiness_score"] < 80],
        "Developing Readiness (55% - 67%)": [s for s in students if 55 <= s["employability_readiness_score"] < 68],
        "Critical Need (< 55%)": [s for s in students if s["employability_readiness_score"] < 55]
    }

    print("\n--- 3. READINESS BAND VS PLACEMENT CONVERSION ---")
    print(f"| Readiness Tier             | Cohort Size | Placement Rate | Top Companies Category       | Avg LPA  |")
    print(f"|----------------------------|-------------|----------------|------------------------------|----------|")
    for band_name, cohort in bands.items():
        size = len(cohort)
        if size == 0:
            continue
        placed = [c for c in cohort if "Placed" in c["placement_status"]]
        rate = (len(placed) / size) * 100
        avg_lpa = calculate_mean([c["salary_package_lpa"] for c in placed])
        top_tier = cohort[0]["company_tier"] if cohort else "N/A"
        print(f"| {band_name:<26} | {size:>11} | {rate:>13.1f}% | {top_tier:<28} | {avg_lpa:>6.1f} L |")

    # 4. Summary File Export
    report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "employability_statistical_summary.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("AI Career Guidance Framework - Employability Statistical Audit\n")
        f.write(f"Analyzed {total_count} records.\n")
        f.write(f"Readiness Mean: {mean_readiness:.1f}%, StdDev: {std_readiness:.1f}%\n")
        f.write(f"Correlation Tech Skills: +{corr_tech:.3f}\n")
        f.write(f"Correlation Projects: +{corr_projects:.3f}\n")
        f.write(f"Correlation Interview: +{corr_interview:.3f}\n")
        f.write(f"Correlation CGPA: +{corr_cgpa:.3f}\n")
        f.write(f"Correlation Package: +{corr_salary:.3f}\n")

    print(f"\nAnalysis summary successfully saved to: {report_path}")
    print("=" * 80)

if __name__ == "__main__":
    run_analysis()
