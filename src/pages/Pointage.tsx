import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, UserCheck, UserX, Clock, Users, CalendarDays, QrCode, X, Search, CheckCircle, AlertTriangle, Download, Printer, Maximize2, Package } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';
import { Employe, Presence, loadData, saveRecord, genId, loadCompanyProfile, safeStorage, heureNow, dateNow } from '../types';
import { useLang } from '../contexts/LangContext';


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
  const empsRef = useRef<Employe[]>([]);
  const presRef = useRef<Presence[]>([]);

  useEffect(() => {
    empsRef.current = employes;
    presRef.current = presences;
  }, [employes, presences]);

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<Presence>('presences')
    ]).then(([remoteEmps, remotePres]) => {
      // Prioritize Remote Data
      if (remoteEmps && remoteEmps.length > 0) {
        setEmployes(remoteEmps);
        safeStorage.setItem('textrack_employes', JSON.stringify(remoteEmps));
      } else {
        const local = safeStorage.getItem('textrack_employes');
        if (local) setEmployes(JSON.parse(local));
      }

      if (remotePres && remotePres.length > 0) {
        setPresences(remotePres);
        safeStorage.setItem('textrack_presences', JSON.stringify(remotePres));
      } else {
        const local = safeStorage.getItem('textrack_presences');
        if (local) setPresences(JSON.parse(local));
      }
    }).catch(err => {
      console.error("Pointage Sync Error:", err);
    });

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
  }, [isAr]); // Only re-run when language changes, not when data changes

  // Auto-save to Local Storage
  useEffect(() => {
    if (presences.length > 0) {
      safeStorage.setItem('textrack_presences', JSON.stringify(presences));
    }
  }, [presences]);

  const seenNames = new Set();
  const actifs = employes.filter(e => {
    if (!e.actif) return false;
    if (e.type === 'sous_traitance') return false;
    if (e.poste && e.poste.toUpperCase().includes('PRESTATAIRE')) return false;
    
    const normName = `${e.prenom || ''} ${e.nom || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();
    if (seenNames.has(normName)) return false;
    seenNames.add(normName);
    return true;
  });
  const filtered = actifs.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getPresence(empId: string) {
    return presences.find(p => p.employeId === empId && p.date === selectedDate) ?? null;
  }

  async function marquerEntree(empId: string) {
    const now = heureNow();
    const heureLimite = company?.heureLimiteRetard || '09:15';
    const statut = now > heureLimite ? 'retard' : 'present';

    setPresences(prev => {
      const existing = prev.find(p => p.employeId === empId && p.date === selectedDate);
      let updatedRecord: Presence;
      
      if (existing) {
        updatedRecord = { ...existing, heureEntree: now, statut };
      } else {
        updatedRecord = { id: genId(), employeId: empId, date: selectedDate, heureEntree: now, heureSortie: null, statut };
      }

      // Async save (background)
      const emp = employes.find(e => e.id === empId);
      if (emp) saveRecord('employes', emp, true).catch(() => {});
      saveRecord('presences', updatedRecord, true).catch(() => {});

      return existing
        ? prev.map(p => p.id === existing.id ? updatedRecord : p)
        : [...prev, updatedRecord];
    });
  }

  async function marquerSortie(empId: string) {
    const now = heureNow();
    
    setPresences(prev => {
      const existing = prev.find(p => p.employeId === empId && p.date === selectedDate);
      if (!existing) return prev;

      const updatedRecord = { ...existing, heureSortie: now };
      
      // Async save (background)
      const emp = employes.find(e => e.id === empId);
      if (emp) saveRecord('employes', emp, true).catch(() => {});
      saveRecord('presences', updatedRecord, true).catch(() => {});

      return prev.map(p => p.id === existing.id ? updatedRecord : p);
    });
  }

  async function annulerSortie(empId: string) {
    setPresences(prev => {
      const existing = prev.find(p => p.employeId === empId && p.date === selectedDate);
      if (!existing || !existing.heureSortie) return prev;

      const updatedRecord = { ...existing, heureSortie: null };
      
      // Async save (background)
      saveRecord('presences', updatedRecord, true).catch(() => {});

      return prev.map(p => p.id === existing.id ? updatedRecord : p);
    });
  }

  const empName = (e: Employe) => e.prenom ? `${e.prenom} ${e.nom}` : e.nom;
  const empInitials = (e: Employe) => {
    if (!e) return '??';
    if (e.prenom && e.nom) return (e.prenom?.[0] || '') + (e.nom?.[0] || '');
    return (e.nom || '??').substring(0, 2).toUpperCase();
  };

  async function handleScan(text: string) {
    if (!text) return;
    if ('vibrate' in navigator) navigator.vibrate(50);

    const cleanText = text.trim();
    const searchId = cleanText.toLowerCase();
    const emp = empsRef.current.find(e => 
      e.id.toLowerCase() === searchId || 
      (e.cin && e.cin.toLowerCase() === searchId)
    );

    if (!emp) {
      setScanStatus({ 
        msg: isAr ? `غير موجود (${cleanText})` : `Non trouvé (${cleanText})`, 
        type: 'error' 
      });
      setTimeout(() => setScanStatus(null), 4000);
      return;
    }

    const now = heureNow();
    const heureLimite = company?.heureLimiteRetard || '09:15';
    const statut = now > heureLimite ? 'retard' : 'present';

    setPresences(prev => {
      const p = prev.find(x => x.employeId === emp.id && x.date === selectedDate);
      let updated: Presence;
      let msg = '';

      if (!p || !p.heureEntree) {
        updated = { id: genId(), employeId: emp.id, date: selectedDate, heureEntree: now, heureSortie: null, statut };
        msg = isAr ? `دخول: ${empName(emp)}` : `Entrée: ${empName(emp)}`;
      } else if (!p.heureSortie) {
        updated = { ...p, heureSortie: now };
        msg = isAr ? `خروج: ${empName(emp)}` : `Sortie: ${empName(emp)}`;
      } else {
        setScanStatus({ msg: isAr ? `انتهى اليوم` : `Déjà fini`, type: 'error' });
        return prev;
      }

      setScanStatus({ msg, type: 'success' });
      saveRecord('employes', emp, true).catch(() => {});
      saveRecord('presences', updated, true).catch(() => {});

      return p 
        ? prev.map(x => x.id === p.id ? updated : x)
        : [...prev, updated];
    });

    setTimeout(() => { setScanStatus(null); setShowScanner(false); }, 2500);
  }

  const handlePrintBadge = () => {
    window.print();
  };

  const stats = [
    { label: isAr ? 'حاضر' : 'Présents', count: actifs.filter(e => { const p = getPresence(e.id); return p && p.statut !== 'absent'; }).length, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: UserCheck },
    { label: isAr ? 'غائب' : 'Absents', count: actifs.filter(e => { const p = getPresence(e.id); return !p || p.statut === 'absent'; }).length, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: UserX },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 -m-4 md:-m-6 lg:-m-8">
      {/* Premium Dynamic Header */}
      <div className="relative bg-slate-900 pt-16 pb-24 overflow-hidden print:hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10 flex flex-col items-center px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                {isAr ? 'النظام مباشر' : 'LIVE SYSTEM ACTIVE'}
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors border border-white/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mb-8">
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4 text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              {currentTime.toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {stats.map((s, i) => (
              <div key={i} className={`relative overflow-hidden ${s.bg} backdrop-blur-md border ${s.border} rounded-[2rem] p-5 transition-transform hover:scale-[1.02]`}>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-xl ${s.bg} border ${s.border}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <span className={`text-3xl font-black ${s.color}`}>{s.count}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                {/* Decorative Mini-graph */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" style={{ color: s.color.replace('text-', '') }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Controls & Search */}
      <div className="max-w-4xl mx-auto w-full px-6 -mt-12 relative z-20 pb-20">
        <div className="mb-6 flex justify-center">
          <Link 
            to="/kiosk" 
            className="flex items-center gap-2 px-6 py-2.5 bg-white/80 backdrop-blur-md text-indigo-600 rounded-full border border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/5 group"
          >
            <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {isAr ? 'فتح الماسح الضوئي (PRO)' : 'POINTAGE PRO (KIOSK)'}
          </Link>
        </div>
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/10 p-2 md:p-3 mb-8">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Massive Scan Button */}
            <button
              onClick={() => setShowScanner(true)}
              className="flex-1 h-16 md:h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center gap-4 group transition-all hover:bg-black active:scale-[0.98]"
            >
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <QrCode className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="font-black text-lg tracking-tight uppercase">
                {isAr ? 'فتح الكاميرا' : 'Utiliser Caméra'}
              </span>
            </button>

            {/* Date Selection */}
            <div className="relative group min-w-[180px]">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full h-16 md:h-20 bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-6 text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              />
              <CalendarDays className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Modern Search Field */}
        <div className="relative mb-10">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 rounded-xl">
            <Search className="w-4 h-4 text-indigo-600" />
          </div>
          <input 
            type="text"
            placeholder={isAr ? 'البحث عن موظف بالاسم أو الرقم...' : 'Chercher un employé par nom ou CIN...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-16 bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* List of Employees - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(emp => {
            const p = getPresence(emp.id);
            const status = !p || p.statut === 'absent' ? 'absent' : (p.heureSortie ? 'finished' : 'present');
            
            return (
              <div key={emp.id} className="group bg-white rounded-[2.5rem] border-2 border-slate-100/50 shadow-xl shadow-slate-200/40 p-6 hover:border-indigo-500/20 hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  status === 'absent' ? 'bg-slate-100' : (status === 'present' ? 'bg-emerald-500' : 'bg-indigo-600')
                }`}></div>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg transform transition-transform group-hover:scale-110 ${
                    emp.type === 'atelier' ? 'bg-slate-900' : 'bg-indigo-600'
                  }`}>
                    {empInitials(emp)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-slate-900 truncate tracking-tight">{empName(emp)}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest">{emp.poste}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBadge(emp); }}
                        className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Toggle */}
                  <div className="flex flex-col gap-2">
                    {status === 'absent' ? (
                      <button onClick={() => marquerEntree(emp.id)} className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-90 transition-all">
                        <LogIn className="w-5 h-5" />
                      </button>
                    ) : (status === 'present' ? (
                      <button onClick={() => marquerSortie(emp.id)} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 hover:bg-black active:scale-90 transition-all">
                        <LogOut className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          if (window.confirm(isAr ? 'هل تريد إلغاء الخروج؟' : 'Voulez-vous annuler la sortie ?')) {
                            annulerSortie(emp.id);
                          }
                        }}
                        className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all group"
                        title={isAr ? 'إلغاء الخروج' : 'Annuler Sortie'}
                      >
                        <CheckCircle className="w-5 h-5 group-hover:hidden" />
                        <X className="w-5 h-5 hidden group-hover:block" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Times Visualizer */}
                <div className="flex gap-2">
                  <div className={`flex-1 rounded-2xl p-4 flex flex-col items-center justify-center border transition-all ${p?.heureEntree ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${p?.heureEntree ? 'text-white/80' : 'text-slate-400'}`}>
                      {isAr ? 'دخول' : 'ENTRÉE'}
                    </span>
                    <span className="text-2xl font-black font-mono">
                      {p?.heureEntree || '--:--'}
                    </span>
                  </div>
                  <div className={`flex-1 rounded-2xl p-4 flex flex-col items-center justify-center border transition-all ${p?.heureSortie ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${p?.heureSortie ? 'text-white/80' : 'text-slate-400'}`}>
                      {isAr ? 'خروج' : 'SORTIE'}
                    </span>
                    <span className="text-2xl font-black font-mono">
                      {p?.heureSortie || '--:--'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Badge Preview */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-[400px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/20 relative animate-in zoom-in duration-500">
            <button onClick={() => setSelectedBadge(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors z-10">
              <X className="w-5 h-5 text-slate-900" />
            </button>

            <div className="bg-slate-900 p-10 flex flex-col items-center text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
               <div className="w-full flex items-center justify-center gap-3 mb-8">
                 <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Package className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-xl font-black text-white uppercase tracking-tighter italic">BEYA<span className="text-indigo-400">CREATIVE</span></span>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                <QRCodeSVG value={selectedBadge.id} size={180} level="H" />
              </div>

              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-tight">
                {empName(selectedBadge)}
              </h2>
              <div className="px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">
                  {selectedBadge.poste}
                </p>
              </div>
            </div>

            <div className="p-8 bg-white grid grid-cols-2 gap-4">
              <button 
                onClick={handlePrintBadge}
                className="h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
              >
                <Printer className="w-5 h-5" />
                {isAr ? 'طباعة' : 'Imprimer'}
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
                className="h-16 bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                <Download className="w-5 h-5" />
                SVG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Overlay UI */}
      {showScanner && (
        <div className="fixed inset-0 z-[400] bg-slate-950 flex flex-col animate-in fade-in duration-500">
          <div className="p-8 flex items-center justify-between border-b border-white/5">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Scanner <span className="text-indigo-400">QR CODE</span></h3>
            <button onClick={() => setShowScanner(false)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="w-full aspect-square max-w-[360px] relative">
              <div className="absolute inset-0 border-2 border-white/10 rounded-[3rem]"></div>
              {/* Animated Corner Brackets */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-indigo-500 rounded-tl-[3rem] -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-indigo-500 rounded-tr-[3rem] translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-indigo-500 rounded-bl-[3rem] -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-indigo-500 rounded-br-[3rem] translate-x-1 translate-y-1"></div>
              
              <div className="rounded-[2.8rem] overflow-hidden h-full">
                <Scanner
                  onScan={(result) => { if (result && result.length > 0) handleScan(result[0].rawValue); }}
                  styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                />
              </div>
              {/* Scan Line Animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan"></div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-2">Scan en cours...</p>
              <p className="text-slate-500 font-bold max-w-[200px] leading-tight">Veuillez placer le code QR au centre du cadre.</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Feedback */}
      {scanStatus && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-full duration-500 ${
          scanStatus.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            {scanStatus.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <span className="font-black text-xl uppercase tracking-tight">{scanStatus.msg}</span>
        </div>
      )}

      <style>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
