import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { Career, CareerProfile, SkillGapAnalysis } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { SkillBar } from "../components/cards/SkillBar.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import {
  Search,
  CheckCircle2,
  Briefcase,
  Code,
  Layers,
  TrendingUp,
  Target,
  Wrench,
  Sparkles,
  ArrowRight,
  BarChart2,
} from "lucide-react";

export const CareerExplorerPage: React.FC<{
  careerIdParam?: string;
  onNavigate: (route: string) => void;
}> = ({ careerIdParam, onNavigate }) => {
  const { user, updateLocalUser } = useAuth();
  const toast = useToast();

  const [catalog, setCatalog] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ gapAnalysis: SkillGapAnalysis } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [careers, prof] = await Promise.all([
        api.careers.getCatalog(),
        api.profile.get().catch(() => null),
      ]);
      setCatalog(careers || []);
      setProfile(prof);

      const targetId = careerIdParam || prof?.currentDirection || "software-developer";
      const initial =
        careers.find((c: Career) => c.id === targetId || c.slug === targetId || c.title.toLowerCase() === targetId.toLowerCase()) ||
        careers[0];
      setSelectedCareer(initial || null);
    } catch (err: any) {
      toast.error("Failed to load career catalog: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [careerIdParam]);

  const handleSelectCareer = (career: Career) => {
    setSelectedCareer(career);
  };

  const handleCompare = async () => {
    if (!selectedCareer) return;
    setIsComparing(true);
    setComparisonModalOpen(true);
    try {
      const res = await api.careers.compareWithProfile(selectedCareer.id);
      setComparisonData(res);
    } catch (err: any) {
      toast.error("Failed to compare profile: " + err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleSetTarget = async () => {
    if (!selectedCareer) return;
    try {
      await api.profile.setTargetCareer(selectedCareer.id);
      updateLocalUser({ targetCareerId: selectedCareer.id });
      toast.success(`Active target updated to ${selectedCareer.title}!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to set target career: " + err.message);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading career specifications..." />;
  }

  if (!selectedCareer) return null;

  const isCurrentTarget =
    profile?.currentDirection.toLowerCase() === selectedCareer.title.toLowerCase() ||
    user?.targetCareerId === selectedCareer.id;

  return (
    <div id="career-explorer-page" className="space-y-4 sm:space-y-6">
      {/* Top Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Career Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            In-depth competencies, day-to-day responsibilities, progression ladders, and project blueprints.
          </p>
        </div>

        {/* Quick Career Selector Dropdown */}
        <div className="flex w-full sm:w-auto items-center gap-2">
          <select
            id="career-selector-select"
            value={selectedCareer.id}
            onChange={(e) => {
              const c = catalog.find((item) => item.id === e.target.value);
              if (c) handleSelectCareer(c);
            }}
            className="w-full sm:w-auto max-w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 shadow-sm"
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Overview Card */}
      <Card variant="highlight" className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                {selectedCareer.category}
              </Badge>
              {isCurrentTarget && (
                <Badge variant="success" size="sm">
                  Your Active Target Role
                </Badge>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {selectedCareer.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-3xl mt-2 leading-relaxed">
              {selectedCareer.description}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <Button
              id="compare-profile-btn"
              variant="outline"
              size="sm"
              onClick={handleCompare}
              leftIcon={<BarChart2 className="w-4 h-4 text-blue-600" />}
            >
              Compare with My Profile
            </Button>
            {!isCurrentTarget && (
              <Button
                id="set-target-btn"
                variant="primary"
                size="sm"
                onClick={handleSetTarget}
                leftIcon={<Target className="w-4 h-4 text-white" />}
              >
                Set as Active Target
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 2-Column Deep Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* What Professionals Do */}
          <Card variant="default" className="p-4 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" /> Key Responsibilities & Day-to-Day
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
              {selectedCareer.whatTheyDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Core Technical Skills */}
          <Card variant="default" className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-600" /> Core Technical Skill Benchmarks
            </h3>
            <div className="space-y-3">
              {selectedCareer.coreTechnicalSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{s.name}</span>
                    <p className="text-[10px] text-slate-400 font-semibold">{s.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.importance === "Essential" ? "danger" : "primary"} size="sm">
                      {s.importance}
                    </Badge>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.defaultLevel}% target</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Suggested Capstone Projects */}
          <Card variant="default" className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" /> Recommended Capstone Projects
            </h3>
            <div className="space-y-3">
              {selectedCareer.suggestedProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{proj.title}</h4>
                    <Badge variant="neutral" size="sm">
                      {proj.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.skillsUsed.map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tools & Tech Stack */}
          <Card variant="default" className="p-4 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> Common Industry Tooling
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedCareer.commonTools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Card>

          {/* Entry Level Expectations */}
          <Card variant="default" className="p-4 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Entry-Level Hiring Expectations
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
              {selectedCareer.entryLevelExpectations.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="leading-relaxed">{exp}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Career Progression Ladder */}
          <Card variant="default" className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Career Progression & Compensation
            </h3>
            <div className="space-y-3">
              {selectedCareer.careerProgression.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{step.title}</h5>
                    <span className="text-[10px] text-slate-400 font-medium">{step.timeframe}</span>
                  </div>
                  <Badge variant="success" size="sm">
                    {step.salaryRange}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Comparison Modal */}
      <Modal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        title={`Profile Comparison: ${selectedCareer.title}`}
        description="Detailed breakdown of which skills meet benchmark requirements vs. those requiring active development."
        size="lg"
      >
        {isComparing ? (
          <LoadingState message="Analyzing candidate skill vectors against role..." />
        ) : comparisonData ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {comparisonData.gapAnalysis?.summary}
            </p>
            <div className="space-y-3">
              {comparisonData.gapAnalysis?.skills.map((s, idx) => (
                <SkillBar key={idx} skill={s} />
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
