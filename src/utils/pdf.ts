import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Robust printing using a temporary overlay to avoid pop-up blockers.
 * Increased delay to ensure all canvas elements (QR codes) are fully rendered.
 */
export function printElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Create a temporary style for printing
  const style = document.createElement('style');
  style.id = 'print-style-temp';
  style.innerHTML = `
    @media print {
      body * { visibility: hidden !important; }
      #${elementId}, #${elementId} * { visibility: visible !important; }
      #${elementId} {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      /* Grid optimization for badges - 2 per row */
      #all-badges-capture {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 30px !important;
        padding: 40px !important;
      }
      .break-inside-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;

  document.head.appendChild(style);

  // Increased delay to 1.5s to ensure QR codes are fully drawn on all canvases
  setTimeout(() => {
    window.print();
    // Remove the style after printing starts
    setTimeout(() => {
      const s = document.getElementById('print-style-temp');
      if (s) s.remove();
    }, 2000);
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
