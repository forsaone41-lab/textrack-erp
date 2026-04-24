import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Ruler, Calculator, Camera, FileText } from 'lucide-react';
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
    tissuConsommation: 0, mesures: [{ nom: '', valeur: 0 }],
  });
  const [newTaille, setNewTaille] = useState('');
  const [newMesure, setNewMesure] = useState({ nom: '', valeur: 0 });
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

  function addTaille() {
    if (newTaille && !(form.tailles || []).includes(newTaille)) {
      setForm({ ...form, tailles: [...(form.tailles || []), newTaille] });
      setNewTaille('');
    }
  }

  function removeTaille(t: string) {
    setForm({ ...form, tailles: (form.tailles || []).filter(x => x !== t) });
  }

  function addMesure() {
    if (newMesure.nom) {
      setForm({ ...form, mesures: [...(form.mesures || []), { ...newMesure }] });
      setNewMesure({ nom: '', valeur: 0 });
    }
  }

  function removeMesure(idx: number) {
    setForm({ ...form, mesures: (form.mesures || []).filter((_, i) => i !== idx) });
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

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(f => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
            {/* Photo Banner */}
            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
              {f.photo ? (
                <img src={f.photo} alt={f.modele} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <Camera className="w-10 h-10 mb-2" />
                  <span className="text-xs">Pas de photo</span>
                </div>
              )}
              {/* Overlay badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {f.type && <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-slate-700 text-xs font-semibold rounded-full shadow-sm">{f.type}</span>}
              </div>
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button onClick={() => openEdit(f)} className="p-1.5 bg-white/90 backdrop-blur text-slate-500 hover:text-indigo-600 rounded-lg shadow-sm transition">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(f.id)} className="p-1.5 bg-white/90 backdrop-blur text-slate-500 hover:text-red-600 rounded-lg shadow-sm transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Patronage badge */}
              {f.patronagePhoto && (
                <div className="absolute bottom-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-indigo-600/90 backdrop-blur text-white text-[10px] font-semibold rounded-full">
                    <FileText className="w-3 h-3" /> Patron
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="mb-3">
                <h3 className="font-bold text-slate-800 text-base leading-tight">{f.modele}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{f.client}</p>
              </div>

              {f.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{f.description}</p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-700">{f.tissuConsommation}m</span>
                  <span className="text-xs text-slate-400">/pièce</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-700">{f.mesures.length}</span>
                  <span className="text-xs text-slate-400">mesures</span>
                </div>
              </div>

              {/* Tailles */}
              {f.tailles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tailles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.tailles.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mesures preview */}
              {f.mesures.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mesures</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {f.mesures.slice(0, 4).map((m, i) => (
                      <div key={i} className="text-xs bg-slate-50 rounded-lg px-3 py-2 flex justify-between">
                        <span className="text-slate-500">{m.nom}</span>
                        <span className="font-semibold text-slate-700">{m.valeur}cm</span>
                      </div>
                    ))}
                    {f.mesures.length > 4 && (
                      <div className="text-xs bg-slate-50 rounded-lg px-3 py-2 text-slate-400 text-center col-span-2">
                        +{f.mesures.length - 4} autres mesures
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier' : 'Nouvelle'} Fiche Technique</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload Area */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Photo du Modèle</label>
                  <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group hover:border-indigo-400 transition-colors">
                    {form.photo ? (
                      <>
                        <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setForm({ ...form, photo: undefined })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        <Camera className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-[10px] font-medium text-slate-400 uppercase">Ajouter Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'photo')} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Patronage (PDF/DXF/Image)</label>
                  <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group hover:border-indigo-400 transition-colors">
                    {form.patronagePhoto ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        {form.patronagePhoto.startsWith('data:image/') ? (
                          <img src={form.patronagePhoto} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-indigo-600">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-[10px] font-bold text-center break-all">{form.patronageFileName}</span>
                          </div>
                        )}
                        <button 
                          onClick={() => setForm({ ...form, patronagePhoto: undefined, patronageFileName: undefined })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        <FileText className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-[10px] font-medium text-slate-400 uppercase">Ajouter PDF/DXF</span>
                        <input type="file" accept=".pdf,.dxf,image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'patronagePhoto')} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Modèle *</label>
                  <input value={form.modele || ''} onChange={e => setForm({ ...form, modele: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <input value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Client *</label>
                <input value={form.client || ''} onChange={e => setForm({ ...form, client: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Consommation tissu (mètres/pièce)</label>
                <input type="number" step="0.1" value={form.tissuConsommation || 0} onChange={e => setForm({ ...form, tissuConsommation: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              {/* Tailles */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tailles disponibles</label>
                <div className="flex gap-2 mb-2">
                  <input value={newTaille} onChange={e => setNewTaille(e.target.value)}
                    placeholder="Ex: M, L, XL" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <button onClick={addTaille} className="px-3 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 transition">Ajouter</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(form.tailles || []).map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                      {t}
                      <button onClick={() => removeTaille(t)} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Mesures */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mesures (Patronage)</label>
                <div className="flex gap-2 mb-2">
                  <input value={newMesure.nom} onChange={e => setNewMesure({ ...newMesure, nom: e.target.value })}
                    placeholder="Nom (ex: Longueur)" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input type="number" value={newMesure.valeur || ''} onChange={e => setNewMesure({ ...newMesure, valeur: parseFloat(e.target.value) || 0 })}
                    placeholder="cm" className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <button onClick={addMesure} className="px-3 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 transition">Ajouter</button>
                </div>
                <div className="space-y-1.5">
                  {(form.mesures || []).map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg text-sm">
                      <span className="text-slate-600">{m.nom}: <strong>{m.valeur} cm</strong></span>
                      <button onClick={() => removeMesure(i)} className="text-slate-400 hover:text-red-500">×</button>
                    </div>
                  ))}
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
