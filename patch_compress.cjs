const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

const newReadFile = 'const readFileAsBase64 = (file: File): Promise<string> => {\n' +
'  return new Promise((resolve) => {\n' +
'    const reader = new FileReader();\n' +
'    reader.onload = (e) => {\n' +
'      const img = new Image();\n' +
'      img.onload = () => {\n' +
'        const canvas = document.createElement(" canvas\);\n' +
' let width = img.width;\n' +
' let height = img.height;\n' +
' const maxDim = 800;\n' +
' if (width > maxDim || height > maxDim) {\n' +
' if (width > height) {\n' +
' height = Math.round((height * maxDim) / width);\n' +
' width = maxDim;\n' +
' } else {\n' +
' width = Math.round((width * maxDim) / height);\n' +
' height = maxDim;\n' +
' }\n' +
' }\n' +
' canvas.width = width;\n' +
' canvas.height = height;\n' +
' const ctx = canvas.getContext(\2d\);\n' +
' if (ctx) {\n' +
' ctx.drawImage(img, 0, 0, width, height);\n' +
' resolve(canvas.toDataURL(\image/jpeg\, 0.6));\n' +
' } else {\n' +
' resolve(e.target?.result as string);\n' +
' }\n' +
' };\n' +
' img.src = e.target?.result as string;\n' +
' };\n' +
' reader.readAsDataURL(file);\n' +
' });\n' +
'};\n';

c = c.replace(/const readFileAsBase64 = [\s\S]+?reader\.readAsDataURL\(file\);\n \}\);\n\};/, newReadFile);

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('patched compression');
