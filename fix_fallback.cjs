const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const regex = /await supabase\.from\('stores'\)\.upsert\(\{\s*domain:\s*domain,\s*config_json:\s*storeConfig,\s*name:\s*storeName,\s*updated_at:\s*new Date\(\)\s*\}, \{ onConflict: 'domain' \}\);/;

const replacement = `await supabase.from('stores').upsert({
          domain: domain,
          config_json: storeConfig,
          name: storeName,
          updated_at: new Date()
       }, { onConflict: 'domain' });

       // Fallback for SaaS local previews
       await supabase.from('stores').upsert({
          domain: 'latest_saved_store',
          config_json: storeConfig,
          name: storeName,
          updated_at: new Date()
       }, { onConflict: 'domain' });`;

if (regex.test(c)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
    console.log("Fallback fixed successfully!");
} else {
    console.log("Could not find regex!");
}
