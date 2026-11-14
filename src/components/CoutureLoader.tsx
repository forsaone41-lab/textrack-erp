import React from 'react';

interface CoutureLoaderProps {
  minHeight?: string;
}

export const CoutureLoader: React.FC<CoutureLoaderProps> = ({
  minHeight = 'min-h-[50vh]'
}) => {
  return (
    <div className={`w-full ${minHeight} flex items-center justify-center relative select-none animate-in fade-in duration-200`}>
      {/* Subtle Ambient Glow */}
      <div className="absolute w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />

      {/* Pure Minimalist Cutting Scissors (مقص بوحدو) */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        <svg
          className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400 filter drop-shadow-[0_0_12px_rgba(99,102,241,0.35)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Top Blade & Ring */}
          <g className="origin-[12px_12px] animate-[snipTop_0.8s_ease-in-out_infinite]">
            <circle cx="6" cy="6" r="3" />
            <path d="M8.12 8.12 12 12m0 0 8 4" />
          </g>

          {/* Bottom Blade & Ring */}
          <g className="origin-[12px_12px] animate-[snipBottom_0.8s_ease-in-out_infinite]">
            <circle cx="6" cy="18" r="3" />
            <path d="M8.12 15.88 12 12m0 0 8-4" />
          </g>

          {/* Pivot Screw */}
          <circle cx="12" cy="12" r="1" fill="#818CF8" />
        </svg>
      </div>

      <style>{`
        @keyframes snipTop {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes snipBottom {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg); }
        }
      `}</style>
    </div>
  );
};
