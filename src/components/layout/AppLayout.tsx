import React, { useState } from "react";
import { Navbar } from "./Navbar.js";
import { Sidebar } from "./Sidebar.js";
import { useAuth } from "../../context/AuthContext.js";

interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  activeTargetRole?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
  activeTargetRole,
}) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const closeOnDesktopResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setSidebarOpen(false);
    };

    if (!window.matchMedia("(min-width: 1024px)").matches) {
      document.body.style.overflow = "hidden";
    }
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktopResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktopResize);
    };
  }, [sidebarOpen]);

  const showSidebar = !!user && user.isOnboarded && currentRoute !== "/onboarding";

  return (
    <div id="app-root-layout" className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        isSidebarOpen={sidebarOpen}
        activeTargetRole={activeTargetRole}
        onNavigate={onNavigate}
        currentRoute={currentRoute}
      />

      <div className="flex-1 flex w-full">
        {showSidebar && (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={onNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main
          id="main-content-viewport"
          className={`flex-1 min-w-0 transition-all duration-300 ${
            showSidebar ? "lg:ml-64" : ""
          } flex flex-col`}
        >
          <div className="flex-1 w-full max-w-7xl mx-auto px-3 py-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
