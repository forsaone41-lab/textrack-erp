import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Store,
  Phone,
  MessageCircle,
  PhoneCall,
  Video,
  CheckCircle,
  Clock,
  LogOut,
  Target,
  Search,
  X,
  DollarSign,
  UserCheck,
  Calculator,
  UserPlus,
  Scissors,
  MessageSquare,
  Edit2,
  Trash2,
  FileText,
  UserCircle2,
  LayoutGrid,
  Camera,
  Info,
  ImageIcon,
  Coins,
  CheckCheck,
  Wallet,
  Upload,
  Package,
  Layers,
  Sparkles,
  Building2,
  Factory,
  Percent,
  BadgePercent,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Tag,
  MapPin,
  Star,
  AlertTriangle,
  UserCog,
  RefreshCw,
  Send,
  Globe,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { 
  Lead,
  loadLeads,
  saveRecord,
  loadCompanyProfile,
  loadLeadPhoto,
  loadData,
  StockTissu,
  StockFourniture,
  User,
  parseLeadDetailsJson,
  upsertClientDevis,
  findMatchingCommandeForLead,
  Commande
} from '../types';
import { SUPPLIERS_DATA, SupplierProfile } from '../data/suppliersData';
import { useLang } from '../contexts/LangContext';
import { compressImage } from '../utils/image';
import { lazy, Suspense } from 'react';
import { saveModelisteWorkLog } from '../utils/payrollEngine';

const DevisBuilder = lazy(() => import('./DevisBuilder'));
const AISpace = lazy(() => import('./AISpace'));

function isNovember2026OrLater(dateStr?: string | number): boolean {
  if (!dateStr) return false;
  if (typeof dateStr === 'number') {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return y > 2026 || (y === 2026 && m >= 11);
  }
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      const p3 = parseInt(parts[2], 10);
      const year = p3 > 100 ? p3 : (p1 > 100 ? p1 : 2026);
      const month = p3 > 100 ? p2 : (p1 > 100 ? p2 : p2);
      if (!isNaN(year) && !isNaN(month)) {
        if (year > 2026) return true;
        if (year === 2026 && month >= 11) return true;
        return false;
      }
    }
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  if (year > 2026) return true;
  if (year === 2026 && month >= 11) return true;
  return false;
}

function isLeadEligibleForCommercial(l: any): boolean {
  if (!l || l.type?.startsWith('RECRUTEMENT:')) return false;
  // Ne garder que les clients de Novembre 2026 et au-delà (mois 11+)
  if (!isNovember2026OrLater(l.date)) return false;
  // Ne jamais afficher les leads verrouillés/bloqués
  if (l.commercialUnlocked === false) return false;
  // Étapes CRM actives
  if (l.crmStage && !['nouveau', 'contact_en_cours', 'rdv_fixe', 'attente_confirmation'].includes(l.crmStage)) return false;
  return true;
}

interface CommercialPortalProps {
  currentUser: any;
  onLogout: () => void;
}

export default function CommercialPortal({ currentUser, onLogout }: CommercialPortalProps) {
  const { isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const cachedLeads = localStorage.getItem('textrack_data_leads');
      if (cachedLeads) {
        const parsed = JSON.parse(cachedLeads);
        if (Array.isArray(parsed)) {
          const activeLeads = parsed.filter((l: any) => isLeadEligibleForCommercial(l));
          activeLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return activeLeads;
        }
      }
    } catch { /* ignore */ }
    return [];
  });
  
  const [allLeads, setAllLeads] = useState<Lead[]>(() => {
    try {
      const cachedLeads = localStorage.getItem('textrack_data_leads');
      if (cachedLeads) {
        const parsed = JSON.parse(cachedLeads);
        if (Array.isArray(parsed)) {
          return parsed.filter((l: any) => l && !l.type?.startsWith('RECRUTEMENT:'));
        }
      }
    } catch { /* ignore */ }
    return [];
  });

  const [loading, setLoading] = useState(() => leads.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [stageFilter, setStageFilter] = useState<'all' | 'nouveau' | 'en_cours'>('all');
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [savedOk, setSavedOk] = useState(false);
  const [leadPhotos, setLeadPhotos] = useState<Record<string, string>>({});
  
  // Extended Navigation Tabs
  type CommercialTab = 'leads' | 'commissions' | 'ai_devis' | 'fournisseurs' | 'stock' | 'rh' | 'profil';
  const [bottomTab, setBottomTab] = useState<CommercialTab>('leads');
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const [selectedLeadInfo, setSelectedLeadInfo] = useState<Lead | null>(null);

  // ── Mode de Calcul de Commission Dynamique (% vs Pièce vs Fixe) ──
  const [commissionCalcMode, setCommissionCalcMode] = useState<'percent' | 'piece' | 'fixed'>('percent');
  const [commissionRate, setCommissionRate] = useState<number>(3); // 3% par défaut

  // ── Fournisseurs State ──
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierCategory, setSupplierCategory] = useState<string>('all');

  // ── Stock Materials State ──
  const [stockTissus, setStockTissus] = useState<StockTissu[]>([]);
  const [stockFournitures, setStockFournitures] = useState<StockFourniture[]>([]);
  const [stockTab, setStockTab] = useState<'tissus' | 'fournitures'>('tissus');
  const [stockSearch, setStockSearch] = useState('');
  const [stockLoading, setStockLoading] = useState(false);

  // ── RH & Team State ──
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [rhLoading, setRhLoading] = useState(false);

  // ── AI Devis Chiffrage Rapide State ──
  const [aiDevisModel, setAiDevisModel] = useState<'hoodie' | 'pantalon' | 'tshirt' | 'ensemble' | 'custom'>('ensemble');
  const [aiDevisQty, setAiDevisQty] = useState<number>(100);
  const [aiDevisFabricCost, setAiDevisFabricCost] = useState<number>(75);
  const [aiDevisLaborCost, setAiDevisLaborCost] = useState<number>(35);
  const [aiDevisAccessoriesCost, setAiDevisAccessoriesCost] = useState<number>(15);
  const [aiDevisBroderieCost, setAiDevisBroderieCost] = useState<number>(15);
  const [aiDevisTargetMargin, setAiDevisTargetMargin] = useState<number>(30); // 30% marge atelier
  const [aiDevisCopied, setAiDevisCopied] = useState(false);

  // ── AI Analysis State ──
  const [aiAnalysisLead, setAiAnalysisLead] = useState<Lead | null>(null);

  // ── Devis Atelier State ──
  const [devisLead, setDevisLead] = useState<Lead | null>(null);
  const [devisMode, setDevisMode] = useState<'echantillon' | 'commande'>('commande');
  const [devisModeleReel, setDevisModeleReel] = useState<string>('');
  const [devisDelai, setDevisDelai] = useState<string>('');
  const [devisReponse, setDevisReponse] = useState<string>('');
  const [devisProgression, setDevisProgression] = useState<'reception' | 'etude' | 'echantillon' | 'production'>('etude');
  const [fabricType, setFabricType] = useState<string>('');
  const [devisPatronagePrice, setDevisPatronagePrice] = useState<string>('');
  const [devisPrixEchantillon, setDevisPrixEchantillon] = useState<string>('');
  const [matierePrice, setMatierePrice] = useState<string>('');
  const [laborPrice, setLaborPrice] = useState<string>('');
  const [devisSupplierNom, setDevisSupplierNom] = useState<string>('');
  const [devisSupplierTel, setDevisSupplierTel] = useState<string>('');
  const [devisSupplierCity, setDevisSupplierCity] = useState<string>('');
  const [devisSupplierCode, setDevisSupplierCode] = useState<string>('');
  const [devisSupplierColors, setDevisSupplierColors] = useState<string>('');
  const [devisSupplierNotes, setDevisSupplierNotes] = useState<string>('');
  const [devisOfficielConfirmed, setDevisOfficielConfirmed] = useState<boolean>(true);

  // ── Patronage Management State ──
  const [patronageModalLead, setPatronageModalLead] = useState<Lead | null>(null);
  const [patronageModelisteId, setPatronageModelisteId] = useState<string>('');
  const [patronageDeadline, setPatronageDeadline] = useState<string>('');
  const [patronageDirectPrice, setPatronageDirectPrice] = useState<string>('');
  const [patronageTab, setPatronageTab] = useState<'request' | 'validate'>('request');
  const [patronageSubmitting, setPatronageSubmitting] = useState<boolean>(false);

  const modelistes = useMemo(() => teamUsers.filter(u => u.role === 'modeliste'), [teamUsers]);

  const openDevisModal = (lead: Lead, mode: 'echantillon' | 'commande' = 'commande') => {
    setDevisLead(lead);
    setDevisMode(mode);
    let ext: any = {};
    try { ext = parseLeadDetailsJson(lead.details); } catch(e) {}
    setDevisModeleReel(lead.modeleReel || lead.type || '');
    setDevisDelai(ext.adminDelai || lead.delaiEstime || '7 - 10 jours ouvrables');
    setDevisReponse(ext.adminReponse !== undefined ? ext.adminReponse : (lead.reponseAtelier || ''));
    setDevisProgression(lead.statusProgression || 'etude');
    setFabricType(ext.adminFabric !== undefined ? ext.adminFabric : (lead.tissuSuggere || ''));
    setDevisPatronagePrice(lead.patronagePrice ? String(lead.patronagePrice) : ext.patronagePrice ? String(ext.patronagePrice) : '');
    setDevisPrixEchantillon(lead.prixEchantillon ? String(lead.prixEchantillon) : ext.prixEchantillon ? String(ext.prixEchantillon) : '');
    setDevisSupplierNom(ext.supplierName || (lead as any).fournisseurNom || '');
    setDevisSupplierTel(ext.supplierPhone || (lead as any).fournisseurTel || '');
    setDevisSupplierCity(ext.supplierCity || (lead as any).fournisseurVille || '');
    setDevisSupplierCode(ext.supplierCode || (lead as any).fournisseurCode || '');
    setDevisSupplierColors(ext.supplierColors || (lead as any).fournisseurCouleurs || '');
    setDevisSupplierNotes(ext.supplierNotes || (lead as any).fournisseurNote || '');
    setDevisOfficielConfirmed(ext.devisOfficielConfirmed !== undefined ? ext.devisOfficielConfirmed : true);

    if (ext.matierePrice !== undefined || ext.laborPrice !== undefined) {
      setMatierePrice(ext.matierePrice ? String(ext.matierePrice) : '');
      setLaborPrice(ext.laborPrice ? String(ext.laborPrice) : '');
    } else if (lead.unitPrice) {
      setMatierePrice('');
      setLaborPrice(String(lead.unitPrice));
    } else {
      setMatierePrice('');
      setLaborPrice('');
    }
  };

  const handleSendToPortail = async () => {
    if (!devisLead || (!matierePrice && !laborPrice)) return;
    const unitPrice = Number(matierePrice || 0) + Number(laborPrice || 0);
    const currentQuantity = devisMode === 'echantillon' ? 1 : devisLead.quantity;
    const total = unitPrice * currentQuantity;

    let extDetails: any = {};
    try { extDetails = parseLeadDetailsJson(devisLead.details); } catch(e) {}

    const allCommandes = await loadData<Commande>('commandes');
    const clientNorm = (devisLead.name || '').trim().toLowerCase();
    const clientCmds = (allCommandes || []).filter(c => (c.client || '').trim().toLowerCase() === clientNorm);
    const matchedCmd = findMatchingCommandeForLead(devisLead, clientCmds);
    if (matchedCmd) {
      extDetails.commandeId = matchedCmd.id;
      extDetails.commandeReference = matchedCmd.reference;
    }

    const { devis } = await upsertClientDevis({
      preferredId: extDetails.devisId,
      preferredNumero: extDetails.devisNumero,
      commandeId: extDetails.commandeId || undefined,
      leadId: devisLead.id,
      leadDetails: devisLead.details,
      client: devisLead.name,
      clientPhone: devisLead.phone,
      modele: devisModeleReel.trim() || devisLead.type,
      mode: devisMode,
      quantity: currentQuantity,
      unitPrice,
      matierePrice: Number(matierePrice || 0),
      laborPrice: Number(laborPrice || 0),
      patronagePrice: devisPatronagePrice ? Number(devisPatronagePrice) : undefined,
      prixEchantillon: devisPrixEchantillon ? Number(devisPrixEchantillon) : undefined,
      tissuSuggere: fabricType.trim() || undefined,
      delaiEstime: devisDelai.trim() || undefined,
      reponseAtelier: devisReponse.trim() || undefined,
      supplierName: devisSupplierNom.trim() || undefined,
      supplierPhone: devisSupplierTel.trim() || undefined,
      supplierCity: devisSupplierCity.trim() || undefined,
      supplierCode: devisSupplierCode.trim() || undefined,
      supplierColors: devisSupplierColors.trim() || undefined,
      supplierNotes: devisSupplierNotes.trim() || undefined,
      devisOfficielConfirmed
    });

    extDetails.devisId = devis.id;
    extDetails.devisNumero = devis.numero;
    extDetails.adminMode = devisMode;
    extDetails.adminQty = currentQuantity;
    extDetails.adminFabric = fabricType.trim();
    extDetails.adminDelai = devisDelai.trim();
    extDetails.adminReponse = devisReponse.trim();
    extDetails.matierePrice = Number(matierePrice || 0);
    extDetails.laborPrice = Number(laborPrice || 0);
    extDetails.unitPrice = unitPrice;
    extDetails.totalPrice = total;
    extDetails.devisOfficielConfirmed = devisOfficielConfirmed;
    if (devisPatronagePrice) {
      extDetails.patronagePrice = Number(devisPatronagePrice);
      extDetails.patronageStatus = 'priced';
    }
    if (devisPrixEchantillon) {
      extDetails.prixEchantillon = Number(devisPrixEchantillon);
    }
    if (devisSupplierNom) extDetails.supplierName = devisSupplierNom.trim();
    if (devisSupplierTel) extDetails.supplierPhone = devisSupplierTel.trim();
    if (devisSupplierCity) extDetails.supplierCity = devisSupplierCity.trim();
    if (devisSupplierCode) extDetails.supplierCode = devisSupplierCode.trim();
    if (devisSupplierColors) extDetails.supplierColors = devisSupplierColors.trim();
    if (devisSupplierNotes) extDetails.supplierNotes = devisSupplierNotes.trim();

    const updatedLead: Lead = {
      ...devisLead,
      modeleReel: devisModeleReel.trim() || devisLead.modeleReel,
      details: JSON.stringify(extDetails),
      statusProgression: devisProgression,
      tissuSuggere: fabricType.trim() || devisLead.tissuSuggere,
      delaiEstime: devisDelai.trim() || devisLead.delaiEstime,
      reponseAtelier: devisReponse.trim() || devisLead.reponseAtelier,
      reponseAtelierDate: new Date().toISOString(),
      patronagePrice: devisPatronagePrice ? Number(devisPatronagePrice) : devisLead.patronagePrice,
      prixEchantillon: devisPrixEchantillon ? Number(devisPrixEchantillon) : devisLead.prixEchantillon,
      unitPrice,
      totalPrice: total
    };

    setLeads(prev => prev.map(l => l.id === devisLead.id ? updatedLead : l));
    await saveRecord('leads', updatedLead, true);
    setDevisLead(null);
    alert(isAr ? 'تم حفظ الدوفيز ونشره في فضاء الزبون بنجاح!' : 'Devis enregistré et publié sur le portail client avec succès !');
  };

  const sendDevisWhatsApp = () => {
    if (!devisLead || (!matierePrice && !laborPrice)) return;
    const unit = Number(matierePrice || 0) + Number(laborPrice || 0);
    const qty = devisMode === 'echantillon' ? 1 : devisLead.quantity;
    const total = unit * qty;
    const rawPhone = String(devisLead.phone || '').replace(/\D/g, '');
    const phone = rawPhone.startsWith('2120') ? '212' + rawPhone.slice(3) : rawPhone.startsWith('0') ? '212' + rawPhone.slice(1) : rawPhone;
    const msg = isAr
      ? `السلام عليكم *${devisLead.name}*، معكم *BEYA CREATIVE*. 😊\n\n📌 تفاصيل الدوفيز الخاص بطلبكم (*${devisModeleReel || devisLead.type}*):\n• الكمية: *${qty} قطعة*\n• ثمن القطعة: *${unit} درهم*\n• المجموع الإجمالي: *${total.toLocaleString()} درهم*\n${fabricType ? `• نوع الثوب: *${fabricType}*\n` : ''}${devisDelai ? `• مدة الإنجاز: *${devisDelai}*\n` : ''}\nيمكنكم تتبع وتأكيد طلبكم مباشرة عبر بوابتكم الخاصة:\n👉 https://beyacreative.com/#/portal\n\nنحن رهن إشارتكم لأي استفسار!`
      : `Bonjour *${devisLead.name}*, ici *BEYA CREATIVE*. 😊\n\n📌 Détails de votre devis pour (*${devisModeleReel || devisLead.type}*) :\n• Quantité : *${qty} pcs*\n• Prix unitaire : *${unit} MAD*\n• Total estimé : *${total.toLocaleString()} MAD*\n${fabricType ? `• Tissu : *${fabricType}*\n` : ''}${devisDelai ? `• Délai estimé : *${devisDelai}*\n` : ''}\nSuivez et validez votre commande directement sur votre portail :\n👉 https://beyacreative.com/#/portal\n\nÀ votre entière disposition !`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const openPatronageModal = (lead: Lead) => {
    setPatronageModalLead(lead);
    const ext = parseLeadDetailsJson(lead.details);
    const patPrice = Number(ext.patronagePrice ?? (lead as any).patronagePrice) || 0;
    const initialModelisteId = ext.modelisteId || (modelistes[0]?.id || '');
    setPatronageModelisteId(initialModelisteId);
    setPatronageDeadline(ext.deadlineDate || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
    setPatronageDirectPrice(patPrice > 0 ? String(patPrice) : '');
  };

  const handleRequestPriceFromModeliste = async () => {
    if (!patronageModalLead) return;
    setPatronageSubmitting(true);
    try {
      const ext = parseLeadDetailsJson(patronageModalLead.details);
      const assignedUser = teamUsers.find(u => u.id === patronageModelisteId) || modelistes[0];
      const newDetails = {
        ...ext,
        patronageStatus: 'requested',
        modelisteId: assignedUser?.id || '',
        modelisteName: assignedUser?.nom || '',
        deadlineDate: patronageDeadline || ext.deadlineDate
      };
      const updatedLead: Lead = {
        ...patronageModalLead,
        details: JSON.stringify(newDetails)
      };
      setLeads(prev => prev.map(l => l.id === patronageModalLead.id ? updatedLead : l));
      await saveRecord('leads', updatedLead, true);
      const modPhone = (assignedUser?.telephone || '').replace(/\D/g, '');
      const modeleClean = (patronageModalLead.type || 'Modèle').replace(' (CMT - Client Tissu)', '').replace('RECRUTEMENT:', '');
      const waMsg = isAr
        ? `السلام عليكم ${assignedUser?.nom || 'أخي'}، يوجد موديل جديد "${modeleClean}" (الزبون: ${patronageModalLead.name}) يتطلب تسعيركم لخدمة الباتروناج والقص.\nالمرجو الدخول على حساب الموديليست وتحديد السعر والوقت. شكراً!`
        : `Bonjour ${assignedUser?.nom || ''}, un nouveau modèle "${modeleClean}" (Client: ${patronageModalLead.name}) nécessite votre chiffrage de patronage.\nMerci de fixer le tarif sur votre espace modéliste.`;
      setPatronageModalLead(null);
      if (modPhone && window.confirm(isAr ? 'تم إرسال الطلب للموديليست بنجاح! هل تريد تذكيره عبر واتساب الآن؟' : 'Demande transmise au modéliste ! Prévenir par WhatsApp ?')) {
        window.open(`https://wa.me/${modPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPatronageSubmitting(false);
    }
  };

  const handleValidatePatronageAndLaunch = async () => {
    if (!patronageModalLead) return;
    setPatronageSubmitting(true);
    try {
      const ext = parseLeadDetailsJson(patronageModalLead.details);
      const assignedUser = teamUsers.find(u => u.id === patronageModelisteId) || modelistes[0];
      const basePrice = Number(ext.patronagePrice ?? (patronageModalLead as any).patronagePrice) || 0;
      const customPrice = Number(patronageDirectPrice) || 0;
      const patPrice = basePrice > 0 ? basePrice : customPrice;

      const newDetails = {
        ...ext,
        patronagePrice: patPrice,
        patronageStatus: 'priced',
        adminValidatedToWork: true,
        modelisteId: assignedUser?.id || ext.modelisteId,
        modelisteName: assignedUser?.nom || ext.modelisteName,
        deadlineDate: patronageDeadline || ext.deadlineDate
      };
      const updatedLead: Lead = {
        ...patronageModalLead,
        details: JSON.stringify(newDetails),
        patronagePrice: patPrice
      };
      setLeads(prev => prev.map(l => l.id === patronageModalLead.id ? updatedLead : l));
      await saveRecord('leads', updatedLead, true);

      if (assignedUser) {
        try {
          await saveModelisteWorkLog({
            employeId: assignedUser.id,
            date: new Date().toISOString().slice(0, 10),
            modeleName: (patronageModalLead.type || 'Modèle').replace(' (CMT - Client Tissu)', '').replace('RECRUTEMENT:', ''),
            clientName: patronageModalLead.name,
            leadId: patronageModalLead.id,
            prixPatronage: patPrice,
            deadline: patronageDeadline || undefined,
            statut: 'en_cours'
          });
        } catch (e) {
          console.error(e);
        }
      }
      setPatronageModalLead(null);
      alert(isAr ? 'تمت المصادقة على الباترون وتكليف الموديليست بنجاح!' : 'Patronage validé et assigné avec succès !');
    } catch (e) {
      console.error(e);
    } finally {
      setPatronageSubmitting(false);
    }
  };

  // Load Stock & RH team data on mount
  useEffect(() => {
    const loadStockData = async () => {
      try {
        setStockLoading(true);
        const [t, f] = await Promise.all([
          loadData('stock_tissus') as Promise<StockTissu[]>,
          loadData('stock_fournitures') as Promise<StockFourniture[]>
        ]);
        setStockTissus(t || []);
        setStockFournitures(f || []);
      } catch (err) {
        console.error('Failed to load stock for commercial portal', err);
      } finally {
        setStockLoading(false);
      }
    };

    const loadTeamData = async () => {
      try {
        setRhLoading(true);
        const users = await loadData('users') as User[];
        setTeamUsers((users || []).filter(u => u && u.nom && !['client', 'affiliate'].includes(u.role)));
      } catch (err) {
        console.error('Failed to load team users for RH', err);
      } finally {
        setRhLoading(false);
      }
    };

    loadStockData();
    loadTeamData();
  }, []);

  useEffect(() => {
    // 2. Fetch fresh data
    fetchLeads(false);

    // Auto-refresh every 30 seconds to feel real-time when Admin grants access
    const interval = setInterval(() => {
      fetchLeads(false); // background fetch, no loading spinner
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeads = async (showLoading = true) => {
    if (showLoading && leads.length === 0) setLoading(true);
    try {
      const data = await loadLeads();
      const cleanData = data.filter(l => l && (!l.type || !l.type.startsWith('RECRUTEMENT:')));
      setAllLeads(cleanData);
      const activeLeads = cleanData.filter(l => isLeadEligibleForCommercial(l));
      activeLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLeads(activeLeads);
    } catch (e) {
      console.error("Failed to fetch leads in commercial portal", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (!isLeadEligibleForCommercial(l)) return false;

    const matchStage = stageFilter === 'all' || 
                        (stageFilter === 'nouveau' && (!l.crmStage || l.crmStage === 'nouveau')) ||
                        (stageFilter === 'en_cours' && (l.crmStage === 'contact_en_cours' || l.crmStage === 'attente_confirmation' || l.crmStage === 'rdv_fixe'));

    const matchSearch = (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (l.phone || '').includes(searchQuery) ||
           (l.type || '').toLowerCase().includes(searchQuery.toLowerCase());
           
    return matchStage && matchSearch;
  });

  const fetchedPhotosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchPhotos = async () => {
      const missingPhotos = filteredLeads.filter(l => (l.photoCount || 0) > 0 && !fetchedPhotosRef.current.has(l.id));
      if (missingPhotos.length === 0) return;
      
      // Mark as fetched immediately to prevent concurrent duplicate fetches
      missingPhotos.forEach(l => fetchedPhotosRef.current.add(l.id));

      const newPhotos: Record<string, string> = {};
      
      for (const l of missingPhotos) {
        try {
          const photo = await loadLeadPhoto(l.id);
          if (photo) newPhotos[l.id] = photo;
          
          // Small delay to let the browser breathe
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (e) {
          console.error('Failed to load photo for', l.id);
        }
      }
      
      if (Object.keys(newPhotos).length > 0) {
        setLeadPhotos(prev => ({ ...prev, ...newPhotos }));
      }
    };
    fetchPhotos();
  }, [filteredLeads]);

  const stats = useMemo(() => {
    return {
      nouveaux: leads.filter(l => !l.crmStage || l.crmStage === 'nouveau').length,
      enAttente: leads.filter(l => l.crmStage === 'attente_confirmation').length,
      totalActive: leads.length
    };
  }, [leads]);

  const myConfirmedLeads = useMemo(() => {
    const currentNom = (currentUser?.nom || '').trim().toLowerCase();
    const currentEmail = (currentUser?.email || '').trim().toLowerCase();

    return allLeads.filter(l => {
      if (l.crmStage !== 'confirme') return false;
      if (l.commercialConfirmedBy) {
        const confBy = l.commercialConfirmedBy.toLowerCase();
        return (currentNom && confBy.includes(currentNom)) || (currentEmail && confBy.includes(currentEmail));
      }
      return true;
    }).sort((a, b) => new Date(b.commercialConfirmedAt || b.date).getTime() - new Date(a.commercialConfirmedAt || a.date).getTime());
  }, [allLeads, currentUser]);

  const commissionStats = useMemo(() => {
    let totalCommissions = 0;
    let payees = 0;
    let avanceRecue = 0;
    let enAttente = 0;

    myConfirmedLeads.forEach(l => {
      const comm = l.commercialCommission !== undefined 
        ? Number(l.commercialCommission) 
        : (l.intentType === 'consultation' ? 50 : 150);
      totalCommissions += comm;
      if (l.commercialCommissionStatus === 'payee') {
        payees += comm;
      } else if (l.commercialCommissionStatus === 'avance_recue' || (l.commercialCheckAvanceRecue && l.commercialCheckTissuValide)) {
        avanceRecue += comm;
      } else {
        enAttente += comm;
      }
    });

    return {
      totalCommissions,
      payees,
      avanceRecue,
      enAttente,
      confirmedCount: myConfirmedLeads.length
    };
  }, [myConfirmedLeads]);

  const handleSave = async (nextStage?: string) => {
    if (!selectedLead) return;
    try {
      const isConfirm = nextStage === 'confirme';
      const defaultComm = editForm.intentType === 'consultation' ? 50 : 150;
      const finalComm = editForm.commercialCommission !== undefined 
        ? Number(editForm.commercialCommission) 
        : (selectedLead.commercialCommission !== undefined ? selectedLead.commercialCommission : defaultComm);

      // Determine commission status based on business conditions:
      let commStatus: 'en_attente' | 'avance_recue' | 'payee' = (selectedLead.commercialCommissionStatus as any) || 'en_attente';
      if (selectedLead.commercialCommissionStatus !== 'payee') {
        const isProd = (editForm.intentType || selectedLead.intentType || 'production') === 'production';
        if (isProd) {
          // Conditions: Client Validé + Tissu & Fournisseur Validé + Avance Payée
          const fullyReady = !!editForm.commercialCheckClientValide && !!editForm.commercialCheckTissuValide && !!editForm.commercialCheckAvanceRecue;
          commStatus = fullyReady ? 'avance_recue' : 'en_attente';
        } else {
          // Consultation: Fee / Avance Payée
          commStatus = editForm.commercialCheckAvanceRecue ? 'avance_recue' : 'en_attente';
        }
      }

      const updatedLead: Lead = { 
        ...selectedLead, 
        ...editForm, 
        ...(nextStage ? { crmStage: nextStage as any } : {}),
        ...(isConfirm ? {
          commercialConfirmedBy: currentUser?.nom || currentUser?.email || 'Commercial',
          commercialConfirmedAt: new Date().toISOString(),
          commercialCommission: finalComm,
          commercialCommissionStatus: commStatus,
          intentType: editForm.intentType || selectedLead.intentType || 'production',
          commercialCheckClientValide: !!editForm.commercialCheckClientValide,
          commercialCheckTissuValide: !!editForm.commercialCheckTissuValide,
          commercialCheckAvanceRecue: !!editForm.commercialCheckAvanceRecue,
          commercialAvanceMontant: Number(editForm.commercialAvanceMontant || 0)
        } : {})
      };

      await saveRecord('leads', updatedLead);
      setAllLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      setSavedOk(true);
      setTimeout(() => { 
        setSavedOk(false); 
        if (nextStage === 'confirme' || nextStage === 'annule') {
           setSelectedLead(null);
           fetchLeads(false); // Refresh
        }
      }, 1200);
    } catch (e) {
      alert(isAr ? 'حدث خطأ' : 'Une erreur est survenue');
    }
  };

  const openEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    const intent = lead.intentType || 'production';
    setEditForm({
      crmStage: lead.crmStage || 'nouveau',
      crmContactMethod: lead.crmContactMethod,
      crmPrice: lead.crmPrice,
      crmPriceConfirmed: lead.crmPriceConfirmed,
      crmNotes: lead.crmNotes,
      intentType: intent,
      commercialCommission: lead.commercialCommission !== undefined ? lead.commercialCommission : (intent === 'consultation' ? 50 : 150),
      commercialCommissionStatus: lead.commercialCommissionStatus || 'en_attente',
      commercialCheckClientValide: lead.commercialCheckClientValide !== undefined ? lead.commercialCheckClientValide : true,
      commercialCheckTissuValide: lead.commercialCheckTissuValide !== undefined ? lead.commercialCheckTissuValide : false,
      commercialCheckAvanceRecue: lead.commercialCheckAvanceRecue !== undefined ? lead.commercialCheckAvanceRecue : false,
      commercialAvanceMontant: lead.commercialAvanceMontant || 0,
      commercialRecuPhoto: lead.commercialRecuPhoto || ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-100 overflow-hidden">
          <div className="h-full bg-indigo-500 w-2/3 animate-pulse" />
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',backgroundSize:'30px 30px'}} />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        {/* Top bar */}
        <div className={`flex items-center justify-between mb-6 relative z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              {currentUser?.photo ? (
                <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border-2 border-white/30" alt="" />
              ) : (
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                  <Users className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-indigo-600 rounded-full" />
            </div>
            <div className={isAr ? 'text-right' : ''}>
              <p className="text-white font-black text-sm uppercase tracking-tight">{currentUser?.nom || 'Commercial'}</p>
              <p className="text-indigo-200 text-[9px] font-bold uppercase tracking-widest">{isAr ? 'تجاري' : 'Commercial'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="w-9 h-9 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white text-[10px] font-black flex items-center justify-center">
              {isAr ? 'FR' : 'AR'}
            </button>
            <button onClick={onLogout} className="w-9 h-9 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Title */}
        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em] mb-1 relative z-10">BEYA CREATIVE</p>
        <h1 className="text-2xl font-black text-white tracking-tight mb-6 relative z-10">
          {isAr ? 'لوحة التحكم التجارية' : 'Tableau de Bord Commercial'}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 relative z-10">
          {[
            { icon: Target, value: stats.totalActive, label: isAr ? 'طلبات نشطة' : 'Actifs', color: 'bg-white/20' },
            { icon: UserPlus, value: stats.nouveaux, label: isAr ? 'جديد' : 'Nouveaux', color: 'bg-blue-400/20' },
            { icon: CheckCircle, value: commissionStats.confirmedCount, label: isAr ? 'طلبات مؤكدة' : 'Confirmés', color: 'bg-emerald-400/20' },
            { 
              icon: Coins, 
              value: `${commissionStats.totalCommissions} DH`, 
              label: isAr ? 'أرباح العمولات' : 'Commissions', 
              color: 'bg-amber-400/25',
              highlight: true,
              onClick: () => setBottomTab('commissions')
            },
          ].map(({ icon: Icon, value, label, color, highlight, onClick }) => (
            <div 
              key={label} 
              onClick={onClick}
              className={`bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 border border-white/20 transition-all ${
                highlight ? 'cursor-pointer hover:bg-white/25 active:scale-95 ring-1 ring-amber-300/40 shadow-sm' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mb-2.5`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl md:text-2xl font-black text-white truncate">{value}</p>
              <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content lifted over hero */}
      <div className="px-4 -mt-6 relative z-10">
        {/* ── Top Navigation Quick Pills Bar ── */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-slate-200/80 mb-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button 
            type="button" 
            onClick={() => setBottomTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              bottomTab === 'leads' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>{isAr ? 'الطلبات والتأكيد' : 'Prospects & Confirmation'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono font-bold">{stats.totalActive}</span>
          </button>

          <button 
            type="button" 
            onClick={() => setBottomTab('commissions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              bottomTab === 'commissions' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'عمولاتي' : 'Commissions'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">{commissionStats.confirmedCount}</span>
          </button>
        </div>

        {bottomTab === 'leads' && (
          <>
            <div className="relative mb-6">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isAr ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={isAr ? 'بحث عن زبون أو طلب...' : 'Rechercher un prospect...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 shadow-sm`}
              />
            </div>

        <div className="bg-slate-100/80 p-1.5 rounded-2xl mb-8 flex gap-1.5 border border-slate-200/50 backdrop-blur-md">
          <button
            onClick={() => setStageFilter('all')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              stageFilter === 'all' 
                ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-900/5 scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
            {isAr ? 'الكل' : 'Tous'}
          </button>
          <button
            onClick={() => setStageFilter('nouveau')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              stageFilter === 'nouveau' 
                ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-900/5 scale-[1.02]' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/50'
            }`}
          >
            <UserPlus className="w-4 h-4" /> 
            {isAr ? 'طلبات جديدة' : 'Nouveaux'}
          </button>
          <button
            onClick={() => setStageFilter('en_cours')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              stageFilter === 'en_cours' 
                ? 'bg-white text-amber-600 shadow-md ring-1 ring-slate-900/5 scale-[1.02]' 
                : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50/50'
            }`}
          >
            <Clock className="w-4 h-4" /> 
            {isAr ? 'قيد التواصل' : 'En Cours'}
          </button>
        </div>

        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
             <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-300">
               <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
               <p className="text-slate-500 font-bold uppercase text-xs">{isAr ? 'لا توجد طلبات حالياً' : 'Aucun prospect pour le moment'}</p>
             </div>
          ) : (
            (() => {
              const groupedLeads = filteredLeads.reduce((acc, lead) => {
                const key = lead.name.toLowerCase().trim();
                if (!acc[key]) acc[key] = { client: { ...lead }, requests: [] };
                acc[key].requests.push(lead);
                return acc;
              }, {} as Record<string, { client: Lead, requests: Lead[] }>);

              const groupedLeadsList = Object.values(groupedLeads).slice(0, visibleCount);

              return groupedLeadsList.map(group => {
                const { client, requests } = group;
                const isUnlocked = true;
                const displayPhone = client.phone;
                const hasPriority = requests.some(r => r.crmPriority);

                return (
                  <div key={client.phone + client.name} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all relative">
                    {/* CLIENT HEADER */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4 border-b border-slate-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 bg-indigo-50 text-indigo-600">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            {client.name}
                            {hasPriority && <span className="text-xs">⭐</span>}
                          </h3>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-slate-500 mt-1" dir="ltr">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-indigo-400" /> {displayPhone}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* CLIENT ACTIONS */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedLeadInfo({ ...client, details: requests.map(r => r.details).filter(Boolean).join(' | ') } as Lead)}
                          className="h-9 px-3 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl flex items-center gap-2 text-xs font-black transition-all border border-amber-200 shadow-sm"
                        >
                          <FileText className="w-4 h-4" /> {isAr ? 'معلومات' : 'Infos'}
                        </button>
                        <a href={`tel:${client.phone.replace(/\\D/g, '').startsWith('0') ? '212' + client.phone.replace(/\\D/g, '').substring(1) : client.phone.replace(/\\D/g, '')}`}
                          className="h-9 px-3 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2 text-xs font-black transition-all border border-slate-200 shadow-sm">
                          <PhoneCall className="w-4 h-4" /> {isAr ? 'اتصال' : 'Appel'}
                        </a>
                        <button onClick={() => {
                          const rawPhone = String(client.phone || '').replace(/\\D/g, '');
                          const phone = rawPhone.startsWith('2120') ? '212' + rawPhone.slice(3) : rawPhone.startsWith('0') ? '212' + rawPhone.slice(1) : rawPhone;
                          window.open(`https://wa.me/${phone}`, '_blank');
                        }}
                          className="h-9 px-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 border transition-all shadow-sm bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600">
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </button>

                        <button onClick={() => alert(isAr ? 'ديفيز متوفر في الإدارة' : 'Le devis complet est géré par l\'administration')}
                          className="h-9 w-9 rounded-xl flex items-center justify-center border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>

                        <button onClick={() => alert(isAr ? 'تمت إضافة الزبون' : 'Le client est déjà enregistré')}
                          className="h-9 px-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl border border-emerald-200 text-[10px] font-black flex items-center gap-1 transition-all shadow-sm">
                          <CheckCircle className="w-4 h-4" /> {isAr ? 'تمت الإضافة كزبون' : 'Client Ajouté'}
                        </button>
                      </div>
                    </div>

                    {/* REQUESTS LIST */}
                    <div className="space-y-2">
                      {requests.map(req => (
                        <div key={req.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-xl border gap-4 transition-colors ${req.crmStage === 'confirme' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {leadPhotos[req.id] ? (
                              <img 
                                src={leadPhotos[req.id]} 
                                alt={req.type} 
                                onClick={() => setPreviewImage(leadPhotos[req.id])}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                <ImageIcon className="w-6 h-6 text-slate-300 opacity-50" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="flex items-center gap-1 text-slate-700 font-black text-sm uppercase tracking-tight">
                                  {['entreprise', 'marque', 'modeliste', 'ecom', 'debutant', 'N/A', 'Demande via New Landing'].includes(req.type || 'N/A') ? (
                                    isAr ? 'مشروع جديد' : 'Nouveau Projet'
                                  ) : (
                                    req.type
                                  )} <span className="text-slate-400 text-xs font-bold">({req.quantity || 1} pcs)</span>
                                </span>
                                {req.crmStage === 'confirme' && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> {isAr ? 'مؤكد' : 'Validé'}
                                  </span>
                                )}
                                {req.commercialRecuPhoto && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewImage(req.commercialRecuPhoto || null);
                                    }}
                                    className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                    title={isAr ? 'عرض وصل الفيرمون' : 'Voir le reçu de virement'}
                                  >
                                    📸 {isAr ? 'وصل الفيرمون' : 'Reçu Virement'}
                                  </button>
                                )}
                              </div>
                              
                              {/* New Project Details Tags */}
                              {(() => {
                                if (!req.details) return null;
                                const parts = req.details.split(' | ');
                                const tags = parts.filter(p => p.startsWith('Budget:') || p.startsWith('Objectif:') || p.startsWith('Délai:'));
                                if (tags.length === 0) return null;
                                
                                return (
                                  <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                                    {tags.map((tag, i) => {
                                      const [k, ...v] = tag.split(': ');
                                      return (
                                        <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-md">
                                          {v.join(': ')}
                                        </span>
                                      );
                                    })}
                                  </div>
                                );
                              })()}

                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  <Clock className="w-3 h-3" /> {new Date(req.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                            {/* 1. Devis Atelier (Royal Indigo Gradient) */}
                            {!req.type.startsWith('RECRUTEMENT:') && (
                              <button 
                                onClick={() => openDevisModal(req, 'commande')} 
                                title={isAr ? 'قرار وتسعير دوفيز الورشة الرسمي' : 'Devis & Décision Atelier'}
                                className="h-9 px-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-black rounded-xl border border-indigo-400/30 flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/30 active:scale-95 text-xs cursor-pointer group shrink-0"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-200 group-hover:text-white transition-colors" />
                                <span>{isAr ? 'قرار ودوفيز الورشة' : 'Devis Atelier'}</span>
                              </button>
                            )}

                            {/* 2. Valider | Refuser (Pill) */}
                            {req.crmStage === 'confirme' ? (
                              <span className="h-7.5 px-2.5 rounded-lg text-[10.5px] font-black border bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1 shadow-2xs">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>{isAr ? 'مؤكد' : 'Validé'}</span>
                              </span>
                            ) : req.crmStage === 'annule' ? (
                              <span className="h-7.5 px-2.5 rounded-lg text-[10.5px] font-black border bg-rose-100 text-rose-800 border-rose-300 flex items-center gap-1 shadow-2xs shrink-0">
                                <X className="w-3 h-3 text-rose-600" />
                                <span>{isAr ? 'ملغى' : 'Annulé'}</span>
                              </span>
                            ) : (
                              <div className="inline-flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200 shadow-2xs shrink-0" title={isAr ? 'تأكيد أو إلغاء الطلب' : 'Valider ou Refuser'}>
                                <button 
                                  onClick={() => openEditLead(req)}
                                  className="h-7 px-2.5 rounded-lg text-[10.5px] font-black text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                  title={isAr ? 'تأكيد الطلب' : 'Valider la commande'}
                                >
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>{isAr ? 'تأكيد' : 'Valider'}</span>
                                </button>
                                <div className="w-[1px] h-3 bg-slate-300 mx-0.5" />
                                <button 
                                  onClick={async () => {
                                    if (window.confirm(isAr ? 'هل أنت متأكد من رفض هذا الطلب؟' : 'Voulez-vous vraiment refuser cette demande ?')) {
                                      const updated = { ...req, crmStage: 'annule' as const, rejectedAt: new Date().toISOString() };
                                      setLeads(prev => prev.map(l => l.id === req.id ? updated : l));
                                      await saveRecord('leads', updated, true);
                                    }
                                  }}
                                  className="h-7 px-2.5 rounded-lg text-[10.5px] font-black text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                  title={isAr ? 'رفض وإلغاء هذا الطلب' : 'Refuser et archiver cette demande'}
                                >
                                  <X className="w-3 h-3 text-rose-500" />
                                  <span>{isAr ? 'رفض' : 'Refuser'}</span>
                                </button>
                              </div>
                            )}

                            {/* 3. Analyse (Pink button with scissors) */}
                            <button 
                              onClick={() => setAiAnalysisLead(req)}
                              className="h-9 px-2.5 rounded-xl text-xs font-black border bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-600 hover:text-white transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                              title={isAr ? 'تحليل الموديل واستخراج القياسات' : 'Analyser le modèle et extraire les mesures'}
                            >
                              <Scissors className="w-3.5 h-3.5" />
                              <span>{isAr ? 'تحليل الموديل' : 'Analyse'}</span>
                            </button>

                            {/* 4. Patronage (Indigo button with scissors) */}
                            {(() => {
                              const ext = parseLeadDetailsJson(req.details);
                              const patPrice = Number(ext.patronagePrice ?? (req as any).patronagePrice) || 0;
                              const isValidated = !ext.patronageCancelled && Boolean(ext.adminValidatedToWork || ext.clientValidated || req.crmPriceConfirmed);
                              const isPriced = !ext.patronageCancelled && (ext.patronageStatus === 'priced' || patPrice > 0);
                              const isRequested = !ext.patronageCancelled && ext.patronageStatus === 'requested';

                              if (isPriced && !isValidated) {
                                return (
                                  <button 
                                    onClick={() => openPatronageModal(req)}
                                    title={isAr ? 'قرار الباترون' : 'Décision Patronage'}
                                    className="h-9 px-3 rounded-xl text-xs font-black border bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 text-white hover:brightness-110 transition-all shadow-md flex items-center gap-1.5 cursor-pointer animate-pulse"
                                  >
                                    <Scissors className="w-3.5 h-3.5" />
                                    <span>{isAr ? `قرار الباترون (${patPrice} د.م)` : `Décision (${patPrice} MAD)`}</span>
                                  </button>
                                );
                              }

                              if (isValidated) {
                                return (
                                  <button 
                                    onClick={() => openPatronageModal(req)}
                                    title={isAr ? 'باترون مصادق عليه' : 'Patronage Validé'}
                                    className="h-9 px-2.5 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{isAr ? `✓ باترون مصادق (${patPrice} د.م)` : `✓ Validé (${patPrice} MAD)`}</span>
                                  </button>
                                );
                              }

                              if (isRequested) {
                                return (
                                  <button 
                                    onClick={() => openPatronageModal(req)}
                                    title={isAr ? 'بانتظار الموديليست' : 'En attente modéliste'}
                                    className="h-9 px-2.5 rounded-xl text-xs font-black border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>{isAr ? 'بانتظار الموديليست ⏳' : 'Attente Modéliste ⏳'}</span>
                                  </button>
                                );
                              }

                              return (
                                <button 
                                  onClick={() => openPatronageModal(req)}
                                  title={isAr ? 'طلب تسعير ومصادقة الباترون' : 'Demander / Gérer Patronage'}
                                  className="h-9 px-2.5 rounded-xl text-xs font-black border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Scissors className="w-3.5 h-3.5" />
                                  <span>{isAr ? 'باترون' : 'Patronage'}</span>
                                </button>
                              );
                            })()}

                            {/* 5. Notes / Details */}
                            <button 
                              onClick={() => setSelectedLeadInfo(req)} 
                              title={isAr ? 'عرض التفاصيل والملاحظات' : 'Détails & Notes'}
                              className="w-8 h-8 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 bg-white"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            
                            <button onClick={() => openEditLead(req)} title="Modifier"
                              className="w-8 h-8 bg-white text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button onClick={async () => {
                              if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Voulez-vous supprimer ce prospect ?')) {
                                const updated = { ...req, crmStage: 'annule' as const };
                                setLeads(prev => prev.map(l => l.id === req.id ? updated : l));
                                await saveRecord('leads', updated, true);
                              }
                            }} title="Supprimer"
                              className="w-8 h-8 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()
          )}

          {/* Load More Button */}
          {(() => {
            const groupedLeadsCount = Object.keys(
              filteredLeads.reduce((acc, lead) => {
                const key = lead.name.toLowerCase().trim();
                if (!acc[key]) acc[key] = { client: { ...lead }, requests: [] };
                acc[key].requests.push(lead);
                return acc;
              }, {} as Record<string, { client: Lead, requests: Lead[] }>)
            ).length;

            return visibleCount < groupedLeadsCount ? (
              <div className="flex justify-center mt-6 mb-8">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 15)}
                  className="px-6 py-3 bg-white text-indigo-600 font-bold text-sm rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-colors"
                >
                  {isAr ? 'عرض المزيد' : 'Afficher plus'}
                </button>
              </div>
            ) : null;
          })()}
        </div>
        </>
      )}

      {/* ── Commissions & Confirmed Demandes Tab ── */}
      {bottomTab === 'commissions' && (
        <div className="space-y-4">
          {/* Header Commission Summary */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  {isAr ? 'محفظة الأرباح والعمولات' : 'Portefeuille de Commissions'}
                </span>
                <h2 className="text-3xl font-black text-slate-900 mt-1">
                  {commissionStats.totalCommissions.toLocaleString()} <span className="text-base text-slate-400 font-bold">MAD</span>
                </h2>
              </div>
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 shadow-xs">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* Sub-breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  {isAr ? 'مستحقة (جاهزة للصرف)' : 'Prête (Avance OK)'}
                </span>
                <p className="text-xl font-black text-emerald-700 mt-0.5">
                  {commissionStats.avanceRecue.toLocaleString()} <span className="text-xs font-bold">MAD</span>
                </p>
                <p className="text-[9px] text-emerald-600 font-medium">{isAr ? 'الزبون دوز التسبيق ومول السلعة جاهز' : 'Avance reçue & fournisseur prêt'}</p>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {isAr ? 'بانتظار التسبيق / السلعة' : 'En attente d\'avance'}
                </span>
                <p className="text-xl font-black text-amber-700 mt-0.5">
                  {commissionStats.enAttente.toLocaleString()} <span className="text-xs font-bold">MAD</span>
                </p>
                <p className="text-[9px] text-amber-600 font-medium">{isAr ? 'في انتظار تحويل التسبيق وتأكيد الثوب' : 'En attente du virement / tissu'}</p>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3">
                <span className="text-[10px] font-bold uppercase text-indigo-800 tracking-wider flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-indigo-600" />
                  {isAr ? 'تم صرفها (مدفوعة)' : 'Payée'}
                </span>
                <p className="text-xl font-black text-indigo-700 mt-0.5">
                  {commissionStats.payees.toLocaleString()} <span className="text-xs font-bold">MAD</span>
                </p>
                <p className="text-[9px] text-indigo-600 font-medium">{isAr ? 'تم تحويلها لحسابك بنجاح' : 'Versée sur votre compte'}</p>
              </div>
            </div>

            {/* Commission Scale / Rules */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] font-bold text-slate-600 flex items-center justify-between gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                🎯 <strong>{isAr ? 'إنتاج وتصنيع:' : 'Confection :'}</strong> 150 MAD
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                💬 <strong>{isAr ? 'استشارة براند:' : 'Consultation :'}</strong> 50 MAD
              </span>
            </div>
          </div>

          {/* List of Confirmed Leads */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                {isAr ? `الطلبات المؤكدة (${myConfirmedLeads.length})` : `Demandes Confirmées (${myConfirmedLeads.length})`}
              </h3>
            </div>

            {myConfirmedLeads.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-300">
                <Coins className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold uppercase text-xs">
                  {isAr ? 'لا توجد طلبات مؤكدة بعد. ابدأ بتأكيد الطلبات لكسب العمولات!' : 'Aucune demande confirmée pour le moment'}
                </p>
              </div>
            ) : (
              myConfirmedLeads.map(lead => {
                const comm = lead.commercialCommission !== undefined 
                  ? Number(lead.commercialCommission) 
                  : (lead.intentType === 'consultation' ? 50 : 150);
                const isConsult = lead.intentType === 'consultation';
                const isPaid = lead.commercialCommissionStatus === 'payee';

                return (
                  <div key={lead.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                        isConsult ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isConsult ? '💬' : '🎯'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{lead.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isConsult ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isConsult ? (isAr ? 'استشارة' : 'Consultation') : (isAr ? 'إنتاج' : 'Production')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(lead.commercialConfirmedAt || lead.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{lead.type}</span>
                          {lead.quantity ? <span>({lead.quantity} pcs)</span> : null}
                        </div>

                        {/* Checklist conditions badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                            lead.commercialCheckClientValide !== false
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {lead.commercialCheckClientValide !== false ? '✓ الزبون وافق' : '⚠️ بانتظار موافقة الزبون'}
                          </span>

                          {!isConsult && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                              lead.commercialCheckTissuValide
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {lead.commercialCheckTissuValide ? '✓ مول السلعة متفق' : '⚠️ تواصل مع مول السلعة'}
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                            lead.commercialCheckAvanceRecue
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            {lead.commercialCheckAvanceRecue 
                              ? `✓ التسبيق واصل (${lead.commercialAvanceMontant || 0} د.م)` 
                              : '⏳ بانتظار وصل التسبيق'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Commission & Status */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-50">
                      <div className={isAr ? 'text-left' : 'text-right'}>
                        <span className="text-base font-black text-emerald-600">+{comm} MAD</span>
                        <p className="text-[9px] font-bold uppercase tracking-wider">
                          {isPaid ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {isAr ? '✓ تم الصرف' : 'Payée'}
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {isAr ? '⏳ قيد المعالجة' : 'En attente'}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const rawPhone = String(lead.phone || '').replace(/\D/g, '');
                          const phone = rawPhone.startsWith('2120') ? '212' + rawPhone.slice(3) : rawPhone.startsWith('0') ? '212' + rawPhone.slice(1) : rawPhone;
                          window.open(`https://wa.me/${phone}`, '_blank');
                        }}
                        className="h-8 px-2.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── AI Devis & Fast Chiffrage Tab ── */}
      {bottomTab === 'ai_devis' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {isAr ? 'حاسبة ومولد التسعيرة بالذكاء الاصطناعي (AI Devis)' : 'Calculateur & Devis Chiffrage IA'}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold">
                    {isAr ? 'حساب تكلفة الإنتاج، هامش ربح الورشة، وعمولة التجاري بدقة عالية' : 'Estimer les coûts, marge atelier et commission en temps réel'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBottomTab('devis')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>{isAr ? 'فتح محرر Devis PRO الرسمي' : 'Éditeur Devis PRO'}</span>
              </button>
            </div>

            {/* Model Presets */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                {isAr ? 'اختر نوع الموديل:' : 'Modèle de Vêtement :'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { key: 'hoodie', labelAr: '🧥 هودي 360g', labelFr: 'Hoodie 360g', fabric: 45, labor: 25, acc: 8, emb: 15 },
                  { key: 'pantalon', labelAr: '👖 سروال 360g', labelFr: 'Sweatpant 360g', fabric: 35, labor: 20, acc: 10, emb: 8 },
                  { key: 'tshirt', labelAr: '👕 تيشورت 240g', labelFr: 'T-Shirt 240g', fabric: 22, labor: 12, acc: 4, emb: 8 },
                  { key: 'ensemble', labelAr: '⚡ إنسومبل كامل', labelFr: 'Ensemble Complet', fabric: 75, labor: 38, acc: 18, emb: 20 },
                  { key: 'custom', labelAr: '✨ موديل مخصص', labelFr: 'Sur-mesure', fabric: 50, labor: 30, acc: 10, emb: 10 },
                ].map(m => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      setAiDevisModel(m.key as any);
                      setAiDevisFabricCost(m.fabric);
                      setAiDevisLaborCost(m.labor);
                      setAiDevisAccessoriesCost(m.acc);
                      setAiDevisBroderieCost(m.emb);
                    }}
                    className={`p-3 rounded-xl border text-center font-black text-xs transition-all cursor-pointer ${
                      aiDevisModel === m.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isAr ? m.labelAr : m.labelFr}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Elements Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                  {isAr ? 'الكمية المطلوبة (Qté)' : 'Quantité :'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={aiDevisQty}
                    onChange={e => setAiDevisQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base font-black outline-none focus:border-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-400">pcs</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                  {isAr ? 'تكلفة الثوب / بياسة' : 'Coût Tissu :'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={aiDevisFabricCost}
                    onChange={e => setAiDevisFabricCost(Number(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base font-black outline-none focus:border-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-400">DH</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                  {isAr ? 'الفصالة والخياطة (Main d\'œuvre)' : 'Façon Atelier :'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={aiDevisLaborCost}
                    onChange={e => setAiDevisLaborCost(Number(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base font-black outline-none focus:border-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-400">DH</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-black uppercase text-slate-500 block mb-1">
                  {isAr ? 'الطرز 3D / الإكسسوارات' : 'Finition & Broderie :'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={aiDevisAccessoriesCost + aiDevisBroderieCost}
                    onChange={e => {
                      const totalAcc = Number(e.target.value) || 0;
                      setAiDevisAccessoriesCost(Math.round(totalAcc / 2));
                      setAiDevisBroderieCost(totalAcc - Math.round(totalAcc / 2));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base font-black outline-none focus:border-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-400">DH</span>
                </div>
              </div>
            </div>

            {/* Calculations Engine Output */}
            {(() => {
              const unitCost = aiDevisFabricCost + aiDevisLaborCost + aiDevisAccessoriesCost + aiDevisBroderieCost;
              const marginFactor = Math.max(0.1, 1 - (aiDevisTargetMargin / 100));
              const sellingPrice = Math.round(unitCost / marginFactor);
              const totalTurnover = sellingPrice * aiDevisQty;
              const totalCost = unitCost * aiDevisQty;
              const atelierProfit = totalTurnover - totalCost;
              const commSuggested = Math.round(totalTurnover * 0.03); // 3%

              const copyWhatsappText = () => {
                const text = isAr 
                  ? `سلام عليكم، هذا عرض السعر التقديري لطلبيتكم لدى BEYA CREATIVE:
📦 الموديل: ${aiDevisModel === 'ensemble' ? 'إنسومبل كامل (هودي + سروال 360 GSM)' : aiDevisModel}
🔢 الكمية: ${aiDevisQty} قطعة
💰 ثمن الوحدة المقترح: ${sellingPrice} درهم
💵 الإجمالي التقديري: ${totalTurnover.toLocaleString()} درهم
⏱️ مدة الإنتاج: 10 إلى 15 يوم عمل
للتأكيد وإطلاق العينة تواصلوا معنا مباشرة.`
                  : `Bonjour, voici l'estimation de votre commande BEYA CREATIVE :
📦 Modèle : ${aiDevisModel}
🔢 Quantité : ${aiDevisQty} pcs
💰 Prix unitaire : ${sellingPrice} MAD
💵 Total HT : ${totalTurnover.toLocaleString()} MAD
Pour valider et lancer l'échantillon, contactez-nous directement.`;
                navigator.clipboard.writeText(text);
                setAiDevisCopied(true);
                setTimeout(() => setAiDevisCopied(false), 2500);
              };

              return (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        {isAr ? 'سعر التكلفة للبياسة' : 'Coût de Revient'}
                      </span>
                      <span className="text-2xl font-black text-slate-200">{unitCost} DH</span>
                    </div>

                    <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300 font-bold uppercase block mb-1">
                        {isAr ? 'سعر البيع المقترح' : 'Prix de Vente Conseillé'}
                      </span>
                      <span className="text-3xl font-black text-emerald-400">{sellingPrice} DH</span>
                    </div>

                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        {isAr ? 'رقم المعاملات الإجمالي' : 'Chiffre d\'Affaires'}
                      </span>
                      <span className="text-2xl font-black text-white">{totalTurnover.toLocaleString()} DH</span>
                    </div>

                    <div className="bg-amber-500/20 p-4 rounded-2xl border border-amber-500/30">
                      <span className="text-[10px] text-amber-300 font-bold uppercase block mb-1">
                        {isAr ? 'عمولة التجاري المقترحة (3%)' : 'Commission Commercial (3%)'}
                      </span>
                      <span className="text-2xl font-black text-amber-400">{commSuggested} DH</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                    <span className="text-xs text-slate-300 font-bold">
                      {isAr ? `💡 ربح الأتيليي الصافي: ${atelierProfit.toLocaleString()} درهم` : `Bénéfice Atelier : ${atelierProfit.toLocaleString()} MAD`}
                    </span>
                    <button
                      type="button"
                      onClick={copyWhatsappText}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      {aiDevisCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{aiDevisCopied ? (isAr ? 'تم نسخ العرض بنجاح ✓' : 'Copié ✓') : (isAr ? 'نسخ رسالة العرض للواتساب' : 'Copier Message WhatsApp')}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Fournisseurs & Matières Tab ── */}
      {bottomTab === 'fournisseurs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5" />
                  {isAr ? 'دليل موردي الأقمشة والسلعة المعتمدين' : 'Annuaire Fournisseurs & Matières Premières'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {isAr ? 'موردي الأقمشة ومول السلعة' : 'Fournisseurs Tissus & Mercerie'}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                {SUPPLIERS_DATA.length} {isAr ? 'مورد معتمد' : 'fournisseurs'}
              </span>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث عن مورد، نوع الثوب، أو المدينة (درب عمر، طنجة)...' : 'Rechercher un fournisseur, tissu, ville...'}
                  value={supplierSearch}
                  onChange={e => setSupplierSearch(e.target.value)}
                  className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600`}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { key: 'all', label: isAr ? 'الكل' : 'Tous' },
                  { key: 'streetwear', label: isAr ? 'مولطون وستريتوير' : 'Streetwear & Molleton' },
                  { key: 'crepe', label: isAr ? 'سكوبا وكريب' : 'Scuba & Crêpe' },
                  { key: 'denim', label: isAr ? 'جينز وكارغو' : 'Denim & Cargo' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSupplierCategory(cat.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      supplierCategory === cat.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUPPLIERS_DATA.filter(s => {
                const matchSearch = s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                  s.city.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                  s.fabricTags.some(t => t.toLowerCase().includes(supplierSearch.toLowerCase()));
                const matchCat = supplierCategory === 'all' || s.fabricCategory === supplierCategory;
                return matchSearch && matchCat;
              }).map(sup => (
                <div key={sup.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{sup.name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          {sup.city} • {sup.district}
                        </span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        ⭐ {sup.rating} ({sup.reviewsCount})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2">
                      {sup.specialtyTag || sup.desc}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {sup.fabricTags.map(tag => (
                        <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/80">
                    <a
                      href={`https://wa.me/${sup.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(isAr ? 'السلام عليكم، كنسول على توفر الأقمشة والأسعار لدى شركتكم (BEYA CREATIVE)' : 'Bonjour, demande de disponibilité de tissus.')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${sup.phone}`}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isAr ? 'اتصال' : 'Appeler'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Stock Matières Tab ── */}
      {bottomTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {isAr ? 'مخزون الأقمشة والمواد بالورشة' : 'Stock Réel à l\'Atelier'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {isAr ? 'المخزون الحالي والمواد الأولية' : 'Disponibilité des Matières'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStockTab('tissus')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    stockTab === 'tissus'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'الأقمشة (Tissus)' : 'Tissus'} ({stockTissus.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockTab('fournitures')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    stockTab === 'fournitures'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'السلعة والإكسسوارات' : 'Fournitures'} ({stockFournitures.length})
                </button>
              </div>
            </div>

            {/* Stock Search */}
            <div className="relative mb-4">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={isAr ? 'بحث في المخزون عن ثوب، لون، أو مادة...' : 'Rechercher tissu, couleur, fourniture...'}
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600`}
              />
            </div>

            {/* Stock Items Table */}
            {stockTab === 'tissus' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                      <th className="py-2.5">{isAr ? 'نوع الثوب' : 'Tissu'}</th>
                      <th className="py-2.5">{isAr ? 'اللون' : 'Couleur'}</th>
                      <th className="py-2.5">{isAr ? 'الأمتار المتبقية' : 'Métrage'}</th>
                      <th className="py-2.5">{isAr ? 'الحالة' : 'Statut'}</th>
                      <th className="py-2.5">{isAr ? 'الموقع' : 'Emplacement'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockTissus.filter(t => !stockSearch || t.type.toLowerCase().includes(stockSearch.toLowerCase()) || (t.couleur && t.couleur.toLowerCase().includes(stockSearch.toLowerCase()))).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 font-bold">
                        <td className="py-3 font-black text-slate-900">{t.type}</td>
                        <td>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                            {t.couleur || '—'}
                          </span>
                        </td>
                        <td className="font-mono text-indigo-600 font-black">{t.metrage} m</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            t.metrage > (t.seuilAlerte || 20)
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.metrage > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {t.metrage > (t.seuilAlerte || 20) ? (isAr ? 'متوفر' : 'Disponible') : t.metrage > 0 ? (isAr ? 'قارب على النفاد' : 'Alerte') : (isAr ? 'منتهي' : 'Épuisé')}
                          </span>
                        </td>
                        <td className="text-slate-500">{t.emplacement || 'Atelier'}</td>
                      </tr>
                    ))}
                    {stockTissus.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                          {isAr ? 'لا يوجد أقمشة مسجلة حالياً بالمخزن' : 'Aucun tissu en stock pour le moment'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                      <th className="py-2.5">{isAr ? 'المادة' : 'Fourniture'}</th>
                      <th className="py-2.5">{isAr ? 'الصنف' : 'Catégorie'}</th>
                      <th className="py-2.5">{isAr ? 'الكمية' : 'Quantité'}</th>
                      <th className="py-2.5">{isAr ? 'الحالة' : 'Statut'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockFournitures.filter(f => !stockSearch || f.nom.toLowerCase().includes(stockSearch.toLowerCase())).map(f => (
                      <tr key={f.id} className="hover:bg-slate-50 font-bold">
                        <td className="py-3 font-black text-slate-900">{f.nom}</td>
                        <td className="text-slate-600">{f.categorie}</td>
                        <td className="font-mono text-indigo-600 font-black">{f.quantite} {f.unite}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            f.quantite > (f.stockMin || 10)
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.quantite > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {f.quantite > (f.stockMin || 10) ? (isAr ? 'متوفر' : 'Normal') : f.quantite > 0 ? (isAr ? 'تنبيه نقص' : 'Alerte') : (isAr ? 'نفذ' : 'Rupture')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {stockFournitures.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">
                          {isAr ? 'لا يوجد إكسسوارات مسجلة حالياً' : 'Aucune fourniture en stock'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Suivi RH & Équipe Tab ── */}
      {bottomTab === 'rh' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {isAr ? 'الموارد البشرية وفريق العمل' : 'Gestion d\'Équipe & RH'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {isAr ? 'فريق العمل بالورشة ومتابعة الحضور' : 'Personnel & Présence'}
                </h2>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                {teamUsers.length} {isAr ? 'عضو في الفريق' : 'membres'}
              </span>
            </div>

            {/* Team Members List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {teamUsers.map(user => (
                <div key={user.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0">
                    {user.photo ? <img src={user.photo} className="w-full h-full object-cover rounded-xl" alt="" /> : (user.nom || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs text-slate-900 truncate">{user.nom}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-white border border-slate-200 text-slate-600 mt-0.5">
                      {user.role}
                    </span>
                  </div>
                  {user.telephone && (
                    <a
                      href={`tel:${user.telephone}`}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title={user.telephone}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Confirmation Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">{isAr ? 'تأكيد الطلبية' : 'Confirmation Commande'}</h2>
              <button onClick={() => setSelectedLead(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              
              {/* Client Info */}
              <div className="flex items-center gap-4">
                {selectedLead.photo ? (
                  <img src={selectedLead.photo} className="w-14 h-14 rounded-full object-cover border border-slate-200" alt="" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg">
                    {selectedLead.name.substring(0,2)}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-800">{selectedLead.name}</h3>
                  <p className="text-xs font-bold text-slate-500" dir="ltr">{selectedLead.phone}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isAr ? 'المنتوج' : 'Produit'}</span>
                  <span className="text-sm font-bold text-slate-700">{selectedLead.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isAr ? 'الكمية' : 'Quantité'}</span>
                  <span className="text-sm font-bold text-slate-700">{selectedLead.quantity} pcs</span>
                </div>
              </div>

              {/* Confirmation Section (Blasa dial lconfirmation) */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {isAr ? 'منطقة التأكيد والعمولة' : 'Zone de Confirmation & Commission'}
                </h4>

                {/* Type de Demande (Intent) & Commission */}
                <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-indigo-600" />
                      {isAr ? 'نوع التأكيد والعمولة المستحقة' : 'Type de Confirmation & Commission'}
                    </span>
                    <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                      +{editForm.commercialCommission !== undefined ? editForm.commercialCommission : (editForm.intentType === 'consultation' ? 50 : 150)} MAD
                    </span>
                  </div>

                  {/* ── Mode de Calcul de Commission Dynamique (% vs Pièce vs Fixe) ── */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setCommissionCalcMode('percent');
                        const total = (Number(selectedLead.quantity) || 1) * (Number(editForm.crmPrice || selectedLead.crmPrice) || 180);
                        const calc = Math.round(total * (commissionRate / 100));
                        setEditForm(prev => ({ ...prev, commercialCommission: calc }));
                      }}
                      className={`py-1.5 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                        commissionCalcMode === 'percent'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📊 {isAr ? 'نسبة مئوية (%)' : 'Pourcentage %'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCommissionCalcMode('piece');
                        const qty = Number(selectedLead.quantity) || 1;
                        const calc = Math.round(qty * 3);
                        setEditForm(prev => ({ ...prev, commercialCommission: calc }));
                      }}
                      className={`py-1.5 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                        commissionCalcMode === 'piece'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📦 {isAr ? 'بالقطعة (DH/pc)' : 'Par Pièce'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommissionCalcMode('fixed')}
                      className={`py-1.5 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                        commissionCalcMode === 'fixed'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      💵 {isAr ? 'مبلغ ثابت (Fixe)' : 'Fixe (MAD)'}
                    </button>
                  </div>

                  {/* Mode 1: Pourcentage (%) */}
                  {commissionCalcMode === 'percent' && (
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">{isAr ? 'النسبة المئوية من مجموع الطلب:' : 'Taux de commission :'}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 5, 7, 10].map(pct => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                setCommissionRate(pct);
                                const total = (Number(selectedLead.quantity) || 1) * (Number(editForm.crmPrice || selectedLead.crmPrice) || 180);
                                const calc = Math.round(total * (pct / 100));
                                setEditForm(prev => ({ ...prev, commercialCommission: calc }));
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer ${
                                commissionRate === pct
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between items-center">
                        <span>
                          {isAr ? 'تقدير الطلب:' : 'Est. :'} <strong>{((Number(selectedLead.quantity) || 1) * (Number(editForm.crmPrice || selectedLead.crmPrice) || 180)).toLocaleString()} MAD</strong> ({selectedLead.quantity || 1} pcs × {editForm.crmPrice || selectedLead.crmPrice || 180} DH)
                        </span>
                        <span className="font-black text-indigo-700 font-mono">
                          × {commissionRate}% = {Math.round(((Number(selectedLead.quantity) || 1) * (Number(editForm.crmPrice || selectedLead.crmPrice) || 180)) * (commissionRate / 100))} DH
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Par Pièce (DH/pc) */}
                  {commissionCalcMode === 'piece' && (
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">{isAr ? 'المبلغ لكل قطعة:' : 'Montant par pièce :'}</span>
                        <div className="flex gap-1">
                          {[2, 3, 5, 10, 15].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setCommissionRate(amt);
                                const calc = Math.round((Number(selectedLead.quantity) || 1) * amt);
                                setEditForm(prev => ({ ...prev, commercialCommission: calc }));
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer ${
                                commissionRate === amt
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {amt} DH
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between items-center">
                        <span>
                          {selectedLead.quantity || 1} قطعة × {commissionRate} د.م/بياسة
                        </span>
                        <span className="font-black text-indigo-700 font-mono">
                          = {Math.round((Number(selectedLead.quantity) || 1) * commissionRate)} DH
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Fixe */}
                  {commissionCalcMode === 'fixed' && (
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">{isAr ? 'مبالغ سريعة:' : 'Montants rapides :'}</span>
                        <div className="flex gap-1">
                          {[50, 100, 150, 200, 300].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setEditForm(prev => ({ ...prev, commercialCommission: amt }))}
                              className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer ${
                                editForm.commercialCommission === amt
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {amt} DH
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct Input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">MAD</span>
                    <input
                      type="number"
                      value={editForm.commercialCommission ?? 150}
                      onChange={(e) => setEditForm(prev => ({ ...prev, commercialCommission: Number(e.target.value) }))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border-2 border-indigo-200 rounded-xl text-base font-black text-slate-900 outline-none focus:border-indigo-600 transition-colors"
                      placeholder="150"
                    />
                  </div>
                </div>

                {/* ── شروط استحقاق العمولة والتحقق (Checklist d'Éligibilité) ── */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {isAr ? 'شروط استحقاق العمولة (Checklist)' : 'Conditions d\'Éligibilité de la Commission'}
                    </h5>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      ((editForm.intentType === 'consultation' && editForm.commercialCheckAvanceRecue) ||
                       (editForm.commercialCheckClientValide && editForm.commercialCheckTissuValide && editForm.commercialCheckAvanceRecue))
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {((editForm.intentType === 'consultation' && editForm.commercialCheckAvanceRecue) ||
                       (editForm.commercialCheckClientValide && editForm.commercialCheckTissuValide && editForm.commercialCheckAvanceRecue))
                        ? (isAr ? '✓ جاهزة ومستحقة للصرف' : 'Prête au paiement')
                        : (isAr ? '⏳ بانتظار التسبيق / السلعة' : 'En attente')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Check 1: Client Validation */}
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!editForm.commercialCheckClientValide}
                        onChange={(e) => setEditForm(prev => ({ ...prev, commercialCheckClientValide: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{isAr ? '1. الزبون وافق على الموديل والدوفيز (Client Validé)' : '1. Accord Client sur le devis & modèle'}</p>
                        <p className="text-[10px] text-slate-500">{isAr ? 'تأكيد عدد القطع والمواصفات النهائية' : 'Quantité et détails confirmés avec le client'}</p>
                      </div>
                    </label>

                    {/* Check 2: Tissu & Fournisseur (for production) */}
                    {editForm.intentType !== 'consultation' && (
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                        <input
                          type="checkbox"
                          checked={!!editForm.commercialCheckTissuValide}
                          onChange={(e) => setEditForm(prev => ({ ...prev, commercialCheckTissuValide: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{isAr ? '2. الاتفاق على الثوب والتواصل مع مول السلعة (Tissu Dispo)' : '2. Contact avec le fournisseur de tissu & mercerie'}</p>
                          <p className="text-[10px] text-slate-500">{isAr ? 'تم التحقق من نوع الثوب وتوفره عند المورد ومول السلعة جاهز' : 'Matière première validée et disponible chez le fournisseur'}</p>
                        </div>
                      </label>
                    )}

                    {/* Check 3: Avance Bancaire */}
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!editForm.commercialCheckAvanceRecue}
                        onChange={(e) => setEditForm(prev => ({ ...prev, commercialCheckAvanceRecue: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{isAr ? '3. الزبون دوز التسبيق واستلام وصل التحويل (Avance Reçue)' : '3. Reçu de virement / avance bancaire reçu'}</p>
                        <p className="text-[10px] text-slate-500">{isAr ? 'تم استلام صورة التحويل البنكي لحساب الورشة' : 'Avance validée sur le compte bancaire'}</p>
                      </div>
                    </label>
                  </div>

                  {/* Avance amount input & Reçu de Virement Upload */}
                  <div className="space-y-3 pt-1">
                    {editForm.commercialCheckAvanceRecue && (
                      <div>
                        <label className="block text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-1">
                          {isAr ? 'مبلغ التسبيق المستلم (درهم):' : 'Montant de l\'avance reçue (MAD) :'}
                        </label>
                        <input
                          type="number"
                          value={editForm.commercialAvanceMontant || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, commercialAvanceMontant: Number(e.target.value) }))}
                          placeholder={editForm.intentType === 'consultation' ? '250' : 'مثلاً: 1500'}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                        />
                      </div>
                    )}

                    {/* 📸 BLASA DIAL TSWIRA DIAL VERMNT (Upload Reçu de Virement) */}
                    <div className="p-3.5 rounded-2xl bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          {isAr ? 'صورة وصل التحويل البنكي (Reçu Virement)' : 'Photo / Reçu du Virement Bancaire'}
                        </label>
                        {editForm.commercialRecuPhoto ? (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            ✓ {isAr ? 'تم إرفاق الوصل' : 'Reçu attaché'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {isAr ? 'مطلوب لتأكيد الإنتاج' : 'Requis pour production'}
                          </span>
                        )}
                      </div>

                      {editForm.commercialRecuPhoto ? (
                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <img 
                            src={editForm.commercialRecuPhoto} 
                            alt="Reçu virement" 
                            className="w-16 h-16 rounded-lg object-cover border border-slate-300 shadow-2xs cursor-pointer hover:opacity-90"
                            onClick={() => setPreviewImage(editForm.commercialRecuPhoto || null)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{isAr ? 'وصل التحويل البنكي' : 'Reçu de virement bancaire'}</p>
                            <p className="text-[10px] text-slate-500">{isAr ? 'انقر لتكبير ومعاينة الصورة' : 'Cliquez pour agrandir'}</p>
                            <div className="flex gap-2 mt-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewImage(editForm.commercialRecuPhoto || null)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black hover:bg-indigo-100 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                👁️ {isAr ? 'معاينة' : 'Voir'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditForm(prev => ({ ...prev, commercialRecuPhoto: '' }))}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black hover:bg-rose-100 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                ✕ {isAr ? 'حذف' : 'Supprimer'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 rounded-xl bg-indigo-50/40 hover:bg-indigo-50/80 border border-indigo-100 cursor-pointer transition-all text-center group">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const base64 = await compressImage(file, 1200, 0.8);
                                setEditForm(prev => ({ 
                                  ...prev, 
                                  commercialRecuPhoto: base64,
                                  commercialCheckAvanceRecue: true 
                                }));
                              } catch (err) {
                                console.error('Upload error:', err);
                              }
                              e.target.value = '';
                            }}
                          />
                          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-indigo-200 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-indigo-600" />
                          </div>
                          <p className="text-xs font-black text-indigo-900">
                            {isAr ? 'اضغط هنا لرفع صورة وصل الفيرمون (Reçu)' : 'Cliquez pour téléverser le reçu de virement'}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                            {isAr ? 'صورة الكابتور أو التوصيل البنكي (JPG, PNG)' : 'Capture d\'écran ou photo du reçu (JPG, PNG)'}
                          </p>
                        </label>
                      )}
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-500 font-bold leading-relaxed pt-1">
                    {isAr 
                      ? '⚠️ تذكير: عمولة 150 درهم لا تُصرف إلا بعد الاتفاق مع مول السلعة على الثوب ودخول تسبيق الزبون في الحساب البنكي.'
                      : '⚠️ Rappel : La commission est versée uniquement après confirmation du tissu auprès du fournisseur et encaissement de l\'avance.'}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    {editForm.intentType === 'consultation' 
                      ? (isAr ? 'ثمن جلسة الاستشارة (درهم)' : 'Prix Consultation (MAD)')
                      : (isAr ? 'ثمن القطعة (درهم)' : 'Prix Unitaire (DH)')}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={editForm.crmPrice || ''} 
                      onChange={(e) => setEditForm({ ...editForm, crmPrice: Number(e.target.value) })}
                      placeholder={editForm.intentType === 'consultation' ? '250' : '0.00'} 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-800 focus:ring-2 focus:ring-indigo-500/20" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'ملاحظات' : 'Notes (Options)'}</label>
                  <textarea 
                    value={editForm.crmNotes || ''} 
                    onChange={(e) => setEditForm({ ...editForm, crmNotes: e.target.value })}
                    rows={2} 
                    placeholder={isAr ? 'أضف ملاحظات...' : 'Ajoutez des notes...'}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 resize-none" 
                  />
                </div>

                {/* WhatsApp Confirmation Button */}
                <button
                    type="button"
                    onClick={() => {
                        const bName = company.bankName || 'CIH';
                        const bRib = company.rib || '230 000 0000000000000000 00';
                        const bBenef = company.bankBeneficiary || company.name || 'BEYA CREATIVE';

                        let msg = '';
                        if (editForm.intentType === 'consultation') {
                          msg = isAr
                            ? `مرحباً بك أستاذ(ة) *${selectedLead.name}* 👋\n\nنشكرك على تواصلك مع *BEYA CREATIVE* بخصوص *جلسة الاستشارة وتوجيه إطلاق البراند* 🇲🇦.\n\n` +
                              `📋 *نوع الخدمة:* استشارة وتوجيه وتحديد خطة إطلاق البراند\n` +
                              `💡 *المشروع / الفكرة:* ${selectedLead.type}\n` +
                              `💰 *ثمن جلسة الاستشارة:* ${editForm.crmPrice || 250} درهم\n` +
                              (editForm.crmNotes ? `📝 *ملاحظات:* ${editForm.crmNotes}\n` : '') +
                              `\n🏦 *المعلومات البنكية (RIB):*\nالاسم/الشركة: ${bBenef}\nبنك: ${bName}\nRIB: ${bRib}\n\nالمرجو تأكيد الموعد بإرسال صورة التحويل (Reçu) للبدء في جلسة العمل والتنسيق المباشر إن شاء الله ✨.\n\nتحياتنا!`
                            : `Bonjour M./Mme *${selectedLead.name}* 👋\n\nMerci d'avoir contacté *BEYA CREATIVE* pour votre *Consultation & Lancement de Marque* 🇲🇦.\n\n` +
                              `📋 *Service :* Consultation & Orientation Technique de Lancement\n` +
                              `💡 *Projet :* ${selectedLead.type}\n` +
                              `💰 *Tarif Consultation :* ${editForm.crmPrice || 250} MAD\n` +
                              (editForm.crmNotes ? `📝 *Notes :* ${editForm.crmNotes}\n` : '') +
                              `\n🏦 *Coordonnées Bancaires (RIB):*\nNom/Entreprise : ${bBenef}\nBanque : ${bName}\nRIB : ${bRib}\n\nMerci de confirmer par l'envoi du reçu de virement pour bloquer votre créneau de consultation ✨.\n\nCordialement!`;
                        } else {
                          msg = isAr 
                              ? `مرحباً بك أستاذ(ة) *${selectedLead.name}* 👋\n\nنشكرك على تواصلك مع *BEYA CREATIVE* 🇲🇦.\nهذا تلخيص للطلبية ديالك باش نأكدوها:\n\n`
                              : `Bonjour M./Mme *${selectedLead.name}* 👋\n\nMerci d'avoir contacté *BEYA CREATIVE* 🇲🇦.\nVoici le récapitulatif de votre commande pour confirmation :\n\n`;

                          msg += isAr ? `📦 *المنتوج:* ${selectedLead.type}\n` : `📦 *Produit :* ${selectedLead.type}\n`;
                          msg += isAr ? `🔢 *الكمية:* ${selectedLead.quantity} قطعة\n` : `🔢 *Quantité :* ${selectedLead.quantity} pièces\n`;
                          
                          if (editForm.crmPrice) {
                              const unitPrice = editForm.crmPrice;
                              const qty = selectedLead.quantity || 1;
                              const totalPrice = unitPrice * qty;
                              const avance = (totalPrice * 0.5).toFixed(2);
                              
                              msg += isAr ? `🏷️ *ثمن القطعة:* ${unitPrice} درهم\n` : `🏷️ *Prix unitaire :* ${unitPrice} MAD\n`;
                              msg += isAr ? `💰 *السعر الإجمالي:* ${totalPrice} درهم\n` : `💰 *Prix total :* ${totalPrice} MAD\n`;
                              msg += isAr ? `💳 *التسبيق المطلوب (50%):* ${avance} درهم\n` : `💳 *Avance requise (50%) :* ${avance} MAD\n`;
                          }

                          msg += isAr 
                              ? `\n🏦 *المعلومات البنكية (RIB):*\nالاسم/الشركة: ${bBenef}\nبنك: ${bName}\nRIB: ${bRib}\n\nالمرجو تأكيد الطلب بإرسال صورة التحويل (Reçu) باش نبداو الخدمة إن شاء الله ✨.\n\nتحياتنا!`
                              : `\n🏦 *Coordonnées Bancaires (RIB):*\nNom/Entreprise : ${bBenef}\nBanque : ${bName}\nRIB : ${bRib}\n\nMerci de confirmer la commande en nous envoyant le reçu du virement pour lancer la production ✨.\n\nCordialement!`;
                        }

                        let phone = selectedLead?.phone || '';
                        if (phone) {
                            phone = phone.replace(/\D/g, '');
                            if (phone.startsWith('0')) phone = '212' + phone.substring(1);
                        }
                        const encoded = encodeURIComponent(msg);
                        window.open(phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`, '_blank');
                        
                        // Automatically update stage to attente_confirmation when sending message
                        setEditForm(prev => ({ ...prev, crmStage: 'attente_confirmation' }));
                    }}
                    className="w-full py-4 bg-[#25D366] text-white font-black rounded-2xl hover:bg-[#128C7E] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 mt-4"
                >
                    <MessageCircle className="w-5 h-5" />
                    {isAr ? 'إرسال رسالة التأكيد عبر واتساب' : 'Envoyer Confirmation via WhatsApp'}
                </button>
              </div>

              {savedOk && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-center text-sm font-bold animate-in zoom-in">
                  {isAr ? 'تم حفظ التغييرات بنجاح!' : 'Modifications enregistrées !'}
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => handleSave('attente_confirmation')}
                className="flex-1 py-3.5 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-colors text-xs uppercase tracking-widest"
              >
                {isAr ? 'في الانتظار' : 'En Attente'}
              </button>
              <button 
                onClick={() => handleSave('confirme')}
                className="flex-[1.5] py-3.5 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isAr ? 'تأكيد الطلبية ✓' : 'Confirmer ✓'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Bottom Navigation Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex items-stretch shadow-xl max-w-lg mx-auto md:max-w-xl" dir="ltr">
        {([
          { key: 'leads', icon: Target, labelFr: 'Prospects', labelAr: 'الطلبات', badge: stats.totalActive },
          { key: 'commissions', icon: Coins, labelFr: 'Commissions', labelAr: 'عمولاتي', badge: commissionStats.confirmedCount },
          { key: 'profil', icon: UserCircle2, labelFr: 'Mon Profil', labelAr: 'ملفي' },
        ] as const).map(({ key, icon: Icon, labelFr, labelAr, badge }: any) => (
          <button
            key={key}
            onClick={() => setBottomTab(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all relative ${
              bottomTab === key ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all relative ${
              bottomTab === key ? 'bg-indigo-50' : ''
            }`}>
              <Icon className={`w-5 h-5 ${bottomTab === key ? 'text-indigo-600' : 'text-slate-400'}`} />
              {badge && badge > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {badge > 99 ? '99+' : badge}
                </span>
              ) : null}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{isAr ? labelAr : labelFr}</span>
            {bottomTab === key && <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── Devis Tab ── */}
      {bottomTab === 'devis' && (
        <div className="fixed inset-0 z-40 bg-slate-50 pt-0 pb-20 overflow-y-auto h-full w-full">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <DevisBuilder embedded={true} onBack={() => setBottomTab('leads')} />
          </Suspense>
        </div>
      )}

      {/* ── Profil Tab ── */}
      {bottomTab === 'profil' && (
        <div className="fixed inset-0 z-40 bg-slate-100 pt-4 pb-24 overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="px-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">{isAr ? 'ملفي الشخصي' : 'Mon Profil'}</h2>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <label className="relative cursor-pointer group shrink-0">
                  {currentUser?.photo ? (
                    <img src={currentUser.photo} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 group-hover:opacity-50 transition" alt="" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:opacity-50 transition">
                      {(currentUser?.nom || 'C')[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="w-6 h-6 text-slate-800 drop-shadow-md" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={async e => {
                    if (e.target.files?.[0] && currentUser?.id) {
                      try {
                        const b64 = await compressImage(e.target.files[0]);
                        const updatedUser = { ...currentUser, photo: b64 };
                        await saveRecord('utilisateurs', updatedUser);
                        localStorage.setItem('textrack_currentUser', JSON.stringify(updatedUser));
                        window.location.reload();
                      } catch (err) {
                        console.error("Failed to update photo", err);
                      }
                    }
                  }} />
                </label>
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight text-lg">{currentUser?.nom || '—'}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{isAr ? 'تجاري' : 'Commercial'}</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">{currentUser?.email || '—'}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[{label: isAr?'البريد':'Email', val: currentUser?.email},{label:isAr?'الدور':'Rôle', val:'Commercial'},{label:isAr?'الطلبات':'Prospects', val:`${leads.length}`}].map(r=>(
                  <div key={r.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.label}</span>
                    <span className="text-sm font-bold text-slate-800">{r.val}</span>
                  </div>
                ))}
              </div>
              <button onClick={onLogout} className="w-full mt-6 py-3.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
                <LogOut className="w-4 h-4" />{isAr ? 'تسجيل الخروج' : 'Se Déconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Lead Info Modal */}
      {selectedLeadInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in" onClick={() => setSelectedLeadInfo(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-500" />
                {isAr ? 'معلومات الزبون' : 'Informations du Prospect'}
              </h2>
              <button onClick={() => setSelectedLeadInfo(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl">
                  {selectedLeadInfo.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg uppercase">{selectedLeadInfo.name}</h3>
                  <p className="text-xs font-bold text-slate-500" dir="ltr">{selectedLeadInfo.phone}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                {selectedLeadInfo.details?.split('|').filter(part => part.trim() && !part.includes('COM_UNLOCK:')).map((detail, idx) => {
                  const parts = detail.split(':');
                  if (parts.length < 2) return null;
                  const label = parts[0].trim();
                  const value = parts.slice(1).join(':').trim();
                  if (!value || value === 'undefined' || value === 'N/A') return null;
                  return (
                    <div key={idx} className="flex flex-col gap-1 border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{label}</span>
                      <span className="text-sm font-bold text-slate-700">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[70]">
            <X className="w-6 h-6" />
          </button>
          <img src={previewImage} onClick={(e) => e.stopPropagation()} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" alt="Preview" />
        </div>
      )}

      {/* ─── Devis Atelier Modal ─── */}
      {devisLead && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[90vh]">
            {/* Header compact */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    {isAr ? 'قرار وتسعير الورشة (DEVIS ATELIER)' : 'Décision Finale & Devis Atelier'}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-bold max-w-[280px] truncate">{devisLead.name} — {devisLead.type}</p>
                </div>
              </div>
              <button
                onClick={() => setDevisLead(null)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all border border-white/20 shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
              {/* Type / Nom Modèle Réel */}
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {isAr ? 'اسم / نوع الموديل' : 'Modèle / Article'}
                </label>
                <input
                  type="text"
                  value={devisModeleReel}
                  onChange={e => setDevisModeleReel(e.target.value)}
                  placeholder={devisLead.type}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Mode switch: Échantillon vs Commande */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDevisMode('commande')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${devisMode === 'commande' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {isAr ? `طلبية إنتاج (${devisLead.quantity} قطعة)` : `Production (${devisLead.quantity} pcs)`}
                </button>
                <button
                  type="button"
                  onClick={() => setDevisMode('echantillon')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${devisMode === 'echantillon' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {isAr ? 'عينة تجريبية (1 قطعة)' : 'Échantillon (1 pc)'}
                </button>
              </div>

              {/* Tissu suggéré */}
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {isAr ? 'نوع القماش المقترح' : 'Tissu suggéré'}
                </label>
                <input
                  type="text"
                  value={fabricType}
                  onChange={e => setFabricType(e.target.value)}
                  placeholder={isAr ? 'مثال: Molleton 320g / Coton Peigné...' : 'Ex: Molleton 320g, Coton 100%...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Prix Matière & Prix Façon (MO) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    {isAr ? 'سعر القماش للمتر/قطعة (MAD)' : 'Matière / pc (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={matierePrice}
                    onChange={e => setMatierePrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-black text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    {isAr ? 'سعر الخياطة والفصالة (MAD)' : 'Façon MO / pc (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={laborPrice}
                    onChange={e => setLaborPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-black text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Patronage & Échantillon Prices */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-[8px] font-black text-amber-900 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-amber-600" />
                    <span>{isAr ? 'الباترون (MAD)' : 'Patronage (MAD)'}</span>
                  </label>
                  <input
                    type="number"
                    value={devisPatronagePrice}
                    onChange={e => setDevisPatronagePrice(e.target.value)}
                    placeholder="Ex: 250"
                    className="w-full bg-white border border-amber-200 rounded-lg py-1.5 px-3 text-xs font-black text-amber-900 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-indigo-900 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-600" />
                    <span>{isAr ? 'سعر العينة (MAD)' : 'Échantillon (MAD)'}</span>
                  </label>
                  <input
                    type="number"
                    value={devisPrixEchantillon}
                    onChange={e => setDevisPrixEchantillon(e.target.value)}
                    placeholder="Ex: 350"
                    className="w-full bg-white border border-indigo-200 rounded-lg py-1.5 px-3 text-xs font-black text-indigo-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Délai & Progression */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {isAr ? 'أجل التسليم المتوقع' : 'Délai estimé'}
                  </label>
                  <input
                    type="text"
                    value={devisDelai}
                    onChange={e => setDevisDelai(e.target.value)}
                    placeholder="7 - 10 jours ouvrables"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {isAr ? 'المرحلة الحالية' : 'Étape Actuelle'}
                  </label>
                  <select
                    value={devisProgression}
                    onChange={e => setDevisProgression(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-400"
                  >
                    <option value="reception">{isAr ? 'استلام الطلب' : 'Réception'}</option>
                    <option value="etude">{isAr ? 'دراسة تقنية وتوفير القماش' : 'Étude & Tissu'}</option>
                    <option value="echantillon">{isAr ? 'تنفيذ العينة (Prototype)' : 'Échantillon en cours'}</option>
                    <option value="production">{isAr ? 'قيد الإنتاج الفعلي' : 'En Production'}</option>
                  </select>
                </div>
              </div>

              {/* Fournisseur rapide */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    {isAr ? 'مورد معتمد من شبكة BEYA' : 'Fournisseur Tissu Partenaire'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPLIERS_DATA.slice(0, 5).map(p => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => {
                        setDevisSupplierNom(p.name);
                        setDevisSupplierTel(p.phone);
                        setDevisSupplierCity(p.city);
                        setDevisSupplierCode(p.code);
                        setDevisSupplierColors(p.colors);
                        setDevisSupplierNotes(isAr ? 'متوفر بسعر تفضيلي لدى شبكة شركاء BEYA.' : 'Disponible au tarif partenaire BEYA Creative.');
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[9px] font-bold transition shadow-2xs cursor-pointer"
                    >
                      + {p.name.split(' - ')[0]}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <input
                      type="text"
                      value={devisSupplierNom}
                      onChange={e => setDevisSupplierNom(e.target.value)}
                      placeholder={isAr ? 'اسم المورد' : 'Nom Fournisseur'}
                      className="w-full bg-white border border-emerald-200 rounded-lg py-1 px-2 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={devisSupplierTel}
                      onChange={e => setDevisSupplierTel(e.target.value)}
                      placeholder="06..."
                      dir="ltr"
                      className="w-full bg-white border border-emerald-200 rounded-lg py-1 px-2 text-xs font-bold outline-none text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-slate-900 rounded-2xl px-4 py-3 text-white flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                    {isAr ? 'المجموع التقديري' : 'Total estimé'}
                  </p>
                  <p className="text-xs text-indigo-300 font-bold">
                    {devisMode === 'echantillon' ? '1 pc' : `${devisLead.quantity} pcs`} × {(Number(matierePrice || 0) + Number(laborPrice || 0))} MAD
                  </p>
                </div>
                <p className="text-xl font-black">
                  {((Number(matierePrice || 0) + Number(laborPrice || 0)) * (devisMode === 'echantillon' ? 1 : devisLead.quantity)).toLocaleString()} <span className="text-xs">MAD</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={sendDevisWhatsApp}
                  disabled={!matierePrice && !laborPrice}
                  className="h-10 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm shadow-[#25D366]/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendToPortail}
                  disabled={!matierePrice && !laborPrice}
                  className="h-10 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer border border-indigo-400/30"
                >
                  <Globe className="w-4 h-4 text-indigo-200" />
                  <span>{isAr ? 'نشر في البوابة' : 'Publier au Portail'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Patronage Modal ─── */}
      {patronageModalLead && (() => {
        const ext = parseLeadDetailsJson(patronageModalLead.details);
        const patPrice = Number(ext.patronagePrice ?? (patronageModalLead as any).patronagePrice) || 0;
        const isPriced = ext.patronageStatus === 'priced' || patPrice > 0;
        const isValidated = Boolean(ext.adminValidatedToWork || ext.clientValidated || patronageModalLead.crmPriceConfirmed);
        const modeleClean = (patronageModalLead.type || 'Modèle').replace(' (CMT - Client Tissu)', '').replace('RECRUTEMENT:', '');

        return (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-[2rem] p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-100 relative my-auto flex flex-col">
              <button
                onClick={() => setPatronageModalLead(null)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full transition-all cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm sm:text-base">
                    {isAr ? 'إدارة وتكليف الباترون' : 'Gestion & Affectation Patronage'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold truncate max-w-[260px]">{patronageModalLead.name} — {modeleClean}</p>
                </div>
              </div>

              {/* Status Info */}
              <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                    {isAr ? 'حالة الباترون الحالية' : 'Statut actuel'}
                  </span>
                  <span className="text-xs font-black text-indigo-700">
                    {isValidated ? (isAr ? '✓ مصادق عليه وقيد الإنجاز' : '✓ Validé & en cours') : isPriced ? (isAr ? `مسعر بـ ${patPrice} MAD` : `Chiffré à ${patPrice} MAD`) : (isAr ? 'غير مسعر بعد' : 'Non chiffré')}
                  </span>
                </div>
                {patPrice > 0 && (
                  <span className="text-base font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    {patPrice} MAD
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setPatronageTab('request')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${patronageTab === 'request' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {isAr ? 'طلب تسعير من موديليست' : 'Demander Chiffrage'}
                </button>
                <button
                  type="button"
                  onClick={() => setPatronageTab('validate')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${patronageTab === 'validate' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {isAr ? 'مصادقة وإطلاق العمل' : 'Valider & Lancer'}
                </button>
              </div>

              {/* Modeliste selector */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    {isAr ? 'اختيار الموديليست' : 'Modéliste'}
                  </label>
                  <select
                    value={patronageModelisteId}
                    onChange={e => setPatronageModelisteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {modelistes.length === 0 ? (
                      <option value="">{isAr ? 'لا يوجد موديليست مسجل' : 'Aucun modéliste configuré'}</option>
                    ) : (
                      modelistes.map(m => (
                        <option key={m.id} value={m.id}>{m.nom} {m.telephone ? `(${m.telephone})` : ''}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    {isAr ? 'أجل التسليم (Deadline)' : 'Délai d\'exécution (Date limite)'}
                  </label>
                  <input
                    type="date"
                    value={patronageDeadline}
                    onChange={e => setPatronageDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {patronageTab === 'validate' && (
                  <div>
                    <label className="block text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">
                      {isAr ? 'سعر الباترون المتفق عليه (MAD)' : 'Tarif de Patronage Convenu (MAD)'}
                    </label>
                    <input
                      type="number"
                      value={patronageDirectPrice}
                      onChange={e => setPatronageDirectPrice(e.target.value)}
                      placeholder="Ex: 250"
                      className="w-full bg-emerald-50/50 border-2 border-emerald-200 rounded-xl py-2 px-3 text-sm font-black text-emerald-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Action Button */}
              {patronageTab === 'request' ? (
                <button
                  type="button"
                  onClick={handleRequestPriceFromModeliste}
                  disabled={patronageSubmitting || !patronageModelisteId}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{patronageSubmitting ? (isAr ? 'جاري الإرسال...' : 'Envoi...') : (isAr ? 'إرسال طلب التسعير للموديليست' : 'Envoyer la demande au modéliste')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleValidatePatronageAndLaunch}
                  disabled={patronageSubmitting || (!patPrice && !patronageDirectPrice)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{patronageSubmitting ? (isAr ? 'جاري الحفظ...' : 'Enregistrement...') : (isAr ? 'مصادقة الباترون وإطلاق العمل' : 'Valider & Lancer le patronage')}</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─── AI Analysis Modal ─── */}
      {aiAnalysisLead && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm md:p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:rounded-[32px] md:max-w-6xl overflow-hidden shadow-2xl relative ring-0 md:ring-4 ring-white/20 flex flex-col">
            <div className="flex-1 h-full overflow-hidden">
              <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
                <AISpace initialLead={aiAnalysisLead} onClose={() => setAiAnalysisLead(null)} />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
