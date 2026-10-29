import React from "react";
import { SkillGapItem } from "../../types/index.js";
import { Badge } from "../ui/Badge.js";
import { ArrowUpRight } from "lucide-react";

export const SkillBar: React.FC<{ skill: SkillGapItem; onActionClick?: () => void }> = ({
  skill,
  onActionClick,
}) => {
  const statusBadge = {
    have: { variant: "success", label: "Skill You Have" },
    developing: { variant: "warning", label: "Developing" },
    need: { variant: "danger", label: "Skill You Need" },
  }[skill.status] || { variant: "neutral", label: skill.status };

  return (
    <div
      id={`skill-gap-item-${skill.name.toLowerCase().replace(/\s+/g, "-")}`}
      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words">{skill.name}</h4>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">({skill.category})</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{skill.whyItMatters}</p>
        </div>
        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-1 sm:shrink-0">
          <Badge variant={statusBadge.variant as any} size="sm">
            {statusBadge.label}
          </Badge>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {skill.importance} Priority
          </span>
        </div>
      </div>

      {/* Progress Bars: Current vs Target */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-400">Current Level: {skill.currentLevel}%</span>
          <span className="text-slate-800 dark:text-slate-200">Target Benchmark: {skill.targetLevel}%</span>
        </div>
        <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          {/* Target marker */}
          <div
            className="absolute top-0 bottom-0 bg-slate-300 dark:bg-slate-700 opacity-50"
            style={{ width: `${skill.targetLevel}%` }}
          />
          {/* Current progress */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              skill.status === "have"
                ? "bg-emerald-500"
                : skill.status === "developing"
                ? "bg-amber-500"
                : skill.status === "need"
                ? "bg-rose-500"
                : "bg-sky-500"
            }`}
            style={{ width: `${skill.currentLevel}%` }}
          />
        </div>
        {skill.gap > 0 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium text-right">
            Gap to target: {skill.gap}%
          </p>
        )}
      </div>

      {/* Recommended Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="min-w-0 text-slate-600 dark:text-slate-300 break-words">
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">Action:</strong> {skill.recommendedAction}
        </div>
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
          >
            Practice <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
