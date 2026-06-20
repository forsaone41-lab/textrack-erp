const fs = require('fs');

// 1. Refactor AgendaPresence
let agenda = fs.readFileSync('src/components/AgendaPresence.tsx', 'utf8');
agenda = agenda.replace(
  `import { Calendar, Clock, AlertTriangle, CheckCircle, Search, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';`,
  `import { Calendar, Clock, AlertTriangle, CheckCircle, Search, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';\nimport { isHoliday, calculateWorkingHours } from '../utils/beyaRules';`
);

// Remove the local BEYA rules from AgendaPresence since they are now in utils
agenda = agenda.replace(/\/\/ BEYA CREATIVE Official Rules[\s\S]*?\} catch \{\n    return 0;\n  \}\n}/, '');
fs.writeFileSync('src/components/AgendaPresence.tsx', agenda, 'utf8');

// 2. Refactor Performance
let perf = fs.readFileSync('src/pages/Performance.tsx', 'utf8');
if (!perf.includes('isWorkingDay')) {
  perf = perf.replace(
    `import AgendaPresence from '../components/AgendaPresence';`,
    `import AgendaPresence from '../components/AgendaPresence';\nimport { isWorkingDay } from '../utils/beyaRules';`
  );
  
  perf = perf.replace(
    `const allDates = [...new Set(presences.map(p => p.date))];`,
    `const allDates = [...new Set(presences.map(p => p.date))].filter(d => isWorkingDay(d) && d <= today);`
  );
  
  fs.writeFileSync('src/pages/Performance.tsx', perf, 'utf8');
}

// 3. Refactor Dashboard
let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
if (!dash.includes('isWorkingDay')) {
  dash = dash.replace(
    `import { PageLoader } from '../components/PageLoader';`,
    `import { PageLoader } from '../components/PageLoader';\nimport { isWorkingDay } from '../utils/beyaRules';`
  );
  
  fs.writeFileSync('src/pages/Dashboard.tsx', dash, 'utf8');
}

console.log('System integrated.');
