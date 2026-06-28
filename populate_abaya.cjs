const url = 'https://cyduteruvmpefvemeutm.supabase.co/rest/v1/tarifs';
const key = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

const tarifs = [
  { 
    id: 't_abaya', 
    titre: 'Abaya (عباية)', 
    categorie: 'Confection', 
    prixMin: 140, 
    prixMax: 220, 
    unite: 'Pièce', 
    actif: true, 
    description: 'خياطة وثوب العباية (شامل الفصالة، الثوب، والخياطة) - التكلفة تختلف حسب نوع الثوب (كريب، نيدا...)' 
  }
];

async function run() {
  for (const t of tarifs) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(t)
    });
    if (!res.ok) {
      console.log('Error', await res.text());
    } else {
      console.log('Inserted', t.titre);
    }
  }
}

run();
