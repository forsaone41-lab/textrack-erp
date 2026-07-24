const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const regex = /  const submitGlobalOrder = \(product: any, qty: number, e\?: any\) => \{[\s\S]*?    supabase\.from\('commandes'\)\.insert\(cmd\)\.then/m;

const replacement = `  const submitGlobalOrder = (product: any, qty: number, formData?: any) => {
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
        phone: customerPhone,
        items: \`\${qty || 1} article\${(qty || 1) > 1 ? 's' : ''}\`,
        products: product ? [{ 
             name: product.name, 
             photo: product.photo || product.image || 'https://via.placeholder.com/150', 
             qty: qty || 1, 
             price: parseFloat(product.price).toFixed(2) + ' MAD', 
             options: 'Standard' 
        }] : [],
        amount: product ? (parseFloat(product.price) * (qty || 1)).toFixed(2) + ' MAD' : "0.00 MAD",
        status: "En attente",
        statusColor: "bg-amber-100 text-amber-700"
    };
    
    // Sync to BEYA ERP Commandes
    const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
    const cmd = {
        id: generateUUID(),
        client: customerName + ' - ' + customerPhone,
        modele: product ? product.name : 'Commande E-commerce',
        tissu: 'Store: ' + (storeName || config.storeName || 'Boutique') + ' - ' + customerCity + (customerAddress ? ' - ' + customerAddress : ''),
        couleurs: 'Standard',
        tailles: 'Standard',
        quantite: qty || 1,
        statut: 'En attente',
        prix: product ? parseFloat(product.price) : 0,
        dateCommande: new Date().toISOString().split('T')[0]
    };
    supabase.from('commandes').insert(cmd).then`;

if (regex.test(c)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
    console.log("Replaced submitGlobalOrder successfully!");
} else {
    console.log("Could not find regex pattern.");
}
