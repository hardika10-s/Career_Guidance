import React from "react";
import type { ConversationTurn, InterviewSession } from "../../types/index.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { Modal } from "../../components/ui/Modal.js";
import { useVoiceInterview } from "../../hooks/useVoiceInterview.js";
import {
  Bot, User as UserIcon, Sparkles, Lightbulb, Send, Volume2, VolumeX, Clock,
  RotateCcw, Copy, Check,
} from "lucide-react";
import { isCodingQuestion, removeCodeFence } from "./interviewConfig.js";
import { InterviewCodeEditor } from "./InterviewCodeEditor.js";

interface InterviewWorkspaceViewProps {
  activeSession: InterviewSession;
  careerTitle: string;
  format: string;
  difficulty: string;
  mode: "realistic" | "coaching";
  durationMinutes: number;
  questionCount: number;
  elapsedSeconds: number;
  formatTime: (seconds: number) => string;
  voice: ReturnType<typeof useVoiceInterview>;
  isSending: boolean;
  answerInput: string;
  setAnswerInput: React.Dispatch<React.SetStateAction<string>>;
  codingSnippet: string;
  setCodingSnippet: React.Dispatch<React.SetStateAction<string>>;
  codeLanguage: string;
  copiedCodeIndex: number | null;
  pendingCandidateTurn: (ConversationTurn & { deliveryState: "sending" | "failed" }) | null;
  isLoadingStarterCode: boolean;
  codeEditorNotice: string;
  editorScroll: { top: number; left: number };
  setEditorScroll: React.Dispatch<React.SetStateAction<{ top: number; left: number }>>;
  isFinalizing: boolean;
  answerRetryMessage: string;
  showEndEarlyModal: boolean;
  setShowEndEarlyModal: React.Dispatch<React.SetStateAction<boolean>>;
  chatScrollRef: React.Ref<HTMLDivElement>;
  submissionIdRef: { current: string | null };
  starterTemplateRef: { current: string };
  codeDraftsRef: { current: Record<string, { code: string; starter: string }> };
  setPendingCandidateTurn: React.Dispatch<React.SetStateAction<(ConversationTurn & { deliveryState: "sending" | "failed" }) | null>>;
  setAnswerRetryMessage: React.Dispatch<React.SetStateAction<string>>;
  handleCodeLanguageChange: (language: string, question: any) => void;
  requestStarterCode: (question: any, language: string) => void;
  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
  handleSubmitMessage: () => void;
  handleRequestHint: () => void;
  handleEndEarly: () => void;
  handleCopyCode: (text: string, index: number) => void;
}

export const InterviewWorkspaceView: React.FC<InterviewWorkspaceViewProps> = ({
  activeSession,
  careerTitle,
  format,
  difficulty,
  mode,
  durationMinutes,
  questionCount,
  elapsedSeconds,
  formatTime,
  voice,
  isSending,
  answerInput,
  setAnswerInput,
  codingSnippet,
  setCodingSnippet,
  codeLanguage,
  copiedCodeIndex,
  pendingCandidateTurn,
  isLoadingStarterCode,
  codeEditorNotice,
  editorScroll,
  setEditorScroll,
  isFinalizing,
  answerRetryMessage,
  showEndEarlyModal,
  setShowEndEarlyModal,
  chatScrollRef,
  submissionIdRef,
  starterTemplateRef,
  codeDraftsRef,
  setPendingCandidateTurn,
  setAnswerRetryMessage,
  handleCodeLanguageChange,
  requestStarterCode,
  handleKeyDown,
  handleSubmitMessage,
  handleRequestHint,
  handleEndEarly,
  handleCopyCode,
}) => {
  const sessionConfig = activeSession?.sessionConfig || activeSession?.finalSummary?.sessionConfig || {};
  const activeQuestion = sessionConfig.activeQuestion || (activeSession?.questions && activeSession.questions.length > 0 ? activeSession.questions[activeSession.questions.length - 1] : null);
  const isCodingFormat = isCodingQuestion(format, activeQuestion);
  const currentQNum = sessionConfig.currentQuestionIndex || (activeSession?.questions ? activeSession.questions.length : 1);
  const sessionQuestionCount = sessionConfig.targetQuestionCount || questionCount;
  const totalAnswered = (activeSession.answers || []).filter((answer: any) => answer.evaluation && !answer.isFollowUp).length;
  const editorLineCount = Math.max(1, codingSnippet.split("\n").length);
  const hasResponseToSubmit = Boolean(answerInput.trim()) || (
    isCodingFormat && Boolean(codingSnippet.trim()) && codingSnippet !== starterTemplateRef.current
  ) || Boolean(submissionIdRef.current && answerRetryMessage);

  return (
      <div
        id="interview-arena-workspace-view"
        className={`max-w-4xl mx-auto space-y-4 flex flex-col ${
          isCodingFormat ? "min-h-[calc(100dvh-6.5rem)] pb-4" : "h-[calc(100dvh-6.5rem)] min-h-[24rem]"
        }`}
      >
        {/* Sticky Header Cockpit */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              {careerTitle}
            </span>
            <Badge variant="primary" size="sm">
              {format}
            </Badge>
            <Badge variant="neutral" size="sm">
              {difficulty}
            </Badge>
            {mode === "coaching" && (
              <Badge variant="purple" size="sm">
                Coaching Mode
              </Badge>
            )}
            {mode !== "coaching" && <Badge variant="neutral" size="sm">Realistic Mode</Badge>}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{formatTime(elapsedSeconds)}</span>
              <span className="text-slate-400 font-normal">/ {durationMinutes}:00</span>
            </div>

            {/* Question Progress Pill */}
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Question <span className="text-blue-600 dark:text-blue-400 font-black">{Math.min(sessionQuestionCount, currentQNum)}</span> of {sessionQuestionCount}
            </div>

            {/* Spoken TTS Audio Toggle */}
            <button
              type="button"
              onClick={() => voice.setTtsEnabled(!voice.ttsEnabled)}
              title={voice.ttsEnabled ? "Mute Interviewer Voice" : "Enable Interviewer Audio"}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                voice.ttsEnabled
                  ? "bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
            >
              {voice.ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* End Interview Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEndEarlyModal(true)}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              End Interview
            </Button>
          </div>
        </div>

        {/* Active Question Banner / Problem Cockpit */}
        {activeQuestion && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/60 shadow-xs shrink-0 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
                  {activeQuestion.isFollowUp ? "Follow-up" : `Main Question #${Math.min(sessionQuestionCount, currentQNum)}`}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {activeQuestion.topic || "Core Dimension"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isCodingFormat && activeQuestion.starterCode && (
                  <button
                    type="button"
                    onClick={() => requestStarterCode(activeQuestion, codeLanguage)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Starter Code
                  </button>
                )}
                {voice.isSpeechSynthesisSupported && (
                  <button
                    type="button"
                    onClick={() => voice.toggleSpeak(activeQuestion.questionText || activeQuestion.question)}
                    title={voice.isSpeaking ? "Speaking... (click to stop)" : "Listen to Question"}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{voice.isSpeaking ? "Speaking..." : "Listen"}</span>
                  </button>
                )}
                <span className="text-[11px] font-medium text-slate-400">
                  {Math.round(((Math.min(sessionQuestionCount, currentQNum) - 1) / sessionQuestionCount) * 100)}% Complete
                </span>
              </div>
            </div>

            {/* Question Text */}
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {activeQuestion.questionText || activeQuestion.question}
            </p>

            {/* Problem Specifications / Constraints (for coding format) */}
            {activeQuestion.codeContext && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {activeQuestion.codeContext}
              </div>
            )}
          </div>
        )}

        {/* Conversation Stream Scroll Area */}
        <div
          ref={chatScrollRef}
          className={`overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 custom-sidebar-scroll ${
            isCodingFormat ? "h-56 min-h-[12rem] max-h-72 flex-none" : "min-h-0 flex-1"
          }`}
        >
          {(activeSession.conversation || []).map((msg, idx) => {
            const isCoach = msg.role === "coach";
            const isCandidate = msg.role === "candidate";

            return (
              <div
                key={msg.id || idx}
                className={`flex gap-3 animate-in fade-in duration-150 ${
                  isCandidate ? "justify-end" : "justify-start"
                }`}
              >
                {!isCandidate && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-xs ${
                      isCoach
                        ? "bg-indigo-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {isCoach ? <Lightbulb className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 sm:p-4 text-sm sm:text-xs leading-relaxed space-y-2 shadow-xs break-words ${
                    isCandidate
                      ? "bg-blue-600 text-white rounded-tr-none shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
                      : isCoach
                      ? "bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-tl-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none"
                  }`}
                >
                  {/* Sender & Type Badge */}
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-black/5 dark:border-white/5">
                    <span
                      className={`font-bold tracking-tight text-[11px] ${
                        isCandidate ? "text-blue-100" : isCoach ? "text-indigo-700 dark:text-indigo-300" : "text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {isCandidate ? "You (Candidate)" : isCoach ? "Coaching Guidance" : "AI Senior Interviewer"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {msg.isFollowUp && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                          Follow-up Question
                        </span>
                      )}
                      {!isCandidate && voice.isSpeechSynthesisSupported && (
                        <button
                          type="button"
                          onClick={() => voice.toggleSpeak(msg.questionText || msg.text)}
                          title="Read aloud (click to toggle)"
                          className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Body with Code Block Handling */}
                  <div className="whitespace-pre-wrap break-words font-sans text-sm sm:text-xs leading-relaxed">
                    {isCandidate && msg.codeSnippet ? (removeCodeFence(msg.text) || "Code solution submitted") : msg.text}
                    {!isCandidate && (msg.type === "question" || msg.type === "follow_up") &&
                      msg.questionText && msg.questionText !== msg.text && (
                        <div className="mt-2 font-semibold">{msg.questionText}</div>
                      )}
                  </div>

                  {/* Code snippet display if attached */}
                  {msg.codeSnippet && (
                    <div className="relative mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-700">
                      <div className="flex justify-between items-center pb-1 mb-2 border-b border-slate-700 text-[10px] text-slate-400">
                        <span>Language: {msg.language || "Code"}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(msg.codeSnippet!, idx)}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          {copiedCodeIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeIndex === idx ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <code>{msg.codeSnippet}</code>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] pt-1 ${
                      isCandidate ? "text-blue-200 text-right" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {isCandidate && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {pendingCandidateTurn && (
            <div className="flex justify-end gap-3 animate-in fade-in duration-150" aria-live="polite">
              <div className="max-w-[85%] min-w-0 space-y-2 rounded-2xl rounded-tr-none border border-blue-500/30 bg-blue-600 p-3 sm:p-4 text-sm sm:text-xs leading-relaxed text-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-1">
                  <span className="text-[11px] font-bold text-blue-100">You (Candidate)</span>
                  <span className="text-[10px] text-blue-100">
                    {pendingCandidateTurn.deliveryState === "sending" ? "Sending…" : "Needs retry"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words">{pendingCandidateTurn.text}</p>
                {pendingCandidateTurn.codeSnippet && (
                  <pre className="max-w-full overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
                    <code>{pendingCandidateTurn.codeSnippet}</code>
                  </pre>
                )}
                <span className="block text-right text-[10px] text-blue-200">
                  {pendingCandidateTurn.deliveryState === "sending" ? "Waiting for interview feedback" : "Retry evaluation to continue"}
                </span>
              </div>
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                <UserIcon className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* AI Thinking / Formulating Indicator */}
          {isSending && (
            <div className="flex gap-3 justify-start items-center animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Interviewer is evaluating your response and formulating the next turn...</span>
              </div>
            </div>
          )}
        </div>

        {/* Candidate Response Workspace */}
        <Card variant="default" className="p-4 space-y-3 shrink-0 shadow-sm border-slate-200/90 dark:border-slate-800">
          {/* Coding Problem Specific Editor */}
          {isCodingFormat && (
            <InterviewCodeEditor
              codeLanguage={codeLanguage}
              codingSnippet={codingSnippet}
              setCodingSnippet={setCodingSnippet}
              isSending={isSending}
              isLoadingStarterCode={isLoadingStarterCode}
              activeQuestion={activeQuestion}
              handleCodeLanguageChange={handleCodeLanguageChange}
              requestStarterCode={requestStarterCode}
              editorLineCount={editorLineCount}
              editorScroll={editorScroll}
              setEditorScroll={setEditorScroll}
              submissionIdRef={submissionIdRef}
              setPendingCandidateTurn={setPendingCandidateTurn}
              setAnswerRetryMessage={setAnswerRetryMessage}
              codeDraftsRef={codeDraftsRef}
              starterTemplateRef={starterTemplateRef}
              handleKeyDown={handleKeyDown}
              codeEditorNotice={codeEditorNotice}
            />
          )}
          {/* Text Response Area */}
          <div className="space-y-1.5">
            <textarea
              id="interview-candidate-input"
              value={answerInput}
              onChange={(e) => { submissionIdRef.current = null; setPendingCandidateTurn(null); setAnswerRetryMessage(""); setAnswerInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder={
                activeQuestion?.evaluationFormat === "behavioral" || format.includes("Behavioral")
                  ? "Structure your answer using STAR: Situation, Task, Action, Result... (Press Ctrl + Enter to submit)"
                  : isCodingFormat
                  ? "Explain your algorithmic approach, edge cases, and Big-O time/space complexity..."
                  : "Type your answer explaining your reasoning, mechanism, and trade-offs... (Press Ctrl + Enter to submit)"
              }
              rows={isCodingFormat ? 2 : 3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{answerInput.trim() ? answerInput.trim().split(/\s+/).length : 0} words</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* Coaching Mode: Request Hint */}
              {mode === "coaching" && (
                <Button
                  id="request-hint-btn"
                  variant="outline"
                  size="sm"
                  onClick={handleRequestHint}
                  disabled={isSending}
                  leftIcon={<Lightbulb className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Request Hint
                </Button>
              )}

              {/* Submit Answer */}
              <Button
                id="submit-interview-response-btn"
                variant="primary"
                size="sm"
                onClick={handleSubmitMessage}
                disabled={isSending || isLoadingStarterCode || !hasResponseToSubmit}
                isLoading={isSending}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                {answerRetryMessage ? "Retry Evaluation" : "Submit Response"}
              </Button>
            </div>
          </div>
          {answerRetryMessage && (
            <p role="status" className="text-xs text-amber-700 dark:text-amber-300">
              {answerRetryMessage}
            </p>
          )}
        </Card>

        {/* Modal: Confirm End Early */}
        <Modal
          isOpen={showEndEarlyModal}
          onClose={() => setShowEndEarlyModal(false)}
          title="End Interview Simulation Early?"
          description="Are you sure you want to conclude the session ahead of time? An evaluation report will be compiled based on the questions completed so far."
          size="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Questions completed: <strong>{totalAnswered}</strong> of <strong>{sessionQuestionCount}</strong>.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowEndEarlyModal(false)}>
                Resume Interview
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleEndEarly}
                isLoading={isFinalizing}
              >
                Conclude & View Report
              </Button>
            </div>
          </div>
        </Modal>
      </div>

    );
};
