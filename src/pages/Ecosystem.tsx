import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { ChevronRight, Store, Settings, Scissors, Globe, Layers, ShieldCheck, ArrowRight, MousePointerClick } from 'lucide-react';

export default function Ecosystem() {
  const { isAr, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-slate-50 font-sans selection:bg-[#0071e3] selection:text-white ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3] flex items-center justify-center text-white">
              <span className="font-bold text-lg">B</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">Beya Creative</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/ecosystem" className="text-sm font-bold text-[#0071e3]">
              {isAr ? 'المنظومة' : 'Écosystème'}
            </Link>
            <a href="/#order-steps" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {isAr ? 'كيف نعمل' : 'Comment ça marche'}
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

      {/* Hero Header */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden min-h-[70vh] flex items-center justify-center rounded-b-[3rem] shadow-2xl mb-12">
        {/* Single Image Background with Blue Overlay/Flow */}
        <div className="absolute inset-0 z-0">
          <img src="/factory_bg.jpg" alt="Beya Production" className="absolute inset-0 w-full h-full object-cover" />
          {/* Blue Flow/Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/90 via-[#0077ED]/70 to-slate-900/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#0071e3]/10 backdrop-blur-[1px]" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-8 drop-shadow-lg">
            {isAr ? 'منظومة متكاملة لنجاحك.' : 'Un écosystème pour votre succès.'}
          </h1>
          <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed mb-10 drop-shadow-md font-medium">
            {isAr
              ? 'في Beya Creative، لا نكتفي بتقديم خدمة واحدة، بل نقدم لك منظومة شاملة تدمج بين الإنتاج الصناعي عالي الجودة والتكنولوجيا الرقمية المتقدمة لضمان توسع أعمالك بكل احترافية وسهولة.'
              : 'Chez Beya Creative, nous ne nous contentons pas d\'un seul service. Nous offrons un écosystème complet alliant production industrielle et technologie numérique.'}
          </p>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-24 px-6 bg-[#FBFBFD]">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Module 1: Beya Production */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                <Scissors className="w-8 h-8 text-[#1d1d1f]" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-[#1d1d1f]">Beya Production</h2>
              <p className="text-xl text-[#86868b] leading-relaxed">
                {isAr
                  ? 'ورشة صناعية متكاملة ومجهزة بأحدث التقنيات. نحن نتولى عملية الإنتاج من الألف إلى الياء: تصميم الباترون، اختيار الأقمشة، القص الدقيق، والخياطة الاحترافية. نضمن لك منتجاً نهائياً بمعايير عالمية يليق بعلامتك التجارية.'
                  : 'Atelier industriel équipé des dernières technologies. Nous prenons en charge la production de A à Z : design, choix des tissus, coupe précise et couture professionnelle. Un produit final aux standards internationaux.'}
              </p>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white p-4">
                <img src="/atelier_background.png" alt="Production" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Module 2: Beya Portal */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                <Settings className="w-8 h-8 text-[#0071e3]" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-[#1d1d1f]">Beya Portal</h2>
              <p className="text-xl text-[#86868b] leading-relaxed">
                {isAr
                  ? 'لوحة تحكم ذكية وخاصة بك كعميل لدينا. من خلال البوابة، يمكنك تتبع حالة طلباتك في الورشة لحظة بلحظة، الموافقة على التصاميم، وإدارة فواتيرك بكل شفافية. التكنولوجيا نضعها في خدمتك لتبقى على اطلاع دائم.'
                  : 'Votre tableau de bord intelligent. Suivez l\'état de vos commandes en temps réel, validez les designs et gérez vos factures en toute transparence. La technologie à votre service.'}
              </p>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 p-6 flex flex-col justify-end">
                <div className="w-full h-3/4 bg-slate-800 rounded-t-xl border border-slate-700 p-4 shadow-2xl relative">
                  <div className="w-full h-8 border-b border-slate-700 flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
                    <div className="h-4 w-full bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module 3: Beya Store */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                <Store className="w-8 h-8 text-[#1d1d1f]" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-[#1d1d1f]">Beya Store</h2>
              <p className="text-xl text-[#86868b] leading-relaxed">
                {isAr
                  ? 'منصة التجارة الإلكترونية الأقوى. بعد إنتاج منتجاتك، نمنحك القدرة على بناء متجر احترافي سريع وسهل الاستخدام لإطلاق مبيعاتك فوراً. تكامل تام بين أرض الواقع والعالم الرقمي.'
                  : 'La plateforme E-commerce ultime. Après la production de vos produits, construisez une boutique professionnelle rapide et intuitive pour lancer vos ventes immédiatement. Une intégration parfaite.'}
              </p>
              {/* NOTE: No prices mentioned as requested */}
              <Link to="/store-landing" className="inline-flex items-center text-[#0071e3] font-medium hover:underline text-lg">
                {isAr ? 'اكتشف المزيد عن المتاجر' : 'Découvrir nos boutiques'} <ChevronRight className={`w-5 h-5 ml-1 ${isAr ? 'rotate-180 mr-1 ml-0' : ''}`} />
              </Link>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white p-4 flex items-center justify-center">
                <Globe className="w-32 h-32 text-slate-200" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white border-t border-slate-200 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-[#1d1d1f] mb-6">
          {isAr ? 'مستعد لتحويل فكرتك إلى واقع؟' : 'Prêt à transformer votre idée en réalité ?'}
        </h2>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          {isAr ? 'المنظومة بانتظارك لتبدأ قصة نجاح جديدة.' : 'L\'écosystème vous attend pour démarrer votre nouvelle success story.'}
        </p>
        <Link to="/commencer" className="inline-flex items-center justify-center px-10 py-4 bg-[#0071e3] text-white rounded-full font-bold text-xl hover:bg-[#0077ED] transition-all shadow-xl hover:-translate-y-1">
          {isAr ? 'ابدأ الآن' : 'Commencer maintenant'}
        </Link>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Beya Creative. {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}.</p>
      </footer>
    </div>
  );
}
