const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
// Normalize to LF for easier processing
c = c.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// ===== CHANGE 1: Add CheckoutForm import =====
if (!c.includes("import CheckoutForm")) {
    c = c.replace(
        "import ProAITools from '../components/Tools/ProAITools';",
        "import ProAITools from '../components/Tools/ProAITools';\nimport CheckoutForm from '../components/CheckoutForm';"
    );
    console.log('1. Added CheckoutForm import');
}

// ===== CHANGE 2: Fix submitGlobalOrder signature =====
// Replace the old DOM-scraping code with direct formData parameter
const oldSubmitHeader = `  const submitGlobalOrder = (product: any, qty: number, e?: any) => {
    try {
      // Safely get inputs ONLY from the active checkout form
      let wrapper;
      if (e && e.currentTarget) {
          wrapper = e.currentTarget.closest('.space-y-4') || e.currentTarget.closest('.p-8');
      }
      
      if (!wrapper) {
          const wrappers = document.querySelectorAll('.store-preview-wrapper');
          wrapper = Array.from(wrappers).reverse().find((w: any) => w.offsetParent !== null) || document.body;
      }
      
      const inputs = Array.from(wrapper.querySelectorAll('input[type="text"], input[type="tel"]'));
      
      const nameInput = inputs[0] as HTMLInputElement;
    const phoneInput = inputs[1] as HTMLInputElement;
    const cityInput = inputs[2] as HTMLInputElement;

    const newOrder = {
        id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
        date: new Date().toLocaleDateString("fr-FR"),
        customer: nameInput?.value || "Client Web",
        city: cityInput?.value || "Non specifiee",
        phone: phoneInput?.value || "Non specifie",`;

const newSubmitHeader = `  const submitGlobalOrder = (product: any, qty: number, formData?: { name: string, phone: string, city: string, address: string }) => {
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

if (c.includes(oldSubmitHeader)) {
    c = c.replace(oldSubmitHeader, newSubmitHeader);
    console.log('2. Fixed submitGlobalOrder signature');
} else {
    console.log('2. WARN: submitGlobalOrder header not found exactly');
}

// Fix Supabase cmd to use customerName/customerPhone instead of nameInput etc.
c = c.replace(
    `        client: (nameInput?.value || 'Client Web') + ' - ' + (phoneInput?.value || ''),`,
    `        client: customerName + ' - ' + customerPhone,`
);
c = c.replace(
    `        tissu: 'Store: ' + (storeName || config.storeName || 'Boutique') + ' - ' + (cityInput?.value || ''),`,
    `        tissu: 'Store: ' + (storeName || config.storeName || 'Boutique') + ' - ' + customerCity + (customerAddress ? ' - ' + customerAddress : ''),`
);
console.log('2b. Fixed Supabase cmd client/tissu fields');

// ===== CHANGE 3: Replace ALL 5 checkout page forms with CheckoutForm component =====
// The pattern for each checkout block is:
//   {page === 'checkout' && (
//     <div ...>
//       <div ...>
//         <h2>...</h2>
//         <div class="space-y-4">
//           <input ... />  (x4)
//           <button onClick={(e) => submitGlobalOrder(..., e)} ...>...</button>
//           [optional: <p>livraison gratuite</p>]
//         </div>
//       </div>
//     </div>
//   )}

// We'll find each "page === 'checkout' && (" block and replace the inner form
// Strategy: find <div className="space-y-4"> inside checkout blocks and replace them

let formCount = 0;
// Different themes have different inner wrappers, but all have `<div className="space-y-4">` 
// Let's find all of them within checkout blocks

// First, let's handle the 5 checkout blocks individually
// The pattern after h2 close is always the inputs block
// We find `</h2>` then immediately the space-y-4 div up to `</button>` (or `</p>` if present)

const inputsPattern = /(<\/h2>[\s\S]*?)(<div className="space-y-4"[\s\S]*?<\/button>(?:[\s\S]*?<\/p>)?[\s\S]*?<\/div>)/g;

// Let's be more targeted: find each checkout page block
// Each has: page === 'checkout' && (  ... inputblock ... )}
// The inputblock starts at first <input and ends after last </button> 

// Easier approach: just find all occurrences of the old input sequences
// Pattern: 4 inputs + a button with submitGlobalOrder
const oldFormPattern1 = /<div className="space-y-4">\s*(<input[\s\S]*?){3,4}\s*<input [^/]*?\/>\s*\s*<button onClick=\{[^}]*submitGlobalOrder[\s\S]*?<\/button>(?:\s*<p[^>]*>[\s\S]*?<\/p>)?\s*<\/div>/g;

const checkoutBlocks = [];
let m;
while ((m = oldFormPattern1.exec(c)) !== null) {
    checkoutBlocks.push({ start: m.index, end: m.index + m[0].length, match: m[0] });
}
console.log('3. Found old form blocks:', checkoutBlocks.length);

// Replace from last to first to preserve indices
for (let i = checkoutBlocks.length - 1; i >= 0; i--) {
    const block = checkoutBlocks[i];
    // Determine if this is inside a checkout page block
    const before = c.substring(Math.max(0, block.start - 500), block.start);
    const isInCheckout = before.includes("page === 'checkout'");
    const newForm = `<div className="mt-6">
                     <CheckoutForm
                        storeIsAr={storeLang === 'ar' || storeIsAr}
                        onSubmit={submitGlobalOrder}
                        product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                        quantity={typeof quantity !== 'undefined' ? quantity : 1}
                        disabled={false}
                     />
                  </div>`;
    c = c.substring(0, block.start) + newForm + c.substring(block.end);
    formCount++;
}
console.log('3. Replaced checkout page forms:', formCount);

// ===== CHANGE 4: Replace PDP inline form (buyMode === 'form') =====
// This one has className="space-y-3" or similar inside PDP
const pdpFormPattern = /<div className="(bg-slate-50|bg-white|p-8|p-6)[^"]*(?:space-y-[34]|border)[^"]*">\s*<(?:h3|h4)[^>]*>[^<]*(?:Checkout|Achat Express|شراء)[^<]*<\/(?:h3|h4)>\s*(<input[\s\S]*?){3,4}\s*<input [^/]*?\/>\s*\s*<button onClick=\{[^}]*submitGlobalOrder[\s\S]*?<\/button>(?:\s*<p[^>]*>[\s\S]*?<\/p>)?\s*<\/div>/g;

const pdpBlocks = [];
while ((m = pdpFormPattern.exec(c)) !== null) {
    pdpBlocks.push({ start: m.index, end: m.index + m[0].length, match: m[0] });
}
console.log('4. Found PDP form blocks:', pdpBlocks.length);

for (let i = pdpBlocks.length - 1; i >= 0; i--) {
    const block = pdpBlocks[i];
    const newPDPForm = `<div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                              <h4 className="font-black text-slate-800 mb-4">{storeLang === 'ar' ? 'شراء سريع' : storeLang === 'en' ? 'Express Checkout' : 'Achat Express'}</h4>
                              <CheckoutForm
                                 storeIsAr={storeLang === 'ar' || storeIsAr}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={false}
                              />
                           </div>`;
    c = c.substring(0, block.start) + newPDPForm + c.substring(block.end);
}

// ===== CHANGE 5: Clean Order ID display =====
c = c.replace(/Commande \{selectedOrder\.id\}/g, 'Commande #{selectedOrder.id.substring(0, 8).toUpperCase()}');
c = c.replace(/الطلب \{selectedOrder\.id\}/g, 'الطلب #{selectedOrder.id.substring(0, 8).toUpperCase()}');
console.log('5. Fixed Order ID display');

// ===== Final: normalize to CRLF =====
c = c.replace(/\n/g, '\r\n');

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('All done. File written successfully.');
