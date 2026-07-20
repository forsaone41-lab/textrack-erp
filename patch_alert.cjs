const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

c = c.replace(/} catch \(e\) \{\n\s*console\.warn\('Failed to save to localStorage, possibly quota exceeded', e\);\n\s*\}/, 
} catch (e) {
       console.warn('Failed to save to localStorage, possibly quota exceeded', e);
       alert('Erreur: Impossible de sauvegarder. Les images sont peut-être trop lourdes. Veuillez réessayer avec des images plus petites.');
       setIsSaving(false);
       return;
    });

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');
console.log('patched alert');
