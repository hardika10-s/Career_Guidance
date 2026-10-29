import { useState, useEffect, useRef, useCallback } from "react";

export interface UseVoiceInterviewOptions {
  onTranscript?: (text: string) => void;
  onError?: (errMessage: string) => void;
}

export function useVoiceInterview(options: UseVoiceInterviewOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSpeechRecognitionSupported =
    typeof window !== "undefined" &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  const isSpeechSynthesisSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, []);

  const cancelSpeech = useCallback(() => {
    if (isSpeechSynthesisSupported) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch {}
    }
  }, [isSpeechSynthesisSupported]);

  const speakQuestion = useCallback(
    (text: string, force: boolean = false) => {
      if (!isSpeechSynthesisSupported || (!ttsEnabled && !force) || !text) return;
      try {
        cancelSpeech();

        // Clean markdown backticks, asterisks, hashtags before reading aloud
        const cleanText = text
          .replace(/```[\s\S]*?```/g, "Code example provided on screen.")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/[*#_~]/g, "")
          .trim();

        if (!cleanText) return;

        if (typeof window === "undefined" || typeof SpeechSynthesisUtterance === "undefined" || !window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = "en-US";

        // Try to pick an English voice safely
        let voices: SpeechSynthesisVoice[] = [];
        try {
          if (typeof window.speechSynthesis.getVoices === "function") {
            voices = window.speechSynthesis.getVoices() || [];
          }
        } catch {}

        const preferredVoice = voices.find(
          (v) =>
            v.lang && v.lang.startsWith("en") &&
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Samantha") ||
              v.name.includes("Alex"))
        ) || voices.find((v) => v.lang && v.lang.startsWith("en"));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
      }
    },
    [isSpeechSynthesisSupported, ttsEnabled, cancelSpeech]
  );

  const toggleSpeak = useCallback(
    (text: string) => {
      if (isSpeaking) {
        cancelSpeech();
      } else {
        speakQuestion(text, true);
      }
    },
    [isSpeaking, cancelSpeech, speakQuestion]
  );

  const startListening = useCallback(
    (onResultAppend: (chunk: string) => void) => {
      if (!isSpeechRecognitionSupported) {
        options.onError?.(
          "Speech recognition is not supported in this browser. Please use Chrome, Edge, or text input."
        );
        return;
      }

      // If speech is currently playing, stop it so mic doesn't catch it
      cancelSpeech();

      try {
        const SpeechRec =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setMicPermissionGranted(true);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            onResultAppend(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            setMicPermissionGranted(false);
            options.onError?.(
              "Microphone permission was denied. Please allow microphone access in your browser settings."
            );
          } else if (event.error === "no-speech") {
            // Ignored, normal timeout
          } else {
            options.onError?.(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
        options.onError?.("Could not initialize microphone speech input.");
      }
    },
    [isSpeechRecognitionSupported, cancelSpeech, options]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(
    (onResultAppend: (chunk: string) => void) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(onResultAppend);
      }
    },
    [isListening, startListening, stopListening]
  );

  return {
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isListening,
    isSpeaking,
    ttsEnabled,
    setTtsEnabled,
    micPermissionGranted,
    speakQuestion,
    toggleSpeak,
    cancelSpeech,
    startListening,
    stopListening,
    toggleListening,
  };
}
