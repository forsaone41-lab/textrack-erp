const fs = require('fs');
const file = 'src/pages/SetupLanding.tsx';
let content = fs.readFileSync(file, 'utf8');

// The pattern to match the start of a card's image container
const regex = /<div className="aspect-\[4\/5\] bg-slate-100 rounded-2xl overflow-hidden relative">\s*<img src="([^"]+)" className="w-full h-full object-cover ([^"]+)"/g;

const replacement = `<div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative border-[4px] border-slate-200">
                {/* Browser Header */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-slate-200/90 backdrop-blur z-20 flex items-center px-3 gap-1.5 border-b border-slate-300">
                  <div className="w-2 h-2 rounded-full bg-red-400/80"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400/80"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400/80"></div>
                </div>
                <img src="$1" className="w-full h-full object-cover pt-6 $2"`;

const newContent = content.replace(regex, replacement);

fs.writeFileSync(file, newContent);
console.log('Mockup frames added successfully!');
