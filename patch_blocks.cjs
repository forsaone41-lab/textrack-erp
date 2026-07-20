const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Add State Variables
const stateStr = '  const [footerSettings, setFooterSettings] = useState(config.footerSettings || {';
const stateNew =   const [newsletterTitle, setNewsletterTitle] = useState(config.newsletterTitle || 'Rejoignez notre Newsletter');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState(config.newsletterSubtitle || 'Recevez nos dernières offres et nouveautés directement dans votre boîte mail.');
  const [featuresData, setFeaturesData] = useState(config.featuresData || [
    { icon: 'Truck', title: 'Livraison Rapide', subtitle: 'Partout au Maroc' },
    { icon: 'ShieldCheck', title: 'Paiement Sécurisé', subtitle: '100% garanti' },
    { icon: 'Star', title: 'Qualité Premium', subtitle: 'Produits certifiés' }
  ]);
  const [videoUrl, setVideoUrl] = useState(config.videoUrl || '');
 + stateStr;

if (content.includes(stateStr)) {
    content = content.replace(stateStr, stateNew);
} else {
    console.log('Failed state var');
}

// 2. Add to config payload
const saveStr = '       sliderImages,\n       footerSettings';
const saveNew = '       sliderImages,\n       footerSettings,\n       newsletterTitle,\n       newsletterSubtitle,\n       featuresData,\n       videoUrl';
if (content.includes(saveStr)) {
    content = content.replace(saveStr, saveNew);
} else {
    // fallback check with carriage return
    const saveStrCR = '       sliderImages,\r\n       footerSettings';
    if(content.includes(saveStrCR)) {
        content = content.replace(saveStrCR, saveNew);
    } else {
        console.log('Failed save payload');
    }
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Patch step 1 applied');
