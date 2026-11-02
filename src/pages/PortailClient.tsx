import React, { useState, useEffect, useRef } from 'react';
import { Search, LogOut, Package, CircleCheck, Clock, Truck, Globe, Bell, Receipt, MessageCircle, ArrowRight, X, Minus, Download, Scissors, Layers, Sparkles, Wind, ShieldCheck, Box, FileText, Eye, Plus, Camera, RotateCw, CreditCard, Building, Upload, Send, Check, Info, Star, Trash2, Edit2, Store, Smartphone, Mail, Lock, CheckCircle, Loader2, Printer, ExternalLink, ChevronRight, Tag, AlertCircle, Users, MessageSquare, Handshake, ThumbsUp, MapPin, Key, Calculator, Phone } from 'lucide-react';
import { supabase } from '../supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Commande, Facture, FicheTechnique, loadData, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, User, CompanyProfile, loadCompanyProfile, saveLead, syncCompanyProfile, saveRecord, Lead, loadLeads, loadClientLeads, loadLeadPhoto, deleteRecord, genId, isJwtExpiredError, recoverExpiredJwt
} from '../types';
import { useLang } from '../contexts/LangContext';
import { trackPixelEvent } from '../utils/pixel';
import { printElement } from '../utils/pdf';
import { subscribeToPush } from '../utils/pushNotifications';
import { compressImage } from '../utils/image';
import { printFicheTechnique as printFT } from '../utils/print';
import { InvoicePRO } from '../components/InvoicePRO';
import ClientInfo from './ClientInfo';
import { PageLoader } from '../components/PageLoader';

interface PortailClientProps {
  currentUser?: User | null;
  onLogout?: () => void;
}

const LogoWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
          <Package className="w-7 h-7 text-white" />
        </div>
        <span className="text-2xl font-black uppercase tracking-tighter italic flex-1">
          {alt.split(' ')[0]}<span className="text-indigo-400">PORTAL</span>
        </span>
      </div>
    );
  }
  return <img src={src} className="h-12 object-contain" alt={alt} onError={() => setError(true)} />;
};


export const DELETE_REASON_OPTIONS = [
  {
    id: 'price_high',
    icon: '💰',
    labelAr: 'السعر جاني غالي شوية / خارج الميزانية',
    labelFr: 'Le prix estimé dépasse mon budget',
    subAr: 'كنقلب على خياطة أو ثوب بتكلفة اقتصادية أكثر مناسبة لي',
    subFr: 'Recherche d\'une alternative plus accessible',
    isNegotiable: true,
  },
  {
    id: 'delay_long',
    icon: '⏳',
    labelAr: 'مدة التسليم طويلة / محتاج السلعة فوقت أسرع ومستعجل',
    labelFr: 'Délai de fabrication / livraison trop long',
    subAr: 'عندي موعد تسليم قريب ومحتاج خدمة مستعجلة',
    subFr: 'Besoin d\'une production express prioritaire',
    isNegotiable: true,
  },
  {
    id: 'change_model',
    icon: '🎨',
    labelAr: 'بغيت نبدل الموديل أو نرفع تصميم جديد مختلف',
    labelFr: 'Changer de modèle ou tester un autre design',
    subAr: 'قررت نخدم على قصة أو تصميم مختلف تماماً عن هذا',
    subFr: 'Nouveau style ou patronage différent',
    isNegotiable: false,
  },
  {
    id: 'fabric_issue',
    icon: '🧵',
    labelAr: 'نوع الثوب المقترح ما ناسبنيش',
    labelFr: 'Le tissu proposé ne correspond pas à mes attentes',
    subAr: 'كنفضل قماش أو غراماج أو خامة أخرى في التنفيذ',
    subFr: 'Souhait d\'une autre matière première',
    isNegotiable: true,
  },
  {
    id: 'quantity_issue',
    icon: '📦',
    labelAr: 'مشكل فالكمية المطلوبة أو توزيع المقاسات',
    labelFr: 'Problème de quantité minimum ou de tailles',
    subAr: 'الكونتيتي ما مسلكانيش حالياً وبغيت نعدلها',
    subFr: 'Volume de commande ou grille à ajuster',
    isNegotiable: true,
  },
  {
    id: 'curiosity_test',
    icon: '🎯',
    labelAr: 'طلب تجريبي لاكتشاف الأسعار والمنصة فقط',
    labelFr: 'Simple test pour découvrir la plateforme et les tarifs',
    subAr: 'طلب غير فعلي، تسجل للتجربة والفضول فقط',
    subFr: 'Créé par curiosité / découverte',
    isNegotiable: false,
  },
  {
    id: 'other',
    icon: '✍️',
    labelAr: 'سبب آخر (اكتب لنا ملاحظتك للتحسين)',
    labelFr: 'Autre motif (aidez-nous à nous améliorer)',
    subAr: 'ملاحظة خاصة أو اقتراح مباشر للورشة',
    subFr: 'Remarque spécifique pour l\'atelier',
    isNegotiable: false,
  },
];

const LeadCardImage = ({
  lead,
  leadPhotos,
  onPhotoLoaded,
  alt = '',
  className = "w-full h-full object-cover",
  onClick,
  isAr = true,
  dark = false,
  iconSize = 12
}: {
  lead: Lead;
  leadPhotos: Record<string, string>;
  onPhotoLoaded?: (id: string, photo: string) => void;
  alt?: string;
  className?: string;
  onClick?: () => void;
  isAr?: boolean;
  dark?: boolean;
  iconSize?: number;
}) => {
  const currentPhoto = lead.photo || (lead.photos && lead.photos[0]) || leadPhotos[lead.id];
  const [photo, setPhoto] = useState<string | null>(currentPhoto || null);
  const [loading, setLoading] = useState(!currentPhoto && (lead.photoCount === undefined || lead.photoCount > 0));

  useEffect(() => {
    if (currentPhoto) {
      setPhoto(currentPhoto);
      setLoading(false);
      return;
    }
    
    if (lead.photoCount === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    loadLeadPhoto(lead.id).then(loadedPhoto => {
      if (!isMounted) return;
      setLoading(false);
      if (loadedPhoto) {
        setPhoto(loadedPhoto);
        onPhotoLoaded?.(lead.id, loadedPhoto);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [lead.id, currentPhoto, lead.photoCount]);

  if (photo) {
    return (
      <img
        src={photo}
        alt={alt}
        className={className}
        onClick={onClick}
        loading="lazy"
      />
    );
  }

  if (loading) {
    return (
      <div 
        onClick={onClick}
        className={`w-full h-full flex flex-col gap-2 items-center justify-center animate-pulse ${dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-300'} ${onClick ? 'cursor-pointer' : ''}`}
      >
        <Camera className={iconSize >= 12 ? 'w-12 h-12 animate-pulse' : iconSize >= 10 ? 'w-10 h-10 animate-pulse' : 'w-8 h-8 animate-pulse'} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? 'جاري التحميل...' : 'Chargement...'}</span>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`w-full h-full flex flex-col gap-2 items-center justify-center ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-300'} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <Camera className={iconSize >= 12 ? 'w-12 h-12' : iconSize >= 10 ? 'w-10 h-10' : 'w-8 h-8'} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? 'بدون صورة' : 'Pas de photo'}</span>
          </div>
  );
};

export default function PortailClient({ currentUser, onLogout }: PortailClientProps) {
  const [commandes, setCommandes] = useState<Commande[]>(() => {
    try {
      const raw = localStorage.getItem('textrack_data_commandes');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [factures, setFactures] = useState<Facture[]>(() => {
    try {
      const raw = localStorage.getItem('textrack_data_factures');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [fiches, setFiches] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('textrack_data_fiches');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [mesDemandes, setMesDemandes] = useState<Lead[]>(() => {
    try {
      const raw = localStorage.getItem('textrack_data_leads');
      const all: Lead[] = raw ? JSON.parse(raw) : [];
      if (currentUser?.role === 'client' || currentUser?.role === 'merchant') {
        return all.filter(l =>
          (l.name || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase() ||
          ((l.email || '').trim().toLowerCase() === (currentUser?.email || '').trim().toLowerCase() && currentUser?.email) ||
          ((l.phone || '').trim() === (currentUser?.telephone || '').trim() && currentUser?.telephone)
        );
      }
      return all;
    } catch { return []; }
  });
  const [leadPhotos, setLeadPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('textrack_lead_photos_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const leadPhotosRef = useRef<Record<string, string>>(leadPhotos);
  leadPhotosRef.current = leadPhotos;

  const handlePhotoLoaded = (id: string, photo: string) => {
    setLeadPhotos(prev => ({ ...prev, [id]: photo }));
    setMesDemandes(prev => prev.map(m => m.id === id ? { ...m, photo } : m));
    try {
      const raw = localStorage.getItem('textrack_lead_photos_cache');
      const cache = raw ? JSON.parse(raw) : {};
      cache[id] = photo;
      localStorage.setItem('textrack_lead_photos_cache', JSON.stringify(cache));
    } catch (_) {}
  };
  const [reference, setReference] = useState('');
  const [found, setFound] = useState<Commande[]>(() => {
    try {
      const raw = localStorage.getItem('textrack_data_commandes');
      const all: Commande[] = raw ? JSON.parse(raw) : [];
      if (currentUser?.role === 'client' || currentUser?.role === 'merchant') {
        return all.filter(c =>
          (c.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase()
        );
      }
      return [];
    } catch { return []; }
  });
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());
  const [feedbackCmdId, setFeedbackCmdId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<{rating: number, fabricNotes: string, sizeNotes: string, generalNotes: string, useSizeTable: boolean, sizeTableNotes: Record<string, string>, mesuresFeedback: { nom: string; valeurs: Record<string, string> }[]}>({ rating: 0, fabricNotes: '', sizeNotes: '', generalNotes: '', useSizeTable: false, sizeTableNotes: {}, mesuresFeedback: [] });
  const [hoverRating, setHoverRating] = useState<number>(0);
  const { isAr, toggle } = useLang();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall('/manifest-portal.json');

  useEffect(() => {
    const sync = async () => {
      const remote = await syncCompanyProfile();
      setCompany(remote);
    };
    sync();
  }, []);

  const [newSignupCode, setNewSignupCode] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('beya_new_signup_code');
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'demandes' | 'docs' | 'payments' | 'support' | 'info' | 'network'>(() => {
    try {
      if (sessionStorage.getItem('beya_new_signup_code')) {
        return 'demandes';
      }
    } catch {}
    return 'overview';
  });
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastClientMessageCountRef = React.useRef(0);
  const [viewMesuresFiche, setViewMesuresFiche] = useState<FicheTechnique | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [editingDemandeId, setEditingDemandeId] = useState<string | null>(null);
  const [newOrderForm, setNewOrderForm] = useState({
    modele: '',
    quantite: '',
    details: '',
    photo: null as string | null,
    telephone: currentUser?.telephone || '',
    tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' } as Record<string, string>
  });
  const DEFAULT_GEMINI_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' ? atob('QVEuQWI4Uk42SjJuR1gwSlVfVWRBR0RvQXhTSzVDQVJReWR5ZFN1eldva296NzRqdlhYTmc=') : '');
  const [sendingOrder, setSendingOrder] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('beya_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (envKey && envKey.trim()) return envKey.trim();
      return DEFAULT_GEMINI_KEY;
    } catch {
      return DEFAULT_GEMINI_KEY;
    }
  });

  useEffect(() => {
    try {
      if (!localStorage.getItem('beya_gemini_api_key')) {
        localStorage.setItem('beya_gemini_api_key', DEFAULT_GEMINI_KEY);
      }
    } catch {}
  }, []);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isAiAnalyzingLead, setIsAiAnalyzingLead] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const hasLeads = !!localStorage.getItem('textrack_data_leads');
      const hasCmds = !!localStorage.getItem('textrack_data_commandes');
      if (hasLeads || hasCmds) return false;
    } catch {}
    return true;
  });
  const [uploadingPreuve, setUploadingPreuve] = useState<string | null>(null);
  const [annulationModal, setAnnulationModal] = useState<{ cmdId: string, cmdRef: string } | null>(null);
  const [annulationRaison, setAnnulationRaison] = useState('');
  const [annulationSending, setAnnulationSending] = useState(false);
  const [showEmailBanner, setShowEmailBanner] = useState(() => {
    if (!currentUser?.email) return false;
    if (currentUser.emailVerified) return false;
    try {
      const cached = localStorage.getItem(`beya_email_verified_${currentUser.email.toLowerCase().trim()}`);
      if (cached === 'true') return false;
    } catch {}
    return true;
  });
  const [emailAlreadyConfirmedMsg, setEmailAlreadyConfirmedMsg] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentCooldown, setEmailSentCooldown] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [emailSentError, setEmailSentError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newDirectPassword, setNewDirectPassword] = useState('');
  const [confirmDirectPassword, setConfirmDirectPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSavedSuccess, setPasswordSavedSuccess] = useState(false);
  const [selectedDemandeFiche, setSelectedDemandeFiche] = useState<Lead | null>(null);
  const [selectedDemandePage, setSelectedDemandePage] = useState<Lead | null>(null);
  const [consultingDemande, setConsultingDemande] = useState<Lead | null>(null);
  const [atelierQuickEditLead, setAtelierQuickEditLead] = useState<Lead | null>(null);
  const [quickEditForm, setQuickEditForm] = useState({
    modeleReel: '',
    unitPrice: 75,
    totalPrice: 7500,
    patronagePrice: 250,
    prixEchantillon: 350,
    tissuSuggere: '',
    techDetails: '',
    delaiEstime: '7 - 10 jours ouvrables',
    statusProgression: 'etude' as 'reception' | 'etude' | 'echantillon' | 'production' | 'pret',
    reponseAtelier: ''
  });
  const [savingQuickEdit, setSavingQuickEdit] = useState(false);
  const [selectedTierQty, setSelectedTierQty] = useState<Record<string, number>>({});
  const [sourcingCheckActive, setSourcingCheckActive] = useState<Record<string, boolean>>({});
  const [sourcingSelectedColor, setSourcingSelectedColor] = useState<Record<string, string>>({});
  const [fabricOrderSent, setFabricOrderSent] = useState<Record<string, boolean>>({});

  // ─── BEYA NETWORK Pilot (Restricted strictly to forsaone41@gmail.com and admin) ───
  const isNetworkPilotUser = (currentUser?.email || '').toLowerCase().trim() === 'forsaone41@gmail.com' || currentUser?.role === 'admin';
  const [networkSubTab, setNetworkSubTab] = useState<'fournisseurs' | 'forum' | 'groupage'>('fournisseurs');
  const [networkCategoryFilter, setNetworkCategoryFilter] = useState<'all' | 'tissu' | 'impression' | 'broderie' | 'modeliste'>('all');
  const [networkSearchQuery, setNetworkSearchQuery] = useState('');
  const [networkForumTopicFilter, setNetworkForumTopicFilter] = useState<'all' | 'livraison' | 'marketing' | 'tissus' | 'conseils'>('all');
  const [showEditNetworkProfileModal, setShowEditNetworkProfileModal] = useState(false);
  const [savingNetworkProfile, setSavingNetworkProfile] = useState(false);

  const [networkProfileForm, setNetworkProfileForm] = useState(() => {
    let saved: any = null;
    try {
      const raw = localStorage.getItem(`beya_network_profile_${currentUser?.email?.toLowerCase().trim()}`);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    return {
      role: 'brand' as 'brand' | 'supplier' | 'modeliste' | 'imprimeur',
      brandName: saved?.brandName || currentUser?.brandName || (currentUser as any)?.store_name || (currentUser as any)?.storeName || currentUser?.nom || 'Beya Brand',
      city: saved?.city || currentUser?.ville || 'الدار البيضاء (Casablanca)',
      phone: saved?.phone || currentUser?.telephone || '0600000000',
      bio: saved?.bio || currentUser?.networkBio || ''
    };
  });

  useEffect(() => {
    if (activeTab === 'network') {
      window.location.hash = '#/network';
    }
  }, [activeTab]);

  const isNetworkProfileCompleted = () => {
    if (currentUser?.networkProfileCompleted) return true;
    try {
      if (localStorage.getItem(`beya_network_completed_${currentUser?.email?.toLowerCase().trim()}`) === 'true') return true;
    } catch {}
    return false;
  };

  const handleSaveNetworkProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalBrandName = networkProfileForm.brandName.trim() || currentUser?.nom || 'Beya Client';
    const finalPhone = networkProfileForm.phone.trim() || currentUser?.telephone || '0600000000';
    setSavingNetworkProfile(true);
    try {
      const emailKey = (currentUser?.email || '').toLowerCase().trim();
      const updated: User = {
        ...currentUser!,
        brandName: finalBrandName,
        telephone: finalPhone,
        ville: networkProfileForm.city.trim() || 'الدار البيضاء (Casablanca)',
        networkRole: 'brand',
        networkBio: networkProfileForm.bio.trim(),
        networkProfileCompleted: true
      };
      localStorage.setItem('textrack_auth', JSON.stringify(updated));
      if (emailKey) {
        localStorage.setItem(`beya_network_completed_${emailKey}`, 'true');
        localStorage.setItem(`beya_network_profile_${emailKey}`, JSON.stringify(updated));
      }
      await saveRecord('users', updated, true).catch(() => {});
      setShowEditNetworkProfileModal(false);
    } catch (err) {
      console.error('Error saving network profile:', err);
    } finally {
      setSavingNetworkProfile(false);
    }
  };

  // Forum posts state with persistence
  const [forumPosts, setForumPosts] = useState<Array<{
    id: string;
    author: string;
    authorRole: string;
    city: string;
    title: string;
    category: 'livraison' | 'marketing' | 'tissus' | 'conseils';
    content: string;
    date: string;
    repliesCount: number;
    likesCount: number;
    liked?: boolean;
  }>>(() => {
    try {
      const saved = localStorage.getItem('beya_network_forum_posts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'post-1',
        author: 'أمين البراندي',
        authorRole: 'صاحب براند ملابس شبابية',
        city: 'الدار البيضاء',
        title: 'شكون أحسن شركة توصيل (Livraison) من ناحية سرعة التحصيل (Retour de fonds) هاد الأيام؟',
        category: 'livraison',
        content: 'السلام عليكم الإخوان، كنسولكم على تجاربكم مع شركات التوصيل هاد الشهر؟ شكون لي عندهم نسبة التسليم (Livraison) طالعة وكيصيفطو الفلوس بلا تعطيل؟',
        date: 'اليوم، 10:30',
        repliesCount: 16,
        likesCount: 24
      },
      {
        id: 'post-2',
        author: 'سفيان - E-com Pro',
        authorRole: 'متجر ملابس أونلاين',
        city: 'الرباط',
        title: 'نصيحة مجربة لحملات التيك توك والإعلانات (TikTok Ads) لبراندات الملابس',
        category: 'marketing',
        content: 'بالنسبة للإخوان لي كيطلقو إعلانات: فيديوهات الـ UGC والـ Behind the scenes وسط الورشة فاش كيبان الثوب والفصالة والخياطة راهم كيجيبو أعلى عائد (ROAS 4.8) مقارنة بالتصاور العادية. جربو هاد الطريقة!',
        date: 'أمس، 18:45',
        repliesCount: 22,
        likesCount: 39
      },
      {
        id: 'post-3',
        author: 'يوسف العثماني',
        authorRole: 'علامة Streetwear',
        city: 'مراكش',
        title: 'مقارنة بين إنترلوك 240g والمولتون 320g: شكون لي كيمشي أحسن فالهودي الخريفي؟',
        category: 'tissus',
        content: 'بناءً على طلبات الكليان ديالي: الإنترلوك قطن دابل نيت كيعطي فينيسيون راقية واقفة وما كيتلواش، بينما المولتون كيبقى هو الملك ديال البرد والأوفر سايز.',
        date: 'منذ يومين',
        repliesCount: 11,
        likesCount: 19
      },
      {
        id: 'post-4',
        author: 'BEYA Advisory',
        authorRole: 'فريق دعم الورشة',
        city: 'الدار البيضاء',
        title: '💡 أهمية التغليف الاحترافي (Hangtags & Polybags) في خفض نسبة الـ Retour',
        category: 'conseils',
        content: 'تنبيه مهم لجميع رواد BEYA NETWORK: إضافة بطاقة إرشادات الغسيل (Etiquette de lavage) وHangtag احترافي كيرفع ثقة الزبون بنسبة 35% وكيقلل من نسبة رفض الطرد عند الاستلام.',
        date: 'منذ 3 أيام',
        repliesCount: 8,
        likesCount: 31
      }
    ];
  });
  const [showNewForumPostModal, setShowNewForumPostModal] = useState(false);
  const [newPostForm, setNewPostForm] = useState({
    title: '',
    category: 'conseils' as 'livraison' | 'marketing' | 'tissus' | 'conseils',
    content: ''
  });

  const handleCreateForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostForm.title.trim() || !newPostForm.content.trim()) return;
    const authorName = networkProfileForm.brandName || currentUser?.nom || 'عضو BEYA';
    const authorRoleText = networkProfileForm.role === 'brand' ? 'صاحب علامة تجارية' :
                           networkProfileForm.role === 'supplier' ? 'مورد أقمشة' :
                           networkProfileForm.role === 'modeliste' ? 'مصمم وموديلست' : 'ورشة طباعة';
    const postObj = {
      id: `post-${Date.now()}`,
      author: authorName,
      authorRole: authorRoleText,
      city: networkProfileForm.city.split(' ')[0] || 'المغرب',
      title: newPostForm.title.trim(),
      category: newPostForm.category,
      content: newPostForm.content.trim(),
      date: isAr ? 'الآن' : 'À l\'instant',
      repliesCount: 0,
      likesCount: 1,
      liked: true
    };
    const updated = [postObj, ...forumPosts];
    setForumPosts(updated);
    try {
      localStorage.setItem('beya_network_forum_posts', JSON.stringify(updated));
    } catch {}
    setNewPostForm({ title: '', category: 'conseils', content: '' });
    setShowNewForumPostModal(false);
  };

  const handleLikePost = (postId: string) => {
    setForumPosts(prev => {
      const next = prev.map(p => {
        if (p.id === postId) {
          const isLiked = p.liked;
          return {
            ...p,
            liked: !isLiked,
            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1
          };
        }
        return p;
      });
      try {
        localStorage.setItem('beya_network_forum_posts', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const networkSuppliers = [
    {
      id: 'sup-1',
      name: 'مجمع أقمشة الشرق (Derb Omar)',
      category: 'tissu',
      categoryLabel: 'أقمشة وتوريد قطن',
      city: 'الدار البيضاء (درب عمر)',
      whatsapp: '212661849201',
      products: ['مولتون شتوي 320g مبطن', 'إنترلوك أصلي 100% قطن', 'جيرسي ليكرا صيفي', 'كوتون كوردوروي'],
      minQty: 'ابتداءً من 25 متر (رولو واحد)',
      rating: 4.9,
      badge: 'مورد معتمد BEYA ⭐',
      desc: 'الموزع المعتمد لأرقى خامات الأقطان والمنسوجات الشتوية والصيفية في درب عمر. أسعار تفضيلية لأعضاء شبكة BEYA.'
    },
    {
      id: 'sup-2',
      name: 'المركز الرقمي للطباعة والـ DTF (Digital Print Pro)',
      category: 'impression',
      categoryLabel: 'طباعة وسيريغرافي',
      city: 'الدار البيضاء (عين السبع)',
      whatsapp: '212662938102',
      products: ['طباعة DTF فائقة النقاء HD', 'سيريغرافي Plastisol & Waterbase', 'فلوكاج قطني مخملي', 'Sublimation'],
      minQty: 'ابتداءً من 30 قطعة',
      rating: 4.95,
      badge: 'شريك معتمد BEYA ⭐',
      desc: 'ورشة طباعة عصرية مجهزة بأحدث آلات الـ DTF والطباعة الحريرية بألوان ثابتة ومقاومة للغسيل المتكرر.'
    },
    {
      id: 'sup-3',
      name: 'استوديو الباترون الرقمي (Atelier Patronage Pro)',
      category: 'modeliste',
      categoryLabel: 'تصميم وموديلست',
      city: 'الدار البيضاء / طنجة',
      whatsapp: '212663049182',
      products: ['إعداد الباترون الرقمي Gerber & Lectra', 'تدريج القياسات (Gradation XS-3XL)', 'إعداد Fiche Technique كاملة'],
      minQty: 'موديل واحد',
      rating: 5.0,
      badge: 'موديلست معتمد BEYA ⭐',
      desc: 'مهندسو وموديلست أزياء معتمدون لتجهيز ملفات الباترون الدقيقة المتوافقة مباشرة مع ماكينات الفصالة بالليزر.'
    },
    {
      id: 'sup-4',
      name: 'ورشة الفجر للتطريز الصناعي (Broderie Industrielle Tajima)',
      category: 'broderie',
      categoryLabel: 'تطريز آلي متطور',
      city: 'فاس / الدار البيضاء',
      whatsapp: '212664728190',
      products: ['تطريز ثلاثي الأبعاد 3D بارز', 'تطريز شعارات الهودي والكابوتش', 'بادجات مطرزة حرارية (Écussons)'],
      minQty: 'ابتداءً من 50 قطعة',
      rating: 4.85,
      badge: 'شريك معتمد BEYA ⭐',
      desc: 'أسطول ماكينات تطريز يابانية Tajima 12 رأس لدقة متناهية وسرعة فائقة في تنفيذ أرقى شعارات الماركات.'
    },
    {
      id: 'sup-5',
      name: 'أقمشة المسيرة الشمالية (Tissus Nord)',
      category: 'tissu',
      categoryLabel: 'أقمشة سراويل وفيستات',
      city: 'طنجة (المنطقة الحرة)',
      whatsapp: '212665819203',
      products: ['جاباردين كوتون ستريتش متين', 'قماش كوتون كانفاس (Canvas)', 'أقمشة تقنية مضادة للماء'],
      minQty: 'ابتداءً من 30 متر',
      rating: 4.8,
      badge: 'مورد معتمد BEYA ⭐',
      desc: 'متخصصون في توريد خامات السراويل الكارجو والسترات الواقية والمآزر بأعلى معايير المتانة ومقاومة التمزق.'
    }
  ];

  const networkGroupage = [
    {
      id: 'grp-1',
      fabricName: 'مولتون شتوي مبطن قطن 100% فاخر (Molleton Gratté 320 GSM)',
      factory: 'مباشرة من مصنع النسيج بالمنطقة الصناعية عين السبع',
      colors: ['أسود داكن (Noir intense)', 'رمادي ميلونج (Gris chiné)', 'أخضر غابوي (Vert bouteille)'],
      regularPriceMAD: 52,
      groupPriceMAD: 38,
      savingsPct: '27%',
      targetMeters: 300,
      currentMeters: 220,
      progressPct: 73,
      deadlineDays: 4,
      whatsappMsg: 'Bonjour BEYA Network, je souhaite réserver ma part dans l\'achat groupé du Molleton Gratté 320g (Réf: GRP-MOLLETON-320).'
    },
    {
      id: 'grp-2',
      fabricName: 'إنترلوك قطن دابل نيت راقي (Interlock Double Knit 240 GSM)',
      factory: 'استيراد وتوريد جماعي حصري لأعضاء BEYA',
      colors: ['أوف وايت (Off-white)', 'كحلي ملكي (Bleu marine)', 'بيج رملي (Beige sable)'],
      regularPriceMAD: 44,
      groupPriceMAD: 32,
      savingsPct: '27%',
      targetMeters: 250,
      currentMeters: 145,
      progressPct: 58,
      deadlineDays: 7,
      whatsappMsg: 'Bonjour BEYA Network, je souhaite réserver ma part dans l\'achat groupé Interlock Double Knit (Réf: GRP-INTERLOCK-240).'
    }
  ];
  // Auto-detect if user's email is already confirmed in Supabase Auth to dismiss banner
  useEffect(() => {
    if (!currentUser?.email) return;
    const emailKey = currentUser.email.toLowerCase().trim();

    const checkConfirmedStatus = async () => {
      try {
        const cached = localStorage.getItem(`beya_email_verified_${emailKey}`);
        if (cached === 'true' || currentUser.emailVerified) {
          setShowEmailBanner(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email?.toLowerCase().trim() === emailKey) {
          const isConfirmed = !!(user.email_confirmed_at || user.user_metadata?.email_verified);
          if (isConfirmed) {
            localStorage.setItem(`beya_email_verified_${emailKey}`, 'true');
            setShowEmailBanner(false);
            if (!currentUser.emailVerified) {
              const updated = { ...currentUser, emailVerified: true };
              localStorage.setItem('textrack_auth', JSON.stringify(updated));
            }
          }
        }
      } catch (e) {
        // Silent catch
      }
    };

    checkConfirmedStatus();
  }, [currentUser?.email]);
  const [showFullStudy, setShowFullStudy] = useState(false);
  const [showAiChatPopup, setShowAiChatPopup] = useState(false);
  const [isAiChatMinimized, setIsAiChatMinimized] = useState(false);
  const [clientAiMessages, setClientAiMessages] = useState<Record<string, Array<{ sender: 'ai' | 'user'; text: string; time: string }>>>({});
  const [clientAiInput, setClientAiInput] = useState('');
  const [clientAiLoading, setClientAiLoading] = useState(false);
  const [fabricOption, setFabricOption] = useState<Record<string, 'atelier' | 'client'>>({});
  const [clientPhone, setClientPhone] = useState<string>(() => {
    try {
      const local = localStorage.getItem(`beya_client_phone_${currentUser?.email?.toLowerCase().trim()}`);
      if (local && local.trim()) return local.trim();
    } catch {}
    return currentUser?.telephone || '';
  });
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInputVal, setPhoneInputVal] = useState(clientPhone);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaveSuccess, setPhoneSaveSuccess] = useState(false);
  const [validatingDevisLead, setValidatingDevisLead] = useState<Lead | null>(null);
  const [printingDevisLead, setPrintingDevisLead] = useState<Lead | null>(null);
  const [virementReceiptFile, setVirementReceiptFile] = useState<string | null>(null);
  const [validatingDevisSending, setValidatingDevisSending] = useState(false);
  const [validatingDevisSuccess, setValidatingDevisSuccess] = useState(false);
  const [ribCopied, setRibCopied] = useState(false);

  const handleValidateDevisAndVirement = async (lead: Lead) => {
    setValidatingDevisSending(true);
    try {
      const extDetails: any = {};
      try { Object.assign(extDetails, JSON.parse(lead.details || '{}')); } catch(e) {}
      extDetails.devisStatus = virementReceiptFile ? 'acompte_paye' : 'valide';
      extDetails.clientValideDate = new Date().toISOString();
      if (virementReceiptFile) extDetails.virementReceipt = virementReceiptFile;

      const updatedLead: Lead = {
        ...lead,
        details: JSON.stringify(extDetails),
        crmStage: 'confirme',
        statusProgression: virementReceiptFile ? 'production' : 'etude',
        reponseAtelierDate: new Date().toISOString()
      };
      (updatedLead as any).devisStatus = virementReceiptFile ? 'acompte_paye' : 'valide';

      await saveRecord('leads', updatedLead);
      setMesDemandes(prev => prev.map(m => m.id === lead.id ? updatedLead : m));
      setSelectedDemandePage(prev => prev?.id === lead.id ? updatedLead : prev);
      
      setValidatingDevisSuccess(true);
      setTimeout(() => {
        setValidatingDevisSuccess(false);
        setValidatingDevisLead(null);
        setVirementReceiptFile(null);
      }, 2000);
    } catch (err) {
      console.error('Error validating devis:', err);
    } finally {
      setValidatingDevisSending(false);
    }
  };

  const handlePrintDevis = (lead: Lead) => {
    setPrintingDevisLead(lead);
    setTimeout(() => {
      printElement(`devis-doc-${lead.id}`);
    }, 250);
  };

  const handleSaveClientPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = phoneInputVal.trim();
    if (!cleaned) return;
    setSavingPhone(true);
    try {
      setClientPhone(cleaned);
      const emailKey = currentUser?.email?.toLowerCase().trim() || 'default';
      localStorage.setItem(`beya_client_phone_${emailKey}`, cleaned);
      
      try {
        const rawAuth = localStorage.getItem('textrack_auth');
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          parsed.telephone = cleaned;
          localStorage.setItem('textrack_auth', JSON.stringify(parsed));
        }
      } catch {}

      if (currentUser) {
        const updatedUser = { ...currentUser, telephone: cleaned };
        await saveRecord('users', updatedUser, true).catch(() => {});
      }

      setIsEditingPhone(false);
      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save client phone:', err);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!currentUser?.email) return;
    const emailKey = currentUser.email.toLowerCase().trim();
    setEmailSending(true);
    setEmailSentError('');
    setEmailSentSuccess(false);
    setEmailAlreadyConfirmedMsg(false);

    try {
      const siteUrl = window.location.origin + window.location.pathname;

      // 1. Check if user is ALREADY confirmed in Supabase Auth
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email?.toLowerCase().trim() === emailKey) {
          const isConfirmed = !!(user.email_confirmed_at || user.user_metadata?.email_verified);
          if (isConfirmed) {
            localStorage.setItem(`beya_email_verified_${emailKey}`, 'true');
            const updated = { ...currentUser, emailVerified: true };
            localStorage.setItem('textrack_auth', JSON.stringify(updated));
            setEmailAlreadyConfirmedMsg(true);
            setTimeout(() => {
              setShowEmailBanner(false);
            }, 3000);
            return;
          }
        }
      } catch (authErr) {}

      // 2. If not confirmed, send confirmation email via Supabase resend
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: currentUser.email,
        options: {
          emailRedirectTo: siteUrl
        }
      });

      if (resendError) {
        const msg = (resendError.message || '').toLowerCase();

        // If email is already confirmed
        if (msg.includes('already confirmed') || msg.includes('already verified')) {
          localStorage.setItem(`beya_email_verified_${emailKey}`, 'true');
          const updated = { ...currentUser, emailVerified: true };
          localStorage.setItem('textrack_auth', JSON.stringify(updated));
          setEmailAlreadyConfirmedMsg(true);
          setTimeout(() => {
            setShowEmailBanner(false);
          }, 3000);
          return;
        }

        // Rate limit protection check
        if (msg.includes('rate limit') || msg.includes('security purposes') || (resendError as any).status === 429) {
          throw new Error(isAr 
            ? 'تم إرسال عدة طلبات مؤخراً لأسباب أمنية. يرجى الانتظار دقيقة وتفقد مجلد الرسائل غير المرغوب فيها (Spam).'
            : 'Trop de requêtes récentes. Veuillez patienter une minute et vérifier vos spams.');
        }

        // If user not in Supabase Auth yet, create auth user to trigger confirmation email
        const { error: signUpError } = await supabase.auth.signUp({
          email: currentUser.email,
          password: currentUser.password || currentUser.pinCode || 'BeyaPass2026!',
          options: {
            emailRedirectTo: siteUrl,
            data: {
              full_name: currentUser.nom || 'Client',
              role: currentUser.role || 'client'
            }
          }
        });

        if (signUpError) {
          const sMsg = (signUpError.message || '').toLowerCase();
          if (sMsg.includes('already registered') || sMsg.includes('already exists')) {
            // Already registered and active
            localStorage.setItem(`beya_email_verified_${emailKey}`, 'true');
            const updated = { ...currentUser, emailVerified: true };
            localStorage.setItem('textrack_auth', JSON.stringify(updated));
            setEmailAlreadyConfirmedMsg(true);
            setTimeout(() => {
              setShowEmailBanner(false);
            }, 3000);
            return;
          }
          throw signUpError;
        }
      }

      setEmailSentSuccess(true);
      setEmailSentCooldown(true);
      setTimeout(() => setEmailSentCooldown(false), 45000);
    } catch (err: any) {
      console.error('Email verification error:', err);
      setEmailSentError(err.message || (isAr ? 'تعذر إرسال رابط تأكيد الحساب. يرجى المحاولة لاحقاً.' : 'Impossible d\'envoyer l\'email de confirmation.'));
    } finally {
      setEmailSending(false);
    }
  };

  const handleSaveDirectPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectPassword || newDirectPassword.length < 6) {
      alert(isAr ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newDirectPassword !== confirmDirectPassword) {
      alert(isAr ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
      return;
    }

    setSavingPassword(true);
    try {
      const updatedUser: User = {
        ...currentUser!,
        password: newDirectPassword,
        pinCode: newDirectPassword,
        emailVerified: true
      };
      await saveRecord('users', updatedUser, true);
      localStorage.setItem('textrack_auth', JSON.stringify(updatedUser));

      try {
        await supabase.auth.updateUser({ password: newDirectPassword });
      } catch (authErr) {
        try {
          await supabase.auth.signUp({
            email: currentUser!.email,
            password: newDirectPassword
          });
        } catch (e) {}
      }

      setPasswordSavedSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSavedSuccess(false);
        setShowEmailBanner(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error updating password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLaunchMyStore = async () => {
    if (!currentUser) {
      window.location.hash = '#/store-signup';
      return;
    }

    // Direct 1-click jump into StoreBuilder without modifying core role
    window.location.hash = '#/store-builder';
  };

  // Virement states
  const [virementPhoto, setVirementPhoto] = useState<string | null>(null);
  const [virementMontant, setVirementMontant] = useState('');
  const [virementCommandeId, setVirementCommandeId] = useState('');
  const [sendingVirement, setSendingVirement] = useState(false);
  const [virementSent, setVirementSent] = useState(false);
  const [ribCopied, setRibCopied] = useState(false);

  // Helper for translating phase names
  const phaseAr: Record<string, string> = { 
    coupe: 'الفصالة', 
    montage: 'الخياطة', 
    finition: 'الفينيسيون', 
    repassage: 'المصلوح', 
    controle: 'مراقبة الجودة',
    emballage: 'التغليف',
    livré: 'تسلّمات' 
  };

  const phaseIcons: Record<string, any> = {
    coupe: <Scissors className="w-5 h-5" />,
    montage: <Layers className="w-5 h-5" />,
    finition: <Sparkles className="w-5 h-5" />,
    repassage: <Wind className="w-5 h-5" />,
    controle: <ShieldCheck className="w-5 h-5" />,
    emballage: <Box className="w-5 h-5" />,
    livré: <Truck className="w-5 h-5" />
  };

  useEffect(() => {
    // Safety fallback: Never leave the user stuck on loading spinner for more than 1.2s!
    const failsafeTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    const leadsLoader = (currentUser && (currentUser.nom || currentUser.email))
      ? loadClientLeads(currentUser)
      : loadLeads();

    Promise.all([
      loadData<Commande>('commandes').catch(() => []),
      loadData<Facture>('factures').catch(() => []),
      loadData<any>('fiches').catch(() => []),
      leadsLoader.catch(() => [])
    ]).then(([allCommandes, allFactures, allFiches, clientOrAllLeads]) => {
      if (Array.isArray(allCommandes) && allCommandes.length > 0) setCommandes(allCommandes);
      if (Array.isArray(allFactures) && allFactures.length > 0) setFactures(allFactures);
      if (Array.isArray(allFiches) && allFiches.length > 0) setFiches(allFiches);

      // If a user is logged in, show their orders & demands automatically
      if (currentUser) {
        const myCommandes = (allCommandes || []).filter(c =>
          (c.client || '').trim().toLowerCase() === (currentUser.nom || '').trim().toLowerCase() ||
          (currentUser.email && (c as any).email?.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
        );
        const myLeads = (clientOrAllLeads || []).filter(l =>
          (l.name || '').trim().toLowerCase() === (currentUser.nom || '').trim().toLowerCase() ||
          ((l.email || '').trim().toLowerCase() === (currentUser.email || '').trim().toLowerCase() && currentUser.email) ||
          ((l.phone || '').trim() === (currentUser.telephone || '').trim() && currentUser.telephone)
        );
        setFound(myCommandes);
        setMesDemandes(myLeads);
        lastClientMessageCountRef.current = myLeads.length;
        
        // Load photos for these leads asynchronously
        myLeads.forEach(async (lead) => {
          if (!leadPhotosRef.current[lead.id] && !lead.photo) {
            const photo = await loadLeadPhoto(lead.id);
            if (photo) {
              handlePhotoLoaded(lead.id, photo);
            }
          }
        });
        
        // Auto-subscribe to push notifications silently
        subscribeToPush(currentUser.username || currentUser.nom).catch(() => {});
      }
    }).catch(err => {
      console.warn("Portal load warning:", err);
    }).finally(() => {
      clearTimeout(failsafeTimer);
      setLoading(false);
    });

    return () => clearTimeout(failsafeTimer);
  }, [currentUser]);

  useEffect(() => {
    if (!virementCommandeId) {
      if (found.length === 1) {
        setVirementCommandeId(found[0].id);
      } else if (found.length === 0) {
        const trueDem = mesDemandes.filter(d => d.type !== '__MESSAGE__' && d.type !== '__MESSAGE_REPLY__');
        if (trueDem.length >= 1) {
          setVirementCommandeId(trueDem[0].id);
        }
      }
    }
  }, [found, mesDemandes, virementCommandeId]);

  // Auto-refresh messages & demands every 8 seconds if chat or payments is active
  useEffect(() => {
    if ((activeTab !== 'support' && activeTab !== 'demandes' && activeTab !== 'payments') || !currentUser) return;

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const interval = setInterval(async () => {
      const myLeads = (currentUser && (currentUser.nom || currentUser.email))
        ? await loadClientLeads(currentUser)
        : await loadLeads();

      if (lastClientMessageCountRef.current > 0 && myLeads.length > lastClientMessageCountRef.current) {
        const newOnes = myLeads.slice(lastClientMessageCountRef.current);
        const adminMsgs = newOnes.filter(m => m.type === '__MESSAGE_REPLY__');
        if (adminMsgs.length > 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            const latest = adminMsgs[adminMsgs.length - 1];
            new Notification('BEYA CREATIVE (Support VIP)', {
              body: latest.details,
              icon: '/vite.svg'
            });
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          }
        }
      }
      lastClientMessageCountRef.current = myLeads.length;

      // Preserve photos from existing state and cache so polling never blanks out the images!
      setMesDemandes(prev => {
        const existingMap: Record<string, Lead> = {};
        prev.forEach(p => { existingMap[p.id] = p; });
        return myLeads.map(l => {
          const existing = existingMap[l.id];
          const photo = l.photo || existing?.photo || leadPhotosRef.current[l.id];
          return {
            ...l,
            ...(photo ? { photo } : {}),
            ...(existing?.photos ? { photos: existing.photos } : {})
          };
        });
      });

      // Fetch any missing photos for incoming leads
      myLeads.forEach(async (lead) => {
        if (!leadPhotosRef.current[lead.id] && !lead.photo && (lead.photoCount === undefined || lead.photoCount > 0)) {
          const photo = await loadLeadPhoto(lead.id);
          if (photo) {
            handlePhotoLoaded(lead.id, photo);
          }
        }
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [activeTab, currentUser]);

  function handleSearch() {
    const results = commandes.filter(c =>
      c.reference.toLowerCase() === reference.toLowerCase() ||
      (c.referenceClient && c.referenceClient.toLowerCase() === reference.toLowerCase()) ||
      (c.client || '').toLowerCase().includes(reference.toLowerCase())
    );
    setFound(results);
  }

  const handleDeleteClientMsg = async (msgId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Voulez-vous supprimer ce message ?')) return;
    await deleteRecord('leads', msgId);
    setMesDemandes(prev => prev.filter(m => m.id !== msgId));
  };

  const handleClearClientChat = async () => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذه المحادثة بالكامل؟' : 'Voulez-vous supprimer toute la conversation ?')) return;
    const chatMsgs = mesDemandes.filter(m => m.type === '__MESSAGE__' || m.type === '__MESSAGE_REPLY__');
    for (const m of chatMsgs) {
      await deleteRecord('leads', m.id);
    }
    setMesDemandes(prev => prev.filter(m => m.type !== '__MESSAGE__' && m.type !== '__MESSAGE_REPLY__'));
  };

  const [deleteModalLead, setDeleteModalLead] = useState<Lead | null>(null);
  const [deleteReasonId, setDeleteReasonId] = useState<string>('price_high');
  const [deleteCustomNote, setDeleteCustomNote] = useState<string>('');
  const [isDeletingLead, setIsDeletingLead] = useState<boolean>(false);

  const handleOpenDeleteModal = (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteModalLead(lead);
    setDeleteReasonId('price_high');
    setDeleteCustomNote('');
  };

  const handleConfirmDeleteWithReason = async () => {
    if (!deleteModalLead) return;
    setIsDeletingLead(true);
    try {
      const id = deleteModalLead.id;
      await deleteRecord('leads', id);
      setMesDemandes(prev => prev.filter(m => m.id !== id));
      setSelectedDemandePage(prev => prev?.id === id ? null : prev);
      setDeleteModalLead(null);
    } catch (err) {
      console.error(err);
      alert(isAr ? 'حدث خطأ أثناء حذف الطلب' : 'Erreur lors de la suppression');
    } finally {
      setIsDeletingLead(false);
    }
  };

  const handleOpenEditDemande = (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDemandeId(lead.id);
    let parsedTailles: Record<string, string> = { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' };
    if (lead.tailles) {
      (lead.tailles ? Object.entries(lead.tailles) : []).forEach(([k, v]) => { if (parsedTailles[k] !== undefined) parsedTailles[k] = String(v); });
    } else if (lead.sizes) {
      try {
        const parsed = typeof lead.sizes === 'string' ? JSON.parse(lead.sizes) : lead.sizes;
        Object.entries(parsed).forEach(([k, v]) => { if (parsedTailles[k] !== undefined) parsedTailles[k] = String(v); });
      } catch(e) {}
    }
    setNewOrderForm({
      modele: lead.type || '',
      quantite: lead.quantity?.toString() || '',
      photo: lead.photo || (lead.photos && lead.photos[0]) || leadPhotos[lead.id] || null,
      details: extractCleanUserNotes(lead.details),
      telephone: lead.phone || currentUser?.telephone || '',
      tailles: parsedTailles
    });
    setShowNewOrderModal(true);
  };

  const handleDeleteDemande = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetLead = mesDemandes.find(m => m.id === id);
    if (targetLead) {
      handleOpenDeleteModal(targetLead, e);
      return;
    }
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Voulez-vous vraiment supprimer cette demande ?')) return;
    await deleteRecord('leads', id);
    setMesDemandes(prev => prev.filter(m => m.id !== id));
    setSelectedDemandePage(prev => prev?.id === id ? null : prev);
  };

      const testGeminiApiKey = async (keyToTest: string) => {
    const cleanKey = (keyToTest || '').trim();
    if (!cleanKey) {
      setApiKeyTestResult({ ok: false, message: isAr ? 'المرجو إدخال مفتاح API أولاً' : 'Veuillez saisir une clé API' });
      return;
    }
    setTestingApiKey(true);
    setApiKeyTestResult(null);
    try {
      const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
      let succeeded = false;
      let lastErr = '';
      for (const m of candidateModels) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cleanKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Bonjour' }] }] })
          });
          const data = await res.json();
          if (res.ok && data.candidates && data.candidates.length > 0) {
            succeeded = true;
            break;
          }
          if (data.error?.message) lastErr = data.error.message;
        } catch (e: any) {
          lastErr = e.message || 'Network error';
        }
      }
      if (succeeded) {
        setApiKeyTestResult({ ok: true, message: isAr ? 'المفتاح شغال بنجاح! الاتصال بـ Google Gemini ممتاز ✓' : 'Clé API valide et connectée à Google Gemini avec succès ✓' });
      } else {
        setApiKeyTestResult({ ok: false, message: (isAr ? 'فشل التحقق: ' : 'Échec : ') + (lastErr || (isAr ? 'المفتاح غير صالح أو الحساب بدون رصيد' : 'Clé invalide')) });
      }
    } catch (err: any) {
      setApiKeyTestResult({ ok: false, message: err.message || (isAr ? 'خطأ في الاتصال' : 'Erreur de connexion') });
    } finally {
      setTestingApiKey(false);
    }
  };

  const handleSaveApiKey = () => {
    const clean = apiKeyDraft.trim();
    if (clean) {
      localStorage.setItem('beya_gemini_api_key', clean);
      setGeminiApiKey(clean);
    } else {
      localStorage.removeItem('beya_gemini_api_key');
      setGeminiApiKey('');
    }
    setShowApiKeyModal(false);
  };

  const analyzeLeadPhotoWithAI = async (
    target: { modele: string; details?: string; photo: string },
    apiKeyParam?: string
  ) => {
    const apiKey = (apiKeyParam || geminiApiKey || localStorage.getItem('beya_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY).trim();
    if (!apiKey) return null;
    if (!target.photo && !target.modele) return null;

    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (target.photo && target.photo.startsWith('data:')) {
      const match = target.photo.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    if (!base64Data && target.photo && target.photo.startsWith('http')) {
      try {
        const resp = await fetch(target.photo);
        const blob = await resp.blob();
        mimeType = blob.type || 'image/jpeg';
        const readerResult = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        const match = readerResult.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          base64Data = match[2];
        }
      } catch (e) {
        console.warn('Could not extract image base64 for Gemini vision:', e);
      }
    }

    const prompt = `أنت كبير المهندسين التقنيين وخبير تسعير صناعة الملابس والنسيج في ورشة BEYA Creative بالمغرب بخبرة 20 سنة.
المهمة: قم بتحليل دقيق وشامل ومخصص جداً للموديل المعروض في الصورة (أو المذكور في الملاحظات) وحساب التكلفة التقديرية الحقيقية والمضبوطة لهذا الموديل بالتحديد.
تنبيه حاسم: لا تكرر نفس الأرقام لجميع الموديلات! احسب تكلفة متناسبة مع نوع القطعة بدقة:
- إذا كان تيشيرت: سعر الخياطة unitPrice عادة بين 18 و 32 درهم، واستهلاك القماش 1.00m إلى 1.25m، وسعر المتر 28 إلى 45 درهم.
- إذا كان هودي شتوي / سويت: سعر الخياطة unitPrice عادة بين 38 و 58 درهم، واستهلاك القماش 1.75m إلى 2.05m، وسعر المتر/الكيلو 42 إلى 65 درهم.
- إذا كان بنطلون / كارجو / جينز: سعر الخياطة بين 45 و 68 درهم، واستهلاك القماش 1.50m إلى 1.85m.
- إذا كان جاكيت مبطن / معطف / بدلة: سعر الخياطة بين 75 و 140 درهم حسب التعقيد والبطانة، واستهلاك القماش 2.00m إلى 2.50m.
- إذا كانت عباية / فستان: سعر الخياطة بين 35 و 70 درهم حسب الموديل، واستهلاك القماش 2.50m إلى 3.50m.

الموديل المدخل من الزبون: "${target.modele || ''}"
ملاحظات الزبون: "${target.details || ''}"

أجب فقط بصيغة JSON صحيحة وبدون أي نصوص إضافية قبل أو بعد:
{
  "modeleReel": "الاسم الدقيق بالعربية / Nom exact en français",
  "tissuSuggere": "نوع القماش الدقيق بالعربية / Type de tissu en français",
  "tissuConso": 1.85,
  "prixMetreEstime": 45,
  "unitPrice": 48,
  "patronagePrice": 220,
  "prixEchantillon": 300,
  "delaiEstime": "7 إلى 10 أيام عمل / 7 à 10 jours ouvrables",
  "techDetails": "المواصفات التقنية بالعربية / Détails techniques en français",
  "reponseAtelier": "تعليق تقني بالعربية / Commentaire technique atelier en français"
}`;

    const candidateModels = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.8-flash'];

    for (const model of candidateModels) {
      try {
        const parts: any[] = [{ text: prompt }];
        if (base64Data) {
          parts.push({
            inlineData: { data: base64Data, mimeType }
          });
        }

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature: 0.2 }
          })
        });

        if (!res.ok) continue;
        const data = await res.json();
        const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawText.trim();
        const parsed = JSON.parse(jsonStr);

        if (parsed && (parsed.unitPrice || parsed.modeleReel)) {
          return {
            modeleReel: parsed.modeleReel || target.modele,
            tissuSuggere: parsed.tissuSuggere || '',
            tissuConso: Number(parsed.tissuConso) || 1.85,
            prixMetreEstime: Number(parsed.prixMetreEstime) || 45,
            unitPrice: Math.max(15, Math.round(Number(parsed.unitPrice) || 65)),
            patronagePrice: Math.max(150, Math.round(Number(parsed.patronagePrice) || 280)),
            prixEchantillon: Math.max(200, Math.round(Number(parsed.prixEchantillon) || 350)),
            delaiEstime: parsed.delaiEstime || '7 إلى 10 أيام عمل (العينة تحت 48 ساعة)',
            techDetails: parsed.techDetails || '',
            reponseAtelier: parsed.reponseAtelier || '',
            aiAnalyzed: true
          };
        }
      } catch (e) {
        console.warn(`Model ${model} in analyzeLeadPhotoWithAI failed:`, e);
      }
    }
    return null;
  };

  const reanalyzeDemandeWithAI = async (lead: Lead) => {
    let photo = lead.photo || (lead.photos && lead.photos[0]) || leadPhotos[lead.id];
    if (!photo) {
      try {
        const loaded = await loadLeadPhoto(lead.id);
        if (loaded) {
          photo = loaded;
          handlePhotoLoaded(lead.id, loaded);
        }
      } catch (e) {}
    }
    if (!photo) {
      alert(isAr ? 'المرجو إضافة صورة للموديل أولاً لتشغيل التحليل بالذكاء الاصطناعي' : 'Veuillez ajouter une photo pour lancer l\'analyse IA');
      return;
    }
    setIsAiAnalyzingLead(lead.id);
    try {
      const aiResult = await analyzeLeadPhotoWithAI({
        modele: lead.type || lead.modeleReel || 'Modèle',
        details: lead.details,
        photo: photo
      });

      if (aiResult) {
        let extDetails: any = {};
        try { extDetails = JSON.parse(lead.details?.split('| ATELIER_DEVIS:')[0] || '{}'); } catch(e) {}
        extDetails.patronagePrice = aiResult.patronagePrice;
        extDetails.prixEchantillon = aiResult.prixEchantillon;
        extDetails.tissuConso = aiResult.tissuConso;
        extDetails.prixMetreEstime = aiResult.prixMetreEstime;

        const devisPayload = {
          modeleReel: aiResult.modeleReel || lead.modeleReel,
          unitPrice: aiResult.unitPrice || lead.unitPrice,
          totalPrice: (aiResult.unitPrice || 65) * (Number(lead.quantity) || 10),
          tissuSuggere: aiResult.tissuSuggere || lead.tissuSuggere,
          techDetails: aiResult.techDetails || lead.techDetails,
          delaiEstime: aiResult.delaiEstime || lead.delaiEstime,
          statusProgression: lead.statusProgression || 'etude',
          reponseAtelier: aiResult.reponseAtelier || lead.reponseAtelier,
          reponseAtelierDate: new Date().toISOString()
        };

        const updatedLead: Lead = {
          ...lead,
          details: `${JSON.stringify(extDetails)}| ATELIER_DEVIS:${JSON.stringify(devisPayload)}`,
          modeleReel: aiResult.modeleReel || lead.modeleReel,
          tissuSuggere: aiResult.tissuSuggere || lead.tissuSuggere,
          unitPrice: aiResult.unitPrice || lead.unitPrice,
          crmPrice: aiResult.unitPrice || lead.crmPrice,
          patronagePrice: aiResult.patronagePrice || lead.patronagePrice,
          prixEchantillon: aiResult.prixEchantillon || lead.prixEchantillon,
          delaiEstime: aiResult.delaiEstime || lead.delaiEstime,
          techDetails: aiResult.techDetails || lead.techDetails,
          reponseAtelier: aiResult.reponseAtelier || lead.reponseAtelier
        };

        await saveRecord('leads', updatedLead);
        setMesDemandes(prev => prev.map(m => m.id === lead.id ? updatedLead : m));
        setSelectedDemandePage(updatedLead);
        alert(isAr ? 'تم تحليل الموديل وتدقيق الأسعار والأقمشة بالذكاء الاصطناعي بنجاح!' : 'Modèle analysé avec succès par l\'IA ! Prix et tissu mis à jour.');
      } else {
        alert(isAr ? 'لم نتمكن من تحليل الصورة. تأكد من صحة مفتاح Gemini API.' : 'Échec de l\'analyse. Vérifiez votre clé Gemini API.');
      }
    } catch (err: any) {
      alert((isAr ? 'خطأ في التحليل: ' : 'Erreur analyse : ') + (err?.message || ''));
    } finally {
      setIsAiAnalyzingLead(null);
    }
  };

  const generateClientAssistantReply = async (query: string, lead: Lead, analysis: any, isAr: boolean = true): Promise<string> => {
    const q = (query || '').toLowerCase().trim();
    const safeModel = (analysis?.modeleReel || lead?.type || 'الموديل').trim();
    const mod = safeModel.toLowerCase();
    const safeUnit = Number(analysis?.unitPrice) || 65;
    const safeQty = Number(analysis?.qty) || Number(lead?.quantity) || 100;
    const safeTotal = Number(analysis?.totalPrice) || (safeUnit * safeQty);
    const safeTissu = (analysis?.tissuSuggere || 'قماش مخصص ومطابق للمواصفات').trim();
    const safeDelai = (analysis?.delaiEstime || '7 إلى 10 أيام عمل').trim();
    const apiKey = (localStorage.getItem('beya_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY || '').trim();

    // If Gemini API is configured, use it with strict factory advisor constraints
    if (apiKey) {
      try {
        const sysPrompt = `أنت "مستشار ورشة BEYA Creative" لصناعة الملابس والنسيج بالمغرب.
الموديل: ${safeModel}
الكمية: ${safeQty} قطعة
نوع الثوب المقترح: ${safeTissu}
سعر الخياطة التقديري: ${safeUnit} درهم للقطعة (المجموع: ${safeTotal} درهم)
مدة التسليم: ${safeDelai}
أجب باختصار واحترافية وبشكل مفيد بالدارجة المغربية التقنية (أو الفرنسية إذا سأل بها).
اقتصر على: نوع القماش، سعره بسوق درب عمر / كراج علال / القريعة، استهلاك القماش بالامتار، وسعر الخياطة والعينة والتسبيق.
سؤال الزبون: ${query}`;

        const candidateChatModels = ['gemini-2.5-flash', 'gemini-flash-latest'];
        for (const chatMod of candidateChatModels) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${chatMod}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: sysPrompt }] }] })
            });
            if (res.ok) {
              const data = await res.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text && text.trim()) return text.trim();
            }
          } catch (mErr) {}
        }
      } catch (e) {
        console.warn('Gemini call failed, using built-in expert textile engine:', e);
      }
    }

    // Local Resilient Textile Knowledge Engine (Always accurate, zero external dependency)
    // 1. Tissu & Prix marché
    if (/(ثوب|قماش|tissu|tissou|matiere|prix.*tissu|taman.*toub|شحال.*ثوب|نوع.*ثوب|السوق|درب عمر|garage allal|شحال كيدير)/i.test(q)) {
      if (mod.includes('denim') || mod.includes('jean') || mod.includes('جينز') || mod.includes('دنيم')) {
        return isAr
          ? `بخصوص موديل الدنيم/الجينز (${safeModel})، أحسن نوع قماش كننصحو بيه فالورشة هو:
1. **قماش دنيم 100% قطن متين (Toile Denim 12.5oz)**: كيدير فسوق القريعة ودرب عمر بالدار البيضاء بين 34 و 46 درهم للمتر. واقف وما كيموتش فالتصبين.
2. **دنيم قطن ستريتش (Denim Stretch 11.5oz)**: مريح بزاف فالحركة، كيدير بين 36 و 48 درهم للمتر.
3. كل فيست دنيم كتاكل تقريباً 2.10m، وسروال الجينز كياكل 1.45m (والطقم كاملاً كياكل حوالي 3.55m).`
          : `Pour ce modèle en Denim/Jean (${safeModel}), nous conseillons la Toile Denim 100% Coton 12.5oz (34-46 MAD/mètre en gros au marché de Derb Omar et Souk El Kriaa à Casablanca). Consommation : ~2.10m pour la veste, ~1.45m pour le pantalon.`;
      }
      if (mod.includes('jakit') || mod.includes('jacket') || mod.includes('veste') || mod.includes('جاكيت') || mod.includes('bomber')) {
        return isAr
          ? `بخصوص جاكيت ${safeModel}، أحسن نوع ثوب كننصحو بيه فالورشة هو:
1. **غاباردين كوتون متين (Gabardine Coton)**: كيدير فسوق درب عمر وكراج علال بين 35 و 48 درهم للمتر. واقف وما كيموتش فالتصبين.
2. **كوتون تويل (Twill Lourd)**: ثوب نقي وشيك بزاف، كيدير بين 38 و 52 درهم للمتر.
3. **مولطون قطن سميك 340g** (للجاكيتات الرياضية أو ستريتوير): كيدير بين 68 و 75 درهم للكيلو في الجملة.
كل جاكيت كتاكل تقريباً ما بين 1.90m إلى 2.10m.`
          : `Pour la veste ${safeModel}, nous conseillons la Gabardine de Coton (35-48 MAD/m au marché de gros à Casablanca) ou le Twill Coton lourd (38-52 MAD/m). Consommation : ~2.00m par pièce.`;
      }
      if (mod.includes('robe') || mod.includes('abaya') || mod.includes('كسوة') || mod.includes('عباية') || mod.includes('جلابة')) {
        return isAr
          ? `لهاد الموديل، أحسن قماش كيعطي طيحة وانسكاب راقي هو الكريب الحريري (Crêpe Cey / Crêpe de Soie) أو الكتان الطبيعي (Lin). السعر ديالو فالجملة (درب عمر) كيدير ما بين 25 و 42 درهم للمتر. كل بياسة كتاكل ما بين 2.60m و 3.10m.`
          : `Pour ce modèle, le Crêpe fluide ou le Lin naturel est idéal (25-42 MAD/mètre en gros). Consommation : ~2.8m par pièce.`;
      }
      if (mod.includes('hoodie') || mod.includes('sweat') || mod.includes('survet') || mod.includes('بدلة')) {
        return isAr
          ? `لهاد الموديل الرياضي، أحسن ثوب هو المولطون القطني 300g إلى 340g (Molleton Coton Gratté / French Terry). السعر ديالو فالجملة كيدير بين 68 و 74 درهم للكيلو (الكيلو كيخرج بياسة أو بياسة وشوية). ثوب دافئ ومرغوب بزاف.`
          : `Tissu recommandé : Molleton Coton 300-340g (68-74 MAD/kg en gros). Idéal pour le confort et la tenue.`;
      }
      return isAr
        ? `نوع الثوب المقترح لهاد الموديل هو "${safeTissu}". السعر ديالو فأسواق الجملة بالمغرب (درب عمر وكراج علال) كيتراوح ما بين 28 و 48 درهم للمتر حسب الجودة والجراماج.`
        : `Le tissu préconisé est "${safeTissu}" (estimé à 28-48 MAD/mètre en gros à Casablanca).`;
    }

    // 2. Métrage / Consommation
    if (/(ميطراج|metrage|consommation|شحال كياكل|متر|طول الثوب|شحال نشري)/i.test(q)) {
      let meters = '1.80 إلى 2.10 متر';
      if ((mod.includes('denim') || mod.includes('jean') || mod.includes('جينز')) && (mod.includes('ensemble') || mod.includes('طقم'))) meters = '3.40 إلى 3.65 متر (للطقم كاملاً)';
      else if (mod.includes('jakit') || mod.includes('jacket') || mod.includes('veste') || mod.includes('جاكيت')) meters = '1.90 إلى 2.15 متر';
      else if (mod.includes('robe') || mod.includes('كسوة')) meters = '2.50 إلى 2.80 متر';
      else if (mod.includes('abaya') || mod.includes('عباية') || mod.includes('جلابة')) meters = '2.90 إلى 3.20 متر';
      else if (mod.includes('t-shirt') || mod.includes('تيشيرت')) meters = '1.10 إلى 1.25 متر';
      else if (mod.includes('pantalon') || mod.includes('سروال')) meters = '1.40 إلى 1.60 متر';
      else if (mod.includes('survet') || mod.includes('طقم')) meters = '2.80 إلى 3.10 متر (للطقم كاملاً)';

      return isAr
        ? `حسب الباترون والقصة ديال موديل "${safeModel}"، كل قطعة كتاكل تقريباً ما بين **${meters}** (عرض الثوب العادي 1.50m). إيلا بغيتي تشري الثوب من عندك، كنصحوك ديما تزيد 5% كإحتياط للانكماش والقصّان.`
        : `Pour le modèle "${safeModel}", la consommation estimée est de **${meters}** par pièce (laize 1.50m). Prévoyez 5% de marge pour le retrait et la coupe.`;
    }

    // 3. Prix et Quantité
    if (/(taman|prix|سعر|تكلفة|شحال.*خياطة|تخفيض|كونتيتي|كمية|quantite|reduc|remise)/i.test(q)) {
      return isAr
        ? `سعر الخياطة والتصنيع التقديري لهاد الموديل هو **${safeUnit} درهم للقطعة** (على حساب كمية ${safeQty} قطعة). إيلا طلعتي الكمية (مثلاً أكثر من 100 أو 300 قطعة)، السعر كيهبط بـ 10% إلى 18% حيت وقت الفصالة والماكينات كيتوزع على عدد كبير.`
        : `Le coût de confection actuel est de **${safeUnit} MAD/pièce** pour ${safeQty} pcs. Pour un volume supérieur (>100 ou >300 pcs), le tarif unitaire diminue de 10% à 18%.`;
    }

    // 4. Échantillon & Acompte
    if (/(عينة|echantillon|prototype|تسبيق|acompte|avance|خلاص|paiement|rib|واش كترجع|شحال تسبيق)/i.test(q)) {
      const acompteApprox = Math.round(safeTotal * 0.5);
      return isAr
        ? `عندنا فالورشة جوج خيارات واضحين ومريحين:
1. **إيلا جبتي الثوب والمستلزمات من عندك:** **ما كتسبق حتى درهم مسبقاً (0 درهم تسبيق)!** كتصيفط غير الثوب والمستلزمات للورشة، وحنا كنبداو الفصالة والخياطة مباشرة، وما كتخلص حتى تكمل السلعة وتستلمها واجدة بعد مراقبة الجودة وفينيسيون.
2. **إيلا كان المعمل غايتكلف بالثوب والسلعة كاملة:** التسبيق المطلوب هو **50% من قيمة الدوفيز (تقريباً ${acompteApprox.toLocaleString()} درهم)** لشراء رولوات القماش، والباقي (50%) عند التسليم.
(وفالحالتين معاً، إيلا باغي عينة أولية قبل الإنتاج، كتوجد فـ 48 إلى 72 ساعة للتحقق والتجربة، وتكلفتها تخصم 100% من الفاتورة النهائية عند الاعتماد).`
        : `Deux options très claires à l'atelier :
1. **Si vous fournissez le tissu et fournitures :** **Aucun acompte financier requis (0 MAD) !** Vous envoyez simplement le tissu à l'atelier, nous lançons la coupe et confection, et le paiement à 100% s'effectue à la livraison.
2. **Si l'atelier fournit le tissu :** Acompte de **50% (env. ${acompteApprox.toLocaleString()} MAD)** pour l'achat des rouleaux de tissu, et le solde (50%) à la livraison.`;
    }

    // Default general response
    return isAr
      ? `مرحباً بك! أنا مستشار ورشة BEYA Creative. بخصوص موديل "${safeModel}":
- **نوع الثوب المقترح:** ${safeTissu}
- **سعر الخياطة:** ${safeUnit} درهم للقطعة (المجموع: ${safeTotal.toLocaleString()} درهم)
- **مدة التسليم:** ${safeDelai}
تقدر تسولني على: نوع وسعر القماش فالسوق، الميطراج اللي كتاكل البياسة، أو شروط العينة والتسبيق.`
      : `Bonjour ! Pour votre modèle "${safeModel}", le tissu conseillé est "${safeTissu}" (${safeUnit} MAD/pc pour ${safeQty} pcs). N'hésitez pas à me demander le prix du tissu, le métrage ou les modalités d'échantillon.`;
  };

const hasArabic = (s: string) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(s);
const hasLatin = (s: string) => /[a-zA-Z\u00C0-\u024F]/.test(s);

const extractCleanUserNotes = (rawDetails?: string | null): string => {
  if (!rawDetails) return '';
  let text = rawDetails.split('| ATELIER_DEVIS:')[0].trim();
  if (text.startsWith('{') || text.includes('"patronagePrice"') || text.includes('"prixEchantillon"') || text.includes('"tissuConso"') || text.includes('patronagePrice":')) {
    try {
      const obj = JSON.parse(text);
      return obj.notes || obj.remarques || obj.details || obj.userNotes || obj.commentaires || '';
    } catch (e) {
      return '';
    }
  }
  return text;
};

function cleanLangText(text: string | undefined | null, isAr: boolean): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  // 1. If text is already strictly one language
  if (!hasArabic(trimmed) || !hasLatin(trimmed)) {
    if (!isAr && hasArabic(trimmed)) return translateArabicAtelierPhrases(trimmed);
    if (isAr && hasLatin(trimmed)) return translateFrenchAtelierPhrases(trimmed);
    return trimmed;
  }

  // 2. Explicit Language Separator with spaces or double slash: 'Ar / Fr' or 'Ar // Fr' or 'Ar | Fr'
  // NEVER split on units like 'g/m²' or 'MAD/pc' which do NOT have spaces around the slash!
  if (/\s+[\/|]\s+|\s*\/{2,}\s*/.test(trimmed)) {
    const parts = trimmed.split(/\s+[\/|]\s+|\s*\/{2,}\s*/);
    if (parts.length >= 2) {
      if (isAr) {
        const arPart = parts.find(p => hasArabic(p) && !hasLatin(p)) || parts.find(p => hasArabic(p));
        if (arPart) return cleanLangText(arPart, true);
      } else {
        const frPart = parts.find(p => hasLatin(p) && !hasArabic(p)) || parts.find(p => hasLatin(p));
        if (frPart) return cleanLangText(frPart, false);
      }
    }
  }

  // 3. Parentheses resolution: e.g. "Arabic outside (French inside)" or "French outside (Arabic inside)"
  const parenMatches = [...trimmed.matchAll(/\(([^)]+)\)/g)];
  if (parenMatches.length > 0) {
    if (!isAr) {
      // User wants French:
      // If outside is predominantly Arabic and inside has French/Latin
      const latinParens = parenMatches
        .map(m => m[1].trim())
        .filter(inside => hasLatin(inside) && !hasArabic(inside));
      const outsideParen = trimmed.replace(/\([^)]+\)/g, '').trim();

      if (hasArabic(outsideParen) && latinParens.length > 0) {
        return latinParens.join(' • ');
      }
    } else {
      // User wants Arabic:
      // Keep outside Arabic, strip French parentheses
      const outsideParen = trimmed.replace(/\([^)]*[a-zA-Z]{3,}[^)]*\)/g, '').trim().replace(/\s{2,}/g, ' ');
      if (hasArabic(outsideParen)) {
        return outsideParen;
      }
    }
  }

  // 4. Fallback cleanup: strip the unwanted language
  if (!isAr) {
    return translateArabicAtelierPhrases(trimmed);
  } else {
    return translateFrenchAtelierPhrases(trimmed);
  }
}

function translateArabicAtelierPhrases(text: string): string {
  let t = text;
  t = t.replace(/(\d+)\s*(إلى|-)\s*(\d+)\s*يوم\s*عمل/g, (_m, p1, _p2, p3) => `${p1} à ${p3} jours ouvrables`);
  t = t.replace(/(\d+)\s*(إلى|-)\s*(\d+)\s*أيام\s*عمل/g, (_m, p1, _p2, p3) => `${p1} à ${p3} jours ouvrables`);
  t = t.replace(/العينة تحت 48 ساعة/g, 'Échantillon sous 48h');
  t = t.replace(/العينة تحت (\d+)\s*ساعة/g, (_m, p1) => `Échantillon sous ${p1}h`);
  t = t.replace(/يوم عمل/g, 'jour ouvrable');
  t = t.replace(/أيام عمل/g, 'jours ouvrables');
  t = t.replace(/سوق درب عمر \/ القريعة \(الدار البيضاء\)/g, 'Marché Derb Omar (Casablanca)');
  t = t.replace(/سوق درب عمر \/ ليساسفة/g, 'Marché Derb Omar / Lissasfa');
  t = t.replace(/سوق كراج علال \/ درب عمر/g, 'Marché Garage Allal / Derb Omar');
  t = t.replace(/سوق درب عمر/g, 'Marché Derb Omar');
  t = t.replace(/قماش مخصص ومطابق للمواصفات المطلوبة/g, 'Tissu adapté selon cahier des charges');
  t = t.replace(/قصة وخياطة مخصصة بدقة عالية مع معالجة احترافية لكافة التفاصيل/g, 'Patronage et confection sur-mesure de haute précision');
  
  if (hasLatin(t)) {
    t = t.replace(/\([^)]*[\u0600-\u06FF][^)]*\)/g, ' ');
    t = t.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '');
    t = t.replace(/\s*[\/|:-]+\s*$/g, '').replace(/^\s*[\/|:-]+\s*/g, '').replace(/\s{2,}/g, ' ').trim();
  }
  return t;
}

function translateFrenchAtelierPhrases(text: string): string {
  let t = text;
  t = t.replace(/(\d+)\s*(à|-)\s*(\d+)\s*jours?\s*ouvrables?/gi, (_m, p1, _p2, p3) => `${p1} إلى ${p3} يوم عمل`);
  t = t.replace(/Échantillon sous (\d+)h/gi, (_m, p1) => `العينة تحت ${p1} ساعة`);
  t = t.replace(/Tissu adapté selon cahier des charges/gi, 'قماش مخصص ومطابق للمواصفات المطلوبة');
  t = t.replace(/Patronage et confection sur-mesure de haute précision/gi, 'قصة وخياطة مخصصة بدقة عالية مع معالجة احترافية لكافة التفاصيل');
  
  if (hasArabic(t)) {
    t = t.replace(/\([a-zA-Z0-9\s.,'%-]{4,}\)/g, '');
    t = t.replace(/\s*[\/|:-]+\s*$/g, '').replace(/^\s*[\/|:-]+\s*/g, '').replace(/\s{2,}/g, ' ').trim();
  }
  return t;
}

const getDemandeAnalysis = (d: Lead, isAr: boolean) => {
    const text = `${d.type || ''} ${d.details || ''} ${d.id || ''}`.toLowerCase();
    
    let extDetails: any = {};
    try { extDetails = JSON.parse(d.details || '{}'); } catch(e) {}

    // Check custom saved values from database/atelier edit first
    const savedUnitPrice = (d.unitPrice && Number(d.unitPrice) > 0) ? Number(d.unitPrice) : (d.crmPrice && Number(d.crmPrice) > 0) ? Number(d.crmPrice) : null;
    const savedModele = (d.modeleReel && d.modeleReel.trim() && d.modeleReel.toUpperCase() !== 'MODEL' && d.modeleReel !== 'JAKIT' && d.modeleReel !== 'modz') ? d.modeleReel.trim() : null;
    const savedTissu = (d.tissuSuggere && d.tissuSuggere.trim() && !d.tissuSuggere.includes('قماش مخصص ومطابق للمواصفات') && !d.tissuSuggere.includes('Tissu adapté selon cahier')) ? d.tissuSuggere.trim() : null;
    const savedTech = (d.techDetails && d.techDetails.trim() && !d.techDetails.includes('قصة وخياطة مخصصة بدقة عالية مع معالجة')) ? d.techDetails.trim() : null;
    const savedDelai = (d.delaiEstime && d.delaiEstime.trim()) ? d.delaiEstime.trim() : null;
    const savedProgression = d.statusProgression || 'etude';
    const savedReponse = (d.reponseAtelier && d.reponseAtelier.trim()) ? d.reponseAtelier.trim() : null;
    const savedPatronage = (d.patronagePrice && Number(d.patronagePrice) > 0) 
      ? Number(d.patronagePrice) 
      : (extDetails.patronagePrice && Number(extDetails.patronagePrice) > 0)
      ? Number(extDetails.patronagePrice)
      : null;
    const savedEchantillon = (d.prixEchantillon && Number(d.prixEchantillon) > 0) 
      ? Number(d.prixEchantillon) 
      : (extDetails.prixEchantillon && Number(extDetails.prixEchantillon) > 0)
      ? Number(extDetails.prixEchantillon)
      : null;
    const hasCustomPatronage = Boolean(savedPatronage && savedPatronage > 0);
    const hasCustomEchantillon = Boolean(savedEchantillon && savedEchantillon > 0);

    // Detect Clothing Categories
    const isDenimOrTailleur = (
      text.includes('modz') ||
      text.includes('denim') ||
      text.includes('jean') ||
      text.includes('tailleur') ||
      text.includes('ceintur') ||
      d.id?.toLowerCase().includes('7eea2877')
    );
    const isTracksuit = !isDenimOrTailleur && (text.includes('survet') || text.includes('survêtement') || text.includes('tracksuit') || text.includes('ensemble') || text.includes('بدلة') || text.includes('طقم') || d.id?.toLowerCase().includes('49606be7'));
    const isHoodieOrSweat = !isTracksuit && !isDenimOrTailleur && (text.includes('hoodie') || text.includes('sweat') || text.includes('capuche') || text.includes('9f2f3e3') || (d.type?.toLowerCase() === 't-shirt' && (d.id?.toLowerCase().includes('9f2f3e3') || text.includes('vert') || text.includes('amour') || text.includes('green'))));
    const isTshirt = !isTracksuit && !isHoodieOrSweat && !isDenimOrTailleur && (text.includes('t-shirt') || text.includes('tshirt') || text.includes('tee') || text.includes('تيشرت') || text.includes('تيشيرت'));
    const isPolo = !isTracksuit && !isDenimOrTailleur && (text.includes('polo') || text.includes('بولو'));
    const isPants = !isTracksuit && !isDenimOrTailleur && (text.includes('pantalon') || text.includes('jogging') || text.includes('cargo') || text.includes('سروال'));
    const isVeste = !isTracksuit && !isDenimOrTailleur && (
      text.includes('veste') || 
      text.includes('jacket') || 
      text.includes('jakit') || 
      text.includes('jakita') || 
      text.includes('bomber') || 
      text.includes('blouson') || 
      text.includes('جاكيت') || 
      text.includes('فيست') || 
      text.includes('كابوت') || 
      text.includes('manteau') || 
      text.includes('windbreaker') ||
      d.id?.toLowerCase().includes('d1fbca4c')
    );

    let defaultModele = d.type && d.type.toUpperCase() !== 'MODEL' ? d.type : (isAr ? 'موديل تفصيل وخياطة مخصص' : 'Modèle Confection Sur-Mesure');
    let defaultTissu = isAr ? 'قماش مخصص ومطابق للمواصفات المطلوبة' : 'Tissu adapté selon cahier des charges';
    let defaultTech = isAr ? 'قصة وخياطة مخصصة بدقة عالية مع معالجة احترافية لكافة التفاصيل' : 'Patronage et confection sur-mesure de haute précision';
    let defaultUnitPrice = 65;
    let defaultDelai = isAr ? '7 إلى 10 أيام عمل (العينة تحت 48 ساعة)' : '7 - 10 jours ouvrables (Échantillon sous 48h)';
    let defaultProgression: 'reception' | 'etude' | 'echantillon' | 'production' | 'pret' = 'etude';
    let defaultReponse = isAr
      ? 'تمت دراسة مواصفات طلبكم بعناية من طرف الورشة: الباترون جاهز للإعداد ونحن رهن إشارتكم لتأكيد العينة الأولية.'
      : 'Modèle examiné avec soin par notre atelier : prêt pour prototypage dès validation de votre part.';

    let defaultPatronage = 250;
    let defaultEchantillon = 350;
    let defaultTissuConso = 1.85;
    let defaultTissuPrixKg = 68;
    let defaultPrixMetre = 40;
    let defaultAccessoriesCost = 15;
    let defaultPrixConfection = 65;
    let defaultTissuMarche = isAr ? 'سوق درب عمر / القريعة (الدار البيضاء)' : 'Marché de gros Derb Omar';

    if (isTracksuit) {
      defaultModele = isAr ? 'طقم بدلة رياضية (فيست بسحاب وسروال)' : 'Ensemble Survêtement Veste Zippée + Pantalon (2 Pièces)';
      defaultTissu = isAr ? 'مولطون قطن بوليستر 300 غرام مع شريط جانبي أبيض' : 'Molleton Coton/Polyester 300g avec bandes contrastées blanches';
      defaultTech = isAr ? 'فيست بسحاب معدني وجيوب جانبية • ياقة مرتفعة • سروال بخصر مطاطي وباندات في الأسفل • شريط رياضي جانبي' : 'Veste zippée col montant avec poches • Bandes contrastées • Pantalon taille élastique et chevilles resserrées';
      defaultUnitPrice = 135;
      defaultDelai = isAr ? '8 - 12 يوم عمل (العينة تحت 48 ساعة)' : '8 - 12 jours ouvrables (Échantillon sous 48h)';
      defaultPatronage = 380;
      defaultEchantillon = 450;
      defaultTissuConso = 2.85;
      defaultTissuPrixKg = 68;
      defaultPrixMetre = 40;
      defaultAccessoriesCost = 18;
      defaultPrixConfection = 95;
      defaultTissuMarche = isAr ? 'سوق درب عمر (مولطون 300g قطن بوليستر)' : 'Marché Derb Omar (Molleton 300g)';
      defaultReponse = isAr
        ? 'تمت دراسة موديل البدلة الرياضية (2 قطع): ثوب المولطون 300g مع السحاب والشرائط الجانبية تم حسابهما بدقة. السعر (135 درهم) يشمل الطقم كاملاً (الفوق والسروال). جاهزون لإطلاق العينة الأولية فور تأكيدكم.'
        : "Modèle Ensemble Survêtement (2 pièces) étudié par l'atelier : Molleton 300g avec zip et bandes latérales calculés avec précision. Le tarif (135 MAD) comprend l'ensemble complet veste + pantalon. Prototype prêt à lancer.";
    } else if (isHoodieOrSweat) {
      defaultModele = isAr ? 'هودي بقبعة أوفرسايز مع سيريغرافي في الصدر' : 'Hoodie à Capuche Oversize avec Sérigraphie Poitrine';
      defaultTissu = isAr ? 'مولطون قطن 320 غرام مبطن عالي الجودة' : 'Molleton Coton Gratté 320g / French Terry (~1.85m)';
      defaultTech = isAr ? 'قبعة مبطنة بحبال • جيب كانغورو • حواف مرنة متينة • سيريغرافي عالي الجودة على الصدر' : 'Capuche doublée avec cordons • Sérigraphie Poitrine • Bord-côte poignets et bas';
      defaultUnitPrice = 75;
      defaultDelai = isAr ? '7 - 10 أيام عمل (العينة تحت 48 ساعة)' : '7 - 10 jours ouvrables (Échantillon sous 48h)';
      defaultPatronage = 260;
      defaultEchantillon = 350;
      defaultTissuConso = 1.85;
      defaultTissuPrixKg = 68;
      defaultPrixMetre = 38;
      defaultAccessoriesCost = 15;
      defaultPrixConfection = 55;
      defaultTissuMarche = isAr ? 'سوق درب عمر / ليساسفة (مولطون 320g)' : 'Marché Derb Omar (Molleton 320g)';
      defaultReponse = isAr
        ? 'موديل الهودي تم تحليله بالكامل: ثوب المولطون 320g ممتاز لهذا التصميم مع طباعة الصدر. العينة التقنية جاهزة للإطلاق فور التأكيد.'
        : 'Modèle Hoodie analysé par notre atelier : tissu Molleton 320g validé avec marquage poitrine. Prototype prêt à lancer.';
    } else if (isTshirt) {
      defaultModele = isAr ? 'تيشيرت قطن ممشط 100%' : 'T-Shirt Coton Peigné Col Rond 100% Coton';
      defaultTissu = isAr ? 'جيرسي قطن ممشط 200g - 220g' : 'Jersey 100% Coton Peigné 200g - 220g';
      defaultTech = isAr ? 'ياقة دائرية بورد-كوط • خياطة مزدوجة • شريط نظافة داخلي' : 'Col rond bord-côte • Double surpiqûre • Bande de propreté';
      defaultUnitPrice = 45;
      defaultDelai = isAr ? '5 - 7 أيام عمل' : '5 - 7 jours ouvrables';
      defaultPatronage = 180;
      defaultEchantillon = 250;
      defaultTissuConso = 1.15;
      defaultTissuPrixKg = 72;
      defaultPrixMetre = 28;
      defaultAccessoriesCost = 8;
      defaultPrixConfection = 28;
      defaultTissuMarche = isAr ? 'سوق درب عمر (جيرسي 100% قطن ممشط)' : 'Marché Derb Omar (Jersey 100% Coton)';
      defaultReponse = isAr
        ? 'تمت دراسة موديل التيشيرت: ثوب الجيرسي 100% قطن ممشط عالي الجودة، جاهز للخياطة والطباعة.'
        : 'Modèle T-shirt analysé : jersey 100% coton peigné de qualité supérieure, prêt pour confection.';
    } else if (isPolo) {
      defaultModele = isAr ? 'قميص بولو كلاسيك قطن' : 'Polo Piqué Coton Peigné';
      defaultTissu = isAr ? 'بيكي قطن 220 غرام' : 'Maille Piquée 100% Coton 220g';
      defaultTech = isAr ? 'ياقة وأساور بورد-كوط منسوجة • فتحة بزرين • شق جانبي سفلي' : 'Col et bas de manches en côte • Patte de boutonnage 2 boutons • Fentes latérales';
      defaultUnitPrice = 65;
      defaultDelai = isAr ? '7 - 10 أيام عمل' : '7 - 10 jours ouvrables';
      defaultPatronage = 220;
      defaultEchantillon = 280;
      defaultTissuConso = 1.30;
      defaultTissuPrixKg = 70;
      defaultPrixMetre = 34;
      defaultAccessoriesCost = 12;
      defaultPrixConfection = 38;
      defaultTissuMarche = isAr ? 'سوق درب عمر (بيكي 100% قطن)' : 'Marché Derb Omar (Piqué)';
    } else if (isPants) {
      defaultModele = isAr ? 'سروال جوغينغ كاجوال' : 'Pantalon Jogging / Survêtement Confort';
      defaultTissu = isAr ? 'مولطون قطن 300 غرام' : 'Molleton Coton 300g';
      defaultTech = isAr ? 'حزام مطاطي • جيوب جانبية • أطراف ريزيستنت' : 'Ceinture élastiquée avec cordon • Poches passepoilées • Bas resserré';
      defaultUnitPrice = 68;
      defaultDelai = isAr ? '6 - 9 أيام عمل' : '6 - 9 jours ouvrables';
      defaultPatronage = 240;
      defaultEchantillon = 320;
      defaultTissuConso = 1.45;
      defaultTissuPrixKg = 68;
      defaultPrixMetre = 38;
      defaultAccessoriesCost = 14;
      defaultPrixConfection = 48;
      defaultTissuMarche = isAr ? 'سوق درب عمر (مولطون قطن)' : 'Marché Derb Omar';
    } else if (isVeste) {
      defaultModele = isAr ? 'جاكيت رياضية تقنية بسحاب ومقاومة للرياح' : 'Veste Sport Coupe-Vent Zippée';
      defaultTissu = isAr ? 'مايكروفايبر تقني مقاوم للرياح والماء' : 'Microfibre Coupe-Vent Imperméable / Nylon Twill Lourd';
      defaultTech = isAr ? 'سحاب أمامي كامل مقاوم للماء • جيبين جانبيين بسحاب مخفي • ياقة مرتفعة مع أكمام مطاطية مرنة • خياطة تقنية مع شريط نظافة داخلي' : 'Fermeture zippée métallique intégrale étanche • Poches zippées invisibles • Col montant et poignets élastiqués';
      defaultUnitPrice = 95;
      defaultDelai = isAr ? '7 - 10 أيام عمل (العينة تحت 48 ساعة)' : '7 - 10 jours ouvrables (Échantillon sous 48h)';
      defaultPatronage = 300;
      defaultEchantillon = 380;
      defaultTissuConso = 2.10;
      defaultTissuPrixKg = 75;
      defaultPrixMetre = 42;
      defaultAccessoriesCost = 22;
      defaultPrixConfection = 75;
      defaultTissuMarche = isAr ? 'سوق كراج علال / درب عمر (مايكروفايبر تقني مقاوم للماء)' : 'Marché Derb Omar (Microfibre étanche)';
      defaultReponse = isAr
        ? 'موديل الجاكيت التقنية تم تحليله بالكامل من الورشة: ثوب المايكروفايبر المقاوم للماء مع السحاب والبطانة تم تسعيرهم بدقة. العينة جاهزة للإطلاق فور التأكيد.'
        : 'Veste coupe-vent analysée par l\'atelier : microfibre imperméable et zips validés. Prototype prêt à lancer.';
    } else if (isDenimOrTailleur) {
      defaultModele = isAr ? 'طقم فيست دنيم عصري بحزام وبنطلون' : 'Ensemble Veste Tailleur Denim Ceinturée';
      defaultTissu = isAr ? 'ثوب دنيم جينز 100% قطن متين 11-12 أونصة معالجة ناعمة' : 'Toile Denim 100% Coton 11-12oz / Twill Jeans Lourd';
      defaultTech = isAr ? 'قصة جاكيت مفصلة مع حزام خصر مدمج وحلقة معدنية • درزات مضاعفة بخيط الجينز المتين • ياقة كلاسيكية مفتوحة وأكتاف مضبوطة' : 'Veste tailleur avec ceinture intégrée boucle métal • Double surpiqûre fil jean • Col tailleur et emmanchures renforcées';
      defaultUnitPrice = 115;
      defaultDelai = isAr ? '8 - 12 يوم عمل (العينة تحت 48 ساعة)' : '8 - 12 jours ouvrables (Échantillon sous 48h)';
      defaultPatronage = 350;
      defaultEchantillon = 420;
      defaultTissuConso = 2.40;
      defaultTissuPrixKg = 75;
      defaultPrixMetre = 48;
      defaultAccessoriesCost = 35;
      defaultPrixConfection = 115;
      defaultTissuMarche = isAr ? 'سوق درب عمر / القريعة (توب الدنيم الخام والجاف)' : 'Marché Derb Omar / Al Ghorfa (Denim brut)';
      defaultReponse = isAr
        ? 'تمت دراسة موديل فيست الجينز/الدنيم بعناية من طرف الورشة: ثوب الدنيم 100% قطن متين مع تفاصيل الحزام والدرزات المضاعفة محسوبة بدقة. جاهزون لإطلاق العينة الأولية فور تأكيدكم.'
        : 'Modèle Veste Denim étudié avec soin : toile 100% coton et finitions ceinture calculées. Prêt pour prototypage.';
    }

    const hasBroderie = text.includes('broderie') || text.includes('طرز') || text.includes('طريزة') || text.includes('brodé') || text.includes('brode');
    const hasPrint = text.includes('sérigraphie') || text.includes('serigraphie') || text.includes('dtf') || text.includes('print') || text.includes('طباعة') || text.includes('طبعة') || text.includes('marquage') || isHoodieOrSweat || isTshirt;

    const isGenericPrice = savedUnitPrice === 65 && !d.crmPriceConfirmed && (isVeste || isDenimOrTailleur || isTracksuit);
    const tissuCostPerPiece = Math.round(defaultTissuConso * defaultPrixMetre);
    let confectionPrice = defaultPrixConfection;
    let fullPackagePrice = defaultPrixConfection + tissuCostPerPiece + defaultAccessoriesCost;

    if (savedUnitPrice && !isGenericPrice) {
      if (savedUnitPrice > 130) {
        fullPackagePrice = savedUnitPrice;
        confectionPrice = Math.max(35, savedUnitPrice - tissuCostPerPiece - defaultAccessoriesCost);
      } else {
        confectionPrice = savedUnitPrice;
        fullPackagePrice = savedUnitPrice + tissuCostPerPiece + defaultAccessoriesCost;
      }
    }

    const unitPrice = confectionPrice;
    const rawModele = savedModele || defaultModele;
    const rawTissu = savedTissu || defaultTissu;
    const rawTech = savedTech || defaultTech;
    const rawDelai = savedDelai || defaultDelai;
    const rawReponse = savedReponse || defaultReponse;

    const modeleReel = cleanLangText(rawModele, isAr);
    const tissuSuggere = cleanLangText(rawTissu, isAr);
    const techDetails = cleanLangText(rawTech, isAr);
    const delaiEstime = cleanLangText(rawDelai, isAr);
    const reponseAtelier = cleanLangText(rawReponse, isAr);
    const tissuMarcheNom = cleanLangText(defaultTissuMarche, isAr);

    const qty = Number(d.quantity) > 0 ? Number(d.quantity) : 100;
    const totalPrice = d.totalPrice && d.totalPrice > 0 ? d.totalPrice : (fullPackagePrice * qty);
    const statusProgression = savedProgression;
    const patronagePrice = savedPatronage || defaultPatronage;
    const echantillonPrice = savedEchantillon || defaultEchantillon;

    return {
      modeleReel,
      unitPrice,
      confectionPrice,
      fullPackagePrice,
      tissuCostPerPiece,
      accessoriesCost: defaultAccessoriesCost,
      prixMetreEstime: defaultPrixMetre,
      tissuMarcheNom,
      totalPrice,
      tissuSuggere,
      techDetails,
      delaiEstime,
      statusProgression,
      reponseAtelier,
      qty,
      patronagePrice,
      echantillonPrice,
      hasCustomPatronage,
      hasCustomEchantillon,
      tissuConsoMeters: defaultTissuConso,
      tissuPricePerKg: defaultTissuPrixKg,
      hasBroderie,
      hasPrint,
      isAnalyzedByAI: Boolean(d.details?.includes('ATELIER_DEVIS') || d.aiNotes || (d as any).aiAnalyzed)
    };
  };

  const getLeadSizes = (d: Lead) => {
    let sizes: Record<string, number> = {};
    if (d.tailles && typeof d.tailles === 'object') {
      Object.entries(d.tailles).forEach(([k, v]) => {
        const n = Number(v);
        if (n > 0) sizes[k] = n;
      });
    } else if (d.sizes) {
      try {
        const parsed = typeof d.sizes === 'string' ? JSON.parse(d.sizes) : d.sizes;
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            const n = Number(v);
            if (n > 0) sizes[k] = n;
          });
        }
      } catch(e) {}
    }
    return sizes;
  };

  const handleSaveQuickEdit = async () => {
    if (!atelierQuickEditLead) return;
    setSavingQuickEdit(true);
    try {
      let extDetails: any = {};
      try { extDetails = JSON.parse(atelierQuickEditLead.details || '{}'); } catch(e) {}
      extDetails.patronagePrice = Number(quickEditForm.patronagePrice);
      extDetails.prixEchantillon = Number(quickEditForm.prixEchantillon);
      extDetails.patronageStatus = 'priced';

      const updatedLead: Lead = {
        ...atelierQuickEditLead,
        details: JSON.stringify(extDetails),
        modeleReel: quickEditForm.modeleReel,
        unitPrice: Number(quickEditForm.unitPrice),
        totalPrice: Number(quickEditForm.unitPrice) * (atelierQuickEditLead.quantity || 100),
        patronagePrice: Number(quickEditForm.patronagePrice),
        prixEchantillon: Number(quickEditForm.prixEchantillon),
        tissuSuggere: quickEditForm.tissuSuggere,
        techDetails: quickEditForm.techDetails,
        delaiEstime: quickEditForm.delaiEstime,
        statusProgression: quickEditForm.statusProgression,
        reponseAtelier: quickEditForm.reponseAtelier,
        reponseAtelierDate: new Date().toISOString()
      };
      await saveRecord('leads', updatedLead);
      setMesDemandes(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      setSelectedDemandePage(prev => prev?.id === updatedLead.id ? updatedLead : prev);
      setAtelierQuickEditLead(null);
    } catch (err) {
      console.error(err);
      alert(isAr ? 'وقع خطأ في الحفظ' : "Erreur lors de l'enregistrement");
    } finally {
      setSavingQuickEdit(false);
    }
  };

  const openQuickEdit = (lead: Lead) => {
    const analysis = getDemandeAnalysis(lead, isAr);
    setAtelierQuickEditLead(lead);
    setQuickEditForm({
      modeleReel: analysis.modeleReel,
      patronagePrice: analysis.hasCustomPatronage ? analysis.patronagePrice : (analysis.patronagePrice || 250),
      prixEchantillon: analysis.hasCustomEchantillon ? analysis.echantillonPrice : (analysis.echantillonPrice || 350),
      unitPrice: analysis.unitPrice,
      totalPrice: analysis.totalPrice,
      tissuSuggere: analysis.tissuSuggere,
      techDetails: analysis.techDetails,
      delaiEstime: analysis.delaiEstime,
      statusProgression: analysis.statusProgression,
      reponseAtelier: analysis.reponseAtelier
    });
  };

  const handleDemandeAnnulation = async () => {
    if (!annulationModal) return;
    setAnnulationSending(true);
    try {
      const cmd = found.find(c => c.id === annulationModal.cmdId);
      if (!cmd) return;
      const updated = { ...cmd, statut: 'annulation_demandee' as any, annulationRaison: annulationRaison || 'Raison non précisée' };
      await saveRecord('commandes', updated);
      setFound(prev => prev.map(c => c.id === annulationModal.cmdId ? updated : c));
      // Notify admin
      try {
        const { sendPushToAll } = await import('../utils/pushNotifications');
        sendPushToAll(
          isAr ? '⚠️ طلب إلغاء طلبية' : '⚠️ Demande d\'annulation',
          `${cmd.client} — ${cmd.reference}`,
          '/commandes'
        );
      } catch (_) {}
      setAnnulationModal(null);
      setAnnulationRaison('');
    } catch (err) {
      console.error(err);
    } finally {
      setAnnulationSending(false);
    }
  };

  const handleUploadPreuveClient = async (factureId: string, file: File) => {
    setUploadingPreuve(factureId);
    try {
      const compressed = await compressImage(file);
      const updated = factures.map(f => f.id === factureId
        ? { ...f, preuveClient: compressed, statut: 'en_verification' as const }
        : f
      );
      setFactures(updated);
      const facture = updated.find(f => f.id === factureId);
      if (facture) {
        await saveRecord('factures', { ...facture, preuveClient: compressed, statut: 'en_verification' }, true);
        // Notify admin
        try {
          const { sendPushToAll } = await import('../utils/pushNotifications');
          sendPushToAll(
            isAr ? '💳 إثبات دفع جديد' : '💳 Nouvelle preuve de paiement',
            `${facture.client} — ${facture.numero}`,
            '/recus'
          );
        } catch (_) {}
      }
    } catch (err) {
      console.error('Upload preuve failed:', err);
    } finally {
      setUploadingPreuve(null);
    }
  };

  const handleOrderPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file).then(res => { setNewOrderForm({ ...newOrderForm, photo: res }); }).catch(console.error);
    }
  };

  const submitNewOrder = async () => {
    if (!newOrderForm.modele || !newOrderForm.quantite || !currentUser) return;
    
    if (!newOrderForm.photo) {
      alert(isAr ? "من فضلك أضف صورة الموديل (إجباري)" : "Veuillez ajouter une photo du modèle (Obligatoire)");
      return;
    }

    setSendingOrder(true);
    
    try {
      const sizeQuantities: Record<string, number> = {};
      Object.entries(newOrderForm.tailles).forEach(([s, q]) => {
        if (q && parseInt(q) > 0) sizeQuantities[s] = parseInt(q);
      });

      const pastPhone = mesDemandes.find(d => d.phone && d.phone.trim() !== '')?.phone || '';
      const pastPhone2 = mesDemandes.find(d => d.phone2 && d.phone2.trim() !== '')?.phone2 || '';

      const leadPayload: any = {
        name: currentUser.nom,
        email: currentUser.email || '',
        phone: currentUser.telephone || pastPhone || newOrderForm.telephone || '',
        phone2: pastPhone2,
        ville: '',
        type: newOrderForm.modele,
        quantity: parseInt(newOrderForm.quantite) || 100,
        photo: newOrderForm.photo,
        details: newOrderForm.details,
        tailles: sizeQuantities
      };

      // Auto AI analysis if photo and Gemini key exist to accurately set fabric and cost
      if (newOrderForm.photo && geminiApiKey) {
        try {
          const aiResult = await analyzeLeadPhotoWithAI({
            modele: newOrderForm.modele,
            details: newOrderForm.details,
            photo: newOrderForm.photo
          });
          if (aiResult) {
            leadPayload.modeleReel = aiResult.modeleReel;
            leadPayload.tissuSuggere = aiResult.tissuSuggere;
            leadPayload.unitPrice = aiResult.unitPrice;
            leadPayload.crmPrice = aiResult.unitPrice;
            leadPayload.patronagePrice = aiResult.patronagePrice;
            leadPayload.prixEchantillon = aiResult.prixEchantillon;
            leadPayload.delaiEstime = aiResult.delaiEstime;
            leadPayload.techDetails = aiResult.techDetails;
            leadPayload.reponseAtelier = aiResult.reponseAtelier;

            const atelierMeta = {
              modeleReel: aiResult.modeleReel,
              tissuSuggere: aiResult.tissuSuggere,
              unitPrice: aiResult.unitPrice,
              patronagePrice: aiResult.patronagePrice,
              prixEchantillon: aiResult.prixEchantillon,
              delaiEstime: aiResult.delaiEstime,
              techDetails: aiResult.techDetails,
              reponseAtelier: aiResult.reponseAtelier
            };
            leadPayload.details = `${leadPayload.details || ''} | ATELIER_DEVIS:${JSON.stringify(atelierMeta)}`.trim();
          }
        } catch (e) {
          console.warn('AI analysis on new lead submit:', e);
        }
      }

      // Explicitly delete non-schema columns from leadPayload to prevent schema cache errors
      delete leadPayload.delaiEstime;
      delete leadPayload.modeleReel;
      delete leadPayload.tissuSuggere;
      delete leadPayload.techDetails;
      delete leadPayload.reponseAtelier;
      delete leadPayload.patronagePrice;
      delete leadPayload.prixEchantillon;
      
      if (editingDemandeId) {
         leadPayload.id = editingDemandeId;
         const existing = mesDemandes.find(d => d.id === editingDemandeId);
         if (!leadPayload.details?.includes('ATELIER_DEVIS') && existing?.details?.includes('ATELIER_DEVIS')) {
           const existingAtelierPart = existing.details.substring(existing.details.indexOf('| ATELIER_DEVIS:'));
           leadPayload.details = `${leadPayload.details || ''} ${existingAtelierPart}`.trim();
         }
         const updatedLead = existing ? { ...existing, ...leadPayload } : leadPayload;
         await saveRecord('leads', updatedLead);
         setMesDemandes(prev => prev.map(m => m.id === editingDemandeId ? updatedLead : m));
         setSelectedDemandePage(prev => prev?.id === editingDemandeId ? updatedLead : prev);
         if (newOrderForm.photo) {
           handlePhotoLoaded(editingDemandeId, newOrderForm.photo);
         }
      } else {
         const newId = genId();
         const newLead = {
           ...leadPayload,
           id: newId,
           crmStage: 'nouveau',
           date: new Date().toISOString()
         };

         // Instantly update leadPhotos & cache BEFORE async save so UI has the photo at 0ms!
         if (newOrderForm.photo) {
           handlePhotoLoaded(newId, newOrderForm.photo);
         }

         const createdLead = await saveLead(newLead);
         const finalLead = {
           ...(createdLead || newLead),
           photo: newOrderForm.photo || (createdLead as any)?.photo
         };

         if (finalLead.id && finalLead.id !== newId && newOrderForm.photo) {
           handlePhotoLoaded(finalLead.id, newOrderForm.photo);
         }

         setMesDemandes(prev => [finalLead, ...prev.filter(p => p.id !== finalLead.id && p.id !== newId)]);
         setActiveTab('demandes');
      }

      // Track Facebook Pixel Lead event
      trackPixelEvent('Lead', {
        content_name: newOrderForm.modele,
        content_category: 'Client Portal Lead',
        value: parseInt(newOrderForm.quantite) || 1,
        currency: 'MAD'
      });
      
      setOrderSent(true);
      setTimeout(() => {
        setOrderSent(false);
        setShowNewOrderModal(false);
        setNewOrderForm({ 
          modele: '', 
          quantite: '', 
          details: '', 
          photo: null,
          telephone: currentUser?.telephone || pastPhone || '',
          tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' }
        });
      }, 2000);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      if (isJwtExpiredError(err)) {
        try {
          console.warn("[submitNewOrder] Recovering expired JWT session and retrying...");
          await recoverExpiredJwt();
          if (editingDemandeId) {
             leadPayload.id = editingDemandeId;
             const existing = mesDemandes.find(d => d.id === editingDemandeId);
             const updatedLead = existing ? { ...existing, ...leadPayload } : leadPayload;
             await saveRecord('leads', updatedLead);
             setMesDemandes(prev => prev.map(m => m.id === editingDemandeId ? updatedLead : m));
             setSelectedDemandePage(prev => prev?.id === editingDemandeId ? updatedLead : prev);
             if (newOrderForm.photo) {
               handlePhotoLoaded(editingDemandeId, newOrderForm.photo);
             }
          } else {
             const newId = genId();
             const newLead = {
               ...leadPayload,
               id: newId,
               crmStage: 'nouveau',
               date: new Date().toISOString()
             };
             if (newOrderForm.photo) {
               handlePhotoLoaded(newId, newOrderForm.photo);
             }
             const createdLead = await saveLead(newLead);
             const finalLead = {
               ...(createdLead || newLead),
               photo: newOrderForm.photo || (createdLead as any)?.photo
             };
             if (finalLead.id && finalLead.id !== newId && newOrderForm.photo) {
               handlePhotoLoaded(finalLead.id, newOrderForm.photo);
             }
             setMesDemandes(prev => [finalLead, ...prev.filter(p => p.id !== finalLead.id && p.id !== newId)]);
             setActiveTab('demandes');
          }
          setOrderSent(true);
          setTimeout(() => {
            setOrderSent(false);
            setShowNewOrderModal(false);
            setNewOrderForm({ 
              modele: '', 
              quantite: '', 
              details: '', 
              photo: null,
              telephone: currentUser?.telephone || pastPhone || '',
              tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' }
            });
          }, 2000);
          return;
        } catch (retryErr: any) {
          console.error("Retry after recovery failed:", retryErr);
        }
      }
      alert(isAr ? "وقع خطأ فإرسال الطلب: " + err.message : "Erreur lors de l'envoi : " + err.message);
    } finally {
      setSendingOrder(false);
    }
  };

  function getPhaseIndex(phase: string): number {
    return PHASE_ORDER.indexOf(phase as any);
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 ${isAr ? 'right-0' : 'left-0'} z-[101] w-72 lg:w-80 bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')
      } lg:block shadow-2xl`}>
        <div className="flex flex-col h-full justify-between overflow-y-auto custom-scrollbar">
          {/* Top Brand & Nav */}
          <div className="p-4 lg:p-5">
            {/* Logo Row */}
            <div className="flex items-center justify-between mb-6 px-1 pt-2">
              <LogoWithFallback src={company.logoClient || company.logoUrl} alt={company.name} />
              <button 
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2">
              {[
                { id: 'overview', icon: <Globe className="w-5 h-5 shrink-0" />, label: isAr ? 'نظرة عامة' : 'Vue d\'ensemble' },
                { id: 'demandes', icon: <MessageCircle className="w-5 h-5 shrink-0" />, label: isAr ? 'طلباتي' : 'Mes Demandes' },
                { id: 'orders', icon: <Package className="w-5 h-5 shrink-0" />, label: isAr ? 'طلبياتي' : 'Mes Commandes' },
                ...(isNetworkPilotUser ? [
                  { 
                    id: 'network', 
                    icon: <Users className="w-5 h-5 shrink-0 text-amber-400" />, 
                    label: 'BEYA NETWORK', 
                    badge: 'VIP' 
                  }
                ] : []),
                { id: 'docs', icon: <Receipt className="w-5 h-5 shrink-0" />, label: isAr ? 'الفواتير والوثائق' : 'Factures & Docs' },
                { id: 'payments', icon: <CreditCard className="w-5 h-5 shrink-0" />, label: isAr ? 'الدفع والأداء' : 'Paiements' },
                { id: 'support', icon: <Bell className="w-5 h-5 shrink-0" />, label: isAr ? 'الدعم الفني VIP' : 'Support VIP' },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'network') {
                        window.location.hash = '#/network';
                      } else {
                        setActiveTab(item.id as any);
                      }
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/35 ring-1 ring-white/15 scale-[1.02]' 
                        : 'text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {(item as any).badge && (
                      <span className="px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-xs shrink-0">
                        {(item as any).badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Profile & Actions */}
          <div className="p-4 border-t border-white/10 space-y-2.5 bg-slate-900/95">
             {currentUser && (
               <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                 <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 text-sm font-black border border-indigo-500/30 shrink-0">
                   {currentUser.nom[0]}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate uppercase tracking-tight text-white">{currentUser.nom}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{isAr ? 'زبون ممتاز' : 'Client Premium'}</p>
                 </div>
               </div>
             )}

             <button 
                onClick={() => {
                  try {
                    localStorage.setItem('beya_builder_mode', 'dashboard');
                    window.location.hash = '#/store-builder';
                  } catch {
                    window.location.href = '/#/store-builder';
                  }
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wide transition-all border border-amber-500/30 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Store className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">{isAr ? 'الانتقال إلى BEYA STORE' : 'Accéder à BEYA STORE'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full py-2.5 px-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-1.5 cursor-pointer"
                  title={isAr ? 'تغيير كلمة المرور' : 'Modifier mot de passe'}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{isAr ? 'كلمة المرور' : 'Mot de passe'}</span>
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full py-2.5 px-2 bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border border-transparent hover:border-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  title={isAr ? 'تسجيل الخروج' : 'Déconnexion'}
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isAr ? 'خروج' : 'Déconnexion'}</span>
                </button>
              </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ${isAr ? 'lg:mr-72 xl:mr-80' : 'lg:ml-72 xl:ml-80'} min-h-screen relative`}>
        {/* Top Header */}
        <header className="h-16 md:h-24 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-3 md:px-10 sticky top-0 z-40">
           <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl border border-slate-200"
              >
                <Layers className="w-5 h-5" />
              </button>
              <h2 className="text-base md:text-2xl font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">
                {activeTab === 'overview' ? (isAr ? 'لوحة التحكم' : 'Tableau de Bord') :
                 activeTab === 'demandes' ? (isAr ? 'تتبع طلباتي' : 'Mes Demandes') :
                 activeTab === 'orders' ? (isAr ? 'الطلبيات' : 'Commandes') :
                 activeTab === 'network' ? 'BEYA NETWORK 🌐' :
                 activeTab === 'payments' ? (isAr ? 'الدفع والأداء' : 'Paiements') :
                 activeTab === 'docs' ? (isAr ? 'الوثائق' : 'Documents') :
                 activeTab === 'info' ? (isAr ? 'معلومات وأسعار' : 'Infos & Prix') :
                 (isAr ? 'الدعم' : 'Support')}
              </h2>
           </div>
           
           <div className="flex items-center gap-3 sm:gap-4">
              


              <button 
                onClick={() => window.location.reload()}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                title={isAr ? 'تحديث الصفحة' : 'Actualiser la page'}
              >
                <RotateCw className="w-5 h-5" />
              </button>
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => {
                    setApiKeyDraft(geminiApiKey);
                    setApiKeyTestResult(null);
                    setShowApiKeyModal(true);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  title="Admin Gemini Config"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                  </span>
                </button>
              )}
              <button onClick={toggle} className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                 {isAr ? 'FR' : 'عربية'}
              </button>
              {canInstall && !isInstalled && (
                <button
                  onClick={promptInstall}
                  title={isAr ? 'تثبيت كتطبيق مستقل على الهاتف' : 'Installer comme application'}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-md active:scale-95 animate-pulse"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAr ? 'تثبيت APP' : 'Installer'}</span>
                </button>
              )}
              
              <div className="relative">
                 <button 
                   onClick={() => setShowNotifs(!showNotifs)}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                     showNotifs ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                   }`}
                 >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                 </button>

                 {showNotifs && (
                   <>
                     <div className="fixed inset-0 z-10" onClick={() => setShowNotifs(false)} />
                     <div className={`absolute top-full mt-4 ${isAr ? 'left-0' : 'right-0'} w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300`}>
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                           <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">{isAr ? 'آخر التحديثات' : 'Notifications'}</h3>
                           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest">New</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                           {found.flatMap(cmd => (cmd.suivi || []).map(s => ({ ...s, cmdRef: cmd.reference }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((notif, idx) => (
                             <div key={idx} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="flex gap-4">
                                   <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PHASE_COLORS[notif.phase]}`} />
                                   <div>
                                      <p className="text-xs font-bold text-slate-900 leading-relaxed mb-1">
                                         {isAr ? `الطلبية ${notif.cmdRef} انتقلت لـ ${phaseAr[notif.phase]}` : `Commande ${notif.cmdRef} est passée à ${PHASE_LABELS[notif.phase]}`}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-medium italic">{notif.date}</p>
                                   </div>
                                </div>
                             </div>
                           ))}
                           {found.length === 0 && (
                             <div className="p-10 text-center">
                                <Bell className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune notification</p>
                             </div>
                           )}
                        </div>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="w-full py-4 bg-slate-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-colors"
                        >
                           {isAr ? 'عرض جميع الطلبيات' : 'Voir tout le suivi'}
                        </button>
                     </div>
                   </>
                 )}
              </div>
           </div>
        </header>

        {/* SOFT EMAIL VERIFICATION BANNER */}
        {currentUser && currentUser.email && !currentUser.emailVerified && showEmailBanner && (
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-3 text-slate-800 animate-in fade-in">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-center md:text-right">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">
                    {isAr ? 'تأكيد البريد الإلكتروني :' : 'Confirmation d\'email :'}
                  </span>{' '}
                  <span className="text-slate-600">
                    {isAr 
                      ? `يرجى تأكيد بريدك الإلكتروني (${currentUser.email}) لتفعيل حسابك بالكامل وتلقي إشعارات طلبياتك.`
                      : `Veuillez confirmer votre adresse email (${currentUser.email}) pour sécuriser votre compte et recevoir vos notifications.`}
                  </span>
                  {emailAlreadyConfirmedMsg && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1.5 rounded-lg border border-emerald-300 animate-in fade-in">
                      {isAr 
                        ? '✅ بريدك الإلكتروني مؤكد بالفعل وحسابك نشط 100%! تم إخفاء التنبيه تلقائياً.' 
                        : '✅ Votre adresse email est déjà confirmée et votre compte est 100% actif !'}
                    </p>
                  )}
                  {emailSentSuccess && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300">
                      {isAr 
                        ? '✅ تم إرسال رابط تأكيد الحساب بنجاح! تفقّد بريدك الإلكتروني (Boîte de réception) أو مجلد الرسائل غير المرغوب فيها (Spam).'
                        : '✅ Email de confirmation envoyé avec succès ! Vérifiez votre boîte de réception ou dossier Spam.'}
                    </p>
                  )}
                  {emailSentError && (
                    <p className="mt-1 text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2.5 py-1 rounded-lg border border-rose-300">
                      ⚠️ {emailSentError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center shrink-0">
                <button
                  type="button"
                  onClick={handleSendVerificationEmail}
                  disabled={emailSending || emailSentCooldown}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black rounded-xl text-[11px] shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {emailSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isAr ? 'جاري الإرسال...' : 'Envoi...'}</span>
                    </>
                  ) : emailSentSuccess ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إعادة إرسال التأكيد' : 'Renvoyer la confirmation'}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تأكيد البريد الإلكتروني' : 'Confirmer mon email'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailBanner(false)}
                  className="p-1 hover:bg-amber-500/20 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                  title={isAr ? 'إخفاء التنبيه' : 'Masquer'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-1 md:p-10 max-w-6xl mx-auto">
          {/* WELCOME NEW SIGNUP CREDENTIALS BANNER */}
          {newSignupCode && (
            <div className="mb-8 p-5 md:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
              <div className="flex items-center gap-4 text-center md:text-left relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Sparkles className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black">
                    {isAr ? '🎉 مرحباً بك! تم تسجيل طلبك وفتح حسابك بنجاح' : '🎉 Bienvenue ! Votre demande et compte sont prêts'}
                  </h3>
                  <p className="text-emerald-100 text-xs md:text-sm font-medium mt-1">
                    {isAr 
                      ? 'هذا هو الرمز السري (PIN) الخاص بك للدخول إلى حسابك وتتبع طلباتك في أي وقت:' 
                      : 'Voici votre code PIN secret pour accéder à votre espace et suivre vos demandes :'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-center">
                <div className="bg-black/30 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">{isAr ? 'رمز الدخول' : 'Code PIN'}</span>
                  <span className="font-mono text-2xl font-black tracking-widest text-white">{newSignupCode}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(newSignupCode);
                    alert(isAr ? 'تم نسخ الرمز السري بنجاح!' : 'Code PIN copié avec succès !');
                  }}
                  className="px-4 py-3 bg-white text-emerald-900 font-black text-xs rounded-xl shadow-md hover:bg-emerald-50 transition cursor-pointer"
                >
                  {isAr ? 'نسخ الرمز' : 'Copier'}
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('beya_new_signup_code');
                    setNewSignupCode(null);
                  }}
                  className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                  title={isAr ? 'إغلاق التنبيه' : 'Fermer'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* VIP BEYA NETWORK Access Banner for forsaone41 */}
               {isNetworkPilotUser && (
                 <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
                   <div className="flex items-center gap-4 relative z-10">
                     <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
                       <Users className="w-7 h-7 text-white" />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="font-black text-base md:text-xl tracking-tight text-white">🌐 منصة BEYA NETWORK المستقلة</span>
                         <span className="px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-full shadow-sm">VIP</span>
                       </div>
                       <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                         {isAr ? 'الملتقى المستقل لرواد الموضة، موردي الأقمشة، الشراء المشترك وتبادل التجارب بالمغرب. موقع متكامل مستقل تماماً عن البوابة!' : 'Réseau social & marketplace indépendant pour les créateurs et fournisseurs textiles au Maroc.'}
                       </p>
                     </div>
                   </div>
                   <button
                     onClick={() => window.location.hash = '#/network'}
                     className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2 shrink-0 active:scale-95 relative z-10"
                   >
                     <span>{isAr ? 'الانتقال إلى BEYA NETWORK' : 'Ouvrir BEYA NETWORK'}</span>
                     <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                   </button>
                 </div>
               )}

               {/* Welcome Hero */}
               <div className="bg-slate-900 rounded-2xl md:rounded-[3rem] p-4 md:p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-48 -mt-48" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 text-center md:text-left">
                       <h1 className="text-xl md:text-5xl font-black mb-3 md:6 leading-tight">
                         {isAr ? `مرحباً بك، ${currentUser?.nom || 'عزيزي الزبون'}` : `Heureux de vous revoir, ${currentUser?.nom || 'Cher Client'}`}
                       </h1>
                       <p className="text-slate-400 text-sm md:text-lg font-medium max-w-xl mb-8">
                         {isAr ? 'تبع طلبياتك، حمل فواتيرك، وتواصل مع الفريق ديالنا. حنا هنا باش نسهلو ليك الخدمة.' 
                              : 'Suivez vos productions, gérez vos documents et communiquez avec notre équipe en toute simplicité.'}
                       </p>
                       <button 
                         onClick={() => {
                           setEditingDemandeId(null);
                           setNewOrderForm({
                             modele: '',
                             quantite: '',
                             details: '',
                             photo: null as string | null,
                             telephone: currentUser?.telephone || '',
                             tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' } as Record<string, string>
                           });
                           setShowNewOrderModal(true);
                         }}
                         className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-3 mx-auto md:mx-0"
                       >
                         <Plus className="w-5 h-5" />
                         {isAr ? 'طلب جديد' : 'Nouvelle Commande'}
                       </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                       <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center">
                          <p className="text-3xl font-black mb-1">{found.length}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isAr ? 'طلبيات' : 'Commandes'}</p>
                       </div>
                       <div className="bg-indigo-500 border border-indigo-400 p-6 rounded-3xl text-center shadow-lg shadow-indigo-500/20">
                          <p className="text-3xl font-black mb-1">{found.filter(c => c.statut === 'en_cours').length}</p>
                          <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-widest">{isAr ? 'في الإنتاج' : 'Actives'}</p>
                       </div>
                    </div>
                  </div>

                  {/* WhatsApp Notification — Client's Real Phone Number */}
                  {(currentUser?.role === 'client' || currentUser?.role === 'merchant') && (
                    <div className="mt-8 md:mt-12 p-5 md:p-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-white uppercase tracking-tight">
                                {isAr ? 'إشعارات الواتساب المباشرة' : 'Notifications WhatsApp Directes'}
                              </h4>
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                                {isAr ? 'تحديثات حية' : 'En Direct'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                              {isAr 
                                ? 'مستجدات وتحديثات مراحل الإنتاج (الفصالة، الخياطة، العينة، والشحن) كتوصلك مباشرة على رقمك فـ WhatsApp' 
                                : 'Suivez en direct chaque étape de vos commandes (coupe, confection, échantillon, expédition) sur votre WhatsApp'}
                            </p>
                          </div>
                        </div>

                        {!isEditingPhone && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneInputVal(clientPhone || currentUser?.telephone || '');
                              setIsEditingPhone(true);
                            }}
                            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border border-white/10 cursor-pointer self-start sm:self-auto"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-indigo-300" />
                            <span>{isAr ? 'تعديل الرقم' : 'Modifier le numéro'}</span>
                          </button>
                        )}
                      </div>

                      {phoneSaveSuccess && (
                        <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{isAr ? 'تم حفظ وتأكيد رقمك بنجاح! ستصلك كافة المستجدات عليه مباشرة.' : 'Votre numéro a été mis à jour avec succès !'}</span>
                        </div>
                      )}

                      {isEditingPhone ? (
                        <form onSubmit={handleSaveClientPhone} className="bg-black/30 p-4 rounded-2xl border border-white/15 space-y-3">
                          <label className="block text-xs font-bold text-slate-200">
                            {isAr ? 'أدخل رقمك الحقيقي (المغرب أو الدولي) لاستقبال التنبيهات:' : 'Votre numéro WhatsApp pour recevoir les notifications :'}
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="tel"
                              value={phoneInputVal}
                              onChange={(e) => setPhoneInputVal(e.target.value)}
                              placeholder="06 XX XX XX XX / +212 6..."
                              className="flex-1 py-2.5 px-4 bg-white/10 border border-white/20 rounded-xl text-white font-mono font-bold text-sm outline-none focus:border-emerald-400 focus:bg-white/15 transition placeholder:text-white/40"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="submit"
                                disabled={savingPhone || !phoneInputVal.trim()}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                              >
                                {savingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                <span>{isAr ? 'حفظ وتأكيد' : 'Enregistrer'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingPhone(false)}
                                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                {isAr ? 'إلغاء' : 'Annuler'}
                              </button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
                              📱
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                {isAr ? 'رقم الهاتف المعتمد لاستقبال المستجدات:' : 'Numéro de réception certifié :'}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-base font-black text-white font-mono tracking-wider">
                                  {clientPhone || currentUser?.telephone || (mesDemandes.find(d => d.phone)?.phone) || (isAr ? 'لم تسجل رقمك بعد' : 'Non renseigné')}
                                </span>
                                {(clientPhone || currentUser?.telephone) && (
                                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-md flex items-center gap-1 border border-emerald-500/30">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>{isAr ? 'مربوط ومفعل' : 'Actif'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Direct WhatsApp Action to verify or test */}
                          <a
                            href={`https://wa.me/212661000000?text=${encodeURIComponent(
                              isAr
                                ? `السلام عليكم ورشة BEYA Creative، أنا الزبون ${currentUser?.nom || 'الزبون'} (رقم هاتفي: ${clientPhone || currentUser?.telephone || ''}). بغيت نأكد رقمي لاستقبال مستجدات الإنتاج والطلبيات عبر WhatsApp.`
                                : `Bonjour Atelier BEYA Creative, je suis le client ${currentUser?.nom || ''} (${clientPhone || currentUser?.telephone || ''}). Je confirme mon numéro pour recevoir les mises à jour de mes commandes sur WhatsApp.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer self-stretch sm:self-auto text-center"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{isAr ? 'تأكيد الرقم فـ WhatsApp الورشة' : 'Tester sur WhatsApp'}</span>
                          </a>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium px-1 flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span>🔒</span>
                          <span>{isAr ? 'تنبيهات مشفرة ومؤمنة 100%' : 'Notifications 100% sécurisées'}</span>
                        </span>
                        <span>{isAr ? 'بدون رسائل سبام • فقط مستجدات الإنتاج والفواتير الرسمية' : 'Zéro spam • Suivi de fabrication & factures uniquement'}</span>
                      </div>
                    </div>
                  )}
               </div>
               
               {/* BEYA STORE PROMO BANNER */}
               {(currentUser?.role === 'client' || currentUser?.role === 'merchant') && (
                 <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                   <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-2">
                       <Store className="w-6 h-6 text-blue-200" />
                       <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                         {isAr ? 'أطلق متجرك الإلكتروني الآن' : 'Lancez votre boutique en ligne'}
                       </h3>
                     </div>
                     <p className="text-blue-100 text-sm md:text-base font-medium max-w-xl">
                       {isAr 
                         ? 'هل تحتاج إلى متجر إلكتروني لبيع منتجاتك؟ أنشئ متجرك مجاناً في ثوانٍ.' 
                         : 'Besoin d\'une boutique e-commerce pour vendre vos produits ? Créez votre store gratuitement en quelques secondes.'}
                     </p>
                   </div>
                   <div className="relative z-10 w-full md:w-auto">
                     <button 
                       onClick={handleLaunchMyStore}
                       className="block w-full md:w-auto px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-black uppercase tracking-widest text-center shadow-lg hover:scale-105 transition-all cursor-pointer active:scale-95"
                     >
                       {isAr ? 'أنشئ متجري الآن 🚀' : 'Créer ma boutique 🚀'}
                     </button>
                   </div>
                 </div>
               )}

               {/* Recent Orders Overview */}
               <div>
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">{isAr ? 'آخر الطلبيات' : 'Commandes Récentes'}</h3>
                     <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">{isAr ? 'عرض الكل' : 'Voir tout'}</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {found.length === 0 && (
                      <div className="md:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-slate-100 shadow-xl text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                          <Package className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-1">
                          {isAr ? 'لا توجد طلبيات مؤكدة في الإنتاج حالياً' : 'Aucune commande en production pour le moment'}
                        </h4>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                          {mesDemandes.length > 0 
                            ? (isAr ? `لديك ${mesDemandes.filter(d => d.type !== '__MESSAGE__' && d.type !== '__MESSAGE_REPLY__').length} طلب(ات) موديل قيد الدراسة والمراجعة من فريقنا.` : `Vous avez ${mesDemandes.filter(d => d.type !== '__MESSAGE__' && d.type !== '__MESSAGE_REPLY__').length} demande(s) en cours d'étude par notre équipe.`)
                            : (isAr ? 'يمكنك تقديم طلب جديد وتحديد الموديلات التي ترغب في تصنيعها.' : 'Vous pouvez soumettre une nouvelle demande et spécifier vos modèles.')}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          {mesDemandes.length > 0 && (
                            <button
                              onClick={() => setActiveTab('demandes')}
                              className="px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              {isAr ? 'عرض تتبع طلباتي' : 'Voir mes demandes'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingDemandeId(null);
                              setNewOrderForm({
                                modele: '',
                                quantite: '',
                                details: '',
                                photo: null as string | null,
                                telephone: currentUser?.telephone || '',
                                tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' } as Record<string, string>
                              });
                              setShowNewOrderModal(true);
                            }}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            {isAr ? 'موديل جديد' : 'Nouveau Modèle'}
                          </button>
                        </div>
                      </div>
                    )}
                    {found.slice(0, 2).map(cmd => {
                      const progress = (getPhaseIndex(cmd.phase) / (PHASE_ORDER.length - 1)) * 100;
                      const isActive = cmd.statut !== 'livré';
                      return (
                        <div 
                          key={cmd.id} 
                          onClick={() => {
                            setActiveTab('orders');
                            setTimeout(() => {
                              const el = document.getElementById(`order-card-${cmd.id}`);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4', 'transition-all', 'duration-500');
                                setTimeout(() => {
                                  el.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-4');
                                }, 3000);
                              }
                            }, 150);
                          }}
                          className="bg-white/70 backdrop-blur-xl p-4 md:p-10 rounded-2xl md:rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50 group hover:border-indigo-400 transition-all duration-500 relative overflow-hidden cursor-pointer active:scale-[0.99]"
                        >
                          {/* Live Indicator */}
                          {isActive && (
                            <div className="absolute top-6 left-6 flex items-center gap-2">
                               <span className="relative flex h-3 w-3">
                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                 <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                               </span>
                               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'مباشر' : 'Live'}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-10 pt-4">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isAr ? 'رقم الطلبية' : 'Référence'}</span>
                                <span className="text-sm font-black text-indigo-600 uppercase tracking-tighter">{cmd.reference}</span>
                             </div>
                             <div className="text-right">
                                <span className={`inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                                  cmd.statut === 'livré' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                  {isAr ? phaseAr[cmd.phase] : PHASE_LABELS[cmd.phase]}
                                </span>
                             </div>
                          </div>

                          <div className="mb-10 text-center md:text-left">
                             <h4 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{cmd.modele}</h4>
                             <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                <span>Quantité:</span>
                                <span className="text-slate-900">{cmd.quantite} pcs</span>
                             </div>
                          </div>
                          
                          <div className="space-y-6">
                             <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'حالة التقدم' : 'Progression'}</p>
                                <p className="text-xl font-black text-indigo-600">{Math.round(progress)}%</p>
                             </div>
                             <div className="h-4 w-full bg-slate-50 rounded-full p-1 border border-slate-100 shadow-inner mb-8">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-200" 
                                  style={{ width: `${progress}%` }} 
                                />
                             </div>
                             
                             {/* Production Roadmap Icons */}
                             <div className="relative pt-4 px-2">
                               {cmd.statut === 'echantillon_en_cours' || cmd.statut === 'echantillon_valide' ? (
                                  <div className="relative z-10 flex justify-between items-center px-4">
                                     <div className="absolute top-1/2 left-8 right-8 h-1 bg-amber-100 -translate-y-1/2 z-0" />
                                     <div className="relative z-10 flex flex-col items-center gap-1 group/step">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${cmd.statut === 'echantillon_en_cours' && cmd.phase !== 'livré' ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-50 scale-110' : 'bg-amber-500 text-white'}`}><Scissors className="w-4 h-4" /></div>
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-amber-600">{isAr ? 'الإنتاج' : 'Production'}</span>
                                     </div>
                                     <div className="relative z-10 flex flex-col items-center gap-1 group/step">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${(cmd.phase === 'livré' && cmd.statut === 'echantillon_en_cours') || cmd.statut === 'echantillon_valide' ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-50 scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}><Truck className="w-4 h-4" /></div>
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">{isAr ? 'التسليم' : 'Livraison'}</span>
                                     </div>
                                     <div className="relative z-10 flex flex-col items-center gap-1 group/step">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${cmd.statut === 'echantillon_valide' ? 'bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-50 scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}><Check className="w-4 h-4" /></div>
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">{isAr ? 'تأكيد' : 'Validation'}</span>
                                     </div>
                                  </div>
                               ) : (
                                  <>
                                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                                  <div className="relative z-10 flex justify-between items-center">
                                     {PHASE_ORDER.map((p, idx) => {
                                       const isCompleted = getPhaseIndex(cmd.phase) >= idx;
                                       const isCurrent = cmd.phase === p;
                                       return (
                                         <div key={p} className="flex flex-col items-center gap-1 md:gap-2 group/step">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                              isCompleted 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                                                : 'bg-white text-slate-300 border border-slate-100'
                                            } ${isCurrent ? 'ring-4 ring-indigo-50' : ''}`}>
                                               {phaseIcons[p]}
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>
                                               {isAr ? phaseAr[p] : PHASE_LABELS[p]}
                                            </span>
                                         </div>
                                       );
                                     })}
                                  </div>
                                  </>
                               )}
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'demandes' && (() => {
             const trueDemandes = mesDemandes.filter(d => d.type !== '__MESSAGE__' && d.type !== '__MESSAGE_REPLY__');

             // ───────────────── DEDICATED FULL PAGE: مستشار ورشة BEYA الذكي بخصوص الموديل ─────────────────
             if (consultingDemande) {
               const d = consultingDemande;
               const analysis = getDemandeAnalysis(d, isAr);
               const phoneForWhatsApp = (company.phone || '+212600000000').replace(/\D/g, '');
               const waConsultMsg = isAr
                 ? `السلام عليكم ورشة ${company.name || 'BEYA'}، كنت كنتشاور مع المستشار الذكي بخصوص موديل (${analysis.modeleReel}) كود REF: #${d.id.substring(0, 8).toUpperCase()}. بغيت نتواصل معكم مباشرة لتأكيد تفاصيل الثوب وتأكيد الكوموند.`
                 : `Bonjour l'Atelier ${company.name || 'BEYA Creative'}, je consultais l'assistant IA pour le modèle (${analysis.modeleReel}) REF: #${d.id.substring(0, 8).toUpperCase()}. Je souhaite échanger avec vous pour finaliser la commande.`;
               const waUrl = `https://wa.me/${phoneForWhatsApp}?text=${encodeURIComponent(waConsultMsg)}`;

               return (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-28 sm:pb-32">
                   {/* Top Header Bar */}
                   <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                     <button
                       type="button"
                       onClick={() => setConsultingDemande(null)}
                       className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200/80 shadow-2xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                     >
                       <ChevronRight className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`} />
                       <span>{selectedDemandePage ? (isAr ? '← الرجوع لدراسة الموديل' : '← Retour au chiffrage') : (isAr ? '← الرجوع لقائمة الطلبات' : '← Retour aux demandes')}</span>
                     </button>

                     <div className="flex items-center gap-2">
                       <a
                         href={waUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                       >
                         <MessageCircle className="w-3.5 h-3.5" />
                         <span className="hidden sm:inline">{isAr ? 'تواصل مع المعلم فالواتساب' : 'WhatsApp Atelier'}</span>
                       </a>
                     </div>
                   </div>

                   {/* Model Context & Focus Banner */}
                   <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-indigo-500/20">
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                       <div className="flex items-center gap-3.5 min-w-0">
                         <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/10 shrink-0 shadow-md">
                           <LeadCardImage
                             lead={d}
                             leadPhotos={leadPhotos}
                             onPhotoLoaded={handlePhotoLoaded}
                             onOpenPreview={(src) => setPreviewPhoto(src)}
                             sizeClasses="w-full h-full object-cover"
                           />
                         </div>
                         <div className="min-w-0">
                           <div className="flex items-center gap-2 flex-wrap mb-1">
                             <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                               #${d.id.substring(0, 8).toUpperCase()}
                             </span>
                             <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                               <span>{isAr ? 'استشارة حصرية للموديل' : 'Consultation exclusive'}</span>
                             </span>
                           </div>
                           <h1 className="text-base sm:text-xl font-black truncate text-white">
                             {analysis.modeleReel}
                           </h1>
                           <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
                             {isAr ? `الزبون: ${currentUser?.nom || 'Client'} | الكمية: ${d.quantity || 10} قطعة` : `Client : ${currentUser?.nom || 'Client'} | Quantité : ${d.quantity || 10} pcs`}
                           </p>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:w-auto shrink-0 text-center sm:text-right">
                         <div className="p-2 sm:p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                           <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'سعر الخياطة' : 'Prix Façon'}</span>
                           <span className="text-sm font-black text-amber-300">{analysis.confectionPrice || analysis.unitPrice} MAD</span>
                         </div>
                         <div className="p-2 sm:p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                           <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'مدة الإنجاز' : 'Délai'}</span>
                           <span className="text-xs font-black text-emerald-300 truncate block">{analysis.delaiEstime || '7-10j'}</span>
                         </div>
                         <div className="col-span-2 sm:col-span-1 p-2 sm:p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                           <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'سعر الثوب فالسوق' : 'Tissu marché'}</span>
                           <span className="text-xs font-black text-cyan-300 truncate block">{analysis.prixTissuMaroc || '28-50 DH/m'}</span>
                         </div>
                       </div>
                     </div>

                     <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-indigo-200/90">
                       <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                       <span>
                         {isAr
                           ? `الثوب الموصى به: ${analysis.tissuSuggere} — يمكنك طرح أي استفسار تقني حول الأمتار، الجودة، وأسواق درب عمر والقريعة.`
                           : `Matière recommandée : ${analysis.tissuSuggere} — Posez vos questions techniques sur le métrage, patronage et finitions.`}
                       </span>
                     </div>
                   </div>

                   {/* Main Dedicated Chat Window */}
                   <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px] max-h-[75vh]">
                     {/* Chat Conversation Scroll Area */}
                     <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60 custom-scrollbar">
                       {/* Welcome Message from Advisor */}
                       <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                           B
                         </div>
                         <div className="p-4 bg-white text-slate-800 rounded-3xl rounded-tl-none border border-slate-200 shadow-2xs max-w-[92%] sm:max-w-[85%] leading-relaxed text-xs sm:text-sm">
                           <p className="font-bold text-indigo-950 mb-1.5 flex items-center gap-1.5">
                             <span>{isAr ? 'مستشار ورشة BEYA Creative' : 'Conseiller Atelier BEYA Creative'}</span>
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           </p>
                           <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                             {isAr
                               ? `مرحباً بك! أنا مستشار ورشة BEYA Creative. بخصوص موديل "${analysis.modeleReel}"، أنا هنا باش نجاوبك بدقة ومباشرة على:
• نوع الثوب الأنسب وسعرو فأسواق الجملة بالمغرب (درب عمر / القريعة).
• شحال كياكل هاد الموديل د الميطراج بالضبط لكل قطعة.
• إمكانيات تخفيض سعر الخياطة مع الكمية (Dégressif).
• تفاصيل إعداد الباترون والعينة الأولى (Échantillon) والتسبيق.
• تكلفة الخياطة فقط في حال قمت بجلب الثوب من عندك.

اختر أي سؤال من الأسئلة السريعة لتحت أو كتب سؤالك الخاص!`
                               : `Bonjour ! Je suis le conseiller atelier BEYA Creative pour votre modèle "${analysis.modeleReel}". Je réponds à toutes vos questions sur le tissu idéal, son prix au marché de Derb Omar, le métrage exact requis, les remises sur quantité et les étapes du patronage & échantillon.`}
                           </p>
                         </div>
                       </div>

                       {/* User & AI Messages */}
                       {((clientAiMessages[d.id] || [])).map((msg, mIdx) => (
                         <div key={mIdx} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.sender === 'ai' && (
                             <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-xs">
                               B
                             </div>
                           )}
                           <div className={`p-4 rounded-3xl max-w-[90%] sm:max-w-[80%] leading-relaxed text-xs sm:text-sm shadow-2xs ${
                             msg.sender === 'user'
                               ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                               : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                           }`}>
                             <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                             <span className={`text-[10px] block text-right mt-1.5 font-mono ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                               {msg.time}
                             </span>
                           </div>
                         </div>
                       ))}

                       {clientAiLoading && (
                         <div className="flex items-center gap-3 text-slate-500 text-xs py-2 px-3 bg-white rounded-2xl w-fit border border-slate-200 shadow-2xs animate-pulse">
                           <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                           <span className="font-bold">{isAr ? 'مستشار الورشة يكتب الإجابة الفنية...' : 'Le conseiller formule la réponse...'}</span>
                         </div>
                       )}
                     </div>

                     {/* Quick Suggestion Chips (Questions Rapides) */}
                     <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                       {[
                         { label: isAr ? '🧵 نوع وسعر الثوب فالسوق؟' : '🧵 Tissu & Prix', query: isAr ? 'أشنو هو أحسن نوع ثوب لهاد الموديل وشحال كيدير فالسوق المغربي؟' : 'Quel est le meilleur tissu pour ce modèle et son prix au marché ?' },
                         { label: isAr ? '📏 شحال الميطراج للقطعة؟' : '📏 Métrage requis ?', query: isAr ? 'شحال كياكل هاد الموديل ديال الميطراج لكل بياسة؟' : 'Combien de mètres de tissu par pièce pour ce modèle ?' },
                         { label: isAr ? '💰 واش كاين تخفيض فالكمية؟' : '💰 Remise Quantité ?', query: isAr ? 'شحال كيهبط ثمن الخياطة إيلا زدت فالكمية؟' : 'Comment évolue le prix unitaire si j\'augmente la quantité ?' },
                         { label: isAr ? '✂️ تفاصيل العينة والتسبيق؟' : '✂️ Échantillon', query: isAr ? 'كيفاش كتم مرحلة العينة وشحال التسبيق المطلوب باش نبداو؟' : 'Quelles sont les modalités de l\'échantillon et de l\'acompte ?' },
                         { label: isAr ? '📦 إيلا جبت الثوب من عندي؟' : '📦 Si je fournis le tissu ?', query: isAr ? 'إيلا بغيت نجيب الثوب والمستلزمات من عندي، واش كاين شي تسبيق وإمتى كنخلص؟' : 'Si je fournis le tissu et les fournitures, quel est l\'acompte et quand s\'effectue le paiement ?' },
                         { label: isAr ? '⏱️ إمكانية تسليم أسرع؟' : '⏱️ Délai express ?', query: isAr ? 'واش كاين إمكانية نوجدو السلعة فوقت أسرع ومستعجل؟' : 'Est-il possible d\'obtenir une fabrication express ?' }
                       ].map((chip, cIdx) => (
                         <button
                           key={cIdx}
                           type="button"
                           disabled={clientAiLoading}
                           onClick={async () => {
                             const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                             const userMsg = { sender: 'user' as const, text: chip.query, time: nowTime };
                             setClientAiMessages(prev => ({
                               ...prev,
                               [d.id]: [...(prev[d.id] || []), userMsg]
                             }));
                             setClientAiLoading(true);
                             try {
                               const reply = await generateClientAssistantReply(chip.query, d, analysis, isAr);
                               setClientAiMessages(prev => ({
                                 ...prev,
                                 [d.id]: [...(prev[d.id] || []), { sender: 'ai' as const, text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
                               }));
                             } catch (err) {
                               setClientAiMessages(prev => ({
                                 ...prev,
                                 [d.id]: [...(prev[d.id] || []), { sender: 'ai' as const, text: isAr ? 'عفواً، وقع عطب بسيط. تواصل مع المعلم فالواتساب للجواب السريع.' : 'Erreur de connexion. Contactez l\'atelier sur WhatsApp.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
                               }));
                             } finally {
                               setClientAiLoading(false);
                             }
                           }}
                           className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border border-slate-200/90 active:scale-95"
                         >
                           {chip.label}
                         </button>
                       ))}
                     </div>

                     {/* Input Bar */}
                     <form
                       onSubmit={async (e) => {
                         e.preventDefault();
                         if (!clientAiInput.trim() || clientAiLoading) return;
                         const text = clientAiInput.trim();
                         setClientAiInput('');
                         const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                         setClientAiMessages(prev => ({
                           ...prev,
                           [d.id]: [...(prev[d.id] || []), { sender: 'user' as const, text, time: nowTime }]
                         }));
                         setClientAiLoading(true);
                         try {
                           const reply = await generateClientAssistantReply(text, d, analysis, isAr);
                           setClientAiMessages(prev => ({
                             ...prev,
                             [d.id]: [...(prev[d.id] || []), { sender: 'ai' as const, text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
                           }));
                         } catch (err) {
                           setClientAiMessages(prev => ({
                             ...prev,
                             [d.id]: [...(prev[d.id] || []), { sender: 'ai' as const, text: isAr ? 'عفواً، وقع عطب بسيط. تواصل مع المعلم فالواتساب للجواب السريع.' : 'Erreur de connexion.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
                           }));
                         } finally {
                           setClientAiLoading(false);
                         }
                       }}
                       className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2.5"
                     >
                       <input
                         type="text"
                         value={clientAiInput}
                         onChange={(e) => setClientAiInput(e.target.value)}
                         placeholder={isAr ? `سول مستشار المعمل على الثوب، السعر، أو الميطراج لموديل "${analysis.modeleReel}"...` : 'Posez votre question sur le tissu, métrage, prix...'}
                         className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium outline-hidden focus:border-indigo-600 focus:bg-white transition-all text-slate-900"
                         disabled={clientAiLoading}
                       />
                       <button
                         type="submit"
                         disabled={!clientAiInput.trim() || clientAiLoading}
                         className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
                         title={isAr ? 'إرسال' : 'Envoyer'}
                       >
                         <Send className="w-4 h-4" />
                       </button>
                     </form>

                     {/* WhatsApp Direct Negotiation Bar */}
                     <div className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100 flex items-center justify-between px-4 text-xs">
                       <span className="text-emerald-950 font-bold hidden sm:inline">
                         {isAr ? '💡 تفاصيل واضحة وبغيتي تبدا العينة أو تثبت طلبك؟' : 'Prêt à valider votre échantillon ?'}
                       </span>
                       <a
                         href={waUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-emerald-700 hover:text-emerald-900 font-black flex items-center gap-1.5 transition ms-auto"
                       >
                         <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                         <span>{isAr ? 'تحدث مباشرة مع المعلم فالواتساب بخصوص هاد الموديل ←' : 'Contacter l\'atelier sur WhatsApp pour ce modèle →'}</span>
                       </a>
                     </div>
                   </div>
                 </div>
               );
             }

             // Dedicated Full Page for Demande Details & Technical Study
             if (selectedDemandePage) {
               const d = selectedDemandePage;
               const analysis = getDemandeAnalysis(d, isAr);
               const sizes = getLeadSizes(d);
               const hasCustomSizes = Object.keys(sizes).length > 0;
               const isAccepted = d.crmStage === 'confirme';
               const isRejected = d.crmStage === 'annule';
               const isPending = !isAccepted && !isRejected;
               const isTestAccount = currentUser?.email === 'forsaone41@gmail.com' || currentUser?.role === 'admin' || currentUser?.role === 'manager';

               const stepOrder: Array<'reception' | 'etude' | 'echantillon' | 'production' | 'pret'> = ['reception', 'etude', 'echantillon', 'production', 'pret'];
               const currentStepIdx = stepOrder.indexOf(analysis.statusProgression) >= 0 ? stepOrder.indexOf(analysis.statusProgression) : 1;

               const stepLabels = [
                 { key: 'reception', fr: '1. Reçu', ar: '١. تم الاستلام', icon: '⏳' },
                 { key: 'etude', fr: '2. Étude & Devis', ar: '٢. دراسة وتحديد السعر', icon: '📋' },
                 { key: 'echantillon', fr: '3. Échantillon', ar: '٣. إعداد العينة', icon: '✂️' },
                 { key: 'production', fr: '4. Production', ar: '٤. قيد الإنتاج', icon: '🏭' },
               ];

               const currentQty = selectedTierQty[d.id] !== undefined ? selectedTierQty[d.id] : (Number(d.quantity) > 0 ? Number(d.quantity) : analysis.qty);
               const calculateTierUnitPrice = (qty: number, basePrice: number) => {
                 if (qty <= 35) return Math.round(basePrice * 1.18);
                 if (qty <= 60) return Math.round(basePrice * 1.08);
                 if (qty <= 150) return basePrice;
                 if (qty <= 350) return Math.max(25, Math.round(basePrice * 0.90));
                 return Math.max(20, Math.round(basePrice * 0.84));
               };
               const isClientFabric = fabricOption[d.id] === 'client';
               const selectedBasePrice = isClientFabric ? analysis.confectionPrice : analysis.fullPackagePrice;
               const activeUnitPrice = calculateTierUnitPrice(currentQty, selectedBasePrice);
               const activeTotalPrice = activeUnitPrice * currentQty;
                const phoneForWhatsApp = (company.phone || '+212600000000').replace(/\D/g, '');
                const waText = isAr
                  ? (isClientFabric
                      ? `السلام عليكم ورشة ${company.name || 'BEYA'}، بخصوص طلبيتي رقم REF: #${d.id.substring(0, 8).toUpperCase()}:\n- الموديل: ${analysis.modeleReel}\n- الكمية: ${analysis.qty} قطعة\n- الخياطة والتصنيع: ${analysis.unitPrice} درهم/قطعة (المجموع: ${analysis.totalPrice.toLocaleString()} درهم)\nالثوب والمستلزمات غانصيفطهم من عندي للورشة (بدون تسبيق مسبق)، والخلاص عند استلام السلعة إن شاء الله.`
                      : `السلام عليكم ورشة ${company.name || 'BEYA'}، بخصوص طلبيتي رقم REF: #${d.id.substring(0, 8).toUpperCase()}:\n- الموديل: ${analysis.modeleReel}\n- الكمية: ${analysis.qty} قطعة\n- السعر الإجمالي: ${analysis.totalPrice.toLocaleString()} درهم\n- الثوب من المعمل: ${analysis.tissuSuggere}\nبغيت نأكد الدوفيز وندوز تسبيق 50% لشراء الثوب وبدء الإنتاج. شكراً!`)
                  : (isClientFabric
                      ? `Bonjour l'Atelier ${company.name || 'BEYA Creative'}, demande REF: #${d.id.substring(0, 8).toUpperCase()} :\n- Modèle : ${analysis.modeleReel}\n- Quantité : ${analysis.qty} pcs\n- Façon : ${analysis.unitPrice} MAD/pc\nJe fournis le tissu et fournitures (0 MAD acompte). Règlement à la livraison.`
                      : `Bonjour l'Atelier ${company.name || 'BEYA Creative'}, demande REF: #${d.id.substring(0, 8).toUpperCase()} :\n- Modèle : ${analysis.modeleReel}\n- Quantité : ${analysis.qty} pcs\n- Tissu Atelier : ${analysis.tissuSuggere}\nJe valide le devis et souhaite verser l'acompte de 50% pour lancer la production.`);
                const waUrl = `https://wa.me/${phoneForWhatsApp}?text=${encodeURIComponent(waText)}`;

               return (
                 <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-500 pb-28 sm:pb-32">
                   {/* Top Navigation & Clean Corner Action Icons */}
                   <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                     <button
                       type="button"
                       onClick={() => setSelectedDemandePage(null)}
                       className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200/80 shadow-2xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                     >
                       <ChevronRight className={`w-3.5 h-3.5 ${isAr ? '' : 'rotate-180'}`} />
                       <span>{isAr ? '← الرجوع إلى قائمة طلباتي' : '← Retour à mes demandes'}</span>
                     </button>

                     {/* Discrete Corner Action Icons: Edit & Delete */}
                     <div className="flex items-center gap-1.5">
                       {isPending && (
                         <button
                           type="button"
                           onClick={(e) => handleOpenEditDemande(d, e)}
                           className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                           title={isAr ? 'تعديل بيانات الموديل' : 'Modifier la demande'}
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                       )}

                       <button
                         type="button"
                         onClick={(e) => handleOpenDeleteModal(d, e)}
                         className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-rose-200/80 hover:border-rose-300 rounded-xl transition-all shadow-2xs cursor-pointer"
                         title={isAr ? 'حذف هذا الموديل' : 'Supprimer la demande'}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>

                   {/* 0. Primary Model Title & Devis Chiffrage Atelier Header (Compact, Sleek, No AI mentioned) */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3.5 md:p-4 shadow-lg border border-indigo-500/20 mb-2.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Badges row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
                              <span>🏭</span>
                              <span>{isAr ? 'مكتب الدراسات والتسعير BEYA' : 'Bureau d\'Études Atelier BEYA'}</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              {isAr ? '✓ دراسة معتمدة ومسعرة' : '✓ Chiffrage Atelier Validé'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              REF: #{d.id.substring(0, 8).toUpperCase()}
                            </span>
                          </div>

                          {/* Model Title (Prominent, Sleek, Clear) */}
                          <h3 className="text-base md:text-lg font-black text-white tracking-tight leading-snug break-words">
                            {analysis.modeleReel || cleanLangText(d.modele || d.type, isAr) || (isAr ? 'دراسة تقنية وتحديد سعر الموديل' : 'Étude Technique & Chiffrage Modèle')}
                          </h3>

                          {/* Chiffrage Montant / Pricing Summary Pills */}
                          <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            <div className="px-2.5 py-1 bg-white/10 backdrop-blur-xs rounded-lg border border-white/15 flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-300 font-medium">{isAr ? 'سعر البياسة :' : 'Prix unitaire :'}</span>
                              <span className="text-xs font-black text-amber-300 font-mono">{activeUnitPrice} MAD</span>
                            </div>
                            <div className="px-2.5 py-1 bg-indigo-600/30 backdrop-blur-xs rounded-lg border border-indigo-400/30 flex items-center gap-1.5">
                              <span className="text-[10px] text-indigo-200 font-medium">{isAr ? 'المجموع الإجمالي :' : 'Total Devis :'}</span>
                              <span className="text-xs font-black text-white font-mono">{activeTotalPrice.toLocaleString()} MAD</span>
                              <span className="text-[10px] text-slate-300">({currentQty} pcs)</span>
                            </div>
                            <div className="px-2.5 py-1 bg-slate-800/60 rounded-lg border border-slate-700/60 text-[10px] text-slate-300 font-medium">
                              {isAr ? `⏱️ مدة الإنجاز: ${analysis.delaiEstime}` : `⏱️ Délai estimé : ${analysis.delaiEstime}`}
                            </div>
                          </div>
                        </div>

                        {/* Actualiser le Chiffrage CTA Button */}
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isAiAnalyzingLead === d.id}
                            onClick={() => reanalyzeDemandeWithAI(d)}
                            className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-950/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isAiAnalyzingLead === d.id ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
                                <span className="animate-pulse">{isAr ? 'جاري تحديث الحسابات والتسعير...' : 'Actualisation en cours...'}</span>
                              </>
                            ) : (
                              <>
                                <RotateCw className="w-3.5 h-3.5 text-indigo-200" />
                                <span>{isAr ? 'تحديث التسعير والحسابات' : 'Actualiser le Chiffrage'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Active analysis progress bar when analyzing */}
                      {isAiAnalyzingLead === d.id && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-indigo-200">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              {isAr ? 'جاري فحص مواصفات الموديل وتحديث كلفة القماش والمصنعية في ورشة BEYA...' : 'Calcul du métrage et mise à jour du chiffrage atelier...'}
                            </span>
                            <span className="font-mono">85%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-400 rounded-full animate-pulse w-4/5" />
                          </div>
                        </div>
                      )}
                    </div>

                   {/* 1. Professional Minimalist Stepper (No games / Corporate timeline) */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        {[
                          { step: '01', title: isAr ? 'دراسة وتحديد السعر' : 'Étude & Chiffrage', sub: isAr ? 'مكتمل ✓' : 'Effectué ✓', state: 'done' },
                          { step: '02', title: isAr ? 'تأكيد الطلب والتسبيق' : 'Validation & Acompte', sub: isAccepted ? (isAr ? 'مؤكد ✓' : 'Validé ✓') : (isAr ? 'في انتظار التأكيد' : 'En attente'), state: isAccepted ? 'done' : 'current' },
                          { step: '03', title: isAr ? 'إعداد الباترون والعينة' : 'Patronage & Échantillon', sub: isAr ? 'المرحلة القادمة' : 'Étape suivante', state: isAccepted ? 'current' : 'upcoming' },
                          { step: '04', title: isAr ? 'الإنتاج الكامل والتسليم' : 'Production & Livraison', sub: isAr ? 'التسليم النهائي' : 'Final', state: 'upcoming' },
                        ].map((st, i) => (
                          <div key={i} className={`p-3 rounded-xl border transition-all ${
                            st.state === 'current' ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs' :
                            st.state === 'done' ? 'bg-slate-50/80 border-slate-200 text-slate-700' :
                            'bg-white border-slate-100 opacity-60'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-mono font-black ${st.state === 'current' ? 'text-indigo-600' : st.state === 'done' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {st.step}
                              </span>
                              {st.state === 'done' && <span className="text-[10px] font-black text-emerald-600">✓</span>}
                              {st.state === 'current' && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
                            </div>
                            <div className={`text-xs font-black leading-tight ${st.state === 'current' ? 'text-indigo-950' : 'text-slate-900'}`}>
                              {st.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                              {st.sub}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Full-Width Official Devis Page Hub */}
                    <div className="w-full space-y-5">
                      {/* Official Devis Card (Full Page Width) */}
                      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-5 md:p-8 space-y-5">
                        
                        {/* Devis Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-sm">
                              <LeadCardImage
                                lead={d}
                                leadPhotos={leadPhotos}
                                onPhotoLoaded={handlePhotoLoaded}
                                alt={analysis.modeleReel}
                                dark={true}
                                iconSize={8}
                                isAr={isAr}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono font-black rounded-lg border border-indigo-100">
                                  #{d.id.substring(0, 8).toUpperCase()}
                                </span>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100">
                                  {isAr ? 'دوفيز رسمي معتمد' : 'Devis Officiel'}
                                </span>
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                                  <span>{isAr ? 'عرض سعر معتمد من الورشة' : 'Devis Atelier Certifié'}</span>
                                </span>
                              </div>
                              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
                                {analysis.modeleReel}
                              </h2>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {isAr ? 'الزبون :' : 'Client :'} <strong className="text-slate-800">{d.name || currentUser?.nom || 'Client'}</strong>
                              </p>
                            </div>
                          </div>

                        </div>

                        {/* ⚠️ تنبيه قانوني ومهني بالسعر التقديري بناءً على طلب الزبون */}
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border-2 border-amber-500/35 rounded-3xl flex flex-col sm:flex-row items-start gap-4 text-amber-950 shadow-xs">
                          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl shrink-0 shadow-md shadow-amber-500/25">
                            <AlertCircle className="w-6 h-6" />
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-sm sm:text-base font-black text-amber-950">
                                {isAr ? '⚠️ تنبيه هام : هذا السعر والمدة تقديرية ومبدئية للدراسة الأولية فقط' : '⚠️ Avis Important : Tarif & Délais Estimatifs & Indicatifs'}
                              </strong>
                              <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider shadow-xs">
                                {isAr ? 'في انتظار القرار النهائي من BEYA CREATIVE' : 'Validation Finale BEYA CREATIVE'}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-medium">
                              {isAr
                                ? 'السعر الإجمالي وتكلفة القطعة والمدة الموضحة في هذا الدوفيز مبنية على دراسة تقنية أولية للصور والمواصفات المدخلة. لا يجب أخذ هذا السعر بعين الاعتبار بنسبة 100% كالتزام نهائي حتى تتم المعاينة التقنية للنموذج وإصدار القرار والاعتماد النهائي المؤكد من طرف إدارة ورشة BEYA CREATIVE.'
                                : 'Ce chiffrage, le prix unitaire et les délais sont calculés sur la base de spécifications estimatives. Ils ne doivent pas être considérés comme contractuels à 100% avant examen approfondi de faisabilité physique et validation finale par la direction de BEYA CREATIVE.'}
                            </p>
                            <div className="pt-0.5 flex items-center gap-2 text-[11px] font-bold text-amber-800">
                              <span>✓ المعاينة الميدانية والتأكيد النهائي كيكونو قبل بدء الإنتاج الفعلي للطلبية</span>
                            </div>
                          </div>
                        </div>

                        {/* Spacious Pricing & Fabric Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* 1. Fabric Info Card */}
                          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {isAr ? 'نوع الثوب المقترح ومكان الشراء' : 'Tissu conseillé & Marché'}
                              </span>
                              <span className="px-2 py-0.5 bg-white text-indigo-700 text-[10px] font-black rounded-lg border border-slate-200">
                                {isAr ? 'جودة ممتازة' : 'Qualité Pro'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 block">{analysis.tissuSuggere}</span>
                              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                {analysis.tissuMarcheNom} • ~{analysis.prixMetreEstime} MAD/m ({analysis.tissuConsoMeters}m / pc)
                              </span>
                            </div>
                          </div>

                          {/* 2. Unit Price Card */}
                          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-col justify-between space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider truncate">
                                {isClientFabric 
                                  ? (isAr ? 'سعر الخياطة فقط للقطعة' : 'Façon seule / Pièce')
                                  : (isAr ? 'سعر القطعة كاملة (ثوب + خياطة)' : 'Prix Complet / Pièce')}
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded-md">
                                {isAr ? 'سعر تقديري' : 'Estimatif'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono">{activeUnitPrice}</span>
                                <span className="text-sm font-black text-indigo-600">MAD <span className="text-[10px] font-normal text-slate-500">/ pc</span></span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
                                {isAr ? `الكمية المعتمدة: ${currentQty} قطعة` : `Quantité : ${currentQty} pcs`}
                              </span>
                            </div>
                          </div>

                          {/* 3. Total Price Card */}
                          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {isAr ? 'المجموع الإجمالي للدوفيز' : 'Total Devis Estimatif'}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-800 text-amber-400 text-[9px] font-mono font-bold rounded-md border border-amber-400/20">
                                {isAr ? `المدة: ${analysis.delaiEstime}` : `Délai : ${analysis.delaiEstime}`}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl sm:text-3xl font-black text-white font-mono">{activeTotalPrice.toLocaleString()}</span>
                                <span className="text-sm font-black text-indigo-300">MAD</span>
                              </div>
                              <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
                                {isAr ? 'شامل لمراحل الإنتاج المتفق عليها' : 'Comprend les phases convenues'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Fabric Source Mode Switcher: Atelier fabric (50% acompte) VS Client fabric (0 MAD acompte) */}
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/70">
                          <button
                            type="button"
                            onClick={() => setFabricOption(prev => ({ ...prev, [d.id]: 'atelier' }))}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              !isClientFabric 
                                ? 'bg-white text-indigo-950 shadow-xs' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Layers className="w-4 h-4 text-indigo-600" />
                            <span>{isAr ? 'الثوب من المعمل (شامل كل شيء)' : 'Tissu Atelier (Tout Compris)'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFabricOption(prev => ({ ...prev, [d.id]: 'client' }))}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              isClientFabric 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Package className="w-4 h-4" />
                            <span>{isAr ? 'الثوب من عندك (الخياطة فقط)' : 'Tissu par vous (Façon)'}</span>
                          </button>
                        </div>

                        {/* Dedicated Detailed Cost Breakdown Box ("باش يعرف التمن منين جا") */}
                        <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center">
                                <Calculator className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                                  {isAr ? 'تفاصيل تركيبة وتفكيك السعر (Détail des Coûts)' : 'Décomposition & Détail des Coûts'}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-medium block">
                                  {isAr ? 'شفافية كاملة: منين جا كل درهم فالحساب' : 'Transparence totale sur chaque composante du prix'}
                                </span>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md border border-emerald-200">
                              {isAr ? 'شفافية 100%' : '100% Transparent'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                            {/* 1. Tissu au marché */}
                            <div className={`p-3 rounded-xl border transition-all ${
                              isClientFabric 
                                ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60' 
                                : 'bg-white border-slate-200/90 text-slate-800 shadow-2xs'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                  <span>🧵</span>
                                  <span>{isAr ? 'كلفة الثوب فالسوق:' : 'Coût Tissu :'}</span>
                                </span>
                                <span className={`font-black font-mono ${isClientFabric ? 'line-through text-slate-400' : 'text-indigo-950'}`}>
                                  {isClientFabric ? '0 MAD' : `${analysis.tissuCostPerPiece} MAD`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                {isClientFabric 
                                  ? (isAr ? '✓ ملغاة: الثوب كتجيبو نتا من عندك' : '✓ Tissu fourni par vous (0 MAD)')
                                  : `${analysis.tissuConsoMeters}m × ~${analysis.prixMetreEstime} MAD (${analysis.tissuMarcheNom})`}
                              </p>
                            </div>

                            {/* 2. Coupe & Façon */}
                            <div className="p-3 rounded-xl border bg-white border-slate-200/90 text-slate-800 shadow-2xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                  <span>✂️</span>
                                  <span>{isAr ? 'الفصالة والخياطة (Façon):' : 'Coupe & Façon :'}</span>
                                </span>
                                <span className="font-black text-indigo-950 font-mono">
                                  {analysis.confectionPrice} MAD
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                {isAr ? 'اليد العاملة المؤهلة، ماكينات الورشة، درزات مضاعفة وتجميع' : 'Main d\'œuvre qualifiée, machines industrielles & finitions'}
                              </p>
                            </div>

                            {/* 3. Accessoires & Finitions */}
                            <div className={`p-3 rounded-xl border transition-all ${
                              isClientFabric 
                                ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60' 
                                : 'bg-white border-slate-200/90 text-slate-800 shadow-2xs'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                  <span>🔘</span>
                                  <span>{isAr ? 'المستلزمات والتشطيب:' : 'Fournitures :'}</span>
                                </span>
                                <span className={`font-black font-mono ${isClientFabric ? 'line-through text-slate-400' : 'text-indigo-950'}`}>
                                  {isClientFabric ? '0 MAD' : `${analysis.accessoriesCost} MAD`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                {isClientFabric 
                                  ? (isAr ? '✓ ملغاة: المستلزمات كتجيبها نتا' : '✓ Fourni par vos soins')
                                  : (isAr ? 'سحابات، أزرار، خيوط متينة، بطانة، كي وتغليف' : 'Zips, boutons, fils, repassage & emballage')}
                              </p>
                            </div>

                            {/* 4. Palier de Quantité */}
                            <div className="p-3 rounded-xl border bg-indigo-50/60 border-indigo-100 text-indigo-950">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                  <span>📦</span>
                                  <span>{isAr ? `معامل الكمية (${currentQty} قطعة):` : `Palier (${currentQty} pcs) :`}</span>
                                </span>
                                <span className="font-black font-mono">
                                  {currentQty <= 35 ? '+18%' : currentQty <= 60 ? '+8%' : currentQty <= 150 ? '0% (Standard)' : '-10% (Gros)'}
                                </span>
                              </div>
                              <p className="text-[10px] text-indigo-700/80 leading-relaxed">
                                {currentQty <= 35 
                                  ? (isAr ? 'سلسلة صغرى (Petite série): مصاريف ضبط الماكينات والباترون' : 'Petite série : frais fixes de calage machines')
                                  : (isAr ? 'تسعير قياسي مع تخفيض الإنتاج بالجملة' : 'Série standard : économie d\'échelle')}
                              </p>
                            </div>
                          </div>

                          {/* Summary comparison bar */}
                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-600 font-bold">
                              {isClientFabric 
                                ? (isAr ? '💡 الثوب من عندك: كتوفر كلفة الثوب وكتخلص غير الخياطة:' : '💡 Tissu par vous : vous réglez uniquement la façon :')
                                : (isAr ? '💡 الثوب من المعمل: سعر متكامل شامل السلعة واجدة:' : '💡 Clé en main : formule complète sans prise de tête :')}
                            </span>
                            <span className="font-black text-indigo-950 text-sm">
                              {activeUnitPrice} MAD <span className="text-[10px] font-medium text-slate-500">/ pc</span>
                            </span>
                          </div>

                          {/* Explication Claire du Devis : علاش تقامت بهاد الثمن بالتحديد */}
                          <div className="mt-3 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100/90 text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">📋</span>
                                <div>
                                  <span className="font-black text-indigo-950 text-xs sm:text-sm block leading-tight">
                                    {isAr ? 'علاش هاد الموديل تقام بهاد الثمن بالتحديد؟' : 'Pourquoi ce tarif précis ? (Étude Atelier)'}
                                  </span>
                                  <span className="text-[10px] text-indigo-700/80 font-medium">
                                    {isAr ? 'تفاصيل فنية وحسابات الورشة المعتمدة' : 'Spécifications techniques & justification'}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 bg-white text-indigo-800 text-[10px] font-bold rounded-md border border-indigo-200">
                                {isAr ? 'دراسة تقنية مضبوطة' : 'Devis Détaillé'}
                              </span>
                            </div>

                            <div className="space-y-2 text-[11px] text-slate-700 leading-relaxed pt-1">
                              {analysis.techDetails ? (
                                <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-indigo-50">
                                  <span className="text-indigo-600 font-black shrink-0">•</span>
                                  <div>
                                    <strong className="text-indigo-950 block">{isAr ? 'المواصفات الفنية المعتمدة :' : 'Spécifications techniques :'}</strong>
                                    <span className="text-slate-600">{analysis.techDetails}</span>
                                  </div>
                                </div>
                              ) : null}

                              <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-indigo-50">
                                <span className="text-indigo-600 font-black shrink-0">•</span>
                                <div>
                                  <strong className="text-indigo-950 block">{isAr ? 'استهلاك القماش وسعره فالسوق :' : 'Consommation tissu & Marché :'}</strong>
                                  <span className="text-slate-600">
                                    {isAr 
                                      ? `تم احتساب ${analysis.tissuConsoMeters} متر لكل قطعة من قماش "${analysis.tissuSuggere}" بسعر سوق ${analysis.tissuMarcheNom} (~${analysis.prixMetreEstime} درهم/متر).`
                                      : `Calculé sur ${analysis.tissuConsoMeters}m par pièce en ${analysis.tissuSuggere} (Marché ${analysis.tissuMarcheNom} ~${analysis.prixMetreEstime} MAD/m).`}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-indigo-50">
                                <span className="text-indigo-600 font-black shrink-0">•</span>
                                <div>
                                  <strong className="text-indigo-950 block">{isAr ? 'اليد العاملة وتجهيزات الورشة :' : 'Confection & Finitions industrielles :'}</strong>
                                  <span className="text-slate-600">
                                    {isAr 
                                      ? 'فصالة بمقصات كهربائية صناعية، تجميع بدرزات متينة ومزدوجة، سورجي 4 خيوط، وتركيب الإكسسوارات مع المراقبة الدقيقة للجودة.'
                                      : 'Coupe industrielle, surjet 4 fils, piqûres de renfort, montage zips/accessoires & contrôle qualité strict.'}
                                  </span>
                                </div>
                              </div>

                              {analysis.reponseAtelier ? (
                                <div className="p-3 bg-white rounded-xl border border-indigo-100 text-slate-800">
                                  <span className="text-[10px] font-black text-indigo-950 block mb-0.5">
                                    {isAr ? '💬 توجيه ورأي المعلم بالورشة :' : '💬 Recommandation du chef d\'atelier :'}
                                  </span>
                                  <p className="text-[11px] text-slate-600 italic leading-relaxed">
                                    "{analysis.reponseAtelier}"
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Acompte / Payment Banner */}
                        {!isClientFabric ? (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                            <div>
                              <span className="font-black flex items-center gap-1.5 text-xs sm:text-sm">
                                <CreditCard className="w-4 h-4 text-amber-600" />
                                {isAr ? 'تسبيق شراء القماش وبدء الإنتاج (50%):' : 'Acompte Tissu & Lancement (50%) :'}
                              </span>
                              <span className="text-[11px] text-amber-800/80 font-medium block mt-0.5">
                                {isAr ? 'ضروري لشراء رولوات الثوب وحجز خط الإنتاج' : 'Nécessaire à l\'achat des rouleaux de tissu'}
                              </span>
                            </div>
                            <span className="font-black text-lg text-amber-950 shrink-0 font-mono">
                              {Math.round(activeTotalPrice * 0.5).toLocaleString()} MAD
                            </span>
                          </div>
                        ) : (
                          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                            <div>
                              <span className="font-black flex items-center gap-1.5 text-xs sm:text-sm text-emerald-800">
                                <Package className="w-4 h-4 text-emerald-600" />
                                {isAr ? 'التسبيق المالي المطلوب:' : 'Acompte requis :'}
                              </span>
                              <span className="text-[11px] text-emerald-700/90 font-medium block mt-0.5">
                                {isAr ? 'صيفط غير الثوب والمستلزمات، كنبداو الفصالة والخياطة مباشرة' : 'Envoyez le tissu, nous lançons la coupe & confection'}
                              </span>
                            </div>
                            <span className="font-black text-sm text-emerald-800 bg-emerald-100/90 px-3.5 py-1.5 rounded-xl shrink-0">
                              {isAr ? '0 درهم (بدون تسبيق مالي)' : '0 MAD (Sans acompte)'}
                            </span>
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400 text-center font-medium">
                          {!isClientFabric
                            ? (isAr ? '✓ الباقي (50%) يؤدى عند استلام السلعة الجاهزة بعد مراقبة الجودة' : '✓ Le solde (50%) est réglé à la livraison après contrôle qualité')
                            : (isAr ? '✓ الخلاص (100%) كيكون حتى تكمل الخدمة وتستلم السلعة الجاهزة' : '✓ Paiement (100%) uniquement à la livraison بعد confection complète')}
                        </p>

                        {/* Essential Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {!isClientFabric ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDemandePage(null);
                                setVirementCommandeId(d.id);
                                setActiveTab('payments');
                              }}
                              className="py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>{isAr ? 'تأكيد الدوفيز وأداء التسبيق (50%)' : 'Valider le Devis & Verser l\'Acompte'}</span>
                            </button>
                          ) : (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
                            >
                              <Package className="w-4 h-4" />
                              <span>{isAr ? 'تأكيد الطلب وإرسال الثوب (0 DH)' : 'Valider & Envoyer le Tissu'}</span>
                            </a>
                          )}

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{isAr ? 'محادثة الورشة فالواتساب' : 'WhatsApp Atelier'}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setConsultingDemande(d)}
                            className="py-3.5 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-indigo-200/90 cursor-pointer shadow-xs active:scale-95"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>{isAr ? 'اسأل مستشار الورشة الذكي' : 'Poser une question'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Study Toggle */}
                    <div className="text-center pt-1 pb-1">
                      <button
                        type="button"
                        onClick={() => setShowFullStudy(!showFullStudy)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <span>{showFullStudy ? '▲' : '▼'}</span>
                        <span>{showFullStudy 
                          ? (isAr ? 'إخفاء الدراسة الفنية الموسعة' : 'Masquer l\'étude détaillée') 
                          : (isAr ? 'عرض الدراسة الفنية الموسعة، الموردين وتتبع المراحل' : 'Voir l\'étude technique complète & fournisseurs')}
                        </span>
                      </button>
                    </div>

                    {/* Extended Technical Study Container (only when toggled) */}
                    {showFullStudy && (
                   <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                     {/* Hero Presentation Header */}
                     <div className="p-6 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-5">
                         <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border-2 border-white/10 shadow-lg">
                            <LeadCardImage
                              lead={d}
                              leadPhotos={leadPhotos}
                              onPhotoLoaded={handlePhotoLoaded}
                              alt={analysis.modeleReel}
                              dark={true}
                              iconSize={8}
                              isAr={isAr}
                            />
                         </div>
                         <div>
                           <div className="flex flex-wrap items-center gap-2 mb-2">
                             <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                               REF: #{d.id.substring(0, 8).toUpperCase()}
                             </span>
                             {isAccepted && <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{isAr ? 'مقبول ✅' : 'Accepté ✅'}</span>}
                             {isRejected && <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{isAr ? 'مرفوض ❌' : 'Refusé ❌'}</span>}
                             {isPending && <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{isAr ? 'دراسة تقنية معتمدة 📋' : 'Étude Technique 📋'}</span>}
                           </div>
                           <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                             {analysis.modeleReel}
                           </h2>
                           <p className="text-xs text-slate-400 mt-1">
                             {isAr ? 'الزبون :' : 'Client :'} <strong className="text-white">{d.name || currentUser?.nom || 'Client'}</strong> • {d.date ? new Date(d.date).toLocaleDateString() : new Date().toLocaleDateString()}
                           </p>
                         </div>
                       </div>

                       <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                         <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-center sm:text-right md:text-right">
                           <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">{isAr ? 'الكمية المطلوبة' : 'Quantité'}</span>
                           <span className="text-xl font-black text-white">{currentQty} pcs</span>
                         </div>
                         <div className="px-4 py-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-center sm:text-right md:text-right">
                           <span className="text-[10px] text-indigo-300 uppercase tracking-widest block font-bold">{isAr ? 'مدة التسليم المقدرة' : 'Délai'}</span>
                           <span className="text-xs font-black text-indigo-200 flex items-center justify-center sm:justify-end md:justify-end gap-1">
                             <Clock className="w-3.5 h-3.5" />
                             {analysis.delaiEstime}
                           </span>
                         </div>
                       </div>
                     </div>

                     {/* 4-Step Tracker */}
                     <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                       <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
                         <span className="flex items-center gap-2">
                           <Clock className="w-4 h-4 text-indigo-600" />
                           {isAr ? 'تتبع مراحل طلبك في الورشة' : 'Progression de la Commande'}
                         </span>
                         <span className="text-indigo-600 font-black">
                           {stepLabels[Math.min(currentStepIdx, 3)] ? (isAr ? stepLabels[Math.min(currentStepIdx, 3)].ar : stepLabels[Math.min(currentStepIdx, 3)].fr) : 'Étude'}
                         </span>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {stepLabels.map((st, sIdx) => {
                           const isDone = currentStepIdx > sIdx;
                           const isCurrent = currentStepIdx === sIdx;
                           return (
                             <div key={st.key} className={`p-4 rounded-2xl border transition-all ${
                               isCurrent ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' :
                               isDone ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
                               'bg-white text-slate-400 border-slate-200'
                             }`}>
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-lg">{isDone ? '✅' : st.icon}</span>
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-200' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                                   Étape {sIdx + 1}
                                 </span>
                               </div>
                               <h4 className={`text-xs font-black ${isCurrent ? 'text-white' : isDone ? 'text-emerald-950' : 'text-slate-700'}`}>
                                 {isAr ? st.ar.split('. ')[1] : st.fr.split('. ')[1]}
                               </h4>
                             </div>
                           );
                         })}
                       </div>
                     </div>

                     {/* The Main Information Body (what was circled by user) */}
                     <div className="p-6 md:p-8 space-y-8">
                       {/* 1. Official Human Atelier Review & Certification Stamp */}
                       <div className="p-5 md:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20 shrink-0">
                             ✓
                           </div>
                           <div>
                             <div className="flex items-center gap-2">
                               <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                                 {isAr ? 'معتمد رسمياً' : 'Certifié Conforme'}
                               </span>
                               <h4 className="text-sm font-black text-slate-900">
                                 {isAr ? 'دراسة فنية معتمدة من رئيس ورشة BEYA CREATIVE' : 'Étude Technique Validée par le Chef d\'Atelier BEYA'}
                               </h4>
                             </div>
                             <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                               {isAr 
                                 ? 'تمت مراجعة هذا الموديل وتدقيق دقائق الخياطة واستهلاك الأقمشة يدوياً من طرف فريق الباترون والخياطة لضمان أعلى جودة.' 
                                 : 'Ce modèle et son devis ont été vérifiés manuellement par notre bureau des méthodes et patronage.'}
                             </p>
                           </div>
                         </div>
                         <div className="px-3.5 py-2 bg-white/80 backdrop-blur rounded-xl border border-amber-200/80 text-[11px] font-black text-amber-900 shrink-0 flex items-center gap-1.5 shadow-xs">
                           <ShieldCheck className="w-4 h-4 text-amber-600" />
                           <span>BEYA Atelier Stamp #{d.id.substring(0, 6).toUpperCase()}</span>
                         </div>
                       </div>

                       {/* 2. Pre-Production Engineering Package (Patronage & Échantillonnage) */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Scissors className="w-4 h-4 text-indigo-600" />
                              {isAr ? 'خدمات ما قبل الإنتاج (الباترون والعينة)' : 'Pack Pré-Production (Patronage & Échantillon)'}
                            </h3>
                            {isTestAccount && (
                              <button
                                type="button"
                                onClick={() => openQuickEdit(d)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <span>✏️</span> {isAr ? 'تحديد / تعديل أسعار الباترون والعينة' : 'Fixer les Prix Atelier'}
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Patronage Card */}
                            <div className={`p-5 rounded-3xl border transition-all ${
                              analysis.hasCustomPatronage
                                ? 'bg-white border-slate-200/80 shadow-xs hover:border-indigo-300'
                                : 'bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 border-amber-200/80 shadow-xs'
                            }`}>
                              <div className="flex items-start justify-between mb-3">
                                {analysis.hasCustomPatronage ? (
                                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                                    <span>✓</span> {isAr ? 'معتمد من الموديلست' : 'Validé Modéliste'}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                                    <Clock className="w-3 h-3 animate-spin text-amber-700" />
                                    {isAr ? 'قيد التدقيق الفني' : 'En cours d\'étude'}
                                  </span>
                                )}
                                
                                {analysis.hasCustomPatronage ? (
                                  <span className="text-2xl font-black text-slate-900">
                                    {analysis.patronagePrice} <span className="text-xs font-bold text-slate-500">MAD</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-amber-500/10 text-amber-900 text-xs font-black rounded-lg border border-amber-300/40 flex items-center gap-1.5">
                                    <span>⏳</span> {isAr ? 'قيد التقييم من طرف الموديلست' : 'À déterminer par le Modéliste'}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-1.5">
                                <span>📐</span> {isAr ? 'الباتروناج والتدريج الرقمي (Gradation)' : 'Patronage Numérique & Gradation'}
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {analysis.hasCustomPatronage ? (
                                  isAr 
                                    ? 'تصميم رقمي دقيق لجميع المقاسات (XS-XXL) بنظام CAD معتمد من الموديلست. تدفع لمرة واحدة ويبقى ملكاً لعلامتك لإعادة الإنتاج (Réassort) في أي وقت.' 
                                    : 'Création du patron industriel aux normes et gradation toutes tailles validée par le modéliste. Réutilisable à vie pour tous vos réassorts.'
                                ) : (
                                  isAr 
                                    ? 'يقوم الموديلست حالياً بدراسة تفاصيل قصة الموديل وتحديد تكلفة الباتروناج والتدريج الرقمي بدقة حسب تعقيد الموديل.' 
                                    : 'Le modéliste étudie actuellement les détails du modèle pour déterminer le tarif exact du patronage.'
                                )}
                              </p>
                            </div>

                            {/* Échantillon Card */}
                            <div className={`p-5 rounded-3xl border transition-all ${
                              analysis.hasCustomEchantillon
                                ? 'bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border-indigo-200/80 shadow-xs hover:border-indigo-400'
                                : 'bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 border-indigo-200/50 shadow-xs'
                            }`}>
                              <div className="flex items-start justify-between mb-3">
                                {analysis.hasCustomEchantillon ? (
                                  <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                                    <span>⭐</span> {isAr ? 'تُخصم من الإنتاج • معتمد' : 'Déductible • Validé'}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                                    <Clock className="w-3 h-3 animate-spin text-indigo-700" />
                                    {isAr ? 'ورشة النماذج' : 'Atelier Prototype'}
                                  </span>
                                )}

                                {analysis.hasCustomEchantillon ? (
                                  <span className="text-2xl font-black text-indigo-950">
                                    {analysis.echantillonPrice} <span className="text-xs font-bold text-indigo-600">MAD</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-900 text-xs font-black rounded-lg border border-indigo-300/40 flex items-center gap-1.5">
                                    <span>⏳</span> {isAr ? 'في انتظار تحديد تكلفة العينة' : 'En attente de chiffrage'}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-black text-indigo-950 mb-1 flex items-center gap-1.5">
                                <span>✂️</span> {isAr ? 'العينة التجريبية الأولية (Prototype)' : 'Échantillon / Prototype Physique'}
                              </h4>
                              <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
                                {analysis.hasCustomEchantillon ? (
                                  isAr 
                                    ? 'حبة نموذجية كاملة للفحص والموافقة على القماش والفينيسيون. يُخصم هذا المبلغ بالكامل من فاتورة الإنتاج عند الاعتماد!' 
                                    : 'Pièce prototype physique pour valider coupe et finitions. 100% déductible du montant total lors du lancement série.'
                                ) : (
                                  isAr 
                                    ? 'جاري تقييم تكلفة تفصيل وخياطة العينة الأولية بالورشة. هذا المبلغ مسترجع ويُخصم بالكامل 100% من فاتورة الإنتاج عند الاعتماد.' 
                                    : 'L\'atelier évalue actuellement le coût de confection du prototype (déductible à 100% de la commande de production).'
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 3. Interactive Wholesale Quantity Simulator */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-indigo-600" />
                              {isAr ? 'حاسبة أسعار الجملة التفاعلية (Simulateur Quantités)' : 'Simulateur de Devis & Paliers de Quantité'}
                            </h3>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
                              {isAr ? 'كلما زادت الكمية، انخفض سعر القطعة' : 'Tarifs dégressifs selon le volume'}
                            </span>
                          </div>

                          <div className="p-6 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50/80 rounded-3xl border border-indigo-100 shadow-xs space-y-6">
                            {/* Quantity Tier Selector Buttons */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                                {isAr ? 'اختر بالي الكمية لتجربة السعر مباشرة:' : 'Sélectionnez un palier de production :'}
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {[
                                  { qty: 30, labelAr: '30 حبة', labelFr: '30 pcs', tagAr: 'تجريبي (+18%)', tagFr: '+18%' },
                                  { qty: 50, labelAr: '50 حبة', labelFr: '50 pcs', tagAr: 'إطلاق (+8%)', tagFr: '+8%' },
                                  { qty: 100, labelAr: '100 حبة', labelFr: '100 pcs', tagAr: 'قياسي (الأساس)', tagFr: 'Standard' },
                                  { qty: 300, labelAr: '300 حبة', labelFr: '300 pcs', tagAr: 'توفير 10%', tagFr: '-10%' },
                                  { qty: 500, labelAr: '500 حبة', labelFr: '500 pcs', tagAr: 'توفير 16%', tagFr: '-16%' }
                                ].map(tier => {
                                  const isSelected = currentQty === tier.qty;
                                  return (
                                    <button
                                      key={tier.qty}
                                      type="button"
                                      onClick={() => setSelectedTierQty(prev => ({ ...prev, [d.id]: tier.qty }))}
                                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                        isSelected 
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-102 font-black' 
                                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 font-bold'
                                      }`}
                                    >
                                      <div className="text-sm font-black">{isAr ? tier.labelAr : tier.labelFr}</div>
                                      <div className={`text-[9px] uppercase tracking-wider font-extrabold mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-indigo-600'}`}>
                                        {isAr ? tier.tagAr : tier.tagFr}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Manual Quantity Range Slider */}
                              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-600 shrink-0">
                                  {isAr ? 'أو حدد كمية خاصة:' : 'Ou ajustez au curseur :'}
                                </span>
                                <input
                                  type="range"
                                  min="20"
                                  max="1000"
                                  step="10"
                                  value={currentQty}
                                  onChange={(e) => setSelectedTierQty(prev => ({ ...prev, [d.id]: Number(e.target.value) }))}
                                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                                />
                                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black shrink-0">
                                  {currentQty} pcs
                                </span>
                              </div>
                            </div>

                            {/* Active Dynamic Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-indigo-100/60 pt-2">
                              <div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">
                                  {isAr ? `السعر للقطعة الواحدة (${currentQty} حبة)` : `Prix Unitaire (${currentQty} pcs)`}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-4xl md:text-5xl font-black text-indigo-950 tracking-tight">{activeUnitPrice}</span>
                                  <span className="text-sm font-black text-indigo-600">MAD / pc</span>
                                </div>
                                <p className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1.5">
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  {isAr ? 'يشمل الثوب، الفصالة، الخياطة والتطريز/الطباعة' : 'Inclus tissu, coupe, confection et marquage'}
                                </p>
                              </div>

                              <div className="md:text-right flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                    {isAr ? `إجمالي طلبيتك (${currentQty} قطعة)` : `Total Commande (${currentQty} pcs)`}
                                  </span>
                                  <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                    {activeTotalPrice.toLocaleString()} <span className="text-sm font-bold text-slate-500">MAD</span>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg">
                                    {isAr ? 'دوفيس معتمد من إدارة الورشة' : 'Devis Atelier Validé'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Cost Breakdown Table */}
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                              <table className="w-full text-xs">
                                <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                                  <tr>
                                    <th className="p-3.5 text-left">{isAr ? 'البيان' : 'Poste de Coût'}</th>
                                    <th className="p-3.5 text-right">{isAr ? 'التقدير / القطعة' : 'Estimation / pc'}</th>
                                    <th className="p-3.5 text-right">{isAr ? 'المجموع' : 'Total'}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  <tr>
                                    <td className="p-3.5 font-bold text-slate-700">{isAr ? 'المواد الأولية (الأقمشة، مستلزمات الخياطة والإكسسوارات)' : 'Matières premières (Tissus, fournitures & accessoires)'}</td>
                                    <td className="p-3.5 text-right font-mono font-bold text-slate-700">{Math.round(activeUnitPrice * 0.48)} MAD</td>
                                    <td className="p-3.5 text-right font-mono font-bold text-slate-700">{Math.round(activeUnitPrice * 0.48 * currentQty).toLocaleString()} MAD</td>
                                  </tr>
                                  <tr className="bg-slate-50/40">
                                    <td className="p-3.5 font-bold text-slate-700">{isAr ? 'الفصالة والخياطة والتركيب الصناعي' : 'Coupe, confection et assemblage industriel'}</td>
                                    <td className="p-3.5 text-right font-mono font-bold text-slate-700">{Math.round(activeUnitPrice * 0.32)} MAD</td>
                                    <td className="p-3.5 text-right font-mono font-bold text-slate-700">{Math.round(activeUnitPrice * 0.32 * currentQty).toLocaleString()} MAD</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3.5 font-bold text-slate-700">{isAr ? 'الماركينغ، الطباعة/التطريز والفينيسيون' : 'Marquage, finitions & packaging'}</td>
                                    <td className="p-3.5 text-right font-mono font-bold text-slate-700">{Math.round(activeUnitPrice * 0.20)} MAD</td>
                                    <td className="p-3.5 text-right font-mono font-bold text-slate-700">{Math.round(activeUnitPrice * 0.20 * currentQty).toLocaleString()} MAD</td>
                                  </tr>
                                  <tr className="bg-indigo-50/80 font-black text-indigo-950 text-sm">
                                    <td className="p-4">{isAr ? 'السعر الصافي للقطعة' : 'PRIX UNITAIRE HT'}</td>
                                    <td className="p-4 text-right font-mono text-base text-indigo-700">{activeUnitPrice} MAD</td>
                                    <td className="p-4 text-right font-mono text-base text-indigo-700">{activeTotalPrice.toLocaleString()} MAD</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                       {/* Technical Specifications */}
                       <div>
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Scissors className="w-4 h-4 text-indigo-600" />
                           {isAr ? 'المواصفات التقنية والمواد' : 'Cahier des Charges & Matières'}
                         </h3>
                         <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
                           <div className="p-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <span className="text-xs font-bold text-slate-500 w-1/3">{isAr ? 'القماش الرئيسي المقترح' : 'Matière Principale'}</span>
                             <span className="text-xs font-black text-slate-900 flex-1">{analysis.tissuSuggere}</span>
                           </div>
                           <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <span className="text-xs font-bold text-slate-500 w-1/3">{isAr ? 'الفصالة والباترون' : 'Patronage & Coupe'}</span>
                             <span className="text-xs font-bold text-slate-700 flex-1">{isAr ? 'باترون احترافي رقمي بمقاسات مظبوطة (Coupe Numérique Haute Précision)' : 'Patronage industriel numérique avec gradation normée'}</span>
                           </div>
                           <div className="p-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <span className="text-xs font-bold text-slate-500 w-1/3">{isAr ? 'الفصالة والتشطيبات والإكسسوارات' : 'Finitions & Fournitures'}</span>
                             <span className="text-xs font-bold text-slate-800 flex-1">{analysis.techDetails}</span>
                           </div>
                           <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <span className="text-xs font-bold text-slate-500 w-1/3">{isAr ? 'الطباعة / التطريز' : 'Marquage / Sérigraphie'}</span>
                             <span className="text-xs font-bold text-slate-700 flex-1">{isAr ? 'سيريغرافي عالي الجودة أو تطريز بارز على الصدر' : 'Sérigraphie textile haute tenue / Broderie relief poitrine'}</span>
                           </div>
                           <div className="p-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <span className="text-xs font-bold text-slate-500 w-1/3">{isAr ? 'مدة إعداد العينة والإنتاج' : 'Délai Réalisation'}</span>
                             <span className="text-xs font-black text-indigo-700 flex-1">{analysis.delaiEstime}</span>
                           </div>
                         </div>
                       </div>

                       {/* Sizes Breakdown */}
                       <div>
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Layers className="w-4 h-4 text-indigo-600" />
                           {isAr ? 'المقاسات والكميات المطلوبة' : 'Grille des Tailles'}
                         </h3>
                         <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
                           {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                             <div key={sz} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">{sz}</span>
                               <span className="text-base font-black text-slate-900">{sizes[sz] ? `${sizes[sz]} pcs` : (hasCustomSizes ? '0' : '—')}</span>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* 4. Fabric Sourcing & Partner Suppliers Pilot (موردي الأقمشة - التجربة الجديدة) */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Box className="w-4 h-4 text-indigo-600" />
                              {isAr ? 'الأقمشة والموردون المعتمدون (Sourcing Matières)' : 'Sourcing Matières & Fournisseurs Partenaires'}
                            </h3>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {isAr ? 'تجربة حصرية لزبناء BEYA' : 'Offre Partenariat BEYA'}
                            </span>
                          </div>

                          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                  {isAr ? 'نوع القماش المنصوح به' : 'Tissu Conseillé'}
                                </span>
                                <div className="text-sm font-black text-slate-900">{analysis.tissuSuggere}</div>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                  {isAr ? 'استهلاك القماش التقديري' : 'Consommation Estimée'}
                                </span>
                                <div className="text-sm font-black text-slate-900">
                                  {analysis.tissuConsoMeters} m / pc <span className="text-xs text-slate-500 font-bold">(~{Math.round(analysis.tissuConsoMeters * currentQty)} متر للطلبية)</span>
                                </div>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                  {isAr ? 'سعر الثوب التقريبي بالسوق' : 'Prix Moyen au Kilo'}
                                </span>
                                <div className="text-sm font-black text-indigo-600">
                                  {analysis.tissuPricePerKg} MAD <span className="text-xs text-slate-500 font-bold">/ kg</span>
                                </div>
                              </div>
                            </div>

                            {/* Direct WhatsApp Sourcing Action */}
                            <div className="pt-2">
                              <a
                                href={`https://wa.me/212661000003?text=${encodeURIComponent(
                                  isAr 
                                    ? `السلام عليكم، أنا زبون من طرف ورشة BEYA Creative (كود الشراكة: BEYA-FABRIC-2026). عندي طلبية لموديل ${analysis.modeleReel} (${currentQty} قطعة)، محتاج قماش ${analysis.tissuSuggere}. واش متوفر عندكم وبشحال الكيلو؟ شكراً.`
                                    : `Bonjour, je suis client chez l'Atelier BEYA Creative (Code Partenaire : BEYA-FABRIC-2026). Pour mon modèle ${analysis.modeleReel} (${currentQty} pcs), je souhaite commander le tissu ${analysis.tissuSuggere}. Pouvez-vous me confirmer le tarif ? Merci.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 cursor-pointer text-center"
                              >
                                <MessageCircle className="w-5 h-5" />
                                <span>{isAr ? 'تواصل مع مورد الثوب (كود BEYA)' : 'Contacter le Fournisseur (Code BEYA)'}</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* 5. Conditional Artisans & Craftsmen Network (شبكة الحرفيين المعتمدين للموديل) */}
                        {(analysis.hasBroderie || analysis.hasPrint) && (
                          <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              {isAr ? 'الحرفيون والشركاء المعتمدون للموديل' : 'Artisans & Spécialistes Agréés pour ce Modèle'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Broderie Card */}
                              {analysis.hasBroderie && (
                                <div className="p-5 bg-gradient-to-br from-amber-50/60 via-white to-white rounded-3xl border border-amber-200 shadow-xs space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
                                      🧵
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-black text-slate-900">
                                        {isAr ? 'أتيليه الأمل للطرز الرقمي (Broderie Industrielle)' : 'Atelier Broderie Industrielle Al-Amal'}
                                      </h4>
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                                        {isAr ? 'شريك معتمد لدى BEYA • الدار البيضاء' : 'Partenaire Agréé BEYA • Casablanca'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Call Etiquette Banner */}
                                  <div className="p-3.5 bg-amber-100/60 rounded-2xl text-[11px] text-amber-950 space-y-1 font-medium border border-amber-200/60">
                                    <div className="font-black text-amber-900 flex items-center gap-1.5">
                                      <span>⏱️</span> {isAr ? 'إرشادات الاتصال بالصانع (احترام وقت الورشة):' : "Charte d'Appel (Respect du temps de l'atelier) :"}
                                    </div>
                                    <p className="leading-relaxed">
                                      {isAr 
                                        ? 'الصانع كيكون واقف فالماكينة وتحت ضغط الإنتاج. باش يجاوبك فالحين، خلي مكالمتك مركزة فـ دقيقة: حدد حجم الطرزة بالسنتمتر، الكمية المطلوبة، واذكر « كود BEYA-BROD » للاستفادة من ثمن الشراكة.' 
                                        : "L'artisan est sur ses machines. Soyez concis lors de l'appel : précisez la taille en cm, la quantité et mentionnez le code BEYA-BROD."}
                                    </p>
                                  </div>

                                  <a
                                    href={`https://wa.me/212661000001?text=${encodeURIComponent(
                                      isAr 
                                        ? `السلام عليكم سي كمال (أتيليه التطريز)، أنا كليان من طرف BEYA Creative (كود BEYA-BROD). عندي موديل ${analysis.modeleReel} بكمية ${currentQty} قطعة وفيه تطريز. عافاك شحال التكلفة التقريبية للغرزة والوقت المتوقع؟ شكراً.`
                                        : `Bonjour Atelier Broderie Al-Amal, je vous contacte de la part de BEYA Creative (Code : BEYA-BROD). J'ai une commande pour le modèle ${analysis.modeleReel} (${currentQty} pcs) avec broderie. Pouvez-vous m'indiquer le tarif indicatif et délai ? Merci.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 cursor-pointer text-center"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{isAr ? 'مراسلة المطرز المعتمد (رسالة جاهزة)' : 'WhatsApp Brodeur (Message Prêt)'}</span>
                                  </a>
                                </div>
                              )}

                              {/* Print / Sérigraphie Card */}
                              {analysis.hasPrint && (
                                <div className="p-5 bg-gradient-to-br from-indigo-50/60 via-white to-white rounded-3xl border border-indigo-200 shadow-xs space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20">
                                      🎨
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-black text-slate-900">
                                        {isAr ? 'مختبر برينت-لاب للطباعة (Sérigraphie & DTF)' : 'PrintLab Textile (Sérigraphie & DTF)'}
                                      </h4>
                                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                                        {isAr ? 'شريك معتمد لدى BEYA • الدار البيضاء' : 'Partenaire Agréé BEYA • Casablanca'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Call Etiquette Banner */}
                                  <div className="p-3.5 bg-indigo-100/60 rounded-2xl text-[11px] text-indigo-950 space-y-1 font-medium border border-indigo-200/60">
                                    <div className="font-black text-indigo-900 flex items-center gap-1.5">
                                      <span>⏱️</span> {isAr ? 'إرشادات الاتصال بالمطبعة:' : "Charte d'Appel pour l'Imprimeur :"}
                                    </div>
                                    <p className="leading-relaxed">
                                      {isAr 
                                        ? 'المطبعة كتحتاج تعرف: عدد ألوان التصميم، مكان الطباعة (الصدر أو الظهر)، والكمية. اذكر « كود BEYA-PRINT » لتطبيق التسعيرة الخاصة.' 
                                        : 'Indiquez immédiatement : nombre de couleurs, emplacement (poitrine/dos) et quantité. Donnez le code BEYA-PRINT.'}
                                    </p>
                                  </div>

                                  <a
                                    href={`https://wa.me/212661000002?text=${encodeURIComponent(
                                      isAr 
                                        ? `السلام عليكم مطبعة برينت-لاب، أنا كليان من طرف BEYA Creative (كود BEYA-PRINT). عندي طلبية موديل ${analysis.modeleReel} بـ ${currentQty} قطعة فيها طباعة سيريغرافي/DTF. عافاك شحال تكلفة الأفلام والتثبيت؟ شكراً.`
                                        : `Bonjour PrintLab, je vous contacte via BEYA Creative (Code : BEYA-PRINT). J'ai une production de ${analysis.modeleReel} (${currentQty} pcs) avec sérigraphie. Quel est le tarif de calage et tirage ? Merci.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer text-center"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{isAr ? 'مراسلة المطبعة المعتمدة (رسالة جاهزة)' : 'WhatsApp Imprimeur (Message Prêt)'}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Atelier Direct Note */}
                       <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-3xl flex items-start gap-4">
                         <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                           <MessageCircle className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-black text-indigo-700 uppercase tracking-wider mb-1">
                             {isAr ? 'ملاحظة ودراسة ورشة BEYA CREATIVE' : "Note d'Étude de l'Atelier BEYA"}
                           </p>
                           <p className="text-sm font-semibold text-slate-700 italic leading-relaxed">
                             "{analysis.reponseAtelier}"
                           </p>
                         </div>
                       </div>

                       {/* Quality Guarantee Box */}
                       <div className="p-5 bg-emerald-50/70 border border-emerald-100 rounded-3xl text-xs text-emerald-900 space-y-2">
                         <p className="font-black text-sm flex items-center gap-2">
                           <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                           {isAr ? 'ضمان ورشة BEYA CREATIVE للجودة والمطابقة' : 'Garantie Conformité & Qualité Atelier BEYA'}
                         </p>
                         <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                           {isAr 
                             ? 'يتم إعداد عينة أولية (Prototype Échantillon) واعتمادها من طرفكم قبل إطلاق الإنتاج الشامل. يتم دفع تسبيق 50% عند انطلاق العينة والباقي عند التسليم النهائي بعد مراقبة الجودة.' 
                             : "Un prototype d'échantillon physique est validé avant le lancement de la production en série. Acompte de 50% au lancement, solde à la livraison après contrôle qualité."}
                         </p>
                       </div>
                     </div>

                     {/* Bottom Action Footer */}
                     <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedDemandePage(null)}
                            className="w-full sm:w-auto px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            {isAr ? '← الرجوع إلى قائمة الطلبات' : '← Retour aux demandes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDemandePage(null);
                              setVirementCommandeId(d.id);
                              setActiveTab('payments');
                            }}
                            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>{isAr ? '💳 أداء التسبيق / إرسال التوصيل' : '💳 Payer un Acompte / Reçu'}</span>
                          </button>
                        </div>

                        <a
                          href={waUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 hover:shadow-2xl cursor-pointer text-center"
                       >
                         <MessageCircle className="w-5 h-5" />
                         <span>{isAr ? 'تأكيد العرض وبدء العينة عبر واتساب' : 'Valider le Devis & Lancer sur WhatsApp'}</span>
                       </a>
                     </div>
                   </div>
                    )}

                    
                 </div>
               );
             }

             return (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-center md:text-left">
                   <div>
                     <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{isAr ? 'تتبع طلباتي' : 'Mes Demandes'}</h1>
                     <p className="text-slate-500 font-medium italic">{isAr ? 'حالة الطلبات اللي صيفطتي' : 'Statut de vos demandes envoyées'}</p>
                   </div>
                   <button 
                     onClick={() => {
                       setEditingDemandeId(null);
                       setNewOrderForm({
                         modele: '',
                         quantite: '',
                         details: '',
                         photo: null as string | null,
                         telephone: currentUser?.telephone || '',
                         tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' } as Record<string, string>
                       });
                       setShowNewOrderModal(true);
                     }}
                     className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                   >
                     <Plus className="w-5 h-5" />
                     {isAr ? 'موديل جديد' : 'Nouveau Modèle'}
                   </button>
                </div>

                {trueDemandes.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{isAr ? 'ماكاين حتى طلب' : 'Aucune demande'}</h3>
                    <p className="text-slate-500 mb-6">{isAr ? 'باقي ما صيفطتي لينا حتى موديل' : 'Vous n\'avez encore envoyé aucun modèle.'}</p>
                    <button 
                      onClick={() => {
                        setEditingDemandeId(null);
                        setNewOrderForm({
                          modele: '',
                          quantite: '',
                          details: '',
                          photo: null as string | null,
                          telephone: currentUser?.telephone || '',
                          tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' } as Record<string, string>
                        });
                        setShowNewOrderModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      {isAr ? '+ إضافة أول موديل ديالك الآن' : '+ Ajouter votre premier modèle'}
                    </button>
                  </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {trueDemandes.map(d => {
                       const isAccepted = d.crmStage === 'confirme';
                       const isRejected = d.crmStage === 'annule';
                       const isPending = !isAccepted && !isRejected;
                       const analysis = getDemandeAnalysis(d, isAr);
                       
                       const isTestAccount = currentUser?.email === 'forsaone41@gmail.com' || currentUser?.role === 'admin' || currentUser?.role === 'manager';

                       // For all other clients, keep the standard card until testing is complete
                       if (!isTestAccount) {
                         return (
                           <div key={d.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group">
                             <div className="h-48 bg-slate-100 relative overflow-hidden">
                                <LeadCardImage
                                  lead={d}
                                  leadPhotos={leadPhotos}
                                  onPhotoLoaded={handlePhotoLoaded}
                                  alt={d.type}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  dark={false}
                                  iconSize={10}
                                  isAr={isAr}
                                />
                               <div className="absolute top-4 left-4 flex gap-2">
                                 {isAccepted && <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">{isAr ? 'مقبول ✅' : 'Accepté ✅'}</span>}
                                 {isRejected && <span className="px-3 py-1 bg-rose-500/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">{isAr ? 'مرفوض ❌' : 'Refusé ❌'}</span>}
                                 {isPending && <span className="px-3 py-1 bg-amber-500/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">{isAr ? 'قيد المراجعة ⏳' : 'En attente ⏳'}</span>}
                               </div>
                               {isPending && (
                                 <div className={`absolute top-4 right-4 flex flex-col gap-2 z-10`}>
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setEditingDemandeId(d.id);
                                       let parsedTailles = { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' };
                                       if (d.tailles) {
                                          (d.tailles ? Object.entries(d.tailles) : []).forEach(([k, v]) => { if (parsedTailles[k] !== undefined) parsedTailles[k] = String(v); });
                                       } else if (d.sizes) {
                                          try {
                                            const parsed = typeof d.sizes === 'string' ? JSON.parse(d.sizes) : d.sizes;
                                            Object.entries(parsed).forEach(([k, v]) => { if (parsedTailles[k] !== undefined) parsedTailles[k] = String(v); });
                                          } catch(e) {}
                                       }
                                       setNewOrderForm({
                                         modele: d.type || '',
                                         quantite: d.quantity?.toString() || '',
                                         photo: d.photo || (d.photos && d.photos[0]) || leadPhotos[d.id] || null,
                                         details: extractCleanUserNotes(d.details),
                                         telephone: d.phone || currentUser?.telephone || '',
                                         tailles: parsedTailles
                                       });
                                       setShowNewOrderModal(true);
                                     }}
                                     className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                                   >
                                     <Edit2 className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={(e) => handleOpenDeleteModal(d, e)}
                                     className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </div>
                               )}
                             </div>
                             <div className="p-6">
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">REF: {d.id.substring(0, 8)}</div>
                               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 truncate" title={d.type}>{cleanLangText(d.type, isAr)}</h3>
                               <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl inline-block">
                                 {isAr ? 'الكمية:' : 'Quantité :'} <span className="text-indigo-600">{d.quantity}</span>
                               </div>
                             </div>
                           </div>
                         );
                       }

                       return (
                         <div key={d.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-indigo-100/80 hover:border-indigo-100">
                            <div>
                              {/* Photo Header */}
                              <div className="h-56 bg-slate-900 relative overflow-hidden">
                                <LeadCardImage
                                  lead={d}
                                  leadPhotos={leadPhotos}
                                  onPhotoLoaded={handlePhotoLoaded}
                                  alt={analysis.modeleReel}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100 cursor-pointer"
                                  onClick={() => setSelectedDemandePage(d)}
                                  dark={true}
                                  iconSize={12}
                                  isAr={isAr}
                                />

                                {/* Top Left Status Badge */}
                                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                                  {isAccepted && (
                                    <span className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md border border-emerald-400/30 flex items-center gap-1.5">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>{isAr ? 'مقبول' : 'Accepté'}</span>
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="px-3 py-1.5 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md border border-rose-400/30">
                                      {isAr ? 'مرفوض ❌' : 'Refusé ❌'}
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="px-3 py-1.5 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md border border-indigo-400/30 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                      <span>{isAr ? 'دراسة تقنية 📋' : 'Étude Technique 📋'}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Top Right Reference */}
                                <div className="absolute top-3.5 right-3.5 z-10">
                                  <span className="px-2.5 py-1.5 bg-slate-950/75 backdrop-blur-md text-slate-300 text-[10px] font-mono font-bold tracking-wider rounded-xl border border-white/10 shadow-sm">
                                    #{d.id.substring(0, 8).toUpperCase()}
                                  </span>
                                </div>

                                {/* Bottom Image Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex items-end p-4 pointer-events-none">
                                  <span className="text-white/90 text-xs font-black uppercase tracking-wider block">

                                    {isAr ? 'تصنيع عالي الجودة' : 'Confection Premium'}
                                  </span>
                                </div>
                              </div>

                              {/* Clean Card Body */}
                              <div className="p-5 space-y-3 cursor-pointer" onClick={() => setSelectedDemandePage(d)}>
                                <div>
                                  <h3 className="text-xl font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors" title={analysis.modeleReel}>
                                    {analysis.modeleReel}
                                  </h3>
                                  <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                                    {analysis.tissuSuggere}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{isAr ? 'الكمية المطلوبة' : 'Quantité'}</span>
                                    <span className="text-sm font-black text-slate-900">{analysis.qty} pcs</span>
                                  </div>
                                  <div className={isAr ? 'text-left' : 'text-right'}>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">{isAr ? 'الخياطة من' : 'Façon dès'}</span>
                                    <span className="text-sm font-black text-indigo-950">{analysis.confectionPrice || analysis.unitPrice} MAD <span className="text-[10px] font-bold text-slate-500">/ pc</span></span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions Toolbar in Footer */}
                            <div className="p-5 pt-0 space-y-2.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDemandePage(d)}
                                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/25 cursor-pointer group active:scale-[0.99]"
                              >
                                <FileText className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                                <span>{isAr ? 'عرض دراسة الموديل والتسعير ←' : 'Voir la Fiche & Devis Complet →'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDemandePage(d);
                                  setConsultingDemande(d);
                                }}
                                className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{isAr ? '💬 اسأل مستشار الورشة على هاد الموديل' : '💬 Poser une question sur ce modèle'}</span>
                              </button>

                              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                {isTestAccount && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAtelierQuickEditLead(d);
                                      setQuickEditForm({
                                        modeleReel: analysis.modeleReel,
                                        patronagePrice: analysis.patronagePrice,
                                        prixEchantillon: analysis.echantillonPrice,
                                        unitPrice: analysis.unitPrice,
                                        totalPrice: analysis.totalPrice,
                                        tissuSuggere: analysis.tissuSuggere,
                                        techDetails: analysis.techDetails,
                                        delaiEstime: analysis.delaiEstime,
                                        statusProgression: analysis.statusProgression,
                                        reponseAtelier: analysis.reponseAtelier
                                      });
                                    }}
                                    className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:border-amber-300"
                                    title={isAr ? 'تعديل دراسة الورشة والتسعير' : 'Réponse & Édition Atelier'}
                                  >
                                    <span>⚙️</span>
                                    <span className="truncate">{isAr ? 'رد وتعديل الورشة' : 'Réponse Atelier'}</span>
                                  </button>
                                )}

                                {isPending && (
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingDemandeId(d.id);
                                      let parsedTailles = { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' };
                                      if (d.tailles) {
                                         (d.tailles ? Object.entries(d.tailles) : []).forEach(([k, v]) => { if (parsedTailles[k] !== undefined) parsedTailles[k] = String(v); });
                                      } else if (d.sizes) {
                                         try {
                                           const parsed = typeof d.sizes === 'string' ? JSON.parse(d.sizes) : d.sizes;
                                           Object.entries(parsed).forEach(([k, v]) => { if (parsedTailles[k] !== undefined) parsedTailles[k] = String(v); });
                                         } catch(e) {}
                                      }
                                      setNewOrderForm({
                                        modele: d.type || '',
                                        quantite: d.quantity?.toString() || '',
                                        photo: d.photo || (d.photos && d.photos[0]) || leadPhotos[d.id] || null,
                                        details: extractCleanUserNotes(d.details),
                                        telephone: d.phone || currentUser?.telephone || '',
                                        tailles: parsedTailles
                                      });
                                      setShowNewOrderModal(true);
                                    }}
                                    className={`${isTestAccount ? 'p-2' : 'flex-1 py-2 px-3'} bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 shrink-0`}
                                    title={isAr ? 'تعديل الطلب' : 'Modifier'}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    {!isTestAccount && <span>{isAr ? 'تعديل الطلب' : 'Modifier'}</span>}
                                  </button>
                                )}

                                <button 
                                  type="button"
                                  onClick={(e) => handleOpenDeleteModal(d, e)}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200/80 shrink-0"
                                  title={isAr ? 'حذف الطلب' : 'Supprimer'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                       );
                     })}
                   </div>
                )}
             </div>
           );})()}

          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-center md:text-left">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{isAr ? 'تتبع الإنتاج' : 'Mes Productions'}</h1>
                    <p className="text-slate-500 font-medium italic">{isAr ? 'إليك تفاصيل كاملة عن سير أعمالك' : 'Détails complets de vos commandes en cours'}</p>
                  </div>
                  <div className="relative mx-auto md:mx-0 w-full md:w-auto">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Référence..."
                       className="pl-11 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200/50 outline-none focus:border-indigo-600 transition-all w-full md:w-64"
                       value={reference}
                       onChange={(e) => setReference(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                     />
                  </div>
               </div>

               <div className="space-y-4 md:space-y-8">
                 {found.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-indigo-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">{isAr ? 'لا توجد طلبيات' : 'Aucune Production'}</h3>
                      <p className="text-slate-500 max-w-md mx-auto">{isAr ? 'ليس لديك أي طلبيات في طور الإنتاج حالياً. سيتم عرض طلبياتك هنا بمجرد تأكيدها لبدء الخدمة.' : 'Vous n\'avez aucune commande en cours de production pour le moment. Vos commandes apparaîtront ici une fois validées.'}</p>
                    </div>
                 ) : found.map(cmd => (
                   <div key={cmd.id} id={`order-card-${cmd.id}`} className="bg-white rounded-xl md:rounded-[3rem] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden group transition-all duration-500 hover:shadow-indigo-100">
                      {/* PRO Gradient Header */}
                      <div className="p-3 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8 relative overflow-hidden text-center md:text-left">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                         <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10 w-full md:w-auto">
                            <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden shrink-0">
                               {(cmd as any).modelePhoto || (cmd as any).photo ? (
                                  <img src={(cmd as any).modelePhoto || (cmd as any).photo} className="w-full h-full object-cover" alt={cmd.modele} />
                               ) : (
                                  <Package className="w-5 h-5 md:w-10 md:h-10" />
                               )}
                            </div>
                            <div>
                               <div className="flex items-center justify-center md:justify-start gap-3 mb-1.5 md:mb-2">
                                  <span className="px-3 py-1 bg-indigo-500/30 border border-white/20 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{cmd.reference}</span>
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                               </div>
                               <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none">{cmd.modele}</h3>
                               
                               {/* Status centered below for mobile */}
                               <div className="mt-3 md:hidden">
                                  <span className="px-5 py-2 bg-white/10 backdrop-blur-xl text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-2xl inline-block">
                                     {isAr ? phaseAr[cmd.phase] : PHASE_LABELS[cmd.phase]}
                                  </span>
                               </div>
                            </div>
                         </div>

                         {/* Status on Right for Desktop */}
                         <div className="hidden md:flex items-center gap-8 relative z-10">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 opacity-80">{isAr ? 'الحالة الحالية للإنتاج' : 'Statut Actuel'}</p>
                                <span className="px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-xl inline-block group-hover:bg-indigo-500 transition-colors">
                                   {isAr ? phaseAr[cmd.phase] : PHASE_LABELS[cmd.phase]}
                                </span>
                             </div>
                         </div>
                      </div>

                      {/* Roadmap Section */}
                      {cmd.statut === 'echantillon_en_cours' || cmd.statut === 'echantillon_valide' ? (
                        <div className="p-4 md:p-8 text-center md:text-left bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-t border-b border-amber-100/50">
                           <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 mb-6 md:mb-10">
                              <div className="flex flex-col items-center md:items-start gap-1 w-full md:w-auto">
                                 <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-[0.2em]">{isAr ? 'مسار العينة' : 'Suivi Échantillon'}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="relative pt-2 md:pt-4 pb-1 md:pb-2 overflow-x-auto no-scrollbar">
                              <div className="absolute top-1/2 left-8 right-8 h-1 bg-amber-200/50 -translate-y-1/2 z-0 rounded-full min-w-[200px] md:min-w-0" />
                              <div className="relative z-10 flex justify-between items-center min-w-[200px] md:min-w-0 px-8 md:px-12">
                                  {/* Stage 1: Production */}
                                  <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${cmd.statut === 'echantillon_en_cours' && cmd.phase !== 'livré' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl shadow-amber-200 ring-4 ring-amber-100 scale-110' : 'bg-amber-500 text-white shadow-md'}`}>
                                       <Scissors className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-widest">{isAr ? 'الإنتاج' : 'Production'}</span>
                                  </div>
                        
                                  {/* Stage 2: Delivery */}
                                  <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${(cmd.phase === 'livré' && cmd.statut === 'echantillon_en_cours') || cmd.statut === 'echantillon_valide' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl shadow-amber-200 ring-4 ring-amber-100 scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                                       <Truck className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${cmd.phase === 'livré' || cmd.statut === 'echantillon_valide' ? 'text-amber-800' : 'text-slate-400'}`}>{isAr ? 'التسليم' : 'Livraison'}</span>
                                  </div>
                        
                                  {/* Stage 3: Validation */}
                                  <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${cmd.statut === 'echantillon_valide' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-200 ring-4 ring-emerald-100 scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                                       <Check className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${cmd.statut === 'echantillon_valide' ? 'text-emerald-700' : 'text-slate-400'}`}>{isAr ? 'تأكيد' : 'Validation'}</span>
                                  </div>
                              </div>
                           </div>

                           {/* Confirmation Box when Delivered but not validated */}
                           {cmd.phase === 'livré' && cmd.statut === 'echantillon_en_cours' && (
                              <div className="mt-8 bg-white border border-amber-200 rounded-[2rem] p-6 shadow-xl shadow-amber-100 animate-in fade-in slide-in-from-bottom-4">
                                {feedbackCmdId === cmd.id ? (
                                  <div className="animate-in fade-in slide-in-from-bottom-4 text-left">
                                     <h5 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 text-center">{isAr ? 'تقييم العينة والملاحظات' : 'Évaluation et Remarques'}</h5>
                                     
                                     <div className="space-y-6 max-w-5xl mx-auto">
                                        {/* Rating */}
                                        <div className="flex flex-col items-center gap-3">
                                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'تقييمك العام للعينة' : 'Votre note globale'}</p>
                                          <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                                            {[1, 2, 3, 4, 5].map(star => {
                                              const isActive = hoverRating ? star <= hoverRating : star <= feedbackData.rating;
                                              return (
                                                <button
                                                  key={star}
                                                  onMouseEnter={() => setHoverRating(star)}
                                                  onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                                                    ${isActive ? 'bg-amber-400 text-white shadow-lg shadow-amber-200 scale-110' : 'bg-slate-50 text-slate-300 hover:bg-amber-50 hover:text-amber-300'}
                                                  `}
                                                >
                                                  <Star className={`w-6 h-6 ${isActive ? 'fill-white' : ''}`} />
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="h-6 flex items-center justify-center mt-1">
                                            {(() => {
                                              const r = hoverRating || feedbackData.rating;
                                              if (r === 1) return <span className="text-xs font-black text-rose-500 uppercase tracking-widest animate-in fade-in zoom-in duration-200">{isAr ? 'سيئة جداً ولا تصلح 😞' : 'Très Mauvais 😞'}</span>;
                                              if (r === 2) return <span className="text-xs font-black text-orange-500 uppercase tracking-widest animate-in fade-in zoom-in duration-200">{isAr ? 'غير مرضية تماماً 😕' : 'Insatisfaisant 😕'}</span>;
                                              if (r === 3) return <span className="text-xs font-black text-amber-500 uppercase tracking-widest animate-in fade-in zoom-in duration-200">{isAr ? 'مقبولة وتحتاج تعديلات 😐' : 'Acceptable Mais 😐'}</span>;
                                              if (r === 4) return <span className="text-xs font-black text-lime-500 uppercase tracking-widest animate-in fade-in zoom-in duration-200">{isAr ? 'جيدة جداً 😊' : 'Très Bien 😊'}</span>;
                                              if (r === 5) return <span className="text-xs font-black text-emerald-500 uppercase tracking-widest animate-in fade-in zoom-in duration-200">{isAr ? 'ممتازة ومثالية! 😍' : 'Excellent et Parfait ! 😍'}</span>;
                                              return null;
                                            })()}
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                          <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'ملاحظات حول القماش / الثوب' : 'Remarques sur le tissu'}</label>
                                            <textarea 
                                              value={feedbackData.fabricNotes}
                                              onChange={(e) => setFeedbackData(prev => ({ ...prev, fabricNotes: e.target.value }))}
                                              className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none h-24 ${isAr ? 'text-right' : 'text-left'}`}
                                              placeholder={isAr ? 'هل أعجبك نوع الثوب؟...' : 'Avez-vous aimé le type de tissu ?...'}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'ملاحظات حول القياسات' : 'Remarques sur les tailles'}</label>
                                            </div>

                                            <div className="flex bg-slate-100 p-1 rounded-xl w-full mb-3">
                                              <button 
                                                onClick={() => setFeedbackData(prev => ({ ...prev, useSizeTable: false }))}
                                                className={`flex-1 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all ${!feedbackData.useSizeTable ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                              >
                                                {isAr ? 'ملاحظة عامة' : 'Note Générale'}
                                              </button>
                                              <button 
                                                onClick={() => setFeedbackData(prev => ({ ...prev, useSizeTable: true }))}
                                                className={`flex-1 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all ${feedbackData.useSizeTable ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                                              >
                                                {isAr ? 'تعديل بالجدول' : 'Par Taille'}
                                              </button>
                                            </div>
                                            {feedbackData.useSizeTable ? (
                                              <div className="space-y-3">
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 w-full overflow-x-auto custom-scrollbar relative">
                                                <table className="w-full text-left border-collapse">
                                                  <thead>
                                                    <tr>
                                                      <th className={`sticky top-0 bg-slate-50 z-10 text-[10px] font-black text-slate-400 uppercase p-2 border-b border-slate-200 min-w-[180px] ${isAr ? 'text-right' : 'text-left'}`}>
                                                        {isAr ? 'نقطة القياس' : 'Point'}
                                                      </th>
                                                      {(feedbackData.mesuresFeedback.length > 0 && feedbackData.mesuresFeedback[0].valeurs && Object.keys(feedbackData.mesuresFeedback[0].valeurs).length > 0 ? Object.keys(feedbackData.mesuresFeedback[0].valeurs) : (cmd.tailles && Object.keys(cmd.tailles).length > 0 ? Object.keys(cmd.tailles) : ['S', 'M', 'L', 'XL', 'XXL'])).map(size => (
                                                        <th key={size} className="sticky top-0 bg-slate-50 z-10 text-center text-[10px] font-black text-indigo-900 uppercase p-2 border-b border-slate-200 min-w-[45px]">
                                                          {size}
                                                        </th>
                                                      ))}
                                                      <th className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 w-6"></th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {feedbackData.mesuresFeedback.map((mesure, index) => (
                                                      <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-100/50">
                                                        <td className={`p-1 ${isAr ? 'text-right' : 'text-left'}`}>
                                                          <textarea 
                                                            rows={2}
                                                            value={mesure.nom}
                                                            onChange={(e) => {
                                                              const newMesures = [...feedbackData.mesuresFeedback];
                                                              newMesures[index].nom = e.target.value;
                                                              setFeedbackData(prev => ({ ...prev, mesuresFeedback: newMesures }));
                                                            }}
                                                            className={`w-full bg-transparent border-none px-1 py-1 text-[10px] md:text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-amber-400 rounded resize-none overflow-hidden ${isAr ? 'text-right' : 'text-left'}`}
                                                            placeholder={isAr ? 'القياس...' : 'Mesure...'}
                                                          />
                                                        </td>
                                                        {(feedbackData.mesuresFeedback.length > 0 && feedbackData.mesuresFeedback[0].valeurs && Object.keys(feedbackData.mesuresFeedback[0].valeurs).length > 0 ? Object.keys(feedbackData.mesuresFeedback[0].valeurs) : (cmd.tailles && Object.keys(cmd.tailles).length > 0 ? Object.keys(cmd.tailles) : ['S', 'M', 'L', 'XL', 'XXL'])).map(size => (
                                                          <td key={size} className="p-1">
                                                            <input 
                                                              type="text"
                                                              value={mesure.valeurs[size] || ''}
                                                              onChange={(e) => {
                                                                const newMesures = [...feedbackData.mesuresFeedback];
                                                                newMesures[index].valeurs = { ...newMesures[index].valeurs, [size]: e.target.value };
                                                                setFeedbackData(prev => ({ ...prev, mesuresFeedback: newMesures }));
                                                              }}
                                                              className="w-full bg-white border border-slate-200 text-center rounded px-1 py-1 text-[10px] md:text-xs font-medium focus:ring-1 focus:ring-amber-400 outline-none"
                                                              placeholder="-"
                                                            />
                                                          </td>
                                                        ))}
                                                        <td className="p-1 text-center">
                                                           <button onClick={() => {
                                                              const newMesures = [...feedbackData.mesuresFeedback];
                                                              newMesures.splice(index, 1);
                                                              setFeedbackData(prev => ({ ...prev, mesuresFeedback: newMesures }));
                                                           }} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                             <X className="w-3 h-3" />
                                                           </button>
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                                <button 
                                                  onClick={() => {
                                                    setFeedbackData(prev => ({ ...prev, mesuresFeedback: [...prev.mesuresFeedback, { nom: '', valeurs: {} }] }));
                                                  }}
                                                  className="mt-2 w-full py-1.5 border border-dashed border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                                                >
                                                  <Plus className="w-3 h-3" /> {isAr ? 'إضافة قياس' : 'Ajouter'}
                                                </button>
                                              </div>
                                              <textarea 
                                                value={feedbackData.sizeNotes}
                                                onChange={(e) => setFeedbackData(prev => ({ ...prev, sizeNotes: e.target.value }))}
                                                className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none h-16 ${isAr ? 'text-right' : 'text-left'}`}
                                                placeholder={isAr ? 'ملاحظات إضافية عن القياسات (اختياري)...' : 'Remarques supplémentaires (optionnel)...'}
                                              />
                                            </div>
                                            ) : (
                                              <textarea 
                                                value={feedbackData.sizeNotes}
                                                onChange={(e) => setFeedbackData(prev => ({ ...prev, sizeNotes: e.target.value }))}
                                                className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none h-24 ${isAr ? 'text-right' : 'text-left'}`}
                                                placeholder={isAr ? 'هل القياسات مضبوطة؟...' : 'Les mensurations sont-elles correctes ?...'}
                                              />
                                            )}
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'ملاحظات عامة وتعديلات مطلوبة' : 'Modifications requises & Remarques'}</label>
                                          <textarea 
                                            value={feedbackData.generalNotes}
                                            onChange={(e) => setFeedbackData(prev => ({ ...prev, generalNotes: e.target.value }))}
                                            className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none h-24 ${isAr ? 'text-right' : 'text-left'}`}
                                            placeholder={isAr ? 'أي تعديلات أخرى قبل بدء الإنتاج...' : 'Toute autre modification avant la production...'}
                                          />
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                           <button 
                                             onClick={() => setFeedbackCmdId(null)}
                                             className="px-6 py-4 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                           >
                                             {isAr ? 'إلغاء' : 'Annuler'}
                                           </button>
                                           <button 
                                             disabled={feedbackData.rating === 0}
                                             onClick={async () => {
                                                try {
                                                   let fbStr = `⭐ التقييم: ${feedbackData.rating}/5\n`;
                                                   if (feedbackData.fabricNotes) fbStr += `👕 القماش: ${feedbackData.fabricNotes}\n`;
                                                   if (feedbackData.generalNotes) fbStr += `📝 عام: ${feedbackData.generalNotes}\n`;
                                                   if (feedbackData.sizeNotes) fbStr += `📏 القياسات: ${feedbackData.sizeNotes}\n`;
                                                   if (feedbackData.useSizeTable && feedbackData.mesuresFeedback.length > 0) {
                                                     fbStr += `📏 تم تعديل جدول القياسات من طرف الزبون.`;
                                                   }
                                                   const newSuivi = {
                                                      phase: 'livré' as any,
                                                      date: new Date().toISOString(),
                                                      note: `✅ تقييم العينة من الزبون:\n${fbStr}`
                                                   };
                                                   const jsonSuivi = {
                                                      phase: 'livré' as any,
                                                      date: new Date().toISOString(),
                                                      note: `[FEEDBACK_JSON]${JSON.stringify({ ...feedbackData, approved: true })}`
                                                   };
                                                   
                                                   const updated: Commande = { 
                                                     ...cmd, 
                                                     statut: 'echantillon_valide',
                                                     suivi: [...(cmd.suivi || []), newSuivi, jsonSuivi],
                                                     sampleFeedback: { ...feedbackData, approved: true } 
                                                   };
                                                   await saveRecord('commandes', updated);
                                                   setFound(prev => prev.map(c => c.id === cmd.id ? updated : c));
                                                   const { sendPushToAll } = await import('../utils/pushNotifications');
                                                   sendPushToAll(
                                                     isAr ? '✅ عينة مقبولة مع ملاحظات' : '✅ Échantillon validé avec remarques',
                                                     `${cmd.client} — ${cmd.modele}`,
                                                     '/commandes'
                                                   );
                                                   setFeedbackCmdId(null);
                                                } catch(err) {}
                                             }}
                                             className="px-8 py-4 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                           >
                                             <Check className="w-5 h-5" /> {isAr ? 'إرسال وموافقة' : 'Envoyer & Valider'}
                                           </button>
                                        </div>
                                     </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                                     <div>
                                        <h5 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{isAr ? 'هل توصلت بالعينة؟' : 'Avez-vous reçu l\'échantillon ?'}</h5>
                                        <p className="text-xs font-bold text-slate-500">{isAr ? 'قم بإضافة ملاحظاتك وتأكيد الموافقة لبدء الإنتاج الفعلي.' : 'Ajoutez vos remarques et confirmez pour lancer la production.'}</p>
                                     </div>
                                     <button 
                                       onClick={() => {
                                          setFeedbackCmdId(cmd.id);
                                          const matchingFiches = fiches.filter(f => f.modele.toLowerCase() === cmd.modele.toLowerCase() && (f.client || '').toLowerCase() === (cmd.client || '').toLowerCase()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                                          const fiche = matchingFiches.find(f => f.mesures && f.mesures.some((m: any) => m.valeurs && Object.keys(m.valeurs).length > 0)) || matchingFiches[0] || fiches.find(f => f.modele.toLowerCase() === cmd.modele.toLowerCase());
                                          let initialMesures = [];
                                          if (fiche && fiche.mesures && fiche.mesures.length > 0) {
                                            initialMesures = fiche.mesures.map((m: any) => ({ nom: m.nom, valeurs: m.valeurs ? { ...m.valeurs } : {} }));
                                          } else {
                                            const mod = cmd.modele.toLowerCase();
                                            if (mod.includes('pantalon') || mod.includes('سروال') || mod.includes('pant')) {
                                              initialMesures = [{ nom: 'Tour de taille', valeurs: {} }, { nom: 'Bassin', valeurs: {} }, { nom: 'Longueur', valeurs: {} }];
                                            } else if (mod.includes('robe') || mod.includes('فستان') || mod.includes('abaya') || mod.includes('عباية') || mod.includes('dress')) {
                                              initialMesures = [{ nom: 'Épaules', valeurs: {} }, { nom: 'Poitrine', valeurs: {} }, { nom: 'Taille', valeurs: {} }, { nom: 'Bassin', valeurs: {} }, { nom: 'Longueur', valeurs: {} }];
                                            } else {
                                              initialMesures = [{ nom: 'Épaules', valeurs: {} }, { nom: 'Poitrine', valeurs: {} }, { nom: 'Longueur', valeurs: {} }];
                                            }
                                          }
                                          setFeedbackData({ rating: 0, fabricNotes: '', sizeNotes: '', generalNotes: '', useSizeTable: false, sizeTableNotes: {}, mesuresFeedback: initialMesures });
                                       }}
                                       className="w-full md:w-auto px-8 py-4 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:scale-105 transition-all group/btn flex items-center justify-center gap-2"
                                     >
                                       <Star className="w-5 h-5 group-hover:scale-125 transition-transform" /> {isAr ? 'تقييم وموافقة' : 'Évaluer & Valider'}
                                     </button>
                                  </div>
                                )}
                              </div>
                           )}
                        </div>
                      ) : (
                        <div className="p-2 md:p-8 text-center md:text-left">
                           <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 mb-4 md:mb-8">
                              <div className="flex flex-col items-center md:items-start gap-1 w-full md:w-auto">
                                 <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-[0.2em]">{isAr ? 'تتبع مباشر' : 'Live Tracking'}</span>
                                 </div>
                                 <h4 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest mt-1">{isAr ? 'مسار الإنتاج الدقيق' : 'Precision Production Flow'}</h4>
                              </div>
                              
                              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl w-full md:w-auto justify-center">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-sm" />
                                    <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'جودة مضمونة' : 'Crafted with Precision'}</span>
                                 </div>
                                 <div className="text-indigo-600 font-black text-xl bg-indigo-50 px-5 py-1.5 rounded-xl border border-indigo-100 shadow-sm w-full md:w-auto text-center">{Math.round((getPhaseIndex(cmd.phase) / (PHASE_ORDER.length - 1)) * 100)}%</div>
                              </div>
                           </div>
                           
                           <div className="relative pt-2 md:pt-4 pb-1 md:pb-2 overflow-x-auto no-scrollbar">
                              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full min-w-[320px] md:min-w-0" />
                              <div className="relative z-10 flex justify-between items-center min-w-[320px] md:min-w-0 px-2 md:px-0">
                                 {PHASE_ORDER.map((p, idx) => {
                                   const isCompleted = getPhaseIndex(cmd.phase) >= idx;
                                   const isCurrent = cmd.phase === p;
                                   return (
                                     <div key={p} className="flex flex-col items-center gap-1 md:gap-2 group/step">
                                        <div className={`w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                          isCompleted 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                            : 'bg-white text-slate-300 border-2 border-slate-100'
                                        } ${isCurrent ? 'ring-4 md:ring-6 ring-indigo-50 scale-110 shadow-xl shadow-indigo-500/20 border-indigo-200' : ''}`}>
                                           {phaseIcons[p]}
                                        </div>
                                        <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-tighter text-center max-w-[50px] md:max-w-[70px] leading-tight ${isCompleted ? 'text-indigo-700' : 'text-slate-500'}`}>
                                           {isAr ? phaseAr[p] : PHASE_LABELS[p]}
                                        </span>
                                     </div>
                                   );
                                 })}
                              </div>
                           </div>
                        </div>
                      )}
                      
                      {/* Annulation status banner */}
                      {cmd.statut === 'annulation_demandee' && (
                        <div className="mx-4 md:mx-8 mb-3 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
                          <span className="text-lg">⏳</span>
                          <div>
                            <p className="text-xs font-black text-orange-700 uppercase tracking-wide">
                              {isAr ? 'طلب الإلغاء قيد المعالجة' : 'Demande d\'annulation en cours'}
                            </p>
                            <p className="text-[10px] text-orange-500 font-medium">
                              {isAr ? 'في انتظار تأكيد الفريق' : 'En attente de confirmation par notre équipe'}
                            </p>
                          </div>
                        </div>
                      )}
                      {cmd.statut === 'annulé' && (
                        <div className="mx-4 md:mx-8 mb-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                          <span className="text-lg">❌</span>
                          <p className="text-xs font-black text-red-700 uppercase tracking-wide">
                            {isAr ? 'تم إلغاء الطلبية' : 'Commande annulée'}
                          </p>
                        </div>
                      )}

                      {/* Footer Section with Separator */}
                      <div className="px-4 md:px-8 pb-4 md:pb-6 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6 border-t border-slate-100 pt-3 md:pt-6 bg-slate-50/40 text-center md:text-left">
                         <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                            <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                               <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-500" />
                               {isAr ? 'موعد التسليم:' : 'Livraison:'} <span className="text-slate-950 ml-1 font-black">{cmd.dateLivraisonPrevue}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                               <Truck className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-500" />
                               {isAr ? 'الكمية:' : 'Quantité:'} <span className="text-slate-950 ml-1 font-black">{cmd.quantite} Pcs</span>
                            </div>
                         </div>
                         
                         {/* Annulation button */}
                         {cmd.statut !== 'annulé' && cmd.statut !== 'annulation_demandee' && cmd.statut !== 'livré' && (
                           <button
                             onClick={() => { setAnnulationModal({ cmdId: cmd.id, cmdRef: cmd.reference }); setAnnulationRaison(''); }}
                             className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all"
                           >
                             ✕ {isAr ? 'طلب الإلغاء' : 'Annuler'}
                           </button>
                         )}

                         {/* Secondary Countdown Badge - Full width on Mobile */}
                         <div className="flex items-center justify-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-200 w-full md:w-auto">
                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{isAr ? 'الوقت المتبقي' : 'Temps Restant'}</span>
                            <div className="flex gap-2.5 text-xs font-black text-emerald-400">
                               <span className="flex items-baseline gap-0.5">02<span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">d</span></span>
                               <span className="flex items-baseline gap-0.5">14<span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">h</span></span>
                               <span className="flex items-baseline gap-0.5 animate-pulse">45<span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">m</span></span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-10 text-center md:text-left">
                  <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{isAr ? 'الفواتير والوثائق' : 'Documents & Factures'}</h1>
                  <p className="text-slate-500 font-medium">{isAr ? 'إدارة كاملة لجميع وثائقك المحاسبية والتقنية' : 'Gérez l\'ensemble de vos documents comptables et techniques'}</p>
               </div>

               {/* Technical Sheets Section */}
               <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                     <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center"><Scissors className="w-4 h-4" /></div>
                     {isAr ? 'الملفات التقنية' : 'Dossiers Techniques'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {fiches.filter(f => f.clientId ? f.clientId === currentUser?.id : (f.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase()).map(f => (
                        <div key={f.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-indigo-200 transition-all">
                           <div className="relative aspect-[4/5] bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                              {f.photo ? (
                                 <img src={f.photo} alt={f.modele} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                                    <FileText className="w-12 h-12" />
                                    <span className="text-[10px] font-black uppercase mt-2">No Visual</span>
                                 </div>
                              )}
                              <div className="absolute top-4 left-4">
                                 <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-indigo-600 shadow-sm border border-white">
                                    {f.type || (isAr ? 'موديل' : 'Modèle')}
                                 </span>
                              </div>
                           </div>
                           <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">{f.modele}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{f.tailles.length} {isAr ? 'مقاسات متاحة' : 'Tailles disponibles'}</p>
                           
                           <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setViewMesuresFiche(f)}
                                className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                              >
                                 <Eye className="w-3.5 h-3.5" /> {isAr ? 'عرض' : 'Voir'}
                              </button>
                              <button 
                                onClick={() => printFT(f)}
                                className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                              >
                                 <Download className="w-3.5 h-3.5" /> PDF
                              </button>
                           </div>
                        </div>
                     ))}
                     {fiches.filter(f => f.clientId ? f.clientId === currentUser?.id : (f.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase()).length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                           <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">{isAr ? 'لا يوجد ملف تقني حاليا' : 'Aucun dossier technique disponible'}</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Financial Documents Sections */}
               {(() => {
                 const clientDocs = factures.filter(f => (f.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase());
                 const devisList = clientDocs.filter(f => f.typeDoc === 'devis');
                 const recusList = clientDocs.filter(f => f.typeDoc === 'recu');
                 const facturesList = clientDocs.filter(f => !f.typeDoc || f.typeDoc === 'facture');
                 
                 const renderList = (list: Facture[], titleAr: string, titleFr: string, bgClass: string, textClass: string, bgLightClass: string, hoverBorderClass: string) => (
                   list.length > 0 && (
                     <div className="mb-10">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                           <div className={`w-8 h-8 ${bgClass} text-white rounded-lg flex items-center justify-center`}><Receipt className="w-4 h-4" /></div>
                           {isAr ? titleAr : titleFr}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {list.map(f => (
                              <div key={f.id} className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all ${hoverBorderClass}`}>
                                 {f.preuvePaiement ? (
                                   <div 
                                     onClick={() => { const w = window.open(); w?.document.write(`<img src="${f.preuvePaiement}" style="max-width:100%;" />`); }}
                                     className="absolute top-6 right-6 w-28 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform z-20 bg-slate-50 flex items-center justify-center group/img"
                                     title="Voir l'image"
                                   >
                                     <img src={f.preuvePaiement} alt="Preuve" className="w-full h-full object-cover group-hover/img:opacity-80 transition-opacity" />
                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                       <Eye className="w-5 h-5 text-slate-900 drop-shadow-md" />
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                      <Receipt className={`w-24 h-24 ${textClass}`} />
                                   </div>
                                 )}
                                 <div className="relative z-10 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                                       <div className={`w-10 h-10 ${bgLightClass} rounded-xl flex items-center justify-center ${textClass}`}>
                                          <Receipt className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                             {f.typeDoc === 'devis' ? 'Devis' : f.typeDoc === 'recu' ? 'Reçu d\'avance' : 'Facture'}
                                          </p>
                                          <p className="text-sm font-black text-slate-900 uppercase mb-0.5">{f.numero}</p>
                                          <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {(() => {
                                              const dateStr = (f as any).created_at || f.date;
                                              if (!dateStr) return '—';
                                              const d = new Date(dateStr);
                                              // Check if it has time component
                                              if (dateStr.includes('T') || (f as any).created_at) {
                                                return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }).replace(',', ' à');
                                              }
                                              return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                            })()}
                                          </p>
                                       </div>
                                    </div>
                                    
                                    {f.typeDoc === 'recu' ? (
                                      <div className="space-y-2 mb-8">
                                        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'إجمالي الطلب' : 'Total commande'}</p>
                                          <p className="text-sm font-black text-slate-700">{f.montant.toLocaleString()} MAD</p>
                                        </div>
                                        <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5">
                                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">✓ {isAr ? 'أفونس مدفوع' : 'Avance payée'}</p>
                                          <p className="text-sm font-black text-emerald-700">{(f.avance || 0).toLocaleString()} MAD</p>
                                        </div>
                                        {(() => {
                                          const reste = f.montant - (f.avance || 0);
                                          return reste > 0 ? (
                                            <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-2.5">
                                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{isAr ? 'المتبقي للأداء' : 'Reste à payer'}</p>
                                              <p className="text-sm font-black text-amber-700">{reste.toLocaleString()} MAD</p>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5">
                                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'المتبقي للأداء' : 'Reste à payer'}</p>
                                              <p className="text-sm font-black text-emerald-700">0 MAD ✓</p>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    ) : (
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'المبلغ' : 'Montant'}</p>
                                          <p className={`text-xl font-black ${textClass}`}>{f.montant.toLocaleString()} MAD</p>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الحالة' : 'Statut'}</p>
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            f.statut === 'payée' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                          }`}>
                                             {isAr ? (f.statut === 'payée' ? 'مؤداة' : 'في الانتظار') : f.statut}
                                          </span>
                                       </div>
                                    </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                      {/* PDF Download */}
                                      <button
                                        onClick={() => { setSelectedFacture(f); setShowInvoiceView(true); }}
                                        className={`w-full py-4 ${bgClass} text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl`}
                                      >
                                         <Download className="w-4 h-4" />
                                         {isAr
                                           ? f.typeDoc === 'recu' ? 'وصل الأداء الرسمي' : f.typeDoc === 'devis' ? 'تحميل العرض' : 'الفاتورة الرسمية'
                                           : f.typeDoc === 'recu' ? 'Reçu d\'Avance Officiel' : f.typeDoc === 'devis' ? 'Télécharger le Devis' : 'Facture Officielle'
                                         }
                                      </button>

                                      {/* Admin-uploaded proof — shown as visible image */}
                                      {f.preuvePaiement && (
                                        <div className="rounded-2xl overflow-hidden border-2 border-emerald-200 bg-emerald-50/50">
                                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-100">
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                              <span className="text-white text-[10px] font-black">✓</span>
                                            </div>
                                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex-1">
                                              {isAr ? 'وصل الاستلام الرسمي' : 'Reçu officiel BEYA'}
                                            </p>
                                            <button
                                              onClick={() => {
                                                const a = document.createElement('a');
                                                a.href = f.preuvePaiement!;
                                                a.download = `Preuve_${f.numero || 'recu'}.jpg`;
                                                a.target = '_blank';
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                              }}
                                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-all"
                                              title="Télécharger"
                                            >
                                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                                            </button>
                                          </div>
                                          <img
                                            src={f.preuvePaiement}
                                            alt="Preuve paiement"
                                            className="w-full object-cover cursor-zoom-in"
                                            style={{ maxHeight: '200px' }}
                                            onClick={() => window.open(f.preuvePaiement, '_blank')}
                                          />
                                        </div>
                                      )}

                                      {/* Client proof upload zone — only for reçu */}
                                      {f.typeDoc === 'recu' && (
                                        <div className="mt-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                              {isAr ? 'إثبات الدفع' : 'Ma Preuve de Paiement'}
                                            </span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                          </div>

                                          {f.statut === 'en_verification' || f.preuveClient ? (
                                            /* Already uploaded */
                                            <div className="rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/50">
                                              {f.preuveClient && (
                                                <div className="relative">
                                                  <img src={f.preuveClient} alt="Preuve" className="w-full h-24 object-cover" />
                                                  <div className="absolute inset-0 bg-amber-900/10" />
                                                </div>
                                              )}
                                              <div className="flex items-center gap-2 px-4 py-3">
                                                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                </div>
                                                <div className="flex-1">
                                                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">
                                                    {isAr ? 'في انتظار التأكيد' : 'En attente de vérification'}
                                                  </p>
                                                  <p className="text-[9px] text-amber-500 font-medium">
                                                    {isAr ? 'سيتم التأكيد خلال 24 ساعة' : 'Confirmation sous 24h'}
                                                  </p>
                                                </div>
                                                {/* Re-upload option */}
                                                <label className="cursor-pointer">
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadPreuveClient(f.id, file); e.target.value = ''; }}
                                                  />
                                                  <span className="text-[9px] text-amber-500 font-black uppercase underline cursor-pointer">
                                                    {isAr ? 'تغيير' : 'Changer'}
                                                  </span>
                                                </label>
                                              </div>
                                            </div>
                                          ) : (
                                            /* Upload zone */
                                            <label className="cursor-pointer block">
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadPreuveClient(f.id, file); e.target.value = ''; }}
                                              />
                                              <div className={`w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 py-5 px-4
                                                ${uploadingPreuve === f.id
                                                  ? 'border-indigo-300 bg-indigo-50/50'
                                                  : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
                                                }`}>
                                                {uploadingPreuve === f.id ? (
                                                  <>
                                                    <RotateCw className="w-5 h-5 text-indigo-500 animate-spin" />
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase">{isAr ? 'جاري الرفع...' : 'Envoi...'}</p>
                                                  </>
                                                ) : (
                                                  <>
                                                    <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                                                      <Camera className="w-4.5 h-4.5 text-slate-400" />
                                                    </div>
                                                    <div className="text-center">
                                                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">
                                                        {isAr ? 'أرسل صورة الدفع' : 'Envoyer screenshot virement'}
                                                      </p>
                                                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                                        {isAr ? 'صورة من التطبيق البنكي' : 'Photo app bancaire / chèque'}
                                                      </p>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </label>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )
                 );

                 return (
                   <>
                     {renderList(devisList, 'عروض الأسعار (Devis)', 'Devis et Estimations', 'bg-indigo-600', 'text-indigo-600', 'bg-indigo-50', 'hover:border-indigo-200')}
                     {renderList(recusList, 'وصولات الأداء والأفونس', 'Reçus de Paiement', 'bg-emerald-600', 'text-emerald-600', 'bg-emerald-50', 'hover:border-emerald-200')}
                     {renderList(facturesList, 'الفواتير المالية', 'Factures Financières', 'bg-slate-800', 'text-slate-800', 'bg-slate-100', 'hover:border-slate-300')}
                     
                     {clientDocs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                           <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">{isAr ? 'لا توجد وثائق حاليا' : 'Aucun document disponible'}</p>
                        </div>
                     )}
                   </>
                 );
               })()}
            </div>
          )}

          {activeTab === 'payments' && (() => {
            const trueDemandes = mesDemandes.filter(d => d.type !== '__MESSAGE__' && d.type !== '__MESSAGE_REPLY__');
            
            // Build all payable items (both official production Commandes and Client Demandes/Devis)
            const allPayableItems = [
              ...found.map(c => {
                const matchingLead = trueDemandes.find(l => l.type === c.modele);
                const leadImgUrl = matchingLead ? (matchingLead.photo || (matchingLead.photos && matchingLead.photos[0]) || leadPhotos[matchingLead.id]) : null;
                const imgUrl = (c as any).modelePhoto || c.photo || (c as any).tissuPhoto || leadImgUrl || null;
                return {
                  id: c.id,
                  itemType: 'commande' as const,
                  badgeText: isAr ? 'طلبية إنتاج' : 'Commande Production',
                  badgeColor: 'bg-indigo-600',
                  reference: c.reference || c.id,
                  modele: c.modele || (isAr ? 'موديل إنتاج' : 'Modèle Production'),
                  quantite: c.quantite || 0,
                  prixTotal: c.prix ? c.quantite * c.prix : null,
                  photo: imgUrl,
                  rawCommande: c
                };
              }),
              ...trueDemandes.map(d => {
                const analysis = getDemandeAnalysis(d, isAr);
                const photo = d.photo || (d.photos && d.photos[0]) || leadPhotos[d.id] || null;
                return {
                  id: d.id,
                  itemType: 'demande' as const,
                  badgeText: isAr ? 'طلب موديل / دراسة' : 'Demande & Devis',
                  badgeColor: 'bg-purple-600',
                  reference: `#${d.id.slice(0, 8).toUpperCase()}`,
                  modele: analysis.modeleReel || cleanLangText(d.type, isAr) || (isAr ? 'طلب موديل' : 'Demande Modèle'),
                  quantite: analysis.qty || 1,
                  prixTotal: analysis.totalPrice || (analysis.unitPrice ? analysis.unitPrice * analysis.qty : null),
                  photo: photo,
                  rawDemande: d
                };
              })
            ];

            const isFormValid = Boolean(
              virementCommandeId && 
              virementMontant && 
              parseFloat(virementMontant) > 0 && 
              virementPhoto && 
              !sendingVirement
            );

            return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">{isAr ? 'الدفع والأداء' : 'Paiements & Virements'}</h2>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bank Info */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                     <Building className="w-12 h-12 text-indigo-400 mb-6 relative z-10" />
                     <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-indigo-100 relative z-10">{isAr ? 'الحسابات البنكية' : 'Coordonnées Bancaires'}</h3>
                     
                     <div className="space-y-4 relative z-10">
                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                           <div>
                             <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">{isAr ? 'البنك' : 'Banque'}</p>
                             <p className="text-lg font-bold tracking-tight">{company.bankName || 'CIH BANK'}</p>
                           </div>
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                             {(company.bankName || 'CIH BANK').toLowerCase().includes('cih') ? (
                               <img src="/cih-logo.png" className="w-8 h-8 object-contain" alt="CIH BANK" />
                             ) : (
                               <Building className="w-6 h-6 text-indigo-300" />
                             )}
                           </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                           <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">{isAr ? 'اسم المستفيد' : 'Bénéficiaire'}</p>
                           <p className="text-lg font-bold tracking-tight">{company.bankBeneficiary || company.name}</p>
                        </div>
                        <div 
                           onClick={() => {
                             navigator.clipboard?.writeText(company.rib || '');
                             setRibCopied(true);
                             setTimeout(() => setRibCopied(false), 2000);
                           }}
                           className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/15 transition-all group relative"
                         >
                            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1 relative z-10">{isAr ? 'رقم الحساب (RIB)' : 'RIB (24 chiffres)'}</p>
                            <div className="flex items-center justify-between relative z-10 gap-4">
                              <p className="text-sm sm:text-base md:text-lg font-black tracking-wider font-mono whitespace-nowrap overflow-x-auto no-scrollbar">{company.rib || '230 000 00000000000000 00'}</p>
                              {ribCopied ? (
                                <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-[10px] font-black uppercase text-emerald-400">{isAr ? 'تم' : 'Copié'}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 group-hover:bg-white/20 group-hover:border-white/30 transition-all">
                                  <FileText className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors" />
                                  <span className="text-[10px] font-black uppercase text-indigo-300 group-hover:text-white transition-colors">{isAr ? 'نسخ' : 'Copier'}</span>
                                </div>
                              )}
                            </div>
                         </div>

                         {company.bankQrCode && (
                           <div className="mt-6 flex flex-col items-center">
                             <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-3">{isAr ? 'مسح QR Code للدفع السريع' : 'Scanner pour payer'}</p>
                             <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/20">
                               <img src={company.bankQrCode} alt="Bank QR Code" className="w-40 h-40 object-cover rounded-xl" />
                             </div>
                           </div>
                         )}
                      </div>
                  </div>

                  {/* Upload Receipt */}
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-slate-800">{isAr ? 'تأكيد الدفع' : 'Confirmer un paiement'}</h3>
                      
                      <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 bg-indigo-50 border-indigo-100 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Info className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-indigo-900 mb-1">
                            {isAr ? 'خطوة ضرورية لبدء الإنتاج' : 'Étape nécessaire pour lancer la production'}
                          </p>
                          <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">
                            {isAr 
                              ? 'المرجو تحديد الطلبية المعنية، إدخال مبلغ التحويل، وإرفاق صورة التوصيل البنكي. هذا الإجراء ضروري جداً باش نقدروا نشريو السلعة (الثوب واللوازم) ونبدأو الخدمة على طلبيتك في أسرع وقت!' 
                              : "Veuillez sélectionner la commande, saisir le montant viré et joindre le reçu de paiement. Cette étape est indispensable pour nous permettre d'acheter la matière première et de commencer à travailler sur votre commande !"}
                          </p>
                        </div>
                      </div>
                      
                      {virementSent ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-center py-8 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-4 shadow-lg shadow-emerald-100">
                              <CircleCheck className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{isAr ? 'تم الإرسال بنجاح!' : 'Reçu envoyé !'}</h4>
                            <p className="text-sm font-medium text-slate-500">{isAr ? 'سيتم مراجعة التوصيل وتأكيد الدفع في أقرب وقت.' : 'Votre paiement sera validé prochainement.'}</p>
                            <button onClick={() => setVirementSent(false)} className="mt-6 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-pointer">
                               {isAr ? 'إرسال توصيل آخر' : 'Nouveau paiement'}
                            </button>
                         </div>
                      ) : (
                         <div className="space-y-6 flex-1 flex flex-col">
                            <div className="grid grid-cols-1 gap-6">
                              <div>
                                 <div className="flex items-center justify-between mb-3">
                                   <label className={`block text-[10px] font-black uppercase tracking-widest ${virementCommandeId ? 'text-indigo-600' : 'text-slate-500'} ${isAr ? 'text-right' : ''}`}>
                                     {isAr ? 'الطلبية أو الموديل المعني (إجباري)' : 'Commande ou Modèle concerné (Obligatoire)'}
                                   </label>
                                   {virementCommandeId && (
                                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                                       <Check className="w-3 h-3" />
                                       <span>{isAr ? 'تم اختيار الطلبية' : 'Sélectionné'}</span>
                                     </span>
                                   )}
                                 </div>
                                 
                                 {allPayableItems.length > 0 ? (
                                   <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ${isAr ? 'direction-rtl' : ''}`}>
                                     {allPayableItems.map(item => {
                                       const isSelected = virementCommandeId === item.id;
                                       return (
                                         <div 
                                           key={item.id}
                                           onClick={() => setVirementCommandeId(item.id)}
                                           className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 flex flex-col ${
                                             isSelected 
                                               ? 'border-indigo-600 shadow-xl shadow-indigo-500/25 bg-indigo-50/40 ring-2 ring-indigo-500/30 transform scale-[1.02] z-10' 
                                               : 'border-slate-100 hover:border-indigo-300 bg-white hover:bg-slate-50'
                                           }`}
                                         >
                                           {isSelected && (
                                             <div className="absolute top-2 right-2 px-2.5 py-1 bg-indigo-600 text-white rounded-lg flex items-center gap-1 z-20 shadow-md text-[10px] font-black uppercase tracking-wider animate-in zoom-in duration-200">
                                               <Check className="w-3.5 h-3.5" />
                                               <span>{isAr ? 'محدد' : 'Sélectionné'}</span>
                                             </div>
                                           )}
                                           
                                           <div className="h-28 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center shrink-0 group">
                                             {item.photo ? (
                                               <img src={item.photo} alt={item.modele} className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                                             ) : (
                                               <Package className="w-8 h-8 text-slate-500" />
                                             )}
                                             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                                             
                                             <span className={`absolute top-2 left-2 ${item.badgeColor} text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider`}>
                                               {item.badgeText}
                                             </span>

                                             <span className="absolute bottom-2 left-3 right-3 text-white text-[10px] font-black uppercase tracking-widest truncate drop-shadow-md">
                                               {item.reference}
                                             </span>
                                           </div>
                                           
                                           <div className={`p-3.5 flex-1 flex flex-col justify-between ${isAr ? 'text-right' : 'text-left'}`}>
                                             <p className="text-xs font-black text-slate-900 line-clamp-2 leading-tight mb-2" title={item.modele}>
                                               {item.modele}
                                             </p>
                                             <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 text-[10px]">
                                               <span className="font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                 {item.quantite} PCS
                                               </span>
                                               {item.prixTotal ? (
                                                 <span className="font-black text-emerald-600">
                                                   {item.prixTotal.toLocaleString()} MAD
                                                 </span>
                                               ) : null}
                                             </div>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 ) : (
                                   <div className="p-6 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-slate-200">
                                     <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                     <p className="text-xs font-bold text-slate-600 mb-1">
                                       {isAr ? 'لا توجد طلبيات أو طلبات مسجلة بحسابك حالياً' : 'Aucune commande ou demande trouvée'}
                                     </p>
                                     <p className="text-[10px] text-slate-400 max-w-sm mx-auto mb-3">
                                       {isAr ? 'يجب إرسال طلب موديل أولاً قبل إرسال التوصيل البنكي حتى يتم ربط الأداء بطلبك.' : 'Veuillez d\'abord créer une demande de modèle avant d\'envoyer un reçu afin d\'y associer votre paiement.'}
                                     </p>
                                   </div>
                                 )}
                              </div>

                              <div>
                                 <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'المبلغ المحول (درهم)' : 'Montant viré (MAD)'}</label>
                                 <div className="relative">
                                   <input 
                                     type="number" 
                                     value={virementMontant}
                                     onChange={e => setVirementMontant(e.target.value)}
                                     placeholder="0.00"
                                     className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black outline-none focus:border-indigo-500 transition-colors ${isAr ? 'text-right' : ''}`}
                                   />
                                   <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 font-black ${isAr ? 'left-5' : 'right-5'}`}>MAD</span>
                                 </div>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                               <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'صورة التوصيل' : 'Photo du reçu'}</label>
                               <div className="relative h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-400 transition-colors cursor-pointer group">
                                 {virementPhoto ? (
                                   <>
                                     <img src={virementPhoto} className="w-full h-full object-cover" />
                                     <button onClick={() => setVirementPhoto(null)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg"><X className="w-4 h-4" /></button>
                                   </>
                                 ) : (
                                   <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                       <Upload className="w-5 h-5 text-indigo-400" />
                                     </div>
                                     <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{isAr ? 'اضغط لرفع الصورة' : 'Cliquez pour uploader'}</span>
                                     <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                       const file = e.target.files?.[0];
                                       if (file) {
                                         try {
                                           const compressed = await compressImage(file);
                                           setVirementPhoto(compressed);
                                         } catch (err) {}
                                       }
                                     }} />
                                   </label>
                                 )}
                               </div>
                            </div>

                            {/* Strict Validation Info Alerts */}
                            {!virementCommandeId && allPayableItems.length > 0 && (
                              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{isAr ? '⚠️ اختيار الطلبية أو الموديل المعني بالأعلى إجباري قبل إرسال التوصيل.' : '⚠️ Veuillez sélectionner la commande ou le modèle concerné ci-dessus pour activer l\'envoi.'}</span>
                              </div>
                            )}

                            {allPayableItems.length === 0 && (
                              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>{isAr ? '❌ لا توجد أي طلبية مسجلة لربط الدفع بها. يرجى إنشاء طلب أولاً.' : '❌ Aucune commande trouvée pour associer ce paiement. Veuillez d\'abord créer une demande.'}</span>
                              </div>
                            )}

                            <button 
                              disabled={!isFormValid}
                              onClick={async () => {
                                if (!isFormValid || !currentUser || !virementCommandeId || !virementMontant || !virementPhoto) {
                                  alert(isAr ? 'يرجى اختيار الطلبية، إدخال المبلغ، وإرفاق صورة التوصيل.' : 'Veuillez sélectionner la commande, saisir le montant et joindre le reçu.');
                                  return;
                                }

                                const selectedItem = allPayableItems.find(i => i.id === virementCommandeId);
                                if (!selectedItem) {
                                  alert(isAr ? 'يرجى اختيار الطلبية المعنية أولاً' : 'Veuillez sélectionner la commande concernée');
                                  return;
                                }

                                const isDemande = selectedItem.itemType === 'demande';
                                setSendingVirement(true);
                                try {
                                  const newFacture: Partial<Facture> = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    numero: `REC-${Date.now().toString().slice(-6)}`,
                                    client: currentUser.nom,
                                    commandeId: isDemande ? undefined : selectedItem.id,
                                    date: new Date().toISOString(),
                                    echeance: new Date().toISOString().split('T')[0],
                                    montant: parseFloat(virementMontant),
                                    typeDoc: 'recu',
                                    statut: 'en_verification',
                                    banque: 'virement',
                                    articles: [{
                                      description: `[${selectedItem.reference}] ${selectedItem.modele} (${selectedItem.badgeText})`,
                                      quantite: selectedItem.quantite || 1,
                                      prixUnitaire: parseFloat(virementMontant),
                                      total: parseFloat(virementMontant)
                                    }],
                                    preuvePaiement: virementPhoto
                                  };
                                  await saveRecord('factures', newFacture);

                                  // If this receipt is for a Demande, link the proof to the lead directly!
                                  if (isDemande && (selectedItem as any).rawDemande) {
                                    try {
                                      const raw = (selectedItem as any).rawDemande;
                                      const updatedLead: Lead = {
                                        ...raw,
                                        preuveClient: virementPhoto,
                                        crmPriceConfirmed: true,
                                        notes: `${raw.notes || ''}\n[توصيل تحويل بنكي بقيمة ${virementMontant} MAD - قيد التحقق]`.trim()
                                      };
                                      await saveRecord('leads', updatedLead);
                                      setMesDemandes(prev => prev.map(m => m.id === selectedItem.id ? updatedLead : m));
                                    } catch (leadErr) {
                                      console.warn("Failed to update lead with payment proof:", leadErr);
                                    }
                                  }

                                  try {
                                    const { sendPushToAll } = await import('../utils/pushNotifications');
                                    sendPushToAll(
                                      isAr ? '💰 توصيل دفع جديد' : '💰 Nouveau Reçu', 
                                      `${currentUser.nom} - ${virementMontant} MAD (${selectedItem.reference} - ${selectedItem.modele})`, 
                                      '/recus'
                                    );
                                  } catch (_) {}

                                  setVirementSent(true);
                                  setVirementMontant('');
                                  setVirementCommandeId('');
                                  setVirementPhoto(null);
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setSendingVirement(false);
                                }
                              }}
                              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                                isFormValid 
                                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-600/30 hover:scale-[1.01] active:scale-95 cursor-pointer' 
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                              }`}
                            >
                              {sendingVirement ? <RotateCw className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                              {isAr ? 'إرسال التوصيل' : 'Envoyer le reçu'}
                            </button>
                         </div>
                      )}
                  </div>
               </div>
            </div>
            );
          })()}

          {activeTab === 'DISABLED_atelier' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Hero banner */}
              <div className="relative rounded-[2.5rem] overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63)' }}>
                {company.aboutPhotoUrl && (
                  <img src={company.aboutPhotoUrl} alt="Atelier" className="w-full h-52 object-cover opacity-30 mix-blend-luminosity" />
                )}
                <div className={`${company.aboutPhotoUrl ? 'absolute inset-0' : 'py-12'} flex flex-col items-center justify-center text-center p-8`}>
                  <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                    <Scissors className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                    {isAr ? company.aboutTitleAr || 'مصنعنا' : company.aboutTitleFr || 'Notre Atelier'}
                  </h2>
                  <p className="text-white/60 text-sm font-medium max-w-sm">
                    {isAr ? 'نصنع بدقة وشغف منذ سنوات' : 'Fabrication avec précision et passion'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: company.experienceYears || '5+', label: isAr ? 'سنوات خبرة' : 'Ans d\'exp.', icon: '🏆' },
                  { value: '50+', label: isAr ? 'زبون راضٍ' : 'Clients', icon: '🤝' },
                  { value: '1000+', label: isAr ? 'قطعة منجزة' : 'Pièces', icon: '👗' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-4 text-center">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="text-xl font-black text-slate-900">{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* About text */}
              {(company.aboutTextFr || company.aboutTextAr) && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    {isAr ? 'من نحن' : 'Qui sommes-nous'}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {isAr ? company.aboutTextAr : company.aboutTextFr}
                  </p>
                </div>
              )}

              {/* Production steps */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  {isAr ? 'مراحل الإنتاج' : 'Notre Process de Production'}
                </h3>
                <div className="space-y-3">
                  {[
                    { step: '01', icon: '📐', labelFr: 'Patronage & Modélisme', labelAr: 'الباترون والتصميم', descFr: 'Création du patron de base selon vos mesures', descAr: 'إنشاء الباترون حسب قياساتكم' },
                    { step: '02', icon: '✂️', labelFr: 'Coupe', labelAr: 'الفصالة', descFr: 'Découpe précise du tissu', descAr: 'قص دقيق للقماش' },
                    { step: '03', icon: '🧵', labelFr: 'Montage & Couture', labelAr: 'الخياطة', descFr: 'Assemblage soigné de toutes les pièces', descAr: 'تجميع دقيق لجميع القطع' },
                    { step: '04', icon: '✨', labelFr: 'Finition', labelAr: 'الفينيسيون', descFr: 'Broderie, étiquettes, détails finaux', descAr: 'تطريز، ملصقات، التفاصيل النهائية' },
                    { step: '05', icon: '🔍', labelFr: 'Contrôle Qualité', labelAr: 'مراقبة الجودة', descFr: 'Vérification rigoureuse avant livraison', descAr: 'فحص دقيق قبل التسليم' },
                    { step: '06', icon: '📦', labelFr: 'Emballage & Livraison', labelAr: 'التغليف والتسليم', descFr: 'Emballage soigné et livraison sécurisée', descAr: 'تغليف عناية وتسليم آمن' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg shrink-0">{p.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-800">{isAr ? p.labelAr : p.labelFr}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{isAr ? p.descAr : p.descFr}</p>
                      </div>
                      <span className="text-[10px] font-black text-indigo-300">{p.step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications / Engagements */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isAr ? 'التزاماتنا' : 'Nos Engagements'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '✅', labelFr: 'Échantillon validé', labelAr: 'عينة معتمدة' },
                    { icon: '🔒', labelFr: 'Confidentialité design', labelAr: 'سرية التصميم' },
                    { icon: '📸', labelFr: 'Photos de production', labelAr: 'صور الإنتاج' },
                    { icon: '💬', labelFr: 'Suivi WhatsApp', labelAr: 'متابعة واتساب' },
                    { icon: '🏷️', labelFr: 'Étiquettes sur mesure', labelAr: 'ملصقات مخصصة' },
                    { icon: '🚚', labelFr: 'Livraison assurée', labelAr: 'توصيل مضمون' },
                  ].map((e, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl px-3 py-2.5">
                      <span className="text-base">{e.icon}</span>
                      <p className="text-[11px] font-bold text-slate-700">{isAr ? e.labelAr : e.labelFr}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vision/Mission */}
              {(company.visionTextFr || company.missionTextFr) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.visionTextFr && (
                    <div className="bg-indigo-50 rounded-[2rem] border border-indigo-100 p-6">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">👁 {isAr ? 'رؤيتنا' : 'Notre Vision'}</p>
                      <p className="text-sm text-indigo-900 font-medium leading-relaxed">{isAr ? company.visionTextAr : company.visionTextFr}</p>
                    </div>
                  )}
                  {company.missionTextFr && (
                    <div className="bg-violet-50 rounded-[2rem] border border-violet-100 p-6">
                      <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">🎯 {isAr ? 'مهمتنا' : 'Notre Mission'}</p>
                      <p className="text-sm text-violet-900 font-medium leading-relaxed">{isAr ? company.missionTextAr : company.missionTextFr}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isAr ? 'معلومات وأسعار' : 'Infos & Prix'}
                </h2>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/#/info`;
                    if (navigator.share) {
                      navigator.share({ title: `${company.name} — Info`, url });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert(isAr ? '✅ تم نسخ الرابط' : '✅ Lien copié !');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {isAr ? 'مشاركة الرابط' : 'Partager'}
                </button>
              </div>
              <ClientInfo company={company} />
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               {/* Quick Actions Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <a href={`https://wa.me/${company.phone.replace(/\D/g, '')}`} target="_blank" className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-lg shadow-emerald-100/50 flex items-center gap-6 group hover:border-emerald-300 transition-all">
                     <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-7 h-7" />
                     </div>
                     <div className="flex-1">
                       <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1">WhatsApp Business</h3>
                       <p className="text-slate-400 text-[11px] font-bold">{isAr ? 'تواصل معنا مباشرة عبر الواتساب' : 'Discutez avec nous sur WhatsApp'}</p>
                     </div>
                  </a>

                  <a 
                    href={`https://wa.me/${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      isAr 
                        ? `مرحباً فريق ${company.name}، أنا ${currentUser?.nom}. بغيت نطلب موعد لمناقشة تقنية بخصوص الموديلات ديالي.`
                        : `Bonjour l'équipe ${company.name}, je suis ${currentUser?.nom}. J'aimerais demander un rendez-vous pour une discussion technique concernant mes modèles.`
                    )}`}
                    target="_blank"
                    className="p-6 bg-white border border-indigo-100 rounded-3xl shadow-lg shadow-indigo-100/50 flex items-center gap-6 group hover:border-indigo-300 transition-all"
                  >
                     <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                        <ArrowRight className="rotate-[-45deg] w-7 h-7" />
                     </div>
                     <div className="flex-1">
                       <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1">{isAr ? 'طلب موعد' : 'Rendez-vous'}</h3>
                       <p className="text-slate-400 text-[11px] font-bold">{isAr ? 'حدد موعداً لمناقشة مشروعك' : 'Planifier une rencontre technique'}</p>
                     </div>
                  </a>
               </div>

               <div className="flex flex-col h-[60vh] bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                 {/* Chat Header */}
                 <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                   <MessageCircle className="w-6 h-6 text-white" />
                 </div>
                 <div className="flex-1">
                   <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{isAr ? 'رسائل الدعم الفني' : 'Messages Support VIP'}</h2>
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                     <ShieldCheck className="w-3 h-3" /> {isAr ? 'محادثة آمنة ومباشرة' : 'Discussion Sécurisée et Directe'}
                   </p>
                 </div>
                 <button 
                   onClick={handleClearClientChat}
                   className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group shrink-0"
                   title={isAr ? 'حذف المحادثة' : 'Supprimer la conversation'}
                 >
                   <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 </button>
               </div>

               {/* Chat Messages */}
               <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/30">
                  {mesDemandes.filter(m => m.type === '__MESSAGE__' || m.type === '__MESSAGE_REPLY__').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(msg => {
                    const isClient = msg.type === '__MESSAGE__';
                    return (
                      <div key={msg.id} className={`flex ${isClient ? (isAr ? 'justify-end' : 'justify-end') : (isAr ? 'justify-start' : 'justify-start')} group`}>
                        {isClient && (
                          <button onClick={() => handleDeleteClientMsg(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all mr-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl shadow-sm ${isClient ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                          <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.details}</p>
                          <span className={`block text-[10px] mt-2 font-bold ${isClient ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.date).toLocaleString(isAr ? 'ar-MA' : 'fr-MA', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        {!isClient && (
                          <button onClick={() => handleDeleteClientMsg(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {mesDemandes.filter(m => m.type === '__MESSAGE__' || m.type === '__MESSAGE_REPLY__').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                      <MessageCircle className="w-16 h-16 mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">{isAr ? 'لا توجد رسائل بعد' : 'Aucun message pour le moment'}</p>
                    </div>
                  )}
               </div>

               {/* Chat Input */}
               <div className="p-6 md:p-8 border-t border-slate-100 bg-white">
                 <div className="flex gap-3 relative">
                   <textarea 
                     id="chat-input"
                     placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Écrivez votre message ici...'}
                     className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 text-sm font-medium resize-none outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all max-h-32 min-h-[60px]"
                     rows={1}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         const val = (e.target as HTMLTextAreaElement).value;
                         if (val.trim()) {
                           const newMsg = {
                             id: Date.now().toString(),
                             name: currentUser?.nom || 'Client',
                             phone: currentUser?.telephone || '',
                             email: currentUser?.email || '',
                             type: '__MESSAGE__',
                             details: val.trim(),
                             date: new Date().toISOString(),
                             status: 'completed',
                             quantity: 0
                           };
                           saveRecord('leads', newMsg, true).then(() => {
                             setMesDemandes(prev => [...prev, newMsg as any]);
                             (document.getElementById('chat-input') as HTMLTextAreaElement).value = '';
                           });
                         }
                       }
                     }}
                   />
                   <button 
                     onClick={() => {
                       const el = document.getElementById('chat-input') as HTMLTextAreaElement;
                       if (el.value.trim()) {
                         const newMsg = {
                             id: Date.now().toString(),
                             name: currentUser?.nom || 'Client',
                             phone: currentUser?.telephone || '',
                             email: currentUser?.email || '',
                             type: '__MESSAGE__',
                             details: el.value.trim(),
                             date: new Date().toISOString(),
                             status: 'completed',
                             quantity: 0
                           };
                           saveRecord('leads', newMsg, true).then(() => {
                             setMesDemandes(prev => [...prev, newMsg as any]);
                             el.value = '';
                           });
                       }
                     }}
                     className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 shrink-0 group"
                   >
                     <Send className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   </button>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 text-center">
                   {isAr ? 'اضغط Enter لإرسال الرسالة' : 'Appuyez sur Entrée pour envoyer'}
                 </p>
               </div>
             </div>
            </div>
          )}

          {/* BEYA NETWORK TAB (Exclusive Pilot for forsaone41@gmail.com and Admin) */}
          {activeTab === 'network' && isNetworkPilotUser && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* IF PROFILE NOT COMPLETED YET -> SHOW ONBOARDING GATEWAY */}
              {!isNetworkProfileCompleted() ? (
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-indigo-500/30 relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-orange-500/20 mb-6 text-white animate-bounce duration-1000">
                      <Users className="w-10 h-10" />
                    </div>
                    <span className="px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3">
                      {isAr ? 'عضوية الزبناء والبراندات VIP' : 'Espace Clients & Marques VIP'}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
                      {isAr ? 'طلب تفعيل حسابك في BEYA NETWORK 🌐' : 'Activation de votre accès BEYA NETWORK 🌐'}
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 max-w-lg mx-auto">
                      {isAr 
                        ? 'بصفتك زبوناً في BEYA، تتيح لك شبكة BEYA NETWORK الوصول الحصري إلى دليل الموردين المعتمدين للأقمشة والمطابع، والمشاركة في عروض الشراء المشترك بأسعار الجملة، ومجتمع رواد الموضة.'
                        : 'En tant que client BEYA, accédez au réseau exclusif des fournisseurs de tissus agréés, ateliers d\'impression et achats groupés.'}
                    </p>

                    <form onSubmit={handleSaveNetworkProfile} className="space-y-4 text-right" dir={isAr ? 'rtl' : 'ltr'}>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {isAr ? 'اسم البراند أو المحل التجاري *' : 'Nom de marque / enseigne *'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isAr ? 'مثال: Beya Streetwear' : 'Ex: Beya Brand'}
                            value={networkProfileForm.brandName}
                            onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, brandName: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-slate-400 text-xs font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {isAr ? 'المدينة *' : 'Ville *'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isAr ? 'الدار البيضاء، الرباط، طنجة...' : 'Casablanca, Rabat, Tanger...'}
                            value={networkProfileForm.city}
                            onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-slate-400 text-xs font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {isAr ? 'رقم الواتساب المباشر للتواصل *' : 'Numéro WhatsApp direct *'}
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="06XXXXXXXX / +2126XXXXXXX"
                            value={networkProfileForm.phone}
                            onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-slate-400 text-xs font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {isAr ? 'نبذة مختصرة أو تخصصك (اختياري)' : 'Spécialité / Bio (optionnel)'}
                          </label>
                          <input
                            type="text"
                            placeholder={isAr ? 'مثال: ملابس أوفر سايز، هودي، تيشيرت...' : 'Ex: Streetwear, Hoodies...'}
                            value={networkProfileForm.bio}
                            onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-slate-400 text-xs font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingNetworkProfile}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {savingNetworkProfile ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{isAr ? 'جاري تفعيل العضوية...' : 'Activation...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>{isAr ? '🚀 تفعيل عضويتي ودخول BEYA NETWORK' : '🚀 Activer mon profil et entrer'}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* PROFILE IS COMPLETED -> FULL BEYA NETWORK PORTAL */
                <div className="space-y-8 animate-in fade-in duration-500">
                  
                  {/* VIP Member Top Card */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10 text-center md:text-right" dir={isAr ? 'rtl' : 'ltr'}>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-orange-500/20 shrink-0">
                        {networkProfileForm.brandName ? networkProfileForm.brandName[0].toUpperCase() : 'B'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                            {networkProfileForm.brandName || currentUser?.nom}
                          </h1>
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> {isAr ? 'عضو معتمد BEYA' : 'Membre Vérifié'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-1">
                          📍 {networkProfileForm.city} &bull; {isAr ? '🏷️ علامة تجارية / زبون BEYA' : '🏷️ Marque / Client'}
                          {networkProfileForm.bio && ` &bull; ${networkProfileForm.bio}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      <button
                        onClick={() => setShowEditNetworkProfileModal(true)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل بروفايلي' : 'Modifier mon profil'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-xl mx-auto md:mx-0">
                    <button
                      onClick={() => setNetworkSubTab('fournisseurs')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        networkSubTab === 'fournisseurs'
                          ? 'bg-white text-indigo-700 shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>{isAr ? '🧵 دليل الموردين' : 'Fournisseurs'}</span>
                    </button>
                    <button
                      onClick={() => setNetworkSubTab('forum')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        networkSubTab === 'forum'
                          ? 'bg-white text-indigo-700 shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{isAr ? '💬 مجتمع BEYA' : 'Forum'}</span>
                    </button>
                    <button
                      onClick={() => setNetworkSubTab('groupage')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        networkSubTab === 'groupage'
                          ? 'bg-white text-indigo-700 shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{isAr ? '📦 الشراء المشترك' : 'Achats Groupés'}</span>
                    </button>
                  </div>

                  {/* SUBTAB 1: FOURNISSEURS AGRÉÉS */}
                  {networkSubTab === 'fournisseurs' && (
                    <div className="space-y-6">
                      {/* Search & Category Filter */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder={isAr ? 'ابحث عن مورد، نوع القماش، المدينة...' : 'Rechercher fournisseur, tissu, ville...'}
                            value={networkSearchQuery}
                            onChange={(e) => setNetworkSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl pr-11 pl-4 py-3 text-xs font-medium outline-none focus:border-indigo-500 shadow-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {[
                            { id: 'all', label: isAr ? 'الكل' : 'Tous' },
                            { id: 'tissu', label: isAr ? '🧵 أقمشة' : '🧵 Tissus' },
                            { id: 'impression', label: isAr ? '🖨️ مطابع وDTF' : '🖨️ Impression' },
                            { id: 'broderie', label: isAr ? '🪡 تطريز' : '🪡 Broderie' },
                            { id: 'modeliste', label: isAr ? '📐 موديلست' : '📐 Modéliste' },
                          ].map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setNetworkCategoryFilter(cat.id as any)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                                networkCategoryFilter === cat.id
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Suppliers Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {networkSuppliers
                          .filter(s => networkCategoryFilter === 'all' || s.category === networkCategoryFilter)
                          .filter(s => {
                            if (!networkSearchQuery.trim()) return true;
                            const q = networkSearchQuery.toLowerCase();
                            return s.name.toLowerCase().includes(q) ||
                                   s.city.toLowerCase().includes(q) ||
                                   s.desc.toLowerCase().includes(q) ||
                                   s.products.some(p => p.toLowerCase().includes(q));
                          })
                          .map(sup => (
                            <div key={sup.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                                    {sup.categoryLabel}
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                    ⭐ {sup.rating}
                                  </span>
                                </div>

                                <h3 className="font-black text-slate-900 text-base mb-1">{sup.name}</h3>
                                <p className="text-xs text-slate-400 font-bold mb-3 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" /> {sup.city}
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed mb-4">{sup.desc}</p>

                                <div className="space-y-1.5 mb-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isAr ? 'المنتجات / الخدمات المتاحة:' : 'Disponibilités :'}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {sup.products.map((prod, i) => (
                                      <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-100">
                                        {prod}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-100">
                                <p className="text-[11px] text-slate-500 font-bold mb-3">
                                  📦 {isAr ? 'الكمية الدنيا:' : 'Minimum :'} <span className="text-slate-900 font-black">{sup.minQty}</span>
                                </p>
                                <a
                                  href={`https://wa.me/${sup.whatsapp}?text=${encodeURIComponent(
                                    `Bonjour ${sup.name}, je vous contacte via BEYA NETWORK (Code Partenaire: BEYA-VIP-2026). Je suis intéressé par vos produits et tarifs.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{isAr ? 'تواصل عبر الواتساب (كود BEYA)' : 'Contacter sur WhatsApp'}</span>
                                </a>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: FORUM & ENTRAIDE */}
                  {networkSubTab === 'forum' && (
                    <div className="space-y-6">
                      {/* Security Banner */}
                      <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-5 flex items-start gap-3">
                        <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black text-indigo-900 uppercase tracking-tight">
                            {isAr ? '🔒 فضاء مجتمع BEYA الآمن لتبادل الخبرات' : 'Espace Communautaire Sécurisé'}
                          </h4>
                          <p className="text-xs text-indigo-700 leading-relaxed mt-0.5">
                            {isAr 
                              ? 'هذا الفضاء مخصص لمشاركة التجارب والنصائح العامة بين رواد الموضة وصناع الملابس. حفاظاً على سرية مشاريعكم، يُمنع مشاركة الأسعار أو تصاميم الموديلات الخاصة.'
                              : 'Cet espace est dédié aux retours d\'expérience et conseils. Vos devis et modèles restent 100% confidentiels et privés.'}
                          </p>
                        </div>
                      </div>

                      {/* Header + Add Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {[
                            { id: 'all', label: isAr ? 'جميع المواضيع' : 'Tous' },
                            { id: 'livraison', label: isAr ? '🚚 شركات التوصيل' : '🚚 Livraison' },
                            { id: 'marketing', label: isAr ? '📢 التسويق والإعلانات' : '📢 Marketing' },
                            { id: 'tissus', label: isAr ? '🧵 جودة الأقمشة' : '🧵 Tissus' },
                            { id: 'conseils', label: isAr ? '💡 نصائح عامة' : '💡 Conseils' },
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setNetworkForumTopicFilter(t.id as any)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                                networkForumTopicFilter === t.id
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setShowNewForumPostModal(true)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md shadow-indigo-600/20 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isAr ? 'كتابة سؤال أو مشاركة' : 'Poser une question'}</span>
                        </button>
                      </div>

                      {/* Posts Feed */}
                      <div className="space-y-4">
                        {forumPosts
                          .filter(p => networkForumTopicFilter === 'all' || p.category === networkForumTopicFilter)
                          .map(post => (
                            <div key={post.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm">
                                    {post.author[0]}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-900 text-xs">{post.author}</h4>
                                      <span className="text-[10px] text-slate-400 font-medium">&bull; 📍 {post.city}</span>
                                    </div>
                                    <p className="text-[10px] text-indigo-600 font-bold">{post.authorRole}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">{post.date}</span>
                              </div>

                              <h3 className="font-black text-slate-900 text-sm md:text-base mb-2">{post.title}</h3>
                              <p className="text-xs text-slate-600 leading-relaxed mb-4">{post.content}</p>

                              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleLikePost(post.id)}
                                    className={`flex items-center gap-1.5 font-bold transition cursor-pointer ${
                                      post.liked ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-4 h-4 ${post.liked ? 'fill-rose-600' : ''}`} />
                                    <span>{post.likesCount}</span>
                                  </button>

                                  <span className="flex items-center gap-1.5 text-slate-400 font-bold">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{post.repliesCount} {isAr ? 'رد' : 'réponses'}</span>
                                  </span>
                                </div>

                                <button
                                  onClick={() => alert(isAr ? 'يمكنك المشاركة بالرد أو التفاعل مع الموضوع مباشرة!' : 'Espace réponse activé.')}
                                  className="text-indigo-600 hover:text-indigo-800 font-black text-xs cursor-pointer"
                                >
                                  {isAr ? 'أضف تعقيباً ←' : 'Répondre ←'}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: ACHATS GROUPÉS */}
                  {networkSubTab === 'groupage' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 rounded-3xl p-6 text-slate-900">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                            📦
                          </div>
                          <div>
                            <h3 className="font-black text-base text-slate-900 mb-1">
                              {isAr ? 'ما هو الشراء المشترك للأقمشة (Achats Groupés)؟' : 'Comment fonctionne l\'achat groupé ?'}
                            </h3>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {isAr
                                ? 'نقوم بتجميع طلبيات أعضاء BEYA NETWORK لحجز رولوات الأقمشة مباشرة من مصانع الغزل والنسيج بأسعار الجملة الكبرى (وفر حتى 30% مقارنة بأسواق التقسيط). بعد اكتمال الكمية، تُسلّم الأقمشة مباشرة إلى ورشة BEYA لبدء تفصيل وخياطة طلبياتكم.'
                                : 'Nous regroupons les commandes des membres pour commander directement aux usines au tarif usine grand volume (jusqu\'à -30%).'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {networkGroupage.map(grp => (
                          <div key={grp.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-full">
                                  {isAr ? 'تخفيض' : 'Réduction'} {grp.savingsPct}
                                </span>
                                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                                  ⏳ {isAr ? `باقي ${grp.deadlineDays} أيام` : `${grp.deadlineDays} jours restants`}
                                </span>
                              </div>

                              <h3 className="font-black text-slate-900 text-base mb-1">{grp.fabricName}</h3>
                              <p className="text-xs text-slate-400 font-bold mb-4">🏭 {grp.factory}</p>

                              <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-2xl font-black text-indigo-600">{grp.groupPriceMAD} DH</span>
                                <span className="text-xs text-slate-400 line-through font-bold">{grp.regularPriceMAD} DH/m</span>
                                <span className="text-xs text-slate-500 font-medium">({isAr ? 'للمتر الصافي' : 'le mètre'})</span>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-1.5 mb-4">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="text-slate-600">{isAr ? 'نسبة الاكتمال:' : 'Progression :'}</span>
                                  <span className="text-indigo-600 font-black">{grp.currentMeters}m / {grp.targetMeters}m ({grp.progressPct}%)</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-500"
                                    style={{ width: `${grp.progressPct}%` }}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isAr ? 'الألوان المتوفرة في هذا العرض:' : 'Coloris inclus :'}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {grp.colors.map((c, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-100">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <a
                              href={`https://wa.me/212600000000?text=${encodeURIComponent(grp.whatsappMsg)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition active:scale-95"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>{isAr ? '📲 حجز حصتي في الطلبية المشتركة' : 'Réserver ma part'}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>
      </main>


      {/* Annulation Modal */}
      {annulationModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 text-lg">✕</div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {isAr ? 'طلب إلغاء الطلبية' : 'Demander l\'annulation'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">{annulationModal.ref}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-amber-700">
                  {isAr
                    ? '⚠️ طلبك سيُرسل للمراجعة. لن يُلغى تلقائياً حتى يوافق فريقنا.'
                    : '⚠️ Votre demande sera examinée. Elle ne sera pas annulée automatiquement sans confirmation de notre équipe.'
                  }
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  {isAr ? 'سبب الإلغاء' : 'Raison de l\'annulation'}
                </label>
                <textarea
                  value={annulationRaison}
                  onChange={e => setAnnulationRaison(e.target.value)}
                  placeholder={isAr ? 'اشرح سبب طلب الإلغاء...' : 'Expliquez la raison de votre demande...'}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-rose-400 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setAnnulationModal(null); setAnnulationRaison(''); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase hover:bg-slate-200 transition-all"
                >
                  {isAr ? 'رجوع' : 'Retour'}
                </button>
                <button
                  onClick={handleDemandeAnnulation}
                  disabled={annulationSending}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase hover:bg-rose-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {annulationSending ? <RotateCw className="w-4 h-4 animate-spin" /> : '✕'}
                  {isAr ? 'إرسال الطلب' : 'Envoyer la demande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoiceView && selectedFacture && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[200] p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Receipt className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{isAr ? 'معاينة الفاتورة' : 'Aperçu Document'}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{selectedFacture.numero}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setShowInvoiceView(false)} className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">{isAr ? 'إغلاق' : 'Fermer'}</button>
                 <button onClick={() => printElement(`invoice-${selectedFacture.id}`)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-3">
                    <Download className="w-4 h-4" />
                    {isAr ? 'حفظ / طباعة' : 'Imprimer PDF'}
                 </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
               <InvoicePRO 
                  id={`invoice-${selectedFacture.id}`}
                  facture={selectedFacture}
                  commande={commandes.find(c => c.id === selectedFacture.commandeId)}
                  company={company}
               />
            </div>
          </div>
        </div>
      )}

      {/* Technical Measurements Preview Modal */}
      {viewMesuresFiche && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'تفاصيل القياسات' : 'Détails des Mesures'}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{viewMesuresFiche.modele} • {viewMesuresFiche.client}</p>
              </div>
              <button onClick={() => setViewMesuresFiche(null)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all group">
                <X className="w-6 h-6 text-slate-900 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto no-scrollbar flex-grow">
              <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className={`px-6 py-5 font-black uppercase tracking-widest text-[10px] ${isAr ? 'text-right' : 'text-left'}`}>
                          {isAr ? 'نقطة القياس' : 'Point de Mesure'}
                        </th>
                        {viewMesuresFiche.tailles.map(t => (
                          <th key={t} className="px-6 py-5 text-center font-black uppercase tracking-widest text-[10px]">
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewMesuresFiche.mesures.map((m, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                          <td className={`px-6 py-4 font-bold text-slate-700 ${isAr ? 'text-right' : 'text-left'}`}>
                            {m.nom}
                          </td>
                          {viewMesuresFiche.tailles.map(taille => (
                            <td key={taille} className="px-6 py-4 text-center font-black text-indigo-600">
                              {m.valeurs?.[taille] || 0}<span className="text-[10px] font-normal text-slate-400 ml-1">{isAr ? 'سم' : 'cm'}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center flex-shrink-0">
               <button onClick={() => setViewMesuresFiche(null)} className="px-10 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 text-xs font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95">
                 {isAr ? 'إغلاق' : 'Fermer'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
            <div className={`p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {isAr ? (editingDemandeId ? 'تعديل الموديل' : 'موديل جديد') : (editingDemandeId ? 'Modifier le Modèle' : 'Nouveau Modèle')}
              </h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {orderSent ? (
                <div className="text-center py-10 animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                    <CircleCheck className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">{isAr ? (editingDemandeId ? 'تم تعديل الطلب بنجاح!' : 'تم إرسال طلبك!') : (editingDemandeId ? 'Demande modifiée avec succès !' : 'Commande Envoyée !')}</h4>
                  <p className="text-slate-500 text-sm font-medium">{isAr ? 'سنتواصل معك في أقرب وقت لتأكيد التفاصيل.' : 'Notre équipe vous contactera sous peu.'}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'نوع الموديل' : 'Type de Modèle'}</label>
                      <input 
                        type="text" 
                        value={newOrderForm.modele}
                        onChange={e => setNewOrderForm({...newOrderForm, modele: e.target.value})}
                        placeholder={isAr ? 'مثلاً: قميص بولو' : 'Ex: Polo Shirt'}
                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all ${isAr ? 'text-right' : ''}`}
                      />
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                        {isAr ? 'رقم الهاتف المعتمد بالطلب:' : 'Téléphone du compte :'}
                      </span>
                      <span className="font-mono font-black text-slate-800">
                        {currentUser?.telephone || (mesDemandes.find(d => d.phone)?.phone) || 'مسجل تلقائياً بالحساب'}
                      </span>
                    </div>
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'الكمية التقديرية' : 'Quantité Estimée'}</label>
                      <input 
                        type="number" 
                        value={newOrderForm.quantite}
                        onChange={e => setNewOrderForm({...newOrderForm, quantite: e.target.value})}
                        placeholder="100"
                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all ${isAr ? 'text-right' : ''}`}
                      />
                    </div>

                    {/* Size Breakdown */}
                    <div className="space-y-3">
                       <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>
                          {isAr ? 'تفصيل القياسات (اختياري)' : 'Répartition par Tailles (Optionnel)'}
                       </label>
                       <div className="grid grid-cols-3 gap-2">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <div key={size} className="relative">
                               <input
                                 type="number"
                                 placeholder={size}
                                 value={newOrderForm.tailles[size]}
                                 onChange={(e) => setNewOrderForm({
                                   ...newOrderForm,
                                   tailles: { ...newOrderForm.tailles, [size]: e.target.value }
                                 })}
                                 className={`w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-center outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300`}
                               />
                               <span className="absolute -top-2 left-2 px-1 bg-white text-[8px] font-black text-slate-400 uppercase">{size}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>
                        {isAr ? 'صورة الموديل' : 'Photo du Modèle'}
                        <span className="text-rose-500 ml-2">({isAr ? 'إجباري' : 'Obligatoire'} *)</span>
                      </label>
                      <div className="relative h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-400 transition-colors cursor-pointer">
                        {newOrderForm.photo ? (
                          <>
                            <img src={newOrderForm.photo} className="w-full h-full object-cover" />
                            <button onClick={() => setNewOrderForm({...newOrderForm, photo: null})} className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <Camera className="w-6 h-6 text-slate-300 mb-2" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'تحميل الصورة' : 'Ajouter une photo'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleOrderPhoto} />
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'تفاصيل إضافية' : 'Détails Supplémentaires'}</label>
                      <textarea 
                        value={newOrderForm.details}
                        onChange={e => setNewOrderForm({...newOrderForm, details: e.target.value})}
                        rows={3}
                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all resize-none ${isAr ? 'text-right' : ''}`}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={sendingOrder || !newOrderForm.modele || !newOrderForm.quantite || !newOrderForm.photo}
                    onClick={submitNewOrder}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-100"
                  >
                    {sendingOrder ? (
                      <RotateCw className="w-5 h-5 animate-spin" />
                    ) : editingDemandeId ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    {isAr
                      ? (editingDemandeId ? 'تعديل الطلب' : 'إرسال الطلب')
                      : (editingDemandeId ? 'Modifier la demande' : 'Envoyer la Commande')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Fiche Technique & Devis Estimatif Modal */}
      {selectedDemandeFiche && (() => {
        const d = selectedDemandeFiche;
        const analysis = getDemandeAnalysis(d, isAr);
        const sizes = getLeadSizes(d);
        const hasCustomSizes = Object.keys(sizes).length > 0;
        const phoneForWhatsApp = (company.phone || '+212600000000').replace(/\D/g, '');
        const waText = isAr
          ? `السلام عليكم ورشة ${company.name || 'BEYA'}، بخصوص الملف التقني للطلب REF: #${d.id.substring(0, 8).toUpperCase()}:\n- الموديل: ${analysis.modeleReel}\n- الكمية: ${analysis.qty} pcs\n- السعر: ${analysis.unitPrice} MAD/pc (الإجمالي: ${analysis.totalPrice.toLocaleString()} MAD)\nبغيت نأكد الدوفيس ونبداو العينة. شكراً!`
          : `Bonjour l'Atelier ${company.name || 'BEYA Creative'}, concernant la Fiche Technique REF: #${d.id.substring(0, 8).toUpperCase()} :\n- Modèle : ${analysis.modeleReel}\n- Quantité : ${analysis.qty} pcs\n- Prix : ${analysis.unitPrice} MAD/pc (Total : ${analysis.totalPrice.toLocaleString()} MAD)\nJe valide ce devis pour lancer le prototypage.`;
        const waUrl = `https://wa.me/${phoneForWhatsApp}?text=${encodeURIComponent(waText)}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col my-auto" dir={isAr ? 'rtl' : 'ltr'}>
              {/* Header */}
              <div className="p-6 bg-slate-950 text-white flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base uppercase tracking-wider">{isAr ? 'الملف التقني وعرض السعر' : 'Fiche Technique & Devis Estimatif'}</h3>
                    <p className="text-xs text-slate-400">REF: #{d.id.substring(0, 8).toUpperCase()} • {company.name || 'BEYA CREATIVE'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title={isAr ? 'طباعة' : 'Imprimer'}
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedDemandeFiche(null)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Body */}
              <div className="p-6 md:p-8 space-y-6 flex-1 text-slate-800">
                {/* Top Info Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                      <LeadCardImage
                        lead={d}
                        leadPhotos={leadPhotos}
                        onPhotoLoaded={handlePhotoLoaded}
                        alt={analysis.modeleReel}
                        dark={false}
                        iconSize={8}
                        isAr={isAr}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">{isAr ? 'الموديل المعتمد' : 'Modèle Technique'}</span>
                      <h4 className="text-lg font-black text-slate-900">{analysis.modeleReel}</h4>
                      <p className="text-xs text-slate-500 font-bold">{isAr ? 'الزبون :' : 'Client :'} {d.name || currentUser?.nom || 'Client'} {d.phone ? `(${d.phone})` : ''}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{isAr ? 'تاريخ الإصدار' : 'Date d\'émission'}</span>
                    <span className="text-xs font-black text-slate-700">{d.date ? new Date(d.date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-indigo-600" />
                    {isAr ? 'المواصفات التقنية والمواد' : 'Cahier des Charges & Matières'}
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <td className="p-3.5 font-bold text-slate-500 w-1/3">{isAr ? 'القماش الرئيسي' : 'Matière Principale'}</td>
                          <td className="p-3.5 font-black text-slate-900">{analysis.tissuSuggere}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3.5 font-bold text-slate-500">{isAr ? 'الفصالة والباترون' : 'Patronage & Modélisme'}</td>
                          <td className="p-3.5 font-bold text-slate-700">{isAr ? 'باترون احترافي رقمي بمقاسات مظبوطة (Coupe Numérique Haute Précision)' : 'Patronage industriel numérique avec gradation normée'}</td>
                        </tr>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <td className="p-3.5 font-bold text-slate-500">{isAr ? 'التشطيبات والإكسسوارات' : 'Finitions & Fournitures'}</td>
                          <td className="p-3.5 font-bold text-slate-700">{analysis.techDetails}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3.5 font-bold text-slate-500">{isAr ? 'الطباعة / التطريز' : 'Marquage / Sérigraphie'}</td>
                          <td className="p-3.5 font-bold text-slate-700">{isAr ? 'سيريغرافي عالي الجودة أو تطريز بارز على الصدر' : 'Sérigraphie textile haute tenue / Broderie relief poitrine'}</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-3.5 font-bold text-slate-500">{isAr ? 'مدة الإنتاج المتوقعة' : 'Délai de Livraison'}</td>
                          <td className="p-3.5 font-black text-indigo-700">{analysis.delaiEstime}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sizing Breakdown Table */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    {isAr ? 'المقاسات والكميات' : 'Grille des Tailles'}
                  </h4>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                      <div key={sz} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">{sz}</span>
                        <span className="text-sm font-black text-slate-900">{sizes[sz] ? `${sizes[sz]} pcs` : (hasCustomSizes ? '0' : '—')}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-2 text-center">
                    {isAr ? `إجمالي الكمية: ${analysis.qty} قطعة` : `Total commande : ${analysis.qty} pièces`}
                  </p>
                </div>

                {/* Financial Breakdown Table */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    {isAr ? 'تفاصيل السعر التقديري (Devis)' : 'Décomposition du Prix (Devis Estimatif)'}
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3 text-left">{isAr ? 'البيان' : 'Poste de Coût'}</th>
                          <th className="p-3 text-right">{isAr ? 'التقدير / القطعة' : 'Estimation / pc'}</th>
                          <th className="p-3 text-right">{isAr ? 'المجموع' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        <tr>
                          <td className="p-3 font-bold text-slate-700">{isAr ? 'المواد الأولية (الأقمشة، مستلزمات الخياطة والإكسسوارات)' : 'Matières premières (Tissus, fournitures & accessoires)'}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">{Math.round(analysis.unitPrice * 0.48)} MAD</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">{Math.round(analysis.unitPrice * 0.48 * analysis.qty).toLocaleString()} MAD</td>
                        </tr>
                        <tr className="bg-slate-50/40">
                          <td className="p-3 font-bold text-slate-700">{isAr ? 'الفصالة والخياطة والتركيب الصناعي' : 'Coupe, confection et assemblage industriel'}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">{Math.round(analysis.unitPrice * 0.32)} MAD</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">{Math.round(analysis.unitPrice * 0.32 * analysis.qty).toLocaleString()} MAD</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-700">{isAr ? 'الماركينغ، الطباعة/التطريز والفينيسيون' : 'Marquage, finitions & packaging'}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">{Math.round(analysis.unitPrice * 0.20)} MAD</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">{Math.round(analysis.unitPrice * 0.20 * analysis.qty).toLocaleString()} MAD</td>
                        </tr>
                        <tr className="bg-indigo-50/80 font-black text-indigo-950 text-sm">
                          <td className="p-4">{isAr ? 'السعر الصافي للقطعة' : 'PRIX UNITAIRE HT'}</td>
                          <td className="p-4 text-right font-mono text-base text-indigo-700">{analysis.unitPrice} MAD</td>
                          <td className="p-4 text-right font-mono text-base text-indigo-700">{analysis.totalPrice.toLocaleString()} MAD</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Guarantee & Terms */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {isAr ? 'ضمان ورشة BEYA CREATIVE للمطابقة والجودة' : 'Garantie Conformité & Qualité Atelier BEYA'}
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    {isAr 
                      ? 'يتم إعداد عينة أولية (Prototype Échantillon) واعتمادها من طرفكم قبل إطلاق الإنتاج الشامل. يتم دفع تسبيق 50% عند انطلاق العينة والباقي عند التسليم النهائي.' 
                      : 'Un prototype d\'échantillon physique est validé avant le lancement de la production en série. Acompte de 50% au lancement, solde à la livraison après contrôle qualité.'}
                  </p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
                <button
                  onClick={() => setSelectedDemandeFiche(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Fermer'}
                </button>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد الطلب والبدء عبر واتساب' : 'Valider et Lancer l\'Échantillon sur WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Atelier Response Quick Edit Modal (Test Mode) */}
      {atelierQuickEditLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-wider">{isAr ? 'رد الورشة (وضع التجربة)' : 'Réponse Atelier (Mode Test)'}</h3>
                  <p className="text-xs text-slate-400">REF: #{atelierQuickEditLead.id.substring(0, 8).toUpperCase()} • {currentUser?.email}</p>
                </div>
              </div>
              <button onClick={() => setAtelierQuickEditLead(null)} className="text-slate-400 hover:text-white p-1 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'اسم الموديل المعتمد' : 'Nom Exact du Modèle'}
                </label>
                <input
                  type="text"
                  value={quickEditForm.modeleReel}
                  onChange={(e) => setQuickEditForm(prev => ({ ...prev, modeleReel: e.target.value }))}
                  placeholder="Ex: Hoodie à Capuche Oversize avec Sérigraphie Poitrine"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'السعر للقطعة (درهم)' : 'Prix Unitaire (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={quickEditForm.unitPrice}
                    onChange={(e) => setQuickEditForm(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'مرحلة التقدم' : 'Étape d\'Avancement'}
                  </label>
                  <select
                    value={quickEditForm.statusProgression}
                    onChange={(e) => setQuickEditForm(prev => ({ ...prev, statusProgression: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="reception">1. Reçu (تم الاستلام)</option>
                    <option value="etude">2. Étude & Devis (دراسة وتحديد السعر)</option>
                    <option value="echantillon">3. Échantillon (إعداد العينة)</option>
                    <option value="production">4. Production (قيد الإنتاج)</option>
                    <option value="pret">5. Prêt (جاهز للتسليم)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'ثمن الباتروناج (درهم)' : 'Patronage (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={quickEditForm.patronagePrice}
                    onChange={(e) => setQuickEditForm(prev => ({ ...prev, patronagePrice: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAr ? 'ثمن العينة الأولية (درهم)' : 'Échantillon (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={quickEditForm.prixEchantillon}
                    onChange={(e) => setQuickEditForm(prev => ({ ...prev, prixEchantillon: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'نوع الثوب المقترح' : 'Tissu & Matière Recommandée'}
                </label>
                <input
                  type="text"
                  value={quickEditForm.tissuSuggere}
                  onChange={(e) => setQuickEditForm(prev => ({ ...prev, tissuSuggere: e.target.value }))}
                  placeholder="Ex: Molleton Coton Gratté 320g / French Terry"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'الفصالة والتشطيبات' : 'Finitions & Sérigraphie'}
                </label>
                <textarea
                  rows={2}
                  value={quickEditForm.techDetails}
                  onChange={(e) => setQuickEditForm(prev => ({ ...prev, techDetails: e.target.value }))}
                  placeholder="Ex: Capuche doublée avec cordons • Sérigraphie Poitrine • Bord-côte poignets et bas"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'مدة التسليم المقدرة' : 'Délai Estimé'}
                </label>
                <input
                  type="text"
                  value={quickEditForm.delaiEstime}
                  onChange={(e) => setQuickEditForm(prev => ({ ...prev, delaiEstime: e.target.value }))}
                  placeholder="Ex: 7 - 10 jours ouvrables"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAr ? 'رسالة أو ملاحظة الورشة للزبون' : 'Note / Réponse de l\'Atelier pour le Client'}
                </label>
                <textarea
                  rows={2}
                  value={quickEditForm.reponseAtelier}
                  onChange={(e) => setQuickEditForm(prev => ({ ...prev, reponseAtelier: e.target.value }))}
                  placeholder="Ex: Votre modèle Hoodie a été analysé par notre bureau technique..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setAtelierQuickEditLead(null)}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="button"
                disabled={savingQuickEdit}
                onClick={handleSaveQuickEdit}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savingQuickEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري الحفظ...' : 'Enregistrement...'}</span>
                  </>
                ) : (
                  <span>{isAr ? '💾 حفظ ونشر في البورتال' : '💾 Publier au Portail'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">{isAr ? 'تعيين كلمة المرور' : 'Définir mon mot de passe'}</h3>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white p-1 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDirectPassword} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'اختر كلمة مرور قوية وخاصة بك لتسجيل الدخول بها إلى حسابك ومتجرك مستقبلاً دون الحاجة لروابط البريد.'
                  : 'Choisissez un mot de passe pour vous connecter directement à votre compte et boutique sans dépendre d\'un lien email.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newDirectPassword}
                  onChange={(e) => setNewDirectPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmDirectPassword}
                  onChange={(e) => setConfirmDirectPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              {passwordSavedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'تم حفظ وتفعيل كلمة المرور بنجاح!' : 'Mot de passe enregistré et activé avec succès !'}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري الحفظ...' : 'Enregistrement...'}</span>
                    </>
                  ) : (
                    <span>{isAr ? 'حفظ وتفعيل الحساب' : 'Enregistrer'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT NETWORK PROFILE MODAL */}
      {showEditNetworkProfileModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isAr ? 'تعديل بروفايل BEYA NETWORK' : 'Modifier mon profil BEYA NETWORK'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditNetworkProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNetworkProfile} className="p-6 space-y-4 text-right" dir={isAr ? 'rtl' : 'ltr'}>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">{isAr ? 'نوع العضوية:' : 'Type de compte :'}</span>
                <span className="font-black text-indigo-700 bg-white px-3 py-1 rounded-xl shadow-xs">
                  {isAr ? '🏷️ صاحب علامة تجارية / زبون BEYA' : '🏷️ Marque / Client'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'اسم البراند أو المحل التجاري *' : 'Nom de marque *'}
                </label>
                <input
                  type="text"
                  required
                  value={networkProfileForm.brandName}
                  onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, brandName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isAr ? 'المدينة *' : 'Ville *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={networkProfileForm.city}
                    onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isAr ? 'رقم الواتساب *' : 'WhatsApp *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={networkProfileForm.phone}
                    onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'نبذة مختصرة أو تخصصك' : 'Bio / Spécialité'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: تيشيرتات وهوديات أوفر سايز' : 'Ex: Streetwear'}
                  value={networkProfileForm.bio}
                  onChange={(e) => setNetworkProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditNetworkProfileModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={savingNetworkProfile}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {savingNetworkProfile ? (isAr ? 'جاري الحفظ...' : 'Enregistrement...') : (isAr ? 'حفظ التغييرات' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW FORUM POST MODAL */}
      {showNewForumPostModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isAr ? 'مشاركة سؤال أو تجربة جديدة' : 'Nouveau sujet de discussion'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{isAr ? 'في مجتمع BEYA NETWORK' : 'Sur BEYA NETWORK'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewForumPostModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateForumPost} className="p-6 space-y-4 text-right" dir={isAr ? 'rtl' : 'ltr'}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'تصنيف الموضوع *' : 'Catégorie *'}
                </label>
                <select
                  value={newPostForm.category}
                  onChange={(e) => setNewPostForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                >
                  <option value="livraison">{isAr ? '🚚 شركات التوصيل واللوجستيك' : '🚚 Livraison'}</option>
                  <option value="marketing">{isAr ? '📢 التسويق والإعلانات' : '📢 Marketing'}</option>
                  <option value="tissus">{isAr ? '🧵 جودة الأقمشة والمواد' : '🧵 Tissus'}</option>
                  <option value="conseils">{isAr ? '💡 نصائح عامة وتجارب' : '💡 Conseils généraux'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'عنوان السؤال أو الموضوع *' : 'Titre du sujet *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: تجربتي مع شركات الشحن والتوصيل في كازا' : 'Titre clair et précis'}
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? 'التفاصيل والنصيحة *' : 'Détails du message *'}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={isAr ? 'اكتب تفاصيل سؤالك أو التجربة التي تريد مشاركتها مع الزملاء...' : 'Écrivez votre message ici...'}
                  value={newPostForm.content}
                  onChange={(e) => setNewPostForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[11px] font-bold text-amber-800">
                  {isAr 
                    ? '🔒 تذكير: يرجى عدم كتابة أسعار خاصة أو بيانات سرية لمشروعك للحفاظ على خصوصيتك.' 
                    : 'Rappel : ne partagez pas de données confidentielles ou de prix privés.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewForumPostModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  {isAr ? '🚀 نشر في المجتمع' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-wider">
                    {isAr ? 'إعدادات الذكاء الاصطناعي (Gemini API)' : 'Configuration IA (Gemini API)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr ? 'تحليل الموديلات بدقة، أسعار الخياطة، وكتالوج الأقمشة' : 'Analyse automatique des modèles et chiffrage'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-black text-indigo-950">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>{isAr ? 'أدخل مفتاح Google Gemini API الخاص بك' : 'Saisissez votre clé Google Gemini API'}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isAr 
                    ? 'هذا المفتاح كيمكن النظام ومستشار الورشة من تحليل صور الموديلات فالحين، تحديد نوع الثوب المطلوب، سعرو فدرب عمر، وثمن الخياطة المقترح تلقائياً.'
                    : 'Cette clé permet d\'analyser directement vos photos, d\'estimer les métrages et de chiffrer la confection avec l\'IA.'}
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 font-bold hover:underline text-[11px]"
                >
                  <span>{isAr ? 'الحصول على مفتاح مجاني من Google AI Studio ←' : 'Obtenir une clé gratuite sur Google AI Studio →'}</span>
                </a>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  {isAr ? 'مفتاح API Key' : 'Clé API (Google Gemini)'}
                </label>
                <input
                  type="password"
                  value={apiKeyDraft}
                  onChange={(e) => {
                    setApiKeyDraft(e.target.value);
                    setApiKeyTestResult(null);
                  }}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {apiKeyTestResult && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                  apiKeyTestResult.ok 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {apiKeyTestResult.ok ? <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{apiKeyTestResult.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={testingApiKey || !apiKeyDraft.trim()}
                  onClick={() => testGeminiApiKey(apiKeyDraft)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {testingApiKey ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{isAr ? 'اختبار المفتاح' : 'Tester'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'حفظ وتفعيل' : 'Enregistrer'}</span>
                </button>

                {geminiApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('beya_gemini_api_key');
                      setGeminiApiKey('');
                      setApiKeyDraft('');
                      setShowApiKeyModal(false);
                    }}
                    className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                    title={isAr ? 'حذف المفتاح' : 'Supprimer la clé'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Survey & Retention Questionnaire Modal */}
      {deleteModalLead && (() => {
        const selectedReason = DELETE_REASON_OPTIONS.find(r => r.id === deleteReasonId) || DELETE_REASON_OPTIONS[0];
        const leadWhatsAppUrl = `https://wa.me/${(company.phone || '+212600000000').replace(/\D/g, '')}?text=${encodeURIComponent(
          isAr
            ? `السلام عليكم ورشة ${company.name || 'BEYA'}، بخصوص طلبيتي للموديل "${deleteModalLead.type || deleteModalLead.modeleReel || 'الموديل'}" (REF: #${deleteModalLead.id.substring(0, 8).toUpperCase()}):
كنت باغي نحذف الطلب بسباب: (${selectedReason.labelAr}).
واش ممكن نلقاو شي حل تفاوضي مناسب لميزانيتي أو مدة التسليم؟ شكراً!`
            : `Bonjour Atelier ${company.name || 'BEYA Creative'}, demande REF: #${deleteModalLead.id.substring(0, 8).toUpperCase()} ("${deleteModalLead.type || deleteModalLead.modeleReel}") :
Motif d'hésitation : (${selectedReason.labelFr}).
Est-il possible de négocier un ajustement tarifaire ou de délai avant suppression ? Merci !`
        )}`;

        return (
          <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-5 md:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-black text-white leading-tight">
                      {isAr ? 'تأكيد حذف الموديل' : 'Supprimer cette demande'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-xs font-medium">
                      {deleteModalLead.type || deleteModalLead.modeleReel || 'Modèle'} • REF: #{deleteModalLead.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteModalLead(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body with Survey Questions */}
              <div className="p-5 md:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-slate-800">
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {isAr ? 'شارِكنا سبب اتخاذ قرار الحذف (اختيار سريع):' : 'Pour quelle raison principale souhaitez-vous supprimer ce modèle ?'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAr
                      ? 'ملاحظتك كتهمنا بزاف باش نطوروا الأسعار وجودة الخدمات ونلقاو حلول مناسبة لكل زبون.'
                      : 'Votre retour nous aide directement à ajuster nos offres et nos tarifs pour mieux vous satisfaire.'}
                  </p>
                </div>

                {/* Quick Select Grid */}
                <div className="space-y-2">
                  {DELETE_REASON_OPTIONS.map((opt) => {
                    const isSelected = deleteReasonId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDeleteReasonId(opt.id)}
                        className={`w-full p-3 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                              {isAr ? opt.labelAr : opt.labelFr}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-black">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {isAr ? opt.subAr : opt.subFr}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Smart Retention Callout for Negotiable Reasons (Price, Delay, Fabric, Quantity) */}
                {selectedReason?.isNegotiable && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/90 flex items-start gap-3 animate-in fade-in">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs text-amber-950">
                      <p className="font-bold leading-snug">
                        {isAr
                          ? '💡 قبل ما تحذف: واش عرفتي بلي الأثمنة ومدة التسليم قابلة للتفاوض المباشر مع المعلم؟'
                          : '💡 Bon à savoir : les tarifs et délais peuvent être ajustés sur mesure selon votre budget.'}
                      </p>
                      <p className="text-[11px] text-amber-800/90 mt-1">
                        {isAr
                          ? 'إدارة الورشة مستعدة تقترح عليك خيارات أقمشة بديلة وتخفيضات مناسبة باش تبدا مشروعك.'
                          : 'Notre chef d\'atelier peut vous proposer des matières alternatives ou optimiser la série.'}
                      </p>
                      <a
                        href={leadWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? '💬 تفاوض مع المعلم فالواتساب قبل الحذف' : '💬 Négocier sur WhatsApp avant suppression'}</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Optional Custom Note */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {isAr ? 'ملاحظة أو توضيح إضافي (اختياري):' : 'Remarque additionnelle (optionnel) :'}
                  </label>
                  <textarea
                    value={deleteCustomNote}
                    onChange={(e) => setDeleteCustomNote(e.target.value)}
                    placeholder={isAr ? 'كتب لينا أي اقتراح أو سبب باش نحسنو الخدمة...' : 'Écrivez une remarque ou suggestion pour l\'atelier...'}
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 resize-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 md:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setDeleteModalLead(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isAr ? 'التراجع والاحتفاظ بالطلب' : 'Annuler et garder'}
                </button>

                <button
                  type="button"
                  disabled={isDeletingLead}
                  onClick={handleConfirmDeleteWithReason}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingLead ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{isAr ? 'جاري الحذف...' : 'Suppression...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تأكيد حذف الموديل نهائياً' : 'Confirmer la suppression'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
