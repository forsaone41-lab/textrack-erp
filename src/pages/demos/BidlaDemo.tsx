import React, { useState } from 'react';
import { Search, User, ShoppingBag, CheckCircle2, Facebook, Instagram, Twitter } from 'lucide-react';

export default function BidlaDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navLinks = ["SHOP", "OUR STORY", "JOURNAL", "CONTACT"];

  const essentials = [
    { name: "Classic Chef Jacket", price: "$65.00", img: "/images/chef_jacket.png" },
    { name: "Canvas Apron", price: "$45.00", img: "/images/chef_apron.png" },
    { name: "Pro Chef Pants", price: "$55.00", img: "/images/chef_jacket.png" }, // reusing jacket image for placeholder
    { name: "Culinary Hat", price: "$25.00", img: "/images/chef_apron.png" } // reusing apron image for placeholder
  ];

  const favorites = [
    { name: "Executive Coat", price: "$85.00", img: "/images/chef_jacket.png" },
    { name: "Bistro Apron", price: "$35.00", img: "/images/chef_apron.png" },
    { name: "Women's Coat", price: "$65.00", img: "/images/chef_jacket.png" },
    { name: "Leather Apron", price: "$95.00", img: "/images/chef_apron.png" }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#222] font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-3xl font-serif tracking-widest text-[#222] font-black cursor-pointer" onClick={() => showToast('Home')}>
            ATELIER
          </h1>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] text-gray-500">
            {navLinks.map((link) => (
              <a key={link} href="#!" onClick={(e) => { e.preventDefault(); showToast(`Navigation: ${link}`); }} className="hover:text-black transition-colors uppercase">
                {link}
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5 text-gray-800">
            <Search className="w-5 h-5 cursor-pointer hover:text-gray-500 transition-colors" onClick={() => showToast('Search')} />
            <User className="w-5 h-5 cursor-pointer hover:text-gray-500 transition-colors" onClick={() => showToast('Account')} />
            <div className="relative cursor-pointer hover:text-gray-500 transition-colors" onClick={() => showToast('Cart')}>
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1.5 bg-black text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Top Banner */}
      <div className="w-full bg-[#f4f4f4] py-2.5 text-center text-[10px] tracking-widest text-gray-600 uppercase font-bold border-b border-gray-200">
        Free shipping on orders over $150
      </div>

      {/* Hero Section */}
      <section className="bg-[#f0f0f0] border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[500px]">
          {/* Left Text */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-20">
            <h2 className="text-4xl md:text-5xl font-serif text-[#111] mb-6 leading-tight">
              PROFESSIONAL ATTIRE,<br/>PRECISION CRAFTED.
            </h2>
            <p className="text-sm text-gray-600 mb-10 tracking-wide font-serif italic">
              Shop the Signature Collection.
            </p>
            <div>
              <button onClick={() => showToast('Shop Now')} className="bg-transparent border border-[#222] text-[#222] hover:bg-[#222] hover:text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors">
                SHOP NOW
              </button>
            </div>
          </div>
          {/* Right Image */}
          <div className="w-full md:w-1/2 relative bg-gray-200">
             <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop" alt="Chef preparing food" className="w-full h-full object-cover object-center absolute inset-0" />
          </div>
        </div>
      </section>

      {/* Our Essentials */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h3 className="text-xl font-serif uppercase tracking-widest mb-16 text-[#111]">Our Essentials</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {essentials.map((item, idx) => (
            <div key={idx} className="group flex flex-col text-center">
              <div className="bg-[#f2f2f2] aspect-[4/5] mb-6 overflow-hidden relative cursor-pointer" onClick={() => showToast(`View ${item.name}`)}>
                <img src={item.img} alt={item.name} className="w-full h-full object-cover object-center mix-blend-darken p-8 group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h4 className="font-bold text-[13px] text-[#222] mb-1 font-serif uppercase tracking-wide">{item.name}</h4>
              <p className="text-[13px] text-gray-500 mb-6 font-sans">{item.price}</p>
              <button onClick={() => showToast(`Added ${item.name} to cart`)} className="w-full border border-gray-300 hover:border-black text-[#222] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors">
                Add To Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories (Grid) */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h3 className="text-xl font-serif text-center uppercase tracking-widest mb-16 text-[#111]">Featured Categories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
          {/* Large Left */}
          <div className="md:col-span-1 h-[400px] md:h-full relative group cursor-pointer overflow-hidden bg-gray-100" onClick={() => showToast('Chef Jackets Category')}>
            <img src="https://images.unsplash.com/photo-1581349485608-9469926a8e5e?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" alt="Chef Jackets" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <span className="bg-white/90 px-6 py-3 text-[11px] font-bold tracking-widest uppercase text-black">Chef Jackets</span>
            </div>
          </div>
          
          {/* Middle/Right Grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-6 h-[400px] md:h-full">
             <div className="col-span-2 relative group cursor-pointer overflow-hidden bg-gray-100" onClick={() => showToast('Aprons Category')}>
                <img src="/images/chef_apron.png" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-darken" alt="Aprons" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/90 px-6 py-3 text-[11px] font-bold tracking-widest uppercase text-black border border-black/10">Aprons</span>
                </div>
             </div>
             <div className="col-span-1 relative group cursor-pointer overflow-hidden bg-gray-100" onClick={() => showToast('Pants Category')}>
                <img src="https://images.unsplash.com/photo-1583338917451-face2751d8d5?q=80&w=500&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" alt="Pants" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="bg-white/90 px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-black">Pants</span>
                </div>
             </div>
             <div className="col-span-1 relative group cursor-pointer overflow-hidden bg-gray-100" onClick={() => showToast('Accessories Category')}>
                <img src="/images/chef_jacket.png" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-darken p-4" alt="Accessories" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/90 px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-black border border-black/10">Accessories</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Performance & Style Banner */}
      <section className="my-20 relative h-[500px]">
        <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Chefs working" />
        <div className="absolute inset-0 bg-black/60 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 uppercase tracking-wider">
              Designed For<br/>Performance & Style
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-10 max-w-md">
              Our culinary apparel is engineered to withstand the heat of the kitchen while maintaining a sharp, professional appearance that reflects your dedication to the craft.
            </p>
            <button onClick={() => showToast('Explore collection')} className="bg-white text-black px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* Customer Favorites */}
      <section className="max-w-7xl mx-auto px-6 py-10 text-center">
        <h3 className="text-xl font-serif uppercase tracking-widest mb-16 text-[#111]">Customer Favorites</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {favorites.map((item, idx) => (
            <div key={idx} className="group flex flex-col text-center">
              <div className="bg-[#f2f2f2] aspect-[4/5] mb-6 overflow-hidden relative cursor-pointer" onClick={() => showToast(`View ${item.name}`)}>
                <img src={item.img} alt={item.name} className="w-full h-full object-cover object-center mix-blend-darken p-8 group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h4 className="font-bold text-[13px] text-[#222] mb-1 font-serif uppercase tracking-wide">{item.name}</h4>
              <p className="text-[13px] text-gray-500 mb-6 font-sans">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f0f0f0] border-t border-gray-200 pt-20 pb-10 font-sans mt-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <h4 className="text-2xl font-serif font-black tracking-widest text-[#111] mb-6">ATELIER</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Professional attire crafted for the modern culinary expert. Designed in Paris, worn globally.
            </p>
            <div className="flex gap-4 text-gray-500">
              <Instagram className="w-4 h-4 cursor-pointer hover:text-black transition-colors" />
              <Facebook className="w-4 h-4 cursor-pointer hover:text-black transition-colors" />
              <Twitter className="w-4 h-4 cursor-pointer hover:text-black transition-colors" />
            </div>
          </div>
          
          {/* Links */}
          <div className="md:col-span-1">
            <h5 className="text-[10px] font-bold tracking-widest uppercase text-gray-900 mb-6">Shop</h5>
            <ul className="space-y-4 text-xs text-gray-500">
              <li><a href="#!" className="hover:text-black transition-colors">Chef Jackets</a></li>
              <li><a href="#!" className="hover:text-black transition-colors">Aprons</a></li>
              <li><a href="#!" className="hover:text-black transition-colors">Pants & Footwear</a></li>
              <li><a href="#!" className="hover:text-black transition-colors">Accessories</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h5 className="text-[10px] font-bold tracking-widest uppercase text-gray-900 mb-6">Company</h5>
            <ul className="space-y-4 text-xs text-gray-500">
              <li><a href="#!" className="hover:text-black transition-colors">Our Story</a></li>
              <li><a href="#!" className="hover:text-black transition-colors">Sustainability</a></li>
              <li><a href="#!" className="hover:text-black transition-colors">Journal</a></li>
              <li><a href="#!" className="hover:text-black transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1">
             <h5 className="text-[10px] font-bold tracking-widest uppercase text-gray-900 mb-6">Subscribe</h5>
             <p className="text-xs text-gray-500 mb-4">Sign up for early access to new collections and exclusive offers.</p>
             <div className="flex flex-col gap-3">
               <input type="email" placeholder="Email Address" className="w-full bg-transparent border border-gray-300 px-4 py-3 text-xs focus:outline-none focus:border-black transition-colors" />
               <button onClick={() => showToast('Subscribed to Newsletter!')} className="w-full bg-[#111] text-white px-4 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors">
                 Subscribe
               </button>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-medium tracking-wide">
          <p>&copy; {new Date().getFullYear()} ATELIER PROFESSIONAL ATTIRE.</p>
          <div className="flex gap-6">
            <a href="#!" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <a href="#!" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-black text-white px-6 py-4 rounded shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span className="font-sans font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
