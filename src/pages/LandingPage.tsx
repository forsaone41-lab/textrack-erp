import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { ArrowRight, Code, Scissors, ShoppingBag, Store, Globe, Cpu, Zap, Star, LayoutTemplate, Settings, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1d1d1f] font-sans overflow-x-hidden selection:bg-slate-200" dir={isAr ? 'rtl' : 'ltr'}>
      <style>{styles}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-header py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="text-xl font-semibold tracking-tight text-slate-900">Beya Creative.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggle} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
              {isAr ? 'FR' : 'العربية'}
            </button>
            <Link to="/login" className="text-sm font-medium text-slate-800 hover:text-black transition-colors hidden sm:block">
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
            <Link to="/store-landing" className="px-5 py-2 rounded-full bg-[#1d1d1f] text-white font-medium text-sm hover:bg-black transition-all">
              {isAr ? 'ابدأ الآن' : 'Commencer'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center justify-center">
            <span className="px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full border border-slate-200 uppercase tracking-widest">
              {isAr ? 'المنظومة المتكاملة' : 'L\'Écosystème Intégré'}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight text-[#1d1d1f] leading-[1.05] mb-6 text-balance animate-in slide-in-from-bottom-8 duration-1000">
            {isAr ? 'التكنولوجيا المتقدمة تلتقي بالصناعة.' : 'La technologie avancée rencontre l\'industrie.'}
          </h1>
          
          <p className="text-xl md:text-2xl text-[#86868b] max-w-2xl mx-auto leading-relaxed mb-10 animate-in slide-in-from-bottom-8 duration-1000 delay-150 font-medium text-balance">
            {isAr 
              ? 'نبني أنظمة رقمية ذكية، متاجر إلكترونية احترافية، ونصنع منتجاتك بمعايير عالمية. كل ما تحتاجه لتوسيع نطاق أعمالك في مكان واحد.'
              : 'Nous construisons des systèmes intelligents, des boutiques pro, et fabriquons vos produits selon les standards internationaux.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link to="/store-landing" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium text-lg transition-colors flex items-center justify-center gap-2">
              {isAr ? 'اكتشف المنظومة' : 'Découvrir'}
            </Link>
            <a href="#solutions" className="w-full sm:w-auto px-8 py-3.5 rounded-full text-[#0071e3] font-medium text-lg hover:underline flex items-center justify-center gap-1">
              {isAr ? 'كيف نعمل؟' : 'Comment ça marche ?'} <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </a>
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

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Beya Creative */}
            <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
               <Cpu className="w-10 h-10 text-slate-800 mb-6" />
               <h3 className="text-3xl font-semibold mb-3 tracking-tight">Beya Creative.</h3>
               <p className="text-lg text-[#86868b] leading-relaxed mb-8">
                 {isAr 
                   ? 'المركز الرئيسي للعمليات التقنية. نبني أنظمة ذكية، وتطبيقات ويب مخصصة لتمكين الشركات من إدارة أعمالها بكل احترافية.'
                   : 'Le centre névralgique des opérations. Nous créons des systèmes intelligents et des apps sur mesure pour les entreprises.'}
               </p>
               <Link to="/store-landing" className="inline-flex items-center text-[#0071e3] font-medium hover:underline">
                 {isAr ? 'المزيد عن خدماتنا' : 'En savoir plus'} <ChevronRight className={`w-4 h-4 ml-1 ${isAr ? 'rotate-180 mr-1 ml-0' : ''}`} />
               </Link>
            </div>

            {/* Beya Store */}
            <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group flex flex-col justify-between">
               <div>
                 <Store className="w-10 h-10 text-slate-800 mb-6" />
                 <h3 className="text-3xl font-semibold mb-3 tracking-tight">Beya Store.</h3>
                 <p className="text-lg text-[#86868b] leading-relaxed mb-8">
                   {isAr 
                     ? 'منصة التجارة الإلكترونية الأقوى. أطلق متجرك الاحترافي وابدأ البيع فوراً. ندعم الدفع عند الاستلام ونوفر لك أدوات متقدمة.'
                     : 'La plateforme E-commerce ultime. Lancez votre boutique et commencez à vendre immédiatement avec des outils avancés.'}
                 </p>
               </div>
               <div className="flex items-center gap-4">
                 <span className="text-3xl font-bold">199 <span className="text-base text-slate-500 font-medium">DH/{isAr ? 'شهر' : 'mois'}</span></span>
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium uppercase tracking-widest">{isAr ? 'مخاطرة 0' : '0 Risque'}</span>
               </div>
            </div>

            {/* Beya Setup */}
            <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
               <LayoutTemplate className="w-10 h-10 text-slate-800 mb-6" />
               <h3 className="text-3xl font-semibold mb-3 tracking-tight">Beya Setup.</h3>
               <p className="text-lg text-[#86868b] leading-relaxed mb-8">
                 {isAr 
                   ? 'الخدمة الشاملة لتجهيز المتاجر. نتكلف بكل التفاصيل: التصميم الاحترافي، الدومين، وإعدادات الربط التقني لتنطلق بقوة.'
                   : 'Service clé en main pour configurer votre boutique. Design pro, nom de domaine et intégrations techniques.'}
               </p>
               <div className="text-3xl font-bold">800 <span className="text-base text-slate-500 font-medium">DH</span></div>
            </div>

            {/* Beya Production */}
            <div className="bg-[#1d1d1f] p-12 rounded-[2.5rem] shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group text-white">
               <Scissors className="w-10 h-10 text-slate-300 mb-6" />
               <h3 className="text-3xl font-semibold mb-3 tracking-tight">Beya Production.</h3>
               <p className="text-lg text-[#a1a1a6] leading-relaxed mb-8">
                 {isAr 
                   ? 'ورشة صناعية متكاملة ومجهزة بأحدث التقنيات. نصمم ونصنع لك منتجات بمعايير جودة عالية لتليق بعلامتك التجارية.'
                   : 'Atelier industriel équipé des dernières technologies. Nous concevons et fabriquons des produits de haute qualité.'}
               </p>
               <Link to="/setup" className="inline-flex items-center text-white font-medium hover:underline">
                 {isAr ? 'اكتشف خدمات الورشة' : 'Découvrir l\'atelier'} <ChevronRight className={`w-4 h-4 ml-1 ${isAr ? 'rotate-180 mr-1 ml-0' : ''}`} />
               </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Dual Core Concept - Apple Style */}
      <section className="py-32 px-6 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16">{isAr ? 'من الإبرة... للمتجر.' : 'De l\'aiguille... à la boutique.'}</h2>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
              
              {/* Tech */}
              <div className="flex flex-col items-center max-w-xs">
                 <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                   <Code className="w-10 h-10 text-slate-800" />
                 </div>
                 <h3 className="text-2xl font-semibold mb-3">{isAr ? 'الجانب التقني' : 'Le Côté Tech'}</h3>
                 <p className="text-[#86868b] leading-relaxed">{isAr ? 'بنية تحتية متطورة، متاجر سريعة، وتحليل دقيق للبيانات.' : 'Infrastructure moderne, boutiques rapides et analyse de données.'}</p>
              </div>

              {/* Plus Icon */}
              <div className="hidden md:flex text-slate-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              </div>

              {/* Textile */}
              <div className="flex flex-col items-center max-w-xs">
                 <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                   <Scissors className="w-10 h-10 text-slate-800" />
                 </div>
                 <h3 className="text-2xl font-semibold mb-3">{isAr ? 'الجانب الصناعي' : 'Le Côté Industriel'}</h3>
                 <p className="text-[#86868b] leading-relaxed">{isAr ? 'إنتاج فعلي وملموس بمعايير الجودة العالية لمنتجاتك.' : 'Production réelle et tangible avec des standards de haute qualité.'}</p>
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
