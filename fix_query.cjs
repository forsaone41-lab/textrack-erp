const fs = require('fs');
let sbContent = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const queryOld = `            if (storeNameUrl) {
               query = query.eq('config_json->>storeName', storeNameUrl);
            } else {
               query = query.eq('domain', currentDomain);
            }`;

const queryNew = `            if (storeNameUrl) {
               query = query.eq('domain', \`\${storeNameUrl}.beyacreative.com\`);
            } else {
               query = query.eq('domain', currentDomain);
            }`;

if (sbContent.includes(queryOld)) {
    sbContent = sbContent.replace(queryOld, queryNew);
} else if (sbContent.includes(queryOld.replace(/\r\n/g, '\n'))) {
    sbContent = sbContent.replace(queryOld.replace(/\r\n/g, '\n'), queryNew);
} else {
    console.log("Could not find query text");
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', sbContent, 'utf-8');
console.log('Query fixed!');
