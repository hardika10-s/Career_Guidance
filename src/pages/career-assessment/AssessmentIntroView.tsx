import React from "react";
import type { Assessment, AssessmentAnswer, AssessmentAnalysis, AssessmentQuestion, CareerMatchItem, DimensionScoreItem } from "../../types/index.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { ProgressRing } from "../../components/ui/ProgressRing.js";
import { Modal } from "../../components/ui/Modal.js";
import {
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Award, RefreshCw, Target, Layers,
  Clock, Compass, Code, Terminal, ShieldCheck, AlertTriangle, Check, Play, Pause,
  HelpCircle, Briefcase, BookOpen,
} from "lucide-react";
import { ASSESSMENT_QUESTION_LIMIT } from "./assessmentConfig.js";
interface AssessmentIntroViewProps {
  answers: AssessmentAnswer[];
  completedResult: Assessment | null;
  targetRole: string;
  setViewState: React.Dispatch<React.SetStateAction<"intro" | "active" | "completed">>;
  handleResumeAssessment: () => void;
  handleStartFresh: () => void;
}

export const AssessmentIntroView: React.FC<AssessmentIntroViewProps> = ({ answers, completedResult, targetRole, setViewState, handleResumeAssessment, handleStartFresh }) => {
  const hasIncomplete = answers.length > 0;
  return (
      <div id="assessment-intro-page" className="max-w-4xl mx-auto py-4 sm:py-8 px-0 sm:px-4 space-y-4 sm:space-y-8">
        {/* Intro Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-800 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Adaptive assessment</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Career Readiness Assessment
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Answer {ASSESSMENT_QUESTION_LIMIT} role-focused questions and get a readiness score with clear next steps.
          </p>
        </div>

        {/* Overview Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <Clock className="w-5 h-5 text-blue-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-500">Questions</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{ASSESSMENT_QUESTION_LIMIT}</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <Layers className="w-5 h-5 text-indigo-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-500">Dimensions</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">10 Evaluated</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <Target className="w-5 h-5 text-emerald-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-500">Target Role</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{targetRole}</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <Compass className="w-5 h-5 text-amber-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-500">Methodology</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Adaptive Branching</div>
          </div>
        </div>

        <Card variant="default" className="p-4 text-center text-sm text-slate-600 dark:text-slate-300">
          Your progress saves automatically. Pause and resume whenever you need.
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {hasIncomplete ? (
            <>
              <Button
                id="btn-resume-assessment"
                variant="primary"
                size="lg"
                onClick={handleResumeAssessment}
                leftIcon={<Play className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Resume Saved Attempt ({answers.length} Answered)
              </Button>
              <Button
                id="btn-start-fresh"
                variant="outline"
                size="lg"
                onClick={handleStartFresh}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Start Fresh Assessment
              </Button>
            </>
          ) : (
            <Button
              id="btn-start-assessment"
              variant="primary"
              size="lg"
              onClick={handleStartFresh}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-md"
            >
              Start Adaptive Assessment
            </Button>
          )}

          {completedResult && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setViewState("completed")}
              leftIcon={<Award className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              View Previous Scorecard
            </Button>
          )}
        </div>
      </div>
  );
};
