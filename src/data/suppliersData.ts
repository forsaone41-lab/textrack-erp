export interface SupplierCatalogItem {
  name: string;
  type: string;
  price: string;
  stockStatus: string;
  colors: string[];
  specs: string;
}

export interface SupplierReview {
  author: string;
  brand: string;
  rating: number;
  date: string;
  text: string;
}

export interface SupplierProfile {
  id: string;
  name: string;
  logo: string;
  cover: string;
  category: string;
  categoryLabel: string;
  city: string;
  cityTag: string;
  district: string;
  fabricTags: string[];
  whatsapp: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  verifiedBadge: string;
  desc: string;
  minQty: string;
  priceRange: string;
  deliveryTime: string;
  beyaAdvantage: string;
  products: string[];
  catalog: SupplierCatalogItem[];
  reviews: SupplierReview[];
}

export const SUPPLIERS_DATA: SupplierProfile[] = [
    {
      id: 'sup-1',
      name: 'مجمع أقمشة الشرق (Derb Omar)',
      logo: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
      category: 'tissu',
      categoryLabel: 'أقمشة وتوريد قطن',
      city: 'الدار البيضاء (درب عمر)',
      cityTag: 'casablanca',
      district: 'درب عمر، زنقة فاس، رقم 42',
      fabricTags: ['molleton', 'interlock', 'jersey', 'corduroy'],
      whatsapp: '212661849201',
      phone: '0661849201',
      rating: 4.9,
      reviewsCount: 38,
      verified: true,
      verifiedBadge: 'مورد موثوق ومعتمد من ورشة BEYA',
      desc: 'الموزع المعتمد لأرقى خامات الأقطان والمنسوجات الشتوية والصيفية في درب عمر زنقة فاس. أسعار تفضيلية خاصة بأعضاء شبكة BEYA.',
      minQty: 'ابتداءً من 25 كلغ (رولو واحد)',
      priceRange: '36 - 52 درهم/كلغ',
      deliveryTime: '24 ساعة داخل كازا • 48 ساعة لجميع مدن المغرب',
      beyaAdvantage: 'تخفيض 4 إلى 7 دراهم في الكيلو لأعضاء BEYA مع إمكانية أخذ رولو اختبار (Rouleau Test) قبل الكميات الكبرى',
      products: ['مولطون شتوي 340g مبطن', 'إنترلوك أصلي 100% قطن', 'جيرسي ليكرا صيفي 240g', 'كوتون كوردوروي'],
      catalog: [
        {
          name: 'مولطون شتوي مبطن 340g (Molleton Gratté 100% Coton)',
          type: 'molleton',
          price: '48 - 52 MAD / kg',
          stockStatus: 'متوفر بكميات كبرى فالمخزن',
          colors: ['أسود داكن', 'رمادي ميلونج', 'بيج أوف وايت', 'أزرق كحلي', 'أخضر زيتي'],
          specs: '100% قطن ممشط فاخر، وزن 340 غرام، عرض 1.85م، مخصص للهوديات والبدلات الرياضية الفاخرة، نسبة انكماش أقل من 2.5%.'
        },
        {
          name: 'إنترلوك دابل نيت أصلي (Interlock 100% Coton Double Knit 240g)',
          type: 'interlock',
          price: '42 - 46 MAD / kg',
          stockStatus: 'متوفر حالياً',
          colors: ['أبيض ناصع', 'أسود فاحم', 'بيج إكرو', 'أخضر غامق', 'بني شوكولا'],
          specs: 'وجهين ناعمين، مقاوم للتمزق ولا يتمدد مع الغسيل المتكرر، مثالي للتيشيرت الثقيل وسويت شيرت خفيف.'
        },
        {
          name: 'جيرسي قطن صيفي 240g (Heavyweight Cotton Jersey)',
          type: 'jersey',
          price: '36 - 40 MAD / kg',
          stockStatus: 'متوفر',
          colors: ['تشكيلة من 18 لون صيفي راقي'],
          specs: 'مخصص للتيشيرت الأوفرسايز الثقيل (Boxy Fit)، نسيج متماسك وثابت الصباغة.'
        },
        {
          name: 'كوتون كوردوروي مضلع (Velours Côtelé 280g)',
          type: 'corduroy',
          price: '44 - 48 MAD / mètre',
          stockStatus: 'متوفر بالطلب',
          colors: ['بني كراميل', 'كاكي زيتي', 'أسود', 'أزرق بترولي'],
          specs: 'تضليع ناعم وثابت للسراويل الكاجوال والقمصان الواسعة (Overshirts).'
        }
      ],
      reviews: [
        { author: 'أمين البورقادي', brand: 'علامة Casablanca Streetwear', rating: 5, date: 'منذ أسبوعين', text: 'أحسن مولطون 340g خدمنا بيه فهاد الموسم، الثوب نقي، الميزان مضبوط بالكيلو والمتر وما كاينش مشكل التكمش فالتصبين.' },
        { author: 'يونس الإدريسي', brand: 'مشروع أزياء شبابية', rating: 5, date: 'منذ شهر', text: 'تعامل راقي فدرب عمر، استفدنا من تخفيض BEYA VIP وعطانا رولو للتجربة قبل ما نكومونديو 300 كيلو.' },
        { author: 'فاطمة الزهراء', brand: 'Atelier Mode Casa', rating: 4.8, date: 'منذ شهر ونصف', text: 'الإنترلوك ديالهم ممتاز بزاف، الألوان ناصعة وما كتطلقش فالمصلوح.' }
      ]
    },
    {
      id: 'sup-2',
      name: 'أقمشة المسيرة الشمالية (Tissus Nord Tanger)',
      logo: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=300&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      category: 'tissu',
      categoryLabel: 'أقمشة سراويل وجاباردين',
      city: 'طنجة (المنطقة الحرة)',
      cityTag: 'tanger',
      district: 'المنطقة الحرة كزناية، مستودع C4، طنجة',
      fabricTags: ['gabardine', 'canvas', 'waterproof', 'lin'],
      whatsapp: '212665819203',
      phone: '0665819203',
      rating: 4.85,
      reviewsCount: 29,
      verified: true,
      verifiedBadge: 'مورد معتمد من ورشة BEYA',
      desc: 'متخصصون في توريد خامات السراويل الكارجو والسترات الواقية والمآزر بأعلى معايير المتانة ومقاومة التمزق.',
      minQty: 'ابتداءً من 30 متر',
      priceRange: '32 - 45 درهم/متر',
      deliveryTime: '24 ساعة لطنجة وتطوان • 48 ساعة لكازا وباقي المدن',
      beyaAdvantage: 'أسعار الجملة المباشرة مع إرسال بطاقات عينات الألوان مجاناً قبل الشراء',
      products: ['جاباردين كوتون ستريتش متين', 'قماش كوتون كانفاس (Canvas)', 'أقمشة تقنية ووتربروف', 'كتان صيفي بيور'],
      catalog: [
        {
          name: 'جاباردين كوتون ستريتش متين (Gabardine Stretch 280g)',
          type: 'gabardine',
          price: '34 - 38 MAD / m',
          stockStatus: 'متوفر',
          colors: ['كاكي عسكري', 'بيج صحراوي', 'أسود داكن', 'كحلي ملكي'],
          specs: 'نسيج قطني مع 3% سباندكس لمرونة الحركة في سراويل الكارجو والملابس المهنية، متانة فائقة ضد التمزق.'
        },
        {
          name: 'قماش كوتون كانفاس سميك (Canvas Cotton 320g)',
          type: 'canvas',
          price: '38 - 42 MAD / m',
          stockStatus: 'متوفر',
          colors: ['طبيعي إكرو', 'كاكي', 'أسود', 'أزرق داكن'],
          specs: 'نسيج خشن وأنيق للسترات التكتيكية (Worker Jackets) وحقائب القماش (Tote Bags).'
        },
        {
          name: 'أقمشة تقنية ووتربروف (Taslan Waterproof Microfibre)',
          type: 'waterproof',
          price: '40 - 45 MAD / m',
          stockStatus: 'متوفر',
          colors: ['أسود مات', 'رمادي فولاذي', 'أزرق بترولي'],
          specs: 'مقاومة تامة للماء والرياح 100%، طبقة عازلة وتنفس هوائي للسترات الشتوية والمطرية.'
        },
        {
          name: 'كتان صيفي بيور (100% Pure Linen 200g)',
          type: 'lin',
          price: '42 - 48 MAD / m',
          stockStatus: 'متوفر',
          colors: ['أبيض ناصع', 'بيج رملي', 'أزرق سماوي', 'أخضر باستيل'],
          specs: 'كتان طبيعي 100% بارد وصحي للمجموعات الصيفية والعبايات العصرية.'
        }
      ],
      reviews: [
        { author: 'كريم الطنجاوي', brand: 'Nordic Cargo Brand', rating: 5, date: 'منذ 3 أسابيع', text: 'جاباردين ستريتش من أروع ما يكون، السراويل خرجو روعة ومقاومين للتمزق.' },
        { author: 'سفيان مرابط', brand: 'Tanger Wear', rating: 4.7, date: 'منذ شهر', text: 'الووتربروف ديالهم خدمت بيه فيستات كابوتش، مقاوم للماء حقيقي والزبناء شكروه بزاف.' }
      ]
    },
    {
      id: 'sup-3',
      name: 'معرض أقمشة الدينيم والجينز المغربي (Denim Master MA)',
      logo: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=300&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&auto=format&fit=crop&q=80',
      category: 'tissu',
      categoryLabel: 'دينيم وجينز خام وستريتش',
      city: 'الدار البيضاء (سيدي معروف / كراج علال)',
      cityTag: 'casablanca',
      district: 'سيدي معروف، مجمع المستودعات النسيجية، الدار البيضاء',
      fabricTags: ['denim', 'chambray'],
      whatsapp: '212663984711',
      phone: '0663984711',
      rating: 4.92,
      reviewsCount: 34,
      verified: true,
      verifiedBadge: 'مورد معتمد من ورشة BEYA',
      desc: 'المرجع الأول لأقمشة الدجينز 100% قطن ودينيم ستريتش مع خيارات الأوزان من 10oz إلى 14oz للبراندات العصرية.',
      minQty: 'ابتداءً من 50 متر (نصف رولو)',
      priceRange: '38 - 56 درهم/متر',
      deliveryTime: 'تسليم خلال 24 ساعة بالمغرب',
      beyaAdvantage: 'توفير بطاقات دلافاج (Wash Cards) لاختبار الغسيل والتفتيح الكيماوي قبل الإنتاج',
      products: ['دينيم خام أصلي 13.5oz', 'جينز ستريتش مريح 11.5oz', 'قماش شامبراي خفيف 6oz'],
      catalog: [
        {
          name: 'دينيم خام أصلي (Raw Rigid Denim 13.5oz)',
          type: 'denim',
          price: '46 - 52 MAD / m',
          stockStatus: 'متوفر',
          colors: ['إنديجو غامق أصلي', 'أسود فحمي'],
          specs: '100% قطن ثقيل ممتاز للسراويل الواسعة (Wide Leg & Straight Fit) يقبل جميع أنواع الدلافاج.'
        },
        {
          name: 'دينيم ستريتش مريح (Comfort Stretch Denim 11.5oz)',
          type: 'denim',
          price: '42 - 48 MAD / m',
          stockStatus: 'متوفر',
          colors: ['أزرق متوسط دلافاج', 'أزرق حجري Stonewash'],
          specs: 'مرونة مريحة مخصص للسراويل العصرية والجواكت الجينز الخفيفة.'
        },
        {
          name: 'قماش شامبراي خفيف (Chambray Cotton 6oz)',
          type: 'chambray',
          price: '35 - 38 MAD / m',
          stockStatus: 'متوفر',
          colors: ['أزرق فاتح مائي', 'رمادي رمادي'],
          specs: 'خفيف وناعم مناسب للقمصان الصيفية والتنانير والفساتين.'
        }
      ],
      reviews: [
        { author: 'رضا العلمي', brand: 'Denim Lab Casa', rating: 5, date: 'منذ أسبوع', text: 'الدينيم الـ 13.5oz حقيقي وممتاز للدلافاج، خدمت بيه كوليكسيون كاملة وخرجت فالمستوى.' },
        { author: 'طارق بنسعيد', brand: 'Streetwear Vintage', rating: 4.9, date: 'منذ شهرين', text: 'السلعة ثابته والمتر محسوب بدقة، أحسن ثمن دجينز فكازا.' }
      ]
    },
    {
      id: 'sup-4',
      name: 'المركز الرقمي للطباعة والـ DTF (Digital Print Pro)',
      logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      category: 'impression',
      categoryLabel: 'طباعة وسيريغرافي',
      city: 'الدار البيضاء (عين السبع)',
      cityTag: 'casablanca',
      district: 'المنطقة الصناعية عين السبع، شارع الشفشاوني',
      fabricTags: ['impression', 'dtf'],
      whatsapp: '212662938102',
      phone: '0662938102',
      rating: 4.95,
      reviewsCount: 45,
      verified: true,
      verifiedBadge: 'مورد معتمد من ورشة BEYA',
      desc: 'ورشة طباعة صناعية مجهزة بـ 4 ماكينات DTF صناعية يابانية وسيريغرافي أوتوماتيكي بدقة ألوان ومقاومة غسيل تفوق 50 غسلة.',
      minQty: 'ابتداءً من 25 قطعة',
      priceRange: '8 - 25 درهم للقطعة',
      deliveryTime: 'إنجاز وتسليم خلال 48 إلى 72 ساعة',
      beyaAdvantage: 'سعر تفضيلي للمتر DTF رول + فحص مجاني لملفات التصميم وضبط الألوان قبل الطبع',
      products: ['طباعة DTF فائقة النقاء HD', 'سيريغرافي Plastisol & Waterbase', 'فلوكاج قطني مخملي', 'Sublimation حراري'],
      catalog: [
        {
          name: 'طباعة DTF عالية النقاء رول (Mètre Linéaire DTF HD)',
          type: 'dtf',
          price: '60 - 75 MAD / m',
          stockStatus: 'تسليم فوري في 24h',
          colors: ['ألوان CMYK كاملة + أبيض ناصع'],
          specs: 'أحبار يابانية أصلية وبودرة ناعمة كورية، ثبات عالي وملمس رطب على القطن والبوليستر.'
        },
        {
          name: 'سيريغرافي بلاستيزول صناعي (Sérigraphie Plastisol)',
          type: 'impression',
          price: '8 - 18 MAD / pc',
          stockStatus: 'ابتداءً من 50 قطعة',
          colors: ['مطابقة دقيقة لألوان Pantone'],
          specs: 'مقاومة استثنائية وثبات عالي للكميات الكبرى مع جفاف بالأفران الحرارية.'
        },
        {
          name: 'فلوكاج مخملي حراري (Flockage Velours 3D)',
          type: 'impression',
          price: '14 - 22 MAD / pc',
          stockStatus: 'متوفر',
          colors: ['أسود، أحمر، أبيض، كحلي'],
          specs: 'ملمس مخملي فاخر بارز مخصص للماركات الفخمة والشعارات البارزة.'
        }
      ],
      reviews: [
        { author: 'عادل الناصري', brand: 'Marque Hoodies Rabat', rating: 5, date: 'منذ 5 أيام', text: 'الـ DTF ديالهم كيبان بحال السيريغرافي، رطب وما كيتشققش نهائياً وخا تصبن فالماكينة.' },
        { author: 'عمر الشاوي', brand: 'Urban Style MA', rating: 5, date: 'منذ 3 أسابيع', text: 'سرعة فالتنفيذ وتعامل مهني، كيعطيوك الألوان مضبوطة كما صيفطتيها فالـ PDF.' }
      ]
    },
    {
      id: 'sup-5',
      name: 'ورشة الفجر للتطريز الصناعي (Broderie Industrielle Tajima)',
      logo: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      category: 'broderie',
      categoryLabel: 'تطريز آلي متطور',
      city: 'فاس / الدار البيضاء',
      cityTag: 'fes',
      district: 'المدينة الصناعية سيدي براهيم، فاس • ونقطة استلام بالدار البيضاء',
      fabricTags: ['broderie'],
      whatsapp: '212664728190',
      phone: '0664728190',
      rating: 4.88,
      reviewsCount: 26,
      verified: true,
      verifiedBadge: 'مورد معتمد من ورشة BEYA',
      desc: 'أسطول ماكينات تطريز يابانية Tajima 12 رأس لدقة متناهية وسرعة فائقة في تنفيذ أرقى شعارات الماركات بتطريز بارز 3D أو مسطح.',
      minQty: 'ابتداءً من 40 قطعة',
      priceRange: '6 - 22 درهم للقطعة',
      deliveryTime: '3 إلى 5 أيام عمل',
      beyaAdvantage: 'مجانية عمل برنامج التطريز (Piquage Broderie DST) للطلبيات فوق 100 قطعة',
      products: ['تطريز ثلاثي الأبعاد 3D بارز', 'تطريز شعارات الهودي والكابوتش', 'بادجات مطرزة حرارية (Écussons)'],
      catalog: [
        {
          name: 'تطريز ثلاثي الأبعاد بارز (Broderie 3D avec Mousse)',
          type: 'broderie',
          price: '12 - 22 MAD / pc',
          stockStatus: 'متوفر',
          colors: ['جميع ألوان الخيوط Madeira الألمانية'],
          specs: 'بروز واضح وجمالي لأغطية الرأس، الصدر والأكمام مع حشوة فوم خاصة.'
        },
        {
          name: 'تطريز شعارات مسطح دقيق (Broderie Plate Haute Précision)',
          type: 'broderie',
          price: '6 - 14 MAD / pc',
          stockStatus: 'متوفر',
          colors: ['خيوط بوليستر مقاومة للكلور'],
          specs: 'مناسب للتطريز على التيشيرت والقمصان والبدلات بدقة غرز تصل إلى 0.1 مم.'
        },
        {
          name: 'بادجات مطرزة حرارية (Écussons Brodés Thermocollants)',
          type: 'broderie',
          price: '8 - 15 MAD / pc',
          stockStatus: 'متوفر',
          colors: ['حواف ليزرية متقنة'],
          specs: 'جاهزة للصق بالمكبس الحراري مباشرة على السراويل والجاكيتات.'
        }
      ],
      reviews: [
        { author: 'حمزة الفاسي', brand: 'Brand Casablanca', rating: 5, date: 'منذ شهر', text: 'الفينيسيون ديال التطريز الـ 3D نقي بزاف، الخيط ما كيتسلتش والشعار كيبان بريميوم.' }
      ]
    },
    {
      id: 'sup-6',
      name: 'مؤسسة الأناقة للوازم الخياطة والتغليف (Packaging & Accessories)',
      logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      category: 'accessoires',
      categoryLabel: 'لوازم خياطة وتغليف',
      city: 'الدار البيضاء (كراج علال)',
      cityTag: 'casablanca',
      district: 'كراج علال، قيسارية النصر، رقم 18، الدار البيضاء',
      fabricTags: ['accessoires', 'packaging'],
      whatsapp: '212668901234',
      phone: '0668901234',
      rating: 4.9,
      reviewsCount: 31,
      verified: true,
      verifiedBadge: 'مورد معتمد من ورشة BEYA',
      desc: 'تجهيز كامل لمستلزمات الفينيسيون الراقي لعلامات الملابس: أكياس مخصصة، سحابات معدنية YKK، حبال هودي، وليبلات منسوجة.',
      minQty: 'ابتداءً من 100 قطعة',
      priceRange: '0.80 - 15 درهم للقطعة',
      deliveryTime: 'تسليم خلال 24 ساعة داخل كازا والمغرب',
      beyaAdvantage: 'طبع الشعار المخصص على الأكياس (Polybags) ابتداءً من 500 كيس فقط مع حبال كوتون مجانية للعينة',
      products: ['أكياس بولي باغ مخصصة (Polybags)', 'بطاقات الهانج تاج (Hangtags)', 'سحابات معدنية YKK', 'حبال هودي كوتون سميكة'],
      catalog: [
        {
          name: 'أكياس بولي باغ بزبلايد مع لوغو البراند (Polybags Ziplock)',
          type: 'packaging',
          price: '1.40 - 2.20 MAD / pc',
          stockStatus: 'متوفر ومخصص',
          colors: ['مات مطفي فاخر أو شفاف ناصع'],
          specs: 'سحاب محكم الإغلاق وثقب تنفيس، يعطي انطباع ماركة عالمية للزبون عند الاستلام.'
        },
        {
          name: 'سحابات معدنية وبلاستيكية YKK معتمدة',
          type: 'accessoires',
          price: '4.50 - 12 MAD / pc',
          stockStatus: 'متوفر بجميع المقاسات',
          colors: ['سحاب نحاسي، فضي، عاكس للضوء، ووتربروف'],
          specs: 'سلاسة حركة ومتانة لا تتعطل مع الاستخدام المتكرر.'
        },
        {
          name: 'حبال هودي كوتون سميكة (Cordons Coton 12mm)',
          type: 'accessoires',
          price: '2.50 - 4.50 MAD / pc',
          stockStatus: 'متوفر بأطراف حديدية Embout Métal',
          colors: ['أبيض، أسود، بيج، رمادي'],
          specs: 'إكسسوار راقي يرفع من قيمة الهودي الرياضي وجودته الظاهرة.'
        }
      ],
      reviews: [
        { author: 'ياسين الصقلي', brand: 'Street Label', rating: 5, date: 'منذ أسبوعين', text: 'الأكياس الزيبلوك باللوغو ديالي جاو كيحمقو، بدلو المظهر ديال البراند ديالي 180 درجة.' }
      ]
    }
  ];

export const getSupplierById = (id: string): SupplierProfile | undefined => {
  return SUPPLIERS_DATA.find(s => s.id === id);
};
