const fs = require('fs');

const file = 'src/pages/Demandes.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `title={isAr ? 'تحليل الموديل واستخراج القياسات' : 'Analyser le modèle et extraire les mesures'}>
                                  <Scissors className="w-3.5 h-3.5" /> {isAr ? 'تحليل الموديل' : 'Analyser Modèle'}
                                </button>
                              )}`;

const replace = search + `
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
                                  <Scissors className="w-3.5 h-3.5" /> {isAr ? 'باترون' : 'Prix Patronage'}
                                </button>
                              )}`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Button added!");
} else {
    console.log("Could not find the target code block.");
}
