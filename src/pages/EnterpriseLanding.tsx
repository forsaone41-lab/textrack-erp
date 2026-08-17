import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { ArrowRight, Building2, ShoppingCart, Code2, TrendingUp, Shield, Globe, Zap, CheckCircle2 } from 'lucide-react';

const styles = `
  .glass-dark {
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .text-gradient-gold {
    background: linear-gradient(to right, #fbbf24, #d97706);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .bg-grid {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }
`;

export default function EnterpriseLanding() {
  const { isAr, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans overflow-x-hidden selection:bg-amber-500/30 bg-grid" dir={isAr ? 'rtl' : 'ltr'}>
      <style>{styles}</style>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-2xl py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Building2 className="w-5 h-5 text-black" />
             </div>
             <span className="text-xl font-black tracking-tight">Beya<span className="font-light text-amber-500">Enterprise</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center text-sm font-bold transition-colors text-slate-300">
              {isAr ? 'FR' : 'ع'}
            </button>
            <Link to="/login" className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/5">
              {isAr ? 'دخول الشركاء' : 'Espace Partenaire'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-sm font-bold mb-8 animate-in slide-in-from-bottom-4 duration-700 uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            {isAr ? 'الشريك التقني الأقوى في المغرب' : 'Le Partenaire Technologique N°1'}
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[90px] font-black tracking-tighter leading-[1.1] mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
            {isAr ? 'ارتقِ بمشروعك لمستوى' : 'ÉLEVEZ VOTRE PROJET AU NIVEAU'} <br/>
            <span className="text-gradient-gold">
              {isAr ? 'الشركات الكبرى' : 'ENTREPRISE'}
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-200 max-w-3xl mx-auto leading-relaxed font-light">
            {isAr 
              ? 'حنا ماشي غير وكالة رقمية... حنا "المهندس المعماري" للنجاح ديالك. كنبنيو ليك أنظمة متكاملة، ذكية، وعالية الأداء، باش أنت تركز على حاجة وحدة: التوسع والأرباح.'
              : 'Nous ne sommes pas juste une agence digitale... Nous sommes les "architectes" de votre succès. Nous construisons des systèmes complets, intelligents et performants.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <a href="https://wa.me/212624465962" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-black text-lg transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 group">
              {isAr ? 'تحدث مع خبير' : 'Parler à un expert'}
              <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </a>
          </div>
        </div>
      </section>

      {/* The Pillars */}
      <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Pillar 1: Enterprise */}
            <div className="glass-dark p-10 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 group">
               <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black mb-4 tracking-tight">{isAr ? 'أنظمة الشركات الكبرى (ERP/CRM)' : 'Systèmes Enterprise (ERP/CRM)'}</h3>
               <p className="text-slate-400 leading-relaxed mb-6">
                 {isAr 
                   ? 'للمؤسسات التعليمية، المصحات، ووكالات العقار وتأجير السيارات. كنطورو ليك أنظمة تسيير متكاملة كتأتمت خدمتك اليومية 100%.'
                   : 'Pour les écoles, cliniques, et agences immobilières/locations. Nous développons des systèmes de gestion complets pour automatiser vos opérations.'}
               </p>
               <ul className="space-y-3 text-sm text-slate-300 font-medium">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> {isAr ? 'إدارة الموارد والعملاء' : 'Gestion des ressources & clients'}</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> {isAr ? 'أتمتة العمليات اليومية' : 'Automatisation des opérations'}</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> {isAr ? 'لوحة تحكم استراتيجية' : 'Tableau de bord stratégique'}</li>
               </ul>
            </div>

            {/* Pillar 2: E-Commerce */}
            <div className="glass-dark p-10 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group">
               <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black mb-4 tracking-tight">{isAr ? 'التجارة الإلكترونية (COD Optimized)' : 'E-Commerce (Optimisé COD)'}</h3>
               <p className="text-slate-400 leading-relaxed mb-6">
                 {isAr 
                   ? 'نسى التعقيدات. كنعطيوك منظومة بحال Shopify/YouCan ولكن مفصلة للسوق المغربي والدفع عند الاستلام. بنية تحتية قوية كتستوعب آلاف الزوار.'
                   : 'Oubliez la complexité. Un écosystème E-commerce robuste, optimisé pour le marché marocain (Paiement à la livraison) et hautement évolutif.'}
               </p>
               <ul className="space-y-3 text-sm text-slate-300 font-medium">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> {isAr ? 'تصميم مخصص لرفع المبيعات' : 'Design optimisé pour conversion'}</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> {isAr ? 'تحمل ضغط الزوار (Scalability)' : 'Scalabilité & Haute performance'}</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> {isAr ? 'أدوات الـ Upsell والتحليلات' : 'Outils Upsell & Analytiques'}</li>
               </ul>
            </div>

            {/* Pillar 3: Custom Dev */}
            <div className="glass-dark p-10 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500 group">
               <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Code2 className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black mb-4 tracking-tight">{isAr ? 'تطبيقات مخصصة (Web Apps)' : 'Développement Sur-Mesure'}</h3>
               <p className="text-slate-400 leading-relaxed mb-6">
                 {isAr 
                   ? 'لأصحاب المشاريع الفريدة والـ SaaS. كنبنيو ليك تطبيقات ويب بأحدث التكنولوجيات (Next.js & Supabase) مع لوحة تحكم خارقة للسرعة.'
                   : 'Pour les projets uniques et SaaS. Nous construisons vos applications web avec les dernières technologies (Next.js & Supabase).'}
               </p>
               <ul className="space-y-3 text-sm text-slate-300 font-medium">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> {isAr ? 'بنية تحتية متطورة وسريعة' : 'Infrastructure moderne & ultra-rapide'}</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> {isAr ? 'لوحات تحكم (Admin Panels) متقدمة' : 'Admin Panels avancés'}</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> {isAr ? 'أمان عالي للبيانات' : 'Haute sécurité des données'}</li>
               </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Core Promise Section */}
      <section className="py-32 px-6 relative border-y border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
           <div>
             <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
               {isAr ? 'الهدف ديالنا ماشي نصاوبو ليك موقع...' : 'Notre objectif n\'est pas de vous créer un site...'} <br/>
               <span className="text-gradient-gold">{isAr ? 'الهدف هو نضاعفو أرباحك.' : 'C\'est de multiplier vos profits.'}</span>
             </h2>
             <p className="text-lg text-slate-400 mb-8 leading-relaxed font-light">
               {isAr 
                 ? 'أنت كبر مشروعك... وحنا كنتكلفو بالباقي. الأنظمة اللي كنبنيو مصممة باش تعطيك الحرية وتخليك تركز على الجانب الاستراتيجي.'
                 : 'Vous développez votre business... Nous nous occupons du reste. Nos systèmes sont conçus pour vous donner la liberté de vous concentrer sur la stratégie.'}
             </p>
             <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-amber-500" />
                   </div>
                   <div>
                     <h4 className="font-bold mb-1">{isAr ? 'أتمتة (Automate)' : 'Automatiser'}</h4>
                     <p className="text-sm text-slate-500">{isAr ? 'خلي السيستيم يدير الخدمة المعاودة، وفر وقتك.' : 'Laissez le système gérer les tâches répétitives.'}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                   </div>
                   <div>
                     <h4 className="font-bold mb-1">{isAr ? 'توسع (Scale)' : 'Scaler'}</h4>
                     <p className="text-sm text-slate-500">{isAr ? 'بنية تحتية صلبة كتكبر مع مشروعك.' : 'Infrastructure solide qui grandit avec vous.'}</p>
                   </div>
                </div>
             </div>
           </div>
           
           <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-3xl blur-2xl" />
              <div className="relative glass-dark p-8 rounded-3xl border border-white/10">
                 <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                    <div>
                       <div className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">{isAr ? 'أرباح الشهر' : 'Revenus Mensuels'}</div>
                       <div className="text-4xl font-black text-white">+845,200 <span className="text-xl text-slate-500">DH</span></div>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold flex items-center gap-1">
                       <TrendingUp className="w-4 h-4" /> +24%
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 w-[85%]" />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                       <span>{isAr ? 'الهدف السنوي' : 'Objectif Annuel'}</span>
                       <span className="text-slate-300">85%</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-600">
        <p>© {new Date().getFullYear()} Beya Enterprise. {isAr ? 'دقة التقنية، قوة الأداء.' : 'Précision technologique, Puissance de performance.'}</p>
      </footer>
    </div>
  );
}
