import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, PlayCircle, Star, Rocket, Layout, Globe, Smartphone, ShieldCheck, Clock, Eye, X, ExternalLink } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link, useLocation } from 'react-router-dom';
import { loadCompanyProfile } from '../types';

export default function SetupLanding() {
  const { isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  const [previewTheme, setPreviewTheme] = useState<{name: string, image: string, url?: string} | null>(null);
  
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
      
      {/* Theme Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col backdrop-blur-sm animate-in fade-in duration-200">
          <div className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm" dir="ltr">
            <button onClick={() => setPreviewTheme(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
              <X className="w-5 h-5" />
              <span className="font-bold text-sm hidden sm:block">Close Preview</span>
            </button>
            <div className="font-black text-lg text-slate-800 flex items-center gap-2">
              {previewTheme.name} <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:inline-block">Live Demo</span>
            </div>
            <Link to="/store-signup?plan=ZIRORISK" className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
              <Rocket className="w-4 h-4 hidden sm:block" />
              {isAr ? 'استعمل هاد التصميم' : 'Utiliser ce design'}
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-100/50 p-4 md:p-8" dir="ltr">
            <div className="max-w-4xl mx-auto shadow-2xl rounded-b-xl overflow-hidden ring-1 ring-slate-900/10 bg-white">
              {/* Fake Browser Header */}
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2 rounded-t-xl sticky top-0 z-10 backdrop-blur-md">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto bg-white px-4 py-1 rounded-md text-[10px] font-mono text-slate-400 border border-slate-200/60 shadow-sm w-1/2 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                  {previewTheme.url ? previewTheme.url.replace('https://', '').replace(/\/$/, '') : `demo.beyacreative.com/${previewTheme.name.toLowerCase().replace(' ', '-')}`}
                </div>
                {previewTheme.url ? (
                  <a href={previewTheme.url} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-2 py-1 rounded border border-blue-200">
                    <ExternalLink className="w-3 h-3" /> <span className="hidden sm:inline">{isAr ? 'نافذة جديدة' : 'Ouvrir'}</span>
                  </a>
                ) : (
                  <div className="w-[70px] shrink-0" />
                )}
              </div>
              {previewTheme.url ? (
                <iframe src={previewTheme.url} title={previewTheme.name} className="w-full h-[75vh] border-none block bg-white" />
              ) : (
                <img src={previewTheme.image} alt={previewTheme.name} className="w-full h-auto block" />
              )}
            </div>
          </div>
        </div>
      )}

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
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/store-signup?plan=ZIRORISK" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xl transition-all shadow-lg hover:shadow-xl hover:bg-slate-800 flex items-center justify-center gap-3">
                {isAr ? 'احجز متجرك الآن' : 'Réservez votre boutique'}
                <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
              <button 
                onClick={() => document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {isAr ? 'شوف أمثلة المتاجر' : 'Voir les modèles'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 2.5 Partners Marquee */}
      <section className="py-12 bg-white overflow-hidden border-b border-slate-100">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-rtl {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee {
            width: max-content;
            animation: marquee 12s linear infinite;
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
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          <div className="animate-marquee flex items-center gap-24 md:gap-32 w-max px-12 group-hover:[animation-play-state:paused]">
            {[1, 2, 3].map((group) => (
              <React.Fragment key={group}>
                <span className="font-black text-3xl text-slate-800 blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-tighter uppercase">FASHLOW</span>
                <span className="font-extrabold text-2xl text-blue-600 italic blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-widest uppercase">MODAVION</span>
                <span className="font-black text-3xl text-amber-500 tracking-tight blur-[0.5px] opacity-75 mix-blend-multiply select-none">BEYA<span className="font-light text-slate-500">CREATIVE</span></span>
                <span className="font-bold text-3xl text-rose-500 blur-[0.5px] opacity-75 mix-blend-multiply select-none uppercase tracking-widest">STYLEMA</span>
                <span className="font-black text-3xl text-emerald-500 blur-[0.5px] opacity-75 mix-blend-multiply select-none tracking-tighter">URBAN<span className="font-light text-slate-600">WEAR</span></span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 3. What's Included */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">
            {isAr ? 'شنو داخل فهاد 800 درهم؟' : 'Que comprend ce service ?'}
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Globe, title: isAr ? 'دومين احترافي (.com)' : 'Nom de domaine (.com)', desc: isAr ? 'نشريو ونربطو ليك دومين باسم علامتك التجارية' : 'Achat et configuration de votre domaine' },
              { icon: Layout, title: isAr ? 'تصميم حصري ومميز' : 'Design exclusif', desc: isAr ? 'متجر متناسق مع ألوانك ومصمم لزيادة المبيعات' : 'Boutique optimisée pour les conversions' },
              { icon: Smartphone, title: isAr ? 'تطبيقات الـ Upsell' : 'Apps de Upsell', desc: isAr ? 'إعداد إضافات تزيد من قيمة الطلب الأوتوماتيكية' : 'Configuration des apps pour augmenter le panier' },
              { icon: ShieldCheck, title: isAr ? 'دعم فني مستمر' : 'Support technique', desc: isAr ? 'فريقنا معاك خطوة بخطوة باش يجاوب على أسئلتك' : 'Notre équipe vous accompagne pour répondre à vos questions' },
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
      
      {/* 4. Themes / Examples Section */}
      <section id="themes-section" className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">{isAr ? 'نماذج من المتاجر اللي غنصاوبو ليك' : 'Exemples de boutiques'}</h2>
            <p className="text-slate-500 text-lg">{isAr ? 'تصاميم احترافية متجاوبة مع الموبايل ومصممة لرفع المبيعات (Conversion Rate)' : 'Des designs professionnels optimisés pour les conversions'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Theme 1 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'MAZIA', image: '/images/themes/cosmetics.png' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/cosmetics.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Mazia" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  MAZIA
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-slate-800 text-lg">MAZIA <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
              </div>
            </div>
            {/* Theme 2 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'STREETWEAR PRO', image: '/images/themes/bidla.png', url: 'https://bidla.beyacreative.com/' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/bidla.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Streetwear Pro" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  STREETWEAR PRO
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-slate-800 text-lg">STREETWEAR PRO <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
              </div>
            </div>
            {/* Theme 3 */}
            <div 
              onClick={() => setPreviewTheme({ name: 'MINIMALIST', image: '/images/themes/tech.png' })}
              className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src="/images/themes/tech.png" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Theme Minimalist" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-5 h-5" /> {isAr ? 'معاينة حية' : 'Aperçu en direct'}
                   </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full shadow-sm text-slate-800 uppercase">
                  MINIMALIST
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-slate-800 text-lg">MINIMALIST <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 uppercase">Premium</span></h3>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
             <p className="text-slate-500 font-medium mb-6">{isAr ? '+ عشرات التصاميم الأخرى اللي غتناسب النوع ديال منتجاتك (Niche)' : '+ Des dizaines d\'autres modèles adaptés à votre niche'}</p>
             <Link to="/store-signup?plan=ZIRORISK" className="inline-flex px-8 py-3 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-bold transition-colors">
               {isAr ? 'عجبوني، بغيت متجر بحالهم' : 'Je veux une boutique comme ça'}
             </Link>
          </div>
        </div>
      </section>
      
      {/* 5. Trust / FAQ */}
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
