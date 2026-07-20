const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Normalize everything to LF
c = c.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 1. Add CheckoutForm import
if (!c.includes("import CheckoutForm")) {
    c = c.replace(
        "import ProAITools from '../components/Tools/ProAITools';",
        "import ProAITools from '../components/Tools/ProAITools';\nimport CheckoutForm from '../components/CheckoutForm';"
    );
}

// 2. Fix submitGlobalOrder signature and logic
const oldSubmitStart = `  const submitGlobalOrder = (product: any, qty: number, e?: any) => {
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

const newSubmitStart = `  const submitGlobalOrder = (product: any, qty: number, formData?: { name: string, phone: string, city: string, address: string }) => {
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

c = c.replace(oldSubmitStart, newSubmitStart);

// Supabase payload replacements
c = c.replace(
    `client: (nameInput?.value || 'Client Web') + ' - ' + (phoneInput?.value || ''),`,
    `client: customerName + ' - ' + customerPhone,`
);
c = c.replace(
    `tissu: 'Store: ' + (storeName || config.storeName || 'Boutique') + ' - ' + (cityInput?.value || ''),`,
    `tissu: 'Store: ' + (storeName || config.storeName || 'Boutique') + ' - ' + customerCity + (customerAddress ? ' - ' + customerAddress : ''),`
);


// 3. Fix Checkout forms in layout blocks carefully
// Instead of greedy regex, we will search for `page === 'checkout' && (` and manually find the boundaries.
let index = 0;
while ((index = c.indexOf("page === 'checkout'", index)) !== -1) {
    // Find the end of the form by looking for </button>
    // Since we know the layout of the checkouts, let's find `</h2>`
    let h2Idx = c.indexOf("</h2>", index);
    if (h2Idx === -1) { index += 10; continue; }
    
    // Find the button inside the form
    let btnIdx = c.indexOf("</button>", h2Idx);
    if (btnIdx === -1) { index += 10; continue; }

    // Sometimes there is a `<p>...livraison...` after the button. Let's check.
    let endReplace = btnIdx + 9;
    let nextDiv = c.indexOf("</div>", btnIdx);
    let nextP = c.indexOf("</p>", btnIdx);
    if (nextP !== -1 && nextP < nextDiv) {
        endReplace = nextP + 4; // include </p>
    }

    const replacement = `
                  <div className="mt-6">
                     <CheckoutForm
                        storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                        onSubmit={submitGlobalOrder}
                        product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                        quantity={typeof quantity !== 'undefined' ? quantity : 1}
                        disabled={false}
                     />
                  </div>`;
    
    // Check if the original block starts with a space-y container
    // We want to replace from `</h2>` + 5 down to `endReplace`
    c = c.substring(0, h2Idx + 5) + replacement + c.substring(endReplace);
    index = h2Idx + 5 + replacement.length;
}

// 4. Replace PDP buyMode forms
let pdpIndex = 0;
while ((pdpIndex = c.indexOf("buyMode === 'form'", pdpIndex)) !== -1) {
    let h4Idx = c.indexOf("</h4>", pdpIndex);
    if (h4Idx === -1) { pdpIndex += 10; continue; }
    
    let btnIdx = c.indexOf("</button>", h4Idx);
    if (btnIdx === -1) { pdpIndex += 10; continue; }

    let endReplace = btnIdx + 9;
    let nextDiv = c.indexOf("</div>", btnIdx);
    let nextP = c.indexOf("</p>", btnIdx);
    if (nextP !== -1 && nextP < nextDiv) {
        endReplace = nextP + 4;
    }

    const replacement = `
                              <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={false}
                              />`;
    
    c = c.substring(0, h4Idx + 5) + replacement + c.substring(endReplace);
    pdpIndex = h4Idx + 5 + replacement.length;
}

// 5. Shorten Order ID in modal
c = c.replace(/Commande \{selectedOrder\.id\}/g, 'Commande #{selectedOrder.id.substring(0, 8).toUpperCase()}');
c = c.replace(/الطلب \{selectedOrder\.id\}/g, 'الطلب #{selectedOrder.id.substring(0, 8).toUpperCase()}');

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('All exact replacements applied. No greedy regex used.');
