const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
c = c.replace(/<button onClick=\{\(\) => setPage\('success'\)\} className="([^"]+)"/g, (match, classes) => {
    if (classes.includes('animate-pop')) return match;
    return `<button onClick={() => setPage('success')} className="${classes} animate-pop"`;
});
fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('patched animate-pop');
