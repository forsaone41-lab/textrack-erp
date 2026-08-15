import React, { useState } from 'react';
import { Scissors, Sparkles, CheckCircle2, Phone, MapPin, Calendar, Clock, Heart, Menu, X } from 'lucide-react';

export default function BeautySalonDemo() {
  const [lang, setLang] = useState<'fr'|'ar'|'en'>('fr');
  const [showToast, setShowToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = (en: string, fr: string, ar: string) => {
    if (lang === 'en') return en;
    if (lang === 'fr') return fr;
    return ar;
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const services = [
    { title: t('Hair Styling', 'Coiffure', 'تصفيف الشعر'), price: '200', icon: <Scissors className="w-6 h-6"/>, img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600' },
    { title: t('Nail Care', 'Manucure & Pédicure', 'العناية بالأظافر'), price: '150', icon: <Sparkles className="w-6 h-6"/>, img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=600' },
    { title: t('Facial Spa', 'Soins du Visage', 'سبا الوجه'), price: '300', icon: <Heart className="w-6 h-6"/>, img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600' }
  ];

  return (
    <div className="min-h-screen bg-rose-50 font-sans text-stone-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{t('Appointment requested!', 'Rendez-vous demandé!', 'تم طلب الموعد!')}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-rose-800 font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Élégance
          </h1>
          
          <div className="flex items-center gap-4">
             <button onClick={() => setLang(lang === 'ar' ? 'fr' : lang === 'fr' ? 'en' : 'ar')} className="font-bold text-rose-600 border border-rose-200 px-3 py-1 rounded-full text-xs">
               {lang.toUpperCase()}
             </button>
             <a href="#book" className="bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-rose-700 transition">
               {t('Book Now', 'Réserver', 'احجز الآن')}
             </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-10 pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 text-center md:text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
             <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6 leading-tight">
               {t('Reveal Your Inner Beauty.', 'Révélez Votre Beauté Intérieure.', 'اكتشفي جمالك الداخلي.')}
             </h2>
             <p className="text-stone-600 text-lg mb-8 max-w-md mx-auto md:mx-0">
               {t('Experience premium beauty services in a relaxing environment.', 'Découvrez des services de beauté haut de gamme dans un cadre relaxant.', 'استمتعي بخدمات تجميل راقية في بيئة مريحة.')}
             </p>
             <a href="#book" className="inline-block bg-rose-900 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-stone-900 transition">
               {t('Make an Appointment', 'Prendre Rendez-vous', 'تحديد موعد')}
             </a>
           </div>
           <div className="flex-1 relative">
             <div className="absolute inset-0 bg-rose-200 rounded-full translate-x-4 translate-y-4"></div>
             <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800" alt="Beauty Salon" className="relative z-10 rounded-full w-full max-w-md mx-auto aspect-square object-cover border-8 border-white shadow-xl" />
           </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif text-stone-900 mb-4">{t('Our Services', 'Nos Services', 'خدماتنا')}</h3>
            <div className="w-16 h-1 bg-rose-300 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
             {services.map((s, i) => (
               <div key={i} className="group cursor-pointer">
                 <div className="overflow-hidden rounded-2xl mb-4 aspect-[4/3]">
                   <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                 </div>
                 <div className="flex items-center justify-between">
                   <h4 className="text-xl font-bold font-serif text-stone-800">{s.title}</h4>
                   <span className="text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full">{s.price} MAD</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="book" className="py-20 bg-rose-900 text-rose-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white text-stone-800 rounded-3xl p-8 md:p-12 shadow-2xl">
             <h3 className="text-3xl font-serif text-center mb-8 text-rose-900">{t('Book Your Session', 'Réservez Votre Séance', 'احجزي جلستك')}</h3>
             <form onSubmit={handleBook} className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-bold text-stone-600 mb-2">{t('Full Name', 'Nom Complet', 'الاسم الكامل')}</label>
                   <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-400" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-stone-600 mb-2">{t('Phone Number', 'Numéro de Téléphone', 'رقم الهاتف')}</label>
                   <input required type="tel" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-400" />
                 </div>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-bold text-stone-600 mb-2">{t('Select Service', 'Sélectionnez un Service', 'اختاري الخدمة')}</label>
                   <select className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-400">
                     <option>Hair Styling</option>
                     <option>Nail Care</option>
                     <option>Facial Spa</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-stone-600 mb-2">{t('Preferred Date', 'Date Souhaitée', 'التاريخ المفضل')}</label>
                   <input required type="date" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-400" />
                 </div>
               </div>
               <button type="submit" className="w-full bg-rose-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-rose-700 transition shadow-lg mt-4">
                 {t('Confirm Appointment', 'Confirmer le Rendez-vous', 'تأكيد الموعد')}
               </button>
             </form>
          </div>
        </div>
      </section>

    </div>
  );
}
