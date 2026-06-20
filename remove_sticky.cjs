const fs = require('fs');
let content = fs.readFileSync('src/components/AgendaPresence.tsx', 'utf8');

// TH
content = content.replace(
  `<th className="sticky end-0 z-20 bg-white p-3 border-b-2 border-slate-200 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.1)]">`,
  `<th className="p-3 border-b-2 border-slate-200 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">`
);

// TD
content = content.replace(
  `<td className="sticky end-0 z-10 bg-white group-hover:bg-slate-50 p-3 text-center shadow-[0_0_15px_rgba(0,0,0,0.1)]">`,
  `<td className="p-3 text-center group-hover:bg-slate-50 transition-colors">`
);

fs.writeFileSync('src/components/AgendaPresence.tsx', content, 'utf8');
console.log('Removed sticky from hours column');
