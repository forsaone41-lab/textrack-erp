import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, Zap, Users, ArrowRight, MessageCircle, Star, Package, Factory, Globe, Shirt, Scissors, CheckCircle, Image as ImageIcon, X, ChevronDown, Search, LogOut, RotateCw, MapPin, AlertTriangle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';
import { loadCompanyProfile, saveLead, syncCompanyProfile, CompanyProfile, loadData, TarifService } from '../types';
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
            setSelectedPhoto(compressedBase64);
          } else {
            setSelectedPhoto(event.target?.result as string);
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
  }

  const emptyModel = (): ModelEntry => ({
    id: Math.random().toString(36).slice(2),
    type: 'T-Shirt', customType: '', quantity: '',
    tailles: { XS: '', S: '', M: '', L: '', XL: '', XXL: '' },
    details: '', photo: null, photos: []
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

  const calculateEstimate = (type: string, qtyStr: string) => {
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
    <div className={`min-h-screen bg-white relative overflow-hidden ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {errorMsg && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setErrorMsg(null)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-center text-slate-800 mb-2">
              {isAr ? 'تنبيه' : 'Attention'}
            </h4>
            <p className="text-center text-slate-500 font-medium mb-6">
              {errorMsg}
            </p>
            <button 
              onClick={() => setErrorMsg(null)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors active:scale-95"
            >
              {isAr ? 'حسناً' : 'OK'}
            </button>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-12 max-w-lg w-full text-center shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>

            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              {isAr ? 'تم إرسال طلبكم!' : 'Demande Envoyée !'}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">
              {isAr
                ? 'شكراً ليكم على اختيار BEYA. الفريق ديالنا غادي يراجع الطلب وغادي يتواصل معاكم فـ أقل من 24 ساعة.'
                : 'Merci d\'avoir choisi BEYA. Notre équipe examine votre demande et vous contactera en moins de 24 heures.'}
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Clothing Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] overflow-hidden">
        <div className="absolute inset-0 flex flex-wrap gap-24 p-20 justify-around">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`transform rotate-${(i % 4) * 15}`}>
              {i % 2 === 0 ? <Shirt className="w-20 h-20" /> : <Scissors className="w-20 h-20" />}
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <LogoWithFallback src={company.logoLanding || company.logoUrl} alt={company.name} />
          </div>

          <div className="flex items-center gap-2 md:gap-4">

            <button 
              onClick={toggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-all"
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'FR' : 'العربية'}</span>
            </button>

            <Link 
              to={isLoggedIn ? "/dashboard" : "/login"}
              className="px-4 md:px-8 py-2 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all"
            >
              {isLoggedIn ? (isAr ? 'لوحة التحكم' : 'Espace ERP') : (isAr ? 'Connexion' : 'Connexion')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-12 animate-bounce shadow-md border border-indigo-100">
            <Zap className="w-4 h-4 fill-indigo-600" />
            {isAr ? 'رائد في صناعة الملابس بالمغرب 🇲🇦' : 'Leader de la Confection au Maroc 🇲🇦'}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
            {isAr ? 'نصنع الجودة،' : 'Nous créons la qualité,'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500">
              {isAr ? 'نصمم المستقبل.' : 'Nous façonnons l\'avenir.'}
            </span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            {isAr
              ? 'شريكك الاستراتيجي في إنتاج الملابس الجاهزة. جودة عالمية، دقة في المواعيد، وخبرة مغربية أصيلة.'
              : 'Votre partenaire stratégique en production de prêt-à-porter. Qualité internationale, respect des délais et expertise marocaine authentique.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              {isAr ? 'ابدأ مشروعك معنا' : 'Démarrer votre projet'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
              <Search className="w-5 h-5 text-indigo-500" />
              {isAr ? 'تتبع طلبيتك' : 'Suivre votre commande'}
            </Link>
            <a href={`https://wa.me/${company.phone.replace(/\D/g, '')}`} target="_blank" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              {isAr ? 'تواصل معنا' : 'Contactez-nous'}
            </a>
          </div>
        </div>
      </section>

      {/* Video Presentation Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="relative group">
            {/* Background Decoration */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl md:rounded-[3rem] opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />

            {/* Video Container */}
            <div className="relative aspect-video bg-slate-900 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] border-8 border-white">
              {embedUrl ? (
                embedUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video 
                    src={embedUrl} 
                    controls 
                    className="absolute inset-0 w-full h-full object-cover"
                    poster={company.logoUrl}
                  />
                ) : (
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    scrolling="no"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                )
              ) : (
                <>
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070')] bg-cover bg-center opacity-60 mix-blend-overlay" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-slate-900/80 via-transparent to-transparent">
                    <button className="w-24 h-24 bg-white/20 backdrop-blur-2xl text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all group/play ring-8 ring-white/10 mb-8">
                      <Play className="w-10 h-10 fill-white" />
                    </button>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                      {isAr ? 'شاهد لماذا نحن الأفضل' : 'Découvrez notre savoir-faire'}
                    </h2>
                    <p className="text-white/70 font-bold max-w-xl uppercase tracking-widest text-xs">
                      {isAr ? 'جولة حصرية داخل مصنعنا: من الفكرة إلى القطعة النهائية' : 'Visite exclusive de notre atelier : de l\'idée à la pièce finale'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CTA → Info page */}
          <div className="mt-10 mb-6 flex flex-col items-center gap-3 text-center px-4">
            <p className="text-slate-500 text-sm font-medium">
              {isAr ? '💡 عندك براند أو كدير التجارة الإلكترونية؟' : '💡 Vous avez une marque ou faites du E-commerce ?'}
            </p>
            <a
              href="/#/devis-express"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 group"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', boxShadow: '0 10px 40px rgba(79,70,229,0.35)' }}
            >
              <span className="text-xl">🚀</span>
              {isAr ? 'احصل على عرض سعر سريع (Devis Express)' : 'Demander un Devis Express'}
              <span className="text-white/70 group-hover:translate-x-1 transition-transform text-base">→</span>
            </a>
            <p className="text-[11px] text-slate-400 font-medium">
              {isAr ? 'خدمة مخصصة وسريعة لأصحاب المشاريع والتجارة الإلكترونية' : 'Service rapide dédié aux marques et E-commerce'}
            </p>
          </div>

          {/* Lead Generation Form Section */}
          <div id="contact-form" className="mt-6 bg-white rounded-3xl md:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 md:p-12 lg:p-16 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-6 relative z-10">
                  {isAr ? 'ابدأ مشروعك اليوم' : 'Lancez votre collection'}
                </h3>
                <p className="text-slate-400 font-medium mb-12 relative z-10 leading-relaxed">
                  {isAr
                    ? 'عمر هاد المعلومات وغادي نتواصلو معاك فـ أقل من 24 ساعة باش نعطيوك أحسن عرض ثمن.'
                    : 'Remplissez ce formulaire et notre équipe vous contactera en moins de 24h pour discuter de votre projet et vous proposer le meilleur tarif.'}
                </p>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Réponse Rapide</p>
                      <p className="text-sm font-bold">Moins de 24 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Qualité Garantie</p>
                      <p className="text-sm font-bold">Standards Internationaux</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-12 lg:p-16">
                                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
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
                      setErrorMsg(isAr ? 'المرجو إدخال الإسم الكامل (الشخصي والعائلي)' : 'Veuillez entrer votre nom complet (Prénom et Nom)');
                      return;
                    }

                    setIsSending(true);
                    try {
                      for (const m of models) {
                        const finalType = (m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type;
                        await saveLead({
                          name: clientName,
                          email: clientEmail,
                          phone: fullPhone,
                          ville: clientVille,
                          type: finalType,
                          quantity: Number(m.quantity) || 1,
                          tailles: Object.fromEntries(Object.entries(m.tailles).filter(([_, v]) => v !== '').map(([k, v]) => [k, Number(v)])),
                          details: m.details,
                          photo: m.photos?.[0] || m.photo!,
                          photos: m.photos || (m.photo ? [m.photo] : []),
                        });
                      }
                      
                      trackPixelEvent('Lead', {
                        content_name: models.map(m => m.type).join(', '),
                        content_category: 'Confection Lead',
                        value: models.reduce((acc, m) => acc + (Number(m.quantity) || 1), 0),
                        currency: 'MAD'
                      });

                      setIsSending(false);
                      setShowSuccess(true);
                      setModels([emptyModel()]);
                      setSimulatorStep(1);
                      sendEmailNotification(
                        clientName, fullPhone, clientEmail, clientVille,
                        models.map(m => ({ type: (m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type, quantity: Number(m.quantity) || 1 }))
                      );
                      sendPushToAll(
                        '🧵 Nouvelle Demande!',
                        `${clientName} — ${models.map(m => m.type).join(', ')}`,
                        '/demandes'
                      ).catch(() => {});
                      formElement.reset();
                    } catch (err: any) {
                      setIsSending(false);
                      console.error("Error in LandingPage:", err);
                      setErrorMsg(isAr ? 'وقع خطأ أثناء الإرسال. المرجو التأكد من أن جميع الخانات صحيحة.' : 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
                    }
                  }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                      {simulatorStep === 1 
                        ? (isAr ? 'حاسبة التكلفة' : 'Simulateur de Prix') 
                        : (isAr ? 'إكمال المعلومات' : 'Compléter vos informations')}
                    </h3>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <div className={`h-1.5 rounded-full transition-all ${simulatorStep >= 1 ? 'w-16 bg-indigo-600' : 'w-4 bg-slate-200'}`}></div>
                      <div className={`h-1.5 rounded-full transition-all ${simulatorStep >= 2 ? 'w-16 bg-indigo-600' : 'w-4 bg-slate-200'}`}></div>
                    </div>
                  </div>

                  {simulatorStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      {models.map((m, idx) => (
                        <div key={m.id} className="border-2 border-indigo-100 rounded-2xl p-4 md:p-6 space-y-4 bg-indigo-50/30 relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">{idx + 1}</div>
                              <h3 className="font-black text-slate-800 text-lg">{isAr ? 'الموديل' : 'Modèle'} {idx + 1}</h3>
                            </div>
                            {models.length > 1 && (
                              <button type="button" onClick={() => setModels(prev => prev.filter(x => x.id !== m.id))}
                                className="w-8 h-8 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-all text-xs font-black shadow-sm">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس' : 'Type de vêtement'}</label>
                              <div className="relative">
                                <select value={m.type} onChange={e => updateModel(m.id, { type: e.target.value })}
                                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors appearance-none">
                                  {tarifsDb.map(t => <option key={t.id} value={t.titre}>{t.titre}</option>)}
                                  {tarifsDb.length === 0 && (
                                    <>
                                      {['T-Shirt','Polo','T-Shirt Oversize','Sweat / Hoodie','Djellaba / Gandoura','Ensemble / Survêtement','Pyjama','Uniforme / Travail','Pantalon'].map(t => <option key={t}>{t}</option>)}
                                    </>
                                  )}
                                  <option value="Autre">{isAr ? 'نوع آخر (Autre...)' : 'Autre...'}</option>
                                </select>
                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                              {m.type === 'Autre' && (
                                <input type="text" value={m.customType} onChange={e => updateModel(m.id, { customType: e.target.value })}
                                  placeholder={isAr ? 'حدد النوع' : 'Spécifiez le type'}
                                  className="mt-2 w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600" required />
                              )}
                            </div>
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'الكمية الإجمالية للموديل' : 'Quantité Totale'}</label>
                              <input type="number" min="1" placeholder="100" value={m.quantity} onChange={e => updateModel(m.id, { quantity: e.target.value })}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 h-[50px]" required />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'المقاسات (اختياري - وزع الكمية)' : 'Tailles (Optionnel)'}</label>
                            <div className="grid grid-cols-6 gap-2">
                              {['XS','S','M','L','XL','XXL'].map(size => (
                                <div key={size} className="relative group">
                                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 bg-indigo-50 text-[8px] font-black text-indigo-600 rounded-full border border-indigo-100 z-10">{size}</div>
                                  <input type="number" value={m.tailles[size]} onChange={e => updateModelTaille(m.id, size, e.target.value)} placeholder="0"
                                    className="w-full bg-white border-2 border-slate-200 rounded-xl pt-3 pb-1 px-1 text-center text-xs font-black outline-none focus:border-indigo-600 h-[50px]" />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'تفاصيل الطلب (ألوان، نوع الثوب...)' : 'Détails de la commande (Couleurs, Tissu...)'}</label>
                              <textarea rows={3} value={m.details} onChange={e => updateModel(m.id, { details: e.target.value })}
                                placeholder={isAr ? 'اشرح شنو باغي...' : 'Expliquez ce que vous voulez...'}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 resize-none" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">
                                {isAr ? 'صورة الموديل' : 'Photo du modèle'} <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {(m.photos || (m.photo ? [m.photo] : [])).map((p, pIdx) => (
                                  <div key={pIdx} className="relative w-[100px] h-[100px] rounded-xl overflow-hidden border-2 border-indigo-200 shadow-sm">
                                    <img src={p} className="w-full h-full object-cover" alt="" />
                                    <button type="button" onClick={() => removeModelPhoto(m.id, pIdx)}
                                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {(m.photos || (m.photo ? [m.photo] : [])).length < 5 && (
                                  <label className="flex flex-col items-center justify-center w-[100px] h-[100px] bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all shrink-0">
                                    <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1 leading-tight">{isAr ? 'إضافة صورة' : 'Ajouter'}</span>
                                    <input type="file" accept="image/*" onChange={e => handleModelPhoto(m.id, e)} className="hidden" />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Line Simulator Display */}
                          {(() => {
                            const est = calculateEstimate(m.type, m.quantity);
                            if (!est) return null;
                            return (
                              <div className="mt-4 p-4 bg-white border-2 border-emerald-100 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'التكلفة التقديرية' : 'Coût Estimé'}</p>
                                </div>
                                <div className={`text-${isAr ? 'left' : 'right'}`}>
                                  <p className="text-sm font-black text-slate-800">{est.min} - {est.max} MAD <span className="text-xs text-slate-500">{isAr ? '/ قطعة' : '/ Pièce'}</span></p>
                                  <p className="text-xs font-bold text-emerald-500">{isAr ? 'الإجمالي:' : 'Total :'} {est.totalMin.toLocaleString()} - {est.totalMax.toLocaleString()} MAD</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ))}

                      <button type="button" onClick={() => setModels(prev => [...prev, emptyModel()])}
                        className="w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-600 bg-indigo-50/50 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                        + {isAr ? 'إضافة موديل آخر' : 'Ajouter un autre modèle'}
                      </button>

                      {(() => {
                        const liveTotals = models.reduce((acc, m) => {
                          const est = calculateEstimate(m.type, m.quantity);
                          if (est) {
                            acc.min += est.totalMin;
                            acc.max += est.totalMax;
                          }
                          return acc;
                        }, { min: 0, max: 0 });

                        return liveTotals.max > 0 && (
                          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-300">
                            <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">{isAr ? 'إجمالي تكلفة مشروعك التقديرية' : 'Estimation Totale du Projet'}</p>
                            <p className="text-3xl font-black text-emerald-700">
                              {liveTotals.min.toLocaleString()} - {liveTotals.max.toLocaleString()} {isAr ? 'درهم' : 'DH'}
                            </p>
                            <p className="text-xs font-medium text-emerald-600/70 mt-2">{isAr ? 'السعر قابل للتفاوض البسيط حسب التفاصيل الدقيقة.' : 'Prix légèrement négociable selon les détails exacts.'}</p>
                          </div>
                        );
                      })()}

                      <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                        {isAr ? 'أنا موافق، أكمل معلوماتي للعمل فوراً' : "Je suis d'accord, compléter mes informations"} <ArrowRight className={`w-5 h-5 ${isAr ? '-scale-x-100' : ''}`} />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: CONTACT INFO */}
                  {simulatorStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 font-medium">{isAr ? 'خطوة أخيرة! أدخل معلوماتك لكي يتواصل معك فريقنا في أقرب وقت لتأكيد الطلب وبدء العمل على العينة.' : "Dernière étape ! Entrez vos informations pour que notre équipe vous contacte rapidement et commence le travail sur l'échantillon."}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">{isAr ? 'الإسم الكامل' : 'Nom Complet'}</label>
                          <input type="text" name="name" placeholder={isAr ? "مثال: أحمد العلمي" : "Ex: Ahmed Alami"} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                        </div>
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">Email</label>
                          <input type="email" name="email" placeholder="email@example.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">{isAr ? 'رقم الهاتف / الواتساب' : 'Téléphone / WhatsApp'}</label>
                          <div className="flex gap-3">
                            <div className="relative w-[100px] flex-shrink-0">
                              <select name="countryCode" className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-4 pr-8 text-xs font-black outline-none focus:border-indigo-600 transition-colors h-[58px]">
                                <option value="+212">🇲🇦 212</option>
                                <option value="+33">🇫🇷 33</option>
                                <option value="+34">🇪🇸 34</option>
                                <option value="+1">🇺🇸 1</option>
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                            <input type="tel" name="phone" placeholder="6XXXXXXXX" className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-indigo-600 transition-colors h-[58px]" dir="ltr" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">{isAr ? 'المدينة' : 'Ville'}</label>
                          <input type="text" name="ville" placeholder={isAr ? "مثال: الدار البيضاء" : "Ex: Casablanca"} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setSimulatorStep(1)} className="px-6 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                          {isAr ? 'رجوع' : 'Retour'}
                        </button>
                        <button type="submit" disabled={isSending} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
                          {isSending ? (isAr ? 'جاري الإرسال...' : 'Envoi en cours...') : (isAr ? 'تأكيد الطلب الآن' : 'Confirmer la commande')}
                          {!isSending && <CheckCircle className="w-5 h-5 ml-2" />}
                        </button>
                      </div>
                      <p className="text-center text-[10px] font-bold text-slate-400 mt-4">{isAr ? 'معلوماتك آمنة ولن يتم مشاركتها مع أي طرف ثالث.' : 'Vos informations sont en sécurité et ne seront pas partagées.'}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 ${isAr ? 'md:flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : 'text-left'}>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
                {isAr ? 'خدماتنا الاحترافية' : 'Nos Services Experts'}
              </h2>
              <div className={`h-2 w-48 bg-indigo-600 rounded-full ${isAr ? 'mr-0 ml-auto' : ''}`} />
            </div>
            <p className={`text-slate-500 font-bold max-w-md ${isAr ? 'text-right' : 'text-left'}`}>
              {isAr
                ? 'نحن نوفر حلولاً متكاملة لصناعة الملابس تبدأ من اختيار المواد الأولية وتصميم النماذج وصولاً إلى الإنتاج الضخم.'
                : 'Nous offrons des solutions complètes de fabrication textile, du choix des matières premières à la production de masse.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="group p-10 bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
                <div className={`w-16 h-16 rounded-[2rem] bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-8 shadow-lg transform group-hover:rotate-12 transition-transform`}>
                  <s.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{s.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Loading Modal */}
      {isSending && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-12 max-w-sm w-full shadow-2xl border border-white/50 relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
            
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100 border-4 border-white animate-bounce duration-1000">
                <RotateCw className="w-10 h-10 animate-spin" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">
              {isAr ? 'جاري الإرسال...' : 'Envoi en cours...'}
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              {isAr ? 'نحن نسجل طلبك، انتظر لحظة من فضلك' : 'Nous enregistrons votre demande, un instant s\'il vous plaît'}
            </p>
            
            <div className="mt-8 flex gap-1">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* About Us Section - "Man Nahnu" */}
      <section id="about" className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -ml-32 -mt-32" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-[100px] -mr-32 -mb-32" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-600 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
              <img 
                src={company.aboutPhotoUrl || "https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?q=80&w=2070"} 
                alt="Atelier BEYA" 
                className="relative rounded-[3rem] shadow-2xl border-4 border-white/5 object-cover h-[500px] w-full"
              />
              <div className={`absolute -bottom-10 ${isAr ? '-left-10' : '-right-10'} bg-white p-8 rounded-[2rem] shadow-2xl hidden md:block border border-slate-100 animate-in slide-in-from-bottom-10 duration-700`}>
                <p className="text-4xl font-black text-indigo-600 mb-1 leading-none">{company.experienceYears || '15+'}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isAr ? (company.experienceTextAr || 'سنة من الخبرة') : (company.experienceTextFr || 'Ans d\'Expérience')}
                </p>
              </div>
            </div>

            <div className={isAr ? 'text-right' : 'text-left'}>
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 border border-white/10 mb-8">
                <Star className="w-4 h-4" />
                {isAr ? 'من نحن' : 'Qui Sommes-Nous'}
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter leading-none italic">
                {isAr 
                  ? (company.aboutTitleAr || 'قصة نجاح مغربية') 
                  : (company.aboutTitleFr || 'Une Excellence')} <br />
                <span className="text-indigo-400">
                  {isAr ? (company.aboutTitleAr ? '' : 'بمعايير عالمية') : (company.aboutTitleFr ? '' : 'Marocaine.')}
                </span>
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                {isAr 
                  ? (company.aboutTextAr || 'BEYA CREATIVE هي ثمرة سنوات من الشغف في مجال النسيج والخياطة. نحن لسنا مجرد مصنع، بل شريك استراتيجي يساعدك على تحويل أفكارك إلى واقع ملموس بجودة تضاهي كبريات الماركات العالمية.')
                  : (company.aboutTextFr || 'BEYA CREATIVE est le fruit de plusieurs années de passion pour le textile. Nous ne sommes pas qu\'une simple usine, mais un partenaire stratégique qui transforme vos idées en réalité avec une qualité digne des plus grandes marques internationales.')}
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-3">{isAr ? 'رؤيتنا' : 'Notre Vision'}</h4>
                  <p className="text-sm text-slate-300 font-medium">
                    {isAr ? (company.visionTextAr || 'أن نكون الرائد الأول في صناعة الملابس عالية الجودة بالمغرب.') : (company.visionTextFr || 'Être le leader incontesté de la confection haut de gamme au Maroc.')}
                  </p>
                </div>
                <div>
                  <h4 className="text-rose-400 font-black uppercase tracking-widest text-xs mb-3">{isAr ? 'مهمتنا' : 'Notre Mission'}</h4>
                  <p className="text-sm text-slate-300 font-medium">
                    {isAr ? (company.missionTextAr || 'توفير حلول متكاملة تضمن دقة التصنيع وسرعة التسليم.') : (company.missionTextFr || 'Offrir des solutions complètes garantissant précision et rapidité.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase mb-6">
              {isAr ? 'تواصل معنا' : 'Contactez-Nous'}
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              {isAr ? 'نحن هنا للإجابة على جميع استفساراتكم' : 'Nous sommes à votre disposition pour toute question'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-slate-900 hover:text-white transition-all duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">{isAr ? 'مقرنا' : 'Adresse'}</h3>
              <p className="text-sm font-medium opacity-70">{company.address}</p>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-slate-900 hover:text-white transition-all duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">{isAr ? 'واتساب' : 'WhatsApp'}</h3>
              <p className="text-sm font-black tracking-widest tabular-nums">{company.phone}</p>
              <a href={`https://wa.me/${company.phone.replace(/\D/g, '')}`} className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">{isAr ? 'دردشة مباشرة' : 'Chat Direct'}</a>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-slate-900 hover:text-white transition-all duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-600 mb-6 shadow-sm group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <LogOut className="w-8 h-8 rotate-180" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Email</h3>
              <p className="text-sm font-medium opacity-70">{company.email}</p>
            </div>
          </div>

          {/* Interactive Map (Link to Google Maps) */}
          <a 
            href={company.googleMapsUrl || "https://www.google.com/maps/search/?api=1&query=Meknes+Morocco"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-20 relative rounded-[3rem] overflow-hidden h-[400px] border-8 border-slate-50 group block cursor-pointer"
          >
             <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-all flex items-center justify-center z-10">
                <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce group-hover:scale-110 transition-transform">
                   <MapPin className="w-6 h-6 text-rose-500" />
                   <span className="text-sm font-black uppercase tracking-widest text-slate-900">{isAr ? 'تجدوننا هنا' : 'Nous trouver ici'}</span>
                </div>
             </div>
             <img 
               src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074" 
               alt="Map" 
               className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
             />
          </a>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-slate-100 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-6 md:p-12">
            <div className={isAr ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                {company.logoFooter ? (
                  <img src={company.logoFooter} alt="Logo Footer" className="w-auto h-12 object-contain" loading="lazy" />
                ) : company.logoUrl && company.logoUrl !== '/logo.png' ? (
                  <img src={company.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-xl" loading="lazy" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                )}
                <span className="text-2xl font-black uppercase tracking-tighter italic">
                  {company.name.split(' ')[0]}<span className="text-indigo-400">{company.name.split(' ').slice(1).join(' ')}</span>
                </span>
              </div>
              <p className="text-slate-400 max-w-sm font-medium">
                {isAr
                  ? 'رؤيتنا هي أن نصبح المعيار العالمي للجودة في صناعة الملابس المغربية.'
                  : 'Notre vision est d\'être la référence mondiale de qualité dans l\'industrie textile marocaine.'}
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{isAr ? 'روابط سريعة' : 'Liens Rapides'}</p>
              <div className="flex flex-wrap justify-center md:justify-end gap-4">
                <a href="/#/info" className="px-6 py-3 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-indigo-600/30 flex items-center gap-2">
                  📋 {isAr ? 'الأسعار والخدمات' : 'Prix & Services'}
                </a>
                <Link to="/recrutement" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {isAr ? 'التوظيف' : 'Recrutement'}
                </Link>
                <a href="https://www.instagram.com/beyacreative/" target="_blank" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                  Instagram
                </a>
                <a href="https://ma.linkedin.com/in/beya-creative-265a9a322" target="_blank" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-white/5 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} {company.name || 'BEYA CREATIVE'}. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
