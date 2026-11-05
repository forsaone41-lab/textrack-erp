import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Users, Package, MessageCircle, ArrowRight, ArrowLeft, Search,
  Send, ThumbsUp, MessageSquare, ShieldCheck, CheckCircle2, Phone,
  Sparkles, Plus, X, ExternalLink, Filter, MapPin, Tag, Scissors,
  Building2, Layers, Award, Clock, ChevronDown, Check, Share2,
  SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag, Palette,
  Ruler, Eye, Briefcase, FileCode2, Star, Hash, Volume2, Settings,
  Smile, Image as ImageIcon, AtSign, Menu, Flame, Heart, Lightbulb,
  Radio, Compass, ChevronRight, CheckCheck, Crown, Shield, HelpCircle
} from 'lucide-react';
import { User, saveRecord } from '../types';
import { MODELISTES_DATA, ModelisteProfile } from '../data/modelistesData';
import { SUPPLIERS_DATA, SupplierProfile } from '../data/suppliersData';

interface BeyaNetworkProps {
  currentUser: User | null;
  onLogout?: () => void;
}

// ─────────────────────────────────────────────────────────────
// TYPES & DATA STRUCTURES
// ─────────────────────────────────────────────────────────────

type ChannelCategory = 'annonces' | 'general' | 'experts' | 'deals';

interface DiscordChannel {
  id: string;
  name: string;
  category: ChannelCategory;
  categoryLabelAr: string;
  icon: string;
  topicAr: string;
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  channelId: string;
  author: string;
  authorAvatar: string;
  authorRole: string;
  authorRoleKey: 'admin' | 'modeliste' | 'tissu' | 'fournitures' | 'impression' | 'broderie' | 'brand';
  city: string;
  timestamp: string;
  content: string;
  reactions: Record<string, number>;
  userReactions: string[];
  whatsappContact?: string;
  whatsappMessage?: string;
  attachment?: {
    type: 'image' | 'tag' | 'badge';
    url?: string;
    label?: string;
  };
  replies?: Array<{
    id: string;
    author: string;
    authorRole: string;
    authorRoleKey: 'admin' | 'modeliste' | 'tissu' | 'fournitures' | 'impression' | 'broderie' | 'brand';
    city: string;
    content: string;
    timestamp: string;
  }>;
}

interface GroupageDeal {
  id: string;
  title: string;
  material: string;
  supplier: string;
  supplierCity: string;
  targetKg: number;
  currentKg: number;
  participantsCount: number;
  daysLeft: number;
  discountPrice: number;
  regularPrice: number;
  minCommitment: number;
  status: 'active' | 'success' | 'closing_soon';
  whatsappText: string;
}

export default function BeyaNetwork({ currentUser, onLogout }: BeyaNetworkProps) {
  const navigate = useNavigate();
  const emailKey = (currentUser?.email || '').toLowerCase().trim();
  const isPilotAuthorized = emailKey === 'forsaone41@gmail.com';

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION & UI STATE
  // ─────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<'chat' | 'directory' | 'groupage' | 'profile'>('chat');
  const [activeChannelId, setActiveChannelId] = useState<string>('tissu');
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'channels' | 'members'>('none');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'modeliste' | 'tissu' | 'fournitures' | 'impression' | 'broderie'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any | null>(null);
  const [expandedThreadMessageId, setExpandedThreadMessageId] = useState<string | null>(null);
  const [threadReplyDraft, setThreadReplyDraft] = useState('');

  // Sticky message composer state
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState(() => {
    let saved: any = null;
    try {
      const raw = localStorage.getItem(`beya_network_profile_${emailKey}`);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    return {
      brandName: saved?.brandName || currentUser?.brandName || (currentUser as any)?.store_name || (currentUser as any)?.nom || 'FAS Wear',
      city: saved?.city || currentUser?.ville || 'الدار البيضاء (Casablanca)',
      phone: saved?.phone || currentUser?.telephone || '0675239885',
      activity: saved?.activity || 'ملابس ستريتوير وهوديات أوفرسايز'
    };
  });

  // ─────────────────────────────────────────────────────────────
  // DISCORD CHANNELS LIST
  // ─────────────────────────────────────────────────────────────
  const channels: DiscordChannel[] = [
    // Category 1: إعلانات
    {
      id: 'annonces',
      name: '📢-إعلانات-الشبكة',
      category: 'annonces',
      categoryLabelAr: 'إعلانات ورشة BEYA',
      icon: '📢',
      topicAr: 'آخر أخبار وصول دفعات الأقمشة الجديدة، مستجدات الورشة، ومواعيد العينات'
    },
    // Category 2: صالونات النقاش العام
    {
      id: 'general',
      name: '💬-نقاش-عام-وأفكار',
      category: 'general',
      categoryLabelAr: 'صالونات النقاش العام',
      icon: '💬',
      topicAr: 'مجتمع صناع الموضة بالمغرب: تبادل الأفكار، توجهات التصميم، ونقاش مفتوح بين البراندات'
    },
    {
      id: 'marketing',
      name: '💡-تجارب-البراندات-والتسويق',
      category: 'general',
      categoryLabelAr: 'صالونات النقاش العام',
      icon: '💡',
      topicAr: 'تجارب إعلانات TikTok و Instagram، شركات التوصيل، والتسعير الذكي للكوليكسيون'
    },
    // Category 3: غرف الحرفيين والموردين (الأركان الـ 5)
    {
      id: 'tissu',
      name: '🧵-سوق-الأقمشة-tissu',
      category: 'experts',
      categoryLabelAr: 'غرف الحرفيين والموردين',
      icon: '🧵',
      topicAr: 'مالين الثوب: أقمشة الهوديات، الملتون 340g، الدنيم، جاباردين، وأسعار الكيلو الحالية بدرب عمر وطنجة'
    },
    {
      id: 'modelistes',
      name: '✂️-الموديليست-patronage',
      category: 'experts',
      categoryLabelAr: 'غرف الحرفيين والموردين',
      icon: '✂️',
      topicAr: 'الموديليست: فصالة وباترونات الهودي الأوفرسايز، برامج Lectra/Gerber، وتدرج المقاسات (Gradation)'
    },
    {
      id: 'fournitures',
      name: '📦-الفورنيتور-fournitures',
      category: 'experts',
      categoryLabelAr: 'غرف الحرفيين والموردين',
      icon: '📦',
      topicAr: 'مالين الفورنيتور: سحابات YKK الأصلية، أزرار، كوردونات قطنية، ليبلات قماشية، وأكياس التغليف'
    },
    {
      id: 'impression',
      name: '🎨-الطباعة-impression-dtf',
      category: 'experts',
      categoryLabelAr: 'غرف الحرفيين والموردين',
      icon: '🎨',
      topicAr: 'مالين الإمبريسيون: طباعة DTF HD، سيريغرافي بلاستيزول، طبعة Puff 3D، ومقاومة الغسيل'
    },
    {
      id: 'broderie',
      name: '🪡-الطرز-broderie',
      category: 'experts',
      categoryLabelAr: 'غرف الحرفيين والموردين',
      icon: '🪡',
      topicAr: 'مالين الطرز: تطريز 3D فوم بارز، ماكينات Tajima/Barudan، وتطريز البادجات والشعارات'
    },
    // Category 4: صفقات وشراكات
    {
      id: 'groupage',
      name: '🛒-شراء-مشترك-groupage',
      category: 'deals',
      categoryLabelAr: 'صفقات وشراكات الإنتاج',
      icon: '🛒',
      topicAr: 'الشراء المشترك: تجميع كميات أقمشة ومستلزمات للاستفادة من تخفيضات الجملة الكبرى (-25%)'
    },
    {
      id: 'production',
      name: '🤝-طلبات-وشراكات-الإنتاج',
      category: 'deals',
      categoryLabelAr: 'صفقات وشراكات الإنتاج',
      icon: '🤝',
      topicAr: 'طلبات التصنيع، ورشات الخياطة المتاحة، والتعاون المشترك بين البراندات'
    }
  ];

  const currentChannel = channels.find(c => c.id === activeChannelId) || channels[3];

  // ─────────────────────────────────────────────────────────────
  // INITIAL RICH SEED MESSAGES FOR ALL CHANNELS
  // ─────────────────────────────────────────────────────────────
  const initialMessages: ChatMessage[] = [
    // #tissu
    {
      id: 'msg-tissu-1',
      channelId: 'tissu',
      author: 'سفيان تيكستيل (Derb Omar)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authorRole: 'مورد أقمشة معتمد BEYA',
      authorRoleKey: 'tissu',
      city: 'الدار البيضاء • درب عمر زنقة فاس',
      timestamp: 'اليوم، 11:20',
      content: 'السلام عليكم الإخوان أصحاب البراندات والمصممين، دخلات اليوم دفعة جديدة من قماش الملتون الشتوي السميك (Molleton Gratté 340 GSM) قطن 100% ممشط فاخر، مخصص للهوديات الأوفرسايز وسراويل السويت بانتس.\n\n🎨 الألوان المتوفرة حالياً بالستوك: الأسود الفاحم، أبيض ناصع، بيج أوف وايت، أخضر زيتي، بني شوكولا، كحلي داكن.\n\n📦 الكميات متوفرة ابتداءً من رولو واحد (25 كلغ) مع تسليم في 24 ساعة لكازا و48 ساعة لجميع مدن المغرب.',
      reactions: { '🔥': 28, '🧵': 34, '👏': 12 },
      userReactions: [],
      whatsappContact: '212675239885',
      whatsappMessage: 'السلام عليكم سي سفيان، شفت رسالتك فـ BEYA NETWORK وبغيت نسولك على ثوب الملتون 340g والألوان المتوفرة.',
      replies: [
        {
          id: 'rep-1',
          author: 'أمين البراندي (Street Lab)',
          authorRole: 'صاحب علامة أزياء',
          authorRoleKey: 'brand',
          city: 'الدار البيضاء',
          content: 'تبارك الله عليك سي سفيان، واش الثوب معالج Anti-Pilling ضد التحبب مع التصبين؟',
          timestamp: 'اليوم، 11:45'
        },
        {
          id: 'rep-2',
          author: 'سفيان تيكستيل (Derb Omar)',
          authorRole: 'مورد أقمشة معتمد BEYA',
          authorRoleKey: 'tissu',
          city: 'الدار البيضاء',
          content: 'أهلاً خويا أمين، مضمون 100% ومعالج، وعندنا إمكانية نعطيوك قسيمة عينة (Coupon Test) تجربها فالغسيل والمصلوح قبل ما تاخذ الرولو.',
          timestamp: 'اليوم، 12:05'
        }
      ]
    },
    {
      id: 'msg-tissu-2',
      channelId: 'tissu',
      author: 'أقمشة المسيرة الشمالية (Tissus Nord Tanger)',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      authorRole: 'مورد أقمشة معتمد BEYA',
      authorRoleKey: 'tissu',
      city: 'طنجة • المنطقة الحرة كزناية',
      timestamp: 'اليوم، 13:10',
      content: 'تنبيه للإخوان لي كيخدمو سراويل الكارجو والسترات التقنية (Worker Jackets / Cargo Pants): وصلات كمية ممتازة من قماش الجاباردين ستريتش 280g (Gabardine Coton Stretch) والكانفاس 320g.\nالميزة: متانة فائقة ضد التمزق ومرونة مريحة فالحركة. الأسعار خاصة بزبناء ورشة BEYA ابتداءً من 34 درهم للمتر.',
      reactions: { '🔥': 19, '🧵': 22, '💡': 8 },
      userReactions: [],
      whatsappContact: '212675239885',
      whatsappMessage: 'السلام عليكم، تواصلت معكم من BEYA NETWORK بخصوص أقمشة الكاباردين والكانفاس بطنجة.'
    },

    // #modelistes
    {
      id: 'msg-mod-1',
      channelId: 'modelistes',
      author: 'فاطمة الزهراء العمراني',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      authorRole: 'موديلست أولى معتمدة BEYA',
      authorRoleKey: 'modeliste',
      city: 'الدار البيضاء / طنجة',
      timestamp: 'أمس، 16:40',
      content: '📐 نصيحة تقنية مهمة لأصحاب البراندات لي كيبغيو يفصلو هودي أوفرسايز (Drop Shoulder Oversize):\n\n1. نزول الكتف (Emmanchure Basse): ضروري تهبط بـ 4 حتى 6 سم على خط الكتف الطبيعي باش ما يعطيش انتفاخ تحت الإبط.\n2. اتساع القب (Capuche): ديرو فيه ارتفاع 38 سم مع دوبلور (Doublure) من نفس الثوب باش يبقى واقف وأنيق وما يطيحش رخو.\n3. فتحة الجيب الكنغر (Poche Kangourou): حسابتها مضبوطة بـ 24 سم طول و18 سم عرض باش تكون عملية وجمالية فـ نفس الوقت.\n\nالملفات متوفرة بصيغ Lectra Modaris و DXF/PDF قابلة للطباعة مباشرة على البلوتر.',
      reactions: { '💡': 46, '✂️': 38, '👏': 25 },
      userReactions: [],
      whatsappContact: '212663049182',
      whatsappMessage: 'السلام عليكم أستاذة فاطمة الزهراء، تواصلت معك من خلال BEYA NETWORK بخصوص إعداد باترون لهودي جديد.'
    },
    {
      id: 'msg-mod-2',
      channelId: 'modelistes',
      author: 'ياسين الصنهاجي',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      authorRole: 'موديلست وباترونيست متخصص دنيم',
      authorRoleKey: 'modeliste',
      city: 'طنجة / الدار البيضاء',
      timestamp: 'اليوم، 10:15',
      content: 'صباح الخير الإخوان، بالنسبة للبنات والشباب لي باغين يطلقو سراويل واسعة (Wide Leg / Carpenter Pants) من ثوب الدنيم أو الكانفاس:\nتأكدوا من حساب نسبة انكماش الثوب (Taux de rétrécissement) بعد الغسيل الصناعي (Délavage). الدنيم الخام 100% قطن كينقص ما بين 3% و 5% فـ الطول بعد أول تصبينة، فـ كنزيدوها فـ الباترون قبل الفصالة باش المقاس يجي مطابق بالضبط للجدول القياسي.',
      reactions: { '💡': 31, '✂️': 20, '🔥': 14 },
      userReactions: [],
      whatsappContact: '212664556677',
      whatsappMessage: 'السلام عليكم أستاذ ياسين، تواصلت معك من خلال BEYA NETWORK بخصوص باترون سروال كارجو/جينز.'
    },

    // #fournitures
    {
      id: 'msg-fourn-1',
      channelId: 'fournitures',
      author: 'مؤسسة الأناقة للوازم الخياطة والتغليف',
      authorAvatar: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
      authorRole: 'مورد مستلزمات وفورنيتور معتمد',
      authorRoleKey: 'fournitures',
      city: 'الدار البيضاء • كراج علال قيسارية النصر',
      timestamp: 'اليوم، 09:30',
      content: '📦 متوفر الآن لجميع أصحاب البراندات: تشكيلة مستلزمات الفينيسيون الفاخر للهوديات والملابس:\n\n🔹 سحابات معدنية YKK أصلية نمرة 5 و 8 (نحاسي، فضي، وأسود مطفي).\n🔹 حبال هودي قطنية سميكة 12mm مع أطراف حديدية فاخرة (Embout Métal gravé).\n🔹 أكياس التغليف الفاخرة المات بزبلايد (Polybags Ziplock Mat) مع إمكانية طبع لوغو البراند ابتداءً من 300 كيس فقط!\n🔹 بطاقات الهانج تاج (Hangtags) كرتون سميك 600g مع حبل شمعي.',
      reactions: { '🔥': 33, '📦': 29, '👏': 15 },
      userReactions: [],
      whatsappContact: '212675239885',
      whatsappMessage: 'السلام عليكم، تواصلت معكم من BEYA NETWORK بخصوص سحابات YKK وأكياس البولي باغ.'
    },

    // #impression
    {
      id: 'msg-imp-1',
      channelId: 'impression',
      author: 'المركز الرقمي للطباعة والـ DTF (Digital Print Pro)',
      authorAvatar: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=150&auto=format&fit=crop&q=80',
      authorRole: 'مطبعة صناعية معتمدة DTF & Sérigraphie',
      authorRoleKey: 'impression',
      city: 'الدار البيضاء • عين السبع الصناعية',
      timestamp: 'أمس، 18:25',
      content: '💡 نصيحة تقنية مهمة: كيفاش تخلي طبعة الـ DTF على الهودي تصبر لأكثر من 50 غسلة بلا ما تتقشر ولا تتشقق؟\n\n1. حرارة البريسة: 160°C بضغط متوسط-قوي لمدة 15 ثانية.\n2. التبريد التام (Cold Peel): ما تحيدش البلاستيك حتى يبرد الثوب 100%.\n3. الكبسة الثانية الضرورية: حط ورق زبدة (Papier sulfurisé) واضغط 6 ثواني إضافية باش الحبر يتغلغل وسط مسام القطن ويعطي ملمس ناعم كالسيريغرافي.\n\nنوفر طباعة رولات DTF HD يومياً مع تسليم فوري في 24 ساعة.',
      reactions: { '🔥': 52, '🎨': 44, '💡': 39 },
      userReactions: [],
      whatsappContact: '212675239885',
      whatsappMessage: 'السلام عليكم، تواصلت معكم من BEYA NETWORK بخصوص خدمات طباعة الـ DTF والسيريغرافي.'
    },

    // #broderie
    {
      id: 'msg-brod-1',
      channelId: 'broderie',
      author: 'ورشة الفجر للتطريز الصناعي (Tajima 12 Têtes)',
      authorAvatar: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
      authorRole: 'ورشة تطريز صناعي معتمدة',
      authorRoleKey: 'broderie',
      city: 'فاس / الدار البيضاء',
      timestamp: 'أمس، 14:15',
      content: '🪡 الإخوان المهتمين بالتطريز البارز ثلاثي الأبعاد (Broderie 3D avec Mousse EVA):\n\nللحصول على تطريز بارز نقي على الهودي والقبوع:\n- كنستعملو فوم خاص بكثافة 3mm وخيوط بوليستر ألمانية Madeira مقاومة للشد السريع.\n- كثافة الغرز (Densité de points) كتكون مضاعفة بـ 1.8x مقارنة مع الطرز المسطح العادي لتغطية جوانب الفوم بالكامل.\n\nالبرامج (Piquage Broderie DST) كنصاوبوها فـ 24 ساعة ومجاناً للطلبيات فوق 50 قطعة.',
      reactions: { '🪡': 41, '🔥': 26, '👏': 19 },
      userReactions: [],
      whatsappContact: '212675239885',
      whatsappMessage: 'السلام عليكم، تواصلت معكم من BEYA NETWORK بخصوص التطريز البارز 3D.'
    },

    // #general
    {
      id: 'msg-gen-1',
      channelId: 'general',
      author: 'كريم البورقادي (Atelier Casablanca)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      authorRole: 'صاحب علامة ملابس ستريتوير',
      authorRoleKey: 'brand',
      city: 'الدار البيضاء',
      timestamp: 'اليوم، 14:02',
      content: 'السلام عليكم الخوت، شنو رأيكم فهاد التوجه الجديد ديال الأوفرسايز الخفيف (Boxy Cropped Hoodie) مقارنة مع الأوفرسايز الطويل؟ واش الزبناء المغاربة ولاو كيفضلو الطول المحايد (Longueur Ceinture) لي كيبين السروال ولا باقي الهودي الطويل شاد السوق؟',
      reactions: { '💡': 18, '🔥': 14, '👏': 7 },
      userReactions: [],
      replies: [
        {
          id: 'rep-g1',
          author: 'فاطمة الزهراء العمراني',
          authorRole: 'موديلست أولى معتمدة BEYA',
          authorRoleKey: 'modeliste',
          city: 'الدار البيضاء',
          content: 'أهلاً سي كريم، الـ Boxy Fit المائل للقصير (Cropped Boxy) هو التوجه الأقوى حالياً فـ 2026 فـ الماركات العالمية، كيعطي فخامة وsilhouette مضبوطة خصوصاً مع السراويل الواسعة (Wide Pants).',
          timestamp: 'اليوم، 14:18'
        }
      ]
    },

    // #annonces
    {
      id: 'msg-ann-1',
      channelId: 'annonces',
      author: 'إدارة ورشة BEYA Creative',
      authorAvatar: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150&auto=format&fit=crop&q=80',
      authorRole: 'إدارة الشبكة والورشة المركزية',
      authorRoleKey: 'admin',
      city: 'مكناس • الإدارة الوطنية',
      timestamp: 'اليوم، 09:00',
      content: '📢 إعلان رسمي من ورشة BEYA:\nتم فتح باب طلب العينات الفورية (Échantillons Express 48h) لجميع أعضاء شبكة BEYA NETWORK لمجموعات الشتاء والربيع.\nكما تم إطلاق خدمة التنسيق المباشر مع موديليست الورشة المعتمدين لتدريج المقاسات وإعداد ملفات الفصالة التقنية مجاناً للطلبيات المؤكدة.',
      reactions: { '🎉': 48, '🔥': 65, '👑': 39 },
      userReactions: []
    }
  ];

  // Persisted chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('beya_discord_channel_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialMessages;
  });

  // Save messages on update
  useEffect(() => {
    try {
      localStorage.setItem('beya_discord_channel_messages_v2', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom when channel changes or new message sent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannelId, messages.length]);

  // Handle Send Message in active channel
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      channelId: activeChannelId,
      author: userProfile.brandName || 'براند شريكة',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      authorRole: 'صاحب براند / عضو شبكة BEYA VIP',
      authorRoleKey: 'brand',
      city: userProfile.city || 'المغرب',
      timestamp: 'الآن',
      content: messageText.trim(),
      reactions: { '🔥': 1 },
      userReactions: ['🔥'],
      whatsappContact: userProfile.phone ? userProfile.phone.replace(/\D/g, '') : undefined
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageText('');
  };

  // Handle Add Reaction
  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const already = m.userReactions?.includes(emoji);
      const curCount = m.reactions[emoji] || 0;
      return {
        ...m,
        userReactions: already 
          ? m.userReactions.filter(e => e !== emoji)
          : [...(m.userReactions || []), emoji],
        reactions: {
          ...m.reactions,
          [emoji]: already ? Math.max(0, curCount - 1) : curCount + 1
        }
      };
    }));
  };

  // Handle Add Thread Reply
  const handleAddThreadReply = (msgId: string) => {
    if (!threadReplyDraft.trim()) return;
    const rep = {
      id: `rep-${Date.now()}`,
      author: userProfile.brandName || 'أنا',
      authorRole: 'عضو شبكة BEYA VIP',
      authorRoleKey: 'brand' as const,
      city: userProfile.city || 'الدار البيضاء',
      content: threadReplyDraft.trim(),
      timestamp: 'الآن'
    };
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      return {
        ...m,
        replies: [...(m.replies || []), rep]
      };
    }));
    setThreadReplyDraft('');
  };

  // Filter messages for current channel
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  // ─────────────────────────────────────────────────────────────
  // ECOSYSTEM DIRECTORY: 5 PILLARS (MODÉLISTES, TISSUS, FOURNITURES, IMPRESSION, BRODERIE)
  // ─────────────────────────────────────────────────────────────
  const allProMembers = [
    // 1. Modélistes
    ...MODELISTES_DATA.map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      cover: m.cover,
      pillar: 'modeliste' as const,
      pillarLabelAr: 'موديليست وباتورناج',
      roleBadge: '✂️ موديليست معتمد',
      roleColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      specialty: m.specialty,
      city: m.city,
      whatsapp: m.phone ? m.phone.replace(/\D/g, '') : '212675239885',
      phone: m.phone || '0675239885',
      experience: m.experienceYears + ' سنوات خبرة',
      rating: m.rating,
      reviewsCount: m.reviewsCount,
      bio: m.bio,
      cadSoftware: m.cadSoftware,
      verified: true
    })),
    // 2. Suppliers (Tissu, Fournitures, Impression, Broderie)
    ...SUPPLIERS_DATA.map(s => {
      const pillar = s.category === 'tissu' ? 'tissu' :
                     s.category === 'accessoires' ? 'fournitures' :
                     s.category === 'impression' ? 'impression' :
                     s.category === 'broderie' ? 'broderie' : 'tissu';
      const pillarLabelAr = pillar === 'tissu' ? 'مورد أقمشة' :
                            pillar === 'fournitures' ? 'مورد مستلزمات وفورنيتور' :
                            pillar === 'impression' ? 'ورشة طباعة وسيريغرافي' : 'ورشة تطريز صناعي';
      const roleBadge = pillar === 'tissu' ? '🧵 مورد ثوب' :
                        pillar === 'fournitures' ? '📦 فورنيتور' :
                        pillar === 'impression' ? '🎨 إمبريسيون' : '🪡 برودري';
      const roleColor = pillar === 'tissu' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        pillar === 'fournitures' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        pillar === 'impression' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30';
      return {
        id: s.id,
        name: s.name,
        avatar: s.logo,
        cover: s.cover,
        pillar: pillar as 'tissu' | 'fournitures' | 'impression' | 'broderie',
        pillarLabelAr,
        roleBadge,
        roleColor,
        specialty: s.categoryLabel,
        city: s.city,
        whatsapp: s.whatsapp ? s.whatsapp.replace(/\D/g, '') : '212675239885',
        phone: s.phone || '0675239885',
        experience: 'مورد معتمد BEYA',
        rating: s.rating,
        reviewsCount: s.reviewsCount,
        bio: s.desc,
        catalog: s.catalog,
        minQty: s.minQty,
        verified: true
      };
    })
  ];

  // Filtered Pro Members for Directory View
  const filteredProMembers = allProMembers.filter(m => {
    if (directoryFilter !== 'all' && m.pillar !== directoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return m.name.toLowerCase().includes(q) ||
             m.city.toLowerCase().includes(q) ||
             m.specialty.toLowerCase().includes(q) ||
             m.bio.toLowerCase().includes(q);
    }
    return true;
  });

  // ─────────────────────────────────────────────────────────────
  // GROUPAGE DEALS DATA
  // ─────────────────────────────────────────────────────────────
  const groupageDeals: GroupageDeal[] = [
    {
      id: 'grp-1',
      title: 'دفعة أقمشة الملتون الشتوي 340g (Molleton Gratté 100% Coton)',
      material: 'مولطون شتوي قطن 100% سميك ومبطن',
      supplier: 'مجمع أقمشة الشرق (Derb Omar)',
      supplierCity: 'الدار البيضاء',
      targetKg: 500,
      currentKg: 380,
      participantsCount: 8,
      daysLeft: 4,
      discountPrice: 44,
      regularPrice: 52,
      minCommitment: 25,
      status: 'active',
      whatsappText: 'السلام عليكم BEYA NETWORK، أرغب في حجز كمية من عرض الشراء المشترك لثوب الملتون 340g.'
    },
    {
      id: 'grp-2',
      title: 'صفقة قماش كانفاس قطني سميك 320g للسترات وسراويل الكارجو',
      material: 'كانفاس كوتون صلب وفاخر 320 GSM',
      supplier: 'أقمشة المسيرة الشمالية (Tissus Nord Tanger)',
      supplierCity: 'طنجة',
      targetKg: 400,
      currentKg: 310,
      participantsCount: 6,
      daysLeft: 6,
      discountPrice: 32,
      regularPrice: 40,
      minCommitment: 30,
      status: 'active',
      whatsappText: 'السلام عليكم BEYA NETWORK، أرغب في حجز كمية من عرض الشراء المشترك لقماش الكانفاس بطنجة.'
    },
    {
      id: 'grp-3',
      title: 'دفعة سحابات معدنية YKK أصلية نمرة 5 مع أكياس بولي باغ مطبوعة',
      material: 'سحابات YKK + أكياس Polybags Ziplock Mat',
      supplier: 'مؤسسة الأناقة للوازم الخياطة والتغليف',
      supplierCity: 'الدار البيضاء',
      targetKg: 1000,
      currentKg: 850,
      participantsCount: 11,
      daysLeft: 3,
      discountPrice: 1.10,
      regularPrice: 1.80,
      minCommitment: 100,
      status: 'closing_soon',
      whatsappText: 'السلام عليكم BEYA NETWORK، أريد الانضمام لصفقة لوازم وسحابات YKK.'
    }
  ];

  // ─────────────────────────────────────────────────────────────
  // ACCESS GUARD: PRESERVED VIP ACCESS FOR SPECIFIED ACCOUNT
  // ─────────────────────────────────────────────────────────────
  if (!isPilotAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none" dir="rtl">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20">
          <Globe className="w-10 h-10 text-white animate-pulse" />
        </div>
        <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
          مجتمع BEYA DISCORD NETWORK 🌐
        </span>
        <h1 className="text-2xl sm:text-3xl font-black mb-3">
          سيرفر النسيج وصناع الموضة بالمغرب
        </h1>
        <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
          فضاء ديسكورد التفاعلي المخصص لربط أصحاب البراندات مع نخبة الموديليست، وموردي الأقمشة، وورشات الطباعة والتطريز، وموردي المستلزمات.
        </p>
        <button
          onClick={() => navigate('/portal')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى لوحة تحكم الطلبيات (BEYAPORTAL)</span>
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN DISCORD INTERFACE RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1e1f22] text-[#dbdee1] flex flex-col font-sans select-none antialiased overflow-hidden h-screen" dir="rtl">

      {/* TOP DISCORD BAR */}
      <header className="h-13 bg-[#1e1f22] border-b border-[#111214] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Hamburger */}
          <button
            onClick={() => setMobileDrawer(prev => prev === 'channels' ? 'none' : 'channels')}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-[#2b2d31] rounded-xl cursor-pointer"
            title="فتح القنوات"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Server Icon & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 shrink-0">
              <span className="text-sm font-black">B</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-sm tracking-wide">BEYA NETWORK</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase border border-indigo-500/30">
                  DISCORD
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="متصل الآن" />
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                سيرفر صناع الموضة، الموديليست، والموردين بالمغرب
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Discord Style) */}
        <div className="flex items-center gap-1.5 bg-[#2b2d31] p-1 rounded-xl border border-[#383a40]">
          <button
            onClick={() => { setActiveView('chat'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>المحادثات</span>
          </button>

          <button
            onClick={() => { setActiveView('directory'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'directory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>دليل المهنيين</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-mono">14</span>
          </button>

          <button
            onClick={() => { setActiveView('groupage'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'groupage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>الشراء المشترك</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono">-25%</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Members Sidebar Toggle (Mobile & Desktop) */}
          <button
            onClick={() => setMobileDrawer(prev => prev === 'members' ? 'none' : 'members')}
            className="p-2 text-slate-300 hover:text-white bg-[#2b2d31] hover:bg-[#35373c] rounded-xl transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="قائمة المهنيين والأعضاء"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline text-[11px]">الأعضاء ({allProMembers.length})</span>
          </button>

          {/* Return to BEYAPORTAL Button */}
          <button
            onClick={() => navigate('/portal')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
            title="الرجوع إلى لوحة BEYAPORTAL"
          >
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">BEYAPORTAL</span>
          </button>
        </div>
      </header>

      {/* DISCORD WORKSPACE BODY: 3 COLUMNS */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ─────────────────────────────────────────────────────────────
            COLUMN 1: DISCORD CHANNELS SIDEBAR
        ───────────────────────────────────────────────────────────── */}
        <aside
          className={`w-64 bg-[#2b2d31] border-l border-[#202225] flex flex-col shrink-0 z-20 transition-all duration-200 absolute md:static inset-y-0 right-0 ${
            mobileDrawer === 'channels' ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'
          }`}
        >
          {/* Server Sub-Header */}
          <div className="h-12 px-4 border-b border-[#202225] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="font-black text-white text-xs">قنوات النقاش والورشات</span>
            </div>
            <button
              onClick={() => setMobileDrawer('none')}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Channels Scroll Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-hide text-xs">

            {/* Category: Annonces */}
            <div>
              <div className="px-2 mb-1.5 text-[10px] font-black text-[#949ba4] uppercase tracking-wider flex items-center justify-between">
                <span>📢 الإعلانات الرسمية</span>
              </div>
              <div className="space-y-0.5">
                {channels.filter(c => c.category === 'annonces').map(c => {
                  const isActive = activeChannelId === c.id && activeView === 'chat';
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChannelId(c.id);
                        setActiveView('chat');
                        setMobileDrawer('none');
                      }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-[#35373c] text-white shadow-xs'
                          : 'text-[#949ba4] hover:bg-[#35373c]/60 hover:text-[#dbdee1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{c.icon}</span>
                        <span className="truncate">{c.name.replace(/^[^-]+-/, '')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: General Salons */}
            <div>
              <div className="px-2 mb-1.5 text-[10px] font-black text-[#949ba4] uppercase tracking-wider flex items-center justify-between">
                <span>💬 صالونات النقاش العام</span>
              </div>
              <div className="space-y-0.5">
                {channels.filter(c => c.category === 'general').map(c => {
                  const isActive = activeChannelId === c.id && activeView === 'chat';
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChannelId(c.id);
                        setActiveView('chat');
                        setMobileDrawer('none');
                      }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-[#35373c] text-white shadow-xs'
                          : 'text-[#949ba4] hover:bg-[#35373c]/60 hover:text-[#dbdee1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{c.icon}</span>
                        <span className="truncate">{c.name.replace(/^[^-]+-/, '')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: Experts & Sourcing (الأركان الـ 5) */}
            <div>
              <div className="px-2 mb-1.5 text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>🛠️ غرف الحرفيين والموردين</span>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 rounded">VIP</span>
              </div>
              <div className="space-y-0.5">
                {channels.filter(c => c.category === 'experts').map(c => {
                  const isActive = activeChannelId === c.id && activeView === 'chat';
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChannelId(c.id);
                        setActiveView('chat');
                        setMobileDrawer('none');
                      }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-xs'
                          : 'text-[#949ba4] hover:bg-[#35373c]/60 hover:text-[#dbdee1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{c.icon}</span>
                        <span className="truncate">{c.name.replace(/^[^-]+-/, '')}</span>
                      </div>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 text-indigo-400 font-mono">#</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category: Deals & Partnerships */}
            <div>
              <div className="px-2 mb-1.5 text-[10px] font-black text-[#949ba4] uppercase tracking-wider flex items-center justify-between">
                <span>🤝 صفقات وشراكات</span>
              </div>
              <div className="space-y-0.5">
                {channels.filter(c => c.category === 'deals').map(c => {
                  const isActive = activeChannelId === c.id && activeView === 'chat';
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChannelId(c.id);
                        setActiveView('chat');
                        setMobileDrawer('none');
                      }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-[#35373c] text-white shadow-xs'
                          : 'text-[#949ba4] hover:bg-[#35373c]/60 hover:text-[#dbdee1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{c.icon}</span>
                        <span className="truncate">{c.name.replace(/^[^-]+-/, '')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Current User Discord Bottom Dock */}
          <div className="h-14 bg-[#232428] px-3 border-t border-[#1e1f22] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 truncate">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {userProfile.brandName.charAt(0)}
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-[#232428]" />
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-white truncate leading-tight">{userProfile.brandName}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{userProfile.city.split('•')[0]}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('profile')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="تعديل ملفي التعريفي"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────────
            COLUMN 2: MAIN DISCORD CONTENT AREA
        ───────────────────────────────────────────────────────────── */}
        <main className="flex-1 bg-[#313338] flex flex-col overflow-hidden min-w-0">

          {/* VIEW A: DISCORD CHAT STREAM */}
          {activeView === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">

              {/* Channel Header */}
              <div className="h-12 bg-[#313338] border-b border-[#202225] px-4 flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-lg text-slate-400 font-bold shrink-0">#</span>
                  <h2 className="text-sm font-black text-white truncate">
                    {currentChannel.name}
                  </h2>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <p className="text-xs text-[#949ba4] truncate hidden md:block">
                    {currentChannel.topicAr}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative hidden sm:block">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="بحث في الغرفة..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-44 bg-[#1e1f22] text-xs text-white placeholder-slate-500 pr-8 pl-3 py-1.5 rounded-lg border border-transparent focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Discord Messages Stream (Continuous & Responsive) */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                {/* Channel Welcome Banner */}
                <div className="p-4 rounded-2xl bg-[#2b2d31]/80 border border-[#383a40] mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xl font-bold mb-2">
                    {currentChannel.icon}
                  </div>
                  <h3 className="text-base font-black text-white">
                    مرحباً بك في #{currentChannel.name}!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    هذه بداية قناة {currentChannel.name}. هنا يمكنك طرح أسئلتك، مشاركة تجاربك، أو التواصل المباشر مع الحرفيين والموردين المتخصصين.
                  </p>
                </div>

                {/* Message List */}
                {channelMessages
                  .filter(m => !searchQuery.trim() || m.content.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(msg => {
                    const isThreadOpen = expandedThreadMessageId === msg.id;
                    return (
                      <div
                        key={msg.id}
                        className="group p-3 rounded-2xl hover:bg-[#2e3035] transition-colors duration-150 flex items-start gap-3.5"
                      >
                        {/* Author Avatar with Click to Profile */}
                        <button
                          onClick={() => {
                            // Find matching pro member or build profile
                            const match = allProMembers.find(p => p.name === msg.author) || {
                              id: msg.id,
                              name: msg.author,
                              avatar: msg.authorAvatar,
                              roleBadge: msg.authorRole,
                              city: msg.city,
                              bio: msg.content.slice(0, 150),
                              phone: msg.whatsappContact || '0675239885',
                              whatsapp: msg.whatsappContact || '212675239885',
                              rating: 4.9,
                              reviewsCount: 12
                            };
                            setSelectedMemberProfile(match);
                          }}
                          className="relative shrink-0 cursor-pointer"
                        >
                          <img
                            src={msg.authorAvatar}
                            alt={msg.author}
                            className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                          />
                        </button>

                        {/* Message Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <button
                              onClick={() => {
                                const match = allProMembers.find(p => p.name === msg.author);
                                if (match) setSelectedMemberProfile(match);
                              }}
                              className="font-black text-white text-xs hover:underline cursor-pointer"
                            >
                              {msg.author}
                            </button>

                            {/* Role Pill Badge */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                              msg.authorRoleKey === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                              msg.authorRoleKey === 'modeliste' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                              msg.authorRoleKey === 'tissu' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                              msg.authorRoleKey === 'fournitures' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                              msg.authorRoleKey === 'impression' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                              msg.authorRoleKey === 'broderie' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                              'bg-slate-700/50 text-slate-300 border-slate-600'
                            }`}>
                              {msg.authorRole}
                            </span>

                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {msg.city}
                            </span>

                            <span className="text-[10px] text-slate-500 mr-auto font-mono">
                              {msg.timestamp}
                            </span>
                          </div>

                          {/* Text Content */}
                          <div className="text-xs text-[#dbdee1] leading-relaxed whitespace-pre-line font-medium">
                            {msg.content}
                          </div>

                          {/* Direct WhatsApp CTA Button if available */}
                          {msg.whatsappContact && (
                            <div className="mt-2.5">
                              <a
                                href={`https://wa.me/${msg.whatsappContact}?text=${encodeURIComponent(
                                  msg.whatsappMessage || `السلام عليكم ${msg.author}، تواصلت معك من خلال سيرفر BEYA NETWORK بخصوص منشورك في #${currentChannel.name}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>تواصل عبر واتساب مع {msg.author.split('(')[0]}</span>
                              </a>
                            </div>
                          )}

                          {/* Discord Reactions & Reply Bar */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Reaction Pills */}
                            {Object.entries(msg.reactions).map(([emoji, count]) => {
                              const active = msg.userReactions?.includes(emoji);
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleToggleReaction(msg.id, emoji)}
                                  className={`px-2 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition cursor-pointer ${
                                    active
                                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                                      : 'bg-[#2b2d31] border-[#383a40] text-slate-300 hover:bg-[#35373c]'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[10px] font-mono">{count}</span>
                                </button>
                              );
                            })}

                            {/* Add Emoji Reaction Triggers */}
                            {['🔥', '🧵', '💡', '✂️', '👏'].filter(e => !msg.reactions[e]).slice(0, 3).map(e => (
                              <button
                                key={e}
                                onClick={() => handleToggleReaction(msg.id, e)}
                                className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                                title={`تفاعل بـ ${e}`}
                              >
                                {e}
                              </button>
                            ))}

                            {/* Thread Replies Button */}
                            <button
                              onClick={() => setExpandedThreadMessageId(isThreadOpen ? null : msg.id)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mr-auto cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>
                                {msg.replies && msg.replies.length > 0
                                  ? `${msg.replies.length} ردود • عرض النقاش`
                                  : 'رد في النقاش'}
                              </span>
                            </button>
                          </div>

                          {/* Thread Replies Tree (Expandable) */}
                          {isThreadOpen && (
                            <div className="mt-3 p-3 bg-[#232428] rounded-xl border border-[#383a40] space-y-2.5">
                              <h4 className="text-[11px] font-black text-slate-300 flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3 text-indigo-400" />
                                <span>الردود على {msg.author}:</span>
                              </h4>

                              {msg.replies && msg.replies.length > 0 ? (
                                <div className="space-y-2">
                                  {msg.replies.map(rep => (
                                    <div key={rep.id} className="text-xs bg-[#2b2d31] p-2 rounded-lg border border-white/5">
                                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                                        <span className="font-bold text-white">{rep.author}</span>
                                        <span className="text-slate-500 font-mono">{rep.timestamp}</span>
                                      </div>
                                      <p className="text-slate-300 font-medium">{rep.content}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-500 italic">لا توجد ردود بعد. كن أول من يشارك!</p>
                              )}

                              {/* Thread Reply Input */}
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="أضف ردك على هذا النقاش..."
                                  value={threadReplyDraft}
                                  onChange={e => setThreadReplyDraft(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleAddThreadReply(msg.id)}
                                  className="flex-1 bg-[#1e1f22] text-xs text-white px-3 py-1.5 rounded-lg border border-[#383a40] focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleAddThreadReply(msg.id)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  رد
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}

                <div ref={messagesEndRef} />
              </div>

              {/* Sticky Discord Message Input Bar */}
              <div className="p-3 sm:p-4 bg-[#313338] border-t border-[#202225] shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="bg-[#383a40] rounded-2xl p-2 flex items-center gap-2 shadow-inner border border-transparent focus-within:border-indigo-500/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setMessageText(prev => prev + ' 🧵 ')}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
                    title="إضافة وسم قماش"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder={`إرسال رسالة في #${currentChannel.name}...`}
                    className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none font-medium px-1"
                  />

                  {/* Quick Emoji Buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    {['🧵', '✂️', '💡', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setMessageText(prev => prev + ' ' + emoji)}
                        className="p-1 text-slate-400 hover:text-white text-xs hover:scale-110 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition shadow-xs cursor-pointer shrink-0"
                    title="إرسال"
                  >
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* VIEW B: FULL PRO DIRECTORY (THE 5 PILLARS) */}
          {activeView === 'directory' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* Directory Hero Header */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white">
                <div className="max-w-2xl">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/30 inline-block mb-2">
                    شبكة المحترفين المعتمدين بالمغرب 🇲🇦
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mb-2">
                    دليل الموديليست، الأقمشة، المستلزمات، الطباعة والتطريز
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    تواصل مباشرة مع النخبة المعتمدة من ورشة BEYA بأسعار تفضيلية وضمان جودة الفينيسيون.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mt-4">
                  {[
                    { id: 'all', label: 'الكل (14)', icon: '🌐' },
                    { id: 'modeliste', label: '✂️ موديليست (5)', icon: '✂️' },
                    { id: 'tissu', label: '🧵 مالين الثوب (3)', icon: '🧵' },
                    { id: 'fournitures', label: '📦 مالين الفورنيتور (2)', icon: '📦' },
                    { id: 'impression', label: '🎨 مالين الإمبريسيون (2)', icon: '🎨' },
                    { id: 'broderie', label: '🪡 مالين الطرز (2)', icon: '🪡' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setDirectoryFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        directoryFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ابحث عن اسم، تخصص، قماش، أو مدينة (مثال: باترون، ملتون، تطريز 3D، كازا، طنجة)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2b2d31] text-xs sm:text-sm text-white placeholder-slate-400 pr-10 pl-4 py-3 rounded-2xl border border-[#383a40] focus:border-indigo-500 focus:outline-none shadow-sm"
                />
              </div>

              {/* Pro Cards Grid (Discord Cards Style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProMembers.map(pro => (
                  <div
                    key={pro.id}
                    className="bg-[#2b2d31] hover:bg-[#35373c] rounded-2xl border border-[#383a40] hover:border-indigo-500/40 p-4 transition-all duration-150 flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Top Row: Avatar + Role + Rating */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={pro.avatar}
                            alt={pro.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-xs"
                          />
                          <div>
                            <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">
                              {pro.name}
                            </h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border inline-block mt-0.5 ${pro.roleColor}`}>
                              {pro.roleBadge}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold border border-amber-500/20 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{pro.rating}</span>
                        </div>
                      </div>

                      {/* City & Specialty */}
                      <p className="text-xs text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{pro.city}</span>
                      </p>

                      <p className="text-xs text-[#949ba4] line-clamp-2 leading-relaxed mb-3">
                        {pro.bio}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#383a40] flex items-center gap-2">
                      <a
                        href={`https://wa.me/${pro.whatsapp}?text=${encodeURIComponent(
                          `السلام عليكم ${pro.name}، تواصلت معكم عبر دليل BEYA NETWORK بخصوص طلب خدماتكم.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب مباشر</span>
                      </a>

                      <button
                        onClick={() => setSelectedMemberProfile(pro)}
                        className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center justify-center cursor-pointer"
                        title="عرض الملف الكامل والكتالوج"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* VIEW C: GROUPAGE DEALS (الشراء المشترك) */}
          {activeView === 'groupage' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* Groupage Header */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/20 text-white">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30 inline-block mb-2">
                  عروض الشراء المشترك الجماعي 🛒
                </span>
                <h2 className="text-xl sm:text-2xl font-black mb-2">
                  اجمع كميتك مع براندات أخرى واستفد من سعر الجملة الكبرى
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-2xl">
                  تنسق ورشة BEYA طلبات الشراء الجماعي مع مستودعات الأقمشة والمصانع مباشرة لتخفيض السعر حتى 25% مع ضمان جودة السلعة.
                </p>
              </div>

              {/* Deals List */}
              <div className="space-y-4">
                {groupageDeals.map(deal => {
                  const progressPct = Math.min(100, Math.round((deal.currentKg / deal.targetKg) * 100));
                  return (
                    <div
                      key={deal.id}
                      className="bg-[#2b2d31] rounded-3xl border border-[#383a40] p-5 sm:p-6 text-white space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                              متبقي {deal.daysLeft} أيام
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                              {deal.supplier} • {deal.supplierCity}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-white">
                            {deal.title}
                          </h3>
                        </div>

                        {/* Price Badge */}
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-amber-400">{deal.discountPrice} MAD</span>
                            <span className="text-xs text-slate-500 line-through font-bold">{deal.regularPrice} MAD</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold">توفير 15% إلى 25%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-300">
                            تم جمع: <strong className="text-white">{deal.currentKg} كلغ/قطعة</strong> من الهدف ({deal.targetKg})
                          </span>
                          <span className="text-indigo-400 font-mono font-black">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#1e1f22] rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA Join Deal */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#383a40]">
                        <span className="text-xs text-slate-400 font-medium">
                          الحد الأدنى للمشاركة: <strong>{deal.minCommitment} كلغ/قطعة</strong> • {deal.participantsCount} براندات انضمت
                        </span>
                        <a
                          href={`https://wa.me/212675239885?text=${encodeURIComponent(deal.whatsappText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>احجز كميتك في هذا العرض</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* VIEW D: MY PROFILE & SETTINGS */}
          {activeView === 'profile' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-xl mx-auto w-full space-y-6">
              <div className="p-6 rounded-3xl bg-[#2b2d31] border border-[#383a40] text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                    {userProfile.brandName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{userProfile.brandName}</h2>
                    <p className="text-xs text-slate-400 font-bold">{userProfile.activity}</p>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 inline-block mt-1">
                      عضوية VIP نشطة
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">اسم العلامة التجارية / المشغل</label>
                    <input
                      type="text"
                      value={userProfile.brandName}
                      onChange={e => setUserProfile(prev => ({ ...prev, brandName: e.target.value }))}
                      className="w-full bg-[#1e1f22] text-xs text-white p-3 rounded-xl border border-[#383a40] focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">المدينة</label>
                    <input
                      type="text"
                      value={userProfile.city}
                      onChange={e => setUserProfile(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-[#1e1f22] text-xs text-white p-3 rounded-xl border border-[#383a40] focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">الهاتف والواتساب</label>
                    <input
                      type="text"
                      value={userProfile.phone}
                      onChange={e => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#1e1f22] text-xs text-white p-3 rounded-xl border border-[#383a40] focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">نبذة عن النشاط والتخصص</label>
                    <textarea
                      rows={2}
                      value={userProfile.activity}
                      onChange={e => setUserProfile(prev => ({ ...prev, activity: e.target.value }))}
                      className="w-full bg-[#1e1f22] text-xs text-white p-3 rounded-xl border border-[#383a40] focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    try {
                      localStorage.setItem(`beya_network_profile_${emailKey}`, JSON.stringify(userProfile));
                    } catch {}
                    setActiveView('chat');
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition cursor-pointer"
                >
                  حفظ التعديلات والعودة للديسكورد
                </button>
              </div>
            </div>
          )}

        </main>

        {/* ─────────────────────────────────────────────────────────────
            COLUMN 3: DISCORD MEMBERS & SPECIALISTS LIST (RIGHT SIDEBAR)
        ───────────────────────────────────────────────────────────── */}
        <aside
          className={`w-60 bg-[#2b2d31] border-r border-[#202225] flex flex-col shrink-0 z-20 transition-all duration-200 absolute md:static inset-y-0 left-0 md:left-auto md:right-auto ${
            mobileDrawer === 'members' ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Header */}
          <div className="h-12 px-3 border-b border-[#202225] flex items-center justify-between shadow-xs">
            <span className="font-black text-white text-xs">الأعضاء والمهنيين</span>
            <span className="text-[10px] text-slate-400 bg-black/20 px-2 py-0.5 rounded-full font-mono">
              {allProMembers.length + 3} متصل
            </span>
            <button
              onClick={() => setMobileDrawer('none')}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Members List by Role */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-hide text-xs">

            {/* Role 1: Modélistes */}
            <div>
              <div className="px-2 mb-1 text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>✂️ الموديليست والباترونات</span>
                <span>(5)</span>
              </div>
              <div className="space-y-1">
                {allProMembers.filter(m => m.pillar === 'modeliste').map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedMemberProfile(mod)}
                    className="w-full text-right p-1.5 rounded-xl hover:bg-[#35373c] transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img src={mod.avatar} alt={mod.name} className="w-8 h-8 rounded-full object-cover border border-indigo-500/30" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-[#2b2d31]" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-indigo-400 truncate">{mod.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{mod.specialty.split('•')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 2: Tissu Suppliers */}
            <div>
              <div className="px-2 mb-1 text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>🧵 مالين الثوب</span>
                <span>(3)</span>
              </div>
              <div className="space-y-1">
                {allProMembers.filter(m => m.pillar === 'tissu').map(sup => (
                  <button
                    key={sup.id}
                    onClick={() => setSelectedMemberProfile(sup)}
                    className="w-full text-right p-1.5 rounded-xl hover:bg-[#35373c] transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img src={sup.avatar} alt={sup.name} className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-[#2b2d31]" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">{sup.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{sup.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 3: Fournitures Suppliers */}
            <div>
              <div className="px-2 mb-1 text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>📦 مالين الفورنيتور</span>
                <span>(2)</span>
              </div>
              <div className="space-y-1">
                {allProMembers.filter(m => m.pillar === 'fournitures').map(fourn => (
                  <button
                    key={fourn.id}
                    onClick={() => setSelectedMemberProfile(fourn)}
                    className="w-full text-right p-1.5 rounded-xl hover:bg-[#35373c] transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img src={fourn.avatar} alt={fourn.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/30" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-[#2b2d31]" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 truncate">{fourn.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{fourn.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 4: Impression Workshops */}
            <div>
              <div className="px-2 mb-1 text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center justify-between">
                <span>🎨 مالين الإمبريسيون</span>
                <span>(2)</span>
              </div>
              <div className="space-y-1">
                {allProMembers.filter(m => m.pillar === 'impression').map(imp => (
                  <button
                    key={imp.id}
                    onClick={() => setSelectedMemberProfile(imp)}
                    className="w-full text-right p-1.5 rounded-xl hover:bg-[#35373c] transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img src={imp.avatar} alt={imp.name} className="w-8 h-8 rounded-full object-cover border border-sky-500/30" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-[#2b2d31]" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-sky-400 truncate">{imp.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{imp.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 5: Broderie Workshops */}
            <div>
              <div className="px-2 mb-1 text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center justify-between">
                <span>🪡 مالين الطرز</span>
                <span>(2)</span>
              </div>
              <div className="space-y-1">
                {allProMembers.filter(m => m.pillar === 'broderie').map(brod => (
                  <button
                    key={brod.id}
                    onClick={() => setSelectedMemberProfile(brod)}
                    className="w-full text-right p-1.5 rounded-xl hover:bg-[#35373c] transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img src={brod.avatar} alt={brod.name} className="w-8 h-8 rounded-full object-cover border border-rose-500/30" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-[#2b2d31]" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-rose-400 truncate">{brod.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{brod.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 6: Brand Owners */}
            <div>
              <div className="px-2 mb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>🏷️ أصحاب البراندات</span>
                <span>(متصلين)</span>
              </div>
              <div className="space-y-1">
                {['FAS Wear (أنت)', 'Street Lab Casablanca', 'Nomad Wear Rabat', 'Urban Style MA'].map((b, idx) => (
                  <div key={idx} className="p-1.5 rounded-xl flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {b.charAt(0)}
                    </div>
                    <p className="text-xs text-slate-300 truncate font-medium">{b}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          DISCORD PROFILE MODAL / POPOUT (ON CLICK OF ANY MEMBER)
      ───────────────────────────────────────────────────────────── */}
      {selectedMemberProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg bg-[#232428] rounded-3xl overflow-hidden border border-[#383a40] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Cover Banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative">
              <button
                onClick={() => setSelectedMemberProfile(null)}
                className="absolute top-3 left-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-5 pt-0 relative space-y-4">
              {/* Floating Avatar */}
              <div className="flex items-end justify-between -mt-12 mb-2">
                <div className="relative">
                  <img
                    src={selectedMemberProfile.avatar}
                    alt={selectedMemberProfile.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-[#232428] shadow-lg"
                  />
                  <span className="w-4 h-4 rounded-full bg-emerald-500 absolute bottom-1 right-1 border-2 border-[#232428]" />
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedMemberProfile.whatsapp}?text=${encodeURIComponent(
                      `السلام عليكم ${selectedMemberProfile.name}، تواصلت معك عبر سيرفر BEYA NETWORK بخصوص طلب خدماتكم.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>

                  {selectedMemberProfile.phone && (
                    <a
                      href={`tel:${selectedMemberProfile.phone}`}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 border border-white/10 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    </a>
                  )}
                </div>
              </div>

              {/* Title & Badge */}
              <div>
                <h3 className="text-lg font-black text-white">{selectedMemberProfile.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/30">
                    {selectedMemberProfile.roleBadge || selectedMemberProfile.pillarLabelAr}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    {selectedMemberProfile.city}
                  </span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-3 bg-[#1e1f22] rounded-2xl border border-white/5 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 block">نبذة وخبرات العمل:</span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {selectedMemberProfile.bio}
                </p>

                {selectedMemberProfile.cadSoftware && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">البرامج والماكينات المعتمدة:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMemberProfile.cadSoftware.map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-indigo-300 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Catalog / Products if Available */}
              {selectedMemberProfile.catalog && selectedMemberProfile.catalog.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 block">عينة من الأسعار والخدمات:</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedMemberProfile.catalog.map((item: any, cIdx: number) => (
                      <div key={cIdx} className="p-2 bg-[#2b2d31] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white text-[11px]">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.specs}</p>
                        </div>
                        <span className="text-xs font-black text-amber-400 shrink-0 font-mono">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Verification Badge */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>عضو معتمد رسمي من طرف ورشة BEYA Creative مع تطبيق أسعار الشراكة التفضيلية.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
