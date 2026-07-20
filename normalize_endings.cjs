const fs = require('fs');
// Normalize ALL line endings to CRLF for consistency
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
// First normalize to LF, then to CRLF
c = c.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Line endings normalized to CRLF.');
