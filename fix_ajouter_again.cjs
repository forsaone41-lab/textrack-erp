const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

content = content.replace(/'\{storeIsAr \? 'إضافة' : 'Ajouter'\}'/g, "'Ajouter'");
content = content.replace(/\{storeIsAr \? 'إضافة' : 'Ajouter'\} une image/g, "Ajouter une image");

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Fixed nested syntaxes!');
