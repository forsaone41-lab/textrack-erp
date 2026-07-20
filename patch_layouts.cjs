const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Layout 1: HeroCenter
content = content.replace(
    /(<button onClick=\{handleAddToCart\} className=.w-full bg-slate-900 text-white font-bold py-4.*?<\/button>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>)/g,
    $1\n            <StickyCartButton primaryColor={primaryColor} handleAddToCart={handleAddToCart} previewDevice={previewDevice} isLiveStore={isLiveStore} storeIsAr={storeIsAr} />
);

// Layout 2: SplitScreen
content = content.replace(
    /(<button onClick=\{handleAddToCart\} className=.w-full py-4 text-white font-bold.*?<\/button>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>)/g,
    $1\n            <StickyCartButton primaryColor={primaryColor} handleAddToCart={handleAddToCart} previewDevice={previewDevice} isLiveStore={isLiveStore} storeIsAr={storeIsAr} />
);

// Layout 3: ElegantMinimal
content = content.replace(
    /(<button onClick=\{handleAddToCart\} className=.px-12 py-4 bg-slate-900 text-white font-bold.*?<\/button>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>)/g,
    $1\n            <StickyCartButton primaryColor={primaryColor} handleAddToCart={handleAddToCart} previewDevice={previewDevice} isLiveStore={isLiveStore} storeIsAr={storeIsAr} />
);

// Layout 4: Abaya
content = content.replace(
    /(<button onClick=\{handleAddToCart\} className=.w-full py-4 bg-slate-900 text-white.*?<\/button>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>)/g,
    $1\n            <StickyCartButton primaryColor={primaryColor} handleAddToCart={handleAddToCart} previewDevice={previewDevice} isLiveStore={isLiveStore} storeIsAr={storeIsAr} />
);

// Layout 5: Fashlow
content = content.replace(
    /(<button onClick=\{handleAddToCart\} className=.flex-1 bg-slate-900 text-white.*?<\/button>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>)/g,
    $1\n            <StickyCartButton primaryColor={primaryColor} handleAddToCart={handleAddToCart} previewDevice={previewDevice} isLiveStore={isLiveStore} storeIsAr={storeIsAr} />
);

// Layout 6: Mazia
content = content.replace(
    /(<button onClick=\{handleAddToCart\} className=.w-full py-4 bg-slate-900 text-white.*?<\/button>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>)/g,
    $1\n               <StickyCartButton primaryColor={primaryColor} handleAddToCart={handleAddToCart} previewDevice={previewDevice} isLiveStore={isLiveStore} storeIsAr={storeIsAr} />
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Patched layouts!');
