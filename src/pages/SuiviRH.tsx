import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Users, CreditCard, Banknote, Building2 } from 'lucide-react';
import { Employe, PaiementSalaire, Charge, loadData, saveRecord, deleteRecord, genId } from '../types';

const POSTES_ATELIER = [
  '— Production —',
  'Coupeur / Coupeuse',
  'Couturier / Couturière',
  'Piqueur / Piqueuse',
  'Surjeteuse',
  'Repasseur / Repasseuse',
  'Finisseur / Finisseuse',
  '— Technique —',
  'Modéliste',
  'Patronnière',
  'Mécanicien Machines',
  'Contrôle Qualité',
  '— Encadrement —',
  "Chef d'Atelier",
  'Responsable Production',
  'Responsable Qualité',
  '— Administration —',
  'Responsable RH',
  'Comptable',
  'Commercial / Commerciale',
  'Responsable Achats',
  'Directeur / Directrice',
];

const POSTES_SOUSTRAITANCE = [
  'Façonnier — Coupe',
  'Façonnier — Montage',
  'Façonnier — Finition',
  'Façonnier — Repassage',
  'Façonnier Général',
  'Atelier Sous-traitant',
  'Prestataire Broderie',
  'Prestataire Impression',
];

const DEMO_PAIEMENTS: PaiementSalaire[] = [
  { id: 'ps1', employeId: 'emp1', montant: 3200, date: '2024-03-31', mois: '2024-03', methode: 'virement', notes: 'Salaire complet Mars' },
  { id: 'ps2', employeId: 'emp2', montant: 3200, date: '2024-03-31', mois: '2024-03', methode: 'virement' },
  { id: 'ps3', employeId: 'emp3', montant: 3200, date: '2024-03-31', mois: '2024-03', methode: 'especes' },
  { id: 'ps4', employeId: 'emp4', montant: 2800, date: '2024-03-31', mois: '2024-03', methode: 'especes' },
  { id: 'ps5', employeId: 'emp5', montant: 5500, date: '2024-03-31', mois: '2024-03', methode: 'virement' },
  { id: 'ps6', employeId: 'emp6', montant: 2800, date: '2024-03-31', mois: '2024-03', methode: 'especes' },
  { id: 'ps7', employeId: 'emp1', montant: 1500, date: '2024-04-15', mois: '2024-04', methode: 'especes', notes: 'Avance salaire Avril' },
  { id: 'ps8', employeId: 'emp5', montant: 3000, date: '2024-04-15', mois: '2024-04', methode: 'virement', notes: 'Acompte Avril' },
];

const METHODE_LABELS: Record<string, string> = {
  especes: 'Espèces',
  virement: 'Virement',
  cheque: 'Chèque',
};

const METHODE_ICONS: Record<string, React.ReactNode> = {
  especes: <Banknote className="w-3.5 h-3.5" />,
  virement: <Building2 className="w-3.5 h-3.5" />,
  cheque: <CreditCard className="w-3.5 h-3.5" />,
};

export default function SuiviRH() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [paiements, setPaiements] = useState<PaiementSalaire[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMois, setSelectedMois] = useState<string>('2024-04');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Employe>>({});
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [payerEmployeId, setPayerEmployeId] = useState<string>('');
  const [payerForm, setPayerForm] = useState<{ montant: number; methode: string; notes: string }>({
    montant: 0, methode: 'especes', notes: '',
  });
  const [showHistorique, setShowHistorique] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<PaiementSalaire>('paiements_salaires')
    ]).then(([emps, stored]) => {
      setEmployes(emps);
      setPaiements(stored);
    });
  }, []);

  const availableMois = useMemo(() => {
    const months = new Set(paiements.map(p => p.mois));
    months.add(selectedMois);
    return [...months].sort().reverse();
  }, [paiements, selectedMois]);

  const filtered = employes.filter(e => {
    const fullName = `${e.prenom} ${e.nom}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) || e.poste.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;
    return matchSearch && matchType;
  });

  function getPaye(empId: string) {
    return paiements
      .filter(p => p.employeId === empId && p.mois === selectedMois)
      .reduce((a, p) => a + p.montant, 0);
  }

  function getReste(emp: Employe) {
    return Math.max(0, (emp.salaireMensuel || 0) - getPaye(emp.id));
  }

  const masseSalariale = employes
    .filter(e => e.actif && e.type === 'atelier')
    .reduce((a, e) => a + (e.salaireMensuel || 0), 0);

  const totalPayeMois = employes
    .reduce((a, e) => a + getPaye(e.id), 0);

  const totalResteMois = employes
    .filter(e => e.actif)
    .reduce((a, e) => a + getReste(e), 0);

  const atelierCount = employes.filter(e => e.type === 'atelier' && e.actif).length;
  const stCount = employes.filter(e => e.type === 'sous_traitance' && e.actif).length;

  function openCreate() {
    setEditId(null);
    setForm({ nom: '', prenom: '', poste: '', type: 'atelier', telephone: '', email: '', actif: true, salaireMensuel: 0 });
    setShowModal(true);
  }

  function openEdit(e: Employe) {
    setEditId(e.id);
    setForm({ ...e });
    setShowModal(true);
  }

  async function save() {
    if (!form.nom) return;
    const isNew = !editId;
    const eId = editId || genId();
    const empData = { id: eId, ...form } as Employe;

    const updated = isNew
      ? [...employes, empData]
      : employes.map(e => e.id === editId ? empData : e);
      
    setEmployes(updated);
    setShowModal(false);
    
    await saveRecord('employes', empData);
  }

  async function remove(id: string) {
    const updated = employes.filter(e => e.id !== id);
    setEmployes(updated);
    await deleteRecord('employes', id);
  }

  function openPayer(empId: string) {
    const emp = employes.find(e => e.id === empId);
    const reste = emp ? getReste(emp) : 0;
    setPayerEmployeId(empId);
    setPayerForm({ montant: reste, methode: 'especes', notes: '' });
    setShowPayerModal(true);
  }

  async function savePaiement() {
    const { montant, methode, notes } = payerForm;
    if (!montant || montant <= 0) return;

    const newPaiement: PaiementSalaire = {
      id: genId(),
      employeId: payerEmployeId,
      montant,
      date: new Date().toISOString().split('T')[0],
      mois: selectedMois,
      methode: methode as PaiementSalaire['methode'],
      notes: notes || undefined,
    };

    const updatedPaiements = [...paiements, newPaiement];
    setPaiements(updatedPaiements);
    setShowPayerModal(false);
    
    await saveRecord('paiements_salaires', newPaiement);

    // Créer charge automatiquement dans Charges & Dépenses
    const emp = employes.find(e => e.id === payerEmployeId);
    if (emp) {
      const moisLabel = new Date(selectedMois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const empName = emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom;
      const newCharge: Charge = {
        id: genId(),
        designation: `Salaire ${empName} — ${moisLabel}`,
        categorie: 'salaires',
        montant,
        date: newPaiement.date,
        statut: 'payé',
        recurrence: 'mensuel',
        fournisseur: empName,
        notes: notes || undefined,
      };
      await saveRecord('charges', newCharge);
    }
  }

  const moisLabel = (m: string) =>
    new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suivi RH & Façonniers</h1>
          <p className="text-slate-500 text-sm">Gestion du personnel atelier et sous-traitance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMois}
            onChange={e => setSelectedMois(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            {availableMois.map(m => (
              <option key={m} value={m}>{moisLabel(m)}</option>
            ))}
          </select>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Permanents</p>
          <p className="text-2xl font-black mt-1 text-indigo-600">{atelierCount}</p>
          <p className="text-xs text-slate-400 mt-1">Masse : {masseSalariale.toLocaleString()} MAD</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Façonniers</p>
          <p className="text-2xl font-black mt-1 text-blue-600">{stCount}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 border border-green-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payé — {moisLabel(selectedMois)}</p>
          <p className="text-2xl font-black mt-1 text-green-600">{totalPayeMois.toLocaleString()} <span className="text-sm font-normal">MAD</span></p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reste à payer</p>
          <p className="text-2xl font-black mt-1 text-amber-600">{totalResteMois.toLocaleString()} <span className="text-sm font-normal">MAD</span></p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">Tous</option>
          <option value="atelier">Atelier</option>
          <option value="sous_traitance">Sous-traitance</option>
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(e => {
          const salaire = e.salaireMensuel || 0;
          const paye = getPaye(e.id);
          const reste = getReste(e);
          const percent = salaire > 0 ? Math.min(100, Math.round((paye / salaire) * 100)) : 0;
          const payements = paiements.filter(p => p.employeId === e.id && p.mois === selectedMois);

          return (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-inner ${
                      e.type === 'atelier' ? 'bg-indigo-500' : 'bg-blue-500'
                    }`}>
                      {e.prenom ? e.prenom[0] + e.nom[0] : e.nom.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{e.prenom ? `${e.prenom} ${e.nom}` : e.nom}</h3>
                      <p className="text-xs text-slate-400 font-medium">{e.poste}</p>
                      <div className="flex gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          e.type === 'atelier' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {e.type === 'atelier' ? 'Permanent' : 'Façonnier'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          e.actif ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {e.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(e)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => remove(e.id)} className="p-1.5 text-slate-300 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50/50 p-3 rounded-xl">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">CIN</p>
                    <p className="text-xs font-semibold text-slate-700">{e.cin || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Téléphone</p>
                    <p className="text-xs font-semibold text-slate-700">{e.telephone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Banque</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{e.banque || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Salaire mensuel</p>
                    <p className="text-xs font-bold text-indigo-600">{salaire > 0 ? `${salaire.toLocaleString()} MAD` : '—'}</p>
                  </div>
                </div>

                {/* Suivi Paiements */}
                {salaire > 0 && (
                  <div className="mt-3 pt-3 border-t border-dashed border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                        Suivi Paiements — {moisLabel(selectedMois)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {payements.length > 0 && (
                          <button
                            onClick={() => setShowHistorique(showHistorique === e.id ? null : e.id)}
                            className="text-[10px] text-slate-400 hover:text-indigo-500 transition underline"
                          >
                            {payements.length} versement{payements.length > 1 ? 's' : ''}
                          </button>
                        )}
                        {reste > 0 && (
                          <button
                            onClick={() => openPayer(e.id)}
                            className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-lg font-bold hover:bg-green-100 transition border border-green-200"
                          >
                            + Payer
                          </button>
                        )}
                        {reste === 0 && (
                          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-lg font-bold border border-green-200">
                            ✓ Soldé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 bg-green-50/70 p-2 rounded-lg border border-green-100">
                        <p className="text-[9px] text-green-600 font-bold uppercase">Payé</p>
                        <p className="text-sm font-black text-green-700">{paye.toLocaleString()} MAD</p>
                      </div>
                      <div className="flex-1 bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                        <p className="text-[9px] text-amber-600 font-bold uppercase">Reste</p>
                        <p className="text-sm font-black text-amber-700">{reste.toLocaleString()} MAD</p>
                      </div>
                    </div>

                    {/* Historique versements */}
                    {showHistorique === e.id && payements.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {payements.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-2 py-1.5 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              {METHODE_ICONS[p.methode]}
                              <span>{p.date}</span>
                              {p.notes && <span className="text-slate-400 italic truncate max-w-[80px]">— {p.notes}</span>}
                            </div>
                            <span className="font-bold text-green-600">{p.montant.toLocaleString()} MAD</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun employé trouvé</p>
        </div>
      )}

      {/* Modal Ajouter/Modifier Employé */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier' : 'Ajouter'} {form.type === 'sous_traitance' ? 'Façonnier' : 'Employé'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select value={form.type || 'atelier'} onChange={e => setForm({ ...form, type: e.target.value as Employe['type'] })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="atelier">Atelier</option>
                  <option value="sous_traitance">Sous-traitance</option>
                </select>
              </div>
              {form.type === 'atelier' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Prénom</label>
                    <input value={form.prenom || ''} onChange={e => setForm({ ...form, prenom: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
                    <input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nom société *</label>
                  <input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Poste *</label>
                  <select value={form.poste || ''} onChange={e => setForm({ ...form, poste: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="">Sélectionner un poste</option>
                    {(form.type === 'sous_traitance' ? POSTES_SOUSTRAITANCE : POSTES_ATELIER).map(p => (
                      p.startsWith('—')
                        ? <option key={p} disabled className="text-slate-400 font-semibold">{p}</option>
                        : <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                  <input value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Salaire mensuel (MAD)</label>
                  <input
                    type="number" min="0"
                    value={form.salaireMensuel ?? ''}
                    onChange={e => setForm({ ...form, salaireMensuel: parseFloat(e.target.value) || 0 })}
                    placeholder="Ex: 3200"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Informations Administratives</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">CIN</label>
                    <input value={form.cin || ''} onChange={e => setForm({ ...form, cin: e.target.value })}
                      placeholder="Ex: AB123456" maxLength={10}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-wider uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Banque</label>
                    <select value={form.banque || ''} onChange={e => setForm({ ...form, banque: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                      <option value="">Sélectionner</option>
                      {['Attijariwafa Bank','CIH Bank','Banque Populaire','BMCE Bank (Bank of Africa)',
                        'BMCI','Société Générale Maroc','Crédit Agricole du Maroc','CDM (Crédit du Maroc)',
                        'Al Barid Bank','CFG Bank','Umnia Bank','BTI Bank','Dar Al Amane',
                      ].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">RIB</label>
                  <input value={form.rib || ''} onChange={e => setForm({ ...form, rib: e.target.value.replace(/\D/g, '').slice(0, 24) })}
                    placeholder="Ex: 022780000012345678901234"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-wider" />
                  {form.rib && form.rib.length > 0 && form.rib.length < 24 && (
                    <p className="text-[10px] text-amber-500 mt-1">{form.rib.length}/24 chiffres</p>
                  )}
                  {form.rib && form.rib.length === 24 && (
                    <p className="text-[10px] text-green-500 mt-1">✓ RIB complet</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Annuler</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                {editId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement Salaire */}
      {showPayerModal && (() => {
        const emp = employes.find(e => e.id === payerEmployeId);
        if (!emp) return null;
        const empName = emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom;
        const salaire = emp.salaireMensuel || 0;
        const dejaPayé = getPaye(emp.id);
        const resteMax = getReste(emp);

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Paiement Salaire</h2>
                <p className="text-sm text-slate-500 mt-0.5">{empName} — {moisLabel(selectedMois)}</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Résumé */}
                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Salaire</p>
                    <p className="text-sm font-black text-slate-700">{salaire.toLocaleString()} MAD</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-500 uppercase font-bold">Déjà payé</p>
                    <p className="text-sm font-black text-green-600">{dejaPayé.toLocaleString()} MAD</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-500 uppercase font-bold">Reste</p>
                    <p className="text-sm font-black text-amber-600">{resteMax.toLocaleString()} MAD</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Montant à payer (MAD) *</label>
                  <input
                    type="number" min="1" max={resteMax}
                    value={payerForm.montant || ''}
                    onChange={e => setPayerForm({ ...payerForm, montant: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                  />
                  {payerForm.montant > resteMax && (
                    <p className="text-[11px] text-red-500 mt-1">Dépasse le reste dû ({resteMax.toLocaleString()} MAD)</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">Méthode de paiement</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['especes', 'virement', 'cheque'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setPayerForm({ ...payerForm, methode: m })}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition ${
                          payerForm.methode === m
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {METHODE_ICONS[m]}
                        {METHODE_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optionnel)</label>
                  <input
                    value={payerForm.notes}
                    onChange={e => setPayerForm({ ...payerForm, notes: e.target.value })}
                    placeholder="Ex: Avance sur salaire..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                  Ce paiement sera automatiquement enregistré dans <strong>Charges & Dépenses</strong> (catégorie Salaires).
                </p>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setShowPayerModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
                  Annuler
                </button>
                <button
                  onClick={savePaiement}
                  disabled={!payerForm.montant || payerForm.montant <= 0 || payerForm.montant > resteMax}
                  className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
