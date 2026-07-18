import React, { useState } from 'react';
import { ShoppingBag, Globe, Palette, LayoutTemplate, Settings, Plus, Monitor, Smartphone, CheckCircle, ExternalLink, Box } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

export default function StoreBuilder() {
  const { lang, isAr } = useLang();
  const [activeTab, setActiveTab] = useState<'themes' | 'settings' | 'products'>('themes');
  const [storeName, setStoreName] = useState('My Brand');

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
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
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
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <ShoppingBag className="w-4 h-4" /> Produits
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Settings className="w-4 h-4" /> Paramètres
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'themes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thème Actif</label>
                    <div className="border-2 border-indigo-600 rounded-xl p-1 relative">
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full"><CheckCircle className="w-3 h-3" /></div>
                      <div className="aspect-video bg-slate-100 rounded-lg mb-2 overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <span className="text-white font-black tracking-widest">STREETWEAR PRO</span>
                         </div>
                      </div>
                      <p className="text-xs font-bold text-slate-800 text-center py-1">Streetwear Edition</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Autres Thèmes</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-slate-200 rounded-xl p-1 cursor-pointer hover:border-indigo-300 transition-colors opacity-60 hover:opacity-100">
                        <div className="aspect-video bg-slate-100 rounded-lg mb-1 flex items-center justify-center text-slate-300"><LayoutTemplate className="w-6 h-6" /></div>
                        <p className="text-[10px] font-bold text-slate-600 text-center">Minimalist</p>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-1 cursor-pointer hover:border-indigo-300 transition-colors opacity-60 hover:opacity-100">
                        <div className="aspect-video bg-slate-100 rounded-lg mb-1 flex items-center justify-center text-slate-300"><LayoutTemplate className="w-6 h-6" /></div>
                        <p className="text-[10px] font-bold text-slate-600 text-center">Luxury Abaya</p>
                      </div>
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
                      <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs font-bold text-slate-500">.beyastore.ma</span>
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
                  <button className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex flex-col items-center justify-center gap-1">
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
              <Globe className="w-3 h-3" /> {storeName.toLowerCase().replace(/\s+/g, '')}.beyastore.ma
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button className="p-1.5 hover:bg-slate-100 rounded-md text-indigo-600 bg-indigo-50"><Monitor className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-slate-100 rounded-md"><Smartphone className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Iframe / Preview Area */}
          <div className="flex-1 bg-white relative overflow-y-auto">
             {/* Dummy Store Preview */}
             <div className="w-full min-h-full">
                {/* Navbar */}
                <div className="p-6 flex justify-between items-center border-b border-slate-100">
                   <h2 className="text-2xl font-black uppercase tracking-tighter">{storeName}</h2>
                   <div className="flex gap-6 text-sm font-bold text-slate-500">
                      <span>Home</span>
                      <span>Collections</span>
                      <span>About</span>
                   </div>
                   <ShoppingBag className="w-6 h-6" />
                </div>
                {/* Hero */}
                <div className="h-80 bg-slate-900 text-white flex flex-col items-center justify-center text-center p-8">
                   <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">New Collection Drop</h1>
                   <p className="text-lg text-slate-300 mb-8 max-w-md">Discover our latest premium quality garments designed for the modern lifestyle.</p>
                   <button className="px-8 py-3 bg-white text-slate-900 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform">Shop Now</button>
                </div>
                {/* Products */}
                <div className="p-12">
                   <h3 className="text-xl font-black uppercase text-center mb-8">Trending Now</h3>
                   <div className="grid grid-cols-4 gap-6">
                      {[1,2,3,4].map(i => (
                         <div key={i} className="group">
                            <div className="aspect-[3/4] bg-slate-100 mb-4 rounded-lg overflow-hidden relative">
                               <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xl">Add to cart</button>
                               </div>
                            </div>
                            <h4 className="font-bold text-sm">Premium Product {i}</h4>
                            <p className="text-slate-500 text-sm">450.00 MAD</p>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
