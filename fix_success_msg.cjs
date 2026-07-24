const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const startTarget = "{page === 'success' && (";
const endTarget = "Thank you! Your order has been successfully sent to the BEYA ERP system.</p>";
const blockEnd = "           </div>\n        )}";

const indexOfEnd = c.indexOf(endTarget);
if (indexOfEnd !== -1) {
    const searchArea = c.substring(0, indexOfEnd);
    const startIndex = searchArea.lastIndexOf(startTarget);
    
    if (startIndex !== -1) {
        const fullEndIndex = c.indexOf(blockEnd, indexOfEnd) + blockEnd.length;
        
        const replacementSplitScreen = `{page === 'success' && (
           <div className={\`\${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]\`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-4xl font-black mb-3 text-slate-800 tracking-tight flex items-center gap-2 justify-center">
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-8 h-8 text-amber-400" />
              </h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? 'تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية فائقة. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن.'
                   : 'Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l\\'expédition.'}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-slate-400 text-sm font-semibold">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-indigo-400" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-px bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-emerald-400" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/20">
                 {storeIsAr ? 'العودة للصفحة الرئيسية' : 'Retour à l\\'accueil'}
              </button>
           </div>
        )}`;

        c = c.substring(0, startIndex) + replacementSplitScreen + c.substring(fullEndIndex);
        fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
        console.log("Successfully replaced LayoutSplitScreen success message!");
    } else {
        console.log("Could not find start index");
    }
} else {
    console.log("Could not find end target");
}
