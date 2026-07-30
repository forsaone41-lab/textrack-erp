const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

if (!c.includes('LogOut')) {
    c = c.replace('BarChart3 } from \'lucide-react\'', 'BarChart3, LogOut } from \'lucide-react\'');
}

if (!c.includes('setMerchantUser')) {
    c = c.replace(
        'const { isAr: adminIsAr } = useLang();',
        `const { isAr: adminIsAr } = useLang();\n  const [merchantUser, setMerchantUser] = useState<any>(null);\n  useEffect(() => {\n    supabase.auth.getUser().then(({ data }) => setMerchantUser(data.user));\n  }, []);`
    );
}

const replacementHtml = `      {/* Top Navigation / Back Button */}
      <div className="flex items-center justify-between mb-4">
         <button onClick={() => setBuilderMode('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            {isAr ? '→ العودة إلى لوحة المتاجر' : '← Retour aux Boutiques'}
         </button>
         
         {/* Profile / Logout */}
         {!isLiveStore && (
            <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-2xl shadow-sm border border-slate-200">
               <div className="hidden sm:block text-right pr-2 pl-3">
                  <p className="text-sm font-bold text-slate-900 leading-none">{merchantUser?.user_metadata?.full_name || 'Merchant'}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase mt-1 tracking-wider">{isAr ? 'مدير المتجر' : 'Gérant'}</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                  {(merchantUser?.user_metadata?.full_name || 'M').charAt(0).toUpperCase()}
               </div>
               <div className="w-px h-6 bg-slate-200 mx-1"></div>
               <button 
                 onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                 }}
                 className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                 title={isAr ? 'تسجيل الخروج' : 'Déconnexion'}
               >
                 <LogOut className="w-4 h-4" />
               </button>
            </div>
         )}
      </div>`;

c = c.replace(
    /\{\/\* Top Navigation \/ Back Button \*\/\}[\s\S]*?<\/div>/,
    replacementHtml
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
