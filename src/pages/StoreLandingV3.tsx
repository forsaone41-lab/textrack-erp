import React, { useState } from 'react';
import { ArrowRight, Zap, Target, TrendingUp, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function StoreLandingV3() {
  const { isAr, toggle } = useLang();
  
  return (
    <div className={`min-h-screen bg-white text-slate-900 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Banner - Urgency */}
      <div className="bg-rose-600 text-white text-center py-2 px-4 text-sm font-bold animate-pulse">
        {isAr ? '🔥 عرض محدود: ادفع بعد أول مبيعة لك! ابدأ مجاناً اليوم.' : '🔥 Offre limitée: Payez après votre première vente! Commencez gratuitement.'}
      </div>

      {/* Navbar - Minimal */}
      <nav className="w-full py-6 px-6 md:px-12 flex items-center justify-between border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md">
            <span className="font-black text-[24px]">B</span>
          </div>
          <span className="font-black text-[24px] uppercase tracking-tighter">BEYA</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="text-sm font-bold text-slate-500 hover:text-black">
            {isAr ? 'FR' : 'AR'}
          </button>
          <Link to="/store-signup" className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">
            {isAr ? 'ابدأ الآن' : 'Démarrer'}
          </Link>
        </div>
      </nav>

      {/* Hero Section - Direct & Punchy */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-sm mb-8">
          <Zap className="w-4 h-4" />
          {isAr ? 'المنصة رقم 1 للتجارة الإلكترونية' : 'Plateforme E-commerce N°1'}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          {isAr ? (
            <>أطلق متجرك في <span className="text-blue-600">5 دقائق</span><br/>وابدأ في جني الأرباح.</>
          ) : (
            <>Lancez votre boutique en <span className="text-blue-600">5 min</span><br/>et commencez à vendre.</>
          )}
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto">
          {isAr 
            ? 'منصة مصممة خصيصاً للـ Cash on Delivery. سرعة فائقة، بدون عمولة، وربط تلقائي مع شركات التوصيل.'
            : 'Conçu pour le Cash on Delivery. Ultra rapide, 0% commission, et liaisons automatiques.'}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/store-signup" className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30">
            {isAr ? 'أنشئ متجرك مجاناً' : 'Créer ma boutique'}
            <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
        </div>
        
        <p className="mt-6 text-sm font-bold text-slate-500">
          {isAr ? '✓ بدون بطاقة بنكية' : '✓ Sans carte bancaire'} • {isAr ? '✓ إعداد فوري' : '✓ Configuration instantanée'}
        </p>
      </section>

      {/* Dashboard Preview / Mockup */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-2xl relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-20 blur-2xl -z-10 rounded-full" />
          <img src="/ad-bg-2.png" alt="Dashboard" className="w-full h-auto rounded-2xl border border-slate-200" />
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="bg-slate-900 py-16 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-blue-400 mb-2">+1000</div>
            <div className="text-slate-400 font-medium">{isAr ? 'متجر نشط' : 'Boutiques Actives'}</div>
          </div>
          <div>
            <div className="text-4xl font-black text-emerald-400 mb-2">0%</div>
            <div className="text-slate-400 font-medium">{isAr ? 'عمولة على المبيعات' : 'Commission'}</div>
          </div>
          <div>
            <div className="text-4xl font-black text-amber-400 mb-2">0.5s</div>
            <div className="text-slate-400 font-medium">{isAr ? 'سرعة التحميل' : 'Temps de chargement'}</div>
          </div>
          <div>
            <div className="text-4xl font-black text-rose-400 mb-2">24/7</div>
            <div className="text-slate-400 font-medium">{isAr ? 'دعم فني' : 'Support Technique'}</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">{isAr ? 'كل ما تحتاجه للنجاح' : 'Tout ce qu\'il vous faut'}</h2>
            <p className="text-xl text-slate-500">{isAr ? 'أدوات مصممة لزيادة المبيعات وتقليل المجهود.' : 'Des outils conçus pour augmenter vos ventes.'}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: isAr ? 'تحويل عالي (Conversion)' : 'Haute Conversion', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: ShoppingBag, title: isAr ? 'إدارة الطلبات بسهولة' : 'Gestion des commandes', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Target, title: isAr ? 'متوافق مع فيسبوك وتيك توك' : 'Compatible FB/TikTok', color: 'text-rose-600', bg: 'bg-rose-50' }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow bg-slate-50">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {isAr 
                    ? 'نوفر لك واجهات مدروسة بعناية لجعل الزائر يشتري بسرعة وبدون تردد.'
                    : 'Nous offrons des interfaces optimisées pour faire acheter le visiteur rapidement.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-16">{isAr ? 'أثمنة واضحة ومناسبة' : 'Tarifs simples et abordables'}</h2>
          
          <div className="bg-white rounded-3xl border-2 border-blue-600 p-10 md:p-16 shadow-2xl relative max-w-2xl mx-auto">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-bold uppercase tracking-wide">
              {isAr ? 'الأكثر طلباً' : 'Le plus populaire'}
            </div>
            
            <h3 className="text-3xl font-black mb-4">Standard PRO</h3>
            <div className="flex items-center justify-center gap-2 mb-10">
              <span className="text-7xl font-black">199</span>
              <span className="text-xl font-bold text-slate-500 uppercase">MAD / {isAr ? 'شهر' : 'Mois'}</span>
            </div>
            
            <ul className="space-y-4 mb-10 text-left max-w-sm mx-auto">
              <li className="flex items-center gap-3 font-bold text-lg"><CheckCircle2 className="text-emerald-500" /> {isAr ? 'دومين مجاني (.com)' : 'Domaine offert (.com)'}</li>
              <li className="flex items-center gap-3 font-bold text-lg"><CheckCircle2 className="text-emerald-500" /> {isAr ? 'منتجات غير محدودة' : 'Produits illimités'}</li>
              <li className="flex items-center gap-3 font-bold text-lg"><CheckCircle2 className="text-emerald-500" /> {isAr ? 'ربط مباشر مع eGrow' : 'Liaison directe eGrow'}</li>
              <li className="flex items-center gap-3 font-bold text-lg"><CheckCircle2 className="text-emerald-500" /> {isAr ? 'دعم فني واتساب' : 'Support WhatsApp'}</li>
            </ul>
            
            <Link to="/store-signup" className="block w-full py-5 bg-blue-600 text-white rounded-xl font-black text-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
              {isAr ? 'اشترك الآن' : 'S\'abonner'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-200 text-center text-slate-500 font-medium">
        © {new Date().getFullYear()} BEYA Store. {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
      </footer>
    </div>
  );
}
