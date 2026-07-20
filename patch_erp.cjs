const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const stateInjection = `const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [erpProducts, setErpProducts] = useState<any[]>([]);
  const [isLoadingErp, setIsLoadingErp] = useState(false);

  useEffect(() => {
    if (isImportModalOpen) {
      setIsLoadingErp(true);
      supabase.from('client_stock').select('*').eq('client_id', storeName)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setErpProducts(data);
          } else {
            setErpProducts([
               { id: 101, name: 'T-Shirt Oversize Black', price: '250.00', stock: 45 },
               { id: 102, name: 'Cargo Pants Beige', price: '399.00', stock: 12 },
               { id: 103, name: 'Sneakers Pro X', price: '850.00', stock: 8 },
               { id: 104, name: 'Cap Classic Navy', price: '120.00', stock: 150 },
               { id: 105, name: 'Hoodie Winter Essential', price: '550.00', stock: 34 },
               { id: 106, name: 'Socks Pack (3)', price: '90.00', stock: 200 },
               { id: 107, name: 'Jacket Denim Vintage', price: '650.00', stock: 5 },
               { id: 108, name: 'Sunglasses Retro', price: '199.00', stock: 22 },
            ]);
          }
          setIsLoadingErp(false);
        }).catch(() => {
          setErpProducts([
             { id: 101, name: 'T-Shirt Oversize Black', price: '250.00', stock: 45 },
             { id: 102, name: 'Cargo Pants Beige', price: '399.00', stock: 12 },
             { id: 103, name: 'Sneakers Pro X', price: '850.00', stock: 8 },
             { id: 104, name: 'Cap Classic Navy', price: '120.00', stock: 150 },
             { id: 105, name: 'Hoodie Winter Essential', price: '550.00', stock: 34 },
             { id: 106, name: 'Socks Pack (3)', price: '90.00', stock: 200 },
             { id: 107, name: 'Jacket Denim Vintage', price: '650.00', stock: 5 },
             { id: 108, name: 'Sunglasses Retro', price: '199.00', stock: 22 },
          ]);
          setIsLoadingErp(false);
        });
    }
  }, [isImportModalOpen, storeName]);`;

c = c.replace('const [isImportModalOpen, setIsImportModalOpen] = useState(false);', stateInjection);

const mapRegex = /\{\[\s*\{\s*id:\s*101[^\]]+\]\.map\(erpItem/g;
c = c.replace(mapRegex, '{isLoadingErp ? <div className="col-span-4 text-center py-20 text-slate-500 font-bold animate-pulse">Chargement du stock...</div> : erpProducts.map(erpItem');

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('patched ERP modal');
