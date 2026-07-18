const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add to THEMES
content = content.replace(
  "  { id: 'kids', name: 'Playful Kids', layout: 'playful', defaultColor: '#0ea5e9', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' }",
  "  { id: 'kids', name: 'Playful Kids', layout: 'playful', defaultColor: '#0ea5e9', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },\n  { id: 'clement', name: 'Clement Design', layout: 'clement', defaultColor: '#1e293b', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=800&auto=format&fit=crop' }"
);

// 2. Add LayoutClement definition right before Layout = () => {
const layoutClementDef = `
  const LayoutClement = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
    <div className={\`w-full min-h-full bg-[#e8e2d7] text-[#1a1a1a] \${fontFamily} flex flex-col\`}>
      <div className={\`px-8 py-6 flex justify-between items-center \${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}\`}>
         <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a]" style={{ color: primaryColor }} />
         <div className={\`flex gap-8 text-sm font-medium text-[#4a4a4a] \${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}\`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer hover:text-black transition-colors" style={{ color: page === p.id ? primaryColor : undefined }}>{p.title}</span>
            ))}
         </div>
         <div className="flex gap-4 items-center">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer"><img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-4 h-3 rounded-sm object-cover" /> FR</span>
            <Search className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
            <Users className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
            <button className="relative hover:opacity-70 transition-opacity" onClick={() => alert('Panier cliqué !')}>
               <ShoppingBag className="w-5 h-5" />
               {cartCount > 0 && <span className="absolute -bottom-1 -right-1 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center bg-black">{cartCount}</span>}
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {page === 'home' && (
          <>
            <div className="w-full bg-[#e8e2d7]">
               <HeroBackgroundEditor className={\`w-full h-[\${isModal ? '600px' : '400px'}] bg-cover bg-right-top relative flex items-center\`} style={{ backgroundImage: \`url(\${heroImage})\` }}>
                  <div className="max-w-2xl px-12 md:px-24">
                     <EditableText as="h1" text={heroTitle} onTextChange={setHeroTitle} isLiveStore={isLiveStore} className="text-5xl md:text-7xl font-serif italic tracking-wide text-[#2c2c2c] mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }} />
                  </div>
               </HeroBackgroundEditor>
            </div>

            <div className="py-16 px-8 max-w-7xl mx-auto bg-white">
               <div className="flex flex-col items-center mb-12">
                  <EditableText as="h2" text={homeCollectionsTitle} onTextChange={setHomeCollectionsTitle} isLiveStore={isLiveStore} className="text-2xl font-black uppercase text-[#1a1a1a] mb-8 tracking-wider" />
                  
                  {/* Categories */}
                  <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-[#4a4a4a]">
                     {categories.map((c: string) => (
                        <button key={c} onClick={() => setActiveCategory(c)} className={\`pb-1 border-b-2 transition-colors \${activeCategory === c ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent hover:border-slate-300'}\`}>
                           {c === 'All' ? allCollectionsTitle : c}
                        </button>
                     ))}
                  </div>
               </div>

               <div className={\`grid \${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-6\`}>
                  {filteredProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] bg-[#f5f1e9] mb-4 relative overflow-hidden flex items-center justify-center">
                           <img src={getCoverImage(p)} alt={p.name} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                           <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors" onClick={(e) => { e.stopPropagation(); alert('Ajouté aux favoris'); }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                           </button>
                        </div>
                        <div className="text-left">
                           <h3 className="text-[13px] font-black uppercase tracking-widest text-[#1a1a1a] mb-1">{p.name}</h3>
                           <p className="text-[11px] text-[#666] mb-2">{p.category}</p>
                           <p className="text-[13px] font-bold text-[#1a1a1a]">à partir de {p.price} MAD</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}

        {page === 'product' && (
           <div className="p-8 max-w-6xl mx-auto bg-white min-h-[600px] my-8 flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2 flex gap-4">
                 <div className="w-full aspect-[3/4] bg-[#f5f1e9] rounded-sm overflow-hidden flex items-center justify-center">
                    <img src={getCoverImage(storeProducts.find(p => p.id === activeProductId))} className="w-full h-full object-cover mix-blend-multiply" alt="Product" />
                 </div>
              </div>
              <div className="w-full md:w-1/2 pt-4">
                 <h2 className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mb-2">{storeProducts.find(p => p.id === activeProductId)?.name}</h2>
                 <p className="text-xl font-bold text-[#444] mb-8">{storeProducts.find(p => p.id === activeProductId)?.price} MAD</p>
                 
                 <div className="space-y-6 mb-8">
                    {storeProducts.find(p => p.id === activeProductId)?.colors?.length > 0 && (
                       <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">Couleur</span>
                          <div className="flex gap-2">
                             {storeProducts.find(p => p.id === activeProductId)?.colors.map((c: string) => (
                                <button key={c} onClick={() => setSelectedColor(c)} className={\`w-8 h-8 rounded-full border-2 transition-transform \${selectedColor === c ? 'border-[#1a1a1a] scale-110' : 'border-transparent hover:scale-105 shadow-sm'}\`} style={{ backgroundColor: c }} />
                             ))}
                          </div>
                       </div>
                    )}
                    {storeProducts.find(p => p.id === activeProductId)?.sizes?.length > 0 && (
                       <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">Taille</span>
                          <div className="flex flex-wrap gap-2">
                             {storeProducts.find(p => p.id === activeProductId)?.sizes.map((s: string) => (
                                <button key={s} onClick={() => setSelectedSize(s)} className={\`min-w-[40px] h-10 px-3 text-[11px] font-bold uppercase tracking-widest transition-colors border \${selectedSize === s ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#444] border-[#ddd] hover:border-[#1a1a1a]'}\`}>
                                   {s}
                                </button>
                             ))}
                          </div>
                       </div>
                    )}
                    
                    <div>
                       <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">Quantité</span>
                       <div className="flex items-center gap-4">
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-[#ddd] flex items-center justify-center text-lg hover:border-[#1a1a1a] transition-colors">-</button>
                          <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                          <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-[#ddd] flex items-center justify-center text-lg hover:border-[#1a1a1a] transition-colors">+</button>
                       </div>
                    </div>
                 </div>

                 {(buyMode === 'both' || buyMode === 'cart') && (
                    <button onClick={handleAddToCart} className="w-full h-14 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mb-4">Ajouter au panier</button>
                 )}
                 {(buyMode === 'both' || buyMode === 'direct') && (
                    <button onClick={() => setPage('checkout')} className="w-full h-14 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors">Acheter Maintenant</button>
                 )}
              </div>
           </div>
        )}

        {page === 'checkout' && (
           <div className="p-8 max-w-2xl mx-auto my-8 bg-white border border-[#eee] rounded-sm">
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a] mb-8 text-center">Achat Express</h2>
              <div className="space-y-4">
                 <input type="text" placeholder="Nom Complet" className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <input type="text" placeholder="Numéro de Téléphone" className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <input type="text" placeholder="Ville" className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <input type="text" placeholder="Adresse de Livraison" className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <button onClick={() => setPage('success')} className="w-full py-4 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mt-8">Confirmer la Commande</button>
              </div>
           </div>
        )}

        {page === 'success' && (
           <div className="p-16 max-w-2xl mx-auto my-8 bg-white border border-[#eee] text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
              <h2 className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mb-4">Commande Confirmée</h2>
              <p className="text-[#666] mb-8">Merci de votre confiance. Nous vous contacterons bientôt.</p>
              <button onClick={() => setPage('home')} className="px-8 py-3 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors">Retour à l'accueil</button>
           </div>
        )}

      </div>
      <ThemeFooter bgColor="#1a1a1a" textColor="#fff" setPage={setPage} />
    </div>
  );
  };
`;

content = content.replace("  const Layout = () => {", layoutClementDef + "\n  const Layout = () => {");
content = content.replace("if (activeTheme.layout === 'playful') return <LayoutPlayful {...props} />;", "if (activeTheme.layout === 'playful') return <LayoutPlayful {...props} />;\n       if (activeTheme.layout === 'clement') return <LayoutClement {...props} />;");

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('LayoutClement Added successfully!');
