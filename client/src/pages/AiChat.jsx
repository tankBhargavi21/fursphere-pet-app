import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Send, Trash2, Bot, User, AlertCircle, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function AiChat() {
  const navigate = useNavigate();

  const suggestedQuestions = [
    'What food is best for my dog?',
    'Why is my cat not eating?',
    'How to keep my pet’s coat healthy?',
    'Common dog illnesses?',
    'What daily care does my puppy need?',
  ];

  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      role: 'assistant',
      content: "Hi! I'm your FurSphere AI assistant. Ask me anything about your pet's health, food, behavior or care.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || loading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
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
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: '⚠️ Oops! I encountered an issue connecting to the pet-care knowledge service. Please try again in a moment.\n\nNote: For urgent pet health emergencies, please call your local emergency veterinary clinic directly.',
      };
      setMessages((prev) => [...prev, errorMsg]);
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

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content: "Chat cleared! How can I assist you with your furry best friend today?",
      },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-24 lg:pb-8 flex flex-col h-[calc(100vh-5rem)]">
      
      {/* Header matching Panel 5: < AI Chat + Gemini AI badge + Clear option */}
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
            <p className="text-[11px] text-slate-400">FurSphere Pet Health & Nutrition</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Pet Questions (Matches Panel 5 Pills) */}
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

      {/* Messages Thread */}
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
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#0d5c46] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
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

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator with Typing Animation */}
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

      {/* Input Field matching Panel 5 */}
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

    </div>
  );
}
