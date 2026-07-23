const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add 'analytics' tab
const tabOrdersRegex = /\{ id: 'orders', icon: ListOrdered, label: isAr \? 'الطلبات' : 'Commandes' \},/;
if (!content.includes("{ id: 'analytics'")) {
    content = content.replace(tabOrdersRegex, `{ id: 'analytics', icon: TrendingUp, label: isAr ? 'لوحة PRO' : 'Dashboard' },\n                 { id: 'orders', icon: ListOrdered, label: isAr ? 'الطلبات' : 'Commandes' },`);
}

// 2. Extract Analytics PRO Section
const startString = '{/* Analytics PRO Section */}';
const endString = '{/* Recent Orders List */}';

const startIndex = content.indexOf(startString);
const endIndex = content.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
    const analyticsSection = content.substring(startIndex, endIndex);

    // Remove it from the current location (inside orders tab)
    content = content.replace(analyticsSection, '');

    // Now insert it into a new activeTab === 'analytics' block
    // We can put it right before the orders tab
    const ordersTabStart = "{activeTab === 'orders' && (";
    
    const newTabContent = `             {activeTab === 'analytics' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex items-center gap-4 mb-2">
                           <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                              <Crown className="w-6 h-6 text-amber-400 drop-shadow-md" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-black tracking-tight">{isAr ? 'لوحة التحكم الاحترافية' : 'Dashboard Premium'}</h2>
                              <p className="text-sm font-bold text-indigo-200 mt-1">{isAr ? 'تحليلات ذكية لمتجرك مدعومة بالبيانات.' : 'Des analyses intelligentes pour votre boutique.'}</p>
                           </div>
                        </div>
                     </div>
                     
                     ${analyticsSection}
                  </div>
              )}
              
              ${ordersTabStart}`;

    content = content.replace(ordersTabStart, newTabContent);

    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
    console.log('Successfully moved Analytics PRO section to a new Dashboard tab!');
} else {
    console.log('Could not find Analytics PRO section.');
}
