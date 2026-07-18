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
  
  const [buyMode, setBuyMode] = useState<'cart'|'direct'|'both'|'form'>('both');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<any>(null);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('#000000');

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

  const LayoutHeroCenter = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    
    return (
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
                    <div className="flex-1 aspect-[4/5] bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-4xl font-black mb-4">{p.name}</h2>
                       <p className="text-2xl font-bold mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <p className="text-slate-500 mb-8 leading-relaxed">{p.description || 'This is a premium quality product. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-8 space-y-6">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Couleur</span>
                                <div className="flex gap-3">
                                   {p.colors.map((c: string) => (
                                      <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-slate-800 scale-125' : 'border-transparent hover:scale-110 shadow-sm'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Taille</span>
                                <div className="flex flex-wrap gap-2">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-sm font-bold border rounded-lg transition-colors ${selectedSize === s ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Quantité</span>
                             <div className="flex items-center justify-between bg-slate-50 w-32 px-4 py-2 rounded-lg border border-slate-200">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-500 hover:text-slate-800 font-bold text-lg">-</button>
                                <span className="font-bold text-slate-800">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-slate-500 hover:text-slate-800 font-bold text-lg">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                             <h4 className="font-black text-slate-800 mb-2">Express Checkout</h4>
                             <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
                             <input type="text" placeholder="Phone Number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
                             <input type="text" placeholder="Delivery Address" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
                             <button onClick={() => setPage('success')} className="w-full py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg mt-2" style={{ backgroundColor: primaryColor }}>Confirm Order (COD)</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg" style={{ backgroundColor: '#1e293b' }}>Add to cart</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg" style={{ backgroundColor: primaryColor }}>Buy Now</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                 <h2 className="text-2xl font-black mb-6 text-center text-slate-800">Express Checkout</h2>
                 <div className="space-y-4">
                    <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="Phone Number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="Delivery Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                    <button onClick={() => setPage('success')} className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg mt-4" style={{ backgroundColor: primaryColor }}>Confirm Order (COD)</button>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100/50">
                 <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black mb-4 text-slate-800">Order Placed!</h2>
              <p className="text-slate-500 text-lg">Thank you! Your order has been successfully sent to the BEYA ERP system.</p>
              <button onClick={() => setPage('home')} className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Return to Home</button>
           </div>
        )}
      </div>
    </div>
  );
  };

  const LayoutSplitScreen = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
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
                        <div className="aspect-[4/5] bg-gray-100 mb-6 relative overflow-hidden flex items-center justify-center">
                           {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>}
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
                        <div className="aspect-[4/5] bg-gray-100 mb-6 relative overflow-hidden flex items-center justify-center">
                           {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>}
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
                    <div className="flex-1 relative flex items-center justify-center bg-gray-50 overflow-hidden aspect-[3/4]">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10 absolute inset-0 m-auto" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-5xl font-light mb-4">{p.name}</h2>
                       <p className="text-2xl font-light text-gray-500 mb-8">{p.price} MAD</p>
                       <p className="text-gray-500 mb-12 leading-relaxed font-light">{p.description || 'Experience true elegance with this meticulously designed piece. Perfect for every occasion.'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-12 space-y-8">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Color</span>
                                <div className="flex gap-4">
                                   {p.colors.map((c: string) => (
                                      <button key={c} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border border-gray-200 transition-all ${selectedColor === c ? 'ring-1 ring-offset-4 ring-black' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Size</span>
                                <div className="flex flex-wrap gap-3">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-xs tracking-widest border transition-colors ${selectedSize === s ? 'bg-black border-black text-white' : 'bg-transparent border-gray-200 text-gray-600 hover:border-black'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Quantity</span>
                             <div className="flex items-center justify-between border-b border-gray-200 w-24 pb-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-black font-light text-lg">-</button>
                                <span className="font-light text-black">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-black font-light text-lg">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="p-8 border border-gray-200 bg-white space-y-4">
                             <h4 className="text-xl font-light mb-4" style={{ color: primaryColor }}>Checkout</h4>
                             <input type="text" placeholder="Full Name" className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                             <input type="text" placeholder="Phone Number" className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                             <input type="text" placeholder="Delivery Address" className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                             <button onClick={() => setPage('success')} className="w-full py-5 text-white text-xs tracking-widest mt-4 transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="w-max px-12 py-4 bg-white border border-black text-black text-xs tracking-widest hover:bg-gray-100 transition-colors">ADD TO CART</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="w-max px-12 py-4 text-white text-xs tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>BUY NOW</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="p-12 border border-gray-200 bg-white">
                 <h2 className="text-3xl font-light mb-8 text-center" style={{ color: primaryColor }}>Checkout</h2>
                 <div className="space-y-6">
                    <input type="text" placeholder="Full Name" className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                    <input type="text" placeholder="Phone Number" className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                    <input type="text" placeholder="Delivery Address" className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                    <button onClick={() => setPage('success')} className="w-full py-5 text-white text-xs tracking-widest mt-8 transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full text-center py-20`}>
              <h2 className="text-5xl font-light mb-6" style={{ color: primaryColor }}>Thank You.</h2>
              <p className="text-gray-500 text-xl font-light mb-12">Your order has been successfully placed.</p>
              <button onClick={() => setPage('home')} className="px-10 py-4 border border-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">CONTINUE SHOPPING</button>
           </div>
        )}
      </div>
    </div>
  );
  };

  const LayoutElegant = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
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
                        {p.image ? <img src={p.image} className="w-full h-full object-cover mb-8" alt={p.name} /> : <ImageIcon className="w-16 h-16 opacity-10 mb-8" />}
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
                        {p.image ? <img src={p.image} className="w-full h-full object-cover mb-8" alt={p.name} /> : <ImageIcon className="w-16 h-16 opacity-10 mb-8" />}
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
                    <div className="flex-1 bg-white/5 border border-white/10 flex items-center justify-center aspect-[3/4] overflow-hidden relative">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-5xl font-serif mb-4 text-white">{p.name}</h2>
                       <p className="text-2xl tracking-widest mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <div className="w-12 h-px bg-white/20 mb-8"></div>
                       <p className="text-[#888] mb-12 tracking-wide leading-relaxed">{p.description || 'Embrace luxury with this exclusive item. Crafted with precision for the modern elegant individual.'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-12 space-y-8">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 block">Color</span>
                                <div className="flex gap-4">
                                   {p.colors.map((c: string) => (
                                      <button key={c} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border border-white/20 transition-all ${selectedColor === c ? 'ring-1 ring-offset-4 ring-offset-[#111] ring-white scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 block">Size</span>
                                <div className="flex flex-wrap gap-3">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-xs tracking-widest border transition-colors ${selectedSize === s ? 'bg-white border-white text-black' : 'bg-transparent border-white/20 text-white/70 hover:border-white'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 block">Quantity</span>
                             <div className="flex items-center justify-between border-b border-white/20 w-24 pb-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-white/50 hover:text-white font-light text-lg">-</button>
                                <span className="font-light text-white">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-white/50 hover:text-white font-light text-lg">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="p-8 border border-white/10 bg-[#151515] space-y-4">
                             <h4 className="text-xl font-serif mb-4 text-white">Secure Checkout</h4>
                             <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                             <input type="text" placeholder="Phone Number" className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                             <input type="text" placeholder="Delivery Address" className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                             <button onClick={() => setPage('success')} className="w-full py-5 bg-white text-black text-xs tracking-widest mt-4 hover:bg-gray-200 transition-colors">PLACE ORDER</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="w-max px-12 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors">ADD TO CART</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="w-max px-12 py-4 bg-white text-black text-xs tracking-widest hover:bg-gray-200 transition-colors">BUY NOW</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="p-12 border border-white/10 bg-[#151515]">
                 <h2 className="text-3xl font-serif mb-8 text-center text-white">Secure Checkout</h2>
                 <div className="space-y-6">
                    <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                    <input type="text" placeholder="Phone Number" className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                    <input type="text" placeholder="Delivery Address" className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                    <button onClick={() => setPage('success')} className="w-full py-5 bg-white text-black text-xs tracking-widest mt-8 hover:bg-gray-200 transition-colors">PLACE ORDER</button>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center py-20`}>
              <h2 className="text-4xl font-serif mb-6 text-white">Order Confirmed</h2>
              <p className="text-[#888] text-lg tracking-wide mb-12">An expression of elegance is on its way to you.</p>
              <button onClick={() => setPage('home')} className="px-10 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors">RETURN</button>
           </div>
        )}
      </div>
    </div>
  );
  };

  const LayoutPlayful = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
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
                           {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-12 h-12 opacity-10" />}
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
                           {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-12 h-12 opacity-10" />}
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
                    <div className="flex-1 bg-white rounded-[2rem] border-4 border-slate-100 flex items-center justify-center aspect-square shadow-xl overflow-hidden relative">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-4">
                       <h2 className="text-5xl font-black mb-4 text-slate-800">{p.name}</h2>
                       <p className="text-3xl font-black mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <p className="text-slate-500 font-medium mb-8 text-lg">{p.description || 'Fun, fresh, and perfectly designed for everyday adventures!'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-8 space-y-6 bg-white p-6 rounded-[2rem] border-4 border-slate-100">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 block">Color</span>
                                <div className="flex gap-3">
                                   {p.colors.map((c: string) => (
                                      <button key={c} onClick={() => setSelectedColor(c)} className={`w-10 h-10 rounded-full border-4 transition-transform ${selectedColor === c ? 'border-slate-800 scale-125' : 'border-transparent hover:scale-110 shadow-sm'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 block">Size</span>
                                <div className="flex flex-wrap gap-2">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-5 py-3 text-sm font-black rounded-xl transition-transform border-4 ${selectedSize === s ? 'bg-slate-800 border-slate-800 text-white scale-105 shadow-xl' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 block">Quantity</span>
                             <div className="flex items-center justify-between bg-slate-50 w-40 px-4 py-2 rounded-xl border-4 border-slate-100">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-400 hover:text-slate-800 font-black text-2xl">-</button>
                                <span className="font-black text-xl text-slate-800">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-slate-400 hover:text-slate-800 font-black text-2xl">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-100 space-y-4">
                             <h4 className="text-xl font-black text-slate-800 mb-2">Yay! Checkout 🎁</h4>
                             <input type="text" placeholder="Your Name" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <input type="text" placeholder="Phone Number" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <input type="text" placeholder="Where to send?" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <button onClick={() => setPage('success')} className="w-full py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl mt-4" style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="flex-1 px-8 py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl" style={{ backgroundColor: '#f43f5e' }}>Cart 🛒</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="flex-1 px-8 py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl" style={{ backgroundColor: primaryColor }}>Buy Now 🎈</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="bg-slate-50 p-10 rounded-[3rem] shadow-sm border-4 border-white">
                 <h2 className="text-3xl font-black mb-6 text-center text-slate-800">Yay! Checkout 🎁</h2>
                 <div className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-full focus:outline-none focus:border-current text-lg font-bold" style={{ borderColor: 'transparent', '--tw-ring-color': primaryColor } as React.CSSProperties} />
                    <input type="text" placeholder="Phone Number" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-full focus:outline-none focus:border-current text-lg font-bold" style={{ borderColor: 'transparent', '--tw-ring-color': primaryColor } as React.CSSProperties} />
                    <input type="text" placeholder="Where to send?" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-full focus:outline-none focus:border-current text-lg font-bold" style={{ borderColor: 'transparent', '--tw-ring-color': primaryColor } as React.CSSProperties} />
                    <button onClick={() => setPage('success')} className="w-full py-5 text-white font-black uppercase tracking-widest text-xl hover:scale-105 transition-transform rounded-full shadow-xl mt-6" style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white">
                 <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-5xl font-black mb-4 text-slate-800" style={{ color: primaryColor }}>Woohoo! 🎉</h2>
              <p className="text-slate-500 text-xl font-bold">Your order is on the way!</p>
              <button onClick={() => setPage('home')} className="mt-8 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg">Back to fun 🎈</button>
           </div>
        )}
      </div>
    </div>
  );
  };

  const StorePreviewWrapper = ({ isModal = false }) => {
    const [page, setPage] = useState('home');
    const [activeProductId, setActiveProductId] = useState<any>(null);

    const navigateToProduct = (id: any) => {
        setActiveProductId(id);
        setPage('product');
    };

    const props = { isModal, page, setPage, activeProductId, navigateToProduct, buyMode };

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
                  <button onClick={() => { 
                     setProductForm({ name: '', price: '', stock: '', description: '', colors: [], sizes: [] }); 
                     setIsProductModalOpen(true); 
                  }} className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]">
                    <Plus className="w-5 h-5" /> Créer un nouveau produit
                  </button>

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
                          <div key={p.id} onClick={() => { setProductForm(p); setIsProductModalOpen(true); }} className="p-3 border border-slate-100 bg-white rounded-xl flex items-center gap-3 shadow-sm hover:border-indigo-500 cursor-pointer transition-colors group">
                             <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 overflow-hidden">
                                {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Box className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />}
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">{p.name}</p>
                                <p className="text-[10px] font-black text-indigo-600">{p.price} MAD</p>
                             </div>
                             <button 
                               onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setStoreProducts(storeProducts.filter(x => x.id !== p.id));
                               }}
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

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
                       <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                         <ShoppingBag className="w-4 h-4 text-indigo-600" /> Mode d'Achat (Boutons)
                       </h4>
                       <div className="space-y-3">
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'both'} onChange={() => setBuyMode('both')} className="accent-indigo-600" />
                             Afficher 'Ajouter au panier' & 'Acheter direct'
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'direct'} onChange={() => setBuyMode('direct')} className="accent-indigo-600" />
                             Uniquement 'Acheter direct' (Express)
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'cart'} onChange={() => setBuyMode('cart')} className="accent-indigo-600" />
                             Uniquement 'Ajouter au panier' (Classique)
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'form'} onChange={() => setBuyMode('form')} className="accent-indigo-600" />
                             Formulaire intégré (Express sur la page)
                          </label>
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

      {/* ERP IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-8">
           <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <div>
                    <h2 className="text-3xl font-black text-slate-800">Importer depuis l'ERP</h2>
                    <p className="text-slate-500 mt-2">Sélectionnez les produits que vous souhaitez synchroniser avec votre boutique en ligne.</p>
                 </div>
                 <button onClick={() => setIsImportModalOpen(false)} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-6 border-b border-slate-100 bg-white flex gap-4">
                 <div className="flex-1 relative">
                    <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Rechercher un produit dans l'inventaire ERP..." className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 font-medium text-lg" />
                 </div>
                 <button className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors border border-slate-200">Filtrer</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                 <div className="grid grid-cols-4 gap-8">
                    {[
                       { id: 101, name: 'T-Shirt Oversize Black', price: '250.00', stock: 45 },
                       { id: 102, name: 'Cargo Pants Beige', price: '399.00', stock: 12 },
                       { id: 103, name: 'Sneakers Pro X', price: '850.00', stock: 8 },
                       { id: 104, name: 'Cap Classic Navy', price: '120.00', stock: 150 },
                       { id: 105, name: 'Hoodie Winter Essential', price: '550.00', stock: 34 },
                       { id: 106, name: 'Socks Pack (3)', price: '90.00', stock: 200 },
                       { id: 107, name: 'Jacket Denim Vintage', price: '650.00', stock: 5 },
                       { id: 108, name: 'Sunglasses Retro', price: '199.00', stock: 22 },
                    ].map(erpItem => (
                       <div key={erpItem.id} className="bg-white p-5 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 transition-colors group cursor-pointer shadow-sm hover:shadow-xl">
                          <div className="aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                             <ImageIcon className="w-16 h-16 text-slate-300" />
                             <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                <button 
                                   onClick={() => {
                                      setStoreProducts([{ id: Date.now(), name: erpItem.name, price: erpItem.price }, ...storeProducts]);
                                      setIsImportModalOpen(false);
                                   }}
                                   className="px-8 py-3 bg-indigo-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 transition-transform"
                                >
                                   Importer
                                </button>
                             </div>
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg">{erpItem.name}</h4>
                          <div className="flex items-center justify-between mt-3">
                             <p className="text-indigo-600 font-black text-lg">{erpItem.price} MAD</p>
                             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{erpItem.stock} en stock</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* PRO PRODUCT FORM MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
           <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
                 <div>
                    <h2 className="text-3xl font-black text-slate-800">{productForm?.id ? 'Modifier le Produit' : 'Créer un Produit'}</h2>
                    <p className="text-slate-500 mt-2">Détails, inventaire, et variantes de votre article.</p>
                 </div>
                 <button onClick={() => setIsProductModalOpen(false)} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                 <div className="grid grid-cols-3 gap-8">
                    {/* Left Column (Images & Basic) */}
                    <div className="col-span-1 space-y-6">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Image du Produit</label>
                          <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors group relative overflow-hidden">
                             {productForm?.image ? (
                                <img src={productForm.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                             ) : (
                                <>
                                   <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                                   <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Ajouter une image</span>
                                </>
                             )}
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                   setProductForm({...productForm, image: URL.createObjectURL(file)});
                                }
                             }} />
                          </label>
                       </div>
                    </div>
                    {/* Right Column (Details & Variants) */}
                    <div className="col-span-2 space-y-6">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Informations Générales</label>
                          <div>
                             <input type="text" placeholder="Titre du produit (ex: Premium T-Shirt)" value={productForm?.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-lg font-bold" />
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Prix (MAD)</label>
                                <input type="number" placeholder="0.00" value={productForm?.price || ''} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                             </div>
                             <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Stock (Quantité)</label>
                                <input type="number" placeholder="10" value={productForm?.stock || ''} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Description</label>
                             <textarea rows={4} placeholder="Décrivez votre produit en détail..." value={productForm?.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"></textarea>
                          </div>
                       </div>
                       
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Variantes (Tailles & Couleurs)</label>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Tailles Disponibles</label>
                             <div className="flex gap-2 mb-4">
                                <input type="text" placeholder="Ex: XXL, 42, 6 Ans..." value={newSizeInput} onChange={e => setNewSizeInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && newSizeInput) { setProductForm({...productForm, sizes: [...(productForm.sizes||[]), newSizeInput]}); setNewSizeInput(''); e.preventDefault(); } }} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                                <button onClick={() => { if(newSizeInput) { setProductForm({...productForm, sizes: [...(productForm.sizes||[]), newSizeInput]}); setNewSizeInput(''); } }} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors">Ajouter</button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {(productForm?.sizes || []).map((size: string) => (
                                   <div key={size} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group">
                                      <span className="text-xs font-bold text-slate-700">{size}</span>
                                      <button onClick={() => setProductForm({...productForm, sizes: productForm.sizes.filter((s:string) => s !== size)})} className="text-slate-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Couleurs Disponibles</label>
                             <div className="flex gap-2 mb-4">
                                <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                   <input type="color" value={newColorInput} onChange={e => setNewColorInput(e.target.value)} className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer" />
                                </div>
                                <input type="text" value={newColorInput} readOnly className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none uppercase" />
                                <button onClick={() => { if(!productForm?.colors?.includes(newColorInput)) { setProductForm({...productForm, colors: [...(productForm.colors||[]), newColorInput]}); } }} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors">Ajouter</button>
                             </div>
                             <div className="flex flex-wrap gap-3">
                                {(productForm?.colors || []).map((color: string) => (
                                   <div key={color} className="relative group">
                                      <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: color }}></div>
                                      <button onClick={() => {
                                         const newColors = productForm.colors.filter((c:string) => c !== color);
                                         const newColorImages = {...(productForm.colorImages||{})};
                                         delete newColorImages[color];
                                         setProductForm({...productForm, colors: newColors, colorImages: newColorImages});
                                      }} className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X className="w-3 h-3" /></button>
                                   </div>
                                ))}
                             </div>
                          </div>
                           {/* VARIANT IMAGES UPLOAD */}
                           {productForm?.colors?.length > 0 && (
                              <div className="mt-6 border-t border-slate-100 pt-6">
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Images par Couleur (Optionnel)</label>
                                 <div className="space-y-3">
                                    {productForm.colors.map((color: string) => (
                                       <div key={color} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <div className="flex items-center gap-3">
                                             <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: color }}></div>
                                             <span className="text-xs font-bold text-slate-600 capitalize">Image Variante</span>
                                          </div>
                                          <div>
                                             <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center gap-2 shadow-sm">
                                                {productForm?.colorImages?.[color] ? (
                                                   <img src={productForm.colorImages[color]} className="w-5 h-5 rounded object-cover" alt="" />
                                                ) : (
                                                   <ImageIcon className="w-4 h-4" />
                                                )}
                                                {productForm?.colorImages?.[color] ? 'Changer' : 'Lier une image'}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                   const file = e.target.files?.[0];
                                                   if (file) {
                                                      setProductForm({
                                                         ...productForm, 
                                                         colorImages: { ...(productForm.colorImages || {}), [color]: URL.createObjectURL(file) }
                                                      });
                                                   }
                                                }} />
                                             </label>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* VARIANT QUANTITY MATRIX */}
                           {(() => {
                              const sizes = productForm?.sizes || [];
                              const colors = productForm?.colors || [];

                              let combinations: {size?: string, color?: string}[] = [];
                              if (sizes.length > 0 && colors.length > 0) {
                                  sizes.forEach((s:string) => colors.forEach((c:string) => combinations.push({size: s, color: c})));
                              } else if (sizes.length > 0) {
                                  sizes.forEach((s:string) => combinations.push({size: s}));
                              } else if (colors.length > 0) {
                                  colors.forEach((c:string) => combinations.push({color: c}));
                              }

                              if (combinations.length === 0) return null;

                              return (
                                  <div className="mt-8 pt-8 border-t border-slate-100">
                                      <label className="block text-xs font-black text-slate-800 uppercase mb-4">Stock par Variante</label>
                                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                          <table className="w-full text-left text-sm">
                                              <thead className="bg-white border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                  <tr>
                                                      <th className="px-6 py-4">Variante</th>
                                                      <th className="px-6 py-4 w-40">Quantité (Stock)</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100 bg-white">
                                                  {combinations.map((comb) => {
                                                      const key = `${comb.size || 'nosize'}-${comb.color || 'nocolor'}`;
                                                      const qty = productForm.variantQuantities?.[key] || '';
                                                      return (
                                                          <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                                              <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                                                                  {comb.color && <div className="w-5 h-5 rounded-full border shadow-sm shrink-0" style={{ backgroundColor: comb.color }}></div>}
                                                                  {comb.size && <span className="bg-slate-100 px-2 py-1 rounded text-xs">{comb.size}</span>}
                                                                  {(!comb.size && comb.color) && <span className="uppercase text-[10px] text-slate-400 font-bold">Couleur</span>}
                                                              </td>
                                                              <td className="px-6 py-3">
                                                                  <input type="number" placeholder="0" value={qty} onChange={(e) => {
                                                                      setProductForm({
                                                                          ...productForm, 
                                                                          variantQuantities: { ...(productForm.variantQuantities || {}), [key]: e.target.value }
                                                                      });
                                                                  }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                                                              </td>
                                                          </tr>
                                                      )
                                                  })}
                                              </tbody>
                                          </table>
                                      </div>
                                  </div>
                              );
                           })()}
                        </div>
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                 <button onClick={() => setIsProductModalOpen(false)} className="px-8 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
                 <button onClick={() => {
                    if(productForm?.name && productForm?.price) {
                       if(productForm.id) {
                          setStoreProducts(storeProducts.map(p => p.id === productForm.id ? productForm : p));
                       } else {
                          setStoreProducts([{ id: Date.now(), ...productForm }, ...storeProducts]);
                       }
                       setIsProductModalOpen(false);
                    }
                 }} className="px-10 py-4 font-black uppercase tracking-widest bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all">
                    {productForm?.id ? 'Mettre à jour' : 'Enregistrer le produit'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
