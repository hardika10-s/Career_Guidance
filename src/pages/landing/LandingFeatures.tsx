import React from "react";
import { Card } from "../../components/ui/Card.js";
import { LANDING_FEATURES } from "./landingData.js";

export const LandingFeatures: React.FC = () => (
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Engineered for Real-World Career Success
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Full-stack career intelligence components designed to diagnose, guide, and verify your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {LANDING_FEATURES.map((f, fIdx) => {
            const Icon = f.icon;
            return (
              <Card
                key={fIdx}
                variant="subtle"
                hoverable
                className="p-4 sm:p-6 space-y-3 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {f.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
);
