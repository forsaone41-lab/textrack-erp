const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add tr() function right after storeIsAr declaration
if (!content.includes('const tr = (t: string) => {')) {
  content = content.replace(
    "const storeIsAr = storeLang === 'ar';",
    `const storeIsAr = storeLang === 'ar';
  
  const tr = (t: string) => {
     if (!storeIsAr) return t;
     const dict: Record<string, string> = {
        'New Collection': 'تشكيلة جديدة',
        'Discover our latest premium quality garments.': 'اكتشف أحدث تشكيلاتنا ذات الجودة العالية.',
        'Shop Now': 'تسوق الآن',
        'Trending Now': 'الأكثر مبيعاً',
        'All Products': 'جميع المنتجات',
        'Home': 'الرئيسية',
        'Collections': 'التشكيلات',
        'About': 'من نحن',
        '© 2026 My Brand. Tous droits réservés.': '© 2026 My Brand. جميع الحقوق محفوظة.',
        'Accueil': 'الرئيسية',
        'Produits': 'المنتجات'
     };
     return dict[t] || t;
  };`
  );
}

// 2. Update EditableText to use tr()
content = content.replace(
  "const EditableText = ({ text, onTextChange, isLiveStore, className, as: Tag = 'span', ...props }: any) => {",
  `const EditableText = ({ text, onTextChange, isLiveStore, className, as: Tag = 'span', ...props }: any) => {
     const displayText = tr(text);`
);
content = content.replace(
  "if (isLiveStore) return <Tag className={className} {...props}>{text}</Tag>;",
  "if (isLiveStore) return <Tag className={className} {...props}>{displayText}</Tag>;"
);
// Make sure we replace only inside EditableText component (contentEditable span)
content = content.replace(
  /empty:before:content-\['Vide'\]/g,
  "empty:before:content-['${storeIsAr ? \\'فارغ\\' : \\'Vide\\'}']"
);
content = content.replace(
  />\s*\{text\}\s*<\/Tag>/g, // this will match >{text}</Tag> in EditableText
  ">{displayText}</Tag>"
);

// 3. Update storePages.map to use tr(p.title)
content = content.replace(
  /\{p\.title\}/g,
  "{tr(p.title)}"
);

// 4. Update Changer l'image and Changer le logo
content = content.replace(
  /"Changer le logo"/g,
  "{storeIsAr ? 'تغيير الشعار' : 'Changer le logo'}"
);
content = content.replace(
  />\s*Changer l'image/g,
  ">{storeIsAr ? 'تغيير الصورة' : \"Changer l'image\"}"
);

// 5. Update ThemeFooter
content = content.replace(
  />Politique de Confidentialité<\/button>/g,
  ">{storeIsAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}</button>"
);
content = content.replace(
  />Conditions Générales<\/button>/g,
  ">{storeIsAr ? 'الشروط والأحكام' : 'Conditions Générales'}</button>"
);
content = content.replace(
  />Politique des Cookies<\/button>/g,
  ">{storeIsAr ? 'سياسة ملفات الارتباط' : 'Politique des Cookies'}</button>"
);

// 6. Global Site Hardcoded French texts replacements
// We'll run global replacements for common strings across all layouts
const replacements = {
  "à partir de": "{storeIsAr ? 'ابتداءً من' : 'à partir de'}",
  "MAD<": "MAD<", // Keep MAD
  ">Couleur<": ">{storeIsAr ? 'لون' : 'Couleur'}<",
  ">Taille<": ">{storeIsAr ? 'المقاس' : 'Taille'}<",
  ">Quantité<": ">{storeIsAr ? 'الكمية' : 'Quantité'}<",
  ">Ajouter au panier<": ">{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}<",
  ">Acheter Maintenant<": ">{storeIsAr ? 'اشتري الآن' : 'Acheter Maintenant'}<",
  ">Achat Express<": ">{storeIsAr ? 'شراء سريع' : 'Achat Express'}<",
  "placeholder=\"Nom Complet\"": "placeholder={storeIsAr ? 'الاسم الكامل' : 'Nom Complet'}",
  "placeholder=\"Numéro de Téléphone\"": "placeholder={storeIsAr ? 'رقم الهاتف' : 'Numéro de Téléphone'}",
  "placeholder=\"Ville\"": "placeholder={storeIsAr ? 'المدينة' : 'Ville'}",
  "placeholder=\"Adresse de Livraison\"": "placeholder={storeIsAr ? 'عنوان التوصيل' : 'Adresse de Livraison'}",
  ">Confirmer la Commande<": ">{storeIsAr ? 'تأكيد الطلب' : 'Confirmer la Commande'}<",
  ">Commande Confirmée<": ">{storeIsAr ? 'تم تأكيد الطلب' : 'Commande Confirmée'}<",
  ">Merci de votre confiance. Nous vous contacterons bientôt.<": ">{storeIsAr ? 'شكرا لثقتك. سنتصل بك قريباً.' : 'Merci de votre confiance. Nous vous contacterons bientôt.'}<",
  ">Retour à l'accueil<": ">{storeIsAr ? 'العودة للرئيسية' : \"Retour à l'accueil\"}<",
  "alert('Ajouté aux favoris')": "alert(storeIsAr ? 'تمت الإضافة للمفضلة' : 'Ajouté aux favoris')",
  "alert('Panier cliqué !')": "alert(storeIsAr ? 'تم النقر على السلة!' : 'Panier cliqué !')"
};

for (const [key, val] of Object.entries(replacements)) {
  content = content.split(key).join(val);
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Site translated successfully!');
