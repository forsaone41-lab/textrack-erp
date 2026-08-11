import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, MonitorSmartphone, Zap, ShieldCheck, LayoutTemplate, BarChart3, Users, Box, PlayCircle, ChevronRight, Check } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function StoreLandingV2() {
  const { isAr, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar morphing
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-black text-white ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        .glass-nav {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .text-gradient {
          background: linear-gradient(to right, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Navbar - Sticky & Glassmorphism */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-nav py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black shadow-md relative overflow-hidden">
              <span className="font-black text-[24px] tracking-tighter relative z-10">B</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-black text-[28px] tracking-tighter text-white uppercase leading-none">BEYA</span>
              <span className="font-medium text-[28px] tracking-tight text-slate-400 leading-none">Store</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10">
            <a href="#platform" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">{isAr ? 'المنصة' : 'Plateforme'}</a>
            <a href="#features" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">{isAr ? 'الحلول' : 'Solutions'}</a>
            <a href="#pricing" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">{isAr ? 'الأسعار' : 'Tarifs'}</a>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={toggle} className="text-xs font-bold bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors uppercase">
              {isAr ? 'FR' : 'AR'}
            </button>
            <Link to="/store-signup?mode=login" className="hidden sm:block text-sm font-bold text-white hover:text-blue-400 transition-colors">
              {isAr ? 'دخول' : 'Connexion'}
            </Link>
            <Link to="/store-signup" className="animate-pulse-glow px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-500 transition-all">
              {isAr ? 'ابدأ مجاناً' : 'Démarrer'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay to make text readable */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-10" />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover scale-105"
          >
            {/* High quality abstract tech/business video */}
            <source src="https://cdn.pixabay.com/vimeo/328940142/networking-23011.mp4?width=1920&hash=8b6540b7d7b003c20c02b2ea2500d41e73715c0e" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold text-xs md:text-sm mb-8 animate-float">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            {isAr ? 'الجيل الجديد من التجارة الإلكترونية بالمغرب' : 'La nouvelle génération du e-commerce au Maroc'}
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black leading-[1.05] tracking-tight mb-8">
            {isAr ? (
              <>عالمية، <span className="text-gradient">احترافية،</span><br/>بين يديك.</>
            ) : (
              <>Vendez <span className="text-gradient">partout,</span><br/>sans limites.</>
            )}
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            {isAr 
              ? 'أطلق متجرك الإلكتروني بمواصفات الشركات الكبرى. السرعة، الأمان، والتحكم الكامل في مكان واحد.'
              : 'Lancez votre boutique avec les standards des grandes entreprises. Rapidité, sécurité et contrôle total.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/store-signup" className="group relative w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-black text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 overflow-hidden">
              <div className="absolute inset-0 bg-blue-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">{isAr ? 'أنشئ متجرك الآن' : 'Créer ma boutique'}</span>
              <ArrowRight className={`relative z-10 w-6 h-6 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
            
            <a href="#demo" className="w-full sm:w-auto px-10 py-5 border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
              <PlayCircle className="w-6 h-6" />
              {isAr ? 'شاهد كيف تعمل' : 'Voir la démo'}
            </a>
          </div>
        </div>
      </section>

      {/* Sticky Scroll Section (Like Stripe/Shopify) */}
      <section id="platform" className="relative bg-black pt-32 pb-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Left side: Sticky text */}
            <div className="lg:w-1/2">
              <div className="sticky top-40 space-y-8">
                <h2 className="text-5xl md:text-7xl font-black leading-tight">
                  {isAr ? 'قوة برمجية، ' : 'Puissance, '}<br/>
                  <span className="text-slate-500">{isAr ? 'بساطة في الاستخدام.' : 'Simplicité.'}</span>
                </h2>
                <p className="text-2xl text-slate-400 leading-relaxed max-w-lg">
                  {isAr 
                    ? 'صممنا منصة BEYA لتكون الواجهة الأكثر احترافية لمشروعك. كل ما تحتاجه للبيع مدمج مسبقاً.'
                    : 'BEYA est conçue pour être la vitrine la plus professionnelle de votre projet. Tout est intégré.'}
                </p>
                <div className="pt-8">
                  <Link to="/store-signup" className="text-blue-500 font-bold text-xl flex items-center gap-2 hover:text-blue-400 transition-colors">
                    {isAr ? 'استكشف المميزات' : 'Explorer les fonctionnalités'}
                    <ChevronRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side: Scrolling cards */}
            <div className="lg:w-1/2 space-y-32 pt-20">
              
              {/* Card 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl transform transition-transform hover:scale-[1.02] duration-500">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8">
                  <LayoutTemplate className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">{isAr ? 'تصاميم عالمية' : 'Designs World-Class'}</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  {isAr ? 'واجهات متجرك مصممة لزيادة المبيعات (Conversion-optimized). مظهر احترافي يعكس جودة علامتك التجارية.' : 'Des thèmes optimisés pour la conversion. Une apparence professionnelle qui reflète votre marque.'}
                </p>
                <div className="rounded-xl overflow-hidden border border-slate-700">
                  <img src="/ad-bg-2.png" alt="Dashboard" className="w-full h-auto" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl transform transition-transform hover:scale-[1.02] duration-500">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-8">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">{isAr ? 'سرعة فائقة (0.5s)' : 'Vitesse fulgurante (0.5s)'}</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  {isAr ? 'سيرفرات سحابية موزعة عالمياً تضمن تحميل متجرك في أجزاء من الثانية لعدم فقدان أي زبون.' : 'Des serveurs cloud mondiaux garantissent un chargement en quelques millisecondes.'}
                </p>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-black p-6">
                  <div className="flex items-center gap-4 text-emerald-400 font-mono text-xl">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    Speed Index: 99/100
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl transform transition-transform hover:scale-[1.02] duration-500">
                <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-8">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">{isAr ? 'زيرو ريسك (Zero Risk)' : 'Zéro Risque'}</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  {isAr ? 'لأول مرة في المغرب، أطلق متجرك الاحترافي ولا تدفع الاشتراك حتى تبدأ مبيعاتك الحقيقية.' : 'Lancez votre boutique PRO et ne payez l\'abonnement qu\'après votre première vente.'}
                </p>
                <div className="rounded-xl overflow-hidden border border-slate-700">
                  <img src="/ad-bg-1.png" alt="Zero Risk" className="w-full h-auto" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Full-width Marquee (Trust) */}
      <section className="py-20 border-y border-white/10 overflow-hidden bg-black flex items-center">
        <div className="whitespace-nowrap animate-[scroll_20s_linear_infinite] flex items-center gap-16 opacity-40">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          {/* Repeat multiple times for seamless scrolling */}
          {[1,2,3,4,5,6,7,8].map((i) => (
            <span key={i} className="text-4xl font-black uppercase tracking-widest text-white mx-8 flex items-center gap-8">
              <span>{isAr ? 'بناء الثقة' : 'TRUSTED'}</span>
              <span className="w-3 h-3 rounded-full bg-white"></span>
              <span>{isAr ? 'حماية عالية' : 'SECURE'}</span>
              <span className="w-3 h-3 rounded-full bg-white"></span>
              <span>{isAr ? 'سرعة فائقة' : 'FAST'}</span>
              <span className="w-3 h-3 rounded-full bg-white"></span>
            </span>
          ))}
        </div>
      </section>

      {/* Clean Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6">{isAr ? 'استثمار ذكي' : 'Investissement intelligent'}</h2>
            <p className="text-2xl text-slate-400">{isAr ? 'أثمنة شفافة. لا توجد رسوم خفية. عمولة 0%.' : 'Tarifs transparents. Zéro frais cachés. 0% de commission.'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Standard PRO */}
            <div className="bg-black border border-slate-800 rounded-[2rem] p-10 hover:border-blue-500/50 transition-colors">
              <h3 className="text-2xl font-bold text-slate-400 mb-2 uppercase tracking-widest">Standard PRO</h3>
              <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-white/10">
                <span className="text-6xl font-black text-white">199</span>
                <span className="text-xl text-slate-500 font-bold uppercase">MAD / {isAr ? 'شهر' : 'mois'}</span>
              </div>
              <ul className="space-y-6 mb-12">
                {[
                  isAr ? 'متجر إلكتروني احترافي' : 'Boutique professionnelle',
                  isAr ? 'منتجات غير محدودة' : 'Produits illimités',
                  isAr ? 'ربط الدومين الخاص بك' : 'Domaine personnalisé',
                  isAr ? '0% عمولة مبيعات' : '0% commission',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-medium text-slate-300">
                    <Check className="w-6 h-6 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=PRO" className="block w-full py-5 text-center rounded-xl border-2 border-white/20 font-bold text-lg hover:bg-white hover:text-black transition-all">
                {isAr ? 'ابدأ الآن' : 'Démarrer'}
              </Link>
            </div>

            {/* ZIRORISK */}
            <div className="bg-gradient-to-b from-blue-900/40 to-black border border-blue-500 rounded-[2rem] p-10 relative transform md:-translate-y-4 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-t-[2rem]" />
              <div className="absolute -top-4 right-8 bg-blue-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full">
                {isAr ? 'موصى به' : 'Recommandé'}
              </div>
              
              <h3 className="text-2xl font-bold text-blue-400 mb-2 uppercase tracking-widest">Zirorisk</h3>
              <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-white/10">
                <span className="text-6xl font-black text-white">699</span>
                <span className="text-xl text-slate-500 font-bold uppercase">MAD / {isAr ? 'مرة واحدة' : 'Une fois'}</span>
              </div>
              <ul className="space-y-6 mb-12">
                {[
                  isAr ? 'تصميم المتجر بالكامل' : 'Création complète de boutique',
                  isAr ? 'لا تدفع الاشتراك (199) حتى تبيع' : 'Payez l\'abonnement après 1ère vente',
                  isAr ? 'دومين احترافي (.com)' : 'Domaine PRO (.com)',
                  isAr ? 'ربط آلي مع eGrow' : 'Liaison auto eGrow',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-medium text-white">
                    <Check className="w-6 h-6 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=ZIRORISK" className="block w-full py-5 text-center rounded-xl bg-blue-600 font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 animate-float">
                {isAr ? 'احجز متجرك الآن' : 'Réserver maintenant'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black pt-20 pb-10 border-t border-white/10 text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 opacity-50 hover:opacity-100 transition-opacity" dir="ltr">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-black">
            <span className="font-black text-[20px] tracking-tighter">B</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-black text-[24px] tracking-tighter text-white uppercase leading-none">BEYA</span>
            <span className="font-medium text-[24px] tracking-tight text-slate-400 leading-none">Store</span>
          </div>
        </Link>
        <p className="text-slate-600 font-medium">
          © {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
        </p>
      </footer>
    </div>
  );
}
