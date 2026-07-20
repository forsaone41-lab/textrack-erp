const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Find the broken section: lines 1107-1134 (roughly)
// The key markers are:
// START: {buyMode === 'form' ? (\r\n<div className="p-8 border border-gray-200 bg-white space-y-4">
// END: the `</div>\r\n         )}\r\n         {page === 'checkout'`

const startMarker = `{buyMode === 'form' ? (\r\n                           <div className="p-8 border border-gray-200 bg-white space-y-4">`;
const endMarker = `{page === 'checkout' && (\r\n            <div className={\`\${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full\`}>\r\n               <div className="p-12 border border-gray-200 bg-white">\r\n                  <h2 className="text-3xl font-light mb-8 text-center" style={{ color: primaryColor }}>Checkout</h2>\r\n                   <div className="mt-6">\r\n                      <CheckoutForm `;

const startIdx = c.indexOf(startMarker);
console.log('startIdx:', startIdx);

const endIdx = c.indexOf(endMarker);
console.log('endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
    // Find the very end of the checkout block
    const finalEnd = c.indexOf('})()}\r\n', endIdx);
    let blockEnd;
    if (finalEnd !== -1 && finalEnd < endIdx + 2000) {
        blockEnd = finalEnd + 6;
    } else {
        // Find the end of the old `page === 'checkout' && (` block
        const oldEndMarker = `                  </div>\r\n               </div>\r\n            </div>\r\n         )}\r\n`;
        const oldEndIdx = c.indexOf(oldEndMarker, endIdx);
        blockEnd = oldEndIdx !== -1 ? oldEndIdx + oldEndMarker.length : -1;
    }
    console.log('blockEnd:', blockEnd);
    
    if (blockEnd !== -1) {
        const replacement = `{buyMode === 'form' ? (\r\n                           <div className="p-8 border border-gray-200 bg-white">\r\n                              <h4 className="text-xl font-light mb-4" style={{ color: primaryColor }}>Checkout</h4>\r\n                              <CheckoutForm\r\n                                 storeIsAr={storeLang === 'ar' || storeIsAr}\r\n                                 onSubmit={submitGlobalOrder}\r\n                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}\r\n                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}\r\n                                 disabled={false}\r\n                              />\r\n                           </div>\r\n                        ) : (\r\n                           <div className="flex gap-4">\r\n                              {(buyMode === 'cart' || buyMode === 'both') && (\r\n                                 <button onClick={handleAddToCart} className="w-max px-12 py-4 bg-white border border-black text-black text-xs tracking-widest hover:bg-gray-100 transition-colors">ADD TO CART</button>\r\n                              )}\r\n                              {(buyMode === 'direct' || buyMode === 'both') && (\r\n                                 <button onClick={() => setPage('checkout')} className="w-max px-12 py-4 text-white text-xs tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>BUY NOW</button>\r\n                              )}\r\n                           </div>\r\n                        )}\r\n                     </div>\r\n                  </div>\r\n               ))}\r\n            </div>\r\n         )}\r\n         {page === 'checkout' && (() => {\r\n            const _cp2 = typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId);\r\n            const _cq2 = typeof quantity !== 'undefined' ? quantity : 1;\r\n            return (\r\n            <div className={\`\${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full\`}>\r\n               <div className="p-12 border border-gray-200 bg-white">\r\n                  <h2 className="text-3xl font-light mb-8 text-center" style={{ color: primaryColor }}>Checkout</h2>\r\n                  <div className="mt-6">\r\n                     <CheckoutForm\r\n                        storeIsAr={storeLang === 'ar' || storeIsAr}\r\n                        onSubmit={submitGlobalOrder}\r\n                        product={_cp2}\r\n                        quantity={_cq2}\r\n                        disabled={false}\r\n                     />\r\n                  </div>\r\n               </div>\r\n            </div>\r\n            );\r\n         })()}\r\n`;
        c = c.substring(0, startIdx) + replacement + c.substring(blockEnd);
        console.log('Replacement done!');
    }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('File written.');
