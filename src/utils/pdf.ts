import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

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

  // Clone element, DO NOT strip classes so Tailwind styles remain
  const clone = original.cloneNode(true) as HTMLElement;
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]', 'hidden', 'invisible');
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.display = 'block';  
  // Get all styles from the parent document to inject into iframe
  let stylesHtml = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
    stylesHtml += el.outerHTML;
  });

  doc.open();
  doc.write(`<!DOCTYPE html><html dir="auto"><head><title>Document</title>
    ${stylesHtml}
    <style>
      body { margin: 0; padding: 0; background: white !important; font-family: sans-serif; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; display: flex; justify-content: center; }
      body > div { max-width: 100% !important; margin: 0 auto; }
      img { max-width: 100% !important; height: auto !important; }
      @page { margin: 1.5cm; size: auto; }
      @media print { 
        html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        /* Ensure background colors are printed */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    </style></head>
    <body>${clone.outerHTML}</body></html>`);
  doc.close();

  const printWhenReady = () => {
    const images = Array.from(doc.querySelectorAll('img'));
    Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))).then(() => {
      setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }, 800);
    });
  };
  if (iframe.contentWindow) { iframe.onload = printWhenReady; setTimeout(printWhenReady, 1500); }
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
  // Do NOT strip classes. Stripping classes removes SVG dimensions, causing html2canvas to crash.
  // Instead, just remove the Tailwind classes that hide the element on the root wrapper.
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]');
  clone.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; position: relative !important; width: 800px !important; background: white !important; z-index: 1 !important; pointer-events: auto !important;';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Give browser time to render
  await new Promise(r => setTimeout(r, 500));

  let success = false;
  let lastError: any = null;

  try {
    const options = {
      pixelRatio: 1.5,
      backgroundColor: '#ffffff',
      skipFonts: true, // Prevents blank image issues caused by font CORS/encoding
    };

    // WARM-UP CALL (html-to-image bug: first render is often blank)
    await toPng(clone, options).catch(() => {});
    
    // ACTUAL CALL
    const dataUrl = await toPng(clone, options);

    if (dataUrl && dataUrl !== 'data:,') {
      // Create image object to get natural dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => { img.onload = r; });

      const pdfW = 210; // Standard A4 width in mm
      const margin = 12; // 12mm margin
      const contentW = pdfW - (margin * 2);
      const contentH = (img.height * contentW) / img.width;
      const pdfH = Math.max(297, contentH + (margin * 2)); // Adjust height to fit the whole image in one page

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfW, pdfH]
      });

      pdf.addImage(dataUrl, 'PNG', margin, margin, contentW, contentH, undefined, 'FAST');

      pdf.save(`${filename}.pdf`);
      success = true;
      return null;
    } else {
        throw new Error('Image rendered empty.');
    }
  } catch (err) {
    lastError = err;
    console.error('html2canvas failed:', err);
  }

  // Cleanup
  try { document.body.removeChild(wrapper); } catch (_) {}

  // If html2canvas failed entirely, alert the user instead of falling back to print
  if (!success) {
    console.warn('generatePDF failed.', lastError);
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    alert('Le téléchargement du PDF a échoué. Erreur: ' + msg);
  }
}

export async function generatePDFBlob(elementId: string): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;background:white;z-index:99999;overflow:visible;';
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]');
  clone.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; position: relative !important; width: 800px !important; background: white !important; z-index: 1 !important; pointer-events: auto !important;';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  await new Promise(r => setTimeout(r, 300));
  // Let browser breathe before heavy canvas work
  await new Promise(r => requestAnimationFrame(r));

  try {
    const options = { pixelRatio: 1.5, backgroundColor: '#ffffff', skipFonts: true };
    
    await toPng(clone, options).catch(() => {});
    const dataUrl = await toPng(clone, options);
    
    if (dataUrl && dataUrl !== 'data:,') {
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => { img.onload = r; });

      const pdfW = 210; // Standard A4 width in mm
      const margin = 12; // 12mm margin
      const contentW = pdfW - (margin * 2);
      const contentH = (img.height * contentW) / img.width;
      const pdfH = Math.max(297, contentH + (margin * 2));

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfW, pdfH]
      });
      
      pdf.addImage(dataUrl, 'PNG', margin, margin, contentW, contentH, undefined, 'FAST');
      return pdf.output('blob');
    }
  } catch (err) {
    console.error('generatePDFBlob failed:', err);
  } finally {
    try { document.body.removeChild(wrapper); } catch (_) {}
  }
  return null;
}

/**
 * Dedicated Ultra-HD Badge PDF Generator (CR-80 Wallet Standard: 85.6mm x 53.98mm)
 * Captures at 300+ DPI (pixelRatio: 3.5 - 4.0) with exact physical millimeter sizing,
 * cutting guidelines, and zero blurriness ("non-mdbba").
 */
export async function generateBadgePDF(
  elementId: string,
  filename: string,
  options?: {
    viewMode?: 'both' | 'front' | 'back';
    companyName?: string;
    empName?: string;
  }
) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('generateBadgePDF: element not found', elementId);
    return false;
  }

  const viewMode = options?.viewMode || 'both';

  // Create isolated high-res offscreen rendering stage
  const stage = document.createElement('div');
  stage.style.cssText = 'position:fixed;left:-9999px;top:0;background:#ffffff;z-index:999999;display:flex;align-items:center;justify-content:center;padding:24px;';

  // Clone element with all styles intact
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]', 'hidden', 'invisible');
  clone.style.cssText = 'opacity:1 !important; visibility:visible !important; display:flex !important; position:relative !important; background:transparent !important; transform:none !important; filter:none !important;';

  stage.appendChild(clone);
  document.body.appendChild(stage);

  // Wait for all images in clone to be fully loaded
  const images = Array.from(clone.querySelectorAll('img'));
  await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })));
  await new Promise(r => setTimeout(r, 350));

  try {
    // Ultra-High Resolution Capture: pixelRatio 3.5 gives ~350-400 DPI
    const captureOptions = {
      pixelRatio: 3.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      quality: 1.0,
      skipFonts: true,
    };

    // Warm-up call
    await toPng(clone, captureOptions).catch(() => {});
    const dataUrl = await toPng(clone, captureOptions);

    if (!dataUrl || dataUrl === 'data:,') {
      throw new Error('Image capture failed');
    }

    const img = new Image();
    img.src = dataUrl;
    await new Promise(r => { img.onload = r; });

    // Standard A4: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageW = 210;
    const pageH = 297;

    // Physical Standard CR-80 dimensions: 85.60mm x 53.98mm
    const cardW = 85.60;
    const cardH = 53.98;

    // Header banner with official production metadata
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(15, 12, pageW - 30, 16, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    const companyTitle = options?.companyName || 'BEYA CREATIVE';
    pdf.text(`${companyTitle.toUpperCase()} — CARTE PROFESSIONNELLE OFFICIELLE`, pageW / 2, 19, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(203, 213, 225); // slate-300
    pdf.text(`Format Standard Portefeuille CR-80 (85.6 × 54.0 mm) • Impression Haute Définition 350 DPI`, pageW / 2, 24, { align: 'center' });

    // Calculate placement of cards on page
    let renderW = cardW;
    let renderH = cardH;
    let startX = (pageW - cardW) / 2;
    const startY = 38;

    if (viewMode === 'both') {
      // Both cards side by side with cutting gap
      const totalAspect = img.width / img.height;
      renderH = cardH;
      renderW = renderH * totalAspect;
      startX = (pageW - renderW) / 2;
    } else {
      renderW = cardW;
      renderH = cardH;
      startX = (pageW - cardW) / 2;
    }

    // Embed Ultra-HD lossless PNG
    pdf.addImage(dataUrl, 'PNG', startX, startY, renderW, renderH, undefined, 'SLOW');

    // Draw precision cutting corner marks (Crop marks) around the card area
    pdf.setDrawColor(148, 163, 184); // slate-400
    pdf.setLineWidth(0.35);

    const markLen = 6;
    const markOffset = 2;

    // Top-Left corner mark
    pdf.line(startX - markOffset - markLen, startY - markOffset, startX - markOffset, startY - markOffset);
    pdf.line(startX - markOffset, startY - markOffset - markLen, startX - markOffset, startY - markOffset);

    // Top-Right corner mark
    pdf.line(startX + renderW + markOffset, startY - markOffset, startX + renderW + markOffset + markLen, startY - markOffset);
    pdf.line(startX + renderW + markOffset, startY - markOffset - markLen, startX + renderW + markOffset, startY - markOffset);

    // Bottom-Left corner mark
    pdf.line(startX - markOffset - markLen, startY + renderH + markOffset, startX - markOffset, startY + renderH + markOffset);
    pdf.line(startX - markOffset, startY + renderH + markOffset, startX - markOffset, startY + renderH + markOffset + markLen);

    // Bottom-Right corner mark
    pdf.line(startX + renderW + markOffset, startY + renderH + markOffset, startX + renderW + markOffset + markLen, startY + renderH + markOffset);
    pdf.line(startX + renderW + markOffset, startY + renderH + markOffset, startX + renderW + markOffset, startY + renderH + markOffset + markLen);

    // Instructions Box below the badge
    const infoY = startY + renderH + 12;
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.roundedRect(18, infoY, pageW - 36, 32, 3, 3, 'FD');

    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text("CONSEILS D'IMPRESSION PROFESSIONNELLE (QUALITÉ MAXIMALE SANS AUCUN FLOUTAGE) :", 23, infoY + 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(51, 65, 85);
    pdf.text("1. Échelle : Sélectionnez impérativement « Échelle 100% » ou « Taille réelle » (Ne pas cocher Adapter à la page).", 23, infoY + 13);
    pdf.text("2. Support papier : Papier couché mat ou brillant 250g-300g, ou papier PVC badge pour un rendu rigide type carte bancaire.", 23, infoY + 18);
    pdf.text("3. Découpe : Utilisez un cutter ou massicot le long des repères de coupe pour un format portefeuille parfait (85.6 × 54 mm).", 23, infoY + 23);
    pdf.text("4. Recto-Verso : En mode « Deux faces », pliez le long de la ligne centrale pointillée pour créer une carte double face rigide.", 23, infoY + 28);

    // Footer with security notice
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(6.5);
    pdf.text(`Document officiel généré par ${companyTitle} ERP • Date: ${new Date().toLocaleDateString('fr-FR')} • 350 DPI Ultra-HD`, pageW / 2, pageH - 8, { align: 'center' });

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('generateBadgePDF failed:', err);
    throw err;
  } finally {
    try { document.body.removeChild(stage); } catch (_) {}
  }
}

/**
 * Downloads the badge as an Ultra-High-Definition PNG image (350+ DPI)
 * Perfect for direct printing on PVC card printers or sending to digital print shops.
 */
export async function downloadBadgeImage(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const stage = document.createElement('div');
  stage.style.cssText = 'position:fixed;left:-9999px;top:0;background:#ffffff;z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]', 'hidden', 'invisible');
  clone.style.cssText = 'opacity:1 !important; visibility:visible !important; display:flex !important; position:relative !important; background:transparent !important; transform:none !important;';

  stage.appendChild(clone);
  document.body.appendChild(stage);

  const images = Array.from(clone.querySelectorAll('img'));
  await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })));
  await new Promise(r => setTimeout(r, 300));

  try {
    const dataUrl = await toPng(clone, {
      pixelRatio: 4.0, // 400 DPI
      backgroundColor: '#ffffff',
      cacheBust: true,
      quality: 1.0,
      skipFonts: true,
    });

    if (dataUrl && dataUrl !== 'data:,') {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${filename}_HD_400DPI.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('downloadBadgeImage failed:', err);
  } finally {
    try { document.body.removeChild(stage); } catch (_) {}
  }
}

/**
 * Direct High-Resolution Print with forced Background Graphics & Exact CR-80 Sizing
 */
export function printBadgeElement(elementId: string) {
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
  clone.classList.remove('opacity-0', 'pointer-events-none', '-z-[100]', 'hidden', 'invisible');
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.display = 'flex';

  let stylesHtml = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
    stylesHtml += el.outerHTML;
  });

  doc.open();
  doc.write(`<!DOCTYPE html>
<html dir="ltr">
<head>
  <title>Impression Badge Professionnel</title>
  ${stylesHtml}
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      width: 100%;
    }
    .print-sheet {
      width: 100%;
      max-width: 190mm;
      margin: 8mm auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .print-header {
      width: 100%;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: center;
    }
    .print-header h1 {
      margin: 0;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .print-header p {
      margin: 4px 0 0 0;
      font-size: 9px;
      color: #cbd5e1;
      font-weight: bold;
    }
    .badge-stage {
      display: flex !important;
      flex-direction: row !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 6mm !important;
      margin: 10px 0 24px 0 !important;
    }
    .wallet-card-standard {
      width: 85.6mm !important;
      height: 53.98mm !important;
      min-width: 85.6mm !important;
      min-height: 53.98mm !important;
      max-width: 85.6mm !important;
      max-height: 53.98mm !important;
      border-radius: 3.18mm !important;
      overflow: hidden !important;
      box-shadow: none !important;
      border: 1px solid #94a3b8 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      image-rendering: -webkit-optimize-contrast !important;
      image-rendering: crisp-edges !important;
    }
    .print-footer {
      width: 100%;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 15px;
      font-size: 9px;
      color: #334155;
    }
    .print-footer strong {
      color: #0f172a;
      display: block;
      margin-bottom: 5px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="print-sheet">
    <div class="print-header">
      <h1>BEYA CREATIVE — CARTE PROFESSIONNELLE OFFICIELLE</h1>
      <p>Format Standard CR-80 (85.6 × 54.0 mm) • Échelle 100% (Taille Réelle) • Haute Précision</p>
    </div>
    <div class="badge-stage">
      ${clone.outerHTML}
    </div>
    <div class="print-footer">
      <strong>✂️ CONSEILS D'IMPRESSION (QUALITÉ 100% NETTE ET LISIBLE) :</strong>
      <span>1. Cochez impérativement « <strong>Graphismes d'arrière-plan</strong> » (Background graphics) dans les options d'impression.</span><br/>
      <span>2. Choisissez l'échelle « <strong>100%</strong> » ou « <strong>Taille réelle</strong> » pour un format portefeuille exact (85.6 × 54 mm).</span><br/>
      <span>3. Découpez le long des repères pour insérer directement dans votre porte-badge ou portefeuille.</span>
    </div>
  </div>
</body>
</html>`);
  doc.close();

  const printWhenReady = () => {
    const images = Array.from(doc.querySelectorAll('img'));
    Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))).then(() => {
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
