const fs = require('fs');

let content = fs.readFileSync('src/pages/MerchantDashboard.tsx', 'utf8');

// 1. Add states
if (!content.includes('showUpgradeModal')) {
    content = content.replace(
        `const [storeStats, setStoreStats] = useState({ visitors: 0, revenue: 0, orders: 0, convRate: 0 });`,
        `const [storeStats, setStoreStats] = useState({ visitors: 0, revenue: 0, orders: 0, convRate: 0 });\n  const [showUpgradeModal, setShowUpgradeModal] = useState(false);\n  const [trialDaysLeft, setTrialDaysLeft] = useState(14);`
    );
}

// 2. Add trial calculation in useEffect
if (!content.includes('const createdAt = new Date(data[0].created_at)')) {
    content = content.replace(
        `setStoreCount(data.length);`,
        `setStoreCount(data.length);\n               if (data[0].created_at) {\n                  const createdAt = new Date(data[0].created_at);\n                  const diffDays = Math.floor(Math.abs(new Date() - createdAt) / (1000 * 60 * 60 * 24));\n                  setTrialDaysLeft(Math.max(0, 14 - diffDays));\n               }`
    );
}

// 3. Add Trial Banner
const bannerCode = `
        {/* Trial Banner */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                 <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                 <h3 className="font-bold text-amber-900">{isAr ? 'فترة تجريبية مجانية' : 'Essai Gratuit'}</h3>
                 <p className="text-sm font-medium text-amber-700">
                    {isAr ? \`متبقي \${trialDaysLeft} أيام في فترتك التجريبية.\` : \`Il vous reste \${trialDaysLeft} jours d'essai.\`}
                 </p>
              </div>
           </div>
           <button onClick={() => setShowUpgradeModal(true)} className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap shadow-md shadow-amber-500/20">
              {isAr ? 'ترقية الحساب الآن' : 'Mettre à niveau'}
           </button>
        </div>
`;

if (!content.includes('Trial Banner')) {
    content = content.replace(
        `{/* Welcome Section */}`,
        `${bannerCode}\n        {/* Welcome Section */}`
    );
}

// 4. Add Upgrade Modal
const modalCode = `
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-6 md:p-8 bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex items-start justify-between relative z-10">
                  <div>
                     <h2 className="text-3xl font-black mb-2">{isAr ? 'اختر الباقة المناسبة لك' : 'Choisissez votre forfait'}</h2>
                     <p className="text-slate-400 font-medium">{isAr ? 'قم بترقية حسابك للوصول إلى كافة المزايا.' : 'Mettez à niveau votre compte pour accéder à toutes les fonctionnalités.'}</p>
                  </div>
                  <button onClick={() => setShowUpgradeModal(false)} className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md">
                     <X className="w-5 h-5" />
                  </button>
               </div>
            </div>
            
            <div className="p-6 md:p-8">
               <div className="grid md:grid-cols-2 gap-6">
                  {/* PRO Plan */}
                  <div className="border-2 border-slate-200 hover:border-indigo-500 rounded-3xl p-6 transition-all relative group flex flex-col">
                     <h3 className="text-xl font-black text-slate-900 mb-1">PRO</h3>
                     <div className="flex items-end gap-1 mb-4">
                        <span className="text-4xl font-black text-slate-900">299</span>
                        <span className="text-slate-500 font-bold mb-1">MAD / {isAr ? 'شهر' : 'mois'}</span>
                     </div>
                     <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div> {isAr ? 'متجر إلكتروني احترافي' : 'Boutique professionnelle'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div> {isAr ? 'منتجات غير محدودة' : 'Produits illimités'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div> {isAr ? 'دعم فني عادي' : 'Support standard'}</li>
                     </ul>
                     <a href="https://wa.me/212600000000?text=Je%20veux%20passer%20au%20plan%20PRO" target="_blank" rel="noreferrer" className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-center hover:bg-indigo-600 transition-colors block">
                        {isAr ? 'اختيار باقة PRO' : 'Choisir le plan PRO'}
                     </a>
                  </div>
                  
                  {/* PREMIUM Plan */}
                  <div className="border-2 border-amber-400 bg-amber-50/30 rounded-3xl p-6 transition-all relative flex flex-col shadow-lg shadow-amber-500/10">
                     <div className="absolute -top-4 right-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                        {isAr ? 'الأكثر طلباً' : 'Populaire'}
                     </div>
                     <h3 className="text-xl font-black text-amber-600 mb-1 flex items-center gap-2"><Crown className="w-5 h-5" /> PREMIUM</h3>
                     <div className="flex items-end gap-1 mb-4">
                        <span className="text-4xl font-black text-slate-900">499</span>
                        <span className="text-slate-500 font-bold mb-1">MAD / {isAr ? 'شهر' : 'mois'}</span>
                     </div>
                     <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><div className="w-2 h-2 bg-amber-500 rounded-full"></div></div> {isAr ? 'كل مزايا PRO' : 'Tous les avantages PRO'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><div className="w-2 h-2 bg-amber-500 rounded-full"></div></div> {isAr ? 'أولوية في التصنيع' : 'Priorité de production'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><div className="w-2 h-2 bg-amber-500 rounded-full"></div></div> {isAr ? 'مدير حساب شخصي' : 'Account manager dédié'}</li>
                     </ul>
                     <a href="https://wa.me/212600000000?text=Je%20veux%20passer%20au%20plan%20PREMIUM" target="_blank" rel="noreferrer" className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-center hover:opacity-90 transition-opacity shadow-md shadow-amber-500/25 block">
                        {isAr ? 'اختيار باقة PREMIUM' : 'Choisir le plan PREMIUM'}
                     </a>
                  </div>
               </div>
               
               <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h4 className="font-black text-slate-900 mb-4 text-center">{isAr ? 'طرق الدفع المتاحة (المغرب)' : 'Moyens de paiement (Maroc)'}</h4>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium text-slate-600">
                     <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        🏦 Virement Bancaire (CIH, Attijari, etc.)
                     </div>
                     <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        💸 Cash Plus / Wafacash
                     </div>
                  </div>
                  <p className="text-xs text-center text-slate-500 mt-4 max-w-lg mx-auto">
                     {isAr 
                        ? 'بعد اختيار الباقة، سيتم توجيهك إلى واتساب لتأكيد طلبك. سيتم تفعيل حسابك فور إرسال صورة وصل الدفع (Reçu).'
                        : 'Après avoir choisi votre plan, vous serez redirigé vers WhatsApp pour confirmer. Votre compte sera activé dès l\\'envoi du reçu.'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('Upgrade Modal')) {
    content = content.replace(
        `{/* Profile Modal */}`,
        `${modalCode}\n\n      {/* Profile Modal */}`
    );
}

// Add Crown import if missing
if (!content.includes('Crown,')) {
    content = content.replace('X, Send } from \'lucide-react\'', 'X, Send, Crown } from \'lucide-react\'');
}

// Since I just fetch config_json in the query, I need to fetch created_at too!
content = content.replace(".select('config_json')", ".select('config_json, created_at')");

fs.writeFileSync('src/pages/MerchantDashboard.tsx', content);
