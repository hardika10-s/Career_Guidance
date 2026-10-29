from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Authentication Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=6)
    confirmPassword: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    isOnboarded: bool
    targetCareerId: Optional[str] = None

class TokenResponse(BaseModel):
    token: str
    user: UserOut

# Profile Models
class EducationInfo(BaseModel):
    degree: str
    department: str
    institution: str = ""
    graduationYear: str = ""
    academicPerformance: str = ""

class SkillItem(BaseModel):
    name: str
    category: str = "Programming"
    level: int = 50

class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str = ""
    techStack: List[str] = []
    link: Optional[str] = None
    role: Optional[str] = None

class InternshipItem(BaseModel):
    id: Optional[str] = None
    company: str
    role: str
    duration: str = ""
    description: str = ""

class CertificationItem(BaseModel):
    id: Optional[str] = None
    name: str
    issuer: str
    year: str = ""
    url: Optional[str] = None

class ExperienceInfo(BaseModel):
    projects: List[ProjectItem] = []
    internships: List[InternshipItem] = []
    certifications: List[CertificationItem] = []
    hackathons: List[str] = []
    achievements: List[str] = []

class CareerGoals(BaseModel):
    preferredAreas: List[str] = []
    desiredRole: str = "Software Developer"
    shortTermGoal: str = ""
    longTermGoal: str = ""

class WorkPreferences(BaseModel):
    workStyle: str = "Flexible"
    focus: str = "Balanced"
    domain: str = "Product Development"
    orgType: str = "High-Growth Startup"
    location: str = "Hybrid"

class OnboardingRequest(BaseModel):
    education: EducationInfo
    technicalSkills: List[SkillItem] = []
    softSkills: List[str] = []
    interests: List[str] = []
    experience: Optional[ExperienceInfo] = None
    careerGoals: Optional[CareerGoals] = None
    workPreferences: Optional[WorkPreferences] = None

class ProfileUpdateRequest(BaseModel):
    education: Optional[EducationInfo] = None
    technicalSkills: Optional[List[SkillItem]] = None
    softSkills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    experience: Optional[ExperienceInfo] = None
    careerGoals: Optional[CareerGoals] = None
    workPreferences: Optional[WorkPreferences] = None

class TargetCareerRequest(BaseModel):
    careerId: str

# Assessment Schemas
class AnswerItem(BaseModel):
    questionId: str
    selectedOption: Any
    category: Optional[str] = None
    dimension: Optional[str] = None
    questionText: Optional[str] = None
    score: Optional[int] = None

class AssessmentSubmitRequest(BaseModel):
    answers: List[AnswerItem]

class AssessmentSaveProgressRequest(BaseModel):
    currentQuestionIndex: int = 0
    answers: List[AnswerItem] = []
    categoryScores: Dict[str, int] = {}

class ChallengeValidateRequest(BaseModel):
    challengeId: str
    selectedOptionText: str

# Resume Schemas
class ResumeAnalyzeRequest(BaseModel):
    resumeText: str
    targetRole: Optional[str] = None
    fileName: Optional[str] = "Uploaded_Resume"

# Chatbot Schemas
class ChatRequest(BaseModel):
    message: str

# Roadmap Task Toggle Schema
class RoadmapToggleRequest(BaseModel):
    phaseId: str
    taskId: str
    taskType: str  # "learning" | "practice" | "project"

# Evidence Schema
class EvidenceCreateRequest(BaseModel):
    skillName: str
    evidenceType: str
    title: str
    url: Optional[str] = None
    description: str = ""
    verifiedStatus: Optional[str] = "Evidence Added"
    strength: Optional[str] = "Moderate"

# Standard API Envelope
class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: Optional[str] = None
    timestamp: Optional[str] = None
