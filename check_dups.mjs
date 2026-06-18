import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const ids = ['0d998577-b33f-43c0-9cdf-e691c52b1f6c', 'ac8865a8-4707-4bd4-b419-bdd3a9ff7d65', 'b93d82eb-d205-4225-9497-bc51b94c3827', 'aaf2e710-370a-4f4d-a673-5d195e9ef0cd', '79aac909-22b3-4357-ae47-7aec38a324d4', '2e236f3f-2ea3-42f3-b55d-1b359d308f85'];
  
  const { data, error } = await supabase.from('presences').select('employeId').in('employeId', ids);
  console.log('Presences for these IDs:', data);
}
check();
