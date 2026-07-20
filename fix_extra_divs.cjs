const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// There are 3 checkout blocks (the page === 'checkout' ones).
// Each has an extra `</div>` because my replacement left the closing div of the space-y container.
// The structure currently is:
/*
                  <div className="mt-6">
                     <CheckoutForm ... />
                  </div>
                 </div>  <-- THIS ONE IS EXTRA
              </div>
           </div>
        )}
*/

const badBlock = `                  </div>\r\n                 </div>\r\n              </div>\r\n           </div>\r\n        )}`;
const goodBlock = `                  </div>\r\n              </div>\r\n           </div>\r\n        )}`;

let count = 0;
while (c.includes(badBlock)) {
    c = c.replace(badBlock, goodBlock);
    count++;
}
console.log('Fixed extra closing div (type 1):', count);

// Other variations depending on indentation
const badBlock2 = `                  </div>\r\n                  </div>\r\n               </div>\r\n            </div>\r\n         )}`;
const goodBlock2 = `                  </div>\r\n               </div>\r\n            </div>\r\n         )}`;
while (c.includes(badBlock2)) {
    c = c.replace(badBlock2, goodBlock2);
    count++;
}
console.log('Fixed extra closing div (type 2):', count);

const badBlock3 = `                  </div>\r\n               </div>\r\n            </div>\r\n         )}`;
const goodBlock3 = `                  </div>\r\n            </div>\r\n         )}`;
// Wait, we need to be careful with badBlock3. Let's just use regex to find `<CheckoutForm ... />\r\n                  </div>\r\n                 </div>` and remove the second `</div>`.

// Let's use a safer regex approach:
// Find `/>\s*</div>\s*</div>\s*</div>\s*</div>\s*)}` and replace with `/>\n</div>\n</div>\n</div>\n)}`
const fixExtraDivs = /<CheckoutForm[\s\S]*?\/>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)/g;
c = c.replace(fixExtraDivs, (match) => {
    // We found a CheckoutForm followed by 4 closing divs before `})`
    // We only need 3 closing divs:
    // 1 for mt-6, 1 for bg-white container, 1 for outer p-8 container.
    return match.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '</div>\n              </div>\n           </div>');
});

fs.writeFileSync('src/pages/StoreBuilder.tsx', c);
console.log('Done fixing divs.');
