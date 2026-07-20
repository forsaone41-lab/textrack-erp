const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Problem 1: Lines around 1110-1116 are broken — the product map div is missing its closing structure
// The raw inputs before ))))} close the map incorrectly. Fix by adding the missing button/closing divs.
const brokenBlock = `                               <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />\r\n               ))}\r\n            </div>\r\n         )}\r\n         {page === 'checkout' && (`;

const fixedBlock = `                               <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />\r\n                             <button onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-5 text-white text-xs tracking-widest mt-8 transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>\r\n                          </div>\r\n                       ) : (\r\n                          <div className="flex gap-4">\r\n                             {(buyMode === 'cart' || buyMode === 'both') && (\r\n                                <button onClick={handleAddToCart} className="w-max px-12 py-4 bg-white border border-black text-black text-xs tracking-widest hover:bg-gray-100 transition-colors">ADD TO CART</button>\r\n                             )}\r\n                             {(buyMode === 'direct' || buyMode === 'both') && (\r\n                                <button onClick={() => setPage('checkout')} className="w-max px-12 py-4 text-white text-xs tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>BUY NOW</button>\r\n                             )}\r\n                          </div>\r\n                       )}\r\n                    </div>\r\n                 </div>\r\n               ))}\r\n            </div>\r\n         )}\r\n         {page === 'checkout' && (`;

if (c.includes(brokenBlock)) {
    c = c.replace(brokenBlock, fixedBlock);
    console.log('Fixed broken product map block.');
} else {
    console.log('Broken block not found (maybe already fixed).');
}

// Problem 2: The disabled prop uses `> 0` which confuses esbuild in JSX context. 
// Replace with a safe version using IIFE with variables.
const badCheckout = `         {page === 'checkout' && (\r\n            <div className={\`\${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full\`}>\r\n               <div className="p-12 border border-gray-200 bg-white">\r\n                  <h2 className="text-3xl font-light mb-8 text-center" style={{ color: primaryColor }}>Checkout</h2>\r\n                   <div className="mt-6">\r\n                      <CheckoutForm \r\n                         storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr} \r\n                         onSubmit={submitGlobalOrder} \r\n                         product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)} \r\n                         quantity={typeof quantity !== 'undefined' ? quantity : 1} \r\n                         disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)} \r\n                      />\r\n                   </div>\r\n                \r\n                  </div>\r\n               </div>\r\n            </div>\r\n         )}`;

const goodCheckout = `         {page === 'checkout' && (() => {\r\n            const _cp = typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId);\r\n            const _cq = typeof quantity !== 'undefined' ? quantity : 1;\r\n            const _cd = (_cp?.colors?.length && !selectedColor) || (_cp?.sizes?.length && !selectedSize);\r\n            return (\r\n            <div className={\`\${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full\`}>\r\n               <div className="p-12 border border-gray-200 bg-white">\r\n                  <h2 className="text-3xl font-light mb-8 text-center" style={{ color: primaryColor }}>Checkout</h2>\r\n                  <div className="mt-6">\r\n                     <CheckoutForm\r\n                        storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}\r\n                        onSubmit={submitGlobalOrder}\r\n                        product={_cp}\r\n                        quantity={_cq}\r\n                        disabled={_cd}\r\n                     />\r\n                  </div>\r\n               </div>\r\n            </div>\r\n            );\r\n         })()}`;

if (c.includes(badCheckout)) {
    c = c.replace(badCheckout, goodCheckout);
    console.log('Fixed checkout block with IIFE pattern.');
} else {
    // Try to find and replace using a more flexible approach
    const checkoutIdx = c.indexOf("page === 'checkout' && (\r\n            <div className={`${isModal");
    if (checkoutIdx !== -1) {
        console.log('Found checkout block at index:', checkoutIdx);
        // Find its end
        const endIdx = c.indexOf("})}", checkoutIdx);
        if (endIdx !== -1) {
            console.log('Found end at:', endIdx);
        }
    } else {
        console.log('Could not find checkout block. Checking for partial...');
        const idx = c.indexOf("p-12 border border-gray-200 bg-white");
        if (idx !== -1) {
            console.log('Found p-12 at index:', idx, '- surrounding context:');
            console.log(c.substring(idx - 100, idx + 300));
        }
    }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Done.');
