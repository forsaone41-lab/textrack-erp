const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Import supabase
if (!content.includes("import { supabase }")) {
  content = content.replace("import { useLang } from '../contexts/LangContext';", "import { useLang } from '../contexts/LangContext';\nimport { supabase } from '../supabase';");
}

// 2. Add storeId state & loading state
if (!content.includes("const [storeId, setStoreId]")) {
  content = content.replace(
    "const [isSaving, setIsSaving] = useState(false);",
    "const [isSaving, setIsSaving] = useState(false);\n  const [isLoadingStore, setIsLoadingStore] = useState(false);\n  const [storeId, setStoreId] = useState('demo_store');"
  );
}

// 3. Update useEffect to fetch from Supabase
const useEffectOld = `
  useEffect(() => {
     if (isLiveStore) {
        const savedConfig = getSavedConfig();
        if (savedConfig.storeLang !== undefined) setStoreIsAr(savedConfig.storeLang);
        if (savedConfig.storeName) setStoreName(savedConfig.storeName);
        if (savedConfig.storeLogo) setStoreLogo(savedConfig.storeLogo);
        if (savedConfig.activeTheme) setActiveTheme(savedConfig.activeTheme);
        if (savedConfig.primaryColor) setPrimaryColor(savedConfig.primaryColor);
        if (savedConfig.fontFamily) setFontFamily(savedConfig.fontFamily);
        if (savedConfig.heroImage) setHeroImage(savedConfig.heroImage);
        if (savedConfig.heroTitle) setHeroTitle(savedConfig.heroTitle);
        if (savedConfig.heroSubtitle) setHeroSubtitle(savedConfig.heroSubtitle);
        if (savedConfig.heroButtonText) setHeroButtonText(savedConfig.heroButtonText);
        if (savedConfig.homeCollectionsTitle) setHomeCollectionsTitle(savedConfig.homeCollectionsTitle);
        if (savedConfig.allCollectionsTitle) setAllCollectionsTitle(savedConfig.allCollectionsTitle);
     }
  }, [isLiveStore]);
`;

const useEffectNew = `
  useEffect(() => {
     const loadStore = async () => {
         setIsLoadingStore(true);
         try {
             // Fetch from Supabase
             const { data, error } = await supabase.from('stores').select('*').eq('id', storeId).single();
             if (data) {
                 if (data.store_lang !== undefined) setStoreIsAr(data.store_lang === 'ar');
                 if (data.store_name) setStoreName(data.store_name);
                 if (data.active_theme) setActiveTheme(data.active_theme);
                 if (data.primary_color) setPrimaryColor(data.primary_color);
                 if (data.font_family) setFontFamily(data.font_family);
                 if (data.hero_image) setHeroImage(data.hero_image);
                 if (data.hero_title) setHeroTitle(data.hero_title);
                 if (data.hero_subtitle) setHeroSubtitle(data.hero_subtitle);
                 if (data.hero_button_text) setHeroButtonText(data.hero_button_text);
                 if (data.home_collections_title) setHomeCollectionsTitle(data.home_collections_title);
                 if (data.all_collections_title) setAllCollectionsTitle(data.all_collections_title);
                 if (data.pages) setStorePages(data.pages);
                 if (data.footer_settings) setFooterSettings(data.footer_settings);
                 if (data.buy_mode) setBuyMode(data.buy_mode);
             } else {
                 // Fallback to localStorage if not found in DB
                 const savedConfig = getSavedConfig();
                 if (savedConfig.storeLang !== undefined) setStoreIsAr(savedConfig.storeLang);
                 if (savedConfig.storeName) setStoreName(savedConfig.storeName);
                 if (savedConfig.storeLogo) setStoreLogo(savedConfig.storeLogo);
                 if (savedConfig.activeTheme) setActiveTheme(savedConfig.activeTheme);
                 if (savedConfig.primaryColor) setPrimaryColor(savedConfig.primaryColor);
                 if (savedConfig.fontFamily) setFontFamily(savedConfig.fontFamily);
                 if (savedConfig.heroImage) setHeroImage(savedConfig.heroImage);
                 if (savedConfig.heroTitle) setHeroTitle(savedConfig.heroTitle);
                 if (savedConfig.heroSubtitle) setHeroSubtitle(savedConfig.heroSubtitle);
                 if (savedConfig.heroButtonText) setHeroButtonText(savedConfig.heroButtonText);
                 if (savedConfig.homeCollectionsTitle) setHomeCollectionsTitle(savedConfig.homeCollectionsTitle);
                 if (savedConfig.allCollectionsTitle) setAllCollectionsTitle(savedConfig.allCollectionsTitle);
             }
         } catch (e) {
             console.error("Error loading store:", e);
         } finally {
             setIsLoadingStore(false);
         }
     };
     loadStore();
  }, [storeId]);
`;

if (content.includes("if (isLiveStore) {\n        const savedConfig = getSavedConfig();")) {
    content = content.replace(useEffectOld.trim(), useEffectNew.trim());
}

// 4. Replace handleSave and handlePublish
const handleSaveOld = `
  const handleSave = () => {
    setIsSaving(true);
    const storeConfig = {
       storeLang,
       storeName,
       storeLogo,
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
  };
`;

const handleSaveNew = `
  const handleSave = async () => {
    setIsSaving(true);
    
    // Save to localStorage as backup
    const storeConfig = {
       storeLang, storeName, storeLogo, activeTheme, primaryColor, fontFamily,
       heroImage, heroTitle, heroSubtitle, heroButtonText, homeCollectionsTitle, allCollectionsTitle
    };
    localStorage.setItem('beya_store_config', JSON.stringify(storeConfig));

    // Save to Supabase
    try {
        await supabase.from('stores').upsert({
            id: storeId,
            store_name: storeName,
            store_lang: storeIsAr ? 'ar' : 'fr',
            active_theme: activeTheme,
            primary_color: primaryColor,
            font_family: fontFamily,
            hero_image: heroImage,
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            hero_button_text: heroButtonText,
            home_collections_title: homeCollectionsTitle,
            all_collections_title: allCollectionsTitle,
            pages: storePages,
            footer_settings: footerSettings,
            buy_mode: buyMode,
            updated_at: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error saving store:", e);
    }

    setIsSaving(false);
  };
`;

if (content.includes("localStorage.setItem('beya_store_config', JSON.stringify(storeConfig));")) {
    // Only replace if it matches the general structure, but since whitespace can be tricky, 
    // let's do a more robust regex or direct index replacement.
    content = content.replace(
        /const handleSave = \(\) => \{[\s\S]*?setTimeout\(\(\) => setIsSaving\(false\), 1000\);\n\s*\};/,
        handleSaveNew.trim()
    );
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Patched StoreBuilder with Supabase!');
