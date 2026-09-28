import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 26, text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 34, text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 42, text: 'text-2xl', badge: 'text-xs px-2.5 py-1' },
    xl: { icon: 50, text: 'text-3xl', badge: 'text-xs px-3 py-1' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Dark Cyber/Tactical Brand Mark */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Neon Glow Behind Logo */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/30 via-teal-500/20 to-amber-500/30 blur-md group-hover:blur-lg transition-all"
          style={{ width: currentSize.icon + 10, height: currentSize.icon + 10 }}
        />

        {/* Icon Container */}
        <div
          className="relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-neutral-700/80 shadow-2xl shadow-emerald-950/50"
          style={{ width: currentSize.icon + 10, height: currentSize.icon + 10 }}
        >
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          >
            {/* Hexagonal Fuel Cell Shield */}
            <path
              d="M18 3L30 9.5V23L18 33L6 23V9.5L18 3Z"
              fill="#064e3b"
              fillOpacity="0.4"
              stroke="#10b981"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Fuel Pump Nozzle Core */}
            <path
              d="M13 24V13C13 11.8954 13.8954 11 15 11H20C21.1046 11 22 11.8954 22 13V24"
              stroke="#f3f4f6"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Digital Gauge / Meter */}
            <rect
              x="15"
              y="13"
              width="5"
              height="3.5"
              rx="0.5"
              fill="#10b981"
              fillOpacity="0.9"
            />
            {/* Nozzle Hose Routing */}
            <path
              d="M22 14.5H24.5C25.3284 14.5 26 15.1716 26 16V20.5C26 21.0523 26.4477 21.5 27 21.5C27.5523 21.5 28 21.0523 28 20.5V17L25 14"
              stroke="#34d399"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Energy Lightning Speed Bolt */}
            <path
              d="M18.5 17L15 22H18L17 26.5L21.5 20.5H18.5L20 17H18.5Z"
              fill="#fbbf24"
              filter="drop-shadow(0 0 4px #f59e0b)"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 leading-none">
          <span className={`font-black tracking-tight ${currentSize.text} text-white`}>
            Fuel<span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">Go</span>
          </span>
          {/* Team EAGLE Insignia Badge */}
          <span
            className={`font-black uppercase tracking-wider rounded-lg font-mono bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] ${currentSize.badge}`}
            title="Engineered by Team EAGLE"
          >
            EAGLE
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-normal mt-1 text-neutral-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Smart On-Demand Fuel Delivery</span>
          </span>
        )}
      </div>
    </div>
  );
};
