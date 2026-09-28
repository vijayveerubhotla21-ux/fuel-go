import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Send,
  ShieldAlert,
  Fuel,
  Car,
  CreditCard,
  PhoneCall,
  Info,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { TUTORIAL_CATEGORIES, askFuelAssistant, TutorialCategory } from '../services/gemini';

interface AIFuelAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSafetyCenter?: () => void;
}

export const AIFuelAssistantModal: React.FC<AIFuelAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenSafetyCenter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory>(TUTORIAL_CATEGORIES[0]);
  const [question, setQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am your FuelGo AI Fuel & Safety Assistant. Ask me anything about Petrol vs Diesel, fuel handling protocols, BS-VI standards, or how our doorstep delivery works.',
    },
  ]);

  if (!isOpen) return null;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userText = question;
    setQuestion('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAsking(true);

    try {
      const answer = await askFuelAssistant(userText);
      setChatLog((prev) => [...prev, { sender: 'assistant', text: answer }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'FuelGo provides Petrol (1–5L) and Diesel (1–10L) with live MapTiler GPS tracking and verified petrol bunk receipts. Follow manufacturer instructions for vehicle refueling.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">FuelGo AI Fuel Assistant</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Team EAGLE AI
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Educational Fuel Tutorials, Vehicle Fuel Advice & Immediate Safety Guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Left Sidebar Category selector, Right Article & Chat */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="p-4 border-r border-neutral-200 bg-neutral-50 overflow-y-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block px-2 mb-1">
              Tutorial Categories
            </span>
            {TUTORIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left p-3 rounded-xl transition-all text-xs flex items-center justify-between ${
                  selectedCategory.id === cat.id
                    ? 'bg-neutral-900 text-white font-bold shadow-md'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
              >
                <div className="truncate">
                  <p className="truncate font-semibold">{cat.title}</p>
                  <p
                    className={`text-[10px] truncate ${
                      selectedCategory.id === cat.id ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
              </button>
            ))}

            <div className="pt-4 border-t border-neutral-200 px-2 space-y-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenSafetyCenter) onOpenSafetyCenter();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Open Safety Center</span>
              </button>
            </div>
          </div>

          {/* Right Main Panel: Selected Article Knowledge Base & Interactive AI Chat */}
          <div className="md:col-span-2 flex flex-col h-full overflow-hidden bg-white">
            {/* Knowledge Base Articles */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[380px] border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-neutral-900">{selectedCategory.title}</h4>
              </div>

              <div className="space-y-4">
                {selectedCategory.articles.map((art, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                    <h5 className="font-bold text-neutral-900 text-sm">{art.title}</h5>
                    <p className="text-neutral-600 leading-relaxed">{art.summary}</p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-700 pt-1">
                      {art.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                    {art.safetyWarning && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-start gap-1.5 mt-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{art.safetyWarning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Q&A Assistant */}
            <div className="flex-1 flex flex-col p-4 bg-neutral-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ask AI Fuel Assistant
                </span>
                <span className="text-[10px] text-neutral-400">Guarded by PESO Safety Protocol</span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-40 p-2 bg-white rounded-xl border border-neutral-200 text-xs">
                {chatLog.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-[90%] whitespace-pre-line leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-neutral-900 text-white rounded-tr-none'
                          : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="text-xs text-neutral-400 italic flex items-center gap-1.5 p-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>Analyzing fuel safety standards...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAsk} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What if I spill fuel, or why is petrol capped at 5L?"
                  className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={isAsking || !question.trim()}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mandatory Footer Disclaimer */}
        <div className="px-6 py-2.5 bg-neutral-100 border-t border-neutral-200 text-[11px] text-neutral-500 flex items-center justify-between">
          <p className="italic">
            AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and
            professional safety guidance.
          </p>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs transition-colors shrink-0 ml-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
