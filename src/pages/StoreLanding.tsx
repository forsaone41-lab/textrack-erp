import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MonitorSmartphone, Zap, Code, ShieldCheck, Sparkles } from 'lucide-react';
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
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform rotate-12">
              <span className="text-white font-black text-xl -rotate-12">B</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">BEYA</span>
              <span className="font-black text-2xl bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent block leading-none" style={{ fontFamily: 'cursive' }}>Store</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggle}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase"
            >
              {isAr ? 'FR' : 'AR'}
            </button>
            <Link to="/store-signup?mode=login" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors">
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-[0_4px_10px_rgba(37,99,235,0.2)]"
            >
              {isAr ? 'إنشاء حساب' : 'Créer un compte'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-pink-50 rounded-full blur-[100px] -z-10 opacity-70" />
        <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] -z-10 opacity-70" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              {isAr ? (
                <>بني متجرك دابا، <br/><span className="text-indigo-600">وماتخلص حتى تبيع!</span></>
              ) : (
                <>Créez votre boutique, <br/><span className="text-indigo-600">payez après la 1ère vente !</span></>
              )}
            </h1>
            
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              {isAr 
                ? 'بـ 699 درهم فقط، حنا كنتكلفو بالديزاين والدومين (.com). نتا ركز غير على المبيعات ديالك!'
                : 'Pour 699 DH, nous gérons le design et le domaine (.com). Concentrez-vous sur vos ventes !'}
            </p>
            
            <ul className="space-y-4">
              {[
                isAr ? 'متجر احترافي جاهز للعمل بـ 699 درهم' : 'Boutique professionnelle prête à vendre (699 DH)',
                isAr ? 'الاشتراك (199 درهم) يبدأ بعد أول مبيعة' : 'L\'abonnement (199 DH) commence après la 1ère vente',
                isAr ? 'استقلالية تامة في إدارة حسابك' : 'Indépendance totale de votre compte'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link to="/store-signup" className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg text-center transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5">
                {isAr ? 'ابدأ الآن' : 'Get Started'}
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 rounded-xl font-bold text-lg text-center transition-all hover:bg-slate-50 flex items-center justify-center gap-2">
                {isAr ? 'اطلب تصميماً مخصصاً' : 'Demander un design sur-mesure'}
              </a>
            </div>
            
            {/* Stats */}
            <div className="pt-10 grid grid-cols-3 gap-6 border-t border-slate-100">
              <div>
                <div className="text-2xl font-black text-slate-900 mb-1">+500</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{isAr ? 'متاجر نشطة' : 'Active stores'}</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 mb-1">+15</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{isAr ? 'دولة مدعومة' : 'Served countries'}</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-500 mb-1">+20%</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{isAr ? 'نسبة التحويل' : 'Conversion rate'}</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Visual Representation */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 to-indigo-50 transform rotate-3 rounded-[3rem] -z-10" />
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-32 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                  <MonitorSmartphone className="w-8 h-8 text-indigo-300" />
                </div>
                <div className="h-32 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                  <Zap className="w-8 h-8 text-amber-300" />
                </div>
              </div>
              
              <div className="h-48 bg-slate-900 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                <Code className="w-6 h-6 text-emerald-400 mb-4" />
                <div className="space-y-2">
                  <div className="w-3/4 h-2 bg-slate-800 rounded-full" />
                  <div className="w-1/2 h-2 bg-slate-800 rounded-full" />
                  <div className="w-full h-2 bg-slate-800 rounded-full mt-4" />
                  <div className="w-5/6 h-2 bg-slate-800 rounded-full" />
                </div>
                <div className="absolute bottom-6 right-6">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-50" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
              {isAr ? 'خطط أسعار تناسب طموحك' : 'Des tarifs adaptés à votre ambition'}
            </h2>
            <p className="text-lg text-slate-600">
              {isAr 
                ? 'اختر الخطة التي تناسبك وابدأ البيع اليوم. بدون رسوم خفية.'
                : 'Choisissez le plan qui vous convient et commencez à vendre aujourd\'hui. Sans frais cachés.'}
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className={`text-sm font-bold ${!isYearly ? 'text-indigo-600' : 'text-slate-500'}`}>{isAr ? 'شهرياً' : 'Mensuel'}</span>
            <button 
              onClick={() => setIsYearly(!isYearly)} 
              className="w-16 h-8 bg-indigo-100 rounded-full p-1 relative transition-colors focus:outline-none"
            >
              <div className={`w-6 h-6 bg-indigo-600 rounded-full shadow-md transition-transform duration-300 ${isYearly ? (isAr ? '-translate-x-8' : 'translate-x-8') : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 ${isYearly ? 'text-indigo-600' : 'text-slate-500'}`}>
              {isAr ? 'سنوياً' : 'Annuel'}
              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">{isAr ? '-20% توفير' : '-20%'}</span>
            </span>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* PRO Plan */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-indigo-200 transition-all hover:shadow-xl relative overflow-hidden flex flex-col">
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">PRO</h3>
              <p className="text-slate-500 mb-6 font-medium text-sm">{isAr ? 'إنشاء المتجر بنفسك' : 'Création autonome'}</p>
              <div className="mb-8 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-slate-400 line-through decoration-2">{isYearly ? '2,990' : '299'}</span>
                  <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'عرض محدود' : 'PROMO'}</span>
                </div>
                <div>
                  <span className="text-5xl font-black text-slate-900 transition-colors">{isYearly ? (Number(proPrice) * 10).toLocaleString() : proPrice}</span>
                  <span className="text-slate-500 font-bold ml-2 uppercase tracking-widest text-xs">MAD / {isYearly ? (isAr ? 'سنة' : 'an') : (isAr ? 'شهر' : 'mois')}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  isAr ? 'متجر إلكتروني واحد' : '1 Boutique en ligne',
                  isAr ? 'منتجات غير محدودة و0% عمولة' : 'Produits illimités & 0% commision',
                  isAr ? 'استضافة مجانية وسريعة' : 'Hébergement rapide et gratuit',
                  isAr ? 'تطبيقات لزيادة المبيعات' : 'Apps de conversion (Upsell)',
                  isAr ? 'دعم فني قياسي' : 'Support standard',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=PRO" className="block w-full py-4 text-center rounded-2xl font-black uppercase tracking-widest text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
                {isAr ? 'ابدأ إنشاء متجرك' : 'Créer ma boutique'}
              </Link>
            </div>

            {/* ZIRORISK Plan */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-indigo-500 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(99,102,241,0.15)] hover:-translate-y-2 duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />
              <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'}`}>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  {isAr ? 'موصى به' : 'Recommandé'}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">Zirorisk</h3>
              <p className="text-slate-500 mb-6 font-medium text-sm">{isAr ? 'متجر جاهز للاستخدام' : 'Clé en main (Recommandé)'}</p>
              <div className="mb-8 flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-slate-400 line-through decoration-2">1,499</span>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'عرض محدود' : 'PROMO'}</span>
                </div>
                <div>
                  <span className="text-5xl font-black text-slate-900 transition-colors">699</span>
                  <span className="text-slate-500 font-bold ml-2 uppercase tracking-widest text-xs">MAD / {isAr ? 'مرة واحدة' : 'Une fois'}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                {[
                  isAr ? 'تصميم المتجر + الدومين احترافي' : 'Création + Domaine PRO',
                  isAr ? 'الاشتراك (199) لا يدفع إلا بعد أول مبيعة' : 'Abonnement (199) après la 1ère vente',
                  isAr ? 'ربط مباشر ومستقل مع حساب eGrow' : 'Liaison directe & indépendante eGrow',
                  isAr ? 'منتجات غير محدودة و0% عمولة' : 'Produits illimités & 0% commision',
                  isAr ? 'تطبيقات لزيادة المبيعات (Upsell)' : 'Apps de conversion (Upsell)',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 font-medium text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=ZIRORISK" className="block w-full py-4 text-center rounded-2xl font-black uppercase tracking-widest text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 relative z-10">
                {isAr ? 'احجز متجرك الآن' : 'Réserver ma boutique'}
              </Link>
            </div>
            
            {/* PREMIUM Plan */}
            <div className="bg-slate-900 rounded-[2rem] p-8 border border-indigo-500 shadow-[0_20px_50px_rgba(99,102,241,0.2)] relative overflow-hidden hover:-translate-y-2 transition-transform duration-300 flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-40" />
              <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-amber-500/20`}>
                {isAr ? 'الأكثر طلباً' : 'Populaire'}
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 relative z-10">PREMIUM</h3>
              <p className="text-indigo-200 mb-6 font-medium text-sm relative z-10">{isAr ? 'لرواد الأعمال (عدة علامات)' : 'Pour les multi-marques'}</p>
              <div className="mb-8 relative z-10 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-indigo-300 line-through decoration-2">{isYearly ? '7,990' : '799'}</span>
                  <span className="text-[10px] font-black text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">{isAr ? 'عرض محدود' : 'PROMO'}</span>
                </div>
                <div>
                  <span className="text-5xl font-black text-white">{isYearly ? (Number(premiumPrice) * 10).toLocaleString() : premiumPrice}</span>
                  <span className="text-indigo-200 font-bold ml-2 uppercase tracking-widest text-xs">MAD / {isYearly ? (isAr ? 'سنة' : 'an') : (isAr ? 'شهر' : 'mois')}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 relative z-10 flex-1">
                {[
                  isAr ? 'حتى 5 متاجر إلكترونية' : 'Jusqu\'à 5 Boutiques',
                  isAr ? '0% عمولة على المبيعات' : '0% de frais de transaction',
                  isAr ? 'المساعد الذكي (AI) لاكتشاف المنتجات' : 'Assistant IA pour produits',
                  isAr ? 'أولوية في التصنيع (VIP)' : 'Priorité de confection (VIP)',
                  isAr ? 'مدير حساب شخصي' : 'Account manager dédié',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-white font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/store-signup?plan=PREMIUM" className="block w-full py-4 text-center rounded-2xl font-black uppercase tracking-widest text-xs bg-indigo-500 text-white hover:bg-indigo-400 transition-all shadow-[0_10px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] relative z-10">
                {isAr ? 'اشترك الآن' : 'S\'abonner maintenant'}
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center transform rotate-12">
              <span className="text-white font-black text-sm -rotate-12">B</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-900 tracking-tight">BEYA</span>
              <span className="font-black text-lg bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent" style={{ fontFamily: 'cursive' }}>Store</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/partners" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              {isAr ? 'برنامج الشركاء والمؤثرين' : 'Programme Partenaires & Affiliation'}
            </Link>
            <Link to="/terms" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              {isAr ? 'شروط الخدمة' : 'CGU'}
            </Link>
            <Link to="/privacy" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              {isAr ? 'سياسة الخصوصية' : 'Confidentialité'}
            </Link>
          </div>
          
          <p className="text-sm font-medium text-slate-400">
            © 2026 BEYACREATIVE. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
          </p>
        </div>
      </footer>

    </div>
  );
}



