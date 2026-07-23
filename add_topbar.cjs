const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add state variables
const stateRegex = /const \[storeName, setStoreName\] = useState\(config.storeName \|\| ''\);/;
const topBarStates = `  const [showTopBar, setShowTopBar] = useState(config.showTopBar ?? false);
  const [topBarText, setTopBarText] = useState(config.topBarText || "LIVRAISON GRATUITE DÈS 799 DH D'ACHATS");
  const [topBarBgColor, setTopBarBgColor] = useState(config.topBarBgColor || '#f1f5f9');
  const [topBarTextColor, setTopBarTextColor] = useState(config.topBarTextColor || '#0f172a');
  const [topBarPosition, setTopBarPosition] = useState(config.topBarPosition || 'top');
  const [topBarAnimation, setTopBarAnimation] = useState(config.topBarAnimation || 'static');
`;
if (!content.includes('showTopBar')) {
    content = content.replace(stateRegex, `${topBarStates}\n  const [storeName, setStoreName] = useState(config.storeName || '');`);
}

// 2. Add to handleSave payload
const payloadRegex = /storeProducts,/;
if (content.match(payloadRegex) && !content.includes('showTopBar: showTopBar,')) {
    content = content.replace(payloadRegex, `showTopBar, topBarText, topBarBgColor, topBarTextColor, topBarPosition, topBarAnimation,\n        storeProducts,`);
}

// 3. Add to load config
const loadRegex = /if \(conf\.storeName\) setStoreName\(conf\.storeName\);/;
if (content.match(loadRegex) && !content.includes('setShowTopBar(conf.showTopBar)')) {
    content = content.replace(loadRegex, `if (conf.storeName) setStoreName(conf.storeName);
              if (conf.showTopBar !== undefined) setShowTopBar(conf.showTopBar);
              if (conf.topBarText) setTopBarText(conf.topBarText);
              if (conf.topBarBgColor) setTopBarBgColor(conf.topBarBgColor);
              if (conf.topBarTextColor) setTopBarTextColor(conf.topBarTextColor);
              if (conf.topBarPosition) setTopBarPosition(conf.topBarPosition);
              if (conf.topBarAnimation) setTopBarAnimation(conf.topBarAnimation);`);
}

// 4. Add UI Settings inside Header block
const settingsRegex = /<h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">\{isAr \? 'أيقونات رأس المتجر' : "Icônes de l'en-tête"\}<\/h4>/;
const topBarSettings = `
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-4">
                         <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'شريط الإعلانات العُلوي' : "Barre d'annonce (Top Bar)"}</h4>
                            <button onClick={() => setShowTopBar((v: boolean) => !v)} className={\`relative w-11 h-6 rounded-full transition-colors shrink-0 \${showTopBar ? 'bg-indigo-600' : 'bg-slate-300'}\`}>
                               <span className={\`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform \${showTopBar ? 'translate-x-5' : ''}\`} />
                            </button>
                         </div>
                         {showTopBar && (
                            <div className="space-y-3 pt-2 border-t border-slate-200">
                               <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص' : 'Texte'}</label>
                                  <input type="text" value={topBarText} onChange={e => setTopBarText(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none" />
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                  <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'الخلفية' : 'Fond'}</label>
                                     <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
                                        <input type="color" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
                                        <input type="text" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="w-full text-xs px-2 outline-none" />
                                     </div>
                                  </div>
                                  <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص' : 'Texte'}</label>
                                     <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
                                        <input type="color" value={topBarTextColor} onChange={e => setTopBarTextColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
                                        <input type="text" value={topBarTextColor} onChange={e => setTopBarTextColor(e.target.value)} className="w-full text-xs px-2 outline-none" />
                                     </div>
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                  <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'المكان' : 'Position'}</label>
                                     <select value={topBarPosition} onChange={e => setTopBarPosition(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white">
                                        <option value="top">{isAr ? 'أعلى' : 'En haut'}</option>
                                        <option value="bottom">{isAr ? 'أسفل' : 'En bas'}</option>
                                     </select>
                                  </div>
                                  <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'الحركة' : 'Animation'}</label>
                                     <select value={topBarAnimation} onChange={e => setTopBarAnimation(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white">
                                        <option value="static">{isAr ? 'ثابت' : 'Statique'}</option>
                                        <option value="marquee">{isAr ? 'متحرك' : 'Défilant'}</option>
                                     </select>
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>
`;
if (content.match(settingsRegex) && !content.includes('showTopBar && (')) {
    content = content.replace(settingsRegex, `${topBarSettings}\n<h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'أيقونات رأس المتجر' : "Icônes de l'en-tête"}</h4>`);
}

// 5. Render Top Bar in Preview
const renderTopBarCode = `
          {showTopBar && (
             <div style={{ backgroundColor: topBarBgColor, color: topBarTextColor }} className={\`w-full py-2 px-4 flex items-center justify-center overflow-hidden z-[990] \${topBarPosition === 'bottom' ? 'mt-auto' : ''}\`}>
                {topBarAnimation === 'marquee' ? (
                   <marquee scrollAmount="5" className="text-xs font-bold tracking-widest uppercase">{topBarText}</marquee>
                ) : (
                   <span className="text-xs font-bold tracking-widest uppercase text-center block w-full">{topBarText}</span>
                )}
             </div>
          )}
`;
if (content.includes('<Layout />') && !content.includes('{showTopBar && (')) {
    // Inject above Layout if top, below Layout if bottom. Actually, we can just inject Top Bar above Layout for 'top', and below Layout for 'bottom'.
    const layoutTag = '<Layout />';
    content = content.replace(layoutTag, `
          {showTopBar && topBarPosition === 'top' && (
             <div style={{ backgroundColor: topBarBgColor, color: topBarTextColor }} className="w-full py-2 px-4 flex items-center justify-center overflow-hidden z-[90]">
                {topBarAnimation === 'marquee' ? (
                   <marquee scrollAmount="5" className="text-[10px] md:text-xs font-bold tracking-widest uppercase">{topBarText}</marquee>
                ) : (
                   <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-center block w-full">{topBarText}</span>
                )}
             </div>
          )}
          <Layout />
          {showTopBar && topBarPosition === 'bottom' && (
             <div style={{ backgroundColor: topBarBgColor, color: topBarTextColor }} className="w-full py-2 px-4 flex items-center justify-center overflow-hidden z-[90]">
                {topBarAnimation === 'marquee' ? (
                   <marquee scrollAmount="5" className="text-[10px] md:text-xs font-bold tracking-widest uppercase">{topBarText}</marquee>
                ) : (
                   <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-center block w-full">{topBarText}</span>
                )}
             </div>
          )}
    `);
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log("Top Bar integrated successfully.");
