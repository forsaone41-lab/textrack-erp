import React from 'react';
import { Search, MapPin, Calendar, Users, Star, ShieldCheck, Map, Clock, CheckCircle2 } from 'lucide-react';

export default function TourismDemo() {
  return (
    <div className="min-h-screen bg-slate-50 font-serif">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 font-black text-2xl tracking-tighter">
            <MapPin className="w-8 h-8 text-amber-500" />
            ExploreLocal
          </div>
          <nav className="hidden lg:flex items-center gap-8 font-sans text-sm font-semibold text-slate-600">
            <a href="#" className="text-emerald-700 border-b-2 border-emerald-700 py-7">Home</a>
            <a href="#" className="hover:text-emerald-700 transition-colors">Destinations</a>
            <a href="#" className="hover:text-emerald-700 transition-colors">Tours & Packages</a>
            <a href="#" className="hover:text-emerald-700 transition-colors">Experiences</a>
            <a href="#" className="hover:text-emerald-700 transition-colors">Blog</a>
            <a href="#" className="hover:text-emerald-700 transition-colors">About Us</a>
            <a href="#" className="hover:text-emerald-700 transition-colors">Contact</a>
          </nav>
          <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-full font-sans font-bold text-sm transition-all shadow-lg shadow-emerald-700/20">
            Book Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[550px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000&auto=format&fit=crop" alt="Beautiful Coastline" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/30" />
        </div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center text-white mt-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight drop-shadow-lg font-serif">
            Discover Your Next Adventure:<br />Authentic Local Experiences
          </h1>
          <p className="text-lg md:text-xl font-sans mb-12 drop-shadow-md text-slate-100 font-medium">
            Book Guided Tours & Holiday Packages with Confidence.
          </p>

          {/* Search Widget - Matches Thumbnail single-line style */}
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 font-sans items-center border border-white/30 max-w-4xl mx-auto">
            <div className="flex-1 w-full relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                <MapPin className="w-full h-full" />
              </div>
              <input type="text" placeholder="Enter Destination" className="w-full pl-10 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm text-slate-800" defaultValue="Amalfi Coast" />
            </div>
            
            <div className="w-full md:w-[160px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                <Calendar className="w-full h-full" />
              </div>
              <input type="text" placeholder="Check-in Date" className="w-full pl-10 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm text-slate-800" />
            </div>

            <div className="w-full md:w-[160px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                <Calendar className="w-full h-full" />
              </div>
              <input type="text" placeholder="Check-out Date" className="w-full pl-10 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm text-slate-800" />
            </div>

            <div className="w-full md:w-[180px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                <Users className="w-full h-full" />
              </div>
              <select className="w-full pl-10 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm text-slate-800 appearance-none">
                <option>Number of Travelers</option>
                <option>1 Adult</option>
                <option selected>2 Adults</option>
                <option>Family</option>
              </select>
            </div>

            <button className="w-full md:w-[120px] py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm transition-colors shadow-lg shadow-amber-500/30 shrink-0">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Featured Tours</h2>
          <p className="text-slate-500 font-sans text-lg">Handpicked experiences by our local experts.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group cursor-pointer font-sans flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1533682800508-410787e9eb4f?q=80&w=600&auto=format&fit=crop" alt="Amalfi Coast" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 flex items-center gap-1 shadow-sm">
                 <Clock className="w-3 h-3" /> 7 Days
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 mb-2 font-serif">Amalfi Coast Highlights</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Experience the breathtaking views and authentic cuisine of Italy's most famous coastline.</p>
              <div className="flex text-amber-400 mb-4 text-xs">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">from</span>
                  <div className="font-black text-emerald-700 text-lg">$1,299</div>
                </div>
                <button className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-colors">Explore</button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group cursor-pointer font-sans flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600&auto=format&fit=crop" alt="Safari" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 flex items-center gap-1 shadow-sm">
                 <Clock className="w-3 h-3" /> 10 Days
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 mb-2 font-serif">Safari Adventure Kenya</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Witness the great migration and explore the untamed beauty of the African savanna.</p>
              <div className="flex text-amber-400 mb-4 text-xs">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">from</span>
                  <div className="font-black text-emerald-700 text-lg">$3,450</div>
                </div>
                <button className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-colors">Explore</button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group cursor-pointer font-sans flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop" alt="Kyoto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 flex items-center gap-1 shadow-sm">
                 <Clock className="w-3 h-3" /> 14 Days
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 mb-2 font-serif">Cultural Kyoto Journey</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Immerse yourself in ancient temples, traditional tea ceremonies, and bamboo forests.</p>
              <div className="flex text-amber-400 mb-4 text-xs">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">from</span>
                  <div className="font-black text-emerald-700 text-lg">$2,800</div>
                </div>
                <button className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-colors">Explore</button>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group cursor-pointer font-sans flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" alt="Patagonia" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 flex items-center gap-1 shadow-sm">
                 <Clock className="w-3 h-3" /> 8 Days
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 mb-2 font-serif">Patagonia Wilderness Trek</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Hike through dramatic peaks, blue glaciers, and crystal clear lakes at the end of the world.</p>
              <div className="flex text-amber-400 mb-4 text-xs">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">from</span>
                  <div className="font-black text-emerald-700 text-lg">$1,950</div>
                </div>
                <button className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-colors">Explore</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-emerald-900 text-emerald-50 py-20 font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black font-serif text-white mb-4">Why Choose Us</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Expert Local Guides</h3>
              <p className="text-emerald-200/80 text-sm">Passionate experts who know the hidden gems of every destination.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center mb-6">
                <Map className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Handpicked Destinations</h3>
              <p className="text-emerald-200/80 text-sm">Carefully curated itineraries ensuring an unforgettable journey.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Seamless Booking</h3>
              <p className="text-emerald-200/80 text-sm">Hassle-free reservations with instant confirmation and 24/7 support.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Verified & Safe</h3>
              <p className="text-emerald-200/80 text-sm">Fully insured, secure payments, and trusted by thousands of travelers.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400 font-sans text-sm border-t-4 border-amber-500">
        <p>&copy; 2026 ExploreLocal Tours. All rights reserved.</p>
      </footer>
    </div>
  );
}
