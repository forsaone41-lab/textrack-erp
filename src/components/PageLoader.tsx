import React from 'react';
import { useLang } from '../contexts/LangContext';

export const PageLoader = () => {
  const { isAr } = useLang();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center relative w-full overflow-hidden bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-2xl shadow-indigo-100/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 border-4 border-purple-100 rounded-full"></div>
          <div className="absolute inset-2 border-4 border-purple-500 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
            {isAr ? 'جاري التحميل...' : 'Chargement des données...'}
          </p>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
