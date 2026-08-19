import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { ArrowRight, ArrowDown, Code, Scissors, ShoppingBag, Store, Globe, Zap, Star, Settings, ChevronRight, Play, Pause, Volume2, VolumeX, MousePointerClick, MessageSquareText, PhoneCall, Shirt, PenTool, Ruler, Eye, HeartHandshake, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';
import ProjectRequestModal from '../components/ProjectRequestModal';

const styles = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-100%); }
  }
  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marquee 40s linear infinite;
  }
  .glass-header {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .apple-gradient {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }
  .text-balance {
    text-wrap: balance;
  }
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); opacity: 0.05; }
    50% { transform: translateY(-20px) rotate(5deg); opacity: 0.15; }
    100% { transform: translateY(0px) rotate(0deg); opacity: 0.05; }
  }
  @keyframes float-reverse {
    0% { transform: translateY(0px) rotate(0deg); opacity: 0.05; }
    50% { transform: translateY(20px) rotate(-5deg); opacity: 0.15; }
    100% { transform: translateY(0px) rotate(0deg); opacity: 0.05; }
  }
  @keyframes float-slow {
    0% { transform: translate(0px, 0px) rotate(0deg); opacity: 0.03; }
    33% { transform: translate(30px, -50px) rotate(10deg); opacity: 0.1; }
    66% { transform: translate(-20px, 20px) rotate(-10deg); opacity: 0.08; }
    100% { transform: translate(0px, 0px) rotate(0deg); opacity: 0.03; }
  }
  
  [dir="ltr"] .slide-from-start { opacity: 0; transform: translateX(-100px); }
  [dir="ltr"] .slide-from-end { opacity: 0; transform: translateX(100px); }
  [dir="rtl"] .slide-from-start { opacity: 0; transform: translateX(100px); }
  [dir="rtl"] .slide-from-end { opacity: 0; transform: translateX(-100px); }
  
  .slide-fade-up { opacity: 0; transform: translateY(30px); }

  .slide-from-start, .slide-from-end, .slide-fade-up {
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .slide-from-start.is-visible,
  .slide-from-end.is-visible,
  .slide-fade-up.is-visible {
    opacity: 1;
    transform: translate(0, 0);
  }
`;

const TRANSLATIONS: any = {
  ar: {
    dir: 'rtl',
    navEcosystem: 'المنظومة',
    navHowItWorks: 'كيف نعمل',
    navOrder: 'سجل طلبك',
    navLogin: 'تسجيل الدخول',
    navStart: 'ابدأ الآن',
    heroBadge: 'المنظومة المتكاملة',
    heroTitle: 'نصنع علامتك التجارية من الفكرة إلى القطعة النهائية.',
    heroDesc: 'نوفر للعلامات التجارية حلول تصنيع متكاملة بأعلى معايير الجودة الصناعية. من اختيار الأقمشة إلى الخياطة والتغليف، مصنعنا هو شريكك لإنتاج ملابسك باحترافية.',
    heroStartProject: 'ابدأ مشروعك الآن',
    heroDetails: 'تفاصيل المنظومة',
    marquee1: 'التجارة الإلكترونية',
    marquee2: 'صناعة النسيج',
    marquee3: 'الأنظمة الذكية',
    dualTitle: 'من الإبرة... للمتجر.',
    dualDesc: 'وجهان لمنظومة واحدة متكاملة.',
    techTitle: 'الجانب التقني',
    techDesc: 'بنية تحتية متطورة، متاجر سريعة، وتحليل دقيق للبيانات.',
    indTitle: 'الجانب الصناعي',
    indDesc: 'إنتاج فعلي وملموس بمعايير الجودة العالية لمنتجاتك.',
    orderTitle: 'كيفاش تسجل الطلب ديالك؟',
    orderDesc: 'خطوات بسيطة باش تبدا معانا الخدمة.',
    usage1Title: '1. اضغط على ابدأ مشروعك',
    usage1Desc: 'ابحث عن الزر في أعلى أو وسط الصفحة.',
    usage2Title: '2. أجب عن أسئلة بسيطة',
    usage2Desc: 'أخبرنا من أنت وعن مشروعك في 3 خطوات سريعة.',
    usage3Title: '3. سنتصل بك فوراً',
    usage3Desc: 'سيتصل بك فريقنا في أقرب وقت لتأكيد طلبك والبدء.',
    processTitle: 'كيف نعمل؟',
    processDesc: 'مسار واضح، شفاف واحترافي.',
    proc1Title: 'تواصل معنا',
    proc1Desc: 'أخبرنا من أنت وماذا تبحث عنه عبر نموذجنا الذكي.',
    proc2Title: 'دراسة واستشارة',
    proc2Desc: 'يقوم فريقنا بتحليل مشروعك ويقترح أفضل نهج تقني ومالي.',
    proc3Title: 'صنع العينة',
    proc3Desc: 'نحن نقوم بصنع الباترون والعينة الأولى لكي تؤكدها.',
    proc4Title: 'الإنتاج',
    proc4Desc: 'بمجرد التأكيد، نبدأ الإنتاج بالجملة مع مراقبة جودة صارمة.',
    proc5Title: 'التوصيل',
    proc5Desc: 'منتجاتك جاهزة، مغلفة بعناية ويتم توصيلها في الوقت المحدد.',
    ctaTitle: 'مستعد للبدء؟',
    ctaDesc: 'انضم إلينا اليوم وابنِ مشروعك على أسس صلبة واحترافية.',
    ctaBtn: 'ابدأ مشروعك الآن',
    footerRights: 'جميع الحقوق محفوظة.',
    footerPrivacy: 'سياسة الخصوصية',
    footerCookies: 'ملفات تعريف الارتباط',
    footerIdea: 'كيف نطور فكرتك لتنجح؟'
  },
  fr: {
    dir: 'ltr',
    navEcosystem: 'Écosystème',
    navHowItWorks: 'Comment ça marche',
    navOrder: 'Commander',
    navLogin: 'Connexion',
    navStart: 'Commencer',
    heroBadge: 'L\'Écosystème Intégré',
    heroTitle: 'Nous fabriquons votre marque de l\'idée à la pièce finale.',
    heroDesc: 'Nous offrons aux marques des solutions de fabrication complètes avec les plus hauts standards industriels. Du choix des tissus à la couture et à l\'emballage, notre usine est votre partenaire de production.',
    heroStartProject: 'Démarrer votre projet',
    heroDetails: 'Détails de l\'écosystème',
    marquee1: 'E-COMMERCE',
    marquee2: 'TEXTILE INDUSTRY',
    marquee3: 'SMART SYSTEMS',
    dualTitle: 'De l\'aiguille... à la boutique.',
    dualDesc: 'Deux facettes d\'un même écosystème intégré.',
    techTitle: 'Le Côté Tech',
    techDesc: 'Infrastructure moderne, boutiques rapides et analyse de données.',
    indTitle: 'Le Côté Industriel',
    indDesc: 'Production réelle et tangible avec des standards de haute qualité.',
    orderTitle: 'Comment soumettre votre demande ?',
    orderDesc: 'Des étapes simples pour commencer avec nous.',
    usage1Title: '1. Cliquez sur Démarrer',
    usage1Desc: 'Trouvez le bouton en haut ou au milieu de la page.',
    usage2Title: '2. Répondez aux questions',
    usage2Desc: 'Parlez-nous de vous et votre projet en 3 étapes rapides.',
    usage3Title: '3. On vous contacte',
    usage3Desc: 'Notre équipe vous appellera pour confirmer et lancer votre projet.',
    processTitle: 'Comment ça marche ?',
    processDesc: 'Un processus clair, transparent et professionnel.',
    proc1Title: 'Prise de Contact',
    proc1Desc: 'Dites-nous qui vous êtes et ce que vous cherchez via notre formulaire intelligent.',
    proc2Title: 'Étude & Conseil',
    proc2Desc: 'Notre équipe analyse votre projet et vous propose la meilleure approche technique et financière.',
    proc3Title: 'Prototypage',
    proc3Desc: 'Nous réalisons le patronage et le premier échantillon (prototype) pour votre validation.',
    proc4Title: 'Production',
    proc4Desc: 'Une fois validé, nous lançons la production en série avec un contrôle qualité strict.',
    proc5Title: 'Livraison',
    proc5Desc: 'Vos articles sont prêts, emballés avec soin et livrés selon vos délais.',
    ctaTitle: 'Prêt à commencer ?',
    ctaDesc: 'Rejoignez-nous aujourd\'hui et bâtissez votre projet sur des bases solides.',
    ctaBtn: 'Démarrer maintenant',
    footerRights: 'Tous droits réservés.',
    footerPrivacy: 'Politique de Confidentialité',
    footerCookies: 'Cookies',
    footerIdea: 'Développer votre idée'
  },
  en: {
    dir: 'ltr',
    navEcosystem: 'Ecosystem',
    navHowItWorks: 'How it works',
    navOrder: 'Order',
    navLogin: 'Login',
    navStart: 'Start Now',
    heroBadge: 'The Integrated Ecosystem',
    heroTitle: 'We manufacture your brand from idea to final piece.',
    heroDesc: 'We offer brands complete manufacturing solutions with the highest industrial standards. From fabric selection to sewing and packaging, our factory is your production partner.',
    heroStartProject: 'Start your project',
    heroDetails: 'Ecosystem details',
    marquee1: 'E-COMMERCE',
    marquee2: 'TEXTILE INDUSTRY',
    marquee3: 'SMART SYSTEMS',
    dualTitle: 'From needle... to store.',
    dualDesc: 'Two facets of a single integrated ecosystem.',
    techTitle: 'The Tech Side',
    techDesc: 'Modern infrastructure, fast stores, and precise data analysis.',
    indTitle: 'The Industrial Side',
    indDesc: 'Real and tangible production with high quality standards.',
    orderTitle: 'How to submit your request?',
    orderDesc: 'Simple steps to start with us.',
    usage1Title: '1. Click on Start',
    usage1Desc: 'Find the button at the top or middle of the page.',
    usage2Title: '2. Answer questions',
    usage2Desc: 'Tell us about yourself and your project in 3 quick steps.',
    usage3Title: '3. We contact you',
    usage3Desc: 'Our team will call you soon to confirm and start your project.',
    processTitle: 'How does it work?',
    processDesc: 'A clear, transparent and professional process.',
    proc1Title: 'Contact Us',
    proc1Desc: 'Tell us who you are and what you\'re looking for via our smart form.',
    proc2Title: 'Study & Consulting',
    proc2Desc: 'Our team analyzes your project and proposes the best technical and financial approach.',
    proc3Title: 'Prototyping',
    proc3Desc: 'We create the pattern and first sample for your validation.',
    proc4Title: 'Production',
    proc4Desc: 'Once validated, we launch mass production with strict quality control.',
    proc5Title: 'Delivery',
    proc5Desc: 'Your items are ready, carefully packaged and delivered on time.',
    ctaTitle: 'Ready to start?',
    ctaDesc: 'Join us today and build your project on solid foundations.',
    ctaBtn: 'Start now',
    footerRights: 'All rights reserved.',
    footerPrivacy: 'Privacy Policy',
    footerCookies: 'Cookies',
    footerIdea: 'Develop your idea'
  }
};

function useScrollFocus() {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          const elementCenter = rect.top + rect.height / 2;
          const maxDistance = window.innerHeight;
          
          const distance = Math.abs(viewportCenter - elementCenter);
          let newScale = 1 - (distance / maxDistance) * 0.15;
          let newOpacity = 1 - (distance / maxDistance) * 0.8;
          
          const finalScale = Math.max(0.85, Math.min(1, newScale));
          const finalOpacity = Math.max(0.2, Math.min(1, newOpacity));
          
          ref.current.style.transform = `scale(${finalScale})`;
          ref.current.style.opacity = finalOpacity.toString();
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    if (ref.current) {
      ref.current.style.transform = `scale(1)`;
      ref.current.style.opacity = `1`;
    }
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, style: { willChange: 'transform, opacity' } };
}

export default function LandingPage() {
  const { setLang: setCtxLang, lang: ctxLang } = useLang();
  const location = useLocation();
  const heroFocus = useScrollFocus();
  const [scrolled, setScrolled] = useState(false);
  const heroVideoRef = React.useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true); // Must be true for mobile autoplay
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Parse language from URL path
  const [currentLang, setCurrentLang] = useState<'ar'|'fr'|'en'>(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/ar') return 'ar';
    if (path === '/fr') return 'fr';
    if (path === '/en') return 'en';
    const ls = localStorage.getItem('funnel_lang') || localStorage.getItem('textrack_lang');
    if (ls === 'ar' || ls === 'fr' || ls === 'en') return ls as 'ar'|'fr'|'en';
    return 'fr';
  });

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let newLang = currentLang;
    if (path === '/ar') newLang = 'ar';
    else if (path === '/fr') newLang = 'fr';
    else if (path === '/en') newLang = 'en';

    if (newLang !== currentLang) {
      setCurrentLang(newLang);
      setCtxLang(newLang);
    }
  }, [location.pathname]);

  const changeLang = (l: 'ar'|'fr'|'en') => {
    setCurrentLang(l);
    setCtxLang(l as any);
    localStorage.setItem('funnel_lang', l);
    localStorage.setItem('textrack_lang', l);
    window.location.hash = `#/${l}`;
  };

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;
  const isAr = currentLang === 'ar';

  useEffect(() => {
    // Auto-scroll to video for ads: show top info briefly, then scroll to video
    const timer = setTimeout(() => {
      document.getElementById('hero-video')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1500); // 1.5 seconds delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.scroll-animate-item').forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const toggleVideoPlay = () => {
    const v = heroVideoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setVideoPlaying(true); }
    else { v.pause(); setVideoPlaying(false); }
  };

  const toggleVideoMute = () => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setVideoMuted(v.muted);
  };

  const usageSteps = [
    { icon: MousePointerClick, title: t.usage1Title, desc: t.usage1Desc },
    { icon: MessageSquareText, title: t.usage2Title, desc: t.usage2Desc },
    { icon: PhoneCall, title: t.usage3Title, desc: t.usage3Desc }
  ];

  const processSteps = [
    { title: t.proc1Title, desc: t.proc1Desc },
    { title: t.proc2Title, desc: t.proc2Desc },
    { title: t.proc3Title, desc: t.proc3Desc },
    { title: t.proc4Title, desc: t.proc4Desc },
    { title: t.proc5Title, desc: t.proc5Desc },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1d1d1f] font-sans overflow-x-hidden selection:bg-slate-200" dir={t.dir}>
      <style>{styles}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-header py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
             <img src="/logo-blue.png" alt="Beya Creative" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg shrink-0" />
             <span className="text-[15px] sm:text-xl font-semibold tracking-tight text-slate-900 whitespace-nowrap">Beya Creative</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/ecosystem" className="text-sm font-bold text-[#0071e3] hover:text-[#0077ED] transition-colors shrink-0">
              {t.navEcosystem}
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors shrink-0">
              {t.navHowItWorks}
            </a>
            <a href="#order-steps" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors shrink-0">
              {t.navOrder}
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 relative shrink-0">
            <div className="relative shrink-0" onMouseEnter={() => setShowLangMenu(true)} onMouseLeave={() => setShowLangMenu(false)}>
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)} 
                className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-1 shrink-0 h-8"
              >
                {currentLang} <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-1 w-24 bg-white border border-slate-100 rounded-xl shadow-xl animate-fade-in flex flex-col overflow-hidden z-[60]">
                  <button onClick={() => { changeLang('ar'); setShowLangMenu(false); }} className={`px-4 py-2 text-sm text-center hover:bg-slate-50 transition-colors ${currentLang === 'ar' ? 'font-bold text-[#0071e3]' : 'text-slate-600 font-medium'}`}>العربية</button>
                  <div className="h-px bg-slate-100 w-full" />
                  <button onClick={() => { changeLang('fr'); setShowLangMenu(false); }} className={`px-4 py-2 text-sm text-center hover:bg-slate-50 transition-colors ${currentLang === 'fr' ? 'font-bold text-[#0071e3]' : 'text-slate-600 font-medium'}`}>FR</button>
                  <div className="h-px bg-slate-100 w-full" />
                  <button onClick={() => { changeLang('en'); setShowLangMenu(false); }} className={`px-4 py-2 text-sm text-center hover:bg-slate-50 transition-colors ${currentLang === 'en' ? 'font-bold text-[#0071e3]' : 'text-slate-600 font-medium'}`}>EN</button>
                </div>
              )}
            </div>
            
            <Link to="/login" className="text-[12px] sm:text-sm font-medium text-slate-800 hover:text-black transition-colors whitespace-nowrap shrink-0">
              {t.navLogin}
            </Link>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#1d1d1f] text-white font-medium text-[12px] sm:text-sm hover:bg-black transition-all whitespace-nowrap shrink-0">
              {t.navStart}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 min-h-[90vh] flex items-center relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className={isAr ? 'text-center lg:text-right' : 'text-center lg:text-left'}>
            <div className="mb-6 inline-flex items-center justify-center">
              <span className="px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full border border-slate-200 uppercase tracking-widest">
                {t.heroBadge}
              </span>
            </div>

            <h1 className={`text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-[#1d1d1f] leading-[1.1] mb-6 text-balance animate-in slide-in-from-bottom-8 duration-1000 ${isAr ? 'font-arabic' : ''}`}>
              {t.heroTitle}
            </h1>

            <p className="text-xl md:text-2xl text-[#86868b] leading-relaxed mb-10 animate-in slide-in-from-bottom-8 duration-1000 delay-150 font-medium text-balance">
              {t.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
              <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                {t.heroStartProject} <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
              <Link to="/ecosystem" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                {t.heroDetails} <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>

          <div id="hero-video" ref={heroFocus.ref} style={heroFocus.style} className="relative rounded-[2rem] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] border-b-4 border-[#0071e3] aspect-[2/3] md:aspect-[4/5] w-full h-auto md:h-[680px] md:w-auto mx-auto animate-in slide-in-from-bottom-8 duration-1000 delay-150 group">
            <video
              ref={heroVideoRef}
              autoPlay
              loop
              muted={videoMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/beya-creative.mp4" type="video/mp4" />
            </video>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <button
                onClick={toggleVideoPlay}
                aria-label={videoPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors shadow-lg"
              >
                {videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={toggleVideoMute}
                aria-label={videoMuted ? 'Unmute' : 'Mute'}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors shadow-lg"
              >
                {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="lg:hidden flex justify-center mt-2 w-full px-2">
             <button onClick={() => setIsModalOpen(true)} className="w-full py-4 rounded-full bg-[#1d1d1f] text-white font-bold text-lg hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 animate-in slide-in-from-bottom-8 duration-1000 delay-500 cursor-pointer">
               {t.navStart} <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
             </button>
          </div>
        </div>

        {/* Universal Scroll Down Arrow (Fixed to bottom, hides on scroll) */}
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 flex-col items-center animate-bounce ${scrolled ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>
          <button 
            onClick={() => document.getElementById('hero-video')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,113,227,0.25)] border border-[#0071e3]/20 text-[#0071e3] hover:bg-white transition-all hover:scale-110"
            aria-label="Scroll down"
          >
            <ArrowDown className="w-7 h-7" />
          </button>
        </div>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
           <div className="w-[120%] h-64 bg-gradient-to-b from-slate-50 to-white rounded-[100%] -top-32 absolute left-1/2 -translate-x-1/2" />
           <div className="absolute top-[20%] left-[10%] text-[#0071e3]" style={{ animation: 'float-slow 15s ease-in-out infinite' }}>
             <Scissors className="w-12 h-12" />
           </div>
           <div className="absolute top-[70%] left-[15%] text-[#1d1d1f]" style={{ animation: 'float 12s ease-in-out infinite' }}>
             <Store className="w-16 h-16" />
           </div>
           <div className="absolute top-[25%] right-[15%] text-[#0071e3]" style={{ animation: 'float-reverse 18s ease-in-out infinite' }}>
             <Code className="w-14 h-14" />
           </div>
           <div className="absolute top-[65%] right-[10%] text-[#1d1d1f]" style={{ animation: 'float-slow 20s ease-in-out infinite' }}>
             <Globe className="w-20 h-20 opacity-50" />
           </div>
           <div className="absolute top-[45%] left-[50%] text-[#0071e3]" style={{ animation: 'float 14s ease-in-out infinite' }}>
             <Zap className="w-10 h-10" />
           </div>
           <div className="absolute top-[10%] right-[35%] w-32 h-32 rounded-full border border-[#0071e3]/10" style={{ animation: 'float-slow 25s linear infinite' }} />
           <div className="absolute bottom-[20%] left-[40%] w-24 h-24 rounded-2xl border border-[#1d1d1f]/10 rotate-45" style={{ animation: 'float-reverse 22s linear infinite' }} />
        </div>
      </section>

      {/* Marquee */}
      <section className="py-5 border-y border-slate-200 bg-slate-50 overflow-hidden flex flex-nowrap w-full">
        <div className="flex items-center flex-shrink-0 animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={`m1-${i}`} className="flex items-center gap-10 mx-5 text-base font-bold text-slate-800 tracking-wider uppercase">
              <span>{t.marquee1}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{t.marquee2}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{t.marquee3}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
            </div>
          ))}
        </div>
        <div className="flex items-center flex-shrink-0 animate-marquee whitespace-nowrap" aria-hidden="true">
          {[...Array(10)].map((_, i) => (
            <div key={`m2-${i}`} className="flex items-center gap-10 mx-5 text-base font-bold text-slate-800 tracking-wider uppercase">
              <span>{t.marquee1}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{t.marquee2}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{t.marquee3}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
            </div>
          ))}
        </div>
      </section>

      {/* Dual Core Concept */}
      <section className="py-32 px-6 bg-[#FBFBFD] border-y border-slate-100 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#1d1d1f]">{t.dualTitle}</h2>
           <p className="text-lg text-[#86868b] max-w-xl mx-auto mb-20">{t.dualDesc}</p>

           <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-0">
              <div className="slide-from-start scroll-animate-item relative flex-1 max-w-sm mx-auto md:mx-0 md:mr-[-1px]">
                 <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,113,227,0.12)] hover:-translate-y-1 transition-all duration-300 h-full">
                   <div className="w-20 h-20 rounded-2xl bg-[#0071e3] flex items-center justify-center mb-6 mx-auto shadow-[0_8px_24px_rgba(0,113,227,0.35)]">
                     <Code className="w-9 h-9 text-white" />
                   </div>
                   <h3 className="text-2xl font-semibold mb-3 text-[#1d1d1f]">{t.techTitle}</h3>
                   <p className="text-[#86868b] leading-relaxed">{t.techDesc}</p>
                 </div>
              </div>

              <div className="hidden md:flex items-center justify-center z-10 -mx-5 slide-fade-up scroll-animate-item" style={{ transitionDelay: '0.2s' }}>
                <div className="w-12 h-12 rounded-full bg-white border-4 border-[#FBFBFD] shadow-md flex items-center justify-center text-[#0071e3]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
              </div>

              <div className="slide-from-end scroll-animate-item relative flex-1 max-w-sm mx-auto md:mx-0 md:ml-[-1px]">
                 <div className="bg-[#1d1d1f] rounded-[2rem] p-10 shadow-[0_2px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 h-full">
                   <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 mx-auto">
                     <Scissors className="w-9 h-9 text-white" />
                   </div>
                   <h3 className="text-2xl font-semibold mb-3 text-white">{t.indTitle}</h3>
                   <p className="text-[#a1a1a6] leading-relaxed">{t.indDesc}</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Order Steps */}
      <section id="order-steps" className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-[#1d1d1f]">{t.orderTitle}</h2>
            <p className="text-lg text-[#86868b]">{t.orderDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-16 right-16 h-px bg-slate-200 z-0" />

            {usageSteps.map((step, idx) => (
              <div key={idx} className="relative z-10 bg-white border border-slate-200 shadow-sm p-8 rounded-3xl flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-[#0071e3] rounded-full flex items-center justify-center mb-5 text-white shadow-[0_4px_16px_rgba(0,113,227,0.3)]">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#1d1d1f]">{step.title}</h3>
                <p className="text-sm text-[#86868b] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Process Timeline */}
      <section id="how-it-works" className="py-24 px-6 bg-[#FBFBFD] border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-[#1d1d1f]">{t.processTitle}</h2>
            <p className="text-lg text-[#86868b]">{t.processDesc}</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-slate-200 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {processSteps.map((step, index) => (
                <div key={index} className="relative z-10 group">
                  <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="w-11 h-11 bg-[#0071e3]/10 text-[#0071e3] rounded-xl flex items-center justify-center font-black text-lg mb-5">
                      {index + 1}
                    </div>
                    <h3 className="text-base font-bold mb-2 text-[#1d1d1f]">{step.title}</h3>
                    <p className="text-sm text-[#86868b] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-32 px-6 text-center bg-[#FBFBFD]">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#1d1d1f]">{t.ctaTitle}</h2>
        <p className="text-xl text-[#86868b] mb-10 max-w-2xl mx-auto">{t.ctaDesc}</p>
        <div className="flex justify-center mt-10">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-10 py-5 bg-[#0071e3] text-white rounded-full font-bold text-xl hover:bg-[#0077ED] transition-all shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            {t.ctaBtn}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-[#86868b] text-sm font-medium">© {new Date().getFullYear()} Beya Creative. {t.footerRights}</p>
           
           <div className="flex items-center gap-6">
             <Link to="/privacy" className="text-[#86868b] text-sm font-medium hover:text-[#0071e3] transition-colors">
               {t.footerPrivacy}
             </Link>
             <Link to="/cookies" className="text-[#86868b] text-sm font-medium hover:text-[#0071e3] transition-colors">
               {t.footerCookies}
             </Link>
             <a href="https://ecosystem.beyacreative.com" className="text-[#86868b] text-sm font-medium hover:text-[#0071e3] transition-colors">
               {t.footerIdea}
             </a>
           </div>

           <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs hidden md:block">Professional Excellence</p>
        </div>
      </footer>

      {/* Contact Request Modal */}
      <ProjectRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isDark={false} 
      />
    </div>
  );
}
