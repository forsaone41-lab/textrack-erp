const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const oldIcon = "{isAIGenerating ? <Loader2 className=\"w-4 h-4 animate-spin\" /> : <Sparkles className=\"w-4 h-4\" />}";
const newIcon = "{isAIGenerating ? <Loader2 className=\"w-4 h-4 animate-spin\" /> : <Settings className=\"w-4 h-4\" />}";

const oldText = "{isAr ? 'تحليل بالذكاء الاصطناعي' : 'Analyser avec l\\'IA ✨'}";
const newText = "{isAr ? 'مساعد BEYA' : 'BEYA ASSISTANT'}";

content = content.replace(oldIcon, newIcon);
content = content.replace(oldText, newText);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Button patched successfully');
