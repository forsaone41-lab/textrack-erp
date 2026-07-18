const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add getSavedConfig at the top of the file
const getSavedConfigCode = `
const getSavedConfig = () => {
    try {
        const saved = localStorage.getItem('beya_store_config');
        return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
};
`;
content = content.replace(/export default function StoreBuilder\(\{ isLiveStore = false \}: \{ isLiveStore\?: boolean \}\) \{/, getSavedConfigCode + "\nexport default function StoreBuilder({ isLiveStore = false }: { isLiveStore?: boolean }) {\n  const config = getSavedConfig();");

// 2. Replace the relevant state initializations
content = content.replace(/const \[storeName, setStoreName\] = useState\('My Brand'\);/, "const [storeName, setStoreName] = useState(config.storeName || 'My Brand');");
content = content.replace(/const \[storeLang, setStoreLang\] = useState<'fr'\|'en'\|'ar'>\('fr'\);/, "const [storeLang, setStoreLang] = useState<'fr'|'en'|'ar'>(config.storeLang || 'fr');");
content = content.replace(/const \[activeTheme, setActiveTheme\] = useState\(THEMES\[0\]\);/, "const [activeTheme, setActiveTheme] = useState(config.activeTheme || THEMES[0]);");
content = content.replace(/const \[primaryColor, setPrimaryColor\] = useState\(THEMES\[0\].defaultColor\);/, "const [primaryColor, setPrimaryColor] = useState(config.primaryColor || THEMES[0].defaultColor);");
content = content.replace(/const \[fontFamily, setFontFamily\] = useState\(THEMES\[0\].defaultFont\);/, "const [fontFamily, setFontFamily] = useState(config.fontFamily || THEMES[0].defaultFont);");
content = content.replace(/const \[heroImage, setHeroImage\] = useState\(THEMES\[0\].previewImg\);/, "const [heroImage, setHeroImage] = useState(config.heroImage || THEMES[0].previewImg);");
content = content.replace(/const \[heroTitle, setHeroTitle\] = useState\('New Collection'\);/, "const [heroTitle, setHeroTitle] = useState(config.heroTitle || 'New Collection');");
content = content.replace(/const \[heroSubtitle, setHeroSubtitle\] = useState\('Discover our latest premium quality garments.'\);/, "const [heroSubtitle, setHeroSubtitle] = useState(config.heroSubtitle || 'Discover our latest premium quality garments.');");
content = content.replace(/const \[heroButtonText, setHeroButtonText\] = useState\('Shop Now'\);/, "const [heroButtonText, setHeroButtonText] = useState(config.heroButtonText || 'Shop Now');");
content = content.replace(/const \[homeCollectionsTitle, setHomeCollectionsTitle\] = useState\('Trending Now'\);/, "const [homeCollectionsTitle, setHomeCollectionsTitle] = useState(config.homeCollectionsTitle || 'Trending Now');");
content = content.replace(/const \[allCollectionsTitle, setAllCollectionsTitle\] = useState\('All Products'\);/, "const [allCollectionsTitle, setAllCollectionsTitle] = useState(config.allCollectionsTitle || 'All Products');");

// 3. Update handleSave
const oldHandleSave = `  const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000);
  };`;

const newHandleSave = `  const handleSave = () => {
      setIsSaving(true);
      const storeConfig = {
         storeLang,
         storeName,
         activeTheme,
         primaryColor,
         fontFamily,
         heroImage,
         heroTitle,
         heroSubtitle,
         heroButtonText,
         homeCollectionsTitle,
         allCollectionsTitle
      };
      localStorage.setItem('beya_store_config', JSON.stringify(storeConfig));
      setTimeout(() => setIsSaving(false), 1000);
  };`;

content = content.replace(oldHandleSave, newHandleSave);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Saved to localStorage patch applied!');
