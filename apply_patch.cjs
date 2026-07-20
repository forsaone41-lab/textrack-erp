const fs = require('fs');

const patch = JSON.parse(fs.readFileSync('patch.json', 'utf-8'));
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. State
let old = patch.state_old;
if (content.includes(old)) content = content.replace(old, patch.state_new);
else if (content.includes(old.replace(/\r\n/g, '\n'))) content = content.replace(old.replace(/\r\n/g, '\n'), patch.state_new);

// 2. Save
old = patch.save_old;
if (content.includes(old)) content = content.replace(old, patch.save_new);
else if (content.includes(old.replace(/\r\n/g, '\n'))) content = content.replace(old.replace(/\r\n/g, '\n'), patch.save_new);

// 3. Sidebar Grid
old = patch.sidebar_old;
if (content.includes(old)) content = content.replace(old, patch.sidebar_new);
else if (content.includes(old.replace(/\r\n/g, '\n'))) content = content.replace(old.replace(/\r\n/g, '\n'), patch.sidebar_new);

// 4. Params
old = patch.params_old;
if (content.includes(old)) content = content.replace(old, patch.params_new);
else if (content.includes(old.replace(/\r\n/g, '\n'))) content = content.replace(old.replace(/\r\n/g, '\n'), patch.params_new);

// CheckCircle import
if (!content.includes('CheckCircle') || !content.includes('Plus')) {
    content = content.replace("import { Store, Globe", "import { Store, Globe, CheckCircle, Plus");
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Patch successfully applied from json');
