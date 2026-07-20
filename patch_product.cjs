const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Fix 1: Remove hardcoded SALE/NEW tags - replace with conditional
const saleTagOld = `{/* Tags */}\r\n                            <div className="absolute top-4 -left-3 flex flex-col gap-2">\r\n                               <span className="bg-rose-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">SALE</span>\r\n                               <span className="bg-emerald-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">NEW</span>\r\n                            </div>`;
const saleTagNew = `{/* Tags - conditional on product data */}\r\n                         {(product.isOnSale || product.isNew) && (\r\n                            <div className="absolute top-4 -left-3 flex flex-col gap-2">\r\n                               {product.isOnSale && <span className="bg-rose-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">SALE</span>}\r\n                               {product.isNew && <span className="bg-emerald-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">NEW</span>}\r\n                            </div>\r\n                         )}`;

// Fix 2: Remove fake strikethrough price
const priceOld = `<span className="text-lg text-slate-400 line-through mb-1">$\\{(parseFloat(product.price) * 1.4).toFixed(2)}</span>`;
const priceNew = `{product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (\r\n                              <span className="text-lg text-slate-400 line-through mb-1">\${parseFloat(product.comparePrice).toFixed(2)}</span>\r\n                           )}`;

let count1 = 0, count2 = 0;
if (c.includes(saleTagOld)) { c = c.replace(saleTagOld, saleTagNew); count1++; }
if (c.includes(priceOld)) { c = c.replace(priceOld, priceNew); count2++; }

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('SALE/NEW fix:', count1, '| Price fix:', count2);
