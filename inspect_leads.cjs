// Inspect leads in detail
// Usage: node inspect_leads.cjs

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectLeads() {
  console.log('Fetching leads from Supabase...');
  const { data, error } = await supabase.from('leads').select('*');
  if (error) {
    console.error('Error fetching leads:', error);
  } else {
    console.log(`Total leads found: ${data.length}`);
    const nonConfig = data.filter(d => d.name !== '__SYSTEM_CONFIG__');
    console.log(`Non-config leads: ${nonConfig.length}`);
    console.log(nonConfig.map(d => ({ id: d.id, name: d.name, type: d.type, status: d.status })));
  }
}

inspectLeads();
