const url = 'https://cyduteruvmpefvemeutm.supabase.co/rest/v1/tarifs';
const key = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

const tarifs = [
  { id: 't_tshirt', titre: 'T-Shirt', categorie: 'Confection', prixMin: 35, prixMax: 45, unite: 'Pièce', actif: true, description: 'T-shirt classique, col rond (estimation pour QTE > 100)' },
  { id: 't_oversize', titre: 'T-Shirt Oversize', categorie: 'Confection', prixMin: 45, prixMax: 60, unite: 'Pièce', actif: true, description: 'Coupe oversize tendance' },
  { id: 't_polo', titre: 'Polo', categorie: 'Confection', prixMin: 60, prixMax: 75, unite: 'Pièce', actif: true, description: 'Polo classique piqué' },
  { id: 't_sweat', titre: 'Sweat / Hoodie', categorie: 'Confection', prixMin: 120, prixMax: 150, unite: 'Pièce', actif: true, description: 'Sweat à capuche ou sans capuche en molleton' },
  { id: 't_djellaba', titre: 'Djellaba / Gandoura', categorie: 'Confection', prixMin: 150, prixMax: 250, unite: 'Pièce', actif: true, description: 'Tenue traditionnelle marocaine' },
  { id: 't_ensemble', titre: 'Ensemble / Survêtement', categorie: 'Confection', prixMin: 180, prixMax: 260, unite: 'Pièce', actif: true, description: 'Ensemble complet (Haut + Bas)' },
  { id: 't_pyjama', titre: 'Pyjama', categorie: 'Confection', prixMin: 80, prixMax: 120, unite: 'Pièce', actif: true, description: 'Ensemble de nuit' },
  { id: 't_uniforme', titre: 'Uniforme / Travail', categorie: 'Confection', prixMin: 100, prixMax: 180, unite: 'Pièce', actif: true, description: 'Tenue professionnelle ou de travail' },
  { id: 't_pantalon', titre: 'Pantalon', categorie: 'Confection', prixMin: 80, prixMax: 130, unite: 'Pièce', actif: true, description: 'Pantalon classique, cargo, ou jogging' }
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
