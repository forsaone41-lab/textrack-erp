const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Find the exact block at line 1133
// Marker: space-y-6 with input type=text (the Minimal layout checkout)
const marker = 'className="space-y-6">\r\n                     <input type="text" placeholder={storeLang === \'ar\' ? \'الاسم الكامل\'';
const idx = c.indexOf(marker);
console.log('Found space-y-6 block at:', idx);

if (idx !== -1) {
    // Find opening div of space-y-6
    const divStart = c.lastIndexOf('<div', idx);
    // Find end: the button closing </button> then </div> then </div> then </div>
    const btnEnd = c.indexOf('</button>\r\n                  </div>', idx);
    if (btnEnd !== -1) {
        const endReplace = btnEnd + '</button>\r\n                  </div>'.length;
        const replacement = `<div className="mt-6">\r\n                     <CheckoutForm\r\n                        storeIsAr={storeLang === 'ar' || storeIsAr}\r\n                        onSubmit={submitGlobalOrder}\r\n                        product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}\r\n                        quantity={typeof quantity !== 'undefined' ? quantity : 1}\r\n                        disabled={false}\r\n                     />\r\n                  </div>`;
        c = c.substring(0, divStart) + replacement + c.substring(endReplace);
        console.log('Replaced Minimal checkout form!');
    } else {
        console.log('btn end not found');
        // Try different ending
        const btnEnd2 = c.indexOf('CONFIRM ORDER</button>\r\n                  </div>', idx);
        if (btnEnd2 !== -1) {
            const endReplace2 = btnEnd2 + 'CONFIRM ORDER</button>\r\n                  </div>'.length;
            const replacement2 = `<div className="mt-6">\r\n                     <CheckoutForm\r\n                        storeIsAr={storeLang === 'ar' || storeIsAr}\r\n                        onSubmit={submitGlobalOrder}\r\n                        product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}\r\n                        quantity={typeof quantity !== 'undefined' ? quantity : 1}\r\n                        disabled={false}\r\n                     />\r\n                  </div>`;
            c = c.substring(0, divStart) + replacement2 + c.substring(endReplace2);
            console.log('Replaced Minimal checkout form (variant 2)!');
        }
    }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Done.');
