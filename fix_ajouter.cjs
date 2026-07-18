const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

content = content.replace(/\{storeIsAr \? 'إضافة' : 'Ajouter'\} au panier/g, "Ajouter au panier");
content = content.replace(/\{storeIsAr \? 'أضف للسلة' : '\{storeIsAr \? 'إضافة' : 'Ajouter'\} au panier'\}/g, "{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}");

content = content.replace(/\{storeIsAr \? '\{storeIsAr \? 'إضافة' : 'Ajouter'\}' : '\{storeIsAr \? 'إضافة' : 'Ajouter'\} au panier'\}/g, "{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}");

// Re-check for any other messed up syntax
const lines = content.split('\n');
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes("{storeIsAr ? 'إضافة' : 'Ajouter'}'") || lines[i].includes("'{storeIsAr ? 'إضافة' : 'Ajouter'}")) {
     console.log('Found messed up syntax at line: ' + (i+1));
  }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Fixed syntax!');
