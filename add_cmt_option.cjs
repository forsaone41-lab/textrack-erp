const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Add provideFabric to ModelEntry
  code = code.replace(/photos: string\[\];\n  \}/, 'photos: string[];\n    provideFabric: boolean;\n  }');
  
  // 2. Add to emptyModel
  code = code.replace(/details: '', photo: null, photos: \[\]/, "details: '', photo: null, photos: [], provideFabric: false");

  // 3. Update calculateEstimate signature
  code = code.replace(/const calculateEstimate = \(type: string, qtyStr: string\) => \{/, "const calculateEstimate = (type: string, qtyStr: string, provideFabric: boolean = false) => {");

  // 4. Update calculateEstimate logic
  code = code.replace(/if \(quantity < 100\) \{ baseMin \*= 1\.15; baseMax \*= 1\.15; \}\n\s*else if \(quantity >= 500\) \{ baseMin \*= 0\.9; baseMax \*= 0\.9; \}/, `if (quantity < 100) { baseMin *= 1.15; baseMax *= 1.15; }\n    else if (quantity >= 500) { baseMin *= 0.9; baseMax *= 0.9; }\n\n    if (provideFabric) {\n      baseMin *= 0.45;\n      baseMax *= 0.45;\n    }`);

  // 5. Update calculateEstimate calls
  code = code.replace(/calculateEstimate\(m\.type, m\.quantity\)/g, "calculateEstimate(m.type, m.quantity, m.provideFabric)");

  // 6. Insert UI
  // Find the exact string block for quantity and append the new select block, and change grid-cols-2 to grid-cols-3
  
  const quantityBlock = `                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'الكمية الإجمالية للموديل' : 'Quantité Totale'}</label>
                            <input type="number" min="1" placeholder="100" value={m.quantity} onChange={e => updateModel(m.id, { quantity: e.target.value })}
                              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 h-[40px]" required />
                          </div>`;
                          
  const uiBlock = `                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'الثوب (Tissu)' : 'Tissu'}</label>
                            <select value={m.provideFabric ? 'yes' : 'no'} onChange={e => updateModel(m.id, { provideFabric: e.target.value === 'yes' })}
                              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 h-[40px]">
                              <option value="no">{isAr ? 'نتكلفو بالثوب (Full Package)' : 'Fourni par nous (Full Package)'}</option>
                              <option value="yes">{isAr ? 'غنجيب الثوب ديالي (CMT)' : 'Je fournis le tissu (CMT)'}</option>
                            </select>
                          </div>`;
  
  // Replace the exact quantity block with itself + uiBlock
  code = code.replace(quantityBlock, quantityBlock + '\n' + uiBlock);
  
  // Replace md:grid-cols-2 with md:grid-cols-3 ONLY for the first block which contains 'Type de vêtement'
  // Actually, wait, replacing all `grid-cols-1 md:grid-cols-2` where it's before the quantity block is hard, let's just use regex
  // Find `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n                          <div>\n                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس'`
  const searchStr = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n                          <div>\n                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس'`;
  const replaceStr = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\n                          <div>\n                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس'`;
  
  code = code.replace(searchStr, replaceStr);

  // In case spacing is slightly different:
  code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">(\s*<div>\s*<label[^>]*>{isAr \? 'نوع اللباس')/g, '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">$1');

  // Also we need to save this `provideFabric` to the backend when saving the lead.
  // In saveLead:
  // type: finalType,
  // we can append ` (CMT)` to the type if they provide fabric!
  code = code.replace(/const finalType = \(m\.type === 'Autre' \|\| m\.type === 'آخر'\) \? m\.customType : m\.type;/g, 
  "const finalType = ((m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type) + (m.provideFabric ? ' (CMT - Client Tissu)' : '');");

  fs.writeFileSync(file, code);
}

patchFile('src/pages/AdsLanding.tsx');
patchFile('src/pages/LandingPage.tsx');
