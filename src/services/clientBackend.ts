import seedData from '../data/seedData.json';
import assessmentData from '../data/assessmentData.json';
import interviewData from '../data/interviewData.json';
import benchmarks from '../data/career_market_benchmarks.json';
import {
  User,
  Career,
  CareerRecommendation,
  SkillGapAnalysis,
  Roadmap,
  SkillEvidence,
  InterviewSession,
  ProgressTimelineItem,
  EmployabilityReadiness,
  CareerInsight
} from '../types/index.js';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'career_framework_users',
  ACTIVE_USER: 'career_framework_user',
  TOKEN: 'career_framework_token',
  PROFILES: 'career_framework_profiles',
  ASSESSMENTS: 'career_framework_assessments',
  ROADMAPS: 'career_framework_roadmaps',
  EVIDENCE: 'career_framework_evidence',
  INTERVIEWS: 'career_framework_interviews',
  RESUMES: 'career_framework_resumes',
  TIMELINE: 'career_framework_timeline',
  INSIGHTS: 'career_framework_insights',
  CHAT: 'career_framework_chat_history',
};

// Helpers for localStorage
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// ----------------------------------------------------
// Initial Seed Data & Formatter
// ----------------------------------------------------

export function formatCareerRole(rawRole: any): Career {
  return {
    id: rawRole.id || rawRole.slug,
    title: rawRole.title,
    slug: rawRole.slug || rawRole.id,
    category: rawRole.category,
    description: rawRole.description,
    whatTheyDo: rawRole.what_they_do || rawRole.whatTheyDo || [],
    coreTechnicalSkills: (rawRole.core_technical_skills || rawRole.coreTechnicalSkills || []).map((s: any) => ({
      name: s.name,
      importance: s.importance || 'High',
      defaultLevel: s.defaultLevel || 75,
      category: s.category || 'Programming',
    })),
    softSkills: rawRole.soft_skills || rawRole.softSkills || [],
    commonTools: rawRole.common_tools || rawRole.commonTools || [],
    entryLevelExpectations: rawRole.entry_level_expectations || rawRole.entryLevelExpectations || [],
    suggestedProjects: (rawRole.suggested_projects || rawRole.suggestedProjects || []).map((p: any) => ({
      title: p.title,
      description: p.description,
      difficulty: p.difficulty || 'Intermediate',
      skillsUsed: p.skillsUsed || p.skills_used || [],
    })),
    careerProgression: (rawRole.career_progression || rawRole.careerProgression || []).map((cp: any) => ({
      level: cp.level,
      title: cp.title,
      timeframe: cp.timeframe,
      salaryRange: cp.salaryRange || cp.salary_range || '$80k - $100k',
    })),
    relatedCareers: rawRole.related_careers || rawRole.relatedCareers || [],
  };
}

export const CATALOG_CAREERS: Career[] = (seedData.INITIAL_CAREERS || []).map(formatCareerRole);
export const LEARNING_RESOURCES: any[] = seedData.INITIAL_RESOURCES || [];

// Default Demo User
export const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo_alex_chen',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  role: 'student',
  targetCareerId: 'software-developer',
  isOnboarded: true,
  createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
};

const DEFAULT_DEMO_PROFILE: any = {
  id: 'prof_demo_alex',
  userId: 'usr_demo_alex_chen',
  fullName: 'Alex Chen',
  email: 'alex.chen@university.edu',
  currentDirection: 'Software Developer',
  targetCareerId: 'software-developer',
  readinessScore: 78,
  education: {
    degree: 'B.Tech in Computer Science & Engineering',
    department: 'Computer Science',
    institution: 'State University of Technology',
    graduationYear: 2026,
    academicPerformance: '8.8 CGPA (First Class with Distinction)',
  },
  technicalSkills: [
    { name: 'JavaScript / TypeScript', level: 80, category: 'Programming', verified: true },
    { name: 'React / Modern Frontend', level: 75, category: 'Web Development', verified: true },
    { name: 'Node.js & Express', level: 70, category: 'Web Development', verified: false },
    { name: 'SQL & Relational DBs', level: 65, category: 'Databases', verified: false },
    { name: 'Data Structures & Algorithms', level: 75, category: 'Programming', verified: true },
    { name: 'Git Version Control', level: 85, category: 'Tools & Others', verified: true },
    { name: 'Docker & Containerization', level: 50, category: 'Cloud & DevOps', verified: false },
    { name: 'Automated Testing (Jest/Mocha)', level: 45, category: 'Tools & Others', verified: false },
  ],
  softSkills: [
    'Analytical Problem Solving',
    'Clear Technical Communication',
    'Constructive Code Review Feedback',
    'Autonomous Debugging & Research',
  ],
  interests: [
    'Full-Stack Web Development',
    'Cloud Architecture',
    'Scalable Microservices',
    'Open Source Contribution',
  ],
  careerGoals: {
    desiredRole: 'Software Developer',
    timeframe: '6 Months',
    preferredWorkStyle: 'Hybrid / Remote',
    targetIndustry: 'Technology & Cloud Platforms',
  },
  experience: {
    projects: [
      {
        title: 'Distributed Real-Time Task Flow Manager',
        description: 'Collaborative task planner with WebSockets, optimistic UI updates, and PostgreSQL transactional persistence.',
        techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        link: 'https://github.com/alexchen/flow-tasker',
      },
      {
        title: 'High-Throughput Token Bucket Rate Limiter',
        description: 'Microservice API gateway module with sliding window token refill and Jest integration test suite.',
        techStack: ['Node.js', 'TypeScript', 'Jest', 'Docker'],
        link: 'https://github.com/alexchen/rate-limiter-service',
      },
    ],
    internships: [
      {
        role: 'Frontend Engineering Intern',
        company: 'CloudPulse Technologies',
        duration: '3 Months (Summer 2025)',
        description: 'Migrated internal dashboard widgets to React 19, reduced bundle load by 18%, and maintained 90%+ test coverage.',
      },
    ],
    certifications: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Coursera / Meta',
        date: '2024',
      },
      {
        name: 'PostgreSQL Relational Database Foundations',
        issuer: 'freeCodeCamp',
        date: '2025',
      },
    ],
  },
};

const DEFAULT_TIMELINE: ProgressTimelineItem[] = [
  {
    id: 'tl-1',
    userId: 'usr_demo_alex_chen',
    type: 'assessment',
    title: 'Completed Adaptive Career Assessment',
    description: 'Achieved high aptitude in Systems & Architectural Thinking with 78% baseline readiness.',
    timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-2',
    userId: 'usr_demo_alex_chen',
    type: 'roadmap',
    title: 'Generated Personalized Roadmap',
    description: 'Initialized 5-stage competency roadmap tailored to Software Developer benchmarks.',
    timestamp: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tl-3',
    userId: 'usr_demo_alex_chen',
    type: 'evidence',
    title: 'Submitted Verified Repository Evidence',
    description: 'Verified public repository for "Distributed Real-Time Task Flow Manager".',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

const DEFAULT_EVIDENCE: SkillEvidence[] = [
  {
    id: 'ev-1',
    userId: 'usr_demo_alex_chen',
    skillName: 'React / Modern Frontend',
    evidenceType: 'github',
    title: 'Distributed Real-Time Task Flow Manager',
    url: 'https://github.com/alexchen/flow-tasker',
    description: 'React SPA featuring responsive UI, custom state management, and real-time WebSocket event listeners.',
    verifiedStatus: 'Demonstrated Through Project',
    strength: 'Strong',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ev-2',
    userId: 'usr_demo_alex_chen',
    skillName: 'TypeScript & Node.js',
    evidenceType: 'certification',
    title: 'Meta Front-End Developer Professional Certificate',
    url: 'https://coursera.org/verify/meta-frontend',
    description: 'Comprehensive curriculum covering ES6+, TypeScript, React component lifecycle, and accessibility standards.',
    verifiedStatus: 'Verified Assessment',
    strength: 'Strong',
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
];

// Initialize default state in localStorage if clean
export function initializeStorageIfEmpty(): void {
  const existingUsers = getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (!existingUsers.length) {
    setItem(STORAGE_KEYS.USERS, [DEFAULT_DEMO_USER]);
  }
  const activeUser = getItem<User | null>(STORAGE_KEYS.ACTIVE_USER, null);
  if (!activeUser) {
    setItem(STORAGE_KEYS.ACTIVE_USER, DEFAULT_DEMO_USER);
    setItem(STORAGE_KEYS.TOKEN, 'demo_jwt_token_' + DEFAULT_DEMO_USER.id);
  }
  const profiles = getItem<Record<string, any>>(STORAGE_KEYS.PROFILES, {});
  if (!profiles[DEFAULT_DEMO_USER.id]) {
    profiles[DEFAULT_DEMO_USER.id] = DEFAULT_DEMO_PROFILE;
    setItem(STORAGE_KEYS.PROFILES, profiles);
  }
  const timeline = getItem<ProgressTimelineItem[]>(STORAGE_KEYS.TIMELINE, []);
  if (!timeline.length) {
    setItem(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE);
  }
  const evidence = getItem<SkillEvidence[]>(STORAGE_KEYS.EVIDENCE, []);
  if (!evidence.length) {
    setItem(STORAGE_KEYS.EVIDENCE, DEFAULT_EVIDENCE);
  }
  const interviews = getItem<InterviewSession[]>(STORAGE_KEYS.INTERVIEWS, []);
  if (!interviews.length) {
    setItem(STORAGE_KEYS.INTERVIEWS, [
      {
        id: 'int_demo_completed_1',
        userId: DEFAULT_DEMO_USER.id,
        careerTitle: 'Software Developer',
        format: 'Technical Interview',
        interviewType: 'Technical Interview',
        difficulty: 'Intermediate',
        mode: 'realistic',
        durationMinutes: 15,
        targetQuestionCount: 5,
        mainQuestionCount: 5,
        status: 'completed',
        overallScore: 88,
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 14 * 60 * 1000).toISOString(),
        questions: [
          {
            id: 'sd_t_i1',
            questionText: 'How do you design an idempotent RESTful endpoint for a payment transaction?',
            question: 'How do you design an idempotent RESTful endpoint for a payment transaction?',
            topic: 'REST APIs & Concurrency',
            difficulty: 'Intermediate',
            evaluationFormat: 'technical',
          },
          {
            id: 'sd_t_i2',
            questionText: 'How do you optimize slow database queries and design composite indexes in PostgreSQL?',
            question: 'How do you optimize slow database queries and design composite indexes in PostgreSQL?',
            topic: 'Database Performance',
            difficulty: 'Intermediate',
            evaluationFormat: 'technical',
          },
        ],
        answers: [
          {
            id: 'ans_demo_1',
            questionId: 'sd_t_i1',
            questionText: 'How do you design an idempotent RESTful endpoint for a payment transaction?',
            answerText: 'I utilize an Idempotency-Key header containing a client-generated UUID stored in Redis or database with unique constraints. If a duplicate request arrives, we return HTTP 409 or the cached response without re-executing.',
            score: 90,
            evaluation: {
              score: 90,
              relevance: 92,
              technicalAccuracy: 90,
              clarity: 88,
              problemSolving: 90,
              depthOfUnderstanding: 88,
              practicalApplication: 92,
              strengths: ['Identified UUID idempotency header and cache deduplication', 'Proper status code semantics'],
              improvements: ['Could detail TTL expiration window for cached transactions'],
              suggestedIdealResponse: 'Emphasize atomic distributed locks and transactional ledger writes.',
              idealAnswer: 'Store idempotency keys in Redis with TTL and enforce unique database constraints.',
            },
            isFollowUp: false,
          },
          {
            id: 'ans_demo_2',
            questionId: 'sd_t_i2',
            questionText: 'How do you optimize slow database queries and design composite indexes in PostgreSQL?',
            answerText: 'I analyze queries with EXPLAIN ANALYZE to identify sequential scans. For filtering and sorting, I place highest selectivity equality columns first in composite indexes, followed by range conditions.',
            score: 86,
            evaluation: {
              score: 86,
              relevance: 88,
              technicalAccuracy: 87,
              clarity: 85,
              problemSolving: 86,
              depthOfUnderstanding: 86,
              practicalApplication: 88,
              strengths: ['Mentioned EXPLAIN ANALYZE and column selectivity ordering'],
              improvements: ['Could mention covering indexes with INCLUDE clause'],
              suggestedIdealResponse: 'Discuss index bloat, partial indexes, and vacuuming statistics.',
              idealAnswer: 'Order index columns by equality predicates first, then range predicates, using EXPLAIN ANALYZE.',
            },
            isFollowUp: false,
          },
        ],
        conversation: [
          {
            id: 't1',
            role: 'interviewer',
            text: 'Welcome, Alex! Let us begin your Intermediate Technical Interview for Software Developer.',
            type: 'greeting',
            timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          },
          {
            id: 't2',
            role: 'interviewer',
            text: 'How do you design an idempotent RESTful endpoint for a payment transaction?',
            type: 'question',
            questionId: 'sd_t_i1',
            questionText: 'How do you design an idempotent RESTful endpoint for a payment transaction?',
            topic: 'REST APIs & Concurrency',
            timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 30 * 1000).toISOString(),
          },
          {
            id: 't3',
            role: 'candidate',
            text: 'I utilize an Idempotency-Key header containing a client-generated UUID stored in Redis or database with unique constraints. If a duplicate request arrives, we return HTTP 409 or the cached response without re-executing.',
            type: 'answer',
            timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 90 * 1000).toISOString(),
          },
        ],
        finalSummary: {
          overallScore: 88,
          tier: 'Market-Competitive Ready',
          status: 'completed',
          questionsAnswered: 2,
          summaryText: 'Candidate demonstrated clear technical articulation, proactive consideration of concurrent race conditions, and strong database schema optimization principles.',
          dimensions: {
            technicalAccuracy: 89,
            problemSolving: 88,
            communication: 86,
            depthOfUnderstanding: 87,
            practicalApplication: 90,
          },
          perQuestionFeedback: [
            {
              questionNumber: 1,
              questionText: 'How do you design an idempotent RESTful endpoint for a payment transaction?',
              candidateAnswer: 'I utilize an Idempotency-Key header containing a client-generated UUID stored in Redis or database with unique constraints.',
              score: 90,
              whatWentWell: 'Clear explanation of idempotency keys and cache deduplication.',
              whatWasMissing: 'Could specify failure handling during network partition.',
              suggestedImprovement: 'Highlight atomic distributed transactions and two-phase commits.',
              idealAnswer: 'Store idempotency keys in Redis with TTL and enforce unique database constraints.',
            },
            {
              questionNumber: 2,
              questionText: 'How do you optimize slow database queries and design composite indexes in PostgreSQL?',
              candidateAnswer: 'I analyze queries with EXPLAIN ANALYZE to identify sequential scans. For filtering and sorting, I place highest selectivity equality columns first in composite indexes.',
              score: 86,
              whatWentWell: 'Good command of EXPLAIN ANALYZE and B-Tree selectivity.',
              whatWasMissing: 'Could mention covering indexes (INCLUDE).',
              suggestedImprovement: 'Discuss table vacuuming and index bloat.',
              idealAnswer: 'Order index columns by equality predicates first, then range predicates, using EXPLAIN ANALYZE.',
            },
          ],
          recommendations: [
            {
              title: 'Deepen Distributed Systems Testing',
              exercise: 'Practice high-throughput queue throttling scenarios in Stage 3 of your Roadmap.',
            },
          ],
        },
      },
    ]);
  }
  const resumes = getItem<any[]>(STORAGE_KEYS.RESUMES, []);
  if (!resumes.length) {
    setItem(STORAGE_KEYS.RESUMES, [
      {
        id: 'res_demo_alex_1',
        targetRole: 'Software Developer',
        fileName: 'Alex_Chen_SWE_Resume.pdf',
        overallScore: 84,
        completenessScore: 100,
        keywordMatchScore: 82,
        impactScore: 80,
        detectedSkills: [
          'JavaScript / TypeScript',
          'React',
          'Node.js',
          'PostgreSQL',
          'REST APIs',
          'Git',
          'Docker',
          'Jest',
        ],
        missingSkills: ['Kubernetes', 'Redis Caching', 'CI/CD Pipelines'],
        softSkillsDetected: ['Problem Solving', 'Communication', 'Teamwork'],
        sections: [
          { name: 'Contact Information', found: true, status: 'complete' },
          { name: 'Education & Academics', found: true, status: 'complete' },
          { name: 'Technical Skills & Tools', found: true, status: 'complete' },
          { name: 'Practical Projects & Portfolio', found: true, status: 'complete' },
          { name: 'Experience & Internships', found: true, status: 'complete' },
        ],
        suggestions: [
          'Integrate Redis and container orchestration (Kubernetes) keywords to reach 90%+ ATS match.',
          'Quantify team velocity gains in your frontend internship bullet points.',
          'Link your GitHub repositories directly next to project titles.',
        ],
        bulletPointRewrites: [
          {
            original: 'Worked on building full-stack web application with React and PostgreSQL.',
            improved: 'Architected full-stack web application with React and PostgreSQL handling 1,200+ active users.',
            rationale: 'Replaced passive phrasing with strong action verb and quantified user scale.',
          },
          {
            original: 'Responsible for writing unit tests and fixing bugs.',
            improved: 'Engineered automated unit test suites using Jest, increasing test coverage from 65% to 88%.',
            rationale: 'Highlighted measurable code quality metrics and testing frameworks.',
          },
        ],
        analyzedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
    ]);
  }
}

// Ensure storage initialized on module load
initializeStorageIfEmpty();

// Active User & Profile Getters
export function getCurrentUser(): User {
  const user = getItem<User | null>(STORAGE_KEYS.ACTIVE_USER, null);
  return user || DEFAULT_DEMO_USER;
}

export function getCurrentProfile(): any {
  const user = getCurrentUser();
  const profiles = getItem<Record<string, any>>(STORAGE_KEYS.PROFILES, {});
  if (profiles[user.id]) {
    return profiles[user.id];
  }
  const newProf = {
    ...DEFAULT_DEMO_PROFILE,
    id: 'prof_' + user.id,
    userId: user.id,
    fullName: user.name,
    email: user.email,
    targetCareerId: user.targetCareerId || 'software-developer',
    currentDirection: 'Software Developer',
  };
  profiles[user.id] = newProf;
  setItem(STORAGE_KEYS.PROFILES, profiles);
  return newProf;
}

export function saveCurrentProfile(updated: any): any {
  const user = getCurrentUser();
  const profiles = getItem<Record<string, any>>(STORAGE_KEYS.PROFILES, {});
  profiles[user.id] = { ...getCurrentProfile(), ...updated };
  setItem(STORAGE_KEYS.PROFILES, profiles);
  return profiles[user.id];
}

// ----------------------------------------------------
// Algorithms Ported from Python Backend
// ----------------------------------------------------

// 1. Skill Match Helper
function isSkillMatch(candidateSkill: string, requiredSkill: string): boolean {
  const c = candidateSkill.toLowerCase().trim();
  const r = requiredSkill.toLowerCase().trim();
  if (c === r) return true;
  if (r.includes(c) || c.includes(r)) return true;

  const cTokens = c.split(/[\s,./&+-]+/).filter((w) => w.length > 2);
  const rTokens = r.split(/[\s,./&+-]+/).filter((w) => w.length > 2);

  return cTokens.some((ct) => rTokens.some((rt) => ct === rt || ct.includes(rt) || rt.includes(ct)));
}

function matchSkillLevel(userSkills: any[], targetName: string): number {
  const t = targetName.toLowerCase().trim();
  for (const s of userSkills) {
    const u = (s.name || '').toLowerCase().trim();
    if (u === t || t.includes(u) || u.includes(t)) {
      return s.level || 50;
    }
    const uTokens = u.split(/\s+/).filter((w: string) => w.length > 2);
    const tTokens = t.split(/\s+/).filter((w: string) => w.length > 2);
    if (uTokens.some((ut: string) => tTokens.includes(ut))) {
      return s.level || 50;
    }
  }
  return 0;
}

// 2. Career Recommendations Algorithm (45% Skills, 20% Interests, 15% Education, 10% Experience, 10% Assessment)
export function calculateCareerRecommendations(
  profileData: any,
  assessmentDataObj: any,
  catalogCareers: Career[]
): CareerRecommendation[] {
  if (!catalogCareers || !catalogCareers.length) return [];

  const safeProfile = profileData || getCurrentProfile() || DEFAULT_DEMO_PROFILE;
  const userSkills = safeProfile.technicalSkills || safeProfile.technical_skills || [];
  const userInterests = (safeProfile.interests || []).map((i: string) => (i || '').toLowerCase());
  const userExperience = safeProfile.experience || {};
  const userProjects = userExperience.projects || [];
  const userInternships = userExperience.internships || [];
  const userCertifications = userExperience.certifications || [];
  const careerGoals = safeProfile.careerGoals || safeProfile.career_goals || {};
  const desiredRole = (careerGoals.desiredRole || careerGoals.desired_role || safeProfile.currentDirection || '').toLowerCase();
  const education = safeProfile.education || {};
  const degree = (education.degree || '').toLowerCase();
  const department = (education.department || '').toLowerCase();

  const scoredCareers: CareerRecommendation[] = [];

  for (const career of catalogCareers) {
    const coreSkills = career.coreTechnicalSkills || [];

    // 1. Skill Match Score (Weight: 45%)
    let skillScoreSum = 0;
    let totalSkillWeight = 0;
    const strongFactors: string[] = [];
    const missingFactors: string[] = [];
    const matchedSkillNames = new Set<string>();

    for (const reqSkill of coreSkills) {
      const importance = reqSkill.importance || 'High';
      const importanceWeight = importance === 'Essential' ? 1.0 : importance === 'High' ? 0.75 : 0.5;
      totalSkillWeight += importanceWeight;

      const reqName = reqSkill.name;
      const targetBenchmark = reqSkill.defaultLevel || 75;

      const matchedUserSkill = userSkills.find((us: any) => isSkillMatch(us.name || '', reqName));
      if (matchedUserSkill) {
        matchedSkillNames.add(reqName);
        const level = matchedUserSkill.level || 50;
        const levelRatio = Math.min(1.15, level / Math.max(1, targetBenchmark));
        const skillPoint = levelRatio * 100 * importanceWeight;
        skillScoreSum += Math.min(100 * importanceWeight, skillPoint);
        if (level >= 65 && strongFactors.length < 3) {
          strongFactors.push(`Demonstrated proficiency in ${reqName} (${level}%)`);
        }
      } else {
        if ((importance === 'Essential' || importance === 'High') && missingFactors.length < 3) {
          missingFactors.push(`${reqName} benchmark proficiency`);
        }
      }
    }

    const skillScore = totalSkillWeight > 0 ? skillScoreSum / totalSkillWeight : 50;

    // 2. Interest Alignment (Weight: 20%)
    let interestScore = 40;
    const titleLower = career.title.toLowerCase();
    const categoryLower = career.category.toLowerCase();
    const descLower = career.description.toLowerCase();

    if (desiredRole && (desiredRole.includes(titleLower) || titleLower.includes(desiredRole))) {
      interestScore += 45;
      strongFactors.push(`Direct alignment with your declared career goal: "${career.title}"`);
    }

    for (const interest of userInterests) {
      if (titleLower.includes(interest) || categoryLower.includes(interest) || descLower.includes(interest)) {
        interestScore += 15;
      }
    }
    interestScore = Math.min(100, interestScore);

    // 3. Education Relevance (Weight: 15%)
    let educationScore = 65;
    const techDepts = ['computer', 'software', 'information', 'data', 'ai', 'electrical', 'electronic', 'mathematics'];
    if (techDepts.some((d) => department.includes(d) || degree.includes(d))) {
      educationScore = 88;
    }
    const perf = (education.academicPerformance || '').toLowerCase();
    if (['9', '8.', '85%', '90%', 'first class'].some((k) => perf.includes(k))) {
      educationScore = Math.min(100, educationScore + 7);
    }

    // 4. Experience & Projects (Weight: 10%)
    let experienceScore = 40;
    let matchingProjects = 0;
    for (const proj of userProjects) {
      const pStack = (proj.techStack || []).join(' ').toLowerCase();
      const pText = `${proj.title || ''} ${proj.description || ''}`.toLowerCase();
      const hasOverlap = coreSkills.some(
        (s) => pStack.includes(s.name.toLowerCase()) || pText.includes(s.name.toLowerCase())
      );
      if (hasOverlap) matchingProjects++;
    }
    experienceScore += matchingProjects * 18;
    if (userInternships.length) experienceScore += 15;
    if (userCertifications.length) experienceScore += 10;
    experienceScore = Math.min(100, experienceScore);

    if (matchingProjects > 0 && strongFactors.length < 3) {
      strongFactors.push(`Practical project experience in ${matchingProjects} relevant domain project(s)`);
    }

    // 5. Assessment Signals (Weight: 10%)
    let assessmentScore = 70;
    if (assessmentDataObj && assessmentDataObj.isCompleted) {
      const aiAnalysis = assessmentDataObj.aiAnalysis || {};
      const dominant = (aiAnalysis.dominantArchetype || '').toLowerCase();
      const cId = career.id.toLowerCase();
      if (dominant.includes('systems') && (cId.includes('developer') || cId.includes('cloud') || cId.includes('backend'))) {
        assessmentScore += 20;
      } else if (dominant.includes('data') && (cId.includes('data') || cId.includes('analyst') || cId.includes('scientist'))) {
        assessmentScore += 20;
      } else if (dominant.includes('builder') && (cId.includes('full-stack') || cId.includes('software') || cId.includes('frontend'))) {
        assessmentScore += 20;
      }
      const probScore = (assessmentDataObj.categoryScores || {})['Problem Solving'] || 70;
      assessmentScore = (assessmentScore + probScore) / 2;
    }

    // Aggregate
    const rawTotal =
      skillScore * 0.45 +
      interestScore * 0.2 +
      educationScore * 0.15 +
      experienceScore * 0.1 +
      assessmentScore * 0.1;

    const matchPercentage = Math.min(96, Math.max(35, Math.round(rawTotal)));

    if (!strongFactors.length) {
      strongFactors.push('Transferable computational foundation', 'Academic coursework relevance');
    }
    if (!missingFactors.length) {
      missingFactors.push('Production-scale deployment experience', 'Automated integration testing');
    }

    const matchExplanation = `Calculated compatibility of ${matchPercentage}% for ${career.title} based on demonstrated technical alignment in ${matchedSkillNames.size} of ${coreSkills.length} core competencies, supported by your academic foundation and project portfolio.`;

    scoredCareers.push({
      careerId: career.id,
      title: career.title,
      matchPercentage,
      matchExplanation,
      strongFactors: strongFactors.slice(0, 3),
      missingFactors: missingFactors.slice(0, 3),
      recommendedPriority: 1,
    });
  }

  scoredCareers.sort((a, b) => b.matchPercentage - a.matchPercentage);
  scoredCareers.forEach((item, idx) => {
    item.recommendedPriority = idx + 1;
  });

  return scoredCareers.slice(0, 6);
}

// 3. Skill Gap Analysis Algorithm
export function calculateSkillGap(
  profileData: any,
  targetCareer: Career,
  learningResources: any[] = LEARNING_RESOURCES
): SkillGapAnalysis {
  const safeProfile = profileData || getCurrentProfile() || DEFAULT_DEMO_PROFILE;
  const userSkills = safeProfile.technicalSkills || safeProfile.technical_skills || [];
  const coreSkills = targetCareer.coreTechnicalSkills || [];
  const targetTitle = targetCareer.title || 'Target Role';
  const targetId = targetCareer.id || targetCareer.slug || '';

  let totalGapPoints = 0;
  let totalBenchmarkPoints = 0;
  const evaluatedSkills: any[] = [];

  for (const req of coreSkills) {
    const reqName = req.name;
    const currentLvl = matchSkillLevel(userSkills, reqName);
    const targetLvl = req.defaultLevel || 80;
    const gap = Math.max(0, targetLvl - currentLvl);
    const importance = req.importance || 'High';
    const cat = req.category || 'Programming';

    let status: 'have' | 'developing' | 'need' | 'optional';
    if (currentLvl >= 75) {
      status = 'have';
    } else if (currentLvl >= 40) {
      status = 'developing';
    } else if (importance === 'Medium') {
      status = 'optional';
    } else {
      status = 'need';
    }

    totalGapPoints += gap;
    totalBenchmarkPoints += targetLvl;

    // Match learning resource
    let matchedResource = learningResources.find((res: any) => {
      const related = (res.related_skills || res.relatedSkills || []).map((r: string) => r.toLowerCase());
      return related.some((r: string) => reqName.toLowerCase().includes(r) || r.includes(reqName.toLowerCase())) || res.category === cat;
    });

    let whyItMatters = `Essential industry standard for professional ${targetTitle} execution and code quality.`;
    if (reqName.includes('SQL') || reqName.includes('Database')) {
      whyItMatters = 'Crucial for transactional data integrity, schema normalization, and query performance.';
    } else if (reqName.includes('Docker') || reqName.includes('Cloud') || reqName.includes('DevOps')) {
      whyItMatters = 'Required for repeatable container packaging, environment parity, and CI/CD pipelines.';
    } else if (reqName.includes('React') || reqName.includes('Frontend') || reqName.includes('UI')) {
      whyItMatters = 'Foundational for responsive component state architecture, client routing, and accessibility.';
    } else if (reqName.includes('Test') || reqName.includes('QA')) {
      whyItMatters = 'Guarantees software stability, automated regression prevention, and clean releases.';
    }

    let action = '';
    if (status === 'have') {
      action = `Document verifiable GitHub proof and complete an advanced benchmark or code review.`;
    } else if (status === 'developing') {
      action = `Implement an end-to-end hands-on project utilizing ${reqName} with automated tests.`;
    } else {
      action = `Complete foundational coursework on ${reqName} fundamentals followed by interactive sandboxes.`;
    }

    evaluatedSkills.push({
      name: reqName,
      category: cat,
      status,
      currentLevel: currentLvl,
      targetLevel: targetLvl,
      gap,
      importance,
      whyItMatters,
      recommendedAction: action,
      recommendedResourceUrl: matchedResource?.url || null,
      recommendedResourceTitle: matchedResource?.title || null,
    });
  }

  const demonstrated = evaluatedSkills.filter((s) => s.status === 'have');
  const developing = evaluatedSkills.filter((s) => s.status === 'developing');
  const missingEssential = evaluatedSkills.filter((s) => s.status === 'need');
  const optionalOpps = evaluatedSkills.filter((s) => s.status === 'optional');

  const overallGapScore = Math.round((totalGapPoints / Math.max(1, totalBenchmarkPoints)) * 100);
  const readiness = Math.max(30, 100 - overallGapScore);

  const summary = `Skill-gap evaluation against ${targetTitle}: You have demonstrated mastery in ${demonstrated.length} of ${evaluatedSkills.length} competencies, with ${developing.length} skills in active development and ${missingEssential.length} essential competencies requiring targeted focus.`;

  return {
    targetRole: targetTitle,
    careerTitle: targetTitle,
    targetRoleId: targetId,
    summary,
    overallGapScore,
    matchPercentage: readiness,
    overallReadiness: readiness,
    skills: evaluatedSkills,
    categorized: {
      demonstrated,
      developing,
      missingEssential,
      optionalOpportunities: optionalOpps,
    },
  } as any;
}

// 4. Employability Calculator (Multi-Factor Scoring)
export function calculateEmployability(
  profileData: any,
  assessmentDataObj: any = null,
  evidences: SkillEvidence[] = [],
  interviews: InterviewSession[] = []
): EmployabilityReadiness {
  const safeProfile = profileData || getCurrentProfile() || DEFAULT_DEMO_PROFILE;
  const technicalSkills = safeProfile.technicalSkills || safeProfile.technical_skills || [];
  const softSkills = safeProfile.softSkills || safeProfile.soft_skills || [];
  const experience = safeProfile.experience || {};
  const projects = experience.projects || [];
  const internships = experience.internships || [];
  const certifications = experience.certifications || [];

  // 1. Technical Skills Score
  let techScore = 35;
  if (technicalSkills.length) {
    const avgProf = technicalSkills.reduce((sum: number, s: any) => sum + (s.level || 50), 0) / technicalSkills.length;
    const breadth = Math.min(25, technicalSkills.length * 3.5);
    techScore = Math.min(95, Math.round(avgProf * 0.7 + breadth));
  }

  // 2. Practical Projects Score
  let projectScore = 30;
  if (projects.length) {
    let pts = projects.length * 18;
    for (const p of projects) {
      if (p.link) pts += 8;
      if ((p.techStack || []).length >= 3) pts += 6;
      if ((p.description || '').length > 50) pts += 6;
    }
    projectScore = Math.min(95, Math.round(30 + pts));
  }
  if (internships.length) {
    projectScore = Math.min(98, projectScore + internships.length * 10);
  }

  // 3. Soft Skills & Communication
  let commScore = 45;
  if (softSkills.length >= 4) commScore = 80;
  else if (softSkills.length >= 2) commScore = 65;
  else if (softSkills.length >= 1) commScore = 55;

  // 4. Problem Solving
  let probScore = 50;
  if (assessmentDataObj && assessmentDataObj.isCompleted) {
    const catScores = assessmentDataObj.categoryScores || {};
    probScore = Math.min(95, Math.round(catScores['Problem Solving'] || catScores['Skills'] || 70));
  } else if (technicalSkills.some((s: any) => (s.name || '').toLowerCase().includes('algorithm') || (s.name || '').toLowerCase().includes('structure'))) {
    probScore = 75;
  }

  // 5. Certifications & Evidence
  let certScore = 25;
  if (certifications.length) {
    certScore = Math.min(90, 40 + certifications.length * 18);
  }
  if (evidences.length) {
    certScore = Math.min(95, certScore + evidences.length * 12);
  }

  // 6. Interview Readiness
  let interviewScore = 40;
  const completedInterviews = interviews.filter((i) => i.status === 'completed');
  if (completedInterviews.length) {
    const avgInt =
      completedInterviews.reduce((sum, i) => sum + (i.overallScore || i.finalSummary?.overallScore || 70), 0) /
      completedInterviews.length;
    interviewScore = Math.min(95, Math.round(avgInt));
  } else if (internships.length) {
    interviewScore = 62;
  }

  // Multi-factor weighted aggregate
  const overall = Math.round(
    techScore * 0.3 +
    projectScore * 0.25 +
    probScore * 0.15 +
    commScore * 0.1 +
    certScore * 0.1 +
    interviewScore * 0.1
  );

  const boundedOverall = Math.min(95, Math.max(30, overall));

  const strengths: string[] = [];
  if (techScore >= 75) strengths.push(`Demonstrated technical competencies across ${technicalSkills.length} declared skills`);
  if (projectScore >= 70) strengths.push(`Hands-on project execution with ${projects.length} portfolio projects`);
  if (interviewScore >= 70) strengths.push('Demonstrated clarity and communication in mock interview scenarios');
  if (certScore >= 70) strengths.push('Verifiable proof through external portfolio evidence and certifications');
  if (!strengths.length) strengths.push('Academic foundation and coursework completion', 'Structured career trajectory alignment');

  const bottlenecks: string[] = [];
  if (!evidences.length) bottlenecks.push('Add verifiable public GitHub repositories or live project demos to Proof of Skills');
  if (!completedInterviews.length) bottlenecks.push('Complete at least one technical mock interview session in the Interview Arena');
  if (projectScore < 65) bottlenecks.push('Build a production-grade capstone project with automated tests and CI/CD pipelines');
  if (!bottlenecks.length) bottlenecks.push('Profile query latency and document system architecture benchmarks');

  let nextPriority = 'Build and deploy a full-stack project demonstrating API error handling and database modeling.';
  if (!evidences.length) nextPriority = 'Submit your primary project GitHub repository into the Proof of Skills tracker.';
  else if (!completedInterviews.length) nextPriority = 'Start a 5-question Technical Mock Interview session in the Interview Arena.';

  const tier =
    boundedOverall >= 85
      ? 'Industry Ready'
      : boundedOverall >= 70
      ? 'Competitive Candidate'
      : boundedOverall >= 55
      ? 'Developing Competency'
      : 'Foundation Level';

  const targetRole = profileData.currentDirection || profileData.targetCareerId || 'Software Developer';

  return {
    overallScore: boundedOverall,
    careerTitle: targetRole,
    targetRole,
    tier,
    strengths,
    bottlenecks,
    factors: {
      technical: techScore,
      projects: projectScore,
      assessment: probScore,
      interview: interviewScore,
      problemSolving: probScore,
      softSkills: commScore,
    },
    metrics: {
      skillReadiness: techScore,
      projectReadiness: projectScore,
      experienceScore: projectScore,
      communicationScore: commScore,
      interviewReadiness: interviewScore,
      evidenceStrength: certScore,
    },
    nextPriority,
    evidenceCount: evidences.length,
    interviewsCount: interviews.length,
    roadmapProgress: 35,
  };
}

// 5. Personalized Roadmap Generator
export function generatePersonalizedRoadmap(career: Career, profileData: any): Roadmap {
  const roleTitle = career.title || 'Software Developer';
  const skills = career.coreTechnicalSkills || [];
  const primaryLang = skills.find((s) => s.category === 'Programming')?.name || 'TypeScript';
  const webSkill = skills.find((s) => s.category === 'Web Development')?.name || 'Modern Web APIs';
  const dbSkill = skills.find((s) => s.category === 'Databases')?.name || 'SQL & Relational Databases';
  const toolSkill = skills.find((s) => s.category === 'Cloud & DevOps')?.name || 'Docker & CI/CD';

  const phases = [
    {
      id: 'phase-1',
      phaseNumber: 1,
      title: 'Stage 1: Core Foundations & Algorithmic Thinking',
      description: `Solidify core programming principles, asynchronous workflows, and fundamental data structures in ${primaryLang}.`,
      estimatedEffort: '3-4 Weeks',
      skills: [primaryLang, 'Data Structures & Algorithms', 'Git Version Control'],
      learningTasks: [
        {
          id: 'p1-l1',
          title: `Deep-Dive ${primaryLang} Asynchronous Runtime`,
          description: 'Master the event loop, execution stack, concurrency models, and promises.',
          completed: true,
        },
        {
          id: 'p1-l2',
          title: 'Essential Data Structures for System Design',
          description: 'Implement Hash Tables, Binary Trees, and Graph Traversals (BFS/DFS) with time complexity analysis.',
          completed: true,
        },
        {
          id: 'p1-l3',
          title: 'Git Feature Branching & Semantic Commits',
          description: 'Practice rebase workflows, squash merges, conflict resolution, and pull request reviews.',
          completed: true,
        },
      ],
      practiceTasks: [
        {
          id: 'p1-p1',
          title: 'Solve 20 Algorithmic Coding Challenges',
          description: 'Complete problems focusing on two pointers, sliding window, and map lookups.',
          completed: true,
        },
        {
          id: 'p1-p2',
          title: 'Build an Interactive CLI Utility with Unit Tests',
          description: 'Develop a command-line tool with argument parsing, error handling, and 85%+ test coverage.',
          completed: false,
        },
      ],
      project: {
        title: `Algorithmic Profiler & Benchmark Engine in ${primaryLang}`,
        description: 'Construct a command-line benchmark suite measuring memory allocation and execution time across data structures.',
        deliverables: [
          'Modular code following single-responsibility principles',
          'Automated unit test suite with boundary test cases',
          'README with asymptotic complexity breakdown',
        ],
        completed: true,
      },
      isUnlocked: true,
    },
    {
      id: 'phase-2',
      phaseNumber: 2,
      title: 'Stage 2: Enterprise API & Architecture Development',
      description: `Design and implement reliable, transactional services connecting ${webSkill} with normalized ${dbSkill}.`,
      estimatedEffort: '4-5 Weeks',
      skills: [webSkill, dbSkill, 'RESTful Architecture', 'Unit & Integration Testing'],
      learningTasks: [
        {
          id: 'p2-l1',
          title: `RESTful & Middleware Architecture with ${webSkill}`,
          description: 'Design idempotent endpoints, request validation, structured error handlers, and JWT authentication.',
          completed: true,
        },
        {
          id: 'p2-l2',
          title: `Relational Schema Design & Query Optimization with ${dbSkill}`,
          description: 'Write normalized schemas, composite indexes, transactions, and foreign key cascades.',
          completed: false,
        },
        {
          id: 'p2-l3',
          title: 'Security Hardening & Input Sanitization',
          description: 'Mitigate OWASP Top 10 vulnerabilities including SQL injection, XSS, and CORS misconfigurations.',
          completed: false,
        },
      ],
      practiceTasks: [
        {
          id: 'p2-p1',
          title: 'Implement Database Migrations & Seeding Routines',
          description: 'Write deterministic database schema migrations with automated rollbacks.',
          completed: false,
        },
        {
          id: 'p2-p2',
          title: 'API Integration Testing with Automated Assertions',
          description: 'Automate test assertions verifying status codes, response headers, and validation failures.',
          completed: false,
        },
      ],
      project: {
        title: `Resilient ${roleTitle} Microservice & Persistence API`,
        description: 'Construct a multi-tenant backend service featuring rate limiting, database transactions, and OpenAPI/Swagger documentation.',
        deliverables: [
          'Clean layered architecture (Controller, Service, Repository)',
          'Normalized database schema with indexes',
          'Postman collection or Swagger API documentation',
        ],
        completed: false,
      },
      isUnlocked: true,
    },
    {
      id: 'phase-3',
      phaseNumber: 3,
      title: 'Stage 3: Production-Ready Capstone Application',
      description: `Synthesize skills into an end-to-end production platform that mirrors genuine engineering challenges in ${roleTitle}.`,
      estimatedEffort: '5-6 Weeks',
      skills: [toolSkill, 'Full-Stack System Design', 'CI/CD & Container Deployment'],
      learningTasks: [
        {
          id: 'p3-l1',
          title: `Containerization with ${toolSkill}`,
          description: 'Write multi-stage Docker builds, optimize image layers, and coordinate docker-compose services.',
          completed: false,
        },
        {
          id: 'p3-l2',
          title: 'Continuous Integration with GitHub Actions',
          description: 'Automate linting, unit tests, and image publishing on every pull request.',
          completed: false,
        },
        {
          id: 'p3-l3',
          title: 'Application Telemetry & Error Monitoring',
          description: 'Integrate structured JSON logging, health-check endpoints, and request timing middleware.',
          completed: false,
        },
      ],
      practiceTasks: [
        {
          id: 'p3-p1',
          title: 'Conduct End-to-End Stress & Boundary Testing',
          description: 'Test high-concurrency request scenarios and handle connection pool timeouts gracefully.',
          completed: false,
        },
        {
          id: 'p3-p2',
          title: 'Responsive Cross-Platform Verification',
          description: 'Ensure mobile and tablet rendering with zero cumulative layout shifts.',
          completed: false,
        },
      ],
      project: {
        title: `${roleTitle} Flagship Production Platform`,
        description: 'A live cloud-deployed platform solving a real industry workflow with authentication, databases, and CI/CD pipelines.',
        deliverables: [
          'Live cloud deployment URL',
          'Public GitHub repository with clean commit history',
          'Architecture diagram and test coverage report',
        ],
        completed: false,
      },
      isUnlocked: true,
    },
    {
      id: 'phase-4',
      phaseNumber: 4,
      title: 'Stage 4: Validate, Document & Prove Skills',
      description: 'Transform claimed competencies into verifiable proof through technical documentation, case studies, and code artifacts.',
      estimatedEffort: '2-3 Weeks',
      skills: ['Technical Writing', 'Architecture Documentation', 'Portfolio Engineering'],
      learningTasks: [
        {
          id: 'p4-l1',
          title: 'Write an Architectural Engineering Case Study',
          description: 'Document trade-offs, database indexing decisions, latency metrics, and failure recovery.',
          completed: false,
        },
        {
          id: 'p4-l2',
          title: 'Review Industry Standard Certifications & Benchmarks',
          description: 'Benchmark domain knowledge against official curriculum standards.',
          completed: false,
        },
      ],
      practiceTasks: [
        {
          id: 'p4-p1',
          title: 'Upload Verified Evidence to Proof of Skills Tracker',
          description: 'Submit public repository links and live deployed demos into the platform evidence tracker.',
          completed: false,
        },
        {
          id: 'p4-p2',
          title: 'Perform Peer Code Review & Open Source Pull Request',
          description: 'Review open source issues and propose a well-documented pull request.',
          completed: false,
        },
      ],
      project: {
        title: 'Developer Evidence Showcase & Portfolio',
        description: 'An accessible, high-performance web portfolio presenting your live applications, metrics, and evidence.',
        deliverables: [
          'High-contrast, mobile-responsive portfolio',
          'Curated GitHub profile with pinned capstone projects',
          'Lighthouse score > 90 across performance and accessibility',
        ],
        completed: false,
      },
      isUnlocked: false,
    },
    {
      id: 'phase-5',
      phaseNumber: 5,
      title: 'Stage 5: Technical & Behavioral Interview Mastery',
      description: `Master live whiteboard problem solving, system design discussions, and STAR behavioral interview scenarios for ${roleTitle}.`,
      estimatedEffort: '3-4 Weeks',
      skills: ['System Design', 'Behavioral (STAR Method)', 'Live Technical Communication'],
      learningTasks: [
        {
          id: 'p5-l1',
          title: 'High-Level System Design Patterns',
          description: 'Study load balancing, database sharding, caching strategies, and CAP theorem trade-offs.',
          completed: false,
        },
        {
          id: 'p5-l2',
          title: 'STAR Behavioral Story Preparation',
          description: 'Structure 5 concrete stories: technical obstacles, team disagreements, ownership, and adaptability.',
          completed: false,
        },
      ],
      practiceTasks: [
        {
          id: 'p5-p1',
          title: 'Complete 3 Mock Sessions in the Interview Arena',
          description: 'Simulate Technical and Behavioral interview rounds with instant feedback.',
          completed: false,
        },
        {
          id: 'p5-p2',
          title: 'Live Whiteboard Simulation',
          description: 'Verbalize complexity trade-offs while writing algorithm implementations on a blank canvas.',
          completed: false,
        },
      ],
      project: {
        title: 'Complete Job-Ready Candidate Package',
        description: `ATS-optimized resume tailored to ${roleTitle} keywords, verified interview practice, and active application pipeline.`,
        deliverables: [
          'Single-page high-impact technical resume with quantified metrics',
          'Interview score benchmark > 80% in the Interview Arena',
          'Active pipeline of tailored applications',
        ],
        completed: false,
      },
      isUnlocked: false,
    },
  ];

  // Calculate overall progress
  let totalTasks = 0;
  let completedTasks = 0;
  for (const ph of phases) {
    for (const t of ph.learningTasks) {
      totalTasks++;
      if (t.completed) completedTasks++;
    }
    for (const t of ph.practiceTasks) {
      totalTasks++;
      if (t.completed) completedTasks++;
    }
    totalTasks++;
    if (ph.project.completed) completedTasks++;
  }

  const overallProgress = Math.round((completedTasks / Math.max(1, totalTasks)) * 100);

  return {
    id: 'rdmp_' + (career.id || 'default'),
    userId: profileData.userId || 'usr_demo_alex_chen',
    targetCareerId: career.id,
    targetCareerTitle: roleTitle,
    careerTitle: roleTitle,
    totalEstimatedDuration: '18-24 Weeks',
    phases,
    overallProgress,
    generatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// 6. Resume Analyzer Algorithm (ATS Score + Detected Skills + Action Verb Rewrites)
export const TECH_SKILLS_DICT: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  'c++': 'C++',
  'c#': 'C#',
  golang: 'Go',
  rust: 'Rust',
  html: 'HTML5',
  html5: 'HTML5',
  css: 'CSS3',
  css3: 'CSS3',
  tailwind: 'Tailwind CSS',
  react: 'React',
  'react.js': 'React',
  vue: 'Vue.js',
  angular: 'Angular',
  'next.js': 'Next.js',
  node: 'Node.js',
  'node.js': 'Node.js',
  express: 'Express',
  spring: 'Spring Boot',
  'spring boot': 'Spring Boot',
  django: 'Django',
  fastapi: 'FastAPI',
  flask: 'Flask',
  sql: 'SQL',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  gcp: 'Google Cloud Platform',
  azure: 'Microsoft Azure',
  terraform: 'Terraform',
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  'ci/cd': 'CI/CD',
  'github actions': 'GitHub Actions',
  jest: 'Jest',
  pytest: 'Pytest',
  playwright: 'Playwright',
  cypress: 'Cypress',
  pandas: 'Pandas',
  numpy: 'NumPy',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  'scikit-learn': 'Scikit-Learn',
  'rest api': 'RESTful APIs',
  graphql: 'GraphQL',
  microservices: 'Microservices',
  linux: 'Linux',
  bash: 'Bash',
  tableau: 'Tableau',
  'power bi': 'Power BI',
};

const SOFT_SKILLS_LIST = [
  'problem solving',
  'communication',
  'leadership',
  'collaboration',
  'teamwork',
  'critical thinking',
  'adaptability',
  'agile',
  'scrum',
  'time management',
  'mentoring',
  'ownership',
  'analytical',
];

export function analyzeResumeText(text: string, targetCareer: Career, fileName = 'Pasted_Resume') {
  const cleanText = text.replace(/\r\n/g, '\n');
  const lower = cleanText.toLowerCase();
  const targetTitle = targetCareer.title || 'Software Developer';
  const coreSkills = targetCareer.coreTechnicalSkills || [];

  // 1. Detected Technical Skills
  const detectedSkillsSet = new Set<string>();
  for (const [key, normalized] of Object.entries(TECH_SKILLS_DICT)) {
    const regex = new RegExp(`\\b${key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) {
      detectedSkillsSet.add(normalized);
    }
  }
  const detectedSkills = Array.from(detectedSkillsSet).sort();

  // 2. Soft Skills
  const softSkillsDetected = SOFT_SKILLS_LIST.filter((s) => {
    const regex = new RegExp(`\\b${s}\\b`, 'i');
    return regex.test(lower);
  }).map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  // 3. Missing Skills
  const missingSkills: string[] = [];
  for (const req of coreSkills) {
    const reqName = req.name;
    const isPresent = detectedSkills.some((d) => isSkillMatch(d, reqName));
    if (!isPresent && missingSkills.length < 5) {
      missingSkills.push(reqName);
    }
  }

  // 4. Section completeness check
  const sections = {
    contactInfo: /email|phone|linkedin|github|portfolio/i.test(lower),
    education: /education|degree|university|college|bachelor|master|b\.tech/i.test(lower),
    skills: /skills|technologies|technical proficiencies|tools/i.test(lower),
    projects: /projects|portfolio|personal projects|capstone/i.test(lower),
    experience: /experience|work history|employment|internship/i.test(lower),
  };

  const completenessCount = Object.values(sections).filter(Boolean).length;
  const completenessScore = Math.min(100, completenessCount * 20);

  // 5. Keyword match score
  const matchedCoreCount = coreSkills.filter((s) => detectedSkills.some((d) => isSkillMatch(d, s.name))).length;
  const keywordMatchScore = Math.min(100, Math.round((matchedCoreCount / Math.max(1, coreSkills.length)) * 100));

  // 6. Impact score
  const hasMetrics = /\d+[%kK+]|\d+\s*(users|clients|records|rps|seconds|ms|queries|tests)/i.test(lower);
  const actionVerbCount = ['architected', 'engineered', 'developed', 'built', 'implemented', 'optimized', 'reduced', 'increased', 'designed', 'automated']
    .filter((v) => lower.includes(v)).length;
  const impactScore = Math.min(100, 40 + (hasMetrics ? 30 : 10) + actionVerbCount * 6);

  // 7. Overall ATS score
  const overallScore = Math.min(95, Math.max(30, Math.round(keywordMatchScore * 0.45 + completenessScore * 0.3 + impactScore * 0.25)));

  // 8. Suggestions
  const suggestions: string[] = [];
  if (missingSkills.length) {
    suggestions.push(`Integrate missing high-priority target role keywords: ${missingSkills.slice(0, 4).join(', ')}.`);
  }
  if (impactScore < 75) {
    suggestions.push("Quantify your achievements using metrics (e.g. 'improved query speed by 35%', 'handled 5,000+ records', 'achieved 92% test coverage').");
  }
  if (!sections.projects) {
    suggestions.push('Include a dedicated Projects section showcasing full-stack application code and deployed demo links.');
  }
  suggestions.push(`Align your professional summary directly with the ${targetTitle} benchmark requirements.`);

  // 9. Bullet point rewrites
  const bulletLines = cleanText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[-*•]\s+\S/.test(l))
    .map((l) => l.replace(/^[-*•]\s*/, ''));

  const bulletPointRewrites: any[] = [];
  const weakOpenings: [RegExp, string][] = [
    [/^worked on\s+/i, 'Contributed to '],
    [/^responsible for\s+/i, 'Handled '],
    [/^helped with\s+/i, 'Supported '],
    [/^helped\s+/i, 'Supported '],
    [/^was responsible for\s+/i, 'Handled '],
  ];

  for (const original of bulletLines) {
    let improved = original;
    for (const [pattern, replacement] of weakOpenings) {
      if (pattern.test(original)) {
        improved = original.replace(pattern, replacement);
        break;
      }
    }
    if (improved !== original) {
      bulletPointRewrites.push({
        original,
        improved,
        rationale: 'Uses a clearer action-verb opening while preserving your original facts.',
      });
    }
    if (bulletPointRewrites.length >= 3) break;
  }

  const sectionsList = [
    { name: 'Contact Information', found: sections.contactInfo, status: sections.contactInfo ? 'complete' : 'missing' },
    { name: 'Education & Academics', found: sections.education, status: sections.education ? 'complete' : 'missing' },
    { name: 'Technical Skills & Tools', found: sections.skills, status: sections.skills ? 'complete' : 'missing' },
    { name: 'Practical Projects & Portfolio', found: sections.projects, status: sections.projects ? 'complete' : 'missing' },
    { name: 'Experience & Internships', found: sections.experience, status: sections.experience ? 'complete' : 'missing' },
  ];

  return {
    targetRole: targetTitle,
    fileName,
    overallScore,
    completenessScore,
    keywordMatchScore,
    impactScore,
    detectedSkills,
    missingSkills,
    softSkillsDetected,
    sections: sectionsList,
    sectionFlags: sections,
    suggestions,
    bulletPointRewrites,
    analyzedAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------
// AI Advisor Chat Response Generator
// ----------------------------------------------------
export function generateAdvisorReply(userMessage: string, context: any): string {
  const q = (userMessage || '').toLowerCase();
  const targetRole = context.targetRole || 'Software Developer';
  const readiness = context.readinessScore || 78;
  const missing = (context.missingSkills || []).slice(0, 3).join(', ') || 'Docker Containerization, Unit Testing';
  const userSkills = (context.userSkills || []).slice(0, 4).join(', ') || 'JavaScript, React, Node.js';

  if (['dsa', 'algorithm', 'data structure', 'leetcode', 'array', 'tree', 'graph', 'dynamic programming'].some((k) => q.includes(k))) {
    return (
      `### Algorithmic Problem Solving for ${targetRole}\n\n` +
      `For **${targetRole}** interviews, hiring teams prioritize pattern mastery over brute-force solutions:\n\n` +
      `1. **Core Problem Patterns**: Focus on **Two Pointers**, **Sliding Window**, **Breadth-First Search (BFS)**, and **Hash Table Aggregations**.\n` +
      `2. **Thinking Out Loud**: Always state your Time & Space complexity ($O(N)$ vs $O(N^2)$) before writing code.\n` +
      `3. **Arena Simulation**: Open our **Interview Arena** (/interview) to practice timed algorithmic problems with our in-browser code workspace.`
    );
  }

  if (['system design', 'architecture', 'scalab', 'microservice', 'distributed', 'redis', 'caching'].some((k) => q.includes(k))) {
    return (
      `### System Architecture Guidance for ${targetRole}\n\n` +
      `To demonstrate senior-level engineering comprehension for ${targetRole}:\n\n` +
      `- **Data Layer Caching**: Utilize Redis as an LRU cache or write-through cache for frequent read queries, setting sensible TTLs to avoid stale cache drift.\n` +
      `- **Spike Dampening**: Place an asynchronous message queue (e.g. RabbitMQ/Kafka) in front of slow database ingestion routines.\n` +
      `- **Idempotency**: Implement client UUID tokens (\`Idempotency-Key\`) to protect transactional POST requests from duplicate executions.`
    );
  }

  if (['skill', 'gap', 'learn', 'study', 'course'].some((k) => q.includes(k))) {
    return (
      `### Targeted Competency Plan for ${targetRole}\n\n` +
      `Analyzing your profile against industry benchmarks reveals that your existing competencies (${userSkills}) form a strong base, but your priority growth gaps are in: **${missing}**.\n\n` +
      `**Actionable 3-Step Strategy:**\n` +
      `1. Explore verified courses in the **Learning Hub** (/learning) targeting ${missing}.\n` +
      `2. Progress through Stage 2 of your **Personalized Roadmap** (/roadmap) to check off practical milestones.\n` +
      `3. Build a project demonstrating transactional database queries and automated test assertions.`
    );
  }

  if (['resume', 'cv', 'ats', 'bullet'].some((k) => q.includes(k))) {
    return (
      `### Resume & ATS Optimization for ${targetRole}\n\n` +
      `To optimize your resume for **${targetRole}**:\n\n` +
      `1. **Quantified Outcomes**: Begin bullet points with strong action verbs (*Architected, Implemented, Streamlined*) and quantify results (e.g. *improved API latency by 28%*, *handled 5k requests/day*).\n` +
      `2. **Target Role Keywords**: Ensure core competencies for ${targetRole} (${missing}) appear naturally in your technical skills and project descriptions.\n` +
      `3. **Automated Parser**: Use the **Resume Analysis** tool (/resume) to receive an automated ATS score and line-by-line bullet rewrites.`
    );
  }

  if (['interview', 'mock', 'arena', 'question'].some((k) => q.includes(k))) {
    return (
      `### Technical & Behavioral Interview Strategy for ${targetRole}\n\n` +
      `For your upcoming **${targetRole}** interviews:\n\n` +
      `1. **Algorithmic Preparation**: Practice medium-level problems focusing on hash maps, two pointers, and binary trees.\n` +
      `2. **Behavioral STAR Stories**: Prepare 3 stories using Situation, Task, Action, Result highlighting technical decision-making and collaboration.\n` +
      `3. **Interactive Simulation**: Run a session in the **Interview Arena** (/interview) with the interactive code editor and real-time coaching feedback.`
    );
  }

  if (['project', 'portfolio', 'github', 'demo'].some((k) => q.includes(k))) {
    return (
      `### High-Impact Portfolio Architecture\n\n` +
      `For a stand-out **${targetRole}** portfolio:\n\n` +
      `1. Build an end-to-end full-stack or microservice application solving a practical domain problem.\n` +
      `2. Include automated unit test suites (Jest/Pytest) and a CI/CD GitHub Action workflow.\n` +
      `3. Submit your repository link to the **Proof of Skills** tracker (/evidence) to verify your abilities and raise your internal readiness score.`
    );
  }

  if (['switch', 'career', 'transition', 'salary', 'junior', 'senior'].some((k) => q.includes(k))) {
    return (
      `### Career Pathway & Industry Growth for ${targetRole}\n\n` +
      `The industry trajectory for **${targetRole}** focuses on progressive autonomy and architectural responsibility:\n\n` +
      `- **Entry-Level / Associate**: $75k - $95k, mastering foundational clean code, teamwork, and unit testing.\n` +
      `- **Mid-Level (2-4 yrs)**: $105k - $135k, designing distributed components, optimizing throughput, and owning feature releases.\n` +
      `- **Senior / Lead**: $145k - $190k+, driving system reliability, technical mentorship, and high-level architectural standards.\n\n` +
      `Check out the **Career Explorer** (/explorer) to explore detailed competency maps for 15+ tech specializations.`
    );
  }

  return (
    `### Career Advisor Insights on: "${userMessage.trim()}"\n\n` +
    `Regarding your inquiry for the **${targetRole}** track (Current readiness: **${readiness}%**):\n\n` +
    `1. **Technical Foundation**: Build upon your proven strengths in ${userSkills} while prioritizing missing competencies in **${missing}**.\n` +
    `2. **Verified Artifacts**: Translate theoretical understanding into demonstrable proof—every verified repository logged in **Proof of Skills** (/evidence) accelerates your career trajectory.\n` +
    `3. **Active Readiness**: Practice in the **Interview Arena** (/interview) to benchmark your real-time problem solving under simulated pressure.\n\n` +
    `Let me know if you would like code examples, system design diagrams, or tailored interview scenario walkthroughs!`
  );
}
