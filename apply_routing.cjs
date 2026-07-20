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
const funcSig = `export default function StoreBuilder({ isLiveStore = false }: { isLiveStore?: boolean }) {`;
const newFuncSig = `export default function StoreBuilder({ isLiveStore = false }: { isLiveStore?: boolean }) {\n  const { storeNameUrl } = useParams<{storeNameUrl: string}>();`;

// Wait, doing this via simple replace on the first occurrence of export default
if (sbContent.includes(funcSig) && !sbContent.includes('const { storeNameUrl } = useParams')) {
    sbContent = sbContent.replace(funcSig, newFuncSig);
}

// Update fetchLiveConfig
const fetchOld1 = `           // Fetch the exact domain config first\r\n           let { data, error } = await supabase\r\n              .from('stores')\r\n              .select('config_json')\r\n              .eq('domain', currentDomain)\r\n              .single();`;
const fetchOld2 = `           // Fetch the exact domain config first\n           let { data, error } = await supabase\n              .from('stores')\n              .select('config_json')\n              .eq('domain', currentDomain)\n              .single();`;

const fetchNew = `           // Fetch the exact domain config first, OR by storeName if provided via url parameter\n           let query = supabase.from('stores').select('config_json');\n           if (storeNameUrl) {\n              query = query.eq('domain', \`\${storeNameUrl}.beyacreative.com\`);\n           } else {\n              query = query.eq('domain', currentDomain);\n           }\n           let { data, error } = await query.single();`;

if (sbContent.includes(fetchOld1)) {
    sbContent = sbContent.replace(fetchOld1, fetchNew);
    console.log('fetchLiveConfig updated (CRLF)');
} else if (sbContent.includes(fetchOld2)) {
    sbContent = sbContent.replace(fetchOld2, fetchNew);
    console.log('fetchLiveConfig updated (LF)');
} else {
    console.log('Could not find fetchLiveConfig block');
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', sbContent, 'utf-8');
console.log('StoreBuilder.tsx routing modifications applied.');
