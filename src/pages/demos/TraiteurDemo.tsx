import React, { useState } from 'react';
import { Camera, Utensils, CalendarHeart, Phone, CheckCircle2, Menu, X, ArrowRight } from 'lucide-react';

export default function TraiteurDemo() {
  const [lang, setLang] = useState<'fr'|'ar'|'en'>('fr');
  const [showToast, setShowToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = (en: string, fr: string, ar: string) => {
    if (lang === 'en') return en;
    if (lang === 'fr') return fr;
    return ar;
  };

  const preventScroll = (e: React.MouseEvent) => e.preventDefault();
  const handleToast = () => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  const portfolio = [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800'
  ];

  return (
    <div className="min-h-screen bg-neutral-950 font-serif text-neutral-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-6 py-3 rounded shadow-xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-sans font-medium">{t('Message sent successfully!', 'Message envoyé avec succès!', 'تم إرسال الرسالة بنجاح!')}</span>
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 w-full z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <h1 className="text-2xl text-amber-500 font-bold tracking-widest uppercase">
            Royal<span className="text-white font-light">Events</span>
          </h1>
          
          <nav className="hidden md:flex gap-12 text-sm tracking-[0.2em] uppercase text-neutral-400">
            <a href="#" onClick={preventScroll} className="hover:text-amber-500 transition">{t('Services', 'Services', 'خدماتنا')}</a>
            <a href="#" onClick={preventScroll} className="hover:text-amber-500 transition">{t('Portfolio', 'Portfolio', 'أعمالنا')}</a>
            <a href="#" onClick={preventScroll} className="hover:text-amber-500 transition">{t('Contact', 'Contact', 'اتصل بنا')}</a>
          </nav>

          <div className="flex items-center gap-6">
            <button onClick={() => setLang(lang === 'ar' ? 'fr' : lang === 'fr' ? 'en' : 'ar')} className="font-sans font-bold text-neutral-400 hover:text-white transition">
              {lang.toUpperCase()}
            </button>
            <a href="#quote" className="hidden md:block bg-amber-600 text-white px-6 py-3 text-xs tracking-widest uppercase font-bold hover:bg-amber-500 transition">
              {t('Get a Quote', 'Demander un Devis', 'اطلب تسعيرة')}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center pt-20 text-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-40" alt="Wedding" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 px-6 max-w-4xl">
          <p className="text-amber-500 tracking-[0.3em] uppercase text-sm mb-6">{t('Luxury Event Planning', 'Planification d\'Événements de Luxe', 'تنظيم الحفلات الفاخرة')}</p>
          <h2 className="text-5xl md:text-7xl font-light mb-8 leading-tight text-white">
            {t('Unforgettable Moments.', 'Des Moments Inoubliables.', 'لحظات لا تُنسى.')}
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl mb-12 font-sans font-light max-w-2xl mx-auto">
            {t('We specialize in creating bespoke weddings and corporate events with exquisite catering and stunning decor.', 'Nous sommes spécialisés dans la création de mariages sur mesure et d\'événements d\'entreprise avec une restauration exquise et un décor époustouflant.', 'نحن متخصصون في تصميم حفلات زفاف ومناسبات شركات مصممة خصيصًا مع تقديم طعام رائع وديكور مذهل.')}
          </p>
          <a href="#quote" className="inline-block border border-amber-500 text-amber-500 px-10 py-4 uppercase tracking-[0.2em] font-sans text-sm hover:bg-amber-500 hover:text-neutral-950 transition">
            {t('Start Planning', 'Commencer la Planification', 'ابدأ التخطيط')}
          </a>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
             <div className="bg-neutral-950 p-10 border border-white/5 hover:border-amber-500/50 transition group">
               <Utensils className="w-10 h-10 text-amber-500 mb-6" />
               <h3 className="text-2xl mb-4 text-white">{t('Catering', 'Traiteur', 'تموين الحفلات')}</h3>
               <p className="text-neutral-500 font-sans font-light">{t('Exquisite Moroccan and international cuisine tailored to your taste.', 'Cuisine marocaine et internationale exquise adaptée à vos goûts.', 'مأكولات مغربية وعالمية رائعة مصممة حسب ذوقك.')}</p>
             </div>
             <div className="bg-neutral-950 p-10 border border-white/5 hover:border-amber-500/50 transition group">
               <CalendarHeart className="w-10 h-10 text-amber-500 mb-6" />
               <h3 className="text-2xl mb-4 text-white">{t('Wedding Planning', 'Organisation de Mariage', 'تنظيم الزفاف')}</h3>
               <p className="text-neutral-500 font-sans font-light">{t('From venue selection to the final dance, we handle every detail.', 'Du choix du lieu à la danse finale, nous gérons chaque détail.', 'من اختيار المكان إلى الرقصة الأخيرة، نتعامل مع كل التفاصيل.')}</p>
             </div>
             <div className="bg-neutral-950 p-10 border border-white/5 hover:border-amber-500/50 transition group">
               <Camera className="w-10 h-10 text-amber-500 mb-6" />
               <h3 className="text-2xl mb-4 text-white">{t('Photography', 'Photographie', 'التصوير')}</h3>
               <p className="text-neutral-500 font-sans font-light">{t('Capturing the magic and emotion of your special day.', 'Capturer la magie et l\'émotion de votre journée spéciale.', 'التقاط سحر وعاطفة يومك الخاص.')}</p>
             </div>
          </div>
        </div>
      </section>

      {/* Contact / Quote Form */}
      <section id="quote" className="py-24 max-w-4xl mx-auto px-6">
         <div className="text-center mb-16">
           <h2 className="text-4xl text-white mb-4">{t('Request a Consultation', 'Demander une Consultation', 'طلب استشارة')}</h2>
           <div className="w-20 h-0.5 bg-amber-500 mx-auto"></div>
         </div>

         <form onSubmit={(e) => { e.preventDefault(); handleToast(); }} className="space-y-8 font-sans">
            <div className="grid md:grid-cols-2 gap-8">
              <input required type="text" placeholder={t('Your Name', 'Votre Nom', 'الاسم')} className="bg-transparent border-b border-white/20 pb-4 text-white focus:outline-none focus:border-amber-500 w-full" />
              <input required type="tel" placeholder={t('Phone Number', 'Numéro de Téléphone', 'رقم الهاتف')} className="bg-transparent border-b border-white/20 pb-4 text-white focus:outline-none focus:border-amber-500 w-full" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <input required type="date" className="bg-transparent border-b border-white/20 pb-4 text-white focus:outline-none focus:border-amber-500 w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-50 focus:opacity-100" />
              <input required type="number" placeholder={t('Guest Count', 'Nombre d\'Invités', 'عدد الضيوف')} className="bg-transparent border-b border-white/20 pb-4 text-white focus:outline-none focus:border-amber-500 w-full" />
            </div>
            <button type="submit" className="w-full bg-amber-600 text-white py-5 font-bold tracking-[0.2em] uppercase text-sm hover:bg-amber-500 transition mt-8">
              {t('Send Inquiry', 'Envoyer la Demande', 'إرسال الطلب')}
            </button>
         </form>
      </section>

    </div>
  );
}
