import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { Play, TrendingUp, Users, Laptop, ArrowRight, ShieldCheck, Zap, Layers, ChevronRight, CheckCircle2, Search, Video } from 'lucide-react';

// ==========================================
// 🎥 VIDEO BACKGROUND CONFIGURATION
// ==========================================
// Replace this URL with the direct link to your own MP4 video.
const HERO_VIDEO_URL = "https://cdn.pixabay.com/video/2021/08/04/83896-584705597_large.mp4"; 
// ==========================================

export default function PlatformLanding() {
  const { lang, setLang, isAr } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [brandInput, setBrandInput] = useState("");
  const [showIcon, setShowIcon] = useState(false);

  // Helper for 3-way translation
  const txt = (ar: string, fr: string, en: string) => lang === 'ar' ? ar : lang === 'en' ? en : fr;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Alternate logo every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowIcon(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500/20" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Navigation (GoDaddy Style: Solid black text, clean white background on scroll) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo (Alternating) */}
          <div className="relative h-10 w-24 flex items-center" dir="ltr">
             {/* Text Version */}
             <div className={`absolute left-0 transition-opacity duration-700 ease-in-out ${showIcon ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <span className={`text-3xl font-black tracking-tighter leading-none ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                  G<span className="text-cyan-500">Zeed</span>
                </span>
             </div>
             
             {/* Icon Version */}
             <div className={`absolute left-0 transition-opacity duration-700 ease-in-out ${showIcon ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                  <span className="text-2xl font-black text-cyan-600">G</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as 'ar' | 'fr' | 'en')}
              className={`text-xs font-bold transition-colors uppercase tracking-widest bg-transparent outline-none cursor-pointer ${scrolled ? 'text-slate-600' : 'text-white/80'}`}
              dir="ltr"
            >
              <option value="ar" className="text-slate-900">العربية</option>
              <option value="fr" className="text-slate-900">FR</option>
              <option value="en" className="text-slate-900">EN</option>
            </select>
            <Link to="/login" className={`text-sm font-semibold transition-colors hidden sm:block ${scrolled ? 'text-slate-900 hover:text-cyan-600' : 'text-white hover:text-cyan-300'}`}>
              {txt('تسجيل الدخول', 'Se Connecter', 'Log In')}
            </Link>
            <Link to="/academy" className="px-6 py-2.5 rounded-md bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-700 transition-all shadow-md">
              {txt('ابدأ الآن', 'Commencer', 'Get Started')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - GoDaddy Video Background Style */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center bg-black">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          
          <h1 className="text-5xl md:text-7xl lg:text-[85px] font-black tracking-tight leading-[1.1] mb-6 text-white drop-shadow-xl">
            {txt('مستقبل التجارة يبدأ هنا.', 'L\'avenir du commerce commence ici.', 'The future of commerce starts here.')}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            {txt(
              'أطلق موقعك، ابدأ البيع، وكبّر مشروعك مع أقوى منصة إلكترونية.',
              'Lancez votre site, commencez à vendre et développez votre projet avec la plateforme la plus puissante.',
              'Launch your site, start selling, and grow your business with the most powerful platform.'
            )}
          </p>

          {/* GoDaddy Style Search/Input Bar */}
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-xl flex flex-col sm:flex-row shadow-2xl relative z-20">
            <div className="flex-1 flex items-center px-4 bg-white rounded-l-lg">
              <Search className="w-6 h-6 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                placeholder={txt("شنو هي سمية المشروع ديالك؟ (مثال: MyBrand)", "Quel est le nom de votre projet ?", "What is your project name?")}
                className={`w-full py-4 px-4 outline-none text-xl font-medium text-slate-900 bg-transparent placeholder-slate-400 ${isAr ? 'text-right' : 'text-left'}`}
                dir={isAr ? 'rtl' : 'ltr'}
              />
            </div>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xl px-10 py-4 rounded-lg transition-colors whitespace-nowrap mt-2 sm:mt-0 flex items-center justify-center gap-2">
              {txt('ابحث عن اسمك', 'Vérifier', 'Check Name')}
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <p className="text-sm text-slate-300 mt-6 font-medium">
            {txt('تسجيل مجاني · لا تحتاج بطاقة بنكية · دعم 24/7', 'Inscription gratuite · Sans carte bancaire · Support 24/7', 'Free signup · No credit card required · 24/7 Support')}
          </p>

        </div>
      </section>

      {/* Services Grid - GoDaddy Style */}
      <section className="py-24 px-6 relative z-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-slate-900">{txt('كل ما تحتاجه للنجاح الرقمي', 'Tout ce dont vous avez besoin pour réussir', 'Everything you need to succeed')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Service 1 */}
            <div className="bg-white border border-slate-200 p-10 rounded-2xl hover:shadow-lg transition-all duration-300 group cursor-pointer">
               <Laptop className="w-12 h-12 text-slate-900 mb-6" />
               <h3 className="text-2xl font-black mb-3 text-slate-900">{txt('بناء المتاجر والمواقع', 'Création de Boutiques', 'Store Creation')}</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                 {txt(
                   'قوالب جاهزة واحترافية. صمم موقعك بنفسك بضغطة زر وبدون خبرة تقنية سابقة.',
                   'Templates professionnels prêts à l\'emploi. Créez votre site en un clic sans expertise technique.',
                   'Professional ready-made templates. Create your site in one click with no technical expertise.'
                 )}
               </p>
               <span className="text-cyan-600 font-bold group-hover:text-cyan-800 flex items-center gap-2 transition-colors">
                 {txt('ابدأ الآن', 'Commencer', 'Start Now')} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
               </span>
            </div>

            {/* Service 2 */}
            <div className="bg-white border border-slate-200 p-10 rounded-2xl hover:shadow-lg transition-all duration-300 group cursor-pointer">
               <TrendingUp className="w-12 h-12 text-slate-900 mb-6" />
               <h3 className="text-2xl font-black mb-3 text-slate-900">{txt('أدوات التجارة الإلكترونية', 'Outils E-commerce', 'E-commerce Tools')}</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                 {txt(
                   'كل ما تحتاجه لإدارة الطلبيات، الدفع عند الاستلام (COD)، وربط مع شركات الشحن.',
                   'Tout pour gérer vos commandes, le paiement à la livraison (COD) et la livraison.',
                   'Everything to manage your orders, Cash on Delivery (COD), and shipping integrations.'
                 )}
               </p>
               <span className="text-cyan-600 font-bold group-hover:text-cyan-800 flex items-center gap-2 transition-colors">
                 {txt('اكتشف المزيد', 'En savoir plus', 'Learn More')} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
               </span>
            </div>

            {/* Service 3 */}
            <div className="bg-white border border-slate-200 p-10 rounded-2xl hover:shadow-lg transition-all duration-300 group cursor-pointer">
               <Users className="w-12 h-12 text-slate-900 mb-6" />
               <h3 className="text-2xl font-black mb-3 text-slate-900">{txt('أكاديمية GZeed', 'GZeed Academy', 'GZeed Academy')}</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                 {txt(
                   'تعلم كيف تؤسس وكالتك الرقمية، وكيف تبيع المواقع والمتاجر للشركات وتحقق أرباحاً.',
                   'Apprenez à fonder votre agence digitale, vendre des sites et générer des profits.',
                   'Learn how to build your digital agency, sell websites to businesses, and generate profits.'
                 )}
               </p>
               <span className="text-cyan-600 font-bold group-hover:text-cyan-800 flex items-center gap-2 transition-colors">
                 {txt('تصفح الدروس', 'Voir les cours', 'View Courses')} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
               </span>
            </div>

          </div>
        </div>
      </section>

      {/* Case Study Section (GoDaddy style big banner) */}
      <section className="py-24 px-6 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-3xl overflow-hidden flex flex-col md:flex-row items-center">
           
           <div className="p-12 md:w-1/2 flex flex-col justify-center">
             <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-6">
               <span className="text-white font-black text-xl">BEYA</span>
             </div>
             <h2 className="text-3xl md:text-5xl font-black mb-6 text-white leading-tight">
               {txt('كيف تحول مصنع تقليدي إلى إمبراطورية رقمية؟', 'Comment une usine s\'est transformée en empire digital ?', 'How a traditional factory became a digital empire?')}
             </h2>
             <p className="text-lg text-slate-300 mb-8 leading-relaxed">
               {txt(
                 'اكتشف كيف استخدمنا منصة GZeed لأتمتة عمليات شركة Beya Creative بالكامل وزيادة المبيعات بشكل مضاعف.',
                 'Découvrez comment nous avons automatisé Beya Creative avec GZeed pour multiplier les ventes.',
                 'Discover how we automated Beya Creative with GZeed to multiply sales.'
               )}
             </p>
             <a href="#/case-study/beya" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-black px-8 py-4 rounded-md hover:bg-slate-200 transition-colors w-fit">
               <Play className="w-5 h-5" />
               {txt('شاهد دراسة الحالة', 'Voir l\'étude de cas', 'Watch Case Study')}
             </a>
           </div>

           <div className="w-full md:w-1/2 h-64 md:h-full bg-slate-800 relative">
              {/* Decorative image/pattern representing the case study */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 to-indigo-600/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Video className="w-24 h-24 text-white/20" />
              </div>
           </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-500 bg-slate-50 border-t border-slate-200">
        <p>© {new Date().getFullYear()} GZeed. {txt('تبني المستقبل.', 'Bâtir l\'avenir.', 'Building the future.')}</p>
      </footer>
    </div>
  );
}
