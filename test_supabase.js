import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log("Testing Supabase Insert...");
  const { data: insertData, error: insertError } = await supabase.from('stores').upsert({
    domain: 'fashlow.store',
    name: 'Fashlow',
    config_json: { storeName: 'Fashlow' }
  }, { onConflict: 'domain' });

  if (insertError) {
    console.error("Insert Error:", insertError);
  } else {
    console.log("Insert Success:", insertData);
  }

  console.log("Testing Supabase Select...");
  const { data: selectData, error: selectError } = await supabase.from('stores').select('*');
  
  if (selectError) {
    console.error("Select Error:", selectError);
  } else {
    console.log("Select Success:", selectData);
  }
}

testSupabase();
