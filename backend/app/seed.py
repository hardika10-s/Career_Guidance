from backend.app.database import Session
from backend.app.models import (
    CareerRole, LearningResource, User, CareerProfile, LearningRoadmap, ProgressTimeline
)
from backend.app.auth import hash_password
from backend.app.services.roadmap_generator import generate_personalized_roadmap

INITIAL_CAREERS = [
  {
    "id": "software-developer",
    "title": "Software Developer",
    "slug": "software-developer",
    "category": "Software Engineering",
    "description": "Designs, constructs, tests, and maintains robust application software, backend services, and distributed systems to solve complex computational problems.",
    "what_they_do": [
      "Translate system requirements into clean, testable, and maintainable code.",
      "Design and consume REST and GraphQL APIs connecting client applications with microservices.",
      "Write comprehensive unit, integration, and end-to-end automated test suites.",
      "Collaborate in Agile teams through code reviews, architectural discussions, and sprint planning.",
      "Optimize computational complexity and system latency across relational and document databases."
    ],
    "core_technical_skills": [
      { "name": "JavaScript / TypeScript", "importance": "Essential", "defaultLevel": 85, "category": "Programming" },
      { "name": "React / Modern Frontend", "importance": "High", "defaultLevel": 75, "category": "Web Development" },
      { "name": "Node.js & Express", "importance": "Essential", "defaultLevel": 80, "category": "Web Development" },
      { "name": "SQL & Relational DBs", "importance": "Essential", "defaultLevel": 75, "category": "Databases" },
      { "name": "Data Structures & Algorithms", "importance": "Essential", "defaultLevel": 80, "category": "Programming" },
      { "name": "Git Version Control", "importance": "Essential", "defaultLevel": 85, "category": "Tools & Others" },
      { "name": "System Design & Architecture", "importance": "Medium", "defaultLevel": 65, "category": "Programming" },
      { "name": "Docker & Containerization", "importance": "High", "defaultLevel": 70, "category": "Cloud & DevOps" },
      { "name": "Automated Testing (Jest/Mocha)", "importance": "High", "defaultLevel": 70, "category": "Tools & Others" }
    ],
    "soft_skills": [
      "Analytical Problem Solving", "Clear Technical Communication", "Constructive Code Review Feedback",
      "Autonomous Debugging & Research", "Agile Team Collaboration"
    ],
    "common_tools": ["VS Code", "Git / GitHub", "Docker", "Postman", "Jest", "PostgreSQL", "Linux / Bash"],
    "entry_level_expectations": [
      "Ability to build a full-stack CRUD application with authentication and persistent database storage.",
      "Solid comprehension of object-oriented and functional programming paradigms.",
      "Familiarity with Git branching, pull requests, and semantic versioning."
    ],
    "suggested_projects": [
      {
        "title": "Full-Stack Task & Workflow Management Platform",
        "description": "Build a multi-user project planner with JWT authentication, role-based access control, relational database schema, and automated test coverage.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Node.js", "Express", "React", "PostgreSQL", "JWT", "Docker"]
      },
      {
        "title": "High-Throughput Rate-Limited API Gateway Service",
        "description": "Create an Express/Node microservice that proxies requests, enforces token bucket rate-limiting, and logs structured analytics.",
        "difficulty": "Advanced",
        "skillsUsed": ["TypeScript", "Node.js", "Redis/In-Memory Caching", "Jest"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Software Developer", "timeframe": "0-2 Years", "salaryRange": "$75k - $95k" },
      { "level": "Mid-Level", "title": "Software Engineer", "timeframe": "2-5 Years", "salaryRange": "$105k - $140k" },
      { "level": "Senior", "title": "Senior Software Engineer", "timeframe": "5-8 Years", "salaryRange": "$145k - $190k" },
      { "level": "Staff / Principal", "title": "Staff Engineer / Architect", "timeframe": "8+ Years", "salaryRange": "$200k - $280k+" }
    ],
    "related_careers": ["Full-Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer"]
  },
  {
    "id": "java-developer",
    "title": "Java Developer",
    "slug": "java-developer",
    "category": "Software Engineering",
    "description": "Develops scalable, enterprise-grade backend services, distributed systems, and microservices using Java, Spring Boot, and robust JVM ecosystems.",
    "what_they_do": [
      "Develop secure, multithreaded enterprise REST APIs using Spring Boot and Hibernate/JPA.",
      "Design relational schemas, manage database transactions (ACID), and optimize query execution plans.",
      "Implement event-driven messaging pipelines using Apache Kafka or RabbitMQ.",
      "Write automated unit and integration tests using JUnit 5, Mockito, and Testcontainers."
    ],
    "core_technical_skills": [
      { "name": "Java Core (OOP, Multithreading, Streams)", "importance": "Essential", "defaultLevel": 90, "category": "Programming" },
      { "name": "Spring Boot & Spring Framework", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "Hibernate / JPA & SQL", "importance": "Essential", "defaultLevel": 80, "category": "Databases" },
      { "name": "Data Structures & Algorithms", "importance": "Essential", "defaultLevel": 80, "category": "Programming" },
      { "name": "Microservices & RESTful Architecture", "importance": "Essential", "defaultLevel": 80, "category": "Programming" },
      { "name": "Unit Testing (JUnit 5 & Mockito)", "importance": "High", "defaultLevel": 75, "category": "Tools & Others" }
    ],
    "soft_skills": [
      "Rigorous Code Architecture Thinking", "System Reliability Focus", "Cross-Team Communication", "Structured Debugging"
    ],
    "common_tools": ["IntelliJ IDEA", "Git", "Maven", "Docker", "Postman", "PostgreSQL", "JUnit 5"],
    "entry_level_expectations": [
      "Strong foundation in Object-Oriented Programming (Polymorphism, Inheritance, Encapsulation, Abstraction).",
      "Comprehension of Java Collections Framework, Generics, Lambdas, and Exception Handling.",
      "Experience creating CRUD REST APIs with Spring Boot and Spring Data JPA."
    ],
    "suggested_projects": [
      {
        "title": "Enterprise Banking Transaction & Ledger Microservice",
        "description": "Develop a high-reliability Spring Boot service handling simulated financial transactions with idempotent transfers, JWT security, and JUnit test coverage.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Java 17+", "Spring Boot", "PostgreSQL", "Spring Security", "JUnit 5", "Docker"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Associate Java Developer", "timeframe": "0-2 Years", "salaryRange": "$75k - $95k" },
      { "level": "Mid-Level", "title": "Java Backend Engineer", "timeframe": "2-5 Years", "salaryRange": "$105k - $140k" },
      { "level": "Senior", "title": "Senior Enterprise Java Architect", "timeframe": "5-8 Years", "salaryRange": "$145k - $185k" }
    ],
    "related_careers": ["Backend Developer", "Software Developer", "Full-Stack Developer", "Database Developer"]
  },
  {
    "id": "full-stack-developer",
    "title": "Full-Stack Developer",
    "slug": "full-stack-developer",
    "category": "Web & Software Engineering",
    "description": "Builds complete web applications from end to end, mastering modern responsive frontend interfaces, server-side APIs, database persistence, and cloud deployment.",
    "what_they_do": [
      "Architect and code both client-side user interfaces and server-side REST/GraphQL APIs.",
      "Design database models (relational and document) and integrate seamless data access layers.",
      "Implement secure authentication, authorization, session management, and CSRF/CORS protections.",
      "Automate build, testing, and deployment routines using CI/CD pipelines."
    ],
    "core_technical_skills": [
      { "name": "JavaScript / TypeScript", "importance": "Essential", "defaultLevel": 90, "category": "Programming" },
      { "name": "React / Modern Frontend Frameworks", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "Node.js & Express / Fastify", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "SQL & Relational Databases (PostgreSQL)", "importance": "Essential", "defaultLevel": 80, "category": "Databases" },
      { "name": "HTML5, CSS3 & Tailwind CSS", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "RESTful API Design & OpenAPI", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" }
    ],
    "soft_skills": [
      "End-to-End Ownership", "Pragmatic Engineering Trade-offs", "Clear Cross-Functional Communication"
    ],
    "common_tools": ["VS Code", "React", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS", "Vite"],
    "entry_level_expectations": [
      "Ability to build, test, and deploy a complete web application with frontend and backend interconnected.",
      "Solid understanding of HTTP methods, status codes, JSON payload formatting, and state management."
    ],
    "suggested_projects": [
      {
        "title": "Collaborative SaaS Project Hub with Real-Time Activity",
        "description": "Build a production-grade full-stack platform featuring JWT authentication, role management, interactive drag-and-drop Kanban boards, and WebSocket updates.",
        "difficulty": "Intermediate",
        "skillsUsed": ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Tailwind CSS", "Docker"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Full-Stack Developer", "timeframe": "0-2 Years", "salaryRange": "$75k - $95k" },
      { "level": "Mid-Level", "title": "Full-Stack Software Engineer", "timeframe": "2-5 Years", "salaryRange": "$110k - $145k" },
      { "level": "Senior", "title": "Senior Full-Stack Engineer / Lead", "timeframe": "5-8 Years", "salaryRange": "$150k - $195k" }
    ],
    "related_careers": ["Frontend Developer", "Backend Developer", "Software Developer", "DevOps Engineer"]
  },
  {
    "id": "frontend-developer",
    "title": "Frontend Developer",
    "slug": "frontend-developer",
    "category": "Web Development",
    "description": "Crafts accessible, high-performance, and visually polished client-side web interfaces with deep knowledge of browser execution, state management, and modern CSS.",
    "what_they_do": [
      "Convert UI/UX designs into responsive, accessible HTML, CSS, and modern JavaScript/TypeScript.",
      "Manage client state, caching, data synchronization, and optimistic UI updates.",
      "Optimize Core Web Vitals (LCP, FID/INP, CLS) and asset bundle sizes."
    ],
    "core_technical_skills": [
      { "name": "JavaScript & Modern TypeScript", "importance": "Essential", "defaultLevel": 90, "category": "Programming" },
      { "name": "React & Component Architecture", "importance": "Essential", "defaultLevel": 90, "category": "Web Development" },
      { "name": "HTML5 Semantic Elements & Web Standards", "importance": "Essential", "defaultLevel": 90, "category": "Web Development" },
      { "name": "CSS3, Flexbox, Grid & Tailwind CSS", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "State Management & Reactivity", "importance": "Essential", "defaultLevel": 80, "category": "Web Development" }
    ],
    "soft_skills": ["Visual Aesthetics", "Empathy for Users", "Attention to Details", "Collaboration"],
    "common_tools": ["VS Code", "React", "Vite", "Tailwind CSS", "Figma", "Chrome DevTools"],
    "entry_level_expectations": [
      "Ability to build responsive, accessible web layouts that render cleanly on mobile, tablet, and desktop.",
      "Strong understanding of the DOM, event handling, component lifecycle, and asynchronous API fetching."
    ],
    "suggested_projects": [
      {
        "title": "Enterprise Design System with Interactive Component Playground",
        "description": "Build an accessible, themeable UI library with Storybook documentation and keyboard navigation testing.",
        "difficulty": "Intermediate",
        "skillsUsed": ["React", "TypeScript", "Tailwind CSS", "Storybook"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Frontend Developer", "timeframe": "0-2 Years", "salaryRange": "$70k - $90k" },
      { "level": "Mid-Level", "title": "Frontend Engineer", "timeframe": "2-5 Years", "salaryRange": "$100k - $135k" },
      { "level": "Senior", "title": "Senior Frontend Engineer", "timeframe": "5-8 Years", "salaryRange": "$140k - $180k" }
    ],
    "related_careers": ["Full-Stack Developer", "Software Developer", "UI/UX Engineer"]
  },
  {
    "id": "backend-developer",
    "title": "Backend Developer",
    "slug": "backend-developer",
    "category": "Software Engineering",
    "description": "Architects high-performance server-side architectures, database schemas, API contracts, caching layers, and asynchronous worker systems.",
    "what_they_do": [
      "Build secure, maintainable RESTful and gRPC web services and microservices.",
      "Model relational schemas, design indexes, and optimize query latency.",
      "Enforce authentication, role-based access control, and rate limiting."
    ],
    "core_technical_skills": [
      { "name": "Node.js / Express / Python", "importance": "Essential", "defaultLevel": 85, "category": "Programming" },
      { "name": "SQL & Relational Schema Design (PostgreSQL)", "importance": "Essential", "defaultLevel": 85, "category": "Databases" },
      { "name": "RESTful API Architecture & HTTP Standards", "importance": "Essential", "defaultLevel": 90, "category": "Web Development" },
      { "name": "Authentication (JWT, OAuth2, Sessions)", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "Docker & Container Basics", "importance": "High", "defaultLevel": 75, "category": "Cloud & DevOps" }
    ],
    "soft_skills": ["Systematic Problem Isolation", "Data Integrity Consciousness", "Defensive Coding"],
    "common_tools": ["Node.js", "Express", "PostgreSQL", "Docker", "Postman", "Redis", "Linux"],
    "entry_level_expectations": [
      "Ability to create a modular REST API with route handlers, controllers, data validation, and error middleware.",
      "Understanding of database relations, foreign keys, and indexing."
    ],
    "suggested_projects": [
      {
        "title": "Multi-Tenant Scalable API Gateway & Auth Service",
        "description": "Build an Express/Node backend service featuring rate limiting, JWT token rotation, bcrypt password hashing, and automated test coverage.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Jest"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Backend Developer", "timeframe": "0-2 Years", "salaryRange": "$75k - $95k" },
      { "level": "Mid-Level", "title": "Backend Engineer", "timeframe": "2-5 Years", "salaryRange": "$105k - $145k" },
      { "level": "Senior", "title": "Senior Backend Architect", "timeframe": "5-8 Years", "salaryRange": "$145k - $190k" }
    ],
    "related_careers": ["Full-Stack Developer", "Java Developer", "Database Developer", "DevOps Engineer"]
  },
  {
    "id": "python-developer",
    "title": "Python Developer",
    "slug": "python-developer",
    "category": "Software & Data Engineering",
    "description": "Builds backend services, automated data processing pipelines, web scrapers, and scientific workflows using Python's extensive ecosystem.",
    "what_they_do": [
      "Construct high-throughput backend services using FastAPI, Flask, or Django.",
      "Automate data extraction, transformation, ETL pipelines, and web scrapers.",
      "Integrate SQL databases and ORMs with clean repository abstractions."
    ],
    "core_technical_skills": [
      { "name": "Python Core (OOP, Generators, Decorators)", "importance": "Essential", "defaultLevel": 90, "category": "Programming" },
      { "name": "FastAPI / Django / Flask", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "SQL & Relational Databases (PostgreSQL)", "importance": "Essential", "defaultLevel": 80, "category": "Databases" },
      { "name": "Unit Testing with Pytest", "importance": "High", "defaultLevel": 75, "category": "Tools & Others" },
      { "name": "Docker & Virtual Environments", "importance": "High", "defaultLevel": 75, "category": "Cloud & DevOps" }
    ],
    "soft_skills": ["Code Readability", "Analytical Rigor", "Automation Mindset", "Research Skills"],
    "common_tools": ["VS Code", "FastAPI", "PostgreSQL", "Pytest", "Docker", "Git", "Postman"],
    "entry_level_expectations": [
      "Strong understanding of Python data structures, comprehensions, and generators.",
      "Experience creating REST APIs with FastAPI or Flask including request validation."
    ],
    "suggested_projects": [
      {
        "title": "Automated Web Data Aggregator & Analytics API",
        "description": "Build a FastAPI service that scrapes structured data from public web directories, stores normalized records in PostgreSQL, and serves analytics endpoints.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Python", "FastAPI", "PostgreSQL", "Docker", "Pytest"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Python Developer", "timeframe": "0-2 Years", "salaryRange": "$75k - $95k" },
      { "level": "Mid-Level", "title": "Python Software Engineer", "timeframe": "2-5 Years", "salaryRange": "$105k - $140k" },
      { "level": "Senior", "title": "Senior Python Engineer", "timeframe": "5-8 Years", "salaryRange": "$140k - $185k" }
    ],
    "related_careers": ["Backend Developer", "Data Analyst", "Data Scientist", "Machine Learning Engineer"]
  },
  {
    "id": "data-analyst",
    "title": "Data Analyst",
    "slug": "data-analyst",
    "category": "Data & Analytics",
    "description": "Transforms raw data into actionable business intelligence through statistical modeling, SQL transformations, exploratory data analysis, and intuitive visualization dashboards.",
    "what_they_do": [
      "Extract, clean, and validate data across enterprise databases and third-party data pipelines.",
      "Write complex SQL queries utilizing window functions, CTEs, and aggregation pipelines.",
      "Construct interactive dashboard KPI visualizations for stakeholders and leadership teams."
    ],
    "core_technical_skills": [
      { "name": "SQL & Advanced Querying (CTEs, Window Funcs)", "importance": "Essential", "defaultLevel": 90, "category": "Databases" },
      { "name": "Python (Pandas, NumPy)", "importance": "Essential", "defaultLevel": 80, "category": "Programming" },
      { "name": "Data Visualization (Tableau/PowerBI/D3)", "importance": "Essential", "defaultLevel": 85, "category": "AI & Data" },
      { "name": "Statistical Analysis & Hypothesis Testing", "importance": "Essential", "defaultLevel": 75, "category": "AI & Data" }
    ],
    "soft_skills": ["Data Storytelling", "Business Domain Acumen", "Critical Thinking", "Communication"],
    "common_tools": ["PostgreSQL / BigQuery", "Jupyter Notebooks", "Pandas", "Tableau", "Power BI", "Git"],
    "entry_level_expectations": [
      "Fluency with multi-table joins, subqueries, grouping, and aggregations in SQL.",
      "Demonstrated ability to clean messy CSV/JSON datasets and identify statistical anomalies."
    ],
    "suggested_projects": [
      {
        "title": "E-Commerce Customer Lifetime Value & Churn Analytics",
        "description": "Analyze transactional user data, segment customers with RFM modeling, and build an interactive visualization dashboard.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Python", "SQL", "Pandas", "Matplotlib/Seaborn", "Tableau"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Data Analyst", "timeframe": "0-2 Years", "salaryRange": "$65k - $85k" },
      { "level": "Mid-Level", "title": "Data Analyst", "timeframe": "2-5 Years", "salaryRange": "$90k - $125k" },
      { "level": "Senior", "title": "Senior BI Analyst", "timeframe": "5-8 Years", "salaryRange": "$130k - $165k" }
    ],
    "related_careers": ["Data Scientist", "Python Developer", "Database Developer", "AI Engineer"]
  },
  {
    "id": "data-scientist",
    "title": "Data Scientist",
    "slug": "data-scientist",
    "category": "Data Science & AI",
    "description": "Applies advanced statistical inference, predictive modeling, machine learning algorithms, and exploratory research to solve complex business challenges.",
    "what_they_do": [
      "Formulate predictive regression, classification, clustering, and forecasting models.",
      "Conduct rigorous exploratory data analysis, feature engineering, and dimensional reduction.",
      "Design and evaluate randomized A/B experimentation frameworks."
    ],
    "core_technical_skills": [
      { "name": "Python & Scientific Stack (Pandas, SciPy)", "importance": "Essential", "defaultLevel": 90, "category": "Programming" },
      { "name": "Machine Learning (Scikit-Learn, XGBoost)", "importance": "Essential", "defaultLevel": 85, "category": "AI & Data" },
      { "name": "Applied Statistics, Probability & A/B Testing", "importance": "Essential", "defaultLevel": 85, "category": "AI & Data" },
      { "name": "SQL & Data Extraction", "importance": "Essential", "defaultLevel": 85, "category": "Databases" }
    ],
    "soft_skills": ["Scientific Inquiry", "Executive Presentation", "Business Value Alignment"],
    "common_tools": ["Python", "Jupyter", "Scikit-Learn", "XGBoost", "PostgreSQL", "Pandas"],
    "entry_level_expectations": [
      "Solid mathematical understanding of probability distributions, cross-validation, and metrics.",
      "Demonstrated ability to clean raw datasets and engineer relevant features without data leakage."
    ],
    "suggested_projects": [
      {
        "title": "Predictive Customer Churn & Retention Machine Learning Pipeline",
        "description": "Build an end-to-end data science project predicting customer churn using logistic regression and gradient boosting.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Python", "Scikit-Learn", "Pandas", "Seaborn"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Data Scientist", "timeframe": "0-2 Years", "salaryRange": "$85k - $110k" },
      { "level": "Mid-Level", "title": "Data Scientist", "timeframe": "2-5 Years", "salaryRange": "$120k - $160k" },
      { "level": "Senior", "title": "Senior Data Scientist", "timeframe": "5-8 Years", "salaryRange": "$165k - $215k" }
    ],
    "related_careers": ["Data Analyst", "Machine Learning Engineer", "AI Engineer", "Python Developer"]
  },
  {
    "id": "machine-learning-engineer",
    "title": "Machine Learning Engineer",
    "slug": "machine-learning-engineer",
    "category": "Artificial Intelligence",
    "description": "Designs, trains, optimizes, and productionizes scalable machine learning models, inference APIs, and automated MLOps pipelines.",
    "what_they_do": [
      "Build scalable data ingestion and feature engineering pipelines for model training.",
      "Train deep learning and gradient boosted architectures using PyTorch, TensorFlow, and Scikit-Learn.",
      "Deploy containerized prediction endpoints using FastAPI, Docker, and Kubernetes."
    ],
    "core_technical_skills": [
      { "name": "Python & Numerical Computing", "importance": "Essential", "defaultLevel": 90, "category": "Programming" },
      { "name": "Deep Learning (PyTorch / TensorFlow)", "importance": "Essential", "defaultLevel": 85, "category": "AI & Data" },
      { "name": "Classical ML Algorithms (Scikit-Learn)", "importance": "Essential", "defaultLevel": 85, "category": "AI & Data" },
      { "name": "Model Deployment & REST APIs (FastAPI)", "importance": "Essential", "defaultLevel": 80, "category": "Web Development" },
      { "name": "MLOps & Pipeline Automation (Docker)", "importance": "High", "defaultLevel": 75, "category": "Cloud & DevOps" }
    ],
    "soft_skills": ["Scientific Rigor", "System Reliability Focus", "Ethical AI Consciousness"],
    "common_tools": ["PyTorch", "Scikit-Learn", "FastAPI", "Docker", "MLflow", "Hugging Face"],
    "entry_level_expectations": [
      "Clear understanding of loss functions, optimization algorithms, overfitting, and regularization.",
      "Demonstrated ability to train a model and expose inference via a REST endpoint."
    ],
    "suggested_projects": [
      {
        "title": "Production Real-Time Sentiment & Intent Classification API",
        "description": "Fine-tune a lightweight transformer model, containerize the inference engine with FastAPI, and implement automated performance evaluation.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Python", "PyTorch / Transformers", "FastAPI", "Docker"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior ML Engineer", "timeframe": "0-2 Years", "salaryRange": "$85k - $115k" },
      { "level": "Mid-Level", "title": "Machine Learning Engineer", "timeframe": "2-5 Years", "salaryRange": "$125k - $165k" },
      { "level": "Senior", "title": "Senior AI/ML Systems Engineer", "timeframe": "5-8 Years", "salaryRange": "$170k - $230k" }
    ],
    "related_careers": ["AI Engineer", "Data Scientist", "Python Developer", "Software Developer"]
  },
  {
    "id": "ai-engineer",
    "title": "AI Engineer",
    "slug": "ai-engineer",
    "category": "Artificial Intelligence",
    "description": "Builds modern Generative AI applications, Retrieval-Augmented Generation (RAG) systems, autonomous agent workflows, and fine-tuned LLM solutions.",
    "what_they_do": [
      "Architect end-to-end RAG pipelines utilizing embeddings, semantic chunking, and vector databases.",
      "Integrate frontier LLM APIs (Gemini, Anthropic, OpenAI) with structured schemas and guardrails.",
      "Construct agentic tool-use loops, task planners, and multi-turn conversational systems."
    ],
    "core_technical_skills": [
      { "name": "Python Programming & Async APIs", "importance": "Essential", "defaultLevel": 90, "category": "Programming" },
      { "name": "Generative AI APIs & Prompt Engineering", "importance": "Essential", "defaultLevel": 90, "category": "AI & Data" },
      { "name": "Vector Databases & Semantic Search", "importance": "Essential", "defaultLevel": 85, "category": "AI & Data" },
      { "name": "RAG Architecture & Chunking Strategies", "importance": "Essential", "defaultLevel": 85, "category": "AI & Data" },
      { "name": "FastAPI & Microservices Architecture", "importance": "High", "defaultLevel": 80, "category": "Web Development" }
    ],
    "soft_skills": ["Iterative Experimentation", "Ethical AI Mindset", "Rapid Adaptability"],
    "common_tools": ["Google Gemini SDK", "ChromaDB / Pinecone", "FastAPI", "Docker", "Git"],
    "entry_level_expectations": [
      "Hands-on experience calling LLM APIs, handling structured JSON output, and implementing prompt defenses.",
      "Understanding of embedding vector dimensions, cosine similarity, and semantic retrieval."
    ],
    "suggested_projects": [
      {
        "title": "Intelligent Technical Documentation RAG Q&A Assistant",
        "description": "Build a full-stack document assistant that chunks PDFs, generates embeddings, stores vectors in ChromaDB, and generates cited responses with guardrails.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Python", "FastAPI", "Vector DB", "Gemini API", "Docker"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior AI Engineer", "timeframe": "0-2 Years", "salaryRange": "$85k - $120k" },
      { "level": "Mid-Level", "title": "AI Application Engineer", "timeframe": "2-5 Years", "salaryRange": "$130k - $175k" },
      { "level": "Senior", "title": "Senior AI Architect", "timeframe": "5-8 Years", "salaryRange": "$180k - $240k" }
    ],
    "related_careers": ["Machine Learning Engineer", "Data Scientist", "Python Developer", "Full-Stack Developer"]
  },
  {
    "id": "software-tester-qa",
    "title": "Software Tester / QA Engineer",
    "slug": "software-tester-qa",
    "category": "Quality Assurance & Testing",
    "description": "Guarantees software reliability, security, and performance by architecting automated test suites, regression test frameworks, and continuous verification pipelines.",
    "what_they_do": [
      "Design comprehensive test plans, test matrices, and edge-case boundary scenarios.",
      "Develop automated end-to-end (E2E), integration, and API test suites (Playwright, Cypress, Selenium).",
      "Integrate automated quality gates and test reporting into CI/CD deployment workflows."
    ],
    "core_technical_skills": [
      { "name": "Test Automation Frameworks (Playwright/Cypress)", "importance": "Essential", "defaultLevel": 90, "category": "Tools & Others" },
      { "name": "JavaScript / TypeScript or Python", "importance": "Essential", "defaultLevel": 85, "category": "Programming" },
      { "name": "API Testing (Postman, REST Assured)", "importance": "Essential", "defaultLevel": 85, "category": "Tools & Others" },
      { "name": "SQL & Test Data Validation", "importance": "High", "defaultLevel": 75, "category": "Databases" },
      { "name": "CI/CD Quality Gates (GitHub Actions)", "importance": "High", "defaultLevel": 75, "category": "Cloud & DevOps" }
    ],
    "soft_skills": ["Attention to Detail", "Skeptical Mindset", "User Journey Empathy", "Bug Documentation"],
    "common_tools": ["Playwright", "Postman", "Cypress", "GitHub Actions", "k6", "Docker", "Git"],
    "entry_level_expectations": [
      "Deep understanding of test methodologies (unit, integration, regression, smoke, boundary value analysis).",
      "Ability to write automated UI test scripts with Playwright and validate API payloads with Postman."
    ],
    "suggested_projects": [
      {
        "title": "Automated Cross-Browser E2E & Visual Regression Test Suite",
        "description": "Build an automated testing repository using Playwright and GitHub Actions that runs tests across Chromium, Firefox, and WebKit on every commit.",
        "difficulty": "Intermediate",
        "skillsUsed": ["TypeScript", "Playwright", "GitHub Actions", "Visual Testing"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior QA / Test Automation Engineer", "timeframe": "0-2 Years", "salaryRange": "$65k - $85k" },
      { "level": "Mid-Level", "title": "Software Development Engineer in Test (SDET)", "timeframe": "2-5 Years", "salaryRange": "$95k - $130k" },
      { "level": "Senior", "title": "Senior SDET / QA Lead", "timeframe": "5-8 Years", "salaryRange": "$135k - $175k" }
    ],
    "related_careers": ["Software Developer", "DevOps Engineer", "Frontend Developer", "Backend Developer"]
  },
  {
    "id": "devops-engineer",
    "title": "DevOps Engineer",
    "slug": "devops-engineer",
    "category": "Cloud & Infrastructure",
    "description": "Bridges software engineering and systems operations by building automated CI/CD pipelines, container orchestration platforms, and observability systems.",
    "what_they_do": [
      "Design and maintain automated continuous integration and continuous deployment (CI/CD) pipelines.",
      "Containerize applications and manage Kubernetes cluster orchestrations.",
      "Provision cloud infrastructure using Infrastructure as Code (Terraform)."
    ],
    "core_technical_skills": [
      { "name": "Linux Administration & Bash Scripting", "importance": "Essential", "defaultLevel": 90, "category": "Tools & Others" },
      { "name": "Docker & Container Architecture", "importance": "Essential", "defaultLevel": 90, "category": "Cloud & DevOps" },
      { "name": "Kubernetes & Container Orchestration", "importance": "Essential", "defaultLevel": 80, "category": "Cloud & DevOps" },
      { "name": "CI/CD Pipelines (GitHub Actions / GitLab CI)", "importance": "Essential", "defaultLevel": 85, "category": "Cloud & DevOps" },
      { "name": "Infrastructure as Code (Terraform)", "importance": "Essential", "defaultLevel": 80, "category": "Cloud & DevOps" }
    ],
    "soft_skills": ["Operational Composure", "Automation-First Mindset", "Root Cause Analysis"],
    "common_tools": ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "Linux", "Prometheus", "Grafana"],
    "entry_level_expectations": [
      "Strong proficiency with Linux command-line utilities, permissions, and process management.",
      "Ability to write optimized multi-stage Dockerfiles and deploy containers."
    ],
    "suggested_projects": [
      {
        "title": "Automated Multi-Environment GitOps CI/CD Pipeline",
        "description": "Construct a complete GitHub Actions pipeline that lints, tests, builds Docker images, runs security scans, and deploys to a cluster.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Docker", "Kubernetes", "GitHub Actions", "Terraform"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior DevOps Engineer", "timeframe": "0-2 Years", "salaryRange": "$80k - $105k" },
      { "level": "Mid-Level", "title": "DevOps Engineer", "timeframe": "2-5 Years", "salaryRange": "$115k - $155k" },
      { "level": "Senior", "title": "Senior DevOps Architect", "timeframe": "5-8 Years", "salaryRange": "$160k - $210k" }
    ],
    "related_careers": ["Cloud Engineer", "Software Developer", "Cybersecurity Analyst", "Backend Developer"]
  },
  {
    "id": "cloud-engineer",
    "title": "Cloud Engineer",
    "slug": "cloud-engineer",
    "category": "Cloud & Infrastructure",
    "description": "Architects, deploys, and secures scalable cloud infrastructure, virtual networks, compute clusters, and managed services on modern cloud platforms.",
    "what_they_do": [
      "Provision and manage compute, storage, database, and networking resources across AWS, GCP, or Azure.",
      "Implement Infrastructure as Code using Terraform to deliver repeatable environments.",
      "Configure cloud networking: Virtual Private Clouds (VPCs), subnets, routing tables, and security groups."
    ],
    "core_technical_skills": [
      { "name": "Cloud Platforms (AWS / GCP / Azure)", "importance": "Essential", "defaultLevel": 85, "category": "Cloud & DevOps" },
      { "name": "Infrastructure as Code (Terraform)", "importance": "Essential", "defaultLevel": 80, "category": "Cloud & DevOps" },
      { "name": "Cloud Networking (VPC, Subnets, DNS)", "importance": "Essential", "defaultLevel": 80, "category": "Cloud & DevOps" },
      { "name": "Cloud Security & IAM Least Privilege", "importance": "Essential", "defaultLevel": 80, "category": "Cloud & DevOps" },
      { "name": "Docker & Container Basics", "importance": "High", "defaultLevel": 75, "category": "Cloud & DevOps" }
    ],
    "soft_skills": ["Architectural Systems Thinking", "Security Consciousness", "Cost Optimization"],
    "common_tools": ["AWS Console & CLI", "Google Cloud Platform", "Terraform", "Docker", "Linux"],
    "entry_level_expectations": [
      "Comprehension of fundamental cloud primitives: compute instances, object storage, managed DBs, VPCs.",
      "Ability to write basic Terraform scripts to provision resources repeatably."
    ],
    "suggested_projects": [
      {
        "title": "Resilient Multi-AZ Web Infrastructure Provisioned with Terraform",
        "description": "Write Terraform code to deploy an auto-scaling group of web servers behind an Application Load Balancer with secure private database subnets.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Terraform", "AWS/GCP", "VPC Networking", "Linux"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Associate Cloud Engineer", "timeframe": "0-2 Years", "salaryRange": "$80k - $105k" },
      { "level": "Mid-Level", "title": "Cloud Infrastructure Engineer", "timeframe": "2-5 Years", "salaryRange": "$115k - $155k" },
      { "level": "Senior", "title": "Senior Cloud Solutions Architect", "timeframe": "5-8 Years", "salaryRange": "$160k - $210k" }
    ],
    "related_careers": ["DevOps Engineer", "Cybersecurity Analyst", "Software Developer", "Backend Developer"]
  },
  {
    "id": "cybersecurity-analyst",
    "title": "Cybersecurity Analyst",
    "slug": "cybersecurity-analyst",
    "category": "Information Security",
    "description": "Protects organizational networks, applications, and confidential data by monitoring threat vectors, assessing vulnerabilities, and executing incident response protocols.",
    "what_they_do": [
      "Monitor SIEM security event logs and network telemetry for anomalous activity or intrusion attempts.",
      "Perform vulnerability scans and assess web applications against the OWASP Top 10.",
      "Investigate security incidents, conduct triage, and preserve digital evidence."
    ],
    "core_technical_skills": [
      { "name": "Network Security & Protocols (TCP/IP, DNS, TLS)", "importance": "Essential", "defaultLevel": 85, "category": "Cloud & DevOps" },
      { "name": "SIEM & Log Analysis (Splunk / ELK)", "importance": "Essential", "defaultLevel": 80, "category": "Tools & Others" },
      { "name": "OWASP Top 10 & Web App Security", "importance": "Essential", "defaultLevel": 85, "category": "Web Development" },
      { "name": "Linux Security & Scripting (Bash / Python)", "importance": "Essential", "defaultLevel": 80, "category": "Programming" }
    ],
    "soft_skills": ["Investigative Detective Mindset", "Calm Composure During Incidents", "Risk Communication"],
    "common_tools": ["Wireshark", "Burp Suite", "Splunk / ELK", "Nmap", "Kali Linux"],
    "entry_level_expectations": [
      "Solid comprehension of TCP/IP, network layers, firewalls, and secure communications.",
      "Familiarity with common vulnerabilities: SQL Injection, Cross-Site Scripting (XSS), Broken Access Control."
    ],
    "suggested_projects": [
      {
        "title": "Automated Web Application Security Vulnerability Scanner",
        "description": "Create a security audit tool that inspects web endpoints for headers misconfigurations, outdated libraries, and injection vulnerabilities.",
        "difficulty": "Intermediate",
        "skillsUsed": ["Python", "OWASP Standards", "Requests", "Security Headers"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior SOC Analyst", "timeframe": "0-2 Years", "salaryRange": "$70k - $90k" },
      { "level": "Mid-Level", "title": "Information Security Analyst", "timeframe": "2-5 Years", "salaryRange": "$95k - $135k" },
      { "level": "Senior", "title": "Senior Security Architect", "timeframe": "5-8 Years", "salaryRange": "$140k - $185k" }
    ],
    "related_careers": ["Cloud Engineer", "DevOps Engineer", "Software Developer", "Backend Developer"]
  },
  {
    "id": "database-developer",
    "title": "Database Developer",
    "slug": "database-developer",
    "category": "Databases & Data Systems",
    "description": "Designs, optimizes, and maintains high-integrity relational and NoSQL database schemas, stored procedures, indexing strategies, and ETL pipelines.",
    "what_they_do": [
      "Design normalized relational data schemas (3NF) and ensure referential integrity constraints.",
      "Write complex SQL queries, stored procedures, triggers, views, and functions.",
      "Profile query execution plans (EXPLAIN ANALYZE) and implement targeted indexes."
    ],
    "core_technical_skills": [
      { "name": "Advanced SQL (CTEs, Window Functions, Triggers)", "importance": "Essential", "defaultLevel": 95, "category": "Databases" },
      { "name": "Relational Schema Normalization & Design", "importance": "Essential", "defaultLevel": 90, "category": "Databases" },
      { "name": "PostgreSQL & MySQL Administration", "importance": "Essential", "defaultLevel": 85, "category": "Databases" },
      { "name": "Query Optimization & Index Profiling", "importance": "Essential", "defaultLevel": 85, "category": "Databases" },
      { "name": "ACID Transactions & Concurrency Control", "importance": "Essential", "defaultLevel": 85, "category": "Databases" }
    ],
    "soft_skills": ["Data Accuracy", "Systematic Profiling", "Clear Schema Documentation"],
    "common_tools": ["PostgreSQL", "DBeaver / pgAdmin", "MySQL", "Redis", "Docker", "Python"],
    "entry_level_expectations": [
      "Fluency writing complex multi-table JOINs, subqueries, aggregations, and data modifications.",
      "Understanding of normalization rules and foreign key relationships."
    ],
    "suggested_projects": [
      {
        "title": "High-Volume Transactional Database Schema & Query Optimizer",
        "description": "Design and benchmark a normalized relational database schema simulating millions of ecommerce transactions with partitioned tables and composite indexes.",
        "difficulty": "Intermediate",
        "skillsUsed": ["PostgreSQL", "SQL", "Indexing", "EXPLAIN ANALYZE", "Docker"]
      }
    ],
    "career_progression": [
      { "level": "Junior / Associate", "title": "Junior Database Developer", "timeframe": "0-2 Years", "salaryRange": "$70k - $90k" },
      { "level": "Mid-Level", "title": "Database Engineer", "timeframe": "2-5 Years", "salaryRange": "$100k - $140k" },
      { "level": "Senior", "title": "Senior Database Architect", "timeframe": "5-8 Years", "salaryRange": "$145k - $185k" }
    ],
    "related_careers": ["Backend Developer", "Java Developer", "Data Analyst", "Data Scientist"]
  }
]

INITIAL_RESOURCES = [
  {
    "id": "res-js-mdn",
    "title": "MDN JavaScript Fundamentals & Modern ES6+",
    "provider": "Mozilla Developer Network",
    "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    "category": "Programming",
    "difficulty": "Beginner",
    "estimated_duration": "15 Hours",
    "resource_type": "Documentation",
    "related_skills": ["JavaScript", "Programming", "Web Development"],
    "is_verified": True
  },
  {
    "id": "res-ts-handbook",
    "title": "The Official TypeScript Handbook",
    "provider": "Microsoft TypeScript Team",
    "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
    "category": "Programming",
    "difficulty": "Intermediate",
    "estimated_duration": "12 Hours",
    "resource_type": "Guide",
    "related_skills": ["TypeScript", "JavaScript", "Software Engineering"],
    "is_verified": True
  },
  {
    "id": "res-python-official",
    "title": "Official Python Tutorial & Standard Library",
    "provider": "Python Software Foundation",
    "url": "https://docs.python.org/3/tutorial/index.html",
    "category": "Programming",
    "difficulty": "Beginner",
    "estimated_duration": "14 Hours",
    "resource_type": "Documentation",
    "related_skills": ["Python", "Programming", "Data Manipulation"],
    "is_verified": True
  },
  {
    "id": "res-react-dev",
    "title": "React Official Documentation: Quick Start to Advanced",
    "provider": "React Team / Meta",
    "url": "https://react.dev/learn",
    "category": "Web Development",
    "difficulty": "Beginner",
    "estimated_duration": "18 Hours",
    "resource_type": "Interactive Tutorial",
    "related_skills": ["React", "JavaScript", "Frontend Development"],
    "is_verified": True
  },
  {
    "id": "res-node-express",
    "title": "Express Web Framework (Node.js/JavaScript) Guide",
    "provider": "MDN Web Docs",
    "url": "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs",
    "category": "Web Development",
    "difficulty": "Intermediate",
    "estimated_duration": "16 Hours",
    "resource_type": "Guide",
    "related_skills": ["Node.js", "Express", "REST APIs", "Backend Development"],
    "is_verified": True
  },
  {
    "id": "res-postgres-tutorial",
    "title": "PostgreSQL Tutorial: From Basics to Advanced SQL",
    "provider": "PostgreSQL Tutorial",
    "url": "https://www.postgresqltutorial.com/",
    "category": "Databases",
    "difficulty": "Intermediate",
    "estimated_duration": "18 Hours",
    "resource_type": "Guide",
    "related_skills": ["SQL", "PostgreSQL", "Database Design", "Indexing"],
    "is_verified": True
  },
  {
    "id": "res-docker-getting-started",
    "title": "Docker Getting Started & Containerization Essentials",
    "provider": "Docker Docs",
    "url": "https://docs.docker.com/get-started/",
    "category": "Cloud & DevOps",
    "difficulty": "Beginner",
    "estimated_duration": "10 Hours",
    "resource_type": "Documentation",
    "related_skills": ["Docker", "Containerization", "DevOps"],
    "is_verified": True
  },
  {
    "id": "res-k8s-basics",
    "title": "Kubernetes Basics: Interactive Pods, Deployments & Services",
    "provider": "Kubernetes.io",
    "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
    "category": "Cloud & DevOps",
    "difficulty": "Advanced",
    "estimated_duration": "14 Hours",
    "resource_type": "Interactive Tutorial",
    "related_skills": ["Kubernetes", "Container Orchestration", "Cloud & DevOps"],
    "is_verified": True
  },
  {
    "id": "res-github-actions",
    "title": "GitHub Actions Documentation: CI/CD Workflows",
    "provider": "GitHub Docs",
    "url": "https://docs.github.com/en/actions",
    "category": "Cloud & DevOps",
    "difficulty": "Intermediate",
    "estimated_duration": "8 Hours",
    "resource_type": "Documentation",
    "related_skills": ["CI/CD", "DevOps", "Automation", "Git"],
    "is_verified": True
  },
  {
    "id": "res-kaggle-python-pandas",
    "title": "Kaggle Learn: Python, Pandas & Machine Learning Micro-Courses",
    "provider": "Kaggle",
    "url": "https://www.kaggle.com/learn",
    "category": "AI & Data",
    "difficulty": "Beginner",
    "estimated_duration": "20 Hours",
    "resource_type": "Interactive Tutorial",
    "related_skills": ["Python", "Pandas", "Machine Learning", "Data Analysis"],
    "is_verified": True
  },
  {
    "id": "res-pytorch-tutorials",
    "title": "PyTorch Deep Learning Official Tutorials",
    "provider": "PyTorch / Linux Foundation",
    "url": "https://pytorch.org/tutorials/",
    "category": "AI & Data",
    "difficulty": "Intermediate",
    "estimated_duration": "24 Hours",
    "resource_type": "Interactive Tutorial",
    "related_skills": ["PyTorch", "Deep Learning", "Machine Learning", "Python"],
    "is_verified": True
  },
  {
    "id": "res-playwright-docs",
    "title": "Playwright Automated End-to-End Testing Guide",
    "provider": "Microsoft",
    "url": "https://playwright.dev/docs/intro",
    "category": "Software Engineering",
    "difficulty": "Intermediate",
    "estimated_duration": "10 Hours",
    "resource_type": "Documentation",
    "related_skills": ["Playwright", "Automated Testing", "QA Engineering"],
    "is_verified": True
  },
  {
    "id": "res-owasp-top-10",
    "title": "OWASP Top 10 Web Application Security Risks",
    "provider": "OWASP Foundation",
    "url": "https://owasp.org/www-project-top-ten/",
    "category": "Software Engineering",
    "difficulty": "Intermediate",
    "estimated_duration": "12 Hours",
    "resource_type": "Guide",
    "related_skills": ["Cybersecurity", "OWASP", "Secure Coding", "Web Security"],
    "is_verified": True
  },
  {
    "id": "res-freecodecamp-fullstack",
    "title": "freeCodeCamp Responsive Web Design & JavaScript Algorithms",
    "provider": "freeCodeCamp",
    "url": "https://www.freecodecamp.org/learn",
    "category": "Web Development",
    "difficulty": "Beginner",
    "estimated_duration": "50 Hours",
    "resource_type": "Course",
    "related_skills": ["HTML5", "CSS3", "JavaScript", "Algorithms"],
    "is_verified": True
  }
]

def seed_database(db: Session):
    # 1. Seed Career Roles without duplicates
    existing_roles = {r.id for r in db.query(CareerRole.id).all()}
    for career in INITIAL_CAREERS:
        if career["id"] not in existing_roles:
            role_obj = CareerRole(
                id=career["id"],
                title=career["title"],
                slug=career["slug"],
                category=career["category"],
                description=career["description"],
                what_they_do=career["what_they_do"],
                core_technical_skills=career["core_technical_skills"],
                soft_skills=career["soft_skills"],
                common_tools=career["common_tools"],
                entry_level_expectations=career["entry_level_expectations"],
                suggested_projects=career["suggested_projects"],
                career_progression=career["career_progression"],
                related_careers=career["related_careers"]
            )
            db.add(role_obj)
            existing_roles.add(career["id"])

    # 2. Seed Learning Resources without duplicates
    existing_resources = {r.id for r in db.query(LearningResource.id).all()}
    for res in INITIAL_RESOURCES:
        if res["id"] not in existing_resources:
            res_obj = LearningResource(
                id=res["id"],
                title=res["title"],
                provider=res["provider"],
                url=res["url"],
                category=res["category"],
                difficulty=res["difficulty"],
                estimated_duration=res["estimated_duration"],
                resource_type=res["resource_type"],
                related_skills=res["related_skills"],
                is_verified=res["is_verified"]
            )
            db.add(res_obj)
            existing_resources.add(res["id"])

    # 3. Seed Demo Student User (Alex Chen) if not exists
    existing_alex = db.query(User).filter(User.email == "alex.chen@university.edu").first()
    if not existing_alex:
        alex_user = User(
            id="usr_alexchen_demo",
            name="Alex Chen",
            email="alex.chen@university.edu",
            password_hash=hash_password("StudentPass123!"),
            is_onboarded=True,
            target_career_id="software-developer"
        )
        db.add(alex_user)
        db.flush()

        education_data = {
            "degree": "Bachelor of Technology (B.Tech)",
            "department": "Computer Science & Engineering",
            "institution": "Tech University",
            "graduationYear": "2026",
            "academicPerformance": "8.8 CGPA"
        }
        tech_skills = [
            {"name": "Python", "category": "Programming", "level": 82},
            {"name": "JavaScript / TypeScript", "category": "Programming", "level": 78},
            {"name": "React / Modern Frontend", "category": "Web Development", "level": 74},
            {"name": "SQL & Relational DBs", "category": "Databases", "level": 70},
            {"name": "Git Version Control", "category": "Tools & Others", "level": 80}
        ]
        soft_skills = [
            "Analytical Problem Solving",
            "Clear Technical Communication",
            "Agile Team Collaboration"
        ]
        interests = ["Full-Stack Development", "Cloud Systems", "Artificial Intelligence"]
        career_goals = {
            "targetTimeframe": "Within 6 months",
            "desiredRole": "Software Developer",
            "primaryMotivation": "Building scalable web platforms and reliable backend architectures"
        }
        work_prefs = {
            "workStyle": "Hybrid",
            "preferredTeamSize": "Medium (5-15 engineers)"
        }
        exp_data = {
            "type": "Academic Projects & Internship",
            "description": "Engineered full-stack collaborative tools and REST APIs with comprehensive test suites."
        }

        readiness_breakdown = {
            "technicalFoundation": 78,
            "projectEvidence": 72,
            "interviewReadiness": 65,
            "atsResumeQuality": 70,
            "academicAlignment": 88,
            "continuousLearning": 75
        }

        alex_profile = CareerProfile(
            id="prof_alexchen_demo",
            user_id=alex_user.id,
            education=education_data,
            technical_skills=tech_skills,
            soft_skills=soft_skills,
            interests=interests,
            experience=exp_data,
            career_goals=career_goals,
            work_preferences=work_prefs,
            readiness_score=75,
            readiness_breakdown=readiness_breakdown,
            current_direction="Software Developer",
            match_percentage=86,
            direction_explanation="Solid foundation in computer science principles, Python, modern web development, and database architecture.",
            biggest_opportunity="Deepen system design experience and containerized cloud deployment workflows.",
            next_best_action="Complete the advanced microservices roadmap milestone and practice 2 technical interview mock rounds."
        )
        db.add(alex_profile)

        db.add(ProgressTimeline(
            id="ev_alexchen_welcome",
            user_id=alex_user.id,
            type="account",
            title="Demo Student Profile Initialized",
            description="Welcome to your AI Career Guidance Framework workspace, Alex."
        ))

        sw_role = db.query(CareerRole).filter(CareerRole.id == "software-developer").first()
        if sw_role:
            onboarding_dict = {
                "education": education_data,
                "technicalSkills": tech_skills,
                "softSkills": soft_skills,
                "interests": interests,
                "experience": exp_data,
                "careerGoals": career_goals,
                "workPreferences": work_prefs,
            }
            phases = generate_personalized_roadmap(onboarding_dict, sw_role.__dict__)
            alex_roadmap = LearningRoadmap(
                id="rdm_alexchen_demo",
                user_id=alex_user.id,
                target_career_id="software-developer",
                target_career_title="Software Developer",
                phases=phases,
                overall_progress=25
            )
            db.add(alex_roadmap)

    db.commit()
    print(f"Database seeded successfully with {len(existing_roles)} career roles and {len(existing_resources)} learning resources.")
