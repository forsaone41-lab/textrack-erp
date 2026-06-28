const fs = require('fs');

const file = 'src/pages/Demandes.tsx';
let code = fs.readFileSync(file, 'utf8');

const searchStr = `<span className="flex items-center gap-1 text-emerald-600 font-black text-sm uppercase tracking-tight"><Package className="w-3.5 h-3.5" /> {lead.type} <span className="text-slate-400 text-xs font-bold">({lead.quantity} pcs)</span></span>`;

const replaceStr = `<div className="flex items-center gap-2 flex-wrap">
                                  <span className="flex items-center gap-1 text-emerald-600 font-black text-sm uppercase tracking-tight">
                                    <Package className="w-3.5 h-3.5" /> 
                                    {lead.type.replace(' (CMT - Client Tissu)', '')} 
                                    <span className="text-slate-400 text-xs font-bold">({lead.quantity} pcs)</span>
                                  </span>
                                  {lead.type.includes('CMT - Client Tissu') && (
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                                      ✂️ CMT (Tissu Client)
                                    </span>
                                  )}
                                </div>`;

code = code.replace(searchStr, replaceStr);

fs.writeFileSync(file, code);
