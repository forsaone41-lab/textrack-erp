const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
const lines = c.split('\n');

// Replace lines 1769-1773 (0-indexed: 1768-1772)
lines[1768] = '                           {/* Tags - conditional on product data */}\r';
lines[1769] = '                           {(product.isOnSale || product.isNew) && (\r';
lines[1770] = '                              <div className="absolute top-4 -left-3 flex flex-col gap-2">\r';
lines[1771] = '                                 {product.isOnSale && <span className="bg-rose-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">SALE</span>}\r';
lines[1772] = '                                 {product.isNew && <span className="bg-emerald-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">NEW</span>}\r';
// Insert closing tags
lines.splice(1773, 0, '                              </div>\r', '                           )}\r');

fs.writeFileSync('src/pages/StoreBuilder.tsx', lines.join('\n'), 'utf-8');
console.log('SALE/NEW tags made conditional!');
