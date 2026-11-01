import React, { useState, useEffect } from 'react';
import { 
  Globe, Users, Package, MessageCircle, ArrowRight, ArrowLeft, Search, 
  Send, ThumbsUp, MessageSquare, ShieldCheck, CheckCircle2, Phone, 
  Sparkles, Plus, X, ExternalLink, Filter, MapPin, Tag, Scissors, 
  Building2, Layers, Award, Clock, ChevronDown, Check, Share2, 
  SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag
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

  // Navigation tab in Network
  const [activeTab, setActiveTab] = useState<'feed' | 'suppliers' | 'groupage' | 'members'>('feed');

  // Search query & Category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [forumTopicFilter, setForumTopicFilter] = useState<'all' | 'livraison' | 'marketing' | 'tissus' | 'conseils' | 'groupage'>('all');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState<'all' | 'tissu' | 'impression' | 'broderie' | 'modeliste'>('all');
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
      brandName: saved?.brandName || currentUser?.brandName || (currentUser as any)?.store_name || (currentUser as any)?.storeName || currentUser?.nom || 'FAS Brand',
      city: saved?.city || currentUser?.ville || 'الدار البيضاء (Casablanca)',
      phone: saved?.phone || currentUser?.telephone || '0600000000',
      bio: saved?.bio || currentUser?.networkBio || 'علامة تجارية مغربية للملابس الجاهزة والستريتوير'
    };
  });

  const [isProfileSetupCompleted, setIsProfileSetupCompleted] = useState<boolean>(() => {
    if (currentUser?.networkProfileCompleted) return true;
    try {
      if (localStorage.getItem(`beya_network_completed_${emailKey}`) === 'true') return true;
    } catch {}
    return true; // Default completed for smooth UX
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
        comments: [
          {
            id: 'c-5',
            author: 'فاطمة الزهراء',
            role: 'مصممة أزياء',
            city: 'طنجة',
            content: 'معلومة قيمة جداً، شكراً على مشاركة هذه التفاصيل التقنية الدقيقة!',
            date: 'أمس، 20:10'
          }
        ]
      },
      {
        id: 'post-mkt-1',
        author: 'عمر التازي',
        authorRole: 'صاحب براند كاجوال',
        authorRoleKey: 'brand',
        city: 'مراكش',
        title: '📢 تجربة إعلانات TikTok Ads لبراند ملابس: شنو لي خدام دابا؟',
        category: 'marketing',
        content: 'شاركت معاكم هاد التيست لي درناه هاد الأسبوع: صور الكاتالوج الاحترافية عطاتنا ROAS ديال 1.9، بينما فيديو بسيط مصور بالأيفون وسط الورشة كيبين تقطيع الثوب وخياطة الشعار (Behind The Scenes) جاب ROAS 4.3 ونفس الموديل تباع منو 140 بياس فـ 48 ساعة!\nالكليان المغربي كيعجبو يشوف أصالة التصنيع والخدمة المتقونة.',
        date: 'منذ يومين',
        likesCount: 52,
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

  // Suppliers Directory Data
  const suppliersList = [
    {
      id: 'sup-1',
      name: 'مجمع أقمشة الشرق (Derb Omar)',
      category: 'tissu',
      categoryLabel: 'أقمشة وتوريد قطن',
      city: 'الدار البيضاء (درب عمر)',
      whatsapp: '212661849201',
      phone: '0661849201',
      products: ['مولتون شتوي 340g مبطن', 'إنترلوك أصلي 100% قطن', 'جيرسي ليكرا صيفي', 'كوتون كوردوروي'],
      minQty: 'ابتداءً من 25 كلغ (رولو واحد)',
      rating: 4.9,
      verified: true,
      desc: 'الموزع المعتمد لأرقى خامات الأقطان والمنسوجات الشتوية والصيفية في درب عمر. أسعار تفضيلية خاصة بأعضاء شبكة BEYA.'
    },
    {
      id: 'sup-2',
      name: 'المركز الرقمي للطباعة والـ DTF (Digital Print Pro)',
      category: 'impression',
      categoryLabel: 'طباعة وسيريغرافي',
      city: 'الدار البيضاء (عين السبع)',
      whatsapp: '212662938102',
      phone: '0662938102',
      products: ['طباعة DTF فائقة النقاء HD', 'سيريغرافي Plastisol & Waterbase', 'فلوكاج قطني مخملي', 'Sublimation'],
      minQty: 'ابتداءً من 30 قطعة',
      rating: 4.95,
      verified: true,
      desc: 'ورشة طباعة عصرية مجهزة بأحدث آلات الـ DTF والطباعة الحريرية بألوان ثابتة ومقاومة للغسيل المتكرر.'
    },
    {
      id: 'sup-3',
      name: 'استوديو الباترون الرقمي (Atelier Patronage Pro)',
      category: 'modeliste',
      categoryLabel: 'تصميم وموديلست',
      city: 'الدار البيضاء / طنجة',
      whatsapp: '212663049182',
      phone: '0663049182',
      products: ['إعداد الباترون الرقمي Gerber & Lectra', 'تدريج القياسات (Gradation XS-3XL)', 'إعداد Fiche Technique كاملة'],
      minQty: 'موديل واحد',
      rating: 5.0,
      verified: true,
      desc: 'مهندسو وموديلست أزياء معتمدون لتجهيز ملفات الباترون الدقيقة المتوافقة مباشرة مع ماكينات الفصالة بالليزر.'
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
      rating: 4.85,
      verified: true,
      desc: 'أسطول ماكينات تطريز يابانية Tajima 12 رأس لدقة متناهية وسرعة فائقة في تنفيذ أرقى شعارات الماركات.'
    },
    {
      id: 'sup-5',
      name: 'أقمشة المسيرة الشمالية (Tissus Nord)',
      category: 'tissu',
      categoryLabel: 'أقمشة سراويل وفيستات',
      city: 'طنجة (المنطقة الحرة)',
      whatsapp: '212665819203',
      phone: '0665819203',
      products: ['جاباردين كوتون ستريتش متين', 'قماش كوتون كانفاس (Canvas)', 'أقمشة تقنية مضادة للماء'],
      minQty: 'ابتداءً من 30 متر',
      rating: 4.8,
      verified: true,
      desc: 'متخصصون في توريد خامات السراويل الكارجو والسترات الواقية والمآزر بأعلى معايير المتانة ومقاومة التمزق.'
    }
  ];

  // Members Directory Data
  const networkMembers = [
    {
      id: 'mem-1',
      name: userProfile.brandName || 'FAS Brand',
      role: 'صاحب علامة تجارية',
      roleKey: 'brand',
      city: userProfile.city.split(' ')[0] || 'الدار البيضاء',
      verified: true,
      bio: userProfile.bio || 'علامة ملابس شبابية وستريتوير بالمغرب',
      whatsapp: userProfile.phone,
      isCurrentUser: true
    },
    {
      id: 'mem-2',
      name: 'سفيان تيكستيل',
      role: 'مورد أقمشة معتمد',
      roleKey: 'supplier',
      city: 'الدار البيضاء',
      verified: true,
      bio: 'توريد أقمشة القطن والمولتون بالجملة في درب عمر',
      whatsapp: '0661849201'
    },
    {
      id: 'mem-3',
      name: 'أمين البراندي',
      role: 'صاحب علامة تجارية',
      roleKey: 'brand',
      city: 'الدار البيضاء',
      verified: true,
      bio: 'براند ملابس هوديات وتيشرتات أوفرسايز',
      whatsapp: '0662112233'
    },
    {
      id: 'mem-4',
      name: 'المركز الرقمي للطباعة',
      role: 'ورشة طباعة معتمدة',
      roleKey: 'imprimeur',
      city: 'عين السبع',
      verified: true,
      bio: 'طباعة DTF وسيريغرافي للعلامات التجارية',
      whatsapp: '0662938102'
    },
    {
      id: 'mem-5',
      name: 'فاطمة الزهراء الباترونيست',
      role: 'موديلست معتمدة',
      roleKey: 'modeliste',
      city: 'طنجة',
      verified: true,
      bio: 'تصميم الباترونات الرقمية والتدريج بالليكترا وجيربر',
      whatsapp: '0663049182'
    },
    {
      id: 'mem-6',
      name: 'سيمو الودغيري',
      role: 'متجر ملابس إلكتروني',
      roleKey: 'brand',
      city: 'فاس',
      verified: true,
      bio: 'تجارة إلكترونية متخصصة في الجينز والقمصان',
      whatsapp: '0665445566'
    }
  ];

  // Save profile updates
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const updatedUser: User = {
        ...currentUser!,
        brandName: userProfile.brandName.trim() || 'FAS Brand',
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
      author: userProfile.brandName || currentUser?.nom || 'FAS Brand',
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

  // Filter members
  const filteredMembers = networkMembers.filter(m => {
    if (selectedCityFilter !== 'all' && !m.city.includes(selectedCityFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (m.name + ' ' + m.bio + ' ' + m.city + ' ' + m.role).toLowerCase();
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
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded border border-amber-300">VIP</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">شبكة صناع الموضة، الموردين والبراندات بالمغرب</p>
              </div>
            </div>

            {/* Global Search Bar (Facebook style) */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن موردين، أقمشة، ماركات، نقاشات..."
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

            {/* Center Desktop Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'feed'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>المجتمع</span>
              </button>

              <button
                onClick={() => setActiveTab('suppliers')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'suppliers'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Scissors className="w-4 h-4 text-emerald-600" />
                <span>الموردون المعتمدون</span>
              </button>

              <button
                onClick={() => setActiveTab('groupage')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'groupage'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>الشراء المشترك</span>
                <span className="hidden lg:inline-block px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-black rounded-full">خصم 28%</span>
              </button>

              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'members'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>الأعضاء</span>
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
            <span className="text-slate-300 shrink-0">📦 تجمع شراء الإنترلوك اكتمل بنسبة 70%</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 shrink-0">🚚 تحديث تجارب شركات التوصيل لشهر نونبر</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-300 shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>شبكة موثوقة ومغلقة</span>
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
                  <span>دليل الأقسام والخدمات</span>
                </h4>
                
                <div className="space-y-1.5 text-xs font-bold text-slate-700">
                  <button 
                    onClick={() => { setActiveTab('suppliers'); setSupplierCategoryFilter('tissu'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>موردو الأقمشة (درب عمر، فاس)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">18 مورد</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('suppliers'); setSupplierCategoryFilter('impression'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>مطابع DTF والسيريغرافي</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">12 ورشة</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('suppliers'); setSupplierCategoryFilter('modeliste'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>مصممو الباترون والموديلست</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">8 خبراء</span>
                  </button>

                  <button 
                    onClick={() => { setForumTopicFilter('livraison'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>تجارب شركات التوصيل</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">24 نقاش</span>
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
                    onClick={() => { setNewPostData(p => ({ ...p, category: 'livraison' })); setShowNewPostModal(true); }}
                    className="flex items-center gap-1.5 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Building2 className="w-4 h-4 text-rose-500" />
                    <span>شركة توصيل</span>
                  </button>
                  <button 
                    onClick={() => { setNewPostData(p => ({ ...p, category: 'marketing' })); setShowNewPostModal(true); }}
                    className="flex items-center gap-1.5 hover:text-amber-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>نصيحة إعلانات</span>
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
                  { id: 'conseils', label: '💡 نصائح الإنتاج' },
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

                        {/* Direct WhatsApp button if author is a verified supplier/partner */}
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

            {/* ─── LEFT COLUMN: Verified Suppliers & Group Buying Widgets ─── */}
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
                      <div className="flex flex-wrap gap-1">
                        {sup.products.slice(0, 2).map((p, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-white text-slate-700 text-[10px] rounded border border-slate-200">
                            {p}
                          </span>
                        ))}
                      </div>
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

              {/* Widget: Group Buying Fabric (Achats Groupés) */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                    الشراء المشترك
                  </span>
                  <span className="text-xs font-bold text-amber-900 font-mono">خصم 28%</span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                    {groupDeals[0].title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    عوض 58 درهم/كلغ ➔ <strong className="text-emerald-700 font-black">42 درهم/كلغ</strong>
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-600">المحجوز: {groupDeals[0].currentKg} كلغ</span>
                    <span className="text-amber-700 font-mono">
                      {Math.round((groupDeals[0].currentKg / groupDeals[0].targetKg) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-amber-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((groupDeals[0].currentKg / groupDeals[0].targetKg) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">باقي فقط {groupDeals[0].targetKg - groupDeals[0].currentKg} كلغ لإغلاق الكوموند</p>
                </div>

                <button
                  onClick={() => setShowJoinGroupModal(groupDeals[0])}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-xs shadow-sm transition"
                >
                  حجز كمية والاستفادة من الثمن 📦
                </button>
              </div>

            </aside>

          </div>
        )}

        {/* ═════════════════ TAB 2: SUPPLIERS DIRECTORY ═════════════════ */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            
            {/* Header & Sub-filters */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Scissors className="w-6 h-6 text-indigo-600" />
                  <span>دليل الموردين وورشات العمل المعتمدة بالمغرب</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  تواصل مباشرة مع تجار الأقمشة، مطابع السيريغرافي، ومصممي الباترونات بأسعار تفضيلية لأعضاء BEYA
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'tissu', label: '🧵 أقمشة وقطن' },
                  { id: 'impression', label: '🖨️ طباعة وDTF' },
                  { id: 'broderie', label: '🪡 تطريز' },
                  { id: 'modeliste', label: '📐 باترون وموديلست' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSupplierCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      supplierCategoryFilter === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
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
                      <span className="block text-[11px] font-bold text-slate-700 mb-1.5">المنتجات والخدمات الرئيسية:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.products.map((prod, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-700 text-[11px] rounded-lg border border-slate-200">
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <strong>الحد الأدنى للطلب (MOQ):</strong> {supplier.minQty}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معك من خلال منصة BEYA NETWORK بخصوص ${supplier.categoryLabel}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>تواصل مباشر عبر الواتساب</span>
                  </a>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═════════════════ TAB 3: GROUP BUYING (ACHATS GROUPÉS) ═════════════════ */}
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
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-md transition"
                    >
                      حجز كمية في هذا التجمع (ابتداءً من 20 كلغ) 📦
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ═════════════════ TAB 4: MEMBERS DIRECTORY ═════════════════ */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  <span>دليل أعضاء BEYA NETWORK بالمغرب</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  رواد الموضة، أصحاب العلامات التجارية، الموردون وخبراء الصناعة المسجلون في المنصة
                </p>
              </div>

              <div className="w-full md:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو المدينة..."
                  className="w-full px-4 py-2 bg-slate-100 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                        {member.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 truncate">{member.name}</h3>
                          {member.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-xs font-bold text-indigo-600">{member.role}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">📍 {member.city}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {member.bio}
                    </p>
                  </div>

                  {member.whatsapp ? (
                    <a
                      href={`https://wa.me/${member.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معك من خلال BEYA NETWORK.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تواصل في الواتساب</span>
                    </a>
                  ) : (
                    <div className="text-center py-2 text-xs text-slate-400 font-medium">عضو مسجل</div>
                  )}
                </div>
              ))}
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
                  <option value="conseils">💡 نصيحة عامة أو تصنيع</option>
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
