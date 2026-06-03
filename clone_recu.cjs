const fs = require('fs');
const path = require('path');

const facturesPath = path.join('src', 'pages', 'Factures.tsx');
const recusPath = path.join('src', 'pages', 'Recus.tsx');

let content = fs.readFileSync(facturesPath, 'utf-8');

// For Recus.tsx:
// 1. Rename Factures to Recus
let recusContent = content.replace(/export default function Factures\(\)/g, 'export default function Recus()');

// 2. Filter to only show 'recu'
recusContent = recusContent.replace(/const filtered = factures\.filter\(f => f\.typeDoc !== 'devis'\)\.filter\(f => \{/g, 'const filtered = factures.filter(f => f.typeDoc === \'recu\').filter(f => {');

// 3. Remove other type docs from create modal
recusContent = recusContent.replace(/<option value="facture">Facture<\/option>/g, '');
recusContent = recusContent.replace(/<option value="devis">Devis<\/option>/g, '');
recusContent = recusContent.replace(/value=\{form\.typeDoc \|\| 'facture'\}/g, 'value={form.typeDoc || \'recu\'}');
recusContent = recusContent.replace(/function openCreate\(typeDoc: 'facture' \| 'devis' \| 'recu' = 'facture'\)/g, 'function openCreate(typeDoc: \'facture\' | \'devis\' | \'recu\' = \'recu\')');

// 4. Change Title
recusContent = recusContent.replace(/t\('factures_title', lang\)/g, 'isAr ? \'إيصالات الدفع\' : \'Reçus\'');
recusContent = recusContent.replace(/t\('factures_subtitle', lang\)/g, 'isAr ? \'إيصال(إيصالات) مسجلة\' : \'reçu(s) enregistré(s)\'');

// 5. Change buttons
recusContent = recusContent.replace(/<button[^>]+onClick=\{\(\) => openCreate\('facture'\)\}[^>]*>[\s\S]*?<\/button>/g, '');
recusContent = recusContent.replace(/<button[^>]+onClick=\{\(\) => openCreate\('devis'\)\}[^>]*>[\s\S]*?<\/button>/g, '');
recusContent = recusContent.replace(/hidden sm:flex/g, ''); // Make the recu button visible always

// 6. Clean up Factures.tsx
content = content.replace(/const filtered = factures\.filter\(f => f\.typeDoc !== 'devis'\)\.filter\(f => \{/g, 'const filtered = factures.filter(f => f.typeDoc !== \'devis\' && f.typeDoc !== \'recu\').filter(f => {');
content = content.replace(/<button[^>]+onClick=\{\(\) => openCreate\('recu'\)\}[^>]*>[\s\S]*?<\/button>/g, '');

fs.writeFileSync(recusPath, recusContent);
fs.writeFileSync(facturesPath, content);
console.log("Done");
