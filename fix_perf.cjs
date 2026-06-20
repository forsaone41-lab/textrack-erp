const fs = require('fs');

let content = fs.readFileSync('src/pages/Performance.tsx', 'utf8').split(/\r?\n/);

const idx = content.findIndex(line => line.includes('{/* Global KPIs */}'));
if (idx !== -1) {
  content.splice(idx, 0, 
`      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setView('production')}
          className={\`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all \${view === 'production' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
        >
          {isAr ? 'الإنتاج والجودة' : 'Production & Qualité'}
        </button>
        <button 
          onClick={() => setView('presence')}
          className={\`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all \${view === 'presence' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
        >
          {isAr ? 'أجندة الحضور' : 'Agenda Présence'}
        </button>
      </div>

      {view === 'presence' ? (
        <AgendaPresence employes={employes} presences={presences} />
      ) : (
        <div className="space-y-6">`
  );
  
  // Close the parenthesis at the end
  const endIdx = content.lastIndexOf('    </div>');
  if (endIdx !== -1) {
    content.splice(endIdx, 1, '        </div>\n      )}\n    </div>');
  }

  fs.writeFileSync('src/pages/Performance.tsx', content.join('\n'), 'utf8');
  console.log('Success');
} else {
  console.log('Failed');
}
