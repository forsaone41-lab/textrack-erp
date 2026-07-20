const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Try to find the exact context
const searchStr = 'bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3';
const idx = c.indexOf(searchStr);
if (idx !== -1) {
    // Find start of the div
    const divStart = c.lastIndexOf('<div', idx);
    // Find end: we need the </div> matching this div
    // Count opening and closing divs
    let depth = 0;
    let pos = divStart;
    while (pos < c.length) {
        const nextOpen = c.indexOf('<div', pos + 1);
        const nextClose = c.indexOf('</div>', pos + 1);
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            pos = nextOpen;
        } else {
            if (depth === 0) {
                // This is the closing div for our target
                const divEnd = nextClose + 6;
                const original = c.substring(divStart, divEnd);
                const replacement = `<div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                              <h4 className="font-black text-slate-800 mb-4">{storeLang === 'ar' ? 'شراء سريع' : storeLang === 'en' ? 'Express Checkout' : 'Achat Express'}</h4>
                              <CheckoutForm
                                 storeIsAr={storeLang === 'ar' || storeIsAr}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))}
                              />
                           </div>`;
                c = c.substring(0, divStart) + replacement + c.substring(divEnd);
                console.log('Replaced! Original was:', original.substring(0, 100) + '...');
                break;
            }
            depth--;
            pos = nextClose;
        }
    }
} else {
    console.log('searchStr NOT found');
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
