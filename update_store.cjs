const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const code = fs.readFileSync('src/supabase.ts', 'utf8');
const urlMatch = code.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = code.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);
if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('stores').select('*').eq('domain', 'egalesmaster').then(({data}) => {
     if (data && data.length > 0) {
        let store = data[0];
        let conf = store.config_json || {};
        conf.owner_id = '985cec18-77b7-4b95-a6f9-6b986f109bb2';
        conf.owner_email = '00.emaily.zero@gmail.com';
        supabase.from('stores').update({config_json: conf}).eq('domain', 'egalesmaster').then(() => {
           console.log('Store updated successfully!');
        });
     } else {
        console.log('Store not found!');
     }
  });
}
