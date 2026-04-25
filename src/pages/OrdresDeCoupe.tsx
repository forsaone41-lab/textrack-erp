import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, ShoppingCart, FileText, Image as ImageIcon, Download, Ruler, ChevronRight, Calculator } from 'lucide-react';
import { OrdreDeCoupe, StockTissu, FicheTechnique, Commande, loadData, saveRecord, deleteRecord, genId } from '../types';
import { printFicheTechnique } from '../utils/print';

export default function OrdresDeCoupe() {
  const [ordres, setOrdres] = useState<OrdreDeCoupe[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OrdreDeCoupe>>({});
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [viewMesuresFiche, setViewMesuresFiche] = useState<FicheTechnique | null>(null);
  const [showCalc, setShowCalc] = useState(false);

  // Calculator State (Replicated from FichesTechniques)
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
    refreshData();
  }, []);

  const refreshData = () => {
    Promise.all([
      loadData<OrdreDeCoupe>('ordres'),
      loadData<StockTissu>('tissus'),
      loadData<FicheTechnique>('fiches'),
      loadData<Commande>('commandes')
    ]).then(([ords, tiss, fchs, cmds]) => {
      setOrdres(ords);
      setTissus(tiss);
      setFiches(fchs);
      setCommandes(cmds);
    });
  };

  const pendingCommands = commandes.filter(c => 
    c.phase === 'coupe' && 
    !ordres.some(o => o.commandeId === c.id) &&
    c.statut !== 'livré'
  );

  const filtered = ordres.filter(o => {
    const matchSearch = o.modele.toLowerCase().includes(search.toLowerCase()) || o.tissu.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || o.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const statutBadge = (s: string) => {
    const map: Record<string, string> = {
      planifié: 'bg-slate-100 text-slate-600',
      en_cours: 'bg-blue-100 text-blue-700',
      terminé: 'bg-green-100 text-green-700',
    };
    return map[s] || 'bg-slate-100 text-slate-600';
  };

  function downloadFile(data: string, filename: string) {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleModeleChange = (val: string) => {
    const fiche = fiches.find(f => f.modele === val);
    const conso = fiche?.tissuConsommation || 0;
    const qty = form.quantite || 0;
    setForm({ ...form, modele: val, metrage: Number((conso * qty).toFixed(2)) });
  };

  const handleQtyChange = (val: number) => {
    const fiche = fiches.find(f => f.modele === form.modele);
    const conso = fiche?.tissuConsommation || 0;
    setForm({ ...form, quantite: val, metrage: Number((conso * val).toFixed(2)) });
  };

  const handleImportCommand = (c: Commande) => {
    const fiche = fiches.find(f => f.modele === c.modele);
    const conso = fiche?.tissuConsommation || 0;
    setEditId(null);
    setForm({
      id: genId(),
      commandeId: c.id,
      modele: c.modele,
      quantite: c.quantite,
      tissu: fiche?.type || '',
      couleur: 'À définir',
      metrage: Number((conso * c.quantite).toFixed(2)),
      statut: 'planifié',
      dateCoupe: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  async function save() {
    if (!form.modele || !form.tissu) return;
    const isNew = !editId;
    const oId = editId || genId();
    const ordreData = { id: oId, ...form } as OrdreDeCoupe;
    const updated = isNew ? [...ordres, ordreData] : ordres.map(o => o.id === editId ? ordreData : o);
    setOrdres(updated);
    setShowModal(false);
    await saveRecord('ordres', ordreData);
  }

  async function remove(id: string) {
    setOrdres(ordres.filter(o => o.id !== id));
    await deleteRecord('ordres', id);
  }

  // Calculator Logic
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

  const AssetsBlock = ({ fiche }: { fiche: FicheTechnique }) => (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">ASSETS & DOCUMENTS</p>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={!fiche.patronagePhoto}
            onClick={() => downloadFile(fiche.patronagePhoto!, fiche.patronageFileName || `Patron_${fiche.modele}`)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${
              fiche.patronagePhoto 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200' 
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PATRON
          </button>
          <button 
            onClick={() => printFicheTechnique(fiche)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
          >
            <Download className="w-3.5 h-3.5" /> FICHE PDF
          </button>
        </div>
        <button 
          onClick={() => setViewMesuresFiche(fiche)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-50 hover:border-indigo-500 transition-all shadow-sm"
        >
          <Ruler className="w-3.5 h-3.5" /> VOIR LES MESURES (TAILLES)
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ordres de Coupe</h1>
          <p className="text-slate-500 text-sm">Gestion des bons de coupe et patronage</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCalc(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm">
            <Calculator className="w-4 h-4" /> Calculateur de Prix
          </button>
          <button onClick={() => { setEditId(null); setForm({ statut: 'planifié', dateCoupe: new Date().toISOString().split('T')[0] }); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" /> Nouvel Ordre
          </button>
        </div>
      </div>

      {pendingCommands.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center gap-2 mb-4"><ShoppingCart className="w-5 h-5" /><h2 className="text-sm font-bold uppercase tracking-wider">File d'attente production</h2></div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {pendingCommands.map(c => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === c.modele.toLowerCase());
              return (
                <div key={c.id} className="min-w-[340px] bg-white border border-slate-200 rounded-3xl p-5 flex flex-col shadow-2xl text-slate-800">
                  <div className="flex gap-4 mb-5">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                      {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-black truncate">{c.modele}</h3>
                      </div>
                      <p className="text-xs font-bold text-indigo-600 mb-2">{c.client}</p>
                      <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg w-fit">
                        <Scissors className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-black uppercase">{c.quantite} pièces</span>
                      </div>
                    </div>
                  </div>
                  {fiche && <div className="mb-5 border-t border-slate-100 pt-5"><AssetsBlock fiche={fiche} /></div>}
                  <button onClick={() => handleImportCommand(c)} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg tracking-widest uppercase">LANCER LA COUPE <ChevronRight className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Ordres</p><p className="text-2xl font-black text-slate-800">{filtered.length}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pièces à couper</p><p className="text-2xl font-black text-indigo-600">{filtered.reduce((a,o)=>a+o.quantite,0).toLocaleString()}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tissu nécessaire</p><p className="text-2xl font-black text-purple-600">{filtered.reduce((a,o)=>a+o.metrage,0).toLocaleString()} m</p></div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"><option value="all">Tous les statuts</option><option value="planifié">Planifié</option><option value="en_cours">En cours</option><option value="terminé">Terminé</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-5">Ordre / Modèle</th>
                <th className="px-6 py-5 min-w-[320px]">Assets & Documents</th>
                <th className="px-6 py-5 text-center">Quantité</th>
                <th className="px-6 py-5 text-center">Statut</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(o => {
                const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-6"><div className="flex items-center gap-5"><div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">{fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>}</div><div><p className="text-sm font-black text-slate-800 mb-1 uppercase tracking-tight">{o.modele}</p><p className="text-xs font-bold text-indigo-600">{o.client}</p><p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{o.tissu} · {o.couleur}</p></div></div></td>
                    <td className="px-6 py-6">{fiche ? <AssetsBlock fiche={fiche} /> : <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Fiche manquante</div>}</td>
                    <td className="px-6 py-6 text-center"><p className="text-base font-black text-slate-900 tracking-tight">{o.quantite} <span className="text-[10px] font-bold text-slate-400 text-xs">PCS</span></p><p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{o.metrage} m</p></td>
                    <td className="px-6 py-6 text-center"><span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statutBadge(o.statut)}`}>{o.statut}</span></td>
                    <td className="px-6 py-6 text-center"><div className="flex justify-center gap-1"><button onClick={() => { setEditId(o.id); setForm(o); setShowModal(true); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button><button onClick={() => remove(o.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CALCULATEUR MODAL (Replicated UI) */}
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
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3"><Calculator className="w-6 h-6 text-green-600" /> Calculateur de Coût Automatique</h2>
                <button onClick={() => setShowCalc(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-md transition text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fiche Technique</label><select value={calcFicheId} onChange={e => handleFicheChange(e.target.value)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all"><option value="">Sélectionner une fiche</option>{fiches.map(f => <option key={f.id} value={f.id}>{f.modele} — {f.client}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Consommation (m/pc)</label><input type="number" step="0.01" value={calcConsommation || ''} onChange={e => setCalcConsommation(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Quantité</label><input type="number" min="1" value={calcQty || ''} onChange={e => setCalcQty(parseInt(e.target.value) || 1)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all" /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tissu du Stock</label>
                    <select value={calcTissuId} onChange={e => handleTissuChange(e.target.value)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all"><option value="">— Choisir un rouleau —</option>{tissus.filter(t => t.metrage > 0).map(t => <option key={t.id} value={t.id}>{t.couleur} · {t.type} — {t.metrage}m dispo · {t.prixMetre} MAD/m</option>)}</select>
                    {selectedTissu && (
                      <div className={`mt-3 rounded-2xl p-4 border transition-all ${stockSuffisant ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between mb-2"><span className="font-black text-slate-700 text-xs uppercase tracking-tight">{selectedTissu.couleur} — {selectedTissu.type}</span><span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${stockSuffisant ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>{stockSuffisant ? '✓ Stock OK' : '⚠ Stock insuffisant'}</span></div>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><span>Disponible: {selectedTissu.metrage} m</span><span>Nécessaire: {metrageNecessaire.toFixed(1)} m</span></div>
                      </div>
                    )}
                  </div>
                  <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Prix tissu (MAD/m)</label><input type="number" min="0" value={calcPrixTissu || ''} onChange={e => setCalcPrixTissu(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-green-50 outline-none transition-all bg-green-50/30 text-green-700" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Main d'œuvre (pc)</label><input type="number" min="0" value={calcMainOeuvre || ''} onChange={e => setCalcMainOeuvre(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Charges fixes (pc)</label><input type="number" min="0" value={calcCharges || ''} onChange={e => setCalcCharges(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Autres (pc)</label><input type="number" min="0" value={calcAutres || ''} onChange={e => setCalcAutres(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Marge (%)</label><input type="number" min="0" value={calcMarge || ''} onChange={e => setCalcMarge(parseFloat(e.target.value) || 0)} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none transition-all" /></div>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-[2.5rem] p-10 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Résultat Prévisionnel</h3>
                    {[
                      { label: 'Matières premières', value: matieres },
                      { label: "Main d'œuvre", value: mo },
                      { label: 'Charges fixes', value: charges },
                      { label: 'Autres coûts', value: autres },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-3">
                        <span className="text-slate-400">{row.label}:</span>
                        <span className="text-slate-700">{row.value.toFixed(2)} DH</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-black text-indigo-700 pt-2 uppercase"><span>Coût de revient total:</span><span>{coutRevient.toFixed(2)} DH</span></div>
                    <div className="flex justify-between text-sm font-black text-green-600 uppercase"><span>Marge bénéficiaire:</span><span>{marge.toFixed(2)} DH</span></div>
                  </div>
                  <div className="bg-green-600 text-white rounded-[2rem] p-8 shadow-2xl shadow-green-200 animate-pulse-subtle">
                    <div className="flex justify-between items-end mb-4"><span className="text-[10px] font-black uppercase tracking-widest opacity-80">Prix de vente total:</span><span className="text-4xl font-black leading-none">{prixVente.toFixed(2)} <span className="text-base font-bold">DH</span></span></div>
                    <div className="pt-4 border-t border-white/20 flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest opacity-80">Prix unitaire conseillé:</span><span className="font-black text-lg">{prixUnitaire.toFixed(2)} DH / pc</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Ordre Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-10 space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-4">{editId ? 'Modifier' : 'Lancer'} l'Ordre</h2>
            <div className="space-y-4">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Modèle *</label><input value={form.modele || ''} onChange={e => handleModeleChange(e.target.value)} list="modeles-list" className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tissu</label><input value={form.tissu || ''} onChange={e => setForm({ ...form, tissu: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Couleur</label><input value={form.couleur || ''} onChange={e => setForm({ ...form, couleur: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quantité (PCS)</label><input type="number" value={form.quantite || 0} onChange={e => handleQtyChange(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Métrage (M)</label><div className="w-full px-5 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm font-black text-indigo-700 flex justify-between items-center"><span>{form.metrage || 0}</span><span className="opacity-40">M</span></div></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6"><button onClick={() => setShowModal(false)} className="px-6 py-4 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Annuler</button><button onClick={save} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest">Enregistrer l'Ordre</button></div>
          </div>
        </div>
      )}

      {/* Mesures Modal */}
      {viewMesuresFiche && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5"><div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100"><Ruler className="w-7 h-7 text-white" /></div><div><h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Tableau des Mesures</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{viewMesuresFiche.modele} <span className="mx-2">·</span> {viewMesuresFiche.client}</p></div></div>
              <button onClick={() => setViewMesuresFiche(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-auto p-10"><div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm"><table className="w-full text-sm border-collapse"><thead><tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-[0.15em]"><th className="px-8 py-5 text-left border-r border-slate-800">Point de Mesure</th>{viewMesuresFiche.tailles.map(t => <th key={t} className="px-6 py-5 text-center border-r border-slate-800 last:border-r-0">{t}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{viewMesuresFiche.mesures.map((m, i) => (<tr key={i} className="hover:bg-indigo-50/30 transition-colors group"><td className="px-8 py-5 font-black text-slate-700 bg-slate-50 group-hover:bg-indigo-50/50 border-r border-slate-200 transition-colors uppercase tracking-tight">{m.nom}</td>{viewMesuresFiche.tailles.map(t => (<td key={t} className="px-6 py-5 text-center font-bold text-indigo-600 border-r border-slate-100 last:border-r-0 group-hover:bg-white transition-colors">{m.valeurs[t] || '—'}</td>))}</tr>))}</tbody></table></div></div>
            <div className="p-8 border-t border-slate-100 flex justify-center bg-slate-50/50"><button onClick={() => setViewMesuresFiche(null)} className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Fermer le Tableau</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
