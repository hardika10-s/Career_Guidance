import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import {
  InterviewSession,
  InterviewReport,
  ConversationTurn,
  CareerProfile
} from "../types/index.js";
import { useVoiceInterview } from "../hooks/useVoiceInterview.js";
import { InterviewSetupView } from "./interview/InterviewSetupView.js";
import { InterviewReportView } from "./interview/InterviewReportView.js";
import { InterviewWorkspaceView } from "./interview/InterviewWorkspaceView.js";
import { useInterviewHistoryActions } from "./interview/useInterviewHistoryActions.js";
import {
  createLanguageStarter,
  isCodingQuestion,
} from "./interview/interviewConfig.js";
export const InterviewArenaPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const toast = useToast();

  // Navigation / View State: "setup" | "workspace" | "report"
  const [view, setView] = useState<"setup" | "workspace" | "report">("setup");

  // Configuration Setup State
  const [careerTitle, setCareerTitle] = useState(user?.targetCareerId || "Software Developer");
  const [format, setFormat] = useState("Technical Interview");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [mode, setMode] = useState<"realistic" | "coaching">("realistic");

  // Profile Context (for personalization badge)
  const [profile, setProfile] = useState<CareerProfile | null>(null);

  // Active Session State
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [sessionsHistory, setSessionsHistory] = useState<InterviewSession[]>([]);
  const [activeReport, setActiveReport] = useState<InterviewReport | null>(null);

  // Candidate Input in Workspace
  const [answerInput, setAnswerInput] = useState("");
  const [codingSnippet, setCodingSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [pendingCandidateTurn, setPendingCandidateTurn] = useState<(ConversationTurn & { deliveryState: "sending" | "failed" }) | null>(null);
  const [isLoadingStarterCode, setIsLoadingStarterCode] = useState(false);
  const [codeEditorNotice, setCodeEditorNotice] = useState("");
  const [editorScroll, setEditorScroll] = useState({ top: 0, left: 0 });

  // Loading & Async States
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [deleteSessionTarget, setDeleteSessionTarget] = useState<InterviewSession | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [answerRetryMessage, setAnswerRetryMessage] = useState("");

  // Timer & Cockpit Controls
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndEarlyModal, setShowEndEarlyModal] = useState(false);

  // Scroll ref for chat stream
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const startRequestIdRef = useRef<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const startLockRef = useRef(false);
  const starterTemplateRef = useRef("");
  const codeDraftsRef = useRef<Record<string, { code: string; starter: string }>>({});
  const starterRequestSequenceRef = useRef(0);

  // Voice Hook
  const voice = useVoiceInterview({
    onError: (msg) => toast.error(msg),
  });
  const {
    handleViewHistoricalReport,
    handleResumeInterview,
    handleRetake,
    handleDeleteHistorySession,
  } = useInterviewHistoryActions({
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
  });

  // Load user profile & past interview sessions on mount
  useEffect(() => {
    const initData = async () => {
      setIsLoadingHistory(true);
      try {
        const [profData, histData] = await Promise.all([
          api.profile.get().catch(() => null),
          api.interview.getHistory().catch(() => []),
        ]);
        if (profData) {
          setProfile(profData);
          if (profData.currentDirection) {
            setCareerTitle(profData.currentDirection);
          }
        }
        if (Array.isArray(histData)) {
          setSessionsHistory(histData);
        }
      } catch (err: any) {
        toast.error("Failed to load interview history: " + err.message);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    initData();
  }, []);

  // Sync question count with duration selection
  const handleDurationChange = (mins: number) => {
    setDurationMinutes(mins);
    if (mins <= 10) setQuestionCount(3);
    else if (mins <= 20) setQuestionCount(5);
    else setQuestionCount(8);
  };

  // Timer Effect in Workspace
  useEffect(() => {
    let timer: any = null;
    if (view === "workspace" && activeSession && activeSession.status !== "completed") {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [view, activeSession]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (view === "workspace" && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeSession?.conversation, pendingCandidateTurn, isSending, view]);

  // Read question aloud when voice TTS is enabled and new interviewer question arrives
  useEffect(() => {
    if (view === "workspace" && voice.ttsEnabled && activeSession?.conversation) {
      const conv = activeSession.conversation;
      if (conv.length > 0) {
        const lastMsg = conv[conv.length - 1];
        if (lastMsg.role === "interviewer") {
          const speechPrompt = lastMsg.questionText || lastMsg.text;
          voice.speakQuestion(speechPrompt, false);
        }
      }
    }
  }, [activeSession?.conversation, voice.ttsEnabled, view]);

  // Format Elapsed Seconds as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Remaining time calculation
  const totalDurationSecs = durationMinutes * 60;
  const remainingSecs = Math.max(0, totalDurationSecs - elapsedSeconds);

  // -------------------------------------------------------------
  // ACTIONS: START SESSION
  // -------------------------------------------------------------
  const handleStartInterview = async () => {
    if (startLockRef.current) return;
    startLockRef.current = true;
    if (!startRequestIdRef.current) startRequestIdRef.current = crypto.randomUUID();
    setIsStarting(true);
    try {
      const session = await api.interview.startSession({
        careerTitle,
        format,
        difficulty,
        durationMinutes,
        questionCount,
        mode,
        language: codeLanguage,
        requestId: startRequestIdRef.current,
      });

      startRequestIdRef.current = null;
      setActiveSession(session);
      setAnswerInput("");
      setPendingCandidateTurn(null);
      setAnswerRetryMessage("");
      submissionIdRef.current = null;
      setElapsedSeconds(0);
      setView("workspace");
      toast.success("AI Interviewer ready. Let's begin!");

      // If coding format, set initial code template from question or default
      const openingQuestion = session.sessionConfig?.activeQuestion || session.questions?.[0];
      codeDraftsRef.current = {};
      if (isCodingQuestion(format, openingQuestion)) {
        const initialTemplate = openingQuestion?.starterCode || createLanguageStarter(codeLanguage, openingQuestion);
        setCodingSnippet(initialTemplate);
        starterTemplateRef.current = initialTemplate;
        codeDraftsRef.current[codeLanguage] = { code: initialTemplate, starter: initialTemplate };
        setCodeEditorNotice("");
      } else {
        setCodingSnippet("");
        starterTemplateRef.current = "";
      }
    } catch (err: any) {
      if (err.code === "GEMINI_UNAVAILABLE" || (err.message && err.message.includes("GEMINI_API_KEY"))) {
        toast.error("Gemini AI is not configured. Set GEMINI_API_KEY in backend/.env, then restart the backend.");
      } else {
        toast.error("Failed to initialize interview: " + (err.message || "Unknown error"));
      }
    } finally {
      startLockRef.current = false;
      setIsStarting(false);
    }
  };

  const requestStarterCode = async (question: any, language: string) => {
    if (!activeSession || !question?.id) return;
    const requestSequence = ++starterRequestSequenceRef.current;
    setIsLoadingStarterCode(true);
    setCodeEditorNotice("");
    try {
      const result = await api.interview.generateStarterCode(activeSession.id, {
        questionId: question.id,
        language,
      });
      if (requestSequence !== starterRequestSequenceRef.current) return;
      const starter = String(result?.starterCode || "").trim() || createLanguageStarter(language, question);
      setCodingSnippet(starter);
      starterTemplateRef.current = starter;
      codeDraftsRef.current[language] = { code: starter, starter };
    } catch (err: any) {
      if (requestSequence !== starterRequestSequenceRef.current) return;
      const starter = createLanguageStarter(language, question);
      setCodingSnippet(starter);
      starterTemplateRef.current = starter;
      codeDraftsRef.current[language] = { code: starter, starter };
      setCodeEditorNotice("AI starter code was unavailable, so a valid language-specific scaffold was loaded.");
      toast.error("Could not generate the question-specific starter code: " + (err.message || "Please retry."));
    } finally {
      if (requestSequence === starterRequestSequenceRef.current) setIsLoadingStarterCode(false);
    }
  };

  const handleCodeLanguageChange = async (nextLanguage: string, activeQuestion: any) => {
    codeDraftsRef.current[codeLanguage] = {
      code: codingSnippet,
      starter: starterTemplateRef.current,
    };
    setCodeLanguage(nextLanguage);
    const savedDraft = codeDraftsRef.current[nextLanguage];
    if (savedDraft) {
      setCodingSnippet(savedDraft.code);
      starterTemplateRef.current = savedDraft.starter;
      setCodeEditorNotice("");
      return;
    }
    await requestStarterCode(activeQuestion, nextLanguage);
  };

  // -------------------------------------------------------------
  // ACTIONS: SUBMIT CANDIDATE RESPONSE
  // -------------------------------------------------------------
  const handleSubmitMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeSession || isSending) return;

    const trimmedText = answerInput.trim();
    const currentActiveQ = activeSession.sessionConfig?.activeQuestion ||
      activeSession.questions?.[activeSession.questions.length - 1];
    const isCodingFormat = isCodingQuestion(format, currentActiveQ);
    const hasEditedCode = Boolean(codingSnippet.trim()) && codingSnippet !== starterTemplateRef.current;

    if (!trimmedText && (!isCodingFormat || (!hasEditedCode && !submissionIdRef.current))) {
      toast.error("Please enter your answer before submitting.");
      return;
    }

    const submissionId = submissionIdRef.current || crypto.randomUUID();
    submissionIdRef.current = submissionId;
    setAnswerRetryMessage("");
    const alreadyVisible = (activeSession.conversation || []).some(
      (turn) => turn.role === "candidate" && turn.submissionId === submissionId,
    );
    setPendingCandidateTurn(alreadyVisible ? null : {
      id: `pending_${submissionId}`,
      role: "candidate",
      text: trimmedText || "Code solution submitted",
      type: "answer",
      codeSnippet: isCodingFormat ? codingSnippet : undefined,
      language: isCodingFormat ? codeLanguage : undefined,
      submissionId,
      timestamp: new Date().toISOString(),
      deliveryState: "sending",
    });
    setIsSending(true);
    try {
      const res = await api.interview.sendMessage(activeSession.id, {
        answer: trimmedText,
        codeSnippet: isCodingFormat ? codingSnippet : undefined,
        language: codeLanguage,
        questionId: currentActiveQ?.id,
        submissionId,
      });

      submissionIdRef.current = null;
      setPendingCandidateTurn(null);
      setAnswerRetryMessage("");
      setActiveSession(res);
      setAnswerInput("");

      const nextActiveQ = res.sessionConfig?.activeQuestion || res.questions?.[res.questions.length - 1];
      if (nextActiveQ && nextActiveQ.id !== currentActiveQ?.id && !nextActiveQ.isFollowUp) {
        if (isCodingQuestion(format, nextActiveQ)) {
          codeDraftsRef.current = {};
          const starter = nextActiveQ.starterCode || createLanguageStarter(codeLanguage, nextActiveQ);
          setCodingSnippet(starter);
          starterTemplateRef.current = starter;
          codeDraftsRef.current[codeLanguage] = { code: starter, starter };
          setCodeEditorNotice("");
        } else {
          codeDraftsRef.current = {};
          setCodingSnippet("");
          starterTemplateRef.current = "";
        }
      }

      // Check if session completed auto-finalization
      if (res.status === "completed" && res.finalSummary?.overallScore !== undefined) {
        setActiveReport(res.finalSummary);
        setView("report");
        toast.success("Interview completed! Your performance report is ready.");
        // Refresh history
        api.interview.getHistory().then((h) => setSessionsHistory(h || []));
      }
    } catch (err: any) {
      setPendingCandidateTurn((turn) => turn ? { ...turn, deliveryState: "failed" } : turn);
      setAnswerRetryMessage("Your answer is saved. Retry to get feedback and continue this interview.");
      if (err.code === "GEMINI_UNAVAILABLE" || (err.message && err.message.includes("GEMINI_API_KEY"))) {
        toast.error("Gemini AI is not configured. Your answer is preserved; set GEMINI_API_KEY in backend/.env to evaluate.");
      } else {
        toast.error("Failed to submit response: " + (err.message || "Network error") + ". Your answer is preserved; please retry.");
      }
    } finally {
      setIsSending(false);
    }
  };

  // -------------------------------------------------------------
  // ACTIONS: REQUEST COACHING HINT
  // -------------------------------------------------------------
  const handleRequestHint = async () => {
    if (!activeSession || isSending) return;

    setIsSending(true);
    try {
      const res = await api.interview.sendMessage(activeSession.id, {
        requestHint: true,
      });
      setActiveSession(res);
      toast.success("Coaching guidance received.");
    } catch (err: any) {
      toast.error("Could not fetch hint: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // -------------------------------------------------------------
  // ACTIONS: END INTERVIEW EARLY & FINALIZE
  // -------------------------------------------------------------
  const handleEndEarly = async () => {
    if (!activeSession) return;
    setShowEndEarlyModal(false);
    setIsFinalizing(true);

    try {
      const res = await api.interview.endEarly(activeSession.id);
      setActiveSession(res);
      setActiveReport(res.finalSummary);
      setView("report");
      toast.success("Interview session concluded early. Report compiled.");
      // Refresh history
      api.interview.getHistory().then((h) => setSessionsHistory(h || []));
    } catch (err: any) {
      toast.error("Failed to finalize session: " + err.message);
    } finally {
      setIsFinalizing(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  // Copy code utility
  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  if (view === "setup") {
    return (
      <InterviewSetupView
        onNavigate={onNavigate}
        profile={profile}
        careerTitle={careerTitle}
        setCareerTitle={setCareerTitle}
        format={format}
        setFormat={setFormat}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        durationMinutes={durationMinutes}
        handleDurationChange={handleDurationChange}
        questionCount={questionCount}
        mode={mode}
        setMode={setMode}
        sessionsHistory={sessionsHistory}
        isLoadingHistory={isLoadingHistory}
        isStarting={isStarting}
        handleStartInterview={handleStartInterview}
        handleResumeInterview={handleResumeInterview}
        handleViewHistoricalReport={handleViewHistoricalReport}
        handleRetake={handleRetake}
        deleteSessionTarget={deleteSessionTarget}
        setDeleteSessionTarget={setDeleteSessionTarget}
        isDeletingSession={isDeletingSession}
        handleDeleteHistorySession={handleDeleteHistorySession}
      />
    );
  }
  // =========================================================================
  // RENDER: 2. INTERACTIVE WORKSPACE VIEW
  // =========================================================================
  if (view === "workspace" && activeSession) {
    return (
      <InterviewWorkspaceView
        activeSession={activeSession}
        careerTitle={careerTitle}
        format={format}
        difficulty={difficulty}
        mode={mode}
        durationMinutes={durationMinutes}
        questionCount={questionCount}
        elapsedSeconds={elapsedSeconds}
        formatTime={formatTime}
        voice={voice}
        isSending={isSending}
        answerInput={answerInput}
        setAnswerInput={setAnswerInput}
        codingSnippet={codingSnippet}
        setCodingSnippet={setCodingSnippet}
        codeLanguage={codeLanguage}
        copiedCodeIndex={copiedCodeIndex}
        pendingCandidateTurn={pendingCandidateTurn}
        isLoadingStarterCode={isLoadingStarterCode}
        codeEditorNotice={codeEditorNotice}
        editorScroll={editorScroll}
        setEditorScroll={setEditorScroll}
        isFinalizing={isFinalizing}
        answerRetryMessage={answerRetryMessage}
        showEndEarlyModal={showEndEarlyModal}
        setShowEndEarlyModal={setShowEndEarlyModal}
        chatScrollRef={chatScrollRef}
        submissionIdRef={submissionIdRef}
        starterTemplateRef={starterTemplateRef}
        codeDraftsRef={codeDraftsRef}
        setPendingCandidateTurn={setPendingCandidateTurn}
        setAnswerRetryMessage={setAnswerRetryMessage}
        handleCodeLanguageChange={handleCodeLanguageChange}
        requestStarterCode={requestStarterCode}
        handleKeyDown={handleKeyDown}
        handleSubmitMessage={handleSubmitMessage}
        handleRequestHint={handleRequestHint}
        handleEndEarly={handleEndEarly}
        handleCopyCode={handleCopyCode}
      />
    );
  }
  if (view === "report" && activeReport) {
    return (
      <InterviewReportView
        activeReport={activeReport}
        careerTitle={careerTitle}
        format={format}
        onNavigate={onNavigate}
        onBackToSetup={() => {
          setView("setup");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onRetake={() => handleRetake(activeSession || { careerTitle, format, difficulty } as any)}
      />
    );
  }
  return null;
};



