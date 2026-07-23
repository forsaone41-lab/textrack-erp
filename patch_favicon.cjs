const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const oldStr = 'const finalIcon = storeFavicon || storeLogo || "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛍️</text></svg>";';
const newStr = 'const finalIcon = storeFavicon || storeLogo || "data:image/svg+xml,%3Csvg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"%231a1a1a\\" stroke-width=\\"2.5\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"%3E%3Cpath d=\\"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z\\"/%3E%3Cpath d=\\"M3 6h18\\"/%3E%3Cpath d=\\"M16 10a4 4 0 0 1-8 0\\"/%3E%3C/svg%3E";';

content = content.replace(oldStr, newStr);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Replaced');
