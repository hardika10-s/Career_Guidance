import React from "react";
import { CareerRecommendation } from "../../types/index.js";
import { Card } from "../ui/Card.js";
import { Badge } from "../ui/Badge.js";
import { Button } from "../ui/Button.js";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

interface CareerCardProps {
  recommendation: CareerRecommendation;
  onExplore: (careerId: string) => void;
  onSetTarget?: (careerId: string) => void;
  isCurrentTarget?: boolean;
}

export const CareerCard: React.FC<CareerCardProps> = ({
  recommendation,
  onExplore,
  onSetTarget,
  isCurrentTarget = false,
}) => {
  const matchColor =
    recommendation.matchPercentage >= 80
      ? "emerald"
      : recommendation.matchPercentage >= 65
      ? "primary"
      : "warning";

  return (
    <Card
      id={`career-card-${recommendation.careerId}`}
      variant={isCurrentTarget ? "highlight" : "default"}
      className="flex flex-col justify-between transition-all"
    >
      <div>
        {/* Header with Title & Match % */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400">#{recommendation.recommendedPriority || 1}</span>
              {isCurrentTarget && (
                <Badge variant="primary" size="sm">
                  Active Target
                </Badge>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight break-words">
              {recommendation.title}
            </h3>
          </div>
          <Badge variant={matchColor as any} size="md" className="shrink-0">
            {recommendation.matchPercentage}% Match
          </Badge>
        </div>

        {/* Explanation */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {recommendation.matchExplanation}
        </p>

        {/* Factors Breakdown */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Strong Alignment Factors
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(recommendation.strongFactors || []).map((factor, fIdx) => (
                <span
                  key={fIdx}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 text-[11px] font-medium border border-emerald-200/60 dark:border-emerald-800/60"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1.5 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" /> Missing Skills to Develop
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(recommendation.missingFactors || []).map((factor, mIdx) => (
                <span
                  key={mIdx}
                  className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-[11px] font-medium border border-amber-200/60 dark:border-amber-800/60"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          id={`explore-btn-${recommendation.careerId}`}
          variant="outline"
          size="sm"
          onClick={() => onExplore(recommendation.careerId)}
          className="flex-1"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Explore Role
        </Button>
        {onSetTarget && !isCurrentTarget && (
          <Button
            id={`set-target-btn-${recommendation.careerId}`}
            variant="primary"
            size="sm"
            onClick={() => onSetTarget(recommendation.careerId)}
          >
            Set as Target
          </Button>
        )}
      </div>
    </Card>
  );
};
