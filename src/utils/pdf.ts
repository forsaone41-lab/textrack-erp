import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Super robust printing: Clones the element to a clean div at the body root 
 * to avoid Modal/Fixed positioning issues that cause page duplication.
 */
export function printElement(elementId: string) {
  const original = document.getElementById(elementId);
  if (!original) return;

  // 1. Create a clean container for printing
  const printContainer = document.createElement('div');
  printContainer.id = 'print-container-temp';
  printContainer.innerHTML = original.innerHTML;
  
  // 2. Add specific print styles
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
      #print-container-temp .grid, 
      #print-container-temp #all-badges-capture {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 30px !important;
        padding: 20px !important;
      }
      .break-inside-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      /* Clean up UI elements like buttons that might have been cloned */
      button, .no-print { display: none !important; }
    }
  `;

  document.body.appendChild(printContainer);
  document.head.appendChild(style);

  // 3. Print with enough delay for QR codes (Canvas) to be stable
  setTimeout(() => {
    window.print();
    // 4. Cleanup
    setTimeout(() => {
      printContainer.remove();
      style.remove();
    }, 1000);
  }, 1500);
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
