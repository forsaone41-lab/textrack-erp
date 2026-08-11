import React, { useState } from 'react';
import { ArrowRight, ShoppingCart, Globe, CreditCard, Truck, BarChart2, Shield, PlayCircle, Store, Zap, Smartphone, Check, CheckCircle2 } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

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
          <h1 className="text-[54px] lg:text-[64px] font-black leading-[1.1] mb-6 text-[#151E3F]">
            {isAr ? (
              <>البيع عبر الإنترنت <br/>لم يكن أبدًا <br/>بهذه السهولة</>
            ) : (
              <>Vendre en ligne <br/>n'a jamais été <br/>aussi simple</>
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
               {isAr ? 'بدون رسوم إنشاء، فقط 1.5% (أو 0% في باقة PRO)' : 'Aucun frais de création, seulement 1.5% (ou 0% en PRO)'}
             </li>
             <li className="flex items-center gap-3">
               <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
               </div>
               {isAr ? 'جميع أدوات التجارة الإلكترونية في مكان واحد' : 'Tous les outils e-commerce au même endroit'}
             </li>
          </ul>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/store-signup" className={`w-full sm:w-auto px-8 py-4 ${primaryColor} text-white rounded-xl font-bold text-lg ${primaryHover} transition-colors flex items-center justify-center`}>
              {isAr ? 'ابدأ الآن' : 'Get Started'}
            </Link>
            <a href="#contact" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm">
              {isAr ? 'اطلب تصميمًا مخصصًا' : 'Demander un design sur-mesure'}
            </a>
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

      {/* Pricing Section - Matching Screenshot 2 */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#151E3F]">
               {isAr ? 'أسعار تناسب طموحك' : 'Des tarifs adaptés à votre ambition'}
            </h2>
            <p className="text-lg text-slate-500">
               {isAr 
                  ? 'اختر الباقة التي تناسبك وابدأ البيع اليوم. بدون رسوم خفية.' 
                  : 'Choisissez le plan qui vous convient et commencez à vendre aujourd\'hui. Sans frais cachés.'}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-16 font-bold text-sm">
             <span className={!isAnnual ? textColor : 'text-slate-500'}>
                {isAr ? 'شهري' : 'Mensuel'}
             </span>
             <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-14 h-7 rounded-full relative transition-colors flex items-center ${isAnnual ? 'bg-emerald-500' : primaryColor}`}
             >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${isAnnual ? 'right-1' : 'left-1'}`}></div>
             </button>
             <span className={`flex items-center gap-2 ${isAnnual ? 'text-emerald-500' : 'text-slate-500'}`}>
                {isAr ? 'سنوي' : 'Annuel'}
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-600">-20%</span>
             </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            
            {/* PRO Card - White */}
            <div className="bg-white rounded-3xl p-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-100 relative">
               <div className="absolute top-8 right-8 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  {isAr ? '14 يوم تجربة' : "14 JOURS D'ESSAI"}
               </div>
               
               <h3 className="text-2xl font-black text-[#151E3F] mb-1">PRO</h3>
               <p className="text-slate-500 text-sm mb-8">{isAr ? 'لصناع العلامات التجارية' : 'Pour les créateurs de marques'}</p>
               
               <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-5xl font-black text-[#151E3F]">{isAnnual ? '159' : '199'}</span>
                  <span className="text-sm font-bold text-slate-500 uppercase">MAD / {isAr ? 'شهر' : 'MOIS'}</span>
               </div>
               
               <ul className="space-y-4 mb-12">
                  {[
                     isAr ? 'متجر إلكتروني واحد' : '1 Boutique en ligne',
                     isAr ? 'منتجات غير محدودة' : 'Produits illimités',
                     isAr ? '0% رسوم على المبيعات' : '0% de frais de transaction',
                     isAr ? 'استضافة سريعة ومجانية' : 'Hébergement rapide et gratuit',
                     isAr ? 'دعم فني أساسي' : 'Support standard'
                  ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <div className="w-5 h-5 rounded-full border border-blue-200 flex items-center justify-center shrink-0">
                           <Check className="w-3 h-3 text-blue-500" strokeWidth={3} />
                        </div>
                        {item}
                     </li>
                  ))}
               </ul>
               
               <Link to="/store-signup?plan=PRO" className="block w-full py-4 bg-slate-100 text-slate-800 rounded-xl font-bold text-center hover:bg-slate-200 transition-colors">
                  {isAr ? 'ابدأ التجربة المجانية' : 'COMMENCER L\'ESSAI GRATUIT'}
               </Link>
            </div>

            {/* PREMIUM Card - Dark */}
            <div className="bg-[#0B1121] rounded-3xl p-10 shadow-2xl relative">
               <div className="absolute top-8 right-8 text-xs font-bold text-[#451A03] bg-amber-400 px-3 py-1 rounded-full uppercase tracking-wide">
                  {isAr ? 'الأكثر طلباً' : 'POPULAIRE'}
               </div>
               
               <h3 className="text-2xl font-black text-white mb-1">PREMIUM</h3>
               <p className="text-slate-400 text-sm mb-8">{isAr ? 'للعلامات المتعددة' : 'Pour les multi-marques'}</p>
               
               <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-5xl font-black text-white">{isAnnual ? '399' : '499'}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase">MAD / {isAr ? 'شهر' : 'MOIS'}</span>
               </div>
               
               <ul className="space-y-4 mb-12">
                  {[
                     isAr ? 'حتى 5 متاجر' : 'Jusqu\'à 5 Boutiques',
                     isAr ? '0% رسوم على المبيعات' : '0% de frais de transaction',
                     isAr ? 'مساعد ذكاء اصطناعي للمنتجات' : 'Assistant IA pour produits',
                     isAr ? 'أولوية في التنفيذ (VIP)' : 'Priorité de confection (VIP)',
                     isAr ? 'مدير حساب مخصص' : 'Account manager dédié'
                  ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm font-semibold text-white">
                        <div className="w-5 h-5 rounded-full border border-amber-500/30 flex items-center justify-center shrink-0">
                           <Check className="w-3 h-3 text-amber-500" strokeWidth={3} />
                        </div>
                        {item}
                     </li>
                  ))}
               </ul>
               
               <Link to="/store-signup?plan=PREMIUM" className={`block w-full py-4 ${primaryColor} text-white rounded-xl font-bold text-center ${primaryHover} transition-colors`}>
                  {isAr ? 'اشترك الآن' : 'S\'ABONNER MAINTENANT'}
               </Link>
            </div>

          </div>
        </div>
      </section>

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
