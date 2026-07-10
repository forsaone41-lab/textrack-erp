// Diagnose leads data — shows ALL records including system ones
// Usage: node diagnose_leads.cjs

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('\n🔍 Fetching ALL records from leads table...\n');
  const { data, error } = await supabase.from('leads').select('id, name, type, status, crmStage, date');

  if (error) {
    console.error('❌ Supabase Error:', error.message, '\nCode:', error.code, '\nHint:', error.hint);
    return;
  }

  console.log(`✅ Total rows in leads table: ${data.length}`);
  
  // Breakdown
  const systemRows = data.filter(d => d.name?.startsWith('__') || d.type?.startsWith('__'));
  const realLeads = data.filter(d => !d.name?.startsWith('__') && !d.type?.startsWith('__'));
  const recruitment = realLeads.filter(d => d.type?.startsWith('RECRUTEMENT:'));
  const commercial = realLeads.filter(d => !d.type?.startsWith('RECRUTEMENT:'));
  
  console.log(`\n📊 Breakdown:`);
  console.log(`   System rows (hidden):  ${systemRows.length}`);
  console.log(`   Recruitment leads:     ${recruitment.length}`);
  console.log(`   Commercial leads:      ${commercial.length}`);
  
  if (commercial.length > 0) {
    console.log('\n📋 Commercial leads by crmStage:');
    const stageMap = {};
    commercial.forEach(l => {
      const stage = l.crmStage || 'null/nouveau';
      stageMap[stage] = (stageMap[stage] || 0) + 1;
    });
    Object.entries(stageMap).forEach(([stage, count]) => {
      const visible = ['nouveau', 'contact_en_cours', 'rdv_fixe', 'attente_confirmation', null, undefined, ''].includes(stage) || stage === 'null/nouveau';
      console.log(`   ${visible ? '👁 ' : '🙈 '} ${stage}: ${count} lead(s)  ${visible ? '(VISIBLE in portal)' : '(HIDDEN — filtered out)'}`);
    });
    
    console.log('\n📝 All commercial leads:');
    commercial.forEach(l => {
      console.log(`   - ${l.name} | type: ${l.type} | stage: ${l.crmStage || 'nouveau'} | date: ${l.date?.substring(0,10)}`);
    });
  } else {
    console.log('\n⚠️  NO commercial leads found at all in Supabase!');
    console.log('   This means the leads table is empty or all leads are system/recruitment records.');
    console.log('\n👉 Solution: Add leads from the landing page (AdsLanding) or Demandes admin page.');
  }

  // RLS check
  console.log('\n🔐 RLS Check: Can we INSERT into leads?');
  const testId = 'rls-test-' + Date.now();
  const { error: insertError } = await supabase.from('leads').insert({
    id: testId,
    name: '__RLS_TEST__',
    phone: '0000',
    ville: 'TEST',
    type: '__RLS_TEST__',
    quantity: 0,
    date: new Date().toISOString(),
    status: 'new'
  });
  if (insertError) {
    console.log('   ❌ INSERT blocked:', insertError.message);
  } else {
    console.log('   ✅ INSERT works! Cleaning up test row...');
    await supabase.from('leads').delete().eq('id', testId);
  }
}

diagnose().catch(console.error);
