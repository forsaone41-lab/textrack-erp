import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  MessageCircle,
  Scissors,
  Calendar,
  User as UserIcon,
  Eye,
  X,
  Check,
  DollarSign,
  Wallet,
  RotateCcw,
  LayoutDashboard,
  AlertTriangle,
  Plus,
  Play,
  Send,
  FileCheck,
  TrendingUp,
  CreditCard,
  Copy,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Printer,
  FileText,
  Upload,
  Download,
  Paperclip,
  Trash2,
  FileArchive,
  Image as ImageIcon,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import FicheTechniqueModelisteModal, { printFicheTechniqueModeliste, sanitizeNotesForModeliste } from '../components/FicheTechniqueModelisteModal';
import { useLang } from '../contexts/LangContext';
import {
  FicheTechnique,
  Commande,
  Facture,
  User,
  Lead,
  Employe,
  PaiementSalaire,
  Charge,
  loadData,
  saveRecord,
  deleteRecord,
  parseLeadMeta,
  parseLeadDetailsJson,
  genId
} from '../types';
import { supabase } from '../supabase';
import {
  PayrollExtrasData,
  loadPayrollExtras,
  saveModelisteWorkLog,
  computeWorkerMonthBalance,
  isModelisteEmployee,
  findMatchingEmployeeForUser,
  applyRuleProfileSync,
  syncEmployeeProfileAndBank
} from '../utils/payrollEngine';

interface ModelisteSuiviProps {
  currentUser: User;
}

export type ModelisteWorkStatus = 'a_faire' | 'en_cours' | 'termine';
type MainTab = 'dashboard' | 'a_tarifer' | 'travaux' | 'profil';

export interface PatronFileAttachment {
  id: string;
  name: string;
  size?: string;
  type: string; // 'pdf' | 'archive' | 'image' | 'dxf' | 'other'
  url: string; // dataUrl or storage url
  uploadedAt: string;
  uploadedBy: string;
}

export interface PatronMessage {
  id: string;
  sender: 'modeliste' | 'admin' | 'client';
  senderName: string;
  text: string;
  date: string;
}

export interface ModelItem {
  id: string;
  sourceType: 'lead' | 'fiche';
  modele: string;
  client: string;
  phone?: string;
  ville?: string;
  photo?: string;
  rawDate: string; // YYYY-MM-DD or ISO
  date: string;    // formatted display date
  quantity?: number;
  patronagePrice: number;
  isFree?: boolean;
  prixEchantillon: number;
  patronageStatus: 'requested' | 'priced';
  patronageNotes?: string;
  clientNotes?: string;
  patronagePaid: boolean;
  patronagePaidAt?: string | null;
  patronagePaidMois?: string | null;
  isValidatedByClient: boolean;
  isValidatedByAdmin: boolean;
  isValidatedToWork: boolean; // Client OR Admin validated
  deadlineDate?: string;      // YYYY-MM-DD assigned target date
  workStatus: ModelisteWorkStatus;
  workCompletedAt?: string | null;
  modelisteId?: string;
  modelisteName?: string;
  adminCounterPrice?: number;
  patronageNegotiationNotes?: string;
  patronageNegotiationStatus?: string;
  modelisteGradation?: Record<string, Record<string, any>>;
  patronFiles: PatronFileAttachment[];
  patronMessages: PatronMessage[];
  lead?: Lead;
  fiche?: FicheTechnique;
}

function normalizeName(str?: string): string {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function toYmd(raw?: string | null): string {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function getDeadlineBadge(
  deadlineDate: string | undefined,
  workStatus: ModelisteWorkStatus,
  isAr: boolean
): { label: string; cls: string; urgency: number } {
  if (workStatus === 'termine') {
    return {
      label: isAr ? 'منجز ومسلّم ✓' : 'Terminé & Livré ✓',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      urgency: 99
    };
  }
  if (!deadlineDate) {
    return {
      label: isAr ? 'التسليم: غير محدد' : 'Délai : Non défini',
      cls: 'bg-slate-100 text-slate-600 border-slate-200',
      urgency: 50
    };
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const diffMs = new Date(deadlineDate + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays < 0) {
    return {
      label: isAr ? `متأخر بـ ${Math.abs(diffDays)} يوم` : `En retard (${Math.abs(diffDays)} j)`,
      cls: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      urgency: diffDays
    };
  }
  if (diffDays === 0) {
    return {
      label: isAr ? 'التسليم اليوم !' : "Aujourd'hui !",
      cls: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      urgency: 0
    };
  }
  if (diffDays <= 3) {
    return {
      label: isAr ? `خلال ${diffDays} أيام` : `Dans ${diffDays} j`,
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      urgency: diffDays
    };
  }
  return {
    label: isAr ? `خلال ${diffDays} يوم` : `Dans ${diffDays} j`,
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    urgency: diffDays
  };
}

export default function ModelisteSuivi({ currentUser }: ModelisteSuiviProps) {
  const { isAr } = useLang();
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [paiements, setPaiements] = useState<PaiementSalaire[]>([]);
  const [payrollExtras, setPayrollExtras] = useState<PayrollExtrasData>({
    rules: [],
    modelLogs: [],
    adjustments: []
  });

  const [selectedMois, setSelectedMois] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as MainTab;
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (initialTab && ['dashboard', 'a_tarifer', 'travaux', 'profil'].includes(initialTab)) {
      return initialTab;
    }
    return 'dashboard';
  });

  useEffect(() => {
    const t = searchParams.get('tab') as MainTab;
    if (t && ['dashboard', 'a_tarifer', 'travaux', 'profil'].includes(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleTabChange = (t: MainTab) => {
    setActiveTab(t);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', t);
      return next;
    }, { replace: true });
  };
  const [pricingSubFilter, setPricingSubFilter] = useState<'all' | 'unpriced' | 'priced'>('all');
  const [workFilter, setWorkFilter] = useState<'all' | 'pending' | 'termine'>('pending');

  const [search, setSearch] = useState('');
  const [selectedModelisteId, setSelectedModelisteId] = useState<string>(isAdmin ? 'all' : currentUser.id);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Pricing inputs
  const [pricingItem, setPricingItem] = useState<ModelItem | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [counterPriceInput, setCounterPriceInput] = useState<Record<string, string>>({});
  const [notesInput, setNotesInput] = useState('');

  // Admin Quick Send New Model for Pricing
  const [showNewModelModal, setShowNewModelModal] = useState(false);
  const [newModelForm, setNewModelForm] = useState({
    modele: '',
    client: '',
    quantity: '1',
    deadlineDate: '',
    modelisteId: '',
    notes: ''
  });

  // Modéliste Profile & RIB (auto-synced with RH)
  const [profileForm, setProfileForm] = useState({
    nom: currentUser.nom || '',
    telephone: currentUser.telephone || '',
    email: currentUser.email || '',
    cin: '',
    adresse: '',
    banque: '',
    rib: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedRib, setCopiedRib] = useState(false);
  const [techPackItem, setTechPackItem] = useState<ModelItem | null>(null);

  // On-site chat & notes
  const [activeChatModelId, setActiveChatModelId] = useState<string | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [uploadingModelId, setUploadingModelId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveTaskFromModeliste = async (item: ModelItem) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من إزالة مهمة "${item.modele}" (${item.client}) من ورشة الموديليست؟`
      : `Retirer la tâche "${item.modele}" (${item.client}) de l'atelier du modéliste ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (item.sourceType === 'lead') {
        const lead = leads.find(l => l.id === item.id);
        if (lead) {
          const ext = parseLeadDetailsJson(lead.details);
          delete ext.modelisteId;
          delete ext.modelisteName;
          ext.adminValidatedToWork = false;
          ext.clientValidated = false;
          ext.hiddenFromModeliste = true;
          await saveRecord('leads', { ...lead, details: JSON.stringify(ext), crmPriceConfirmed: false }, true);
        }
      } else if (item.sourceType === 'fiche') {
        const fiche = fiches.find(f => f.id === item.id);
        if (fiche) {
          const updated = { ...fiche, modelisteId: undefined };
          await saveRecord('fiches_techniques', updated, true);
        }
      }

      try {
        const hidden = JSON.parse(localStorage.getItem('textrack_hidden_modeliste_items') || '[]');
        if (!hidden.includes(item.id)) hidden.push(item.id);
        localStorage.setItem('textrack_hidden_modeliste_items', JSON.stringify(hidden));
      } catch (e) {}

      showToast(isAr ? 'تمت إزالة المهمة من ورشة الموديليست' : 'Tâche retirée de l\'atelier');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du retrait', true);
    }
  };

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, cmdsData, factsData, fichesData, usersData, empsData, paysData, extrasData] = await Promise.all([
        supabase
          .from('leads')
          .select('id, name, phone, ville, type, quantity, status, date, details, photo, crmStage, crmPrice, crmPriceConfirmed')
          .not('name', 'in', '(__SYSTEM_CONFIG__,__WORKER_PHOTO__,__SYSTEM_LISTE_ATTENTE__,__DELETED__,__RH_PAIE_RULE__,__RH_MODEL_LOG__,__RH_PAIE_ADJ__)')
          .order('date', { ascending: false })
          .limit(350),
        loadData<Commande>('commandes'),
        loadData<Facture>('factures'),
        loadData<FicheTechnique>('fiches'),
        loadData<User>('users'),
        loadData<Employe>('employes'),
        loadData<PaiementSalaire>('paiements_salaires'),
        loadPayrollExtras()
      ]);

      const parsedLeads = (leadsRes.data || []).map((raw: any) => parseLeadMeta(raw));
      setLeads(parsedLeads);
      setCommandes(cmdsData || []);
      setFactures(factsData || []);
      setFiches(fichesData || []);
      setUsers(usersData || []);
      setEmployes(empsData || []);
      setPaiements(paysData || []);
      setPayrollExtras(extrasData);
    } catch (e) {
      console.error('Erreur chargement données Modéliste:', e);
      showToast(isAr ? 'حدث خطأ أثناء تحميل البيانات' : 'Erreur de chargement des données', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const modelistes = useMemo(() => users.filter(u => u.role === 'modeliste'), [users]);

  const hydratedEmployes = useMemo(() => {
    return employes.map(emp => {
      const empRule = payrollExtras.rules.find(r => r.employeId === emp.id);
      return applyRuleProfileSync(emp, empRule);
    });
  }, [employes, payrollExtras.rules]);

  // Target modéliste user
  const activeProfileUser: User = useMemo(() => {
    if (isAdmin && selectedModelisteId !== 'all') {
      return users.find(u => u.id === selectedModelisteId) || currentUser;
    }
    if (isAdmin && selectedModelisteId === 'all' && modelistes.length > 0) {
      return modelistes[0];
    }
    return users.find(u => u.id === currentUser.id) || currentUser;
  }, [isAdmin, selectedModelisteId, users, modelistes, currentUser]);

  const linkedEmployee: Employe | undefined = useMemo(() => {
    const targetUserId = isAdmin ? (selectedModelisteId === 'all' ? '' : selectedModelisteId) : currentUser.id;
    const targetUser = users.find(u => u.id === targetUserId) || (!isAdmin ? currentUser : undefined);
    return findMatchingEmployeeForUser(targetUser, hydratedEmployes);
  }, [isAdmin, selectedModelisteId, currentUser, users, hydratedEmployes]);

  const profileTargetEmployee: Employe | undefined = useMemo(() => {
    return findMatchingEmployeeForUser(activeProfileUser, hydratedEmployes);
  }, [activeProfileUser, hydratedEmployes]);

  useEffect(() => {
    const emp = profileTargetEmployee;
    const fullNameFromEmp = emp ? `${emp.prenom || ''} ${emp.nom || ''}`.trim() : '';
    setProfileForm({
      nom: fullNameFromEmp || activeProfileUser.nom || '',
      telephone: emp?.telephone || activeProfileUser.telephone || '',
      email: emp?.email || activeProfileUser.email || '',
      cin: emp?.cin || '',
      adresse: emp?.adresse || activeProfileUser.adresse || '',
      banque: emp?.banque || '',
      rib: emp?.rib || ''
    });
  }, [profileTargetEmployee, activeProfileUser]);

  // Build unified model items
  const modelItems: ModelItem[] = useMemo(() => {
    const items: ModelItem[] = [];

    leads.forEach(lead => {
      const ext = parseLeadDetailsJson(lead.details);
      const patPrice = Number(ext.patronagePrice ?? (lead as any).patronagePrice) || 0;
      const echPrice = Number(ext.prixEchantillon ?? (lead as any).prixEchantillon) || 0;

      const isPatronageLead =
        ext.patronageStatus === 'requested' ||
        ext.patronageStatus === 'priced' ||
        patPrice > 0 ||
        Boolean(ext.adminValidatedToWork);
      if (!isPatronageLead) return;

      const normClient = normalizeName(lead.name);
      const normModele = normalizeName(lead.type);

      const cmd = commandes.find(c => {
        if (ext.commandeId && c.id === ext.commandeId) return true;
        const cClient = normalizeName(c.client);
        const cModele = normalizeName(c.modele);
        return (
          (cClient && normClient && (cClient === normClient || cClient.includes(normClient) || normClient.includes(cClient))) &&
          (!normModele || !cModele || cModele === normModele || cModele.includes(normModele) || normModele.includes(cModele))
        );
      });

      const devis = factures.find(f => {
        if (f.typeDoc !== 'devis') return false;
        const fClient = normalizeName(f.client);
        return fClient && normClient && (fClient === normClient || fClient.includes(normClient) || normClient.includes(fClient));
      });

      const facture = factures.find(f => {
        if (f.typeDoc === 'devis' || f.typeDoc === 'recu') return false;
        const fClient = normalizeName(f.client);
        return fClient && normClient && (fClient === normClient || fClient.includes(normClient) || normClient.includes(fClient));
      });

      const isValidatedByClient = Boolean(
        ext.clientValidated === true ||
          lead.crmStage === 'confirme' ||
          lead.status === 'completed' ||
          lead.crmPriceConfirmed === true ||
          (cmd && ['echantillon_valide', 'en_cours', 'terminé', 'livré'].includes(cmd.statut)) ||
          (facture && ['payée', 'en_cours'].includes(facture.statut)) ||
          (devis && devis.statut === 'payée')
      );

      const isValidatedByAdmin = Boolean(ext.adminValidatedToWork === true);
      const isValidatedToWork = isValidatedByClient || isValidatedByAdmin;
      const deadlineDate = toYmd(ext.deadlineDate || cmd?.dateLivraisonPrevue);

      let workStatus: ModelisteWorkStatus = 'a_faire';
      if (ext.workStatus === 'en_cours' || ext.workStatus === 'termine' || ext.workStatus === 'a_faire') {
        workStatus = ext.workStatus;
      } else if (cmd && ['terminé', 'livré'].includes(cmd.statut)) {
        workStatus = 'termine';
      }

      const rawDate = toYmd(ext.patronagePricedAt || ext.clientValidatedAt || ext.adminValidatedAt || lead.date) || new Date().toISOString().slice(0, 10);

      const patronFiles: PatronFileAttachment[] = Array.isArray(ext.patronFiles) ? ext.patronFiles : [];
      const patronMessages: PatronMessage[] = Array.isArray(ext.patronMessages) ? ext.patronMessages : [];

      items.push({
        id: lead.id,
        sourceType: 'lead',
        modele: (lead.type || 'Modèle Référence').replace(' (CMT - Client Tissu)', ''),
        client: lead.name || 'Client',
        phone: lead.phone,
        ville: lead.ville,
        photo: lead.photo || (lead.photos && lead.photos[0]),
        rawDate,
        date: lead.date ? new Date(lead.date).toLocaleDateString('fr-FR') : '—',
        quantity: Number(lead.quantity) || 1,
        patronagePrice: patPrice,
        isFree: Boolean(ext.isFree === true || (ext.patronageStatus === 'priced' && patPrice === 0) || (lead as any).isFree),
        prixEchantillon: echPrice,
        patronageStatus: ext.patronageStatus === 'priced' || patPrice > 0 ? 'priced' : 'requested',
        patronageNotes: ext.patronageNotes || '',
        clientNotes: sanitizeNotesForModeliste(ext.clientNotes || (!lead.details?.trim().startsWith('{') ? lead.details : '')),
        patronagePaid: Boolean(ext.patronagePaid === true),
        patronagePaidAt: ext.patronagePaidAt || null,
        patronagePaidMois: ext.patronagePaidMois || null,
        isValidatedByClient,
        isValidatedByAdmin,
        isValidatedToWork,
        deadlineDate,
        workStatus,
        workCompletedAt: ext.workCompletedAt || null,
        adminCounterPrice: Number(ext.adminCounterPrice) || 0,
        patronageNegotiationNotes: ext.patronageNegotiationNotes || '',
        patronageNegotiationStatus: ext.patronageNegotiationStatus || '',
        modelisteId: ext.modelisteId,
        modelisteName: ext.modelisteName,
        modelisteGradation: ext.modelisteGradation || ext.customMesures,
        patronFiles,
        patronMessages,
        lead
      });
    });

    fiches.forEach(fiche => {
      if (!fiche.modelisteId) return;

      const normFicheModele = normalizeName(fiche.modele);
      const normFicheClient = normalizeName(fiche.client);

      const alreadyInLead = items.some(
        it => normalizeName(it.modele) === normFicheModele && normalizeName(it.client) === normFicheClient
      );
      if (alreadyInLead) return;

      const cmd = commandes.find(c => {
        const cClient = normalizeName(c.client);
        const cModele = normalizeName(c.modele);
        return cClient === normFicheClient && (cModele === normFicheModele || cModele.includes(normFicheModele));
      });

      const isValidatedByClient = Boolean(
        cmd && ['echantillon_valide', 'en_cours', 'terminé', 'livré'].includes(cmd.statut)
      );
      const modUser = users.find(u => u.id === fiche.modelisteId);

      items.push({
        id: fiche.id,
        sourceType: 'fiche',
        modele: fiche.modele,
        client: fiche.client,
        photo: fiche.photo || fiche.patronagePhoto,
        rawDate: toYmd(fiche.createdAt) || new Date().toISOString().slice(0, 10),
        date: fiche.createdAt || '—',
        quantity: 1,
        patronagePrice: 0,
        prixEchantillon: 0,
        patronageStatus: 'priced',
        patronagePaid: false,
        isValidatedByClient,
        isValidatedByAdmin: false,
        isValidatedToWork: isValidatedByClient,
        deadlineDate: toYmd(cmd?.dateLivraisonPrevue),
        workStatus: cmd && ['terminé', 'livré'].includes(cmd.statut) ? 'termine' : 'a_faire',
        modelisteId: fiche.modelisteId,
        modelisteName: modUser?.nom,
        modelisteGradation: (fiche as any).modelisteGradation,
        patronFiles: [],
        patronMessages: [],
        fiche
      });
    });

    return items;
  }, [leads, fiches, commandes, factures, users]);

  const filteredByRole = useMemo(() => {
    const hiddenLocally: string[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('textrack_hidden_modeliste_items') || '[]');
      } catch {
        return [];
      }
    })();

    return modelItems.filter(item => {
      if (hiddenLocally.includes(item.id)) return false;

      // Filter out test items explicitly hidden from modéliste
      if (item.lead) {
        const ext = parseLeadDetailsJson(item.lead.details);
        if (ext.hiddenFromModeliste) return false;
      }

      if (isAdmin) {
        if (selectedModelisteId === 'all') return true;
        return item.modelisteId === selectedModelisteId;
      }

      // Modéliste ONLY sees items explicitly assigned to him
      return Boolean(item.modelisteId && item.modelisteId === currentUser.id);
    });
  }, [modelItems, isAdmin, selectedModelisteId, currentUser.id]);

  // Executive Analytics Summary
  const summary = useMemo(() => {
    const unpricedList = filteredByRole.filter(i => i.patronageStatus === 'requested');
    const pricedAwaitingAgreement = filteredByRole.filter(i => i.patronageStatus === 'priced' && !i.isValidatedToWork);
    const allValidatedWork = filteredByRole.filter(i => i.isValidatedToWork);
    const activeWork = allValidatedWork.filter(i => i.workStatus !== 'termine');
    const completedWork = allValidatedWork.filter(i => i.workStatus === 'termine');

    // Values
    const totalCompletedMAD = completedWork.reduce((s, i) => s + (Number(i.patronagePrice) || 0), 0);
    const totalActiveMAD = activeWork.reduce((s, i) => s + (Number(i.patronagePrice) || 0), 0);
    const totalValidatedAllMAD = allValidatedWork.reduce((s, i) => s + (Number(i.patronagePrice) || 0), 0);

    // Selected Month specifics
    const monthCompletedModels = completedWork.filter(i => {
      const m = (i.workCompletedAt || i.rawDate || '').slice(0, 7);
      return m === selectedMois;
    });
    const monthEarnedMAD = monthCompletedModels.reduce((s, i) => s + (Number(i.patronagePrice) || 0), 0);

    // Payments in selected month
    const rhPaysInMonth = linkedEmployee
      ? paiements.filter(p => p.employeId === linkedEmployee.id && p.mois === selectedMois)
      : [];
    const monthPaidMAD = rhPaysInMonth.reduce((s, p) => s + (Number(p.montant) || 0), 0);
    const monthRemainingMAD = Math.max(0, monthEarnedMAD - monthPaidMAD);

    // All-time balance
    const totalPaidAllTime = linkedEmployee
      ? paiements.filter(p => p.employeId === linkedEmployee.id).reduce((s, p) => s + (Number(p.montant) || 0), 0)
      : allValidatedWork.filter(i => i.patronagePaid).reduce((s, i) => s + (Number(i.patronagePrice) || 0), 0);
    const totalRemainingAllTime = Math.max(0, totalCompletedMAD - totalPaidAllTime);

    return {
      completedCount: completedWork.length,
      completedMAD: totalCompletedMAD,
      activeCount: activeWork.length,
      activeMAD: totalActiveMAD,
      unpricedCount: unpricedList.length,
      pricedAwaitingCount: pricedAwaitingAgreement.length,
      totalToPriceCount: unpricedList.length + pricedAwaitingAgreement.length,
      monthCompletedCount: monthCompletedModels.length,
      monthEarnedMAD,
      monthPaidMAD,
      monthRemainingMAD,
      totalCompletedMAD,
      totalPaidAllTime,
      totalRemainingAllTime
    };
  }, [filteredByRole, selectedMois, linkedEmployee, paiements]);

  // Search helper
  const matchesSearch = (item: ModelItem) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (item.modele || '').toLowerCase().includes(q) ||
      (item.client || '').toLowerCase().includes(q) ||
      (item.modelisteName || '').toLowerCase().includes(q)
    );
  };

  // Pricing Items (Tab 2)
  const pricingItems = useMemo(() => {
    return filteredByRole.filter(item => {
      if (!matchesSearch(item)) return false;
      if (item.isValidatedToWork) return false; // already agreed & moved to tasks!
      if (pricingSubFilter === 'unpriced') return item.patronageStatus === 'requested';
      if (pricingSubFilter === 'priced') return item.patronageStatus === 'priced';
      return true;
    });
  }, [filteredByRole, pricingSubFilter, search]);

  // Work Items (Tab 3: Tasks & Delivery)
  const workItems = useMemo(() => {
    return filteredByRole
      .filter(item => {
        if (!item.isValidatedToWork) return false;
        if (!matchesSearch(item)) return false;
        if (workFilter === 'pending') return item.workStatus !== 'termine';
        if (workFilter === 'termine') return item.workStatus === 'termine';
        return true;
      })
      .sort((a, b) => {
        const badgeA = getDeadlineBadge(a.deadlineDate, a.workStatus, isAr);
        const badgeB = getDeadlineBadge(b.deadlineDate, b.workStatus, isAr);
        return badgeA.urgency - badgeB.urgency;
      });
  }, [filteredByRole, workFilter, search, isAr]);

  // ─── ACTIONS ─────────────────────────────────────────────────────────

  // 1. Submit price proposal
  const handleSavePrice = async (item: ModelItem, customPrice?: number) => {
    if (!item.lead) return;
    const priceToSet = customPrice !== undefined ? customPrice : Number(priceInput);
    if (isNaN(priceToSet) || priceToSet < 0) {
      showToast(isAr ? 'المرجو إدخال ثمن الباتروناج بشكل صحيح' : 'Veuillez saisir un tarif valide', true);
      return;
    }
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const isFree = priceToSet === 0;
      const newDetails = {
        ...ext,
        patronageStatus: 'priced',
        patronagePrice: priceToSet,
        isFree,
        patronageNotes: notesInput || ext.patronageNotes || '',
        modelisteId: ext.modelisteId || (!isAdmin ? currentUser.id : undefined),
        modelisteName: ext.modelisteName || (!isAdmin ? currentUser.nom : undefined),
        patronagePricedAt: new Date().toISOString()
      };
      await saveRecord('leads', { ...item.lead, patronagePrice: priceToSet, details: JSON.stringify(newDetails) }, true);
      setPricingItem(null);
      setPriceInput('');
      showToast(priceToSet === 0 ? (isAr ? 'تم تمرير الموديل مجاناً (0 درهم - FREE)' : 'Modèle validé Gratuit (0 MAD)') : (isAr ? `تم تسجيل الثمن (${priceToSet} درهم) واقتراحه بنجاح` : `Tarif (${priceToSet} MAD) enregistré`));
      await fetchData();
    } catch (e) {
      console.error('Erreur sauvegarde tarif:', e);
      showToast(isAr ? 'حدث خطأ أثناء حفظ التسعيرة' : 'Erreur lors de la sauvegarde du tarif', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // 2. Propose Counter-Price (Admin to Modéliste)
  const handleSendCounterPrice = async (item: ModelItem) => {
    if (!item.lead) return;
    const cPrice = Number(counterPriceInput[item.id]);
    if (!cPrice || isNaN(cPrice) || cPrice <= 0) {
      showToast(isAr ? 'أدخل ثمن العرض المقابل' : 'Saisir un contre-tarif valide', true);
      return;
    }
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const newDetails = {
        ...ext,
        adminCounterPrice: cPrice,
        patronageNegotiationStatus: 'counter_offered',
        patronageNegotiationNotes: `Proposition Admin: ${cPrice} MAD`
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      setCounterPriceInput(prev => ({ ...prev, [item.id]: '' }));
      showToast(isAr ? `تم إرسال العرض المقابل (${cPrice} درهم) للموديليست` : `Contre-offre de ${cPrice} MAD envoyée`);
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'حدث خطأ' : 'Erreur', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // 3. KEY USER REQUIREMENT: Accept Price & Move DIRECTLY to Tasks (Travaux)
  const handleAcceptPriceAndMoveToWork = async (item: ModelItem, agreedPrice: number) => {
    if (!item.lead) return;
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const defaultDeadline = item.deadlineDate || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      const assignedModUser = users.find(u => u.id === (item.modelisteId || currentUser.id));

      const newDetails = {
        ...ext,
        patronageStatus: 'priced',
        patronagePrice: agreedPrice,
        adminValidatedToWork: true,
        adminValidatedAt: new Date().toISOString(),
        adminValidatedBy: currentUser.nom || 'Administration',
        workStatus: 'a_faire',
        deadlineDate: defaultDeadline,
        modelisteId: item.modelisteId || (!isAdmin ? currentUser.id : undefined),
        modelisteName: assignedModUser?.nom || ext.modelisteName || currentUser.nom
      };

      await saveRecord('leads', { ...item.lead, patronagePrice: agreedPrice, details: JSON.stringify(newDetails) }, true);

      // Sync to payrollEngine work log
      const targetEmp = linkedEmployee || (assignedModUser ? findMatchingEmployeeForUser(assignedModUser, hydratedEmployes) : undefined);
      if (targetEmp && agreedPrice > 0) {
        await saveModelisteWorkLog({
          employeId: targetEmp.id,
          date: new Date().toISOString().slice(0, 10),
          modeleName: item.modele,
          client: item.client,
          typeTravail: 'patronage_complet',
          quantite: 1,
          tarifUnitaire: agreedPrice,
          statut: 'valide',
          sourceLeadId: item.id,
          notes: `Accord de prix: ${agreedPrice} MAD (Délai: ${defaultDeadline})`
        });
      }

      showToast(
        isAr
          ? `✓ تم اعتماد ثمن ${agreedPrice} درهم ونقل الموديل فوراً إلى قائمة المهام والإنجاز!`
          : `✓ Tarif de ${agreedPrice} MAD validé ! Modèle transféré directement dans Travaux.`
      );

      // Auto-switch directly to Tasks tab as requested by user!
      handleTabChange('travaux');
      setWorkFilter('pending');
      await fetchData();
    } catch (err) {
      console.error('Erreur validation prix:', err);
      showToast(isAr ? 'حدث خطأ أثناء اعتماد الثمن' : 'Erreur lors de la validation du tarif', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // 4. Update Work Progress (À faire -> En cours -> Terminé & Livré)
  const handleUpdateWorkStatus = async (item: ModelItem, nextStatus: ModelisteWorkStatus) => {
    if (!item.lead) return;
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const isComplete = nextStatus === 'termine';
      const nowIso = new Date().toISOString();

      const newDetails = {
        ...ext,
        workStatus: nextStatus,
        workCompletedAt: isComplete ? nowIso : null
      };

      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);

      // If completed, ensure work log is logged in payroll
      if (isComplete && linkedEmployee && item.patronagePrice > 0) {
        await saveModelisteWorkLog({
          employeId: linkedEmployee.id,
          date: nowIso.slice(0, 10),
          modeleName: item.modele,
          client: item.client,
          typeTravail: 'patronage_complet',
          quantite: 1,
          tarifUnitaire: item.patronagePrice,
          statut: 'valide',
          sourceLeadId: item.id,
          notes: `Livré le ${nowIso.slice(0, 10)}`
        });
      }

      showToast(
        isComplete
          ? (isAr ? '🎉 تم تسليم الموديل بنجاح واحتسابه في رصيد أرباحك!' : '🎉 Modèle terminé et livré ! Crédité sur votre balance.')
          : (isAr ? 'تم تحديث حالة العمل' : 'Statut mis à jour')
      );
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'حدث خطأ' : 'Erreur', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // 5. Upload Pattern Files (PDF, RAR, ZIP, DXF, Images)
  const handleUploadPatronFile = async (item: ModelItem, file: File) => {
    if (!item.lead) return;
    setUploadingModelId(item.id);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

        const fileType = fileExt === 'pdf' ? 'pdf'
          : ['rar', 'zip', '7z', 'tar'].includes(fileExt) ? 'archive'
          : ['png', 'jpg', 'jpeg', 'webp'].includes(fileExt) ? 'image'
          : ['dxf', 'hpgl', 'plt', 'ai'].includes(fileExt) ? 'cad'
          : 'other';

        const newAttachment: PatronFileAttachment = {
          id: genId(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: fileType,
          url: dataUrl,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.nom || (isAdmin ? 'Admin' : 'Modéliste')
        };

        const ext = parseLeadDetailsJson(item.lead?.details);
        const currentFiles = Array.isArray(ext.patronFiles) ? ext.patronFiles : [];
        const nowIso = new Date().toISOString();
        const newDetails = {
          ...ext,
          patronFiles: [...currentFiles, newAttachment],
          workStatus: 'termine',
          workCompletedAt: ext.workCompletedAt || nowIso
        };

        await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);

        // Auto-log to payroll if completing work
        if (linkedEmployee && item.patronagePrice > 0) {
          await saveModelisteWorkLog({
            employeId: linkedEmployee.id,
            date: nowIso.slice(0, 10),
            modeleName: item.modele,
            client: item.client,
            typeTravail: 'patronage_complet',
            quantite: 1,
            tarifUnitaire: item.patronagePrice,
            statut: 'valide',
            sourceLeadId: item.id,
            notes: `Livré le ${nowIso.slice(0, 10)} (Fichier: ${file.name})`
          }).catch(() => {});
        }

        showToast(isAr ? `✓ تم رفع الملف "${file.name}" واكتمال السمطة 100% (مسلّم بنجاح)! 🎉` : `Fichier "${file.name}" téléversé et modèle complété à 100% ! 🎉`);
        setUploadingModelId(null);
        await fetchData();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Erreur upload:', err);
      showToast(isAr ? 'تعذر رفع الملف' : 'Erreur de téléversement', true);
      setUploadingModelId(null);
    }
  };

  // 6. Delete Uploaded Pattern File
  const handleDeletePatronFile = async (item: ModelItem, fileId: string) => {
    if (!item.lead) return;
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const currentFiles: PatronFileAttachment[] = Array.isArray(ext.patronFiles) ? ext.patronFiles : [];
      const updatedFiles = currentFiles.filter(f => f.id !== fileId);
      const newDetails = {
        ...ext,
        patronFiles: updatedFiles
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(isAr ? 'تم حذف الملف' : 'Fichier supprimé');
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'تعذر الحذف' : 'Erreur de suppression', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // 7. Send On-Site Message / Note between Admin and Modéliste
  const handleSendPatronMessage = async (item: ModelItem) => {
    if (!chatMessageInput.trim() || !item.lead) return;
    const textToSend = chatMessageInput.trim();
    setChatMessageInput('');
    setActionPendingId(item.id);

    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const currentMsgs: PatronMessage[] = Array.isArray(ext.patronMessages) ? ext.patronMessages : [];

      const newMsg: PatronMessage = {
        id: genId(),
        sender: isAdmin ? 'admin' : 'modeliste',
        senderName: currentUser.nom || (isAdmin ? 'Administration' : 'Modéliste'),
        text: textToSend,
        date: new Date().toISOString()
      };

      const newDetails = {
        ...ext,
        patronMessages: [...currentMsgs, newMsg]
      };

      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(isAr ? 'تم إرسال رسالتك مباشرة في الموقع' : 'Message envoyé sur le site');
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'تعذر إرسال الرسالة' : 'Erreur d\'envoi', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // 8. Modéliste Profile & RIB Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRib = profileForm.rib.replace(/\s+/g, '');
    if (cleanRib && cleanRib.length !== 24) {
      showToast(
        isAr ? 'رقم الحساب البنكي RIB يجب أن يتكون من 24 رقماً' : 'Le RIB marocain doit contenir 24 chiffres',
        true
      );
      return;
    }
    setSavingProfile(true);
    try {
      const targetEmp = profileTargetEmployee;
      const existingRule = targetEmp ? payrollExtras.rules.find(r => r.employeId === targetEmp.id) : undefined;
      const res = await syncEmployeeProfileAndBank({
        user: activeProfileUser,
        employes: hydratedEmployes,
        existingRule,
        profile: {
          ...profileForm,
          rib: cleanRib
        }
      });

      setEmployes(prev => prev.map(emp => (emp.id === res.employe.id ? res.employe : emp)));
      setUsers(prev => prev.map(u => (u.id === res.user.id ? res.user : u)));
      showToast(
        isAr
          ? '✓ تم حفظ معلوماتك ورقم الـ RIB ومزامنتها بنجاح مع الـ RH وصفحة الخلاص'
          : '✓ Profil et RIB enregistrés et synchronisés avec RH et Paie'
      );
    } catch (err) {
      showToast(isAr ? 'تعذر حفظ المعلومات' : 'Erreur lors de la sauvegarde', true);
    } finally {
      setSavingProfile(false);
    }
  };

  const copyRib = (rib?: string) => {
    const clean = (rib || '').replace(/\s+/g, '');
    if (!clean) return;
    navigator.clipboard?.writeText(clean);
    setCopiedRib(true);
    showToast(isAr ? 'تم نسخ الـ RIB بنجاح' : 'RIB copié');
    setTimeout(() => setCopiedRib(false), 2000);
  };

  // Technical Pack Fiche matching
  const getMatchingFiche = (mItem: ModelItem | null): FicheTechnique | undefined => {
    if (!mItem) return undefined;
    if (mItem.fiche) return mItem.fiche;
    const normItemModele = normalizeName(mItem.modele);
    const normItemClient = normalizeName(mItem.client);
    return fiches.find(f => {
      const normFicheModele = normalizeName(f.modele);
      const normFicheClient = normalizeName(f.client);
      return (
        (normFicheModele === normItemModele || (normFicheModele && normItemModele && (normFicheModele.includes(normItemModele) || normItemModele.includes(normFicheModele)))) &&
        (!normItemClient || !normFicheClient || normFicheClient === normItemClient || normFicheClient.includes(normItemClient) || normItemClient.includes(normFicheClient))
      );
    });
  };

  const handleSaveModelisteTechnicalNotes = async (leadId: string, techNotes: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const ext = parseLeadDetailsJson(lead.details);
    const newDetails = { ...ext, patronageNotes: techNotes };
    await saveRecord('leads', { ...lead, details: JSON.stringify(newDetails) }, true);
    showToast(isAr ? 'تم حفظ الملاحظات التقنية' : 'Notes techniques enregistrées');
    await fetchData();
  };

  const handleSaveModelisteMeasurements = async (itemId: string, measurements: any, sourceType: 'lead' | 'fiche') => {
    if (sourceType === 'lead') {
      const lead = leads.find(l => l.id === itemId);
      if (!lead) return;
      const ext = parseLeadDetailsJson(lead.details);
      const newDetails = { ...ext, modelisteGradation: measurements };
      await saveRecord('leads', { ...lead, details: JSON.stringify(newDetails) }, true);
    } else {
      const fiche = fiches.find(f => f.id === itemId);
      if (!fiche) return;
      await saveRecord('fiches_techniques', { ...fiche, modelisteGradation: measurements }, true);
    }
    showToast(isAr ? 'تم تحديث جدول المقاسات' : 'Tableau de mesures mis à jour');
    await fetchData();
  };

  // 4 Main Tabs definitions
  const tabs: { id: MainTab; label: string; shortLabel: string; badge?: number; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: isAr ? 'لوحة القيادة والتحليلات' : 'Tableau de Bord & Analytics',
      shortLabel: isAr ? 'الرئيسية' : 'Accueil',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'a_tarifer',
      label: isAr ? 'صفحة التسعير والتفاوض' : 'Tarification des Modèles',
      shortLabel: isAr ? 'التسعير' : 'Tarifs',
      badge: summary.totalToPriceCount > 0 ? summary.totalToPriceCount : undefined,
      icon: <Scissors className="w-5 h-5" />
    },
    {
      id: 'travaux',
      label: isAr ? 'إنجاز الموديلات ورفع الباترونات' : 'Travaux & Livraison Patrons',
      shortLabel: isAr ? 'المهام' : 'Travaux',
      badge: summary.activeCount > 0 ? summary.activeCount : undefined,
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      id: 'profil',
      label: isAr ? 'الملف الشخصي و RIB' : 'Profil & RIB',
      shortLabel: isAr ? 'حسابي' : 'Profil',
      icon: <CreditCard className="w-5 h-5" />
    }
  ];

  // Dynamic Greeting based on time of day (Craft & Effort Appreciation)
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    const firstName = (activeProfileUser.nom || '').trim().split(' ')[0] || (isAr ? 'أخي المبدع' : 'Cher Partenaire');

    if (hour >= 5 && hour < 12) {
      return {
        icon: Sun,
        iconColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        badgeText: isAr ? 'صباح الإبداع والنشاط ☀️' : 'Matinée Créative ☀️',
        title: isAr ? `صباح الخير والإبداع سي ${firstName}` : `Bonjour et excellente journée ${firstName}`,
        message: isAr
          ? 'شكراً جزيلاً على مجهوداتك وإتقانك المستمر فكل باترون وموديل. لمستك الفنية واحترافيتك هي سر نجاح وتألق كل قطعة ننتجها في BEYA.'
          : 'Merci infiniment pour vos efforts et la rigueur que vous apportez à chaque patronage. Votre expertise fait la différence chez BEYA.',
        border: 'border-amber-500/30',
        glow: 'bg-amber-500/15'
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        icon: Coffee,
        iconColor: 'text-indigo-400',
        badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        badgeText: isAr ? 'طاب يومك بكل خير ☕' : 'Bon après-midi ☕',
        title: isAr ? `طاب يومك بكل خير وتألق سي ${firstName}` : `Bon بعد الزوال والعمل المتقن ${firstName}`,
        message: isAr
          ? 'شكراً على تفانيك ودقتك العالية في ضبط كل تفصيلة ومقاس. مجهوداتك وعملك المتقن دائماً محل تقدير واعتزاز كبيرين.'
          : 'Merci pour votre dévouement et la précision de votre travail sur chaque modèle. Votre savoir-faire est précieux.',
        border: 'border-indigo-500/30',
        glow: 'bg-indigo-500/15'
      };
    } else {
      return {
        icon: Moon,
        iconColor: 'text-violet-400',
        badgeBg: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
        badgeText: isAr ? 'مساء الخير والتميز ✨' : 'Soirée Sérénité ✨',
        title: isAr ? `مساء النور والتميز سي ${firstName}` : `Bonsoir et merci pour votre journée ${firstName}`,
        message: isAr
          ? 'شكراً جزيلاً على مجهوداتك وعملك المتقن طيلة اليوم. نقدر عالياً التزامك وإبداعك المستمر معنا في BEYA.'
          : 'Merci chaleureusement pour vos efforts continus et la qualité remarquable de vos réalisations aujourd\'hui.',
        border: 'border-violet-500/30',
        glow: 'bg-violet-500/15'
      };
    }
  }, [activeProfileUser.nom, isAr]);

  return (
    <div className={`space-y-6 pb-28 md:pb-8 bg-[#090B10] min-h-screen text-slate-100 p-3 sm:p-5 md:p-8 rounded-3xl border border-white/[0.05] shadow-2xl ${isAr ? 'rtl font-sans' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 z-[350] left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-black flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.isError ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white border border-slate-700'
          }`}
        >
          {toast.isError ? <AlertTriangle className="w-5 h-5 text-rose-300" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* ─── Apple-Inspired Responsive Header ────────── */}
      <div className="bg-[#12151E]/90 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-4 md:p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Desktop Header */}
        <div className="hidden md:flex relative z-10 items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {isAr ? 'بوابة الموديليست الموحدة' : 'Portail Modéliste BEYA'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-indigo-300 border border-white/[0.08]">
                  {isAr ? 'تسعير · إنجاز · باترونات' : 'Tarifs · Patrons · Livraison'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {activeProfileUser.nom} {linkedEmployee ? `· ${isAr ? 'عامل ورشة رسمي' : 'Employé Atelier'}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Filter */}
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <input
                type="month"
                value={selectedMois}
                onChange={e => setSelectedMois(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2">
                <UserIcon className="w-4 h-4 text-indigo-300" />
                <select
                  value={selectedModelisteId}
                  onChange={e => setSelectedModelisteId(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="all" className="text-slate-900">{isAr ? 'جميع الموديليست' : 'Tous'}</option>
                  {modelistes.map(m => (
                    <option key={m.id} value={m.id} className="text-slate-900">{m.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl transition cursor-pointer border border-white/[0.08]"
              title={isAr ? 'تحديث البيانات' : 'Actualiser'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Native App Bar (100% Smartphone App Feel) */}
        <div className="md:hidden relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                  {(activeProfileUser.nom || 'MD').slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#12151E] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white leading-tight">
                    {activeProfileUser.nom}
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isAr ? 'موديليست معتمد لدى BEYA' : 'Modéliste Certifié'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <input
                  type="month"
                  value={selectedMois}
                  onChange={e => setSelectedMois(e.target.value)}
                  className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer [color-scheme:dark] max-w-[90px]"
                />
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 bg-white/[0.06] active:bg-white/[0.12] text-white rounded-xl transition border border-white/[0.08]"
                title={isAr ? 'تحديث' : 'Actualiser'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Mini Metrics Strip on Mobile (Apple Wallet Style) */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08]">
            <button
              onClick={() => handleTabChange('travaux')}
              className="bg-white/[0.04] active:bg-white/[0.08] active:scale-95 transition p-2 rounded-xl text-center border border-white/[0.05]"
            >
              <div className="text-[9.5px] text-slate-400 font-bold">{isAr ? 'منجز ومسلّم' : 'Livrés'}</div>
              <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">{summary.completedCount}</div>
            </button>
            <button
              onClick={() => handleTabChange('travaux')}
              className="bg-white/[0.04] active:bg-white/[0.08] active:scale-95 transition p-2 rounded-xl text-center border border-white/[0.05]"
            >
              <div className="text-[9.5px] text-slate-400 font-bold">{isAr ? 'قيد العمل' : 'En cours'}</div>
              <div className="text-sm font-black text-amber-400 font-mono mt-0.5">{summary.activeCount}</div>
            </button>
            <button
              onClick={() => handleTabChange('profil')}
              className="bg-white/[0.04] active:bg-white/[0.08] active:scale-95 transition p-2 rounded-xl text-center border border-white/[0.05]"
            >
              <div className="text-[9.5px] text-slate-400 font-bold">{isAr ? 'الرصيد الصافي' : 'Solde'}</div>
              <div className="text-sm font-black text-indigo-300 font-mono mt-0.5">{summary.totalRemainingAllTime.toLocaleString()} DH</div>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Apple Daily Welcoming & Craft Appreciation Banner ──────────── */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border ${greetingData.border} backdrop-blur-2xl p-4 md:p-5 shadow-xl`}>
        {/* Subtle Ambient Radial Glow */}
        <div className={`absolute -top-10 -right-10 w-36 h-36 ${greetingData.glow} rounded-full blur-3xl pointer-events-none`} />

        <div className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="space-y-1.5 max-w-3xl">
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${greetingData.badgeBg}`}>
                {greetingData.badgeText}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <greetingData.icon className={`w-5 h-5 ${greetingData.iconColor} shrink-0`} />
              <span>{greetingData.title}</span>
            </h3>

            <p className="text-xs md:text-[13px] text-slate-300/90 leading-relaxed font-normal">
              {greetingData.message}
            </p>
          </div>

          <div className={`flex items-center gap-2 shrink-0 pt-1 md:pt-0 ${isAr ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => handleTabChange('travaux')}
              className="px-3.5 py-2 bg-white/[0.07] hover:bg-white/[0.14] active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/[0.1]"
            >
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'متابعة مهام اليوم' : 'Travaux du jour'}</span>
            </button>
            <button
              onClick={() => handleTabChange('profil')}
              className="px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 active:scale-95 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-indigo-500/30"
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-300" />
              <span>{summary.totalRemainingAllTime.toLocaleString()} MAD</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Apple Segmented Tabs Bar (Desktop Navigation 1, 2, 3, 4) ──────────── */}
      <div className="hidden md:flex bg-[#12151E]/90 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/[0.08] shadow-lg items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-auto">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-[13px] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-slate-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="scale-90">{tab.icon}</span>
                <span className="tracking-tight">{tab.label}</span>
                {typeof tab.badge === 'number' && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab !== 'dashboard' && activeTab !== 'profil' && (
          <div className="relative w-64">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث سريع بالموديل أو الزبون...' : 'Recherche modèle ou client...'}
              className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-indigo-500/60 transition`}
            />
          </div>
        )}
      </div>

      {/* Mobile Search Bar (Only shown on phone when in Tarifs or Travaux) */}
      {(activeTab === 'a_tarifer' || activeTab === 'travaux') && (
        <div className="md:hidden relative w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث سريع بالموديل أو الزبون...' : 'Recherche modèle ou client...'}
            className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-[#12151E] border border-white/[0.1] rounded-2xl text-xs font-bold text-white placeholder-slate-500 outline-none shadow-md focus:border-indigo-500`}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 📊 TAB 1: EXECUTIVE ANALYTICS DASHBOARD                      */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 3 Executive Analytic Cards: 1. الرصيد الصافي المتبقي  2. قيد العمل  3. المنجزة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. الرصيد الصافي المتبقي له (Primary Financial Focus) */}
            <div
              onClick={() => handleTabChange('profil')}
              className="bg-gradient-to-b from-[#181C2B] to-[#11131C] border border-indigo-500/35 hover:border-indigo-500/60 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  {isAr ? 'الرصيد الصافي المتبقي له' : 'Solde Net à Percevoir'}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/[0.08] flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold tracking-tight font-mono text-white">
                {summary.totalRemainingAllTime.toLocaleString()} <span className="text-sm font-semibold text-slate-400">MAD</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{isAr ? 'المدفوع له حتى الآن :' : 'Déjà Réglé :'}</span>
                <span className="text-emerald-400 font-mono font-bold">{summary.totalPaidAllTime.toLocaleString()} MAD</span>
              </div>
            </div>

            {/* 2. شحال باقي (مطلوب إنجازها الآن) */}
            <div
              onClick={() => handleTabChange('travaux')}
              className="bg-gradient-to-b from-[#1E1A16] to-[#121319] border border-amber-500/30 hover:border-amber-500/50 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {isAr ? 'مطلوب إنجازها الآن (قيد العمل)' : 'Travaux en Cours'}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/[0.08] flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold tracking-tight font-mono text-white">{summary.activeCount}</div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{isAr ? 'القيمة عند التسليم :' : 'Valeur à la livraison :'}</span>
                <span className="text-amber-300 font-mono font-bold">+{summary.activeMAD.toLocaleString()} MAD</span>
              </div>
            </div>

            {/* 3. شحال خدم (الموديلات المنجزة والمسلّمة) */}
            <div
              onClick={() => handleTabChange('travaux')}
              className="bg-gradient-to-b from-[#131E1B] to-[#10131A] border border-emerald-500/30 hover:border-emerald-500/50 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {isAr ? 'الموديلات المنجزة والمسلّمة' : 'Modèles Réalisés & Livrés'}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/[0.08] flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold tracking-tight font-mono text-white">{summary.completedCount}</div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{isAr ? 'مجموع ما كسبه منها :' : 'Gagné sur ces modèles :'}</span>
                <span className="text-emerald-300 font-mono font-bold">{summary.completedMAD.toLocaleString()} MAD</span>
              </div>
            </div>
          </div>

          {/* Quick Notice if there are unpriced items */}
          {summary.totalToPriceCount > 0 && (
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isAr ? `لديك ${summary.totalToPriceCount} موديلات جديدة تنتظر التسعير والتفاوض` : `${summary.totalToPriceCount} nouveaux modèles en attente de chiffrage`}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'ادخل الأسعار المقترحة للبدء في إنجاز الباترونات فور تأكيد الإدارة والزبون' : 'Proposez vos tarifs pour démarrer les travaux dès validation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleTabChange('a_tarifer')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-indigo-600/25"
              >
                <span>{isAr ? 'الانتقال لصفحة التسعير (2)' : 'Voir la page de tarification'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {/* Month Financial Card + Performance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-[#12151E] rounded-3xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? `كشف حساب شهر (${selectedMois})` : `Bilan Mensuel (${selectedMois})`}</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-xs">
                  <span className="text-slate-400 font-medium">{isAr ? 'الموديلات المسلمة في الشهر :' : 'Modèles livrés ce mois :'}</span>
                  <span className="text-white font-bold">{summary.monthCompletedCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="text-emerald-300 font-medium">{isAr ? 'الأرباح المكتسبة هذا الشهر :' : 'Gagné ce mois :'}</span>
                  <span className="text-emerald-400 font-bold font-mono">{summary.monthEarnedMAD.toLocaleString()} MAD</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                  <span className="text-indigo-300 font-medium">{isAr ? 'التسبيقات المستلمة هذا الشهر :' : 'Avances reçues ce mois :'}</span>
                  <span className="text-indigo-400 font-bold font-mono">-{summary.monthPaidMAD.toLocaleString()} MAD</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-xs font-semibold">
                  <span className="text-slate-300">{isAr ? 'الرصيد المتبقي لهذا الشهر :' : 'Reste dû pour ce mois :'}</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{summary.monthRemainingMAD.toLocaleString()} MAD</span>
                </div>
              </div>
            </div>

            {/* List of models completed with quick view */}
            <div className="lg:col-span-2 bg-[#12151E] rounded-3xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'تفاصيل الموديلات المنجزة وأرباحها' : 'Détail des Travaux Réalisés'}</span>
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  {summary.completedCount} {isAr ? 'موديل منجز' : 'modèles livrés'}
                </span>
              </div>

              {filteredByRole.filter(i => i.workStatus === 'termine').length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  {isAr ? 'لم يتم تسليم أي موديل بعد في هذا الحساب.' : 'Aucun modèle livré pour le moment.'}
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05] max-h-[320px] overflow-y-auto">
                  {filteredByRole
                    .filter(i => i.workStatus === 'termine')
                    .map(item => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.photo ? (
                            <img src={item.photo} alt={item.modele} className="w-10 h-10 rounded-xl object-cover border border-white/[0.08] shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-400 shrink-0">
                              <Scissors className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{item.modele}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{item.client} · {item.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.isFree || item.patronagePrice === 0 ? (
                            <span className="font-bold text-xs text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 rounded-xl">
                              {isAr ? 'مجاني (FREE)' : 'Gratuit (FREE)'}
                            </span>
                          ) : (
                            <span className="font-bold text-xs text-emerald-400 font-mono bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                              +{item.patronagePrice} MAD
                            </span>
                          )}
                          {item.patronFiles.length > 0 && (
                            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-lg">
                              📁 {item.patronFiles.length}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 🏷️ TAB 2: PAGE DIAL TS3IR (Tarification & Négociation)       */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'a_tarifer' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#12151E] p-3 rounded-2xl border border-white/[0.08] shadow-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPricingSubFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  pricingSubFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/[0.05] text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'الكل' : 'Tous'} ({pricingItems.length})
              </button>
              <button
                onClick={() => setPricingSubFilter('unpriced')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  pricingSubFilter === 'unpriced' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white/[0.05] text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'جديد ينتظر إدخال التسعيرة' : 'Nouveaux à chiffrer'} ({summary.unpricedCount})
              </button>
              <button
                onClick={() => setPricingSubFilter('priced')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  pricingSubFilter === 'priced' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/[0.05] text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'مسعرة تنتظر الاتفاق والمصادقة' : 'Chiffrés en attente'} ({summary.pricedAwaitingCount})
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowNewModelModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? '+ إرسال موديل للتسعير' : '+ Envoyer un modèle'}</span>
              </button>
            )}
          </div>

          {pricingItems.length === 0 ? (
            <div className="bg-[#12151E] rounded-3xl p-12 text-center border border-white/[0.08] space-y-2 shadow-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base text-white">
                {isAr ? 'لا يوجد أي موديل ينتظر التسعير حالياً' : 'Aucun modèle en attente de tarification'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'جميع الموديلات التي تم الاتفاق عليها تم تحويلها مباشرة إلى صفحة المهام والإنجاز.' : 'Tous les modèles convenus sont transférés dans Travaux.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingItems.map(item => {
                const isPriced = item.patronagePrice > 0;
                const hasCounter = Boolean(item.adminCounterPrice && item.adminCounterPrice > 0);

                return (
                  <div key={item.id} className="bg-[#12151E] rounded-3xl border border-white/[0.08] hover:border-indigo-500/40 p-5 shadow-xl space-y-4 transition-all text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.modele}
                            onClick={() => setZoomImage(item.photo || null)}
                            className="w-14 h-14 rounded-2xl object-cover border border-white/[0.08] cursor-zoom-in shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black shrink-0 border border-indigo-500/30">
                            <Scissors className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mb-1 ${
                            isPriced ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isPriced ? (isAr ? 'تم اقتراح التسعيرة' : 'Tarif proposé') : (isAr ? 'جديد مطلوب تسعيره' : 'Nouveau à chiffrer')}
                          </span>
                          <h4 className="font-bold text-sm text-white truncate">{item.modele}</h4>
                          <p className="text-xs text-slate-400 font-medium">{item.client} · {item.date}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setTechPackItem(item)}
                        className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-white/[0.08]"
                        title={isAr ? 'البطاقة التقنية والمقاسات' : 'Fiche technique'}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isAr ? 'البطاقة' : 'Fiche'}</span>
                      </button>
                    </div>

                    {item.clientNotes && (
                      <div className="text-[11px] text-slate-300 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06] leading-relaxed">
                        <strong className="text-white">{isAr ? 'ملاحظات الموديل :' : 'Spécifications :'}</strong> {item.clientNotes}
                      </div>
                    )}

                    {/* PRICING INPUT / STATUS BOX */}
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300">
                          {isAr ? 'ثمن الباترون المقترح :' : 'Tarif proposé :'}
                        </span>
                        {isPriced ? (
                          <span className="text-base font-bold text-emerald-400 font-mono bg-white/[0.06] px-3 py-0.5 rounded-xl border border-white/[0.1]">
                            {item.patronagePrice} MAD
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-400">{isAr ? 'غير مسعر بعد' : 'Non tarifé'}</span>
                        )}
                      </div>

                      {/* Custom Price Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          placeholder={isAr ? 'أدخل ثمناً مخصصاً (درهم)...' : 'Tarif personnalisé (MAD)...'}
                          defaultValue={item.patronagePrice > 0 ? item.patronagePrice : ''}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleSavePrice(item, Number((e.target as HTMLInputElement).value));
                            }
                          }}
                          id={`price_input_${item.id}`}
                          className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-indigo-400 font-mono"
                        />
                        <button
                          onClick={() => {
                            const el = document.getElementById(`price_input_${item.id}`) as HTMLInputElement;
                            if (el) handleSavePrice(item, Number(el.value));
                          }}
                          disabled={actionPendingId === item.id}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-md shadow-indigo-600/25"
                        >
                          {isAr ? 'حفظ واقتراح' : 'Proposer'}
                        </button>
                      </div>

                      {/* Counter offer section if Admin wants to negotiate */}
                      {isAdmin && (
                        <div className="pt-2 border-t border-indigo-100 flex items-center gap-2">
                          <input
                            type="number"
                            placeholder={isAr ? 'عرض الإدارة المقابل (درهم)...' : 'Contre-offre Admin (MAD)...'}
                            value={counterPriceInput[item.id] || ''}
                            onChange={e => setCounterPriceInput({ ...counterPriceInput, [item.id]: e.target.value })}
                            className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-black font-mono outline-none"
                          />
                          <button
                            onClick={() => handleSendCounterPrice(item)}
                            disabled={actionPendingId === item.id}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black cursor-pointer shrink-0"
                          >
                            {isAr ? 'إرسال عرض مقابل' : 'Négocier'}
                          </button>
                        </div>
                      )}

                      {/* Display Admin Counter-Offer if present */}
                      {hasCounter && (
                        <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-black text-amber-950 block">{isAr ? 'عرض الإدارة المقابل :' : 'Contre-offre reçue :'}</span>
                            <span className="font-mono font-black text-base text-amber-900">{item.adminCounterPrice} MAD</span>
                          </div>
                          {!isAdmin && (
                            <button
                              onClick={() => handleAcceptPriceAndMoveToWork(item, item.adminCounterPrice!)}
                              disabled={actionPendingId === item.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition cursor-pointer"
                            >
                              {isAr ? '✓ قبول العرض والبدء فوراً' : '✓ Accepter & Démarrer'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 🚀 CRITICAL INSTANT ACTION: Accept Price & Move to Tasks */}
                    {isPriced && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleAcceptPriceAndMoveToWork(item, item.patronagePrice)}
                          disabled={actionPendingId === item.id}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>
                            {isAr
                              ? `قبول هذا الثمن (${item.patronagePrice} درهم) والانتقال فوراً للإنجاز والمهام ✓`
                              : `Valider à ${item.patronagePrice} MAD & Déplacer vers Travaux ✓`}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ✂️ TAB 3: PAGE DIAL FIN INZL LMODEL (Travaux, Fichiers, Chat)*/}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'travaux' && (
        <div className="space-y-5">
          {/* Work status filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#12151E] p-3 rounded-2xl border border-white/[0.08] shadow-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWorkFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  workFilter === 'pending' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' : 'bg-white/[0.05] text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? 'المطلوب إنجازها الآن' : 'À Faire & En Cours'}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">{summary.activeCount}</span>
              </button>
              <button
                onClick={() => setWorkFilter('termine')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  workFilter === 'termine' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25' : 'bg-white/[0.05] text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'المنجزة والمسلّمة' : 'Terminés & Livrés'}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">{summary.completedCount}</span>
              </button>
              <button
                onClick={() => setWorkFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  workFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/[0.05] text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'الكل' : 'Tous'}
              </button>
            </div>

            <p className="text-xs font-medium text-slate-400">
              {isAr ? 'الملفات المرفوعة هنا تتاح تلقائياً للزبون في بوابة BEYA' : 'Les fichiers déposés ici sont accessibles au client sur BEYA Portal'}
            </p>
          </div>

          {workItems.length === 0 ? (
            <div className="bg-[#12151E] rounded-3xl p-12 text-center border border-white/[0.08] space-y-2 shadow-xl">
              <Clock className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="font-bold text-base text-white">
                {isAr ? 'لا توجد مهام مطابقة للفلتر المحدد' : 'Aucune tâche trouvée'}
              </h3>
            </div>
          ) : (
            <div className="space-y-5">
              {workItems.map(item => {
                const deadlineBadge = getDeadlineBadge(item.deadlineDate, item.workStatus, isAr);
                const isCompleted = item.workStatus === 'termine';
                const isChatOpen = activeChatModelId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-[#12151E] rounded-3xl border p-5 md:p-6 shadow-xl transition-all space-y-5 text-white ${
                      isCompleted ? 'border-emerald-500/30' : 'border-white/[0.08] hover:border-indigo-500/40'
                    }`}
                  >
                    {/* Header Row: Model title, Client, Deadline, Price */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                      <div className="flex items-center gap-4 min-w-0">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.modele}
                            onClick={() => setZoomImage(item.photo || null)}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 cursor-zoom-in shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Scissors className="w-7 h-7" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${deadlineBadge.cls}`}>
                              {deadlineBadge.label}
                            </span>
                            {item.deadlineDate && (
                              <span className="text-[10px] text-slate-400 font-mono font-bold">
                                {isAr ? `تاريخ التسليم: ${item.deadlineDate}` : `Échéance: ${item.deadlineDate}`}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-slate-900 truncate">{item.modele}</h3>
                          <p className="text-xs text-slate-500 font-semibold">{item.client} · {item.date}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">{isAr ? 'أجر الباترون' : 'Rémunération'}</span>
                          {item.isFree || item.patronagePrice === 0 ? (
                            <span className="text-xs font-black text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-xl inline-block mt-0.5">
                              {isAr ? 'مجاني (FREE)' : 'Gratuit (FREE)'}
                            </span>
                          ) : (
                            <span className="text-lg font-black text-indigo-700 font-mono">
                              {item.patronagePrice} MAD
                            </span>
                          )}
                        </div>

                        {/* Interactive Status Selector */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
                          <button
                            onClick={() => handleUpdateWorkStatus(item, 'a_faire')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                              item.workStatus === 'a_faire' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {isAr ? 'للإنجاز' : 'À faire'}
                          </button>
                          <button
                            onClick={() => handleUpdateWorkStatus(item, 'en_cours')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                              item.workStatus === 'en_cours' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {isAr ? 'قيد العمل' : 'En cours'}
                          </button>
                          <button
                            onClick={() => handleUpdateWorkStatus(item, 'termine')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                              item.workStatus === 'termine' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {isAr ? '✓ مسلّم' : '✓ Livré'}
                          </button>
                        </div>

                        <button
                          onClick={() => setTechPackItem(item)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isAr ? 'البطاقة والمقاسات' : 'Fiche Technique'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveTaskFromModeliste(item)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer border border-rose-200"
                          title={isAr ? 'إزالة هذه المهمة من الورشة' : 'Retirer cette tâche de l\'atelier'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 📁 FILE UPLOAD ZONE: PDF, RAR, ZIP, DXF, Images */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileArchive className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            {isAr ? 'ملفات الباترون والتدرج (PDF / RAR / ZIP / DXF)' : 'Dossier Patronage & Fichiers (PDF, RAR, ZIP, DXF)'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                            {item.patronFiles.length} {isAr ? 'ملف' : 'fichiers'}
                          </span>
                        </div>

                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm">
                          <Upload className="w-4 h-4" />
                          <span>{isAr ? 'رفع ملف الباترون والتدرج' : 'Déposer Patron & Gradation'}</span>
                          <input
                            type="file"
                            accept=".pdf,.rar,.zip,.7z,.tar,.dxf,.hpgl,.plt,.ai,.png,.jpg,.jpeg"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadPatronFile(item, file);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* 📋 Clear description of required file formats */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-700 font-medium bg-white border border-slate-200/90 rounded-xl px-3 py-2 shadow-2xs">
                        <span className="font-black text-indigo-700 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {isAr ? 'الملفات المطلوبة للباترون والتدرج:' : 'Fichiers requis :'}
                        </span>
                        <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border border-indigo-100">
                          CAD Tracé (Lectra / Gerber)
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border border-slate-200">
                          DXF
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border border-slate-200">
                          PLT
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border border-slate-200">
                          PDF
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border border-slate-200">
                          ZIP / RAR
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold mr-1">
                          {isAr ? '(ملف التراج CAD، أو DXF، و PLT، و PDF، أو أرشيف مضغوط)' : '(Tracé CAD, DXF, PLT, PDF ou archive)'}
                        </span>
                      </div>

                      {uploadingModelId === item.id && (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{isAr ? 'جاري رفع الملف وحفظه ومزامنته...' : 'Téléversement du fichier en cours...'}</span>
                        </div>
                      )}

                      {item.patronFiles.length === 0 ? (
                        <p className="text-center py-4 text-xs text-slate-400 font-medium">
                          {isAr
                            ? 'لم يتم رفع ملف الباترون بعد. يمكنك رفع ملفات PDF للباترون أو أرشيف RAR/ZIP للتدرج لكي يتوصل بها الزبون في بوابته.'
                            : 'Aucun fichier déposé. Téléversez vos patrons en PDF ou archives RAR/ZIP pour les rendre disponibles au client et à l\'admin.'}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                          {item.patronFiles.map(file => (
                            <div key={file.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                  {file.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-600" /> : <FileArchive className="w-4 h-4 text-indigo-600" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-slate-900 truncate" title={file.name}>{file.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{file.size || ''}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={file.url}
                                  download={file.name}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                                  title={isAr ? 'تحميل' : 'Télécharger'}
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeletePatronFile(item, file.id)}
                                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                  title={isAr ? 'حذف' : 'Supprimer'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-3 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? '✓ الملفات المرفوعة هنا متاحة تلقائياً في بوابة الزبون (Portail Client) وللإدارة لتحميلها.' : '✓ Les fichiers déposés ici sont accessibles au client sur BEYA Portal et à la direction.'}</span>
                      </div>
                    </div>

                    {/* 📊 SMART PROGRESS BAR (السمطة الذكية لمتابعة الإنجاز والتسليم) */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            item.workStatus === 'termine' ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                            item.workStatus === 'en_cours' ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse' :
                            'bg-slate-300 ring-4 ring-slate-100'
                          }`} />
                          <span className="text-xs font-black text-slate-800">
                            {isAr ? 'سمطة تقدم العمل والتسليم:' : 'Progression du travail & Livraison :'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            item.workStatus === 'termine' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            item.workStatus === 'en_cours' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.workStatus === 'termine'
                              ? (isAr ? '✓ مسلّم وجاهز (100%)' : '✓ Livré (100%)')
                              : item.workStatus === 'en_cours'
                              ? (isAr ? '⚡ قيد العمل والتدرج (55%)' : '⚡ En cours (55%)')
                              : (isAr ? '⏳ للإنجاز (15%)' : '⏳ À faire (15%)')}
                          </span>
                        </div>

                        {/* Interactive button to start work and fill bar */}
                        {item.workStatus === 'a_faire' && (
                          <button
                            onClick={() => handleUpdateWorkStatus(item, 'en_cours')}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isAr ? 'بدء العمل الآن (تعبئة السمطة للنصف)' : 'Démarrer le travail (55%)'}</span>
                          </button>
                        )}
                        {item.workStatus === 'en_cours' && (
                          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {isAr ? '💡 ارفع ملف الباترون أعلاه لتعبئة السمطة لـ 100% وإنهاء التسليم' : '💡 Déposez le fichier patron pour compléter à 100%'}
                          </span>
                        )}
                        {item.workStatus === 'termine' && (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {isAr ? 'تم استلام الملفات واكتمال التسليم بنجاح (100%)' : 'Fichiers reçus et travail validé (100%)'}
                          </span>
                        )}
                      </div>

                      {/* Visual progress bar */}
                      <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                            item.workStatus === 'termine'
                              ? 'w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-sm shadow-emerald-500/30'
                              : item.workStatus === 'en_cours'
                              ? 'w-[55%] bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 shadow-sm shadow-amber-500/30'
                              : 'w-[15%] bg-slate-400'
                          }`}
                        />
                      </div>

                      {/* 3 Steps indicator */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5 px-0.5">
                        <span className={item.workStatus === 'a_faire' ? 'text-slate-900 font-black' : ''}>
                          1. {isAr ? 'للإنجاز' : 'À faire'} (15%)
                        </span>
                        <span className={item.workStatus === 'en_cours' ? 'text-amber-700 font-black' : ''}>
                          2. {isAr ? 'قيد العمل والتدرج' : 'En cours'} (55%)
                        </span>
                        <span className={item.workStatus === 'termine' ? 'text-emerald-700 font-black' : ''}>
                          3. {isAr ? 'رفع الملفات والتسليم' : 'Livraison'} (100%)
                        </span>
                      </div>
                    </div>

                    {/* 💬 ON-SITE MESSAGING & NOTES (Direct Chat between Admin & Modéliste) */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setActiveChatModelId(isChatOpen ? null : item.id)}
                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-black text-slate-700 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                          <span>{isAr ? 'المحادثة والملاحظات التقنية المباشرة داخل الموقع' : 'Discussion & Notes Techniques en direct'}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
                            {item.patronMessages.length}
                          </span>
                        </div>
                        <span className="text-slate-400">{isChatOpen ? (isAr ? '▲ إخفاء' : '▲ Masquer') : (isAr ? '▼ فتح المحادثة' : '▼ Ouvrir le fil')}</span>
                      </button>

                      {isChatOpen && (
                        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                          {/* Messages list */}
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {item.patronMessages.length === 0 ? (
                              <p className="text-center py-4 text-slate-400 text-xs italic">
                                {isAr ? 'لا توجد رسائل سابقة. يمكنك هنا كتابة استفسار للإدارة أو للموديليست مباشرة.' : 'Aucun message pour ce modèle. Échangez vos remarques ici.'}
                              </p>
                            ) : (
                              item.patronMessages.map(msg => {
                                const isMe = (isAdmin && msg.sender === 'admin') || (!isAdmin && msg.sender === 'modeliste');
                                return (
                                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 font-bold">
                                      <span>{msg.senderName}</span>
                                      <span>·</span>
                                      <span>{new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div
                                      className={`px-3.5 py-2 rounded-2xl text-xs font-medium max-w-[85%] ${
                                        isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-900 rounded-bl-none'
                                      }`}
                                    >
                                      {msg.text}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Message input */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <input
                              type="text"
                              value={chatMessageInput}
                              onChange={e => setChatMessageInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSendPatronMessage(item);
                              }}
                              placeholder={isAr ? 'اكتب رسالة أو ملاحظة تقنية للإدارة هنا...' : 'Écrire un message ou une note technique...'}
                              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => handleSendPatronMessage(item)}
                              disabled={actionPendingId === item.id}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isAr ? 'إرسال' : 'Envoyer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 👤 TAB 4: PROFIL DIALO & RIB (Profil & Coordonnées)         */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'profil' && (
        <div className="bg-[#12151E] rounded-3xl border border-white/[0.08] p-6 md:p-8 shadow-2xl max-w-3xl mx-auto space-y-6 text-white">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{isAr ? 'الملف الشخصي والحساب البنكي (RIB)' : 'Profil Personnel & RIB'}</h2>
              <p className="text-xs text-slate-400 font-medium">
                {isAr
                  ? 'هذه المعلومات متصلة ومزامنة تلقائياً مع نظام الموارد البشرية (RH) والتحويلات البنكية للمستحقات.'
                  : 'Ces coordonnées sont synchronisées automatiquement avec le module RH et la paie.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'الاسم الكامل *' : 'Nom Complet *'}</label>
                <input
                  type="text"
                  required
                  value={profileForm.nom}
                  onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
                <input
                  type="text"
                  value={profileForm.telephone}
                  onChange={e => setProfileForm({ ...profileForm, telephone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'رقم البطاقة الوطنية (CIN)' : 'N° CNIE'}</label>
                <input
                  type="text"
                  value={profileForm.cin}
                  onChange={e => setProfileForm({ ...profileForm, cin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'العنوان / المدينة' : 'Adresse & Ville'}</label>
              <input
                type="text"
                value={profileForm.adresse}
                onChange={e => setProfileForm({ ...profileForm, adresse: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-400"
              />
            </div>

            {/* Banking RIB section (Apple Wallet Style Card) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'الحساب البنكي (RIB المغربي)' : 'Coordonnées Bancaires (RIB)'}</span>
                </span>
                {profileForm.rib && (
                  <button
                    type="button"
                    onClick={() => copyRib(profileForm.rib)}
                    className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedRib ? (isAr ? 'تم النسخ!' : 'Copié!') : (isAr ? 'نسخ RIB' : 'Copier')}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">{isAr ? 'اسم البنك' : 'Banque'}</label>
                  <input
                    type="text"
                    placeholder="CIH, Attijariwafa..."
                    value={profileForm.banque}
                    onChange={e => setProfileForm({ ...profileForm, banque: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    {isAr ? 'رقم الحساب (24 رقماً) *' : 'Numéro RIB (24 chiffres) *'}
                  </label>
                  <input
                    type="text"
                    maxLength={32}
                    placeholder="230 425 3473845211020400 80"
                    value={profileForm.rib}
                    onChange={e => setProfileForm({ ...profileForm, rib: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-xs font-bold text-emerald-400 font-mono tracking-wider outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isAr ? 'حفظ البيانات ومزامنتها ✓' : 'Enregistrer & Synchroniser ✓'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Modal: Admin Send New Model for Pricing ───────────────── */}
      {showNewModelModal && (
        <div
          className="fixed inset-0 z-[300] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowNewModelModal(false)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">{isAr ? 'إرسال موديل جديد للموديليست' : 'Envoyer un Modèle au Modéliste'}</h3>
              <button onClick={() => setShowNewModelModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newModelForm.modele.trim() || !newModelForm.client.trim()) return;
                const assignedMod = users.find(u => u.id === newModelForm.modelisteId);
                const detailsObj: any = {
                  patronageStatus: 'requested',
                  clientNotes: sanitizeNotesForModeliste(newModelForm.notes.trim()),
                  deadlineDate: newModelForm.deadlineDate || undefined,
                  modelisteId: assignedMod?.id || undefined,
                  modelisteName: assignedMod?.nom || undefined
                };
                const newLead: Lead = {
                  id: genId(),
                  name: newModelForm.client.trim(),
                  phone: '',
                  ville: '',
                  type: newModelForm.modele.trim(),
                  quantity: Math.max(1, Number(newModelForm.quantity) || 1),
                  status: 'new',
                  date: new Date().toISOString(),
                  details: JSON.stringify(detailsObj)
                };
                saveRecord('leads', newLead, true).then(() => {
                  setShowNewModelModal(false);
                  setNewModelForm({ modele: '', client: '', quantity: '1', deadlineDate: '', modelisteId: '', notes: '' });
                  handleTabChange('a_tarifer');
                  showToast(isAr ? 'تم إرسال الموديل للتسعير بنجاح' : 'Modèle envoyé pour tarification');
                  fetchData();
                });
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? 'اسم الموديل *' : 'Nom du Modèle *'}</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Robe Chemisier Soirée..."
                  value={newModelForm.modele}
                  onChange={e => setNewModelForm({ ...newModelForm, modele: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? 'الزبون *' : 'Client *'}</label>
                  <input
                    type="text"
                    required
                    value={newModelForm.client}
                    onChange={e => setNewModelForm({ ...newModelForm, client: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? 'تاريخ التسليم المطلوب' : 'Délai souhaité'}</label>
                  <input
                    type="date"
                    value={newModelForm.deadlineDate}
                    onChange={e => setNewModelForm({ ...newModelForm, deadlineDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? 'تعيين الموديليست' : 'Assigner Modéliste'}</label>
                <select
                  value={newModelForm.modelisteId}
                  onChange={e => setNewModelForm({ ...newModelForm, modelisteId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="">{isAr ? 'متاح للجميع' : 'Tous les modélistes'}</option>
                  {modelistes.map(m => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? 'ملاحظات وتفاصيل تقنية' : 'Notes & Détails'}</label>
                <textarea
                  rows={2}
                  value={newModelForm.notes}
                  onChange={e => setNewModelForm({ ...newModelForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition cursor-pointer"
              >
                {isAr ? 'إرسال الموديل إلى صفحة التسعير ✓' : 'Envoyer au Modéliste ✓'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Image Zoom Modal ──────────────────────────────────────── */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[300] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-3xl p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-3 -right-3 w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomImage} alt="Modèle" className="w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* ─── Fiche Technique Modéliste Pro Modal ────────────────────── */}
      <FicheTechniqueModelisteModal
        isOpen={Boolean(techPackItem)}
        onClose={() => setTechPackItem(null)}
        item={techPackItem}
        matchingFiche={getMatchingFiche(techPackItem)}
        onSaveTechnicalNotes={handleSaveModelisteTechnicalNotes}
        onSaveMeasurements={handleSaveModelisteMeasurements}
        isAr={isAr}
      />
      {/* ─── Mobile App Fixed Bottom Navigation Bar (iOS Native App Bar) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[120] bg-[#090B10]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
              )}
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-600/20 text-indigo-400 scale-110 shadow-xs' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : 'font-medium text-slate-400'}`}>
                <span className="opacity-70 mr-0.5">{idx + 1}.</span>
                {tab.shortLabel}
              </span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="absolute top-0.5 right-1/4 translate-x-2 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#090B10] shadow-md">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
