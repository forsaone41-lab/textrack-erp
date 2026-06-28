const fs = require('fs');

function shrinkForm(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Modal body padding and spacing
  c = c.replace(/p-6 md:p-10/g, 'p-4 md:p-6');
  c = c.replace(/p-5 md:p-8/g, 'p-4 md:p-6');
  c = c.replace(/space-y-6/g, 'space-y-4');

  // Model block
  c = c.replace(/p-4 md:p-6 space-y-4/g, 'p-3 md:p-4 space-y-3');

  // Inputs
  c = c.replace(/py-3 px-4/g, 'py-2 px-3');
  c = c.replace(/h-\[50px\]/g, 'h-[40px]');
  
  // Font sizes
  c = c.replace(/text-\[11px\]/g, 'text-[10px]');
  
  // Photo upload boxes
  c = c.replace(/w-\[100px\] h-\[100px\]/g, 'w-[70px] h-[70px]');
  c = c.replace(/w-8 h-8/g, 'w-6 h-6'); // step numbers
  c = c.replace(/w-6 h-6 text-slate-300 mb-1/g, 'w-4 h-4 text-slate-300 mb-1'); // image icon

  fs.writeFileSync(filePath, c);
}

shrinkForm('src/pages/AdsLanding.tsx');
shrinkForm('src/pages/LandingPage.tsx');
