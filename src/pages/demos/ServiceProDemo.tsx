import React, { useState } from 'react';
import { 
  Phone, MapPin, Calendar, Clock, 
  CheckCircle2, Menu, X, MessageCircle, 
  Wrench, Droplets, Zap, Shield, Star
} from 'lucide-react';

export default function HomeServiceDemo() {
  const [lang, setLang] = useState<'fr'|'ar'|'en'>('fr');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Booking form states
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [phone, setPhone] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{t('Request sent successfully! We will call you shortly.', 'Demande envoyée avec succès! Nous vous appelons bientôt.', 'تم إرسال الطلب بنجاح! سنتصل بك قريباً.')}</span>
        </div>
      )}

      {/* Floating WhatsApp Button (Crucial for Morocco) */}
      <a href="#" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform">
        <MessageCircle className="w-8 h-8" />
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Wrench className="w-8 h-8" />
            <h1 className="text-2xl font-black tracking-tight">FixIt<span className="text-slate-900">Maroc</span></h1>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            <a href="#services" className="hover:text-blue-600 transition-colors">{t('Services', 'Services', 'خدماتنا')}</a>
            <a href="#booking" className="hover:text-blue-600 transition-colors">{t('Book', 'Réserver', 'احجز الآن')}</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">{t('Contact', 'Contact', 'اتصل بنا')}</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Lang Toggle */}
            <button 
              onClick={() => {
                if (lang === 'en') setLang('fr');
                else if (lang === 'fr') setLang('ar');
                else setLang('en');
              }}
              className="font-bold text-slate-600 bg-slate-100 w-10 h-10 rounded-full hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              {lang.toUpperCase()}
            </button>
            <a href="tel:+212600000000" className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              <Phone className="w-4 h-4" />
              <span>06 00 00 00 00</span>
            </a>
            <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-t border-slate-100 shadow-xl px-4 py-6 flex flex-col gap-4 text-center">
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="font-bold text-slate-700 p-2">{t('Services', 'Services', 'خدماتنا')}</a>
            <a href="#booking" onClick={() => setIsMenuOpen(false)} className="font-bold text-slate-700 p-2">{t('Book', 'Réserver', 'احجز الآن')}</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="font-bold text-slate-700 p-2">{t('Contact', 'Contact', 'اتصل بنا')}</a>
            <a href="tel:+212600000000" className="bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4">
              <Phone className="w-5 h-5" /> 06 00 00 00 00
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
           <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor"></path></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
           </svg>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full font-bold text-sm mb-6">
              {t('Available 24/7 in Casablanca', 'Disponible 24/7 à Casablanca', 'متاح 24/7 في الدار البيضاء')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              {t('Professional Home Repairs.', 'Réparations à domicile.', 'إصلاحات منزلية احترافية.')}
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
              {t('Fast, reliable, and transparent pricing. Book an expert today and let us handle the hard work.', 'Rapide, fiable, et prix transparents. Réservez un expert aujourd\'hui et laissez-nous faire le travail.', 'سريع، موثوق، وأسعار شفافة. احجز خبيراً اليوم ودعنا نتولى العمل الصعب.')}
            </p>
            <div className="flex gap-4">
              <a href="#booking" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black hover:bg-slate-50 transition-colors shadow-lg">
                {t('Book an Expert', 'Réserver un expert', 'احجز خبيراً')}
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
             <div className="bg-white p-2 rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform">
               <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop" className="rounded-xl w-full h-[300px] md:h-[400px] object-cover" alt="Worker" />
             </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('Our Expertise', 'Notre Expertise', 'خبراتنا')}</h2>
            <p className="text-slate-600">{t('We cover all your home maintenance needs with certified professionals.', 'Nous couvrons tous vos besoins en maintenance avec des professionnels certifiés.', 'نغطي جميع احتياجات صيانة منزلك مع محترفين معتمدين.')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('Plumbing', 'Plomberie', 'السباكة')}</h3>
              <p className="text-slate-500 mb-4">{t('Leaks, pipe installations, water heaters, and general repairs.', 'Fuites, installations de tuyaux, chauffe-eau et réparations générales.', 'تسربات المياه، تركيب الأنابيب، سخانات المياه والإصلاحات العامة.')}</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('Electricity', 'Électricité', 'الكهرباء')}</h3>
              <p className="text-slate-500 mb-4">{t('Wiring, lighting, electrical panels, and emergency troubleshooting.', 'Câblage, éclairage, tableaux électriques et dépannage d\'urgence.', 'الأسلاك، الإضاءة، اللوحات الكهربائية وإصلاح الأعطال الطارئة.')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('Handyman', 'Bricolage', 'أعمال يدوية')}</h3>
              <p className="text-slate-500 mb-4">{t('Furniture assembly, painting, fixing doors, and general maintenance.', 'Montage de meubles, peinture, réparation de portes et maintenance générale.', 'تركيب الأثاث، الصباغة، إصلاح الأبواب والصيانة العامة.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Reservation Section */}
      <section id="booking" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Booking Form */}
            <div className="w-full lg:w-1/2">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('Book a Professional', 'Réserver un Professionnel', 'احجز محترفاً')}</h2>
                <p className="text-slate-600">{t('Fill out the form below. No upfront payment required. You pay after the job is done.', 'Remplissez le formulaire ci-dessous. Aucun paiement à l\'avance. Payez après le travail.', 'املأ النموذج أدناه. لا يلزم الدفع مقدماً. الدفع بعد إنجاز العمل.')}</p>
              </div>

              <form onSubmit={handleBook} className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-lg">
                <div className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('What do you need help with?', 'De quoi avez-vous besoin ?', 'بماذا تحتاج المساعدة؟')}</label>
                    <select 
                      required
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      <option value="" disabled>{t('Select a service...', 'Sélectionnez un service...', 'اختر خدمة...')}</option>
                      <option value="plumbing">{t('Plumbing', 'Plomberie', 'السباكة')}</option>
                      <option value="electricity">{t('Electricity', 'Électricité', 'الكهرباء')}</option>
                      <option value="handyman">{t('Handyman', 'Bricolage', 'أعمال يدوية')}</option>
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('When should we come?', 'Quand devons-nous venir ?', 'متى يجب أن نأتي؟')}</label>
                    <div className="relative">
                      <Calendar className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5`} />
                      <input 
                        type="datetime-local" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`w-full bg-white border border-slate-300 rounded-xl py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                      />
                    </div>
                  </div>

                  {/* Phone Number (Crucial in Morocco) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('Phone Number (WhatsApp)', 'Numéro de Téléphone (WhatsApp)', 'رقم الهاتف (واتساب)')}</label>
                    <div className="relative">
                      <Phone className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5`} />
                      <input 
                        type="tel" 
                        required
                        placeholder="06 00 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full bg-white border border-slate-300 rounded-xl py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
                        dir="ltr"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{t('We will call you to confirm the price and time.', 'Nous vous appellerons pour confirmer le prix et l\'heure.', 'سنتصل بك لتأكيد السعر والوقت.')}</p>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-4 font-black text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                    {t('Confirm Request', 'Confirmer la Demande', 'تأكيد الطلب')}
                  </button>
                </div>
              </form>
            </div>

            {/* Features & Map */}
            <div className="w-full lg:w-1/2" id="contact">
              <div className="mb-10">
                <h3 className="text-2xl font-black mb-6">{t('Why Choose Us?', 'Pourquoi nous choisir ?', 'لماذا تختارنا؟')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 text-green-600 p-3 rounded-full"><CheckCircle2 className="w-6 h-6"/></div>
                    <div>
                      <h4 className="font-bold">{t('No Upfront Payment', 'Aucun paiement à l\'avance', 'لا يوجد دفع مسبق')}</h4>
                      <p className="text-sm text-slate-600">{t('Pay safely in cash after the job is completed.', 'Payez en toute sécurité en espèces après l\'intervention.', 'ادفع بأمان نقداً بعد اكتمال العمل.')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Shield className="w-6 h-6"/></div>
                    <div>
                      <h4 className="font-bold">{t('Verified Professionals', 'Professionnels Vérifiés', 'محترفون معتمدون')}</h4>
                      <p className="text-sm text-slate-600">{t('Our technicians are background checked and highly skilled.', 'Nos techniciens sont vérifiés et hautement qualifiés.', 'الفنيون لدينا مدققون وذوو مهارات عالية.')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-[300px] relative">
                 <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
                   <div className="flex items-center gap-2 font-bold text-slate-800">
                     <MapPin className="w-4 h-4 text-red-500" />
                     {t('Service Area: Casablanca', 'Zone: Casablanca', 'منطقة الخدمة: الدار البيضاء')}
                   </div>
                 </div>
                 {/* Google Maps Embed (Casablanca) */}
                 <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106376.56000572718!2d-7.669394541819777!3d33.57240323282208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca%2C%20Morocco!5e0!3m2!1sen!2sus!4v1715000000000!5m2!1sen!2sus" 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0 }} 
                   allowFullScreen={false} 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                   title="Coverage Area Map"
                 ></iframe>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Wrench className="w-6 h-6" />
            <h2 className="text-xl font-black tracking-tight">FixIt<span className="text-slate-500">Maroc</span></h2>
          </div>
          <p className="text-sm">© 2026 FixIt Maroc. {t('All rights reserved.', 'Tous droits réservés.', 'جميع الحقوق محفوظة.')}</p>
        </div>
      </footer>
    </div>
  );
}
