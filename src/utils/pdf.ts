import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Handles printing an element using the browser's native print dialog.
 * This is a foolproof fallback when canvas-based PDF generation fails.
 */
export function printElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres surgissantes (pop-ups) pour imprimer.');
    return;
  }

  // Get all styles to preserve design
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Impression - BEYA</title>
        ${styles}
        <style>
          @media print {
            body { background: white !important; padding: 0 !important; margin: 0 !important; }
            .no-print { display: none !important; }
            #${elementId} { 
              width: 100% !important; 
              max-width: 100% !important; 
              box-shadow: none !important; 
              border: none !important;
              padding: 20px !important;
            }
            /* Grid optimization for badges */
            .grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
          }
          body { font-family: sans-serif; }
        </style>
      </head>
      <body>
        <div id="print-content">
          ${element.innerHTML}
        </div>
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 500);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generates a high-quality PDF from a DOM element.
 */
export async function generatePDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Scroll to top
    element.scrollTop = 0;

    // Use lower scale for maximum compatibility
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
    // If it fails, suggest Printing as PDF
    if (confirm('Le téléchargement direct a échoué. Voulez-vous essayer d\'imprimer (et choisir "Enregistrer en PDF") ?')) {
      printElement(elementId);
    }
  }
}
