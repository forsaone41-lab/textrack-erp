export interface FabricInfo {
  arName: string;
  frName: string;
  pricePerMeterMAD: string;
  pricePerMeterMADFr: string;
  markets: string;
  marketsFr: string;
  pros: string;
  prosFr: string;
  cons: string;
  consFr: string;
  avgPricePerMeter?: number;
}

export const FABRIC_CATALOG: Record<string, FabricInfo> = {
  'interlock': {
    arName: 'إنترلوك قطن ممتاز 100% (Interlock Double Knit)',
    frName: 'Interlock 100% Coton Double Knit',
    pricePerMeterMAD: '32 - 48 درهم/متر (أو 75 - 90 درهم/كيلو جملة)',
    pricePerMeterMADFr: '32 - 48 MAD/mètre (ou 75 - 90 MAD/kg)',
    markets: 'درب عمر (سوق المسيرة)، سوق القريعة، درب السلطان (الدار البيضاء)',
    marketsFr: 'Derb Omar, Souk Griaa, Derb Sultan (Casablanca)',
    pros: 'ما كيتلواش في الفصالة نهائياً (نهائي الرولاج)، وجهين متطابقين، ناعم وثقيل ومثالي للتيشرتات والسويت شيرت الراقية',
    prosFr: 'Ne roule pas sur les bords à la coupe, double face identique, dense et doux, parfait pour t-shirts et sweats premium',
    cons: 'أثقل من الجيرسي العادي وكيتطلب إبرة Ball Point (Stretch) باش ما يتقبش الثوب',
    consFr: 'Plus lourd que le jersey simple, nécessite une aiguille pointe boule (stretch) en machine',
    avgPricePerMeter: 40
  },
  'molleton': {
    arName: 'مولتون شتوي مبطن / قطن فليس (Molleton / Cotton Fleece)',
    frName: 'Molleton Coton / Fleece Gratté',
    pricePerMeterMAD: '38 - 60 درهم/متر (أو 80 - 110 درهم/كيلو)',
    pricePerMeterMADFr: '38 - 60 MAD/mètre (ou 80 - 110 MAD/kg)',
    markets: 'درب عمر، سوق القريعة، المنطقة الصناعية عين السبع',
    marketsFr: 'Derb Omar, Souk Griaa, Aïn Sebaâ',
    pros: 'دافي بزاف، ملمس قطني مريح، قوام واقف للهودي والسويت شيرت أوفر سايز',
    prosFr: 'Très chaud, toucher doux molletonné, excellente tenue pour hoodies et sweats oversize',
    cons: 'كيحتاج شفرات مقص حادة في الفصالة وماكينة سورجي 4 خيوط قوية',
    consFr: 'Nécessite des lames affûtées pour la coupe et une surjeteuse 4 fils robuste',
    avgPricePerMeter: 48
  },
  'jersey': {
    arName: 'جيرسي قطن ليكرا (Jersey Coton 95% + Élasthanne 5%)',
    frName: 'Jersey Coton Lycra / Spandex',
    pricePerMeterMAD: '24 - 42 درهم/متر (أو 65 - 80 درهم/كيلو جملة)',
    pricePerMeterMADFr: '24 - 42 MAD/mètre (ou 65 - 80 MAD/kg)',
    markets: 'درب عمر، سوق القريعة، درب السلطان',
    marketsFr: 'Derb Omar, Souk Griaa, Derb Sultan',
    pros: 'مطاطي ومريح جداً على الجسم، مثالي للبوكسرات، الملابس الداخلية، والتيشرتات الصيفية',
    prosFr: 'Extensible et très confortable, idéal pour sous-vêtements, boxers et t-shirts',
    cons: 'كيرولي في الجوانب وقت الفصالة وكيتطلب ماكينات السورجي والروكوفروز لمرونة الخياطة',
    consFr: 'Tendance à rouler sur les bords à la coupe, nécessite surjeteuse et recouvreuse',
    avgPricePerMeter: 32
  },
  'gabardine': {
    arName: 'جاباردين كوتون متين (Gabardine Coton / Stretch)',
    frName: 'Gabardine Coton / Stretch',
    pricePerMeterMAD: '28 - 50 درهم/متر',
    pricePerMeterMADFr: '28 - 50 MAD/mètre',
    markets: 'درب عمر، سوق القريعة',
    marketsFr: 'Derb Omar, Souk Griaa',
    pros: 'متين، واقف، ما كيتقطعش بسهولة، ممتاز للسراويل الكارجو والفيستات',
    prosFr: 'Robuste, bonne tenue, indéchirable, excellent pour pantalons cargo et vestes',
    cons: 'قاصح شوية في الفصالة وكيحتاج إبر سميكة 90/14 أو 100/16',
    consFr: 'Plus rigide à la coupe, nécessite des aiguilles fortes 90/14 ou 100/16',
    avgPricePerMeter: 38
  },
  'popeline': {
    arName: 'بوبلين قطن ناعم 100% (Popeline Coton)',
    frName: 'Popeline 100% Coton',
    pricePerMeterMAD: '22 - 38 درهم/متر',
    pricePerMeterMADFr: '22 - 38 MAD/mètre',
    markets: 'درب عمر، سوق القريعة، القيساريات',
    marketsFr: 'Derb Omar, Souk Griaa, Kissariat',
    pros: 'خفيف وناعم وتنفس عالي، كلاسيكي ومثالي للقمصان والشوميزات',
    prosFr: 'Léger, doux, très respirant, classique parfait pour chemises et blouses',
    cons: 'كيبغي التحديد بالحديد والمصلوح بانتظام',
    consFr: 'Nécessite repassage régulier',
    avgPricePerMeter: 28
  },
  'crêpe': {
    arName: 'كريب دي شين / كريب جورجيت (Crêpe)',
    frName: 'Crêpe de Chine / Georgette',
    pricePerMeterMAD: '25 - 45 درهم/متر (جملة)',
    pricePerMeterMADFr: '25 - 45 MAD/mètre (gros)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، القيساريات الكبرى',
    marketsFr: 'Derb Omar (Casablanca), Souk Griaa, grandes Kissariat',
    pros: 'طايح وخفيف، مريح في اللبس، ما كيتكمش بسهولة، ممتاز للفساتين والعبايات',
    prosFr: 'Fluide et léger, confortable, ne se froisse pas facilement, excellent pour robes et abayas',
    cons: 'كيتطلب عناية خاصة في الخياطة باش ما يزلقش في الماكينة',
    consFr: 'Nécessite un soin particulier à la couture pour éviter le glissement sous la machine',
    avgPricePerMeter: 34
  },
  'satin': {
    arName: 'ساتان حرير / ساتان دوتشيس (Satin)',
    frName: 'Satin de Soie / Satin Duchesse',
    pricePerMeterMAD: '30 - 65 درهم/متر (جملة)',
    pricePerMeterMADFr: '30 - 65 MAD/mètre (gros)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، سوق الأثواب',
    marketsFr: 'Derb Omar (Casablanca), Souk Griaa, Souk des tissus',
    pros: 'لمعة فاخرة، ملمس ناعم، يعطي قيمة عالية للبياسة في السهرات والمناسبات',
    prosFr: 'Brillance luxueuse, toucher doux, apporte une haute valeur pour les tenues de soirée',
    cons: 'حساس للحرارة والماء، كيبين عيوب الخياطة إذا ما كانتش متقنة 100%',
    consFr: 'Sensible à la chaleur et à l\'eau, révèle les défauts de couture si non parfaitement exécutée',
    avgPricePerMeter: 45
  },
  'dentelle': {
    arName: 'دانتيلا / كيبير فرنسي (Dentelle / Guipure)',
    frName: 'Dentelle / Guipure de luxe',
    pricePerMeterMAD: '60 - 180 درهم/متر',
    pricePerMeterMADFr: '60 - 180 MAD/mètre',
    markets: 'درب عمر (شارع القصور)، محلات الأثواب المستوردة',
    marketsFr: 'Derb Omar (rue des palais), boutiques de tissus importés',
    pros: 'مظهر راقي جداً، يضيف لمسة كوتور (Couture) وتفاصيل فاخرة للبياسة',
    prosFr: 'Aspect très raffiné, apporte une touche couture et des détails luxueux',
    cons: 'سعر مرتفع، يحتاج تبطين (Doublure) ودقة عالية في التفصيل والقص',
    consFr: 'Prix élevé, nécessite une doublure et une grande précision de coupe',
    avgPricePerMeter: 95
  },
  'lin': {
    arName: 'كتان طبيعي / لينن ممتاز (Lin)',
    frName: 'Lin naturel de qualité',
    pricePerMeterMAD: '40 - 75 درهم/متر (جملة)',
    pricePerMeterMADFr: '40 - 75 MAD/mètre (gros)',
    markets: 'درب عمر، القيساريات التجارية بالمغرب',
    marketsFr: 'Derb Omar, Kissariat commerciales du Maroc',
    pros: 'بارد وممتاز للصيف، متين جداً، موضة مطلوبة بكثرة في السوق المغربي',
    prosFr: 'Frais et idéal pour l\'été, très résistant, forte demande sur le marché marocain',
    cons: 'كيتكمش بسرعة وكيتطلب التحديد (الحديد) المستمر',
    consFr: 'Se froisse rapidement et nécessite un repassage fréquent',
    avgPricePerMeter: 52
  },
  'brocart': {
    arName: 'بروكار مغربي / بهجة ملكية (Brocart)',
    frName: 'Brocart / Bahja Traditionnelle',
    pricePerMeterMAD: '120 - 350 درهم/متر',
    pricePerMeterMADFr: '120 - 350 MAD/mètre',
    markets: 'سوق الغزل بفاس، درب السلطان والدرب الكبير بالدار البيضاء',
    marketsFr: 'Souk Ghezel à Fès, Derb Sultan et Derb Kebir à Casablanca',
    pros: 'فخامة مغربية أصيلة، قوام واقف ومناسب للقفطان والتكشيطة والمناسبات الكبرى',
    prosFr: 'Luxe marocain authentique, tenue rigide idéale pour caftan, takchita et grandes occasions',
    cons: 'ثقيل في اللبس، مكلف من ناحية السلع والخياطة اليدوية (المعلم)',
    consFr: 'Lourd à porter, coûteux en matière et en couture artisanale (maalem)',
    avgPricePerMeter: 180
  },
  'mousseline': {
    arName: 'موسلين / شيفون شفاف (Mousseline / Chiffon)',
    frName: 'Mousseline / Chiffon',
    pricePerMeterMAD: '15 - 35 درهم/متر (جملة)',
    pricePerMeterMADFr: '15 - 35 MAD/mètre (gros)',
    markets: 'درب عمر، القريعة، قيسارية الأثواب',
    marketsFr: 'Derb Omar, Griaa, Kissariat des tissus',
    pros: 'خفيف جداً، انسيابي ورومانسي، رائع للطبقات والفساتين الصيفية',
    prosFr: 'Très léger, fluide et romantique, parfait pour les superpositions et robes d\'été',
    cons: 'شفاف يحتاج بطانة، حساس جداً للتمزق في الخياطة',
    consFr: 'Transparent, nécessite une doublure, très sensible à la déchirure à la couture',
    avgPricePerMeter: 24
  }
};

export function getFabricInfo(fabricName: string = ''): FabricInfo {
  const lower = fabricName.toLowerCase();
  for (const key of Object.keys(FABRIC_CATALOG)) {
    if (
      lower.includes(key) ||
      (key === 'crêpe' && (lower.includes('crepe') || lower.includes('كريب'))) ||
      (key === 'satin' && (lower.includes('satin') || lower.includes('ساتان'))) ||
      (key === 'dentelle' && (lower.includes('dentelle') || lower.includes('lace') || lower.includes('دانتيلا'))) ||
      (key === 'interlock' && (lower.includes('interlock') || lower.includes('انترلوك') || lower.includes('إنترلوك'))) ||
      (key === 'molleton' && (lower.includes('molleton') || lower.includes('مولتون') || lower.includes('ميلتون') || lower.includes('fleece'))) ||
      (key === 'jersey' && (lower.includes('jersey') || lower.includes('جيرسي') || lower.includes('جيرزي'))) ||
      (key === 'gabardine' && (lower.includes('gabardine') || lower.includes('جاباردين') || lower.includes('كاباردين'))) ||
      (key === 'popeline' && (lower.includes('popeline') || lower.includes('بوبلين')))
    ) {
      return FABRIC_CATALOG[key];
    }
  }
  return {
    arName: fabricName || 'ثوب مناسب للموديل (توصية عامة)',
    frName: fabricName || 'Tissu adapté au modèle',
    pricePerMeterMAD: '25 - 55 درهم/متر (تقديري حسب الجودة)',
    pricePerMeterMADFr: '25 - 55 MAD/mètre (estimatif selon qualité)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، القيساريات المحلية',
    marketsFr: 'Derb Omar (Casablanca), Souk Griaa, Kissariat locales',
    pros: 'جودة ممتازة وسهل في التفصيل والخياطة بالورشة',
    prosFr: 'Excellente qualité et facile à travailler à l\'atelier',
    cons: 'يجب التأكد من جودة الغزل وغسله أو تجربته قبل القص النهائي',
    consFr: 'Vérifier la qualité du fil et le tester avant la coupe finale',
    avgPricePerMeter: 38
  };
}

/**
 * Intelligent helper to estimate exact unit manufacturing breakdown (tissu, fournitures, façon)
 */
export function estimateSourcingBreakdown(params: {
  pieceName: string;
  fabricName?: string;
  consumptionStr?: string;
  baseCost?: number;
  isAr?: boolean;
}) {
  const { pieceName, fabricName = '', consumptionStr = '', baseCost = 0, isAr = true } = params;
  const pLower = pieceName.toLowerCase();
  const fab = getFabricInfo(fabricName);

  // Parse metrage (default 1.50m)
  const metrageMatch = consumptionStr.replace(',', '.').match(/[\d.]+/);
  const metrage = metrageMatch ? parseFloat(metrageMatch[0]) || 1.5 : 1.5;

  // Fabric price per meter
  const prixMetre = fab.avgPricePerMeter || 40;

  // Fournitures estimate (Zips, cordons, fils, élastiques, boutons, étiquettes...)
  let fournitures = 10;
  let detailsFournitures = isAr ? 'خيط بوليستر + إتيكيت ماركة' : 'Fil polyester + étiquette tissée';

  if (pLower.includes('manteau') || pLower.includes('مانطو') || pLower.includes('معطف') || pLower.includes('veste') || pLower.includes('جاكيت')) {
    fournitures = 18;
    detailsFournitures = isAr ? 'سحاب معدني/بلاستيكي 70cm + أزرار كبس + فيزلين وتقوية + خيط متين' : 'Zip métal/injecté 70cm + boutons pression + thermocollant + fil 40/2';
  } else if (pLower.includes('hoodie') || pLower.includes('هودي') || pLower.includes('sweat') || pLower.includes('سويت')) {
    fournitures = 14;
    detailsFournitures = isAr ? 'كوردون قطني + عيون معدنية (œillets) + شريط رقبة + إتيكيت قياسات' : 'Cordon coton épais + œillets métal + bande propreté + étiquette';
  } else if (pLower.includes('pantalon') || pLower.includes('سروال') || pLower.includes('jogging') || pLower.includes('جوغينغ') || pLower.includes('short')) {
    fournitures = 12;
    detailsFournitures = isAr ? 'لاستيك عريض 4cm + كوردون خصر + سحاب جيب خفي + خيط مرن' : 'Élastique large 4cm + cordon ceinture + zips poches invisibles';
  } else if (pLower.includes('robe') || pLower.includes('كسوة') || pLower.includes('فستان') || pLower.includes('abaya') || pLower.includes('عباية')) {
    fournitures = 15;
    detailsFournitures = isAr ? 'سحاب مخفي 60cm + أزرار لؤلؤية/كبس + شريط تنظيف + سفيفة خفيفة' : 'Zip invisible 60cm + boutons finition + biais propreté';
  } else if (pLower.includes('chemise') || pLower.includes('قميص') || pLower.includes('شوميز')) {
    fournitures = 10;
    detailsFournitures = isAr ? 'أزرار صدفية (10 قطع) + فيزلين كول وأساور + خيط تطريز عروة' : 'Boutons nacrés (x10) + triplure thermocollante col & poignets';
  }

  // Façon / Labor atelier
  let facon = 25;
  if (pLower.includes('manteau') || pLower.includes('مانطو') || pLower.includes('معطف')) {
    facon = 38;
  } else if (pLower.includes('hoodie') || pLower.includes('هودي') || pLower.includes('sweat')) {
    facon = 24;
  } else if (pLower.includes('pantalon') || pLower.includes('سروال') || pLower.includes('jogging')) {
    facon = 20;
  } else if (pLower.includes('robe') || pLower.includes('فستان') || pLower.includes('abaya')) {
    facon = 32;
  } else if (pLower.includes('t-shirt') || pLower.includes('تيشرت') || pLower.includes('تي شيرت')) {
    facon = 12;
    fournitures = 6;
  }

  // Total fabrication cost per piece (L'Oco de revient)
  const totalTissu = Math.round(metrage * prixMetre);
  const coutRevientTotal = Math.round(totalTissu + fournitures + facon);

  // Recommended selling price (with 40% - 50% margin)
  const rawBase = baseCost > 0 ? baseCost : coutRevientTotal;
  const sellingPrice = Math.max(30, Math.round((Math.max(rawBase, coutRevientTotal) * 1.5) / 5) * 5);

  return {
    metrage,
    prixMetre,
    totalTissu,
    marche: isAr ? fab.markets : fab.marketsFr,
    fournitures,
    detailsFournitures,
    facon,
    coutRevientTotal,
    sellingPrice,
    fabricPros: isAr ? fab.pros : fab.prosFr,
    fabricCons: isAr ? fab.cons : fab.consFr
  };
}
