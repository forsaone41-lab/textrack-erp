import { FicheTechnique } from '../types';

export interface AiPreset {
  title: string;
  desc: string;
  aiText: string;
  recommendedPrice: number;
  materialPerPiece: number;
  recommendedDays: number;
  photo?: string;
  stitchingMin?: number;
}

export interface PosteTravail {
  nomAr: string;
  nomFr: string;
  machine: string;
  tempsMin: number;
  roleOuvrier: string;
  excluded?: boolean;
  tempsPro?: number;
  tempsStandard?: number;
  tempsDebutant?: number;
  workerId?: string; // ID of worker selected from RH (allWorkers)
  workerName?: string; // Display name of worker or profile
  tauxHoraire?: number; // Real hourly wage rate in DH/hour (hit la finition katkon taman dialha naqs 3la les machinistes)
}

export interface AtelierRolePreset {
  id: string;
  labelAr: string;
  labelFr: string;
  rate: number; // DH per hour
  category: 'machiniste' | 'finition' | 'repassage' | 'coupe' | 'autre';
}

export const ATELIER_ROLE_PRESETS: AtelierRolePreset[] = [
  { id: 'machiniste_pro', labelAr: '⚡ خياط ماكينة رئيسي (Machiniste Pro)', labelFr: 'Machiniste Pro', rate: 20.00, category: 'machiniste' },
  { id: 'machiniste_std', labelAr: '🧵 خياط ماكينة عادي (Machiniste Std)', labelFr: 'Machiniste Standard', rate: 17.10, category: 'machiniste' },
  { id: 'finition', labelAr: '✂️ عامل(ة) تشطيب وفينيسيون (Finition)', labelFr: 'Finition / Épluchage', rate: 14.50, category: 'finition' },
  { id: 'repassage', labelAr: '💨 كّي وفحص الجودة (Repassage / Contrôle)', labelFr: 'Repassage & Contrôle', rate: 15.50, category: 'repassage' },
  { id: 'coupe', labelAr: '📐 فصالة وباترون (Coupeur Matelas)', labelFr: 'Coupeur & Patronage', rate: 22.00, category: 'coupe' },
  { id: 'aide_debutant', labelAr: '🌱 مساعد / مبتدئ (Aide Atelier)', labelFr: 'Aide / Débutant', rate: 12.50, category: 'autre' },
];

export function getDefaultHourlyRateForPoste(poste: { nomAr?: string; nomFr?: string; machine?: string; roleOuvrier?: string }, fallbackRate = 17.10): number {
  const combined = `${poste.nomAr || ''} ${poste.nomFr || ''} ${poste.machine || ''} ${poste.roleOuvrier || ''}`.toLowerCase();
  if (combined.includes('تشطيب') || combined.includes('تنظيف') || combined.includes('تغليف') || combined.includes('finition') || combined.includes('épluchage')) {
    return 14.50; // La finition coûte moins cher que les machinistes
  }
  if (combined.includes('كي') || combined.includes('كّي') || combined.includes('بخار') || combined.includes('repass') || combined.includes('vapeur')) {
    return 15.50;
  }
  if (combined.includes('فصال') || combined.includes('مطلوة') || combined.includes('coupe') || combined.includes('patron')) {
    return 22.00;
  }
  if (combined.includes('رئيسي') || combined.includes('expert') || combined.includes('pro') || combined.includes('طرز') || combined.includes('broderie')) {
    return 20.00;
  }
  return fallbackRate;
}

export interface TechnicalOperationBreakdown {
  categorie: string;
  tissuType: string;
  consommationMetrage: number;
  prixMetreEstime: number;
  fournituresEstimees: number;
  postesTravail: PosteTravail[];
  totalMinutesConfection: number;
  coutRevientEstime: number;
  prixVenteConseille: number;
  recommandationAtelier: string;
}

export const AI_PRESETS: AiPreset[] = [
  {
    title: '👕 Ensemble تيشرت وشورت صيفي مع زخرفة (Galon)',
    desc: 'تيشرت وشورت صيفي بشريط مزخرف (bande/galon) ستايل شبابي كلاس',
    aiText: 'تحليل تقني دقيق: طقم صيفي بمتوسط خياطة قياسي 22 دقيقة للقطعة. استهلاك القماش واللوازم (Galon) مقدر بـ 18.50 درهم للقطعة.',
    recommendedPrice: 45.00,
    materialPerPiece: 18.50,
    recommendedDays: 2,
    stitchingMin: 22
  },
  {
    title: '👗 عباية مغربية كريب فاخرة مع تطريز سفيفة',
    desc: 'عباية كريب جودة عالية مع سفيفة وعقاد في الصدر والأكمام',
    aiText: 'تحليل تقني دقيق: عباية كريب مع سفيفة وعقاد بمتوسط خياطة قياسي 45 دقيقة للقطعة. استهلاك القماش والتطريز مقدر بـ 55.00 درهم للقطعة.',
    recommendedPrice: 120.00,
    materialPerPiece: 55.00,
    recommendedDays: 3,
    stitchingMin: 45
  },
  {
    title: '🎽 هودي وبنطلون رياضي Over-size (Cotton Fleece)',
    desc: 'طقم رياضي شتوي/خريفي قطن ثقيل بقصة واسعة Over-size',
    aiText: 'تحليل تقني دقيق: طقم قطن Over-size بمتوسط خياطة قياسي 35 دقيقة للقطعة. استهلاك القماش (حوالي 1.8 متر) مقدر بـ 38.00 درهم للقطعة.',
    recommendedPrice: 85.00,
    materialPerPiece: 38.00,
    recommendedDays: 2,
    stitchingMin: 35
  }
];

export const DEFAULT_FICHES_TECHNIQUES: FicheTechnique[] = [
  {
    id: 'ft-101',
    modele: 'Abaya Papillon Royal',
    type: 'Abaya / Robe',
    client: 'Marwa Collection',
    tissuConsommation: 3.2,
    tissuRecommande: 'Soie de Médine / Crêpe',
    description: 'عباية واسعة بقصة فراشة مع تطريز خفيف على الأكمام',
    tailles: ['S', 'M', 'L', 'XL'],
    mesures: [],
    photo: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-07-30'
  },
  {
    id: 'ft-102',
    modele: 'Ensemble Sport Cotton Fleece',
    type: 'Sportswear / Ensemble',
    client: 'Urban Wear MA',
    tissuConsommation: 1.8,
    tissuRecommande: 'Cotton Fleece 320g',
    description: 'هودي وبنطلون رياضي واسع بقصة أوفَرسَايز شتوي',
    tailles: ['M', 'L', 'XL', 'XXL'],
    mesures: [],
    photo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-07-30'
  },
  {
    id: 'ft-103',
    modele: 'Caftan Moderne Jawhara',
    type: 'Caftan / Beldi',
    client: 'Boutique Yasmine',
    tissuConsommation: 3.5,
    tissuRecommande: 'Jawhara Soie + Satin',
    description: 'قفطان جوهرة قطعتين مع سفيفة حرير وعقاد يدوي',
    tailles: ['Standard 38-44'],
    mesures: [],
    photo: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-07-30'
  },
  {
    id: 'ft-104',
    modele: 'T-shirt Basic Premium Over-size',
    type: 'T-shirt / Streetwear',
    client: 'StreetBrand Casa',
    tissuConsommation: 0.85,
    tissuRecommande: '100% Coton Combed 240g',
    description: 'تيشرت قطن ممتاز بوزن ثقيل وياقة دائرية مدعمة',
    tailles: ['S', 'M', 'L', 'XL'],
    mesures: [],
    photo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-07-30'
  },
  {
    id: 'ft-105',
    modele: 'Pantalon Cargo Multi-Poches',
    type: 'Pantalon / Casual',
    client: 'Atlas Fashion',
    tissuConsommation: 1.4,
    tissuRecommande: 'Gabardine Coton / Lycra',
    description: 'بنطلون كارجو بـ 6 جيوب مع خياطة مزدوجة وقصة مريحة',
    tailles: ['38', '40', '42', '44', '46'],
    mesures: [],
    photo: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-07-30'
  }
];

export const getGarmentTechnicalBreakdown = (
  itemNameOrDesc: string,
  customConsommation?: number,
  customPrice?: number,
  categoryOverride?: string
): TechnicalOperationBreakdown => {
  const text = (itemNameOrDesc || '').toLowerCase();
  let catKey = categoryOverride;
  if (!catKey) {
    if (
      text.includes('3 pièces') || text.includes('3 pieces') || text.includes('3 قطع') || text.includes('3 articles') ||
      text.includes('3 dial') || text.includes('3dial') || text.includes('trois') || text.includes('3articles') ||
      ((text.includes('manteau') || text.includes('veste') || text.includes('gilet') || text.includes('cardigan') || text.includes('مانطو') || text.includes('سترة') || text.includes('فيست')) && (text.includes('survet') || text.includes('ensemble') || text.includes('طقم') || text.includes('pantalon') || text.includes('سروال') || text.includes('jogging')))
    ) {
      catKey = 'ensemble_3_pieces';
    } else if (
      text.includes('boxer') ||
      text.includes('caleçon') ||
      text.includes('calecon') ||
      text.includes('calson') ||
      text.includes('sous-vêtement') ||
      text.includes('sous vetement') ||
      text.includes('slip') ||
      text.includes('بوكسر') ||
      text.includes('كالسون') ||
      text.includes('داخلي') ||
      text.includes('ملابس داخلية')
    ) {
      catKey = 'boxer_sous_vetement';
    } else if (
      text.includes('robe_chemise') ||
      text.includes('pliss') ||
      text.includes('بليات') ||
      text.includes('كاروهات') ||
      text.includes('carreaux') ||
      text.includes('tartan') ||
      text.includes('فستان قميص') ||
      (text.includes('robe') && (text.includes('chemise') || text.includes('plis') || text.includes('ceinture')))
    ) {
      catKey = 'robe_chemise';
    } else if (text.includes('abaya') || text.includes('caftan') || text.includes('robe') || text.includes('djellaba') || text.includes('عباية') || text.includes('قفطان') || text.includes('جلابة') || text.includes('فستان') || text.includes('تكشيطة')) {
      catKey = 'abaya_beldi';
    } else if (text.includes('chemise') || text.includes('blouse') || text.includes('قميص') || text.includes('شوميز')) {
      catKey = 'chemise_blouse';
    } else if (text.includes('sport') || text.includes('hoodie') || text.includes('over') || text.includes('survêtement') || text.includes('هودي') || text.includes('رياضي') || text.includes('توني')) {
      catKey = 'sportswear_hoodie';
    } else if (text.includes('veste') || text.includes('manteau') || text.includes('gilet') || text.includes('blazer') || text.includes('جاكيت') || text.includes('معطف') || text.includes('فيست')) {
      catKey = 'veste_manteau';
    } else if (text.includes('shirt') || text.includes('short') || text.includes('t-shirt') || text.includes('polo') || text.includes('تيشرت') || text.includes('بولو') || text.includes('صيفي')) {
      catKey = 'tshirt_summer';
    } else if (text.includes('cargo') || text.includes('pantalon') || text.includes('jean') || text.includes('سروال') || text.includes('بنطلون')) {
      catKey = 'pantalon_cargo';
    } else if (text.includes('sac') || text.includes('sak') || text.includes('tote') || text.includes('صاك') || text.includes('حقيبة')) {
      catKey = 'sac_tote';
    } else {
      catKey = 'default_modele';
    }
  }

  const consommation = customConsommation || (
    catKey === 'robe_chemise' ? 3.8 :
    catKey === 'ensemble_3_pieces' ? 5.2 :
    catKey === 'boxer_sous_vetement' ? 0.35 :
    catKey === 'abaya_beldi' ? 3.2 :
    catKey === 'chemise_blouse' ? 1.5 :
    catKey === 'sportswear_hoodie' ? 1.8 :
    catKey === 'veste_manteau' ? 2.0 :
    catKey === 'tshirt_summer' ? 0.85 :
    catKey === 'pantalon_cargo' ? 1.4 :
    catKey === 'sac_tote' ? 0.6 : 1.5
  );

  const prixMetre = customPrice || (
    catKey === 'robe_chemise' ? 24.0 :
    catKey === 'ensemble_3_pieces' ? 22.0 :
    catKey === 'boxer_sous_vetement' ? 18.0 :
    catKey === 'abaya_beldi' ? 15.0 :
    catKey === 'chemise_blouse' ? 18.0 :
    catKey === 'sportswear_hoodie' ? 18.0 :
    catKey === 'veste_manteau' ? 22.0 :
    catKey === 'tshirt_summer' ? 15.0 :
    catKey === 'pantalon_cargo' ? 17.0 :
    catKey === 'sac_tote' ? 14.0 : 16.0
  );

  let fournitures = 6.0;
  let postes: PosteTravail[] = [];
  let recommendation = '';
  let categorieName = '';
  let tissuName = '';

  if (catKey === 'robe_chemise') {
    categorieName = 'فستان قميص طويل بليات واسع مع حزام (Robe Chemise Plissée)';
    tissuName = 'قماش كاروهات صوف خفيف / كريب تويل ترتان 240g';
    fournitures = 12.0;
    postes = [
      { nomAr: 'فصالة الفستان والأكمام البوفانت بالمطلوة الصناعية', nomFr: 'Coupe Matelas Robe & Manches Bouffantes', machine: 'Table de Coupe / Ciseaux', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 2.8, tempsDebutant: 4.5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'لصق الفيزلين لكول شوميز، بوانيات الأكمام ومرد الأزرار', nomFr: 'Thermocollage Col, Poignets & Patte', machine: 'Presse à Thermocoller', tempsMin: 1.0, tempsPro: 1.0, tempsStandard: 1.8, tempsDebutant: 3.0, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'تكسير وتثبيت بليات التنورة الواسعة بالمكواة البخارية (Plissage)', nomFr: 'Plissage & Fixation Plis Creux Jupe', machine: 'Presse Plisseuse / Fer Vapeur', tempsMin: 2.8, tempsPro: 2.8, tempsStandard: 4.5, tempsDebutant: 7.0, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'تحضير وخياطة كول شوميز مع مرد الأزرار الأمامي', nomFr: 'Montage Col Chemisier & Patte Boutonnée', machine: 'Piqueuse Plate', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.2, tempsDebutant: 6.5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع الصدر مع التنورة البليات وتثبيت عرى الحزام (Passants)', nomFr: 'Montage Buste sur Jupe Plissée & Passants', machine: 'Piqueuse Plate', tempsMin: 2.2, tempsPro: 2.2, tempsStandard: 3.8, tempsDebutant: 6.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع الأكمام البوفانت مع البوانيات وتركيبها على الكتف', nomFr: 'Montage Manches Ballon avec Poignets', machine: 'Piqueuse Plate / Surjeteuse', tempsMin: 2.4, tempsPro: 2.4, tempsStandard: 4.0, tempsDebutant: 6.5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'فتح العيون وتركيب الأزرار الكاملة أمامية وبوانيات', nomFr: 'Boutonnières & Pose Boutons Robe', machine: 'Boutonnière / Pose Bouton', tempsMin: 1.6, tempsPro: 1.6, tempsStandard: 2.6, tempsDebutant: 4.0, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني ذيل التنورة الواسعة، كيّ بالبخار كامل وتغليف', nomFr: 'Ourlet Bas Jupe Évasée, Repassage & Pack', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 2.0, tempsPro: 2.0, tempsStandard: 3.5, tempsDebutant: 5.5, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'فستان قميص طويل أنيق مع بليات وأكمام بوفانت وحزام. استهلاك الثوب 3.80م لتغطية كول شوميز، وسع التنورة والبليات العريضة.';
  } else if (catKey === 'ensemble_3_pieces') {
    categorieName = 'طقم سبوروار 3 قطع (مانطو طويل + سويت + سروال)';
    tissuName = 'مولتون قطن مبطن / إنترلوك 280g (Molleton / Interlock)';
    fournitures = 18.0;
    postes = [
      { nomAr: 'فصالة الطقم الكامل (3 قطع) بالمطلوة الصناعية وتحضير الرزم', nomFr: 'Coupe Matelas 3 Pièces & Paquets', machine: 'Table de Coupe / Ciseaux', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.2, tempsDebutant: 5.5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'لصق الفيزلين للجيوب والسحاب وأطراف المانطو', nomFr: 'Thermocollage Poches, Zip & Revers', machine: 'Presse à Thermocoller', tempsMin: 1.2, tempsPro: 1.2, tempsStandard: 2.2, tempsDebutant: 4.0, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'خياطة وتبطين كابوش المانطو الطويل وتركيب العيون', nomFr: 'Montage Capuche Doublée & Œillets', machine: 'Piqueuse Plate', tempsMin: 2.0, tempsPro: 2.0, tempsStandard: 3.5, tempsDebutant: 6.5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب السحاب الطويل الأمامي للمانطو (Zip séparable)', nomFr: 'Montage Fermeture Éclair Séparable Manteau', machine: 'Piqueuse Plate', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.5, tempsDebutant: 8.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع أكمام وهيكل المانطو مع الفتحات الجانبية', nomFr: 'Assemblage Corps Manteau & Fentes Latérales', machine: 'Surjeteuse 4 Fils', tempsMin: 3.2, tempsPro: 3.2, tempsStandard: 5.5, tempsDebutant: 9.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجميع السويت شيرت الداخلي (أكتاف، أكمام وجوانب)', nomFr: 'Assemblage T-shirt/Sweat (Épaules & Côtés)', machine: 'Surjeteuse 4 Fils', tempsMin: 2.0, tempsPro: 2.0, tempsStandard: 3.5, tempsDebutant: 6.0, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب ياقة السويت شيرت مع شريط النظافة الداخلي', nomFr: 'Pose Col Rond & Bande de Propreté', machine: 'Piqueuse Plate', tempsMin: 1.4, tempsPro: 1.4, tempsStandard: 2.4, tempsDebutant: 4.2, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع ساقي السروال الرياضي (Jogging)', nomFr: 'Assemblage Jambes Jogging (Overlock)', machine: 'Surjeteuse 4 Fils', tempsMin: 2.2, tempsPro: 2.2, tempsStandard: 3.8, tempsDebutant: 6.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'خياطة الجيوب الجانبية الإيطالية للسروال', nomFr: 'Montage Poches Italiennes Jogging', machine: 'Piqueuse Plate', tempsMin: 2.0, tempsPro: 2.0, tempsStandard: 3.5, tempsDebutant: 6.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب حزام الخصر المطاطي مع الكوردون (Ceinture)', nomFr: 'Pose Ceinture Élastiquée avec Cordon', machine: 'Recouvreuse', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.0, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني أطراف المانطو، أساور السويت وأسفل السروال (Ourlets)', nomFr: 'Ourlets & Bord-Côte Manches/Chevilles', machine: 'Recouvreuse', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.2, tempsDebutant: 7.5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'مراقبة الجودة للطقم الكامل، كيّ بالبخار وتغليف ثلاثي', nomFr: 'Contrôle Qualité 3 Pièces, Repassage & Pack', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 2.4, tempsPro: 2.4, tempsStandard: 4.0, tempsDebutant: 6.5, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'طقم متكامل من 3 قطع (مانطو طويل + سويت + سروال). وقت الورشة الإجمالي للحرافيين حوالي 25 دقيقة للطقم الكامل.';
  } else if (catKey === 'boxer_sous_vetement') {
    categorieName = 'بوكسر / ملابس داخلية رجالية (Boxer / Sous-vêtement)';
    tissuName = 'قطن جيرسي ليكرا (Jersey Coton 95% + Élasthanne 5%)';
    fournitures = 3.5;
    postes = [
      { nomAr: 'فصالة ثوب الجيرسي بالمطلوة الصناعية وتحضير الرزم', nomFr: 'Coupe Matelas Jersey & Paquets', machine: 'Table de Coupe / Ciseaux', tempsMin: 0.35, tempsPro: 0.35, tempsStandard: 0.6, tempsDebutant: 1.0, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تجميع وتبطين الجيب الأمامي ومنطقة الحجر (Poche Devant)', nomFr: 'Assemblage Poche Devant & Empiècement', machine: 'Surjeteuse 3/4 Fils', tempsMin: 0.5, tempsPro: 0.5, tempsStandard: 0.8, tempsDebutant: 1.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'خياطة الفتحة الأمامية وتركيب الأزرار (2 أزرار)', nomFr: 'Patte Devant, Boutonnière & Pose 2 Boutons', machine: 'Boutonnière / Pose Bouton', tempsMin: 0.4, tempsPro: 0.4, tempsStandard: 0.7, tempsDebutant: 1.2, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'تجميع الجوانب والظهر ومنطقة الساقين (Entrejambe)', nomFr: 'Assemblage Côtés, Dos & Entrejambe', machine: 'Surjeteuse 3/4 Fils', tempsMin: 0.5, tempsPro: 0.5, tempsStandard: 0.8, tempsDebutant: 1.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب حزام الخصر المطاطي (لاستيك عريض 4 سم)', nomFr: 'Pose Élastique Ceinture (Recouvreuse)', machine: 'Recouvreuse', tempsMin: 0.4, tempsPro: 0.4, tempsStandard: 0.7, tempsDebutant: 1.2, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني أسفل الساقين بخياطة مطاطية مزدوجة (Ourlet)', nomFr: 'Ourlets Bas des Jambes Double Aiguille', machine: 'Recouvreuse', tempsMin: 0.35, tempsPro: 0.35, tempsStandard: 0.6, tempsDebutant: 1.0, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'تنظيف الخيوط، مراقبة الجودة، طيّ وتغليف', nomFr: 'Épluchage, Contrôle Qualité & Emballage', machine: 'Travail Manuel / Contrôle', tempsMin: 0.3, tempsPro: 0.3, tempsStandard: 0.5, tempsDebutant: 0.8, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'موديل البوكسر في مصانع النسيج سريع الإنتاج (~2.8 دقيقة لفريق حرافي). الفصالة تتم بالمطلوة وتجميع السورجي والروكوفروز متسلسل بكفاءة عالية.';
  } else if (catKey === 'chemise_blouse') {
    categorieName = 'قميص / شوميز (Chemise / Blouse)';
    tissuName = 'بوبلين قطن / كريب / أكسفورد (Popeline / Coton)';
    fournitures = 6.5;
    postes = [
      { nomAr: 'فصالة القماش بالمطلوة الصناعية وتحضير الرزم', nomFr: 'Coupe Matelas Chemise & Col/Poignets', machine: 'Table de Coupe / Ciseaux', tempsMin: 0.9, tempsPro: 0.9, tempsStandard: 1.8, tempsDebutant: 3.5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'لصق الفيزلين للياقة، الأساور ومرد الأزرار', nomFr: 'Thermocollage Col, Poignets & Gorge', machine: 'Presse à Thermocoller', tempsMin: 0.8, tempsPro: 0.8, tempsStandard: 1.5, tempsDebutant: 2.5, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'تحضير وخياطة الياقة والأساور (Col & Poignets)', nomFr: 'Préparation & Montage Col et Poignets', machine: 'Piqueuse Plate', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.2, tempsDebutant: 7.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة مرد الأزرار الأمامي والجيب الصدري', nomFr: 'Montage Gorge Boutonnage & Poche Poitrine', machine: 'Piqueuse Plate', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع الأكتاف، الأكمام وإغلاق الجوانب', nomFr: 'Assemblage Épaules, Manches & Côtés', machine: 'Surjeteuse 5 Fils (Safety)', tempsMin: 2.2, tempsPro: 2.2, tempsStandard: 3.8, tempsDebutant: 6.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'فتح العيون وتركيب الأزرار الأمامية والأساور', nomFr: 'Boutonnières & Pose Boutons', machine: 'Boutonnière / Pose Bouton', tempsMin: 1.2, tempsPro: 1.2, tempsStandard: 2.0, tempsDebutant: 3.5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني أسفل القميص، كيّ بالبخار وتغليف', nomFr: 'Ourlet Bas, Repassage & Emballage', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 2.5, tempsDebutant: 4.0, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'توقيت صناعي محترف للقميص (~10.9 دقيقة للبياسة عند الحرافيين). الفصالة محسوبة بالمطلوة والماكينات مجهزة بالمرشدات (Guides).';
  } else if (catKey === 'sac_tote') {
    categorieName = 'حقيبة قماشية / صاك (Sac / Tote Bag)';
    tissuName = 'كانفاس قطن سميك / جينز (Canvas / Gabardine)';
    fournitures = 3.0;
    postes = [
      { nomAr: 'فصالة جسم الحقيبة والأحزمة بالمطلوة الصناعية', nomFr: 'Coupe Matelas Corps & Anses', machine: 'Table de Coupe / Ciseaux', tempsMin: 0.4, tempsPro: 0.4, tempsStandard: 0.8, tempsDebutant: 1.5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'خياطة وتحضير أحزمة الكتف (السمطة)', nomFr: 'Préparation & Piqûre des Anses', machine: 'Piqueuse Plate', tempsMin: 0.8, tempsPro: 0.8, tempsStandard: 1.4, tempsDebutant: 2.2, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع جوانب وقاعدة الحقيبة وسرفلة الداخل', nomFr: 'Assemblage Côtés & Fond (Surjet)', machine: 'Surjeteuse 4/5 Fils', tempsMin: 1.0, tempsPro: 1.0, tempsStandard: 1.8, tempsDebutant: 2.8, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'ثني الفم العلوي وتركيب الأحزمة مع تدعيم الخياطة', nomFr: 'Ourlet Haut & Pose Anses Renforcées', machine: 'Piqueuse Plate / Brideuse', tempsMin: 0.9, tempsPro: 0.9, tempsStandard: 1.6, tempsDebutant: 2.5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تنظيف الخيوط، مراقبة الجودة وتغليف', nomFr: 'Nettoyage, Contrôle & Emballage', machine: 'Travail Manuel / Contrôle', tempsMin: 0.4, tempsPro: 0.4, tempsStandard: 0.7, tempsDebutant: 1.2, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'موديل الصاك سريع الإنتاج جداً (~3.5 دقيقة للبياسة لدى الحرافيين) مع فصالة المطلوة بالجملة.';
  } else if (catKey === 'abaya_beldi') {
    categorieName = 'لباس تقليدي / عباية (Abaya / Beldi)';
    tissuName = 'كريب فاخر / حرير / جوهرة (Crêpe / Soie)';
    fournitures = 7.0;
    postes = [
      { nomAr: 'فصالة القماش بالمطلوة وباترون الأجزاء', nomFr: 'Coupe Matelas Abaya & Tracé', machine: 'Table de Coupe / Ciseaux', tempsMin: 1.2, tempsPro: 1.2, tempsStandard: 2.5, tempsDebutant: 5.0, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'سرفلة وحماية حواف الثوب الفاخر', nomFr: 'Surfilage & Protection', machine: 'Surjeteuse 3/4 Fils', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.2, tempsDebutant: 5.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجميع الهيكل والأكتاف والجوانب', nomFr: 'Assemblage Corps', machine: 'Piqueuse Plate', tempsMin: 3.0, tempsPro: 3.0, tempsStandard: 5.5, tempsDebutant: 9.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة وتثبيت الأكمام', nomFr: 'Montage Manches', machine: 'Piqueuse Plate', tempsMin: 2.2, tempsPro: 2.2, tempsStandard: 4.0, tempsDebutant: 7.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تطريز الصدر والأكمام (طرز / معلم)', nomFr: 'Broderie / Maâlem', machine: 'Machine Broderie / Sfifa', tempsMin: 4.5, tempsPro: 4.5, tempsStandard: 8.0, tempsDebutant: 14.0, roleOuvrier: 'معلم طرز / تطريز' },
      { nomAr: 'تركيب السفيفة والعقاد في الصدر', nomFr: 'Pose Sfifa & Aakad', machine: 'Machine Broderie / Sfifa', tempsMin: 4.0, tempsPro: 4.0, tempsStandard: 7.0, tempsDebutant: 12.0, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني الأطراف السفلى واللمسات النهائية', nomFr: 'Ourlets & Finitions', machine: 'Recouvreuse', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'كّي نهائي، تشطيب وفحص الجودة', nomFr: 'Repassage & Contrôle', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 2.5, tempsDebutant: 4.5, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'العباية تتطلب دقة فالسفيفة والتطريز (~20 دقيقة عند الحرافيين، مقابل 40+ دقيقة عند المبتدئين).';
  } else if (catKey === 'sportswear_hoodie') {
    categorieName = 'لباس رياضي / كاجوال (Sportswear / Hoodie)';
    tissuName = 'قطن ثقيل 320g / Fleece (Coton lourd)';
    fournitures = 5.6;
    postes = [
      { nomAr: 'فصالة القطن الثقيل بالمطلوة الصناعية وتحضير الرزم', nomFr: 'Coupe Matelas Fleece & Paquets', machine: 'Table de Coupe / Ciseaux', tempsMin: 1.0, tempsPro: 1.0, tempsStandard: 2.0, tempsDebutant: 4.0, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تجميع هيكل الهودي وساقي البنطلون', nomFr: 'Assemblage Overlock Corps & Jambes', machine: 'Surjeteuse 3/4 Fils', tempsMin: 3.5, tempsPro: 3.5, tempsStandard: 6.0, tempsDebutant: 11.0, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'خياطة وتبطين القب (الكابيشون)', nomFr: 'Montage Capuche (Hoodie)', machine: 'Piqueuse Plate', tempsMin: 2.2, tempsPro: 2.2, tempsStandard: 3.8, tempsDebutant: 7.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب جيب الكنغر وجيوب البنطلون', nomFr: 'Montage Poche Kangourou & Poches', machine: 'Piqueuse 2 Aiguilles', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.2, tempsDebutant: 8.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب حزام الخصر المطاطي للبنطلون', nomFr: 'Pose Ceinture & Élastique', machine: 'Recouvreuse', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'حبكة وتثبيت الأساور والياقة (بردكوت)', nomFr: 'Finition Bord-Côte', machine: 'Recouvreuse', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 2.5, tempsDebutant: 5.0, roleOuvrier: 'خياطة' },
      { nomAr: 'تنظيف الخيوط والكيّ بالبخار والتغليف', nomFr: 'Repassage, Nettoyage & Emballage', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.2, tempsPro: 1.2, tempsStandard: 2.0, tempsDebutant: 3.5, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'توقيت إنتاج صناعي محترف لطقم الهودي (~13.7 دقيقة للبياسة للحرافيين).';
  } else if (catKey === 'veste_manteau') {
    categorieName = 'جاكيت / فيست شتوي (Veste / Gilet / Manteau)';
    tissuName = 'قماش شتوي / جاباردين / جوخ (Tissu hivernal)';
    fournitures = 12.0;
    postes = [
      { nomAr: 'فصالة القماش والبطانة بالمطلوة الصناعية', nomFr: 'Coupe Matelas Tissu & Doublure', machine: 'Table de Coupe / Ciseaux', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 3.0, tempsDebutant: 6.0, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'لصق الفيزلين وتقوية الأجزاء', nomFr: 'Thermo-collage & Préparation', machine: 'Presse à Thermocoller', tempsMin: 1.2, tempsPro: 1.2, tempsStandard: 2.5, tempsDebutant: 4.5, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'خياطة الجيوب الخارجية والجيب الداخلي', nomFr: 'Montage Poches Extérieures & Passepoil', machine: 'Piqueuse Plate', tempsMin: 3.5, tempsPro: 3.5, tempsStandard: 6.5, tempsDebutant: 12.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب السحاب الأمامي أو الأزرار', nomFr: 'Montage Fermeture Éclair (Zip / Boutons)', machine: 'Piqueuse Plate', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.5, tempsDebutant: 8.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع الهيكل والأكتاف', nomFr: 'Assemblage Corps & Épaules', machine: 'Piqueuse Plate', tempsMin: 3.0, tempsPro: 3.0, tempsStandard: 5.5, tempsDebutant: 10.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب الياقة والـ Revers', nomFr: 'Montage Col & Revers', machine: 'Piqueuse Plate', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.5, tempsDebutant: 8.0, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'تجميع الأكمام مع البطانة وربطها بالهيكل', nomFr: 'Montage Manches & Doublure', machine: 'Surjeteuse 3/4 Fils', tempsMin: 3.5, tempsPro: 3.5, tempsStandard: 6.5, tempsDebutant: 12.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة الزينة الخارجية (Surpiqûre)', nomFr: 'Surpiqûre & Finitions de Bord', machine: 'Piqueuse 2 Aiguilles', tempsMin: 2.0, tempsPro: 2.0, tempsStandard: 3.5, tempsDebutant: 6.5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'كّي بالبخار ومراقبة الجودة نهائية', nomFr: 'Repassage Final & Contrôle Qualité', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.0, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'جاكيت شتوي تقني متقدم (~21.5 دقيقة عند الحرافيين، مقابل 45+ دقيقة عند المبتدئين).';
  } else if (catKey === 'tshirt_summer') {
    categorieName = 'طقم صيفي / تيشرت (T-shirt / Short été)';
    tissuName = 'قطن مُمشط 100% (Coton Combed)';
    fournitures = 5.75;
    postes = [
      { nomAr: 'فصالة التيشرت والشورت بالمطلوة الصناعية وتحضير الرزم', nomFr: 'Coupe Matelas T-shirt & Short', machine: 'Table de Coupe / Ciseaux', tempsMin: 0.7, tempsPro: 0.7, tempsStandard: 1.2, tempsDebutant: 2.5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تجميع صدر وظهر التيشرت والأكمام', nomFr: 'Assemblage T-shirt (Épaules & Côtés)', machine: 'Surjeteuse 3/4 Fils', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجميع الشورت وتركيب مطاط الخصر', nomFr: 'Assemblage Short & Ceinture', machine: 'Surjeteuse 3/4 Fils', tempsMin: 2.0, tempsPro: 2.0, tempsStandard: 3.5, tempsDebutant: 6.0, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب ياقة التيشرت وشريط النظافة', nomFr: 'Pose Col & Bande de Propreté', machine: 'Piqueuse Plate', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 2.5, tempsDebutant: 4.5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'ثني أسفل التيشرت، الأكمام والشورت', nomFr: 'Ourlets Bas T-shirt, Manches & Short', machine: 'Recouvreuse', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.0, roleOuvrier: 'خياطة' },
      { nomAr: 'كيّ سريع، فحص وتغليف', nomFr: 'Repassage Rapide & Triage', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.0, tempsPro: 1.0, tempsStandard: 1.8, tempsDebutant: 3.0, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'طقم صيفي خفيف (~8.8 دقيقة لفريق حرافي متمرس). الإنتاجية تصل إلى 50+ بياسة في الساعة لخط إنتاج 8 عمال.';
  } else if (catKey === 'pantalon_cargo') {
    categorieName = 'سروال / بنطلون كارجو (Pantalon / Cargo)';
    tissuName = 'جاباردين / جينز / قطن (Gabardine / Denim)';
    fournitures = 8.5;
    postes = [
      { nomAr: 'فصالة السروال والجيوب بالمطلوة الصناعية', nomFr: 'Coupe Matelas Gabardine & Poches', machine: 'Table de Coupe / Ciseaux', tempsMin: 0.9, tempsPro: 0.9, tempsStandard: 1.8, tempsDebutant: 3.5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'خياطة الجيوب الأمامية والخلفية', nomFr: 'Montage Poches Avant & Arrière', machine: 'Piqueuse Plate', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.5, tempsDebutant: 7.5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة جيوب الكارجو الجانبية والأغطية', nomFr: 'Montage Poches Cargo Latérales', machine: 'Piqueuse 2 Aiguilles', tempsMin: 3.0, tempsPro: 3.0, tempsStandard: 5.5, tempsDebutant: 9.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع الساقين ومنطقة الحجر', nomFr: 'Assemblage Jambes & Fourche', machine: 'Surjeteuse 5 Fils (Safety)', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.5, tempsDebutant: 8.0, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب حزام الخصر وعرى الحزام (Passants)', nomFr: 'Montage Ceinture & Passants', machine: 'Piqueuse Plate', tempsMin: 2.2, tempsPro: 2.2, tempsStandard: 4.0, tempsDebutant: 7.0, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني أسفل الساق وخياطة الدعم', nomFr: 'Ourlets Bas & Renforts', machine: 'Recouvreuse', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 2.5, tempsDebutant: 4.5, roleOuvrier: 'خياطة' },
      { nomAr: 'كيّ نهائي بالبخار وفحص الجودة', nomFr: 'Repassage & Contrôle Qualité', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.2, tempsPro: 1.2, tempsStandard: 2.0, tempsDebutant: 3.5, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'توقيت صناعي محترف لبنطلون الكارجو (~13.8 دقيقة للبياسة لدى الحرافيين).';
  } else {
    categorieName = 'موديل خياطة عام (Confection Textile)';
    tissuName = 'قماش قياسي (Tissu standard)';
    fournitures = 6.0;
    postes = [
      { nomAr: 'فصالة القماش بالمطلوة الصناعية وتحضير الرزم', nomFr: 'Coupe Matelas Industriel & Paquets', machine: 'Table de Coupe / Ciseaux', tempsMin: 0.8, tempsPro: 0.8, tempsStandard: 1.5, tempsDebutant: 3.0, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'سرفلة وحماية الأطراف', nomFr: 'Surfilage des Bords', machine: 'Surjeteuse 3/4 Fils', tempsMin: 1.8, tempsPro: 1.8, tempsStandard: 3.0, tempsDebutant: 5.5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'خياطة الهيكل وتجميع الأجزاء الرئيسية', nomFr: 'Assemblage Principal', machine: 'Piqueuse Plate', tempsMin: 3.5, tempsPro: 3.5, tempsStandard: 6.0, tempsDebutant: 11.0, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب الياقة، الجيوب أو السحاب', nomFr: 'Montage Accessoires (Col/Poches/Zip)', machine: 'Piqueuse Plate', tempsMin: 2.5, tempsPro: 2.5, tempsStandard: 4.5, tempsDebutant: 7.5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'ثني الأطراف الخارجية والتشطيب', nomFr: 'Ourlets & Finition Extérieure', machine: 'Recouvreuse', tempsMin: 1.5, tempsPro: 1.5, tempsStandard: 2.5, tempsDebutant: 4.5, roleOuvrier: 'خياطة' },
      { nomAr: 'كّي بالبخار ومراقبة الجودة نهائية', nomFr: 'Repassage Vapeur & Contrôle', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 1.2, tempsPro: 1.2, tempsStandard: 2.0, tempsDebutant: 3.5, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'توقيت صناعي قياسي للإنتاج المحترف (~11.3 دقيقة للبياسة لدى الحرافيين، الفصالة بالمطلوة والماكينات بسرعة قياسية).';
  }

  const totalMinutes = postes.reduce((sum, p) => sum + p.tempsMin, 0);
  const totalMatiere = (consommation * prixMetre) + fournitures;
  const modUnit = (totalMinutes / 60) * 17.10;
  const moiUnit = 4.50;
  const coutRevient = totalMatiere + modUnit + moiUnit;
  const prixVente = Math.round((coutRevient * 1.65) * 100) / 100;

  return {
    categorie: categorieName,
    tissuType: tissuName,
    consommationMetrage: consommation,
    prixMetreEstime: prixMetre,
    fournituresEstimees: fournitures,
    postesTravail: postes,
    totalMinutesConfection: totalMinutes,
    coutRevientEstime: coutRevient,
    prixVenteConseille: prixVente,
    recommandationAtelier: recommendation
  };
};

export const estimateFromFiche = (f: FicheTechnique, isAr: boolean): AiPreset => {
  const materialPerPiece = Math.round((f.tissuConsommation || 1.5) * 35 * 100) / 100;
  const isAbayaOrCaftan = (f.type || f.modele || '').toLowerCase().includes('abaya') || (f.type || f.modele || '').toLowerCase().includes('caftan') || (f.type || f.modele || '').toLowerCase().includes('robe');
  const stitchingMin = isAbayaOrCaftan ? 45 : 30;
  return {
    title: `📐 ${f.modele}`,
    desc: f.description || f.type || '',
    aiText: isAr
      ? `تحليل تقني للبطاقة "${f.modele}"${f.client ? ` (${f.client})` : ''}: استهلاك القماش المسجل ${f.tissuConsommation || 1.5} متر للقطعة (${f.tissuRecommande || 'قماش قياسي'}). متوسط وقت الخياطة القياسي مقدر بـ ${stitchingMin} دقيقة للقطعة.`
      : `Analyse technique pour "${f.modele}"${f.client ? ` (${f.client})` : ''} : Consommation de ${f.tissuConsommation || 1.5} m/pièce (${f.tissuRecommande || 'tissu standard'}). Temps de confection standard estimé à ${stitchingMin} min/pièce.`,
    recommendedPrice: Math.round(materialPerPiece * 2.3 * 100) / 100,
    materialPerPiece,
    recommendedDays: 2,
    photo: f.photo,
    stitchingMin
  };
};

/**
 * Smart Parser to convert any pasted Gamme text (Excel TSV, WhatsApp text, Pipe-delimited, or JSON)
 * into a typed array of PosteTravail[].
 */
export function parseGammeText(raw: string): PosteTravail[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // 1. Try parsing JSON
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: any, idx: number) => {
          const name = p.nomAr || p.nomFr || p.poste || p.name || p.operation || `مرحلة ${idx + 1}`;
          const tMin = Number(p.tempsMin || (Number(p.tempsSec) / 60) || 1);
          return {
            nomAr: p.nomAr || name,
            nomFr: p.nomFr || name,
            machine: p.machine || 'Piqueuse Plate',
            tempsMin: Number(tMin.toFixed(2)),
            roleOuvrier: p.roleOuvrier || 'Ouvrier Spécialisé',
            tempsPro: p.tempsPro ? Number(p.tempsPro) : Number(tMin.toFixed(2)),
            tempsStandard: p.tempsStandard ? Number(p.tempsStandard) : Number((tMin * 1.35).toFixed(2)),
            tempsDebutant: p.tempsDebutant ? Number(p.tempsDebutant) : Number((tMin * 2.0).toFixed(2)),
          };
        });
      }
    } catch (_) {
      // not JSON, continue
    }
  }

  // 2. Parse lines
  const lines = trimmed
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('---') && !l.startsWith('المجموع') && !l.startsWith('Total'));

  const results: PosteTravail[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Case A: Tab-separated (Excel copy/paste)
    if (line.includes('\t')) {
      const cols = line.split('\t').map(c => c.trim());
      if (cols.length >= 2) {
        let name = cols[0] || `مرحلة ${i + 1}`;
        let machine = cols[1] || 'Piqueuse Plate';
        let timeStr = cols[2] || '';

        // Check if first column is just a number like "1", "2"
        if (/^\d+$/.test(name) && cols.length >= 3) {
          name = cols[1];
          machine = cols[2];
          timeStr = cols[3] || '';
        }

        let timeMin = 1;
        if (timeStr) {
          const num = parseFloat(timeStr.replace(',', '.').replace(/[^\d.]/g, ''));
          if (!isNaN(num) && num > 0) {
            timeMin = timeStr.toLowerCase().includes('s') || timeStr.toLowerCase().includes('ث') ? num / 60 : num;
          }
        } else {
          const mMatch = machine.match(/(\d+(?:[.,]\d+)?)\s*(min|m|دقيقة|د|sec|s|ثانية|ث)/i);
          if (mMatch) {
            const num = parseFloat(mMatch[1].replace(',', '.'));
            timeMin = mMatch[2].toLowerCase().startsWith('s') || mMatch[2].toLowerCase().startsWith('ث') ? num / 60 : num;
            machine = 'Piqueuse Plate';
          }
        }

        results.push({
          nomAr: name,
          nomFr: name,
          machine,
          tempsMin: Number(timeMin.toFixed(2)),
          roleOuvrier: 'Ouvrier Spécialisé',
          tempsPro: Number(timeMin.toFixed(2)),
          tempsStandard: Number((timeMin * 1.35).toFixed(2)),
          tempsDebutant: Number((timeMin * 2.0).toFixed(2)),
        });
        continue;
      }
    }

    // Case B: Pipe separated (e.g. "1. Assemblage | Piqueuse | 0.5 دقيقة")
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      const rawPoste = parts[0].replace(/^[\d#\.\-\)\s]+/, '').trim() || `مرحلة ${i + 1}`;
      const machine = parts[1] || 'Piqueuse Plate';
      let timeMin = 1;
      if (parts[2]) {
        const num = parseFloat(parts[2].replace(',', '.').replace(/[^\d.]/g, ''));
        if (!isNaN(num) && num > 0) {
          timeMin = parts[2].includes('ثانية') || parts[2].toLowerCase().includes('sec') || parts[2].toLowerCase().includes('s') ? num / 60 : num;
        }
      }
      results.push({
        nomAr: rawPoste,
        nomFr: rawPoste,
        machine,
        tempsMin: Number(timeMin.toFixed(2)),
        roleOuvrier: 'Ouvrier Spécialisé',
        tempsPro: Number(timeMin.toFixed(2)),
        tempsStandard: Number((timeMin * 1.35).toFixed(2)),
        tempsDebutant: Number((timeMin * 2.0).toFixed(2)),
      });
      continue;
    }

    // Case C: Freeform text line (e.g. "سرفلة الجوانب 45 ثانية" or "Piquage poches 1.2 min")
    const cleanLine = line.replace(/^[\d#\.\-\)\s]+/, '').trim();
    if (!cleanLine) continue;

    // Detect time
    let timeMin = 1;
    const timeMatch = cleanLine.match(/(\d+(?:[.,]\d+)?)\s*(min|m|دقيقة|د|sec|s|ثانية|ث)/i);
    if (timeMatch) {
      const num = parseFloat(timeMatch[1].replace(',', '.'));
      const unit = timeMatch[2].toLowerCase();
      if (unit.startsWith('s') || unit.startsWith('ث')) {
        timeMin = num / 60;
      } else {
        timeMin = num;
      }
    }

    // Detect machine
    let machine = 'Piqueuse Plate';
    const lower = cleanLine.toLowerCase();
    if (lower.includes('surjet') || lower.includes('سورجي')) {
      machine = lower.includes('5') ? 'Surjeteuse 5 Fils (Safety)' : 'Surjeteuse 3/4 Fils';
    } else if (lower.includes('recouv') || lower.includes('روكوف') || lower.includes('كوليتور')) {
      machine = 'Recouvreuse';
    } else if (lower.includes('bouton') || lower.includes('صداف') || lower.includes('عراوي')) {
      machine = lower.includes('boutonnière') || lower.includes('عراوي') ? 'Boutonnière' : 'Pose Bouton';
    } else if (lower.includes('repass') || lower.includes('حديد') || lower.includes('بخار') || lower.includes('مصلوح') || lower.includes('vapeur')) {
      machine = 'Fer Vapeur / Table Aspirante';
    } else if (lower.includes('coupe') || lower.includes('فصالة') || lower.includes('ماتلا') || lower.includes('matelas')) {
      machine = 'Table de Coupe / Ciseaux';
    } else if (lower.includes('manuel') || lower.includes('يدوي') || lower.includes('تشطيب') || lower.includes('contrôle') || lower.includes('مراقبة')) {
      machine = 'Travail Manuel / Contrôle';
    } else if (lower.includes('2 aiguille') || lower.includes('2 إبر')) {
      machine = 'Piqueuse 2 Aiguilles';
    }

    // Remove time from name
    const finalPoste = cleanLine
      .replace(/(\d+(?:[.,]\d+)?)\s*(min|m|دقيقة|د|sec|s|ثانية|ث).*/i, '')
      .replace(/[-–—|:]\s*$/, '')
      .trim() || cleanLine;

    results.push({
      nomAr: finalPoste,
      nomFr: finalPoste,
      machine,
      tempsMin: Number(timeMin.toFixed(2)),
      roleOuvrier: 'Ouvrier Spécialisé',
      tempsPro: Number(timeMin.toFixed(2)),
      tempsStandard: Number((timeMin * 1.35).toFixed(2)),
      tempsDebutant: Number((timeMin * 2.0).toFixed(2)),
    });
  }

  return results;
}

/**
 * Format any duration in days into clear, natural Moroccan / French workshop terms.
 * Especially when duration is less than 1 day (< 8h): converts to 2h, 4h (demi-journée), etc.
 */
export function formatDurationHuman(
  daysVal: number,
  isAr: boolean
): { mainText: string; subText: string; totalHours: number; totalMinutes: number; isUnderOneDay: boolean } {
  const safeDays = Math.max(0, Number(daysVal) || 0);
  const totalHours = Number((safeDays * 8).toFixed(2));
  const totalMinutes = Math.round(safeDays * 480);
  const isUnderOneDay = totalHours < 8;

  // Less than 1 hour (e.g. 15min, 30min, 45min)
  if (totalHours < 1) {
    if (totalMinutes <= 0) {
      return {
        mainText: isAr ? '0 دقيقة' : '0 min',
        subText: '0h',
        totalHours: 0,
        totalMinutes: 0,
        isUnderOneDay: true
      };
    }
    const minText = isAr
      ? (totalMinutes === 30 ? 'نصف ساعة (30 د)' : `${totalMinutes} دقيقة`)
      : `${totalMinutes} min`;
    return {
      mainText: minText,
      subText: isAr ? `${totalHours} ساعة` : `${totalHours}h`,
      totalHours,
      totalMinutes,
      isUnderOneDay: true
    };
  }

  // Less than 1 day (< 8 hours)
  if (totalHours < 8) {
    let hourLabel = '';
    if (Math.abs(totalHours - 1) < 0.05) hourLabel = isAr ? 'ساعة واحدة (1h)' : '1 heure';
    else if (Math.abs(totalHours - 2) < 0.05) hourLabel = isAr ? 'ساعتان (2h)' : '2 heures';
    else if (Math.abs(totalHours - 4) < 0.05) hourLabel = isAr ? '4 سوايع (نصف يوم • 4h)' : '4h (demi-journée)';
    else if (Math.abs(totalHours - 3) < 0.05) hourLabel = isAr ? '3 سوايع (3h)' : '3 heures';
    else if (Math.abs(totalHours - 5) < 0.05) hourLabel = isAr ? '5 سوايع (5h)' : '5 heures';
    else if (Math.abs(totalHours - 6) < 0.05) hourLabel = isAr ? '6 سوايع (6h)' : '6 heures';
    else if (Math.abs(totalHours - 7) < 0.05) hourLabel = isAr ? '7 سوايع (7h)' : '7 heures';
    else {
      const hInt = Math.floor(totalHours);
      const mRemain = Math.round((totalHours - hInt) * 60);
      hourLabel = isAr
        ? `${hInt} سوايع ${mRemain > 0 ? `و ${mRemain} د` : ''} (${totalHours}h)`
        : `${hInt}h ${mRemain > 0 ? `${mRemain}m` : ''}`;
    }

    return {
      mainText: hourLabel,
      subText: isAr ? `${safeDays} يوم عمل (8س)` : `${safeDays} j`,
      totalHours,
      totalMinutes,
      isUnderOneDay: true
    };
  }

  // Exactly 1 day (8 hours)
  if (Math.abs(safeDays - 1) < 0.05) {
    return {
      mainText: isAr ? 'نهار واحد (8 سوايع)' : '1 jour (8h)',
      subText: isAr ? '1.0 يوم' : '1.0 j',
      totalHours: 8,
      totalMinutes: 480,
      isUnderOneDay: false
    };
  }

  // Exactly integer days (2, 3, 4, etc.)
  if (Math.abs(safeDays - Math.round(safeDays)) < 0.05) {
    const roundDays = Math.round(safeDays);
    const dayName = isAr
      ? (roundDays === 2 ? 'يومان (16 ساعة)' : `${roundDays} أيام (${roundDays * 8} ساعة)`)
      : `${roundDays} jours (${roundDays * 8}h)`;
    return {
      mainText: dayName,
      subText: `${roundDays} j`,
      totalHours,
      totalMinutes,
      isUnderOneDay: false
    };
  }

  // Fractional days > 1 (e.g. 1.25, 1.5, 2.5)
  const wholeDays = Math.floor(safeDays);
  const fracHours = Number(((safeDays - wholeDays) * 8).toFixed(1));
  let fracDesc = '';
  if (isAr) {
    const dayWord = wholeDays === 1 ? 'نهار' : wholeDays === 2 ? 'يومان' : `${wholeDays} أيام`;
    if (Math.abs(fracHours - 4) < 0.2) {
      fracDesc = `${dayWord} ونصف (نصف نهار)`;
    } else if (Math.abs(fracHours - 2) < 0.2) {
      fracDesc = `${dayWord} و ساعتان (2h)`;
    } else if (Math.abs(fracHours - 1) < 0.2) {
      fracDesc = `${dayWord} و ساعة واحدة`;
    } else {
      fracDesc = `${dayWord} و ${fracHours} سوايع`;
    }
  } else {
    fracDesc = `${wholeDays}j et ${fracHours}h`;
  }

  return {
    mainText: fracDesc,
    subText: isAr ? `${safeDays} يوم • ${totalHours}h` : `${safeDays} j • ${totalHours}h`,
    totalHours,
    totalMinutes,
    isUnderOneDay: false
  };
}


