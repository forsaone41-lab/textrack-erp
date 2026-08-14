import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Plane, Building2, Briefcase, User, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function OmraToursDemo() {
  const [activePage, setActivePage] = useState('home');
  const [activeTab, setActiveTab] = useState('voyages');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-[#175c99] sticky top-0 z-50 shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 font-black text-2xl tracking-tighter cursor-pointer"
            onClick={() => setActivePage('home')}
          >
            {/* Geometric star simulation for logo */}
            <div className="relative w-8 h-8 flex items-center justify-center">
               <div className="absolute inset-0 border-2 border-white rotate-45"></div>
               <div className="absolute inset-0 border-2 border-white"></div>
               <div className="absolute w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight">Atlas Voyages</span>
              <span className="text-[10px] font-medium opacity-80 leading-tight">Agence de Voyages</span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Search className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => showToast('Recherche...')}/>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('home'); }} className="hover:text-blue-200 transition-colors">Vols</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('hotels'); }} className="hover:text-blue-200 transition-colors">Hôtels</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('voyages'); }} className="hover:text-blue-200 transition-colors">Voyages Organisés</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('circuits'); }} className="hover:text-blue-200 transition-colors">Circuits</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('offres'); }} className="hover:text-blue-200 transition-colors">Offres Spéciales</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('contact'); }} className="hover:text-blue-200 transition-colors">Contact</a>
            
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => showToast('Login en mode demo!')} className="flex items-center gap-2 border border-white/30 hover:bg-white/10 px-4 py-1.5 rounded text-sm transition-colors">
                <User className="w-4 h-4" /> Login
              </button>
              <button className="flex items-center gap-1 border border-white/30 hover:bg-white/10 px-2 py-1.5 rounded text-sm transition-colors">
                <span className="w-4 h-3 bg-red-600 relative overflow-hidden block">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-green-500 font-bold">★</span>
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1489493173507-6feea31f12ff?q=80&w=2000&auto=format&fit=crop" alt="Desert landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 drop-shadow-lg">
            Découvrez le Maroc et le Monde
          </h1>
          
          {/* Search Box with Zellij pattern simulation border */}
          <div className="relative p-2 rounded-xl bg-[url('https://images.unsplash.com/photo-1538681105587-85640961bf8b?q=80&w=600')] bg-cover bg-center shadow-2xl">
            {/* Inner content white bg */}
            <div className="bg-white rounded-lg p-2 flex flex-col w-full h-full">
              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                <button onClick={() => setActiveTab('vols')} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'vols' ? 'text-[#175c99] border-b-2 border-[#175c99] bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Plane className="w-4 h-4" /> Vols
                </button>
                <button onClick={() => setActiveTab('hotels')} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'hotels' ? 'text-[#175c99] border-b-2 border-[#175c99] bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Building2 className="w-4 h-4" /> Hôtels
                </button>
                <button onClick={() => setActiveTab('voyages')} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'voyages' ? 'text-[#175c99] border-b-2 border-[#175c99] bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Briefcase className="w-4 h-4" /> Voyages Organisés
                </button>
              </div>
              
              {/* Search Inputs */}
              <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                  <input type="text" placeholder="Destination (ex: Marrakech)" className="w-full px-4 py-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-[#175c99]" />
                </div>
                <div className="flex-1 relative w-full flex items-center border border-slate-200 rounded-md px-4 py-3 bg-white">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-500">Dates de Voyage</span>
                </div>
                <div className="flex-1 relative w-full flex items-center justify-between border border-slate-200 rounded-md px-4 py-3 bg-white cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => showToast('Sélecteur de voyageurs')}>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    Voyageurs
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
                <button onClick={() => showToast('Recherche en cours...')} className="w-full md:w-auto bg-[#175c99] hover:bg-[#124a7a] text-white px-8 py-3 rounded-md font-bold text-sm transition-colors">
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Nos Destinations Populaires</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-48 relative">
              <img src="/images/omra_makkah.png" alt="Makkah" className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900">Omra 2026</h3>
                <div className="flex text-amber-400 text-xs">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 flex-1">Forfaits Omra 2026 complets à partir de 14,500 MAD</p>
              
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">À partir de</span>
                  <div className="font-black text-slate-900 text-lg">14,500 MAD</div>
                </div>
                <button onClick={() => showToast('Réservation Omra: Redirection en mode live.')} className="bg-[#175c99] hover:bg-[#124a7a] text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                  Réserver
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-48 relative">
              <img src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=600&auto=format&fit=crop" alt="Istanbul" className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900">Istanbul 7 Jours</h3>
                <div className="flex text-amber-400 text-xs">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 flex-1">Découverte culturelle d'Istanbul - 7J/6N à partir de 8,900 MAD</p>
              
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">À partir de</span>
                  <div className="font-black text-slate-900 text-lg">8,900 MAD</div>
                </div>
                <button onClick={() => showToast('Réservation Istanbul: Redirection en mode live.')} className="bg-[#175c99] hover:bg-[#124a7a] text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                  Réserver
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-48 relative">
              <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop" alt="Maldives" className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900">Maldives</h3>
                <div className="flex text-amber-400 text-xs">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 flex-1">Séjour de rêve aux Maldives - 10J à partir de 21,500 MAD</p>
              
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">À partir de</span>
                  <div className="font-black text-slate-900 text-lg">21,500 MAD</div>
                </div>
                <button onClick={() => showToast('Réservation Maldives: Redirection en mode live.')} className="bg-[#175c99] hover:bg-[#124a7a] text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                  Réserver
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400 text-sm border-t border-slate-800">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
           <div className="relative w-8 h-8 flex items-center justify-center opacity-50 mb-2">
               <div className="absolute inset-0 border-2 border-white rotate-45"></div>
               <div className="absolute inset-0 border-2 border-white"></div>
               <div className="absolute w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-white font-bold text-xl">Atlas Voyages</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Atlas Voyages Demo. All rights reserved.</p>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-sans font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
