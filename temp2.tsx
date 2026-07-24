import React from 'react';
import { ArrowLeft, Search, Heart, Sparkles, Star, Grid, ShoppingBag, User, CheckCircle, Home } from 'lucide-react';
    const primaryColor = config?.primaryColor || activeTheme?.defaultColor;
    const fontFamily = config?.fontFamily || activeTheme?.defaultFont;
    
    return (
      <div className={`flex-1 w-full bg-slate-50 text-[#1a1a1a] ${fontFamily} relative pb-24 overflow-x-hidden min-h-screen`}>
        
        {page === 'home' && (
          <div className="animate-in fade-in duration-500">
             {/* Vibrant Curved Hero */}
             <div className="relative w-full h-[400px] md:h-[600px] md:rounded-[3rem] md:max-w-6xl md:mx-auto md:mt-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-b-[3rem] p-6 md:p-12 text-white overflow-hidden shadow-2xl">
                {/* Decorative bubbles */}
                <div className="absolute top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
                
                {/* Header Navbar inside Hero */}
                <div className="flex items-center justify-between relative z-10 mb-8 pt-4">
                   <button onClick={() => setPage('home')} className="w-10 h-10 flex items-center"><ArrowLeft className="w-6 h-6 text-white" /></button>
                   <div className="flex gap-4">
                      <button onClick={() => setPage('collections')}><Search className="w-5 h-5 text-white" /></button>
                      <button onClick={() => setPage('collections')}><Heart className="w-5 h-5 text-white" /></button>
                   </div>
                </div>

                <div className="relative z-10 mt-4 md:mt-12 md:max-w-lg">
                   <p className="text-white/80 text-sm md:text-xl font-bold tracking-widest uppercase mb-1 md:mb-4 drop-shadow-sm">New Nike Series</p>
                   <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter drop-shadow-md">JOYRIDE</h2>
                </div>

                {/* Floating Sneaker Image */}
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80" className="absolute -right-16 -bottom-10 w-96 h-96 md:w-[600px] md:h-[600px] md:right-10 md:bottom-0 object-contain -rotate-12 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] z-20" />
             </div>

             {/* Featured Horizontal Scroll */}
             <div className="mt-8 px-6 md:max-w-6xl md:mx-auto md:mt-16">
                <h3 className="text-sm md:text-2xl font-bold text-slate-800 mb-4 md:mb-8">Featured</h3>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 -mx-6 px-6 md:grid md:grid-cols-4 md:mx-0 md:px-0">
                   {storeProducts.slice(0, 4).map((p: any, i: number) => (
                      <div key={p.id} onClick={() => navigateToProduct(p.id)} className="w-40 md:w-full shrink-0 bg-white rounded-3xl p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative cursor-pointer hover:-translate-y-2 transition-transform">
                         <div className="absolute top-4 left-4 bg-lime-400 text-slate-900 text-[9px] md:text-xs font-black px-2 md:px-3 py-0.5 md:py-1 rounded-md">20%</div>
                         <img src={getCoverImage(p)} className="w-full h-24 md:h-48 object-contain mt-6 mb-4 drop-shadow-xl" />
                         <div className="text-center">
                            <span className="text-sm md:text-xl font-black text-slate-800">${parseFloat(p.price).toFixed(2)}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Discover Tiles */}
             <div className="mt-2 px-6 md:max-w-6xl md:mx-auto md:mt-12">
                <h3 className="text-sm md:text-2xl font-bold text-slate-800 mb-4 md:mb-8">Discover</h3>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 -mx-6 px-6 md:grid md:grid-cols-2 md:mx-0 md:px-0">
                   <div onClick={() => setPage('collections')} className="w-64 md:w-full h-32 md:h-80 shrink-0 rounded-3xl overflow-hidden relative shadow-lg cursor-pointer group">
                      <img src="https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
                      <span className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white font-bold text-sm md:text-3xl">New Sneaker Trends</span>
                   </div>
                   <div onClick={() => setPage('collections')} className="w-48 md:w-full h-32 md:h-80 shrink-0 rounded-3xl overflow-hidden relative shadow-lg cursor-pointer bg-gradient-to-br from-blue-500 to-cyan-400 group">
                      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 text-white group-hover:scale-105 transition-transform">
                         <span className="font-bold text-sm md:text-3xl">Custom Designs</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {page === 'product' && activeProductId && (() => {
           const product = storeProducts.find((p: any) => p.id === activeProductId);
           if (!product) return null;
           return (
              <div className="bg-white min-h-screen animate-in slide-in-from-right duration-500 md:max-w-6xl md:mx-auto md:my-12 md:rounded-[3rem] md:shadow-2xl md:min-h-0 md:pb-12 md:relative">
                 <div className="flex items-center justify-between p-6 md:p-12">
                    <button onClick={() => setPage('home')} className="w-10 h-10 flex items-center hover:scale-110 transition-transform"><ArrowLeft className="w-6 h-6 md:w-8 md:h-8 text-slate-800" /></button>
                    <div className="flex-1 bg-slate-100 h-10 rounded-full mx-4 flex items-center px-4">
                       <Search className="w-4 h-4 text-slate-400 mr-2" />
                       <input type="text" className="bg-transparent outline-none text-sm w-full" placeholder="Search..." />
                    </div>
                    <button onClick={() => setIsCartOpen(true)}><ShoppingBag className="w-6 h-6 text-slate-800" /></button>
                 </div>

                 {/* Categories Row */}
                 <div className="px-6 md:px-12 mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">{product.category || 'Sneakers'}</h1>
                    <div className="flex gap-6 text-sm font-bold">
                       <span className="text-indigo-600 border-b-2 border-indigo-600 pb-2">Nike</span>
                       <span className="text-slate-400">Adidas</span>
                       <span className="text-slate-400">Puma</span>
                       <span className="text-slate-400">Hummel</span>
                       <span className="text-slate-400">Reebok</span>
                    </div>
                 </div>

                 {/* Giant Product Card */}
                 <div className="px-6 md:px-12 mb-8 md:mb-16">
                    <div className="w-full bg-gradient-to-br from-rose-500 to-orange-400 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 text-white relative shadow-2xl shadow-rose-500/30 overflow-hidden h-[340px] md:h-[600px]">
                       <div className="flex justify-between items-start relative z-10">
                          <div>
                             <p className="text-[10px] md:text-sm font-black tracking-widest uppercase mb-1 md:mb-2 opacity-80">NIKE</p>
                             <h2 className="text-2xl md:text-6xl font-bold leading-none mb-2 md:mb-4">{product.name}</h2>
                             <p className="text-lg md:text-3xl font-bold">${parseFloat(product.price).toFixed(2)}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setPage('collections'); }} className="w-8 h-8 md:w-16 md:h-16 flex items-center justify-center border border-white/30 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
                             <Heart className="w-4 h-4 md:w-8 md:h-8 text-white" />
                          </button>
                       </div>
                       <img src={getCoverImage(product)} className="absolute -right-12 bottom-10 md:right-10 md:bottom-20 w-80 h-80 md:w-[600px] md:h-[600px] object-contain -rotate-12 drop-shadow-2xl z-20" />
                    </div>
                 </div>

                 {/* Sales Grid */}
                 <div className="px-6 pb-24">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Sales</h3>
                    <div className="grid grid-cols-3 gap-3">
                       {filteredProducts.slice(0, 3).map((p: any) => (
                          <div key={p.id} onClick={() => navigateToProduct(p.id)} className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative">
                             <div className="absolute top-2 left-2 bg-lime-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded">20%</div>
                             <img src={getCoverImage(p)} className="w-full h-16 object-contain my-3 drop-shadow-md" />
                             <div className="text-center pb-1">
                                <span className="text-[11px] font-black text-slate-800">${parseFloat(p.price).toFixed(2)}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
                 
                 {/* Floating CTA */}
                 <div className="fixed bottom-24 left-6 right-6">
                    <button onClick={() => setPage('checkout')} className="w-full h-14 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                       <ShoppingBag className="w-5 h-5" /> Buy Now
                    </button>
                 </div>
              </div>
           );
        })()}

        {page === 'checkout' && (
           <div className="px-6 pt-6 md:max-w-3xl md:mx-auto md:py-12">
              <div className="flex items-center mb-8">
                 <button onClick={() => setPage('product')} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center"><ArrowLeft className="w-4 h-4 text-slate-900" /></button>
                 <h2 className="text-sm font-black flex-1 text-center pr-10">Checkout</h2>
              </div>
              <CheckoutForm
                  storeIsAr={storeIsAr}
                  onSubmit={submitGlobalOrder}
                  product={storeProducts.find((p: any) => p.id === activeProductId) || storeProducts[0]}
                  quantity={1}
               />
           </div>
        )}

        {page === 'success' && (
           <div className="px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30">
                 <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Awesome! 🎉</h2>
              <p className="text-slate-500 text-sm mb-10">Your new kicks are on the way.</p>
              <button onClick={() => setPage('home')} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-indigo-600/30">
                 Back to Store
              </button>
           </div>
        )}

        {/* Floating Bottom Nav */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full h-16 flex items-center justify-between px-8 shadow-[0_10px_40px_rgba(0,0,0,0.1)] w-[calc(100%-3rem)] max-w-sm z-50">
           <button onClick={() => setPage('home')} className={`${page === 'home' ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'} relative transition-colors`}>
              {page === 'home' && <div className="absolute inset-0 bg-indigo-50 rounded-full scale-150 -z-10"></div>}
              <Home className={`w-5 h-5 ${page === 'home' ? 'fill-indigo-600' : ''}`} />
           </button>
           <button onClick={() => setPage('collections')} className={`transition-colors ${page === 'collections' ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}><Grid className="w-5 h-5" /></button>
           <button onClick={() => setIsCartOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors"><ShoppingBag className="w-5 h-5" /></button>
           <button onClick={() => setPage('home')} className="text-slate-400 hover:text-indigo-600 transition-colors"><User className="w-5 h-5" /></button>
        </div>
      </div>
    );
  };

