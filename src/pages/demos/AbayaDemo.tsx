import React, { useState } from 'react';
import { Search, User, ShoppingBag, CheckCircle2 } from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const Pinterest = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.5 19c.5-2 1.5-6 1.5-6m0 0c0-1.5 1-3 3-3 2 0 3 1.5 3 3.5 0 2.5-1.5 4.5-3.5 4.5-1 0-1.8-.5-2-1M11 13c-.3-1-.5-3 .5-4.5" />
  </svg>
);
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function AbayaDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navLinks = ["HOME", "NEW ARRIVALS", "ABAYAS", "DRESSES", "HIJABS", "COLLECTION", "ACCESSORIES"];
  
  const arrivals = [
    { name: "Amira Silk Abaya", price: "£85.00", img: "/images/abaya_hero.png" },
    { name: "Zahra Kimono", price: "£99.00", img: "/images/abaya_product_1.png" },
    { name: "Zoya Dress", price: "£99.00", img: "/images/abaya_product_2.png" },
    { name: "Zoya Dress", price: "£85.00", img: "/images/abaya_product_3.png" },
    { name: "Amira Silk Abaya", price: "£85.00", img: "/images/abaya_product_2.png" },
    { name: "Zahra Silk Kimono", price: "£99.00", img: "/images/abaya_product_3.png" },
    { name: "Noura Dress", price: "£99.00", img: "/images/abaya_product_1.png" },
    { name: "Peyaa Dress", price: "£85.00", img: "/images/abaya_hero.png" }
  ];

  return (
    <div className="min-h-screen bg-white text-[#333] font-sans">
      
      {/* Top Banner */}
      <div className="w-full bg-[#f0d8d0] py-2 text-center text-xs tracking-widest text-[#333] uppercase font-medium">
        Women's Abayas & Modest Fashion
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center relative">
          
          {/* Logo & Icons */}
          <div className="w-full flex items-center justify-between mb-6">
            <div className="w-24"></div> {/* spacer */}
            <h1 className="text-3xl md:text-4xl font-serif tracking-[0.15em] text-[#333] text-center uppercase">
              Safa Modesty
            </h1>
            <div className="flex items-center gap-4 text-gray-600 w-24 justify-end">
              <Search className="w-5 h-5 cursor-pointer hover:text-black transition-colors" onClick={() => showToast('Search')} />
              <User className="w-5 h-5 cursor-pointer hover:text-black transition-colors" onClick={() => showToast('Account')} />
              <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-black transition-colors" onClick={() => showToast('Cart')} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold tracking-widest text-gray-800">
            {navLinks.map((link) => (
              <a key={link} href="#!" onClick={(e) => { e.preventDefault(); showToast(`Navigation: ${link}`); }} className="hover:text-amber-700 transition-colors">
                {link}
              </a>
            ))}
            <a href="#!" onClick={(e) => { e.preventDefault(); showToast('Login'); }} className="hover:text-amber-700 transition-colors ml-4 border-l border-gray-300 pl-8">
              LOG IN / BAG (0)
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 mb-20">
        <div className="flex flex-col md:flex-row h-[500px]">
          {/* Left Text */}
          <div className="w-full md:w-1/2 bg-[#f4ece8] flex flex-col items-center justify-center text-center p-12">
            <h2 className="text-4xl md:text-5xl font-serif text-[#333] mb-4">
              ELEGANT SIMPLICITY.
            </h2>
            <p className="text-lg text-gray-600 mb-8 font-serif italic">
              Discover Our New Collection.
            </p>
            <button onClick={() => showToast('Shop Collection')} className="bg-[#e8cec4] hover:bg-[#d6b7ab] text-[#333] px-10 py-3 text-xs font-bold tracking-widest transition-colors">
              SHOP NOW
            </button>
          </div>
          {/* Right Image */}
          <div className="w-full md:w-1/2 h-full relative bg-[#e3d7d1]">
             <img src="/images/abaya_hero.png" alt="Hero Modest Fashion" className="w-full h-full object-cover object-top" />
             <div className="absolute bottom-6 right-8 text-sm font-bold tracking-widest text-slate-700 mix-blend-color-burn">
               Noura Abaya
             </div>
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h3 className="text-xl font-serif uppercase tracking-widest mb-12 text-[#333]">Latest Arrivals</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 gap-y-12">
          {arrivals.map((item, idx) => (
            <div key={idx} className="group flex flex-col text-center">
              <div className="bg-[#fcfaf9] aspect-[3/4] mb-4 overflow-hidden relative cursor-pointer" onClick={() => showToast(`View ${item.name}`)}>
                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h4 className="font-bold text-sm text-[#333] mb-1 font-serif">{item.name}</h4>
              <p className="text-sm text-gray-500 mb-4 font-medium">{item.price}</p>
              <button onClick={() => showToast(`Added ${item.name} to bag!`)} className="w-full bg-[#f0d8d0] hover:bg-[#dcb9ab] text-[#333] py-2.5 text-xs font-bold transition-colors">
                Quick Add
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Collections */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h3 className="text-xl font-serif uppercase tracking-widest mb-12 text-[#333]">Curated Collections</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative h-[400px] rounded-2xl overflow-hidden group cursor-pointer" onClick={() => showToast('Everyday Abaya Collection')}>
            <img src="/images/abaya_product_1.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="The Everyday Abaya" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end pb-12">
              <h4 className="text-white text-2xl font-serif mb-2 tracking-wide uppercase">The Everyday Abaya</h4>
              <span className="text-white text-xs font-bold tracking-widest uppercase underline underline-offset-4 hover:text-[#f0d8d0] transition-colors">Explore</span>
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden group cursor-pointer" onClick={() => showToast('Ramadan Collection')}>
            <img src="/images/abaya_product_3.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Ramadan Collection" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end pb-12">
              <h4 className="text-white text-2xl font-serif mb-2 tracking-wide uppercase">Ramadan Collection</h4>
              <p className="text-white/80 font-serif italic mb-4">Festive Style</p>
              <span className="text-white text-xs font-bold tracking-widest uppercase underline underline-offset-4 hover:text-[#f0d8d0] transition-colors">Explore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Hijabs */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h3 className="text-xl font-serif uppercase tracking-widest mb-12 text-[#333]">Essential Hijabs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col text-center cursor-pointer group" onClick={() => showToast('Hijab details')}>
              <div className="bg-[#f0ece9] aspect-square mb-4 rounded-xl overflow-hidden">
                <img src="/images/abaya_product_2.png" alt="Hijab" className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <span className="text-sm font-bold text-gray-700">Modal/Jersey Hijab</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer" onClick={() => showToast('Modest Dresses')}>
            <img src="/images/abaya_product_3.png" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="Modest Dresses" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <h4 className="text-white text-xl font-serif tracking-widest uppercase text-center leading-snug">Modest<br/>Dresses</h4>
            </div>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer" onClick={() => showToast('Accessories')}>
            <img src="/images/abaya_product_1.png" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="Accessories" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <h4 className="text-white text-xl font-serif tracking-widest uppercase text-center leading-snug">Accessories</h4>
            </div>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer" onClick={() => showToast('Prayer Wear')}>
            <img src="/images/abaya_hero.png" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="Prayer Wear" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <h4 className="text-white text-xl font-serif tracking-widest uppercase text-center leading-snug">Prayer<br/>Wear</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f0d8d0] py-16 text-center text-[#333]">
        <div className="max-w-md mx-auto px-6">
          <h4 className="font-serif uppercase tracking-widest mb-6 text-lg">Stay Inspired</h4>
          <div className="flex bg-white mb-10 border border-[#e8cec4]">
            <input type="email" placeholder="email@address.com" className="w-full px-4 py-3 text-sm focus:outline-none" />
            <button onClick={() => showToast('Subscribed!')} className="bg-[#e8cec4] px-6 text-xs font-bold tracking-widest hover:bg-[#dcb9ab] transition-colors">
              SUBSCRIBE
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold tracking-widest uppercase mb-8">
            <a href="#!" className="hover:text-amber-800 transition-colors">About</a>
            <span>|</span>
            <a href="#!" className="hover:text-amber-800 transition-colors">Contact</a>
            <span>|</span>
            <a href="#!" className="hover:text-amber-800 transition-colors">Shipping</a>
            <span>|</span>
            <a href="#!" className="hover:text-amber-800 transition-colors">Returns</a>
            <span>|</span>
            <a href="#!" className="hover:text-amber-800 transition-colors">FAQ</a>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <Instagram className="w-5 h-5 cursor-pointer hover:text-amber-800 transition-colors" />
            <Pinterest className="w-5 h-5 cursor-pointer hover:text-amber-800 transition-colors" />
            <Facebook className="w-5 h-5 cursor-pointer hover:text-amber-800 transition-colors" />
          </div>

          <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">
            &copy; {new Date().getFullYear()} Safa Modesty
          </p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#f0d8d0]" />
          <span className="font-sans font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
