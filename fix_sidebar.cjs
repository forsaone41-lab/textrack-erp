const fs = require('fs'); 
let c = fs.readFileSync('src/components/Sidebar.tsx', 'utf8'); 
c = c.replace(/<div className=\"flex items-center gap-3 mb-4\">\s*<div className=\"w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500\/20\">\s*<ShieldCheck className=\"w-5 h-5 text-white\" \/>\s*<\/div>\s*<div className=\"flex flex-col min-w-0\">\s*<span className=\"text-xs font-bold text-white truncate\">\{currentUser\.nom \|\| 'Admin'\}<\/span>\s*<span className=\"text-\[9px\] font-black text-indigo-400 uppercase tracking-widest\">\s*\{currentUser\.role\}\s*<\/span>\s*<\/div>\s*<\/div>/g, 
`<NavLink to="/profil" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden border-2 border-indigo-500/30">
                    {currentUser.photo ? (
                      <img src={currentUser.photo} className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{currentUser.nom || 'Admin'}</span>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                      {currentUser.role}
                    </span>
                  </div>
                </NavLink>`); 
fs.writeFileSync('src/components/Sidebar.tsx', c);
