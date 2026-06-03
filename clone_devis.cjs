const fs = require('fs');
const path = require('path');

const facturesPath = path.join('src', 'pages', 'Factures.tsx');
const devisPath = path.join('src', 'pages', 'Devis.tsx');

let content = fs.readFileSync(facturesPath, 'utf-8');

// For Devis.tsx:
// 1. Rename Factures to Devis
let devisContent = content.replace(/export default function Factures\(\)/g, 'export default function Devis()');

// 2. Filter to only show 'devis'
devisContent = devisContent.replace(/const filtered = factures\.filter\(f => \{/g, 'const filtered = factures.filter(f => f.typeDoc === \'devis\').filter(f => {');

// 3. Remove other type docs from create modal
devisContent = devisContent.replace(/<option value="facture">Facture<\/option>/g, '');
devisContent = devisContent.replace(/<option value="recu">Reçu de paiement \/ Avance<\/option>/g, '');
devisContent = devisContent.replace(/value=\{form\.typeDoc \|\| 'facture'\}/g, 'value={form.typeDoc || \'devis\'}');
devisContent = devisContent.replace(/function openCreate\(typeDoc: 'facture' \| 'devis' \| 'recu' = 'facture'\)/g, 'function openCreate(typeDoc: \'facture\' | \'devis\' | \'recu\' = \'devis\')');

// 4. Change Title
devisContent = devisContent.replace(/t\('factures_title', lang\)/g, 'isAr ? \'عروض الأسعار\' : \'Devis\'');
devisContent = devisContent.replace(/t\('factures_subtitle', lang\)/g, 'isAr ? \'عرض(عروض) مسجلة\' : \'devis enregistré(s)\'');

// 5. Change buttons
devisContent = devisContent.replace(/<button[^>]+onClick=\{\(\) => openCreate\('facture'\)\}[^>]*>[\s\S]*?<\/button>/g, '');
devisContent = devisContent.replace(/<button[^>]+onClick=\{\(\) => openCreate\('recu'\)\}[^>]*>[\s\S]*?<\/button>/g, '');
devisContent = devisContent.replace(/hidden sm:flex/g, ''); // Make the devis button visible always

fs.writeFileSync(devisPath, devisContent);

// For Factures.tsx:
// 1. Hide devis from filtered list
content = content.replace(/const filtered = factures\.filter\(f => \{/g, 'const filtered = factures.filter(f => f.typeDoc !== \'devis\').filter(f => {');

// 2. Hide devis button
content = content.replace(/<button[^>]+onClick=\{\(\) => openCreate\('devis'\)\}[^>]*>[\s\S]*?<\/button>/g, '');

fs.writeFileSync(facturesPath, content);
console.log("Done");
