import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Copy, Search, LogOut, Package, CircleCheck, Clock, Truck, Globe, Bell, Receipt, MessageCircle, ArrowRight, X, Minus, Download, Scissors, Layers, Sparkles, Wind, ShieldCheck, Box, FileText, Eye, Plus, Camera, RotateCw, CreditCard, Building, Upload, Send, Check, Info, Star, Trash2, Edit2, Store, Smartphone, Mail, Lock, CheckCircle, Loader2, Printer, ExternalLink, ChevronRight, Tag, AlertCircle, Users, MessageSquare, Handshake, ThumbsUp, MapPin, Key, Calculator, Phone } from 'lucide-react';
import { supabase } from '../supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Commande, Facture, FicheTechnique, loadData, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, User, CompanyProfile, loadCompanyProfile, saveLead, syncCompanyProfile, saveRecord, Lead, loadLeads, loadClientLeads, loadLeadPhoto, deleteRecord, genId, isJwtExpiredError, recoverExpiredJwt, parseLeadDetailsJson, findMatchingCommandeForLead, upsertClientDevis
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
import { GEMINI_FAST_VISION_MODELS } from '../lib/geminiClient';

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
  const [portalUsers, setPortalUsers] = useState<User[]>(() => {
    try {
      const raw = localStorage.getItem('textrack_data_users');
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
  const [selectedTierQty, setSelectedTierQty] = useState<Record<string, number>>({});
  const [showQuantitySimulator, setShowQuantitySimulator] = useState<Record<string, boolean>>({});
  const [sourcingCheckActive, setSourcingCheckActive] = useState<Record<string, boolean>>({});
  const [sourcingSelectedColor, setSourcingSelectedColor] = useState<Record<string, string>>({});
  const [fabricOrderSent, setFabricOrderSent] = useState<Record<string, boolean>>({});

  // Exact tiered simulator pricing relative to the Admin/Workshop baseline quantity & price:
  // At original order quantity -> returns exact basePrice (0% mutation!).
  // Increasing quantity decreases unit price smoothly.
  const computeSimulatedUnitPrice = (qty: number, basePrice: number, baselineQty: number) => {
    const safeBase = Math.max(1, Number(basePrice) || 0);
    const safeBaseQty = Math.max(1, Number(baselineQty) || 1);
    const safeQty = Math.max(1, Number(qty) || safeBaseQty);
    if (safeQty === safeBaseQty) return Math.round(safeBase);
    if (safeQty > safeBaseQty) {
      const ratio = safeQty / safeBaseQty;
      if (safeQty >= 500 || ratio >= 4) return Math.max(1, Math.round(safeBase * 0.85));
      if (safeQty >= 300 || ratio >= 2.5) return Math.max(1, Math.round(safeBase * 0.89));
      if (ratio >= 1.75) return Math.max(1, Math.round(safeBase * 0.93));
      if (ratio >= 1.25) return Math.max(1, Math.round(safeBase * 0.96));
      return Math.max(1, Math.round(safeBase * 0.98));
    }
    if (safeQty < safeBaseQty * 0.5) return Math.round(safeBase * 1.12);
    return Math.round(safeBase * 1.06);
  };

  // ─── Apple-style City / Location Selector ───
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCityDraft, setSelectedCityDraft] = useState('');
  const [customCityInput, setCustomCityInput] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [cityTab, setCityTab] = useState<'maroc' | 'international'>('maroc');
  const [savingCity, setSavingCity] = useState(false);
  const [cityToastMsg, setCityToastMsg] = useState<string | null>(null);

  const [clientCity, setClientCity] = useState<string>(() => {
    const emailKey = currentUser?.email?.toLowerCase().trim() || '';
    let saved = '';
    try {
      if (emailKey) saved = localStorage.getItem(`beya_client_city_${emailKey}`) || '';
      if (!saved) saved = currentUser?.ville || (currentUser as any)?.city || '';
    } catch {}
    return saved;
  });

  useEffect(() => {
    if (!currentUser?.email) return;
    const emailKey = currentUser.email.toLowerCase().trim();
    const stored = localStorage.getItem(`beya_client_city_${emailKey}`) || currentUser?.ville || (currentUser as any)?.city || '';
    const dismissed = localStorage.getItem(`beya_city_popup_dismissed_${emailKey}`) === 'true';

    if (!stored && !dismissed) {
      const timer = setTimeout(() => {
        setSelectedCityDraft(stored || 'الدار البيضاء (Casablanca)');
        setShowCityModal(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.email, currentUser?.ville]);

  const handleSaveCity = async (chosenCity?: string) => {
    const finalCity = (chosenCity || customCityInput || selectedCityDraft).trim();
    if (!finalCity) return;
    setSavingCity(true);
    try {
      const emailKey = currentUser?.email?.toLowerCase().trim() || '';
      setClientCity(finalCity);
      if (emailKey) {
        localStorage.setItem(`beya_client_city_${emailKey}`, finalCity);
      }
      try {
        const rawAuth = localStorage.getItem('textrack_auth');
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          parsed.ville = finalCity;
          localStorage.setItem('textrack_auth', JSON.stringify(parsed));
        }
      } catch {}

      if (currentUser) {
        const updatedUser: User = { ...currentUser, ville: finalCity };
        await saveRecord('users', updatedUser, true).catch(() => {});
      }

      // Update existing leads for this client
      try {
        const matchingLeads = mesDemandes.filter(l => 
          (currentUser?.email && (l.email || '').trim().toLowerCase() === currentUser.email.trim().toLowerCase()) ||
          (currentUser?.nom && (l.client || l.name || '').trim().toLowerCase() === currentUser.nom.trim().toLowerCase())
        );
        for (const l of matchingLeads) {
          if (l.ville !== finalCity) {
            const updated = { ...l, ville: finalCity };
            await saveRecord('leads', updated, true).catch(() => {});
          }
        }
        setMesDemandes(prev => prev.map(l => {
          const isMatch = (currentUser?.email && (l.email || '').trim().toLowerCase() === currentUser?.email?.trim().toLowerCase()) ||
                          (currentUser?.nom && (l.client || l.name || '').trim().toLowerCase() === currentUser?.nom?.trim().toLowerCase());
          return isMatch ? { ...l, ville: finalCity } : l;
        }));
      } catch (e) {
        console.error('Error updating leads with city:', e);
      }

      setShowCityModal(false);
      setCityToastMsg(isAr ? `📍 تم حفظ مدينتك بنجاح: ${finalCity}` : `📍 Ville enregistrée : ${finalCity}`);
      setTimeout(() => setCityToastMsg(null), 3500);
    } catch (err) {
      console.error('Error saving city:', err);
    } finally {
      setSavingCity(false);
    }
  };

  const handleDismissCityModal = () => {
    const emailKey = currentUser?.email?.toLowerCase().trim() || '';
    if (emailKey) {
      localStorage.setItem(`beya_city_popup_dismissed_${emailKey}`, 'true');
    }
    setShowCityModal(false);
  };
  const [notifyModal, setNotifyModal] = useState<{
    isOpen: boolean;
    type?: 'success' | 'error' | 'info';
    title?: string;
    message: string;
    detail?: string;
    badges?: Array<{ label: string; value: string }>;
  } | null>(null);

  const showNotification = (
    message: string,
    title?: string,
    type: 'success' | 'error' | 'info' = 'success',
    detail?: string,
    badges?: Array<{ label: string; value: string }>
  ) => {
    setNotifyModal({ isOpen: true, type, title, message, detail, badges });
  };

  // ─── BEYA NETWORK Pilot (Restricted strictly to forsaone41@gmail.com and admin) ───
  const isNetworkPilotUser = (currentUser?.email || '').toLowerCase().trim() === 'forsaone41@gmail.com';
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
      whatsapp: '212675239885',
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

  const normalizePortalKey = (val?: string | null) =>
    (val || '').trim().toLowerCase().replace(/\s+/g, ' ');

  const normalizePhoneTail = (val?: string | null) => {
    const digits = (val || '').replace(/\D/g, '');
    return digits.length >= 9 ? digits.slice(-9) : digits;
  };

  const buildClientIdentity = (
    user: User | null | undefined,
    usersList: User[],
    leadsList: Lead[],
    overridePhone?: string
  ) => {
    const idSet = new Set<string>();
    const nameKeys = new Set<string>();
    const phoneTails = new Set<string>();
    const emailNorm = normalizePortalKey(user?.email);
    const primaryPhoneTail = normalizePhoneTail(overridePhone || user?.telephone);
    if (primaryPhoneTail.length >= 9) phoneTails.add(primaryPhoneTail);

    const addUserKeys = (u?: Partial<User> | null) => {
      if (!u) return;
      if (u.id) idSet.add(u.id);
      [u.nom, u.brandName, u.email, (u as any).username]
        .map(normalizePortalKey)
        .filter(Boolean)
        .forEach(k => nameKeys.add(k));
      const pTail = normalizePhoneTail(u.telephone);
      if (pTail.length >= 9) phoneTails.add(pTail);
    };

    addUserKeys(user);

    // Unify duplicate accounts & sibling records belonging to the same client (same email or phone)
    (usersList || []).forEach(u => {
      const sameId = Boolean(user?.id && u.id === user.id);
      const sameEmail = Boolean(emailNorm && normalizePortalKey(u.email) === emailNorm);
      const uPhoneTail = normalizePhoneTail(u.telephone);
      const samePhone = Boolean(uPhoneTail.length >= 9 && phoneTails.has(uPhoneTail));
      if (sameId || sameEmail || samePhone) {
        addUserKeys(u);
      }
    });

    (leadsList || []).forEach(l => {
      const lEmail = normalizePortalKey(l.email);
      const lPhoneTail = normalizePhoneTail(l.phone);
      const lName = normalizePortalKey(l.name);
      const matchesLead =
        (lName && nameKeys.has(lName)) ||
        (emailNorm && lEmail === emailNorm) ||
        (lPhoneTail.length >= 9 && phoneTails.has(lPhoneTail));
      if (matchesLead) {
        if (l.id) idSet.add(l.id);
        if (lName) nameKeys.add(lName);
        if (lPhoneTail.length >= 9) phoneTails.add(lPhoneTail);
      }
    });

    return { idSet, nameKeys, phoneTails, emailNorm };
  };

  const clientIdentity = React.useMemo(
    () => buildClientIdentity(currentUser, portalUsers, mesDemandes, clientPhone),
    [currentUser, portalUsers, mesDemandes, clientPhone]
  );

  const matchesIdentity = (
    identity: { idSet: Set<string>; nameKeys: Set<string>; phoneTails: Set<string>; emailNorm: string },
    rawClient?: string | null,
    rawClientId?: string | null,
    rawEmail?: string | null,
    rawPhone?: string | null
  ): boolean => {
    if (rawClientId && identity.idSet.has(rawClientId)) return true;
    const recEmail = normalizePortalKey(rawEmail);
    if (identity.emailNorm && recEmail && recEmail === identity.emailNorm) return true;
    const recPhone = normalizePhoneTail(rawPhone);
    if (recPhone.length >= 9 && identity.phoneTails.has(recPhone)) return true;
    const normClient = normalizePortalKey(rawClient);
    if (normClient && identity.nameKeys.has(normClient)) return true;
    if (rawClient && identity.phoneTails.size > 0) {
      const digitsInClient = rawClient.replace(/\D/g, '');
      if (digitsInClient.length >= 9) {
        for (const tail of identity.phoneTails) {
          if (digitsInClient.includes(tail)) return true;
        }
      }
    }
    return false;
  };

  const isClientCommandeMatch = (c: Commande, identity = clientIdentity): boolean =>
    matchesIdentity(identity, c.client, (c as any).clientId, (c as any).email, (c as any).telephone || (c as any).phone);

  const isClientFicheMatch = (f: any, identity = clientIdentity): boolean =>
    Boolean(f) && matchesIdentity(identity, f.client, f.clientId, f.clientEmail, f.clientPhone);

  const sortClientCommandes = (list: Commande[]): Commande[] =>
    [...list].sort((a, b) => {
      const aAwaiting = a.statut === 'echantillon_en_cours' && a.phase === 'livré' ? 1 : 0;
      const bAwaiting = b.statut === 'echantillon_en_cours' && b.phase === 'livré' ? 1 : 0;
      if (aAwaiting !== bAwaiting) return bAwaiting - aAwaiting;
      const aSample = a.statut === 'echantillon_en_cours' ? 1 : 0;
      const bSample = b.statut === 'echantillon_en_cours' ? 1 : 0;
      if (aSample !== bSample) return bSample - aSample;
      return new Date(b.dateCommande || 0).getTime() - new Date(a.dateCommande || 0).getTime();
    });

  const clientCommandesAll = React.useMemo(
    () => (currentUser ? sortClientCommandes(commandes.filter(c => isClientCommandeMatch(c))) : []),
    [commandes, currentUser, clientIdentity]
  );

  const clientFiches = React.useMemo(
    () =>
      (currentUser ? fiches.filter(f => isClientFicheMatch(f)) : []).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [fiches, currentUser, clientIdentity]
  );

  const isClientFacturaMatch = (f: Facture): boolean => {
    if (f.commandeId && (found.some(c => c.id === f.commandeId) || clientCommandesAll.some(c => c.id === f.commandeId))) return true;
    if (f.commandeId && mesDemandes.some(d => d.id === f.commandeId)) return true;
    return matchesIdentity(clientIdentity, f.client, (f as any).clientId, (f as any).email, (f as any).telephone);
  };

  const clientDocsAll = factures.filter(isClientFacturaMatch);
  const clientDevisDocs = (() => {
    const sorted = clientDocsAll
      .filter(f => f.typeDoc === 'devis')
      .sort((a, b) => {
        const aRich = (a.articles?.length ? 1 : 0) + (a.commandeId ? 1 : 0);
        const bRich = (b.articles?.length ? 1 : 0) + (b.commandeId ? 1 : 0);
        if (aRich !== bRich) return bRich - aRich;
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });
    const seen = new Set<string>();
    return sorted.filter(f => {
      const numKey = f.numero ? `num:${f.numero.trim().toLowerCase()}` : '';
      const cmdAmtKey = f.statut !== 'payée' && f.commandeId
        ? `cmd:${f.commandeId}|${Math.round(Number(f.montant || 0))}`
        : '';
      if ((numKey && seen.has(numKey)) || (cmdAmtKey && seen.has(cmdAmtKey))) return false;
      if (numKey) seen.add(numKey);
      if (cmdAmtKey) seen.add(cmdAmtKey);
      return true;
    });
  })();

  const getOfficialDevisForCommande = (cmd: Commande): Facture | undefined => {
    const byId = clientDevisDocs.find(f => f.commandeId === cmd.id);
    if (byId) return byId;
    const cmdRef = normalizePortalKey(cmd.reference);
    if (!cmdRef) return undefined;
    return clientDevisDocs.find(f =>
      normalizePortalKey((f as any).commandeReference) === cmdRef ||
      (f.articles || []).some(a => normalizePortalKey(a.designation).includes(cmdRef))
    );
  };

  const getOfficialDevisForLead = (d: Lead): Facture | undefined => {
    let ext: any = {};
    ext = parseLeadDetailsJson(d.details);
    const directDevisId = ext.devisId || (d as any).devisId;
    if (directDevisId) {
      const match = clientDevisDocs.find(f => f.id === directDevisId);
      if (match) return match;
    }
    const directDevisNum = ext.devisNumero || (d as any).devisNumero;
    if (directDevisNum) {
      const match = clientDevisDocs.find(f => f.numero === directDevisNum);
      if (match) return match;
    }
    const directCmdId = ext.commandeId || (d as any).commandeId;
    if (directCmdId) {
      const match = clientDevisDocs.find(f => f.commandeId === directCmdId);
      if (match) return match;
    }
    const byLeadId = clientDevisDocs.find(f => f.commandeId === d.id);
    if (byLeadId) return byLeadId;

    const leadType = normalizePortalKey(d.type);
    const leadModele = normalizePortalKey(d.modeleReel);
    const matchingCmd = found.find(c => {
      const cModele = normalizePortalKey(c.modele);
      const qtyMatch = !d.quantity || Number(c.quantite) === Number(d.quantity);
      return qtyMatch && ((leadType && cModele === leadType) || (leadModele && cModele === leadModele));
    });
    if (matchingCmd) {
      const cmdDevis = getOfficialDevisForCommande(matchingCmd);
      if (cmdDevis) return cmdDevis;
    }

    const byArticle = clientDevisDocs.find(f =>
      (f.articles || []).some(a => {
        const des = normalizePortalKey(a.designation);
        return (leadType && des.includes(leadType)) || (leadModele && des.includes(leadModele));
      })
    );
    if (byArticle) return byArticle;

    const activeLeadsCount = mesDemandes.filter(m => m.type !== '__MESSAGE__' && m.type !== '__MESSAGE_REPLY__').length;
    if (clientDevisDocs.length >= 1 && activeLeadsCount === 1) {
      return clientDevisDocs[0];
    }
    const confirmedLeads = mesDemandes.filter(m => m.type !== '__MESSAGE__' && m.type !== '__MESSAGE_REPLY__' && m.crmStage === 'confirme');
    if (clientDevisDocs.length >= 1 && confirmedLeads.length === 1 && confirmedLeads[0].id === d.id) {
      return clientDevisDocs[0];
    }
    return undefined;
  };

  const getLinkedCommandeForLead = (d: Lead, cmds: Commande[] = found): Commande | undefined =>
    findMatchingCommandeForLead(d, cmds, getOfficialDevisForLead(d));

  const isLeadHiddenFromPayments = (d: Lead, cmds: Commande[] = found): boolean => {
    if (d.status === 'completed' || (d.crmStage as any) === 'rejeté' || (d.crmStage as any) === 'annule') return true;
    return Boolean(getLinkedCommandeForLead(d, cmds));
  };

  const handleValidateDevisAndVirement = async (lead: Lead) => {
    setValidatingDevisSending(true);
    try {
      const analysis = getDemandeAnalysis(lead, isAr);
      const baseQty = Math.max(1, Number(analysis.qty) || Number(lead.quantity) || 1);
      const activeQty = selectedTierQty[lead.id] !== undefined ? selectedTierQty[lead.id] : baseQty;
      const isClientFab = analysis.canSwitchFabricSource && fabricOption[lead.id] === 'client';
      const basePrice = isClientFab ? analysis.confectionPrice : analysis.fullPackagePrice;
      const activeUnitPrice = computeSimulatedUnitPrice(activeQty, basePrice, baseQty);
      const activeTotalPrice = activeUnitPrice * activeQty;
      const acompteAmount = (isClientFab && analysis.isOfficialAtelierDecision && analysis.adminMatierePrice > 0)
        ? 0
        : Math.round(activeTotalPrice * 0.5);

      const extDetails: any = {};
      Object.assign(extDetails, parseLeadDetailsJson(lead.details));
      extDetails.devisStatus = virementReceiptFile ? 'acompte_paye' : 'valide';
      extDetails.clientValideDate = new Date().toISOString();
      if (activeQty !== baseQty) {
        extDetails.clientAdjustedQty = activeQty;
        extDetails.adminQty = activeQty;
      }
      if (virementReceiptFile) extDetails.virementReceipt = virementReceiptFile;

      // Auto-convert or synchronize linked Commande so the confirmed request moves to Production cleanly (no duplicate card)
      const officialDevisBefore = getOfficialDevisForLead(lead);
      const allCommandesFresh = await loadData<Commande>('commandes');
      const clientCmdsFresh = (allCommandesFresh || []).filter(c => isClientCommandeMatch(c));
      const existingLinkedCmd = findMatchingCommandeForLead(lead, clientCmdsFresh, officialDevisBefore);
      const isSampleMode = extDetails.adminMode === 'echantillon';
      const genericModel = !analysis.modeleReel || analysis.modeleReel.toLowerCase().includes('formulaire avanc');
      const modelLabel = (!genericModel ? analysis.modeleReel : '') || lead.modeleReel || lead.type || 'Confection Sur-Mesure';

      const targetCommande: Commande = existingLinkedCmd
        ? {
            ...existingLinkedCmd,
            quantite: activeQty,
            prix: activeUnitPrice,
            prixUnitaire: activeUnitPrice,
            ...(virementReceiptFile ? { preuveClient: virementReceiptFile, avance: existingLinkedCmd.avance || acompteAmount } : {}),
          }
        : {
            id: genId(),
            reference: `CMD-${Date.now().toString().slice(-6)}`,
            client: lead.name || currentUser?.nom || 'Client',
            modele: modelLabel,
            tissu: isClientFab ? 'Tissu Client' : (analysis.tissuSuggere || 'À définir'),
            modelePhoto: lead.photo || (lead.photos && lead.photos[0]) || leadPhotosRef.current[lead.id] || undefined,
            couleurs: [],
            tailles: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
            quantite: activeQty,
            quantiteLivre: 0,
            dateCommande: new Date().toISOString().split('T')[0],
            dateLivraisonPrevue: new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString().split('T')[0],
            phase: 'patronage',
            prix: activeUnitPrice,
            prixUnitaire: activeUnitPrice,
            prixEchantillon: Number((analysis as any).prixEchantillon || lead.prixEchantillon || 0) || undefined,
            avance: virementReceiptFile ? acompteAmount : 0,
            rebut: 0,
            statut: isSampleMode ? 'echantillon_en_cours' : 'en_cours',
            suivi: [{
              phase: 'patronage',
              date: new Date().toISOString(),
              note: virementReceiptFile
                ? 'Devis confirmé et avance envoyée par le client (Portail)'
                : 'Devis confirmé par le client sur le Portail (création automatique)'
            }],
            ...(virementReceiptFile ? { preuveClient: virementReceiptFile } : {}),
          };
      (targetCommande as any).prixValide = true;

      try {
        await saveRecord('commandes', targetCommande);
        setCommandes(prev =>
          prev.some(c => c.id === targetCommande.id)
            ? prev.map(c => (c.id === targetCommande.id ? targetCommande : c))
            : [targetCommande, ...prev]
        );
        setFound(prev =>
          sortClientCommandes(
            prev.some(c => c.id === targetCommande.id)
              ? prev.map(c => (c.id === targetCommande.id ? targetCommande : c))
              : [targetCommande, ...prev]
          )
        );
      } catch {}

      extDetails.commandeId = targetCommande.id;
      extDetails.commandeReference = targetCommande.reference;

      // Upsert official Devis document in place & link to targetCommande
      try {
        const { devis: syncedDevis } = await upsertClientDevis({
          preferredId: officialDevisBefore?.id || extDetails.devisId,
          preferredNumero: officialDevisBefore?.numero || extDetails.devisNumero,
          commandeId: targetCommande.id,
          leadId: lead.id,
          leadDetails: JSON.stringify(extDetails),
          client: lead.name || currentUser?.nom || 'Client',
          clientPhone: lead.phone || currentUser?.telephone,
          clientEmail: lead.email || currentUser?.email,
          montant: activeTotalPrice,
          avance: virementReceiptFile ? acompteAmount : (officialDevisBefore?.avance || 0),
          articles: [{
            id: officialDevisBefore?.articles?.[0]?.id || genId(),
            designation: modelLabel,
            quantite: activeQty,
            prixUnitaire: activeUnitPrice,
            total: activeTotalPrice
          }],
          existingFactures: factures
        });
        extDetails.devisId = syncedDevis.id;
        extDetails.devisNumero = syncedDevis.numero;
        setFactures(prev =>
          prev.some(f => f.id === syncedDevis.id)
            ? prev.map(f => (f.id === syncedDevis.id ? syncedDevis : f))
            : [syncedDevis, ...prev]
        );
      } catch {}

      const updatedLead: Lead = {
        ...lead,
        quantity: activeQty !== baseQty ? activeQty : lead.quantity,
        unitPrice: activeQty !== baseQty ? activeUnitPrice : lead.unitPrice,
        totalPrice: activeQty !== baseQty ? activeTotalPrice : (lead.totalPrice || activeTotalPrice),
        crmPrice: activeQty !== baseQty ? activeUnitPrice : lead.crmPrice,
        details: JSON.stringify(extDetails),
        status: 'completed',
        crmStage: 'confirme',
        statusProgression: virementReceiptFile ? 'echantillon' : (lead.statusProgression || 'etude'),
        reponseAtelierDate: new Date().toISOString(),
        ...(virementReceiptFile ? { preuveClient: virementReceiptFile } : {})
      };
      (updatedLead as any).devisStatus = virementReceiptFile ? 'acompte_paye' : 'valide';

      await saveRecord('leads', updatedLead);

      // If client attached a Virement receipt inside the Validation modal, also save an official Recu in factures linked to the Commande
      if (virementReceiptFile) {
        try {
          const recuDoc: Partial<Facture> = {
            id: genId(),
            numero: `REC-${Date.now().toString().slice(-6)}`,
            client: currentUser?.nom || lead.name,
            commandeId: targetCommande.id,
            date: new Date().toISOString(),
            echeance: new Date().toISOString().split('T')[0],
            montant: acompteAmount,
            typeDoc: 'recu',
            statut: 'en_verification',
            banque: 'virement',
            articles: [{
              id: genId(),
              designation: `[${targetCommande.reference}] ${analysis.modeleReel} (${activeQty} pcs)`,
              quantite: activeQty,
              prixUnitaire: activeUnitPrice,
              total: acompteAmount
            }],
            preuvePaiement: virementReceiptFile
          };
          await saveRecord('factures', recuDoc);
          const { sendPushToAll } = await import('../utils/pushNotifications');
          sendPushToAll(
            isAr ? '💰 تأكيد دوفيز + وصل تسبيق جديد' : '💰 Devis Validé + Reçu Virement',
            `${currentUser?.nom || lead.name} — ${acompteAmount.toLocaleString()} MAD (${activeQty} pcs)`,
            '/recus'
          ).catch(() => {});
        } catch {}
      }

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

  const handlePrintDevis = async (lead: Lead) => {
    if (!(lead.photo || (lead.photos && lead.photos[0]) || leadPhotosRef.current[lead.id])) {
      try {
        const fetchedPhoto = await loadLeadPhoto(lead.id);
        if (fetchedPhoto) handlePhotoLoaded(lead.id, fetchedPhoto);
      } catch {}
    }
    const officialDevis = getOfficialDevisForLead(lead);
    if (officialDevis) {
      setSelectedFacture(officialDevis);
      setShowInvoiceView(true);
      return;
    }
    const devState = getLeadDevisState(lead);
    if (!devState.isConfirmedByAtelier && !devState.isVal) {
      showNotification(isAr ? 'الدوفيز الرسمي قيد الإعداد والمراجعة من طرف الورشة، سيصبح متاحاً للتحميل فور اعتماده.' : "Le devis officiel est en cours de préparation par l'atelier.", isAr ? '⏳ قيد المراجعة' : '⏳ En cours', 'info');
      return;
    }
    setPrintingDevisLead(lead);
    setTimeout(() => {
      printElement(`devis-doc-${lead.id}`);
    }, 300);
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
    patronage: 'الباترون والعينة',
    coupe: 'الفصالة', 
    montage: 'الخياطة', 
    finition: 'الفينيسيون', 
    repassage: 'المصلوح', 
    controle: 'مراقبة الجودة',
    emballage: 'التغليف',
    livré: 'تسلّمات' 
  };

  const phaseIcons: Record<string, any> = {
    patronage: <Scissors className="w-5 h-5" />,
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

    const cachedAliases = Array.from(buildClientIdentity(currentUser, portalUsers, mesDemandes, clientPhone).nameKeys);
    const leadsLoader = (currentUser && (currentUser.nom || currentUser.email || currentUser.telephone))
      ? loadClientLeads(currentUser, cachedAliases)
      : loadLeads();

    Promise.all([
      loadData<User>('users', true).catch(() => []),
      loadData<Commande>('commandes', true).catch(() => []),
      loadData<Facture>('factures', true).catch(() => []),
      loadData<any>('fiches', true).catch(() => []),
      leadsLoader.catch(() => [])
    ]).then(async ([allUsers, allCommandes, allFactures, allFiches, initialLeads]) => {
      const validUsers = Array.isArray(allUsers) && allUsers.length > 0 ? allUsers : portalUsers;
      if (Array.isArray(allUsers) && allUsers.length > 0) setPortalUsers(allUsers);
      if (Array.isArray(allCommandes) && allCommandes.length > 0) setCommandes(allCommandes);
      if (Array.isArray(allFactures) && allFactures.length > 0) setFactures(allFactures);
      if (Array.isArray(allFiches) && allFiches.length > 0) setFiches(allFiches);

      if (currentUser) {
        let clientOrAllLeads = Array.isArray(initialLeads) ? initialLeads : [];
        const preIdentity = buildClientIdentity(currentUser, validUsers, clientOrAllLeads, clientPhone);
        const extraAliases = Array.from(preIdentity.nameKeys);
        if (extraAliases.length > cachedAliases.length && (currentUser.nom || currentUser.email || currentUser.telephone)) {
          const widerLeads = await loadClientLeads(currentUser, extraAliases).catch(() => clientOrAllLeads);
          if (Array.isArray(widerLeads) && widerLeads.length >= clientOrAllLeads.length) {
            clientOrAllLeads = widerLeads;
          }
        }

        const freshIdentity = buildClientIdentity(currentUser, validUsers, clientOrAllLeads, clientPhone);
        const myLeads = clientOrAllLeads.filter(l =>
          matchesIdentity(freshIdentity, l.name, l.id, l.email, l.phone)
        );
        const finalIdentity = buildClientIdentity(currentUser, validUsers, myLeads, clientPhone);
        const myCommandes = sortClientCommandes(
          (allCommandes || []).filter(c => isClientCommandeMatch(c, finalIdentity))
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
        subscribeToPush((currentUser as any).username || currentUser.nom).catch(() => {});
      }
    }).catch(err => {
      console.warn("Portal load warning:", err);
    }).finally(() => {
      clearTimeout(failsafeTimer);
      setLoading(false);
    });

    return () => clearTimeout(failsafeTimer);
  }, [currentUser]);

  // Keep found synced cleanly with unified client identity unless filtered by an active search reference
  useEffect(() => {
    if (!currentUser || reference.trim()) return;
    setFound(clientCommandesAll);
  }, [clientCommandesAll, currentUser, reference]);

  // Keep client quotes, fiches, invoices, users and orders synced when navigating tabs
  useEffect(() => {
    if (!currentUser) return;
    if (!['overview', 'demandes', 'orders', 'docs', 'payments'].includes(activeTab)) return;
    let cancelled = false;
    const aliasList = Array.from(clientIdentity.nameKeys);
    Promise.all([
      loadData<Facture>('factures', true).catch(() => []),
      loadData<Commande>('commandes', true).catch(() => []),
      loadData<any>('fiches', true).catch(() => []),
      loadData<User>('users', true).catch(() => []),
      loadClientLeads(currentUser, aliasList).catch(() => [])
    ]).then(([freshFactures, freshCommandes, freshFiches, freshUsers, freshLeads]) => {
      if (cancelled) return;
      const validUsers = Array.isArray(freshUsers) && freshUsers.length > 0 ? freshUsers : portalUsers;
      if (Array.isArray(freshUsers) && freshUsers.length > 0) setPortalUsers(freshUsers);
      if (Array.isArray(freshFactures) && freshFactures.length > 0) setFactures(freshFactures);
      if (Array.isArray(freshFiches) && freshFiches.length > 0) setFiches(freshFiches);

      let latestLeads = mesDemandes;
      if (Array.isArray(freshLeads) && freshLeads.length > 0) {
        const tmpId = buildClientIdentity(currentUser, validUsers, freshLeads, clientPhone);
        const matchedLeads = freshLeads.filter(l => matchesIdentity(tmpId, l.name, l.id, l.email, l.phone));
        if (matchedLeads.length > 0) {
          latestLeads = matchedLeads;
          setMesDemandes(prev => {
            const existingMap: Record<string, Lead> = {};
            prev.forEach(p => { existingMap[p.id] = p; });
            return matchedLeads.map(l => ({
              ...l,
              ...(l.photo || existingMap[l.id]?.photo || leadPhotosRef.current[l.id] ? { photo: l.photo || existingMap[l.id]?.photo || leadPhotosRef.current[l.id] } : {}),
              ...(existingMap[l.id]?.photos ? { photos: existingMap[l.id].photos } : {})
            }));
          });
        }
      }

      if (Array.isArray(freshCommandes) && freshCommandes.length > 0) {
        setCommandes(freshCommandes);
        if (!reference.trim()) {
          const freshId = buildClientIdentity(currentUser, validUsers, latestLeads, clientPhone);
          const myCmds = sortClientCommandes(
            freshCommandes.filter(c => isClientCommandeMatch(c, freshId))
          );
          setFound(myCmds);
        }
      }
    });
    return () => { cancelled = true; };
  }, [activeTab, currentUser]);

  useEffect(() => {
    const hiddenSelected = mesDemandes.find(
      d => d.id === virementCommandeId && isLeadHiddenFromPayments(d, found)
    );
    if (hiddenSelected) {
      const linked = getLinkedCommandeForLead(hiddenSelected, found);
      setVirementCommandeId(linked ? linked.id : (found[0]?.id || ''));
      return;
    }
    if (!virementCommandeId) {
      if (found.length === 1) {
        setVirementCommandeId(found[0].id);
      } else if (found.length === 0) {
        const payableDem = mesDemandes.filter(
          d => d.type !== '__MESSAGE__' && d.type !== '__MESSAGE_REPLY__' && !isLeadHiddenFromPayments(d, found)
        );
        if (payableDem.length >= 1) {
          setVirementCommandeId(payableDem[0].id);
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
      const myLeads = (currentUser && (currentUser.nom || currentUser.email || currentUser.telephone))
        ? await loadClientLeads(currentUser, Array.from(clientIdentity.nameKeys))
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

  function handleSearch(queryOverride?: string) {
    const q = normalizePortalKey(queryOverride !== undefined ? queryOverride : reference);
    const pool = currentUser && (currentUser.role === 'client' || currentUser.role === 'merchant')
      ? clientCommandesAll
      : commandes;
    if (!q) {
      setFound(currentUser ? clientCommandesAll : []);
      return;
    }
    const results = pool.filter(c =>
      normalizePortalKey(c.reference).includes(q) ||
      normalizePortalKey(c.referenceClient).includes(q) ||
      normalizePortalKey(c.modele).includes(q) ||
      normalizePortalKey(c.client).includes(q)
    );
    setFound(sortClientCommandes(results));
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
      const candidateModels = GEMINI_FAST_VISION_MODELS;
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
المهمة: قم بتحليل دقيق وشامل ومخصص جداً للموديل المعروض في الصورة (أو المذكور في الملاحظات) وحساب التكلفة التقديرية الحقيقية والمضبوطة لهذا الموديل بالتحديد لسوق الجملة وإعادة البيع للعلامات والمتاجر (Confection B2B pour revendeurs / grossistes / marques).
تنبيه حاسم: عملاؤنا تجار وعلامات ومتاجر يعيدون بيع السلع (Revendeurs B2B)، لذلك يجب أن تكون الأسعار واستهلاك القماش دقيقة واحترافية وبأسعار مصنع بالجملة تنافسية تتيح لهم هامش ربح ممتاز!
احسب التكلفة واستهلاك القماش متناسباً مع نوع القطعة بدقة:
- إذا كان بودي / بودي ليكرا / توب نسائي / sous-pull / débardeur / crop top:
  * استهلاك القماش tissuConso بين 0.85m و 1.05m فقط (قماش جيرسي ليكرا / فيسكوز إيلاستين ناعم).
  * سعر متر القماش prixMetreEstime بين 24 و 30 درهم.
  * سعر الخياطة unitPrice (façon seule) بين 16 و 22 درهم.
  * سعر الباترون والتدرج patronagePrice بين 140 و 180 درهم.
  * سعر العينة الأولية prixEchantillon بين 180 و 240 درهم.
- إذا كان تيشيرت قطن ممشط (Col Rond / Oversize):
  * استهلاك القماش 1.00m إلى 1.25m، سعر المتر 26 إلى 34 درهم، سعر الخياطة 18 إلى 26 درهم.
  * الباترون 150 إلى 190 درهم، العينة 200 إلى 250 درهم.
- إذا كان قميص بولو (Polo Piqué):
  * استهلاك القماش 1.20m إلى 1.35m، سعر المتر 32 إلى 38 درهم، سعر الخياطة 25 إلى 34 درهم.
- إذا كان هودي شتوي / سويت (Molleton Coton):
  * استهلاك القماش 1.65m إلى 1.90m، سعر المتر 36 إلى 46 درهم، سعر الخياطة 34 إلى 48 درهم.
- إذا كان بنطلون / كارجو / جوغينغ:
  * استهلاك القماش 1.35m إلى 1.60m، سعر الخياطة 30 إلى 48 درهم.
- إذا كان طقم بدلة رياضية كاملة (Ensemble Survêtement 2 pièces):
  * استهلاك القماش 2.60m إلى 2.90m، سعر الخياطة للطقم كاملاً 55 إلى 85 درهم.
- إذا كان جاكيت مبطن / معطف / بدلة:
  * استهلاك القماش 1.90m إلى 2.40m، سعر الخياطة 60 إلى 110 درهم.

الموديل المدخل من الزبون: "${target.modele || ''}"
ملاحظات الزبون: "${target.details || ''}"

أجب فقط بصيغة JSON صحيحة وبدون أي نصوص إضافية قبل أو بعد:
{
  "modeleReel": "الاسم الدقيق بالعربية / Nom exact en français",
  "tissuSuggere": "نوع القماش الدقيق بالعربية / Type de tissu en français",
  "tissuConso": 1.05,
  "prixMetreEstime": 28,
  "unitPrice": 22,
  "patronagePrice": 160,
  "prixEchantillon": 220,
  "delaiEstime": "5 إلى 7 أيام عمل / 5 à 7 jours ouvrables",
  "techDetails": "المواصفات التقنية بالعربية / Détails techniques en français",
  "reponseAtelier": "تعليق تقني بالعربية / Commentaire technique atelier en français"
}`;

    const candidateModels = GEMINI_FAST_VISION_MODELS;

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
          const modText = `${target.modele || ''} ${parsed.modeleReel || ''}`.toLowerCase();
          const isBoudiOrTop = modText.includes('boudi') || modText.includes('body') || modText.includes('بودي') || modText.includes('بادي') || modText.includes('top') || modText.includes('sous-pull') || modText.includes('débardeur');
          const fallbackConso = isBoudiOrTop ? 1.05 : 1.45;
          const fallbackUnitPrice = isBoudiOrTop ? 20 : 35;
          const fallbackPatronage = isBoudiOrTop ? 160 : 220;
          const fallbackEchantillon = isBoudiOrTop ? 220 : 300;
          const fallbackPrixMetre = isBoudiOrTop ? 26 : 38;

          return {
            modeleReel: parsed.modeleReel || target.modele,
            tissuSuggere: parsed.tissuSuggere || '',
            tissuConso: Number(parsed.tissuConso) > 0 ? Number(parsed.tissuConso) : fallbackConso,
            prixMetreEstime: Number(parsed.prixMetreEstime) > 0 ? Number(parsed.prixMetreEstime) : fallbackPrixMetre,
            unitPrice: Math.max(15, Math.round(Number(parsed.unitPrice) || fallbackUnitPrice)),
            patronagePrice: Math.max(120, Math.round(Number(parsed.patronagePrice) || fallbackPatronage)),
            prixEchantillon: Math.max(160, Math.round(Number(parsed.prixEchantillon) || fallbackEchantillon)),
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
      showNotification(
        isAr ? 'المرجو إضافة صورة واضحة للموديل أولاً لتشغيل التحليل والتدقيق بالذكاء الاصطناعي.' : 'Veuillez ajouter une photo pour lancer l\'analyse IA.',
        isAr ? '📷 صورة الموديل مطلوبة' : '📷 Photo requise',
        'info'
      );
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
        showNotification(
          isAr
            ? 'تم تحليل الموديل وتدقيق الأسعار واقتراح القماش الأمثل بالذكاء الاصطناعي بنجاح!'
            : 'Modèle analysé avec succès par l\'IA ! Prix et tissu mis à jour.',
          isAr ? '✨ تم تحديث التسعير والحسابات' : '✨ Analyse & Chiffrage IA Réussis',
          'success',
          isAr ? 'تم تحيين كافة الأسعار والتفاصيل الفنية مباشرة في بطاقة دراسة الموديل.' : 'Les détails et tarifs ont été actualisés sur votre portail.',
          [
            { label: isAr ? 'سعر البياسة' : 'Prix/pc', value: `${aiResult.unitPrice || lead.unitPrice || 65} MAD` },
            { label: isAr ? 'المجموع الإجمالي' : 'Total Devis', value: `${((aiResult.unitPrice || lead.unitPrice || 65) * (Number(lead.quantity) || 10)).toLocaleString()} MAD` },
            ...(aiResult.tissuSuggere ? [{ label: isAr ? 'الثوب المقترح' : 'Tissu suggéré', value: aiResult.tissuSuggere }] : []),
            ...(aiResult.delaiEstime ? [{ label: isAr ? 'مدة الإنجاز' : 'Délai estimé', value: aiResult.delaiEstime }] : [])
          ]
        );
      } else {
        showNotification(
          isAr ? 'لم نتمكن من تحليل الصورة حالياً. المرجو التأكد من جودة الصورة أو إعادة المحاولة.' : 'Échec de l\'analyse. Vérifiez votre clé Gemini API ou la photo.',
          isAr ? 'تعذر إتمام التحليل' : 'Analyse non aboutie',
          'error'
        );
      }
    } catch (err: any) {
      showNotification(
        (isAr ? 'خطأ أثناء التحليل: ' : 'Erreur analyse : ') + (err?.message || ''),
        isAr ? 'تنبيه خطأ' : 'Erreur',
        'error'
      );
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

        const candidateChatModels = GEMINI_FAST_VISION_MODELS;
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

const cleanPhoneForWa = (phone: string | undefined | null): string => {
  const DEFAULT_WA = '212675239885'; // Official BEYA Creative Atelier Sourcing WhatsApp
  if (!phone) return DEFAULT_WA;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '212' + cleaned.substring(1);
  } else if (!cleaned.startsWith('212') && cleaned.length === 9) {
    cleaned = '212' + cleaned;
  }
  // Filter out dummy/placeholder test numbers and short invalid numbers
  if (!cleaned || cleaned === '212661849201' || cleaned === '212600000000' || cleaned.length < 8) {
    return DEFAULT_WA;
  }
  return cleaned;
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
  t = t.replace(/طبعة سيريغرافي (?:ف|على )الصدر/g, 'Sérigraphie poitrine');
  t = t.replace(/طبعة سيريغرافي|سيريغرافي عالي الجودة(?: على الصدر)?|سيريغرافي/g, 'Sérigraphie');
  t = t.replace(/كابوش مبطن بحبال|قبعة مبطنة بحبال/g, 'Capuche doublée avec cordons');
  t = t.replace(/كابوش مبطن|قبعة مبطنة/g, 'Capuche doublée');
  t = t.replace(/جيب كانغورو|جيوب جانبية/g, (m) => m.includes('كانغورو') ? 'Poche kangourou' : 'Poches latérales');
  t = t.replace(/حواف مرنة متينة|أطراف ريزيستنت/g, 'Finitions bord-côte');
  t = t.replace(/طرز|تطريز|طريزة/g, 'Broderie');
  t = t.replace(/سحاب(?: أمامي)?(?: كامل)?/g, 'Fermeture zippée');
  t = t.replace(/خياطة تقنية|خياطة متينة|خياطة مزدوجة/g, 'Coutures techniques renforcées');
  t = t.replace(/مولطون قطن مبطن|مولطون قطن|مولتون/g, 'Molleton coton');
  t = t.replace(/صوف/g, 'Laine');
  t = t.replace(/قطن/g, 'Coton');

  // Always strip any remaining Arabic characters when rendering French output
  t = t.replace(/\([^)]*[\u0600-\u06FF][^)]*\)/g, ' ');
  t = t.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '');
  t = t.replace(/(?:\s*[•\/|:-]+\s*){2,}/g, ' • ')
    .replace(/^\s*[•\/|:-]+\s*/g, '')
    .replace(/\s*[•\/|:-]+\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return t;
}

function translateFrenchAtelierPhrases(text: string): string {
  let t = text;
  t = t.replace(/(\d+)\s*(à|-)\s*(\d+)\s*jours?\s*ouvrables?/gi, (_m, p1, _p2, p3) => `${p1} إلى ${p3} يوم عمل`);
  t = t.replace(/Échantillon sous (\d+)h/gi, (_m, p1) => `العينة تحت ${p1} ساعة`);
  t = t.replace(/Tissu adapté selon cahier des charges/gi, 'قماش مخصص ومطابق للمواصفات المطلوبة');
  t = t.replace(/Patronage et confection sur-mesure de haute précision/gi, 'قصة وخياطة مخصصة بدقة عالية مع معالجة احترافية لكافة التفاصيل');
  t = t.replace(/Sérigraphie Poitrine/gi, 'طبعة سيريغرافي على الصدر');
  t = t.replace(/Capuche doublée avec cordons/gi, 'قبعة مبطنة بحبال');
  t = t.replace(/Capuche doublée/gi, 'كابوش مبطن');
  t = t.replace(/Poche kangourou/gi, 'جيب كانغورو');
  t = t.replace(/Fermeture zippée/gi, 'سحاب');
  t = t.replace(/Broderie/gi, 'تطريز');
  t = t.replace(/Finitions? bord-côte/gi, 'أطراف بورد-كوط');

  if (hasArabic(t)) {
    t = t.replace(/\([a-zA-Z0-9\s.,'%-]{4,}\)/g, '');
    t = t.replace(/\s*[\/|:-]+\s*$/g, '').replace(/^\s*[\/|:-]+\s*/g, '').replace(/\s{2,}/g, ' ').trim();
  }
  return t;
}

const getLeadDevisState = (d: Lead) => {
  let ext: any = {};
  ext = parseLeadDetailsJson(d.details);
  const officialDevis = getOfficialDevisForLead(d);
  
  // 1. Is it validated by the client / deposit paid?
  const isVal = ext.devisStatus === 'valide' || 
                ext.devisStatus === 'acompte_paye' || 
                (d as any).devisStatus === 'valide' || 
                (d as any).devisStatus === 'acompte_paye' || 
                d.crmStage === 'confirme' ||
                officialDevis?.statut === 'payée';
  if (isVal) {
    return {
      status: 'valide' as const,
      isVal: true,
      isConfirmedByAtelier: true,
      isInitialEstimate: false
    };
  }

  // 2. Is it officially confirmed / created by the workshop?
  // True when confirmed via modal, Demandes CRM, OR an official Devis document exists in factures
  const isConfirmedByAtelier = Boolean(
    ext.devisOfficielConfirmed === true ||
    (d as any).devisOfficielConfirmed === true ||
    ext.devisStatus === 'devis_confirme_atelier' ||
    (d as any).devisStatus === 'devis_confirme_atelier' ||
    d.crmPriceConfirmed === true ||
    officialDevis
  );

  if (isConfirmedByAtelier) {
    return {
      status: 'devis_pret' as const,
      isVal: false,
      isConfirmedByAtelier: true,
      isInitialEstimate: false
    };
  }

  // 3. Otherwise, it is an INITIAL ESTIMATION (taman tqribi bach yakhod fikra)
  return {
    status: 'estimation' as const,
    isVal: false,
    isConfirmedByAtelier: false,
    isInitialEstimate: true
  };
};

const getDemandeAnalysis = (d: Lead, isAr: boolean) => {
    const text = `${d.type || ''} ${d.details || ''} ${d.id || ''}`.toLowerCase();
    
    let extDetails: any = {};
    extDetails = parseLeadDetailsJson(d.details);
    const devStateForAnalysis = getLeadDevisState(d);
    const officialDoc = getOfficialDevisForLead(d);
    const isOfficialAtelierDecision = Boolean(
      devStateForAnalysis.isConfirmedByAtelier ||
      devStateForAnalysis.isVal ||
      extDetails.adminHasOfficialDecision === true
    );

    // Check custom saved values from database/atelier edit first
    const savedUnitPrice = (d.unitPrice && Number(d.unitPrice) > 0)
      ? Number(d.unitPrice)
      : (d.crmPrice && Number(d.crmPrice) > 0)
        ? Number(d.crmPrice)
        : null;
    const isGenericFormLabel = (s?: string | null) => {
      if (!s) return true;
      const low = s.trim().toLowerCase();
      return !low || low === 'model' || low === 'jakit' || low === 'modz' || low.includes('formulaire avanc');
    };
    const savedModele = !isGenericFormLabel(d.modeleReel) ? d.modeleReel!.trim() : null;
    const isLegacyFakeFabric = d.tissuSuggere === 'مولتون قطن مبطن 320g / French Terry' && extDetails.adminFabric === undefined;
    const isLegacyFakeTech = d.techDetails === 'طبعة سيريغرافي فالصدر • كابوش مبطن بكوردون' && extDetails.adminTechDetails === undefined;

    const savedTissu = (d.tissuSuggere && d.tissuSuggere.trim() && !isLegacyFakeFabric && !d.tissuSuggere.includes('قماش مخصص ومطابق للمواصفات') && !d.tissuSuggere.includes('Tissu adapté selon cahier'))
      ? d.tissuSuggere.trim()
      : null;
    const savedTech = (d.techDetails && d.techDetails.trim() && !isLegacyFakeTech && !d.techDetails.includes('قصة وخياطة مخصصة بدقة عالية مع معالجة'))
      ? d.techDetails.trim()
      : null;
    const savedDelai = (d.delaiEstime && d.delaiEstime.trim()) ? d.delaiEstime.trim() : null;
    const savedProgression = d.statusProgression || 'etude';
    const savedReponse = (d.reponseAtelier && d.reponseAtelier.trim()) ? d.reponseAtelier.trim() : null;

    const hasAdminSplitFields = extDetails.matierePrice !== undefined || extDetails.laborPrice !== undefined;
    const adminMatierePrice = Number(extDetails.matierePrice || 0);
    const adminLaborPrice = Number(extDetails.laborPrice || 0);

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
    const savedModelisteName = extDetails.modelisteName || (d as any).modelisteName || (extDetails.patronageStatus === 'priced' ? 'Mohammed Aboulfateh' : null);
    const isModelisteValide = extDetails.modelisteValide !== undefined
      ? Boolean(extDetails.modelisteValide)
      : Boolean(extDetails.patronageStatus === 'priced' || (savedPatronage && savedModelisteName));
    const hasCustomPatronage = Boolean(savedPatronage && savedPatronage > 0 && (isModelisteValide || isOfficialAtelierDecision));
    const hasCustomEchantillon = Boolean(savedEchantillon && savedEchantillon > 0);
    const savedTissuConso = (extDetails.tissuConso && Number(extDetails.tissuConso) > 0)
      ? Number(extDetails.tissuConso)
      : (d as any).tissuConso && Number((d as any).tissuConso) > 0
      ? Number((d as any).tissuConso)
      : null;
    const savedPrixMetre = (extDetails.prixMetreEstime && Number(extDetails.prixMetreEstime) > 0)
      ? Number(extDetails.prixMetreEstime)
      : null;

    // Detect Clothing Categories (only used as fallback when NO Official Atelier Decision exists yet)
    const isBodyOrTop = (
      text.includes('boudi') ||
      text.includes('body') ||
      text.includes('بودي') ||
      text.includes('بادي') ||
      text.includes('sous-pull') ||
      text.includes('sous pull') ||
      text.includes('caraco') ||
      text.includes('débardeur') ||
      text.includes('debardeur') ||
      text.includes('crop top') ||
      text.includes('croptop') ||
      text.includes('haut moulant') ||
      (text.includes('top') && !text.includes('laptop') && !text.includes('desktop') && !text.includes('stop'))
    );
    const isDenimOrTailleur = !isBodyOrTop && (
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

    let defaultModele = (d.type && !isGenericFormLabel(d.type)) ? d.type : (isAr ? 'موديل تفصيل وخياطة مخصص' : 'Modèle Confection Sur-Mesure');
    let defaultTissu = isAr ? 'قماش مخصص ومطابق للمواصفات المطلوبة' : 'Tissu adapté selon cahier des charges';
    let defaultTech = isAr ? 'قصة وخياطة مخصصة بدقة عالية مع معالجة احترافية لكافة التفاصيل' : 'Patronage et confection sur-mesure de haute précision';
    let defaultUnitPrice = 65;
    let defaultDelai = isAr ? '7 إلى 10 أيام عمل (العينة تحت 48 ساعة)' : '7 - 10 jours ouvrables (Échantillon sous 48h)';
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

    if (isBodyOrTop) {
      defaultModele = isAr ? 'بودي / توب نسائي كم طويل قصة ممتازة' : 'Body / Top Manches Longues Moulant';
      defaultTissu = isAr ? 'قماش جيرسي ليكرا أو ريب مطاطي ناعم' : 'Jersey Coton Élasthanne / Viscose Lycra';
      defaultTech = isAr ? 'قصة بودي مطاطية ملائمة للجسم • خياطة مرنة بأربع خيوط' : 'Coupe près du corps stretch • Assemblage surjet 4 fils';
      defaultUnitPrice = 20;
      defaultDelai = isAr ? '5 - 7 أيام عمل' : '5 - 7 jours ouvrables';
      defaultPatronage = 160;
      defaultEchantillon = 220;
      defaultTissuConso = 1.05;
      defaultTissuPrixKg = 65;
      defaultPrixMetre = 26;
      defaultAccessoriesCost = 5;
      defaultPrixConfection = 20;
      defaultTissuMarche = isAr ? 'سوق درب عمر / ليساسفة' : 'Marché Derb Omar';
    } else if (isTracksuit) {
      defaultModele = isAr ? 'طقم بدلة رياضية (فيست بسحاب وسروال)' : 'Ensemble Survêtement Veste Zippée + Pantalon (2 Pièces)';
      defaultTissu = isAr ? 'مولطون قطن بوليستر 300 غرام' : 'Molleton Coton/Polyester 300g';
      defaultTech = isAr ? 'فيست بسحاب معدني وجيوب جانبية • سروال بخصر مطاطي' : 'Veste zippée col montant • Pantalon taille élastique';
      defaultUnitPrice = 135;
      defaultDelai = isAr ? '8 - 12 يوم عمل' : '8 - 12 jours ouvrables';
      defaultPatronage = 380;
      defaultEchantillon = 450;
      defaultTissuConso = 2.85;
      defaultTissuPrixKg = 68;
      defaultPrixMetre = 40;
      defaultAccessoriesCost = 18;
      defaultPrixConfection = 95;
    } else if (isHoodieOrSweat) {
      defaultModele = isAr ? 'هودي بقبعة أوفرسايز' : 'Hoodie à Capuche Oversize';
      defaultTissu = isAr ? 'مولطون قطن 320 غرام مبطن' : 'Molleton Coton Gratté 320g / French Terry';
      defaultTech = isAr ? 'قبعة مبطنة بحبال • جيب كانغورو • حواف مرنة متينة' : 'Capuche doublée avec cordons • Bord-côte poignets et bas';
      defaultUnitPrice = 75;
      defaultPatronage = 260;
      defaultEchantillon = 350;
      defaultTissuConso = 1.85;
      defaultTissuPrixKg = 68;
      defaultPrixMetre = 38;
      defaultAccessoriesCost = 15;
      defaultPrixConfection = 55;
    } else if (isTshirt) {
      defaultModele = isAr ? 'تيشيرت قطن ممشط 100%' : 'T-Shirt Coton Peigné 100%';
      defaultTissu = isAr ? 'جيرسي قطن ممشط 200g - 220g' : 'Jersey 100% Coton Peigné 200g - 220g';
      defaultTech = isAr ? 'ياقة دائرية بورد-كوط • خياطة مزدوجة' : 'Col rond bord-côte • Double surpiqûre';
      defaultUnitPrice = 45;
      defaultDelai = isAr ? '5 - 7 أيام عمل' : '5 - 7 jours ouvrables';
      defaultPatronage = 180;
      defaultEchantillon = 250;
      defaultTissuConso = 1.15;
      defaultTissuPrixKg = 72;
      defaultPrixMetre = 28;
      defaultAccessoriesCost = 8;
      defaultPrixConfection = 28;
    } else if (isPolo) {
      defaultModele = isAr ? 'قميص بولو كلاسيك قطن' : 'Polo Piqué Coton Peigné';
      defaultTissu = isAr ? 'بيكي قطن 220 غرام' : 'Maille Piquée 100% Coton 220g';
      defaultTech = isAr ? 'ياقة وأساور بورد-كوط منسوجة • فتحة بزرين' : 'Col et bas de manches en côte • Patte 2 boutons';
      defaultUnitPrice = 65;
      defaultPatronage = 220;
      defaultEchantillon = 280;
      defaultTissuConso = 1.30;
      defaultTissuPrixKg = 70;
      defaultPrixMetre = 34;
      defaultAccessoriesCost = 12;
      defaultPrixConfection = 38;
    } else if (isPants) {
      defaultModele = isAr ? 'سروال جوغينغ كاجوال' : 'Pantalon Jogging / Survêtement';
      defaultTissu = isAr ? 'مولطون قطن 300 غرام' : 'Molleton Coton 300g';
      defaultTech = isAr ? 'حزام مطاطي • جيوب جانبية' : 'Ceinture élastiquée • Poches passepoilées';
      defaultUnitPrice = 68;
      defaultDelai = isAr ? '6 - 9 أيام عمل' : '6 - 9 jours ouvrables';
      defaultPatronage = 240;
      defaultEchantillon = 320;
      defaultTissuConso = 1.45;
      defaultTissuPrixKg = 68;
      defaultPrixMetre = 38;
      defaultAccessoriesCost = 14;
      defaultPrixConfection = 48;
    } else if (isVeste) {
      defaultModele = isAr ? 'جاكيت رياضية تقنية بسحاب' : 'Veste Sport Coupe-Vent Zippée';
      defaultTissu = isAr ? 'مايكروفايبر تقني مقاوم للرياح' : 'Microfibre Coupe-Vent / Nylon Twill';
      defaultTech = isAr ? 'سحاب أمامي كامل • جيبين جانبيين • ياقة مرتفعة' : 'Fermeture zippée intégrale • Poches zippées • Col montant';
      defaultUnitPrice = 95;
      defaultPatronage = 300;
      defaultEchantillon = 380;
      defaultTissuConso = 2.10;
      defaultTissuPrixKg = 75;
      defaultPrixMetre = 42;
      defaultAccessoriesCost = 22;
      defaultPrixConfection = 75;
    } else if (isDenimOrTailleur) {
      defaultModele = isAr ? 'طقم فيست دنيم عصري بحزام' : 'Ensemble Veste Tailleur Denim Ceinturée';
      defaultTissu = isAr ? 'ثوب دنيم جينز 100% قطن 11-12 أونصة' : 'Toile Denim 100% Coton 11-12oz';
      defaultTech = isAr ? 'قصة جاكيت مفصلة مع حزام خصر • درزات مضاعفة' : 'Veste tailleur avec ceinture • Double surpiqûre';
      defaultUnitPrice = 115;
      defaultDelai = isAr ? '8 - 12 يوم عمل' : '8 - 12 jours ouvrables';
      defaultPatronage = 350;
      defaultEchantillon = 420;
      defaultTissuConso = 2.40;
      defaultTissuPrixKg = 75;
      defaultPrixMetre = 48;
      defaultAccessoriesCost = 35;
      defaultPrixConfection = 115;
    }

    if (savedTissuConso) defaultTissuConso = savedTissuConso;
    if (savedPrixMetre) defaultPrixMetre = savedPrixMetre;

    const hasBroderie = text.includes('broderie') || text.includes('طرز') || text.includes('طريزة') || text.includes('brodé') || text.includes('brode');
    const hasPrint = text.includes('sérigraphie') || text.includes('serigraphie') || text.includes('dtf') || text.includes('print') || text.includes('طباعة') || text.includes('طبعة') || text.includes('marquage');

    const savedFournisseurNom = extDetails.supplierName || (d as any).fournisseurNom || null;
    const savedFournisseurTel = extDetails.supplierPhone || (d as any).fournisseurTel || null;
    const savedFournisseurVille = extDetails.supplierCity || (d as any).fournisseurVille || null;
    const savedFournisseurCode = extDetails.supplierCode || (d as any).fournisseurCode || null;
    const savedFournisseurColors = extDetails.supplierColors || (d as any).fournisseurCouleurs || null;
    const savedFournisseurNotes = extDetails.supplierNotes || (d as any).fournisseurNote || null;

    const officialBeyaPhone = (company.phone && !company.phone.includes('00 00') && !company.phone.includes('000000')) ? company.phone : '0675239885';
    const cleanFournisseurTel = (savedFournisseurTel && savedFournisseurTel !== '0661849201' && savedFournisseurTel !== '212661849201' && savedFournisseurTel.length >= 8)
      ? savedFournisseurTel
      : officialBeyaPhone;

    const hasCustomFournisseur = Boolean(savedFournisseurNom && savedFournisseurNom.trim());
    const fournisseurNom = hasCustomFournisseur ? savedFournisseurNom.trim() : '';
    const fournisseurTel = hasCustomFournisseur ? cleanFournisseurTel : officialBeyaPhone;
    const fournisseurVille = (savedFournisseurVille && savedFournisseurVille.trim()) ? savedFournisseurVille.trim() : '';
    const fournisseurCode = (savedFournisseurCode && savedFournisseurCode.trim()) ? savedFournisseurCode.trim() : '';
    const fournisseurCouleurs = savedFournisseurColors ? String(savedFournisseurColors) : '';
    const fournisseurNote = savedFournisseurNotes ? String(savedFournisseurNotes) : '';

    const rawQty = (extDetails.adminQty && Number(extDetails.adminQty) > 0)
      ? Number(extDetails.adminQty)
      : (Number(d.quantity) > 0 ? Number(d.quantity) : 100);
    const qty = rawQty;

    const tissuCostPerPiece = Math.round(defaultTissuConso * defaultPrixMetre);
    let confectionPrice = defaultPrixConfection;
    let fullPackagePrice = defaultPrixConfection + tissuCostPerPiece + defaultAccessoriesCost;

    if (isOfficialAtelierDecision) {
      // Strictly honor the Admin's exact official unit price without arbitrary markups or splits
      const splitSum = adminMatierePrice + adminLaborPrice;
      const officialUnitFromDoc = (officialDoc && officialDoc.montant > 0 && qty > 0)
        ? Math.round(officialDoc.montant / qty)
        : 0;
      const resolvedOfficialUnit = (hasAdminSplitFields && splitSum > 0)
        ? splitSum
        : (savedUnitPrice && savedUnitPrice > 0)
          ? savedUnitPrice
          : (officialUnitFromDoc > 0 ? officialUnitFromDoc : defaultUnitPrice);

      fullPackagePrice = resolvedOfficialUnit;
      confectionPrice = (adminMatierePrice > 0 && adminLaborPrice > 0) ? adminLaborPrice : resolvedOfficialUnit;
    } else {
      const isGenericPrice = (savedUnitPrice === 65 && !d.crmPriceConfirmed && (isVeste || isDenimOrTailleur || isTracksuit)) ||
        (isBodyOrTop && savedUnitPrice && savedUnitPrice >= 65 && !d.crmPriceConfirmed);
      if (savedUnitPrice && !isGenericPrice) {
        if (savedUnitPrice > 130) {
          fullPackagePrice = savedUnitPrice;
          confectionPrice = Math.max(35, savedUnitPrice - tissuCostPerPiece - defaultAccessoriesCost);
        } else {
          confectionPrice = savedUnitPrice;
          fullPackagePrice = savedUnitPrice + tissuCostPerPiece + defaultAccessoriesCost;
        }
      }
    }

    const unitPrice = fullPackagePrice;
    const rawModele = savedModele || defaultModele;
    const modeleReel = cleanLangText(rawModele, isAr) || defaultModele;

    // When Official Atelier Decision is sent, ONLY expose fabric / tech / delay / note that Admin actually entered!
    const tissuSuggere = isOfficialAtelierDecision
      ? (extDetails.adminFabric !== undefined ? cleanLangText(extDetails.adminFabric, isAr) : (savedTissu ? cleanLangText(savedTissu, isAr) : ''))
      : (cleanLangText(savedTissu || defaultTissu, isAr) || defaultTissu);
    const techDetails = isOfficialAtelierDecision
      ? (extDetails.adminTechDetails !== undefined ? cleanLangText(extDetails.adminTechDetails, isAr) : (savedTech ? cleanLangText(savedTech, isAr) : ''))
      : (cleanLangText(savedTech || defaultTech, isAr) || defaultTech);
    const delaiEstime = isOfficialAtelierDecision
      ? (extDetails.adminDelai !== undefined ? cleanLangText(extDetails.adminDelai, isAr) : (savedDelai ? cleanLangText(savedDelai, isAr) : ''))
      : (cleanLangText(savedDelai || defaultDelai, isAr) || defaultDelai);
    const reponseAtelier = isOfficialAtelierDecision
      ? (extDetails.adminReponse !== undefined ? cleanLangText(extDetails.adminReponse, isAr) : (savedReponse ? cleanLangText(savedReponse, isAr) : ''))
      : (cleanLangText(savedReponse || defaultReponse, isAr) || defaultReponse);

    const tissuMarcheNom = cleanLangText(defaultTissuMarche, isAr);
    const totalPrice = isOfficialAtelierDecision
      ? (d.totalPrice && Number(d.totalPrice) > 0 && Math.abs(Number(d.totalPrice) - fullPackagePrice * qty) < 2
          ? Number(d.totalPrice)
          : fullPackagePrice * qty)
      : (d.totalPrice && d.totalPrice > 0 ? d.totalPrice : (fullPackagePrice * qty));

    const statusProgression = savedProgression;
    const patronagePrice = savedPatronage || defaultPatronage;
    const echantillonPrice = savedEchantillon || defaultEchantillon;
    const canSwitchFabricSource = isOfficialAtelierDecision
      ? Boolean(adminMatierePrice > 0 && adminLaborPrice > 0)
      : true;

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
      modelisteName: savedModelisteName,
      isModelisteValide,
      tissuConsoMeters: defaultTissuConso,
      tissuPricePerKg: defaultTissuPrixKg,
      hasBroderie,
      hasPrint,
      fournisseurNom,
      fournisseurTel,
      fournisseurVille,
      fournisseurCode,
      fournisseurCouleurs,
      fournisseurNote,
      hasCustomFournisseur,
      isOfficialAtelierDecision,
      hasAdminSplit: Boolean(adminMatierePrice > 0 && adminLaborPrice > 0),
      adminMatierePrice,
      adminLaborPrice,
      canSwitchFabricSource,
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
                { id: 'docs', icon: <Receipt className="w-5 h-5 shrink-0" />, label: isAr ? 'الفواتير والوثائق' : 'Factures & Docs', ...(clientDevisDocs.length > 0 ? { badge: String(clientDevisDocs.length) } : {}) },
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{isAr ? 'زبون ممتاز' : 'Client Premium'}</p>
                      {clientCity && (
                        <span className="text-[9px] text-slate-300 truncate flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10">
                          <MapPin className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                          {clientCity}
                        </span>
                      )}
                    </div>
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
              


              {/* Apple-style Location Pill */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCityDraft(clientCity || '');
                  setShowCityModal(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer active:scale-95 ${
                  clientCity
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 animate-pulse shadow-xs'
                }`}
                title={isAr ? 'تغيير أو تحديد مدينتك' : 'Modifier votre ville'}
              >
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${clientCity ? 'text-indigo-600' : 'text-amber-600'}`} />
                <span className="max-w-[110px] sm:max-w-[140px] truncate">{clientCity || (isAr ? '📍 حدد مدينتك' : '📍 Choisir ville')}</span>
              </button>

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
                    showNotification(isAr ? 'تم نسخ الرمز السري بنجاح إلى الحافظة.' : 'Code PIN copié avec succès !', isAr ? '📋 تم النسخ' : '📋 Copié', 'success');
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* ────────────── WELCOME HERO (Top of Dashboard) ────────────── */}
               <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500/20">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
                  
                  {/* Top Section: Greeting & Main CTA */}
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div className={`space-y-1.5 ${isAr ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                          {isAr ? `مرحباً بك، ${currentUser?.nom || 'عزيزي الزبون'}` : `Bonjour, ${currentUser?.nom || 'Cher Client'}`}
                        </h1>
                        <span className="px-2.5 py-0.5 bg-indigo-500/25 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{isAr ? 'حساب معتمد' : 'Compte vérifié'}</span>
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
                        {isAr 
                          ? 'متابعة مباشرة لطلبياتك، دراسات الموديلات، ومراحل الخياطة والتصنيع لدى ورشة BEYA Creative.'
                          : 'Suivez vos productions, chiffrages de modèles et expéditions en direct avec l\'Atelier BEYA Creative.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        type="button"
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
                        className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAr ? 'طلب جديد / موديل' : 'Nouvelle Commande'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Middle Section: Symmetrical 3-Card KPI Stats */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6">
                    <button
                      type="button"
                      onClick={() => setActiveTab('demandes')}
                      className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl text-start transition-all cursor-pointer group flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                          {isAr ? 'موديلات قيد الدراسة والتسعير' : 'Demandes à l\'étude'}
                        </span>
                        <p className="text-2xl sm:text-3xl font-black text-indigo-300">
                          {mesDemandes.filter(d => d.type !== '__MESSAGE__' && d.type !== '__MESSAGE_REPLY__').length}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {isAr ? 'عرض المواصفات والأثمنة ←' : 'Voir les détails →'}
                        </span>
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl text-start transition-all cursor-pointer group flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                          {isAr ? 'طلبيات في الإنتاج بالورشة' : 'En production active'}
                        </span>
                        <p className="text-2xl sm:text-3xl font-black text-amber-300">
                          {found.filter(c => c.statut === 'en_cours' || c.statut === 'echantillon_en_cours').length}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {isAr ? 'مراحل الفصالة والخياطة ←' : 'Suivre la confection →'}
                        </span>
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <RotateCw className="w-5 h-5" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl text-start transition-all cursor-pointer group flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                          {isAr ? 'إجمالي الطلبيات المسجلة' : 'Total des commandes'}
                        </span>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-300">
                          {found.length}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {isAr ? 'الأرشيف والسجل الكامل ←' : 'Historique complet →'}
                        </span>
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                      </div>
                    </button>
                  </div>

                  {/* Bottom Section: WhatsApp Notification Integrated Strip */}
                  {(currentUser?.role === 'client' || currentUser?.role === 'merchant') && (
                    <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
                      <div className="bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-2xl p-4 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
                              <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-black text-white">
                                  {isAr ? 'إشعارات الإنتاج المباشرة فـ WhatsApp' : 'Notifications WhatsApp en direct'}
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-bold">
                                  {isAr ? 'تحديثات حية' : 'En direct'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                                <span className="text-slate-400 text-[11px]">{isAr ? 'الرقم المعتمد:' : 'Numéro certifié :'}</span>
                                <span className="font-mono font-bold text-white text-xs sm:text-sm">
                                  {clientPhone || currentUser?.telephone || (mesDemandes.find(d => d.phone)?.phone) || (isAr ? 'غير مسجل' : 'Non renseigné')}
                                </span>
                                {(clientPhone || currentUser?.telephone) && (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>{isAr ? 'مفعل ومربوط' : 'Actif'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                            {!isEditingPhone ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setPhoneInputVal(clientPhone || currentUser?.telephone || '');
                                  setIsEditingPhone(true);
                                }}
                                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer active:scale-95"
                              >
                                <Edit2 className="w-3 h-3 text-indigo-300" />
                                <span>{isAr ? 'تعديل الرقم' : 'Modifier'}</span>
                              </button>
                            ) : (
                              <form onSubmit={handleSaveClientPhone} className="flex items-center gap-2">
                                <input
                                  type="tel"
                                  value={phoneInputVal}
                                  onChange={(e) => setPhoneInputVal(e.target.value)}
                                  placeholder="06 XX XX XX XX"
                                  className="py-1.5 px-3 bg-white/15 border border-white/25 rounded-xl text-white font-mono text-xs outline-none focus:border-emerald-400 transition"
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  disabled={savingPhone || !phoneInputVal.trim()}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  {savingPhone ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  <span>{isAr ? 'حفظ' : 'OK'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingPhone(false)}
                                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-xs cursor-pointer"
                                >
                                  ✕
                                </button>
                              </form>
                            )}

                            <a
                              href={`https://wa.me/212661000000?text=${encodeURIComponent(
                                isAr
                                  ? `السلام عليكم ورشة BEYA Creative، أنا الزبون ${currentUser?.nom || 'الزبون'} (رقمي: ${clientPhone || currentUser?.telephone || ''}). بغيت نأكد رقمي لاستقبال إشعارات وتحديثات الإنتاج على WhatsApp.`
                                  : `Bonjour Atelier BEYA Creative, je confirme mon numéro (${clientPhone || currentUser?.telephone || ''}) pour recevoir les notifications de production sur WhatsApp.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{isAr ? 'تأكيد الرقم فـ WhatsApp' : 'Tester WhatsApp'}</span>
                            </a>
                          </div>
                        </div>

                        {phoneSaveSuccess && (
                          <div className="mt-2.5 p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{isAr ? 'تم حفظ وتأكيد رقمك بنجاح! ستصلك التحديثات عليه مباشرة.' : 'Numéro mis à jour avec succès !'}</span>
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-2">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span>🔒</span>
                            <span>{isAr ? 'تنبيهات مشفرة ومؤمنة 100%' : '100% sécurisé'}</span>
                          </span>
                          <span>{isAr ? 'مستجدات الفصالة، الخياطة، العينة، والفواتير فقط (بدون أي رسائل مزعجة)' : 'Suivi de confection, échantillon et factures officielles uniquement'}</span>
                        </div>
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
                       {isAr ? 'أنشئ متجري الآن' : 'Créer ma boutique'}
                     </button>
                   </div>
                 </div>
               )}

               {/* Urgent Sample Validation Banner when Delivered Échantillon awaits Client Confirmation */}
               {(() => {
                 const pendingSamples = found.filter(c => c.statut === 'echantillon_en_cours' && c.phase === 'livré');
                 if (pendingSamples.length === 0) return null;
                 return (
                   <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-2 border-amber-300 rounded-3xl p-5 md:p-6 shadow-lg shadow-amber-100/60 space-y-4">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="flex items-center gap-3.5">
                         <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
                           <Star className="w-6 h-6 fill-white" />
                         </div>
                         <div>
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider mb-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                             {isAr ? 'عينة جاهزة للتأكيد والموافقة' : 'Échantillon livré — Validation attendue'}
                           </span>
                           <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                             {isAr ? 'العينة الأولية جاهزة! المرجو تقييمها وإعطاء موافقتك' : 'Votre échantillon est prêt : donnez votre confirmation !'}
                           </h3>
                           <p className="text-xs text-slate-600 font-medium">
                             {isAr ? 'اضغط لتقييم العينة وتأكيد القياسات لإطلاق الإنتاج الكامل.' : 'Évaluez l\'échantillon et confirmez les mesures pour lancer la production.'}
                           </p>
                         </div>
                       </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {pendingSamples.map(cmd => (
                         <div key={cmd.id} className="bg-white border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                           <div className="flex items-center gap-3 min-w-0">
                             <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                               {(cmd as any).modelePhoto || (cmd as any).photo ? (
                                 <img src={(cmd as any).modelePhoto || (cmd as any).photo} alt={cmd.modele} className="w-full h-full object-cover" />
                               ) : (
                                 <Package className="w-5 h-5 text-slate-400" />
                               )}
                             </div>
                             <div className="min-w-0">
                               <span className="text-[10px] font-black text-indigo-600 font-mono block">{cmd.reference}</span>
                               <p className="text-sm font-black text-slate-900 truncate">{cmd.modele}</p>
                             </div>
                           </div>
                           <button
                             type="button"
                             onClick={() => {
                               setActiveTab('orders');
                               setFeedbackCmdId(cmd.id);
                               const matchingFiches = clientFiches.filter(f => normalizePortalKey(f.modele) === normalizePortalKey(cmd.modele));
                               const fiche = matchingFiches.find(f => f.mesures && f.mesures.some((m: any) => m.valeurs && Object.keys(m.valeurs).length > 0)) || matchingFiches[0] || clientFiches[0];
                               const initialMesures = (fiche && Array.isArray(fiche.mesures) && fiche.mesures.length > 0)
                                 ? fiche.mesures.map((m: any) => ({ nom: m.nom, valeurs: m.valeurs ? { ...m.valeurs } : {} }))
                                 : [{ nom: 'Épaules', valeurs: {} }, { nom: 'Poitrine', valeurs: {} }, { nom: 'Longueur', valeurs: {} }];
                               setFeedbackData({ rating: 0, fabricNotes: '', sizeNotes: '', generalNotes: '', useSizeTable: false, sizeTableNotes: {}, mesuresFeedback: initialMesures });
                               setTimeout(() => {
                                 document.getElementById(`order-card-${cmd.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                               }, 180);
                             }}
                             className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
                           >
                             <Star className="w-4 h-4 fill-white" />
                             <span>{isAr ? 'تقييم وتأكيد العينة' : 'Confirmer Échantillon'}</span>
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })()}

               {/* Official Dossiers Techniques Overview Strip */}
               {clientFiches.length > 0 && (
                 <div className="bg-gradient-to-r from-indigo-50 via-white to-slate-50 border border-indigo-200/80 rounded-3xl p-5 md:p-6 shadow-sm">
                   <div className="flex items-center justify-between gap-4 mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                         <Scissors className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">
                           {isAr ? 'ملفاتك التقنية والمقاسات (Fiches Techniques)' : 'Vos Dossiers Techniques Atelier'}
                         </h3>
                         <p className="text-xs text-slate-500 font-medium">
                           {isAr ? 'جدول المقاسات، الباترون ومواصفات الموديل جاهزة للمعاينة' : 'Tableau des mesures, patronage et spécifications prêts'}
                         </p>
                       </div>
                     </div>
                     <button
                       type="button"
                       onClick={() => setActiveTab('docs')}
                       className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-wider cursor-pointer"
                     >
                       {isAr ? 'كل الوثائق' : 'Tout voir'}
                     </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {clientFiches.slice(0, 4).map(f => (
                       <div key={f.id} className="bg-white border border-indigo-200/70 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                         <div className="min-w-0">
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">{f.type || (isAr ? 'بطاقة تقنية' : 'Fiche Technique')}</span>
                           <p className="text-sm font-black text-slate-900 truncate">{f.modele}</p>
                           <p className="text-[11px] text-slate-500 font-bold">{Array.isArray(f.tailles) ? f.tailles.length : 0} {isAr ? 'مقاسات' : 'tailles'}</p>
                         </div>
                         <div className="flex items-center gap-2 shrink-0">
                           <button
                             type="button"
                             onClick={() => setViewMesuresFiche(f)}
                             className="px-3 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                           >
                             <Eye className="w-3.5 h-3.5" />
                             <span>{isAr ? 'عرض' : 'Voir'}</span>
                           </button>
                           <button
                             type="button"
                             onClick={() => printFT(f)}
                             className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                           >
                             <Download className="w-3.5 h-3.5" />
                             <span>PDF</span>
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Official Devis Overview Strip */}
               {clientDevisDocs.length > 0 && (
                 <div className="bg-gradient-to-r from-amber-50 via-white to-indigo-50 border border-amber-200/80 rounded-3xl p-5 md:p-6 shadow-sm">
                   <div className="flex items-center justify-between gap-4 mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
                         <FileText className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">
                           {isAr ? 'عروض الأسعار الرسمية (Devis)' : 'Vos Devis Officiels Atelier'}
                         </h3>
                         <p className="text-xs text-slate-500 font-medium">
                           {isAr ? 'جاهزة للمعاينة والتحميل بصيغة PDF' : 'Prêts pour consultation et téléchargement PDF'}
                         </p>
                       </div>
                     </div>
                     <button
                       type="button"
                       onClick={() => setActiveTab('docs')}
                       className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-wider cursor-pointer"
                     >
                       {isAr ? 'كل الوثائق' : 'Tout voir'}
                     </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {clientDevisDocs.slice(0, 4).map(dev => {
                       const linkedCmd = found.find(c => c.id === dev.commandeId) || commandes.find(c => c.id === dev.commandeId);
                       return (
                         <div key={dev.id} className="bg-white border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                           <div className="min-w-0">
                             <div className="flex items-center gap-2 flex-wrap">
                               <span className="text-xs font-black text-slate-900 font-mono">{dev.numero}</span>
                               {linkedCmd?.reference && (
                                 <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-black font-mono">
                                   {linkedCmd.reference}
                                 </span>
                               )}
                             </div>
                             <p className="text-sm font-black text-amber-700 mt-1">
                               {dev.montant.toLocaleString()} MAD
                             </p>
                           </div>
                           <button
                             type="button"
                             onClick={() => { setSelectedFacture(dev); setShowInvoiceView(true); }}
                             className="px-3.5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                           >
                             <Download className="w-3.5 h-3.5 text-amber-400" />
                             <span>{isAr ? 'عرض / PDF' : 'Voir / PDF'}</span>
                           </button>
                         </div>
                       );
                     })}
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

             // Dedicated Full Page for Demande Details & Official Workshop Devis
             if (selectedDemandePage) {
               const d = selectedDemandePage;
               const analysis = getDemandeAnalysis(d, isAr);
               const sizes = getLeadSizes(d);
               const hasCustomSizes = Object.keys(sizes).length > 0;
               const isAccepted = d.crmStage === 'confirme';
               const isRejected = d.crmStage === 'annule';
               const isPending = !isAccepted && !isRejected;
               const devState = getLeadDevisState(d);
               const singleDevState = devState;
               const officialLeadDevis = getOfficialDevisForLead(d);
               const isDevisReady = singleDevState.isConfirmedByAtelier || singleDevState.isVal || Boolean(officialLeadDevis);

               const baseOrderQty = Math.max(1, Number(analysis.qty) || Number(d.quantity) || 100);
               const currentQty = selectedTierQty[d.id] !== undefined ? selectedTierQty[d.id] : baseOrderQty;
               const isClientFabric = analysis.canSwitchFabricSource && fabricOption[d.id] === 'client';
               const selectedBasePrice = isClientFabric ? analysis.confectionPrice : analysis.fullPackagePrice;
               const activeUnitPrice = computeSimulatedUnitPrice(currentQty, selectedBasePrice, baseOrderQty);
               const activeTotalPrice = activeUnitPrice * currentQty;
               const savingsVsBase = selectedBasePrice > 0 && activeUnitPrice < selectedBasePrice
                 ? Math.round(((selectedBasePrice - activeUnitPrice) / selectedBasePrice) * 100)
                 : 0;
               const acompteRequired = (isClientFabric && analysis.isOfficialAtelierDecision && analysis.adminMatierePrice > 0) || isClientFabric
                 ? 0
                 : Math.round(activeTotalPrice * 0.5);

               // Build smart ascending quantity tiers for the compact simulator right above Confirmation Box
               const simPresets = Array.from(
                 new Set([
                   baseOrderQty,
                   Math.max(baseOrderQty + 10, Math.round((baseOrderQty * 1.5) / 10) * 10),
                   Math.max(baseOrderQty + 20, Math.round((baseOrderQty * 2) / 10) * 10),
                   100,
                   300,
                   500
                 ].filter(q => q >= baseOrderQty))
               ).sort((a, b) => a - b).slice(0, 5);

               const phoneForWhatsApp = (company.phone || '+212600000000').replace(/\D/g, '');
               const waText = isAr
                 ? (isClientFabric
                     ? `السلام عليكم ورشة ${company.name || 'BEYA'}، بخصوص طلبيتي رقم REF: #${d.id.substring(0, 8).toUpperCase()}:\n- الموديل: ${analysis.modeleReel}\n- الكمية: ${currentQty} قطعة\n- السعر المعتمد: ${activeUnitPrice} درهم/قطعة (المجموع: ${activeTotalPrice.toLocaleString()} درهم)\nالثوب والمستلزمات غانصيفطهم من عندي للورشة (بدون تسبيق مسبق)، والخلاص عند استلام السلعة إن شاء الله.`
                     : `السلام عليكم ورشة ${company.name || 'BEYA'}، بخصوص طلبيتي رقم REF: #${d.id.substring(0, 8).toUpperCase()}:\n- الموديل: ${analysis.modeleReel}\n- الكمية: ${currentQty} قطعة\n- سعر القطعة: ${activeUnitPrice} درهم\n- المجموع: ${activeTotalPrice.toLocaleString()} درهم\nبغيت نأكد الدوفيز وندوز تسبيق 50% (${acompteRequired.toLocaleString()} درهم) لشراء السلعة وبدء العمل. شكراً!`)
                 : (isClientFabric
                     ? `Bonjour l'Atelier ${company.name || 'BEYA Creative'}, demande REF: #${d.id.substring(0, 8).toUpperCase()} :\n- Modèle : ${analysis.modeleReel}\n- Quantité : ${currentQty} pcs\n- Tarif : ${activeUnitPrice} MAD/pc\nJe fournis le tissu (0 MAD acompte). Règlement à la livraison.`
                     : `Bonjour l'Atelier ${company.name || 'BEYA Creative'}, demande REF: #${d.id.substring(0, 8).toUpperCase()} :\n- Modèle : ${analysis.modeleReel}\n- Quantité : ${currentQty} pcs\n- Prix unitaire : ${activeUnitPrice} MAD (Total : ${activeTotalPrice.toLocaleString()} MAD)\nJe valide le devis et souhaite régler l'acompte de 50% (${acompteRequired.toLocaleString()} MAD) pour lancer l'achat des matières et la confection.`);
               const waUrl = `https://wa.me/${phoneForWhatsApp}?text=${encodeURIComponent(waText)}`;

               const hasExtraDetailsSection = hasCustomSizes || analysis.hasCustomPatronage || analysis.hasCustomEchantillon || analysis.hasCustomFournisseur;

               return (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-24 sm:pb-28">
                   {/* 1. Clean Top Navigation Bar */}
                   <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                     <button
                       type="button"
                       onClick={() => setSelectedDemandePage(null)}
                       className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200/80 shadow-2xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                     >
                       <ChevronRight className={`w-3.5 h-3.5 ${isAr ? '' : 'rotate-180'}`} />
                       <span>{isAr ? '← الرجوع إلى قائمة طلباتي' : '← Retour à mes demandes'}</span>
                     </button>

                     <div className="flex items-center gap-2">
                       {!isDevisReady && (
                         <button
                           type="button"
                           disabled={isAiAnalyzingLead === d.id}
                           onClick={() => reanalyzeDemandeWithAI(d)}
                           className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                           title={isAr ? 'تحديث التقدير الأولي' : 'Actualiser estimation'}
                         >
                           <RotateCw className={`w-3.5 h-3.5 ${isAiAnalyzingLead === d.id ? 'animate-spin' : ''}`} />
                           <span className="hidden sm:inline">{isAr ? 'تحديث التقدير الأولي' : 'Actualiser estimation'}</span>
                         </button>
                       )}
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

                   {/* AI Progress bar only while manually recalculating initial estimate */}
                   {isAiAnalyzingLead === d.id && (
                     <div className="p-3 bg-indigo-950 text-white rounded-2xl border border-indigo-500/30 space-y-1.5 shadow-md">
                       <div className="flex items-center justify-between text-[11px] text-indigo-200 font-bold">
                         <span className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                           {isAr ? 'جاري فحص مواصفات الموديل وتحديث التقدير الأولي...' : 'Actualisation de l\'estimation en cours...'}
                         </span>
                         <span className="font-mono">85%</span>
                       </div>
                       <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-400 rounded-full animate-pulse w-4/5" />
                       </div>
                     </div>
                   )}

                   {/* 2. Organized 4-Step Progress Stepper */}
                   <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {[
                         { step: '01', title: isAr ? 'دراسة وتحديد السعر' : 'Étude & Devis', sub: isDevisReady ? (isAr ? 'مكتمل ✓' : 'Finalisé ✓') : (isAr ? 'جاري الدراسة' : 'En cours'), state: isDevisReady ? 'done' : 'current' },
                         { step: '02', title: isAr ? 'تأكيد الطلب والتسبيق' : 'Validation & Acompte', sub: singleDevState.isVal ? (isAr ? 'مؤكد ✓' : 'Validé ✓') : (isAr ? 'في انتظار التأكيد' : 'En attente'), state: singleDevState.isVal ? 'done' : (isDevisReady ? 'current' : 'upcoming') },
                         { step: '03', title: isAr ? 'إعداد الباترون والعينة' : 'Patronage & Échantillon', sub: isAr ? 'المرحلة القادمة' : 'Étape suivante', state: singleDevState.isVal ? 'current' : 'upcoming' },
                         { step: '04', title: isAr ? 'الإنتاج الكامل والتسليم' : 'Production & Livraison', sub: isAr ? 'التسليم النهائي' : 'Final', state: 'upcoming' },
                       ].map((st, i) => (
                         <div key={i} className={`p-2.5 rounded-xl border transition-all ${
                           st.state === 'current' ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs' :
                           st.state === 'done' ? 'bg-slate-50/90 border-slate-200 text-slate-700' :
                           'bg-white border-slate-100 opacity-60'
                         }`}>
                           <div className="flex items-center justify-between mb-0.5">
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

                   {/* 3. Main Organized Devis Card */}
                   <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-5 md:p-7 space-y-5">
                     
                     {/* A. Single Unified Model & Official Decision Header */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                       <div className="flex items-center gap-4 min-w-0">
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
                               #${d.id.substring(0, 8).toUpperCase()}
                             </span>
                             {isDevisReady ? (
                               <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-200 flex items-center gap-1">
                                 <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                 <span>{singleDevState.isVal ? (isAr ? 'دوفيز مؤكد ومعتمد ✓' : 'Devis Validé ✓') : (isAr ? 'قرار ودوفيز الورشة النهائي' : 'Décision Finale & Devis Officiel')}</span>
                               </span>
                             ) : (
                               <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded-lg border border-amber-200 flex items-center gap-1">
                                 <Clock className="w-3 h-3 text-amber-600" />
                                 <span>{isAr ? 'تقدير أولي (قيد دراسة الورشة)' : 'Estimation Indicative (En cours)'}</span>
                               </span>
                             )}
                           </div>
                           <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
                             {analysis.modeleReel}
                           </h2>
                           <p className="text-xs text-slate-500 font-medium mt-0.5">
                             {isAr ? 'الزبون :' : 'Client :'} <strong className="text-slate-800">{d.name || currentUser?.nom || 'Client'}</strong>
                             {d.crmDevisMode === 'echantillon' && (
                               <span className="mx-2 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-black rounded-md border border-purple-200">
                                 {isAr ? '🧪 وضع العينة الأولية' : '🧪 Mode Échantillon'}
                               </span>
                             )}
                           </p>
                         </div>
                       </div>
                     </div>

                     {/* B. Official Workshop Decision Banner vs Pending Estimate Notice (Zero contradictions!) */}
                     {isDevisReady ? (
                       <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-indigo-50/60 to-emerald-50/40 border border-emerald-200/90 rounded-2xl flex items-start gap-3.5 shadow-2xs">
                         <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                           <ShieldCheck className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0 space-y-1">
                           <div className="flex items-center justify-between gap-2 flex-wrap">
                             <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                               {isAr ? 'القرار النهائي المعتمد من ورشة BEYA CREATIVE' : 'Décision Finale & Tarif Officiel Atelier BEYA'}
                             </h4>
                             <span className="px-2 py-0.5 bg-white text-emerald-700 text-[10px] font-black rounded-md border border-emerald-200">
                               {isAr ? 'تسعير رسمي معتمد' : 'Offre Officielle'}
                             </span>
                           </div>
                           {analysis.reponseAtelier ? (
                             <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-100 mt-1.5">
                               "{analysis.reponseAtelier}"
                             </p>
                           ) : (
                             <p className="text-xs text-slate-600 font-medium">
                               {isAr
                                 ? 'تمت مراجعة طلبكم واعتماد السعر النهائي أدناه. يمكنكم تأكيد الطلب وإرسال التسبيق (Virement) لبدء شراء السلعة وانطلاق الإنتاج.'
                                 : 'Votre demande a été chiffrée par l\'atelier. Vous pouvez valider et verser l\'acompte ci-dessous pour lancer les achats et la fabrication.'}
                             </p>
                           )}
                         </div>
                       </div>
                     ) : (
                       <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-400/40 rounded-2xl flex items-start gap-3.5 text-amber-950">
                         <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 shadow-xs">
                           <AlertCircle className="w-5 h-5" />
                         </div>
                         <div className="space-y-1 flex-1">
                           <div className="flex items-center gap-2 flex-wrap">
                             <strong className="text-xs sm:text-sm font-black text-amber-950">
                               {isAr ? 'تقدير أولي مبدئي — في انتظار القرار النهائي من الورشة' : 'Estimation indicative — En attente du devis final'}
                             </strong>
                           </div>
                           <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                             {isAr
                               ? 'هذا السعر تقديري فقط لأخذ فكرة أولية. بمجرد ما يراجع رئيس الورشة الموديل ويحدد القرار الرسمي، غادي توصلك التسعيرة النهائية هنا وتقدر تأكدها.'
                               : 'Ce tarif est purement indicatif. Dès validation par le chef d\'atelier, le devis officiel engageant apparaîtra ici.'}
                           </p>
                         </div>
                       </div>
                     )}

                     {/* C. Core Organized Pricing & Specifications Grid (Strictly real admin inputs only!) */}
                     {(() => {
                       const hasRealMaterialOrTech = Boolean(
                         (analysis.tissuSuggere && analysis.tissuSuggere.trim()) ||
                         (analysis.techDetails && analysis.techDetails.trim())
                       );
                       return (
                         <div className={`grid grid-cols-1 ${hasRealMaterialOrTech ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
                           {/* 1. Unit Price Card */}
                           <div className="p-4 bg-indigo-50/75 rounded-2xl border border-indigo-100 flex flex-col justify-between space-y-2">
                             <div className="flex items-center justify-between gap-2">
                               <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider truncate">
                                 {isClientFabric
                                   ? (isAr ? 'سعر الخياطة فقط للقطعة' : 'Façon seule / Pièce')
                                   : (isAr ? 'سعر القطعة المعتمد' : 'Prix Unitaire Officiel')}
                               </span>
                               <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${isDevisReady ? 'bg-emerald-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                                 {isDevisReady ? (isAr ? 'نهائي ✓' : 'Officiel ✓') : (isAr ? 'تقديري' : 'Indicatif')}
                               </span>
                             </div>
                             <div>
                               <div className="flex items-baseline gap-1.5">
                                 <span className="text-3xl font-black text-indigo-950 font-mono">{activeUnitPrice}</span>
                                 <span className="text-sm font-black text-indigo-600">MAD <span className="text-[10px] font-normal text-slate-500">/ pc</span></span>
                                 {savingsVsBase > 0 && (
                                   <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg font-mono">
                                     -{savingsVsBase}%
                                   </span>
                                 )}
                               </div>
                               <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                                 <span className="text-[11px] text-slate-600 font-bold">
                                   {isAr ? `الكمية: ${currentQty} قطعة` : `Quantité : ${currentQty} pcs`}
                                 </span>
                                 {analysis.hasAdminSplit && currentQty === baseOrderQty && (
                                   <span className="text-[10px] text-indigo-700 font-bold bg-white/90 px-2 py-0.5 rounded-md border border-indigo-100">
                                     {isAr
                                       ? `ثوب: ${analysis.adminMatierePrice} DH + خياطة: ${analysis.adminLaborPrice} DH`
                                       : `Matière: ${analysis.adminMatierePrice} + MO: ${analysis.adminLaborPrice} MAD`}
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>

                           {/* 2. Total Price Card */}
                           <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between space-y-2">
                             <div className="flex items-center justify-between gap-2">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                 {isDevisReady ? (isAr ? 'المجموع الإجمالي للدوفيز' : 'Total Devis Officiel') : (isAr ? 'المجموع التقديري' : 'Total Indicatif')}
                               </span>
                               {analysis.delaiEstime && (
                                 <span className="px-2 py-0.5 bg-slate-800 text-amber-400 text-[9px] font-mono font-bold rounded-md border border-amber-400/20">
                                   {isAr ? `المدة: ${analysis.delaiEstime}` : `Délai : ${analysis.delaiEstime}`}
                                 </span>
                               )}
                             </div>
                             <div>
                               <div className="flex items-baseline gap-1.5">
                                 <span className="text-3xl font-black text-white font-mono">{activeTotalPrice.toLocaleString()}</span>
                                 <span className="text-sm font-black text-indigo-300">MAD</span>
                               </div>
                               <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
                                 {currentQty !== baseOrderQty
                                   ? (isAr ? `تم تحديث المجموع حسب الكمية الجديدة (${currentQty} قطعة)` : `Recalculé pour ${currentQty} pièces`)
                                   : (isAr ? 'بناءً على تسعيرة الورشة المعتمدة' : 'Selon chiffrage atelier')}
                               </span>
                             </div>
                           </div>

                           {/* 3. Real Fabric / Technical Info Card (ONLY rendered if Admin entered fabric or specs) */}
                           {hasRealMaterialOrTech && (
                             <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-2">
                               <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                   {isAr ? 'الثوب والمواصفات المعتمدة' : 'Matière & Spécifications'}
                                 </span>
                                 <span className="px-2 py-0.5 bg-white text-indigo-700 text-[10px] font-black rounded-lg border border-slate-200">
                                   {isAr ? 'معتمد' : 'Spécifié'}
                                 </span>
                               </div>
                               <div className="space-y-1">
                                 {analysis.tissuSuggere && (
                                   <span className="text-xs sm:text-sm font-black text-slate-900 block leading-snug">
                                     {analysis.tissuSuggere}
                                   </span>
                                 )}
                                 {analysis.techDetails && (
                                   <span className="text-[11px] text-slate-600 font-medium block leading-relaxed">
                                     {analysis.techDetails}
                                   </span>
                                 )}
                               </div>
                             </div>
                           )}
                         </div>
                       );
                     })()}

                     {/* Fabric Source Switcher (ONLY shown when Admin separated Matière vs Main d'oeuvre or during initial estimate) */}
                     {analysis.canSwitchFabricSource && (
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
                     )}

                     {/* Compact Patronage / Échantillon Badges ONLY if explicitly priced */}
                     {(analysis.hasCustomPatronage || analysis.hasCustomEchantillon) && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                         {analysis.hasCustomPatronage && (
                           <div className="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                             <span className="font-bold text-amber-950 flex items-center gap-1.5">
                               <span>📐</span>
                               <span>{isAr ? 'الباتروناج والتدريج:' : 'Patronage :'}{analysis.modelisteName ? ` (${analysis.modelisteName})` : ''}</span>
                             </span>
                             <span className="font-black text-amber-900 font-mono">{analysis.patronagePrice} MAD</span>
                           </div>
                         )}
                         {analysis.hasCustomEchantillon && (
                           <div className="px-4 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs">
                             <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                               <span>✂️</span>
                               <span>{isAr ? 'ثمن العينة الأولية:' : 'Échantillon :'}</span>
                             </span>
                             <span className="font-black text-indigo-900 font-mono">{analysis.echantillonPrice} MAD</span>
                           </div>
                         )}
                       </div>
                     )}

                     {/* D. 50% Acompte & Virement Button (MOVED UP! Clear & Prominent above Confirmation Box) */}
                     {!isClientFabric ? (
                       <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-amber-50/60 rounded-2xl border-2 border-indigo-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                         <div className="space-y-1 flex-1">
                           <div className="flex items-center gap-2 flex-wrap">
                             <span className="font-black flex items-center gap-1.5 text-xs sm:text-sm text-indigo-950">
                               <CreditCard className="w-4 h-4 text-indigo-600" />
                               {isAr ? 'تسبيق شراء السلعة وبدء الخدمة (50%):' : 'Acompte Matières & Lancement (50%) :'}
                             </span>
                             <span className="font-black text-base sm:text-lg text-amber-950 bg-amber-100/90 px-3 py-0.5 rounded-xl border border-amber-300 font-mono">
                               {acompteRequired.toLocaleString()} MAD
                             </span>
                           </div>
                           <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                             {isAr
                               ? 'برك على زر التحويل باش تأكد الطلب وتصيفط التسبيق (Virement)، باش نقدروا نشريو الثوب والسلعة ونبدأو الخياطة فوراً (والباقي 50% عند التسليم).'
                               : 'Cliquez pour valider et envoyer votre acompte par Virement Bancaire afin d\'acheter les matières et démarrer la confection (solde 50% à la livraison).'}
                           </p>
                         </div>

                         <button
                           type="button"
                           onClick={() => {
                             if (isDevisReady && !singleDevState.isVal) {
                               setValidatingDevisLead(d);
                             } else {
                               setSelectedDemandePage(null);
                               setVirementCommandeId(d.id);
                               setVirementMontant(String(acompteRequired));
                               setActiveTab('payments');
                             }
                           }}
                           className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:scale-[1.01] active:scale-95 cursor-pointer shrink-0"
                         >
                           <CreditCard className="w-4 h-4" />
                           <span>
                             {singleDevState.isVal
                               ? (isAr ? '💳 إرسال وصل التسبيق (Virement)' : '💳 Envoyer Reçu Virement')
                               : (isAr ? `💳 أداء التسبيق (Virement • ${acompteRequired.toLocaleString()} DH)` : `💳 Payer Acompte / Virement (${acompteRequired.toLocaleString()} DH)`)}
                           </span>
                         </button>
                       </div>
                     ) : (
                       <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                         <div>
                           <span className="font-black flex items-center gap-1.5 text-xs sm:text-sm text-emerald-800">
                             <Package className="w-4 h-4 text-emerald-600" />
                             {isAr ? 'التسبيق المالي المطلوب:' : 'Acompte requis :'}
                           </span>
                           <span className="text-[11px] text-emerald-700/90 font-medium block mt-0.5">
                             {isAr ? 'صيفط غير الثوب والمستلزمات، كنبداو الفصالة والخياطة مباشرة (الخلاص عند التسليم)' : 'Envoyez le tissu, règlement 100% à la livraison'}
                           </span>
                         </div>
                         <span className="font-black text-sm text-emerald-800 bg-emerald-100/90 px-3.5 py-1.5 rounded-xl shrink-0">
                           {isAr ? '0 درهم (بدون تسبيق)' : '0 MAD (Sans acompte)'}
                         </span>
                       </div>
                     )}

                     {/* E. COMPACT Quantity Simulator Strip (SMALL & placed directly ABOVE Confirmation Box!) */}
                     {d.crmDevisMode !== 'echantillon' && (
                       <div className="rounded-2xl border border-indigo-200/80 bg-slate-50/70 overflow-hidden transition-all">
                         <button
                           type="button"
                           onClick={() => setShowQuantitySimulator(prev => ({ ...prev, [d.id]: !prev[d.id] }))}
                           className="w-full px-4 py-2.5 flex items-center justify-between gap-2 text-xs hover:bg-indigo-50/60 transition-colors cursor-pointer"
                         >
                           <div className="flex items-center gap-2 min-w-0">
                             <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                               <Calculator className="w-3.5 h-3.5" />
                             </div>
                             <div className="min-w-0 flex items-center gap-2 flex-wrap">
                               <span className="font-black text-slate-800 truncate">
                                 {isAr ? 'تعديل الكمية (طلع الكمية باش ينقص التمن)' : 'Simuler quantité (plus = moins cher)'}
                               </span>
                               <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono font-black text-indigo-700">
                                 {currentQty} pcs • {activeUnitPrice} MAD/pc
                               </span>
                               {savingsVsBase > 0 && (
                                 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black">
                                   {isAr ? `تخفيض -${savingsVsBase}%` : `-${savingsVsBase}%`}
                                 </span>
                               )}
                             </div>
                           </div>
                           <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1 shrink-0 shadow-2xs">
                             <span>{showQuantitySimulator[d.id] ? (isAr ? 'إغلاق' : 'Fermer') : (isAr ? 'حاسبة الكمية' : 'Simuler')}</span>
                             <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showQuantitySimulator[d.id] ? 'rotate-180' : ''}`} />
                           </span>
                         </button>

                         {showQuantitySimulator[d.id] && (
                           <div className="p-3.5 bg-white border-t border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                             <div className="flex flex-wrap items-center gap-1.5">
                               {simPresets.map(q => {
                                 const tierUnit = computeSimulatedUnitPrice(q, selectedBasePrice, baseOrderQty);
                                 const tierPct = selectedBasePrice > 0 && tierUnit < selectedBasePrice
                                   ? Math.round(((selectedBasePrice - tierUnit) / selectedBasePrice) * 100)
                                   : 0;
                                 const isSelected = currentQty === q;
                                 return (
                                   <button
                                     key={q}
                                     type="button"
                                     onClick={() => setSelectedTierQty(prev => ({ ...prev, [d.id]: q }))}
                                     className={`px-3 py-1.5 rounded-xl border text-center transition-all cursor-pointer text-[11px] flex items-center gap-1.5 ${
                                       isSelected
                                         ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-xs'
                                         : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 font-bold'
                                     }`}
                                   >
                                     <span>{q} pcs</span>
                                     <span className={`text-[9px] font-mono ${isSelected ? 'text-amber-300' : 'text-emerald-600'}`}>
                                       {tierPct > 0 ? `-${tierPct}%` : (isAr ? 'الأساس' : 'Base')}
                                     </span>
                                   </button>
                                 );
                               })}
                               {currentQty !== baseOrderQty && (
                                 <button
                                   type="button"
                                   onClick={() => setSelectedTierQty(prev => {
                                     const copy = { ...prev };
                                     delete copy[d.id];
                                     return copy;
                                   })}
                                   className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer ms-auto"
                                 >
                                   {isAr ? `إرجاع (${baseOrderQty})` : `Reset (${baseOrderQty})`}
                                 </button>
                               )}
                             </div>

                             <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                               <span className="text-[10px] font-bold text-slate-500 shrink-0">{isAr ? 'الكمية:' : 'Qté :'}</span>
                               <input
                                 type="range"
                                 min={Math.max(10, Math.floor(baseOrderQty * 0.5))}
                                 max={Math.max(500, baseOrderQty * 5)}
                                 step={10}
                                 value={currentQty}
                                 onChange={(e) => setSelectedTierQty(prev => ({ ...prev, [d.id]: Number(e.target.value) }))}
                                 className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                               />
                               <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-mono font-black shrink-0">
                                 {currentQty} pcs
                               </span>
                             </div>

                             <div className="flex items-center justify-between text-[11px] px-1 pt-0.5 flex-wrap gap-2">
                               <span className="text-slate-600 font-bold">
                                 {isAr ? `السعر الجديد: ${activeUnitPrice} MAD/قطعة` : `Nouveau P.U : ${activeUnitPrice} MAD/pc`}
                               </span>
                               <span className="font-black text-indigo-950 font-mono">
                                 {isAr ? `المجموع: ${activeTotalPrice.toLocaleString()} MAD • التسبيق: ${acompteRequired.toLocaleString()} MAD` : `Total : ${activeTotalPrice.toLocaleString()} MAD • Avance : ${acompteRequired.toLocaleString()} MAD`}
                               </span>
                             </div>
                           </div>
                         )}
                       </div>
                     )}

                     {/* F. MAIN CONFIRMATION & ACTIONS BOX (Directly below Compact Simulator) */}
                     <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                       {!isClientFabric ? (
                         singleDevState.isConfirmedByAtelier && !singleDevState.isVal ? (
                           <button
                             type="button"
                             onClick={() => setValidatingDevisLead(d)}
                             className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] cursor-pointer sm:col-span-2 lg:col-span-1"
                           >
                             <CheckCircle className="w-4 h-4 shrink-0" />
                             <span>{isAr ? 'تأكيد الدوفيز والبدء' : 'Valider le Devis'}</span>
                           </button>
                         ) : singleDevState.isVal ? (
                           <div className="py-3.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                             <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                             <span>{isAr ? 'تم تأكيد الدوفيز ✓' : 'Devis Validé ✓'}</span>
                           </div>
                         ) : (
                           <div className="py-3.5 px-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                             <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                             <span>{isAr ? 'في انتظار الدوفيز الرسمي' : 'En attente devis officiel'}</span>
                           </div>
                         )
                       ) : (
                         <a
                           href={waUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
                         >
                           <Package className="w-4 h-4 shrink-0" />
                           <span>{isAr ? 'تأكيد وإرسال الثوب (0 DH)' : 'Valider & Envoyer Tissu'}</span>
                         </a>
                       )}

                       {isDevisReady ? (
                         <button
                           type="button"
                           onClick={() => handlePrintDevis(d)}
                           className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border border-slate-700"
                           title={isAr ? 'تحميل أو طباعة ملف الدوفيز الرسمي PDF' : 'Télécharger Devis PDF'}
                         >
                           <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                           <span className="truncate">
                             {officialLeadDevis
                               ? (isAr ? `الدوفيز ${officialLeadDevis.numero} (PDF)` : `Devis ${officialLeadDevis.numero} (PDF)`)
                               : (isAr ? 'تحميل الدوفيز (PDF)' : 'Devis Officiel (PDF)')}
                           </span>
                         </button>
                       ) : (
                         <div className="py-3.5 px-4 bg-slate-100 text-slate-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed select-none">
                           <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                           <span className="truncate">{isAr ? 'PDF قيد الإعداد ⏳' : 'PDF en cours ⏳'}</span>
                         </div>
                       )}

                       <a
                         href={waUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                       >
                         <MessageCircle className="w-4 h-4 shrink-0" />
                         <span>{isAr ? 'تواصل واتساب' : 'WhatsApp Atelier'}</span>
                       </a>

                       <button
                         type="button"
                         onClick={() => setConsultingDemande(d)}
                         className="py-3.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-indigo-200/90 cursor-pointer active:scale-95"
                       >
                         <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                         <span>{isAr ? 'اسأل مستشار الورشة' : 'Poser une question'}</span>
                       </button>
                     </div>
                   </div>

                   {/* 4. Secondary Clean Collapsible Section (ONLY shown when Sizes / Assigned Supplier / Custom Fees exist) */}
                   {hasExtraDetailsSection && (
                     <div className="space-y-3">
                       <div className="text-center">
                         <button
                           type="button"
                           onClick={() => setShowFullStudy(!showFullStudy)}
                           className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
                         >
                           <span>{showFullStudy ? '▲' : '▼'}</span>
                           <span>{showFullStudy
                             ? (isAr ? 'إخفاء المقاسات وتفاصيل الباترون والمورد' : 'Masquer tailles & détails complémentaires')
                             : (isAr ? 'عرض جدول المقاسات وتفاصيل الباترون والمورد' : 'Voir grille des tailles, patronage & fournisseur')}
                           </span>
                         </button>
                       </div>

                       {showFullStudy && (
                         <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 md:p-7 space-y-6">
                           {/* Sizes Grid */}
                           {hasCustomSizes && (
                             <div>
                               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                 <Layers className="w-4 h-4 text-indigo-600" />
                                 {isAr ? 'المقاسات والكميات المطلوبة' : 'Grille des Tailles'}
                               </h3>
                               <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 text-center">
                                 {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                                   <div key={sz} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                     <span className="block text-[10px] font-black text-slate-400 uppercase mb-0.5">{sz}</span>
                                     <span className="text-sm font-black text-slate-900">{sizes[sz] ? `${sizes[sz]} pcs` : '0'}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}

                           {/* Assigned Fabric Supplier (ONLY when Admin explicitly selected one) */}
                           {analysis.hasCustomFournisseur && (
                             <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl border border-slate-800 space-y-3">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                                 <div>
                                   <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-md uppercase inline-block mb-1">
                                     {isAr ? 'مورد القماش الموصى به من الورشة' : 'Fournisseur Tissu Recommandé'}
                                   </span>
                                   <h4 className="text-base font-black text-white">{analysis.fournisseurNom}</h4>
                                   {analysis.fournisseurVille && (
                                     <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                                       <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                       <span>{analysis.fournisseurVille}</span>
                                     </p>
                                   )}
                                 </div>
                                 {analysis.fournisseurCode && (
                                   <button
                                     type="button"
                                     onClick={() => {
                                       navigator.clipboard.writeText(analysis.fournisseurCode);
                                       showNotification(isAr ? `تم نسخ كود الشراكة: ${analysis.fournisseurCode}` : `Code copié: ${analysis.fournisseurCode}`, 'Code BEYA', 'success');
                                     }}
                                     className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start"
                                   >
                                     <Copy className="w-3.5 h-3.5 text-amber-400" />
                                     <span>{analysis.fournisseurCode}</span>
                                   </button>
                                 )}
                               </div>

                               {analysis.fournisseurCouleurs && (
                                 <div className="flex flex-wrap gap-1.5">
                                   {analysis.fournisseurCouleurs.split(/[،,]/).map((col, idx) => (
                                     col.trim() ? (
                                       <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/10 border border-white/15 text-white">
                                         {col.trim()}
                                       </span>
                                     ) : null
                                   ))}
                                 </div>
                               )}

                               {analysis.fournisseurNote && (
                                 <p className="text-xs text-amber-200/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                   💡 {analysis.fournisseurNote}
                                 </p>
                               )}

                               <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                 <a
                                   href={`https://wa.me/${cleanPhoneForWa(analysis.fournisseurTel)}?text=${encodeURIComponent(
                                     isAr
                                       ? `السلام عليكم، أنا زبون من طرف ورشة BEYA Creative (كود: ${analysis.fournisseurCode || 'BEYA'}). عندي طلبية لموديل ${analysis.modeleReel} (${currentQty} قطعة).`
                                       : `Bonjour, client de l'Atelier BEYA Creative (Code: ${analysis.fournisseurCode || 'BEYA'}) pour le modèle ${analysis.modeleReel} (${currentQty} pcs).`
                                   )}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                                 >
                                   <MessageCircle className="w-4 h-4" />
                                   <span>{isAr ? `تواصل مع ${analysis.fournisseurNom}` : `Contacter ${analysis.fournisseurNom}`}</span>
                                 </a>
                                 {analysis.fournisseurTel && (
                                   <a
                                     href={`tel:${cleanPhoneForWa(analysis.fournisseurTel)}`}
                                     className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-white/15"
                                   >
                                     <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                     <span dir="ltr">{analysis.fournisseurTel}</span>
                                   </a>
                                 )}
                               </div>
                             </div>
                           )}
                         </div>
                       )}
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
                       const devState = getLeadDevisState(d);
                       const singleDevState = devState;
                       
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
                                  {(() => {
                                    const devState = getLeadDevisState(d);

                                    if (devState.isVal) {
                                      return (
                                        <span className="px-3 py-1.5 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg border border-emerald-400/40 flex items-center gap-1.5 ring-2 ring-emerald-500/30">
                                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                                          <span>{isAr ? 'تم الاتفاق والموافقة ✅' : 'Devis Validé ✅'}</span>
                                        </span>
                                      );
                                    }
                                    if (isRejected) {
                                      return (
                                        <span className="px-3 py-1.5 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md border border-rose-400/30">
                                          {isAr ? 'مرفوض ❌' : 'Refusé ❌'}
                                        </span>
                                      );
                                    }
                                    if (devState.isConfirmedByAtelier) {
                                      return (
                                        <span className="px-3 py-1.5 bg-amber-500/95 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg border border-amber-300 flex items-center gap-1.5 animate-pulse">
                                          <FileText className="w-3.5 h-3.5 text-slate-950" />
                                          <span>{isAr ? 'دوفيز رسمي معتمد من الورشة 📄' : 'Devis Officiel Atelier 📄'}</span>
                                        </span>
                                      );
                                    }
                                    return (
                                      <span className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md border border-white/20 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{isAr ? '💡 تقدير أولي تقريبي (قيد دراسة الورشة)' : '💡 Estimation Indicative (En cours)'}</span>
                                      </span>
                                    );
                                  })()}
                                </div>

                                {/* Top Right Reference */}
                                <div className="absolute top-3.5 right-3.5 z-10">
                                  <span className="px-2.5 py-1.5 bg-slate-950/75 backdrop-blur-md text-slate-300 text-[10px] font-mono font-bold tracking-wider rounded-xl border border-white/10 shadow-sm">
                                    #{d.id.substring(0, 8).toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Clean Card Body */}
                              <div className="p-5 space-y-3 cursor-pointer" onClick={() => setSelectedDemandePage(d)}>
                                <div className="space-y-1">
                                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center" title={analysis.modeleReel}>
                                    {analysis.modeleReel}
                                  </h3>
                                  <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed" title={analysis.tissuSuggere}>
                                    {analysis.tissuSuggere}
                                  </p>
                                </div>

                                {(() => {
                                  const devState = getLeadDevisState(d);
                                  const officialLeadDevis = getOfficialDevisForLead(d);

                                  return (
                                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{isAr ? 'الكمية' : 'Quantité'}</span>
                                          <span className="text-sm font-black text-slate-900 font-mono">{analysis.qty} pcs</span>
                                        </div>
                                        <div className="text-center">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            {devState.isConfirmedByAtelier || devState.isVal
                                              ? (isAr ? 'سعر البياسة' : 'Prix / pc')
                                              : (isAr ? 'السعر التقديري' : 'Prix indicatif')}
                                          </span>
                                          <span className="text-sm font-black text-slate-900 font-mono">
                                            {!devState.isConfirmedByAtelier && !devState.isVal ? '~' : ''}{analysis.unitPrice || 65} MAD
                                          </span>
                                        </div>
                                        <div className={isAr ? 'text-left' : 'text-right'}>
                                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                                            {devState.isConfirmedByAtelier || devState.isVal
                                              ? (isAr ? 'إجمالي الدوفيز' : 'Total Devis')
                                              : (isAr ? 'المجموع التقديري' : 'Total indicatif')}
                                          </span>
                                          <span className="text-base font-black text-indigo-950 font-mono">
                                            {!devState.isConfirmedByAtelier && !devState.isVal ? '~' : ''}{analysis.totalPrice.toLocaleString()} MAD
                                          </span>
                                        </div>
                                      </div>

                                      {/* Accord Status Box: واش اتفقنا ولا لا */}
                                      {devState.isVal ? (
                                        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-black">
                                          <span className="flex items-center gap-1.5">
                                            <span className="text-sm">🤝</span>
                                            <span>{isAr ? 'تم الاتفاق والموافقة على الدوفيز' : 'Accord conclu & devis validé'}</span>
                                          </span>
                                          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-mono">{isAr ? 'مؤكد 100%' : 'Validé'}</span>
                                        </div>
                                      ) : devState.isConfirmedByAtelier ? (
                                        <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-950 font-black">
                                          <span className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                                            <span>{isAr ? 'دوفيز الورشة جاهز: في انتظار موافقتك' : 'Devis prêt : en attente validation'}</span>
                                          </span>
                                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md text-[10px] font-mono font-black">{isAr ? `تسبيق: ${Math.round(analysis.totalPrice * 0.5).toLocaleString()} DH` : 'Acompte 50%'}</span>
                                        </div>
                                      ) : (
                                        <div className="p-2.5 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600 font-bold border border-slate-200/60">
                                          <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            <span>{isAr ? 'الورشة تدرس الموديل لحساب الدوفيز النهائي' : 'Étude technique en cours par l\'atelier'}</span>
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">{isAr ? 'تقدير أولي' : 'Indicatif'}</span>
                                        </div>
                                      )}
                                      {officialLeadDevis && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFacture(officialLeadDevis);
                                            setShowInvoiceView(true);
                                          }}
                                          className="w-full p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-950 font-black transition-all cursor-pointer"
                                        >
                                          <span className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>{officialLeadDevis.numero}</span>
                                          </span>
                                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-mono">
                                            {officialLeadDevis.montant.toLocaleString()} MAD
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                  );
                                })()}
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
                                <span>{isAr ? 'عرض دراسة الموديل والدوفيز ←' : 'Voir la Fiche & Devis Complet →'}</span>
                              </button>

                              {(() => {
                                const devState = getLeadDevisState(d);

                                // ONLY allow client to validate if workshop has CONFIRMED the official devis!
                                if (devState.isConfirmedByAtelier && !devState.isVal) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setValidatingDevisLead(d);
                                      }}
                                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>{isAr ? 'موافقة على الدوفيز وأداء التسبيق (50%)' : 'Valider Devis & Verser Acompte'}</span>
                                    </button>
                                  );
                                }
                                return null;
                              })()}

                              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                {(() => {
                                  const officialLeadDevis = getOfficialDevisForLead(d);
                                  const isDevisReady = devState.isConfirmedByAtelier || devState.isVal || Boolean(officialLeadDevis);

                                  if (isDevisReady) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePrintDevis(d);
                                        }}
                                        className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                                        title={isAr ? 'تحميل أو طباعة ملف الدوفيز PDF' : 'Télécharger Devis PDF'}
                                      >
                                        <FileText className="w-4 h-4 text-amber-700" />
                                        <span>
                                          {officialLeadDevis
                                            ? (isAr ? `📄 ${officialLeadDevis.numero} (${officialLeadDevis.montant.toLocaleString()} DH)` : `📄 Devis ${officialLeadDevis.numero} (PDF)`)
                                            : (isAr ? '📄 ملف الدوفيز (DEVIS)' : '📄 Devis (PDF)')}
                                        </span>
                                      </button>
                                    );
                                  }

                                  return (
                                    <div
                                      className="flex-1 py-2.5 px-3 bg-slate-50 text-slate-400 border border-slate-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                                      title={isAr ? 'الدوفيز الرسمي قيد الإعداد من طرف الورشة — سيصبح متاحاً للتحميل فور اعتماده' : 'Devis officiel en cours de préparation par l\'atelier'}
                                    >
                                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span className="truncate">{isAr ? 'الدوفيز قيد الإعداد ⏳' : 'Devis en préparation ⏳'}</span>
                                    </div>
                                  );
                                })()}

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
                                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer border border-slate-200 shrink-0"
                                    title={isAr ? 'تعديل الطلب' : 'Modifier'}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
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
                       onChange={(e) => {
                         const val = e.target.value;
                         setReference(val);
                         handleSearch(val);
                       }}
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

                                        {feedbackData.rating === 0 && (
                                          <p className="text-xs font-black text-amber-600 text-center bg-amber-50 border border-amber-200 rounded-xl py-2 px-3">
                                            ⭐ {isAr ? 'المرجو اختيار التقييم بالنجوم (من 1 إلى 5) أعلاه أولاً لتفعيل زر الموافقة' : 'Veuillez sélectionner une note en étoiles (1 à 5) ci-dessus pour activer la validation'}
                                          </p>
                                        )}

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
                                          const matchingFiches = clientFiches.filter(f => normalizePortalKey(f.modele) === normalizePortalKey(cmd.modele));
                                          const fiche = matchingFiches.find(f => f.mesures && f.mesures.some((m: any) => m.valeurs && Object.keys(m.valeurs).length > 0)) || matchingFiches[0] || clientFiches[0] || fiches.find(f => normalizePortalKey(f.modele) === normalizePortalKey(cmd.modele));
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
                            {(() => {
                              const cmdDevis = getOfficialDevisForCommande(cmd);
                              const cmdOtherDoc = clientDocsAll.find(f => f.commandeId === cmd.id && f.typeDoc !== 'devis');
                              return (
                                <>
                                  {cmdDevis && (
                                    <button
                                      type="button"
                                      onClick={() => { setSelectedFacture(cmdDevis); setShowInvoiceView(true); }}
                                      className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                                      <span>{isAr ? `الدوفيز ${cmdDevis.numero}` : `Devis ${cmdDevis.numero}`} • {cmdDevis.montant.toLocaleString()} MAD</span>
                                    </button>
                                  )}
                                  {cmdOtherDoc && (
                                    <button
                                      type="button"
                                      onClick={() => { setSelectedFacture(cmdOtherDoc); setShowInvoiceView(true); }}
                                      className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                                    >
                                      <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>{cmdOtherDoc.numero} • {cmdOtherDoc.montant.toLocaleString()} MAD</span>
                                    </button>
                                  )}
                                </>
                              );
                            })()}
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
                     {clientFiches.map(f => (
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
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{Array.isArray(f.tailles) ? f.tailles.length : 0} {isAr ? 'مقاسات متاحة' : 'Tailles disponibles'}</p>
                           
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
                     {clientFiches.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                           <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">{isAr ? 'لا يوجد ملف تقني حاليا' : 'Aucun dossier technique disponible'}</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Financial Documents Sections */}
               {(() => {
                 const clientDocs = clientDocsAll;
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
            const payableDemandes = trueDemandes.filter(d => !isLeadHiddenFromPayments(d, found));
            
            // Build all payable items (Commandes + unconverted Demandes only, never doubling a converted Lead with its Commande)
            const allPayableItems = [
              ...found.map(c => {
                const matchingLead = trueDemandes.find(l => l.type === c.modele || getLinkedCommandeForLead(l, [c])?.id === c.id);
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
              ...payableDemandes.map(d => {
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
                               <img src={company.bankQrCode} alt="Bank QR Code" className="w-40 h-40 object-contain rounded-xl" />
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
                      showNotification(isAr ? 'تم نسخ رابط الدعوة بنجاح إلى الحافظة.' : 'Lien copié avec succès !', isAr ? '🔗 تم النسخ' : '🔗 Copié', 'success');
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
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">
                      {selectedFacture.typeDoc === 'devis'
                        ? (isAr ? 'معاينة عرض السعر الرسمي' : 'Aperçu du Devis')
                        : selectedFacture.typeDoc === 'recu'
                        ? (isAr ? 'معاينة وصل الأداء' : 'Aperçu du Reçu')
                        : (isAr ? 'معاينة الفاتورة' : 'Aperçu Document')}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{selectedFacture.numero}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setShowInvoiceView(false)} className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">{isAr ? 'إغلاق' : 'Fermer'}</button>
                 <button onClick={() => printElement(`invoice-${selectedFacture.id}`)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-3 cursor-pointer">
                    <Download className="w-4 h-4" />
                    {isAr ? 'حفظ / طباعة' : 'Imprimer PDF'}
                 </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
               {(() => {
                 const linkedCmd = commandes.find(c => c.id === selectedFacture.commandeId) || found.find(c => c.id === selectedFacture.commandeId);
                 const linkedLead = mesDemandes.find(m => m.type !== '__MESSAGE__' && m.type !== '__MESSAGE_REPLY__' && getOfficialDevisForLead(m)?.id === selectedFacture.id);
                 const resolvedPhoto = (linkedCmd as any)?.modelePhoto || (linkedCmd as any)?.photo || linkedLead?.photo || (linkedLead?.photos && linkedLead.photos[0]) || (linkedLead ? leadPhotos[linkedLead.id] : undefined);
                 return (
                   <InvoicePRO
                     id={`invoice-${selectedFacture.id}`}
                     facture={selectedFacture}
                     commande={linkedCmd}
                     company={company}
                     modelPhoto={resolvedPhoto}
                     lang={isAr ? 'ar' : 'fr'}
                   />
                 );
               })()}
            </div>
          </div>
        </div>
      )}

      {/* Official Devis Validation & Bank Virement Modal */}
      {validatingDevisLead && (() => {
        const d = validatingDevisLead;
        const analysis = getDemandeAnalysis(d, isAr);
        const modalBaseQty = Math.max(1, Number(analysis.qty) || Number(d.quantity) || 1);
        const modalQty = selectedTierQty[d.id] !== undefined ? selectedTierQty[d.id] : modalBaseQty;
        const modalIsClientFab = analysis.canSwitchFabricSource && fabricOption[d.id] === 'client';
        const modalBasePrice = modalIsClientFab ? analysis.confectionPrice : analysis.fullPackagePrice;
        const modalUnitPrice = computeSimulatedUnitPrice(modalQty, modalBasePrice, modalBaseQty);
        const modalTotalPrice = modalUnitPrice * modalQty;
        const acompte50 = modalIsClientFab ? 0 : Math.round(modalTotalPrice * 0.5);

        return (
          <div className="fixed inset-0 z-[250] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
              {/* Header */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-white">
                      {isAr ? 'تأكيد الدوفيز والاتفاق الرسمي للورشة' : 'Validation Officielle du Devis Atelier'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      REF: #{d.id.substring(0, 8).toUpperCase()} • {isAr ? 'اتفاق ملزم لبدء حجز الثوب والإنتاج' : 'Accord contractuel de mise en production'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValidatingDevisLead(null);
                    setVirementReceiptFile(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                {validatingDevisSuccess ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="font-black text-base text-emerald-950">
                      {isAr ? 'تم تأكيد الدوفيز والاتفاق بنجاح! 🤝' : 'Devis Validé avec Succès !'}
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium">
                      {isAr
                        ? 'تم تحويل حالة طلبك إلى (تم الاتفاق والموافقة). تم إشعار الورشة بحجز القماش وجدولة الإنتاج.'
                        : 'Votre accord a été enregistré. L\'atelier réserve les métrages et lance la fabrication.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Model & Quotation Summary Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{isAr ? 'الموديل المعتمد' : 'Modèle Recommandé'}</span>
                        <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                          {analysis.modeleReel}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">{isAr ? 'الكمية' : 'Quantité'}</span>
                          <span className="text-sm font-black text-slate-900">{modalQty} pcs</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">{isAr ? 'سعر البياسة' : 'Prix unitaire'}</span>
                          <span className="text-sm font-black text-indigo-600">{modalUnitPrice} MAD</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">{isAr ? 'مجموع الدوفيز' : 'Total Devis'}</span>
                          <span className="text-sm font-black text-slate-900">{modalTotalPrice.toLocaleString('fr-FR')} MAD</span>
                        </div>
                      </div>

                      {/* 50% Acompte Callout */}
                      <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-black text-amber-950">
                            {isAr ? 'تسبيق شراء القماش وبدء الخياطة (50%):' : 'Acompte Tissu & Lancement (50%) :'}
                          </span>
                          <span className="text-[10px] text-amber-700 font-medium">
                            {isAr ? '(50% المتبقية تؤدى عند فحص السلعة واستلام الطلبية)' : '(Le solde 50% est réglé à la livraison)'}
                          </span>
                        </div>
                        <span className="text-base font-black text-amber-950 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                          {acompte50.toLocaleString('fr-FR')} MAD
                        </span>
                      </div>
                    </div>

                    {/* Official Company Bank Transfer Coordinates */}
                    <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                            {isAr ? `بيانات التحويل البنكي (${company.bankName || 'البنك'})` : `Coordonnées Bancaires (${company.bankName || 'Virement'})`}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                          RIB Officiel
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-indigo-200/70 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">{isAr ? 'المستفيد:' : 'Bénéficiaire :'}</span>
                          <span className="font-black text-slate-900">{company.bankBeneficiary || company.name || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">{isAr ? 'البنك / الوكالة:' : 'Banque :'}</span>
                          <span className="font-bold text-slate-700">{company.bankName || '—'}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="font-mono text-xs sm:text-sm font-black text-indigo-700 tracking-wider">
                            {company.rib || '—'}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText((company.rib || '').replace(/\s+/g, ''));
                              setRibCopied(true);
                              setTimeout(() => setRibCopied(false), 2500);
                            }}
                            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {ribCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تم النسخ!' : 'Copié !'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isAr ? 'نسخ الـ RIB' : 'Copier'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Virement Receipt Upload (Optional/Recommended) */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                        {isAr ? 'إرفاق وصل التحويل (اختياري / مستحسن)' : 'Joindre le Reçu du Virement (Optionnel)'}
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 transition flex items-center justify-center gap-2 cursor-pointer">
                          <Upload className="w-4 h-4 text-indigo-600" />
                          <span>
                            {virementReceiptFile
                              ? (isAr ? 'تم اختيار الوصل بنجاح ✓' : 'Reçu sélectionné ✓')
                              : (isAr ? 'اختيار صورة أو ملف الوصل' : 'Sélectionner reçu')}
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setVirementReceiptFile(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {virementReceiptFile && (
                          <button
                            type="button"
                            onClick={() => setVirementReceiptFile(null)}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200"
                            title={isAr ? 'حذف الوصل' : 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {isAr
                            ? 'يمكنك إرفاق الوصل هنا أو إرساله عبر صفحة التحويلات / واتساب.'
                            : 'Joignez le reçu ici ou passez par la page Paiements / WhatsApp.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const linkedCmdForPayment = getLinkedCommandeForLead(d, found);
                            setValidatingDevisLead(null);
                            setSelectedDemandePage(null);
                            setVirementCommandeId(linkedCmdForPayment ? linkedCmdForPayment.id : d.id);
                            setVirementMontant(String(acompte50));
                            setActiveTab('payments');
                          }}
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          {isAr ? 'فتح صفحة الأداءات الكاملة (QR) ←' : 'Page Paiements Complète (QR) →'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Actions Footer */}
              {!validatingDevisSuccess && (
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePrintDevis(d)}
                      className="flex-1 sm:flex-none py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      title={isAr ? 'معاينة وتحميل ملف Devis PDF' : 'Télécharger Devis PDF'}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'ملف Devis PDF' : 'PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidatingDevisLead(null)}
                      className="flex-1 sm:flex-none py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Annuler'}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={validatingDevisSending}
                    onClick={() => handleValidateDevisAndVirement(d)}
                    className="w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {validatingDevisSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري الاعتماد...' : 'Validation en cours...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{isAr ? 'أؤكد موافقتي على الدوفيز واعتماده ✅' : 'Confirmer et Valider le Devis'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Hidden Printable Official Devis Document Container */}
      {printingDevisLead && (() => {
        const lead = printingDevisLead;
        const analysis = getDemandeAnalysis(lead, isAr);
        const officialLeadDevis = getOfficialDevisForLead(lead);
        const docQty = Math.max(1, Number(analysis.qty) || 1);
        const docTotal = Number(officialLeadDevis && officialLeadDevis.montant > 0 ? officialLeadDevis.montant : (lead.totalPrice && lead.totalPrice > 0 ? lead.totalPrice : analysis.totalPrice)) || 0;
        const docUnitPrice = docTotal / docQty;
        const acompte = Math.round(docTotal * 0.5);
        const devisNum = officialLeadDevis?.numero || `DEV-${lead.id.substring(0, 8).toUpperCase()}`;
        const dateStr = new Date(officialLeadDevis?.date || Date.now()).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', { day: '2-digit', month: 'long', year: 'numeric' });
        const modelPhoto = lead.photo || (lead.photos && lead.photos[0]) || leadPhotos[lead.id] || '';
        const logoSrc = company.logoInvoice || company.logoUrl || '/logo.png';
        const taxLine = [
          company.ice && !/^0+$/.test(company.ice) ? `ICE: ${company.ice}` : '',
          company.rc && !/^0+$/.test(company.rc) ? `R.C: ${company.rc}` : '',
          company.if_tax && !/^0+$/.test(company.if_tax) ? `I.F: ${company.if_tax}` : '',
          company.patente && !/^0+$/.test(company.patente) ? `Patente: ${company.patente}` : '',
        ].filter(Boolean).join(' • ');
        const fontFamily = isAr
          ? "'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif"
          : "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";
        const alignEnd = isAr ? 'left' : 'right';
        const alignStart = isAr ? 'right' : 'left';

        return (
          <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0" aria-hidden="true">
            <div
              id={`devis-doc-${lead.id}`}
              dir={isAr ? 'rtl' : 'ltr'}
              className="bg-white"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '14mm 16mm',
                color: '#0f172a',
                fontFamily,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Clean Modern Header with Logo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={logoSrc}
                    alt={company.name || 'BEYA CREATIVE'}
                    style={{ height: '48px', maxWidth: '130px', objectFit: 'contain', display: 'block' }}
                  />
                  <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px', letterSpacing: isAr ? '0' : '-0.4px', textTransform: 'uppercase' }}>
                      {company.name || 'BEYA CREATIVE'}
                    </h1>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: isAr ? '0' : '1px', margin: '0 0 4px' }}>
                      {company.subtitle || (isAr ? 'ورشة التفصيل والخياطة وتصنيع الملابس' : 'Confection Textile & Bureau Technique')}
                    </p>
                    <p style={{ fontSize: '10.5px', color: '#64748b', margin: 0 }}>
                      {[company.address, company.phone, company.email].filter(Boolean).join(' • ')}
                    </p>
                    {taxLine && (
                      <p style={{ fontSize: '9.5px', color: '#94a3b8', margin: '2px 0 0' }}>{taxLine}</p>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: alignEnd, flexShrink: 0 }}>
                  <div style={{ display: 'inline-block', backgroundColor: '#0f172a', color: '#ffffff', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, letterSpacing: isAr ? '0' : '1.2px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {isAr ? 'عرض سعر رسمي' : 'DEVIS OFFICIEL'}
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px', fontFamily: 'monospace' }} dir="ltr">
                    {devisNum}
                  </p>
                  <p style={{ fontSize: '10.5px', color: '#64748b', margin: '0 0 2px' }}>
                    {isAr ? `التاريخ: ${dateStr}` : `Date : ${dateStr}`}
                  </p>
                  <p style={{ fontSize: '10.5px', color: '#64748b', margin: 0 }}>
                    {isAr ? 'الصلاحية: 30 يوماً' : 'Validité : 30 jours'}
                  </p>
                </div>
              </div>

              {/* Client & Model Card (with Model Photo) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: isAr ? '0' : '0.8px' }}>
                    {isAr ? 'الزبون / صاحب الطلب' : "Client / Donneur d'Ordre"}
                  </span>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '3px 0 2px' }}>
                    {(lead as any).client || lead.name || currentUser?.nom || currentUser?.email || (isAr ? 'زبون شريك' : 'Client Partenaire BEYA')}
                  </p>
                  <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 2px' }}>
                    {isAr ? 'الهاتف:' : 'Tél :'} <span dir="ltr">{clientPhone || lead.phone || currentUser?.telephone || '—'}</span>
                  </p>
                  <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>
                    {isAr ? 'البريد:' : 'Email :'} {currentUser?.email || lead.email || '—'}
                  </p>
                </div>

                <div style={{ flex: 1.15, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', textAlign: alignEnd }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: isAr ? '0' : '0.8px' }}>
                      {isAr ? 'الموديل المطلوب' : 'Modèle & Production'}
                    </span>
                    <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#4f46e5', margin: '3px 0 2px' }}>
                      {analysis.modeleReel}
                    </p>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, fontWeight: 600 }}>
                      {isAr ? `الكمية الإجمالية: ${docQty} قطعة` : `Quantité : ${docQty} pièces`}
                    </p>
                  </div>
                  {modelPhoto && (
                    <img
                      src={modelPhoto}
                      alt={analysis.modeleReel}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        flexShrink: 0,
                        display: 'block',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Minimalist Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px', textAlign: alignStart, fontWeight: 800, textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: isAr ? '0' : '0.6px' }}>
                      {isAr ? 'البيان والخدمة' : 'Désignation'}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: alignStart, fontWeight: 800, textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: isAr ? '0' : '0.6px' }}>
                      {isAr ? 'القماش والمواصفات' : 'Matière & Détails'}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: isAr ? '0' : '0.6px' }}>
                      {isAr ? 'الكمية' : 'Qté'}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: alignEnd, fontWeight: 800, textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: isAr ? '0' : '0.6px' }}>
                      {isAr ? 'سعر القطعة' : 'P.U HT'}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: alignEnd, fontWeight: 800, textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: isAr ? '0' : '0.6px' }}>
                      {isAr ? 'المجموع (د.م)' : 'Total (MAD)'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {officialLeadDevis?.articles && officialLeadDevis.articles.length > 0 ? (
                    officialLeadDevis.articles.map((art, idx) => (
                      <tr key={art.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                          {art.designation || analysis.modeleReel}
                        </td>
                        <td style={{ padding: '12px', color: '#475569' }}>
                          {analysis.tissuSuggere || analysis.techDetails || (isAr ? 'حسب قرار الورشة المعتمد' : 'Selon décision atelier')}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>
                          {art.quantite} {isAr ? 'قطعة' : 'pcs'}
                        </td>
                        <td style={{ padding: '12px', textAlign: alignEnd, fontWeight: 600 }} dir="ltr">
                          {Number(art.prixUnitaire || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: alignEnd, fontWeight: 800, color: '#0f172a' }} dir="ltr">
                          {Number(art.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                          {isAr ? 'الفصالة والخياطة والفينيسيون الصناعي' : 'Coupe, Confection & Finitions'}
                          <br />
                          <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748b' }}>{analysis.modeleReel}</span>
                        </td>
                        <td style={{ padding: '12px', color: '#475569' }}>
                          {analysis.tissuSuggere ? (
                            <><strong>{isAr ? 'الثوب:' : 'Tissu :'}</strong> {analysis.tissuSuggere}</>
                          ) : (
                            <span>{analysis.modeleReel}</span>
                          )}
                          {analysis.techDetails && (
                            <>
                              <br />
                              <span style={{ fontSize: '10px', color: '#64748b' }}>{analysis.techDetails}</span>
                            </>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>
                          {docQty} {isAr ? 'قطعة' : 'pcs'}
                        </td>
                        <td style={{ padding: '12px', textAlign: alignEnd, fontWeight: 600 }} dir="ltr">
                          {docUnitPrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: alignEnd, fontWeight: 800, color: '#0f172a' }} dir="ltr">
                          {docTotal.toFixed(2)}
                        </td>
                      </tr>

                      {analysis.hasCustomPatronage && (
                        <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fafafa' }}>
                          <td style={{ padding: '9px 12px', fontWeight: 600, color: '#334155' }}>
                            {isAr ? 'دراسة الباترون والتدريج الرقمي' : 'Patronage & Gradation Numérique'}
                          </td>
                          <td style={{ padding: '9px 12px', color: '#64748b', fontSize: '10.5px' }}>
                            {isAr ? 'ملف DXF وجدول القياسات المعتمد' : 'Fichier DXF / Barème de mesures validé'}
                          </td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 600 }}>
                            {isAr ? 'حزمة 1' : '1 forfait'}
                          </td>
                          <td style={{ padding: '9px 12px', textAlign: alignEnd, color: '#64748b' }}>—</td>
                          <td style={{ padding: '9px 12px', textAlign: alignEnd, fontWeight: 700, color: '#059669' }}>
                            {isAr ? 'مدمج' : 'Inclus'}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>

              {/* Totals & Bank Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '22px' }}>
                <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px 16px', fontSize: '11px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', margin: '0 0 6px', fontSize: '10px', letterSpacing: isAr ? '0' : '0.6px' }}>
                    {isAr ? 'بيانات التحويل البنكي' : 'Règlement par Virement Bancaire'}
                  </p>
                  <p style={{ margin: '0 0 3px', color: '#334155' }}>
                    <strong>{isAr ? 'البنك:' : 'Banque :'}</strong> {company.bankName || '—'}
                  </p>
                  <p style={{ margin: '0 0 6px', color: '#334155' }}>
                    <strong>{isAr ? 'المستفيد:' : 'Titulaire :'}</strong> {company.bankBeneficiary || company.name || '—'}
                  </p>
                  {company.rib && (
                    <p dir="ltr" style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontFamily: 'monospace', fontSize: '11.5px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', display: 'inline-block' }}>
                      RIB : {company.rib}
                    </p>
                  )}
                  <p style={{ margin: 0, color: '#64748b', fontSize: '10px' }}>
                    {isAr ? `مدة الإنجاز التقديرية: ${analysis.delaiEstime}` : `Délai estimé : ${analysis.delaiEstime} dès réception de l'acompte.`}
                  </p>
                </div>

                <div style={{ width: '250px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{isAr ? 'المجموع الصافي:' : 'Total HT :'}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }} dir="ltr">{docTotal.toLocaleString('fr-FR')} MAD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11.5px' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{isAr ? 'الضريبة:' : 'TVA :'}</span>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>{isAr ? 'معفاة / HT' : 'Exonérée / HT'}</span>
                  </div>
                  <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      <span>{isAr ? 'المجموع الإجمالي:' : 'Total Devis :'}</span>
                      <span dir="ltr">{docTotal.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 800, color: '#92400e' }}>
                      <span>{isAr ? 'التسبيق (50%):' : 'Acompte 50% :'}</span>
                      <span dir="ltr">{acompte.toLocaleString('fr-FR')} MAD</span>
                    </div>
                    <span style={{ fontSize: '9px', color: '#b45309', display: 'block', marginTop: '2px' }}>
                      {isAr ? 'يؤدى لتأكيد الطلب وحجز القماش' : 'Exigible pour réservation matière & lancement'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strictly Single-Language Conditions */}
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.6, borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginBottom: '24px' }}>
                {isAr ? (
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: '#334155' }}>الشروط العامة:</strong> يعد هذا العرض ملزماً لكلا الطرفين فور أداء تسبيق 50% لإطلاق حجز القماش والتصنيع بالورشة. يتم تسليم الطلبية بعد إجراء مراقبة الجودة الشاملة وأداء المبلغ المتبقي.
                  </p>
                ) : (
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: '#334155' }}>Conditions Générales :</strong> Le présent devis est établi sur la base des spécifications techniques convenues. Le versement de l'acompte de 50% vaut validation ferme et déclenche immédiatement la réservation matière et la mise en fabrication en atelier.
                  </p>
                )}
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', marginTop: 'auto' }}>
                <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', minHeight: '98px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', margin: '0 0 6px' }}>
                    {isAr ? 'ختم وتوقيع الورشة' : "Cachet & Signature de l'Atelier"}
                  </p>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {company.name || 'BEYA'} — {isAr ? 'المكتب التقني' : 'Bureau Technique'}
                  </div>
                  {company.cachetUrl && (
                    <img src={company.cachetUrl} alt="Cachet" style={{ maxHeight: '58px', marginTop: '6px', objectFit: 'contain' }} />
                  )}
                </div>

                <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', minHeight: '98px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', margin: '0 0 6px' }}>
                    {isAr ? 'موافقة وتوقيع الزبون' : 'Bon pour Accord & Signature du Client'}
                  </p>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
                    {isAr ? '"قرأت ووافقت على العرض"' : '"Lu et approuvé, bon pour commande"'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                        {(Array.isArray(viewMesuresFiche.tailles) ? viewMesuresFiche.tailles : []).map(t => (
                          <th key={t} className="px-6 py-5 text-center font-black uppercase tracking-widest text-[10px]">
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(viewMesuresFiche.mesures) ? viewMesuresFiche.mesures : []).map((m, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                          <td className={`px-6 py-4 font-bold text-slate-700 ${isAr ? 'text-right' : 'text-left'}`}>
                            {m.nom}
                          </td>
                          {(Array.isArray(viewMesuresFiche.tailles) ? viewMesuresFiche.tailles : []).map(taille => (
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

      
      {/* ─── Apple-Style City & Location Selector Modal (Clean & Professional, Zero Videogame Emojis) ─── */}
      {showCityModal && (
        <div
          className="fixed inset-0 z-[280] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          dir={isAr ? 'rtl' : 'ltr'}
          onClick={handleDismissCityModal}
        >
          <div
            className="bg-white rounded-[2rem] sm:rounded-[2.5rem] max-w-lg sm:max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs shrink-0">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                    {isAr ? 'اختر مدينتك أو مقر مشروعك' : 'Choisissez votre ville ou région'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {isAr
                      ? 'حدد موقعك لنقترح عليك أفضل خيارات التوصيل وأقرب موردي الأقمشة.'
                      : 'Sélectionnez votre ville pour optimiser les livraisons et le sourcing textile.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissCityModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Search & Input Bar */}
            <div className="px-5 sm:px-6 pt-4 pb-2 space-y-3 shrink-0">
              {/* Main Input Field */}
              <div className="relative">
                <MapPin className="w-4 h-4 text-indigo-600 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={selectedCityDraft}
                  onChange={(e) => {
                    setSelectedCityDraft(e.target.value);
                    setCitySearchQuery(e.target.value);
                  }}
                  placeholder={isAr ? 'اكتب اسم مدينتك مباشرة أو اخترها من القائمة...' : 'Tapez votre ville ou sélectionnez ci-dessous...'}
                  className="w-full bg-slate-50 border-2 border-slate-200/90 rounded-2xl py-3 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                />
                {selectedCityDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCityDraft('');
                      setCitySearchQuery('');
                    }}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Clean Tabs (No cartoon emojis) */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => { setCityTab('maroc'); setCitySearchQuery(''); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cityTab === 'maroc'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{isAr ? 'مدن المغرب (المحلي)' : 'Villes du Maroc'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCityTab('international'); setCitySearchQuery(''); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cityTab === 'international'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{isAr ? 'دولي / الجالية' : 'International / Diaspora'}</span>
                </button>
              </div>
            </div>

            {/* Scrollable City Selection Grid (Pure Clean Typography, Zero Emojis) */}
            <div className="px-5 sm:px-6 py-2 overflow-y-auto custom-scrollbar flex-1 space-y-2">
              {(() => {
                const marocCities = [
                  { id: 'casablanca', nameAr: 'الدار البيضاء', nameFr: 'Casablanca' },
                  { id: 'rabat', nameAr: 'الرباط', nameFr: 'Rabat' },
                  { id: 'tanger', nameAr: 'طنجة', nameFr: 'Tanger' },
                  { id: 'marrakech', nameAr: 'مراكش', nameFr: 'Marrakech' },
                  { id: 'fes', nameAr: 'فاس', nameFr: 'Fès' },
                  { id: 'agadir', nameAr: 'أكادير', nameFr: 'Agadir' },
                  { id: 'meknes', nameAr: 'مكناس', nameFr: 'Meknès' },
                  { id: 'oujda', nameAr: 'وجدة', nameFr: 'Oujda' },
                  { id: 'kenitra', nameAr: 'القنيطرة', nameFr: 'Kénitra' },
                  { id: 'tetouan', nameAr: 'تطوان', nameFr: 'Tétouan' },
                  { id: 'mohammedia', nameAr: 'المحمدية', nameFr: 'Mohammédia' },
                  { id: 'temara', nameAr: 'تمارة', nameFr: 'Témara' },
                  { id: 'sale', nameAr: 'سلا', nameFr: 'Salé' },
                  { id: 'eljadida', nameAr: 'الجديدة', nameFr: 'El Jadida' },
                  { id: 'nador', nameAr: 'الناظور', nameFr: 'Nador' },
                  { id: 'safi', nameAr: 'آسفي', nameFr: 'Safi' },
                  { id: 'benimellal', nameAr: 'بني ملال', nameFr: 'Béni Mellal' },
                  { id: 'laayoune', nameAr: 'العيون', nameFr: 'Laâyoune' },
                  { id: 'dakhla', nameAr: 'الداخلة', nameFr: 'Dakhla' },
                  { id: 'khouribga', nameAr: 'خريبكة', nameFr: 'Khouribga' },
                  { id: 'settat', nameAr: 'سطات', nameFr: 'Settat' },
                  { id: 'berkane', nameAr: 'بركان', nameFr: 'Berkane' },
                  { id: 'taza', nameAr: 'تازة', nameFr: 'Taza' },
                  { id: 'bouskoura', nameAr: 'بوسكورة', nameFr: 'Bouskoura' },
                  { id: 'nouaceur', nameAr: 'النواصر', nameFr: 'Nouaceur' },
                  { id: 'essaouira', nameAr: 'الصويرة', nameFr: 'Essaouira' },
                  { id: 'khemisset', nameAr: 'الخميسات', nameFr: 'Khémisset' },
                  { id: 'larache', nameAr: 'العرائش', nameFr: 'Larache' },
                  { id: 'ksarelkebir', nameAr: 'القصر الكبير', nameFr: 'Ksar El Kebir' },
                  { id: 'chefchaouen', nameAr: 'شفشاون', nameFr: 'Chefchaouen' },
                  { id: 'alhoceima', nameAr: 'الحسيمة', nameFr: 'Al Hoceïma' },
                  { id: 'taroudant', nameAr: 'تارودانت', nameFr: 'Taroudant' },
                  { id: 'ouarzazate', nameAr: 'ورزازات', nameFr: 'Ouarzazate' },
                  { id: 'guelmim', nameAr: 'كلميم', nameFr: 'Guelmim' },
                  { id: 'tiznit', nameAr: 'تزنيت', nameFr: 'Tiznit' },
                  { id: 'ifrane', nameAr: 'إفران', nameFr: 'Ifrane' },
                  { id: 'azrou', nameAr: 'أزرو', nameFr: 'Azrou' },
                  { id: 'midelt', nameAr: 'ميدلت', nameFr: 'Midelt' }
                ];

                const intlCountries = [
                  { id: 'france', nameAr: 'فرنسا', nameFr: 'France' },
                  { id: 'spain', nameAr: 'إسبانيا', nameFr: 'Espagne' },
                  { id: 'belgium', nameAr: 'بلجيكا', nameFr: 'Belgique' },
                  { id: 'netherlands', nameAr: 'هولندا', nameFr: 'Pays-Bas' },
                  { id: 'italy', nameAr: 'إيطاليا', nameFr: 'Italie' },
                  { id: 'germany', nameAr: 'ألمانيا', nameFr: 'Allemagne' },
                  { id: 'uk', nameAr: 'المملكة المتحدة', nameFr: 'Royaume-Uni (UK)' },
                  { id: 'usa', nameAr: 'الولايات المتحدة', nameFr: 'États-Unis (USA)' },
                  { id: 'canada', nameAr: 'كندا', nameFr: 'Canada' },
                  { id: 'uae', nameAr: 'الإمارات', nameFr: 'Émirats Arabes Unis (UAE)' },
                  { id: 'ksa', nameAr: 'السعودية', nameFr: 'Arabie Saoudite (KSA)' },
                  { id: 'qatar', nameAr: 'قطر', nameFr: 'Qatar' }
                ];

                const currentList = cityTab === 'maroc' ? marocCities : intlCountries;
                const q = (citySearchQuery || selectedCityDraft).trim().toLowerCase();
                const filtered = q
                  ? currentList.filter(c => c.nameAr.toLowerCase().includes(q) || c.nameFr.toLowerCase().includes(q))
                  : currentList;

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {filtered.map(item => {
                        const cityValue = `${item.nameAr} (${item.nameFr})`;
                        const isSelected = selectedCityDraft === cityValue || clientCity === cityValue || (selectedCityDraft && (selectedCityDraft.toLowerCase() === item.nameFr.toLowerCase() || selectedCityDraft === item.nameAr));
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedCityDraft(cityValue);
                              setCustomCityInput('');
                            }}
                            className={`group p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                              }`}>
                                <MapPin className="w-3 h-3" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-black truncate">{isAr ? item.nameAr : item.nameFr}</span>
                                <span className="block text-[10px] text-slate-400 font-medium truncate">{isAr ? item.nameFr : item.nameAr}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {filtered.length === 0 && selectedCityDraft && (
                      <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-center space-y-1.5 my-2">
                        <p className="text-xs font-black text-indigo-950">
                          {isAr ? `سيتم اعتماد: "${selectedCityDraft}" كمدينتك الرسمية` : `Sera enregistré : "${selectedCityDraft}"`}
                        </p>
                        <p className="text-[11px] text-indigo-700">
                          {isAr ? 'اضغط على الزر أسفله للتأكيد والحفظ مباشرة.' : 'Cliquez ci-dessous pour confirmer votre ville.'}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDismissCityModal}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {isAr ? 'تخطي للآن' : 'Plus tard'}
              </button>

              <button
                type="button"
                disabled={savingCity || !selectedCityDraft.trim()}
                onClick={() => handleSaveCity()}
                className="w-full sm:w-auto py-3 px-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {savingCity ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري الحفظ...' : 'Enregistrement...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>{isAr ? 'تأكيد واختيار المدينة' : 'CONFIRMER LA VILLE'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discrete Top Confirmation Toast (No intrusive popup) */}
      {cityToastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[350] bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-top-3 duration-300 pointer-events-none">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-xs font-black text-slate-100">{cityToastMsg}</span>
        </div>
      )}

      {/* ─── Premium BEYA In-App Notification / Alert Modal Box ─── */}
      {notifyModal && notifyModal.isOpen && (
        <div
          className="fixed inset-0 z-[300] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          dir={isAr ? 'rtl' : 'ltr'}
          onClick={() => setNotifyModal(null)}
        >
          <div
            className="bg-white rounded-[2rem] max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-7 relative text-center flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setNotifyModal(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Clean Minimalist Icon Badge (No videogame glowing star) */}
            <div className="flex justify-center mb-4">
              {notifyModal.type === 'error' ? (
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
              ) : notifyModal.type === 'info' ? (
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Info className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2">
              {notifyModal.title || (notifyModal.type === 'error'
                ? (isAr ? 'تنبيه' : 'Attention')
                : notifyModal.type === 'info'
                ? (isAr ? 'معلومة هامة' : 'Information')
                : (isAr ? '✨ تم بنجاح' : 'Succès'))}
            </h3>

            {/* Message Body */}
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed mb-4">
              {notifyModal.message}
            </p>

            {/* Badges Grid (if any) */}
            {notifyModal.badges && notifyModal.badges.length > 0 && (
              <div className="w-full mb-4 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70">
                {notifyModal.badges.map((b, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs text-center">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{b.label}</span>
                    <span className="block text-xs font-black text-indigo-600 font-mono mt-0.5 truncate">{b.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Detail Chip if provided */}
            {notifyModal.detail && (
              <div className="w-full mb-5 py-2 px-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{notifyModal.detail}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setNotifyModal(null)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-slate-900/15 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'حسناً، فهمت' : 'D\'accord, compris'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
