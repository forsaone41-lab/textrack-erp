import React, { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { Video, Copy, CheckCircle2 } from 'lucide-react';
import { loadCompanyProfile } from '../types';

export default function VisioRoom() {
  const { isAr } = useLang();
  const [copied, setCopied] = useState(false);
  const [serverMode, setServerMode] = useState<'jitsi' | 'daily'>('jitsi');
  const company = loadCompanyProfile();
  
  // Unique room name based on company name
  const roomName = `BEYA_${(company.name || 'COMPANY').replace(/[^a-zA-Z0-9]/g, '_')}_Room`;
  
  const jitsiUrl = `https://meet.jit.si/${roomName}?userInfo.displayName=${encodeURIComponent(company.name || 'Admin')}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.SHOW_BRAND_WATERMARK=false`;
  const dailyUrl = `https://beyacreative.daily.co/BEYACREATIVE`;

  // Link to BEYA's own public meeting page with the selected server mode
  const beyaMeetUrl = `${window.location.origin}${window.location.pathname}#/meet?server=${serverMode}`;

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

      <div className="flex items-center gap-2 mb-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button 
          onClick={() => setServerMode('jitsi')}
          className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${serverMode === 'jitsi' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          {isAr ? 'سيرفر مجاني (Jitsi)' : 'Serveur Gratuit (Jitsi)'}
        </button>
        <button 
          onClick={() => setServerMode('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${serverMode === 'daily' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'}`}
        >
          {isAr ? 'سيرفر احترافي (Daily)' : 'Serveur PRO (Daily)'}
          <span className="bg-amber-400/20 text-amber-500 px-1.5 py-0.5 rounded text-[9px]">VIP</span>
        </button>
      </div>

      <div className="w-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800" style={{ height: '70vh', minHeight: '600px' }}>
        <iframe
          src={serverMode === 'jitsi' ? jitsiUrl : dailyUrl}
          allow="camera; microphone; display-capture; fullscreen"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
