import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  ShieldAlert,
  History,
  Plus,
  MessageSquare,
  Clock,
  X,
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '../services/api';

const DEFAULT_WELCOME = {
  id: 'welcome_1',
  role: 'assistant',
  content: "Hi! I'm your FurSphere AI assistant. Ask me anything about your pet's health, food, behavior or care.",
};

const createNewSession = () => ({
  id: 'session_' + Date.now(),
  title: 'New Pet Consultation',
  createdAt: new Date().toISOString(),
  messages: [DEFAULT_WELCOME],
});

export default function AiChat() {
  const navigate = useNavigate();

  const suggestedQuestions = [
    'What food is best for my dog?',
    'Why is my cat not eating?',
    'How to keep my pet’s coat healthy?',
    'Common dog illnesses?',
    'What daily care does my puppy need?',
  ];

  // Sessions list
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('fursphere_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not load chat sessions', e);
    }
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || 'session_' + Date.now();
  });

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  // Active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || createNewSession();
  const messages = activeSession.messages || [DEFAULT_WELCOME];

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('fursphere_chat_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not save chat sessions', e);
    }
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Start a new chat session
  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowHistoryDrawer(false);
  };

  // Switch to another session
  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    setShowHistoryDrawer(false);
  };

  // Delete a session from history
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || loading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text.trim(),
    };

    // Update active session with user message and set title if first user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const isFirstUserMsg = !s.messages.some((m) => m.role === 'user');
          const title = isFirstUserMsg
            ? text.trim().slice(0, 32) + (text.length > 32 ? '...' : '')
            : s.title;
          return {
            ...s,
            title,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text.trim(),
          history,
        }),
      });

      if (res.success && res.reply) {
        const botMsg = {
          id: 'bot_' + Date.now(),
          role: 'assistant',
          content: res.reply,
          provider: res.provider,
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, botMsg],
              };
            }
            return s;
          })
        );
      }
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content:
          '⚠️ Oops! I encountered an issue connecting to the pet-care knowledge service. Please try again in a moment.\n\nNote: For urgent pet health emergencies, please call your local emergency veterinary clinic directly.',
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMsg],
            };
          }
          return s;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Remove individual message from active session
  const removeMessage = (idToRemove) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const updated = s.messages.filter((m) => m.id !== idToRemove);
          return {
            ...s,
            messages: updated.length > 0 ? updated : [DEFAULT_WELCOME],
          };
        }
        return s;
      })
    );
  };

  // Clear current active session messages
  const clearCurrentChat = () => {
    const freshWelcome = {
      id: 'welcome_' + Date.now(),
      role: 'assistant',
      content: "Chat cleared! How can I assist you with your furry best friend today?",
    };
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: 'New Pet Consultation',
            messages: [freshWelcome],
          };
        }
        return s;
      })
    );
    setShowClearConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24 lg:pb-8 flex flex-col h-[calc(100vh-5rem)] relative">
      
      {/* Header: Back + AI Chat Title + History Button + New Chat + Remove */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                AI Chat
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                <Sparkles className="w-3 h-3 text-sky-500 fill-sky-300" />
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {activeSession.title}
            </p>
          </div>
        </div>

        {/* Action Controls: History Drawer Button, New Chat, and Remove Chat */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showHistoryDrawer
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="View Chat History"
          >
            <History className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">History</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded-full">
              {sessions.length}
            </span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d5c46] hover:bg-[#0a4837] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Remove Current Chat */}
          <div className="relative">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
              title="Clear active chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {showClearConfirm && (
              <div className="absolute right-0 top-10 w-64 p-3 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 animate-in fade-in zoom-in-95">
                <p className="text-xs font-bold text-slate-800 mb-1">Clear current conversation?</p>
                <p className="text-[11px] text-slate-500 mb-3">Messages in this consultation will be cleared.</p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={clearCurrentChat}
                    className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                  >
                    Confirm Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Pet Questions */}
      <div className="py-2.5 overflow-x-auto scrollbar-none shrink-0 border-b border-slate-50">
        <div className="flex items-center gap-2 min-w-max">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Messages Thread */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        
        {/* Veterinary Notice Box */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Care Note:</strong> FurSphere AI provides wellness suggestions and guidance. Always consult a licensed vet for medical diagnoses or emergencies.
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 group relative ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#0d5c46] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble + Delete button on hover */}
              <div className="relative group/bubble max-w-[85%] sm:max-w-[75%]">
                <div
                  className={`rounded-3xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    isUser
                      ? 'bg-[#0d5c46] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                  {msg.provider && (
                    <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                      <span>Powered by {msg.provider}</span>
                    </div>
                  )}
                </div>

                {/* Individual message remove button */}
                <button
                  type="button"
                  onClick={() => removeMessage(msg.id)}
                  className={`absolute top-1 p-1 rounded-full bg-white/90 shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/bubble:opacity-100 cursor-pointer ${
                    isUser ? '-left-7' : '-right-7'
                  }`}
                  title="Remove this message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0d5c46] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3 border border-slate-100 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0d5c46] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#0d5c46] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#0d5c46] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-1 font-medium">Consulting Gemini Pet AI...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="shrink-0 pt-2 border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-slate-200 focus-within:border-[#0d5c46] focus-within:ring-2 focus-within:ring-[#0d5c46]/20 shadow-sm"
        >
          <input
            type="text"
            placeholder="Type your pet-care message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#0d5c46] hover:bg-[#0a4837] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>

      {/* Chat History Slide-over Drawer (ChatGPT style) */}
      {showHistoryDrawer && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex justify-end animate-in fade-in">
          <div className="w-80 max-w-full bg-white h-full shadow-2xl p-4 flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">Chat History</h3>
                </div>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Start New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer mb-3"
              >
                <Plus className="w-4 h-4" />
                Start New Chat
              </button>

              {/* List of Previous Sessions */}
              <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
                {sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  const dateStr = new Date(sess.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'border-[#0d5c46] bg-emerald-50/70 text-[#0d5c46] font-bold shadow-2xs'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0d5c46]' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <p className="truncate text-xs">{sess.title}</p>
                          <span className="text-[10px] text-slate-400 font-normal">{dateStr}</span>
                        </div>
                      </div>

                      {/* Delete session icon */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, sess.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Delete this chat session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clear All Sessions Option */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete ALL chat sessions?')) {
                    const fresh = createNewSession();
                    setSessions([fresh]);
                    setActiveSessionId(fresh.id);
                    localStorage.removeItem('fursphere_chat_sessions');
                  }
                }}
                className="w-full py-2 text-center text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                Clear All History Sessions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
