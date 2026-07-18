const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Remove FloatingColorPicker component definition
const fcpStart = content.indexOf('   const FloatingColorPicker = () => {');
if (fcpStart !== -1) {
    const fcpEnd = content.indexOf('   };', fcpStart) + 5;
    content = content.slice(0, fcpStart) + content.slice(fcpEnd);
}

// 2. Remove <FloatingColorPicker /> from StorePreviewWrapper
content = content.replace(/<FloatingColorPicker \/>/g, '');

// 3. Add the color picker JSX at the very end of StoreBuilder return
const mainReturnEnd = content.lastIndexOf('</div>\n  );\n}');
if (mainReturnEnd !== -1) {
    const colorPickerJSX = `
       {!isLiveStore && (
          <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
             <div className="bg-white p-2 rounded-full shadow-2xl flex items-center gap-3 border-2 border-slate-200 hover:scale-105 transition-transform">
                <span className="text-xs font-black text-slate-700 pl-2 uppercase tracking-wider">Couleur:</span>
                <label className="w-10 h-10 rounded-full cursor-pointer shadow-inner border-[3px] border-white ring-2 ring-slate-100" style={{ backgroundColor: primaryColor }} title="Changer la couleur">
                   <input type="color" className="opacity-0 w-0 h-0" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </label>
             </div>
          </div>
       )}
    `;
    content = content.slice(0, mainReturnEnd) + colorPickerJSX + content.slice(mainReturnEnd);
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Done!');
