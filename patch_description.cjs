const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'StoreBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Insert ReadMoreDescription at the top after imports
const readMoreComponent = `
const ReadMoreDescription = ({ text, className, isAr }: any) => {
   const [expanded, setExpanded] = React.useState(false);
   if (!text) return null;
   const maxLength = 100;
   if (text.length <= maxLength) return <p className={className}>{text}</p>;
   
   // Extract any mb-* classes to apply to the wrapper instead, so we don't have weird spacing
   const mbMatch = className.match(/mb-\\d+/);
   const mbClass = mbMatch ? mbMatch[0] : 'mb-6';
   const innerClass = className.replace(/mb-\\d+/, '').trim();

   return (
      <div className={mbClass}>
         <p className={\`\${innerClass} mb-2\`}>
            {expanded ? text : \`\${text.substring(0, maxLength)}...\`}
         </p>
         <button onClick={() => setExpanded(!expanded)} className="text-[10px] font-black underline underline-offset-4 text-slate-800 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            {expanded ? (isAr ? 'عرض أقل' : 'Voir moins') : (isAr ? 'اقرأ المزيد' : 'Lire la suite')}
         </button>
      </div>
   );
};
`;

if (!content.includes('const ReadMoreDescription')) {
    content = content.replace(/(import .* from 'lucide-react';\s*)/, `$1\n${readMoreComponent}\n`);
}

// 2. Replace <p className="...">...description...</p> with <ReadMoreDescription />
const regex1 = /<p className="([^"]+)">\{p\.description \|\| ([^<]+)\}<\/p>/g;
content = content.replace(regex1, (match, cls, fallback) => {
    return `<ReadMoreDescription text={p.description || ${fallback}} className="${cls}" isAr={storeIsAr} />`;
});

// Also replace for product.description if any
const regex2 = /<p className="([^"]+)">\n?\s*\{product\.description\}\n?\s*<\/p>/g;
content = content.replace(regex2, (match, cls) => {
    return `<ReadMoreDescription text={product.description} className="${cls}" isAr={storeIsAr} />`;
});

// Also replace the specific Mazia one
const regexMazia = /<p>\{storeLang === 'ar' \? \`وصف تفصيلي.*?<\/p>/g;
content = content.replace(regexMazia, `<ReadMoreDescription text={product.description || (storeLang === 'ar' ? \`وصف تفصيلي لـ \${product.name}.\` : \`Description détaillée de \${product.name}.\`)} className="text-slate-500 text-sm leading-relaxed mb-8" isAr={storeIsAr} />`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Description read-more patch applied.');
