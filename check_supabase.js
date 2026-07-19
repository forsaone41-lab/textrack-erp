import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLatest() {
  const { data, error } = await supabase.from('stores').select('*').order('updated_at', { ascending: false }).limit(1);
  console.log(JSON.stringify(data, null, 2));
}

checkLatest();
