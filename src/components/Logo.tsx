import React from 'react';
import fuelgoLogoImg from '../assets/fuelgo_logo.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  inverted?: boolean;
  variant?: 'header' | 'full' | 'emblem';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { img: 32, height: 'h-8', text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { img: 40, height: 'h-10', text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { img: 48, height: 'h-12', text: 'text-2xl', badge: 'text-xs px-2.5 py-1' },
    xl: { img: 58, height: 'h-14', text: 'text-3xl', badge: 'text-xs px-3 py-1' },
  };

  const currentSize = sizeMap[size];

  // HEADER VARIANT: Sleek, modern, and dark-themed visual logo that completely replaces the text-based brand name
  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
        {/* Glow Halo */}
        <div className="relative flex items-center">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/40 via-teal-500/20 to-amber-500/30 blur-md group-hover:blur-lg transition-all duration-300 opacity-80" />

          {/* Precision Logo Emblem Container */}
          <div className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-neutral-950 border border-emerald-500/50 shadow-[0_0_18px_rgba(16,185,129,0.35)] group-hover:border-emerald-400 transition-all duration-300 ring-1 ring-white/10">
            <img
              src={fuelgoLogoImg}
              alt="FuelGo Logo Emblem"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              style={{ width: currentSize.img + 2, height: currentSize.img + 2 }}
            />
          </div>
        </div>

        {/* Integrated Logo Brandmark (Stylized Emblem Badge replacing plain text) */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {/* High-Tech Vector Brand Emblem Plaque */}
            <div className="relative flex items-center">
              <svg height={size === 'sm' ? 20 : size === 'lg' ? 28 : 24} viewBox="0 0 130 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-auto filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                {/* FuelGo Custom Stylized Wordmark */}
                <text x="2" y="21" fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="-0.5">
                  Fuel
                </text>
                <text x="49" y="21" fill="#10B981" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="-0.5">
                  Go
                </text>
                {/* Cyber accent underbar */}
                <rect x="50" y="24" width="28" height="2" rx="1" fill="#34D399" opacity="0.8" />
                <circle cx="82" cy="25" r="1.5" fill="#F59E0B" />
              </svg>
            </div>

            {/* Team EAGLE Aerospace Micro-Badge */}
            <span className="font-black uppercase tracking-wider rounded-md font-mono bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/10 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] text-[9px] px-1.5 py-0.5">
              EAGLE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span>PRECISION FUEL DISPATCH</span>
          </div>
        </div>
      </div>
    );
  }

  // EMBLEM ONLY VARIANT
  if (variant === 'emblem') {
    return (
      <div className={`relative flex items-center justify-center select-none group ${className}`}>
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-emerald-500/35 via-teal-500/20 to-amber-500/30 blur-md group-hover:blur-xl transition-all" />
        <div
          className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-neutral-950 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:border-emerald-400 transition-all ring-1 ring-white/10"
          style={{ width: currentSize.img + 6, height: currentSize.img + 6 }}
        >
          <img
            src={fuelgoLogoImg}
            alt="FuelGo Logo"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </div>
    );
  }

  // FULL VARIANT: Logo with image emblem & stylized branding
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Sleek Emblem with Glow */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/35 via-teal-500/25 to-amber-500/35 blur-md group-hover:blur-xl transition-all duration-300"
          style={{ width: currentSize.img + 8, height: currentSize.img + 8 }}
        />
        <div
          className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-neutral-950 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:border-emerald-400/70 transition-all duration-300 ring-1 ring-white/10"
          style={{ width: currentSize.img + 8, height: currentSize.img + 8 }}
        >
          <img
            src={fuelgoLogoImg}
            alt="FuelGo Logo"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 leading-none">
          <div className="relative flex items-center">
            <svg height={size === 'sm' ? 22 : size === 'lg' ? 30 : 26} viewBox="0 0 130 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-auto filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              <text x="2" y="21" fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="-0.5">
                Fuel
              </text>
              <text x="49" y="21" fill="#10B981" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="-0.5">
                Go
              </text>
              <rect x="50" y="24" width="28" height="2" rx="1" fill="#34D399" opacity="0.8" />
              <circle cx="82" cy="25" r="1.5" fill="#F59E0B" />
            </svg>
          </div>
          <span
            className={`font-black uppercase tracking-wider rounded-lg font-mono bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/10 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] ${currentSize.badge}`}
            title="Engineered by Team EAGLE"
          >
            EAGLE
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-normal mt-1 text-neutral-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span>Doorstep Precision Fuel Delivery</span>
          </span>
        )}
      </div>
    </div>
  );
};
