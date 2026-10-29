import React from "react";
import { Button } from "../../components/ui/Button.js";
import { ThemeToggle } from "../../components/ui/ThemeToggle.js";
import { Compass, ArrowRight, Menu } from "lucide-react";

interface LandingHeaderProps { onNavigate: (route: string) => void; mobileMenuOpen: boolean; setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>; }
export const LandingHeader: React.FC<LandingHeaderProps> = ({ onNavigate, mobileMenuOpen, setMobileMenuOpen }) => (
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate("/")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                Employability<span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1">
                Career Guidance Platform
              </span>
            </div>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#cockpit-preview" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Platform Preview
            </a>
            <a href="#framework" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              6-Step Methodology
            </a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Core Capabilities
            </a>
            <a href="#careers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              15+ Career Tracks
            </a>
            <a href="#comparison" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Why It Works
            </a>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle size="sm" showLabel />
            <Button
              id="landing-signin-btn"
              size="sm"
              variant="outline"
              onClick={() => onNavigate("/login")}
              className="hidden sm:inline-flex"
            >
              Sign In
            </Button>
            <Button
              id="landing-getstarted-btn"
              size="sm"
              variant="primary"
              onClick={() => onNavigate("/register")}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Get Started
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 space-y-2 text-sm font-medium">
            <a
              href="#cockpit-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Platform Preview
            </a>
            <a
              href="#framework"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              6-Step Methodology
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Core Capabilities
            </a>
            <a
              href="#careers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              15+ Career Tracks
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Why It Works
            </a>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("/login");
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </header>
);
