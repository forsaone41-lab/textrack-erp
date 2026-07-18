const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// 1. Add useEffect to imports
content = content.replace(/import React, { useState } from 'react';/, "import React, { useState, useEffect } from 'react';");

// 2. Initialize storeLogo from config
content = content.replace(/const \[storeLogo, setStoreLogo\] = useState\(''\);/, "const [storeLogo, setStoreLogo] = useState(config.storeLogo || '');");

// 3. Add storeLogo to storeConfig inside handleSave
const oldHandleSave = `      const storeConfig = {
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
      };`;

const newHandleSave = `      const storeConfig = {
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
      };`;
content = content.replace(oldHandleSave, newHandleSave);

// 4. Add the useEffect block after the footerSettings state (around line 77)
const oldFooterSettings = `    copyright: '© 2026 My Brand. Tous droits réservés.',
    showPrivacy: true,
    showTerms: true,
    showCookies: true
  });`;

const newFooterSettings = `    copyright: '© 2026 My Brand. Tous droits réservés.',
    showPrivacy: true,
    showTerms: true,
    showCookies: true
  });

  useEffect(() => {
     if (isLiveStore) {
        document.title = storeName;
        if (storeLogo) {
           let link = document.querySelector("link[rel~='icon']");
           if (!link) {
               link = document.createElement('link');
               link.rel = 'icon';
               document.getElementsByTagName('head')[0].appendChild(link);
           }
           link.href = storeLogo;
        }
     }
  }, [isLiveStore, storeName, storeLogo]);`;

content = content.replace(oldFooterSettings, newFooterSettings);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Title and favicon patch applied!');
