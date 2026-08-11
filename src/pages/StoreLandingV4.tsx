import React from 'react';
import { ArrowRight, Palette, Layout, Star, ArrowUpRight } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function StoreLandingV4() {
  const { isAr, toggle } = useLang();
  
  return (
    <div className={`min-h-screen bg-[#FDFBF7] text-[#2D2D2D] ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Elegant Navbar */}
      <nav className="w-full py-8 px-8 md:px-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-serif text-[28px] italic tracking-tight">Beya.</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <button onClick={toggle} className="text-sm font-medium hover:opacity-70 transition-opacity">
            {isAr ? 'Français' : 'العربية'}
          </button>
          <Link to="/store-signup" className="px-7 py-3 bg-[#2D2D2D] text-[#FDFBF7] text-sm font-medium rounded-full hover:bg-black transition-colors">
            {isAr ? 'ابدأ الآن' : 'Commencer'}
          </Link>
        </div>
      </nav>

      {/* Hero Section - Soft & Aesthetic */}
      <section className="pt-24 pb-20 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EFECE5] rounded-full text-sm font-medium mb-10">
          <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
          {isAr ? 'صُنع للماركات الراقية' : 'Créé pour les marques d\'exception'}
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] mb-8 max-w-5xl text-[#1A1A1A]">
          {isAr ? (
            <>متجرك، <span className="italic text-slate-500">هويتك.</span><br/>ابنِ علامة تجارية لا تُنسى.</>
          ) : (
            <>Votre boutique, <span className="italic text-slate-500">votre identité.</span><br/>Bâtissez une marque inoubliable.</>
          )}
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-14 max-w-2xl mx-auto font-light leading-relaxed">
          {isAr 
            ? 'تصاميم مذهلة، تحكم كامل في الألوان، وتجربة تسوق تسحر زبنائك من النظرة الأولى.'
            : 'Des designs époustouflants, un contrôle total, et une expérience d\'achat qui enchante vos clients.'}
        </p>
        
        <Link to="/store-signup" className="px-12 py-5 bg-[#D2E4D5] text-[#1E3A24] rounded-full font-medium text-lg hover:bg-[#C1D6C5] transition-all flex items-center justify-center gap-3">
          {isAr ? 'صمم متجرك الآن' : 'Créer votre boutique'}
          <ArrowUpRight className={`w-5 h-5 ${isAr ? 'rotate-180 -scale-x-100' : ''}`} />
        </Link>
      </section>

      {/* Aesthetic Image Grid */}
      <section className="px-8 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[500px] rounded-[2rem] bg-slate-200 overflow-hidden relative group">
             <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920" alt="Fashion Store" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-black/20" />
             <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-serif italic mb-1">Mode & Fashion</h3>
                <p className="text-white/80">Thème: "Elegance"</p>
             </div>
          </div>
          <div className="h-[500px] rounded-[2rem] bg-amber-100 overflow-hidden relative group">
             <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800" alt="Cosmetics Store" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-black/10" />
             <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-serif italic mb-1">Cosmetics</h3>
                <p className="text-white/80">Thème: "Pure"</p>
             </div>
          </div>
        </div>
      </section>

      {/* Features - Soft approach */}
      <section className="py-32 bg-[#1A1A1A] text-[#FDFBF7] rounded-t-[3rem] md:rounded-t-[5rem]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-20 items-center mb-24">
             <div className="w-full md:w-1/2">
                <h2 className="text-5xl font-serif mb-8 leading-tight">{isAr ? 'جمال المظهر يعكس جودة منتجك' : 'La beauté reflète la qualité'}</h2>
                <p className="text-xl text-slate-400 font-light leading-relaxed">
                  {isAr 
                    ? 'الزبون يثق في المتاجر التي تبدو احترافية. بفضل قوالبنا الجاهزة، يمكنك بناء متجر يشبه الماركات العالمية في دقائق معدودة.'
                    : 'Les clients font confiance aux boutiques professionnelles. Avec nos thèmes, créez une boutique digne des grandes marques en quelques minutes.'}
                </p>
             </div>
             <div className="w-full md:w-1/2 grid grid-cols-2 gap-6">
                <div className="bg-[#2D2D2D] p-8 rounded-3xl">
                   <Palette className="w-8 h-8 text-amber-200 mb-6" />
                   <h4 className="text-lg font-medium mb-2">{isAr ? 'ألوان متناسقة' : 'Couleurs Harmonieuses'}</h4>
                   <p className="text-sm text-slate-400">{isAr ? 'اختر باليت الألوان التي تناسب علامتك.' : 'Choisissez la palette de votre marque.'}</p>
                </div>
                <div className="bg-[#2D2D2D] p-8 rounded-3xl mt-12">
                   <Layout className="w-8 h-8 text-emerald-200 mb-6" />
                   <h4 className="text-lg font-medium mb-2">{isAr ? 'ترتيب مرن' : 'Mise en page flexible'}</h4>
                   <p className="text-sm text-slate-400">{isAr ? 'تخصيص الواجهة بالسحب والإفلات.' : 'Personnalisez avec le glisser-déposer.'}</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="text-center pt-20 border-t border-white/10 max-w-4xl mx-auto px-8">
           <h2 className="text-4xl font-serif italic mb-8">{isAr ? 'ابدأ رحلتك بـ 199 درهم فقط' : 'Commencez pour seulement 199 MAD'}</h2>
           <Link to="/store-signup" className="inline-flex items-center gap-3 px-10 py-4 bg-[#FDFBF7] text-[#1A1A1A] rounded-full font-medium hover:bg-slate-200 transition-colors">
              {isAr ? 'اكتشف الباقات' : 'Découvrir les offres'}
           </Link>
        </div>
      </section>

    </div>
  );
}
