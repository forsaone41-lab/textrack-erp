const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

let index = 0;
while (true) {
    index = c.indexOf("page === 'checkout'", index);
    if (index === -1) break;
    let endIndex = c.indexOf("</button>", index);
    if (endIndex !== -1) {
        console.log("-----------------------");
        console.log(c.substring(index, endIndex + 9));
        index = endIndex + 9;
    } else {
        index += 10;
    }
}
