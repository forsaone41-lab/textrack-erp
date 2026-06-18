import React, { useState, useEffect, useRef } from 'react';
import { QrCode, X, Clock, CheckCircle2, AlertCircle, ArrowLeft, Factory, Users, Zap, ShieldCheck, Camera } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';
import { 
  Employe, 
  Presence, 
  Commande, 
  OperationModele,
  loadData, 
  saveRecord, 
  genId, 
  heureNow, 
  dateNow,
  loadCompanyProfile
} from '../types';
import { useLang } from '../contexts/LangContext';

type ScannerMode = 'auto' | 'presence' | 'production';

export default function FastScanner() {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ScannerMode>('auto');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ msg: string, type: 'success' | 'error' | 'none', name?: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const company = loadCompanyProfile();

  // Data State
  const [data, setData] = useState<{
    employes: Employe[];
    commandes: Commande[];
    operations: OperationModele[];
  }>({
    employes: [],
    commandes: [],
    operations: []
  });

  const lastScanTime = useRef<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    Promise.all([
      loadData<Employe>('employes'),
      loadData<Commande>('commandes'),
      loadData<OperationModele>('operations_modele')
    ]).then(([emps, cmds, ops]) => {
      setData({
        employes: emps || [],
        commandes: cmds || [],
        operations: ops || []
      });
      setLoading(false);
    });

    return () => clearInterval(timer);
  }, []);

  const handleScan = async (text: string) => {
    const nowTs = Date.now();
    if (nowTs - lastScanTime.current < 3000) return;
    lastScanTime.current = nowTs;

    const rawValue = text.trim();
    
    // 1. Check if it's a PRODUCTION QR Code (beya-prod://{cmdId}/{opId})
    if (rawValue.startsWith('beya-prod://')) {
      await handleProductionScan(rawValue);
    } 
    // 2. Otherwise assume it's an EMPLOYEE Badge ID for presence
    else {
      await handlePresenceScan(rawValue);
    }
  };

  const handlePresenceScan = async (id: string) => {
    const emp = data.employes.find(e => 
      e.id.toLowerCase() === id.toLowerCase() || 
      (e.cin && e.cin.toLowerCase() === id.toLowerCase())
    );

    if (!emp) {
      showStatus(isAr ? 'عذراً، البطاقة غير معروفة' : 'Badge non reconnu', 'error');
      return;
    }

    const now = heureNow();
    const today = dateNow();
    const HEURE_LIMITE = company?.heureLimiteRetard || '09:15';

    // Get current presences to check if already entered
    const allPres = await loadData<Presence>('presences');
    const existingP = allPres.find(p => p.employeId === emp.id && p.date === today);

    let updated: Presence;
    let msg = '';

    if (!existingP || !existingP.heureEntree) {
      const statut = now > HEURE_LIMITE ? 'retard' : 'present';
      updated = { id: genId(), employeId: emp.id, date: today, heureEntree: now, heureSortie: null, statut };
      msg = isAr ? 'تم تسجيل الدخول بنجاح' : 'Entrée enregistrée';
    } else if (!existingP.heureSortie) {
      updated = { ...existingP, heureSortie: now };
      msg = isAr ? 'تم تسجيل الخروج بنجاح' : 'Sortie enregistrée';
    } else {
      showStatus(isAr ? 'لقد سجلت حضورك وانصرافك بالفعل اليوم' : 'Journée déjà terminée', 'error', `${emp.prenom} ${emp.nom}`);
      return;
    }

    await saveRecord('presences', updated, true);
    showStatus(msg, 'success', `${emp.prenom} ${emp.nom}`);
  };

  const handleProductionScan = async (url: string) => {
    const parts = url.replace('beya-prod://', '').split('/');
    if (parts.length !== 2) {
      showStatus(isAr ? 'تنسيق الرمز غير صالح' : 'Format QR invalide', 'error');
      return;
    }

    const [cmdId, opId] = parts;
    const op = data.operations.find(o => o.id === opId);
    const cmd = data.commandes.find(c => c.id === cmdId);

    if (!op || !cmd) {
      showStatus(isAr ? 'العملية أو الطلبية غير موجودة' : 'Opération/Commande introuvable', 'error');
      return;
    }

    // For production in fast mode, we might need a default employee or prompt?
    // Let's assume this scanner is mounted at a station where the employee is ALREADY logged in 
    // or we prompt for badge scan next? 
    // For now, let's keep it simple: Show what was scanned and ask to confirm quantity.
    showStatus(isAr ? 'تم التعرف على العملية' : 'Opération reconnue', 'success', `${cmd.reference} - ${op.nom_operation}`);
  };

  const showStatus = (msg: string, type: 'success' | 'error', name?: string) => {
    setStatus({ msg, type, name });
    if (type === 'success' && 'vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    if (type === 'error' && 'vibrate' in navigator) navigator.vibrate(200);
    setTimeout(() => setStatus(null), 4000);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center">
      <Zap className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Initialisation du Scanner PRO...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#080b14] flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Header UI */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center text-white transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className={`flex flex-col ${isAr ? 'items-start text-left' : 'items-end text-right'}`}>
          <h2 className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </h2>
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">
            {currentTime.toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="relative w-full max-w-lg px-6 flex flex-col items-center">
        {/* The Glass Scanner Box */}
        <div className="w-full aspect-square relative rounded-[3.5rem] overflow-hidden border-4 border-white/10 shadow-[0_0_80px_rgba(79,70,229,0.15)] bg-slate-900/40 backdrop-blur-sm">
          {/* Real Camera Feed */}
          <div className="absolute inset-0 z-0">
            <Scanner
              onScan={(result) => { if (result && result.length > 0) handleScan(result[0].rawValue); }}
              styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
            />
          </div>

          {/* Scanner UI Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12 pointer-events-none">
            {/* Focus Area Brackets */}
            <div className="w-full h-full relative border-2 border-white/5 rounded-[2.5rem]">
               <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-indigo-500 rounded-tl-[2rem]" />
               <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-indigo-500 rounded-tr-[2rem]" />
               <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-indigo-500 rounded-bl-[2rem]" />
               <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-indigo-500 rounded-br-[2rem]" />
               
               {/* Scanning Laser Line */}
               <div className="absolute left-6 right-6 h-[2px] bg-indigo-400/80 shadow-[0_0_20px_#4f46e5] animate-laser-pro" />
            </div>

            <div className="mt-8 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10">
               <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
               <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                 {isAr ? 'الماسح الضوئي (PRO) نشط' : 'PRO SCANNER ACTIVE'}
               </span>
            </div>
          </div>

          {/* Result Splash Screen */}
          {status && (
            <div className={`absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 animate-in zoom-in fade-in duration-300 ${
              status.type === 'success' ? 'bg-indigo-600/95' : 'bg-rose-600/95'
            } backdrop-blur-2xl`}>
              <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl">
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-white animate-shake-pro" />
                )}
              </div>
              
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter text-center leading-tight mb-4">
                {status.msg}
              </h3>
              
              {status.name && (
                <div className="px-6 py-2 bg-black/20 rounded-full border border-white/20">
                  <span className="text-lg font-black text-white/90 uppercase tracking-widest">{status.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mode Selector / Info */}
        <div className="mt-10 grid grid-cols-2 gap-4 w-full">
           <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 group transition-all hover:bg-white/10">
              <Users className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isAr ? 'تسجيل الحضور' : 'POINTAGE'}</span>
           </div>
           <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 group transition-all hover:bg-white/10">
              <Factory className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isAr ? 'تتبع الإنتاج' : 'PRODUCTION'}</span>
           </div>
        </div>

        {/* Footer Brand */}
        <div className="mt-12 flex items-center gap-3 opacity-30">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <span className="text-lg font-black text-white italic tracking-tighter">BEYA<span className="text-indigo-500 ml-0.5">OS</span></span>
        </div>
      </div>

      <style>{`
        @keyframes laser-pro {
          0% { top: 10%; opacity: 0.2; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0.2; }
        }
        .animate-laser-pro {
          animation: laser-pro 2.5s ease-in-out infinite;
        }
        @keyframes shake-pro {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .animate-shake-pro {
          animation: shake-pro 0.2s ease-in-out 3;
        }
      `}</style>
    </div>
  );
}
