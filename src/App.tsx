import React, { useState, useEffect, Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import { ThemeToggle } from "./components/ui/ThemeToggle.js";
import { AppLayout } from "./components/layout/AppLayout.js";
import { LoadingState } from "./components/ui/LoadingState.js";

// Lazy-loaded page components for optimal bundle splitting and fast initial page render
const LandingPage = lazy(() => import("./pages/LandingPage.js").then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import("./pages/LoginPage.js").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage.js").then(m => ({ default: m.RegisterPage })));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage.js").then(m => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage.js").then(m => ({ default: m.DashboardPage })));
const CareerAssessmentPage = lazy(() => import("./pages/CareerAssessmentPage.js").then(m => ({ default: m.CareerAssessmentPage })));
const CareerDiscoveryPage = lazy(() => import("./pages/CareerDiscoveryPage.js").then(m => ({ default: m.CareerDiscoveryPage })));
const CareerExplorerPage = lazy(() => import("./pages/CareerExplorerPage.js").then(m => ({ default: m.CareerExplorerPage })));
const SkillGapAnalysisPage = lazy(() => import("./pages/SkillGapAnalysisPage.js").then(m => ({ default: m.SkillGapAnalysisPage })));
const PersonalizedRoadmapPage = lazy(() => import("./pages/PersonalizedRoadmapPage.js").then(m => ({ default: m.PersonalizedRoadmapPage })));
const LearningHubPage = lazy(() => import("./pages/LearningHubPage.js").then(m => ({ default: m.LearningHubPage })));
const ProofOfSkillsPage = lazy(() => import("./pages/ProofOfSkillsPage.js").then(m => ({ default: m.ProofOfSkillsPage })));
const InterviewArenaPage = lazy(() => import("./pages/InterviewArenaPage.js").then(m => ({ default: m.InterviewArenaPage })));
const ProgressTimelinePage = lazy(() => import("./pages/ProgressTimelinePage.js").then(m => ({ default: m.ProgressTimelinePage })));
const ProfileSettingsPage = lazy(() => import("./pages/ProfileSettingsPage.js").then(m => ({ default: m.ProfileSettingsPage })));
const ResumeAnalysisPage = lazy(() => import("./pages/ResumeAnalysisPage.js").then(m => ({ default: m.ResumeAnalysisPage })));
const AIChatbotPage = lazy(() => import("./pages/AIChatbotPage.js").then(m => ({ default: m.AIChatbotPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <LoadingState message="Loading module..." />
  </div>
);

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App module boundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-4 max-w-lg mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Page Module Recovered
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The view encountered a temporary issue. Your authentication and profile remain completely intact.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || "/";
  });

  // Keep browser history in sync
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, "", route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingState message="Initializing Career Guidance Framework..." />
      </div>
    );
  }

  // Routing Logic & Protection
  let content: React.ReactNode = null;
  const isAuthRoute = currentRoute === "/login" || currentRoute === "/register";
  const isLandingRoute = currentRoute === "/";

  // Check if authenticated
  if (!user && !isAuthRoute && !isLandingRoute) {
    // Redirect unauthenticated user to login
    content = <LoginPage onNavigate={navigate} />;
  } else if (user && !user.isOnboarded && currentRoute !== "/onboarding") {
    // Prompt onboarding
    content = <OnboardingPage onNavigate={navigate} />;
  } else if (isLandingRoute) {
    content = <LandingPage onNavigate={navigate} />;
  } else if (currentRoute === "/login") {
    content = <LoginPage onNavigate={navigate} />;
  } else if (currentRoute === "/register") {
    content = <RegisterPage onNavigate={navigate} />;
  } else if (currentRoute === "/onboarding") {
    content = <OnboardingPage onNavigate={navigate} />;
  } else if (currentRoute === "/dashboard") {
    content = <DashboardPage onNavigate={navigate} />;
  } else if (currentRoute === "/assessment") {
    content = <CareerAssessmentPage onNavigate={navigate} />;
  } else if (currentRoute === "/discovery") {
    content = <CareerDiscoveryPage onNavigate={navigate} />;
  } else if (currentRoute.startsWith("/explorer")) {
    const parts = currentRoute.split("/");
    const careerParam = parts.length > 2 ? parts[2] : undefined;
    content = <CareerExplorerPage careerIdParam={careerParam} onNavigate={navigate} />;
  } else if (currentRoute === "/skills") {
    content = <SkillGapAnalysisPage onNavigate={navigate} />;
  } else if (currentRoute === "/roadmap") {
    content = <PersonalizedRoadmapPage onNavigate={navigate} />;
  } else if (currentRoute === "/learning") {
    content = <LearningHubPage onNavigate={navigate} />;
  } else if (currentRoute === "/evidence") {
    content = <ProofOfSkillsPage onNavigate={navigate} />;
  } else if (currentRoute === "/interview") {
    content = <InterviewArenaPage onNavigate={navigate} />;
  } else if (currentRoute === "/timeline") {
    content = <ProgressTimelinePage onNavigate={navigate} />;
  } else if (currentRoute === "/profile") {
    content = <ProfileSettingsPage onNavigate={navigate} />;
  } else if (currentRoute === "/resume") {
    content = <ResumeAnalysisPage onNavigate={navigate} />;
  } else if (currentRoute === "/chat") {
    content = <AIChatbotPage onNavigate={navigate} />;
  } else {
    // Fallback to dashboard or landing
    content = user ? <DashboardPage onNavigate={navigate} /> : <LandingPage onNavigate={navigate} />;
  }

  const isPlainPage = isLandingRoute || isAuthRoute || (user && !user.isOnboarded && currentRoute === "/onboarding");

  return (
    <Suspense fallback={<PageLoader />}>
      <ErrorBoundary onReset={() => navigate(user ? "/dashboard" : "/")}>
        {isPlainPage ? (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative transition-colors duration-200">
            {!isLandingRoute && (
              <div className="absolute top-4 right-4 z-50">
                <ThemeToggle showLabel size="sm" />
              </div>
            )}
            {content}
          </div>
        ) : (
          <AppLayout
            currentRoute={currentRoute}
            onNavigate={navigate}
            activeTargetRole={user?.targetCareerId || "Software Developer"}
          >
            {content}
          </AppLayout>
        )}
      </ErrorBoundary>
    </Suspense>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
