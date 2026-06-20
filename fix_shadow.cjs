const fs = require('fs');
let content = fs.readFileSync('src/components/AgendaPresence.tsx', 'utf8');

content = content.replace(/shadow-\[4px_0_15px_rgba\(0,0,0,0\.05\)\]/g, 'shadow-[0_0_15px_rgba(0,0,0,0.1)]');
content = content.replace(/shadow-\[-4px_0_15px_rgba\(0,0,0,0\.05\)\]/g, 'shadow-[0_0_15px_rgba(0,0,0,0.1)]');

fs.writeFileSync('src/components/AgendaPresence.tsx', content, 'utf8');
console.log('Fixed shadows');
