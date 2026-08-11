import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle2, PlayCircle, Star, Rocket, Layout, Globe, Smartphone, ShieldCheck, Clock } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link, useLocation } from 'react-router-dom';
import { loadCompanyProfile } from '../types';

export default function SetupLanding() {
  const { isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  
  // Facebook Pixel tracking - track PageView specifically for this ad campaign
  const location = useLocation();
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'ViewContent', { content_name: 'Setup_Service_Landing' });
    }
  }, [location]);

  const whatsappUrl = `https://wa.me/${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    isAr ? 'مرحباً، بغيت نستفد من عرض إنشاء متجر إلكتروني متكامل بـ 800 درهم (ZIRORISK).' : 'Bonjour, je suis intéressé par l\'offre de création de boutique complète à 800 MAD (ZIRORISK).'
  )}`;
  
  return (
    <div className={`min-h-screen bg-slate-50 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-amber-500 text-white shadow-sm shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-amber-500 mt-0.5 uppercase">SETUP</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggle}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase"
            >
              {isAr ? 'FR' : 'AR'}
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20">
              {isAr ? 'تواصل معنا' : 'Contactez-nous'}
            </a>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-amber-100/50 to-transparent -z-10" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-bold text-sm mb-8 shadow-sm">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>{isAr ? 'خدمة بناء المتاجر الأكثر طلباً' : 'Le service de création le plus demandé'}</span>
          </div>
          
          <h1 className={`font-black text-slate-900 tracking-tight mb-6 ${isAr ? 'text-4xl md:text-5xl leading-[1.4]' : 'text-5xl md:text-6xl leading-[1.1]'}`}>
            {isAr ? (
              <>ماعندكش مع التقنية؟ <br/><span className="text-amber-500">حنا نصاوبو ليك متجرك من الألف للياء.</span></>
            ) : (
              <>Pas de compétences techniques ? <br/><span className="text-amber-500">Nous créons votre boutique de A à Z.</span></>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'وفر وقتك ومجهودك. فريقنا المتخصص غادي يتكلف بكلشي: من التصميم الاحترافي حتى لربط الدومين وتطبيقات المبيعات. استلم بيزنس جاهز للعمل 100% بـ 800 درهم فقط.'
              : 'Gagnez du temps. Notre équipe s\'occupe de tout : du design professionnel à la configuration du domaine et des applications de vente. Recevez un business clé en main pour 800 MAD.'}
          </p>
          
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl max-w-2xl mx-auto mb-12 transform hover:scale-[1.02] transition-transform">
            <div className="flex flex-col items-center pb-6 border-b border-slate-100 mb-6">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'تكلفة الإعداد تدفع مرة واحدة' : 'Frais de setup (Paiement unique)'}</span>
              <div className="flex items-baseline gap-2 text-slate-900">
                <span className="text-6xl font-black tracking-tighter">800</span>
                <span className="text-xl font-bold">MAD</span>
              </div>
              <p className="text-emerald-600 font-bold text-sm mt-3 bg-emerald-50 px-4 py-1.5 rounded-full">
                {isAr ? 'الاشتراك الشهري (199 MAD) كيبدا حتى كتجيب أول مبيعة!' : 'L\'abonnement (199 MAD) ne commence qu\'après votre 1ère vente !'}
              </p>
            </div>
            
            <Link to="/store-signup?plan=ZIRORISK" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xl transition-all shadow-lg hover:shadow-xl hover:bg-slate-800 flex items-center justify-center gap-3">
              {isAr ? 'احجز متجرك الآن' : 'Réservez votre boutique'}
              <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </main>

      {/* 3. What's Included */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">
            {isAr ? 'شنو داخل فهاد 800 درهم؟' : 'Que comprend ce service ?'}
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Globe, title: isAr ? 'دومين احترافي (.com)' : 'Nom de domaine (.com)', desc: isAr ? 'نشريو ونربطو ليك دومين باسم علامتك التجارية' : 'Achat et configuration de votre domaine' },
              { icon: Layout, title: isAr ? 'تصميم حصري ومميز' : 'Design exclusif', desc: isAr ? 'متجر متناسق مع ألوانك ومصمم لزيادة المبيعات' : 'Boutique optimisée pour les conversions' },
              { icon: Smartphone, title: isAr ? 'تطبيقات الـ Upsell' : 'Apps de Upsell', desc: isAr ? 'إعداد إضافات تزيد من قيمة الطلب الأوتوماتيكية' : 'Configuration des apps pour augmenter le panier' },
              { icon: Rocket, title: isAr ? 'ربط أوتوماتيكي مع eGrow' : 'Liaison eGrow', desc: isAr ? 'طلبياتك كتمشي مباشرة لشركات التوصيل' : 'Envoi automatique des commandes aux livreurs' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 4. Trust / FAQ */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <ShieldCheck className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            {isAr ? 'ضمان "زيرو ريسك"' : 'Garantie Zéro Risque'}
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed mb-10">
            {isAr 
              ? 'حنا كنتيقو فالخدمة ديالنا. داكشي علاش مكنتخلصوش فـالاشتراك الشهري ديال المنصة (199 درهم) حتى تبدا تبيع وتدخل الفلوس. 800 درهم هي فقط تكلفة الجهد والخدمة اللي غنخدمو ليك باش نجهزو ليك متجرك 100%.'
              : 'Nous croyons en notre service. C\'est pourquoi vous ne payez l\'abonnement (199 MAD) qu\'après avoir réalisé votre première vente. Les 800 MAD couvrent uniquement la création sur-mesure de votre boutique.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/store-signup?plan=ZIRORISK" className="px-8 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black text-lg transition-all hover:bg-amber-400">
              {isAr ? 'توكلنا على الله، بغيت متجر' : 'Je commande ma boutique'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-center border-t border-slate-800 text-slate-500 text-sm font-medium">
        <p>© {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
      </footer>
    </div>
  );
}
