const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Fix the Visit URL
const urlRegex = /const url = customDomain \? `https:\/\/\${customDomain}` : `\${window\.location\.origin}\${window\.location\.pathname}#\/store\/\${storeName\.toLowerCase\(\)\.replace\(\/\\s\+\/g, ''\)}`;/g;
const urlNew = `const url = customDomain ? \`https://\${customDomain}\` : \`https://\${storeName.toLowerCase().replace(/\\s+/g, '')}.beyacreative.com\`;`;

if (content.match(urlRegex)) {
    content = content.replace(urlRegex, urlNew);
} else {
    console.log("Could not find line 1863 regex match.");
}

// 2. Fix the Display URL in Settings tab
const displayRegex = /\{window\.location\.origin\}\{window\.location\.pathname\}#\/store\/\{storeName\.toLowerCase\(\)\.replace\(\/\\s\+\/g, ''\)\}/g;
const displayNew = `https://{storeName.toLowerCase().replace(/\\s+/g, '')}.beyacreative.com`;

if (content.match(displayRegex)) {
    content = content.replace(displayRegex, displayNew);
} else {
    console.log("Could not find display regex match.");
}

// 3. Fix the clipboard Copy
const copyRegex = /navigator\.clipboard\.writeText\(`\${window\.location\.origin}\${window\.location\.pathname}#\/store\/\${storeName\.toLowerCase\(\)\.replace\(\/\\s\+\/g, ''\)}`\);/g;
const copyNew = `navigator.clipboard.writeText(\`https://\${storeName.toLowerCase().replace(/\\s+/g, '')}.beyacreative.com\`);`;

if (content.match(copyRegex)) {
    content = content.replace(copyRegex, copyNew);
} else {
    console.log("Could not find copy regex match.");
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Subdomain URLs patched successfully!');
