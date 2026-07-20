const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Add state variables
const targetState = "const [homeCollectionsTitle, setHomeCollectionsTitle] = useState(config.homeCollectionsTitle || 'Trending Now');";
if (content.includes(targetState) && !content.includes("const [homeBlocks, setHomeBlocks]")) {
    content = content.replace(targetState, targetState + "\n  const [homeBlocks, setHomeBlocks] = useState<string[]>(config.homeBlocks || ['hero', 'collections', 'products']);\n  const [sliderImages, setSliderImages] = useState<string[]>(config.sliderImages || []);\n  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('hero');");
}

// 2. Update config saving
const targetSave = "        homeCollectionsTitle,\n        allCollectionsTitle,";
if (content.includes(targetSave)) {
    content = content.replace(targetSave, targetSave + "\n        homeBlocks,\n        sliderImages,");
}

// 3. Update Sidebar Elements
const targetSidebarGrid = \<div className="grid grid-cols-2 gap-2">\n                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">\n                         <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Type className="w-4 h-4" /></div>\n                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '?????' : 'Titre'}</span>\n                      </div>\n                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">\n                         <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><ImageIcon className="w-4 h-4" /></div>\n                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '????' : 'Image'}</span>\n                      </div>\n                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">\n                         <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MousePointerClick className="w-4 h-4" /></div>\n                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '??' : 'Bouton'}</span>\n                      </div>\n                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">\n                         <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><LayoutGrid className="w-4 h-4" /></div>\n                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '??????' : 'Produits'}</span>\n                      </div>\n                   </div>\;

const newSidebarGrid = \
                    <div className="grid grid-cols-2 gap-2">
                       <div onClick={() => { setActiveSidebarSection('hero'); if (!homeBlocks.includes('hero')) setHomeBlocks([...homeBlocks, 'hero']); }} className={\\\g-white border \ rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative\\\}>
                          {homeBlocks.includes('hero') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-indigo-500" /></div>}
                          <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Type className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '????? ???????' : 'Bannière (Hero)'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('slider'); if (!homeBlocks.includes('slider')) setHomeBlocks([...homeBlocks, 'slider']); else setHomeBlocks(homeBlocks.filter(b => b !== 'slider')); }} className={\\\g-white border \ rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative\\\}>
                          {homeBlocks.includes('slider') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-emerald-500" /></div>}
                          <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><ImageIcon className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '???? ???' : 'Slider'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('collections'); if (!homeBlocks.includes('collections')) setHomeBlocks([...homeBlocks, 'collections']); else setHomeBlocks(homeBlocks.filter(b => b !== 'collections')); }} className={\\\g-white border \ rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative\\\}>
                          {homeBlocks.includes('collections') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-amber-500" /></div>}
                          <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MousePointerClick className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '???????' : 'Collections'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('products'); if (!homeBlocks.includes('products')) setHomeBlocks([...homeBlocks, 'products']); else setHomeBlocks(homeBlocks.filter(b => b !== 'products')); }} className={\\\g-white border \ rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative\\\}>
                          {homeBlocks.includes('products') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-rose-500" /></div>}
                          <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><LayoutGrid className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? '??????' : 'Produits'}</span>
                       </div>
                    </div>
\;

// Actually the formatting in the file uses spaces so I should use simple substring or regex
content = content.replace(/<div className="grid grid-cols-2 gap-2">[\s\S]*?(?=<\/div>\s*<\/div>\s*<div className="space-y-4">)/, newSidebarGrid);

// 4. Update Parametres Section
const targetParams = \<div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '???? ???????' : 'Texte Principal'}</label>
                      <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                   </div>
                   
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '????? ???????' : 'Couleur Principale'}</label>
                      <div className="flex items-center gap-2">
                         <label className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                         </label>
                         <input type="text" value={primaryColor} readOnly className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1" />
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '???? ??????' : 'Image de Couverture'}</label>
                      <label className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group relative overflow-hidden">
                         {heroImage ? (
                            <img src={heroImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                         ) : null}
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[10px] font-bold text-slate-500">{storeIsAr ? '????? ??????' : 'Changer l\\'image'}</span>
                         </div>
                         <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) setHeroImage(await readFileAsBase64(file));
                         }} />
                      </label>
                   </div>\;

const newParams = \                    {activeSidebarSection === 'hero' && (
                       <>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '???? ???????' : 'Texte Principal'}</label>
                          <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '???? ??????' : 'Sous-titre'}</label>
                          <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '?? ????' : 'Texte du Bouton'}</label>
                          <input type="text" value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '???? ??????' : 'Image de Couverture'}</label>
                          <label className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group relative overflow-hidden">
                             {heroImage ? (
                                <img src={heroImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                             ) : null}
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-[10px] font-bold text-slate-500">{storeIsAr ? '????? ??????' : 'Changer l\\'image'}</span>
                             </div>
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) setHeroImage(await readFileAsBase64(file));
                             }} />
                          </label>
                       </div>
                       </>
                    )}

                    {activeSidebarSection === 'slider' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '??? ????????' : 'Images du Slider'}</label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                             {sliderImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded border border-slate-200 overflow-hidden">
                                   <img src={img} className="w-full h-full object-cover" />
                                   <button onClick={() => setSliderImages(sliderImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"><X className="w-3 h-3"/></button>
                                </div>
                             ))}
                          </div>
                          <label className="w-full h-12 border-2 border-dashed border-indigo-200 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 text-indigo-500">
                             <span className="text-xs font-bold">+ {storeIsAr ? '????? ????' : 'Ajouter une image'}</span>
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) setSliderImages([...sliderImages, await readFileAsBase64(file)]);
                             }} />
                          </label>
                       </div>
                    )}

                    {activeSidebarSection === 'collections' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '????? ?????????' : 'Titre des Collections'}</label>
                          <input type="text" value={allCollectionsTitle} onChange={(e) => setAllCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    {activeSidebarSection === 'products' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '????? ???????? ???????' : 'Titre des Produits'}</label>
                          <input type="text" value={homeCollectionsTitle} onChange={(e) => setHomeCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-100">
                       <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? '????? ???????' : 'Couleur Principale'}</label>
                       <div className="flex items-center gap-2">
                          <label className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                             <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                          </label>
                          <input type="text" value={primaryColor} readOnly className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1" />
                       </div>
                    </div>\;

// We can replace via substring
let parts = content.split('<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{storeIsAr ? \'??????? ????? ??????\' : \'Paramètres de la Section\'}</h4>');
if(parts.length > 1) {
    let subParts = parts[1].split('</div>\n             </div>\n\n             <div className="p-4 border-t border-slate-100 bg-slate-50">');
    if(subParts.length > 1) {
       content = parts[0] + '<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{storeIsAr ? \'??????? ????? ??????\' : \'Paramètres de la Section\'}</h4>\n' + newParams + '\n                 </div>\n             </div>\n\n             <div className="p-4 border-t border-slate-100 bg-slate-50">' + subParts[1];
    }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Sidebar patch applied');
