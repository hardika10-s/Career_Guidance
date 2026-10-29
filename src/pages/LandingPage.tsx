import React, { useState } from "react";
import { LandingHeader } from "./landing/LandingHeader.js";
import { LandingHero } from "./landing/LandingHero.js";
import { LandingPreview } from "./landing/LandingPreview.js";
import { LandingFramework } from "./landing/LandingFramework.js";
import { LandingCareers } from "./landing/LandingCareers.js";
import { LandingFeatures } from "./landing/LandingFeatures.js";
import { LandingComparison } from "./landing/LandingComparison.js";
import { LandingCTA } from "./landing/LandingCTA.js";
import { LandingFooter } from "./landing/LandingFooter.js";

export const LandingPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div id="landing-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ========================================================
          1. STICKY TOP NAVIGATION BAR
          ======================================================== */}
      <LandingHeader onNavigate={onNavigate} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* ========================================================
          2. HERO SECTION
          ======================================================== */}
      <LandingHero onNavigate={onNavigate} />

      {/* ========================================================
          3. INTERACTIVE COCKPIT PREVIEW SHOWCASE
          ======================================================== */}
      <LandingPreview onNavigate={onNavigate} />

      {/* ========================================================
          4. THE 6-STEP EMPLOYABILITY METHODOLOGY
          ======================================================== */}
      <LandingFramework />

      {/* ========================================================
          5. 15+ HIGH-DEMAND CAREER PATHWAYS
          ======================================================== */}
      <LandingCareers onNavigate={onNavigate} />

      {/* ========================================================
          6. PLATFORM CORE CAPABILITIES
          ======================================================== */}
      <LandingFeatures />

      {/* ========================================================
          7. SIDE-BY-SIDE COMPARISON: GENERIC AI VS THIS FRAMEWORK
          ======================================================== */}
      <LandingComparison />

      {/* ========================================================
          8. CALL TO ACTION BANNER
          ======================================================== */}
      <LandingCTA onNavigate={onNavigate} />

      {/* ========================================================
          9. ACADEMIC & TECHNICAL FOOTER
          ======================================================== */}
      <LandingFooter />
    </div>
  );
};
