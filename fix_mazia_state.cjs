const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const regex = /const LayoutMazia = \(\{ isModal, page, setPage, activeProductId, navigateToProduct, setIsCartOpen \}: any\) => \{\r?\n    const \[selectedSize, setSelectedSize\] = useState<string>\(''\);\r?\n    const \[selectedColor, setSelectedColor\] = useState<string>\(''\);\r?\n    const \[quantity, setQuantity\] = useState\(1\);/g;

const newStr = `  const LayoutMazia = ({ isModal, page, setPage, activeProductId, navigateToProduct, setIsCartOpen }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [activePDPTab, setActivePDPTab] = useState('description');`;

if (content.match(regex)) {
    content = content.replace(regex, newStr);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
    console.log("activePDPTab fixed in LayoutMazia!");
} else {
    console.log("Could not find regex match!");
}
