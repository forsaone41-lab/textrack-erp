// Check what leads exist in the database
// Usage: node check_leads.cjs

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLeads() {
  console.log('Fetching leads from Supabase...');
  const { data, error } = await supabase.from('leads').select('*');
  if (error) {
    console.error('Error fetching leads:', error);
  } else {
    console.log(`Total leads found: ${data.length}`);
    console.log(data.map(d => ({ id: d.id, name: d.name, type: d.type })));
  }
}

checkLeads();
