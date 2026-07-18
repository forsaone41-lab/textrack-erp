const fs = require('fs');
const lines = fs.readFileSync('src/pages/StoreBuilder.tsx','utf8').split('\n');

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('setSortBy') || lines[i].includes('sortBy')) {
    console.log(i+1, lines[i].trim());
  }
}
