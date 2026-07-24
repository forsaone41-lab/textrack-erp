const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'StoreBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The new component to insert
const newLayout = `
  // --- PRO THEMES ---
  const LayoutProLamode = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts, storeIsAr, storeLang, config, activeTheme }: any) => {
    const primaryColor = config.primaryColor || activeTheme.defaultColor;
    const fontFamily = config.fontFamily || activeTheme.defaultFont;
    
    // Derived values
    const featuredCollection = storeProducts.slice(0, 3);
    const newReleases = storeProducts.slice(3, 7);

    return (
      <div className={\`flex-1 w-full bg-[#fcfcfc] text-[#1a1a1a] \${fontFamily} relative pb-20\`}>
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
           <button className="w-10 h-10 flex items-center justify-center"><div className="w-5 h-0.5 bg-slate-800 relative before:absolute before:w-3 before:h-0.5 before:bg-slate-800 before:-top-1.5 before:left-0 after:absolute after:w-4 after:h-0.5 after:bg-slate-800 after:top-1.5 after:left-0"></div></button>
           <h1 className="text-xl font-serif font-black tracking-tighter">Lamode</h1>
           <div className="flex gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative"><ShoppingBag className="w-5 h-5 text-slate-800" /></button>
              <button><Search className="w-5 h-5 text-slate-800" /></button>
           </div>
        </div>

        {page === 'home' && (
          <div className="px-6 space-y-8 animate-in fade-in duration-500">
             {/* Categories */}
             <div className="flex justify-between items-center overflow-x-auto scrollbar-hide gap-4 pb-2">
                {['Tops', 'Bottoms', 'Shoes', 'Jewelry'].map(cat => (
                   <div key={cat} className="flex flex-col items-center gap-2 cursor-pointer group shrink-0">
                      <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-slate-800 transition-colors">
                         <span className="text-xl opacity-50 group-hover:opacity-100">👔</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">{cat}</span>
                   </div>
                ))}
             </div>

             {/* Hero Collection Card */}
             <div className="relative w-full h-48 rounded-[2rem] overflow-hidden shadow-lg cursor-pointer group">
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-900/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-center">
                   <p className="text-white/80 text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1">The Best <ArrowRight className="w-3 h-3" /></p>
                   <h2 className="text-3xl font-serif text-white leading-tight">Lamode<br/>Collection</h2>
                   <div className="absolute bottom-6 right-6 bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 flex items-center gap-1">2023 <Sparkles className="w-3 h-3" /></div>
                </div>
             </div>

             {/* New Release */}
             <div>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-black text-slate-900">New Release</h3>
                   <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">See all</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {filteredProducts.map((p: any) => (
                      <div key={p.id} onClick={() => navigateToProduct(p.id)} className="group cursor-pointer">
                         <div className="relative aspect-[3/4] bg-slate-50 rounded-[1.5rem] overflow-hidden mb-3">
                            <img src={getCoverImage(p)} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                            {p.id % 2 === 0 && (
                               <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"><Sparkles className="w-2.5 h-2.5" /> Best Seller</div>
                            )}
                         </div>
                         <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{p.name}</h4>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-emerald-600">\${parseFloat(p.price).toFixed(2)}</span>
                            <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.{p.id % 5 + 5}</div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {page === 'product' && activeProductId && (() => {
           const product = storeProducts.find((p: any) => p.id === activeProductId);
           if (!product) return null;
           return (
              <div className="px-6 animate-in slide-in-from-bottom-8 duration-500">
                 <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setPage('home')} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-900" /></button>
                    <h2 className="text-xs font-bold uppercase tracking-widest">Product Details</h2>
                    <button className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50"><Heart className="w-4 h-4 text-slate-900" /></button>
                 </div>
                 
                 <div className="relative bg-slate-50 rounded-[2rem] p-8 mb-6 h-80 flex items-center justify-center">
                    <img src={getCoverImage(product)} className="w-full h-full object-contain drop-shadow-2xl" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                    </div>
                 </div>

                 <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2">
                    {[getCoverImage(product), getCoverImage(product), getCoverImage(product)].map((img, i) => (
                       <div key={i} className={\`w-14 h-14 rounded-2xl bg-slate-50 shrink-0 border-2 \${i === 1 ? 'border-[#ff5a1f]' : 'border-transparent'}\`}>
                          <img src={img} className="w-full h-full object-cover mix-blend-multiply p-1" />
                       </div>
                    ))}
                 </div>

                 <div className="flex items-center justify-between mb-4">
                    <div className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"><Sparkles className="w-3 h-3" /> Best Seller</div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.8 (65 Ratings)</div>
                 </div>

                 <h1 className="text-xl font-bold text-slate-900 leading-tight mb-6">{product.name}</h1>
                 
                 <div className="flex items-center justify-between mb-8">
                    <span className="text-2xl font-black text-emerald-600">\${parseFloat(product.price).toFixed(2)}</span>
                    <div className="flex items-center border border-slate-200 rounded-full px-2 py-1">
                       <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900">-</button>
                       <span className="text-sm font-bold w-6 text-center">1</span>
                       <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900">+</button>
                    </div>
                 </div>

                 <button onClick={() => setPage('checkout')} className="w-full py-5 bg-[#ff5a1f] text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-[#ff5a1f]/30 hover:scale-[1.02] transition-transform">
                    Order Now
                 </button>
              </div>
           );
        })()}

        {page === 'checkout' && (
           <div className="px-6 pt-4">
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
           <div className="px-6 py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-8 shadow-xl">
                 <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Order Successful!</h2>
              <p className="text-slate-500 text-sm mb-10">Your items are being prepared.</p>
              <button onClick={() => setPage('home')} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm">
                 Continue Shopping
              </button>
           </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-6 left-6 right-6 h-16 bg-[#1e1e1e] rounded-[2rem] flex items-center justify-between px-8 shadow-2xl z-50">
           <button className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center text-[#ff5a1f]"><Home className="w-5 h-5 fill-current" /></button>
           <button className="text-slate-400 hover:text-white transition-colors"><Grid className="w-5 h-5" /></button>
           <button className="text-slate-400 hover:text-white transition-colors relative"><ShoppingBag className="w-5 h-5" /><span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff5a1f] rounded-full border-2 border-[#1e1e1e]"></span></button>
           <button className="text-slate-400 hover:text-white transition-colors"><Heart className="w-5 h-5" /></button>
           <button className="text-slate-400 hover:text-white transition-colors"><User className="w-5 h-5" /></button>
        </div>
      </div>
    );
  };
\n`;

content = content.replace('const Layout = () => {', newLayout + '  const Layout = () => {');

// Update themes registry to use the new layouts
content = content.replace(/{ id: 'blush-studio', name: 'Blush Studio', layout: 'hero-center'/g, "{ id: 'blush-studio', name: 'Lamode App (Pro)', layout: 'pro-lamode'");
content = content.replace(/{ id: 'editorial-noir', name: 'Editorial Noir', layout: 'split-screen'/g, "{ id: 'editorial-noir', name: 'Lamode Web (Pro)', layout: 'pro-lamode'");

// Make sure Layout router uses it
const layoutRouterMatch = `if (activeTheme.layout === 'clement') return <LayoutClement {...props} />;`;
const newLayoutRouter = `if (activeTheme.layout === 'pro-lamode') return <LayoutProLamode {...props} />;\n       ` + layoutRouterMatch;
content = content.replace(layoutRouterMatch, newLayoutRouter);

fs.writeFileSync(filePath, content);
console.log('LayoutProLamode injected successfully.');
