import React, { useState } from 'react';
import { ShoppingBag, Globe, Palette, LayoutTemplate, Settings, Plus, Monitor, Smartphone, CheckCircle, ExternalLink, Box, X, Search, Check } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

const THEMES = {
  streetwear: {
    name: 'Streetwear Pro',
    id: 'streetwear',
    bg: 'bg-white',
    text: 'text-slate-900',
    navBg: 'bg-white',
    navText: 'text-slate-900',
    heroBg: 'bg-slate-900',
    heroText: 'text-white',
    heroBtn: 'bg-white text-slate-900',
    font: 'font-sans',
    productBg: 'bg-slate-100',
    button: 'bg-slate-900 text-white hover:bg-indigo-600 rounded-full',
  },
  minimalist: {
    name: 'Minimalist',
    id: 'minimalist',
    bg: 'bg-[#faf9f6]',
    text: 'text-[#2c2c2c]',
    navBg: 'bg-[#faf9f6]',
    navText: 'text-[#2c2c2c]',
    heroBg: 'bg-[#e5e5e5]',
    heroText: 'text-[#2c2c2c]',
    heroBtn: 'bg-[#2c2c2c] text-white',
    font: 'font-serif',
    productBg: 'bg-[#f0f0f0]',
    button: 'bg-[#2c2c2c] text-white hover:bg-black rounded-none',
  },
  abaya: {
    name: 'Luxury Abaya',
    id: 'abaya',
    bg: 'bg-[#0f1110]',
    text: 'text-[#e5d3b3]',
    navBg: 'bg-[#0f1110]',
    navText: 'text-[#e5d3b3]',
    heroBg: 'bg-[#1a1c1b]',
    heroText: 'text-[#e5d3b3]',
    heroBtn: 'bg-[#cfa162] text-[#0f1110]',
    font: 'font-serif',
    productBg: 'bg-[#1a1c1b] border border-[#cfa162]/20',
    button: 'bg-[#cfa162] text-[#0f1110] hover:bg-[#b08852] rounded-sm',
  },
  sportswear: {
    name: 'Active Sport',
    id: 'sportswear',
    bg: 'bg-[#0a0a0a]',
    text: 'text-white',
    navBg: 'bg-black',
    navText: 'text-white italic',
    heroBg: 'bg-zinc-900',
    heroText: 'text-[#ccff00] italic',
    heroBtn: 'bg-[#ccff00] text-black font-black uppercase',
    font: 'font-sans tracking-tight',
    productBg: 'bg-zinc-900 border-b-4 border-[#ccff00]',
    button: 'bg-[#ccff00] text-black hover:bg-white rounded-none font-black uppercase',
  },
  kids: {
    name: 'Playful Kids',
    id: 'kids',
    bg: 'bg-amber-50',
    text: 'text-sky-900',
    navBg: 'bg-white',
    navText: 'text-rose-500 font-black',
    heroBg: 'bg-sky-200',
    heroText: 'text-sky-900 font-black',
    heroBtn: 'bg-rose-500 text-white rounded-full shadow-lg border-2 border-white',
    font: 'font-sans',
    productBg: 'bg-white rounded-3xl shadow-sm border-2 border-sky-100',
    button: 'bg-sky-400 text-white hover:bg-sky-500 rounded-full font-bold border border-sky-300',
  },
  eco: {
    name: 'Eco Nature',
    id: 'eco',
    bg: 'bg-[#f4f3ed]',
    text: 'text-[#3e4a3d]',
    navBg: 'bg-[#f4f3ed]',
    navText: 'text-[#3e4a3d]',
    heroBg: 'bg-[#e0e2d8]',
    heroText: 'text-[#2c362b]',
    heroBtn: 'bg-[#3e4a3d] text-[#f4f3ed] rounded-lg shadow-md',
    font: 'font-serif',
    productBg: 'bg-white rounded-xl shadow-sm border border-[#e0e2d8]',
    button: 'bg-[#3e4a3d] text-[#f4f3ed] hover:bg-[#2c362b] rounded-lg shadow-sm',
  }
};

type ThemeId = keyof typeof THEMES;

export default function StoreBuilder() {
  const { lang, isAr } = useLang();
  const [activeTab, setActiveTab] = useState<'themes' | 'settings' | 'products' | 'apps'>('themes');
  const [storeName, setStoreName] = useState('My Brand');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop'|'mobile'>('desktop');
  const [cartCount, setCartCount] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('streetwear');

  const theme = THEMES[activeThemeId];

  const handleAddToCart = (e: React.MouseEvent) => {
     e.stopPropagation();
     setCartCount(c => c + 1);
  };

  const StorePreview = ({ isModal = false }: { isModal?: boolean }) => {
    const [page, setPage] = useState<'home' | 'collections' | 'about'>('home');

    return (
      <div className={`w-full min-h-full ${theme.bg} ${theme.text} ${theme.font} flex flex-col transition-colors duration-500`}>
        {/* Navbar */}
        <div className={`p-6 flex justify-between items-center border-b ${theme.navBg} border-current/10 ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4 p-4' : ''}`}>
           <h2 onClick={() => setPage('home')} className={`text-2xl font-black uppercase tracking-tighter ${theme.navText} cursor-pointer`}>{storeName}</h2>
           <div className={`flex gap-6 text-sm font-bold opacity-70 ${previewDevice === 'mobile' && !isModal ? 'hidden' : ''}`}>
              <span onClick={() => setPage('home')} className={`hover:opacity-100 cursor-pointer transition-opacity ${page === 'home' ? 'opacity-100 border-b-2 border-current pb-1' : ''}`}>Home</span>
              <span onClick={() => setPage('collections')} className={`hover:opacity-100 cursor-pointer transition-opacity ${page === 'collections' ? 'opacity-100 border-b-2 border-current pb-1' : ''}`}>Collections</span>
              <span onClick={() => setPage('about')} className={`hover:opacity-100 cursor-pointer transition-opacity ${page === 'about' ? 'opacity-100 border-b-2 border-current pb-1' : ''}`}>About</span>
           </div>
           <button className="relative hover:scale-110 transition-transform" onClick={() => alert('Panier cliqué !')}>
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && <span className={`absolute -top-1 -right-1 ${theme.heroBtn} text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center`}>{cartCount}</span>}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {page === 'home' && (
            <>
              {/* Hero */}
              <div className={`h-[${isModal ? '500px' : '320px'}] ${theme.heroBg} ${theme.heroText} flex flex-col items-center justify-center text-center p-8 bg-[url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative`}>
                 <div className={`absolute inset-0 ${activeThemeId === 'abaya' ? 'bg-black/70' : activeThemeId === 'minimalist' ? 'bg-white/70' : 'bg-black/50'}`}></div>
                 <div className="relative z-10 flex flex-col items-center">
                    <h1 className={`${isModal ? 'text-6xl' : 'text-5xl'} font-black uppercase tracking-tighter mb-4`}>New Collection Drop</h1>
                    <p className={`${isModal ? 'text-xl mb-10 max-w-2xl' : 'text-lg mb-8 max-w-md'} opacity-90`}>Discover our latest premium quality garments designed for the modern lifestyle. Exclusively manufactured by BEYA.</p>
                    <button onClick={() => setPage('collections')} className={`px-8 py-3 ${theme.heroBtn} font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform`}>Shop Now</button>
                 </div>
              </div>
              {/* Products */}
              <div className={`${isModal ? 'p-12 max-w-[1400px]' : 'p-8'} mx-auto w-full`}>
                 <h3 className="text-xl font-black uppercase text-center mb-8">Trending Now</h3>
                 <div className={`grid gap-6 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4')}`}>
                    {[1,2,3,4, ...(isModal ? [5,6,7,8] : [])].map(i => (
                       <div key={i} className="group cursor-pointer">
                          <div className={`aspect-[3/4] ${theme.productBg} mb-4 overflow-hidden relative ${activeThemeId === 'streetwear' ? 'rounded-lg' : ''}`}>
                             <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-8 h-8" /></div>
                             <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity ${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <button onClick={handleAddToCart} className={`px-6 py-2 text-xs font-bold uppercase tracking-wider shadow-xl ${theme.button}`}>Add to cart</button>
                             </div>
                          </div>
                          <h4 className="font-bold text-sm">Premium Product {i}</h4>
                          <p className="opacity-60 text-sm mt-1">450.00 MAD</p>
                       </div>
                    ))}
                 </div>
              </div>
            </>
          )}

          {page === 'collections' && (
            <div className={`${isModal ? 'p-12 max-w-[1400px]' : 'p-8'} mx-auto w-full min-h-[500px]`}>
               <h3 className={`${isModal ? 'text-4xl' : 'text-2xl'} font-black uppercase mb-8`}>All Collections</h3>
               <div className={`grid gap-6 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-4')}`}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].slice(0, isModal ? 12 : 8).map(i => (
                     <div key={i} className="group cursor-pointer">
                        <div className={`aspect-[3/4] ${theme.productBg} mb-4 overflow-hidden relative ${activeThemeId === 'streetwear' ? 'rounded-lg' : ''}`}>
                           <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-8 h-8" /></div>
                           <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity ${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button onClick={handleAddToCart} className={`px-6 py-2 text-xs font-bold uppercase tracking-wider shadow-xl ${theme.button}`}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm">Collection Item {i}</h4>
                        <p className="opacity-60 text-sm mt-1">450.00 MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {page === 'about' && (
            <div className={`${isModal ? 'p-12 max-w-[800px]' : 'p-8'} mx-auto w-full text-center py-20 min-h-[500px]`}>
               <h3 className={`${isModal ? 'text-5xl' : 'text-3xl'} font-black uppercase mb-8`}>About {storeName}</h3>
               <p className={`${isModal ? 'text-xl' : 'text-base'} opacity-80 leading-relaxed`}>
                 Welcome to {storeName}. We are an independent fashion brand committed to bringing you the highest quality apparel. 
                 <br/><br/>
                 All our pieces are exclusively manufactured by <strong>BEYA CREATIVE</strong>, ensuring premium craftsmanship, durable materials, and ethical production standards right here in Morocco.
               </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">BEYA STORE</h1>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase tracking-widest">Beta (Admin Only)</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Créez et gérez les boutiques E-commerce de vos clients</p>
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
            <div className={`flex border-b border-slate-200 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => setActiveTab('themes')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'themes' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Palette className="w-4 h-4" /> Thèmes
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <ShoppingBag className="w-4 h-4" /> Produits
              </button>
              <button 
                onClick={() => setActiveTab('apps')}
                className={`flex-1 py-3 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'apps' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Box className="w-4 h-4" /> Apps
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Settings className="w-4 h-4" /> Config
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'themes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thème Actif</label>
                    <div className="border-2 border-indigo-600 rounded-xl p-1 relative">
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full"><CheckCircle className="w-3 h-3" /></div>
                      <div className={`aspect-video ${theme.bg} rounded-lg mb-2 overflow-hidden relative`}>
                         <div className={`absolute inset-0 ${theme.heroBg} flex items-center justify-center`}>
                            <span className={`${theme.heroText} ${theme.font} font-black tracking-widest`}>{theme.name}</span>
                         </div>
                      </div>
                      <p className="text-xs font-bold text-slate-800 text-center py-1">{theme.name} Edition</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Changer le Thème</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(THEMES) as [ThemeId, typeof THEMES[ThemeId]][]).filter(([id]) => id !== activeThemeId).map(([id, t]) => (
                        <div 
                           key={id} 
                           onClick={() => setActiveThemeId(id)}
                           className="border border-slate-200 rounded-xl p-1 cursor-pointer hover:border-indigo-300 transition-all opacity-70 hover:opacity-100 hover:scale-[1.02]"
                        >
                          <div className={`aspect-video ${t.heroBg} rounded-lg mb-1 flex items-center justify-center`}>
                             <span className={`${t.heroText} text-[8px] font-black tracking-widest`}>{t.name}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-600 text-center">{t.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom de la marque</label>
                    <input 
                      type="text" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domaine (URL)</label>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        value={storeName.toLowerCase().replace(/\s+/g, '')}
                        disabled
                        className="w-full px-3 py-2 border border-slate-200 rounded-l-lg text-sm font-medium bg-slate-50 text-slate-500" 
                      />
                      <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs font-bold text-slate-500">.beyacreative.com</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                     <button className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                        Connecter un domaine (.com)
                     </button>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-4">
                  <button onClick={() => setIsImportModalOpen(true)} className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex flex-col items-center justify-center gap-1">
                    <Plus className="w-5 h-5" />
                    Importer depuis BEYA ERP
                  </button>
                  <div className="space-y-2">
                     <div className="p-3 border border-slate-200 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><Box className="w-5 h-5 text-slate-400" /></div>
                        <div className="flex-1">
                           <p className="text-xs font-bold text-slate-800">Hoodie Oversize M1</p>
                           <p className="text-[10px] text-slate-500">450.00 MAD</p>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'apps' && (
                 <div className="space-y-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4">
                       <h4 className="text-xs font-black text-indigo-800 mb-1">App Store BEYA</h4>
                       <p className="text-[10px] text-indigo-600">Installez des plugins pour booster vos ventes (Pixel, WhatsApp, etc).</p>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="p-3 border border-slate-200 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                          <div className="flex-1">
                             <p className="text-xs font-bold text-slate-800">WhatsApp Chat</p>
                             <p className="text-[9px] text-slate-500">Support client en direct</p>
                          </div>
                          <button className="px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold">Ajouter</button>
                       </div>

                       <div className="p-3 border border-slate-200 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Globe className="w-5 h-5 text-blue-600" /></div>
                          <div className="flex-1">
                             <p className="text-xs font-bold text-slate-800">Meta Pixel (Facebook)</p>
                             <p className="text-[9px] text-slate-500">Tracking publicitaire</p>
                          </div>
                          <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">Installé</button>
                       </div>

                       <div className="p-3 border border-slate-200 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-amber-600" /></div>
                          <div className="flex-1">
                             <p className="text-xs font-bold text-slate-800">Abandoned Cart</p>
                             <p className="text-[9px] text-slate-500">Récupération de paniers</p>
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
            <div className="px-4 py-1.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-400 flex items-center gap-2 w-1/2 justify-center">
              <Globe className="w-3 h-3" /> {storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-md ${previewDevice === 'desktop' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-100'}`}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-md ${previewDevice === 'mobile' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-100'}`}><Smartphone className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Iframe / Preview Area */}
          <div className="flex-1 bg-slate-200 relative overflow-y-auto flex items-start justify-center p-4">
             {/* Dummy Store Preview */}
             <div className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden ${previewDevice === 'mobile' ? 'w-[375px] h-[812px] rounded-[2rem] border-[8px] border-slate-800' : 'w-full min-h-full rounded-lg'}`}>
                <StorePreview />
             </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col">
          {/* Modal Header */}
          <div className="bg-slate-800 text-white p-4 flex items-center justify-between shadow-xl z-10">
            <div className="flex items-center gap-3">
               <div className="px-3 py-1 bg-slate-700 rounded-md text-xs font-bold font-mono">
                 {storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com
               </div>
               <span className="text-xs text-slate-400">Mode Aperçu (Prévisualisation)</span>
            </div>
            <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors">
              Fermer l'aperçu
            </button>
          </div>
          {/* Modal Content - The Store */}
          <div className="flex-1 overflow-y-auto bg-white flex justify-center">
             <div className="w-full">
                <StorePreview isModal={true} />
             </div>
          </div>
        </div>
      )}

      {/* IMPORT FROM ERP MODAL */}
      {isImportModalOpen && (
         <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
               <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-800">Importer des articles (BEYA ERP)</h3>
                  <button onClick={() => setIsImportModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
               </div>
               <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                     <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                     <input type="text" placeholder="Rechercher une fiche technique..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:border-indigo-300 cursor-pointer transition-colors">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center"><Box className="w-6 h-6 text-slate-300" /></div>
                        <div className="flex-1">
                           <p className="font-bold text-sm text-slate-800">Modèle Fiche Technique {i}</p>
                           <p className="text-xs text-slate-500">Cost: 150.00 MAD • Client: Yassine</p>
                        </div>
                        <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors">
                           Importer
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
