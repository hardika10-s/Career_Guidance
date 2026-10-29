import React from "react";
import {
  Code,
  Compass,
  Layers,
  MessageSquare,
  Sparkles,
  Terminal,
} from "lucide-react";

export const TARGET_ROLES = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Data Analyst",
  "Machine Learning Engineer",
  "Cloud / DevOps Engineer",
  "Cybersecurity Analyst",
];

export const INTERVIEW_FORMATS = [
  {
    id: "Technical Interview",
    label: "Technical Interview",
    icon: Code,
    desc: "Core programming fundamentals, databases, APIs, algorithms, and practical debugging.",
    category: "Technical",
  },
  {
    id: "Coding and Problem-Solving Interview",
    label: "Coding & Problem-Solving",
    icon: Terminal,
    desc: "Algorithmic challenges with code input, time/space complexity analysis, and edge cases.",
    category: "Coding",
  },
  {
    id: "System Design Interview",
    label: "System Design Interview",
    icon: Layers,
    desc: "High-level architecture, scalability, database modeling, caching, and trade-offs.",
    category: "Architecture",
  },
  {
    id: "Behavioral Interview",
    label: "Behavioral Interview (STAR)",
    icon: MessageSquare,
    desc: "Workplace scenarios, teamwork, deadlines, conflicts, and past roadblock resolution.",
    category: "Behavioral",
  },
  {
    id: "HR Interview",
    label: "HR & Culture Interview",
    icon: Compass,
    desc: "Career motivation, work style preferences, team fit, and long-term professional goals.",
    category: "Culture",
  },
  {
    id: "Mixed Interview",
    label: "Mixed Full-Loop Interview",
    icon: Sparkles,
    desc: "Comprehensive blend across technical architecture, coding scenario, and behavioral STAR stories.",
    category: "Comprehensive",
  },
];

export const CODE_LANGUAGES = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "sql", label: "SQL" },
];

export const isCodingQuestion = (sessionFormat: string, question?: any) => {
  const category = String(question?.evaluationFormat || question?.type || "").toLowerCase();
  return sessionFormat.toLowerCase().includes("coding") || category.includes("coding") || category === "problem-solving";
};

export const createLanguageStarter = (language: string, question?: any) => {
  const prompt = String(question?.questionText || question?.question || "the problem").replace(/\s+/g, " ").slice(0, 180);
  const safeComment = prompt.replace(/[\r\n]/g, " ");
  switch (language) {
    case "javascript": return `function solve() {\n  // TODO: ${safeComment}\n  return undefined;\n}\n`;
    case "typescript": return `function solve(): unknown {\n  // TODO: ${safeComment}\n  return undefined;\n}\n`;
    case "java": return `class Solution {\n    public Object solve() {\n        // TODO: ${safeComment}\n        return null;\n    }\n}\n`;
    case "cpp": return `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // TODO: ${safeComment}\n    }\n};\n`;
    case "sql": return `-- TODO: ${safeComment}\nSELECT 1 AS result;\n`;
    default: return `def solve():\n    # TODO: ${safeComment}\n    pass\n`;
  }
};

export const highlightCode = (source: string, language: string) => {
  const tokenPattern = /(\/\/[^\n]*|--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:as|async|await|break|case|catch|class|const|def|else|export|extends|false|finally|for|from|function|if|implements|import|in|interface|let|new|null|pass|private|public|return|self|static|this|throw|true|try|type|var|void|while|with)\b|\b\d+(?:\.\d+)?\b)/g;
  const keywords = new Set(["as", "async", "await", "break", "case", "catch", "class", "const", "def", "else", "export", "extends", "false", "finally", "for", "from", "function", "if", "implements", "import", "in", "interface", "let", "new", "null", "pass", "private", "public", "return", "self", "static", "this", "throw", "true", "try", "type", "var", "void", "while", "with"]);
  return source.split(tokenPattern).map((part, index) => {
    let color = "text-slate-200";
    if (part.startsWith("//") || part.startsWith("#") || part.startsWith("--") || part.startsWith("/*")) color = "text-slate-500 italic";
    else if (/^["'`]/.test(part)) color = "text-emerald-300";
    else if (/^\d/.test(part)) color = "text-amber-300";
    else if (keywords.has(part)) color = "text-sky-300";
    else if (language === "sql" && /^(select|from|where|join|on|group|by|order|having|as|with)$/i.test(part)) color = "text-violet-300";
    return <span key={index} className={color}>{part}</span>;
  });
};

export const removeCodeFence = (text: string) => text.replace(/\n?```[\w+-]*\n[\s\S]*?```\s*$/, "").trim();
export const extractCodeFence = (text: string) => text.match(/```[\w+-]*\n([\s\S]*?)```/)?.[1] || "";
