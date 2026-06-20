const fs = require('fs');

let content = fs.readFileSync('src/pages/Echantillons.tsx', 'utf8');

// 1. Add state
if (!content.includes('const [zoomImage')) {
  content = content.replace(
    "const [editingPrixVal, setEditingPrixVal] = useState<string>('');",
    "const [editingPrixVal, setEditingPrixVal] = useState<string>('');\n  const [zoomImage, setZoomImage] = useState<string | null>(null);"
  );
}

// 2. Add onClick to tissu
const targetTissu = `<div className="rounded-xl overflow-hidden border border-slate-100 h-32 relative group/img">
                      <div className="absolute inset-0 bg-slate-900/10 z-10" />
                      <img src={c.tissuPhoto} alt="Tissu" className="w-full h-full object-cover" />`;
const repTissu = `<div 
                      className="rounded-xl overflow-hidden border border-slate-100 h-32 relative group/img cursor-pointer"
                      onClick={() => setZoomImage(c.tissuPhoto!)}
                    >
                      <div className="absolute inset-0 bg-slate-900/10 z-10 hover:bg-slate-900/20 transition-colors" />
                      <img src={c.tissuPhoto} alt="Tissu" className="w-full h-full object-cover" />`;
content = content.replace(targetTissu, repTissu);

// 3. Add onClick to modele
const targetModele = `<div className="rounded-xl overflow-hidden border border-slate-100 h-32 relative group/img">
                      <div className="absolute inset-0 bg-slate-900/10 z-10" />
                      <img src={c.modelePhoto} alt="Modele" className="w-full h-full object-cover" />`;
const repModele = `<div 
                      className="rounded-xl overflow-hidden border border-slate-100 h-32 relative group/img cursor-pointer"
                      onClick={() => setZoomImage(c.modelePhoto!)}
                    >
                      <div className="absolute inset-0 bg-slate-900/10 z-10 hover:bg-slate-900/20 transition-colors" />
                      <img src={c.modelePhoto} alt="Modele" className="w-full h-full object-cover" />`;
content = content.replace(targetModele, repModele);

// 4. Add modal before the last closing div
const modalCode = `      {/* Image Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-[500] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <img 
            src={zoomImage} 
            alt="Zoomed" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl cursor-default animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} 
          />
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
            onClick={() => setZoomImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}`;
content = content.replace('    </div>\n  );\n}', modalCode);

fs.writeFileSync('src/pages/Echantillons.tsx', content, 'utf8');
console.log('Successfully added image zoom modal to Echantillons.tsx');
