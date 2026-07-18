const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const regex = /'All Products': 'جميع المنتجات',\s*'All Products': 'جميع المنتجات',/g;
content = content.replace(regex, "'All Products': 'جميع المنتجات',");

const regex2 = /'All Products': 'جميع المنتجات',\s*'All': 'الكل',/g;
content = content.replace(regex2, "'All': 'الكل',");

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Fixed duplicates');
