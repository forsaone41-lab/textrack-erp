const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add storeLang state
content = content.replace(/const \[storeLogo, setStoreLogo\] = useState<string>\(''\);/, "const [storeLogo, setStoreLogo] = useState<string>('');\n  const [storeLang, setStoreLang] = useState<'fr'|'en'|'ar'>('fr');");

// 2. Add storeLang to props
content = content.replace(/const props = { isModal, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy };/g, 
  "const props = { isModal, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, storeLang };");

// 3. Update layouts to accept storeLang
const layouts = ['LayoutHeroCenter', 'LayoutSplitScreen', 'LayoutElegant', 'LayoutPlayful'];
layouts.forEach(layout => {
    content = content.replace(new RegExp(`const ${layout} = \\({([^}]+)}\\) => {`), (match, p1) => {
        if (!p1.includes('storeLang')) {
            return `const ${layout} = ({${p1}, storeLang}: any) => {`;
        }
        return match;
    });
});

// 4. Update the checkout text
content = content.replace(/Express Checkout/g, "{storeLang === 'ar' ? 'شراء سريع' : storeLang === 'en' ? 'Express Checkout' : 'Achat Express'}");
content = content.replace(/placeholder="Full Name"/g, "placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Full Name' : 'Nom Complet'}");
content = content.replace(/placeholder="Phone Number"/g, "placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'}");
content = content.replace(/placeholder="Ville \/ City"/g, "placeholder={storeLang === 'ar' ? 'المدينة' : storeLang === 'en' ? 'City' : 'Ville'}");
content = content.replace(/placeholder="Delivery Address"/g, "placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'}");
content = content.replace(/Confirm Order \(COD\)/g, "{storeLang === 'ar' ? 'تأكيد الطلب (الدفع عند الاستلام)' : storeLang === 'en' ? 'Confirm Order (COD)' : 'Confirmer la Commande'}");
content = content.replace(/Livraison Gratuite \(Paiement à la livraison\)/g, "{storeLang === 'ar' ? 'توصيل مجاني (الدفع عند الاستلام)' : storeLang === 'en' ? 'Free Delivery (Cash on Delivery)' : 'Livraison Gratuite (Paiement à la livraison)'}");

// 5. Add Language Selector in Settings Tab
const settingsHTML = `
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div>
                           <h4 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">Langue de la boutique</h4>
                           <div className="flex gap-2">
                              <button onClick={() => setStoreLang('fr')} className={\`flex-1 py-2 rounded-lg text-sm font-bold transition-all \${storeLang === 'fr' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}\`}>Français</button>
                              <button onClick={() => setStoreLang('en')} className={\`flex-1 py-2 rounded-lg text-sm font-bold transition-all \${storeLang === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}\`}>English</button>
                              <button onClick={() => setStoreLang('ar')} className={\`flex-1 py-2 rounded-lg text-sm font-bold transition-all \${storeLang === 'ar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}\`}>العربية</button>
                           </div>
                        </div>
                     </div>
`;
content = content.replace(/{activeTab === 'settings' && \(\s*<div className="space-y-6">/, "{activeTab === 'settings' && (\n                 <div className=\"space-y-6\">" + settingsHTML);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
