import React from "react";
import type { CareerProfile, InterviewSession } from "../../types/index.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { LoadingState } from "../../components/ui/LoadingState.js";
import { Modal } from "../../components/ui/Modal.js";
import {
  Bot,
  Compass,
  FileText,
  Lightbulb,
  MessageSquare,
  Play,
  RotateCcw,
  ShieldCheck,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { INTERVIEW_FORMATS, TARGET_ROLES } from "./interviewConfig.js";

interface InterviewSetupViewProps {
  onNavigate: (route: string) => void;
  profile: CareerProfile | null;
  careerTitle: string;
  setCareerTitle: React.Dispatch<React.SetStateAction<string>>;
  format: string;
  setFormat: React.Dispatch<React.SetStateAction<string>>;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  setDifficulty: React.Dispatch<React.SetStateAction<"Beginner" | "Intermediate" | "Advanced">>;
  durationMinutes: number;
  handleDurationChange: (minutes: number) => void;
  questionCount: number;
  mode: "realistic" | "coaching";
  setMode: React.Dispatch<React.SetStateAction<"realistic" | "coaching">>;
  sessionsHistory: InterviewSession[];
  isLoadingHistory: boolean;
  isStarting: boolean;
  handleStartInterview: () => void;
  handleResumeInterview: (session: InterviewSession) => void;
  handleViewHistoricalReport: (sessionId: string) => void;
  handleRetake: (session: InterviewSession) => void;
  deleteSessionTarget: InterviewSession | null;
  setDeleteSessionTarget: React.Dispatch<React.SetStateAction<InterviewSession | null>>;
  isDeletingSession: boolean;
  handleDeleteHistorySession: () => void;
}

export const InterviewSetupView: React.FC<InterviewSetupViewProps> = ({
  onNavigate,
  profile,
  careerTitle,
  setCareerTitle,
  format,
  setFormat,
  difficulty,
  setDifficulty,
  durationMinutes,
  handleDurationChange,
  questionCount,
  mode,
  setMode,
  sessionsHistory,
  isLoadingHistory,
  isStarting,
  handleStartInterview,
  handleResumeInterview,
  handleViewHistoricalReport,
  handleRetake,
  deleteSessionTarget,
  setDeleteSessionTarget,
  isDeletingSession,
  handleDeleteHistorySession,
}) => {
  const completedWithScore = (sessionsHistory || []).filter(
    (session) => session && (session.status === "completed" || session.status === "ended_early") && session.overallScore !== null && session.overallScore !== undefined,
  );
  const avgHistoricalScore = completedWithScore.length > 0
    ? Math.round(completedWithScore.reduce((total, session) => total + (session.overallScore || 0), 0) / completedWithScore.length)
    : null;

  return (
      <div id="interview-arena-setup-view" className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                <Bot className="w-3.5 h-3.5" /> AI Mock Interview Platform
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Interactive Interview Simulator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Experience an intelligent AI interviewer that asks contextual questions, probes deeper into your reasoning, supports coding & behavioral scenarios, and delivers a rigorous hiring scorecard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("/roadmap")}
              leftIcon={<Compass className="w-3.5 h-3.5 text-blue-600" />}
            >
              Skill Roadmap
            </Button>
          </div>
        </div>

        {/* Candidate Profile Context Banner */}
        {profile && (
          <Card variant="subtle" className="p-4 border-blue-200/80 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <div className="flex min-w-0 items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Candidate Profile Connected
                  </span>
                  <Badge variant="primary" size="sm">
                    {profile.currentDirection || careerTitle}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {profile.technicalSkills?.length || 0} demonstrated competencies & capstones linked. Questions will personalize to your background.
                </p>
              </div>
            </div>

            <span className="hidden sm:inline text-xs font-semibold text-blue-600 dark:text-blue-400">
              Personalized AI Mode
            </span>
          </Card>
        )}

        {/* 2-Column Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Target Role Selection */}
            <Card variant="default" className="p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Target Career Role
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Select target interview specialization</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TARGET_ROLES.map((role) => {
                  const isSelected = careerTitle.toLowerCase() === role.toLowerCase();
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setCareerTitle(role)}
                      className={`p-3 rounded-xl text-xs font-bold text-left transition-all border ${
                        isSelected
                          ? "bg-blue-50/90 dark:bg-blue-950/70 border-blue-500 text-blue-700 dark:text-blue-300 shadow-[0_1px_3px_rgba(37,99,235,0.1)] ring-1 ring-blue-500/20"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/80 hover:text-blue-700 dark:hover:text-blue-300"
                      }`}
                    >
                      <span className="truncate block">{role}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 2. Interview Format Selection */}
            <Card variant="default" className="p-4 sm:p-6 space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Interview Format & Scope
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Choose evaluation framework</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTERVIEW_FORMATS.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = format === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id)}
                      className={`group p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-[0_1px_3px_rgba(37,99,235,0.08)] ring-1 ring-blue-500/20"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/70 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                            }`}
                          >
                            {fmt.label}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {fmt.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 leading-relaxed">
                          {fmt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 3. Difficulty Level & Duration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Difficulty */}
              <Card variant="default" className="p-4 sm:p-6 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  3. Difficulty Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => {
                    const isSelected = difficulty === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {difficulty === "Beginner" && "Focuses on fundamental principles, definitions, and clean execution."}
                  {difficulty === "Intermediate" && "Evaluates trade-offs, concurrency, performance diagnostics, and STAR anecdotes."}
                  {difficulty === "Advanced" && "Probes high-scale distributed systems, fault-tolerance, and strategic reasoning."}
                </p>
              </Card>

              {/* Duration & Budget */}
              <Card variant="default" className="p-4 sm:p-6 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  4. Duration & Question Count
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { mins: 10, label: "10 Min", count: "3-4 Qs" },
                    { mins: 20, label: "20 Min", count: "5-6 Qs" },
                    { mins: 30, label: "30 Min", count: "7-8 Qs" },
                  ].map((d) => {
                    const isSelected = durationMinutes === d.mins;
                    return (
                      <button
                        key={d.mins}
                        type="button"
                        onClick={() => handleDurationChange(d.mins)}
                        className={`py-2 px-2 rounded-xl text-center transition-all border ${
                          isSelected
                            ? "bg-blue-50/90 dark:bg-blue-950/70 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-blue-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <span className="block text-xs font-bold">{d.label}</span>
                        <span className="text-[10px] text-slate-400 block">{d.count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Questions Planned:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {questionCount} Questions ({Math.round(durationMinutes / questionCount)}m per Q)
                  </span>
                </div>
              </Card>
            </div>

            {/* 4. Interview Mode */}
            <Card variant="default" className="p-4 sm:p-6 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                5. Interview Experience Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setMode("realistic")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    mode === "realistic"
                      ? "bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs ring-1 ring-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <Bot className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold">Realistic Interview Mode</h4>
                      <Badge variant="primary" size="sm">Recommended</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      AI acts strictly like a hiring panel, asks natural follow-ups, and saves detailed evaluations for the final report.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setMode("coaching")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    mode === "coaching"
                      ? "bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-xs ring-1 ring-indigo-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold">Practice & Coaching Mode</h4>
                      <Badge variant="purple" size="sm">Learning</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Enables a "Request Hint" button to receive guiding hints and architectural suggestions during any question.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Launch Cockpit & Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Configuration Summary Card */}
            <Card variant="highlight" className="p-4 sm:p-6 space-y-5 border-blue-200/80 dark:border-blue-800/80">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Ready to Launch
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Simulation Summary
                </h3>
              </div>

              <div className="space-y-3 text-xs border-y border-slate-200/60 dark:border-slate-800/60 py-3.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Role Track:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{careerTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Format:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">{format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Difficulty:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Planned Questions:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{questionCount} Topics</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session Mode:</span>
                  <Badge variant={mode === "realistic" ? "primary" : "purple"} size="sm">
                    {mode === "realistic" ? "Realistic Hiring" : "Interactive Coaching"}
                  </Badge>
                </div>
              </div>

              <Button
                id="launch-mock-interview-btn"
                variant="primary"
                size="lg"
                className="w-full shadow-md font-bold"
                onClick={handleStartInterview}
                isLoading={isStarting}
                rightIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Start AI Interview Simulation
              </Button>
            </Card>

            {/* Performance Overview (if history exists) */}
            {completedWithScore.length > 0 && (
              <Card variant="default" className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Interview Readiness Momentum
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Average Score</span>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                      {avgHistoricalScore !== null ? `${avgHistoricalScore}%` : "Not available"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Simulations</span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {completedWithScore.length} Completed
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Completed Practice Simulations Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Interview History ({sessionsHistory.length})
              </h3>
            </div>
          </div>

          {isLoadingHistory ? (
            <LoadingState message="Loading simulation history..." />
          ) : sessionsHistory.length === 0 ? (
              <Card variant="default" className="p-5 sm:p-8 text-center space-y-2">
              <Bot className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Interview Simulations Recorded</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Configure your target role and format above, then click Start Interview to run your first interactive mock session.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessionsHistory.map((sess) => {
                const hasScore = sess.overallScore !== null && sess.overallScore !== undefined;
                const scoreBadgeVariant = hasScore
                  ? (sess.overallScore! >= 80 ? "success" : sess.overallScore! >= 65 ? "primary" : "warning")
                  : "neutral";

                return (
                  <Card
                    key={sess.id}
                    variant="default"
                    className="p-5 flex flex-col justify-between space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {sess.careerTitle || (sess as any).career_title || "Software Developer"}
                            </span>
                            <Badge variant="neutral" size="sm">
                              {sess.format || sess.interviewType || (sess as any).interview_type || "Technical Interview"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {(() => {
                              const dVal = sess.createdAt || (sess as any).created_at;
                              if (!dVal) return "Recent Simulation";
                              const parsed = new Date(dVal);
                              return isNaN(parsed.getTime())
                                ? "Recent Simulation"
                                : parsed.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  });
                            })()}{" "}
                            • {sess.difficulty || (sess as any).difficulty || "Intermediate"} • {sess.mainQuestionCount || (Array.isArray(sess.questions) ? sess.questions.filter((q: any) => !q?.isFollowUp).length : 0) || 5} main questions
                          </p>
                        </div>

                        {hasScore ? (
                          <Badge variant={scoreBadgeVariant} size="md">
                            {sess.status === "completed" ? "Score" : "Ended early · score"}: {sess.overallScore}%
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            {sess.status === "completed" ? "Completed · Score unavailable" : sess.status === "ended_early" ? "Ended early · Score unavailable" : sess.status === "incomplete" ? "Incomplete" : sess.status === "created" ? "Needs question retry" : "In Progress"}
                          </Badge>
                        )}
                      </div>

                      {sess.finalSummary?.summaryText && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {sess.finalSummary.summaryText}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      {sess.status === "in_progress" || (sess.status === "created" && sess.sessionConfig?.requestId) ? <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleResumeInterview(sess)}
                        leftIcon={<Play className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Resume Interview
                      </Button> : <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewHistoricalReport(sess.id)}
                        leftIcon={<FileText className="w-3.5 h-3.5 text-blue-600" />}
                      >
                        View Report
                      </Button>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetake(sess)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                      >
                        Retake
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${sess.careerTitle} interview`}
                        title="Delete interview"
                        onClick={() => setDeleteSessionTarget(sess)}
                        className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        <Modal
          isOpen={Boolean(deleteSessionTarget)}
          onClose={() => { if (!isDeletingSession) setDeleteSessionTarget(null); }}
          title="Delete interview from history?"
          description="This will permanently remove this interview and its saved answers and report."
          size="sm"
        >
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeletingSession}
              onClick={() => setDeleteSessionTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeletingSession}
              onClick={handleDeleteHistorySession}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Interview
            </Button>
          </div>
        </Modal>
      </div>

  );
};

