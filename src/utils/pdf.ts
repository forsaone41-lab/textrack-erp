// Dynamic imports for heavy libraries to keep bundle light
const getHtml2Canvas = () => import('html2canvas').then(m => m.default);
const getJsPDF = () => import('jspdf').then(m => m.default);

/**
 * Super robust printing using a hidden iframe.
 * Uses @page CSS to remove browser headers/footers (date, URL, page numbers).
 */
export function printElement(elementId: string) {
  const original = document.getElementById(elementId);
  if (!original) return;

  // 1. Create a hidden iframe
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

  // 2. Clone the element
  const clone = original.cloneNode(true) as HTMLElement;
  
  // 3. Collect all stylesheets to preserve look
  let stylesHtml = '';
  const stylesheets = Array.from(document.styleSheets);
  try {
    stylesheets.forEach(sheet => {
      if (sheet.href) {
        stylesHtml += `<link rel="stylesheet" href="${sheet.href}">`;
      } else {
        const rules = Array.from(sheet.cssRules);
        stylesHtml += `<style>${rules.map(r => r.cssText).join('\n')}</style>`;
      }
    });
  } catch (e) {
    console.warn("Could not copy some styles due to CORS, falling back to basic styles", e);
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>BEYA CREATIVE</title>
        ${stylesHtml}
        <style>
          body { margin: 0; padding: 20px; background: white !important; font-family: sans-serif; }
          img { max-width: 100% !important; height: auto !important; }
          .no-print { display: none !important; }
          @page { 
            margin: 0.5cm; 
            size: A4;
          }
          @media print {
            html, body { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-content">
          ${clone.outerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // 4. Wait for images and styles to load before printing
  const printWhenReady = () => {
    const images = Array.from(doc.querySelectorAll('img'));
    const promises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(promises).then(() => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 500);
    });
  };

  if (iframe.contentWindow) {
    iframe.onload = printWhenReady;
    setTimeout(printWhenReady, 1000);
  }
}

/**
 * Generates a high-quality PDF from a DOM element.
 * Uses html2canvas + jsPDF for clean output without browser headers/footers.
 * Supports multi-page content automatically.
 */
export async function generatePDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    element.scrollTop = 0;

    // Lazy load libraries
    const [html2canvas, jsPDF] = await Promise.all([
      getHtml2Canvas(),
      getJsPDF()
    ]);

    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.opacity = '1';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          clonedElement.style.position = 'relative';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
          clonedElement.style.zIndex = '9999';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Handle multi-page content
    if (imgHeight <= pdfHeight) {
      // Fits on one page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Multi-page: slice the canvas into page-sized chunks
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
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    // Fallback: use print but with clean @page rules
    printElement(elementId);
  }
}
