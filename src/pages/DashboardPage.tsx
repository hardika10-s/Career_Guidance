import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../services/api.js";
import { CareerProfile, ProgressTimelineItem, EmployabilityReadiness } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { ProgressRing } from "../components/ui/ProgressRing.js";
import {
  ArrowRight,
  Clock,
  Compass,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export const DashboardPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [employability, setEmployability] = useState<EmployabilityReadiness | null>(null);
  const [timeline, setTimeline] = useState<ProgressTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parallel fetch with error resilience: profile is primary, others enrich
      const [profileResult, empResult, timeResult] = await Promise.allSettled([
        api.profile.get(),
        api.progress.getEmployability(),
        api.progress.getTimeline(),
      ]);

      // Check profile
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        const err = profileResult.reason;
        // If 404, user needs onboarding
        if (err?.status === 404 || err?.message?.includes("404")) {
          setProfile(null);
          setIsLoading(false);
          return;
        }
        throw new Error(err?.message || "Failed to load student profile");
      }

      // Check employability metrics
      if (empResult.status === "fulfilled" && empResult.value) {
        setEmployability(empResult.value);
      } else {
        setEmployability(null);
      }

      // Check timeline items
      if (timeResult.status === "fulfilled" && Array.isArray(timeResult.value)) {
        // Deduplicate timeline events by id
        const seen = new Set<string>();
        const uniqueEvents: ProgressTimelineItem[] = [];
        for (const item of timeResult.value) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            uniqueEvents.push(item);
          }
        }
        // Sort descending by timestamp
        uniqueEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setTimeline(uniqueEvents);
      } else {
        setTimeline([]);
      }
    } catch (err: any) {
      setError(err?.message || "Unable to connect to the career guidance backend.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Format valid dates consistently
  const formatDate = (isoString?: string): string => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Derive consolidated metrics strictly from backend values
  const targetRole =
    employability?.targetRole ||
    employability?.careerTitle ||
    profile?.currentDirection ||
    "Software Developer";

  const readinessScore =
    employability?.overallScore ??
    profile?.readinessScore ??
    0;

  const alignmentPercentage =
    employability?.directionMatch ??
    profile?.matchPercentage ??
    0;

  const tierLabel =
    employability?.tier ||
    (readinessScore >= 80 ? "Market Ready" : readinessScore >= 65 ? "Competitive Candidate" : "Developing Candidate");

  const scoreExplanation =
    employability?.scoreExplanation ||
    profile?.directionExplanation ||
    "Evaluation based on demonstrated skills, projects, assessment scores, and interview preparation.";

  // Extract skills breakdown (Technical, Demonstrated Projects, Interview Readiness)
  const technicalSkillsScore =
    employability?.factors?.technical ??
    (profile?.readinessBreakdown as any)?.technicalFoundation ??
    (profile?.readinessBreakdown as any)?.technicalSkills ??
    75;

  const demonstratedProjectsScore =
    employability?.factors?.projects ??
    (profile?.readinessBreakdown as any)?.projectEvidence ??
    (profile?.readinessBreakdown as any)?.projects ??
    70;

  const interviewReadinessScore =
    employability?.factors?.interview ??
    (profile?.readinessBreakdown as any)?.interviewReadiness ??
    60;

  // Single prioritized next action derived from actual backend recommendations
  const rawNextAction =
    employability?.nextPriority ||
    employability?.nextBestAction ||
    profile?.nextBestAction ||
    profile?.biggestOpportunity ||
    "Complete Phase 2 milestone tasks to bridge core database and testing skill gaps.";

  // Determine appropriate action route and label based on backend content
  const lowerAction = rawNextAction.toLowerCase();
  let actionRoute = "/roadmap";
  let actionLabel = "Open Roadmap";
  let actionCategory = "Curriculum Milestone";

  if (lowerAction.includes("interview") || lowerAction.includes("mock")) {
    actionRoute = "/interview";
    actionLabel = "Practice Interview";
    actionCategory = "Interview Arena";
  } else if (lowerAction.includes("evidence") || lowerAction.includes("github") || lowerAction.includes("repo") || lowerAction.includes("certif")) {
    actionRoute = "/evidence";
    actionLabel = "Add Skill Evidence";
    actionCategory = "Proof of Skills";
  } else if (lowerAction.includes("assessment") || lowerAction.includes("quiz")) {
    actionRoute = "/assessment";
    actionLabel = "Take Assessment";
    actionCategory = "Career Diagnostic";
  } else if (lowerAction.includes("gap") || lowerAction.includes("skill")) {
    actionRoute = "/skills";
    actionLabel = "View Skill Gaps";
    actionCategory = "Skill Analysis";
  }

  // --- STATE 1: LOADING SKELETON ---
  if (isLoading) {
    return (
      <div id="dashboard-loading" className="space-y-6 animate-pulse max-w-6xl mx-auto">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-56" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // --- STATE 2: ERROR STATE WITH RETRY ---
  if (error) {
    return (
      <div id="dashboard-error" className="max-w-md mx-auto py-8 sm:py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Unable to Load Dashboard
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {error}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={loadDashboardData}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  // --- STATE 3: EMPTY PROFILE (ONBOARDING NEEDED) ---
  if (!profile) {
    return (
      <div id="dashboard-empty" className="max-w-md mx-auto py-8 sm:py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Profile Setup Required
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Complete onboarding to personalize your career dashboard.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onNavigate("/onboarding")}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Complete Onboarding
        </Button>
      </div>
    );
  }

  return (
    <div id="dashboard-page" className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
      <header className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name || "there"}
          </h1>
        </div>
        <Button id="dash-quick-roadmap-btn" variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onNavigate("/roadmap")} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
          Roadmap
        </Button>
      </header>

      <section aria-label="Career overview" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card id="card-readiness-overview" variant="default" className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Career readiness</h2>
            {alignmentPercentage > 0 && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                {alignmentPercentage}% match
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <ProgressRing score={readinessScore} size={104} strokeWidth={9} label="Ready" sublabel="Score" colorVariant="blue" />
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Target role</p>
              <p className="truncate text-base font-bold text-slate-900 dark:text-slate-100">{targetRole}</p>
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {tierLabel}
              </span>
            </div>
          </div>
        </Card>

        <Card id="card-skills-progress" variant="default" className="p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Skills progress</h2>
            <button onClick={() => onNavigate("/skills")} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Skill gaps <ArrowRight className="ml-1 inline h-3 w-3" />
            </button>
          </div>
          <div className="space-y-5">
            {[
              { label: "Technical skills", value: technicalSkillsScore },
              { label: "Projects", value: demonstratedProjectsScore },
              { label: "Interview readiness", value: interviewReadinessScore },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{metric.label}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{metric.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card id="card-next-action" variant="default" className="flex flex-col p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recommended next step</h2>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {actionCategory}
            </span>
          </div>
          <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{rawNextAction}</p>
          <Button id="dash-execute-action-btn" variant="primary" size="sm" onClick={() => onNavigate(actionRoute)} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            {actionLabel}
          </Button>
        </Card>
      </section>

      <Card id="card-recent-activity" variant="default" className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent activity</h2>
          </div>
          <button onClick={() => onNavigate("/timeline")} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
            View timeline <ArrowRight className="ml-1 inline h-3 w-3" />
          </button>
        </div>
        {timeline.length === 0 ? (
          <p className="py-5 text-center text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {timeline.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
                <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{formatDate(item.timestamp)}</time>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
