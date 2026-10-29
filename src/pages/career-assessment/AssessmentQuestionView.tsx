import React from "react";
import type { Assessment, AssessmentAnswer, AssessmentAnalysis, AssessmentQuestion, CareerMatchItem, DimensionScoreItem } from "../../types/index.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { ProgressRing } from "../../components/ui/ProgressRing.js";
import { Modal } from "../../components/ui/Modal.js";
import { ASSESSMENT_QUESTION_LIMIT } from "./assessmentConfig.js";
import {
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Award, RefreshCw, Target, Layers,
  Clock, Compass, Code, Terminal, ShieldCheck, AlertTriangle, Check, Play, Pause,
  HelpCircle, Briefcase, BookOpen,
} from "lucide-react";
interface AssessmentQuestionViewProps {
  questions: AssessmentQuestion[];
  currentIndex: number;
  answers: AssessmentAnswer[];
  setViewState: React.Dispatch<React.SetStateAction<"intro" | "active" | "completed">>;
  canConclude: boolean;
  setShowPauseModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectOption: (option: { text: string; score: number }) => void;
  handlePrev: () => void;
  handleNext: () => void;
  setShowConfirmSubmit: React.Dispatch<React.SetStateAction<boolean>>;
  isFetchingNext: boolean;
  showPauseModal: boolean;
  showConfirmSubmit: boolean;
  handleFinalSubmit: () => void;
  isSubmitting: boolean;
}

export const AssessmentQuestionView: React.FC<AssessmentQuestionViewProps> = ({
  questions, currentIndex, answers, setViewState, canConclude, setShowPauseModal,
  handleSelectOption, handlePrev, handleNext, setShowConfirmSubmit, isFetchingNext,
  showPauseModal, showConfirmSubmit, handleFinalSubmit, isSubmitting,
}) => {
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;
  const currentAnswer = answers.find((answer) => answer.questionId === currentQ.id);
  const selectedOptionText = currentAnswer ? (currentAnswer.selectedOption as string) : "";
  const answeredCount = answers.length;
  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / ASSESSMENT_QUESTION_LIMIT) * 100));
  const shouldFinishAssessment = canConclude || currentIndex + 1 >= ASSESSMENT_QUESTION_LIMIT;
  const difficultyColors: Record<string, string> = {
    foundational: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    intermediate: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    advanced: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  };
  return (
      <div id="active-assessment-container" className="max-w-3xl mx-auto py-4 sm:py-6 px-0 sm:px-4 space-y-4 sm:space-y-6">
        {/* Top Progress & Status Bar */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider">
                Question {currentIndex + 1} of {ASSESSMENT_QUESTION_LIMIT}
              </span>
              <span className="text-slate-400">•</span>
              <span>{answeredCount} Answered</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {progressPercent}% Complete
              </span>
              <button
                onClick={() => setShowPauseModal(true)}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Question Card */}
        <Card variant="default" className="p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Category & Difficulty Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {currentQ.dimension ? currentQ.dimension.replace(/_/g, " ").toUpperCase() : currentQ.category}
              </Badge>
              {currentQ.type && (
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {currentQ.type.replace(/_/g, " ")}
                </span>
              )}
            </div>

            {currentQ.difficulty && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${difficultyColors[currentQ.difficulty] || ""}`}>
                {currentQ.difficulty.toUpperCase()}
              </span>
            )}
          </div>

          {/* Question Prompt */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-relaxed">
            {currentQ.questionText}
          </h2>

          {/* Code Snippet Box (for Code-Reading Questions) */}
          {currentQ.codeSnippet && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs shadow-inner">
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  {currentQ.language?.toUpperCase() || "CODE"}
                </span>
                <span>Read-Only Context</span>
              </div>
              <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Interactive Answer Choices */}
          <div className="space-y-3 pt-1">
            {currentQ.options.map((option, oIdx) => {
              const isSelected = selectedOptionText === option.text;
              return (
                <button
                  key={oIdx}
                  id={`opt-btn-${currentIndex}-${oIdx}`}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-start justify-between gap-3 text-xs sm:text-sm font-medium cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="leading-snug">{option.text}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Navigation & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              id="q-prev-btn"
              variant="outline"
              size="md"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                id="q-next-btn"
                variant="primary"
                size="md"
                onClick={shouldFinishAssessment ? () => setShowConfirmSubmit(true) : handleNext}
                disabled={!selectedOptionText || isFetchingNext}
                isLoading={isFetchingNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {shouldFinishAssessment ? "Finish Assessment" : "Next Question"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Modal: Pause Assessment */}
        <Modal
          isOpen={showPauseModal}
          onClose={() => setShowPauseModal(false)}
          title="Pause Assessment Attempt"
          description="Your progress is saved automatically."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPauseModal(false)}>
                Resume Now
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowPauseModal(false);
                  setViewState("intro");
                }}
              >
                Save & Exit
              </Button>
            </div>
          }
        >
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {answers.length} questions answered.
          </p>
        </Modal>

        {/* Modal: Confirm Final Submission */}
        <Modal
          isOpen={showConfirmSubmit}
          onClose={() => setShowConfirmSubmit(false)}
          title="Submit assessment?"
          description="Your results are ready to be generated."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmSubmit(false)}>
                Review Answers
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
                rightIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Confirm & Submit
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <p>
              You have completed <strong>{answers.length}</strong> multi-dimensional questions.
            </p>
            <p>Gemini will evaluate your answers and create a role-specific scorecard, career matches, and improvement plan.</p>
          </div>
        </Modal>
      </div>
  );
};
