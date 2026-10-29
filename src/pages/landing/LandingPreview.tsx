import React from "react";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { ProgressRing } from "../../components/ui/ProgressRing.js";
import { ArrowRight, MapPin, ShieldCheck, Zap, Code, FileText } from "lucide-react";

interface LandingPreviewProps { onNavigate: (route: string) => void; }

export const LandingPreview: React.FC<LandingPreviewProps> = ({ onNavigate }) => (
      <section id="cockpit-preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Interactive System Preview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            The Student Employability Cockpit
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A comprehensive, real-time command center delivering clear guidance rather than mysterious black-box rankings.
          </p>
        </div>

        {/* Mac-style Window Card */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-all">
          {/* Window Titlebar */}
          <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Alex Chen • Candidate Employability Cockpit
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Target: Software Developer
            </div>
          </div>

          {/* Window Body */}
          <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Column: Readiness Ring & Archetype */}
            <div className="lg:col-span-4 rounded-xl p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <ProgressRing
                score={78}
                size={130}
                strokeWidth={11}
                colorVariant="blue"
                label="Readiness"
                sublabel="Score"
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Tier 1: Competitive Candidate
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-1">
                  86% Match for Software Developer
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Strong competency in Python, Modern Web, and Database Architecture.
                </p>
              </div>
            </div>

            {/* Right Column: 3 Metric Cards + Immediate Action Milestone */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Technical Match</span>
                    <Code className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">86%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: "86%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500">5 of 6 core skills demonstrated</p>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Roadmap Progress</span>
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Phase 2 / 5</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "40%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Backend APIs & Architecture</p>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>ATS Resume Score</span>
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">82 / 100</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "82%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Quantified metrics verified</p>
                </div>
              </div>

              {/* Next Immediate Action Item */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Recommended Next Action
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Build high-throughput rate-limited API gateway service & practice 2 technical interview mock rounds.
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onNavigate("/login")}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Explore Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
);
