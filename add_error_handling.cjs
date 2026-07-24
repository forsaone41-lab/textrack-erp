const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const regex = /await supabase\.from\('stores'\)\.upsert\(\{\s*domain:\s*domain,[\s\S]*?\}, \{ onConflict: 'domain' \}\);/g;

// I will replace the try block content in handleSave
const searchBlock = `    // Sync to Supabase for cross-domain live preview (SaaS mode)
    try {
       const domain = customDomain || \`\${storeName.toLowerCase().replace(/\\s+/g, '')}.beyacreative.com\`;
       
       // Update both exact domain AND a fallback to ensure changes apply immediately
       await supabase.from('stores').upsert({
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
       }, { onConflict: 'domain' });

    } catch (err) {
       console.warn("Supabase sync failed (Table 'stores' might not exist yet):", err);
    }`;

const replaceBlock = `    // Sync to Supabase for cross-domain live preview (SaaS mode)
    try {
       const domain = customDomain || \`\${storeName.toLowerCase().replace(/\\s+/g, '')}.beyacreative.com\`;
       
       // Update exact domain
       const { error: err1 } = await supabase.from('stores').upsert({
          domain: domain,
          config_json: storeConfig,
          name: storeName,
          updated_at: new Date()
       }, { onConflict: 'domain' });
       if (err1) throw err1;

       // Fallback for SaaS local previews
       const { error: err2 } = await supabase.from('stores').upsert({
          domain: 'latest_saved_store',
          config_json: storeConfig,
          name: storeName,
          updated_at: new Date()
       }, { onConflict: 'domain' });
       if (err2) throw err2;

    } catch (err: any) {
       console.warn("Supabase sync failed:", err);
       alert("Attention: La synchronisation avec le cloud a échoué. Vos modifications sont sauvegardées localement. " + (err?.message || ""));
    }`;

if (c.includes(searchBlock)) {
    c = c.replace(searchBlock, replaceBlock);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
    console.log("Added error handling to Supabase upsert.");
} else {
    // try a more lenient replace if spacing changed
    console.log("Could not find exact block to replace");
}
