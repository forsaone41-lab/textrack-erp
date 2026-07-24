const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'StoreBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newLayout = `
  const LayoutProUltimate = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts, storeIsAr, storeLang, config, activeTheme }: any) => {
    const primaryColor = config.primaryColor || activeTheme.defaultColor;
    const fontFamily = config.fontFamily || activeTheme.defaultFont;
    
    return (
      <div className={\`flex-1 w-full bg-white text-[#1a1a1a] \${fontFamily} relative pb-20\`}>
        
        {/* Top Navbar */}
        <div className="border-b border-slate-100 hidden md:block bg-slate-900 text-white py-2 px-8 text-xs flex justify-between items-center">
           <div>{config.contactEmail || 'clothstore@example.com'}</div>
           <div className="flex gap-4">
              <span>Free International Shipping On Orders Over $60</span>
           </div>
        </div>
        <div className="flex items-center justify-between px-4 md:px-8 py-6 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
           <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-sky-500" />
              {config.storeName || 'Clothing Store'}
           </h1>
           <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
              <span className="text-slate-900">Home</span>
              <span className="hover:text-slate-900 cursor-pointer">About Us</span>
              <span className="hover:text-slate-900 cursor-pointer">Shop</span>
              <span className="hover:text-slate-900 cursor-pointer">Collection</span>
              <span className="hover:text-slate-900 cursor-pointer">Contact Us</span>
           </div>
           <div className="flex gap-4">
              <button><Search className="w-5 h-5 text-slate-800" /></button>
              <button><Heart className="w-5 h-5 text-slate-800" /></button>
              <button><User className="w-5 h-5 text-slate-800" /></button>
              <button onClick={() => setIsCartOpen(true)} className="relative"><ShoppingBag className="w-5 h-5 text-slate-800" /><span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white"></span></button>
           </div>
        </div>

        {page === 'home' && (
          <div className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 md:px-8 pt-8">
             {/* Split Hero */}
             <div className="flex flex-col md:flex-row gap-6 mb-16">
                <div className="flex-1 bg-sky-100 rounded-[2rem] p-10 flex flex-col justify-center relative overflow-hidden h-[400px]">
                   <div className="relative z-10 max-w-md">
                      <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">The Ultimate New Best Winter Collection</h2>
                      <p className="text-slate-600 mb-8">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                      <button className="bg-white border-2 border-slate-900 text-slate-900 px-8 py-3 font-bold uppercase text-sm tracking-widest hover:bg-slate-900 hover:text-white transition-colors">Shop Collections</button>
                   </div>
                   {/* Background Image / Decorative */}
                   <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80" className="absolute right-0 bottom-0 h-[110%] object-cover object-left max-w-[50%]" />
                </div>
                <div className="w-full md:w-1/3 bg-sky-50 rounded-[2rem] p-6 relative h-[400px] overflow-hidden flex flex-col items-center group cursor-pointer">
                   <div className="absolute top-6 right-6 bg-orange-500 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center font-black leading-none z-10 shadow-lg group-hover:scale-110 transition-transform"><span className="text-xl">30</span><span className="text-[10px]">% OFF</span></div>
                   <h3 className="text-3xl font-black tracking-widest uppercase mb-4 z-10">SALE</h3>
                   <div className="flex-1 w-full relative rounded-2xl overflow-hidden mb-4">
                      <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   </div>
                   <p className="font-bold text-slate-800">The Ultimate Collection</p>
                </div>
             </div>

             {/* Bottom Grid Layout */}
             <div className="flex flex-col md:flex-row gap-10">
                {/* Left Testimonial */}
                <div className="w-full md:w-1/4">
                   <h3 className="text-2xl font-black mb-6">Testimonial</h3>
                   <div className="bg-[#3a3f44] text-white p-8 rounded-tr-[3rem] rounded-bl-[3rem] text-center">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/10" />
                      <h4 className="font-bold mb-1">John Verma</h4>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest mb-6">Business CEO</p>
                      <p className="text-sm text-white/80 leading-relaxed italic">"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."</p>
                      <div className="flex justify-center gap-2 mt-6">
                         <div className="w-4 h-1.5 bg-white rounded-full"></div>
                         <div className="w-4 h-1.5 bg-white/30 rounded-full"></div>
                         <div className="w-4 h-1.5 bg-white/30 rounded-full"></div>
                      </div>
                   </div>
                </div>

                {/* Right Products */}
                <div className="w-full md:w-3/4">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black">Grab Your Favorite Winter Cloths</h3>
                      <div className="flex gap-2">
                         <button className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:bg-sky-200"><ArrowLeft className="w-4 h-4" /></button>
                         <button className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900"><ArrowRight className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.slice(0, 3).map((p: any) => (
                         <div key={p.id} onClick={() => navigateToProduct(p.id)} className="group cursor-pointer">
                            <div className="relative aspect-[4/3] bg-slate-100 mb-4 overflow-hidden">
                               <img src={getCoverImage(p)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{p.category || 'CATEGORY'}</p>
                                  <h4 className="font-bold text-slate-800 mb-1">{p.name}</h4>
                                  <p className="font-black text-slate-900">\${parseFloat(p.price).toFixed(2)}</p>
                               </div>
                               <button className="text-slate-400 hover:text-rose-500 transition-colors"><Heart className="w-5 h-5" /></button>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-4">
                               <div className="flex text-slate-800"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                               <span>4.5/5 (99 Review)</span>
                            </div>
                            <button className="w-full border-2 border-[#3a3f44] text-[#3a3f44] py-2 font-bold text-sm hover:bg-[#3a3f44] hover:text-white transition-colors">
                               Add To Bag
                            </button>
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
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-in fade-in">
                 <button onClick={() => setPage('home')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8"><ArrowLeft className="w-4 h-4"/> Back to Store</button>
                 <div className="flex flex-col md:flex-row gap-12">
                    <div className="w-full md:w-1/2">
                       <img src={getCoverImage(product)} className="w-full aspect-[4/5] object-cover bg-slate-50 shadow-sm" />
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{product.category || 'CLOTHING'}</p>
                       <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>
                       <div className="flex items-center gap-4 mb-6">
                          <span className="text-3xl font-black text-slate-900">\${parseFloat(product.price).toFixed(2)}</span>
                          <div className="flex items-center gap-1 text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9 Rating</div>
                       </div>
                       <p className="text-slate-600 mb-8 leading-relaxed">Experience unparalleled comfort and style with our premium {product.name}. Crafted from carefully selected materials, this piece offers both durability and elegance for any occasion.</p>
                       <button onClick={() => setPage('checkout')} className="w-full md:w-auto bg-[#3a3f44] text-white px-12 py-4 font-black uppercase tracking-widest text-sm hover:bg-black transition-colors shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                          <ShoppingBag className="w-5 h-5" /> Buy Now
                       </button>
                    </div>
                 </div>
              </div>
           );
        })()}

        {page === 'checkout' && (
           <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
              <div className="flex items-center mb-10 border-b border-slate-100 pb-6">
                 <button onClick={() => setPage('product')} className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-900" /></button>
                 <h2 className="text-2xl font-black flex-1 text-center pr-10 uppercase tracking-tight">Secure Checkout</h2>
              </div>
              <div className="bg-white p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl">
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
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-sky-100/50">
                 <CheckCircle className="w-12 h-12 text-sky-500" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Order Confirmed!</h2>
              <p className="text-slate-500 text-lg mb-10">Thank you for your purchase. We are preparing your order for shipping.</p>
              <button onClick={() => setPage('home')} className="bg-[#3a3f44] text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:bg-black transition-colors">
                 Return to Shop
              </button>
           </div>
        )}
      </div>
    );
  };
`;

content = content.replace('const Layout = () => {', newLayout + '\n  const Layout = () => {');

content = content.replace(/{ id: 'emerald-market', name: 'Emerald Market', layout: 'mazia'/g, "{ id: 'emerald-market', name: 'Ultimate Store (Pro)', layout: 'pro-ultimate'");

const layoutRouterMatch = `if (activeTheme.layout === 'pro-joyride') return <LayoutProJoyride {...props} />;`;
const newLayoutRouter = `if (activeTheme.layout === 'pro-ultimate') return <LayoutProUltimate {...props} />;\n       ` + layoutRouterMatch;
content = content.replace(layoutRouterMatch, newLayoutRouter);

fs.writeFileSync(filePath, content);
console.log('LayoutProUltimate injected successfully.');
