import React, { useState } from 'react';
import { ShoppingBag, Globe, Palette, Settings, Plus, Monitor, Smartphone, CheckCircle, ExternalLink, Box, X, Search, LayoutTemplate, Paintbrush, Image as ImageIcon } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

const THEMES = [
  { id: 'streetwear', name: 'Streetwear Pro', layout: 'hero-center', defaultColor: '#0f172a', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
  { id: 'minimalist', name: 'Minimalist', layout: 'split-screen', defaultColor: '#171717', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1434389678278-be43e49cc450?q=80&w=800&auto=format&fit=crop' },
  { id: 'abaya', name: 'Luxury Abaya', layout: 'elegant', defaultColor: '#b48a44', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop' },
  { id: 'sportswear', name: 'Active Sport', layout: 'hero-center', defaultColor: '#84cc16', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop' },
  { id: 'eco', name: 'Eco Nature', layout: 'split-screen', defaultColor: '#4d7c0f', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop' },
  { id: 'kids', name: 'Playful Kids', layout: 'elegant', defaultColor: '#0ea5e9', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800&auto=format&fit=crop' }
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

  const LayoutHeroCenter = ({ isModal = false, page, setPage }: any) => (
    <div className={`w-full min-h-full bg-white text-slate-900 ${fontFamily} flex flex-col`}>
      <div className={`p-6 flex justify-between items-center border-b border-slate-100 ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : ''}`}>
         <h2 onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-tighter cursor-pointer">{storeName}</h2>
         <div className={`flex gap-6 text-sm font-bold ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
            {['home', 'collections', 'about'].map(p => (
               <span key={p} onClick={() => setPage(p)} className="cursor-pointer capitalize hover:opacity-70 transition-opacity" style={{ color: page === p ? primaryColor : '#64748b' }}>{p}</span>
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
                  {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="group cursor-pointer">
                        <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                           <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>
                           <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity ${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm">Product {i}</h4>
                        <p className="text-slate-500 text-sm mt-1">450.00 MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const LayoutSplitScreen = ({ isModal = false, page, setPage }: any) => (
    <div className={`w-full min-h-full bg-[#f8f9fa] text-[#212529] ${fontFamily} flex flex-col`}>
      <div className={`px-8 py-6 flex justify-between items-center bg-white ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : ''}`}>
         <div className={`flex gap-8 text-sm ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
            {['home', 'collections', 'about'].map(p => (
               <span key={p} onClick={() => setPage(p)} className={`cursor-pointer capitalize pb-1 border-b-2 ${page === p ? 'border-current' : 'border-transparent text-gray-400'}`}>{p}</span>
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
                  {[1,2,3].map(i => (
                     <div key={i} className="group cursor-pointer">
                        <div className="aspect-[4/5] bg-gray-100 mb-6 overflow-hidden relative">
                           <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={handleAddToCart} className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">ADD TO CART</button>
                           </div>
                        </div>
                        <h4 className="font-medium text-lg mb-2">Essential Item {i}</h4>
                        <p className="text-gray-500">450.00 MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const LayoutElegant = ({ isModal = false, page, setPage }: any) => (
    <div className={`w-full min-h-full bg-[#111] text-[#f5f5f5] ${fontFamily} flex flex-col`}>
      <div className={`p-8 flex flex-col items-center gap-6 border-b border-white/10 ${previewDevice === 'mobile' && !isModal ? 'p-4' : ''}`}>
         <h2 onClick={() => setPage('home')} className="text-4xl font-serif tracking-widest cursor-pointer" style={{ color: primaryColor }}>{storeName}</h2>
         <div className={`flex gap-12 text-xs tracking-widest uppercase ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
            {['home', 'collections', 'about'].map(p => (
               <span key={p} onClick={() => setPage(p)} className="cursor-pointer hover:text-white transition-colors" style={{ color: page === p ? primaryColor : '#888' }}>{p}</span>
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
                  {[1,2,3,4].map(i => (
                     <div key={i} className="group cursor-pointer relative aspect-square bg-[#1a1a1a] border border-white/5 p-4 flex flex-col items-center justify-center">
                        <ImageIcon className="w-16 h-16 opacity-10 mb-8" />
                        <h4 className="font-serif text-2xl mb-2 group-hover:text-white transition-colors" style={{ color: primaryColor }}>Luxury Piece {i}</h4>
                        <p className="text-white/50 tracking-widest text-sm mb-6">450.00 MAD</p>
                        <button onClick={handleAddToCart} className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 bg-white text-black text-xs tracking-widest">ADD TO CART</button>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const StorePreviewWrapper = ({ isModal = false }) => {
    const [page, setPage] = useState('home');
    if (activeTheme.layout === 'hero-center') return <LayoutHeroCenter isModal={isModal} page={page} setPage={setPage} />;
    if (activeTheme.layout === 'split-screen') return <LayoutSplitScreen isModal={isModal} page={page} setPage={setPage} />;
    if (activeTheme.layout === 'elegant') return <LayoutElegant isModal={isModal} page={page} setPage={setPage} />;
    return <LayoutHeroCenter isModal={isModal} page={page} setPage={setPage} />;
  };

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">BEYA STORE PRO</h1>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase tracking-widest">Advanced SaaS Builder</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Créez des boutiques E-commerce sur-mesure avec un moteur de thème avancé.</p>
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
                <div className="space-y-4">
                  <button onClick={() => setIsImportModalOpen(true)} className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex flex-col items-center justify-center gap-1">
                    <Plus className="w-5 h-5" /> Importer depuis BEYA ERP
                  </button>
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
