const fs = require('fs');

let content = fs.readFileSync('src/pages/Performance.tsx', 'utf8');

// 1. Add import
if (!content.includes('AgendaPresence')) {
  content = content.replace(
    "import { useLang } from '../contexts/LangContext';",
    "import { useLang } from '../contexts/LangContext';\nimport AgendaPresence from '../components/AgendaPresence';"
  );
}

// 2. Add view state
if (!content.includes('const [view, setView]')) {
  content = content.replace(
    "const [presences, setPresences] = useState<Presence[]>([]);",
    "const [presences, setPresences] = useState<Presence[]>([]);\n  const [view, setView] = useState<'production' | 'presence'>('production');"
  );
}

// 3. Add toggle bar and wrap content
const targetHeaderEnd = `        <p className="text-slate-500 text-sm">{isAr ? "تتبع الإنتاجية والجودة" : "Suivi de la productivité et de la qualité"}</p>
      </div>`;

const toggleBar = `        <p className="text-slate-500 text-sm">{isAr ? "تتبع الإنتاجية والجودة" : "Suivi de la productivité et de la qualité"}</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
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
        <div className="space-y-6">`;

const closingTags = `        )}
      </div>
    </div>
  );
}`;

const repClosingTags = `        )}
      </div>
        </div>
      )}
    </div>
  );
}`;

if (!content.includes('Agenda Présence')) {
  content = content.replace(targetHeaderEnd, toggleBar);
  content = content.replace(closingTags, repClosingTags);
  fs.writeFileSync('src/pages/Performance.tsx', content, 'utf8');
  console.log('Successfully added AgendaPresence to Performance.tsx');
} else {
  console.log('Already updated');
}
