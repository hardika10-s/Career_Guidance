import React from "react";
import { Button } from "../../components/ui/Button.js";
import { ArrowRight } from "lucide-react";

interface LandingCTAProps { onNavigate: (route: string) => void; }
export const LandingCTA: React.FC<LandingCTAProps> = ({ onNavigate }) => (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="text-center p-5 sm:p-8 lg:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white space-y-5 sm:space-y-6 shadow-xl">
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Map Your Career Trajectory?
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Create your student profile in 2 minutes, identify your exact skill gaps, and start checking off verified roadmap milestones.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              id="bottom-cta-register-btn"
              variant="secondary"
              size="lg"
              onClick={() => onNavigate("/register")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
            >
              Get Started Free
            </Button>
            <Button
              id="bottom-cta-login-btn"
              variant="outline"
              size="lg"
              onClick={() => onNavigate("/login")}
              className="border-white/50 text-white hover:bg-white/10"
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>
);
