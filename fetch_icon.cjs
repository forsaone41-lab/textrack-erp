const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data } = await supabase.from('leads').select('*').eq('name', '__SYSTEM_CONFIG__').order('date', { ascending: false }).limit(1);
    if (data && data.length > 0) {
      const profile = JSON.parse(data[0].details);
      if (profile.logoAppIcon) {
         const base64Data = profile.logoAppIcon.replace(/^data:image\/\w+;base64,/, '');
         fs.writeFileSync('public/favicon.ico', base64Data, 'base64');
         console.log('Saved custom logo to public/favicon.ico');
      } else {
         console.log('No logoAppIcon found in settings');
      }
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
