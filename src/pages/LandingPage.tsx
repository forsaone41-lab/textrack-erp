import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, Zap, Users, ArrowRight, MessageCircle, Star, Package, Factory, Globe, Shirt, Scissors, CheckCircle, Image as ImageIcon, X, ChevronDown, Search, LogOut, RotateCw, MapPin, AlertTriangle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';
import { loadCompanyProfile, saveLead, syncCompanyProfile, CompanyProfile, loadData, TarifService, saveRecord } from '../types';
import { generatePDF } from '../utils/pdf';
import { trackPixelEvent } from '../utils/pixel';
import { sendPushToAll } from '../utils/pushNotifications';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE = 'service_itjhz3n';
const EMAILJS_TEMPLATE = 'template_tnjq79k';
const EMAILJS_PUBLIC_KEY = '8KXb_0ilZfpaovLCk';

const sendEmailNotification = (name: string, phone: string, email: string, ville: string, models: { type: string; quantity: number }[]) => {
  const modelsList = models.map(m => `• ${m.type} (${m.quantity} pcs)`).join('\n');
  const totalQty = models.reduce((s, m) => s + m.quantity, 0);
  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_email: 'beyacreative@gmail.com',
    from_name: name,
    from_phone: phone,
    from_email: email || 'Non fourni',
    from_ville: ville || 'Non fourni',
    models_list: modelsList,
    total_qty: totalQty,
    message: `Nouvelle demande de ${name}\nTél: ${phone}\nVille: ${ville}\n\nModèles:\n${modelsList}\n\nTotal: ${totalQty} pcs`,
  }, EMAILJS_PUBLIC_KEY).catch(() => {});
};

const LogoWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="flex flex-col">
        <span className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
          {alt.split(' ')[0]}<span className="text-indigo-600">CREATIVE</span>
        </span>
        <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
          Manufacturing Excellence
        </span>
      </div>
    );
  }
  return <img src={src} className="h-10 md:h-12 object-contain" alt={alt} onError={() => setError(true)} />;
};

export default function LandingPage() {
  const { isAr, toggle } = useLang();
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());

  useEffect(() => {
    const sync = async () => {
      const remote = await syncCompanyProfile();
      setCompany(remote);
    };
    sync();
  }, []);

  const _unusedPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert(isAr ? 'حجم الصورة كبير جداً (الأقصى 10MB)' : 'Photo trop grande (Max 10MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            // setSelectedPhoto(compressedBase64);
          } else {
            // setSelectedPhoto(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const services = [
    {
      title: isAr ? 'الفصالة العصرية' : 'Coupe de Précision',
      desc: isAr ? 'أحدث التقنيات لضمان دقة متناهية في كل قطعة.' : 'Utilisation des dernières technologies pour une précision millimétrée.',
      icon: Factory,
      color: 'from-orange-500 to-rose-500'
    },
    {
      title: isAr ? 'خياطة احترافية' : 'Montage & Couture',
      desc: isAr ? 'فريق من الخبراء يضمنون جودة الخياطة والمتانة.' : 'Une équipe d\'experts garantissant la solidité et la finesse des finitions.',
      icon: Users,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: isAr ? 'مراقبة الجودة' : 'Contrôle Qualité',
      desc: isAr ? 'كل قطعة تخضع لفحص دقيق قبل التسليم.' : 'Chaque pièce subit une inspection rigoureuse avant expédition.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  // Helper to format video URL (Instagram or direct)
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    
    // Instagram
    if (url.includes('instagram.com')) {
      const cleanUrl = url.split('?')[0].replace(/\/$/, '');
      return `${cleanUrl}/embed`;
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('shorts/')) {
        videoId = url.split('shorts/')[1].split('?')[0];
      } else if (url.includes('embed/')) {
        return url;
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    return url;
  };

  const embedUrl = getEmbedUrl(company.landingVideoUrl);

  const [showSuccess, setShowSuccess] = useState(false);
  const [newClientCode, setNewClientCode] = useState<{name: string, code: string, email: string, phone: string, id: string} | null>(null);
  const [submittedName, setSubmittedName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  interface ModelEntry {
    id: string;
    type: string;
    customType: string;
    quantity: string;
    tailles: Record<string, string>;
    details: string;
    photo: string | null;
    photos: string[];
    provideFabric?: boolean;
  }

  const emptyModel = (): ModelEntry => ({
    id: Math.random().toString(36).slice(2),
    type: 'T-Shirt', customType: '', quantity: '',
    tailles: { XS: '', S: '', M: '', L: '', XL: '', XXL: '' },
    details: '', photo: null, photos: [], provideFabric: false
  });

  const [models, setModels] = useState<ModelEntry[]>([emptyModel()]);

  const updateModel = (id: string, field: Partial<ModelEntry>) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...field } : m));
  };

  const updateModelTaille = (id: string, size: string, val: string) => {
    setModels(prev => prev.map(m => {
      if (m.id !== id) return m;
      const newTailles = { ...m.tailles, [size]: val };
      const total = Object.values(newTailles).reduce((a, v) => a + (Number(v) || 0), 0);
      return { ...m, tailles: newTailles, quantity: total > 0 ? total.toString() : m.quantity };
    }));
  };

  const handleModelPhoto = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErrorMsg(isAr ? 'الصورة كبيرة جداً (Max 10MB)' : 'Photo trop grande (Max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h = h * MAX / w; w = MAX; }
        else if (h > MAX) { w = w * MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        let newPhoto = '';
        if (ctx) { ctx.drawImage(img, 0, 0, w, h); newPhoto = canvas.toDataURL('image/jpeg', 0.6); }
        else { newPhoto = ev.target?.result as string; }
        
        setModels(prev => prev.map(m => {
          if (m.id !== id) return m;
          const currentPhotos = m.photos || (m.photo ? [m.photo] : []);
          const newPhotos = [...currentPhotos, newPhoto];
          return { ...m, photo: newPhotos[0], photos: newPhotos };
        }));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeModelPhoto = (id: string, index: number) => {
    setModels(prev => prev.map(m => {
      if (m.id !== id) return m;
      const currentPhotos = m.photos || (m.photo ? [m.photo] : []);
      const newPhotos = currentPhotos.filter((_, i) => i !== index);
      return { ...m, photo: newPhotos.length > 0 ? newPhotos[0] : null, photos: newPhotos };
    }));
  };

  // Dynamic SEO Title & Description
  useEffect(() => {
    const title = isAr
      ? `BEYA CREATIVE - رائد صناعة الملابس بالمغرب 🇲🇦`
      : `BEYA CREATIVE - Excellence en Confection Textile au Maroc 🇲🇦`;
    const desc = isAr
      ? 'نحن نوفر حلولاً متكاملة لصناعة الملابس بالمغرب. تيشيرت، قميص، جلابة، وملابس العمل بجودة عالمية.'
      : 'BEYA CREATIVE : Leader de la confection textile au Maroc. Fabrication de vêtements haute qualité et production 100% marocaine.';

    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
  }, [isAr]);

  
  const [simulatorStep, setSimulatorStep] = useState(1);
  const [tarifsDb, setTarifsDb] = useState<TarifService[]>([]);

  useEffect(() => {
    const fetchTarifs = async () => {
      const tarifsList = await loadData<TarifService>('tarifs');
      const activeConfections = (tarifsList || []).filter(t => t.categorie === 'Confection' && t.actif);
      setTarifsDb(activeConfections);
    };
    fetchTarifs();
  }, []);

  const calculateEstimate = (type: string, qtyStr: string, provideFabric: boolean = false) => {
    const quantity = parseInt(qtyStr) || 0;
    if (quantity === 0) return null;
    let baseMin = 0;
    let baseMax = 0;
    const dbTarif = tarifsDb.find(t => t.titre.toLowerCase() === type.toLowerCase());
    if (dbTarif) {
      baseMin = dbTarif.prixMin;
      baseMax = dbTarif.prixMax || dbTarif.prixMin;
    } else {
      switch(type) {
        case 'T-Shirt': baseMin = 35; baseMax = 45; break;
        case 'Polo': baseMin = 60; baseMax = 75; break;
        case 'T-Shirt Oversize': baseMin = 45; baseMax = 60; break;
        case 'Sweat / Hoodie': baseMin = 120; baseMax = 150; break;
        case 'Djellaba / Gandoura': baseMin = 150; baseMax = 250; break;
        case 'Ensemble / Survêtement': baseMin = 180; baseMax = 260; break;
        case 'Pyjama': baseMin = 80; baseMax = 120; break;
        case 'Uniforme / Travail': baseMin = 100; baseMax = 180; break;
        case 'Pantalon': baseMin = 80; baseMax = 130; break;
        default: return null;
      }
    }
    if (quantity < 100) { baseMin *= 1.15; baseMax *= 1.15; }
    else if (quantity >= 500) { baseMin *= 0.9; baseMax *= 0.9; }

    if (provideFabric) {
      baseMin *= 0.45;
      baseMax *= 0.45;
    }
    return {
      min: Math.round(baseMin),
      max: Math.round(baseMax),
      totalMin: Math.round(baseMin * quantity),
      totalMax: Math.round(baseMax * quantity)
    };
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('textrack_auth');
    if (auth) setIsLoggedIn(true);
  }, []);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Messages/Modals (Error & Success) */}
      {errorMsg && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setErrorMsg(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-rose-100" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <p className="text-center text-slate-700 font-bold mb-8 text-lg">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="w-full py-4 bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 transition-colors">OK</button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-14 max-w-2xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.15)] my-8">
            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-center text-slate-900 uppercase tracking-tighter mb-4">
              {isAr ? 'تم إرسال طلبكم بنجاح!' : 'Demande Envoyée avec Succès!'}
            </h3>
            <p className="text-center text-slate-500 font-medium text-lg mb-10">
              {isAr ? 'شكراً لاختياركم BEYA CREATIVE. سنتواصل معكم في أقرب وقت.' : 'Merci d\'avoir choisi BEYA CREATIVE. Nous vous contacterons très bientôt.'}
            </p>

            {newClientCode && (
              <div className="bg-slate-50 p-8 rounded-3xl mb-10 border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500 rounded-full blur-[80px] opacity-10" />
                <h4 className="text-xl font-black text-slate-800 mb-6">{isAr ? 'معلومات حسابك الخاص' : 'Vos informations de connexion'}</h4>
                <div className="space-y-6 relative z-10">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Email</p>
                    <p className="font-bold text-slate-700 font-mono text-lg">{newClientCode.email}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">{isAr ? 'الرمز السري (Code)' : 'Code secret'}</p>
                    <p className="text-4xl font-black text-emerald-600 tracking-[0.2em] font-mono">{newClientCode.code}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setShowSuccess(false)} className="w-full sm:w-1/3 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
              <a href={`https://wa.me/${company.phone ? company.phone.replace(/\D/g, '') : '212624465962'}?text=${encodeURIComponent('مرحباً BEYA CREATIVE...')}`} target="_blank" rel="noreferrer" className="w-full sm:w-2/3 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-center tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3">
                {isAr ? 'تأكيد الطلب عبر الواتساب' : 'Confirmer via WhatsApp'}
              </a>
            </div>
          </div>
        </div>
      )}

      {isSending && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-white/80 backdrop-blur-xl">
          <div className="text-center text-slate-900 bg-white p-12 rounded-3xl shadow-2xl border border-slate-100">
            <RotateCw className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
            <p className="text-xl font-black tracking-widest uppercase">{isAr ? 'جاري الإرسال...' : 'Envoi en cours...'}</p>
          </div>
        </div>
      )}

      {/* Navbar - Light Mode */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-2xl border-b border-slate-100 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <LogoWithFallback src={company.logoLanding || company.logoUrl} alt={company.name} />
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              {isAr ? 'FR' : 'عربي'}
            </button>
            <Link to={isLoggedIn ? "/dashboard" : "/login"} className="px-6 md:px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200">
              {isLoggedIn ? (isAr ? 'حسابي' : 'Mon Espace') : (isAr ? 'تسجيل الدخول' : 'Connexion')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean Light Style */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 pt-20">
        {/* Very subtle background video - Light Wash */}
        <div className="absolute inset-0 w-full h-full">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30 scale-105 mix-blend-luminosity">
            <source src="https://player.vimeo.com/external/498334460.sd.mp4?s=d00e0b3c66f6587c60315ce91dfa3a9366e60b14&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
        </div>
        
        {/* Light Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-indigo-50/90 backdrop-blur-[2px]" />
        
        {/* Beautiful Top Blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-[150px] opacity-40 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full blur-[150px] opacity-40 mix-blend-multiply" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-20">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-10 border border-indigo-100 shadow-sm animate-fade-in-up">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {isAr ? 'الشريك الأول لنجاحك الرقمي في المغرب' : 'Le 1er Partenaire de votre réussite digitale au Maroc'}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold mb-8 tracking-tight leading-snug uppercase text-slate-900 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {isAr ? 'نصنع منتجاتك،' : 'Nous fabriquons vos produits,'}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 pb-4 inline-block">
              {isAr ? 'ونبني لك متجرك الإلكتروني.' : 'Et nous créons votre boutique.'}
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-500 mb-14 font-medium max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {isAr 
              ? 'سواء كنت تملك متجراً وتحتاج إلى تصنيع ملابس عالية الجودة، أو كنت تبدأ من الصفر وتحتاج لمتجر إلكتروني احترافي قوي، نحن هنا لنحقق ذلك بأعلى معدل تحويل.' 
              : 'Que vous ayez déjà un site et cherchiez une confection de qualité, ou que vous partiez de zéro pour créer une boutique en ligne professionnelle, nous sommes là pour maximiser votre taux de conversion.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button onClick={() => document.getElementById('services')?.scrollIntoView({behavior:'smooth'})} className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3">
              {isAr ? 'اختر الخدمة الآن' : 'Choisir un service'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <a href={`https://wa.me/${company.phone ? company.phone.replace(/\D/g, '') : '212624465962'}?text=${encodeURIComponent('مرحباً BEYA CREATIVE...')}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3">
              {isAr ? 'تواصل مع خبير' : 'Parler à un expert'}
            </a>
          </div>
        </div>
      </div>

      {/* Services Split Section - Bright & Elegant */}
      <section id="services" className="py-32 px-6 relative z-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 mb-6">
              {isAr ? 'كيف يمكننا مساعدتك؟' : 'Comment pouvons-nous vous aider ?'}
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              {isAr ? 'اختر الخدمة التي تناسب احتياجات علامتك التجارية اليوم' : 'Choisissez le service qui correspond aux besoins de votre marque aujourd\'hui'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Store Builder Service - Light version */}
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 lg:p-14 hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_rgba(59,130,246,0.1)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-[120px] opacity-0 group-hover:opacity-20 transition-opacity" />
              <div>
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 border border-blue-100 group-hover:scale-110 transition-transform">
                  <Globe className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-extrabold uppercase tracking-tight mb-6 text-slate-900 leading-tight">
                  {isAr ? '1. بناء متجر إلكتروني احترافي' : '1. Création de Boutique Pro'}
                </h3>
                <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
                  {isAr 
                    ? 'ليس لديك موقع؟ نحن نبني لك متجراً مستقلاً بتصميم عصري وأدوات تسويقية مدمجة لرفع نسبة التحويل (Conversion Rate) ومنافسة كبار السوق بقوة.' 
                    : 'Vous n\'avez pas de site ? Nous construisons une boutique indépendante (sans commissions) avec un design moderne et des outils marketing intégrés pour maximiser vos ventes.'}
                </p>
              </div>
              <button 
                onClick={() => {
                  alert(isAr ? 'سيتم توجيهك قريباً لصفحة بناء المتجر. مؤقتاً تواصل معنا.' : 'Vous serez bientôt redirigé vers le Store Builder. Contactez-nous en attendant.');
                  window.open(`https://wa.me/${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً BEYA CREATIVE، أريد الاستفسار عن خدمة بناء متجر إلكتروني احترافي.')}`, '_blank');
                }}
                className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 relative z-10"
              >
                {isAr ? 'اطلب تصميم متجرك' : 'Commander ma boutique'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Manufacturing Service - Light version */}
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 lg:p-14 hover:border-purple-200 transition-all group relative overflow-hidden flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_rgba(168,85,247,0.1)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full blur-[120px] opacity-0 group-hover:opacity-20 transition-opacity" />
              <div>
                <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mb-8 border border-purple-100 group-hover:scale-110 transition-transform">
                  <Factory className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-extrabold uppercase tracking-tight mb-6 text-slate-900 leading-tight">
                  {isAr ? '2. تصنيع الملابس الجاهزة (Confection)' : '2. Confection & Production'}
                </h3>
                <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
                  {isAr 
                    ? 'لديك موقع مسبقاً وتحتاج فقط إلى سلع ذات جودة عالية؟ نحن نقدم لك تصنيعاً مخصصاً بدقة متناهية، مع التغليف والخدمات اللوجستية المتكاملة.' 
                    : 'Vous avez déjà votre site et cherchez des produits premium ? Nous fabriquons vos vêtements sur-mesure avec une précision extrême et un packaging soigné.'}
                </p>
              </div>
              <a href="/#/devis-express" className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-1 relative z-10">
                {isAr ? 'اطلب تصنيع منتجاتك' : 'Commander mes produits'}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Production Form (The original calculator) - Bright Version */}
      <section id="contact-form" className="py-32 px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">
              {isAr ? 'حاسبة التصنيع وطلب الإنتاج' : 'Simulateur de Production'}
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              {isAr ? 'أدخل تفاصيل القطع التي ترغب في تصنيعها لتعرف التكلفة التقديرية فوراً.' : 'Entrez les détails de vos modèles pour obtenir une estimation immédiate.'}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formElement = e.currentTarget;
              if (simulatorStep === 1) {
                const missingPhoto = models.find(m => !m.photo && (!m.photos || m.photos.length === 0));
                if (missingPhoto) {
                  setErrorMsg(isAr ? 'كل موديل خاصو عندو صورة (إجباري)' : 'Chaque modèle doit avoir au moins une photo (Obligatoire)');
                  return;
                }
                setSimulatorStep(2);
                return;
              }

              const formData = new FormData(formElement);
              const countryCode = (formElement.querySelector('select[name="countryCode"]') as HTMLSelectElement)?.value || '+212';
              const rawPhone = formData.get('phone') as string;
              const fullPhone = countryCode + (rawPhone.startsWith('0') ? rawPhone.substring(1) : rawPhone);
              const clientName = formData.get('name') as string;
              const clientEmail = formData.get('email') as string || 'Non spécifié';
              const clientVille = formData.get('ville') as string || 'Non spécifié';

              if (!clientName.trim().includes(' ')) {
                setErrorMsg(isAr ? 'المرجو إدخال الإسم الكامل' : 'Veuillez entrer votre nom complet');
                return;
              }

              setIsSending(true);
              try {
                for (const m of models) {
                  const finalType = ((m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type) + (m.provideFabric ? ' (CMT - Client Tissu)' : '');
                  await saveLead({
                    name: clientName, email: clientEmail, phone: fullPhone, ville: clientVille,
                    type: finalType, quantity: Number(m.quantity) || 1,
                    tailles: Object.fromEntries(Object.entries(m.tailles).filter(([_, v]) => v !== '').map(([k, v]) => [k, Number(v)])),
                    details: m.details, photo: m.photos?.[0] || m.photo!, photos: m.photos || (m.photo ? [m.photo] : []),
                  });
                }
                
                trackPixelEvent('Lead', {
                  content_name: models.map(m => m.type).join(', '),
                  content_category: 'Confection Lead',
                  value: models.reduce((acc, m) => acc + (Number(m.quantity) || 1), 0),
                  currency: 'MAD'
                });

                setIsSending(false);
                setSubmittedName(clientName);
                
                const newId = `user-${Date.now()}`;
                const autoCode = Math.floor(100000 + Math.random() * 900000).toString();
                const newClient = {
                  id: newId, nom: clientName, role: 'client' as const,
                  email: (clientEmail && clientEmail !== 'Non spécifié' ? clientEmail : `${clientName.replace(/\s+/g, '').toLowerCase()}_${newId.slice(0, 4)}@beya.ma`).toLowerCase().trim(),
                  telephone: fullPhone, password: autoCode, pinCode: autoCode,
                  actif: true, ville: clientVille || '', adresse: ''
                };
                await saveRecord('users', newClient);
                setNewClientCode({ name: clientName, code: autoCode, email: newClient.email, phone: fullPhone, id: newId });
                
                setShowSuccess(true);
                setModels([emptyModel()]);
                setSimulatorStep(1);
                sendEmailNotification(
                  clientName, fullPhone, clientEmail, clientVille,
                  models.map(m => ({ type: (m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type, quantity: Number(m.quantity) || 1 }))
                );
                sendPushToAll('🧵 Nouvelle Demande!', `${clientName} — ${models.map(m => m.type).join(', ')}`, '/demandes').catch(() => {});
                formElement.reset();
              } catch (err: any) {
                setIsSending(false);
                setErrorMsg(isAr ? 'وقع خطأ أثناء الإرسال.' : 'Une erreur est survenue.');
              }
            }}>
              
              <div className="bg-white border border-slate-100 rounded-[3rem] p-6 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="flex items-center justify-center gap-4 mb-10 relative z-10">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${simulatorStep >= 1 ? 'w-24 bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'w-8 bg-slate-200'}`}></div>
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${simulatorStep >= 2 ? 'w-24 bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'w-8 bg-slate-200'}`}></div>
                </div>

                {simulatorStep === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 relative z-10">
                    {models.map((m, idx) => (
                      <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                          <h3 className="font-black text-slate-900 text-xl uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">{idx + 1}</span>
                            {isAr ? 'الموديل' : 'Modèle'} 
                          </h3>
                          {models.length > 1 && (
                            <button type="button" onClick={() => setModels(prev => prev.filter(x => x.id !== m.id))} className="text-rose-500 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl transition-colors">
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس' : 'Type de vêtement'}</label>
                            <div className="relative">
                              <select value={m.type} onChange={e => updateModel(m.id, { type: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-purple-500 transition-colors appearance-none text-slate-900 shadow-sm">
                                {tarifsDb.length > 0 ? tarifsDb.map(t => <option key={t.id} value={t.titre}>{t.titre}</option>) : ['T-Shirt','Polo','T-Shirt Oversize','Sweat / Hoodie','Djellaba / Gandoura','Ensemble / Survêtement','Pyjama','Uniforme / Travail','Pantalon'].map(t => <option key={t}>{t}</option>)}
                                <option value="Autre">{isAr ? 'نوع آخر (Autre...)' : 'Autre...'}</option>
                              </select>
                              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                            {m.type === 'Autre' && (
                              <input type="text" value={m.customType} onChange={e => updateModel(m.id, { customType: e.target.value })} placeholder={isAr ? 'حدد النوع' : 'Spécifiez'} className="mt-4 w-full bg-white border-2 border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-purple-500 text-slate-900 shadow-sm" required />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'الكمية الإجمالية' : 'Quantité Totale'}</label>
                            <input type="number" min="1" placeholder="100" value={m.quantity} onChange={e => updateModel(m.id, { quantity: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-purple-500 text-slate-900 shadow-sm" required />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{isAr ? 'تفاصيل (ألوان، طباعة...)' : 'Détails (Couleurs, Impression...)'}</label>
                          <textarea rows={3} value={m.details} onChange={e => updateModel(m.id, { details: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-purple-500 resize-none text-slate-900 shadow-sm" placeholder={isAr ? "اشرح بالتفصيل..." : "Détails..."} />
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{isAr ? 'صورة الموديل (إجباري)' : 'Photo du modèle (Obligatoire)'}</label>
                          <div className="flex flex-wrap gap-4">
                            {(m.photos || (m.photo ? [m.photo] : [])).map((p, pIdx) => (
                              <div key={pIdx} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm">
                                <img src={p} className="w-full h-full object-cover" alt="" />
                                <button type="button" onClick={() => removeModelPhoto(m.id, pIdx)} className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <label className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors shadow-sm">
                              <ImageIcon className="w-6 h-6 text-slate-400 mb-1.5" />
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ajouter</span>
                              <input type="file" accept="image/*" onChange={e => handleModelPhoto(m.id, e)} className="hidden" />
                            </label>
                          </div>
                        </div>
                        
                        {/* Estimate */}
                        {(() => {
                          const est = calculateEstimate(m.type, m.quantity, m.provideFabric);
                          if (!est) return null;
                          return (
                            <div className="p-5 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-between mt-6">
                              <span className="text-xs font-black text-purple-600 uppercase tracking-widest">{isAr ? 'التكلفة التقديرية:' : 'Coût Estimé:'}</span>
                              <span className="text-lg font-black text-slate-900">{est.totalMin.toLocaleString()} - {est.totalMax.toLocaleString()} MAD</span>
                            </div>
                          );
                        })()}
                      </div>
                    ))}

                    <button type="button" onClick={() => setModels(prev => [...prev, emptyModel()])} className="w-full py-5 border-2 border-dashed border-indigo-200 text-indigo-600 bg-indigo-50/50 rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                      + {isAr ? 'إضافة موديل' : 'Ajouter un modèle'}
                    </button>

                    <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-lg uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:bg-indigo-600 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all flex justify-center items-center gap-3 mt-8">
                      {isAr ? 'التالي' : 'Suivant'} <ArrowRight className={`w-6 h-6 ${isAr ? '-scale-x-100' : ''}`} />
                    </button>
                  </div>
                )}

                {simulatorStep === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-left-4 duration-500 relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-8">{isAr ? 'معلومات التواصل' : 'Vos coordonnées'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'الإسم الكامل' : 'Nom Complet'}</label>
                        <input type="text" name="name" className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-900 outline-none focus:border-purple-500 transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email</label>
                        <input type="email" name="email" className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-900 outline-none focus:border-purple-500 transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'الهاتف / الواتساب' : 'Téléphone'}</label>
                        <div className="flex gap-3">
                          <select name="countryCode" className="w-28 bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 font-bold outline-none focus:border-purple-500 appearance-none text-center text-slate-900 transition-colors">
                            <option value="+212">+212 🇲🇦</option>
                            <option value="+33">+33 🇫🇷</option>
                          </select>
                          <input type="tel" name="phone" className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-900 outline-none focus:border-purple-500 transition-colors" required dir="ltr"/>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'المدينة' : 'Ville'}</label>
                        <input type="text" name="ville" className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-900 outline-none focus:border-purple-500 transition-colors" required />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-8">
                      <button type="button" onClick={() => setSimulatorStep(1)} className="w-full sm:w-1/3 py-6 bg-slate-100 text-slate-600 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">{isAr ? 'رجوع' : 'Retour'}</button>
                      <button type="submit" className="w-full sm:w-2/3 py-6 bg-emerald-500 text-white rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                        {isAr ? 'تأكيد الطلب' : 'Confirmer'} <CheckCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-500 text-center text-xs font-black uppercase tracking-widest relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white italic">
              BEYA<span className="text-indigo-500">CREATIVE</span>
            </span>
          </div>
          <div>&copy; {new Date().getFullYear()} BEYA CREATIVE. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
}
