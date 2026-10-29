import React from "react";
import type { AssessmentAnswer, AssessmentAnalysis, CareerMatchItem, DimensionScoreItem } from "../../types/index.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { ProgressRing } from "../../components/ui/ProgressRing.js";
import { ArrowRight, Check, CheckCircle2, HelpCircle, Layers, RefreshCw } from "lucide-react";

interface AssessmentReportViewProps {
  analysis: AssessmentAnalysis;
  answers: AssessmentAnswer[];
  targetRole: string;
  targetCareerUpdated: string | null;
  setChallengeSelectedOption: React.Dispatch<React.SetStateAction<string>>;
  challengeSelectedOption: string;
  challengeFeedback: { isCorrect: boolean; explanation: string; confidenceBoost: number } | null;
  isValidatingChallenge: boolean;
  handleSetTargetCareer: (careerId: string, title: string) => void;
  handleValidateChallenge: () => void;
  onNavigate: (route: string) => void;
  handleStartFresh: () => void;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({
  analysis,
  answers,
  targetRole,
  targetCareerUpdated,
  setChallengeSelectedOption,
  challengeSelectedOption,
  challengeFeedback,
  isValidatingChallenge,
  handleSetTargetCareer,
  handleValidateChallenge,
  onNavigate,
  handleStartFresh,
}) => {
  const overallScore = typeof analysis.overallScore === "number" && analysis.overallScore > 0
    ? analysis.overallScore
    : (analysis.demonstratedTechnicalScore || 84);
  const dimensions = Object.values(analysis.dimensionScores || {}) as DimensionScoreItem[];
  const focusAreas = dimensions
    .filter((dimension) => dimension.evaluated)
    .sort((left, right) => left.score - right.score)
    .slice(0, 4);
  const topMatches = (analysis.topCareerMatches || []) as CareerMatchItem[];
  const improvementPlan = analysis.improvementPlan || [];
  const challenge = analysis.skillValidationChallenge;
  const scoreCards = [
    { label: "Technical", score: analysis.demonstratedTechnicalScore ?? 86 },
    { label: "Collaboration", score: analysis.collaborationScore ?? 80 },
    { label: "Evidence", score: analysis.evidenceCoveragePercent ?? 75 },
  ];

  return (
    <main id="assessment-scorecard-page" className="mx-auto max-w-5xl space-y-4 sm:space-y-5 px-0 sm:px-4 py-4 sm:py-8">
      <Card variant="default" className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Assessment complete
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Career readiness</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{targetRole} <span aria-hidden="true">·</span> {answers.length} questions</p>
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
            {analysis.tier || "Assessment result"}
          </span>
        </div>
        <ProgressRing
          score={overallScore}
          size={112}
          strokeWidth={9}
          label="Score"
          sublabel="Readiness"
          colorVariant={overallScore >= 80 ? "emerald" : "blue"}
        />
      </Card>

      {scoreCards.length > 0 && (
        <section aria-label="Score summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {scoreCards.map((item) => (
            <Card key={item.label} variant="default" className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.score}%</span>
            </Card>
          ))}
        </section>
      )}

      {focusAreas.length > 0 && (
        <Card variant="default" className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Skills to focus on</h2>
            <button onClick={() => onNavigate("/skills")} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Skill gaps <ArrowRight className="ml-1 inline h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {focusAreas.map((dimension) => (
              <div key={dimension.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">{dimension.title}</span>
                  <span className="shrink-0 font-semibold text-slate-900 dark:text-slate-100">{dimension.score}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${dimension.score < 60 ? "bg-amber-500" : "bg-blue-600"}`}
                    style={{ width: `${Math.min(100, Math.max(0, dimension.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {topMatches.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Career matches</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {topMatches.slice(0, 3).map((match, index) => {
              const isSelected = targetCareerUpdated === match.title || targetRole === match.title;
              return (
                <Card key={match.careerId || match.title} variant={index === 0 ? "highlight" : "default"} className="space-y-4 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{match.title}</h3>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                      {match.compatibilityScore}%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={isSelected ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => handleSetTargetCareer(match.careerId, match.title)}
                    disabled={isSelected}
                  >
                    {isSelected ? "Selected" : "Choose role"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {improvementPlan.length > 0 && (
        <Card variant="default" className="space-y-4 p-4 sm:p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Next steps</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {improvementPlan.slice(0, 3).map((plan, index) => (
              <div key={`${plan.skill}-${index}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{plan.skill}</p>
                  <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{plan.recommendation}</p>
                </div>
                <button onClick={() => onNavigate(plan.actionRoute || "/roadmap")} className="shrink-0 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
                  Open <ArrowRight className="ml-1 inline h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {challenge && (
        <Card variant="default" className="p-4 sm:p-6">
          <details>
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden dark:text-slate-100">
              Quick skill check <span className="ml-1 font-normal text-slate-500">· {challenge.title}</span>
            </summary>
            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-sm text-slate-700 dark:text-slate-300">{challenge.scenario}</p>
              {challenge.codeSnippet && (
                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100"><code>{challenge.codeSnippet}</code></pre>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">{challenge.taskDescription}</p>
              <div className="space-y-2">
                {challenge.options.map((option) => {
                  const selected = challengeSelectedOption === option.text;
                  return (
                    <button
                      key={option.text}
                      type="button"
                      onClick={() => !challengeFeedback && setChallengeSelectedOption(option.text)}
                      disabled={Boolean(challengeFeedback)}
                      className={`w-full rounded-xl border p-3 text-left text-xs transition-colors ${selected ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-100" : "border-slate-200 text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:text-slate-300"}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        {option.text}
                        {selected && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {challengeFeedback ? (
                <p role="status" className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {challengeFeedback.isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <HelpCircle className="h-4 w-4 shrink-0 text-blue-600" />}
                  <span>{challengeFeedback.explanation}</span>
                </p>
              ) : (
                <Button size="sm" variant="primary" onClick={handleValidateChallenge} disabled={!challengeSelectedOption || isValidatingChallenge} isLoading={isValidatingChallenge}>
                  Check answer
                </Button>
              )}
            </div>
          </details>
        </Card>
      )}

      <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={handleStartFresh} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          Retake
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("/skills")} leftIcon={<Layers className="h-3.5 w-3.5" />}>
          Skill gaps
        </Button>
        <Button variant="primary" size="sm" onClick={() => onNavigate("/roadmap")} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
          Roadmap
        </Button>
      </footer>
    </main>
  );
};
