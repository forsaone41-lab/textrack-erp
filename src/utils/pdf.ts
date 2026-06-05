import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Super robust printing using a hidden iframe.
 */
export function printElement(elementId: string) {
  const original = document.getElementById(elementId);
  if (!original) return;

  let iframe = document.getElementById('print-iframe-temp') as HTMLIFrameElement;
  if (iframe) iframe.remove();
  
  iframe = document.createElement('iframe');
  iframe.id = 'print-iframe-temp';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Clone element, DO NOT strip classes so Tailwind styles remain
  const clone = original.cloneNode(true) as HTMLElement;
  
  // Get all styles from the parent document to inject into iframe
  let stylesHtml = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
    stylesHtml += el.outerHTML;
  });

  doc.open();
  doc.write(`<!DOCTYPE html><html dir="auto"><head><title>Document</title>
    ${stylesHtml}
    <style>
      body { margin: 0; padding: 20px; background: white !important; font-family: sans-serif; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      img { max-width: 100% !important; height: auto !important; }
      @page { margin: 0.5cm; size: auto; }
      @media print { 
        html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        /* Ensure background colors are printed */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    </style></head>
    <body>${clone.outerHTML}</body></html>`);
  doc.close();

  const printWhenReady = () => {
    const images = Array.from(doc.querySelectorAll('img'));
    Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))).then(() => {
      setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }, 800);
    });
  };
  if (iframe.contentWindow) { iframe.onload = printWhenReady; setTimeout(printWhenReady, 1500); }
}

/**
 * Generates a high-quality PDF.
 * Strategy: clone → strip classes → append visible off-screen → capture → remove → save PDF.
 */
export async function generatePDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('generatePDF: element not found', elementId);
    return;
  }

  // Create visible off-screen wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;background:white;z-index:99999;overflow:visible;';

  // Deep clone and strip ALL Tailwind/CSS classes
  const clone = element.cloneNode(true) as HTMLElement;
  // Do NOT strip classes. Stripping classes removes SVG dimensions, causing html2canvas to crash.
  // Instead, just remove the Tailwind classes that hide the element on the root wrapper.
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]');
  clone.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; position: relative !important; width: 800px !important; background: white !important; z-index: 1 !important; pointer-events: auto !important;';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Give browser time to render
  await new Promise(r => setTimeout(r, 500));

  let success = false;
  let lastError: any = null;

  try {
    const options = {
      pixelRatio: 1.5,
      backgroundColor: '#ffffff',
      skipFonts: true, // Prevents blank image issues caused by font CORS/encoding
    };

    // WARM-UP CALL (html-to-image bug: first render is often blank)
    await toPng(clone, options).catch(() => {});
    
    // ACTUAL CALL
    const dataUrl = await toPng(clone, options);

    if (dataUrl && dataUrl !== 'data:,') {
      // Create image object to get natural dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => { img.onload = r; });

      const pdfW = 210; // Standard A4 width in mm
      const pdfH = Math.max(297, (img.height * pdfW) / img.width); // Adjust height to fit the whole image in one page

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfW, pdfH]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');

      pdf.save(`${filename}.pdf`);
      success = true;
      return null;
    } else {
        throw new Error('Image rendered empty.');
    }
  } catch (err) {
    lastError = err;
    console.error('html2canvas failed:', err);
  }

  // Cleanup
  try { document.body.removeChild(wrapper); } catch (_) {}

  // If html2canvas failed entirely, alert the user instead of falling back to print
  if (!success) {
    console.warn('generatePDF failed.', lastError);
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    alert('Le téléchargement du PDF a échoué. Erreur: ' + msg);
  }
}

export async function generatePDFBlob(elementId: string): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;background:white;z-index:99999;overflow:visible;';
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]');
  clone.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; position: relative !important; width: 800px !important; background: white !important; z-index: 1 !important; pointer-events: auto !important;';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  await new Promise(r => setTimeout(r, 300));
  // Let browser breathe before heavy canvas work
  await new Promise(r => requestAnimationFrame(r));

  try {
    const options = { pixelRatio: 1.5, backgroundColor: '#ffffff', skipFonts: true };
    
    await toPng(clone, options).catch(() => {});
    const dataUrl = await toPng(clone, options);
    
    if (dataUrl && dataUrl !== 'data:,') {
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => { img.onload = r; });

      const pdfW = 210; // Standard A4 width in mm
      const pdfH = Math.max(297, (img.height * pdfW) / img.width);

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfW, pdfH]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      return pdf.output('blob');
    }
  } catch (err) {
    console.error('generatePDFBlob failed:', err);
  } finally {
    try { document.body.removeChild(wrapper); } catch (_) {}
  }
  return null;
}
