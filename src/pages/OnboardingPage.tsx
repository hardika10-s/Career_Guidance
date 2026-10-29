import React, { useState } from "react";
import { OnboardingSteps } from "./onboarding/OnboardingSteps.js";
import { DEFAULT_PRESET_SKILLS } from "./onboarding/onboardingData.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { api } from "../services/api.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { SkillItem, ProjectItem, InternshipItem, CertificationItem } from "../types/index.js";

export const OnboardingPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Education
  const [education, setEducation] = useState({
    degree: "Bachelor of Technology / B.S.",
    department: "Computer Science & Engineering",
    institution: "State University Institute of Technology",
    graduationYear: "2026",
    academicPerformance: "82% / 3.6 CGPA",
  });

  // Step 2: Skills
  const [technicalSkills, setTechnicalSkills] = useState<SkillItem[]>(DEFAULT_PRESET_SKILLS);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<SkillItem["category"]>("Programming");
  const [softSkills, setSoftSkills] = useState<string[]>(["Problem Solving", "Technical Communication", "Team Collaboration"]);

  // Step 3: Interests
  const [interests, setInterests] = useState<string[]>([
    "Full-Stack Web Development",
    "Cloud & Distributed Systems",
  ]);
  const [customInterest, setCustomInterest] = useState("");

  // Step 4: Experience
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "p1",
      title: "Campus Resource Management System",
      description: "Full-stack web application with role-based access, inventory tracking, and REST APIs.",
      techStack: ["React", "Node.js", "Express", "PostgreSQL"],
    },
  ]);
  const [newProject, setNewProject] = useState({ title: "", description: "", techStack: "" });

  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    { id: "c1", name: "Modern React & Redux Fundamentals", issuer: "Coursera / Meta", year: "2024" },
  ]);

  // Step 5: Career Goals
  const [careerGoals, setCareerGoals] = useState({
    preferredAreas: ["Software Engineering", "Full-Stack Development"],
    desiredRole: "Software Developer",
    shortTermGoal: "Secure an entry-level software engineer role or high-impact developer internship.",
    longTermGoal: "Advance to Senior Full-Stack Architect building scalable distributed cloud systems.",
  });

  // Step 6: Work Preferences
  const [workPreferences, setWorkPreferences] = useState({
    workStyle: "Flexible" as const,
    focus: "Balanced" as const,
    domain: "Product Development" as const,
    orgType: "High-Growth Startup" as const,
    location: "Hybrid" as const,
  });

  // Helper Methods
  const addTechnicalSkill = () => {
    if (!newSkillName.trim()) return;
    if (technicalSkills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;
    setTechnicalSkills([...technicalSkills, { name: newSkillName.trim(), category: newSkillCategory, level: 65 }]);
    setNewSkillName("");
  };

  const removeTechnicalSkill = (name: string) => {
    setTechnicalSkills(technicalSkills.filter((s) => s.name !== name));
  };

  const updateSkillLevel = (name: string, level: number) => {
    setTechnicalSkills(technicalSkills.map((s) => (s.name === name ? { ...s, level } : s)));
  };

  const toggleSoftSkill = (s: string) => {
    if (softSkills.includes(s)) {
      setSoftSkills(softSkills.filter((item) => item !== s));
    } else {
      setSoftSkills([...softSkills, s]);
    }
  };

  const toggleInterest = (i: string) => {
    if (interests.includes(i)) {
      setInterests(interests.filter((item) => item !== i));
    } else {
      setInterests([...interests, i]);
    }
  };

  const addCustomInterest = () => {
    if (!customInterest.trim()) return;
    if (!interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
    }
    setCustomInterest("");
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    setProjects([
      ...projects,
      {
        id: "proj_" + Date.now(),
        title: newProject.title.trim(),
        description: newProject.description.trim() || "Independent student project",
        techStack: newProject.techStack ? newProject.techStack.split(",").map((s) => s.trim()) : ["JavaScript"],
      },
    ]);
    setNewProject({ title: "", description: "", techStack: "" });
  };

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        education,
        technicalSkills,
        softSkills,
        interests,
        experience: {
          projects,
          internships,
          certifications,
          hackathons: [],
          achievements: [],
        },
        careerGoals,
        workPreferences,
      };

      await api.profile.submitOnboarding(payload);
      await refreshUser();
      toast.success("Profile synthesized! Career roadmap and readiness breakdown generated.");
      onNavigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit career profile.");
      setIsSubmitting(false);
    }
  };

  return (
    <div id="onboarding-wizard" className="max-w-3xl mx-auto py-4 sm:py-10 px-0 sm:px-4">
      {/* Step Indicator Header */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Step {step} of 6</span>
          <span>{Math.round((step / 6) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {isSubmitting ? (
        <Card variant="default" className="p-5 sm:p-8 text-center space-y-5 sm:space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Synthesizing Career Intelligence Profile...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Evaluating your skills against 8+ industry career tracks, identifying core technical gaps, and structuring your personalized 5-phase career roadmap.
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </Card>
      ) : (
        <Card variant="default" className="p-4 sm:p-8 space-y-5 sm:space-y-6">
          <OnboardingSteps
            step={step}
            education={education}
            setEducation={setEducation}
            technicalSkills={technicalSkills}
            setTechnicalSkills={setTechnicalSkills}
            newSkillName={newSkillName}
            setNewSkillName={setNewSkillName}
            newSkillCategory={newSkillCategory}
            setNewSkillCategory={setNewSkillCategory}
            softSkills={softSkills}
            toggleSoftSkill={toggleSoftSkill}
            addTechnicalSkill={addTechnicalSkill}
            removeTechnicalSkill={removeTechnicalSkill}
            updateSkillLevel={updateSkillLevel}
            interests={interests}
            toggleInterest={toggleInterest}
            customInterest={customInterest}
            setCustomInterest={setCustomInterest}
            addCustomInterest={addCustomInterest}
            projects={projects}
            setProjects={setProjects}
            newProject={newProject}
            setNewProject={setNewProject}
            handleAddProject={handleAddProject}
            careerGoals={careerGoals}
            setCareerGoals={setCareerGoals}
            workPreferences={workPreferences}
            setWorkPreferences={setWorkPreferences}
          />
          {/* Wizard Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <Button
                id="wizard-back-btn"
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <Button
                id="wizard-next-btn"
                type="button"
                variant="primary"
                size="md"
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                id="wizard-submit-btn"
                type="button"
                variant="primary"
                size="md"
                onClick={handleSubmitProfile}
                rightIcon={<Sparkles className="w-4 h-4 text-white" />}
              >
                Build My Career Profile
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
