const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const r = (from, to) => { 
  const before = content;
  content = content.split(from).join(to); 
  if (content === before) console.log('NOT FOUND:', from.slice(0, 70));
};

// Modal title
r("productForm?.id ? 'Modifier le Produit' : 'Créer un Produit'",
  "productForm?.id ? (storeIsAr ? 'تعديل المنتج' : 'Modifier le Produit') : (storeIsAr ? 'إضافة منتج جديد' : 'Créer un Produit')");

// Subtitle
r(">Détails, inventaire, et variantes de votre article.</p>",
  ">{storeIsAr ? 'التفاصيل، المخزون، والمتغيرات.' : 'Détails, inventaire, et variantes de votre article.'}</p>");

// Image du Produit
r(">Image du Produit</label>",
  ">{storeIsAr ? 'صورة المنتج' : 'Image du Produit'}</label>");

// Informations Générales
r(">Informations Générales</label>",
  ">{storeIsAr ? 'المعلومات الأساسية' : 'Informations Générales'}</label>");

// Product title placeholder
r("placeholder=\"Titre du produit (ex: Premium T-Shirt)\"",
  "placeholder={storeIsAr ? 'اسم المنتج (مثال: قميص فاخر)' : 'Titre du produit (ex: Premium T-Shirt)'}");

// Prix
r(">Prix (MAD)</label>",
  ">{storeIsAr ? 'السعر (درهم)' : 'Prix (MAD)'}</label>");

// Stock
r(">Stock (Quantité)</label>",
  ">{storeIsAr ? 'المخزون (الكمية)' : 'Stock (Quantité)'}</label>");

// Description label
r(">Description</label>",
  ">{storeIsAr ? 'الوصف' : 'Description'}</label>");

// Description placeholder
r("placeholder=\"Décrivez votre produit en détail...\"",
  "placeholder={storeIsAr ? 'اوصف منتجك بالتفصيل...' : 'Décrivez votre produit en détail...'}");

// Variantes
r(">Variantes (Tailles & Couleurs)</label>",
  ">{storeIsAr ? 'المتغيرات (المقاسات والألوان)' : 'Variantes (Tailles & Couleurs)'}</label>");

// Tailles
r(">Tailles Disponibles</label>",
  ">{storeIsAr ? 'المقاسات المتاحة' : 'Tailles Disponibles'}</label>");

// Size placeholder
r("placeholder=\"Ex: XXL, 42, 6 Ans...\"",
  "placeholder={storeIsAr ? 'مثال: XXL, 42, 6 سنوات...' : 'Ex: XXL, 42, 6 Ans...'}");

// Ajouter buttons (size and color)
r("rounded-lg hover:bg-slate-800 transition-colors\">Ajouter</button>",
  "rounded-lg hover:bg-slate-800 transition-colors\">{storeIsAr ? 'إضافة' : 'Ajouter'}</button>",
  true);

// Couleurs Disponibles
r(">Couleurs Disponibles</label>",
  ">{storeIsAr ? 'الألوان المتاحة' : 'Couleurs Disponibles'}</label>");

// Images par Couleur
r(">Images par Couleur (Optionnel)</label>",
  ">{storeIsAr ? 'صور لكل لون (اختياري)' : 'Images par Couleur (Optionnel)'}</label>");

// Image Variante
r(">Image Variante</span>",
  ">{storeIsAr ? 'صورة المتغير' : 'Image Variante'}</span>");

// Changer / Lier une image
r("productForm?.colorImages?.[color] ? 'Changer' : 'Lier une image'",
  "productForm?.colorImages?.[color] ? (storeIsAr ? 'تغيير' : 'Changer') : (storeIsAr ? 'ربط صورة' : 'Lier une image')");

// Stock par Variante
r(">Stock par Variante</label>",
  ">{storeIsAr ? 'المخزون لكل متغير' : 'Stock par Variante'}</label>");

// Table headers
r(">Variante</th>",
  ">{storeIsAr ? 'المتغير' : 'Variante'}</th>");
r(">Quantité (Stock)</th>",
  ">{storeIsAr ? 'الكمية (المخزون)' : 'Quantité (Stock)'}</th>");

// Couleur word in row
r(">Couleur</span>",
  ">{storeIsAr ? 'لون' : 'Couleur'}</span>");

// Catégorie
r(">Catégorie</label>",
  ">{storeIsAr ? 'الفئة' : 'Catégorie'}</label>");

// Category placeholder
r("placeholder=\"Ex: T-Shirt, Chemise, Robe...\"",
  "placeholder={storeIsAr ? 'مثال: قميص, جاكيت, فستان...' : 'Ex: T-Shirt, Chemise, Robe...'}");

// Category hint
r(">Permet de classer le produit dans les filtres du magasin.</p>",
  ">{storeIsAr ? 'لتصنيف المنتج في فلاتر المتجر.' : 'Permet de classer le produit dans les filtres du magasin.'}</p>");

// Annuler button
r(">Annuler</button>",
  ">{storeIsAr ? 'إلغاء' : 'Annuler'}</button>");

// Save/Update button text
r("productForm?.id ? 'Mettre à jour' : 'Enregistrer le produit'",
  "productForm?.id ? (storeIsAr ? 'تحديث المنتج' : 'Mettre à jour') : (storeIsAr ? 'حفظ المنتج' : 'Enregistrer le produit')");

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Product modal translated!');
