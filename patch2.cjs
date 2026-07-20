const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Add isStoreCreated state
content = content.replace(
    "const [domainError, setDomainError] = useState('');",
    "const [domainError, setDomainError] = useState('');\n  const [isStoreCreated, setIsStoreCreated] = useState(!!config.storeName);"
);

// Update handleSave to include validation and isStoreCreated
content = content.replace(
    "const handleSave = async () => {\n    setIsSaving(true);",
    "const handleSave = async () => {\n    if (!storeName || !storeName.trim()) {\n        alert(storeIsAr ? '???? ????? ??? ??????? ????? ???? ??????.' : 'Veuillez d\\'abord saisir le nom de la marque.');\n        return;\n    }\n    setIsSaving(true);"
);

content = content.replace(
    "localStorage.setItem('beya_store_config', JSON.stringify(storeConfig));\n    // Simulate saving delay\n    setTimeout(() => {\n      setIsSaving(false);",
    "localStorage.setItem('beya_store_config', JSON.stringify(storeConfig));\n    setIsStoreCreated(true);\n    // Simulate saving delay\n    setTimeout(() => {\n      setIsSaving(false);"
);

// Hide buttons
content = content.replace(
    "          <button onClick={() => setShowPreview(true)} className=\"flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-black hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm\" title={storeIsAr ? '???? ?????? ?????????' : 'Éditeur Visuel PRO'}>\n            <LayoutTemplate className=\"w-4 h-4\" /> {storeIsAr ? '???? ??????' : 'Éditeur PRO'}\n          </button>\n          <button onClick={() => {\n             const url = customDomain ? \https://\\ : \\\#/store/\\;\n             window.open(url, '_blank');\n          }} className=\"flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm\" title={storeIsAr ? '????? ?????? ???????' : 'Visiter la boutique en ligne'}>\n            <ExternalLink className=\"w-4 h-4\" /> {storeIsAr ? '????? ??????' : 'Visiter'}\n          </button>\n          <button onClick={handlePublish} disabled={isPublishing} className=\"flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed\">\n            {isPublishing ? <Loader2 className=\"w-4 h-4 animate-spin\" /> : <Globe className=\"w-4 h-4\" />} \n            {isPublishing ? (storeIsAr ? '???? ?????...' : 'Publication...') : (storeIsAr ? '???' : 'Publier')}\n          </button>",
    "          {isStoreCreated && (\n             <>\n               <button onClick={() => setShowPreview(true)} className=\"flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-black hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm\" title={storeIsAr ? '???? ?????? ?????????' : 'Éditeur Visuel PRO'}>\n                 <LayoutTemplate className=\"w-4 h-4\" /> {storeIsAr ? '???? ??????' : 'Éditeur PRO'}\n               </button>\n               <button onClick={() => {\n                  const url = customDomain ? \https://\\ : \\\#/store/\\;\n                  window.open(url, '_blank');\n               }} className=\"flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm\" title={storeIsAr ? '????? ?????? ???????' : 'Visiter la boutique en ligne'}>\n                 <ExternalLink className=\"w-4 h-4\" /> {storeIsAr ? '????? ??????' : 'Visiter'}\n               </button>\n               <button onClick={handlePublish} disabled={isPublishing} className=\"flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed\">\n                 {isPublishing ? <Loader2 className=\"w-4 h-4 animate-spin\" /> : <Globe className=\"w-4 h-4\" />} \n                 {isPublishing ? (storeIsAr ? '???? ?????...' : 'Publication...') : (storeIsAr ? '???' : 'Publier')}\n               </button>\n             </>\n          )}"
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Patch 2 applied');
