from typing import List, Dict, Any

def generate_personalized_roadmap(
    profile_data: Dict[str, Any],
    target_career: Dict[str, Any]
) -> List[Dict[str, Any]]:
    user_skills = [s.get("name", "").lower() for s in (profile_data.get("technical_skills") or profile_data.get("technicalSkills") or [])]
    role_title = target_career.get("title", "Software Developer")
    core_skills = target_career.get("core_technical_skills") or target_career.get("coreTechnicalSkills") or []

    primary_skill = core_skills[0].get("name", "Core Programming") if len(core_skills) > 0 else "Core Programming"
    secondary_skill = core_skills[1].get("name", "Backend Frameworks") if len(core_skills) > 1 else "Backend Frameworks"

    db_skill = "SQL Databases"
    for s in core_skills:
        if s.get("category") == "Databases":
            db_skill = s.get("name", "SQL Databases")
            break

    tool_skill = "Docker & Git"
    for s in core_skills:
        if s.get("category") in ("Cloud & DevOps", "Tools & Others"):
            tool_skill = s.get("name", "Docker & Git")
            break

    return [
        {
            "id": "phase-1",
            "phaseNumber": 1,
            "title": "Stage 1: Strengthen Fundamentals & Language Mechanics",
            "description": f"Solidify core language semantics, algorithmic problem solving, memory scope, and Git workflows essential for {role_title}.",
            "estimatedEffort": "3-4 Weeks",
            "skills": [primary_skill, "Data Structures & Algorithms", "Git & Semantic Versioning"],
            "learningTasks": [
                {
                    "id": "p1-l1",
                    "title": f"Master {primary_skill} Core Paradigms",
                    "description": "Study asynchronous execution, functional idioms, data structures, and memory scope.",
                    "completed": any(primary_skill.lower() in s for s in user_skills),
                },
                {
                    "id": "p1-l2",
                    "title": "Algorithmic Problem Deconstruction",
                    "description": "Implement core algorithms: hash maps, binary search, two pointers, and recursion.",
                    "completed": False,
                },
                {
                    "id": "p1-l3",
                    "title": "Clean Git Branching & Rebase Workflow",
                    "description": "Establish semantic commits, pull request templates, and merge conflict resolution.",
                    "completed": True,
                },
            ],
            "practiceTasks": [
                {
                    "id": "p1-p1",
                    "title": "Complete 25 Targeted Coding Challenges",
                    "description": "Focus on boundary conditions, optimal time complexity, and edge cases.",
                    "completed": False,
                },
                {
                    "id": "p1-p2",
                    "title": "Code Review & Refactoring Exercise",
                    "description": "Review legacy codebases and refactor towards SOLID engineering principles.",
                    "completed": False,
                },
            ],
            "project": {
                "title": f"{primary_skill} Architectural Utility Library",
                "description": "Develop a standalone modular utility package with automated unit test suites and documentation.",
                "deliverables": [
                    "Modular, type-safe codebase",
                    "Automated unit test suite with >85% branch coverage",
                    "Semantic README with architectural diagram",
                ],
                "completed": False,
            },
            "isUnlocked": True,
        },
        {
            "id": "phase-2",
            "phaseNumber": 2,
            "title": "Stage 2: Bridge Core Architectural & Data Skill Gaps",
            "description": f"Develop targeted competencies in schema modeling, API contract design, and data persistence for {role_title}.",
            "estimatedEffort": "4-5 Weeks",
            "skills": [secondary_skill, db_skill, "RESTful API Architecture"],
            "learningTasks": [
                {
                    "id": "p2-l1",
                    "title": f"Relational Schema Normalization & Query Profiling with {db_skill}",
                    "description": "Learn 3NF schema design, indexing strategies (B-Tree/GIN), and transaction isolation levels.",
                    "completed": False,
                },
                {
                    "id": "p2-l2",
                    "title": f"RESTful Architecture & Middleware in {secondary_skill}",
                    "description": "Design idempotent endpoints, request validation pipelines, and standardized error handling.",
                    "completed": False,
                },
                {
                    "id": "p2-l3",
                    "title": "Authentication & Authorization Security",
                    "description": "Implement JWT token signing, bcrypt password hashing, and role-based permissions.",
                    "completed": False,
                },
            ],
            "practiceTasks": [
                {
                    "id": "p2-p1",
                    "title": "Construct a Multi-Entity Database Schema",
                    "description": "Write complex joins, aggregations, and migration scripts.",
                    "completed": False,
                },
                {
                    "id": "p2-p2",
                    "title": "API Integration Testing with Postman & Supertest",
                    "description": "Automate test assertions verifying status codes, response headers, and validation failures.",
                    "completed": False,
                },
            ],
            "project": {
                "title": f"Resilient {role_title} Microservice & Persistence API",
                "description": "Construct a multi-tenant backend service featuring rate limiting, database transactions, and OpenAPI/Swagger documentation.",
                "deliverables": [
                    "Clean layered architecture (Controller, Service, Repository)",
                    "Normalized database schema with indexes",
                    "Postman collection or Swagger API documentation",
                ],
                "completed": False,
            },
            "isUnlocked": True,
        },
        {
            "id": "phase-3",
            "phaseNumber": 3,
            "title": "Stage 3: Production-Ready Capstone Application",
            "description": f"Synthesize skills into an end-to-end production platform that mirrors genuine engineering challenges in {role_title}.",
            "estimatedEffort": "5-6 Weeks",
            "skills": [tool_skill, "Full-Stack System Design", "CI/CD & Container Deployment"],
            "learningTasks": [
                {
                    "id": "p3-l1",
                    "title": f"Containerization with {tool_skill}",
                    "description": "Write multi-stage Docker builds, optimize image layers, and coordinate docker-compose services.",
                    "completed": False,
                },
                {
                    "id": "p3-l2",
                    "title": "Continuous Integration with GitHub Actions",
                    "description": "Automate linting, unit tests, and image publishing on every pull request.",
                    "completed": False,
                },
                {
                    "id": "p3-l3",
                    "title": "Application Telemetry & Error Monitoring",
                    "description": "Integrate structured JSON logging, health-check endpoints, and request timing middleware.",
                    "completed": False,
                },
            ],
            "practiceTasks": [
                {
                    "id": "p3-p1",
                    "title": "Conduct End-to-End Stress & Boundary Testing",
                    "description": "Test high-concurrency request scenarios and handle connection pool timeouts gracefully.",
                    "completed": False,
                },
                {
                    "id": "p3-p2",
                    "title": "Responsive Cross-Platform Verification",
                    "description": "Ensure mobile and tablet rendering with zero cumulative layout shifts.",
                    "completed": False,
                },
            ],
            "project": {
                "title": f"{role_title} Flagship Production Platform",
                "description": "A live cloud-deployed platform solving a real industry workflow with authentication, databases, and CI/CD pipelines.",
                "deliverables": [
                    "Live cloud deployment URL",
                    "Public GitHub repository with clean commit history",
                    "Architecture diagram and test coverage report",
                ],
                "completed": False,
            },
            "isUnlocked": True,
        },
        {
            "id": "phase-4",
            "phaseNumber": 4,
            "title": "Stage 4: Validate, Document & Prove Skills",
            "description": "Transform claimed competencies into verifiable proof through technical documentation, case studies, and code artifacts.",
            "estimatedEffort": "2-3 Weeks",
            "skills": ["Technical Writing", "Architecture Documentation", "Portfolio Engineering"],
            "learningTasks": [
                {
                    "id": "p4-l1",
                    "title": "Write an Architectural Engineering Case Study",
                    "description": "Document trade-offs, database indexing decisions, latency metrics, and failure recovery.",
                    "completed": False,
                },
                {
                    "id": "p4-l2",
                    "title": "Review Industry Standard Certifications & Benchmarks",
                    "description": "Benchmark domain knowledge against official curriculum standards.",
                    "completed": False,
                },
            ],
            "practiceTasks": [
                {
                    "id": "p4-p1",
                    "title": "Upload Verified Evidence to Proof of Skills Tracker",
                    "description": "Submit public repository links and live deployed demos into the platform evidence tracker.",
                    "completed": False,
                },
                {
                    "id": "p4-p2",
                    "title": "Perform Peer Code Review & Open Source Pull Request",
                    "description": "Review open source issues and propose a well-documented pull request.",
                    "completed": False,
                },
            ],
            "project": {
                "title": "Developer Evidence Showcase & Portfolio",
                "description": "An accessible, high-performance web portfolio presenting your live applications, metrics, and evidence.",
                "deliverables": [
                    "High-contrast, mobile-responsive portfolio",
                    "Curated GitHub profile with pinned capstone projects",
                    "Lighthouse score > 90 across performance and accessibility",
                ],
                "completed": False,
            },
            "isUnlocked": False,
        },
        {
            "id": "phase-5",
            "phaseNumber": 5,
            "title": "Stage 5: Technical & Behavioral Interview Mastery",
            "description": f"Master live whiteboard problem solving, system design discussions, and STAR behavioral interview scenarios for {role_title}.",
            "estimatedEffort": "3-4 Weeks",
            "skills": ["System Design", "Behavioral (STAR Method)", "Live Technical Communication"],
            "learningTasks": [
                {
                    "id": "p5-l1",
                    "title": "High-Level System Design Patterns",
                    "description": "Study load balancing, database sharding, caching strategies, and CAP theorem trade-offs.",
                    "completed": False,
                },
                {
                    "id": "p5-l2",
                    "title": "STAR Behavioral Story Preparation",
                    "description": "Structure 5 concrete stories: technical obstacles, team disagreements, ownership, and adaptability.",
                    "completed": False,
                },
            ],
            "practiceTasks": [
                {
                    "id": "p5-p1",
                    "title": "Complete 3 Mock Sessions in the Interview Arena",
                    "description": "Simulate Technical and Behavioral interview rounds with instant feedback.",
                    "completed": False,
                },
                {
                    "id": "p5-p2",
                    "title": "Live Whiteboard Simulation",
                    "description": "Verbalize complexity trade-offs while writing algorithm implementations on a blank canvas.",
                    "completed": False,
                },
            ],
            "project": {
                "title": "Complete Job-Ready Candidate Package",
                "description": f"ATS-optimized resume tailored to {role_title} keywords, verified interview practice, and active application pipeline.",
                "deliverables": [
                    "Single-page high-impact technical resume with quantified metrics",
                    "Interview score benchmark > 80% in the Interview Arena",
                    "Active pipeline of tailored applications",
                ],
                "completed": False,
            },
            "isUnlocked": False,
        },
    ]
