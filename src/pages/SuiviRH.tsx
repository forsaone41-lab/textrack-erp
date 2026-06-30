import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { Plus, Search, Edit2, Trash2, CreditCard, DollarSign, Image as ImageIcon, X, Printer, Download, File, Phone, RotateCw, Copy, Check, Zap, Calculator } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Employe, PaiementSalaire, Commande, loadData, genId, loadCompanyProfile, saveRecord, safeStorage } from '../types';
import { generatePDF, printElement } from '../utils/pdf';
import { PageLoader } from '../components/PageLoader';

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

const POSTES_ATELIER_AR = [
  '— الإنتاج —',
  'فصالة (Coupeur)',
  'خياطة (Couturier)',
  'بيكور (Piqueur)',
  'سورجي (Surjeteuse)',
  'مصلوح (Repasseur)',
  'فينيسيون (Finisseur)',
  '— تقني —',
  'موديليست (Modéliste)',
  'باطرونيير (Patronnière)',
  'ميكانيكي آلات',
  'مراقبة الجودة',
  '— التأطير —',
  'رئيس الورشة (Chef d\'Atelier)',
  'مسؤول الإنتاج',
  'مسؤول الجودة',
  '— الإدارة —',
  'مسؤول الموارد البشرية',
  'محاسب',
  'تجاري (Commercial)',
  'مسؤول المشتريات',
  'مدير / مديرة',
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

const POSTES_SOUSTRAITANCE_AR = [
  'فاصونيي — فصالة',
  'فاصونيي — خياطة',
  'فاصونيي — فينيسيون',
  'فاصونيي — مصلوح',
  'فاصونيي عام',
  'ورشة خارجية',
  'خدمات الطرز',
  'خدمات الطباعة',
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
  const [showContract, setShowContract] = useState(false);
  const [selectedContractEmp, setSelectedContractEmp] = useState<Employe | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simNet, setSimNet] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Bon de Travail state
  const [showBonModal, setShowBonModal] = useState(false);
  const [bonForm, setBonForm] = useState({ empId: '', cmdId: '', avance: 0, methode: 'especes' });
  const [generatedBon, setGeneratedBon] = useState<{ id: string; emp: Employe; cmd?: Commande; avance: number; methode: string; date: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ nom: string; pin: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const company = loadCompanyProfile();

  const location = useLocation();

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
      setLoading(false);
    });

    setSyncStatus(null);

    // Handle Incoming Candidate Data from Recruitment
    if (location.state?.fromRecruitment) {
      const candidate = location.state.fromRecruitment;
      const [firstName, ...lastNameParts] = candidate.name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Clean the position name
      let suggestedPoste = '';
      const rawType = candidate.type.replace('RECRUTEMENT: ', '');
      const posteMatch = POSTES_ATELIER.find(p => p.toLowerCase().includes(rawType.toLowerCase())) || 
                         POSTES_SOUSTRAITANCE.find(p => p.toLowerCase().includes(rawType.toLowerCase()));
      
      if (posteMatch) {
        suggestedPoste = posteMatch;
      } else {
        // Try matching Arabic labels if needed, or just use the raw type
        suggestedPoste = rawType;
      }

      setForm({
        nom: lastName || firstName,
        prenom: lastName ? firstName : '',
        telephone: candidate.phone,
        email: candidate.email === 'recrutement@beya.ma' ? '' : candidate.email,
        poste: suggestedPoste,
        type: 'atelier',
        actif: true,
        salaireMensuel: 0,
        remunerationType: 'mensuel'
      });
      setShowModal(true);
      
      // Clear location state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [isAr, location.state]);

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

    // ✅ AUTO-CREATE USER ACCOUNT for new employees
    if (isNew) {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const finalPin = empData.pin_code || generatedPin;
      
      const newUser = {
        id: genId(),
        nom: `${empData.prenom || ''} ${empData.nom}`.trim(),
        role: 'worker' as const,
        email: empData.email || `${empData.nom.toLowerCase().replace(/\s/g, '')}.${genId().split('-')[0]}@beya.local`,
        telephone: empData.telephone || '',
        password: finalPin, // Use PIN as password for workers
        pinCode: finalPin,
        employeId: eId,
        photo: empData.photo || '',
        lastActive: new Date().toISOString(),
      };
      
      // Save to Supabase (users table)
      await saveRecord('users', newUser);
      
      // Update local users list in storage for immediate UI sync
      try {
        const localUsersRaw = localStorage.getItem('textrack_users');
        const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
        localStorage.setItem('textrack_users', JSON.stringify([...localUsers, newUser]));
      } catch { /* ignore */ }

      setToast({ nom: newUser.nom, pin: finalPin });
      setTimeout(() => setToast(null), 6000);
    }

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
      const moisLabelStr = new Date(selectedMois + '-01').toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });
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
      date: new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')
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
    new Date(m + '-01').toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });

  const empName = (e: Employe) => {
    if (!e) return '...';
    const p = e.prenom || '';
    const n = e.nom || '';
    return p ? `${p} ${n}` : n || (isAr ? 'بدون اسم' : 'Sans nom');
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 relative">

      {/* ✅ Toast Notification - Auto User Created */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl shadow-black/40 px-6 py-4 flex items-center gap-4 min-w-[320px] border border-white/10">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-0.5">
                {isAr ? 'حساب جديد تلقائي ✅' : 'Compte créé automatiquement ✅'}
              </p>
              <p className="text-sm font-bold text-white">{toast.nom}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {isAr ? 'كلمة السر / PIN:' : 'Mot de passe / PIN:'} <span className="text-indigo-400 font-black tracking-[0.3em]">{toast.pin}</span>
              </p>
            </div>
            <button onClick={() => setToast(null)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'تتبع الموارد البشرية والعمال' : 'Suivi RH & Façonniers'}</h1>
          <p className="text-slate-500 text-sm font-medium">{isAr ? 'إدارة موظفي المعمل والعمال الخارجيين' : 'Gestion du personnel atelier et sous-traitance'}</p>
        </div>
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => window.open('#/fast-scanner', '_blank')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-2xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
          >
            <Zap className="w-4 h-4 fill-white" /> {isAr ? '(PRO) فتح الماسح الضوئي' : '(PRO) Ouvrir Scanner'}
          </button>
          <button
            onClick={() => setShowAllBadges(true)}
            className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-600 px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <ImageIcon className="w-4 h-4" /> {isAr ? 'بطاقات التعريف' : 'Badges PDF'}
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
            {syncStatus || (isAr ? 'مزامنة' : 'Sync')}
          </button>
          <button 
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl hover:bg-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest border border-emerald-200"
          >
            <Calculator className="w-4 h-4" /> {isAr ? 'حاسبة التكاليف' : 'Simulateur Salaire'}
          </button>
          <button onClick={openCreate} className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> {isAr ? 'إضافة' : 'Ajouter'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm ${isAr ? 'text-right' : ''}`}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isAr ? 'عمال قارين' : 'Permanents'}</p>
          <p className="text-3xl font-black text-slate-900 tabular-nums">{atelierCount}</p>
          <p className="text-sm text-indigo-600 font-black mt-1">{isAr ? 'الكتلة' : 'Masse'} : {masseSalariale.toLocaleString()} MAD</p>
        </div>
        <div className={`bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm ${isAr ? 'text-right' : ''}`}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isAr ? 'عمال خارجيين' : 'Façonniers'}</p>
          <p className="text-3xl font-black text-indigo-600 tabular-nums">{stCount}</p>
        </div>
        <div className={`bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-100 shadow-sm ${isAr ? 'text-right' : ''}`}>
          <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-1">{isAr ? 'مؤدى' : 'Payé'} — {moisLabel(selectedMois)}</p>
          <p className="text-3xl font-black text-emerald-700 tabular-nums">{totalPayeMois.toLocaleString()} <span className="text-sm">MAD</span></p>
        </div>
        <div className={`bg-rose-50 p-6 rounded-[32px] border-2 border-rose-100 shadow-sm ${isAr ? 'text-right' : ''}`}>
          <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.2em] mb-1">{isAr ? 'الباقي للأداء' : 'Reste à payer'}</p>
          <p className="text-3xl font-black text-rose-700 tabular-nums">{totalResteMois.toLocaleString()} <span className="text-sm">MAD</span></p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={`flex flex-col sm:flex-row gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text" placeholder={isAr ? 'بحث عن موظف أو منصب...' : "Rechercher un employé / poste..."}
            value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full bg-white border-2 border-slate-50 rounded-[20px] py-4 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm ${isAr ? 'pl-4 pr-12 text-right' : 'pl-12'}`}
            dir={isAr ? 'rtl' : 'ltr'}
          />
        </div>
        <select
          value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-white border-2 border-slate-50 rounded-[20px] px-6 py-4 text-sm font-black text-slate-600 outline-none focus:border-indigo-500 shadow-sm appearance-none"
        >
          <option value="all">{isAr ? 'كل الأنواع' : 'Tous types'}</option>
          <option value="atelier">{isAr ? 'المعمل (قاري)' : 'Atelier (Permanent)'}</option>
          <option value="sous_traitance">{isAr ? 'خارجي (فاصونيي)' : 'Façonnier (Externe)'}</option>
        </select>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(e => {
          const paye = getPaye(e.id);
          const reste = getReste(e);
          return (
            <div key={e.id} className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
              {/* Header Profile Section */}
              <div className="p-8 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white font-black text-xl shadow-lg relative overflow-hidden ${e.type === 'atelier' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                      {e.photo ? (
                        <img src={e.photo} alt={e.nom} className="w-full h-full object-cover" />
                      ) : (
                        <span>{e.prenom && e.nom ? (e.prenom?.[0] || '') + (e.nom?.[0] || '') : (e.nom ? e.nom.substring(0, 2).toUpperCase() : '??')}</span>
                      )}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className={isAr ? 'text-right' : ''}>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{empName(e)}</h3>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg inline-block">
                        {e.poste || (isAr ? 'منصب غير محدد' : 'Poste non défini')}
                      </p>
                    </div>
                  </div>
                  <div className={`flex gap-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <button onClick={() => { setSelectedContractEmp(e); setShowContract(true); }} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition" title={isAr ? 'عقد عمل' : 'Contrat de Travail'}><File className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(e)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDeleteId(e.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Info Pills */}
                <div className={`flex flex-wrap gap-2 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600">{e.telephone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600">{e.cin || '—'}</span>
                  </div>
                  {e.pin_code && (
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(e.pin_code!);
                        alert(isAr ? 'تم نسخ الرمز!' : 'Code PIN copié !');
                      }}
                      className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors group/pin active:scale-95"
                      title={isAr ? 'نسخ رمز PIN' : 'Copier le code PIN'}
                    >
                      <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 group-hover/pin:scale-110 transition-transform" />
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">PIN: {e.pin_code}</span>
                      <Copy className="w-3 h-3 text-indigo-300 group-hover/pin:text-indigo-600 transition-colors" />
                    </button>
                  )}
                </div>

                {/* Salary Stats Dashboard */}
                <div className={`grid grid-cols-2 gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-4 rounded-[24px] border-2 border-slate-50 transition-colors hover:border-emerald-100 bg-white ${isAr ? 'text-right' : ''}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'مؤدى' : 'Payé'}</p>
                    <p className="text-lg font-black text-emerald-600 tabular-nums">{(paye || 0).toLocaleString()} <span className="text-[10px]">MAD</span></p>
                  </div>
                  <div className={`p-4 rounded-[24px] border-2 border-slate-50 transition-colors hover:border-rose-100 bg-white ${isAr ? 'text-right' : ''}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الباقي' : 'Reste'}</p>
                    <p className="text-lg font-black text-rose-600 tabular-nums">{(reste || 0).toLocaleString()} <span className="text-[10px]">MAD</span></p>
                  </div>
                </div>

                {/* Main Action Bar */}
                <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => openPayer(e.id)}
                    className="flex-1 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                  >
                    <DollarSign className="w-4 h-4" /> {isAr ? 'أداء الراتب' : 'Payer'}
                  </button>
                  {e.type === 'atelier' && (
                    <>
                      <button
                        onClick={() => { setBonForm({ ...bonForm, empId: e.id }); setShowBonModal(true); }}
                        className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all"
                        title={isAr ? 'وصل العمل' : 'Bon de Travail'}
                      >
                        <File className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedBadge(e)}
                        className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all"
                        title={isAr ? 'بطاقة التعريف' : 'Badge'}
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
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex flex-col ${isAr ? 'text-right' : ''}`}>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'طباعة بطاقات التعريف' : 'Impression des Badges'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? `المجموع: ${employes.filter(e => e.type === 'atelier' && e.actif).length} بطاقة` : `Total: ${employes.filter(e => e.type === 'atelier' && e.actif).length} badges`}</p>
              </div>
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                {/* PDF Download Button */}
                <button
                  onClick={() => handleDownloadPDF('all-badges-capture', 'Tous_les_Badges')}
                  disabled={isGenerating}
                  className={`${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900'} text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all`}
                >
                  {isGenerating ? <RotateCw className="w-4 h-4 animate-spin" /> : <><Download className="w-5 h-5" /> {isAr ? 'تحميل PDF' : 'Télécharger PDF'}</>}
                </button>
                {/* Guaranteed Print Button */}
                <button
                  onClick={() => printElement('all-badges-capture')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Printer className="w-5 h-5" /> {isAr ? 'طباعة مباشرة' : 'Imprimer / PDF Direct'}
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
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-5 py-2 rounded-full">
                      {isAr ? (POSTES_ATELIER_AR[POSTES_ATELIER.indexOf(e.poste)] || e.poste) : e.poste || 'Personnel'}
                    </p>
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
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                {editId ? (isAr ? 'تعديل حساب موظف' : 'Modifier Profil Personnel') : (isAr ? 'موظف جديد' : 'Nouveau Personnel')}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الهوية والمنصب' : 'Identité & Poste'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الاسم الشخصي' : 'Prénom'}</label>
                    <input value={form.prenom || ''} onChange={e => setForm({ ...form, prenom: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الاسم العائلي *' : 'Nom *'}</label>
                    <input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المنصب / الوظيفة' : 'Poste / Fonction'}</label>
                    <select value={form.poste || ''} onChange={e => setForm({ ...form, poste: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                      <option value="">{isAr ? 'اختر المنصب...' : 'Sélectionner...'}</option>
                      {POSTES_ATELIER.map((p, i) => {
                        const currentUserRaw = localStorage.getItem('textrack_auth');
                        const isAdmin = currentUserRaw ? JSON.parse(currentUserRaw).role === 'admin' : false;
                        const isAdminRole = i >= 16;
                        if (isAdminRole && !isAdmin) return null;
                        return <option key={p} value={p} disabled={p.startsWith('—')}>{isAr ? POSTES_ATELIER_AR[i] : p}</option>;
                      })}
                      {POSTES_SOUSTRAITANCE.map((p, i) => <option key={p} value={p} disabled={p.startsWith('—')}>{isAr ? POSTES_SOUSTRAITANCE_AR[i] : p}</option>)}
                    </select>
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'نوع العقد' : 'Type de contrat'}</label>
                    <select value={form.type || 'atelier'} onChange={e => setForm({ ...form, type: e.target.value as any })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                      <option value="atelier">{isAr ? 'داخلي (المعمل)' : 'Interne (Atelier)'}</option>
                      <option value="sous_traitance">{isAr ? 'خارجي (فاصونيي)' : 'Externe (Façonnier)'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الاتصال والإدارة' : 'Contact & Administratif'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم الهاتف' : 'N° Téléphone'}</label>
                    <input value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم البطاقة الوطنية (CIN)' : 'CIN (N° Carte Nationale)'}</label>
                    <input value={form.cin || ''} onChange={e => setForm({ ...form, cin: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 uppercase outline-none ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                  <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'عنوان السكن' : 'Adresse Résidence'}</label>
                    <input value={form.adresse || ''} onChange={e => setForm({ ...form, adresse: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                </div>
              </div>

              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الأجر والبنك' : 'Rémunération & Banque'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'قاعدة الأجر' : 'Base Rémunération'}</label>
                    <select value={form.remunerationType || 'mensuel'} onChange={e => setForm({ ...form, remunerationType: e.target.value as any })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}>
                      <option value="mensuel">{isAr ? 'بالشهر (Mensuel)' : 'Par Mois (Mensuel)'}</option>
                      <option value="hebdomadaire">{isAr ? 'بالأسبوع (Hebdo)' : 'Par Semaine (Hebdo)'}</option>
                      <option value="tache">{isAr ? 'بالمهمة / الطلبية' : 'À la Tâche / Commande'}</option>
                    </select>
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المبلغ (درهم)' : 'Montant Base (MAD)'}</label>
                    <input type="number" value={form.salaireMensuel || ''} onChange={e => setForm({ ...form, salaireMensuel: parseFloat(e.target.value) || 0 })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'البنك' : 'Banque'}</label>
                    <select value={form.banque || ''} onChange={e => setForm({ ...form, banque: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 ${isAr ? 'text-right' : ''}`}>
                      <option value="">{isAr ? 'اختر البنك...' : 'Sélectionner banque...'}</option>
                      {['CIH', 'Attijari', 'BP', 'BMCE', 'Al Barid', 'SG', 'BMCI', 'Crédit Agricole'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم الحساب (RIB)' : 'RIB (24 Chiffres)'}</label>
                    <input value={form.rib || ''} onChange={e => setForm({ ...form, rib: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-mono font-bold text-slate-700 ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                </div>
              </div>

              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الولوج للبوابة (رمز PIN)' : 'Accès Portail (PIN Code)'}</p>
                <div className={`flex items-end gap-4 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رمز PIN (4 أرقام)' : 'Code PIN (4 chiffres)'}</label>
                    <input 
                      value={form.pin_code || ''} 
                      onChange={e => setForm({ ...form, pin_code: e.target.value.substring(0, 4) })} 
                      maxLength={4}
                      placeholder="Ex: 1234"
                      className="w-full bg-white border-2 border-indigo-100 rounded-2xl py-4 px-6 text-2xl font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all text-center tracking-[0.5em] tabular-nums" 
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const pin = Math.floor(1000 + Math.random() * 9000).toString();
                      setForm({ ...form, pin_code: pin });
                    }}
                    className="h-14 px-6 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    {isAr ? 'توليد الرمز' : 'Générer PIN'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 sticky bottom-0">
              <button onClick={save} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">
                {isAr ? 'حفظ الحساب' : 'Enregistrer le Profil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bon de Travail Modal */}
      {showBonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'توليد وصل العمل' : 'Générer Bon de Travail'}</h2>
              <button onClick={() => setShowBonModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'ربط بطلبية' : 'Associer une Commande'}</label>
                <select value={bonForm.cmdId} onChange={e => setBonForm({ ...bonForm, cmdId: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                  <option value="">{isAr ? '— اختر طلبية —' : '— Sélectionner une commande —'}</option>
                  {commandes.map(c => <option key={c.id} value={c.id}>{c.reference} - {c.client}</option>)}
                </select>
              </div>
              <div className={`grid grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'تسبيق (درهم)' : 'Avance (MAD)'}</label>
                  <input type="number" value={bonForm.avance} onChange={e => setBonForm({ ...bonForm, avance: parseFloat(e.target.value) || 0 })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-left tabular-nums' : ''}`} />
                </div>
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'طريقة الأداء' : 'Méthode'}</label>
                  <select value={bonForm.methode} onChange={e => setBonForm({ ...bonForm, methode: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                    <option value="especes">{isAr ? 'نقداً' : 'Espèces'}</option>
                    <option value="virement">{isAr ? 'تحويل بنكي' : 'Virement'}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={`p-8 bg-slate-50 flex gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setShowBonModal(false)} className="flex-1 h-14 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleGenerateBon} className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all">
                {isAr ? 'توليد' : 'Générer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Bon Preview */}
      {generatedBon && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'معاينة الوصل' : 'Aperçu du Bon'}</h2>
              <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => printElement('bon-travail-capture')}
                  className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setGeneratedBon(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-6 h-6 text-slate-900" /></button>
              </div>
            </div>
            <div className={`p-12 bg-white ${isAr ? 'text-right' : ''}`} id="bon-travail-capture">
              <div className={`flex justify-between items-start mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">{company.name}</h1>
                  <p className="text-[10px] font-bold text-indigo-600 tracking-[0.3em] uppercase">{isAr ? 'وصل إنتاج' : 'Bon de Production'}</p>
                </div>
                <div className={isAr ? 'text-left' : 'text-right'}>
                  <p className="text-xs font-black text-slate-900 tabular-nums">#BT-{generatedBon.id}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tabular-nums">{generatedBon.date}</p>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-12 mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`bg-slate-50 p-6 rounded-3xl ${isAr ? 'text-right' : ''}`}>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الموظفين' : 'Personnel'}</h3>
                  <p className="text-xl font-black text-slate-900 uppercase">{empName(generatedBon.emp)}</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1 uppercase">
                    {isAr ? (POSTES_ATELIER_AR[POSTES_ATELIER.indexOf(generatedBon.emp.poste)] || generatedBon.emp.poste) : generatedBon.emp.poste}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-slate-100 rounded-3xl p-6 text-center">
                  <QRCodeSVG value={`BON:${generatedBon.id}`} size={100} />
                  <p className="text-[8px] font-black text-slate-300 mt-3 uppercase tracking-[0.3em]">{isAr ? 'مسح للتتبع' : 'Scan Suivi'}</p>
                </div>
              </div>
              <div className={`bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-8 ${isAr ? 'text-right' : ''}`}>
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{isAr ? 'تسبيق / دفعة' : 'Avance / Versement'}</h3>
                <p className="text-3xl font-black text-slate-900 tabular-nums">{generatedBon.avance.toLocaleString()} MAD</p>
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
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'أداء الراتب' : 'Paiement'}</h2>
              <button onClick={() => setShowPayerModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المبلغ (درهم)' : 'Montant (MAD)'}</label>
                <input type="number" value={payerForm.montant} onChange={e => setPayerForm({ ...payerForm, montant: parseFloat(e.target.value) || 0 })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-2xl font-black text-slate-900 outline-none ${isAr ? 'text-left tabular-nums' : ''}`} />
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'طريقة الأداء' : 'Méthode'}</label>
                <div className={`grid grid-cols-3 gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  {['especes', 'virement', 'cheque'].map(m => (
                    <button key={m} onClick={() => setPayerForm({ ...payerForm, methode: m })} className={`h-12 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${payerForm.methode === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {m === 'especes' ? (isAr ? 'نقداً' : 'Espèces') : m === 'virement' ? (isAr ? 'تحويل' : 'Virement') : (isAr ? 'شيك' : 'Chèque')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50">
              <button onClick={savePaiement} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                {isAr ? 'تأكيد الأداء' : 'Confirmer'}
              </button>
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
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">{isAr ? 'تنبيه !' : 'Attention !'}</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed px-4">
                {isAr ? 'هل أنت متأكد من حذف هذا الموظف؟ هذه العملية لا يمكن التراجع عنها.' : 'Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible.'}
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
                {isAr ? 'نعم، حذف نهائياً' : 'Oui, Supprimer définitivement'}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-14 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 📜 Historique Modal */}
      {showHistorique && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl border border-white/20 relative max-h-[80vh] overflow-hidden flex flex-col">
             <button onClick={() => setShowHistorique(null)} className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
               <X className="w-5 h-5" />
             </button>
             
             <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
               <RotateCw className="w-6 h-6 text-indigo-600" />
               {isAr ? 'سجل الأداءات' : 'Historique des Paiements'}
             </h3>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {paiements.filter(p => p.employeId === showHistorique).length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold">{isAr ? 'لا يوجد سجل أداء حالياً' : 'Aucun historique de paiement'}</p>
                 </div>
               ) : (
                 paiements
                   .filter(p => p.employeId === showHistorique)
                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                   .map(p => (
                     <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                           <DollarSign className="w-5 h-5" />
                         </div>
                         <div className={isAr ? 'text-right' : ''}>
                           <p className="text-sm font-black text-slate-900">{p.montant.toLocaleString()} MAD</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.date).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">{p.methode}</span>
                          <button onClick={() => setPaiements(prev => prev.filter(x => x.id !== p.id))} className="p-2 text-slate-300 hover:text-rose-600 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                       </div>
                     </div>
                   ))
               )}
             </div>
          </div>
        </div>
      )}

      {/* ✅ Contract Print Modal */}
      {showContract && selectedContractEmp && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-white/20 relative">
             <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6">
                <File className="w-10 h-10 text-emerald-600" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
               {isAr ? 'عقد العمل' : 'Contrat de Travail'}
             </h3>
             <p className="text-slate-500 font-bold text-sm mb-8">
               {isAr ? `هل تريد تحميل عقد العمل الخاص بـ ${empName(selectedContractEmp)}؟` : `Voulez-vous générer le contrat pour ${empName(selectedContractEmp)} ?`}
             </p>

             <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setShowContract(false)}
                className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
               >
                 {isAr ? 'إلغاء' : 'Annuler'}
               </button>
               <button 
                onClick={() => {
                  handleDownloadPDF('contract-template', `Contrat_${selectedContractEmp.nom}`);
                  setTimeout(() => setShowContract(false), 2000);
                }}
                className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200"
               >
                 <Printer className="w-4 h-4" />
                 {isAr ? 'تحميل PDF' : 'Télécharger PDF'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* 📄 Hidden Contract Template */}
        <div id="contract-template" className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[500] w-[800px] bg-white p-12 text-slate-900 font-serif leading-relaxed" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="text-center mb-8 border-b-4 border-slate-900 pb-4">
          <h1 className="text-3xl font-black mb-1 tracking-tighter uppercase">BEYA CREATIVE</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 italic">Atelier de Confection Textile de Haute Qualité</p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-black underline decoration-slate-900 underline-offset-8 uppercase">
            {isAr ? 'عقد عمل مهني' : 'CONTRAT DE TRAVAIL'}
          </h2>
        </div>

        <div className="space-y-4 text-[11px]">
          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">1. {isAr ? 'الأطراف المتعاقدة' : 'LES PARTIES'}:</p>
            <div className={`space-y-0.5 ${isAr ? 'pr-4' : 'pl-4'}`}>
              <p>• <b>{isAr ? 'المشغل' : 'Employeur'}:</b> BEYA CREATIVE — Représenté par la Direction.</p>
              <p>• <b>{isAr ? 'الأجير' : 'Employé(e)'}:</b> {empName(selectedContractEmp!)}</p>
              <p>• <b>{isAr ? 'رقم البطاقة الوطنية' : 'CIN'}:</b> {selectedContractEmp?.cin || '...................'}</p>
            </div>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">2. {isAr ? 'فترة التجربة' : "PÉRIODE D'ESSAI"}:</p>
            <p className="italic leading-normal">
              {isAr 
                ? "يخضع هذا العقد لفترة تجربة مدتها 15 يوماً (خاضعة للتجديد مرة واحدة)، طبقاً لمقتضيات المادة 14 من مدونة الشغل. خلال هذه الفترة، يمكن لأي طرف إنهاء العقد دون إشعار مسبق أو تعويض." 
                : "Le présent contrat est soumis à une période d'essai de 15 jours (renouvelable une fois), conformément à l'article 14 du Code du Travail. Durant cette période, chacune des parties peut rompre le contrat sans préavis ni indemnité."}
            </p>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">3. {isAr ? 'طبيعة العمل وساعات العمل' : 'POSTE ET DURÉE DU TRAVAIL'}:</p>
            <p>
              {isAr 
                ? `يشتغل الأجير كـ "${selectedContractEmp?.poste || 'عامل'}" لمدة 44 ساعة في الأسبوع. وتحدد أوقات العمل من الساعة 08:00 صباحاً إلى الساعة 18:00 مساءً، مع احترام القوانين الداخلية للورشة.` 
                : `L'employé(e) occupera le poste de "${selectedContractEmp?.poste || 'Ouvrier'}" pour une durée hebdomadaire de 44 heures. Les horaires de travail sont fixés de 08h00 à 18h00, conformément à la législation en vigueur et au règlement intérieur.`}
            </p>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">4. {isAr ? 'الأجر والضمان الاجتماعي' : 'RÉMUNÉRATION ET CNSS'}:</p>
            <p>
              {isAr 
                ? `تم تحديد الأجر في ${(selectedContractEmp?.salaireMensuel || 0).toLocaleString()} درهم. تلتزم الشركة بالتصريح بالأجير لدى الصندوق الوطني للضمان الاجتماعي (CNSS) فور استيفاء الشروط القانونية.` 
                : `Le salaire est fixé à ${(selectedContractEmp?.salaireMensuel || 0).toLocaleString()} MAD. L'employeur s'engage à déclarer l'employé(e) à la CNSS conformément aux dispositions légales.`}
            </p>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">5. {isAr ? 'الالتزامات المهنية' : 'OBLIGATIONS'}:</p>
            <p className="leading-relaxed">
              {isAr 
                ? "يلتزم الأجير بالحفاظ على أسرار الشركة، وبسلامة المعدات والآلات المسلمة له، وباحترام معايير الجودة والسلامة الصحية داخل مقر العمل. أي خطأ جسيم قد يؤدي إلى الفصل دون تعويض طبقاً للمادة 61 من مدونة الشغل." 
                : "L'employé(e) s'engage à respecter le secret professionnel, à prendre soin du matériel et à respecter les normes d'hygiène et de sécurité. Toute faute grave pourra entraîner un licenciement sans indemnité (Art. 61 du Code du Travail)."}
            </p>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-20 mt-12 text-center items-end">
          <div className="border-t-2 border-slate-300 pt-2">
            <p className="font-black uppercase text-[10px] tracking-widest">{isAr ? 'توقيع الأجير' : 'Signature Employé(e)'}</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">{isAr ? '(تصحيح الإمضاء ضروري)' : '(Légalisation obligatoire)'}</p>
          </div>
          <div className="border-t-2 border-slate-300 pt-2">
            <p className="font-black uppercase text-[10px] tracking-widest">{isAr ? 'توقيع الإدارة' : 'Signature Direction'}</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">BEYA CREATIVE — {isAr ? 'خاتم الشركة' : 'Cachet'}</p>
          </div>
        </div>

        <div className="mt-12 text-[8px] text-center text-slate-400 uppercase tracking-widest border-t pt-2">
          {isAr ? 'تم الاستخراج عبر نظام BEYA ERP — نظام التسيير المندمج' : 'Généré via BEYA ERP — Systéme de Gestion Intégré Textile'}
        </div>
      </div>
      {/* 📊 Salary & CNSS Simulator */}
      {showSimulator && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-white/20 relative">
             <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500 rounded-t-[3rem]" />
             <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">
               {isAr ? 'حاسبة تكاليف الأجير' : 'Simulateur Salaire & CNSS'}
             </h3>

             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                    {isAr ? 'الراتب الصافي المطلوب (Net)' : 'Salaire NET souhaité (MAD)'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={simNet}
                      onChange={e => setSimNet(e.target.value)}
                      placeholder="3000"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-lg font-black text-slate-900 outline-none focus:border-emerald-500 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">MAD</span>
                  </div>
                </div>

                {simNet && Number(simNet) > 0 && (() => {
                  const net = Number(simNet);
                  const brutApprox = net / 0.9326; // Approx for small salaries
                  const cnssPatronale = brutApprox * 0.248; // Approx 24.8%
                  const totalCost = brutApprox + cnssPatronale;
                  return (
                    <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200/50 pb-2">
                        <span>{isAr ? 'الراتب الخام' : 'Salaire Brut'}</span>
                        <span className="font-black">{Math.round(brutApprox).toLocaleString()} MAD</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200/50 pb-2">
                        <span>{isAr ? 'مساهمة CNSS (المشغل)' : 'Charges Patronales'}</span>
                        <span className="font-black">+{Math.round(cnssPatronale).toLocaleString()} MAD</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{isAr ? 'التكلفة الإجمالية عليك' : 'Coût Total pour vous'}</p>
                        <p className="text-3xl font-black text-emerald-900 tabular-nums">
                          {Math.round(totalCost).toLocaleString()} <span className="text-sm">MAD</span>
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <button 
                  onClick={() => setShowSimulator(false)}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                >
                  {isAr ? 'إغلاق' : 'Fermer'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
