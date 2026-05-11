import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, Percent,
  Receipt, ArrowUpRight, ArrowRight,
  AlertCircle, CheckCircle, Clock, Download,
  Layers, Package, Users, ShoppingCart
} from 'lucide-react';
import { generatePDF } from '../utils/pdf';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { loadData, Facture, Charge, Commande, FicheTechnique, StockTissu, Employe, PaiementSalaire } from '../types';
import { useLang } from '../contexts/LangContext';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

function KpiCard({
  label, value, sub, icon: Icon, color, trend, onClick,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}) {
  const { isAr } = useLang();
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-3xl border p-6 shadow-sm ${isAr ? 'text-right' : 'text-left'} w-full transition-all hover:shadow-xl hover:-translate-y-1 border-slate-100 ${color}`}
    >
      <div className={`flex items-start justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <p className="text-[10px] font-black text-current opacity-60 uppercase tracking-[0.2em]">{label}</p>
        <div className="w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      {sub && <p className="text-xs opacity-50 mt-1.5 font-bold">{sub}</p>}
    </button>
  );
}

export default function BilanFinancier() {
  const navigate = useNavigate();
  const { lang, isAr } = useLang();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [paiements, setPaiements] = useState<PaiementSalaire[]>([]);

  useEffect(() => {
    Promise.all([
      loadData<Facture>('factures'),
      loadData<Charge>('charges'),
      loadData<Commande>('commandes'),
      loadData<FicheTechnique>('fiches'),
      loadData<StockTissu>('tissus'),
      loadData<any>('users'),
      loadData<Employe>('employes'),
      loadData<PaiementSalaire>('paiements_salaires')
    ]).then(([f, c, cmd, ft, t, u, emp, p]) => {
      setFactures(f);
      setCharges(c);
      setCommandes(cmd);
      setFiches(ft);
      setTissus(t);
      setClients(u.filter((user: any) => user.role === 'client'));
      setEmployes(emp);
      setPaiements(p);
    });
  }, []);

  const today = new Date();
  const currentYear = today.getFullYear();

  // ADVANCED PROFITABILITY CALCULATION
  const orderProfits = useMemo(() => {
    return commandes.map(cmd => {
      const fiche = fiches.find(f => f.modele === cmd.modele);
      const revenue = (cmd.prix || 0) * (cmd.quantite || 0);

      // Material Cost
      let fabricCost = 0;
      if (cmd.tissuSourcing === 'maison' && fiche) {
        const roll = tissus.find(t => `${t.type} ${t.couleur}` === cmd.tissu);
        const pricePerMeter = roll?.prixMetre || cmd.tissuPrix || 0;
        fabricCost = (fiche.tissuConsommation * pricePerMeter) * cmd.quantite;
      }

      // Labor Cost
      const laborCost = (cmd.coutMainOeuvre || 0) * cmd.quantite;

      const totalCost = fabricCost + laborCost;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        ...cmd,
        revenue,
        fabricCost,
        laborCost,
        totalCost,
        profit,
        margin
      };
    });
  }, [commandes, fiches, tissus]);

  // FIXED: Accurate Global Debt Calculation (Per Client)
  const totalDettes = useMemo(() => {
    return (clients || []).reduce((sum, client) => {
      const clientName = (client.nom || '').toLowerCase();
      const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === clientName);
      const clientFactures = (factures || []).filter(f => (f.client || '').toLowerCase() === clientName);
      
      const revenue = clientCmds.reduce((s, c) => s + ((c.quantite || 0) * (c.prix || 0)), 0);
      const advances = clientCmds.reduce((s, c) => s + (c.avance || 0), 0);
      const paidInvoices = clientFactures.filter(f => f.statut === 'payée').reduce((s, f) => s + (f.montant || 0), 0);
      
      const paid = Math.max(advances, paidInvoices);
      return sum + Math.max(0, revenue - paid);
    }, 0);
  }, [clients, commandes, factures]);

  const totalRevenue = orderProfits.reduce((sum, p) => sum + p.revenue, 0);
  const totalCosts = orderProfits.reduce((sum, p) => sum + p.totalCost, 0);
  const totalProfit = totalRevenue - totalCosts;
  const totalAvances = orderProfits.reduce((sum, p) => sum + (p.avance || 0), 0);
  const netMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const stats = useMemo(() => {
    // NEW ACCURATE CALCULATION: Total Cash In (Advances + Paid Invoices)
    const ca = (clients || []).reduce((sum, client) => {
      const clientName = (client.nom || '').toLowerCase();
      const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === clientName);
      const clientFactures = (factures || []).filter(f => (f.client || '').toLowerCase() === clientName);
      
      const advances = clientCmds.reduce((s, c) => s + (c.avance || 0), 0);
      const paidInvoices = clientFactures.filter(f => f.statut === 'payée').reduce((s, f) => s + (f.montant || 0), 0);
      
      return sum + Math.max(advances, paidInvoices);
    }, 0);

    const caTotal = orderProfits.reduce((a, p) => a + p.revenue, 0);
    const caAttente = Math.max(0, caTotal - ca);

    // Fixed Charges
    const totalCharges = charges.filter(c => c.statut === 'payé').reduce((a, c) => a + c.montant, 0);
    
    // ✅ Calculate Pending Salaries from RH for the current month
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const pendingSalaries = Array.isArray(employes) && Array.isArray(paiements)
      ? employes
        .filter(e => e && e.actif)
        .reduce((total, emp) => {
          const paye = paiements
            .filter(p => p && p.employeId === emp.id && p.mois === currentMonthStr)
            .reduce((sum, p) => sum + (p.montant || 0), 0);
          const reste = Math.max(0, (emp.salaireMensuel || 0) - paye);
          return total + reste;
        }, 0)
      : 0;

    const totalChargesPending = charges.filter(c => c.statut === 'en_attente').reduce((a, c) => a + c.montant, 0) + pendingSalaries;
    
    // Direct Costs from Orders
    const totalOrderCosts = orderProfits.reduce((a, op) => a + op.totalCost, 0);
    
    const globalProfit = ca - totalCharges; 
    const marge = ca > 0 ? Math.round((globalProfit / ca) * 100) : 0;

    return { ca, caTotal, caAttente, totalCharges, totalChargesPending, totalOrderCosts, globalProfit, marge };
  }, [factures, charges, orderProfits, employes, paiements]);

  const monthlyData = useMemo(() => {
    return (isAr ? MONTHS_AR : MONTHS_FR).map((month, i) => {
      const mStr = String(i + 1).padStart(2, '0');
      const prefix = `${currentYear}-${mStr}`;

      const revenue = factures
        .filter(f => f.statut === 'payée' && f.date?.startsWith(prefix))
        .reduce((a, f) => a + f.montant, 0);

      const depenses = charges
        .filter(c => c.statut === 'payé' && c.date?.startsWith(prefix))
        .reduce((a, c) => a + c.montant, 0);

      return { month, revenue, depenses, profit: revenue - depenses };
    });
  }, [factures, charges, currentYear]);

  const fmt = (n: number) => n.toLocaleString('fr-MA');

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 ${isAr ? 'lg:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isAr ? 'لوحة القيادة المالية' : 'Tableau de Bord Financier'}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-2">{isAr ? 'نظرة عامة على الربحية' : "Vue d'ensemble de la rentabilité"} · {currentYear}</p>
        </div>
        <div className={`flex gap-3 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={() => navigate('/factures')} className="flex items-center gap-2 text-xs bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-black hover:bg-slate-50 transition shadow-sm">
            <Receipt className="w-4 h-4 text-indigo-500" /> {isAr ? 'الفواتير' : 'FACTURES'}
          </button>
          <button onClick={() => navigate('/charges')} className="flex items-center gap-2 text-xs bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-black hover:bg-slate-50 transition shadow-sm">
            <TrendingDown className="w-4 h-4 text-red-500" /> {isAr ? 'المصاريف' : 'CHARGES'}
          </button>
          <button
            onClick={() => generatePDF('bilan-capture', `Rapport_Financier_${currentYear}`)}
            className="flex items-center gap-2 text-xs bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-slate-800 transition shadow-xl shadow-slate-200"
          >
            <Download className="w-4 h-4" /> {isAr ? 'تصدير التقرير' : 'EXPORTER RAPPORT'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label={isAr ? 'رقم المعاملات' : "Chiffre d'Affaires"}
          value={`${totalRevenue.toLocaleString()} DH`}
          sub={isAr ? `${totalDettes.toLocaleString()} DH غير محصلة` : `${totalDettes.toLocaleString()} DH non encaissés`}
          icon={TrendingUp}
          color="text-indigo-600 border-indigo-100"
          trend="up"
        />
        <KpiCard
          label={isAr ? 'ديون الموردين' : 'Dettes Fournisseurs'}
          value={`${fmt(stats.totalChargesPending)} MAD`}
          sub={isAr ? 'مصاريف في انتظار الأداء' : 'Charges en attente de paiement'}
          icon={AlertCircle}
          color="text-orange-600 border-orange-100"
        />
        <KpiCard
          label={isAr ? 'الربح الفعلي (السيولة)' : 'Profit Réel (Cash-Flow)'}
          value={`${fmt(stats.globalProfit)} MAD`}
          sub={isAr ? 'بناءً على المحصل مقابل المؤدى' : "Basé sur l'encaissé vs payé"}
          icon={DollarSign}
          color={stats.globalProfit >= 0 ? "text-emerald-600 border-emerald-100" : "text-red-600 border-red-100"}
          trend={stats.globalProfit >= 0 ? "up" : "down"}
        />
        <KpiCard
          label={isAr ? 'بقايا الاستخلاص' : 'Restes à Recouvrer'}
          value={`${totalDettes.toLocaleString()} DH`}
          sub={isAr ? 'المبالغ المستحقة من طرف الزبناء' : 'Somme due par les clients'}
          icon={Clock}
          color="text-rose-600 border-rose-100"
          trend="down"
        />
        <KpiCard
          label={isAr ? 'الهامش الصافي' : 'Marge Nette'}
          value={`${stats.marge}%`}
          sub={isAr ? 'الربحية الإجمالية' : 'Rentabilité globale'}
          icon={Percent}
          color="text-amber-600 border-amber-100"
        />
      </div>

      {/* NEW: Detailed Cash-Flow Summary */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className={`relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 ${isAr ? 'md:flex-row-reverse' : ''}`}>
          <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">{isAr ? 'الحصيلة الصافية للسيولة' : 'Bilan Net de Trésorerie'}</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{isAr ? 'حساب دقيق بين المبالغ المحصلة والمصاريف المؤداة' : "Calcul précis entre l'encaissé réel et les dépenses payées"}</p>
            
            <div className={`mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`${isAr ? 'border-r-2 pr-6' : 'border-l-2 pl-6'} border-emerald-500/30`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isAr ? 'مهام محصلة (+)' : 'Missions Encaissées (+)'}</p>
                <p className="text-2xl font-black text-emerald-400">{fmt(stats.ca)} MAD</p>
              </div>
              <div className={`${isAr ? 'border-r-2 pr-6' : 'border-l-2 pl-6'} border-red-500/30`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isAr ? 'مصاريف مؤداة (-)' : 'Dépenses Payées (-)'}</p>
                <p className="text-2xl font-black text-red-400">{fmt(stats.totalCharges)} MAD</p>
              </div>
              <div className={`${isAr ? 'border-r-2 pr-6' : 'border-l-2 pl-6'} border-orange-500/30`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isAr ? 'مصاريف في الانتظار' : 'Dépenses en Attente'}</p>
                <p className="text-2xl font-black text-orange-400">{fmt(stats.totalChargesPending)} MAD</p>
              </div>
              <div className={`${isAr ? 'border-r-2 pr-6' : 'border-l-2 pl-6'} border-indigo-500`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isAr ? 'الربح الفعلي المتوفر' : 'Bénéfice Réel Disponbile'}</p>
                <p className="text-3xl font-black text-white">{fmt(stats.globalProfit)} MAD</p>
              </div>
            </div>
          </div>
          <div className={`w-32 h-32 rounded-full border-8 ${stats.globalProfit >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'} flex items-center justify-center`}>
            <div className={`w-20 h-20 rounded-full ${stats.globalProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'} flex items-center justify-center shadow-lg`}>
              {stats.globalProfit >= 0 ? <TrendingUp className="w-8 h-8 text-white" /> : <TrendingDown className="w-8 h-8 text-white" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <div className={`flex items-center justify-between mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : ''}>
              <h2 className="text-xl font-black text-slate-800">{isAr ? 'تدفق السيولة' : 'Flux de Trésorerie'}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{isAr ? 'المداخيل مقابل المصاريف الشهرية' : 'Revenus vs Dépenses mensuelles'}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip cursor={{ fill: '#f8fafc' }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xl">
                    <p className="text-xs font-black text-slate-400 uppercase mb-2">{payload[0].payload.month}</p>
                    <p className="text-sm font-black text-emerald-600">{isAr ? 'المداخيل' : 'Revenu'}: {fmt(payload[0].value as number)} MAD</p>
                    <p className="text-sm font-black text-red-500">{isAr ? 'المصاريف' : 'Charge'}: {fmt(payload[1].value as number)} MAD</p>
                  </div>
                );
              }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="depenses" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 ${isAr ? 'text-right' : ''}`}>
          <h2 className="text-xl font-black text-slate-800 mb-2">{isAr ? 'تحليل التكاليف' : 'Analyse des Coûts'}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{isAr ? 'توزيع المصاريف المباشرة' : 'Répartition des dépenses directes'}</p>

          <div className="space-y-6">
            <div>
              <div className={`flex justify-between text-xs font-black uppercase mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-slate-500">{isAr ? 'الثوب (من المعمل)' : 'Tissu (Maison)'}</span>
                <span className="text-slate-900">{fmt(orderProfits.reduce((a, o) => a + o.fabricCost, 0))} MAD</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className={`flex justify-between text-xs font-black uppercase mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-slate-500">{isAr ? 'اليد العاملة' : "Main d'œuvre"}</span>
                <span className="text-slate-900">{fmt(orderProfits.reduce((a, o) => a + o.laborCost, 0))} MAD</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
            <div>
              <div className={`flex justify-between text-xs font-black uppercase mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-slate-500">{isAr ? 'مصاريف قارة' : 'Charges Fixes'}</span>
                <span className="text-slate-900">{fmt(stats.totalCharges)} MAD</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
            <h4 className="text-sm font-black text-indigo-900 mb-1">{isAr ? 'ملاحظة' : 'Observation'}</h4>
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              {isAr ? `تمثل تكاليف الإنتاج المباشرة حوالي ${stats.ca > 0 ? Math.round((stats.totalOrderCosts / stats.ca) * 100) : 0}% من رقم معاملاتكم المحصل.` : `Vos coûts de production directs représentent environ ${stats.ca > 0 ? Math.round((stats.totalOrderCosts / stats.ca) * 100) : 0}% de votre CA encaissé.`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden" id="bilan-capture">
        <div className={`p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={isAr ? 'text-right' : ''}>
            <h2 className="text-xl font-black text-slate-800">{isAr ? 'الربحية حسب الطلبية' : 'Rentabilité par Commande'}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{isAr ? 'تفاصيل دقيقة للهامش الصافي' : 'Détails précis de la marge nette'}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className={`px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>{isAr ? 'الطلبية / الزبون' : 'Commande / Client'}</th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>{isAr ? 'المصدر' : 'Source'}</th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'الثوب' : 'Matière'}</th>
                <th className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'اليد العاملة' : "Main d'œuvre"}</th>
                <th className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-indigo-600 ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'الربح الصافي' : 'Bénéfice Net'}</th>
                <th className={`px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'الهامش %' : 'Marge %'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orderProfits.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className={`px-8 py-5 ${isAr ? 'text-right' : ''}`}>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{op.reference}</span>
                      <span className="text-xs font-bold text-slate-400">{op.client} · {op.modele}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${op.tissuSourcing === 'client' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-indigo-100 text-indigo-600 border border-indigo-200'}`}>
                      {op.tissuSourcing === 'client' ? (isAr ? 'الزبون' : 'Client') : (isAr ? 'المعمل' : 'Maison')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-slate-600 text-xs">-{fmt(op.fabricCost)} MAD</td>
                  <td className="px-6 py-5 text-right font-bold text-slate-600 text-xs">-{fmt(op.laborCost)} MAD</td>
                  <td className={`px-6 py-5 text-right font-black text-sm ${op.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {fmt(op.profit)} MAD
                  </td>
                  <td className={`px-8 py-5 ${isAr ? 'text-left' : 'text-right'}`}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : 'justify-end'}`}>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${op.margin >= 30 ? 'bg-emerald-500' : op.margin >= 15 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${Math.max(0, Math.min(100, op.margin))}%` }} />
                      </div>
                      <span className={`text-xs font-black ${op.margin >= 30 ? 'text-emerald-600' : op.margin >= 15 ? 'text-blue-600' : 'text-red-500'}`}>
                        {Math.round(op.margin)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
