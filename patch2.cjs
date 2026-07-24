const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');
const oldFilter = \{fichesList
                             .filter(f => !fichePickerSearch || f.modele.toLowerCase().includes(fichePickerSearch.toLowerCase()) || (f.client || '').toLowerCase().includes(fichePickerSearch.toLowerCase()))
                             .map(f => (\;
const newFilter = \{fichesList
                             .filter(f => {
                                 const clientName = (f.client || '').toLowerCase();
                                 const currentStore = (storeName || '').toLowerCase().trim();
                                 const isMine = currentStore.length > 1 && clientName.includes(currentStore);
                                 const isSystem = clientName.includes('beya') || clientName.includes('ia') || clientName.includes('suggestion');
                                 if (!isMine && !isSystem) return false;
                                 return !fichePickerSearch || f.modele.toLowerCase().includes(fichePickerSearch.toLowerCase()) || clientName.includes(fichePickerSearch.toLowerCase());
                             })
                             .map(f => (\;
c = c.replace(oldFilter, newFilter);
fs.writeFileSync('src/pages/StoreBuilder.tsx', c);

