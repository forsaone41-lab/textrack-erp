const fs = require('fs');

let content = fs.readFileSync('src/pages/NewLanding.tsx', 'utf-8');

// 1. Add Sun/Moon imports
content = content.replace(
  "ImageIcon, MousePointerClick, MessageSquareText, PhoneCall } from 'lucide-react';",
  "ImageIcon, MousePointerClick, MessageSquareText, PhoneCall, Sun, Moon } from 'lucide-react';"
);

// 2. Add isDark state
content = content.replace(
  "const { isAr, toggle } = useLang();",
  "const { isAr, toggle } = useLang();\n  const [isDark, setIsDark] = useState(true);"
);

// 3. Navbar toggle
content = content.replace(
  /<button\s+onClick=\{toggle\}\s+className="w-10 h-10 flex items-center justify-center rounded-xl bg-white\/5 hover:bg-white\/10 transition-colors border border-white\/5 text-\[10px\] font-black text-white"/g,
  `<button
              onClick={() => setIsDark(!isDark)}
              className={\`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border \${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'}\`}
              title={isDark ? 'Mode Jour' : 'Mode Nuit'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggle}
              className={\`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border text-[10px] font-black \${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'}\`}`
);

// 4. Main wrapper
content = content.replace(
  `className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30"`,
  `className={\`min-h-screen font-sans selection:bg-indigo-500/30 transition-colors duration-300 \${isDark ? 'bg-[#020617] text-slate-50' : 'bg-slate-50 text-slate-900'}\`}`
);

// 5. Navbar bg
content = content.replace(
  `className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5"`,
  `className={\`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 \${isDark ? 'bg-[#020617]/80 border-white/5' : 'bg-white/80 border-slate-200'}\`}`
);

// 6. Navbar Start button
content = content.replace(
  `className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-indigo-50 transition-colors text-sm"`,
  `className={\`px-6 py-2.5 font-semibold rounded-full transition-colors text-sm \${isDark ? 'bg-white text-black hover:bg-indigo-50' : 'bg-slate-900 text-white hover:bg-indigo-600'}\`}`
);

// 7. Hero subtitle text
content = content.replace(
  `className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"`,
  `className={\`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed \${isDark ? 'text-slate-400' : 'text-slate-600'}\`}`
);

// 8. User Guide Schema section
content = content.replace(
  `className="py-16 bg-[#020617] relative z-10 border-t border-white/5"`,
  `className={\`py-16 relative z-10 border-t transition-colors duration-300 \${isDark ? 'bg-[#020617] border-white/5' : 'bg-white border-slate-200'}\`}`
);
content = content.replace(
  `className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-white/10 -translate-y-1/2 z-0"`,
  `className={\`hidden md:block absolute top-1/2 left-10 right-10 h-0.5 -translate-y-1/2 z-0 \${isDark ? 'bg-white/10' : 'bg-slate-200'}\`}`
);

// We need a regex for usageSteps map rendering: 
content = content.replace(
  /className="relative z-10 bg-slate-900 border border-white\/10 p-6 rounded-2xl flex flex-col items-center text-center hover:border-indigo-500\/50 transition-colors"/g,
  `className={\`relative z-10 border p-6 rounded-2xl flex flex-col items-center text-center transition-colors \${isDark ? 'bg-slate-900 border-white/10 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50 shadow-sm'}\`}`
);

content = content.replace(
  /<h3 className="text-lg font-bold mb-2 text-white">\{isAr \? step\.titleAr : step\.titleFr\}<\/h3>/g,
  `<h3 className={\`text-lg font-bold mb-2 \${isDark ? 'text-white' : 'text-slate-900'}\`}>{isAr ? step.titleAr : step.titleFr}</h3>`
);

content = content.replace(
  /<p className="text-sm text-slate-400 leading-relaxed">\{isAr \? step\.descAr : step\.descFr\}<\/p>/g,
  `<p className={\`text-sm leading-relaxed \${isDark ? 'text-slate-400' : 'text-slate-600'}\`}>{isAr ? step.descAr : step.descFr}</p>`
);

// 9. Process Steps
content = content.replace(
  `className="py-24 bg-slate-900/50 border-y border-white/5 relative z-10"`,
  `className={\`py-24 border-y relative z-10 transition-colors duration-300 \${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200'}\`}`
);

content = content.replace(
  `className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0"`,
  `className={\`hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0 \${isDark ? 'bg-slate-800' : 'bg-slate-200'}\`}`
);

content = content.replace(
  /className="bg-slate-950 border border-slate-800 p-6 rounded-2xl h-full transition-all duration-300 hover:border-indigo-500 hover:shadow-\[0_0_30px_-10px_rgba\(79,70,229,0\.3\)\] hover:-translate-y-2 relative overflow-hidden"/g,
  `className={\`border p-6 rounded-2xl h-full transition-all duration-300 hover:border-indigo-500 hover:shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)] hover:-translate-y-2 relative overflow-hidden \${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}\`}`
);

content = content.replace(
  /<h3 className="text-lg font-bold mb-3 text-white">/g,
  `<h3 className={\`text-lg font-bold mb-3 \${isDark ? 'text-white' : 'text-slate-900'}\`}>`
);

// 10. Footer
content = content.replace(
  `className="py-12 border-t border-white/10 text-center text-slate-500"`,
  `className={\`py-12 border-t text-center text-slate-500 \${isDark ? 'border-white/10' : 'border-slate-200'}\`}`
);

// 11. Modal bg
content = content.replace(
  `className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"`,
  `className={\`relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300 \${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}\`}`
);

content = content.replace(
  `className="flex items-center justify-between p-6 border-b border-white/5 shrink-0"`,
  `className={\`flex items-center justify-between p-6 border-b shrink-0 \${isDark ? 'border-white/5' : 'border-slate-100'}\`}`
);

content = content.replace(
  /<button onClick=\{\(\) => !isSubmitting && setIsModalOpen\(false\)\} className="p-2 text-slate-400 hover:text-white bg-white\/5 rounded-full">/g,
  `<button onClick={() => !isSubmitting && setIsModalOpen(false)} className={\`p-2 rounded-full \${isDark ? 'text-slate-400 hover:text-white bg-white/5' : 'text-slate-500 hover:text-slate-900 bg-slate-100'}\`}>`
);

// Generic replaces
content = content.replace(
  /className=\{`w-full bg-slate-900 border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500(.*?)`\}/g,
  `className={\`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}$1\`}`
);

content = content.replace(
  /className=\{`w-full appearance-none bg-slate-900 border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 (.*?)`\}/g,
  `className={\`w-full appearance-none rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} $1\`}`
);

content = content.replace(
  /className=\{`p-4 rounded-xl border text-center transition-all \$\{\n(.*?)formData(.*?)=== (.*?)\n(.*?) \? 'border-indigo-500 bg-indigo-500\/10( text-white font-bold)?'\n(.*?) : 'border-white\/10 bg-slate-900 text-slate-400 hover:border-white\/30'\n(.*?)\}`\}/g,
  `className={\`p-4 rounded-xl border text-center transition-all \${
                                formData$2=== $3
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white font-bold'
                                  : isDark ? 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/30' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-500/30'
                              }\`}`
);

content = content.replace(
  /className="flex flex-col items-center justify-center w-full h-32 bg-slate-900 border-2 border-dashed border-white\/20 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-500\/5 transition-all"/g,
  `className={\`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all \${isDark ? 'bg-slate-900 border-white/20' : 'bg-slate-50 border-slate-300'}\`}`
);

content = content.replace(
  /<div className=\{`p-3 rounded-xl shrink-0 \$\{formData\.clientType === type\.id \? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'\}\`}>/g,
  `<div className={\`p-3 rounded-xl shrink-0 \${formData.clientType === type.id ? 'bg-indigo-500 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}\`}>`
);

content = content.replace(
  /className=\{`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all \$\{\n(.*?)formData.clientType === type.id \n(.*?) \? 'border-indigo-500 bg-indigo-500\/10' \n(.*?) : 'border-white\/10 bg-white\/5 hover:bg-white\/10'\n(.*?)\}`\}/g,
  `className={\`flex items-start gap-4 p-4 rounded-2xl border transition-all \${
                                formData.clientType === type.id 
                                  ? 'border-indigo-500 bg-indigo-500/10' 
                                  : isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                              }\`}`
);

content = content.replace(
  /<div className="font-bold text-white text-base mb-1">/g,
  `<div className={\`font-bold text-base mb-1 \${isDark ? 'text-white' : 'text-slate-900'}\`}>`
);

content = content.replace(
  /className="px-6 py-3 rounded-xl bg-white\/5 hover:bg-white\/10 text-white font-medium"/g,
  `className={\`px-6 py-3 rounded-xl font-medium \${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}\`}`
);

// text-slate-400 generic replacements
content = content.replace(
  /<p className="text-slate-400 text-sm">/g,
  `<p className={\`text-sm \${isDark ? 'text-slate-400' : 'text-slate-600'}\`}>`
);

content = content.replace(
  /<p className="text-slate-400">/g,
  `<p className={isDark ? 'text-slate-400' : 'text-slate-600'}>`
);

content = content.replace(
  /<p className="text-slate-400 mb-6">/g,
  `<p className={\`mb-6 \${isDark ? 'text-slate-400' : 'text-slate-600'}\`}>`
);

content = content.replace(
  /<label className="block text-sm font-medium text-slate-400 mb-2">/g,
  `<label className={\`block text-sm font-medium mb-2 \${isDark ? 'text-slate-400' : 'text-slate-700'}\`}>`
);

content = content.replace(
  /<h3 className="text-xl font-bold">/g,
  `<h3 className={\`text-xl font-bold \${isDark ? 'text-white' : 'text-slate-900'}\`}>`
);

content = content.replace(
  /<h4 className="text-lg font-semibold mb-6">/g,
  `<h4 className={\`text-lg font-semibold mb-6 \${isDark ? 'text-white' : 'text-slate-900'}\`}>`
);

content = content.replace(
  /<div className="w-full bg-slate-800 h-1">/g,
  `<div className={\`w-full h-1 \${isDark ? 'bg-slate-800' : 'bg-slate-200'}\`}>`
);

fs.writeFileSync('src/pages/NewLanding.tsx', content);
console.log('done');
