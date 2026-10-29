import React from "react";
import { Circle, FileCode2, RotateCcw } from "lucide-react";
import { CODE_LANGUAGES, highlightCode } from "./interviewConfig.js";

interface InterviewCodeEditorProps {
  codeLanguage: string;
  codingSnippet: string;
  setCodingSnippet: React.Dispatch<React.SetStateAction<string>>;
  isSending: boolean;
  isLoadingStarterCode: boolean;
  activeQuestion: any;
  handleCodeLanguageChange: (language: string, question: any) => void;
  requestStarterCode: (question: any, language: string) => void;
  editorLineCount: number;
  editorScroll: { top: number; left: number };
  setEditorScroll: React.Dispatch<React.SetStateAction<{ top: number; left: number }>>;
  submissionIdRef: { current: string | null };
  setPendingCandidateTurn: React.Dispatch<React.SetStateAction<any>>;
  setAnswerRetryMessage: React.Dispatch<React.SetStateAction<string>>;
  codeDraftsRef: { current: Record<string, { code: string; starter: string }> };
  starterTemplateRef: { current: string };
  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
  codeEditorNotice: string;
}

export const InterviewCodeEditor: React.FC<InterviewCodeEditorProps> = ({
  codeLanguage,
  codingSnippet,
  setCodingSnippet,
  isSending,
  isLoadingStarterCode,
  activeQuestion,
  handleCodeLanguageChange,
  requestStarterCode,
  editorLineCount,
  editorScroll,
  setEditorScroll,
  submissionIdRef,
  setPendingCandidateTurn,
  setAnswerRetryMessage,
  codeDraftsRef,
  starterTemplateRef,
  handleKeyDown,
  codeEditorNotice,
}) => {
  const editorVisibleLines = 10;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0B1020] shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 bg-slate-800/90 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileCode2 className="h-4 w-4 shrink-0 text-blue-400" />
          <span className="truncate text-xs font-semibold text-slate-200">
            solution.{({ python: "py", javascript: "js", typescript: "ts", java: "java", cpp: "cpp", sql: "sql" } as Record<string, string>)[codeLanguage] || "txt"}
          </span>
          {isLoadingStarterCode && <span className="text-[11px] text-blue-300">Preparing starter…</span>}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="interview-code-language" className="sr-only">Code language</label>
          <select
            id="interview-code-language"
            value={codeLanguage}
            disabled={isSending || isLoadingStarterCode}
            onChange={(event) => handleCodeLanguageChange(event.target.value, activeQuestion)}
            className="min-h-9 rounded-lg border border-slate-600 bg-slate-900 px-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CODE_LANGUAGES.map((lang) => <option key={lang.id} value={lang.id}>{lang.label}</option>)}
          </select>
          <button
            type="button"
            onClick={() => requestStarterCode(activeQuestion, codeLanguage)}
            disabled={isSending || isLoadingStarterCode}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-blue-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset starter
          </button>
        </div>
      </div>

      <div className="flex shrink-0 overflow-hidden bg-[#0B1020]" style={{ height: `${editorVisibleLines * 24 + 24}px` }}>
        <div aria-hidden="true" className="w-11 shrink-0 overflow-hidden border-r border-slate-800 bg-[#0E1528] pt-3 text-right font-mono text-xs leading-6 text-slate-500">
          <div style={{ transform: `translateY(-${editorScroll.top}px)` }}>
            {Array.from({ length: Math.max(editorLineCount, editorVisibleLines) }, (_, index) => (
              <div key={index} className="h-6 select-none pr-2">{index + 1}</div>
            ))}
          </div>
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <pre aria-hidden="true" className="pointer-events-none absolute left-0 top-0 m-0 whitespace-pre p-3 font-mono text-xs leading-6" style={{ tabSize: 4, width: "max-content", minWidth: "100%", transform: `translate(${-editorScroll.left}px, -${editorScroll.top}px)` }}>
            {highlightCode(codingSnippet, codeLanguage)}{"\n"}
          </pre>
          <textarea
            value={codingSnippet}
            onChange={(event) => {
              submissionIdRef.current = null;
              setPendingCandidateTurn(null);
              setAnswerRetryMessage("");
              setCodingSnippet(event.target.value);
              codeDraftsRef.current[codeLanguage] = {
                code: event.target.value,
                starter: starterTemplateRef.current,
              };
            }}
            onKeyDown={handleKeyDown}
            onScroll={(event) => setEditorScroll({ top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft })}
            aria-label={`${CODE_LANGUAGES.find((item) => item.id === codeLanguage)?.label || "Code"} solution editor`}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            disabled={isSending || isLoadingStarterCode}
            style={{ tabSize: 4 }}
            className="code-editor-input relative z-10 block h-full min-h-0 w-full resize-none overflow-auto whitespace-pre border-0 bg-transparent p-3 font-mono text-xs leading-6 text-transparent caret-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 selection:bg-blue-500/20 selection:text-transparent disabled:cursor-wait"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-900 px-3 py-1.5 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5"><Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" /> Editor ready</span>
        <span>{editorLineCount} lines · AI review on submit</span>
      </div>
      {codeEditorNotice && <p role="status" className="border-t border-amber-900/60 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-200">{codeEditorNotice}</p>}
    </div>
  );
};
