const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const anchor = "const product = storeProducts.find((p: any) => p.id === activeProductId);\n           if (!product) return null;";
if (c.includes(anchor) || c.replace(/\r/g, '').includes(anchor.replace(/\r/g, ''))) {
  const cNorm = c.replace(/\r/g, '');
  const anchorNorm = anchor.replace(/\r/g, '');
  const startIndex = cNorm.indexOf(anchorNorm) + anchorNorm.length;
  
  // The layout clement ends at // Contact
  const endIndex = cNorm.indexOf('// Contact', startIndex);
  
  let section = cNorm.substring(startIndex, endIndex);
  
  // replace usages
  section = section.replace(/storeProducts\.find\(p => p\.id === activeProductId\)\?/g, 'product?');
  section = section.replace(/storeProducts\.find\(p => p\.id === activeProductId\)/g, 'product');
  
  // fix end block
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
  
  const finalC = cNorm.substring(0, startIndex) + section + cNorm.substring(endIndex);
  fs.writeFileSync('src/pages/StoreBuilder.tsx', finalC, 'utf-8');
  console.log('Fixed internal Clement references and block end');
} else {
  console.log('Start block not found');
}
