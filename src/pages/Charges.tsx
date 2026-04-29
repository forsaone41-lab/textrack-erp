import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, TrendingDown, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Charge,
  ChargeCategorie,
  CATEGORIE_LABELS,
  CATEGORIE_COLORS,
  loadData,
  saveRecord,
  deleteRecord,
  genId,
} from '../types';
import { useLang } from '../contexts/LangContext';

const CATEGORIE_LABELS_AR: Record<string, string> = {
  salaires: "الرواتب واليد العاملة",
  achats_matieres: 'شراء المواد الأولية',
  loyer: 'الكراء والواجبات الكرائية',
  electricite: 'الكهرباء',
  eau: 'الماء',
  telephone: 'الهاتف والإنترنت',
  transport: 'النقل والتوصيل',
  maintenance: 'صيانة الآلات',
  fournitures_bureau: 'لوازم المكتب',
  assurance: 'التأمين',
  sous_traitance: 'التعاقد من الباطن',
  autre: 'أخرى',
};

const STATUT_LABEL_AR: Record<string, string> = {
  payé: 'مؤدى',
  en_attente: 'في الانتظار',
  impayé: 'غير مؤدى',
};

const RECURRENCE_LABEL_AR: Record<string, string> = {
  mensuel: 'شهري',
  annuel: 'سنوي',
  ponctuel: 'استثنائي',
};

const CATEGORIES: ChargeCategorie[] = [
  'salaires', 'achats_matieres', 'loyer', 'electricite', 'eau', 'telephone',
  'transport', 'maintenance', 'fournitures_bureau', 'assurance', 'sous_traitance', 'autre',
];


const CATEGORIE_BADGE: Record<ChargeCategorie, string> = {
  salaires: 'bg-indigo-100 text-indigo-700',
  achats_matieres: 'bg-emerald-100 text-emerald-700',
  loyer: 'bg-amber-100 text-amber-700',
  electricite: 'bg-orange-100 text-orange-700',
  eau: 'bg-blue-100 text-blue-700',
  telephone: 'bg-violet-100 text-violet-700',
  transport: 'bg-indigo-100 text-indigo-700',
  maintenance: 'bg-red-100 text-red-700',
  fournitures_bureau: 'bg-cyan-100 text-cyan-700',
  assurance: 'bg-pink-100 text-pink-700',
  sous_traitance: 'bg-lime-100 text-lime-700',
  autre: 'bg-slate-100 text-slate-600',
};

const STATUT_BADGE: Record<string, string> = {
  payé: 'bg-green-100 text-green-700',
  en_attente: 'bg-amber-100 text-amber-700',
  impayé: 'bg-red-100 text-red-700',
};

const STATUT_LABEL: Record<string, string> = {
  payé: 'Payé',
  en_attente: 'En attente',
  impayé: 'Impayé',
};

const RECURRENCE_LABEL: Record<string, string> = {
  mensuel: 'Mensuel',
  annuel: 'Annuel',
  ponctuel: 'Ponctuel',
};

export default function Charges() {
  const { isAr } = useLang();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategorie, setFilterCategorie] = useState<string>('all');
  const [filterMois, setFilterMois] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Charge>>({});

  useEffect(() => {
    loadData<Charge>('charges').then(setCharges);
  }, []);

  const availableMois = useMemo(() => {
    return [...new Set(charges.map(c => c.date.substring(0, 7)))].sort().reverse();
  }, [charges]);

  const filtered = charges.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.designation.toLowerCase().includes(q) || (c.fournisseur || '').toLowerCase().includes(q);
    const matchCategorie = filterCategorie === 'all' || c.categorie === filterCategorie;
    const matchMois = filterMois === 'all' || c.date.startsWith(filterMois);
    const matchStatut = filterStatut === 'all' || c.statut === filterStatut;
    return matchSearch && matchCategorie && matchMois && matchStatut;
  });

  const totalFiltered = filtered.reduce((a, c) => a + c.montant, 0);
  const totalPaye = filtered.filter(c => c.statut === 'payé').reduce((a, c) => a + c.montant, 0);
  const totalEnAttente = filtered.filter(c => c.statut === 'en_attente').reduce((a, c) => a + c.montant, 0);
  const totalImpaye = filtered.filter(c => c.statut === 'impayé').reduce((a, c) => a + c.montant, 0);

  const pieData = useMemo(() => {
    const byCategorie: Record<string, number> = {};
    filtered.forEach(c => {
      byCategorie[c.categorie] = (byCategorie[c.categorie] || 0) + c.montant;
    });
    return Object.entries(byCategorie)
      .map(([key, value]) => ({
        name: CATEGORIE_LABELS[key as ChargeCategorie],
        value,
        color: CATEGORIE_COLORS[key as ChargeCategorie],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const barData = useMemo(() => {
    const byMois: Record<string, number> = {};
    charges.forEach(c => {
      const m = c.date.substring(0, 7);
      byMois[m] = (byMois[m] || 0) + c.montant;
    });
    return Object.entries(byMois)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mois, total]) => ({
        mois: new Date(mois + '-01').toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { month: 'short', year: '2-digit' }),
        total,
      }));
  }, [charges, isAr]);

  function openCreate() {
    setEditId(null);
    setForm({
      designation: '',
      categorie: 'autre',
      montant: 0,
      date: new Date().toISOString().split('T')[0],
      statut: 'en_attente',
      recurrence: 'mensuel',
      fournisseur: '',
      notes: '',
    });
    setShowModal(true);
  }

  function openEdit(c: Charge) {
    setEditId(c.id);
    setForm({ ...c });
    setShowModal(true);
  }

  async function save() {
    if (!form.designation || !form.montant) return;
    const isNew = !editId;
    const chargeId = editId || genId();
    const chargeData = { id: chargeId, ...form } as Charge;

    let updated: Charge[];
    if (isNew) {
      updated = [...charges, chargeData];
    } else {
      updated = charges.map(c => (c.id === editId ? chargeData : c));
    }

    setCharges(updated);
    setShowModal(false);

    await saveRecord('charges', chargeData);
  }

  async function remove(id: string) {
    const updated = charges.filter(c => c.id !== id);
    setCharges(updated);
    await deleteRecord('charges', id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h1 className="text-2xl font-bold text-slate-800">{isAr ? 'المصاريف والتكاليف' : 'Charges & Dépenses'}</h1>
          <p className="text-slate-500 text-sm">{isAr ? 'إدارة التكاليف التشغيلية للمعمل' : "Gestion des charges d'exploitation de l'atelier"}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> {isAr ? 'إضافة مصاريف' : 'Nouvelle Charge'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`bg-white rounded-xl border border-slate-200 p-4 ${isAr ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500">{isAr ? 'إجمالي المصاريف' : 'Total charges'}</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{totalFiltered.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">{isAr ? 'درهم' : 'MAD'}</p>
        </div>
        <div className={`bg-green-50 rounded-xl border border-green-200 p-4 ${isAr ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-green-600">{isAr ? 'مؤدى' : 'Payé'}</p>
          </div>
          <p className="text-2xl font-bold text-green-700 tabular-nums">{totalPaye.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-0.5">{isAr ? 'درهم' : 'MAD'}</p>
        </div>
        <div className={`bg-amber-50 rounded-xl border border-amber-200 p-4 ${isAr ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs text-amber-600">{isAr ? 'في الانتظار' : 'En attente'}</p>
          </div>
          <p className="text-2xl font-bold text-amber-700 tabular-nums">{totalEnAttente.toLocaleString()}</p>
          <p className="text-xs text-amber-400 mt-0.5">{isAr ? 'درهم' : 'MAD'}</p>
        </div>
        <div className={`bg-red-50 rounded-xl border border-red-200 p-4 ${isAr ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xs text-red-600">{isAr ? 'غير مؤدى' : 'Impayé'}</p>
          </div>
          <p className="text-2xl font-bold text-red-700 tabular-nums">{totalImpaye.toLocaleString()}</p>
          <p className="text-xs text-red-400 mt-0.5">{isAr ? 'درهم' : 'MAD'}</p>
        </div>
      </div>

      {/* Charts */}
      {charges.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`bg-white rounded-xl border border-slate-200 p-5 ${isAr ? 'text-right' : ''}`}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">{isAr ? 'التوزيع حسب الفئة' : 'Répartition par catégorie'}</h3>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="45%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} MAD`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {pieData.slice(0, 7).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs gap-2">
                      <div className={`flex items-center gap-1.5 min-w-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-600 truncate">{isAr ? CATEGORIE_LABELS_AR[pieData.find(d => d.name === entry.name)?.name || 'autre'] || entry.name : entry.name}</span>
                      </div>
                      <span className="font-medium text-slate-700 flex-shrink-0 tabular-nums">{entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm py-8">Aucune donnée</div>
            )}
          </div>

          <div className={`bg-white rounded-xl border border-slate-200 p-5 ${isAr ? 'text-right' : ''}`}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">{isAr ? 'التطور الشهري للمصاريف' : 'Évolution mensuelle des charges'}</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} MAD`, 'Total']} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-sm py-8">Aucune donnée</div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
            type="text"
            placeholder={isAr ? 'بحث عن التسمية أو المورد...' : "Rechercher désignation, fournisseur..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none`}
            dir={isAr ? 'rtl' : 'ltr'}
          />
        </div>
        <select
          value={filterMois}
          onChange={e => setFilterMois(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">{isAr ? 'كل الشهور' : 'Tous les mois'}</option>
          {availableMois.map(m => (
            <option key={m} value={m}>
              {new Date(m + '-01').toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
        <select
          value={filterCategorie}
          onChange={e => setFilterCategorie(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">{isAr ? 'كل الفئات' : 'Toutes catégories'}</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{isAr ? CATEGORIE_LABELS_AR[c] : CATEGORIE_LABELS[c]}</option>
          ))}
        </select>
        <select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">{isAr ? 'كل الحالات' : 'Tous les statuts'}</option>
          <option value="payé">{isAr ? 'مؤدى' : 'Payé'}</option>
          <option value="en_attente">{isAr ? 'في الانتظار' : 'En attente'}</option>
          <option value="impayé">{isAr ? 'غير مؤدى' : 'Impayé'}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className={`text-xs font-semibold text-slate-500 uppercase px-5 py-3 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'التاريخ' : 'Date'}</th>
              <th className={`text-xs font-semibold text-slate-500 uppercase px-5 py-3 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'التسمية' : 'Désignation'}</th>
              <th className={`text-xs font-semibold text-slate-500 uppercase px-5 py-3 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الفئة' : 'Catégorie'}</th>
              <th className={`text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden md:table-cell ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المورد' : 'Fournisseur'}</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3 hidden sm:table-cell">{isAr ? 'التكرار' : 'Récurrence'}</th>
              <th className={`text-xs font-semibold text-slate-500 uppercase px-5 py-3 ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'المبلغ' : 'Montant'}</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">{isAr ? 'الحالة' : 'Statut'}</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className={`px-5 py-3 text-sm text-slate-500 whitespace-nowrap ${isAr ? 'text-right' : ''}`}>{c.date}</td>
                <td className={`px-5 py-3 ${isAr ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-slate-700">{c.designation}</p>
                  {c.notes && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{c.notes}</p>}
                </td>
                <td className={`px-5 py-3 ${isAr ? 'text-right' : ''}`}>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${CATEGORIE_BADGE[c.categorie]}`}>
                    {isAr ? CATEGORIE_LABELS_AR[c.categorie] : CATEGORIE_LABELS[c.categorie]}
                  </span>
                </td>
                <td className={`px-5 py-3 text-sm text-slate-500 hidden md:table-cell ${isAr ? 'text-right' : ''}`}>{c.fournisseur || '—'}</td>
                <td className="px-5 py-3 text-center text-xs text-slate-400 hidden sm:table-cell">{isAr ? RECURRENCE_LABEL_AR[c.recurrence] : RECURRENCE_LABEL[c.recurrence]}</td>
                <td className={`px-5 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap tabular-nums ${isAr ? 'text-left' : 'text-right'}`}>
                  {c.montant.toLocaleString()} {isAr ? 'درهم' : 'MAD'}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUT_BADGE[c.statut]}`}>
                    {isAr ? STATUT_LABEL_AR[c.statut] : STATUT_LABEL[c.statut]}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>{isAr ? 'لم يتم العثور على أي مصاريف' : 'Aucune charge trouvée'}</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className={`p-6 border-b border-slate-100 ${isAr ? 'text-right' : ''}`}>
              <h2 className="text-lg font-bold text-slate-800">
                {editId ? (isAr ? 'تعديل المصاريف' : 'Modifier la charge') : (isAr ? 'مصاريف جديدة' : 'Nouvelle Charge')}
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'التسمية *' : 'Désignation *'}</label>
                <input
                  value={form.designation || ''}
                  onChange={e => setForm({ ...form, designation: e.target.value })}
                  placeholder={isAr ? 'مثال: كراء المعمل لشهر مارس' : "Ex: Loyer atelier mois de Mars"}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isAr ? 'text-right' : ''}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'الفئة *' : 'Catégorie *'}</label>
                  <select
                    value={form.categorie || 'autre'}
                    onChange={e => setForm({ ...form, categorie: e.target.value as ChargeCategorie })}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isAr ? 'text-right' : ''}`}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{isAr ? CATEGORIE_LABELS_AR[c] : CATEGORIE_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'المبلغ (درهم) *' : 'Montant (MAD) *'}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.montant || ''}
                    onChange={e => setForm({ ...form, montant: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isAr ? 'text-right' : ''}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'التاريخ *' : 'Date *'}</label>
                  <input
                    type="date"
                    value={form.date || ''}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isAr ? 'text-right' : ''}`}
                  />
                </div>
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'التكرار' : 'Récurrence'}</label>
                  <select
                    value={form.recurrence || 'mensuel'}
                    onChange={e => setForm({ ...form, recurrence: e.target.value as Charge['recurrence'] })}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isAr ? 'text-right' : ''}`}
                  >
                    <option value="mensuel">{isAr ? 'شهري' : 'Mensuel'}</option>
                    <option value="annuel">{isAr ? 'سنوي' : 'Annuel'}</option>
                    <option value="ponctuel">{isAr ? 'استثنائي' : 'Ponctuel'}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'الحالة' : 'Statut'}</label>
                  <select
                    value={form.statut || 'en_attente'}
                    onChange={e => setForm({ ...form, statut: e.target.value as Charge['statut'] })}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isAr ? 'text-right' : ''}`}
                  >
                    <option value="en_attente">{isAr ? 'في الانتظار' : 'En attente'}</option>
                    <option value="payé">{isAr ? 'مؤدى' : 'Payé'}</option>
                    <option value="impayé">{isAr ? 'غير مؤدى' : 'Impayé'}</option>
                  </select>
                </div>
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'المورد' : 'Fournisseur'}</label>
                  <input
                    value={form.fournisseur || ''}
                    onChange={e => setForm({ ...form, fournisseur: e.target.value })}
                    placeholder={isAr ? 'اختياري' : "Optionnel"}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isAr ? 'text-right' : ''}`}
                  />
                </div>
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{isAr ? 'ملاحظات' : 'Notes'}</label>
                <textarea
                  value={form.notes || ''}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder={isAr ? 'ملاحظات إضافية...' : "Notes complémentaires..."}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${isAr ? 'text-right' : ''}`}
                />
              </div>
            </div>
            <div className={`p-6 border-t border-slate-100 flex justify-end gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={save}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                {editId ? (isAr ? 'تعديل' : 'Modifier') : (isAr ? 'حفظ' : 'Enregistrer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
