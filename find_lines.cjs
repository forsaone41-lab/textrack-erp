const fs = require('fs');
const c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
const lines = c.split('\n');

console.log('--- Checkout Pages ---');
lines.forEach((l, i) => {
    if (l.includes("page === 'checkout'") && l.includes("&&")) {
        console.log('Line ' + (i+1));
    }
});

console.log('--- PDP Forms ---');
lines.forEach((l, i) => {
    if (l.includes("buyMode === 'form'")) {
        console.log('Line ' + (i+1));
    }
});
