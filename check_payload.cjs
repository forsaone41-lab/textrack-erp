// Check payload size when fetching all leads
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co';
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('1️⃣  Testing select(*) — full payload with photos...');
  const t1 = Date.now();
  const { data: full, error: e1 } = await supabase.from('leads').select('*');
  const t1end = Date.now();
  
  if (e1) {
    console.log('   ❌ ERROR:', e1.message);
  } else {
    const jsonStr = JSON.stringify(full);
    const sizeMB = (jsonStr.length / 1024 / 1024).toFixed(2);
    console.log(`   ✅ ${full.length} rows | ${sizeMB} MB | ${t1end - t1}ms`);
    
    // Check photo sizes
    let totalPhotoSize = 0;
    let photosCount = 0;
    full.forEach(r => {
      if (r.photo && r.photo.length > 100) { 
        totalPhotoSize += r.photo.length;
        photosCount++;
      }
      if (r.photos && Array.isArray(r.photos)) {
        r.photos.forEach(p => {
          if (p && p.length > 100) {
            totalPhotoSize += p.length;
            photosCount++;
          }
        });
      }
    });
    console.log(`   📸 ${photosCount} photos | ${(totalPhotoSize / 1024 / 1024).toFixed(2)} MB of photo data`);
    console.log(`   📦 Without photos: ${((jsonStr.length - totalPhotoSize) / 1024).toFixed(0)} KB`);
  }

  console.log('\n2️⃣  Testing select without photo columns (lightweight)...');
  const t2 = Date.now();
  const { data: light, error: e2 } = await supabase
    .from('leads')
    .select('id, name, phone, phone2, ville, type, quantity, details, date, status, photoCount, cv, email, crmStage, crmContactMethod, crmRdvDate, crmNotes, crmPrice, crmPriceConfirmed, crmPriority, rejectedAt, contactedAt, contactedType, contactedBy');
  const t2end = Date.now();
  
  if (e2) {
    console.log('   ❌ ERROR:', e2.message);
    console.log('   Hint:', e2.hint || 'none');
    
    // Try even lighter
    console.log('\n3️⃣  Testing minimal select...');
    const t3 = Date.now();
    const { data: min, error: e3 } = await supabase
      .from('leads')
      .select('id, name, phone, ville, type, quantity, details, date, status');
    const t3end = Date.now();
    
    if (e3) {
      console.log('   ❌ ERROR:', e3.message);
    } else {
      const jsonMin = JSON.stringify(min);
      console.log(`   ✅ ${min.length} rows | ${(jsonMin.length / 1024).toFixed(0)} KB | ${t3end - t3}ms`);
    }
  } else {
    const jsonLight = JSON.stringify(light);
    console.log(`   ✅ ${light.length} rows | ${(jsonLight.length / 1024).toFixed(0)} KB | ${t2end - t2}ms`);
  }
}

check().catch(console.error);
