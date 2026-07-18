const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

content = content.replace(/(<input[^>]+placeholder="Delivery Address"[^>]*\/>)/g, (match) => {
    return match.replace('Delivery Address', 'Ville / City') + '\n' + ' '.repeat(30) + match;
});

content = content.replace(/(Confirm Order \(COD\)<\/button>)/g, (match) => {
    return match + '\n' + ' '.repeat(30) + '<p className="text-center text-xs font-bold text-green-600 mt-4 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Livraison Gratuite (Paiement à la livraison)</p>';
});

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
