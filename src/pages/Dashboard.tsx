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
  PHASE_LABELS, PHASE_ORDER,
} from '../types';
import { useLang } from '../contexts/LangContext';

export default function Dashboard() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className={isAr ? 'text-right' : 'text-left'}>
        <h1 className="text-2xl font-bold text-slate-800">{isAr ? 'لوحة التحكم' : 'Tableau de Bord'}</h1>
        <p className="text-slate-500 mt-1">{isAr ? 'نظرة عامة على إنتاج النسيج الخاص بك' : 'Vue d\'ensemble de votre production textile'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.title}</p>
                <p className={`text-2xl font-bold mt-2 ${kpi.textColor}`}>{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production par Phase */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Production par Phase
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={phaseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="pieces" fill="#6366f1" radius={[6, 6, 0, 0]} name="Pièces" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Factures */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-500" />
            État des Factures
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={factureData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {factureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 text-amber-500" />
            Alertes Stock Tissu
          </h3>
          {lowStockTissus.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">✅ Tous les stocks sont à niveau</p>
          ) : (
            <div className="space-y-3">
              {lowStockTissus.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.type} - {t.couleur}</p>
                    <p className="text-xs text-slate-500">Seuil: {t.seuilAlerte}m</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{t.metrage}m restants</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commandes en cours */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Commandes en Cours
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {commandesEnCours.slice(0, 5).map(cmd => {
              const phaseIdx = PHASE_ORDER.indexOf(cmd.phase);
              const progress = (phaseIdx / (PHASE_ORDER.length - 1)) * 100;
              const isLate = new Date(cmd.dateLivraisonPrevue) < new Date();
              return (
                <div key={cmd.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{cmd.reference}</span>
                      <span className="text-xs text-slate-400 ml-2">{cmd.client}</span>
                    </div>
                    {isLate ? (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <CircleX className="w-3 h-3" /> En retard
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                        <CircleCheckBig className="w-3 h-3" /> OK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 min-w-[70px] text-right">
                      {PHASE_LABELS[cmd.phase]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Présences du Jour */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            Présences du Jour
            <span className="text-xs text-slate-400 font-normal">{today}</span>
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-600">{presents.length}</p>
            <p className="text-xs text-green-700 mt-0.5">Présents</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-xl font-bold text-red-500">{absents.length}</p>
            <p className="text-xs text-red-600 mt-0.5">Absents</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-xl font-bold text-amber-500">{retards.length}</p>
            <p className="text-xs text-amber-600 mt-0.5">Retards</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xl font-bold text-blue-500">{enCoursPresence.length}</p>
            <p className="text-xs text-blue-600 mt-0.5">En cours</p>
          </div>
        </div>

        {/* Barre de progression */}
        {actifs.length > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Taux de présence</span>
              <span>{Math.round((presents.length / actifs.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                style={{ width: `${(presents.length / actifs.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Liste employés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
          {actifs.map(emp => {
            const p = presencesAujourdhui.find(x => x.employeId === emp.id);
            const isAbsent = !p || p.statut === 'absent';
            const isRetard = p?.statut === 'retard';
            const hasEntree = p?.heureEntree;
            const hasSortie = p?.heureSortie;
            return (
              <div key={emp.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isAbsent ? 'bg-red-50' : isRetard ? 'bg-amber-50' : 'bg-green-50'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isAbsent ? 'bg-red-400' : isRetard ? 'bg-amber-400' : 'bg-green-500'}`} />
                  <span className="text-xs font-medium text-slate-700 truncate">{empName(emp)}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {hasEntree && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <LogIn className="w-3 h-3 text-green-500" />{p!.heureEntree}
                    </span>
                  )}
                  {hasSortie && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <LogOut className="w-3 h-3 text-indigo-500" />{p!.heureSortie}
                    </span>
                  )}
                  {isAbsent && <UserX className="w-3.5 h-3.5 text-red-400" />}
                </div>
              </div>
            );
          })}
          {actifs.length === 0 && (
            <p className="text-xs text-slate-400 col-span-2 text-center py-4">Aucun employé actif</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <Users className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{employes.filter(e => e.actif).length}</p>
          <p className="text-xs opacity-80">Employés actifs</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
          <Package className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{tissus.length}</p>
          <p className="text-xs opacity-80">Types de tissu</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
          <CircleCheckBig className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{pointages.length}</p>
          <p className="text-xs opacity-80">Pointages enregistrés</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <Receipt className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{factures.length}</p>
          <p className="text-xs opacity-80">Factures émises</p>
        </div>
      </div>
    </div>
  );
}
