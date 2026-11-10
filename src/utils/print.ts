import { Facture, Commande, loadCompanyProfile, FicheTechnique, loadData } from '../types';

function printHTML(html: string, title: string) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.document.title = title;
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
    }, 300);
  };
}

// ─── Facture PDF ────────────────────────────────────────────────
export function printFacture(facture: Facture, commande?: Commande) {
  const company = loadCompanyProfile();
  const statutLabel = facture.statut === 'payée' ? 'PAYÉE' : facture.statut === 'en_attente' ? 'EN ATTENTE' : 'IMPAYÉE';
  const statutColor = facture.statut === 'payée' ? '#059669' : facture.statut === 'en_attente' ? '#d97706' : '#dc2626';

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const fmtNum  = (n: number)  => n.toLocaleString('fr-MA');

  const itemsRows = commande
    ? `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">${commande.modele}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">${commande.quantite} pcs</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">${fmtNum(commande.prix)} MAD</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmtNum(commande.quantite * commande.prix)} MAD</td>
       </tr>`
    : `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">Prestation / Services</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">1</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">${fmtNum(facture.montant)} MAD</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmtNum(facture.montant)} MAD</td>
       </tr>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Facture ${facture.numero}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    .page { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .brand-icon svg { width: 24px; height: 24px; stroke: white; fill: none; stroke-width: 2; }
    .brand-name { font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 28px; font-weight: 900; color: #1e293b; letter-spacing: -1px; }
    .invoice-num { font-size: 14px; color: #64748b; margin-top: 4px; }
    .statut-badge { display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: white; background: ${statutColor}; }
    .divider { border: none; border-top: 2px solid #f1f5f9; margin: 24px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-bottom: 36px; }
    .info-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .info-value { font-size: 15px; font-weight: 600; color: #1e293b; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .info-row-label { font-size: 12px; color: #94a3b8; }
    .info-row-value { font-size: 12px; font-weight: 600; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f8fafc; }
    thead th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    .total-box { display: flex; justify-content: flex-end; }
    .total-inner { background: #1e293b; color: white; border-radius: 16px; padding: 20px 28px; text-align: right; min-width: 220px; }
    .total-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .total-value { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
    .total-currency { font-size: 14px; color: #94a3b8; margin-top: 2px; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .footer-brand { font-size: 12px; color: #94a3b8; }
    .footer-note { font-size: 11px; color: #cbd5e1; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
    .print-btn:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        </div>
        <div>
          <div class="brand-name">${company.name}</div>
          <div class="brand-sub">${company.subtitle}</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-num">${facture.numero}</div>
        <div class="statut-badge">${statutLabel}</div>
      </div>
    </div>

    <hr class="divider" />

    <div class="info-grid">
      <div>
        <div class="info-label">Émetteur</div>
        <div class="info-value" style="margin-bottom: 4px;">${company.name}</div>
        <div class="info-row-label">
          ${company.address}<br/>
          ICE: ${company.ice} &nbsp;|&nbsp; RC: ${company.rc}<br/>
          IF: ${company.if_tax} &nbsp;|&nbsp; Patente: ${company.patente}<br/>
          Tél: ${company.phone} &nbsp;|&nbsp; ${company.email}
        </div>
      </div>
      <div>
        <div class="info-label">Facturé à</div>
        <div class="info-value">${facture.client}</div>
      </div>
      <div>
        <div class="info-row"><span class="info-row-label">Date d'émission</span><span class="info-row-value">${fmtDate(facture.date)}</span></div>
        <div class="info-row"><span class="info-row-label">Date d'échéance</span><span class="info-row-value">${fmtDate(facture.echeance)}</span></div>
        ${commande ? `<div class="info-row"><span class="info-row-label">Commande</span><span class="info-row-value">${commande.reference}</span></div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:center">Quantité</th>
          <th style="text-align:right">Prix U.</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div class="total-box">
      <div class="total-inner">
        <div class="total-label">Montant Total TTC</div>
        <div class="total-value">${fmtNum(facture.montant)}</div>
        <div class="total-currency">Dirhams Marocains (MAD)</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">${company.name} ${company.subtitle} · ${new Date().getFullYear()}</div>
      <div class="footer-note">Document généré le ${new Date().toLocaleDateString('fr-MA')}</div>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">⬇ Télécharger PDF</button>
</body>
</html>`;

  printHTML(html, `Facture ${facture.numero}`);
}

// ─── Export CSV Factures ─────────────────────────────────────────
export function exportFacturesCSV(factures: Facture[]) {
  const headers = ['N° Facture', 'Client', 'Montant (MAD)', 'Date', 'Échéance', 'Statut'];
  const rows = factures.map(f => [
    f.numero,
    f.client,
    f.montant.toString(),
    f.date || '',
    f.echeance || '',
    f.statut === 'payée' ? 'Payée' : f.statut === 'en_attente' ? 'En attente' : 'Impayée',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  downloadFile(csv, `factures_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

// ─── Export CSV Charges ──────────────────────────────────────────
export function exportChargesCSV(charges: { designation: string; categorie: string; montant: number; date: string; statut: string; recurrence: string; fournisseur?: string }[]) {
  const headers = ['Désignation', 'Catégorie', 'Montant (MAD)', 'Date', 'Statut', 'Récurrence', 'Fournisseur'];
  const rows = charges.map(c => [
    c.designation, c.categorie, c.montant.toString(), c.date,
    c.statut, c.recurrence, c.fournisseur || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  downloadFile(csv, `charges_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

// ─── Bilan PDF ───────────────────────────────────────────────────
export function printBilan(data: {
  ca: number; totalCharges: number; benefice: number; marge: number;
  caAttente: number; chargesAttente: number; year: number;
}) {
  const company = loadCompanyProfile();
  const fmt = (n: number) => n.toLocaleString('fr-MA');
  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/>
<title>Bilan Financier ${data.year}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
  .page { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .title { font-size: 26px; font-weight: 900; color: #1e293b; }
  .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 28px 0; }
  .card { padding: 20px; border-radius: 12px; border: 2px solid; }
  .card.green { border-color: #d1fae5; background: #f0fdf4; color: #065f46; }
  .card.red   { border-color: #fee2e2; background: #fef2f2; color: #991b1b; }
  .card.blue  { border-color: #dbeafe; background: #eff6ff; color: #1e40af; }
  .card.purple{ border-color: #ede9fe; background: #f5f3ff; color: #5b21b6; }
  .card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; margin-bottom: 8px; }
  .card-value { font-size: 24px; font-weight: 900; }
  .card-sub   { font-size: 12px; opacity: 0.6; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #f8fafc; padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  .section-title { font-size: 14px; font-weight: 700; color: #334155; margin: 28px 0 12px; border-left: 3px solid #6366f1; padding-left: 10px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; }
</style></head>
<body><div class="page">
  <div class="header">
    <div>
      <div class="title">Bilan Financier ${data.year}</div>
      <div class="sub">${company.name} ${company.subtitle} · Généré le ${new Date().toLocaleDateString('fr-MA')}</div>
    </div>
  </div>
  <div class="grid">
    <div class="card green"><div class="card-label">Chiffre d'Affaires Encaissé</div><div class="card-value">${fmt(data.ca)} MAD</div><div class="card-sub">${fmt(data.caAttente)} MAD en attente</div></div>
    <div class="card red"><div class="card-label">Total Charges Payées</div><div class="card-value">${fmt(data.totalCharges)} MAD</div><div class="card-sub">${fmt(data.chargesAttente)} MAD à régler</div></div>
    <div class="card blue"><div class="card-label">Bénéfice Net</div><div class="card-value">${fmt(data.benefice)} MAD</div><div class="card-sub">${data.benefice >= 0 ? 'Résultat positif' : 'Résultat déficitaire'}</div></div>
    <div class="card purple"><div class="card-label">Taux de Marge</div><div class="card-value">${data.marge}%</div><div class="card-sub">Sur CA encaissé</div></div>
  </div>
  <p class="section-title">Détail Indicateurs</p>
  <table>
    <thead><tr><th>Indicateur</th><th>Montant</th></tr></thead>
    <tbody>
      <tr><td>CA Encaissé</td><td><strong>${fmt(data.ca)} MAD</strong></td></tr>
      <tr><td>CA En attente</td><td>${fmt(data.caAttente)} MAD</td></tr>
      <tr><td>Charges Payées</td><td><strong>${fmt(data.totalCharges)} MAD</strong></td></tr>
      <tr><td>Charges À Régler</td><td>${fmt(data.chargesAttente)} MAD</td></tr>
      <tr style="background:#f8fafc"><td><strong>Bénéfice Net</strong></td><td><strong style="color:${data.benefice >= 0 ? '#059669' : '#dc2626'}">${fmt(data.benefice)} MAD</strong></td></tr>
      <tr style="background:#f8fafc"><td><strong>Taux de Marge</strong></td><td><strong>${data.marge}%</strong></td></tr>
    </tbody>
  </table>
  <div class="footer">${company.name} ${company.subtitle} · Document confidentiel</div>
</div>
<button class="print-btn no-print" onclick="window.print()">⬇ Télécharger PDF</button>
</body></html>`;

  printHTML(html, `Bilan Financier ${data.year}`);
}

// ─── Fiche Technique PDF ──────────────────────────────────────────
export function printFicheTechnique(fiche: FicheTechnique) {
  const company = loadCompanyProfile();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Fiche Technique - ${fiche.modele}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; line-height: 1.5; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    .page { max-width: 900px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
    .brand-name { font-size: 24px; font-weight: 800; color: #1e293b; }
    .brand-sub { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .doc-title { text-align: right; }
    .doc-title h1 { font-size: 28px; font-weight: 900; color: #4f46e5; margin: 0; }
    .doc-title p { font-size: 14px; color: #64748b; }

    .main-grid { display: grid; grid-template-columns: 300px 1fr; gap: 30px; margin-bottom: 30px; }
    .photo-box { width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #f8fafc; aspect-ratio: 3/4; display: flex; align-items: center; justify-content: center; }
    .photo-box img { width: 100%; height: 100%; object-fit: contain; }
    .no-photo { color: #cbd5e1; font-size: 12px; text-align: center; }

    .info-section h2 { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item { margin-bottom: 15px; }
    .info-label { font-size: 12px; color: #64748b; margin-bottom: 2px; }
    .info-value { font-size: 16px; font-weight: 700; color: #1e293b; }

    table { width: 100%; border-collapse: collapse; margin-top: 20px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    thead th { background: #1e293b; color: white; padding: 12px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #334155; }
    thead th:first-child { text-align: left; width: 200px; }
    tbody td { padding: 12px; text-align: center; font-size: 13px; border: 1px solid #e2e8f0; font-weight: 600; }
    tbody td:first-child { text-align: left; background: #f8fafc; color: #475569; font-weight: 700; }
    tbody tr:nth-child(even) { background: #fcfdfe; }

    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
    .print-btn { position: fixed; bottom: 30px; right: 30px; background: #4f46e5; color: white; border: none; padding: 14px 28px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand-name">${company.name}</div>
        <div class="brand-sub">${company.subtitle}</div>
      </div>
      <div class="doc-title">
        <h1>FICHE TECHNIQUE</h1>
        <p>Référence Modèle: <strong>${fiche.modele}</strong></p>
      </div>
    </div>

    <div class="main-grid">
      <div class="photo-box">
        ${fiche.photo ? `<img src="${fiche.photo}" alt="${fiche.modele}" />` : '<div class="no-photo">AUCUNE PHOTO DISPONIBLE</div>'}
      </div>
      <div class="info-section">
        <h2>Informations Générales</h2>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Modèle</div><div class="info-value">${fiche.modele}</div></div>
          <div class="info-item"><div class="info-label">Client</div><div class="info-value">${fiche.client}</div></div>
          <div class="info-item"><div class="info-label">Type de Vêtement</div><div class="info-value">${fiche.type || '—'}</div></div>
          <div class="info-item"><div class="info-label">Consommation Tissu</div><div class="info-value">${fiche.tissuConsommation} m / pièce</div></div>
          <div class="info-item" style="grid-column: span 2;"><div class="info-label">Détails et Spécifications</div><div class="info-value" style="font-weight: 400; font-size: 13px; color: #475569;">${fiche.description || 'Spécifications standards de l\'atelier.'}</div></div>
        </div>
        
        <div style="margin-top: 25px;">
          <h2>Tailles & Gradations Disponibles</h2>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${fiche.tailles.map((t: string) => `<span style="background: #1e293b; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700;">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>Généré par Textrack ERP · ${company.name}</div>
      <div>Date: ${new Date().toLocaleDateString('fr-MA')}</div>
    </div>
  </div>

  <!-- PAGE 2 : SOURCING & MESURES -->
  <div class="page" style="page-break-before: always;">
    <div class="header">
      <div>
        <div class="brand-name">${company.name}</div>
        <div class="brand-sub">${company.subtitle}</div>
      </div>
      <div class="doc-title">
        <h1>APPROVISIONNEMENT & MESURES</h1>
        <p>Référence Modèle: <strong>${fiche.modele}</strong></p>
      </div>
    </div>

    <div class="main-grid" style="grid-template-columns: 1fr 200px;">
      <div>
        <h2 style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 15px;">Informations d'Achat & Conseils</h2>
        <div class="info-grid" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1;">
          <div class="info-item"><div class="info-label">Tissu Recommandé</div><div class="info-value" style="color: #4f46e5; font-size: 14px;">${fiche.tissuRecommande || 'À définir selon modèle'}</div></div>
          <div class="info-item"><div class="info-label">Fourchette de Prix Estimée</div>
            <div class="info-value" style="color: #059669; font-size: 14px;">
              ${(() => {
                if (fiche.costEstimate) {
                  const match = fiche.costEstimate.match(/[\d.]+/);
                  if (match) {
                    const val = parseFloat(match[0]);
                    const min = Math.round(val * 0.85);
                    const max = Math.round(val * 1.25);
                    return `${min}.00 - ${max}.00 MAD / pce`;
                  }
                }
                return 'Sur devis technique';
              })()}
            </div>
          </div>
          <div class="info-item"><div class="info-label">Lieux d'Achat Suggérés</div><div class="info-value" style="font-size: 13px;">Marché de Gros (Derb Omar / El Korea...)</div></div>
          <div class="info-item"><div class="info-label">Conseils de Coupe / Couture</div><div class="info-value" style="font-size: 13px; color: #475569;">${fiche.aiNotes ? fiche.aiNotes.slice(0, 150) + '...' : 'Utiliser un fil résistant, repassage doux recommandé.'}</div></div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column;">
        <h2 style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 15px;">Échantillon Tissu</h2>
        <div style="flex-grow: 1; border: ${fiche.tissuPhoto ? 'none' : '2px dashed #cbd5e1'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #f8fafc; overflow: hidden; max-height: 200px;">
          ${fiche.tissuPhoto 
            ? `<img src="${fiche.tissuPhoto}" style="width: 100%; height: 100%; object-fit: cover;" alt="Tissu" />` 
            : `<span style="color: #94a3b8; font-size: 12px; text-align: center; padding: 10px;">Coller l'échantillon<br/>du tissu ici</span>`
          }
        </div>
      </div>
    </div>

    <h2 style="font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 10px; margin-bottom: 10px;">Tableau des Mesures (cm)</h2>
    <table>
      <thead>
        <tr>
          <th>Point de Mesure</th>
          ${fiche.tailles.map((t: string) => `<th>${t}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${fiche.mesures.map((m: any, i: number) => {
          const parts = m.nom.split(' - ');
          const currentPrefix = parts.length > 1 ? parts[0].trim() : '';
          const prevParts = i > 0 ? fiche.mesures[i - 1].nom.split(' - ') : [];
          const prevPrefix = prevParts.length > 1 ? prevParts[0].trim() : '';
          const showHeader = currentPrefix && currentPrefix !== prevPrefix;
          const cleanNom = parts.length > 1 ? parts[1].trim() : m.nom;

          let res = '';
          if (showHeader) {
            const subParts = currentPrefix.split('/');
            const arTitle = subParts[0].trim();
            const frTitle = subParts.length > 1 ? subParts[1].trim() : arTitle;

            res += `<tr style="background: #1e293b; color: #f59e0b;">
              <td colspan="${fiche.tailles.length + 1}" style="padding: 8px 12px; border: 1px solid #334155;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-weight: 800; font-size: 13px;">
                  <span style="text-align: left;">📦 ${frTitle}</span>
                  <span style="text-align: right;" dir="rtl">📦 ${arTitle}</span>
                </div>
              </td>
            </tr>`;
          }
          res += `
            <tr>
              <td style="text-align: left; font-weight: 700; background: #f8fafc; color: #475569;">${cleanNom}</td>
              ${fiche.tailles.map((t: string) => `<td>${m.valeurs?.[t] || '—'}</td>`).join('')}
            </tr>
          `;
          return res;
        }).join('')}
      </tbody>
    </table>

    <div class="footer">
      <div>Généré par Textrack ERP · ${company.name}</div>
      <div>Date: ${new Date().toLocaleDateString('fr-MA')}</div>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">IMPRIMER / PDF</button>
</body>
</html>`;

  printHTML(html, `Fiche_${fiche.modele}`);
}

// ─── Helper ──────────────────────────────────────────────────────
function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob(['\uFEFF' + content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Helpers pour l'isolation linguistique stricte (AR / FR) ─────────────
export function cleanLabel(raw: string, isAr: boolean): string {
  if (!raw) return '';
  let s = String(raw).trim();

  // Supprimer les annotations de sourcing de ville
  s = s.replace(/\([^)]*(?:طنجة|كازا|درب عمر|سوق الجملة|Marché|Derb Omar)[^)]*\)/gi, '');

  if (isAr) {
    const hasArabic = /[\u0600-\u06FF]/.test(s);
    if (hasArabic) {
      // Conserver le texte arabe et nettoyer les doublons latins entre parenthèses tout en gardant les sigles techniques (GSM, DTF, 100%)
      s = s.replace(/\([a-zA-Z\s\/\-&.,']+\)/g, '');
      s = s.replace(/\b(?!(?:GSM|MAD|CM|XXL|XL|PU|DTF)\b)[a-zA-Z]{4,}(?:\s+[a-zA-Z]{3,})*/g, '').trim();
    }
    // Si aucun caractère arabe n'est présent (ex: terme technique AI en FR/EN), conserver le terme exact sans l'écraser par un autre modèle
  } else {
    // Mode Français : retirer les caractères arabes tout en préservant l'intégralité du libellé technique français
    const hasLatin = /[a-zA-Z]{2,}/.test(s);
    if (hasLatin) {
      s = s.replace(/[\u0600-\u06FF]+/g, '');
    } else {
      const low = s.toLowerCase();
      if (low === 'جيرسي') return 'Jersey Coton Peigné';
      if (low === 'مولتون' || low === 'مولطون') return 'Molleton Coton Gratté';
      if (low === 'شيربا') return 'Sherpa Fleece Bouclé';
      s = s.replace(/[\u0600-\u06FF]+/g, '');
    }
  }

  // Nettoyer les parenthèses orphelines et les délimiteurs vides
  s = s.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '').replace(/\s*[\/\-·]\s*$/g, '').replace(/^\s*[\/\-·]\s*/g, '').replace(/\s{2,}/g, ' ').trim();
  if (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1).trim();
  return s || String(raw).trim();
}

export function cleanMeasurementName(raw: string, isAr: boolean): string {
  if (!raw) return isAr ? 'نقطة القياس' : 'Point de Mesure';
  const low = raw.toLowerCase();

  if (low.includes('poitrine') || low.includes('صدر') || low.includes('buste') || low.includes('chest')) {
    return isAr ? 'محيط الصدر' : 'Tour de Poitrine';
  }
  if (low.includes('épaules') || low.includes('epaule') || low.includes('كتف') || low.includes('carrure') || low.includes('shoulder')) {
    return isAr ? 'عرض الكتفين' : 'Carrure Épaules';
  }
  if (low.includes('manche') || low.includes('كم') || low.includes('sleeve')) {
    return isAr ? (low.includes('longue') || low.includes('طويل') ? 'طول الأكمام الطويلة' : 'طول الأكمام') : (low.includes('longue') ? 'Longueur Manches Longues' : 'Longueur Manches');
  }
  if (low.includes('taille') || low.includes('خصر') || low.includes('ceinture') || low.includes('waist')) {
    return isAr ? 'محيط الخصر (المطاطي)' : 'Tour de Taille / Ceinture';
  }
  if (low.includes('hanche') || low.includes('bassin') || low.includes('ورك') || low.includes('حوض') || low.includes('hip')) {
    return isAr ? 'محيط الحوض والورك' : 'Tour de Bassin / Hanches';
  }
  if (low.includes('cuisse') || low.includes('فخذ') || low.includes('thigh')) {
    return isAr ? 'محيط الفخذ' : 'Tour de Cuisse';
  }
  if (low.includes('bas') || low.includes('cheville') || low.includes('ساق') || low.includes('كاحل') || low.includes('opening')) {
    return isAr ? 'عرض أسفل الساق' : 'Largeur Bas de Jambe';
  }
  if (low.includes('capuche') || low.includes('كابوش') || low.includes('hood')) {
    return isAr ? 'ارتفاع الكابوش' : 'Hauteur Capuche';
  }
  if (low.includes('col') || low.includes('ياقة') || low.includes('collar')) {
    return isAr ? 'محيط / ارتفاع الياقة' : 'Tour / Hauteur Col';
  }
  if (low.includes('emmanchure') || low.includes('حفرة') || low.includes('armhole')) {
    return isAr ? 'محيط حفرة الإبط (Emmanchure)' : 'Hauteur / Tour Emmanchure';
  }
  if (low.includes('longueur') || low.includes('طول') || low.includes('length')) {
    return isAr ? 'الطول الإجمالي' : 'Longueur Totale';
  }

  if (isAr) {
    const arOnly = raw.replace(/[a-zA-Z]/g, '').replace(/[()\/]/g, ' ').replace(/\s+/g, ' ').trim();
    return arOnly || raw;
  } else {
    const frOnly = raw.replace(/[\u0600-\u06FF]/g, '').replace(/[()\/]/g, ' ').replace(/\s+/g, ' ').trim();
    return frOnly || raw;
  }
}

export function cleanPieceName(rawName: string, isAr: boolean): string {
  if (!rawName) return isAr ? 'قطعة الموديل الرئيسية' : 'Pièce Principale';
  // Préserver fidèlement le nom exact du vêtement analysé par l'IA sans l'écraser par des modèles génériques
  return cleanLabel(rawName, isAr);
}

export function cleanCategoryTitle(rawCat: string, isAr: boolean): string {
  if (!rawCat) return isAr ? 'موديل من الذكاء الاصطناعي' : 'Modèle de Confection';
  // Préserver fidèlement la catégorie réelle détectée sur l'image
  return cleanLabel(rawCat, isAr);
}

export function cleanOperation(op: any, isAr: boolean): { nom: string; machine: string } {
  let nom = '';
  let machine = '';

  if (isAr) {
    nom = op.nomAr || op.nom || op.nomFr || 'عملية خياطة وتجميع';
    machine = op.machine || 'بيكوز عادية';
    const mLow = (machine || '').toLowerCase();
    if (mLow.includes('coupe') || mLow.includes('ciseaux')) machine = 'طاولة الفصالة / مقص كهربائي';
    else if (mLow.includes('surjet')) machine = 'سورجي 4 خيوط';
    else if (mLow.includes('recouv') || mLow.includes('ourle')) machine = 'روكوفروز (ثني الأطراف)';
    else if (mLow.includes('piqueuse')) machine = 'بيكوز عادية (إبرة واحدة)';
    else if (mLow.includes('fer') || mLow.includes('vapeur') || mLow.includes('aspirant')) machine = 'مكواة بخار صناعية / طاولة شفط';

    nom = nom.replace(/\([a-zA-Z\s\/\-0-9%&]+\)/g, '').replace(/[a-zA-Z]{3,}/g, '').trim();
  } else {
    nom = op.nomFr || op.nom || op.nomAr || 'Opération de confection';
    machine = op.machine || 'Piqueuse Plate';
    if (machine.includes('فصالة') || machine.includes('قص')) machine = 'Table de Coupe / Ciseaux';
    else if (machine.includes('سورجي') || machine.includes('سرفلة')) machine = 'Surjeteuse 4 Fils';
    else if (machine.includes('روكوفروز') || machine.includes('ثني')) machine = 'Recouvreuse';
    else if (machine.includes('بيكوز') || machine.includes('خياطة')) machine = 'Piqueuse Plate';
    else if (machine.includes('مكواة') || machine.includes('بخار')) machine = 'Fer Vapeur / Table Aspirante';

    nom = nom.replace(/[\u0600-\u06FF]/g, '').replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
  }

  return { nom, machine };
}

export function getTechnicalFabricSpecs(fabricName: string, isAr: boolean) {
  const f = (fabricName || '').toLowerCase();
  if (f.includes('côte') || f.includes('rib') || f.includes('كوت')) {
    return isAr ? {
      armure: 'كوت ريب 1×1 / 2×2',
      composition: '95% قطن ممشط · 5% إيلاسطان (ليكرا)',
      gsm: '240 - 260 غرام/م²',
      appellationCommerciale: 'كوت ريب 1×1 ليكرا قطن ممشط فاخر',
      sourcingMA: 'كوت ريب 1×1 ليكرا قطن ممشط فاخر',
      traitement: 'صباغة القطع (Garment Dye) + غسيل منعم ضد التمدد'
    } : {
      armure: 'Côte Rib 1x1 / 2x2',
      composition: '95% Coton Peigné · 5% Élasthanne (Lycra)',
      gsm: '240 - 260 GSM (g/m²)',
      appellationCommerciale: 'Côte Rib 1x1 Lycra Coton Peigné',
      sourcingMA: 'Côte Rib 1x1 Lycra Coton Peigné',
      traitement: 'Teinture en pièce (Garment Dye) + Lavage adoucissant anti-déformation'
    };
  }
  if (f.includes('terry') || f.includes('bouclette') || f.includes('بوكليت') || f.includes('غير مقطن')) {
    return isAr ? {
      armure: 'مولطون بوكليت غير مقطن (فرنش تيري)',
      composition: '100% قطن ممشط (أو 90/10 بوليستر)',
      gsm: '320 - 360 غرام/م²',
      appellationCommerciale: 'مولطون بوكليت غير مقطن (فرنش تيري قطن)',
      sourcingMA: 'مولطون بوكليت غير مقطن (فرنش تيري قطن)',
      traitement: 'غسيل أنزيمي منعم (Enzyme Wash) + صباغة تفاعلية ثابتة'
    } : {
      armure: 'French Terry (Molleton Bouclette Non-Gratté)',
      composition: '100% Coton Peigné (ou 90/10 Poly)',
      gsm: '320 - 360 GSM (g/m²)',
      appellationCommerciale: 'French Terry Coton Non-Gratté Bouclette',
      sourcingMA: 'French Terry Coton Non-Gratté Bouclette',
      traitement: 'Enzyme Wash (Lavage aux enzymes) + Teinture Réactive / Washed Vintage'
    };
  }
  if (f.includes('gratté') || f.includes('مقطن') || f.includes('شتوي') || f.includes('fleece')) {
    return isAr ? {
      armure: 'مولطون شتوي مقطن من الداخل (فليس دافئ)',
      composition: '100% قطن ممشط (أو 80/20 بولي-قطن)',
      gsm: '340 - 380 غرام/م²',
      appellationCommerciale: 'مولطون شتوي مقطن 100% قطن ممتاز',
      sourcingMA: 'مولطون شتوي مقطن 100% قطن ممتاز',
      traitement: 'تقطين داخلي ناعم وعالي الكثافة + معالجة سانفوريز ضد الانكماش'
    } : {
      armure: 'Molleton Lourd Gratté Intérieur (Brushed Fleece)',
      composition: '100% Coton Peigné (ou 80/20 Coton/Poly)',
      gsm: '340 - 380 GSM (g/m²)',
      appellationCommerciale: 'Molleton Lourd Gratté 100% Coton',
      sourcingMA: 'Molleton Lourd Gratté 100% Coton',
      traitement: 'Grattage doux haute densité + Sanforisage anti-rétrécissement'
    };
  }
  if (f.includes('interlock') || f.includes('انترلوك') || f.includes('إنترلوك')) {
    return isAr ? {
      armure: 'حياكة إنترلوك مزدوجة الوجهين (Double Fonture)',
      composition: '100% قطن ممشط معالج (مرسيريزيه)',
      gsm: '240 - 280 غرام/م²',
      appellationCommerciale: 'إنترلوك قطن ممشط فاخر ناعم الوجهين',
      sourcingMA: 'إنترلوك قطن ممشط فاخر ناعم الوجهين',
      traitement: 'معالجة حيوية (Bio-Polishing) + غسيل سيليكوني منعم'
    } : {
      armure: 'Maille Interlock Double Fonture',
      composition: '100% Coton Peigné Mercerisé',
      gsm: '240 - 280 GSM (g/m²)',
      appellationCommerciale: 'Interlock Double Fonture Coton Peigné',
      sourcingMA: 'Interlock Double Fonture Coton Peigné',
      traitement: 'Finition Bio-Polishing + Lavage siliconé adoucissant'
    };
  }
  if (f.includes('écru') || f.includes('ecru') || f.includes('brandebourg') || f.includes('officier') || (f.includes('veste') && (f.includes('toile') || f.includes('twill')))) {
    return isAr ? {
      armure: 'تويل قطن إيكرو مبطن فاخر للسترات',
      composition: '100% قطن طبيعي عالي المتانة + بطانة داخلية ناعمة',
      gsm: '280 - 340 غرام/م²',
      appellationCommerciale: 'تويل قطن إيكرو مهيكل للجاكيتات',
      sourcingMA: 'تويل قطن إيكرو مهيكل للجاكيتات',
      traitement: 'معالجة ناعمة + تثبيت حراري للأبعاد والبطانة'
    } : {
      armure: 'Twill Coton Écru Doublé Haute Finition',
      composition: '100% Coton Naturel Écru + Doublure Soyeuse',
      gsm: '280 - 340 GSM (g/m²)',
      appellationCommerciale: 'Toile de Coton Écru / Twill Lourd Doublé',
      sourcingMA: 'Toile de Coton Écru / Twill Lourd Doublé',
      traitement: 'Adoucissage thermique + Stabilisation dimensionnelle'
    };
  }
  if (f.includes('canvas') || f.includes('كانفاس') || f.includes('toile') || f.includes('twill') || f.includes('sergé')) {
    return isAr ? {
      armure: 'نسيج مبرد سيرجي / قماش كانفاس سميك',
      composition: '100% قطن مقوى عالي المتانة',
      gsm: '300 - 350 غرام/م²',
      appellationCommerciale: 'كانفاس قطني صلب ومقاوم (قماش سميك)',
      sourcingMA: 'كانفاس قطني صلب ومقاوم (قماش سميك)',
      traitement: 'غسيل حجري (Stone Wash) + تثبيت الأبعاد ضد الانكماش'
    } : {
      armure: 'Sergé / Toile Canvas Lourde (Bâche)',
      composition: '100% Coton Renforcé (Heavy Canvas)',
      gsm: '300 - 350 GSM (g/m²)',
      appellationCommerciale: 'Heavy Cotton Canvas (Toile Coton Renforcée)',
      sourcingMA: 'Heavy Cotton Canvas (Toile Coton Renforcée)',
      traitement: 'Stone Wash (Lavage à la pierre ponce) + Sanforisage'
    };
  }
  if (f.includes('popeline') || f.includes('بوبلين') || f.includes('chemise')) {
    return isAr ? {
      armure: 'نسيج بوبلين قطن ممشط للقمصان',
      composition: '100% قطن مصري / ممشط فاخر',
      gsm: '125 - 145 غرام/م²',
      appellationCommerciale: 'بوبلين قطن قمصان ناعم وممتاز',
      sourcingMA: 'بوبلين قطن قمصان ناعم وممتاز',
      traitement: 'معالجة مرسرة لإضفاء اللمعان + معالجة تسهيل الكيّ'
    } : {
      armure: 'Popeline de Coton Peigné Tissé-Teint',
      composition: '100% Coton Peigné Égyptien',
      gsm: '125 - 145 GSM (g/m²)',
      appellationCommerciale: 'Popeline de Coton Peigné Haut de Gamme',
      sourcingMA: 'Popeline de Coton Peigné Haut de Gamme',
      traitement: 'Mercerisage + Finition Easy-Care (Repassage Facile)'
    };
  }
  if (f.includes('denim') || f.includes('jean') || f.includes('جينز') || f.includes('دنيم')) {
    return isAr ? {
      armure: 'نسيج دنيم مبرد ثلاثي (جينز كلاسيكي 3/1)',
      composition: '100% قطن مقوى عالي المقاومة (12.5 أونصة)',
      gsm: '380 - 420 غرام/م² (12.5 أونصة)',
      appellationCommerciale: 'قماش دنيم جينز أصيل 12.5 أونصة',
      sourcingMA: 'قماش دنيم جينز أصيل 12.5 أونصة',
      traitement: 'معالجة سانفوريز + غسيل أنزيمي لإبراز تأثيرات الجينز'
    } : {
      armure: 'Sergé Croisé Denim Coton (Armure Jean 3/1)',
      composition: '100% Coton Renforcé (Heavy Denim 12.5oz)',
      gsm: '380 - 420 GSM (12.5 oz)',
      appellationCommerciale: 'Toile Denim 100% Coton Brut 12.5oz',
      sourcingMA: 'Toile Denim 100% Coton Brut 12.5oz',
      traitement: 'Sanforisage + Enzyme Wash & Moustaches Vintage'
    };
  }
  // Fallback Jersey
  return isAr ? {
    armure: 'حياكة جيرسي مفردة قطن ممشط',
    composition: '95% قطن ممشط · 5% إيلاسطان',
    gsm: '220 - 250 غرام/م²',
    appellationCommerciale: 'جيرسي قطن ممشط مطاطي ممتاز',
    sourcingMA: 'جيرسي قطن ممشط مطاطي ممتاز',
    traitement: 'صباغة تفاعلية ثابتة + غسيل أنزيمي منعم'
  } : {
    armure: 'Jersey Simple Fonture Coton Peigné',
    composition: '95% Coton Peigné · 5% Élasthanne',
    gsm: '220 - 250 GSM (g/m²)',
    appellationCommerciale: 'Single Jersey Coton Peigné Stretch',
    sourcingMA: 'Single Jersey Coton Peigné Stretch',
    traitement: 'Teinture Réactive + Lavage aux enzymes adoucissant'
  };
}

const CODE39_MAP: Record<string, string> = {
  '0': 'nnnwwnwnn', '1': 'wnnnwnnnw', '2': 'nnwnwnnnw', '3': 'wnwnwnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn', '9': 'nnwnnnwnn', 'A': 'wnnnnnwnw', 'B': 'nnwnnnwnw',
  'C': 'wnwnnnwnn', 'D': 'nnnnwnwnw', 'E': 'wnnnwnwnn', 'F': 'nnwnwnwnn',
  'G': 'nnnnnnwwn', 'H': 'wnnnnnwwn', 'I': 'nnwnnnwwn', 'J': 'nnnnwnwwn',
  'K': 'wnnnnnnnw', 'L': 'nnwnnnnnw', 'M': 'wnwnnnnnn', 'N': 'nnnnwnnnw',
  'O': 'wnnnwnnnn', 'P': 'nnwnwnnnn', 'Q': 'nnnnnnwnw', 'R': 'wnnnnnwnn',
  'S': 'nnwnnnwnn', 'T': 'nnnnwnwnn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn'
};

export function generateCode39Svg(text: string, height = 22): string {
  const clean = String(text || '').toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '-');
  const full = '*' + clean + '*';
  const narrowW = 1.0;
  const wideW = 2.3;
  const gapW = 1.0;

  let x = 0;
  const rects: string[] = [];
  for (let i = 0; i < full.length; i++) {
    const char = full[i];
    const pattern = CODE39_MAP[char] || CODE39_MAP['-'];
    for (let p = 0; p < 9; p++) {
      const isBar = (p % 2 === 0);
      const isWide = (pattern[p] === 'w');
      const w = isWide ? wideW : narrowW;
      if (isBar) {
        rects.push(`<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${height}" fill="#000000"/>`);
      }
      x += w;
    }
    if (i < full.length - 1) {
      x += gapW;
    }
  }
  const totalW = Math.ceil(x);
  return `<svg viewBox="0 0 ${totalW} ${height}" width="${totalW}" height="${height}" preserveAspectRatio="xMidYMid meet" style="max-width:100%;height:${height}px;display:block;margin:0 auto;" xmlns="http://www.w3.org/2000/svg">${rects.join('')}</svg>`;
}

// ─── Rapport IA / Tech Pack Corporate Noir & Blanc ──────────────────────────────
export function printRapportIA(analysis: any, image: string | null, isAr: boolean) {
  const company = loadCompanyProfile();
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';
  const revAlign = isAr ? 'left' : 'right';

  // Deterministic Reference & Date
  const year = new Date().getFullYear();
  const rawCat = (analysis.category || analysis.modele || 'TECHPACK').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'MOD';
  const refCode = `BYA-TPK-${rawCat}-${year}-${String(Date.now()).slice(-4)}`;
  const dateStr = new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const seasonFr = new Date().getMonth() >= 2 && new Date().getMonth() <= 7 ? 'PRINTEMPS / ÉTÉ (S/S)' : 'AUTOMNE / HIVER (A/W)';
  const seasonAr = new Date().getMonth() >= 2 && new Date().getMonth() <= 7 ? 'ربيع / صيف (S/S)' : 'خريف / شتاء (A/W)';
  const season = isAr ? seasonAr : seasonFr;

  // Build pieces list
  const pieces = (analysis.pieces && Array.isArray(analysis.pieces) && analysis.pieces.length > 0)
    ? analysis.pieces
    : [{
        name: cleanCategoryTitle(analysis.category, isAr),
        consumption: analysis.consumption || '1.45m',
        fabricSuggested: analysis.fabricSuggested || 'Coton Peigné',
        fit: analysis.fit || (isAr ? 'قصة مريحة قياسية' : 'Coupe Régulière / Oversize'),
        complexity: analysis.complexity || (isAr ? 'متوسطة' : 'Moyenne'),
        costEstimate: analysis.costEstimate || '35 - 55 MAD',
        components: analysis.components || (isAr ? ['صدر أمامي', 'ظهر كامل', 'أكمام', 'تشطيبات نهائية'] : ['Corps principal', 'Encolure / Col', 'Manches / Bas', 'Finitions']),
        mesures: analysis.mesures || []
      }];

  // Global metrics
  const totalConsumption = analysis.consumption || (pieces.reduce((sum: number, p: any) => {
    const val = parseFloat(String(p.consumption || '0').match(/[\d.]+/)?.[0] || '1.3');
    return sum + val;
  }, 0).toFixed(2) + 'm');

  const computedEnsembleMin = pieces.reduce((acc: number, p: any) => {
    const nums = String(p.costEstimate || '').match(/\d+/g);
    return acc + (nums ? parseInt(nums[0]) : 30);
  }, 0);
  const computedEnsembleMax = pieces.reduce((acc: number, p: any) => {
    const nums = String(p.costEstimate || '').match(/\d+/g);
    return acc + (nums && nums[1] ? parseInt(nums[1]) : (nums ? parseInt(nums[0]) + 15 : 45));
  }, 0);

  // If multi-piece ensemble, make sure cost covers all pieces
  let globalCost = analysis.costEstimate?.trim() || (pieces.length > 1 ? `${computedEnsembleMin} - ${computedEnsembleMax} MAD` : '35 - 55 MAD');
  const parsedFirstNum = parseInt(String(globalCost).match(/\d+/)?.[0] || '0');
  if (!analysis.costEstimate && pieces.length > 1 && parsedFirstNum < 40 && computedEnsembleMin >= 50) {
    globalCost = `${computedEnsembleMin} - ${computedEnsembleMax} MAD`;
  }

  const tierMode: '1_tier' | '2_tiers' | '3_tiers' = analysis.costingTierMode || '1_tier';
  const globalComplexity = isAr ? cleanLabel(analysis.complexity || 'متوسطة', true) : cleanLabel(analysis.complexity || 'Moyenne', false);
  const globalFit = isAr ? cleanLabel(analysis.fit || pieces[0]?.fit || 'قصة قياسية كاجوال', true) : cleanLabel(analysis.fit || pieces[0]?.fit || 'Regular / Oversize', false);

  // Gamme de montage operations
  const gammeOperations: any[] = (analysis.gammeMontage && Array.isArray(analysis.gammeMontage) && analysis.gammeMontage.length > 0)
    ? analysis.gammeMontage
    : [
        { nomAr: 'فصالة القماش بالمطلوة الصناعية وتحضير الرزم', nomFr: 'Coupe Matelas & Préparation Paquets', machine: 'Table de Coupe / Ciseaux', tempsMin: 0.8 },
        { nomAr: 'سرفلة وتجميع الأطراف والكتفين', nomFr: 'Assemblage & Surfilage Épaules/Côtés', machine: 'Surjeteuse 4 Fils', tempsMin: 1.8 },
        { nomAr: 'خياطة وتثبيت الياقة والأكمام بالبيكوز', nomFr: 'Montage Col & Encolure (Piqueuse)', machine: 'Piqueuse Plate', tempsMin: 2.2 },
        { nomAr: 'ثني الأطراف والأسفل بالروكوفروز', nomFr: 'Ourlet Bas & Manches (Recouvreuse)', machine: 'Recouvreuse', tempsMin: 1.5 },
        { nomAr: 'كيّ بالبخار تحت الضغط وفحص الجودة النهائي', nomFr: 'Repassage Vapeur, Épluchage & Contrôle Final', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.2 }
      ];

  const totalSamMin = Number(gammeOperations.reduce((acc, op) => acc + (Number(op.tempsMin) || 0), 0).toFixed(2));
  const totalSamSec = Math.round(totalSamMin * 60);

  // HTML Content
  const html = `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'fr'}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>DOSSIER_TECHNIQUE_${refCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      color: #000;
      background: #fff;
      font-size: 8.5px;
      line-height: 1.3;
    }
    
    .tech-pack-container {
      max-width: 780px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 8px 10px;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    
    th, td {
      border: 1px solid #000;
      padding: 3.5px 5px;
      font-size: 8px;
      vertical-align: middle;
    }
    
    th {
      background: #f1f3f5;
      color: #000;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .th-dark {
      background: #000 !important;
      color: #fff !important;
      font-weight: 900;
      font-size: 8.5px;
      letter-spacing: 0.8px;
      padding: 4px 6px;
      text-transform: uppercase;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    
    /* Header Grid */
    .header-table td {
      border: 1.5px solid #000;
      padding: 5px 8px;
    }
    
    .section-title {
      background: #000;
      color: #fff;
      font-weight: 900;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 3px 6px;
      margin-top: 6px;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #000;
    }
    
    .photo-cell {
      width: 210px;
      vertical-align: top;
      background: #fafafa;
      text-align: center;
      padding: 4px;
      position: relative;
    }
    
    .photo-cell img {
      max-width: 100%;
      max-height: 220px;
      object-fit: contain;
      border: 1px solid #000;
      background: #fff;
    }
    
    .barcode-block {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fff;
      padding: 3px 6px;
      border: 1px solid #000;
      border-radius: 2px;
      margin-top: 4px;
      max-width: 96%;
      box-sizing: border-box;
    }
    .barcode-text {
      font-family: 'IBM Plex Mono', monospace, courier;
      font-size: 7px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #000;
      margin-top: 2px;
      line-height: 1;
      text-align: center;
    }
    
    /* Sign-off Boxes */
    .sign-box {
      border: 1px solid #000;
      height: 65px;
      padding: 4px 6px;
      position: relative;
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .sign-label {
      font-size: 7.5px;
      font-weight: 800;
      text-transform: uppercase;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2px;
    }
    
    .sign-stamp-area {
      font-size: 7px;
      color: #888;
      text-align: center;
      border: 1px dashed #bbb;
      margin: 2px 0;
      padding: 4px 0;
      text-transform: uppercase;
    }
    
    .print-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #000;
      color: #fff;
      border: 2px solid #000;
      padding: 10px 22px;
      font-weight: 900;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 99999;
      font-family: 'IBM Plex Mono', monospace;
    }
    .print-fab:hover {
      background: #fff;
      color: #000;
    }
    
    @media print {
      .no-print { display: none !important; }
      body { margin: 0; }
      .tech-pack-container { border: 2px solid #000; }
    }
  </style>
</head>
<body>

  <button class="print-fab no-print" onclick="window.print()">
    🖨️ ${isAr ? 'طباعة / حفظ PDF' : 'IMPRIMER TECH PACK (PDF)'}
  </button>

  <div class="tech-pack-container">
    
    <!-- 1. CORPORATE HEADER TABLE -->
    <table class="header-table" style="margin-bottom: 6px;">
      <tr>
        <td style="width: 45%; vertical-align: middle;">
          <div style="font-size: 16px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; line-height: 1;">
            ${company.name || 'BEYA CREATIVE'}
          </div>
          <div style="font-size: 7.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; color: #000;">
            ${isAr ? 'هندسة النسيج والخياطة الصناعية · الدار البيضاء المغرب' : 'INGÉNIERIE TEXTILE & CONFECTION INDUSTRIELLE · CASABLANCA MAROC'}
          </div>
          <div style="font-size: 7px; color: #444; margin-top: 2px;">
            ${isAr ? 'ورشة معتمدة للماركات · مكتب دراسات، باترون وبطاقات تقنية صناعية' : "Atelier certifié B2B · Bureau d'études, Patronage & Fiches Techniques"}
          </div>
        </td>
        <td style="width: 25%; text-align: center; vertical-align: middle; padding: 4px;">
          <div style="font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; line-height: 1.2;">
            ${isAr ? 'الملف التقني المعتمد' : 'DOSSIER TECHNIQUE'}
          </div>
          <div style="font-size: 8px; font-weight: 800; margin-top: 2px; line-height: 1.2;">
            ${isAr ? 'TECH PACK رسمي للإنتاج' : 'TECH PACK OFFICIEL'}
          </div>
          <div class="barcode-block">
            ${generateCode39Svg(refCode, 20)}
            <div class="barcode-text">
              *${refCode}*
            </div>
          </div>
        </td>
        <td style="width: 30%; font-size: 7.5px; padding: 4px;">
          <div><strong>${isAr ? 'المرجع :' : 'RÉFÉRENCE :'}</strong> <span class="font-mono font-bold">${refCode}</span></div>
          <div><strong>${isAr ? 'تاريخ الإصدار :' : "DATE D'ÉMISSION :"}</strong> <span class="font-mono">${dateStr}</span></div>
          <div><strong>${isAr ? 'الموسم :' : 'SAISON :'}</strong> ${season}</div>
          <div><strong>${isAr ? 'الحالة :' : 'STATUT :'}</strong> <span class="font-bold">${isAr ? 'مصادق عليه للإنتاج' : 'APPROUVÉ PRODUCTION'}</span></div>
        </td>
      </tr>
    </table>

    <!-- 2. IDENTITY & MODEL PACKSHOT GRID -->
    <table>
      <tr>
        ${image ? `
        <td class="photo-cell" rowspan="2">
          <div style="font-size: 7px; font-weight: 800; text-transform: uppercase; background: #000; color: #fff; padding: 1px; margin-bottom: 3px;">
            ${isAr ? 'صورة الموديل / العينة المعتمدة' : 'VUE PROTOTYPE / PACKSHOT CONFORME'}
          </div>
          <img src="${image}" alt="Modèle" />
          <div style="font-size: 6.5px; color: #555; margin-top: 2px; font-family: monospace;">
            ${isAr ? 'مراقبة التصميم والشكل الهندسي 1/1' : 'ECH: 1/1 · CONTRÔLE SILHOUETTE'}
          </div>
        </td>
        ` : ''}
        <td style="vertical-align: top; padding: 0;">
          <div class="section-title" style="margin-top: 0;">
            <span>${isAr ? '1. مواصفات وتحديد الموديل' : '1. IDENTIFICATION & SPÉCIFICATIONS DU MODÈLE'}</span>
            <span class="font-mono">${isAr ? `${pieces.length} قطعة` : `${pieces.length} PIÈCE(S)`}</span>
          </div>
          <table style="margin-bottom: 0;">
            <tr>
              <th style="width: 28%;">${isAr ? 'اسم وصنف الموديل' : 'Désignation & Catégorie'}</th>
              <td class="font-bold" style="font-size: 9.5px;">${cleanCategoryTitle(analysis.category || pieces[0]?.name, isAr)}</td>
              <th style="width: 22%;">${isAr ? 'القصة والشكل الهيكلي' : 'Coupe & Silhouette'}</th>
              <td>${globalFit}</td>
            </tr>
            <tr>
              <th>${isAr ? 'استهلاك القماش الإجمالي' : 'Consommation Tissu Totale'}</th>
              <td class="font-bold font-mono">${totalConsumption} ${isAr ? '(عرض 1.50م)' : '(laize 1.50m)'}</td>
              <th>${isAr ? 'مستوى الصعوبة' : 'Niveau de Complexité'}</th>
              <td>${globalComplexity}</td>
            </tr>
            <tr>
              <th>${isAr ? 'مكونات الباترون الرئيسية' : 'Composants du Patron'}</th>
              <td colspan="3">
                ${pieces.map((p: any) => `<strong>${cleanPieceName(p.name, isAr)}:</strong> ${(p.components || []).map((c: string) => cleanLabel(c, isAr)).join(' · ') || (isAr ? 'صدر، ظهر، أكمام، تشطيبات' : 'Panneaux devant, dos, manches, finitions')}`).join('<br/>')}
              </td>
            </tr>
            <tr>
              <th>${isAr ? (pieces.length > 1 ? 'تقدير تكلفة الصنع (طقم كامل)' : 'تقدير تكلفة الصنع (الخدمة)') : (pieces.length > 1 ? 'Coût Façon Estimé (Ensemble)' : 'Coût Façon Estimé')}</th>
              <td class="font-bold font-mono">${isAr ? String(globalCost).replace(/MAD/gi, 'درهم') : globalCost} ${pieces.length > 1 ? `<span style="font-size: 7.5px; font-weight: 700; color: #333;">${isAr ? `(مجموع ${pieces.length} قطع)` : `(${pieces.length} Pièces Réunies)`}</span>` : ''}</td>
              <th>${isAr ? 'التصنيف الصناعي' : 'Segment Marché'}</th>
              <td>${isAr ? 'ملابس جاهزة / ستريتوير B2B' : 'Prêt-à-porter / Streetwear B2B'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 3. NOMENCLATURE DES MATIÈRES & SOURCING PIÈCE PAR PIÈCE -->
    <div class="section-title">
      <span>${isAr ? '2. جدول الأقمشة والمواد الأولية (لكل قطعة)' : '2. NOMENCLATURE TEXTILE & SOURCING (PIÈCE PAR PIÈCE)'}</span>
      <span>${isAr ? 'المواصفات التقنية للأقمشة' : 'SPÉCIFICATIONS TEXTILES'}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 16%;">${isAr ? 'القطعة' : 'Pièce'}</th>
          <th style="width: 22%;">${isAr ? 'نوع القماش والنسج' : 'Tissu & Armure'}</th>
          <th style="width: 24%;">${isAr ? 'التركيبة والغراماج (GSM)' : 'Composition & Grammage'}</th>
          <th style="width: 26%;">${isAr ? 'الاسم التجاري للثوب' : 'Désignation Commerciale du Tissu'}</th>
          <th style="width: 12%; text-align: center;">${isAr ? 'الاستهلاك' : 'Métrage'}</th>
        </tr>
      </thead>
      <tbody>
        ${pieces.map((p: any) => {
          const spec = getTechnicalFabricSpecs(p.fabricSuggested || analysis.fabricSuggested || '', isAr);
          return `
          <tr>
            <td class="font-bold uppercase">${cleanPieceName(p.name, isAr)}</td>
            <td><strong>${cleanLabel(p.fabricSuggested || spec.armure, isAr)}</strong></td>
            <td><span class="font-mono">${spec.composition}</span><br/><strong class="font-mono">${spec.gsm}</strong></td>
            <td>${spec.appellationCommerciale || spec.sourcingMA}</td>
            <td class="text-center font-bold font-mono">${p.consumption || '1.30m'}</td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- 4. FOURNITURES, MERCERIE & TRAITEMENTS DÉLAVAGE -->
    <div class="section-title">
      <span>${isAr ? '3. لوازم الخياطة والمعالجات الصناعية' : '3. FOURNITURES, MERCERIE & TRAITEMENTS DE FINITION'}</span>
      <span>${isAr ? 'قائمة المستلزمات والإنهاء (BOM)' : 'BOM / TRIMS & FINISHES'}</span>
    </div>
    <table>
      <tr>
        <th style="width: 50%;">${isAr ? 'لوازم الخياطة والإكسسوارات التقنية' : 'FOURNITURES & MERCERIE TECHNIQUE'}</th>
        <th style="width: 50%;">${isAr ? 'المعالجة الصناعية والصباغة والغسيل' : 'TRAITEMENT INDUSTRIEL & TEINTURE / DÉLAVAGE'}</th>
      </tr>
      <tr>
        <td style="vertical-align: top; font-size: 7.5px;">
          ${isAr ? `
          <ul style="padding-right: 14px; margin: 0; line-height: 1.45;">
            <li><strong>خيط الخياطة :</strong> بوليستر 120/2 عالي المقاومة متناسق اللون + خيط موس 150D للسورجي</li>
            <li><strong>حبل الشد :</strong> حبل قطني أنبوبي ممشط مع رؤوس معدنية مثبتة (أغليتس)</li>
            <li><strong>حلقات معدنية (أويي) :</strong> قطر 8 مم غير قابلة للصدأ مع تدعيم فازلين حراري</li>
            <li><strong>لاستيك الخصر :</strong> شريط مطاطي منسوج ومقوى 4.5 سم (ثبات عالي بعد الغسيل)</li>
            <li><strong>العلامات والبطاقات :</strong> بطاقة علامة منسوجة عالية الدقة + بطاقة المقاس والتركيبة القانونية</li>
            <li><strong>التغليف النهائي :</strong> كيس بولي باغ شفاف فردي مثقب + ملصق المقاس والباركود</li>
          </ul>
          ` : `
          <ul style="padding-left: 14px; margin: 0; line-height: 1.45;">
            <li><strong>Fil à coudre :</strong> Polyester 120/2 haute ténacité ton-sur-ton + fil mousse 150D pour surjeteuse</li>
            <li><strong>Accessoires de serrage :</strong> Cordon tubulaire coton peigné avec embouts métalliques sertis (aglets)</li>
            <li><strong>Œillets métalliques :</strong> Diamètre 8mm inoxydables plats avec renfort thermocollé</li>
            <li><strong>Élastique ceinture :</strong> Élastique tissé renforcé 4.5 cm (stabilité après lavages)</li>
            <li><strong>Étiquetage :</strong> Étiquette griffe tissée haute définition + étiquette taille & composition légale</li>
            <li><strong>Packaging :</strong> Polybag individuel transparent avec micro-perforations + sticker taille</li>
          </ul>
          `}
        </td>
        <td style="vertical-align: top; font-size: 7.5px;">
          ${isAr ? `
          <ul style="padding-right: 14px; margin: 0; line-height: 1.45;">
            <li><strong>نوع الصباغة :</strong> صباغة القطع الجاهزة (Garment Dye) أو صباغة تفاعلية في الحوض</li>
            <li><strong>الغسيل الصناعي :</strong> غسيل أنزيمي منعم لإعطاء ملمس مخملي ناعم وفاخر</li>
            <li><strong>تأثير اللون :</strong> تدرجات خفيفة متجانسة على الخياطات والياقة والأطراف</li>
            <li><strong>ثبات القياسات :</strong> معالجة سانفوريز ضد الانكماش (نسبة انكماش متبقية أقل من 2.5%)</li>
            <li><strong>الكيّ النهائي :</strong> كيّ بالبخار تحت الضغط على طاولة شفط مع قالب مراقبة الأبعاد</li>
          </ul>
          ` : `
          <ul style="padding-left: 14px; margin: 0; line-height: 1.45;">
            <li><strong>Type de Teinture :</strong> Garment Dye (teinture en pièce confectionnée) ou Teinture Réactive cuve</li>
            <li><strong>Lavage Industriel :</strong> Enzyme Wash pour assouplissement et toucher velouté</li>
            <li><strong>Effet Décoloration :</strong> Nuances légères sur les coutures, encolure et surpiqûres</li>
            <li><strong>Stabilité Dimensionnelle :</strong> Sanforisage préalable (taux de rétrécissement résiduel &lt; 2.5%)</li>
            <li><strong>Repassage :</strong> Repassage vapeur sous presse aspirante avec gabarit de contrôle dimensionnel</li>
          </ul>
          `}
        </td>
      </tr>
    </table>

    <!-- 5. BARÈME DES MENSURATIONS DE PRODUCTION (GRADATION S À XXL) -->
    <div class="section-title">
      <span>${isAr ? '4. جدول القياسات وتدرج المقاسات (من S إلى XXL بالسنتيمتر)' : '4. BARÈME DES MESURES DE PRODUCTION (GRADATION S À XXL en cm)'}</span>
      <span>${isAr ? 'نسبة التفاوت المسموح بها : ± 1.0 سم' : 'TOLÉRANCE CONFECTION : ± 1.0 CM'}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align: ${align}; width: 40%;">${isAr ? 'نقطة القياس / المقاس' : 'Point de Mesure / Gradation'}</th>
          <th style="width: 10%; text-align: center;">S</th>
          <th style="width: 10%; text-align: center;">M</th>
          <th style="width: 10%; text-align: center;">L</th>
          <th style="width: 10%; text-align: center;">XL</th>
          <th style="width: 10%; text-align: center;">XXL</th>
          <th style="width: 10%; text-align: center;">${isAr ? 'التفاوت' : 'TOL.'}</th>
        </tr>
      </thead>
      <tbody>
        ${(() => {
          if (pieces.length > 1) {
            return pieces.map((pc: any, pcIdx: number) => {
              const isPants = String(pc.name || '').toLowerCase().includes('pantalon') ||
                              String(pc.name || '').toLowerCase().includes('bas') ||
                              String(pc.name || '').toLowerCase().includes('sweatpant') ||
                              String(pc.name || '').toLowerCase().includes('wide-leg') ||
                              String(pc.name || '').includes('سروال') ||
                              String(pc.name || '').includes('التحتاني');

              const pMesures = pc.mesures && pc.mesures.length > 0
                ? pc.mesures
                : (isPants
                    ? [
                        { nom: isAr ? 'محيط الخصر (المطاطي)' : 'Tour de Taille / Ceinture', valeurs: { S: 68, M: 72, L: 76, XL: 80, XXL: 84 } },
                        { nom: isAr ? 'محيط الحوض والورك' : 'Tour de Bassin / Hanches', valeurs: { S: 94, M: 98, L: 102, XL: 106, XXL: 110 } },
                        { nom: isAr ? 'الطول الإجمالي للسروال' : 'Longueur Totale Pantalon', valeurs: { S: 98, M: 100, L: 102, XL: 104, XXL: 106 } },
                        { nom: isAr ? 'محيط الفخذ' : 'Tour de Cuisse', valeurs: { S: 54, M: 56, L: 58, XL: 60, XXL: 62 } },
                        { nom: isAr ? 'عرض أسفل الساق' : 'Largeur Bas de Jambe', valeurs: { S: 26, M: 27, L: 28, XL: 29, XXL: 30 } }
                      ]
                    : [
                        { nom: isAr ? 'محيط الصدر' : 'Tour de Poitrine', valeurs: { S: 84, M: 88, L: 94, XL: 100, XXL: 106 } },
                        { nom: isAr ? 'عرض الكتفين' : 'Carrure Épaules', valeurs: { S: 36, M: 38, L: 40, XL: 42, XXL: 44 } },
                        { nom: isAr ? 'محيط الخصر' : 'Tour de Taille', valeurs: { S: 66, M: 70, L: 76, XL: 82, XXL: 88 } },
                        { nom: isAr ? 'الطول الإجمالي للقطعة' : 'Longueur Totale Corps', valeurs: { S: 44, M: 46, L: 48, XL: 50, XXL: 52 } },
                        { nom: isAr ? 'طول الأكمام' : 'Longueur Manches', valeurs: { S: 58, M: 59, L: 60, XL: 61, XXL: 62 } }
                      ]);

              const pieceIcon = isPants ? '👖' : '👕';
              const pieceTitle = cleanPieceName(pc.name, isAr);
              const subHeader = `
                <tr style="background: #e2e8f0;">
                  <td colspan="7" style="font-weight: 900; font-size: 8.5px; text-transform: uppercase; padding: 4.5px 6px; letter-spacing: 0.5px;">
                    ${pieceIcon} ${isAr ? `القطعة ${pcIdx + 1} : ${pieceTitle}` : `PIÈCE ${pcIdx + 1} : ${pieceTitle}`}
                  </td>
                </tr>
              `;

              const rows = pMesures.map((m: any) => `
                <tr>
                  <td class="font-bold">${cleanMeasurementName(m.nom, isAr)}</td>
                  <td class="text-center font-mono">${m.valeurs?.S ?? '—'}</td>
                  <td class="text-center font-mono">${m.valeurs?.M ?? '—'}</td>
                  <td class="text-center font-mono">${m.valeurs?.L ?? '—'}</td>
                  <td class="text-center font-mono">${m.valeurs?.XL ?? '—'}</td>
                  <td class="text-center font-mono">${m.valeurs?.XXL ?? '—'}</td>
                  <td class="text-center font-mono">±1.0</td>
                </tr>
              `).join('');

              return subHeader + rows;
            }).join('');
          }

          // Single Piece Case
          const targetMesures = pieces[0]?.mesures && pieces[0]?.mesures.length > 0
            ? pieces[0].mesures
            : [
                { nom: isAr ? 'محيط الصدر' : 'Tour de Poitrine', valeurs: { S: 88, M: 94, L: 100, XL: 106, XXL: 112 } },
                { nom: isAr ? 'عرض الكتفين' : 'Carrure Épaules', valeurs: { S: 38, M: 40, L: 42, XL: 44, XXL: 46 } },
                { nom: isAr ? 'الطول الإجمالي للقطعة' : 'Longueur Totale Corps', valeurs: { S: 46, M: 48, L: 50, XL: 52, XXL: 54 } },
                { nom: isAr ? 'طول الأكمام' : 'Longueur Manches', valeurs: { S: 58, M: 59, L: 60, XL: 61, XXL: 62 } },
                { nom: isAr ? 'محيط الخصر (المطاطي)' : 'Tour de Taille / Ceinture', valeurs: { S: 68, M: 72, L: 76, XL: 80, XXL: 84 } }
              ];
          
          return targetMesures.map((m: any) => `
            <tr>
              <td class="font-bold">${cleanMeasurementName(m.nom, isAr)}</td>
              <td class="text-center font-mono">${m.valeurs?.S ?? '—'}</td>
              <td class="text-center font-mono">${m.valeurs?.M ?? '—'}</td>
              <td class="text-center font-mono">${m.valeurs?.L ?? '—'}</td>
              <td class="text-center font-mono">${m.valeurs?.XL ?? '—'}</td>
              <td class="text-center font-mono">${m.valeurs?.XXL ?? '—'}</td>
              <td class="text-center font-mono">±1.0</td>
            </tr>
          `).join('');
        })()}
      </tbody>
    </table>

    <!-- 6. LA GAMME DE MONTAGE & TEMPS OPÉRATOIRE (SAM) -->
    <div class="section-title">
      <span>${isAr ? '5. تسلسل مراحل الخياطة الصناعية والآلات' : '5. GAMME DE MONTAGE OPÉRATOIRE & MACHINES INDUSTRIELLES'}</span>
      <span class="font-mono">${isAr ? `الوقت الإجمالي المخصص (SAM) : ${totalSamMin} دقيقة (${totalSamSec} ثانية)` : `TEMPS TOTAL ALLOUÉ (SAM) : ${totalSamMin} MIN (${totalSamSec} SEC)`}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 6%; text-align: center;">${isAr ? 'الرقم' : 'N°'}</th>
          <th style="width: 44%; text-align: ${align};">${isAr ? 'مرحلة الخياطة والتشغيل' : 'Opération de Confection'}</th>
          <th style="width: 32%;">${isAr ? 'الآلة الصناعية المستخدمة' : 'Machine Industrielle Allouée'}</th>
          <th style="width: 18%; text-align: center;">${isAr ? 'الوقت (بالدقيقة)' : 'Temps (SAM Min)'}</th>
        </tr>
      </thead>
      <tbody>
        ${gammeOperations.map((op: any, oIdx: number) => {
          const cleanOp = cleanOperation(op, isAr);
          return `
          <tr>
            <td class="text-center font-mono font-bold">${oIdx + 1}</td>
            <td><strong>${cleanOp.nom}</strong></td>
            <td>${cleanOp.machine}</td>
            <td class="text-center font-mono font-bold">${Number(op.tempsMin || 1.0).toFixed(2)} min</td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- 7. CHIFFRAGE DE REVIENT ESTIMATIF (SÉLECTION CONTRÔLÉE : 1, 2 OU 3 NIVEAUX) -->
    ${(() => {
      const isMulti = pieces.length > 1;
      const costMatches = String(globalCost || '').match(/\d+/g);
      const minFacon = costMatches && costMatches[0] ? parseInt(costMatches[0]) : (isMulti ? 65 : 30);
      const maxFacon = costMatches && costMatches[1]
        ? parseInt(costMatches[1])
        : (costMatches && costMatches[0] ? Math.round(minFacon * 1.35) : (isMulti ? 95 : 45));

      // Premium Façon atelier (Confection & Coupe): strictly respects globalCost / user custom cost
      const premiumFaconAr = `${minFacon} - ${maxFacon} درهم`;
      const premiumFaconFr = `${minFacon} - ${maxFacon} MAD`;
      const premiumFacon = isAr ? premiumFaconAr : premiumFaconFr;

      // Realistic estimation of fabric + trims based on consumption
      const parsedConso = parseFloat(String(totalConsumption || '1.4').match(/[\d.]+/)?.[0] || '1.4');
      const estimatedMatiereMin = Math.round(parsedConso * 22 + 8);
      const estimatedMatiereMax = Math.round(parsedConso * 32 + 15);

      const revientMinMziana = minFacon + estimatedMatiereMin;
      const revientMaxMziana = maxFacon + estimatedMatiereMax;
      const grosMinMziana = Math.round(revientMinMziana * 1.45);
      const grosMaxMziana = Math.round(revientMaxMziana * 1.55);
      const detailMinMziana = Math.round(grosMinMziana * 1.6);
      const detailMaxMziana = Math.round(grosMaxMziana * 1.85);

      // Niveau 2: Standard Commercial (~72% de la façon premium)
      const minStd = Math.round(minFacon * 0.72);
      const maxStd = Math.round(maxFacon * 0.72);
      const standardFacon = isAr ? `${minStd} - ${maxStd} درهم` : `${minStd} - ${maxStd} MAD`;
      const standardFaconFr = `${minStd} - ${maxStd} MAD`;
      const revientMinNormal = Math.round(revientMinMziana * 0.75);
      const revientMaxNormal = Math.round(revientMaxMziana * 0.75);
      const grosMinNormal = Math.round(grosMinMziana * 0.75);
      const grosMaxNormal = Math.round(grosMaxMziana * 0.75);

      // Niveau 3: Économique (~52% de la façon premium)
      const minEco = Math.round(minFacon * 0.52);
      const maxEco = Math.round(maxFacon * 0.52);
      const ecoFacon = isAr ? `${minEco} - ${maxEco} درهم` : `${minEco} - ${maxEco} MAD`;
      const ecoFaconFr = `${minEco} - ${maxEco} MAD`;
      const revientMinFaible = Math.round(revientMinMziana * 0.55);
      const revientMaxFaible = Math.round(revientMaxMziana * 0.55);
      const grosMinFaible = Math.round(grosMinMziana * 0.55);
      const grosMaxFaible = Math.round(grosMaxMziana * 0.55);

      if (tierMode === '1_tier') {
        return `
        <div class="section-title">
          <span>${isAr ? '6. تكلفة الإنتاج وجودة البراند المعتمدة (B2B)' : '6. ESTIMATION DU COÛT DE REVIENT · STANDARDS MARQUE B2B'}</span>
          <span>${isAr ? 'جودة براند ممتازة (HAUT DE GAMME)' : 'CONFECTION HAUT DE GAMME CERTIFIÉE'}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 100%; text-align: ${align}; padding: 5px 8px;">
                ${isAr ? '🏆 معايير الجودة العالية للعلامات التجارية (HAUT DE GAMME / PREMIUM BRAND)' : '🏆 HAUT DE GAMME · CONFECTION PREMIUM & FINITIONS MARQUE'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-size: 8px; padding: 6px 10px; line-height: 1.55;">
                ${isAr ? `
                • <strong>نوع القماش والمادة الأولية :</strong> قطن ممشط فاخر 100% عالي الكثافة مع ثبات أبعاد بعد الغسيل الصناعي<br/>
                • <strong>مواصفات الخياطة والتشطيبات :</strong> درزات دقيقة متناسقة، خيط بوليستر 120/2 عالي المقاومة، خيط موس مرن، بطاقات علامة منسوجة HD، أكياس بولي باغ فردية مثقبة<br/>
                • <strong>تكلفة الفصالة والخياطة للورشة (Façon) :</strong> <strong class="font-mono">${premiumFacon}</strong> ${isMulti ? `(طقم كامل ${pieces.length} قطع متناسقة)` : '(للقطعة)'}<br/>
                • <strong>سعر التكلفة الإجمالي التقديري (Prix de Revient) :</strong> <strong class="font-mono" style="font-size: 9px; color: #000;">${revientMinMziana} - ${revientMaxMziana} MAD</strong><br/>
                • <strong>سعر بيع الجملة المقترح للعلامات (Vente Gros B2B) :</strong> <span class="font-mono font-bold">${grosMinMziana} - ${grosMaxMziana} MAD</span> | المقترح بالتقسيط (Détail) : <span class="font-mono font-bold">${detailMinMziana} - ${detailMaxMziana} MAD</span>
                ` : `
                • <strong>Matière Première & Armure :</strong> 100% Coton Peigné Premium haut de gamme, tenue dimensionnelle sanforisée<br/>
                • <strong>Finitions & Standards Atelier :</strong> Surpiqûres précises, fil mousse haute élasticité, étiquettes tissées HD, polybag individuel micro-perforé<br/>
                • <strong>Coût Façon Atelier (Coupe & Confection) :</strong> <strong class="font-mono">${premiumFaconFr}</strong> ${isMulti ? `(Ensemble complet ${pieces.length} pièces)` : '(par pièce)'}<br/>
                • <strong>Coût de Revient Unitaire Estimé :</strong> <strong class="font-mono" style="font-size: 9px; color: #000;">${revientMinMziana} - ${revientMaxMziana} MAD</strong><br/>
                • <strong>Prix de Vente Gros Suggéré (B2B) :</strong> <span class="font-mono font-bold">${grosMinMziana} - ${grosMaxMziana} MAD</span> | Prix Conseillé Détail : <span class="font-mono font-bold">${detailMinMziana} - ${detailMaxMziana} MAD</span>
                `}
              </td>
            </tr>
          </tbody>
        </table>
        `;
      }

      if (tierMode === '2_tiers') {
        return `
        <div class="section-title">
          <span>${isAr ? '6. شبكة تقدير تكلفة الإنتاج وسعر التكلفة الصناعي (B2B)' : '6. GRILLE DE CHIFFRAGE DE REVIENT INDUSTRIEL (B2B)'}</span>
          <span>${isAr ? 'مستويان للجودة المعتمدة' : '2 NIVEAUX DE QUALITÉ ATELIER'}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 50%;">${isAr ? '1. جودة عالية وممتازة (PREMIUM)' : '1. HAUT DE GAMME (PREMIUM)'}</th>
              <th style="width: 50%;">${isAr ? '2. جودة تجارية قياسية (STANDARD)' : '2. STANDARD COMMERCIAL (MOYEN)'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-size: 7.5px; padding: 5px 8px; line-height: 1.45;">
                ${isAr ? `
                • قطن ممشط فاخر 100% ثقيل مع ثبات عالي<br/>
                • تشطيبات احترافية، خيط موس، بطاقات منسوجة HD<br/>
                • كلفة الصنع (Façon) : <strong class="font-mono">${premiumFacon}</strong> ${isMulti ? `(طقم كامل)` : ''}<br/>
                • <strong>سعر التكلفة التقديري : ${revientMinMziana} - ${revientMaxMziana} درهم</strong><br/>
                • سعر بيع الجملة المقترح : ${grosMinMziana} - ${grosMaxMziana} درهم
                ` : `
                • Coton peigné mercerisé lourd & finitions soignées<br/>
                • Fil mousse, renforts thermocollés, étiquettes HD<br/>
                • Coût façon atelier : <strong class="font-mono">${premiumFaconFr}</strong> ${isMulti ? `(Ensemble)` : ''}<br/>
                • <strong>Coût de revient estimé : ${revientMinMziana} - ${revientMaxMziana} MAD</strong><br/>
                • Prix vente gros suggéré : ${grosMinMziana} - ${grosMaxMziana} MAD
                `}
              </td>
              <td style="font-size: 7.5px; padding: 5px 8px; line-height: 1.45;">
                ${isAr ? `
                • قطن تجاري قياسي ممشط كلاسيكي متوازن<br/>
                • خياطة وتجميع متقن في ورشة صناعية معتمدة<br/>
                • كلفة الصنع (Façon) : <strong class="font-mono">${standardFacon}</strong><br/>
                • <strong>سعر التكلفة التقديري : ${revientMinNormal} - ${revientMaxNormal} درهم</strong><br/>
                • سعر بيع الجملة المقترح : ${grosMinNormal} - ${grosMaxNormal} درهم
                ` : `
                • Coton standard cardé / peigné classique régulier<br/>
                • Assemblage régulier atelier B2B conforme<br/>
                • Coût façon atelier : <strong class="font-mono">${standardFaconFr}</strong><br/>
                • <strong>Coût de revient estimé : ${revientMinNormal} - ${revientMaxNormal} MAD</strong><br/>
                • Prix vente gros suggéré : ${grosMinNormal} - ${grosMaxNormal} MAD
                `}
              </td>
            </tr>
          </tbody>
        </table>
        `;
      }

      // Default 3 tiers
      return `
      <div class="section-title">
        <span>${isAr ? '6. شبكة تقدير تكلفة الإنتاج وسعر التكلفة الصناعي (B2B)' : '6. GRILLE DE CHIFFRAGE DE REVIENT INDUSTRIEL (B2B)'}</span>
        <span>${isAr ? '3 مستويات جودة للمنتج' : '3 NIVEAUX DE QUALITÉ'}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 33%;">${isAr ? '1. جودة عالية وممتازة (PREMIUM)' : '1. HAUT DE GAMME (PREMIUM)'}</th>
            <th style="width: 33%;">${isAr ? '2. جودة تجارية قياسية (STANDARD)' : '2. STANDARD COMMERCIAL (MOYEN)'}</th>
            <th style="width: 34%;">${isAr ? '3. جودة اقتصادية (ÉCONOMIQUE)' : '3. ÉCONOMIQUE'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-size: 7.5px;">
              ${isAr ? `
              • قطن ممشط مرسيريزيه بوزن ثقيل وفاخر<br/>
              • تشطيبات احترافية، خيط موس، بطاقات منسوجة فائقة الدقة<br/>
              • كلفة الصنع : <strong class="font-mono">${premiumFacon}</strong><br/>
              • <strong>سعر التكلفة التقديري : ${revientMinMziana} - ${revientMaxMziana} درهم</strong><br/>
              • سعر بيع الجملة المقترح : ${grosMinMziana} - ${grosMaxMziana} درهم
              ` : `
              • Coton peigné mercerisé lourd<br/>
              • Finitions premium, fil mousse, étiquettes tissées HD<br/>
              • Coût façon : <strong class="font-mono">${premiumFaconFr}</strong><br/>
              • <strong>Coût de revient estimé : ${revientMinMziana} - ${revientMaxMziana} MAD</strong><br/>
              • Prix vente gros suggéré : ${grosMinMziana} - ${grosMaxMziana} MAD
              `}
            </td>
            <td style="font-size: 7.5px;">
              ${isAr ? `
              • قطن تجاري قياسي ممشط كلاسيكي<br/>
              • خياطة وتجميع متقن في ورشة صناعية معتمدة<br/>
              • كلفة الصنع : <strong class="font-mono">${standardFacon}</strong><br/>
              • <strong>سعر التكلفة التقديري : ${revientMinNormal} - ${revientMaxNormal} درهم</strong><br/>
              • سعر بيع الجملة المقترح : ${grosMinNormal} - ${grosMaxNormal} درهم
              ` : `
              • Coton standard cardé / peigné classique<br/>
              • Assemblage régulier atelier B2B conforme<br/>
              • Coût façon : <strong class="font-mono">${standardFaconFr}</strong><br/>
              • <strong>Coût de revient estimé : ${revientMinNormal} - ${revientMaxNormal} MAD</strong><br/>
              • Prix vente gros suggéré : ${grosMinNormal} - ${grosMaxNormal} MAD
              `}
            </td>
            <td style="font-size: 7.5px;">
              ${isAr ? `
              • نسيج بولي-قطن خفيف واقتصادي<br/>
              • إنتاج سريع بدون معالجات غسيل خاصة<br/>
              • كلفة الصنع : <strong class="font-mono">${ecoFacon}</strong><br/>
              • <strong>سعر التكلفة التقديري : ${revientMinFaible} - ${revientMaxFaible} درهم</strong><br/>
              • سعر بيع الجملة المقترح : ${grosMinFaible} - ${grosMaxFaible} درهم
              ` : `
              • Maille poly-coton légère économique<br/>
              • Confection rapide sans lavage spécial<br/>
              • Coût façon : <strong class="font-mono">${ecoFaconFr}</strong><br/>
              • <strong>Coût de revient estimé : ${revientMinFaible} - ${revientMaxFaible} MAD</strong><br/>
              • Prix vente gros suggéré : ${grosMinFaible} - ${grosMaxFaible} MAD
              `}
            </td>
          </tr>
        </tbody>
      </table>
      `;
    })()}

    <!-- 8. OFFICIAL SIGN-OFF & APPROBATIONS -->
    <div class="section-title" style="margin-top: 6px;">
      <span>${isAr ? '7. المصادقة والتأشيرات الرسمية لإطلاق الإنتاج' : '7. APPROBATIONS & VISAS OFFICIELS DE LANCEMENT EN CONFECTION'}</span>
      <span>${isAr ? 'صالح للإنتاج (BON POUR PRODUCTION)' : 'BON POUR PRODUCTION'}</span>
    </div>
    <table style="margin-bottom: 4px;">
      <tr>
        <td style="width: 33.33%; padding: 0;">
          <div class="sign-box">
            <div class="sign-label">${isAr ? 'تأشيرة الموديلست / مكتب الدراسات' : "VISA MODÉLISTE / BUREAU D'ÉTUDES"}</div>
            <div class="sign-stamp-area">${isAr ? 'مكان الختم والتوقيع الرسمي' : 'Emplacement Cachet & Signature'}</div>
            <div style="font-size: 7px;">${isAr ? 'التاريخ :' : 'Date :'} ______ / ______ / ${year}</div>
          </div>
        </td>
        <td style="width: 33.33%; padding: 0;">
          <div class="sign-box">
            <div class="sign-label">${isAr ? 'تأشيرة رئيس الورشة والإنتاج' : "VISA CHEF D'ATELIER & PRODUCTION"}</div>
            <div class="sign-stamp-area">${isAr ? 'مطابقة الفصالة والخياطة الصناعية' : 'Conformité Montage & Coupe'}</div>
            <div style="font-size: 7px;">${isAr ? 'التاريخ :' : 'Date :'} ______ / ______ / ${year}</div>
          </div>
        </td>
        <td style="width: 33.33%; padding: 0;">
          <div class="sign-box">
            <div class="sign-label">${isAr ? 'موافقة العلامة التجارية / الزبون' : 'BON POUR ACCORD MARQUE / CLIENT'}</div>
            <div class="sign-stamp-area">${isAr ? 'الموافقة النهائية ومصادقة العينة الأولية' : 'Bon pour Accord & Validation Échantillon'}</div>
            <div style="font-size: 7px;">${isAr ? 'الاسم والتوقيع :' : 'Nom & Signature :'} ___________________</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- 9. FOOTER VERIFICATION -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #000; padding-top: 4px; font-size: 7px; text-transform: uppercase;">
      <div>${isAr ? 'وثيقة صناعية سرية · نظام إدارة وتطوير الخياطة الصناعية BEYA CREATIVE MAROC' : 'DOCUMENT INDUSTRIEL CONFIDENTIEL · SYSTÈME DE GESTION DE CONFECTION BEYA CREATIVE MAROC'}</div>
      <div class="font-mono font-bold">*VERIFIED-BYA-${refCode}*</div>
    </div>

  </div>

</body>
</html>`;

  printHTML(html, `TECHPACK_${refCode}`);
}

// ─── DOSSIER TECHNIQUE COMPLET (STYLE MARWA) ─────────────────────
export async function printDossierTechniqueMarwa(fiche: FicheTechnique) {
  const company = loadCompanyProfile();
  
  let modelisteName = "BEYA SYSTEM";
  try {
    const users = await loadData<any>('users');
    if (fiche.modelisteId) {
      const assigned = users.find((u: any) => u.id === fiche.modelisteId);
      if (assigned) modelisteName = assigned.nom.toUpperCase();
    } else {
      const authRaw = localStorage.getItem('textrack_auth');
      const currentUser = authRaw ? JSON.parse(authRaw) : { nom: 'BEYA SYSTEM' };
      modelisteName = currentUser.nom.toUpperCase();
    }
  } catch (e) {
    const authRaw = localStorage.getItem('textrack_auth');
    const currentUser = authRaw ? JSON.parse(authRaw) : { nom: 'BEYA SYSTEM' };
    modelisteName = currentUser.nom.toUpperCase();
  }
  const echantillonneurName = "_________________________";

  // Parse descriptions for BOM / Matelassage
  const desc = fiche.description || '';
  let componentsStr = '';
  if (desc.includes('المكونات:') || desc.includes('Composants:')) {
    componentsStr = desc.split(/المكونات:|Composants:/)[1].trim();
    if (componentsStr.includes('|')) {
      componentsStr = componentsStr.split('|')[0].trim();
    }
  }
  const components = componentsStr ? componentsStr.split(/[,،]/).map(c => c.trim()).filter(Boolean) : [];
  
  // Date format
  const fmtDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  
  // Deterministic references based on ID
  let seed = 0;
  for (let i = 0; i < fiche.id.length; i++) {
    seed += fiche.id.charCodeAt(i);
  }
  const ofNumber = 10000 + (seed % 90000);
  const refPatronage = "PTR-" + new Date(fiche.createdAt || Date.now()).getFullYear() + "-" + (100 + (seed % 900));
  const stableMat = "MAT-" + (1000 + (seed % 9000));
  
  const parsedCost = parseFloat(String(fiche.costEstimate || '0').match(/[\d.]+/)?.[0] || '0');
  const coutEstime = parsedCost > 0 ? parsedCost.toFixed(2) + ' MAD' : (fiche.complexity === 'Moyenne' || fiche.complexity?.includes('متوسط') ? '45.50 MAD' : '65.00 MAD');
  
  // Total sizes calculation (Echantillon logic = 1 piece per size)
  const defaultRepartition: Record<string, number> = {};
  fiche.tailles.forEach(t => {
      defaultRepartition[t] = 1; 
  });
  const totalQty = fiche.tailles.length || 1;
  const consoUnitaire = fiche.tissuConsommation || 0;
  const besoinTotal = (totalQty * consoUnitaire).toFixed(2);
  
  const tracagesHtml: string[] = [];
  fiche.tailles.forEach((t, i) => {
      tracagesHtml.push(`
        <tr>
           <td class="text-left font-bold">${i + 1}er TR</td>
           ${fiche.tailles.map((_, idx) => `<td>${idx === i ? 1 : ''}</td>`).join('')}
           <td class="text-left text-xs">L TR: ${consoUnitaire.toFixed(2)}m</td>
        </tr>
      `);
  });
  
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Dossier Technique - ${fiche.modele}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Roboto', Arial, sans-serif; color: #000; background: #fff; font-size: 10px; line-height: 1.3; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    @page { margin: 10mm; size: A4 landscape; }
    
    .page { width: 100%; min-height: 190mm; margin: 0 auto; padding: 15px; position: relative; }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { border: 1px solid #000; padding: 4px 6px; text-align: center; font-size: 9px; }
    th { background: #f0f0f0; font-weight: bold; text-transform: uppercase; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .bg-dark { background: #333; color: white; }
    
    /* Header Section */
    .header-grid { display: flex; justify-content: space-between; margin-bottom: 15px; border: 1px solid #000; }
    .logo-cell { padding: 10px; width: 150px; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .ref-cell { flex: 1; padding: 5px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid #000; }
    .of-cell { width: 250px; padding: 0; display: flex; flex-direction: column; }
    
    .of-row { display: flex; border-bottom: 1px solid #000; height: 50%; }
    .of-row:last-child { border-bottom: none; }
    .of-label { width: 60px; padding: 4px; border-right: 1px solid #000; font-weight: bold; }
    .of-val { flex: 1; padding: 4px; text-align: center; font-weight: bold; font-size: 11px; }

    .title-banner { background: #333; color: white; font-weight: bold; text-align: center; padding: 4px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px;}
    
    /* Image Section */
    .image-box { border: 1px solid #000; width: 100px; height: 140px; display: flex; align-items: center; justify-content: center; margin-right: 10px; float: left; }
    .image-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    
    .content-wrapper { display: flex; gap: 10px; }
    .content-main { flex: 1; }
    
    .print-btn { position: fixed; bottom: 20px; right: 20px; background: #000; color: white; border: none; padding: 12px 24px; font-weight: bold; font-size: 12px; cursor: pointer; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 1000;}
  </style>
</head>
<body>

  <!-- PAGE 1: NOMENCLATURE / FICHE DE LANCEMENT -->
  <div class="page">
    <div class="header-grid">
      <div class="logo-cell">${company.name}</div>
      <div class="ref-cell">
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
           <span class="font-bold text-right" style="width:140px;">REFERENCE MODELE:</span>
           <span class="font-bold" style="text-align:center; flex:1; border:1px solid #000; margin-left:10px;">${fiche.modele.toUpperCase()}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
           <span class="font-bold text-right" style="width:140px;">REFERENCE PATRONAGE:</span>
           <span class="font-bold" style="text-align:center; flex:1; border:1px solid #000; margin-left:10px;">${refPatronage}</span>
        </div>
      </div>
      <div class="of-cell">
        <div class="of-row">
          <div class="of-label">OF:</div>
          <div class="of-val">${ofNumber}</div>
        </div>
        <div class="of-row">
          <div class="of-label">DATE:</div>
          <div class="of-val">${fmtDate}</div>
        </div>
      </div>
    </div>
    
    <div class="title-banner">FICHE DE LANCEMENT & NOMENCLATURE</div>
    
    <div class="content-wrapper">
      <div class="image-box">
        ${fiche.photo ? `<img src="${fiche.photo}" />` : 'PHOTO'}
      </div>
      
      <div class="content-main">
        <table>
          <tr>
            <th width="15%" class="text-left">ÉCHANTILLONNEUR</th>
            <td width="35%">${echantillonneurName}</td>
            <th width="15%" class="text-left">TYPE PRODUIT</th>
            <td width="35%">${fiche.type || 'VÊTEMENT'}</td>
          </tr>
          <tr>
            <th class="text-left">MODELISTE</th>
            <td>${modelisteName}</td>
            <th class="text-left">CLIENT</th>
            <td>${fiche.client}</td>
          </tr>
        </table>
        
        <table style="margin-top: 10px;">
          <tr>
            <td class="bg-dark font-bold" width="10%">TAILLES</td>
            ${fiche.tailles.map(t => `<th>${t}</th>`).join('')}
            <td class="bg-dark font-bold" width="10%">TOTAL</td>
          </tr>
          <tr>
            <td class="font-bold">REPARTITION</td>
            ${fiche.tailles.map(t => `<td>${defaultRepartition[t]}</td>`).join('')}
            <td class="font-bold">${totalQty}</td>
          </tr>
        </table>
        
        <div class="title-banner" style="background:#f0f0f0; color:#000; margin-top:10px; font-size:9px;">MATIÈRES ET FOURNITURES (BOM)</div>
        <table>
          <tr>
            <th>TYPE</th>
            <th>DESCRIPTION</th>
            <th>RÉFÉRENCE</th>
            <th>CONS. UNIT.</th>
            <th>UNITÉ</th>
            <th>OBSERVATION</th>
          </tr>
          <tr>
            <td class="font-bold">PRINCIPAL</td>
            <td class="text-left">${fiche.tissuRecommande || 'TISSU PRINCIPAL'}</td>
            <td>${stableMat}</td>
            <td>${consoUnitaire}</td>
            <td>m</td>
            <td>${fiche.fit || ''}</td>
          </tr>
          ${components.map((c: any, index: number) => {
            const isFourniture = c.toLowerCase().match(/zip|سحاب|fermeture|bouton|أزرار|elastique|شريط|صدف/);
            const type = isFourniture ? 'FOURNITURE' : 'COMPOSANT';
            const unit = isFourniture ? 'Pce' : '—';
            const ref = isFourniture ? `FRN-${100 + ((seed + index) % 900)}` : '—';
            return `
            <tr>
              <td class="font-bold">${type}</td>
              <td class="text-left">${c}</td>
              <td>${ref}</td>
              <td>${isFourniture ? '1' : '—'}</td>
              <td>${unit}</td>
              <td>MONTAGE</td>
            </tr>
            `;
          }).join('')}
        </table>
        
        <div style="display:flex; justify-content:flex-end; margin-top:15px;">
           <table style="width: 250px;">
              <tr>
                 <td class="bg-dark font-bold" style="font-size:12px; padding:8px;">COUT ESTIMÉ</td>
                 <td style="font-size:14px; font-weight:900; padding:8px;">${coutEstime}</td>
              </tr>
           </table>
        </div>
        
      </div>
    </div>
  </div>
  
  <!-- PAGE 2: ORDRE DE COUPE -->
  <div class="page page-break">
    <div class="header-grid">
      <div class="logo-cell">${company.name}</div>
      <div class="ref-cell" style="justify-content:center; text-align:center;">
        <span style="font-size:16px; font-weight:900;">ORDRE DE COUPE</span>
      </div>
      <div class="of-cell">
        <div class="of-row">
          <div class="of-label">MODÈLE:</div>
          <div class="of-val">${fiche.modele}</div>
        </div>
        <div class="of-row">
          <div class="of-label">OF:</div>
          <div class="of-val">${ofNumber}</div>
        </div>
      </div>
    </div>
    
    <table>
      <tr>
        <td class="bg-dark font-bold" width="15%">TAILLES CDE</td>
        ${fiche.tailles.map(t => `<th>${t}</th>`).join('')}
        <td class="bg-dark font-bold" width="10%">TOTAL</td>
      </tr>
      <tr>
        <td>QTÉ</td>
        ${fiche.tailles.map(t => `<td>${defaultRepartition[t]}</td>`).join('')}
        <td class="font-bold">${totalQty}</td>
      </tr>
    </table>
    
    <div style="border:2px solid #000; padding:2px;">
      <table style="margin-bottom:0; border:none;">
        <tr style="background:#f0f0f0;">
           <th class="text-left">PRINCIPAL</th>
           <th colspan="${fiche.tailles.length}">MATIÈRE: ${fiche.tissuRecommande || 'TISSU'}</th>
           <th>LAIZE: 1.50 m</th>
           <th>TOTAL MATELAS</th>
        </tr>
        <tr>
           <td class="bg-dark font-bold">TAILLES</td>
           ${fiche.tailles.map(t => `<th class="bg-dark">${t}</th>`).join('')}
           <td rowspan="2" style="font-weight:900; font-size:14px; vertical-align:middle;">${totalQty}</td>
        </tr>
        <tr>
           <td class="font-bold">QTE/TAILLE</td>
           ${fiche.tailles.map(t => `<td>${defaultRepartition[t]}</td>`).join('')}
        </tr>
        ${tracagesHtml.join('')}
      </table>
      
      <table style="margin-bottom:0; margin-top:5px;">
        <tr>
           <td class="font-bold bg-dark text-right" style="width:60%;">BESOIN TOTAL:</td>
           <td class="font-bold" style="width:20%;">${besoinTotal}</td>
           <td style="width:20%;">m</td>
        </tr>
        <tr>
           <td class="font-bold bg-dark text-right">CONSOM UNITAIRE:</td>
           <td class="font-bold">${consoUnitaire}</td>
           <td>m</td>
        </tr>
      </table>
    </div>
    
    <div style="margin-top:20px; font-size:9px; color:#555;">
       * Note: L'ordre de coupe est généré automatiquement. Le matelassage exact dépendra de la laize réelle du rouleau de tissu.
    </div>
  </div>
  
  <!-- PAGE 3: MESURES ET MONTAGE -->
  <div class="page page-break">
    <div class="header-grid">
      <div class="logo-cell">${company.name}</div>
      <div class="ref-cell" style="justify-content:center; text-align:center;">
        <span style="font-size:16px; font-weight:900;">TABLEAU DES MESURES & MONTAGE</span>
      </div>
      <div class="of-cell">
        <div class="of-row">
          <div class="of-label">MODÈLE:</div>
          <div class="of-val">${fiche.modele}</div>
        </div>
      </div>
    </div>
    
    <div class="content-wrapper">
      <div class="content-main">
        <table>
          <tr>
            <th width="5%">N°</th>
            <th class="text-left">DESIGNATION (POINTS DE MESURE)</th>
            ${fiche.tailles.map(t => `<th width="8%">${t}</th>`).join('')}
          </tr>
          ${fiche.mesures.map((m: any, i: number) => `
          <tr>
            <td>${i+1}</td>
            <td class="text-left font-bold">${m.nom}</td>
            ${fiche.tailles.map((t: string) => `<td>${m.valeurs[t] || '-'}</td>`).join('')}
          </tr>
          `).join('')}
        </table>
        
        <div class="title-banner" style="background:#f0f0f0; color:#000; margin-top:15px; font-size:9px; text-align:left; padding-left:10px;">RISK ASSESSMENT / INSTRUCTIONS DE MONTAGE</div>
        <table style="border:2px solid #000;">
          <tr>
            <td width="5%" class="font-bold">1</td>
            <td class="text-left">Respect de l'ourlet en utilisant la machine points invisibles (attention au réglage)</td>
          </tr>
          <tr>
            <td class="font-bold">2</td>
            <td class="text-left">Respect des crans et des titres (élastique, fronces) inscrits sur le patronage</td>
          </tr>
          <tr>
            <td class="font-bold">3</td>
            <td class="text-left">Respect de la référence viseline (s'assurer du bon collage et du retrait)</td>
          </tr>
          <tr>
            <td class="font-bold">4</td>
            <td class="text-left">Montage + rabattage selon l'échantillon validé</td>
          </tr>
          <tr>
            <td class="font-bold">5</td>
            <td class="text-left">Contrôle qualité strict des points d'arrêt et de la propreté intérieure</td>
          </tr>
        </table>
      </div>
      
      <div class="image-box" style="margin-right:0; margin-left:10px; width:150px; height:auto; min-height:200px;">
         ${fiche.photo ? `<img src="${fiche.photo}" style="max-height:300px;" />` : 'PHOTO DU MODÈLE'}
      </div>
    </div>
    
    <div style="position:absolute; bottom:15px; left:15px; font-size:8px; color:#999;">
       Généré par BEYA CREATIVE ERP • Dossier Technique Complet
    </div>
  </div>

  ${fiche.aiNotes ? `
  <!-- PAGE 4: ANALYSE IA -->
  <div class="page page-break">
    <div class="header-grid">
      <div class="logo-cell">${company.name}</div>
      <div class="ref-cell" style="justify-content:center; text-align:center;">
        <span style="font-size:16px; font-weight:900;">ANALYSE DÉTAILLÉE DE L'IA</span>
      </div>
      <div class="of-cell">
        <div class="of-row">
          <div class="of-label">MODÈLE:</div>
          <div class="of-val">${fiche.modele}</div>
        </div>
      </div>
    </div>
    <div style="font-size:10px; white-space:pre-wrap; line-height:1.6; padding:15px; border:1px solid #000; background:#fff; direction: rtl; text-align: right;">${fiche.aiNotes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <div style="position:absolute; bottom:15px; left:15px; font-size:8px; color:#999;">
       Généré par BEYA CREATIVE ERP • Dossier Technique Complet
    </div>
  </div>
  ` : ''}

  <button class="print-btn no-print" onclick="window.print()">🖨️ IMPRIMER / SAUVEGARDER PDF</button>
</body>
</html>`;

  printHTML(html, `Dossier_Technique_${fiche.modele}`);
}
