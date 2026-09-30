import React, { useState } from 'react';
import {
  Fuel,
  Navigation,
  Clock,
  CreditCard,
  FileCheck2,
  Bot,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  Car,
  ArrowRight,
  ExternalLink,
  Building2,
  Video,
} from 'lucide-react';
import { Logo } from './Logo';
import { FuelType } from '../types';
import { RootLiveMapTracker } from './RootLiveMapTracker';

interface LandingPageProps {
  onOrderNow: (fuelType?: FuelType) => void;
  onOpenTracking: () => void;
  onOpenAiAssistant: () => void;
  onOpenSafetyCenter: () => void;
  customerLocation?: { lat: number; lng: number; address?: string } | null;
  onOrderAtLocation?: (fuelType: FuelType, coords: { lat: number; lng: number; address: string }) => void;
  onOpenGovtSanction?: () => void;
  onOpenDeliveryVideo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOrderNow,
  onOpenTracking,
  onOpenAiAssistant,
  onOpenSafetyCenter,
  customerLocation,
  onOrderAtLocation,
  onOpenGovtSanction,
  onOpenDeliveryVideo,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqList = [
    {
      q: 'What fuel can I order?',
      a: 'FuelGo delivers BS-VI certified Petrol and Diesel sourced directly from authorized government-licensed oil marketing company (OMC) petrol bunks.',
    },
    {
      q: 'What is the Petrol limit?',
      a: 'Petrol orders have a strict statutory limit of 1 Litre minimum and 5 Litres maximum per order to comply with Petroleum Act and PESO container transit guidelines.',
    },
    {
      q: 'What is the Diesel limit?',
      a: 'Diesel orders have a limit of 1 Litre minimum and 10 Litres maximum per order.',
    },
    {
      q: 'Can I schedule delivery?',
      a: 'Yes. You can select "Deliver Now" for immediate emergency dispatch (15–30 mins) or choose "Schedule for Later" with a specific future date and time slot.',
    },
    {
      q: 'Can I track my order?',
      a: 'Yes! FuelGo features live MapTiler GPS tracking showing your assigned driver’s live position, vehicle number, destination pin, and real-time arrival ETA.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support UPI (Google Pay, PhonePe, Paytm), Debit Cards, Credit Cards, Net Banking, Mobile Wallets, and Cash on Delivery (COD).',
    },
    {
      q: 'What currency is used?',
      a: 'FuelGo exclusively transacts in Indian Rupees (INR / ₹). All fuel prices, rider charges, and tax invoices are itemized in INR.',
    },
    {
      q: 'Is there a rider charge?',
      a: 'Yes. FuelGo maintains a separate, transparent Rider / Delivery Charge that covers PESO-compliant antistatic transport and hazardous handling. It is never hidden inside fuel costs.',
    },
    {
      q: 'Can I see the petrol-bunk proof?',
      a: 'Yes. FuelGo enforces a mandatory Petrol Bunk Proof rule: our rider must upload a verifiable photo receipt from the petrol bunk showing the fuel station name, volume, and date before the delivery can be completed.',
    },
    {
      q: 'How do I receive my invoice?',
      a: 'An official GST-compliant tax invoice is automatically generated upon order/payment confirmation. You can view, print, or download it anytime.',
    },
    {
      q: 'What should I do during an emergency?',
      a: 'FuelGo is for fuel delivery and is not an emergency response unit. For active fires, chemical leaks, or serious road accidents, dial 101 (Fire) or 112 (National Emergency) immediately.',
    },
  ];

  return (
    <div className="space-y-24 pb-20 text-neutral-100">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pb-24">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700/80 text-white text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Built by Team EAGLE</span>
            <span className="text-neutral-600">•</span>
            <span className="text-amber-300 font-mono">Doorstep Precision Fuel Logistics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Doorstep Precision Fuel Delivery <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">
              Directly to Your Vehicle Spot
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-400 leading-relaxed">
            Stranded with an empty tank or need generator top-ups? Order certified Petrol (1–5L) or Diesel (1–10L).
            Track in real-time with MapTiler live GPS and inspect mandatory petrol bunk purchase receipts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onOrderNow('Petrol')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Fuel className="w-4 h-4 text-neutral-950" />
              <span>Order Fuel Now</span>
            </button>

            <button
              onClick={onOpenTracking}
              className="px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-xl border border-neutral-700 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Track Live Delivery</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-5 py-3.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 font-bold text-sm border border-neutral-800 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Fuel Assistant</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Genuine OMC Petrol Bunk Fuel
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> MapTiler Live GPS & Route Distance
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mandatory Purchase Receipts
            </span>
          </div>

          {/* Government Sanction & Relief Pilot Banner */}
          <div className="mt-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-neutral-900/90 to-emerald-950/40 border border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    PESO & MoPNG SANCTIONED
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Ref: PESO/DLV-EMERG/2026/GOI-9842</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Government-Sanctioned Emergency Doorstep Fuel Supply Pilot
                </h3>
                <p className="text-xs text-neutral-400 max-w-xl">
                  Official authorization to deliver 5L BS-VI petrol directly to stranded vehicles & citizens facing roadway fuel starvation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              {onOpenGovtSanction && (
                <button
                  onClick={onOpenGovtSanction}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Inspect Govt Form & Apply</span>
                </button>
              )}
              {onOpenDeliveryVideo && (
                <button
                  onClick={onOpenDeliveryVideo}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Watch Video</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROOT LIVE MAP TRACKING & AREA VISIBILITY RADAR */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE GPS FLEET TELEMATICS & SECTOR COVERAGE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Live Fleet Tracking & Service Area Visibility
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Real-time sector radar displaying operational geofenced perimeters (5km, 10km, 15km),
              patrolling mobile dispensers, certified OMC partner fuel pumps, and instant doorstep order dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOrderNow('Petrol')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Fuel className="w-4 h-4" />
              <span>Request Fuel to Pin</span>
            </button>
          </div>
        </div>

        {/* Live Root Map Tracker Component */}
        <RootLiveMapTracker
          initialLocation={customerLocation}
          onOrderAtLocation={onOrderAtLocation}
        />
      </section>

      {/* 3. HOW FUELGO WORKS */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">How FuelGo Works</h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            From instant order placement to safe vehicle tank dispensing in under 30 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Select Fuel & Litres',
              desc: 'Choose Petrol (1–5L) or Diesel (1–10L). Instant preset chips or custom input with real-time validation.',
              icon: Fuel,
            },
            {
              step: '02',
              title: 'Pin Location & Timing',
              desc: 'Use device GPS to drop your delivery pin. Choose Deliver Now or schedule a future slot.',
              icon: MapPin,
            },
            {
              step: '03',
              title: 'Pay in INR & Track GPS',
              desc: 'Transparent pricing with separate rider charge. Track your PESO carrier live on MapTiler map.',
              icon: Navigation,
            },
            {
              step: '04',
              title: 'Bunk Proof & Dispensing',
              desc: 'Rider uploads verified petrol bunk receipt photo before dispensing into your vehicle.',
              icon: FileCheck2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0f1118] rounded-2xl border border-neutral-800 p-6 shadow-xl space-y-3 relative hover:border-emerald-500/50 transition-all"
              >
                <span className="text-2xl font-black text-neutral-700 font-mono">{item.step}</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FUEL TYPES & STATUTORY QUANTITY LIMITS */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            PESO Compliance Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Supported Fuel Types & Order Limits</h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Engineered strictly within safety limits to prevent illegal fuel hoarding while providing ample emergency range.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Petrol Card */}
          <div className="bg-gradient-to-br from-emerald-950/30 via-[#0d0f17] to-neutral-950 rounded-3xl border border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-neutral-950 flex items-center justify-center shadow-lg font-black">
                  <Fuel className="w-6 h-6 text-neutral-950" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Petrol (BS-VI)</h3>
                  <p className="text-xs text-neutral-400">High-Octane Unleaded Auto Fuel</p>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                ₹104.25 / L
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between font-bold text-neutral-300">
                <span>Minimum Order:</span>
                <span className="font-mono text-emerald-400">1 Litre</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-300">
                <span>Maximum Order Limit:</span>
                <span className="font-mono text-emerald-400">5 Litres per order</span>
              </div>
              <div className="flex justify-between font-medium text-neutral-500 pt-1">
                <span>Quick Preset Buttons:</span>
                <span className="font-mono text-neutral-400">1L, 2L, 3L, 4L, 5L</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Provides 60–80 km of emergency driving range to comfortably reach the nearest commercial petrol pump.
              Enforced with rigorous server-side validation.
            </p>

            <button
              onClick={() => onOrderNow('Petrol')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Order Petrol (1–5L)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Diesel Card */}
          <div className="bg-gradient-to-br from-amber-950/30 via-[#0d0f17] to-neutral-950 rounded-3xl border border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg font-black">
                  <Fuel className="w-6 h-6 text-neutral-950" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Diesel (BS-VI)</h3>
                  <p className="text-xs text-neutral-400">Ultra-Low Sulfur Premium Diesel</p>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-mono">
                ₹91.80 / L
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between font-bold text-neutral-300">
                <span>Minimum Order:</span>
                <span className="font-mono text-amber-400">1 Litre</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-300">
                <span>Maximum Order Limit:</span>
                <span className="font-mono text-amber-400">10 Litres per order</span>
              </div>
              <div className="flex justify-between font-medium text-neutral-500 pt-1">
                <span>Quick Preset Buttons:</span>
                <span className="font-mono text-neutral-400">1L, 2L, 5L, 7L, 10L</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Ideal for diesel SUVs, commercial utility vehicles, and residential backup generators.
              Dispensed from certified antistatic PESO carriers.
            </p>

            <button
              onClick={() => onOrderNow('Diesel')}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Order Diesel (1–10L)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. MANDATORY PETROL BUNK PROOF HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[#0f1118] rounded-3xl p-8 sm:p-12 text-white border border-neutral-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Mandatory Safety System</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Mandatory Petrol Bunk Purchase Proof
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              No FuelGo order can be marked "Delivered" without a verified purchase receipt uploaded by the rider.
              You inspect the fuel bunk name (IOCL, HPCL, BPCL, Shell), receipt number, and amount paid directly in your app.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-emerald-400 font-bold block">100% Genuine OMC Fuel</span>
                <span className="text-neutral-500 text-[11px]">Tamper-proof seals on all cans</span>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-emerald-400 font-bold block">Full Cost Transparency</span>
                <span className="text-neutral-500 text-[11px]">Original bunk receipt photo provided</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="aspect-video rounded-xl overflow-hidden bg-neutral-950 relative border border-neutral-700">
              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80"
                alt="Receipt Sample"
                className="w-full h-full object-cover opacity-80"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/90 text-[10px] text-emerald-400 font-mono border border-emerald-500/30">
                Verified Bunk Proof
              </span>
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">Indian Oil Corporation — Indiranagar Bunk</p>
              <p className="text-neutral-400 text-[11px] font-mono">Receipt #IOCL-B77-98124 • 5L Petrol</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENT PRICING & SEPARATE RIDER CHARGE */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            Zero Hidden Markups
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Itemized INR Pricing</h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            FuelGo never inflates fuel pump prices. The delivery charge is completely separate and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-6 bg-[#0f1118] rounded-2xl border border-neutral-800 shadow-xl space-y-2">
            <span className="text-xs font-bold text-neutral-500 uppercase font-mono">Fuel Cost</span>
            <p className="text-lg font-black text-white">Official Pump Rate</p>
            <p className="text-xs text-neutral-400">Quantity × Government Bunk Rate per Litre</p>
          </div>

          <div className="p-6 bg-[#0f1118] rounded-2xl border border-neutral-800 shadow-xl space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase font-mono">Rider Service Charge</span>
            <p className="text-lg font-black text-emerald-400">₹60.00 Base Fee</p>
            <p className="text-xs text-neutral-400">Covers certified courier transit & safe handling</p>
          </div>

          <div className="p-6 bg-[#0f1118] rounded-2xl border border-neutral-800 shadow-xl space-y-2">
            <span className="text-xs font-bold text-neutral-500 uppercase font-mono">Applicable GST</span>
            <p className="text-lg font-black text-white">5% Tax</p>
            <p className="text-xs text-neutral-400">Compliant GST tax invoice provided</p>
          </div>

          <div className="p-6 bg-neutral-900 text-white rounded-2xl border border-emerald-500/30 shadow-xl space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase font-mono">Currency Standard</span>
            <p className="text-lg font-black text-white">Indian Rupees (INR ₹)</p>
            <p className="text-xs text-neutral-400">Accepted via UPI, Card, Net Banking & COD</p>
          </div>
        </div>
      </section>

      {/* 6. TEAM EAGLE IDENTITY */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
            <span>Team EAGLE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            EAGLE — Building Smarter Fuel Logistics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            The dedicated engineering and operations team behind the FuelGo technology platform.
          </p>
        </div>

        {/* Professional Placeholder Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: 'Product & Systems Architecture',
              focus: 'End-to-end platform design, PESO regulatory workflows, and order state machines.',
              badge: 'Team EAGLE',
            },
            {
              role: 'Full-Stack & GPS Engineering',
              focus: 'MapTiler integration, server-side quantity & pricing validation, and instant invoices.',
              badge: 'Team EAGLE',
            },
            {
              role: 'Operations & Fleet Governance',
              focus: 'Driver dispatch, petrol bunk receipt verification queue, and safety center oversight.',
              badge: 'Team EAGLE',
            },
            {
              role: 'Quality & Security Compliance',
              focus: 'RBAC authorization, input sanitization, audit logging, and payment verification.',
              badge: 'Team EAGLE',
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-[#0f1118] rounded-2xl border border-neutral-800 p-6 shadow-xl space-y-4 hover:border-neutral-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
                0{idx + 1}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  {member.badge}
                </span>
                <h4 className="font-bold text-sm text-white mt-1">{member.role}</h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{member.focus}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqList.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-[#0f1118] rounded-2xl border border-neutral-800 overflow-hidden shadow-xl transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-200 hover:text-white transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/80 bg-neutral-900/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
