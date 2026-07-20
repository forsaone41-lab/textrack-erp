const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
const routeOld = `<Route path="/store-builder" element={currentUser?.role === 'admin' ? <div className="min-h-screen bg-white"><StoreBuilder /></div> : <Navigate to="/" replace />} />`;
const routeNew = `<Route path="/store-builder" element={currentUser?.role === 'admin' ? <div className="min-h-screen bg-white"><StoreBuilder /></div> : <Navigate to="/" replace />} />\n      <Route path="/store/:storeNameUrl" element={<div className="min-h-screen bg-white"><StoreBuilder isLiveStore={true} /></div>} />`;

if (appContent.includes(routeOld) && !appContent.includes('/store/:storeNameUrl')) {
    appContent = appContent.replace(routeOld, routeNew);
    fs.writeFileSync('src/App.tsx', appContent, 'utf-8');
    console.log('App.tsx route added.');
} else {
    console.log('App.tsx route already exists or not found.');
}

// 2. Update StoreBuilder.tsx
let sbContent = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Add react-router-dom import if missing
if (!sbContent.includes('useParams')) {
    sbContent = sbContent.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useParams } from 'react-router-dom';");
}

// Add useParams hook inside the component
const funcSig = `export default function StoreBuilder({ isLiveStore = false }: { isLiveStore?: boolean }) {\r\n  const config = getSavedConfig();`;
const funcSigUnix = funcSig.replace(/\r\n/g, '\n');
const newFuncSig = `export default function StoreBuilder({ isLiveStore = false }: { isLiveStore?: boolean }) {\n  const { storeNameUrl } = useParams<{storeNameUrl: string}>();\n  const config = getSavedConfig();`;

if (sbContent.includes(funcSig)) {
    sbContent = sbContent.replace(funcSig, newFuncSig);
} else if (sbContent.includes(funcSigUnix)) {
    sbContent = sbContent.replace(funcSigUnix, newFuncSig);
}

// Update fetchLiveConfig
const fetchOld = `const fetchLiveConfig = async () => {\r\n         try {\r\n            const currentDomain = window.location.hostname;\r\n            // Fetch the exact domain config first\r\n            let { data, error } = await supabase\r\n               .from('stores')\r\n               .select('config_json')\r\n               .eq('domain', currentDomain)\r\n               .single();`;
const fetchOldUnix = fetchOld.replace(/\r\n/g, '\n');

const fetchNew = `const fetchLiveConfig = async () => {\n         try {\n            const currentDomain = window.location.hostname;\n            // Fetch the exact domain config first, OR by storeName if provided via url parameter\n            let query = supabase.from('stores').select('config_json');\n            if (storeNameUrl) {\n               query = query.eq('config_json->>storeName', storeNameUrl);\n            } else {\n               query = query.eq('domain', currentDomain);\n            }\n            let { data, error } = await query.single();`;

if (sbContent.includes(fetchOld)) {
    sbContent = sbContent.replace(fetchOld, fetchNew);
} else if (sbContent.includes(fetchOldUnix)) {
    sbContent = sbContent.replace(fetchOldUnix, fetchNew);
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', sbContent, 'utf-8');
console.log('StoreBuilder.tsx updated with useParams and fetch logic.');
