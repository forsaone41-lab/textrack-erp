import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Super robust printing: Converts canvases to images first, then clones 
 * to a clean div to avoid Modal/Fixed positioning issues.
 */
export function printElement(elementId: string) {
  const original = document.getElementById(elementId);
  if (!original) return;

  // 1. Create a clean container for printing
  const printContainer = document.createElement('div');
  printContainer.id = 'print-container-temp';
  
  // Clone the node carefully
  const clone = original.cloneNode(true) as HTMLElement;
  
  // 2. IMPORTANT: Copy Canvas content to Images
  // innerHTML doesn't copy canvas drawings. We must convert them.
  const originalCanvases = original.querySelectorAll('canvas');
  const clonedCanvases = clone.querySelectorAll('canvas');
  
  originalCanvases.forEach((canv, idx) => {
    const img = document.createElement('img');
    img.src = canv.toDataURL();
    img.style.width = canv.style.width || (canv.width + 'px');
    img.style.height = canv.style.height || (canv.height + 'px');
    
    // Replace the blank canvas in the clone with the static image
    const targetCanv = clonedCanvases[idx];
    if (targetCanv && targetCanv.parentNode) {
      targetCanv.parentNode.replaceChild(img, targetCanv);
    }
  });

  printContainer.appendChild(clone);
  
  // 3. Add specific print styles
  const style = document.createElement('style');
  style.id = 'print-style-temp';
  style.innerHTML = `
    @media screen {
      #print-container-temp { display: none !important; }
    }
    @media print {
      body > * { display: none !important; }
      #print-container-temp { 
        display: block !important; 
        visibility: visible !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        background: white !important;
      }
      /* Ensure grid layout for badges */
      #print-container-temp .grid, 
      #print-container-temp [id="all-badges-capture"] {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 30px !important;
        padding: 20px !important;
      }
      #print-container-temp .break-inside-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      button, .no-print { display: none !important; }
    }
  `;

  document.body.appendChild(printContainer);
  document.head.appendChild(style);

  // 4. Print with a small delay for DOM stability
  setTimeout(() => {
    window.print();
    // 5. Cleanup
    setTimeout(() => {
      printContainer.remove();
      style.remove();
    }, 1000);
  }, 500);
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
