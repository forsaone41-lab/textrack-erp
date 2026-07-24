const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

  // Find the span with bg-clip-text and add pb-4 to prevent the clipping of Arabic letters like 'ى'
  // Also adjust leading of the h1 to leading-snug to give it more breathing room
  content = content.replace(
    /className="text-4xl md:text-5xl lg:text-\[4\.5rem\] font-extrabold mb-8 tracking-tight leading-tight uppercase text-slate-900/g,
    'className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold mb-8 tracking-tight leading-snug uppercase text-slate-900'
  );

  content = content.replace(
    /className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"/g,
    'className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 pb-4 inline-block"'
  );

  fs.writeFileSync('src/pages/LandingPage.tsx', content, 'utf8');
  console.log("Successfully fixed the clipped text issue");
} catch(err) {
  console.error("Failed:", err);
}
