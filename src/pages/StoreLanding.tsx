import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MonitorSmartphone, Zap, ShieldCheck, Globe, LayoutTemplate, BarChart3, TrendingUp, Users, Box, Star, PlayCircle, Sparkles, Store } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';
import { PricingSection } from '../components/PricingSection';
import { loadCompanyProfile } from '../types';

export default function StoreLanding() {
  const { isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  const whatsappUrl = `https://wa.me/212675239885?text=${encodeURIComponent(
    isAr ? 'مرحباً BEYA CREATIVE، أريد الاستفسار عن خدمة تصميم وبناء متجر إلكتروني احترافي.' : 'Bonjour BEYA CREATIVE, je suis intéressé par la création d\'une boutique en ligne professionnelle.'
  )}`;
  
  return (
    <div className={`min-h-screen bg-white ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Navbar - Clean, Sticky, Apple-like */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">STORES</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">{isAr ? 'المميزات' : 'Fonctionnalités'}</button>
            <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">{isAr ? 'قصص النجاح' : 'Témoignages'}</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">{isAr ? 'الأسعار' : 'Tarifs'}</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggle}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase hidden sm:block"
            >
              {isAr ? 'FR' : 'AR'}
            </button>
            <Link to="/store-signup?mode=login" className="hidden sm:block px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors">
              {isAr ? 'دخول' : 'Connexion'}
            </Link>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
            >
              {isAr ? 'ابدأ مجاناً' : 'Démarrer'}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Massive Hero Section (Shopify/Stripe Vibe) */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'منصة التجارة الإلكترونية الأسرع نمواً في المغرب' : 'La plateforme e-commerce à la croissance la plus rapide au Maroc'}</span>
            </div>
            
            <h1 className={`font-black text-slate-900 tracking-tight mb-8 ${isAr ? 'text-4xl md:text-6xl lg:text-[68px] leading-[1.4]' : 'text-5xl md:text-7xl lg:text-[80px] leading-[1.05]'}`}>
              {isAr ? (
                <>ابنِ متجرك، <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">وضاعف مبيعاتك.</span></>
              ) : (
                <>Créez, vendez, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">développez-vous.</span></>
              )}
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              {isAr 
                ? 'كل ما تحتاجه لإطلاق وإدارة وتوسيع نطاق أعمالك في التجارة الإلكترونية. مع عرض "زيرو ريسك"، لا تدفع حتى تحقق أول مبيعة.'
                : 'Tout ce dont vous avez besoin pour lancer, gérer et développer votre entreprise e-commerce. Sans risque.'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg transition-all shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {isAr ? 'اختر خطتك وابدأ الآن' : 'Choisir mon plan'}
                <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-slate-300 transition-all hover:bg-slate-50 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5 text-slate-400" />
                {isAr ? 'تحدث مع خبير' : 'Parler à un expert'}
              </a>
            </div>
          </div>
          

        </div>
      </main>

      {/* 3. Trusted By (Logo Cloud Marquee) */}
      <section className="py-12 border-y border-slate-100 bg-slate-50 overflow-hidden relative">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          @keyframes marquee-rtl {
            0% { transform: translateX(0); }
            100% { transform: translateX(33.33%); }
          }
          .animate-marquee {
            animation: marquee 12s linear infinite;
            will-change: transform;
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
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
          
          <div className="animate-marquee flex items-center gap-24 md:gap-32 w-max px-12 group-hover:[animation-play-state:paused]">
            {[1, 2, 3].map((group) => (
              <React.Fragment key={group}>
                <span className="font-black text-3xl text-slate-800 blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-tighter uppercase">FASHLOW</span>
                <span className="font-extrabold text-2xl text-blue-600 italic blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-widest uppercase">MODAVION</span>
                <span className="font-black text-3xl text-indigo-600 tracking-tight blur-[0.5px] opacity-75 mix-blend-multiply select-none">BEYA<span className="font-light text-slate-500">CREATIVE</span></span>
                <span className="font-bold text-3xl text-rose-500 blur-[0.5px] opacity-75 mix-blend-multiply select-none uppercase tracking-widest">STYLEMA</span>
                <span className="font-black text-3xl text-emerald-500 blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-tighter">URBAN<span className="font-light text-slate-600">WEAR</span></span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Features Z-Pattern */}
      <section id="features" className="py-24 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {isAr ? 'صمم متجرك بطريقتك الخاصة.' : 'Créez votre boutique à votre image.'}
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                {isAr 
                  ? 'لا تحتاج لأي خبرة برمجية. اختر من بين عشرات القوالب الجاهزة المصممة خصيصاً لزيادة نسبة التحويل (Conversion Rate)، وعدلها بسهولة لتناسب علامتك التجارية.'
                  : 'Aucune compétence en codage requise. Choisissez parmi des dizaines de modèles conçus pour convertir et personnalisez-les facilement.'}
              </p>
              <ul className="space-y-3 pt-4">
                {['محرر مرئي (Drag & Drop)', 'قوالب سريعة الاستجابة للموبايل', 'دعم كامل للغة العربية (RTL)'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-800 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-blue-50 transform rotate-3 rounded-[3rem] -z-10" />
              <img src="/ad-bg-5.png" alt="Store Builder" className="rounded-3xl shadow-2xl border border-slate-100 hover:-translate-y-2 transition-transform duration-500" />
            </div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Box className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {isAr ? 'الدفع عند الاستلام (COD)، مثالي.' : 'Le paiement à la livraison, perfectionné.'}
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                {isAr 
                  ? 'منصتنا مصممة خصيصاً للسوق المغربي. ربط مباشر مع شركات الشحن و eGrow لإدارة طلبياتك بشكل آلي وتتبع الشحنات لحظة بلحظة.'
                  : 'Conçu pour le marché marocain. Intégration directe avec les sociétés de livraison pour automatiser vos commandes.'}
              </p>
              <ul className="space-y-3 pt-4">
                {['نماذج طلب سريعة بصفحة واحدة (One-page Checkout)', 'تتبع الشحنات الآلي', 'زيادة نسبة تأكيد الطلبات'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-800 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-emerald-50 transform -rotate-3 rounded-[3rem] -z-10" />
              <img src="/ad-bg-4.png" alt="COD and Shipping" className="rounded-3xl shadow-2xl border border-slate-100 hover:-translate-y-2 transition-transform duration-500" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {isAr ? 'زيرو ريسك. ابدأ بدون مخاطرة.' : 'Zéro Risque. Commencez sereinement.'}
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                {isAr 
                  ? 'لا مزيد من الاشتراكات الشهرية المرهقة في البداية. مع خطة Zirorisk، أنت تدفع تكلفة الإعداد فقط، والاشتراك الشهري لا يبدأ إلا بعد تحقيقك لأول مبيعة!'
                  : 'Fini les abonnements mensuels lourds. Avec Zirorisk, vous ne payez l\'abonnement qu\'après votre première vente !'}
              </p>
              <Link to="/store-signup?plan=ZIRORISK" className="inline-flex items-center gap-2 font-bold text-rose-600 hover:text-rose-700 text-lg">
                {isAr ? 'احجز متجرك بخطة زيرو ريسك الآن' : 'Réserver Zirorisk maintenant'}
                <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-rose-50 transform rotate-3 rounded-[3rem] -z-10" />
              <img src="/ad-bg-1.png" alt="Zero Risk Guarantee" className="rounded-3xl shadow-2xl border border-slate-100 hover:-translate-y-2 transition-transform duration-500" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              {isAr ? 'قصص نجاح مغربية' : 'Histoires de réussite'}
            </h2>
            <p className="text-slate-400 text-lg">
              {isAr ? 'اكتشف كيف ساعدت منصة BEYA رواد الأعمال في مضاعفة مبيعاتهم.' : 'Découvrez comment BEYA aide les entrepreneurs à exploser leurs ventes.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Youssef El Fassi',
                store: 'Atlas Wear',
                text: 'منذ انتقالي إلى منصة BEYA، ارتفعت نسبة التحويل لدي بـ 35%. الدعم الفني استثنائي وتصميم المتجر جعل علامتي تبدو احترافية جداً.',
              },
              {
                name: 'Sara Benali',
                store: 'BioCosmetics',
                text: 'خطة زيرو ريسك شجعتني على البدء. لم أدفع الاشتراك حتى حققت أرباحي الأولى. هذا هو الشريك الحقيقي للنجاح!',
              },
              {
                name: 'Amine Tazi',
                store: 'TechGadgets MA',
                text: 'الربط المباشر مع شركات الشحن سهّل علي إدارة آلاف الطلبيات شهرياً دون أي تدخل يدوي. أفضل استثمار قمت به.',
              }
            ].map((t, i) => (
              <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-slate-500 transition-colors">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-lg text-slate-300 leading-relaxed mb-8">"{isAr ? t.text : 'Traduction non disponible.'}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-full flex items-center justify-center font-black text-white text-xl">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{t.name}</h4>
                    <p className="text-slate-400 text-sm">{t.store}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pricing Section (Imported from component) */}
      <PricingSection />

      {/* 7. Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            {isAr ? 'مستعد لتبدأ قصة نجاحك؟' : 'Prêt à lancer votre boutique ?'}
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 font-medium">
            {isAr ? 'انضم إلى مئات التجار الذين يثقون في BEYA Store لتنمية أعمالهم.' : 'Rejoignez des centaines de marchands qui font confiance à BEYA Store.'}
          </p>
          <Link to="/store-signup" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all hover:scale-105 shadow-2xl">
            {isAr ? 'ابدأ الآن، وادفع لاحقاً' : 'Commencer maintenant'}
            <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
      
      {/* 8. Mega Footer */}
      <footer className="pt-24 pb-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6" dir="ltr">
                <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
                  <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">STORES</span>
                </div>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                {isAr ? 'المنصة المتكاملة لبناء وتوسيع نطاق المتاجر الإلكترونية في المغرب.' : 'La plateforme tout-en-un pour créer et développer des boutiques en ligne au Maroc.'}
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider">{isAr ? 'المنصة' : 'Plateforme'}</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-600 transition-colors text-left">{isAr ? 'المميزات' : 'Fonctionnalités'}</button></li>
                <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-600 transition-colors text-left">{isAr ? 'الأسعار' : 'Tarifs'}</button></li>
                <li><Link to="/setup" className="hover:text-blue-600 transition-colors text-left">{isAr ? 'قوالب المتاجر' : 'Thèmes'}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider">{isAr ? 'الشركة' : 'Entreprise'}</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><Link to="/about" className="hover:text-blue-600 transition-colors text-left">{isAr ? 'من نحن' : 'À propos'}</Link></li>
                <li><Link to="/partners" className="hover:text-blue-600 transition-colors">{isAr ? 'برنامج الشركاء' : 'Partenaires'}</Link></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-blue-600 transition-colors text-left">{isAr ? 'اتصل بنا' : 'Contact'}</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider">{isAr ? 'قانوني' : 'Légal'}</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">{isAr ? 'شروط الخدمة' : 'CGU'}</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">{isAr ? 'سياسة الخصوصية' : 'Confidentialité'}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold text-slate-400">
              © {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
            </p>
            <div className="flex gap-4 opacity-50">
              {/* Fake social icons for aesthetic */}
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="w-8 h-8 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
