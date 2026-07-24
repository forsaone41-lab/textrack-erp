const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const badDestructuring = `const [showTopBar, topBarText, topBarBgColor, topBarTextColor, topBarPosition, topBarAnimation,
        storeProducts, setStoreProducts] = useState(`;
const goodDestructuring = `const [storeProducts, setStoreProducts] = useState(`;

if (content.includes(badDestructuring)) {
   content = content.replace(badDestructuring, goodDestructuring);
} else {
   // Maybe spaces are different
   content = content.replace(/const \[showTopBar, topBarText, topBarBgColor, topBarTextColor, topBarPosition, topBarAnimation,\s*storeProducts, setStoreProducts\] = useState\(/g, goodDestructuring);
}

const handleSaveRegex = /const handleSave = async \(\) => \{\s*try \{\s*setIsSaving\(true\);\s*const payload = \{\s*storeName,\s*customDomain,/g;
const newHandleSaveRegex = `const handleSave = async () => {\n    try {\n      setIsSaving(true);\n\n      const payload = {\n        showTopBar, topBarText, topBarBgColor, topBarTextColor, topBarPosition, topBarAnimation,\n        storeName,\n        customDomain,`;

if (content.match(handleSaveRegex)) {
   content = content.replace(handleSaveRegex, newHandleSaveRegex);
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log("Fixed syntax error");
