import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MonitorSmartphone, Zap, ShieldCheck, Globe, LayoutTemplate, BarChart3, TrendingUp, Users, Box, Star, PlayCircle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';
import { loadCompanyProfile } from '../types';

export default function StoreLanding() {
  const { isAr, toggle } = useLang();
  const [isYearly, setIsYearly] = useState(false);
  const company = loadCompanyProfile();
  const proPrice = '199';
  const premiumPrice = company.storePremiumPrice || '499';
  
  const whatsappUrl = `https://wa.me/${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    isAr ? 'مرحباً BEYA CREATIVE، أريد الاستفسار عن خدمة تصميم وبناء متجر إلكتروني احترافي.' : 'Bonjour BEYA CREATIVE, je suis intéressé par la création d\'une boutique en ligne professionnelle.'
  )}`;
  
  return (
    <div className={`min-h-screen bg-white ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Navbar - Clean, Sticky, Apple-like */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" dir="ltr">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-xl flex items-center justify-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
              <span className="text-white font-black text-xl rotate-12 group-hover:rotate-0 transition-transform duration-300">B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-2xl tracking-tight text-slate-900">BEYA</span>
              <span className="font-bold text-2xl tracking-tight text-blue-600">Store</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900">{isAr ? 'المميزات' : 'Fonctionnalités'}</a>
            <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-slate-900">{isAr ? 'قصص النجاح' : 'Témoignages'}</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900">{isAr ? 'الأسعار' : 'Tarifs'}</a>
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
            
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-slate-900 leading-[1.05] tracking-tight mb-8">
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
              <Link to="/store-signup" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg transition-all shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2">
                {isAr ? 'ابدأ تجربتك المجانية' : 'Commencer l\'essai gratuit'}
                <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-slate-300 transition-all hover:bg-slate-50 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5 text-slate-400" />
                {isAr ? 'تحدث مع خبير' : 'Parler à un expert'}
              </a>
            </div>
          </div>
          
          {/* Dashboard Preview Image */}
          <div className="mt-20 relative max-w-5xl mx-auto perspective-[2000px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
            <img 
              src="/ad-bg-2.png" 
              alt="BEYA Store Dashboard" 
              className="rounded-t-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-t border-l border-r border-slate-200/50 w-full h-auto transform rotate-x-[5deg] scale-105"
            />
          </div>
        </div>
      </main>

      {/* 3. Trusted By (Logo Cloud) */}
      <section className="py-12 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
            {isAr ? 'موثوق به من طرف أكثر من 500 علامة تجارية' : 'Fait confiance par plus de 500 marques'}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="font-black text-2xl text-slate-800">COSMETICA.</span>
            <span className="font-extrabold text-xl text-slate-800 italic">STYLE<span className="text-blue-600">MA</span></span>
            <span className="font-black text-2xl text-slate-800 tracking-tighter">URBAN<span className="font-light">WEAR</span></span>
            <span className="font-bold text-2xl text-slate-800 font-serif">L'Artisan</span>
            <span className="font-black text-2xl text-slate-800">TECH<span className="text-emerald-500">ZONE</span></span>
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

      {/* 6. Pricing Section (Imported & Restyled from previous) */}
      <section className="py-32 bg-slate-50 relative" id="pricing">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              {isAr ? 'خطط أسعار واضحة' : 'Des tarifs transparents'}
            </h2>
            <p className="text-xl text-slate-600">
              {isAr 
                ? 'اختر الخطة التي تناسبك وابدأ البيع اليوم. بدون رسوم خفية.'
                : 'Choisissez le plan qui vous convient et commencez à vendre aujourd\'hui. Sans frais cachés.'}
            </p>
          </div>
          
          {/* Yearly Toggle */}
          <div className="flex justify-center items-center gap-4 mb-16">
            <span className={`text-base font-bold ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>{isAr ? 'دفع شهري' : 'Mensuel'}</span>
            <button 
              onClick={() => setIsYearly(!isYearly)} 
              className="w-20 h-10 bg-slate-200 rounded-full p-1 relative transition-colors focus:outline-none hover:bg-slate-300"
            >
              <div className={`w-8 h-8 bg-slate-900 rounded-full shadow-lg transition-transform duration-300 ${isYearly ? (isAr ? '-translate-x-10' : 'translate-x-10') : 'translate-x-0'}`} />
            </button>
            <span className={`text-base font-bold flex items-center gap-2 ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              {isAr ? 'دفع سنوي' : 'Annuel'}
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm">{isAr ? '-20% توفير' : '-20%'}</span>
            </span>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
            
            {/* PRO Plan */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-xl relative flex flex-col h-full">
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">PRO</h3>
              <p className="text-slate-500 mb-8 font-medium">{isAr ? 'للمبتدئين في التجارة الإلكترونية' : 'Création autonome'}</p>
              
              <div className="mb-8 flex flex-col pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-slate-400 line-through decoration-2">{isYearly ? '2,990' : '299'}</span>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'خصم' : 'PROMO'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter">{isYearly ? (Number(proPrice) * 10).toLocaleString() : proPrice}</span>
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">MAD/{isYearly ? (isAr ? 'سنة' : 'an') : (isAr ? 'شهر' : 'mois')}</span>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-1">
                {[
                  isAr ? 'متجر إلكتروني واحد' : '1 Boutique en ligne',
                  isAr ? 'منتجات غير محدودة و0% عمولة' : 'Produits illimités & 0% commision',
                  isAr ? 'استضافة مجانية وسريعة' : 'Hébergement rapide et gratuit',
                  isAr ? 'تطبيقات لزيادة المبيعات' : 'Apps de conversion (Upsell)',
                  isAr ? 'دعم فني قياسي' : 'Support standard',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-700 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-slate-300 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=PRO" className="block w-full py-5 text-center rounded-2xl font-black text-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all">
                {isAr ? 'ابدأ الآن' : 'Créer ma boutique'}
              </Link>
            </div>

            {/* ZIRORISK Plan (Highlighted) */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 border border-slate-800 shadow-[0_30px_60px_rgba(15,23,42,0.3)] relative flex flex-col h-[105%] z-10 transform lg:-translate-y-4">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-400" />
              <div className={`absolute top-8 ${isAr ? 'left-8' : 'right-8'}`}>
                <span className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  {isAr ? 'الأكثر مبيعاً' : 'Le plus populaire'}
                </span>
              </div>
              
              <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Zirorisk</h3>
              <p className="text-slate-400 mb-8 font-medium">{isAr ? 'حنا نصاوبو المتجر، نتا بيع' : 'Clé en main (Recommandé)'}</p>
              
              <div className="mb-8 flex flex-col pb-8 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-slate-500 line-through decoration-2">{isYearly ? '8,388' : '1,499'}</span>
                  <span className="text-[10px] font-black text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'عرض' : 'PROMO'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter">{isYearly ? '6,990' : '699'}</span>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">MAD/{isYearly ? (isAr ? 'سنة' : 'an') : (isAr ? 'مرة واحدة' : 'Une fois')}</span>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-1">
                {[
                  isAr ? 'تصميم المتجر + دومين احترافي (.com)' : 'Création + Domaine PRO',
                  isAr ? `الاشتراك (${isYearly ? '1,990' : '199'}) يبدأ بعد أول مبيعة` : `Abonnement (${isYearly ? '1,990' : '199'}) après la 1ère vente`,
                  isAr ? 'ربط مباشر مع منصة eGrow' : 'Liaison directe eGrow',
                  isAr ? 'منتجات غير محدودة و0% عمولة' : 'Produits illimités & 0% commision',
                  isAr ? 'دعم فني استثنائي (VIP)' : 'Support VIP',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-200 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=ZIRORISK" className="block w-full py-5 text-center rounded-2xl font-black text-lg bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-xl">
                {isAr ? 'احجز متجرك الآن' : 'Réserver ma boutique'}
              </Link>
            </div>
            
            {/* PREMIUM Plan */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-xl relative flex flex-col h-full">
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">PREMIUM</h3>
              <p className="text-slate-500 mb-8 font-medium">{isAr ? 'للشركات والعلامات الكبرى' : 'Pour les multi-marques'}</p>
              
              <div className="mb-8 flex flex-col pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-slate-400 line-through decoration-2">{isYearly ? '7,990' : '799'}</span>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'خصم' : 'PROMO'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter">{isYearly ? (Number(premiumPrice) * 10).toLocaleString() : premiumPrice}</span>
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">MAD/{isYearly ? (isAr ? 'سنة' : 'an') : (isAr ? 'شهر' : 'mois')}</span>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-1">
                {[
                  isAr ? 'حتى 5 متاجر إلكترونية' : 'Jusqu\'à 5 Boutiques',
                  isAr ? '0% عمولة على المبيعات' : '0% de frais de transaction',
                  isAr ? 'أولوية في التصنيع والشحن' : 'Priorité de confection',
                  isAr ? 'مدير حساب شخصي' : 'Account manager dédié',
                  isAr ? 'إضافات متقدمة مجانية' : 'Extensions premium gratuites',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-700 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=PREMIUM" className="block w-full py-5 text-center rounded-2xl font-black text-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all">
                {isAr ? 'تواصل معنا' : 'S\'abonner maintenant'}
              </Link>
            </div>

          </div>
        </div>
      </section>

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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-xl flex items-center justify-center transform -rotate-12">
                  <span className="text-white font-black text-xl rotate-12">B</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-2xl tracking-tight text-slate-900">BEYA</span>
                  <span className="font-bold text-2xl tracking-tight text-blue-600">Store</span>
                </div>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                {isAr ? 'المنصة المتكاملة لبناء وتوسيع نطاق المتاجر الإلكترونية في المغرب.' : 'La plateforme tout-en-un pour créer et développer des boutiques en ligne au Maroc.'}
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider">{isAr ? 'المنصة' : 'Plateforme'}</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">{isAr ? 'المميزات' : 'Fonctionnalités'}</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">{isAr ? 'الأسعار' : 'Tarifs'}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">{isAr ? 'قوالب المتاجر' : 'Thèmes'}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider">{isAr ? 'الشركة' : 'Entreprise'}</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">{isAr ? 'من نحن' : 'À propos'}</a></li>
                <li><Link to="/partners" className="hover:text-blue-600 transition-colors">{isAr ? 'برنامج الشركاء' : 'Partenaires'}</Link></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">{isAr ? 'اتصل بنا' : 'Contact'}</a></li>
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
