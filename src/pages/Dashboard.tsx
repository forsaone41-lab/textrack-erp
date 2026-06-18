import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Shirt, AlertTriangle, Truck, TrendingUp, Users, Activity,
  Clock, CheckCircle, UserCheck, UserX, UserPlus, X, ChevronRight,
} from 'lucide-react';
import {
  loadData, Commande, StockTissu, Employe, Facture, Presence,
  PHASE_LABELS, PHASE_ORDER, User, Lead, loadLeads, loadCompanyProfile
} from '../types';
import { supabase } from '../supabase';
import { useLang } from '../contexts/LangContext';
import { NavLink } from 'react-router-dom';
import { PageLoader } from '../components/PageLoader';

interface DashboardProps {
  allUsers?: User[];
}

export default function Dashboard({ allUsers = [] }: DashboardProps) {
  const { isAr } = useLang();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [now, setNow] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [workerPhotos, setWorkerPhotos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [kpiDetail, setKpiDetail] = useState<number | null>(null);
  const [listModal, setListModal] = useState<{ title: string, employees: Employe[] } | null>(null);

  function loadAll() {
    // Instant cache render
    try {
      const cmds = JSON.parse(localStorage.getItem('textrack_data_commandes') || '[]');
      const tiss = JSON.parse(localStorage.getItem('textrack_data_tissus') || '[]');
      const emps = JSON.parse(localStorage.getItem('textrack_data_employes') || '[]');
      const facs = JSON.parse(localStorage.getItem('textrack_data_factures') || '[]');
      const pres = JSON.parse(localStorage.getItem('textrack_data_presences') || '[]');
      
      // Fallback for leads: check both keys
      let lds = [];
      const oldRaw = localStorage.getItem('textrack_leads');
      const newRaw = localStorage.getItem('textrack_data_leads');
      if (newRaw) lds = JSON.parse(newRaw);
      else if (oldRaw) lds = JSON.parse(oldRaw);
      
      if (cmds.length || tiss.length || emps.length || pres.length) {
        setCommandes(cmds);
        setTissus(tiss);
        setEmployes(emps);
        setFactures(facs);
        setPresences(pres);
        setLeads(lds);
        setLoading(false);
      }
    } catch { /* ignore */ }

    // Fetch fresh data in background
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<StockTissu>('tissus'),
      loadData<Employe>('employes'),
      loadData<Facture>('factures'),
      loadData<Presence>('presences'),
      loadLeads()
    ]).then(([cmds, tiss, emps, facs, pres, lds]) => {
      setCommandes(cmds || []);
      setTissus(tiss || []);
      setFactures(facs || []);
      setLeads(lds || []);
      setEmployes(emps || []);
      setPresences(pres || []);
      setNow(new Date());
      setLoading(false);
    });
  }

  useEffect(() => {
    loadAll();
    // Load all worker photos from Supabase leads table
    (async () => {
      try {
        const { data: photos } = await supabase
          .from('leads')
          .select('phone, details')
          .eq('name', '__WORKER_PHOTO__');
        if (photos && photos.length > 0) {
          const map: Record<string, string> = {};
          photos.forEach((p: any) => { if (p.phone && p.details) map[p.phone] = p.details; });
          setWorkerPhotos(map);
          Object.entries(map).forEach(([wId, photo]) => {
            localStorage.setItem(`beya_worker_photo_${wId}`, photo);
          });
        }
      } catch { /* silent */ }
    })();
  }, []);

  // DATA RECOVERY: Fix corrupted retards from today
  useEffect(() => {
    if (presences.length === 0) return;
    const fixCorruptedData = async () => {
      const company = loadCompanyProfile();
      const heureLimite = company?.heureLimiteRetard || '09:15';
      const todayStr = new Date().toISOString().split('T')[0];
      
      let fixedCount = 0;
      const newPresences = [...presences];
      
      for (let i = 0; i < newPresences.length; i++) {
        const p = newPresences[i];
        if (p.date === todayStr && p.statut === 'retard' && p.heureEntree) {
          const normH = p.heureEntree.length === 4 ? `0${p.heureEntree}` : p.heureEntree;
          if (normH <= heureLimite) {
            newPresences[i] = { ...p, statut: 'present' };
            fixedCount++;
            // Save to DB and local storage
            saveRecord('presences', newPresences[i], true).catch(() => {});
          }
        }
      }
      
      if (fixedCount > 0) {
        setPresences(newPresences);
        console.log(`[FIX] Automatically corrected ${fixedCount} corrupted 'retard' statuses.`);
      }
    };
    
    fixCorruptedData();
  }, [presences]);

  const commandesEnCours = commandes.filter(c => c.statut === 'en_cours');
  const totalPiecesEnCours = commandesEnCours.reduce((a, c) => a + c.quantite, 0);
  const totalRebut = commandes.reduce((a, c) => a + c.rebut, 0);
  const totalPieces = commandes.reduce((a, c) => a + c.quantite, 0);
  const tauxRebut = totalPieces > 0 ? ((totalRebut / totalPieces) * 100).toFixed(1) : '0';

  const commandesEnRetard = commandes.filter(c => {
    if (c.statut === 'livré') return false;
    return new Date(c.dateLivraisonPrevue) < new Date();
  });

  const caTotal = factures.reduce((a, f) => a + f.montant, 0);
  const caPaye = factures.filter(f => f.statut === 'payée').reduce((a, f) => a + f.montant, 0);
  const caImpaye = factures.filter(f => f.statut === 'impayée').reduce((a, f) => a + f.montant, 0);

  const lowStockTissus = tissus.filter(t => t.metrage <= t.seuilAlerte);

  const todayStr = now.toISOString().split('T')[0];
  
  // Exclude prestataires/sous-traitants and deduplicate by normalized name
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

  const presencesAujourdhui = presences.filter(p => p.date === todayStr);
  const presents = actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent'));
  const absents = actifs.filter(e => !presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent'));
  const company = loadCompanyProfile();
  const heureLimite = company?.heureLimiteRetard || '09:15';
  const retards = actifs.filter(e => presencesAujourdhui.some(p => {
    if (p.employeId !== e.id || p.statut === 'absent') return false;
    // Check if the actual entrance time is later than the limit
    if (p.heureEntree && p.heureEntree > heureLimite) return true;
    // Fallback if no entry time but marked as retard
    return p.statut === 'retard' && (!p.heureEntree || p.heureEntree > heureLimite);
  }));
  const enCoursPresence = actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.heureEntree && !p.heureSortie));

  const phaseData = PHASE_ORDER.filter(p => p !== 'livré').map(phase => ({
    name: PHASE_LABELS[phase],
    commandes: commandesEnCours.filter(c => c.phase === phase).length,
    pieces: commandesEnCours.filter(c => c.phase === phase).reduce((a, c) => a + c.quantite, 0),
  }));

  const factureData = [
    { name: 'Payées', value: factures.filter(f => f.statut === 'payée').length, color: '#22c55e' },
    { name: 'En attente', value: factures.filter(f => f.statut === 'en_attente').length, color: '#f59e0b' },
    { name: 'Impayées', value: factures.filter(f => f.statut === 'impayée').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const kpiDetails: Record<number, React.ReactNode> = {
    // KPI2 - retard (index 2)
    2: commandesEnRetard.length === 0 ? (
      <div className="flex flex-col items-center py-10 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
        <p className="font-black text-slate-800 uppercase tracking-wide">{isAr ? 'كل الطلبيات في وقتها!' : 'Toutes les commandes sont dans les temps !'}</p>
      </div>
    ) : (
      <div className="space-y-3">
        {commandesEnRetard.map(c => {
          const daysLate = Math.ceil((Date.now() - new Date(c.dateLivraisonPrevue).getTime()) / 86400000);
          return (
            <div key={c.id} className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm truncate">{c.modele}</p>
                <p className="text-[11px] text-slate-500 font-bold truncate">{c.client} · <span className="text-indigo-600 uppercase">{PHASE_LABELS[c.phase] || c.phase}</span></p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-block bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  -{daysLate}j
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(c.dateLivraisonPrevue).toLocaleDateString('fr-MA')}</p>
              </div>
            </div>
          );
        })}
      </div>
    ),
    // KPI0 - production en cours
    0: commandesEnCours.length === 0 ? (
      <p className="text-center text-slate-400 italic py-8">{isAr ? 'لا توجد طلبيات نشطة' : 'Aucune commande active'}</p>
    ) : (
      <div className="space-y-3">
        {commandesEnCours.map(c => (
          <div key={c.id} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-sm truncate">{c.modele}</p>
              <p className="text-[11px] text-slate-500 font-bold">{c.client} · <span className="text-indigo-600 uppercase">{PHASE_LABELS[c.phase] || c.phase}</span></p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-sm font-black text-indigo-700">{c.quantite} pcs</span>
              <p className="text-[10px] text-slate-400">{new Date(c.dateLivraisonPrevue).toLocaleDateString('fr-MA')}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  };

  const kpiCards = [
    {
      title: isAr ? 'الإنتاج قيد التنفيذ' : 'Encours de Production',
      value: isAr ? `${totalPiecesEnCours} قطعة` : `${totalPiecesEnCours} pièces`,
      subtitle: isAr ? `${commandesEnCours.length} طلبيات نشطة` : `${commandesEnCours.length} commandes actives`,
      icon: Shirt,
      color: 'from-indigo-500 to-blue-600',
      textColor: 'text-indigo-600',
    },
    {
      title: isAr ? 'نسبة التالف' : 'Taux de Rebut',
      value: `${tauxRebut}%`,
      subtitle: isAr ? `${totalRebut} قطعة تالفة / ${totalPieces}` : `${totalRebut} pièces rebutées / ${totalPieces}`,
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
    },
    {
      title: isAr ? 'مواعيد التسليم' : 'Délais de Livraison',
      value: isAr ? `${commandesEnRetard.length} متأخرة` : `${commandesEnRetard.length} en retard`,
      subtitle: commandesEnRetard.length === 0 ? (isAr ? 'الكل في الوقت المحدد!' : 'Tout est dans les temps !') : (isAr ? 'انتبه للمواعيد' : 'Attention aux délais'),
      icon: Truck,
      color: commandesEnRetard.length > 0 ? 'from-red-500 to-rose-600' : 'from-green-500 to-emerald-600',
      textColor: commandesEnRetard.length > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      title: isAr ? 'رقم الأعمال' : 'Chiffre d\'Affaires',
      value: `${(caTotal / 1000).toFixed(0)}K MAD`,
      subtitle: isAr ? `${(caPaye / 1000).toFixed(0)}K مدفوع · ${(caImpaye / 1000).toFixed(0)}K غير مدفوع` : `${(caPaye / 1000).toFixed(0)}K encaissé · ${(caImpaye / 1000).toFixed(0)}K impayé`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
    },
    {
      title: isAr ? 'طلبات الزبائن' : 'Nouveaux Clients',
      value: isAr ? `${leads.filter(l => l.status === 'new' && (!l.type || !l.type.startsWith('RECRUTEMENT:'))).length} طلب` : `${leads.filter(l => l.status === 'new' && (!l.type || !l.type.startsWith('RECRUTEMENT:'))).length} Leads`,
      subtitle: isAr ? 'زبناء محتملون' : 'Prospects',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-600',
    },
    {
      title: isAr ? 'طلبات التوظيف' : 'Candidatures',
      value: isAr ? `${leads.filter(l => l.status === 'new' && l.type && l.type.startsWith('RECRUTEMENT:')).length} طلب` : `${leads.filter(l => l.status === 'new' && l.type && l.type.startsWith('RECRUTEMENT:')).length} CVs`,
      subtitle: isAr ? 'توظيف جديد' : 'Recrutement',
      icon: UserPlus,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-600',
    },
    {
      title: isAr ? 'إجمالي العملاء' : 'Total Clients',
      value: isAr ? `${Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'client').length : 0} عميل` : `${Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'client').length : 0} Clients`,
      subtitle: isAr ? 'زبناء مسجلين في النظام' : 'Clients enregistrés dans le système',
      icon: UserCheck,
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-600',
    },
    {
      title: isAr ? 'فريق العمل والشركاء' : 'Équipe & Partenaires',
      value: isAr ? `${employes.filter(e => e.type !== 'sous_traitance' && e.actif).length} عامل (Atelier)` : `${employes.filter(e => e.type !== 'sous_traitance' && e.actif).length} Ouvriers (Atelier)`,
      subtitle: isAr 
        ? `+ ${employes.filter(e => e.type === 'sous_traitance' && e.actif).length + (Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'partenaire').length : 0)} شركاء خارجيين` 
        : `+ ${employes.filter(e => e.type === 'sous_traitance' && e.actif).length + (Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'partenaire').length : 0)} Sous-traitants`,
      icon: Users,
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className={`space-y-8 pb-10 ${isAr ? 'text-right' : ''}`}>
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 p-8 shadow-2xl shadow-indigo-100/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20" />

        <div className={`relative flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{isAr ? 'لوحة التحكم' : 'Tableau de Bord'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-sm font-bold text-slate-500">{isAr ? 'نظرة عامة على إنتاج النسيج الخاص بك' : 'Vue d\'ensemble de votre production textile'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white shadow-xl shadow-indigo-100/20">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{isAr ? 'الفريق المتصل' : 'Équipe en ligne'}</span>
              <span className="text-[10px] text-emerald-600 font-black uppercase">
                {Array.isArray(allUsers) ? allUsers.filter(u => u && u.lastActive && (Date.now() - new Date(u.lastActive).getTime() < 120000)).length : 0} {isAr ? 'نشط الآن' : 'actifs'}
              </span>
            </div>
            <div className="flex -space-x-3">
              {Array.isArray(allUsers) && allUsers.filter(u => u && u.lastActive && (Date.now() - new Date(u.lastActive).getTime() < 120000)).map(u => {
                const colors: Record<string, string> = {
                  admin: 'border-indigo-500 bg-indigo-50 text-indigo-700',
                  pointeur: 'border-blue-500 bg-blue-50 text-blue-700',
                  worker: 'border-purple-500 bg-purple-50 text-purple-700',
                  coupeur: 'border-orange-500 bg-orange-50 text-orange-700',
                };
                const c = colors[u.role] || 'border-slate-300 bg-slate-50 text-slate-600';
                const initials = (u.nom || 'User').split(' ').filter(Boolean).map(n => n?.[0] || '').join('').toUpperCase() || '??';
                
                // ✅ Smart Photo Lookup (Supabase map → localStorage → none)
                let empId = u.employeId;
                if (!empId && u.nom) {
                   const match = employes.find(e => 
                      `${e.prenom} ${e.nom}`.toLowerCase() === u.nom.toLowerCase() ||
                      `${e.nom} ${e.prenom}`.toLowerCase() === u.nom.toLowerCase()
                   );
                   if (match) empId = match.id;
                }

                const photo = u.photo
                  || (empId ? workerPhotos[empId] : null)
                  || (empId ? localStorage.getItem(`beya_worker_photo_${empId}`) : null);
                
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-10 h-10 rounded-full border-2 ${c} flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-white transition-transform hover:-translate-y-2 cursor-pointer active:scale-90 overflow-hidden`}
                    title={u.nom}
                  >
                    {photo 
                      ? <img src={photo} alt={u.nom} className="w-full h-full object-cover" />
                      : initials
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Worker Portal */}
      <div className="grid grid-cols-1 gap-6 px-1">
        <NavLink to="/worker-portal" className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:scale-[1.01] active:scale-95">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner border border-white/30">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                {isAr ? 'فضاء الخدامة' : 'Espace Ouvrier'}
              </h2>
              <p className="text-indigo-100 text-sm font-bold opacity-80 uppercase tracking-widest mt-1">
                {isAr ? 'تتبع مهامك وأدائك اليومي' : 'Suivez vos missions et votre performance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl group-hover:bg-indigo-50 transition-colors">
              {isAr ? 'دخول الآن' : 'Accéder Maintenant'}
            </div>
          </div>
        </NavLink>
      </div>

      {/* 📊 Attendance Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-1">
        {/* Attendance Stats */}
        <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-indigo-100/20 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {isAr ? 'حضور اليوم' : 'Pointage Aujourd\'hui'}
          </h3>

          <div className="space-y-6">
            <button 
              onClick={() => setListModal({ title: isAr ? 'حاضر' : 'Présents', employees: presents })}
              className="w-full flex items-center justify-between group hover:bg-slate-50/50 p-2 -mx-2 rounded-2xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><UserCheck className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{isAr ? 'حاضر' : 'Présents'}</span>
              </div>
              <span className="text-lg font-black text-emerald-600">{presents.length}</span>
            </button>
            <button 
              onClick={() => setListModal({ title: isAr ? 'غائب' : 'Absents', employees: absents })}
              className="w-full flex items-center justify-between group hover:bg-slate-50/50 p-2 -mx-2 rounded-2xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform"><UserX className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{isAr ? 'غائب' : 'Absents'}</span>
              </div>
              <span className="text-lg font-black text-rose-600">{absents.length}</span>
            </button>
            <button 
              onClick={() => setListModal({ title: isAr ? 'متأخر' : 'Retards', employees: retards })}
              className="w-full flex items-center justify-between group hover:bg-slate-50/50 p-2 -mx-2 rounded-2xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Clock className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{isAr ? 'متأخر' : 'Retards'}</span>
              </div>
              <span className="text-lg font-black text-amber-600">{retards.length}</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'نسبة الحضور' : 'Taux de présence'}</span>
            <span className="text-sm font-black text-indigo-600">
              {actifs.length > 0 ? Math.round((presents.length / actifs.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Live Attendance List */}
        <div className="lg:col-span-3 bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-indigo-100/20 overflow-hidden relative flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isAr ? 'العمال المتواجدون حالياً' : 'Ouvriers Actuellement Présents'}
            </h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
              {enCoursPresence.length} {isAr ? 'عامل' : 'Ouvriers'}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
            {enCoursPresence.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 py-6">
                <UserX className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isAr ? 'لا يوجد عمال مسجلون حالياً' : 'Aucun ouvrier en cours'}</p>
              </div>
            ) : (
              <div className="flex gap-4 min-w-max px-1">
                {enCoursPresence.map(e => {
                  const p = presencesAujourdhui.find(pr => pr.employeId === e.id);
                  return (
                    <div key={e.id} className="flex flex-col items-center gap-3 group">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-[24px] bg-slate-100 border-2 border-white shadow-lg overflow-hidden group-hover:scale-110 transition-transform flex items-center justify-center">
                          {(() => {
                            const photo = e.photo 
                              || (typeof workerPhotos !== 'undefined' ? workerPhotos[e.id] : null)
                              || localStorage.getItem(`beya_worker_photo_${e.id}`);
                            return photo 
                              ? <img src={photo} alt={e.nom} className="w-full h-full object-cover" />
                              : <div className="text-slate-400 font-black text-xl">{e.nom[0]}</div>;
                          })()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1 truncate max-w-[80px]">{e.nom}</p>
                        <p className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 inline-block tabular-nums">
                          {p?.heureEntree || '--:--'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards - High Fidelity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-1">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            onClick={() => kpiDetails[i] !== undefined ? setKpiDetail(i) : undefined}
            className={`group relative bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-100/30 hover:shadow-2xl transition-all duration-300 overflow-hidden ${kpiDetails[i] !== undefined ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-5 blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`} />

            {/* Icon at top */}
            <div className="flex flex-col items-center mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${kpi.color} transform group-hover:scale-110 transition-transform duration-500 mb-3`}>
                <kpi.icon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-tighter">KPI {i + 1}</div>
                {kpiDetails[i] !== undefined && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />}
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{kpi.title}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
              <p className={`text-[10px] font-bold mt-2 ${kpi.textColor} opacity-80 italic`}>{kpi.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Detail Modal */}
      {kpiDetail !== null && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${kpiCards[kpiDetail].color}`}>
                  {React.createElement(kpiCards[kpiDetail].icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'تفاصيل' : 'Détails'}</p>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{kpiCards[kpiDetail].title}</p>
                </div>
              </div>
              <button onClick={() => setKpiDetail(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              {kpiDetails[kpiDetail]}
            </div>
          </div>
        </div>
      )}

      {/* Charts Row - Premium Glass Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-indigo-100/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
              Production par Phase
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={phaseData}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
              />
              <Bar dataKey="pieces" fill="url(#barGrad)" radius={[8, 8, 0, 0]} name="Pièces" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-emerald-100/20">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            État des Factures
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={factureData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {factureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                formatter={(val) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row - Alerts & Orders */}
      <div className="max-w-7-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-amber-100/20">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
            Alertes Stock Tissu
          </h3>
          {lowStockTissus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tous les stocks sont OK</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {lowStockTissus.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 font-black text-xs">
                      {t.type[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight">{t.type} - {t.couleur}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Seuil: {t.seuilAlerte}m</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-600">{t.metrage}m</span>
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter mt-0.5">Critique</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commandes en cours */}
        <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-blue-100/20">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
            Commandes en Cours
          </h3>
          <div className="space-y-4 max-h-[340px] overflow-y-auto no-scrollbar pr-2">
            {commandesEnCours.slice(0, 5).map(cmd => {
              const phaseIdx = PHASE_ORDER.indexOf(cmd.phase);
              const progress = (phaseIdx / (PHASE_ORDER.length - 1)) * 100;
              const isLate = new Date(cmd.dateLivraisonPrevue) < new Date();
              return (
                <div key={cmd.id} className="p-5 bg-white rounded-3xl border border-slate-50 shadow-sm hover:border-blue-100 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${isLate ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                        {cmd.reference.split('-').pop()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{cmd.reference}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{cmd.client}</p>
                      </div>
                    </div>
                    {isLate ? (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
                        Retard
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        OK
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>{PHASE_LABELS[cmd.phase]}</span>
                      <span className="text-slate-900">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${isLate ? 'from-rose-500 to-red-600' : 'from-blue-500 to-indigo-600'} rounded-full transition-all duration-1000`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Detail Popover */}
      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border border-white relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />

            <div className="flex flex-col items-center text-center">
                {(() => {
                  // ✅ Smart Photo Lookup (Supabase map → localStorage → none)
                  let empId = selectedUser.employeId;
                  if (!empId && selectedUser.nom) {
                     const match = employes.find(e => 
                        `${e.prenom} ${e.nom}`.toLowerCase() === selectedUser.nom.toLowerCase() ||
                        `${e.nom} ${e.prenom}`.toLowerCase() === selectedUser.nom.toLowerCase()
                     );
                     if (match) empId = match.id;
                  }

                  const photo = selectedUser.photo
                    || (empId ? workerPhotos[empId] : null)
                    || (empId ? localStorage.getItem(`beya_worker_photo_${empId}`) : null);
                  
                  const initials = (selectedUser.nom || 'User').split(' ').filter(Boolean).map(n => n?.[0] || '').join('').toUpperCase() || '??';
                  return (
                    <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 text-2xl font-black mb-6 shadow-xl shadow-indigo-100 border-4 border-white overflow-hidden">
                      {photo ? <img src={photo} alt={selectedUser.nom} className="w-full h-full object-cover" /> : initials}
                    </div>
                  );
                })()}

              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">{selectedUser.nom}</h3>
              <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 border border-indigo-100">
                {selectedUser.role}
              </p>

              <div className="w-full space-y-4 mb-10">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'آخر ظهور' : 'Dernier accès'}</span>
                  <span className="text-xs font-bold text-slate-900">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{isAr ? 'الحالة' : 'Statut'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{isAr ? 'متصل الآن' : 'En ligne'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
              >
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Live List Modal */}
      {listModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">{listModal.title} ({listModal.employees.length})</h3>
              <button onClick={() => setListModal(null)} className="p-3 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl shadow-sm transition-colors border border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {listModal.employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <UserX className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-center text-xs font-bold uppercase tracking-widest">{isAr ? 'لا يوجد عمال' : 'Aucun ouvrier dans cette liste'}</p>
                </div>
              ) : (
                listModal.employees.map(e => {
                  const p = presencesAujourdhui.find(pr => pr.employeId === e.id);
                  const photo = e.photo 
                    || (typeof workerPhotos !== 'undefined' ? workerPhotos[e.id] : null)
                    || localStorage.getItem(`beya_worker_photo_${e.id}`);
                  
                  return (
                    <div key={e.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-[1rem] overflow-hidden flex items-center justify-center text-xs font-black shrink-0 relative bg-slate-100 border-2 border-white shadow-sm">
                        {photo ? (
                          <img src={photo} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-slate-400">{e.nom?.[0] || '?'}{e.prenom?.[0] || ''}</span>
                        )}
                        {/* Status indicator dot */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style={{
                           backgroundColor: p?.statut === 'present' ? '#10b981' : p?.statut === 'retard' ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{e.nom} {e.prenom}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{e.poste}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {p?.heureEntree ? (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 tabular-nums">
                            {p.heureEntree}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase">--:--</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
