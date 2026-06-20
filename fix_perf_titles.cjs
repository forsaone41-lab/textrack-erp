const fs = require('fs');

let lines = fs.readFileSync('src/pages/Performance.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Efficacité par Ouvrier') && !lines[i].includes('isAr')) {
    lines[i] = lines[i].replace('Efficacité par Ouvrier', '{isAr ? "الكفاءة لكل عامل" : "Efficacité par Ouvrier"}');
  }
  if (lines[i].includes('Analyse Globale') && !lines[i].includes('isAr')) {
    lines[i] = lines[i].replace('Analyse Globale', '{isAr ? "تحليل شامل" : "Analyse Globale"}');
  }
}

fs.writeFileSync('src/pages/Performance.tsx', lines.join('\n'), 'utf8');
console.log('Successfully translated chart titles');
