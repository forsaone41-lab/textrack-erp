const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// Replace Add to cart and Buy Now in LayoutHeroCenter (Desktop)
let oldDesktopCart = ">{tr('Add to cart')}</button>";
let newDesktopCart = ">{tr('ADD TO CART')}</button>";

let oldDesktopBuy = ">Buy Now</button>";
let newDesktopBuy = ">{tr('BUY NOW')}</button>";

content = content.replace(oldDesktopCart, newDesktopCart);
content = content.replace(oldDesktopBuy, newDesktopBuy);

// Replace Add to Cart and Buy Now in LayoutHeroCenter (Mobile)
let oldMobileCart = "{isAr ? 'أضف للسلة' : 'Add to Cart'}";
let newMobileCart = "{tr('ADD TO CART')}";

let oldMobileBuy = "{isAr ? 'اشتري الآن' : 'Buy Now'}";
let newMobileBuy = "{tr('BUY NOW')}";

content = content.replace(oldMobileCart, newMobileCart);
content = content.replace(oldMobileBuy, newMobileBuy);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Fixed translations for LayoutHeroCenter');
