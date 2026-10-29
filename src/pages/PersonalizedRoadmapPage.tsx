import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { CareerRoadmap } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { RoadmapPhaseCard } from "../components/cards/RoadmapPhaseCard.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import { RefreshCw, Award, Route } from "lucide-react";

export const PersonalizedRoadmapPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const toast = useToast();

  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // A rapid series of clicks must reach the server in order. Each toggle is
  // read-modify-write, so concurrent requests can otherwise overwrite one
  // another and leave some checklist items unchecked.
  const taskUpdateQueue = useRef<Promise<void>>(Promise.resolve());

  const loadRoadmap = async () => {
    setIsLoading(true);
    try {
      const data = await api.roadmap.get();
      setRoadmap(data);
    } catch (err: any) {
      toast.error("Failed to load career roadmap: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const handleToggleTask = async (
    phaseId: string,
    taskId: string,
    taskType: "learning" | "practice" | "project"
  ) => {
    taskUpdateQueue.current = taskUpdateQueue.current.then(async () => {
      try {
        const updated = await api.roadmap.toggleTask(phaseId, taskId, taskType);
        setRoadmap(updated);
      } catch (err: any) {
        toast.error("Failed to update task: " + err.message);
      }
    });
    return taskUpdateQueue.current;
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const updated = await api.roadmap.regenerate();
      setRoadmap(updated);
      toast.success("Roadmap updated.");
    } catch (err: any) {
      toast.error("Failed to regenerate roadmap.");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your roadmap..." />;
  }

  if (!roadmap) return null;

  return (
    <div id="personalized-roadmap-page" className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Route className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Career roadmap</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{roadmap.careerTitle}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            id="roadmap-evidence-btn"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onNavigate("/evidence")}
              leftIcon={<Award className="h-3.5 w-3.5 text-indigo-600" />}
          >
            Proof of Skills
          </Button>
          <Button
            id="roadmap-recalc-btn"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleRegenerate}
            isLoading={isRegenerating}
            leftIcon={<RefreshCw className="h-3.5 w-3.5 text-blue-600" />}
          >
            Refresh plan
          </Button>
        </div>
      </div>

      <Card variant="subtle" className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Your roadmap progress</p>
            <span className="text-sm font-bold tabular-nums text-blue-700 dark:text-blue-300">{roadmap.overallProgress}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-label="Overall roadmap progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={roadmap.overallProgress}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-300" style={{ width: `${roadmap.overallProgress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">All {roadmap.phases.length} phases are open. Complete Learn and Practice items to track your progress.</p>
        </div>
      </Card>

      <div className="space-y-4">
        {roadmap.phases.map((phase) => (
          <RoadmapPhaseCard
            key={phase.id}
            phase={phase}
            onToggleTask={handleToggleTask}
          />
        ))}
      </div>
    </div>
  );
};
