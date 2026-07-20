const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

content = content.replace(
    "const [platformMode, setPlatformMode] = useState<'gestion'|'builder'>('gestion');",
    "const [platformMode, setPlatformMode] = useState<'gestion'|'builder'>(config.storeName ? 'gestion' : 'builder');"
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Replaced successfully.');
