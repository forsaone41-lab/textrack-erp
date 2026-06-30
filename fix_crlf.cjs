const fs = require('fs');
let code = fs.readFileSync('src/pages/Demandes.tsx', 'utf8');

const target = "                                  <Scissors className=\"w-3.5 h-3.5\" /> {isAr ? 'تحليل الموديل' : 'Analyser Modèle'}\r\n                                </button>\r\n                              )}";

const replace = "                                  <Scissors className=\"w-3.5 h-3.5\" /> {isAr ? 'تحليل الموديل' : 'Analyser Modèle'}\n                                </button>\n                              )}\n                              {!lead.type.startsWith('RECRUTEMENT:') && (\n                                <button onClick={async () => {\n                                    if (window.confirm(isAr ? 'إرسال طلب تسعير الباترون للمودليست؟' : 'Demander le prix de patronage au modéliste?')) {\n                                      let extras = {};\n                                      try { extras = JSON.parse(lead.details || '{}'); } catch(e){}\n                                      const updated = { ...lead, details: JSON.stringify({...extras, patronageStatus: 'requested'}) };\n                                      setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));\n                                      await saveRecord('leads', updated, true);\n                                    }\n                                  }} title={isAr ? 'طلب تسعير الباترون' : 'Demander Prix Patronage'}\n                                  className=\"h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-500 hover:text-white transition-all shadow-sm flex items-center gap-1\">\n                                  <Scissors className=\"w-3.5 h-3.5\" /> {isAr ? 'باترون' : 'Prix Patronage'}\n                                </button>\n                              )}";

if (code.includes(target)) {
  fs.writeFileSync('src/pages/Demandes.tsx', code.replace(target, replace));
  console.log("Success with \\r\\n");
} else {
  const targetLF = target.replace(/\r\n/g, '\n');
  if (code.includes(targetLF)) {
    fs.writeFileSync('src/pages/Demandes.tsx', code.replace(targetLF, replace));
    console.log("Success with \\n");
  } else {
    console.log("Failed to find target");
  }
}
