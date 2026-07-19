const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'StoreBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const startMarker = '// --- DYNAMIC LAYOUT COMPONENTS ---';
const endMarkerStr = '   if (isLiveStore) {'; // the part right after StorePreviewWrapper ends.

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarkerStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

// Extract everything from start to end
const layoutsContent = content.substring(startIndex, endIndex);

// It includes StorePreviewWrapper. Wait, StorePreviewWrapper depends on ALL the props!
// It's easier if we pass all state variables to it.
// We can use the context we just created!

// Instead of rewriting 1500 lines of props, we can replace the layout extraction with a wrapper that uses context.
console.log("Extraction found, length:", layoutsContent.length);

