const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// The legal page is repeated or we can just replace the strings globally.
const replacements = {
  ">Dernière mise à jour : ": ">{storeIsAr ? 'آخر تحديث : ' : 'Dernière mise à jour : '}",
  ">1. Collecte des données<": ">{storeIsAr ? '1. جمع البيانات' : '1. Collecte des données'}<",
  ">2. Utilisation<": ">{storeIsAr ? '2. الاستخدام' : '2. Utilisation'}<",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.": "{storeIsAr ? 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.'}",
  "Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim.": "{storeIsAr ? 'إذا كنت تحتاج إلى عدد أكبر من الفقرات يتيح لك مولد النص العربى زيادة عدد الفقرات كما تريد، النص لن يبدو مقسما ولا يحوي أخطاء لغوية، مولد النص العربى مفيد لمصممي المواقع على وجه الخصوص.' : 'Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim.'}",
  "Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede.": "{storeIsAr ? 'حيث يحتاج العميل فى كثير من الأحيان أن يطلع على صورة حقيقية لتصميم الموقع. ومن هنا وجب على المصمم أن يضع نصوصا مؤقتة على التصميم ليظهر للعميل الشكل كاملاً.' : 'Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede.'}"
};

for (const [key, val] of Object.entries(replacements)) {
  content = content.split(key).join(val);
}

// Ensure the page titles for privacy/terms/cookies are translated
content = content.replace(
  "{page === 'privacy' ? 'Politique de Confidentialité' : page === 'terms' ? 'Conditions Générales' : 'Politique des Cookies'}",
  "{page === 'privacy' ? (storeIsAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité') : page === 'terms' ? (storeIsAr ? 'الشروط والأحكام' : 'Conditions Générales') : (storeIsAr ? 'سياسة ملفات الارتباط' : 'Politique des Cookies')}"
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Legal pages translated!');
