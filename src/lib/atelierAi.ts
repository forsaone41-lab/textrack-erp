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
    if (text.includes('abaya') || text.includes('caftan') || text.includes('robe') || text.includes('عباية') || text.includes('قفطان')) {
      catKey = 'abaya_beldi';
    } else if (text.includes('sport') || text.includes('hoodie') || text.includes('over') || text.includes('هودي') || text.includes('رياضي') || text.includes('gilet')) {
      catKey = 'sportswear_hoodie';
    } else if (text.includes('veste') || text.includes('manteau') || text.includes('جاكيت') || text.includes('معطف') || text.includes('فيست')) {
      catKey = 'veste_manteau';
    } else if (text.includes('shirt') || text.includes('short') || text.includes('t-shirt') || text.includes('تيشرت') || text.includes('صيفي')) {
      catKey = 'tshirt_summer';
    } else if (text.includes('cargo') || text.includes('pantalon') || text.includes('سروال') || text.includes('بنطلون')) {
      catKey = 'pantalon_cargo';
    } else {
      catKey = 'default_modele';
    }
  }

  const consommation = customConsommation || (
    catKey === 'abaya_beldi' ? 3.2 :
    catKey === 'sportswear_hoodie' ? 1.8 :
    catKey === 'veste_manteau' ? 2.0 :
    catKey === 'tshirt_summer' ? 0.85 :
    catKey === 'pantalon_cargo' ? 1.4 : 1.5
  );

  const prixMetre = customPrice || (
    catKey === 'abaya_beldi' ? 15.0 :
    catKey === 'sportswear_hoodie' ? 18.0 :
    catKey === 'veste_manteau' ? 22.0 :
    catKey === 'tshirt_summer' ? 15.0 :
    catKey === 'pantalon_cargo' ? 17.0 : 16.0
  );

  let fournitures = 6.0;
  let postes: PosteTravail[] = [];
  let recommendation = '';
  let categorieName = '';
  let tissuName = '';

  if (catKey === 'abaya_beldi') {
    categorieName = 'لباس تقليدي / عباية (Abaya / Beldi)';
    tissuName = 'كريب فاخر / حرير / جوهرة (Crêpe / Soie)';
    fournitures = 7.0;
    postes = [
      { nomAr: 'فصالة وتحضير الأجزاء وباترون', nomFr: 'Coupe & Tracé', machine: 'Ciseaux électriques / Table', tempsMin: 6, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'سرفلة وحماية حواف الثوب الفاخر', nomFr: 'Surfilage & Protection', machine: 'Surjeteuse 4/5 Fils', tempsMin: 6, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجميع الهيكل والأكتاف والجوانب', nomFr: 'Assemblage Corps', machine: 'Piqueuse Plate', tempsMin: 10, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة وتثبيت الأكمام', nomFr: 'Montage Manches', machine: 'Piqueuse Plate', tempsMin: 8, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تطريز الصدر والأكمام (طرز / معلم)', nomFr: 'Broderie / Maâlem', machine: 'Machine Broderie / Main', tempsMin: 15, roleOuvrier: 'معلم طرز / تطريز' },
      { nomAr: 'تركيب السفيفة والعقاد في الصدر', nomFr: 'Pose Sfifa & Aakad', machine: 'Piqueuse Guide Sfifa / Main', tempsMin: 14, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني الأطراف السفلى واللمسات النهائية', nomFr: 'Ourlets & Finitions', machine: 'Recouvreuse / Main', tempsMin: 6, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'كّي نهائي، تشطيب وفحص الجودة', nomFr: 'Repassage & Contrôle', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 5, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'ينصح بتخصيص عامل خبير لبوست تركيب السفيفة والتطريز لضمان الجودة العالية وتجنب التأخير في خط الإنتاج.';
  } else if (catKey === 'sportswear_hoodie') {
    categorieName = 'لباس رياضي / كاجوال (Sportswear / Hoodie)';
    tissuName = 'قطن ثقيل 320g / Fleece (Coton lourd)';
    fournitures = 5.6;
    postes = [
      { nomAr: 'فصالة القطن الثقيل للعلوي والبنطلون', nomFr: 'Coupe Coton Fleece', machine: 'Ciseaux Lame', tempsMin: 6, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تجميع هيكل الهودي وساقي البنطلون', nomFr: 'Assemblage Overlock Corps & Jambes', machine: 'Surjeteuse 4 Fils', tempsMin: 12, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'خياطة وتبطين القب (الكابيشون)', nomFr: 'Montage Capuche (Hoodie)', machine: 'Piqueuse Plate', tempsMin: 8, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب جيب الكنغر وجيوب البنطلون', nomFr: 'Montage Poche Kangourou & Poches', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 9, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب حزام الخصر المطاطي للبنطلون', nomFr: 'Pose Ceinture & Élastique', machine: 'Piqueuse Ceinturière / Plate', tempsMin: 6, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'حبكة وتثبيت الأساور والياقة (بردكوت)', nomFr: 'Finition Bord-Côte', machine: 'Recouvreuse 3 Aiguilles', tempsMin: 6, roleOuvrier: 'خياطة' },
      { nomAr: 'تنظيف الخيوط والكيّ بالبخار والتغليف', nomFr: 'Repassage, Nettoyage & Emballage', machine: 'Fer à Vapeur / Table Aspirante', tempsMin: 4, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'هذا الطقم المكون من قطعتين يتطلب 7 محطات عمل فعلية. استخدام ماكينة الأوفيرلوك 4 خيوط في التجميع يختصر 30% من وقت الإنتاج الكلي.';
  } else if (catKey === 'veste_manteau') {
    categorieName = 'جاكيت / فيست شتوي (Veste / Gilet / Manteau)';
    tissuName = 'قماش شتوي / جاباردين / جوخ (Tissu hivernal)';
    fournitures = 12.0;
    postes = [
      { nomAr: 'فصالة القماش الخارجي والبطانة الداخلي', nomFr: 'Coupe Tissu & Doublure', machine: 'Ciseaux électriques', tempsMin: 8, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'لصق الفيزلين وتقوية الأجزاء', nomFr: 'Thermo-collage & Préparation', machine: 'Presse à Thermocoller', tempsMin: 6, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'خياطة الجيوب الخارجية والجيب الداخلي', nomFr: 'Montage Poches Extérieures & Passepoil', machine: 'Piqueuse Plate', tempsMin: 14, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب السحاب الأمامي أو الأزرار', nomFr: 'Montage Fermeture Éclair (Zip / Boutons)', machine: 'Piqueuse Plate', tempsMin: 10, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع الهيكل والأكتاف', nomFr: 'Assemblage Corps & Épaules', machine: 'Piqueuse Plate', tempsMin: 12, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب الياقة والـ Revers', nomFr: 'Montage Col & Revers', machine: 'Piqueuse Plate', tempsMin: 10, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'تجميع الأكمام مع البطانة وربطها بالهيكل', nomFr: 'Montage Manches & Doublure', machine: 'Piqueuse Plate / Surjeteuse', tempsMin: 15, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة الزينة الخارجية (Surpiqûre)', nomFr: 'Surpiqûre & Finitions de Bord', machine: 'Piqueuse 2 Aiguilles', tempsMin: 8, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'كّي بالبخار ومراقبة الجودة نهائية', nomFr: 'Repassage Final & Contrôle Qualité', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 6, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'هذا الجاكيت الشتوي موديل تقني متقدم يتطلب 9 محطات عمل متخصصة لضمان جودة استثنائية دون اختناقات.';
  } else if (catKey === 'tshirt_summer') {
    categorieName = 'طقم صيفي / تيشرت (T-shirt / Short été)';
    tissuName = 'قطن مُمشط 100% (Coton Combed)';
    fournitures = 5.75;
    postes = [
      { nomAr: 'فصالة تيشرت والشورت الصيفي', nomFr: 'Coupe T-shirt & Short', machine: 'Ciseaux électrique', tempsMin: 4, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تجميع صدر وظهر التيشرت والأكمام', nomFr: 'Assemblage T-shirt (Épaules & Côtés)', machine: 'Surjeteuse 4 Fils', tempsMin: 6, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجميع الشورت وتركيب مطاط الخصر', nomFr: 'Assemblage Short & Ceinture', machine: 'Surjeteuse / Piqueuse', tempsMin: 7, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب ياقة التيشرت وشريط النظافة', nomFr: 'Pose Col & Bande de Propreté', machine: 'Colleteuse / Piqueuse', tempsMin: 5, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'ثني أسفل التيشرت، الأكمام والشورت', nomFr: 'Ourlets Bas T-shirt, Manches & Short', machine: 'Recouvreuse 3 Aiguilles', tempsMin: 6, roleOuvrier: 'خياطة' },
      { nomAr: 'كيّ سريع، فحص وتغليف', nomFr: 'Repassage Rapide & Triage', machine: 'Table Repassage', tempsMin: 3, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'طقم صيفي مكون من قطعتين يتطلب 6 محطات عمل متناسقة، يمكن للعامل الواحد إنتاج أكثر من 22 قطعة في اليوم.';
  } else if (catKey === 'pantalon_cargo') {
    categorieName = 'سروال / بنطلون كارجو (Pantalon / Cargo)';
    tissuName = 'جاباردين / جينز / قطن (Gabardine / Denim)';
    fournitures = 8.5;
    postes = [
      { nomAr: 'فصالة السروال والجيوب الإضافية', nomFr: 'Coupe Gabardine & Poches', machine: 'Ciseaux électriques', tempsMin: 5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'خياطة الجيوب الأمامية والخلفية', nomFr: 'Montage Poches Avant & Arrière', machine: 'Piqueuse Plate', tempsMin: 8, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة جيوب الكارجو الجانبية والأغطية', nomFr: 'Montage Poches Cargo Latérales', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 10, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تجميع الساقين ومنطقة الحجر', nomFr: 'Assemblage Jambes & Fourche', machine: 'Surjeteuse 5 Fils (Safety)', tempsMin: 9, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب حزام الخصر وعرى الحزام (Passants)', nomFr: 'Montage Ceinture & Passants', machine: 'Piqueuse Ceinturière / Plate', tempsMin: 8, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني أسفل الساق وخياطة الدعم', nomFr: 'Ourlets Bas & Renforts', machine: 'Recouvreuse / Piqueuse', tempsMin: 5, roleOuvrier: 'خياطة' },
      { nomAr: 'كيّ نهائي بالبخار وفحص الجودة', nomFr: 'Repassage & Contrôle Qualité', machine: 'Fer à Vapeur', tempsMin: 4, roleOuvrier: 'فني تشطيب' }
    ];
    recommendation = 'هذا السروال الكارجو يتطلب 7 محطات عمل. استخدام ماكينة إبرتين في خياطة جيوب الكارجو يعطي متانة عالية ومظهراً احترافياً للمنتج.';
  } else {
    categorieName = 'موديل خياطة عام (Confection Textile)';
    tissuName = 'قماش قياسي (Tissu standard)';
    fournitures = 6.0;
    postes = [
      { nomAr: 'فصالة القماش وتحضير الأجزاء', nomFr: 'Coupe & Préparation', machine: 'Table de Coupe / Ciseaux', tempsMin: 5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'سرفلة وحماية الأطراف', nomFr: 'Surfilage des Bords', machine: 'Surjeteuse 3/4 Fils', tempsMin: 6, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'خياطة الهيكل وتجميع الأجزاء الرئيسية', nomFr: 'Assemblage Principal', machine: 'Piqueuse Plate', tempsMin: 12, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب الياقة، الجيوب أو السحاب', nomFr: 'Montage Accessoires (Col/Poches/Zip)', machine: 'Piqueuse Plate', tempsMin: 8, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'ثني الأطراف الخارجية والتشطيب', nomFr: 'Ourlets & Finition Extérieure', machine: 'Recouvreuse', tempsMin: 5, roleOuvrier: 'خياطة' },
      { nomAr: 'كّي بالبخار ومراقبة الجودة نهائية', nomFr: 'Repassage Vapeur & Contrôle', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 4, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];
    recommendation = 'توزيع متوازن للمراحل على 6 بوستات عمل يضمن استمرارية خط الإنتاج دون تكدس في الأتوليي.';
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
