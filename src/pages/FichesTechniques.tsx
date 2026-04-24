import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Ruler, Calculator, Camera, FileText, Download } from 'lucide-react';
import {
  FicheTechnique, StockTissu, loadData, saveRecord, deleteRecord, genId,
} from '../types';

export default function FichesTechniques() {
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FicheTechnique>>({
    modele: '', description: '', client: '', tailles: [], type: '',
    tissuConsommation: 0, mesures: [],
  });
  const [newTaille, setNewTaille] = useState('');
  const [newMesureNom, setNewMesureNom] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  const [tissus, setTissus] = useState<StockTissu[]>([]);

  // Calculateur state
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
      loadData<FicheTechnique>('fiches'),
      loadData<StockTissu>('tissus')
    ]).then(([f, t]) => {
      setFiches(f);
      setTissus(t);
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'patronagePhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Pour le patronage, on peut aussi stocker le nom du fichier pour l'affichage
        if (field === 'patronagePhoto') {
          setForm({ ...form, [field]: reader.result as string, patronageFileName: file.name });
        } else {
          setForm({ ...form, [field]: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = fiches.filter(f =>
    f.modele.toLowerCase().includes(search.toLowerCase()) ||
    f.client.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditId(null);
    setForm({ modele: '', description: '', client: '', tailles: [], type: '', tissuConsommation: 0, mesures: [] });
    setShowModal(true);
  }

  function openEdit(f: FicheTechnique) {
    setEditId(f.id);
    setForm({ ...f, mesures: [...f.mesures], tailles: [...f.tailles] });
    setShowModal(true);
  }

  async function save() {
    if (!form.modele || !form.client) return;
    const isNew = !editId;
    const fId = editId || genId();

    const fData: FicheTechnique = {
      id: fId,
      modele: form.modele || '', description: form.description || '',
      client: form.client || '', tailles: form.tailles || [], mesures: form.mesures || [],
      tissuConsommation: form.tissuConsommation || 0, type: form.type || '',
      photo: form.photo, patronagePhoto: form.patronagePhoto,
      patronageFileName: form.patronageFileName,
      createdAt: form.createdAt || new Date().toISOString().split('T')[0],
    };

    const updated = isNew
      ? [...fiches, fData]
      : fiches.map(f => f.id === editId ? fData : f);

    setFiches(updated);
    setShowModal(false);

    await saveRecord('fiches', fData);
  }

  async function remove(id: string) {
    const updated = fiches.filter(f => f.id !== id);
    setFiches(updated);
    await deleteRecord('fiches', id);
  }

  function downloadFile(data: string, filename: string) {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function addTaille() {
    if (newTaille && !(form.tailles || []).includes(newTaille)) {
      setForm({ ...form, tailles: [...(form.tailles || []), newTaille] });
      setNewTaille('');
    }
  }

  function removeTaille(t: string) {
    setForm({ ...form, tailles: (form.tailles || []).filter(x => x !== t) });
  }

  function addMesure(manualName?: string) {
    const name = manualName || newMesureNom;
    if (name.trim()) {
      const initialValeurs: Record<string, number> = {};
      (form.tailles || []).forEach(t => {
        initialValeurs[t] = 0;
      });
      setForm({ 
        ...form, 
        mesures: [...(form.mesures || []), { nom: name.trim(), valeurs: initialValeurs }] 
      });
      if (!manualName) setNewMesureNom('');
    }
  }

  function removeMesure(idx: number) {
    setForm({ ...form, mesures: (form.mesures || []).filter((_, i) => i !== idx) });
  }

  function updateMesureValeur(mesureIdx: number, taille: string, val: number) {
    const updatedMesures = [...(form.mesures || [])];
    const mesure = { ...updatedMesures[mesureIdx] };
    mesure.valeurs = { ...mesure.valeurs, [taille]: val };
    updatedMesures[mesureIdx] = mesure;
    setForm({ ...form, mesures: updatedMesures });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fiches Techniques</h1>
          <p className="text-slate-500 text-sm">Patronage et mesures de chaque modèle</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            Promise.all([
              loadData<FicheTechnique>('fiches'),
              loadData<StockTissu>('tissus')
            ]).then(([f, t]) => {
              setFiches(f);
              setTissus(t);
              setShowCalc(true);
            });
          }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm">
            <Calculator className="w-4 h-4" /> Calculateur de Prix
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" /> Nouvelle Fiche
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text" placeholder="Rechercher par modèle ou client..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* Cards — 2 columns, large pro cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.map(f => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden group">

            {/* Top section: Photo + Info side by side */}
            <div className="flex">
              {/* Photo */}
              <div className="relative w-48 flex-shrink-0 bg-white border-r border-slate-100 overflow-hidden">
                {f.photo ? (
                  <img src={f.photo} alt={f.modele} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 min-h-44" />
                ) : (
                  <div className="w-full min-h-44 h-full flex flex-col items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                    <Camera className="w-10 h-10 mb-2" />
                    <span className="text-[10px]">Pas de photo</span>
                  </div>
                )}
                {f.photo && (
                  <button 
                    onClick={() => downloadFile(f.photo!, `Photo_${f.modele}.png`)}
                    className="absolute top-2 left-2 p-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 hover:bg-white"
                    title="Télécharger la photo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                {f.patronagePhoto && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full shadow-sm">
                      <FileText className="w-2.5 h-2.5" /> Patron
                    </span>
                    <button 
                      onClick={() => downloadFile(f.patronagePhoto!, f.patronageFileName || `Patron_${f.modele}`)}
                      className="p-1 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-full shadow-sm border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-colors"
                      title="Télécharger le patronage"
                    >
                      <Download className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Header Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{f.modele}</h3>
                      <p className="text-sm text-slate-500">{f.client}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(f)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(f.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {f.type && (
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{f.type}</span>
                  )}

                  {f.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{f.description}</p>
                  )}
                </div>

                {/* Key stats */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-indigo-50 rounded-lg px-2.5 py-1.5">
                    <Ruler className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-700">{f.tissuConsommation}m</span>
                    <span className="text-[10px] text-indigo-400">/pièce</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700">{f.tailles.length} tailles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section: Tailles × Mesures Table */}
            {(f.tailles.length > 0 || f.mesures.length > 0) && (
              <div className="border-t border-slate-100">
                {f.tailles.length > 0 && f.mesures.length > 0 ? (
                  /* Full table: tailles as columns, mesures as rows */
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-800">
                          <th className="px-3 py-2.5 text-left text-slate-300 font-semibold uppercase tracking-wider w-32">Mesure</th>
                          {f.tailles.map(taille => (
                            <th key={taille} className="px-3 py-2.5 text-center text-white font-bold uppercase tracking-wider">
                              {taille}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {f.mesures.map((m, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="px-3 py-2.5 font-semibold text-slate-600">{m.nom}</td>
                            {f.tailles.map(taille => (
                              <td key={taille} className="px-3 py-2.5 text-center font-bold text-slate-800">
                                {m.valeurs?.[taille] || 0} <span className="text-slate-400 font-normal">cm</span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : f.tailles.length > 0 ? (
                  /* Only tailles, no mesures */
                  <div className="p-4 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-center mr-1">Tailles:</span>
                    {f.tailles.map(t => (
                      <span key={t} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg">{t}</span>
                    ))}
                  </div>
                ) : (
                  /* Only mesures, no tailles */
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {f.mesures.map((m, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                        <p className="text-[10px] text-slate-400 mb-0.5">{m.nom}</p>
                        <p className="text-sm font-bold text-slate-800">{m.valeur}<span className="text-xs font-normal text-slate-400"> cm</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>



      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <FileTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune fiche technique trouvée</p>
        </div>
      )}

      {/* Calculateur de Prix Modal */}
      {showCalc && (() => {
        const matieres = calcConsommation * calcPrixTissu * calcQty;
        const mo = calcMainOeuvre * calcQty;
        const charges = calcCharges * calcQty;
        const autres = calcAutres * calcQty;
        const coutRevient = matieres + mo + charges + autres;
        const marge = coutRevient * (calcMarge / 100);
        const prixVente = coutRevient + marge;
        const prixUnitaire = calcQty > 0 ? prixVente / calcQty : 0;

        function handleFicheChange(id: string) {
          setCalcFicheId(id);
          const f = fiches.find(x => x.id === id);
          if (f) setCalcConsommation(f.tissuConsommation);
          else { setCalcConsommation(0); }
        }

        function handleTissuChange(id: string) {
          setCalcTissuId(id);
          const t = tissus.find(x => x.id === id);
          if (t) setCalcPrixTissu(t.prixMetre);
          else setCalcPrixTissu(0);
        }

        const selectedTissu = tissus.find(t => t.id === calcTissuId);
        const metrageNecessaire = calcConsommation * calcQty;
        const stockSuffisant = selectedTissu ? selectedTissu.metrage >= metrageNecessaire : true;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Calculateur de Coût Automatique
                </h2>
                <button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fiche Technique</label>
                    <select value={calcFicheId} onChange={e => handleFicheChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="">Sélectionner une fiche</option>
                      {fiches.map(f => <option key={f.id} value={f.id}>{f.modele} — {f.client}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consommation (m/pièce)</label>
                    <input type="number" step="0.01" value={calcConsommation || ''} onChange={e => setCalcConsommation(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quantité à produire</label>
                    <input type="number" min="1" value={calcQty || ''} onChange={e => setCalcQty(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>

                  {/* Tissu from Stock — the key field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Tissu du Stock
                      <span className="ml-1.5 text-[10px] font-normal text-slate-400">(prix auto depuis stock)</span>
                    </label>
                    <select value={calcTissuId} onChange={e => handleTissuChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="">— Choisir un rouleau —</option>
                      {tissus.filter(t => t.metrage > 0).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.couleur} · {t.type} — {t.metrage}m dispo · {t.prixMetre} MAD/m
                        </option>
                      ))}
                      {tissus.filter(t => t.metrage <= 0).length > 0 && (
                        <optgroup label="── Épuisés ──">
                          {tissus.filter(t => t.metrage <= 0).map(t => (
                            <option key={t.id} value={t.id} disabled>
                              {t.couleur} · {t.type} — Épuisé
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    {/* Stock info card */}
                    {selectedTissu && (
                      <div className={`mt-2 rounded-xl p-3 border text-xs ${stockSuffisant ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-700">{selectedTissu.couleur} — {selectedTissu.type}</span>
                          <span className={`font-bold ${stockSuffisant ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stockSuffisant ? '✓ Stock OK' : '⚠ Stock insuffisant'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-slate-500">
                          <span>Disponible: <strong className="text-slate-700">{selectedTissu.metrage} m</strong></span>
                          <span>Nécessaire: <strong className={stockSuffisant ? 'text-slate-700' : 'text-red-600'}>{metrageNecessaire.toFixed(1)} m</strong></span>
                        </div>
                        {selectedTissu.composition && (
                          <span className="text-slate-400 mt-1 block">{selectedTissu.composition}</span>
                        )}
                      </div>
                    )}

                    {tissus.length === 0 && (
                      <p className="mt-1.5 text-xs text-amber-600">Aucun tissu en stock — ajoutez d'abord des rouleaux dans Stock Matériaux</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Prix tissu (MAD/mètre)
                      {selectedTissu && <span className="ml-1.5 text-[10px] text-green-600 font-normal">· auto depuis stock</span>}
                    </label>
                    <input type="number" min="0" value={calcPrixTissu || ''} onChange={e => setCalcPrixTissu(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none ${selectedTissu ? 'border-green-300 bg-green-50/50' : 'border-slate-200'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Main d'œuvre (DH/pièce)</label>
                    <input type="number" min="0" value={calcMainOeuvre || ''} onChange={e => setCalcMainOeuvre(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Charges fixes (DH/pièce)</label>
                    <input type="number" min="0" value={calcCharges || ''} onChange={e => setCalcCharges(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Autres coûts (DH/pièce)</label>
                    <input type="number" min="0" value={calcAutres || ''} onChange={e => setCalcAutres(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Marge bénéficiaire (%)</label>
                    <input type="number" min="0" max="200" value={calcMarge || ''} onChange={e => setCalcMarge(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>

                {/* Résultats */}
                <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Résultat du Calcul</h3>
                  {[
                    { label: 'Matières premières', value: matieres },
                    { label: "Main d'œuvre", value: mo },
                    { label: 'Charges fixes', value: charges },
                    { label: 'Autres coûts', value: autres },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm border-b border-slate-200 pb-2">
                      <span className="text-slate-500">{row.label}:</span>
                      <span className="font-medium text-slate-700">{row.value.toFixed(2)} DH</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold text-indigo-700 pt-1">
                    <span>Coût de revient:</span>
                    <span>{coutRevient.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Marge ({calcMarge}%):</span>
                    <span>{marge.toFixed(2)} DH</span>
                  </div>
                  <div className="bg-green-600 text-white rounded-xl p-4 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Prix de vente total:</span>
                      <span className="font-bold text-2xl">{prixVente.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 opacity-80 text-sm">
                      <span>Prix unitaire:</span>
                      <span className="font-semibold">{prixUnitaire.toFixed(2)} DH / pièce</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">

            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier' : 'Nouvelle'} Fiche Technique</h2>
                  <p className="text-xs text-slate-400">Remplissez les informations du modèle</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
                ×
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">

              {/* ── Photos ── */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Médias</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Photo du Modèle</label>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group hover:border-indigo-400 transition-colors cursor-pointer">
                      {form.photo ? (
                        <>
                          <img src={form.photo} alt="Preview" className="w-full h-full object-contain" />
                          <button onClick={() => setForm({ ...form, photo: undefined })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                          <button onClick={() => downloadFile(form.photo!, `Photo_${form.modele || 'fiche'}.png`)} className="absolute top-2 left-2 p-1.5 bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Download className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <Camera className="w-7 h-7 text-slate-300 mb-1" />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Ajouter Photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'photo')} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Patronage (PDF/DXF/Image)</label>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group hover:border-indigo-400 transition-colors cursor-pointer">
                      {form.patronagePhoto ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          {form.patronagePhoto.startsWith('data:image/') ? (
                            <img src={form.patronagePhoto} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                              <p className="text-[10px] font-bold text-indigo-600 text-center px-4 truncate w-full">{form.patronageFileName}</p>
                            </div>
                          )}
                          <button onClick={() => setForm({ ...form, patronagePhoto: undefined, patronageFileName: undefined })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                          <button onClick={() => downloadFile(form.patronagePhoto!, form.patronageFileName || 'patronage')} className="absolute top-2 left-2 p-1.5 bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <FileText className="w-7 h-7 text-slate-300 mb-1" />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Ajouter PDF/DXF</span>
                          <input type="file" accept=".pdf,.dxf,image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'patronagePhoto')} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Infos de base ── */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Informations</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Modèle *</label>
                    <input value={form.modele || ''} onChange={e => setForm({ ...form, modele: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
                    <input value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })}
                      placeholder="ex: Chemise, Robe..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                      {['T-shirt', 'Polo', 'Chemise', 'Pantalon', 'Sweat', 'Veste', 'Robe'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, type: t })}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            form.type === t 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-sm'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Client *</label>
                  <input value={form.client || ''} onChange={e => setForm({ ...form, client: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Ruler className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                    Consommation tissu (mètres/pièce)
                  </label>
                  <input type="number" step="0.1" value={form.tissuConsommation || 0} onChange={e => setForm({ ...form, tissuConsommation: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                </div>
              </div>

              {/* ── Tailles ── */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tailles disponibles</p>
                <div className="flex gap-2 mb-3">
                  <input value={newTaille} onChange={e => setNewTaille(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTaille())}
                    placeholder="Ex: XS, S, M, L, XL..."
                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  <button onClick={addTaille} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ Ajouter</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.tailles || []).map(t => (
                    <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl">
                      {t}
                      <button onClick={() => removeTaille(t)} className="hover:text-red-300 transition text-slate-400 text-sm leading-none">×</button>
                    </span>
                  ))}
                  {(form.tailles || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Aucune taille ajoutée</p>
                  )}
                </div>
              </div>

              {/* ── Mesures (Patronage) ── */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Mesures (Patronage)
                </p>

                {/* Input row */}
                <div className="flex gap-2 mb-2">
                  <input value={newMesureNom} onChange={e => setNewMesureNom(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMesure())}
                    placeholder="Nom de la mesure (ex: Longueur, Tour de poitrine...)"
                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  <button onClick={() => addMesure()} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">+ Ajouter</button>
                </div>

                {/* Suggestions chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Longueur', 'Poitrine', 'Épaules', 'Manches', 'Taille', 'Hanches', 'Entrejambe', 'Bas'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addMesure(s)}
                      className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-lg transition-all shadow-sm"
                    >
                      + {s}
                    </button>
                  ))}
                </div>

                {/* Mesures Spreadsheet Table */}
                {(form.mesures || []).length > 0 ? (
                  <div className="rounded-xl overflow-x-auto border border-slate-200">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider sticky left-0 bg-slate-100 z-10 w-48 border-r border-slate-200">Mesure</th>
                          {(form.tailles || []).map(t => (
                            <th key={t} className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center min-w-[80px] border-r border-slate-200 last:border-r-0">
                              {t}
                            </th>
                          ))}
                          <th className="w-10 px-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(form.mesures || []).map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 group/row transition-colors">
                            <td className="px-4 py-2 font-medium text-slate-700 sticky left-0 bg-white group-hover/row:bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                              {m.nom}
                            </td>
                            {(form.tailles || []).map(t => (
                              <td key={t} className="p-0 border-r border-slate-100 last:border-r-0">
                                <input
                                  type="number"
                                  value={m.valeurs[t] === 0 ? '' : m.valeurs[t]}
                                  onChange={e => updateMesureValeur(i, t, parseFloat(e.target.value) || 0)}
                                  className="w-full h-full px-3 py-3 text-center focus:ring-2 focus:ring-inset focus:ring-emerald-500 outline-none bg-transparent font-medium text-slate-800 transition-all"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="px-2 text-center">
                              <button onClick={() => removeMesure(i)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover/row:opacity-100">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                    <Ruler className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Aucune mesure ajoutée</p>
                    <p className="text-xs text-slate-300 mt-0.5">Ajoutez les noms des mesures ci-dessus</p>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-slate-50/50">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition">
                Annuler
              </button>
              <button onClick={save} className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/30">
                {editId ? '✓ Enregistrer' : '+ Créer la Fiche'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
    </svg>
  );
}

