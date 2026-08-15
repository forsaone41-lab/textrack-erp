import React, { useState } from 'react';
import { 
  Car, MapPin, Calendar, Search, 
  Settings, Users, CheckCircle2, Menu, X, Shield, Phone, Mail
} from 'lucide-react';

export default function CityRentalsDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);

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
      name: "Fiat 500 Hybrid", 
      type: "Compact City", 
      price: "$45", 
      img: "https://images.unsplash.com/photo-1617469165786-8007eda3caa7?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 4, trans: "Manual", doors: 3 }
    },
    { 
      id: 2, 
      name: "VW Golf 8", 
      type: "Hatchback", 
      price: "$60", 
      img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, trans: "Auto", doors: 5 }
    },
    { 
      id: 3, 
      name: "Tesla Model 3", 
      type: "Electric Sedan", 
      price: "$90", 
      img: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, trans: "Auto", doors: 4 }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Bar */}
      <div className="bg-blue-600 text-white text-xs py-2 px-6 flex justify-between items-center font-medium">
        <div className="flex gap-4">
           <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +1 (800) 123-CITY</span>
           <span className="hidden md:flex items-center gap-1.5"><Mail className="w-3 h-3" /> hello@cityrentals.com</span>
        </div>
        <div>
           Free cancellation up to 24 hours before pick-up!
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
            <a href="#fleet" onClick={(e) => { preventScroll(e); document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">Our Vehicles</a>
            <a href="#locations" onClick={(e) => { preventScroll(e); document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">Locations</a>
            <a href="#offers" onClick={(e) => { preventScroll(e); document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">Offers</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
             <button onClick={() => setShowAuth('login')} className="font-bold text-slate-600 hover:text-blue-600 transition-colors">Log In</button>
             <button onClick={() => setShowAuth('signup')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-blue-200 transition-all">Sign Up</button>
          </div>
          
          <button className="md:hidden text-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white pb-20 pt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
             <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
               Urban Mobility Made Easy
             </div>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
               Navigate the city<br/>with <span className="text-blue-600">ease.</span>
             </h2>
             <p className="text-slate-500 text-lg mb-8">
               Affordable, eco-friendly, and convenient car rentals for your daily urban adventures.
             </p>
             
             {/* Booking form inline */}
             <form className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative">
                      <label className="block text-xs font-bold text-slate-400 mb-1">Pick-up & Drop-off</label>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0"/>
                        <select className="bg-transparent border-none outline-none w-full font-bold text-slate-700 cursor-pointer appearance-none">
                          <option>Downtown Station</option>
                          <option>Airport Terminal 1</option>
                          <option>Central Station</option>
                          <option>North City Hub</option>
                        </select>
                      </div>
                   </div>
                   <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative">
                      <label className="block text-xs font-bold text-slate-400 mb-1">Pick-up Date</label>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0"/>
                        <input type="date" className="bg-transparent border-none outline-none w-full font-bold text-slate-700 cursor-pointer" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex justify-center items-center gap-2 transition-colors">
                  <Search className="w-5 h-5"/> Find a Car
                </button>
             </form>
          </div>
          <div className="w-full md:w-1/2 relative h-[400px]">
             <div className="absolute inset-0 bg-blue-100 rounded-[3rem] transform rotate-3 scale-95"></div>
             <img src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl transform -rotate-2" alt="City Car" />
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section id="fleet" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Our Popular City Cars</h2>
          <p className="text-slate-500">Compact, fuel-efficient, and easy to park anywhere.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {fleet.map((car) => (
            <div key={car.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer group" onClick={() => setSelectedCar(car)}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{car.name}</h3>
                  <p className="text-sm font-medium text-blue-600">{car.type}</p>
                </div>
                <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                  {car.price} <span className="text-slate-400 font-normal">/day</span>
                </div>
              </div>
              <div className="h-48 relative mb-6">
                 <img src={car.img} alt={car.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex justify-between text-slate-500 text-sm mb-6 px-2">
                 <div className="flex items-center gap-1.5 font-medium"><Users className="w-4 h-4"/> {car.specs.seats}</div>
                 <div className="flex items-center gap-1.5 font-medium"><Settings className="w-4 h-4"/> {car.specs.trans}</div>
                 <div className="flex items-center gap-1.5 font-medium"><Car className="w-4 h-4"/> {car.specs.doors}</div>
              </div>
              <button className="w-full bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-bold transition-colors">
                Book Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="locations" className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
           <div>
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <Shield className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-3">Basic Insurance Included</h3>
             <p className="text-slate-400">Every rental includes basic collision damage waiver for your peace of mind.</p>
           </div>
           <div>
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <MapPin className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-3">20+ City Locations</h3>
             <p className="text-slate-400">Pick up and drop off your car at any of our convenient downtown stations.</p>
           </div>
           <div>
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-3">Zero Hidden Fees</h3>
             <p className="text-slate-400">What you see is what you pay. No surprises at the rental counter.</p>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} CityRentals. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCar(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 p-8">
             <button onClick={() => setSelectedCar(null)} className="absolute top-6 right-6 z-20 bg-slate-100 rounded-full p-2 text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
             </button>
             <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedCar.name}</h2>
             <p className="text-blue-600 font-bold mb-6">{selectedCar.price} / day</p>
             <div className="h-64 relative mb-8 rounded-2xl overflow-hidden bg-slate-100">
                <img src={selectedCar.img} alt={selectedCar.name} className="w-full h-full object-cover" />
             </div>
             <button onClick={() => { setSelectedCar(null); showToast(`Successfully booked ${selectedCar.name}!`); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-colors">
               Confirm Booking
             </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAuth(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 p-8">
             <button onClick={() => setShowAuth(null)} className="absolute top-6 right-6 z-20 bg-slate-100 rounded-full p-2 text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
             </button>
             <h2 className="text-2xl font-black text-slate-900 mb-6">{showAuth === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
             
             <form onSubmit={(e) => { e.preventDefault(); setShowAuth(null); showToast(`Successfully ${showAuth === 'login' ? 'logged in' : 'signed up'}!`); }} className="flex flex-col gap-4">
                {showAuth === 'signup' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="John Doe" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="hello@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                  <input type="password" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 mt-2 transition-colors">
                  {showAuth === 'login' ? 'Log In' : 'Sign Up'}
                </button>
             </form>
             <div className="mt-6 text-center text-sm font-medium text-slate-500">
                {showAuth === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setShowAuth(showAuth === 'login' ? 'signup' : 'login')} className="text-blue-600 font-bold hover:underline">
                  {showAuth === 'login' ? 'Sign Up' : 'Log In'}
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
