import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, Scissors, MonitorSmartphone, TrendingUp, CheckCircle2, ShoppingCart, Zap, Star, Sun, Moon } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import ProjectRequestModal from '../components/ProjectRequestModal';
import { useLang } from '../contexts/LangContext';

function useOnScreen(ref: React.RefObject<Element>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIntersecting(true);
      },
      { rootMargin }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, rootMargin]);
  return isIntersecting;
}

const FadeIn = ({ children, delay = 0, className = '' }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref, '-50px');
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
    >
      {children}
    </div>
  );
};

const TRANSLATIONS: any = {
  ar: {
    dir: 'rtl',
    navStart: 'ابدأ الآن',
    badge: 'النظام المتكامل الأول في المغرب',
    heroTitlePart1: 'أطلق علامتك',
    heroTitlePart2: 'التجارية',
    heroTitlePart3: 'من الفكرة إلى المبيعات',
    heroDesc: 'نحن لا نصنع ملابسك فقط، بل نبني متجرك الإلكتروني ونربطه بذكاء لتتمكن من البيع في يومك الأول.',
    probTitle: 'الطريقة القديمة (معاناة)',
    probDesc: 'أغلب من يبدأ في مجال الملابس يستسلم في الشهر الأول بسبب هذه المشاكل:',
    prob1Title: 'تصنيع بطيء ورديء',
    prob1Desc: 'البحث عن خياطين موثوقين يأخذ وقتاً طويلاً، وغالباً ما تكون الجودة غير مطابقة لتوقعاتك ومواعيد التسليم متأخرة.',
    prob2Title: 'تكاليف متجر باهظة',
    prob2Desc: 'يطلب منك المبرمجون مبالغ خيالية لإنشاء موقعك، وفي النهاية تحصل على متجر بطيء ولا يتناسب مع السوق المغربي.',
    prob3Title: 'تشتت في التسيير',
    prob3Desc: 'تضيع وقتك بين المعمل، استوديو التصوير، وتتبع الطلبيات، مما يمنعك من التركيز على التسويق والمبيعات.',
    solBadge: 'الحل المتكامل',
    solTitle: 'BEYA CREATIVE',
    solDesc: 'منظومة شاملة ومتكاملة تجمع بين التصنيع العالي الجودة، التكنولوجيا الرقمية، والتسيير الذكي. مكان واحد لكل ما تحتاجه لنجاح علامتك التجارية.',
    sol1Title: '1. BEYA Production',
    sol1Desc: 'نحن نتكفل بصناعة ملابسك من الألف إلى الياء. توفير أقمشة ممتازة، تصميم باترون دقيق، فصالة عصرية، وخياطة بمعايير التصدير العالمية لضمان جودة استثنائية.',
    sol1Li1: 'مراقبة صارمة للجودة في كل مرحلة',
    sol1Li2: 'احترام تام لمواعيد التسليم المتفق عليها',
    sol2Title: '2. BEYA Store',
    sol2Desc: 'نبني لك متجراً إلكترونياً ذكياً ومحسّناً خصيصاً للسوق المغربي لضمان أعلى نسبة مبيعات، مع تصميم عصري يبرز قيمة منتجاتك.',
    sol2Li1: 'دعم كامل لنظام الدفع عند الاستلام (COD)',
    sol2Li2: 'ربط أوتوماتيكي مع شركات التوصيل وتتبع الشحنات',
    sol3Title: '3. BEYA Portal',
    sol3Desc: 'لوحة تحكم ذكية واحدة تضع عملك كاملاً بين يديك. تابع الإنتاج، راقب المبيعات، وتواصل مع فريقنا لحظة بلحظة.',
    sol3Li1: 'تتبع مباشر لمراحل الخياطة والإنتاج',
    sol3Li2: 'إدارة الفواتير والمخزون بشفافية تامة',
    pushTitle: 'الميزة الخارقة (Push to Store)',
    pushDesc: 'بمجرد الانتهاء من خياطة ملابسك في الورشة وتغليفها، يتم إرسالها آلياً بنقرة واحدة إلى متجرك الإلكتروني مع الصور والكمية الصحيحة لتصبح جاهزة للبيع فوراً!',
    ctaTitle: 'هل أنت مستعد للبدء؟',
    ctaDesc: 'أدخل معلوماتك وسنتواصل معك فوراً لتحديد موعد والبدء في مشروعك.',
    ctaBtn: 'ابدأ الآن',
    cartAdd: 'إضافة للسلة',
    privacy: 'سياسة الخصوصية',
    cookies: 'ملفات تعريف الارتباط',
    rights: 'جميع الحقوق محفوظة.'
  },
  fr: {
    dir: 'ltr',
    navStart: 'Commencer',
    badge: 'LE 1ER ÉCOSYSTÈME INTÉGRÉ AU MAROC',
    heroTitlePart1: 'Lancez votre',
    heroTitlePart2: 'Marque',
    heroTitlePart3: 'de l\'idée aux ventes',
    heroDesc: 'Nous ne nous contentons pas de fabriquer vos vêtements, nous construisons votre boutique et la connectons intelligemment pour que vous puissiez vendre dès le premier jour.',
    probTitle: 'L\'ancienne méthode (Le chaos)',
    probDesc: 'La plupart de ceux qui se lancent dans l\'habillement abandonnent le premier mois à cause de ces problèmes :',
    prob1Title: 'Production lente et médiocre',
    prob1Desc: 'Trouver des couturiers fiables prend beaucoup de temps, la qualité est souvent décevante et les délais ne sont jamais respectés.',
    prob2Title: 'Coûts de boutique exorbitants',
    prob2Desc: 'Les développeurs vous demandent des sommes folles pour créer un site, pour finalement obtenir une boutique lente inadaptée au marché marocain.',
    prob3Title: 'Gestion dispersée',
    prob3Desc: 'Vous perdez votre temps entre l\'atelier, le studio photo et le suivi des commandes, vous empêchant de vous concentrer sur le marketing et les ventes.',
    solBadge: 'La Solution Intégrée',
    solTitle: 'BEYA CREATIVE',
    solDesc: 'Un écosystème complet intégrant une fabrication de haute qualité, une technologie digitale et une gestion intelligente. Un seul endroit pour le succès de votre marque.',
    sol1Title: '1. BEYA Production',
    sol1Desc: 'Nous prenons en charge la fabrication de vos vêtements de A à Z. Tissus premium, patronage précis, coupe moderne et couture aux standards d\'exportation pour une qualité exceptionnelle.',
    sol1Li1: 'Contrôle qualité strict à chaque étape',
    sol1Li2: 'Respect total des délais convenus',
    sol2Title: '2. BEYA Store',
    sol2Desc: 'Nous vous construisons une boutique e-commerce intelligente et optimisée spécialement pour le marché marocain afin de garantir un taux de conversion maximal.',
    sol2Li1: 'Support complet du paiement à la livraison (COD)',
    sol2Li2: 'Connexion automatique avec les sociétés de livraison',
    sol3Title: '3. BEYA Portal',
    sol3Desc: 'Un tableau de bord intelligent qui met tout votre business entre vos mains. Suivez la production, surveillez les ventes et communiquez avec notre équipe en temps réel.',
    sol3Li1: 'Suivi en direct des étapes de confection',
    sol3Li2: 'Gestion transparente des factures et des stocks',
    pushTitle: 'La Super Fonctionnalité (Push to Store)',
    pushDesc: 'Dès que vos vêtements sont cousus et emballés à l\'atelier, ils sont envoyés automatiquement en un clic vers votre boutique e-commerce avec les photos et les bonnes quantités, prêts à être vendus immédiatement !',
    ctaTitle: 'Prêt à commencer ?',
    ctaDesc: 'Entrez vos informations et nous vous contacterons immédiatement pour fixer un rendez-vous et lancer votre projet.',
    ctaBtn: 'Démarrer maintenant',
    cartAdd: 'Ajouter au panier',
    privacy: 'Politique de Confidentialité',
    cookies: 'Cookies',
    rights: 'Tous droits réservés.'
  },
  en: {
    dir: 'ltr',
    navStart: 'Start Now',
    badge: 'THE 1ST INTEGRATED ECOSYSTEM IN MOROCCO',
    heroTitlePart1: 'Launch your',
    heroTitlePart2: 'Brand',
    heroTitlePart3: 'from idea to sales',
    heroDesc: 'We don\'t just manufacture your clothes, we build your online store and connect it smartly so you can sell from day one.',
    probTitle: 'The old way (The struggle)',
    probDesc: 'Most people starting in clothing give up in the first month because of these problems:',
    prob1Title: 'Slow and poor manufacturing',
    prob1Desc: 'Finding reliable tailors takes a long time, and often the quality doesn\'t meet your expectations and delivery dates are delayed.',
    prob2Title: 'Exorbitant store costs',
    prob2Desc: 'Developers ask you for crazy amounts to create your site, and in the end you get a slow store that doesn\'t fit the Moroccan market.',
    prob3Title: 'Scattered management',
    prob3Desc: 'You waste your time between the factory, the photo studio, and tracking orders, preventing you from focusing on marketing and sales.',
    solBadge: 'The Integrated Solution',
    solTitle: 'BEYA CREATIVE',
    solDesc: 'A comprehensive and integrated ecosystem combining high-quality manufacturing, digital technology, and smart management. One place for everything you need for your brand\'s success.',
    sol1Title: '1. BEYA Production',
    sol1Desc: 'We take care of manufacturing your clothes from A to Z. Premium fabrics, precise pattern making, modern cutting, and sewing to global export standards for exceptional quality.',
    sol1Li1: 'Strict quality control at every stage',
    sol1Li2: 'Full respect of agreed delivery dates',
    sol2Title: '2. BEYA Store',
    sol2Desc: 'We build you a smart e-commerce store specially optimized for the Moroccan market to guarantee the highest sales rate, with a modern design that highlights your products.',
    sol2Li1: 'Full support for Cash on Delivery (COD)',
    sol2Li2: 'Automatic connection with delivery companies',
    sol3Title: '3. BEYA Portal',
    sol3Desc: 'One smart dashboard puts your entire business in your hands. Track production, monitor sales, and communicate with our team in real time.',
    sol3Li1: 'Live tracking of sewing and production stages',
    sol3Li2: 'Transparent invoice and inventory management',
    pushTitle: 'The Super Feature (Push to Store)',
    pushDesc: 'Once your clothes are sewn and packaged in the workshop, they are automatically sent with one click to your e-commerce store with the correct photos and quantities, ready to be sold immediately!',
    ctaTitle: 'Ready to start?',
    ctaDesc: 'Enter your information and we will contact you immediately to schedule an appointment and start your project.',
    ctaBtn: 'Start Now',
    cartAdd: 'Add to cart',
    privacy: 'Privacy Policy',
    cookies: 'Cookies',
    rights: 'All rights reserved.'
  }
};

export default function BeyaFunnel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Use Language Context + URL matching
  const [currentLang, setCurrentLang] = useState<'ar'|'fr'|'en'>(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/ar')) return 'ar';
    if (path.includes('/fr')) return 'fr';
    if (path.includes('/en')) return 'en';
    const ls = localStorage.getItem('funnel_lang') || localStorage.getItem('textrack_lang');
    if (ls === 'ar' || ls === 'fr' || ls === 'en') return ls as 'ar'|'fr'|'en';
    return 'fr';
  });

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let newLang = currentLang;
    if (path.includes('/ar')) newLang = 'ar';
    else if (path.includes('/fr')) newLang = 'fr';
    else if (path.includes('/en')) newLang = 'en';

    if (newLang !== currentLang) {
      setCurrentLang(newLang);
    }
  }, [location.pathname]);

  const changeLang = (l: 'ar'|'fr'|'en') => {
    setCurrentLang(l);
    localStorage.setItem('funnel_lang', l);
    localStorage.setItem('textrack_lang', l);
    window.location.hash = `#/funnel/${l}`;
  };

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;
  const isAr = currentLang === 'ar';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a] text-slate-50' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-indigo-500/30 transition-colors duration-500`} dir={t.dir}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 ${isDark ? 'bg-[#0f172a]/80 border-white/5' : 'bg-white/80 border-slate-200 shadow-sm'} backdrop-blur-xl border-b transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <img src="/logo-blue.png" alt="Beya Creative" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg" />
            <span className={`font-black text-[12px] sm:text-xl tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>BEYA CREATIVE</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
            <div className="relative group shrink-0">
              <button className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                {currentLang} <ArrowDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-24 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-[60]">
                <button onClick={() => changeLang('ar')} className={`px-4 py-2 text-sm text-center hover:bg-slate-50 transition-colors ${currentLang === 'ar' ? 'font-bold text-[#0071e3]' : 'text-slate-600 font-medium'}`}>العربية</button>
                <div className="h-px bg-slate-100 w-full" />
                <button onClick={() => changeLang('fr')} className={`px-4 py-2 text-sm text-center hover:bg-slate-50 transition-colors ${currentLang === 'fr' ? 'font-bold text-[#0071e3]' : 'text-slate-600 font-medium'}`}>FR</button>
                <div className="h-px bg-slate-100 w-full" />
                <button onClick={() => changeLang('en')} className={`px-4 py-2 text-sm text-center hover:bg-slate-50 transition-colors ${currentLang === 'en' ? 'font-bold text-[#0071e3]' : 'text-slate-600 font-medium'}`}>EN</button>
              </div>
            </div>

            <button onClick={() => setIsDark(!isDark)} className={`p-1.5 sm:p-2 rounded-full transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-[#0071e3] hover:bg-slate-100'}`}>
              {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform whitespace-nowrap ${isDark ? 'bg-white text-slate-900' : 'bg-[#0071e3] text-white shadow-lg shadow-blue-500/20'}`}
            >
              {t.navStart}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${isDark ? 'from-indigo-900/40 via-[#0f172a] to-[#0f172a]' : 'from-indigo-100 via-slate-50 to-slate-50'} transition-colors duration-500`}></div>
        
        {/* Animated Background Elements (Optimized: removed animate-pulse and mix-blend for performance) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <FadeIn delay={100}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-slate-200'}`}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={`text-xs font-bold tracking-widest uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.badge}</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={200}>
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} ${isAr ? 'font-arabic' : ''}`}>
              {t.heroTitlePart1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">{t.heroTitlePart2}</span><br />
              {t.heroTitlePart3}
            </h1>
          </FadeIn>
          
          <FadeIn delay={300}>
            <p className={`text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.heroDesc}
            </p>
          </FadeIn>
          
          <FadeIn delay={400}>
            <button 
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto transition-colors animate-bounce ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}
            >
              <ArrowDown className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className={`py-32 relative ${isDark ? 'bg-[#0a0f1c]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.probTitle}</h2>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.probDesc}</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            <FadeIn delay={100}>
              <div className={`p-10 rounded-[2rem] border transition-colors flex flex-col items-center text-center ${isDark ? 'bg-[#0f172a] border-rose-500/20 hover:border-rose-500/40' : 'bg-slate-50 border-rose-200 hover:border-rose-300 shadow-sm'}`}>
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-5">
                  <Scissors className="w-5 h-5" />
                </div>
                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.prob1Title}</h3>
                <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.prob1Desc}</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className={`p-10 rounded-[2rem] border transition-colors flex flex-col items-center text-center ${isDark ? 'bg-[#0f172a] border-rose-500/20 hover:border-rose-500/40' : 'bg-slate-50 border-rose-200 hover:border-rose-300 shadow-sm'}`}>
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-5">
                  <MonitorSmartphone className="w-5 h-5" />
                </div>
                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.prob2Title}</h3>
                <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.prob2Desc}</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className={`p-10 rounded-[2rem] border transition-colors flex flex-col items-center text-center ${isDark ? 'bg-[#0f172a] border-rose-500/20 hover:border-rose-500/40' : 'bg-slate-50 border-rose-200 hover:border-rose-300 shadow-sm'}`}>
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.prob3Title}</h3>
                <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.prob3Desc}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The BEYA Solution */}
      <section className="py-32 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-indigo-600/5' : 'bg-indigo-50/50'}`}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-24">
              <span className="text-[#0071e3] font-black tracking-widest uppercase text-sm mb-4 block">{t.solBadge}</span>
              <h2 className={`text-5xl md:text-6xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.solTitle}</h2>
              <p className={`text-xl max-w-3xl mx-auto font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{t.solDesc}</p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Production */}
            <FadeIn delay={100} className="order-2 lg:order-1">
              <div className="space-y-12">
                
                {/* Module 1: Production */}
                <div className="flex gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transform -rotate-6 ${isDark ? 'bg-white shadow-white/5' : 'bg-slate-900 shadow-slate-900/10'}`}>
                    <Scissors className={`w-8 h-8 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.sol1Title}</h3>
                    <p className={`leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.sol1Desc}</p>
                    <ul className="space-y-2">
                      <li className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.sol1Li1}</li>
                      <li className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.sol1Li2}</li>
                    </ul>
                  </div>
                </div>

                {/* Module 2: Store */}
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-[#0071e3] rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/20 transform rotate-6">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.sol2Title}</h3>
                    <p className={`leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.sol2Desc}</p>
                    <ul className="space-y-2">
                      <li className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.sol2Li1}</li>
                      <li className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.sol2Li2}</li>
                    </ul>
                  </div>
                </div>

                {/* Module 3: Portal */}
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-cyan-500/20 transform -rotate-3">
                    <MonitorSmartphone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.sol3Title}</h3>
                    <p className={`leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.sol3Desc}</p>
                    <ul className="space-y-2">
                      <li className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.sol3Li1}</li>
                      <li className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.sol3Li2}</li>
                    </ul>
                  </div>
                </div>
                
                {/* Push to Store Highlight */}
                <div className={`border p-6 rounded-2xl flex items-start gap-4 transform hover:scale-[1.02] transition-transform ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200 shadow-sm'}`}>
                  <Zap className="w-8 h-8 text-emerald-500 shrink-0 mt-1 animate-pulse" />
                  <div>
                    <h4 className={`text-lg font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.pushTitle}</h4>
                    <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.pushDesc}</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Right: Visual */}
            <FadeIn delay={200} className="order-1 lg:order-2">
              <div className="relative">
                {/* Optimized: Removed animate-pulse from large blurred background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0071e3] to-cyan-400 rounded-full blur-[80px] opacity-20"></div>
                <div className={`relative border rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-[4/5] flex flex-col group ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="w-full flex-1 bg-[url('/premium_streetwear_hoodie.png')] bg-cover bg-center rounded-[2.5rem] relative overflow-hidden transition-transform duration-700 group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-black">Hoodie Premium</span>
                            <span className="text-emerald-400 font-black">450 MAD</span>
                          </div>
                          <div className="w-full bg-white text-slate-900 text-center py-2.5 rounded-xl font-black text-xs uppercase tracking-widest mt-2 cursor-pointer hover:bg-[#0071e3] hover:text-white transition-colors">
                            {t.cartAdd}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section (Redesigned Simple Glassmorphism) */}
      <section id="contact" className={`py-32 relative overflow-hidden ${isDark ? 'bg-[#0a0f1c]' : 'bg-slate-50'}`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className={`p-10 md:p-16 rounded-[3rem] shadow-2xl border backdrop-blur-xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10 shadow-black/50' : 'bg-white/80 border-slate-200 shadow-slate-200/50'}`}>
              {/* Optimized: reduced blur values to improve rendering performance */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071e3]/10 rounded-full blur-[60px]"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px]"></div>
              
              <div className="relative z-10 text-center mb-10">
                <h2 className={`text-3xl md:text-5xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.ctaTitle}</h2>
                <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.ctaDesc}</p>
              </div>

              <div className="flex justify-center pb-4 relative z-10">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`px-12 py-5 rounded-full font-black text-lg transition-all flex justify-center items-center gap-3 shadow-xl hover:-translate-y-1 ${isDark ? 'bg-white text-slate-900 hover:bg-[#0071e3] hover:text-white' : 'bg-[#0071e3] text-white hover:bg-[#0077ED]'}`}
                >
                  {t.ctaBtn} <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
            <div className="flex items-center gap-2 opacity-50">
               <img src="/logo-blue.png" alt="Beya Creative" className="w-5 h-5 rounded" />
               <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>BEYA CREATIVE</span>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
              <Link to="/privacy" className={`text-[11px] sm:text-xs font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                {t.privacy}
              </Link>
              <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></span>
              <Link to="/cookies" className={`text-[11px] sm:text-xs font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                {t.cookies}
              </Link>
            </div>

            <p className={`text-[11px] sm:text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              &copy; {new Date().getFullYear()} BEYA CREATIVE. {t.rights}
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Request Modal */}
      <ProjectRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isDark={isDark} 
      />
    </div>
  );
}
