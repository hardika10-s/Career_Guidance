import { Terminal, Compass, BarChart3, MapPin, Award, Bot, Sparkles } from "lucide-react";
export const LANDING_STEPS = [
    {
      num: "01",
      icon: Terminal,
      title: "Multidimensional Self-Assessment",
      desc: "Structured diagnostic mapping technical skills, academic performance, problem-solving styles, and career preferences.",
      badge: "Diagnostic",
    },
    {
      num: "02",
      icon: Compass,
      title: "15-Career Compatibility Matching",
      desc: "Vector similarity engine evaluates your profile against 15 industry roles, providing transparent match reasoning.",
      badge: "Vector Matching",
    },
    {
      num: "03",
      icon: BarChart3,
      title: "4-Tier Skill Gap Diagnostic",
      desc: "Granular competency audit categorizing skills into Demonstrated, Developing, Priority Gaps, and Advanced Targets.",
      badge: "Gap Matrix",
    },
    {
      num: "04",
      icon: MapPin,
      title: "Personalized 5-Phase Roadmaps",
      desc: "Curated progression from core computational theory to production-grade full-stack capstones with verified milestones.",
      badge: "Curriculum",
    },
    {
      num: "05",
      icon: Award,
      title: "Verifiable Proof-of-Skills",
      desc: "Transform claimed abilities into demonstrated evidence backed by GitHub repositories, live deployments, and credentials.",
      badge: "Portfolio",
    },
    {
      num: "06",
      icon: Bot,
      title: "AI Interview Arena & ATS Scanner",
      desc: "Simulate technical and behavioral interview rounds with rubric evaluation alongside instant resume ATS keyword scoring.",
      badge: "Simulation",
    },
  ];

  export const LANDING_FEATURES = [
    {
      icon: Compass,
      color: "blue",
      title: "Explainable Career Discovery",
      desc: "Transparent recommendation algorithms explain why a role matches your profile, highlighting exact strengths and missing competencies.",
    },
    {
      icon: BarChart3,
      color: "indigo",
      title: "Visual Skill Gap Diagnostics",
      desc: "Targeted skill benchmarks mapped directly to curated free educational courses, certifications, and documentation.",
    },
    {
      icon: MapPin,
      color: "emerald",
      title: "Adaptive 5-Phase Roadmaps",
      desc: "Milestone-by-milestone actionable task checklists that adjust to your graduation timeline and target engineering specialization.",
    },
    {
      icon: Award,
      color: "amber",
      title: "Verifiable Evidence Portfolio",
      desc: "Ground your achievements in verifiable artifact links—GitHub repositories, deployed web applications, and technical certifications.",
    },
    {
      icon: Bot,
      color: "violet",
      title: "AI Mock Interview Arena",
      desc: "Practice role-specific technical questions with automated evaluation across conceptual accuracy, system design, and communication.",
    },
    {
      icon: Sparkles,
      color: "rose",
      title: "6-Factor Employability Score",
      desc: "A transparent composite index evaluating skills, academics, proof-of-work, roadmap progress, interview performance, and resume ATS quality.",
    },
  ];

  export const LANDING_POPULAR_ROLES = [
    { title: "Software Developer", category: "Engineering", match: "94% Match", salary: "$75k - $95k" },
    { title: "Frontend Engineer", category: "Web", match: "89% Match", salary: "$70k - $90k" },
    { title: "Backend Engineer", category: "Systems", match: "91% Match", salary: "$80k - $105k" },
    { title: "Full-Stack Developer", category: "Full-Stack", match: "88% Match", salary: "$78k - $100k" },
    { title: "Data Scientist", category: "AI & Data", match: "85% Match", salary: "$85k - $115k" },
    { title: "Cloud / DevOps Engineer", category: "Cloud", match: "87% Match", salary: "$82k - $110k" },
    { title: "Machine Learning Engineer", category: "AI & ML", match: "83% Match", salary: "$90k - $125k" },
    { title: "Cybersecurity Analyst", category: "Security", match: "80% Match", salary: "$75k - $100k" },
  ];
