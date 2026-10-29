import React, { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { CareerProfile } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import { GraduationCap, Layers, ArrowRight, Award, RefreshCw, Star } from "lucide-react";

interface PortfolioProject {
  id: string;
  title: string;
  difficulty: string;
  skills: string[];
  description: string;
  deliverables: string[];
}

const FAVORITES_KEY = "career_framework_project_favorites";
const PROJECT_CACHE_PREFIX = "career_framework_projects_v1";

const getProjectCacheKey = (profile: CareerProfile) =>
  `${PROJECT_CACHE_PREFIX}:${profile.userId || profile.id}:${(profile.currentDirection || "software-developer").toLowerCase()}`;

export const LearningHubPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const toast = useToast();
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateProjects = useCallback(async (currentProfile: CareerProfile, notify = false) => {
    try {
      const result = await api.learning.generateProjects();
      const nextProjects = result.projects || [];
      setProjects(nextProjects);
      try {
        localStorage.setItem(getProjectCacheKey(currentProfile), JSON.stringify({
          careerTitle: result.careerTitle,
          projects: nextProjects,
          savedAt: Date.now(),
        }));
      } catch {
        // Keep the generated projects available for this visit if storage is unavailable.
      }
      if (notify) toast.success(`Generated ${nextProjects.length} new projects for ${result.careerTitle}.`);
    } catch (err: any) {
      toast.error("Unable to generate role-specific projects: " + err.message);
    }
  }, [toast.success, toast.error]);

  const loadInitialProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentProfile: CareerProfile = await api.profile.get();
      setProfile(currentProfile);
      let cached: any = null;
      try {
        cached = JSON.parse(localStorage.getItem(getProjectCacheKey(currentProfile)) || "null");
      } catch {
        cached = null;
      }
      if (Array.isArray(cached?.projects) && cached.projects.length > 0) {
        setProjects(cached.projects);
      } else {
        await generateProjects(currentProfile);
      }
    } catch (err: any) {
      toast.error("Failed to load project recommendations: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [generateProjects, toast.error]);

  const refreshProjects = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const currentProfile = profile || await api.profile.get();
      if (!profile) setProfile(currentProfile);
      await generateProjects(currentProfile, true);
    } finally {
      setIsRefreshing(false);
    }
  }, [generateProjects, profile]);

  useEffect(() => {
    void loadInitialProjects();
  }, [loadInitialProjects]);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const visibleProjects = projects.filter((project) => !showFavoritesOnly || favorites.includes(project.id));
  const favoriteCount = projects.reduce((count, project) => count + (favorites.includes(project.id) ? 1 : 0), 0);

  if (isLoading) return <LoadingState message="Loading your saved project recommendations..." />;

  return (
    <div id="learning-hub-page" className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Gemini Career Projects
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Learning & Projects Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            10–15 project ideas matched to {profile?.currentDirection || "your target role"}.
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" className="w-full whitespace-nowrap sm:w-auto" onClick={() => setShowFavoritesOnly((value) => !value)} leftIcon={<Star className="w-3.5 h-3.5" />}>
            {showFavoritesOnly ? "Show All" : `Favorites (${favoriteCount})`}
          </Button>
          <Button id="learning-refresh-projects-btn" variant="primary" size="sm" className="w-full whitespace-nowrap sm:w-auto" isLoading={isRefreshing} onClick={() => void refreshProjects()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Projects
          </Button>
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <Card className="p-5 sm:p-8 text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">{showFavoritesOnly ? "You have no favorite projects yet." : "No project recommendations are available."}</p>
          {showFavoritesOnly ? <Button variant="outline" size="sm" onClick={() => setShowFavoritesOnly(false)}>Show All Projects</Button> : <Button variant="primary" size="sm" isLoading={isRefreshing} onClick={() => void refreshProjects()}>Try Again</Button>}
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recommended Portfolio Projects</h3>
            <span className="text-xs text-slate-500">({visibleProjects.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleProjects.map((project, idx) => (
              <Card key={project.id} variant="default" className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project #{idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.difficulty === "Advanced" ? "danger" : "primary"} size="sm">{project.difficulty}</Badge>
                      <button type="button" aria-label={favorites.includes(project.id) ? "Remove from favorites" : "Add to favorites"} title={favorites.includes(project.id) ? "Remove favorite" : "Add favorite"} onClick={() => toggleFavorite(project.id)} className="p-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/40">
                        <Star className={`w-4 h-4 ${favorites.includes(project.id) ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{project.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">{(project.skills || []).map((skill) => <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">{skill}</span>)}</div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Suggested deliverables:</span>
                    {(project.deliverables || []).map((item) => <p key={item} className="text-slate-500">• {item}</p>)}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full whitespace-nowrap" onClick={() => onNavigate("/evidence")} leftIcon={<Award className="w-3.5 h-3.5" />} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Submit Project as Evidence
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
