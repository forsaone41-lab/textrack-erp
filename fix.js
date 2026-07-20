const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
const search_str = "onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)}";
const replace_str = "onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}";
c = c.split(search_str).join(replace_str);
fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
