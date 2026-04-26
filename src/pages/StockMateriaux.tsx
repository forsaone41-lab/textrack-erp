import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, TriangleAlert, Package, Layers, MapPin, User, Tag, Coins, Calendar } from 'lucide-react';
import { StockTissu, StockFourniture, loadData, saveRecord, deleteRecord, genId } from '../types';

type Tab = 'tissus' | 'fournitures';

// ─── Helpers ────────────────────────────────────────────────
function getTissuStatut(t: StockTissu): 'disponible' | 'alerte' | 'epuise' {
  if (t.metrage === 0) return 'epuise';
  if (t.metrage <= t.seuilAlerte) return 'alerte';
  return 'disponible';
}

function getFourniStatut(f: StockFourniture): 'normal' | 'alerte' | 'rupture' {
  if (f.quantite === 0) return 'rupture';
  if (f.stockMin && f.quantite <= f.stockMin) return 'alerte';
  return 'normal';
}

function getTissuRef(t: StockTissu) {
  return t.reference ?? `TIS-${t.couleur.substring(0, 3).toUpperCase()}-${t.id.substring(0, 3).toUpperCase()}`;
}

function getFourniRef(f: StockFourniture) {
  return f.reference ?? `FOU-${f.categorie.substring(0, 3).toUpperCase()}-${f.id.substring(0, 3).toUpperCase()}`;
}

const FOURNI_ICONS: Record<string, string> = {
  boutons: '🔘', fermetures: '🔗', fil: '🧵',
  étiquettes: '🏷️', élastiques: '🔄', autre: '📦',
};

const STATUT_TISSU_STYLE = {
  disponible: { label: 'Disponible', cls: 'bg-green-100 text-green-700', border: 'border-t-green-500' },
  alerte: { label: 'Alerte', cls: 'bg-amber-100 text-amber-700', border: 'border-t-amber-500' },
  epuise: { label: 'Épuisé', cls: 'bg-red-100 text-red-700', border: 'border-t-red-500' },
};

const STATUT_FOURNI_STYLE = {
  normal: { label: 'Normal', cls: 'bg-green-100 text-green-700' },
  alerte: { label: 'Alerte', cls: 'bg-amber-100 text-amber-700' },
  rupture: { label: 'Rupture', cls: 'bg-red-100 text-red-700' },
};

// ─── Component ──────────────────────────────────────────────
export default function StockMateriaux() {
  const [tab, setTab] = useState<Tab>('tissus');
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [fournitures, setFournitures] = useState<StockFourniture[]>([]);
  const [search, setSearch] = useState('');
  const [filterTissu, setFilterTissu] = useState('tous');
  const [filterCat, setFilterCat] = useState('tous');
  const [filterFourni, setFilterFourni] = useState('tous');

  const [showTModal, setShowTModal] = useState(false);
  const [editTId, setEditTId] = useState<string | null>(null);
  const [tForm, setTForm] = useState<Partial<StockTissu>>({});

  const [showFModal, setShowFModal] = useState(false);
  const [editFId, setEditFId] = useState<string | null>(null);
  const [fForm, setFForm] = useState<Partial<StockFourniture>>({});

  useEffect(() => {
    Promise.all([
      loadData<StockTissu>('tissus'),
      loadData<StockFourniture>('fournitures')
    ]).then(([tiss, four]) => {
      setTissus(tiss);
      setFournitures(four);
    });
  }, []);

  // ─── KPIs ───
  const totalM = tissus.reduce((a, t) => a + t.metrage, 0);
  const valeurT = tissus.reduce((a, t) => a + t.metrage * t.prixMetre, 0);
  const alertesT = tissus.filter(t => getTissuStatut(t) === 'alerte').length;
  const epuisesT = tissus.filter(t => getTissuStatut(t) === 'epuise').length;

  const valeurF = fournitures.reduce((a, f) => a + f.quantite * f.prixUnitaire, 0);
  const alertesF = fournitures.filter(f => getFourniStatut(f) === 'alerte').length;
  const rupturesF = fournitures.filter(f => getFourniStatut(f) === 'rupture').length;
  const urgentsF = fournitures.filter(f => getFourniStatut(f) !== 'normal');

  // ─── Filters ───
  const filteredTissus = tissus.filter(t => {
    const q = search.toLowerCase();
    const matchS = `${t.type} ${t.couleur} ${t.fournisseur ?? ''} ${getTissuRef(t)}`.toLowerCase().includes(q);
    const matchF = filterTissu === 'tous' || getTissuStatut(t) === filterTissu;
    return matchS && matchF;
  });

  const categories = ['tous', ...Array.from(new Set(fournitures.map(f => f.categorie)))];
  const filteredFourni = fournitures.filter(f => {
    const q = search.toLowerCase();
    const matchS = `${f.nom} ${f.fournisseur ?? ''} ${getFourniRef(f)}`.toLowerCase().includes(q);
    const matchC = filterCat === 'tous' || f.categorie === filterCat;
    const matchF = filterFourni === 'tous' || getFourniStatut(f) === filterFourni;
    return matchS && matchC && matchF;
  });

  // ─── Tissu CRUD ───
  async function saveTissu() {
    if (!tForm.type || !tForm.couleur) return;
    const item: StockTissu = {
      id: editTId ?? genId(),
      type: tForm.type!, couleur: tForm.couleur!,
      metrage: tForm.metrage ?? 0, prixMetre: tForm.prixMetre ?? 0,
      seuilAlerte: tForm.seuilAlerte ?? 0,
      reference: tForm.reference, composition: tForm.composition,
      metrageTotal: tForm.metrageTotal, fournisseur: tForm.fournisseur,
      fournisseurTel: tForm.fournisseurTel,
      largeur: tForm.largeur, zone: tForm.zone,
      etagere: tForm.etagere, dateReception: tForm.dateReception,
    };
    const updated = editTId ? tissus.map(t => t.id === editTId ? item : t) : [...tissus, item];
    setTissus(updated); setShowTModal(false);
    await saveRecord('tissus', item);
  }

  async function removeTissu(id: string) {
    const u = tissus.filter(t => t.id !== id); setTissus(u);
    await deleteRecord('tissus', id);
  }

  function openCreateT() {
    setEditTId(null);
    setTForm({ type: '', couleur: '', metrage: 0, prixMetre: 0, seuilAlerte: 0, metrageTotal: 0 });
    setShowTModal(true);
  }

  function openEditT(t: StockTissu) { setEditTId(t.id); setTForm({ ...t }); setShowTModal(true); }

  // ─── Fourniture CRUD ───
  async function saveFourni() {
    if (!fForm.nom) return;
    const item: StockFourniture = {
      id: editFId ?? genId(),
      nom: fForm.nom!, categorie: fForm.categorie ?? 'autre',
      description: fForm.description ?? '', quantite: fForm.quantite ?? 0,
      prixUnitaire: fForm.prixUnitaire ?? 0, reference: fForm.reference,
      stockMin: fForm.stockMin, unite: fForm.unite ?? 'pcs',
      fournisseur: fForm.fournisseur,
    };
    const updated = editFId ? fournitures.map(f => f.id === editFId ? item : f) : [...fournitures, item];
    setFournitures(updated); setShowFModal(false);
    await saveRecord('fournitures', item);
  }

  async function removeFourni(id: string) {
    const u = fournitures.filter(f => f.id !== id); setFournitures(u);
    await deleteRecord('fournitures', id);
  }

  function openCreateF() {
    setEditFId(null);
    setFForm({ nom: '', categorie: 'autre', description: '', quantite: 0, prixUnitaire: 0, stockMin: 0, unite: 'pcs' });
    setShowFModal(true);
  }

  function openEditF(f: StockFourniture) { setEditFId(f.id); setFForm({ ...f }); setShowFModal(true); }

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Tab Nav */}
      <div className="flex gap-2">
        <button onClick={() => { setTab('tissus'); setSearch(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === 'tissus' ? 'bg-indigo-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Layers className="w-4 h-4" /> Rouleaux de Tissu
          {alertesT + epuisesT > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{alertesT + epuisesT}</span>}
        </button>
        <button onClick={() => { setTab('fournitures'); setSearch(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === 'fournitures' ? 'bg-indigo-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Package className="w-4 h-4" /> Fournitures
          {alertesF + rupturesF > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{alertesF + rupturesF}</span>}
        </button>
      </div>

      {/* ════════════ TISSUS ════════════ */}
      {tab === 'tissus' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Stock — Rouleaux de Tissu</h1>
              <p className="text-sm text-slate-400">{tissus.length} rouleaux enregistrés</p>
            </div>
            <button onClick={openCreateT}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow">
              <Plus className="w-4 h-4" /> Nouveau Rouleau
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Mètres Disponibles', value: `${totalM.toLocaleString()} m`, cls: 'text-indigo-600' },
              { label: 'Valeur en Stock', value: `${valeurT.toLocaleString()} MAD`, cls: 'text-indigo-600' },
              { label: 'Alertes Stock', value: alertesT, cls: alertesT > 0 ? 'text-amber-500' : 'text-slate-400' },
              { label: 'Rouleaux Épuisés', value: epuisesT, cls: epuisesT > 0 ? 'text-red-600' : 'text-slate-400' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className={`text-2xl font-bold ${k.cls}`}>{k.value}</p>
                <p className="text-xs text-slate-400 mt-1">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher par référence, couleur, fournisseur..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2">
              {['tous', 'disponible', 'alerte', 'epuise'].map(f => (
                <button key={f} onClick={() => setFilterTissu(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition ${filterTissu === f ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {f === 'tous' ? 'Tous' : f === 'epuise' ? 'Épuisé' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTissus.map(t => {
              const statut = getTissuStatut(t);
              const st = STATUT_TISSU_STYLE[statut];
              const pct = t.metrageTotal ? Math.min(100, Math.round((t.metrage / t.metrageTotal) * 100)) : null;
              const barColor = statut === 'disponible' ? 'bg-green-500' : statut === 'alerte' ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={t.id} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-4 ${st.border}`}>
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono mb-0.5">{getTissuRef(t)}</p>
                        <h3 className="font-bold text-slate-800 text-base">{t.couleur}</h3>
                        <p className="text-xs text-slate-400">{t.composition ?? t.type}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                          {statut === 'alerte' && <TriangleAlert className="w-3 h-3 inline mr-0.5" />}
                          {st.label}
                        </span>
                        <button onClick={() => openEditT(t)} className="p-1 text-slate-300 hover:text-indigo-500 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => removeTissu(t.id)} className="p-1 text-slate-300 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold">{t.metrage} m restants</span>
                        {t.metrageTotal && <span className="text-slate-400">/ {t.metrageTotal} m</span>}
                      </div>
                      {pct !== null && (
                        <>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{pct}% disponible</p>
                        </>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 gap-y-2 mb-4 bg-slate-50/30 p-2.5 rounded-lg border border-slate-100">
                      {t.fournisseur && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-600 font-medium">{t.fournisseur}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs font-semibold text-indigo-600">{t.prixMetre} MAD</p>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <p className="text-xs font-medium text-slate-700">{(t.metrage * t.prixMetre).toLocaleString()} MAD</p>
                          <Coins className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                      {(t.zone || t.etagere) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {[t.zone, t.etagere].filter(Boolean).join(' – ')}
                        </span>
                      )}
                      {t.dateReception && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.dateReception}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTissus.length === 0 && (
            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun rouleau trouvé</p>
            </div>
          )}
        </>
      )}

      {/* ════════════ FOURNITURES ════════════ */}
      {tab === 'fournitures' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Stock — Fournitures</h1>
              <p className="text-sm text-slate-400">{fournitures.length} articles enregistrés</p>
            </div>
            <button onClick={openCreateF}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow">
              <Plus className="w-4 h-4" /> Nouvel Article
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Articles', value: fournitures.length, cls: 'text-indigo-600' },
              { label: 'Valeur Stock', value: `${valeurF.toLocaleString()} MAD`, cls: 'text-indigo-600' },
              { label: 'En Alerte', value: alertesF, cls: alertesF > 0 ? 'text-amber-500' : 'text-slate-400' },
              { label: 'Rupture de Stock', value: rupturesF, cls: rupturesF > 0 ? 'text-red-600' : 'text-slate-400' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className={`text-2xl font-bold ${k.cls}`}>{k.value}</p>
                <p className="text-xs text-slate-400 mt-1">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Alert banner */}
          {urgentsF.length > 0 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
              <TriangleAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{urgentsF.length} article(s) nécessitent un réapprovisionnement urgent</p>
                <p className="text-xs text-red-500 mt-0.5">{urgentsF.map(f => f.nom).join(' · ')}</p>
              </div>
            </div>
          )}

          {/* Search + Filters */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Rechercher une fourniture..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${filterCat === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {c === 'tous' ? 'Tous' : `${FOURNI_ICONS[c] ?? ''} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                {['tous', 'normal', 'alerte', 'rupture'].map(f => (
                  <button key={f} onClick={() => setFilterFourni(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${filterFourni === f ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {f === 'tous' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Article</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Catégorie</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stock actuel</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stock min.</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-32">Niveau</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Prix unit.</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Valeur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fournisseur</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFourni.map(f => {
                  const statut = getFourniStatut(f);
                  const st = STATUT_FOURNI_STYLE[statut];
                  const pct = f.stockMin && f.stockMin > 0 ? Math.min(100, Math.round((f.quantite / (f.stockMin * 3)) * 100)) : f.quantite > 0 ? 100 : 0;
                  const barColor = statut === 'normal' ? 'bg-green-500' : statut === 'alerte' ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <tr key={f.id} className={`hover:bg-slate-50 transition-colors ${statut === 'rupture' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{FOURNI_ICONS[f.categorie] ?? '📦'}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{f.nom}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{getFourniRef(f)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 capitalize">{f.categorie.replace('é', 'e').charAt(0).toUpperCase() + f.categorie.slice(1)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-slate-800">{f.quantite.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 ml-1">{f.unite ?? 'pcs'}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-500">
                        {f.stockMin ? <>{f.stockMin.toLocaleString()} <span className="text-xs text-slate-400">{f.unite ?? 'pcs'}</span></> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-indigo-600">{f.prixUnitaire} MAD</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{(f.quantite * f.prixUnitaire).toLocaleString()} MAD</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{f.fournisseur ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditF(f)} className="p-1 text-slate-300 hover:text-indigo-500 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => removeFourni(f.id)} className="p-1 text-slate-300 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredFourni.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune fourniture trouvée</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════ MODAL TISSU ════════════ */}
      {showTModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editTId ? 'Modifier' : 'Nouveau'} Rouleau de Tissu</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type / Matière *</label>
                <input 
                  list="tissu-types"
                  value={tForm.type ?? ''} 
                  onChange={e => setTForm({ ...tForm, type: e.target.value })}
                  placeholder="ex: Coton, Soie..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
                <datalist id="tissu-types">
                  {['Coton', 'Satin', 'Soie', 'Polyester', 'Lin', 'Viscose', 'Denim', 'Velours', 'Jersey', 'Crepe', 'Popeline', 'Lycra'].map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Couleur / Nom *</label>
                <input 
                  list="tissu-couleurs"
                  value={tForm.couleur ?? ''} 
                  onChange={e => setTForm({ ...tForm, couleur: e.target.value })}
                  placeholder="ex: Bleu Marine"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
                <datalist id="tissu-couleurs">
                  {['Noir', 'Blanc', 'Bleu Marine', 'Rouge', 'Vert', 'Gris', 'Beige', 'Rose', 'Jaune', 'Bordeaux', 'Ciel', 'Marron', 'Kaki', 'Argent', 'Or'].map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Composition</label>
                <input 
                  list="tissu-compo"
                  value={tForm.composition ?? ''} 
                  onChange={e => setTForm({ ...tForm, composition: e.target.value })}
                  placeholder="ex: 100% Coton"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
                <datalist id="tissu-compo">
                  {['100% Coton', '100% Polyester', '100% Soie', '50% Coton 50% Poly', '95% Coton 5% Elasthanne', '80% Coton 20% Polyester', 'Microfibre'].map(cp => (
                    <option key={cp} value={cp} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Référence</label>
                <input value={tForm.reference ?? ''} onChange={e => setTForm({ ...tForm, reference: e.target.value })}
                  placeholder="Auto si vide"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              {[
                { label: 'Métrage actuel (m) *', key: 'metrage', type: 'number' },
                { label: 'Métrage total (m)', key: 'metrageTotal', type: 'number' },
                { label: 'Prix/mètre (MAD)', key: 'prixMetre', type: 'number' },
                { label: 'Seuil alerte (m)', key: 'seuilAlerte', type: 'number' },
                { label: 'Largeur (cm)', key: 'largeur', type: 'number' },
                { label: 'Fournisseur', key: 'fournisseur', type: 'text' },
                { label: 'Téléphone Fournisseur', key: 'fournisseurTel', type: 'text' },
                { label: 'Zone', key: 'zone', type: 'text' },
                { label: 'Étagère', key: 'etagere', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input type={type} value={(tForm as any)[key] ?? ''} onChange={e => setTForm({ ...tForm, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Date réception</label>
                <input type="date" value={tForm.dateReception ?? ''} onChange={e => setTForm({ ...tForm, dateReception: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowTModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Annuler</button>
              <button onClick={saveTissu} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                {editTId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ MODAL FOURNITURE ════════════ */}
      {showFModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editFId ? 'Modifier' : 'Nouvel'} Article Fourniture</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
                <input value={fForm.nom ?? ''} onChange={e => setFForm({ ...fForm, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Catégorie</label>
                  <select value={fForm.categorie ?? 'autre'} onChange={e => setFForm({ ...fForm, categorie: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {['boutons', 'fermetures', 'fil', 'étiquettes', 'élastiques', 'autre'].map(c => (
                      <option key={c} value={c}>{FOURNI_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unité</label>
                  <select value={fForm.unite ?? 'pcs'} onChange={e => setFForm({ ...fForm, unite: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {['pcs', 'm', 'bobine', 'kg', 'boîte', 'rouleau'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Stock actuel *', key: 'quantite' },
                  { label: 'Stock minimum', key: 'stockMin' },
                  { label: 'Prix unitaire (MAD)', key: 'prixUnitaire' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input type="number" value={(fForm as any)[key] ?? ''} onChange={e => setFForm({ ...fForm, [key]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Référence</label>
                  <input value={fForm.reference ?? ''} onChange={e => setFForm({ ...fForm, reference: e.target.value })}
                    placeholder="Auto si vide"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fournisseur</label>
                <input value={fForm.fournisseur ?? ''} onChange={e => setFForm({ ...fForm, fournisseur: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={fForm.description ?? ''} onChange={e => setFForm({ ...fForm, description: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowFModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Annuler</button>
              <button onClick={saveFourni} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                {editFId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
