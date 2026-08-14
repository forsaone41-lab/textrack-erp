import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, User, Star, ArrowRight, Plane, Globe2, Phone, Mail, Send } from 'lucide-react';

export default function VacationDealsDemo() {
  const [activePage, setActivePage] = useState('home');

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 text-slate-800 font-black text-2xl tracking-tighter cursor-pointer"
            onClick={() => setActivePage('home')}
          >
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
              <Plane className="w-6 h-6" />
            </div>
            Wanderlust<span className="text-orange-500">Travels</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('home'); }} className={activePage === 'home' ? "text-orange-500" : "hover:text-orange-500 transition-colors"}>Home</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('destinations'); }} className={activePage === 'destinations' ? "text-orange-500" : "hover:text-orange-500 transition-colors"}>Destinations</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('packages'); }} className={activePage === 'packages' ? "text-orange-500" : "hover:text-orange-500 transition-colors"}>Packages</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('contact'); }} className={activePage === 'contact' ? "text-orange-500" : "hover:text-orange-500 transition-colors"}>Contact</a>
          </nav>
          <button onClick={() => setActivePage('login')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-orange-500/30">
            Sign In / Register
          </button>
        </div>
      </header>

      {/* HOME PAGE */}
      {activePage === 'home' && (
        <>

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto lg:px-6 pt-6 pb-12">
        <div className="relative rounded-[2rem] overflow-hidden h-[500px] flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?q=80&w=2000&auto=format&fit=crop" alt="Dream Vacation" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/30" />
          </div>
          
          <div className="relative z-10 w-full text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight drop-shadow-xl tracking-tight">
              Book Your<br />Dream Vacation
            </h1>
            <p className="text-lg md:text-xl mb-12 drop-shadow-md text-slate-100 font-medium max-w-2xl mx-auto">
              Discover unforgettable journeys and exclusive packages to the world's most breathtaking destinations.
            </p>
          </div>
        </div>

        {/* Floating Search Widget */}
        <div className="relative z-20 max-w-4xl mx-auto -mt-16 px-4">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 font-sans items-center border border-orange-400">
            <div className="flex-1 w-full relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">
                <MapPin className="w-full h-full" />
              </div>
              <input type="text" placeholder="Where to go?" className="w-full pl-11 pr-4 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-bold text-sm text-slate-800" />
            </div>
            
            <div className="w-full md:w-[220px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">
                <Calendar className="w-full h-full" />
              </div>
              <input type="text" placeholder="Dates" className="w-full pl-11 pr-4 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-bold text-sm text-slate-800" />
            </div>

            <div className="w-full md:w-[220px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">
                <Users className="w-full h-full" />
              </div>
              <select className="w-full pl-11 pr-4 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-bold text-sm text-slate-800 appearance-none">
                <option>Travelers</option>
                <option>1 Adult</option>
                <option selected>2 Adults</option>
                <option>Family</option>
              </select>
            </div>

            <button className="w-full md:w-[70px] h-[52px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shrink-0">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Explore Our Top Destinations</h2>
          <div className="w-24 h-1.5 bg-orange-500 rounded-full mb-6"></div>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">Find the best deals on popular destinations and exclusive vacation packages curated just for you.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 border-slate-100 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col p-3">
            <div className="h-48 overflow-hidden rounded-2xl relative mb-4">
              <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop" alt="Paris" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-900 shadow-sm">
                 FRANCE
              </div>
            </div>
            <div className="px-2 flex-1 flex flex-col">
              <h3 className="font-black text-xl text-slate-900 mb-1">Paris Romantic Getaway</h3>
              <p className="text-xs text-slate-500 mb-3 font-medium">Experience the city of love with our exclusive 5-day package.</p>
              <div className="flex text-orange-400 mb-4 text-xs gap-0.5">
                <Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="mt-auto flex items-end justify-between mb-4">
                <div>
                  <div className="font-black text-slate-900 text-2xl">$1,299</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Per Person</span>
                </div>
              </div>
              <button onClick={() => setActivePage('booking')} className="w-full bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2">
                Explore & Book <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 border-slate-100 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col p-3">
            <div className="h-48 overflow-hidden rounded-2xl relative mb-4">
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop" alt="Kyoto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-900 shadow-sm">
                 JAPAN
              </div>
            </div>
            <div className="px-2 flex-1 flex flex-col">
              <h3 className="font-black text-xl text-slate-900 mb-1">Cultural Kyoto</h3>
              <p className="text-xs text-slate-500 mb-3 font-medium">Immerse yourself in traditional Japanese culture and beautiful temples.</p>
              <div className="flex text-orange-400 mb-4 text-xs gap-0.5">
                <Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="mt-auto flex items-end justify-between mb-4">
                <div>
                  <div className="font-black text-slate-900 text-2xl">$2,450</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Per Person</span>
                </div>
              </div>
              <button onClick={() => setActivePage('booking')} className="w-full bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2">
                Explore & Book <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 border-slate-100 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col p-3">
            <div className="h-48 overflow-hidden rounded-2xl relative mb-4">
              <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop" alt="Maldives" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-900 shadow-sm">
                 MALDIVES
              </div>
            </div>
            <div className="px-2 flex-1 flex flex-col">
              <h3 className="font-black text-xl text-slate-900 mb-1">Tropical Maldives</h3>
              <p className="text-xs text-slate-500 mb-3 font-medium">Relax in luxury overwater bungalows surrounded by crystal clear waters.</p>
              <div className="flex text-orange-400 mb-4 text-xs gap-0.5">
                <Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="mt-auto flex items-end justify-between mb-4">
                <div>
                  <div className="font-black text-slate-900 text-2xl">$3,899</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Per Person</span>
                </div>
              </div>
              <button onClick={() => setActivePage('booking')} className="w-full bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2">
                Explore & Book <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 border-slate-100 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col p-3">
            <div className="h-48 overflow-hidden rounded-2xl relative mb-4">
              <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600&auto=format&fit=crop" alt="Safari" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-900 shadow-sm">
                 KENYA
              </div>
            </div>
            <div className="px-2 flex-1 flex flex-col">
              <h3 className="font-black text-xl text-slate-900 mb-1">African Safari</h3>
              <p className="text-xs text-slate-500 mb-3 font-medium">An unforgettable adventure tracking the Big Five in the wild savanna.</p>
              <div className="flex text-orange-400 mb-4 text-xs gap-0.5">
                <Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="mt-auto flex items-end justify-between mb-4">
                <div>
                  <div className="font-black text-slate-900 text-2xl">$4,150</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Per Person</span>
                </div>
              </div>
              <button onClick={() => setActivePage('booking')} className="w-full bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2">
                Explore & Book <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* DESTINATIONS PAGE */}
      {activePage === 'destinations' && (
        <section className="py-20 max-w-7xl mx-auto px-6 min-h-[60vh]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">All Destinations</h2>
            <div className="w-24 h-1.5 bg-orange-500 rounded-full mb-6 mx-auto"></div>
            <p className="text-slate-500 font-medium text-lg">Browse our complete list of exotic getaways.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="h-64 rounded-3xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
              <span className="text-slate-400 font-bold">More Destinations Loading...</span>
            </div>
            <div className="h-64 rounded-3xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
              <span className="text-slate-400 font-bold">More Destinations Loading...</span>
            </div>
            <div className="h-64 rounded-3xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
              <span className="text-slate-400 font-bold">More Destinations Loading...</span>
            </div>
          </div>
        </section>
      )}

      {/* PACKAGES PAGE */}
      {activePage === 'packages' && (
        <section className="py-20 max-w-7xl mx-auto px-6 min-h-[60vh]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Special Packages</h2>
            <div className="w-24 h-1.5 bg-orange-500 rounded-full mb-6 mx-auto"></div>
            <p className="text-slate-500 font-medium text-lg">All-inclusive packages for the perfect holiday.</p>
          </div>
          <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100 text-center">
            <Plane className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">Summer 2026 Packages Coming Soon!</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">We are finalizing the best deals for the upcoming season. Check back later or sign up for our newsletter.</p>
            <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30">Get Notified</button>
          </div>
        </section>
      )}

      {/* CONTACT PAGE */}
      {activePage === 'contact' && (
        <section className="py-20 max-w-4xl mx-auto px-6 min-h-[60vh]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Contact Us</h2>
            <div className="w-24 h-1.5 bg-orange-500 rounded-full mb-6 mx-auto"></div>
            <p className="text-slate-500 font-medium text-lg">We are here to help you plan your dream vacation.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Get In Touch</h3>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Office Location</h4>
                  <p className="text-slate-500">123 Travel Boulevard, NY 10012, USA</p>
                </div>
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Phone Number</h4>
                  <p className="text-slate-500">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Email Address</h4>
                  <p className="text-slate-500">hello@wanderlust.com</p>
                </div>
              </div>
            </div>
            <div>
              <form className="flex flex-col gap-4">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <textarea placeholder="Message" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"></textarea>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
      
      {/* LOGIN PAGE */}
      {activePage === 'login' && (
        <section className="py-20 max-w-md mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-6">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 mb-8 font-medium">Sign in to access your bookings.</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email Address" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-left" />
              <input type="password" placeholder="Password" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-left" />
              
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/30">
                Sign In
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500 font-medium">
              Don't have an account? <span className="text-orange-500 cursor-pointer hover:underline">Register</span>
            </p>
          </div>
        </section>
      )}

      {/* BOOKING PAGE */}
      {activePage === 'booking' && (
        <section className="py-20 max-w-4xl mx-auto px-6 min-h-[60vh]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Complete Your Booking</h2>
            <div className="w-24 h-1.5 bg-orange-500 rounded-full mb-6 mx-auto"></div>
            <p className="text-slate-500 font-medium text-lg">You're one step away from your dream vacation.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6">Trip Summary</h3>
              <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600" className="w-full h-full object-cover" alt="Destination" />
              </div>
              <h4 className="font-bold text-lg mb-2">Selected Package</h4>
              <p className="text-slate-500 text-sm mb-6 pb-6 border-b border-slate-200">5 Days / 4 Nights All-Inclusive</p>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 font-medium">Base Price</span>
                <span className="font-bold">$1,299.00</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 font-medium">Taxes & Fees</span>
                <span className="font-bold">$125.00</span>
              </div>
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                <span className="text-lg font-black text-slate-900">Total</span>
                <span className="text-2xl font-black text-orange-500">$1,424.00</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6">Payment Information</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Full Name" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <div className="pt-4">
                  <input type="text" placeholder="Card Number" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input type="text" placeholder="CVC" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-8">
                  Confirm Booking <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Footer minimal */}
      <footer className="bg-slate-50 py-12 text-center text-slate-400 font-sans text-sm border-t border-slate-200 mt-12">
        <div className="flex items-center justify-center gap-2 text-slate-800 font-black text-xl tracking-tighter mb-4 opacity-50 cursor-pointer" onClick={() => setActivePage('home')}>
          <Globe2 className="w-6 h-6 text-orange-500" />
          WanderlustTravels
        </div>
        <p>&copy; 2026 Wanderlust Travels. All rights reserved.</p>
      </footer>
    </div>
  );
}
