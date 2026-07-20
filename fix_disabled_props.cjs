const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Find ALL CheckoutForm occurrences in the checkout blocks
// and replace the > comparisons with && (boolean check only)
// disabled={(...?.colors?.length > 0 && !X) || ...} 
// becomes disabled={(!!(...)?.colors?.length && !X) || ...}

let count = 0;
c = c.replace(
    /disabled=\{\(\(typeof p !== 'undefined' \? p : storeProducts\.find\(\(prod\) => prod\.id === activeProductId\)\)\?\.colors\?\.length > 0 && !selectedColor\) \|\| \(\(typeof p !== 'undefined' \? p : storeProducts\.find\(\(prod\) => prod\.id === activeProductId\)\)\?\.sizes\?\.length > 0 && !selectedSize\)\}/g,
    () => { count++; return `disabled={(!!(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length && !selectedColor) || (!!(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length && !selectedSize)}`; }
);
console.log('Replaced disabled props:', count);

// Also fix using simpler IIFE pattern for all page=checkout blocks
// Find all remaining `page === 'checkout' && (` patterns and wrap in IIFE
let checkoutCount = 0;
// Look for the specific form: page === 'checkout' && (\n <div ...>\n <div ...>\n  <h2>...\n  <div>\n  <CheckoutForm
const checkoutRegex = /\{page === 'checkout' && \(\n([ \t]+<div[^>]+>)\n([ \t]+<div[^>]+>)\n([ \t]+<h2[^>]+>[\s\S]*?<\/h2>)\n([\s\S]*?<\/div>\n[ \t]*<\/div>\n[ \t]*<\/div>\n[ \t]*)\}\)/g;

// Simpler: just replace > 0 with length (truthy check) inside the CheckoutForm disabled prop
// Already done above with regex. Let's just also look for the remaining old buttons
c = c.replace(
    /disabled=\{\(\(p\.colors\?\.length > 0 && !selectedColor\) \|\| \(p\.sizes\?\.length > 0 && !selectedSize\)\)\}/g,
    () => { count++; return `disabled={(!!(p?.colors?.length) && !selectedColor) || (!!(p?.sizes?.length) && !selectedSize)}`; }
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);

// Also normalize CheckoutForm component itself
let cf = fs.readFileSync('src/components/CheckoutForm.tsx', 'utf-8');
// Ensure it uses LF or CRLF consistently
cf = cf.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/components/CheckoutForm.tsx', cf);

console.log('Total replacements:', count);
console.log('Done.');
