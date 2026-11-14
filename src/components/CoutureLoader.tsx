import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface CoutureLoaderProps {
  message?: string;
  subMessage?: string;
  minHeight?: string;
}

export const CoutureLoader: React.FC<CoutureLoaderProps> = ({
  message,
  subMessage,
  minHeight = 'min-h-[70vh]'
}) => {
  const { isAr } = useLang();
  const [progress, setProgress] = useState(12);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = isAr ? [
    '✂️ جاري تجهيز ورشة الباتروناج والموديلات...',
    '🧵 فحص تفاصيل القص وجداول المقاسات (Gradation)...',
    '💎 تدقيق ومزامنة الأجور والرصيد المالي بدقة...',
    '✨ ضبط اللمسات الأخيرة لفتح لوحة التحكم...'
  ] : [
    '✂️ Préparation de l\'atelier et des modèles...',
    '🧵 Vérification de la coupe et des gradations...',
    '💎 Synchronisation des rémunérations et du solde...',
    '✨ Finalisation de l\'affichage de votre espace...'
  ];

  useEffect(() => {
    // Smooth progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 94) return 94;
        const jump = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + jump, 94);
      });
    }, 280);

    // Step cycle
    const stepInterval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % steps.length);
    }, 900);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [steps.length]);

  return (
    <div className={`w-full ${minHeight} flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0e121d] via-[#090b10] to-[#06070a] rounded-3xl border border-white/[0.08] shadow-[0_20px_70px_rgba(0,0,0,0.8)] p-6 sm:p-10 select-none animate-in fade-in duration-300`}>
      
      {/* ─── Ambient Glow Effects ─── */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-[90px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* ─── Luxury Badge ─── */}
      <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md mb-8 shadow-xs">
        <img src="/logo-blue.png" alt="Beya" className="w-4 h-4 rounded object-contain shadow-xs" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">
          Beya Creative • Haute Confection
        </span>
        <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
      </div>

      {/* ─── Main Animated Haute Couture Visual ─── */}
      <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center mb-6">
        
        {/* Outer Circular Centimeter / Measuring Tape (Spinning slowly) */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '24s' }} viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="8"
          />
          {/* Tick marks of the measuring tape */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(99, 102, 241, 0.35)"
            strokeWidth="8"
            strokeDasharray="2 6"
          />
          {/* Golden highlight segment */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="8"
            strokeDasharray="24 180"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Counter-rotating dashed sewing seam ring */}
        <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }} viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
        </svg>

        {/* Inner Glowing Silk Thread Orbit */}
        <div className="absolute inset-8 rounded-full border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)] bg-gradient-to-tr from-indigo-950/40 to-slate-900/60 backdrop-blur-xs flex items-center justify-center" />

        {/* ─── Animated Scissors Cutting Motif (مقص كيقطع) ─── */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          
          {/* Animated Snip Scissors SVG */}
          <svg className="w-20 h-20 filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.5)]" viewBox="0 0 80 80" fill="none">
            {/* Fabric Seam Line being cut */}
            <line x1="8" y1="40" x2="72" y2="40" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeDasharray="3 3" />
            
            {/* Top Scissor Blade (Animated Snip) */}
            <g className="origin-[38px_40px] animate-[snipTop_0.9s_ease-in-out_infinite]">
              {/* Top Handle Loop */}
              <circle cx="22" cy="24" r="9" stroke="url(#bladeGold)" strokeWidth="3" fill="none" />
              <circle cx="22" cy="24" r="6" fill="#1e1b4b" />
              {/* Blade Arm connecting to point */}
              <path d="M 28 29 L 38 40 L 66 33" stroke="url(#bladeIndigo)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>

            {/* Bottom Scissor Blade (Animated Snip) */}
            <g className="origin-[38px_40px] animate-[snipBottom_0.9s_ease-in-out_infinite]">
              {/* Bottom Handle Loop */}
              <circle cx="22" cy="56" r="9" stroke="url(#bladeGold)" strokeWidth="3" fill="none" />
              <circle cx="22" cy="56" r="6" fill="#1e1b4b" />
              {/* Blade Arm connecting to point */}
              <path d="M 28 51 L 38 40 L 66 47" stroke="url(#bladeIndigo)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>

            {/* Center Pivot Screw */}
            <circle cx="38" cy="40" r="3.5" fill="#F59E0B" />
            <circle cx="38" cy="40" r="1.5" fill="#ffffff" />

            {/* Linear Gradients */}
            <defs>
              <linearGradient id="bladeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="bladeIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0E7FF" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Shimmer Sparkle at cutting tip */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-300 rounded-full blur-[1px] animate-ping" />
        </div>
      </div>

      {/* ─── Typography & Status ─── */}
      <div className="relative z-10 text-center max-w-md mx-auto space-y-2 mb-6">
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span>{message || (isAr ? 'جاري تجهيز ورشة الموديليست والحسابات...' : 'Chargement de l\'atelier et des comptes...')}</span>
        </h3>
        
        {/* Dynamic cycling step text */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-xs sm:text-sm font-bold text-indigo-300/90 tracking-wide transition-all duration-300 animate-in fade-in">
            {subMessage || steps[stepIndex]}
          </p>
        </div>
      </div>

      {/* ─── Luxury Filling Progress Bar (كايعمر) ─── */}
      <div className="relative z-10 w-64 sm:w-80 space-y-2">
        <div className="h-2.5 w-full bg-white/[0.05] border border-white/[0.09] rounded-full p-0.5 overflow-hidden shadow-inner relative">
          {/* Progress fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-300 ease-out relative shadow-[0_0_12px_rgba(99,102,241,0.8)]"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer light bar running through */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.4s_infinite]" />
          </div>
        </div>

        {/* Percentage and precision note */}
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 px-1">
          <span>{isAr ? 'مزامنة دقيقة ومباشرة' : 'Synchronisation directe'}</span>
          <span className="text-indigo-400 font-black">{progress}%</span>
        </div>
      </div>

      {/* ─── Embedded Keyframes Style ─── */}
      <style>{`
        @keyframes snipTop {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-24deg); }
        }
        @keyframes snipBottom {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(24deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
