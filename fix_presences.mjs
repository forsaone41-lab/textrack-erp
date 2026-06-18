import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPresences() {
  const today = new Date().toISOString().split('T')[0];
  console.log('Checking presences for:', today);

  const { data: presences, error } = await supabase
    .from('presences')
    .select('*')
    .eq('date', today);

  if (error) {
    console.error('Error fetching presences:', error);
    return;
  }

  console.log(`Found ${presences.length} total presences for today.`);
  for (const p of presences) {
    console.log(`Employee: ${p.employeId}, Statut: ${p.statut}, Time: ${p.heureEntree}`);
  }
}

checkPresences();
