const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Sidebar Tabs
content = content.replace(/{tab\.title}/g, "{isAr ? (tab.id === 'themes' ? 'القوالب' : tab.id === 'design' ? 'التصميم' : tab.id === 'apps' ? 'التطبيقات' : tab.id === 'config' ? 'الإعدادات' : tab.title) : tab.title}");

// 2. Top Navigation
content = content.replace(/>Gestion Boutique</g, ">{isAr ? 'إدارة المتجر' : 'Gestion Boutique'}<");
content = content.replace(/>Développement Site</g, ">{isAr ? 'تطوير الموقع' : 'Développement Site'}<");
content = content.replace(/{isSaving \? 'Enregistré' : 'Enregistrer'}/g, "{isSaving ? (isAr ? 'تم الحفظ' : 'Enregistré') : (isAr ? 'حفظ' : 'Enregistrer')}");
content = content.replace(/> Prévisualiser</g, "> {isAr ? 'معاينة' : 'Prévisualiser'}<");
content = content.replace(/{isPublishing \? 'Publication\.\.\.' : 'Publier'}/g, "{isPublishing ? (isAr ? 'جاري النشر...' : 'Publication...') : (isAr ? 'نشر' : 'Publier')}");

// 3. Settings Tab (General)
content = content.replace(/>Nom de la marque</g, ">{isAr ? 'اسم العلامة التجارية' : 'Nom de la marque'}<");
content = content.replace(/>Domaine \(URL\)</g, ">{isAr ? 'النطاق (URL)' : 'Domaine (URL)'}<");

// 4. Config Tab (Detailed settings)
content = content.replace(/>Langue de la boutique</g, ">{isAr ? 'لغة المتجر' : 'Langue de la boutique'}<");
content = content.replace(/>Nom de la boutique</g, ">{isAr ? 'اسم المتجر' : 'Nom de la boutique'}<");
content = content.replace(/>Logo de la boutique \(Optionnel\)</g, ">{isAr ? 'شعار المتجر (اختياري)' : 'Logo de la boutique (Optionnel)'}<");
content = content.replace(/Importer un logo/g, "{isAr ? 'رفع الشعار' : 'Importer un logo'}");
content = content.replace(/>Retirer</g, ">{isAr ? 'إزالة' : 'Retirer'}<");
content = content.replace(/> Domaine Personnalisé</g, "> {isAr ? 'نطاق مخصص (دومين)' : 'Domaine Personnalisé'}");
content = content.replace(/>Connectez votre propre domaine \(ex: www\.maboutique\.com\)\.</g, ">{isAr ? 'اربط النطاق الخاص بك (مثال: www.maboutique.com)' : 'Connectez votre propre domaine (ex: www.maboutique.com).'}<");
content = content.replace(/placeholder="ex: www\.maboutique\.com"/g, "placeholder={isAr ? 'مثال: www.maboutique.com' : 'ex: www.maboutique.com'}");
content = content.replace(/'Lier'/g, "isAr ? 'ربط' : 'Lier'");
content = content.replace(/>Configuration requise \(Namecheap, Hostinger\.\.\.\)</g, ">{isAr ? 'إعدادات مطلوبة (Namecheap, Hostinger...)' : 'Configuration requise (Namecheap, Hostinger...)'}<");
content = content.replace(
  /Pour que votre domaine fonctionne, ajoutez un <b>Enregistrement A \(A Record\)<\/b> chez votre fournisseur \(Namecheap, Hostinger\.\.\.\) avec ces informations :/g,
  "{isAr ? <>لكي يعمل نطاقك، أضف <b>سجل A (A Record)</b> عند مزود الخدمة الخاص بك (Namecheap, Hostinger...) بهذه المعلومات :</> : <>Pour que votre domaine fonctionne, ajoutez un <b>Enregistrement A (A Record)</b> chez votre fournisseur (Namecheap, Hostinger...) avec ces informations :</>}"
);

content = content.replace(/>Type</g, ">{isAr ? 'النوع' : 'Type'}<");
content = content.replace(/>Host \/ Nom</g, ">{isAr ? 'الاسم' : 'Host / Nom'}<");
content = content.replace(/>Valeur \/ IP</g, ">{isAr ? 'القيمة / IP' : 'Valeur / IP'}<");
content = content.replace(/>TTL</g, ">{isAr ? 'الوقت (TTL)' : 'TTL'}<");

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Arabic Translation Patch Applied!');
