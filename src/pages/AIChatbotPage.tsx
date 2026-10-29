import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import {
  Bot,
  User as UserIcon,
  Send,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
  timestamp?: string;
}

const QUICK_PROMPTS = [
  "What skills should I learn next for my target role?",
  "How can I improve my employability readiness score?",
  "Review my current skill gaps and suggest a project idea.",
  "What are the most common technical interview questions for junior developers?",
  "How do I balance learning foundational DSA with practical web frameworks?",
];

export const AIChatbotPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const hist = await api.chat.getHistory();
        if (Array.isArray(hist) && hist.length > 0) {
          setMessages(hist);
        } else {
          // Default greeting
          setMessages([
            {
              id: "welcome-msg",
              role: "assistant",
              content:
                "Hello! I am your AI Career Guidance Advisor. I have analyzed your target career track, skill gaps, and learning roadmap. How can I assist your career progression today?",
              mode: "career_intelligence_engine",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err: any) {
        console.warn("Failed to load chat history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleClearChat = async () => {
    try {
      await api.chat.clearHistory();
      setMessages([
        {
          id: "welcome-msg",
          role: "assistant",
          content:
            "Hello! I am your AI Career Guidance Advisor. I have analyzed your target career track, skill gaps, and learning roadmap. How can I assist your career progression today?",
          mode: "gemini",
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.success("Conversation history cleared. Ready for a new topic!");
    } catch (err: any) {
      toast.error("Could not clear conversation history: " + err.message);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userEntry: ChatEntry = {
      id: "u_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await api.chat.sendMessage(text);
      const assistantEntry: ChatEntry = {
        id: "a_" + Date.now(),
        role: "assistant",
        content: res.reply || res.message || "I have noted your question.",
        mode: res.mode || "local_engine",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantEntry]);
    } catch (err: any) {
      toast.error("Failed to receive advisor reply: " + (err.message || "Unknown error"));
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          role: "assistant",
          content: "I encountered a temporary connection issue. Please ensure the backend is running and try again.",
          mode: "fallback",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div id="ai-chatbot-page" className="space-y-3 sm:space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100dvh-7rem)] min-h-[20rem]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> Conversational Career Guidance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Career Advisor
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" size="sm" className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Gemini AI Powered
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            title="Start a fresh conversation"
          >
            New Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("/roadmap")}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Roadmap
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-sidebar-scroll">
        {isLoadingHistory ? (
          <LoadingState message="Loading conversational history..." />
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 text-sm leading-relaxed space-y-1.5 shadow-sm break-words ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 ${
                      isUser ? "text-blue-200" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                    {!isUser && msg.mode && (
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {msg.mode.includes("gemini") ? "Gemini AI" : "Career Engine"}
                      </span>
                    )}
                  </div>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>Analyzing career recommendations and formulating guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1 whitespace-nowrap pl-1">
          <Lightbulb className="w-3 h-3 text-amber-500" /> Prompts:
        </span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isSending}
            className="text-[11px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <Card className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your skill gaps, projects, or career preparation... (Press Enter to send)"
            rows={2}
            className="flex-1 text-xs bg-transparent border-0 focus:outline-none resize-none p-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || isSending}
            isLoading={isSending}
            className="h-9 px-4 mb-1"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
