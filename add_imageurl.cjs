// Run this script to add imageUrl column to tissus table
// Usage: node add_imageurl.cjs

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addColumn() {
  console.log('Adding imageUrl column to tissus table...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE tissus ADD COLUMN IF NOT EXISTS "imageUrl" text;'
  });
  
  if (error) {
    console.log('RPC method not available, trying direct approach...');
    // Alternative: just try to update a row with the new field - if column doesn't exist, it will be ignored by Supabase
    // The real fix is to go to Supabase Dashboard > Table Editor > tissus > Add Column
    console.log('\n========================================');
    console.log('Please add the column manually:');
    console.log('========================================');
    console.log('1. Go to: https://supabase.com/dashboard/project/cyduteruvmpefvemeutm/editor');
    console.log('2. Click on the "tissus" table');
    console.log('3. Click "+" button to add a new column');
    console.log('4. Name: imageUrl');
    console.log('5. Type: text');
    console.log('6. Click "Save"');
    console.log('========================================');
    console.log('\nOR run this SQL in the SQL Editor:');
    console.log('ALTER TABLE tissus ADD COLUMN IF NOT EXISTS "imageUrl" text;');
    console.log('========================================');
  } else {
    console.log('Column added successfully!', data);
  }
}

addColumn();
