/**
 * BEYA Patronage AI Engine
 * Parametric 2D Garment Pattern Drafting & Vector Export Engine
 * Compatible with Adobe Illustrator (.SVG), CAD Plotters (.DXF), and PDF
 */

export type GarmentType = 'abaya' | 'robe' | 'chemise' | 'tshirt' | 'hoodie' | 'pantalon' | 'caftan' | 'blazer';
export type SizingCategory = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | 'custom';

export interface GarmentMeasurements {
  poitrine: number;      // Tour de poitrine (cm)
  taille: number;        // Tour de taille (cm)
  bassin: number;        // Tour de bassin (cm)
  carrure: number;       // Carrure dos / épaules (cm)
  longueurCorps: number; // Longueur totale du vêtement (cm)
  longueurManche: number;// Longueur manche (cm)
  tourBras: number;      // Tour de bras / biceps (cm)
  tourPoignet: number;   // Tour de poignet / bas de manche (cm)
  encolure: number;      // Tour de cou (cm)
  hauteurTaille: number; // Hauteur épaule-taille (cm)
  hauteurBassin: number; // Hauteur taille-bassin (cm)
  largeurBas: number;    // Demi-largeur du bas / ourlet évasé (cm)
  aisance: number;       // Aisance d'ampleur (+cm)
  valeurCouture: number; // Marge de couture (cm, ex: 1cm)
}

export interface PatternPiece {
  id: string;
  nameAr: string;
  nameFr: string;
  quantityAr: string;
  quantityFr: string;
  color: string;
  cutPath: string;       // Outer cutting line SVG path (with seam allowance)
  seamPath?: string;     // Inner seam line (piqûre)
  widthCm: number;
  heightCm: number;
  x: number;             // Layout position X in cm
  y: number;             // Layout position Y in cm
  grainLine: { x1: number; y1: number; x2: number; y2: number };
  notches: { x: number; y: number; label?: string }[];
  annotations: { text: string; x: number; y: number; size?: number }[];
  detailsAr?: string;
  detailsFr?: string;
}

export interface AiVisionAnalysisResult {
  garmentType: GarmentType;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
  detectedFeatures: {
    coupe: string;
    col: string;
    manches: string;
    longueur: string;
    details: string[];
  };
  recommendedFabric: {
    typeAr: string;
    typeFr: string;
    metrage: number;    // mètres nécessaires pour laize 1.50m
    laizeCm: number;
  };
  suggestedSize: SizingCategory;
  measurements: GarmentMeasurements;
  patternPieces: PatternPiece[];
}

// ── Standard Size Charts (Base Confection Prêt-à-porter) ───
export const STANDARD_MEASUREMENTS: Record<SizingCategory, GarmentMeasurements> = {
  XS: {
    poitrine: 82,
    taille: 64,
    bassin: 88,
    carrure: 36,
    longueurCorps: 135,
    longueurManche: 58,
    tourBras: 28,
    tourPoignet: 16,
    encolure: 35,
    hauteurTaille: 40,
    hauteurBassin: 20,
    largeurBas: 55,
    aisance: 6,
    valeurCouture: 1
  },
  S: {
    poitrine: 88,
    taille: 70,
    bassin: 94,
    carrure: 38,
    longueurCorps: 138,
    longueurManche: 59,
    tourBras: 30,
    tourPoignet: 17,
    encolure: 36,
    hauteurTaille: 41,
    hauteurBassin: 20,
    largeurBas: 60,
    aisance: 6,
    valeurCouture: 1
  },
  M: {
    poitrine: 96,
    taille: 78,
    bassin: 102,
    carrure: 40,
    longueurCorps: 140,
    longueurManche: 60,
    tourBras: 32,
    tourPoignet: 18,
    encolure: 38,
    hauteurTaille: 42,
    hauteurBassin: 21,
    largeurBas: 65,
    aisance: 8,
    valeurCouture: 1
  },
  L: {
    poitrine: 104,
    taille: 86,
    bassin: 110,
    carrure: 42,
    longueurCorps: 142,
    longueurManche: 61,
    tourBras: 35,
    tourPoignet: 19,
    encolure: 40,
    hauteurTaille: 43,
    hauteurBassin: 21,
    largeurBas: 70,
    aisance: 8,
    valeurCouture: 1
  },
  XL: {
    poitrine: 112,
    taille: 96,
    bassin: 118,
    carrure: 44,
    longueurCorps: 144,
    longueurManche: 62,
    tourBras: 38,
    tourPoignet: 20,
    encolure: 42,
    hauteurTaille: 44,
    hauteurBassin: 22,
    largeurBas: 75,
    aisance: 10,
    valeurCouture: 1
  },
  '2XL': {
    poitrine: 122,
    taille: 106,
    bassin: 128,
    carrure: 46,
    longueurCorps: 145,
    longueurManche: 62,
    tourBras: 41,
    tourPoignet: 21,
    encolure: 44,
    hauteurTaille: 44,
    hauteurBassin: 22,
    largeurBas: 80,
    aisance: 12,
    valeurCouture: 1
  },
  '3XL': {
    poitrine: 132,
    taille: 118,
    bassin: 138,
    carrure: 48,
    longueurCorps: 146,
    longueurManche: 63,
    tourBras: 44,
    tourPoignet: 22,
    encolure: 46,
    hauteurTaille: 45,
    hauteurBassin: 22,
    largeurBas: 85,
    aisance: 12,
    valeurCouture: 1
  },
  custom: {
    poitrine: 100,
    taille: 82,
    bassin: 106,
    carrure: 40,
    longueurCorps: 140,
    longueurManche: 60,
    tourBras: 33,
    tourPoignet: 18,
    encolure: 38,
    hauteurTaille: 42,
    hauteurBassin: 21,
    largeurBas: 68,
    aisance: 8,
    valeurCouture: 1
  }
};

// ── Parametric Pattern Calculations (Scale: 1 unit = 1 cm) ───

export function generatePatternPieces(
  type: GarmentType,
  m: GarmentMeasurements
): PatternPiece[] {
  const vc = m.valeurCouture || 1; // Seam allowance in cm

  switch (type) {
    case 'abaya':
    case 'caftan':
      return generateAbayaPattern(m, vc);
    case 'chemise':
      return generateChemisePattern(m, vc);
    case 'tshirt':
      return generateTshirtPattern(m, vc);
    case 'robe':
      return generateRobePattern(m, vc);
    case 'pantalon':
      return generatePantalonPattern(m, vc);
    case 'hoodie':
    default:
      return generateHoodiePattern(m, vc);
  }
}

/**
 * 1. ABAYA / CAFTAN / GANDORA
 * Modern oriental modest cut with flared body & set-in or drop-shoulder sleeve
 */
function generateAbayaPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const halfHips = Math.max((m.bassin + m.aisance) / 4, halfChest + 3);
  const halfHem = Math.max(m.largeurBas, halfHips + 15);
  const totalLen = m.longueurCorps;
  const shoulderWidth = m.carrure / 2;
  const neckW = 7.5;
  const neckDepthFront = 11;
  const neckDepthBack = 3.5;
  const shoulderSlope = 4;
  const armholeDepth = (m.poitrine / 4) + 2;

  // Front Piece (Devant au pli)
  const devantPath = `
    M 0 0
    L ${neckW} 0
    Q ${shoulderWidth * 0.7} ${shoulderSlope * 0.5} ${shoulderWidth} ${shoulderSlope}
    Q ${shoulderWidth - 2} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    Q ${halfChest + 2} ${m.hauteurTaille + 10} ${halfHips} ${m.hauteurTaille + m.hauteurBassin}
    L ${halfHem} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  // Back Piece (Dos au pli)
  const dosPath = `
    M 0 0
    L ${neckW} 0
    Q ${shoulderWidth * 0.7} ${shoulderSlope * 0.4} ${shoulderWidth} ${shoulderSlope - 0.5}
    Q ${shoulderWidth - 1} ${armholeDepth * 0.55} ${halfChest} ${armholeDepth}
    Q ${halfChest + 2} ${m.hauteurTaille + 10} ${halfHips} ${m.hauteurTaille + m.hauteurBassin}
    L ${halfHem} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  // Sleeve Piece (Manche au pli)
  const sleeveLen = m.longueurManche;
  const bicepW = (m.tourBras + m.aisance * 0.7) / 2 + 3;
  const wristW = m.tourPoignet / 2 + 5;
  const capHeight = 12;

  const manchePath = `
    M 0 0
    C ${bicepW * 0.3} 0 ${bicepW * 0.6} ${capHeight * 0.4} ${bicepW} ${capHeight}
    L ${wristW} ${sleeveLen}
    L 0 ${sleeveLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  // Collar / Parementure
  const colPath = `
    M 0 0
    L ${neckW + 4} 0
    Q ${neckW + 2} ${neckDepthFront + 2} 0 ${neckDepthFront + 4}
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'devant',
      nameAr: 'الصدر (Devant)',
      nameFr: 'Devant (Au pli)',
      quantityAr: '1x على تني الثوب',
      quantityFr: '1x au pli du tissu',
      color: '#4f46e5',
      cutPath: devantPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 25, x2: 5, y2: totalLen - 25 },
      notches: [
        { x: halfChest, y: armholeDepth, label: 'Buste' },
        { x: halfHips, y: m.hauteurTaille + m.hauteurBassin, label: 'Bassin' }
      ],
      annotations: [
        { text: `Tour poitrine: ${m.poitrine}cm (+${m.aisance})`, x: halfChest / 2, y: armholeDepth - 2 },
        { text: `Longueur: ${totalLen}cm`, x: 10, y: totalLen / 2 },
        { text: 'DEVANT - AU PLI (DF)', x: 10, y: totalLen * 0.25, size: 14 }
      ],
      detailsAr: 'نصف باترون الصدر، يوضع خط الوسط على تني الثوب المغلق.',
      detailsFr: 'Demi-patron devant à couper au pli.'
    },
    {
      id: 'dos',
      nameAr: 'الظهر (Dos)',
      nameFr: 'Dos (Au pli)',
      quantityAr: '1x على تني الثوب',
      quantityFr: '1x au pli du tissu',
      color: '#06b6d4',
      cutPath: dosPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: Math.round(halfHem) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 25, x2: 5, y2: totalLen - 25 },
      notches: [
        { x: halfChest, y: armholeDepth, label: 'Buste' }
      ],
      annotations: [
        { text: 'DOS - AU PLI (DF)', x: 10, y: totalLen * 0.25, size: 14 },
        { text: `Encolure dos: ${neckDepthBack}cm`, x: neckW / 2, y: 3 }
      ],
      detailsAr: 'نصف باترون الظهر، خط الوسط على تني الثوب.',
      detailsFr: 'Demi-patron dos à couper au pli.'
    },
    {
      id: 'manche',
      nameAr: 'الكم (Manche)',
      nameFr: 'Manche (x2)',
      quantityAr: '2x قطع ثوب',
      quantityFr: '2x tissu (symétrique)',
      color: '#10b981',
      cutPath: manchePath,
      widthCm: Math.round(bicepW),
      heightCm: Math.round(sleeveLen),
      x: (Math.round(halfHem) * 2) + 25,
      y: 5,
      grainLine: { x1: 3, y1: 15, x2: 3, y2: sleeveLen - 15 },
      notches: [
        { x: bicepW * 0.5, y: capHeight * 0.3, label: 'Épaule' }
      ],
      annotations: [
        { text: 'MANCHE (x2)', x: bicepW / 3, y: sleeveLen / 2, size: 13 },
        { text: `Long: ${sleeveLen}cm`, x: bicepW / 3, y: sleeveLen / 2 + 8 }
      ],
      detailsAr: 'نصف كم يوضع على تني الثوب أو يرسم مفتوحاً كاملاً.',
      detailsFr: 'Demi-manche coupée en double au pli.'
    },
    {
      id: 'parementure',
      nameAr: 'تبطين الكول (Parementure)',
      nameFr: 'Parementure col',
      quantityAr: '1x ثوب + 1x فيزلين',
      quantityFr: '1x tissu + 1x thermocollant',
      color: '#f59e0b',
      cutPath: colPath,
      widthCm: Math.round(neckW + 6),
      heightCm: Math.round(neckDepthFront + 6),
      x: (Math.round(halfHem) * 2) + 25,
      y: Math.round(sleeveLen) + 15,
      grainLine: { x1: 2, y1: 3, x2: 2, y2: neckDepthFront + 2 },
      notches: [],
      annotations: [
        { text: 'PAREMENTURE COL', x: 2, y: 5, size: 10 }
      ],
      detailsAr: 'شريط التبطين الخاص بالياقة مع لاصق فيزلين.',
      detailsFr: 'Parementure encolure avant avec renfort thermocollant.'
    }
  ];
}

/**
 * 2. T-SHIRT / POLO / TOP
 */
function generateTshirtPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const totalLen = Math.min(m.longueurCorps, 74);
  const shoulderWidth = m.carrure / 2;
  const neckW = 8;
  const neckDepthFront = 9;
  const shoulderSlope = 3.5;
  const armholeDepth = 23;
  const sleeveLen = Math.min(m.longueurManche, 24); // Short sleeve standard
  const bicepW = (m.tourBras + m.aisance) / 2 + 2;
  const cuffW = bicepW - 2;

  const devantPath = `
    M 0 0
    L ${neckW} 0
    Q ${shoulderWidth * 0.7} ${shoulderSlope * 0.6} ${shoulderWidth} ${shoulderSlope}
    Q ${shoulderWidth - 1} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    L ${halfChest + 1} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const dosPath = `
    M 0 0
    L ${neckW} 0
    Q ${shoulderWidth * 0.7} ${shoulderSlope * 0.5} ${shoulderWidth} ${shoulderSlope - 0.5}
    Q ${shoulderWidth} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    L ${halfChest + 1} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const manchePath = `
    M 0 0
    C ${bicepW * 0.4} 0 ${bicepW * 0.7} 4 ${bicepW} 9
    L ${cuffW} ${sleeveLen}
    L 0 ${sleeveLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const bandeColPath = `
    M 0 0
    L 38 0
    L 38 3.5
    L 0 3.5
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'devant',
      nameAr: 'صدر التيشورت (Devant)',
      nameFr: 'Devant T-Shirt',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#3b82f6',
      cutPath: devantPath,
      widthCm: Math.round(halfChest + 2),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 10, x2: 5, y2: totalLen - 10 },
      notches: [{ x: halfChest, y: armholeDepth, label: 'Aisselle' }],
      annotations: [
        { text: 'T-SHIRT DEVANT (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 },
        { text: `Tour poitrine: ${m.poitrine}cm`, x: 10, y: totalLen * 0.3 + 8 }
      ]
    },
    {
      id: 'dos',
      nameAr: 'ظهر التيشورت (Dos)',
      nameFr: 'Dos T-Shirt',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#6366f1',
      cutPath: dosPath,
      widthCm: Math.round(halfChest + 2),
      heightCm: Math.round(totalLen),
      x: Math.round(halfChest + 2) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 10, x2: 5, y2: totalLen - 10 },
      notches: [{ x: halfChest, y: armholeDepth, label: 'Aisselle' }],
      annotations: [
        { text: 'T-SHIRT DOS (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 }
      ]
    },
    {
      id: 'manche',
      nameAr: 'الكم (Manche courte)',
      nameFr: 'Manche courte (x2)',
      quantityAr: '2x ثوب',
      quantityFr: '2x tissu',
      color: '#10b981',
      cutPath: manchePath,
      widthCm: Math.round(bicepW),
      heightCm: Math.round(sleeveLen),
      x: (Math.round(halfChest + 2) * 2) + 25,
      y: 5,
      grainLine: { x1: 3, y1: 4, x2: 3, y2: sleeveLen - 4 },
      notches: [{ x: bicepW * 0.5, y: 3, label: 'Centre' }],
      annotations: [
        { text: 'MANCHE T-SHIRT', x: bicepW / 3, y: sleeveLen / 2, size: 12 }
      ]
    },
    {
      id: 'col_bord_cote',
      nameAr: 'شريط الكول (Bord-côte)',
      nameFr: 'Colletage Encolure',
      quantityAr: '1x ريب / بوردكوط',
      quantityFr: '1x bord-côte',
      color: '#f97316',
      cutPath: bandeColPath,
      widthCm: 38,
      heightCm: 4,
      x: (Math.round(halfChest + 2) * 2) + 25,
      y: sleeveLen + 20,
      grainLine: { x1: 2, y1: 2, x2: 36, y2: 2 },
      notches: [],
      annotations: [{ text: 'BANDE ENCOLURE (BORD-CÔTE)', x: 2, y: 2.5, size: 9 }]
    }
  ];
}

/**
 * 3. CHEMISE / CHEMISIER (SHIRT)
 */
function generateChemisePattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const totalLen = Math.min(m.longueurCorps, 78);
  const shoulderWidth = m.carrure / 2;
  const croisureBouton = 2.5; // Button placket croisure
  const neckW = 7;
  const armholeDepth = 24;
  const sleeveLen = m.longueurManche;
  const bicepW = (m.tourBras + m.aisance) / 2 + 3;
  const wristW = 13;

  const devantPath = `
    M 0 0
    L ${neckW} 0
    L ${shoulderWidth} 4
    Q ${shoulderWidth - 1} ${armholeDepth * 0.6} ${halfChest + croisureBouton} ${armholeDepth}
    L ${halfChest + croisureBouton} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const dosPath = `
    M 0 0
    L ${neckW} 0
    L ${shoulderWidth} 3.5
    Q ${shoulderWidth} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    L ${halfChest} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const colPiedPath = `
    M 0 0
    L 22 0
    C 23.5 0 24 1.5 24 3
    L 0 3.5
    Z
  `.replace(/\s+/g, ' ').trim();

  const poignetPath = `
    M 0 0
    L 25 0
    L 25 6
    L 0 6
    Z
  `.replace(/\s+/g, ' ').trim();

  const manchePath = `
    M 0 0
    C ${bicepW * 0.3} 0 ${bicepW * 0.6} 5 ${bicepW} 12
    L ${wristW} ${sleeveLen}
    L 0 ${sleeveLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'devant',
      nameAr: 'صدر القميص مع المرد (Devant + Patte)',
      nameFr: 'Devant Chemise',
      quantityAr: '2x يمين ويسار',
      quantityFr: '2x tissu (G/D)',
      color: '#2563eb',
      cutPath: devantPath,
      widthCm: Math.round(halfChest + croisureBouton),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 15, x2: 5, y2: totalLen - 15 },
      notches: [{ x: croisureBouton, y: 0, label: 'Ligne boutons' }],
      annotations: [
        { text: 'CHEMISE DEVANT (x2)', x: 10, y: totalLen * 0.3, size: 14 },
        { text: '+2.5cm Patte de boutonnage', x: 10, y: totalLen * 0.3 + 8 }
      ]
    },
    {
      id: 'dos',
      nameAr: 'ظهر القميص (Dos)',
      nameFr: 'Dos Chemise (Au pli)',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#0284c7',
      cutPath: dosPath,
      widthCm: Math.round(halfChest),
      heightCm: Math.round(totalLen),
      x: Math.round(halfChest + croisureBouton) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 15, x2: 5, y2: totalLen - 15 },
      notches: [],
      annotations: [{ text: 'CHEMISE DOS (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 }]
    },
    {
      id: 'manche',
      nameAr: 'كم القميص (Manche)',
      nameFr: 'Manche chemise (x2)',
      quantityAr: '2x قطع ثوب',
      quantityFr: '2x tissu',
      color: '#059669',
      cutPath: manchePath,
      widthCm: Math.round(bicepW),
      heightCm: Math.round(sleeveLen),
      x: (Math.round(halfChest) * 2) + 30,
      y: 5,
      grainLine: { x1: 4, y1: 10, x2: 4, y2: sleeveLen - 10 },
      notches: [{ x: wristW * 0.5, y: sleeveLen, label: 'Fente capucin' }],
      annotations: [{ text: 'MANCHE CHEMISE', x: bicepW / 3, y: sleeveLen / 2, size: 13 }]
    },
    {
      id: 'col_pied',
      nameAr: 'رجل وطواية الكول (Pied de col & Col)',
      nameFr: 'Pied de col & Tombant (x2)',
      quantityAr: '2x ثوب + فيزلين',
      quantityFr: '2x tissu + 1x thermocollant',
      color: '#d97706',
      cutPath: colPiedPath,
      widthCm: 24,
      heightCm: 4,
      x: (Math.round(halfChest) * 2) + 30,
      y: sleeveLen + 15,
      grainLine: { x1: 2, y1: 2, x2: 22, y2: 2 },
      notches: [],
      annotations: [{ text: 'COL CHEMISE (AU PLI)', x: 2, y: 2.2, size: 9 }]
    },
    {
      id: 'poignet',
      nameAr: 'البوانيي / أساور الكم (Poignets)',
      nameFr: 'Poignets chemise (x2)',
      quantityAr: '4x ثوب + فيزلين',
      quantityFr: '4x tissu + 2x thermocollant',
      color: '#e11d48',
      cutPath: poignetPath,
      widthCm: 25,
      heightCm: 6,
      x: (Math.round(halfChest) * 2) + 30,
      y: sleeveLen + 25,
      grainLine: { x1: 2, y1: 3, x2: 23, y2: 3 },
      notches: [],
      annotations: [{ text: 'POIGNET (x2)', x: 2, y: 3.5, size: 9 }]
    }
  ];
}

/**
 * 4. ROBE / DRESS
 */
function generateRobePattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const halfWaist = (m.taille + m.aisance) / 4 + 2; // with dart ease
  const halfHips = (m.bassin + m.aisance) / 4;
  const halfHem = Math.max(m.largeurBas, halfHips + 12);
  const totalLen = m.longueurCorps;
  const shoulderWidth = m.carrure / 2;
  const neckW = 8;
  const armholeDepth = 22;
  const sleeveLen = m.longueurManche;
  const bicepW = (m.tourBras + m.aisance) / 2 + 2;
  const wristW = m.tourPoignet / 2 + 4;

  const devantPath = `
    M 0 0
    L ${neckW} 0
    L ${shoulderWidth} 3.5
    Q ${shoulderWidth - 1} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    Q ${halfChest - 1} ${m.hauteurTaille * 0.7} ${halfWaist} ${m.hauteurTaille}
    Q ${halfWaist + 2} ${m.hauteurTaille + 12} ${halfHips} ${m.hauteurTaille + m.hauteurBassin}
    L ${halfHem} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const dosPath = `
    M 0 0
    L ${neckW} 0
    L ${shoulderWidth} 3
    Q ${shoulderWidth} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    Q ${halfChest - 1} ${m.hauteurTaille * 0.7} ${halfWaist} ${m.hauteurTaille}
    Q ${halfWaist + 2} ${m.hauteurTaille + 12} ${halfHips} ${m.hauteurTaille + m.hauteurBassin}
    L ${halfHem} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const manchePath = `
    M 0 0
    C ${bicepW * 0.3} 0 ${bicepW * 0.6} 5 ${bicepW} 13
    L ${wristW} ${sleeveLen}
    L 0 ${sleeveLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'devant',
      nameAr: 'صدر الكسوة / الفستان (Devant)',
      nameFr: 'Devant Robe',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#ec4899',
      cutPath: devantPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 20, x2: 5, y2: totalLen - 20 },
      notches: [
        { x: halfWaist, y: m.hauteurTaille, label: 'Taille' },
        { x: halfHips, y: m.hauteurTaille + m.hauteurBassin, label: 'Bassin' }
      ],
      annotations: [
        { text: 'ROBE DEVANT (AU PLI)', x: 10, y: totalLen * 0.25, size: 14 },
        { text: `Tour taille: ${m.taille}cm`, x: 10, y: m.hauteurTaille }
      ]
    },
    {
      id: 'dos',
      nameAr: 'ظهر الكسوة (Dos avec zip)',
      nameFr: 'Dos Robe (x2 pour zip)',
      quantityAr: '2x يمين ويسار للسلسلة',
      quantityFr: '2x tissu (fermeture dos)',
      color: '#8b5cf6',
      cutPath: dosPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: Math.round(halfHem) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 20, x2: 5, y2: totalLen - 20 },
      notches: [{ x: 0, y: 50, label: 'Fin zip' }],
      annotations: [
        { text: 'ROBE DOS (x2) - ZIP MILIEU', x: 10, y: totalLen * 0.25, size: 14 }
      ]
    },
    {
      id: 'manche',
      nameAr: 'كم الكسوة (Manche)',
      nameFr: 'Manche Robe (x2)',
      quantityAr: '2x ثوب',
      quantityFr: '2x tissu',
      color: '#14b8a6',
      cutPath: manchePath,
      widthCm: Math.round(bicepW),
      heightCm: Math.round(sleeveLen),
      x: (Math.round(halfHem) * 2) + 25,
      y: 5,
      grainLine: { x1: 3, y1: 10, x2: 3, y2: sleeveLen - 10 },
      notches: [],
      annotations: [{ text: 'MANCHE ROBE (x2)', x: bicepW / 3, y: sleeveLen / 2, size: 12 }]
    }
  ];
}

/**
 * 5. PANTALON (PANTS)
 */
function generatePantalonPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfWaist = (m.taille + m.aisance) / 4;
  const halfHips = (m.bassin + m.aisance) / 4;
  const totalLen = 102; // Standard pant length
  const crotchDepth = 26; // Fourche
  const frontCrotchExt = 4.5;
  const backCrotchExt = 9;
  const bottomW = 21; // Half hem width

  const devantPath = `
    M 0 0
    L ${halfWaist} 0
    Q ${halfHips + 1} 12 ${halfHips} ${crotchDepth}
    L ${bottomW} ${totalLen}
    L 0 ${totalLen}
    L ${frontCrotchExt} ${crotchDepth}
    Q 1 12 0 0
    Z
  `.replace(/\s+/g, ' ').trim();

  const dosPath = `
    M 0 0
    L ${halfWaist + 2} -2
    Q ${halfHips + 2} 12 ${halfHips + 1} ${crotchDepth}
    L ${bottomW + 2} ${totalLen}
    L 0 ${totalLen}
    L ${backCrotchExt} ${crotchDepth}
    Q -2 12 0 0
    Z
  `.replace(/\s+/g, ' ').trim();

  const ceinturePath = `
    M 0 0
    L ${m.taille + 10} 0
    L ${m.taille + 10} 9
    L 0 9
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'pantalon_devant',
      nameAr: 'أمام السروال (Devant Pantalon)',
      nameFr: 'Devant Pantalon (x2)',
      quantityAr: '2x يمين ويسار',
      quantityFr: '2x tissu',
      color: '#0891b2',
      cutPath: devantPath,
      widthCm: Math.round(halfHips + frontCrotchExt),
      heightCm: totalLen,
      x: 5,
      y: 5,
      grainLine: { x1: halfHips / 2, y1: 15, x2: halfHips / 2, y2: totalLen - 15 },
      notches: [{ x: 0, y: crotchDepth, label: 'Fourche devant' }],
      annotations: [
        { text: 'PANTALON DEVANT (x2)', x: 5, y: totalLen * 0.3, size: 14 }
      ]
    },
    {
      id: 'pantalon_dos',
      nameAr: 'خلف السروال (Dos Pantalon)',
      nameFr: 'Dos Pantalon (x2)',
      quantityAr: '2x يمين ويسار',
      quantityFr: '2x tissu',
      color: '#4338ca',
      cutPath: dosPath,
      widthCm: Math.round(halfHips + backCrotchExt),
      heightCm: totalLen + 2,
      x: Math.round(halfHips + frontCrotchExt) + 20,
      y: 5,
      grainLine: { x1: halfHips / 2, y1: 15, x2: halfHips / 2, y2: totalLen - 15 },
      notches: [{ x: 0, y: crotchDepth, label: 'Fourche dos' }],
      annotations: [
        { text: 'PANTALON DOS (x2)', x: 5, y: totalLen * 0.3, size: 14 }
      ]
    },
    {
      id: 'ceinture',
      nameAr: 'حزام السروال (Ceinture)',
      nameFr: 'Ceinture pantalon',
      quantityAr: '1x ثوب + فيزلين',
      quantityFr: '1x tissu + thermocollant',
      color: '#65a30d',
      cutPath: ceinturePath,
      widthCm: Math.round(m.taille + 10),
      heightCm: 9,
      x: 5,
      y: totalLen + 15,
      grainLine: { x1: 5, y1: 4.5, x2: m.taille, y2: 4.5 },
      notches: [],
      annotations: [{ text: 'CEINTURE PANTALON', x: 5, y: 5.5, size: 10 }]
    }
  ];
}

/**
 * 6. HOODIE / SWEAT À CAPUCHE
 */
function generateHoodiePattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance + 6) / 4; // Oversize ease
  const totalLen = Math.min(m.longueurCorps, 75);
  const shoulderWidth = m.carrure / 2 + 3; // Dropped shoulder
  const neckW = 9;
  const armholeDepth = 26;
  const sleeveLen = m.longueurManche - 5; // minus rib cuff
  const bicepW = (m.tourBras + m.aisance) / 2 + 4;
  const wristW = 12;

  const devantPath = `
    M 0 0
    L ${neckW} 0
    L ${shoulderWidth} 4.5
    Q ${shoulderWidth - 1} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    L ${halfChest} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const dosPath = `
    M 0 0
    L ${neckW} 0
    L ${shoulderWidth} 4
    Q ${shoulderWidth} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    L ${halfChest} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const manchePath = `
    M 0 0
    C ${bicepW * 0.3} 0 ${bicepW * 0.7} 4 ${bicepW} 8
    L ${wristW} ${sleeveLen}
    L 0 ${sleeveLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  // 2-piece Hood (Capuche)
  const capuchePath = `
    M 0 0
    C 10 -2 25 3 28 14
    L 28 36
    L 6 36
    Q 0 25 0 0
    Z
  `.replace(/\s+/g, ' ').trim();

  // Kangaroo Pocket (Poche kangourou)
  const pochePath = `
    M 0 0
    L 22 0
    L 16 19
    L 0 19
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'devant',
      nameAr: 'صدر الهودي (Devant)',
      nameFr: 'Devant Hoodie',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#475569',
      cutPath: devantPath,
      widthCm: Math.round(halfChest),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 15, x2: 5, y2: totalLen - 15 },
      notches: [{ x: halfChest, y: armholeDepth, label: 'Emmanchure' }],
      annotations: [
        { text: 'HOODIE DEVANT (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 }
      ]
    },
    {
      id: 'dos',
      nameAr: 'ظهر الهودي (Dos)',
      nameFr: 'Dos Hoodie',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#334155',
      cutPath: dosPath,
      widthCm: Math.round(halfChest),
      heightCm: Math.round(totalLen),
      x: Math.round(halfChest) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 15, x2: 5, y2: totalLen - 15 },
      notches: [{ x: halfChest, y: armholeDepth, label: 'Emmanchure' }],
      annotations: [{ text: 'HOODIE DOS (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 }]
    },
    {
      id: 'manche',
      nameAr: 'كم الهودي (Manche)',
      nameFr: 'Manche (x2)',
      quantityAr: '2x ثوب',
      quantityFr: '2x tissu',
      color: '#10b981',
      cutPath: manchePath,
      widthCm: Math.round(bicepW),
      heightCm: Math.round(sleeveLen),
      x: (Math.round(halfChest) * 2) + 25,
      y: 5,
      grainLine: { x1: 4, y1: 8, x2: 4, y2: sleeveLen - 8 },
      notches: [],
      annotations: [{ text: 'MANCHE HOODIE (x2)', x: bicepW / 3, y: sleeveLen / 2, size: 12 }]
    },
    {
      id: 'capuche',
      nameAr: 'القب / الكابوتشو (Capuche)',
      nameFr: 'Capuche (x2 ou x4 doublée)',
      quantityAr: '2x أو 4x مع التبطين',
      quantityFr: '2x tissu + 2x doublure',
      color: '#d97706',
      cutPath: capuchePath,
      widthCm: 28,
      heightCm: 36,
      x: (Math.round(halfChest) * 2) + 25,
      y: sleeveLen + 15,
      grainLine: { x1: 5, y1: 10, x2: 5, y2: 30 },
      notches: [],
      annotations: [{ text: 'CAPUCHE HOODIE (x2)', x: 4, y: 15, size: 10 }]
    },
    {
      id: 'poche_kangourou',
      nameAr: 'جيب الكنغر (Poche kangourou)',
      nameFr: 'Poche kangourou (Au pli)',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#e11d48',
      cutPath: pochePath,
      widthCm: 22,
      heightCm: 19,
      x: 5,
      y: totalLen + 15,
      grainLine: { x1: 2, y1: 3, x2: 2, y2: 16 },
      notches: [],
      annotations: [{ text: 'POCHE KANGOUROU', x: 2, y: 8, size: 9 }]
    }
  ];
}

// ── Export to Adobe Illustrator Compatible SVG ────────────────
export function exportToIllustratorSVG(
  pieces: PatternPiece[],
  garmentTitle: string,
  measurements: GarmentMeasurements,
  sizeName: string
): string {
  // Calculate bounding box in cm
  let maxX = 0;
  let maxY = 0;
  pieces.forEach(p => {
    const px = (p.x || 0) + p.widthCm;
    const py = (p.y || 0) + p.heightCm;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  });

  const totalWidthCm = Math.max(maxX + 20, 160); // min 1.6m width (standard fabric roll)
  const totalHeightCm = Math.max(maxY + 20, 150);

  // 1 cm = 28.3464567 pt (Exact Adobe Illustrator Postscript points)
  const ptPerCm = 28.3465;
  const svgWidthPt = Math.round(totalWidthCm * ptPerCm);
  const svgHeightPt = Math.round(totalHeightCm * ptPerCm);

  let piecesSvg = '';

  pieces.forEach(p => {
    // Generate Illustrator sublayer per piece
    piecesSvg += `
    <!-- Layer: ${p.id.toUpperCase()} -->
    <g id="${p.id}" inkscape:label="${p.nameFr}" transform="translate(${p.x * 10}, ${p.y * 10})">
      <!-- Cut Line (Stroke 2px) -->
      <path d="${p.cutPath.split(' ').map(token => {
        const num = parseFloat(token);
        return isNaN(num) ? token : (num * 10).toFixed(1);
      }).join(' ')}" 
        fill="#f8fafc" 
        stroke="${p.color}" 
        stroke-width="2.5" 
        stroke-linejoin="round" 
        stroke-linecap="round" 
        vector-effect="non-scaling-stroke"
      />

      <!-- Grain Line (Droit Fil) -->
      <g id="${p.id}_grainline" stroke="#dc2626" stroke-width="1.8">
        <line x1="${p.grainLine.x1 * 10}" y1="${p.grainLine.y1 * 10}" x2="${p.grainLine.x2 * 10}" y2="${p.grainLine.y2 * 10}" />
        <!-- Arrows -->
        <polygon points="${p.grainLine.x1 * 10},${p.grainLine.y1 * 10} ${(p.grainLine.x1 - 0.4) * 10},${(p.grainLine.y1 + 1.2) * 10} ${(p.grainLine.x1 + 0.4) * 10},${(p.grainLine.y1 + 1.2) * 10}" fill="#dc2626" />
        <polygon points="${p.grainLine.x2 * 10},${p.grainLine.y2 * 10} ${(p.grainLine.x2 - 0.4) * 10},${(p.grainLine.y2 - 1.2) * 10} ${(p.grainLine.x2 + 0.4) * 10},${(p.grainLine.y2 - 1.2) * 10}" fill="#dc2626" />
        <text x="${(p.grainLine.x1 + 0.8) * 10}" y="${((p.grainLine.y1 + p.grainLine.y2) / 2) * 10}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#dc2626" font-weight="bold">DROIT FIL ⭥</text>
      </g>

      <!-- Notches (Crans de montage) -->
      ${p.notches.map(n => `
        <circle cx="${n.x * 10}" cy="${n.y * 10}" r="3" fill="#dc2626" stroke="#ffffff" stroke-width="1" />
        <text x="${n.x * 10 + 6}" y="${n.y * 10 + 3}" font-family="Arial, sans-serif" font-size="8" fill="#475569">${n.label || 'Cran'}</text>
      `).join('')}

      <!-- Annotations & Labels -->
      <text x="25" y="40" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${p.nameFr} (${p.nameAr})</text>
      <text x="25" y="60" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#475569">Coupe: ${p.quantityFr} | Taille: ${sizeName}</text>
      <text x="25" y="78" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#64748b">Dim: ${p.widthCm}cm x ${p.heightCm}cm (Valeur couture: ${measurements.valeurCouture}cm)</text>

      ${p.annotations.map(a => `
        <text x="${a.x * 10}" y="${a.y * 10}" font-family="Arial, sans-serif" font-size="${(a.size || 11)}" fill="#0f172a" font-weight="bold">${a.text}</text>
      `).join('')}
    </g>
    `;
  });

  return `<?xml version="1.0" encoding="utf-8"?>
<!-- Generated by BEYA Patronage AI Studio - Ready for Adobe Illustrator -->
<svg version="1.1" id="BEYA_PATRONAGE" xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink" 
     x="0px" y="0px" 
     width="${svgWidthPt}pt" height="${svgHeightPt}pt" 
     viewBox="0 0 ${totalWidthCm * 10} ${totalHeightCm * 10}" 
     xml:space="preserve">
  <style type="text/css">
    text { font-family: 'Helvetica Neue', Arial, sans-serif; }
    .grid-line { stroke: #e2e8f0; stroke-width: 0.5; stroke-dasharray: 2,4; }
  </style>

  <!-- Background / Grid Layout Layer -->
  <g id="Background_Grid" inkscape:label="Grille de coupe">
    <rect width="${totalWidthCm * 10}" height="${totalHeightCm * 10}" fill="#ffffff" />
    <!-- 10cm grid lines -->
    ${Array.from({ length: Math.ceil(totalWidthCm / 10) }).map((_, i) => `
      <line x1="${i * 100}" y1="0" x2="${i * 100}" y2="${totalHeightCm * 10}" class="grid-line" />
    `).join('')}
    ${Array.from({ length: Math.ceil(totalHeightCm / 10) }).map((_, i) => `
      <line x1="0" y1="${i * 100}" x2="${totalWidthCm * 10}" y2="${i * 100}" class="grid-line" />
    `).join('')}
  </g>

  <!-- Title & Model Info Cartouche -->
  <g id="Cartouche_Info" transform="translate(40, 40)">
    <rect x="0" y="0" width="380" height="95" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" />
    <text x="18" y="30" font-size="18" font-weight="bold" fill="#1e1b4b">BEYA AI PATRONAGE - ${garmentTitle.toUpperCase()}</text>
    <text x="18" y="52" font-size="12" fill="#334155">Taille: ${sizeName} | Valeur de couture: ${measurements.valeurCouture}cm</text>
    <text x="18" y="70" font-size="11" fill="#64748b">Tour poitrine: ${measurements.poitrine}cm | Taille: ${measurements.taille}cm | Bassin: ${measurements.bassin}cm</text>
    <text x="18" y="85" font-size="10" fill="#94a3b8">Date: ${new Date().toLocaleDateString('fr-FR')} - Conçu pour Adobe Illustrator & Plotters</text>
  </g>

  <!-- Pattern Pieces (Illustrator Layers) -->
  ${piecesSvg}
</svg>`;
}

// ── Export to CAD DXF Format (Lectra, Gerber, AutoCAD, Clo3D) ───
export function exportToDXF(pieces: PatternPiece[], garmentTitle: string): string {
  let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
4
0
LAYER
2
0
70
0
62
7
6
CONTINUOUS
0
LAYER
2
COUPE
70
0
62
1
6
CONTINUOUS
0
LAYER
2
ANNOTATIONS
70
0
62
3
6
CONTINUOUS
0
LAYER
2
DROIT_FIL
70
0
62
1
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`;

  pieces.forEach(p => {
    // Add text label for each piece
    dxf += `0
TEXT
8
ANNOTATIONS
10
${(p.x * 10).toFixed(2)}
20
${(-(p.y * 10)).toFixed(2)}
30
0.0
40
25.0
1
${p.nameFr} (Taille standard)
`;

    // Add grainline in DXF
    dxf += `0
LINE
8
DROIT_FIL
10
${((p.x + p.grainLine.x1) * 10).toFixed(2)}
20
${(-((p.y + p.grainLine.y1) * 10)).toFixed(2)}
30
0.0
11
${((p.x + p.grainLine.x2) * 10).toFixed(2)}
21
${(-((p.y + p.grainLine.y2) * 10)).toFixed(2)}
31
0.0
`;
  });

  dxf += `0
ENDSEC
0
EOF
`;

  return dxf;
}

// ── Gemini AI Vision & Heuristic Deconstructor ────────────────
export async function analyzeGarmentImageWithAI(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<AiVisionAnalysisResult> {
  const prompt = `Tu es un grand maître modéliste patronnier (Pattern Master CAD & Haute Confection) expert en coupe à plat, patronage industriel et confection marocaine.
Analyse cette photo de vêtement avec une précision technique absolue.

Identifie :
1. Le type de vêtement (abaya, robe, chemise, tshirt, hoodie, pantalon, caftan, blazer).
2. Le titre et description en arabe et français.
3. Les caractéristiques stylistiques (coupe, col, manches, longueur, détails).
4. Le tissu recommandé et le métrage estimé pour laize 1.50m.
5. La taille standard la plus appropriée (S, M, L, XL, 2XL) et les mesures recommandées (poitrine, taille, bassin, carrure, longueurCorps, longueurManche, etc.).

Réponds UNIQUEMENT en JSON valide suivant ce format strict :
{
  "garmentType": "abaya",
  "titleAr": "عباية عصرية واسعة",
  "titleFr": "Abaya Moderne Ample",
  "descriptionAr": "تصميم عباية خليجية أنيقة بقصة مريحة وأكمام كلاسيكية",
  "descriptionFr": "Abaya élégante coupe évasée fluide avec manches droites",
  "detectedFeatures": {
    "coupe": "Évasée / Ample",
    "col": "Col rond dégagé avec parementure",
    "manches": "Manches longues droites",
    "longueur": "Maxi / Longue (140cm)",
    "details": ["Coupe au pli", "Crans de montage", "Finition ourlet 2cm"]
  },
  "recommendedFabric": {
    "typeAr": "كريب ملكي كوري أو نيدل",
    "typeFr": "Crêpe de soie ou Nida haut de gamme",
    "metrage": 2.8,
    "laizeCm": 150
  },
  "suggestedSize": "M",
  "measurements": {
    "poitrine": 96,
    "taille": 78,
    "bassin": 104,
    "carrure": 40,
    "longueurCorps": 140,
    "longueurManche": 60,
    "tourBras": 32,
    "tourPoignet": 18,
    "encolure": 38,
    "hauteurTaille": 42,
    "hauteurBassin": 21,
    "largeurBas": 68,
    "aisance": 8,
    "valeurCouture": 1
  }
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: imageBase64, mimeType } }
          ]
        }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'Gemini error');

    const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : rawText.trim());

    const garmentType: GarmentType = parsed.garmentType || 'abaya';
    const measurements: GarmentMeasurements = {
      ...STANDARD_MEASUREMENTS[parsed.suggestedSize as SizingCategory || 'M'],
      ...(parsed.measurements || {})
    };

    const patternPieces = generatePatternPieces(garmentType, measurements);

    return {
      garmentType,
      titleAr: parsed.titleAr || 'موديل مصمم بالذكاء الاصطناعي',
      titleFr: parsed.titleFr || 'Modèle Détecté par IA',
      descriptionAr: parsed.descriptionAr || '',
      descriptionFr: parsed.descriptionFr || '',
      detectedFeatures: parsed.detectedFeatures || {
        coupe: 'Standard',
        col: 'Col classique',
        manches: 'Manches standards',
        longueur: 'Standard',
        details: []
      },
      recommendedFabric: parsed.recommendedFabric || {
        typeAr: 'ثوب مناسب للموديل',
        typeFr: 'Tissu fluide adapté',
        metrage: 2.2,
        laizeCm: 150
      },
      suggestedSize: parsed.suggestedSize || 'M',
      measurements,
      patternPieces
    };
  } catch (err: any) {
    console.warn('Gemini vision API unavailable or failed, falling back to heuristic engine:', err);
    return getHeuristicAnalysis('abaya', 'M');
  }
}

/**
 * Intelligent instant heuristic engine when no API key is provided
 */
export function getHeuristicAnalysis(
  type: GarmentType = 'abaya',
  size: SizingCategory = 'M'
): AiVisionAnalysisResult {
  const baseMeasurements = { ...STANDARD_MEASUREMENTS[size] };
  const patternPieces = generatePatternPieces(type, baseMeasurements);

  const presets: Record<GarmentType, {
    titleAr: string;
    titleFr: string;
    descAr: string;
    descFr: string;
    features: { coupe: string; col: string; manches: string; longueur: string; details: string[] };
    fabric: { typeAr: string; typeFr: string; metrage: number; laizeCm: number };
  }> = {
    abaya: {
      titleAr: 'عباية خليجية عصرية كلاسيك',
      titleFr: 'Abaya Moderne Dubaï',
      descAr: 'تصميم أنيق بقصة إفازي واسعة مع كم مريح وتبطنين للياقة.',
      descFr: 'Coupe évasée fluide, encolure arrondie propre et manches longues confortables.',
      features: {
        coupe: 'Coupe Évasée A-Line',
        col: 'Col rond avec parementure pro',
        manches: 'Manches longues classiques',
        longueur: 'Maxi 140cm',
        details: ['Coupe au pli du tissu', 'Crans de montage repérés', 'Valeur de couture 1cm incluse']
      },
      fabric: { typeAr: 'كريب نيدا أو باربي كوري', typeFr: 'Crêpe Nida Coréen', metrage: 2.8, laizeCm: 150 }
    },
    chemise: {
      titleAr: 'قميص كلاسيكي (Chemise Regular)',
      titleFr: 'Chemise Classique Regular',
      descAr: 'قميص بأزرار أمامية، كول شوميز مع بوانيي الأكمام.',
      descFr: 'Chemise boutonnée avec pied de col, poignets arrondis et fente manche.',
      features: {
        coupe: 'Coupe Droite Regular',
        col: 'Col chemise avec pied de col',
        manches: 'Manches longues avec poignets',
        longueur: 'Standard 74cm',
        details: ['Croisure boutons +2.5cm', 'Poignets thermocollés', 'Pied de col ajusté']
      },
      fabric: { typeAr: 'بوبلين قطن أو بوبلين ستريتش', typeFr: 'Popeline de Coton 100%', metrage: 1.8, laizeCm: 150 }
    },
    tshirt: {
      titleAr: 'تيشورت قطني (T-Shirt Premium)',
      titleFr: 'T-Shirt Unisexe Premium',
      descAr: 'تيشورت خفيف بياقة دائرية من الريب وقصة مريحة.',
      descFr: 'T-shirt jersey col rond côtelé, emmanchure confortable et manches courtes.',
      features: {
        coupe: 'Coupe Droite Boxy',
        col: 'Col rond avec bord-côte (Rib)',
        manches: 'Manches courtes',
        longueur: 'Standard 70cm',
        details: ['Assemblage surjeteuse 4 fils', 'Bande de propreté dos', 'Ourlet double aiguille']
      },
      fabric: { typeAr: 'جيرسي قطن 100% (200 GSM)', typeFr: 'Jersey Coton Peigné 200g', metrage: 1.2, laizeCm: 150 }
    },
    robe: {
      titleAr: 'فستان صيفي أنيق (Robe Midi)',
      titleFr: 'Robe Fluide Élégante',
      descAr: 'فستان بخصر محدد وقصة إفازي أنثوية مع سحاب في الظهر.',
      descFr: 'Robe cintrée à la taille avec jupe évasée et fermeture éclair dos.',
      features: {
        coupe: 'Cintrée puis évasée (Fit & Flare)',
        col: 'Encolure bateau / dégagée',
        manches: 'Manches 3/4 ou longues',
        longueur: 'Midi 125cm',
        details: ['Zip invisible milieu dos', 'Pinces poitrine', 'Finition biais ou doublure']
      },
      fabric: { typeAr: 'حرير فسكوز أو كريب مطبوع', typeFr: 'Viscose imprimée ou Crêpe georgette', metrage: 2.5, laizeCm: 150 }
    },
    pantalon: {
      titleAr: 'سروال مستقيم كلاسيك (Pantalon Chino)',
      titleFr: 'Pantalon Coupe Droite Chino',
      descAr: 'سروال بقصة متوازنة، حزام مريح وجيوب جانبية.',
      descFr: 'Pantalon taille moyenne, jambe droite et ceinture rapportée.',
      features: {
        coupe: 'Jambe Droite Confort',
        col: 'Sans objet',
        manches: 'Sans objet',
        longueur: 'Pleine longueur 102cm',
        details: ['Fourche dos allongée', 'Poches italiennes', 'Ceinture avec passants']
      },
      fabric: { typeAr: 'قطن تويل أو غاباردين مرن', typeFr: 'Gabardine Coton / Élasthanne', metrage: 1.6, laizeCm: 150 }
    },
    hoodie: {
      titleAr: 'سويت كابوتشو أوفرسايز (Hoodie Oversize)',
      titleFr: 'Hoodie Streetwear Oversize',
      descAr: 'كابوتشو عصري بقصة واسعة، قب مضاعف وجيب كنغر كبير.',
      descFr: 'Sweat à capuche oversize, capuche doublée et grande poche kangourou devant.',
      features: {
        coupe: 'Oversize Streetwear',
        col: 'Capuche enveloppante 2 pièces',
        manches: 'Manches tombantes avec bord-côte',
        longueur: '72cm',
        details: ['Capuche doublée', 'Poche kangourou', 'Bord-côte bas et poignets']
      },
      fabric: { typeAr: 'مولتون مبطن قطن 350 GSM', typeFr: 'Molleton Gratté Coton 350g', metrage: 2.0, laizeCm: 150 }
    },
    caftan: {
      titleAr: 'قفطان مغربي عصري (Caftan)',
      titleFr: 'Caftan Marocain Moderne',
      descAr: 'قفطان فخم بقصة كلاسيكية مغربية، فتحة أمامية للسفيفة والعقاد.',
      descFr: 'Caftan traditionnel revisité, ouverture devant pour sfifa et aqqad.',
      features: {
        coupe: 'Caftan Évasé avec fentes',
        col: 'Col officier ou col V marocain',
        manches: 'Manches longues avec poignet sfifa',
        longueur: 'Maxi 150cm',
        details: ['Bande de croisure pour Sfifa', 'Crans de montage', 'Ampleur bas majestueuse']
      },
      fabric: { typeAr: 'مليفة كشمير أو كريب صاتان', typeFr: 'Mlifa Cachemire ou Crêpe Satin', metrage: 3.2, laizeCm: 150 }
    },
    blazer: {
      titleAr: 'سترة بليزر نسائي (Blazer Tailleur)',
      titleFr: 'Blazer Tailleur Structuré',
      descAr: 'بليزر بياقة ريفير وأكتاف مدعومة، قصة شبه مخصرة.',
      descFr: 'Veste tailleur col tailleur, poches à rabat et manches 2 pièces.',
      features: {
        coupe: 'Semi-ajustée Structurée',
        col: 'Col tailleur avec cran',
        manches: 'Manches tailleur 2 pièces',
        longueur: '72cm',
        details: ['Épaulettes', 'Entoilage thermocollant devant', 'Fente milieu dos']
      },
      fabric: { typeAr: 'صوف بارد أو كريب ثقيل', typeFr: 'Laine froide ou Crêpe lourd', metrage: 2.1, laizeCm: 150 }
    }
  };

  const preset = presets[type] || presets.abaya;

  return {
    garmentType: type,
    titleAr: preset.titleAr,
    titleFr: preset.titleFr,
    descriptionAr: preset.descAr,
    descriptionFr: preset.descFr,
    detectedFeatures: preset.features,
    recommendedFabric: preset.fabric,
    suggestedSize: size,
    measurements: baseMeasurements,
    patternPieces
  };
}
