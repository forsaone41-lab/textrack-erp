import { useState, useEffect, useRef } from 'react';
import { QrCode, X, Clock, CheckCircle, AlertTriangle, ArrowLeft, Maximize2 } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Link } from 'react-router-dom';
import { Employe, Presence, loadData, saveRecord, genId, heureNow, dateNow } from '../types';
import { useLang } from '../contexts/LangContext';

export default function KioskScanner() {
  const { isAr } = useLang();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [scanStatus, setScanStatus] = useState<{ msg: string, type: 'success' | 'error', name?: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const empsRef = useRef<Employe[]>([]);
  const presRef = useRef<Presence[]>([]);
  const lastScanTime = useRef<number>(0);

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<Presence>('presences')
    ]).then(([remoteEmps, remotePres]) => {
      setEmployes(remoteEmps || []);
      setPresences(remotePres || []);
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    empsRef.current = employes;
    presRef.current = presences;
  }, [employes, presences]);

  const handleScan = async (text: string) => {
    const nowTs = Date.now();
    // Debounce to prevent double scans
    if (nowTs - lastScanTime.current < 3000) return;
    lastScanTime.current = nowTs;

    const cleanText = text.trim();
    const emp = empsRef.current.find(e => e.id.toLowerCase() === cleanText.toLowerCase() || (e.cin && e.cin.toLowerCase() === cleanText.toLowerCase()));

    if (!emp) {
      setScanStatus({ msg: isAr ? 'عذراً، البطاقة غير معروفة' : 'Badge non reconnu', type: 'error' });
      setTimeout(() => setScanStatus(null), 4000);
      return;
    }

    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);

    const now = heureNow();
    const today = dateNow();
    const HEURE_LIMITE = '08:30';

    const existingP = presRef.current.find(p => p.employeId === emp.id && p.date === today);
    let updated: Presence;
    let message = '';

    if (!existingP || !existingP.heureEntree) {
      const statut = now > HEURE_LIMITE ? 'retard' : 'present';
      updated = { id: genId(), employeId: emp.id, date: today, heureEntree: now, heureSortie: null, statut };
      message = isAr ? 'تم تسجيل الدخول بنجاح' : 'Entrée enregistrée';
    } else if (!existingP.heureSortie) {
      updated = { ...existingP, heureSortie: now };
      message = isAr ? 'تم تسجيل الخروج بنجاح' : 'Sortie enregistrée';
    } else {
      setScanStatus({ msg: isAr ? 'لقد سجلت حضورك وانصرافك بالفعل اليوم' : 'Journée déjà terminée', type: 'error', name: `${emp.prenom} ${emp.nom}` });
      setTimeout(() => setScanStatus(null), 4000);
      return;
    }

    setScanStatus({ msg: message, type: 'success', name: `${emp.prenom} ${emp.nom}` });
    
    // Save to state and DB
    setPresences(prev => {
      const exists = prev.find(p => p.id === updated.id);
      return exists ? prev.map(p => p.id === updated.id ? updated : p) : [...prev, updated];
    });
    
    await saveRecord('presences', updated, true);
    setTimeout(() => setScanStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full -ml-64 -mb-64"></div>

      {/* Header Info */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
        <Link to="/pointage" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white/50 hover:text-white transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Retour</span>
        </Link>

        <div className="flex flex-col items-end">
          <h2 className="text-4xl font-black text-white tabular-nums tracking-tighter">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">
            {currentTime.toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="relative w-full max-w-2xl px-6 flex flex-col items-center">
        <div className="w-full aspect-square md:aspect-video relative rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl shadow-indigo-500/20">
          {/* Scanner View */}
          <div className="absolute inset-0 z-0">
             <Scanner
                onScan={(result) => { if (result && result.length > 0) handleScan(result[0].rawValue); }}
                styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
              />
          </div>

          {/* Overlay UI */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            {/* Scan Brackets */}
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl"></div>
              
              {/* Laser Line */}
              <div className="absolute top-0 left-4 right-4 h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan-kiosk"></div>
            </div>
            
            <p className="mt-12 text-white/30 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
              {isAr ? 'ضع رمز الاستجابة السريعة هنا' : 'Présentez votre QR Code'}
            </p>
          </div>

          {/* Success/Error Splash */}
          {scanStatus && (
            <div className={`absolute inset-0 z-[30] flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in duration-300 ${
              scanStatus.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {scanStatus.type === 'success' ? (
                <CheckCircle className="w-32 h-32 text-white mb-6 animate-bounce" />
              ) : (
                <AlertTriangle className="w-32 h-32 text-white mb-6 animate-shake" />
              )}
              
              <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter text-center leading-tight mb-4">
                {scanStatus.msg}
              </h3>
              
              {scanStatus.name && (
                <div className="px-8 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30">
                  <span className="text-2xl font-black text-white uppercase tracking-widest">{scanStatus.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brand Footer */}
        <div className="mt-12 flex items-center gap-4 opacity-20">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-slate-950" />
          </div>
          <span className="text-xl font-black text-white italic uppercase tracking-tighter">
            BEYA<span className="text-indigo-400">CREATIVE</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scan-kiosk {
          from { top: 0; }
          to { top: 100%; }
        }
        .animate-scan-kiosk {
          animation: scan-kiosk 2s ease-in-out infinite alternate;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
