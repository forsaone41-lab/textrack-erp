import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Super robust printing: Converts canvases to images first, then clones 
 * to a clean div to avoid Modal/Fixed positioning issues.
 */
/**
 * Super robust printing using a hidden iframe.
 * This avoids all the issues with document.write/window.open in modern browsers.
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
        <title>Impression - TexTrack</title>
        ${stylesHtml}
        <style>
          body { margin: 0; padding: 20px; background: white !important; font-family: sans-serif; }
          img { max-width: 100% !important; height: auto !important; }
          .no-print { display: none !important; }
          @page { margin: 1cm; }
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
        // Cleanup after some delay
        setTimeout(() => {
          // document.body.removeChild(iframe); // Keep it or not
        }, 1000);
      }, 500);
    });
  };

  if (iframe.contentWindow) {
    iframe.onload = printWhenReady;
    // For browsers where iframe.onload doesn't fire for doc.write
    setTimeout(printWhenReady, 1000);
  }
}

/**
 * Generates a high-quality PDF from a DOM element.
 */
export async function generatePDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    element.scrollTop = 0;
    const canvas = await html2canvas(element, {
      scale: 1.5, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const ratio = canvas.width / pdfWidth;
    const imgHeight = canvas.height / ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    printElement(elementId);
  }
}
