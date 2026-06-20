const fs = require('fs');

let content = fs.readFileSync('src/components/AgendaPresence.tsx', 'utf8');

// 1. Add currentMonthStr computation earlier, right after monthName
content = content.replace(
  `  const monthName = currentDate.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });`,
  `  const monthName = currentDate.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });\n  const currentMonthStr = \`\${year}-\${String(month + 1).padStart(2, '0')}\`;`
);

// 2. Add sortedFiltered useMemo
const sortedMemo = `  const sortedFiltered = useMemo(() => {
    return [...filtered].map(emp => {
      let totalHours = 0;
      const thisMonthPresences = presences.filter(p => p.employeId === emp.id && p.date.startsWith(currentMonthStr));
      
      daysArray.forEach(day => {
        const dateStr = \`\${currentMonthStr}-\${String(day).padStart(2, '0')}\`;
        const p = thisMonthPresences.find(x => x.date === dateStr);
        if (p) {
          totalHours += calculateWorkingHours(p.heureEntree, p.heureSortie, dateStr);
        }
      });
      
      return { emp, totalHours, thisMonthPresences };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [filtered, presences, currentMonthStr, daysArray]);`;

content = content.replace(
  `  const stats = useMemo(() => {`,
  `${sortedMemo}\n\n  const stats = useMemo(() => {`
);

// 3. Update the tbody mapping
const oldTbodyStart = `          <tbody className="divide-y divide-slate-100">
            {filtered.map(emp => {
              let totalMonthHours = 0;
              const currentMonthStr = \`\${year}-\${String(month + 1).padStart(2, '0')}\`;
              const thisMonthPresences = presences.filter(p => p.employeId === emp.id && p.date.startsWith(currentMonthStr));`;

const newTbodyStart = `          <tbody className="divide-y divide-slate-100">
            {sortedFiltered.map(({ emp, totalHours, thisMonthPresences }) => {`;

content = content.replace(oldTbodyStart, newTbodyStart);

// 4. Remove the inline calculation logic and use precomputed totalHours
content = content.replace(
  `                      const hours = calculateWorkingHours(p.heureEntree, p.heureSortie, dateStr);
                      totalMonthHours += hours;`,
  `                      const hours = calculateWorkingHours(p.heureEntree, p.heureSortie, dateStr);`
);

content = content.replace(
  `{totalMonthHours.toFixed(1)}h`,
  `{totalHours.toFixed(1)}h`
);

// 5. In stats useMemo, since currentMonthStr is already defined, remove its definition
content = content.replace(
  `    const currentMonthStr = \`\${year}-\${String(month + 1).padStart(2, '0')}\`;\n    const thisMonthPresences = presences.filter(p => p.date.startsWith(currentMonthStr));`,
  `    const thisMonthPresences = presences.filter(p => p.date.startsWith(currentMonthStr));`
);

fs.writeFileSync('src/components/AgendaPresence.tsx', content, 'utf8');
console.log('Sorted AgendaPresence by hours');
