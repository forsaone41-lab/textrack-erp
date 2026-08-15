import React, { useState } from 'react';
import { MapPin, Calendar, Users, Star, Search, Menu, X, Phone, CheckCircle2 } from 'lucide-react';

export default function ApartmentDemo() {
  const [lang, setLang] = useState<'fr'|'ar'|'en'>('fr');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const t = (en: string, fr: string, ar: string) => {
    if (lang === 'en') return en;
    if (lang === 'fr') return fr;
    return ar;
  };

  const preventScroll = (e: React.MouseEvent) => e.preventDefault();
  const handleToast = () => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  const apartments = [
    { id: 1, name: t('Luxury Marina Apartment', 'Appartement Luxe Marina', 'شقة مارينا الفاخرة'), location: t('Casablanca', 'Casablanca', 'الدار البيضاء'), price: '800', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800', rating: 4.9 },
    { id: 2, name: t('Gueliz Center Studio', 'Studio Centre Gueliz', 'استوديو جليز المركزي'), location: t('Marrakech', 'Marrakech', 'مراكش'), price: '450', img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800', rating: 4.8 },
    { id: 3, name: t('Ocean View Villa', 'Villa Vue Océan', 'فيلا بإطلالة على المحيط'), location: t('Agadir', 'Agadir', 'أكادير'), price: '1200', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', rating: 5.0 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{t('Action completed!', 'Action terminée!', 'تمت العملية!')}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-teal-800 font-bold">Dar<span className="text-stone-900">Stay</span></h1>
          
          <nav className="hidden md:flex gap-8 font-medium text-sm text-stone-600">
            <a href="#" onClick={preventScroll} className="hover:text-teal-700">{t('Destinations', 'Destinations', 'الوجهات')}</a>
            <a href="#" onClick={preventScroll} className="hover:text-teal-700">{t('Add Property', 'Ajouter Propriété', 'أضف عقار')}</a>
            <a href="#" onClick={preventScroll} className="hover:text-teal-700">{t('Contact', 'Contact', 'اتصل بنا')}</a>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setLang(lang === 'ar' ? 'fr' : lang === 'fr' ? 'en' : 'ar')} className="font-bold text-teal-800 text-sm">{lang.toUpperCase()}</button>
            <button onClick={handleToast} className="hidden md:block bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-teal-800 transition">{t('Sign In', 'Connexion', 'دخول')}</button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu /></button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Villa" />
          <div className="absolute inset-0 bg-stone-900/40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 w-full max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-serif mb-6">{t('Find Your Perfect Stay', 'Trouvez Votre Séjour Idéal', 'اعثر على إقامتك المثالية')}</h2>
          <p className="text-lg md:text-xl text-stone-200 mb-10">{t('Premium apartments and villas across Morocco.', 'Appartements et villas premium à travers le Maroc.', 'شقق وفيلات فاخرة في جميع أنحاء المغرب.')}</p>
          
          {/* Search Box */}
          <div className="bg-white p-2 rounded-full flex flex-col md:flex-row gap-2 max-w-3xl mx-auto shadow-2xl text-stone-800">
             <div className="flex-1 flex items-center px-4 py-2 border-r border-stone-200">
               <MapPin className="w-5 h-5 text-teal-600 mr-2" />
               <input type="text" placeholder={t('Where are you going?', 'Où allez-vous?', 'إلى أين أنت ذاهب؟')} className="w-full bg-transparent outline-none text-sm" />
             </div>
             <div className="flex-1 flex items-center px-4 py-2 border-r border-stone-200">
               <Calendar className="w-5 h-5 text-teal-600 mr-2" />
               <input type="text" placeholder={t('Check in - Check out', 'Arrivée - Départ', 'الوصول - المغادرة')} className="w-full bg-transparent outline-none text-sm" />
             </div>
             <button onClick={(e) => { e.preventDefault(); handleToast(); }} className="bg-teal-700 text-white rounded-full px-8 py-3 font-bold hover:bg-teal-800 transition flex items-center justify-center gap-2">
               <Search className="w-4 h-4" /> {t('Search', 'Rechercher', 'بحث')}
             </button>
          </div>
        </div>
      </section>

      {/* Popular Listings */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-serif text-stone-900 mb-10">{t('Popular Destinations', 'Destinations Populaires', 'الوجهات الشهيرة')}</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {apartments.map(apt => (
            <div key={apt.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer" onClick={handleToast}>
              <div className="h-60 relative overflow-hidden">
                <img src={apt.img} alt={apt.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {apt.rating}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-stone-900">{apt.name}</h4>
                </div>
                <div className="flex items-center text-stone-500 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" /> {apt.location}
                </div>
                <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                  <div className="text-stone-900"><span className="font-bold text-xl">{apt.price}</span> <span className="text-sm text-stone-500">{t('MAD / night', 'MAD / nuit', 'درهم / ليلة')}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
