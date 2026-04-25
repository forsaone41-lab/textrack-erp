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
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printContent, setPrintContent] = useState<{title: string, image: string, isPDF?: boolean} | null>(null);
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

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPatron = (fiche: FicheTechnique) => {
    if (!fiche.patronagePhoto) return;
    const isPDF = fiche.patronagePhoto.startsWith('data:application/pdf');
    setPrintContent({ title: `Patronage - ${fiche.modele}`, image: fiche.patronagePhoto, isPDF });
    setShowPrintModal(true);
  };

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

  // Component for the "ASSETS & DOCUMENTS" block to avoid repetition
  const AssetsBlock = ({ fiche }: { fiche: FicheTechnique }) => (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ASSETS & DOCUMENTS</p>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={!fiche.patronagePhoto}
            onClick={() => handlePrintPatron(fiche)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${
              fiche.patronagePhoto 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm' 
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PATRON
          </button>
          <button 
            onClick={() => printFicheTechnique(fiche)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-lg"
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
                  
                  <button onClick={() => handleImportCommand(c)} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-black hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg">LANCER LA COUPE <ChevronRight className="w-4 h-4" /></button>
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Filtrer les ordres..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none">
            <option value="all">Tous les statuts</option><option value="planifié">Planifié</option><option value="en_cours">En cours</option><option value="terminé">Terminé</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Ordre / Modèle</th>
                <th className="px-6 py-4">Production Assets</th>
                <th className="px-6 py-4 text-center">Quantité</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(o => {
                const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
                return (
                  <tr key={o.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 mb-0.5">{o.modele}</p>
                          <p className="text-xs font-bold text-slate-400">{o.client}</p>
                          <p className="text-[10px] font-bold text-indigo-500 mt-1">{o.tissu} · {o.couleur}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-[300px]">
                      {fiche && <AssetsBlock fiche={fiche} />}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-sm font-black text-slate-800">{o.quantite} pcs</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{o.metrage} m</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statutBadge(o.statut)}`}>{o.statut}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setEditId(o.id); setForm(o); setShowModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => remove(o.id)} className="p-2 text-slate-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-5">
            <h2 className="text-xl font-black text-slate-800">{editId ? 'Modifier' : 'Lancer'} l'Ordre de Coupe</h2>
            <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Modèle *</label><input value={form.modele || ''} onChange={e => handleModeleChange(e.target.value)} list="modeles-list" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Tissu</label><input value={form.tissu || ''} onChange={e => setForm({ ...form, tissu: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Couleur</label><input value={form.couleur || ''} onChange={e => setForm({ ...form, couleur: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Quantité</label><input type="number" value={form.quantite || 0} onChange={e => handleQtyChange(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Métrage (m)</label><input type="number" step="0.1" value={form.metrage || 0} readOnly className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-indigo-600 outline-none" /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4"><button onClick={() => setShowModal(false)} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600">Annuler</button><button onClick={save} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">ENREGISTRER</button></div>
          </div>
        </div>
      )}

      {/* MODAL POUR VOIR LES MESURES */}
      {viewMesuresFiche && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100"><Ruler className="w-6 h-6 text-white" /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Tableau des Mesures (cm)</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{viewMesuresFiche.modele} · {viewMesuresFiche.client}</p>
                </div>
              </div>
              <button onClick={() => setViewMesuresFiche(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-md transition text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-auto p-8">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-[0.1em]">
                      <th className="px-6 py-4 text-left border-r border-slate-800">Point de Mesure</th>
                      {viewMesuresFiche.tailles.map(t => <th key={t} className="px-6 py-4 text-center border-r border-slate-800 last:border-r-0">{t}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {viewMesuresFiche.mesures.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-700 bg-slate-50/50 border-r border-slate-200">{m.nom}</td>
                        {viewMesuresFiche.tailles.map(t => (
                          <td key={t} className="px-6 py-4 text-center font-bold text-indigo-600 border-r border-slate-100 last:border-r-0">
                            {m.valeurs[t] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {viewMesuresFiche.mesures.length === 0 && (
                      <tr><td colSpan={viewMesuresFiche.tailles.length + 1} className="px-6 py-10 text-center text-slate-400 italic">Aucune mesure enregistrée pour ce modèle.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-center bg-slate-50/50">
              <button onClick={() => setViewMesuresFiche(null)} className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition shadow-xl">FERMER LE TABLEAU</button>
            </div>
          </div>
        </div>
      )}

      {showPrintModal && printContent && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center no-print"><h3 className="font-bold text-slate-800">{printContent.title}</h3><div className="flex gap-2"><button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition"><Download className="w-4 h-4" /> IMPRIMER</button><button onClick={() => setShowPrintModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition">FERMER</button></div></div>
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-50 print:bg-white print:p-0">
              {printContent.isPDF ? <iframe src={printContent.image} className="w-full h-full min-h-[70vh] border-0 rounded-xl shadow-lg no-print" title="Document PDF" /> : <img src={printContent.image} className="max-w-full h-auto shadow-lg print:shadow-none" alt="Document" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
