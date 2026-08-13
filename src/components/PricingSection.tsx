import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

export function PricingSection({
  bgClass = "bg-slate-50",
  titleClass = "text-slate-900"
}: {
  bgClass?: string;
  titleClass?: string;
}) {
  const { isAr } = useLang();
  
  const proPrice = '199';
  const premiumPrice = '499';

  return (
    <section className={`py-32 relative ${bgClass}`} id="pricing">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className={`text-4xl md:text-6xl font-black mb-6 tracking-tight ${titleClass}`}>
            {isAr ? 'خطط أسعار واضحة' : 'Des tarifs transparents'}
          </h2>
          <p className="text-xl text-slate-600">
            {isAr 
              ? 'اختر الخطة التي تناسبك وابدأ البيع اليوم. بدون رسوم خفية.'
              : 'Choisissez le plan qui vous convient et commencez à vendre aujourd\'hui. Sans frais cachés.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch" dir={isAr ? "rtl" : "ltr"}>
          
          {/* PRO Plan */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-xl relative flex flex-col h-full lg:mt-4">
            <div className={`absolute top-6 ${isAr ? 'right-6' : 'left-6'}`}>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                {isAr ? 'بدون اشتراك حتى تبيع' : 'Gratuit jusqu\'à la 1ère vente'}
              </span>
            </div>

            <div className="mt-6 text-center sm:text-start">
              <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">PRO</h3>
              <p className="text-slate-500 mb-6 font-medium text-xs">{isAr ? 'للمبتدئين في التجارة الإلكترونية' : 'Création autonome'}</p>
            </div>
            
            <div className="mb-6 flex flex-col pb-6 border-b border-slate-100 items-center sm:items-start">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-slate-400 line-through decoration-2">299</span>
                <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'خصم' : 'PROMO'}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{proPrice}</span>
                <span className="text-slate-500 font-bold text-xs">MAD / {isAr ? 'شهر' : 'mois'}</span>
              </div>
            </div>
            
            <ul className="space-y-3.5 mb-8 flex-1 text-sm">
              {[
                isAr ? 'متجر إلكتروني واحد' : '1 Boutique en ligne',
                isAr ? 'منتجات غير محدودة و0% عمولة' : 'Produits illimités & 0% commision',
                isAr ? 'استضافة مجانية وسريعة' : 'Hébergement rapide et gratuit',
                isAr ? 'تطبيقات لزيادة المبيعات' : 'Apps de conversion (Upsell)',
                isAr ? 'دعم فني قياسي' : 'Support standard',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 bg-indigo-50 rounded-full" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/store-signup?plan=PRO" className="block w-full py-3.5 text-center rounded-2xl font-bold text-sm bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all">
              {isAr ? 'ابدأ الآن' : 'Créer ma boutique'}
            </Link>
          </div>

          {/* ZIRORISK Plan (Highlighted) */}
          <div className="bg-[#0b1120] text-white rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative flex flex-col h-full transform hover:-translate-y-2 transition-all duration-300 z-10 lg:-translate-y-4">
            <div className={`absolute top-6 ${isAr ? 'right-6' : 'left-6'}`}>
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                {isAr ? 'الأكثر مبيعاً' : 'Le plus populaire'}
              </span>
            </div>
            
            <div className="mt-6 text-center sm:text-start">
              <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">ZIRORISK</h3>
              <p className="text-slate-400 mb-6 font-medium text-xs">{isAr ? 'بيزنس جاهز، حنا نصاوبو كولشي' : 'Business clé en main'}</p>
            </div>
            
            <div className="mb-6 flex flex-col pb-6 border-b border-slate-800 items-center sm:items-start">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-slate-500 line-through decoration-2">1,500</span>
                <span className="text-[9px] font-black text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'عرض' : 'PROMO'}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">699</span>
                <span className="text-slate-400 font-bold text-xs">MAD / {isAr ? 'مرة واحدة (Setup)' : 'Une fois (Setup)'}</span>
              </div>
            </div>
            
            <ul className="space-y-3.5 mb-8 flex-1 text-sm">
              {[
                isAr ? 'تصميم متجر احترافي + شراء دومين (.com)' : 'Création boutique + Domaine PRO (.com)',
                isAr ? 'إعداد تطبيقات المبيعات (Upsell) جاهزة' : 'Configuration des apps de vente (Upsell)',
                isAr ? 'ربط أوتوماتيكي مع منصة eGrow' : 'Liaison automatique avec eGrow',
                isAr ? 'الاشتراك (199) يبدأ بعد أول مبيعة' : 'Abonnement (199) après la 1ère vente',
                isAr ? 'تسليم بيزنس جاهز للعمل 100%' : 'Business 100% prêt à vendre',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 bg-amber-500/10 rounded-full" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/store-signup?plan=ZIRORISK" className="block w-full py-3.5 text-center rounded-2xl font-bold text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]">
              {isAr ? 'احجز متجرك الآن' : 'Réserver ma boutique'}
            </Link>
          </div>
          
          {/* PREMIUM Plan */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-xl relative flex flex-col h-full lg:mt-4">
            <div className="text-center sm:text-start mt-6">
              <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">PREMIUM</h3>
              <p className="text-slate-500 mb-6 font-medium text-xs">{isAr ? 'للشركات والعلامات الكبرى' : 'Pour les multi-marques'}</p>
            </div>
            
            <div className="mb-6 flex flex-col pb-6 border-b border-slate-100 items-center sm:items-start">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-slate-400 line-through decoration-2">799</span>
                <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'خصم' : 'PROMO'}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{premiumPrice}</span>
                <span className="text-slate-500 font-bold text-xs">MAD / {isAr ? 'شهر' : 'mois'}</span>
              </div>
            </div>
            
            <ul className="space-y-3.5 mb-8 flex-1 text-sm">
              {[
                isAr ? 'حتى 5 متاجر إلكترونية' : 'Jusqu\'à 5 Boutiques',
                isAr ? '0% عمولة على المبيعات' : '0% de frais de transaction',
                isAr ? 'أولوية في التصنيع والشحن' : 'Priorité de confection',
                isAr ? 'مدير حساب شخصي' : 'Account manager dédié',
                isAr ? 'إضافات متقدمة مجانية' : 'Extensions premium gratuites',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 bg-indigo-50 rounded-full" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/store-signup?plan=PREMIUM" className="block w-full py-3.5 text-center rounded-2xl font-bold text-sm bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all">
              {isAr ? 'تواصل معنا' : 'S\'abonner maintenant'}
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
