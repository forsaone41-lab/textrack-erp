import React from 'react';
import { ArrowRight, CheckCircle2, MonitorSmartphone, Zap, Code, ShieldCheck } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function StoreLanding() {
  const { isAr, toggle } = useLang();
  
  return (
    <div className={`min-h-screen bg-white ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-12">
              <span className="text-white font-black text-xl -rotate-12">B</span>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">BEYACREATIVE</span>
              <span className="text-[9px] font-bold text-indigo-600 tracking-[0.2em] uppercase">{isAr ? 'التميز في التصنيع' : 'MANUFACTURING EXCELLENCE'}</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggle}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase"
            >
              {isAr ? 'FR' : 'AR'}
            </button>
            <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-sm">
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
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
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {isAr ? (
                <>البيع عبر الإنترنت <br/> <span className="text-slate-500">لم يكن يوماً</span> <br/> بهذه السهولة</>
              ) : (
                <>Vendre en ligne <br/> <span className="text-slate-500">n'a jamais été</span> <br/> aussi simple</>
              )}
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
              {isAr 
                ? 'ابدأ متجرك الإلكتروني في بضع نقرات واستفد من أدوات التجارة الإلكترونية القوية لدينا لبناء عمل تجاري مربح.'
                : 'Démarrez votre boutique en ligne en quelques clics et profitez de nos puissants outils e-commerce pour bâtir une activité rentable.'}
            </p>
            
            <ul className="space-y-4">
              {[
                isAr ? 'إعداد متجر سهل وبديهي' : 'Configuration de boutique facile et intuitive',
                isAr ? 'لا توجد رسوم حتى تنجح (بدون عمولات)' : 'Aucun frais jusqu\'à votre succès (Zéro commission)',
                isAr ? 'جميع أدوات التجارة الإلكترونية في مكان واحد' : 'Tous les outils e-commerce au même endroit'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link to="/store-builder" className="px-10 py-4 bg-[#e91e63] hover:bg-[#c2185b] text-white rounded-xl font-bold text-lg text-center transition-all shadow-[0_10px_20px_rgba(233,30,99,0.2)] hover:shadow-[0_10px_30px_rgba(233,30,99,0.4)] hover:-translate-y-0.5">
                {isAr ? 'ابدأ الآن' : 'Get Started'}
              </Link>
              <Link to="/#new" className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 rounded-xl font-bold text-lg text-center transition-all hover:bg-slate-50">
                {isAr ? 'اطلب تصميماً مخصصاً' : 'Demander un design sur-mesure'}
              </Link>
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
    </div>
  );
}
