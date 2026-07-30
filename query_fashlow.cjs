const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const code = fs.readFileSync('src/supabase.ts', 'utf8');
const urlMatch = code.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = code.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  (async () => {
    const { data: users } = await supabase.from('users').select('*').ilike('email', '%fashlow%');
    console.log('Fashlow user:', users);
    // Also check all tables or stores with domain fashlow
    const { data: stores } = await supabase.from('stores').select('*').ilike('domain', '%fashlow%');
    console.log('Fashlow store in stores table:', stores);
  })();
}
