const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const targetRegex = /\{page === 'product' && \([\s\S]*?className="w-full h-full object-cover mix-blend-multiply" alt="Product" \/>\s+<\/div>/;

const newWrapper = `{page === 'product' && activeProductId && (() => {
           const product = storeProducts.find((p: any) => p.id === activeProductId);
           if (!product) return null;
           return (
           <div className="p-8 max-w-6xl mx-auto min-h-[600px] my-8 flex flex-col md:flex-row gap-12" style={{ backgroundColor: cardBg }}>
              <div className="w-full md:w-1/2 flex gap-4">
                 <div className="w-full aspect-[3/4] bg-[#f5f1e9] rounded-sm overflow-hidden flex items-center justify-center">
                    <img src={getCoverImage(product)} className="w-full h-full object-cover mix-blend-multiply" alt="Product" />
                 </div>`;

if (targetRegex.test(c)) {
  c = c.replace(targetRegex, newWrapper);
  
  // Replace references
  const startIndex = c.indexOf(newWrapper);
  const nextLayoutIndex = c.indexOf('// Contact', startIndex); // safe boundary
  
  let section = c.substring(startIndex, nextLayoutIndex);
  section = section.replace(/storeProducts\.find\(\(p: any\) => p\.id === activeProductId\)\?/g, 'product?');
  section = section.replace(/storeProducts\.find\(p => p\.id === activeProductId\)\?/g, 'product?');
  section = section.replace(/storeProducts\.find\(p => p\.id === activeProductId\)/g, 'product');
  
  // Fix end of block
  const oldEnd = `                  </div>
               </div>
            </div>
        )}`;
  const newEnd = `                  </div>
               </div>
            </div>
         );
        })()}`;
  
  section = section.replace(oldEnd, newEnd);
  
  c = c.substring(0, startIndex) + section + c.substring(nextLayoutIndex);
  fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
  console.log('Fixed Clement Layout completely');
} else {
  console.log('Clement wrapper still not found');
}
