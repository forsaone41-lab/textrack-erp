import React, { useState } from 'react';
import { Store, Globe, ArrowRight, RefreshCw, AlertCircle, Home, Sparkles } from 'lucide-react';

interface StoreNotFoundViewProps {
  requestedDomain: string;
}

export default function StoreNotFoundView({ requestedDomain }: StoreNotFoundViewProps) {
  const [isAr, setIsAr] = useState(false);

  const displayUrl = requestedDomain.startsWith('http') 
    ? requestedDomain 
    : `https://${requestedDomain}`;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ─── Top Bar ────────────────────────────────────────────────── */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-sm tracking-widest text-white uppercase">
            BEYA <span className="text-indigo-400">STORES</span>
          </span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setIsAr(!isAr)}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-200 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isAr ? 'Français' : 'العربية'}</span>
        </button>
      </header>

      {/* ─── Main 404 Hero Card ─────────────────────────────────────── */}
      <main className="max-w-xl w-full mx-auto my-auto py-10">
        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/60 text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* 404 Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black tracking-widest uppercase mb-6">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isAr ? '404 • المتجر غير موجود' : '404 • BOUTIQUE INTROUVABLE'}</span>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 mx-auto flex items-center justify-center mb-6 shadow-inner relative group">
            <Store className="w-10 h-10 text-slate-400 group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-rose-500/50">
              ✕
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 text-white">
            {isAr ? 'هذا المتجر غير متوفر' : 'Cette boutique n’existe pas'}
          </h1>

          {/* Domain Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300 max-w-full truncate mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="truncate">{displayUrl}</span>
          </div>

          {/* Subtitle */}
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-8 font-medium">
            {isAr
              ? 'الرابط الذي قمت بزيارته لا ينتمي لأي متجر نشط على منصة Beya Creative. يرجى التأكد من صحة الرابط أو إنشاء متجرك الخاص الآن.'
              : 'L’adresse que vous avez saisie ne correspond à aucune boutique active sur notre plateforme. Vérifiez l’orthographe du lien ou lancez votre propre boutique dès maintenant.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://beyacreative.com/#/store-signup"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white text-xs font-black shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{isAr ? 'أنشئ متجرك مجاناً' : 'Créer ma propre boutique'}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </a>

            <a
              href="https://beyacreative.com"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>{isAr ? 'الصفحة الرئيسية' : 'Accueil Beya'}</span>
            </a>

            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              title={isAr ? 'إعادة المحاولة' : 'Recharger'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة المحاولة' : 'Réessayer'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="max-w-5xl w-full mx-auto py-4 text-center border-t border-white/5 text-[11px] text-slate-500">
        <p>
          © {new Date().getFullYear()} <strong className="text-slate-400 font-semibold">BEYA CREATIVE</strong> — {isAr ? 'منصة التجارة الإلكترونية والتصنيع' : 'Plateforme E-Commerce & Confection Textile'}.
        </p>
      </footer>
    </div>
  );
}
