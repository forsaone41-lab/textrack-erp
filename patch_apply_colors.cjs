const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// Button radius helper based on buttonStyle
// pill = rounded-full, square = rounded-none, rounded = rounded-lg (default)
// We'll inject a CSS variable approach using inline style on all buy buttons

// Apply buttonStyle to all "Add to Cart" / "Acheter" / buy now buttons
// Strategy: find all buttons with primaryColor bg and add dynamic border radius

// 1. Add a helper function after the props line
const helperTarget = `    const props = { isModal, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, storeLang, isCartOpen, setIsCartOpen, submitGlobalOrder, storeProducts, primaryColor, secondaryColor, buttonStyle, fontFamily };`;
const helperNew = helperTarget + `\r\n\r\n    const btnRadius = buttonStyle === 'pill' ? '9999px' : buttonStyle === 'square' ? '0px' : '10px';\r\n    const btnStyle = { backgroundColor: primaryColor, borderRadius: btnRadius };\r\n    const cardBg = secondaryColor || '#ffffff';`;
c = c.replace(helperTarget, helperNew);

// 2. Pass btnStyle and cardBg in props
c = c.replace(
  `storeProducts, primaryColor, secondaryColor, buttonStyle, fontFamily };`,
  `storeProducts, primaryColor, secondaryColor, buttonStyle, fontFamily, btnStyle, btnRadius, cardBg };`
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('Helper vars added to props');
