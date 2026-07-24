const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const oldBtn = `<button 
                         disabled={cartCount === 0}
                         className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                         style={btnStyle}
                      >`;
const newBtn = `<button 
                         disabled={cartCount === 0}
                         onClick={() => { setIsCartOpen(false); setPage('checkout'); }}
                         className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                         style={btnStyle}
                      >`;

content = content.replace(oldBtn, newBtn);
fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log("Button fixed.");
