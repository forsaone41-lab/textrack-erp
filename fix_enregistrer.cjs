const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

content = content.replace(/'\{storeIsAr \? 'حفظ' : 'Enregistrer'\} le produit'/g, "'Enregistrer le produit'");

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Fixed syntax!');
