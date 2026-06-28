const fs = require('fs');

function squareBorders(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Outer success modals
  c = c.replace(/rounded-\[3rem\]/g, 'rounded-2xl');
  c = c.replace(/rounded-3xl md:rounded-\[3rem\]/g, 'rounded-2xl');
  c = c.replace(/rounded-3xl/g, 'rounded-2xl'); // For safety on outer containers

  // Inner credential box
  c = c.replace(/rounded-\[2rem\]/g, 'rounded-xl');
  
  // Outer simulator modal in AdsLanding and LandingPage
  c = c.replace(/rounded-\[2\.5rem\]/g, 'rounded-2xl');

  fs.writeFileSync(filePath, c);
}

squareBorders('src/pages/AdsLanding.tsx');
squareBorders('src/pages/LandingPage.tsx');
