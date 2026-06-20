const fs = require('fs');

let content = fs.readFileSync('src/pages/ChaineDetaillee.tsx', 'utf8');

const target = `                    <div key={op.id} className="group p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/10" />`;

const replacement = `                    <div key={op.id} className="group p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm hover:shadow-xl relative">
                       <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/10" />
                       </div>`;

// Try exact replacement
if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/ChaineDetaillee.tsx', content, 'utf8');
  console.log("Successfully fixed overflow with exact match");
} else {
  // If exact match fails due to line endings, normalize and try
  let normalizedContent = content.replace(/\r\n/g, '\n');
  let normalizedTarget = target.replace(/\r\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    normalizedContent = normalizedContent.replace(normalizedTarget, replacement);
    fs.writeFileSync('src/pages/ChaineDetaillee.tsx', normalizedContent, 'utf8');
    console.log("Successfully fixed overflow with normalized match");
  } else {
    // If it still fails, use a line-by-line approach
    let lines = content.split('\n');
    let idx = lines.findIndex(l => l.includes('hover:shadow-xl relative overflow-hidden"'));
    if (idx !== -1) {
      lines[idx] = lines[idx].replace('relative overflow-hidden"', 'relative"');
      lines.splice(idx + 1, 0, '                       <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">');
      lines.splice(idx + 3, 0, '                       </div>');
      fs.writeFileSync('src/pages/ChaineDetaillee.tsx', lines.join('\n'), 'utf8');
      console.log("Successfully fixed overflow with line index match");
    } else {
      console.log("Failed to find target");
    }
  }
}
