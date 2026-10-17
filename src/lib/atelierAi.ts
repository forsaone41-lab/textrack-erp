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

  if (catKey === 'boxer_sous_vetement') {
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
