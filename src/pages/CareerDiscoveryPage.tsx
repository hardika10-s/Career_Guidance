import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { CareerRecommendation, CareerProfile } from "../types/index.js";
import { CareerCard } from "../components/cards/CareerCard.js";
import { Button } from "../components/ui/Button.js";
import { Card } from "../components/ui/Card.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import { Compass, RefreshCw, Sparkles, Filter, Target } from "lucide-react";

export const CareerDiscoveryPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, updateLocalUser } = useAuth();
  const toast = useToast();

  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recs, prof] = await Promise.all([
        api.careers.getRecommendations(),
        api.profile.get(),
      ]);
      setRecommendations(recs || []);
      setProfile(prof);
    } catch (err: any) {
      toast.error("Failed to load career recommendations: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const updated = await api.careers.recalculateRecommendations();
      setRecommendations(updated);
      toast.success("Career recommendations recalculated with the local career engine.");
    } catch (err: any) {
      toast.error("Failed to recalculate recommendations.");
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSetTarget = async (careerId: string) => {
    try {
      await api.profile.setTargetCareer(careerId);
      updateLocalUser({ targetCareerId: careerId });
      toast.success("Active target role updated. New personalized roadmap initialized!");
      loadData();
    } catch (err: any) {
      toast.error("Failed to update target career: " + err.message);
    }
  };

  if (isLoading) {
    return <LoadingState message="Matching candidate profile with industry career tracks..." />;
  }

  const currentTargetId = profile?.currentDirection || user?.targetCareerId || "Software Developer";

  return (
    <div id="career-discovery-page" className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Career Discovery Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Matched Career Paths
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ranked by multi-dimensional compatibility with your skills, coursework, and assessment signals.
          </p>
        </div>

        <Button
          id="recalc-recommendations-btn"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={handleRecalculate}
          isLoading={isRecalculating}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
        >
          Recalculate Matches
        </Button>
      </div>

      {/* Career Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Compass className="w-10 h-10 text-blue-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Analyzing Career Tracks...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your profile is being benchmarked across technical roles. Click below to refresh your multi-dimensional compatibility rankings.
            </p>
            <Button size="sm" variant="primary" onClick={handleRecalculate}>
              Calculate Matches
            </Button>
          </div>
        ) : (
          recommendations.map((rec) => {
            const cTarget = (currentTargetId || "").toLowerCase().trim();
            const rTitle = (rec.title || "").toLowerCase().trim();
            const rId = (rec.careerId || "").toLowerCase().trim();
            const isTarget = Boolean(cTarget && ((rTitle && cTarget === rTitle) || (rId && cTarget === rId)));
            return (
              <CareerCard
                key={rec.careerId || rTitle || Math.random().toString()}
                recommendation={rec}
                onExplore={(id) => onNavigate(`/explorer/${id}`)}
                onSetTarget={handleSetTarget}
                isCurrentTarget={isTarget}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
