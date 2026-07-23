import React, { useState, useRef, useEffect } from "react";
import LucideIcon from "./LucideIcon";
import { ChatMessage } from "../types";
import { saveChatMessageToCloud, fetchChatHistoryFromCloud } from "../lib/firebase";
import LiveVoiceCoach from "./LiveVoiceCoach";

interface AICoachChatProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  user?: any;
}

const defaultWelcomeMessage = {
  id: "welcome",
  role: "assistant" as const,
  content: "Good morning! I am Sabit, your AI Success Coach. Your metrics are looking exceptional today with an 84% Success Rate and a burning 17-day streak. \n\nHow can I help you optimize your high-performance morning routine today?",
  timestamp: new Date()
};

export const AICoachChat: React.FC<AICoachChatProps> = ({ isOpen, onClose, isDark = true, user = null }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"gemini-3.5-flash" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite">("gemini-3.5-flash");
  const [selectedRole, setSelectedRole] = useState<"executive" | "accountability" | "planner" | "mentor">("executive");
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    "Optimize my morning routine stack",
    "How do I maintain my Portfolio streak?",
    "Suggest a high-focus reading technique",
    "Analyze my current 17-day streak"
  ];

  // Load chat history from Firestore if user is authenticated and chat drawer opens
  useEffect(() => {
    let active = true;
    async function loadChatHistory() {
      if (user && isOpen) {
        try {
          const history = await fetchChatHistoryFromCloud(user.uid);
          if (active) {
            if (history && history.length > 0) {
              setMessages(history);
            } else {
              setMessages([defaultWelcomeMessage]);
            }
          }
        } catch (err) {
          console.error("Error loading chat history:", err);
        }
      }
    }
    loadChatHistory();
    return () => {
      active = false;
    };
  }, [user, isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    if (user) {
      saveChatMessageToCloud(user.uid, userMsg);
    }

    try {
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          history: history,
          model: selectedModel,
          role: selectedRole
        })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (user) {
          saveChatMessageToCloud(user.uid, assistantMsg);
        }
      } else {
        throw new Error(data.error || "Failed to receive a valid response from Sabit.");
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I am currently recalibrating my connection stack. Let's stay focused on checking off today's water and meditation habits while I restore connection!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        id="sabit-chat-floating-container"
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[550px] max-h-[80vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-zoom-in ${
          isDark 
            ? "bg-[#0F172A] border-slate-800 text-white shadow-[#7C3AED]/10" 
            : "bg-white border-slate-200 text-slate-900 shadow-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Header */}
        <div className={`p-3.5 px-4 border-b flex items-center justify-between ${
          isDark ? "border-slate-800/80 bg-[#1E293B]/60" : "border-slate-200 bg-white"
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white font-extrabold shadow-sm">
                S
              </div>
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-white" />
            </div>
            <div>
              <h4 className={`font-bold text-xs leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>Sabit AI Success Coach</h4>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {selectedModel}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Live Voice API Button */}
            <button
              onClick={() => setIsLiveVoiceOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-extrabold flex items-center gap-1.5 shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Start Live Voice Conversation with Gemini"
            >
              <LucideIcon name="Mic" size={13} className="animate-pulse text-purple-200" />
              <span>Voice Mode</span>
            </button>

            {/* Model & System Role Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                showSettings
                  ? "bg-purple-500/20 text-purple-400"
                  : isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Chatbot Model & Role Settings"
            >
              <LucideIcon name="Settings2" size={16} />
            </button>

            {/* Close */}
            <button
              id="chat-close-btn"
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <LucideIcon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* Model & Role Settings Drawer */}
        {showSettings && (
          <div className={`p-3 border-b space-y-2 text-xs animate-fade-in ${
            isDark ? "bg-[#1E293B]/90 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
          }`}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Select Gemini Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as any)}
                  className={`w-full p-1.5 rounded-lg border text-[10px] font-bold outline-none ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (General)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoning)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Fast)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Coaching Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className={`w-full p-1.5 rounded-lg border text-[10px] font-bold outline-none ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="executive">Executive Coach</option>
                  <option value="accountability">Ruthless Accountability</option>
                  <option value="planner">Routine Architect</option>
                  <option value="mentor">Mindset & Wellness</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Message Panel */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${
          isDark ? "bg-[#090D1A]" : "bg-[#F8FAFC]/50"
        }`}>
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {!isUser && (
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isDark ? "bg-slate-900 text-purple-400 border-slate-800" : "bg-blue-50 text-[#2563EB] border-blue-100"
                  }`}>
                    S
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed font-semibold shadow-sm border ${
                      isUser
                        ? "bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] border-[#2563EB] text-white rounded-tr-none"
                        : isDark
                          ? "bg-[#1E293B] border-slate-800 text-slate-100 rounded-tl-none whitespace-pre-line"
                          : "bg-white border-[#E5E7EB] text-[#0F172A] rounded-tl-none whitespace-pre-line"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[8px] font-bold text-[#94A3B8] ${isUser ? "text-right" : "text-left"}`}>
                    {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                isDark ? "bg-slate-900 text-purple-400 border-slate-800" : "bg-blue-50 text-[#2563EB] border-blue-100"
              }`}>
                S
              </div>
              <div className={`rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5 shadow-sm border ${
                isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
              }`}>
                <span className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className={`px-4 py-2 border-t flex gap-2 overflow-x-auto whitespace-nowrap custom-scrollbar shrink-0 select-none ${
          isDark ? "bg-[#1E293B]/20 border-slate-800" : "bg-slate-50/40 border-[#E5E7EB]"
        }`}>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className={`rounded-full px-3 py-1 text-[9px] font-bold transition-all cursor-pointer shadow-sm border ${
                isDark
                  ? "bg-[#1E293B] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-white border-[#E5E7EB] text-slate-600 hover:text-[#0F172A] hover:bg-slate-50"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className={`p-3.5 border-t flex items-center gap-2 shrink-0 ${
            isDark ? "border-slate-800 bg-[#0F172A]" : "border-[#E5E7EB] bg-white"
          }`}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Sabit anything about consistency..."
            className={`flex-1 rounded-xl px-4 py-2 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all border ${
              isDark
                ? "bg-[#1E293B] border-slate-800 text-white focus:bg-[#1E293B]/80"
                : "bg-slate-50 border-[#E5E7EB] text-[#0F172A] focus:bg-white"
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-8 w-8 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white rounded-xl flex items-center justify-center shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
          >
            <LucideIcon name="Send" size={13} />
          </button>
        </form>
      </div>

      {/* Live Voice Coach Modal */}
      <LiveVoiceCoach
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        isDark={isDark}
      />
    </>
  );
};

export default AICoachChat;
