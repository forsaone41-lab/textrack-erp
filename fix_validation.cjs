const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const oldHandle = `  const handleAddToCart = (e: React.MouseEvent) => {
     e.stopPropagation();
     setCartCount(c => c + 1);
  };`;

const newHandle = `  const handleAddToCart = (e: React.MouseEvent, p?: any, qty?: number, color?: string, size?: string) => {
     e.stopPropagation();
     const prod = p || storeProducts.find((prod) => prod.id === activeProductId);
     if (prod) {
        if (prod.colors?.length > 0 && !color && !selectedColor) {
           alert(storeIsAr ? 'الرجاء اختيار اللون أولاً' : 'Veuillez choisir une couleur d\\'abord');
           return;
        }
        if (prod.sizes?.length > 0 && !size && !selectedSize) {
           alert(storeIsAr ? 'الرجاء اختيار المقاس أولاً' : 'Veuillez choisir une taille d\\'abord');
           return;
        }
     }
     setCartCount(c => c + 1);
     // Optional visual feedback for successful addition
     const target = e.currentTarget as HTMLElement;
     const originalText = target.innerText;
     target.innerText = storeIsAr ? 'تمت الإضافة ✓' : 'Ajouté ✓';
     setTimeout(() => { target.innerText = originalText; }, 2000);
  };`;

content = content.replace(oldHandle, newHandle);

// Now for Buy Now buttons, we also need to add validation inside the onClick
// Buy Now normally has this onClick: onClick={() => buyNowAsPopup ? setQuickBuyContext(...) : setPage('checkout')}
const oldBuyNow = `onClick={() => buyNowAsPopup ? setQuickBuyContext({ product: p, quantity, selectedColor, selectedSize, setPage }) : setPage('checkout')}`;
const newBuyNow = `onClick={() => {
                                 const prod = typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId);
                                 if (prod && prod.colors?.length > 0 && !selectedColor) { alert(storeIsAr ? 'الرجاء اختيار اللون أولاً' : 'Veuillez choisir une couleur d\\'abord'); return; }
                                 if (prod && prod.sizes?.length > 0 && !selectedSize) { alert(storeIsAr ? 'الرجاء اختيار المقاس أولاً' : 'Veuillez choisir une taille d\\'abord'); return; }
                                 buyNowAsPopup ? setQuickBuyContext({ product: prod, quantity: typeof quantity !== 'undefined' ? quantity : 1, selectedColor, selectedSize, setPage }) : setPage('checkout')
                              }}`;

content = content.replace(/onClick=\{\(\) => buyNowAsPopup \? setQuickBuyContext\(\{ product: p, quantity, selectedColor, selectedSize, setPage \}\) : setPage\('checkout'\)\}/g, newBuyNow);

// Let's replace the one from Checkout Form passing the button (LayoutMinimal, LayoutMazia etc) where they have specific setQuickBuyContext calls without buyNowAsPopup sometimes

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Fixed handleAddToCart and Buy Now logic');
