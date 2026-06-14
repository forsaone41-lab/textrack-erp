import React, { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { Video, Copy, CheckCircle2 } from 'lucide-react';
import { loadCompanyProfile } from '../types';

export default function VisioRoom() {
  const { isAr } = useLang();
  const [copied, setCopied] = useState(false);
  const company = loadCompanyProfile();
  
  // Link to BEYA's own public meeting page instead of Daily's link
  const beyaMeetUrl = `${window.location.origin}${window.location.pathname}#/meet`;
  const meetUrl = `https://beyacreative.daily.co/BEYACREATIVE`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(beyaMeetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Video className="w-8 h-8 text-indigo-600" />
            {isAr ? 'قاعة الاجتماعات' : 'Salle de Réunion (Visio)'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {isAr ? 'اجتماعات فيديو مباشرة مع الإدارة أو العملاء' : 'Réunions vidéo en direct avec la direction ou les clients'}
          </p>
        </div>
        
        <button 
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
        >
          {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? (isAr ? 'تم النسخ' : 'Copié') : (isAr ? 'نسخ رابط الدعوة' : 'Copier l\'invitation')}
        </button>
      </div>

      <div className="w-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800" style={{ height: '70vh', minHeight: '600px' }}>
        <iframe
          src={meetUrl}
          allow="camera; microphone; display-capture; fullscreen"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
