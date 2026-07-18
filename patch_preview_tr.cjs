const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// Fix the close button translation - the apostrophe is the issue
content = content.replace(
  "Fermer l'aperçu\n             </button>",
  "{storeIsAr ? 'إغلاق المعاينة' : \"Fermer l'aperçu\"}\n             </button>"
);

// Also translate Couleur label in bottom fixed widget  
content = content.replace(
  ">Couleur:</span>",
  ">{storeIsAr ? 'اللون:' : 'Couleur:'}</span>"
);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content);
console.log('Done!');
