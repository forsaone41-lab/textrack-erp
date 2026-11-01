import React, { useState, useEffect } from 'react';
import { 
  Globe, Users, Package, MessageCircle, GraduationCap, ArrowRight, ArrowLeft, Search, 
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
  const [activeTab, setActiveTab] = useState<'feed' | 'suppliers' | 'modelistes' | 'groupage'>('feed');

  // Search query & Category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [forumTopicFilter, setForumTopicFilter] = useState<'all' | 'livraison' | 'marketing' | 'tissus' | 'conseils' | 'groupage'>('all');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState<'all' | 'tissu' | 'impression' | 'broderie' | 'accessoires'>('all');
  const [modelisteCategoryFilter, setModelisteCategoryFilter] = useState<'all' | 'streetwear' | 'femme' | 'sport' | 'denim'>('all');
  const [clientCategoryFilter, setClientCategoryFilter] = useState<'all' | 'streetwear' | 'casual' | 'modest' | 'sport'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [selectedModelisteProfile, setSelectedModelisteProfile] = useState<any | null>(null);
  const [modelisteProfileTab, setModelisteProfileTab] = useState<'about' | 'portfolio' | 'pricing' | 'reviews'>('about');
  const [endorsedModelistes, setEndorsedModelistes] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem('beya_modeliste_endorsements');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const handleEndorse = (modId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEndorsedModelistes(prev => {
      const nextVal = (prev[modId] || 0) + 1;
      const updated = { ...prev, [modId]: nextVal };
      try { localStorage.setItem('beya_modeliste_endorsements', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

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
        { title: 'بليزر أوفرسايز راقي مع بطانة داخلية كاملة', image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=600&q=80', tag: 'Blazer', specs: 'Col tailleur parfait • Poches passepoilées • Doublure intégrale' },
        { title: 'معطف كشمير شتوي طويل بقصة مستقيمة', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80', tag: 'Manteau', specs: 'Fente d\'aisance au dos • Boutonnage croisé' }
      ],
      pricing: { basePattern: 320, gradation: 60, simulation3d: 140, ficheTech: 90 },
      reviews: [
        { author: 'كنزة المريني', brand: 'Maison Kenza Casa', comment: 'هدى أستاذة فالتايلور والجاكيتات. البليزر خرج فيه الياقة واقفة بحال زارا ومانغو ولا غلطة.', rating: 5, date: 'منذ 3 أسابيع' }
      ]
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
  // clientsList removed

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

              {/* 3. Modélistes (LinkedIn / FB Pro Style) */}
              <button
                onClick={() => setActiveTab('modelistes')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'modelistes'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Ruler className="w-4 h-4 text-amber-600" />
                <span>الموديلست</span>
                <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 text-[9px] font-black rounded-full shadow-xs">PRO</span>
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
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* LinkedIn / Facebook Style Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>BEYA Fashion Talent Network</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold border border-white/10">
                      بروفايلات احترافية موثقة (LinkedIn / FB Style)
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                    <Ruler className="w-7 h-7 text-amber-400" />
                    <span>دليل نخبة الموديليست والباترونيست بالمغرب</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    تصفح السير الذاتية المهنية، نماذج الباترونات المنفذة (Patronage & Gradation)، والبرامج المعتمدة (Lectra, Gerber, CLO 3D). تواصل مباشرة مع الموديليست عبر واتساب لبدء كوليكسيونك القادمة.
                  </p>
                </div>

                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-left font-mono">
                    <span className="text-[10px] text-slate-300 block font-sans">الموديليست المعتمدون</span>
                    <span className="text-xl font-black text-amber-400">{filteredModelistes.length} خبير متاح</span>
                  </div>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-bold ml-2">التصنيف التخصصي:</span>
                {[
                  { id: 'all', label: 'جميع الخبراء' },
                  { id: 'streetwear', label: '🧥 ستريتوير وأوفرسايز' },
                  { id: 'denim', label: '👖 دنيم وسراويل كارجو' },
                  { id: 'femme', label: '👗 ملابس نسائية وعبايات' },
                  { id: 'sport', label: '🏃 رياضية وأكتيف وير' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setModelisteCategoryFilter(cat.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      modelisteCategoryFilter === cat.id
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                        : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LinkedIn / Facebook Style Modélistes Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredModelistes.map((mod) => {
                const totalEndorsements = (mod.endorsementsBase || 50) + (endorsedModelistes[mod.id] || 0);
                const hasUserEndorsed = Boolean(endorsedModelistes[mod.id]);

                return (
                  <div 
                    key={mod.id} 
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* 1. Cover Photo Banner (Facebook / LinkedIn Style) */}
                      <div className="h-32 md:h-36 relative overflow-hidden bg-slate-900">
                        <img 
                          src={mod.banner} 
                          alt={mod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Top Banner Tags */}
                        <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black border border-amber-400/30">
                            {mod.categoryLabel}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>{mod.availability}</span>
                          </span>
                        </div>
                      </div>

                      {/* 2. Overlapping Circular Avatar + Identity Header */}
                      <div className="px-6 pb-2 relative">
                        <div className="flex items-end justify-between -mt-12 mb-3">
                          <div className="relative">
                            <img 
                              src={mod.avatar} 
                              alt={mod.name} 
                              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg shadow-slate-900/10 bg-slate-100"
                            />
                            {mod.verified && (
                              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full border-2 border-white shadow-xs" title="موديليست موثق">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Quick Stats Pill */}
                          <div className="text-left font-mono bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-2xl">
                            <span className="text-[10px] text-slate-400 block font-sans">ابتداءً من</span>
                            <span className="text-base font-black text-emerald-600">{mod.startPriceMAD} DH</span>
                            <span className="text-[9px] text-slate-500 block font-sans">باترون + تدريج</span>
                          </div>
                        </div>

                        {/* Name & LinkedIn Headline */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-lg text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => { setSelectedModelisteProfile(mod); setModelisteProfileTab('about'); }}>
                              {mod.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200/60">
                              {mod.studio}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-700 leading-snug">
                            {mod.headline}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{mod.city}</span>
                            </span>
                            <span>•</span>
                            <span className="text-indigo-600 font-bold">خبرة {mod.experienceYears}</span>
                            <span>•</span>
                            <span>⭐ <strong>{mod.rating}</strong> ({mod.reviewsCount} تقييم)</span>
                          </div>
                        </div>

                        {/* Bio Excerpt */}
                        <p className="text-xs text-slate-600 leading-relaxed mt-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100/80">
                          {mod.desc}
                        </p>

                        {/* Software Badges */}
                        <div className="mt-3.5 space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            البرامج والمهارات المعتمدة:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {mod.software.map((sw: string, sIdx: number) => (
                              <span 
                                key={sIdx}
                                className="px-2.5 py-1 bg-indigo-50/80 text-indigo-700 text-[11px] font-bold rounded-xl border border-indigo-100"
                              >
                                {sw}
                              </span>
                            ))}
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-xl border border-emerald-100">
                              Gradation XS إلى 3XL ✓
                            </span>
                          </div>
                        </div>

                        {/* Mini Visual Portfolio (Facebook / LinkedIn Featured Gallery) */}
                        <div className="mt-4 space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            أبرز نماذج الباترون المنفذة:
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {mod.portfolio.map((item: any, pIdx: number) => (
                              <div 
                                key={pIdx} 
                                onClick={() => { setSelectedModelisteProfile(mod); setModelisteProfileTab('portfolio'); }}
                                className="group/item relative h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer"
                              >
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                                  <span className="text-[9px] font-bold text-white truncate w-full">
                                    {item.title}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Footer Action Bar (LinkedIn Style) */}
                    <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 mt-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>التسليم: {mod.turnaround}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleEndorse(mod.id, e)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition active:scale-95 cursor-pointer ${
                            hasUserEndorsed 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>توصية بالمهارات ({totalEndorsements})</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setSelectedModelisteProfile(mod); setModelisteProfileTab('about'); }}
                          className="flex-1 py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                          <span>عرض البروفايل الكامل</span>
                        </button>

                        <a
                          href={`https://wa.me/${mod.whatsapp}?text=${encodeURIComponent(`السلام عليكم أستاذ(ة) ${mod.name}، شفت البروفايل ديالك فـ BEYA NETWORK وبغيت نطلب خدمة باترون وتدريج لموديل جديد.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer"
                        >
                          <Phone className="w-4 h-4" />
                          <span>تواصل فالواتساب</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* ───────────────── FULL MODÉLISTE PROFILE MODAL (LINKEDIN / FACEBOOK STYLE) ───────────────── */}
      {selectedModelisteProfile && (() => {
        const mod = selectedModelisteProfile;
        const totalEndorsements = (mod.endorsementsBase || 50) + (endorsedModelistes[mod.id] || 0);

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in" dir="rtl">
            <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col my-auto relative custom-scrollbar">
              
              {/* Cover Banner */}
              <div className="h-44 md:h-52 relative overflow-hidden bg-slate-900 shrink-0">
                <img src={mod.banner} alt={mod.name} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedModelisteProfile(null)}
                  className="absolute top-4 left-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-xs font-black border border-amber-400/30">
                    {mod.categoryLabel}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>{mod.availability}</span>
                  </span>
                </div>
              </div>

              {/* Profile Card Header Info */}
              <div className="px-6 md:px-8 pb-4 relative border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-4">
                  <div className="relative">
                    <img 
                      src={mod.avatar} 
                      alt={mod.name} 
                      className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100"
                    />
                    {mod.verified && (
                      <div className="absolute bottom-1 right-1 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="موديليست معتمد">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleEndorse(mod.id)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <ThumbsUp className="w-4 h-4 text-indigo-600" />
                      <span>توصية ({totalEndorsements})</span>
                    </button>

                    <a
                      href={`https://wa.me/${mod.whatsapp}?text=${encodeURIComponent(`السلام عليكم أستاذ(ة) ${mod.name}، تواصلت معك من خلال بروفايلك فـ BEYA NETWORK وبغيت نستفسر على الباترون وتفاصيل الخدمة.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>واتساب مباشر</span>
                    </a>
                  </div>
                </div>

                {/* Identity */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">{mod.name}</h2>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg">
                      {mod.studio}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-slate-700 mt-1">
                    {mod.headline}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{mod.city}</span>
                    <span>•</span>
                    <span>الهاتف: <strong className="font-mono text-slate-700">{mod.phone}</strong></span>
                  </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold">الباترونات المنجزة</span>
                    <span className="text-base font-black text-slate-900">+{mod.completedPatterns}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold">سنوات الخبرة</span>
                    <span className="text-base font-black text-indigo-600">{mod.experienceYears}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold">التقييم العام</span>
                    <span className="text-base font-black text-amber-500">⭐ {mod.rating} / 5</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold">مدة الإنجاز</span>
                    <span className="text-base font-black text-emerald-600">{mod.turnaround}</span>
                  </div>
                </div>

                {/* Profile Tabs (LinkedIn Style) */}
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100 overflow-x-auto">
                  {[
                    { id: 'about', label: 'السيرة والنبذة' },
                    { id: 'portfolio', label: `معرض النماذج (${mod.portfolio.length})` },
                    { id: 'pricing', label: 'الأسعار والخدمات' },
                    { id: 'reviews', label: `توصيات الزبائن (${mod.reviews.length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setModelisteProfileTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                        modelisteProfileTab === tab.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="p-6 md:p-8 space-y-6 flex-1 text-slate-800">
                {modelisteProfileTab === 'about' && (
                  <div className="space-y-6">
                    {/* About */}
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">نبذة مهنية (À propos)</h4>
                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {mod.about}
                      </p>
                    </div>

                    {/* Experiences */}
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">سجل الخبرات والمسار المهني</h4>
                      <div className="space-y-3">
                        {mod.experiences.map((exp: any, eIdx: number) => (
                          <div key={eIdx} className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-sm text-slate-900">{exp.role}</h5>
                              <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{exp.period}</span>
                            </div>
                            <p className="text-xs font-bold text-amber-700">{exp.company}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{exp.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education & Certs */}
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">التكوين والشهادات</h4>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                          <span>{mod.education}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {mod.certifications.map((c: string, cIdx: number) => (
                            <span key={cIdx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold">
                              ✓ {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modelisteProfileTab === 'portfolio' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">معرض الموديلات والباترونات المنفذة</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mod.portfolio.map((pItem: any, pi: number) => (
                        <div key={pi} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group/p">
                          <div className="h-48 relative overflow-hidden bg-slate-900">
                            <img src={pItem.image} alt={pItem.title} className="w-full h-full object-cover group-hover/p:scale-105 transition-transform duration-500" />
                            <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/70 text-white rounded-lg text-[10px] font-black">
                              {pItem.tag}
                            </span>
                          </div>
                          <div className="p-4 space-y-1">
                            <h5 className="font-black text-sm text-slate-900">{pItem.title}</h5>
                            <p className="text-xs text-slate-500">{pItem.specs}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modelisteProfileTab === 'pricing' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">لائحة أسعار الخدمات الشفافة</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-slate-900">الباترون الأساسي (Patron de Base)</strong>
                          <span className="text-slate-400 text-[11px]">ملف DXF/RUL + PDF بالحجم الحقيقي 1:1</span>
                        </div>
                        <span className="text-base font-black text-emerald-600 font-mono">{mod.pricing.basePattern} DH</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-slate-900">تدريج المقاسات (Gradation)</strong>
                          <span className="text-slate-400 text-[11px]">لكل مقاس إضافي (XS إلى 3XL)</span>
                        </div>
                        <span className="text-base font-black text-emerald-600 font-mono">+{mod.pricing.gradation} DH</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-slate-900">محاكاة ثلاثية الأبعاد (Rendu CLO 3D)</strong>
                          <span className="text-slate-400 text-[11px]">فيديو 360 درجة وصور للموديل على مانيكان</span>
                        </div>
                        <span className="text-base font-black text-indigo-600 font-mono">+{mod.pricing.simulation3d} DH</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-slate-900">البطاقة التقنية والاستهلاك (Placement)</strong>
                          <span className="text-slate-400 text-[11px]">حساب أمتار القماش وهوامش الفصالة</span>
                        </div>
                        <span className="text-base font-black text-indigo-600 font-mono">+{mod.pricing.ficheTech} DH</span>
                      </div>
                    </div>
                  </div>
                )}

                {modelisteProfileTab === 'reviews' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">توصيات البراندات والزبائن</h4>
                    <div className="space-y-3">
                      {mod.reviews.map((rev: any, rIdx: number) => (
                        <div key={rIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="text-xs font-extrabold text-slate-900">{rev.author}</strong>
                              <span className="text-xs text-slate-400 mr-2 font-medium">({rev.brand})</span>
                            </div>
                            <span className="text-[11px] text-amber-500 font-black">{'⭐'.repeat(rev.rating)}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                          <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky CTA */}
              <div className="p-4 md:p-6 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between gap-4 sticky bottom-0 z-20">
                <div>
                  <span className="text-[10px] text-slate-400 block">بدء طلب باترون فوري</span>
                  <strong className="text-xs md:text-sm text-amber-400">{mod.name}</strong>
                </div>

                <a
                  href={`https://wa.me/${mod.whatsapp}?text=${encodeURIComponent(`السلام عليكم أستاذ(ة) ${mod.name}، أنا مهتم بخدمات الباترون والتدريج ديالك فـ BEYA NETWORK وبغيت نناقش معك موديل جديد.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs md:text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>تواصل فـ الواتساب للاتفاق على الموديل</span>
                </a>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
