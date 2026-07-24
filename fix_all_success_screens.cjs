const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

function replaceBlock(layoutName, replacementText) {
    const startLayout = c.indexOf("const " + layoutName + " ");
    if (startLayout === -1) {
        console.log("Could not find", layoutName);
        return;
    }
    
    // Find the {page === 'success' block
    const startStr = "{page === 'success' && (";
    const startBlock = c.indexOf(startStr, startLayout);
    
    if (startBlock === -1) {
        console.log("Could not find success block in", layoutName);
        return;
    }
    
    // Alternative: find the next )} after startBlock
    const blockEnd = c.indexOf(")}", startBlock + 10);
    if (blockEnd === -1) {
        console.log("Could not find block end in", layoutName);
        return;
    }
    
    const endOfBlockIndex = blockEnd + 2; 
    
    c = c.substring(0, startBlock) + replacementText + c.substring(endOfBlockIndex);
    console.log("Successfully replaced success block in", layoutName);
}

replaceBlock('LayoutHeroCenter', `{page === 'success' && (
           <div className={\`\${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px] py-20\`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-4xl font-light mb-3 tracking-tight flex items-center gap-2 justify-center" style={{ color: primaryColor }}>
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-8 h-8 text-amber-400" />
              </h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية فائقة. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l'expédition."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-slate-400 text-sm font-semibold">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-indigo-400" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-px bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-emerald-400" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-10 py-4 border border-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">
                 {storeIsAr ? "العودة للصفحة الرئيسية" : "RETOUR À L'ACCUEIL"}
              </button>
           </div>
        )}`);

replaceBlock('LayoutElegant', `{page === 'success' && (
           <div className={\`\${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px] py-20\`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-900/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-10" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-4xl font-serif mb-3 text-white tracking-wide flex items-center gap-2 justify-center">
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-8 h-8 text-amber-500" />
              </h2>
              <p className="text-[#888] text-lg max-w-md mx-auto leading-relaxed mb-8 font-light">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-[#666] text-sm font-medium tracking-wider">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-[#b48a44]" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'PRÉPARATION'}</span></div>
                 <div className="w-12 h-px bg-[#333]"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-[#b48a44]" /> <span>{storeIsAr ? 'شحن سريع' : 'EXPÉDITION'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-10 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors">
                 {storeIsAr ? "العودة للرئيسية" : "RETOUR"}
              </button>
           </div>
        )}`);

replaceBlock('LayoutPlayful', `{page === 'success' && (
           <div className={\`\${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]\`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative border-4 border-white">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-5xl font-black mb-3 text-slate-800 tracking-tight flex items-center gap-2 justify-center" style={{ color: primaryColor }}>
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-10 h-10 text-amber-400" />
              </h2>
              <p className="text-slate-500 text-xl font-bold max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية فائقة. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l'expédition."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-slate-400 text-sm font-bold">
                 <div className="flex flex-col items-center gap-2"><Package className="w-8 h-8 text-indigo-400" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-2 rounded-full bg-slate-100"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-8 h-8 text-emerald-400" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="mt-8 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg">
                 {storeIsAr ? "العودة للمرح" : "Retour au magasin"}
              </button>
           </div>
        )}`);

replaceBlock('LayoutClement', `{page === 'success' && (
           <div className="p-16 max-w-2xl mx-auto my-8 bg-white border border-[#eee] text-center flex flex-col items-center justify-center shadow-sm min-h-[400px]">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mb-4 flex items-center gap-2 justify-center">
                  {storeIsAr ? 'تم تأكيد طلبك' : 'Commande Confirmée !'} <Sparkles className="w-6 h-6 text-amber-400" />
              </h2>
              <p className="text-[#666] text-lg max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l'expédition."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-[#888] text-sm font-semibold uppercase tracking-wider">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-[#1a1a1a]" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-px bg-[#eee]"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-[#1a1a1a]" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-8 py-3 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors">
                 {storeIsAr ? "العودة للرئيسية" : "Retour à l'accueil"}
              </button>
           </div>
        )}`);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
