const fs = require('fs');

let c = fs.readFileSync('src/pages/FichesTechniques.tsx', 'utf8');

// 1. Add currentUser
if (!c.includes("const currentUser = JSON.parse(localStorage.getItem('textrack_auth') || '{}') as User;")) {
  c = c.replace(/export default function FichesTechniques\(\) \{/, 
  `export default function FichesTechniques() {\n  const currentUser = JSON.parse(localStorage.getItem('textrack_auth') || '{}') as User;`);
}

// 2. Add modelistes state
if (!c.includes('const [modelistes, setModelistes] = useState<User[]>(')) {
  c = c.replace(/const \[clients, setClients\] = useState<any\[\]>\(\[\]\);/, 
  `const [clients, setClients] = useState<any[]>([]);\n  const [modelistes, setModelistes] = useState<User[]>([]);`);
}

// 3. Populate modelistes
if (!c.includes("setModelistes(u.filter((x: any) => x.role === 'modeliste'));")) {
  c = c.replace(/setClients\(u\.filter\(\(x: any\) => x\.role === 'client'\)\);/, 
  `setClients(u.filter((x: any) => x.role === 'client'));\n      setModelistes(u.filter((x: any) => x.role === 'modeliste'));`);
}

// 4. Modify filtered logic
const oldFiltered = `const filtered = fiches.filter(f =>
    f.modele.toLowerCase().includes(search.toLowerCase()) ||
    f.client.toLowerCase().includes(search.toLowerCase())
  );`;
const newFiltered = `const filtered = fiches.filter(f => {
    if (currentUser?.role === 'modeliste' && f.modelisteId !== currentUser.id) return false;
    return f.modele.toLowerCase().includes(search.toLowerCase()) ||
           f.client.toLowerCase().includes(search.toLowerCase());
  });`;
c = c.replace(oldFiltered, newFiltered);

// 5. Add modeliste select in form
const oldClientField = `                  <label className={\`block text-xs font-semibold text-slate-600 mb-1.5 \${isAr ? 'text-right' : ''}\`}>{t('client_label', lang)} *</label>
                  <select
                    value={form.clientId || (clients.find(c => c.nom === form.client)?.id) || ''}`;
const newClientField = `                  <label className={\`block text-xs font-semibold text-slate-600 mb-1.5 \${isAr ? 'text-right' : ''}\`}>{t('client_label', lang)} *</label>
                  <select
                    value={form.clientId || (clients.find(c => c.nom === form.client)?.id) || ''}`;
                    
if (!c.includes('form.modelisteId')) {
  // Let's find the closing div of the client select
  const searchPattern = /<\/select>\s*<\/div>\s*<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">/g;
  
  c = c.replace(searchPattern, 
`</select>
                </div>
                {currentUser?.role !== 'modeliste' && (
                  <div className="mb-3">
                    <label className={\`block text-xs font-semibold text-slate-600 mb-1.5 \${isAr ? 'text-right' : ''}\`}>
                      {isAr ? 'تعيين موديلست (اختياري)' : 'Assigner Modéliste (Optionnel)'}
                    </label>
                    <select
                      value={form.modelisteId || ''}
                      onChange={e => setForm({ ...form, modelisteId: e.target.value })}
                      className={\`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors \${isAr ? 'text-right' : ''}\`}
                    >
                      <option value="">{isAr ? '-- غير معين --' : '-- Non assigné --'}</option>
                      {modelistes.map(m => (
                        <option key={m.id} value={m.id}>{m.nom} {m.telephone ? \`(\${m.telephone})\` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">`
  );
}

fs.writeFileSync('src/pages/FichesTechniques.tsx', c);
