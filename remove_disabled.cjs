const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// Find all disabled attributes matching the pattern
const disabledPattern = /disabled=\{\(\(p\.colors\?\.length > 0 && !selectedColor\) \|\| \(p\.sizes\?\.length > 0 && !selectedSize\)\)\}/g;
const opacityPattern = /\$\{((p\.colors\?\.length > 0 && !selectedColor) \|\| (p\.sizes\?\.length > 0 && !selectedSize)) \? ' opacity-50 cursor-not-allowed' : ''\}/g;

// Also for `typeof p !== 'undefined'` variants
const disabledPattern2 = /disabled=\{\(\(\(typeof p !== 'undefined' \? p : storeProducts\.find\(\(prod\) => prod\.id === activeProductId\)\)\?\.colors\?\.length > 0 && !selectedColor\) \|\| \(\(typeof p !== 'undefined' \? p : storeProducts\.find\(\(prod\) => prod\.id === activeProductId\)\)\?\.sizes\?\.length > 0 && !selectedSize\)\)\}/g;

content = content.replace(disabledPattern, '');
// I will not remove the disabled completely, I'll replace it inside handleAddToCart!
// Wait! If I just remove the `disabled={...}` from the button HTML, it will be clickable.
content = content.replace(disabledPattern2, '');

// Also remove opacity
const opacityPattern1 = /\$\{\(\(p\.colors\?\.length > 0 && !selectedColor\) \|\| \(p\.sizes\?\.length > 0 && !selectedSize\)\) \? ' opacity-50 cursor-not-allowed' : ''\}/g;
content = content.replace(opacityPattern1, '');

const opacityPattern2 = /\$\{\(\(\(typeof p !== 'undefined' \? p : storeProducts\.find\(\(prod\) => prod\.id === activeProductId\)\)\?\.colors\?\.length > 0 && !selectedColor\) \|\| \(\(typeof p !== 'undefined' \? p : storeProducts\.find\(\(prod\) => prod\.id === activeProductId\)\)\?\.sizes\?\.length > 0 && !selectedSize\)\) \? ' opacity-50 cursor-not-allowed' : ''\}/g;
content = content.replace(opacityPattern2, '');

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Disabled patterns removed!');
