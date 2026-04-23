import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, Percent,
  Receipt, ArrowUpRight, ArrowRight,
  AlertCircle, CheckCircle, Clock, Download,
} from 'lucide-react';
import { printBilan, exportFacturesCSV, exportChargesCSV } from '../utils/print';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { loadData, Facture, Charge, Commande, CATEGORIE_LABELS, CATEGORIE_COLORS } from '../types';

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function KpiCard({
  label, value, sub, icon: Icon, color, trend, onClick,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl border p-5 shadow-sm text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-current opacity-70 uppercase tracking-wider">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
      {trend && (
        <div className="mt-2">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 inline opacity-60" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 inline opacity-60" />}
        </div>
      )}
    </button>
  );
}

export default function BilanFinancier() {
  const navigate = useNavigate();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    Promise.all([
      loadData<Facture>('factures'),
      loadData<Charge>('charges'),
      loadData<Commande>('commandes')
    ]).then(([f, c, cmd]) => {
      setFactures(f);
      setCharges(c);
      setCommandes(cmd);
    });
  }, []);

  const today = new Date();
  const currentYear = today.getFullYear();

  const stats = useMemo(() => {
    const ca       = factures.filter(f => f.statut === 'payée').reduce((a, f) => a + f.montant, 0);
    const caTotal  = factures.reduce((a, f) => a + f.montant, 0);
    const caAttente = factures.filter(f => f.statut === 'en_attente').reduce((a, f) => a + f.montant, 0);
    const caRetard  = factures.filter(f => f.statut !== 'payée' && f.echeance && f.echeance < today.toISOString().split('T')[0]).reduce((a, f) => a + f.montant, 0);

    const totalCharges = charges.filter(c => c.statut === 'payé').reduce((a, c) => a + c.montant, 0);
    const chargesAttente = charges.filter(c => c.statut !== 'payé').reduce((a, c) => a + c.montant, 0);

    const benefice = ca - totalCharges;
    const marge    = ca > 0 ? Math.round((benefice / ca) * 100) : 0;

    return { ca, caTotal, caAttente, caRetard, totalCharges, chargesAttente, benefice, marge };
  }, [factures, charges]);

  // Monthly data for this year
  const monthlyData = useMemo(() => {
    return MONTHS_FR.map((month, i) => {
      const mStr = String(i + 1).padStart(2, '0');
      const prefix = `${currentYear}-${mStr}`;

      const revenue = factures
        .filter(f => f.statut === 'payée' && f.date?.startsWith(prefix))
        .reduce((a, f) => a + f.montant, 0);

      const depenses = charges
        .filter(c => c.statut === 'payé' && c.date?.startsWith(prefix))
        .reduce((a, c) => a + c.montant, 0);

      return { month, revenue, depenses, benefice: revenue - depenses };
    });
  }, [factures, charges, currentYear]);

  // Charges by category
  const chargesByCategorie = useMemo(() => {
    const map: Record<string, number> = {};
    charges.filter(c => c.statut === 'payé').forEach(c => {
      map[c.categorie] = (map[c.categorie] || 0) + c.montant;
    });
    return Object.entries(map)
      .map(([cat, val]) => ({ name: CATEGORIE_LABELS[cat as keyof typeof CATEGORIE_LABELS] ?? cat, value: val, color: CATEGORIE_COLORS[cat as keyof typeof CATEGORIE_COLORS] ?? '#94a3b8' }))
      .sort((a, b) => b.value - a.value);
  }, [charges]);

  // Factures by statut
  const facturesByStatut = useMemo(() => [
    { name: 'Payées',     value: factures.filter(f => f.statut === 'payée').length,     color: '#10b981' },
    { name: 'En attente', value: factures.filter(f => f.statut === 'en_attente').length, color: '#f59e0b' },
    { name: 'Impayées',   value: factures.filter(f => f.statut === 'impayée').length,   color: '#ef4444' },
  ].filter(s => s.value > 0), [factures]);

  // Top commandes by value
  const topCommandes = useMemo(() =>
    [...commandes]
      .sort((a, b) => (b.quantite * b.prix) - (a.quantite * a.prix))
      .slice(0, 5),
    [commandes]
  );

  // Recent unpaid factures
  const unpaidFactures = useMemo(() =>
    factures.filter(f => f.statut !== 'payée').slice(0, 5),
    [factures]
  );

  // Recent charges
  const recentCharges = useMemo(() =>
    [...charges].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [charges]
  );

  const fmt = (n: number) => n.toLocaleString('fr-MA');

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-bold text-slate-700 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {fmt(p.value)} MAD
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bilan Financier</h1>
          <p className="text-sm text-slate-500">Vue consolidée · Données réelles · {currentYear}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportFacturesCSV(factures)}
            className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-semibold hover:bg-slate-50 transition"
          >
            <Download className="w-3.5 h-3.5" /> CSV Factures
          </button>
          <button
            onClick={() => exportChargesCSV(charges)}
            className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-semibold hover:bg-slate-50 transition"
          >
            <Download className="w-3.5 h-3.5" /> CSV Charges
          </button>
          <button
            onClick={() => printBilan({ ...stats, year: currentYear })}
            className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-2 rounded-xl font-semibold hover:bg-purple-700 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Bilan PDF
          </button>
          <button onClick={() => navigate('/factures')} className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl font-semibold hover:bg-indigo-100 transition">
            <Receipt className="w-3.5 h-3.5" /> Factures
          </button>
          <button onClick={() => navigate('/charges')} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-xl font-semibold hover:bg-red-100 transition">
            <TrendingDown className="w-3.5 h-3.5" /> Charges
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Chiffre d'Affaires"
          value={`${fmt(stats.ca)} MAD`}
          sub={`${fmt(stats.caTotal)} MAD facturé total`}
          icon={TrendingUp}
          color="text-emerald-700 border-emerald-200"
          trend="up"
          onClick={() => navigate('/factures')}
        />
        <KpiCard
          label="Total Charges"
          value={`${fmt(stats.totalCharges)} MAD`}
          sub={`${fmt(stats.chargesAttente)} MAD à payer`}
          icon={TrendingDown}
          color="text-red-700 border-red-200"
          trend="down"
          onClick={() => navigate('/charges')}
        />
        <KpiCard
          label="Bénéfice Net"
          value={`${fmt(stats.benefice)} MAD`}
          sub={stats.benefice >= 0 ? 'Positif ✓' : 'Déficit ⚠'}
          icon={DollarSign}
          color={stats.benefice >= 0 ? 'text-indigo-700 border-indigo-200' : 'text-red-700 border-red-200'}
          trend={stats.benefice >= 0 ? 'up' : 'down'}
        />
        <KpiCard
          label="Taux de Marge"
          value={`${stats.marge}%`}
          sub={`Sur ${fmt(stats.ca)} MAD encaissé`}
          icon={Percent}
          color={stats.marge >= 20 ? 'text-violet-700 border-violet-200' : stats.marge >= 0 ? 'text-amber-700 border-amber-200' : 'text-red-700 border-red-200'}
        />
      </div>

      {/* Alert bar */}
      {(stats.caRetard > 0 || stats.chargesAttente > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.caRetard > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span><strong>{fmt(stats.caRetard)} MAD</strong> de factures en retard</span>
              <button onClick={() => navigate('/factures')} className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 ml-1">
                Voir <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
          {stats.chargesAttente > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span><strong>{fmt(stats.chargesAttente)} MAD</strong> de charges à régler</span>
              <button onClick={() => navigate('/charges')} className="text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 ml-1">
                Voir <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Monthly Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Revenus vs Charges — {currentYear}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Par mois · données réelles</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Revenus</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Charges</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" /> Bénéfice</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={customTooltip} />
            <Bar dataKey="revenue"  name="Revenus"  fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="depenses" name="Charges"  fill="#f87171" radius={[4,4,0,0]} />
            <Bar dataKey="benefice" name="Bénéfice" fill="#818cf8" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charges by category */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-1">Charges par Catégorie</h2>
          <p className="text-xs text-slate-400 mb-5">Dépenses payées uniquement</p>
          {chargesByCategorie.length === 0 ? (
            <div className="text-center py-10 text-slate-300">
              <TrendingDown className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Aucune charge enregistrée</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chargesByCategorie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {chargesByCategorie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${fmt(Number(v))} MAD`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {chargesByCategorie.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-xs text-slate-600 flex-1 truncate">{c.name}</span>
                    <span className="text-xs font-bold text-slate-700">{fmt(c.value)} MAD</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Factures statut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-1">État des Factures</h2>
          <p className="text-xs text-slate-400 mb-5">{factures.length} facture{factures.length !== 1 ? 's' : ''} au total</p>
          {factures.length === 0 ? (
            <div className="text-center py-10 text-slate-300">
              <Receipt className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Aucune facture</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={facturesByStatut} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {facturesByStatut.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Number(v)} facture${Number(v) !== 1 ? 's' : ''}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {facturesByStatut.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-slate-600 flex-1">{s.name}</span>
                    <span className="text-xs font-bold text-slate-700">{s.value} facture{s.value !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/factures')}
                className="mt-4 w-full flex items-center justify-center gap-2 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl py-2 font-semibold hover:bg-indigo-100 transition"
              >
                Gérer les factures <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom row — lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top commandes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Top Commandes (CA)</h3>
            <button onClick={() => navigate('/commandes')} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {topCommandes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune commande</p>
          ) : (
            <div className="space-y-2.5">
              {topCommandes.map((c, i) => {
                const val = c.quantite * c.prix;
                const maxVal = topCommandes[0].quantite * topCommandes[0].prix;
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{c.reference}</p>
                          <p className="text-[10px] text-slate-400">{c.client}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{fmt(val)} MAD</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="h-1 bg-indigo-500 rounded-full" style={{ width: `${(val / maxVal) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Factures à encaisser */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">À Encaisser</h3>
            <button onClick={() => navigate('/factures')} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {unpaidFactures.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Toutes les factures sont payées</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {unpaidFactures.map(f => {
                const overdue = f.echeance && f.echeance < today.toISOString().split('T')[0];
                return (
                  <div key={f.id} className={`flex items-center justify-between p-2.5 rounded-xl ${overdue ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{f.numero}</p>
                      <p className="text-[10px] text-slate-400">{f.client}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${overdue ? 'text-red-600' : 'text-slate-700'}`}>{fmt(f.montant)} MAD</p>
                      <p className={`text-[10px] ${overdue ? 'text-red-400' : 'text-slate-400'}`}>
                        {f.echeance ? new Date(f.echeance).toLocaleDateString('fr-MA') : '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dernières charges */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Dernières Charges</h3>
            <button onClick={() => navigate('/charges')} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {recentCharges.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune charge enregistrée</p>
          ) : (
            <div className="space-y-2.5">
              {recentCharges.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 truncate max-w-32">{c.designation}</p>
                    <p className="text-[10px] text-slate-400">
                      {CATEGORIE_LABELS[c.categorie] ?? c.categorie}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-600">{fmt(c.montant)} MAD</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      c.statut === 'payé' ? 'bg-emerald-100 text-emerald-600' :
                      c.statut === 'en_attente' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {c.statut === 'payé' ? 'Payé' : c.statut === 'en_attente' ? 'En attente' : 'Impayé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">Récapitulatif Financier</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 rounded-xl">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Indicateur</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Montant</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { label: 'CA Encaissé (factures payées)',    val: stats.ca,          detail: `${factures.filter(f => f.statut === 'payée').length} facture(s)`,  color: 'text-emerald-600' },
                { label: 'CA En attente',                    val: stats.caAttente,   detail: `${factures.filter(f => f.statut === 'en_attente').length} facture(s)`, color: 'text-amber-600' },
                { label: 'CA Total Facturé',                 val: stats.caTotal,     detail: `${factures.length} facture(s)`, color: 'text-indigo-600' },
                { label: 'Total Charges Réglées',            val: stats.totalCharges,detail: `${charges.filter(c => c.statut === 'payé').length} charge(s)`, color: 'text-red-600' },
                { label: 'Charges À Régler',                 val: stats.chargesAttente, detail: `${charges.filter(c => c.statut !== 'payé').length} charge(s)`, color: 'text-orange-500' },
                { label: 'Bénéfice Net',                     val: stats.benefice,    detail: `Marge ${stats.marge}%`, color: stats.benefice >= 0 ? 'text-emerald-700' : 'text-red-700' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{row.label}</td>
                  <td className={`px-4 py-3 text-sm font-bold text-right ${row.color}`}>{fmt(row.val)} MAD</td>
                  <td className="px-4 py-3 text-xs text-slate-400 text-right">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
