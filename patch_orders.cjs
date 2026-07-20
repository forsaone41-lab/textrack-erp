const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const submitLogic = '\n  const submitGlobalOrder = (product, qty) => {\n' +
    '    const inputs = Array.from(document.querySelectorAll(\'input[type=" text\]\')).slice(-4);\n' +
 ' const nameInput = inputs[0];\n' +
 ' const phoneInput = inputs[1];\n' +
 ' const cityInput = inputs[2];\n' +
 '\n' +
 ' const newOrder = {\n' +
 ' id: \ORD-\ + Math.floor(10000 + Math.random() * 90000),\n' +
 ' date: new Date().toLocaleDateString(\fr-FR\),\n' +
 ' customer: nameInput?.value || \Client Web\,\n' +
 ' city: cityInput?.value || \Non specifiee\,\n' +
 ' phone: phoneInput?.value || \Non specifie\,\n' +
 ' product: product ? product.name : \Produit inconnu\,\n' +
 ' quantity: qty || 1,\n' +
 ' amount: product ? (parseFloat(product.price) * (qty || 1)).toFixed(2) : \0.00\,\n' +
 ' status: \En attente\,\n' +
 ' statusColor: \#f59e0b\\n' +
 ' };\n' +
 ' \n' +
 ' setStoreOrders((prev) => [newOrder, ...prev]);\n' +
 ' setPage(\success\);\n' +
 ' };\n';

c = c.replace(/const handleDeleteOrder = [^}]+\};\n/, match => match + submitLogic);

const propsRegex = /const props = \{ isModal, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, storeLang, isCartOpen, setIsCartOpen \};/;
c = c.replace(propsRegex, 'const props = { isModal, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, storeLang, isCartOpen, setIsCartOpen, submitGlobalOrder, storeProducts };');

c = c.replace(/onClick=\{\(\) => setPage\('success'\)\}/g, 'onClick={() => submitGlobalOrder(typeof p !== \'undefined\' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== \'undefined\' ? quantity : 1)}');

const layouts = ['LayoutHeroCenter', 'LayoutSplitScreen', 'LayoutMazia', 'LayoutPlayful', 'LayoutClement', 'LayoutElegant'];
layouts.forEach(layout => {
 const sigRegex = new RegExp('const ' + layout + ' = \\(\\{ ([^}]+) \\}: any\\) => \\{');
 c = c.replace(sigRegex, (match, inner) => {
 if (!inner.includes('submitGlobalOrder')) {
 return 'const ' + layout + ' = ({ ' + inner + ', submitGlobalOrder, storeProducts }: any) => {';
 }
 return match;
 });
});

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('patched checkout orders');
