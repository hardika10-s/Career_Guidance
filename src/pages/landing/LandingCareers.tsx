import React from "react";
import { ChevronRight } from "lucide-react";
import { LANDING_POPULAR_ROLES } from "./landingData.js";

interface LandingCareersProps { onNavigate: (route: string) => void; }
export const LandingCareers: React.FC<LandingCareersProps> = ({ onNavigate }) => (
      <section id="careers" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Supported Specializations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            15+ Industry Tech Pathways
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Calibrated with real-world technical skills, entry expectations, capstone blueprints, and salary bands.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANDING_POPULAR_ROLES.map((role, rIdx) => (
            <div
              key={rIdx}
              onClick={() => onNavigate("/register")}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {role.category}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                  {role.match}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {role.title}
              </h4>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Starting: {role.salary}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
);
