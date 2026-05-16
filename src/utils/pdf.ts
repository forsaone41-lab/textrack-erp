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
  clone.style.cssText = 'opacity:1!important;visibility:visible!important;display:block!important;position:relative!important;width:100%!important;';
  
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
 * Generates a high-quality PDF by cloning the element into a visible container,
 * capturing it, then removing the clone. Never touches the original element.
 * Falls back to direct download via data URL if html2canvas fails.
 */
export async function generatePDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('generatePDF: Element not found:', elementId);
    return;
  }

  // Create a visible clone container off-screen
  const wrapper = document.createElement('div');
  wrapper.id = 'pdf-capture-wrapper';
  wrapper.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    background: white;
    z-index: -1;
    opacity: 1;
    visibility: visible;
    display: block;
    overflow: visible;
  `;
  
  // Clone the element
  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.cssText = `
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
    width: 800px !important;
    background: white !important;
    color: #0f172a !important;
    pointer-events: none !important;
  `;
  
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Wait for images to load and DOM to settle
  await new Promise(r => setTimeout(r, 300));

  try {
    // Lazy load libraries
    const [html2canvas, jsPDF] = await Promise.all([
      getHtml2Canvas(),
      getJsPDF()
    ]);

    // Capture the clone (which is visible, just off-screen)
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 800,
    });

    // Remove clone immediately
    document.body.removeChild(wrapper);

    // Verify canvas has content
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('generatePDF: Canvas is empty');
      return;
    }

    // Generate PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    if (imgHeight <= pdfHeight) {
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
    
    // Direct download — no print dialog!
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    // Clean up clone
    try { document.body.removeChild(wrapper); } catch (_) {}
    
    // Fallback: try simpler approach without scale
    try {
      const [html2canvas, jsPDF] = await Promise.all([getHtml2Canvas(), getJsPDF()]);
      
      // Re-add clone for retry
      const wrapper2 = document.createElement('div');
      wrapper2.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;background:white;z-index:-1;';
      const clone2 = element.cloneNode(true) as HTMLElement;
      clone2.removeAttribute('id');
      clone2.style.cssText = 'opacity:1!important;visibility:visible!important;display:block!important;position:relative!important;width:800px!important;background:white!important;';
      wrapper2.appendChild(clone2);
      document.body.appendChild(wrapper2);
      await new Promise(r => setTimeout(r, 200));
      
      const canvas = await html2canvas(wrapper2, { scale: 1, useCORS: true, allowTaint: true, logging: true, backgroundColor: '#ffffff' });
      document.body.removeChild(wrapper2);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ih = (canvas.height * pw) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pw, ih, undefined, 'FAST');
      pdf.save(`${filename}.pdf`);
    } catch (err2) {
      console.error('PDF Fallback also failed:', err2);
      // Ultimate fallback: open print dialog with content
      printElement(elementId);
    }
  }
}
