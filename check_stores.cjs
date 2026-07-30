const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const code = fs.readFileSync('src/supabase.ts', 'utf8');
const urlMatch = code.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = code.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);
if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('stores').select('*').then(({data, error}) => {
     if (error) console.error(error);
     else {
        data.forEach(s => {
           console.log(`Store: ${s.name} | Domain: ${s.domain} | Owner: ${s.config_json?.owner_id || 'NONE'} | OwnerEmail: ${s.config_json?.owner_email || 'NONE'}`);
        });
     }
  });
}
