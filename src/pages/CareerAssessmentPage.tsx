import React, { useState, useEffect, useCallback, useRef } from "react";
import { AssessmentIntroView } from "./career-assessment/AssessmentIntroView.js";
import { AssessmentQuestionView } from "./career-assessment/AssessmentQuestionView.js";
import { AssessmentReportView } from "./career-assessment/AssessmentReportView.js";
import { ASSESSMENT_QUESTION_LIMIT } from "./career-assessment/assessmentConfig.js";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import {
  AssessmentQuestion,
  Assessment,
  AssessmentAnswer,
} from "../types/index.js";
import { LoadingState } from "../components/ui/LoadingState.js";

export const CareerAssessmentPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const toast = useToast();

  // Page View Modes: 'intro' | 'active' | 'completed'
  const [viewState, setViewState] = useState<"intro" | "active" | "completed">("intro");

  // Questions and Progress
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [targetRole, setTargetRole] = useState<string>("Software Developer");
  const [canConclude, setCanConclude] = useState<boolean>(false);

  // Loading & Submission State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetchingNext, setIsFetchingNext] = useState<boolean>(false);
  const [completedResult, setCompletedResult] = useState<Assessment | null>(null);
  const [prefetchedNextQuestion, setPrefetchedNextQuestion] = useState<{
    answerKey: string;
    decision: { nextQuestion?: AssessmentQuestion | null; canConclude?: boolean };
  } | null>(null);

  // Modals
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);

  // Skill Validation Challenge State
  const [challengeSelectedOption, setChallengeSelectedOption] = useState<string>("");
  const [isValidatingChallenge, setIsValidatingChallenge] = useState<boolean>(false);
  const [challengeFeedback, setChallengeFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    confidenceBoost: number;
  } | null>(null);
  const [targetCareerUpdated, setTargetCareerUpdated] = useState<string | null>(null);
  const prefetchTimerRef = useRef<number | null>(null);
  const prefetchRequestIdRef = useRef(0);

  const getAnswerKey = (items: AssessmentAnswer[]) => JSON.stringify(
    items.map((answer) => [answer.questionId, answer.selectedOption]),
  );

  const clearQuestionPrefetch = () => {
    if (prefetchTimerRef.current !== null) {
      window.clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
    prefetchRequestIdRef.current += 1;
    setPrefetchedNextQuestion(null);
    setIsFetchingNext(false);
  };

  const prefetchNextQuestion = (currentAnswers: AssessmentAnswer[]) => {
    if (prefetchTimerRef.current !== null) window.clearTimeout(prefetchTimerRef.current);
    const requestId = ++prefetchRequestIdRef.current;
    const answerKey = getAnswerKey(currentAnswers);
    setPrefetchedNextQuestion(null);
    prefetchTimerRef.current = window.setTimeout(async () => {
      prefetchTimerRef.current = null;
      setIsFetchingNext(true);
      try {
        const decision = await api.assessment.getNextQuestion({
          answeredIds: currentAnswers.map((answer) => answer.questionId),
          currentAnswers,
          targetRole,
        });
        if (requestId === prefetchRequestIdRef.current) {
          setPrefetchedNextQuestion({ answerKey, decision });
        }
      } catch {
        // The explicit Next action retries if background preparation fails.
      } finally {
        if (requestId === prefetchRequestIdRef.current) setIsFetchingNext(false);
      }
    }, 250);
  };

  useEffect(() => () => {
    if (prefetchTimerRef.current !== null) window.clearTimeout(prefetchTimerRef.current);
    prefetchRequestIdRef.current += 1;
  }, []);

  // Load active or completed assessment on mount
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [currentRes, profileRes] = await Promise.allSettled([
        api.assessment.getCurrent(),
        api.profile.get(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value?.currentDirection) {
        setTargetRole(profileRes.value.currentDirection);
      }

      if (currentRes.status === "fulfilled" && currentRes.value) {
        const assessmentData: Assessment = currentRes.value;

        if (assessmentData.isCompleted && assessmentData.aiAnalysis) {
          setCompletedResult(assessmentData);
          setViewState("completed");

          // Restore previous validated challenge feedback if available
          const prevChallenge = assessmentData.aiAnalysis.validatedChallengeResult;
          if (prevChallenge) {
            setChallengeSelectedOption(prevChallenge.selectedOptionText);
            setChallengeFeedback({
              isCorrect: prevChallenge.isCorrect,
              explanation: prevChallenge.explanation,
              confidenceBoost: prevChallenge.isCorrect ? 5 : 0,
            });
          }
        } else if (assessmentData.answers && assessmentData.answers.length > 0) {
          setAnswers(assessmentData.answers.slice(0, ASSESSMENT_QUESTION_LIMIT));
          // Show intro with option to resume or restart
          setViewState("intro");
        } else {
          setViewState("intro");
        }
      }
    } catch (err: any) {
      toast.error("Failed to load assessment data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast.error]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Start fresh assessment
  const handleStartFresh = async () => {
    setIsLoading(true);
    try {
      // Generate successfully before replacing any previously saved attempt.
      const firstQRes = await api.assessment.getNextQuestion({
        answeredIds: [],
        currentAnswers: [],
        targetRole,
      });

      if (firstQRes && firstQRes.nextQuestion) {
        await api.assessment.start();
        setAnswers([]);
        setCurrentIndex(0);
        setCompletedResult(null);
        setCanConclude(false);
        setShowConfirmSubmit(false);
        setQuestions([firstQRes.nextQuestion]);
        setCanConclude(firstQRes.canConclude || false);
        setViewState("active");
      } else {
        toast.error("Unable to load initial adaptive question.");
      }
    } catch (err: any) {
      toast.error("Error starting assessment: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resume saved assessment
  const handleResumeAssessment = async () => {
    setIsLoading(true);
    try {
      const savedAnswers = answers.slice(0, ASSESSMENT_QUESTION_LIMIT);
      const restoredQuestions: AssessmentQuestion[] = savedAnswers.map((answer) => ({
        id: answer.questionId,
        category: answer.category,
        dimension: answer.dimension,
        questionText: answer.questionText || "Previously answered question",
        options: [{ text: String(answer.selectedOption), score: answer.score || 0 }],
      }));

      if (savedAnswers.length >= ASSESSMENT_QUESTION_LIMIT) {
        setCanConclude(true);
      } else {
        const nextDecision = await api.assessment.getNextQuestion({
          answeredIds: savedAnswers.map((answer) => answer.questionId),
          currentAnswers: savedAnswers,
          targetRole,
        });
        if (!nextDecision?.nextQuestion) {
          if (savedAnswers.length < 3) throw new Error("Could not generate the next question. Please try again.");
          setCanConclude(true);
          setShowConfirmSubmit(true);
        } else {
          restoredQuestions.push(nextDecision.nextQuestion);
          setCanConclude(Boolean(nextDecision.canConclude));
        }
      }

      setAnswers(savedAnswers);
      setQuestions(restoredQuestions);
      setCurrentIndex(restoredQuestions.length - 1);
      setViewState("active");
    } catch (err: any) {
      toast.error("Failed to resume: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting an option for the current question
  const handleSelectOption = (option: { text: string; score: number }) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const newAnswer: AssessmentAnswer = {
      questionId: currentQ.id,
      category: currentQ.category || "Skills",
      dimension: currentQ.dimension || "problem_solving",
      questionText: currentQ.questionText,
      selectedOption: option.text,
      score: option.score,
    };

    const updatedAnswers = answers.filter((a) => a.questionId !== currentQ.id);
    updatedAnswers.push(newAnswer);
    setAnswers(updatedAnswers);

    if (currentIndex === questions.length - 1 && updatedAnswers.length < ASSESSMENT_QUESTION_LIMIT) {
      prefetchNextQuestion(updatedAnswers);
    } else {
      clearQuestionPrefetch();
    }

    // Autosave progress in background
    api.assessment.saveProgress({
      currentQuestionIndex: currentIndex,
      answers: updatedAnswers,
    }).catch(() => {});
  };

  // Navigate to Next question or request next adaptive question from backend
  const handleNext = async () => {
    // If we have already loaded questions ahead in the queue
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    if (answers.length >= ASSESSMENT_QUESTION_LIMIT || currentIndex + 1 >= ASSESSMENT_QUESTION_LIMIT) {
      setCanConclude(true);
      setShowConfirmSubmit(true);
      return;
    }

    const currentAnswerKey = getAnswerKey(answers);
    const cachedDecision = prefetchedNextQuestion?.answerKey === currentAnswerKey
      ? prefetchedNextQuestion.decision
      : null;
    clearQuestionPrefetch();

    // Otherwise, fetch the next adaptive question from the bank
    setIsFetchingNext(true);
    try {
      const nextDecision = cachedDecision || await api.assessment.getNextQuestion({
        answeredIds: answers.map((answer) => answer.questionId),
        currentAnswers: answers,
        targetRole,
      });

      if (nextDecision && nextDecision.nextQuestion) {
        const nextQ = nextDecision.nextQuestion;
        setQuestions((prev) => [...prev, nextQ]);
        setCurrentIndex((prev) => prev + 1);
        setCanConclude(nextDecision.canConclude || false);
      } else {
        // No more questions or max reached: prompt submission
        setCanConclude(true);
        setShowConfirmSubmit(true);
      }
    } catch (err: any) {
      toast.error("Error fetching next question: " + err.message);
    } finally {
      setIsFetchingNext(false);
    }
  };

  // Navigate to Previous question
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit and evaluate assessment
  const handleFinalSubmit = async () => {
    setShowConfirmSubmit(false);
    setIsSubmitting(true);

    try {
      const submittedAnswers = answers.slice(0, ASSESSMENT_QUESTION_LIMIT);
      const res = await api.assessment.submit({ answers: submittedAnswers });
      setAnswers(submittedAnswers);
      setCompletedResult(res);
      setViewState("completed");
      toast.success("Adaptive assessment evaluated successfully! Scorecard generated.");
    } catch (err: any) {
      toast.error("Submission failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate the practical skill validation challenge
  const handleValidateChallenge = async () => {
    if (!challengeSelectedOption || !completedResult?.aiAnalysis?.skillValidationChallenge) {
      return;
    }

    const challenge = completedResult.aiAnalysis.skillValidationChallenge;
    setIsValidatingChallenge(true);

    try {
      const res = await api.assessment.validateChallenge({
        challengeId: challenge.id,
        selectedOptionText: challengeSelectedOption,
      });

      setChallengeFeedback({
        isCorrect: res.isCorrect,
        explanation: res.explanation,
        confidenceBoost: res.confidenceBoost || 0,
      });

      if (res.isCorrect) {
        toast.success("Practical challenge verified! +5% Evidence Confidence.");
      } else {
        toast.info("Practical challenge reviewed. See technical explanation below.");
      }
    } catch (err: any) {
      toast.error("Error validating challenge: " + err.message);
    } finally {
      setIsValidatingChallenge(false);
    }
  };

  // Set top recommendation as target career role
  const handleSetTargetCareer = async (careerId: string, title: string) => {
    try {
      await api.profile.setTargetCareer(careerId);
      setTargetCareerUpdated(title);
      toast.success(`Target career successfully set to ${title}.`);
    } catch (err: any) {
      toast.error("Failed to update target career: " + err.message);
    }
  };

  // ----------------------------------------------------
  // LOADING STATE
  // ----------------------------------------------------
  if (isLoading) {
    return <LoadingState message="Connecting to Adaptive Career Intelligence Engine..." />;
  }

  // ----------------------------------------------------
  // VIEW 1: INTRODUCTION SCREEN
  // ----------------------------------------------------
  if (viewState === "intro") {
    return <AssessmentIntroView answers={answers} completedResult={completedResult} targetRole={targetRole} setViewState={setViewState} handleResumeAssessment={handleResumeAssessment} handleStartFresh={handleStartFresh} />;
  }

  if (viewState === "active") {
    return <AssessmentQuestionView questions={questions} currentIndex={currentIndex} answers={answers} setViewState={setViewState} canConclude={canConclude} setShowPauseModal={setShowPauseModal} handleSelectOption={handleSelectOption} handlePrev={handlePrev} handleNext={handleNext} setShowConfirmSubmit={setShowConfirmSubmit} isFetchingNext={isFetchingNext} showPauseModal={showPauseModal} showConfirmSubmit={showConfirmSubmit} handleFinalSubmit={handleFinalSubmit} isSubmitting={isSubmitting} />;
  }

  if (viewState === "completed" && completedResult?.aiAnalysis) {
    return <AssessmentReportView analysis={completedResult.aiAnalysis} answers={answers} targetRole={targetRole} targetCareerUpdated={targetCareerUpdated} setChallengeSelectedOption={setChallengeSelectedOption} challengeSelectedOption={challengeSelectedOption} challengeFeedback={challengeFeedback} isValidatingChallenge={isValidatingChallenge} handleSetTargetCareer={handleSetTargetCareer} handleValidateChallenge={handleValidateChallenge} onNavigate={onNavigate} handleStartFresh={handleStartFresh} />;
  }

  return null;
};
