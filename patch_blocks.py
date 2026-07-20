import sys

with open('src/pages/StoreBuilder.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
state_old = "const [homeCollectionsTitle, setHomeCollectionsTitle] = useState(config.homeCollectionsTitle || 'Trending Now');\n  const [allCollectionsTitle, setAllCollectionsTitle] = useState(config.allCollectionsTitle || 'All Products');"
state_new = "const [homeCollectionsTitle, setHomeCollectionsTitle] = useState(config.homeCollectionsTitle || 'Trending Now');\n  const [allCollectionsTitle, setAllCollectionsTitle] = useState(config.allCollectionsTitle || 'All Products');\n  const [homeBlocks, setHomeBlocks] = useState(config.homeBlocks || ['hero', 'collections', 'products']);\n  const [sliderImages, setSliderImages] = useState(config.sliderImages || []);\n  const [activeSidebarSection, setActiveSidebarSection] = useState('hero');"

if state_old in content:
    content = content.replace(state_old, state_new)
else:
    content = content.replace(state_old.replace('\n', '\r\n'), state_new.replace('\n', '\r\n'))

# 2. handleSave
save_old = "       buyMode,\n       footerSettings"
save_new = "       buyMode,\n       homeBlocks,\n       sliderImages,\n       footerSettings"

if save_old in content:
    content = content.replace(save_old, save_new)
else:
    content = content.replace(save_old.replace('\n', '\r\n'), save_new.replace('\n', '\r\n'))

# 3. Sidebar UI Grid
grid_old = '''<div className="grid grid-cols-2 gap-2">
                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                         <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Type className="w-4 h-4" /></div>
                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'عنوان' : 'Titre'}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                         <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><ImageIcon className="w-4 h-4" /></div>
                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'صورة' : 'Image'}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                         <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MousePointerClick className="w-4 h-4" /></div>
                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'زر' : 'Bouton'}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                         <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><LayoutGrid className="w-4 h-4" /></div>
                         <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'منتجات' : 'Produits'}</span>
                      </div>
                   </div>'''

grid_new = '''<div className="grid grid-cols-2 gap-2">
                       <div onClick={() => { setActiveSidebarSection('hero'); if (!homeBlocks.includes('hero')) setHomeBlocks([...homeBlocks, 'hero']); else setHomeBlocks(homeBlocks.filter(b => b !== 'hero')); }} className={g-white border  rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative}>
                          {homeBlocks.includes('hero') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-indigo-500" /></div>}
                          <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Type className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'القسم الرئيسي' : 'Bannière'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('slider'); if (!homeBlocks.includes('slider')) setHomeBlocks([...homeBlocks, 'slider']); else setHomeBlocks(homeBlocks.filter(b => b !== 'slider')); }} className={g-white border  rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative}>
                          {homeBlocks.includes('slider') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-emerald-500" /></div>}
                          <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><ImageIcon className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'معرض صور' : 'Slider'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('collections'); if (!homeBlocks.includes('collections')) setHomeBlocks([...homeBlocks, 'collections']); else setHomeBlocks(homeBlocks.filter(b => b !== 'collections')); }} className={g-white border  rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative}>
                          {homeBlocks.includes('collections') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-amber-500" /></div>}
                          <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MousePointerClick className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'تصنيفات' : 'Collections'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('products'); if (!homeBlocks.includes('products')) setHomeBlocks([...homeBlocks, 'products']); else setHomeBlocks(homeBlocks.filter(b => b !== 'products')); }} className={g-white border  rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative}>
                          {homeBlocks.includes('products') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-rose-500" /></div>}
                          <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><LayoutGrid className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'منتجات' : 'Produits'}</span>
                       </div>
                    </div>'''

if grid_old in content:
    content = content.replace(grid_old, grid_new)
else:
    content = content.replace(grid_old.replace('\n', '\r\n'), grid_new)

import re
# 4. Settings Panel
settings_new = '''                    {activeSidebarSection === 'hero' && (
                       <>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'النص الرئيسي' : 'Texte Principal'}</label>
                          <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'النص الفرعي' : 'Sous-titre'}</label>
                          <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'نص الزر' : 'Texte du Bouton'}</label>
                          <input type="text" value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'صورة الغلاف' : 'Image de Couverture'}</label>
                          <label className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group relative overflow-hidden">
                             {heroImage ? (
                                <img src={heroImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                             ) : null}
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-[10px] font-bold text-slate-500">{storeIsAr ? 'تغيير الصورة' : 'Changer l\\'image'}</span>
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
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'صور السلايدر' : 'Images du Slider'}</label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                             {sliderImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded border border-slate-200 overflow-hidden group">
                                   <img src={img} className="w-full h-full object-cover" />
                                   <button onClick={() => setSliderImages(sliderImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"><X className="w-3 h-3"/></button>
                                </div>
                             ))}
                          </div>
                          <label className="w-full h-12 border-2 border-dashed border-indigo-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 text-indigo-500 transition-colors">
                             <span className="text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3"/> {storeIsAr ? 'إضافة صورة' : 'Ajouter une image'}</span>
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) setSliderImages([...sliderImages, await readFileAsBase64(file)]);
                             }} />
                          </label>
                       </div>
                    )}

                    {activeSidebarSection === 'collections' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'عنوان التصنيفات' : 'Titre des Collections'}</label>
                          <input type="text" value={allCollectionsTitle} onChange={(e) => setAllCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    {activeSidebarSection === 'products' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'عنوان المنتجات المميزة' : 'Titre des Produits'}</label>
                          <input type="text" value={homeCollectionsTitle} onChange={(e) => setHomeCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-100">
                       <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'اللون الرئيسي للمتجر' : 'Couleur Principale du Thème'}</label>
                       <div className="flex items-center gap-2">
                          <label className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer flex-shrink-0 shadow-inner" style={{ backgroundColor: primaryColor }}>
                             <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                          </label>
                          <input type="text" value={primaryColor} readOnly className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1" />
                       </div>
                    </div>'''

pattern = r'<div>\s*<label className="text-\[10px\] font-bold text-slate-400 uppercase mb-1 block">\{storeIsAr \? \'النص الرئيسي\' : \'Texte Principal\'\}</label>[\s\S]*?<div className="pt-4 mt-4 border-t border-slate-100">[\s\S]*?</div>\s*</div>'
content = re.sub(pattern, settings_new, content)

# Fix imports
if "CheckCircle" not in content:
    content = content.replace("import { Store, Globe", "import { Store, Globe, CheckCircle, Plus")

with open('src/pages/StoreBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully")
