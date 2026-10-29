import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { SkillGapAnalysis, SkillGapItem } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { SkillBar } from "../components/cards/SkillBar.js";
import { Modal } from "../components/ui/Modal.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import {
  BarChart3,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Target,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Circle,
  ArrowRight,
} from "lucide-react";

export const SkillGapAnalysisPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const toast = useToast();

  const [gapData, setGapData] = useState<SkillGapAnalysis | null>(null);
  const [filter, setFilter] = useState<"all" | "have" | "developing" | "need" | "optional">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadGapAnalysis = async () => {
    setIsLoading(true);
    try {
      const data = await api.skills.getGapAnalysis();
      setGapData(data);
    } catch (err: any) {
      toast.error("Failed to load skill gap analysis: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGapAnalysis();
  }, []);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const updated = await api.skills.recalculateGapAnalysis();
      setGapData(updated);
      toast.success("Skill gaps recalculated with the local Python analyzer.");
    } catch (err: any) {
      toast.error("Failed to recalculate skill gaps.");
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Conducting multi-factor skill gap diagnostic..." />;
  }

  if (!gapData) return null;

  const filteredSkills = gapData.skills.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const haveCount = gapData.skills.filter((s) => s.status === "have").length;
  const developingCount = gapData.skills.filter((s) => s.status === "developing").length;
  const needCount = gapData.skills.filter((s) => s.status === "need").length;
  const optionalCount = gapData.skills.filter((s) => s.status === "optional").length;

  return (
    <div id="skill-gap-analysis-page" className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Employability Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Skill Gap Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Evaluating your current proficiencies against the standard benchmark for <strong>{gapData.careerTitle}</strong>.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            id="recalc-gaps-btn"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleRecalculate}
            isLoading={isRecalculating}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
          >
            Recalculate Gaps
          </Button>
          <Button
            id="gap-open-roadmap-btn"
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onNavigate("/roadmap")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Bridge Gaps in Roadmap
          </Button>
        </div>
      </div>

      {/* Target Role Diagnostic Banner */}
      <Card variant="highlight" className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="primary" size="sm">
                Target Role Focus
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {gapData.careerTitle}
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              {gapData.summary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-800 text-center shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Level</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{gapData.matchPercentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Readiness</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{gapData.overallReadiness}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Tabs & Counts */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
          }`}
        >
          All Skills ({gapData.skills.length})
        </button>
        <button
          onClick={() => setFilter("have")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === "have"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Skills You Have ({haveCount})
        </button>
        <button
          onClick={() => setFilter("developing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === "developing"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400 hover:border-amber-300"
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Developing ({developingCount})
        </button>
        <button
          onClick={() => setFilter("need")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === "need"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-700 dark:text-rose-400 hover:border-rose-300"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Skills You Need ({needCount})
        </button>
        <button
          onClick={() => setFilter("optional")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === "optional"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-400 hover:border-sky-300"
          }`}
        >
          <Circle className="w-3.5 h-3.5" /> Optional ({optionalCount})
        </button>
      </div>

      {/* Skill Bars List */}
      <div className="space-y-4">
        {filteredSkills.map((skill, idx) => (
          <SkillBar
            key={idx}
            skill={skill}
            onActionClick={() => onNavigate("/roadmap")}
          />
        ))}
      </div>
    </div>
  );
};
