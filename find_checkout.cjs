const fs = require('fs');
const c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
const lines = c.split('\n');
lines.forEach((l, i) => {
    if (l.includes("page === 'checkout'")) {
        console.log('Line ' + (i+1) + ':');
        lines.slice(i, i+8).forEach((ll, j) => console.log('  ', i+j+1, ll.trim().substring(0, 120)));
    }
});
