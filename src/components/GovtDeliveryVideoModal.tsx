import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Building2,
  Fuel,
  Radio,
  Clock,
  Sparkles,
  Award,
  Video,
} from 'lucide-react';
import deliveryVideoThumb from '../assets/govt_delivery_video_thumb.jpg';

interface GovtDeliveryVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSanctionModal?: () => void;
}

export const GovtDeliveryVideoModal: React.FC<GovtDeliveryVideoModalProps> = ({
  isOpen,
  onClose,
  onOpenSanctionModal,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(18);
  const totalDuration = 165; // 2 mins 45 secs
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Auto-play timer loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          return 0; // loop
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed, totalDuration]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Synchronized subtitles for the documentary walkthrough
  const getSubtitles = () => {
    if (currentTime < 25) {
      return '🚨 [DISPATCH] Emergency fuel starvation distress call received from stranded vehicle on Outer Ring Road corridor.';
    } else if (currentTime < 55) {
      return '🚚 [APPROACH] FuelGo mobile bowser arrives on scene with PESO Type-Certified 5L antistatic fuel safety canister.';
    } else if (currentTime < 90) {
      return '⚡ [SAFETY LOCK] Technician attaches copper anti-static bonding clamp to vehicle chassis to eliminate electrostatic charge.';
    } else if (currentTime < 125) {
      return '⛽ [DISPENSATION] Verified BS-VI Petrol dispensed safely into vehicle tank at 12.4 L/min via vapor-recovery nozzle.';
    } else if (currentTime < 150) {
      return '📄 [BUNK PROOF] OMC fuel station receipt scanned & verified via mobile telematics; digital tax invoice generated.';
    } else {
      return '✅ [RESUMED] Vehicle successfully restarted in under 18 minutes without towing delay or hazardous jerry can usage.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-[#0c0e15] text-neutral-100 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#090b10] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GOVT PILOT VIDEO STREAM
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-neutral-800 text-neutral-300">
                  4K 60FPS TELEMATICS
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white">
                Government Emergency Fuel Delivery Case Study & Walkthrough
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas & HUD */}
        <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center select-none group">
          {/* Main Visual Frame */}
          <img
            src={deliveryVideoThumb}
            alt="Government Emergency Fuel Delivery in Action"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />

          {/* Animated Overlay Grid & HUD elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

          {/* Top Video Stream Metadata */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 text-[11px] font-mono pointer-events-none">
            <div className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE CAM-02 • PILOT DISPATCH</span>
            </div>
            <div className="px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-neutral-700 text-neutral-300">
              GPS: 12.9261°N, 77.6762°E
            </div>
            <div className="px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-neutral-700 text-amber-300 font-bold">
              FLOW: 12.4 L/MIN
            </div>
          </div>

          {/* Live Subtitle Banner */}
          <div className="absolute bottom-16 inset-x-4 z-20 pointer-events-none">
            <div className="max-w-2xl mx-auto px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-neutral-700 text-center shadow-2xl">
              <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                {getSubtitles()}
              </p>
            </div>
          </div>

          {/* Center Play/Pause button on hover */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute z-20 w-16 h-16 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.8)] transition-transform hover:scale-110 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>

          {/* Bottom Player Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 z-30 p-3 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col gap-2">
            {/* Scrubber slider */}
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={totalDuration}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="flex-1 accent-emerald-500 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
              />
              <span>{formatTime(totalDuration)}</span>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setCurrentTime(0)}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <span className="text-[11px] text-neutral-400 hidden sm:inline font-mono">
                  MoPNG & PESO Case Study Broadcast
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Speed buttons */}
                <button
                  onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1)}
                  className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] font-mono text-neutral-300 hover:text-white"
                >
                  {playbackSpeed}x
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details & Call to Action */}
        <div className="p-4 sm:p-5 bg-[#0a0c12] border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Government Endorsement Key Takeaways:</span>
            </div>
            <p className="text-neutral-400 text-[11px] max-w-xl">
              Eliminates dangerous roadside walks with open plastic bottles. Safe delivery of 5L petrol directly to vehicles under Section 4 of Petroleum Rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenSanctionModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSanctionModal();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>View Govt Sanction Form</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
