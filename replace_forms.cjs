const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

let count = 0;
let index = 0;
while (true) {
    index = c.indexOf("page === 'checkout'", index);
    if (index === -1) break;
    
    // Find the button inside the checkout form
    let btnIndex = c.indexOf("</button>", index);
    if (btnIndex === -1) break;

    // Find the enclosing div that contains the inputs. It usually starts with <div className="space-y
    // Or just look for the first `<input ` after `index` and backtrack to its container?
    // Let's just find the `h2` which is the title, and replace everything between `</h2>` and `</button>`
    let h2Index = c.indexOf("</h2>", index);
    if (h2Index !== -1 && h2Index < btnIndex) {
        
        let endReplace = btnIndex + 9; // "</button>".length
        // Sometimes there's a `<p>` right after the button
        let nextP = c.indexOf("<p", btnIndex);
        if (nextP !== -1 && nextP < btnIndex + 200) {
            let endP = c.indexOf("</p>", nextP);
            if (endP !== -1) endReplace = endP + 4;
        }

        // Wait, the replaced ones (count 2) already have <CheckoutForm />
        if (c.substring(h2Index, endReplace).includes('<CheckoutForm')) {
            index = endReplace;
            continue;
        }

        const replacement = `\n                  <div className="mt-6">\n                     <CheckoutForm \n                        storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr} \n                        onSubmit={submitGlobalOrder} \n                        product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)} \n                        quantity={typeof quantity !== 'undefined' ? quantity : 1} \n                        disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)} \n                     />\n                  </div>\n               `;
        
        c = c.substring(0, h2Index + 5) + replacement + c.substring(endReplace);
        count++;
        index = h2Index + 5 + replacement.length;
    } else {
        index += 15;
    }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Replaced forms count:', count);
