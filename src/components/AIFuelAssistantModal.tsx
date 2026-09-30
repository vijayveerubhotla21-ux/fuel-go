import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Send,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Cpu,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Wrench,
  Radio,
} from 'lucide-react';
import { TUTORIAL_CATEGORIES, askFuelAssistant, TutorialCategory } from '../services/gemini';

export type ChatModelOption =
  | 'gemini-2.5-flash'
  | 'gemini-1.5-pro'
  | 'peso-compliance-ai'
  | 'roadside-rescue-bot'
  | 'automechanic-ai';

interface ChatModelMeta {
  id: ChatModelOption;
  name: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  introMsg: string;
}

const CHAT_MODELS: ChatModelMeta[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'DEFAULT • SPEED',
    desc: 'Ultra-fast doorstep fuel dispatch & pricing assistant',
    icon: Sparkles,
    accentColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    introMsg:
      'Greetings! I am powered by Gemini 2.5 Flash for high-speed assistance. Ask me about instant doorstep orders, OMC bunk pricing, delivery radius, or live GPS telemetry.',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    badge: 'DEEP REASONING',
    desc: 'Advanced technical, thermodynamic & safety analysis',
    icon: Cpu,
    accentColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    introMsg:
      'Welcome to Gemini 1.5 Pro deep reasoning mode. I can analyze complex industrial generator needs, bulk fueling calculations, flashpoint physics, and fleet optimization.',
  },
  {
    id: 'peso-compliance-ai',
    name: 'PESO Compliance AI',
    badge: 'GOVT SANCTIONED',
    desc: 'Statutory petroleum rules, 5L canister caps & government pilot',
    icon: Building2,
    accentColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    introMsg:
      'Official PESO & MoPNG regulatory compliance advisor active. I can clarify Section 4 Petroleum Rules, mandatory bunk receipts, 5L petrol limits, and government emergency relief authorizations.',
  },
  {
    id: 'roadside-rescue-bot',
    name: 'Roadside Rescue Bot',
    badge: 'EMERGENCY RELIEF',
    desc: 'Stranded motorists, highway fuel starvation & fast-track relief',
    icon: AlertTriangle,
    accentColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    introMsg:
      'Roadside Rescue Protocol initialized! If your vehicle is stranded with an empty tank on a roadway or highway, I will guide you through immediate safety positioning and priority courier dispatch.',
  },
  {
    id: 'automechanic-ai',
    name: 'AutoMechanic Pro',
    badge: 'VEHICLE DIAGNOSTICS',
    desc: 'Fuel injector care, diesel airlock bleeding & engine health',
    icon: Wrench,
    accentColor: 'text-teal-400 border-teal-500/40 bg-teal-500/10',
    introMsg:
      'AutoMechanic Pro ready. Ran out of fuel completely? Ask me how to prime your diesel filter, restart your petrol engine without cranking burnout, or check fuel quality.',
  },
];

interface AIFuelAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSafetyCenter?: () => void;
  onOpenGovtSanction?: () => void;
}

export const AIFuelAssistantModal: React.FC<AIFuelAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenSafetyCenter,
  onOpenGovtSanction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory>(TUTORIAL_CATEGORIES[0]);
  const [selectedModel, setSelectedModel] = useState<ChatModelOption>('gemini-2.5-flash');
  const [question, setQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'assistant'; text: string; modelTag?: string }>>([
    {
      sender: 'assistant',
      text: CHAT_MODELS[0].introMsg,
      modelTag: CHAT_MODELS[0].name,
    },
  ]);

  if (!isOpen) return null;

  const currentModelMeta = CHAT_MODELS.find((m) => m.id === selectedModel) || CHAT_MODELS[0];

  const handleSelectModel = (model: ChatModelMeta) => {
    setSelectedModel(model.id);
    setChatLog((prev) => [
      ...prev,
      {
        sender: 'assistant',
        text: `Switched to ${model.name} (${model.badge}): ${model.introMsg}`,
        modelTag: model.name,
      },
    ]);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userText = question.trim();
    setQuestion('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAsking(true);

    try {
      // Specialized contextual response based on the selected chat model
      let customPrefix = '';
      if (selectedModel === 'peso-compliance-ai') {
        customPrefix = '[Context: Answer as PESO & MoPNG Government Regulatory Compliance Officer regarding Petroleum Act 1934, statutory 5L petrol limits, and official FuelGo pilot authorization] ';
      } else if (selectedModel === 'roadside-rescue-bot') {
        customPrefix = '[Context: Answer as emergency Roadside Rescue Coordinator for stranded motorists facing fuel starvation on highway corridors] ';
      } else if (selectedModel === 'automechanic-ai') {
        customPrefix = '[Context: Answer as Certified Senior Master Automobile Technician diagnosing empty tank restarts, airlocks, and BS-VI fuel compatibility] ';
      } else if (selectedModel === 'gemini-1.5-pro') {
        customPrefix = '[Context: Provide comprehensive, deeply reasoned, and structured technical safety analysis] ';
      }

      const response = await askFuelAssistant(customPrefix + userText);
      setChatLog((prev) => [
        ...prev,
        { sender: 'assistant', text: response, modelTag: currentModelMeta.name },
      ]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Notice: Fuel safety protocol active. Please refer to certified emergency services if active combustion is suspected.',
          modelTag: currentModelMeta.name,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#0d0f17] text-neutral-100 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a0c13] border-b border-neutral-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">FuelGo AI Safety & Knowledge Assistant</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Team EAGLE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Educational Fuel Tutorials, Vehicle Advice & Immediate Safety Guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Left Sidebar Category selector, Right Article & Chat */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="p-4 border-r border-neutral-800 bg-[#0a0d14] overflow-y-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block px-2 mb-1">
              Tutorial Categories
            </span>
            {TUTORIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left p-3 rounded-2xl transition-all text-xs flex items-center justify-between cursor-pointer ${
                  selectedCategory.id === cat.id
                    ? 'bg-neutral-800 text-emerald-300 font-bold border border-emerald-500/50 shadow-md'
                    : 'bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300 border border-neutral-800'
                }`}
              >
                <div className="truncate">
                  <p className="truncate font-semibold">{cat.title}</p>
                  <p
                    className={`text-[10px] truncate ${
                      selectedCategory.id === cat.id ? 'text-emerald-400/80' : 'text-neutral-400'
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
              </button>
            ))}

            <div className="pt-4 border-t border-neutral-800 px-2 space-y-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenSafetyCenter) onOpenSafetyCenter();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Open Safety Center</span>
              </button>
            </div>
          </div>

          {/* Right Main Panel: Selected Article Knowledge Base & Interactive AI Chat */}
          <div className="md:col-span-2 flex flex-col h-full overflow-hidden bg-[#0d0f17]">
            {/* Knowledge Base Articles */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[360px] border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">{selectedCategory.title}</h4>
              </div>

              <div className="space-y-4">
                {selectedCategory.articles.map((art, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-xs">
                    <h5 className="font-bold text-white text-sm">{art.title}</h5>
                    <p className="text-neutral-300 leading-relaxed">{art.summary}</p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-400 pt-1">
                      {art.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                    {art.safetyWarning && (
                      <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] font-medium flex items-start gap-1.5 mt-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{art.safetyWarning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Q&A Assistant with Multi-Model Support */}
            <div className="flex-1 flex flex-col p-4 bg-[#0a0d14]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Select AI Model:
                </span>
                {onOpenGovtSanction && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenGovtSanction();
                    }}
                    className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>View Govt Sanction Approval</span>
                  </button>
                )}
              </div>

              {/* Chat Models Selector Ribbon */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
                {CHAT_MODELS.map((model) => {
                  const Icon = model.icon;
                  const isSelected = selectedModel === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? `${model.accentColor} shadow-md ring-1 ring-emerald-500/50`
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                      title={model.desc}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{model.name}</span>
                      <span className="text-[9px] opacity-70">[{model.badge.split('•')[0].trim()}]</span>
                    </button>
                  );
                })}
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 max-h-44 p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs">
                {chatLog.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.sender === 'assistant' && msg.modelTag && (
                      <span className="text-[9px] font-mono text-neutral-400 mb-0.5 ml-1">
                        Model: {msg.modelTag}
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-2xl max-w-[90%] whitespace-pre-line leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-neutral-950 font-medium rounded-tr-none'
                          : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="text-xs text-neutral-400 italic flex items-center gap-1.5 p-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>{currentModelMeta.name} generating safety response...</span>
                  </div>
                )}
              </div>

              {/* Quick Model-Specific Prompt Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[10px] text-neutral-400">
                <span className="shrink-0 text-neutral-500 font-mono">Suggested:</span>
                {[
                  selectedModel === 'peso-compliance-ai'
                    ? 'Why does the government cap doorstep petrol at 5L?'
                    : selectedModel === 'roadside-rescue-bot'
                    ? 'My car is empty on highway corridor. What to do?'
                    : selectedModel === 'automechanic-ai'
                    ? 'How to prime diesel fuel filter after running dry?'
                    : 'Can I order Petrol to my exact parking spot?',
                  'How does FuelGo guarantee OMC bunk receipts?',
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setQuestion(prompt);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 shrink-0 cursor-pointer truncate max-w-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form with Dark Theme Field Color */}
              <form onSubmit={handleAsk} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What if I spill fuel, or why is petrol capped at 5L?"
                  className="flex-1 px-3 py-2 text-xs border border-neutral-700 rounded-xl bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isAsking || !question.trim()}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-neutral-950 font-black text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mandatory Footer Disclaimer */}
        <div className="px-6 py-2.5 bg-[#0a0c13] border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <p className="italic">
            AI guidance is for educational reference. Follow local petroleum laws, OEM user manuals, and certified emergency guidelines.
          </p>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors shrink-0 ml-4 border border-neutral-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
