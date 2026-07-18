const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add missing translations to dict
const dictAddition = `
        'All Products ✨': 'جميع المنتجات ✨',
        'ALL PRODUCTS': 'جميع المنتجات',
        'All Products': 'جميع المنتجات',
        'All': 'الكل',
        'ALL': 'الكل',
        'Outerwear': 'ملابس خارجية',
        'OUTERWEAR': 'ملابس خارجية',
        'Tops': 'قمصان',
        'TOPS': 'قمصان',
        'Bottoms': 'بناطيل',
        'BOTTOMS': 'بناطيل',
        'Shoes': 'أحذية',
        'SHOES': 'أحذية',
        'Dresses': 'فساتين',
        'DRESSES': 'فساتين',
        'Recommandé': 'موصى به',
        'Sort: Featured': 'موصى به',
        'Featured': 'موصى به',
        'Best Matches 🌟': 'موصى به 🌟',
        'Prix: Croissant': 'السعر: من الأقل للأكثر',
        'Price: Low to High': 'السعر: من الأقل للأكثر',
        'Price: Low - High': 'السعر: من الأقل للأكثر',
        'Price: Low to High 💸': 'السعر: من الأقل للأكثر 💸',
        'Prix: Décroissant': 'السعر: من الأكثر للأقل',
        'Price: High to Low': 'السعر: من الأكثر للأقل',
        'Price: High - Low': 'السعر: من الأكثر للأقل',
        'Price: High to Low 💎': 'السعر: من الأكثر للأقل 💎',
        'De A à Z': 'أ - ي',
        'De Z à A': 'ي - أ'`;

if (!content.includes("'Outerwear': 'ملابس خارجية'")) {
    content = content.replace("'Produits': 'المنتجات'", "'Produits': 'المنتجات'," + dictAddition);
}

// 2. Wrap categories with tr(c)
content = content.replace(
    /\{c\}/g,
    "{tr(c)}"
);

content = content.replace(
    /\{c === 'All' \? allCollectionsTitle : c\}/g,
    "{c === 'All' ? allCollectionsTitle : tr(c)}"
);

// 3. Wrap hardcoded 'All Products' strings
const hardcodedHeadings = [
    '<h3 className="text-2xl font-black uppercase text-center md:text-left">All Products</h3>',
    '<h3 className="text-2xl font-light">All Products</h3>',
    '<h3 className="text-xl tracking-widest uppercase text-center mb-8" style={{ color: primaryColor }}>All Products</h3>',
    '<h3 className="text-3xl font-black text-center text-slate-800">All Products ✨</h3>'
];

for (const heading of hardcodedHeadings) {
    const text = heading.match(/>(.*)<\/h3>/)[1];
    content = content.replace(heading, heading.replace(text, `{tr('${text}')}`));
}

// 4. Wrap <option> texts
content = content.replace(
    /<option value="([^"]+)">([^<]+)<\/option>/g,
    (match, val, text) => `<option value="${val}">{tr('${text}')}</option>`
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Categories and sorting translated!');
