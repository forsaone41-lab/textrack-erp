const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Change the button text
content = content.replace(
    "<Ruler className=\"w-4 h-4\" /> {isAr ? 'اختر من الفيش تقنيك' : 'Choisir depuis Fiches Techniques'}",
    "<Ruler className=\"w-4 h-4\" /> {isAr ? 'استيراد من BEYA' : 'IMPORT BEYA'}"
);

// 2. Change the modal title
content = content.replace(
    "<h3 className=\"text-lg font-black text-slate-800\">{isAr ? 'اختر موديل من الفيش تقنيك' : 'Choisir un modèle'}</h3>",
    "<h3 className=\"text-lg font-black text-slate-800\">{isAr ? 'استيراد موديل من BEYA' : 'Importer un modèle BEYA'}</h3>"
);

// 3. Filter the FichesList to only show those belonging to the client or BEYA
const oldFilter = `{fichesList
                             .filter(f => !fichePickerSearch || f.modele.toLowerCase().includes(fichePickerSearch.toLowerCase()) || (f.client || '').toLowerCase().includes(fichePickerSearch.toLowerCase()))
                             .map(f => (`;

const newFilter = `{fichesList
                             .filter(f => {
                                 const client = (f.client || '').toLowerCase();
                                 const storeStr = (storeName || '').toLowerCase().trim();
                                 const isMine = storeStr.length > 1 && client.includes(storeStr);
                                 const isBeya = client.includes('beya');
                                 if (!isMine && !isBeya) return false;
                                 return !fichePickerSearch || f.modele.toLowerCase().includes(fichePickerSearch.toLowerCase()) || client.includes(fichePickerSearch.toLowerCase());
                             })
                             .map(f => (`;

content = content.replace(oldFilter, newFilter);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Fiches Techniques logic updated successfully');
