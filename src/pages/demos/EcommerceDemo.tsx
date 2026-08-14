import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, User, Heart, ChevronRight, Star, ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';
import { useParams, Navigate } from 'react-router-dom';

const THEME_CONFIGS: Record<string, any> = {
  'minimalist': {
    name: 'MINIMALIST.',
    colors: { bg: 'bg-white', text: 'text-slate-900', primary: 'bg-slate-900 text-white', accent: 'text-slate-900', border: 'border-slate-200' },
    hero: {
      image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=2000&auto=format&fit=crop',
      title: 'Less is More.',
      subtitle: 'Discover our new collection of premium essential electronics designed for the modern lifestyle.',
      btn: 'Shop Essentials'
    },
    products: [
      { name: 'Minimalist Keyboard', price: '$129.00', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600' },
      { name: 'Wireless Headphones', price: '$249.00', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600', badge: 'New' },
      { name: 'Desk Organizer', price: '$49.00', img: 'https://images.unsplash.com/photo-1528731700624-910ec3f3097c?q=80&w=600' },
      { name: 'Aluminium Stand', price: '$39.00', img: 'https://images.unsplash.com/photo-1585565804112-f201f68c48b4?q=80&w=600' }
    ]
  },
  'streetwear': {
    name: 'STREETWEAR PRO',
    colors: { bg: 'bg-black', text: 'text-white', primary: 'bg-red-600 text-white hover:bg-red-700', accent: 'text-red-500', border: 'border-slate-800' },
    hero: {
      image: 'https://images.unsplash.com/photo-1523398002811-999aa8d08124?q=80&w=2000&auto=format&fit=crop',
      title: 'DROP 004 IS LIVE',
      subtitle: 'Limited edition urban wear. Once it is gone, it is gone forever.',
      btn: 'COP NOW'
    },
    products: [
      { name: 'Oversized Graphic Tee', price: '$45.00', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600' },
      { name: 'Cargo Pants V2', price: '$85.00', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600', badge: 'Sold Out' },
      { name: 'Utility Vest', price: '$110.00', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600' },
      { name: 'Street Beanie', price: '$25.00', img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600' }
    ]
  },
  'mazia': {
    name: 'MAZIA COSMETICS',
    colors: { bg: 'bg-rose-50', text: 'text-rose-950', primary: 'bg-rose-400 text-white hover:bg-rose-500', accent: 'text-rose-500', border: 'border-rose-200' },
    hero: {
      image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2000&auto=format&fit=crop',
      title: 'Pure Beauty, Naturally.',
      subtitle: 'Cruelty-free, vegan skincare that loves your skin as much as you do.',
      btn: 'Shop Skincare'
    },
    products: [
      { name: 'Hydrating Serum', price: '$34.00', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600' },
      { name: 'Rose Water Toner', price: '$22.00', img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600', badge: 'Best Seller' },
      { name: 'Vitamin C Cream', price: '$45.00', img: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600' },
      { name: 'Gua Sha Stone', price: '$18.00', img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=600' }
    ]
  },
  'luxury-perfume': {
    name: 'AURA NOCTURNE',
    colors: { bg: 'bg-[#0a0a0a]', text: 'text-amber-100', primary: 'bg-amber-600 text-white hover:bg-amber-700', accent: 'text-amber-500', border: 'border-amber-900/30' },
    hero: {
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop',
      title: 'The Essence of Luxury',
      subtitle: 'Crafted by master perfumers using the rarest ingredients in the world.',
      btn: 'Discover the Collection'
    },
    products: [
      { name: 'Oud Imperial', price: '$285.00', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600' },
      { name: 'Midnight Rose', price: '$210.00', img: 'https://images.unsplash.com/photo-1595532542520-252fec2d5e35?q=80&w=600', badge: 'Signature' },
      { name: 'Amber Vanilla', price: '$195.00', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=600' },
      { name: 'Sandalwood Extrait', price: '$320.00', img: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600' }
    ]
  },
  'abaya': {
    name: 'ABAYA FASHION',
    colors: { bg: 'bg-[#faf7f2]', text: 'text-[#4a4238]', primary: 'bg-[#8c7a6b] text-white hover:bg-[#756557]', accent: 'text-[#8c7a6b]', border: 'border-[#e8e0d5]' },
    hero: {
      image: 'https://images.unsplash.com/photo-1629813589417-64665421dce3?q=80&w=2000&auto=format&fit=crop',
      title: 'Modest Elegance',
      subtitle: 'Discover our new Ramadan Collection featuring premium fabrics and exquisite tailoring.',
      btn: 'Shop Collection'
    },
    products: [
      { name: 'Silk Flow Abaya', price: '$120.00', img: 'https://images.unsplash.com/photo-1589317585847-19eb71ba9dfd?q=80&w=600' },
      { name: 'Embroidered Kaftan', price: '$180.00', img: 'https://images.unsplash.com/photo-1589317585728-6625807921c5?q=80&w=600', badge: 'Ramadan' },
      { name: 'Everyday Basic', price: '$75.00', img: 'https://images.unsplash.com/photo-1589317586558-86d49bc70b2a?q=80&w=600' },
      { name: 'Luxury Chiffon Wrap', price: '$145.00', img: 'https://images.unsplash.com/photo-1589317585521-7299a910ecb5?q=80&w=600' }
    ]
  },
  'dentist': {
    name: 'SMILE CLINIC',
    colors: { bg: 'bg-white', text: 'text-slate-800', primary: 'bg-blue-600 text-white hover:bg-blue-700', accent: 'text-blue-500', border: 'border-blue-100' },
    hero: {
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2000&auto=format&fit=crop',
      title: 'Your Perfect Smile Awaits',
      subtitle: 'Professional dental care with state-of-the-art technology in a relaxing environment.',
      btn: 'Book Appointment'
    },
    products: [
      { name: 'Teeth Whitening', price: 'from $150', img: 'https://images.unsplash.com/photo-1598256989800-fea5ce5146be?q=80&w=600' },
      { name: 'Dental Implants', price: 'Consultation', img: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=600', badge: 'Expert' },
      { name: 'Invisalign', price: 'from $2000', img: 'https://images.unsplash.com/photo-1628177142898-93e46e646067?q=80&w=600' },
      { name: 'General Checkup', price: '$85.00', img: 'https://images.unsplash.com/photo-1606214174585-fd3158dd4268?q=80&w=600' }
    ]
  }
};

export default function EcommerceDemo() {
  const { themeId } = useParams();
  const theme = THEME_CONFIGS[themeId || 'minimalist'];

  if (!theme) return <Navigate to="/" replace />;

  const [activePage, setActivePage] = useState('home');

  return (
    <div className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} font-sans transition-colors duration-500`}>
      {/* Navbar */}
      <header className={`sticky top-0 z-50 ${theme.colors.bg} ${theme.colors.border} border-b backdrop-blur-md bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-black text-2xl tracking-tighter cursor-pointer" onClick={() => setActivePage('home')}>
            {theme.name}
          </div>
          
          <nav className="hidden md:flex gap-8 font-bold text-sm">
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('home'); }} className={`hover:${theme.colors.accent} transition-colors`}>Home</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('shop'); }} className={`hover:${theme.colors.accent} transition-colors`}>Shop</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('collections'); }} className={`hover:${theme.colors.accent} transition-colors`}>Collections</a>
            <a href="#!" onClick={(e) => { e.preventDefault(); setActivePage('contact'); }} className={`hover:${theme.colors.accent} transition-colors`}>Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className={`p-2 hover:${theme.colors.accent} transition-colors`}><Search className="w-5 h-5" /></button>
            <button className={`p-2 hover:${theme.colors.accent} transition-colors`}><User className="w-5 h-5" /></button>
            <button className={`p-2 hover:${theme.colors.accent} transition-colors relative`}>
              <ShoppingBag className="w-5 h-5" />
              <span className={`absolute top-1 right-1 w-2 h-2 ${theme.colors.primary} rounded-full`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Pages Router */}
      {activePage === 'home' && (
        <main>
          {/* Hero */}
          <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={theme.hero.image} alt="Hero" className="w-full h-full object-cover scale-105" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="relative z-10 text-center text-white max-w-3xl px-6">
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">{theme.hero.title}</h1>
              <p className="text-lg md:text-xl mb-10 opacity-90">{theme.hero.subtitle}</p>
              <button onClick={() => setActivePage('shop')} className={`${theme.colors.primary} px-8 py-4 rounded-full font-bold tracking-wide uppercase transition-all transform hover:scale-105 shadow-2xl`}>
                {theme.hero.btn}
              </button>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-24 max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12 border-b pb-4" style={{ borderColor: 'inherit' }}>
              <div>
                <h2 className="text-3xl font-black">Featured Collection</h2>
                <p className="opacity-60 mt-2">Handpicked favorites for you.</p>
              </div>
              <button onClick={() => setActivePage('shop')} className={`hidden md:flex items-center gap-2 font-bold ${theme.colors.accent} hover:opacity-70 transition-opacity`}>
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {theme.products.map((product: any, idx: number) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-gray-100">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {product.badge && (
                      <div className={`absolute top-3 left-3 ${theme.colors.primary} text-xs font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                        {product.badge}
                      </div>
                    )}
                    <button className={`absolute bottom-0 inset-x-0 py-4 ${theme.colors.primary} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-2`}>
                      Add to Cart <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className={`font-medium opacity-70 mt-1`}>{product.price}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {activePage === 'shop' && (
        <main className="py-24 max-w-7xl mx-auto px-6 min-h-[70vh]">
          <h1 className="text-4xl font-black mb-12">All Products</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...theme.products, ...theme.products].map((product: any, idx: number) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-gray-100">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <button className={`absolute bottom-0 inset-x-0 py-4 ${theme.colors.primary} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-2`}>
                    Add to Cart <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className={`font-medium opacity-70 mt-1`}>{product.price}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {activePage === 'collections' && (
        <main className="py-24 max-w-7xl mx-auto px-6 min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-black mb-4">Collections</h1>
            <p className="opacity-60 text-lg">Curated sets are coming next season.</p>
          </div>
        </main>
      )}

      {activePage === 'contact' && (
        <main className="py-24 max-w-3xl mx-auto px-6 min-h-[70vh]">
          <h1 className="text-4xl font-black mb-8 text-center">Contact Us</h1>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <input type="text" placeholder="Name" className={`w-full p-4 border ${theme.colors.border} bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-current`} />
              <input type="email" placeholder="Email" className={`w-full p-4 border ${theme.colors.border} bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-current`} />
            </div>
            <textarea placeholder="Message" rows={5} className={`w-full p-4 border ${theme.colors.border} bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-current resize-none`}></textarea>
            <button className={`w-full py-4 rounded-lg font-bold ${theme.colors.primary} transition-opacity hover:opacity-90`}>Send Message</button>
          </form>
        </main>
      )}

      {/* Footer */}
      <footer className={`${theme.colors.bg} border-t ${theme.colors.border} py-12`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-black text-xl tracking-tighter">
            {theme.name}
          </div>
          <div className="flex gap-4">
            <Instagram className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            <Facebook className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            <Twitter className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
          </div>
          <p className="opacity-60 text-sm">&copy; 2026 {theme.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
