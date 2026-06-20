const fs = require('fs');

let content = fs.readFileSync('src/components/AgendaPresence.tsx', 'utf8');

// 1. Employee TH
content = content.replace(
  `<th className="sticky left-0 z-20 bg-white p-3 border-b-2 border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">`,
  `<th className={\`sticky \${isAr ? 'right-0' : 'left-0'} z-20 bg-white p-3 border-b-2 border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px] shadow-[4px_0_15px_rgba(0,0,0,0.05)]\`}>`
);

// 2. Employee TD
content = content.replace(
  `<td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-3">`,
  `<td className={\`sticky \${isAr ? 'right-0' : 'left-0'} z-10 bg-white group-hover:bg-slate-50 p-3 shadow-[4px_0_15px_rgba(0,0,0,0.05)]\`}>`
);

// 3. Hours TH
content = content.replace(
  `<th className="p-3 border-b-2 border-slate-200 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">`,
  `<th className={\`sticky \${isAr ? 'left-0' : 'right-0'} z-20 bg-white p-3 border-b-2 border-slate-200 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap shadow-[-4px_0_15px_rgba(0,0,0,0.05)]\`}>`
);

// 4. Hours TD
content = content.replace(
  `<td className="p-3 text-center">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black rounded-lg text-xs">`,
  `<td className={\`sticky \${isAr ? 'left-0' : 'right-0'} z-10 bg-white group-hover:bg-slate-50 p-3 text-center shadow-[-4px_0_15px_rgba(0,0,0,0.05)]\`}>
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black rounded-lg text-xs">`
);

fs.writeFileSync('src/components/AgendaPresence.tsx', content, 'utf8');
console.log('Sticky columns applied.');
