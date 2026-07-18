const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Back button
content = content.replace(
  '← Retour à BEYA ERP',
  "{storeIsAr ? '→ العودة إلى BEYA ERP' : '← Retour à BEYA ERP'}"
);

// 2. SaaS Builder Active
content = content.replace(
  '>SaaS Builder Active<',
  ">{storeIsAr ? 'المتجر نشط' : 'SaaS Builder Active'}<"
);

// 3. App Store BEYA title
content = content.replace(
  '>App Store BEYA</h4>',
  ">{storeIsAr ? 'متجر تطبيقات BEYA' : 'App Store BEYA'}</h4>"
);

// 4. App Store description
content = content.replace(
  '>Développez votre boutique avec nos plugins 1-clic (Similaires aux apps Shopify).</p>',
  ">{storeIsAr ? 'طوّر متجرك بإضافات بنقرة واحدة (مثل تطبيقات Shopify).' : 'Développez votre boutique avec nos plugins 1-clic (Similaires aux apps Shopify).'}</p>"
);

// 5. App items - add descAr field
content = content.replace(
  "{ name: 'WhatsApp Chat', desc: 'Discutez avec vos clients en direct', icon: '💬', color: 'bg-green-100 text-green-600' },",
  "{ name: 'WhatsApp Chat', desc: 'Discutez avec vos clients en direct', descAr: 'تواصل مع عملائك مباشرة', icon: '💬', color: 'bg-green-100 text-green-600' },"
);
content = content.replace(
  "{ name: 'Facebook Pixel', desc: 'Suivez vos conversions Facebook Ads', icon: 'f', color: 'bg-blue-100 text-blue-600 font-serif' },",
  "{ name: 'Facebook Pixel', desc: 'Suivez vos conversions Facebook Ads', descAr: 'تتبع تحويلات إعلانات فيسبوك', icon: 'f', color: 'bg-blue-100 text-blue-600 font-serif' },"
);
content = content.replace(
  "{ name: 'TikTok Pixel', desc: 'Optimisez vos campagnes TikTok', icon: '♪', color: 'bg-black text-white' },",
  "{ name: 'TikTok Pixel', desc: 'Optimisez vos campagnes TikTok', descAr: 'حسّن حملاتك الإعلانية على TikTok', icon: '♪', color: 'bg-black text-white' },"
);
content = content.replace(
  "{ name: 'Google Analytics 4', desc: 'Analysez votre trafic en temps réel', icon: 'G', color: 'bg-orange-100 text-orange-600 font-serif' },",
  "{ name: 'Google Analytics 4', desc: 'Analysez votre trafic en temps réel', descAr: 'حلّل زيارات موقعك في الوقت الحقيقي', icon: 'G', color: 'bg-orange-100 text-orange-600 font-serif' },"
);
content = content.replace(
  "{ name: 'Mailchimp Sync', desc: 'Synchronisez vos clients pour l\\'emailing', icon: 'M', color: 'bg-yellow-100 text-yellow-600 font-serif' },",
  "{ name: 'Mailchimp Sync', desc: \"Synchronisez vos clients pour l'emailing\", descAr: 'زامن قائمة عملائك للتسويق بالبريد', icon: 'M', color: 'bg-yellow-100 text-yellow-600 font-serif' },"
);

// 6. Show desc using storeIsAr
content = content.replace(
  '<p className="text-[10px] text-slate-500 mt-1">{app.desc}</p>',
  '<p className="text-[10px] text-slate-500 mt-1">{storeIsAr ? (app.descAr || app.desc) : app.desc}</p>'
);

// 7. Ajouter button in apps
content = content.replace(
  'transition-colors shadow-sm">Ajouter</button>',
  'transition-colors shadow-sm">{storeIsAr ? \'إضافة\' : \'Ajouter\'}</button>'
);

// 8. Ajouter button in pages
content = content.replace(
  '>\n                             Ajouter\n                           </button>',
  '>\n                             {storeIsAr ? \'إضافة\' : \'Ajouter\'}\n                           </button>'
);

// 9. Buy mode options
content = content.replace(
  "Afficher 'Ajouter au panier' & 'Acheter direct'",
  "{storeIsAr ? \"عرض 'أضف للسلة' و'اشتري الآن'\" : \"Afficher 'Ajouter au panier' & 'Acheter direct'\"}"
);
content = content.replace(
  "Uniquement 'Ajouter au panier' (Classique)",
  "{storeIsAr ? \"فقط 'أضف للسلة' (كلاسيكي)\" : \"Uniquement 'Ajouter au panier' (Classique)\"}"
);

// 10. Ajouter une image
content = content.replace(
  '>Ajouter une image<',
  ">{storeIsAr ? 'إضافة صورة' : 'Ajouter une image'}<"
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Translation patch applied!');
