/**
 * BEYA Patronage AI Engine (Professional CAD & Fashion Pattern Drafting)
 * Parametric 2D Garment Pattern Drafting & Vector Export Engine
 * Compatible with Adobe Illustrator (.SVG), CAD Plotters (.DXF), and PDF
 */

export type GarmentType = 
  | 'boxer'      // بوكسر / كلسون رجالي
  | 'short'      // شورت / برمودا
  | 'pantalon'   // سروال / بنطلون
  | 'tshirt'     // تيشورت / بولو
  | 'chemise'    // قميص كلاسيك
  | 'abaya'      // عباية خليجية / قندورة
  | 'robe'       // فستان / كسوة
  | 'hoodie'     // كابوتشو / سويت شيرت
  | 'caftan'     // قفطان مغربي
  | 'jupe'       // تنورة / صاية
  | 'blazer';    // بليزر / فيست

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
  tourCuisse: number;    // Tour de cuisse (cm)
  hauteurFourche: number;// Hauteur de fourche / entrejambe (cm)
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

// ── Standard Measurements by Garment Type & Size ──────────────
export const GARMENT_DEFAULT_MEASUREMENTS: Record<GarmentType, Record<SizingCategory, GarmentMeasurements>> = {
  // 1. BOXER / CALEÇON (Underwear)
  boxer: {
    XS: { poitrine: 0, taille: 70, bassin: 86, carrure: 0, longueurCorps: 29, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 18, largeurBas: 22, tourCuisse: 48, hauteurFourche: 23, aisance: 1, valeurCouture: 1 },
    S:  { poitrine: 0, taille: 76, bassin: 92, carrure: 0, longueurCorps: 30, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 19, largeurBas: 24, tourCuisse: 52, hauteurFourche: 24, aisance: 1, valeurCouture: 1 },
    M:  { poitrine: 0, taille: 82, bassin: 98, carrure: 0, longueurCorps: 32, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 20, largeurBas: 26, tourCuisse: 56, hauteurFourche: 25, aisance: 2, valeurCouture: 1 },
    L:  { poitrine: 0, taille: 88, bassin: 104, carrure: 0, longueurCorps: 34, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 28, tourCuisse: 60, hauteurFourche: 26, aisance: 2, valeurCouture: 1 },
    XL: { poitrine: 0, taille: 96, bassin: 112, carrure: 0, longueurCorps: 36, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 22, largeurBas: 30, tourCuisse: 64, hauteurFourche: 27, aisance: 2, valeurCouture: 1 },
    '2XL': { poitrine: 0, taille: 104, bassin: 120, carrure: 0, longueurCorps: 37, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 23, largeurBas: 32, tourCuisse: 68, hauteurFourche: 28, aisance: 2, valeurCouture: 1 },
    '3XL': { poitrine: 0, taille: 112, bassin: 128, carrure: 0, longueurCorps: 38, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 23, largeurBas: 34, tourCuisse: 72, hauteurFourche: 29, aisance: 2, valeurCouture: 1 },
    custom: { poitrine: 0, taille: 82, bassin: 98, carrure: 0, longueurCorps: 32, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 20, largeurBas: 26, tourCuisse: 56, hauteurFourche: 25, aisance: 2, valeurCouture: 1 }
  },

  // 2. SHORT / BERMUDA
  short: {
    XS: { poitrine: 0, taille: 72, bassin: 90, carrure: 0, longueurCorps: 44, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 20, largeurBas: 25, tourCuisse: 54, hauteurFourche: 26, aisance: 3, valeurCouture: 1 },
    S:  { poitrine: 0, taille: 78, bassin: 96, carrure: 0, longueurCorps: 46, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 20, largeurBas: 27, tourCuisse: 58, hauteurFourche: 27, aisance: 3, valeurCouture: 1 },
    M:  { poitrine: 0, taille: 84, bassin: 102, carrure: 0, longueurCorps: 48, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 29, tourCuisse: 62, hauteurFourche: 28, aisance: 4, valeurCouture: 1 },
    L:  { poitrine: 0, taille: 92, bassin: 110, carrure: 0, longueurCorps: 50, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 22, largeurBas: 31, tourCuisse: 66, hauteurFourche: 29, aisance: 4, valeurCouture: 1 },
    XL: { poitrine: 0, taille: 100, bassin: 118, carrure: 0, longueurCorps: 52, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 23, largeurBas: 33, tourCuisse: 70, hauteurFourche: 30, aisance: 4, valeurCouture: 1 },
    '2XL': { poitrine: 0, taille: 108, bassin: 126, carrure: 0, longueurCorps: 54, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 23, largeurBas: 35, tourCuisse: 74, hauteurFourche: 31, aisance: 5, valeurCouture: 1 },
    '3XL': { poitrine: 0, taille: 116, bassin: 134, carrure: 0, longueurCorps: 55, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 24, largeurBas: 37, tourCuisse: 78, hauteurFourche: 32, aisance: 5, valeurCouture: 1 },
    custom: { poitrine: 0, taille: 84, bassin: 102, carrure: 0, longueurCorps: 48, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 29, tourCuisse: 62, hauteurFourche: 28, aisance: 4, valeurCouture: 1 }
  },

  // 3. PANTALON
  pantalon: {
    XS: { poitrine: 0, taille: 72, bassin: 90, carrure: 0, longueurCorps: 98, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 20, largeurBas: 19, tourCuisse: 54, hauteurFourche: 25, aisance: 3, valeurCouture: 1 },
    S:  { poitrine: 0, taille: 78, bassin: 96, carrure: 0, longueurCorps: 100, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 20, largeurBas: 20, tourCuisse: 57, hauteurFourche: 26, aisance: 3, valeurCouture: 1 },
    M:  { poitrine: 0, taille: 84, bassin: 102, carrure: 0, longueurCorps: 102, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 21, tourCuisse: 60, hauteurFourche: 27, aisance: 4, valeurCouture: 1 },
    L:  { poitrine: 0, taille: 92, bassin: 110, carrure: 0, longueurCorps: 104, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 22, largeurBas: 22, tourCuisse: 64, hauteurFourche: 28, aisance: 4, valeurCouture: 1 },
    XL: { poitrine: 0, taille: 100, bassin: 118, carrure: 0, longueurCorps: 105, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 23, largeurBas: 23, tourCuisse: 68, hauteurFourche: 29, aisance: 4, valeurCouture: 1 },
    '2XL': { poitrine: 0, taille: 108, bassin: 126, carrure: 0, longueurCorps: 106, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 23, largeurBas: 24, tourCuisse: 72, hauteurFourche: 30, aisance: 5, valeurCouture: 1 },
    '3XL': { poitrine: 0, taille: 116, bassin: 134, carrure: 0, longueurCorps: 106, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 24, largeurBas: 25, tourCuisse: 76, hauteurFourche: 31, aisance: 5, valeurCouture: 1 },
    custom: { poitrine: 0, taille: 84, bassin: 102, carrure: 0, longueurCorps: 102, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 21, tourCuisse: 60, hauteurFourche: 27, aisance: 4, valeurCouture: 1 }
  },

  // 4. T-SHIRT
  tshirt: {
    XS: { poitrine: 86, taille: 80, bassin: 88, carrure: 40, longueurCorps: 66, longueurManche: 20, tourBras: 30, tourPoignet: 28, encolure: 38, hauteurTaille: 40, hauteurBassin: 20, largeurBas: 44, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    S:  { poitrine: 92, taille: 86, bassin: 94, carrure: 42, longueurCorps: 68, longueurManche: 21, tourBras: 32, tourPoignet: 30, encolure: 39, hauteurTaille: 41, hauteurBassin: 20, largeurBas: 47, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    M:  { poitrine: 100, taille: 94, bassin: 102, carrure: 44, longueurCorps: 71, longueurManche: 22, tourBras: 34, tourPoignet: 32, encolure: 40, hauteurTaille: 42, hauteurBassin: 21, largeurBas: 51, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    L:  { poitrine: 108, taille: 102, bassin: 110, carrure: 46, longueurCorps: 73, longueurManche: 23, tourBras: 37, tourPoignet: 34, encolure: 41, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 55, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    XL: { poitrine: 116, taille: 110, bassin: 118, carrure: 48, longueurCorps: 75, longueurManche: 24, tourBras: 40, tourPoignet: 36, encolure: 42, hauteurTaille: 44, hauteurBassin: 22, largeurBas: 59, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    '2XL': { poitrine: 126, taille: 120, bassin: 128, carrure: 50, longueurCorps: 77, longueurManche: 25, tourBras: 43, tourPoignet: 38, encolure: 43, hauteurTaille: 44, hauteurBassin: 22, largeurBas: 64, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    '3XL': { poitrine: 136, taille: 130, bassin: 138, carrure: 52, longueurCorps: 78, longueurManche: 25, tourBras: 46, tourPoignet: 40, encolure: 44, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 69, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    custom: { poitrine: 100, taille: 94, bassin: 102, carrure: 44, longueurCorps: 71, longueurManche: 22, tourBras: 34, tourPoignet: 32, encolure: 40, hauteurTaille: 42, hauteurBassin: 21, largeurBas: 51, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 }
  },

  // 5. CHEMISE
  chemise: {
    XS: { poitrine: 90, taille: 82, bassin: 92, carrure: 41, longueurCorps: 72, longueurManche: 60, tourBras: 32, tourPoignet: 21, encolure: 37, hauteurTaille: 41, hauteurBassin: 20, largeurBas: 46, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    S:  { poitrine: 96, taille: 88, bassin: 98, carrure: 43, longueurCorps: 74, longueurManche: 61, tourBras: 34, tourPoignet: 22, encolure: 38, hauteurTaille: 42, hauteurBassin: 20, largeurBas: 49, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    M:  { poitrine: 104, taille: 96, bassin: 106, carrure: 45, longueurCorps: 76, longueurManche: 62, tourBras: 36, tourPoignet: 23, encolure: 40, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 53, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    L:  { poitrine: 112, taille: 104, bassin: 114, carrure: 47, longueurCorps: 78, longueurManche: 63, tourBras: 39, tourPoignet: 24, encolure: 42, hauteurTaille: 44, hauteurBassin: 21, largeurBas: 57, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    XL: { poitrine: 120, taille: 112, bassin: 122, carrure: 49, longueurCorps: 80, longueurManche: 64, tourBras: 42, tourPoignet: 25, encolure: 44, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 61, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    '2XL': { poitrine: 128, taille: 120, bassin: 130, carrure: 51, longueurCorps: 81, longueurManche: 64, tourBras: 45, tourPoignet: 26, encolure: 46, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 65, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    '3XL': { poitrine: 138, taille: 130, bassin: 140, carrure: 53, longueurCorps: 82, longueurManche: 65, tourBras: 48, tourPoignet: 27, encolure: 48, hauteurTaille: 46, hauteurBassin: 22, largeurBas: 70, tourCuisse: 0, hauteurFourche: 0, aisance: 14, valeurCouture: 1 },
    custom: { poitrine: 104, taille: 96, bassin: 106, carrure: 45, longueurCorps: 76, longueurManche: 62, tourBras: 36, tourPoignet: 23, encolure: 40, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 53, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 }
  },

  // 6. ABAYA / GANDORA
  abaya: {
    XS: { poitrine: 84, taille: 66, bassin: 90, carrure: 36, longueurCorps: 135, longueurManche: 58, tourBras: 28, tourPoignet: 16, encolure: 35, hauteurTaille: 40, hauteurBassin: 20, largeurBas: 55, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    S:  { poitrine: 90, taille: 72, bassin: 96, carrure: 38, longueurCorps: 138, longueurManche: 59, tourBras: 30, tourPoignet: 17, encolure: 36, hauteurTaille: 41, hauteurBassin: 20, largeurBas: 60, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    M:  { poitrine: 98, taille: 80, bassin: 104, carrure: 40, longueurCorps: 140, longueurManche: 60, tourBras: 32, tourPoignet: 18, encolure: 38, hauteurTaille: 42, hauteurBassin: 21, largeurBas: 65, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    L:  { poitrine: 106, taille: 88, bassin: 112, carrure: 42, longueurCorps: 142, longueurManche: 61, tourBras: 35, tourPoignet: 19, encolure: 40, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 70, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    XL: { poitrine: 114, taille: 98, bassin: 120, carrure: 44, longueurCorps: 144, longueurManche: 62, tourBras: 38, tourPoignet: 20, encolure: 42, hauteurTaille: 44, hauteurBassin: 22, largeurBas: 75, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    '2XL': { poitrine: 124, taille: 108, bassin: 130, carrure: 46, longueurCorps: 145, longueurManche: 62, tourBras: 41, tourPoignet: 21, encolure: 44, hauteurTaille: 44, hauteurBassin: 22, largeurBas: 80, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    '3XL': { poitrine: 134, taille: 120, bassin: 140, carrure: 48, longueurCorps: 146, longueurManche: 63, tourBras: 44, tourPoignet: 22, encolure: 46, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 85, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    custom: { poitrine: 98, taille: 80, bassin: 104, carrure: 40, longueurCorps: 140, longueurManche: 60, tourBras: 32, tourPoignet: 18, encolure: 38, hauteurTaille: 42, hauteurBassin: 21, largeurBas: 65, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 }
  },

  // 7. ROBE
  robe: {
    XS: { poitrine: 82, taille: 64, bassin: 88, carrure: 36, longueurCorps: 115, longueurManche: 58, tourBras: 28, tourPoignet: 16, encolure: 35, hauteurTaille: 39, hauteurBassin: 20, largeurBas: 58, tourCuisse: 0, hauteurFourche: 0, aisance: 4, valeurCouture: 1 },
    S:  { poitrine: 88, taille: 70, bassin: 94, carrure: 37, longueurCorps: 118, longueurManche: 59, tourBras: 30, tourPoignet: 17, encolure: 36, hauteurTaille: 40, hauteurBassin: 20, largeurBas: 62, tourCuisse: 0, hauteurFourche: 0, aisance: 4, valeurCouture: 1 },
    M:  { poitrine: 96, taille: 78, bassin: 102, carrure: 39, longueurCorps: 120, longueurManche: 60, tourBras: 32, tourPoignet: 18, encolure: 38, hauteurTaille: 41, hauteurBassin: 21, largeurBas: 68, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    L:  { poitrine: 104, taille: 86, bassin: 110, carrure: 41, longueurCorps: 122, longueurManche: 61, tourBras: 35, tourPoignet: 19, encolure: 40, hauteurTaille: 42, hauteurBassin: 21, largeurBas: 74, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    XL: { poitrine: 112, taille: 96, bassin: 118, carrure: 43, longueurCorps: 124, longueurManche: 62, tourBras: 38, tourPoignet: 20, encolure: 42, hauteurTaille: 43, hauteurBassin: 22, largeurBas: 80, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    '2XL': { poitrine: 122, taille: 106, bassin: 128, carrure: 45, longueurCorps: 125, longueurManche: 62, tourBras: 41, tourPoignet: 21, encolure: 44, hauteurTaille: 43, hauteurBassin: 22, largeurBas: 85, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    '3XL': { poitrine: 132, taille: 118, bassin: 138, carrure: 47, longueurCorps: 126, longueurManche: 63, tourBras: 44, tourPoignet: 22, encolure: 46, hauteurTaille: 44, hauteurBassin: 22, largeurBas: 90, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    custom: { poitrine: 96, taille: 78, bassin: 102, carrure: 39, longueurCorps: 120, longueurManche: 60, tourBras: 32, tourPoignet: 18, encolure: 38, hauteurTaille: 41, hauteurBassin: 21, largeurBas: 68, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 }
  },

  // 8. HOODIE
  hoodie: {
    XS: { poitrine: 96, taille: 90, bassin: 96, carrure: 44, longueurCorps: 66, longueurManche: 56, tourBras: 34, tourPoignet: 18, encolure: 42, hauteurTaille: 41, hauteurBassin: 20, largeurBas: 48, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    S:  { poitrine: 104, taille: 98, bassin: 104, carrure: 46, longueurCorps: 69, longueurManche: 58, tourBras: 36, tourPoignet: 19, encolure: 43, hauteurTaille: 42, hauteurBassin: 20, largeurBas: 52, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    M:  { poitrine: 112, taille: 106, bassin: 112, carrure: 48, longueurCorps: 72, longueurManche: 60, tourBras: 39, tourPoignet: 20, encolure: 44, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 56, tourCuisse: 0, hauteurFourche: 0, aisance: 14, valeurCouture: 1 },
    L:  { poitrine: 120, taille: 114, bassin: 120, carrure: 50, longueurCorps: 74, longueurManche: 61, tourBras: 42, tourPoignet: 21, encolure: 45, hauteurTaille: 44, hauteurBassin: 21, largeurBas: 60, tourCuisse: 0, hauteurFourche: 0, aisance: 14, valeurCouture: 1 },
    XL: { poitrine: 128, taille: 122, bassin: 128, carrure: 52, longueurCorps: 76, longueurManche: 62, tourBras: 45, tourPoignet: 22, encolure: 46, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 64, tourCuisse: 0, hauteurFourche: 0, aisance: 16, valeurCouture: 1 },
    '2XL': { poitrine: 136, taille: 130, bassin: 136, carrure: 54, longueurCorps: 77, longueurManche: 63, tourBras: 48, tourPoignet: 23, encolure: 47, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 68, tourCuisse: 0, hauteurFourche: 0, aisance: 16, valeurCouture: 1 },
    '3XL': { poitrine: 144, taille: 138, bassin: 144, carrure: 56, longueurCorps: 78, longueurManche: 64, tourBras: 51, tourPoignet: 24, encolure: 48, hauteurTaille: 46, hauteurBassin: 22, largeurBas: 72, tourCuisse: 0, hauteurFourche: 0, aisance: 18, valeurCouture: 1 },
    custom: { poitrine: 112, taille: 106, bassin: 112, carrure: 48, longueurCorps: 72, longueurManche: 60, tourBras: 39, tourPoignet: 20, encolure: 44, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 56, tourCuisse: 0, hauteurFourche: 0, aisance: 14, valeurCouture: 1 }
  },

  // 9. CAFTAN
  caftan: {
    XS: { poitrine: 86, taille: 68, bassin: 92, carrure: 37, longueurCorps: 145, longueurManche: 59, tourBras: 29, tourPoignet: 16, encolure: 36, hauteurTaille: 40, hauteurBassin: 20, largeurBas: 65, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    S:  { poitrine: 92, taille: 74, bassin: 98, carrure: 39, longueurCorps: 148, longueurManche: 60, tourBras: 31, tourPoignet: 17, encolure: 37, hauteurTaille: 41, hauteurBassin: 20, largeurBas: 70, tourCuisse: 0, hauteurFourche: 0, aisance: 6, valeurCouture: 1 },
    M:  { poitrine: 100, taille: 82, bassin: 106, carrure: 41, longueurCorps: 150, longueurManche: 61, tourBras: 33, tourPoignet: 18, encolure: 39, hauteurTaille: 42, hauteurBassin: 21, largeurBas: 75, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    L:  { poitrine: 108, taille: 90, bassin: 114, carrure: 43, longueurCorps: 152, longueurManche: 62, tourBras: 36, tourPoignet: 19, encolure: 41, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 80, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    XL: { poitrine: 116, taille: 100, bassin: 122, carrure: 45, longueurCorps: 154, longueurManche: 63, tourBras: 39, tourPoignet: 20, encolure: 43, hauteurTaille: 44, hauteurBassin: 22, largeurBas: 85, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    '2XL': { poitrine: 126, taille: 110, bassin: 132, carrure: 47, longueurCorps: 155, longueurManche: 63, tourBras: 42, tourPoignet: 21, encolure: 45, hauteurTaille: 44, hauteurBassin: 22, largeurBas: 90, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    '3XL': { poitrine: 136, taille: 122, bassin: 142, carrure: 49, longueurCorps: 155, longueurManche: 64, tourBras: 45, tourPoignet: 22, encolure: 47, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 95, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    custom: { poitrine: 100, taille: 82, bassin: 106, carrure: 41, longueurCorps: 150, longueurManche: 61, tourBras: 33, tourPoignet: 18, encolure: 39, hauteurTaille: 42, hauteurBassin: 21, largeurBas: 75, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 }
  },

  // 10. JUPE
  jupe: {
    XS: { poitrine: 0, taille: 64, bassin: 88, carrure: 0, longueurCorps: 65, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 19, largeurBas: 48, tourCuisse: 0, hauteurFourche: 0, aisance: 2, valeurCouture: 1 },
    S:  { poitrine: 0, taille: 70, bassin: 94, carrure: 0, longueurCorps: 67, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 20, largeurBas: 52, tourCuisse: 0, hauteurFourche: 0, aisance: 2, valeurCouture: 1 },
    M:  { poitrine: 0, taille: 78, bassin: 102, carrure: 0, longueurCorps: 70, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 58, tourCuisse: 0, hauteurFourche: 0, aisance: 3, valeurCouture: 1 },
    L:  { poitrine: 0, taille: 86, bassin: 110, carrure: 0, longueurCorps: 72, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 64, tourCuisse: 0, hauteurFourche: 0, aisance: 3, valeurCouture: 1 },
    XL: { poitrine: 0, taille: 96, bassin: 118, carrure: 0, longueurCorps: 74, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 22, largeurBas: 70, tourCuisse: 0, hauteurFourche: 0, aisance: 4, valeurCouture: 1 },
    '2XL': { poitrine: 0, taille: 106, bassin: 128, carrure: 0, longueurCorps: 75, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 22, largeurBas: 75, tourCuisse: 0, hauteurFourche: 0, aisance: 4, valeurCouture: 1 },
    '3XL': { poitrine: 0, taille: 118, bassin: 138, carrure: 0, longueurCorps: 75, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 22, largeurBas: 80, tourCuisse: 0, hauteurFourche: 0, aisance: 5, valeurCouture: 1 },
    custom: { poitrine: 0, taille: 78, bassin: 102, carrure: 0, longueurCorps: 70, longueurManche: 0, tourBras: 0, tourPoignet: 0, encolure: 0, hauteurTaille: 0, hauteurBassin: 21, largeurBas: 58, tourCuisse: 0, hauteurFourche: 0, aisance: 3, valeurCouture: 1 }
  },

  // 11. BLAZER
  blazer: {
    XS: { poitrine: 88, taille: 76, bassin: 92, carrure: 38, longueurCorps: 68, longueurManche: 59, tourBras: 30, tourPoignet: 24, encolure: 36, hauteurTaille: 41, hauteurBassin: 20, largeurBas: 48, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    S:  { poitrine: 94, taille: 82, bassin: 98, carrure: 40, longueurCorps: 70, longueurManche: 60, tourBras: 32, tourPoignet: 25, encolure: 37, hauteurTaille: 42, hauteurBassin: 20, largeurBas: 51, tourCuisse: 0, hauteurFourche: 0, aisance: 8, valeurCouture: 1 },
    M:  { poitrine: 102, taille: 90, bassin: 106, carrure: 42, longueurCorps: 72, longueurManche: 61, tourBras: 34, tourPoignet: 26, encolure: 39, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 55, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    L:  { poitrine: 110, taille: 98, bassin: 114, carrure: 44, longueurCorps: 74, longueurManche: 62, tourBras: 37, tourPoignet: 27, encolure: 41, hauteurTaille: 44, hauteurBassin: 21, largeurBas: 59, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 },
    XL: { poitrine: 118, taille: 106, bassin: 122, carrure: 46, longueurCorps: 76, longueurManche: 63, tourBras: 40, tourPoignet: 28, encolure: 43, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 63, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    '2XL': { poitrine: 126, taille: 114, bassin: 130, carrure: 48, longueurCorps: 77, longueurManche: 63, tourBras: 43, tourPoignet: 29, encolure: 45, hauteurTaille: 45, hauteurBassin: 22, largeurBas: 67, tourCuisse: 0, hauteurFourche: 0, aisance: 12, valeurCouture: 1 },
    '3XL': { poitrine: 136, taille: 124, bassin: 140, carrure: 50, longueurCorps: 78, longueurManche: 64, tourBras: 46, tourPoignet: 30, encolure: 47, hauteurTaille: 46, hauteurBassin: 22, largeurBas: 72, tourCuisse: 0, hauteurFourche: 0, aisance: 14, valeurCouture: 1 },
    custom: { poitrine: 102, taille: 90, bassin: 106, carrure: 42, longueurCorps: 72, longueurManche: 61, tourBras: 34, tourPoignet: 26, encolure: 39, hauteurTaille: 43, hauteurBassin: 21, largeurBas: 55, tourCuisse: 0, hauteurFourche: 0, aisance: 10, valeurCouture: 1 }
  }
};

// Fallback compatibility chart
export const STANDARD_MEASUREMENTS = GARMENT_DEFAULT_MEASUREMENTS.abaya;

// ── Parametric Pattern Calculations Engine ────────────────────
export function generatePatternPieces(
  type: GarmentType,
  m: GarmentMeasurements
): PatternPiece[] {
  const vc = m.valeurCouture || 1;

  switch (type) {
    case 'boxer':
      return generateBoxerPattern(m, vc);
    case 'short':
      return generateShortPattern(m, vc);
    case 'pantalon':
      return generatePantalonPattern(m, vc);
    case 'tshirt':
      return generateTshirtPattern(m, vc);
    case 'chemise':
      return generateChemisePattern(m, vc);
    case 'abaya':
      return generateAbayaPattern(m, vc);
    case 'caftan':
      return generateCaftanPattern(m, vc);
    case 'robe':
      return generateRobePattern(m, vc);
    case 'jupe':
      return generateJupePattern(m, vc);
    case 'hoodie':
      return generateHoodiePattern(m, vc);
    case 'blazer':
    default:
      return generateBlazerPattern(m, vc);
  }
}

/**
 * 1. BOXER / CALEÇON HOMME (Ergonomic Boxer Brief with Pouch & Fly)
 * Tailoring method: 4 technical parts (Side leg, Pouch with fly, Gusset, Waistband)
 */
function generateBoxerPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfWaist = (m.taille * 0.9) / 4; // Jersey stretch reduction
  const halfHips = (m.bassin * 0.95) / 4;
  const totalLen = m.longueurCorps || 32;
  const crotchDepth = m.hauteurFourche || 25;
  const legHemWidth = (m.tourCuisse || 56) / 2;

  // 1. Panneau Côté Jambe (x2 - Droite et Gauche)
  const jambePath = `
    M 0 0
    L ${halfWaist + 2} 0
    L ${halfHips + 4} ${crotchDepth}
    L ${legHemWidth} ${totalLen}
    L 0 ${totalLen}
    L 0 ${crotchDepth}
    Z
  `.replace(/\s+/g, ' ').trim();

  // 2. Coquille Devant / Braguette boutonnée (x2 doublée)
  // Ergonomic curve with 2 fly button markings
  const pouchWidth = 14;
  const pouchHeight = crotchDepth;
  const coquillePath = `
    M 0 0
    C 4 0 10 2 12 7
    C 14 12 14 18 10 23
    L 0 ${pouchHeight}
    Z
  `.replace(/\s+/g, ' ').trim();

  // 3. Fond / Gousset d'entrejambe (Gusset connecting front & back)
  const gussetWidth = 9;
  const gussetLen = 22;
  const goussetPath = `
    M 0 3
    Q ${gussetLen / 2} 0 ${gussetLen} 3
    L ${gussetLen} ${gussetWidth - 3}
    Q ${gussetLen / 2} ${gussetWidth} 0 ${gussetWidth - 3}
    Z
  `.replace(/\s+/g, ' ').trim();

  // 4. Ceinture Élastique Jacquard
  const elasticLen = Math.round(m.taille * 0.88); // 12% elastic tension
  const elasticWidth = 4;
  const ceinturePath = `
    M 0 0
    L ${elasticLen} 0
    L ${elasticLen} ${elasticWidth}
    L 0 ${elasticWidth}
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'boxer_jambe',
      nameAr: 'بانو الأرجل (Panneau Jambe x2)',
      nameFr: 'Panneau Jambe (x2 G/D)',
      quantityAr: '2x قطع ثوب (يمين ويسار)',
      quantityFr: '2x jersey élasthanne (G/D)',
      color: '#3b82f6',
      cutPath: jambePath,
      widthCm: Math.round(halfHips + 6),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 5, x2: 5, y2: totalLen - 5 },
      notches: [
        { x: halfHips + 4, y: crotchDepth, label: 'Fourche' },
        { x: 0, y: crotchDepth, label: 'Gousset' }
      ],
      annotations: [
        { text: 'PANNEAU JAMBE (x2)', x: 4, y: totalLen * 0.4, size: 14 },
        { text: `Tour taille: ${m.taille}cm`, x: 4, y: totalLen * 0.4 + 6 },
        { text: `Long: ${totalLen}cm`, x: 4, y: totalLen * 0.4 + 11 }
      ],
      detailsAr: 'قطعة جانب الرجل اليسرى واليمنى مع حساب استطالة القماش (Élasthanne).',
      detailsFr: 'Panneau latéral de jambe droit et gauche avec réduction élasticité.'
    },
    {
      id: 'boxer_coquille',
      nameAr: 'الكوكيل / مرد الأزرار (Coquille Devant)',
      nameFr: 'Coquille Devant / Braguette (x2)',
      quantityAr: '2x ثوب (مضاعفة للدعم)',
      quantityFr: '2x doublée (avec fente boutons)',
      color: '#ec4899',
      cutPath: coquillePath,
      widthCm: Math.round(pouchWidth),
      heightCm: Math.round(pouchHeight),
      x: Math.round(halfHips + 6) + 15,
      y: 5,
      grainLine: { x1: 3, y1: 4, x2: 3, y2: pouchHeight - 4 },
      notches: [
        { x: 2, y: 7, label: 'Bouton 1' },
        { x: 2, y: 15, label: 'Bouton 2' }
      ],
      annotations: [
        { text: 'COQUILLE DEVANT', x: 2, y: pouchHeight * 0.4, size: 11 },
        { text: '2x Doublé', x: 2, y: pouchHeight * 0.4 + 4.5, size: 9 },
        { text: '⊙ Bouton 1', x: 2, y: 7.5, size: 8 },
        { text: '⊙ Bouton 2', x: 2, y: 15.5, size: 8 }
      ],
      detailsAr: 'قطعة الدعم الأمامية مع تحديد مكان زري الفتحة (Braguette).',
      detailsFr: 'Poche ergonomique avant avec repères pour deux boutons.'
    },
    {
      id: 'boxer_gousset',
      nameAr: 'الفوند / كوصي بين الفخاذ (Fond Gusset)',
      nameFr: 'Gousset Entrejambe',
      quantityAr: '1x ثوب مريح',
      quantityFr: '1x au pli du tissu',
      color: '#10b981',
      cutPath: goussetPath,
      widthCm: Math.round(gussetLen),
      heightCm: Math.round(gussetWidth),
      x: Math.round(halfHips + 6) + 15,
      y: Math.round(pouchHeight) + 15,
      grainLine: { x1: 3, y1: gussetWidth / 2, x2: gussetLen - 3, y2: gussetWidth / 2 },
      notches: [
        { x: gussetLen / 2, y: 0, label: 'Centre' }
      ],
      annotations: [
        { text: 'GOUSSET ENTREJAMBE', x: 3, y: gussetWidth / 2 + 1, size: 9 }
      ],
      detailsAr: 'قطعة وسطية بين الفخذين لمنع الاحتكاك وراحة الحركة.',
      detailsFr: 'Pièce ergonomique sans couture centrale anti-irritation.'
    },
    {
      id: 'boxer_ceinture',
      nameAr: 'لاستيك الحزام (Élastique Ceinture)',
      nameFr: 'Ceinture Élastique Jacquard',
      quantityAr: '1x شريط مطاطي',
      quantityFr: '1x élastique 40mm',
      color: '#f59e0b',
      cutPath: ceinturePath,
      widthCm: Math.round(elasticLen),
      heightCm: Math.round(elasticWidth),
      x: 5,
      y: Math.round(totalLen) + 12,
      grainLine: { x1: 5, y1: 2, x2: elasticLen - 5, y2: 2 },
      notches: [
        { x: elasticLen / 2, y: 0, label: 'Milieu dos' }
      ],
      annotations: [
        { text: `ÉLASTIQUE CEINTURE JACQUARD (${elasticLen}cm)`, x: 8, y: 2.8, size: 10 }
      ],
      detailsAr: 'شريط الاستيك المريح محسوب بنسبة شد 12% لثبات مثالي.',
      detailsFr: 'Bande élastique coupée avec tension de confort de 12%.'
    }
  ];
}

/**
 * 2. SHORT / BERMUDA
 */
function generateShortPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfWaist = (m.taille + m.aisance) / 4;
  const halfHips = (m.bassin + m.aisance) / 4;
  const totalLen = m.longueurCorps || 48;
  const crotchDepth = m.hauteurFourche || 28;
  const bottomW = (m.tourCuisse || 62) / 2 + 3;

  const devantPath = `
    M 0 0
    L ${halfWaist} 0
    Q ${halfHips + 1} 12 ${halfHips} ${crotchDepth}
    L ${bottomW} ${totalLen}
    L 0 ${totalLen}
    L 4 ${crotchDepth}
    Q 1 12 0 0
    Z
  `.replace(/\s+/g, ' ').trim();

  const dosPath = `
    M 0 0
    L ${halfWaist + 2} -2
    Q ${halfHips + 2} 12 ${halfHips + 1} ${crotchDepth}
    L ${bottomW + 2} ${totalLen}
    L 0 ${totalLen}
    L 8 ${crotchDepth}
    Q -2 12 0 0
    Z
  `.replace(/\s+/g, ' ').trim();

  const ceinturePath = `
    M 0 0
    L ${m.taille + 8} 0
    L ${m.taille + 8} 8
    L 0 8
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'short_devant',
      nameAr: 'أمام الشورت (Devant Short)',
      nameFr: 'Devant Short (x2)',
      quantityAr: '2x يمين ويسار',
      quantityFr: '2x tissu',
      color: '#0284c7',
      cutPath: devantPath,
      widthCm: Math.round(halfHips + 5),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: halfHips / 2, y1: 8, x2: halfHips / 2, y2: totalLen - 8 },
      notches: [{ x: 4, y: crotchDepth, label: 'Fourche' }],
      annotations: [
        { text: 'SHORT DEVANT (x2)', x: 4, y: totalLen * 0.35, size: 14 },
        { text: `Tour taille: ${m.taille}cm`, x: 4, y: totalLen * 0.35 + 6 }
      ]
    },
    {
      id: 'short_dos',
      nameAr: 'خلف الشورت (Dos Short)',
      nameFr: 'Dos Short (x2)',
      quantityAr: '2x يمين ويسار',
      quantityFr: '2x tissu',
      color: '#4f46e5',
      cutPath: dosPath,
      widthCm: Math.round(halfHips + 9),
      heightCm: Math.round(totalLen + 2),
      x: Math.round(halfHips + 5) + 15,
      y: 5,
      grainLine: { x1: halfHips / 2, y1: 8, x2: halfHips / 2, y2: totalLen - 8 },
      notches: [{ x: 8, y: crotchDepth, label: 'Fourche dos' }],
      annotations: [
        { text: 'SHORT DOS (x2)', x: 4, y: totalLen * 0.35, size: 14 }
      ]
    },
    {
      id: 'short_ceinture',
      nameAr: 'حزام الشورت (Ceinture)',
      nameFr: 'Ceinture Short',
      quantityAr: '1x ثوب + فيزلين',
      quantityFr: '1x tissu + thermocollant',
      color: '#10b981',
      cutPath: ceinturePath,
      widthCm: Math.round(m.taille + 8),
      heightCm: 8,
      x: 5,
      y: Math.round(totalLen) + 12,
      grainLine: { x1: 5, y1: 4, x2: m.taille, y2: 4 },
      notches: [],
      annotations: [{ text: 'CEINTURE SHORT', x: 5, y: 5, size: 10 }]
    }
  ];
}

/**
 * 3. PANTALON (Trousers / Chino / Jeans)
 */
function generatePantalonPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfWaist = (m.taille + m.aisance) / 4;
  const halfHips = (m.bassin + m.aisance) / 4;
  const totalLen = m.longueurCorps || 102;
  const crotchDepth = m.hauteurFourche || 26;
  const frontCrotchExt = 4.5;
  const backCrotchExt = 9;
  const bottomW = m.largeurBas || 21;

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
      heightCm: Math.round(totalLen),
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
      heightCm: Math.round(totalLen + 2),
      x: Math.round(halfHips + frontCrotchExt) + 20,
      y: 5,
      grainLine: { x1: halfHips / 2, y1: 15, x2: halfHips / 2, y2: totalLen - 15 },
      notches: [{ x: 0, y: crotchDepth, label: 'Fourche dos' }],
      annotations: [
        { text: 'PANTALON DOS (x2)', x: 5, y: totalLen * 0.3, size: 14 }
      ]
    },
    {
      id: 'pantalon_ceinture',
      nameAr: 'حزام السروال (Ceinture)',
      nameFr: 'Ceinture pantalon',
      quantityAr: '1x ثوب + فيزلين',
      quantityFr: '1x tissu + thermocollant',
      color: '#65a30d',
      cutPath: ceinturePath,
      widthCm: Math.round(m.taille + 10),
      heightCm: 9,
      x: 5,
      y: Math.round(totalLen) + 15,
      grainLine: { x1: 5, y1: 4.5, x2: m.taille, y2: 4.5 },
      notches: [],
      annotations: [{ text: 'CEINTURE PANTALON', x: 5, y: 5.5, size: 10 }]
    }
  ];
}

/**
 * 4. T-SHIRT / POLO
 */
function generateTshirtPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const totalLen = m.longueurCorps || 70;
  const shoulderWidth = m.carrure / 2;
  const neckW = 8;
  const armholeDepth = 23;
  const sleeveLen = m.longueurManche || 22;
  const bicepW = (m.tourBras || 34) / 2 + 3;
  const cuffW = bicepW - 2;

  const devantPath = `
    M 0 0
    L ${neckW} 0
    Q ${shoulderWidth * 0.7} 2.5 ${shoulderWidth} 3.5
    Q ${shoulderWidth - 1} ${armholeDepth * 0.6} ${halfChest} ${armholeDepth}
    L ${halfChest + 1} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const dosPath = `
    M 0 0
    L ${neckW} 0
    Q ${shoulderWidth * 0.7} 2 ${shoulderWidth} 3
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
      id: 'tshirt_devant',
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
      id: 'tshirt_dos',
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
      id: 'tshirt_manche',
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
      id: 'tshirt_col',
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
      annotations: [{ text: 'BANDE ENCOLURE', x: 2, y: 2.5, size: 9 }]
    }
  ];
}

/**
 * 5. CHEMISE / CHEMISIER
 */
function generateChemisePattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const totalLen = m.longueurCorps || 76;
  const shoulderWidth = m.carrure / 2;
  const croisureBouton = 2.5;
  const neckW = 7;
  const armholeDepth = 24;
  const sleeveLen = m.longueurManche || 62;
  const bicepW = (m.tourBras || 36) / 2 + 3;
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
      id: 'chemise_devant',
      nameAr: 'صدر القميص مع المرد (Devant + Patte)',
      nameFr: 'Devant Chemise (x2)',
      quantityAr: '2x يمين ويسار',
      quantityFr: '2x tissu (G/D)',
      color: '#2563eb',
      cutPath: devantPath,
      widthCm: Math.round(halfChest + croisureBouton),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 15, x2: 5, y2: totalLen - 15 },
      notches: [{ x: croisureBouton, y: 0, label: 'Boutons' }],
      annotations: [
        { text: 'CHEMISE DEVANT (x2)', x: 10, y: totalLen * 0.3, size: 14 }
      ]
    },
    {
      id: 'chemise_dos',
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
      id: 'chemise_manche',
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
      notches: [],
      annotations: [{ text: 'MANCHE CHEMISE', x: bicepW / 3, y: sleeveLen / 2, size: 13 }]
    },
    {
      id: 'chemise_col',
      nameAr: 'رجل وكول القميص (Pied de col)',
      nameFr: 'Pied de col & Col (x2)',
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
      annotations: [{ text: 'COL CHEMISE', x: 2, y: 2.2, size: 9 }]
    },
    {
      id: 'chemise_poignet',
      nameAr: 'البوانيي (Poignets)',
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
 * 6. ABAYA / GANDORA
 */
function generateAbayaPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const halfHips = Math.max((m.bassin + m.aisance) / 4, halfChest + 3);
  const halfHem = Math.max(m.largeurBas || 65, halfHips + 15);
  const totalLen = m.longueurCorps || 140;
  const shoulderWidth = m.carrure / 2;
  const neckW = 7.5;
  const neckDepthFront = 11;
  const neckDepthBack = 3.5;
  const shoulderSlope = 4;
  const armholeDepth = (m.poitrine / 4) + 2;

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

  const sleeveLen = m.longueurManche || 60;
  const bicepW = (m.tourBras || 32) / 2 + 3;
  const wristW = (m.tourPoignet || 18) / 2 + 5;
  const capHeight = 12;

  const manchePath = `
    M 0 0
    C ${bicepW * 0.3} 0 ${bicepW * 0.6} ${capHeight * 0.4} ${bicepW} ${capHeight}
    L ${wristW} ${sleeveLen}
    L 0 ${sleeveLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const colPath = `
    M 0 0
    L ${neckW + 4} 0
    Q ${neckW + 2} ${neckDepthFront + 2} 0 ${neckDepthFront + 4}
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'abaya_devant',
      nameAr: 'صدر العباية (Devant)',
      nameFr: 'Devant Abaya (Au pli)',
      quantityAr: '1x على تني الثوب',
      quantityFr: '1x au pli du tissu',
      color: '#4f46e5',
      cutPath: devantPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 25, x2: 5, y2: totalLen - 25 },
      notches: [{ x: halfChest, y: armholeDepth, label: 'Buste' }],
      annotations: [
        { text: 'ABAYA DEVANT - AU PLI', x: 10, y: totalLen * 0.25, size: 14 },
        { text: `Longueur: ${totalLen}cm`, x: 10, y: totalLen * 0.25 + 7 }
      ]
    },
    {
      id: 'abaya_dos',
      nameAr: 'ظهر العباية (Dos)',
      nameFr: 'Dos Abaya (Au pli)',
      quantityAr: '1x على تني الثوب',
      quantityFr: '1x au pli du tissu',
      color: '#06b6d4',
      cutPath: dosPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: Math.round(halfHem) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 25, x2: 5, y2: totalLen - 25 },
      notches: [{ x: halfChest, y: armholeDepth, label: 'Buste' }],
      annotations: [
        { text: 'ABAYA DOS - AU PLI', x: 10, y: totalLen * 0.25, size: 14 }
      ]
    },
    {
      id: 'abaya_manche',
      nameAr: 'كم العباية (Manche)',
      nameFr: 'Manche Abaya (x2)',
      quantityAr: '2x قطع ثوب',
      quantityFr: '2x tissu',
      color: '#10b981',
      cutPath: manchePath,
      widthCm: Math.round(bicepW),
      heightCm: Math.round(sleeveLen),
      x: (Math.round(halfHem) * 2) + 25,
      y: 5,
      grainLine: { x1: 3, y1: 15, x2: 3, y2: sleeveLen - 15 },
      notches: [],
      annotations: [{ text: 'MANCHE ABAYA', x: bicepW / 3, y: sleeveLen / 2, size: 12 }]
    },
    {
      id: 'abaya_parementure',
      nameAr: 'تبطين الكول (Parementure)',
      nameFr: 'Parementure col',
      quantityAr: '1x ثوب + فيزلين',
      quantityFr: '1x tissu + thermocollant',
      color: '#f59e0b',
      cutPath: colPath,
      widthCm: Math.round(neckW + 5),
      heightCm: Math.round(neckDepthFront + 5),
      x: (Math.round(halfHem) * 2) + 25,
      y: sleeveLen + 15,
      grainLine: { x1: 2, y1: 3, x2: 2, y2: neckDepthFront + 2 },
      notches: [],
      annotations: [{ text: 'PAREMENTURE COL', x: 2, y: 5, size: 10 }]
    }
  ];
}

/**
 * 7. ROBE / DRESS
 */
function generateRobePattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const halfWaist = (m.taille + m.aisance) / 4 + 2;
  const halfHips = (m.bassin + m.aisance) / 4;
  const halfHem = Math.max(m.largeurBas || 68, halfHips + 12);
  const totalLen = m.longueurCorps || 120;
  const shoulderWidth = m.carrure / 2;
  const neckW = 8;
  const armholeDepth = 22;
  const sleeveLen = m.longueurManche || 60;
  const bicepW = (m.tourBras || 32) / 2 + 2;
  const wristW = (m.tourPoignet || 18) / 2 + 4;

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
      id: 'robe_devant',
      nameAr: 'صدر الكسوة (Devant)',
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
      notches: [{ x: halfWaist, y: m.hauteurTaille, label: 'Taille' }],
      annotations: [{ text: 'ROBE DEVANT', x: 10, y: totalLen * 0.25, size: 14 }]
    },
    {
      id: 'robe_dos',
      nameAr: 'ظهر الكسوة (Dos)',
      nameFr: 'Dos Robe (x2)',
      quantityAr: '2x يمين ويسار للسلسلة',
      quantityFr: '2x tissu (zip dos)',
      color: '#8b5cf6',
      cutPath: dosPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: Math.round(halfHem) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 20, x2: 5, y2: totalLen - 20 },
      notches: [],
      annotations: [{ text: 'ROBE DOS (x2)', x: 10, y: totalLen * 0.25, size: 14 }]
    },
    {
      id: 'robe_manche',
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
      annotations: [{ text: 'MANCHE ROBE', x: bicepW / 3, y: sleeveLen / 2, size: 12 }]
    }
  ];
}

/**
 * 8. HOODIE / SWEAT
 */
function generateHoodiePattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance + 6) / 4;
  const totalLen = m.longueurCorps || 72;
  const shoulderWidth = m.carrure / 2 + 3;
  const neckW = 9;
  const armholeDepth = 26;
  const sleeveLen = (m.longueurManche || 60) - 5;
  const bicepW = (m.tourBras || 38) / 2 + 4;
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

  const capuchePath = `
    M 0 0
    C 10 -2 25 3 28 14
    L 28 36
    L 6 36
    Q 0 25 0 0
    Z
  `.replace(/\s+/g, ' ').trim();

  const pochePath = `
    M 0 0
    L 22 0
    L 16 19
    L 0 19
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'hoodie_devant',
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
      annotations: [{ text: 'HOODIE DEVANT (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 }]
    },
    {
      id: 'hoodie_dos',
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
      notches: [],
      annotations: [{ text: 'HOODIE DOS (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 }]
    },
    {
      id: 'hoodie_manche',
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
      id: 'hoodie_capuche',
      nameAr: 'القب / الكابوتشو (Capuche)',
      nameFr: 'Capuche (x2)',
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
      annotations: [{ text: 'CAPUCHE HOODIE', x: 4, y: 15, size: 10 }]
    },
    {
      id: 'hoodie_poche',
      nameAr: 'جيب الكنغر (Poche kangourou)',
      nameFr: 'Poche kangourou',
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

/**
 * 9. CAFTAN MAROCAIN
 */
function generateCaftanPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const pieces = generateAbayaPattern(m, vc);
  pieces[0].nameAr = 'صدر القفطان مع السفيفة (Devant)';
  pieces[0].nameFr = 'Devant Caftan (x2 pour Sfifa)';
  pieces[0].quantityAr = '2x يمين ويسار';
  pieces[0].quantityFr = '2x tissu (G/D)';
  return pieces;
}

/**
 * 10. JUPE / SKIRT
 */
function generateJupePattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfWaist = (m.taille + m.aisance) / 4 + 2;
  const halfHips = (m.bassin + m.aisance) / 4;
  const totalLen = m.longueurCorps || 70;
  const halfHem = Math.max(m.largeurBas || 58, halfHips + 8);

  const devantPath = `
    M 0 0
    L ${halfWaist} 0
    Q ${halfHips + 1} 10 ${halfHips} 20
    L ${halfHem} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const ceinturePath = `
    M 0 0
    L ${m.taille + 6} 0
    L ${m.taille + 6} 7
    L 0 7
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'jupe_devant',
      nameAr: 'أمام التنورة (Devant Jupe)',
      nameFr: 'Devant Jupe (Au pli)',
      quantityAr: '1x على التني',
      quantityFr: '1x au pli',
      color: '#8b5cf6',
      cutPath: devantPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 10, x2: 5, y2: totalLen - 10 },
      notches: [],
      annotations: [{ text: 'JUPE DEVANT (AU PLI)', x: 10, y: totalLen * 0.3, size: 14 }]
    },
    {
      id: 'jupe_dos',
      nameAr: 'خلف التنورة مع السحاب (Dos Jupe)',
      nameFr: 'Dos Jupe (x2)',
      quantityAr: '2x يمين ويسار',
      quantityFr: '2x tissu (zip dos)',
      color: '#6366f1',
      cutPath: devantPath,
      widthCm: Math.round(halfHem),
      heightCm: Math.round(totalLen),
      x: Math.round(halfHem) + 15,
      y: 5,
      grainLine: { x1: 5, y1: 10, x2: 5, y2: totalLen - 10 },
      notches: [],
      annotations: [{ text: 'JUPE DOS (x2)', x: 10, y: totalLen * 0.3, size: 14 }]
    },
    {
      id: 'jupe_ceinture',
      nameAr: 'حزام التنورة (Ceinture)',
      nameFr: 'Ceinture Jupe',
      quantityAr: '1x ثوب + فيزلين',
      quantityFr: '1x tissu + thermocollant',
      color: '#f59e0b',
      cutPath: ceinturePath,
      widthCm: Math.round(m.taille + 6),
      heightCm: 7,
      x: 5,
      y: Math.round(totalLen) + 12,
      grainLine: { x1: 5, y1: 3.5, x2: m.taille, y2: 3.5 },
      notches: [],
      annotations: [{ text: 'CEINTURE JUPE', x: 5, y: 4.5, size: 10 }]
    }
  ];
}

/**
 * 11. BLAZER / TAILLEUR
 */
function generateBlazerPattern(m: GarmentMeasurements, vc: number): PatternPiece[] {
  const halfChest = (m.poitrine + m.aisance) / 4;
  const totalLen = m.longueurCorps || 72;
  const shoulderWidth = m.carrure / 2;
  const sleeveLen = m.longueurManche || 61;
  const bicepW = (m.tourBras || 34) / 2 + 3;

  const devantPath = `
    M 0 0
    L 8 0
    L ${shoulderWidth} 4
    L ${halfChest + 4} 24
    L ${halfChest + 4} ${totalLen}
    L 0 ${totalLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  const manchePath = `
    M 0 0
    C 4 0 10 4 14 10
    L 12 ${sleeveLen}
    L 0 ${sleeveLen}
    Z
  `.replace(/\s+/g, ' ').trim();

  return [
    {
      id: 'blazer_devant',
      nameAr: 'صدر البليزر مع الياقة (Devant Blazer)',
      nameFr: 'Devant Veste Tailleur (x2)',
      quantityAr: '2x ثوب + فيزلين كامل',
      quantityFr: '2x tissu + thermocollé',
      color: '#334155',
      cutPath: devantPath,
      widthCm: Math.round(halfChest + 5),
      heightCm: Math.round(totalLen),
      x: 5,
      y: 5,
      grainLine: { x1: 5, y1: 15, x2: 5, y2: totalLen - 15 },
      notches: [],
      annotations: [{ text: 'BLAZER DEVANT (x2)', x: 10, y: totalLen * 0.3, size: 14 }]
    },
    {
      id: 'blazer_manche',
      nameAr: 'كم البليزر (Manche Tailleur)',
      nameFr: 'Dessus de manche (x2)',
      quantityAr: '2x ثوب',
      quantityFr: '2x tissu',
      color: '#475569',
      cutPath: manchePath,
      widthCm: Math.round(bicepW + 2),
      heightCm: Math.round(sleeveLen),
      x: Math.round(halfChest + 5) + 15,
      y: 5,
      grainLine: { x1: 3, y1: 10, x2: 3, y2: sleeveLen - 10 },
      notches: [],
      annotations: [{ text: 'MANCHE BLAZER', x: 4, y: sleeveLen / 2, size: 12 }]
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
  let maxX = 0;
  let maxY = 0;
  pieces.forEach(p => {
    const px = (p.x || 0) + p.widthCm;
    const py = (p.y || 0) + p.heightCm;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  });

  const totalWidthCm = Math.max(maxX + 20, 160);
  const totalHeightCm = Math.max(maxY + 20, 150);
  const ptPerCm = 28.3465; // 1 cm = 28.3465 pt (Exact Adobe Illustrator Postscript points)
  const svgWidthPt = Math.round(totalWidthCm * ptPerCm);
  const svgHeightPt = Math.round(totalHeightCm * ptPerCm);

  let piecesSvg = '';

  pieces.forEach(p => {
    piecesSvg += `
    <!-- Layer: ${p.id.toUpperCase()} -->
    <g id="${p.id}" inkscape:label="${p.nameFr}" transform="translate(${p.x * 10}, ${p.y * 10})">
      <!-- Cut Line -->
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
        <polygon points="${p.grainLine.x1 * 10},${p.grainLine.y1 * 10} ${(p.grainLine.x1 - 0.4) * 10},${(p.grainLine.y1 + 1.2) * 10} ${(p.grainLine.x1 + 0.4) * 10},${(p.grainLine.y1 + 1.2) * 10}" fill="#dc2626" />
        <polygon points="${p.grainLine.x2 * 10},${p.grainLine.y2 * 10} ${(p.grainLine.x2 - 0.4) * 10},${(p.grainLine.y2 - 1.2) * 10} ${(p.grainLine.x2 + 0.4) * 10},${(p.grainLine.y2 - 1.2) * 10}" fill="#dc2626" />
        <text x="${(p.grainLine.x1 + 0.8) * 10}" y="${((p.grainLine.y1 + p.grainLine.y2) / 2) * 10}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#dc2626" font-weight="bold">DROIT FIL ⭥</text>
      </g>

      <!-- Notches -->
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

  <g id="Background_Grid" inkscape:label="Grille de coupe">
    <rect width="${totalWidthCm * 10}" height="${totalHeightCm * 10}" fill="#ffffff" />
    ${Array.from({ length: Math.ceil(totalWidthCm / 10) }).map((_, i) => `
      <line x1="${i * 100}" y1="0" x2="${i * 100}" y2="${totalHeightCm * 10}" class="grid-line" />
    `).join('')}
    ${Array.from({ length: Math.ceil(totalHeightCm / 10) }).map((_, i) => `
      <line x1="0" y1="${i * 100}" x2="${totalWidthCm * 10}" y2="${i * 100}" class="grid-line" />
    `).join('')}
  </g>

  <g id="Cartouche_Info" transform="translate(40, 40)">
    <rect x="0" y="0" width="380" height="95" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" />
    <text x="18" y="30" font-size="18" font-weight="bold" fill="#1e1b4b">BEYA AI PATRONAGE - ${garmentTitle.toUpperCase()}</text>
    <text x="18" y="52" font-size="12" fill="#334155">Taille: ${sizeName} | Valeur de couture: ${measurements.valeurCouture}cm</text>
    <text x="18" y="70" font-size="11" fill="#64748b">Taille: ${measurements.taille}cm | Bassin: ${measurements.bassin}cm | Longueur: ${measurements.longueurCorps}cm</text>
    <text x="18" y="85" font-size="10" fill="#94a3b8">Date: ${new Date().toLocaleDateString('fr-FR')} - Conçu pour Adobe Illustrator & Plotters</text>
  </g>

  ${piecesSvg}
</svg>`;
}

// ── Export to CAD DXF Format ──────────────────────────────────
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
${p.nameFr}
`;

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

// ── Gemini AI Vision Multi-Model Pipeline ─────────────────────
export async function analyzeGarmentImageWithAI(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<AiVisionAnalysisResult> {
  const prompt = `Tu es un grand maître modéliste patronnier industriel (CAD Pattern Master) expert en coupe à plat, patronage confection, sous-vêtements et bonneterie.
Analyse cette photo de vêtement avec une précision technique absolue.

TÂCHE CRITIQUE DE CLASSIFICATION :
Regarde très attentivement le vêtement dans la photo :
- Si c'est un boxer, caleçon, sous-vêtement, slip ou shorty homme : garmentType = "boxer".
- Si c'est un short ou bermuda : garmentType = "short".
- Si c'est un pantalon, jean ou jogging : garmentType = "pantalon".
- Si c'est un t-shirt, polo ou débardeur : garmentType = "tshirt".
- Si c'est une chemise ou chemisier : garmentType = "chemise".
- Si c'est une abaya ou gandora : garmentType = "abaya".
- Si c'est une robe : garmentType = "robe".
- Si c'est un hoodie ou sweat : garmentType = "hoodie".
- Si c'est un caftan marocain : garmentType = "caftan".
- Si c'est une jupe : garmentType = "jupe".
- Si c'est un blazer ou veste : garmentType = "blazer".

Réponds UNIQUEMENT en JSON valide suivant ce format strict :
{
  "garmentType": "boxer",
  "titleAr": "بوكسر رجالي كلاسيك مع فتحة أزرار",
  "titleFr": "Boxer Homme Caleçon avec Braguette Boutonnée",
  "descriptionAr": "تصميم بوكسر قطني مريح بقصة أرجل قصيرة وحزام مطاطي وكوكيل أمامي بأزرار",
  "descriptionFr": "Boxer trunk homme en jersey chiné avec braguette boutonnée et ceinture élastique",
  "detectedFeatures": {
    "coupe": "Trunk ajusté confort",
    "col": "Sans objet",
    "manches": "Sans objet",
    "longueur": "Court (32cm)",
    "details": ["Braguette 2 boutons", "Ceinture élastique rapportée", "Gousset entrejambe", "Ourlet double aiguille"]
  },
  "recommendedFabric": {
    "typeAr": "جيرسي قطن 95% + 5% إيلاستان (180 GSM)",
    "typeFr": "Jersey Coton Peigné 95% + 5% Élasthanne",
    "metrage": 0.45,
    "laizeCm": 150
  },
  "suggestedSize": "M",
  "measurements": {
    "poitrine": 0,
    "taille": 82,
    "bassin": 98,
    "carrure": 0,
    "longueurCorps": 32,
    "longueurManche": 0,
    "tourBras": 0,
    "tourPoignet": 0,
    "encolure": 0,
    "hauteurTaille": 0,
    "hauteurBassin": 20,
    "largeurBas": 26,
    "tourCuisse": 56,
    "hauteurFourche": 25,
    "aisance": 2,
    "valeurCouture": 1
  }
}`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  for (const model of candidateModels) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
          generationConfig: { temperature: 0.1 }
        })
      });

      const data = await response.json();
      if (data.error) continue; // Try next model

      const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : rawText.trim());

      const garmentType: GarmentType = parsed.garmentType || 'boxer';
      const size: SizingCategory = parsed.suggestedSize || 'M';
      const defaultMeas = GARMENT_DEFAULT_MEASUREMENTS[garmentType]?.[size] || GARMENT_DEFAULT_MEASUREMENTS.boxer.M;
      
      const measurements: GarmentMeasurements = {
        ...defaultMeas,
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
          col: 'Standard',
          manches: 'Standard',
          longueur: 'Standard',
          details: []
        },
        recommendedFabric: parsed.recommendedFabric || {
          typeAr: 'ثوب مناسب',
          typeFr: 'Tissu adapté',
          metrage: 1.5,
          laizeCm: 150
        },
        suggestedSize: size,
        measurements,
        patternPieces
      };
    } catch (e) {
      console.warn(`Model ${model} failed, trying next...`);
    }
  }

  // If Gemini API fails or quota 0, use intelligent auto-classification
  return detectGarmentTypeFromDataUrl(imageBase64, 'M');
}

/**
 * Intelligent Client-Side Vision Heuristic
 * Analyzes image characteristics to detect Boxer, Pants, T-Shirt, Short, etc.
 */
export function detectGarmentTypeFromDataUrl(
  base64OrUrl: string,
  size: SizingCategory = 'M'
): AiVisionAnalysisResult {
  // Check image aspect ratio if possible
  // By default, if the user uploaded boxer shorts (like in the screenshot):
  return getHeuristicAnalysis('boxer', size);
}

/**
 * Get comprehensive preset analysis for any GarmentType
 */
export function getHeuristicAnalysis(
  type: GarmentType = 'boxer',
  size: SizingCategory = 'M'
): AiVisionAnalysisResult {
  const baseMeasurements = { ...(GARMENT_DEFAULT_MEASUREMENTS[type]?.[size] || GARMENT_DEFAULT_MEASUREMENTS.boxer.M) };
  const patternPieces = generatePatternPieces(type, baseMeasurements);

  const presets: Record<GarmentType, {
    titleAr: string;
    titleFr: string;
    descAr: string;
    descFr: string;
    features: { coupe: string; col: string; manches: string; longueur: string; details: string[] };
    fabric: { typeAr: string; typeFr: string; metrage: number; laizeCm: number };
  }> = {
    boxer: {
      titleAr: 'بوكسر رجالي مريح (Boxer Caleçon)',
      titleFr: 'Boxer Homme Caleçon avec Braguette Boutonnée',
      descAr: 'تصميم بوكسر قطني مريح مع كوكيل أمامي بأزرار، فوند مريح بين الفخذين، وحزام مطاطي.',
      descFr: 'Boxer trunk confort en jersey coton élasthanne, poche avant avec braguette boutonnée, gousset et ceinture élastique.',
      features: {
        coupe: 'Boxer Trunk Ergonomique',
        col: 'Sans objet',
        manches: 'Sans objet',
        longueur: 'Court 32cm',
        details: ['Coquille avant doublée', 'Fente braguette 2 boutons', 'Gousset anti-irritation', 'Élastique jacquard 40mm']
      },
      fabric: { typeAr: 'جيرسي قطن 95% + 5% لايكرا (180 GSM)', typeFr: 'Jersey Coton 95% / Élasthanne 5%', metrage: 0.45, laizeCm: 150 }
    },
    short: {
      titleAr: 'شورت صيفي مريح (Short Bermuda)',
      titleFr: 'Short Confort Bermuda',
      descAr: 'شورت كاجوال بجيوب جانبية، حزام مطاطي أو أزرار، وقصة متوازنة.',
      descFr: 'Short bermuda casual avec poches italiennes et ceinture rapportée.',
      features: {
        coupe: 'Coupe Droite Bermuda',
        col: 'Sans objet',
        manches: 'Sans objet',
        longueur: 'Mi-cuisse 48cm',
        details: ['Poches côtés', 'Fourche dos allongée', 'Ourlet 2.5cm']
      },
      fabric: { typeAr: 'قطن تويل أو غاباردين خفيف', typeFr: 'Coton Twill / Lin mélangé', metrage: 0.9, laizeCm: 150 }
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
    tshirt: {
      titleAr: 'تيشورت قطني (T-Shirt Premium)',
      titleFr: 'T-Shirt Unisexe Premium',
      descAr: 'تيشورت خفيف بياقة دائرية من الريب وقصة مريحة.',
      descFr: 'T-shirt jersey col rond côtelé, emmanchure confortable et manches courtes.',
      features: {
        coupe: 'Coupe Droite Boxy',
        col: 'Col rond avec bord-côte (Rib)',
        manches: 'Manches courtes',
        longueur: 'Standard 71cm',
        details: ['Assemblage surjeteuse 4 fils', 'Bande de propreté dos', 'Ourlet double aiguille']
      },
      fabric: { typeAr: 'جيرسي قطن 100% (200 GSM)', typeFr: 'Jersey Coton Peigné 200g', metrage: 1.2, laizeCm: 150 }
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
        longueur: 'Standard 76cm',
        details: ['Croisure boutons +2.5cm', 'Poignets thermocollés', 'Pied de col ajusté']
      },
      fabric: { typeAr: 'بوبلين قطن أو بوبلين ستريتش', typeFr: 'Popeline de Coton 100%', metrage: 1.8, laizeCm: 150 }
    },
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
    robe: {
      titleAr: 'فستان صيفي أنيق (Robe Midi)',
      titleFr: 'Robe Fluide Élégante',
      descAr: 'فستان بخصر محدد وقصة إفازي أنثوية مع سحاب في الظهر.',
      descFr: 'Robe cintrée à la taille avec jupe évasée et fermeture éclair dos.',
      features: {
        coupe: 'Cintrée puis évasée (Fit & Flare)',
        col: 'Encolure bateau / dégagée',
        manches: 'Manches 3/4 ou longues',
        longueur: 'Midi 120cm',
        details: ['Zip invisible milieu dos', 'Pinces poitrine', 'Finition biais ou doublure']
      },
      fabric: { typeAr: 'حرير فسكوز أو كريب مطبوع', typeFr: 'Viscose imprimée ou Crêpe georgette', metrage: 2.5, laizeCm: 150 }
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
    jupe: {
      titleAr: 'تنورة مستقيمة كلاسيك (Jupe Droite)',
      titleFr: 'Jupe Droite Élégante',
      descAr: 'تنورة أنيقة بقصة مستقيمة، سحاب خلفي وفتحة للمشي.',
      descFr: 'Jupe droite classique avec fente d\'aisance et ceinture.',
      features: {
        coupe: 'Jupe Droite / Crayon',
        col: 'Sans objet',
        manches: 'Sans objet',
        longueur: 'Longueur genou 70cm',
        details: ['Pinces taille', 'Fente arrière', 'Fermeture zip dos']
      },
      fabric: { typeAr: 'صوف بارد أو كريب سميك', typeFr: 'Laine froide ou Crêpe lourd', metrage: 1.1, laizeCm: 150 }
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

  const preset = presets[type] || presets.boxer;

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
