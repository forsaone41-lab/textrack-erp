const fs = require('fs');
let c = fs.readFileSync('src/pages/AISpace.tsx', 'utf-8');

// 1. Add a helper function to parse price table from AI message text
// The AI gives tables like: | Désignation | DH | Détails |
// We need to extract these into model items for DevisBuilder

// Add sendToDevis function after exportChatToPDFAndSave
const funcTarget = `  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {`;
const funcNew = `  // Parse AI price table and send to DevisBuilder
  const sendToDevis = (text: string) => {
    try {
      // Extract table rows from markdown table
      const lines = text.split('\\n');
      const tableLines = lines.filter(l => l.trim().startsWith('|') && !l.includes('---'));
      
      const items: { designation: string; montant: number; detail: string }[] = [];
      
      for (let i = 1; i < tableLines.length; i++) { // skip header
        const cells = tableLines[i].split('|').map(s => s.trim()).filter(Boolean);
        if (cells.length >= 2) {
          // Try to extract amount from cells
          const amountCell = cells.find(c => /\\d+[.,\\d]*/.test(c.replace(/\\*+/g, '')));
          const nameCell = cells.find(c => !/^[\\d.,]+/.test(c.replace(/\\*+/g, '').trim()) && c.length > 1);
          const amount = amountCell ? parseFloat(amountCell.replace(/\\*+/g, '').replace(',', '.').match(/[\\d.]+/)?.[0] || '0') : 0;
          const name = nameCell?.replace(/\\*+/g, '').trim() || '';
          if (name && amount > 0 && !name.toLowerCase().includes('total') && !name.toLowerCase().includes('مجموع') && !name.toLowerCase().includes('revient')) {
            items.push({ designation: name, montant: amount, detail: cells[cells.length-1]?.replace(/\\*+/g, '') || '' });
          }
        }
      }
      
      // Find total
      const totalLine = tableLines.find(l => l.toLowerCase().includes('total') || l.includes('مجموع') || l.includes('revient'));
      let total = 0;
      if (totalLine) {
        const m = totalLine.match(/[\\d.]+/g);
        if (m) total = Math.max(...m.map(Number));
      }

      // Store in localStorage for DevisBuilder to pick up
      const devisData = {
        fromAI: true,
        timestamp: Date.now(),
        items,
        total,
        rawText: text,
        modelName: analysisResult?.category || (isAr ? 'نموذج من الذكاء الاصطناعي' : 'Modèle AI Expert')
      };
      localStorage.setItem('beya_ai_to_devis', JSON.stringify(devisData));
      
      // Navigate to DevisBuilder
      navigate('/devis-builder');
    } catch (err) {
      console.error('sendToDevis error:', err);
      navigate('/devis-builder');
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {`;

c = c.replace(funcTarget, funcNew);

// 2. Add the "Envoyer au Devis" button next to the existing Download button on AI messages
// Only show when the message contains a price table (has | and MAD/DH/درهم)
const buttonTarget = `                    {c.role === 'ai' && c.text !== '...' && (
                      <button 
                        onClick={() => exportChatToPDFAndSave(c.text)}
                        className={\`absolute -bottom-3 \${isAr ? 'left-2' : 'right-2'} transition-all bg-white border border-slate-200 text-indigo-600 p-1.5 rounded-full shadow-sm hover:bg-indigo-50 hover:scale-110 z-10\`}
                        title={isAr ? 'حفظ وتصدير PDF' : 'Sauvegarder & Exporter PDF'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}`;
const buttonNew = `                    {c.role === 'ai' && c.text !== '...' && (
                      <div className={\`absolute -bottom-3 \${isAr ? 'left-2' : 'right-2'} flex gap-1 z-10\`}>
                        {/* Devis button - only if message has price table */}
                        {(c.text.includes('|') && (c.text.includes('DH') || c.text.includes('MAD') || c.text.includes('درهم') || c.text.includes('revient') || c.text.includes('Prix'))) && (
                          <button
                            onClick={() => sendToDevis(c.text)}
                            className="transition-all bg-emerald-500 border border-emerald-600 text-white p-1.5 rounded-full shadow-sm hover:bg-emerald-600 hover:scale-110"
                            title={isAr ? 'إرسال إلى الديفيس (Devis)' : 'Envoyer au Devis'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          </button>
                        )}
                        <button 
                          onClick={() => exportChatToPDFAndSave(c.text)}
                          className="transition-all bg-white border border-slate-200 text-indigo-600 p-1.5 rounded-full shadow-sm hover:bg-indigo-50 hover:scale-110"
                          title={isAr ? 'حفظ وتصدير PDF' : 'Sauvegarder & Exporter PDF'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}`;

if (c.includes(buttonTarget)) {
  c = c.replace(buttonTarget, buttonNew);
  console.log('Devis button added to chat messages');
} else {
  console.log('WARNING: button target not found');
}

fs.writeFileSync('src/pages/AISpace.tsx', c, 'utf-8');
console.log('AISpace.tsx updated');
