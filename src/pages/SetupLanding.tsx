import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, PlayCircle, Star, Rocket, Layout, Globe, Smartphone, ShieldCheck, Clock, Eye, X, ExternalLink, Phone, Tv, Shirt, Gem, Ticket } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link, useLocation } from 'react-router-dom';
import { loadCompanyProfile } from '../types';

export default function SetupLanding() {
  const { isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  const [previewTheme, setPreviewTheme] = useState<{name: string, image: string, url?: string} | null>(null);
  
  // Facebook Pixel tracking - track PageView specifically for this ad campaign
  const location = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.fbq) {
        window.fbq('track', 'ViewContent', { content_name: 'Setup_Service_Landing' });
      }
    }, 1000); // Small delay to ensure parent App.tsx has initialized the pixel
    return () => clearTimeout(timer);
  }, [location]);

  // Dynamic Favicon and Title specifically for BEYA SETUP
  useEffect(() => {
    const originalTitle = document.title;
    const favicon = document.getElementById('dynamic-favicon') as HTMLLinkElement;
    const originalFavicon = favicon ? favicon.href : '/logo.png';
    
    document.title = isAr ? 'BEYA SETUP - أنشئ متجرك الإلكتروني' : 'BEYA SETUP - Créez votre boutique';
    
    if (favicon) {
      // SVG data URI for an orange rounded square with a white rocket
      favicon.href = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23f59e0b'/%3E%3Csvg x='20' y='20' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'/%3E%3Cpath d='m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'/%3E%3Cpath d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0'/%3E%3Cpath d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'/%3E%3C/svg%3E%3C/svg%3E`;
    }

    return () => {
      document.title = originalTitle;
      if (favicon) {
        favicon.href = originalFavicon;
      }
    };
  }, [isAr]);

  const whatsappUrl = `https://wa.me/212675239885?text=${encodeURIComponent(
    isAr ? 'مرحباً، بغيت نستفد من عرض إنشاء متجر إلكتروني متكامل بـ 699 درهم (ZIRORISK).' : 'Bonjour, je suis intéressé par l\'offre de création de boutique complète à 699 MAD (ZIRORISK).'
  )}`;
  
  return (
    <div className={`min-h-screen bg-slate-50 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Theme Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col backdrop-blur-sm animate-in fade-in duration-200">
          <div className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm" dir="ltr">
            <button onClick={() => setPreviewTheme(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
              <X className="w-5 h-5" />
              <span className="font-bold text-sm hidden sm:block">Close Preview</span>
            </button>
            <div className="font-black text-lg text-slate-800 flex items-center gap-2">
              {previewTheme.name} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:inline-block">Live Demo</span>
            </div>
            <a 
              href={`https://wa.me/212675239885?text=${encodeURIComponent(isAr ? `مرحباً، بغيت نستفد من عرض إنشاء متجر إلكتروني (ZIRORISK) وبغيت التصميم ديال: ${previewTheme.name}` : `Bonjour, je suis intéressé par l'offre de création de boutique (ZIRORISK) avec le design: ${previewTheme.name}`)}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <Rocket className="w-4 h-4 hidden sm:block" />
              {isAr ? 'استعمل هاد التصميم' : 'Utiliser ce design'}
            </a>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-100/50 p-4 md:p-8" dir="ltr">
            <div className="max-w-4xl mx-auto shadow-2xl rounded-b-xl overflow-hidden ring-1 ring-slate-900/10 bg-white">
              {/* Fake Browser Header */}
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2 rounded-t-xl sticky top-0 z-10 backdrop-blur-md">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto bg-white px-4 py-1 rounded-md text-[10px] font-mono text-slate-400 border border-slate-200/60 shadow-sm w-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                  {previewTheme.url ? previewTheme.url.replace('https://', '').replace(/\/$/, '') : `demo.beyacreative.com/${previewTheme.name.toLowerCase().replace(' ', '-')}`}
                </div>
                {previewTheme.url ? (
                  <a href={previewTheme.url} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-2 py-1 rounded border border-blue-200">
                    <ExternalLink className="w-3 h-3" /> <span className="hidden sm:inline">{isAr ? 'نافذة جديدة' : 'Ouvrir'}</span>
                  </a>
                ) : (
                  <a href={previewTheme.image} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 transition-colors px-2 py-1 rounded border border-slate-200">
                    <ExternalLink className="w-3 h-3" /> <span className="hidden sm:inline">{isAr ? 'تكبير الصورة' : 'Agrandir'}</span>
                  </a>
                )}
              </div>
              {previewTheme.url ? (
                <iframe src={previewTheme.url} title={previewTheme.name} className="w-full h-[75vh] border-none block bg-white" />
              ) : (
                <img src={previewTheme.image} alt={previewTheme.name} className="w-full h-auto block" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-amber-500 text-white shadow-sm shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-amber-500 mt-0.5 uppercase">SETUP</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggle}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase"
            >
              {isAr ? 'FR' : 'AR'}
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20">
              {isAr ? 'تواصل معنا' : 'Contactez-nous'}
            </a>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-amber-100/50 to-transparent -z-10" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-bold text-sm mb-8 shadow-sm">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>{isAr ? 'خدمة بناء المتاجر الأكثر طلباً' : 'Le service de création le plus demandé'}</span>
          </div>
          
          <h1 className={`font-black text-slate-900 tracking-tight mb-6 ${isAr ? 'text-4xl md:text-5xl leading-[1.4]' : 'text-5xl md:text-6xl leading-[1.1]'}`}>
            {isAr ? (
              <>تهنا من صداع الراس، <br/><span className="text-amber-500">حنا نقادو ليك السيت ولا المتجر من الألف للياء.</span></>
            ) : (
              <>Fini les casse-têtes techniques ! <br/><span className="text-amber-500">Nous créons votre site de A à Z.</span></>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'استلم مشروعك واجد 100% وبأقل ثمن فالسوق. بلا متقلب على مبرمجين يضيعو ليك الوقت والفلوس. (مواقع احترافية ومتاجر جاهزة للبيع).'
              : 'Recevez votre projet clé en main au meilleur prix du marché. Ne perdez plus de temps et d\'argent avec des développeurs.'}
          </p>
          
          <div className={`grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
            
            {/* Site Professionnel Pricing Box */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden flex flex-col h-full">
               <div className={`absolute top-0 ${isAr ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} bg-blue-500 text-white px-4 py-1 font-bold text-xs`}>
                 {isAr ? 'للخدمات والشركات' : 'Services & Entreprises'}
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 mt-4">{isAr ? 'الباك الاقتصادي' : 'Pack Essentiel'}</h3>
               <p className="text-sm text-slate-500 mb-6 flex-1">{isAr ? 'بان قدام الكليان ديالك بحرفية. موقع واجد باش يتواصلو معاك. (خلص مرة وحدة وتهنا).' : 'Site vitrine pro pour présenter vos services et gagner la confiance. (Paiement unique).'}</p>
               
               <div className="flex flex-col mb-1">
                 <span className="text-sm text-slate-400 line-through font-bold">{isAr ? '1500 MAD' : '1500 MAD'}</span>
                 <div className="flex items-baseline gap-2 text-slate-900">
                   <span className="text-5xl font-black tracking-tighter">499</span>
                   <span className="text-lg font-bold">MAD</span>
                 </div>
               </div>
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'تكلفة الإعداد (تدفع مرة واحدة)' : 'Frais de Création (Unique)'}</span>
               
               <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                 <p className="text-blue-800 font-bold text-xs leading-relaxed">
                   {isAr ? 'كراء السيرفور والدومين بـ 399 درهم/سنة فقط. (أرخص من قهوة).' : 'Abonnement (399 MAD/an) incluant l\'hébergement et le domaine.'}
                 </p>
               </div>
               
               <div className="mt-6 flex flex-col gap-3">
                 <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md">
                   {isAr ? 'احجز موقعك' : 'Commander le Site'}
                 </a>
                 <button onClick={() => document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors text-sm">
                   {isAr ? 'شوف الأمثلة' : 'Voir les modèles'}
                 </button>
               </div>
            </div>

            {/* VIP Corporate Site Box */}
            <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl hover:shadow-emerald-900/50 transition-shadow relative overflow-hidden flex flex-col h-full md:-translate-y-6">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent"></div>
               <div className={`absolute top-0 ${isAr ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} bg-emerald-500 text-slate-900 px-4 py-1 font-bold text-xs z-10`}>
                 {isAr ? 'للشركات والعيادات (VIP)' : 'Corporate & Cliniques (VIP)'}
               </div>
               <h3 className="text-2xl font-black text-white mb-2 mt-4 relative z-10">{isAr ? 'باك الشركات (VIP)' : 'Pack Corporate VIP'}</h3>
               <p className="text-sm text-slate-400 mb-6 flex-1 relative z-10">{isAr ? 'بغيتي تبان واعر على المنافسين ديالك؟ تصميم فخم كيعطي هيبة للبراند ديالك.' : 'Design ultra-premium pour asseoir votre autorité et dominer la concurrence.'}</p>
               
               <div className="flex flex-col mb-1 relative z-10">
                 <span className="text-sm text-slate-500 line-through font-bold">{isAr ? '7000 MAD' : '7000 MAD'}</span>
                 <div className="flex items-baseline gap-2 text-white">
                   <span className="text-5xl font-black tracking-tighter">2999</span>
                   <span className="text-lg font-bold text-emerald-500">MAD</span>
                 </div>
               </div>
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest relative z-10">{isAr ? 'تكلفة الإعداد (تدفع مرة واحدة)' : 'Frais de Création (Unique)'}</span>
               
               <div className="mt-4 bg-emerald-900/30 p-3 rounded-lg border border-emerald-800/50 text-center relative z-10">
                 <p className="text-emerald-400 font-bold text-xs leading-relaxed">
                   {isAr ? 'سيرفور طيارة ومصاريف الصيانة بـ 999 درهم/سنة. (تهنا من المشاكل).' : 'Serveur ultra-rapide et maintenance à 999 MAD/an. (Tranquillité totale).'}
                 </p>
               </div>

               <div className="mt-6 flex flex-col gap-3 relative z-10">
                 <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                   {isAr ? 'احجز موقع VIP' : 'Commander Site VIP'}
                 </a>
                 <button onClick={() => document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors text-sm">
                   {isAr ? 'شوف الأمثلة' : 'Voir les modèles'}
                 </button>
               </div>
            </div>

            {/* E-commerce Store Pricing Box */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-amber-500 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden flex flex-col h-full md:-translate-y-2">
               <div className={`absolute top-0 ${isAr ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} bg-amber-500 text-slate-900 px-4 py-1 font-bold text-xs`}>
                 {isAr ? 'لبيع المنتجات (E-commerce)' : 'Pour l\'E-commerce'}
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 mt-4">{isAr ? 'متجر إلكتروني' : 'Boutique E-commerce'}</h3>
               <p className="text-sm text-slate-500 mb-6 flex-1">{isAr ? 'متجر واجد للبيع. تطبيقات احترافية باش تضاعف المبيعات ديالك بلا صداع.' : 'Boutique prête à vendre. Apps pros pour booster vos ventes sans soucis.'}</p>
               
               <div className="flex flex-col mb-1">
                 <span className="text-sm text-slate-400 line-through font-bold">{isAr ? '2500 MAD' : '2500 MAD'}</span>
                 <div className="flex items-baseline gap-2 text-slate-900">
                   <span className="text-5xl font-black tracking-tighter">699</span>
                   <span className="text-lg font-bold">MAD</span>
                 </div>
               </div>
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'تكلفة الإعداد (تدفع مرة واحدة)' : 'Frais de Setup (Unique)'}</span>
               
               <div className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                 <p className="text-amber-800 font-bold text-xs leading-relaxed">
                   {isAr ? 'كراء السيرفور (199 درهم/شهر) متبدا تخلصو حتى تدخل أول مبيعة! (ماعندك ماتخسر).' : 'Abonnement (199 MAD) ne commence qu\'après votre 1ère vente !'}
                 </p>
               </div>

               <div className="mt-6 flex flex-col gap-3">
                 <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                   {isAr ? 'احجز متجرك' : 'Commander la Boutique'}
                 </a>
                 <button onClick={() => document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors text-sm">
                   {isAr ? 'شوف الأمثلة' : 'Voir les modèles'}
                 </button>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* 2.5 Partners Marquee */}
      <section className="py-12 bg-white overflow-hidden border-b border-slate-100">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-rtl {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee {
            width: max-content;
            animation: marquee 12s linear infinite;
          }
          [dir="rtl"] .animate-marquee {
            animation: marquee-rtl 12s linear infinite;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 mb-8">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {isAr ? 'موثوق به من طرف أكثر من 500 علامة تجارية' : 'Fait confiance par plus de 500 marques'}
          </p>
        </div>
        
        <div className="relative flex overflow-hidden group">
          {/* Fading Edges */}
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          <div className="animate-marquee flex items-center gap-24 md:gap-32 w-max px-12 group-hover:[animation-play-state:paused]">
            {[1, 2, 3].map((group) => (
              <React.Fragment key={group}>
                <span className="font-black text-3xl text-slate-800 blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-tighter uppercase">FASHLOW</span>
                <span className="font-extrabold text-2xl text-blue-600 italic blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-widest uppercase">MODAVION</span>
                <span className="font-black text-3xl text-amber-500 tracking-tight blur-[0.5px] opacity-75 mix-blend-multiply select-none">BEYA<span className="font-light text-slate-500">CREATIVE</span></span>
                <span className="font-bold text-3xl text-rose-500 blur-[0.5px] opacity-75 mix-blend-multiply select-none uppercase tracking-widest">STYLEMA</span>
                <span className="font-black text-3xl text-emerald-500 blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-tighter">URBAN<span className="font-light text-slate-600">WEAR</span></span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 3. What's Included */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">
            {isAr ? 'شنو كتستفد ملي كتصاوب السيت ديالك معانا؟' : 'Que comprennent nos packs ?'}
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Globe, title: isAr ? 'دومين احترافي (.com / .net)' : 'Domaine professionnel', desc: isAr ? 'نشريو ونربطو ليك دومين باسم علامتك التجارية' : 'Achat et configuration de votre domaine' },
              { icon: Layout, title: isAr ? 'تصميم فخم ومتجاوب' : 'Design Premium & Responsive', desc: isAr ? 'تصميم كيجاوب مع التليفون ومصمم لزيادة الثقة والمبيعات' : 'Design optimisé pour mobile et conversions' },
              { icon: Smartphone, title: isAr ? 'تطبيقات لزيادة المبيعات' : 'Apps de Ventes', desc: isAr ? 'إعداد إضافات تزيد من قيمة الطلب وتسهل التواصل' : 'Configuration des apps pour booster vos commandes' },
              { icon: ShieldCheck, title: isAr ? 'دعم فني مستمر' : 'Support technique continu', desc: isAr ? 'فريقنا معاك خطوة بخطوة طول العام باش يجاوب على أسئلتك' : 'Notre équipe vous accompagne toute l\'année' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 4. Themes / Examples Section */}
      <section id="themes-section" className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">{isAr ? 'نماذج من المواقع اللي غنصاوبو ليك' : 'Exemples de sites web'}</h2>
            <p className="text-slate-500 text-lg mb-8">{isAr ? 'تصاميم احترافية متجاوبة مع الموبايل مصممة خصيصاً لمجالك' : 'Des designs professionnels adaptés à votre domaine'}</p>
          </div>
          
          {/* E-Commerce Section */}
          <div className="mb-8 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
               <Globe className="w-5 h-5" />
             </div>
             <h3 className="text-2xl font-black text-slate-800">{isAr ? 'متاجر إلكترونية (E-Commerce)' : 'Boutiques E-commerce'}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Theme 1 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'MAZIA', image: '/images/themes/cosmetics.png', url: window.location.origin + '/#/demo/mazia' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/cosmetics.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Mazia" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  MAZIA
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">MAZIA <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            {/* Theme 2 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'STREETWEAR PRO', image: '/images/themes/bidla.png', url: window.location.origin + '/#/demo/bidla' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/bidla.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Streetwear Pro" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  STREETWEAR PRO
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">STREETWEAR PRO <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            {/* Theme 3 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'MINIMALIST', image: '/images/themes/tech.png', url: window.location.origin + '/#/demo/ecommerce/minimalist' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/tech.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Minimalist" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  MINIMALIST
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">MINIMALIST <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            {/* Theme 3.5: Agency Pixy */}
            <div 
              onClick={() => setPreviewTheme({ name: 'AGENCY PIXY', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop', url: window.location.origin + '/#/demo/agency-pixy' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Theme Agency Pixy" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  AGENCY PIXY
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">AGENCY PIXY <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            {/* Theme 4 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'ABAYA FASHION', image: '/images/themes/abaya.png', url: window.location.origin + '/#/demo/ecommerce/abaya' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/abaya.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Abaya" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  ABAYA FASHION
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">ABAYA FASHION <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            {/* Theme 6 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'LUXURY PERFUME', image: '/images/themes/perfume.png', url: window.location.origin + '/#/demo/ecommerce/luxury-perfume' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/perfume.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Perfume" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  LUXURY PERFUME
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">LUXURY PERFUME <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Theme 7 (Digital Products / IPTV) */}
            <div
              onClick={() => setPreviewTheme({ name: isAr ? 'منتجات رقمية' : 'STREAM BOX MA', image: '/demo-assets/digital.png', url: window.location.origin + '/#/demo/ecommerce/iptv' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/demo-assets/digital.png" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Theme IPTV Digital Products" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 left-4 bg-violet-600 text-white p-2 rounded-full shadow-sm">
                  <Tv className="w-4 h-4" />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'منتجات رقمية' : 'STREAM BOX MA'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'منتجات رقمية' : 'STREAM BOX MA'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Theme 8 (Lingerie / Underwear & Accessories) */}
            <div
              onClick={() => setPreviewTheme({ name: isAr ? 'ملابس حريرية' : 'SILK & LACE', image: '/demo-assets/lingerie/silk_theme_ui.png', url: window.location.origin + '/#/demo/ecommerce/lingerie' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/demo-assets/lingerie/lingerie_hero_1786817080033.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Lingerie" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 left-4 bg-stone-600 text-white p-2 rounded-full shadow-sm">
                  <Gem className="w-4 h-4" />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'ملابس حريرية' : 'SILK & LACE'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'ملابس حريرية' : 'SILK & LACE'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Theme 9 (Jalaba & Caftan Marocain) */}
            <div
              onClick={() => setPreviewTheme({ name: isAr ? 'جلابة وقفطان' : 'DAR CAFTAN', image: '/demo-assets/jalaba-caftan/dar_caftan_ui.png', url: window.location.origin + '/#/demo/ecommerce/jalaba-caftan' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/demo-assets/jalaba-caftan/moroccan_caftan_hero_1786817002711.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Jalaba Caftan" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 left-4 bg-emerald-700 text-white p-2 rounded-full shadow-sm">
                  <Shirt className="w-4 h-4" />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'جلابة وقفطان' : 'DAR CAFTAN'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'جلابة وقفطان' : 'DAR CAFTAN'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
          </div>


          {/* Services Section */}
          <div className="mt-16 mb-8 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
             </div>
             <h3 className="text-2xl font-black text-slate-800">{isAr ? 'الخدمات (Services)' : 'Services'}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'DENTIST CLINIC', image: '/images/themes/dentist.png', url: window.location.origin + '/#/demo/dentist' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/dentist.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Dentist" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  DENTIST CLINIC
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">DENTIST CLINIC <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            
            {/* Service 2 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'LUXE RENTALS', image: '/demo-assets/luxe-rentals.png', url: window.location.origin + '/#/demo/car-rental' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/demo-assets/luxe-rentals.png" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Theme Car Rental" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  LUXE RENTALS
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">LUXE RENTALS <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Service 3 (City Rentals) */}
            <div 
              onClick={() => setPreviewTheme({ name: isAr ? 'كراء السيارات' : 'LOCATION VOITURES', image: '/demo-assets/city-rentals.png', url: window.location.origin + '/#/demo/city-rentals' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/demo-assets/city-rentals.png" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Theme Location Voitures" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'كراء السيارات' : 'LOCATION VOITURES'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'كراء السيارات' : 'LOCATION VOITURES'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Service 4 (Home Services Pro) */}
            <div 
              onClick={() => setPreviewTheme({ name: isAr ? 'خدمات منزلية' : 'FIXIT MAROC', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop', url: window.location.origin + '/#/demo/service-pro' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Theme Home Services" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'خدمات منزلية' : 'FIXIT MAROC'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'خدمات منزلية' : 'FIXIT MAROC'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Service 5 (Apartment) */}
            <div 
              onClick={() => setPreviewTheme({ name: isAr ? 'كراء الشقق' : 'DAR STAY', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', url: window.location.origin + '/#/demo/apartment' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Apartment Rentals" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'كراء الشقق' : 'DAR STAY'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'كراء الشقق' : 'DAR STAY'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Service 6 (Beauty Salon) */}
            <div 
              onClick={() => setPreviewTheme({ name: isAr ? 'صالون تجميل' : 'BEAUTY SALON', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800', url: window.location.origin + '/#/demo/beauty-salon' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Beauty Salon" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'صالون تجميل' : 'BEAUTY SALON'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'صالون تجميل' : 'BEAUTY SALON'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Service 7 (Traiteur/Events) */}
            <div 
              onClick={() => setPreviewTheme({ name: isAr ? 'تنظيم الحفلات' : 'ROYAL EVENTS', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', url: window.location.origin + '/#/demo/traiteur' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Events Traiteur" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'تنظيم الحفلات' : 'ROYAL EVENTS'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'تنظيم الحفلات' : 'ROYAL EVENTS'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Service 8 (Logistics) */}
            <div 
              onClick={() => setPreviewTheme({ name: isAr ? 'شركة توصيل' : 'BEYA EXPRESS', image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800', url: window.location.origin + '/#/demo/logistics' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Logistics Delivery" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'شركة توصيل' : 'BEYA EXPRESS'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'شركة توصيل' : 'BEYA EXPRESS'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Tourism 1 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'OMRA & TOURS', image: '/images/themes/tourism_1.png', url: window.location.origin + '/#/demo/omra-tours' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/tourism_1.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Tourism Agency" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  OMRA & TOURS
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">OMRA & TOURS <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            {/* Tourism 2 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'VACATION DEALS', image: '/images/themes/tourism_2.png', url: window.location.origin + '/#/demo/vacation-deals' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/tourism_2.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Tourism Agency" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  VACATION DEALS
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">VACATION DEALS <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
            {/* Tourism 3 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'LOCAL TOURS', image: '/images/themes/tourism_3.png', url: window.location.origin + '/#/demo/tourism' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/tourism_3.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Tourism Agency" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  LOCAL TOURS
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">LOCAL TOURS <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>

            {/* Event & Conference */}
            <div
              onClick={() => setPreviewTheme({ name: isAr ? 'مؤتمرات وفعاليات' : 'NEXUS SUMMIT', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop', url: window.location.origin + '/#/demo/event-conference' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" alt="Theme Event Conference" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 left-4 bg-fuchsia-600 text-white p-2 rounded-full shadow-sm">
                  <Ticket className="w-4 h-4" />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  {isAr ? 'مؤتمرات وفعاليات' : 'NEXUS SUMMIT'}
                </div>
              </div>
              <div className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-slate-800 text-lg">{isAr ? 'مؤتمرات وفعاليات' : 'NEXUS SUMMIT'} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200">
                  <Eye className="w-4 h-4" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
             <p className="text-slate-500 font-medium mb-6">{isAr ? '+ عشرات التصاميم الأخرى اللي غتناسب النوع ديال منتجاتك (Niche)' : '+ Des dizaines d\'autres modèles adaptés à votre niche'}</p>
             <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex px-8 py-3 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-bold transition-colors">
               {isAr ? 'عجبوني، بغيت متجر بحالهم' : 'Je veux une boutique comme ça'}
             </a>
          </div>
        </div>
      </section>
      
      {/* 5. Professional CTA */}
      <section className="py-20 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-emerald-900/40 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <Rocket className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            {isAr ? 'مستعد تبدا مشروعك الرقمي؟' : 'Prêt à lancer votre projet ?'}
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
            {isAr 
              ? 'سواء كنتي طبيب، شركة لوجيستيك، صالون، ولا باغي تبيع منتجاتك. حنا شريكك التقني باش توصل للنجاح. فريقنا واجد يجاوب على كل التساؤلات ديالك.'
              : 'Que vous soyez médecin, agence, salon ou e-commerçant. Nous sommes votre partenaire technique pour réussir.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-emerald-500 text-slate-900 px-10 py-4 rounded-xl font-black text-xl hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-3">
              <Phone className="w-6 h-6" />
              {isAr ? 'تواصل مع خبير مجاناً' : 'Parler à un expert'}
            </a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full sm:w-auto bg-slate-800 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-colors border border-slate-700">
              {isAr ? 'راجع الباقات والأثمنة' : 'Revoir les prix'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-center border-t border-slate-800 text-slate-500 text-sm font-medium">
        <p>© {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
      </footer>
    </div>
  );
}
