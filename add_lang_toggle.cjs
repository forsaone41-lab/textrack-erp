const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

c = c.replace(
  'const { isAr: adminIsAr } = useLang();',
  'const { isAr: adminIsAr, toggleLang } = useLang();'
);

c = c.replace(
  'const isAr = storeIsAr;\n  void adminIsAr;',
  'const isAr = adminIsAr;'
);

const oldHeader = `         {/* Profile / Logout */}
         {!isLiveStore && (
            <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-2xl shadow-sm border border-slate-200">
               <div className="hidden sm:block text-right pr-2 pl-3">`;

const newHeader = `         {/* Profile / Logout */}
         {!isLiveStore && (
            <div className="flex items-center gap-3">
               <button 
                  onClick={toggleLang}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm h-[44px]"
                  title={isAr ? 'Changer en Français' : 'التبديل للعربية'}
               >
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">{isAr ? 'Français' : 'العربية'}</span>
               </button>
               
               <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-2xl shadow-sm border border-slate-200 h-[44px]">
                  <div className="hidden sm:block text-right pr-2 pl-3">`;

c = c.replace(oldHeader, newHeader);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
