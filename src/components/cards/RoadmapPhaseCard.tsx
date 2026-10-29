import React, { useMemo } from "react";
import { Check, Sparkles } from "lucide-react";
import { RoadmapPhase, RoadmapTask } from "../../types/index.js";
import { Badge } from "../ui/Badge.js";
import { Card } from "../ui/Card.js";

type TaskType = "learning" | "practice" | "project";

interface RoadmapPhaseCardProps {
  phase: RoadmapPhase;
  onToggleTask: (phaseId: string, taskId: string, taskType: TaskType) => void;
}

const TaskList: React.FC<{
  title: string;
  tasks: RoadmapTask[];
  phase: RoadmapPhase;
  taskType: "learning" | "practice";
  onToggleTask: RoadmapPhaseCardProps["onToggleTask"];
}> = ({ title, tasks, phase, taskType, onToggleTask }) => (
  <section className="space-y-2">
    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {title}
    </h3>
    <div className="space-y-1.5">
      {tasks.map((task) => (
        <button
          key={task.id}
          type="button"
          aria-pressed={task.completed}
          title={task.description}
          onClick={() => onToggleTask(phase.id, task.id, taskType)}
          className="group flex w-full items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
        >
          <span
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
              task.completed
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white group-hover:border-blue-500 dark:border-slate-600 dark:bg-slate-950"
            }`}
            aria-hidden="true"
          >
            {task.completed && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
          <span className={`text-sm leading-5 ${task.completed ? "text-slate-500 line-through dark:text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
            {task.title}
          </span>
        </button>
      ))}
      {tasks.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No tasks yet
        </p>
      )}
    </div>
  </section>
);

export const RoadmapPhaseCard: React.FC<RoadmapPhaseCardProps> = ({ phase, onToggleTask }) => {
  const tasks = useMemo(() => [...phase.learningTasks, ...phase.practiceTasks], [phase.learningTasks, phase.practiceTasks]);
  const completedCount = tasks.filter((task) => task.completed).length;
  const isComplete = tasks.length > 0 && completedCount === tasks.length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <Card id={`roadmap-phase-${phase.id}`} className="relative overflow-hidden p-0">
      <div className={`absolute inset-x-0 top-0 h-1 ${isComplete ? "bg-emerald-500" : "bg-blue-500"}`} />
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${
            isComplete
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          }`}>
            {isComplete ? <Check className="h-4 w-4" /> : phase.phaseNumber}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Phase {phase.phaseNumber}</p>
              <h2 className="mt-0.5 text-base font-bold leading-5 text-slate-900 dark:text-slate-100" title={phase.title}>{phase.title}</h2>
              {phase.description && <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-400">{phase.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {phase.estimatedEffort && <Badge size="sm">{phase.estimatedEffort}</Badge>}
            <Badge variant={isComplete ? "success" : "primary"} size="sm">
              {isComplete ? "Complete" : `${completedCount}/${tasks.length} done`}
            </Badge>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-label={`Phase ${phase.phaseNumber} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <div className={`h-full rounded-full transition-[width] duration-300 ${isComplete ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="w-9 text-right text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">{progressPercent}%</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TaskList title="Learn" tasks={phase.learningTasks} phase={phase} taskType="learning" onToggleTask={onToggleTask} />
          <TaskList title="Practice" tasks={phase.practiceTasks} phase={phase} taskType="practice" onToggleTask={onToggleTask} />
        </div>

        {phase.project?.title && (
        <details className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Optional project: {phase.project.title}
            <span className="ml-auto text-xs font-normal text-slate-500">{phase.project.completed ? "Done" : "Details"}</span>
          </summary>
          <div className="space-y-3 border-t border-slate-200 px-3 py-3 dark:border-slate-700">
            {phase.project.description && <p className="text-sm text-slate-600 dark:text-slate-300">{phase.project.description}</p>}
            {!!phase.project.deliverables?.length && (
              <ul className="list-inside list-disc space-y-1 text-xs text-slate-500 dark:text-slate-400">
                {phase.project.deliverables.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
            <button
              type="button"
              aria-pressed={phase.project.completed}
              onClick={() => onToggleTask(phase.id, "project", "project")}
              className="text-xs font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300"
            >
              {phase.project.completed ? "Mark project incomplete" : "Mark project complete"}
            </button>
          </div>
        </details>
        )}
      </div>
    </Card>
  );
};
