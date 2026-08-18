import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { ArrowRight, Code, Scissors, ShoppingBag, Store, Globe, Zap, Star, Settings, ChevronRight, Play, Pause, Volume2, VolumeX, MousePointerClick, MessageSquareText, PhoneCall } from 'lucide-react';

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
`;

export default function LandingPage() {
  const { isAr, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const heroVideoRef = React.useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);

  const productionSlides = ['/factory_bg.jpg', '/atelier-machine.jpg', '/atelier-fabric.jpg'];
  const [productionSlide, setProductionSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProductionSlide((prev) => (prev + 1) % productionSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    {
      icon: MousePointerClick,
      titleAr: '1. اضغط على ابدأ مشروعك',
      titleFr: '1. Cliquez sur Démarrer',
      descAr: 'ابحث عن الزر في أعلى أو وسط الصفحة.',
      descFr: 'Trouvez le bouton en haut ou au milieu de la page.'
    },
    {
      icon: MessageSquareText,
      titleAr: '2. أجب عن أسئلة بسيطة',
      titleFr: '2. Répondez aux questions',
      descAr: 'أخبرنا من أنت وعن مشروعك في 3 خطوات سريعة.',
      descFr: 'Parlez-nous de vous et votre projet en 3 étapes rapides.'
    },
    {
      icon: PhoneCall,
      titleAr: '3. سنتصل بك فوراً',
      titleFr: '3. On vous contacte',
      descAr: 'سيتصل بك فريقنا في أقرب وقت لتأكيد طلبك والبدء.',
      descFr: 'Notre équipe vous appellera pour confirmer et lancer votre projet.'
    }
  ];

  const processSteps = [
    { titleAr: '1. تواصل معنا', titleFr: '1. Prise de Contact', descAr: 'أخبرنا من أنت وماذا تبحث عنه عبر نموذجنا الذكي.', descFr: 'Dites-nous qui vous êtes et ce que vous cherchez via notre formulaire intelligent.' },
    { titleAr: '2. دراسة واستشارة', titleFr: '2. Étude & Conseil', descAr: 'يقوم فريقنا بتحليل مشروعك ويقترح أفضل نهج تقني ومالي.', descFr: 'Notre équipe analyse votre projet et vous propose la meilleure approche technique et financière.' },
    { titleAr: '3. صنع العينة', titleFr: '3. Prototypage', descAr: 'نحن نقوم بصنع الباترون والعينة الأولى لكي تؤكدها.', descFr: 'Nous réalisons le patronage et le premier échantillon (prototype) pour votre validation.' },
    { titleAr: '4. الإنتاج', titleFr: '4. Production', descAr: 'بمجرد التأكيد، نبدأ الإنتاج بالجملة مع مراقبة جودة صارمة.', descFr: 'Une fois validé, nous lançons la production en série avec un contrôle qualité strict.' },
    { titleAr: '5. التوصيل', titleFr: '5. Livraison', descAr: 'منتجاتك جاهزة، مغلفة بعناية ويتم توصيلها في الوقت المحدد.', descFr: 'Vos articles sont prêts, emballés avec soin et livrés selon vos délais.' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1d1d1f] font-sans overflow-x-hidden selection:bg-slate-200" dir={isAr ? 'rtl' : 'ltr'}>
      <style>{styles}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-header py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
             <img src="/logo-blue.png" alt="Beya Creative" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
             <span className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">Beya Creative</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {isAr ? 'الحلول' : 'Solutions'}
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {isAr ? 'كيف نعمل' : 'Comment ça marche'}
            </a>
            <a href="#order-steps" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {isAr ? 'سجل طلبك' : 'Commander'}
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={toggle} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
              {isAr ? 'FR' : 'العربية'}
            </button>
            <Link to="/login" className="text-sm font-medium text-slate-800 hover:text-black transition-colors hidden sm:block">
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
            <Link to="/commencer" className="px-4 py-2 sm:px-5 sm:py-2 rounded-full bg-[#1d1d1f] text-white font-medium text-xs sm:text-sm hover:bg-black transition-all">
              {isAr ? 'ابدأ الآن' : 'Commencer'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 min-h-[90vh] flex items-center relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className={isAr ? 'text-center lg:text-right' : 'text-center lg:text-left'}>
            <div className="mb-6 inline-flex items-center justify-center">
              <span className="px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full border border-slate-200 uppercase tracking-widest">
                {isAr ? 'المنظومة المتكاملة' : 'L\'Écosystème Intégré'}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-[#1d1d1f] leading-[1.05] mb-6 text-balance animate-in slide-in-from-bottom-8 duration-1000">
              {isAr ? 'التكنولوجيا المتقدمة تلتقي بالصناعة.' : 'La technologie avancée rencontre l\'industrie.'}
            </h1>

            <p className="text-xl md:text-2xl text-[#86868b] leading-relaxed mb-10 animate-in slide-in-from-bottom-8 duration-1000 delay-150 font-medium text-balance">
              {isAr
                ? 'نبني أنظمة رقمية ذكية، متاجر إلكترونية احترافية، ونصنع منتجاتك بمعايير عالمية. كل ما تحتاجه لتوسيع نطاق أعمالك في مكان واحد.'
                : 'Nous construisons des systèmes intelligents, des boutiques pro, et fabriquons vos produits selon les standards internationaux.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link to="/store-landing" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium text-lg transition-colors flex items-center justify-center gap-2">
                {isAr ? 'اكتشف المنظومة' : 'Découvrir'}
              </Link>
              <a href="#solutions" className="w-full sm:w-auto px-8 py-3.5 rounded-full text-[#0071e3] font-medium text-lg hover:underline flex items-center justify-center gap-1">
                {isAr ? 'كيف نعمل؟' : 'Comment ça marche ?'} <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </a>
            </div>
          </div>

          {/* Hero Video */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] border-b-4 border-[#0071e3] aspect-[4/5] w-full h-auto md:h-[680px] md:w-auto mx-auto animate-in slide-in-from-bottom-8 duration-1000 delay-150 group">
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

            {/* Controls */}
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
        </div>

        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden flex justify-center -z-10">
           <div className="w-[120%] h-64 bg-gradient-to-b from-slate-50 to-white rounded-[100%] -top-32 absolute" />
        </div>
      </section>

      {/* Marquee (Clean and minimal) */}
      <section className="py-4 border-y border-slate-200 bg-white overflow-hidden flex">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-8 text-sm font-semibold text-slate-400 tracking-widest uppercase">
              <span>{isAr ? 'التجارة الإلكترونية' : 'E-COMMERCE'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>{isAr ? 'صناعة النسيج' : 'TEXTILE INDUSTRY'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>{isAr ? 'الأنظمة الذكية' : 'SMART SYSTEMS'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          ))}
        </div>
      </section>

      {/* The Ecosystem (Apple Style Grid) */}
      <section id="solutions" className="py-32 px-6 bg-[#FBFBFD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{isAr ? 'حلول مصممة للنمو.' : 'Des solutions conçues pour la croissance.'}</h2>
            <p className="text-xl text-[#86868b] max-w-2xl mx-auto">{isAr ? 'منصة واحدة تجمع كل ما يتطلبه عملك للنجاح في السوق.' : 'Une seule plateforme réunissant tout ce dont votre entreprise a besoin pour réussir.'}</p>
          </div>

          <div className="flex flex-col gap-6">

            {/* Beya Production - Primary */}
            <div className="relative overflow-hidden p-10 md:p-16 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_50px_rgba(0,0,0,0.35)] transition-all duration-300 group text-white min-h-[480px] flex flex-col justify-end">
               {/* Background Slider */}
               <div className="absolute inset-0 bg-[#1d1d1f]">
                 {productionSlides.map((src, idx) => (
                   <img
                     key={src}
                     src={src}
                     alt=""
                     className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === productionSlide ? 'opacity-50' : 'opacity-0'}`}
                   />
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f] via-[#1d1d1f]/75 to-[#1d1d1f]/25" />
               </div>

               {/* Slide dots */}
               <div className="absolute top-8 ltr:right-8 rtl:left-8 rtl:right-auto flex gap-1.5 z-10">
                 {productionSlides.map((_, idx) => (
                   <span key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === productionSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                 ))}
               </div>

               <div className="relative z-10 max-w-2xl">
                 <Scissors className="w-12 h-12 text-slate-300 mb-6" />
                 <h3 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Beya Production.</h3>
                 <p className="text-xl text-[#e5e5e7] leading-relaxed mb-8">
                   {isAr
                     ? 'ورشة صناعية متكاملة ومجهزة بأحدث التقنيات. نصمم ونصنع لك منتجات بمعايير جودة عالية لتليق بعلامتك التجارية.'
                     : 'Atelier industriel équipé des dernières technologies. Nous concevons et fabriquons des produits de haute qualité.'}
                 </p>
                 <Link to="/setup" className="inline-flex items-center text-white font-medium hover:underline text-lg">
                   {isAr ? 'اكتشف خدمات الورشة' : 'Découvrir l\'atelier'} <ChevronRight className={`w-4 h-4 ml-1 ${isAr ? 'rotate-180 mr-1 ml-0' : ''}`} />
                 </Link>
               </div>
            </div>

            {/* Beya Store - Secondary */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-300 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                   <Store className="w-6 h-6 text-slate-700" />
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-[#1d1d1f]">Beya Store.</h3>
                   <p className="text-sm text-[#86868b] leading-relaxed max-w-md">
                     {isAr
                       ? 'منصة التجارة الإلكترونية الأقوى. أطلق متجرك الاحترافي وابدأ البيع فوراً.'
                       : 'La plateforme E-commerce ultime. Lancez votre boutique et commencez à vendre immédiatement.'}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-3 shrink-0 ltr:ml-auto ps-16 sm:ps-0">
                 <span className="text-xl font-bold text-[#1d1d1f]">199 <span className="text-sm text-slate-500 font-medium">DH/{isAr ? 'شهر' : 'mois'}</span></span>
                 <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium uppercase tracking-widest">{isAr ? 'مخاطرة 0' : '0 Risque'}</span>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dual Core Concept - Apple Style */}
      <section className="py-32 px-6 bg-[#FBFBFD] border-y border-slate-100 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#1d1d1f]">{isAr ? 'من الإبرة... للمتجر.' : 'De l\'aiguille... à la boutique.'}</h2>
           <p className="text-lg text-[#86868b] max-w-xl mx-auto mb-20">{isAr ? 'وجهان لمنظومة واحدة متكاملة.' : 'Deux facettes d\'un même écosystème intégré.'}</p>

           <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-0">

              {/* Tech */}
              <div className="relative flex-1 max-w-sm mx-auto md:mx-0 bg-white border border-slate-200 rounded-[2rem] p-10 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,113,227,0.12)] hover:-translate-y-1 transition-all duration-300 md:mr-[-1px]">
                 <div className="w-20 h-20 rounded-2xl bg-[#0071e3] flex items-center justify-center mb-6 mx-auto shadow-[0_8px_24px_rgba(0,113,227,0.35)]">
                   <Code className="w-9 h-9 text-white" />
                 </div>
                 <h3 className="text-2xl font-semibold mb-3 text-[#1d1d1f]">{isAr ? 'الجانب التقني' : 'Le Côté Tech'}</h3>
                 <p className="text-[#86868b] leading-relaxed">{isAr ? 'بنية تحتية متطورة، متاجر سريعة، وتحليل دقيق للبيانات.' : 'Infrastructure moderne, boutiques rapides et analyse de données.'}</p>
              </div>

              {/* Connector */}
              <div className="hidden md:flex items-center justify-center z-10 -mx-5">
                <div className="w-12 h-12 rounded-full bg-white border-4 border-[#FBFBFD] shadow-md flex items-center justify-center text-[#0071e3]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
              </div>

              {/* Textile */}
              <div className="relative flex-1 max-w-sm mx-auto md:mx-0 bg-[#1d1d1f] rounded-[2rem] p-10 shadow-[0_2px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 md:ml-[-1px]">
                 <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 mx-auto">
                   <Scissors className="w-9 h-9 text-white" />
                 </div>
                 <h3 className="text-2xl font-semibold mb-3 text-white">{isAr ? 'الجانب الصناعي' : 'Le Côté Industriel'}</h3>
                 <p className="text-[#a1a1a6] leading-relaxed">{isAr ? 'إنتاج فعلي وملموس بمعايير الجودة العالية لمنتجاتك.' : 'Production réelle et tangible avec des standards de haute qualité.'}</p>
              </div>

           </div>
        </div>
      </section>

      {/* Order Steps */}
      <section id="order-steps" className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-[#1d1d1f]">{isAr ? 'كيفاش تسجل الطلب ديالك؟' : 'Comment soumettre votre demande ?'}</h2>
            <p className="text-lg text-[#86868b]">{isAr ? 'خطوات بسيطة باش تبدا معانا الخدمة.' : 'Des étapes simples pour commencer avec nous.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-16 right-16 h-px bg-slate-200 z-0" />

            {usageSteps.map((step, idx) => (
              <div key={idx} className="relative z-10 bg-white border border-slate-200 shadow-sm p-8 rounded-3xl flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-[#0071e3] rounded-full flex items-center justify-center mb-5 text-white shadow-[0_4px_16px_rgba(0,113,227,0.3)]">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#1d1d1f]">{isAr ? step.titleAr : step.titleFr}</h3>
                <p className="text-sm text-[#86868b] leading-relaxed">{isAr ? step.descAr : step.descFr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Process Timeline */}
      <section id="how-it-works" className="py-24 px-6 bg-[#FBFBFD] border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-[#1d1d1f]">{isAr ? 'كيف نعمل؟' : 'Comment ça marche ?'}</h2>
            <p className="text-lg text-[#86868b]">{isAr ? 'مسار واضح، شفاف واحترافي.' : 'Un processus clair, transparent et professionnel.'}</p>
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
                    <h3 className="text-base font-bold mb-2 text-[#1d1d1f]">{(isAr ? step.titleAr : step.titleFr).split('. ')[1]}</h3>
                    <p className="text-sm text-[#86868b] leading-relaxed">{isAr ? step.descAr : step.descFr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-32 px-6 text-center bg-[#FBFBFD]">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#1d1d1f]">{isAr ? 'مستعد للبدء؟' : 'Prêt à commencer ?'}</h2>
        <p className="text-xl text-[#86868b] mb-10 max-w-2xl mx-auto">
           {isAr 
             ? 'انضم إلينا اليوم وابنِ مشروعك على أسس صلبة واحترافية.'
             : 'Rejoignez-nous aujourd\'hui et bâtissez votre projet sur des bases solides.'}
        </p>
        <div className="flex justify-center">
          <Link to="/store-landing" className="px-8 py-4 rounded-full bg-[#1d1d1f] hover:bg-black text-white font-medium text-lg transition-colors shadow-lg">
            {isAr ? 'تأسيس مشروعك الآن' : 'Créer votre projet'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-[#86868b] text-sm font-medium">© {new Date().getFullYear()} Beya Creative. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
           <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Professional Excellence</p>
        </div>
      </footer>
    </div>
  );
}
