const fs = require('fs');
const c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('isAr ?') && !l.includes('storeIsAr')) {
    console.log(i + 1, l.trim().slice(0, 120));
  }
});
