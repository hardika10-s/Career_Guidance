import React from "react";
import type { InterviewReport } from "../../types/index.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { ProgressBar } from "../../components/ui/ProgressBar.js";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
} from "lucide-react";

interface InterviewReportViewProps {
  activeReport: InterviewReport;
  careerTitle: string;
  format: string;
  onNavigate: (route: string) => void;
  onBackToSetup: () => void;
  onRetake: () => void;
}

export const InterviewReportView: React.FC<InterviewReportViewProps> = ({
  activeReport,
  careerTitle,
  format,
  onNavigate,
  onBackToSetup,
  onRetake,
}) => {
  const overallScore = activeReport.overallScore;
  const hasValidScore = overallScore !== null && overallScore !== undefined;
  const tier = activeReport.tier || (!hasValidScore ? "Score unavailable" : overallScore >= 80 ? "Market-Competitive Ready" : "Developing Foundation");
  const dims = activeReport.dimensions;

  return (
      <div id="interview-arena-report-view" className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {activeReport.status === "completed" ? "Performance Assessment Complete" : "Interview Ended Early"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Mock Interview Scorecard & Feedback
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comprehensive evaluation report for {careerTitle} ({format}) based on realistic hiring rubrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToSetup}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Arena Setup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onRetake}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake Interview
            </Button>
          </div>
        </div>

        {/* Overall Score Hero Card */}
        <Card variant="highlight" className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 border-blue-200/80 dark:border-blue-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={!hasValidScore ? "neutral" : overallScore >= 80 ? "success" : overallScore >= 65 ? "primary" : "warning"} size="md">
                  {tier}
                </Badge>
                <span className="text-xs text-slate-500 font-semibold">
                  {activeReport.questionsAnswered} Questions Evaluated
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Composite Hiring Readiness Score
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                {activeReport.summaryText}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-800 text-center shadow-sm shrink-0 w-full sm:w-auto sm:min-w-[160px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Overall Score
              </span>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400 my-1">
                {overallScore === null || overallScore === undefined ? "Not available" : `${overallScore}%`}
              </p>
              <span className="text-[10px] text-slate-400">Benchmark Scale (0-100)</span>
            </div>
          </div>

          {/* 5 Dimensional Pillar Bars */}
          {dims && <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Evaluated Hiring Dimensions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <ProgressBar
                label="Technical Accuracy & Correctness"
                value={dims.technicalAccuracy}
                showPercentage
                colorVariant="sky"
              />
              <ProgressBar
                label="Problem Solving & Logic"
                value={dims.problemSolving}
                showPercentage
                colorVariant="emerald"
              />
              <ProgressBar
                label="Communication & Clarity (STAR)"
                value={dims.communication}
                showPercentage
                colorVariant="purple"
              />
              <ProgressBar
                label="Depth of Understanding & Trade-offs"
                value={dims.depthOfUnderstanding}
                showPercentage
                colorVariant="amber"
              />
              <div className="sm:col-span-2">
                <ProgressBar
                  label="Practical Application & Real-World Readiness"
                  value={dims.practicalApplication}
                  showPercentage
                  colorVariant="sky"
                />
              </div>
            </div>
          </div>}
        </Card>

        {/* Per-Question Detailed Feedback */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Per-Question Performance & Analysis ({activeReport.perQuestionFeedback?.length || 0})
            </h3>
          </div>

          <div className="space-y-4">
            {(activeReport.perQuestionFeedback || []).map((item, qIdx) => (
              <Card key={qIdx} variant="default" className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Question {item.questionNumber || qIdx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                      {item.questionText}
                    </h4>
                  </div>
                  <Badge
                    variant={item.score >= 80 ? "success" : item.score >= 65 ? "primary" : "warning"}
                    size="md"
                    className="shrink-0"
                  >
                    Score: {item.score}%
                  </Badge>
                </div>

                {/* Candidate Answer Quote */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Your Response:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                    "{item.candidateAnswer || "(No answer recorded)"}"
                  </p>
                </div>

                {/* Strengths & Missing Elements Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> What You Did Well
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.whatWentWell}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Areas to Strengthen
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.whatWasMissing}
                    </p>
                  </div>
                </div>

                {/* Model Benchmark Answer */}
                {item.idealAnswer && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs space-y-1">
                    <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-600" /> Model Benchmark Answer & Reasoning
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.idealAnswer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Top 3 Actionable Recommendations */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Top Actionable Improvement Drills
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(activeReport.recommendations || []).map((rec, idx) => (
              <Card key={idx} variant="default" className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Drill #{idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.exercise}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("/roadmap")}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full text-xs"
                >
                  Practice in Roadmap
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 text-center leading-relaxed">
          <p>
            Evaluation results are synthesized using structured multi-factor rubrics and AI assessment models. While predictive of real-world hiring standards, use these scores as a focused developmental diagnostic rather than a guaranteed employment outcome.
          </p>
        </div>
      </div>

  );
};

