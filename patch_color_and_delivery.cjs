const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add color states
if (!content.includes('const [headerBgColor')) {
    content = content.replace(
        "const [fontFamily, setFontFamily] = useState(config.fontFamily || THEMES[0].defaultFont);",
        "const [fontFamily, setFontFamily] = useState(config.fontFamily || THEMES[0].defaultFont);\n  const [headerBgColor, setHeaderBgColor] = useState(config.headerBgColor || '#e8e2d7');\n  const [heroTextColor, setHeroTextColor] = useState(config.heroTextColor || '#2c2c2c');"
    );
}

// 2. Add color pickers to Design tab
const designColorPickers = `
                     <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Couleurs Personnalisées</h4>
                        <div className="space-y-3">
                           <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">{storeIsAr ? 'خلفية القائمة' : 'Fond En-tête'}</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-xs font-mono text-slate-400 uppercase">{headerBgColor}</span>
                                 <input type="color" value={headerBgColor} onChange={e => setHeaderBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                              </div>
                           </div>
                           <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">{storeIsAr ? 'لون العنوان' : 'Couleur Titre'}</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-xs font-mono text-slate-400 uppercase">{heroTextColor}</span>
                                 <input type="color" value={heroTextColor} onChange={e => setHeroTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Typographie</h4>
`;

if (!content.includes('Fond En-tête')) {
    content = content.replace(
        /<div className="mb-6">\s*<h4 className="text-\[10px\] font-bold text-slate-400 uppercase tracking-wider mb-3">Typographie<\/h4>/,
        designColorPickers
    );
}

// 3. Apply colors to LayoutClement (and generic where possible)
// Replace bg-[#e8e2d7] with style={{ backgroundColor: headerBgColor }} in LayoutClement
content = content.replace(/bg-\[#e8e2d7\]/g, 'bg-[#e8e2d7]" style={{ backgroundColor: headerBgColor }} className="');
// Fix the class replacement properly
content = content.replace(/className="w-full min-h-full bg-\[#e8e2d7\]" style=\{\{ backgroundColor: headerBgColor \}\} className=" text-\[#1a1a1a\]/g, 'className={`w-full min-h-full text-[#1a1a1a] flex flex-col ${fontFamily}`} style={{ backgroundColor: headerBgColor }}');
content = content.replace(/className="w-full bg-\[#e8e2d7\]" style=\{\{ backgroundColor: headerBgColor \}\} className=""/g, 'className="w-full" style={{ backgroundColor: headerBgColor }}');

// Apply text color to heroTitle in LayoutClement
content = content.replace(/text-\[#2c2c2c\] mb-6 leading-tight" style=\{\{ fontFamily: 'Georgia, serif' \}\}/g, 'mb-6 leading-tight" style={{ fontFamily: "Georgia, serif", color: heroTextColor }}');

// For other themes, apply heroTextColor to heroTitle EditableText generally if possible, or just leave it for Clement.
content = content.replace(/className="text-5xl md:text-7xl font-serif italic tracking-wide text-\[#2c2c2c\] mb-6 leading-tight"/g, 'className="text-5xl md:text-7xl font-serif italic tracking-wide mb-6 leading-tight" style={{ color: heroTextColor, fontFamily: "Georgia, serif" }}');

// 4. Update Livraison tab
// Add delivery state
if (!content.includes('const [deliveryCompanies')) {
    content = content.replace(
        "const [storeId, setStoreId] = useState('demo_store');",
        "const [storeId, setStoreId] = useState('demo_store');\n  const [deliveryCompanies, setDeliveryCompanies] = useState([\n    { id: '1', name: 'Amana', type: 'Standard • National', active: true, initial: 'AM' },\n    { id: '2', name: 'Ghazal', type: 'Express • National', active: false, initial: 'GR' }\n  ]);"
    );
}

// Replace the hardcoded Livraison HTML with dynamic one
const newLivraisonTab = `
              {activeTab === 'delivery' && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">{storeIsAr ? 'التوصيل' : 'Livraison'}</h3>
                          <p className="text-xs text-slate-500 font-bold mt-1">{storeIsAr ? 'إدارة شركات التوصيل الشريكة' : 'Gérez vos sociétés de livraison partenaires'}</p>
                       </div>
                       <button onClick={() => {
                          const name = prompt(storeIsAr ? "اسم شركة التوصيل:" : "Nom de la société :");
                          if(name) {
                             setDeliveryCompanies([...deliveryCompanies, { id: Date.now().toString(), name, type: 'Standard', active: true, initial: name.substring(0,2).toUpperCase() }]);
                          }
                       }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">
                          <Plus className="w-4 h-4" />
                          {storeIsAr ? 'إضافة' : 'Ajouter'}
                       </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {deliveryCompanies.map(company => (
                          <div key={company.id} className={\`p-4 border-2 \${company.active ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white opacity-60'} rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-indigo-50 transition-colors\`}
                               onClick={() => {
                                  setDeliveryCompanies(deliveryCompanies.map(c => c.id === company.id ? {...c, active: !c.active} : c));
                               }}>
                             <div className="flex items-center gap-3">
                                <div className={\`w-10 h-10 \${company.active ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'} rounded-xl flex items-center justify-center shadow-sm font-black text-xs\`}>{company.initial}</div>
                                <div>
                                   <h4 className={\`font-black \${company.active ? 'text-slate-800' : 'text-slate-600'}\`}>{company.name}</h4>
                                   <p className={\`text-[10px] font-bold \${company.active ? 'text-slate-500' : 'text-slate-400'}\`}>{company.type}</p>
                                </div>
                             </div>
                             <span className={\`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider \${company.active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}\`}>{company.active ? (storeIsAr ? 'نشط' : 'Actif') : (storeIsAr ? 'غير نشط' : 'Inactif')}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
`;

content = content.replace(
    /\{\/\* DELIVERY TAB \(NEW!\) \*\/\}\s*\{activeTab === 'delivery' && \([\s\S]*?\}\s*\)\}/,
    `{/* DELIVERY TAB (NEW!) */}\n` + newLivraisonTab.trim()
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Patched layout!');
