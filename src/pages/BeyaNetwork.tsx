import React, { useState, useEffect } from 'react';
import { 
  Globe, Users, Package, MessageCircle, ArrowRight, ArrowLeft, Search, 
  Send, ThumbsUp, MessageSquare, ShieldCheck, CheckCircle2, Phone, 
  Sparkles, Plus, X, ExternalLink, Filter, MapPin, Tag, Scissors, 
  Building2, Layers, Award, Clock, ChevronDown, Check, Share2, 
  SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag, Palette, 
  Ruler, Eye, Briefcase, FileCode2, Star
} from 'lucide-react';
import { User, saveRecord } from '../types';

interface BeyaNetworkProps {
  currentUser: User | null;
  onLogout?: () => void;
}

export default function BeyaNetwork({ currentUser, onLogout }: BeyaNetworkProps) {
  const isAr = true; // BEYA NETWORK is primarily in Arabic / Darija for Moroccan community
  const emailKey = (currentUser?.email || '').toLowerCase().trim();
  const isPilotAuthorized = emailKey === 'forsaone41@gmail.com' || currentUser?.role === 'admin';

  // Navigation tabs in BEYA NETWORK (Feed, Fournisseurs, Modélistes, Clients BEYA, Groupage)
  const [activeTab, setActiveTab] = useState<'feed' | 'suppliers' | 'modelistes' | 'clients' | 'groupage'>('feed');

  // Search query & Category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [forumTopicFilter, setForumTopicFilter] = useState<'all' | 'livraison' | 'marketing' | 'tissus' | 'conseils' | 'groupage'>('all');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState<'all' | 'tissu' | 'impression' | 'broderie' | 'accessoires'>('all');
  const [modelisteCategoryFilter, setModelisteCategoryFilter] = useState<'all' | 'streetwear' | 'femme' | 'sport' | 'denim'>('all');
  const [clientCategoryFilter, setClientCategoryFilter] = useState<'all' | 'streetwear' | 'casual' | 'modest' | 'sport'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');

  // Profile Form & Completion
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    let saved: any = null;
    try {
      const raw = localStorage.getItem(`beya_network_profile_${emailKey}`);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    return {
      brandName: saved?.brandName || currentUser?.brandName || (currentUser as any)?.store_name || (currentUser as any)?.storeName || currentUser?.nom || 'FAS Wear',
      city: saved?.city || currentUser?.ville || 'الدار البيضاء (Casablanca)',
      phone: saved?.phone || currentUser?.telephone || '0600000000',
      bio: saved?.bio || currentUser?.networkBio || 'علامة تجارية مغربية متخصصة في ملابس الستريتوير والهوديات الأوفرسايز'
    };
  });

  const [isProfileSetupCompleted, setIsProfileSetupCompleted] = useState<boolean>(() => {
    if (currentUser?.networkProfileCompleted) return true;
    try {
      if (localStorage.getItem(`beya_network_completed_${emailKey}`) === 'true') return true;
    } catch {}
    return true;
  });

  // Posts Feed State (Persisted)
  const [posts, setPosts] = useState<Array<{
    id: string;
    author: string;
    authorRole: string;
    authorRoleKey: 'brand' | 'supplier' | 'imprimeur' | 'modeliste';
    city: string;
    title: string;
    category: 'livraison' | 'marketing' | 'tissus' | 'conseils' | 'groupage';
    content: string;
    date: string;
    likesCount: number;
    liked?: boolean;
    whatsapp?: string;
    whatsappText?: string;
    image?: string;
    comments: Array<{
      id: string;
      author: string;
      role: string;
      city: string;
      content: string;
      date: string;
    }>;
  }>>(() => {
    try {
      const saved = localStorage.getItem('beya_network_posts_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'post-sup-1',
        author: 'سفيان تيكستيل (Derb Omar)',
        authorRole: 'مورد أقمشة معتمد BEYA',
        authorRoleKey: 'supplier',
        city: 'الدار البيضاء',
        title: '🧵 دفعة جديدة من قماش الملتون الشتوي 340g (Molleton Gratté 100% Coton)',
        category: 'tissus',
        content: 'السلام عليكم الإخوان أصحاب البراندات، دخلات اليوم دفعة جديدة من قماش الملتون الشتوي السميك (Molleton Gratté 340 GSM) قطن ممشط 100%، مخصص للهوديات الأوفرسايز وسراويل السويت بانتس الفاخرة.\n\nالألوان المتوفرة: الأسود الفاحم، بيج أوف وايت، أخضر كاكي، بني شوكولا، كحلي داكن.\n\nالكميات متوفرة ابتداءً من رولو واحد (25 كلغ) مع إمكانية إرسال العينات لجميع المدن.',
        date: 'منذ ساعتين',
        likesCount: 38,
        whatsapp: '212661849201',
        whatsappText: 'السلام عليكم سي سفيان، شفت المنشور ديالك فـ BEYA NETWORK وبغيت نسولك على ثوب الملتون 340g والألوان المتوفرة.',
        comments: [
          {
            id: 'c-1',
            author: 'أمين البراندي',
            role: 'صاحب علامة تجارية',
            city: 'الدار البيضاء',
            content: 'تبارك الله عليك سي سفيان، واش الثوب مكيتحببش مع التصبين؟',
            date: 'منذ ساعة'
          },
          {
            id: 'c-2',
            author: 'سفيان تيكستيل',
            role: 'مورد أقمشة معتمد',
            city: 'الدار البيضاء',
            content: 'مرحبا أخي أمين، الثوب معالج Anti-Pilling ومضمون 100%، تقدر تاخذ عينة للتجربة فالمغسلة قبل ما تفصل.',
            date: 'منذ 40 دقيقة'
          }
        ]
      },
      {
        id: 'post-mod-1',
        author: 'فاطمة الزهراء العمراني',
        authorRole: 'موديلست معتمدة BEYA',
        authorRoleKey: 'modeliste',
        city: 'الدار البيضاء / طنجة',
        title: '📐 نصائح ذهبية لباترون الهودي الأوفرسايز (Drop Shoulder Oversize Pattern)',
        category: 'conseils',
        content: 'السلام عليكم أصحاب الماركات، باش الهودي الأوفرسايز يجي طايح مزيان (Silhouette Boxy) وما يعطيش منظر خايب فـ الكمام:\n1. نزول الكتف (Emmanchure basse): هبط بـ 4 حتى لـ 6 سم على الكتف العادي.\n2. القب (Capuche): دير فيه ارتفاع 38 سم مع Doublure ثوب باش يبقى واقف وما يطيحش على الظهر.\n3. الكوت والريبان (Bord-côte): استعمل كوت قطن 2x2 ستريتش باش الكول والكمام يرجعو لبلاصتهم وما يتوسّعوش.',
        date: 'منذ 4 ساعات',
        likesCount: 56,
        whatsapp: '212663049182',
        whatsappText: 'السلام عليكم أستاذة فاطمة الزهراء، تواصلت معك من خلال BEYA NETWORK بخصوص إعداد باترون لهودي جديد.',
        comments: [
          {
            id: 'c-mod-1',
            author: 'FAS Wear',
            role: 'صاحب علامة تجارية',
            city: 'الدار البيضاء',
            content: 'معلومات تقنية دقيقة شكراً بزاف! غادي نتواصل معاك بخصوص الكوليكسيون الياية.',
            date: 'منذ ساعتين'
          }
        ]
      },
      {
        id: 'post-client-1',
        author: 'أمين البراندي',
        authorRole: 'صاحب براند ملابس شبابية',
        authorRoleKey: 'brand',
        city: 'الدار البيضاء',
        title: '🚚 شكون أحسن شركة توصيل (Livraison) من ناحية سرعة التحصيل (Retour de fonds) هاد الأيام؟',
        category: 'livraison',
        content: 'السلام عليكم الإخوان رواد الموضة، بغيت نستاشر معاكم على تجاربكم مع شركات التوصيل هاد الشهر؟\nشكون لي عندهم نسبة التسليم (Taux de livraison) عالية، والأهم من داكشي كيدوزو الفلوس ديال الكوليات (Retour de fonds) فوقتها بلا تعطيل وبلا مشاكل فالحسابات؟',
        date: 'اليوم، 10:30',
        likesCount: 29,
        comments: [
          {
            id: 'c-3',
            author: 'سيمو الودغيري',
            role: 'متجر إلكتروني',
            city: 'فاس',
            content: 'أنا خدام مع Cathedis فكازا وفاس، الفلوس كيدوزو كل اثنين وأربعاء بدون مشاكل ونسبة التوصيل عندي 82%.',
            date: 'اليوم، 11:15'
          },
          {
            id: 'c-4',
            author: 'ورشة الوفاق للستريتوير',
            role: 'صاحب براند',
            city: 'الرباط',
            content: 'أهم نصيحة دير تأكيد الطلبيات (Confirmation téléphonique / WhatsApp) قبل ما تخرج الكولية، هادي بوحدها كطلع النسبة بـ 15%.',
            date: 'اليوم، 11:45'
          }
        ]
      },
      {
        id: 'post-print-1',
        author: 'المركز الرقمي للطباعة (Digital Print Pro)',
        authorRole: 'مطبعة معتمدة - DTF & Sérigraphie',
        authorRoleKey: 'imprimeur',
        city: 'عين السبع',
        title: '💡 نصيحة تقنية مهمة: كيفاش تخلي طباعة الـ DTF على الهوديات تصبر لأكثر من 50 تصبينة؟',
        category: 'conseils',
        content: 'بزاف ديال الإخوان كيتشكاو من تقشر طباعة DTF على ثوب القطن والملتون. السر كاين فـ 3 حوايج:\n1. درجة حرارة البريسة: 160°C بالضبط وضغط متوسط-قوي لمدة 15 ثانية.\n2. التبريد التام (Cold Peel): ما تحيدش البلاستيك حتى يبرد القماش 100%.\n3. الكبسة الثانية (Deuxième presse): بعد إزالة البلاستيك حط ورق الزبدة وكبس لمدة 6 ثواني لتثبيت الحبر وسط ألياف الثوب.',
        date: 'أمس، 18:20',
        likesCount: 45,
        whatsapp: '212662938102',
        whatsappText: 'السلام عليكم، تواصلت معكم من BEYA NETWORK بخصوص خدمات طباعة الـ DTF والسيريغرافي.',
        comments: []
      }
    ];
  });

  // New Post Form
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: '',
    category: 'conseils' as 'livraison' | 'marketing' | 'tissus' | 'conseils' | 'groupage',
    content: ''
  });

  // Active Comment Input per post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // ───────────────── 1. SUPPLIERS DIRECTORY DATA ─────────────────
  const suppliersList = [
    {
      id: 'sup-1',
      name: 'مجمع أقمشة الشرق (Derb Omar)',
      category: 'tissu',
      categoryLabel: 'أقمشة وتوريد قطن',
      city: 'الدار البيضاء (درب عمر)',
      whatsapp: '212661849201',
      phone: '0661849201',
      products: ['مولتون شتوي 340g مبطن', 'إنترلوك أصلي 100% قطن', 'جيرسي ليكرا صيفي 240g', 'كوتون كوردوروي'],
      minQty: 'ابتداءً من 25 كلغ (رولو واحد)',
      rating: 4.9,
      verified: true,
      desc: 'الموزع المعتمد لأرقى خامات الأقطان والمنسوجات الشتوية والصيفية في درب عمر زنقة فاس. أسعار تفضيلية خاصة بأعضاء شبكة BEYA.'
    },
    {
      id: 'sup-2',
      name: 'أقمشة المسيرة الشمالية (Tissus Nord)',
      category: 'tissu',
      categoryLabel: 'أقمشة سراويل وجاباردين',
      city: 'طنجة (المنطقة الحرة)',
      whatsapp: '212665819203',
      phone: '0665819203',
      products: ['جاباردين كوتون ستريتش متين', 'قماش كوتون كانفاس (Canvas)', 'أقمشة تقنية ووتربروف', 'كتان صيفي بيور'],
      minQty: 'ابتداءً من 30 متر',
      rating: 4.85,
      verified: true,
      desc: 'متخصصون في توريد خامات السراويل الكارجو والسترات الواقية والمآزر بأعلى معايير المتانة ومقاومة التمزق.'
    },
    {
      id: 'sup-3',
      name: 'المركز الرقمي للطباعة والـ DTF (Digital Print Pro)',
      category: 'impression',
      categoryLabel: 'طباعة وسيريغرافي',
      city: 'الدار البيضاء (عين السبع)',
      whatsapp: '212662938102',
      phone: '0662938102',
      products: ['طباعة DTF فائقة النقاء HD', 'سيريغرافي Plastisol & Waterbase', 'فلوكاج قطني مخملي', 'Sublimation حراري'],
      minQty: 'ابتداءً من 30 قطعة',
      rating: 4.95,
      verified: true,
      desc: 'ورشة طباعة عصرية مجهزة بأحدث آلات الـ DTF والطباعة الحريرية بألوان ثابتة ومقاومة للغسيل المتكرر.'
    },
    {
      id: 'sup-4',
      name: 'ورشة الفجر للتطريز الصناعي (Broderie Industrielle Tajima)',
      category: 'broderie',
      categoryLabel: 'تطريز آلي متطور',
      city: 'فاس / الدار البيضاء',
      whatsapp: '212664728190',
      phone: '0664728190',
      products: ['تطريز ثلاثي الأبعاد 3D بارز', 'تطريز شعارات الهودي والكابوتش', 'بادجات مطرزة حرارية (Écussons)'],
      minQty: 'ابتداءً من 50 قطعة',
      rating: 4.88,
      verified: true,
      desc: 'أسطول ماكينات تطريز يابانية Tajima 12 رأس لدقة متناهية وسرعة فائقة في تنفيذ أرقى شعارات الماركات.'
    },
    {
      id: 'sup-5',
      name: 'مؤسسة الأناقة للوازم الخياطة والتغليف (Packaging & Accessories)',
      category: 'accessoires',
      categoryLabel: 'لوازم خياطة وتغليف',
      city: 'الدار البيضاء (كراج علال)',
      whatsapp: '212668901234',
      phone: '0668901234',
      products: ['أكياس بولي باغ مخصصة (Polybags)', 'بطاقات الهانج تاج (Hangtags)', 'سحابات معدنية YKK', 'حبال هودي كوتون سميكة'],
      minQty: 'ابتداءً من 100 قطعة',
      rating: 4.9,
      verified: true,
      desc: 'تجهيز كامل لمستلزمات الفينيسيون الراقي لعلامات الملابس مع إمكانية طبع الشعار على الأكياس والأشرطة.'
    }
  ];

  // ───────────────── 2. MODELISTES DIRECTORY DATA ─────────────────
  const modelistesList = [
    {
      id: 'mod-1',
      name: 'فاطمة الزهراء العمراني (Atelier Patronage Pro)',
      title: 'موديلست أولى وخبير تدريج الباترون (Gerber & Lectra)',
      city: 'الدار البيضاء / طنجة (عن بعد وحضوري)',
      whatsapp: '212663049182',
      phone: '0663049182',
      software: ['Lectra Modaris V8', 'Clo 3D Simulation', 'Gerber Accumark'],
      specialities: ['هوديات وتيشرتات أوفرسايز Drop Shoulder', 'سراويل سويت بانتس وشورتات', 'ملابس Streetwear عصرية'],
      category: 'streetwear',
      experienceYears: '9 سنوات',
      turnaround: '24 إلى 48 ساعة',
      startPriceMAD: 220,
      rating: 5.0,
      verified: true,
      completedPatterns: 145,
      desc: 'إعداد ملفات الباترون الدقيقة المتوافقة مباشرة مع ماكينات الفصالة بالليزر مع جدول تدريج مقاسات مضبوط (Gradation XS إلى 3XL) ومحاكاة 3D واقعية للموديل قبل التفصيل.'
    },
    {
      id: 'mod-2',
      name: 'ياسين الصنهاجي (Design & Industrial Pattern Studio)',
      title: 'مهندس ملابس وموديلست تيكنيكال وسراويل كارجو',
      city: 'الدار البيضاء (سيدي معروف)',
      whatsapp: '212664556677',
      phone: '0664556677',
      software: ['Gerber Accumark', 'Optitex', 'Adobe Illustrator'],
      specialities: ['سراويل كارجو بجيوب تكتيكية', 'جاكيتات بومبر وفيستات مبطنة', 'جينز ودنيم صناعي'],
      category: 'denim',
      experienceYears: '8 سنوات',
      turnaround: '48 ساعة',
      startPriceMAD: 280,
      rating: 4.95,
      verified: true,
      completedPatterns: 98,
      desc: 'متخصص في الباترونات المعقدة والملابس ذات الجيوب والقصات الهندسية الدقيقة مع إعداد الـ Fiche Technique ومقادير استهلاك القماش (Consommation).'
    },
    {
      id: 'mod-3',
      name: 'سلمى المنصوري (Modéliste Styliste Haute Couture)',
      title: 'مصممة أزياء وموديلست للعبايات والملابس النسائية الراقية',
      city: 'الرباط / فاس',
      whatsapp: '212667112233',
      phone: '0667112233',
      software: ['Clo 3D', 'Lectra Modaris', 'Photoshop'],
      specialities: ['عبايات خليجية عصرية كيمونو', 'فساتين لين وكاجوال نسائي', 'أطقم صيفية مستورة (Modest Fashion)'],
      category: 'femme',
      experienceYears: '7 سنوات',
      turnaround: '48 ساعة مع محاكاة 3D',
      startPriceMAD: 250,
      rating: 4.92,
      verified: true,
      completedPatterns: 120,
      desc: 'إعداد باترونات راقية للملابس النسائية المحتشمة والعصرية مع مراعاة انسيابية القماش وتناسق المقاسات الخليجية والمغربية.'
    },
    {
      id: 'mod-4',
      name: 'كريم العلمي (Sportswear & Activewear Patterns)',
      title: 'خبير باترون الألبسة الرياضية والأكتيف وير',
      city: 'طنجة (المنطقة الحرة)',
      whatsapp: '212669334455',
      phone: '0669334455',
      software: ['Lectra Modaris', 'Illustrator'],
      specialities: ['بدلات تداريب رياضية Tracksuits', 'تيشيرتات دراي فيت وضغط (Compression)', 'شورتات جيم وركض'],
      category: 'sport',
      experienceYears: '6 سنوات',
      turnaround: '24 ساعة',
      startPriceMAD: 200,
      rating: 4.88,
      verified: true,
      completedPatterns: 76,
      desc: 'خبرة طويلة بمصانع التصدير الرياضية بطنجة، دراية كاملة بمرونة الأقمشة التقنية والليكرا لضمان راحة الرياضي أثناء الحركة.'
    }
  ];

  // ───────────────── 3. BEYA CLIENTS & BRANDS DIRECTORY DATA ─────────────────
  const clientsList = [
    {
      id: 'cli-current',
      name: userProfile.brandName || 'FAS Wear',
      ownerName: currentUser?.nom || 'FAS',
      city: userProfile.city.split(' ')[0] || 'الدار البيضاء',
      category: 'streetwear',
      categoryLabel: 'ستريتوير وملابس شبابية',
      specialities: ['هوديات شتوية 340g مبطنة', 'تيشرتات أوفرسايز قطن ممشط', 'سويت بانتس'],
      piecesProduced: '+450 قطعة مصنعة',
      collectionsCount: 2,
      verified: true,
      isCurrentUser: true,
      whatsapp: userProfile.phone,
      bio: userProfile.bio || 'علامة تجارية مغربية للملابس الجاهزة والستريتوير المصنعة بشراكة مع BEYA.',
      story: 'براندك الرسمي المسجل في المنصة. تظهر شارة التوثيق الأخضر لجميع أعضاء الشبكة.'
    },
    {
      id: 'cli-1',
      name: 'Atlas Streetwear',
      ownerName: 'أمين البراندي',
      city: 'الدار البيضاء',
      category: 'streetwear',
      categoryLabel: 'ستريتوير ثقيل Heavyweight',
      specialities: ['هوديات 350g بطباعة DTF', 'تيشرتات دروب شولدر 240g', 'كابات'],
      piecesProduced: '+1,800 قطعة مصنعة فـ BEYA',
      collectionsCount: 4,
      verified: true,
      whatsapp: '0662112233',
      bio: 'براند ستريتوير كازاوي مستوحى من ثقافة الشارع والموسيقى الحضرية.',
      story: 'بدينا بأول كوموند تجريبية ديال 30 قطعة فـ BEYA واليوم وصلنا لـ 4 كوليكسيونات ناجحة مع نسبة تحصيل 85%.'
    },
    {
      id: 'cli-2',
      name: 'Sahara Nomads Studio',
      ownerName: 'يوسف العثماني',
      city: 'مراكش',
      category: 'casual',
      categoryLabel: 'كاجوال أصيل مطرز',
      specialities: ['سترات كوتون كانفاس مطرزة 3D', 'هوديات بألوان رملية وطبيعية'],
      piecesProduced: '+950 قطعة مصنعة فـ BEYA',
      collectionsCount: 3,
      verified: true,
      whatsapp: '0663445566',
      bio: 'مزج بين الموضة العصرية المعاصرة والتراث الأمازيغي والصحراوي المغربي.',
      story: 'كنتعاملو مع BEYA فالفصالة والخياطة الفاخرة، والتطريز كيدار بدقة متناهية.'
    },
    {
      id: 'cli-3',
      name: 'Modesty Chic Label',
      ownerName: 'هند التازي',
      city: 'الرباط',
      category: 'modest',
      categoryLabel: 'أزياء نسائية ومحجبات',
      specialities: ['عبايات كيمونو لين', 'أطقم شتوية مستورة قطن إنترلوك'],
      piecesProduced: '+1,120 قطعة مصنعة فـ BEYA',
      collectionsCount: 3,
      verified: true,
      whatsapp: '0664889900',
      bio: 'تصاميم نسائية محتشمة وعصرية بجودة خامات ناعمة ومريحة.',
      story: 'الفينيسيون ديال BEYA عاوننا نرفعو ثقة الزبونات ونحققو مبيعات قوية فالمغرب ودول الخليج.'
    },
    {
      id: 'cli-4',
      name: 'Urban Pulse Sport',
      ownerName: 'سفيان إيكوم',
      city: 'طنجة',
      category: 'sport',
      categoryLabel: 'ملابس رياضية وأكتيف وير',
      specialities: ['سراويل سويت بانتس مريحة', 'شورتات جيم', 'هوديات خفيفة'],
      piecesProduced: '+720 قطعة مصنعة فـ BEYA',
      collectionsCount: 2,
      verified: true,
      whatsapp: '0665778899',
      bio: 'ملابس رياضية مصممة للشباب والرياضيين بمقاسات مريحة وتصاميم بسيطة.',
      story: 'استفدنا بزاف من عروض الشراء المشترك للأقمشة فـ BEYA Network ووفرنا 25% من تكلفة المتر.'
    },
    {
      id: 'cli-5',
      name: 'Casawear Collective',
      ownerName: 'سيمو الودغيري',
      city: 'فاس',
      category: 'streetwear',
      categoryLabel: 'ستريتوير وتيشيرتات أوفرسايز',
      specialities: ['تيشرتات غرافيك 240g', 'هوديات سادة بألوان ترابية'],
      piecesProduced: '+1,300 قطعة مصنعة فـ BEYA',
      collectionsCount: 4,
      verified: true,
      whatsapp: '0666223344',
      bio: 'متجر إلكتروني يركز على تيشيرتات القطن الطبيعي عالي الجودة مع طباعة ثابتة.',
      story: 'السرعة فـ إنجاز العينات والتوصيل السريع هو لي مخليني مكمل مع ورشة BEYA.'
    }
  ];

  // Group Buying State
  const [groupDeals, setGroupDeals] = useState([
    {
      id: 'grp-1',
      title: 'تجمع شراء: مولتون شتوي مبطن قطن 100% (Molleton Gratté 340g)',
      fabricType: 'Molleton Coton Peigné 340 GSM',
      source: 'مباشرة من مصنع النسيج بالمنطقة الصناعية عين السبع',
      colors: ['أسود داكن', 'رمادي ميلونج', 'أوف وايت', 'أخضر كاكي'],
      regularPrice: 58,
      groupPrice: 42,
      savingsPct: 28,
      targetKg: 500,
      currentKg: 385,
      deadlineDays: 3,
      participantsCount: 9,
      whatsappMsg: 'السلام عليكم BEYA NETWORK، أرغب في حجز كمية في تجمع الشراء الموحد لقماش الملتون الشتوي 340g.'
    },
    {
      id: 'grp-2',
      title: 'تجمع شراء: قماش إنترلوك دابل نيت راقي للتيشيرت والسويت (240g)',
      fabricType: 'Interlock 100% Coton Double Knit',
      source: 'استيراد جماعي حصري لأعضاء شبكة BEYA',
      colors: ['أبيض ناصع', 'أسود', 'كحلي ملكي', 'بيج رملي'],
      regularPrice: 48,
      groupPrice: 34,
      savingsPct: 29,
      targetKg: 350,
      currentKg: 240,
      deadlineDays: 6,
      participantsCount: 6,
      whatsappMsg: 'السلام عليكم BEYA NETWORK، أرغب في حجز كمية في تجمع الشراء الموحد لقماش الإنترلوك 240g.'
    }
  ]);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState<any | null>(null);
  const [joinKgInput, setJoinKgInput] = useState('25');

  // Save profile updates
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const updatedUser: User = {
        ...currentUser!,
        brandName: userProfile.brandName.trim() || 'FAS Wear',
        telephone: userProfile.phone.trim() || '0600000000',
        ville: userProfile.city.trim() || 'الدار البيضاء (Casablanca)',
        networkBio: userProfile.bio.trim(),
        networkProfileCompleted: true
      };
      localStorage.setItem('textrack_auth', JSON.stringify(updatedUser));
      if (emailKey) {
        localStorage.setItem(`beya_network_completed_${emailKey}`, 'true');
        localStorage.setItem(`beya_network_profile_${emailKey}`, JSON.stringify(userProfile));
      }
      await saveRecord('users', updatedUser, true).catch(() => {});
      setIsProfileSetupCompleted(true);
      setShowEditProfileModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Like a post
  const handleLikePost = (postId: string) => {
    setPosts(prev => {
      const next = prev.map(p => {
        if (p.id === postId) {
          const isLiked = p.liked;
          return {
            ...p,
            liked: !isLiked,
            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1
          };
        }
        return p;
      });
      try {
        localStorage.setItem('beya_network_posts_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Add Comment to Post
  const handleAddComment = (postId: string) => {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: userProfile.brandName || currentUser?.nom || 'FAS',
      role: 'صاحب علامة تجارية',
      city: userProfile.city.split(' ')[0] || 'الدار البيضاء',
      content: text,
      date: 'الآن'
    };

    setPosts(prev => {
      const next = prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newComment]
          };
        }
        return p;
      });
      try {
        localStorage.setItem('beya_network_posts_v2', JSON.stringify(next));
      } catch {}
      return next;
    });

    setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
  };

  // Create New Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostData.title.trim() || !newPostData.content.trim()) return;

    const createdPost = {
      id: `post-${Date.now()}`,
      author: userProfile.brandName || currentUser?.nom || 'FAS Wear',
      authorRole: 'صاحب علامة تجارية (زبون معتمد)',
      authorRoleKey: 'brand' as const,
      city: userProfile.city.split(' ')[0] || 'الدار البيضاء',
      title: newPostData.title.trim(),
      category: newPostData.category,
      content: newPostData.content.trim(),
      date: 'الآن',
      likesCount: 1,
      liked: true,
      comments: []
    };

    const nextPosts = [createdPost, ...posts];
    setPosts(nextPosts);
    try {
      localStorage.setItem('beya_network_posts_v2', JSON.stringify(nextPosts));
    } catch {}

    setNewPostData({ title: '', category: 'conseils', content: '' });
    setShowNewPostModal(false);
  };

  // Join Group Buying Deal
  const handleConfirmJoinGroup = () => {
    if (!showJoinGroupModal) return;
    const kg = parseInt(joinKgInput) || 25;
    
    setGroupDeals(prev => prev.map(deal => {
      if (deal.id === showJoinGroupModal.id) {
        return {
          ...deal,
          currentKg: Math.min(deal.targetKg, deal.currentKg + kg),
          participantsCount: deal.participantsCount + 1
        };
      }
      return deal;
    }));

    const waMsg = encodeURIComponent(
      `السلام عليكم BEYA NETWORK، قمت بحجز ${kg} كلغ من عرض الشراء المشترك: (${showJoinGroupModal.title}). براند: ${userProfile.brandName} - هاتف: ${userProfile.phone}`
    );
    window.open(`https://wa.me/212661849201?text=${waMsg}`, '_blank');
    setShowJoinGroupModal(null);
  };

  // If user is not pilot authorized
  if (!isPilotAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20">
          <Globe className="w-10 h-10 text-white animate-pulse" />
        </div>
        <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
          عضوية VIP التجريبية
        </span>
        <h1 className="text-3xl font-black mb-3">منصة BEYA NETWORK</h1>
        <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
          هذه المنصة مخصصة لرواد الموضة، الموردين المعتمدين والمصانع بالمغرب. حسابك غير مدرج حالياً في المرحلة التجريبية الأولى.
        </p>
        <button
          onClick={() => window.location.hash = '#/portal'}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى بوابة طلبياتي</span>
        </button>
      </div>
    );
  }

  // Filter posts
  const filteredPosts = posts.filter(p => {
    if (forumTopicFilter !== 'all' && p.category !== forumTopicFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (p.title + ' ' + p.content + ' ' + p.author + ' ' + p.city).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Filter suppliers
  const filteredSuppliers = suppliersList.filter(s => {
    if (supplierCategoryFilter !== 'all' && s.category !== supplierCategoryFilter) return false;
    if (selectedCityFilter !== 'all' && !s.city.includes(selectedCityFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (s.name + ' ' + s.desc + ' ' + s.city + ' ' + s.products.join(' ')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Filter modelistes
  const filteredModelistes = modelistesList.filter(m => {
    if (modelisteCategoryFilter !== 'all' && m.category !== modelisteCategoryFilter) return false;
    if (selectedCityFilter !== 'all' && !m.city.includes(selectedCityFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (m.name + ' ' + m.title + ' ' + m.desc + ' ' + m.city + ' ' + m.specialities.join(' ') + ' ' + m.software.join(' ')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Filter clients
  const filteredClients = clientsList.filter(c => {
    if (clientCategoryFilter !== 'all' && c.category !== clientCategoryFilter) return false;
    if (selectedCityFilter !== 'all' && !c.city.includes(selectedCityFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (c.name + ' ' + c.ownerName + ' ' + c.bio + ' ' + c.city + ' ' + c.specialities.join(' ')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 font-sans antialiased" dir="rtl">
      
      {/* ───────────────── TOP STANDALONE APP HEADER ───────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900">BEYA</span>
                  <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">NETWORK</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded border border-amber-300">VIP B2B</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">شبكة صناع الموضة، الموردين والبراندات بالمغرب</p>
              </div>
            </div>

            {/* Global Search Bar (Facebook style) */}
            <div className="flex-1 max-w-xs md:max-w-sm hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن موردين، موديلست، براندات، أقمشة..."
                  className="w-full pl-4 pr-10 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs text-slate-800 rounded-full border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Pages: Feed, Suppliers, Modélistes, Clients BEYA, Groupage */}
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1">
              {/* 1. Feed */}
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'feed'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>المجتمع</span>
              </button>

              {/* 2. Fournisseurs */}
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'suppliers'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Scissors className="w-4 h-4 text-emerald-500" />
                <span>الموردون</span>
              </button>

              {/* 3. Modélistes */}
              <button
                onClick={() => setActiveTab('modelistes')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'modelistes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Ruler className="w-4 h-4 text-amber-500" />
                <span>الموديلست</span>
                <span className="px-1 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full">جديد</span>
              </button>

              {/* 4. Clients BEYA */}
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'clients'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Tag className="w-4 h-4 text-violet-500" />
                <span>كليان BEYA</span>
              </button>

              {/* 5. Group Buying */}
              <button
                onClick={() => setActiveTab('groupage')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'groupage'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4 text-rose-500" />
                <span>الشراء المشترك</span>
              </button>
            </nav>

            {/* Right Action: SWITCH BACK TO BEYAPORTAL */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.location.hash = '#/portal'}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 text-white hover:from-black hover:to-indigo-900 rounded-xl font-bold text-xs sm:text-sm shadow-md border border-indigo-500/30 transition transform active:scale-95"
                title="الرجوع إلى إدارة ومتابعة الطلبيات والفواتير"
              >
                <ArrowRight className="w-4 h-4 text-indigo-400 rotate-180" />
                <span className="hidden sm:inline">العودة إلى</span>
                <span className="font-black text-amber-400">BEYAPORTAL</span>
              </button>

              {/* User Avatar with Profile Modal */}
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center ring-2 ring-indigo-200 hover:ring-indigo-400 transition"
                title="تعديل ملفك التعريفي"
              >
                {(userProfile.brandName || 'F')[0].toUpperCase()}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ───────────────── SUBNAV LIVE TICKER / BADGE ───────────────── */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-0.5 scrollbar-none">
            <span className="flex items-center gap-1.5 font-bold text-amber-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مباشر من ورشات وموردي المغرب:</span>
            </span>
            <span className="text-slate-300 shrink-0">🧵 وصول دفعة مولتون شتوي 340g بدرب عمر</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 shrink-0">📐 انضمام 4 موديلست معتمدين لتدريج الباترونات</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 shrink-0">🏷️ دليل براندات BEYA مفتوح الآن للتعاون</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-300 shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>شبكة موثوقة ومغلقة لرواد النسيج</span>
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────── MAIN CONTENT AREA ───────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ═════════════════ TAB 1: FEED / SOCIAL WALL ═════════════════ */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ─── RIGHT COLUMN (Desktop Sidebar): Member Card & Shortcuts ─── */}
            <aside className="lg:col-span-3 space-y-5 order-2 lg:order-1">
              
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {(userProfile.brandName || 'F')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-slate-900 truncate">{userProfile.brandName}</h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[11px] font-semibold text-indigo-600">علامة تجارية / زبون BEYA</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{userProfile.city}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 line-clamp-2">
                  {userProfile.bio || 'لا توجد نبذة تعريفية بعد.'}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-100 mb-4 text-xs">
                  <div>
                    <span className="block font-black text-slate-900">2</span>
                    <span className="text-[10px] text-slate-500">طلبيات</span>
                  </div>
                  <div>
                    <span className="block font-black text-indigo-600">5</span>
                    <span className="text-[10px] text-slate-500">موردين</span>
                  </div>
                  <div>
                    <span className="block font-black text-emerald-600">VIP</span>
                    <span className="text-[10px] text-slate-500">العضوية</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                >
                  تعديل الملف التعريفي ⚙️
                </button>
              </div>

              {/* Quick Directories & Shortcuts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>دليل الأقسام المتخصصة</span>
                </h4>
                
                <div className="space-y-1.5 text-xs font-bold text-slate-700">
                  <button 
                    onClick={() => setActiveTab('suppliers')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-emerald-600" />
                      <span>دليل الموردين (درب عمر، فاس)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">18 مورد</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('modelistes')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-amber-500" />
                      <span>دليل الموديلست والباترون</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">8 خبراء</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('clients')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-violet-500" />
                      <span>دليل براندات وكليان BEYA</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">24 براند</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('groupage')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-rose-500" />
                      <span>الشراء المشترك للأقمشة</span>
                    </span>
                    <span className="text-[10px] text-amber-600 font-mono font-bold">-28% خصم</span>
                  </button>
                </div>
              </div>

              {/* Safety & Confidentiality Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ميثاق أمان BEYA NETWORK</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  فضاء محمي لتبادل التجارب والنصائح العامة. يُمنع منعاً باتاً مشاركة تصاميم الموديلات الحصرية الخاصة بكم أو الأسعار السرية حفاظاً على خصوصيتكم ونجاح مشاريعكم.
                </p>
              </div>

            </aside>

            {/* ─── CENTER COLUMN: Main Social Feed Stream ─── */}
            <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
              
              {/* Facebook-style "Create Post" Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {(userProfile.brandName || 'F')[0].toUpperCase()}
                  </div>
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="flex-1 text-right px-4 py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs sm:text-sm rounded-full transition"
                  >
                    شنو باغي تشارك اليوم مع رواد الموضة والموردين بالمغرب؟
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <button 
                    onClick={() => { setNewPostData(p => ({ ...p, category: 'tissus' })); setShowNewPostModal(true); }}
                    className="flex items-center gap-1.5 hover:text-indigo-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Scissors className="w-4 h-4 text-indigo-500" />
                    <span>سؤال عن قماش</span>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('modelistes'); }}
                    className="flex items-center gap-1.5 hover:text-amber-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Ruler className="w-4 h-4 text-amber-500" />
                    <span>طلب موديلست</span>
                  </button>
                  <button 
                    onClick={() => { setNewPostData(p => ({ ...p, category: 'livraison' })); setShowNewPostModal(true); }}
                    className="flex items-center gap-1.5 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Building2 className="w-4 h-4 text-rose-500" />
                    <span>شركة توصيل</span>
                  </button>
                </div>
              </div>

              {/* Topic Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'جميع المواضيع' },
                  { id: 'tissus', label: '🧵 جودة الأقمشة' },
                  { id: 'livraison', label: '🚚 شركات التوصيل' },
                  { id: 'marketing', label: '📢 التسويق والإعلانات' },
                  { id: 'conseils', label: '💡 نصائح الإنتاج والباترون' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setForumTopicFilter(pill.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      forumTopicFilter === pill.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Posts Stream */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">لا توجد منشورات في هذا التصنيف حالياً</p>
                    <p className="text-xs text-slate-500 mt-1">كن أول من يشارك استفساراً أو تجربة في هذا الموضوع!</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <article key={post.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
                      
                      {/* Post Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm ${
                            post.authorRoleKey === 'supplier'
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                              : post.authorRoleKey === 'modeliste'
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                              : post.authorRoleKey === 'imprimeur'
                              ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                              : 'bg-gradient-to-tr from-indigo-600 to-blue-500'
                          }`}>
                            {post.author[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900">{post.author}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                post.authorRoleKey === 'supplier'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : post.authorRoleKey === 'modeliste'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : post.authorRoleKey === 'imprimeur'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}>
                                {post.authorRole}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>📍 {post.city}</span>
                              <span>•</span>
                              <span>{post.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Direct WhatsApp button if author has phone */}
                        {post.whatsapp && (
                          <a
                            href={`https://wa.me/${post.whatsapp}?text=${encodeURIComponent(post.whatsappText || 'السلام عليكم، تواصلت معك من منصة BEYA NETWORK.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">واتساب</span>
                          </a>
                        )}
                      </div>

                      {/* Post Title & Content */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Stats & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                              post.liked 
                                ? 'bg-indigo-50 text-indigo-600' 
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${post.liked ? 'fill-indigo-600' : ''}`} />
                            <span>{post.likesCount} إعجاب</span>
                          </button>

                          <button
                            onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{(post.comments || []).length} ردود</span>
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-400 font-normal">
                          نُشر في BEYA NETWORK
                        </span>
                      </div>

                      {/* Comments Section */}
                      <div className="space-y-3 pt-2">
                        {/* Existing comments */}
                        {(post.comments || []).map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {comment.author[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs text-slate-900">{comment.author}</span>
                                <span className="text-[10px] text-slate-400">{comment.date}</span>
                              </div>
                              <p className="text-xs text-slate-700 mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                            placeholder="اكتب رداً أو تعليقاً مفيداً..."
                            className="flex-1 px-4 py-2 bg-slate-100 text-xs rounded-full border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentDrafts[post.id]?.trim()}
                            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-40 transition"
                          >
                            <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                          </button>
                        </div>
                      </div>

                    </article>
                  ))
                )}
              </div>

            </div>

            {/* ─── LEFT COLUMN: Recommended & Group Buying Widgets ─── */}
            <aside className="lg:col-span-3 space-y-5 order-3">
              
              {/* Widget: Recommended Fabric Suppliers */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-emerald-600" />
                    <span>موردون موثوقون ينصح بهم</span>
                  </h4>
                  <button 
                    onClick={() => setActiveTab('suppliers')} 
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>

                <div className="space-y-3">
                  {suppliersList.slice(0, 3).map((sup) => (
                    <div key={sup.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 truncate">{sup.name}</span>
                        <span className="text-[10px] font-bold text-amber-600">⭐ {sup.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{sup.city}</p>
                      <a
                        href={`https://wa.me/${sup.whatsapp}?text=${encodeURIComponent('السلام عليكم، تواصلت معك من منصة BEYA NETWORK بخصوص طلب توريد أقمشة.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <Phone className="w-3 h-3" />
                        <span>تواصل فـ الواتساب</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget: Modéliste Spotlight */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                    موديلست معتمد
                  </span>
                  <button onClick={() => setActiveTab('modelistes')} className="text-[11px] font-bold text-amber-900 hover:underline">
                    دليل الموديلست ➔
                  </button>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                    {modelistesList[0].name}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {modelistesList[0].title}
                  </p>
                </div>

                <a
                  href={`https://wa.me/${modelistesList[0].whatsapp}?text=${encodeURIComponent('السلام عليكم، تواصلت معك من منصة BEYA NETWORK لطلب باترون.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>طلب باترون فـ الواتساب</span>
                </a>
              </div>

              {/* Widget: Group Buying Fabric */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                    الشراء المشترك
                  </span>
                  <span className="text-xs font-bold text-indigo-900 font-mono">خصم 28%</span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                    {groupDeals[0].title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    عوض 58 درهم/كلغ ➔ <strong className="text-emerald-700 font-black">42 درهم/كلغ</strong>
                  </p>
                </div>

                <button
                  onClick={() => setShowJoinGroupModal(groupDeals[0])}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                >
                  حجز كمية والاستفادة من الثمن 📦
                </button>
              </div>

            </aside>

          </div>
        )}

        {/* ═════════════════ TAB 2: صفحة الموردين (PAGE FOURNISSEURS) ═════════════════ */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black inline-block mb-2">
                  دليل الموردين المعتمدين بالمغرب 🧵
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Scissors className="w-6 h-6 text-emerald-600" />
                  <span>موردو الأقمشة، المطابع، ولوازم النسيج</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  تواصل مباشر مع كبار تجار الأقمشة في درب عمر، فاس، وطنجة بأسعار الجملة المباشرة وبدون وساطة
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'tissu', label: '🧵 أقمشة وقطن' },
                  { id: 'impression', label: '🖨️ طباعة وDTF' },
                  { id: 'broderie', label: '🪡 تطريز آلي' },
                  { id: 'accessoires', label: '🏷️ لوازم وتغليف' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSupplierCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      supplierCategoryFilter === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {supplier.categoryLabel}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 mt-2">{supplier.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{supplier.city}</span>
                        </p>
                      </div>
                      <div className="text-center px-2 py-1 bg-amber-50 rounded-xl border border-amber-200">
                        <span className="block font-black text-amber-700 text-xs">⭐ {supplier.rating}</span>
                        <span className="text-[9px] text-amber-600">موثوق</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {supplier.desc}
                    </p>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-700 mb-1.5">الأقمشة والخدمات المتوفرة:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.products.map((prod, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-700 text-[11px] rounded-lg border border-slate-200">
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                      <span><strong>الحد الأدنى (MOQ):</strong> {supplier.minQty}</span>
                      <span className="text-emerald-700 font-bold">✓ أسعار خاصة بـ BEYA</span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معك من خلال منصة BEYA NETWORK بخصوص ${supplier.categoryLabel}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>تواصل مباشر عبر الواتساب</span>
                  </a>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═════════════════ TAB 3: صفحة الموديلست (PAGE MODÉLISTES & STYLISTES) ═════════════════ */}
        {activeTab === 'modelistes' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black inline-block mb-2">
                  دليل الموديلست ومصممي الباترون الصناعي 📐
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Ruler className="w-6 h-6 text-amber-600" />
                  <span>شبكة الموديلست والباترونيست المعتمدين بالمغرب</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                  خبراء إعداد ملفات الفصالة الدقيقة والباترون الرقمي (Gerber, Lectra, Clo3D) وتدريج المقاسات (Gradation) لأصحاب البراندات بأسعار تفضيلية
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'streetwear', label: '👕 هوديات وستريتوير' },
                  { id: 'femme', label: '👗 عبايات وأزياء نسائية' },
                  { id: 'denim', label: '👖 سراويل كارجو ودنيم' },
                  { id: 'sport', label: '🏃 ملابس رياضية' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setModelisteCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      modelisteCategoryFilter === cat.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modélistes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredModelistes.map((mod) => (
                <div key={mod.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                          {mod.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-base text-slate-900">{mod.name}</h3>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          </div>
                          <p className="text-xs font-bold text-amber-700 mt-0.5">{mod.title}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{mod.city}</span>
                            <span>•</span>
                            <span>خبرة {mod.experienceYears}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-left font-mono shrink-0">
                        <span className="text-[10px] text-slate-400 block">ابتداءً من</span>
                        <span className="text-lg font-black text-emerald-600">{mod.startPriceMAD} DH</span>
                        <span className="text-[10px] text-slate-500 block">باترون + تدريج</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {mod.desc}
                    </p>

                    {/* Specialities & Software */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-700 mb-1">البرامج المعتمدة:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {mod.software.map((sw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200/60">
                              {sw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-bold text-slate-700 mb-1">أبرز الموديلات المتخصصة:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {mod.specialities.map((sp, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] rounded-lg">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>⏳ مدة التسليم: <strong>{mod.turnaround}</strong></span>
                      <span>⭐ التقييم: <strong>{mod.rating} / 5.0</strong> ({mod.completedPatterns} باترون)</span>
                    </div>

                  </div>

                  <a
                    href={`https://wa.me/${mod.whatsapp}?text=${encodeURIComponent(`السلام عليكم أستاذ(ة) ${mod.name}، تواصلت معك من خلال BEYA NETWORK بخصوص إعداد وتدريج باترون لموديل جديد.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>طلب باترون وتواصل فـ الواتساب</span>
                  </a>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═════════════════ TAB 4: صفحة كليان BEYA (PAGE CLIENTS & MARQUES) ═════════════════ */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-black inline-block mb-2">
                  مجتمع براندات وكليان BEYA بالمغرب 🏷️
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-violet-600" />
                  <span>العلامات التجارية ورواد الموضة المصنعة في BEYA</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  تعرف على الماركات الشريكة، تبادل الخبرات في التوصيل والتسويق، وتعاون في تجميع طلبيات الأقمشة
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'streetwear', label: '👕 ستريتوير' },
                  { id: 'casual', label: '👔 كاجوال وأصلي' },
                  { id: 'modest', label: '👗 محجبات ومستورة' },
                  { id: 'sport', label: '🏃 ملابس رياضية' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setClientCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      clientCategoryFilter === cat.id
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  className={`rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 ${
                    client.isCurrentUser
                      ? 'bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border-indigo-300'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Top Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md ${
                          client.isCurrentUser
                            ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600'
                            : 'bg-gradient-to-tr from-violet-600 to-indigo-600'
                        }`}>
                          {client.name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-base text-slate-900 truncate">{client.name}</h3>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          </div>
                          <p className="text-xs font-bold text-violet-700">{client.categoryLabel}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            📍 {client.city} • بصاحب البراند: <strong>{client.ownerName}</strong>
                          </p>
                        </div>
                      </div>

                      {client.isCurrentUser && (
                        <span className="px-2 py-0.5 text-[9px] font-black bg-amber-400 text-slate-950 rounded-full shrink-0">
                          حسابك
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {client.bio}
                    </p>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-700 mb-1">نوع الموديلات المصنعة فـ BEYA:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {client.specialities.map((sp, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] rounded-lg">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>🧵 الإنتاج: <strong className="text-indigo-600">{client.piecesProduced}</strong></span>
                      <span>📦 الكوليكسيونات: <strong>{client.collectionsCount} مجموعات</strong></span>
                    </div>

                  </div>

                  {client.isCurrentUser ? (
                    <button
                      onClick={() => setShowEditProfileModal(true)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <span>تعديل بروفايل براندك ⚙️</span>
                    </button>
                  ) : client.whatsapp ? (
                    <a
                      href={`https://wa.me/${client.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معك من خلال BEYA NETWORK للتعاون والشراكة.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تواصل في الواتساب للتعاون</span>
                    </a>
                  ) : null}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═════════════════ TAB 5: GROUP BUYING (ACHATS GROUPÉS) ═════════════════ */}
        {activeTab === 'groupage' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                قوة الشراء الموحد لأعضاء BEYA
              </span>
              <h2 className="text-2xl font-black mt-3">الشراء المشترك للأقمشة (Achats Groupés)</h2>
              <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                نجمع طلبات الأقمشة لعدة براندات صغيرة ومتوسطة في طلب واحد مباشر من كبار الموردين والمصانع، لتمكين الجميع من الحصول على أسعار الجملة الكبرى (Prix d'usine) مع توفير يصل إلى 30%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupDeals.map((deal) => {
                const pct = Math.round((deal.currentKg / deal.targetKg) * 100);
                return (
                  <div key={deal.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                          توفير {deal.savingsPct}%
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 mt-2">{deal.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{deal.source}</p>
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-xs text-slate-400 line-through block">{deal.regularPrice} DH</span>
                        <span className="text-xl font-black text-emerald-600">{deal.groupPrice} DH</span>
                        <span className="text-[10px] text-slate-500 block">للكيلوغرام</span>
                      </div>
                    </div>

                    {/* Colors */}
                    <div>
                      <span className="block text-xs font-bold text-slate-700 mb-1.5">الألوان المتاحة في هذا التجمع:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {deal.colors.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs rounded-md">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">الكمية المحجوزة: {deal.currentKg} / {deal.targetKg} كلغ</span>
                        <span className="text-indigo-600 font-mono">{pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                        <span>👥 {deal.participantsCount} براندات مشاركة</span>
                        <span>⏳ متبقي {deal.deadlineDays} أيام</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowJoinGroupModal(deal)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-md transition active:scale-95"
                    >
                      حجز كمية في هذا التجمع (ابتداءً من 20 كلغ) 📦
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* ───────────────── MODAL: CREATE NEW POST ───────────────── */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>نشر موضوع أو استفسار جديد</span>
              </h3>
              <button onClick={() => setShowNewPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">عنوان الموضوع أو السؤال *</label>
                <input
                  type="text"
                  required
                  value={newPostData.title}
                  onChange={(e) => setNewPostData(p => ({ ...p, title: e.target.value }))}
                  placeholder="مثال: شكون كيعرف مورد أقمشة كوردوروي فكازا؟"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">تصنيف الموضوع</label>
                <select
                  value={newPostData.category}
                  onChange={(e) => setNewPostData(p => ({ ...p, category: e.target.value as any }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="conseils">💡 نصيحة عامة أو باترون وتصنيع</option>
                  <option value="tissus">🧵 جودة وتوفر الأقمشة</option>
                  <option value="livraison">🚚 شركات التوصيل والروتور</option>
                  <option value="marketing">📢 إعلانات وتسويق الملابس</option>
                  <option value="groupage">📦 عرض أو طلب شراء مشترك</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">تفاصيل المنشور *</label>
                <textarea
                  required
                  rows={4}
                  value={newPostData.content}
                  onChange={(e) => setNewPostData(p => ({ ...p, content: e.target.value }))}
                  placeholder="اكتب تفاصيل سؤالك أو التجربة لي باغي تشارك مع الإخوان..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  نشر الآن 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── MODAL: EDIT USER PROFILE ───────────────── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>تعديل ملفك في BEYA NETWORK</span>
              </h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">اسم البراند أو المحل التجاري *</label>
                <input
                  type="text"
                  required
                  value={userProfile.brandName}
                  onChange={(e) => setUserProfile(p => ({ ...p, brandName: e.target.value }))}
                  placeholder="مثال: FAS Wear"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">المدينة *</label>
                <input
                  type="text"
                  required
                  value={userProfile.city}
                  onChange={(e) => setUserProfile(p => ({ ...p, city: e.target.value }))}
                  placeholder="مثال: الدار البيضاء"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">رقم الواتساب للتواصل *</label>
                <input
                  type="text"
                  required
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile(p => ({ ...p, phone: e.target.value }))}
                  placeholder="06XXXXXXXX"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">نبذة عن البراند أو التخصص</label>
                <textarea
                  rows={3}
                  value={userProfile.bio}
                  onChange={(e) => setUserProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="مثال: ملابس أوفرسايز، هودي شتوي، تيشرتات ستريتوير..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                >
                  {savingProfile ? 'جاري الحفظ...' : 'حفظ التعديلات ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── MODAL: JOIN GROUP BUYING ───────────────── */}
      {showJoinGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                <span>الانضمام لتجمع الشراء المشترك</span>
              </h3>
              <button onClick={() => setShowJoinGroupModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <h4 className="font-extrabold text-xs text-amber-900">{showJoinGroupModal.title}</h4>
              <p className="text-[11px] text-amber-800">
                سعر التجمع: <strong className="text-emerald-700">{showJoinGroupModal.groupPrice} درهم/كلغ</strong> (عوض {showJoinGroupModal.regularPrice} درهم)
              </p>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">الكمية المراد حجزها بالكيلوغرام (كلغ) *</label>
                <input
                  type="number"
                  min="15"
                  step="5"
                  value={joinKgInput}
                  onChange={(e) => setJoinKgInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-base font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">الحد الأدنى للحجز: 20 أو 25 كلغ (رولو واحد)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">التكلفة الإجمالية بسعر التجمع:</span>
                  <span className="font-black text-slate-900">{parseInt(joinKgInput || '0') * showJoinGroupModal.groupPrice} درهم</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-600 font-bold">
                  <span>مجموع ما وفرته مقارنة بسعر السوق:</span>
                  <span>{parseInt(joinKgInput || '0') * (showJoinGroupModal.regularPrice - showJoinGroupModal.groupPrice)} درهم ربح!</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowJoinGroupModal(null)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmJoinGroup}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
              >
                تأكيد الحجز فـ الواتساب ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
