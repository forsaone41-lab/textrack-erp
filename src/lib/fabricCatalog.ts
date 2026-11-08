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
  techSpec?: string;
  composition?: string;
}

export const FABRIC_CATALOG: Record<string, FabricInfo> = {
  'rib': {
    arName: 'كوت ريب 1×1 ليكرا قطن ممشط 250g (Côte Rib Stretch)',
    frName: 'Côte Rib 1x1 Lycra 95% Coton Peigné / 5% Élasthanne 250 GSM',
    pricePerMeterMAD: '28 - 45 درهم/متر (أو 75 - 95 درهم/كيلو)',
    pricePerMeterMADFr: '28 - 45 MAD/mètre (ou 75 - 95 MAD/kg)',
    markets: 'موردو النسيج الصناعي المعتمدون (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs & Fournisseurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'مرونة وتمدد عالي، تضليع عمودي أنيق، مثالي للتوبات والكروب توب والموديلات الضيقة ومحددات الأطراف',
    prosFr: 'Excellente élasticité, côtes verticales élégantes, idéal pour tops fittés, crop tops, encolures et poignets',
    cons: 'يحتاج ضبط شد الخياطة واستعمال ماكينة سورجي وروكوفروز لمرونة الغرزات',
    consFr: 'Nécessite un réglage précis de la tension machine et des surjeteuses/recouvreuses adaptées',
    avgPricePerMeter: 36,
    techSpec: '95% Coton Peigné · 5% Élasthanne · 250 GSM'
  },
  'toile_coton': {
    arName: 'تويل قطن إيكرو ثقيل مبطن (Toile Coton Écru / Twill Lourd)',
    frName: 'Toile de Coton Écru / Twill Coton Lourd Doublé',
    pricePerMeterMAD: '45 - 65 درهم/متر',
    pricePerMeterMADFr: '45 - 65 MAD/mètre',
    markets: 'مستوردو وموزعو أقمشة السترات والجاكيتات الصناعية المعتمدون (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs Textiles Industriels Agréés & Importateurs Directs (Casablanca / Tanger)',
    pros: 'قوام واقف وهيكلي فخم، متانة عالية ومقاومة للارتداء، مظهر كوتور راقي للعلامات التجارية',
    prosFr: 'Structure impeccable, excellente tenue, haute résistance à l\'usure, aspect haut de gamme pour marques',
    cons: 'يحتاج بطانة داخلية ناعمة لراحة الارتداء ومكواة بخار صناعية تحت الضغط',
    consFr: 'Nécessite une doublure intérieure soignée et un repassage vapeur sous presse',
    avgPricePerMeter: 55,
    techSpec: '100% Coton Naturel Écru · 320 GSM · Armure Twill / Toile'
  },
  'drap_de_laine': {
    arName: 'دوب دو لين صوف شتوي فاخر (Drap de Laine Écru Lourd 420g)',
    frName: 'Drap de Laine / Lainage Écru Lourd 420 GSM & Doublure Satinée',
    pricePerMeterMAD: '75 - 120 درهم/متر (سوق الجملة درب عمر / طنجة)',
    pricePerMeterMADFr: '75 - 120 MAD/mètre (Marché de Gros Casablanca / Tanger)',
    markets: 'مستوردو أقمشة الصوف والسترات الشتوية (الدار البيضاء: زنقة سيدي بليوط / درب عمر - طنجة)',
    marketsFr: 'Distributeurs & Importateurs Grossistes Laine & Manteaux (Casablanca / Tanger)',
    pros: 'فخامة ودفء عالي جداً، قوام واقف مهيكل للسترات والمعاطف، مثالي لقصات الكول أوفيسييه وأزرار البراندبورغ الفاخرة',
    prosFr: 'Chaleur et tenue exceptionnelles, tombé très structuré, parfait pour vestes chic, manteaux col officier et brandebourgs',
    cons: 'يحتاج بطانة داخلية ساتان حريرية وتقفيل نظيف بالمكواة البخارية الصناعية تحت الضغط',
    consFr: 'Nécessite une doublure satinée intérieure soignée et un repassage vapeur sous presse industrielle',
    avgPricePerMeter: 90,
    techSpec: '80% Laine · 20% Polyamide (ou 100% Laine) · 420 GSM'
  },
  'denim': {
    arName: 'قماش دنيم جينز أصيل 100% قطن 12.5oz (Heavy Denim)',
    frName: 'Toile Denim 100% Coton Brut 12.5oz / Jean',
    pricePerMeterMAD: '34 - 48 درهم/متر',
    pricePerMeterMADFr: '34 - 48 MAD/mètre',
    markets: 'موردو أقمشة الجينز والمنسوجات الصناعية المعتمدون (الدار البيضاء / طنجة)',
    marketsFr: 'Fournisseurs Spécialisés Denim & Importateurs Certifiés (Casablanca / Tanger)',
    pros: 'قماش أصيل متين، يتحمل كافة أنواع الغسيل الأنزيمي والحجري ومعالجات الصباغة',
    prosFr: 'Toile authentique et robuste, tolère tous types de délavages industriels et enzymatiques',
    cons: 'يتطلب ماكينات خياطة خيط ثقيل وإبر قوية 110/18',
    consFr: 'Exige des piqueuses renforcées avec fil épais et aiguilles fortes 110/18',
    avgPricePerMeter: 42,
    techSpec: '100% Coton Renforcé · 12.5 oz (380-420 GSM) · Armure Jean 3/1'
  },
  'interlock': {
    arName: 'إنترلوك قطن ممتاز 100% (Interlock Double Knit)',
    frName: 'Interlock 100% Coton Double Knit',
    pricePerMeterMAD: '32 - 48 درهم/متر (أو 75 - 90 درهم/كيلو)',
    pricePerMeterMADFr: '32 - 48 MAD/mètre (ou 75 - 90 MAD/kg)',
    markets: 'موردو النسيج الصناعي المعتمدون (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'ما كيتلواش في الفصالة نهائياً (نهائي الرولاج)، وجهين متطابقين، ناعم وثقيل ومثالي للتيشرتات والسويت شيرت الراقية',
    prosFr: 'Ne roule pas sur les bords à la coupe, double face identique, dense et doux, parfait pour t-shirts et sweats premium',
    cons: 'أثقل من الجيرسي العادي وكيتطلب إبرة Ball Point (Stretch) باش ما يتقبش الثوب',
    consFr: 'Plus lourd que le jersey simple, nécessite une aiguille pointe boule (stretch) en machine',
    avgPricePerMeter: 40,
    techSpec: '100% Coton Peigné · 260 GSM · Double Fonture'
  },
  'molleton': {
    arName: 'مولتون شتوي مبطن / قطن فليس (Molleton / Cotton Fleece)',
    frName: 'Molleton Coton / Fleece Gratté',
    pricePerMeterMAD: '38 - 60 درهم/متر (أو 80 - 110 درهم/كيلو)',
    pricePerMeterMADFr: '38 - 60 MAD/mètre (ou 80 - 110 MAD/kg)',
    markets: 'موردو الأقمشة الشتوية والمحيكة الصناعية (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs & Fournisseurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'دافي بزاف، ملمس قطني مريح، قوام واقف للهودي والسويت شيرت وسراويل الجوغينغ',
    prosFr: 'Très chaud, toucher doux molletonné, excellente tenue pour hoodies, sweats et joggings',
    cons: 'كيحتاج شفرات مقص حادة في الفصالة وماكينة سورجي 4 خيوط قوية',
    consFr: 'Nécessite des lames affûtées pour la coupe et une surjeteuse 4 fils robuste',
    avgPricePerMeter: 48,
    techSpec: '100% Coton (ou 80/20 Coton/Poly) · 340 GSM'
  },
  'french_terry': {
    arName: 'مولطون بوكليت غير مقطن (فرنش تيري 100% قطن)',
    frName: 'French Terry Molleton Non-Gratté 100% Coton 340 GSM',
    pricePerMeterMAD: '35 - 55 درهم/متر (أو 85 - 105 درهم/كيلو)',
    pricePerMeterMADFr: '35 - 55 MAD/mètre (ou 85 - 105 MAD/kg)',
    markets: 'موردو ومستوردو أقمشة الستريتوير الصناعية (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'مظهر ستريتوير راقي، حلقات بوكليت قطنية ناعمة، انسيابية ووزن ممتاز لسراويل الوايد ليغ والسويت شيرت',
    prosFr: 'Look streetwear raffiné, bouclettes confortables, excellent tombé fluide pour pantalons wide-leg et sweats',
    cons: 'يحتاج مكواة بخار بدرجة حرارة مضبوطة وغسيل أنزيمي أولي',
    consFr: 'Nécessite un repassage vapeur calibré et un lavage enzymatique préliminaire',
    avgPricePerMeter: 45,
    techSpec: '100% Coton Peigné · 340 GSM · Bouclette Non-Grattée'
  },
  'jersey': {
    arName: 'جيرسي قطن ليكرا (Jersey Coton 95% + Élasthanne 5%)',
    frName: 'Jersey Coton Lycra / Spandex',
    pricePerMeterMAD: '24 - 42 درهم/متر (أو 65 - 80 درهم/كيلو)',
    pricePerMeterMADFr: '24 - 42 MAD/mètre (ou 65 - 80 MAD/kg)',
    markets: 'موردو أقمشة الحياكة الصناعية المعتمدون (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs & Fournisseurs de Maille Industrielle (Casablanca / Tanger)',
    pros: 'مطاطي ومريح جداً على الجسم، مثالي للبوكسرات، الملابس الداخلية، والتيشرتات الصيفية',
    prosFr: 'Extensible et très confortable, idéal pour sous-vêtements, boxers et t-shirts',
    cons: 'كيرولي في الجوانب وقت الفصالة وكيتطلب ماكينات السورجي والروكوفروز لمرونة الخياطة',
    consFr: 'Tendance à rouler sur les bords à la coupe, nécessite surjeteuse et recouvreuse',
    avgPricePerMeter: 32,
    techSpec: '95% Coton Peigné · 5% Élasthanne · 200 GSM'
  },
  'gabardine': {
    arName: 'جاباردين كوتون متين (Gabardine Coton / Stretch)',
    frName: 'Gabardine Coton / Stretch',
    pricePerMeterMAD: '28 - 50 درهم/متر',
    pricePerMeterMADFr: '28 - 50 MAD/mètre',
    markets: 'موردو الأقمشة المنسوجة الصناعية (الدار البيضاء / طنجة)',
    marketsFr: 'Fournisseurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'متين، واقف، ما كيتقطعش بسهولة، ممتاز للسراويل الكارجو والفيستات',
    prosFr: 'Robuste, bonne tenue, indéchirable, excellent pour pantalons cargo et vestes',
    cons: 'قاصح شوية في الفصالة وكيحتاج إبر سميكة 90/14 أو 100/16',
    consFr: 'Plus rigide à la coupe, nécessite des aiguilles fortes 90/14 ou 100/16',
    avgPricePerMeter: 38,
    techSpec: '98% Coton · 2% Élasthanne · 280 GSM'
  },
  'popeline': {
    arName: 'بوبلين قطن ناعم 100% (Popeline Coton)',
    frName: 'Popeline 100% Coton Peigné',
    pricePerMeterMAD: '22 - 38 درهم/متر',
    pricePerMeterMADFr: '22 - 38 MAD/mètre',
    markets: 'موردو ومستوردو أقمشة القمصان الصناعية (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs & Importateurs Spécialisés Chemiserie (Casablanca / Tanger)',
    pros: 'خفيف وناعم وتنفس عالي، كلاسيكي ومثالي للقمصان والشوميزات',
    prosFr: 'Léger, doux, très respirant, classique parfait pour chemises et blouses',
    cons: 'كيبغي التحديد بالحديد والمصلوح بانتظام',
    consFr: 'Nécessite repassage régulier',
    avgPricePerMeter: 28,
    techSpec: '100% Coton Peigné · 130 GSM'
  },
  'crêpe': {
    arName: 'كريب دي شين / كريب جورجيت (Crêpe)',
    frName: 'Crêpe de Chine / Georgette',
    pricePerMeterMAD: '25 - 45 درهم/متر',
    pricePerMeterMADFr: '25 - 45 MAD/mètre',
    markets: 'موردو ومستوردو أقمشة الأزياء النسائية (الدار البيضاء / طنجة)',
    marketsFr: 'Fournisseurs & Importateurs Textiles Féminins (Casablanca / Tanger)',
    pros: 'طايح وخفيف، مريح في اللبس، ما كيتكمش بسهولة، ممتاز للفساتين والعبايات',
    prosFr: 'Fluide et léger, confortable, ne se froisse pas facilement, excellent pour robes et abayas',
    cons: 'كيتطلب عناية خاصة في الخياطة باش ما يزلقش في الماكينة',
    consFr: 'Nécessite un soin particulier à la couture pour éviter le glissement sous la machine',
    avgPricePerMeter: 34,
    techSpec: '100% Polyester / Viscose Fluide · 160 GSM'
  },
  'satin': {
    arName: 'ساتان حرير / ساتان دوتشيس (Satin)',
    frName: 'Satin de Soie / Satin Duchesse',
    pricePerMeterMAD: '30 - 65 درهم/متر',
    pricePerMeterMADFr: '30 - 65 MAD/mètre',
    markets: 'مستوردو أقمشة السهرات والمناسبات (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'لمعة فاخرة، ملمس ناعم، يعطي قيمة عالية للبياسة في السهرات والمناسبات',
    prosFr: 'Brillance luxueuse, toucher doux, apporte une haute valeur pour les tenues de soirée',
    cons: 'حساس للحرارة والماء، كيبين عيوب الخياطة إذا ما كانتش متقنة 100%',
    consFr: 'Sensible à la chaleur et à l\'eau, révèle les défauts de couture si non parfaitement exécutée',
    avgPricePerMeter: 45,
    techSpec: '100% Satin Soyeux · 180 GSM'
  },
  'dentelle': {
    arName: 'دانتيلا / كيبير فاخر (Dentelle / Guipure)',
    frName: 'Dentelle / Guipure de luxe',
    pricePerMeterMAD: '60 - 180 درهم/متر',
    pricePerMeterMADFr: '60 - 180 MAD/mètre',
    markets: 'مستوردو الأقمشة الراقية والمطرزات (الدار البيضاء / طنجة)',
    marketsFr: 'Boutiques & Distributeurs de Tissus Importés (Casablanca / Tanger)',
    pros: 'مظهر راقي جداً، يضيف لمسة كوتور (Couture) وتفاصيل فاخرة للبياسة',
    prosFr: 'Aspect très raffiné, apporte une touche couture et des détails luxueux',
    cons: 'سعر مرتفع، يحتاج تبطين (Doublure) ودقة عالية في التفصيل والقص',
    consFr: 'Prix élevé, nécessite une doublure et une grande précision de coupe',
    avgPricePerMeter: 95
  },
  'lin': {
    arName: 'كتان طبيعي / لينن ممتاز (Lin)',
    frName: 'Lin naturel de qualité',
    pricePerMeterMAD: '40 - 75 درهم/متر',
    pricePerMeterMADFr: '40 - 75 MAD/mètre',
    markets: 'موردو أقمشة الكتان والألياف الطبيعية (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'بارد وممتاز للصيف، متين جداً، موضة مطلوبة بكثرة في السوق المغربي والعالمي',
    prosFr: 'Frais et idéal pour l\'été, très résistant, forte demande sur les marchés de mode',
    cons: 'كيتكمش بسرعة وكيتطلب التحديد (الحديد) المستمر',
    consFr: 'Se froisse rapidement et nécessite un repassage fréquent',
    avgPricePerMeter: 52
  },
  'brocart': {
    arName: 'بروكار مغربي / بهجة ملكية (Brocart)',
    frName: 'Brocart / Bahja Traditionnelle',
    pricePerMeterMAD: '120 - 350 درهم/متر',
    pricePerMeterMADFr: '120 - 350 MAD/mètre',
    markets: 'موزعو المنسوجات التقليدية الفاخرة (فاس / الدار البيضاء)',
    marketsFr: 'Distributeurs de Tissus Traditionnels Haut de Gamme (Fès / Casablanca)',
    pros: 'فخامة مغربية أصيلة، قوام واقف ومناسب للقفطان والتكشيطة والمناسبات الكبرى',
    prosFr: 'Luxe marocain authentique, tenue rigide idéale pour caftan, takchita et grandes occasions',
    cons: 'ثقيل في اللبس، مكلف من ناحية السلع والخياطة اليدوية (المعلم)',
    consFr: 'Lourd à porter, coûteux en matière et en couture artisanale (maalem)',
    avgPricePerMeter: 180
  },
  'mousseline': {
    arName: 'موسلين / شيفون شفاف (Mousseline / Chiffon)',
    frName: 'Mousseline / Chiffon',
    pricePerMeterMAD: '15 - 35 درهم/متر',
    pricePerMeterMADFr: '15 - 35 MAD/mètre',
    markets: 'موردو الأقمشة النسائية الحريرية (الدار البيضاء / طنجة)',
    marketsFr: 'Fournisseurs & Importateurs Textiles Féminins (Casablanca / Tanger)',
    pros: 'خفيف جداً، انسيابي ورومانسي، رائع للطبقات والفساتين الصيفية',
    prosFr: 'Très léger, fluide et romantique, parfait pour les superpositions et robes d\'été',
    cons: 'شفاف يحتاج بطانة، حساس جداً للتمزق في الخياطة',
    consFr: 'Transparent, nécessite une doublure, très sensible à la déchirure à la couture',
    avgPricePerMeter: 24
  },
  'tartan': {
    arName: 'قماش كاروهات صوف خفيف / كريب تويل ترتان 240g (Tartan / Carreaux)',
    frName: 'Tissu à Carreaux / Crêpe Twill Tartan 240g',
    pricePerMeterMAD: '28 - 48 درهم/متر',
    pricePerMeterMADFr: '28 - 48 MAD/mètre',
    markets: 'موردو الأقمشة المنسوجة والشتوية (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'ثبات ممتاز للكسرات والبليات (Plis Creux)، مظهر شتوي وخريفي راقي، انسيابية عالية ولا يتجعد بسرعة',
    prosFr: 'Excellente tenue des plis creux, look chic automne/hiver, grande fluidité et infroissable',
    cons: 'يتطلب ضبط تطابق الكاروهات (Raccord des Carreaux) في خطوط الفصالة بالمطلوة',
    consFr: 'Nécessite le raccord minutieux des carreaux lors de la coupe au matelas',
    avgPricePerMeter: 36
  }
};

export function getFabricInfo(fabricName: string = ''): FabricInfo {
  const lower = fabricName.toLowerCase();
  
  if (lower.includes('drap de laine') || lower.includes('drap_de_laine') || lower.includes('lainage') || lower.includes('laine') || lower.includes('صوف') || lower.includes('feutr') || lower.includes('brandebourg') || lower.includes('chinois') || (lower.includes('veste') && lower.includes('ecru')) || (lower.includes('veste') && lower.includes('officier'))) {
    return FABRIC_CATALOG['drap_de_laine'];
  }
  if (lower.includes('rib') || lower.includes('côte') || lower.includes('cote') || lower.includes('كوت')) {
    return FABRIC_CATALOG['rib'];
  }
  if (lower.includes('french terry') || lower.includes('bouclette') || lower.includes('فرنش تيري') || lower.includes('بوكليت') || lower.includes('غير مقطن')) {
    return FABRIC_CATALOG['french_terry'];
  }
  if (lower.includes('officier') || lower.includes('mao') || lower.includes('matelass') || lower.includes('ecru') || lower.includes('écru') || (lower.includes('toile') && lower.includes('coton')) || (lower.includes('twill') && (lower.includes('lourd') || lower.includes('coton')))) {
    return FABRIC_CATALOG['toile_coton'];
  }
  if (lower.includes('denim') || lower.includes('jean') || lower.includes('جينز') || lower.includes('دنيم')) {
    return FABRIC_CATALOG['denim'];
  }

  for (const key of Object.keys(FABRIC_CATALOG)) {
    if (
      lower.includes(key) ||
      (key === 'tartan' && (lower.includes('tartan') || lower.includes('carreaux') || lower.includes('كاروهات') || lower.includes('كارو') || lower.includes('ترتان'))) ||
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

  const isFrenchOrLatin = /[a-zA-Z]{3,}/.test(fabricName);
  const cleanDisplayName = isFrenchOrLatin
    ? fabricName.replace(/[\u0600-\u06FF]/g, '').trim()
    : fabricName.replace(/[a-zA-Z]/g, '').trim();

  return {
    arName: fabricName || 'ثوب ممشط فاخر مطابق للموديل',
    frName: cleanDisplayName || 'Tissu Technique Haute Qualité Conforme au Modèle',
    pricePerMeterMAD: '30 - 55 درهم/متر',
    pricePerMeterMADFr: '30 - 55 MAD/mètre',
    markets: 'موردو النسيج الصناعي المعتمدون (الدار البيضاء / طنجة)',
    marketsFr: 'Distributeurs & Fournisseurs Textiles Industriels Agréés (Casablanca / Tanger)',
    pros: 'جودة ممتازة وسهل في التفصيل والخياطة بالورشة ومناسب لعلامات الأزياء',
    prosFr: 'Excellente qualité, tombé soigné et confection industrielle aisée pour marques de mode',
    cons: 'يتطلب معايرة مقاسات الإبر والضغط في الماكينات الصناعية',
    consFr: 'Nécessite un réglage adapté du calibre des aiguilles et de la presse industrielle'
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
  } else if (pLower.includes('robe_chemise') || (pLower.includes('robe') && pLower.includes('chemise')) || pLower.includes('pliss') || pLower.includes('بليات') || pLower.includes('tartan') || pLower.includes('كاروهات')) {
    fournitures = 18;
    detailsFournitures = isAr
      ? 'أزرار كول شوميز وأساور (12 حبة) + فيزلين ياقة وبوانيات + حزام خصر جلدي/قماشي + خيط دي ام سي + إتيكيت وبولي باݣ'
      : 'Boutons col & poignets (x12) + thermocollant col & poignets + ceinture fine avec boucle + fil 120 + étiquettes & polybag';
  } else if (pLower.includes('robe') || pLower.includes('كسوة') || pLower.includes('فستان') || pLower.includes('abaya') || pLower.includes('عباية')) {
    fournitures = 15;
    detailsFournitures = isAr ? 'سحاب مخفي 60cm + أزرار لؤلؤية/كبس + شريط تنظيف + سفيفة خفيفة' : 'Zip invisible 60cm + boutons finition + biais propreté';
  } else if (pLower.includes('chemise') || pLower.includes('قميص') || pLower.includes('شوميز')) {
    fournitures = 10;
    detailsFournitures = isAr ? 'أزرار صدفية (10 قطع) + فيزلين كول وأساور + خيط تطريز عروة' : 'Boutons nacrés (x10) + triplure thermocollante col & poignets';
  }

  // Façon / Labor atelier & confection operations (المعدات ومصاريف الأتوليه)
  let facon = 25;
  let detailsFacon = isAr ? 'فصالة المطلوة الصناعية + تجميع الأجزاء بالماكينة + فينيسيون وكيّ بالبخار' : 'Coupe matelas + piquage assemblage + finitions & repassage';

  if (pLower.includes('robe_chemise') || (pLower.includes('robe') && pLower.includes('chemise')) || pLower.includes('pliss') || pLower.includes('بليات') || pLower.includes('tartan') || pLower.includes('كاروهات')) {
    facon = 35;
    detailsFacon = isAr
      ? 'فصالة مطلوة + تركيب كول شوميز وبوانيات الأكمام + تكسير وتثبيت بليات التنورة بالمكواة البخارية (Plissage) + عرى الحزام والفينيسيون'
      : 'Coupe matelas + montage col chemisier & poignets ballon + plissage vapeur jupe + passants ceinture & finitions';
  } else if (pLower.includes('manteau') || pLower.includes('مانطو') || pLower.includes('معطف')) {
    facon = 38;
    detailsFacon = isAr ? 'فصالة مانطو طويل + تركيب سحاب كامل + تبطين كابوش وجيوب + خياطة وتشطيب' : 'Coupe long manteau + zip séparable + doublure capuche + poches & finitions';
  } else if (pLower.includes('hoodie') || pLower.includes('هودي') || pLower.includes('sweat')) {
    facon = 24;
    detailsFacon = isAr ? 'فصالة هودي + تركيب جيب كنغر + كابوش مزدوج + بورد-كوت أساور وحزام' : 'Coupe hoodie + poche kangourou + capuche doublée + bord-côte poignets';
  } else if (pLower.includes('pantalon') || pLower.includes('سروال') || pLower.includes('jogging')) {
    facon = 20;
    detailsFacon = isAr ? 'فصالة سروال + تجميع الأرجل بسورجي 4 خيوط + تركيب حزام مطاطي وجيوب' : 'Coupe jogging + surjet 4 fils + ceinture élastique + poches';
  } else if (pLower.includes('robe') || pLower.includes('فستان') || pLower.includes('abaya')) {
    facon = 32;
    detailsFacon = isAr ? 'فصالة فستان ماكسي + تجميع الهيكل والأكمام + كفافة عريضة + كيّ بخاري' : 'Coupe robe maxi + assemblage manches fluides + ourlet bas + repassage';
  } else if (pLower.includes('t-shirt') || pLower.includes('تيشرت') || pLower.includes('تي شيرت')) {
    facon = 12;
    fournitures = 6;
    detailsFacon = isAr ? 'فصالة سريعة بالمطلوة + تجميع الأكتاف والسورجي + خياطة الروكوفروز' : 'Coupe matelas + assemblage surjet + recouvreuse';
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
    detailsFacon,
    coutRevientTotal,
    sellingPrice,
    fabricPros: isAr ? fab.pros : fab.prosFr,
    fabricCons: isAr ? fab.cons : fab.consFr
  };
}
