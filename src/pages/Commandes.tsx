import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, ShoppingCart, Calculator, ChevronDown,
  ChevronRight, Scissors, ClipboardCheck, Receipt, Link, X, TrendingUp,
  Package, Truck, AlertTriangle, Eye, Filter, ChevronUp, Clock,
  LayoutGrid, List, CheckCircle
} from 'lucide-react';
import {
  Commande, FicheTechnique, OrdreDeCoupe, PointageEntry, Facture, Employe, User, StockTissu,
  loadData, saveRecord, deleteRecord, genId, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, Phase,
  CompanyProfile, loadCompanyProfile, safeStorage
} from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';
import { generatePDF, printElement } from '../utils/pdf';
import { InvoicePRO } from '../components/InvoicePRO';

export default function Commandes() {
  const { lang, isAr } = useLang();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [ordres, setOrdres] = useState<OrdreDeCoupe[]>([]);
  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);

  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Commande>>({});
  const [showCalc, setShowCalc] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showStockWarning, setShowStockWarning] = useState<{
    order: Commande;
    needed: number;
    available: number;
  } | null>(null);
  const [stockConfirmChecked, setStockConfirmChecked] = useState(false);
  const [showSuccess, setShowSuccess] = useState<{ message: string; sub?: string } | null>(null);

  const [showFacturePreview, setShowFacturePreview] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());

  useEffect(() => {
    setCompany(loadCompanyProfile());
  }, []);

  // Advanced Calculator State
  const [calcFicheId, setCalcFicheId] = useState('');
  const [calcTissuId, setCalcTissuId] = useState('');
  const [calcQty, setCalcQty] = useState(1);
  const [calcPrixTissu, setCalcPrixTissu] = useState(0);
  const [calcMainOeuvre, setCalcMainOeuvre] = useState(0);
  const [calcCharges, setCalcCharges] = useState(0);
  const [calcAutres, setCalcAutres] = useState(0);
  const [calcMarge, setCalcMarge] = useState(30);
  const [calcConsommation, setCalcConsommation] = useState(0);

  useEffect(() => {
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<FicheTechnique>('fiches'),
      loadData<OrdreDeCoupe>('ordres'),
      loadData<PointageEntry>('pointages'),
      loadData<Facture>('factures'),
      loadData<Employe>('employes'),
      loadData<User>('users'),
      loadData<StockTissu>('tissus')
    ]).then(([cmds, fchs, ords, pts, facs, emps, usrs, tiss]) => {
      setCommandes(cmds);
      setFiches(fchs);
      setOrdres(ords);
      
      // Robust Pointage Loading: Merge Remote with Local Storage
      const localPtData = safeStorage.getItem('textrack_pointages');
      let localPts: PointageEntry[] = [];
      try {
        const parsed = localPtData ? JSON.parse(localPtData) : [];
        localPts = Array.isArray(parsed) ? parsed : [];
      } catch (e) { localPts = []; }
      
      const allPtsMap = new Map();
      [...localPts, ...pts].forEach(p => p && p.id && allPtsMap.set(p.id, p));
      setPointages(Array.from(allPtsMap.values()));

      setFactures(facs);
      setUsers(usrs);
      setTissus(tiss);

      // Robust Employee Loading: Merge Remote with Local Storage
      const localEmpData = safeStorage.getItem('textrack_employes');
      let localEmps: Employe[] = [];
      try {
        const parsed = localEmpData ? JSON.parse(localEmpData) : [];
        localEmps = Array.isArray(parsed) ? parsed : [];
      } catch (e) { localEmps = []; }
      
      // Combine and remove duplicates by ID
      const allEmpsMap = new Map();
      [...localEmps, ...emps].forEach(e => e && e.id && allEmpsMap.set(e.id, e));
      setEmployes(Array.from(allEmpsMap.values()));
    });
  }, []);

  // Auto-save Pointages to Local Storage
  useEffect(() => {
    if (pointages.length > 0) {
      safeStorage.setItem('textrack_pointages', JSON.stringify(pointages));
    }
  }, [pointages]);

  const filtered = commandes.filter(c => {
    const q = search.toLowerCase();
    const ok = c.reference.toLowerCase().includes(q) || c.client.toLowerCase().includes(q) || c.modele.toLowerCase().includes(q);
    return ok && (filterStatut === 'all' || c.statut === filterStatut);
  });

  const today = new Date().toISOString().split('T')[0];
  const isUrgent = (c: Commande): boolean => c.statut === 'en_cours' && !!c.dateLivraisonPrevue && c.dateLivraisonPrevue <= today;

  const stats = {
    total: commandes.length,
    ca: commandes.reduce((a, c) => a + c.quantite * c.prix, 0),
    enCours: commandes.filter(c => c.statut === 'en_cours').length,
    livre: commandes.filter(c => c.statut === 'livré').length,
    urgent: commandes.filter(isUrgent).length,
  };

  const empName = (id: string) => {
    const e = employes.find(x => x.id === id);
    return e ? (e.prenom ? `${e.prenom} ${e.nom}` : e.nom) : '—';
  };

  function openCreate() {
    setEditId(null);
    const year = new Date().getFullYear();
    const prefix = `CMD-${year}-`;
    const existingNums = commandes
      .filter(c => c.reference.startsWith(prefix))
      .map(c => parseInt(c.reference.replace(prefix, '')))
      .filter(n => !isNaN(n));

    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setForm({
      reference: `${prefix}${String(nextNum).padStart(3, '0')}`,
      client: '', modele: '', tissu: '', quantite: 0, quantiteLivre: 0,
      phase: 'coupe', prix: 0, rebut: 0, statut: 'en_cours', suivi: [],
      tissuSourcing: 'maison', tissuPrix: 0, coutMainOeuvre: 0, avance: 0
    });
    setShowModal(true);
  }

  function openEdit(c: Commande) {
    setEditId(c.id);
    setForm({ ...c, suivi: [...c.suivi] });
    setShowModal(true);
  }

  // Quick Pointage Logic
  const [showPointageModal, setShowPointageModal] = useState(false);
  const [ptForm, setPtForm] = useState<Partial<PointageEntry>>({});
  const [selectedCmd, setSelectedCmd] = useState<Commande | null>(null);

  function openPointage(c: Commande) {
    setSelectedCmd(c);
    setPtForm({
      id: genId(),
      commandeId: c.id,
      date: today,
      phase: c.phase,
      piecesCompletees: 0,
      rebut: 0,
      retouche: 0
    });
    setShowPointageModal(true);
  }

  async function savePointage() {
    if (!ptForm.employeId || !ptForm.piecesCompletees || !selectedCmd) return;
    const entry = ptForm as PointageEntry;
    setPointages([...pointages, entry]);
    setShowPointageModal(false);

    // FIX: Ensure employee exists in DB first
    const emp = employes.find(e => e.id === ptForm.employeId);
    if (emp) {
      await saveRecord('employes', emp, true).catch(() => {});
    }

    await saveRecord('pointages', entry, true);
  }

  async function save() {
    if (!form.reference || !form.client) return;
    const isNew = !editId;
    if (isNew && commandes.some(c => c.reference === form.reference)) {
      alert(`La référence "${form.reference}" est déjà utilisée.`);
      return;
    }
    const cmdId = editId || genId();
    const cmdData = { id: cmdId, ...form } as Commande;
    const updated = isNew ? [...commandes, cmdData] : commandes.map(c => c.id === editId ? cmdData : c);
    setCommandes(updated);
    setShowModal(false);

    // Safety check: remove tissu if it causes database errors (until SQL migration is run)
    const dataToSave = { ...cmdData };
    await saveRecord('commandes', dataToSave);
  }

  const handleSendToCutter = async (c: Commande, force: boolean = false) => {
    const existingOrdre = ordres.find(o => o.commandeId === c.id);
    if (existingOrdre) {
      alert(lang === 'fr' ? 'Déjà envoyé à la coupure' : 'مرسلة بالفعل للفصالة');
      return;
    }

    const fiche = fiches.find(f => f.modele === c.modele);
    const conso = fiche?.tissuConsommation || 0;
    const metrageRequis = Number((conso * c.quantite).toFixed(2));

    // Stock Linkage: Find the roll and deduct
    const selectedRoll = tissus.find(t => `${t.type} ${t.couleur}` === c.tissu);
    if (selectedRoll && !force) {
      if (selectedRoll.metrage < metrageRequis) {
        setStockConfirmChecked(false);
        setShowStockWarning({ order: c, needed: metrageRequis, available: selectedRoll.metrage });
        return;
      }
    }

    if (selectedRoll) {
      const updatedRoll = { ...selectedRoll, metrage: Math.max(0, selectedRoll.metrage - metrageRequis) };
      await saveRecord('tissus', updatedRoll);
      setTissus(prev => prev.map(t => t.id === updatedRoll.id ? updatedRoll : t));
    }

    const nouveauOrdre: OrdreDeCoupe = {
      id: genId(),
      commandeId: c.id,
      modele: c.modele,
      client: c.client,
      quantite: c.quantite,
      tissu: fiche?.type || c.tissu || '',
      couleur: 'À définir',
      metrage: metrageRequis,
      statut: 'planifié',
      dateCoupe: c.dateCommande
    };

    await saveRecord('ordres', nouveauOrdre);
    setOrdres(prev => [...prev, nouveauOrdre]);
    
    setShowSuccess({
      message: lang === 'fr' ? 'Envoyé à la coupure !' : 'تم الإرسال للفصالة !',
      sub: lang === 'fr' ? 'Le stock de tissu a été mis à jour avec succès.' : 'تم تحديث مخزون الثوب بنجاح.'
    });
    
    setTimeout(() => setShowSuccess(null), 3000);
  };

  async function remove(id: string) {
    setCommandes(commandes.filter(c => c.id !== id));
    setConfirmDelete(null);
    await deleteRecord('commandes', id);
  }

  async function createFacture(c: Commande) {
    const year = new Date().getFullYear();
    const count = factures.length + 1;
    const due = new Date();
    due.setDate(due.getDate() + 30);
    const newFacture: Facture = {
      id: genId(),
      numero: `FAC-${year}-${String(count).padStart(3, '0')}`,
      client: c.client, montant: c.quantite * c.prix, date: today,
      echeance: due.toISOString().split('T')[0], statut: 'en_attente', commandeId: c.id,
    };
    setSelectedFacture(newFacture);
    setShowFacturePreview(true);
  }

  async function handleConfirmFacture() {
    if (!selectedFacture) return;
    setFactures([...factures, selectedFacture]);
    await saveRecord('factures', selectedFacture);

    // Auto-print
    setTimeout(() => {
      printElement(`facture-pro-view-${selectedFacture.id}`);
      setShowFacturePreview(false);
    }, 500);
  }

  const getDynamicStatus = (c: Partial<Commande>) => {
    if (c.statut === 'livré') return { label: t('status_livree', lang), color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '✓' };

    const phase = c.phase || 'coupe';
    const cmdOrdre = ordres.find(o => o.commandeId === c.id);

    switch (phase) {
      case 'coupe':
        if (!cmdOrdre || cmdOrdre.statut === 'planifié') {
          return { label: lang === 'fr' ? 'En Attente (Coupe)' : 'في انتظار الفصالة', color: 'bg-slate-50 text-slate-500 border-slate-100', icon: '⏳' };
        }
        return { label: lang === 'fr' ? 'En Coupe' : 'قيد الفصالة', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: '✂️' };
      case 'montage':
        return { label: lang === 'fr' ? 'En Montage' : 'قيد الخياطة', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: '🧵' };
      case 'finition':
        return { label: lang === 'fr' ? 'Finition' : 'التشطيب', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: '✨' };
      case 'repassage':
        return { label: lang === 'fr' ? 'Repassage' : 'المصلوح', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: '💨' };
      case 'controle':
        return { label: lang === 'fr' ? 'Contrôle Qualité' : 'الرقابة', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: '🔍' };
      case 'emballage':
        return { label: lang === 'fr' ? 'Emballage' : 'التلفيف', color: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: '📦' };
      default:
        return { label: t('status_en_cours', lang), color: 'bg-slate-50 text-slate-700 border-slate-100', icon: '⏳' };
    }
  };

  function fmtDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function daysLeft(d: string) {
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  }

  // Advanced Calculator Handlers
  const handleFicheChange = (id: string) => {
    setCalcFicheId(id);
    const f = fiches.find(x => x.id === id);
    if (f) setCalcConsommation(f.tissuConsommation);
    else setCalcConsommation(0);
  };

  const handleTissuChange = (id: string) => {
    setCalcTissuId(id);
    const t = tissus.find(x => x.id === id);
    if (t) setCalcPrixTissu(t.prixMetre);
    else setCalcPrixTissu(0);
  };

  return (
    <div className={`space-y-8 pb-10 ${isAr ? 'text-right' : ''}`}>
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 p-8 shadow-2xl shadow-indigo-100/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className={`relative flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{t('commandes_title', lang)}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">{commandes.length} {t('commandes_count', lang)}</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-500">{t('ca_total', lang)} <span className="text-indigo-600 font-black">{stats.ca.toLocaleString()} MAD</span></span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <button 
              onClick={() => setShowCalc(true)} 
              className="group flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-600 px-6 py-3.5 rounded-2xl hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm active:scale-95"
            >
              <Calculator className="w-4 h-4 transition-transform group-hover:rotate-12" />
              Calculateur
            </button>
            <button 
              onClick={openCreate} 
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300 font-black text-xs uppercase tracking-widest active:scale-95 ring-offset-2 focus:ring-2 focus:ring-slate-900"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Commande
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards - Modern Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
        {[
          { label: "Chiffre d'Affaires", val: stats.ca.toLocaleString(), sub: `${stats.total} commandes`, icon: <TrendingUp />, color: "indigo" },
          { label: "En Production", val: stats.enCours, sub: "en cours", icon: <Package />, color: "blue" },
          { label: "Livrées", val: stats.livre, sub: "commandes livrées", icon: <Truck />, color: "emerald" },
          { label: "Retard Critique", val: stats.urgent, sub: "délai dépassé", icon: <AlertTriangle />, color: "rose", urgent: stats.urgent > 0 }
        ].map((kpi, i) => (
          <div key={i} className={`group relative bg-white p-6 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-${kpi.color}-100/50 ${
            kpi.urgent ? 'border-rose-100 bg-rose-50/10' : 'border-slate-50'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                kpi.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                kpi.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                'bg-rose-50 text-rose-600'
              }`}>
                {kpi.icon}
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                kpi.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                kpi.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                kpi.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                KPI {i+1}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{kpi.val}</span>
                {kpi.color === 'indigo' && <span className="text-[10px] font-bold text-slate-400">MAD</span>}
              </div>
              <p className={`text-[11px] font-black mt-2 uppercase tracking-tight ${kpi.urgent ? 'text-rose-600' : 'text-slate-600'}`}>
                {kpi.urgent && <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-1" />}
                {kpi.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une commande, un client ou un modèle..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-500 transition-all outline-none" 
          />
        </div>
        
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-[1.5rem] w-full lg:w-auto overflow-x-auto no-scrollbar">
          {[
            { key: 'all', label: t('all', lang) }, 
            { key: 'en_cours', label: t('status_en_cours', lang) }, 
            { key: 'terminé', label: t('status_terminee', lang) }, 
            { key: 'livré', label: t('status_livree', lang) }
          ].map(f => (
            <button 
              key={f.key} 
              onClick={() => setFilterStatut(f.key as any)} 
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                filterStatut === f.key 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Table Container */}
      <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-indigo-100/30 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900/5 border-b border-slate-100">
                <th className="w-10 px-2 py-3" />
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Réf</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Client / Modèle / Tissu</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Qté / Valeur</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Suivi Production</th>
                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Livraison</th>
                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Statut</th>
                <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const cmdOrdres = ordres.filter(o => o.commandeId === c.id);
                const cmdPointages = pointages.filter(p => p.commandeId === c.id);
                const cmdFacture = factures.find(f => f.commandeId === c.id);
                const isExpanded = expandedId === c.id;
                const totalPts = cmdPointages.reduce((a, p) => a + p.piecesCompletees, 0);
                const totalRebut = cmdPointages.reduce((a, p) => a + p.rebut, 0);
                const progress = c.quantite > 0 ? Math.min(100, Math.round(((totalPts - totalRebut) / c.quantite) * 100)) : 0;
                const urgent = isUrgent(c);
                const isLivre = c.statut === 'livré';

                return (
                  <>
                    <tr 
                      key={c.id} 
                      onClick={() => setExpandedId(prev => prev === c.id ? null : c.id)} 
                      className={`group cursor-pointer transition-all duration-200 border-b border-slate-100 hover:bg-slate-50/80 ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                    >
                      <td className="px-2 py-4 text-center">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>
                      </td>
                      
                      {/* ID & Type */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{c.reference}</span>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${urgent ? 'bg-red-50' : 'bg-slate-50'}`}>
                            <ShoppingCart className={`w-3 h-3 ${urgent ? 'text-red-500' : 'text-slate-400'}`} />
                          </div>
                        </div>
                      </td>

                      {/* Client & Detail Info - Combined to save space */}
                      <td className="px-4 py-4 min-w-[180px]">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{c.client}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.modele}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] font-black text-indigo-500 uppercase">{c.tissu}</span>
                        </div>
                      </td>

                      {/* Quantity & Value */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-slate-900">{c.quantite}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">pcs</span>
                          </div>
                          <p className="text-[10px] font-black text-emerald-600">{(c.quantite * c.prix).toLocaleString()} MAD</p>
                        </div>
                      </td>

                      {/* Production Tracking - Pro Integrated Line */}
                      <td className="px-4 py-4 min-w-[240px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isLivre ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {isLivre ? 'Livraison Terminée' : `Phase: ${PHASE_LABELS[c.phase]}`}
                            </span>
                            <span className="text-[10px] font-black text-slate-900">{progress}%</span>
                          </div>
                          <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 rounded-full ${isLivre ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                              style={{ width: `${progress}%` }} 
                            />
                            {/* Marker dots for phases */}
                            <div className="absolute inset-0 flex justify-between px-1">
                              {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-1 bg-white/30 rounded-full self-center" />)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Delivery Date */}
                      <td className="px-4 py-4 text-center">
                        <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-2xl border ${urgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Livraison</span>
                          <span className={`text-[10px] font-black ${urgent ? 'text-red-600' : 'text-slate-700'}`}>{fmtDate(c.dateLivraisonPrevue)}</span>
                        </div>
                      </td>

                      {/* Professional Status Badge */}
                      <td className="px-4 py-4 text-center">
                        {(() => {
                          const ds = getDynamicStatus(c);
                          return (
                            <div className={`px-3 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 ${ds.color} bg-white shadow-sm`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{ds.label}</span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Pro Actions - Clean & Sleek */}
                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {c.phase === 'coupe' && (
                            <button
                              onClick={() => handleSendToCutter(c)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${ordres.some(o => o.commandeId === c.id)
                                ? 'bg-slate-50 text-slate-300'
                                : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white shadow-sm hover:shadow-orange-200'
                              }`}
                            >
                              <Scissors className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openEdit(c)} className="w-9 h-9 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all flex items-center justify-center hover:shadow-lg hover:shadow-indigo-100">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(c.id)} className="w-9 h-9 bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all flex items-center justify-center hover:shadow-lg hover:shadow-rose-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${c.id}-rel`} className="bg-slate-50/30 border-b border-indigo-100/50">
                        <td colSpan={12} className="px-2 py-4">
                          {/* Expanded Details Grid - Narrower and tighter */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto animate-in slide-in-from-top-2 duration-200">
                            <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500"><Scissors className="w-3.5 h-3.5" /></div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Coupe</span>
                              </div>
                              <div className="space-y-1.5">
                                {cmdOrdres.map(o => (
                                  <div key={o.id} className="p-2 bg-orange-50/30 rounded-xl border border-orange-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-orange-700 truncate mr-2">{o.tissu}</span>
                                    <span className="bg-white px-1.5 py-0.5 rounded-md text-[9px] font-black text-orange-600 border border-orange-200">{o.quantite}p</span>
                                  </div>
                                ))}
                                {cmdOrdres.length === 0 && <p className="text-[9px] text-slate-400 font-bold italic">Aucun ordre...</p>}
                              </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500"><ClipboardCheck className="w-3.5 h-3.5" /></div>
                                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Main d'œuvre</span>
                                </div>
                                <button onClick={() => openPointage(c)} className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs shadow-lg shadow-blue-100">+</button>
                              </div>
                              <div className="mb-3">
                                <div className="flex justify-between items-end mb-1">
                                  <span className="text-[8px] font-black text-slate-400 uppercase">Avancement</span>
                                  <span className="text-[10px] font-black text-blue-600">{progress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                {cmdPointages.slice(-2).reverse().map((p, i) => (
                                  <div key={i} className="flex justify-between text-[9px] font-bold text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                    <span className="truncate">{empName(p.employeId)}</span>
                                    <span className="text-blue-600">+{p.piecesCompletees}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500"><Receipt className="w-3.5 h-3.5" /></div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Facture</span>
                              </div>
                              {cmdFacture ? (
                                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                                  <div className="flex justify-between items-start">
                                    <p className="text-[11px] font-black text-emerald-700">{cmdFacture.numero}</p>
                                    <p className="text-[11px] font-black text-slate-900">{cmdFacture.montant.toLocaleString()} MAD</p>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => createFacture(c)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
                                  Éditer Facture
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK WARNING MODAL */}
      {showStockWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-red-100 animate-in fade-in zoom-in duration-300">
            <div className="bg-red-50 p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-200">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Attention : Stock Insuffisant</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Vous avez besoin de <span className="text-red-600 font-bold">{showStockWarning.needed.toFixed(1)}m</span> de tissu,
                mais il ne reste que <span className="text-slate-800 font-bold">{showStockWarning.available.toFixed(1)}m</span> en stock.
              </p>
            </div>

            <div className="p-8 flex flex-col gap-3">
              <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100 mb-2">
                <input
                  type="checkbox"
                  checked={stockConfirmChecked}
                  onChange={(e) => setStockConfirmChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs font-bold text-slate-600 leading-tight">
                  Je confirme que je vais fournir la quantité manquante ({(showStockWarning.needed - showStockWarning.available).toFixed(1)}m) pour cette commande.
                </span>
              </label>

              <button
                disabled={!stockConfirmChecked}
                onClick={() => {
                  const cmd = showStockWarning.order;
                  setShowStockWarning(null);
                  handleSendToCutter(cmd, true);
                }}
                className={`w-full py-4 rounded-2xl font-black text-sm transition shadow-lg ${stockConfirmChecked
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
              >
                CONTINUER QUAND MÊME
              </button>
              <button
                onClick={() => setShowStockWarning(null)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition"
              >
                ANNULER ET VÉRIFIER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATEUR MODAL */}
      {showCalc && (() => {
        const matieres = calcConsommation * calcPrixTissu * calcQty;
        const mo = calcMainOeuvre * calcQty;
        const charges = calcCharges * calcQty;
        const autres = calcAutres * calcQty;
        const coutRevient = matieres + mo + charges + autres;
        const marge = coutRevient * (calcMarge / 100);
        const prixVente = coutRevient + marge;
        const prixUnitaire = calcQty > 0 ? prixVente / calcQty : 0;
        const selectedTissu = tissus.find(t => t.id === calcTissuId);
        const metrageNecessaire = calcConsommation * calcQty;
        const stockSuffisant = selectedTissu ? selectedTissu.metrage >= metrageNecessaire : true;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3"><Calculator className="w-6 h-6 text-green-600" /> Calculateur de Coût Automatique</h2>
                <button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Fiche Technique</label><select value={calcFicheId} onChange={e => handleFicheChange(e.target.value)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none"><option value="">Sélectionner une fiche</option>{fiches.map(f => <option key={f.id} value={f.id}>{f.modele} — {f.client}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Consommation</label><input type="number" step="0.01" value={calcConsommation || ''} onChange={e => setCalcConsommation(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Quantité</label><input type="number" min="1" value={calcQty || ''} onChange={e => setCalcQty(parseInt(e.target.value) || 1)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
                  </div>
                  <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Tissu du Stock</label><select value={calcTissuId} onChange={e => handleTissuChange(e.target.value)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none"><option value="">— Choisir un rouleau —</option>{tissus.map(t => <option key={t.id} value={t.id}>{t.couleur} · {t.type} — {t.metrage}m dispo</option>)}</select></div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Prix tissu (MAD/mètre)</label>
                      {calcTissuId && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ {t('auto_from_stock', lang)}</span>}
                    </div>
                    <input type="number" min="0" value={calcPrixTissu || ''} onChange={e => setCalcPrixTissu(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none ${selectedTissu ? 'border-green-300 bg-green-50/50' : 'border-slate-200'}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Main d'œuvre</label><input type="number" value={calcMainOeuvre || ''} onChange={e => setCalcMainOeuvre(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Charges fixes</label><input type="number" value={calcCharges || ''} onChange={e => setCalcCharges(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Autres</label><input type="number" value={calcAutres || ''} onChange={e => setCalcAutres(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Marge (%)</label><input type="number" value={calcMarge || ''} onChange={e => setCalcMarge(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[2.5rem] p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase text-center mb-6">Résultat Prévisionnel</h3>
                    <div className="flex justify-between text-xs font-bold uppercase border-b border-slate-200 pb-3"><span>Matières:</span><span>{matieres.toFixed(2)} DH</span></div>
                    <div className="flex justify-between text-xs font-bold uppercase border-b border-slate-200 pb-3"><span>Main d'œuvre:</span><span>{mo.toFixed(2)} DH</span></div>
                    <div className="flex justify-between text-xs font-bold uppercase border-b border-slate-200 pb-3"><span>Charges fixes:</span><span>{charges.toFixed(2)} DH</span></div>
                    <div className="flex justify-between text-sm font-black text-indigo-700 pt-2 uppercase"><span>Coût de revient:</span><span>{coutRevient.toFixed(2)} DH</span></div>
                  </div>
                  <div className="bg-green-600 text-white rounded-[2rem] p-8 shadow-2xl">
                    <div className="flex justify-between items-end mb-4"><span className="text-[10px] font-black uppercase opacity-80">Prix de vente total:</span><span className="text-4xl font-black">{prixVente.toFixed(2)} DH</span></div>
                    <div className="pt-4 border-t border-white/20 flex justify-between items-center"><span className="text-[10px] font-black uppercase opacity-80">Prix unitaire:</span><span className="font-black text-lg">{prixUnitaire.toFixed(2)} DH / pc</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-4">
              {editId ? t('edit', lang) : t('new', lang)} {t('commandes', lang)}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('reference', lang)} *</label><input value={form.reference || ''} onChange={e => setForm({ ...form, reference: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('client', lang)} *</label><select value={form.client || ''} onChange={e => setForm({ ...form, client: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none"><option value="">— {t('search', lang)} —</option>{users.filter(u => u.role === 'client').map(u => <option key={u.id} value={u.nom}>{u.nom}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('modele_label', lang)}</label><select value={form.modele || ''} onChange={e => { const fiche = fiches.find(f => f.modele === e.target.value); setForm({ ...form, modele: e.target.value, tissu: fiche?.type || form.tissu }); }} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none"><option value="">— {t('search', lang)} —</option>{fiches.map(f => <option key={f.id} value={f.modele}>{f.modele}</option>)}</select></div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('tissu_required_stock', lang)}</label>
                <select
                  value={form.tissu || ''}
                  onChange={e => {
                    const val = e.target.value;
                    const selectedRoll = tissus.find(t => `${t.type} ${t.couleur}` === val);
                    setForm({ 
                      ...form, 
                      tissu: val, 
                      tissuPrix: selectedRoll ? selectedRoll.prixMetre : form.tissuPrix 
                    });
                  }}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                >
                  <option value="">{t('choose_fabric_stock', lang)}</option>
                  {tissus.filter(t => t.metrage > 0).map(t => (
                    <option key={t.id} value={`${t.type} ${t.couleur}`}>
                      {t.type} {t.couleur} ({t.metrage}m dispo)
                    </option>
                  ))}
                  <option value="Autre">{t('fabric_not_in_stock', lang)}</option>
                </select>
                
                {/* Tissu Sourcing Toggle */}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tissuSourcing: 'maison' })}
                    className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.tissuSourcing === 'maison' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400'}`}
                  >
                    Tissu Maison
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tissuSourcing: 'client' })}
                    className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.tissuSourcing === 'client' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white border-slate-200 text-slate-400 hover:border-amber-400'}`}
                  >
                    Tissu Client
                  </button>
                </div>
                {/* Stock Linkage: Real-time Indicator */}
                {form.modele && form.tissu && form.quantite > 0 && (() => {
                  const fiche = fiches.find(f => f.modele === form.modele);
                  const selectedRoll = tissus.find(t => `${t.type} ${t.couleur}` === form.tissu);
                  const conso = fiche?.tissuConsommation || 0;
                  const requis = Number((conso * (form.quantite || 0)).toFixed(2));

                  if (!fiche) return <p className="text-[10px] text-amber-500 font-bold mt-1">⚠️ Fiche technique non trouvée pour calcul</p>;
                  if (!selectedRoll) return null;

                  const isOk = selectedRoll.metrage >= requis;
                  return (
                    <div className={`mt-2 p-3 rounded-xl border flex items-center justify-between ${isOk ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isOk ? 'Stock Disponible' : 'Stock Insuffisant'}
                        </p>
                        <p className="text-xs font-bold text-slate-700">Besoin: {requis}m | Dispo: {selectedRoll.metrage}m</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!isOk && <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">-{(requis - selectedRoll.metrage).toFixed(1)}m</span>}
                        {selectedRoll.fournisseur && (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Fournisseur</p>
                              <p className="text-[10px] font-black text-indigo-600 leading-none">{selectedRoll.fournisseur}</p>
                            </div>
                            {selectedRoll.fournisseurTel && (
                              <a
                                href={`https://wa.me/${selectedRoll.fournisseurTel.replace(/\s+/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Appeler ${selectedRoll.fournisseur}`}
                                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition shadow-sm"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('quantite', lang)} (PCS)</label><input type="number" value={form.quantite || 0} onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('price_u', lang)} (MAD)</label><input type="number" value={form.prix || 0} onChange={e => setForm({ ...form, prix: parseFloat(e.target.value) || 0 })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
              <div><label className="block text-xs font-black text-amber-600 uppercase mb-2 ml-1">Avance (التسبيق)</label><input type="number" value={form.avance || 0} onChange={e => setForm({ ...form, avance: parseFloat(e.target.value) || 0 })} className="w-full px-5 py-4 border border-amber-200 bg-amber-50/30 rounded-2xl text-sm font-black text-emerald-700 outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-black text-slate-400 uppercase">Prix Tissu (DH/m)</label>
                  {form.tissu && tissus.find(t => `${t.type} ${t.couleur}` === form.tissu) && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ AUTO</span>
                  )}
                </div>
                <input type="number" step="0.01" value={form.tissuPrix || 0} onChange={e => setForm({ ...form, tissuPrix: parseFloat(e.target.value) || 0 })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none bg-slate-50/50" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Main d'œuvre (PCS)</label>
                <input type="number" step="0.01" value={form.coutMainOeuvre || 0} onChange={e => setForm({ ...form, coutMainOeuvre: parseFloat(e.target.value) || 0 })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none bg-slate-50/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('date_emission', lang)}</label><input type="date" value={form.dateCommande || ''} onChange={e => setForm({ ...form, dateCommande: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('date_echeance', lang)}</label><input type="date" value={form.dateLivraisonPrevue || ''} onChange={e => setForm({ ...form, dateLivraisonPrevue: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('phase', lang)}</label><select value={form.phase || 'coupe'} onChange={e => setForm({ ...form, phase: e.target.value as Phase })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none">{PHASE_ORDER.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}</select></div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{t('statut', lang)} (Auto)</label>
                <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  {(() => {
                    const ds = getDynamicStatus({ ...form } as Commande);
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${ds.color.split(' ')[1]}`}>
                        <span className="text-xs">{ds.icon}</span>
                        {ds.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
            {(() => {
              const fiche = fiches.find(f => f.modele === form.modele);
              const matieres = (fiche?.tissuConsommation || 0) * (form.tissuPrix || 0) * (form.quantite || 0);
              const mo = (form.coutMainOeuvre || 0) * (form.quantite || 0);
              const coutRevient = matieres + mo;
              const totalVente = (form.quantite || 0) * (form.prix || 0);

              return (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-inner">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Aperçu Financier</span>
                    <span className="text-indigo-600">Détails de la Commande</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Coût Matière</span>
                      <span className="text-sm font-black text-slate-700">{(form.tissuSourcing === 'maison' ? matieres : 0).toFixed(2)} DH</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Main d'œuvre</span>
                      <span className="text-sm font-black text-slate-700">{mo.toFixed(2)} DH</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Reste à payer</span>
                      <span className="text-sm font-black text-rose-600">
                        {(totalVente - (form.avance || 0)).toFixed(2)} DH
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 bg-indigo-50 rounded-xl mt-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase">Total: {totalVente.toFixed(2)} DH</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Avance: {(form.avance || 0).toFixed(2)} DH</span>
                  </div>
                </div>
              );
            })()}
            <div className="flex justify-end gap-3 pt-6"><button onClick={() => setShowModal(false)} className="px-6 py-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">{t('cancel', lang)}</button><button onClick={save} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest">{t('save', lang)}</button></div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div><h3 className="text-lg font-bold text-slate-800 mb-1">Supprimer cette commande ?</h3><p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p><div className="flex gap-3"><button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button><button onClick={() => remove(confirmDelete)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Supprimer</button></div></div>
        </div>
      )}

      {/* Pointage Modal */}
      {showPointageModal && selectedCmd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Nouveau Pointage</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedCmd.reference}</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Employé (Ouvrier)</label>
                <select
                  value={ptForm.employeId || ''}
                  onChange={e => setPtForm({ ...ptForm, employeId: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                >
                  <option value="">— {employes.length > 0 ? 'Sélectionner l\'ouvrier' : 'Aucun ouvrier trouvé'} —</option>
                  {employes.filter(e => e.statut === 'actif' || !e.statut).map(e => (
                    <option key={e.id} value={e.id}>
                      {e.prenom} {e.nom} — {e.poste}
                    </option>
                  ))}
                </select>
                {employes.length === 0 && (
                  <p className="text-[9px] text-rose-500 font-bold mt-2 ml-1 italic tracking-tight">
                    * {isAr ? 'يجب إضافة العمال في صفحة Suivi RH أولاً' : 'Ajoutez des employés dans Suivi RH pour les voir ici'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-indigo-600">Pièces Réussies (Bonnes)</label>
                <input
                  type="number"
                  value={ptForm.piecesCompletees || ''}
                  onChange={e => setPtForm({ ...ptForm, piecesCompletees: parseInt(e.target.value) || 0 })}
                  className="w-full px-5 py-4 border-2 border-indigo-50 rounded-2xl text-sm font-bold outline-none bg-indigo-50/30 focus:bg-white focus:border-indigo-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-red-500">Perdues (Rebut)</label>
                  <input
                    type="number"
                    value={ptForm.rebut || ''}
                    onChange={e => setPtForm({ ...ptForm, rebut: parseInt(e.target.value) || 0 })}
                    className="w-full px-5 py-4 border-2 border-red-50 rounded-2xl text-sm font-bold outline-none bg-red-50/30 focus:bg-white focus:border-red-500 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-amber-500">À Refaire (Retouche)</label>
                  <input
                    type="number"
                    value={ptForm.retouche || ''}
                    onChange={e => setPtForm({ ...ptForm, retouche: parseInt(e.target.value) || 0 })}
                    className="w-full px-5 py-4 border-2 border-amber-50 rounded-2xl text-sm font-bold outline-none bg-amber-50/30 focus:bg-white focus:border-amber-500 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Phase</label>
                  <select
                    value={ptForm.phase || ''}
                    onChange={e => setPtForm({ ...ptForm, phase: e.target.value as Phase })}
                    className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                  >
                    {PHASE_ORDER.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Date</label>
                  <input
                    type="date"
                    value={ptForm.date || ''}
                    onChange={e => setPtForm({ ...ptForm, date: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button onClick={() => setShowPointageModal(false)} className="px-6 py-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Annuler</button>
              <button
                onClick={savePointage}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facture Preview Modal - PRO */}
      {showFacturePreview && selectedFacture && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Aperçu de la Facture</h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFacturePreview(false)} className="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">Annuler</button>
                <button
                  onClick={handleConfirmFacture}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest"
                >
                  <Package className="w-4 h-4" /> Valider & Imprimer / PDF
                </button>
              </div>
            </div>

            <div className="p-12 bg-slate-50/50">
              <InvoicePRO
                id={`facture-pro-view-${selectedFacture.id}`}
                facture={selectedFacture}
                commande={commandes.find(c => c.id === selectedFacture.commandeId)}
                company={company}
              />
            </div>
          </div>
        </div>
      )}
      {/* SUCCESS BOX */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top duration-500 fill-mode-both">
          <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-200/50 border-2 border-emerald-100 p-2 pl-6 pr-6 flex items-center gap-4 min-w-[300px]">
            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-none mb-1">{showSuccess.message}</p>
              {showSuccess.sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{showSuccess.sub}</p>}
            </div>
            <button 
              onClick={() => setShowSuccess(null)}
              className="ml-4 w-8 h-8 hover:bg-slate-50 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
