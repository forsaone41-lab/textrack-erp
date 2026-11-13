import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Scissors,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Send,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Ruler,
  Calendar,
  UserCheck,
  Check,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import {
  User,
  Lead,
  FicheTechnique,
  loadData,
  saveRecord,
  parseLeadDetailsJson,
  genId
} from '../types';
import FicheTechniqueModelisteModal from '../components/FicheTechniqueModelisteModal';

interface ModelisteTravauxProps {
  currentUser: User;
}

export interface PatronFileAttachment {
  id: string;
  name: string;
  size?: string;
  category: 'pdf_placement' | 'pdf_traceur' | 'fichier_cao' | 'gradation' | 'autre';
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PatronMessage {
  id: string;
  sender: 'modeliste' | 'admin';
  senderName: string;
  text: string;
  date: string;
}

export interface TravauxItem {
  id: string;
  leadId: string;
  modele: string;
  client: string;
  phone?: string;
  photo?: string;
  rawDate: string;
  quantity?: number;
  tailles?: Record<string, any>;
  clientNotes?: string;

  // Pricing & Negotiation
  patronagePrice: number;
  adminCounterPrice?: number;
  negotiationStatus: 'en_attente_prix' | 'en_negociation' | 'accorde' | 'refuse';
  negotiationNotes?: string;

  // Work & Deadlines
  workStatus: 'non_commence' | 'en_cours' | 'fichiers_livres' | 'echantillon_valide' | 'termine';
  deadlineDate?: string;
  workStartedAt?: string | null;
  workCompletedAt?: string | null;
  sampleValidatedAt?: string | null;
  gradationCompletedAt?: string | null;

  // Attached Pattern Files
  patronFiles: PatronFileAttachment[];
  messages: PatronMessage[];

  // Admin notes / QA
  adminQANotes?: string;
  adminApproved?: boolean;

  lead: Lead;
}

export default function ModelisteTravaux({ currentUser }: ModelisteTravauxProps) {
  const { isAr } = useLang();
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TravauxItem[]>([]);
  const [activeTab, setActiveTab] = useState<'negociation' | 'en_cours' | 'gradation' | 'termines'>('negociation');
  const [search, setSearch] = useState('');
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Modal: Technical Card Preview
  const [selectedTechModalItem, setSelectedTechModalItem] = useState<TravauxItem | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Modal: Price negotiation
  const [negocModalItem, setNegocModalItem] = useState<TravauxItem | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [negocNoteInput, setNegocNoteInput] = useState('');

  // Upload States
  const [uploadCategory, setUploadCategory] = useState<'pdf_placement' | 'pdf_traceur' | 'fichier_cao' | 'gradation'>('pdf_placement');
  const [uploadingTargetItem, setUploadingTargetItem] = useState<TravauxItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin QA Note Modal
  const [qaModalItem, setQaModalItem] = useState<TravauxItem | null>(null);
  const [qaNoteInput, setQaNoteInput] = useState('');

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const leadsData: Lead[] = await loadData('leads');

      const parsed: TravauxItem[] = (leadsData || [])
        .filter(lead => {
          // Keep active production leads
          if (lead.statut === 'annulée' || lead.statut === 'archive') return false;
          return true;
        })
        .map(lead => {
          const ext = parseLeadDetailsJson(lead.details);
          const rawPrice = Number(ext.patronagePrice ?? (lead as any).patronagePrice) || 0;
          const counterPrice = ext.adminCounterPrice ? Number(ext.adminCounterPrice) : undefined;
          
          let negStatus: TravauxItem['negotiationStatus'] = 'en_attente_prix';
          if (ext.patronageNegotiationStatus) {
            negStatus = ext.patronageNegotiationStatus;
          } else if (rawPrice > 0) {
            negStatus = counterPrice && counterPrice !== rawPrice ? 'en_negociation' : 'accorde';
          }

          let wStatus: TravauxItem['workStatus'] = ext.workStatus || 'non_commence';
          if (ext.gradationCompleted) {
            wStatus = 'termine';
          } else if (ext.sampleValidated) {
            wStatus = 'echantillon_valide';
          } else if (Array.isArray(ext.patronFiles) && ext.patronFiles.length >= 2) {
            if (wStatus === 'non_commence' || wStatus === 'en_cours') wStatus = 'fichiers_livres';
          }

          const files: PatronFileAttachment[] = Array.isArray(ext.patronFiles) ? ext.patronFiles : [];
          const msgs: PatronMessage[] = Array.isArray(ext.patronMessages) ? ext.patronMessages : [];

          return {
            id: lead.id,
            leadId: lead.id,
            modele: lead.type || (lead as any).modeleReel || (isAr ? 'موديل بدون اسم' : 'Modèle Standard'),
            client: lead.name || (isAr ? 'زبون غير مسجل' : 'Client Inconnu'),
            phone: lead.phone,
            photo: lead.photo || (lead.photos && lead.photos[0]) || undefined,
            rawDate: lead.date || new Date().toISOString(),
            quantity: Number(lead.quantity) || 1,
            tailles: ext.tailles || (lead as any).tailles,
            clientNotes: ext.notes || ext.details || lead.details,
            patronagePrice: rawPrice,
            adminCounterPrice: counterPrice,
            negotiationStatus: negStatus,
            negotiationNotes: ext.patronageNegotiationNotes,
            workStatus: wStatus,
            deadlineDate: ext.deadlineDate || toDefaultDeadline(lead.date),
            workStartedAt: ext.workStartedAt || null,
            workCompletedAt: ext.workCompletedAt || null,
            sampleValidatedAt: ext.sampleValidatedAt || null,
            gradationCompletedAt: ext.gradationCompletedAt || null,
            patronFiles: files,
            messages: msgs,
            adminQANotes: ext.adminQANotes,
            adminApproved: ext.adminApproved,
            lead
          };
        });

      // Filter: if modeliste, show all open to modeliste or assigned
      setItems(parsed);
    } catch (err) {
      console.error('Erreur chargement travaux modéliste:', err);
      showToast(isAr ? 'خطأ في تحميل المعطيات' : 'Erreur de chargement', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function toDefaultDeadline(createdDate?: string): string {
    const base = createdDate ? new Date(createdDate) : new Date();
    base.setDate(base.getDate() + 3); // 3 days default
    return base.toISOString().slice(0, 10);
  }

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      negociation: items.filter(i => i.negotiationStatus !== 'accorde' && i.workStatus === 'non_commence').length,
      en_cours: items.filter(i => i.negotiationStatus === 'accorde' && (i.workStatus === 'non_commence' || i.workStatus === 'en_cours' || i.workStatus === 'fichiers_livres')).length,
      gradation: items.filter(i => i.workStatus === 'fichiers_livres' || i.workStatus === 'echantillon_valide').length,
      termines: items.filter(i => i.workStatus === 'termine').length
    };
  }, [items]);

  // Filtered Items for active Tab
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search match
      if (search) {
        const q = search.toLowerCase();
        const m = (item.modele || '').toLowerCase().includes(q);
        const c = (item.client || '').toLowerCase().includes(q);
        if (!m && !c) return false;
      }

      if (activeTab === 'negociation') {
        return item.negotiationStatus !== 'accorde' && item.workStatus === 'non_commence';
      }
      if (activeTab === 'en_cours') {
        return item.negotiationStatus === 'accorde' && (item.workStatus === 'non_commence' || item.workStatus === 'en_cours' || item.workStatus === 'fichiers_livres');
      }
      if (activeTab === 'gradation') {
        return item.workStatus === 'fichiers_livres' || item.workStatus === 'echantillon_valide';
      }
      if (activeTab === 'termines') {
        return item.workStatus === 'termine';
      }
      return true;
    });
  }, [items, activeTab, search]);

  // Actions: Propose Price (Modeliste)
  const handleProposePrice = async () => {
    if (!negocModalItem) return;
    const p = parseFloat(priceInput);
    if (isNaN(p) || p <= 0) {
      showToast(isAr ? 'المرجو إدخال ثمن صحيح' : 'Veuillez saisir un prix valide', true);
      return;
    }

    setActionPendingId(negocModalItem.id);
    try {
      const ext = parseLeadDetailsJson(negocModalItem.lead.details);
      const newDetails = {
        ...ext,
        patronagePrice: p,
        patronageNegotiationStatus: 'en_attente_prix',
        patronageNegotiationNotes: negocNoteInput.trim() || ext.patronageNegotiationNotes,
        modelisteId: currentUser.id,
        modelisteName: currentUser.nom
      };

      await saveRecord('leads', { ...negocModalItem.lead, details: JSON.stringify(newDetails) }, true);
      showToast(isAr ? 'تم إرسال اقتراح السعر للإدارة' : 'Proposition de prix transmise');
      setNegocModalItem(null);
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'تعذر الحفظ' : 'Erreur de sauvegarde', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Actions: Admin Counter-Offer
  const handleAdminCounterOffer = async (item: TravauxItem, counterP: number, note: string) => {
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const newDetails = {
        ...ext,
        adminCounterPrice: counterP,
        patronageNegotiationStatus: 'en_negociation',
        patronageNegotiationNotes: note.trim()
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(isAr ? 'تم إرسال العرض المقابل للموديليست' : 'Contre-proposition transmise');
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'تعذر الإرسال' : 'Erreur', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Actions: Agree on Price & Validate
  const handleAcceptAgreedPrice = async (item: TravauxItem) => {
    const finalPrice = item.adminCounterPrice || item.patronagePrice;
    if (finalPrice <= 0) {
      showToast(isAr ? 'يجب تحديد السعر أولاً' : 'Définir un prix valide', true);
      return;
    }

    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const newDetails = {
        ...ext,
        patronagePrice: finalPrice,
        adminCounterPrice: undefined,
        patronageNegotiationStatus: 'accorde',
        workStatus: 'en_cours',
        workStartedAt: new Date().toISOString()
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(isAr ? 'تم قبول السعر وبدء مرحلة إنجاز الباترون' : 'Prix validé ! Travail démarré');
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'تعذر التأكيد' : 'Erreur', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Trigger File Upload Dialog
  const triggerFileUpload = (item: TravauxItem, cat: 'pdf_placement' | 'pdf_traceur' | 'fichier_cao' | 'gradation') => {
    setUploadingTargetItem(item);
    setUploadCategory(cat);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle actual file upload
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTargetItem) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast(isAr ? 'حجم الملف كبير جداً (الأقصى 25 ميغا)' : 'Fichier trop lourd (Max 25 Mo)', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const newAttachment: PatronFileAttachment = {
        id: genId(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        category: uploadCategory,
        type: file.type || file.name.split('.').pop() || 'file',
        url: dataUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.nom || (isAdmin ? 'Admin' : 'Modéliste')
      };

      try {
        const ext = parseLeadDetailsJson(uploadingTargetItem.lead.details);
        const currentFiles: PatronFileAttachment[] = Array.isArray(ext.patronFiles) ? ext.patronFiles : [];
        
        // Replace previous file in same category or append
        const filtered = currentFiles.filter(f => f.category !== uploadCategory);
        const updatedFiles = [...filtered, newAttachment];

        // If at least 2 files uploaded (Placement + Traceur or CAO), mark files delivered
        const hasPlacement = updatedFiles.some(f => f.category === 'pdf_placement');
        const hasTraceur = updatedFiles.some(f => f.category === 'pdf_traceur');
        const hasCao = updatedFiles.some(f => f.category === 'fichier_cao');

        let nextWorkStatus = ext.workStatus || 'en_cours';
        if ((hasPlacement && hasTraceur) || (hasPlacement && hasCao) || (hasTraceur && hasCao)) {
          nextWorkStatus = 'fichiers_livres';
        }

        const newDetails = {
          ...ext,
          patronFiles: updatedFiles,
          workStatus: nextWorkStatus
        };

        await saveRecord('leads', { ...uploadingTargetItem.lead, details: JSON.stringify(newDetails) }, true);
        showToast(isAr ? `✓ تم رفع ${file.name} بنجاح` : `✓ ${file.name} téléversé avec succès`);
        await fetchData();
      } catch (err) {
        console.error('Erreur upload:', err);
        showToast(isAr ? 'تعذر رفع الملف' : 'Erreur de téléversement', true);
      } finally {
        setUploadingTargetItem(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete File
  const handleDeleteFile = async (item: TravauxItem, fileId: string) => {
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
      showToast(isAr ? 'تعذر الحذف' : 'Erreur', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Admin approves sample and triggers Gradation
  const handleAdminValidateSampleAndLaunchGradation = async (item: TravauxItem) => {
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const newDetails = {
        ...ext,
        sampleValidated: true,
        sampleValidatedAt: new Date().toISOString(),
        sampleValidatedBy: currentUser.nom || 'Admin BEYA',
        workStatus: 'echantillon_valide',
        gradationRequested: true
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(isAr ? '✓ تم اعتماد العينة بنجاح وإعطاء الإشارة للموديليست للتدريج!' : '✓ Échantillon validé ! Gradation lancée');
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'خطأ في المصادقة' : 'Erreur', true);
    } finally {
      setActionPendingId(null);
    }
  };

  // Modéliste completes final Gradation
  const handleCompleteGradation = async (item: TravauxItem) => {
    setActionPendingId(item.id);
    try {
      const ext = parseLeadDetailsJson(item.lead.details);
      const newDetails = {
        ...ext,
        gradationCompleted: true,
        gradationCompletedAt: new Date().toISOString(),
        workStatus: 'termine',
        workCompletedAt: new Date().toISOString()
      };
      await saveRecord('leads', { ...item.lead, details: JSON.stringify(newDetails) }, true);
      showToast(isAr ? '🎉 تم إتمام الباترون والتدريج بالكامل بنجاح!' : '🎉 Patronage et gradation clôturés avec succès !');
      await fetchData();
    } catch (e) {
      showToast(isAr ? 'خطأ' : 'Erreur', true);
    } finally {
      setActionPendingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        accept=".pdf,.dxf,.plt,.hpgl,.rul,.zip,.rar"
      />

      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/30">
              <Scissors className="w-3.5 h-3.5" />
              <span>{isAr ? 'فضاء إنجاز الباترون والتسليم' : 'Atelier Technique & Livraisons'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isAr ? 'ورشة الباتروناج والمهام' : 'Atelier & Travaux Patronage'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              {isAr
                ? 'فضاء مخصص للتسعير والتفاوض، إنجاز مقاس العينة الأساسي (Taille de Base)، رفع الملفات الثلاثة، والتدريج الصناعي بعد مصادقة العميل.'
                : 'Gestion complète du patronage : Tarification & négociation, confection du prototype de base, dépôt des 3 fichiers et gradation après validation client.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition border border-white/10 cursor-pointer"
              title={isAr ? 'تحديث' : 'Rafraîchir'}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-center">
              <p className="text-[10px] font-bold text-slate-300 uppercase">{isAr ? 'الموديليست' : 'Modéliste'}</p>
              <p className="text-sm font-black text-white">{currentUser.nom || 'Expert'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('negociation')}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-sm ${
            activeTab === 'negociation'
              ? 'bg-amber-500 text-white shadow-amber-500/25 ring-2 ring-amber-400'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{isAr ? '1. التسعير والتفاوض' : '1. Tarification & Négociation'}</span>
          {counts.negociation > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 text-white">
              {counts.negociation}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('en_cours')}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-sm ${
            activeTab === 'en_cours'
              ? 'bg-indigo-600 text-white shadow-indigo-600/25 ring-2 ring-indigo-400'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isAr ? '2. قيد الإنجاز وتسليم الملفات' : '2. En Cours & Livraison'}</span>
          {counts.en_cours > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 text-white">
              {counts.en_cours}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gradation')}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-sm ${
            activeTab === 'gradation'
              ? 'bg-purple-600 text-white shadow-purple-600/25 ring-2 ring-purple-400'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>{isAr ? '3. مراجعة العينة والتدريج' : '3. Échantillon & Gradation'}</span>
          {counts.gradation > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 text-white">
              {counts.gradation}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('termines')}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-sm ${
            activeTab === 'termines'
              ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-400'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isAr ? '4. الباترونات المكتملة' : '4. Modèles Terminés'}</span>
          {counts.termines > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 text-white">
              {counts.termines}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Scissors className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-black text-base">
              {isAr ? 'لا توجد موديلات في هذه المرحلة حالياً' : 'Aucun modèle dans cette étape'}
            </p>
            <p className="text-slate-400 text-xs font-medium mt-1">
              {isAr ? 'ستظهر هنا الموديلات المخصصة للباترون والتسليم فور وصولها.' : 'Les modèles s’afficheront dès leur affectation.'}
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const hasPlacement = item.patronFiles.some(f => f.category === 'pdf_placement');
            const hasTraceur = item.patronFiles.some(f => f.category === 'pdf_traceur');
            const hasCao = item.patronFiles.some(f => f.category === 'fichier_cao');
            const hasGradation = item.patronFiles.some(f => f.category === 'gradation');

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.modele}
                        onClick={() => setZoomImage(item.photo || null)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 cursor-pointer shadow-sm hover:scale-105 transition shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 shrink-0">
                        <Scissors className="w-8 h-8" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{item.id.slice(-6).toUpperCase()}</span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">{item.modele}</h3>
                      </div>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">
                        {isAr ? 'الزبون:' : 'Client:'} <span className="text-indigo-600 font-black">{item.client}</span>
                        {item.quantity && <span> • {item.quantity} {isAr ? 'قطعة' : 'pcs'}</span>}
                      </p>
                      {item.deadlineDate && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 w-fit mt-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{isAr ? 'أجل التسليم:' : 'Délai :'} {item.deadlineDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Price Badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    <button
                      onClick={() => setSelectedTechModalItem(item)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isAr ? 'البطاقة التقنية' : 'Fiche Tech'}</span>
                    </button>

                    {item.patronagePrice > 0 && (
                      <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black">
                        {item.patronagePrice} MAD
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── TAB 1 SPECIFIC: PRICING & NEGOTIATION ─── */}
                {activeTab === 'negociation' && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {isAr ? 'الحالة:' : 'Statut :'}
                          {item.negotiationStatus === 'en_attente_prix' && (
                            <span className="text-amber-600 font-black mr-1 ml-1">{isAr ? 'في انتظار وضع الثمن' : 'En attente de chiffrage'}</span>
                          )}
                          {item.negotiationStatus === 'en_negociation' && (
                            <span className="text-purple-600 font-black mr-1 ml-1">{isAr ? 'تفاوض قائم بين الإدارة والموديليست' : 'Négociation en cours'}</span>
                          )}
                        </p>
                        {item.adminCounterPrice && (
                          <p className="text-xs font-bold text-purple-700 mt-1">
                            {isAr ? '💡 اقتراح الإدارة:' : '💡 Contre-offre Admin :'} <strong>{item.adminCounterPrice} MAD</strong>
                          </p>
                        )}
                        {item.negotiationNotes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">"{item.negotiationNotes}"</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Modeliste enters or edits proposed price */}
                        <button
                          onClick={() => {
                            setNegocModalItem(item);
                            setPriceInput(item.patronagePrice > 0 ? String(item.patronagePrice) : '');
                            setNegocNoteInput(item.negotiationNotes || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-indigo-600/20"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{item.patronagePrice > 0 ? (isAr ? 'تعديل السعر المقترح' : 'Modifier le Prix') : (isAr ? 'وضع السعر المقترح' : 'Proposer un Prix')}</span>
                        </button>

                        {/* If Admin proposed or Modeliste proposed, either can accept */}
                        {(item.patronagePrice > 0 || (item.adminCounterPrice && item.adminCounterPrice > 0)) && (
                          <button
                            onClick={() => handleAcceptAgreedPrice(item)}
                            disabled={actionPendingId === item.id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-600/20"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isAr ? 'الموافقة وبدء العمل بالثمن المتفق عليه' : 'Valider & Lancer au Prix Convenu'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2 SPECIFIC: WORK IN PROGRESS & 3 FILES UPLOAD ─── */}
                {activeTab === 'en_cours' && (
                  <div className="space-y-4">
                    {/* Crucial Instruction Banner */}
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 leading-relaxed font-medium">
                        <strong className="font-black text-amber-950">
                          {isAr ? '⚠️ تنبيه تقني هام (مرحلة العينة الأولى):' : '⚠️ Note Technique Importante (Prototype Initial) :'}
                        </strong>{' '}
                        {isAr
                          ? 'أنت مطالب في هذه المرحلة بصنع مقاس العينة الأساسي فقط (Taille de Base: غالباً M أو L). لا تقم بالتدريج الآن حتى تتم خياطة العينة ومصادقة الزبون عليها.'
                          : 'Vous devez confectionner uniquement la taille de base (Prototype M ou L). Ne réalisez pas la gradation maintenant : elle sera lancée après validation de l’échantillon par le client.'}
                      </div>
                    </div>

                    {/* The 3 Required File Dropzones */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* 1. PDF Placement / Matelas */}
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        hasPlacement ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase text-indigo-700">1. PDF Placement</span>
                            {hasPlacement ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{isAr ? 'مطلوب' : 'Requis'}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-800">
                            {isAr ? 'مخطط وضع الباترون (Matelas)' : 'Plan de Coupe / Matelas'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {isAr ? 'ملف PDF يوضح وضع القطع على الثوب واستهلاك الميتراج.' : 'Fichier PDF montrant le placement et la consommation textile.'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          {hasPlacement ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={item.patronFiles.find(f => f.category === 'pdf_placement')?.url}
                                download={item.patronFiles.find(f => f.category === 'pdf_placement')?.name}
                                className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تحميل' : 'Télécharger'}</span>
                              </a>
                              <button
                                onClick={() => {
                                  const f = item.patronFiles.find(x => x.category === 'pdf_placement');
                                  if (f) handleDeleteFile(item, f.id);
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerFileUpload(item, 'pdf_placement')}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isAr ? 'رفع ملف PDF' : 'Dépôt PDF'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 2. PDF Traceur 1:1 */}
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        hasTraceur ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase text-indigo-700">2. PDF Traceur 1:1</span>
                            {hasTraceur ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{isAr ? 'مطلوب' : 'Requis'}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-800">
                            {isAr ? 'الباترون بمقياس حقيقي 100%' : 'Patron Échelle Réelle 1:1'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {isAr ? 'جاهز للطباعة على آلة الطراسور أو التقطيع المباشر.' : 'Prêt pour impression traceur / table de coupe.'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          {hasTraceur ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={item.patronFiles.find(f => f.category === 'pdf_traceur')?.url}
                                download={item.patronFiles.find(f => f.category === 'pdf_traceur')?.name}
                                className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تحميل' : 'Télécharger'}</span>
                              </a>
                              <button
                                onClick={() => {
                                  const f = item.patronFiles.find(x => x.category === 'pdf_traceur');
                                  if (f) handleDeleteFile(item, f.id);
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerFileUpload(item, 'pdf_traceur')}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isAr ? 'رفع ملف PDF' : 'Dépôt PDF'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 3. Fichier CAO / Source */}
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        hasCao ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase text-indigo-700">3. Fichier CAO / Source</span>
                            {hasCao ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{isAr ? 'موصى به' : 'Recommandé'}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-800">
                            {isAr ? 'صيغة الباترون الهندسية (DXF/PLT/ZIP)' : 'Fichier Source (DXF / PLT / ZIP)'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {isAr ? 'ملف البرنامج (Lectra, Gerber, Clo3D, Optitex أو ZIP).' : 'Fichier vectoriel CAO pour archivage et modifications.'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          {hasCao ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={item.patronFiles.find(f => f.category === 'fichier_cao')?.url}
                                download={item.patronFiles.find(f => f.category === 'fichier_cao')?.name}
                                className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تحميل' : 'Télécharger'}</span>
                              </a>
                              <button
                                onClick={() => {
                                  const f = item.patronFiles.find(x => x.category === 'fichier_cao');
                                  if (f) handleDeleteFile(item, f.id);
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerFileUpload(item, 'fichier_cao')}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isAr ? 'رفع ملف CAO' : 'Dépôt CAO'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* ─── TAB 3 SPECIFIC: SAMPLE VALIDATION & GRADATION ─── */}
                {activeTab === 'gradation' && (
                  <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-purple-700" />
                          <h4 className="text-sm font-black text-purple-950">
                            {isAr ? 'مرحلة اعتماد العينة والتدريج الصناعي (Gradation)' : 'Validation Prototype & Lancement Gradation'}
                          </h4>
                        </div>
                        <p className="text-xs text-purple-800 font-medium mt-1">
                          {item.workStatus === 'echantillon_valide'
                            ? (isAr ? '✓ العميل صادق على العينة الأولى بنجاح! مطلوب الآن رفع ملف التدريج لكافة المقاسات.' : '✓ Prototype validé par le client ! Déposez le fichier gradé.')
                            : (isAr ? 'تم تسليم ملفات الباترون الأولى، جاري فحصها وخياطة العينة للتأكيد مع الزبون.' : 'Fichiers déposés. Confection de l’échantillon en cours pour accord client.')}
                        </p>
                      </div>

                      {/* Admin Validation Button */}
                      {isAdmin && item.workStatus !== 'echantillon_valide' && item.workStatus !== 'termine' && (
                        <button
                          onClick={() => handleAdminValidateSampleAndLaunchGradation(item)}
                          disabled={actionPendingId === item.id}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAr ? '✓ صادق العميل على العينة — إطلاق التدريج' : '✓ Échantillon Validé — Lancer Gradation'}</span>
                        </button>
                      )}
                    </div>

                    {/* Gradation Dropzone */}
                    {item.workStatus === 'echantillon_valide' && (
                      <div className="p-4 bg-white rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {isAr ? 'رفع باترون التدريج الكامل (Gradation Complète XS-XXL)' : 'Fichier Patron Gradé Final'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {isAr ? 'ارفع ملف PDF أو DXF يحتوي على كافة المقاسات المطلوبة للإنتاج الشامل.' : 'Déposez le fichier complet contenant toutes les tailles pour la coupe.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasGradation ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                {isAr ? 'تم رفع التدريج' : 'Fichier gradé déposé'}
                              </span>
                              <button
                                onClick={() => handleCompleteGradation(item)}
                                disabled={actionPendingId === item.id}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer"
                              >
                                {isAr ? 'إغلاق وتسليم نهائي' : 'Clôturer le Modèle'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => triggerFileUpload(item, 'gradation')}
                              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{isAr ? 'رفع ملف التدريج (Gradation)' : 'Déposer la Gradation'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB 4 SPECIFIC: COMPLETED ARCHIVE ─── */}
                {activeTab === 'termines' && (
                  <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isAr ? 'تم إنجاز هذا الموديل ومصادقة الباترون والتدريج 100%' : 'Modèle entièrement patronné, validé et gradé à 100%'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.patronFiles.map(f => (
                        <a
                          key={f.id}
                          href={f.url}
                          download={f.name}
                          className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-black hover:bg-emerald-50 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>{f.category}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Negotiation / Price Propose */}
      {negocModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? 'تسعير الباترون والتفاوض' : 'Tarification du Patronage'}
              </h3>
              <button onClick={() => setNegocModalItem(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {isAr ? 'السعر المقترح (MAD)' : 'Prix Proposé (MAD)'}
                </label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value)}
                  placeholder="Ex: 180"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-black text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {isAr ? 'ملاحظات وتفاصيل التسعير' : 'Notes & Commentaires'}
                </label>
                <textarea
                  value={negocNoteInput}
                  onChange={e => setNegocNoteInput(e.target.value)}
                  rows={3}
                  placeholder={isAr ? 'ملاحظات حول تعقيد الموديل، الجيوب، الكابوش...' : 'Détails sur la complexité, finitions...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setNegocModalItem(null)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleProposePrice}
                disabled={actionPendingId === negocModalItem.id}
                className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {isAr ? 'تأكيد وإرسال' : 'Valider & Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tech Card preview */}
      {selectedTechModalItem && (
        <FicheTechniqueModelisteModal
          item={{
            id: selectedTechModalItem.id,
            modele: selectedTechModalItem.modele,
            client: selectedTechModalItem.client,
            photo: selectedTechModalItem.photo,
            quantity: selectedTechModalItem.quantity,
            clientNotes: selectedTechModalItem.clientNotes,
            patronFiles: selectedTechModalItem.patronFiles as any,
            lead: selectedTechModalItem.lead
          } as any}
          onClose={() => setSelectedTechModalItem(null)}
          onSaveNotes={async () => {}}
        />
      )}

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoom"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 ${isAr ? 'left-6' : 'right-6'} z-50 px-5 py-3 rounded-2xl text-xs font-black text-white shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 ${
          toast.isError ? 'bg-rose-600' : 'bg-slate-900'
        }`}>
          {toast.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.text}</span>
        </div>
      )}

    </div>
  );
}
