const fs = require('fs');

const file = 'src/pages/Settings.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes('import { compressImage }')) {
    code = code.replace("import { CompanyProfile, loadCompanyProfile, saveCompanyProfile } from '../types';", "import { CompanyProfile, loadCompanyProfile, saveCompanyProfile } from '../types';\nimport { compressImage } from '../utils/image';");
}

// Replace the block inside onChange
code = code.replace(/const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => handleChange\('([^']+)', reader\.result as string\);\s*reader\.readAsDataURL\(file\);/g, "compressImage(file).then(res => handleChange('$1', res)).catch(console.error);");

fs.writeFileSync(file, code);
console.log('Fixed', file);
