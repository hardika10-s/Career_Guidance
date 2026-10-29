export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isOnboarded: boolean;
  targetCareerId?: string;
  createdAt?: string;
}

export interface EducationInfo {
  degree: string;
  department: string;
  institution: string;
  graduationYear: string;
  academicPerformance: string;
}

export interface SkillItem {
  name: string;
  category: "Programming" | "Web Development" | "Databases" | "Cloud & DevOps" | "AI & Data" | "Tools & Others";
  level: number; // 0 to 100
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  role?: string;
}

export interface InternshipItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface CareerGoals {
  preferredAreas: string[];
  desiredRole: string;
  shortTermGoal: string;
  longTermGoal: string;
}

export interface WorkPreferences {
  workStyle: "Individual Contributor" | "Team-Centric" | "Flexible";
  focus: "Technical Depth" | "Creative & UI" | "Balanced";
  domain: "Product Development" | "Research & Innovation" | "Enterprise Systems";
  orgType: "High-Growth Startup" | "Established Enterprise" | "Consulting & Agency";
  location: "Remote" | "Hybrid" | "On-site";
}

export interface ReadinessBreakdown {
  technicalSkills: number;
  projects: number;
  communication: number;
  problemSolving: number;
  certifications: number;
  interviewReadiness: number;
}

export interface CareerProfile {
  id: string;
  userId: string;
  education: EducationInfo;
  technicalSkills: SkillItem[];
  softSkills: string[];
  interests: string[];
  experience: {
    projects: ProjectItem[];
    internships: InternshipItem[];
    certifications: CertificationItem[];
    hackathons: string[];
    achievements: string[];
  };
  careerGoals: CareerGoals;
  workPreferences: WorkPreferences;
  readinessScore: number;
  readinessBreakdown: ReadinessBreakdown;
  currentDirection: string;
  matchPercentage: number;
  directionExplanation: string;
  biggestOpportunity: string;
  nextBestAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentQuestionOption {
  text: string;
  score: number;
  isCorrect?: boolean;
  explanation?: string;
  weight?: Record<string, number>;
}

export interface AssessmentQuestion {
  id: string;
  category?: string;
  dimension?: string;
  type?: "multiple_choice" | "scenario" | "code_reading" | "self_assessment" | "career_preference" | string;
  difficulty?: "foundational" | "intermediate" | "advanced" | string;
  language?: string;
  codeSnippet?: string;
  questionText: string;
  options: AssessmentQuestionOption[];
}

export interface AssessmentAnswer {
  questionId: string;
  category?: string;
  dimension?: string;
  questionText?: string;
  selectedOption: string | string[] | number;
  score?: number;
}

export interface DimensionScoreItem {
  id: string;
  title: string;
  category: string;
  score: number;
  evidenceCount: number;
  evaluated: boolean;
  isObjective: boolean;
}

export interface CareerMatchItem {
  careerId: string;
  title: string;
  compatibilityScore: number;
  matchRationale: string;
  contributingStrengths: string[];
  identifiedGaps: string[];
}

export interface SkillValidationChallengeOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface SkillValidationChallenge {
  id: string;
  dimension: string;
  title: string;
  scenario: string;
  language: string;
  codeSnippet: string;
  taskDescription: string;
  options: SkillValidationChallengeOption[];
}

export interface ImprovementPlanItem {
  priority: number;
  skill: string;
  recommendation: string;
  practicalTask: string;
  targetMilestone: string;
  actionRoute: string;
}

export interface AssessmentAnalysis {
  overallScore?: number;
  demonstratedTechnicalScore?: number;
  collaborationScore?: number;
  projectMaturityScore?: number;
  tier?: string;
  evidenceCoveragePercent?: number;
  evaluatedSignalsCount?: number;
  dimensionScores?: Record<string, DimensionScoreItem>;
  strongestSkills?: string[];
  weakestSkills?: string[];
  topCareerMatches?: CareerMatchItem[];
  skillValidationChallenge?: SkillValidationChallenge;
  improvementPlan?: ImprovementPlanItem[];
  dominantArchetype?: string;
  summary?: string;
  keyStrengths?: string[];
  growthAreas?: string[];
  recommendedCareerFocus?: string[];
  disclaimer?: string;
  validatedChallengeResult?: {
    challengeId: string;
    selectedOptionText: string;
    isCorrect: boolean;
    explanation: string;
    validatedAt: string;
  };
}

export interface Assessment {
  id: string;
  userId: string;
  currentQuestionIndex: number;
  isCompleted: boolean;
  answers: AssessmentAnswer[];
  categoryScores: Record<string, number>;
  aiAnalysis?: AssessmentAnalysis;
  startedAt: string;
  completedAt?: string;
}

export interface CareerSkillRequirement {
  name: string;
  importance: "Essential" | "High" | "Medium";
  defaultLevel: number;
  category: string;
}

export interface CareerSuggestedProject {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skillsUsed: string[];
}

export interface CareerProgressionStep {
  level: string;
  title: string;
  timeframe: string;
  salaryRange: string;
}

export interface Career {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  whatTheyDo: string[];
  coreTechnicalSkills: CareerSkillRequirement[];
  softSkills: string[];
  commonTools: string[];
  entryLevelExpectations: string[];
  suggestedProjects: CareerSuggestedProject[];
  careerProgression: CareerProgressionStep[];
  relatedCareers: string[];
}

export interface CareerRecommendation {
  careerId: string;
  title: string;
  matchPercentage: number;
  matchExplanation: string;
  strongFactors: string[];
  missingFactors: string[];
  recommendedPriority: number;
}

export interface SkillGapItem {
  name: string;
  category: string;
  status: "have" | "developing" | "need" | "optional";
  currentLevel: number;
  targetLevel: number;
  gap: number;
  importance: "Essential" | "High" | "Medium";
  whyItMatters: string;
  recommendedAction: string;
}

export interface SkillGapAnalysis {
  targetRole?: string;
  careerTitle?: string;
  summary: string;
  matchPercentage?: number;
  overallReadiness?: number;
  overallGapScore?: number;
  skills: SkillGapItem[];
  categorized?: {
    demonstrated: SkillGapItem[];
    developing: SkillGapItem[];
    missingEssential: SkillGapItem[];
    optionalOpportunities: SkillGapItem[];
  };
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  estimatedEffort: string;
  skills: string[];
  learningTasks: RoadmapTask[];
  practiceTasks: RoadmapTask[];
  project: {
    title: string;
    description: string;
    deliverables: string[];
    completed: boolean;
  };
  isUnlocked: boolean;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetCareerId: string;
  targetCareerTitle: string;
  careerTitle?: string;
  totalEstimatedDuration?: string;
  phases: RoadmapPhase[];
  overallProgress: number;
  generatedAt: string;
  updatedAt: string;
}

export type CareerRoadmap = Roadmap;

export interface SkillEvidence {
  id: string;
  userId?: string;
  skillName: string;
  evidenceType: "github" | "portfolio" | "certification" | "internship" | "hackathon" | "assessment" | "achievement";
  title: string;
  url?: string;
  description: string;
  verifiedStatus?: "Demonstrated Through Project" | "Evidence Added" | "Verified Assessment";
  strength: "Strong" | "Moderate" | "Emerging";
  createdAt?: string;
}

export interface InterviewFeedback {
  score: number;
  relevance: number;
  technicalAccuracy: number;
  clarity: number;
  strengths: string[];
  improvements: string[];
  suggestedIdealResponse?: string;
}

export interface ConversationTurn {
  id: string;
  role: "interviewer" | "candidate" | "coach";
  text: string;
  type?: "greeting" | "question" | "answer" | "follow_up" | "hint" | "conclusion" | string;
  codeSnippet?: string;
  language?: string;
  isFollowUp?: boolean;
  questionId?: string;
  questionText?: string;
  topic?: string;
  starterCode?: string;
  codeContext?: string;
  submissionId?: string;
  timestamp: string;
}

export interface InterviewEvaluationDimensions {
  technicalAccuracy: number;
  problemSolving: number;
  communication: number;
  depthOfUnderstanding: number;
  practicalApplication: number;
}

export interface PerQuestionFeedback {
  questionNumber: number;
  questionText: string;
  candidateAnswer: string;
  score: number;
  whatWentWell: string;
  whatWasMissing: string;
  suggestedImprovement: string;
  idealAnswer: string;
}

export interface InterviewRecommendation {
  title: string;
  exercise: string;
}

export interface InterviewReport {
  overallScore: number | null;
  tier: string;
  status: string;
  questionsAnswered: number;
  summaryText: string;
  dimensions: InterviewEvaluationDimensions | null;
  perQuestionFeedback: PerQuestionFeedback[];
  recommendations: InterviewRecommendation[];
  sessionConfig?: any;
  conversation?: ConversationTurn[];
}

export interface InterviewQuestionItem {
  id: string;
  questionText: string;
  category?: string;
  topic?: string;
  difficulty?: string;
  type?: string;
  evaluationFormat?: string;
  starterLanguage?: string;
  isFollowUp?: boolean;
  userAnswer?: string;
  feedback?: InterviewFeedback;
  starterCode?: string;
  codeContext?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  careerTitle: string;
  type?: "technical" | "behavioral" | "mixed" | string;
  interviewType?: string;
  format?: string;
  difficulty: string;
  mode?: "realistic" | "coaching";
  durationMinutes?: number;
  targetQuestionCount?: number;
  mainQuestionCount?: number;
  questions: InterviewQuestionItem[];
  answers?: any[];
  conversation?: ConversationTurn[];
  overallScore?: number | null;
  status: "created" | "in_progress" | "completed" | "ended_early" | "incomplete" | "failed";
  finalSummary?: InterviewReport | any;
  sessionConfig?: any;
  createdAt: string;
  completedAt?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: string;
  contextOrScenario?: string;
}

export interface InterviewAnswer {
  questionId: string;
  answerText: string;
  evaluation?: {
    relevanceScore: number;
    technicalCorrectnessScore: number;
    clarityScore: number;
    structureScore: number;
    confidenceIndicator: "High" | "Moderate" | "Developing";
    constructiveFeedback: string;
    keyImprovement: string;
  };
}

export interface Interview {
  id: string;
  userId: string;
  careerTitle: string;
  difficulty: "Entry-Level" | "Mid-Level" | "Advanced" | string;
  interviewType: "Technical" | "HR" | "Behavioral" | "Scenario" | string;
  status: "in_progress" | "completed";
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  finalSummary?: {
    overallScore: number;
    summaryText: string;
    strengths: string[];
    areasToImprove: string[];
    recommendedPractice: string[];
  };
  createdAt: string;
  completedAt?: string;
}

export interface CareerInsight {
  id: string;
  userId: string;
  title: string;
  observation: string;
  suggestedAction: string;
  actionRoute: string;
  category: "readiness" | "skill_gap" | "interview" | "portfolio" | "momentum";
  isRead: boolean;
  createdAt: string;
}

export interface ProgressTimelineItem {
  id: string;
  userId: string;
  type?: "assessment" | "skill" | "project" | "evidence" | "interview" | "roadmap" | string;
  category?: string;
  title: string;
  description: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface EmployabilityReadiness {
  overallEstimate?: number;
  overallScore: number;
  careerTitle: string;
  targetRole?: string;
  directionMatch?: number;
  tier: string;
  strengths: string[];
  bottlenecks: string[];
  areasForImprovement?: string[];
  scoreExplanation?: string;
  nextBestAction?: string;
  biggestOpportunity?: string;
  confidenceIndicator?: string;
  readinessBreakdown?: {
    technicalSkills: number;
    projects: number;
    communication: number;
    problemSolving: number;
    certifications: number;
    interviewReadiness: number;
  };
  factors: {
    technical: number;
    projects: number;
    assessment: number;
    interview: number;
    problemSolving: number;
    softSkills: number;
  };
  metrics?: {
    skillReadiness: number;
    projectReadiness: number;
    experienceScore: number;
    communicationScore: number;
    interviewReadiness: number;
    evidenceStrength: number;
  };
  nextPriority?: string;
  evidenceCount?: number;
  interviewsCount?: number;
  roadmapProgress?: number;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
