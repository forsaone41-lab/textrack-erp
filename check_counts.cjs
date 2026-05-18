// Check row counts of all tables
// Usage: node check_counts.cjs

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'leads',
  'users',
  'employes',
  'tissus',
  'fournitures',
  'commandes',
  'fiches'
];

async function checkCounts() {
  console.log('Fetching table row counts from Supabase...');
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.error(`Error for ${table}:`, error.message);
      } else {
        console.log(`Table "${table}": ${count} rows`);
      }
    } catch (e) {
      console.error(`Failed to fetch count for ${table}:`, e);
    }
  }
}

checkCounts();
