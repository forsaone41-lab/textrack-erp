import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, UserCheck, UserX, Clock, Users, CalendarDays, QrCode, X, Search, CheckCircle2, AlertCircle, Download, Printer } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';
import { Employe, Presence, loadData, saveRecord, genId, loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';

const HEURE_LIMITE_RETARD = '08:30';

function heureNow() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function dateNow() {
  return new Date().toISOString().split('T')[0];
}

export default function Pointage({ onLogout }: { onLogout?: () => void }) {
  const { isAr } = useLang();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [selectedDate, setSelectedDate] = useState(dateNow());
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBadge, setSelectedBadge] = useState<Employe | null>(null);
  const company = loadCompanyProfile();

  // Hardware Scanner Support
  const scanBuffer = useRef('');
  const lastKeyTime = useRef(0);

  useEffect(() => {
    loadData<Employe>('employes').then(setEmployes);
    loadData<Presence>('presences').then(setPresences);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Global listener for Hardware Scanners
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // If it's a fast input (typical of a scanner), buffer it
      if (now - lastKeyTime.current < 50 || scanBuffer.current.length === 0) {
        if (e.key === 'Enter') {
          if (scanBuffer.current.length > 0) {
            handleScan(scanBuffer.current);
            scanBuffer.current = '';
          }
        } else if (e.key.length === 1) {
          scanBuffer.current += e.key;
        }
      } else {
        // Too slow, probably manual typing, clear buffer and start over
        scanBuffer.current = e.key.length === 1 ? e.key : '';
      }
      
      lastKeyTime.current = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [employes, presences, isAr]); // Re-bind when data changes to ensure handleScan has latest state

  const actifs = employes.filter(e => e.actif);
  const filtered = actifs.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getPresence(empId: string) {
    return presences.find(p => p.employeId === empId && p.date === selectedDate) ?? null;
  }

  async function marquerEntree(empId: string) {
    const now = heureNow();
    const statut = now > HEURE_LIMITE_RETARD ? 'retard' : 'present';
    const existing = getPresence(empId);

    let updatedRecord: Presence;
    if (existing) {
      updatedRecord = { ...existing, heureEntree: now, statut };
    } else {
      updatedRecord = { id: genId(), employeId: empId, date: selectedDate, heureEntree: now, heureSortie: null, statut };
    }

    const updatedList = existing
      ? presences.map(p => p.id === existing.id ? updatedRecord : p)
      : [...presences, updatedRecord];

    setPresences(updatedList);
    await saveRecord('presences', updatedRecord);
  }

  async function marquerSortie(empId: string) {
    const now = heureNow();
    const existing = getPresence(empId);
    if (!existing) return;

    const updatedRecord = { ...existing, heureSortie: now };
    const updatedList = presences.map(p => p.id === existing.id ? updatedRecord : p);

    setPresences(updatedList);
    await saveRecord('presences', updatedRecord);
  }

  const empName = (e: Employe) => e.prenom ? `${e.prenom} ${e.nom}` : e.nom;

  async function handleScan(text: string) {
    if (!text) return;
    if ('vibrate' in navigator) navigator.vibrate(50);

    // Clean text (some scanners add prefix/suffix)
    const cleanText = text.trim();
    const emp = employes.find(e => e.id === cleanText || e.cin === cleanText);

    if (!emp) {
      setScanStatus({ msg: isAr ? `غير موجود (${cleanText})` : `Ouvrier non trouvé (${cleanText})`, type: 'error' });
      // Play error sound or visual feedback
      setTimeout(() => setScanStatus(null), 3000);
      return;
    }

    const p = getPresence(emp.id);
    if (!p || !p.heureEntree) {
      await marquerEntree(emp.id);
      setScanStatus({ msg: isAr ? `دخول: ${empName(emp)}` : `Entrée: ${empName(emp)}`, type: 'success' });
    } else if (!p.heureSortie) {
      await marquerSortie(emp.id);
      setScanStatus({ msg: isAr ? `خروج: ${empName(emp)}` : `Sortie: ${empName(emp)}`, type: 'success' });
    } else {
      setScanStatus({ msg: isAr ? `انتهى اليوم لـ ${empName(emp)}` : `${empName(emp)} a déjà fini`, type: 'error' });
    }

    // Auto-clear status
    setTimeout(() => {
      setScanStatus(null);
      setShowScanner(false);
    }, 2500);
  }

  const handlePrintBadge = () => {
    window.print();
  };

  const stats = [
    { label: isAr ? 'حاضر' : 'Présents', count: actifs.filter(e => { const p = getPresence(e.id); return p && p.statut !== 'absent'; }).length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: isAr ? 'غائب' : 'Absents', count: actifs.filter(e => { const p = getPresence(e.id); return !p || p.statut === 'absent'; }).length, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F9] -m-4 md:-m-6 lg:-m-8">
      {/* Massive Central Clock Header */}
      <div className="bg-white px-6 pt-10 pb-12 border-b-2 border-slate-200 shadow-sm relative overflow-hidden print:hidden">
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(5,150,105,0.5)]"></div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">
              {isAr ? 'الوقت المباشر' : 'LIVE SYSTEM TIME'}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="absolute top-6 right-6 flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-2xl border border-rose-100 hover:bg-rose-100 transition shadow-sm font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isAr ? 'خروج' : 'Déconnexion'}
            </button>
          )}
          
          <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-6 font-mono drop-shadow-sm">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h1>
          
          <div className="flex items-center gap-4 bg-slate-900 px-6 py-2.5 rounded-2xl shadow-xl shadow-slate-900/20">
            <span className="text-sm font-black text-white uppercase tracking-widest">
              {currentTime.toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="relative group">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <CalendarDays className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 mt-10 max-w-sm mx-auto">
          {stats.map((s, i) => (
            <div key={i} className={`flex-1 ${s.bg} rounded-2xl p-4 border-2 ${s.border} shadow-md text-center`}>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-2xl font-black ${s.color}`}>{s.count}</span>
                <span className="text-[10px] text-slate-900/30 font-black">/ {actifs.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 -mt-6 print:hidden">
        {/* Hardware Scanner Indicator */}
        <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          {isAr ? 'جاهز للمسح الخارجي' : 'Ready for Hardware Scanner'}
        </div>

        {/* Floating Scan Action */}
        <button
          onClick={() => setShowScanner(true)}
          className="w-full h-16 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-center gap-4 text-white font-black text-lg active:scale-[0.98] transition-all mb-8 border-b-4 border-black"
        >
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          {isAr ? 'استخدام الكاميرا' : 'UTILISER CAMERA'}
        </button>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900" />
          <input 
            type="text"
            placeholder={isAr ? 'بحث...' : 'Recherche...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Status Feedback (Floating) */}
        {scanStatus && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border-2 animate-in slide-in-from-top-full duration-300 ${
            scanStatus.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'
          }`}>
            {scanStatus.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span className="font-black text-lg uppercase tracking-tight">{scanStatus.msg}</span>
          </div>
        )}

        {/* List of Employees */}
        <div className="space-y-4 pb-12">
          {filtered.map(emp => {
            const p = getPresence(emp.id);
            const status = !p || p.statut === 'absent' ? 'absent' : (p.heureSortie ? 'finished' : 'present');
            
            return (
              <div key={emp.id} className="bg-white rounded-[24px] p-4 border-2 border-slate-50 shadow-sm flex flex-col gap-4 active:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-md ${
                    emp.type === 'atelier' ? 'bg-slate-900' : 'bg-indigo-600'
                  }`}>
                    {emp.prenom ? emp.prenom[0] : emp.nom[0]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-slate-900 truncate leading-tight">{empName(emp)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.poste}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBadge(emp); }}
                        className="p-1.5 bg-slate-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <QrCode className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {status === 'absent' ? (
                      <button onClick={() => marquerEntree(emp.id)} className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                        <LogIn className="w-5 h-5" />
                      </button>
                    ) : (status === 'present' ? (
                      <button onClick={() => marquerSortie(emp.id)} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                        <LogOut className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border-2 border-emerald-100">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-2xl py-4 flex flex-col items-center justify-center border-2 transition-all ${p?.heureEntree ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {isAr ? 'دخول' : 'ENTRÉE'}
                    </span>
                    <span className={`text-3xl font-black font-mono ${p?.heureEntree ? 'text-emerald-600' : 'text-slate-200'}`}>
                      {p?.heureEntree || '--:--'}
                    </span>
                  </div>
                  <div className={`rounded-2xl py-4 flex flex-col items-center justify-center border-2 transition-all ${p?.heureSortie ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {isAr ? 'خروج' : 'SORTIE'}
                    </span>
                    <span className={`text-3xl font-black font-mono ${p?.heureSortie ? 'text-rose-600' : 'text-slate-200'}`}>
                      {p?.heureSortie || '--:--'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Preview Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-[32px] w-full max-w-[380px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 print:shadow-none print:rounded-none">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 print:hidden">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter">Aperçu du Badge</h3>
              <button onClick={() => setSelectedBadge(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-full flex items-center justify-center gap-3 mb-8">
                 <span className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
                  {company.name.split(' ')[0]}
                </span>
                <span className="text-xl font-light text-indigo-600 uppercase tracking-[0.2em]">
                  {company.name.split(' ').slice(1).join(' ')}
                </span>
              </div>

              <div className="w-48 h-48 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm mb-6 flex items-center justify-center">
                <QRCodeSVG value={selectedBadge.id} size={160} level="H" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 uppercase leading-none mb-2">
                {empName(selectedBadge)}
              </h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-8 bg-indigo-50 px-4 py-1.5 rounded-full">
                {selectedBadge.poste}
              </p>

              <div className="w-full border-t border-dashed border-slate-200 pt-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Badge Officiel</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{selectedBadge.id}</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 grid grid-cols-2 gap-3 print:hidden">
              <button 
                onClick={handlePrintBadge}
                className="h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
              <button 
                onClick={() => {
                  const svg = document.querySelector('.QRCodeSVG');
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `badge_${selectedBadge.nom}.svg`;
                    link.click();
                  }
                }}
                className="h-12 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                SVG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner Overlay */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="px-6 py-8 flex items-center justify-between border-b-2 border-slate-100">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'مسح الكاميرا' : 'Camera Scan'}</h3>
            <button onClick={() => setShowScanner(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center active:scale-90 transition-all">
              <X className="w-6 h-6 text-slate-900" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full aspect-square max-w-[320px] relative">
              <div className="absolute inset-0 border-2 border-slate-100 rounded-[40px]"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-slate-900 rounded-tl-[40px]"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-slate-900 rounded-tr-[40px]"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-slate-900 rounded-bl-[40px]"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-slate-900 rounded-br-[40px]"></div>
              
              <div className="rounded-[36px] overflow-hidden shadow-2xl h-full border-8 border-white">
                <Scanner
                  onScan={(result) => { if (result && result.length > 0) handleScan(result[0].rawValue); }}
                  styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                />
              </div>
            </div>
            <p className="mt-8 text-sm font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'ضع الرمز في المربع' : 'Place code inside the frame'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
