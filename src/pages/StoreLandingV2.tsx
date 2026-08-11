import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, MonitorSmartphone, Zap, ShieldCheck, LayoutTemplate, BarChart3, Users, Box, PlayCircle, ChevronRight, Check, Sun, Moon } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function StoreLandingV2() {
  const { isAr, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Handle scroll for navbar morphing
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBg = scrolled 
    ? (isDark ? 'glass-nav-dark py-4' : 'glass-nav-light py-4 shadow-sm') 
    : 'bg-transparent py-6';
    
  const navText = scrolled && !isDark ? 'text-slate-900' : 'text-white';
  const navLinks = scrolled && !isDark ? 'text-slate-600 hover:text-black' : 'text-slate-300 hover:text-white';
  const logoBg = scrolled && !isDark ? 'bg-black text-white' : 'bg-white text-black';
  const btnBg = scrolled && !isDark ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'} ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
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
        .glass-nav-dark {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .glass-nav-light {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .text-gradient {
          background: linear-gradient(to right, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Navbar - Sticky & Glassmorphism */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${navBg}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className={`font-black text-[22px] leading-none tracking-tight transition-colors ${navText}`}>BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">STORES</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10">
            <a href="#platform" className={`text-sm font-bold transition-colors ${navLinks}`}>{isAr ? 'المنصة' : 'Plateforme'}</a>
            <a href="#features" className={`text-sm font-bold transition-colors ${navLinks}`}>{isAr ? 'الحلول' : 'Solutions'}</a>
            <a href="#pricing" className={`text-sm font-bold transition-colors ${navLinks}`}>{isAr ? 'الأسعار' : 'Tarifs'}</a>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => setIsDark(!isDark)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${btnBg}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggle} className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors uppercase ${btnBg}`}>
              {isAr ? 'FR' : 'AR'}
            </button>
            <Link to="/store-signup?mode=login" className={`hidden sm:block text-sm font-bold transition-colors hover:text-blue-500 ${navText}`}>
              {isAr ? 'دخول' : 'Connexion'}
            </Link>
            <Link to="/store-signup" className="animate-pulse-glow px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-500 transition-all">
              {isAr ? 'ابدأ مجاناً' : 'Démarrer'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background - ALWAYS DARK THEME FOR CONTRAST */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 w-full h-full z-0 bg-black">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className={`absolute bottom-0 left-0 right-0 h-64 z-10 bg-gradient-to-t ${isDark ? 'from-black' : 'from-slate-50'} to-transparent transition-colors duration-500`} />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover scale-105 opacity-80"
          >
            <source src="https://cdn.pixabay.com/vimeo/328940142/networking-23011.mp4?width=1920&hash=8b6540b7d7b003c20c02b2ea2500d41e73715c0e" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md font-bold text-xs md:text-sm mb-8 animate-float">
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
            <Link to="/store-signup" className="group relative w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-black text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)]">
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

      {/* Sticky Scroll Section */}
      <section id="platform" className={`relative pt-32 pb-32 transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Left side: Sticky text */}
            <div className="lg:w-1/2">
              <div className="sticky top-40 space-y-8">
                <h2 className="text-5xl md:text-7xl font-black leading-tight">
                  {isAr ? 'قوة برمجية، ' : 'Puissance, '}<br/>
                  <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isAr ? 'بساطة في الاستخدام.' : 'Simplicité.'}</span>
                </h2>
                <p className={`text-2xl leading-relaxed max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isAr 
                    ? 'صممنا منصة BEYA لتكون الواجهة الأكثر احترافية لمشروعك. كل ما تحتاجه للبيع مدمج مسبقاً.'
                    : 'BEYA est conçue pour être la vitrine la plus professionnelle de votre projet. Tout est intégré.'}
                </p>
                <div className="pt-8">
                  <Link to="/store-signup" className="text-blue-500 font-bold text-xl flex items-center gap-2 hover:text-blue-600 transition-colors">
                    {isAr ? 'استكشف المميزات' : 'Explorer les fonctionnalités'}
                    <ChevronRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side: Scrolling cards */}
            <div className="lg:w-1/2 space-y-32 pt-20">
              
              {/* Card 1 */}
              <div className={`rounded-[2rem] p-8 md:p-12 shadow-2xl transform transition-transform hover:scale-[1.02] duration-500 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-8">
                  <LayoutTemplate className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">{isAr ? 'تصاميم عالمية' : 'Designs World-Class'}</h3>
                <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isAr ? 'واجهات متجرك مصممة لزيادة المبيعات (Conversion-optimized). مظهر احترافي يعكس جودة علامتك التجارية.' : 'Des thèmes optimisés pour la conversion. Une apparence professionnelle qui reflète votre marque.'}
                </p>
                <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200 shadow-sm'}`}>
                  <img src="/ad-bg-2.png" alt="Dashboard" className="w-full h-auto" />
                </div>
              </div>

              {/* Card 2 */}
              <div className={`rounded-[2rem] p-8 md:p-12 shadow-2xl transform transition-transform hover:scale-[1.02] duration-500 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-8">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">{isAr ? 'سرعة فائقة (0.5s)' : 'Vitesse fulgurante (0.5s)'}</h3>
                <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isAr ? 'سيرفرات سحابية موزعة عالمياً تضمن تحميل متجرك في أجزاء من الثانية لعدم فقدان أي زبون.' : 'Des serveurs cloud mondiaux garantissent un chargement en quelques millisecondes.'}
                </p>
                <div className={`rounded-xl overflow-hidden border p-6 ${isDark ? 'bg-black border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-4 text-emerald-500 font-mono text-xl font-bold">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    Speed Index: 99/100
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className={`rounded-[2rem] p-8 md:p-12 shadow-2xl transform transition-transform hover:scale-[1.02] duration-500 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-8">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">{isAr ? 'زيرو ريسك (Zero Risk)' : 'Zéro Risque'}</h3>
                <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isAr ? 'لأول مرة في المغرب، أطلق متجرك الاحترافي ولا تدفع الاشتراك حتى تبدأ مبيعاتك الحقيقية.' : 'Lancez votre boutique PRO et ne payez l\'abonnement qu\'après votre première vente.'}
                </p>
                <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200 shadow-sm'}`}>
                  <img src="/ad-bg-1.png" alt="Zero Risk" className="w-full h-auto" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Full-width Marquee (Trust) */}
      <section className="py-20 border-y border-blue-500/10 overflow-hidden bg-blue-600 flex items-center">
        <div className="whitespace-nowrap animate-[scroll_20s_linear_infinite] flex items-center gap-16 opacity-90">
          {/* Repeat multiple times for seamless scrolling */}
          {[1,2,3,4,5,6,7,8].map((i) => (
            <span key={i} className="text-4xl font-black uppercase tracking-widest text-white mx-8 flex items-center gap-8 drop-shadow-md">
              <span>{isAr ? 'بناء الثقة' : 'TRUSTED'}</span>
              <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"></span>
              <span>{isAr ? 'حماية عالية' : 'SECURE'}</span>
              <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"></span>
              <span>{isAr ? 'سرعة فائقة' : 'FAST'}</span>
              <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"></span>
            </span>
          ))}
        </div>
      </section>

      {/* Clean Pricing Section */}
      <section id="pricing" className={`py-32 relative transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6">{isAr ? 'استثمار ذكي' : 'Investissement intelligent'}</h2>
            <p className={`text-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{isAr ? 'أثمنة شفافة. لا توجد رسوم خفية. عمولة 0%.' : 'Tarifs transparents. Zéro frais cachés. 0% de commission.'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Standard PRO */}
            <div className={`rounded-[2rem] p-10 transition-all border ${isDark ? 'bg-black border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 shadow-xl hover:shadow-2xl hover:border-blue-400'}`}>
              <h3 className={`text-2xl font-bold mb-2 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Standard PRO</h3>
              <div className={`flex items-baseline gap-2 mb-8 pb-8 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <span className="text-6xl font-black">199</span>
                <span className={`text-xl font-bold uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>MAD / {isAr ? 'شهر' : 'mois'}</span>
              </div>
              <ul className="space-y-6 mb-12">
                {[
                  isAr ? 'متجر إلكتروني احترافي' : 'Boutique professionnelle',
                  isAr ? 'منتجات غير محدودة' : 'Produits illimités',
                  isAr ? 'ربط الدومين الخاص بك' : 'Domaine personnalisé',
                  isAr ? '0% عمولة مبيعات' : '0% commission',
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-4 text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Check className="w-6 h-6 text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=PRO" className={`block w-full py-5 text-center rounded-xl border-2 font-bold text-lg transition-all ${isDark ? 'border-white/20 hover:bg-white hover:text-black' : 'border-slate-200 hover:border-black hover:bg-black hover:text-white'}`}>
                {isAr ? 'ابدأ الآن' : 'Démarrer'}
              </Link>
            </div>

            {/* ZIRORISK - REMOVED BADGE AND TOP BORDER AS REQUESTED */}
            <div className={`rounded-[2rem] p-10 relative transform md:-translate-y-4 border transition-all ${isDark ? 'bg-gradient-to-b from-blue-900/40 to-black border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.15)]' : 'bg-gradient-to-b from-blue-50 to-white border-blue-400 shadow-[0_20px_60px_rgba(59,130,246,0.15)]'}`}>
              
              <h3 className="text-2xl font-bold text-blue-500 mb-2 uppercase tracking-widest">Zirorisk</h3>
              <div className={`flex items-baseline gap-2 mb-8 pb-8 border-b ${isDark ? 'border-white/10' : 'border-blue-100'}`}>
                <span className="text-6xl font-black">699</span>
                <span className={`text-xl font-bold uppercase ${isDark ? 'text-slate-500' : 'text-blue-400'}`}>MAD / {isAr ? 'مرة واحدة' : 'Une fois'}</span>
              </div>
              <ul className="space-y-6 mb-12">
                {[
                  isAr ? 'تصميم المتجر بالكامل' : 'Création complète de boutique',
                  isAr ? 'لا تدفع الاشتراك (199) حتى تبيع' : 'Payez l\'abonnement après 1ère vente',
                  isAr ? 'دومين احترافي (.com)' : 'Domaine PRO (.com)',
                  isAr ? 'ربط آلي مع eGrow' : 'Liaison auto eGrow',
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-4 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=ZIRORISK" className="block w-full py-5 text-center rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 animate-float">
                {isAr ? 'احجز متجرك الآن' : 'Réserver maintenant'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`pt-20 pb-10 border-t text-center transition-colors duration-500 ${isDark ? 'bg-black border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        <Link to="/" className={`inline-flex items-center gap-2 mb-8 opacity-50 hover:opacity-100 transition-opacity ${isDark ? 'text-white' : 'text-black'}`} dir="ltr">
          <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center text-left">
            <span className={`font-black text-[22px] leading-none tracking-tight ${isDark ? 'text-white' : 'text-[#0B1121]'}`}>BEYA</span>
            <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">STORES</span>
          </div>
        </Link>
        <p className={`font-medium ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
          © {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
        </p>
      </footer>
    </div>
  );
}
