import React, { useState } from 'react';
import { ArrowRight, ShoppingCart, Globe, CreditCard, Truck, BarChart2, Shield, PlayCircle, Store, Zap, Smartphone, Check, CheckCircle2 } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';
import { PricingSection } from '../components/PricingSection';

export default function StoreLandingV4() {
  const { isAr, toggle } = useLang();
  
  // YouCan-like blue color theme based on screenshots
  const primaryColor = "bg-[#1853FF]";
  const primaryHover = "hover:bg-[#1040D0]";
  const textColor = "text-[#1853FF]";
  
  // Pricing toggle state
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className={`min-h-screen bg-white text-slate-900 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Navbar - Exactly like screenshot */}
      <nav className="fixed top-0 w-full bg-white z-50 border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">STORES</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <button onClick={toggle} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors uppercase">
              {isAr ? 'FR' : 'AR'}
            </button>
            <Link to="/store-signup?mode=login" className="hidden sm:block text-sm font-bold text-slate-700 hover:text-black transition-colors">
              {isAr ? 'Connexion' : 'Connexion'}
            </Link>
            <Link to="/store-signup" className={`px-6 py-2.5 ${primaryColor} text-white text-sm font-bold rounded-xl ${primaryHover} transition-colors`}>
              {isAr ? 'Créer un compte' : 'Créer un compte'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Matching Screenshot 1 */}
      <section className="pt-32 pb-20 px-6 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 text-start">
          <div className="inline-block mb-6">
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm font-black px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 w-fit">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {isAr ? '🚀 ابدأ الآن - لن تدفع الاشتراك حتى تحقق مبيعتك الأولى!' : '🚀 Démarrez maintenant - Abonnement payé après la 1ère vente !'}
            </span>
          </div>
          
          <h1 className={`font-black mb-6 text-[#151E3F] ${isAr ? 'text-[42px] lg:text-[52px] leading-[1.4]' : 'text-[54px] lg:text-[64px] leading-[1.1]'}`}>
            {isAr ? (
              <>متجر احترافي، 0% عمولة، <br/>وبيزنس جاهز للعمل <br/>من اليوم الأول!</>
            ) : (
              <>Boutique PRO, 0% commission, <br/>et un business prêt <br/>dès le premier jour !</>
            )}
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
            {isAr 
              ? 'أطلق متجرك الإلكتروني في بضع نقرات واستفد من أدواتنا القوية للتجارة الإلكترونية لبناء عمل مربح.'
              : 'Démarrez votre boutique en ligne en quelques clics et profitez de nos puissants outils e-commerce pour bâtir une activité rentable.'}
          </p>
          
          {/* Checkmarks list */}
          <ul className="space-y-4 mb-10 text-sm font-semibold text-slate-700">
             <li className="flex items-center gap-3">
               <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
               </div>
               {isAr ? 'إعداد متجر سهل وبديهي' : 'Configuration de boutique facile et intuitive'}
             </li>
             <li className="flex items-center gap-3">
               <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
               </div>
               {isAr ? '0% عمولة على المبيعات، احتفظ بجميع أرباحك' : '0% de commission, gardez 100% de vos bénéfices'}
             </li>
             <li className="flex items-center gap-3">
               <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center shrink-0 bg-amber-50">
                  <Check className="w-3 h-3 text-amber-500" strokeWidth={3} />
               </div>
               <span className="font-bold text-amber-700">
                 {isAr ? 'بدون خبرة؟ نصمم متجرك بالكامل (دومين، تصميم، Upsell) بـ 800 درهم فقط!' : 'Sans expérience ? On crée votre boutique (Domaine, Design, Upsell) pour 800 MAD !'}
               </span>
             </li>
          </ul>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/store-signup" className={`w-full sm:w-auto px-8 py-4 ${primaryColor} text-white rounded-xl font-bold text-lg ${primaryHover} transition-colors flex items-center justify-center shadow-lg shadow-blue-500/30`}>
              {isAr ? 'ابدأ الآن' : 'Get Started'}
            </Link>
            <Link to="/store-signup?plan=ZIRORISK" className="w-full sm:w-auto px-8 py-4 bg-amber-50 border-2 border-amber-400 text-amber-700 rounded-xl font-black text-lg hover:bg-amber-100 transition-colors flex items-center justify-center shadow-sm">
              {isAr ? 'اطلب متجرك الجاهز بـ 800 درهم' : 'Boutique clé en main (800 MAD)'}
            </Link>
          </div>
        </div>
        
        <div className="lg:w-1/2 relative">
           {/* Mockup Card from Screenshot */}
           <div className="relative rounded-3xl bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6">
              {/* Fake Window Dots */}
              <div className="flex gap-2 mb-6">
                 <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              
              {/* Fake Dashboard Elements */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-300">
                    <Smartphone className="w-8 h-8" />
                 </div>
                 <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-amber-400">
                    <Zap className="w-8 h-8" />
                 </div>
              </div>
              
              <div className="h-40 rounded-xl bg-[#0B1121] border border-slate-800 p-6 relative">
                 <div className="text-emerald-400 font-mono text-sm font-bold mb-4">{'< >'}</div>
                 <div className="w-3/4 h-2 bg-slate-800 rounded-full mb-3"></div>
                 <div className="w-1/2 h-2 bg-slate-800 rounded-full mb-6"></div>
                 <div className="w-5/6 h-2 bg-slate-800 rounded-full mb-3"></div>
                 <div className="w-full h-2 bg-slate-800 rounded-full"></div>
                 
                 <Shield className="absolute bottom-4 right-4 w-6 h-6 text-emerald-500" />
              </div>
           </div>
        </div>
      </section>

      {/* Stats Section under Hero */}
      <section className="border-t border-slate-100 py-10">
         <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap justify-start gap-20">
            <div>
               <div className="text-2xl font-black text-slate-900">+500</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">ACTIVE STORES</div>
            </div>
            <div>
               <div className="text-2xl font-black text-slate-900">+15</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">SERVED COUNTRIES</div>
            </div>
            <div>
               <div className="text-2xl font-black text-emerald-500">+20%</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">CONVERSION RATE</div>
            </div>
         </div>
      </section>

      {/* Pricing Section - Unified */}
      <PricingSection bgClass="bg-slate-50" />

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-slate-100 text-center flex flex-col items-center justify-center gap-4">
           <Link to="/" className="flex items-center gap-2 mb-2" dir="ltr">
             <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
               <Store className="w-5 h-5" />
             </div>
             <div className="flex flex-col justify-center text-left">
               <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
               <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">STORES</span>
             </div>
           </Link>
           <p className="text-slate-400 font-medium text-sm">
             © {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
           </p>
        </div>
      </footer>
    </div>
  );
}
