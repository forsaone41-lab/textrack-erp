const fs = require('fs');

const file = 'src/pages/Demandes.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add the button
const searchStr2 = `{(lead.details || (lead.tailles && Object.values(lead.tailles).some(v => v > 0))) && !lead.type.startsWith('RECRUTEMENT:') && (
                            <button onClick={() => setDetailsLead(lead)} title="Détails"`;
                            
const replaceStr2 = `
                          {!lead.type.startsWith('RECRUTEMENT:') && (
                            <button onClick={async () => {
                                if (window.confirm(isAr ? 'إرسال طلب تسعير الباترون للمودليست؟' : 'Demander le prix de patronage au modéliste?')) {
                                  let extras = {};
                                  try { extras = JSON.parse(lead.details || '{}'); } catch(e){}
                                  const updated = { ...lead, details: JSON.stringify({...extras, patronageStatus: 'requested'}) };
                                  setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
                                  await saveRecord('leads', updated, true);
                                }
                              }} title={isAr ? 'طلب تسعير الباترون' : 'Demander Prix Patronage'}
                              className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-500 hover:text-white transition-all shadow-sm flex items-center gap-1">
                              <Scissors className="w-3.5 h-3.5" /> Patronage
                            </button>
                          )}
                          {(lead.details || (lead.tailles && Object.values(lead.tailles).some(v => v > 0))) && !lead.type.startsWith('RECRUTEMENT:') && (
                            <button onClick={() => setDetailsLead(lead)} title="Détails"`;
                            
code = code.replace(searchStr2, replaceStr2);

// Add the badge to show the requested/priced status in Demandes.tsx
const searchStr3 = `{lead.type.includes('CMT - Client Tissu') && (
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                                      ✂️ CMT (Tissu Client)
                                    </span>
                                  )}`;
                                  
const replaceStr3 = searchStr3 + `
                                  {(() => {
                                    let ext = {} as any;
                                    try { ext = JSON.parse(lead.details || '{}'); } catch(e){}
                                    if (ext.patronageStatus === 'requested') return (
                                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 border border-indigo-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                                        ⏳ Patronage...
                                      </span>
                                    );
                                    if (ext.patronageStatus === 'priced') return (
                                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                                        ✂️ Patronage: {ext.patronagePrice} MAD
                                      </span>
                                    );
                                    return null;
                                  })()}`;
                                  
code = code.replace(searchStr3, replaceStr3);

fs.writeFileSync(file, code);
