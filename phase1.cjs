const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

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

// 3. Shorten Order ID
c = c.replace(/Commande \{selectedOrder\.id\}/g, 'Commande #{selectedOrder.id.substring(0, 8).toUpperCase()}');
c = c.replace(/الطلب \{selectedOrder\.id\}/g, 'الطلب #{selectedOrder.id.substring(0, 8).toUpperCase()}');

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Phase 1 complete.');
