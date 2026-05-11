const fs = require('fs');

const filesToFix = [
  'src/pages/FichesTechniques.tsx',
  'src/pages/ManageOrder.tsx',
  'src/pages/PortailClient.tsx',
  'src/pages/Echantillons.tsx'
];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Skip if compressImage not imported
  if (!code.includes('import { compressImage }')) {
    code = code.replace(/(import .* from '..\/types';)/, "$1\nimport { compressImage } from '../utils/image';");
  }

  // Find pattern:
  // const reader = new FileReader();
  // reader.onloadend = () => {
  //   setForm({ ...form, modelePhoto: reader.result as string });
  // };
  // reader.readAsDataURL(file);

  const regex = /const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => \{\s*([^;]+reader\.result as string[^;]*);\s*\};\s*reader\.readAsDataURL\(file\);/g;

  code = code.replace(regex, (match, p1) => {
      // p1 is the statement inside onloadend, e.g. "setForm({ ...form, modelePhoto: reader.result as string })"
      const modifiedStatement = p1.replace('reader.result as string', 'res');
      return `compressImage(file).then(res => { ${modifiedStatement}; }).catch(console.error);`;
  });

  fs.writeFileSync(file, code);
  console.log('Fixed', file);
}
