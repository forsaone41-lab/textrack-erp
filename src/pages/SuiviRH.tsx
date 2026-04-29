import { useState, useEffect, useMemo } from 'react';
import { useLang } from '../contexts/LangContext';
import { Plus, Search, Edit2, Trash2, Users, CreditCard, DollarSign, Home, Image as ImageIcon, X, Printer, Download, File, Phone, Mail, RotateCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Employe, PaiementSalaire, Charge, Commande, loadData, genId, loadCompanyProfile, saveRecord, safeStorage } from '../types';
import { generatePDF, printElement } from '../utils/pdf';

// Local storage helpers for RH specifically to avoid Supabase schema mismatch
function getLocalRH<T>(key: string): T[] {
  try {
    const data = safeStorage.getItem(`textrack_${key}`);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveLocalRH<T>(key: string, data: T[]) {
  safeStorage.setItem(`textrack_${key}`, JSON.stringify(data));
}

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

export default function SuiviRH() {
  const { isAr } = useLang();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [paiements, setPaiements] = useState<PaiementSalaire[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMois, setSelectedMois] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Employe>>({});
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [payerEmployeId, setPayerEmployeId] = useState<string>('');
  const [payerForm, setPayerForm] = useState<{ montant: number; methode: string; notes: string }>({
    montant: 0, methode: 'especes', notes: '',
  });
  const [showHistorique, setShowHistorique] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Employe | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Bon de Travail state
  const [showBonModal, setShowBonModal] = useState(false);
  const [bonForm, setBonForm] = useState({ empId: '', cmdId: '', avance: 0, methode: 'especes' });
  const [generatedBon, setGeneratedBon] = useState<{ id: string; emp: Employe; cmd?: Commande; avance: number; methode: string; date: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const company = loadCompanyProfile();

  useEffect(() => {
    setSyncStatus(isAr ? 'جاري التحميل...' : 'Chargement...');
    
    loadData<Employe>('employes').then(remoteEmps => {
      setEmployes(remoteEmps || []);
      saveLocalRH('employes', remoteEmps || []);
    }).catch(() => {
      setEmployes(getLocalRH<Employe>('employes'));
    });

    loadData<PaiementSalaire>('paiements_salaires').then(remotePaiements => {
      setPaiements(remotePaiements || []);
      saveLocalRH('paiements_salaires', remotePaiements || []);
    }).catch(() => {
      setPaiements(getLocalRH<PaiementSalaire>('paiements_salaires'));
    });

    loadData<Commande>('commandes').then(remoteCmds => {
      setCommandes(remoteCmds || []);
    });

    setSyncStatus(null);
  }, [isAr]);

  const availableMois = useMemo(() => {
    try {
      const months = new Set<string>();
      if (Array.isArray(paiements)) {
        paiements.forEach(p => p && p.mois && months.add(p.mois));
      }
      if (selectedMois) months.add(selectedMois);
      return [...months].sort().reverse();
    } catch (e) {
      console.error("Error computing available months:", e);
      return [selectedMois];
    }
  }, [paiements, selectedMois]);

  const filtered = employes.filter(e => {
    const fullName = `${e.prenom || ''} ${e.nom || ''}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) || (e.poste || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;
    return matchSearch && matchType;
  });

  function getPaye(empId: string) {
    if (!empId || !Array.isArray(paiements)) return 0;
    return paiements
      .filter(p => p && p.employeId === empId && p.mois === selectedMois)
      .reduce((a, p) => a + (p.montant || 0), 0);
  }

  function getReste(emp: Employe) {
    if (!emp) return 0;
    return Math.max(0, (emp.salaireMensuel || 0) - getPaye(emp.id));
  }


  const totalPayeMois = useMemo(() => {
    try {
      return (employes || []).reduce((a, e) => a + getPaye(e.id), 0);
    } catch (err) { return 0; }
  }, [employes, paiements, selectedMois]);

  const totalResteMois = useMemo(() => {
    try {
      return (employes || [])
        .filter(e => e && e.actif)
        .reduce((a, e) => a + getReste(e), 0);
    } catch (err) { return 0; }
  }, [employes, paiements, selectedMois]);

  const atelierCount = useMemo(() => (employes || []).filter(e => e && e.type === 'atelier' && e.actif).length, [employes]);
  const stCount = useMemo(() => (employes || []).filter(e => e && e.type === 'sous_traitance' && e.actif).length, [employes]);
  const masseSalariale = useMemo(() => (employes || []).filter(e => e && e.type === 'atelier' && e.actif).reduce((a, e) => a + (e.salaireMensuel || 0), 0), [employes]);

  function openCreate() {
    setEditId(null);
    setForm({
      nom: '', prenom: '', poste: '', type: 'atelier',
      telephone: '', email: '', adresse: '', cin: '',
      banque: '', rib: '', actif: true, salaireMensuel: 0,
      remunerationType: 'mensuel'
    });
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
    saveLocalRH('employes', updated);

    // Sync with Supabase so other modules (like Commandes) can see them
    await saveRecord('employes', empData);

    setShowModal(false);
  }

  async function syncAll() {
    setSyncing(true);
    setSyncStatus(isAr ? 'جاري المزامنة...' : 'Synchronisation...');

    let count = 0;
    for (const emp of employes) {
      try {
        await saveRecord('employes', emp, true);
        count++;
      } catch (e) {
        console.error("Failed to sync", emp.nom, e);
      }
    }

    setSyncing(false);
    setSyncStatus(isAr ? `تمت مزامنة ${count} موظف` : `${count} employés synchronisés`);
    setTimeout(() => setSyncStatus(null), 3000);
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
    saveLocalRH('paiements_salaires', updatedPaiements);

    // Sync with server
    await saveRecord('paiements_salaires', newPaiement);

    setShowPayerModal(false);

    const emp = employes.find(e => e.id === payerEmployeId);
    if (emp) {
      const moisLabelStr = new Date(selectedMois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const empNameStr = emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom;

      // Determine category: 'salaires' for atelier, 'sous_traitance' for façonnier
      const chargeCat: any = emp.type === 'sous_traitance' ? 'sous_traitance' : 'salaires';

      const newCharge = {
        id: genId(),
        designation: `Paiement ${empNameStr} — ${moisLabelStr}`,
        categorie: chargeCat,
        montant,
        date: newPaiement.date,
        statut: 'payé',
        recurrence: 'mensuel',
        fournisseur: empNameStr,
        notes: notes || undefined,
      };
      saveRecord('charges', newCharge).catch(() => console.log("Silent error saving charge"));
    }
  }

  function handleGenerateBon() {
    const emp = employes.find(e => e.id === bonForm.empId);
    const cmd = commandes.find(c => c.id === bonForm.cmdId);
    if (!emp) return;

    const bon = {
      id: genId().slice(-6).toUpperCase(),
      emp,
      cmd,
      avance: bonForm.avance,
      methode: bonForm.methode,
      date: new Date().toLocaleDateString('fr-FR')
    };

    setGeneratedBon(bon);
    setShowBonModal(false);

    if (bon.avance > 0) {
      const newP: PaiementSalaire = {
        id: genId(),
        employeId: emp.id,
        montant: bon.avance,
        date: new Date().toISOString().split('T')[0],
        mois: selectedMois,
        methode: bon.methode as any,
        notes: `Avance sur Bon Travail ${bon.id}`
      };
      const updatedP = [...paiements, newP];
      setPaiements(updatedP);
      saveLocalRH('paiements_salaires', updatedP);

      // AUTOMATIC CHARGE SYNC for Advance
      const empNameStr = emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom;
      const chargeCat: any = emp.type === 'sous_traitance' ? 'sous_traitance' : 'salaires';

      const newCharge = {
        id: genId(),
        designation: `Avance ${empNameStr} — Bon Travail #${bon.id}`,
        categorie: chargeCat,
        montant: bon.avance,
        date: newP.date,
        statut: 'payé',
        recurrence: 'ponctuel',
        fournisseur: empNameStr,
        notes: `Commande: ${cmd?.reference || '—'}`,
      };
      saveRecord('charges', newCharge).catch(() => console.log("Silent error saving advance charge"));
    }
  }

  const handleDownloadPDF = async (elementId: string, filename: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setTimeout(async () => {
      try {
        await generatePDF(elementId, filename);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const moisLabel = (m: string) =>
    new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const empName = (e: Employe) => {
    if (!e) return '...';
    const p = e.prenom || '';
    const n = e.nom || '';
    return p ? `${p} ${n}` : n || 'Sans nom';
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Suivi RH & Façonniers</h1>
          <p className="text-slate-500 text-sm font-medium">Gestion du personnel atelier et sous-traitance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAllBadges(true)}
            className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-600 px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <ImageIcon className="w-4 h-4" /> Badges PDF
          </button>
          <select
            value={selectedMois}
            onChange={e => setSelectedMois(e.target.value)}
            className="px-4 py-2.5 bg-white border-2 border-slate-50 rounded-2xl text-sm focus:border-indigo-500 outline-none font-black text-slate-700 shadow-sm transition-all"
          >
            {availableMois.map(m => (
              <option key={m} value={m}>{moisLabel(m)}</option>
            ))}
          </select>
          <button
            onClick={syncAll}
            disabled={syncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${syncing ? 'bg-slate-100 text-slate-400 border-slate-100' : 'bg-white text-indigo-600 border-indigo-50 hover:border-indigo-200 hover:bg-indigo-50/50'
              }`}
          >
            <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncStatus || (isAr ? 'مزامنة السيرفر' : 'Sync Serveur')}
          </button>
          <button onClick={openCreate} className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Permanents</p>
          <p className="text-3xl font-black text-slate-900">{atelierCount}</p>
          <p className="text-sm text-indigo-600 font-black mt-1">Masse : {masseSalariale.toLocaleString()} MAD</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Façonniers</p>
          <p className="text-3xl font-black text-indigo-600">{stCount}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-1">Payé — {moisLabel(selectedMois)}</p>
          <p className="text-3xl font-black text-emerald-700">{totalPayeMois.toLocaleString()} <span className="text-sm">MAD</span></p>
        </div>
        <div className="bg-rose-50 p-6 rounded-[32px] border-2 border-rose-100 shadow-sm">
          <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.2em] mb-1">Reste à payer</p>
          <p className="text-3xl font-black text-rose-700">{totalResteMois.toLocaleString()} <span className="text-sm">MAD</span></p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text" placeholder="Rechercher un employé / poste..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-50 rounded-[20px] py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>
        <select
          value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-white border-2 border-slate-50 rounded-[20px] px-6 py-4 text-sm font-black text-slate-600 outline-none focus:border-indigo-500 shadow-sm appearance-none"
        >
          <option value="all">Tous types</option>
          <option value="atelier">Atelier (Permanent)</option>
          <option value="sous_traitance">Façonnier (Externe)</option>
        </select>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(e => {
          const paye = getPaye(e.id);
          const reste = getReste(e);
          return (
            <div key={e.id} className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white font-black text-2xl shadow-lg ${e.type === 'atelier' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                      {e.prenom && e.nom ? (e.prenom?.[0] || '') + (e.nom?.[0] || '') : (e.nom ? e.nom.substring(0, 2).toUpperCase() : '??')}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{empName(e)}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{e.poste || 'Poste non défini'}</p>
                        <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 shadow-sm">
                          {(e.salaireMensuel || 0).toLocaleString()} / {e.remunerationType === 'hebdomadaire' ? 'Semaine' : e.remunerationType === 'tache' ? 'Tâche' : 'Mois'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(e)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDeleteId(e.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {e.telephone && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Phone className="w-3.5 h-3.5" /></div>
                      <span className="text-xs font-bold">{e.telephone}</span>
                    </div>
                  )}
                  {e.cin && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><File className="w-3.5 h-3.5" /></div>
                      <span className="text-xs font-bold uppercase">{e.cin}</span>
                    </div>
                  )}
                  {e.pin_code && (
                    <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><CreditCard className="w-3 h-3" /></div>
                      <span className="text-[10px] font-black tracking-[0.2em]">PIN: {e.pin_code}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-3xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Payé</p>
                    <p className="text-sm font-black text-emerald-600">{paye.toLocaleString()} MAD</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reste</p>
                    <p className="text-sm font-black text-rose-600">{reste.toLocaleString()} MAD</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openPayer(e.id)}
                    className="flex-1 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                  >
                    <DollarSign className="w-4 h-4" /> Payer
                  </button>
                  {e.type === 'atelier' && (
                    <>
                      <button
                        onClick={() => { setBonForm({ ...bonForm, empId: e.id }); setShowBonModal(true); }}
                        className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all"
                      >
                        <File className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedBadge(e)}
                        className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: View All Badges for Export */}
      {showAllBadges && (
        <div className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Impression des Badges</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {employes.filter(e => e.type === 'atelier' && e.actif).length} badges</p>
              </div>
              <div className="flex items-center gap-3">
                {/* PDF Download Button */}
                <button
                  onClick={() => handleDownloadPDF('all-badges-capture', 'Tous_les_Badges')}
                  disabled={isGenerating}
                  className={`${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900'} text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all`}
                >
                  {isGenerating ? <RotateCw className="w-4 h-4 animate-spin" /> : <><Download className="w-5 h-5" /> Télécharger PDF</>}
                </button>
                {/* Guaranteed Print Button */}
                <button
                  onClick={() => printElement('all-badges-capture')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Printer className="w-5 h-5" /> Imprimer / PDF Direct
                </button>
                <button onClick={() => setShowAllBadges(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-white scrollbar-hide">
              <div className="grid grid-cols-2 gap-8" id="all-badges-capture">
                {employes.filter(e => e.type === 'atelier' && e.actif).map(e => (
                  <div key={e.id} className="border-2 border-slate-100 rounded-[32px] p-8 flex flex-col items-center text-center bg-white shadow-sm break-inside-avoid">
                    <p className="text-xl font-black text-slate-900 italic uppercase mb-6">{company.name}</p>
                    <div className="p-4 bg-white border-2 border-slate-50 rounded-3xl mb-6 flex items-center justify-center">
                      {e.id ? <QRCodeSVG value={e.id} size={150} level="H" /> : <div className="w-[150px] h-[150px] bg-slate-100 animate-pulse rounded-2xl" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight mb-2">{empName(e)}</h2>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-5 py-2 rounded-full">{e.poste || 'Personnel'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Personnel */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{editId ? 'Modifier Profil Personnel' : 'Nouveau Personnel'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Identité & Poste</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prénom</label>
                    <input value={form.prenom || ''} onChange={e => setForm({ ...form, prenom: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom *</label>
                    <input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Poste / Fonction</label>
                    <select value={form.poste || ''} onChange={e => setForm({ ...form, poste: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none">
                      <option value="">Sélectionner...</option>
                      {[...POSTES_ATELIER, ...POSTES_SOUSTRAITANCE].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type de contrat</label>
                    <select value={form.type || 'atelier'} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none">
                      <option value="atelier">Interne (Atelier)</option>
                      <option value="sous_traitance">Externe (Façonnier)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Contact & Administratif</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">N° Téléphone</label>
                    <input value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CIN (N° Carte Nationale)</label>
                    <input value={form.cin || ''} onChange={e => setForm({ ...form, cin: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 uppercase outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adresse Résidence</label>
                    <input value={form.adresse || ''} onChange={e => setForm({ ...form, adresse: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Rémunération & Banque</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Base Rémunération</label>
                    <select value={form.remunerationType || 'mensuel'} onChange={e => setForm({ ...form, remunerationType: e.target.value as any })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-500">
                      <option value="mensuel">Par Mois (Mensuel)</option>
                      <option value="hebdomadaire">Par Semaine (Hebdo)</option>
                      <option value="tache">À la Tâche / Commande</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Montant Base (MAD)</label>
                    <input type="number" value={form.salaireMensuel || ''} onChange={e => setForm({ ...form, salaireMensuel: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Banque</label>
                    <select value={form.banque || ''} onChange={e => setForm({ ...form, banque: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900">
                      <option value="">Sélectionner banque...</option>
                      {['CIH', 'Attijari', 'BP', 'BMCE', 'Al Barid', 'SG', 'BMCI', 'Crédit Agricole'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RIB (24 Chiffres)</label>
                    <input value={form.rib || ''} onChange={e => setForm({ ...form, rib: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-mono font-bold text-slate-700" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Accès Portail (PIN Code)</p>
                <div className="flex items-end gap-4 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Code PIN (4 chiffres)</label>
                    <input 
                      value={form.pin_code || ''} 
                      onChange={e => setForm({ ...form, pin_code: e.target.value.substring(0, 4) })} 
                      maxLength={4}
                      placeholder="Ex: 1234"
                      className="w-full bg-white border-2 border-indigo-100 rounded-2xl py-4 px-6 text-2xl font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all text-center tracking-[0.5em]" 
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const pin = Math.floor(1000 + Math.random() * 9000).toString();
                      setForm({ ...form, pin_code: pin });
                    }}
                    className="h-14 px-6 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Générer PIN
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 sticky bottom-0">
              <button onClick={save} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">Enregistrer le Profil</button>
            </div>
          </div>
        </div>
      )}

      {/* Bon de Travail Modal */}
      {showBonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Générer Bon de Travail</h2>
              <button onClick={() => setShowBonModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Associer une Commande</label>
                <select value={bonForm.cmdId} onChange={e => setBonForm({ ...bonForm, cmdId: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none">
                  <option value="">— Sélectionner une commande —</option>
                  {commandes.map(c => <option key={c.id} value={c.id}>{c.reference} - {c.client}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avance (MAD)</label>
                  <input type="number" value={bonForm.avance} onChange={e => setBonForm({ ...bonForm, avance: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Méthode</label>
                  <select value={bonForm.methode} onChange={e => setBonForm({ ...bonForm, methode: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none">
                    <option value="especes">Espèces</option>
                    <option value="virement">Virement</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setShowBonModal(false)} className="flex-1 h-14 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Annuler</button>
              <button onClick={handleGenerateBon} className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all">Générer</button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Bon Preview */}
      {generatedBon && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Aperçu du Bon</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => printElement('bon-travail-capture')}
                  className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setGeneratedBon(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-6 h-6 text-slate-900" /></button>
              </div>
            </div>
            <div className="p-12 bg-white" id="bon-travail-capture">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">{company.name}</h1>
                  <p className="text-[10px] font-bold text-indigo-600 tracking-[0.3em] uppercase">Bon de Production</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">#BT-{generatedBon.id}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{generatedBon.date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Personnel</h3>
                  <p className="text-xl font-black text-slate-900 uppercase">{empName(generatedBon.emp)}</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1 uppercase">{generatedBon.emp.poste}</p>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-slate-100 rounded-3xl p-6 text-center">
                  <QRCodeSVG value={`BON:${generatedBon.id}`} size={100} />
                  <p className="text-[8px] font-black text-slate-300 mt-3 uppercase tracking-[0.3em]">Scan Suivi</p>
                </div>
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-8">
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Avance / Versement</h3>
                <p className="text-3xl font-black text-slate-900">{generatedBon.avance.toLocaleString()} MAD</p>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button
                onClick={() => handleDownloadPDF('bon-travail-capture', `Bon_Travail_${generatedBon.id}`)}
                disabled={isGenerating}
                className={`flex-1 h-14 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl transition-all ${isGenerating ? 'bg-slate-400' : 'bg-slate-900'}`}
              >
                {isGenerating ? <RotateCw className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> Télécharger PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge QR Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-[380px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter">Badge QR</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => printElement('badge-capture')}
                  className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedBadge(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center text-center" id="badge-capture">
              <p className="text-xl font-black tracking-tighter text-slate-900 italic uppercase mb-8">{company.name}</p>
              <div className="w-48 h-48 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm mb-6 flex items-center justify-center">
                <QRCodeSVG value={selectedBadge.id} size={160} level="H" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase leading-none mb-2">{empName(selectedBadge)}</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-8 bg-indigo-50 px-4 py-1.5 rounded-full">{selectedBadge.poste}</p>
            </div>
            <div className="p-6 bg-slate-50">
              <button
                onClick={() => handleDownloadPDF('badge-capture', `Badge_${selectedBadge.nom}`)}
                disabled={isGenerating}
                className={`w-full h-14 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg transition-all ${isGenerating ? 'bg-slate-400' : 'bg-slate-900'}`}
              >
                {isGenerating ? <RotateCw className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4" /> PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Paiement</h2>
              <button onClick={() => setShowPayerModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Montant (MAD)</label>
                <input type="number" value={payerForm.montant} onChange={e => setPayerForm({ ...payerForm, montant: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-2xl font-black text-slate-900 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Méثode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['especes', 'virement', 'cheque'].map(m => (
                    <button key={m} onClick={() => setPayerForm({ ...payerForm, methode: m })} className={`h-12 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${payerForm.methode === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50">
              <button onClick={savePaiement} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Deletion Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-rose-500 animate-pulse">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">Attention !</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed px-4">
                Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible.
              </p>
            </div>
            <div className="p-8 bg-slate-50/50 flex flex-col gap-3">
              <button
                onClick={() => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  import('../types').then(({ deleteRecord }) => {
                    const updated = employes.filter(e => e.id !== id);
                    setEmployes(updated);
                    saveLocalRH('employes', updated);
                    deleteRecord('employes', id);
                  });
                }}
                className="h-14 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95 transition-all"
              >
                Oui, Supprimer définitivement
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-14 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
