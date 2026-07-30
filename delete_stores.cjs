const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const code = fs.readFileSync('src/supabase.ts', 'utf8');
const urlMatch = code.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = code.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);
if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('stores').delete().in('domain', ['wisal.beyacreative.com', 'fashlow.store']).then(({error}) => {
     if (error) console.error(error);
     else console.log('Deleted WISAL and FASHLOW');
  });
}
