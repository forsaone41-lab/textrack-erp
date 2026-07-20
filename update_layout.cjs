const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const heroCenterOld = `<HeroBackgroundEditor className={\`h-[\${isModal ? '600px' : '400px'}] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center relative\`} style={{ backgroundImage: \`url(\${heroImage})\` }}>
               <div className="absolute inset-0 bg-black/60"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <EditableText as="h1" text={heroTitle} onTextChange={setHeroTitle} isLiveStore={isLiveStore} className={\`\${isModal ? 'text-7xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter mb-4\`} />
                  <EditableText as="p" text={heroSubtitle} onTextChange={setHeroSubtitle} isLiveStore={isLiveStore} className="text-white/90 text-lg mb-8 max-w-md" />
                  <button onClick={() => setPage('collections')} className="px-8 py-3 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded" style={{ backgroundColor: primaryColor }}>
                     <EditableText text={heroButtonText} onTextChange={setHeroButtonText} isLiveStore={isLiveStore} />
                  </button>
               </div>
            </HeroBackgroundEditor>
            <div className={\`\${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full\`}>
               <h3 className="text-2xl font-black uppercase text-center mb-10">Trending Now</h3>
               <div className={\`grid gap-8 \${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}\`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>}
                           <div className={\`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity \${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
                              <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-slate-500 text-sm mt-1">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>`;

const heroCenterNew = `<div className="flex flex-col gap-0 w-full">
             {homeBlocks.map((block: string) => {
                if (block === 'hero') return (
                    <HeroBackgroundEditor key="hero" className={\`h-[\${isModal ? '600px' : '400px'}] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center relative\`} style={{ backgroundImage: \`url(\${heroImage})\` }}>
                       <div className="absolute inset-0 bg-black/60"></div>
                       <div className="relative z-10 flex flex-col items-center">
                          <EditableText as="h1" text={heroTitle} onTextChange={setHeroTitle} isLiveStore={isLiveStore} className={\`\${isModal ? 'text-7xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter mb-4\`} />
                          <EditableText as="p" text={heroSubtitle} onTextChange={setHeroSubtitle} isLiveStore={isLiveStore} className="text-white/90 text-lg mb-8 max-w-md" />
                          <button onClick={() => setPage('collections')} className="px-8 py-3 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded" style={{ backgroundColor: primaryColor }}>
                             <EditableText text={heroButtonText} onTextChange={setHeroButtonText} isLiveStore={isLiveStore} />
                          </button>
                       </div>
                    </HeroBackgroundEditor>
                );
                
                if (block === 'slider' && sliderImages.length > 0) return (
                    <div key="slider" className="w-full relative overflow-hidden flex bg-slate-900" style={{ height: isModal ? '500px' : '300px' }}>
                       <div className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {sliderImages.map((img:string, idx:number) => (
                             <div key={idx} className="min-w-full h-full snap-center relative shrink-0">
                                <img src={img} className="w-full h-full object-cover" />
                             </div>
                          ))}
                       </div>
                       {sliderImages.length > 1 && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                             {sliderImages.map((_:any, idx:number) => (
                                <div key={idx} className="w-2 h-2 rounded-full bg-white shadow-lg" />
                             ))}
                          </div>
                       )}
                    </div>
                );

                if (block === 'products') return (
                    <div key="products" className={\`\${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full\`}>
                       <h3 className="text-2xl font-black uppercase text-center mb-10">{homeCollectionsTitle}</h3>
                       <div className={\`grid gap-8 \${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}\`}>
                          {storeProducts.slice(0, 8).map((p: any) => (
                             <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                                <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                                   {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>}
                                   <div className={\`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity \${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
                                      <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                                   </div>
                                </div>
                                <h4 className="font-bold text-sm">{p.name}</h4>
                                <p className="text-slate-500 text-sm mt-1">{p.price} MAD</p>
                             </div>
                          ))}
                       </div>
                    </div>
                );
                
                if (block === 'collections' && categories.length > 1) return (
                    <div key="collections" className={\`\${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full bg-slate-50\`}>
                       <h3 className="text-2xl font-black uppercase text-center mb-10">{allCollectionsTitle}</h3>
                       <div className={\`grid gap-4 \${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : (isModal ? 'grid-cols-4' : 'grid-cols-3')}\`}>
                          {categories.filter((c:string) => c !== 'All').map((cat: string, idx: number) => (
                             <div key={idx} onClick={() => { setActiveCategory(cat); setPage('collections'); }} className="cursor-pointer group aspect-square relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-end p-6">
                                   <span className="text-white font-bold text-lg">{cat}</span>
                                </div>
                                <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors z-0"></div>
                                <img src={storeProducts.find((p:any)=>p.category===cat)?.image || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             </div>
                          ))}
                       </div>
                    </div>
                );
                
                return null;
             })}
          </div>`;

const fixedOld = heroCenterOld.replace(/\n/g, '\r\n');
if (content.includes(heroCenterOld)) {
   content = content.replace(heroCenterOld, heroCenterNew);
} else if (content.includes(fixedOld)) {
   content = content.replace(fixedOld, heroCenterNew);
} else {
   console.log("Could not find LayoutHeroCenter block!");
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Layout updated.');
