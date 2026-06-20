const fs = require('fs');

let content = fs.readFileSync('src/pages/ChaineDetaillee.tsx', 'utf8').replace(/\r\n/g, '\n');

const target = `                           <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cible Horaire</p>
                              <p className="text-lg font-black text-slate-900">{op.target_heure} <span className="text-[10px]">pcs/h</span></p>
                           </div>`;

const replacement = `                           <div className="text-right flex flex-col items-end">
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
                           </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/ChaineDetaillee.tsx', content, 'utf8');
  console.log('Successfully replaced Cible Horaire');
} else {
  console.log('Target not found in ChaineDetaillee.tsx');
}
