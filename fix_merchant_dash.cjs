const fs = require('fs');
let c = fs.readFileSync('src/pages/MerchantDashboard.tsx', 'utf8');

c = c.replace(
  'import { useLang } from \'../contexts/LangContext\';',
  'import { useLang } from \'../contexts/LangContext\';\nimport { loadCompanyProfile } from \'../types\';'
);

c = c.replace(
  'const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);',
  'const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);\n  const company = loadCompanyProfile();\n  const proPrice = company.storeProPrice || \'299\';\n  const premiumPrice = company.storePremiumPrice || \'499\';'
);

c = c.replace(
  /isAr \? 'فترة تجريبية مجانية' : 'Essai Gratuit'/g,
  't(\'Essai Gratuit\', \'Free Trial\', \'فترة تجريبية مجانية\')'
);

c = c.replace(
  /isAr \? \`متبقي \$\{trialDaysLeft\} أيام في فترتك التجريبية.\` : \`Il vous reste \$\{trialDaysLeft\} jours d'essai.\`/g,
  't(`Il vous reste ${trialDaysLeft} jours d\\'essai.`, `You have ${trialDaysLeft} days left in your trial.`, `متبقي ${trialDaysLeft} أيام على انتهاء الفترة التجريبية.`)'
);

c = c.replace(
  /isAr \? 'ترقية الحساب الآن' : 'Mettre à niveau'/g,
  't(\'Mettre à niveau\', \'Upgrade Now\', \'ترقية الحساب الآن\')'
);

c = c.replace(
  /isAr \? 'اختر الباقة المناسبة لك' : 'Choisissez votre forfait'/g,
  't(\'Choisissez votre forfait\', \'Choose your plan\', \'اختر الباقة المناسبة لك\')'
);

c = c.replace(
  /isAr \? 'قم بترقية حسابك للوصول إلى كافة المزايا.' : 'Mettez à niveau votre compte pour accéder à toutes les fonctionnalités.'/g,
  't(\'Mettez à niveau votre compte pour accéder à toutes les fonctionnalités.\', \'Upgrade your account to access all features.\', \'قم بترقية حسابك للوصول إلى كافة الميزات.\')'
);

// PRO PLAN replacements
c = c.replace(
  '<span className=\"text-4xl font-black text-slate-900\">299</span>',
  '<span className=\"text-4xl font-black text-slate-900\">{proPrice}</span>'
);

c = c.replace(
  /isAr \? 'متجر إلكتروني احترافي' : 'Boutique professionnelle'/g,
  't(\'Boutique professionnelle\', \'Professional Store\', \'متجر إلكتروني احترافي\')'
);
c = c.replace(
  /isAr \? 'منتجات غير محدودة' : 'Produits illimités'/g,
  't(\'Produits illimités\', \'Unlimited Products\', \'منتجات غير محدودة\')'
);
c = c.replace(
  /isAr \? 'دعم فني عادي' : 'Support standard'/g,
  't(\'Support standard\', \'Standard Support\', \'دعم فني قياسي\')'
);
c = c.replace(
  /isAr \? 'اختيار باقة PRO' : 'Choisir le plan PRO'/g,
  't(\'Choisir le plan PRO\', \'Choose PRO plan\', \'اختيار باقة PRO\')'
);

// PREMIUM PLAN replacements
c = c.replace(
  '<span className=\"text-4xl font-black text-slate-900\">499</span>',
  '<span className=\"text-4xl font-black text-slate-900\">{premiumPrice}</span>'
);

c = c.replace(
  /isAr \? 'كل مزايا PRO' : 'Tous les avantages PRO'/g,
  't(\'Tous les avantages PRO\', \'All PRO benefits\', \'جميع مزايا PRO\')'
);
c = c.replace(
  /isAr \? 'أولوية في التصنيع' : 'Priorité de production'/g,
  't(\'Priorité de production\', \'Production Priority\', \'أولوية في التصنيع\')'
);
c = c.replace(
  /isAr \? 'مدير حساب شخصي' : 'Account manager dédié'/g,
  't(\'Account manager dédié\', \'Dedicated Account Manager\', \'مدير حساب شخصي\')'
);
c = c.replace(
  /isAr \? 'اختيار باقة PREMIUM' : 'Choisir le plan PREMIUM'/g,
  't(\'Choisir le plan PREMIUM\', \'Choose PREMIUM plan\', \'اختيار باقة PREMIUM\')'
);
c = c.replace(
  /isAr \? 'الأكثر طلباً' : 'Populaire'/g,
  't(\'POPULAIRE\', \'POPULAR\', \'الأكثر طلباً\')'
);

// Payments section
c = c.replace(
  /isAr \? 'طرق الدفع المتاحة \(المغرب\)' : 'Moyens de paiement \(Maroc\)'/g,
  't(\'Moyens de paiement (Maroc)\', \'Payment Methods (Morocco)\', \'طرق الدفع (المغرب)\')'
);
c = c.replace(
  /isAr \? 'بعد اختيار الباقة، سيتم توجيهك إلى واتساب لتأكيد الدفع. سيتم تفعيل حسابك بمجرد إرسال وصل الدفع.' : 'Après avoir choisi votre plan, vous serez redirigé vers WhatsApp pour confirmer. Votre compte sera activé dès l\\'envoi du reçu.'/g,
  't(\'Après avoir choisi votre plan, vous serez redirigé vers WhatsApp pour confirmer. Votre compte sera activé dès l\\\\\\'envoi du reçu.\', \'After choosing your plan, you will be redirected to WhatsApp to confirm.\', \'بعد اختيار الباقة، سيتم توجيهك إلى واتساب لتأكيد الدفع. سيتم تفعيل حسابك بمجرد إرسال وصل الدفع.\')'
);

fs.writeFileSync('src/pages/MerchantDashboard.tsx', c);
