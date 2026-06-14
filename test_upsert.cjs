const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const lead = {
      id: 'test-fournisseur-123',
      name: 'Test',
      phone: '000',
      ville: 'Test',
      type: '__FOURNISSEUR__',
      status: 'completed',
      date: new Date().toISOString(),
      quantity: 0,
      details: '{}'
  };
  const { error } = await supabase.from('leads').upsert(lead);
  console.log("Upsert error:", error);
  process.exit(0);
}
run();
