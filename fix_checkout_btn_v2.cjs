const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const targetStr = `                      <button \n                         disabled={cartCount === 0}\n                         className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" \n                         style={btnStyle}\n                      >`;

const replaceStr = `                      <button \n                         disabled={cartCount === 0}\n                         onClick={() => { setIsCartOpen(false); setPage('checkout'); }}\n                         className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" \n                         style={btnStyle}\n                      >`;

// Try regex because of potential \r\n vs \n
const regex = /<button \s*disabled=\{cartCount === 0\}\s*className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-\[1.02\] active:scale-\[0.98\] transition-transform rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" \s*style=\{btnStyle\}\s*>/g;

const matched = content.match(regex);
if (matched) {
    content = content.replace(regex, `<button \n                         disabled={cartCount === 0}\n                         onClick={() => { setIsCartOpen(false); setPage('checkout'); }}\n                         className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" \n                         style={btnStyle}\n                      >`);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
    console.log("Successfully replaced via regex");
} else {
    console.log("Regex failed. Let's do it manually");
    let lines = content.split('\\n');
    let found = false;
    for (let i=0; i<lines.length; i++) {
        if (lines[i].includes('disabled={cartCount === 0}') && lines[i+1].includes('className="w-full py-4 text-white') && lines[i+2].includes('style={btnStyle}')) {
            lines.splice(i+1, 0, "                         onClick={() => { setIsCartOpen(false); setPage('checkout'); }}");
            found = true;
            break;
        }
    }
    if (found) {
        fs.writeFileSync('src/pages/StoreBuilder.tsx', lines.join('\\n'), 'utf8');
        console.log("Successfully replaced via line iteration");
    } else {
        console.log("Completely failed.");
    }
}
