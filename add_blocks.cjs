const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add blocks to blockDefs
const blockDefsRegex = /const blockDefs = \[\s*\{ id: 'hero'/;
if (content.match(blockDefsRegex) && !content.includes("{ id: 'features'")) {
    content = content.replace(blockDefsRegex, `const blockDefs = [\n                         { id: 'features', name: isAr ? 'ميزات' : 'Avantages', icon: ShieldCheck, activeClasses: 'border-blue-500 shadow-md ring-2 ring-blue-100', bgClasses: 'bg-blue-50 text-blue-500', checkClass: 'text-blue-500' },\n                         { id: 'newsletter', name: isAr ? 'النشرة البريدية' : 'Newsletter', icon: Mail, activeClasses: 'border-purple-500 shadow-md ring-2 ring-purple-100', bgClasses: 'bg-purple-50 text-purple-500', checkClass: 'text-purple-500' },\n                         { id: 'hero'`);
}

// 2. Add render blocks to the mappings
const renderString = `if (block === 'newsletter') return (
                    <div key="newsletter" className="w-full py-16 px-4" style={{ backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                        <div className="max-w-xl mx-auto text-center space-y-6">
                            <h3 className="text-2xl font-black">{storeIsAr ? 'اشترك في النشرة البريدية' : 'Abonnez-vous à notre newsletter'}</h3>
                            <div className="flex flex-col gap-4">
                               <input type="email" placeholder={storeIsAr ? 'أدخل بريدك الإلكتروني' : 'Saisissez votre adresse électronique'} className="w-full bg-transparent border-b border-black py-3 px-2 text-sm outline-none text-center" />
                               <button className="w-full border border-black py-3 text-sm font-bold hover:bg-black hover:text-white transition-colors">{storeIsAr ? 'اشتراك' : 'S\\'abonner'}</button>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-500">
                               <input type="checkbox" id="news-agree" />
                               <label htmlFor="news-agree">{storeIsAr ? 'أوافق على الشروط والسياسات' : 'J\\'accepte les conditions générales et la politique de confidentialité'}</label>
                            </div>
                        </div>
                    </div>
                );

                if (block === 'features') return (
                    <div key="features" className="w-full py-10 px-4" style={{ backgroundColor: '#fafafa' }}>
                        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div className="flex flex-col items-center gap-3">
                               <RefreshCw className="w-6 h-6 stroke-[1.5]" />
                               <p className="text-[10px] font-bold">{storeIsAr ? 'إرجاع سريع خلال 7 أيام' : 'Retour rapide sous 7 jours'}</p>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                               <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
                               <p className="text-[10px] font-bold">{storeIsAr ? 'دفع آمن ومضمون' : 'Paiement sécurisé'}</p>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                               <Package className="w-6 h-6 stroke-[1.5]" />
                               <p className="text-[10px] font-bold">{storeIsAr ? 'توصيل مجاني' : 'Livraison offerte dès 799 Dhs d\\'achat'}</p>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                               <Smartphone className="w-6 h-6 stroke-[1.5]" />
                               <p className="text-[10px] font-bold">{storeIsAr ? 'مساعدة' : 'Aide'}<br/>06 62 15 30 86</p>
                            </div>
                        </div>
                    </div>
                );`;

// Let's inject it before `if (block === 'products')` to be safe, there are 2 places.
const replaceTarget = `if (block === 'products') return`;

if (content.match(/if \(block === 'products'\) return/g)) {
   content = content.replace(/if \(block === 'products'\) return/g, `${renderString}\n                if (block === 'products') return`);
   console.log("Render logic injected successfully.");
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
