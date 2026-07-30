const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/StoreBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. State Variables
const stateTarget = `  const [topBarAnimation, setTopBarAnimation] = useState(config.topBarAnimation || 'static');`;
const stateReplacement = `  const [topBarAnimation, setTopBarAnimation] = useState(config.topBarAnimation || 'static');
  const [headerSticky, setHeaderSticky] = useState<boolean>(config.headerSticky ?? true);
  const [headerMenuAlign, setHeaderMenuAlign] = useState<'left' | 'center' | 'right' | 'top' | 'bottom'>(config.headerMenuAlign || 'center');
  const [headerBgColor, setHeaderBgColor] = useState<string>(config.headerBgColor || '#ffffff');
  const [headerTextColor, setHeaderTextColor] = useState<string>(config.headerTextColor || '#0f172a');
  const [editorTab, setEditorTab] = useState<'header' | 'sections' | 'design' | 'store' | 'footer'>('header');`;
if (!content.includes(stateReplacement)) {
    content = content.replace(stateTarget, stateReplacement);
}

// 2. Undo History (useEffect)
const historyEffectTarget = `setDesignHistory(prev => [...prev, { primaryColor, secondaryColor, borderColor, buttonStyle, cardStyle, footerBgColor, footerTextColor, fontFamily, heroHeight, heroImagePosX, heroImagePosY }].slice(-20));`;
const historyEffectReplacement = `setDesignHistory(prev => [...prev, { primaryColor, secondaryColor, borderColor, buttonStyle, cardStyle, footerBgColor, footerTextColor, fontFamily, heroHeight, heroImagePosX, heroImagePosY, headerSticky, headerMenuAlign, headerBgColor, headerTextColor }].slice(-20));`;
content = content.replace(historyEffectTarget, historyEffectReplacement);

// 3. Undo History (handleUndoDesign)
const undoTarget = `        setHeroImagePosY(target.heroImagePosY);
        return prev.slice(0, -1);`;
const undoReplacement = `        setHeroImagePosY(target.heroImagePosY);
        setHeaderSticky(target.headerSticky ?? true);
        setHeaderMenuAlign(target.headerMenuAlign || 'center');
        setHeaderBgColor(target.headerBgColor || '#ffffff');
        setHeaderTextColor(target.headerTextColor || '#0f172a');
        return prev.slice(0, -1);`;
content = content.replace(undoTarget, undoReplacement);

// 4. Fetch Live Config
const loadTarget = `              if (conf.showHeaderAccount !== undefined) setShowHeaderAccount(conf.showHeaderAccount);`;
const loadReplacement = `              if (conf.showHeaderAccount !== undefined) setShowHeaderAccount(conf.showHeaderAccount);
              if (conf.headerSticky !== undefined) setHeaderSticky(conf.headerSticky);
              if (conf.headerMenuAlign) setHeaderMenuAlign(conf.headerMenuAlign);
              if (conf.headerBgColor) setHeaderBgColor(conf.headerBgColor);
              if (conf.headerTextColor) setHeaderTextColor(conf.headerTextColor);`;
content = content.replace(loadTarget, loadReplacement);

// 5. handleSave
const saveTarget = `       showHeaderSearch,
       showHeaderAccount
    };`;
const saveReplacement = `       showHeaderSearch,
       showHeaderAccount,
       headerSticky,
       headerMenuAlign,
       headerBgColor,
       headerTextColor
    };`;
content = content.replace(saveTarget, saveReplacement);

// 6. StoreHeaderNavbar & Replacing Layout Headers
const navbarComponent = `
  const StoreHeaderNavbar = ({ variant = 'light', page, setPage, isModal = false }: any) => {
    const isDark = variant === 'dark';
    const bgStyle = headerBgColor && headerBgColor !== '#ffffff' 
      ? { backgroundColor: headerBgColor, color: headerTextColor || (isDark ? '#ffffff' : '#0f172a') }
      : (isDark ? { backgroundColor: '#111', color: '#f5f5f5' } : { backgroundColor: '#ffffff', color: headerTextColor || '#0f172a' });

    const containerStickyClass = headerSticky 
      ? 'sticky top-0 z-[100] backdrop-blur-xl shadow-sm'
      : 'relative z-30';

    const getLinkStyleClass = (isActive: boolean) => {
      const base = "transition-all cursor-pointer ";
      if (menuStyle === 'pill') {
        return base + (isActive ? "px-4 py-1.5 rounded-full font-black text-white shadow-sm " : "px-4 py-1.5 rounded-full hover:bg-black/5 ");
      }
      if (menuStyle === 'bold') {
        return base + (isActive ? "font-black tracking-wider " : "font-medium hover:opacity-75 ");
      }
      return base + (isActive ? "font-black border-b-2 pb-0.5 " : "font-medium hover:opacity-75 ");
    };

    return (
      <header className={\`w-full transition-all duration-300 \${containerStickyClass}\`} style={bgStyle}>
        {showTopBar && topBarText && topBarPosition !== 'bottom' && (
          <div className="w-full py-2 px-4 text-center text-xs font-bold overflow-hidden shrink-0 border-b border-black/5" style={{ backgroundColor: topBarBgColor, color: topBarTextColor }}>
            {topBarAnimation === 'marquee' ? (
               <div className="whitespace-nowrap inline-block" style={{ animation: 'beya-topbar-marquee 14s linear infinite' }}>{topBarText}</div>
            ) : (
               <span>{topBarText}</span>
            )}
          </div>
        )}

        {headerMenuAlign === 'top' && (
          <div className={\`hidden md:flex justify-center items-center gap-8 py-3 px-6 border-b text-xs font-bold \${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/50'}\`}>
            {storePages.map((p: any) => (
               <span key={p.id} onClick={() => setPage(p.id)} className={getLinkStyleClass(page === p.id)} style={page === p.id ? (menuActiveColor ? { color: menuActiveColor, borderColor: menuActiveColor, backgroundColor: menuStyle === 'pill' ? (menuActiveColor || primaryColor) : undefined } : { borderColor: primaryColor, backgroundColor: menuStyle === 'pill' ? primaryColor : undefined }) : (menuTextColor ? { color: menuTextColor } : {})}>{tr(p.title || p.label || p.id)}</span>
            ))}
          </div>
        )}

        <div className="px-6 py-4 flex items-center justify-between gap-4 border-b border-black/5">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between">
             <LogoEditor onClick={() => setPage('home')} className={\`text-2xl font-black uppercase tracking-tighter \${isDark ? 'text-white' : ''}\`} style={{ color: primaryColor }} />
             <MobileMenuButton />
          </div>

          {['center', 'left', 'right'].includes(headerMenuAlign) && (
            <div className={\`hidden md:flex items-center gap-6 text-sm \${headerMenuAlign === 'left' ? 'ml-8 mr-auto' : headerMenuAlign === 'right' ? 'ml-auto mr-8' : 'mx-auto'}\`}>
              {storePages.map((p: any) => (
                 <span key={p.id} onClick={() => setPage(p.id)} className={getLinkStyleClass(page === p.id)} style={page === p.id ? (menuActiveColor ? { color: menuActiveColor, borderColor: menuActiveColor, backgroundColor: menuStyle === 'pill' ? (menuActiveColor || primaryColor) : undefined } : { borderColor: primaryColor, backgroundColor: menuStyle === 'pill' ? primaryColor : undefined }) : (menuTextColor ? { color: menuTextColor } : {})}>{tr(p.title || p.label || p.id)}</span>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
             <HeaderIconsCluster variant={variant} />
          </div>
        </div>

        {headerMenuAlign === 'bottom' && (
          <div className={\`hidden md:flex justify-center items-center gap-8 py-3 px-6 border-b text-sm font-bold \${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/50'}\`}>
            {storePages.map((p: any) => (
               <span key={p.id} onClick={() => setPage(p.id)} className={getLinkStyleClass(page === p.id)} style={page === p.id ? (menuActiveColor ? { color: menuActiveColor, borderColor: menuActiveColor, backgroundColor: menuStyle === 'pill' ? (menuActiveColor || primaryColor) : undefined } : { borderColor: primaryColor, backgroundColor: menuStyle === 'pill' ? primaryColor : undefined }) : (menuTextColor ? { color: menuTextColor } : {})}>{tr(p.title || p.label || p.id)}</span>
            ))}
          </div>
        )}

        {showTopBar && topBarText && topBarPosition === 'bottom' && (
          <div className="w-full py-2 px-4 text-center text-xs font-bold overflow-hidden shrink-0 border-b border-black/5" style={{ backgroundColor: topBarBgColor, color: topBarTextColor }}>
            {topBarAnimation === 'marquee' ? (
               <div className="whitespace-nowrap inline-block" style={{ animation: 'beya-topbar-marquee 14s linear infinite' }}>{topBarText}</div>
            ) : (
               <span>{topBarText}</span>
            )}
          </div>
        )}
      </header>
    );
  };
`;

const anchor = `  const LayoutHeroCenter = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {`;
if (!content.includes('const StoreHeaderNavbar')) {
    content = content.replace(anchor, navbarComponent + '\n' + anchor);
}

// Replace header in LayoutHeroCenter
const heroCenterHeader = `<div className={\`p-6 flex justify-between items-center border-b border-slate-100 \${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}\`}>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-tighter" />
            <MobileMenuButton />
         </div>
         <div className={\`flex gap-6 text-sm font-bold \${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}\`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <HeaderIconsCluster variant="light" />
      </div>`;
content = content.replace(heroCenterHeader, `<StoreHeaderNavbar variant="light" page={page} setPage={setPage} isModal={isModal} />`);

// Replace header in LayoutSplitScreen
const splitScreenHeader = `<div className={\`px-8 py-6 flex justify-between items-center bg-white \${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}\`}>
         <div className={\`flex gap-8 text-sm \${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}\`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-3xl font-normal tracking-wide" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <HeaderIconsCluster variant="light" />
      </div>`;
content = content.replace(splitScreenHeader, `<StoreHeaderNavbar variant="light" page={page} setPage={setPage} isModal={isModal} />`);

// Replace header in LayoutElegant
const elegantHeader = `<div className={\`p-8 flex flex-col items-center gap-6 border-b border-white/10 \${previewDevice === 'mobile' && !isModal ? 'p-4' : 'p-4 md:p-8'}\`}>
         <div className="flex items-center gap-4 w-full justify-between md:justify-center md:relative">
            <div className="w-5 md:hidden" />
            <LogoEditor onClick={() => setPage('home')} className="text-4xl font-serif tracking-widest" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <div className={\`flex gap-12 text-xs tracking-widest uppercase \${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}\`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
            <HeaderIconsCluster variant="dark" />
         </div>
         <div className="md:hidden">
            <HeaderIconsCluster variant="dark" />
         </div>
      </div>`;
content = content.replace(elegantHeader, `<StoreHeaderNavbar variant="dark" page={page} setPage={setPage} isModal={isModal} />`);

// Replace header in LayoutMazia
const maziaHeader = `<div className={\`p-4 mx-4 mt-4 bg-slate-100 rounded-full flex justify-between items-center \${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4 rounded-3xl' : 'flex-col md:flex-row gap-4 rounded-3xl md:rounded-full'}\`}>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black tracking-tight px-4" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <div className={\`flex gap-2 text-sm font-bold \${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}\`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <div className="p-2 bg-white rounded-full shadow-sm mr-1">
            <HeaderIconsCluster variant="light" />
         </div>
      </div>`;
content = content.replace(maziaHeader, `<StoreHeaderNavbar variant="light" page={page} setPage={setPage} isModal={isModal} />`);

// Replace header in LayoutClement
const clementHeader = `<div className={\`px-8 py-6 flex justify-between items-center \${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}\`}>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a]" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <div className={\`flex gap-8 text-sm font-medium text-[#4a4a4a] \${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}\`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <HeaderIconsCluster variant="light" />
      </div>`;
content = content.replace(clementHeader, `<StoreHeaderNavbar variant="light" page={page} setPage={setPage} isModal={isModal} />`);

// Replace header in LayoutProSimple
const proSimpleHeader = `{/* Header */}
      <div className={\`flex justify-between items-center bg-white border-b border-slate-100 relative \${previewDevice === 'mobile' && !isModal ? 'p-4' : 'px-8 py-6'}\`}>
         {/* Navigation - Left on desktop */}
         <div className={\`hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-500\`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <MobileMenuButton colorClass="text-slate-800" />
         {/* Logo - Center */}
         <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <LogoEditor onClick={() => setPage('home')} className={\`text-2xl font-black tracking-tighter text-slate-900 \${fontFamily}\`} style={{ color: primaryColor }} />
         </div>
         {/* Icons - Right */}
         <HeaderIconsCluster variant="light" />
      </div>`;
content = content.replace(proSimpleHeader, `<StoreHeaderNavbar variant="light" page={page} setPage={setPage} isModal={isModal} />`);

// 7. Visual Builder Sidebar Tabs and Content replacement
const sidebarStart = \`<div className={\\\`bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-2xl transition-all duration-300 overflow-hidden \${isPreviewFullscreen ? 'w-0 border-0' : 'w-[320px]'}\\\`}>
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2 text-indigo-700">
                   <LayoutTemplate className="w-5 h-5" />
                   <span className="font-black tracking-tight">{isAr ? 'المحرر المرئي' : 'Éditeur Visuel PRO'}</span>
                </div>
                <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded hover:text-rose-500 transition-colors shrink-0">
                   <X className="w-4 h-4" />
                </button>
             </div>\`;

const sidebarEnd = \`             <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                   <Save className="w-4 h-4" /> {isAr ? 'حفظ التغييرات' : 'Sauvegarder'}
                </button>
             </div>
          </div>\`;

const newSidebar = \`<div className={\\\`bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-2xl transition-all duration-300 overflow-hidden \${isPreviewFullscreen ? 'w-0 border-0' : 'w-[360px] md:w-[400px]'}\\\`}>
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2 text-indigo-700">
                   <LayoutTemplate className="w-5 h-5" />
                   <span className="font-black tracking-tight">{isAr ? 'المحرر المرئي' : 'Éditeur Visuel PRO'}</span>
                </div>
                <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 rounded-lg hover:text-rose-500 transition-colors shrink-0">
                   <X className="w-4 h-4" />
                </button>
             </div>
             
             {/* 5-Tab Navigation Bar */}
             <div className="flex items-center bg-slate-50 border-b border-slate-200 p-1 shrink-0 overflow-x-auto no-scrollbar">
                {[
                   { id: 'header', icon: SlidersHorizontal, label: isAr ? 'الهيدر' : 'En-tête' },
                   { id: 'sections', icon: LayoutGrid, label: isAr ? 'الأقسام' : 'Sections' },
                   { id: 'design', icon: Palette, label: isAr ? 'التصميم' : 'Design' },
                   { id: 'store', icon: ShoppingBag, label: isAr ? 'التسوق' : 'Achats' },
                   { id: 'footer', icon: Box, label: isAr ? 'التذييل' : 'Footer' }
                ].map(tab => (
                   <button 
                     key={tab.id} 
                     onClick={() => setEditorTab(tab.id as any)} 
                     className={\\\`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg transition-all \${editorTab === tab.id ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}\\\`}
                   >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
                   </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {editorTab === 'header' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'موضع القائمة' : 'Position du Menu'}</h4>
                        <div className="grid grid-cols-5 gap-2">
                           {[
                             { id: 'center', label: isAr ? 'وسط' : 'Centre', icon: '■ ■ ■' },
                             { id: 'left', label: isAr ? 'يسار' : 'Gauche', icon: '■ ■' },
                             { id: 'right', label: isAr ? 'يمين' : 'Droite', icon: '■ ■' },
                             { id: 'top', label: isAr ? 'علوي' : 'Haut', icon: '▀' },
                             { id: 'bottom', label: isAr ? 'سفلي' : 'Bas', icon: '▄' }
                           ].map(pos => (
                              <button key={pos.id} onClick={() => setHeaderMenuAlign(pos.id as any)} className={\\\`flex flex-col items-center justify-center p-2 rounded-lg border \${headerMenuAlign === pos.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}\\\`}>
                                 <span className="text-lg mb-1">{pos.icon}</span>
                                 <span className="text-[8px] font-bold uppercase">{pos.label}</span>
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                           <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'هيدر ثابت (Sticky)' : 'En-tête Fixe'}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">{isAr ? 'يبقى الهيدر في أعلى الشاشة عند التمرير' : 'Reste visible lors du défilement'}</p>
                           </div>
                           <button onClick={() => setHeaderSticky(!headerSticky)} className={\\\`relative w-11 h-6 rounded-full transition-colors shrink-0 \${headerSticky ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform \${headerSticky ? 'translate-x-5' : ''}\\\`} />
                           </button>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'ألوان الهيدر' : 'Couleurs de l\\'en-tête'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'الخلفية' : 'Fond'}</label>
                              <div className="flex h-9 rounded-lg overflow-hidden border border-slate-200">
                                 <input type="color" value={headerBgColor} onChange={e => setHeaderBgColor(e.target.value)} className="w-10 h-10 p-0 border-0 -m-1" />
                                 <input type="text" value={headerBgColor} onChange={e => setHeaderBgColor(e.target.value)} className="w-full text-xs font-mono px-2 outline-none uppercase" />
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص' : 'Texte'}</label>
                              <div className="flex h-9 rounded-lg overflow-hidden border border-slate-200">
                                 <input type="color" value={headerTextColor} onChange={e => setHeaderTextColor(e.target.value)} className="w-10 h-10 p-0 border-0 -m-1" />
                                 <input type="text" value={headerTextColor} onChange={e => setHeaderTextColor(e.target.value)} className="w-full text-xs font-mono px-2 outline-none uppercase" />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                           <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'شريط الإعلانات العُلوي' : 'Barre d\\'annonce'}</h4>
                           <button onClick={() => setShowTopBar(!showTopBar)} className={\\\`relative w-11 h-6 rounded-full transition-colors shrink-0 \${showTopBar ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform \${showTopBar ? 'translate-x-5' : ''}\\\`} />
                           </button>
                        </div>
                        {showTopBar && (
                           <div className="space-y-3 pt-3 border-t border-slate-100">
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص' : 'Texte'}</label>
                                 <input type="text" value={topBarText} onChange={e => setTopBarText(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'الخلفية' : 'Fond'}</label>
                                    <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
                                       <input type="color" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="w-9 h-9 p-0 border-0 -m-0.5" />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'المكان' : 'Position'}</label>
                                    <select value={topBarPosition} onChange={e => setTopBarPosition(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white">
                                       <option value="top">{isAr ? 'أعلى الهيدر' : 'En haut'}</option>
                                       <option value="bottom">{isAr ? 'أسفل الهيدر' : 'En bas'}</option>
                                    </select>
                                 </div>
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'حركة النص' : 'Animation'}</label>
                                 <select value={topBarAnimation} onChange={e => setTopBarAnimation(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white">
                                    <option value="static">{isAr ? 'ثابت' : 'Statique'}</option>
                                    <option value="marquee">{isAr ? 'شريط متحرك' : 'Défilant (Marquee)'}</option>
                                 </select>
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'أيقونات الهيدر' : 'Icônes'}</h4>
                        <div className="flex items-center justify-between py-1">
                           <span className="text-[11px] font-bold text-slate-600">{isAr ? 'تغيير اللغة' : 'Sélecteur de langue'}</span>
                           <button onClick={() => setShowHeaderLang(!showHeaderLang)} className={\\\`relative w-9 h-5 rounded-full transition-colors shrink-0 \${showHeaderLang ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform \${showHeaderLang ? 'translate-x-4' : ''}\\\`} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between py-1">
                           <span className="text-[11px] font-bold text-slate-600">{isAr ? 'البحث' : 'Recherche'}</span>
                           <button onClick={() => setShowHeaderSearch(!showHeaderSearch)} className={\\\`relative w-9 h-5 rounded-full transition-colors shrink-0 \${showHeaderSearch ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform \${showHeaderSearch ? 'translate-x-4' : ''}\\\`} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between py-1">
                           <span className="text-[11px] font-bold text-slate-600">{isAr ? 'حساب الزبون' : 'Compte Client'}</span>
                           <button onClick={() => setShowHeaderAccount(!showHeaderAccount)} className={\\\`relative w-9 h-5 rounded-full transition-colors shrink-0 \${showHeaderAccount ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform \${showHeaderAccount ? 'translate-x-4' : ''}\\\`} />
                           </button>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'شكل وألوان القائمة' : 'Style du Menu'}</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'لون غير نشط' : 'Inactif'}</label>
                              <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
                                 <input type="color" value={menuTextColor} onChange={e => setMenuTextColor(e.target.value)} className="w-10 h-10 p-0 border-0 -m-1" />
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'لون نشط' : 'Actif'}</label>
                              <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
                                 <input type="color" value={menuActiveColor || primaryColor} onChange={e => setMenuActiveColor(e.target.value)} className="w-10 h-10 p-0 border-0 -m-1" />
                              </div>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           {(['underline', 'pill', 'bold'] as const).map(key => (
                              <button key={key} onClick={() => setMenuStyle(key)} className={\\\`py-2 text-[10px] font-bold rounded-lg border \${menuStyle === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}\\\`}>
                                 {key === 'underline' ? (isAr ? 'تسطير' : 'Souligné') : key === 'pill' ? (isAr ? 'كبسولة' : 'Capsule') : (isAr ? 'عريض' : 'Gras')}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {editorTab === 'sections' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                       <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">{isAr ? 'ترتيب الأقسام' : 'Ordre des Sections'}</h4>
                       {(() => {
                          const blockDefs = [
                             { id: 'features', name: isAr ? 'ميزات' : 'Avantages', icon: ShieldCheck, activeClasses: 'border-blue-500 shadow-md ring-2 ring-blue-100', bgClasses: 'bg-blue-50 text-blue-500', checkClass: 'text-blue-500' },
                             { id: 'newsletter', name: isAr ? 'النشرة البريدية' : 'Newsletter', icon: Mail, activeClasses: 'border-purple-500 shadow-md ring-2 ring-purple-100', bgClasses: 'bg-purple-50 text-purple-500', checkClass: 'text-purple-500' },
                             { id: 'hero', name: isAr ? 'القسم الرئيسي' : 'Bannière (Hero)', icon: Type, activeClasses: 'border-indigo-500 shadow-md ring-2 ring-indigo-100', bgClasses: 'bg-indigo-50 text-indigo-500', checkClass: 'text-indigo-500' },
                             { id: 'slider', name: isAr ? 'معرض صور' : 'Slider', icon: ImageIcon, activeClasses: 'border-emerald-500 shadow-md ring-2 ring-emerald-100', bgClasses: 'bg-emerald-50 text-emerald-500', checkClass: 'text-emerald-500' },
                             { id: 'collections', name: isAr ? 'تصنيفات' : 'Collections', icon: MousePointerClick, activeClasses: 'border-amber-500 shadow-md ring-2 ring-amber-100', bgClasses: 'bg-amber-50 text-amber-500', checkClass: 'text-amber-500' },
                             { id: 'products', name: isAr ? 'منتجات' : 'Produits', icon: LayoutGrid, activeClasses: 'border-rose-500 shadow-md ring-2 ring-rose-100', bgClasses: 'bg-rose-50 text-rose-500', checkClass: 'text-rose-500' }
                          ];
                          return (
                             <div className="space-y-2">
                                {homeBlocks.map((blockId: string, index: number) => {
                                   const def = blockDefs.find(b => b.id === blockId);
                                   if (!def) return null;
                                   const isActive = activeSidebarSection === blockId;
                                   const borderColorMap: any = { hero: '#6366f1', slider: '#10b981', collections: '#f59e0b', products: '#f43f5e', features: '#3b82f6', newsletter: '#a855f7' };
                                   return (
                                      <div key={blockId} className={\\\`bg-white border \${isActive ? def.activeClasses : 'border-slate-200 hover:border-slate-300'} rounded-lg p-3 flex items-center gap-3 transition-all group relative\\\`} style={{ borderLeftWidth: '4px', borderLeftColor: borderColorMap[blockId] || '#94a3b8' }}>
                                         <div onClick={() => setActiveSidebarSection(blockId)} className="flex-1 flex items-center gap-3 cursor-pointer">
                                            <def.icon className={\\\`w-4 h-4 \${isActive ? def.checkClass : 'text-slate-400'}\\\`} />
                                            <span className={\\\`text-[11px] font-black \${isActive ? 'text-slate-900' : 'text-slate-600'}\\\`}>{def.name}</span>
                                            {isActive && <CheckCircle className={\\\`w-4 h-4 \${def.checkClass} ml-auto mr-1\\\`} />}
                                         </div>
                                         <div className="flex flex-col border-l border-slate-100 pl-2">
                                            <button disabled={index === 0} onClick={() => { const newB = [...homeBlocks]; newB[index] = newB[index-1]; newB[index-1] = blockId; setHomeBlocks(newB); }} className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                            <button disabled={index === homeBlocks.length - 1} onClick={() => { const newB = [...homeBlocks]; newB[index] = newB[index+1]; newB[index+1] = blockId; setHomeBlocks(newB); }} className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                         </div>
                                         <button onClick={() => setHomeBlocks(homeBlocks.filter((b: string) => b !== blockId))} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md ml-1"><X className="w-4 h-4" /></button>
                                      </div>
                                   );
                                })}
                                {blockDefs.filter(b => !homeBlocks.includes(b.id)).map(def => (
                                   <div key={def.id} onClick={() => { setHomeBlocks([...homeBlocks, def.id]); setActiveSidebarSection(def.id); }} className="bg-slate-50/50 border border-slate-200 border-dashed rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-white transition-all opacity-60 hover:opacity-100">
                                      <def.icon className="w-4 h-4 text-slate-400" />
                                      <span className="text-[11px] font-bold text-slate-500 flex-1">{def.name}</span>
                                      <Plus className="w-4 h-4 text-slate-400 mr-2" />
                                   </div>
                                ))}
                             </div>
                          );
                       })()}
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                       <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'إعدادات القسم المحدد' : 'Paramètres de la Section'}</h4>
                       
                        {activeSidebarSection === 'hero' && (
                           <>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص الرئيسي' : 'Texte Principal'}</label>
                              <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص الفرعي' : 'Sous-titre'}</label>
                              <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'نص الزر' : 'Texte du Bouton'}</label>
                              <input type="text" value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'صورة الغلاف' : 'Image de Couverture'}</label>
                               <div onClick={() => setIsHeroImagePickerOpen(true)} className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group relative overflow-hidden">
                                 {heroImage ? (
                                    <img src={heroImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                 ) : null}
                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                                    <span className="text-xs font-bold text-slate-500">{isAr ? 'تغيير الصورة' : 'Changer l\\'image'}</span>
                                 </div>
                               </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'حجم البانر' : 'Taille de la bannière'}</label>
                              <div className="flex items-center gap-3">
                                 <input type="range" min={250} max={800} step={10} value={heroHeight} onChange={e => setHeroHeight(parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                                 <span className="text-xs font-mono font-bold text-slate-500 w-12 text-right">{heroHeight}px</span>
                              </div>
                           </div>
                           </>
                        )}

                        {activeSidebarSection === 'slider' && (
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{isAr ? 'صور السلايدر' : 'Images du Slider'}</label>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                 {sliderImages.map((img: string, idx: number) => (
                                    <div key={idx} className="relative aspect-video rounded-lg border border-slate-200 overflow-hidden group">
                                       <img src={img} className="w-full h-full object-cover" />
                                       <button onClick={() => setSliderImages(sliderImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all shadow-md"><X className="w-3 h-3"/></button>
                                    </div>
                                 ))}
                              </div>
                              <label className="w-full h-16 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 text-indigo-500 transition-colors">
                                 <span className="text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4"/> {isAr ? 'إضافة صورة' : 'Ajouter une image'}</span>
                                 <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       setSliderImages([...sliderImages, await readFileAsBase64(file)]);
                                       if (!homeBlocks.includes('slider')) setHomeBlocks([...homeBlocks, 'slider']);
                                    }
                                 }} />
                              </label>
                           </div>
                        )}

                        {activeSidebarSection === 'collections' && (
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'عنوان التصنيفات' : 'Titre des Collections'}</label>
                              <input type="text" value={allCollectionsTitle} onChange={(e) => setAllCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                           </div>
                        )}

                        {activeSidebarSection === 'products' && (
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'عنوان المنتجات المميزة' : 'Titre des Produits'}</label>
                              <input type="text" value={homeCollectionsTitle} onChange={(e) => setHomeCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                           </div>
                        )}

                        {!['hero', 'slider', 'collections', 'products'].includes(activeSidebarSection) && (
                           <div className="text-center py-6 text-slate-400 text-xs">
                              {isAr ? 'اختر قسماً من الأعلى لتعديل محتواه' : 'Sélectionnez une section ci-dessus pour la modifier'}
                           </div>
                        )}
                    </div>
                  </div>
                )}

                {editorTab === 'design' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'الألوان الأساسية' : 'Couleurs'}</h4>
                        <div className="space-y-4">
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                 <label className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer shrink-0 shadow-inner" style={{ backgroundColor: primaryColor }}>
                                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                                 </label>
                                 <span className="text-[10px] font-bold text-slate-500 uppercase">{isAr ? 'أساسي' : 'Principale'}</span>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                 {['#0f172a', '#1e3a8a', '#7c3aed', '#db2777', '#dc2626', '#d97706', '#16a34a', '#0891b2', '#b48a44', '#64748b'].map(color => (
                                    <button key={color} onClick={() => setPrimaryColor(color)} className={\\\`w-6 h-6 rounded-full border-2 \${primaryColor === color ? 'border-indigo-500 scale-110' : 'border-white'} shadow-sm\\\`} style={{ backgroundColor: color }} />
                                 ))}
                              </div>
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                 <label className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer shrink-0 shadow-inner" style={{ backgroundColor: secondaryColor }}>
                                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                                 </label>
                                 <span className="text-[10px] font-bold text-slate-500 uppercase">{isAr ? 'ثانوي' : 'Secondaire'}</span>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                 {['#ffffff', '#f8fafc', '#f1f5f9', '#fef9f0', '#f0fdf4', '#fdf4ff', '#111827', '#1a1a1a'].map(color => (
                                    <button key={color} onClick={() => setSecondaryColor(color)} className={\\\`w-6 h-6 rounded-full border-2 \${secondaryColor === color ? 'border-indigo-500 scale-110' : 'border-slate-200'} shadow-sm\\\`} style={{ backgroundColor: color }} />
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'الخط' : 'Typographie'}</h4>
                        <div className="grid grid-cols-3 gap-2">
                           <button onClick={() => setFontFamily('font-sans')} className={\\\`py-2 text-xs font-bold rounded-lg border font-sans \${fontFamily === 'font-sans' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}\\\`}>Sans</button>
                           <button onClick={() => setFontFamily('font-serif')} className={\\\`py-2 text-xs font-bold rounded-lg border font-serif \${fontFamily === 'font-serif' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}\\\`}>Serif</button>
                           <button onClick={() => setFontFamily('font-mono')} className={\\\`py-2 text-xs font-bold rounded-lg border font-mono \${fontFamily === 'font-mono' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}\\\`}>Mono</button>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'شكل الأزرار' : 'Style des boutons'}</h4>
                        <div className="grid grid-cols-3 gap-2">
                           {(['rounded', 'pill', 'square'] as const).map(key => (
                              <button key={key} onClick={() => setButtonStyle(key)} className={\\\`py-2 text-[10px] font-bold rounded-lg border \${buttonStyle === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}\\\`}>
                                 {key === 'rounded' ? (isAr ? 'مستدير' : 'Arrondi') : key === 'pill' ? (isAr ? 'كبسولة' : 'Capsule') : (isAr ? 'مربع' : 'Carré')}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'شكل بطاقات المنتجات' : 'Cartes produits'}</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {(['rounded', 'square', 'arch', 'pill', 'trend'] as const).map(key => (
                              <button key={key} onClick={() => setCardStyle(key)} className={\\\`py-2 text-[10px] font-bold rounded-lg border \${cardStyle === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}\\\`}>
                                 {key === 'rounded' ? (isAr ? 'مستدير' : 'Arrondi') : key === 'square' ? (isAr ? 'مربع' : 'Carré') : key === 'arch' ? (isAr ? 'قوس' : 'Arche') : key === 'pill' ? (isAr ? 'كبسولة' : 'Pilule') : (isAr ? 'ترند' : 'Trendy')}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {editorTab === 'store' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'إعدادات الشراء' : 'Paramètres d\\'achat'}</h4>
                        
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                           <div>
                              <p className="text-[11px] font-bold text-slate-800">{isAr ? 'الشراء المباشر السريع' : 'Achat direct rapide (Popup)'}</p>
                              <p className="text-[9px] text-slate-500">{isAr ? 'نافذة منبثقة بدلاً من صفحة كاملة' : 'Afficher un popup au lieu de la page produit'}</p>
                           </div>
                           <button onClick={() => setBuyNowAsPopup(!buyNowAsPopup)} className={\\\`relative w-9 h-5 rounded-full transition-colors shrink-0 \${buyNowAsPopup ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform \${buyNowAsPopup ? 'translate-x-4' : ''}\\\`} />
                           </button>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                           <div>
                              <p className="text-[11px] font-bold text-slate-800">{isAr ? 'التقييمات وآراء العملاء' : 'Avis clients'}</p>
                           </div>
                           <button onClick={() => setShowReviews(!showReviews)} className={\\\`relative w-9 h-5 rounded-full transition-colors shrink-0 \${showReviews ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform \${showReviews ? 'translate-x-4' : ''}\\\`} />
                           </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                           <div>
                              <p className="text-[11px] font-bold text-slate-800">{isAr ? 'طلب تسجيل الدخول للشراء' : 'Compte requis pour acheter'}</p>
                           </div>
                           <button onClick={() => setRequireAccountToOrder(!requireAccountToOrder)} className={\\\`relative w-9 h-5 rounded-full transition-colors shrink-0 \${requireAccountToOrder ? 'bg-indigo-600' : 'bg-slate-300'}\\\`}>
                              <span className={\\\`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform \${requireAccountToOrder ? 'translate-x-4' : ''}\\\`} />
                           </button>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'نصوص التوصيل والضمان' : 'Textes de livraison & garantie'}</h4>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'نص التوصيل' : 'Texte Livraison'}</label>
                           <input type="text" value={deliveryText} onChange={e => setDeliveryText(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'نص الضمان' : 'Texte Garantie'}</label>
                           <input type="text" value={guaranteeText} onChange={e => setGuaranteeText(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'نص الإرجاع' : 'Texte Retour'}</label>
                           <input type="text" value={returnText} onChange={e => setReturnText(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                  </div>
                )}

                {editorTab === 'footer' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'معلومات المتجر' : 'Informations Boutique'}</h4>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'اسم المتجر' : 'Nom de la boutique'}</label>
                           <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'وصف المتجر (SEO)' : 'Description (SEO)'}</label>
                           <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500 resize-none h-20" />
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'ألوان التذييل' : 'Couleurs du Footer'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'الخلفية' : 'Fond'}</label>
                              <div className="flex h-9 rounded-lg overflow-hidden border border-slate-200">
                                 <input type="color" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="w-10 h-10 p-0 border-0 -m-1" />
                                 <input type="text" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="w-full text-xs font-mono px-2 outline-none uppercase" />
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص' : 'Texte'}</label>
                              <div className="flex h-9 rounded-lg overflow-hidden border border-slate-200">
                                 <input type="color" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="w-10 h-10 p-0 border-0 -m-1" />
                                 <input type="text" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="w-full text-xs font-mono px-2 outline-none uppercase" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
             </div>

             <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:-translate-y-0.5">
                   {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                   <span className="tracking-wide">{isAr ? 'حفظ التغييرات' : 'Sauvegarder'}</span>
                </button>
             </div>
          </div>\`;

const startIdx = content.indexOf(sidebarStart);
const endIdx = content.indexOf(sidebarEnd);
if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newSidebar + content.substring(endIdx + sidebarEnd.length);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated StoreBuilder.tsx!');
