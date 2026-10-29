import React from "react";
import { Button } from "../../components/ui/Button.js";
import { ArrowRight, Sparkles, BarChart3, Award, Bot, GraduationCap, Briefcase } from "lucide-react";

interface LandingHeroProps { onNavigate: (route: string) => void; }
export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate }) => (
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle ambient light gradient background */}
        <div className="absolute inset-0 pointer-events-none -z-10 flex justify-center">
          <div className="w-[800px] h-[400px] bg-gradient-to-tr from-blue-400/15 via-indigo-400/10 to-transparent dark:from-blue-600/10 dark:via-indigo-600/10 rounded-full blur-3xl opacity-70 transform -translate-y-1/2" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Framework pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 text-xs font-bold text-blue-800 dark:text-blue-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Academic & Industry Employability Intelligence Framework</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
            Transform Academic Potential Into <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300">
              Confirmed Employability Readiness.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Bridge the gap between university coursework and tech industry expectations. Our full-stack platform delivers transparent 4-tier skill-gap diagnostics, 5-phase career progression roadmaps, verified evidence portfolios, and AI mock interview simulations.
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Button
              id="hero-get-started-btn"
              size="lg"
              variant="primary"
              onClick={() => onNavigate("/register")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shadow-md hover:shadow-lg"
            >
              Start Free Assessment
            </Button>
            <Button
              id="hero-demo-login-btn"
              size="lg"
              variant="outline"
              onClick={() => onNavigate("/login")}
              leftIcon={<GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            >
              Existing Student Sign In
            </Button>
          </div>

          {/* Trust Highlights Row */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">15+ Tech Careers</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Industry Calibrated</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">6-Factor Score</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Objective Readiness</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Proof of Skills</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">GitHub & Deploy Links</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Mock Arena</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Automated Rubrics</div>
              </div>
            </div>
          </div>
        </div>
      </section>
);
