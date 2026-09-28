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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-950 via-neutral-900 to-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">FuelGo Safety & Compliance Center</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Statutory Guidelines
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Official Safety Protocols • Petroleum Act & PESO Safety Standards • Emergency Actions
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-neutral-800 text-xs">
          {/* Statutory Emergency Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">FuelGo is Not a Replacement for Emergency Services</p>
              <p className="leading-relaxed">
                If you encounter a vehicle fire, severe petroleum vapor leak, or road accident, immediately evacuate
                to an upwind location and contact Government Emergency Services.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 font-bold">
                <span>🔥 Fire Services: Dial 101</span>
                <span>🚨 National Emergency: Dial 112</span>
                <span>🚑 Ambulance: Dial 102</span>
              </div>
            </div>
          </div>

          {/* Core Safety Directives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Directive 1 */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <Flame className="w-4 h-4" />
                <span>Keep Away from Ignition Sources</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Petroleum fuel vapors are heavier than air and travel along ground level. Keep all delivery operations at
                least 10 meters away from hot exhaust pipes, open sparks, pilot lights, or electrical generators.
              </p>
            </div>

            {/* Directive 2 */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <Cigarette className="w-4 h-4" />
                <span>Strict No Smoking Policy</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Smoking, lit matches, electronic cigarettes, or mobile phone sparks are strictly prohibited within 15 meters
                of a fuel container or dispensing vehicle.
              </p>
            </div>

            {/* Directive 3 */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 font-bold">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>Use Qualified Technical Personnel</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Do not attempt complex fuel line or fuel tank modifications yourself. FuelGo riders are certified solely
                for safe container delivery and fuel dispensing into OEM tank inlets.
              </p>
            </div>

            {/* Directive 4 */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 font-bold">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>No Unsafe Fuel Transfers</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Never siphon fuel by mouth or use ungrounded household plastic containers. Doing so invites severe chemical
                pneumonitis and electrostatic explosion risks.
              </p>
            </div>
          </div>

          {/* Statutory Delivery Limits Explanation */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-700" /> Why FuelGo Enforces 5L Petrol & 10L Diesel Limits
            </h4>
            <p className="text-neutral-700 leading-relaxed">
              Under India’s Petroleum Rules (governed by the Petroleum and Explosives Safety Organisation - PESO), carrying
              flammable hydrocarbons in motor vehicle transport without heavy bulk bowser licensing is strictly limited to
              certified small containers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <p className="font-bold text-neutral-900">Petrol: 1 to 5 Litres Max</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Provides 60–80 km emergency range to safely reach nearest retail outlet while minimizing vapor buildup.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <p className="font-bold text-neutral-900">Diesel: 1 to 10 Litres Max</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Provides 100–140 km emergency range for commercial and passenger diesel vehicles with safe flashpoint control.
                </p>
              </div>
            </div>
          </div>

          {/* Petrol Bunk Proof Guarantee */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Petrol Bunk Verification Integrity
            </h4>
            <p className="text-neutral-700 leading-relaxed">
              Every FuelGo courier is bound by our mandatory proof system: the courier must purchase fuel from a licensed
              OMC station (IOCL, HPCL, BPCL, Shell), upload the receipt with bunk name and volume, and have it verified
              before any delivery can be finalized.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>FuelGo Safety First • Team EAGLE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
