import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  FileText
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
type MainTab = 'dashboard' | 'a_tarifer' | 'travaux' | 'reglements' | 'profil';

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
      label: isAr ? 'منجز ومسلّم' : 'Terminé & Livré',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      urgency: 99
    };
  }
  if (!deadlineDate) {
    return {
      label: isAr ? 'تاريخ التسليم غير محدد' : 'Date limite non définie',
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
      cls: 'bg-rose-50 text-rose-700 border-rose-200',
      urgency: diffDays
    };
  }
  if (diffDays === 0) {
    return {
      label: isAr ? 'التسليم اليوم' : "Aujourd'hui",
      cls: 'bg-amber-50 text-amber-700 border-amber-300',
      urgency: 0
    };
  }
  if (diffDays <= 3) {
    return {
      label: isAr ? `بعد ${diffDays} أيام` : `Dans ${diffDays} j`,
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      urgency: diffDays
    };
  }
  return {
    label: isAr ? `بعد ${diffDays} يوم` : `Dans ${diffDays} j`,
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
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [pricingFilter, setPricingFilter] = useState<'requested' | 'priced_waiting' | 'all'>('requested');
  const [workFilter, setWorkFilter] = useState<'pending' | 'termine' | 'all'>('pending');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'regles' | 'en_attente'>('all');

  const [search, setSearch] = useState('');
  const [selectedModelisteId, setSelectedModelisteId] = useState<string>(isAdmin ? 'all' : currentUser.id);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Modal: Price Entry / Edit
  const [pricingItem, setPricingItem] = useState<ModelItem | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [echPriceInput, setEchPriceInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Modal: Admin Validate & Assign Deadline Date
  const [validateModalItem, setValidateModalItem] = useState<ModelItem | null>(null);
  const [deadlineInput, setDeadlineInput] = useState('');
  const [assignModelisteInput, setAssignModelisteInput] = useState('');

  // Modal: Admin Quick Send New Model for Pricing
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
    const newDetails = {
      ...ext,
      patronageNotes: techNotes
    };
    await saveRecord('leads', { ...lead, details: JSON.stringify(newDetails) }, true);
    showToast(isAr ? 'تم حفظ الملاحظات التقنية بنجاح' : 'Notes techniques enregistrées avec succès');
    await fetchData();
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
          .limit(300),
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

  // Active target Modéliste user for Profile / RIB view
  const activeProfileUser: User = useMemo(() => {
    if (isAdmin && selectedModelisteId !== 'all') {
      return users.find(u => u.id === selectedModelisteId) || currentUser;
    }
    if (isAdmin && selectedModelisteId === 'all' && modelistes.length > 0) {
      return modelistes[0];
    }
    return users.find(u => u.id === currentUser.id) || currentUser;
  }, [isAdmin, selectedModelisteId, users, modelistes, currentUser]);

  // Match the selected or logged-in modéliste user to an Employe record in RH for balance & payment sync
  const linkedEmployee: Employe | undefined = useMemo(() => {
    const targetUserId = isAdmin ? (selectedModelisteId === 'all' ? '' : selectedModelisteId) : currentUser.id;
    const targetUser = users.find(u => u.id === targetUserId) || (!isAdmin ? currentUser : undefined);
    return findMatchingEmployeeForUser(targetUser, hydratedEmployes);
  }, [isAdmin, selectedModelisteId, currentUser, users, hydratedEmployes]);

  // Employee linked to `activeProfileUser` (used in Profil & RIB tab)
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

  const copyRibToClipboard = (rib?: string) => {
    const clean = (rib || '').replace(/\s+/g, '');
    if (!clean) return;
    navigator.clipboard?.writeText(clean);
    setCopiedRib(true);
    showToast(isAr ? 'تم نسخ رقم RIB بنجاح' : 'RIB copié dans le presse-papiers');
    setTimeout(() => setCopiedRib(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRib = profileForm.rib.replace(/\s+/g, '');
    if (cleanRib && cleanRib.length !== 24) {
      showToast(
        isAr ? 'رقم الحساب البنكي RIB يجب أن يتكون من 24 رقماً' : 'Le RIB marocain doit contenir exactement 24 chiffres',
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

      setEmployes(prev => {
        const exists = prev.some(emp => emp.id === res.employe.id);
        return exists ? prev.map(emp => (emp.id === res.employe.id ? res.employe : emp)) : [...prev, res.employe];
      });
      setUsers(prev => prev.map(u => (u.id === res.user.id ? res.user : u)));
      setPayrollExtras(prev => ({
        ...prev,
        rules: [...prev.rules.filter(r => r.employeId !== res.employe.id), res.rule]
      }));
      showToast(
        isAr
          ? 'تم حفظ معلوماتك و RIB ومزامنتها تلقائياً مع صفحة الـ RH'
          : 'Profil & RIB enregistrés et synchronisés automatiquement avec RH'
      );
    } catch (err) {
      console.error('Erreur sauvegarde profil modéliste:', err);
      showToast(isAr ? 'تعذر حفظ المعلومات، حاول مجدداً' : 'Erreur lors de la sauvegarde du profil', true);
    } finally {
      setSavingProfile(false);
    }
  };

  // Build unified model items from Leads + Fiches Techniques
  const modelItems: ModelItem[] = useMemo(() => {
    const items: ModelItem[] = [];

    // 1. Process Leads sent for patronage evaluation / work
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
        lead
      });
    });

    // 2. Process any Fiches Techniques explicitly assigned to a modéliste
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
        fiche
      });
    });

    return items;
  }, [leads, fiches, commandes, factures, users]);

  // Scope items to selected modéliste (or current modéliste)
  const filteredByRole = useMemo(() => {
    if (isAdmin) {
      if (selectedModelisteId === 'all') return modelItems;
      return modelItems.filter(item => !item.modelisteId || item.modelisteId === selectedModelisteId);
    }
    return modelItems.filter(item => {
      if (item.modelisteId && item.modelisteId === currentUser.id) return true;
      if (!item.modelisteId && item.sourceType === 'lead') return true;
      return false;
    });
  }, [modelItems, isAdmin, selectedModelisteId, currentUser.id]);

  // Unified Monthly Financial Balance + Workflow Counts
  const summary = useMemo(() => {
    const newToPrice = filteredByRole.filter(i => i.patronageStatus === 'requested');
    const pricedAwaitingValidation = filteredByRole.filter(i => i.patronageStatus === 'priced' && !i.isValidatedToWork);
    const allValidatedWork = filteredByRole.filter(i => i.isValidatedToWork);
    const activeWork = allValidatedWork.filter(i => i.workStatus !== 'termine');
    const completedWork = allValidatedWork.filter(i => i.workStatus === 'termine');
    const todayStr = new Date().toISOString().slice(0, 10);
    const overdueCount = activeWork.filter(i => i.deadlineDate && i.deadlineDate < todayStr).length;

    // Monthly balance calculation for `selectedMois`
    const monthValidatedModels = allValidatedWork.filter(i => {
      const m = (i.workCompletedAt || i.rawDate || '').slice(0, 7);
      return m === selectedMois;
    });

    // RH Balance Engine if linked employee exists
    let rhBalance: ReturnType<typeof computeWorkerMonthBalance> | null = null;
    if (linkedEmployee) {
      rhBalance = computeWorkerMonthBalance(linkedEmployee, selectedMois, [], paiements, payrollExtras);
    }

    // Total Earned in selectedMois: combine validated models in selectedMois + unlinked RH ModelisteWorkLog
    const modelsTotalThisMonth = monthValidatedModels.reduce((sum, i) => sum + (Number(i.patronagePrice) || 0), 0);
    const unlinkedExtraLogs = (rhBalance?.modelLogsValides || []).filter(
      log => !log.sourceLeadId || !allValidatedWork.some(it => it.id === log.sourceLeadId)
    );
    const extraLogsTotal = unlinkedExtraLogs.reduce((sum, l) => sum + l.quantite * l.tarifUnitaire, 0);
    const primesNet = (rhBalance?.totalPrimes || 0) - (rhBalance?.totalRetenues || 0) + (rhBalance?.baseMensuelle || 0);
    const monthEarnedMAD = Math.max(0, modelsTotalThisMonth + extraLogsTotal + primesNet);

    // Total Paid in selectedMois:
    // Use RH paiements_salaires for linkedEmployee in selectedMois, PLUS any paid models whose payment wasn't mirrored into paiements_salaires
    const rhPaysInMonth = linkedEmployee
      ? paiements.filter(p => p.employeId === linkedEmployee.id && p.mois === selectedMois)
      : [];
    const rhPaidSum = rhPaysInMonth.reduce((sum, p) => sum + (Number(p.montant) || 0), 0);

    const paidModelsInMonthWithoutRh = monthValidatedModels.filter(i => {
      if (!i.patronagePaid) return false;
      const ext = i.lead ? parseLeadDetailsJson(i.lead.details) : {};
      if (ext.patronagePaidSalaireId && rhPaysInMonth.some(p => p.id === ext.patronagePaidSalaireId)) {
        return false; // already counted in rhPaidSum
      }
      return !linkedEmployee; // if no RH employee, use model-level paid flag
    });
    const unlinkedPaidModelsSum = paidModelsInMonthWithoutRh.reduce((sum, i) => sum + (Number(i.patronagePrice) || 0), 0);
    const monthPaidMAD = rhPaidSum + unlinkedPaidModelsSum;
    const monthRemainingMAD = Math.max(0, monthEarnedMAD - monthPaidMAD);

    // Overall validated totals (all-time) for Règlements tab
    const totalValidatedAllMAD = allValidatedWork.reduce((sum, i) => sum + (Number(i.patronagePrice) || 0), 0);
    const reglesList = allValidatedWork.filter(i => i.patronagePaid);
    const enAttenteReglementList = allValidatedWork.filter(i => !i.patronagePaid);
    const totalRegleAllMAD = reglesList.reduce((sum, i) => sum + (Number(i.patronagePrice) || 0), 0);
    const totalResteAllMAD = Math.max(0, totalValidatedAllMAD - totalRegleAllMAD);

    return {
      newToPriceCount: newToPrice.length,
      pricedAwaitingValidationCount: pricedAwaitingValidation.length,
      activeWorkCount: activeWork.length,
      completedWorkCount: completedWork.length,
      overdueCount,
      allValidatedCount: allValidatedWork.length,
      monthModelsCount: monthValidatedModels.length,
      monthEarnedMAD,
      monthPaidMAD,
      monthRemainingMAD,
      rhPaysInMonth,
      reglesCount: reglesList.length,
      enAttenteReglementCount: enAttenteReglementList.length,
      totalValidatedAllMAD,
      totalRegleAllMAD,
      totalResteAllMAD
    };
  }, [filteredByRole, selectedMois, linkedEmployee, paiements, payrollExtras]);

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

  // Items for Section 2: À Tarifer
  const pricingItems = useMemo(() => {
    return filteredByRole.filter(item => {
      if (!matchesSearch(item)) return false;
      if (pricingFilter === 'requested') return item.patronageStatus === 'requested';
      if (pricingFilter === 'priced_waiting') return item.patronageStatus === 'priced' && !item.isValidatedToWork;
      return item.patronageStatus === 'requested' || (item.patronageStatus === 'priced' && !item.isValidatedToWork);
    });
  }, [filteredByRole, pricingFilter, search]);

  // Items for Section 3: Travaux à Faire (Validated by Admin OR Client)
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

  // Items for Section 4: Règlements & Balance
  const paymentItems = useMemo(() => {
    return filteredByRole.filter(item => {
      if (!item.isValidatedToWork) return false;
      if (!matchesSearch(item)) return false;
      if (paymentFilter === 'regles') return item.patronagePaid;
      if (paymentFilter === 'en_attente') return !item.patronagePaid;
      return true;
    });
  }, [filteredByRole, paymentFilter, search]);

  // Open Pricing Modal
  const openPricingModal = (item: ModelItem) => {
    setPricingItem(item);
    setPriceInput(item.patronagePrice > 0 ? String(item.patronagePrice) : '');
    setEchPriceInput(item.prixEchantillon > 0 ? String(item.prixEchantillon) : '');
    setNotesInput(item.patronageNotes || '');
  };

  // Save Modéliste Price (stays 100% synced with EvaluationPatronage)
  const handleSavePrice = async () => {
    if (!pricingItem?.lead) return;
    const patPrice = Number(priceInput);
    if (!priceInput || isNaN(patPrice) || patPrice <= 0) {
      showToast(isAr ? 'المرجو إدخال ثمن الباتروناج بشكل صحيح' : 'Veuillez saisir un prix de patronage valide', true);
      return;
    }
    const echPrice = echPriceInput ? Number(echPriceInput) || 0 : 0;
    setActionPendingId(pricingItem.id);
    try {
      const ext = parseLeadDetailsJson(pricingItem.lead.details);
      const newDetails = {
        ...ext,
        patronageStatus: 'priced',
        patronagePrice: patPrice,
        prixEchantillon: echPrice,
        patronageNotes: notesInput,
        modelisteId: ext.modelisteId || (!isAdmin ? currentUser.id : undefined),
        modelisteName: ext.modelisteName || (!isAdmin ? currentUser.nom : undefined),
        patronagePricedAt: new Date().toISOString()
      };
      const updatedLead: any = {
        ...pricingItem.lead,
        patronagePrice: patPrice,
        prixEchantillon: echPrice,
        details: JSON.stringify(newDetails)
      };
      await saveRecord('leads', updatedLead, true);
      setPricingItem(null);
      showToast(isAr ? 'تم حفظ التسعيرة وإرسالها للمصادقة بنجاح' : 'Tarif enregistré et envoyé pour validation');
      await fetchData();
    } catch (e) {
      console.error('Erreur sauvegarde tarif:', e);
      showToast(isAr ? 'حدث خطأ أثناء حفظ التسعيرة' : 'Erreur lors de la sauvegarde du tarif', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Open Admin Validate + Deadline Date Modal
  const openValidateModal = (item: ModelItem) => {
    setValidateModalItem(item);
    const defaultDate = item.deadlineDate || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    setDeadlineInput(defaultDate);
    setAssignModelisteInput(item.modelisteId || (!isAdmin ? currentUser.id : modelistes[0]?.id || ''));
  };

  // Save Admin Validation + Assigned Deadline Date
  const handleConfirmAdminValidate = async () => {
    if (!validateModalItem?.lead) return;
    if (!deadlineInput) {
      showToast(isAr ? 'المرجو تحديد تاريخ التسليم المطلوب' : 'Veuillez choisir la date limite de réalisation', true);
      return;
    }
    setActionPendingId(validateModalItem.id);
    try {
      const ext = parseLeadDetailsJson(validateModalItem.lead.details);
      const assignedUser = users.find(u => u.id === assignModelisteInput);
      const newDetails = {
        ...ext,
        adminValidatedToWork: true,
        adminValidatedAt: new Date().toISOString(),
        adminValidatedBy: currentUser.nom || 'Administration',
        deadlineDate: deadlineInput,
        workStatus: ext.workStatus || 'a_faire',
        modelisteId: assignModelisteInput || ext.modelisteId,
        modelisteName: assignedUser?.nom || ext.modelisteName
      };
      const updatedLead: Lead = {
        ...validateModalItem.lead,
        details: JSON.stringify(newDetails)
      };
      await saveRecord('leads', updatedLead, true);

      // Sync work log to payrollEngine if employee matched & price exists
      if (linkedEmployee && validateModalItem.patronagePrice > 0) {
        await saveModelisteWorkLog({
          employeId: linkedEmployee.id,
          date: new Date().toISOString().slice(0, 10),
          modeleName: validateModalItem.modele,
          client: validateModalItem.client,
          typeTravail: 'patronage_complet',
          quantite: 1,
          tarifUnitaire: validateModalItem.patronagePrice,
          statut: 'valide',
          sourceLeadId: validateModalItem.id,
          notes: `Date limite: ${deadlineInput}`
        });
      }

      setValidateModalItem(null);
      showToast(isAr ? 'تمت المصادقة وإضافة الموديل لقائمة العمل مع التاريخ المحدد' : 'Modèle validé et planifié dans Travaux à Faire');
      await fetchData();
    } catch (e) {
      console.error('Erreur validation atelier:', e);
      showToast(isAr ? 'تعذر حفظ المصادقة' : 'Erreur lors de la validation', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Update Work Status (À faire -> En cours -> Terminé)
  const handleUpdateWorkStatus = async (item: ModelItem, nextStatus: ModelisteWorkStatus) => {
    if (!item.lead) return;
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const newDetails = {
        ...ext,
        workStatus: nextStatus,
        workCompletedAt: nextStatus === 'termine' ? new Date().toISOString() : null
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(
        nextStatus === 'termine'
          ? isAr ? 'تم تسجيل الموديل كمنجز ومسلّم' : 'Modèle marqué comme terminé & livré'
          : isAr ? 'تم تحديث حالة العمل' : 'Statut du travail mis à jour'
      );
      await fetchData();
    } catch (e) {
      console.error('Erreur mise à jour statut travail:', e);
    } finally {
      setActionPendingId(null);
    }
  };

  // Toggle Paid / Unpaid with unified RH & Charges sync
  const handleTogglePatronagePaid = async (item: ModelItem) => {
    if (!item.lead) return;
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const newPaid = !ext.patronagePaid;
      const nowIso = new Date().toISOString();
      const todayYmd = nowIso.slice(0, 10);
      const payMois = selectedMois || todayYmd.slice(0, 7);

      let salaireId: string | null = ext.patronagePaidSalaireId || null;
      let chargeId: string | null = ext.patronagePaidChargeId || null;

      if (newPaid) {
        // Resolve employee to credit in RH Paiements (hydrated with RIB/Bank)
        const modUser = users.find(u => u.id === item.modelisteId);
        const empTarget =
          linkedEmployee ||
          (modUser ? findMatchingEmployeeForUser(modUser, hydratedEmployes) : undefined) ||
          hydratedEmployes.find(e => isModelisteEmployee(e) && e.actif);

        if (empTarget && item.patronagePrice > 0) {
          const hasRib = Boolean(empTarget.rib && empTarget.rib.trim());
          salaireId = genId();
          const payRec: PaiementSalaire = {
            id: salaireId,
            employeId: empTarget.id,
            montant: item.patronagePrice,
            date: todayYmd,
            mois: payMois,
            methode: hasRib ? 'virement' : 'especes',
            notes: `Patronage Modèle: ${item.modele} (${item.client})${hasRib ? ` • RIB: ${empTarget.banque ? empTarget.banque + ' ' : ''}${empTarget.rib}` : ''}`
          };
          await saveRecord('paiements_salaires', payRec, true);

          chargeId = genId();
          const chargeRec: Charge = {
            id: chargeId,
            designation: `Règlement Patronage - ${item.modele} (${empTarget.prenom} ${empTarget.nom})`,
            categorie: 'salaires',
            montant: item.patronagePrice,
            date: todayYmd,
            statut: 'payé',
            recurrence: 'ponctuel',
            fournisseur: `${empTarget.prenom} ${empTarget.nom}`,
            notes: `Sync Modéliste (${payMois})`
          };
          await saveRecord('charges', chargeRec, true);

          await saveModelisteWorkLog({
            employeId: empTarget.id,
            date: toYmd(item.workCompletedAt || item.rawDate) || todayYmd,
            modeleName: item.modele,
            client: item.client,
            typeTravail: 'patronage_complet',
            quantite: 1,
            tarifUnitaire: item.patronagePrice,
            statut: 'valide',
            sourceLeadId: item.id
          });
        }
      } else {
        if (salaireId) {
          await deleteRecord('paiements_salaires', salaireId);
          salaireId = null;
        }
        if (chargeId) {
          await deleteRecord('charges', chargeId);
          chargeId = null;
        }
      }

      const newDetails = {
        ...ext,
        patronagePaid: newPaid,
        patronagePaidAt: newPaid ? nowIso : null,
        patronagePaidMois: newPaid ? payMois : null,
        patronagePaidBy: newPaid ? currentUser.nom || 'Administration' : null,
        patronagePaidSalaireId: salaireId,
        patronagePaidChargeId: chargeId
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(
        newPaid
          ? isAr ? 'تم تأكيد الدفع ومزامنته مع الرصيد المالي' : 'Règlement enregistré et synchronisé avec la balance'
          : isAr ? 'تم إلغاء حالة الدفع' : 'Règlement annulé'
      );
      await fetchData();
    } catch (e) {
      console.error('Erreur toggle règlement:', e);
      showToast(isAr ? 'حدث خطأ أثناء تحديث الدفع' : 'Erreur lors du règlement', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Admin: Quick create & send a new model directly to Modéliste
  const handleCreateNewModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelForm.modele.trim() || !newModelForm.client.trim()) {
      showToast(isAr ? 'اسم الموديل والزبون إجباريان' : 'Le modèle et le client sont obligatoires', true);
      return;
    }
    setActionPendingId('new-model');
    try {
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
      await saveRecord('leads', newLead, true);
      setShowNewModelModal(false);
      setNewModelForm({ modele: '', client: '', quantity: '1', deadlineDate: '', modelisteId: '', notes: '' });
      setActiveTab('a_tarifer');
      setPricingFilter('requested');
      showToast(isAr ? 'تم إرسال الموديل الجديد للتسعير' : 'Nouveau modèle envoyé au modéliste pour tarification');
      await fetchData();
    } catch (err) {
      console.error('Erreur création modèle:', err);
      showToast(isAr ? 'تعذر إضافة الموديل' : 'Erreur lors de la création', true);
    } finally {
      setActionPendingId(null);
    }
  };

  const openWhatsApp = (phone?: string, clientName?: string, modeleName?: string) => {
    if (!phone) {
      showToast(isAr ? 'رقم الهاتف غير متوفر' : 'Numéro de téléphone non disponible', true);
      return;
    }
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '212' + p.substring(1);
    const msg = encodeURIComponent(
      isAr
        ? `السلام عليكم ${clientName || ''}، بخصوص موديل "${modeleName || ''}"...`
        : `Bonjour ${clientName || ''}, concernant le modèle "${modeleName || ''}"...`
    );
    window.open(`https://wa.me/${p}?text=${msg}`, '_blank');
  };

  const tabs: { id: MainTab; label: string; badge?: number; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: isAr ? 'الرئيسية والرصيد' : 'Tableau de Bord',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'a_tarifer',
      label: isAr ? 'موديلات جديدة للتسعير' : 'Nouveaux à Tarifer',
      badge: summary.newToPriceCount + summary.pricedAwaitingValidationCount,
      icon: <Scissors className="w-4 h-4" />
    },
    {
      id: 'travaux',
      label: isAr ? 'الموديلات المطلوب إنجازها' : 'Travaux à Faire',
      badge: summary.activeWorkCount,
      icon: <FileCheck className="w-4 h-4" />
    },
    {
      id: 'reglements',
      label: isAr ? 'المدفوعات والحساب' : 'Règlements & Balance',
      badge: summary.enAttenteReglementCount,
      icon: <Wallet className="w-4 h-4" />
    },
    {
      id: 'profil',
      label: isAr ? 'ملفي الشخصي و RIB' : 'Profil & RIB',
      icon: <CreditCard className="w-4 h-4" />
    }
  ];

  return (
    <div className={`space-y-6 ${isAr ? 'rtl font-sans' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 ${isAr ? 'left-5' : 'right-5'} z-[350] px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2.5 border ${
            toast.isError
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* ─── Header & Month Balance Bar ───────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 border border-white/10">
              <Scissors className="w-3.5 h-3.5" />
              <span>{isAr ? 'فضاء الموديليست المنظم' : 'Espace Modéliste Unifié'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {isAr ? 'لوحة الموديليست: الخدمات، التسعير والرصيد' : 'Tableau de Bord Modéliste — Travaux & Balance'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              {isAr
                ? 'تسعير الموديلات الجديدة، متابعة الخدمات المصادق عليها حسب تاريخ التسليم، والاطلاع على الرصيد الشهري بدقة.'
                : 'Tarifez les nouveaux modèles, suivez vos travaux validés avec date limite, et consultez votre balance mensuelle en temps réel.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Filter */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <input
                type="month"
                value={selectedMois}
                onChange={e => setSelectedMois(e.target.value)}
                className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <UserIcon className="w-4 h-4 text-indigo-300" />
                <select
                  value={selectedModelisteId}
                  onChange={e => setSelectedModelisteId(e.target.value)}
                  className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer"
                >
                  <option value="all" className="text-slate-900">
                    {isAr ? 'جميع الموديليست' : 'Tous les Modélistes'}
                  </option>
                  {modelistes.map(m => (
                    <option key={m.id} value={m.id} className="text-slate-900">
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isAdmin && (
              <button
                onClick={() => setShowNewModelModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إرسال موديل جديد' : 'Envoyer un Modèle'}</span>
              </button>
            )}

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث' : 'Actualiser'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Top 4 KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Monthly Remaining Balance */}
        <div
          onClick={() => setActiveTab('reglements')}
          className="cursor-pointer bg-white rounded-2xl p-5 border-2 border-indigo-100 hover:border-indigo-300 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? `الرصيد المتبقي (${selectedMois})` : `Solde Restant (${selectedMois})`}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-700">
            {summary.monthRemainingMAD.toLocaleString()} <span className="text-base font-bold">MAD</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold mt-2 text-slate-500">
            <span className="text-emerald-600">
              {isAr ? `المستحق: ${summary.monthEarnedMAD}` : `Dû: ${summary.monthEarnedMAD}`}
            </span>
            <span>•</span>
            <span className="text-slate-600">
              {isAr ? `المدفوع: ${summary.monthPaidMAD}` : `Réglé: ${summary.monthPaidMAD}`}
            </span>
          </div>
        </div>

        {/* KPI 2: New Models Awaiting Pricing */}
        <div
          onClick={() => {
            setActiveTab('a_tarifer');
            setPricingFilter('requested');
          }}
          className={`cursor-pointer bg-white rounded-2xl p-5 border-2 shadow-sm transition-all ${
            summary.newToPriceCount > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-100 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'جديد ينتظر التسعير' : 'Nouveaux à Tarifer'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{summary.newToPriceCount}</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isAr
              ? `${summary.pricedAwaitingValidationCount} مسعّرة تنتظر المصادقة`
              : `${summary.pricedAwaitingValidationCount} tarifé(s) en attente validation`}
          </p>
        </div>

        {/* KPI 3: Active Work Left to Execute */}
        <div
          onClick={() => {
            setActiveTab('travaux');
            setWorkFilter('pending');
          }}
          className={`cursor-pointer bg-white rounded-2xl p-5 border-2 shadow-sm transition-all ${
            summary.overdueCount > 0 ? 'border-rose-300' : 'border-slate-100 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'مطلوب إنجازها الآن' : 'Travaux à Exécuter'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.activeWorkCount}</div>
          <p className={`text-xs font-bold mt-1 ${summary.overdueCount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
            {summary.overdueCount > 0
              ? isAr
                ? `⚠️ ${summary.overdueCount} متأخرة عن الموعد`
                : `⚠️ ${summary.overdueCount} en retard`
              : isAr
              ? 'مصادق عليها ومبرمجة'
              : 'Modèles validés en cours'}
          </p>
        </div>

        {/* KPI 4: Completed Models */}
        <div
          onClick={() => {
            setActiveTab('travaux');
            setWorkFilter('termine');
          }}
          className="cursor-pointer bg-white rounded-2xl p-5 border-2 border-slate-100 hover:border-emerald-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'الموديلات المنجزة' : 'Modèles Réalisés'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{summary.completedWorkCount}</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isAr
              ? `إجمالي المدفوع: ${summary.totalRegleAllMAD.toLocaleString()} MAD`
              : `Total réglé: ${summary.totalRegleAllMAD.toLocaleString()} MAD`}
          </p>
        </div>
      </div>

      {/* ─── Organized 4-Tab Bar + Search ─────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== 'dashboard' && (
          <div className="relative w-full lg:w-72">
            <Search
              className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث بالموديل أو الزبون...' : 'Rechercher modèle ou client...'}
              className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 1: DASHBOARD HOME                                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Financial Balance Card */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>{isAr ? 'ملخص الرصيد الشهري' : 'Balance Mensuelle'}</span>
              </h2>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black">
                {selectedMois}
              </span>
            </div>

            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-semibold">
                  {isAr ? `المستحق عن الموديلات (${summary.monthModelsCount})` : `Gains validés (${summary.monthModelsCount})`}
                </span>
                <span className="font-black text-slate-900">{summary.monthEarnedMAD.toLocaleString()} MAD</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-semibold">
                  {isAr ? 'المبالغ المدفوعة / التسبيقات' : 'Règlements & Avances reçus'}
                </span>
                <span className="font-black text-emerald-600">- {summary.monthPaidMAD.toLocaleString()} MAD</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">
                  {isAr ? 'الرصيد المتبقي للصرف' : 'Reste à Percevoir'}
                </span>
                <span className="text-2xl font-black text-indigo-700">
                  {summary.monthRemainingMAD.toLocaleString()} MAD
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-[11px] font-bold text-emerald-700 uppercase">
                  {isAr ? 'تم الدفع (الكل)' : 'Total Réglé'}
                </p>
                <p className="text-lg font-black text-emerald-800 mt-0.5">
                  {summary.totalRegleAllMAD.toLocaleString()} MAD
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-[11px] font-bold text-amber-700 uppercase">
                  {isAr ? 'بانتظار الدفع' : 'En Attente'}
                </p>
                <p className="text-lg font-black text-amber-800 mt-0.5">
                  {summary.totalResteAllMAD.toLocaleString()} MAD
                </p>
              </div>
            </div>

            {/* Bank / RIB Quick Card on Dashboard */}
            {(linkedEmployee?.rib || profileTargetEmployee?.rib) ? (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-indigo-700 uppercase flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معلومات التحويل (RIB)' : 'RIB Virement'}</span>
                  </span>
                  {(linkedEmployee || profileTargetEmployee)?.banque && (
                    <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-[10px] font-black text-indigo-800">
                      {(linkedEmployee || profileTargetEmployee)?.banque}
                    </span>
                  )}
                </div>
                <p className="font-mono font-black text-xs text-slate-800 tracking-wide break-all">
                  {(linkedEmployee || profileTargetEmployee)?.rib?.replace(/(.{4})/g, '$1 ').trim()}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyRibToClipboard((linkedEmployee || profileTargetEmployee)?.rib)}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedRib ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRib ? (isAr ? 'تم النسخ!' : 'Copié !') : (isAr ? 'نسخ RIB' : 'Copier RIB')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profil')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    {isAr ? 'تعديل' : 'Éditer'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('profil')}
                className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/70 border border-dashed border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {isAr
                      ? 'أضف رقم الحساب البنكي (RIB) ومعلوماتك لتسهيل التحويلات'
                      : 'Ajouter votre RIB & infos (synchro RH)'}
                  </span>
                </span>
                <span className="font-black underline shrink-0">{isAr ? 'فتح' : 'Ouvrir'}</span>
              </button>
            )}

            {isAdmin && (
              <Link
                to="/balance-paie"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <DollarSign className="w-4 h-4" />
                <span>{isAr ? 'فتح صفحة الحساب الشامل (RH)' : 'Ouvrir Balance Paie RH'}</span>
              </Link>
            )}
          </div>

          {/* Action Queue: New Models + Urgent Deadlines */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Models Awaiting Pricing Alert */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-500" />
                  <span>{isAr ? 'موديلات جديدة في انتظار التسعير' : 'Nouveaux Modèles à Tarifer'}</span>
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('a_tarifer');
                    setPricingFilter('requested');
                  }}
                  className="text-xs font-black text-indigo-600 hover:underline cursor-pointer"
                >
                  {isAr ? 'عرض الكل ←' : 'Voir tout →'}
                </button>
              </div>

              {filteredByRole.filter(i => i.patronageStatus === 'requested').length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-2xl text-sm font-semibold text-slate-400">
                  {isAr ? 'لا توجد موديلات جديدة تحتاج تسعيراً حالياً' : 'Aucun nouveau modèle en attente de tarif'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredByRole
                    .filter(i => i.patronageStatus === 'requested')
                    .slice(0, 4)
                    .map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.photo ? (
                              <img src={item.photo} alt={item.modele} className="w-full h-full object-cover" />
                            ) : (
                              <Scissors className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm truncate">{item.modele}</p>
                            <p className="text-xs font-semibold text-slate-500 truncate">{item.client}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openPricingModal(item)}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shrink-0 cursor-pointer"
                        >
                          {isAr ? 'وضع الثمن' : 'Tarifer'}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Active Validated Work with Deadlines */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>{isAr ? 'قائمة الأعمال المطلوب إنجازها (حسب الموعد)' : 'Travaux Validés à Exécuter (Par Échéance)'}</span>
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('travaux');
                    setWorkFilter('pending');
                  }}
                  className="text-xs font-black text-indigo-600 hover:underline cursor-pointer"
                >
                  {isAr ? 'إدارة الأعمال ←' : 'Gérer →'}
                </button>
              </div>

              {filteredByRole.filter(i => i.isValidatedToWork && i.workStatus !== 'termine').length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-2xl text-sm font-semibold text-slate-400">
                  {isAr ? 'لا توجد موديلات قيد الإنجاز حالياً' : 'Aucun travail en attente pour le moment'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredByRole
                    .filter(i => i.isValidatedToWork && i.workStatus !== 'termine')
                    .sort((a, b) => getDeadlineBadge(a.deadlineDate, a.workStatus, isAr).urgency - getDeadlineBadge(b.deadlineDate, b.workStatus, isAr).urgency)
                    .slice(0, 5)
                    .map(item => {
                      const dl = getDeadlineBadge(item.deadlineDate, item.workStatus, isAr);
                      return (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.photo ? (
                                <img src={item.photo} alt={item.modele} className="w-full h-full object-cover" />
                              ) : (
                                <Scissors className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{item.modele}</p>
                              <p className="text-xs font-semibold text-slate-500">
                                {item.client} • {item.patronagePrice} MAD
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg border text-xs font-black ${dl.cls}`}>
                              {item.deadlineDate ? `${item.deadlineDate} (${dl.label})` : dl.label}
                            </span>
                            <button
                              onClick={() => setTechPackItem(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title={isAr ? 'البطاقة التقنية' : 'Fiche Tech'}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isAr ? 'البطاقة' : 'Fiche Tech'}</span>
                            </button>
                            <button
                              onClick={() => handleUpdateWorkStatus(item, 'termine')}
                              disabled={actionPendingId === item.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                            >
                              {isAr ? 'تم الإنجاز' : 'Terminer'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 2: NOUVEAUX MODÈLES À TARIFER (PRICING & VALIDATION)    */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'a_tarifer' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPricingFilter('requested')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                pricingFilter === 'requested' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {isAr ? `تنتظر التسعير (${summary.newToPriceCount})` : `En attente de tarif (${summary.newToPriceCount})`}
            </button>
            <button
              onClick={() => setPricingFilter('priced_waiting')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                pricingFilter === 'priced_waiting' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {isAr
                ? `مسعّرة تنتظر المصادقة (${summary.pricedAwaitingValidationCount})`
                : `Tarifés — En attente validation (${summary.pricedAwaitingValidationCount})`}
            </button>
            <button
              onClick={() => setPricingFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                pricingFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {isAr ? 'الكل' : 'Tous'}
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 font-bold">{isAr ? 'جاري التحميل...' : 'Chargement...'}</div>
          ) : pricingItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Scissors className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-black text-slate-800">
                {isAr ? 'لا توجد موديلات في هذا القسم حالياً' : 'Aucun modèle dans cette section'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricingItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        onClick={() => item.photo && setZoomImage(item.photo)}
                        className={`w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative group ${
                          item.photo ? 'cursor-pointer' : ''
                        }`}
                      >
                        {item.photo ? (
                          <>
                            <img src={item.photo} alt={item.modele} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <Scissors className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase mb-1 ${
                            item.patronageStatus === 'requested'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {item.patronageStatus === 'requested'
                            ? isAr ? 'جديد للتسعير' : 'À Tarifer'
                            : isAr ? 'مسعّر — ينتظر المصادقة' : 'Tarif proposé'}
                        </span>
                        <h3 className="font-black text-slate-900 text-base truncate">{item.modele}</h3>
                        <p className="text-xs font-semibold text-slate-500 truncate">
                          {item.client} • {item.quantity || 1} {isAr ? 'قطعة' : 'pcs'}
                        </p>
                      </div>
                    </div>

                    {item.clientNotes && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 line-clamp-2">
                        {item.clientNotes}
                      </div>
                    )}

                    {item.patronageStatus === 'priced' && (
                      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase">
                            {isAr ? 'ثمن الباترون المقترح' : 'Prix Patronage'}
                          </p>
                          <p className="text-lg font-black text-indigo-900">{item.patronagePrice} MAD</p>
                        </div>
                        {item.prixEchantillon > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">
                              {isAr ? 'ثمن العينة' : 'Échantillon'}
                            </p>
                            <p className="text-sm font-black text-slate-700">{item.prixEchantillon} MAD</p>
                          </div>
                        )}
                      </div>
                    )}

                    {Boolean(item.adminCounterPrice && item.adminCounterPrice > 0) && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1">
                            ⚠️ {isAr ? 'عرض مضاد وميزانية الكليان' : 'Contre-offre Atelier / Client'}
                          </p>
                          <span className="font-mono font-black text-sm text-amber-900">{item.adminCounterPrice} MAD</span>
                        </div>
                        {item.patronageNegotiationNotes && (
                          <p className="text-xs text-amber-700 mt-1 italic">"{item.patronageNegotiationNotes}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTechPackItem(item)}
                        className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer border border-indigo-200"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isAr ? 'البطاقة التقنية' : 'Fiche Tech (Pro)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => printFicheTechniqueModeliste(item, getMatchingFiche(item))}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                        title={isAr ? 'طباعة' : 'Imprimer'}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isAr ? 'طباعة' : 'Imprimer'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => openPricingModal(item)}
                      disabled={actionPendingId === item.id}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {item.patronageStatus === 'priced'
                          ? isAr ? 'تعديل التسعيرة' : 'Modifier le Tarif'
                          : isAr ? 'إدخال ثمن الباترون' : 'Fixer le Tarif'}
                      </span>
                    </button>

                    {isAdmin && item.patronageStatus === 'priced' && !item.isValidatedToWork && (
                      <button
                        onClick={() => openValidateModal(item)}
                        disabled={actionPendingId === item.id}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isAr ? 'المصادقة وتحديد تاريخ التسليم' : 'Valider & Définir Date Limite'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 3: TRAVAUX À FAIRE (VALIDATED BY ADMIN OR CLIENT)       */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'travaux' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setWorkFilter('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                workFilter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {isAr ? `قيد التنفيذ والمطلوبة (${summary.activeWorkCount})` : `À exécuter (${summary.activeWorkCount})`}
            </button>
            <button
              onClick={() => setWorkFilter('termine')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                workFilter === 'termine' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {isAr ? `المكتملة والمسلّمة (${summary.completedWorkCount})` : `Terminés & Livrés (${summary.completedWorkCount})`}
            </button>
            <button
              onClick={() => setWorkFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                workFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {isAr ? `الكل (${summary.allValidatedCount})` : `Tous (${summary.allValidatedCount})`}
            </button>
          </div>

          {workItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-black text-slate-800">
                {isAr ? 'لا توجد موديلات مصادق عليها للعمل حالياً' : 'Aucun travail validé dans cette catégorie'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? 'تظهر هنا الموديلات فور مصادقة الإدارة أو الزبون مع تاريخ التسليم المحدد.'
                  : 'Les modèles apparaissent ici dès validation par l’atelier ou le client.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workItems.map(item => {
                const dl = getDeadlineBadge(item.deadlineDate, item.workStatus, isAr);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        onClick={() => item.photo && setZoomImage(item.photo)}
                        className={`w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative group ${
                          item.photo ? 'cursor-pointer' : ''
                        }`}
                      >
                        {item.photo ? (
                          <>
                            <img src={item.photo} alt={item.modele} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <Scissors className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-900 text-lg">{item.modele}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            {item.isValidatedByClient
                              ? isAr ? 'مصادق من الزبون' : 'Validé Client'
                              : isAr ? 'مصادق من الإدارة' : 'Validé Atelier'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-black ${dl.cls}`}>
                            {item.deadlineDate ? `📅 ${item.deadlineDate} — ${dl.label}` : dl.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                          <span>👤 {item.client}</span>
                          <span>• {item.quantity || 1} {isAr ? 'قطعة' : 'pcs'}</span>
                          <span className="text-indigo-700 font-black">• {item.patronagePrice} MAD</span>
                          {item.modelisteName && <span>• {isAr ? 'الموديليست:' : 'Modéliste:'} {item.modelisteName}</span>}
                        </div>

                        {item.patronageNotes && (
                          <p className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {item.patronageNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Work Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setTechPackItem(item)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                        title={isAr ? 'البطاقة التقنية للموديليست (بدون أسعار تجارية)' : 'Fiche Technique Modéliste Pro (Sans prix)'}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isAr ? 'البطاقة التقنية (Pro)' : 'Fiche Tech (Pro)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => printFicheTechniqueModeliste(item, getMatchingFiche(item))}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition"
                        title={isAr ? 'طباعة البطاقة التقنية' : 'Imprimer Fiche Tech'}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => openValidateModal(item)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          title={isAr ? 'تعديل تاريخ التسليم' : 'Modifier date limite'}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{isAr ? 'الموعد' : 'Date limite'}</span>
                        </button>
                      )}

                      {item.workStatus === 'a_faire' && (
                        <button
                          onClick={() => handleUpdateWorkStatus(item, 'en_cours')}
                          disabled={actionPendingId === item.id}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isAr ? 'بدء العمل' : 'Démarrer'}</span>
                        </button>
                      )}

                      {item.workStatus !== 'termine' ? (
                        <button
                          onClick={() => handleUpdateWorkStatus(item, 'termine')}
                          disabled={actionPendingId === item.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isAr ? 'تأكيد الإنجاز والتسليم' : 'Marquer Terminé'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateWorkStatus(item, 'en_cours')}
                          disabled={actionPendingId === item.id}
                          className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAr ? 'منجز ومسلّم' : 'Terminé & Livré'}</span>
                        </button>
                      )}

                      {item.phone && (
                        <button
                          onClick={() => openWhatsApp(item.phone, item.client, item.modele)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
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
      {/* TAB 4: RÈGLEMENTS & BALANCE (CLEAN FR/AR — NO DARIJA LATIN) */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'reglements' && (
        <div className="space-y-4">
          {/* Clean Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                paymentFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {isAr ? `جميع المصادق عليها (${summary.allValidatedCount})` : `Tous Validés (${summary.allValidatedCount})`}
            </button>
            <button
              onClick={() => setPaymentFilter('regles')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'regles' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isAr ? `تم الدفع (${summary.reglesCount})` : `Réglés (${summary.reglesCount})`}</span>
            </button>
            <button
              onClick={() => setPaymentFilter('en_attente')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'en_attente' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? `بانتظار الدفع (${summary.enAttenteReglementCount})`
                  : `En attente de règlement (${summary.enAttenteReglementCount})`}
              </span>
            </button>
          </div>

          {paymentItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-bold">
              {isAr ? 'لا توجد موديلات مطابقة في هذه القائمة' : 'Aucun élément trouvé'}
            </div>
          ) : (
            <div className="space-y-3">
              {paymentItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      onClick={() => item.photo && setZoomImage(item.photo)}
                      className={`w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center ${
                        item.photo ? 'cursor-pointer' : ''
                      }`}
                    >
                      {item.photo ? (
                        <img src={item.photo} alt={item.modele} className="w-full h-full object-cover" />
                      ) : (
                        <Scissors className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 text-base truncate">{item.modele}</h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {item.client} • {item.date}
                        {item.patronagePaidAt && ` • ${isAr ? 'تاريخ الأداء:' : 'Réglé le:'} ${toYmd(item.patronagePaidAt)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        {isAr ? 'ثمن الباترون' : 'Montant Patronage'}
                      </span>
                      <span className="text-lg font-black text-indigo-700">{item.patronagePrice} MAD</span>
                    </div>

                    {item.patronagePaid ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAr ? 'تم الدفع' : 'Réglé'}</span>
                        </span>
                        {isAdmin && item.lead && (
                          <button
                            onClick={() => handleTogglePatronagePaid(item)}
                            disabled={actionPendingId === item.id}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                            title={isAr ? 'التراجع عن الدفع' : 'Annuler règlement'}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{isAr ? 'بانتظار الدفع' : 'En attente de règlement'}</span>
                        </span>
                        {isAdmin && item.lead && (
                          <button
                            onClick={() => handleTogglePatronagePaid(item)}
                            disabled={actionPendingId === item.id}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isAr ? 'تأكيد الدفع' : 'Marquer Réglé'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Monthly RH Advances / Salary Payments Breakdown */}
          {summary.rhPaysInMonth.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-4">
              <h3 className="font-black text-slate-800 text-sm mb-3">
                {isAr
                  ? `سجل الدفعات والتسبيقات المسجلة في النظام لشهر ${selectedMois}`
                  : `Historique des règlements & avances enregistrés (${selectedMois})`}
              </h3>
              <div className="space-y-2">
                {summary.rhPaysInMonth.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <span className="font-black text-slate-800">{p.notes || (isAr ? 'دفعة مالية' : 'Règlement')}</span>
                      <span className="text-slate-400 mx-2">• {p.date}</span>
                    </div>
                    <span className="font-black text-emerald-700">{Number(p.montant).toLocaleString()} MAD</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank / Virement Info Card for Admin */}
          {(linkedEmployee?.rib || profileTargetEmployee?.rib) && (
            <div className="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-2xl border-2 border-indigo-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>{isAr ? 'معلومات التحويل البنكي (Virement)' : 'Coordonnées Bancaires pour Virement'}</span>
                </div>
                <p className="font-black text-slate-900 text-base">
                  {(linkedEmployee || profileTargetEmployee)?.prenom} {(linkedEmployee || profileTargetEmployee)?.nom}
                  {(linkedEmployee || profileTargetEmployee)?.banque && (
                    <span className="mx-2 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-lg text-xs">
                      {(linkedEmployee || profileTargetEmployee)?.banque}
                    </span>
                  )}
                </p>
                <p className="font-mono font-black text-sm text-slate-700 tracking-wider">
                  {(linkedEmployee || profileTargetEmployee)?.rib?.replace(/(.{4})/g, '$1 ').trim()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyRibToClipboard((linkedEmployee || profileTargetEmployee)?.rib)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
              >
                {copiedRib ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRib ? (isAr ? 'تم النسخ!' : 'Copié !') : (isAr ? 'نسخ رقم RIB' : 'Copier le RIB')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 5: PROFIL & RIB (AUTO-SYNCED WITH RH)                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Summary / Virement Quick View */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl font-black text-indigo-300">
                  {(profileForm.nom || 'M')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-lg truncate">{profileForm.nom || activeProfileUser.nom}</p>
                  <p className="text-xs text-indigo-300 font-bold">
                    {isAr ? 'موديليست — مزامنة تلقائية مع RH' : 'Modéliste — Synchronisé RH'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-indigo-200 font-bold">
                  <span>{isAr ? 'الحساب البنكي (RIB)' : 'Compte Bancaire (RIB)'}</span>
                  {profileForm.banque && (
                    <span className="px-2 py-0.5 bg-indigo-500/40 rounded-md text-white">{profileForm.banque}</span>
                  )}
                </div>
                {profileForm.rib ? (
                  <>
                    <p className="font-mono font-black text-sm tracking-wider text-white break-all">
                      {profileForm.rib.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim()}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyRibToClipboard(profileForm.rib)}
                      className="w-full mt-2 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {copiedRib ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRib ? (isAr ? 'تم النسخ!' : 'RIB Copié !') : (isAr ? 'نسخ رقم RIB للتحويل' : 'Copier RIB pour Virement')}</span>
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-amber-300 font-semibold">
                    {isAr ? 'لم يتم إدخال RIB بعد — أضفه لتسهيل التحويل البنكي' : 'Aucun RIB enregistré — Ajoutez-le pour vos virements'}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-400/20 rounded-xl px-3.5 py-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  {profileTargetEmployee
                    ? isAr
                      ? `مربوط بملف الـ RH (${profileTargetEmployee.poste || 'Modéliste'})`
                      : `Lié au dossier RH (${profileTargetEmployee.poste || 'Modéliste'})`
                    : isAr
                    ? 'سيتم ربط الملف تلقائياً بصفحة الـ RH عند الحفظ'
                    : 'Création & liaison automatique dans RH à l’enregistrement'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Form: Personal + Bank Info */}
          <form onSubmit={handleSaveProfile} className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {isAr ? 'المعلومات الشخصية والحساب البنكي (RIB)' : 'Informations Personnelles & Coordonnées Bancaires'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {isAr
                    ? 'أي تعديل تقوم به هنا يتم تحديثه تلقائياً في صفحة الموارد البشرية (RH) لتسهيل التحويلات البنكية.'
                    : 'Toute modification enregistrée ici met automatiquement à jour votre fiche dans Suivi RH pour faciliter les virements.'}
                </p>
              </div>
              {isAdmin && modelistes.length > 0 && (
                <select
                  value={activeProfileUser.id}
                  onChange={e => setSelectedModelisteId(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                >
                  {modelistes.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isAr ? 'الاسم الكامل *' : 'Nom Complet *'}
                </label>
                <div className="relative">
                  <UserIcon className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="text"
                    required
                    value={profileForm.nom}
                    onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })}
                    className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-sm font-bold`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isAr ? 'رقم الهاتف' : 'Téléphone'}
                </label>
                <div className="relative">
                  <Phone className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="tel"
                    value={profileForm.telephone}
                    onChange={e => setProfileForm({ ...profileForm, telephone: e.target.value })}
                    placeholder="+212 6..."
                    className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-sm font-bold`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-sm font-bold`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isAr ? 'رقم البطاقة الوطنية (CIN)' : 'Numéro CIN'}
                </label>
                <input
                  type="text"
                  value={profileForm.cin}
                  onChange={e => setProfileForm({ ...profileForm, cin: e.target.value.toUpperCase() })}
                  placeholder="Ex: D123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-sm font-bold uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isAr ? 'العنوان الكامل' : 'Adresse'}
                </label>
                <div className="relative">
                  <MapPin className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="text"
                    value={profileForm.adresse}
                    onChange={e => setProfileForm({ ...profileForm, adresse: e.target.value })}
                    placeholder={isAr ? 'المدينة، الحي...' : 'Ville, Quartier...'}
                    className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-sm font-bold`}
                  />
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-800 font-black text-sm">
                <Building2 className="w-4 h-4" />
                <span>{isAr ? 'معلومات الحساب البنكي للتحويل (Virement Bancaire)' : 'Informations Bancaires (Virement)'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    {isAr ? 'البنك' : 'Banque'}
                  </label>
                  <select
                    value={profileForm.banque}
                    onChange={e => setProfileForm({ ...profileForm, banque: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl border border-indigo-200 bg-white focus:border-indigo-500 outline-none text-sm font-bold"
                  >
                    <option value="">{isAr ? 'اختر البنك...' : 'Sélectionner banque...'}</option>
                    {['CIH', 'Attijari', 'BP', 'BMCE', 'Al Barid', 'SG', 'BMCI', 'Crédit Agricole'].map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-700">
                      {isAr ? 'رقم الحساب البنكي RIB (24 رقماً)' : 'RIB Bancaire (24 Chiffres)'}
                    </label>
                    <span
                      className={`text-[11px] font-black ${
                        profileForm.rib.replace(/\s+/g, '').length === 24 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {profileForm.rib.replace(/\s+/g, '').length} / 24
                    </span>
                  </div>
                  <input
                    type="text"
                    value={profileForm.rib}
                    onChange={e => setProfileForm({ ...profileForm, rib: e.target.value.replace(/[^\d\s]/g, '') })}
                    placeholder="230 780 1234567890123456 78"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white focus:border-indigo-500 outline-none text-sm font-mono font-black tracking-wider text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {isAr ? 'حفظ ومزامنة تلقائية مع الـ RH' : 'Enregistrer & Synchroniser avec RH'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL: SET / EDIT PATRONAGE PRICE                           */}
      {/* ════════════════════════════════════════════════════════════ */}
      {pricingItem && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-500" />
                <span>{isAr ? 'تسعير الموديل للمصادقة' : 'Tarification du Modèle'}</span>
              </h3>
              <button onClick={() => setPricingItem(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  {pricingItem.photo && (
                    <img src={pricingItem.photo} alt={pricingItem.modele} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="font-black text-slate-900 truncate">{pricingItem.modele}</p>
                    <p className="text-xs font-semibold text-slate-500">
                      {pricingItem.client} • {pricingItem.quantity || 1} {isAr ? 'قطعة' : 'pcs'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTechPackItem(pricingItem)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                  title={isAr ? 'معاينة البطاقة التقنية' : 'Fiche Tech'}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isAr ? 'البطاقة التقنية' : 'Fiche Tech'}</span>
                </button>
              </div>

              {Boolean(pricingItem.adminCounterPrice && pricingItem.adminCounterPrice > 0) && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                      ⚠️ {isAr ? 'عرض مضاد وميزانية الكليان من الورشة' : 'Contre-proposition Atelier / Budget Client'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPriceInput(String(pricingItem.adminCounterPrice))}
                      className="px-2 py-0.5 rounded-lg bg-amber-600 text-white text-[10px] font-black hover:bg-amber-700 transition cursor-pointer"
                    >
                      {isAr ? 'تطبيق هذا الثمن' : 'Appliquer ce tarif'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-slate-700">{isAr ? 'الثمن المطلوب من طرف الورشة:' : 'Prix proposé par l\'atelier :'}</span>
                    <span className="text-base font-black text-amber-900 font-mono">{pricingItem.adminCounterPrice} MAD</span>
                  </div>
                  {pricingItem.patronageNegotiationNotes && (
                    <p className="text-xs text-slate-600 mt-1 italic bg-white/70 p-2 rounded-xl border border-amber-200/50">
                      💬 {pricingItem.patronageNegotiationNotes}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    {isAr ? 'ثمن الباترون والتدريج (MAD) *' : 'Prix Patronage (MAD) *'}
                  </label>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    placeholder="250"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 outline-none text-lg font-black text-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    {isAr ? 'ثمن العينة (MAD)' : 'Prix Échantillon (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={echPriceInput}
                    onChange={e => setEchPriceInput(e.target.value)}
                    placeholder="350"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-lg font-black text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isAr ? 'ملاحظات تقنية (اختياري)' : 'Notes techniques (optionnel)'}
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium resize-none"
                />
              </div>

              <button
                onClick={handleSavePrice}
                disabled={actionPendingId === pricingItem.id}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm transition cursor-pointer disabled:opacity-50"
              >
                {isAr ? 'حفظ التسعيرة وإرسالها' : 'Enregistrer le Tarif'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADMIN VALIDATE & ASSIGN DEADLINE DATE                */}
      {/* ════════════════════════════════════════════════════════════ */}
      {validateModalItem && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>{isAr ? 'المصادقة وتحديد يوم التسليم' : 'Valider & Planifier le Travail'}</span>
              </h3>
              <button onClick={() => setValidateModalItem(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="font-black text-slate-900">{validateModalItem.modele}</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  {validateModalItem.client} • {validateModalItem.patronagePrice} MAD
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isAr ? 'تاريخ التسليم المحدد للموديليست *' : 'Date limite de remise *'}
                </label>
                <input
                  type="date"
                  value={deadlineInput}
                  onChange={e => setDeadlineInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm"
                />
              </div>

              {modelistes.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    {isAr ? 'تعيين الموديليست المسؤول' : 'Modéliste assigné'}
                  </label>
                  <select
                    value={assignModelisteInput}
                    onChange={e => setAssignModelisteInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm bg-white"
                  >
                    <option value="">{isAr ? 'تلقائي / متاح للجميع' : 'Automatique'}</option>
                    {modelistes.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleConfirmAdminValidate}
                disabled={actionPendingId === validateModalItem.id}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition cursor-pointer"
              >
                {isAr ? 'تأكيد وإرسال لقائمة الخدمات' : 'Confirmer & Envoyer aux Travaux'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADMIN SEND NEW MODEL TO MODÉLISTE                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showNewModelModal && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>{isAr ? 'إرسال موديل جديد للتسعير' : 'Envoyer un Nouveau Modèle'}</span>
              </h3>
              <button onClick={() => setShowNewModelModal(false)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNewModel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isAr ? 'اسم الموديل *' : 'Nom du Modèle *'}
                </label>
                <input
                  type="text"
                  required
                  value={newModelForm.modele}
                  onChange={e => setNewModelForm({ ...newModelForm, modele: e.target.value })}
                  placeholder={isAr ? 'مثال: عباية، جاكيت...' : 'Ex: Robe, Ensemble...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isAr ? 'الزبون *' : 'Client *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newModelForm.client}
                    onChange={e => setNewModelForm({ ...newModelForm, client: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isAr ? 'الكمية' : 'Quantité'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newModelForm.quantity}
                    onChange={e => setNewModelForm({ ...newModelForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isAr ? 'تاريخ التسليم المقترح' : 'Date limite souhaitée'}
                  </label>
                  <input
                    type="date"
                    value={newModelForm.deadlineDate}
                    onChange={e => setNewModelForm({ ...newModelForm, deadlineDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isAr ? 'الموديليست' : 'Modéliste'}
                  </label>
                  <select
                    value={newModelForm.modelisteId}
                    onChange={e => setNewModelForm({ ...newModelForm, modelisteId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">{isAr ? 'الكل' : 'Tous'}</option>
                    {modelistes.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isAr ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={newModelForm.notes}
                  onChange={e => setNewModelForm({ ...newModelForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={actionPendingId === 'new-model'}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition cursor-pointer"
              >
                {isAr ? 'إرسال للتسعير' : 'Envoyer au Modéliste'}
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
      {/* ─── Fiche Technique Modéliste Pro Modal (Without Commercial Prices) ─── */}
      <FicheTechniqueModelisteModal
        isOpen={Boolean(techPackItem)}
        onClose={() => setTechPackItem(null)}
        item={techPackItem}
        matchingFiche={getMatchingFiche(techPackItem)}
        onSaveTechnicalNotes={handleSaveModelisteTechnicalNotes}
        isAr={isAr}
      />
    </div>
  );
}
