const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Add CheckoutForm import
if (!c.includes("import CheckoutForm")) {
    c = c.replace(
        "import ProAITools from '../components/Tools/ProAITools';",
        "import ProAITools from '../components/Tools/ProAITools';\nimport CheckoutForm from '../components/CheckoutForm';"
    );
}

// 2. Refactor submitGlobalOrder signature and logic
const newSubmitStart = `const submitGlobalOrder = (product: any, qty: number, formData?: { name: string, phone: string, city: string, address: string }) => {
    try {
      const customerName = formData?.name || "Client Web";
      const customerPhone = formData?.phone || "Non specifie";
      const customerCity = formData?.city || "Non specifiee";
      const customerAddress = formData?.address || "";

      const newOrder = {
        id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
        date: new Date().toLocaleDateString("fr-FR"),
        customer: customerName,
        city: customerCity,
        phone: customerPhone,`;

const regexSubmit = /const submitGlobalOrder = \([\s\S]*?phone: phoneInput\?\.value \|\| "Non specifie",/m;
c = c.replace(regexSubmit, newSubmitStart);

// Replace in cmd:
c = c.replace(/client: \(nameInput\?\.value \|\| 'Client Web'\) \+ ' - ' \+ \(phoneInput\?\.value \|\| ''\),/, "client: customerName + ' - ' + customerPhone,");
c = c.replace(/tissu: 'Store: ' \+ \(storeName \|\| config.storeName \|\| 'Boutique'\) \+ ' - ' \+ \(cityInput\?\.value \|\| ''\),/, "tissu: 'Store: ' + (storeName || config.storeName || 'Boutique') + ' - ' + customerCity + (customerAddress ? ' - ' + customerAddress : ''),");

// 3. Replace all instances of the checkout form contents
// Let's find "page === 'checkout'"
let count = 0;
let index = 0;
while (true) {
    index = c.indexOf("page === 'checkout'", index);
    if (index === -1) break;
    
    // Find the next '<div className="space-y-4">'
    const startDiv = c.indexOf('<div className="space-y-4">', index);
    if (startDiv !== -1 && startDiv - index < 500) {
        // Find the end of this div block
        // It usually ends after the button `Confirmer la Commande</button>` and the closing `</div>`
        const endBtn = c.indexOf('Confirmer la Commande}</button>', startDiv);
        if (endBtn !== -1) {
            // Let's find the `</div>` after the button
            const nextDivEnd = c.indexOf('</div>', endBtn);
            
            // Wait, Layout Modern has a `<p>Paiement a la livraison</p>` after the button, BEFORE the `</div>`.
            // Let's search for the next `</div>` that belongs to `space-y-4`.
            // Let's just find the `page === 'success'` and replace everything between `space-y-4` and `page === 'success'`? No, that's too much.
            // How about extracting the button to see what it's disabled state looks like.
            
            // To be totally safe, I'll replace everything from `<div className="space-y-4">` up to `</div>` that is just before the closing `</div>` of `p-8`.
            
            let endReplace = nextDivEnd + 6;
            
            // Check if there's a `<p className="text-center... Paiement à la livraison</p>` inside
            const nextP = c.indexOf('Paiement à la livraison</p>', endBtn);
            if (nextP !== -1 && nextP < nextDivEnd + 200) {
                endReplace = c.indexOf('</div>', nextP) + 6;
            }
            
            const replacement = `<CheckoutForm storeIsAr={storeIsAr} onSubmit={submitGlobalOrder} product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)} quantity={typeof quantity !== 'undefined' ? quantity : 1} disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)} />`;
            
            c = c.substring(0, startDiv) + replacement + c.substring(endReplace);
            count++;
            
            // adjust index
            index = startDiv + replacement.length;
        } else {
            index += 10;
        }
    } else {
        index += 10;
    }
}
console.log('Replaced forms count:', count);

// 4. Clean Order ID in Modal
c = c.replace(
    /Commande \{selectedOrder\.id\}/g,
    `Commande #{selectedOrder.id.substring(0, 8).toUpperCase()}`
);
c = c.replace(
    /الطلب \{selectedOrder\.id\}/g,
    `الطلب #{selectedOrder.id.substring(0, 8).toUpperCase()}`
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Done.');
