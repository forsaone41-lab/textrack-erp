const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const target1 = `  const presencesAujourdhui = presences.filter(p => p.date === todayStr);
  const presents = actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent'));
  const absents = actifs.filter(e => !presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent'));`;

const replace1 = `  const isWorking = isWorkingDay(todayStr);
  const presencesAujourdhui = presences.filter(p => p.date === todayStr);
  const presents = isWorking ? actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent')) : [];
  const absents = isWorking ? actifs.filter(e => !presencesAujourdhui.some(p => p.employeId === e.id && p.statut !== 'absent')) : [];`;

content = content.replace(target1, replace1);

const target2 = `  const retards = actifs.filter(e => presencesAujourdhui.some(p => {`;
const replace2 = `  const retards = !isWorking ? [] : actifs.filter(e => presencesAujourdhui.some(p => {`;

content = content.replace(target2, replace2);

const target3 = `  const enCoursPresence = actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.heureEntree && !p.heureSortie));`;
const replace3 = `  const enCoursPresence = !isWorking ? [] : actifs.filter(e => presencesAujourdhui.some(p => p.employeId === e.id && p.heureEntree && !p.heureSortie));`;

content = content.replace(target3, replace3);

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
console.log('Dashboard updated.');
