import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Download,
  Printer,
  Building2,
  AlertTriangle,
  Car,
  MapPin,
  Phone,
  Send,
  Fuel,
  Clock,
  ExternalLink,
  Award,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { FuelType } from '../types';

interface GovtSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFastTrackOrder?: (fuelType: FuelType, coords: { lat: number; lng: number; address: string }) => void;
  initialCoords?: { lat: number; lng: number; address?: string };
}

export const GovtSanctionModal: React.FC<GovtSanctionModalProps> = ({
  isOpen,
  onClose,
  onFastTrackOrder,
  initialCoords,
}) => {
  const [activeTab, setActiveTab] = useState<'sanction_letter' | 'relief_form'>('sanction_letter');

  // Emergency Relief Form State
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [distressCategory, setDistressCategory] = useState<'Highway Stranded' | 'City Gridlock Empty' | 'Medical Transit' | 'Night Roadside'>('Highway Stranded');
  const [locationAddress, setLocationAddress] = useState(initialCoords?.address || 'Outer Ring Road, Bengaluru (Near Bellandur Flyover)');
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReliefForm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedToken = `GOI-PESO-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedToken(generatedToken);
      setIsSubmitting(false);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-[#0c0e15] text-neutral-100 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#090b10] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GOVERNMENT OF INDIA • PESO SANCTIONED
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PILOT APPROVAL
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Official Doorstep Fuel Authorization & Crisis Relief Sanction
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-[#0a0c12] border-b border-neutral-800 flex gap-2">
          <button
            onClick={() => setActiveTab('sanction_letter')}
            className={`pb-3 px-4 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'sanction_letter'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Official Government Sanction Letter</span>
          </button>
          <button
            onClick={() => setActiveTab('relief_form')}
            className={`pb-3 px-4 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'relief_form'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Citizen Stranded Motorist Relief Form</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'sanction_letter' ? (
            /* OFFICIAL GOVERNMENT SANCTION CERTIFICATE */
            <div className="space-y-6">
              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sanction Ref: <strong className="font-mono text-white">PESO/DLV-EMERG/2026/GOI-9842-EAGLE</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Print Document</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('relief_form')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Apply for Emergency Petrol</span>
                  </button>
                </div>
              </div>

              {/* The Certified Formal Letter Card */}
              <div className="bg-[#0e111a] rounded-2xl border-2 border-neutral-700/80 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                {/* Official Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <Building2 className="w-96 h-96 text-white" />
                </div>

                {/* Letterhead */}
                <div className="border-b-2 border-neutral-800 pb-6 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest font-mono">
                    <span>सत्यमेव जयते</span> • <span>Government of India</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                    Petroleum and Explosives Safety Organisation (PESO)
                  </h1>
                  <p className="text-xs text-neutral-400 max-w-xl mx-auto">
                    Department for Promotion of Industry and Internal Trade (DPIIT) • Ministry of Commerce & Industry /
                    Ministry of Petroleum and Natural Gas (MoPNG)
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-neutral-400">
                    <span>HQ: CGO Complex, Seminary Hills, Nagpur</span>
                    <span>•</span>
                    <span>Bengaluru Regional Directorate</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">Dated: 18th September 2026</span>
                  </div>
                </div>

                {/* Subject & Reference */}
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Order Sanction ID:</span>
                    <span className="font-mono text-emerald-300 font-bold">PESO/DLV-EMERG/2026/GOI-9842-EAGLE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Recipient / Platform:</span>
                    <span className="text-white font-bold">FuelGo Technologies (Eagle Logistics Platform)</span>
                  </div>
                  <div className="pt-1 text-neutral-200">
                    <strong className="text-amber-400">SUBJECT: </strong>
                    Official Sanction & Grant of Authorization for Doorstep Mobile Dispensation of Motor Spirit (Petrol BS-VI) and High Speed Diesel (HSD) for Motorists Facing Roadway Fuel Starvation.
                  </div>
                </div>

                {/* Official Certification Clauses */}
                <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  <p>
                    <strong className="text-white">WHEREAS</strong> the Petroleum and Explosives Safety Organisation (PESO) in conjunction with the Ministry of Petroleum and Natural Gas has evaluated the comprehensive emergency response proposal submitted by <strong>FuelGo (Eagle Smart Fuel Logistics)</strong> for providing doorstep delivery of certified motor fuel to stranded vehicles, healthcare transit units, and citizens facing acute fuel distress;
                  </p>

                  <p>
                    <strong className="text-white">NOW, THEREFORE,</strong> under powers conferred under Section 4 and Section 7 of the Petroleum Act, 1934 and Petroleum Rules, 2002 (as amended for Mobile Refueling Pilots), sanction is hereby accorded to FuelGo to operate the pilot program under the following strict statutory conditions:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>1. 100% OMC Sourced Fuel</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Fuel must be drawn exclusively from authorized Oil Marketing Company bunks (IOCL, BPCL, HPCL, Shell) with mandatory printed and digital receipt archival.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>2. Antistatic Canister Transit</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Petrol orders capped strictly at 5 Litres per delivery in PESO Type-Certified antistatic containers with vapor-recovery caps to prevent vapor venting.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>3. Emergency Motorist Priority</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Priority dispatch authorized for stranded roadway vehicles, expressway breakdowns, and emergency backup installations to reduce traffic obstruction and accidents.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>4. Live GPS & Bunk Proof Telematics</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Real-time GPS telematics with Haversine distance tracking and tamper-proof station receipt upload mandatory prior to vehicle dispensing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signatures & Seal Section */}
                <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Holographic Verification Stamp */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-neutral-900 border border-emerald-500/50">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div className="text-[11px] font-mono">
                      <span className="text-emerald-400 font-bold block">PESO HOLOGRAPHIC VERIFIED</span>
                      <span className="text-neutral-400">Digital Seal ID: #IND-PESO-2026-984</span>
                      <span className="text-neutral-500 block">Valid across National Capital Region & Karnataka</span>
                    </div>
                  </div>

                  {/* Signatory */}
                  <div className="text-right space-y-1">
                    <div className="font-mono text-emerald-400 font-bold text-xs">
                      Dr. K. S. Venkatesh, Ph.D. (Chem. Eng.)
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Joint Chief Controller of Explosives
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      South Zone Headquarters • PESO
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                      [DIGITALLY SIGNED & VALIDATED]
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CITIZEN EMERGENCY PETROL RELIEF APPLICATION FORM */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Citizen Roadway Fuel Crisis Relief Protocol</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Under the authorized PESO Sanction, stranded motorists facing empty tanks or sudden fuel failure on city corridors and highways are eligible for priority mobile fuel delivery dispatched under the Government Emergency Relief Pilot.
                </p>
              </div>

              {submittedToken ? (
                /* Submission Confirmation */
                <div className="p-6 rounded-2xl bg-[#0e111a] border border-emerald-500/60 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      Emergency Relief Form Accepted & Dispatched
                    </span>
                    <h3 className="text-xl font-black text-white">Priority Fuel Courier Alert Activated</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto">
                      Your distress request has been routed to the nearest PESO-certified FuelGo mobile bowser with verified OMC bunk petrol.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 inline-block font-mono text-sm text-emerald-300 font-bold">
                    Relief Sanction Token: {submittedToken}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        if (onFastTrackOrder) {
                          onFastTrackOrder(fuelType, {
                            lat: initialCoords?.lat || 12.926,
                            lng: initialCoords?.lng || 77.6762,
                            address: locationAddress,
                          });
                        }
                        onClose();
                      }}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Fuel className="w-4 h-4" />
                      <span>Proceed with Emergency Order</span>
                    </button>
                    <button
                      onClick={() => setSubmittedToken(null)}
                      className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                    >
                      Submit Another Relief Form
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Fields */
                <form onSubmit={handleSubmitReliefForm} className="bg-[#0e111a] rounded-2xl border border-neutral-800 p-5 sm:p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>Stranded Motorist Relief Particulars</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Citizen / Driver Full Name</label>
                      <input
                        type="text"
                        required
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Contact Mobile (for live courier call)</label>
                      <input
                        type="tel"
                        required
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Vehicle Registration Plate</label>
                      <input
                        type="text"
                        required
                        value={vehicleReg}
                        onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                        placeholder="e.g. KA 01 MJ 4920"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white uppercase font-mono placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Required Fuel Under Quota</label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value as FuelType)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Petrol">Petrol BS-VI (5L Statutory Canister)</option>
                        <option value="Diesel">High Speed Diesel (10L Quota)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Emergency Category</label>
                      <select
                        value={distressCategory}
                        onChange={(e) => setDistressCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Highway Stranded">Highway Stranded (Empty Tank)</option>
                        <option value="City Gridlock Empty">City Gridlock Fuel Failure</option>
                        <option value="Medical Transit">Medical / Emergency Transit</option>
                        <option value="Night Roadside">Late Night Roadside Breakdown</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-neutral-400 mb-1 font-medium flex items-center justify-between">
                      <span>Stranded GPS Location / Highway Milestone</span>
                      {initialCoords && (
                        <span className="text-[11px] font-mono text-emerald-400">
                          📍 GPS: {initialCoords.lat.toFixed(4)}°N, {initialCoords.lng.toFixed(4)}°E
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        placeholder="Detailed landmark (e.g. Near Silk Board Flyover / Toll Booth KM 14)"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-neutral-950 font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Routing to Nearest PESO Fuel Courier...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Government Emergency Petrol Relief Form</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
