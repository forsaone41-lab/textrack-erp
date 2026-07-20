const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const target = `{page === 'product' && (
           <div className="p-8 max-w-6xl mx-auto bg-white min-h-[600px] my-8 flex flex-col md:flex-row gap-12">`;

const newText = `{page === 'product' && activeProductId && (() => {
           const product = storeProducts.find(p => p.id === activeProductId);
           if (!product) return null;
           return (
             <div className="p-8 max-w-6xl mx-auto min-h-[600px] my-8 flex flex-col md:flex-row gap-12" style={{ backgroundColor: cardBg }}>`;

if (c.includes(target)) {
  c = c.replace(target, newText);
  console.log('Replaced Clement wrapper');

  // We need to replace all `storeProducts.find(p => p.id === activeProductId)` with `product` until the end of the Clement product block
  // The block ends with `)}` at the end of the `page === 'product'` condition.
  // Instead of complex regex, let's just do a blanket replace from `newText` down to the next `// Contact`
  
  const parts = c.split('// Contact');
  let topPart = parts[0];
  topPart = topPart.replace(/storeProducts\.find\(p => p\.id === activeProductId\)\?/g, 'product?');
  topPart = topPart.replace(/storeProducts\.find\(p => p\.id === activeProductId\)/g, 'product');
  
  // Fix the closing brace
  topPart = topPart.replace(`                  </div>
               </div>
            </div>
        )}`, `                  </div>
               </div>
            </div>
         );
        })()}`);

  c = topPart + '// Contact' + parts.slice(1).join('// Contact');
  fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
  console.log('Fixed Clement layout');
} else {
  console.log('Clement wrapper not found');
}
