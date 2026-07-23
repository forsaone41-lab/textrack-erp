const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const regex = /const handleAddToCart = \(e: React\.MouseEvent\) => \{\s*e\.stopPropagation\(\);\s*setCartCount\(c => c \+ 1\);\s*\};/g;

const newCode = `const handleAddToCart = (e: React.MouseEvent, p?: any, qty?: number, color?: string, size?: string) => {
     e.stopPropagation();
     const prod = p || (typeof storeProducts !== 'undefined' ? storeProducts.find((prod) => prod.id === activeProductId) : null);
     if (prod) {
        if (prod.colors?.length > 0 && !color && typeof selectedColor !== 'undefined' && !selectedColor) {
           alert(storeIsAr ? 'الرجاء اختيار اللون أولاً' : 'Veuillez choisir une couleur d\\'abord');
           return;
        }
        if (prod.sizes?.length > 0 && !size && typeof selectedSize !== 'undefined' && !selectedSize) {
           alert(storeIsAr ? 'الرجاء اختيار المقاس أولاً' : 'Veuillez choisir une taille d\\'abord');
           return;
        }
        
        // Add to cart logic
        if (typeof setCartItems !== 'undefined') {
            setCartItems(prev => {
               const c = color || (typeof selectedColor !== 'undefined' ? selectedColor : null);
               const s = size || (typeof selectedSize !== 'undefined' ? selectedSize : null);
               const q = qty || (typeof quantity !== 'undefined' ? quantity : 1);
               const existingItem = prev.find(item => item.product.id === prod.id && item.color === c && item.size === s);
               if (existingItem) {
                  return prev.map(item => item === existingItem ? { ...item, quantity: item.quantity + q } : item);
               }
               return [...prev, { product: prod, quantity: q, color: c, size: s }];
            });
            // Open cart
            if (typeof setIsCartOpen === 'function') setIsCartOpen(true);
        }
     }

     // Visual feedback
     const target = e.currentTarget as HTMLElement;
     const originalText = target.innerText;
     target.innerText = typeof storeIsAr !== 'undefined' && storeIsAr ? 'تمت الإضافة ✓' : 'Ajouté ✓';
     target.style.backgroundColor = '#10b981'; // Green color for success
     target.style.color = '#fff';
     target.style.borderColor = '#10b981';
     setTimeout(() => { 
        target.innerText = originalText; 
        target.style.backgroundColor = '';
        target.style.color = '';
        target.style.borderColor = '';
     }, 2000);
  };`;

if (content.match(regex)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
    console.log("Successfully fixed handleAddToCart!");
} else {
    console.log("Failed to match handleAddToCart!");
}
