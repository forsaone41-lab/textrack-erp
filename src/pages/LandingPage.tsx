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
`;

function useScrollFocus() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const maxDistance = window.innerHeight;
      
      const distance = Math.abs(viewportCenter - elementCenter);
      let newScale = 1 - (distance / maxDistance) * 0.15;
      let newOpacity = 1 - (distance / maxDistance) * 0.8;
      
      setScale(Math.max(0.85, Math.min(1, newScale)));
      setOpacity(Math.max(0.2, Math.min(1, newOpacity)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, style: { transform: `scale(${scale})`, opacity, transition: 'transform 0.1s ease-out, opacity 0.1s ease-out', willChange: 'transform, opacity' } };
}

export default function LandingPage() {
  const { isAr, toggle } = useLang();
  const location = useLocation();
  const heroFocus = useScrollFocus();
  const [scrolled, setScrolled] = useState(false);
  const heroVideoRef = React.useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);

  // Auto-scroll logic for FB Ads
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scroll') === 'video') {
      // Small delay to ensure rendering is done before scrolling
      setTimeout(() => {
        document.getElementById('hero-video')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  }, [location.search]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
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
            <Link to="/ecosystem" className="text-sm font-bold text-[#0071e3] hover:text-[#0077ED] transition-colors">
              {isAr ? 'المنظومة' : 'Écosystème'}
            </Link>
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
            <Link to="/login" className="text-xs sm:text-sm font-medium text-slate-800 hover:text-black transition-colors">
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 sm:px-5 sm:py-2 rounded-full bg-[#1d1d1f] text-white font-medium text-xs sm:text-sm hover:bg-black transition-all">
              {isAr ? 'ابدأ الآن' : 'Commencer'}
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
                {isAr ? 'المنظومة المتكاملة' : 'L\'Écosystème Intégré'}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-[#1d1d1f] leading-[1.1] mb-6 text-balance animate-in slide-in-from-bottom-8 duration-1000">
              {isAr ? 'نصنع علامتك التجارية من الفكرة إلى القطعة النهائية.' : 'Nous fabriquons votre marque de l\'idée à la pièce finale.'}
            </h1>

            <p className="text-xl md:text-2xl text-[#86868b] leading-relaxed mb-10 animate-in slide-in-from-bottom-8 duration-1000 delay-150 font-medium text-balance">
              {isAr
                ? 'نوفر للعلامات التجارية حلول تصنيع متكاملة بأعلى معايير الجودة الصناعية. من اختيار الأقمشة إلى الخياطة والتغليف، مصنعنا هو شريكك لإنتاج ملابسك باحترافية.'
                : 'Nous offrons aux marques des solutions de fabrication complètes avec les plus hauts standards industriels. Du choix des tissus à la couture et à l\'emballage, notre usine est votre partenaire de production.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
              <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                {isAr ? 'ابدأ مشروعك الآن' : 'Démarrer votre projet'} <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
              <Link to="/ecosystem" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                {isAr ? 'تفاصيل المنظومة' : 'Détails de l\'écosystème'} <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </div>


          </div>

          {/* Hero Video */}
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

          {/* Mobile CTA (Under Video) */}
          <div className="lg:hidden flex justify-center mt-2 w-full px-2">
             <button onClick={() => setIsModalOpen(true)} className="w-full py-4 rounded-full bg-[#1d1d1f] text-white font-bold text-lg hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 animate-in slide-in-from-bottom-8 duration-1000 delay-500 cursor-pointer">
               {isAr ? 'ابدأ الآن' : 'Commencer'} <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
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

        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
           {/* Original subtle gradient */}
           <div className="w-[120%] h-64 bg-gradient-to-b from-slate-50 to-white rounded-[100%] -top-32 absolute left-1/2 -translate-x-1/2" />
           
           {/* Animated Floating Vectors */}
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
           
           {/* Abstract geometric shapes */}
           <div className="absolute top-[10%] right-[35%] w-32 h-32 rounded-full border border-[#0071e3]/10" style={{ animation: 'float-slow 25s linear infinite' }} />
           <div className="absolute bottom-[20%] left-[40%] w-24 h-24 rounded-2xl border border-[#1d1d1f]/10 rotate-45" style={{ animation: 'float-reverse 22s linear infinite' }} />
        </div>
      </section>

      {/* Marquee (Clean and minimal) */}
      <section className="py-5 border-y border-slate-200 bg-slate-50 overflow-hidden flex flex-nowrap w-full">
        <div className="flex items-center flex-shrink-0 animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={`m1-${i}`} className="flex items-center gap-10 mx-5 text-base font-bold text-slate-800 tracking-wider uppercase">
              <span>{isAr ? 'التجارة الإلكترونية' : 'E-COMMERCE'}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{isAr ? 'صناعة النسيج' : 'TEXTILE INDUSTRY'}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{isAr ? 'الأنظمة الذكية' : 'SMART SYSTEMS'}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
            </div>
          ))}
        </div>
        <div className="flex items-center flex-shrink-0 animate-marquee whitespace-nowrap" aria-hidden="true">
          {[...Array(10)].map((_, i) => (
            <div key={`m2-${i}`} className="flex items-center gap-10 mx-5 text-base font-bold text-slate-800 tracking-wider uppercase">
              <span>{isAr ? 'التجارة الإلكترونية' : 'E-COMMERCE'}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{isAr ? 'صناعة النسيج' : 'TEXTILE INDUSTRY'}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <span>{isAr ? 'الأنظمة الذكية' : 'SMART SYSTEMS'}</span>
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
            </div>
          ))}
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
        <div className="flex justify-center mt-10">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-10 py-5 bg-[#0071e3] text-white rounded-full font-bold text-xl hover:bg-[#0077ED] transition-all shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            {isAr ? 'ابدأ مشروعك الآن' : 'Démarrer maintenant'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-[#86868b] text-sm font-medium">© {new Date().getFullYear()} Beya Creative. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
           
           <div className="flex items-center gap-6">
             <Link to="/privacy" className="text-[#86868b] text-sm font-medium hover:text-[#0071e3] transition-colors">
               {isAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}
             </Link>
             <Link to="/cookies" className="text-[#86868b] text-sm font-medium hover:text-[#0071e3] transition-colors">
               {isAr ? 'ملفات تعريف الارتباط' : 'Cookies'}
             </Link>
             <Link to="/funnel" className="text-[#86868b] text-sm font-medium hover:text-[#0071e3] transition-colors">
               {isAr ? 'كيف نطور فكرتك لتنجح؟' : 'Développer votre idée'}
             </Link>
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
