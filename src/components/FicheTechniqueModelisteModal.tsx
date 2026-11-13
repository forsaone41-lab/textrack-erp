import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Scissors,
  Calendar,
  Layers,
  FileText,
  Ruler,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
  Package,
  Sparkles,
  Save,
  Check,
  Pencil,
  RefreshCw
} from 'lucide-react';
import { FicheTechnique, Lead, loadCompanyProfile } from '../types';
import { ModelItem } from '../pages/ModelisteSuivi';
import { GARMENT_DEFAULT_MEASUREMENTS, GarmentType, SizingCategory } from '../lib/patronageAiEngine';

interface FicheTechniqueModelisteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ModelItem | null;
  matchingFiche?: FicheTechnique | null;
  onSaveTechnicalNotes?: (leadId: string, notes: string) => Promise<void>;
  onSaveMeasurements?: (itemId: string, measurements: any, sourceType: 'lead' | 'fiche') => Promise<void>;
  isAr?: boolean;
}

// Detection of Garment Category for Default Industrial Measurements
function detectGarmentCategory(name?: string): GarmentType {
  const norm = (name || '').toLowerCase();
  if (norm.includes('abaya') || norm.includes('3baya') || norm.includes('djellaba') || norm.includes('jellaba') || norm.includes('gandora')) {
    return 'abaya';
  }
  if (norm.includes('caftan') || norm.includes('kaftan') || norm.includes('takchita')) {
    return 'caftan';
  }
  if (norm.includes('robe') || norm.includes('dress') || norm.includes('foustan') || norm.includes('kiswa')) {
    return 'robe';
  }
  if (norm.includes('chemise') || norm.includes('chemisier') || norm.includes('blouse') || norm.includes('shirt')) {
    return 'chemise';
  }
  if (norm.includes('pantalon') || norm.includes('trouser') || norm.includes('serwal') || norm.includes('jean')) {
    return 'pantalon';
  }
  if (norm.includes('jupe') || norm.includes('skirt')) {
    return 'jupe';
  }
  if (norm.includes('blazer') || norm.includes('veste') || norm.includes('jacket') || norm.includes('manteau') || norm.includes('coat')) {
    return 'blazer';
  }
  if (norm.includes('short') || norm.includes('bermuda')) {
    return 'short';
  }
  if (norm.includes('boxer') || norm.includes('calecon')) {
    return 'boxer';
  }
  return 'robe'; // Default general garment
}

/**
 * Purges all commercial, budget, price, CRM intake metadata and empty template lines
 * so the Modéliste and printed Tech Pack exclusively contain pure technical instructions.
 */
export function sanitizeNotesForModeliste(rawNotes?: string | null): string {
  if (!rawNotes || typeof rawNotes !== 'string') return '';

  const lines = rawNotes.split(/\r?\n/);
  const cleaned: string[] = [];

  for (const line of lines) {
    let trimmed = line.trim();
    if (!trimmed) continue;

    // 1. Discard entire CRM lead intake header line
    // e.g. "Type Client: debutant | Nom: N/A | Budget: 5000-10000 | Délai: normal"
    if (/^type\s*client\s*:/i.test(trimmed)) {
      continue;
    }

    // 2. Discard pure boilerplate lines and templates
    if (/^nom\s*:\s*(n\/a|none|null|\s*)$/i.test(trimmed)) continue;
    if (/^budget\s*:\s*[^\r\n]+/i.test(trimmed)) continue;
    if (/^délai\s*:\s*(normal|urgent|standard|\s*)$/i.test(trimmed)) continue;
    if (/^modèle:\s*[^|]+\|\s*qté:\s*\d+$/i.test(trimmed)) continue;
    if (/^tailles:\s*(\{\}|\[\]|\s*)$/i.test(trimmed)) continue;
    if (/^détails:\s*$/i.test(trimmed)) continue;
    if (/^notes:\s*$/i.test(trimmed)) continue;

    // 3. Format sizes JSON cleanly if populated: e.g. "Tailles: {"M": 10}" -> "Tailles demandées: M (10 pcs)"
    const sizesMatch = trimmed.match(/^tailles:\s*(\{.*\})/i);
    if (sizesMatch) {
      try {
        const parsedObj = JSON.parse(sizesMatch[1]);
        const entries = Object.entries(parsedObj).filter(
          ([_, v]) => v !== '' && v !== null && v !== undefined && v !== 0 && v !== '0'
        );
        if (entries.length > 0) {
          cleaned.push(`Tailles demandées : ${entries.map(([k, v]) => `${k} (${v} pcs)`).join(', ')}`);
        }
      } catch {
        // ignore malformed sizes JSON
      }
      continue;
    }

    // 4. If line contains pipe separators, filter out any commercial segments
    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      const safeParts = parts.filter(p => {
        if (/^type\s*client/i.test(p)) return false;
        if (/^nom\s*:/i.test(p)) return false;
        if (/budget/i.test(p)) return false;
        if (/prix/i.test(p)) return false;
        if (/tarif/i.test(p)) return false;
        if (/devis/i.test(p)) return false;
        if (/\b\d+[\s.,\-]*\d*\s*(MAD|DH|Dhs|درهم|EUR|€|\$|USD)\b/i.test(p)) return false;
        return true;
      });
      trimmed = safeParts.join(' | ').trim();
      if (!trimmed) continue;
    }

    // 5. Strip out any residual inline budget, price, or currency mentions
    trimmed = trimmed
      .replace(/\|\s*Budget\s*:\s*[^|]+/gi, '')
      .replace(/Budget\s*:\s*[^|\r\n]+/gi, '')
      .replace(/\bbudget\s*[:=\-]?\s*[^\r\n,;]+/gi, '')
      .replace(/\bprix\s*[:=\-]?\s*[^\r\n,;]+/gi, '')
      .replace(/\btarif\s*[:=\-]?\s*[^\r\n,;]+/gi, '')
      .replace(/\bdevis\s*[:=\-]?\s*[^\r\n,;]+/gi, '')
      .replace(/\b\d+[\s.,\-]*\d*\s*(MAD|DH|Dhs|درهم|EUR|€|\$|USD)\b/gi, '')
      .replace(/\|\s*\|\s*/g, ' | ')
      .trim();

    // Clean leading/trailing pipes or hyphens
    trimmed = trimmed.replace(/^[|\-\s]+/, '').replace(/[|\-\s]+$/, '').trim();

    if (trimmed && !/^détails:\s*$/i.test(trimmed) && !/^notes:\s*$/i.test(trimmed)) {
      cleaned.push(trimmed);
    }
  }

  return cleaned.join('\n').trim();
}

export function printFicheTechniqueModeliste(
  item: ModelItem,
  matchingFiche?: FicheTechnique | null,
  isAr: boolean = false,
  customMeasurements?: Record<string, Record<string, any>>
) {
  const company = loadCompanyProfile();
  const category = detectGarmentCategory(item.modele);
  const defaultMeas = GARMENT_DEFAULT_MEASUREMENTS[category] || GARMENT_DEFAULT_MEASUREMENTS.robe;
  const catMeasurements = customMeasurements || item.modelisteGradation || defaultMeas;

  const refCode = `TECH-MOD-${item.id.slice(0, 8).toUpperCase()}`;
  const printDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const photoUrl = item.photo || matchingFiche?.photo || '';
  const tissuSuggere =
    matchingFiche?.tissuRecommande ||
    item.lead?.tissuSuggere ||
    'Tissu standard confection (spécifié au dossier)';

  const conso = matchingFiche?.tissuConsommation || 1.85;
  const deadlineStr = item.deadlineDate ? item.deadlineDate : 'À convenir avec l’atelier';

  // Build measurement table rows
  const sizesList: SizingCategory[] = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const measurementRows = [
    { label: 'Tour de Poitrine (Buste)', key: 'poitrine', tol: '± 0.5' },
    { label: 'Tour de Taille', key: 'taille', tol: '± 0.5' },
    { label: 'Tour de Bassin / Hanches', key: 'bassin', tol: '± 0.5' },
    { label: 'Carrure Dos', key: 'carrure', tol: '± 0.3' },
    { label: 'Longueur Totale / Corps', key: 'longueurCorps', tol: '± 1.0' },
    { label: 'Longueur Manche', key: 'longueurManche', tol: '± 0.5' },
    { label: 'Tour de Bras / Emmanchure', key: 'tourBras', tol: '± 0.5' },
    { label: 'Largeur Bas / Ourlet', key: 'largeurBas', tol: '± 1.0' },
  ];

  // Purge any client commercial / budget / price data before generating printout
  const safePatronageNotes = sanitizeNotesForModeliste(item.patronageNotes);
  const safeClientNotes = sanitizeNotesForModeliste(item.clientNotes);
  const combinedSafeNotes = [safePatronageNotes, safeClientNotes].filter(Boolean).join('\n');
  const safeNotesDisplay =
    combinedSafeNotes ||
    'Spécifications de patronage et confection conformes au standard atelier. Respecter les tolérances dimensionnelles, l\'aplomb des pièces et le sens droit-fil. Confectionner un prototype avant gradation série.';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Dossier Technique Modéliste — ${item.modele}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.4;
      font-size: 11px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 12mm 10mm; }
    }
    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 16px;
    }
    .header-box {
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      background: #f8fafc;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .doc-badge {
      font-size: 10px;
      font-weight: 800;
      color: #4338ca;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .ref-badge {
      font-family: monospace;
      font-weight: 900;
      font-size: 12px;
      background: #0f172a;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .meta-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      background: #ffffff;
    }
    .meta-label {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-size: 12px;
      font-weight: 900;
      color: #0f172a;
    }
    .deadline-urgent {
      color: #b91c1c;
      font-weight: 900;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .photo-box {
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      height: 310px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #f1f5f9;
      position: relative;
    }
    .photo-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .photo-placeholder {
      font-weight: bold;
      color: #94a3b8;
      text-transform: uppercase;
      font-size: 10px;
    }
    .specs-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .section-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      background: #ffffff;
    }
    .section-title {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      color: #1e293b;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 3px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .spec-item {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    .spec-item:last-child {
      border-bottom: none;
    }
    .spec-name {
      font-weight: 700;
      color: #475569;
    }
    .spec-desc {
      font-weight: 900;
      color: #0f172a;
      text-align: right;
    }
    table.mesures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    table.mesures-table th, table.mesures-table td {
      border: 1px solid #0f172a;
      padding: 5px 6px;
      text-align: center;
      font-size: 10px;
    }
    table.mesures-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
    }
    table.mesures-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    table.mesures-table td.point-name {
      text-align: left;
      font-weight: 800;
      color: #1e293b;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
    }
    .signature-box {
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 8px 12px;
      min-height: 65px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .signature-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
    }
    .watermark-tech {
      font-size: 8px;
      color: #94a3b8;
      text-align: center;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .print-bar {
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 1000;
    }
    .print-btn {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Imprimer la Fiche Modéliste</button>
  </div>

  <div class="page">
    <div class="header-box">
      <div>
        <div class="brand-title">${company.name || 'BEYA ATELIER'}</div>
        <div class="doc-badge">Dossier Technique de Patronage & Coupe (Strictement Confidentiel)</div>
      </div>
      <div>
        <span class="ref-badge">${refCode}</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label">Modèle</div>
        <div class="meta-val">${item.modele}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Dossier / Client</div>
        <div class="meta-val">${item.client}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Date Limite de Remise</div>
        <div class="meta-val deadline-urgent">${deadlineStr}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Modéliste Assigné</div>
        <div class="meta-val">${item.modelisteName || 'Atelier'}</div>
      </div>
    </div>

    <div class="content-grid">
      <div class="photo-box">
        ${photoUrl ? `<img src="${photoUrl}" alt="${item.modele}" />` : `<div class="photo-placeholder">Croquis Technique Non Fourni</div>`}
      </div>

      <div class="specs-col">
        <div class="section-card">
          <div class="section-title">
            <span>Spécifications Matières & Fournitures (Sans Tarification)</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Matière Principale Recommandée</span>
            <span class="spec-desc">${tissuSuggere}</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Consommation Estimée au Mètre</span>
            <span class="spec-desc">${conso} m / pièce</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Sens de Coupe & Droit-Fil</span>
            <span class="spec-desc">Parallèle à la lisière, tricot/chaîne respecté</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Fournitures & Mercerie</span>
            <span class="spec-desc">Fil 100% polyester 120, thermocollant adapté</span>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>Spécifications de Montage & Patronage</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Valeurs de Couture Assemblage</span>
            <span class="spec-desc">1.0 cm standard</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Valeurs d'Ourlet Bas / Manches</span>
            <span class="spec-desc">2.5 cm repli simple / double piqûre</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Type de Points Machine</span>
            <span class="spec-desc">Point noué 301 (assemblage) / Surjet 4 fils 514</span>
          </div>
          <div class="spec-item">
            <span class="spec-name">Statut du Patronage</span>
            <span class="spec-desc">${item.workStatus === 'termine' ? 'Patron Validé & Livré' : 'En Cours de Gradation / Échantillon'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLEAU DE GRADATION ET MESURES -->
    <div class="section-card">
      <div class="section-title">
        <span>Tableau des Mesures Industrielles & Gradation (cm)</span>
        <span style="font-size: 8px; color: ${customMeasurements || item.modelisteGradation ? '#4f46e5; font-weight:bold;' : '#64748b;'}">
          ${customMeasurements || item.modelisteGradation ? '★ Validé & Ajusté par le Modéliste' : 'Tolérance standard conforme textile'}
        </span>
      </div>
      <table class="mesures-table">
        <thead>
          <tr>
            <th style="text-align: left; width: 32%;">Point de Mesure</th>
            <th style="width: 10%;">Tol.</th>
            ${sizesList.map(s => `<th>${s}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${measurementRows
            .map(row => {
              const cells = sizesList
                .map(sz => {
                  const val = catMeasurements[sz]?.[row.key as keyof typeof catMeasurements['S']] || '—';
                  return `<td><strong>${val}</strong></td>`;
                })
                .join('');
              return `<tr>
                <td class="point-name">${row.label}</td>
                <td style="color:#64748b; font-size:9px;">${row.tol}</td>
                ${cells}
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section-card" style="margin-top: 10px;">
      <div class="section-title">
        <span>Remarques Techniques & Instructions Atelier</span>
      </div>
      <p style="font-size: 10px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${safeNotesDisplay}</p>
    </div>

    <div class="signatures-grid">
      <div class="signature-box">
        <div class="signature-title">Visa & Validation Modéliste</div>
        <div style="font-size: 9px; color: #64748b;">Date & Signature: __________________</div>
      </div>
      <div class="signature-box">
        <div class="signature-title">Visa Contrôle & Conformité Atelier</div>
        <div style="font-size: 9px; color: #64748b;">Date & Signature: __________________</div>
      </div>
    </div>

    <div class="watermark-tech">
      Dossier Technique Généré le ${printDate} — Système BEYA TECH LAB Confection
    </div>
  </div>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }
}

export default function FicheTechniqueModelisteModal({
  isOpen,
  onClose,
  item,
  matchingFiche,
  onSaveTechnicalNotes,
  isAr = false
}: FicheTechniqueModelisteModalProps) {
  const [activeTab, setActiveTab] = useState<'visuel' | 'mesures' | 'confection'>('visuel');
  const [notes, setNotes] = useState<string>(item?.patronageNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedNotesSuccess, setSavedNotesSuccess] = useState(false);

  const category = useMemo(() => detectGarmentCategory(item?.modele), [item?.modele]);
  const catMeasurements = useMemo(
    () => GARMENT_DEFAULT_MEASUREMENTS[category] || GARMENT_DEFAULT_MEASUREMENTS.robe,
    [category]
  );
  const safeClientNotes = useMemo(() => sanitizeNotesForModeliste(item?.clientNotes), [item?.clientNotes]);

  if (!isOpen || !item) return null;

  const refCode = `TECH-MOD-${item.id.slice(0, 8).toUpperCase()}`;
  const photoUrl = item.photo || matchingFiche?.photo || '';
  const tissuSuggere =
    matchingFiche?.tissuRecommande ||
    item.lead?.tissuSuggere ||
    (isAr ? 'قماش مطاطي / منسوج محدد في بطاقة الطلب' : 'Matière textile spécifiée au dossier');
  const conso = matchingFiche?.tissuConsommation || 1.85;

  const sizesList: SizingCategory[] = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const measurementRows = [
    { label: isAr ? 'دورة الصدر (Buste)' : 'Tour de Poitrine (Buste)', key: 'poitrine', tol: '± 0.5' },
    { label: isAr ? 'دورة الحزام (Taille)' : 'Tour de Taille', key: 'taille', tol: '± 0.5' },
    { label: isAr ? 'دورة الحوض (Hanches)' : 'Tour de Bassin / Hanches', key: 'bassin', tol: '± 0.5' },
    { label: isAr ? 'عرض الكتفين (Carrure)' : 'Carrure Dos', key: 'carrure', tol: '± 0.3' },
    { label: isAr ? 'الطول الإجمالي (Longueur)' : 'Longueur Totale / Corps', key: 'longueurCorps', tol: '± 1.0' },
    { label: isAr ? 'طول الكم (Manche)' : 'Longueur Manche', key: 'longueurManche', tol: '± 0.5' },
    { label: isAr ? 'دورة الذراع (Emmanchure)' : 'Tour de Bras / Emmanchure', key: 'tourBras', tol: '± 0.5' },
    { label: isAr ? 'عرض الأسفل / الذيل (Ourlet)' : 'Largeur Bas / Ourlet', key: 'largeurBas', tol: '± 1.0' },
  ];

  const handleSaveNotes = async () => {
    if (!onSaveTechnicalNotes || !item.lead) return;
    setSavingNotes(true);
    try {
      await onSaveTechnicalNotes(item.lead.id, notes);
      setSavedNotesSuccess(true);
      setTimeout(() => setSavedNotesSuccess(false), 2500);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[320] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  {isAr ? 'البطاقة التقنية للموديليست (Pro)' : 'Fiche Technique Modéliste (Pro)'}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-black">
                  {refCode}
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">{item.modele}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printFicheTechniqueModeliste(item, matchingFiche)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
              title={isAr ? 'طباعة / تصدير PDF' : 'Imprimer / Exporter PDF'}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? 'طباعة PDF' : 'Imprimer'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('visuel')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'visuel'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'المواصفات والثوب' : 'Matières & Visuel'}</span>
          </button>
          <button
            onClick={() => setActiveTab('mesures')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mesures'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{isAr ? 'جدول القياسات والتدريج' : 'Mesures & Gradation'}</span>
          </button>
          <button
            onClick={() => setActiveTab('confection')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'confection'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAr ? 'تعليمات الخياطة وملاحظاتي' : 'Montage & Notes'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Top Quick Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                {isAr ? 'الزبون / الملف' : 'Client / Dossier'}
              </span>
              <span className="text-sm font-black text-slate-900">{item.client}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                {isAr ? 'الكمية المطلوبة' : 'Quantité totale'}
              </span>
              <span className="text-sm font-black text-slate-900">
                {item.quantity || 1} {isAr ? 'قطعة' : 'pièces'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                {isAr ? 'تاريخ التسليم المحدد' : 'Date Limite de Remise'}
              </span>
              <span className="text-sm font-black text-rose-600">
                {item.deadlineDate || (isAr ? 'غير محدد' : 'À planifier')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                {isAr ? 'الحالة' : 'Statut'}
              </span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                  item.workStatus === 'termine'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {item.workStatus === 'termine'
                  ? isAr ? 'منجز ومسلّم' : 'Terminé & Livré'
                  : isAr ? 'قيد الإنجاز' : 'En cours'}
              </span>
            </div>
          </div>

          {/* TAB 1: VISUEL & MATIÈRES */}
          {activeTab === 'visuel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Photo Box */}
              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 aspect-square max-h-80 flex items-center justify-center relative group">
                {photoUrl ? (
                  <img src={photoUrl} alt={item.modele} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-slate-400">
                    <Scissors className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <span className="text-xs font-bold">{isAr ? 'لا توجد صورة' : 'Pas de photo'}</span>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-xs uppercase tracking-wider border-b border-indigo-200 pb-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>{isAr ? 'مواصفات الثوب والمادة الأولية' : 'Matière Première & Consommation'}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">{isAr ? 'نوع الثوب المقترح:' : 'Tissu suggéré:'}</span>
                      <span className="font-black text-slate-900 text-right">{tissuSuggere}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">{isAr ? 'المتر المقدر للقطعة:' : 'Consommation métrage:'}</span>
                      <span className="font-black text-indigo-700">{conso} m / pièce</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">{isAr ? 'اتجاه القص (Droit-fil):' : 'Sens Droit-Fil:'}</span>
                      <span className="font-black text-slate-800">
                        {isAr ? 'موازٍ لحاشية الثوب' : 'Parallèle lisière'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <span className="font-black text-slate-900 uppercase block tracking-wider text-[11px]">
                    {isAr ? 'اللوازم والخردوات (Mercerie & Fournitures)' : 'Fournitures & Accessoires'}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 font-semibold">
                    <li>{isAr ? 'خيوط بوليستر 100% تطابق لون الثوب' : 'Fils 100% polyester ton sur ton'}</li>
                    <li>{isAr ? 'فيزلين / لاصق حراري مناسب للوزن' : 'Thermocollant tissé ou non-tissé adapté'}</li>
                    <li>{isAr ? 'سحاب / أزرار حسب نموذج التصميم' : 'Zip / Boutons selon fiche de style'}</li>
                    <li>{isAr ? 'ملصق المقاس وتركيبة الغسيل' : 'Étiquette de taille & composition'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLEAU DE MESURES */}
          {activeTab === 'mesures' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {isAr ? 'جدول القياسات الصناعية والتدريج (Gradation)' : 'Tableau de Mesures & Gradation Industrielle'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isAr
                      ? 'القياسات بالسنتيمتر (cm) للموديل من المقاس XS إلى 2XL مع نسبة السماح المعيارية.'
                      : 'Valeurs standard en cm du XS au 2XL avec tolérance industrielle.'}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left font-black">{isAr ? 'نقطة القياس' : 'Point de Mesure'}</th>
                      <th className="py-3 px-2 text-center font-bold text-slate-300">Tol.</th>
                      {sizesList.map(sz => (
                        <th key={sz} className="py-3 px-3 text-center font-black">
                          {sz}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {measurementRows.map((row, idx) => (
                      <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{row.label}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">{row.tol}</td>
                        {sizesList.map(sz => {
                          const val = catMeasurements[sz]?.[row.key as keyof typeof catMeasurements['S']] || '—';
                          return (
                            <td key={sz} className="py-2.5 px-3 text-center font-black text-slate-800">
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONFECTION & NOTES */}
          {activeTab === 'confection' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-black text-slate-900 uppercase block tracking-wider">
                    {isAr ? 'معايير الخياطة (Assemblage)' : 'Assemblage & Piqûres'}
                  </span>
                  <div className="space-y-1.5 text-slate-700 font-semibold">
                    <p>• {isAr ? 'قيمة الخياطة القياسية: 1.0 سم' : 'Valeur de couture standard : 1.0 cm'}</p>
                    <p>• {isAr ? 'عطفة الأسفل / الكفة: 2.5 سم' : 'Ourlet bas : 2.5 cm'}</p>
                    <p>• {isAr ? 'غرزة القفل (301) + سورفيلاج 4 خيوط' : 'Point noué 301 + Surjet 4 fils (514)'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-black text-slate-900 uppercase block tracking-wider">
                    {isAr ? 'تنبيهات الباترون (Patronage)' : 'Contrôle Patronage'}
                  </span>
                  <div className="space-y-1.5 text-slate-700 font-semibold">
                    <p>• {isAr ? 'التأكد من علامات التطابق والكرانات' : 'Vérifier les crans de montage & pinces'}</p>
                    <p>• {isAr ? 'تطابق خط الجنب والكتف' : 'Vérification aplomb côtés et emmanchures'}</p>
                    <p>• {isAr ? 'إجراء عينة أولية قبل الإنتاج' : 'Confectionner prototype avant gradation série'}</p>
                  </div>
                </div>
              </div>

              {/* Technical instructions from order (sanitized of prices / budget) */}
              {safeClientNotes && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5 text-xs">
                  <span className="font-black text-indigo-900 uppercase block tracking-wider">
                    {isAr ? 'ملاحظات وتوجيهات الطلب (خالية من الأسعار والميزانيات)' : 'Instructions & Spécifications du Dossier'}
                  </span>
                  <p className="text-slate-700 font-semibold whitespace-pre-wrap">{safeClientNotes}</p>
                </div>
              )}

              {/* Modéliste's Own Technical Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  {isAr ? 'ملاحظات وتعديلات الموديليست على الموديل' : 'Notes Techniques & Ajustements du Modéliste'}
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? 'سجل هنا أي تعديلات تقنية، استهلاك أمتار دقيق، أو ملاحظات للنموذج...'
                      : 'Notez ici les ajustements apportés au patron, spécificités d’aisance...'
                  }
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-xs font-bold leading-relaxed resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                  >
                    {savedNotesSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                    <span>
                      {savedNotesSuccess
                        ? isAr ? 'تم الحفظ!' : 'Enregistré !'
                        : isAr ? 'حفظ ملاحظاتي التقنية' : 'Enregistrer mes notes'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
}
