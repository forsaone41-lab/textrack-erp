const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Change 1: activeTab logic
content = content.replace(
    "const [activeTab, setActiveTab] = useState<string>('orders');\r\n  const [storeName, setStoreName] = useState(config.storeName || 'My Brand');",
    "const [activeTab, setActiveTab] = useState<string>(config.storeName ? 'orders' : 'settings');\r\n  const [storeName, setStoreName] = useState(config.storeName || '');"
);
content = content.replace(
    "const [activeTab, setActiveTab] = useState<string>('orders');\n  const [storeName, setStoreName] = useState(config.storeName || 'My Brand');",
    "const [activeTab, setActiveTab] = useState<string>(config.storeName ? 'orders' : 'settings');\n  const [storeName, setStoreName] = useState(config.storeName || '');"
);

// Change 2: storeOrders init
content = content.replace(
    "const [storeOrders, setStoreOrders] = useState([",
    "const [storeOrders, setStoreOrders] = useState(config.storeName ? ["
);
content = content.replace(
    "  ]);\r\n\r\n  const handleUpdateOrderStatus",
    "  ] : []);\r\n\r\n  const handleUpdateOrderStatus"
);
content = content.replace(
    "  ]);\n\n  const handleUpdateOrderStatus",
    "  ] : []);\n\n  const handleUpdateOrderStatus"
);

// Change 3: KPIs
content = content.replace(
    "<h4 className=\"text-2xl font-black text-white\">1,248</h4>",
    "<h4 className=\"text-2xl font-black text-white\">{!config.storeName ? '0' : '1,248'}</h4>"
);
content = content.replace(
    "<h4 className=\"text-xl font-black text-white\">45,200 <span className=\"text-[10px]\">MAD</span></h4>",
    "<h4 className=\"text-xl font-black text-white\">{!config.storeName ? '0' : '45,200'} <span className=\"text-[10px]\">MAD</span></h4>"
);
content = content.replace(
    "<h4 className=\"text-lg font-black text-slate-800\">856</h4>",
    "<h4 className=\"text-lg font-black text-slate-800\">{!config.storeName ? '0' : '856'}</h4>"
);
content = content.replace(
    "<h4 className=\"text-lg font-black text-slate-800\">124</h4>",
    "<h4 className=\"text-lg font-black text-slate-800\">{!config.storeName ? '0' : '124'}</h4>"
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Replaced successfully.');
