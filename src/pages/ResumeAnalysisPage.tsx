import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  Target,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const ResumeAnalysisPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const toast = useToast();

  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Developer");
  const [catalogRoles, setCatalogRoles] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    // Load career catalog titles and past analyses
    const init = async () => {
      try {
        const [catalogRes, historyRes] = await Promise.all([
          api.careers.getCatalog(),
          api.resume.getHistory(),
        ]);
        if (Array.isArray(catalogRes)) {
          setCatalogRoles(catalogRes.map((r: any) => r.title));
        }
        if (Array.isArray(historyRes)) {
          setHistory(historyRes);
          if (historyRes.length > 0 && !analysisResult) {
            setAnalysisResult(historyRes[0]);
          }
        }
      } catch (err: any) {
        console.warn("Failed to load resume initial data:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    init();
  }, []);

  const handleSampleResume = () => {
    setResumeText(`Jane Doe
Software Developer | jane@example.com | github.com/janedoe | linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Motivated Computer Science graduate with hands-on experience building full-stack web applications, REST APIs, and scalable database architectures. Strong foundation in data structures, algorithms, and agile team methodologies.

EDUCATION
Bachelor of Science in Computer Science & Engineering
Tech State University, Graduated May 2026 | CGPA: 3.8 / 4.0

TECHNICAL SKILLS
- Languages: Python, JavaScript, TypeScript, SQL, Java
- Frameworks & Libraries: React, Node.js, Express, FastAPI, Tailwind CSS
- Databases: PostgreSQL, SQLite, Redis
- Tools & DevOps: Git, Docker, Postman, Jest, Linux, REST APIs

PRACTICAL PROJECTS
Campus Resource Planning Platform | React, FastAPI, PostgreSQL
- Developed responsive multi-tenant web application handling role-based access for 1,200 active campus users.
- Designed relational database schemas and indexed foreign keys, reducing query execution latency by 35%.
- Implemented JWT authentication and automated integration test suites with 88% branch coverage.

Rate-Limited API Gateway Service | Node.js, Express, Redis
- Engineered reverse-proxy API gateway processing up to 450 requests per second with token-bucket rate limiting.
- Containerized microservice deployment using Docker and automated build checks.`);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      toast.error("Please paste at least 50 characters of resume content to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await api.resume.analyze({
        resumeText,
        targetRole,
        fileName: "Pasted_Resume",
      });
      setAnalysisResult(data);
      toast.success("Resume evaluated against industry benchmarks!");
      // Refresh history
      const hist = await api.resume.getHistory();
      if (Array.isArray(hist)) setHistory(hist);
    } catch (err: any) {
      toast.error("Resume analysis failed: " + (err.message || "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="resume-analysis-page" className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Resume Intelligence & ATS Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Resume Match & Skill Parser
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            The local Python analyzer checks your resume against role requirements, section completeness, and measurable impact.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleSampleResume}
          >
            Load Sample Resume
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onNavigate("/roadmap")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Career Roadmap
          </Button>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" /> Target Career Role
              </h2>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full sm:w-auto max-w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                {catalogRoles.length > 0 ? (
                  catalogRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))
                ) : (
                  <>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="AI Engineer">AI Engineer</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paste Resume Text (Markdown, Plain Text, or Extracted PDF)
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here including summary, skills, education, and project bullet points..."
                rows={12}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-800 dark:text-slate-200 leading-relaxed"
              />
            </div>

            <Button
              id="analyze-resume-btn"
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Analyze Resume
            </Button>
          </Card>

          {/* Past Analyses */}
          {history.length > 1 && (
            <Card className="p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Previous Analysis History
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-sidebar-scroll">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAnalysisResult(item)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                      analysisResult?.id === item.id
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{item.targetRole || "Software Developer"}</span>
                      <span className="block text-[10px] text-slate-400">{new Date(item.analyzedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={item.overallScore >= 75 ? "success" : item.overallScore >= 55 ? "warning" : "neutral"} size="sm">
                      {item.overallScore}% Score
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-6 space-y-4">
          {analysisResult ? (
            <div className="space-y-4">
              {/* Score Overview Card */}
              <Card variant="highlight" className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      ATS Benchmark Score
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {analysisResult.targetRole || targetRole}
                    </h2>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl shadow-md">
                    {analysisResult.overallScore}%
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-blue-100 dark:border-blue-900/50">
                  <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Completeness</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{analysisResult.completenessScore}%</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Skill Match</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{analysisResult.keywordMatchScore}%</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Action Impact</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{analysisResult.impactScore}%</span>
                  </div>
                </div>
              </Card>

              {/* Detected Skills vs Missing Skills */}
              <Card className="p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Detected Competencies ({analysisResult.detectedSkills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysisResult.detectedSkills || []).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing Role Competencies ({analysisResult.missingSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.missingSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Resume Sections Check */}
              <Card className="p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Standard Section Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(() => {
                    const sectionsList = Array.isArray(analysisResult.sections)
                      ? analysisResult.sections
                      : typeof analysisResult.sections === "object" && analysisResult.sections !== null
                      ? Object.entries(analysisResult.sections).map(([key, val]: [string, any]) => ({
                          name: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
                          found: typeof val === "boolean" ? val : Boolean(val?.found ?? val?.status === "complete"),
                        }))
                      : [];
                    return sectionsList.map((sec: any) => (
                      <div
                        key={sec.name}
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          (sec.found ?? sec.status === "complete")
                            ? "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                            : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400"
                        }`}
                      >
                        <span className="font-medium">{sec.name}</span>
                        <span className="font-bold text-[10px] uppercase">
                          {(sec.found ?? sec.status === "complete") ? "✓ Included" : "✗ Missing"}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </Card>

              {/* Actionable Suggestions */}
              {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                <Card className="p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Actionable Recommendations
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {analysisResult.suggestions.map((sug: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Bullet Point Rewrites */}
              {analysisResult.bulletPointRewrites && analysisResult.bulletPointRewrites.length > 0 && (
                <Card className="p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> High-Impact Bullet Point Rewrites
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.bulletPointRewrites.map((item: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                        <div className="text-slate-400 text-[11px] line-through">
                          {item.original}
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">➔</span>
                          <span>{item.improved}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-5 sm:p-10 text-center space-y-3 flex flex-col items-center justify-center min-h-[240px] sm:min-h-[350px]">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Resume Analysis Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Paste your resume text on the left and select your target role to evaluate your ATS readiness and skill match.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
