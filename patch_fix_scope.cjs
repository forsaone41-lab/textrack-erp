const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// The problem: btnStyle, btnRadius, cardBg are defined INSIDE StorePreviewWrapper (line ~1415-1417)
// but they're used in Layout components (LayoutHeroCenter etc.) which are ALSO inside StoreBuilder
// but NOT inside StorePreviewWrapper. So they can't access them.

// FIX: Move these computed values to just after the state declarations (outer scope of StoreBuilder)
// and remove them from inside StorePreviewWrapper

// 1. Remove from inside StorePreviewWrapper
const insideWrapper = `\r\n    const btnRadius = buttonStyle === 'pill' ? '9999px' : buttonStyle === 'square' ? '0px' : '10px';\r\n    const btnStyle = { backgroundColor: primaryColor, borderRadius: btnRadius };\r\n    const cardBg = secondaryColor || '#ffffff';`;
if (c.includes(insideWrapper)) {
  c = c.replace(insideWrapper, '');
  console.log('Removed from StorePreviewWrapper');
} else {
  console.log('WARNING: insideWrapper not found');
}

// 2. Also clean up props - remove btnStyle, btnRadius, cardBg from props (they're in outer scope, not needed in props)
c = c.replace(
  ', primaryColor, secondaryColor, buttonStyle, fontFamily, btnStyle, btnRadius, cardBg };',
  ', primaryColor, secondaryColor, buttonStyle, fontFamily };'
);

// 3. Add computed vars to outer StoreBuilder scope, right after showReviews state
const outerTarget = `  const [showReviews, setShowReviews] = useState(config.showReviews !== undefined ? config.showReviews : true);`;
const outerNew = outerTarget + `
  // Computed design vars - available to all Layout components
  const btnRadius = buttonStyle === 'pill' ? '9999px' : buttonStyle === 'square' ? '0px' : '10px';
  const btnStyle = { backgroundColor: primaryColor, borderRadius: btnRadius };
  const cardBg = secondaryColor || '#ffffff';`;

c = c.replace(outerTarget, outerNew);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');

// Verify
const hasBtnRadius = c.includes('const btnRadius = buttonStyle');
const hasInsideWrapper = c.includes('const btnStyle = { backgroundColor: primaryColor, borderRadius: btnRadius };');
const count = (c.match(/const btnStyle/g) || []).length;
console.log('btnRadius in outer scope:', hasBtnRadius);
console.log('btnStyle count (should be 1):', count);
