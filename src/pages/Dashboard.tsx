import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Shirt, TriangleAlert, Truck, TrendingUp, Package, Users, Activity,
  Clock, CircleCheckBig, CircleX, Receipt, UserCheck, UserX, LogIn, LogOut,
} from 'lucide-react';
import {
  loadData, Commande, StockTissu, Employe, Facture, PointageEntry, Presence,
  PHASE_LABELS, PHASE_ORDER, User
} from '../types';
import { useLang } from '../contexts/LangContext';

interface DashboardProps {
  allUsers?: User[];
}

export default function Dashboard({ allUsers = [] }: DashboardProps) {
  const { isAr } = useLang();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [now, setNow] = useState(new Date());

  function loadAll() {
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<StockTissu>('tissus'),
      loadData<Employe>('employes'),
      loadData<Facture>('factures'),
      loadData<PointageEntry>('pointages'),
      loadData<Presence>('presences')
    ]).then(([cmds, tiss, emps, facs, pts, pres]) => {
      setCommandes(cmds);
      setTissus(tiss);
      setEmployes(emps);
      setFactures(facs);
      setPointages(pts);
      setPresences(pres);
      setNow(new Date());
    });
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []);

  // KPI Calculations
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

  // Présences du jour
  const today = now.toISOString().split('T')[0];
  const actifs = employes.filter(e => e.actif);
  const presencesAujourdhui = presences.filter(p => p.date === today);
  const presents = actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent'));
  const absents = actifs.filter(e => !presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent'));
  const retards = actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.statut === 'retard'));
  const enCoursPresence = actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.heureEntree && !p.heureSortie));
  const empName = (e: Employe) => e.prenom ? `${e.prenom} ${e.nom}` : e.nom;

  // Chart data
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

  const kpiCards = [
    {
      title: isAr ? 'الإنتاج قيد التنفيذ' : 'Encours de Production',
      value: isAr ? `${totalPiecesEnCours} قطعة` : `${totalPiecesEnCours} pièces`,
      subtitle: isAr ? `${commandesEnCours.length} طلبيات نشطة` : `${commandesEnCours.length} commandes actives`,
      icon: Shirt,
      color: 'from-indigo-500 to-blue-600',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: isAr ? 'نسبة التالف' : 'Taux de Rebut',
      value: `${tauxRebut}%`,
      subtitle: isAr ? `${totalRebut} قطعة تالفة / ${totalPieces}` : `${totalRebut} pièces rebutées / ${totalPieces}`,
      icon: TriangleAlert,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: isAr ? 'مواعيد التسليم' : 'Délais de Livraison',
      value: isAr ? `${commandesEnRetard.length} متأخرة` : `${commandesEnRetard.length} en retard`,
      subtitle: commandesEnRetard.length === 0 ? (isAr ? 'الكل في الوقت المحدد!' : 'Tout est dans les temps !') : (isAr ? 'انتبه للمواعيد' : 'Attention aux délais'),
      icon: Truck,
      color: commandesEnRetard.length > 0 ? 'from-red-500 to-rose-600' : 'from-green-500 to-emerald-600',
      bgLight: commandesEnRetard.length > 0 ? 'bg-red-50' : 'bg-green-50',
      textColor: commandesEnRetard.length > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      title: isAr ? 'رقم الأعمال' : 'Chiffre d\'Affaires',
      value: `${(caTotal / 1000).toFixed(0)}K MAD`,
      subtitle: isAr ? `${(caPaye / 1000).toFixed(0)}K مدفوع · ${(caImpaye / 1000).toFixed(0)}K غير مدفوع` : `${(caPaye / 1000).toFixed(0)}K encaissé · ${(caImpaye / 1000).toFixed(0)}K impayé`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  return (
    <div className={`space-y-8 pb-10 ${isAr ? 'text-right' : ''}`}>
      {/* Premium Header */}
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
                {allUsers.filter(u => u.lastActive && (Date.now() - new Date(u.lastActive).getTime() < 120000)).length} {isAr ? 'نشط الآن' : 'actifs'}
              </span>
            </div>
            <div className="flex -space-x-3">
              {allUsers.filter(u => u.lastActive && (Date.now() - new Date(u.lastActive).getTime() < 120000)).map(u => {
                const colors: Record<string, string> = { 
                  admin: 'border-indigo-500 bg-indigo-50 text-indigo-700', 
                  pointeur: 'border-blue-500 bg-blue-50 text-blue-700',
                  worker: 'border-purple-500 bg-purple-50 text-purple-700',
                  coupeur: 'border-orange-500 bg-orange-50 text-orange-700',
                };
                const c = colors[u.role] || 'border-slate-300 bg-slate-50 text-slate-600';
                const initials = u.nom.split(' ').map(n => n[0]).join('').toUpperCase();
                return (
                  <div key={u.id} className={`w-10 h-10 rounded-full border-2 ${c} flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-white transition-transform hover:-translate-y-1 cursor-pointer`} title={u.nom}>
                    {initials}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - High Fidelity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-1">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-100/30 hover:shadow-2xl transition-all duration-300 overflow-hidden">
             <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-5 blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`} />
             
             <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${kpi.color} transform group-hover:scale-110 transition-transform duration-500`}>
                  <kpi.icon className="w-7 h-7" />
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-tighter">KPI {i+1}</div>
             </div>
             
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{kpi.title}</p>
                <p className={`text-3xl font-black text-slate-900 tracking-tight`}>{kpi.value}</p>
                <p className={`text-[10px] font-bold mt-2 ${kpi.textColor} opacity-80 italic`}>{kpi.subtitle}</p>
             </div>
          </div>
        ))}
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alertes Stock */}
        <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-amber-100/20">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
            Alertes Stock Tissu
          </h3>
          {lowStockTissus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
               <CircleCheckBig className="w-10 h-10 text-emerald-400 mb-3" />
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

      {/* Modern Presence Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            Présences du Jour
            <span className="text-xs text-slate-400 font-bold ml-2 opacity-60">/ {today}</span>
          </h3>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {presents.slice(0, 5).map(e => (
                   <div key={e.id} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] font-black uppercase" title={empName(e)}>
                      {e.nom[0]}
                   </div>
                ))}
                {presents.length > 5 && <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-black">+{presents.length - 5}</div>}
             </div>
             <span className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring
             </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Présents", val: presents.length, color: "emerald", icon: <UserCheck /> },
            { label: "Absents", val: absents.length, color: "rose", icon: <UserX /> },
            { label: "Retards", val: retards.length, color: "amber", icon: <Clock /> },
            { label: "Actifs", val: enCoursPresence.length, color: "blue", icon: <Activity /> }
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-3xl border border-${stat.color}-100 bg-${stat.color}-50/30 flex items-center justify-between`}>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black text-${stat.color}-600 tracking-tight`}>{stat.val}</p>
               </div>
               <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600`}>
                  {stat.icon}
               </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actifs.map(emp => {
            const p = presencesAujourdhui.find(x => x.employeId === emp.id);
            const isAbsent = !p || p.statut === 'absent';
            const isRetard = p?.statut === 'retard';
            const hasEntree = p?.heureEntree;
            return (
              <div key={emp.id} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                isAbsent ? 'bg-slate-50/50 border-slate-100 grayscale opacity-60' : 
                isRetard ? 'bg-amber-50/50 border-amber-100 shadow-sm shadow-amber-100/50' : 
                'bg-white border-slate-50 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${isAbsent ? 'bg-slate-300' : isRetard ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-xs font-black text-slate-700 truncate tracking-tight">{empName(emp)}</span>
                </div>
                {hasEntree && <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{p!.heureEntree}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Employés", val: employes.filter(e => e.actif).length, icon: <Users />, grad: "from-indigo-600 to-violet-700" },
          { label: "Types Tissu", val: tissus.length, icon: <Package />, grad: "from-blue-600 to-cyan-600" },
          { label: "Pointages", val: pointages.length, icon: <CircleCheckBig />, grad: "from-emerald-600 to-teal-700" },
          { label: "Factures", val: factures.length, icon: <Receipt />, grad: "from-slate-800 to-slate-900" }
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden bg-gradient-to-br ${stat.grad} rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200/50 group`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
                  {stat.icon}
               </div>
               <p className="text-3xl font-black tracking-tight">{stat.val}</p>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
