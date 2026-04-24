import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors } from 'lucide-react';
import { OrdreDeCoupe, StockTissu, FicheTechnique, loadData, saveRecord, deleteRecord, genId } from '../types';

export default function OrdresDeCoupe() {
  const [ordres, setOrdres] = useState<OrdreDeCoupe[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OrdreDeCoupe>>({});

  useEffect(() => { 
    Promise.all([
      loadData<OrdreDeCoupe>('ordres'),
      loadData<StockTissu>('tissus'),
      loadData<FicheTechnique>('fiches')
    ]).then(([ords, tiss, fchs]) => {
      setOrdres(ords);
      setTissus(tiss);
      setFiches(fchs);
    });
  }, []);

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
    setForm({ modele: '', quantite: 0, tissu: '', couleur: '', metrage: 0, statut: 'planifié', dateCoupe: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  }

  function openEdit(o: OrdreDeCoupe) {
    setEditId(o.id);
    setForm({ ...o });
    setShowModal(true);
  }

  async function save() {
    if (!form.modele || !form.tissu) return;

    // --- Gestion du Stock ---
    const tissuNormalise = form.tissu.trim();
    const couleurNormalisee = form.couleur?.trim() || '';
    
    // Vérifier si ce tissu (Type + Couleur) existe déjà dans le stock
    const existeDansStock = tissus.find(t => 
      t.type.toLowerCase() === tissuNormalise.toLowerCase() && 
      t.couleur.toLowerCase() === couleurNormalisee.toLowerCase()
    );

    if (!existeDansStock) {
      // Si n'existe pas, on le rajoute au stock automatiquement
      const nouveauTissu: StockTissu = {
        id: genId(),
        type: tissuNormalise,
        couleur: couleurNormalisee,
        metrage: 0, // Nouveau type, métrage initial 0 (sera alimenté par des réceptions)
        prixMetre: 0,
        seuilAlerte: 10,
        dateReception: new Date().toISOString().split('T')[0]
      };
      const updatedStock = [...tissus, nouveauTissu];
      setTissus(updatedStock);
      await saveRecord('tissus', nouveauTissu);
    }
    // -------------------------

    const isNew = !editId;
    const oId = editId || genId();
    const ordreData = { id: oId, ...form } as OrdreDeCoupe;
    if (!ordreData.commandeId) ordreData.commandeId = null;

    const updated = isNew
      ? [...ordres, ordreData]
      : ordres.map(o => o.id === editId ? ordreData : o);
      
    setOrdres(updated);
    setShowModal(false);
    
    await saveRecord('ordres', ordreData);
  }

  const handleModeleChange = (val: string) => {
    setForm({ ...form, modele: val });
  };

  async function remove(id: string) {
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
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
          <Plus className="w-4 h-4" /> Nouvel Ordre
        </button>
      </div>

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
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-700">{o.modele}</span>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tissu *</label>
                  <input 
                    value={form.tissu || ''} 
                    onChange={e => setForm({ ...form, tissu: e.target.value })}
                    list="tissus-list"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                  <datalist id="tissus-list">
                    {Array.from(new Set(tissus.map(t => t.type))).map(type => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Couleur</label>
                  <input value={form.couleur || ''} onChange={e => setForm({ ...form, couleur: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantité (pièces)</label>
                  <input type="number" value={form.quantite || 0} onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Métrage (m)</label>
                  <input type="number" step="0.1" value={form.metrage || 0} onChange={e => setForm({ ...form, metrage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
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
      )}
    </div>
  );
}
