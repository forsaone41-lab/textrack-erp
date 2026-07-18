const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// Replace the sidebar tab labels and layout classes that use isAr with storeIsAr
const replacements = [
  // Layout direction classes
  [`\${isAr ? 'text-right' : 'text-left'} bg-slate-50`, `\${storeIsAr ? 'text-right' : 'text-left'} bg-slate-50`],
  [`\${isAr ? 'sm:flex-row-reverse' : ''}`, `\${storeIsAr ? 'sm:flex-row-reverse' : ''}`],
  [`{isAr ? 'text-right' : 'text-left'}`, `{storeIsAr ? 'text-right' : 'text-left'}`],
  [`\${isAr ? 'flex-row-reverse' : ''}`, `\${storeIsAr ? 'flex-row-reverse' : ''}`],
  // Gestion tab labels
  [`isAr ? 'الطلبات' : 'Commandes'`, `storeIsAr ? 'الطلبات' : 'Commandes'`],
  [`isAr ? 'المنتجات' : 'Produits'`, `storeIsAr ? 'المنتجات' : 'Produits'`],
  [`isAr ? 'الزبائن' : 'Clients'`, `storeIsAr ? 'الزبائن' : 'Clients'`],
  [`isAr ? 'الأداء' : 'Paiements'`, `storeIsAr ? 'الأداء' : 'Paiements'`],
  [`isAr ? 'التوصيل' : 'Livraison'`, `storeIsAr ? 'التوصيل' : 'Livraison'`],
  // Builder tab labels
  [`isAr ? 'القوالب' : 'Thèmes'`, `storeIsAr ? 'القوالب' : 'Thèmes'`],
  [`isAr ? 'التصميم' : 'Design'`, `storeIsAr ? 'التصميم' : 'Design'`],
  [`isAr ? 'تطبيقات' : 'Apps'`, `storeIsAr ? 'تطبيقات' : 'Apps'`],
  [`isAr ? 'إعدادات' : 'Config'`, `storeIsAr ? 'إعدادات' : 'Config'`],
];

let count = 0;
for (const [from, to] of replacements) {
  const before = content;
  content = content.split(from).join(to);
  if (content !== before) count++;
  else console.log('NOT FOUND:', from.slice(0, 80));
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log(`Done! ${count} additional replacements made.`);
