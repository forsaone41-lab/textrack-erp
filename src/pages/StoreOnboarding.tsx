import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { Store, Settings, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StoreOnboarding() {
  const { isAr } = useLang();
  const navigate = useNavigate();

  const handleOption1 = () => {
    // Send them to whatsapp to pay 800 MAD for setup
    const msg = encodeURIComponent(isAr 
      ? "مرحباً، أنشأت حسابي وأريد باقة (800 درهم) لتقوموا بإنشاء المتجر لي." 
      : "Bonjour, j'ai créé mon compte et je souhaite l'option à 800 DH pour que votre équipe crée ma boutique.");
    window.open(`https://wa.me/212600000000?text=${msg}`, '_blank');
    // Also navigate them so they can continue later
    navigate('/store-builder');
  };

  const handleOption2 = () => {
    navigate('/store-builder');
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-4 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
            <Store className="w-8 h-8 text-white -rotate-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            {isAr ? 'مرحباً بك! كيف تفضل أن تبدأ؟' : 'Bienvenue ! Comment souhaitez-vous commencer ?'}
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
            {isAr 
              ? 'لقد تم إنشاء حسابك بنجاح. اختر الطريقة التي تناسبك لإطلاق متجرك الإلكتروني.' 
              : 'Votre compte a été créé avec succès. Choisissez la méthode qui vous convient pour lancer votre boutique.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Option 1: Premium */}
          <div className="bg-white rounded-3xl p-8 border-2 border-indigo-500 shadow-[0_20px_50px_rgba(99,102,241,0.15)] relative overflow-hidden flex flex-col hover:-translate-y-1 transition-transform cursor-pointer" onClick={handleOption1}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full" />
            <div className="absolute top-6 right-6">
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {isAr ? 'موصى به' : 'Recommandé'}
              </span>
            </div>
            
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {isAr ? 'أريد أن يقوم فريق BeyaStore بإنشاء المتجر لي' : 'Je veux que l\'équipe BeyaStore crée ma boutique'}
            </h3>
            <div className="text-slate-500 text-sm mb-6 min-h-[60px] leading-relaxed">
              {isAr 
                ? 'نحن نتكلف بكل شيء: شراء النطاق، تصميم احترافي، إعداد تطبيقات زيادة المبيعات (Upsell)، والربط مع eGrow.'
                : 'Nous nous occupons de tout : Achat de domaine, design pro, configuration des apps d\'Upsell, et connexion eGrow.'}
            </div>
            
            <div className="mb-6 flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">800</span>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">MAD</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'تدفع مرة واحدة فقط' : '(Frais uniques)'}
              </span>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-xl mb-6">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                  {isAr 
                    ? 'اربح الوقت وانطلق بموقع احترافي جاهز للبيع ابتداءً من الغد.' 
                    : 'Gagnez du temps et lancez-vous avec un site professionnel prêt à vendre dès demain.'}
                </p>
              </div>
            </div>
            
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
              {isAr ? 'اختيار هذه الباقة' : 'Choisir cette option'}
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Option 2: Standard */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative flex flex-col hover:border-slate-300 hover:shadow-md transition-all cursor-pointer" onClick={handleOption2}>
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-100">
              <Settings className="w-6 h-6 text-slate-600" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {isAr ? 'أريد إنشاء المتجر بنفسي' : 'Je veux créer ma boutique moi-même'}
            </h3>
            <div className="text-slate-500 text-sm mb-6 min-h-[60px] leading-relaxed">
              {isAr 
                ? 'صلاحية كاملة لاستخدام جميع أدواتنا لإنشاء متجرك بسهولة.'
                : 'Accès complet à tous nos outils de création simple.'}
            </div>
            
            <div className="mb-6 flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">0</span>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">MAD</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'للبدء الآن' : 'Pour commencer'}
              </span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-slate-600 shrink-0" />
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  {isAr 
                    ? 'احتفظ بالتحكم الكامل في تصميم متجرك وتخصيصه بنفسك.' 
                    : 'Gardez le contrôle total sur la personnalisation de votre boutique.'}
                </p>
              </div>
            </div>
            
            <button className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
              {isAr ? 'البدء الآن مجاناً' : 'Commencer gratuitement'}
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Reassuring Message */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-black text-emerald-800 mb-1">
              {isAr ? 'ضمانة زيرو ريسك' : 'Garantie Zéro Risque'}
            </h4>
            <p className="text-emerald-700 text-sm font-medium leading-relaxed">
              {isAr 
                ? 'لا تقلق، لن تدفع اشتراكك الشهري (199 درهم) إلا بعد تحقيق أول مبيعة ناجحة!'
                : 'Ne vous inquiétez pas, vous ne paierez votre abonnement mensuel (199 MAD) qu\'après votre première vente réussie.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
