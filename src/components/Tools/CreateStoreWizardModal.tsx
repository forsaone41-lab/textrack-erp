import React, { useState, useEffect } from 'react';
import { 
  X, Check, ArrowRight, ArrowLeft, Store, Globe, 
  Palette, CheckCircle2, ShieldCheck, 
  ExternalLink, AlertCircle, Loader2, Lock, Eye
} from 'lucide-react';
import { supabase } from '../../supabase';

interface CreateStoreWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreCreated: (newStore: any) => void;
  currentUser?: any;
  isAr?: boolean;
}

const THEME_OPTIONS = [
  {
    id: 'streetwear',
    name: 'Streetwear Pro',
    nameAr: 'ستريت وير برو (Streetwear)',
    category: 'Streetwear & Sport',
    layout: 'hero-center',
    defaultColor: '#0f172a',
    defaultFont: 'font-sans',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop',
    description: 'Style urbain, jeune et moderne, parfait pour les marques de hoodies, t-shirts et streetwear.',
    descriptionAr: 'طابع شبابي عصري قوي، مثالي لعلامات الملابس الحضرية والهوديز والملابس الرياضية.'
  },
  {
    id: 'abaya',
    name: 'Luxury Abaya & Traditional',
    nameAr: 'عبايات وقفطان فاخر (Luxury)',
    category: 'Abayas & Caftans',
    layout: 'elegant',
    defaultColor: '#b48a44',
    defaultFont: 'font-serif',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop',
    description: 'Design haute couture aux tons dorés et sobres, adapté aux caftans, abayas et tenues traditionnelles.',
    descriptionAr: 'تصميم راقٍ بلمسات ذهبية وفخمة، مخصص للقفطان المغربي، العبايات والجلابات الراقية.'
  },
  {
    id: 'minimalist',
    name: 'Minimalist Chic',
    nameAr: 'مينيماليست شيك (Minimalist)',
    category: 'Mode & Prêt-à-porter',
    layout: 'split-screen',
    defaultColor: '#171717',
    defaultFont: 'font-serif',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1489987707023-afc7f93c6508?q=80&w=800&auto=format&fit=crop',
    description: 'Design épuré et sobre qui met l\'accent sur la pureté des coupes et la qualité visuelle des photos.',
    descriptionAr: 'تصميم نقي وبسيط يركز على جمالية الصور وجودة تفاصيل المنتجات بدون أي تشتيت.'
  },
  {
    id: 'sportswear',
    name: 'Active Sportswear',
    nameAr: 'سبوروار حركي (Sport)',
    category: 'Sport & Fitness',
    layout: 'hero-center',
    defaultColor: '#84cc16',
    defaultFont: 'font-sans',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
    description: 'Dynamique et vibrant, optimisé pour les ensembles de sport, survêtements et fitness.',
    descriptionAr: 'مظهر حركي رياضي مميز، مهيأ خصيصاً لأطقم السبوروار والملابس الرياضية.'
  },
  {
    id: 'clement',
    name: 'Clement Fashion Studio',
    nameAr: 'كليمنت استوديو (Fashion)',
    category: 'Créateurs & Stylistes',
    layout: 'clement',
    defaultColor: '#1e293b',
    defaultFont: 'font-sans',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=800&auto=format&fit=crop',
    description: 'Mise en page éditoriale élégante, idéale pour les collections capsules et marques de créateurs.',
    descriptionAr: 'قالب عصري بنمط مجلات الموضة، مثالي لمجموعات المصممين والموديلات الحصرية.'
  },
  {
    id: 'mazia',
    name: 'Mazia Trendy',
    nameAr: 'مازيا تريندي (Trendy)',
    category: 'Femme & Accessoires',
    layout: 'mazia',
    defaultColor: '#ef4444',
    defaultFont: 'font-serif',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop',
    description: 'Moderne, coloré et très attractif, conçu pour booster les ventes de mode féminine et accessoires.',
    descriptionAr: 'قالب جذاب وعصري جداً بنسب تحويل عالية، موجه للملابس النسائية والإكسسوارات.'
  },
  {
    id: 'emerald-market',
    name: 'Ultimate Store',
    nameAr: 'ألتيميت ستور (Conversion)',
    category: 'Multi-produits',
    layout: 'pro-ultimate',
    defaultColor: '#0d9488',
    defaultFont: 'font-sans',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop',
    description: 'Structure e-commerce complète axée sur la conversion, la rapidité et la confiance client.',
    descriptionAr: 'هيكلة متجر إلكتروني متكاملة تركز على سرعة البيع وثقة الزبون والشراء الفوري.'
  },
  {
    id: 'atelier',
    name: 'Atelier Confection',
    nameAr: 'أتيليي الصنعة (Atelier)',
    category: 'Sur-mesure & Atelier',
    layout: 'atelier',
    defaultColor: '#1a1a1a',
    defaultFont: 'font-serif',
    tier: 'free',
    previewImg: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop',
    description: 'Pour les ateliers de confection, tailleurs sur mesure et marques textiles artisanales.',
    descriptionAr: 'مخصص لورشات الخياطة والصنعة والملابس المفصلة حسب الطلب بجودة عالية.'
  }
];

const CATEGORIES = [
  { id: 'mode_femme', label: 'Prêt-à-porter & Mode', labelAr: '👗 ملابس وأزياء جاهزة' },
  { id: 'abaya_caftan', label: 'Abayas & Caftans', labelAr: '👘 عبايات وقفطان مغربي' },
  { id: 'streetwear', label: 'Streetwear & Sport', labelAr: '👟 ستريت وير وملابس رياضية' },
  { id: 'maroquinerie', label: 'Sacs & Maroquinerie', labelAr: '👜 حقائب ومصنوعات جلدية' },
  { id: 'beaute', label: 'Beauté & Parfums', labelAr: '✨ تجميل وعطور' },
  { id: 'generaliste', label: 'Boutique Généraliste', labelAr: '📦 متجر عام' }
];

export default function CreateStoreWizardModal({
  isOpen,
  onClose,
  onStoreCreated,
  currentUser,
  isAr = false
}: CreateStoreWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0]);

  // Validation & Availability State
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainStatus, setDomainStatus] = useState<'available' | 'taken' | 'invalid' | 'idle'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate subdomain from store name
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const slug = slugify(val);
    if (!subdomain || subdomain === slugify(storeName)) {
      setSubdomain(slug);
    }
  };

  // Check Subdomain Availability in Supabase
  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setDomainStatus('idle');
      return;
    }

    const clean = slugify(subdomain);
    const targetDomain = `${clean}.beyacreative.com`;

    const timer = setTimeout(async () => {
      setIsCheckingDomain(true);
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('id')
          .eq('domain', targetDomain)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setDomainStatus('taken');
        } else {
          setDomainStatus('available');
        }
      } catch (e) {
        setDomainStatus('available');
      } finally {
        setIsCheckingDomain(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [subdomain]);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!storeName.trim()) {
        setErrorMessage(isAr ? 'يرجى إدخال اسم المتجر للمتابعة.' : 'Veuillez saisir un nom pour votre boutique.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!subdomain.trim() || subdomain.trim().length < 3) {
        setErrorMessage(isAr ? 'يرجى كتابة رابط لا يقل عن 3 أحرف.' : 'Veuillez choisir un sous-domaine d\'au moins 3 caractères.');
        return;
      }
      if (domainStatus === 'taken') {
        setErrorMessage(isAr ? 'هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر.' : 'Ce sous-domaine est déjà réservé. Veuillez en choisir un autre.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  const handleCreateStore = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const cleanSub = slugify(subdomain);
      const fullDomain = customDomain.trim() ? customDomain.trim().toLowerCase() : `${cleanSub}.beyacreative.com`;

      // Resolve effective user from prop, Supabase auth session, or textrack_auth localStorage
      let effectiveUser = currentUser;
      if (!effectiveUser?.id || !effectiveUser?.email) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            effectiveUser = { ...sessionData.session.user, ...effectiveUser };
          }
        } catch (e) { /* ignore */ }
      }
      if (!effectiveUser?.id || !effectiveUser?.email) {
        try {
          const s = localStorage.getItem('textrack_auth');
          if (s) {
            const parsed = JSON.parse(s);
            effectiveUser = { ...parsed, ...effectiveUser };
          }
        } catch (e) { /* ignore */ }
      }

      const initialConfig = {
        storeName: storeName.trim(),
        subdomain: cleanSub,
        customDomain: customDomain.trim() || undefined,
        category: selectedCategory,
        activeTheme: {
          id: selectedTheme.id,
          name: selectedTheme.name,
          layout: selectedTheme.layout,
          defaultColor: selectedTheme.defaultColor,
          defaultFont: selectedTheme.defaultFont,
          previewImg: selectedTheme.previewImg,
          tier: selectedTheme.tier
        },
        primaryColor: selectedTheme.defaultColor,
        secondaryColor: '#ffffff',
        fontFamily: selectedTheme.defaultFont,
        currency: 'MAD',
        owner_id: effectiveUser?.id,
        owner_email: effectiveUser?.email,
        contactEmail: effectiveUser?.email || 'contact@store.ma',
        contactPhone: effectiveUser?.phone || '0661000000',
        createdAt: new Date().toISOString(),
        stats: {
          visitors: 0,
          revenue: 0,
          orders: 0
        }
      };

      // Pre-save to localStorage so user doesn't lose their configured store
      localStorage.setItem('beya_store_config', JSON.stringify(initialConfig));

      // Insert into Supabase stores table
      const { data: insertedStore, error } = await supabase
        .from('stores')
        .insert({
          name: storeName.trim(),
          domain: fullDomain,
          config_json: initialConfig,
          subscription_tier: 'NORMAL',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // If conflict on domain, alert user
        if (error.message.includes('unique') || error.message.includes('conflict')) {
          throw new Error(isAr ? 'هذا الدومين مستخدم بالفعل من متجر آخر!' : 'Ce nom de domaine est déjà utilisé.');
        }
        throw error;
      }

      // Call parent callback
      onStoreCreated(insertedStore || { config_json: initialConfig, name: storeName.trim(), domain: fullDomain });
      onClose();
    } catch (e: any) {
      console.error('Erreur création boutique:', e);
      const isFetchError = e.message?.toLowerCase().includes('fetch') || e.name === 'TypeError';
      if (isFetchError) {
        setErrorMessage(
          isAr
            ? 'تعذر الاتصال بقاعدة البيانات (سيرفر Supabase متوقف مؤقتاً "Paused" أو يواجه انقطاع في الاتصال 522). يرجى فتح لوحة تحكم Supabase والضغط على "Restore project".'
            : 'Impossible de contacter le serveur (Le projet Supabase est actuellement en pause ou inaccessible - Erreur 522). Rendez-vous sur votre tableau de bord Supabase et cliquez sur "Restore project".'
        );
      } else {
        setErrorMessage(e.message || (isAr ? 'حدث خطأ أثناء إنشاء المتجر.' : 'Erreur lors de la création de la boutique.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto ${isAr ? 'rtl font-sans' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div 
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ─── Header & Progress Stepper ──────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button 
            onClick={onClose}
            className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all`}
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {isAr ? 'إطلاق متجرك الإلكتروني في دقائق' : 'Créez votre boutique en quelques clics'}
          </h2>

          {/* Stepper Wizard Bar */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-3 border-t border-white/10 text-center">
            {[
              { num: 1, title: isAr ? '1. اسم المتجر' : '1. Nom' },
              { num: 2, title: isAr ? '2. الرابط' : '2. Domaine' },
              { num: 3, title: isAr ? '3. الثيم' : '3. Thème' },
              { num: 4, title: isAr ? '4. الإطلاق' : '4. Lancement' }
            ].map((s) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20' 
                      : isPassed 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/10 text-slate-400'
                  }`}>
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-white' : isPassed ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Body Step Content (Scrollable) ───────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 1: NOM DE LA BOUTIQUE & NICHE
              ═════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-left rtl:text-right">
                <h3 className="text-lg font-black text-slate-900">
                  {isAr ? 'ما هو اسم علامتك التجارية أو متجرك؟' : 'Quel est le nom de votre boutique ?'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {isAr ? 'اختر اسماً يعبر عن هوية منتجاتك، يمكنك تغييره لاحقاً في أي وقت.' : 'Donnez une identité mémorable à votre marque. Vous pourrez le modifier ultérieurement.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  {isAr ? 'اسم المتجر / Marque *' : 'Nom de la boutique / Marque *'}
                </label>
                <div className="relative">
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-slate-400`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="Ex: Marrakech Chic, Maison Kaftan, Urban Street..."
                    autoFocus
                    className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all`}
                  />
                </div>
              </div>

              {/* Niche / Category Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  {isAr ? 'تصنيف المتجر ونوع المنتجات :' : 'Catégorie principale de vos produits :'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-left rtl:text-right transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isAr ? cat.labelAr : cat.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Subdomain Quick Peek */}
              {storeName.trim() && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{isAr ? 'الرابط التلقائي المقترح :' : 'Lien généré automatiquement :'}</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 truncate max-w-xs">
                    https://{slugify(storeName || 'boutique')}.beyacreative.com
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 2: LIEN & NOM DE DOMAINE
              ═════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-left rtl:text-right">
                <h3 className="text-lg font-black text-slate-900">
                  {isAr ? 'حدد رابط المتجر (الدومين)' : 'Définissez l\'adresse web de votre boutique'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {isAr ? 'احصل على رابط سريع ومجاني ينتهي بـ .beyacreative.com مع إمكانية إضافة دومينك الخاص في أي وقت.' : 'Bénéficiez d\'un sous-domaine instantané et sécurisé, ou connectez votre propre domaine .ma / .com.'}
                </p>
              </div>

              {/* Subdomain Input with Suffix */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  {isAr ? 'الرابط المجاني السريع (Sous-domaine) *' : 'Sous-domaine gratuit BEYA *'}
                </label>
                
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 transition-all">
                  <span className="px-3.5 text-xs font-mono font-bold text-slate-400 bg-slate-100/80 py-3.5 border-r rtl:border-r-0 rtl:border-l border-slate-200">
                    https://
                  </span>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(slugify(e.target.value))}
                    placeholder="votre-marque"
                    className="flex-1 px-3.5 py-3.5 bg-transparent text-sm font-mono font-bold text-slate-900 outline-none"
                  />
                  <span className="px-3.5 text-xs font-mono font-bold text-slate-500 bg-slate-100/80 py-3.5 border-l rtl:border-l-0 rtl:border-r border-slate-200">
                    .beyacreative.com
                  </span>
                </div>

                {/* Availability status badge */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {isCheckingDomain ? (
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {isAr ? 'جاري التحقق من التوفر...' : 'Vérification de la disponibilité...'}
                      </span>
                    ) : domainStatus === 'available' ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isAr ? '✓ هذا الرابط متاح وجاهز للاستخدام!' : '✓ Ce sous-domaine est disponible !'}
                      </span>
                    ) : domainStatus === 'taken' ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {isAr ? 'هذا الرابط محجوز، اختر اسماً آخر.' : 'Ce sous-domaine est déjà pris.'}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {isAr ? 'حروف وأرقام وشرطات فقط.' : 'Caractères alphanumériques et tirets.'}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 text-[10px]">
                    {subdomain.length} {isAr ? 'حرف' : 'caractères'}
                  </span>
                </div>
              </div>

              {/* Optional Custom Domain */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {isAr ? 'دومين خاص بك (اختياري) :' : 'Nom de domaine personnalisé (Optionnel) :'}
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {isAr ? 'شهادة SSL مجانية 🔒' : 'SSL Gratuit 🔒'}
                  </span>
                </div>

                <div className="relative">
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-slate-400`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="Ex: www.maboutique.ma ou store.com"
                    className={`w-full ${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all font-mono`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  {isAr 
                    ? 'يمكنك ربط دومينك الخاص المسجل مسبقاً (.ma أو .com) في أي وقت مع تفعيل شهادة الأمان SSL تلقائياً.' 
                    : 'Si vous possédez déjà votre nom de domaine chez un registrar (.ma, .com), vous pourrez le connecter en 1 clic.'}
                </p>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 3: CHOIX DU THÈME
              ═════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-left rtl:text-right">
                <h3 className="text-lg font-black text-slate-900">
                  {isAr ? 'اختر الثيم والتصميم الذي يناسب هوية علامتك' : 'Choisissez le thème visuel de votre boutique'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {isAr ? 'كل قالب مصمم باحترافية وسريع في التحميل، ويمكنك تعديل الألوان والصور والمقاطع لاحقاً.' : 'Tous nos thèmes sont optimisés pour le mobile, ultra-rapides et entièrement personnalisables.'}
                </p>
              </div>

              {/* Theme Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;

                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all group ${
                        isSelected
                          ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-500/20 bg-indigo-50/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {/* Image Preview with overlay */}
                      <div className="h-32 w-full bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${theme.previewImg})` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        
                        {/* Selected Radio Pill */}
                        <div className={`absolute top-2.5 ${isAr ? 'left-2.5' : 'right-2.5'} w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/80 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        {/* Layout badge */}
                        <div className={`absolute bottom-2.5 ${isAr ? 'right-2.5' : 'left-2.5'} flex items-center gap-1.5`}>
                          <span className="text-[10px] font-black uppercase text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20">
                            {theme.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 space-y-1.5 text-left rtl:text-right">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {isAr ? theme.nameAr : theme.name}
                          </h4>
                          <span 
                            className="w-4 h-4 rounded-full border border-slate-300 shrink-0" 
                            style={{ backgroundColor: theme.defaultColor }}
                            title={`Couleur par défaut: ${theme.defaultColor}`}
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {isAr ? theme.descriptionAr : theme.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 4: RÉCAPITULATIF & LANCEMENT
              ═════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-left rtl:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'كل شيء جاهز للإطلاق!' : 'Prêt pour le lancement !'}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {isAr ? 'تأكيد معلومات المتجر والبدء فوراً' : 'Récapitulatif de votre nouvelle boutique'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  {isAr ? 'راجع تفاصيل متجرك، بمجرد الضغط على زر الإطلاق سينشأ المتجر وتفتح لك لوحة التخصيص.' : 'Vérifiez les paramètres avant l\'initialisation immédiate de votre espace de vente.'}
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block mb-1">
                      {isAr ? 'اسم المتجر' : 'Boutique'}
                    </span>
                    <h2 className="text-2xl font-black">{storeName}</h2>
                    <span className="text-xs text-slate-300 mt-1 block">
                      {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    </span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shrink-0">
                    <img src={selectedTheme.previewImg} alt={selectedTheme.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px] font-bold mb-1">
                      {isAr ? 'رابط المتجر (URL)' : 'Adresse URL :'}
                    </span>
                    <span className="font-mono font-bold text-indigo-300 text-xs break-all">
                      https://{subdomain}.beyacreative.com
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px] font-bold mb-1">
                      {isAr ? 'الثيم المختار' : 'Thème Sélectionné :'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTheme.defaultColor }} />
                      <span className="font-bold text-white">{isAr ? selectedTheme.nameAr : selectedTheme.name}</span>
                    </div>
                  </div>
                </div>

                {/* Features included */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-300 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" /> SSL Gratuit & Sécurisé
                  </span>
                  <span>•</span>
                  <span>Hébergement CDN Rapide</span>
                  <span>•</span>
                  <span>Paiement à la livraison (COD) Activé</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ─── Footer Controls ──────────────────────────────────────── */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              <span>{isAr ? 'السابق' : 'Précédent'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs transition-all"
            >
              {isAr ? 'إلغاء' : 'Annuler'}
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
            >
              <span>{isAr ? 'التالي' : 'Suivant'}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              onClick={handleCreateStore}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جاري تجهيز المتجر...' : 'Initialisation en cours...'}</span>
                </>
              ) : (
                <span>{isAr ? 'إطلاق المتجر الآن' : 'Lancer ma boutique maintenant'}</span>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
