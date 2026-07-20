const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
c = c.replace(/<h4 className=" text-xs font-bold text-slate-500 uppercase tracking-wider\>\{storeIsAr \? '[^']+' : 'Paramètres de la Section'\}<\/h4>/, <div className=\flex items-center justify-between mb-2\>
 <h4 className=\text-xs font-bold text-slate-500 uppercase tracking-wider\>{storeIsAr ? '??????? ????? ??????' : 'Paramètres de la Section'}</h4>
 {homeBlocks.includes(activeSidebarSection) && (
 <div className=\flex gap-1\>
 <button 
 onClick={() => {
 const idx = homeBlocks.indexOf(activeSidebarSection);
 if (idx > 0) {
 const newBlocks = [...homeBlocks];
 [newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]];
 setHomeBlocks(newBlocks);
 }
 }}
 disabled={homeBlocks.indexOf(activeSidebarSection) === 0}
 className=\p-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded text-xs shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed\
 title=\Monter la section\
 >
 ??
 </button>
 <button 
 onClick={() => {
 const idx = homeBlocks.indexOf(activeSidebarSection);
 if (idx !== -1 && idx < homeBlocks.length - 1) {
 const newBlocks = [...homeBlocks];
 [newBlocks[idx + 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx + 1]];
 setHomeBlocks(newBlocks);
 }
 }}
 disabled={homeBlocks.indexOf(activeSidebarSection) === homeBlocks.length - 1}
 className=\p-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded text-xs shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed\
 title=\Descendre la section\
 >
 ??
 </button>
 </div>
 )}
 </div>);
fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('patched sidebar');
