import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.js";
import { ThemeToggle } from "../ui/ThemeToggle.js";
import {
  Compass,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen: boolean;
  activeTargetRole?: string;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  activeTargetRole = "Software Developer",
  onNavigate,
  currentRoute,
}) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header id="app-navbar" className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Sidebar Toggle + Brand Logo */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {user && (
            <button
              id="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="lg:hidden inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="app-sidebar"
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button
            id="brand-logo"
            type="button"
            onClick={() => onNavigate(user ? "/dashboard" : "/")}
            className="flex min-w-0 items-center gap-2 sm:gap-2.5 cursor-pointer select-none group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shadow-blue-500/20 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-[13px] sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                Employability<span className="text-blue-600">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
                Career Guidance Platform
              </span>
            </div>
          </button>
        </div>

        {/* Center: Target Career Pill & Quick AI Advisor (When logged in) */}
        {user && user.isOnboarded && (
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              id="active-career-pill"
              type="button"
              onClick={() => onNavigate("/discovery")}
              className="hidden xl:flex min-w-0 max-w-[34vw] items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/90 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
              title="Active target role focus. Click to explore other career tracks."
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
              <span className="text-slate-500 dark:text-slate-400">Target Role:</span>
              <strong className="min-w-0 truncate text-slate-900 dark:text-slate-100 font-bold">{activeTargetRole}</strong>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/60">
                Active
              </span>
            </button>

            <button
              id="quick-chat-nav-btn"
              onClick={() => onNavigate("/chat")}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors shadow-xs"
              title="Open AI Career Guidance Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Advisor</span>
            </button>
          </div>
        )}

        {/* Right: Actions / User Account Dropdown */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <ThemeToggle size="sm" />

          {user ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none mt-1 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      id="menu-nav-dashboard"
                      onClick={() => { setShowUserDropdown(false); onNavigate("/dashboard"); }}
                      className="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-left"
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </button>

                    <button
                      id="menu-nav-chat"
                      onClick={() => { setShowUserDropdown(false); onNavigate("/chat"); }}
                      className="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-left"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      AI Career Advisor
                    </button>

                    <button
                      id="menu-nav-profile"
                      onClick={() => { setShowUserDropdown(false); onNavigate("/profile"); }}
                      className="w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-left"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile & Settings
                    </button>

                    <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-medium">Theme Mode</span>
                      <ThemeToggle size="sm" showLabel />
                    </div>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      id="menu-logout-btn"
                      onClick={() => { setShowUserDropdown(false); logout(); onNavigate("/"); }}
                      className="w-full px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                onClick={() => onNavigate("/login")}
                className="hidden sm:inline-flex min-h-9 items-center text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 px-3 py-2 transition-colors"
              >
                Sign In
              </button>
              <button
                id="nav-register-btn"
                onClick={() => onNavigate("/register")}
                className="min-h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-500/20"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
