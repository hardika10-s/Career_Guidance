import React from "react";
import { CareerInsight, SkillEvidence } from "../../types/index.js";
import { Card } from "../ui/Card.js";
import { Badge } from "../ui/Badge.js";
import { Sparkles, ArrowRight, Github, Globe, Award, Briefcase, Trophy, Trash2, CheckCircle2 } from "lucide-react";

export const InsightCard: React.FC<{
  insight: CareerInsight;
  onAction: (route: string) => void;
  onDismiss?: (id: string) => void;
}> = ({ insight, onAction, onDismiss }) => {
  return (
    <div
      id={`insight-card-${insight.id}`}
      className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 shadow-sm"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col items-start gap-1 mb-2 min-w-0 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Insight & Observation
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words sm:truncate">
              {insight.title}
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {insight.observation}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-200/40 dark:border-blue-900/40">
            <p className="min-w-0 flex-1 text-xs font-semibold text-slate-800 dark:text-slate-200 break-words">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Suggested:</span> {insight.suggestedAction}
            </p>
            <div className="flex items-center gap-2">
              <button
                id={`insight-action-btn-${insight.id}`}
                onClick={() => onAction(insight.actionRoute)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-800 hover:shadow-sm transition-all"
              >
                Take Action <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EvidenceCard: React.FC<{
  evidence: SkillEvidence;
  onDelete: (id: string) => void;
}> = ({ evidence, onDelete }) => {
  const getIcon = () => {
    switch (evidence.evidenceType) {
      case "github": return <Github className="w-4 h-4" />;
      case "portfolio": return <Globe className="w-4 h-4" />;
      case "certification": return <Award className="w-4 h-4" />;
      case "internship": return <Briefcase className="w-4 h-4" />;
      case "hackathon":
      case "achievement": return <Trophy className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const strengthBadge = {
    Strong: { variant: "success", label: "Strong Verification" },
    Moderate: { variant: "primary", label: "Moderate Strength" },
    Emerging: { variant: "neutral", label: "Emerging" },
  }[evidence.strength] || { variant: "neutral", label: evidence.strength };

  return (
    <Card
      id={`evidence-card-${evidence.id}`}
      variant="default"
      className="p-4 sm:p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {getIcon()}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {evidence.evidenceType}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{evidence.title}</h4>
            </div>
          </div>
          <Badge variant={strengthBadge.variant as any} size="sm">
            {strengthBadge.label}
          </Badge>
        </div>

        <div className="my-2.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Validated Skill: <strong className="text-blue-600 dark:text-blue-400">{evidence.skillName}</strong>
          </span>
          {evidence.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{evidence.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="neutral" size="sm">
            {evidence.verifiedStatus}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
        {evidence.url ? (
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View Artifact <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-400">Direct Verification</span>
        )}

        <button
          id={`delete-evidence-${evidence.id}`}
          onClick={() => onDelete(evidence.id)}
          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Delete Evidence"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};
