const fs = require('fs');

let content = fs.readFileSync('src/pages/Performance.tsx', 'utf8');

// 1. Add import
if (!content.includes('useLang')) {
  content = content.replace("import { Employe, PointageEntry, Presence, loadData } from '../types';", "import { Employe, PointageEntry, Presence, loadData } from '../types';\nimport { useLang } from '../contexts/LangContext';");
}

// 2. Add hook
if (!content.includes('const { isAr } = useLang();')) {
  content = content.replace('export default function Performance() {', 'export default function Performance() {\n  const { isAr } = useLang();');
}

// 3. Replacements
const replacements = [
  ['>Performance des Ouvriers<', '>{isAr ? "أداء العمال" : "Performance des Ouvriers"}<'],
  ['>Suivi de la productivité et de la qualité<', '>{isAr ? "تتبع الإنتاجية والجودة" : "Suivi de la productivité et de la qualité"}<'],
  ['>Efficacité moyenne<', '>{isAr ? "متوسط الكفاءة" : "Efficacité moyenne"}<'],
  ['>Pièces produites<', '>{isAr ? "القطع المنتجة" : "Pièces produites"}<'],
  ['>Total rebut<', '>{isAr ? "إجمالي التالف" : "Total rebut"}<'],
  ['>Pièces<', '>{isAr ? "القطع" : "Pièces"}<'],
  ['>Efficacité<', '>{isAr ? "الكفاءة" : "Efficacité"}<'],
  ['>Score global<', '>{isAr ? "النقاط الإجمالية" : "Score global"}<'],
  ['>Efficacité par Ouvrier<', '>{isAr ? "الكفاءة لكل عامل" : "Efficacité par Ouvrier"}<'],
  ['>Aucune donnée disponible<', '>{isAr ? "لا توجد بيانات متاحة" : "Aucune donnée disponible"}<'],
  ['>Analyse Globale<', '>{isAr ? "تحليل شامل" : "Analyse Globale"}<'],
  ['>Classement Complet<', '>{isAr ? "التصنيف الكامل" : "Classement Complet"}<'],
  ['>Aucune donnée de pointage disponible<', '>{isAr ? "لا توجد بيانات تسجيل متاحة" : "Aucune donnée de pointage disponible"}<'],
  ['>Ouvrier<', '>{isAr ? "العامل" : "Ouvrier"}<'],
  ['>Rebut<', '>{isAr ? "التالف" : "Rebut"}<'],
  ['>Présence<', '>{isAr ? "الحضور" : "Présence"}<'],
  ['>Score<', '>{isAr ? "النقاط" : "Score"}<']
];

replacements.forEach(([target, rep]) => {
  content = content.split(target).join(rep);
});

// Update radar data keys for better visualization? No, chart labels are fine as is or we can translate them if they appear in UI directly.
// The barData uses "Efficacité" and "Présence" as keys.
// The radarData uses "subject" values 'Efficacité', 'Présence', 'Pièces', 'Sessions', 'Qualité'.

// Let's replace the subject string literals directly in the array mapping.
content = content.replace("'Efficacité'", "isAr ? 'الكفاءة' : 'Efficacité'");
content = content.replace("'Présence'", "isAr ? 'الحضور' : 'Présence'");
content = content.replace("'Pièces'", "isAr ? 'القطع' : 'Pièces'");
content = content.replace("'Sessions'", "isAr ? 'الجلسات' : 'Sessions'");
content = content.replace("'Qualité'", "isAr ? 'الجودة' : 'Qualité'");

fs.writeFileSync('src/pages/Performance.tsx', content, 'utf8');
console.log('Successfully translated Performance.tsx');
