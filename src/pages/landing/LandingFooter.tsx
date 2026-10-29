import React from "react";
import { Compass } from "lucide-react";

export const LandingFooter: React.FC = () => (
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="text-center sm:text-left space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>AI-Based Career Guidance Framework for Employability Development</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Academic & Industry Employability Intelligence System
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">Python FastAPI</span>
            <span>•</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">React 19</span>
            <span>•</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">TypeScript</span>
            <span>•</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">SQLite</span>
            <span>•</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">Tailwind CSS</span>
            <span>•</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">Gemini AI</span>
          </div>
        </div>
      </footer>
);
