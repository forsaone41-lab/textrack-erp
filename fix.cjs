const fs = require('fs');

const filesToFix = [
  'src/pages/Settings.tsx',
  'src/pages/FichesTechniques.tsx',
  'src/pages/ManageOrder.tsx',
  'src/pages/PortailClient.tsx',
  'src/pages/Echantillons.tsx',
  'src/pages/Recrutement.tsx'
];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Skip if already imported
  if (!code.includes('import { compressImage }') && code.includes('new FileReader()')) {
    // Add import after other imports
    code = code.replace(/(import .* from '..\/types';)/, "$1\nimport { compressImage } from '../utils/image';");
    if (!code.includes('import { compressImage }')) {
        code = code.replace(/(import .* from '..\/utils\/[a-zA-Z0-9]+';)/, "$1\nimport { compressImage } from '../utils/image';");
    }
  }

  // Common pattern 1: handleChange('key', reader.result)
  code = code.replace(/const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => handleChange\('([^']+)', reader\.result as string\);\s*reader\.readAsDataURL\(file\);/g, 
    "compressImage(file).then(res => handleChange('$1', res)).catch(console.error);");
  
  // Common pattern 2: setProfile({ ...profile, key: reader.result })
  // etc, but let's just stick to what we know is in Settings.tsx
  
  // Replace all other simple FileReader base64 reads if they follow a basic pattern
  // Actually it's safer to just let the script run the specific ones we know.
  fs.writeFileSync(file, code);
  console.log('Fixed', file);
}
