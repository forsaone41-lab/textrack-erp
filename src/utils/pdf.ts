// Dynamic imports for heavy libraries to keep bundle light
const getHtml2Canvas = () => import('html2canvas').then(m => m.default);
const getJsPDF = () => import('jspdf').then(m => m.jsPDF || m.default);

/**
 * Recursively strips all class attributes from an element and its children
 * to prevent Tailwind hiding classes from interfering.
 */
function stripAllClasses(el: HTMLElement) {
  el.removeAttribute('class');
  Array.from(el.children).forEach(child => {
    if (child instanceof HTMLElement) stripAllClasses(child);
  });
}

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

  // Clone and STRIP all classes
  const clone = original.cloneNode(true) as HTMLElement;
  stripAllClasses(clone);
  clone.style.cssText = 'opacity:1;visibility:visible;display:block;position:relative;width:100%;background:white;color:#0f172a;font-family:sans-serif;';
  
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>BEYA CREATIVE</title>
    <style>
      body{margin:0;padding:20px;background:white!important;font-family:sans-serif;color:#0f172a!important}
      img{max-width:100%!important;height:auto!important}
      @page{margin:0.5cm;size:A4}
      @media print{html,body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
    </style></head>
    <body>${clone.outerHTML}</body></html>`);
  doc.close();

  const printWhenReady = () => {
    const images = Array.from(doc.querySelectorAll('img'));
    Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))).then(() => {
      setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }, 500);
    });
  };
  if (iframe.contentWindow) { iframe.onload = printWhenReady; setTimeout(printWhenReady, 1000); }
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
  stripAllClasses(clone);
  clone.style.cssText = 'opacity:1;visibility:visible;display:block;position:relative;width:800px;background:white;color:#0f172a;font-family:sans-serif;';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Give browser time to render
  await new Promise(r => setTimeout(r, 500));

  let success = false;

  try {
    const [html2canvas, jsPDF] = await Promise.all([getHtml2Canvas(), getJsPDF()]);

    const canvas = await html2canvas(wrapper, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 5000,
    });

    if (canvas.width > 0 && canvas.height > 0) {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = pdfW;
      const imgH = (canvas.height * imgW) / canvas.width;

      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH, undefined, 'FAST');
      } else {
        // Multi-page
        const pageH = (pdfH * canvas.width) / pdfW;
        let rem = canvas.height, pos = 0, pg = 0;
        while (rem > 0) {
          if (pg > 0) pdf.addPage();
          const sh = Math.min(pageH, rem);
          const pc = document.createElement('canvas');
          pc.width = canvas.width; pc.height = sh;
          pc.getContext('2d')?.drawImage(canvas, 0, pos, canvas.width, sh, 0, 0, canvas.width, sh);
          pdf.addImage(pc.toDataURL('image/png'), 'PNG', 0, 0, imgW, (sh * imgW) / canvas.width, undefined, 'FAST');
          pos += sh; rem -= sh; pg++;
        }
      }

      pdf.save(`${filename}.pdf`);
      success = true;
      return null;
    }
  } catch (err) {
    console.error('html2canvas failed:', err);
  }

  // Cleanup
  try { document.body.removeChild(wrapper); } catch (_) {}

  // If html2canvas failed entirely, alert the user instead of falling back to print
  if (!success) {
    console.warn('generatePDF failed.');
    alert('Le téléchargement du PDF a échoué. Veuillez réessayer.');
  }
}

export async function generatePDFBlob(elementId: string): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;background:white;z-index:99999;overflow:visible;';
  const clone = element.cloneNode(true) as HTMLElement;
  stripAllClasses(clone);
  clone.style.cssText = 'opacity:1;visibility:visible;display:block;position:relative;width:800px;background:white;color:#0f172a;font-family:sans-serif;';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  await new Promise(r => setTimeout(r, 300));
  // Let browser breathe before heavy canvas work
  await new Promise(r => requestAnimationFrame(r));

  try {
    const [html2canvas, jsPDF] = await Promise.all([getHtml2Canvas(), getJsPDF()]);
    const canvas = await html2canvas(wrapper, { scale: 1.5, useCORS: true, allowTaint: false, logging: false, backgroundColor: '#ffffff', imageTimeout: 5000 });
    if (canvas.width > 0 && canvas.height > 0) {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH, undefined, 'FAST');
      } else {
        const pageH = (pdfH * canvas.width) / pdfW;
        let rem = canvas.height, pos = 0, pg = 0;
        while (rem > 0) {
          if (pg > 0) pdf.addPage();
          const sh = Math.min(pageH, rem);
          const pc = document.createElement('canvas');
          pc.width = canvas.width; pc.height = sh;
          pc.getContext('2d')?.drawImage(canvas, 0, pos, canvas.width, sh, 0, 0, canvas.width, sh);
          pdf.addImage(pc.toDataURL('image/png'), 'PNG', 0, 0, pdfW, (sh * pdfW) / canvas.width, undefined, 'FAST');
          pos += sh; rem -= sh; pg++;
        }
      }
      return pdf.output('blob');
    }
  } catch (err) {
    console.error('generatePDFBlob failed:', err);
  } finally {
    try { document.body.removeChild(wrapper); } catch (_) {}
  }
  return null;
}
