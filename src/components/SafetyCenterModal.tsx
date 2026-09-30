import React from 'react';
import {
  X,
  ShieldAlert,
  Flame,
  Cigarette,
  PhoneCall,
  AlertTriangle,
  FileCheck2,
  Car,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

interface SafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyCenterModal: React.FC<SafetyCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#0d0f17] text-neutral-100 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-950/80 via-neutral-900 to-[#0a0c13] text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">FuelGo Safety & Compliance Center</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Statutory Guidelines
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Official Safety Protocols • Petroleum Act & PESO Standards • Emergency Response
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-neutral-300">
          {/* Statutory Emergency Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-white">FuelGo is Not a Replacement for Government Emergency Services</p>
              <p className="leading-relaxed text-neutral-300">
                If you encounter a vehicle fire, severe petroleum vapor leak, or road accident, immediately evacuate
                to an upwind location and contact Government Emergency Services.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 font-bold font-mono text-[11px] text-rose-300">
                <span>🔥 Fire Services: Dial 101</span>
                <span>🚨 National Emergency: Dial 112</span>
                <span>🚑 Ambulance: Dial 102</span>
              </div>
            </div>
          </div>

          {/* Core Safety Directives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Directive 1 */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Flame className="w-4 h-4" />
                <span>Keep Away from Ignition Sources</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Petroleum fuel vapors are heavier than air and travel along ground level. Keep all delivery operations at
                least 10 meters away from hot exhaust pipes, open sparks, pilot lights, or electrical generators.
              </p>
            </div>

            {/* Directive 2 */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Cigarette className="w-4 h-4" />
                <span>Strict No Smoking Policy</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Smoking, lit matches, electronic cigarettes, or mobile phone sparks are strictly prohibited within 15 meters
                of a fuel container or dispensing vehicle.
              </p>
            </div>

            {/* Directive 3 */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Wrench className="w-4 h-4" />
                <span>Use Qualified Technical Personnel</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Do not attempt complex fuel line or fuel tank modifications yourself. FuelGo riders are certified solely
                for safe container delivery and fuel dispensing into OEM tank inlets.
              </p>
            </div>

            {/* Directive 4 */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Car className="w-4 h-4" />
                <span>No Unsafe Fuel Transfers</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Never siphon fuel by mouth or use ungrounded household plastic containers. Doing so invites severe chemical
                pneumonitis and electrostatic explosion risks.
              </p>
            </div>
          </div>

          {/* Statutory Delivery Limits Explanation */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-400" /> Why FuelGo Enforces 5L Petrol & 10L Diesel Limits
            </h4>
            <p className="text-neutral-300 leading-relaxed">
              Under India’s Petroleum Rules (governed by the Petroleum and Explosives Safety Organisation - PESO), carrying
              flammable hydrocarbons in motor vehicle transport without heavy bulk bowser licensing is strictly limited to
              certified small containers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="font-bold text-emerald-400">Petrol: 1 to 5 Litres Max</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Provides 60–80 km emergency range to safely reach nearest retail outlet while minimizing vapor buildup.
                </p>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="font-bold text-amber-400">Diesel: 1 to 10 Litres Max</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Provides 100–140 km emergency range for commercial and passenger diesel vehicles with safe flashpoint control.
                </p>
              </div>
            </div>
          </div>

          {/* Petrol Bunk Proof Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Anti-Adulteration & Bunk Audit Guarantee
            </h4>
            <p className="text-neutral-300 leading-relaxed">
              Every drop of fuel delivered via FuelGo is backed by an automated audit pipeline. Couriers must upload
              photo receipts directly from certified Oil Marketing Company (IOCL, HPCL, BPCL, Shell) retail pumps,
              ensuring zero adulteration and calibrated volume precision.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a0c13] border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Engineered by Team EAGLE • PESO Protocol Verified</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors cursor-pointer border border-neutral-700"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
