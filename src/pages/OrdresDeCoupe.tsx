import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, ShoppingCart, FileText, Image as ImageIcon, Download, Ruler, ChevronRight } from 'lucide-react';
import { OrdreDeCoupe, StockTissu, FicheTechnique, Commande, loadData, saveRecord, deleteRecord, genId, Phase } from '../types';
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

  const planifies = ordres.filter(o => o.statut === 'planifié');
  const actifEtTermines = ordres.filter(o => o.statut !== 'planifié');

  const filteredActifs = actifEtTermines.filter(o => {
    const matchSearch = o.modele.toLowerCase().includes(search.toLowerCase()) || o.tissu.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || o.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const startCutting = async (o: OrdreDeCoupe) => {
    const updated = { ...o, statut: 'en_cours' as const };
    setOrdres(prev => prev.map(item => item.id === o.id ? updated : item));
    await saveRecord('ordres', updated);
  };

  const finishCutting = async (o: OrdreDeCoupe) => {
    const updated = { ...o, statut: 'terminé' as const };
    setOrdres(prev => prev.map(item => item.id === o.id ? updated : item));
    await saveRecord('ordres', updated);
  };

  const statutBadge = (s: string) => {
    const map: Record<string, string> = {
      planifié: 'bg-amber-50 text-amber-600 border border-amber-100',
      en_cours: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      terminé: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    };
    return map[s] || 'bg-slate-50 text-slate-500';
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

  const save = async () => {
    if (!form.modele || !form.tissu) return;
    const isNew = !editId;
    const oId = editId || genId();
    const ordreData = { id: oId, ...form } as OrdreDeCoupe;
    const updated = isNew ? [...ordres, ordreData] : ordres.map(o => o.id === editId ? ordreData : o);
    setOrdres(updated);
    setShowModal(false);
    await saveRecord('ordres', ordreData);
  };

  const remove = async (id: string) => {
    setOrdres(ordres.filter(o => o.id !== id));
    await deleteRecord('ordres', id);
  };

  const AssetsBlock = ({ fiche }: { fiche: FicheTechnique }) => (
    <div className="space-y-3">
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
          <Ruler className="w-3.5 h-3.5" /> VOIR LES MESURES
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Espace Coupure</h1>
          <p className="text-slate-500 text-sm font-medium">Gestion de la file d'attente et du patronage</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ statut: 'planifié', dateCoupe: new Date().toISOString().split('T')[0] }); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 transition font-black text-xs shadow-xl shadow-indigo-100 uppercase tracking-widest">
          <Plus className="w-4 h-4" /> Nouvel Ordre
        </button>
      </div>

      {/* SECTION 1: FILE D'ATTENTE (PENDING) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-none">File d'attente (À Faire)</h2>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{planifies.length} ordres en attente</p>
            </div>
          </div>
        </div>

        {planifies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {planifies.map(o => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
              return (
                <div key={o.id} className="bg-white border-2 border-amber-100 rounded-[2.5rem] p-8 shadow-xl shadow-amber-500/5 flex flex-col hover:border-amber-300 transition-all group">
                  <div className="flex gap-6 mb-6">
                    <div className="w-28 h-28 rounded-3xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner">
                      {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-200" /></div>}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-xl font-black text-slate-800 truncate mb-1">{o.modele}</h3>
                      <p className="text-sm font-bold text-amber-600 mb-4">{o.client}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">{o.quantite} PCS</span>
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">{o.tissu}</span>
                      </div>
                    </div>
                  </div>
                  
                  {fiche && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <AssetsBlock fiche={fiche} />
                    </div>
                  )}

                  <button 
                    onClick={() => startCutting(o)}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 uppercase tracking-widest"
                  >
                    <Scissors className="w-4 h-4" /> Démarrer la Coupe
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Aucune commande en attente</p>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* SECTION 2: PRODUCTION ACTIVE & HISTORIQUE */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Scissors className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-none">Production Active & Historique</h2>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{actifEtTermines.length} ordres enregistrés</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Filtrer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
            </div>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer">
              <option value="all">Tous</option>
              <option value="en_cours">En cours</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Ordre / Modèle</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-center">Quantité</th>
                  <th className="px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActifs.map(o => {
                  const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                            {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase">{o.modele}</p>
                            <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase tracking-tighter">{o.client} · {o.tissu}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statutBadge(o.statut)}`}>
                          {o.statut}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <p className="text-lg font-black text-slate-900 tracking-tighter">{o.quantite} <span className="text-[10px] font-bold text-slate-400 uppercase">PCS</span></p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center gap-2">
                          {o.statut === 'en_cours' && (
                            <button onClick={() => finishCutting(o)} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest">
                              Terminer
                            </button>
                          )}
                          <button onClick={() => { setEditId(o.id); setForm(o); setShowModal(true); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(o.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Ordre Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-10 space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-4">{editId ? 'Modifier' : 'Lancer'} l'Ordre</h2>
            <div className="space-y-4">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Modèle *</label><input value={form.modele || ''} onChange={e => handleModeleChange(e.target.value)} className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" /></div>
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
