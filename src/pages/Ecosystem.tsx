import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { ChevronRight, Store, Settings, Scissors, Globe, Layers, ShieldCheck, ArrowRight, MousePointerClick, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';
import ProjectRequestModal from '../components/ProjectRequestModal';

export default function Ecosystem() {
  const { isAr, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${!scrolled ? 'bg-white shadow-sm p-1' : 'bg-transparent'}`}>
              <img src="/logo-blue.png" alt="Beya Creative" className="w-full h-full object-contain" />
            </div>
            <span className={`font-semibold text-lg sm:text-xl tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>Beya Creative</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/ecosystem" className={`text-sm font-bold transition-colors ${scrolled ? 'text-[#0071e3]' : 'text-blue-100'}`}>
              {isAr ? 'المنظومة' : 'Écosystème'}
            </Link>
            <a href="/#order-steps" className={`text-sm font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-blue-100 hover:text-white'}`}>
              {isAr ? 'كيف نعمل' : 'Comment ça marche'}
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={toggle} className={`text-xs font-semibold uppercase tracking-widest transition-colors ${scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-blue-100 hover:text-white'}`}>
              {isAr ? 'FR' : 'العربية'}
            </button>
            <Link to="/login" className={`text-xs sm:text-sm font-medium transition-colors ${scrolled ? 'text-slate-800 hover:text-black' : 'text-white hover:text-blue-100'}`}>
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
            <button onClick={() => setIsModalOpen(true)} className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all cursor-pointer ${scrolled ? 'bg-[#1d1d1f] text-white hover:bg-black' : 'bg-white text-[#0071e3] hover:bg-blue-50 shadow-md'}`}>
              {isAr ? 'ابدأ الآن' : 'Commencer'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden min-h-[70vh] flex items-center justify-center rounded-b-[3rem] shadow-2xl mb-12 bg-[#0071e3]">
        {/* Pure CSS Vector Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0071e3] via-[#005bb5] to-[#003b75]"></div>
          
          {/* Vector Glowing Shapes */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-pulse"></div>
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
          <div className="absolute -bottom-40 right-1/4 w-[30rem] h-[30rem] bg-blue-400 rounded-full mix-blend-screen filter blur-[120px] opacity-50"></div>
          
          {/* Decorative Lines/Grid effect */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
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
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-50 p-8 flex flex-col items-center justify-center relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full opacity-50"></div>
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-100 rounded-tr-full opacity-50"></div>
                 
                 <div className="relative z-10 grid grid-cols-2 gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:-translate-y-2">
                       <Scissors className="w-10 h-10 md:w-14 md:h-14 text-slate-700" />
                    </div>
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center translate-y-8 transition-transform hover:translate-y-6">
                       <Layers className="w-10 h-10 md:w-14 md:h-14 text-[#0071e3]" />
                    </div>
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center -translate-y-4 transition-transform hover:-translate-y-6">
                       <Settings className="w-10 h-10 md:w-14 md:h-14 text-slate-700" />
                    </div>
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center translate-y-4 transition-transform hover:translate-y-2">
                       <ShieldCheck className="w-10 h-10 md:w-14 md:h-14 text-purple-600" />
                    </div>
                 </div>
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
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white p-2">
                <img src="/ecommerce_website_vector.png" alt="Beya Store Realistic Example" className="w-full h-full object-cover rounded-2xl" />
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
        <div className="flex justify-center mt-10">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-10 py-5 bg-[#0071e3] text-white rounded-full font-bold text-xl hover:bg-[#0077ED] transition-all shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            {isAr ? 'ابدأ مشروعك الآن' : 'Démarrer maintenant'}
          </button>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-slate-500 text-sm font-medium hover:text-[#0071e3] transition-colors">
              {isAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}
            </Link>
            <Link to="/cookies" className="text-slate-500 text-sm font-medium hover:text-[#0071e3] transition-colors">
              {isAr ? 'ملفات تعريف الارتباط' : 'Cookies'}
            </Link>
            <Link to="/funnel" className="text-slate-500 text-sm font-medium hover:text-[#0071e3] transition-colors">
              Beya Funnel
            </Link>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Beya Creative. {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}.</p>
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
