import type { Dispatch, SetStateAction } from "react";
import type { ConversationTurn, InterviewReport, InterviewSession } from "../../types/index.js";
import { api } from "../../services/api.js";
import {
  createLanguageStarter,
  extractCodeFence,
  isCodingQuestion,
  removeCodeFence,
} from "./interviewConfig.js";

interface InterviewHistoryActionsOptions {
  toast: { error: (message: string) => void; success: (message: string) => void };
  activeSession: InterviewSession | null;
  deleteSessionTarget: InterviewSession | null;
  isDeletingSession: boolean;
  setActiveSession: Dispatch<SetStateAction<InterviewSession | null>>;
  setActiveReport: Dispatch<SetStateAction<InterviewReport | null>>;
  setCareerTitle: Dispatch<SetStateAction<string>>;
  setFormat: Dispatch<SetStateAction<string>>;
  setDifficulty: Dispatch<SetStateAction<"Beginner" | "Intermediate" | "Advanced">>;
  setMode: Dispatch<SetStateAction<"realistic" | "coaching">>;
  setDurationMinutes: Dispatch<SetStateAction<number>>;
  setQuestionCount: Dispatch<SetStateAction<number>>;
  setAnswerInput: Dispatch<SetStateAction<string>>;
  setCodeLanguage: Dispatch<SetStateAction<string>>;
  setCodingSnippet: Dispatch<SetStateAction<string>>;
  setPendingCandidateTurn: Dispatch<SetStateAction<(ConversationTurn & { deliveryState: "sending" | "failed" }) | null>>;
  setAnswerRetryMessage: Dispatch<SetStateAction<string>>;
  setSessionsHistory: Dispatch<SetStateAction<InterviewSession[]>>;
  setDeleteSessionTarget: Dispatch<SetStateAction<InterviewSession | null>>;
  setIsDeletingSession: Dispatch<SetStateAction<boolean>>;
  setView: Dispatch<SetStateAction<"setup" | "workspace" | "report">>;
  submissionIdRef: { current: string | null };
  codeDraftsRef: { current: Record<string, { code: string; starter: string }> };
  starterTemplateRef: { current: string };
}

export function useInterviewHistoryActions({
  toast,
  activeSession,
  deleteSessionTarget,
  isDeletingSession,
  setActiveSession,
  setActiveReport,
  setCareerTitle,
  setFormat,
  setDifficulty,
  setMode,
  setDurationMinutes,
  setQuestionCount,
  setAnswerInput,
  setCodeLanguage,
  setCodingSnippet,
  setPendingCandidateTurn,
  setAnswerRetryMessage,
  setSessionsHistory,
  setDeleteSessionTarget,
  setIsDeletingSession,
  setView,
  submissionIdRef,
  codeDraftsRef,
  starterTemplateRef,
}: InterviewHistoryActionsOptions) {
  const handleViewHistoricalReport = async (sessionId: string) => {
    try {
      const session = await api.interview.getById(sessionId);
      if (session) {
        setActiveSession(session);
        if (session.finalSummary && session.finalSummary.overallScore !== undefined) {
          setActiveReport(session.finalSummary);
        } else {
          // Keep incomplete legacy records honest; never synthesize scores or feedback.
          setActiveReport({
            overallScore: session.overallScore ?? null,
            tier: session.status === "completed" ? "Completed" : "Incomplete",
            status: session.status,
            questionsAnswered: session.answers?.filter((answer: any) => answer.evaluation)?.length || 0,
            summaryText: "A saved report is not available for this historical session.",
            dimensions: null,
            perQuestionFeedback: [],
            recommendations: [],
          });
        }
        setView("report");
      }
    } catch (err: any) {
      toast.error("Could not load report: " + err.message);
    }
  };

  const handleResumeInterview = async (saved: InterviewSession) => {
    try {
      let session = await api.interview.getById(saved.id);
      if (session.status === "created" && !session.questions?.length) {
        const config = session.sessionConfig || {};
        session = await api.interview.startSession({
          careerTitle: session.careerTitle,
          format: session.format || session.interviewType,
          difficulty: session.difficulty,
          durationMinutes: session.durationMinutes,
          questionCount: session.targetQuestionCount,
          mode: session.mode,
          requestId: config.requestId,
        });
      }
      setActiveSession(session);
      setCareerTitle(session.careerTitle);
      setFormat(session.format || session.interviewType || "Technical Interview");
      setDifficulty(session.difficulty as "Beginner" | "Intermediate" | "Advanced");
      setMode((session.mode || session.sessionConfig?.mode || "realistic") as "realistic" | "coaching");
      setDurationMinutes(session.durationMinutes || 15);
      setQuestionCount(session.targetQuestionCount || 5);
      const pending = (session.answers || []).find((answer: any) => !answer.evaluation);
      const pendingTurn = pending
        ? (session.conversation || []).find((turn: ConversationTurn) => turn.role === "candidate" && turn.submissionId === pending.submissionId)
        : null;
      const pendingText = pendingTurn?.text || pending?.answerText || "";
      setAnswerInput(removeCodeFence(pendingText));
      submissionIdRef.current = pending?.submissionId || null;
      const question = session.sessionConfig?.activeQuestion;
      const sessionFormat = session.format || session.interviewType || "Technical Interview";
      const language = pendingTurn?.language || session.sessionConfig?.codeLanguage || "python";
      setCodeLanguage(language);
      codeDraftsRef.current = {};
      if (isCodingQuestion(sessionFormat, question)) {
        const snippet = pendingTurn?.codeSnippet || extractCodeFence(pending?.answerText || "") || question?.starterCode || createLanguageStarter(language, question);
        setCodingSnippet(snippet);
        const starter = question?.starterCode || createLanguageStarter(language, question);
        starterTemplateRef.current = starter;
        codeDraftsRef.current[language] = { code: snippet, starter };
      } else {
        setCodingSnippet("");
        starterTemplateRef.current = "";
      }
      setPendingCandidateTurn(pending && !pendingTurn ? {
        id: `pending_${pending.submissionId || pending.id}`,
        role: "candidate",
        text: removeCodeFence(pendingText) || "Code solution submitted",
        type: "answer",
        codeSnippet: extractCodeFence(pending?.answerText || "") || undefined,
        language,
        submissionId: pending.submissionId,
        timestamp: pending.timestamp || new Date().toISOString(),
        deliveryState: "failed",
      } : null);
      setAnswerRetryMessage(pending ? "Your saved response still needs evaluation. Retry to continue this interview." : "");
      setView("workspace");
    } catch (err: any) {
      toast.error("Could not resume interview: " + err.message);
    }
  };

  const handleRetake = (pastSession: InterviewSession) => {
    if (pastSession.careerTitle) setCareerTitle(pastSession.careerTitle);
    if (pastSession.format || pastSession.interviewType) {
      setFormat(pastSession.format || pastSession.interviewType || "Technical Interview");
    }
    if (pastSession.difficulty) {
      setDifficulty(pastSession.difficulty as "Beginner" | "Intermediate" | "Advanced");
    }
    setView("setup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteHistorySession = async () => {
    if (!deleteSessionTarget || isDeletingSession) return;
    setIsDeletingSession(true);
    try {
      await api.interview.deleteSession(deleteSessionTarget.id);
      setSessionsHistory((current) => current.filter((session) => session.id !== deleteSessionTarget.id));
      if (activeSession?.id === deleteSessionTarget.id) {
        setActiveSession(null);
        setView("setup");
      }
      setDeleteSessionTarget(null);
      toast.success("Interview deleted from history.");
    } catch (err: any) {
      toast.error("Could not delete interview: " + (err.message || "Please try again."));
    } finally {
      setIsDeletingSession(false);
    }
  };

  return { handleViewHistoricalReport, handleResumeInterview, handleRetake, handleDeleteHistorySession };
}
