const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing leads insert...');
  const leadPayload = {
    id: `lead-${Date.now()}`,
    name: 'Test',
    phone: '12345678',
    type: 'Test',
    quantity: 1,
    details: 'test',
    date: new Date().toISOString()
  };
  const { error: err1 } = await supabase.from('leads').upsert(leadPayload);
  if (err1) console.error('Leads Error:', err1.message);
  else console.log('Leads OK');

  console.log('Testing users insert...');
  const userPayload = {
    id: `user-${Date.now()}`,
    nom: 'Test',
    role: 'client',
    email: 'test@example.com',
    password: '123',
    pinCode: '123',
    telephone: '12345678'
  };
  const { error: err2 } = await supabase.from('users').upsert(userPayload);
  if (err2) console.error('Users Error:', err2.message);
  else console.log('Users OK');
}

test();
