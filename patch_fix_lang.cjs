const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// In the StoreBuilder component, add storeIsAr derived from storeLang
// Replace all isAr ? with storeIsAr ? in translation contexts (builder panel labels)
// But keep isAr for layout direction

// The fix: add a storeIsAr variable after storeLang state, then replace translation uses
// First add storeIsAr const after storeLang state declaration
content = content.replace(
  "  const [storeLang, setStoreLang] = useState<'fr'|'en'|'ar'>(config.storeLang || 'fr');",
  "  const [storeLang, setStoreLang] = useState<'fr'|'en'|'ar'>(config.storeLang || 'fr');\n  const storeIsAr = storeLang === 'ar';"
);

// Now replace all builder panel translations that use isAr ? with storeIsAr ?
// These are translations in labels/buttons added by patch_translation.cjs
const translations = [
  // sidebar tabs
  ["isAr ? (tab.id === 'themes' ? 'القوالب'", "storeIsAr ? (tab.id === 'themes' ? 'القوالب'"],
  // top nav
  [">{isAr ? 'إدارة المتجر' : 'Gestion Boutique'}<", ">{storeIsAr ? 'إدارة المتجر' : 'Gestion Boutique'}<"],
  [">{isAr ? 'تطوير الموقع' : 'Développement Site'}<", ">{storeIsAr ? 'تطوير الموقع' : 'Développement Site'}<"],
  ["{isSaving ? (isAr ? 'تم الحفظ'", "{isSaving ? (storeIsAr ? 'تم الحفظ'"],
  ["> {isAr ? 'معاينة' : 'Prévisualiser'}<", "> {storeIsAr ? 'معاينة' : 'Prévisualiser'}<"],
  ["{isPublishing ? (isAr ? 'جاري النشر...'", "{isPublishing ? (storeIsAr ? 'جاري النشر...'"],
  // settings labels
  [">{isAr ? 'اسم العلامة التجارية' : 'Nom de la marque'}<", ">{storeIsAr ? 'اسم العلامة التجارية' : 'Nom de la marque'}<"],
  [">{isAr ? 'النطاق (URL)' : 'Domaine (URL)'}<", ">{storeIsAr ? 'النطاق (URL)' : 'Domaine (URL)'}<"],
  // config tab
  [">{isAr ? 'لغة المتجر' : 'Langue de la boutique'}<", ">{storeIsAr ? 'لغة المتجر' : 'Langue de la boutique'}<"],
  [">{isAr ? 'اسم المتجر' : 'Nom de la boutique'}<", ">{storeIsAr ? 'اسم المتجر' : 'Nom de la boutique'}<"],
  [">{isAr ? 'شعار المتجر (اختياري)' : 'Logo de la boutique (Optionnel)'}<", ">{storeIsAr ? 'شعار المتجر (اختياري)' : 'Logo de la boutique (Optionnel)'}<"],
  ["{isAr ? 'رفع الشعار' : 'Importer un logo'}", "{storeIsAr ? 'رفع الشعار' : 'Importer un logo'}"],
  [">{isAr ? 'إزالة' : 'Retirer'}<", ">{storeIsAr ? 'إزالة' : 'Retirer'}<"],
  ["> {isAr ? 'نطاق مخصص (دومين)' : 'Domaine Personnalisé'}", "> {storeIsAr ? 'نطاق مخصص (دومين)' : 'Domaine Personnalisé'}"],
  [">{isAr ? 'اربط النطاق الخاص بك (مثال: www.maboutique.com)' : 'Connectez votre propre domaine (ex: www.maboutique.com).'}<", ">{storeIsAr ? 'اربط النطاق الخاص بك (مثال: www.maboutique.com)' : 'Connectez votre propre domaine (ex: www.maboutique.com).'}<"],
  ["placeholder={isAr ? 'مثال: www.maboutique.com'", "placeholder={storeIsAr ? 'مثال: www.maboutique.com'"],
  ["isAr ? 'ربط' : 'Lier'", "storeIsAr ? 'ربط' : 'Lier'"],
  [">{isAr ? 'إعدادات مطلوبة (Namecheap, Hostinger...)' : 'Configuration requise (Namecheap, Hostinger...)'}<", ">{storeIsAr ? 'إعدادات مطلوبة (Namecheap, Hostinger...)' : 'Configuration requise (Namecheap, Hostinger...)'}<"],
  ["isAr ? <>لكي يعمل نطاقك", "storeIsAr ? <>لكي يعمل نطاقك"],
  [">{isAr ? 'النوع' : 'Type'}<", ">{storeIsAr ? 'النوع' : 'Type'}<"],
  [">{isAr ? 'الاسم' : 'Host / Nom'}<", ">{storeIsAr ? 'الاسم' : 'Host / Nom'}<"],
  [">{isAr ? 'القيمة / IP' : 'Valeur / IP'}<", ">{storeIsAr ? 'القيمة / IP' : 'Valeur / IP'}<"],
  [">{isAr ? 'الوقت (TTL)' : 'TTL'}<", ">{storeIsAr ? 'الوقت (TTL)' : 'TTL'}<"],
];

let replaced = 0;
for (const [from, to] of translations) {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    replaced++;
  } else {
    console.log('NOT FOUND:', from.slice(0, 60));
  }
}

// Also fix the tab label rendering
content = content.replace(
  /{isAr \? \(tab\.id === 'themes' \? '.*?: tab\.title\)/g,
  (match) => match.replace(/isAr/g, 'storeIsAr')
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log(`Done! Replaced ${replaced} translations to use storeIsAr.`);
