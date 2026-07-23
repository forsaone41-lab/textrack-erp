const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const oldLink = `<a href={'https://wa.me/' + appsConfig['WhatsApp Chat'].replace(/[^0-9]/g, '')} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-[998] w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform hover:bg-green-600">`;
const newLink = `<a href={'https://wa.me/' + appsConfig['WhatsApp Chat'].replace(/[^0-9]/g, '')} target="_blank" rel="noreferrer" className="fixed bottom-[85px] md:bottom-6 right-4 md:right-6 z-[998] w-12 h-12 md:w-14 md:h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform hover:bg-green-600">`;

const oldSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">`;
const newSvg = `<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">`;

if (content.includes(oldLink)) {
    content = content.replace(oldLink, newLink);
    content = content.replace(oldSvg, newSvg);
    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
    console.log('WhatsApp button patched successfully');
} else {
    console.error('Could not find the old WhatsApp link in the file.');
}
