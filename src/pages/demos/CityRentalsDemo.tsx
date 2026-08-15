import React, { useState, useEffect } from 'react';
import {
  Car, MapPin, Calendar, Search, Clock,
  Settings, Users, CheckCircle2, Menu, X, Shield, Phone, Mail,
  ShoppingCart, Fuel, Navigation, Trash2, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function CityRentalsDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [lang, setLang] = useState<'en' | 'fr' | 'ar'>('en');
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);

  const t = (en: string, fr: string, ar: string) => {
    if (lang === 'fr') return fr;
    if (lang === 'ar') return ar;
    return en;
  };
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const preventScroll = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Booking widget state
  const todayStr = new Date().toISOString().split('T')[0];
  const inThreeDaysStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [pickupLocation, setPickupLocation] = useState('downtown');
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffDate, setDropoffDate] = useState(inThreeDaysStr);
  const [dropoffTime, setDropoffTime] = useState('10:00');

  // Geolocation state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Fleet filters
  const [filterTrans, setFilterTrans] = useState<'all' | 'Auto' | 'Manual'>('all');
  const [filterFuel, setFilterFuel] = useState<'all' | 'Petrol' | 'Diesel' | 'Electric'>('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Contact Modal
  const [contactCar, setContactCar] = useState<any | null>(null);

  const stations: Record<string, { nameEn: string; nameFr: string; nameAr: string; lat: number; lng: number }> = {
    downtown: { nameEn: 'Downtown Station', nameFr: 'Station Centre-Ville', nameAr: 'محطة وسط المدينة', lat: 33.5898, lng: -7.6116 },
    airport: { nameEn: 'Airport Terminal 1', nameFr: 'Aéroport Terminal 1', nameAr: 'المطار - المحطة 1', lat: 33.3675, lng: -7.5898 },
    central: { nameEn: 'Central Station', nameFr: 'Gare Centrale', nameAr: 'المحطة المركزية', lat: 33.5950, lng: -7.6187 },
    north: { nameEn: 'North City Hub', nameFr: 'Pôle Nord de la Ville', nameAr: 'محور شمال المدينة', lat: 33.6100, lng: -7.6000 },
  };

  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocateError(t('Geolocation not supported', 'Géolocalisation non supportée', 'تحديد الموقع غير مدعوم'));
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        let nearestCode = 'downtown';
        let nearestDist = Infinity;
        Object.entries(stations).forEach(([code, s]) => {
          const d = haversine(latitude, longitude, s.lat, s.lng);
          if (d < nearestDist) { nearestDist = d; nearestCode = code; }
        });
        setPickupLocation(nearestCode);
        setLocating(false);
        const s = stations[nearestCode];
        showToast(t(
          `Located! Nearest station: ${t(s.nameEn, s.nameFr, s.nameAr)} (${nearestDist.toFixed(1)} km)`,
          `Localisé ! Station la plus proche : ${t(s.nameEn, s.nameFr, s.nameAr)} (${nearestDist.toFixed(1)} km)`,
          `تم تحديد الموقع! أقرب محطة: ${t(s.nameEn, s.nameFr, s.nameAr)} (${nearestDist.toFixed(1)} كم)`
        ));
      },
      () => {
        setLocating(false);
        setLocateError(t('Unable to get your location', 'Impossible d\'obtenir votre position', 'تعذر تحديد موقعك'));
      }
    );
  };

  const fleet = [
    {
      id: 1,
      name: "Fiat 500 Hybrid",
      typeEn: "Compact City", typeFr: "Citadine Compacte", typeAr: "سيارة مدينة صغيرة",
      price: "$45",
      img: "https://images.unsplash.com/photo-1617469165786-8007eda3caa7?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 4, transEn: "Manual", transFr: "Manuelle", transAr: "يدوي", doors: 3, fuelEn: "Petrol", fuelFr: "Essence", fuelAr: "بنزين" },
      available: true
    },
    {
      id: 2,
      name: "VW Golf 8",
      typeEn: "Hatchback", typeFr: "Compacte", typeAr: "هاتشباك",
      price: "$60",
      img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, transEn: "Auto", transFr: "Auto", transAr: "أوتوماتيك", doors: 5, fuelEn: "Diesel", fuelFr: "Diesel", fuelAr: "ديزل" },
      available: true
    },
    {
      id: 3,
      name: "Tesla Model 3",
      typeEn: "Electric Sedan", typeFr: "Berline Électrique", typeAr: "سيدان كهربائية",
      price: "$90",
      img: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, transEn: "Auto", transFr: "Auto", transAr: "أوتوماتيك", doors: 4, fuelEn: "Electric", fuelFr: "Électrique", fuelAr: "كهربائية" },
      available: false
    }
  ];

  const filteredFleet = fleet.filter(car => {
    if (filterTrans !== 'all' && car.specs.transEn !== filterTrans) return false;
    if (filterFuel !== 'all' && car.specs.fuelEn !== filterFuel) return false;
    if (availableOnly && car.available === false) return false;
    return true;
  });

  const parsePrice = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));

  const rentalDays = () => {
    const start = new Date(pickupDate).getTime();
    const end = new Date(dropoffDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 1;
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIdx(prev => (prev + 1) % fleet.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);



  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">

      {/* Top Bar */}
      <div className="bg-blue-600 text-white text-xs py-2 px-6 flex justify-between items-center font-medium relative">
        <div className="flex gap-4 z-10">
           <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +1 (800) 123-CITY</span>
           <span className="hidden md:flex items-center gap-1.5"><Mail className="w-3 h-3" /> hello@cityrentals.com</span>
        </div>
        <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 whitespace-nowrap w-full text-center pointer-events-none">
           <span className="pointer-events-auto">{t('Free cancellation up to 24 hours before pick-up!', 'Annulation gratuite jusqu\'à 24h avant la prise en charge !', 'إلغاء مجاني حتى 24 ساعة قبل الاستلام!')}</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => showToast('Home')}>
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">CityRentals</h1>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            <a href="#fleet" onClick={(e) => { preventScroll(e); document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">{t('Our Vehicles', 'Nos Véhicules', 'سياراتنا')}</a>
            <a href="#locations" onClick={(e) => { preventScroll(e); document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">{t('Locations', 'Agences', 'الفروع')}</a>
            <a href="#offers" onClick={(e) => { preventScroll(e); document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">{t('Offers', 'Offres', 'العروض')}</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg" dir="ltr">
               <button onClick={() => setLang('en')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>EN</button>
               <button onClick={() => setLang('fr')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${lang === 'fr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>FR</button>
               <button onClick={() => setLang('ar')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${lang === 'ar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>AR</button>
             </div>
             <div className="w-px h-6 bg-slate-200 mx-1"></div>
             <button onClick={() => setShowAuth('login')} className="font-bold text-slate-600 hover:text-blue-600 transition-colors">{t('Log In', 'Connexion', 'دخول')}</button>
             <button onClick={() => setShowAuth('signup')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-blue-200 transition-all">{t('Sign Up', 'Inscription', 'إنشاء حساب')}</button>
          </div>

          <div className="flex md:hidden items-center gap-4 text-slate-800">
            <button
              onClick={() => { if (lang === 'en') setLang('fr'); else if (lang === 'fr') setLang('ar'); else setLang('en'); }}
              className="text-[10px] font-bold border border-slate-300 w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
            >
              {lang.toUpperCase()}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-6 flex flex-col gap-6 font-semibold text-slate-600 text-center" dir={dir}>
            <a href="#fleet" onClick={(e) => { preventScroll(e); document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="hover:text-blue-600 transition-colors">{t('Our Vehicles', 'Nos Véhicules', 'سياراتنا')}</a>
            <a href="#locations" onClick={(e) => { preventScroll(e); document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="hover:text-blue-600 transition-colors">{t('Locations', 'Agences', 'الفروع')}</a>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => { setShowAuth('login'); setIsMobileMenuOpen(false); }} className="font-bold text-slate-600">{t('Log In', 'Connexion', 'دخول')}</button>
              <button onClick={() => { setShowAuth('signup'); setIsMobileMenuOpen(false); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold">{t('Sign Up', 'Inscription', 'إنشاء حساب')}</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-white pb-20 pt-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-0 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-1/2 animate-fade-in-up" dir={dir}>
             <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
               {t('Urban Mobility Made Easy', 'Mobilité Urbaine Simplifiée', 'تنقل حضري بسهولة')}
             </div>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
               {t('Navigate the city', 'Naviguez en ville', 'تنقل في المدينة')}<br/>{t('with', 'en toute', 'بكل')} <span className="text-blue-600">{t('ease.', 'simplicité.', 'سهولة.')}</span>
             </h2>
             <p className="text-slate-500 text-lg mb-8">
               {t('Affordable, eco-friendly, and convenient car rentals for your daily urban adventures.', 'Location de voitures abordable, écologique et pratique pour vos déplacements quotidiens.', 'كراء سيارات ميسور الثمن وصديق للبيئة ومريح لتنقلاتك اليومية في المدينة.')}
             </p>

             {/* Booking form inline */}
             <form className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative">
                   <label className="block text-xs font-bold text-slate-400 mb-1">{t('Pick-up & Drop-off', 'Prise & Retour', 'الاستلام والتسليم')}</label>
                   <div className="flex items-center gap-2 text-slate-700 font-bold">
                     <MapPin className="w-4 h-4 text-blue-500 shrink-0"/>
                     <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="bg-transparent border-none outline-none w-full font-bold text-slate-700 cursor-pointer appearance-none">
                       {Object.entries(stations).map(([code, s]) => (
                         <option key={code} value={code}>{t(s.nameEn, s.nameFr, s.nameAr)}</option>
                       ))}
                     </select>
                     <button
                       type="button"
                       onClick={locateMe}
                       title={t('Use my location', 'Utiliser ma position', 'استخدم موقعي')}
                       disabled={locating}
                       className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                     >
                       <Navigation className={`w-4 h-4 ${locating ? 'animate-pulse' : ''}`} />
                     </button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative">
                      <label className="block text-xs font-bold text-slate-400 mb-1">{t('Pick-up Date & Time', 'Date & Heure de Prise', 'تاريخ ووقت الاستلام')}</label>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0"/>
                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="bg-transparent border-none outline-none w-1/2 font-bold text-slate-700 cursor-pointer" />
                        <span className="text-slate-300">|</span>
                        <Clock className="w-4 h-4 text-blue-500 shrink-0"/>
                        <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="bg-transparent border-none outline-none w-1/2 font-bold text-slate-700 cursor-pointer" />
                      </div>
                   </div>
                   <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative">
                      <label className="block text-xs font-bold text-slate-400 mb-1">{t('Drop-off Date & Time', 'Date & Heure de Retour', 'تاريخ ووقت الإرجاع')}</label>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0"/>
                        <input type="date" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} className="bg-transparent border-none outline-none w-1/2 font-bold text-slate-700 cursor-pointer" />
                        <span className="text-slate-300">|</span>
                        <Clock className="w-4 h-4 text-blue-500 shrink-0"/>
                        <input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="bg-transparent border-none outline-none w-1/2 font-bold text-slate-700 cursor-pointer" />
                      </div>
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5">
                  <Search className="w-5 h-5"/> {t('Find a Car', 'Trouver une Voiture', 'ابحث عن سيارة')}
                </button>

                {locateError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> {locateError}
                  </div>
                )}

                {userCoords && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-44">
                    <iframe
                      title="map"
                      className="w-full h-full"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${userCoords.lng - 0.08}%2C${userCoords.lat - 0.06}%2C${userCoords.lng + 0.08}%2C${userCoords.lat + 0.06}&layer=mapnik&marker=${userCoords.lat}%2C${userCoords.lng}`}
                    />
                  </div>
                )}
             </form>
          </div>
          <div className="w-full md:w-1/2 flex flex-col relative">
             <div className="relative h-[350px] w-full">
               <div className="absolute inset-0 bg-blue-100 rounded-[3rem] transform rotate-3 scale-95 transition-all duration-500"></div>
               
               {/* Slider Images */}
               <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl transform -rotate-2 group">
                  {fleet.map((car, idx) => (
                    <img 
                      key={car.id}
                      src={car.img} 
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${idx === heroSlideIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                      alt={car.name} 
                    />
                  ))}
                  
                  {/* Arrow Controls */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={() => setHeroSlideIdx(prev => prev === 0 ? fleet.length - 1 : prev - 1)}
                       className="bg-white/80 backdrop-blur hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 border border-white/50"
                     >
                       <ChevronLeft className="w-5 h-5"/>
                     </button>
                     <button 
                       onClick={() => setHeroSlideIdx(prev => (prev + 1) % fleet.length)}
                       className="bg-white/80 backdrop-blur hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 border border-white/50"
                     >
                       <ChevronRight className="w-5 h-5"/>
                     </button>
                  </div>
               </div>
             </div>
             
             {/* Slide Info Card (Below Image) */}
             <div className="bg-white rounded-2xl p-4 md:p-5 shadow-xl border border-slate-100 mx-auto w-[90%] md:w-[85%] -mt-8 relative z-30 transition-all duration-500 flex justify-between items-center" dir={dir}>
                <div>
                   <h3 className="font-black text-slate-800 text-lg leading-tight mb-0.5">{fleet[heroSlideIdx].name}</h3>
                   <div className="text-[10px] md:text-xs text-slate-500 font-bold mb-2">{t(fleet[heroSlideIdx].typeEn, fleet[heroSlideIdx].typeFr, fleet[heroSlideIdx].typeAr)}</div>
                   
                   <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-slate-600">
                     <div className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-blue-500 shrink-0"/> {t(fleet[heroSlideIdx].specs.transEn, fleet[heroSlideIdx].specs.transFr, fleet[heroSlideIdx].specs.transAr)}</div>
                     <div className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-blue-500 shrink-0"/> {t(fleet[heroSlideIdx].specs.fuelEn, fleet[heroSlideIdx].specs.fuelFr, fleet[heroSlideIdx].specs.fuelAr)}</div>
                     <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500 shrink-0"/> {fleet[heroSlideIdx].specs.seats}</div>
                   </div>
                </div>

                <div className="flex flex-col items-end border-l border-slate-100 pl-4 ml-2">
                   <div className="mb-2 text-right">
                     <span className="text-blue-600 font-black text-xl md:text-2xl tracking-tighter">{fleet[heroSlideIdx].price}</span>
                     <span className="text-[9px] md:text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider block md:inline">{t('/ day', '/ jour', '/ يوم')}</span>
                   </div>
                   <button onClick={() => { document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors shadow-md flex items-center gap-2 text-xs md:text-sm font-bold">
                     <Car className="w-4 h-4 hidden md:block"/> {t('Book', 'Réserver', 'احجز')}
                   </button>
                </div>
             </div>
             
             {/* Dots */}
             <div className="flex justify-center gap-2.5 mt-6 z-20">
                {fleet.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setHeroSlideIdx(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 shadow-sm border border-black/5 ${idx === heroSlideIdx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-blue-400'}`}
                  />
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section id="fleet" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12" dir={dir}>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t('Our Popular City Cars', 'Nos Voitures les Plus Populaires', 'سياراتنا الأكثر طلبًا')}</h2>
          <p className="text-slate-500">{t('Compact, fuel-efficient, and easy to park anywhere.', 'Compactes, économiques, et faciles à garer partout.', 'صغيرة الحجم واقتصادية وسهلة الركن في أي مكان.')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-12 text-xs" dir={dir}>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            <select value={filterTrans} onChange={(e) => setFilterTrans(e.target.value as any)} className="bg-transparent outline-none font-bold text-slate-600 cursor-pointer">
              <option value="all">{t('All Transmissions', 'Toutes Transmissions', 'كل ناقل الحركة')}</option>
              <option value="Auto">{t('Automatic', 'Automatique', 'أوتوماتيك')}</option>
              <option value="Manual">{t('Manual', 'Manuelle', 'يدوي')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Fuel className="w-3.5 h-3.5 text-blue-600" />
            <select value={filterFuel} onChange={(e) => setFilterFuel(e.target.value as any)} className="bg-transparent outline-none font-bold text-slate-600 cursor-pointer">
              <option value="all">{t('All Fuel Types', 'Tous Carburants', 'كل أنواع الوقود')}</option>
              <option value="Petrol">{t('Petrol', 'Essence', 'بنزين')}</option>
              <option value="Diesel">{t('Diesel', 'Diesel', 'ديزل')}</option>
              <option value="Electric">{t('Electric', 'Électrique', 'كهربائية')}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm cursor-pointer select-none">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="accent-blue-600 w-3.5 h-3.5" />
            <span className="font-bold text-slate-600">{t('Available Only', 'Disponible Seulement', 'المتوفر فقط')}</span>
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {filteredFleet.map((car) => (
            <div key={car.id} className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative ${car.available === false ? 'opacity-70' : ''}`} onClick={() => setSelectedCar(car)}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{car.name}</h3>
                  <p className="text-sm font-medium text-blue-600">{t(car.typeEn, car.typeFr, car.typeAr)}</p>
                </div>
                <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                  {car.price} <span className="text-slate-400 font-normal">/{t('day', 'jour', 'يوم')}</span>
                </div>
              </div>
              <div className="h-48 relative mb-6">
                 <img src={car.img} alt={car.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300" />
                 {car.available === false && (
                   <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                     {t('Unavailable', 'Indisponible', 'غير متوفر')}
                   </div>
                 )}
              </div>
              <div className="flex justify-between text-slate-500 text-sm mb-4 px-2">
                 <div className="flex items-center gap-1.5 font-medium"><Users className="w-4 h-4"/> {car.specs.seats}</div>
                 <div className="flex items-center gap-1.5 font-medium"><Settings className="w-4 h-4"/> {t(car.specs.transEn, car.specs.transFr, car.specs.transAr)}</div>
                 <div className="flex items-center gap-1.5 font-medium"><Car className="w-4 h-4"/> {car.specs.doors}</div>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm mb-6 font-medium">
                <Fuel className="w-4 h-4" /> {t(car.specs.fuelEn, car.specs.fuelFr, car.specs.fuelAr)}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setContactCar(car); }}
                disabled={car.available === false}
                className="w-full bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:text-slate-400 disabled:cursor-not-allowed py-3 rounded-xl font-bold transition-colors"
              >
                {car.available === false ? t('Not Available', 'Indisponible', 'غير متوفر') : t('Book Now', 'Réserver', 'احجز الآن')}
              </button>
            </div>
          ))}
          {filteredFleet.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400 text-sm font-medium">
              {t('No vehicles match your filters.', 'Aucun véhicule ne correspond à vos filtres.', 'لا توجد سيارات مطابقة لعوامل التصفية.')}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="locations" className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center" dir={dir}>
           <div>
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <Shield className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-3">{t('Basic Insurance Included', 'Assurance de Base Incluse', 'تأمين أساسي مشمول')}</h3>
             <p className="text-slate-400">{t('Every rental includes basic collision damage waiver for your peace of mind.', 'Chaque location inclut une couverture de base contre les dommages.', 'كل عملية كراء تشمل تغطية أساسية ضد الأضرار لراحة بالك.')}</p>
           </div>
           <div>
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <MapPin className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-3">{t('20+ City Locations', '20+ Agences en Ville', 'أكثر من 20 فرعًا بالمدينة')}</h3>
             <p className="text-slate-400">{t('Pick up and drop off your car at any of our convenient downtown stations.', 'Prenez et rendez votre voiture dans l\'une de nos stations pratiques.', 'استلم وسلم سيارتك في أي من محطاتنا المريحة وسط المدينة.')}</p>
           </div>
           <div>
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-3">{t('Zero Hidden Fees', 'Zéro Frais Cachés', 'بدون رسوم خفية')}</h3>
             <p className="text-slate-400">{t('What you see is what you pay. No surprises at the rental counter.', 'Ce que vous voyez est ce que vous payez. Aucune surprise.', 'ما تراه هو ما تدفعه. بدون أي مفاجآت عند الاستلام.')}</p>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} CityRentals. {t('All rights reserved.', 'Tous droits réservés.', 'جميع الحقوق محفوظة.')}</p>
        </div>
      </footer>

      {/* Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCar(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 p-8" dir={dir}>
             <button onClick={() => setSelectedCar(null)} className="absolute top-6 right-6 z-20 bg-slate-100 rounded-full p-2 text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
             </button>
             <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedCar.name}</h2>
             <p className="text-blue-600 font-bold mb-6">{selectedCar.price} / {t('day', 'jour', 'يوم')}</p>
             <div className="h-64 relative mb-6 rounded-2xl overflow-hidden bg-slate-100">
                <img src={selectedCar.img} alt={selectedCar.name} className="w-full h-full object-cover" />
             </div>
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                 <Settings className="w-5 h-5 text-blue-600" />
                 <div>
                   <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">{t('Transmission', 'Vitesse', 'ناقل الحركة')}</div>
                   <div className="text-sm font-bold text-slate-800">{t(selectedCar.specs.transEn, selectedCar.specs.transFr, selectedCar.specs.transAr)}</div>
                 </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                 <Fuel className="w-5 h-5 text-blue-600" />
                 <div>
                   <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">{t('Fuel', 'Carburant', 'الوقود')}</div>
                   <div className="text-sm font-bold text-slate-800">{t(selectedCar.specs.fuelEn, selectedCar.specs.fuelFr, selectedCar.specs.fuelAr)}</div>
                 </div>
               </div>
             </div>
             {selectedCar.available === false && (
               <div className="flex items-center gap-2 text-red-500 text-xs font-bold mb-3 justify-center">
                 <AlertCircle className="w-4 h-4" /> {t('Not available for the selected dates', 'Non disponible pour ces dates', 'غير متوفر في هذه التواريخ')}
               </div>
             )}
             <button
               onClick={() => { setContactCar(selectedCar); }}
               disabled={selectedCar.available === false}
               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-colors"
             >
               {t('Confirm Booking', 'Confirmer la Réservation', 'تأكيد الحجز')}
             </button>
          </div>
        </div>
      )}

      {/* Contact Options Modal */}
      {contactCar && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setContactCar(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 p-8 text-center" dir={dir}>
             <button onClick={() => setContactCar(null)} className="absolute top-4 right-4 z-20 bg-slate-100 rounded-full p-2 text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
             </button>
             <h3 className="text-xl font-black text-slate-900 mb-2">{t('Confirm Booking', 'Confirmer la Réservation', 'تأكيد الحجز')}</h3>
             <p className="text-slate-500 text-sm mb-6">{t('Choose how you want to confirm your booking for', 'Choisissez comment confirmer votre réservation pour', 'اختر كيف تريد تأكيد حجزك لـ')} <strong>{contactCar.name}</strong>:</p>
             
             <div className="flex flex-col gap-3">
               <a 
                 href={`https://wa.me/1800123CITY?text=${encodeURIComponent(`Hello, I want to book ${contactCar.name}.`)}`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-colors"
                 onClick={() => { setContactCar(null); setSelectedCar(null); }}
               >
                 WhatsApp
               </a>
               <a 
                 href="tel:+1800123CITY" 
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-colors"
                 onClick={() => { setContactCar(null); setSelectedCar(null); }}
               >
                 <Phone className="w-5 h-5" /> {t('Call Us', 'Appelez-nous', 'اتصل بنا')}
               </a>
             </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAuth(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 p-8" dir={dir}>
             <button onClick={() => setShowAuth(null)} className="absolute top-6 right-6 z-20 bg-slate-100 rounded-full p-2 text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
             </button>
             <h2 className="text-2xl font-black text-slate-900 mb-6">{showAuth === 'login' ? t('Welcome Back', 'Bon Retour', 'مرحبًا بعودتك') : t('Create Account', 'Créer un Compte', 'إنشاء حساب')}</h2>

             <form onSubmit={(e) => { e.preventDefault(); setShowAuth(null); showToast(t(`Successfully ${showAuth === 'login' ? 'logged in' : 'signed up'}!`, `${showAuth === 'login' ? 'Connexion' : 'Inscription'} réussie !`, `${showAuth === 'login' ? 'تم تسجيل الدخول' : 'تم إنشاء الحساب'} بنجاح!`)); }} className="flex flex-col gap-4">
                {showAuth === 'signup' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('Full Name', 'Nom Complet', 'الاسم الكامل')}</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="John Doe" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('Email Address', 'Adresse Email', 'البريد الإلكتروني')}</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="hello@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('Password', 'Mot de Passe', 'كلمة المرور')}</label>
                  <input type="password" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 mt-2 transition-colors">
                  {showAuth === 'login' ? t('Log In', 'Connexion', 'دخول') : t('Sign Up', 'Inscription', 'إنشاء حساب')}
                </button>
             </form>
             <div className="mt-6 text-center text-sm font-medium text-slate-500">
                {showAuth === 'login' ? t("Don't have an account? ", "Vous n'avez pas de compte ? ", "ليس لديك حساب؟ ") : t("Already have an account? ", "Vous avez déjà un compte ? ", "لديك حساب بالفعل؟ ")}
                <button onClick={() => setShowAuth(showAuth === 'login' ? 'signup' : 'login')} className="text-blue-600 font-bold hover:underline">
                  {showAuth === 'login' ? t('Sign Up', 'Inscription', 'إنشاء حساب') : t('Log In', 'Connexion', 'دخول')}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[300] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
