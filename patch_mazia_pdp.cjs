const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Add activePDPTab state to LayoutMazia
const stateOld = `    const [quantity, setQuantity] = useState(1);`;
const stateNew = `    const [quantity, setQuantity] = useState(1);\n    const [activePDPTab, setActivePDPTab] = useState('description');`;
if (content.includes(stateOld) && !content.includes('activePDPTab')) {
    content = content.replace(stateOld, stateNew);
}

// 2. Add PDP Layout
const pdpUI = `
      {page === 'product' && activeProductId && (() => {
         const product = storeProducts.find((p: any) => p.id === activeProductId);
         if (!product) return null;
         const images = [getCoverImage(product), ...(product.gallery || []), 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80'].slice(0, 3);
         const sizes = ['S', 'M', 'XL', 'XXL'];
         
         return (
            <div className="flex-1 w-full bg-white relative">
               {/* Decorative Dotted Grid on Right */}
               <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
               
               <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 relative z-10">
                  <div className="flex flex-col lg:flex-row gap-16 items-start">
                     
                     {/* Left: Images */}
                     <div className="w-full lg:w-1/2 flex gap-4">
                        <div className="flex flex-col gap-4">
                           {images.map((img: string, idx: number) => (
                              <button key={idx} className={\`w-3 h-10 \${idx === 0 ? 'bg-slate-900' : 'bg-slate-200'} transition-colors\`}></button>
                           ))}
                        </div>
                        <div className="relative flex-1 aspect-[3/4] bg-[#f8f9fa]">
                           <img src={images[0]} className="w-full h-full object-cover" />
                           {/* Tags */}
                           <div className="absolute top-4 -left-3 flex flex-col gap-2">
                              <span className="bg-rose-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">SALE</span>
                              <span className="bg-emerald-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">NEW</span>
                           </div>
                        </div>
                     </div>

                     {/* Right: Details */}
                     <div className="w-full lg:w-1/2 pt-4">
                        <div className="flex items-center justify-between mb-4">
                           <h1 className="text-4xl lg:text-5xl font-sans text-slate-900 leading-tight" style={{ fontWeight: 400 }}>{product.name}</h1>
                           <button className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                           </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                           <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                           </div>
                           <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wide">3 customers left feedback</span>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
                           {product.description || "Stylish shirt from the Fashionee collection. Model made of high-quality fabric, pleasant to the touch. A perfect choice for every day."}
                        </p>

                        <div className="flex gap-8 mb-8 text-[11px] uppercase tracking-wider font-bold">
                           <div className="flex gap-2"><span className="text-slate-400">Status:</span> <span className="text-emerald-400">IN STOCK</span></div>
                           <div className="flex gap-2"><span className="text-slate-400">Article:</span> <span className="text-slate-800">000{product.id}DZ1</span></div>
                        </div>

                        <div className="flex items-end gap-4 mb-10">
                           <span className="text-4xl font-black text-slate-900">$\\{parseFloat(product.price).toFixed(2)}</span>
                           <span className="text-lg text-slate-400 line-through mb-1">$\\{(parseFloat(product.price) * 1.4).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-6 mb-12">
                           {sizes.map((sz, i) => (
                              <button key={sz} onClick={() => setSelectedSize(sz)} className={\`w-12 h-12 flex items-center justify-center text-[11px] font-bold transition-all \${selectedSize === sz || (i===1 && !selectedSize) ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}\`}>
                                 {sz}
                              </button>
                           ))}
                        </div>

                        <div className="flex gap-4 mb-16">
                           <div className="flex items-center bg-slate-50 h-14 px-6 gap-6">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-400 hover:text-slate-900">-</button>
                              <span className="text-sm font-bold text-slate-900">{quantity}</span>
                              <button onClick={() => setQuantity(quantity + 1)} className="text-slate-400 hover:text-slate-900">+</button>
                           </div>
                           <button onClick={() => setIsCartOpen(true)} className="flex-1 bg-slate-900 text-white h-14 font-bold text-sm tracking-wider hover:bg-black transition-colors">
                              Add To Cart
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Tabs */}
                  <div className="mt-24 max-w-4xl">
                     <div className="flex gap-8 border-b border-slate-200 mb-8">
                        <button onClick={() => setActivePDPTab('description')} className={\`pb-4 text-sm tracking-wider font-bold transition-all \${activePDPTab === 'description' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}\`}>Description</button>
                        <button onClick={() => setActivePDPTab('reviews')} className={\`pb-4 text-sm tracking-wider font-bold transition-all \${activePDPTab === 'reviews' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}\`}>Reviews</button>
                     </div>
                     <div className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                        {activePDPTab === 'description' ? (
                           <p>Detailed description about the {product.name}. This item is crafted from premium materials, ensuring both comfort and durability. Perfect for any occasion, its versatile design makes it a wardrobe essential.</p>
                        ) : (
                           <div className="space-y-6">
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                 <div>
                                    <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">Jane Doe</h5>
                                    <div className="flex text-amber-400 mb-2 w-3 h-3">{'★'.repeat(5)}</div>
                                    <p>Absolutely love this! Fits perfectly and looks great.</p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         );
      })()}
`;

const insertionPoint = `      {/* Footer */}`;
if (content.includes(insertionPoint) && !content.includes("activePDPTab === 'description'")) {
    content = content.replace(insertionPoint, pdpUI + '\\n      ' + insertionPoint);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
    console.log('Mazia PDP injected successfully!');
} else {
    console.log('Failed to inject or already injected.');
}
