const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Replace all raw forms matching this regex:
// 4 inputs followed by a button containing submitGlobalOrder, followed optionally by a <p>
const regex = /(<input[^>]*?الاسم الكامل[\s\S]*?<\/button>(?:\s*<p[^>]*?>[\s\S]*?<\/p>)?)/g;

let count = 0;
c = c.replace(regex, () => {
    count++;
    return `<CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={false}
                              />`;
});

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Replaced forms:', count);
