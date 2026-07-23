const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Replace state
content = content.replace(
    'const [cartCount, setCartCount] = useState(0);', 
    'const [cartItems, setCartItems] = useState<any[]>([]);\n  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);'
);

// 2. Replace handleAddToCart definition
const oldHandle = 'const handleAddToCart = (e: React.MouseEvent) => {\n     e.stopPropagation();\n     setCartCount(c => c + 1);\n  };';
const newHandle = `const handleAddToCart = (e: React.MouseEvent, product?: any, quantity?: number, color?: string, size?: string) => {
     e.stopPropagation();
     if (!product) return;
     setCartItems(prev => {
        const existing = prev.find(i => i.product.id === product.id && i.color === color && i.size === size);
        if (existing) return prev.map(i => i === existing ? { ...i, quantity: i.quantity + (quantity || 1) } : i);
        return [...prev, { product, quantity: quantity || 1, color, size }];
     });
     setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
     setCartItems(prev => prev.filter((_, i) => i !== index));
  };`;
content = content.replace(oldHandle, newHandle);

// 3. Replace onClick={handleAddToCart} globally
content = content.replace(/onClick=\{handleAddToCart\}/g, "onClick={(e) => handleAddToCart(e, typeof p !== 'undefined' ? p : (typeof product !== 'undefined' ? product : null), typeof quantity !== 'undefined' ? quantity : 1, typeof selectedColor !== 'undefined' ? selectedColor : undefined, typeof selectedSize !== 'undefined' ? selectedSize : undefined)}");

// 4. Update Cart Rendering Modal
const oldCartRender = /Array\.from\(\{ length: cartCount \}\)\.map\(\(_, i\) => \([\s\S]*?<\/div>\s*\)\)/;
const newCartRender = `cartItems.map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm relative">
                               <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative">
                                  {(item.color && item.product.colorImages?.[item.color]) ? <img src={item.product.colorImages[item.color]} className="w-full h-full object-cover" /> : (item.product.image ? <img src={item.product.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-300" />)}
                               </div>
                               <div className="flex-1 flex flex-col justify-center">
                                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.product.name}</h4>
                                  <p className="text-sm font-black mt-1" style={{ color: primaryColor }}>{item.product.price} MAD</p>
                                  <div className="flex items-center gap-2 mt-2">
                                     {item.color && <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: item.color }}></span>}
                                     {item.size && <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase">{item.size}</span>}
                                  </div>
                                  <div className="flex items-center gap-3 mt-2">
                                     <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">Qt: {item.quantity}</span>
                                     <button onClick={() => removeFromCart(i)} className="text-xs text-red-500 font-bold hover:underline">{storeIsAr ? 'حذف' : 'Retirer'}</button>
                                  </div>
                               </div>
                            </div>
                         ))`;
content = content.replace(oldCartRender, newCartRender);

// 5. Update Cart Total
content = content.replace(/\{cartCount \* 299\} MAD/g, '{cartItems.reduce((acc, item) => acc + (parseFloat(item.product.price || 0) * item.quantity), 0).toFixed(2)} MAD');

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Cart script executed');
