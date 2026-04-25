import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, ShoppingCart, FileText, Image as ImageIcon, Download, Ruler, ChevronRight } from 'lucide-react';
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

  // IDENTICAL TO FicheTechnique.tsx
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

  const totalMetrage = filtered.reduce((a, o) => a + o.metrage, 0);
  const totalPieces = filtered.reduce((a, o) => a + o.quantite, 0);

  // EXACT REPLICA OF THE UI BLOCK IN FichesTechniques.tsx
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
        <button onClick={() => { setEditId(null); setForm({ statut: 'planifié', dateCoupe: new Date().toISOString().split('T')[0] }); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
          <Plus className="w-4 h-4" /> Nouvel Ordre
        </button>
      </div>

      {pendingCommands.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center gap-2 mb-4"><ShoppingCart className="w-5 h-5" /><h2 className="text-sm font-bold uppercase tracking-wider">File d'attente production</h2></div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {pendingCommands.map(c => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === c.modele.toLowerCase());
              return (
                <div key={c.id} className="min-w-[340px] bg-white border border-slate-200 rounded-3xl p-5 flex flex-col shadow-2xl text-slate-800 transition-all hover:shadow-indigo-500/10">
                  <div className="flex gap-4 mb-5">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                      {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-black truncate text-slate-900 tracking-tight">{c.modele}</h3>
                      </div>
                      <p className="text-xs font-bold text-indigo-600 mb-2">{c.client}</p>
                      <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg w-fit">
                        <Scissors className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-black uppercase text-slate-600">{c.quantite} pièces</span>
                      </div>
                    </div>
                  </div>
                  
                  {fiche && <div className="mb-5 border-t border-slate-100 pt-5"><AssetsBlock fiche={fiche} /></div>}
                  
                  <button onClick={() => handleImportCommand(c)} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 tracking-widest uppercase">LANCER LA COUPE <ChevronRight className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Ordres</p>
          <p className="text-2xl font-black text-slate-800">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pièces à couper</p>
          <p className="text-2xl font-black text-indigo-600">{totalPieces.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tissu nécessaire</p>
          <p className="text-2xl font-black text-purple-600">{totalMetrage.toLocaleString()} m</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Rechercher un ordre..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" /></div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer">
            <option value="all">Tous les statuts</option><option value="planifié">Planifié</option><option value="en_cours">En cours</option><option value="terminé">Terminé</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
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
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                          {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 mb-1 tracking-tight leading-none uppercase">{o.modele}</p>
                          <p className="text-xs font-bold text-indigo-600 mb-1">{o.client}</p>
                          <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{o.tissu} · {o.couleur}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {fiche ? <AssetsBlock fiche={fiche} /> : <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Fiche technique manquante</div>}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <p className="text-base font-black text-slate-900 tracking-tight">{o.quantite} <span className="text-[10px] font-bold text-slate-400">PCS</span></p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Ruler className="w-3 h-3 text-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{o.metrage} m</p>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statutBadge(o.statut)}`}>{o.statut}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setEditId(o.id); setForm(o); setShowModal(true); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => remove(o.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Search className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest">Aucun ordre de coupe trouvé</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-10 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100"><Scissors className="w-6 h-6 text-white" /></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editId ? 'Modifier' : 'Lancer'} l'Ordre</h2>
            </div>
            
            <div className="space-y-4">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Modèle de référence *</label><input value={form.modele || ''} onChange={e => handleModeleChange(e.target.value)} list="modeles-list" className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all" placeholder="Sélectionner un modèle..." /><datalist id="modeles-list">{fiches.map(f => <option key={f.id} value={f.modele} />)}</datalist></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Type Tissu</label><input value={form.tissu || ''} onChange={e => setForm({ ...form, tissu: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50/50" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Couleur</label><input value={form.couleur || ''} onChange={e => setForm({ ...form, couleur: e.target.value })} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Quantité (PCS)</label><input type="number" value={form.quantite || 0} onChange={e => handleQtyChange(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50/50" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Métrage (M)</label><div className="w-full px-5 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm font-black text-indigo-700 flex justify-between items-center"><span>{form.metrage || 0}</span><span className="opacity-40">M</span></div></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6"><button onClick={() => setShowModal(false)} className="px-6 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Annuler</button><button onClick={save} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest">Enregistrer l'Ordre</button></div>
          </div>
        </div>
      )}

      {/* MODAL POUR VOIR LES MESURES */}
      {viewMesuresFiche && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col scale-100 animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100"><Ruler className="w-7 h-7 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Tableau des Mesures</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{viewMesuresFiche.modele} <span className="mx-2">·</span> {viewMesuresFiche.client}</p>
                </div>
              </div>
              <button onClick={() => setViewMesuresFiche(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-auto p-10">
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-[0.15em]">
                      <th className="px-8 py-5 text-left border-r border-slate-800">Point de Mesure</th>
                      {viewMesuresFiche.tailles.map(t => <th key={t} className="px-6 py-5 text-center border-r border-slate-800 last:border-r-0">{t}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {viewMesuresFiche.mesures.map((m, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-5 font-black text-slate-700 bg-slate-50 group-hover:bg-indigo-50/50 border-r border-slate-200 transition-colors uppercase tracking-tight">{m.nom}</td>
                        {viewMesuresFiche.tailles.map(t => (
                          <td key={t} className="px-6 py-5 text-center font-bold text-indigo-600 border-r border-slate-100 last:border-r-0 group-hover:bg-white transition-colors">
                            {m.valeurs[t] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {viewMesuresFiche.mesures.length === 0 && (
                      <tr><td colSpan={viewMesuresFiche.tailles.length + 1} className="px-8 py-14 text-center text-slate-400 font-bold uppercase tracking-widest italic">Aucune mesure enregistrée pour ce modèle.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-center bg-slate-50/50">
              <button onClick={() => setViewMesuresFiche(null)} className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200">Fermer le Tableau</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
