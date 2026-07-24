import React from 'react';
import { ArrowLeft, Search, Heart, Sparkles, Star, Grid, ShoppingBag, User, CheckCircle, Home } from 'lucide-react';
const CheckoutForm = (props:any) => <div/>;
const getCoverImage = (p:any) => p;
    const primaryColor = config?.primaryColor || activeTheme?.defaultColor;
    const fontFamily = config?.fontFamily || activeTheme?.defaultFont;
    
    return (
      <div className={`flex-1 w-full bg-slate-50 text-[#1a1a1a] ${fontFamily} relative pb-24 overflow-x-hidden min-h-screen`}>
        
        ()}

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

