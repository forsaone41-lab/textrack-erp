import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, ShoppingCart, Calculator, ChevronDown,
  ChevronRight, Scissors, ClipboardCheck, Receipt, Link, X, TrendingUp,
  Package, Truck, AlertCircle,
} from 'lucide-react';
import {
  Commande, FicheTechnique, OrdreDeCoupe, PointageEntry, Facture, Employe, User,
  loadData, saveRecord, deleteRecord, genId, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, Phase,
} from '../types';

export default function Commandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [fiches, setFiches]       = useState<FicheTechnique[]>([]);
  const [ordres, setOrdres]       = useState<OrdreDeCoupe[]>([]);
  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [factures, setFactures]   = useState<Facture[]>([]);
  const [employes, setEmployes]   = useState<Employe[]>([]);
  const [users, setUsers]         = useState<User[]>([]);

  const [search, setSearch]             = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [editId, setEditId]             = useState<string | null>(null);
  const [form, setForm]                 = useState<Partial<Commande>>({});
  const [showCalc, setShowCalc]         = useState(false);
  const [calcModele, setCalcModele]     = useState('');
  const [calcQuantite, setCalcQuantite] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<FicheTechnique>('fiches'),
      loadData<OrdreDeCoupe>('ordres'),
      loadData<PointageEntry>('pointages'),
      loadData<Facture>('factures'),
      loadData<Employe>('employes'),
      loadData<User>('users')
    ]).then(([cmds, fchs, ords, pts, facs, emps, usrs]) => {
      setCommandes(cmds);
      setFiches(fchs);
      setOrdres(ords);
      setPointages(pts);
      setFactures(facs);
      setEmployes(emps);
      setUsers(usrs);
    });
  }, []);

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

  const calcResult = (() => {
    const fiche = fiches.find(f => f.id === calcModele || f.modele === calcModele);
    if (fiche && calcQuantite > 0)
      return { modele: fiche.modele, metrage: (fiche.tissuConsommation * calcQuantite).toFixed(1), parPiece: fiche.tissuConsommation };
    return null;
  })();

  function openCreate() {
    setEditId(null);
    const year = new Date().getFullYear();
    const count = commandes.length + 1;
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setForm({
      reference: `CMD-${year}-${String(count).padStart(3, '0')}`,
      client: '', modele: '', quantite: 0, quantiteLivre: 0,
      dateCommande: today,
      dateLivraisonPrevue: due.toISOString().split('T')[0],
      phase: 'coupe', prix: 0, rebut: 0, statut: 'en_cours', suivi: [],
    });
    setShowModal(true);
  }

  function openEdit(c: Commande) {
    setEditId(c.id);
    setForm({ ...c, suivi: [...c.suivi] });
    setShowModal(true);
  }

  async function save() {
    if (!form.reference || !form.client) return;
    const isNew = !editId;
    const cmdId = editId || genId();
    const cmdData = { id: cmdId, ...form } as Commande;

    const updated = isNew
      ? [...commandes, cmdData]
      : commandes.map(c => c.id === editId ? cmdData : c);
      
    setCommandes(updated);
    setShowModal(false);
    
    await saveRecord('commandes', cmdData);
  }

  async function remove(id: string) {
    const updated = commandes.filter(c => c.id !== id);
    setCommandes(updated);
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
      client: c.client,
      montant: c.quantite * c.prix,
      date: today,
      echeance: due.toISOString().split('T')[0],
      statut: 'en_attente',
      commandeId: c.id,
    };
    const updated = [...factures, newFacture];
    setFactures(updated);
    await saveRecord('factures', newFacture);
  }

  const statutBadge = (s: string, urgent = false) => {
    if (urgent) return 'bg-red-100 text-red-700';
    return ({ en_cours: 'bg-blue-100 text-blue-700', terminé: 'bg-violet-100 text-violet-700', livré: 'bg-emerald-100 text-emerald-700' }[s] ?? 'bg-slate-100 text-slate-600');
  };

  const statutLabel = (s: string, urgent = false) => {
    if (urgent) return '⚠ En retard';
    return ({ en_cours: 'En cours', terminé: 'Terminé', livré: 'Livré' }[s] ?? s);
  };

  const ordreStyle = (s: string) => ({ planifié: 'bg-slate-100 text-slate-600', en_cours: 'bg-blue-100 text-blue-700', terminé: 'bg-green-100 text-green-700' }[s] ?? 'bg-slate-100 text-slate-600');
  const factureStyle = (s: string) => ({ payée: 'bg-emerald-100 text-emerald-700', en_attente: 'bg-amber-100 text-amber-700', impayée: 'bg-red-100 text-red-700' }[s] ?? 'bg-slate-100 text-slate-600');

  function fmtDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function daysLeft(d: string) {
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  }

  const FILTERS = [
    { key: 'all', label: 'Toutes' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'terminé', label: 'Terminées' },
    { key: 'livré', label: 'Livrées' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Commandes</h1>
          <p className="text-sm text-slate-500">{commandes.length} commande{commandes.length !== 1 ? 's' : ''} · CA total {stats.ca.toLocaleString()} MAD</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalc(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm font-semibold shadow-sm"
          >
            <Calculator className="w-4 h-4" /> Calcul Tissu
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouvelle Commande
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</p>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.ca.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">MAD · {stats.total} commandes</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">En Cours</p>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.enCours}</p>
          <p className="text-xs text-blue-500 mt-1">commande{stats.enCours !== 1 ? 's' : ''} en production</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Livrées</p>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.livre}</p>
          <p className="text-xs text-emerald-500 mt-1">commande{stats.livre !== 1 ? 's' : ''} livrée{stats.livre !== 1 ? 's' : ''}</p>
        </div>

        <div className={`bg-gradient-to-br rounded-xl border p-5 shadow-sm ${stats.urgent > 0 ? 'from-red-50 to-white border-red-200' : 'from-slate-50 to-white border-slate-200'}`}>
          <div className="flex items-start justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider ${stats.urgent > 0 ? 'text-red-600' : 'text-slate-400'}`}>En Retard</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stats.urgent > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
              <AlertCircle className={`w-4 h-4 ${stats.urgent > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${stats.urgent > 0 ? 'text-red-700' : 'text-slate-500'}`}>{stats.urgent}</p>
          <p className={`text-xs mt-1 ${stats.urgent > 0 ? 'text-red-500' : 'text-slate-400'}`}>délai dépassé</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par référence, client ou modèle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatut(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                filterStatut === f.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-8 px-3 py-3.5" />
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Référence</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Client / Modèle</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Quantité</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Avancement</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Phase</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Valeur</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Livraison</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Statut</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Liens</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const cmdOrdres    = ordres.filter(o => o.commandeId === c.id);
                const cmdPointages = pointages.filter(p => p.commandeId === c.id);
                const cmdFacture   = factures.find(f => f.commandeId === c.id);
                const isExpanded   = expandedId === c.id;
                const totalPts     = cmdPointages.reduce((a, p) => a + p.piecesCompletees, 0);
                const totalRebut   = cmdPointages.reduce((a, p) => a + p.rebut, 0);
                const progress     = c.quantite > 0 ? Math.min(100, Math.round(((totalPts - totalRebut) / c.quantite) * 100)) : 0;
                const urgent       = isUrgent(c);
                const valeur       = c.quantite * c.prix;
                const days         = c.dateLivraisonPrevue ? daysLeft(c.dateLivraisonPrevue) : null;

                return (
                  <>
                    <tr
                      key={c.id}
                      onClick={() => setExpandedId(prev => prev === c.id ? null : c.id)}
                      className={`cursor-pointer transition-colors border-b border-slate-100 ${isExpanded ? 'bg-indigo-50/50' : urgent ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-3 py-3.5 text-center">
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-indigo-500" />
                          : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${urgent ? 'bg-red-100' : 'bg-indigo-50'}`}>
                            <ShoppingCart className={`w-3.5 h-3.5 ${urgent ? 'text-red-500' : 'text-indigo-500'}`} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{c.reference}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-slate-800">{c.client}</p>
                        <p className="text-xs text-slate-400">{c.modele}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm font-semibold text-slate-700">{c.quantite}</span>
                        <span className="text-xs text-slate-400"> pcs</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="min-w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-600">{progress}%</span>
                            <span className="text-[10px] text-slate-400">{totalPts - totalRebut}/{c.quantite}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : progress >= 60 ? 'bg-blue-500' : progress >= 30 ? 'bg-amber-500' : 'bg-slate-400'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${PHASE_COLORS[c.phase]}`}>
                          {PHASE_LABELS[c.phase]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-bold text-slate-800">{valeur.toLocaleString()}</span>
                        <span className="text-xs text-slate-400"> MAD</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {c.dateLivraisonPrevue ? (
                          <div>
                            <p className={`text-xs ${urgent ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>{fmtDate(c.dateLivraisonPrevue)}</p>
                            {days !== null && c.statut === 'en_cours' && (
                              <p className={`text-[10px] mt-0.5 font-medium ${days < 0 ? 'text-red-500' : days <= 5 ? 'text-amber-500' : 'text-slate-400'}`}>
                                {days < 0 ? `${Math.abs(days)}j retard` : days === 0 ? 'Auj.' : `J-${days}`}
                              </p>
                            )}
                          </div>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statutBadge(c.statut, urgent)}`}>
                          {statutLabel(c.statut, urgent)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <span title="Ordres de coupe" className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${cmdOrdres.length > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                            <Scissors className="w-3 h-3" />{cmdOrdres.length}
                          </span>
                          <span title="Pointages" className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${cmdPointages.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                            <ClipboardCheck className="w-3 h-3" />{cmdPointages.length}
                          </span>
                          <span title="Facture" className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${cmdFacture ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            <Receipt className="w-3 h-3" />{cmdFacture ? '1' : '0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {!cmdFacture && (
                            <button
                              onClick={() => createFacture(c)}
                              title="Générer facture"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Relations panel */}
                    {isExpanded && (
                      <tr key={`${c.id}-rel`} className="bg-indigo-50/30 border-b-2 border-indigo-200">
                        <td colSpan={11} className="px-6 py-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Link className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-bold text-indigo-700">Relations — {c.reference}</span>
                            <span className="text-xs text-indigo-400">· {c.client} · {c.modele}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ordres de Coupe */}
                            <div className="bg-white rounded-xl border border-orange-200 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Scissors className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Ordres de Coupe</span>
                                <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-1.5 rounded">{cmdOrdres.length}</span>
                              </div>
                              {cmdOrdres.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-3">Aucun ordre lié</p>
                              ) : (
                                <div className="space-y-2">
                                  {cmdOrdres.map(o => (
                                    <div key={o.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                                      <div>
                                        <p className="text-xs font-semibold text-slate-700">{o.tissu} — {o.couleur}</p>
                                        <p className="text-[10px] text-slate-400">{o.quantite} pcs · {o.metrage}m · {fmtDate(o.dateCoupe)}</p>
                                      </div>
                                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ordreStyle(o.statut)}`}>{o.statut}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Pointages */}
                            <div className="bg-white rounded-xl border border-blue-200 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <ClipboardCheck className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Pointages</span>
                                <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-1.5 rounded">{cmdPointages.length}</span>
                              </div>
                              {cmdPointages.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-3">Aucun pointage</p>
                              ) : (
                                <>
                                  <div className="space-y-2 max-h-36 overflow-y-auto">
                                    {cmdPointages.map(p => (
                                      <div key={p.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                        <div>
                                          <p className="text-xs font-semibold text-slate-700">{empName(p.employeId)}</p>
                                          <p className="text-[10px] text-slate-400">{PHASE_LABELS[p.phase]} · {fmtDate(p.date)}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-bold text-emerald-600">+{p.piecesCompletees}</p>
                                          {p.rebut > 0 && <p className="text-[10px] text-red-500">-{p.rebut}</p>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between text-xs">
                                    <span className="text-emerald-600 font-bold">{totalPts - totalRebut} pcs nettes</span>
                                    {totalRebut > 0 && <span className="text-red-400">{totalRebut} rebut</span>}
                                    <span className="text-indigo-600 font-semibold">{progress}%</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Facture */}
                            <div className="bg-white rounded-xl border border-emerald-200 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Receipt className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Facture</span>
                              </div>
                              {!cmdFacture ? (
                                <div className="text-center py-3">
                                  <p className="text-xs text-slate-400 mb-2">Aucune facture liée</p>
                                  <button
                                    onClick={() => createFacture(c)}
                                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition font-semibold"
                                  >
                                    + Générer Facture
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {[
                                    { label: 'Numéro', value: cmdFacture.numero },
                                    { label: 'Montant', value: `${cmdFacture.montant.toLocaleString()} MAD`, bold: true },
                                    { label: 'Échéance', value: fmtDate(cmdFacture.echeance) },
                                  ].map(row => (
                                    <div key={row.label} className="flex justify-between items-center bg-emerald-50 rounded-lg px-3 py-2">
                                      <span className="text-xs text-slate-500">{row.label}</span>
                                      <span className={`text-xs ${row.bold ? 'font-bold text-emerald-700' : 'font-semibold text-slate-700'}`}>{row.value}</span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center bg-emerald-50 rounded-lg px-3 py-2">
                                    <span className="text-xs text-slate-500">Statut</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${factureStyle(cmdFacture.statut)}`}>
                                      {cmdFacture.statut === 'en_attente' ? 'En attente' : cmdFacture.statut}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {c.suivi.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Historique phases</p>
                                  <div className="space-y-1">
                                    {c.suivi.map((s, i) => (
                                      <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500">
                                        <div className={`w-1.5 h-1.5 rounded-full ${PHASE_COLORS[s.phase]}`} />
                                        <span className="font-semibold">{PHASE_LABELS[s.phase]}</span>
                                        <span className="text-slate-400">{fmtDate(s.date)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
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
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">Aucune commande trouvée</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || filterStatut !== 'all' ? 'Modifiez vos filtres' : 'Créez votre première commande'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Supprimer cette commande ?</h3>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
              <button onClick={() => remove(confirmDelete)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Calcul Tissu Modal */}
      {showCalc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" /> Calcul de Consommation Tissu
              </h2>
              <button onClick={() => setShowCalc(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Modèle / Fiche technique</label>
                <select
                  value={calcModele}
                  onChange={e => setCalcModele(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">— Sélectionner un modèle —</option>
                  {fiches.map(f => <option key={f.id} value={f.id}>{f.modele} ({f.tissuConsommation}m/pièce)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quantité (pièces)</label>
                <input
                  type="number"
                  min="0"
                  value={calcQuantite || ''}
                  onChange={e => setCalcQuantite(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 500"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {calcResult && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Résultat</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Modèle</span>
                    <span className="font-semibold text-slate-700">{calcResult.modele}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Consommation / pièce</span>
                    <span className="font-semibold text-slate-700">{calcResult.parPiece} m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Quantité</span>
                    <span className="font-semibold text-slate-700">{calcQuantite} pcs</span>
                  </div>
                  <div className="border-t border-purple-200 pt-2 flex justify-between">
                    <span className="font-bold text-purple-700">Total tissu nécessaire</span>
                    <span className="text-xl font-black text-purple-800">{calcResult.metrage} m</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowCalc(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier la Commande' : 'Nouvelle Commande'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Référence *</label>
                  <input
                    value={form.reference || ''}
                    onChange={e => setForm({ ...form, reference: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Client *</label>
                  <select
                    value={form.client || ''}
                    onChange={e => setForm({ ...form, client: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">— Sélectionner un client —</option>
                    {users.filter(u => u.role === 'client').map(u => (
                      <option key={u.id} value={u.nom}>{u.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Modèle</label>
                  <select
                    value={form.modele || ''}
                    onChange={e => setForm({ ...form, modele: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">— Sélectionner —</option>
                    {fiches.map(f => <option key={f.id} value={f.modele}>{f.modele}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quantité (pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantite || 0}
                    onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date commande</label>
                  <input
                    type="date"
                    value={form.dateCommande || ''}
                    onChange={e => setForm({ ...form, dateCommande: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date livraison prévue</label>
                  <input
                    type="date"
                    value={form.dateLivraisonPrevue || ''}
                    onChange={e => setForm({ ...form, dateLivraisonPrevue: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix unitaire (MAD)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.prix || 0}
                    onChange={e => setForm({ ...form, prix: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phase actuelle</label>
                  <select
                    value={form.phase || 'coupe'}
                    onChange={e => setForm({ ...form, phase: e.target.value as Phase })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {PHASE_ORDER.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Statut</label>
                  <select
                    value={form.statut || 'en_cours'}
                    onChange={e => setForm({ ...form, statut: e.target.value as Commande['statut'] })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="en_cours">En cours</option>
                    <option value="terminé">Terminé</option>
                    <option value="livré">Livré</option>
                  </select>
                </div>
              </div>

              {(form.quantite ?? 0) > 0 && (form.prix ?? 0) > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">Valeur totale commande</span>
                  <span className="text-lg font-bold text-indigo-700">{((form.quantite ?? 0) * (form.prix ?? 0)).toLocaleString()} MAD</span>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                Annuler
              </button>
              <button onClick={save} className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm">
                {editId ? 'Enregistrer' : 'Créer la Commande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
