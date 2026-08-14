import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, ChevronLeft, ChevronRight, CheckCircle2, Instagram, Facebook, Link as LinkIcon } from 'lucide-react';

export default function MaziaDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-[#333] font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-[#ebdcd5] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#!" onClick={(e) => { e.preventDefault(); showToast('Redirection Shop'); }} className="hover:text-amber-800 transition-colors">Shop</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); showToast('Redirection Skincare'); }} className="hover:text-amber-800 transition-colors">Skincare</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); showToast('Redirection Makeup'); }} className="hover:text-amber-800 transition-colors">Makeup</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); showToast('Redirection Bestsellers'); }} className="hover:text-amber-800 transition-colors">Bestsellers</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); showToast('Redirection About'); }} className="hover:text-amber-800 transition-colors">About</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); showToast('Redirection Journal'); }} className="hover:text-amber-800 transition-colors">Journal</a>
          </nav>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <h1 className="text-3xl font-serif tracking-widest text-[#333] uppercase">Lumina</h1>
            <span className="text-[9px] tracking-[0.3em] text-slate-400 font-bold uppercase mt-0.5">Beauty</span>
          </div>

          <div className="flex items-center gap-5 text-slate-600">
            <div className="hidden sm:flex items-center gap-1 cursor-pointer hover:text-amber-800 transition-colors" onClick={() => showToast('Compte Utilisateur')}>
              <span className="text-sm font-medium mr-1">Account</span>
              <Heart className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-amber-800 transition-colors" onClick={() => showToast('Panier ouvert')}>
              <span className="text-sm font-medium mr-1">Cart</span>
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px] bg-[#d2a58b] text-white w-4 h-4 flex items-center justify-center rounded-full">0</span>
            </div>
            <Search className="w-4 h-4 cursor-pointer hover:text-amber-800 ml-2" onClick={() => showToast('Recherche')} />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-[#ebd8ce]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center">
          <div className="h-[400px] w-full">
            <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop" alt="Hero Model" className="w-full h-full object-cover object-right" />
          </div>
          <div className="px-12 py-16 text-left">
            <h2 className="text-4xl md:text-5xl font-serif text-[#333] leading-tight mb-4 uppercase">
              Radiant Skin<br/>Awaits.
            </h2>
            <p className="text-[#666] mb-8 font-serif italic">
              Discover the glow with our premium skincare collection.
            </p>
            <button onClick={() => showToast('Redirection Catalogue')} className="bg-[#d2a58b] hover:bg-[#c39176] text-white px-8 py-3 uppercase tracking-widest text-xs font-bold transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 max-w-6xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-serif uppercase tracking-widest mb-1 text-[#333]">Bestsellers</h3>
        <p className="text-sm text-slate-500 mb-12 font-serif italic">Collection</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Product 1 */}
          <div className="group cursor-pointer">
            <div className="bg-[#f7ebe6] aspect-square mb-4 flex items-center justify-center p-6 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop" alt="Velvet Moisturizer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <h4 className="font-bold text-[#333] text-sm">Velvet Moisturizer</h4>
            <p className="text-[#666] text-sm mb-3">$48</p>
            <button onClick={() => showToast('Ajouté au panier !')} className="w-full bg-[#dfbfa9] hover:bg-[#d2a58b] text-white py-2 text-xs font-bold tracking-widest uppercase transition-colors">
              Add To Bag
            </button>
          </div>
          {/* Product 2 */}
          <div className="group cursor-pointer">
            <div className="bg-[#f7ebe6] aspect-square mb-4 flex items-center justify-center p-6 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop" alt="Glow Serum" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <h4 className="font-bold text-[#333] text-sm">Glow Serum</h4>
            <p className="text-[#666] text-sm mb-3">$62</p>
            <button onClick={() => showToast('Ajouté au panier !')} className="w-full bg-[#dfbfa9] hover:bg-[#d2a58b] text-white py-2 text-xs font-bold tracking-widest uppercase transition-colors">
              Add To Bag
            </button>
          </div>
          {/* Product 3 */}
          <div className="group cursor-pointer">
            <div className="bg-[#f7ebe6] aspect-square mb-4 flex items-center justify-center p-6 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop" alt="Rose Blush Palette" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <h4 className="font-bold text-[#333] text-sm">Rose Blush Palette</h4>
            <p className="text-[#666] text-sm mb-3">$35</p>
            <button onClick={() => showToast('Ajouté au panier !')} className="w-full bg-[#dfbfa9] hover:bg-[#d2a58b] text-white py-2 text-xs font-bold tracking-widest uppercase transition-colors">
              Add To Bag
            </button>
          </div>
          {/* Product 4 */}
          <div className="group cursor-pointer">
            <div className="bg-[#f7ebe6] aspect-square mb-4 flex items-center justify-center p-6 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop" alt="Silk Lip Gloss" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <h4 className="font-bold text-[#333] text-sm">Silk Lip Gloss</h4>
            <p className="text-[#666] text-sm mb-3">$24</p>
            <button onClick={() => showToast('Ajouté au panier !')} className="w-full bg-[#dfbfa9] hover:bg-[#d2a58b] text-white py-2 text-xs font-bold tracking-widest uppercase transition-colors">
              Add To Bag
            </button>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="relative h-[250px] w-full flex items-center justify-center overflow-hidden">
          <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop" alt="Summer Essentials" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 text-center text-white">
             <p className="text-sm font-bold tracking-[0.2em] uppercase mb-2">New Arrivals</p>
             <h3 className="text-4xl font-serif uppercase tracking-widest mb-6">Summer Essentials</h3>
             <button onClick={() => showToast('Redirection Shop')} className="bg-[#d2a58b]/90 hover:bg-[#d2a58b] text-white px-8 py-3 uppercase tracking-widest text-xs font-bold transition-colors">
               Shop Now
             </button>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-12 max-w-5xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-serif uppercase tracking-widest mb-12 text-[#333]">Shop By Category</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="group cursor-pointer flex flex-col items-center" onClick={() => showToast('Catégorie Skincare')}>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#f7ebe6] mb-4">
               <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop" alt="Skincare" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <span className="font-serif font-bold text-[#333]">Skincare</span>
          </div>
          <div className="group cursor-pointer flex flex-col items-center" onClick={() => showToast('Catégorie Makeup')}>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#f7ebe6] mb-4">
               <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=400&auto=format&fit=crop" alt="Makeup" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <span className="font-serif font-bold text-[#333]">Makeup</span>
          </div>
          <div className="group cursor-pointer flex flex-col items-center" onClick={() => showToast('Catégorie Serums')}>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#f7ebe6] mb-4">
               <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop" alt="Serums" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <span className="font-serif font-bold text-[#333]">Serums</span>
          </div>
          <div className="group cursor-pointer flex flex-col items-center" onClick={() => showToast('Catégorie Kits')}>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#f7ebe6] mb-4">
               <img src="https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=400&auto=format&fit=crop" alt="Kits" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
            </div>
            <span className="font-serif font-bold text-[#333]">Kits</span>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="max-w-6xl mx-auto px-6 py-20">
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h3 className="text-2xl font-serif uppercase tracking-widest mb-4 text-[#333]">Our Mission</h3>
              <p className="font-serif italic font-bold mb-4 text-[#444]">Lumina Beauty: Natural, Ethical, Effective Beauty</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                We believe in harnessing the power of nature to create skincare that truly works. Our products are carefully crafted with ethically sourced ingredients, free from harmful chemicals, and always cruelty-free. Experience the difference of clean beauty that delivers visible results while respecting the environment.
              </p>
            </div>
            <div className="h-[250px]">
              <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop" alt="Mission" className="w-full h-full object-cover" />
            </div>
         </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-20 border-y border-[#ebdcd5]">
         <div className="max-w-6xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-serif uppercase tracking-widest mb-16 text-[#333]">Customer Reviews</h3>
            
            <div className="flex items-center justify-between">
              <ChevronLeft className="w-8 h-8 text-slate-300 cursor-pointer hover:text-[#d2a58b]" />
              <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto px-4">
                 <div className="flex flex-col items-center">
                    <div className="flex text-[#d2a58b] mb-3 text-xs"><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/></div>
                    <h5 className="font-bold text-sm mb-2 text-[#333]">Excellent</h5>
                    <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">"The Glow Serum has completely transformed my skin texture. It feels so hydrated and looks radiant all day long."</p>
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mb-2">
                       <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" alt="User" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Emma R.</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="flex text-[#d2a58b] mb-3 text-xs"><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/></div>
                    <h5 className="font-bold text-sm mb-2 text-[#333]">Love It</h5>
                    <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">"I am obsessed with the Velvet Moisturizer. It's so rich yet absorbs quickly without leaving a greasy residue."</p>
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mb-2">
                       <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" alt="User" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sarah M.</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="flex text-[#d2a58b] mb-3 text-xs"><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/><Heart className="fill-current w-3 h-3"/></div>
                    <h5 className="font-bold text-sm mb-2 text-[#333]">Amazing</h5>
                    <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">"The Rose Blush Palette is highly pigmented and blends effortlessly. A new staple in my makeup routine."</p>
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mb-2">
                       <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" alt="User" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Jessica T.</span>
                 </div>
              </div>
              <ChevronRight className="w-8 h-8 text-slate-300 cursor-pointer hover:text-[#d2a58b]" />
            </div>
            <div className="flex justify-center gap-2 mt-8">
               <div className="w-1.5 h-1.5 rounded-full bg-[#d2a58b]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            </div>
         </div>
      </section>

      {/* From The Journal */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center">
         <h3 className="text-2xl font-serif uppercase tracking-widest mb-1 text-[#333]">From The Journal</h3>
         <p className="text-sm text-slate-500 mb-12 font-serif italic">Blog</p>
         
         <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="group cursor-pointer" onClick={() => showToast('Article 1')}>
               <div className="h-64 bg-[#f7ebe6] mb-4 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop" alt="Blog 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               </div>
               <h4 className="font-bold text-[#333] mb-2 font-serif text-lg">5 Steps to Glow</h4>
               <p className="text-xs text-slate-500 leading-relaxed">Discover our simple 5-step routine to achieve that coveted healthy, radiant glow naturally, using our bestselling essentials.</p>
            </div>
            <div className="group cursor-pointer" onClick={() => showToast('Article 2')}>
               <div className="h-64 bg-[#f7ebe6] mb-4 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop" alt="Blog 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
               </div>
               <h4 className="font-bold text-[#333] mb-2 font-serif text-lg">The New Palette</h4>
               <p className="text-xs text-slate-500 leading-relaxed">A deep dive into our new Rose Blush Palette. Learn how to mix and match shades for the perfect sun-kissed look.</p>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f2e6e1] pt-16 pb-8 px-6 text-[#4a4238]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 mb-12">
           <div>
              <h2 className="text-xl font-serif tracking-widest uppercase mb-4">Lumina Beauty</h2>
              <p className="text-xs opacity-70 mb-6 max-w-xs">Newsletter signup for essentials, releases, skincare, promotions and more.</p>
              <div className="flex">
                 <input type="email" placeholder="Email address" className="px-4 py-2 text-sm w-full focus:outline-none" />
                 <button onClick={() => showToast('Abonné à la newsletter !')} className="bg-[#d2a58b] hover:bg-[#c39176] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">Subscribe</button>
              </div>
           </div>
           
           <div className="md:ml-auto">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
              <ul className="text-xs opacity-70 space-y-2">
                 <li><a href="#!" className="hover:text-amber-800">Help</a></li>
                 <li><a href="#!" className="hover:text-amber-800">Shipping</a></li>
                 <li><a href="#!" className="hover:text-amber-800">Returns</a></li>
                 <li><a href="#!" className="hover:text-amber-800">Contact</a></li>
              </ul>
           </div>
           
           <div className="md:ml-auto">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Social</h4>
              <div className="flex gap-4">
                 <Instagram className="w-5 h-5 cursor-pointer hover:text-amber-800" />
                 <Facebook className="w-5 h-5 cursor-pointer hover:text-amber-800" />
                 <LinkIcon className="w-5 h-5 cursor-pointer hover:text-amber-800" />
              </div>
           </div>
        </div>
        <div className="max-w-6xl mx-auto text-center border-t border-[#dfcfc7] pt-8 text-[10px] opacity-50 uppercase tracking-widest">
           Copyright &copy; {new Date().getFullYear()} Lumina Beauty. All rights reserved.
        </div>
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
