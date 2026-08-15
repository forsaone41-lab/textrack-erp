import React, { useState } from 'react';
import { 
  Map, Tent, Compass, Search, 
  Settings, Users, CheckCircle2, Menu, X, Mountain, Fuel, Gauge
} from 'lucide-react';

export default function OffRoadRentalsDemo() {
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
      name: "Jeep Wrangler Rubicon", 
      type: "Extreme 4x4", 
      price: "$120", 
      img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 4, trans: "Manual", engine: "3.6L V6" }
    },
    { 
      id: 2, 
      name: "Land Rover Defender", 
      type: "Adventure SUV", 
      price: "$150", 
      img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, trans: "Auto", engine: "3.0L" }
    },
    { 
      id: 3, 
      name: "BMW X5 M-Sport", 
      type: "Luxury 4x4", 
      price: "$140", 
      img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop",
      specs: { seats: 5, trans: "Auto", engine: "4.4L V8" }
    }
  ];

  return (
    <div className="min-h-screen bg-[#1c1c1a] text-[#e8e6e3] font-sans selection:bg-[#d97706] selection:text-white">
      
      {/* Header */}
      <header className="bg-[#141413] border-b border-[#2d2d2a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => showToast('Home')}>
            <Mountain className="w-8 h-8 text-[#d97706]" />
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Wilderness<span className="text-[#d97706]">4x4</span></h1>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-bold text-sm tracking-widest uppercase text-[#a3a19a]">
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Vehicles'); }} className="hover:text-white transition-colors">The Fleet</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Trails'); }} className="hover:text-white transition-colors">Trails & Routes</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Gear'); }} className="hover:text-white transition-colors">Camping Gear</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
             <button onClick={() => showToast('Booking')} className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-3 font-bold tracking-widest uppercase text-xs transition-colors rounded-sm">
               Book Adventure
             </button>
          </div>
          
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        <img src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Jeep Offroad" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1a] to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1c1a] via-[#1c1c1a]/50 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="w-full md:w-1/2">
             <div className="flex items-center gap-2 text-[#d97706] font-bold tracking-widest uppercase text-xs mb-6">
               <Compass className="w-4 h-4" /> Go beyond the asphalt
             </div>
             <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-6 uppercase">
               Tame The<br/>Wild.
             </h2>
             <p className="text-[#a3a19a] text-lg mb-10 max-w-md">
               Rent premium 4x4 vehicles equipped for the toughest terrains. Roof tents and camping gear available.
             </p>
             <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => showToast('View Fleet')} className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-4 font-bold tracking-widest uppercase text-xs transition-colors rounded-sm text-center">
                  Explore Fleet
                </button>
                <button onClick={() => showToast('View Trails')} className="bg-transparent border border-[#d97706] text-[#d97706] hover:bg-[#d97706] hover:text-white px-8 py-4 font-bold tracking-widest uppercase text-xs transition-colors rounded-sm text-center">
                  Recommended Trails
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-12 flex items-end justify-between border-b border-[#2d2d2a] pb-6">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest">Our Machines</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {fleet.map((car) => (
            <div key={car.id} className="bg-[#262624] border-l-4 border-[#d97706] p-6 hover:bg-[#2d2d2a] transition-all cursor-pointer" onClick={() => setSelectedCar(car)}>
              <div className="h-56 relative mb-6 overflow-hidden">
                 <img src={car.img} alt={car.name} className="w-full h-full object-cover" />
                 <div className="absolute top-3 right-3 bg-[#1c1c1a] text-[#d97706] px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                   {car.type}
                 </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">{car.name}</h3>
              <div className="text-[#d97706] font-black text-2xl mb-6">{car.price} <span className="text-[#a3a19a] text-sm font-medium">/ day</span></div>
              
              <div className="flex justify-between text-[#a3a19a] text-xs font-bold uppercase tracking-wider mb-6">
                 <div className="flex flex-col items-center gap-2"><Users className="w-5 h-5 text-[#d97706]"/> {car.specs.seats} Seats</div>
                 <div className="flex flex-col items-center gap-2"><Settings className="w-5 h-5 text-[#d97706]"/> {car.specs.trans}</div>
                 <div className="flex flex-col items-center gap-2"><Gauge className="w-5 h-5 text-[#d97706]"/> {car.specs.engine}</div>
              </div>
              
              <button className="w-full bg-[#1c1c1a] text-white hover:text-[#d97706] border border-[#2d2d2a] hover:border-[#d97706] py-4 text-xs font-bold tracking-widest uppercase transition-colors">
                Select Vehicle
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Extras */}
      <section className="bg-[#141413] py-20 border-t border-[#2d2d2a]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-widest text-center mb-16">Add-on Gear</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1c1c1a] p-8 border border-[#2d2d2a] flex items-start gap-6">
               <Tent className="w-12 h-12 text-[#d97706] shrink-0" />
               <div>
                 <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">Rooftop Tents</h3>
                 <p className="text-[#a3a19a] text-sm leading-relaxed mb-4">High-quality pop-up rooftop tents for 2-4 people. Sets up in less than 2 minutes. Sleep comfortably under the stars.</p>
                 <span className="text-[#d97706] font-bold text-sm">+ $30 / day</span>
               </div>
            </div>
            <div className="bg-[#1c1c1a] p-8 border border-[#2d2d2a] flex items-start gap-6">
               <Fuel className="w-12 h-12 text-[#d97706] shrink-0" />
               <div>
                 <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">Survival Kit & Fuel</h3>
                 <p className="text-[#a3a19a] text-sm leading-relaxed mb-4">Extra jerry cans, recovery tracks, satellite phone, and comprehensive first-aid kit for deep wilderness expeditions.</p>
                 <span className="text-[#d97706] font-bold text-sm">+ $15 / day</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCar(null)}></div>
          <div className="bg-[#1c1c1a] border border-[#2d2d2a] w-full max-w-4xl relative z-10 overflow-hidden shadow-2xl flex flex-col md:flex-row">
             <button onClick={() => setSelectedCar(null)} className="absolute top-4 right-4 z-20 bg-[#141413] p-2 text-[#a3a19a] hover:text-white">
                <X className="w-5 h-5" />
             </button>
             <div className="w-full md:w-1/2 h-64 md:h-auto bg-black">
                <img src={selectedCar.img} alt={selectedCar.name} className="w-full h-full object-cover opacity-80" />
             </div>
             <div className="w-full md:w-1/2 p-8 md:p-12">
               <div className="text-[#d97706] font-bold tracking-widest uppercase text-[10px] mb-2">{selectedCar.type}</div>
               <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">{selectedCar.name}</h2>
               <div className="text-3xl font-black text-[#d97706] mb-8">{selectedCar.price} <span className="text-[#a3a19a] text-sm">/ day</span></div>
               
               <p className="text-[#a3a19a] text-sm mb-8 leading-relaxed">
                 Fully equipped and meticulously maintained for off-road reliability. Includes mud-terrain tires, lifted suspension, and winch.
               </p>

               <button onClick={() => { setSelectedCar(null); showToast(`Request sent for ${selectedCar.name}!`); }} className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-4 font-bold tracking-widest uppercase text-xs transition-colors rounded-sm">
                 Confirm Dates & Book
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[300] bg-[#d97706] text-white px-6 py-4 shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="font-bold text-sm tracking-widest uppercase">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
