import { Facture, Commande, loadCompanyProfile, FicheTechnique } from '../types';

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
          <div class="info-item"><div class="info-label">Type</div><div class="info-value">${fiche.type || '—'}</div></div>
          <div class="info-item"><div class="info-label">Consommation</div><div class="info-value">${fiche.tissuConsommation} m / pièce</div></div>
          <div class="info-item" style="grid-column: span 2;"><div class="info-label">Description</div><div class="info-value" style="font-weight: 400; font-size: 14px;">${fiche.description || 'Pas de description.'}</div></div>
        </div>
        
        <div style="margin-top: 20px;">
          <h2>Tailles & Gradations</h2>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${fiche.tailles.map((t: string) => `<span style="background: #1e293b; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700;">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <h2>Tableau des Mesures (cm)</h2>
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

// ─── Rapport IA PDF ──────────────────────────────────────────────
export function printRapportIA(analysis: any, image: string | null, isAr: boolean) {
  const company = loadCompanyProfile();
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';
  const revAlign = isAr ? 'left' : 'right';

  const t_title = isAr ? 'تفاصيل وتحليل الموديل' : 'ANALYSE DU MODÈLE';
  const t_general = isAr ? 'معلومات الموديل' : 'Informations du Modèle';
  const t_category = isAr ? 'الصنف / الموديل' : 'Catégorie / Modèle';
  const t_cost = isAr ? 'تكلفة الخياطة (تقدير)' : 'Coût de Façon (Estimé)';
  const t_consumption = isAr ? 'استهلاك الثوب' : 'Consommation Tissu';
  const t_complexity = isAr ? 'مستوى التفاصيل' : 'Niveau de Détail';
  const t_fit = isAr ? 'القصة / Fit' : 'Coupe / Fit';
  const t_fabrics = isAr ? 'اقتراحات الأثواب المناسبة' : 'Suggestions de Tissus';
  const t_primary = isAr ? 'الثوب الرئيسي الموصى به' : 'Tissu Principal Recommandé';
  const t_alternatives = isAr ? 'بدائل أخرى' : 'Alternatives Possibles';
  const t_pros = isAr ? 'المميزات:' : 'Avantages:';
  const t_cons = isAr ? 'ملاحظات:' : 'À noter:';
  const t_components = isAr ? 'مكونات الموديل' : 'Détails du Modèle';

  // Process global vs piece-specific data
  const globalCost = analysis.costEstimate || '—';
  let globalConso = analysis.consumption || '—';
  if (globalConso.includes(':')) {
    globalConso = globalConso.split('|')[0].split(':')[1]?.trim() || globalConso;
  } else if (globalConso.includes('|')) {
    globalConso = globalConso.split('|')[0].trim();
  }
  const globalComp = analysis.complexity || '—';
  
  // Fabrics
  const primaryFabric = analysis.fabricSuggested || '—';
  const alts = analysis.fabricAlternatives || [];

  const html = `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'fr'}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>${t_title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; background: #fff; line-height: 1.5; -webkit-font-smoothing: antialiased; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    @page { margin: 10mm; size: A4 portrait; }
    .page { max-width: 900px; margin: 0 auto; padding: 30px 40px; }
    
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; flex-direction: ${isAr ? 'row-reverse' : 'row'}; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1; }
    .brand-sub { font-size: 11px; color: #6366f1; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 800; margin-top: 6px; }
    
    .doc-title { text-align: ${revAlign}; }
    .doc-title h1 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .doc-title p { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 6px; }

    .main-grid { display: flex; gap: 40px; margin-bottom: 30px; flex-direction: ${isAr ? 'row-reverse' : 'row'}; }
    
    .photo-col { width: 320px; flex-shrink: 0; }
    .photo-box { width: 100%; background: #f8fafc; border-radius: 20px; padding: 12px; text-align: center; border: 1px solid #f1f5f9; }
    .photo-box img { width: 100%; max-height: 450px; border-radius: 12px; object-fit: contain; }

    .info-col { flex: 1; }
    
    .section-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; margin-top: 24px; display: flex; align-items: center; gap: 10px; flex-direction: ${isAr ? 'row-reverse' : 'row'}; }
    .section-title:first-child { margin-top: 0; }
    
    .category-box { margin-bottom: 24px; text-align: ${align}; }
    .category-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .category-val { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px; }

    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .metric-card { background: #f8fafc; padding: 16px; border-radius: 16px; text-align: ${align}; }
    .metric-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .metric-val { font-size: 16px; font-weight: 800; color: #0f172a; }

    .comps-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; justify-content: ${isAr ? 'flex-end' : 'flex-start'}; }
    .comp-item { background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 600; padding: 8px 14px; border-radius: 8px; }

    .fabric-card { background: #0f172a; color: white; padding: 24px; border-radius: 20px; margin-bottom: 16px; text-align: ${align}; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2); }
    .fabric-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .fabric-val { font-size: 20px; font-weight: 900; color: white; }

    .alt-grid { display: flex; flex-direction: column; gap: 12px; }
    .alt-card { background: #fff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px; text-align: ${align}; }
    .alt-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .alt-pros, .alt-cons { font-size: 11px; line-height: 1.5; margin-bottom: 4px; font-weight: 500; }
    .alt-pros strong { color: #059669; font-weight: 800; }
    .alt-cons strong { color: #dc2626; font-weight: 800; }

    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; flex-direction: ${isAr ? 'row-reverse' : 'row'}; }
    .print-btn { position: fixed; bottom: 30px; right: 30px; background: #0f172a; color: white; border: none; padding: 16px 32px; border-radius: 50px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3); transition: transform 0.2s; }
    .print-btn:active { transform: scale(0.95); }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div style="text-align: ${align}">
        <div class="brand-name">${company.name}</div>
        <div class="brand-sub">${company.subtitle}</div>
      </div>
      <div class="doc-title">
        <h1>${t_title}</h1>
        <p>${new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>

    <div class="main-grid">
      ${image ? `
      <div class="photo-col">
        <div class="photo-box">
          <img src="${image}" alt="Modèle" />
        </div>
      </div>
      ` : ''}
      
      <div class="info-col">
        
        <div class="category-box">
          <div class="category-label">${t_category}</div>
          <div class="category-val">${analysis.category || '—'}</div>
        </div>

        <div class="section-title">
          <span style="font-size: 16px;">📊</span> ${t_general}
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">${t_cost}</div>
            <div class="metric-val">${globalCost}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${t_consumption}</div>
            <div class="metric-val">${globalConso}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${t_complexity}</div>
            <div class="metric-val">${globalComp}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${t_fit}</div>
            <div class="metric-val">${analysis.fit || analysis.pieces?.[0]?.fit || '—'}</div>
          </div>
        </div>

        ${analysis.components && analysis.components.length > 0 ? `
        <div class="section-title">
          <span style="font-size: 16px;">🧩</span> ${t_components}
        </div>
        <div class="comps-list">
          ${analysis.components.map((c: string) => `<div class="comp-item">${c}</div>`).join('')}
        </div>
        ` : ''}

        <div class="section-title">
          <span style="font-size: 16px;">🧵</span> ${t_fabrics}
        </div>
        
        <div class="fabric-card">
          <div class="fabric-label">${t_primary}</div>
          <div class="fabric-val">${primaryFabric}</div>
        </div>

        ${alts.length > 0 ? `
        <div class="category-label" style="margin-bottom: 12px; margin-top: 16px; text-align: ${align}">${t_alternatives}</div>
        <div class="alt-grid">
          ${alts.map((a: any) => `
          <div class="alt-card">
            <div class="alt-title">${a.name}</div>
            <div class="alt-pros"><strong>${t_pros}</strong> ${a.pros}</div>
            <div class="alt-cons"><strong>${t_cons}</strong> ${a.cons}</div>
          </div>
          `).join('')}
        </div>
        ` : ''}

      </div>
    </div>

    <div class="footer">
      <div>Généré par BEYA CREATIVE - Analyse Technique</div>
      <div>© ${new Date().getFullYear()} ${company.name}</div>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">🖨️ ${isAr ? 'طباعة / تحميل PDF' : 'IMPRIMER / PDF'}</button>
</body>
</html>`;

  printHTML(html, `Rapport_IA_${new Date().getTime()}`);
}

// ─── DOSSIER TECHNIQUE COMPLET (STYLE MARWA) ─────────────────────
export function printDossierTechniqueMarwa(fiche: FicheTechnique) {
  const company = loadCompanyProfile();
  
  // Parse descriptions for BOM / Matelassage
  const desc = fiche.description || '';
  const components = desc.includes('المكونات:') ? desc.split(/المكونات:|Composants:/)[1].trim().split(/[,،]/) : [];
  
  // Date format
  const fmtDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const ofNumber = Math.floor(10000 + Math.random() * 90000);
  const refPatronage = "PTR-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
  
  // Total sizes calculation
  const defaultRepartition: Record<string, number> = {};
  fiche.tailles.forEach(t => {
      // simulate realistic command if no real data
      defaultRepartition[t] = t === 'M' || t === 'L' ? 100 : 50; 
  });
  const totalQty = Object.values(defaultRepartition).reduce((a,b) => a+b, 0) || 1;
  const consoUnitaire = fiche.tissuConsommation || 0;
  const besoinTotal = (totalQty * consoUnitaire).toFixed(2);
  
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
            <th width="15%" class="text-left">CHEF PRODUIT</th>
            <td width="35%">BEYA EQUIPE</td>
            <th width="15%" class="text-left">TYPE PRODUIT</th>
            <td width="35%">${fiche.type || 'VÊTEMENT'}</td>
          </tr>
          <tr>
            <th class="text-left">MODELISTE</th>
            <td>BEYA SYSTEM</td>
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
            <td>MAT-${Math.floor(Math.random()*9000)}</td>
            <td>${consoUnitaire}</td>
            <td>m</td>
            <td>${fiche.fit || ''}</td>
          </tr>
          <tr>
            <td class="font-bold">VISLINE</td>
            <td class="text-left">ENTOILAGE TERMO</td>
            <td>VIS-001</td>
            <td>0.25</td>
            <td>m</td>
            <td>COL/POIGNETS</td>
          </tr>
          ${components.map((c: any) => `
          <tr>
            <td>COMPOSANT</td>
            <td class="text-left">${c}</td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
            <td>MONTAGE</td>
          </tr>
          `).join('')}
          <tr>
            <td class="font-bold">ACCESSOIRE</td>
            <td class="text-left">ÉTIQUETTE MARQUE</td>
            <td>ETI-MQ</td>
            <td>1</td>
            <td>Pce</td>
            <td>MILIEU DOS</td>
          </tr>
          <tr>
            <td class="font-bold">EMBALLAGE</td>
            <td class="text-left">SACHET PLASTIQUE</td>
            <td>SAC-01</td>
            <td>1</td>
            <td>Pce</td>
            <td>—</td>
          </tr>
        </table>
        
        <div style="display:flex; justify-content:flex-end; margin-top:15px;">
           <table style="width: 250px;">
              <tr>
                 <td class="bg-dark font-bold" style="font-size:12px; padding:8px;">COUT ESTIMÉ</td>
                 <td style="font-size:14px; font-weight:900; padding:8px;">${fiche.complexity === 'Moyenne' || fiche.complexity?.includes('متوسط') ? '45.50' : '65.00'} MAD</td>
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
        <tr>
           <td class="text-left font-bold">1er TR</td>
           ${fiche.tailles.map((t, i) => `<td>${i === 1 || i === 2 ? 1 : ''}</td>`).join('')}
           <td class="text-left text-xs">L TR: 3.20m</td>
        </tr>
        <tr>
           <td class="text-left font-bold">2em TR</td>
           ${fiche.tailles.map((t, i) => `<td>${i === 0 || i === 3 ? 1 : ''}</td>`).join('')}
           <td class="text-left text-xs">L TR: 3.15m</td>
        </tr>
        <tr>
           <td class="text-left font-bold">3em TR</td>
           ${fiche.tailles.map((t, i) => `<td>${i === 4 ? 1 : ''}</td>`).join('')}
           <td class="text-left text-xs">L TR: 1.60m</td>
        </tr>
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

  <button class="print-btn no-print" onclick="window.print()">🖨️ IMPRIMER / SAUVEGARDER PDF</button>
</body>
</html>`;

  printHTML(html, `Dossier_Technique_${fiche.modele}`);
}
