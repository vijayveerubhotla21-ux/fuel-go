import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Fuel, PhoneCall, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onOpenSafetyCenter: () => void;
  onOpenAiAssistant: () => void;
  onNavigateToHistory: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSafetyCenter,
  onOpenAiAssistant,
  onNavigateToHistory,
}) => {
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & EAGLE Team */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" showTagline={true} inverted={true} />
            <p className="text-xs text-neutral-400 leading-relaxed">
              EAGLE — Building Smarter Fuel Logistics.
              On-demand doorstep refueling platform engineered for safety, transparency, and high reliability.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Team EAGLE • Startup Project
              </span>
            </div>
          </div>

          {/* Col 2: Services & Statutory Limits */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Fuel Services</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-neutral-300 font-semibold">Petrol Delivery</span>
                <span className="block text-[11px] text-neutral-500">1 L min — 5 L max per order</span>
              </li>
              <li>
                <span className="text-neutral-300 font-semibold">Diesel Delivery</span>
                <span className="block text-[11px] text-neutral-500">1 L min — 10 L max per order</span>
              </li>
              <li>
                <span className="text-neutral-300">Deliver Now & Scheduled Slots</span>
              </li>
              <li>
                <span className="text-neutral-300">Mandatory Petrol Bunk Receipts</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Safety & Resources */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Safety & Learning</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenSafetyCenter}
                  className="hover:text-white transition-colors text-left"
                >
                  Statutory Safety Protocols
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAiAssistant}
                  className="hover:text-white transition-colors text-left"
                >
                  AI Fuel Safety Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToHistory}
                  className="hover:text-white transition-colors text-left"
                >
                  GST Invoices & History
                </button>
              </li>
              <li>
                <span className="text-neutral-500">PESO Guidelines & Anti-Static Care</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Statutory Notice & Emergency Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Emergency Hotline</h4>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              FuelGo is not a replacement for emergency rescue services. In case of active fire or vehicle hazard:
            </p>
            <div className="space-y-1 font-mono text-[11px] font-bold text-amber-300">
              <p>🔥 National Fire Service: 101</p>
              <p>🚨 National Emergency: 112</p>
              <p>🚑 Ambulance: 102</p>
            </div>
            <p className="text-[10px] text-neutral-500 pt-1">
              All transactions conducted in Indian Rupees (INR ₹).
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} FuelGo. Engineered by Team EAGLE. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for safer Indian roads</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
