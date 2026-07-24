const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

  // Find the exact button for "Commander mes produits" inside the services section
  const targetButton = `<button onClick={() => document.getElementById('contact-form')?.scrollIntoView({behavior:'smooth'})} className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-1 relative z-10">`;
  
  const newButton = `<a href="/#/devis-express" className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-1 relative z-10">`;

  // We need to change the closing tag too. It's currently </button> right after the ArrowRight
  // So instead of just replacing the start, let's use regex for the whole element
  const regex = /<button onClick=\{\(\) => document\.getElementById\('contact-form'\)\?\.scrollIntoView\(\{behavior:'smooth'\}\)\} className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600\/20 hover:shadow-purple-600\/40 hover:-translate-y-1 relative z-10">\s*\{isAr \? 'اطلب تصنيع منتجاتك' : 'Commander mes produits'\}\s*<ArrowRight className="w-5 h-5" \/>\s*<\/button>/g;

  const replacement = `<a href="/#/devis-express" className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-1 relative z-10">
                {isAr ? 'اطلب تصنيع منتجاتك' : 'Commander mes produits'}
                <ArrowRight className="w-5 h-5" />
              </a>`;

  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/pages/LandingPage.tsx', content, 'utf8');
    console.log("Successfully replaced the button to redirect to /#/devis-express");
  } else {
    console.log("Regex didn't match. Will try a simpler approach.");
    let lines = content.split('\\n');
    let modified = false;
    for(let i=0; i<lines.length; i++) {
        if(lines[i].includes("اطلب تصنيع منتجاتك") && lines[i].includes("Commander mes produits") && lines[i-1].includes("<button onClick={() => document.getElementById('contact-form')")) {
            lines[i-1] = lines[i-1].replace('<button onClick={() => document.getElementById(\\\'contact-form\\\')?.scrollIntoView({behavior:\\\'smooth\\\'})}', '<a href="/#/devis-express"');
            lines[i+1] = lines[i+1].replace('</button>', '</a>');
            modified = true;
            break;
        }
    }
    if (modified) {
        fs.writeFileSync('src/pages/LandingPage.tsx', lines.join('\\n'), 'utf8');
        console.log("Successfully replaced the button using lines approach");
    } else {
        // Third fallback
        content = content.replace(
            /<button onClick=\{\(\) => document.getElementById\('contact-form'\)\?.scrollIntoView\(\{behavior:'smooth'\}\)\} className="inline-flex/g,
            '<a href="/#/devis-express" className="inline-flex'
        );
        content = content.replace(
            /Commander mes produits'\}\n\s*<ArrowRight className="w-5 h-5" \/>\n\s*<\/button>/g,
            `Commander mes produits'}\n                <ArrowRight className="w-5 h-5" />\n              </a>`
        );
        fs.writeFileSync('src/pages/LandingPage.tsx', content, 'utf8');
        console.log("Successfully replaced using fallback regex");
    }
  }

} catch(err) {
  console.error("Failed:", err);
}
