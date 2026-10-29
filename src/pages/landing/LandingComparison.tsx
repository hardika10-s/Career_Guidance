import React from "react";
import { Check, X } from "lucide-react";

export const LandingComparison: React.FC = () => (
      <section id="comparison" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="p-4 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-6 sm:space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Why It Works
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Why Generic AI Chatbots Fail Students
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Standard chatbots produce surface-level text with zero persistent tracking or artifact verification. Our framework delivers deterministic structure, skill benchmarking, and verifiable proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Generic AI Pitfalls */}
            <div className="p-4 sm:p-6 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/90 dark:border-rose-900/40 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                  ✕
                </div>
                <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  Generic AI / Surface Advice
                </h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Ephemeral chat with zero persistent progress tracking or database memory.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Hallucinates 100% matches without identifying missing technical competencies.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>No tangible evidence validation or GitHub repository and deployment linkage.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Superficial conversational loops with no technical interview rubric evaluation.</span>
                </li>
              </ul>
            </div>

            {/* This Employability Framework */}
            <div className="p-4 sm:p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/90 dark:border-blue-900/40 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  This Employability Framework
                </h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Persistent 5-phase customized roadmap stored in database with checkable tasks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Transparent strong factors and missing factors for every role match.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Verifiable Proof of Skills repository tracking real repositories and credentials.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Structured interview evaluation across Technical Depth, Clarity, and Relevance.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
);
