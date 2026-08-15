import React, { useState } from 'react';
import { 
  Car, MapPin, Calendar, Search, 
  Settings, Users, Shield, Zap,
  CheckCircle2, Menu, X, Star,
  Phone, Mail, ChevronLeft, ChevronRight
} from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export default function CarRentalDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'en'|'fr'|'ar'>('en');

  const t = (en: string, fr: string, ar: string) => {
    if (lang === 'fr') return fr;
    if (lang === 'ar') return ar;
    return en;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const preventScroll = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const fleet = [
    { 
      id: 1, 
      name: "Mercedes-Benz S-Class", 
      typeEn: "Luxury Sedan", typeFr: "Berline de Luxe", typeAr: "سيدان فاخرة",
      price: "$180", 
      img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=800&auto=format&fit=crop"
      ],
      specs: { seats: 4, transEn: "Auto", transFr: "Auto", transAr: "أوتوماتيك", doors: 4, fuelEn: "Petrol", fuelFr: "Essence", fuelAr: "بنزين", ac: true },
      prices: { tier1: "$170", tier2: "$150", tier3: "$130" }
    },
    { 
      id: 2, 
      name: "Porsche 911 Carrera", 
      typeEn: "Sports Coupe", typeFr: "Coupé Sport", typeAr: "كوبيه رياضية",
      price: "$250", 
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503376713356-20092c19c5c2?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop"
      ],
      specs: { seats: 2, transEn: "Auto", transFr: "Auto", transAr: "أوتوماتيك", doors: 2, fuelEn: "Petrol", fuelFr: "Essence", fuelAr: "بنزين", ac: true },
      prices: { tier1: "$230", tier2: "$200", tier3: "$180" }
    },
    { 
      id: 3, 
      name: "Range Rover Velar", 
      typeEn: "Premium SUV", typeFr: "SUV Premium", typeAr: "دفع رباعي ممتاز",
      price: "$150", 
      img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop"
      ],
      specs: { seats: 5, transEn: "Auto", transFr: "Auto", transAr: "أوتوماتيك", doors: 4, fuelEn: "Diesel", fuelFr: "Diesel", fuelAr: "ديزل", ac: true },
      prices: { tier1: "$140", tier2: "$120", tier3: "$100" }
    },
    { 
      id: 4, 
      name: "BMW X5 M", 
      typeEn: "Performance SUV", typeFr: "SUV Performant", typeAr: "دفع رباعي رياضي",
      price: "$165", 
      img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=800&auto=format&fit=crop"
      ],
      specs: { seats: 5, transEn: "Auto", transFr: "Auto", transAr: "أوتوماتيك", doors: 4, fuelEn: "Hybrid", fuelFr: "Hybride", fuelAr: "هجين", ac: true },
      prices: { tier1: "$155", tier2: "$140", tier3: "$120" }
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Top Bar */}
      <div className="hidden md:flex justify-between items-center px-8 py-2 border-b border-white/5 text-[11px] font-medium text-zinc-400 tracking-wider">
        <div className="flex gap-6">
          <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors" onClick={() => showToast('Support Phone')}><Phone className="w-3 h-3 text-amber-500" /> +1 (800) 123-4567</span>
          <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors" onClick={() => showToast('Email Support')}><Mail className="w-3 h-3 text-amber-500" /> support@luxedrive.com</span>
        </div>
        <div className="flex gap-6 items-center">
          <a href="#" className="hover:text-white transition-colors" onClick={preventScroll}>{t('FAQ', 'FAQ', 'الأسئلة الشائعة')}</a>
          <a href="#" className="hover:text-white transition-colors" onClick={preventScroll}>{t('Locations', 'Agences', 'الفروع')}</a>
          <div className="flex gap-2">
            <button onClick={() => setLang('en')} className={`hover:text-white transition-colors ${lang === 'en' ? 'text-amber-500 font-bold' : ''}`}>EN</button>
            <button onClick={() => setLang('fr')} className={`hover:text-white transition-colors ${lang === 'fr' ? 'text-amber-500 font-bold' : ''}`}>FR</button>
            <button onClick={() => setLang('ar')} className={`hover:text-white transition-colors ${lang === 'ar' ? 'text-amber-500 font-bold' : ''}`}>AR</button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => showToast('Home')}>
            <div className="bg-amber-500 text-black p-1.5 rounded uppercase font-black tracking-tighter text-xl leading-none">
              LX
            </div>
            <div className="leading-none">
              <h1 className="text-xl font-bold tracking-widest text-white uppercase">LuxeDrive</h1>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.2em] uppercase text-zinc-300">
            <a href="#" onClick={(e) => { preventScroll(e); showToast(t('Fleet', 'Flotte', 'الأسطول')); }} className="hover:text-amber-500 transition-colors">{t('Fleet', 'Flotte', 'الأسطول')}</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast(t('Offers', 'Offres', 'العروض')); }} className="hover:text-amber-500 transition-colors">{t('Offers', 'Offres', 'العروض')}</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast(t('Services', 'Services', 'الخدمات')); }} className="hover:text-amber-500 transition-colors">{t('Services', 'Services', 'الخدمات')}</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast(t('Contact', 'Contact', 'اتصل بنا')); }} className="hover:text-amber-500 transition-colors">{t('Contact', 'Contact', 'اتصل بنا')}</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
             <button onClick={() => showToast(t('Login', 'Connexion', 'دخول'))} className="text-xs font-bold tracking-widest uppercase hover:text-amber-500 transition-colors">
               {t('Sign In', 'Se connecter', 'تسجيل الدخول')}
             </button>
             <button onClick={() => showToast(t('Manage Booking', 'Gérer la réservation', 'إدارة الحجز'))} className="bg-white text-black hover:bg-amber-500 px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm">
               {t('Manage Booking', 'Gérer', 'إدارة الحجز')}
             </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="Luxury Car" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-end pb-20 gap-10">
          <div className="w-full md:w-2/3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
               {t('Premium Car Rental Service', 'Service de Location Premium', 'خدمة تأجير سيارات متميزة')}
             </div>
             <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 uppercase tracking-tight">
               {t('Command', 'Maîtrisez', 'تحكم في')}<br/>{t('The Road.', 'La Route.', 'الطريق.')}
             </h2>
             <p className="text-zinc-400 text-lg max-w-md mb-8 leading-relaxed">
               {t('Experience uncompromised luxury and performance. Choose from our exclusive fleet of premium vehicles for your next journey.', 'Découvrez un luxe et des performances sans compromis. Choisissez parmi notre flotte exclusive de véhicules premium pour votre prochain voyage.', 'استمتع بالفخامة والأداء بلا تنازلات. اختر من أسطولنا الحصري من السيارات الفاخرة لرحلتك القادمة.')}
             </p>
          </div>
        </div>
      </section>

      {/* Booking Widget (Overlapping Hero) */}
      <section className="relative z-20 max-w-6xl mx-auto px-6 -mt-32 mb-20">
        <div className="bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl backdrop-blur-md">
          <form className="flex flex-col md:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }); }}>
             <div className="flex-1 bg-[#1a1a1a] rounded-lg p-4 border border-white/5 relative group" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
               <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 group-hover:text-amber-500 transition-colors">
                 {t('Pick-up Location', 'Lieu de Prise', 'مكان الاستلام')}
               </label>
               <div className="flex items-center gap-3 text-white">
                 <MapPin className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 shrink-0" />
                 <select className="bg-transparent border-none outline-none w-full font-medium text-white cursor-pointer appearance-none truncate [&>option]:bg-[#111] [&>option]:text-white">
                   <option>{t('Casablanca Airport (CMN)', 'Aéroport Casablanca (CMN)', 'مطار الدار البيضاء (CMN)')}</option>
                   <option>{t('Marrakech Menara (RAK)', 'Aéroport Marrakech (RAK)', 'مطار مراكش (RAK)')}</option>
                   <option>{t('Rabat Sale (RBA)', 'Aéroport Rabat (RBA)', 'مطار الرباط (RBA)')}</option>
                   <option>{t('Agadir Al Massira (AGA)', 'Aéroport Agadir (AGA)', 'مطار أكادير (AGA)')}</option>
                 </select>
               </div>
             </div>
             
             <div className="flex-1 bg-[#1a1a1a] rounded-lg p-4 border border-white/5 relative group" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
               <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 group-hover:text-amber-500 transition-colors">
                 {t('Pick-up Date & Time', 'Date & Heure Prise', 'تاريخ ووقت الاستلام')}
               </label>
               <div className="flex items-center gap-3 text-white">
                 <Calendar className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 shrink-0" />
                 <input type="datetime-local" className="bg-transparent border-none outline-none w-full font-medium text-white cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" defaultValue={`${new Date().toISOString().split('T')[0]}T10:00`} />
               </div>
             </div>

             <div className="flex-1 bg-[#1a1a1a] rounded-lg p-4 border border-white/5 relative group" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
               <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 group-hover:text-amber-500 transition-colors">
                 {t('Drop-off Date & Time', 'Date & Heure Retour', 'تاريخ ووقت العودة')}
               </label>
               <div className="flex items-center gap-3 text-white">
                 <Calendar className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 shrink-0" />
                 <input type="datetime-local" className="bg-transparent border-none outline-none w-full font-medium text-white cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" defaultValue={`${new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]}T10:00`} />
               </div>
             </div>

             <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-lg font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
               <Search className="w-5 h-5" /> {t('Search', 'Rechercher', 'بحث')}
             </button>
          </form>
        </div>
      </section>

      {/* Featured Fleet */}
      <section id="fleet" className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <h3 className="text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-2">{t('Our Collection', 'Notre Collection', 'مجموعتنا')}</h3>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{t('Featured Vehicles', 'Véhicules Vedettes', 'السيارات المميزة')}</h2>
          </div>
          <button onClick={() => showToast(t('View all cars', 'Voir toutes les voitures', 'عرض جميع السيارات'))} className="hidden md:block text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors border-b border-zinc-700 pb-1">
            {t('View Entire Fleet', 'Voir Toute La Flotte', 'عرض الأسطول بأكمله')}
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleet.map((car) => (
            <div key={car.id} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden group hover:border-amber-500/30 transition-all cursor-pointer" onClick={() => { setSelectedCar(car); setCurrentImageIndex(0); }}>
              <div className="h-48 relative overflow-hidden bg-black p-6">
                <img src={car.img} alt={car.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase text-zinc-300">
                  {car.type}
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg mb-1 truncate">{car.name}</h4>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-amber-500 font-bold text-2xl leading-none">{car.price}</span>
                  <span className="text-zinc-500 text-xs font-medium">/ day</span>
                </div>
                
                <div className="flex justify-between text-zinc-400 mb-4 pb-4 border-b border-white/5">
                  <div className="flex flex-col items-center gap-1.5" title="Seats">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{car.specs.seats}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5" title="Transmission">
                    <Settings className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{t(car.specs.transEn, car.specs.transFr, car.specs.transAr)}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5" title="Doors">
                    <Car className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{car.specs.doors}</span>
                  </div>
                </div>

                <div className="text-[9px] text-zinc-400 mb-4 pb-4 border-b border-white/5 flex justify-center gap-2 font-medium tracking-wide">
                   <span><span className="text-zinc-600">{t('Fuel', 'Carburant', 'الوقود')}:</span> {t(car.specs.fuelEn, car.specs.fuelFr, car.specs.fuelAr)}</span> <span className="text-zinc-700">|</span> 
                   <span><span className="text-zinc-600">{t('A/C', 'Clim', 'مكيف')}:</span> {car.specs.ac ? t('Yes','Oui','نعم') : t('No','Non','لا')}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1 mb-6 text-center">
                   <div className="bg-white/5 p-1.5 rounded border border-white/5">
                      <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-0.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('3-7 Days','3 À 7 JR','من 3 إلى 7 أيام')}</div>
                      <div className="text-[11px] font-bold text-amber-500">{car.prices.tier1}</div>
                   </div>
                   <div className="bg-white/5 p-1.5 rounded border border-white/5">
                      <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-0.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('8-15 Days','8 À 15 JR','من 8 إلى 15 يوم')}</div>
                      <div className="text-[11px] font-bold text-amber-500">{car.prices.tier2}</div>
                   </div>
                   <div className="bg-white/5 p-1.5 rounded border border-white/5">
                      <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-0.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('16+ Days','16 JR+','16 يوم فأكثر')}</div>
                      <div className="text-[11px] font-bold text-amber-500">{car.prices.tier3}</div>
                   </div>
                </div>

                <button className="w-full bg-white/5 hover:bg-amber-500 text-white hover:text-black py-3 rounded text-xs font-bold tracking-widest uppercase transition-colors">
                  {t('Reserve Now', 'Réserver', 'احجز الآن')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <h3 className="text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-2">{t('The LuxeDrive Experience', 'L\'Expérience LuxeDrive', 'تجربة لوكس درايف')}</h3>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-16">{t('Why Choose Us', 'Pourquoi Nous Choisir', 'لماذا تختارنا')}</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-3">{t('Fully Insured', 'Assurance Complète', 'تأمين شامل')}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                {t('Drive with peace of mind. All our vehicles come with comprehensive premium insurance coverage.', 'Conduisez l\'esprit tranquille. Tous nos véhicules bénéficient d\'une couverture d\'assurance premium complète.', 'قد بكل راحة بال. جميع سياراتنا مزودة بتغطية تأمينية متميزة وشاملة.')}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-3">{t('Instant Booking', 'Réservation Instantanée', 'حجز فوري')}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                {t('No waiting in lines. Book your vehicle in seconds and have it ready when you arrive.', 'Pas d\'attente. Réservez votre véhicule en quelques secondes et il sera prêt à votre arrivée.', 'لا طوابير انتظار. احجز سيارتك في ثوانٍ وستكون جاهزة عند وصولك.')}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Phone className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-3">{t('24/7 Concierge', 'Conciergerie 24/7', 'دعم على مدار 24/7')}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                {t('Our dedicated support team is available around the clock to assist you with any requests.', 'Notre équipe d\'assistance dédiée est disponible 24h/24 pour répondre à toutes vos demandes.', 'فريق الدعم المخصص لدينا متاح على مدار الساعة لمساعدتك في أي طلبات.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 max-w-7xl mx-auto px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="grid md:grid-cols-4 gap-12 mb-16 border-b border-white/5 pb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-amber-500 text-black p-1.5 rounded uppercase font-black tracking-tighter text-xl leading-none">
                LX
              </div>
              <div className="leading-none">
                <h2 className="text-xl font-bold tracking-widest text-white uppercase">LuxeDrive</h2>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              {t('Redefining luxury car rentals with an exclusive fleet and unparalleled service. Your journey begins here.', 'Redéfinir la location de voitures de luxe avec une flotte exclusive et un service inégalé. Votre voyage commence ici.', 'إعادة تعريف تأجير السيارات الفاخرة مع أسطول حصري وخدمة لا مثيل لها. رحلتك تبدأ هنا.')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 transition-colors" onClick={preventScroll}><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 transition-colors" onClick={preventScroll}><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 transition-colors" onClick={preventScroll}><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6">{t('Quick Links', 'Liens Rapides', 'روابط سريعة')}</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('Our Fleet', 'Notre Flotte', 'أسطولنا')}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('Special Offers', 'Offres Spéciales', 'عروض خاصة')}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('Locations', 'Agences', 'الفروع')}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('About Us', 'À Propos', 'معلومات عنا')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6">{t('Services', 'Services', 'الخدمات')}</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('Chauffeur Service', 'Service Chauffeur', 'خدمة السائق')}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('Airport Transfer', 'Transfert Aéroport', 'نقل المطار')}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('Wedding Cars', 'Voitures de Mariage', 'سيارات الزفاف')}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>{t('Corporate Rentals', 'Locations d\'Entreprise', 'تأجير الشركات')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6">{t('Newsletter', 'Newsletter', 'النشرة الإخبارية')}</h4>
            <p className="text-zinc-400 text-sm mb-4">{t('Subscribe for exclusive offers and updates.', 'Abonnez-vous pour des offres exclusives.', 'اشترك للحصول على عروض وتحديثات حصرية.')}</p>
            <div className="flex">
              <input type="email" placeholder={t('Email Address', 'Adresse Email', 'البريد الإلكتروني')} className={`bg-[#111] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 w-full ${lang === 'ar' ? 'rounded-r' : 'rounded-l'}`} />
              <button onClick={() => showToast(t('Subscribed!', 'Abonné!', 'تم الاشتراك!'))} className={`bg-amber-500 text-black px-4 font-bold uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-colors ${lang === 'ar' ? 'rounded-l' : 'rounded-r'}`}>
                {t('Join', 'Rejoindre', 'اشترك')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} LuxeDrive. {t('All rights reserved.', 'Tous droits réservés.', 'جميع الحقوق محفوظة.')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300" onClick={preventScroll}>{t('Privacy Policy', 'Politique de Confidentialité', 'سياسة الخصوصية')}</a>
            <a href="#" className="hover:text-zinc-300" onClick={preventScroll}>{t('Terms of Service', 'Conditions d\'Utilisation', 'شروط الخدمة')}</a>
          </div>
        </div>
      </footer>

      {/* Car Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedCar(null)}></div>
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative z-10 animate-in zoom-in-95 shadow-2xl">
             <button onClick={() => setSelectedCar(null)} className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur rounded-full p-2 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
             </button>
             <div className="w-full md:w-1/2 relative bg-black flex flex-col shrink-0">
                <div className="flex-1 relative min-h-[350px] md:min-h-[500px] w-full">
                  <img src={selectedCar.images[currentImageIndex]} alt={selectedCar.name} className="absolute inset-0 w-full h-full object-contain bg-[#050505]" />
                  <button onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : selectedCar.images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-amber-500 hover:text-black transition-colors z-20 border border-white/10">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={() => setCurrentImageIndex((prev) => (prev < selectedCar.images.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-amber-500 hover:text-black transition-colors z-20 border border-white/10">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex gap-2 p-4 bg-[#0a0a0a] border-t border-white/5 overflow-x-auto snap-x">
                  {selectedCar.images.map((img: string, idx: number) => (
                     <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-14 rounded-md overflow-hidden border-2 shrink-0 transition-all snap-start ${currentImageIndex === idx ? 'border-amber-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                       <img src={img} className="w-full h-full object-cover" />
                     </button>
                  ))}
                </div>
             </div>
             <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
                <div className="text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-2">{t(selectedCar.typeEn, selectedCar.typeFr, selectedCar.typeAr)}</div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">{selectedCar.name}</h2>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold leading-none">{selectedCar.price}</span>
                  <span className="text-zinc-500 text-sm font-medium">/ {t('day', 'jour', 'يوم')}</span>
                </div>
                
                <div className="flex gap-4 mb-8">
                   <div className="bg-white/5 px-4 py-2 rounded border border-white/5 text-center flex-1">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('3-7 Days','3 À 7 JR','من 3 إلى 7 أيام')}</div>
                      <div className="text-sm font-bold text-amber-500">{selectedCar.prices.tier1}</div>
                   </div>
                   <div className="bg-white/5 px-4 py-2 rounded border border-white/5 text-center flex-1">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('8-15 Days','8 À 15 JR','من 8 إلى 15 يوم')}</div>
                      <div className="text-sm font-bold text-amber-500">{selectedCar.prices.tier2}</div>
                   </div>
                   <div className="bg-white/5 px-4 py-2 rounded border border-white/5 text-center flex-1">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('16+ Days','16 JR+','16 يوم فأكثر')}</div>
                      <div className="text-sm font-bold text-amber-500">{selectedCar.prices.tier3}</div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <Users className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t('Seats', 'Sièges', 'المقاعد')}</div>
                      <div className="text-sm font-bold">{selectedCar.specs.seats} {t('Adults', 'Adultes', 'أشخاص')}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <Settings className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t('Transmission', 'Vitesse', 'ناقل الحركة')}</div>
                      <div className="text-sm font-bold">{t(selectedCar.specs.transEn, selectedCar.specs.transFr, selectedCar.specs.transAr)}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <Car className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t('Doors', 'Portes', 'الأبواب')}</div>
                      <div className="text-sm font-bold">{selectedCar.specs.doors}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t('Insurance', 'Assurance', 'تأمين')}</div>
                      <div className="text-sm font-bold">{t('Included', 'Inclus', 'مشمول')}</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-zinc-400 mb-8 bg-white/5 p-4 rounded-lg border border-white/5 flex flex-wrap gap-x-6 gap-y-2 justify-center font-medium tracking-wide">
                   <span><span className="text-zinc-600">{t('Fuel', 'Carburant', 'الوقود')}:</span> <span className="text-white">{t(selectedCar.specs.fuelEn, selectedCar.specs.fuelFr, selectedCar.specs.fuelAr)}</span></span>
                   <span className="text-zinc-700">|</span> 
                   <span><span className="text-zinc-600">{t('A/C', 'Climatisé', 'مكيف')}:</span> <span className="text-white">{selectedCar.specs.ac ? t('Yes','Oui','نعم') : t('No','Non','لا')}</span></span>
                </div>

                <button onClick={() => { setSelectedCar(null); showToast(t(`Reservation started for ${selectedCar.name}`, `Réservation commencée pour ${selectedCar.name}`, `بدأ الحجز لـ ${selectedCar.name}`)); }} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 font-bold tracking-widest uppercase transition-colors rounded-lg flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" /> {t('Book This Vehicle', 'Réserver ce véhicule', 'احجز هذه السيارة')}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[300] bg-white text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
