import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a high-quality PDF from a DOM element.
 * Optimized for print quality (A4).
 */
export async function generatePDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    // Scroll to top of element to ensure full capture
    element.scrollTop = 0;

    // Capture using html2canvas with optimized settings
    // Reduced scale to 2 for better stability on all devices
    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Optional: Remove complex shadows or animations from the clone to speed up
        const el = clonedDoc.getElementById(elementId);
        if (el) {
          el.style.boxShadow = 'none';
          el.style.animation = 'none';
          el.style.transition = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate aspect ratio to fit width
    const ratio = canvasWidth / pdfWidth;
    const imgHeight = canvasHeight / ratio;

    // If content is longer than one page, handle it (basic version)
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Erreur lors de la génération du PDF. Tentative de téléchargement en tant qu\'image...');
    
    // Fallback: Try to download as image if PDF fails
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (fallbackError) {
      alert('Désolé, le téléchargement a échoué. Veuillez essayer sur un autre navigateur (Chrome recommandé).');
    }
  }
}
