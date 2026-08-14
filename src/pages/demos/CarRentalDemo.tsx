import React, { useState } from 'react';
import { 
  Car, MapPin, Calendar, Search, 
  Settings, Users, Shield, Zap,
  CheckCircle2, Menu, X, Star,
  Phone, Mail, Instagram, Facebook, Twitter
} from 'lucide-react';

export default function CarRentalDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      type: "Luxury Sedan", 
      price: "$180", 
      img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 4, trans: "Auto", doors: 4 }
    },
    { 
      id: 2, 
      name: "Porsche 911 Carrera", 
      type: "Sports Coupe", 
      price: "$250", 
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 2, trans: "Auto", doors: 2 }
    },
    { 
      id: 3, 
      name: "Range Rover Velar", 
      type: "Premium SUV", 
      price: "$150", 
      img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, trans: "Auto", doors: 4 }
    },
    { 
      id: 4, 
      name: "BMW X5 M", 
      type: "Performance SUV", 
      price: "$165", 
      img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, trans: "Auto", doors: 4 }
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
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors" onClick={preventScroll}>FAQ</a>
          <a href="#" className="hover:text-white transition-colors" onClick={preventScroll}>Locations</a>
          <a href="#" className="hover:text-white transition-colors" onClick={preventScroll}>Language: EN</a>
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
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Fleet'); }} className="hover:text-amber-500 transition-colors">Fleet</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Offers'); }} className="hover:text-amber-500 transition-colors">Offers</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Services'); }} className="hover:text-amber-500 transition-colors">Services</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Contact'); }} className="hover:text-amber-500 transition-colors">Contact</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
             <button onClick={() => showToast('Login')} className="text-xs font-bold tracking-widest uppercase hover:text-amber-500 transition-colors">
               Sign In
             </button>
             <button onClick={() => showToast('Manage Booking')} className="bg-white text-black hover:bg-amber-500 px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm">
               Manage Booking
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
          <div className="w-full md:w-2/3">
             <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
               Premium Car Rental Service
             </div>
             <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 uppercase tracking-tight">
               Command<br/>The Road.
             </h2>
             <p className="text-zinc-400 text-lg max-w-md mb-8 leading-relaxed">
               Experience uncompromised luxury and performance. Choose from our exclusive fleet of premium vehicles for your next journey.
             </p>
          </div>
        </div>
      </section>

      {/* Booking Widget (Overlapping Hero) */}
      <section className="relative z-20 max-w-6xl mx-auto px-6 -mt-32 mb-20">
        <div className="bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl backdrop-blur-md">
          <form className="flex flex-col md:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); showToast('Searching available cars...'); }}>
             <div className="flex-1 bg-[#1a1a1a] rounded-lg p-4 border border-white/5 hover:border-amber-500/50 transition-colors cursor-pointer group" onClick={() => showToast('Select Location')}>
               <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 group-hover:text-amber-500 transition-colors">Pick-up Location</label>
               <div className="flex items-center gap-3 text-white">
                 <MapPin className="w-5 h-5 text-zinc-400 group-hover:text-amber-500" />
                 <span className="font-medium truncate">Casablanca Airport (CMN)</span>
               </div>
             </div>
             
             <div className="flex-1 bg-[#1a1a1a] rounded-lg p-4 border border-white/5 hover:border-amber-500/50 transition-colors cursor-pointer group" onClick={() => showToast('Select Dates')}>
               <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 group-hover:text-amber-500 transition-colors">Pick-up Date & Time</label>
               <div className="flex items-center gap-3 text-white">
                 <Calendar className="w-5 h-5 text-zinc-400 group-hover:text-amber-500" />
                 <span className="font-medium truncate">Oct 15, 10:00 AM</span>
               </div>
             </div>

             <div className="flex-1 bg-[#1a1a1a] rounded-lg p-4 border border-white/5 hover:border-amber-500/50 transition-colors cursor-pointer group" onClick={() => showToast('Select Dates')}>
               <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 group-hover:text-amber-500 transition-colors">Drop-off Date & Time</label>
               <div className="flex items-center gap-3 text-white">
                 <Calendar className="w-5 h-5 text-zinc-400 group-hover:text-amber-500" />
                 <span className="font-medium truncate">Oct 20, 10:00 AM</span>
               </div>
             </div>

             <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-lg font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
               <Search className="w-5 h-5" /> Search
             </button>
          </form>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-2">Our Collection</h3>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Featured Vehicles</h2>
          </div>
          <button onClick={() => showToast('View all cars')} className="hidden md:block text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors border-b border-zinc-700 pb-1">
            View Entire Fleet
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleet.map((car) => (
            <div key={car.id} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden group hover:border-amber-500/30 transition-all cursor-pointer" onClick={() => setSelectedCar(car)}>
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
                
                <div className="flex justify-between text-zinc-400 mb-6 pb-6 border-b border-white/5">
                  <div className="flex flex-col items-center gap-1.5" title="Seats">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{car.specs.seats}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5" title="Transmission">
                    <Settings className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{car.specs.trans}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5" title="Doors">
                    <Car className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{car.specs.doors}</span>
                  </div>
                </div>

                <button className="w-full bg-white/5 hover:bg-amber-500 text-white hover:text-black py-3 rounded text-xs font-bold tracking-widest uppercase transition-colors">
                  Reserve Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-2">The LuxeDrive Experience</h3>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-16">Why Choose Us</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-3">Fully Insured</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                Drive with peace of mind. All our vehicles come with comprehensive premium insurance coverage.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-3">Instant Booking</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                No waiting in lines. Book your vehicle in seconds and have it ready when you arrive.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Phone className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-3">24/7 Concierge</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                Our dedicated support team is available around the clock to assist you with any requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 max-w-7xl mx-auto px-6">
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
              Redefining luxury car rentals with an exclusive fleet and unparalleled service. Your journey begins here.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 transition-colors" onClick={preventScroll}><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 transition-colors" onClick={preventScroll}><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 transition-colors" onClick={preventScroll}><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Quick Links</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>Our Fleet</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>Special Offers</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>Locations</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Services</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>Chauffeur Service</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>Airport Transfer</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>Wedding Cars</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors" onClick={preventScroll}>Corporate Rentals</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Newsletter</h4>
            <p className="text-zinc-400 text-sm mb-4">Subscribe for exclusive offers and updates.</p>
            <div className="flex">
              <input type="email" placeholder="Email Address" className="bg-[#111] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-amber-500 w-full rounded-l" />
              <button onClick={() => showToast('Subscribed!')} className="bg-amber-500 text-black px-4 font-bold uppercase text-[10px] tracking-widest rounded-r hover:bg-amber-400 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} LuxeDrive Car Rentals. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300" onClick={preventScroll}>Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300" onClick={preventScroll}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Car Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCar(null)}></div>
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row relative z-10 overflow-hidden animate-in zoom-in-95 shadow-2xl">
             <button onClick={() => setSelectedCar(null)} className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur rounded-full p-2 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
             </button>
             <div className="w-full md:w-1/2 relative bg-black min-h-[300px]">
                <img src={selectedCar.img} alt={selectedCar.name} className="absolute inset-0 w-full h-full object-cover" />
             </div>
             <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-2">{selectedCar.type}</div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">{selectedCar.name}</h2>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-3xl font-bold leading-none">{selectedCar.price}</span>
                  <span className="text-zinc-500 text-sm font-medium">/ day</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <Users className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Seats</div>
                      <div className="text-sm font-bold">{selectedCar.specs.seats} Adults</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <Settings className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Transmission</div>
                      <div className="text-sm font-bold">{selectedCar.specs.trans}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <Car className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Doors</div>
                      <div className="text-sm font-bold">{selectedCar.specs.doors}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Insurance</div>
                      <div className="text-sm font-bold">Included</div>
                    </div>
                  </div>
                </div>

                <button onClick={() => { setSelectedCar(null); showToast(`Reservation started for ${selectedCar.name}`); }} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 font-bold tracking-widest uppercase transition-colors rounded-lg flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" /> Book This Vehicle
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
