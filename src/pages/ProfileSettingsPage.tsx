import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { api } from "../services/api.js";
import { CareerProfile, SkillItem } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { Badge } from "../components/ui/Badge.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import { ThemeToggle } from "../components/ui/ThemeToggle.js";
import {
  User,
  GraduationCap,
  Code,
  Target,
  Settings,
  Save,
  Plus,
  Trash2,
  Sparkles,
  LogOut,
  Sun,
} from "lucide-react";

export const ProfileSettingsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, logout, updateLocalUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [education, setEducation] = useState({
    degree: "",
    department: "",
    institution: "",
    graduationYear: "",
    academicPerformance: "",
  });

  const [technicalSkills, setTechnicalSkills] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<SkillItem["category"]>("Programming");
  const [currentDirection, setCurrentDirection] = useState("Software Developer");

  useEffect(() => {
    api.profile
      .get()
      .then((p) => {
        setProfile(p);
        if (p) {
          setEducation(p.education || {});
          setTechnicalSkills(p.technicalSkills || []);
          setCurrentDirection(p.currentDirection || "Software Developer");
        }
      })
      .catch((err) => toast.error("Failed to load profile: " + err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (technicalSkills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;
    setTechnicalSkills([...technicalSkills, { name: newSkillName.trim(), category: newSkillCategory, level: 70 }]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (name: string) => {
    setTechnicalSkills(technicalSkills.filter((s) => s.name !== name));
  };

  const handleUpdateSkillLevel = (name: string, level: number) => {
    setTechnicalSkills(technicalSkills.map((s) => (s.name === name ? { ...s, level } : s)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      const updated = await api.profile.update({
        education,
        technicalSkills,
        careerGoals: {
          ...profile.careerGoals,
          desiredRole: currentDirection,
        },
      });

      setProfile(updated);
      updateLocalUser({ targetCareerId: currentDirection });
      toast.success("Profile changes saved and readiness scores updated!");
    } catch (err: any) {
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading profile settings..." />;
  }

  return (
    <div id="profile-settings-page" className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" /> User Profile & Parameters
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Profile & Career Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain your educational background, technical proficiencies, and career direction.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            onNavigate("/");
          }}
          leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          Sign Out
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Info */}
        <Card variant="default" className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Account Credentials</h3>
              <p className="text-xs text-slate-500">Student authentication identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Student Name
              </label>
              <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                {user?.name}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                {user?.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Education Details */}
        <Card variant="default" className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Education Details</h3>
              <p className="text-xs text-slate-500">Institutional records and graduation target</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Degree"
              value={education.degree}
              onChange={(e) => setEducation({ ...education, degree: e.target.value })}
            />
            <Input
              label="Department / Major"
              value={education.department}
              onChange={(e) => setEducation({ ...education, department: e.target.value })}
            />
            <Input
              label="Institution Name"
              value={education.institution}
              onChange={(e) => setEducation({ ...education, institution: e.target.value })}
            />
            <Input
              label="Graduation Year"
              value={education.graduationYear}
              onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
            />
          </div>
        </Card>

        {/* Target Career Track */}
        <Card variant="highlight" className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Target Career Track</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Changing this will re-anchor your Skill Gap benchmarks and Personalized 5-Phase Roadmap.
              </p>
            </div>
          </div>

          <div>
            <select
              value={currentDirection}
              onChange={(e) => setCurrentDirection(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            >
              <option value="Software Developer">Software Developer (General Full-Stack)</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
              <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
            </select>
          </div>
        </Card>

        {/* Technical Proficiencies */}
        <Card variant="default" className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Technical Proficiencies</h3>
              <p className="text-xs text-slate-500">Fine-tune your confidence levels (0-100%)</p>
            </div>
          </div>

          <div className="space-y-3">
            {technicalSkills.map((skill) => (
              <div
                key={skill.name}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {skill.name} <span className="text-slate-400 font-normal">({skill.category})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600">{skill.level}%</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={skill.level}
                  onChange={(e) => handleUpdateSkillLevel(skill.name, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                placeholder="Add another skill"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Databases">Databases</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="AI & Data">AI & Data</option>
                <option value="Tools & Others">Tools & Others</option>
              </select>
              <Button type="button" size="sm" variant="secondary" onClick={handleAddSkill} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add
              </Button>
            </div>
          </div>
        </Card>

        {/* Appearance & Theme Preferences */}
        <Card variant="default" className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sun className="w-4 h-4 text-blue-600" />
                Appearance & Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between clean light mode or comfortable dark mode for your workspace.
              </p>
            </div>
            <ThemeToggle showLabel size="md" />
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            id="save-profile-btn"
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4 text-white" />}
          >
            Save Profile & Update Framework
          </Button>
        </div>
      </form>
    </div>
  );
};
