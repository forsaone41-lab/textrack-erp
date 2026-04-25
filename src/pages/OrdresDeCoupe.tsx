import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, ShoppingCart, FileText, Image as ImageIcon, Eye, Download, ClipboardList } from 'lucide-react';
import { OrdreDeCoupe, StockTissu, FicheTechnique, Commande, loadData, saveRecord, deleteRecord, genId } from '../types';
import { generatePDF, printElement } from '../utils/pdf';

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
  const [printContent, setPrintContent] = useState<{title: string, image?: string, html?: React.ReactNode, isPDF?: boolean} | null>(null);

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

      const newCommands = cmds.filter(c => c.phase === 'coupe' && !(c as any).vu);
      if (newCommands.length > 0) {
        newCommands.forEach(c => {
          saveRecord('commandes', { ...c, vu: true });
        });
      }
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

  const dataURLtoBlob = (dataurl: string) => {
    try {
      const parts = dataurl.split(',');
      if (parts.length < 2) return null;
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error("Blob conversion error", e);
      return null;
    }
  };

  const downloadImage = (url: string, filename: string) => {
    try {
      if (url.startsWith('data:')) {
        const blob = dataURLtoBlob(url);
        if (!blob) throw new Error("Conversion failed");
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Download error", e);
      window.open(url, '_blank');
    }
  };

  const handlePrintPatron = (fiche: FicheTechnique) => {
    if (!fiche.patronagePhoto) {
      alert("Aucun patronage n'est associé à cette fiche technique.");
      return;
    }
    const isPDF = fiche.patronagePhoto.startsWith('data:application/pdf');
    let finalUrl = fiche.patronagePhoto;
    if (isPDF) {
      const blob = dataURLtoBlob(fiche.patronagePhoto);
      if (blob) finalUrl = URL.createObjectURL(blob);
    }
    setPrintContent({ title: `Patronage - ${fiche.modele}`, image: finalUrl, isPDF });
    setShowPrintModal(true);
  };

  const handleExportFichePDF = (fiche: FicheTechnique) => {
    setPrintContent({
      title: `Fiche Technique - ${fiche.modele}`,
      html: (
        <div id="fiche-printable-content" className="w-full max-w-4xl bg-white p-8 text-slate-800 font-sans">
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">FICHE TECHNIQUE</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Réf: {fiche.modele}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-indigo-600">BEYA CREATIVE</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Confection Textile Pro</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <section>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-50 pb-2">Informations Générales</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Client</p>
                    <p className="text-sm font-black text-slate-700">{fiche.client}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Type de vêtement</p>
                    <p className="text-sm font-black text-slate-700">{fiche.type}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-50 pb-2">Données de Production</h2>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Consommation Tissu</p>
                      <p className="text-xl font-black text-indigo-600">{fiche.tissuConsommation} <span className="text-xs text-slate-400 font-medium">m/pièce</span></p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                      <Scissors className="w-6 h-6 text-indigo-500" />
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-50 pb-2">Notes Techniques</h2>
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 min-h-[120px]">
                  <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{fiche.description || 'Aucune consigne particulière.'}</p>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Aperçu du Modèle</h2>
              <div className="aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100 relative group">
                {fiche.photo ? (
                  <img src={fiche.photo} className="w-full h-full object-cover" alt="Modèle" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-slate-300" /></div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Document généré le {new Date().toLocaleDateString('fr-FR')} par TexTrack ERP</p>
          </div>
        </div>
      )
    });
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
      rollId: null
    });
    setShowModal(true);
  };

  async function save() {
    if (!form.modele || !form.tissu) return;
    const isNew = !editId;
    const oId = editId || genId();
    const ordreData = { id: oId, ...form } as OrdreDeCoupe;
    if (!ordreData.commandeId) ordreData.commandeId = null;
    const oldOrdre = !isNew ? ordres.find(o => o.id === editId) : null;
    if (ordreData.rollId) {
      const currentRoll = tissus.find(t => t.id === ordreData.rollId);
      if (currentRoll) {
        let updatedMetrage = currentRoll.metrage;
        if (isNew) updatedMetrage -= (ordreData.metrage || 0);
        else updatedMetrage -= ((ordreData.metrage || 0) - (oldOrdre?.metrage || 0));
        const updatedRoll = { ...currentRoll, metrage: Math.max(0, updatedMetrage) };
        setTissus(tissus.map(t => t.id === updatedRoll.id ? updatedRoll : t));
        await saveRecord('tissus', updatedRoll);
      }
    }
    const updated = isNew ? [...ordres, ordreData] : ordres.map(o => o.id === editId ? ordreData : o);
    setOrdres(updated);
    setShowModal(false);
    await saveRecord('ordres', ordreData);
  }

  async function remove(id: string) {
    const orderToDelete = ordres.find(o => o.id === id);
    if (orderToDelete?.rollId && orderToDelete.metrage > 0) {
      const roll = tissus.find(t => t.id === orderToDelete.rollId);
      if (roll) {
        const updatedRoll = { ...roll, metrage: roll.metrage + orderToDelete.metrage };
        setTissus(tissus.map(t => t.id === updatedRoll.id ? updatedRoll : t));
        await saveRecord('tissus', updatedRoll);
      }
    }
    setOrdres(ordres.filter(o => o.id !== id));
    await deleteRecord('ordres', id);
  }

  const totalMetrage = filtered.reduce((a, o) => a + o.metrage, 0);
  const totalPieces = filtered.reduce((a, o) => a + o.quantite, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ordres de Coupe</h1>
          <p className="text-slate-500 text-sm">Suivi des phases de coupe du tissu</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCommands.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-amber-700">{pendingCommands.length} Nouvelles Commandes</span>
            </div>
          )}
          <button onClick={() => { setEditId(null); setForm({ statut: 'planifié', dateCoupe: new Date().toISOString().split('T')[0] }); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" /> Nouvel Ordre
          </button>
        </div>
      </div>

      {pendingCommands.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-3"><ShoppingCart className="w-4 h-4" /><h2 className="text-sm font-bold uppercase tracking-wider">File d'attente</h2></div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {pendingCommands.map(c => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === c.modele.toLowerCase());
              return (
                <div key={c.id} className="min-w-[320px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <div className="flex gap-4 mb-4">
                    <div className="relative group w-20 h-20 rounded-2xl bg-white/20 overflow-hidden flex-shrink-0 border border-white/30">
                      {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-white/50" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1"><span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black uppercase">{c.reference}</span></div>
                      <p className="text-sm font-black truncate">{c.client}</p>
                      <p className="text-[11px] opacity-80 truncate">{c.modele}</p>
                      <p className="text-[11px] font-black mt-1">{c.quantite} pièces</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {fiche?.patronagePhoto && <button onClick={() => handlePrintPatron(fiche)} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl hover:bg-emerald-100 transition"><FileText className="w-3.5 h-3.5" /> PATRON</button>}
                    {fiche && <button onClick={() => handleExportFichePDF(fiche)} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold bg-slate-900 text-white px-3 py-2.5 rounded-xl hover:bg-slate-800 transition"><FileText className="w-3.5 h-3.5" /> FICHE PDF</button>}
                  </div>
                  <button onClick={() => handleImportCommand(c)} className="w-full bg-white text-indigo-700 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-50 transition flex items-center justify-center gap-2 shadow-xl border border-white"><Scissors className="w-3 h-3" /> LANCER LA COUPE</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-slate-800">{filtered.length}</p><p className="text-xs text-slate-500">Ordres</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-indigo-600">{totalPieces.toLocaleString()}</p><p className="text-xs text-slate-500">Total Pièces</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-purple-600">{totalMetrage.toLocaleString()}m</p><p className="text-xs text-slate-500">Métrage total</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm">
          <option value="all">Tous les statuts</option><option value="planifié">Planifié</option><option value="en_cours">En cours</option><option value="terminé">Terminé</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-5 py-3">Modèle</th><th className="px-5 py-3">Tissu</th><th className="px-5 py-3 text-center">Quantité</th><th className="px-5 py-3 text-center">Métrage</th><th className="px-5 py-3 text-center">Date</th><th className="px-5 py-3 text-center">Statut</th><th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(o => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
              const hasPatron = !!fiche?.patronagePhoto;
              return (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-6 h-6" /></div>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{o.modele}</p>
                        <div className="flex gap-1.5 mt-2">
                          {hasPatron && <button onClick={() => handlePrintPatron(fiche!)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition shadow-sm"><FileText className="w-3.5 h-3.5" /> PATRON</button>}
                          {fiche && <button onClick={() => handleExportFichePDF(fiche)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition shadow-md"><FileText className="w-3.5 h-3.5" /> FICHE PDF</button>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{o.tissu}<br/><span className="text-xs text-slate-400">{o.couleur}</span></td>
                  <td className="px-5 py-3.5 text-center text-sm text-slate-600">{o.quantite} pcs</td>
                  <td className="px-5 py-3.5 text-center text-sm text-slate-600">{o.metrage}m</td>
                  <td className="px-5 py-3.5 text-center text-sm text-slate-500">{o.dateCoupe}</td>
                  <td className="px-5 py-3 text-center"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statutBadge(o.statut)}`}>{o.statut}</span></td>
                  <td className="px-5 py-3.5 text-center"><div className="flex justify-center gap-1"><button onClick={() => openEdit(o)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => remove(o.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier' : 'Nouvel'} Ordre de Coupe</h2>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Modèle *</label><input value={form.modele || ''} onChange={e => handleModeleChange(e.target.value)} list="modeles-list" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /><datalist id="modeles-list">{fiches.map(f => (<option key={f.id} value={f.modele}>{f.client}</option>))}</datalist></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Tissu *</label><input value={form.tissu || ''} onChange={e => setForm({ ...form, tissu: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Couleur</label><input value={form.couleur || ''} onChange={e => setForm({ ...form, couleur: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Quantité</label><input type="number" value={form.quantite || 0} onChange={e => handleQtyChange(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Métrage (m)</label><input type="number" step="0.1" value={form.metrage || 0} onChange={e => setForm({ ...form, metrage: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-indigo-50 font-bold text-indigo-700 outline-none" /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4"><button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Annuler</button><button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">{editId ? 'Modifier' : 'Créer'}</button></div>
          </div>
        </div>
      )}

      {showPrintModal && printContent && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center no-print">
              <h3 className="font-bold text-slate-800">{printContent.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (printContent.html) printElement('fiche-printable-content');
                    else window.print();
                  }} 
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition"
                >
                  <Download className="w-4 h-4" /> IMPRIMER
                </button>
                <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition">FERMER</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-50 print:bg-white print:p-0">
              {printContent.html ? (
                <div className="print:m-0 shadow-2xl print:shadow-none bg-white">
                  {printContent.html}
                </div>
              ) : printContent.isPDF ? (
                <iframe src={printContent.image} className="w-full h-full min-h-[70vh] border-0 rounded-xl shadow-lg no-print" title="Document PDF" />
              ) : (
                <img src={printContent.image} className="max-w-full h-auto shadow-lg print:shadow-none" alt="Document" />
              )}
            </div>
          </div>
          <style>{`@media print { body * { visibility: hidden; } .print\\:static, .print\\:static * { visibility: visible; } .print\\:static { position: absolute; left: 0; top: 0; width: 100%; height: 100%; } .no-print { display: none !important; } }`}</style>
        </div>
      )}
    </div>
  );
}
