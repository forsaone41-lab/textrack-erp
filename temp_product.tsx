import React from 'react';
import { ArrowLeft, ArrowRight, Search, Heart, Sparkles, Star, Grid, ShoppingBag, User, CheckCircle, Home } from 'lucide-react';
const CheckoutForm = (props:any) => <div/>;
const getCoverImage = (p:any) => p;
const tr = (s:any) => s;
const Foo = () => (
              <div className="px-6 animate-in slide-in-from-bottom-8 duration-500 md:max-w-6xl md:mx-auto md:py-12 md:flex md:gap-12 md:items-start">
                 <div className="flex items-center justify-between mb-6 md:hidden">
                    <button onClick={() => setPage('home')} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-900" /></button>
                    <h2 className="text-xs font-bold uppercase tracking-widest">Product Details</h2>
                    <button onClick={() => setPage('collections')} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50"><Heart className="w-4 h-4 text-slate-900" /></button>
                 </div>
                 
                 <div className="md:w-1/2">
                    <div className="relative bg-slate-50 rounded-[2rem] p-8 mb-6 h-80 md:h-[600px] flex items-center justify-center">
                       <img src={getCoverImage(product)} className="w-full h-full object-contain drop-shadow-2xl" />
                       <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex justify-center gap-1.5 md:gap-2">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full"></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-800 rounded-full"></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full"></div>
                       </div>
                    </div>

                 <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2 md:hidden">
                    {[getCoverImage(product), getCoverImage(product), getCoverImage(product)].map((img, i) => (
                       <div key={i} className={`w-14 h-14 rounded-2xl bg-slate-50 shrink-0 border-2 ${i === 1 ? 'border-[#ff5a1f]' : 'border-transparent'}`}>
                          <img src={img} className="w-full h-full object-cover mix-blend-multiply p-1" />
                       </div>
                    ))}
                 </div>
                 </div>

                 <div className="md:w-1/2 md:flex md:flex-col md:justify-center">
                    <div className="hidden md:flex items-center justify-between mb-8">
                       <button onClick={() => setPage('home')} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-900" /></button>
                       <h2 className="text-xs font-bold uppercase tracking-widest">Product Details</h2>
                       <button onClick={() => setPage('collections')} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50"><Heart className="w-4 h-4 text-slate-900" /></button>
                    </div>

                 <div className="flex items-center justify-between mb-4">
                    <div className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"><Sparkles className="w-3 h-3" /> Best Seller</div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.8 (65 Ratings)</div>
                 </div>

                 <h1 className="text-xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">{product.name}</h1>
                 
                 <div className="flex items-center justify-between mb-8 md:mb-12">
                    <span className="text-2xl md:text-4xl font-black text-emerald-600">${parseFloat(product.price).toFixed(2)}</span>
                    <div className="flex items-center border border-slate-200 rounded-full px-2 py-1 md:px-4 md:py-2">
                       <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 md:text-lg">-</button>
                       <span className="text-sm md:text-lg font-bold w-6 md:w-10 text-center">1</span>
                       <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 md:text-lg">+</button>
                    </div>
                 </div>

                 <button onClick={() => setPage('checkout')} className="w-full py-5 md:py-6 bg-[#ff5a1f] text-white rounded-[1.5rem] font-bold text-sm md:text-base shadow-xl shadow-[#ff5a1f]/30 hover:scale-[1.02] transition-transform">
                    Order Now
                 </button>
              </div>
           );
);