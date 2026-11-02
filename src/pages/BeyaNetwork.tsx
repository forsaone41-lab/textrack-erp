import SupplierProfilePage from './SupplierProfilePage';
import { SUPPLIERS_DATA } from '../data/suppliersData';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Users, Package, MessageCircle, GraduationCap, ArrowRight, ArrowLeft, Search, 
  Send, ThumbsUp, MessageSquare, ShieldCheck, CheckCircle2, Phone, 
  Sparkles, Plus, X, ExternalLink, Filter, MapPin, Tag, Scissors, 
  Building2, Layers, Award, Clock, ChevronDown, Check, Share2, 
  SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag, Palette, 
  Ruler, Eye, Briefcase, FileCode2, Star
} from 'lucide-react';
import { User, saveRecord } from '../types';
import { MODELISTES_DATA, ModelisteProfile } from '../data/modelistesData';

interface BeyaNetworkProps {
  currentUser: User | null;
  onLogout?: () => void;
}

export default function BeyaNetwork({ currentUser, onLogout }: BeyaNetworkProps) {
  const navigate = useNavigate();
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
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  // Auto-detect supplier from URL hash
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.includes('supplier/')) {
        const supId = hash.split('supplier/')[1]?.split('?')[0];
        const match = SUPPLIERS_DATA.find(s => s.id === supId);
        if (match) {
          setSelectedSupplier(match);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);


  const [supplierModalTab, setSupplierModalTab] = useState<'catalog' | 'reviews' | 'about' | 'tamyoz'>('catalog');
  const [selectedSupplierCityFilter, setSelectedSupplierCityFilter] = useState<string>('all');
  const [selectedFabricTypeFilter, setSelectedFabricTypeFilter] = useState<string>('all');
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({ author: '', brand: '', rating: 5, text: '' });
  const [supplierCustomReviews, setSupplierCustomReviews] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem('beya_supplier_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleAddSupplierReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !newReviewForm.text.trim()) return;
    const rev = {
      author: newReviewForm.author.trim() || userProfile.brandName || 'براند شريكة',
      brand: newReviewForm.brand.trim() || (userProfile.activity ? `علامة ${userProfile.activity}` : 'ماركة أزياء مغربية'),
      rating: Number(newReviewForm.rating) || 5,
      date: 'الآن (مباشر)',
      text: newReviewForm.text.trim()
    };
    const supId = selectedSupplier.id;
    setSupplierCustomReviews(prev => {
      const nextReviews = [rev, ...(prev[supId] || [])];
      const updated = { ...prev, [supId]: nextReviews };
      try { localStorage.setItem('beya_supplier_reviews', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setNewReviewForm({ author: '', brand: '', rating: 5, text: '' });
    setShowAddReviewModal(false);
  };
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
  // ───────────────── 2. MODELISTES DIRECTORY DATA ─────────────────
  const modelistesList = MODELISTES_DATA;

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
    if (selectedSupplierCityFilter !== 'all' && s.cityTag !== selectedSupplierCityFilter) return false;
    if (selectedFabricTypeFilter !== 'all' && !s.fabricTags.includes(selectedFabricTypeFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (s.name + ' ' + s.desc + ' ' + s.city + ' ' + (s.district || '') + ' ' + s.products.join(' ')).toLowerCase();
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

    // ───────────────── DEDICATED FULL SUPPLIER PAGE VIEW ─────────────────
  if (selectedSupplier) {
    return (
      <SupplierProfilePage 
        supplierId={selectedSupplier.id} 
        onBack={() => {
          setSelectedSupplier(null);
          if (window.location.hash.includes('supplier')) {
            window.location.hash = '#/network';
          }
        }} 
      />
    );
  }

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

                <div onClick={() => navigate(`/modeliste/${modelistesList[0].id}`)} className="cursor-pointer group">
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                    {modelistesList[0].name}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {modelistesList[0].headline}
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
            
            {/* 1. Header with Tamyoz / Facebook Comparison Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>دليل الموردين المعتمدين والموثقين بالمغرب 🧵</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                      قيمة مضافة وضمان تام مقارنة بكروبات فيسبوك
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    موردو الأقمشة، المطابع، ولوازم النسيج بأسعار الجملة المباشرة
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    تواصل مباشر مع كبار تجار الأقمشة في درب عمر، فاس، وطنجة. أقمشة مفحوصة الجودة، ميزان إلكتروني مضبوط، وأسعار تفضيلية خاصة بأعضاء BEYA مع إمكانية طلب رولو اختبار قبل الكميات الكبرى.
                  </p>
                </div>

                {/* 3 Key Advantages vs Facebook */}
                <div className="grid grid-cols-3 gap-2.5 shrink-0 w-full lg:w-auto">
                  <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/15 text-center">
                    <span className="text-xs font-black text-emerald-400 block mb-0.5">✓ أقمشة مفحوصة</span>
                    <span className="text-[10px] text-slate-300 font-medium">انكماش &lt; 2.5%</span>
                  </div>
                  <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/15 text-center">
                    <span className="text-xs font-black text-amber-400 block mb-0.5">✓ رولو تجريبي</span>
                    <span className="text-[10px] text-slate-300 font-medium">Rouleau Test متاح</span>
                  </div>
                  <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/15 text-center">
                    <span className="text-xs font-black text-cyan-400 block mb-0.5">✓ سعر VIP مباشر</span>
                    <span className="text-[10px] text-slate-300 font-medium">بدون سماسرة فيسبوك</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Interactive Search & Multi-Filters Bar */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-xs space-y-3.5">
              
              {/* Category Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">التخصص الرئيسي:</span>
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
                        type="button"
                        onClick={() => setSupplierCategoryFilter(cat.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          supplierCategoryFilter === cat.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-bold">
                  {filteredSuppliers.length} مورد معتمد متاح
                </span>
              </div>

              {/* City Filter & Matching Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>المدينة والموقع :</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'جميع المدن المغربية' },
                    { id: 'casablanca', label: '📍 الدار البيضاء (درب عمر / كراج علال)' },
                    { id: 'tanger', label: '📍 طنجة (المنطقة الحرة)' },
                    { id: 'fes', label: '📍 فاس (المدينة الصناعية)' }
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setSelectedSupplierCityFilter(ct.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedSupplierCityFilter === ct.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Type Specific Filter Row (الأقمشة لي كيقلبو عليها الناس) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                  <span>نوع القماش الأكثر طلباً :</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'جميع الأقمشة' },
                    { id: 'molleton', label: '❄️ مولطون وهودي (340g)' },
                    { id: 'interlock', label: '👕 إنترلوك دابل نيت (240g)' },
                    { id: 'jersey', label: '👕 جيرسي قطن صيفي' },
                    { id: 'gabardine', label: '👖 جاباردين كارجو' },
                    { id: 'denim', label: '👖 دينيم وجينز' },
                    { id: 'waterproof', label: '🌧️ ووتربروف وتقني' }
                  ].map((fab) => (
                    <button
                      key={fab.id}
                      type="button"
                      onClick={() => setSelectedFabricTypeFilter(fab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedFabricTypeFilter === fab.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                      }`}
                    >
                      {fab.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. Suppliers Grid with Full Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSuppliers.map((supplier) => {
                const isMyCity = userProfile.city && supplier.city.includes(userProfile.city.split(' ')[0]);
                const customRevs = supplierCustomReviews[supplier.id] || [];
                const allReviews = [...customRevs, ...(supplier.reviews || [])];
                const totalRevsCount = (supplier.reviewsCount || 0) + customRevs.length;

                return (
                  <div 
                    key={supplier.id} 
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover & Avatar Header */}
                      <div className="relative h-28 bg-slate-800 overflow-hidden">
                        <img 
                          src={supplier.cover || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80"} 
                          alt={supplier.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-white/90 text-slate-900 shadow-xs backdrop-blur-xs">
                            {supplier.categoryLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>{supplier.rating} ({totalRevsCount})</span>
                          </span>
                        </div>

                        {/* City Match Badge if same city */}
                        {isMyCity && (
                          <div className="absolute bottom-2 right-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>📍 في نفس مدينتك (تسليم فوري)</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Supplier Body Details */}
                      <div className="p-4 md:p-5 space-y-3.5">
                        
                        {/* Name & Location */}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 
                              onClick={() => { setSelectedSupplier(supplier); setSupplierModalTab('catalog'); }}
                              className="font-black text-base text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer leading-tight"
                            >
                              {supplier.name}
                            </h3>
                            {supplier.verified && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-black border border-blue-200" title="مورد موثق ومعتمد">
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                <span>موثوق BEYA</span>
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{supplier.district || supplier.city}</span>
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {supplier.desc}
                        </p>

                        {/* Available Stock & Fabrics Tags */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
                            <span className="text-slate-700 flex items-center gap-1">
                              <Package className="w-3 h-3 text-indigo-600" />
                              <span>السلعة المتوفرة فالمخزن (Stock):</span>
                            </span>
                            <span className="text-emerald-700 text-[10px] font-bold">
                              {supplier.priceRange}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {supplier.products.slice(0, 4).map((prod: string, idx: number) => (
                              <span 
                                key={idx} 
                                onClick={() => { setSelectedSupplier(supplier); setSupplierModalTab('catalog'); }}
                                className="px-2 py-0.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[10px] font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              >
                                {prod}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* BEYA Advantage & MOQ */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/80 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-amber-900">
                            <span>⭐ امتياز BEYA VIP :</span>
                            <span className="text-emerald-700">✓ أسعار خاصة</span>
                          </div>
                          <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                            {supplier.beyaAdvantage || 'تخفيض أسعار الجملة المباشرة مع إمكانية أخذ رولو تجريبي'}
                          </p>
                        </div>

                        {/* Latest Review Snippet */}
                        {allReviews.length > 0 && (
                          <div 
                            onClick={() => { setSelectedSupplier(supplier); setSupplierModalTab('reviews'); }}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] cursor-pointer hover:bg-slate-100 transition"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span className="font-bold text-slate-700">{allReviews[0].brand || allReviews[0].author}</span>
                              <span className="text-amber-500 font-bold">★ {allReviews[0].rating}</span>
                            </div>
                            <p className="text-[10px] italic text-slate-500 line-clamp-1">
                              "{allReviews[0].text}"
                            </p>
                          </div>
                        )}

                        {/* Specs Footer */}
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>الحد الأدنى: <strong>{supplier.minQty}</strong></span>
                          <span>{supplier.deliveryTime?.split('•')[0] || 'تسليم سريع'}</span>
                        </div>

                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setSelectedSupplier(supplier); setSupplierModalTab('catalog'); }}
                        className="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>الملف والسلعة</span>
                      </button>

                      <a
                        href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معك من خلال منصة BEYA NETWORK بخصوص طلب الأقمشة والسلعة المتوفرة لديكم بسعر BEYA VIP التفضيلـي.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 text-center"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>واتساب VIP</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSuppliers.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-2">
                <Scissors className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-base text-slate-800">لا يوجد موردون يطابقون خيارات الفلترة الحالية</h4>
                <p className="text-xs text-slate-500">جرب تغيير المدينة أو نوع القماش لعرض الموردين المتاحين.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSupplierCategoryFilter('all');
                    setSelectedSupplierCityFilter('all');
                    setSelectedFabricTypeFilter('all');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold mt-2"
                >
                  إعادة ضبط جميع الفلاتر
                </button>
              </div>
            )}

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
                          <div 
                            className="relative cursor-pointer group/avatar" 
                            onClick={() => navigate(`/modeliste/${mod.id}`)}
                            title="عرض صفحة الموديليست الكاملة"
                          >
                            <img 
                              src={mod.avatar} 
                              alt={mod.name} 
                              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg shadow-slate-900/10 bg-slate-100 group-hover/avatar:ring-2 group-hover/avatar:ring-indigo-500 transition"
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
                            <h3 className="font-black text-lg text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate(`/modeliste/${mod.id}`)}>
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
                                onClick={() => navigate(`/modeliste/${mod.id}`)}
                                className="group/item relative h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer"
                                title="عرض نموذج الباترون فصفحة الموديليست"
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
                          onClick={() => navigate(`/modeliste/${mod.id}`)}
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
            {/* ───────────────── ADD SUPPLIER REVIEW MODAL ───────────────── */}
      {showAddReviewModal && selectedSupplier && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">أضف تقييمك وتجربتك</h3>
                <p className="text-xs text-slate-500">مع المورد: {selectedSupplier.name}</p>
              </div>
              <button onClick={() => setShowAddReviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierReview} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسمك الكامل أو اللقب :</label>
                <input
                  type="text"
                  required
                  value={newReviewForm.author}
                  onChange={e => setNewReviewForm({ ...newReviewForm, author: e.target.value })}
                  placeholder="مثال: يوسف، أمين البورقادي..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم علامتك التجارية أو المشغل :</label>
                <input
                  type="text"
                  required
                  value={newReviewForm.brand}
                  onChange={e => setNewReviewForm({ ...newReviewForm, brand: e.target.value })}
                  placeholder="مثال: براند Casablanca Streetwear..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التقييم من 5 نجوم :</label>
                <div className="flex items-center gap-2">
                  {[5, 4, 3, 2, 1].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewReviewForm({ ...newReviewForm, rating: st })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                        newReviewForm.rating === st
                          ? 'bg-amber-400 border-amber-500 text-slate-950 font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رأيك الصريح في جودة القماش والتعامل والميزان :</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewForm.text}
                  onChange={e => setNewReviewForm({ ...newReviewForm, text: e.target.value })}
                  placeholder="شارك تجربتك بكل صراحة: واش السلعة نقية؟ الميزان مضبوط؟ كيفاش جاوك الأثمنة وسرعة التوصيل؟"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition"
                >
                  نشر التقييم فـ BEYA NETWORK ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
