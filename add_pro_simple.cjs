const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'StoreBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newLayout = `
  const LayoutProSimple = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts, storeIsAr, storeLang, config, activeTheme }: any) => {
    const primaryColor = config.primaryColor || activeTheme.defaultColor;
    const fontFamily = config.fontFamily || activeTheme.defaultFont;
    
    return (
      <div className={\`flex-1 w-full bg-white text-[#1a1a1a] \${fontFamily} relative pb-20\`}>
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
           <h1 className="text-xl font-bold tracking-tighter text-emerald-500">STELLAR</h1>
           <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="What are you looking for?" className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500" />
           </div>
           <div className="flex gap-4 items-center">
              <span className="hidden md:block text-xs font-bold text-slate-600">🇬🇧 English</span>
              <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2">
                 <ShoppingBag className="w-5 h-5 text-slate-800" />
                 <span className="text-xs font-bold bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center">2</span>
              </button>
           </div>
        </div>

        {page === 'home' && (
          <div className="animate-in fade-in duration-500">
             {/* Hero Banner */}
             <div className="bg-[#8b939a] text-white w-full h-[300px] md:h-[400px] relative overflow-hidden flex flex-col justify-center px-8 md:px-20">
                <div className="relative z-10">
                   <h2 className="text-5xl md:text-7xl font-light leading-tight">Simple<br/>is More</h2>
                </div>
                <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80" className="absolute right-0 top-0 h-full object-cover object-left opacity-90 md:w-1/2" />
                <div className="absolute bottom-10 right-10 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center z-10">
                   <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
             </div>

             <div className="max-w-7xl mx-auto px-6 py-8 flex gap-10">
                {/* Left Sidebar Filter (Desktop) */}
                <div className="hidden md:block w-64 shrink-0">
                   <div className="mb-8 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Home className="w-3 h-3" /> / Clothes</div>
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold">Filter</h3>
                      <span className="text-xs text-emerald-500 cursor-pointer">Clear all</span>
                   </div>
                   
                   <div className="mb-6">
                      <div className="flex items-center justify-between mb-4 cursor-pointer">
                         <span className="text-sm font-bold text-slate-600">Brand</span>
                         <ArrowRight className="w-4 h-4 -rotate-90 text-slate-400" />
                      </div>
                      <div className="space-y-3">
                         {['Nike', 'Adidas', 'New Balance', 'Puma'].map((b, i) => (
                            <div key={b} className="flex items-center gap-3">
                               <div className={\`w-4 h-4 rounded border flex items-center justify-center \${i===0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}\`}>
                                  {i===0 && <CheckCircle className="w-3 h-3" />}
                               </div>
                               <span className="text-sm text-slate-600">{b}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">84 result for clothes</h2>
                      <div className="flex items-center gap-4 text-sm">
                         <span className="text-slate-400">Sort by: <span className="font-bold text-slate-900">Popular</span></span>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                      {filteredProducts.map((p: any) => (
                         <div key={p.id} onClick={() => navigateToProduct(p.id)} className="group cursor-pointer">
                            <div className="relative aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-4">
                               <img src={getCoverImage(p)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                               {p.id % 3 === 0 && <div className="absolute top-3 left-3 bg-white text-rose-500 text-[10px] font-bold px-2 py-1 rounded shadow-sm">Hot item</div>}
                               <button className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Heart className="w-4 h-4" />
                               </button>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{p.category || 'Simple'}</p>
                            <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1 line-clamp-1">{p.name}</h4>
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-black text-sky-600">\${parseFloat(p.price).toFixed(2)}</span>
                               {p.comparePrice && <span className="text-xs text-rose-400 line-through">\${parseFloat(p.comparePrice).toFixed(2)}</span>}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {page === 'product' && activeProductId && (() => {
           const product = storeProducts.find((p: any) => p.id === activeProductId);
           if (!product) return null;
           return (
              <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in">
                 <button onClick={() => setPage('home')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8"><ArrowLeft className="w-4 h-4"/> Back</button>
                 <div className="flex flex-col md:flex-row gap-12">
                    <div className="w-full md:w-1/2">
                       <img src={getCoverImage(product)} className="w-full aspect-[3/4] object-cover rounded-2xl shadow-sm bg-slate-50 mix-blend-multiply" />
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{product.category || 'CLOTHING'}</p>
                       <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>
                       <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                          <span className="text-3xl font-black text-sky-600">\${parseFloat(product.price).toFixed(2)}</span>
                       </div>
                       <p className="text-slate-600 mb-8 leading-relaxed text-sm">Experience unparalleled comfort and style with our premium simple collection. Less is more.</p>
                       <button onClick={() => setPage('checkout')} className="w-full md:w-auto bg-emerald-500 text-white px-12 py-4 font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition-colors shadow-lg rounded-xl flex items-center justify-center gap-2">
                          <ShoppingBag className="w-5 h-5" /> Add to Cart
                       </button>
                    </div>
                 </div>
              </div>
           );
        })()}

        {page === 'checkout' && (
           <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
              <div className="flex items-center mb-10 pb-6">
                 <button onClick={() => setPage('product')} className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-900" /></button>
                 <h2 className="text-xl font-bold flex-1 text-center pr-10">Checkout</h2>
              </div>
              <div className="bg-white p-8 border border-slate-100 shadow-sm rounded-2xl">
                 <CheckoutForm
                     storeIsAr={storeIsAr}
                     onSubmit={submitGlobalOrder}
                     product={storeProducts.find((p: any) => p.id === activeProductId) || storeProducts[0]}
                     quantity={1}
                  />
              </div>
           </div>
        )}

        {page === 'success' && (
           <div className="max-w-2xl mx-auto px-4 py-24 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-sm">
                 <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Order Confirmed!</h2>
              <p className="text-slate-500 text-sm mb-10">Thank you for your purchase. We are preparing your order.</p>
              <button onClick={() => setPage('home')} className="bg-emerald-500 text-white px-10 py-4 font-bold rounded-xl text-sm hover:bg-emerald-600 transition-colors">
                 Return to Shop
              </button>
           </div>
        )}
      </div>
    );
  };
`;

content = content.replace('const Layout = () => {', newLayout + '\n  const Layout = () => {');

content = content.replace(/{ id: 'pop-fashion', name: 'Pop Fashion', layout: 'playful'/g, "{ id: 'pop-fashion', name: 'Simple Minimal (Pro)', layout: 'pro-simple'");

const layoutRouterMatch = `if (activeTheme.layout === 'pro-ultimate') return <LayoutProUltimate {...props} />;`;
const newLayoutRouter = `if (activeTheme.layout === 'pro-simple') return <LayoutProSimple {...props} />;\n       ` + layoutRouterMatch;
content = content.replace(layoutRouterMatch, newLayoutRouter);

fs.writeFileSync(filePath, content);
console.log('LayoutProSimple injected successfully.');
