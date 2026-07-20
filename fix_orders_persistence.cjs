const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const stateOld = `  const [storeOrders, setStoreOrders] = useState(config.storeName ? [
     { id: '#1042', customer: 'Youssef El Amrani', amount: '850.00 MAD', status: 'Nouveau', statusColor: 'bg-indigo-100 text-indigo-700', date: 'Il y a 10 min', items: '2 articles', products: [{ name: 'Premium Hoodie', photo: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop', qty: 1, price: '450.00 MAD', options: 'Taille: L, Couleur: Noir' }, { name: 'Cargo Pants', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', qty: 1, price: '400.00 MAD', options: 'Taille: M, Couleur: Kaki' }] },
     { id: '#1041', customer: 'Sara Bennani', amount: '450.00 MAD', status: 'Confirmé', statusColor: 'bg-emerald-100 text-emerald-700', date: 'Il y a 1h', items: '1 article', products: [{ name: 'Essential T-Shirt', photo: 'https://images.unsplash.com/photo-1489987707023-afc7f93c6508?q=80&w=800&auto=format&fit=crop', qty: 1, price: '450.00 MAD', options: 'Taille: S, Couleur: Blanc' }] },
     { id: '#1040', customer: 'Karim Tazi', amount: '1200.00 MAD', status: 'En cours', statusColor: 'bg-amber-100 text-amber-700', date: 'Hier', items: '3 articles', products: [{ name: 'Classic Sneakers', photo: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop', qty: 2, price: '400.00 MAD', options: 'Pointure: 42, Couleur: Blanc' }, { name: 'Cargo Pants', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', qty: 1, price: '400.00 MAD', options: 'Taille: L, Couleur: Noir' }] },
     { id: '#1039', customer: 'Maha Alami', amount: '350.00 MAD', status: 'Refusé', statusColor: 'bg-rose-100 text-rose-700', date: 'Hier', items: '1 article', products: [{ name: 'Summer Dress', photo: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop', qty: 1, price: '350.00 MAD', options: 'Taille: M, Couleur: Rouge' }] }
  ] : []);`;

// Replace special characters if encoding got messed up
const stateOldRegex = /const \[storeOrders, setStoreOrders\] = useState\(config\.storeName \? \[[\s\S]*?\] : \[\]\);/g;

const stateNew = `  const [storeOrders, setStoreOrders] = useState(() => {
    if (!config.storeName) return [];
    try {
      const saved = localStorage.getItem(\`beya_orders_\${config.storeName}\`);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [
      { id: '#1042', customer: 'Youssef El Amrani', amount: '850.00 MAD', status: 'Nouveau', statusColor: 'bg-indigo-100 text-indigo-700', date: 'Il y a 10 min', items: '2 articles', products: [{ name: 'Premium Hoodie', photo: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop', qty: 1, price: '450.00 MAD', options: 'Taille: L, Couleur: Noir' }, { name: 'Cargo Pants', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', qty: 1, price: '400.00 MAD', options: 'Taille: M, Couleur: Kaki' }] },
      { id: '#1041', customer: 'Sara Bennani', amount: '450.00 MAD', status: 'Confirmé', statusColor: 'bg-emerald-100 text-emerald-700', date: 'Il y a 1h', items: '1 article', products: [{ name: 'Essential T-Shirt', photo: 'https://images.unsplash.com/photo-1489987707023-afc7f93c6508?q=80&w=800&auto=format&fit=crop', qty: 1, price: '450.00 MAD', options: 'Taille: S, Couleur: Blanc' }] },
      { id: '#1040', customer: 'Karim Tazi', amount: '1200.00 MAD', status: 'En cours', statusColor: 'bg-amber-100 text-amber-700', date: 'Hier', items: '3 articles', products: [{ name: 'Classic Sneakers', photo: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop', qty: 2, price: '400.00 MAD', options: 'Pointure: 42, Couleur: Blanc' }, { name: 'Cargo Pants', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', qty: 1, price: '400.00 MAD', options: 'Taille: L, Couleur: Noir' }] },
      { id: '#1039', customer: 'Maha Alami', amount: '350.00 MAD', status: 'Refusé', statusColor: 'bg-rose-100 text-rose-700', date: 'Hier', items: '1 article', products: [{ name: 'Summer Dress', photo: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop', qty: 1, price: '350.00 MAD', options: 'Taille: M, Couleur: Rouge' }] }
    ];
  });

  useEffect(() => {
    if (config.storeName && storeOrders.length > 0) {
      localStorage.setItem(\`beya_orders_\${config.storeName}\`, JSON.stringify(storeOrders));
    }
  }, [storeOrders, config.storeName]);`;

if (content.match(stateOldRegex)) {
    content = content.replace(stateOldRegex, stateNew);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
    console.log('Persistence added successfully!');
} else {
    console.log('Regex match failed!');
}
