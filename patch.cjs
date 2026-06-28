const fs = require('fs');
let c = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

c = c.replace(
  "💡 عندك أسئلة قبل ما تبدأ؟",
  "💡 عندك براند أو كدير التجارة الإلكترونية؟"
);

c = c.replace(
  "💡 Des questions avant de commencer ?",
  "💡 Vous avez une marque ou faites du E-commerce ?"
);

c = c.replace(
  "href=\"/#/info\"",
  "href=\"/#/devis-express\""
);

c = c.replace(
  "<span className=\"text-xl\">📋</span>",
  "<span className=\"text-xl\">🚀</span>"
);

c = c.replace(
  "تعرف على أسعارنا وخدماتنا",
  "احصل على عرض سعر سريع (Devis Express)"
);

c = c.replace(
  "Voir les Prix, Délais & Services",
  "Demander un Devis Express"
);

c = c.replace(
  "أسعار · مواعيد · أسئلة شائعة · كل ما تحتاج معرفته",
  "خدمة مخصصة وسريعة لأصحاب المشاريع والتجارة الإلكترونية"
);

c = c.replace(
  "Prix · Délais · FAQ · Tout ce que vous devez savoir",
  "Service rapide dédié aux marques et E-commerce"
);

fs.writeFileSync('src/pages/LandingPage.tsx', c);
console.log('done');
