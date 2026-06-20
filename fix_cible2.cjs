const fs = require('fs');

let lines = fs.readFileSync('src/pages/ChaineDetaillee.tsx', 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('Cible Horaire'));
if (startIndex !== -1) {
  // Find the exact line index for <div className="text-right"> above it
  let blockStart = startIndex;
  while(blockStart > 0 && !lines[blockStart].includes('<div className="text-right">')) {
    blockStart--;
  }
  
  let blockEnd = startIndex;
  while(blockEnd < lines.length && !lines[blockEnd].includes('</div>')) {
    blockEnd++;
  }

  const replacementLines = `                           <div className="text-right flex flex-col items-end">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cible Horaire</p>
                              <div className="flex items-center gap-1 group/input">
                                <input 
                                  type="number"
                                  value={op.target_heure || ''}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setOperations(operations.map(o => o.id === op.id ? { ...o, target_heure: val } : o));
                                    const opToUpdate = operations.find(o => o.id === op.id);
                                    if (opToUpdate) {
                                      saveRecord('operations_modele', { ...opToUpdate, target_heure: val });
                                    }
                                  }}
                                  className="w-12 bg-transparent text-right text-lg font-black text-slate-900 outline-none border-b-2 border-transparent group-hover/input:border-indigo-200 focus:border-indigo-500 transition-all p-0"
                                />
                                <span className="text-[10px] font-black text-slate-900 mt-1">pcs/h</span>
                              </div>
                           </div>`.split('\n');

  lines.splice(blockStart, blockEnd - blockStart + 1, ...replacementLines);
  fs.writeFileSync('src/pages/ChaineDetaillee.tsx', lines.join('\n'), 'utf8');
  console.log("Successfully replaced Cible Horaire using index splice");
} else {
  console.log("Could not find 'Cible Horaire'");
}
