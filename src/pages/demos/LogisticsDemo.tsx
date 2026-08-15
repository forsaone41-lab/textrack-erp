import React, { useState } from 'react';
import { Package, Truck, Clock, ShieldCheck, Search, ChevronRight, CheckCircle2, Menu, X, ArrowRight } from 'lucide-react';

export default function LogisticsDemo() {
  const [lang, setLang] = useState<'fr'|'ar'|'en'>('fr');
  const [showToast, setShowToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trackId, setTrackId] = useState('');

  const t = (en: string, fr: string, ar: string) => {
    if (lang === 'en') return en;
    if (lang === 'fr') return fr;
    return ar;
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">{t('Tracking info sent!', 'Informations envoyées!', 'تم إرسال معلومات التتبع!')}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <Truck className="w-8 h-8" />
            <h1 className="text-2xl font-black italic tracking-tighter">
              BEYA<span className="text-amber-500">EXPRESS</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex gap-8 font-bold text-sm text-slate-600">
            <a href="#" className="hover:text-blue-700 transition">{t('Track', 'Suivi', 'تتبع')}</a>
            <a href="#" className="hover:text-blue-700 transition">{t('Solutions', 'Solutions', 'حلول')}</a>
            <a href="#" className="hover:text-blue-700 transition">{t('Pricing', 'Tarifs', 'الأسعار')}</a>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setLang(lang === 'ar' ? 'fr' : lang === 'fr' ? 'en' : 'ar')} className="font-black text-slate-400 hover:text-blue-700 text-sm">{lang.toUpperCase()}</button>
            <a href="#" className="hidden md:flex bg-amber-500 text-slate-900 px-6 py-2.5 rounded-lg text-sm font-black hover:bg-amber-400 transition items-center gap-2">
              {t('Ship Now', 'Expédier', 'إرسال طرد')} <ArrowRight className="w-4 h-4"/>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-700 text-white pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></pattern></defs>
              <rect width="100%" height="100%" fill="url(#dots)"></rect>
           </svg>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            {t('Fast. Reliable.', 'Rapide. Fiable.', 'سريع. موثوق.')}<br />
            <span className="text-amber-400">{t('E-commerce Delivery.', 'Livraison E-commerce.', 'توصيل التجارة الإلكترونية.')}</span>
          </h2>
          <p className="text-blue-200 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto">
            {t('The ultimate COD delivery partner in Morocco. We deliver your packages and collect your cash safely.', 'Le partenaire ultime de livraison COD au Maroc. Nous livrons vos colis et collectons votre argent en toute sécurité.', 'الشريك المثالي لتوصيل الدفع عند الاستلام في المغرب. نقوم بتوصيل طرودك وتحصيل أموالك بأمان.')}
          </p>
          
          {/* Tracking Form */}
          <form onSubmit={handleTrack} className="bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto shadow-2xl">
             <div className="flex-1 flex items-center px-4 py-3 text-slate-900">
               <Package className="w-6 h-6 text-blue-300 mr-3 shrink-0" />
               <input 
                 type="text" 
                 required
                 value={trackId}
                 onChange={(e) => setTrackId(e.target.value)}
                 placeholder={t('Enter your tracking number (e.g., BEYA12345)', 'Entrez votre numéro de suivi (ex: BEYA12345)', 'أدخل رقم التتبع (مثل BEYA12345)')} 
                 className="w-full bg-transparent outline-none font-bold text-sm placeholder:text-slate-400 placeholder:font-normal" 
                 dir="ltr"
               />
             </div>
             <button type="submit" className="bg-amber-500 text-slate-900 rounded-xl px-8 py-4 font-black hover:bg-amber-400 transition flex items-center justify-center gap-2 text-lg">
               <Search className="w-5 h-5" /> {t('Track', 'Suivre', 'تتبع')}
             </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto -mt-20 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
               <Clock className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-3">{t('24h Delivery', 'Livraison 24h', 'توصيل في 24 ساعة')}</h3>
             <p className="text-slate-500 font-medium">{t('Next day delivery across all major cities in Morocco.', 'Livraison le lendemain dans toutes les grandes villes du Maroc.', 'التوصيل في اليوم التالي في جميع المدن الكبرى في المغرب.')}</p>
           </div>
           
           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
               <ShieldCheck className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-3">{t('Secure COD', 'COD Sécurisé', 'دفع عند الاستلام آمن')}</h3>
             <p className="text-slate-500 font-medium">{t('Fast and secure return of funds to your bank account.', 'Retour rapide et sécurisé des fonds sur votre compte bancaire.', 'إرجاع سريع وآمن للأموال إلى حسابك البنكي.')}</p>
           </div>

           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
               <Truck className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-3">{t('Wide Coverage', 'Large Couverture', 'تغطية واسعة')}</h3>
             <p className="text-slate-500 font-medium">{t('Delivering to over 200 destinations nationwide.', 'Livraison vers plus de 200 destinations à travers le pays.', 'التوصيل إلى أكثر من 200 وجهة على الصعيد الوطني.')}</p>
           </div>
        </div>
      </section>

    </div>
  );
}
