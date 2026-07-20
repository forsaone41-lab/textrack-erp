const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// ===== STEP 1: Apply btnStyle to buy/action buttons that use primaryColor as bg =====
// Pattern: style={{ backgroundColor: primaryColor }} on buttons
// Replace with btnStyle (includes borderRadius)

let count = 0;
// Replace style={{ backgroundColor: primaryColor }} on <button elements
c = c.replace(/(<button[^>]*?)style=\{\{ backgroundColor: primaryColor \}\}/g, (match, p1) => {
  count++;
  return p1 + `style={btnStyle}`;
});

console.log('Buy button style replacements:', count);

// ===== STEP 2: Apply cardBg to product cards =====
// Product cards that use bg-white or bg-slate-50 on their outer div can use cardBg
// For simplicity, target specific hardcoded product card bg in LayoutHeroCenter (className="...bg-slate-50...")
// We'll add a style prop where we have product card containers

// ===== STEP 3: Fix "Add To Cart" button in Clement layout (line ~1821) =====
// It's: className="flex-1 bg-slate-900 text-white h-14 font-bold..."
// Make it use primaryColor and btnRadius
const addToCartOld = `<button onClick={() => setIsCartOpen(true)} className="flex-1 bg-slate-900 text-white h-14 font-bold text-sm tracking-wider hover:bg-black transition-colors">
                               Add To Cart
                            </button>`;
const addToCartNew = `<button onClick={() => setIsCartOpen(true)} className="flex-1 text-white h-14 font-bold text-sm tracking-wider hover:opacity-90 transition-opacity" style={btnStyle}>
                               Add To Cart
                            </button>`;
if (c.includes(addToCartOld)) { c = c.replace(addToCartOld, addToCartNew); console.log('Add To Cart Clement fixed'); }
else console.log('Add To Cart Clement NOT found');

// ===== STEP 4: Apply secondaryColor as background for product page wrapper =====
// The product detail page bg is usually white. Let's make cards use cardBg.
// Look for bg-[#f8f9fa] on main product detail area or bg-white
const productBg1 = `className="w-full lg:flex gap-16 py-16 px-8 max-w-6xl mx-auto"`;
// Not changing main layout, just apply cardBg to product image bg
const imgBgOld = `<div className="relative flex-1 aspect-[3/4] bg-[#f8f9fa]">`;
const imgBgNew = `<div className="relative flex-1 aspect-[3/4]" style={{ backgroundColor: cardBg }}>`;
if (c.includes(imgBgOld)) { c = c.replace(imgBgOld, imgBgNew); console.log('Product image bg fixed'); }
else console.log('Product image bg NOT found');

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('Done! Total btn replacements:', count);
