// Dynamic imports for heavy libraries to keep bundle light
const getHtml2Canvas = () => import('html2canvas').then(m => m.default);
const getJsPDF = () => import('jspdf').then(m => m.default);

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

  const clone = original.cloneNode(true) as HTMLElement;
  // Force visibility on clone
  clone.style.cssText = 'opacity:1!important;visibility:visible!important;display:block!important;position:relative!important;width:100%!important;pointer-events:auto!important;';
  
  let stylesHtml = '';
  try {
    Array.from(document.styleSheets).forEach(sheet => {
      if (sheet.href) {
        stylesHtml += `<link rel="stylesheet" href="${sheet.href}">`;
      } else {
        stylesHtml += `<style>${Array.from(sheet.cssRules).map(r => r.cssText).join('\n')}</style>`;
      }
    });
  } catch (e) { /* CORS */ }

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>BEYA CREATIVE</title>${stylesHtml}
    <style>
      body{margin:0;padding:20px;background:white!important;font-family:sans-serif;color:#0f172a!important}
      img{max-width:100%!important;height:auto!important}
      .no-print{display:none!important}
      *{opacity:1!important;visibility:visible!important}
      @page{margin:0.5cm;size:A4}
      @media print{html,body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
    </style></head>
    <body><div style="width:100%;background:white;color:#0f172a">${clone.outerHTML}</div></body></html>`);
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
 * Generates a high-quality PDF by temporarily making the element visible,
 * capturing it with html2canvas, then hiding it again.
 * This approach avoids the blank-canvas issue entirely.
 */
export async function generatePDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('generatePDF: Element not found:', elementId);
    return;
  }

  // Save original styles
  const origStyle = element.getAttribute('style') || '';
  const origClass = element.className;

  try {
    // STEP 1: Temporarily make the element FULLY VISIBLE for html2canvas
    element.style.cssText = `
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      z-index: -1 !important;
      width: 800px !important;
      pointer-events: none !important;
      background: white !important;
    `;
    // Remove Tailwind hiding classes temporarily
    element.className = '';

    // Force browser to repaint
    await new Promise(r => setTimeout(r, 100));

    // STEP 2: Lazy load libraries
    const [html2canvas, jsPDF] = await Promise.all([
      getHtml2Canvas(),
      getJsPDF()
    ]);

    // STEP 3: Capture to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
    });

    // STEP 4: Restore original styles immediately
    element.setAttribute('style', origStyle);
    element.className = origClass;

    // STEP 5: Verify canvas
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('generatePDF: Canvas is empty');
      return;
    }

    // STEP 6: Generate PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    if (imgHeight <= pdfHeight) {
      // Fits on one page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Multi-page
      const pageCanvasHeight = (pdfHeight * canvas.width) / pdfWidth;
      let remainingHeight = canvas.height;
      let position = 0;
      let page = 0;

      while (remainingHeight > 0) {
        if (page > 0) pdf.addPage();
        
        const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, position, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const pageImgData = pageCanvas.toDataURL('image/png');
          const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, sliceImgHeight, undefined, 'FAST');
        }
        
        position += sliceHeight;
        remainingHeight -= sliceHeight;
        page++;
      }
    }
    
    // STEP 7: Direct download — no print dialog!
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    // Restore styles in case of error
    element.setAttribute('style', origStyle);
    element.className = origClass;
    // Last resort: alert user
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
}
