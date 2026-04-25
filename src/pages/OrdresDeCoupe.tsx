import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, ShoppingCart, FileText, Image as ImageIcon, Eye, Download, ClipboardList } from 'lucide-react';
import { OrdreDeCoupe, StockTissu, FicheTechnique, Commande, loadData, saveRecord, deleteRecord, genId } from '../types';

import { generatePDF } from '../utils/pdf';

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

  useEffect(() => {
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

      // --- MARQUER COMME VU (Logic pour l'Admin) ---
      const newCommands = cmds.filter(c => c.phase === 'coupe' && !(c as any).vu);
      if (newCommands.length > 0) {
        newCommands.forEach(c => {
          saveRecord('commandes', { ...c, vu: true });
        });
      }
      // --------------------------------------------
    });
  }, []);

  // Filtrer les commandes qui sont en phase 'coupe' mais n'ont pas encore d'Ordre de Coupe
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

  function openCreate() {
    setEditId(null);
    setForm({ 
      modele: '', 
      quantite: 0, 
      tissu: '', 
      couleur: '', 
      metrage: 0, 
      statut: 'planifié', 
      dateCoupe: new Date().toISOString().split('T')[0],
      rollId: null 
    });
    setShowModal(true);
  }

  function openEdit(o: OrdreDeCoupe) {
    setEditId(o.id);
    setForm({ ...o });
    setShowModal(true);
  }

  async function save() {
    if (!form.modele || !form.tissu) return;

    const isNew = !editId;
    const oId = editId || genId();
    const ordreData = { id: oId, ...form } as OrdreDeCoupe;
    if (!ordreData.commandeId) ordreData.commandeId = null;

    // --- LOGIQUE DE STOCK (L-relation) ---
    const oldOrdre = !isNew ? ordres.find(o => o.id === editId) : null;
    
    // 1. Si le rouleau a changé ou c'est un nouvel ordre
    if (ordreData.rollId) {
      const currentRoll = tissus.find(t => t.id === ordreData.rollId);
      if (currentRoll) {
        let updatedMetrage = currentRoll.metrage;
        
        if (isNew) {
          // Nouvel ordre: on soustrait tout le métrage
          updatedMetrage -= (ordreData.metrage || 0);
        } else {
          // Edit: on gère la différence
          const diff = (ordreData.metrage || 0) - (oldOrdre?.metrage || 0);
          updatedMetrage -= diff;
        }

        const updatedRoll = { ...currentRoll, metrage: Math.max(0, updatedMetrage) };
        
        // Update local state
        setTissus(tissus.map(t => t.id === updatedRoll.id ? updatedRoll : t));
        // Save to DB
        await saveRecord('tissus', updatedRoll);
      }
    } else if (oldOrdre?.rollId) {
      // Si on a enlevé le rouleau, on rend le métrage à l'ancien rouleau
      const oldRoll = tissus.find(t => t.id === oldOrdre.rollId);
      if (oldRoll) {
        const updatedRoll = { ...oldRoll, metrage: oldRoll.metrage + oldOrdre.metrage };
        setTissus(tissus.map(t => t.id === updatedRoll.id ? updatedRoll : t));
        await saveRecord('tissus', updatedRoll);
      }
    }
    // -------------------------------------

    const updated = isNew
      ? [...ordres, ordreData]
      : ordres.map(o => o.id === editId ? ordreData : o);

    setOrdres(updated);
    setShowModal(false);
    await saveRecord('ordres', ordreData);
  }

  const handleModeleChange = (val: string) => {
    const fiche = fiches.find(f => f.modele === val);
    const conso = fiche?.tissuConsommation || 0;
    const qty = form.quantite || 0;
    setForm({ 
      ...form, 
      modele: val, 
      metrage: Number((conso * qty).toFixed(2)) 
    });
  };

  const dataURLtoBlob = (dataurl: string) => {
    try {
      const parts = dataurl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error("Erreur conversion blob", e);
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
      console.error("Erreur de téléchargement", e);
      window.open(url, '_blank');
    }
  };

  const handleQtyChange = (val: number) => {
    const fiche = fiches.find(f => f.modele === form.modele);
    const conso = fiche?.tissuConsommation || 0;
    setForm({ 
      ...form, 
      quantite: val, 
      metrage: Number((conso * val).toFixed(2)) 
    });
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

  const handlePrintPatron = (fiche: FicheTechnique) => {
    if (!fiche.patronagePhoto) {
      alert("Aucun patronage n'est associé à cette fiche technique.");
      return;
    }
    
    // Détection du type de contenu (Image vs PDF)
    const isPDF = fiche.patronagePhoto.startsWith('data:application/pdf');
    
    setPrintContent({ 
      title: `Patronage - ${fiche.modele}`, 
      image: fiche.patronagePhoto,
      isPDF: isPDF
    });
    setShowPrintModal(true);
  };

  const handleExportFichePDF = async (fiche: FicheTechnique) => {
    // Créer un élément temporaire masqué pour le rendu PDF
    const printDiv = document.createElement('div');
    printDiv.id = 'fiche-pdf-template';
    printDiv.style.position = 'absolute';
    printDiv.style.left = '-9999px';
    printDiv.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #1e293b; background: white; width: 800px;">
        <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; mb: 30px;">
          <div>
            <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #0f172a;">FICHE TECHNIQUE</h1>
            <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">Référence Modèle: ${fiche.modele}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 18px; font-weight: 700; margin: 0;">BEYA CREATIVE</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Confection de Vêtement</p>
          </div>
        </div>

        <div style="display: flex; gap: 40px; margin-top: 30px;">
          <div style="flex: 1;">
            <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px;">Détails du Modèle</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Client</p>
                <p style="font-size: 14px; font-weight: 600; margin: 2px 0;">${fiche.client}</p>
              </div>
              <div>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Type</p>
                <p style="font-size: 14px; font-weight: 600; margin: 2px 0;">${fiche.type}</p>
              </div>
              <div>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Consommation</p>
                <p style="font-size: 14px; font-weight: 600; margin: 2px 0;">${fiche.tissuConsommation} m/pièce</p>
              </div>
            </div>
          </div>
          <div style="width: 250px;">
            <img src="${fiche.photo}" style="width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
          </div>
        </div>

        <div style="margin-top: 40px;">
          <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px;">Description & Notes</h2>
          <p style="font-size: 13px; line-height: 1.6; color: #475569; background: #f8fafc; padding: 20px; border-radius: 12px;">${fiche.description || 'Aucune note spécifique.'}</p>
        </div>

        <div style="margin-top: 100px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 10px; color: #cbd5e1;">Document généré le ${new Date().toLocaleDateString('fr-FR')} - TexTrack ERP</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(printDiv);
    await generatePDF('fiche-pdf-template', `FICHE-${fiche.modele}`);
    document.body.removeChild(printDiv);
  };

  async function remove(id: string) {
    const orderToDelete = ordres.find(o => o.id === id);
    
    // Rendre le métrage au stock si lié à un rouleau
    if (orderToDelete?.rollId && orderToDelete.metrage > 0) {
      const roll = tissus.find(t => t.id === orderToDelete.rollId);
      if (roll) {
        const updatedRoll = { ...roll, metrage: roll.metrage + orderToDelete.metrage };
        setTissus(tissus.map(t => t.id === updatedRoll.id ? updatedRoll : t));
        await saveRecord('tissus', updatedRoll);
      }
    }

    const updated = ordres.filter(o => o.id !== id);
    setOrdres(updated);
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
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" /> Nouvel Ordre
          </button>
        </div>
      </div>

      {/* Pending Commands Horizontal List */}
      {pendingCommands.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">File d'attente (Commandes à traiter)</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {pendingCommands.map(c => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === c.modele.toLowerCase());
              return (
                <div key={c.id} className="min-w-[320px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <div className="flex gap-4 mb-4">
                    {/* Thumbnail for Pending Card */}
                    <div className="relative group w-20 h-20 rounded-2xl bg-white/20 overflow-hidden flex-shrink-0 border border-white/30 shadow-inner">
                      {fiche?.photo ? (
                        <>
                          <img src={fiche.photo} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); downloadImage(fiche.photo!, `Photo-${c.modele}.png`); }}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Télécharger la photo"
                          >
                            <Download className="w-5 h-5 text-white" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{c.reference}</span>
                        <span className="text-[10px] font-medium opacity-70 flex items-center gap-1">
                          {(c as any).vu && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Vu par vous" />}
                          {c.dateCommande}
                        </span>
                      </div>
                      <p className="text-sm font-black truncate">{c.client}</p>
                      <p className="text-[11px] opacity-80 truncate">{c.modele}</p>
                      <p className="text-[11px] font-black mt-1">{c.quantite} pièces</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {fiche?.patronagePhoto && (
                      <button 
                        onClick={() => handlePrintPatron(fiche)}
                        className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl transition hover:bg-emerald-100 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" /> PATRON
                      </button>
                    )}
                    {fiche?.dossierTechniquePhoto && (
                      <button 
                        onClick={() => downloadImage(fiche.dossierTechniquePhoto!, `Dossier-${c.modele}.png`)}
                        className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold bg-slate-900 text-white px-3 py-2.5 rounded-xl transition hover:bg-slate-800 shadow-lg"
                      >
                        <Download className="w-3.5 h-3.5" /> DOSSIER
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => handleImportCommand(c)}
                    className="w-full bg-white text-indigo-700 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-50 transition flex items-center justify-center gap-2 shadow-xl border border-white"
                  >
                    <Scissors className="w-3 h-3" /> LANCER LA COUPE
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-800">{filtered.length}</p>
          <p className="text-xs text-slate-500">Ordres de coupe</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-indigo-600">{totalPieces.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Total Pièces</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-purple-600">{totalMetrage.toLocaleString()}m</p>
          <p className="text-xs text-slate-500">Métrage total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">Tous les statuts</option>
          <option value="planifié">Planifié</option>
          <option value="en_cours">En cours</option>
          <option value="terminé">Terminé</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Modèle</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Tissu</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Quantité</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Métrage</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Date</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Statut</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail for Table Row */}
                    <div className="relative group w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm transition-all hover:ring-2 hover:ring-indigo-500">
                      {(() => {
                        const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
                        return fiche?.photo ? (
                          <>
                            <img src={fiche.photo} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <button 
                              onClick={() => downloadImage(fiche.photo!, `Photo-${o.modele}.png`)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              title="Télécharger la photo"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{o.modele}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(() => {
                          const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
                          const hasPatron = !!(fiche?.patronagePhoto || fiche?.patronageFileName);
                          const hasDossier = !!(fiche?.dossierTechniquePhoto || fiche?.dossierTechniqueFileName);
                          return (
                            <>
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => fiche && hasPatron && handlePrintPatron(fiche)}
                                  disabled={!hasPatron}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm border ${hasPatron ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100'}`}
                                >
                                  <FileText className="w-3.5 h-3.5" /> PATRON
                                </button>
                                {hasPatron && (
                                  <button 
                                    onClick={() => downloadImage(fiche!.patronagePhoto!, `Patron-${o.modele}.png`)}
                                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
                                    title="Télécharger le patron"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => fiche && handleExportFichePDF(fiche)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold transition-colors shadow-lg border border-slate-800"
                                >
                                  <FileText className="w-3.5 h-3.5" /> FICHE PDF
                                </button>
                              </div>
                              {hasDossier && (
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => downloadImage(fiche!.dossierTechniquePhoto!, `Dossier-${o.modele}.png`)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold transition-colors shadow-lg border border-slate-800"
                                  >
                                    <ClipboardList className="w-3.5 h-3.5" /> DOSSIER
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div>
                    <p className="text-sm text-slate-700">{o.tissu}</p>
                    <p className="text-xs text-slate-400">{o.couleur}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center text-sm text-slate-600">{o.quantite} pcs</td>
                <td className="px-5 py-3.5 text-center text-sm text-slate-600">{o.metrage}m</td>
                <td className="px-5 py-3.5 text-center text-sm text-slate-500">{o.dateCoupe}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statutBadge(o.statut)}`}>
                    {o.statut === 'en_cours' ? 'En cours' : o.statut === 'planifié' ? 'Planifié' : 'Terminé'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(o)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(o.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">Aucun ordre de coupe trouvé</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier' : 'Nouvel'} Ordre de Coupe</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Modèle *</label>
                <input
                  value={form.modele || ''}
                  onChange={e => handleModeleChange(e.target.value)}
                  list="modeles-list"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <datalist id="modeles-list">
                  {fiches.map(f => (
                    <option key={f.id} value={f.modele}>{f.client}</option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sélectionner un rouleau du stock (Optionnel)</label>
                <select 
                  value={form.rollId || ''} 
                  onChange={e => {
                    const rId = e.target.value;
                    const roll = tissus.find(t => t.id === rId);
                    if (roll) {
                      setForm({ ...form, rollId: rId, tissu: roll.type, couleur: roll.couleur });
                    } else {
                      setForm({ ...form, rollId: null });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-medium text-indigo-600"
                >
                  <option value="">-- Saisie manuelle --</option>
                  {tissus.filter(t => t.metrage > 0 || t.id === form.rollId).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.type} - {t.couleur} ({t.metrage}m restants)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tissu *</label>
                  <input
                    value={form.tissu || ''}
                    onChange={e => setForm({ ...form, tissu: e.target.value })}
                    list="tissus-list"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    disabled={!!form.rollId}
                  />
                  <datalist id="tissus-list">
                    {Array.from(new Set(tissus.map(t => t.type))).map(type => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Couleur</label>
                  <input 
                    value={form.couleur || ''} 
                    onChange={e => setForm({ ...form, couleur: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    disabled={!!form.rollId}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantité (pièces)</label>
                  <input type="number" value={form.quantite || 0} onChange={e => handleQtyChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Métrage total (m)</label>
                  <input type="number" step="0.1" value={form.metrage || 0} onChange={e => setForm({ ...form, metrage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50 font-bold text-indigo-700" />
                </div>
              </div>

              {/* Smart Calculator Info */}
              {form.modele && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Consommation estimée :</span>
                    <span className="font-bold text-slate-700">
                      {fiches.find(f => f.modele === form.modele)?.tissuConsommation || 0} m/pièce
                    </span>
                  </div>
                  
                  {form.rollId && (
                    <div className="pt-2 border-t border-slate-200">
                      {(() => {
                        const roll = tissus.find(t => t.id === form.rollId);
                        const dispo = roll?.metrage || 0;
                        const besoin = form.metrage || 0;
                        const isOk = dispo >= besoin;
                        return (
                          <div className={`flex items-center justify-between p-2 rounded-lg ${isOk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            <div className="text-[11px]">
                              <p className="font-bold">{isOk ? '✓ Stock OK' : '⚠ Stock Insuffisant'}</p>
                              <p>Disponible: {dispo}m | Nécessaire: {besoin}m</p>
                            </div>
                            {!isOk && <span className="text-[10px] font-black uppercase">Manque: {(besoin - dispo).toFixed(1)}m</span>}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date de coupe</label>
                  <input type="date" value={form.dateCoupe || ''} onChange={e => setForm({ ...form, dateCoupe: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
                  <select value={form.statut || 'planifié'} onChange={e => setForm({ ...form, statut: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="planifié">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Annuler</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                {editId ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      {/* Print Modal */}
      {showPrintModal && printContent && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center no-print">
              <h3 className="font-bold text-slate-800">{printContent.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition"
                >
                  <Download className="w-4 h-4" /> IMPRIMER
                </button>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                  FERMER
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-50 print:bg-white print:p-0">
              {printContent.isPDF ? (
                <iframe src={printContent.image} className="w-full h-full min-h-[70vh] border-0 rounded-xl shadow-lg no-print" />
              ) : (
                <img src={printContent.image} className="max-w-full h-auto shadow-lg print:shadow-none" alt="Document à imprimer" />
              )}
            </div>
          </div>
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .print\\:static, .print\\:static * { visibility: visible; }
              .print\\:static { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
              .no-print { display: none !important; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
