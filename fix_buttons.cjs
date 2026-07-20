const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const disableCondition = `((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))`;
const disableProp = ` disabled={${disableCondition}}`;
const classAddon = `\${${disableCondition} ? ' opacity-50 cursor-not-allowed' : ''}`;

// We will use a regex to find all <button> elements that have handleAddToCart or setPage('checkout') or submitGlobalOrder.
// We must ensure they are inside the product mapping.
// A simpler way: just match the exact buttons and replace them.

const replacements = [
  // LayoutHeroCenter Add to Cart
  {
    search: `onClick={handleAddToCart} className="flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg" style={{ backgroundColor: '#1e293b' }}>Add to cart</button>`,
    replace: `onClick={handleAddToCart}${disableProp} className={\`flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg ${classAddon}\`} style={{ backgroundColor: '#1e293b' }}>Add to cart</button>`
  },
  // LayoutHeroCenter Buy Now
  {
    search: `onClick={() => setPage('checkout')} className="flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg" style={{ backgroundColor: primaryColor }}>Buy Now</button>`,
    replace: `onClick={() => setPage('checkout')}${disableProp} className={\`flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg ${classAddon}\`} style={{ backgroundColor: primaryColor }}>Buy Now</button>`
  },
  // LayoutHeroCenter Achat Express
  {
    search: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg mt-2" style={{ backgroundColor: primaryColor }}>{storeLang === 'ar' ? 'تأكيد الطلب (الدفع عند الاستلام)' : storeLang === 'en' ? 'Confirm Order (COD)' : 'Confirmer la Commande'}</button>`,
    replace: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg mt-2 ${classAddon}\`} style={{ backgroundColor: primaryColor }}>{storeLang === 'ar' ? 'تأكيد الطلب (الدفع عند الاستلام)' : storeLang === 'en' ? 'Confirm Order (COD)' : 'Confirmer la Commande'}</button>`
  },
  // LayoutSplitScreen Add to Cart
  {
    search: `onClick={handleAddToCart} className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">ADD TO CART</button>`,
    replace: `onClick={handleAddToCart}${disableProp} className={\`px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors ${classAddon}\`}>ADD TO CART</button>`
  },
  // LayoutSplitScreen Achat Express
  {
    search: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-5 text-white text-xs tracking-widest mt-4 transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>`,
    replace: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-5 text-white text-xs tracking-widest mt-4 transition-opacity hover:opacity-90 ${classAddon}\`} style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>`
  },
  // LayoutElegant Add to Cart
  {
    search: `onClick={handleAddToCart} className="w-max px-12 py-4 bg-white border border-black text-black text-xs tracking-widest hover:bg-gray-100 transition-colors">ADD TO CART</button>`,
    replace: `onClick={handleAddToCart}${disableProp} className={\`w-max px-12 py-4 bg-white border border-black text-black text-xs tracking-widest hover:bg-gray-100 transition-colors ${classAddon}\`}>ADD TO CART</button>`
  },
  // LayoutElegant Buy Now
  {
    search: `onClick={() => setPage('checkout')} className="w-max px-12 py-4 text-white text-xs tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>BUY NOW</button>`,
    replace: `onClick={() => setPage('checkout')}${disableProp} className={\`w-max px-12 py-4 text-white text-xs tracking-widest transition-opacity hover:opacity-90 ${classAddon}\`} style={{ backgroundColor: primaryColor }}>BUY NOW</button>`
  },
  // LayoutElegant Achat Express
  {
    search: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-5 text-white text-xs tracking-widest mt-8 transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>`,
    replace: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-5 text-white text-xs tracking-widest mt-8 transition-opacity hover:opacity-90 ${classAddon}\`} style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>`
  },
  // LayoutPlayful Add to Cart
  {
    search: `onClick={handleAddToCart} className="w-max px-12 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors">ADD TO CART</button>`,
    replace: `onClick={handleAddToCart}${disableProp} className={\`w-max px-12 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors ${classAddon}\`}>ADD TO CART</button>`
  },
  // LayoutPlayful Buy Now
  {
    search: `onClick={() => setPage('checkout')} className="w-max px-12 py-4 bg-white text-black text-xs tracking-widest hover:bg-gray-200 transition-colors">BUY NOW</button>`,
    replace: `onClick={() => setPage('checkout')}${disableProp} className={\`w-max px-12 py-4 bg-white text-black text-xs tracking-widest hover:bg-gray-200 transition-colors ${classAddon}\`}>BUY NOW</button>`
  },
  // LayoutPlayful Achat Express 1
  {
    search: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-5 bg-white text-black text-xs tracking-widest mt-4 hover:bg-gray-200 transition-colors">PLACE ORDER</button>`,
    replace: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-5 bg-white text-black text-xs tracking-widest mt-4 hover:bg-gray-200 transition-colors ${classAddon}\`}>PLACE ORDER</button>`
  },
  // LayoutPlayful Achat Express 2
  {
    search: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-5 bg-white text-black text-xs tracking-widest mt-8 hover:bg-gray-200 transition-colors">PLACE ORDER</button>`,
    replace: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-5 bg-white text-black text-xs tracking-widest mt-8 hover:bg-gray-200 transition-colors ${classAddon}\`}>PLACE ORDER</button>`
  },
  // LayoutClement Add to Cart
  {
    search: `onClick={handleAddToCart} className="w-full h-14 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mb-4">{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}</button>`,
    replace: `onClick={handleAddToCart}${disableProp} className={\`w-full h-14 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mb-4 ${classAddon}\`}>{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}</button>`
  },
  // LayoutClement Buy Now
  {
    search: `onClick={() => setPage('checkout')} className="w-full h-14 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors">{storeIsAr ? 'اشتري الآن' : 'Acheter Maintenant'}</button>`,
    replace: `onClick={() => setPage('checkout')}${disableProp} className={\`w-full h-14 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors ${classAddon}\`}>{storeIsAr ? 'اشتري الآن' : 'Acheter Maintenant'}</button>`
  },
  // LayoutMazia Add to Cart
  {
    search: `onClick={handleAddToCart} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors mb-4">{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}</button>`,
    replace: `onClick={handleAddToCart}${disableProp} className={\`w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors mb-4 ${classAddon}\`}>{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}</button>`
  },
  // LayoutMazia Achat Express
  {
    search: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-4 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mt-8">{storeIsAr ? 'تأكيد الطلب' : 'Confirmer la Commande'}</button>`,
    replace: `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-4 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mt-8 ${classAddon}\`}>{storeIsAr ? 'تأكيد الطلب' : 'Confirmer la Commande'}</button>`
  }
];

let changedCount = 0;
for (const req of replacements) {
  if (c.includes(req.search)) {
    c = c.split(req.search).join(req.replace);
    changedCount++;
  } else {
    console.log("NOT FOUND:", req.search.substring(0, 100));
  }
}

// Special case for LayoutSplitScreen Buy Now
const splitBuyNow = `onClick={() => setPage('checkout')} className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">BUY NOW</button>`;
if (c.includes(splitBuyNow)) {
    c = c.replace(splitBuyNow, `onClick={() => setPage('checkout')}${disableProp} className={\`px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors ${classAddon}\`}>BUY NOW</button>`);
    changedCount++;
}

// LayoutClement Send it to me!
const clementSend = `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl mt-4" style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>`;
if (c.includes(clementSend)) {
    c = c.replace(clementSend, `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl mt-4 ${classAddon}\`} style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>`);
    changedCount++;
}

// Another LayoutClement Send it to me!
const clementSend2 = `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} className="w-full py-5 text-white font-black uppercase tracking-widest text-xl hover:scale-105 transition-transform rounded-full shadow-xl mt-6" style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>`;
if (c.includes(clementSend2)) {
    c = c.replace(clementSend2, `onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)}${disableProp} className={\`w-full py-5 text-white font-black uppercase tracking-widest text-xl hover:scale-105 transition-transform rounded-full shadow-xl mt-6 ${classAddon}\`} style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>`);
    changedCount++;
}


console.log("Changed:", changedCount);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
