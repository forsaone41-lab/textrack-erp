const fs = require('fs');

// Fix Dashboard
let dashboard = fs.readFileSync('src/components/Tools/StoreManagerDashboard.tsx', 'utf-8');
const mapRegex = /const realStores = data\.map\(\(st: any\) => \(\{/g;
const mapNew = `const realStores = data.filter((st: any) => st.domain !== 'latest_saved_store').map((st: any) => ({`;
if (dashboard.match(mapRegex)) {
    dashboard = dashboard.replace(mapRegex, mapNew);
    fs.writeFileSync('src/components/Tools/StoreManagerDashboard.tsx', dashboard);
    console.log('Dashboard fixed!');
}

// Fix StoreBuilder saving
let builder = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');
const saveRegex = /\/\/ Also update the 'latest' fallback record so empty-domain mockups work[\s\S]*?await supabase\.from\('stores'\)\.upsert\(\{[\s\S]*?domain: 'latest_saved_store',[\s\S]*?\}, \{ onConflict: 'domain' \}\);/g;
if (builder.match(saveRegex)) {
    builder = builder.replace(saveRegex, '');
    fs.writeFileSync('src/pages/StoreBuilder.tsx', builder);
    console.log('Builder saving fixed!');
} else {
    console.log('Builder regex failed to match.');
}
