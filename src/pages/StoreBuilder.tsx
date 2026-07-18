import React, { useState } from 'react';
import { ShoppingBag, Globe, Palette, Settings, Plus, Monitor, Smartphone, CheckCircle, ExternalLink, Box, X, Search, LayoutTemplate, Paintbrush, Image as ImageIcon, Check } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

const THEMES = [
  { id: 'streetwear', name: 'Streetwear Pro', layout: 'hero-center', defaultColor: '#0f172a', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
  { id: 'minimalist', name: 'Minimalist', layout: 'split-screen', defaultColor: '#171717', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1489987707023-afc7f93c6508?q=80&w=800&auto=format&fit=crop' },
  { id: 'abaya', name: 'Luxury Abaya', layout: 'elegant', defaultColor: '#b48a44', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop' },
  { id: 'sportswear', name: 'Active Sport', layout: 'hero-center', defaultColor: '#84cc16', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop' },
  { id: 'eco', name: 'Eco Nature', layout: 'split-screen', defaultColor: '#4d7c0f', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=800&auto=format&fit=crop' },
  { id: 'kids', name: 'Playful Kids', layout: 'playful', defaultColor: '#0ea5e9', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' }
];

export default function StoreBuilder() {
  const { isAr } = useLang();
  const [activeTab, setActiveTab] = useState<'themes' | 'design' | 'products' | 'apps' | 'settings'>('themes');
  const [storeName, setStoreName] = useState('My Brand');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop'|'mobile'>('desktop');
  
  // Customization States (The PRO way)
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [primaryColor, setPrimaryColor] = useState(THEMES[0].defaultColor);
  const [fontFamily, setFontFamily] = useState(THEMES[0].defaultFont);
  const [heroImage, setHeroImage] = useState(THEMES[0].previewImg);
  
  const [cartCount, setCartCount] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState([
    { id: 1, name: 'Premium Hoodie', price: '450.00' },
    { id: 2, name: 'Essential T-Shirt', price: '150.00' }
  ]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });

  const [storePages, setStorePages] = useState([
    { id: 'home', title: 'Home', isDefault: true },
    { id: 'collections', title: 'Collections', isDefault: true },
    { id: 'about', title: 'About', isDefault: false }
  ]);
  const [newPageTitle, setNewPageTitle] = useState('');

  const applyTheme = (theme: typeof THEMES[0]) => {
     setActiveTheme(theme);
     setPrimaryColor(theme.defaultColor);
     setFontFamily(theme.defaultFont);
     setHeroImage(theme.previewImg);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
     e.stopPropagation();
     setCartCount(c => c + 1);
  };

  // --- DYNAMIC LAYOUT COMPONENTS ---

  const LayoutHeroCenter = ({ isModal = false, page, setPage, activeProductId, navigateToProduct }: any) => (
    <div className={`w-full min-h-full bg-white text-slate-900 ${fontFamily} flex flex-col`}>
      <div className={`p-6 flex justify-between items-center border-b border-slate-100 ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : ''}`}>
         <h2 onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-tighter cursor-pointer">{storeName}</h2>
         <div className={`flex gap-6 text-sm font-bold ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer capitalize hover:opacity-70 transition-opacity" style={{ color: page === p.id ? primaryColor : '#64748b' }}>{p.title}</span>
            ))}
         </div>
         <button className="relative hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>{cartCount}</span>}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {page === 'home' && (
          <>
            <div className={`h-[${isModal ? '600px' : '400px'}] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center relative`} style={{ backgroundImage: `url(${heroImage})` }}>
               <div className="absolute inset-0 bg-black/60"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <h1 className={`${isModal ? 'text-7xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter mb-4`}>New Collection</h1>
                  <p className="text-white/90 text-lg mb-8 max-w-md">Discover our latest premium quality garments.</p>
                  <button onClick={() => setPage('collections')} className="px-8 py-3 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded" style={{ backgroundColor: primaryColor }}>Shop Now</button>
               </div>
            </div>
            <div className={`${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full`}>
               <h3 className="text-2xl font-black uppercase text-center mb-10">Trending Now</h3>
               <div className={`grid gap-8 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-4' : 'grid-cols-3')}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                           <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>
                           <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity ${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-slate-500 text-sm mt-1">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full`}>
               <h3 className="text-2xl font-black uppercase text-center mb-10">All Products</h3>
               <div className={`grid gap-8 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-4' : 'grid-cols-3')}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                           <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>
                           <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity ${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-slate-500 text-sm mt-1">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-16 max-w-3xl' : 'p-8'} mx-auto w-full text-center mt-10`}>
              <h3 className="text-3xl font-black uppercase mb-6 text-slate-800">About {storeName}</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-12 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : ''}`}>
                    <div className="flex-1 aspect-[4/5] bg-slate-100 rounded-2xl flex items-center justify-center">
                       <ImageIcon className="w-20 h-20 opacity-10" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-4xl font-black mb-4">{p.name}</h2>
                       <p className="text-2xl font-bold mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <p className="text-slate-500 mb-8 leading-relaxed">This is a premium quality product. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                       <button onClick={handleAddToCart} className="w-max px-12 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );

  const LayoutSplitScreen = ({ isModal = false, page, setPage, activeProductId, navigateToProduct }: any) => (
    <div className={`w-full min-h-full bg-[#f8f9fa] text-[#212529] ${fontFamily} flex flex-col`}>
      <div className={`px-8 py-6 flex justify-between items-center bg-white ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : ''}`}>
         <div className={`flex gap-8 text-sm ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className={`cursor-pointer capitalize pb-1 border-b-2 ${page === p.id ? 'border-current' : 'border-transparent text-gray-400'}`}>{p.title}</span>
            ))}
         </div>
         <h2 onClick={() => setPage('home')} className="text-3xl font-normal tracking-wide cursor-pointer" style={{ color: primaryColor }}>{storeName}</h2>
         <button className="relative" onClick={() => alert('Panier cliqué !')}>
            <ShoppingBag className="w-6 h-6 font-light" />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>{cartCount}</span>}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {page === 'home' && (
          <>
            <div className={`flex ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-row'} h-[${isModal ? '600px' : '400px'}] bg-white`}>
               <div className="flex-1 flex flex-col justify-center p-12">
                  <h1 className="text-5xl font-light leading-tight mb-6" style={{ color: primaryColor }}>Elegance in <br/>Simplicity.</h1>
                  <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">Experience a collection defined by pure lines and organic materials.</p>
                  <button onClick={() => setPage('collections')} className="w-max px-10 py-4 text-white text-sm tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>DISCOVER</button>
               </div>
               <div className="flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}></div>
            </div>
            <div className={`${isModal ? 'p-20' : 'p-8'} mx-auto w-full`}>
               <div className="flex justify-between items-end mb-12 border-b pb-4">
                  <h3 className="text-2xl font-light">New Arrivals</h3>
                  <span className="text-sm cursor-pointer hover:underline" style={{ color: primaryColor }}>View all</span>
               </div>
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[4/5] bg-gray-100 mb-6 overflow-hidden relative">
                           <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={handleAddToCart} className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">ADD TO CART</button>
                           </div>
                        </div>
                        <h4 className="font-medium text-lg mb-2">{p.name}</h4>
                        <p className="text-gray-500">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-20' : 'p-8'} mx-auto w-full`}>
               <div className="flex justify-between items-end mb-12 border-b pb-4">
                  <h3 className="text-2xl font-light">All Products</h3>
               </div>
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[4/5] bg-gray-100 mb-6 overflow-hidden relative">
                           <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={handleAddToCart} className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">ADD TO CART</button>
                           </div>
                        </div>
                        <h4 className="font-medium text-lg mb-2">{p.name}</h4>
                        <p className="text-gray-500">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-20 max-w-4xl' : 'p-8'} mx-auto w-full text-center mt-12`}>
              <h3 className="text-4xl font-light mb-8">About {storeName}</h3>
              <p className="text-gray-500 text-xl font-light leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-20 max-w-5xl' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-16 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : ''}`}>
                    <div className="flex-1 aspect-[3/4] bg-gray-100 relative">
                       <ImageIcon className="w-20 h-20 opacity-10 absolute inset-0 m-auto" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-5xl font-light mb-4">{p.name}</h2>
                       <p className="text-2xl font-light text-gray-500 mb-8">{p.price} MAD</p>
                       <p className="text-gray-500 mb-12 leading-relaxed font-light">Experience true elegance with this meticulously designed piece. Perfect for every occasion.</p>
                       <button onClick={handleAddToCart} className="w-max px-12 py-4 bg-black text-white text-xs tracking-widest hover:bg-gray-800 transition-colors">ADD TO CART</button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );

  const LayoutElegant = ({ isModal = false, page, setPage, activeProductId, navigateToProduct }: any) => (
    <div className={`w-full min-h-full bg-[#111] text-[#f5f5f5] ${fontFamily} flex flex-col`}>
      <div className={`p-8 flex flex-col items-center gap-6 border-b border-white/10 ${previewDevice === 'mobile' && !isModal ? 'p-4' : ''}`}>
         <h2 onClick={() => setPage('home')} className="text-4xl font-serif tracking-widest cursor-pointer" style={{ color: primaryColor }}>{storeName}</h2>
         <div className={`flex gap-12 text-xs tracking-widest uppercase ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer hover:text-white transition-colors" style={{ color: page === p.id ? primaryColor : '#888' }}>{p.title}</span>
            ))}
            <span className="cursor-pointer hover:text-white flex items-center gap-2" onClick={() => alert('Panier cliqué !')}>
               CART ({cartCount})
            </span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {page === 'home' && (
          <>
            <div className="p-8">
               <div className={`w-full h-[${isModal ? '700px' : '500px'}] bg-cover bg-center relative rounded-sm border`} style={{ backgroundImage: `url(${heroImage})`, borderColor: `${primaryColor}40` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                     <div>
                        <h1 className="text-5xl font-serif mb-4">The Royal Edit.</h1>
                        <button onClick={() => setPage('collections')} className="px-8 py-3 text-xs tracking-widest border transition-colors" style={{ borderColor: primaryColor, color: primaryColor }}>EXPLORE COLLECTION</button>
                     </div>
                  </div>
               </div>
            </div>
            <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`}>
               <h3 className="text-xl tracking-widest uppercase text-center mb-16" style={{ color: primaryColor }}>Curated Selection</h3>
               <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer relative aspect-square bg-[#1a1a1a] border border-white/5 p-4 flex flex-col items-center justify-center" onClick={() => navigateToProduct(p.id)}>
                        <ImageIcon className="w-16 h-16 opacity-10 mb-8" />
                        <h4 className="font-serif text-2xl mb-2 group-hover:text-white transition-colors" style={{ color: primaryColor }}>{p.name}</h4>
                        <p className="text-white/50 tracking-widest text-sm mb-6">{p.price} MAD</p>
                        <button onClick={handleAddToCart} className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 bg-white text-black text-xs tracking-widest">ADD TO CART</button>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`}>
               <h3 className="text-xl tracking-widest uppercase text-center mb-16" style={{ color: primaryColor }}>All Products</h3>
               <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer relative aspect-square bg-[#1a1a1a] border border-white/5 p-4 flex flex-col items-center justify-center" onClick={() => navigateToProduct(p.id)}>
                        <ImageIcon className="w-16 h-16 opacity-10 mb-8" />
                        <h4 className="font-serif text-2xl mb-2 group-hover:text-white transition-colors" style={{ color: primaryColor }}>{p.name}</h4>
                        <p className="text-white/50 tracking-widest text-sm mb-6">{p.price} MAD</p>
                        <button onClick={handleAddToCart} className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 bg-white text-black text-xs tracking-widest">ADD TO CART</button>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-16 max-w-3xl' : 'p-8'} mx-auto w-full text-center mt-12`}>
              <h3 className="text-3xl font-serif mb-8 text-white">About {storeName}</h3>
              <p className="text-[#888] text-lg tracking-wide leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-16 max-w-5xl' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-16 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : ''}`}>
                    <div className="flex-1 aspect-[3/4] bg-[#1a1a1a] border border-white/5 flex items-center justify-center">
                       <ImageIcon className="w-20 h-20 opacity-10" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-5xl font-serif mb-4 text-white">{p.name}</h2>
                       <p className="text-2xl tracking-widest mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <div className="w-12 h-px bg-white/20 mb-8"></div>
                       <p className="text-[#888] mb-12 tracking-wide leading-relaxed">Embrace luxury with this exclusive item. Crafted with precision for the modern elegant individual.</p>
                       <button onClick={handleAddToCart} className="w-max px-12 py-4 bg-white text-black text-xs tracking-widest hover:bg-gray-200 transition-colors">ADD TO CART</button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );

  const LayoutPlayful = ({ isModal = false, page, setPage, activeProductId, navigateToProduct }: any) => (
    <div className={`w-full min-h-full bg-white text-slate-900 ${fontFamily} flex flex-col`}>
      <div className={`p-4 mx-4 mt-4 bg-slate-100 rounded-full flex justify-between items-center ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4 rounded-3xl' : ''}`}>
         <h2 onClick={() => setPage('home')} className="text-2xl font-black tracking-tight cursor-pointer px-4" style={{ color: primaryColor }}>{storeName}</h2>
         <div className={`flex gap-2 text-sm font-bold ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer capitalize px-4 py-2 rounded-full transition-colors" style={{ backgroundColor: page === p.id ? primaryColor : 'transparent', color: page === p.id ? '#fff' : '#64748b' }}>{p.title}</span>
            ))}
         </div>
         <button className="relative p-3 bg-white rounded-full shadow-sm hover:scale-105 transition-transform mr-1" onClick={() => alert('Panier cliqué !')}>
            <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm" style={{ backgroundColor: '#f43f5e' }}>{cartCount}</span>}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-6">
        {page === 'home' && (
          <>
            <div className="px-4">
               <div className={`h-[${isModal ? '500px' : '300px'}] rounded-[2rem] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center relative overflow-hidden`} style={{ backgroundImage: `url(${heroImage})` }}>
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                  <div className="relative z-10 flex flex-col items-center p-8 bg-white/90 rounded-[2rem] shadow-xl border-4 border-white">
                     <h1 className={`${isModal ? 'text-6xl' : 'text-4xl'} font-black tracking-tight mb-2`} style={{ color: primaryColor }}>Fun & Fresh!</h1>
                     <p className="text-slate-600 font-medium mb-6 max-w-sm">Colorful, comfortable, and made for play.</p>
                     <button onClick={() => setPage('collections')} className="px-8 py-4 text-white font-black tracking-wide text-sm hover:scale-110 transition-transform rounded-full shadow-lg" style={{ backgroundColor: primaryColor }}>LET'S SHOP 🎈</button>
                  </div>
               </div>
            </div>
            <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-6'} mx-auto w-full`}>
               <h3 className="text-3xl font-black text-center mb-10 text-slate-800">New Arrivals ✨</h3>
               <div className={`grid gap-6 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-4' : 'grid-cols-2')}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer bg-slate-50 p-4 rounded-3xl hover:bg-slate-100 transition-colors border-2 border-transparent hover:border-current" style={{ borderColor: primaryColor }} onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-square bg-white mb-4 overflow-hidden relative rounded-2xl shadow-sm flex items-center justify-center">
                           <ImageIcon className="w-12 h-12 opacity-10" />
                           <div className={`absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                              <button onClick={handleAddToCart} className="px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition-transform" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-base text-center text-slate-700">{p.name}</h4>
                        <p className="text-center font-black mt-1" style={{ color: primaryColor }}>{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-6'} mx-auto w-full`}>
               <h3 className="text-3xl font-black text-center mb-10 text-slate-800">All Products ✨</h3>
               <div className={`grid gap-6 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-4' : 'grid-cols-2')}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer bg-slate-50 p-4 rounded-3xl hover:bg-slate-100 transition-colors border-2 border-transparent hover:border-current" style={{ borderColor: primaryColor }} onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-square bg-white mb-4 overflow-hidden relative rounded-2xl shadow-sm flex items-center justify-center">
                           <ImageIcon className="w-12 h-12 opacity-10" />
                           <div className={`absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                              <button onClick={handleAddToCart} className="px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition-transform" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-base text-center text-slate-700">{p.name}</h4>
                        <p className="text-center font-black mt-1" style={{ color: primaryColor }}>{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-16 max-w-3xl' : 'p-6'} mx-auto w-full text-center mt-10 bg-slate-100 rounded-[3rem] p-12`}>
              <h3 className="text-4xl font-black mb-6 text-slate-800">About {storeName}</h3>
              <p className="text-slate-600 text-xl font-bold leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-12 bg-slate-50 p-8 rounded-[3rem] ${previewDevice === 'mobile' && !isModal ? 'flex-col' : ''}`}>
                    <div className="flex-1 aspect-square bg-white rounded-[2rem] flex items-center justify-center shadow-sm">
                       <ImageIcon className="w-20 h-20 opacity-10" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-4">
                       <h2 className="text-5xl font-black mb-4 text-slate-800">{p.name}</h2>
                       <p className="text-3xl font-black mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <p className="text-slate-500 font-medium mb-8 text-lg">Fun, fresh, and perfectly designed for everyday adventures!</p>
                       <button onClick={handleAddToCart} className="w-max px-12 py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl" style={{ backgroundColor: primaryColor }}>Buy Now 🎈</button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );

  const StorePreviewWrapper = ({ isModal = false }) => {
    const [page, setPage] = useState('home');
    const [activeProductId, setActiveProductId] = useState<any>(null);

    const navigateToProduct = (id: any) => {
        setActiveProductId(id);
        setPage('product');
    };

    const props = { isModal, page, setPage, activeProductId, navigateToProduct };

    if (activeTheme.layout === 'hero-center') return <LayoutHeroCenter {...props} />;
    if (activeTheme.layout === 'split-screen') return <LayoutSplitScreen {...props} />;
    if (activeTheme.layout === 'elegant') return <LayoutElegant {...props} />;
    if (activeTheme.layout === 'playful') return <LayoutPlayful {...props} />;
    return <LayoutHeroCenter {...props} />;
  };

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'} bg-slate-50 min-h-screen p-6`}>
      {/* Top Navigation / Back Button */}
      <div className="flex items-center justify-between mb-4">
         <button onClick={() => window.location.href = '#/'} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            ← Retour à BEYA ERP
         </button>
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">SaaS Builder Active</span>
         </div>
      </div>

      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">BEYA STORE PRO</h1>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase tracking-widest">SaaS ÉDITION</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Gérez la boutique e-commerce de votre client de A à Z.</p>
        </div>
        <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
            <ExternalLink className="w-4 h-4" /> Prévisualiser
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all shadow-sm">
            <Globe className="w-4 h-4" /> Publier
          </button>
        </div>
      </div>

      <div className={`flex gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
        {/* Left Sidebar - Controls */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className={`flex border-b border-slate-200 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
              {[
                 { id: 'themes', icon: LayoutTemplate, label: 'Thèmes' },
                 { id: 'design', icon: Paintbrush, label: 'Design' },
                 { id: 'products', icon: ShoppingBag, label: 'Produits' },
                 { id: 'apps', icon: Box, label: 'Apps' },
                 { id: 'settings', icon: Settings, label: 'Config' }
              ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex-1 py-3 px-1 text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                   <tab.icon className="w-4 h-4" /> {tab.label}
                 </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto max-h-[600px]">
              {/* THEMES TAB */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thème Actif</label>
                    <div className="border-2 border-indigo-600 rounded-xl p-1 relative bg-slate-50">
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg z-10"><CheckCircle className="w-3 h-3" /></div>
                      <div className="aspect-video bg-cover bg-center rounded-lg mb-2 relative" style={{ backgroundImage: `url(${activeTheme.previewImg})` }}>
                         <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black tracking-widest uppercase drop-shadow-md">{activeTheme.name}</span>
                         </div>
                      </div>
                      <p className="text-xs font-bold text-slate-800 text-center py-1">Layout: {activeTheme.layout}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Catalogue de Thèmes</label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.filter(t => t.id !== activeTheme.id).map(t => (
                        <div 
                           key={t.id} 
                           onClick={() => applyTheme(t)}
                           className="border border-slate-200 rounded-xl p-1 cursor-pointer hover:border-indigo-500 transition-all opacity-80 hover:opacity-100 group"
                        >
                          <div className="aspect-video bg-cover bg-center rounded-lg mb-1 relative" style={{ backgroundImage: `url(${t.previewImg})` }}>
                             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                <span className="text-white text-[8px] font-black tracking-widest uppercase text-center px-1">{t.name}</span>
                             </div>
                          </div>
                          <p className="text-[9px] font-bold text-slate-500 text-center">{t.layout}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DESIGN TAB (NEW!) */}
              {activeTab === 'design' && (
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Couleur Principale</label>
                       <div className="flex items-center gap-3 mb-3">
                          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                          <span className="text-sm font-mono text-slate-600">{primaryColor.toUpperCase()}</span>
                       </div>
                       <div className="flex gap-2">
                          {['#0f172a', '#171717', '#b48a44', '#84cc16', '#4d7c0f', '#0ea5e9', '#e11d48'].map(c => (
                             <button key={c} onClick={() => setPrimaryColor(c)} className="w-6 h-6 rounded-full border border-black/10 shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                          ))}
                       </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Typographie</label>
                       <div className="space-y-2">
                          <button onClick={() => setFontFamily('font-sans')} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${fontFamily === 'font-sans' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                             <span className="font-sans font-medium">Inter / Roboto (Sans-serif)</span>
                             {fontFamily === 'font-sans' && <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setFontFamily('font-serif')} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${fontFamily === 'font-serif' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                             <span className="font-serif font-medium">Playfair / Merriweather (Serif)</span>
                             {fontFamily === 'font-serif' && <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setFontFamily('font-mono')} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${fontFamily === 'font-mono' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                             <span className="font-mono font-medium">Space Mono (Monospace)</span>
                             {fontFamily === 'font-mono' && <Check className="w-4 h-4" />}
                          </button>
                       </div>
                    </div>
                 </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom de la marque</label>
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domaine (URL)</label>
                    <div className="flex items-center">
                      <input type="text" value={storeName.toLowerCase().replace(/\s+/g, '')} disabled className="w-full px-3 py-2 border border-slate-200 rounded-l-lg text-sm font-medium bg-slate-50 text-slate-500" />
                      <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs font-bold text-slate-500">.beyacreative.com</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">Ajouter un Produit</h4>
                    <div className="space-y-3">
                       <input 
                         type="text" 
                         placeholder="Nom du produit (ex: T-Shirt)" 
                         value={newProduct.name}
                         onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                       />
                       <input 
                         type="number" 
                         placeholder="Prix (MAD)" 
                         value={newProduct.price}
                         onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                       />
                       <button 
                         onClick={() => {
                            if(newProduct.name && newProduct.price) {
                               setStoreProducts([{ id: Date.now(), ...newProduct }, ...storeProducts]);
                               setNewProduct({ name: '', price: '' });
                            }
                         }}
                         className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
                       >
                         Ajouter
                       </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <div className="flex-1 h-px bg-slate-200"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OU</span>
                     <div className="flex-1 h-px bg-slate-200"></div>
                  </div>

                  <button onClick={() => setIsImportModalOpen(true)} className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex flex-col items-center justify-center gap-1">
                    <Plus className="w-5 h-5" /> Importer depuis l'ERP
                  </button>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Catalogue ({storeProducts.length})</h4>
                    <div className="space-y-2">
                       {storeProducts.map(p => (
                          <div key={p.id} className="p-3 border border-slate-100 bg-white rounded-xl flex items-center gap-3 shadow-sm hover:border-indigo-200 transition-colors">
                             <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                                <Box className="w-5 h-5 text-slate-400" />
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">{p.name}</p>
                                <p className="text-[10px] font-black text-indigo-600">{p.price} MAD</p>
                             </div>
                             <button 
                               onClick={() => setStoreProducts(storeProducts.filter(x => x.id !== p.id))}
                               className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                             >
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {/* APPS TAB */}
              {activeTab === 'apps' && (
                 <div className="space-y-4">
                     <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4">
                        <h4 className="text-xs font-black text-indigo-800 mb-1">App Store BEYA</h4>
                        <p className="text-[10px] text-indigo-600">Installez des plugins pour booster vos ventes.</p>
                     </div>
                     <div className="space-y-3">
                        <div className="p-3 border border-slate-200 rounded-xl flex items-center gap-3">
                           <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-slate-800">WhatsApp Chat</p>
                           </div>
                           <button className="px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold">Ajouter</button>
                        </div>
                     </div>
                  </div>
               )}

               {/* SETTINGS TAB */}
               {activeTab === 'settings' && (
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <h4 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wider">Nom de la boutique</h4>
                       <input 
                         type="text" 
                         value={storeName} 
                         onChange={e => setStoreName(e.target.value)} 
                         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 mt-2"
                       />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                         <LayoutTemplate className="w-4 h-4 text-indigo-600" /> Gestion des Pages
                       </h4>
                       
                       <div className="flex gap-2 mb-4">
                          <input 
                            type="text" 
                            placeholder="Titre (ex: Contact)" 
                            value={newPageTitle}
                            onChange={e => setNewPageTitle(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                          />
                          <button 
                            onClick={() => {
                               if(newPageTitle) {
                                  const id = newPageTitle.toLowerCase().replace(/\s+/g, '-');
                                  setStorePages([...storePages, { id, title: newPageTitle, isDefault: false }]);
                                  setNewPageTitle('');
                               }
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                          >
                            Ajouter
                          </button>
                       </div>

                       <div className="space-y-2">
                          {storePages.map(page => (
                             <div key={page.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <div className="flex items-center gap-3">
                                   <div className={`w-2 h-2 rounded-full ${page.isDefault ? 'bg-indigo-400' : 'bg-green-400'}`}></div>
                                   <span className="text-sm font-bold text-slate-700">{page.title}</span>
                                </div>
                                {!page.isDefault && (
                                   <button 
                                     onClick={() => setStorePages(storePages.filter(p => p.id !== page.id))}
                                     className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                   >
                                     <X className="w-4 h-4" />
                                   </button>
                                )}
                                {page.isDefault && (
                                   <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 bg-slate-200 rounded-md">Système</span>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Area - Live Preview */}
        <div className="flex-1 bg-slate-100 rounded-3xl border-4 border-slate-200 overflow-hidden flex flex-col relative min-h-[600px]">
          {/* Browser Header */}
          <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-md ${previewDevice === 'desktop' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-100'}`}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-md ${previewDevice === 'mobile' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-100'}`}><Smartphone className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Iframe / Preview Area */}
          <div className="flex-1 bg-slate-200 relative overflow-y-auto flex items-start justify-center p-4">
             <div className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden ${previewDevice === 'mobile' ? 'w-[375px] h-[812px] rounded-[2rem] border-[8px] border-slate-800' : 'w-full min-h-full rounded-lg'}`}>
                <StorePreviewWrapper />
             </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col">
          <div className="bg-slate-800 text-white p-4 flex items-center justify-between shadow-xl z-10">
            <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors">
              Fermer l'aperçu
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center">
             <div className="w-full">
                <StorePreviewWrapper isModal={true} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
