import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { ProgressTimelineItem } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import { EmptyState } from "../components/ui/EmptyState.js";
import {
  Clock,
  CheckCircle2,
  Award,
  Bot,
  MapPin,
  Compass,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const ProgressTimelinePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const toast = useToast();

  const [timeline, setTimeline] = useState<ProgressTimelineItem[]>([]);
  const [filter, setFilter] = useState<"all" | "milestone" | "evidence" | "interview" | "assessment">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.progress
      .getTimeline()
      .then((data) => setTimeline(data || []))
      .catch((err) => toast.error("Failed to load progress timeline: " + err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading career progress history..." />;
  }

  const filteredItems = timeline.filter((item) => {
    if (filter === "all") return true;
    const cat = (item.category || item.type || "").toLowerCase();
    if (filter === "milestone") return cat === "milestone" || cat === "roadmap";
    return cat === filter.toLowerCase();
  });

  const getIcon = (cat: string) => {
    const c = (cat || "").toLowerCase();
    switch (c) {
      case "evidence": return <Award className="w-4 h-4 text-indigo-600" />;
      case "interview": return <Bot className="w-4 h-4 text-rose-600" />;
      case "assessment": return <Compass className="w-4 h-4 text-blue-600" />;
      case "roadmap":
      case "milestone":
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div id="progress-timeline-page" className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Chronological Record
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Progress & Milestone History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive audit trail of completed roadmap deliverables, verified evidence artifacts, and simulation scores.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onNavigate("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          All Activity ({timeline.length})
        </button>
        <button
          onClick={() => setFilter("milestone")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "milestone"
              ? "bg-emerald-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => setFilter("evidence")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "evidence"
              ? "bg-purple-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-purple-700 dark:text-purple-400"
          }`}
        >
          Evidence Logged
        </button>
        <button
          onClick={() => setFilter("interview")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "interview"
              ? "bg-rose-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-700 dark:text-rose-400"
          }`}
        >
          Interview Simulations
        </button>
      </div>

      {/* Timeline Items */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No timeline events in this category"
          description="Complete roadmap tasks or submit project evidence to build your chronological record."
          actionText="View Roadmap"
          onAction={() => onNavigate("/roadmap")}
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              variant="default"
              className="p-4 sm:p-5 flex items-start gap-4 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <Badge variant="neutral" size="sm">
                      {item.category}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
