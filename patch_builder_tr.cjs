const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const builderReplacements = {
  // Footer settings
  "Texte du Copyright": "{storeIsAr ? 'نص حقوق النشر' : 'Texte du Copyright'}",
  "Pages Légales (Générées Automatiquement)": "{storeIsAr ? 'الصفحات القانونية (تم إنشاؤها تلقائياً)' : 'Pages Légales (Générées Automatiquement)'}",
  "Pied de page (Footer)": "{storeIsAr ? 'تذييل الصفحة (Footer)' : 'Pied de page (Footer)'}",
  "Gestion des Pages": "{storeIsAr ? 'إدارة الصفحات' : 'Gestion des Pages'}",
  "Titre (ex: Contact)": "{storeIsAr ? 'العنوان (مثل: اتصل بنا)' : 'Titre (ex: Contact)'}",
  "Système": "{storeIsAr ? 'نظام' : 'Système'}",
  
  // Footer checkboxes text (span content)
  '<span className="text-sm font-bold text-slate-700">Politique de Confidentialité</span>': '<span className="text-sm font-bold text-slate-700">{storeIsAr ? \'سياسة الخصوصية\' : \'Politique de Confidentialité\'}</span>',
  '<span className="text-sm font-bold text-slate-700">Conditions Générales de Vente (CGV)</span>': '<span className="text-sm font-bold text-slate-700">{storeIsAr ? \'الشروط والأحكام\' : \'Conditions Générales de Vente (CGV)\'}</span>',
  '<span className="text-sm font-bold text-slate-700">Politique des Cookies</span>': '<span className="text-sm font-bold text-slate-700">{storeIsAr ? \'سياسة ملفات الارتباط\' : \'Politique des Cookies\'}</span>',
  
  // Buttons
  "Ajouter": "{storeIsAr ? 'إضافة' : 'Ajouter'}",
  "Publier": "{storeIsAr ? 'نشر' : 'Publier'}",
  "Prévisualiser": "{storeIsAr ? 'معاينة' : 'Prévisualiser'}",
  "Enregistrer": "{storeIsAr ? 'حفظ' : 'Enregistrer'}",
  "SÉCURISÉ": "{storeIsAr ? 'آمن' : 'SÉCURISÉ'}",
  "SAAS ÉDITION": "{storeIsAr ? 'نسخة الساس' : 'SAAS ÉDITION'}",
  
  // Mode d'Achat
  "Mode d'Achat (Boutons)": "{storeIsAr ? 'طريقة الشراء (الأزرار)' : \"Mode d'Achat (Boutons)\"}",
  "Uniquement 'Acheter direct' (Express)": "{storeIsAr ? \"فقط 'شراء مباشر' (سريع)\" : \"Uniquement 'Acheter direct' (Express)\"}",
  "Formulaire intégré (Express sur la page)": "{storeIsAr ? \"نموذج مدمج (سريع في نفس الصفحة)\" : \"Formulaire intégré (Express sur la page)\"}",
};

for (const [key, val] of Object.entries(builderReplacements)) {
  content = content.replace(new RegExp(`(?<!\\{tr\\(')${key.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&')}(?!'\\))`, 'g'), val);
}

// Ensure the page titles like 'Home', 'Collections', 'About' in the management list are translated.
// They are rendered as `{page.title}` in the management list (line 1854)
content = content.replace(
  /<span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">\{page.title\}<\/span>/g,
  '<span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{tr(page.title)}</span>'
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Builder strings translated!');
