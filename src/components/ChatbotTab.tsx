import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Plus, 
  Loader2, 
  Activity, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export function ChatbotTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hello! I am your Resident AI Clinical Coordinator. I can help answer medical queries, outline general pharmacology properties, draft treatment schedules, or analyze bed occupancy statistics. How can I help you coordinate care today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inp, setInp] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), // More robust unique ID generation
      sender: 'user',
      text: userPrompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInp('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userPrompt })
      });

      if (!response.ok) {
        throw new Error("API call error");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || "I apologize, our connection to the medical analysis clusters is currently offline.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error(e);
      const errMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: "⚠️ **System Communication Interrupted**: We failed to gather a live reply from the Gemini API model. Please make sure the `GEMINI_API_KEY` is set inside the **Settings** tab secrets parameter.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inp);
  };

  const presets = [
    "What are standard hypertension treatments?",
    "Give me active care tips for seasonal pediatric flu",
    "How does John Doe's blood type (A+) affect donor matches?",
    "Explain standard dosage ranges for Metformin"
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100vh-230px)] max-h-[800px] overflow-hidden" id="chatbot-component">
      {/* Bot top header banner */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-605 p-2 rounded-xl bg-blue-600">
            <Bot className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>Nithin Resident AI Doctor Partner</span>
              <span className="bg-blue-500/30 text-blue-300 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                Active Gemini 3.5
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">HIPAA Compliant Operational & Health Analysis Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold bg-slate-950 px-2.5 py-1 rounded">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="hidden sm:inline">Encrypted Terminal Sandbox</span>
        </div>
      </div>

      {/* Bubble messages dialogue frame */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900" id="chat-messages-scroll">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div 
              key={m.id} 
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Profile icon bubble */}
              <div className={`p-2 rounded-full flex-shrink-0 ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'}`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message text bubble */}
              <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-xs ${
                isUser 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border rounded-tl-none border-slate-200 dark:border-slate-700'
              }`}>
                {/* Convert double asterisks inline to display text correctly */}
                <div className="whitespace-pre-wrap">
                  {m.text.split('\n').map((para, pIdx) => {
                    // Simple bold matches helper
                    const parts = para.split('**');
                    return (
                      <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
                        {parts.map((p, idx) => (
                          idx % 2 === 1 ? <strong key={idx} className={isUser ? 'text-white' : 'text-blue-600 font-bold'}>{p}</strong> : p
                        ))}
                      </p>
                    );
                  })}
                </div>
                <span className={`text-[9px] font-mono block text-right mt-1.5 font-bold ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-2.5">
            <div className="p-2 bg-slate-800 text-slate-100 rounded-full flex-shrink-0">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800 border rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-xs flex items-center space-x-2">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-400 font-mono font-extrabold animate-pulse">Formulating clinical advice logs...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggestion tags container */}
      <div className="bg-slate-50 dark:bg-slate-900 px-6 py-2.5 border-t border-slate-105 dark:border-slate-700 overflow-x-auto flex flex-nowrap gap-2" id="chat-presets-bar">
        {presets.map((pre, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pre)}
            className="text-[10.5px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-slate-700 px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer flex items-center space-x-1"
          >
            <span>{pre}</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Form messaging field wrapper */}
      <form onSubmit={handleFormSubmit} className="p-4 bg-white dark:bg-slate-800 border-t flex gap-3 flex-shrink-0" id="chat-form">
        <input
          type="text"
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          disabled={loading}
          placeholder="Ask clinical queries, retrieve pharmaceutical stats, or request bed statuses..."
          className="bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3 grow text-xs placeholder-slate-400 focus:outline-none"
          id="chat-inpbox"
        />
        <button
          type="submit"
          disabled={!inp.trim() || loading}
          className={`p-3 rounded-xl transition flex-shrink-0 flex items-center justify-center cursor-pointer ${
            !inp.trim() || loading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
          }`}
          id="chat-send-btn"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
