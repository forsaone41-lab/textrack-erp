export interface ModelisteProfile {
  id: string;
  name: string;
  studio: string;
  badge: string;
  avatar: string;
  banner: string;
  headline: string;
  city: string;
  availability: string;
  available: boolean;
  experienceYears: string;
  turnaround: string;
  startPriceMAD: number;
  rating: number;
  reviewsCount: number;
  completedPatterns: number;
  endorsementsBase: number;
  verified: boolean;
  whatsapp: string;
  phone: string;
  category: string;
  categoryLabel: string;
  software: string[];
  specialities: string[];
  desc: string;
  about: string;
  experiences: { role: string; company: string; period: string; desc: string }[];
  education: string;
  certifications: string[];
  portfolio: { title: string; image: string; tag: string; specs: string }[];
  pricing: { basePattern: number; gradation: number; simulation3d: number; ficheTech: number };
  reviews: { author: string; brand: string; comment: string; rating: number; date: string }[];
}

export const MODELISTES_DATA: ModelisteProfile[] = [
  {
    id: 'mod-1',
    name: 'فاطمة الزهراء العمراني',
    studio: 'Atelier Patronage Pro Casablanca',
    badge: 'موديليست معتمدة من BEYA Creative',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1558769132-cb1fac08c04a?auto=format&fit=crop&w=1200&q=80',
    headline: 'Senior Fashion Modéliste & Pattern Maker • Spécialiste Streetwear & Oversize 340g • Ex-Lectra & ESITH',
    city: 'الدار البيضاء / طنجة (متاح عن بعد وحضوري)',
    availability: 'متاح للطلبيات والمجموعات الجديدة 🟢',
    available: true,
    experienceYears: '9 سنوات',
    turnaround: '24 إلى 48 ساعة',
    startPriceMAD: 220,
    rating: 5.0,
    reviewsCount: 94,
    completedPatterns: 145,
    endorsementsBase: 88,
    verified: true,
    whatsapp: '212663049182',
    phone: '0663049182',
    category: 'streetwear',
    categoryLabel: 'ستريتوير وملابس عصرية',
    software: ['Lectra Modaris V8', 'CLO 3D Simulation', 'Gerber Accumark', 'Optitex PDS'],
    specialities: ['هوديات وتيشرتات أوفرسايز Drop Shoulder', 'سراويل سويت بانتس وشورتات', 'ملابس Streetwear عصرية'],
    desc: 'إعداد ملفات الباترون الدقيقة المتوافقة مباشرة مع ماكينات الفصالة بالليزر مع جدول تدريج مقاسات مضبوط (Gradation XS إلى 3XL) ومحاكاة 3D واقعية للموديل قبل التفصيل لضمان انعدام الأخطاء بنسبة 100%.',
    about: 'خريجة المعهد العالي لصناعات النسيج والألبسة (ESITH) سنة 2015. اشتغلت لأكثر من 5 سنوات في كبريات وحدات التصدير بمدينة طنجة والدار البيضاء، قبل تأسيس ورشتي الخاصة لمواكبة براندات الملابس الناشئة في المغرب والخليج. أقدم خدمة شاملة تشمل الباترون الأساسي، التدريج الرقمي لكافة المقاسات، تحسين استهلاك الثوب (Placement)، وملفات جاهزة للطباعة والتصدير (DXF-AAMA, RUL, PDF 1:1, HPGL).',
    experiences: [
      { role: 'Lead Modéliste & Fondatrice', company: 'Atelier Patronage Pro (Casablanca)', period: '2020 - الآن', desc: 'إعداد باترونات لأكثر من 85 براند ستريتوير ومحاكاة 3D تفاعلية.' },
      { role: 'Modéliste Senior Lectra Modaris', company: 'Groupe Textile Confection Export (Tanger)', period: '2016 - 2020', desc: 'تطوير الباترونات الصناعية والتدريج لطلبيات تفوق 50,000 قطعة شهرياً.' }
    ],
    education: 'دبلوم مهندس تقني في موديليزم الملابس والنسيج - ESITH الدار البيضاء (2015)',
    certifications: ['Lectra Modaris V8 Expert', 'CLO 3D Virtual Prototyping Certified'],
    portfolio: [
      { title: 'هودي أوفرسايز Heavyweight 350g', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80', tag: 'Streetwear', specs: 'Drop Shoulder • Double Capuche • Gradation XS-XXL' },
      { title: 'سويت بانتس فضفاض بجيوب بسحاب مخفي', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80', tag: 'Sweatpants', specs: 'Coupe Baggy • Taille élastique • Poches zippées' },
      { title: 'تيشيرت Boxy Fit قطن 240g ممشط', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', tag: 'Boxy Fit', specs: 'Col bord-côte renforcé • Coutures renforcées' }
    ],
    pricing: { basePattern: 220, gradation: 40, simulation3d: 120, ficheTech: 60 },
    reviews: [
      { author: 'أمين البوشيخي', brand: 'North Wear Casablanca', comment: 'فاطمة الزهراء خدمت معنا كوليكسيون كاملة د الشتا (800 هودي وسويت بانتس). الباترون جا مضبوط فالفصالة 100% وما ضيعنا حتى سنتيم فالثوب.', rating: 5, date: 'منذ أسبوعين' },
      { author: 'سارة لمرابط', brand: 'Urban Modest', comment: 'سرعة واحترافية كبيرة. بعثات ليا ملفات DXF مع محاكاة 3D بينات ليا الموديل قبل ما نقطعو الثوب. نوصي بها بقوة.', rating: 5, date: 'منذ شهر' }
    ]
  },
  {
    id: 'mod-2',
    name: 'ياسين الصنهاجي',
    studio: 'Industrial Pattern Engineering Studio',
    badge: 'مهندس باترون صناعي معتمد',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
    headline: 'مهندس ملابس وموديلست تيكنيكال وسراويل كارجو ودنيم • خبرة 8 سنوات في الباترونات المعقدة والجيوب',
    city: 'الدار البيضاء (سيدي معروف / البرنوصي)',
    availability: 'متاح للطلبيات 🟢',
    available: true,
    experienceYears: '8 سنوات',
    turnaround: '48 ساعة',
    startPriceMAD: 280,
    rating: 4.95,
    reviewsCount: 68,
    completedPatterns: 98,
    endorsementsBase: 73,
    verified: true,
    whatsapp: '212664556677',
    phone: '0664556677',
    category: 'denim',
    categoryLabel: 'دنيم وسراويل كارجو تكتيكية',
    software: ['Gerber Accumark', 'Optitex', 'Adobe Illustrator Technical'],
    specialities: ['سراويل كارجو بجيوب تكتيكية ثلاثية الأبعاد', 'جاكيتات بومبر وفيستات مبطنة', 'جينز ودنيم صناعي 12oz-14oz'],
    desc: 'متخصص في الباترونات المعقدة والملابس ذات الجيوب والقصات الهندسية الدقيقة مع إعداد الـ Fiche Technique ومقادير استهلاك القماش (Consommation).',
    about: 'مهندس صناعي للملابس خريج المدارس المتخصصة بالدار البيضاء. عملت لأكثر من 6 سنوات في مصانع الجينز والملابس الوظيفية Technical Wear. أركز على الدقة الهندسية للجيوب والسحابات وخياطة الأوفرلوك المزدوجة والمقاسات الأوروبية والمغربية.',
    experiences: [
      { role: 'Pattern Engineer & Technical Director', company: 'Denim & Cargo Lab Casablanca', period: '2021 - الآن', desc: 'هندسة باترونات السراويل متعددة الجيوب والجاكيتات التقنية.' },
      { role: 'Modéliste Industriel', company: 'Morocco Jeans Factory', period: '2017 - 2021', desc: 'ضبط الباترونات لإنتاج الدنيم ومراعاة انكماش الغسيل (Retrait Lavage).' }
    ],
    education: 'دبلوم عالي في هندسة الباترون الصناعي - الدار البيضاء',
    certifications: ['Gerber Technology Certified Specialist', 'Technical Garment Construction'],
    portfolio: [
      { title: 'سروال كارجو بـ 6 جيوب تكتيكية ثلاثية الأبعاد', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80', tag: 'Cargo Pants', specs: 'Poches à soufflet • Renforts genoux • Gradation 28-38' },
      { title: 'جاكيت بومبر مبطنة بياقة كلاسيكية وسحاب معدني', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', tag: 'Bomber Jacket', specs: 'Doublure thermique • Bord-côtes poignets et col' },
      { title: 'فيست دنيم جينز خام 13.5oz مع خياطة مزدوجة', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80', tag: 'Denim Vest', specs: 'Poches poitrine à rabat • Surpiqûres sellier contrastées' }
    ],
    pricing: { basePattern: 280, gradation: 50, simulation3d: 130, ficheTech: 80 },
    reviews: [
      { author: 'عادل السعيدي', brand: 'Tactical Gear MA', comment: 'ياسين فنان فالسراويل د الكارجو. الجيوب جاو مضبوطين بالسنتيم وما كاينش فرق بين البياسات. تعامل احترافي ورائع.', rating: 5, date: 'منذ 3 أسابيع' }
    ]
  },
  {
    id: 'mod-3',
    name: 'سلمى المنصوري',
    studio: 'Salma Modest & Haute Couture Studio',
    badge: 'مصممة أزياء وموديلست محترفة',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    headline: 'مصممة أزياء وموديلست للعبايات والملابس النسائية الراقية • محاكاة 3D للأقمشة المنسكبة والحراير',
    city: 'الرباط / فاس (خدمات عن بعد لجميع المدن)',
    availability: 'متاحة للمجموعات الجديدة 🟢',
    available: true,
    experienceYears: '7 سنوات',
    turnaround: '48 ساعة مع محاكاة 3D',
    startPriceMAD: 250,
    rating: 4.92,
    reviewsCount: 52,
    completedPatterns: 120,
    endorsementsBase: 64,
    verified: true,
    whatsapp: '212667112233',
    phone: '0667112233',
    category: 'femme',
    categoryLabel: 'عبايات وملابس نسائية راقية',
    software: ['CLO 3D', 'Lectra Modaris', 'Adobe Photoshop'],
    specialities: ['عبايات خليجية عصرية كيمونو', 'فساتين لين وكاجوال نسائي', 'أطقم صيفية مستورة (Modest Fashion)'],
    desc: 'إعداد باترونات راقية للملابس النسائية المحتشمة والعصرية مع مراعاة انسيابية القماش وتناسق المقاسات الخليجية والمغربية.',
    about: 'خريجة المعهد الوطني للأزياء والموضة. متخصصة في خطوط المودست فاشن والعبايات المعاصرة. أتميز بمحاكاة حركة الأقمشة المنسكبة (كريب الحرير، لين، شيفون) على مانيكان رقمي قبل القص الفعلي.',
    experiences: [
      { role: 'Modéliste & Créatrice Modest Wear', company: 'Salma Pattern Studio Rabat', period: '2019 - الآن', desc: 'إعداد باترونات لأكثر من 40 براند عبايات وأزياء محتشمة.' }
    ],
    education: 'دبلوم تصميم أزياء وموديليزم راقي - معهد الفنون التطبيقية الرباط',
    certifications: ['CLO 3D Master Pattern & Draping'],
    portfolio: [
      { title: 'عباية كيمونو بقصة انسيابية من قماش الكريب الملكي', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=600&q=80', tag: 'Abaya', specs: 'Coupe évasée • Manches amples • Longueur personnalisable' },
      { title: 'فستان صيفي من الكتان الطبيعي (Lin 100%)', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80', tag: 'Robe Lin', specs: 'Poches latérales • Ceinture amovible • Tomber parfait' }
    ],
    pricing: { basePattern: 250, gradation: 45, simulation3d: 110, ficheTech: 50 },
    reviews: [
      { author: 'مريم التازي', brand: 'Noor Modest Wear', comment: 'سلمى مبدعة كتعرف طيحة الثوب مزيان وكتخرج الباترون مضبوط ما كيحتاجش حتى إعادة روتوش.', rating: 5, date: 'منذ شهر' }
    ]
  },
  {
    id: 'mod-4',
    name: 'كريم العلمي',
    studio: 'Alami Sportswear Pattern Lab',
    badge: 'خبير باترونات الملابس الرياضية',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    headline: 'خبير باترون الألبسة الرياضية والأكتيف وير • خبرة بمصانع التصدير بطنجة (Dry-Fit & Lycra)',
    city: 'طنجة (المنطقة الحرة / مغوغة)',
    availability: 'متاح للطلبيات السريعة 🟢',
    available: true,
    experienceYears: '6 سنوات',
    turnaround: '24 ساعة',
    startPriceMAD: 200,
    rating: 4.88,
    reviewsCount: 41,
    completedPatterns: 76,
    endorsementsBase: 55,
    verified: true,
    whatsapp: '212669334455',
    phone: '0669334455',
    category: 'sport',
    categoryLabel: 'ألبسة رياضية وأكتيف وير',
    software: ['Lectra Modaris', 'Adobe Illustrator Technical'],
    specialities: ['بدلات تداريب رياضية Tracksuits', 'تيشيرتات دراي فيت وضغط (Compression)', 'شورتات جيم وركض'],
    desc: 'دراية كاملة بمرونة الأقمشة التقنية والليكرا لضمان راحة الرياضي أثناء الحركة وسهولة تنفيذ الدرزات المسطحة (Flatlock).',
    about: 'قضيت 6 سنوات في مصانع النسيج الرياضي المخصصة للتصدير الأوروبي بمدينة طنجة. أقدم باترونات محسوبة بدقة على أقمشة البوليستر المطاطة والليكرا، مع مراعاة قصات التهوية (Mesh Panels) وخياطة الـ Flatlock الرياضية.',
    experiences: [
      { role: 'Sportswear Pattern Maker', company: 'Tanger Activewear Export', period: '2018 - 2023', desc: 'تطوير بدلات التداريب والملابس التقنية لماركات عالمية.' }
    ],
    education: 'تقني متخصص في ملابس الرياضة والنسيج المرن - طنجة',
    certifications: ['Lectra Garment Pattern Expert'],
    portfolio: [
      { title: 'طقم تداريب رياضية Tracksuit بقصة رياضية عصرية', image: 'https://images.unsplash.com/photo-1483721074577-494b8e5c8e31?auto=format&fit=crop&w=600&q=80', tag: 'Tracksuit', specs: 'Passe-pouce aux manches • Poches zippées discrètes' },
      { title: 'تيشيرت رياضي دراي فيت بقصات تهوية جانبية', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80', tag: 'Dry-Fit', specs: 'Coutures flatlock anti-irritation • Empiècements mesh' }
    ],
    pricing: { basePattern: 200, gradation: 40, simulation3d: 90, ficheTech: 50 },
    reviews: [
      { author: 'عثمان الفهري', brand: 'Morocco Athletics', comment: 'كريم سريع جداً وجودة خدمتو لا نقاش فيها. الباترون وجد فـ 24 ساعة مضبوط فالفصالة.', rating: 5, date: 'منذ شهرين' }
    ]
  },
  {
    id: 'mod-5',
    name: 'هدى بنجلون',
    studio: 'Atelier Benjelloun Couture & Tailleur',
    badge: 'أستاذة موديليزم التايلور والبدلات الرسمية',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    headline: 'موديلست وخياطة تايلور نسائي ورجالي • بليزرات، معاطف، وأطقم فورمال راقية',
    city: 'الدار البيضاء / مراكش',
    availability: 'متاحة للطلبيات الخاصة 🟢',
    available: true,
    experienceYears: '11 سنة',
    turnaround: '48 إلى 72 ساعة',
    startPriceMAD: 320,
    rating: 4.96,
    reviewsCount: 84,
    completedPatterns: 160,
    endorsementsBase: 92,
    verified: true,
    whatsapp: '212661889900',
    phone: '0661889900',
    category: 'femme',
    categoryLabel: 'بليزرات وأطقم رسمية تايلور',
    software: ['Lectra Modaris', 'Gerber Accumark', 'Optitex'],
    specialities: ['بليزرات فورمال مبطنة', 'معاطف شتوية كشمير وصوف', 'بدلات رسمية نسائية ورجالية'],
    desc: 'خبرة أكثر من 11 سنة في الباترون الكلاسيكي وفنون التبطين والياقات الدقيقة لبليزرات ومعاطف براندات البريت-آ-بورتي الراقية.',
    about: 'اشتغلت في ورشات باريسية ومغربية لأكثر من عقد. أتقن هندسة الأكتاف (Épaulettes)، الصدر المقوى (Plastron)، وبطانة الساتان الداخلية لضمان وقفة ملوكية للبياسة.',
    experiences: [
      { role: 'Master Tailleur & Modéliste Chef', company: 'Atelier Benjelloun Couture', period: '2015 - الآن', desc: 'إعداد باترونات البليزرات والأطقم الرسمية لأرقى العلامات بالمغرب.' }
    ],
    education: 'دبلوم Modéliste Haute Couture - باريس / الدار البيضاء',
    certifications: ['Diplôme d\'État de Modélisme Industriel & Tailleur'],
    portfolio: [
      { title: 'بليزر كلاسيكي مبطن بياقة كول تايور وأكتاف مضبوطة', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', tag: 'Blazer', specs: 'Plastron traditionnel • Doublure satinée • Poches passepoilées' },
      { title: 'معطف شتوي طويل من قماش الكشمير المخلوط', image: 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=600&q=80', tag: 'Manteau Long', specs: 'Fente dos aisance • Ceinture amovible • Épaulettes légères' }
    ],
    pricing: { basePattern: 320, gradation: 60, simulation3d: 140, ficheTech: 80 },
    reviews: [
      { author: 'حسناء العلمي', brand: 'Chic & Formal Casablanca', comment: 'هدى أستاذة فالتايلور. البليزر جا قمة فالرقي والوقفة بلا أي عيب فالفينيسيون.', rating: 5, date: 'منذ أسبوعين' }
    ]
  }
];

export const getModelisteById = (id: string): ModelisteProfile | undefined => {
  return MODELISTES_DATA.find(m => m.id === id || m.id === `mod-${id}` || m.name.includes(id));
};
