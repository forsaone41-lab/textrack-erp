const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// We will inject the Supabase fetch logic inside StoreBuilder's useEffect.
// Right after the localStorage useEffect for storeOrders.

const searchString = `  useEffect(() => {
    if (config.storeName && storeOrders.length > 0) {
      localStorage.setItem(\`beya_orders_\${config.storeName}\`, JSON.stringify(storeOrders));
    }
  }, [storeOrders, config.storeName]);`;

const replacementString = `  useEffect(() => {
    if (config.storeName && storeOrders.length > 0) {
      localStorage.setItem(\`beya_orders_\${config.storeName}\`, JSON.stringify(storeOrders));
    }
  }, [storeOrders, config.storeName]);

  // Fetch LIVE orders from Supabase for this specific store
  useEffect(() => {
    if (!isLiveStore && config.storeName) {
      const fetchStoreOrders = async () => {
        try {
          const { data, error } = await supabase
            .from('commandes')
            .select('*')
            .ilike('tissu', \`%Store: \${config.storeName}%\`)
            .order('dateCreation', { ascending: false });
            
          if (data && !error && data.length > 0) {
            const mappedOrders = data.map(cmd => {
              let statusColor = 'bg-slate-100 text-slate-700';
              if (['Confirmé', 'Confirmée', 'Validée', 'Livrée', 'مؤكد', 'تم التوصيل'].includes(cmd.statut)) statusColor = 'bg-emerald-100 text-emerald-700';
              if (['Refusé', 'Refusée', 'Annulée', 'Retour', 'مرفوض', 'ملغى'].includes(cmd.statut)) statusColor = 'bg-rose-100 text-rose-700';
              if (['En attente', 'Nouveau'].includes(cmd.statut)) statusColor = 'bg-amber-100 text-amber-700';
              
              const qtyMatch = cmd.quantite ? parseInt(cmd.quantite.toString()) : 1;
              const price = cmd.prix ? parseFloat(cmd.prix.toString()) : 0;
              
              return {
                id: cmd.id,
                customer: cmd.client,
                amount: \`\${price.toFixed(2)} MAD\`,
                status: cmd.statut || 'Nouveau',
                statusColor,
                date: cmd.dateCreation ? new Date(cmd.dateCreation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
                items: \`\${qtyMatch} article\${qtyMatch > 1 ? 's' : ''}\`,
                products: [{
                  name: cmd.modele,
                  photo: 'https://via.placeholder.com/150',
                  qty: qtyMatch,
                  price: \`\${price.toFixed(2)} MAD\`,
                  options: \`Couleurs: \${cmd.couleurs} - Tailles: \${cmd.tailles}\`
                }],
                deleted: false // live orders are not considered deleted in dashboard unless marked in DB
              };
            });
            
            // Merge with local orders, preferring live orders
            setStoreOrders(prev => {
              const liveIds = new Set(mappedOrders.map(o => o.id));
              const localKept = prev.filter(o => !liveIds.has(o.id));
              return [...mappedOrders, ...localKept];
            });
          }
        } catch (err) {
          console.error("Error fetching live store orders:", err);
        }
      };
      
      fetchStoreOrders();
    }
  }, [isLiveStore, config.storeName]);`;

if (c.includes(searchString) && !c.includes('fetchStoreOrders')) {
    c = c.replace(searchString, replacementString);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
    console.log("Successfully added Supabase fetcher for Store Orders!");
} else {
    console.log("Could not find insertion point or fetcher already exists.");
}
