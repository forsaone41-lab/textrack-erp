const fs = require('fs');
let c = fs.readFileSync('src/types.ts', 'utf8');
c = c.replace(/clientId\?: string;\r?\n\}/g, "clientId?: string;\n  modelisteId?: string;\n}");
fs.writeFileSync('src/types.ts', c);
