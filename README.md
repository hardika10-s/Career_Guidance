# AI-Based Career Guidance Framework for Employability Development

A modern, high-performance React application built with TypeScript, Tailwind CSS, and Vite. The platform delivers comprehensive career development diagnostics, multi-factor career recommendations, skill-gap analysis, milestone roadmaps, proof of skills verification, AI interview arena simulations, resume ATS scoring, and interactive AI career counselor advisement.

---

## 🏛️ Project Architecture

```text
ai-career-guidance-platform/
│
├── src/
│   ├── components/         # Reusable UI components, cards, navigation, layout
│   ├── context/            # AuthContext, ThemeContext, ToastContext
│   ├── data/               # Seed catalog, assessment bank, interview banks, benchmarks
│   ├── hooks/              # Voice and speech synthesis hooks
│   ├── pages/              # Assessment, Discovery, Roadmap, Interview, Resume, Chat, etc.
│   ├── services/           # api.ts and clientBackend.ts engine
│   ├── types/              # Comprehensive TypeScript interfaces
│   ├── App.tsx             # Root routing, route guards, and shell layout
│   ├── main.tsx            # React 19 StrictMode entry point
│   └── index.css           # Global Tailwind CSS styling and dark mode variables
│
├── index.html              # HTML5 entry point with SEO metadata
├── vite.config.ts          # Vite configuration on port 3000
├── tsconfig.json           # TypeScript configuration
├── package.json            # Node.js dependencies and build scripts
└── metadata.json           # Platform capabilities and application metadata
```

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```
The application starts on `http://0.0.0.0:3000`.

### Production Build
```bash
npm run build
npm run preview
```

### Type Checking & Linting
```bash
npm run lint
```

---

## ✨ Core Features & Business Logic

1. **Multi-Factor Career Recommendations**: Evaluates technical competencies, declared interests, academic department relevance, project portfolios, and assessment signals to rank top matching careers.
2. **Adaptive Career Assessment**: Diagnostic questionnaire evaluating algorithmic thinking, systems architecture, problem solving, and professional communication with immediate challenge validation.
3. **Skill-Gap Diagnostics**: Compares candidate proficiency against industry standard benchmarks for 15 key roles, categorizing skills into demonstrated mastery, developing, and essential gaps.
4. **5-Phase Milestone Roadmaps**: Personalized step-by-step career progression covering core foundations, enterprise architecture, capstone project, proof documentation, and interview mastery.
5. **Interactive Interview Arena**: Full mock interview simulation featuring technical questions, behavioral STAR scenarios, coding editor, language templates (Python, TypeScript, Java, Go), real-time coaching hints, and comprehensive post-interview feedback reports.
6. **Resume ATS Analyzer**: Scans resume text for technical keywords, action verbs, quantified achievements, and section completeness, delivering an instant ATS alignment score with bullet rewrites.
7. **AI Career Advisor**: Context-aware advisor capable of answering targeted questions regarding skill gaps, portfolio projects, interview strategies, and resume optimization.
8. **Proof of Skills & Timeline**: Verifiable evidence tracker for GitHub repositories, certifications, and project artifacts linked directly to an employability readiness index.
