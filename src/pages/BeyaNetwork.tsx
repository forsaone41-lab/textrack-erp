import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Globe, Users, Package, MessageCircle, ArrowRight, ArrowLeft, Search,
  Send, ThumbsUp, MessageSquare, ShieldCheck, CheckCircle2, Phone,
  Sparkles, Plus, X, ExternalLink, Filter, MapPin, Tag, Scissors,
  Building2, Layers, Award, Clock, ChevronDown, Check, Share2,
  SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag, Palette,
  Ruler, Eye, Briefcase, FileCode2, Star, Hash, Volume2, Settings,
  Smile, Image as ImageIcon, AtSign, Menu, Flame, Heart, Lightbulb,
  Radio, Compass, ChevronRight, CheckCheck, Crown, Shield, HelpCircle,
  ZoomIn, Calculator, Scale, Percent, Truck, Info,
  Calendar, Video, CreditCard, DollarSign, UploadCloud, FileCheck,
  CheckCircle, Copy, Download, UserCheck, ShieldAlert, PlusCircle, FileText, Lock
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

export interface FabricColor {
  name: string;
  hex: string;
  tagAr: string;
}

export interface GroupageDeal {
  id: string;
  title: string;
  category: 'tissu' | 'fournitures';
  material: string;
  supplier: string;
  supplierCity: string;
  targetKg: number;
  currentKg: number;
  participantsCount: number;
  daysLeft: number;
  // Dual Pricing & Units
  primaryUnit: 'kg' | 'm' | 'piece';
  primaryUnitLabelAr: string;
  discountPrice: number;
  regularPrice: number;
  // Per Meter Specs & Conversion
  pricePerMeterEstimated: number | null;
  regularPricePerMeterEstimated: number | null;
  metersPerKg: number | null;
  conversionNote: string;
  garmentYield: string;
  minCommitment: number;
  minCommitmentLabel: string;
  status: 'active' | 'success' | 'closing_soon';
  // Technical Specifications (Fiche Technique)
  gsm: string;
  composition: string;
  width: string;
  treatment: string;
  shrinkage: string;
  recommendedUsage: string[];
  // Gallery & Colors
  images: string[];
  colors: FabricColor[];
  whatsappText: string;
}

export interface GroupageOrder {
  id: string;
  dealId: string;
  dealTitle: string;
  brandName: string;
  contactName: string;
  phone: string;
  city: string;
  quantity: number;
  unit: string;
  color: string;
  totalPrice: number;
  savingsMad: number;
  status: 'confirmed' | 'pending';
  date: string;
}

export interface GroupageSupplierReply {
  id: string;
  supplierName: string;
  supplierCity: string;
  supplierAvatar?: string;
  priceMAD: number;
  unit: string;
  minQty: number;
  deliveryTime: string;
  message: string;
  whatsapp: string;
  date: string;
}

export interface GroupageCustomRequest {
  id: string;
  title: string;
  materialNeeded: string;
  category: 'tissu' | 'fournitures';
  targetQty: number;
  unit: string;
  targetPriceMAD?: number;
  brandName: string;
  city: string;
  phone: string;
  description: string;
  colors?: string[];
  date: string;
  status: 'open' | 'fulfilled';
  replies: GroupageSupplierReply[];
}

const INITIAL_GROUPAGE_ORDERS: GroupageOrder[] = [
  // grp-1: Molleton 340g
  { id: 'ord-101', dealId: 'grp-1', dealTitle: 'دفعة أقمشة الملتون الشتوي 340g', brandName: 'Casablanca Streetwear', contactName: 'أمين', phone: '0661234567', city: 'الدار البيضاء', quantity: 75, unit: 'كلغ', color: 'أسود فاحم (Noir Profond)', totalPrice: 3300, savingsMad: 600, status: 'confirmed', date: 'منذ يومين' },
  { id: 'ord-102', dealId: 'grp-1', dealTitle: 'دفعة أقمشة الملتون الشتوي 340g', brandName: 'Atlas Originals', contactName: 'سفيان', phone: '0662345678', city: 'مراكش', quantity: 50, unit: 'كلغ', color: 'رمادي ميلونج (Gris Chiné)', totalPrice: 2200, savingsMad: 400, status: 'confirmed', date: 'منذ 3 أيام' },
  { id: 'ord-103', dealId: 'grp-1', dealTitle: 'دفعة أقمشة الملتون الشتوي 340g', brandName: 'Urban Way Apparel', contactName: 'طارق', phone: '0663456789', city: 'طنجة', quantity: 100, unit: 'كلغ', color: 'أوف وايت حليبي (Off-White)', totalPrice: 4400, savingsMad: 800, status: 'confirmed', date: 'منذ 3 أيام' },
  { id: 'ord-104', dealId: 'grp-1', dealTitle: 'دفعة أقمشة الملتون الشتوي 340g', brandName: 'Mode Casa Studio', contactName: 'مهدي', phone: '0664567890', city: 'الدار البيضاء', quantity: 50, unit: 'كلغ', color: 'أخضر زيتي ملكي', totalPrice: 2200, savingsMad: 400, status: 'confirmed', date: 'منذ 4 أيام' },
  { id: 'ord-105', dealId: 'grp-1', dealTitle: 'دفعة أقمشة الملتون الشتوي 340g', brandName: 'Nomad Wear', contactName: 'ياسين', phone: '0665678901', city: 'أكادير', quantity: 45, unit: 'كلغ', color: 'بني شوكولا موكا', totalPrice: 1980, savingsMad: 360, status: 'confirmed', date: 'منذ 5 أيام' },
  { id: 'ord-106', dealId: 'grp-1', dealTitle: 'دفعة أقمشة الملتون الشتوي 340g', brandName: 'Atelier North', contactName: 'كريم', phone: '0666789012', city: 'تطوان', quantity: 60, unit: 'كلغ', color: 'أسود فاحم (Noir Profond)', totalPrice: 2640, savingsMad: 480, status: 'confirmed', date: 'منذ 6 أيام' },

  // grp-2: Canvas 320g
  { id: 'ord-201', dealId: 'grp-2', dealTitle: 'صفقة قماش كانفاس قطني سميك 320g', brandName: 'Nordic Cargo Brand', contactName: 'كريم', phone: '0667890123', city: 'طنجة', quantity: 60, unit: 'متر', color: 'كاكي عسكري (Kaki Militaire)', totalPrice: 1920, savingsMad: 480, status: 'confirmed', date: 'منذ يوم' },
  { id: 'ord-202', dealId: 'grp-2', dealTitle: 'صفقة قماش كانفاس قطني سميك 320g', brandName: 'Tactical Style Morocco', contactName: 'أنس', phone: '0668901234', city: 'الدار البيضاء', quantity: 100, unit: 'متر', color: 'أسود كربوني (Noir Charbon)', totalPrice: 3200, savingsMad: 800, status: 'confirmed', date: 'منذ يومين' },
  { id: 'ord-203', dealId: 'grp-2', dealTitle: 'صفقة قماش كانفاس قطني سميك 320g', brandName: 'Heritage Worker', contactName: 'حمزة', phone: '0669012345', city: 'فاس', quantity: 90, unit: 'متر', color: 'بيج جملي صحراوي (Camel Desert)', totalPrice: 2880, savingsMad: 720, status: 'confirmed', date: 'منذ 4 أيام' },
  { id: 'ord-204', dealId: 'grp-2', dealTitle: 'صفقة قماش كانفاس قطني سميك 320g', brandName: 'Saharan Wear', contactName: 'عمر', phone: '0660123456', city: 'مراكش', quantity: 60, unit: 'متر', color: 'كاكي عسكري (Kaki Militaire)', totalPrice: 1920, savingsMad: 480, status: 'confirmed', date: 'منذ 5 أيام' },

  // grp-5: Crêpe Barbie
  { id: 'ord-501', dealId: 'grp-5', dealTitle: 'دفعة أقمشة كريب باربي رويال الفاخر 220g', brandName: 'Abaya Chic Casablanca', contactName: 'كنزة', phone: '0661122334', city: 'الدار البيضاء', quantity: 80, unit: 'متر', color: 'أسود ملكي فاحم (Noir Royal)', totalPrice: 2880, savingsMad: 640, status: 'confirmed', date: 'منذ يوم' },
  { id: 'ord-502', dealId: 'grp-5', dealTitle: 'دفعة أقمشة كريب باربي رويال الفاخر 220g', brandName: 'Kaftan Modern Fes', contactName: 'فاطمة', phone: '0662233445', city: 'فاس', quantity: 60, unit: 'متر', color: 'بيج نيود بودرة (Nude Poudré)', totalPrice: 2160, savingsMad: 480, status: 'confirmed', date: 'منذ يومين' },
  { id: 'ord-503', dealId: 'grp-5', dealTitle: 'دفعة أقمشة كريب باربي رويال الفاخر 220g', brandName: 'Elegance Femme Rabat', contactName: 'مريم', phone: '0663344556', city: 'الرباط', quantity: 50, unit: 'متر', color: 'أزرق بترولي ملكي (Bleu Pétrole)', totalPrice: 1800, savingsMad: 400, status: 'confirmed', date: 'منذ 3 أيام' },
  { id: 'ord-504', dealId: 'grp-5', dealTitle: 'دفعة أقمشة كريب باربي رويال الفاخر 220g', brandName: 'Couture Luxe', contactName: 'زينب', phone: '0664455667', city: 'مراكش', quantity: 50, unit: 'متر', color: 'وردي باودر ناعم (Rose Poudré)', totalPrice: 1800, savingsMad: 400, status: 'confirmed', date: 'منذ 4 أيام' },
  { id: 'ord-505', dealId: 'grp-5', dealTitle: 'دفعة أقمشة كريب باربي رويال الفاخر 220g', brandName: 'Hijab Trend Tanger', contactName: 'سناء', phone: '0665566778', city: 'طنجة', quantity: 40, unit: 'متر', color: 'أسود ملكي فاحم (Noir Royal)', totalPrice: 1440, savingsMad: 320, status: 'confirmed', date: 'منذ 5 أيام' }
];

const INITIAL_CUSTOM_REQUESTS: GroupageCustomRequest[] = [
  {
    id: 'req-1',
    title: 'طلب 150 متر كريب باربي رويال كوري أسود ملكي للعبايات والبدلات',
    materialNeeded: 'كريب باربي رويال 220g كوري',
    category: 'tissu',
    targetQty: 150,
    unit: 'متر',
    targetPriceMAD: 38,
    brandName: 'علامة Rym Abaya',
    city: 'الدار البيضاء (المعاريف)',
    phone: '0661234567',
    description: 'محتاجين 150 متر كريب باربي ثقيل وطايح ومكايتكمشش، اللون أسود ملكي فاحم ما كيشهابش فالتصبين لإنتاج كوليكسيون عبايات وبدلات نسائية راقية.',
    colors: ['أسود ملكي فاحم'],
    date: 'منذ يومين',
    status: 'open',
    replies: [
      {
        id: 'rep-sup-1',
        supplierName: 'دار الكريب والأقمشة النسائية (Derb Omar)',
        supplierCity: 'الدار البيضاء • درب عمر',
        supplierAvatar: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=150&auto=format&fit=crop&q=80',
        priceMAD: 36,
        unit: 'متر',
        minQty: 30,
        deliveryTime: '24 ساعة داخل كازا • 48 ساعة لجميع المدن',
        message: 'السلام عليكم أختي ريم، طلبكم متوفر بالكامل فـ مستودعنا بدرب عمر. كريب باربي رويال 220g أصلي كوري بسواد ملكي ممتاز، عرض 1.50م. نعطيوكم سعر 36 درهم للمتر (تخفيض 2 درهم على الميزانية ديالكم). إمكانية أخذ كوبون اختبار 5 أمتار قبل الرول الكامل مع بطاقة العينات مجاناً.',
        whatsapp: '212661902834',
        date: 'أمس، 11:30'
      }
    ]
  },
  {
    id: 'req-2',
    title: 'طلب 400 سحاب ووتربروف أسود 70 سم لسترات المطر والرياح',
    materialNeeded: 'سحابات ضد الماء Zips Étanche مع أكياس بولي باغ',
    category: 'fournitures',
    targetQty: 400,
    unit: 'قطعة',
    targetPriceMAD: 5.50,
    brandName: 'North Shelter Apparel',
    city: 'طنجة',
    phone: '0665891234',
    description: 'مطلوب سحابات عازلة للماء والرياح طول 70 سم مع شريط لاصق حراري لسترات الشتاء الووتربروف، ومطلوب 400 كيس بولي باغ مات بسحاب.',
    colors: ['أسود مات'],
    date: 'منذ 3 أيام',
    status: 'open',
    replies: [
      {
        id: 'rep-sup-2',
        supplierName: 'مؤسسة الأناقة للوازم الخياطة والتغليف',
        supplierCity: 'الدار البيضاء • كراج علال / طنجة',
        supplierAvatar: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
        priceMAD: 5.20,
        unit: 'قطعة',
        minQty: 100,
        deliveryTime: 'تسليم فوري من مستودع طنجة كزناية',
        message: 'أهلاً بكم، العرض جاهز بالكامل: سحاب ووتربروف احترافي مع شريط مطاطي عازل بسعر 5.20 MAD للطقم شاملاً كيس البولي باغ الزيبلوك المات. العينات متوفرة للمعاينة الفورية بطنجة كزناية.',
        whatsapp: '212668901234',
        date: 'منذ يومين'
      }
    ]
  },
  {
    id: 'req-3',
    title: 'طلب تجميع أقمشة كتان طبيعي بيور 100% مغسول (Pure Washed Linen)',
    materialNeeded: 'كتان طبيعي 100% غسول بارد',
    category: 'tissu',
    targetQty: 200,
    unit: 'متر',
    targetPriceMAD: 42,
    brandName: 'Nomad Coastline',
    city: 'أكادير',
    phone: '0663456789',
    description: 'كنقلبو على كتان فرنسي طبيعي 100% معالج ضد الانكماش لصنع قمصان وشورتات صيفية بألوان بيج، إيكرو، وأزرق سماوي.',
    colors: ['بيج رملي', 'أبيض ناصع', 'أزرق سماوي'],
    date: 'منذ 4 أيام',
    status: 'open',
    replies: [
      {
        id: 'rep-sup-3',
        supplierName: 'مستودع أقمشة الكتان والصيف الطبيعي (Comptoir du Lin)',
        supplierCity: 'طنجة / الدار البيضاء',
        supplierAvatar: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150&auto=format&fit=crop&q=80',
        priceMAD: 42,
        unit: 'متر',
        minQty: 30,
        deliveryTime: '48 ساعة لأكادير عبر شركة الإرساليات',
        message: 'مرحباً خويا، متوفر عندنا كتان بيور 100% مغسول Pure Linen 210g حاصل على شهادة OEKO-TEX العالمية، الألوان الثلاثة متوفرة برولوهات كاملة مع ثبات تام للأبعاد وملمس طبيعي فاخر.',
        whatsapp: '212662894105',
        date: 'منذ 3 أيام'
      }
    ]
  }
];



export default function BeyaNetwork({ currentUser, onLogout }: BeyaNetworkProps) {
  const navigate = useNavigate();
  const emailKey = (currentUser?.email || '').toLowerCase().trim();
  const isPilotAuthorized = emailKey === 'forsaone41@gmail.com';

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION & UI STATE
  // ─────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<'freelance' | 'consulting' | 'chat' | 'directory' | 'groupage' | 'profile'>('freelance');
  const [freelanceCategoryFilter, setFreelanceCategoryFilter] = useState<'all' | 'streetwear' | 'denim' | 'femme' | 'sport'>('all');
  const [activeChannelId, setActiveChannelId] = useState<string>('general-mode');
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'channels' | 'members'>('none');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'modeliste' | 'tissu' | 'fournitures' | 'impression' | 'broderie'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [selectedFabricSpecialty, setSelectedFabricSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any | null>(null);
  const [expandedThreadMessageId, setExpandedThreadMessageId] = useState<string | null>(null);
  const [threadReplyDraft, setThreadReplyDraft] = useState('');

  // ─────────────────────────────────────────────────────────────
  // FREELANCE DUAL MODE: 'talents' (نخبة الموديليست) VS 'jobs' (مشاريع وطلبات الإنتاج)
  // ─────────────────────────────────────────────────────────────
  const [freelanceTab, setFreelanceTab] = useState<'talents' | 'jobs'>('talents');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState<'all' | 'streetwear' | 'denim' | 'femme' | 'sport'>('all');
  const [jobBudgetFilter, setJobBudgetFilter] = useState<'all' | 'under500' | '500to1500' | 'above1500'>('all');

  // POST A JOB MODAL STATE (للعملاء وأصحاب البراندات)
  const [showPostJobModal, setShowPostJobModal] = useState<boolean>(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobBrand, setNewJobBrand] = useState('');
  const [newJobCity, setNewJobCity] = useState('الدار البيضاء');
  const [newJobBudget, setNewJobBudget] = useState(350);
  const [newJobCategory, setNewJobCategory] = useState<'streetwear' | 'denim' | 'femme' | 'sport'>('streetwear');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobWhatsapp, setNewJobWhatsapp] = useState('');
  const [newJobWorkMode, setNewJobWorkMode] = useState<'digital' | 'paper' | 'both'>('digital');
  const [importedModelSuccess, setImportedModelSuccess] = useState<string | null>(null);

  // AUTO-FILL / IMPORT FROM BEYA TECH PACK STUDIO
  const handleImportFromBeya = (modelKey: string) => {
    try {
      const activeFtRaw = localStorage.getItem('beya_ai_to_ft');
      if (activeFtRaw && modelKey === 'active-ft') {
        const ft = JSON.parse(activeFtRaw);
        setNewJobTitle(`طلب باترون صناعي وتدريج مقاسات لموديل ${ft.title || ft.nom || 'BEYA Studio'}`);
        setNewJobDescription(`• موديل مستورد مباشرة من استوديو BEYA Tech Pack:\n• اسم الموديل: ${ft.title || ft.nom}\n• القماش المقترح: ${ft.fabric || ft.tissu || 'قطن ممشط'}\n• الغراماج: ${ft.gsm || '250g'}\n• المطلوب: تدريج المقاسات XS-XXL، إعداد ملفات DXF AAMA، وبطاقة مواصفات فنية للورشة.`);
        setNewJobBudget(350);
        setImportedModelSuccess(ft.title || 'موديلك في BEYA Tech Pack');
        return;
      }
    } catch {}

    const presets: Record<string, any> = {
      'crop-top': {
        name: 'Top Manches Longues (Crop Top)',
        title: 'مطلوب موديليست لإنجاز باترون Top Manches Longues Près du Corps (Crop Top) مع تدريج المقاسات XS-XXL',
        category: 'femme',
        budget: 350,
        workMode: 'digital',
        desc: '• موديل مستورد مباشرة من BEYA Tech Pack Studio:\n• نوع القطعة: Top Manches Longues Près du Corps (Crop Top)\n• القماش المعتمد: كوت ريب 1×1 ليكرا 95% قطن ممشط و 5% إيلاسطان (غراماج 250g)\n• استهلاك الثوب التقديري: 0.85 متر للبياسة\n• نطاق التكلفة التقديرية: 22 - 32 درهم بالمتر\n• المطلوب من الموديليست:\n1. إنجاز الباترون الأساسي بمطابقة تامة لطول الأكمام وقصة العنق\n2. تدريج المقاسات (Gradation XS إلى XXL)\n3. تسليم ملفات DXF AAMA صالحة لماكينات الفصالة الأوتوماتيكية مع Fiche Technique للورشة.'
      },
      'hoodie': {
        name: 'هودي أوفرسايز 380g',
        title: 'إنجاز باترون هودي أوفرسايز Heavyweight 380g مع كابوش دبل وجيب كانغورو وتدريج كامل',
        category: 'streetwear',
        budget: 380,
        workMode: 'digital',
        desc: '• موديل مستورد مباشرة من BEYA Tech Pack Studio:\n• نوع القطعة: Oversized Heavyweight Hoodie (Drop Shoulder)\n• القماش: ميلتون خيط ممشط 100% Coton 380g (French Terry)\n• استهلاك الثوب: 1.45 متر للبياسة\n• المطلوب:\n1. باترون Drop Shoulder متوازن مع كابوش واسع بدون خياطة مزعجة\n2. تدريج المقاسات من S إلى 3XL\n3. جدول باريم القياسات وبطاقة Fiche Tech لورشة التجميع.'
      },
      'cargo': {
        name: 'سروال كارجو تكتيكي 6 جيوب',
        title: 'باترون وفصالة سروال كارجو بـ 6 جيوب تكتيكية ثلاثية الأبعاد وسحابات YKK مخفية',
        category: 'denim',
        budget: 450,
        workMode: 'both',
        desc: '• موديل مستورد مباشرة من BEYA Tech Pack Studio:\n• نوع القطعة: Tactical Cargo Pants\n• القماش: كانفاس ريبستوب مقاوم للتمزق 280g\n• المطلوب:\n1. باترون هندسي للجيوب المنفوخة (Poches à soufflet) مع غطاء وسحاب مخفي\n2. تدريج مقاسات الخصر 28 إلى 38\n3. محاكاة 3D وفحص توازن الساقين قبل القص.'
      },
      'boxy-tee': {
        name: 'تيشيرت Boxy Fit 240g (Winner)',
        title: 'باترون تيشيرت Boxy Fit قطن 240g مع ياقة كول ريب معزز وتدريج مقاسات S-XXL',
        category: 'streetwear',
        budget: 280,
        workMode: 'digital',
        desc: '• موديل مستورد مباشرة من BEYA Tech Pack Studio:\n• نوع القطعة: T-Shirt Boxy Fit (Winner Product)\n• القماش: Coton Peigné 240g\n• المطلوب:\n1. قصة مربعة واسعة (Boxy Fit) مع أكتاف منسدلة وطول خصر عصري\n2. ياقة كول ريب سميكة ومشدودة لا ترتخي بعد الغسيل\n3. ملفات DXF صالحة للقص وبطاقة مواصفات الخياطة.'
      },
      'abaya': {
        name: 'عباية كيمونو كريب دو سوا',
        title: 'كوليكسيون عبايات كيمونو عصرية مع فساتين كتان وبوبلين لمصانع طنجة وكازا',
        category: 'femme',
        budget: 650,
        workMode: 'both',
        desc: '• موديل مستورد مباشرة من BEYA Tech Pack Studio:\n• نوع القطعة: Abaya Kimono & Robe Lin\n• القماش: Crêpe de Soie & Lin Lavé\n• المطلوب:\n1. فصالة انسيابية مع احترام طيحة الثوب\n2. تدريج 3 مقاسات رئيسية\n3. بطاقة تقنية لاستهلاك الأقمشة ومقادير الأكمام.'
      },
      'activewear': {
        name: 'طقم رياضي نسائي Seamless',
        title: 'باترون طقم رياضي نسائي (Legging Seamless + Sport Bra) بتقنية التمدد 4-Way Stretch',
        category: 'sport',
        budget: 400,
        workMode: 'digital',
        desc: '• موديل مستورد مباشرة من BEYA Tech Pack Studio:\n• نوع القطعة: Sport Set Seamless\n• القماش: 82% Polyester / 18% Élasthanne\n• المطلوب:\n1. باترون ضاغط مع مراعاة نسبة التمدد العالية\n2. غرز الحياكة المسطحة Flatlock\n3. باريم القياسات XS إلى L.'
      }
    };

    const target = presets[modelKey];
    if (target) {
      setNewJobTitle(target.title);
      setNewJobCategory(target.category);
      setNewJobBudget(target.budget);
      setNewJobWorkMode(target.workMode);
      setNewJobDescription(target.desc);
      if (!newJobBrand && userProfile.brandName) {
        setNewJobBrand(userProfile.brandName);
      }
      setImportedModelSuccess(target.name);
    }
  };

  const [jobPostedSuccessSlip, setJobPostedSuccessSlip] = useState<any | null>(null);
  const [myPostedJobIds, setMyPostedJobIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('beya_my_posted_jobs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // SUBMIT PROPOSAL MODAL STATE (للموديليست للتقديم على عروض العملاء)
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [selectedJobForProposal, setSelectedJobForProposal] = useState<any | null>(null);
  const [proposalPrice, setProposalPrice] = useState<number>(300);
  const [proposalDuration, setProposalDuration] = useState<string>('يومان (48 ساعة)');
  const [proposalMessage, setProposalMessage] = useState<string>('');
  const [proposalAuthorName, setProposalAuthorName] = useState<string>('');
  const [proposalAuthorPhone, setProposalAuthorPhone] = useState<string>('');
  const [proposalSubmittedSlip, setProposalSubmittedSlip] = useState<any | null>(null);

  // WORKER ROLE & ANTI-FRAUD VERIFICATION STATE (المهني نوعان: مصمم أو مستشار تقني + موافقة إدارية)
  const [workerRole, setWorkerRole] = useState<'guest' | 'pending' | 'designer' | 'consultant'>(() => {
    try {
      const stored = localStorage.getItem('beya_worker_role');
      if (stored === 'pending' || stored === 'designer' || stored === 'consultant') return stored;
    } catch {}
    return 'guest';
  });

  const [showProRegisterModal, setShowProRegisterModal] = useState<boolean>(false);
  const [proRegisterType, setProRegisterType] = useState<'designer' | 'consultant'>('designer');
  const [proRegisterName, setProRegisterName] = useState<string>('');
  const [proRegisterBrand, setProRegisterBrand] = useState<string>('');
  const [proRegisterCity, setProRegisterCity] = useState<string>('الدار البيضاء');
  const [proRegisterWhatsapp, setProRegisterWhatsapp] = useState<string>('');
  const [proRegisterPortfolio, setProRegisterPortfolio] = useState<string>('');
  const [proRegisterSkills, setProRegisterSkills] = useState<string[]>(['Lectra Modaris', 'CLO 3D', 'Gradation S-XXL']);
  const [proRegisterExperience, setProRegisterExperience] = useState<string>('من 3 إلى 5 سنوات');
  const [proRegisterSlip, setProRegisterSlip] = useState<any | null>(null);

  // INITIAL JOB FEED LIST (RICH MOROCCAN B2B FASHION PRODUCTION PROJECTS)
  const [jobsList, setJobsList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('beya_freelance_jobs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'job-1',
        title: 'مطلوب موديليست محترف لإنجاز باترون هودي أوفرسايز 380g مع تدريج المقاسات S-XXL وبطاقة تقنية لمصنع الخياطة',
        brand: 'North Wear Casablanca',
        city: 'الدار البيضاء',
        budgetMAD: 350,
        category: 'streetwear',
        categoryLabel: 'ستريت وير وهوديز',
        description: 'السلام عليكم، عندنا براند كوليكسيون شتوية محتاجين باترون مضبوط لهودي أوفرسايز Drop Shoulder كابوش كبير وجيب كانغورو. مطلوب ملفات DXF AAMA صالحة للقص الأوتوماتيكي مع تدرج المقاسات وبطاقة Fiche Technique واضحة لمعمل الخياطة.',
        skills: ['Lectra Modaris', 'CLO 3D', 'Gradation S-XXL', 'Fiche Technique', 'Drop Shoulder'],
        proposalsCount: 3,
        postedAt: 'منذ ساعتين',
        urgent: true,
        contactWhatsapp: '212675239885',
        workMode: 'remote'
      },
      {
        id: 'job-2',
        title: 'فصالة وتدقيق باترون سروال كارجو مع جيوب منفوخة (Poches Soufflet) وجيوب سرية وتدريج كامل',
        brand: 'Tactical Gear MA',
        city: 'الدار البيضاء (سيدي معروف)',
        budgetMAD: 450,
        category: 'denim',
        categoryLabel: 'جينز ودينيم وكارجو',
        description: 'محتاجين خبير فصالة وباتورناج لسروال كارجو قماش كانفاس أو ريبستوب 6 جيوب مع تفاصيل تكتيكية (سحابات YKK مخفية وتدريج المقاسات 28-38). يفضل إمكانية إرسال محاكاة 3D قبل قص العينة.',
        skills: ['Gerber', 'CLO 3D', 'Cargo Pants', 'Gradation 28-38', 'Canvas'],
        proposalsCount: 2,
        postedAt: 'منذ 4 ساعات',
        urgent: false,
        contactWhatsapp: '212675239885',
        workMode: 'remote'
      },
      {
        id: 'job-3',
        title: 'كوليكسيون كاملة للصيف (عبايات وقفاطين عصرية 6 موديلات) مع ملفات DXF جاهزة لمصانع طنجة والرباط',
        brand: 'Noor Chic Couture',
        city: 'الرباط (حي الرياض)',
        budgetMAD: 1800,
        category: 'femme',
        categoryLabel: 'أزياء نسائية ومودست',
        description: 'مشروع كوليكسيون كاملة لصيف 2026: 4 عبايات بقصات خليجية ومغربية + 2 فساتين كتان وبوبلين. نريد موديليست مبدعة تفهم طيحة الثوب (Crêpe de Soie & Lin) مع تدريج 3 مقاسات لكل موديل وبطاقات تقنية مفصلة.',
        skills: ['Lectra Modaris', 'Abaya Pattern', 'Gradation', 'Fiches Techniques', 'Lin 100%'],
        proposalsCount: 5,
        postedAt: 'منذ 6 ساعات',
        urgent: true,
        contactWhatsapp: '212675239885',
        workMode: 'remote'
      },
      {
        id: 'job-4',
        title: 'محاكاة 3D وفيتينغ رقمي لجاكيت بومبر وسويت بانتس قبل قص الثوب لتفادي الهدر',
        brand: 'Urban Velocity',
        city: 'طنجة',
        budgetMAD: 300,
        category: 'streetwear',
        categoryLabel: 'ستريت وير وهوديز',
        description: 'عندنا الباترون واجد محتاجين خبير CLO 3D يدير لينا محاكاة افتراضية للقطعة على مانيكان ويقيس توازن القصة وطول الأكمام والخصر قبل ما نبدأو إنتاج 500 حبة.',
        skills: ['CLO 3D V7', 'Simulation 3D', 'Virtual Fitting', 'Textile Rendering'],
        proposalsCount: 1,
        postedAt: 'منذ يوم',
        urgent: false,
        contactWhatsapp: '212675239885',
        workMode: 'remote'
      },
      {
        id: 'job-5',
        title: 'باترون طقم رياضي نسائي (Legging Seamless + Sport Bra) بتقنية التمدد 4-Way Stretch',
        brand: 'Athletica Morocco',
        city: 'الدار البيضاء',
        budgetMAD: 400,
        category: 'sport',
        categoryLabel: 'ملابس رياضية وتقنية',
        description: 'مطلوب باترون هندسي لطقم رياضي عالي الأداء مع احتساب نسبة التمدد (Élasthanne 18%) وغرز الحياكة المسطحة (Flatlock). التسليم بصيغة DXF مع باريم القياسات.',
        skills: ['Optitex', 'Flatlock Stitch', 'Gradation XS-L', 'Activewear'],
        proposalsCount: 2,
        postedAt: 'منذ يوم',
        urgent: false,
        contactWhatsapp: '212675239885',
        workMode: 'remote'
      },
      {
        id: 'job-6',
        title: 'استشارة حضورية بمكتب الموديليست بالدار البيضاء لمراجعة كوليكسيون أولى واختيار أقمشة المصانع',
        brand: 'Atlas Atelier B2B',
        city: 'الدار البيضاء (أنفا)',
        budgetMAD: 250,
        category: 'streetwear',
        categoryLabel: 'استشارة وتوجيه',
        description: 'كنطلقو أول براند ملابس شبابية وبغينا جلسة عمل 45 دقيقة مع موديليست خبير فـ كازا لمراجعة الرسومات التقنية وفحص عينات الأقمشة وإعطائنا نصائح تفادي أخطاء المعامل.',
        skills: ['استشارة حضورية', 'Fabric Swatches', 'مانيكان Fitting', 'Coût Façon'],
        proposalsCount: 4,
        postedAt: 'منذ يومين',
        urgent: false,
        contactWhatsapp: '212675239885',
        workMode: 'office'
      }
    ];
  });

  // ESCROW & PAYMENT STATE (Local Virement / Cash Plus / PayPal International)
  const [showEscrowModal, setShowEscrowModal] = useState<boolean>(false);
  const [escrowTarget, setEscrowTarget] = useState<any | null>(null);
  const [escrowPaymentMethod, setEscrowPaymentMethod] = useState<'local' | 'paypal'>('local');
  const [escrowAmount, setEscrowAmount] = useState<number>(350);
  const [escrowServiceTitle, setEscrowServiceTitle] = useState<string>('باترون رقمي متكامل + تدريج المقاسات XS-XXL + ملفات Fiche Tech');
  const [escrowPayerName, setEscrowPayerName] = useState<string>('');
  const [escrowPayerPhone, setEscrowPayerPhone] = useState<string>('');
  const [escrowReceiptFile, setEscrowReceiptFile] = useState<string | null>(null);
  const [escrowPaypalTxId, setEscrowPaypalTxId] = useState<string>('');
  const [escrowSuccessSlip, setEscrowSuccessSlip] = useState<any | null>(null);

  // CONSULTATION BOOKING STATE (Live Visio / Présentiel au Bureau)
  const [showConsultationModal, setShowConsultationModal] = useState<boolean>(false);
  const [consultationTarget, setConsultationTarget] = useState<any | null>(null);
  const [consultationMode, setConsultationMode] = useState<'visio' | 'office'>('visio');
  const [consultationDate, setConsultationDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [consultationTime, setConsultationTime] = useState<string>('15:00');
  const [consultationTopic, setConsultationTopic] = useState<string>('تحديد وتحليل المنتج الرابح (Winner Product): دراسة ترندات السوق والقطع الأكثر مبيعاً وهوامش الربح');
  const [consultationClientName, setConsultationClientName] = useState<string>('');
  const [consultationClientPhone, setConsultationClientPhone] = useState<string>('');
  const [consultationConfirmedSlip, setConsultationConfirmedSlip] = useState<any | null>(null);

  // CONSULTING WORKSPACE STATE (TABS, LIVE BOOKING & CLIENT FEEDBACK)
  const [consultingTab, setConsultingTab] = useState<'consultants' | 'live_booking' | 'feedback'>('consultants');
  const [consultingSearchQuery, setConsultingSearchQuery] = useState('');
  const [consultingCategoryFilter, setConsultingCategoryFilter] = useState<'all' | 'streetwear' | 'denim' | 'femme' | 'sport'>('all');
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewBrand, setNewReviewBrand] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('الدار البيضاء');
  const [newReviewConsultant, setNewReviewConsultant] = useState('ياسين الصنهاجي');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewSessionType, setNewReviewSessionType] = useState<'visio' | 'office'>('visio');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [consultationReviews, setConsultationReviews] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('beya_consultation_reviews');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'rev-0',
        authorName: 'طارق الناصري',
        brandName: 'Veloce Streetwear & E-Com',
        city: 'الدار البيضاء',
        consultantName: 'ياسين الصنهاجي',
        rating: 5,
        date: 'منذ يوم',
        sessionType: 'visio',
        comment: 'استشارة تحديد الـ Winner Product كانت نقطة تحول فـ البراند ديالي! ياسين نصحني نخدم على قصة Boxy Heavyweight 380g بدل الـ Oversized العادي وعطاني كلفة الإنتاج المضبوطة (78 درهم للقطعة). بعنا أكثر من 850 حبة فـ تيك توك بأرباح خيالية وبدون أي روطور!',
        verified: true
      },
      {
        id: 'rev-1',
        authorName: 'كريم بناني',
        brandName: 'Casablanca Streetwear',
        city: 'الدار البيضاء',
        consultantName: 'ياسين الصنهاجي',
        rating: 5,
        date: 'منذ يومين',
        sessionType: 'visio',
        comment: 'وفرت أكثر من 22% من قماش الملتون بعد ما راجع معايا ياسين تعشيق الباترون على برنامج Lectra Modaris. الجلسة في Live Visio كانت ممتازة ومشاركة الشاشة خلاتنا نلقاو الخطأ ونصلحوه فـ 10 دقائق.',
        verified: true
      },
      {
        id: 'rev-2',
        authorName: 'كنزة التازي',
        brandName: 'Atelier Kenza Couture',
        city: 'الرباط',
        consultantName: 'فاطمة الزهراء العمراني',
        rating: 5,
        date: 'منذ 4 أيام',
        sessionType: 'office',
        comment: 'استشارة حضورية بمكتب الدار البيضاء لمراجعة باترونات العبايات والفساتين. التعديلات في جدول القياسات جنبتنا مشاكل المقاسات في الكوليكسيون الجديدة. احترافية عالية جداً.',
        verified: true
      },
      {
        id: 'rev-3',
        authorName: 'مهدي العلوي',
        brandName: 'Atlas Active Tech',
        city: 'طنجة',
        consultantName: 'كريم العلمي',
        rating: 5,
        date: 'منذ أسبوع',
        sessionType: 'visio',
        comment: 'جلسة Live Visio حول ملابس الرياضة وتدقيق خيوط الحياكة ودرزات الأوفرلوك. نصائح تقنية دقيقة جداً سهلت علينا صياغة دفتر الشروط والتفاوض مع معمل الخياطة بطنجة.',
        verified: true
      },
      {
        id: 'rev-4',
        authorName: 'سلمى المنصوري',
        brandName: 'Urban Modest Wear',
        city: 'فاس',
        consultantName: 'سلمى المنصوري',
        rating: 5,
        date: 'منذ أسبوعين',
        sessionType: 'visio',
        comment: 'مراجعة وتجربة التلبيس الافتراضي 3D على CLO 3D قبل ما نقطعو الثوب وفرت علينا وقت كبير وتكلفة عينات بالملايين. تجربة مفيدة لكل صاحب علامة أزياء.',
        verified: true
      }
    ];
  });

  // PORTFOLIO LIGHTBOX STATE
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<{ item: any; author: string; proId?: string } | null>(null);

  // GROUPAGE FABRIC GALLERY, COLOR & CALCULATOR STATE
  const [selectedDealForDetail, setSelectedDealForDetail] = useState<GroupageDeal | null>(null);
  const [selectedDealColor, setSelectedDealColor] = useState<Record<string, string>>({});
  const [activeDealImageIdx, setActiveDealImageIdx] = useState<Record<string, number>>({});
  const [dealQuantities, setDealQuantities] = useState<Record<string, number>>({});
  const [dealUnitView, setDealUnitView] = useState<'both' | 'kg' | 'meter'>('both');

  // ─────────────────────────────────────────────────────────────
  // INTERACTIVE REAL GROUPAGE STATE (BOOKINGS, CUSTOM REQUESTS & REPLIES)
  // ─────────────────────────────────────────────────────────────
  const [groupageSubTab, setGroupageSubTab] = useState<'deals' | 'requests'>('deals');
  const [groupageOrders, setGroupageOrders] = useState<GroupageOrder[]>(() => {
    try {
      const saved = localStorage.getItem('beya_groupage_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GROUPAGE_ORDERS;
  });

  const [customRequests, setCustomRequests] = useState<GroupageCustomRequest[]>(() => {
    try {
      const saved = localStorage.getItem('beya_groupage_custom_requests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CUSTOM_REQUESTS;
  });

  // Modal States
  const [bookingModalDeal, setBookingModalDeal] = useState<GroupageDeal | null>(null);
  const [bookingForm, setBookingForm] = useState({
    brandName: '',
    contactName: '',
    phone: '',
    city: 'الدار البيضاء',
    quantity: 25,
    color: '',
    notes: ''
  });
  const [bookingSuccessSlip, setBookingSuccessSlip] = useState<GroupageOrder | null>(null);

  const [showCreateCustomRequestModal, setShowCreateCustomRequestModal] = useState<boolean>(false);
  const [newRequestForm, setNewRequestForm] = useState({
    title: '',
    materialNeeded: '',
    category: 'tissu' as 'tissu' | 'fournitures',
    targetQty: 100,
    unit: 'متر',
    targetPriceMAD: 38,
    brandName: '',
    city: 'الدار البيضاء',
    phone: '',
    description: ''
  });

  const [replyModalRequest, setReplyModalRequest] = useState<GroupageCustomRequest | null>(null);
  const [supplierReplyForm, setSupplierReplyForm] = useState({
    supplierName: 'دار الكريب والأقمشة النسائية (Derb Omar)',
    supplierCity: 'الدار البيضاء',
    priceMAD: 36,
    unit: 'متر',
    minQty: 25,
    deliveryTime: '24 ساعة داخل كازا • 48 ساعة لباقي المدن',
    message: '',
    whatsapp: '212661902834'
  });

  const [expandedDealOrders, setExpandedDealOrders] = useState<Record<string, boolean>>({
    'grp-1': true,
    'grp-5': true
  });

  // Auto initialize bookingForm with user profile when modal opens
  const openBookingModal = (deal: GroupageDeal) => {
    setBookingModalDeal(deal);
    setBookingForm({
      brandName: userProfile.brandName || '',
      contactName: (currentUser as any)?.nom || 'صاحب البراند',
      phone: userProfile.phone || '',
      city: userProfile.city || 'الدار البيضاء',
      quantity: dealQuantities[deal.id] || deal.minCommitment,
      color: selectedDealColor[deal.id] || deal.colors[0]?.name || '',
      notes: ''
    });
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalDeal) return;

    const unitPrice = bookingModalDeal.discountPrice;
    const regularPrice = bookingModalDeal.regularPrice;
    const qty = Number(bookingForm.quantity) || bookingModalDeal.minCommitment;
    const totalPrice = qty * unitPrice;
    const savingsMad = (qty * regularPrice) - totalPrice;

    const newOrder: GroupageOrder = {
      id: 'usr-' + Date.now().toString().slice(-5),
      dealId: bookingModalDeal.id,
      dealTitle: bookingModalDeal.title,
      brandName: bookingForm.brandName.trim() || 'علامتي التجارية',
      contactName: bookingForm.contactName.trim() || 'المسؤول',
      phone: bookingForm.phone.trim() || '0600000000',
      city: bookingForm.city,
      quantity: qty,
      unit: bookingModalDeal.primaryUnitLabelAr,
      color: bookingForm.color || bookingModalDeal.colors[0]?.name || '',
      totalPrice,
      savingsMad,
      status: 'confirmed',
      date: 'الآن (مباشر)'
    };

    const nextOrders = [newOrder, ...groupageOrders];
    setGroupageOrders(nextOrders);
    try {
      localStorage.setItem('beya_groupage_orders', JSON.stringify(nextOrders));
    } catch {}

    // Persist as a Lead for Admin / Suppliers CRM
    try {
      await saveRecord('leads', {
        id: newOrder.id,
        client: newOrder.brandName,
        name: newOrder.contactName,
        phone: newOrder.phone,
        ville: newOrder.city,
        type: '__GROUPAGE_ORDER__',
        details: `حجز شراء مشترك: ${newOrder.dealTitle} | الكمية: ${newOrder.quantity} ${newOrder.unit} | اللون: ${newOrder.color} | الإجمالي: ${newOrder.totalPrice} MAD`,
        date: new Date().toISOString(),
        status: 'completed',
        crmStage: 'confirme',
        createdAt: new Date().toISOString()
      }, true);
    } catch (err) {
      console.warn('Lead save fallback:', err);
    }

    setBookingModalDeal(null);
    setBookingSuccessSlip(newOrder);
  };

  const handleCreateCustomRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestForm.title.trim()) return;

    const newReq: GroupageCustomRequest = {
      id: 'req-' + Date.now().toString().slice(-5),
      title: newRequestForm.title.trim(),
      materialNeeded: newRequestForm.materialNeeded.trim() || newRequestForm.title.trim(),
      category: newRequestForm.category,
      targetQty: Number(newRequestForm.targetQty) || 100,
      unit: newRequestForm.unit,
      targetPriceMAD: Number(newRequestForm.targetPriceMAD) || 35,
      brandName: newRequestForm.brandName.trim() || userProfile.brandName || 'براند جديد',
      city: newRequestForm.city,
      phone: newRequestForm.phone.trim() || userProfile.phone || '0600000000',
      description: newRequestForm.description.trim() || 'طلب تجميع قماش وتوريد بالجملة من مستودعات شبكة BEYA.',
      date: 'الآن (مباشر)',
      status: 'open',
      replies: []
    };

    const nextRequests = [newReq, ...customRequests];
    setCustomRequests(nextRequests);
    try {
      localStorage.setItem('beya_groupage_custom_requests', JSON.stringify(nextRequests));
    } catch {}

    try {
      await saveRecord('leads', {
        id: newReq.id,
        client: newReq.brandName,
        name: newReq.brandName,
        phone: newReq.phone,
        ville: newReq.city,
        type: '__GROUPAGE_REQUEST__',
        details: `طلب تجميع مخصص: ${newReq.title} | الكمية: ${newReq.targetQty} ${newReq.unit} | السعر المقترح: ${newReq.targetPriceMAD} MAD | ${newReq.description}`,
        date: new Date().toISOString(),
        status: 'open',
        crmStage: 'nouveau',
        createdAt: new Date().toISOString()
      }, true);
    } catch (err) {}

    setShowCreateCustomRequestModal(false);
    setGroupageSubTab('requests');
  };

  const handleSendSupplierReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalRequest) return;

    const newReply: GroupageSupplierReply = {
      id: 'rep-' + Date.now().toString().slice(-5),
      supplierName: supplierReplyForm.supplierName.trim() || 'مورد معتمد BEYA',
      supplierCity: supplierReplyForm.supplierCity,
      priceMAD: Number(supplierReplyForm.priceMAD) || 35,
      unit: supplierReplyForm.unit,
      minQty: Number(supplierReplyForm.minQty) || 25,
      deliveryTime: supplierReplyForm.deliveryTime.trim() || '24 إلى 48 ساعة',
      message: supplierReplyForm.message.trim() || 'مرحباً، طلبكم متوفر بالكامل فـ مستودعنا مع إمكانية إرسال العينات مجاناً.',
      whatsapp: supplierReplyForm.whatsapp.trim() || '212675239885',
      date: 'الآن (مباشر)'
    };

    const updated = customRequests.map(r => {
      if (r.id !== replyModalRequest.id) return r;
      return {
        ...r,
        replies: [...r.replies, newReply]
      };
    });

    setCustomRequests(updated);
    try {
      localStorage.setItem('beya_groupage_custom_requests', JSON.stringify(updated));
    } catch {}

    setReplyModalRequest(null);
  };


  // Custom registered pros & suppliers from localStorage
  const [registeredPros] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('beya_network_registered_pros');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Current user's registered pro account if any
  const [myProAccount] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('beya_network_my_pro_account');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

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
      brandName: (saved?.brandName && String(saved.brandName).trim()) || currentUser?.brandName || (currentUser as any)?.store_name || (currentUser as any)?.nom || 'FAS Wear',
      city: (saved?.city && String(saved.city).trim()) || currentUser?.ville || 'الدار البيضاء',
      phone: (saved?.phone && String(saved.phone).trim()) || currentUser?.telephone || '0675239885',
      activity: (saved?.activity && String(saved.activity).trim()) || 'ملابس ستريتوير وهوديات أوفرسايز'
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
      topicAr: 'مالين الثوب: أقمشة الكريب والعبايات، الملتون 340g، الدنيم، الكتان، الجاباردين، وأسعار المتر والكيلو بدرب عمر وطنجة'
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

        {
      id: 'msg-tissu-crepe-1',
      channelId: 'tissu',
      author: 'دار الكريب والأقمشة النسائية (Maison du Crêpe)',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      authorRole: 'مورد معتمد • كريب وعبايات BEYA',
      authorRoleKey: 'tissu',
      city: 'الدار البيضاء • درب عمر مجمع النخبة',
      timestamp: 'اليوم، 14:15',
      content: 'السلام عليكم الإخوان المصممين وأصحاب براندات العبايات، الفساتين والملابس النسائية الراقية 🌸\n\nتنبيه: راه مالين الثوب كل واحد والتخصص ديالو، وحنا فـ دار الكريب متخصصين حصرياً فالأقمشة النسائية المستوردة (كوري وتركي وإيطالي):\n🔹 كريب باربي رويال 220g (Crêpe Barbie): طايح، واقف ومكايتكمشش، أسود ملكي فاحم وألوان باستيل.\n🔹 كريب جورجيت كوري 140g: انسيابي وخفيف بزاف للشيلان والفساتين.\n🔹 كريب سكوبا ستريتش 280g: مخصص للبليزرات والبدلات النسائية الراقية.\n🔹 ساتان دو شيس حريري فاخر للبيجامات والفساتين.\n\n📦 الكوبونات متوفرة ابتداءً من 20 متر مع إرسال بطاقات العينات (Nuancier) مجاناً لأعضاء BEYA VIP.',
      reactions: { '👗': 38, '🔥': 26, '❤️': 19 },
      userReactions: [],
      whatsappContact: '212661902834',
      whatsappMessage: 'السلام عليكم، تواصلت معكم من BEYA NETWORK بخصوص أقمشة الكريب والعبايات.'
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
    // 0. Registered Modélistes & Suppliers (Live newly enrolled members)
    ...registeredPros.map(p => ({
      ...p,
      roleBadge: p.roleBadge ? `🌟 ${p.roleBadge}` : '🌟 عضو مسجل جديد',
      isRegisteredUser: true
    })),
    // 1. Modélistes (Freelancers & Pattern Makers)
    ...MODELISTES_DATA.map(m => {
      const specialtyText = m.headline || m.categoryLabel || (m.specialities && m.specialities.join(' • ')) || 'موديليست وباترون';
      const startingPrice = m.startPriceMAD ? `ابتداءً من ${m.startPriceMAD} MAD` : 'ابتداءً من 180 MAD';
      const softwares = m.software && m.software.length > 0 ? m.software : ['Lectra Modaris', 'CLO 3D'];
      return {
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        cover: m.banner || 'https://images.unsplash.com/photo-1558769132-cb1fac08c04a?auto=format&fit=crop&w=1200&q=80',
        pillar: 'modeliste' as const,
        pillarLabelAr: 'موديليست وباتورناج',
        roleBadge: '✂️ موديليست معتمد',
        roleColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        badgeGradient: 'from-indigo-600 to-purple-600',
        specialty: specialtyText,
        city: m.city || 'الدار البيضاء',
        whatsapp: (m.whatsapp || m.phone || '0675239885').replace(/\D/g, ''),
        phone: m.phone || '0675239885',
        experience: String(m.experienceYears || '5 سنوات').includes('سنوات') ? m.experienceYears : `${m.experienceYears} سنوات خبرة`,
        rating: m.rating || 4.9,
        reviewsCount: m.reviewsCount || 40,
        bio: m.desc || m.about || specialtyText,
        cadSoftware: softwares,
        startingRate: startingPrice,
        rateType: 'للباترون والتدرج',
        skills: [...softwares, 'Gradation XS-XXL', 'Fiche Technique'],
        responseTime: '⚡ رد خلال ساعتين',
        completedJobs: m.completedPatterns || (40 + Math.floor((m.rating || 5) * 8)),
        verified: true,
        category: m.category,
        categoryLabel: m.categoryLabel,
        brandsWorkedWith: m.brandsWorkedWith || [],
        portfolio: m.portfolio || [],
        consultationPriceMAD: m.consultationPriceMAD || 250,
        consultationModes: m.consultationModes || ['visio', 'office'],
        officeAddress: m.officeAddress || '',
        pricing: m.pricing,
        rawProfile: m
      };
    }),
    // 2. Suppliers (Tissu, Fournitures, Impression, Broderie)
    ...SUPPLIERS_DATA.map(s => {
      const pillar = s.category === 'tissu' ? 'tissu' :
                     s.category === 'accessoires' ? 'fournitures' :
                     s.category === 'impression' ? 'impression' :
                     s.category === 'broderie' ? 'broderie' : 'tissu';
      const pillarLabelAr = pillar === 'tissu' ? 'مالين الثوب والأقمشة' :
                            pillar === 'fournitures' ? 'مالين الفورنيتور والمستلزمات' :
                            pillar === 'impression' ? 'مالين الإمبريسيون والطباعة' : 'مالين الطرز والبرودري';
      const roleBadge = pillar === 'tissu' ? (
        (s as any).fabricCategory === 'crepe' ? '👗 كريب وفساتين' :
        (s as any).fabricCategory === 'denim' ? '👖 جينز ودينيم' :
        (s as any).fabricCategory === 'cargo' ? '🦺 جاباردين وكارجو' :
        (s as any).fabricCategory === 'lin' ? '🌿 كتان وبوبلين' :
        (s as any).fabricCategory === 'velours' ? '❄️ مخمل وشتاء' :
        (s as any).fabricCategory === 'streetwear' ? '🧥 ستريتوير ومولطون' : '🧵 مورد ثوب'
      ) :
                        pillar === 'fournitures' ? '📦 فورنيتور' :
                        pillar === 'impression' ? '🎨 إمبريسيون' : '🪡 برودري';
      const roleColor = pillar === 'tissu' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                        pillar === 'fournitures' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                        pillar === 'impression' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                        'bg-rose-500/15 text-rose-300 border-rose-500/30';
      const badgeGradient = pillar === 'tissu' ? 'from-emerald-600 to-teal-600' :
                            pillar === 'fournitures' ? 'from-amber-500 to-orange-600' :
                            pillar === 'impression' ? 'from-sky-500 to-cyan-600' :
                            'from-rose-500 to-pink-600';
      const startingRate = pillar === 'tissu' ? 'ابتداءً من 34 MAD' :
                           pillar === 'fournitures' ? 'ابتداءً من 1.20 MAD' :
                           pillar === 'impression' ? 'ابتداءً من 8 MAD' : 'ابتداءً من 12 MAD';
      const rateType = pillar === 'tissu' ? 'للمتر / الكيلو' :
                       pillar === 'fournitures' ? 'للقطعة / السحاب' :
                       pillar === 'impression' ? 'للطبعة DTF' : 'للطرز 3D';
      const defaultSkills = pillar === 'tissu' ? ['Molleton 340g', 'Coton 100%', 'Jersey', 'Gabardine'] :
                            pillar === 'fournitures' ? ['Zips YKK', 'Polybags Ziplock', 'Cordons Coton', 'Hangtags'] :
                            pillar === 'impression' ? ['DTF HD', 'Sérigraphie Plastisol', 'Puff 3D', 'Cold Peel'] :
                            ['Broderie 3D', 'Mousse 3mm', 'Tajima 12 Têtes', 'Fils Madeira'];
      return {
        id: s.id,
        name: s.name,
        avatar: s.logo,
        cover: s.cover,
        pillar: pillar as 'tissu' | 'fournitures' | 'impression' | 'broderie',
        pillarLabelAr,
        roleBadge,
        roleColor,
        badgeGradient,
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
        startingRate,
        rateType,
        skills: s.fabricTags && s.fabricTags.length > 0 ? s.fabricTags : defaultSkills,
        responseTime: '⚡ رد خلال ساعة',
        completedJobs: 60 + Math.floor(s.rating * 12),
        verified: true,
        specialtyTag: (s as any).specialtyTag || s.categoryLabel,
        fabricCategory: (s as any).fabricCategory || 'all'
      };
    })
  ];

  // Filtered Pro Members for Directory View
  const filteredProMembers = allProMembers.filter(m => {
    if (directoryFilter !== 'all' && m.pillar !== directoryFilter) return false;
    if (directoryFilter === 'tissu' && selectedFabricSpecialty !== 'all') {
      const mCategory = (m as any).fabricCategory;
      const rawSkills = Array.isArray((m as any).skills) ? (m as any).skills : [];
      const skills = rawSkills.map((sk: any) => String(sk || '').toLowerCase());
      let matches = mCategory === selectedFabricSpecialty;
      if (!matches) {
        if (selectedFabricSpecialty === 'crepe') matches = skills.some((s: string) => s.includes('crepe') || s.includes('satin') || s.includes('soie') || s.includes('mousseline') || s.includes('viscose') || s.includes('كريب'));
        else if (selectedFabricSpecialty === 'streetwear') matches = skills.some((s: string) => s.includes('molleton') || s.includes('jersey') || s.includes('interlock') || s.includes('مولطون'));
        else if (selectedFabricSpecialty === 'denim') matches = skills.some((s: string) => s.includes('denim') || s.includes('chambray') || s.includes('جينز'));
        else if (selectedFabricSpecialty === 'cargo') matches = skills.some((s: string) => s.includes('gabardine') || s.includes('canvas') || s.includes('waterproof') || s.includes('كارجو'));
        else if (selectedFabricSpecialty === 'lin') matches = skills.some((s: string) => s.includes('lin') || s.includes('popeline') || s.includes('كتان'));
        else if (selectedFabricSpecialty === 'velours') matches = skills.some((s: string) => s.includes('corduroy') || s.includes('velours') || s.includes('laine') || s.includes('مخمل'));
      }
      if (!matches) return false;
    }
    if (selectedCityFilter !== 'all' && !String(m.city || '').toLowerCase().includes(selectedCityFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const rawSkills = Array.isArray((m as any).skills) ? (m as any).skills : [];
      return String(m.name || '').toLowerCase().includes(q) ||
             String(m.city || '').toLowerCase().includes(q) ||
             String(m.specialty || '').toLowerCase().includes(q) ||
             String((m as any).specialtyTag || '').toLowerCase().includes(q) ||
             String(m.bio || '').toLowerCase().includes(q) ||
             rawSkills.some((sk: any) => String(sk || '').toLowerCase().includes(q));
    }
    return true;
  });

  // ─────────────────────────────────────────────────────────────
    // GROUPAGE DEALS DATA WITH FABRIC DETAILS, PHOTOS & DUAL PRICING (KG / METER)
  // ─────────────────────────────────────────────────────────────
  const groupageDeals: GroupageDeal[] = [
    {
      id: 'grp-1',
      title: 'دفعة أقمشة الملتون الشتوي 340g (Molleton Gratté 100% Coton)',
      category: 'tissu',
      material: 'مولطون شتوي قطن 100% سميك ومبطن مع وبر داخلي ناعم ودافئ (Gratté)',
      supplier: 'مجمع أقمشة الشرق (Derb Omar)',
      supplierCity: 'الدار البيضاء',
      targetKg: 500,
      currentKg: 380,
      participantsCount: 8,
      daysLeft: 4,
      primaryUnit: 'kg',
      primaryUnitLabelAr: 'كلغ (kg)',
      discountPrice: 44,
      regularPrice: 52,
      pricePerMeterEstimated: 20.0,
      regularPricePerMeterEstimated: 23.6,
      metersPerKg: 2.2,
      conversionNote: '1 كلغ يعادل حوالي 2.2 متر فـ الفصالة (بحساب عرض 1.85 متر)',
      garmentYield: 'الهودي أوفرسايز (L/XL) كاياخد تقريباً 0.8 كلغ (~1.75 متر فـ الفصالة)',
      minCommitment: 25,
      minCommitmentLabel: '25 كلغ (رولو واحد = ~55 متر يكفي لـ 31 هودي)',
      status: 'active',
      gsm: '340 GSM (ثقيل وواقف ومثالي للبراندات الراقية)',
      composition: '100% Coton Peigné (خيط ممشط فاخر)',
      width: '1.85 متر (Laize عريضة اقتصادية فالروصي)',
      treatment: 'معالجة ضد التحبيب (Anti-Pilling) + صباغة تفاعلية ثابتة',
      shrinkage: 'أقل من 2.5% بعد الغسيل',
      recommendedUsage: [
        'هوديز أوفرسايز الشتوية (Heavyweight Hoodies)',
        'سراويل السويت بانتس الفاخرة (Sweatpants)',
        'سويت شيرت كرو نيك (Crewneck)',
        'أطقم رياضية شتوية متناسقة (Sets)'
      ],
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80'
      ],
      colors: [
        { name: 'أسود فاحم (Noir Profond)', hex: '#121212', tagAr: 'الأكثر طلباً' },
        { name: 'أوف وايت حليبي (Off-White)', hex: '#EBE5D8', tagAr: 'ترند الشتاء' },
        { name: 'رمادي ميلونج (Gris Chiné)', hex: '#8E9196', tagAr: 'كلاسيك' },
        { name: 'أخضر زيتي ملكي (Vert Bouteille)', hex: '#1C352D', tagAr: 'مميز' },
        { name: 'أزرق كحلي نايڤي (Bleu Marine)', hex: '#14213D', tagAr: 'أساسي' },
        { name: 'بني شوكولا موكا (Moka Brown)', hex: '#3B261D', tagAr: 'فاخر' },
        { name: 'بيج رملي دافئ (Beige Sable)', hex: '#CBBBA2', tagAr: 'طبيعي' }
      ],
      whatsappText: 'السلام عليكم ورشة BEYA، أرغب في حجز كمية من عرض الشراء المشترك لثوب الملتون 340g.'
    },
    {
      id: 'grp-2',
      title: 'صفقة قماش كانفاس قطني سميك 320g للسترات وسراويل الكارجو',
      category: 'tissu',
      material: 'كانفاس كوتون صلب وفاخر 320 GSM نسيج مبرد مائل فائق التحمل',
      supplier: 'أقمشة المسيرة الشمالية (Tissus Nord Tanger)',
      supplierCity: 'طنجة',
      targetKg: 400,
      currentKg: 310,
      participantsCount: 6,
      daysLeft: 6,
      primaryUnit: 'm',
      primaryUnitLabelAr: 'متر (m)',
      discountPrice: 32,
      regularPrice: 40,
      pricePerMeterEstimated: 32.0,
      regularPricePerMeterEstimated: 40.0,
      metersPerKg: 2.1,
      conversionNote: '1 متر كايوزن ~480 غرام فـ عرض 1.50م (السعر يعادل ~64 MAD/كلغ)',
      garmentYield: 'سروال الكارجو بجيوب متعددة كاياخد 1.6 متر | السترة كاتاخد 2.0 متر',
      minCommitment: 30,
      minCommitmentLabel: '30 متر (رولو واحد = يكفي لـ 18 سروال كارجو)',
      status: 'active',
      gsm: '320 GSM (نسيج كانفاس ثقيل ومقاوم للتمزق)',
      composition: '100% Coton Lourd (مظهر أصيل وصلب)',
      width: '1.50 متر (Laize عادية للكانفاس)',
      treatment: 'صباغة ثابتة قابلة لغسيل Stone Wash + متانة استثنائية',
      shrinkage: 'أقل من 2.0%',
      recommendedUsage: [
        'سراويل كارجو بجيوب بارزة (Cargo Pants)',
        'سترات العمل العصرية (Worker Jackets)',
        'أفارولات وجيليهات ستريتوير (Tactical Vests)',
        'حقائب قماشية وتوت باج متينة (Tote Bags)'
      ],
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80'
      ],
      colors: [
        { name: 'كاكي عسكري (Kaki Militaire)', hex: '#485338', tagAr: 'الأكثر مبيعاً' },
        { name: 'أسود كربوني (Noir Charbon)', hex: '#1C1C1E', tagAr: 'أساسي' },
        { name: 'بيج جملي صحراوي (Camel Desert)', hex: '#BC935F', tagAr: 'ورك وير' },
        { name: 'إيكرو ناتشورال (Écru Naturel)', hex: '#EAE5D8', tagAr: 'خام' },
        { name: 'أزرق كحلي ورك وير (Navy Worker)', hex: '#1D2A44', tagAr: 'كلاسيك' }
      ],
      whatsappText: 'السلام عليكم ورشة BEYA، أرغب في حجز كمية من عرض قماش الكانفاس بطنجة.'
    },
    {
      id: 'grp-3',
      title: 'قماش جيرسي قطني ناعم 240g للتيشرتات الأوفرسايز الفاخرة (Heavyweight Jersey)',
      category: 'tissu',
      material: 'جيرسي قطن ممشط 100% سميك ومحكم، ملمس ناعم جداً وغير شفاف',
      supplier: 'مجمع أقمشة الشرق (Derb Omar)',
      supplierCity: 'الدار البيضاء',
      targetKg: 450,
      currentKg: 340,
      participantsCount: 9,
      daysLeft: 5,
      primaryUnit: 'kg',
      primaryUnitLabelAr: 'كلغ (kg)',
      discountPrice: 42,
      regularPrice: 50,
      pricePerMeterEstimated: 17.50,
      regularPricePerMeterEstimated: 20.80,
      metersPerKg: 2.4,
      conversionNote: '1 كلغ يعادل حوالي 2.4 متر فـ الفصالة (بحساب عرض 1.90م)',
      garmentYield: 'التيشرت أوفرسايز (Drop Shoulder) كاياخد 0.38 كلغ (~0.9 متر فقط)',
      minCommitment: 20,
      minCommitmentLabel: '20 كلغ (تكفي لإنتاج ~52 تيشيرت أوفرسايز فاخر)',
      status: 'active',
      gsm: '240 GSM (ثقل راقي للتيشرتات الستريتوير)',
      composition: '100% Coton Peigné 24s/1 (ملمس قطن حريري)',
      width: '1.90 متر (عرض عريض كايوفر الهادر فـ القص)',
      treatment: 'معالجة Carbon Touch لملمس ناعم ضد الحساسية + مضاد للالتواء',
      shrinkage: 'أقل من 2%',
      recommendedUsage: [
        'تيشرتات أوفرسايز بكتف نازل (Drop Shoulder Tees)',
        'تيشرتات بوكسي فت (Boxy Fit Streetwear)',
        'تيشرتات مطبوعة بتقنيات الـ DTF والحريرية'
      ],
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80'
      ],
      colors: [
        { name: 'أبيض ناصع (Blanc Optique)', hex: '#FAF9F6', tagAr: 'أساسي' },
        { name: 'أسود فاحم (Noir Absolu)', hex: '#101010', tagAr: 'الأكثر طلباً' },
        { name: 'أزرق بترولي مطفأ (Bleu Pétrole)', hex: '#263C4D', tagAr: 'أنيق' },
        { name: 'بيج رملي دافئ (Sable Chaud)', hex: '#D7C7B0', tagAr: 'ترند' },
        { name: 'أخضر مريمية خفيف (Sauge)', hex: '#889883', tagAr: 'هادئ' }
      ],
      whatsappText: 'السلام عليكم ورشة BEYA، أرغب في حجز كمية من عرض ثوب الجيرسي 240g للتيشرتات.'
    },
    {
      id: 'grp-4',
      title: 'دفعة سحابات معدنية YKK أصلية نمرة 5 مع أكياس بولي باغ مطبوعة',
      category: 'fournitures',
      material: 'سحابات معدنية أصلية YKK النمرة 5 مقاومة للصدأ + أكياس Polybags Ziplock Mat مع طباعة اللوجو',
      supplier: 'مؤسسة الأناقة للوازم الخياطة والتغليف',
      supplierCity: 'الدار البيضاء',
      targetKg: 1000,
      currentKg: 850,
      participantsCount: 11,
      daysLeft: 3,
      primaryUnit: 'piece',
      primaryUnitLabelAr: 'طقم (قطعة)',
      discountPrice: 1.10,
      regularPrice: 1.80,
      pricePerMeterEstimated: null,
      regularPricePerMeterEstimated: null,
      metersPerKg: null,
      conversionNote: 'كل طقم يشمل سحاب YKK طول 70 سم + كيس بولي باغ بسحاب مات 35x45 سم',
      garmentYield: 'طقم واحد لكل هودي بسحاب أو سترة شتوية جاهزة للتغليف',
      minCommitment: 100,
      minCommitmentLabel: '100 طقم (باك متكامل مع طباعة اللوجو)',
      status: 'closing_soon',
      gsm: 'سحاب معدني YKK #5 + أكياس 80 ميكرون سميكة',
      composition: 'زنك وستانلس غير قابل للتآكل + بولي إيثيلين مات صديق للبيئة',
      width: 'طول السحاب 70 سم (قابل للتقصير حسب الفصالة)',
      treatment: 'طلاء إلكتروستاتيكي عالي المقاومة للغسيل والصدأ',
      shrinkage: 'ثابت 100%',
      recommendedUsage: [
        'هوديز الشتاء بسحاب كامل (Full Zip Hoodies)',
        'جاكيتات البومبر والسترات الشتوية (Jackets)',
        'تغليف وتقديم البراند بشكل احترافي للزبون'
      ],
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80'
      ],
      colors: [
        { name: 'فضي نيكل كلاسيك (Silver)', hex: '#C0C0C0', tagAr: 'ستاندرد' },
        { name: 'نحاسي عتيق (Antique Brass)', hex: '#9E7245', tagAr: 'فينتاج' },
        { name: 'أسود جنميتال مطفأ (Matte Gunmetal)', hex: '#262626', tagAr: 'فخم' }
      ],
      whatsappText: 'السلام عليكم ورشة BEYA، أريد الانضمام لصفقة سحابات YKK وأكياس البولي باغ.'
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
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/network/register"
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-2xl font-black text-sm transition shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>تسجيل حساب مهني (موديليست / مورد) 🚀</span>
          </Link>

          <button
            onClick={() => navigate('/portal')}
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm transition border border-white/10 flex items-center gap-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى لوحة تحكم الطلبيات (BEYAPORTAL)</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN DISCORD INTERFACE RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${activeView === 'chat' ? 'bg-[#1e1f22] text-[#dbdee1]' : 'bg-[#f9fafb] text-slate-900'} flex flex-col select-none antialiased overflow-hidden h-screen`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif' }} dir="rtl">

      {/* TOP HEADER BAR (APPLE / UPWORK DESIGN SYSTEM) */}
      <header className="h-16 bg-white border-b border-[#e4ebe4] px-4 sm:px-8 flex items-center justify-between shrink-0 z-30 shadow-xs gap-3 w-full">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Drawer Hamburger (Chat Only) */}
          {activeView === 'chat' && (
            <button
              onClick={() => setMobileDrawer(prev => prev === 'channels' ? 'none' : 'channels')}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
              title="القنوات"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Clean Apple Typography Logo - Fixed LTR Alignment */}
          <div dir="ltr" className="flex items-center gap-2 cursor-pointer select-none" onClick={() => { setActiveView('freelance'); setFreelanceTab('talents'); }}>
            <span className="font-extrabold text-2xl tracking-tighter text-slate-900 font-sans">BEYA</span>
            <span className="text-[10px] font-bold tracking-widest text-[#108a00] uppercase bg-[#f2f7f2] px-2 py-0.5 rounded-full border border-[#e4ebe4]">
              NETWORK
            </span>
          </div>
        </div>

        {/* Center: Apple / Upwork Navigation Tabs (Clean Text Only - Zero Emojis) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-1">
          <button
            onClick={() => { setActiveView('freelance'); setFreelanceTab('talents'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeView === 'freelance' && freelanceTab === 'talents'
                ? 'bg-[#108a00] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#108a00] hover:bg-slate-100'
            }`}
          >
            توظيف الكفاءات
          </button>

          <button
            onClick={() => { setActiveView('freelance'); setFreelanceTab('jobs'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'freelance' && freelanceTab === 'jobs'
                ? 'bg-[#108a00] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#108a00] hover:bg-slate-100'
            }`}
          >
            <span>مشاريع الإنتاج</span>
            {(workerRole === 'designer' || workerRole === 'consultant') ? (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeView === 'freelance' && freelanceTab === 'jobs'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-[#108a00]'
              }`}>
                {jobsList.length}
              </span>
            ) : (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                activeView === 'freelance' && freelanceTab === 'jobs'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <Lock className="w-2.5 h-2.5" />
                <span>للمهنيين</span>
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveView('consulting'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeView === 'consulting'
                ? 'bg-[#108a00] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#108a00] hover:bg-slate-100'
            }`}
          >
            الاستشارات التقنية
          </button>

          <button
            onClick={() => { setActiveView('directory'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeView === 'directory'
                ? 'bg-[#108a00] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#108a00] hover:bg-slate-100'
            }`}
          >
            دليل الموردين
          </button>

          <button
            onClick={() => { setActiveView('groupage'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeView === 'groupage'
                ? 'bg-[#108a00] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#108a00] hover:bg-slate-100'
            }`}
          >
            الشراء المشترك
          </button>

          <button
            onClick={() => { setActiveView('chat'); setMobileDrawer('none'); }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeView === 'chat'
                ? 'bg-[#108a00] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#108a00] hover:bg-slate-100'
            }`}
          >
            مجتمع BEYA
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Post Job CTA Button (Upwork Green) */}
          <button
            onClick={() => {
              setJobPostedSuccessSlip(null);
              setShowPostJobModal(true);
            }}
            className="px-4 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs sm:text-sm transition shadow-xs cursor-pointer shrink-0"
            title="نشر مشروع أو طلب فصالة وباترون جديد"
          >
            + نشر مشروع
          </button>

          {/* Pro Registration & Anti-Fraud Status in Header */}
          {workerRole === 'guest' ? (
            <button
              onClick={() => {
                setProRegisterSlip(null);
                setShowProRegisterModal(true);
              }}
              className="hidden md:inline-flex px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-[#108a00] hover:text-[#108a00] text-slate-700 font-semibold text-xs transition cursor-pointer items-center gap-1.5 shrink-0"
              title="طلب اعتماد كمهني (موديليست أو مستشار تقني)"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#108a00]" />
              <span>تسجيل مهني معتمد</span>
            </button>
          ) : workerRole === 'pending' ? (
            <button
              onClick={() => setShowProRegisterModal(true)}
              className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs transition cursor-pointer items-center gap-1.5 shrink-0"
              title="ملفك قيد المراجعة الأمنية والإدارية"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>قيد التدقيق الأمني</span>
            </button>
          ) : (
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2f7f2] border border-[#d4e5d4] text-[#108a00] text-xs font-bold shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{workerRole === 'designer' ? 'موديليست معتمد' : 'مستشار تقني معتمد'}</span>
              <button
                onClick={() => {
                  setWorkerRole('guest');
                  try { localStorage.removeItem('beya_worker_role'); } catch {}
                }}
                className="text-[10px] text-slate-400 hover:text-slate-700 mr-1 underline cursor-pointer"
                title="الرجوع إلى وضع الزائر المقفل للمعالجة"
              >
                خروج
              </button>
            </div>
          )}

          {/* Members Sidebar Toggle (Chat Only) */}
          {activeView === 'chat' && (
            <button
              onClick={() => setMobileDrawer(prev => prev === 'members' ? 'none' : 'members')}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
              title="الأعضاء"
            >
              <Users className="w-3.5 h-3.5 text-[#108a00]" />
              <span className="hidden xl:inline text-[11px]">الأعضاء ({allProMembers.length})</span>
            </button>
          )}

          {/* Return to BEYAPORTAL Button (Apple Outline Style) */}
          <button
            onClick={() => navigate('/portal')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5"
            title="الرجوع إلى لوحة BEYAPORTAL"
          >
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="shrink-0">BEYAPORTAL</span>
          </button>
        </div>
      </header>

      {/* MAIN PLATFORM WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ─────────────────────────────────────────────────────────────
            COLUMN 1: DISCORD CHANNELS SIDEBAR (ONLY IN DISCORD CHAT VIEW)
        ───────────────────────────────────────────────────────────── */}
        {activeView === 'chat' && (
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
                  {((userProfile?.brandName || 'B').charAt(0)).toUpperCase()}
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-[#232428]" />
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-white truncate leading-tight">{userProfile.brandName}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{String(userProfile?.city || 'المغرب').split('•')[0]}</p>
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          COLUMN 2: MAIN WORKSPACE (FULL WIDTH FOR FREELANCE & DIRECTORY)
      ───────────────────────────────────────────────────────────── */}
      <main className={`flex-1 ${activeView === 'chat' ? 'bg-[#313338] text-[#dbdee1]' : 'bg-[#f9fafb] text-slate-900'} flex flex-col overflow-hidden min-w-0`}>

          {/* VIEW: MODELISTES & PATTERN MAKERS MARKETPLACE (APPLE TYPOGRAPHY & UPWORK LIGHT DESIGN SYSTEM) */}
          {activeView === 'freelance' && (
            <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f9fafb] text-slate-900">

              {/* ── 1. APPLE / UPWORK HERO CONTAINER (SCREENSHOT 1: DEEP EMERALD #13544e CONTAINER) ── */}
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6 pb-2">
                <div className="rounded-[28px] sm:rounded-[36px] bg-[#13544e] text-white p-7 sm:p-12 relative overflow-hidden shadow-xs">
                  {/* Subtle Background Glow Accent */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                  {/* Mode Switcher Pill (Upwork [ Hire | Work ] Toggle) */}
                  <div className="inline-flex items-center p-1 bg-black/25 backdrop-blur-md rounded-full border border-white/10 mb-6">
                    <button
                      onClick={() => setFreelanceTab('talents')}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                        freelanceTab === 'talents'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      توظيف الكفاءات
                    </button>
                    <button
                      onClick={() => setFreelanceTab('jobs')}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        freelanceTab === 'jobs'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <span>مشاريع الإنتاج</span>
                      {(workerRole === 'designer' || workerRole === 'consultant') ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/10 text-slate-900 font-mono">
                          {jobsList.length}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-normal flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>خاص بالمهنيين</span>
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Bold Apple Headline */}
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl">
                    {freelanceTab === 'talents'
                      ? 'صمّم ونفّذ كوليكسيون أزياءك بأعلى معايير الدقة الهندسية'
                      : (workerRole === 'designer' || workerRole === 'consultant')
                        ? 'تصفح مشاريع وطلبات الإنتاج الصناعي وقدّم عروضك مباشرة'
                        : 'فضاء طلبات الإنتاج مشفر ومحمي لمنع التجسس التجاري بين العلامات'}
                  </h1>

                  {/* Refined Subtitle */}
                  <p className="text-sm sm:text-base text-white/85 mt-4 max-w-2xl leading-relaxed font-normal">
                    {freelanceTab === 'talents'
                      ? 'المنصة المهنية المخصصة لدور الأزياء والمصانع للتعاقد مع نخبة مهندسي الباترون والموديليست المعتمدين في برامج Lectra Modaris و CLO 3D مع حماية المستحقات عبر BEYA Escrow.'
                      : (workerRole === 'designer' || workerRole === 'consultant')
                        ? 'تصفح طلبات الفصالة والباترون الصناعي المعروضة من علامات الأزياء والمصانع بالمغرب، قدّم عرضك المالي والتقني، واضمن صرف مستحقاتك بالكامل.'
                        : 'لحماية سرية الكوليكسيونات والتصاميم قبل نزولها للأسواق، لا تظهر طلبات الإنتاج إلا للموديليست والمهنيين المعتمدين بعد التحقق الإداري من هوياتهم.'}
                  </p>

                  {/* CTA Buttons Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-8">
                    {freelanceTab === 'talents' ? (
                      <>
                        <button
                          onClick={() => {
                            const el = document.getElementById('explore-categories-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 py-3.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-sm transition shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                          <span>ابدأ الآن واستكشف الكفاءات</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setJobPostedSuccessSlip(null);
                            setShowPostJobModal(true);
                          }}
                          className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-sm transition border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                        >
                          <span>+ نشر مشروع جديد</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setJobPostedSuccessSlip(null);
                            setShowPostJobModal(true);
                          }}
                          className="px-6 py-3.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-sm transition shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                          <span>+ نشر طلب فصالة أو مشروع إنتاج</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFreelanceTab('talents')}
                          className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-sm transition border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                        >
                          <span>تصفح ملفات الموديليست</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Clean 4 Points Bar (Text + Lucide SVG Icons Only - Zero Emojis) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-8 border-t border-white/10 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>حماية مستحقات BEYA Escrow بنسبة 100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>مشاريع موثقة من علامات ومصانع مغربية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>ملفات معتمدة Lectra Modaris & CLO 3D</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>تحويل بنكي محلي (CIH / التجاري) و PayPal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. CATEGORY EXPLORER & NAVIGATION TABS (SCREENSHOT 2: CLEAN WHITE SYSTEM) ── */}
              {(freelanceTab === 'talents' || (workerRole === 'designer' || workerRole === 'consultant')) && (
                <>
                  <section id="explore-categories-section" className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e4ebe4]">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {freelanceTab === 'talents'
                        ? 'ابحث عن مهندسي الباترون حسب التخصص'
                        : 'تصفح طلبات الإنتاج حسب الفئة'}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      اختر القسم المناسب لمشروعك واكتشف نخبة الكفاءات المتخصصة
                    </p>
                  </div>

                  {/* Sub Mode Switcher */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shrink-0">
                    <button
                      onClick={() => setFreelanceTab('talents')}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        freelanceTab === 'talents'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      الكفاءات المعتمدة
                    </button>
                    <button
                      onClick={() => setFreelanceTab('jobs')}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        freelanceTab === 'jobs'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>مشاريع الإنتاج</span>
                      {(workerRole === 'designer' || workerRole === 'consultant') ? (
                        <span className="font-mono text-[11px]">({jobsList.length})</span>
                      ) : (
                        <Lock className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Horizontal Category Tabs with Upwork Signature Green Bottom Border */}
                <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pt-2 border-b border-[#e4ebe4]">
                  {[
                    { id: 'all', label: 'كافة التخصصات' },
                    { id: 'streetwear', label: 'ستريت وير وهوديز' },
                    { id: 'denim', label: 'جينز وكارجو ودينيم' },
                    { id: 'femme', label: 'أزياء نسائية ومودست' },
                    { id: 'sport', label: 'ملابس رياضية وتقنية' }
                  ].map(cat => {
                    const isCurrent = freelanceTab === 'talents'
                      ? freelanceCategoryFilter === cat.id
                      : jobCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          if (freelanceTab === 'talents') setFreelanceCategoryFilter(cat.id as any);
                          else setJobCategoryFilter(cat.id as any);
                        }}
                        className={`py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
                          isCurrent
                            ? 'border-[#108a00] text-[#108a00]'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* 6 Category Explorer Cards Grid (Exact Pattern from Screenshot 2) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 py-6">
                  {[
                    { id: 'streetwear', title: 'Streetwear & Hoodies', arTitle: 'ستريت وير وهوديز', count: '120+ باترون متاح' },
                    { id: 'denim', title: 'Denim & Cargo Pants', arTitle: 'جينز وكارجو', count: '85+ باترون متاح' },
                    { id: 'femme', title: 'Modest & Couture', arTitle: 'أزياء نسائية ومودست', count: '140+ باترون متاح' },
                    { id: 'sport', title: 'Activewear Tech', arTitle: 'ملابس رياضية', count: '65+ باترون متاح' },
                    { id: 'all', title: 'Gradation & CAD', arTitle: 'تدريج المقاسات وباترون', count: '95+ باترون متاح' },
                    { id: 'all', title: '3D Virtual Fitting', arTitle: 'محاكاة 3D وتلبيس', count: '45+ موديل متاح' }
                  ].map((card, idx) => {
                    const isSelected = (freelanceTab === 'talents' ? freelanceCategoryFilter === card.id : jobCategoryFilter === card.id);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (card.id !== 'all') {
                            if (freelanceTab === 'talents') setFreelanceCategoryFilter(card.id as any);
                            else setJobCategoryFilter(card.id as any);
                          }
                        }}
                        className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition shadow-xs hover:shadow-md ${
                          isSelected ? 'border-[#108a00] ring-1 ring-[#108a00]' : 'border-[#e4ebe4] hover:border-[#108a00]'
                        }`}
                      >
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {card.arTitle}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                            {card.title}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#f2f4f2] flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {card.count}
                          </span>
                          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#108a00] transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── 3. SEARCH & FILTER CONTROLS BAR ("PAGE BOX DIAL ROCHIRCH") ── */}
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-4">
                <div className="bg-white rounded-2xl border border-[#e4ebe4] p-3 shadow-xs flex flex-col md:flex-row items-center gap-3">
                  {/* Clean Rounded-XL Apple Style Search Box */}
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
                    <input
                      type="text"
                      placeholder={
                        freelanceTab === 'talents'
                          ? "ابحث بالاسم، المدينة، التخصص، أو البرامج (Lectra Modaris, CLO 3D, Gerber)..."
                          : "ابحث في طلبات المشاريع (مثال: باترون هودي، كارجو، عبايات، كوليكسيون، الدار البيضاء...)"
                      }
                      value={freelanceTab === 'talents' ? searchQuery : jobSearchQuery}
                      onChange={e => {
                        if (freelanceTab === 'talents') setSearchQuery(e.target.value);
                        else setJobSearchQuery(e.target.value);
                      }}
                      className="w-full bg-[#f9fafb] text-sm text-slate-900 placeholder-slate-500 pr-11 pl-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none transition"
                    />
                    {((freelanceTab === 'talents' ? searchQuery : jobSearchQuery)) && (
                      <button
                        onClick={() => {
                          if (freelanceTab === 'talents') setSearchQuery('');
                          else setJobSearchQuery('');
                        }}
                        className="absolute left-3 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Budget Filter for Production Orders */}
                  {freelanceTab === 'jobs' && (
                    <div className="flex items-center gap-1.5 shrink-0 text-xs w-full md:w-auto overflow-x-auto py-1">
                      <span className="text-slate-500 font-semibold shrink-0">الميزانية:</span>
                      {[
                        { id: 'all', label: 'الكل' },
                        { id: 'under500', label: '< 500 DH' },
                        { id: '500to1500', label: '500 - 1500 DH' },
                        { id: 'above1500', label: '> 1500 DH' }
                      ].map(b => (
                        <button
                          key={b.id}
                          onClick={() => setJobBudgetFilter(b.id as any)}
                          className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer text-xs whitespace-nowrap ${
                            jobBudgetFilter === b.id
                              ? 'bg-[#108a00] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Post Job CTA in Filter Bar */}
                  <button
                    onClick={() => {
                      setJobPostedSuccessSlip(null);
                      setShowPostJobModal(true);
                    }}
                    className="w-full md:w-auto px-4 py-2.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>نشر مشروع</span>
                  </button>
                </div>
              </div>
            </>
          )}

              {/* ── 4A. TAB 1: PRODUCTION PROJECTS FEED (مشاريع وطلبات الإنتاج المعلنة) ── */}
              {freelanceTab === 'jobs' && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-12 space-y-6">
                  {/* ─────────────────────────────────────────────────────────────
                      CASE 1: CLIENT OR GUEST (BRAND CONFIDENTIALITY & ANTI-ESPIONAGE WALL)
                      لحماية أصحاب البراندات من تجسس المنافسين على موديلاتهم ومشاريعهم قيد الإنتاج
                  ───────────────────────────────────────────────────────────── */}
                  {(workerRole !== 'designer' && workerRole !== 'consultant') ? (
                    <div className="space-y-6">
                      {/* Sub-section: If current client has posted their own projects */}
                      {(() => {
                        const myProjects = jobsList.filter(j => myPostedJobIds.includes(j.id));
                        if (myProjects.length === 0) return null;
                        return (
                          <div className="bg-white rounded-3xl border border-emerald-300 p-6 sm:p-7 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#108a00] flex items-center justify-center shrink-0 border border-emerald-200">
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span>مشاريعك الخاصة المنشورة</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#108a00] font-bold">
                                      {myProjects.length} طلب نشط
                                    </span>
                                  </h3>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    هذه المشاريع خاصة بعلامتك التجارية فقط، ومحجوبة تماماً عن كافة المنافسين في السوق، وتظهر حصرياً للموديليست المعتمدين لتقديم عروضهم.
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setJobPostedSuccessSlip(null);
                                  setShowPostJobModal(true);
                                }}
                                className="px-4 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>+ نشر طلب إضافي</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {myProjects.map(job => (
                                <div key={job.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-bold text-slate-900 text-sm">{job.title}</span>
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        قيد استقبال العروض
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-medium">
                                        {job.city}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                      <span>الميزانية المرصودة: <strong className="text-slate-900">{job.budgetMAD} DH</strong></span>
                                      <span>•</span>
                                      <span>طريقة التسليم: {job.workMode === 'paper' ? 'ورقي (Plotter 1:1)' : 'ديجيتال (DXF)'}</span>
                                    </div>
                                  </div>

                                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>يصل طلبك مباشرة للموديليست المعتمدين عبر الواتساب</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Main Anti-Espionage Wall Card */}
                      <div className="bg-white rounded-3xl border border-[#e4ebe4] p-6 sm:p-10 shadow-xs space-y-8 text-slate-900">
                        {/* Header & Badges */}
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                            <Shield className="w-3.5 h-3.5 text-[#108a00]" />
                            <span>نظام حماية الملكية الفكرية وسرية العلامات التجارية (Anti-Espionage Shield)</span>
                          </div>

                          <div className="w-16 h-16 rounded-2xl bg-[#f2f7f2] border border-[#d4e5d4] text-[#108a00] flex items-center justify-center mx-auto shadow-inner">
                            <Lock className="w-8 h-8" />
                          </div>

                          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                            فضاء طلبات الإنتاج محمي ومخصص حصرياً للموديليست والمهنيين المعتمدين
                          </h2>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            احتراماً لسرية التصاميم ومنعاً لأي تجسس تجاري بين العلامات التجارية المنافسة على نوعيات الأقمشة والقصات والموديلات قيد التحضير، تخضع كافة مشاريع الإنتاج لحماية مشددة.
                            <br className="hidden sm:inline" />
                            <strong> لا تظهر تفاصيل المشاريع لعملاء أو زوار آخرين</strong>، بل تفتح حصرياً للموديليست والباترونيست المؤهلين بعد التحقق الإداري من هوياتهم وخبراتهم الفنية.
                          </p>
                        </div>

                        {/* Two Clear Dedicated Pathways */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          {/* Box 1: For Brands / Clients */}
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-[#f2f7f2] border border-[#d4e5d4] flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-[#d4e5d4] text-[#108a00] flex items-center justify-center shadow-xs">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-[#108a00] tracking-wide uppercase">أنت صاحب علامة تجارية أو مصنع أزياء؟</span>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">انشر مشروعك في سرية تامة</h3>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                انشر طلب الفصالة أو الكوليكسيون وسلّم مواصفاتك بأمان تام. مشروعك سيكون مشفراً ومحجوباً عن جميع المنافسين في السوق، وسيصل مباشرة للموديليست المعتمدين لتقديم أفضل الأسعار والعروض.
                              </p>
                            </div>

                            <div className="space-y-2 pt-2">
                              <button
                                onClick={() => {
                                  setJobPostedSuccessSlip(null);
                                  setShowPostJobModal(true);
                                }}
                                className="w-full py-3 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                              >
                                <PlusCircle className="w-4 h-4" />
                                <span>+ انشر طلبك الآن في سرية تامة (يراه فقط الموديليست)</span>
                              </button>

                              <button
                                onClick={() => setFreelanceTab('talents')}
                                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-full text-xs transition border border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Users className="w-4 h-4 text-slate-500" />
                                <span>تصفح دليل الكفاءات والموديليست للتواصل المباشر</span>
                              </button>
                            </div>
                          </div>

                          {/* Box 2: For Modélistes / Technicians */}
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-xs">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-indigo-600 tracking-wide uppercase">أنت موديليست أو باترونيست صناعي؟</span>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">احصل على الاعتماد المهني لفتح المشاريع</h3>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                تصفح طلبات الفصالة والباترون اليومية المعروضة من علامات الأزياء والمصانع، تواصل مع أصحاب البراندات مباشرة عبر الواتساب، واضمن كامل مستحقاتك عبر BEYA Escrow Protection.
                              </p>
                            </div>

                            <div className="space-y-2 pt-2">
                              {workerRole === 'pending' ? (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                  <span>طلب اعتمادك قيد المراجعة الإدارية. سيتم فتح المشاريع فور المصادقة على هويتك.</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setProRegisterSlip(null);
                                    setShowProRegisterModal(true);
                                  }}
                                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                                >
                                  <Lock className="w-4 h-4" />
                                  <span>طلب اعتماد مهني (فتح طلبات الإنتاج)</span>
                                </button>
                              )}

                              <button
                                onClick={() => setActiveView('consulting')}
                                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-full text-xs transition border border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Video className="w-4 h-4 text-slate-500" />
                                <span>فضاء الاستشارات وتوجيه البراندات</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Admin Mode Quick Switcher Bar (For Testing & Verification) */}
                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold">وضع المعاينة الإدارية الفورية (Admin Preview):</span>
                              <span className="text-slate-600 mr-1.5">اضغط لمعاينة قائمة المشاريع كما يراها الموديليست المعتمد</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setWorkerRole('designer');
                                try { localStorage.setItem('beya_worker_role', 'designer'); } catch {}
                              }}
                              className="px-3.5 py-1.5 bg-[#108a00] hover:bg-[#14a800] text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                            >
                              تفعيل موديليست معتمد (فتح المشاريع)
                            </button>
                            <button
                              onClick={() => {
                                setWorkerRole('consultant');
                                try { localStorage.setItem('beya_worker_role', 'consultant'); } catch {}
                              }}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                            >
                              تفعيل مستشار تقني
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ─────────────────────────────────────────────────────────────
                        CASE 2: APPROVED MODÉLISTE OR CONSULTANT (FULL PROJECT FEED)
                        يظهر حصرياً للموديليست المعتمدين والمستشارين التقنيين
                    ───────────────────────────────────────────────────────────── */
                    <div className="space-y-4">
                      {/* Approved Status Bar */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f2f7f2] border border-[#d4e5d4] text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#108a00] flex items-center justify-center shrink-0">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <span>أنت تتصفح المنصة بصفتك: <strong>{workerRole === 'designer' ? 'موديليست وباترونيست صناعي معتمد' : 'خبير ومستشار تقني في صناعة الأزياء'}</strong></span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#108a00] font-bold border border-[#b2d8b2]">كامل الصلاحيات</span>
                            </h4>
                            <p className="text-[11px] text-slate-600">
                              مشاريع الإنتاج، الميزانيات المرصودة، أرقام واتساب المصانع والبراندات، وإمكانية تقديم العروض مفتوحة لك بالكامل.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setWorkerRole('guest');
                            try { localStorage.removeItem('beya_worker_role'); } catch {}
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer shrink-0"
                        >
                          معاينة المنصة كعميل (حجب المشاريع لمنع التجسس)
                        </button>
                      </div>

                      {/* Results Counter */}
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span>
                          عرض <strong className="text-slate-900 font-semibold">{
                            jobsList
                              .filter(j => jobCategoryFilter === 'all' || j.category === jobCategoryFilter)
                              .filter(j => {
                                if (jobBudgetFilter === 'under500') return j.budgetMAD < 500;
                                if (jobBudgetFilter === '500to1500') return j.budgetMAD >= 500 && j.budgetMAD <= 1500;
                                if (jobBudgetFilter === 'above1500') return j.budgetMAD > 1500;
                                return true;
                              })
                              .filter(j => {
                                if (!jobSearchQuery.trim()) return true;
                                const q = jobSearchQuery.toLowerCase();
                                return j.title.toLowerCase().includes(q) ||
                                  j.brand.toLowerCase().includes(q) ||
                                  j.description.toLowerCase().includes(q) ||
                                  j.city.toLowerCase().includes(q) ||
                                  (j.skills || []).some((s: string) => s.toLowerCase().includes(q));
                              }).length
                          }</strong> طلب إنتاج متاح للتقديم
                        </span>
                        {(jobSearchQuery || jobCategoryFilter !== 'all' || jobBudgetFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setJobSearchQuery('');
                              setJobCategoryFilter('all');
                              setJobBudgetFilter('all');
                            }}
                            className="text-[#108a00] hover:underline font-semibold cursor-pointer"
                          >
                            إعادة ضبط الفلاتر
                          </button>
                        )}
                      </div>

                      {/* Clean White Project Cards */}
                      <div className="space-y-4">
                        {jobsList
                          .filter(j => jobCategoryFilter === 'all' || j.category === jobCategoryFilter)
                          .filter(j => {
                            if (jobBudgetFilter === 'under500') return j.budgetMAD < 500;
                            if (jobBudgetFilter === '500to1500') return j.budgetMAD >= 500 && j.budgetMAD <= 1500;
                            if (jobBudgetFilter === 'above1500') return j.budgetMAD > 1500;
                            return true;
                          })
                          .filter(j => {
                            if (!jobSearchQuery.trim()) return true;
                            const q = jobSearchQuery.toLowerCase();
                            return j.title.toLowerCase().includes(q) ||
                              j.brand.toLowerCase().includes(q) ||
                              j.description.toLowerCase().includes(q) ||
                              j.city.toLowerCase().includes(q) ||
                              (j.skills || []).some((s: string) => s.toLowerCase().includes(q));
                          })
                          .map(job => (
                            <div
                              key={job.id}
                              className="bg-white rounded-2xl border border-[#e4ebe4] hover:border-[#108a00] hover:shadow-md transition p-6 space-y-4"
                            >
                              {/* Top Header Row */}
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                      <Building2 className="w-4 h-4 text-slate-600" />
                                      <span>{job.brand}</span>
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-500" />
                                      <span>{job.city}</span>
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] text-xs font-semibold border border-[#d4e5d4]">
                                      {job.workMode === 'paper' ? 'تسليم ورقي (Plotter 1:1)' :
                                       job.workMode === 'both' ? 'ديجيتال + ورقي مطبوع' :
                                       'صيغة ديجيتال (DXF / 3D)'}
                                    </span>
                                    {job.urgent && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                                        مستعجل
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-1 leading-snug">
                                    {job.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>نشر {job.postedAt}</span>
                                    <span>•</span>
                                    <span>القسم: {job.categoryLabel}</span>
                                  </div>
                                </div>

                                <div className="text-right sm:text-left shrink-0 bg-[#f9fafb] p-3 rounded-xl border border-slate-100">
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end sm:justify-start">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#108a00]" />
                                    <span>ميزانية مضمونة Escrow</span>
                                  </div>
                                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                                    {job.budgetMAD} <span className="text-xs font-sans text-slate-600 font-semibold">MAD</span>
                                  </div>
                                </div>
                              </div>

                              {/* Job Description (Full Details for Modéliste) */}
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#f9fafb] p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                                {job.description}
                              </p>

                              {/* Required Skills */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-500 ml-1">المهارات والبرامج:</span>
                                {(job.skills || []).map((skill: string, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="px-2.5 py-1 rounded-full bg-[#f2f7f2] text-[#108a00] text-xs font-semibold border border-[#d4e5d4]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>

                              {/* Actions Footer */}
                              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <MessageSquare className="w-4 h-4 text-[#108a00]" />
                                  <span>
                                    تم تقديم <strong className="text-slate-900 font-semibold">{job.proposalsCount || 0}</strong> عروض على هذا الطلب
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                  <a
                                    href={`https://wa.me/${job.contactWhatsapp || '212675239885'}?text=${encodeURIComponent(
                                      `السلام عليكم أخي بخصوص طلبك في BEYA NETWORK:\n"${job.title}"\nأنا موديليست معتمد ومستعد لتنفيذ العمل بميزانية ${job.budgetMAD} درهم.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 text-xs transition flex items-center justify-center gap-1.5"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>واتساب العميل</span>
                                  </a>

                                  <button
                                    onClick={() => {
                                      setSelectedJobForProposal(job);
                                      setProposalPrice(job.budgetMAD);
                                      setProposalDuration('يومان (48 ساعة)');
                                      setProposalMessage(`السلام عليكم، اطلعت على تفاصيل طلبك بخصوص ${job.title}. لدي خبرة كبيرة في إنجاز هذا النوع من الباترونات وتدريج المقاسات بدقة عالية على برنامج Lectra Modaris و CLO 3D، وجاهز لتسليم ملفات DXF AAMA صالحة للقص وبطاقة تقنية متكاملة.`);
                                      setProposalAuthorName(userProfile.name || '');
                                      setProposalAuthorPhone('');
                                      setProposalSubmittedSlip(null);
                                      setShowProposalModal(true);
                                    }}
                                    className="flex-1 sm:flex-initial px-5 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>تقديم عرض على المشروع</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* ── 4B. TAB 2: VERIFIED TALENTS DIRECTORY (دليل الكفاءات والموديليست المعتمدين) ── */}
              {freelanceTab === 'talents' && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-12 space-y-4">
                  {/* Results Counter */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                      عرض <strong className="text-slate-900 font-semibold">{
                        allProMembers
                          .filter(m => m.pillar === 'modelistes')
                          .filter(m => {
                            if (freelanceCategoryFilter === 'all') return true;
                            if (freelanceCategoryFilter === 'streetwear') return m.category === 'streetwear';
                            if (freelanceCategoryFilter === 'denim') return m.category === 'denim';
                            if (freelanceCategoryFilter === 'femme') return m.category === 'femme' || m.category === 'tailoring';
                            if (freelanceCategoryFilter === 'sport') return m.category === 'sport';
                            return true;
                          })
                          .filter(m => {
                            if (!searchQuery.trim()) return true;
                            const q = searchQuery.toLowerCase();
                            const brands = (m.brandsWorkedWith || []).join(' ').toLowerCase();
                            return m.name.toLowerCase().includes(q) ||
                              m.city.toLowerCase().includes(q) ||
                              (m.bio || '').toLowerCase().includes(q) ||
                              brands.includes(q) ||
                              (m.cadSoftware || []).join(' ').toLowerCase().includes(q);
                          }).length
                      }</strong> كفاءة معتمدة في صناعة الأزياء والباترون
                    </span>
                    {(searchQuery || freelanceCategoryFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFreelanceCategoryFilter('all');
                        }}
                        className="text-[#108a00] hover:underline font-semibold cursor-pointer"
                      >
                        إعادة ضبط الفلاتر
                      </button>
                    )}
                  </div>

                  {/* Clean White Talent Cards (Matching Screenshot 2 Lower Section) */}
                  <div className="space-y-5">
                    {allProMembers
                      .filter(m => m.pillar === 'modelistes')
                      .filter(m => {
                        if (freelanceCategoryFilter === 'all') return true;
                        if (freelanceCategoryFilter === 'streetwear') return m.category === 'streetwear';
                        if (freelanceCategoryFilter === 'denim') return m.category === 'denim';
                        if (freelanceCategoryFilter === 'femme') return m.category === 'femme' || m.category === 'tailoring';
                        if (freelanceCategoryFilter === 'sport') return m.category === 'sport';
                        return true;
                      })
                      .filter(m => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        const brands = (m.brandsWorkedWith || []).join(' ').toLowerCase();
                        return m.name.toLowerCase().includes(q) ||
                          m.city.toLowerCase().includes(q) ||
                          (m.bio || '').toLowerCase().includes(q) ||
                          brands.includes(q) ||
                          (m.cadSoftware || []).join(' ').toLowerCase().includes(q);
                      })
                      .map(m => (
                        <div
                          key={m.id}
                          className="bg-white rounded-2xl border border-[#e4ebe4] hover:border-[#108a00] hover:shadow-md transition p-6 space-y-4"
                        >
                          {/* Top Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {/* Circular Avatar with Green Online Indicator */}
                              <div className="relative shrink-0">
                                <img
                                  src={m.avatar}
                                  alt={m.name}
                                  className="w-16 h-16 rounded-full object-cover border border-slate-200"
                                />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#108a00] absolute bottom-0 right-0 border-2 border-white" title="متصل الآن" />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3
                                    onClick={() => setSelectedMemberProfile(m)}
                                    className="text-lg font-bold text-slate-900 hover:text-[#108a00] cursor-pointer transition"
                                  >
                                    {m.name}
                                  </h3>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] text-xs font-semibold border border-[#d4e5d4] flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Top Rated</span>
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                    100% نجاح المشاريع
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                                  {m.categoryLabel || m.specialty}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{m.city}</span>
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-800 font-semibold">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span>{m.rating} ({m.reviewsCount || 40} تقييم)</span>
                                  </span>
                                  <span className="text-slate-600">
                                    {m.completedJobs || 120} مشروع منجز
                                  </span>
                                  <span className="text-[#108a00] font-medium">
                                    استجابة خلال ساعتين
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Rate Box */}
                            <div className="text-right sm:text-left bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200 shrink-0">
                              <span className="text-[11px] text-slate-500 block">سعر الباترون الأساسي:</span>
                              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                                {m.pricing?.basePattern || 250} <span className="text-xs font-sans text-slate-600 font-semibold">MAD</span>
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                <span>تدريج: <strong className="text-slate-800 font-mono">+{m.pricing?.gradation || 40} MAD</strong></span>
                                <span>• 3D: <strong className="text-slate-800 font-mono">+{m.pricing?.simulation3d || 120} MAD</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {m.bio}
                          </p>

                          {/* Brands Worked With */}
                          {m.brandsWorkedWith && m.brandsWorkedWith.length > 0 && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-slate-800 flex items-center gap-1.5 shrink-0">
                                <Building2 className="w-4 h-4 text-slate-600" />
                                <span>علامات تجارية تعاون معها:</span>
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {m.brandsWorkedWith.map((brand: string, bIdx: number) => (
                                  <span
                                    key={bIdx}
                                    className="px-2.5 py-1 rounded-full bg-white text-slate-800 font-semibold text-xs border border-slate-200 shadow-2xs"
                                  >
                                    {brand}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Skills Pills */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(m.cadSoftware || []).map((cad: string, cIdx: number) => (
                              <span
                                key={cIdx}
                                className="px-3 py-1 rounded-full bg-[#f2f7f2] text-[#108a00] text-xs font-semibold border border-[#d4e5d4]"
                              >
                                {cad}
                              </span>
                            ))}
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                              تدريج المقاسات XS-XXL
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                              البطاقة التقنية Fiche Tech
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                              ملفات DXF AAMA
                            </span>
                          </div>

                          {/* Portfolio Preview */}
                          {m.portfolio && m.portfolio.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                                  <span>نماذج الباترون والأعمال السابقة:</span>
                                </span>
                                <span className="text-[11px] text-slate-500">انقر لتكبير التفاصيل الفنية</span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {m.portfolio.map((item: any, pIdx: number) => (
                                  <div
                                    key={pIdx}
                                    onClick={() => setSelectedPortfolioItem({ item, author: m.name, proId: m.id })}
                                    className="group/thumb relative rounded-xl overflow-hidden border border-slate-200 hover:border-[#108a00] cursor-pointer bg-slate-100 aspect-4/3 transition"
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                                      <span className="text-xs font-bold text-white truncate">{item.title}</span>
                                      <span className="text-[10px] text-slate-200">{item.tag}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions Footer */}
                          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                              <button
                                onClick={() => {
                                  setEscrowTarget(m);
                                  setEscrowAmount(m.pricing?.basePattern ? m.pricing.basePattern + 100 : 350);
                                  setEscrowServiceTitle(`باترون رقمي متكامل (${m.categoryLabel || m.specialty}) + تدريج المقاسات XS-XXL + ملفات Fiche Tech`);
                                  setEscrowSuccessSlip(null);
                                  setShowEscrowModal(true);
                                }}
                                className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>طلب باترون (BEYA Escrow)</span>
                              </button>

                              <button
                                onClick={() => {
                                  setConsultationTarget(m);
                                  setConsultationConfirmedSlip(null);
                                  setShowConsultationModal(true);
                                }}
                                className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Calendar className="w-4 h-4 text-slate-600" />
                                <span>حجز استشارة</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <a
                                href={`https://wa.me/${m.whatsapp}?text=${encodeURIComponent(
                                  `السلام عليكم أستاذ(ة) ${m.name}، تواصلت معك عبر منصة BEYA NETWORK بخصوص طلب فصالة وباترون لموديل جديد.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 text-xs transition flex items-center gap-1.5"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تواصل واتساب</span>
                              </a>

                              <button
                                onClick={() => setSelectedMemberProfile(m)}
                                className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 text-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>الملف الكامل</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CONSULTING & EXPERT ADVICE SPACE (APPLE TYPOGRAPHY & UPWORK LIGHT DESIGN SYSTEM) */}
          {activeView === 'consulting' && (
            <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f9fafb] text-slate-900 font-sans">

              {/* ── 1. APPLE / UPWORK HERO CONTAINER (DEEP EMERALD #13544e CONTAINER) ── */}
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6 pb-2">
                <div className="rounded-[28px] sm:rounded-[36px] bg-[#13544e] text-white p-7 sm:p-12 relative overflow-hidden shadow-xs">
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                  {/* Mode Switcher Pill */}
                  <div className="inline-flex items-center p-1 bg-black/25 backdrop-blur-md rounded-full border border-white/10 mb-6 flex-wrap gap-1">
                    <button
                      onClick={() => setConsultingTab('consultants')}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                        consultingTab === 'consultants'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      قائمة المستشارين والأسعار
                    </button>
                    <button
                      onClick={() => setConsultingTab('live_booking')}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                        consultingTab === 'live_booking'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      حجز استشارة Live عن بعد
                    </button>
                    <button
                      onClick={() => setConsultingTab('feedback')}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                        consultingTab === 'feedback'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      آراء وتقييمات العملاء ({consultationReviews.length})
                    </button>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl">
                    فضاء الاستشارات التقنية وتوجيه العلامات التجارية
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-white/85 mt-4 max-w-2xl leading-relaxed font-normal">
                    جلسات 1-à-1 خاصة (45 دقيقة مركزة) مباشرة مع كبار مهندسي النسيج واستشاريي الأزياء بالمغرب: اكتشف القطع الأكثر مبيعاً (Winner Products) في التجارة الإلكترونية، راجع ملفات CAD، واضبط تدرج المقاسات وهامش الربح قبل قص الأقمشة.
                  </p>

                  {/* Action CTAs */}
                  <div className="flex flex-wrap items-center gap-3 mt-8">
                    <button
                      onClick={() => setConsultingTab('live_booking')}
                      className="px-6 py-3.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-sm transition shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>حجز موعد استشارة Live الآن</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setConsultingTab('feedback')}
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-sm transition border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                    >
                      <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>تصفح آراء وتقييمات العملاء</span>
                    </button>
                  </div>

                  {/* Guarantees Bar (Text + Lucide SVG Icons - Zero Emojis) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-8 border-t border-white/10 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>حماية المعاملات BEYA Escrow 100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>رابط قاعة افتراضية مع مشاركة الشاشة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>استشارة حضورية متوفرة في كازا والرباط وطنجة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>مدة الجلسة: 45 دقيقة تدقيق عملي</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. SUB-TABS NAVIGATION (APPLE UNDERLINE SYSTEM) ── */}
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-4">
                <div className="flex items-center justify-between border-b border-[#e4ebe4] overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setConsultingTab('consultants')}
                      className={`py-3.5 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                        consultingTab === 'consultants'
                          ? 'border-[#108a00] text-[#108a00]'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>قائمة المستشارين والأسعار</span>
                    </button>

                    <button
                      onClick={() => setConsultingTab('live_booking')}
                      className={`py-3.5 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                        consultingTab === 'live_booking'
                          ? 'border-[#108a00] text-[#108a00]'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>حجز استشارة Live عن بعد (قاعة افتراضية)</span>
                    </button>

                    <button
                      onClick={() => setConsultingTab('feedback')}
                      className={`py-3.5 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                        consultingTab === 'feedback'
                          ? 'border-[#108a00] text-[#108a00]'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>آراء وتقييمات العملاء ({consultationReviews.length})</span>
                    </button>
                  </div>

                  {consultingTab === 'feedback' && (
                    <button
                      onClick={() => setShowAddReviewModal(true)}
                      className="px-4 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ أضف تقييمك</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ── 3A. TAB 1: CONSULTANTS & CLEAR PRICING CARDS ── */}
              {consultingTab === 'consultants' && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
                  {/* Two Consultation Modes Explainer Cards (White Apple Cards) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mode 1: Visio Live */}
                    <div className="p-6 rounded-2xl bg-white border border-[#e4ebe4] hover:border-[#108a00] transition shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-900 text-sm font-bold">
                          <div className="w-8 h-8 rounded-full bg-[#f2f7f2] text-[#108a00] flex items-center justify-center">
                            <Video className="w-4 h-4" />
                          </div>
                          <span>1. استشارة Live Visio (عن بعد - 45 دقيقة)</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] text-xs font-semibold border border-[#d4e5d4]">
                          Google Meet / Zoom
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        مثالية للمراجعة السريعة وحل المشاكل الرقمية. يمكنك مشاركة الشاشة لمراجعة ملفات CAD والباترون (DXF / CLO 3D)، والتدقيق في استهلاك الثوب وتكلفة البياسة من أي مدينة بالمغرب أو من الخارج.
                      </p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">التعريفة المعتمدة: <strong className="text-slate-900 font-bold font-mono">200 - 250 MAD</strong></span>
                        <span className="text-[#108a00] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>رابط فوري مع مشاركة الشاشة</span>
                        </span>
                      </div>
                    </div>

                    {/* Mode 2: In-Person Atelier */}
                    <div className="p-6 rounded-2xl bg-white border border-[#e4ebe4] hover:border-[#108a00] transition shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-900 text-sm font-bold">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span>2. استشارة حضورية بالاستوديو / Atelier</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                          لقاء مباشر في المكتب
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        جلسة عمل مباشرة في مكتب الموديليست (الدار البيضاء، الرباط، أو طنجة). لمس عينات الأقمشة الحقيقية (Swatches)، تجربة التلبيس على المانيكان الحي، واستلام نسخة ورقية مطبوعة على ورق البلوتر الصناعي (Plotter 1:1).
                      </p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">التعريفة المعتمدة: <strong className="text-slate-900 font-bold font-mono">250 - 350 MAD</strong></span>
                        <span className="text-slate-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>فحص العينات يداً بيد</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Exclusive Winner Product Consulting Card (استشارة تحديد المنتج الرابح وهندسة الأرباح) */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[#fcfdfc] to-[#f2f7f2] border-2 border-[#108a00]/30 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-0.5 rounded-full bg-[#108a00] text-white text-[10px] font-bold tracking-wider uppercase">
                            WINNER PRODUCT ADVICE
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-600" />
                            <span>تحليل ترندات ومبيعات E-Commerce</span>
                          </span>
                          <span className="text-xs text-slate-500 font-medium">جلسة 45 دقيقة مع مهندس نسيج وخبير تجارة إلكترونية</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                          استشارة تحديد المنتج الرابح (Winner Product) وهندسة أعلى هامش ربح
                        </h3>
                      </div>

                      <button
                        onClick={() => {
                          setConsultationTopic('تحديد وتحليل المنتج الرابح (Winner Product): دراسة ترندات السوق والقطع الأكثر مبيعاً وهوامش الربح');
                          setConsultingTab('live_booking');
                        }}
                        className="px-5 py-2.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
                      >
                        <Flame className="w-4 h-4 text-amber-300" />
                        <span>حجز استشارة المنتج الرابح</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      قبل ما تستثمر أموالك فـ إنتاج موديلات بطيئة الحركة وتطيح فـ مشكل الستوك الميت (Dead Stock)، كيحلل معاك المستشار التقني أسرار القطع الأكثر طلباً وفيرال في التيك توك وإنستغرام، نوعية الثوب والقصة الرابحة، مع احتساب أدق كلفة إنتاج (Coût de Revient) تضمن ليك هامش ربح يفوق 65% فـ التجارة الإلكترونية.
                    </p>

                    {/* 4 Winner Product Strategic Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white border border-[#e4ebe4] space-y-1 shadow-2xs">
                        <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>1. قصات فيرال سريعة البيع</span>
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Boxy Heavyweight Tees، Oversized Hoodies 380g، Parachute Pants الأكثر تحقيقاً لمبيعات الإعلانات.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-[#e4ebe4] space-y-1 shadow-2xs">
                        <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>2. كلفة إنتاج 65 - 95 MAD</span>
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          ضبط كلفة الثوب والفصالة والخياطة واللوبالاج باش تبيع بـ 250-380 MAD بهامش ربح صافي مرتفع.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-[#e4ebe4] space-y-1 shadow-2xs">
                        <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span>3. الأقمشة الأكثر طلباً</span>
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Coton Peigné 240g، French Terry 350g، Crêpe de Soie أقمشة كتعطي إحساس الفخامة وما كترجعش فـ الروطور.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-[#e4ebe4] space-y-1 shadow-2xs">
                        <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#108a00]" />
                          <span>4. تفادي الستوك الميت</span>
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          خطة إنتاج عينات مصغرة (Micro-Batch 50-100 pcs) لاختبار السوق قبل المغامرة بإنتاج كميات ضخمة.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        نخبة المستشارين المعتمدين وجدول الأسعار
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        اختر الخبير المناسب لنوع قطعتك واحجز موعدك مباشرة عبر المنصة
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="ابحث بالاسم، المدينة، أو التخصص..."
                        value={consultingSearchQuery}
                        onChange={e => setConsultingSearchQuery(e.target.value)}
                        className="w-full bg-white text-xs text-slate-900 placeholder-slate-400 pr-10 pl-3 py-2.5 rounded-xl border border-[#e4ebe4] focus:border-[#108a00] focus:outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Consultant Cards Grid (Pure White Cards) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allProMembers
                      .filter(m => m.pillar === 'modelistes')
                      .filter(m => {
                        if (!consultingSearchQuery.trim()) return true;
                        const q = consultingSearchQuery.toLowerCase();
                        return m.name.toLowerCase().includes(q) ||
                          m.city.toLowerCase().includes(q) ||
                          (m.categoryLabel || '').toLowerCase().includes(q) ||
                          (m.specialty || '').toLowerCase().includes(q);
                      })
                      .map(m => (
                        <div
                          key={m.id}
                          className="bg-white rounded-2xl border border-[#e4ebe4] hover:border-[#108a00] p-6 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div className="space-y-3.5">
                            {/* Consultant Header */}
                            <div className="flex items-start gap-3.5">
                              <div className="relative shrink-0">
                                <img
                                  src={m.avatar}
                                  alt={m.name}
                                  className="w-14 h-14 rounded-full object-cover border border-slate-200"
                                />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#108a00] absolute bottom-0 right-0 border-2 border-white" title="متاح للاستشارة" />
                              </div>

                              <div className="space-y-0.5">
                                <h3 className="text-base font-bold text-slate-900 leading-snug">{m.name}</h3>
                                <p className="text-xs font-semibold text-[#108a00]">{m.categoryLabel || m.specialty}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{m.city}</span>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-slate-800 font-semibold">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span>5.0</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Office Address if Available */}
                            {m.officeAddress && (
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span><strong>مقر الاستشارة الحضورية:</strong> {m.officeAddress}</span>
                              </div>
                            )}

                            {/* Brands Advised */}
                            {m.brandsWorkedWith && m.brandsWorkedWith.length > 0 && (
                              <div className="text-xs text-slate-500 space-y-1">
                                <span className="font-semibold text-slate-700 block">استشارات سابقة لعلامات:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {m.brandsWorkedWith.slice(0, 3).map((b: string, bIdx: number) => (
                                    <span key={bIdx} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Transparent Pricing Grid */}
                            <div className="p-3 rounded-xl bg-[#f9fafb] border border-[#e4ebe4] space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 flex items-center gap-1">
                                  <Video className="w-3.5 h-3.5 text-[#108a00]" />
                                  <span>جلسة Live Visio (45د):</span>
                                </span>
                                <strong className="text-slate-900 font-bold font-mono">200 MAD</strong>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                <span className="text-slate-600 flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                                  <span>جلسة حضورية بالمكتب (45د):</span>
                                </span>
                                <strong className="text-slate-900 font-bold font-mono">{m.consultationPriceMAD || 250} MAD</strong>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <button
                              onClick={() => {
                                setConsultationTarget(m);
                                setConsultationConfirmedSlip(null);
                                setShowConsultationModal(true);
                              }}
                              className="w-full py-2.5 px-4 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>حجز موعد استشارة (Live / حضوري)</span>
                            </button>

                            <a
                              href={`https://wa.me/${m.whatsapp}?text=${encodeURIComponent(
                                `السلام عليكم أستاذ(ة) ${m.name}، أرغب في الاستفسار عن موعد متاح لاستشارة تقنية عبر منصة BEYA NETWORK.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 text-center text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-center gap-1.5 transition rounded-full hover:bg-slate-50 border border-slate-200"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>استفسار مسبق عبر الواتساب</span>
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ── 3B. TAB 2: LIVE REMOTE CONSULTATION (حجز استشارة Live عن بعد) ── */}
              {consultingTab === 'live_booking' && (
                <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
                  {/* Interactive Live Studio Studio Container */}
                  <div className="bg-white rounded-3xl border border-[#e4ebe4] p-6 sm:p-10 shadow-xs space-y-6">
                    {/* Live Room Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#f2f7f2] text-[#108a00] flex items-center justify-center border border-[#d4e5d4]">
                          <Video className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            قاعة الاستشارة الافتراضية المباشرة (Live Visio Room)
                          </h2>
                          <p className="text-xs text-slate-600">
                            احجز توقيتك واحصل على رابط فوري عالي الدقة لمراجعة ملفات التصميم والباترون ومشاركة الشاشة
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-[#f2f7f2] text-[#108a00] text-xs font-semibold border border-[#d4e5d4] shrink-0 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#108a00] animate-ping" />
                        <span>بث مباشر فوري</span>
                      </span>
                    </div>

                    {/* Step 1: Select Consultant */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 block">1. اختر المستشار التقني المطلوب:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allProMembers.filter(m => m.pillar === 'modelistes').slice(0, 4).map(pro => (
                          <div
                            key={pro.id}
                            onClick={() => setConsultationTarget(pro)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                              consultationTarget?.id === pro.id
                                ? 'border-[#108a00] bg-[#f2f7f2]/50 ring-1 ring-[#108a00]'
                                : 'border-[#e4ebe4] bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={pro.avatar} alt={pro.name} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{pro.name}</h4>
                                <p className="text-[11px] text-[#108a00] font-medium">{pro.categoryLabel || pro.specialty}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-mono">200 MAD</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Date & Time Picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-slate-900 font-bold block">2. حدد تاريخ الاستشارة:</label>
                        <input
                          type="date"
                          value={consultationDate}
                          onChange={e => setConsultationDate(e.target.value)}
                          className="w-full bg-[#f9fafb] text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-900 font-bold block">3. توقيت الجلسة (45 دقيقة):</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {['10:00', '11:30', '15:00', '17:00'].map(t => (
                            <button
                              type="button"
                              key={t}
                              onClick={() => setConsultationTime(t)}
                              className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer font-mono ${
                                consultationTime === t
                                  ? 'bg-[#108a00] text-white border-[#108a00]'
                                  : 'bg-[#f9fafb] text-slate-700 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Topic Selection */}
                    <div className="space-y-1.5 text-xs">
                      <label className="text-slate-900 font-bold block">4. موضوع الاستشارة الرئيسي:</label>
                      <select
                        value={consultationTopic}
                        onChange={e => setConsultationTopic(e.target.value)}
                        className="w-full bg-[#f9fafb] text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                      >
                        <option value="تحديد وتحليل المنتج الرابح (Winner Product): دراسة ترندات السوق والقطع الأكثر مبيعاً وهوامش الربح">
                          تحديد وتحليل المنتج الرابح (Winner Product): دراسة ترندات السوق والقطع الأكثر مبيعاً وهوامش الربح
                        </option>
                        <option value="اختيار وتدقيق الأقمشة والمواد المناسبة للموديل مع احتساب تكلفة الإنتاج">
                          اختيار وتدقيق الأقمشة والمواد المناسبة للموديل مع احتساب تكلفة الإنتاج
                        </option>
                        <option value="مراجعة وتدقيق باترون موجود وحل مشاكل الفيتينغ والقصة (Fitting)">
                          مراجعة وتدقيق باترون موجود وحل مشاكل الفيتينغ والقصة (Fitting)
                        </option>
                        <option value="دراسة فنية لكوليكسيون جديدة كاملة وضبط جدول تدرج المقاسات (Gradation)">
                          دراسة فنية لكوليكسيون جديدة كاملة وضبط جدول تدرج المقاسات (Gradation)
                        </option>
                        <option value="إعداد البطاقة التقنية (Fiche Technique) وشروط التعامل مع معامل الخياطة">
                          إعداد البطاقة التقنية (Fiche Technique) وشروط التعامل مع معامل الخياطة
                        </option>
                      </select>
                    </div>

                    {/* Step 4: Client Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-slate-900 font-bold block">اسمك أو اسم علامتك التجارية: *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: Casablanca Streetwear"
                          value={consultationClientName}
                          onChange={e => setConsultationClientName(e.target.value)}
                          className="w-full bg-[#f9fafb] text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-900 font-bold block">رقم الواتساب للتواصل: *</label>
                        <input
                          type="tel"
                          required
                          placeholder="06XXXXXXXX"
                          value={consultationClientPhone}
                          onChange={e => setConsultationClientPhone(e.target.value)}
                          className="w-full bg-[#f9fafb] text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Real Meeting Room Launcher Box */}
                    <div className="p-4 rounded-2xl bg-[#f2f7f2] border border-[#d4e5d4] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-[#108a00]" />
                          <span>رابط القاعة الافتراضية المباشرة (Live Room):</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#108a00]">
                          BEYA-LIVE-{Date.now().toString().slice(-4)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://meet.jit.si/BEYA-CONSULT-${consultationTarget ? consultationTarget.id : 'mode'}-${Date.now().toString(36)}`}
                          className="flex-1 bg-white text-xs text-slate-700 px-3 py-2 rounded-xl border border-slate-200 font-mono select-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const url = `https://meet.jit.si/BEYA-CONSULT-${consultationTarget ? consultationTarget.id : 'mode'}-${Date.now().toString(36)}`;
                            window.open(url, '_blank');
                          }}
                          className="px-4 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>دخول القاعة الآن</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        يمكنك تجربة دخول القاعة الافتراضية مباشرة الآن للتأكد من المايك والكاميرا ومشاركة الشاشة.
                      </p>
                    </div>

                    {/* Confirmation Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const target = consultationTarget || allProMembers.find(m => m.pillar === 'modelistes');
                        if (!target) return;
                        const slip = {
                          code: `BYA-RDV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                          consultantName: target.name,
                          mode: 'visio',
                          modeLabel: 'استشارة Live Visio (عن بعد مع مشاركة الشاشة)',
                          date: consultationDate,
                          time: consultationTime,
                          topic: consultationTopic,
                          clientName: consultationClientName || userProfile.brandName || 'صاحب علامة أزياء',
                          clientPhone: consultationClientPhone || '0600000000'
                        };
                        setConsultationTarget(target);
                        setConsultationConfirmedSlip(slip);
                        setShowConsultationModal(true);
                      }}
                      className="w-full py-3.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>تأكيد حجز الموعد واستلام بطاقة الدخول</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── 3C. TAB 3: FEEDBACK & REVIEWS (آراء وتقييمات العملاء) ── */}
              {consultingTab === 'feedback' && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
                  {/* Summary Rating Banner */}
                  <div className="bg-white rounded-3xl border border-[#e4ebe4] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                    <div className="flex items-center gap-5">
                      <div className="text-center sm:text-right shrink-0">
                        <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tracking-tight">
                          4.9
                        </span>
                        <div className="flex items-center gap-1 justify-center sm:justify-start mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">من أصل 5.0 نجوم</span>
                      </div>

                      <div className="h-12 w-px bg-slate-200 hidden sm:block" />

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900">
                          تقييمات موثقة من أصحاب علامات الأزياء ومصانع الألبسة
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                          تجارب حقيقية لعملاء استفادوا من استشارات مهندسي الباترون في تصحيح المقاسات، خفض استهلاك الأقمشة، وتفادي مشاكل ورشات الخياطة.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setShowAddReviewModal(true)}
                        className="px-5 py-3 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>شارك تجربتك / أضف تقييمك</span>
                      </button>
                    </div>
                  </div>

                  {/* Reviews Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consultationReviews.map(rev => (
                      <div
                        key={rev.id}
                        className="bg-white rounded-2xl border border-[#e4ebe4] hover:border-[#108a00] p-6 space-y-4 shadow-xs transition"
                      >
                        {/* Review Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm border border-slate-200">
                              {(rev.authorName || 'B').charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{rev.authorName}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] text-[10px] font-semibold border border-[#d4e5d4]">
                                  عميل موثق
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{rev.brandName} • {rev.city}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>

                        {/* Review Content */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-[#f9fafb] p-3.5 rounded-xl border border-slate-100">
                          "{rev.comment}"
                        </p>

                        {/* Review Footer Meta */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span>المستشار: <strong className="text-slate-800 font-semibold">{rev.consultantName}</strong></span>
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Educational Banner for Brands (Apple White Style) */}
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-12">
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e4ebe4] space-y-4 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#108a00]" />
                    <span>كيف تحمي استشارة BEYA التقنية ميزانية كوليكسيونك؟</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-700">
                    <div className="p-4 rounded-2xl bg-[#f9fafb] border border-slate-200/70 space-y-1.5 hover:border-[#108a00] transition">
                      <strong className="text-slate-900 font-bold block text-sm flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span>1. كشف المنتج الرابح (Winner Product)</span>
                      </strong>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        تحديد القطع الأكثر طلباً في ترندات التيك توك والإعلانات، وهندسة تكلفة إنتاج تضمن هامش ربح +65% بدون مخاطرة الستوك الميت.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#f9fafb] border border-slate-200/70 space-y-1.5 hover:border-[#108a00] transition">
                      <strong className="text-slate-900 font-bold block text-sm flex items-center gap-1.5">
                        <Scissors className="w-4 h-4 text-[#108a00]" />
                        <span>2. توفير 15% إلى 30% من استهلاك القماش</span>
                      </strong>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        يقوم الموديليست بتحسين تعشيق الباترون (Placement & Nesting) لتفادي الهدر على الطاولة قبل القص الصناعي.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#f9fafb] border border-slate-200/70 space-y-1.5 hover:border-[#108a00] transition">
                      <strong className="text-slate-900 font-bold block text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-slate-800" />
                        <span>3. مطابقة القياسات لجمهورك المستهدف</span>
                      </strong>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        تفادي المقاسات العشوائية التي تؤدي إلى إرجاع الزبائن للمنتجات (Retour) وتراجع مبيعات البراند في السوق.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#f9fafb] border border-slate-200/70 space-y-1.5 hover:border-[#108a00] transition">
                      <strong className="text-slate-900 font-bold block text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-800" />
                        <span>4. بطاقة تقنية (Fiche Tech) تلزم المصنع</span>
                      </strong>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        وثيقة مرجعية وقانونية تفرض على ورشة الخياطة احترام خيوط الحياكة والدرزات وتفاصيل الفينيسيون بدقة.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  .filter(m => !searchQuery.trim() || String(m.content || '').toLowerCase().includes(searchQuery.toLowerCase()))
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
                              bio: String(msg.content || '').slice(0, 150),
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
                                <span>تواصل عبر واتساب مع {String(msg.author || '').split('(')[0] || 'صاحب المنشور'}</span>
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

          {/* VIEW B: UPWORK & FREELANCER APP-STYLE MARKETPLACE (THE 5 PILLARS) */}
          {activeView === 'directory' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-hide bg-[#0b0f19]">
              <div className="max-w-7xl mx-auto w-full space-y-6">

              {/* 1. APP-LIKE MARKETPLACE HEADER */}
              <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-950 via-[#1e1f28] to-slate-950 border border-indigo-500/20 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>سوق المحترفين وصناع الموضة BEYA PRO</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                        14 خبير ومورد معتمد
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-2">
                      منصة العمل الحر وشبكة توريد النسيج بالمغرب
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      اختر التخصص المطلوب وتواصل فورياً مع الموديليست، مستودعات الأقمشة، مصانع المستلزمات، وورشات الطباعة والتطريز المعتمدة.
                    </p>
                  </div>

                  {/* Quick Stats Pill */}
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0 backdrop-blur-xs">
                    <div className="text-center px-3 border-l border-white/10">
                      <p className="text-lg font-black text-amber-400">4.92 ★</p>
                      <p className="text-[10px] text-slate-400 font-bold">متوسط التقييم</p>
                    </div>
                    <div className="text-center px-3 border-l border-white/10">
                      <p className="text-lg font-black text-indigo-400">100%</p>
                      <p className="text-[10px] text-slate-400 font-bold">معتمد BEYA</p>
                    </div>
                    <div className="text-center px-3">
                      <p className="text-lg font-black text-emerald-400">24/48h</p>
                      <p className="text-[10px] text-slate-400 font-bold">تسليم العينات</p>
                    </div>
                  </div>
                </div>
              </div>

              
              {/* PRO / SUPPLIER REGISTRATION CALLOUT BANNER */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-[#23242b] to-indigo-950/70 border border-amber-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>فضاء تسجيل الموديليست والموردين 🚀</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      تسجيل مجاني فوري
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    واش نتا موديليست أو عندك محل/مستودع د الأقمشة والمستلزمات أو ورشة طباعة وتطريز؟
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    قاد حسابك المهني دابا فـ BEYA NETWORK باش يبان كرتك فـ هاد الدليل وتبدا تستقبل طلبيات الباترون والتوريد من أصحاب البراندات مباشرة على الواتساب وبلا وسيط.
                  </p>
                </div>
                <Link
                  to="/network/register"
                  className="shrink-0 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Scissors className="w-4 h-4 text-slate-950" />
                  <span>فتح حساب مهني (موديليست / مورد) 🚀</span>
                </Link>
              </div>

              {/* 2. FREELANCER PLATFORM / APP-STYLE CATEGORIES MENU (NOT SIMPLE TAGS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>تصفح حسب قطاع التخصص (Categories) :</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                    اضغط لتصفية المحترفين بضغطة واحدة
                  </span>
                </div>

                {/* Interactive Category Cards Carousel / Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                  {[
                    {
                      id: 'all',
                      title: 'جميع المنظومة',
                      subtitle: 'كافة الخبراء والموردين',
                      icon: Globe,
                      badge: '14 متاح',
                      gradient: 'from-purple-600 via-indigo-600 to-blue-600',
                      borderActive: 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/40',
                      badgeColor: 'bg-purple-500/20 text-purple-300'
                    },
                    {
                      id: 'modeliste',
                      title: 'الموديليست',
                      subtitle: 'باترونات، فصالة وLectra',
                      icon: Scissors,
                      badge: '5 موديليست',
                      gradient: 'from-indigo-600 via-indigo-500 to-blue-600',
                      borderActive: 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/40',
                      badgeColor: 'bg-indigo-500/20 text-indigo-300'
                    },
                    {
                      id: 'tissu',
                      title: 'مالين الثوب',
                      subtitle: 'تخصصات: كريب، مولطوني، جينز، كتان، جاباردين',
                      icon: Layers,
                      badge: '6 مستودعات متخصصة',
                      gradient: 'from-emerald-600 via-teal-600 to-emerald-500',
                      borderActive: 'border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/40',
                      badgeColor: 'bg-emerald-500/20 text-emerald-300'
                    },
                    {
                      id: 'fournitures',
                      title: 'الفورنيتور واللوازم',
                      subtitle: 'سحابات YKK، أكياس، حبال',
                      icon: Package,
                      badge: '2 موردين',
                      gradient: 'from-amber-500 via-orange-600 to-amber-600',
                      borderActive: 'border-amber-500 shadow-amber-500/20 ring-2 ring-amber-500/40',
                      badgeColor: 'bg-amber-500/20 text-amber-300'
                    },
                    {
                      id: 'impression',
                      title: 'مالين الإمبريسيون',
                      subtitle: 'DTF HD، سيريغرافي، Puff',
                      icon: Palette,
                      badge: '2 ورشات',
                      gradient: 'from-sky-500 via-cyan-600 to-blue-600',
                      borderActive: 'border-sky-500 shadow-sky-500/20 ring-2 ring-sky-500/40',
                      badgeColor: 'bg-sky-500/20 text-sky-300'
                    },
                    {
                      id: 'broderie',
                      title: 'مالين الطرز',
                      subtitle: 'طرز 3D فوم، ماكينات Tajima',
                      icon: Award,
                      badge: '2 أتولييه',
                      gradient: 'from-rose-500 via-pink-600 to-rose-600',
                      borderActive: 'border-rose-500 shadow-rose-500/20 ring-2 ring-rose-500/40',
                      badgeColor: 'bg-rose-500/20 text-rose-300'
                    }
                  ].map(cat => {
                    const isSelected = directoryFilter === cat.id;
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setDirectoryFilter(cat.id as any)}
                        className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 text-right flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? `bg-[#2b2d31] ${cat.borderActive} shadow-lg scale-[1.02]`
                            : 'bg-[#232428] hover:bg-[#2b2d31] border border-white/5 hover:border-white/15'
                        }`}
                      >
                        {/* Top: App Icon + Status Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.gradient} flex items-center justify-center text-white shadow-md shadow-black/30 group-hover:scale-105 transition-transform`}>
                            <IconComp className="w-5 h-5" />
                          </div>

                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-white/5 ${cat.badgeColor}`}>
                            {cat.badge}
                          </span>
                        </div>

                        {/* Middle: Title & Subtitle */}
                        <div>
                          <h3 className={`text-xs sm:text-sm font-black transition-colors ${
                            isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {cat.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                            {cat.subtitle}
                          </p>
                        </div>

                        {/* Bottom Selected Indicator Pill */}
                        {isSelected && (
                          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-black text-indigo-400">
                            <span>نشط الآن</span>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. UPWORK-STYLE SEARCH & FILTER CONTROLS */}
              <div className="bg-[#2b2d31] p-3 sm:p-4 rounded-2xl border border-[#383a40] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، القماش، أو الماكينة (مثال: باترون هودي، ملتون 340g، سيريغرافي، كازا، طنجة)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1e1f22] text-xs sm:text-sm text-white placeholder-slate-400 pr-10 pl-9 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-3 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* City Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0 pb-1 md:pb-0">
                  <span className="text-[11px] font-bold text-slate-400 ml-1 shrink-0 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">المدينة:</span>
                  </span>
                  {[
                    { id: 'all', label: 'كل المدن' },
                    { id: 'casablanca', label: 'الدار البيضاء' },
                    { id: 'tanger', label: 'طنجة' },
                    { id: 'fes', label: 'فاس' }
                  ].map(city => (
                    <button
                      key={city.id}
                      onClick={() => setSelectedCityFilter(city.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        selectedCityFilter === city.id
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'bg-[#1e1f22] text-slate-300 hover:bg-[#35373c]'
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FABRIC SUB-SPECIALTY FILTER (تخصصات مالين الثوب) */}
              {directoryFilter === 'tissu' && (
                <div className="bg-[#2b2d31] p-3 sm:p-4 rounded-2xl border border-emerald-500/30 shadow-md space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <span>اختر تخصص القماش المطلوب (Spécialité Tissu):</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-300/80 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                      كل مورد وعنده تخصصه المستقل (كريب، مولطوني، جينز، كارجو...)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {(() => {
                      const hasSkill = (m: any, term: string) => {
                        const skillsArr = Array.isArray(m?.skills) ? m.skills : [];
                        return skillsArr.some((s: any) => String(s || '').toLowerCase().includes(term));
                      };
                      return [
                        { id: 'all', label: 'كافة الأقمشة (الكل)', icon: '🌟', count: allProMembers.filter(m => m.pillar === 'tissu').length },
                        { id: 'crepe', label: 'الكريب والأقمشة النسائية (Crêpe)', icon: '👗', count: allProMembers.filter(m => m.pillar === 'tissu' && ((m as any).fabricCategory === 'crepe' || hasSkill(m, 'crepe'))).length },
                        { id: 'streetwear', label: 'الستريتوير والمولطون 340g (Molleton)', icon: '🧥', count: allProMembers.filter(m => m.pillar === 'tissu' && ((m as any).fabricCategory === 'streetwear' || hasSkill(m, 'molleton'))).length },
                        { id: 'denim', label: 'الدينيم والجينز (Denim / Jeans)', icon: '👖', count: allProMembers.filter(m => m.pillar === 'tissu' && ((m as any).fabricCategory === 'denim' || hasSkill(m, 'denim'))).length },
                        { id: 'cargo', label: 'الجاباردين والسترات والكانفاس', icon: '🦺', count: allProMembers.filter(m => m.pillar === 'tissu' && ((m as any).fabricCategory === 'cargo' || hasSkill(m, 'gabardine'))).length },
                        { id: 'lin', label: 'الكتان والبوبلين الصيفي (Lin & Coton)', icon: '🌿', count: allProMembers.filter(m => m.pillar === 'tissu' && ((m as any).fabricCategory === 'lin' || hasSkill(m, 'lin'))).length },
                        { id: 'velours', label: 'المخمل والكوردوروي والشتاء (Velours)', icon: '❄️', count: allProMembers.filter(m => m.pillar === 'tissu' && ((m as any).fabricCategory === 'velours' || hasSkill(m, 'corduroy'))).length }
                      ];
                    })().map(fSpec => {
                      const isActive = selectedFabricSpecialty === fSpec.id;
                      return (
                        <button
                          key={fSpec.id}
                          type="button"
                          onClick={() => setSelectedFabricSpecialty(fSpec.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400 scale-[1.02]'
                              : 'bg-[#1e1f22] hover:bg-[#35373c] text-slate-300 border border-white/5 hover:border-white/15'
                          }`}
                        >
                          <span className="text-sm">{fSpec.icon}</span>
                          <span>{fSpec.label}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                            isActive ? 'bg-black/30 text-white font-bold' : 'bg-black/40 text-slate-400'
                          }`}>
                            {fSpec.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. ACTIVE RESULTS SUMMARY BAR */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span className="text-slate-300">
                  عرض <strong>{filteredProMembers.length}</strong> من أصل <strong>{allProMembers.length}</strong> مهني ومورد معتمد
                </span>
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تطبيق أسعار الشراكة التفضيلية BEYA VIP</span>
                </span>
              </div>

              {/* 5. FREELANCE & SUPPLIER TALENT CARDS (UPWORK / FIVERR PRO STYLE) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filteredProMembers.map(pro => (
                  <div
                    key={pro.id}
                    className="bg-[#2b2d31] hover:bg-[#2f3136] rounded-3xl border border-[#383a40] hover:border-indigo-500/50 transition-all duration-200 overflow-hidden flex flex-col justify-between group shadow-md hover:shadow-xl hover:shadow-indigo-500/5 relative"
                  >
                    {/* Card Cover Banner Header */}
                    <div className="h-20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
                      {pro.cover && (
                        <img
                          src={pro.cover}
                          alt=""
                          className="w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2b2d31] via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 inset-x-3 flex items-center justify-between text-xs">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border backdrop-blur-md ${pro.roleColor}`}>
                          {pro.roleBadge}
                        </span>

                        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md text-amber-400 px-2 py-0.5 rounded-lg text-xs font-black border border-white/10">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{pro.rating}</span>
                          <span className="text-[10px] text-slate-400 font-normal font-mono">({pro.reviewsCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 pt-0 relative flex-1 flex flex-col justify-between">
                      <div>
                        {/* Avatar & Availability */}
                        <div className="flex items-end justify-between -mt-8 mb-3">
                          <div className="relative">
                            <img
                              src={pro.avatar}
                              alt={pro.name}
                              className="w-14 h-14 rounded-2xl object-cover border-4 border-[#2b2d31] shadow-lg group-hover:scale-105 transition-transform"
                            />
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 absolute bottom-0.5 right-0.5 border-2 border-[#2b2d31]" title="متاح للطلبيات" />
                          </div>

                          {/* Rate Starting Badge */}
                          <div className="text-left bg-[#1e1f22] px-3 py-1 rounded-xl border border-white/5">
                            <span className="text-[10px] text-slate-400 block font-bold leading-tight">التسعيرة:</span>
                            <span className="text-xs font-black text-amber-400 font-mono">{pro.startingRate}</span>
                          </div>
                        </div>

                        {/* Name & Title */}
                        <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors leading-tight mb-1">
                          {pro.name}
                        </h3>

                        <p className="text-xs text-slate-300 font-bold mb-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{pro.city}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[11px] text-slate-400 font-medium">{pro.experience}</span>
                        </p>

                        {/* Bio Pitch */}
                        <p className="text-xs text-[#949ba4] line-clamp-2 leading-relaxed mb-3 font-medium">
                          {pro.bio}
                        </p>

                        {/* Specialty Highlight Banner */}
                        {(pro as any).specialtyTag && (
                          <div className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-black flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{(pro as any).specialtyTag}</span>
                          </div>
                        )}

                        {/* Skills / Services Tags Chips */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {pro.skills && pro.skills.slice(0, 5).map((skill: string, sIdx: number) => {
                            const tagLabels: Record<string, string> = {
                              crepe: 'كريب (Crêpe)',
                              satin: 'ساتان حرير',
                              soie: 'حرير ناعم',
                              mousseline: 'موسلين',
                              viscose: 'فيسكوز',
                              molleton: 'مولطون 340g',
                              jersey: 'جيرسي قطن',
                              interlock: 'إنترلوك دابل',
                              corduroy: 'كوردوروي مضلع',
                              denim: 'دينيم وجينز',
                              chambray: 'شامبراي خفيف',
                              gabardine: 'جاباردين ستريتش',
                              canvas: 'كانفاس قطن',
                              waterproof: 'ووتربروف عازل',
                              lin: 'كتان طبيعي 100%',
                              popeline: 'بوبلين قمصان',
                              gaze: 'دوبل غاز قطن',
                              velours: 'قطيفة مخمل',
                              laine: 'جوخ ودرا دولين',
                              tweed: 'قماش تويد'
                            };
                            const displayLabel = tagLabels[skill.toLowerCase()] || skill;
                            return (
                              <span
                                key={sIdx}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                  pro.pillar === 'tissu'
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20'
                                    : 'bg-[#1e1f22] text-slate-300 border-white/5'
                                }`}
                              >
                                {displayLabel}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Bottom CTA Actions */}
                      <div className="pt-3 border-t border-[#383a40] flex items-center gap-2">
                        <a
                          href={`https://wa.me/${pro.whatsapp}?text=${encodeURIComponent(
                            `السلام عليكم ${pro.name}، تواصلت معكم عبر منصة BEYA NETWORK بخصوص طلب خدماتكم في ${pro.specialty}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-slate-950" />
                          <span>تواصل واطلب فـ الواتساب</span>
                        </a>

                        <button
                          onClick={() => setSelectedMemberProfile(pro)}
                          className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center justify-center cursor-pointer border border-white/10"
                          title="استعراض الكتالوج والملف الكامل"
                        >
                          <Eye className="w-4 h-4 text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              </div>
            </div>
          )}

                    {/* VIEW C: GROUPAGE DEALS & CUSTOM REQUESTS (الشراء المشترك والطلبات الحية) */}
          {activeView === 'groupage' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#0b0f19]">
              <div className="max-w-7xl mx-auto w-full space-y-6">

                {/* 1. Groupage Hero Header */}
                <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/90 border border-amber-500/30 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30 inline-flex items-center gap-1.5 shadow-sm">
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>منظومة الشراء المشترك الحقيقي (BEYA GROUPAGE LIVE) 🛒</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>حجوزات حقيقية مؤكدة مع المستودعات</span>
                        </span>
                        <span className="text-[11px] text-indigo-300 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>ضمان الفحص قبل الشحن</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-xl sm:text-3xl font-black text-white">
                        أقمشة ومستلزمات المصانع الكبرى بسعر الجملة المخفض (بالكيلو والمتر)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-3xl">
                        تنسق ورشة BEYA طلبات الشراء الجماعي مع أكبر مستودعات الأقمشة بالمغرب (درب عمر وطنجة) للاستفادة من تخفيضات تصل حتى 25% مع تفاصيل دقيقة، صور حقيقية للنسيج، وتحويل واضح بين ثمن الكيلو وثمن المتر لمساعدتك فـ حساب تكلفة كل بياسة.
                      </p>
                    </div>

                    {/* Sub-Tabs: Deals vs Custom Requests */}
                    <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGroupageSubTab('deals')}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                            groupageSubTab === 'deals'
                              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                              : 'bg-[#1e1f22] text-slate-300 hover:text-white border border-white/5'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>صفقات الدفعات المفتوحة</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            groupageSubTab === 'deals' ? 'bg-black/30 text-slate-950 font-black' : 'bg-white/10 text-slate-400'
                          }`}>
                            {groupageDeals.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setGroupageSubTab('requests')}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                            groupageSubTab === 'requests'
                              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                              : 'bg-[#1e1f22] text-slate-300 hover:text-white border border-white/5'
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                          <span>طلبات البراندات وعروض الموردين</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            groupageSubTab === 'requests' ? 'bg-black/30 text-slate-950 font-black' : 'bg-white/10 text-slate-400'
                          }`}>
                            {customRequests.length}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateCustomRequestModal(true)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ أضف طلب شراء أو تجميع قماش مخصص</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit View Selector Pill (Only in deals tab) */}
                    {groupageSubTab === 'deals' && (
                      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400 font-bold">طريقة عرض السعر:</span>
                        <button
                          type="button"
                          onClick={() => setDealUnitView('both')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            dealUnitView === 'both'
                              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                              : 'bg-[#1e1f22] text-slate-300 hover:text-white border border-white/5'
                          }`}
                        >
                          عرض السعرين معاً (بالكيلو والمتر ⚖️📏)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDealUnitView('kg')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            dealUnitView === 'kg'
                              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                              : 'bg-[#1e1f22] text-slate-300 hover:text-white border border-white/5'
                          }`}
                        >
                          سعر الكيلو فقط (MAD/kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDealUnitView('meter')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                            dealUnitView === 'meter'
                              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                              : 'bg-[#1e1f22] text-slate-300 hover:text-white border border-white/5'
                          }`}
                        >
                          سعر المتر فقط (MAD/m)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    TAB 1: DEALS LIST (صفقات الدفعات المفتوحة)
                    ───────────────────────────────────────────────────────────── */}
                {groupageSubTab === 'deals' && (
                  <div className="space-y-6">
                    {groupageDeals.map(deal => {
                      const dealOrders = groupageOrders.filter(o => o.dealId === deal.id);
                      const userAddedQty = dealOrders.filter(o => o.id.startsWith('usr-')).reduce((sum, o) => sum + o.quantity, 0);
                      const liveCurrentQty = deal.currentKg + userAddedQty;
                      const progressPct = Math.min(100, Math.round((liveCurrentQty / deal.targetKg) * 100));
                      const activeImgIdx = activeDealImageIdx[deal.id] || 0;
                      const currentImage = deal.images[activeImgIdx] || deal.images[0];
                      const chosenColor = selectedDealColor[deal.id] || deal.colors[0]?.name || '';
                      const committedQty = dealQuantities[deal.id] || deal.minCommitment;
                      const calculatedTotal = committedQty * deal.discountPrice;
                      const regularTotal = committedQty * deal.regularPrice;
                      const savingsMad = regularTotal - calculatedTotal;

                      const estMeters = deal.metersPerKg
                        ? Math.round(committedQty * deal.metersPerKg)
                        : (deal.primaryUnit === 'm' ? committedQty : null);

                      const estGarments = deal.category === 'tissu'
                        ? (deal.primaryUnit === 'kg'
                            ? Math.floor(committedQty / (deal.id === 'grp-3' ? 0.38 : 0.8))
                            : Math.floor(committedQty / (deal.id === 'grp-2' ? 1.6 : deal.id === 'grp-5' ? 3.0 : 1.8)))
                        : committedQty;

                      const isOrdersExpanded = expandedDealOrders[deal.id] !== false;

                      return (
                        <div
                          key={deal.id}
                          className="bg-[#2b2d31] rounded-3xl border border-[#383a40] p-5 sm:p-6 text-white space-y-6 hover:border-amber-500/30 transition shadow-xl"
                        >
                          {/* Top Supplier & Status Meta */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#383a40] pb-4">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>متبقي {deal.daysLeft} أيام</span>
                              </span>
                              <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{deal.supplier} • {deal.supplierCity}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-black border border-amber-500/20">
                                {deal.id === 'grp-5' ? '👗 كريب وفساتين' : deal.category === 'tissu' ? '🧵 قماش معتمد' : '📦 لوازم وتغليف'}
                              </span>
                              <span className="text-xs text-slate-300 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                                🔥 <strong>{dealOrders.length}</strong> براندات انضمت حتى الآن
                              </span>
                            </div>
                          </div>

                          {/* Main Fabric Presentation: Photo Gallery (Left) + Details & Pricing (Right) */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                            {/* COLUMN 1: FABRIC PHOTO & TEXTURE GALLERY (4 cols) */}
                            <div className="lg:col-span-4 space-y-3">
                              <div
                                onClick={() => setSelectedDealForDetail(deal)}
                                className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#1e1f22] border border-[#383a40] group cursor-pointer shadow-lg"
                              >
                                <img
                                  src={currentImage}
                                  alt={deal.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
                                  <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-amber-300 text-[11px] font-black border border-amber-400/30">
                                    ⚖️ {deal.gsm}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-slate-200 text-[10px] font-bold">
                                    📐 عرض {deal.width}
                                  </span>
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                                  <span className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xl">
                                    <ZoomIn className="w-4 h-4" />
                                    <span>تكبير وفحص نسيج الثوب</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {deal.images.map((img, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveDealImageIdx(prev => ({ ...prev, [deal.id]: idx }))}
                                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer relative ${
                                      activeImgIdx === idx
                                        ? 'border-amber-400 shadow-md ring-2 ring-amber-500/30'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                  >
                                    <img src={img} alt="texture" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setSelectedDealForDetail(deal)}
                                  className="h-14 px-3 rounded-xl bg-[#1e1f22] hover:bg-[#35373c] text-slate-300 text-[11px] font-bold flex flex-col items-center justify-center border border-white/5 shrink-0 transition cursor-pointer"
                                  title="عرض كل الصور والتفاصيل"
                                >
                                  <Eye className="w-4 h-4 text-amber-400 mb-0.5" />
                                  <span>الكل ({deal.images.length})</span>
                                </button>
                              </div>
                              <span className="text-[11px] text-slate-400 block text-center font-medium">
                                انقر على أي صورة لمعاينة النسيج، الوبر والوقفة عن قرب
                              </span>
                            </div>

                            {/* COLUMN 2: TITLE, SPECS & DUAL PRICING (8 cols) */}
                            <div className="lg:col-span-8 space-y-4">
                              <div>
                                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                                  {deal.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
                                  {deal.material}
                                </p>
                              </div>

                              {/* THE DUAL PRICING BOX */}
                              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1e1f22] to-[#25272b] border border-amber-500/25 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-white/5 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <Tag className="w-4 h-4 text-amber-400" />
                                    <span>سعر الشراء المشترك بالجملة الكبرى:</span>
                                  </span>
                                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                    توفير 15% إلى 25% مقارنة بسعر السوق
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {(dealUnitView === 'both' || dealUnitView === 'kg') && (
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                                      <span className="text-[11px] text-slate-400 font-bold block">
                                        ⚖️ سعر الكيلو (Prix au Kilo):
                                      </span>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-amber-400 font-mono">
                                          {deal.primaryUnit === 'kg' ? deal.discountPrice : (deal.discountPrice * 2).toFixed(1)} MAD
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">/ كلغ</span>
                                        <span className="text-xs text-slate-500 line-through font-mono">
                                          {deal.primaryUnit === 'kg' ? deal.regularPrice : (deal.regularPrice * 2).toFixed(1)} MAD
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-emerald-400 font-semibold block">
                                        {deal.primaryUnit === 'kg'
                                          ? `توفير ${deal.regularPrice - deal.discountPrice} درهم فـ كل كيلو`
                                          : 'سعر تقديري بحساب الوزن'}
                                      </span>
                                    </div>
                                  )}

                                  {(dealUnitView === 'both' || dealUnitView === 'meter') && deal.pricePerMeterEstimated && (
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                                      <span className="text-[11px] text-slate-400 font-bold block">
                                        📏 السعر التقديري بالمتر (Prix au Mètre):
                                      </span>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-amber-400 font-mono">
                                          ~{deal.pricePerMeterEstimated.toFixed(2)} MAD
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">/ متر</span>
                                        {deal.regularPricePerMeterEstimated && (
                                          <span className="text-xs text-slate-500 line-through font-mono">
                                            ~{deal.regularPricePerMeterEstimated.toFixed(2)} MAD
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-indigo-300 font-semibold block">
                                        بحساب عرض الثوب ({deal.width})
                                      </span>
                                    </div>
                                  )}

                                  {!deal.pricePerMeterEstimated && (
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                                      <span className="text-[11px] text-slate-400 font-bold block">
                                        📦 سعر الطقم / القطعة:
                                      </span>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-amber-400 font-mono">
                                          {deal.discountPrice} MAD
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">/ طقم</span>
                                        <span className="text-xs text-slate-500 line-through font-mono">
                                          {deal.regularPrice} MAD
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-emerald-400 font-semibold block">
                                        سحاب YKK نمرة 5 + كيس Polybag بسحاب مات
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="p-3 rounded-xl bg-[#18191c] border border-white/5 space-y-1.5 text-xs">
                                  <div className="flex items-start gap-2 text-slate-300">
                                    <Ruler className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-amber-300">معادلة التحويل: </strong>
                                      <span>{deal.conversionNote}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 text-slate-300">
                                    <Scissors className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-emerald-300">استهلاك الفصالة: </strong>
                                      <span>{deal.garmentYield}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLOR SWATCHES */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="text-slate-300 flex items-center gap-1.5">
                                    <Palette className="w-4 h-4 text-amber-400" />
                                    <span>الألوان المتوفرة في هذه الدفعة (انقر لاختيار لونك):</span>
                                  </span>
                                  <span className="text-[11px] text-emerald-400 font-semibold">
                                    ✓ تم اختيار: <strong className="text-white underline">{chosenColor}</strong>
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                  {deal.colors.map((c, cIdx) => {
                                    const isSelected = chosenColor === c.name;
                                    return (
                                      <button
                                        key={cIdx}
                                        type="button"
                                        onClick={() => setSelectedDealColor(prev => ({ ...prev, [deal.id]: c.name }))}
                                        title={`${c.name} - ${c.tagAr}`}
                                        className={`group relative flex items-center gap-1.5 p-1.5 pr-2.5 rounded-full border transition cursor-pointer ${
                                          isSelected
                                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-500/30'
                                            : 'bg-[#1e1f22] border-white/10 hover:border-white/30'
                                        }`}
                                      >
                                        <span
                                          className="w-5 h-5 rounded-full border border-white/20 shadow-inner shrink-0"
                                          style={{ backgroundColor: c.hex }}
                                        />
                                        <span className="text-xs text-slate-200 font-bold">{String(c.name || '').split('(')[0]}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* TECHNICAL SPECIFICATIONS GRID */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5 text-center space-y-0.5">
                                  <span className="text-[10px] text-slate-400 font-bold block">الغراماج والسمك</span>
                                  <span className="text-xs font-black text-amber-300 block font-mono">{String(deal.gsm || '').split('(')[0]}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5 text-center space-y-0.5">
                                  <span className="text-[10px] text-slate-400 font-bold block">التركيبة</span>
                                  <span className="text-xs font-black text-slate-200 block truncate" title={deal.composition}>{String(deal.composition || '').split('(')[0]}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5 text-center space-y-0.5">
                                  <span className="text-[10px] text-slate-400 font-bold block">عرض الثوب (Laize)</span>
                                  <span className="text-xs font-black text-slate-200 block font-mono">{String(deal.width || '').split('(')[0]}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#1e1f22] border border-white/5 text-center space-y-0.5">
                                  <span className="text-[10px] text-slate-400 font-bold block">المعالجة والانكماش</span>
                                  <span className="text-xs font-black text-emerald-400 block truncate" title={deal.treatment}>{deal.shrinkage}</span>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Progress Bar with Live Quantities */}
                          <div className="pt-2 border-t border-[#383a40]">
                            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                              <span className="text-slate-300">
                                تم جمع: <strong className="text-emerald-400 font-mono text-sm">{liveCurrentQty} {deal.primaryUnitLabelAr}</strong> من الهدف المحدد ({deal.targetKg} {deal.primaryUnitLabelAr})
                              </span>
                              <span className="text-amber-400 font-mono font-black text-sm">{progressPct}%</span>
                            </div>
                            <div className="w-full h-3 bg-[#1e1f22] rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* 👥 REAL PARTICIPATING BRANDS SECTION (قائمة البراندات المنضمة للدفعة) */}
                          <div className="p-4 rounded-2xl bg-[#1e1f22] border border-emerald-500/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-black text-white">
                                  البراندات المشاركة في هذه الدفعة ({dealOrders.length} طلبات مؤكدة)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedDealOrders(prev => ({ ...prev, [deal.id]: !isOrdersExpanded }))}
                                className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isOrdersExpanded ? 'إخفاء القائمة' : 'عرض كافة المنضمين'}</span>
                                {isOrdersExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {isOrdersExpanded && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 animate-in fade-in duration-200">
                                {dealOrders.map(order => (
                                  <div
                                    key={order.id}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                                      order.id.startsWith('usr-')
                                        ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/40'
                                        : 'bg-black/30 border-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-black text-[11px] text-white shrink-0">
                                        {order.brandName.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="truncate">
                                        <p className="font-black text-white text-[11px] truncate">{order.brandName}</p>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                          <span>{order.city}</span>
                                          <span>•</span>
                                          <span className="text-amber-300 font-bold">{order.quantity} {order.unit}</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-left shrink-0">
                                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30 flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5" />
                                        <span>مؤكد</span>
                                      </span>
                                      <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">{order.date}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* CTA ACTIONS BAR: INTERACTIVE BOOKING MODAL + DETAILS + WHATSAPP */}
                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#383a40]">
                            <button
                              type="button"
                              onClick={() => openBookingModal(deal)}
                              className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 text-white font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-98 cursor-pointer ring-2 ring-emerald-400/40"
                            >
                              <ShoppingBag className="w-4 h-4 text-white" />
                              <span>انضم للشراء المشترك واحجز كميتك الآن ({deal.minCommitmentLabel})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedDealForDetail(deal)}
                              className="w-full sm:w-auto px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-amber-400" />
                              <span>فحص النسيج والفيش تكنيك</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 2: CUSTOM REQUESTS & SUPPLIER REPLIES (طلبات البراندات وعروض الموردين)
                    ───────────────────────────────────────────────────────────── */}
                {groupageSubTab === 'requests' && (
                  <div className="space-y-6">
                    {/* Header Banner for Requests */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#1e1f22] border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-400" />
                          <span>طلبات الأقمشة واستفسارات البراندات (Appels d'offres)</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          اطرح طلبك لأي قماش أو فورنيتور خاص وغادي يجاوبوك الموردين المعتمدين بعروض أسعار حقيقية وتخفيضات الجملة.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCreateCustomRequestModal(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>نشر طلب قماش جديد</span>
                      </button>
                    </div>

                    {/* Requests List */}
                    <div className="space-y-4">
                      {customRequests.map(req => (
                        <div
                          key={req.id}
                          className="p-5 sm:p-6 bg-[#2b2d31] rounded-3xl border border-[#383a40] space-y-4 hover:border-amber-500/30 transition shadow-lg text-white"
                        >
                          {/* Request Meta Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-xs text-white">
                                {req.brandName.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <h4 className="font-black text-white text-xs sm:text-sm">{req.brandName}</h4>
                                <p className="text-[10px] text-slate-400">{req.city} • نشر {req.date}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/30">
                                مفتوح لعروض الموردين 🟢
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-black border border-amber-500/30 font-mono">
                                مطلوب: {req.targetQty} {req.unit}
                              </span>
                            </div>
                          </div>

                          {/* Request Title & Details */}
                          <div className="space-y-2">
                            <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                              {req.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium bg-[#1e1f22] p-3 rounded-xl border border-white/5">
                              {req.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                              {req.targetPriceMAD && (
                                <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                  الميزانية المقترحة: <strong>~{req.targetPriceMAD} MAD / {req.unit}</strong>
                                </span>
                              )}
                              {req.materialNeeded && (
                                <span className="text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                  الخامة: <strong>{req.materialNeeded}</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* SUPPLIER RESPONSES SECTION (عروض الموردين الحقيقية) */}
                          <div className="space-y-3 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-amber-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>عروض وأسعار الموردين المعتمدين ({req.replies.length} عروض):</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyModalRequest(req);
                                  setSupplierReplyForm({
                                    supplierName: 'دار الكريب والأقمشة النسائية (Derb Omar)',
                                    supplierCity: 'الدار البيضاء',
                                    priceMAD: req.targetPriceMAD || 35,
                                    unit: req.unit,
                                    minQty: 25,
                                    deliveryTime: '24 ساعة داخل كازا • 48 ساعة لباقي المدن',
                                    message: `السلام عليكم، طلبكم بخصوص ${req.materialNeeded} متوفر لدينا بالكامل مع إمكانية إرسال العينات مجاناً.`,
                                    whatsapp: '212661902834'
                                  });
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>تقديم عرض سعر كمورد</span>
                              </button>
                            </div>

                            {/* Replies Cards */}
                            {req.replies.length > 0 ? (
                              <div className="space-y-2">
                                {req.replies.map(reply => (
                                  <div
                                    key={reply.id}
                                    className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1e1f22] to-[#252830] border border-emerald-500/30 space-y-2.5"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-500/20 border border-emerald-500/40 shrink-0">
                                          {reply.supplierAvatar ? (
                                            <img src={reply.supplierAvatar} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <span className="text-xs font-black text-emerald-400 flex items-center justify-center h-full">🧵</span>
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <h5 className="font-black text-white text-xs">{reply.supplierName}</h5>
                                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">مورد معتمد ✓</span>
                                          </div>
                                          <p className="text-[10px] text-slate-400">{reply.supplierCity} • رد {reply.date}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <div className="bg-black/40 px-3 py-1 rounded-xl border border-white/5 text-right">
                                          <span className="text-[10px] text-slate-400 block">السعر المعروض:</span>
                                          <span className="text-xs font-black text-amber-400 font-mono">{reply.priceMAD} MAD / {reply.unit}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <p className="text-xs text-slate-200 leading-relaxed font-medium bg-black/20 p-2.5 rounded-xl border border-white/5">
                                      {reply.message}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                                      <span>⚡ سرعة التسليم: <strong className="text-slate-200">{reply.deliveryTime}</strong></span>
                                      <a
                                        href={`https://wa.me/${reply.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                          `السلام عليكم ${reply.supplierName}، اطلعت على عرضكم بخصوص طلب "${req.title}" بسعر ${reply.priceMAD} MAD/${reply.unit} وأرغب في تأكيد الطلب واستلام العينات.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5 text-slate-950" />
                                        <span>قبول العرض والتواصل فـ الواتساب</span>
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 rounded-xl bg-black/20 border border-dashed border-white/10 text-center text-xs text-slate-400">
                                لا توجد عروض أسعار مسجلة بعد. سيصلك إشعار فور تقديم الموردين لعروضهم على هذا الطلب.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* VIEW D: MY PROFILE & SETTINGS */}
          {activeView === 'profile' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-xl mx-auto w-full space-y-6">
              <div className="p-6 rounded-3xl bg-[#2b2d31] border border-[#383a40] text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                    {((userProfile?.brandName || 'B').charAt(0)).toUpperCase()}
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
            COLUMN 3: DISCORD MEMBERS & SPECIALISTS LIST (ONLY IN CHAT VIEW)
        ───────────────────────────────────────────────────────────── */}
        {activeView === 'chat' && (
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
                      <p className="text-[10px] text-slate-400 truncate">{String(mod.specialty || '').split('•')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 2: Tissu Suppliers */}
            <div>
              <div className="px-2 mb-1 text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>🧵 مالين الثوب</span>
                <span>({allProMembers.filter(m => m.pillar === 'tissu').length})</span>
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
                      {((b || 'B').charAt(0)).toUpperCase()}
                    </div>
                    <p className="text-xs text-slate-300 truncate font-medium">{b}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>
      )}

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
                {selectedMemberProfile.specialtyTag && (
                  <div className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{selectedMemberProfile.specialtyTag}</span>
                  </div>
                )}
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

              {/* Previous Brands Worked With */}
              {selectedMemberProfile.brandsWorkedWith && selectedMemberProfile.brandsWorkedWith.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-amber-500/20 space-y-1.5 text-xs">
                  <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>علامات تجارية ودور أزياء تعاون معها:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedMemberProfile.brandsWorkedWith.map((b: string, bIdx: number) => (
                      <span key={bIdx} className="px-2.5 py-1 rounded-lg bg-[#1e1f22] text-white font-bold text-xs border border-white/10 shadow-xs flex items-center gap-1">
                        <span className="text-amber-400">✓</span>
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Showcase Grid */}
              {selectedMemberProfile.portfolio && selectedMemberProfile.portfolio.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">معرض نماذج الباترون والتصاميم المنجزة:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedMemberProfile.portfolio.map((p: any, pIdx: number) => (
                      <div
                        key={pIdx}
                        onClick={() => setSelectedPortfolioItem({ item: p, author: selectedMemberProfile.name, proId: selectedMemberProfile.id })}
                        className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-amber-400 cursor-pointer bg-black/40 aspect-4/3 transition"
                      >
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                          <span className="text-[10px] font-black text-white truncate">{p.title}</span>
                          <span className="text-[9px] text-amber-300">{p.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modéliste Action CTAs inside Profile Popout */}
              {selectedMemberProfile.pillar === 'modelistes' && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setEscrowTarget(selectedMemberProfile);
                      setEscrowAmount(selectedMemberProfile.pricing?.basePattern ? selectedMemberProfile.pricing.basePattern + 100 : 350);
                      setEscrowServiceTitle(`باترون رقمي متكامل (${selectedMemberProfile.categoryLabel || selectedMemberProfile.specialty}) + تدريج المقاسات XS-XXL`);
                      setEscrowSuccessSlip(null);
                      setShowEscrowModal(true);
                      setSelectedMemberProfile(null);
                    }}
                    className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>طلب باترون (BEYA Escrow)</span>
                  </button>

                  <button
                    onClick={() => {
                      setConsultationTarget(selectedMemberProfile);
                      setConsultationConfirmedSlip(null);
                      setShowConsultationModal(true);
                      setSelectedMemberProfile(null);
                    }}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-cyan-300" />
                    <span>حجز استشارة (Visio / مكتب)</span>
                  </button>
                </div>
              )}

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

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SUBMIT PROPOSAL ON CLIENT JOB REQUEST (تقديم عرض على مشروع)
      ───────────────────────────────────────────────────────────── */}
      {showProposalModal && selectedJobForProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-xl bg-[#232428] rounded-3xl overflow-hidden border border-[#383a40] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white space-y-0"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-[#383a40] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>تقديم عرض على طلب مشروع</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      عرض تعاقدي موثق
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">قدّم عرضك المالي وموعد التسليم ليدرس العميل ملفك ويقبله</p>
                </div>
              </div>

              <button
                onClick={() => { setShowProposalModal(false); setProposalSubmittedSlip(null); }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Proposal Submitted -> Show Confirmation Slip */}
            {proposalSubmittedSlip ? (
              <div className="p-6 space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-black/60 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 inline-block mb-1">
                      تم تسجيل وإرسال عرضك بنجاح
                    </span>
                    <h4 className="text-lg font-black text-white">بطاقة العرض المقدم الرسمي</h4>
                    <p className="text-xs text-slate-300 mt-1">كود العرض: <strong className="font-mono text-emerald-400">{proposalSubmittedSlip.ref}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#1e1f22] border border-white/5 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">المشروع المطلوب:</span>
                    <strong className="text-white text-left max-w-xs truncate">{proposalSubmittedSlip.jobTitle}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">العميل / البراند:</span>
                    <strong className="text-amber-300">{proposalSubmittedSlip.brandName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">الموديليست المتقدم:</span>
                    <span className="text-white font-bold">{proposalSubmittedSlip.authorName} ({proposalSubmittedSlip.authorPhone || 'واتساب'})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">سعر العرض المقدم:</span>
                    <strong className="text-amber-400 font-mono text-sm">{proposalSubmittedSlip.proposedPrice} MAD</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">مدة التسليم المقترحة:</span>
                    <span className="text-emerald-300 font-bold">{proposalSubmittedSlip.duration}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-slate-400 block mb-1">تفاصيل خطة العمل:</span>
                    <p className="text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">{proposalSubmittedSlip.message}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={`https://wa.me/${proposalSubmittedSlip.clientWhatsapp}?text=${encodeURIComponent(
                      `السلام عليكم أخي صاحب براند ${proposalSubmittedSlip.brandName}، لقد قدمت لك عرضاً رسمياً على منصة BEYA NETWORK بخصوص مشروعك:\n"${proposalSubmittedSlip.jobTitle}"\n• كود العرض: ${proposalSubmittedSlip.ref}\n• السعر: ${proposalSubmittedSlip.proposedPrice} MAD\n• المدة: ${proposalSubmittedSlip.duration}\n• مقدم العرض: الموديليست ${proposalSubmittedSlip.authorName}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تأكيد العرض فـ الواتساب مع العميل</span>
                  </a>

                  <button
                    onClick={() => { setShowProposalModal(false); setProposalSubmittedSlip(null); }}
                    className="w-full sm:w-auto py-3 px-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!selectedJobForProposal) return;
                  const slip = {
                    ref: `BYA-PROP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    jobTitle: selectedJobForProposal.title,
                    brandName: selectedJobForProposal.brand,
                    clientWhatsapp: selectedJobForProposal.contactWhatsapp || '212675239885',
                    authorName: proposalAuthorName || userProfile.name || 'موديليست محترف',
                    authorPhone: proposalAuthorPhone || '0600000000',
                    proposedPrice: proposalPrice,
                    duration: proposalDuration,
                    message: proposalMessage,
                    date: new Date().toLocaleDateString('ar-MA')
                  };
                  setProposalSubmittedSlip(slip);

                  // Update job proposal count
                  const updated = jobsList.map(j => {
                    if (j.id === selectedJobForProposal.id) {
                      return { ...j, proposalsCount: (j.proposalsCount || 0) + 1 };
                    }
                    return j;
                  });
                  setJobsList(updated);
                  try {
                    localStorage.setItem('beya_freelance_jobs', JSON.stringify(updated));
                  } catch {}
                }}
                className="p-5 sm:p-6 space-y-4 text-xs"
              >
                {/* Target Job Info Card */}
                <div className="p-3.5 rounded-2xl bg-[#1e1f22] border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold">الطلب المستهدف:</span>
                    <span className="text-[10px] font-mono text-amber-400 font-black">ميزانية العميل: {selectedJobForProposal.budgetMAD} MAD</span>
                  </div>
                  <h4 className="font-bold text-white text-xs leading-snug">{selectedJobForProposal.title}</h4>
                  <p className="text-[11px] text-slate-400">{selectedJobForProposal.brand} • {selectedJobForProposal.city}</p>
                </div>

                {/* Modéliste Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">اسم الموديليست / الاستوديو:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: يونس الفاسي - Fashion Modéliste"
                      value={proposalAuthorName}
                      onChange={e => setProposalAuthorName(e.target.value)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">رقم الواتساب للتواصل:</label>
                    <input
                      type="tel"
                      required
                      placeholder="06XXXXXXXX"
                      value={proposalAuthorPhone}
                      onChange={e => setProposalAuthorPhone(e.target.value)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Price & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">قيمتك المقترحة (بالدرهم MAD):</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min={50}
                        max={10000}
                        value={proposalPrice}
                        onChange={e => setProposalPrice(Number(e.target.value) || 0)}
                        className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none font-mono font-bold"
                      />
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-[11px]">MAD</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">مدة التسليم المتوقعة:</label>
                    <select
                      value={proposalDuration}
                      onChange={e => setProposalDuration(e.target.value)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="24 ساعة (تسليم سريع)">24 ساعة (تسليم سريع)</option>
                      <option value="يومان (48 ساعة)">يومان (48 ساعة)</option>
                      <option value="3 إلى 4 أيام">3 إلى 4 أيام</option>
                      <option value="أسبوع كامل">أسبوع كامل</option>
                    </select>
                  </div>
                </div>

                {/* Pitch Message */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">تفاصيل العرض وطريقة العمل (Pitch):</label>
                  <textarea
                    rows={4}
                    required
                    value={proposalMessage}
                    onChange={e => setProposalMessage(e.target.value)}
                    placeholder="اشرح للعميل كيف ستنجز الباترون، البرامج المستعملة (Lectra / CLO 3D)، والملفات التي ستسلمها..."
                    className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Escrow Guarantee Notice */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>مستحقاتك محمية بواسطة BEYA Escrow. لن تبدأ العمل حتى يودع العميل المبلغ في حساب الضمان.</span>
                </div>

                {/* Submit CTA */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>تأكيد وإرسال العرض للعميل</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: POST A NEW JOB / PROJECT REQUEST (نشر طلب أو مشروع جديد)
      ───────────────────────────────────────────────────────────── */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-xl bg-[#232428] rounded-3xl overflow-hidden border border-[#383a40] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white space-y-0"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-[#383a40] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>نشر طلب أو مشروع فصالة وباترون</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      مجاني 100%
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">انشر طلبك وسيصلك عروض فورية من أفضل الموديليست المعتمدين</p>
                </div>
              </div>

              <button
                onClick={() => { setShowPostJobModal(false); setJobPostedSuccessSlip(null); }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Posted Successfully -> Slip */}
            {jobPostedSuccessSlip ? (
              <div className="p-6 space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-black/60 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 inline-block mb-1">
                      تم نشر مشروعك بنجاح في المنصة
                    </span>
                    <h4 className="text-lg font-black text-white">بطاقة المشروع المعلن</h4>
                    <p className="text-xs text-slate-300 mt-1">كود المشروع: <strong className="font-mono text-amber-400">{jobPostedSuccessSlip.ref}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#1e1f22] border border-white/5 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">عنوان المشروع:</span>
                    <strong className="text-white text-left max-w-xs truncate">{jobPostedSuccessSlip.title}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">البراند المعلن:</span>
                    <strong className="text-amber-300">{jobPostedSuccessSlip.brand} ({jobPostedSuccessSlip.city})</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">الميزانية المرصودة:</span>
                    <strong className="text-amber-400 font-mono text-sm">{jobPostedSuccessSlip.budget} MAD</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">الحالة:</span>
                    <span className="text-emerald-400 font-bold">مفتوح لاستقبال عروض الموديليست</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowPostJobModal(false);
                      setJobPostedSuccessSlip(null);
                      setFreelanceTab('jobs');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
                  >
                    تصفح المشروع في قائمة طلبات الإنتاج النشطة
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newJobTitle.trim()) return;
                  const newJob = {
                    id: `job-${Date.now()}`,
                    title: newJobTitle,
                    brand: newJobBrand || 'علامة تجارية مستقلة',
                    city: newJobCity,
                    budgetMAD: Number(newJobBudget) || 350,
                    category: newJobCategory,
                    categoryLabel: newJobCategory === 'streetwear' ? 'ستريت وير وهوديز' :
                                   newJobCategory === 'denim' ? 'جينز ودينيم وكارجو' :
                                   newJobCategory === 'femme' ? 'أزياء نسائية ومودست' : 'ملابس رياضية وتقنية',
                    description: newJobDescription,
                    skills: ['Lectra Modaris', 'CLO 3D', 'Gradation S-XXL', 'Fiche Technique'],
                    proposalsCount: 0,
                    postedAt: 'الآن',
                    urgent: true,
                    contactWhatsapp: newJobWhatsapp.replace(/\D/g, '') || '212675239885',
                    workMode: newJobWorkMode
                  };

                  const updated = [newJob, ...jobsList];
                  setJobsList(updated);
                  const updatedMyJobIds = [newJob.id, ...myPostedJobIds];
                  setMyPostedJobIds(updatedMyJobIds);
                  try {
                    localStorage.setItem('beya_freelance_jobs', JSON.stringify(updated));
                    localStorage.setItem('beya_my_posted_jobs', JSON.stringify(updatedMyJobIds));
                  } catch {}

                  setJobPostedSuccessSlip({
                    ref: `BYA-JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    title: newJob.title,
                    brand: newJob.brand,
                    city: newJob.city,
                    budget: newJob.budgetMAD,
                    date: new Date().toLocaleDateString('ar-MA')
                  });
                }}
                className="p-5 sm:p-6 space-y-4 text-xs"
              >
                {/* ── BEYA TECH PACK DIRECT IMPORT BAR (استيراد مباشر من BEYA) ── */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-indigo-500/15 border border-amber-500/30 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>استيراد الموديل مباشرة من BEYA Tech Pack</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Auto-Fill
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-300">
                          اختر أحد الموديلات ليتم ملء العنوان، القماش، والمواصفات الفنية تلقائياً
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        onChange={e => {
                          const val = e.target.value;
                          if (!val) return;
                          handleImportFromBeya(val);
                        }}
                        defaultValue=""
                        className="bg-[#1e1f22] text-amber-300 font-bold text-xs px-3 py-2 rounded-xl border border-amber-500/40 focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>-- استيراد من BEYA Tech Pack --</option>
                        <option value="crop-top">Top Manches Longues (Crop Top) - كوت ريب 250g</option>
                        <option value="hoodie">هودي أوفرسايز Drop Shoulder - ميلتون 380g</option>
                        <option value="cargo">سروال كارجو 6 جيوب تكتيكية - كانفاس ريبستوب</option>
                        <option value="boxy-tee">تيشيرت Boxy Fit 240g (Winner Product)</option>
                        <option value="abaya">عباية كيمونو عصرية - كريب دو سوا 100%</option>
                        <option value="activewear">طقم رياضي نسائي Seamless - 4-Way Stretch</option>
                      </select>
                    </div>
                  </div>

                  {importedModelSuccess && (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>تم استيراد مواصفات ({importedModelSuccess}) بنجاح من BEYA Tech Pack Studio وتعبئة الحقول!</span>
                    </div>
                  )}
                </div>

                {/* Job Title */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">عنوان المشروع أو الطلب:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطلوب موديليست لإنجاز باترون هودي أوفرسايز 380g مع تدريج S-XXL"
                    value={newJobTitle}
                    onChange={e => setNewJobTitle(e.target.value)}
                    className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none font-bold"
                  />
                </div>

                {/* Brand & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">اسم البراند أو الورشة:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: Casablanca Street Wear"
                      value={newJobBrand}
                      onChange={e => setNewJobBrand(e.target.value)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">المدينة:</label>
                    <select
                      value={newJobCity}
                      onChange={e => setNewJobCity(e.target.value)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="الدار البيضاء">الدار البيضاء</option>
                      <option value="طنجة">طنجة</option>
                      <option value="الرباط">الرباط</option>
                      <option value="فاس">فاس</option>
                      <option value="مراكش">مراكش</option>
                      <option value="أكادير">أكادير</option>
                    </select>
                  </div>
                </div>

                {/* Category & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">القسم والتخصص:</label>
                    <select
                      value={newJobCategory}
                      onChange={e => setNewJobCategory(e.target.value as any)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="streetwear">ستريت وير وهوديز</option>
                      <option value="denim">جينز وكارجو ودينيم</option>
                      <option value="femme">أزياء نسائية ومودست</option>
                      <option value="sport">ملابس رياضية وتقنية</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">الميزانية المرصودة (MAD):</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min={100}
                        max={20000}
                        value={newJobBudget}
                        onChange={e => setNewJobBudget(Number(e.target.value) || 0)}
                        className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none font-mono font-bold"
                      />
                      <span className="absolute left-3 top-2.5 text-amber-400 font-bold text-[11px]">MAD</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Format & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">
                      صيغة تسليم الباترون المطلوبة:
                    </label>
                    <select
                      value={newJobWorkMode}
                      onChange={e => setNewJobWorkMode(e.target.value as any)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none font-bold"
                    >
                      <option value="digital">صيغة رقمية ديجيتال (ملفات DXF AAMA / CLO 3D / PDF)</option>
                      <option value="paper">نسخة ورقية مطبوعة على ورق البلوتر الصناعي (Papier Plotter 1:1)</option>
                      <option value="both">كلاهما معاً (ملفات ديجيتال + نسخة ورقية مطبوعة للورشة)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">رقم الواتساب للتواصل:</label>
                    <input
                      type="tel"
                      required
                      placeholder="06XXXXXXXX"
                      value={newJobWhatsapp}
                      onChange={e => setNewJobWhatsapp(e.target.value)}
                      className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">تفاصيل ومتطلبات الموديل والباترون:</label>
                  <textarea
                    rows={4}
                    required
                    value={newJobDescription}
                    onChange={e => setNewJobDescription(e.target.value)}
                    placeholder="اكتب بالتفصيل: نوع القماش، الوزن، جدول المقاسات المطلوب (S-XXL)، تفاصيل الجيوب والقصات، وهل تحتاج محاكاة 3D..."
                    className="w-full bg-[#1e1f22] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPostJobModal(false)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-slate-950" />
                    <span>نشر المشروع الآن في المنصة</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BEYA ESCROW PAYMENT & TRANSACTION PROTECTION MODAL
      ───────────────────────────────────────────────────────────── */}
      {showEscrowModal && escrowTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-xl bg-[#232428] rounded-3xl overflow-hidden border border-[#383a40] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white space-y-0"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-[#383a40] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>نظام حماية الأموال BEYA Escrow</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">حماية 100%</span>
                  </h3>
                  <p className="text-xs text-slate-400">أموالك محفوظة في حساب الضمان حتى تستلم وتوافق على الباترون</p>
                </div>
              </div>

              <button
                onClick={() => { setShowEscrowModal(false); setEscrowSuccessSlip(null); }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Payment Confirmed -> Render Official Escrow Slip */}
            {escrowSuccessSlip ? (
              <div className="p-6 space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-black/60 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 inline-block mb-1">
                      تم تسجيل وتأمين العملية في BEYA ESCROW بنجاح
                    </span>
                    <h4 className="text-lg font-black text-white">وصل حماية المستحقات الرسمي</h4>
                    <p className="text-xs text-slate-300 mt-1">كود المعاملة المشفرة: <strong className="font-mono text-amber-400">{escrowSuccessSlip.code}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#1e1f22] border border-white/5 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">الموديليست المكلف:</span>
                    <strong className="text-white">{escrowSuccessSlip.modelisteName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">الخدمة المطلوبة:</span>
                    <span className="text-slate-200 font-bold text-left">{escrowSuccessSlip.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">المبلغ المحمي في الضمان:</span>
                    <strong className="text-amber-400 font-mono text-sm">{escrowSuccessSlip.amountMAD} MAD</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">طريقة الأداء:</span>
                    <span className="text-cyan-300 font-bold">{escrowSuccessSlip.methodLabel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">صاحب الطلب / البراند:</span>
                    <strong className="text-white">{escrowSuccessSlip.payerName || userProfile.brandName}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">حالة الأموال:</span>
                    <span className="text-emerald-400 font-black">🔒 محفوظة في الضمان (SÉQUESTRE SÉCURISÉ)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                  🛡️ <strong>شرط الإفراج عن المبلغ:</strong> سيبدأ الموديليست العمل فوراً. لن يتم تحويل المستحقات إلى حسابه إلا بعد تسليمك ملفات الباترون كاملة وتأكيدك لمطابقتها للطلب.
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={`https://wa.me/${escrowTarget.whatsapp}?text=${encodeURIComponent(
                      `السلام عليكم أستاذ(ة) ${escrowTarget.name}، لقد قمت بإيداع طلب باترون رسمي وتأمين مستحقاتكم عبر BEYA Escrow!\n• كود العملية: ${escrowSuccessSlip.code}\n• المبلغ في الضمان: ${escrowSuccessSlip.amountMAD} MAD\n• الخدمة: ${escrowSuccessSlip.serviceTitle}\n• البراند: ${escrowSuccessSlip.payerName || userProfile.brandName}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إشعار الموديليست فـ الواتساب لبدء العمل فوراً</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>طباعة الوصل</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Payment & Escrow Form */
              <div className="p-5 sm:p-6 space-y-5">
                {/* Modéliste Mini Summary */}
                <div className="p-3.5 rounded-2xl bg-[#1e1f22] border border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={escrowTarget.avatar} alt={escrowTarget.name} className="w-12 h-12 rounded-xl object-cover border border-amber-500/30" />
                    <div>
                      <h4 className="text-sm font-black text-white">{escrowTarget.name}</h4>
                      <p className="text-xs text-amber-300">{escrowTarget.categoryLabel || escrowTarget.specialty}</p>
                      <span className="text-[11px] text-slate-400">📍 {escrowTarget.city} • ⭐ {escrowTarget.rating}</span>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-[10px] text-slate-400 block">ضمان المنصة</span>
                    <span className="text-xs font-black text-emerald-400">BEYA Escrow</span>
                  </div>
                </div>

                {/* Service Selection / Custom Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">اختر نوع الخدمة أو حدد المبلغ المتفق عليه:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { title: 'باترون أساسي + تدريج المقاسات XS-XXL', price: escrowTarget.pricing?.basePattern ? escrowTarget.pricing.basePattern + 100 : 350 },
                      { title: 'كوليكسيون مصغرة (3 موديلات مع Fiches Tech)', price: 950 },
                      { title: 'كوليكسيون كاملة (5 موديلات مع محاكاة 3D)', price: 1600 }
                    ].map((srv, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setEscrowAmount(srv.price); setEscrowServiceTitle(srv.title); }}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          escrowAmount === srv.price && escrowServiceTitle === srv.title
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-[#1e1f22] border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <span className="font-bold text-[11px] truncate">{srv.title}</span>
                        <span className="font-black text-amber-400 font-mono shrink-0">{srv.price} MAD</span>
                      </div>
                    ))}
                  </div>

                  {/* Custom Amount Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 shrink-0">أو حدد مبلغاً مخصصاً:</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={escrowAmount}
                        onChange={e => setEscrowAmount(Number(e.target.value) || 0)}
                        className="w-full bg-[#1e1f22] text-xs font-bold text-white px-3 py-2 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                      />
                      <span className="absolute left-3 top-2 text-xs text-amber-400 font-bold">MAD</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Switcher Tabs */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">اختر طريقة الدفع لتأمين المبلغ:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEscrowPaymentMethod('local')}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        escrowPaymentMethod === 'local'
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-400 text-white'
                          : 'bg-[#1e1f22] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>🇲🇦 تحويل بنكي مغربي / كاش</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEscrowPaymentMethod('paypal')}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        escrowPaymentMethod === 'paypal'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white'
                          : 'bg-[#1e1f22] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 text-cyan-400" />
                      <span>🌍 PayPal & بطاقات دولية</span>
                    </button>
                  </div>

                  {/* Tab 1: Local Moroccan Payment Details */}
                  {escrowPaymentMethod === 'local' && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#1e1f22] border border-amber-500/20 space-y-1.5">
                        <span className="text-[11px] font-black text-amber-300 block">حساب الضمان البنكي الرسمي (BEYA Escrow):</span>
                        <div className="flex items-center justify-between font-mono text-xs text-white bg-black/50 p-2 rounded-lg border border-white/5">
                          <span>RIB: 230 780 0001234567890123 45</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('230780000123456789012345');
                              alert('تم نسخ رقم الـ RIB بنجاح!');
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>نسخ</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <p>• <strong>البنك:</strong> التجاري وفا بنك (Attijariwafa Bank) أو CIH Bank</p>
                          <p>• <strong>اسم المستفيد:</strong> BEYA CREATIVE SARL AU (Compte Séquestre)</p>
                          <p>• <strong>أو كود إيداع نقدي Cash Plus / Wafacash:</strong> <strong className="text-white font-mono">BEYA-PAY-880</strong></p>
                        </div>
                      </div>

                      {/* Client Info Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">اسم صاحب الطلب / البراند: *</label>
                          <input
                            type="text"
                            placeholder="مثال: يوسف العلمي (براند Casablanca)"
                            value={escrowPayerName}
                            onChange={e => setEscrowPayerName(e.target.value)}
                            className="w-full bg-[#1e1f22] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">رقم الهاتف / الواتساب: *</label>
                          <input
                            type="tel"
                            placeholder="مثال: 0661234567"
                            value={escrowPayerPhone}
                            onChange={e => setEscrowPayerPhone(e.target.value)}
                            className="w-full bg-[#1e1f22] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Upload Receipt */}
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">رفع صورة وصل التحويل البنكي (Reçu de virement):</label>
                        <div className="relative border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-2xl p-4 text-center cursor-pointer transition">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEscrowReceiptFile(file.name);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-white">
                            {escrowReceiptFile ? `✓ تم اختيار الوصل: ${escrowReceiptFile}` : 'انقر هنا لرفع صورة الوصل أو لقطة شاشة التحويل'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF (بحد أقصى 10 ميغابايت)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: PayPal International Details */}
                  {escrowPaymentMethod === 'paypal' && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/20 space-y-2">
                        <span className="text-[11px] font-black text-cyan-300 block">للعملاء الدوليين (فرنسا، إسبانيا، بلجيكا، الخليج، كندا):</span>
                        <p className="text-slate-300 leading-relaxed">
                          يمكنك تأمين مستحقات الموديليست المغربي مباشرة بعملتك الدولية عبر حساب PayPal الرسمي لـ BEYA CREATIVE مع حماية المشتري المعتمدة.
                        </p>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/50 border border-white/5">
                          <span className="text-slate-400">المبلغ باليورو التقديري:</span>
                          <span className="text-base font-black text-cyan-300 font-mono">
                            ~{(escrowAmount / 10.8).toFixed(2)} EUR / ${(escrowAmount / 10.0).toFixed(2)} USD
                          </span>
                        </div>
                        <a
                          href="https://paypal.me/beyacreative"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>فتح صفحة الدفع عبر PayPal.me/beyacreative</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">اسمك / اسم علامتك التجارية: *</label>
                          <input
                            type="text"
                            placeholder="Your Brand / Full Name"
                            value={escrowPayerName}
                            onChange={e => setEscrowPayerName(e.target.value)}
                            className="w-full bg-[#1e1f22] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">رقم عملية بايبال (Transaction ID): *</label>
                          <input
                            type="text"
                            placeholder="e.g. 9XB1234567890"
                            value={escrowPaypalTxId}
                            onChange={e => setEscrowPaypalTxId(e.target.value)}
                            className="w-full bg-[#1e1f22] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Escrow Guarantee Text */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>ضمان استرجاع الأموال:</strong> في حال عدم تسليم الباترون في الوقت المتفق عليه أو وجود خطأ جسيم في القياسات غير مطابق للمواصفات، يتم إرجاع المبلغ بالكامل للعميل عبر نفس وسيلة الدفع.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={() => {
                    const slip = {
                      code: `BYA-ESCROW-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      modelisteName: escrowTarget.name,
                      serviceTitle: escrowServiceTitle,
                      amountMAD: escrowAmount,
                      method: escrowPaymentMethod,
                      methodLabel: escrowPaymentMethod === 'local' ? 'تحويل بنكي محلي مغربي (Reçu Uploaded)' : `PayPal International (${escrowPaypalTxId || 'Vérifié'})`,
                      payerName: escrowPayerName || userProfile.brandName || 'عميل BEYA',
                      date: new Date().toLocaleString('ar-MA')
                    };
                    setEscrowSuccessSlip(slip);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                  <span>تأكيد الإيداع في BEYA Escrow ({escrowAmount} MAD)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CONSULTATION BOOKING MODAL (APPLE / UPWORK LIGHT DESIGN SYSTEM)
      ───────────────────────────────────────────────────────────── */}
      {showConsultationModal && consultationTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-xl bg-white rounded-3xl overflow-hidden border border-[#e4ebe4] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-slate-900 space-y-0"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#e4ebe4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f2f7f2] text-[#108a00] flex items-center justify-center border border-[#d4e5d4]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>حجز جلسة استشارة تقنية وتوجيه فني</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] font-semibold border border-[#d4e5d4]">
                      1-à-1 مخصص
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">جلسة 45 دقيقة مع خبير النسيج والموديليست لضبط مشروعك</p>
                </div>
              </div>

              <button
                onClick={() => { setShowConsultationModal(false); setConsultationConfirmedSlip(null); }}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If Confirmed -> Render Confirmation Slip */}
            {consultationConfirmedSlip ? (
              <div className="p-6 space-y-5">
                <div className="p-5 rounded-2xl bg-[#f2f7f2] border border-[#d4e5d4] text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-[#108a00] text-white flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-white text-[#108a00] text-xs font-semibold border border-[#d4e5d4] inline-block mb-1">
                      تم تأكيد حجز موعد الاستشارة بنجاح
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">بطاقة الموعد التقني المعتمد</h4>
                    <p className="text-xs text-slate-600 mt-0.5">كود الموعد: <strong className="font-mono text-slate-900">{consultationConfirmedSlip.code}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e4ebe4] space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">المستشار التقني:</span>
                    <strong className="text-slate-900">{consultationConfirmedSlip.consultantName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">نمط الاستشارة:</span>
                    <strong className="text-[#108a00]">{consultationConfirmedSlip.modeLabel}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">التاريخ والوقت:</span>
                    <span className="text-slate-900 font-semibold font-mono">{consultationConfirmedSlip.date} في تمام الساعة {consultationConfirmedSlip.time}</span>
                  </div>
                  {consultationConfirmedSlip.mode === 'office' && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">عنوان المقر/Atelier:</span>
                      <span className="text-slate-800 font-semibold text-left">{consultationTarget.officeAddress}</span>
                    </div>
                  )}
                  {consultationConfirmedSlip.mode === 'visio' && (
                    <div className="py-2 border-b border-slate-100 space-y-2">
                      <span className="text-slate-500 block">رابط القاعة الافتراضية المباشرة:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://meet.jit.si/BEYA-CONSULT-${consultationTarget.id}-${consultationConfirmedSlip.code}`}
                          className="flex-1 bg-slate-50 text-slate-700 font-mono text-[11px] p-2 rounded-lg border border-slate-200 select-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            window.open(`https://meet.jit.si/BEYA-CONSULT-${consultationTarget.id}-${consultationConfirmedSlip.code}`, '_blank');
                          }}
                          className="px-3 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>دخول القاعة الآن</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">موضوع الاستشارة:</span>
                    <span className="text-slate-800 max-w-xs text-left truncate">{consultationConfirmedSlip.topic}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">رسوم الجلسة (45د):</span>
                    <strong className="text-slate-900 font-mono text-sm">{consultationTarget.consultationPriceMAD || 250} MAD</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={`https://wa.me/${consultationTarget.whatsapp}?text=${encodeURIComponent(
                      `السلام عليكم أستاذ(ة) ${consultationTarget.name}، لقد حجزت موعد استشارة رسمية عبر منصة BEYA NETWORK:\n• كود الموعد: ${consultationConfirmedSlip.code}\n• النمط: ${consultationConfirmedSlip.modeLabel}\n• الموعد: ${consultationConfirmedSlip.date} في الساعة ${consultationConfirmedSlip.time}\n• الموضوع: ${consultationConfirmedSlip.topic}\n• البراند/العميل: ${consultationConfirmedSlip.clientName || userProfile.brandName}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تأكيد الموعد فـ الواتساب مع المستشار</span>
                  </a>

                  <button
                    onClick={() => { setShowConsultationModal(false); setConsultationConfirmedSlip(null); }}
                    className="w-full sm:w-auto py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full text-xs transition cursor-pointer"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            ) : (
              /* Consultation Booking Form */
              <div className="p-5 sm:p-6 space-y-4">
                {/* Consultant Summary */}
                <div className="p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e4ebe4] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={consultationTarget.avatar} alt={consultationTarget.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{consultationTarget.name}</h4>
                      <p className="text-xs text-[#108a00] font-medium">{consultationTarget.categoryLabel || consultationTarget.specialty}</p>
                      <span className="text-[11px] text-slate-500">{consultationTarget.city}</span>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-[10px] text-slate-500 block">سعر الجلسة (45د)</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {consultationMode === 'visio' ? '200 MAD' : `${consultationTarget.consultationPriceMAD || 250} MAD`}
                    </span>
                  </div>
                </div>

                {/* Step 1: Mode Switcher */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 block">1. اختر نمط الجلسة المفضل لديك:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div
                      onClick={() => setConsultationMode('visio')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-1 ${
                        consultationMode === 'visio'
                          ? 'border-[#108a00] bg-[#f2f7f2]/50 ring-1 ring-[#108a00]'
                          : 'border-[#e4ebe4] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-[#108a00]" />
                          <span>جلسة Live Visio (عن بعد)</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] font-semibold border border-[#d4e5d4]">200 MAD</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">مشاركة الشاشة لمراجعة ملفات CAD والباترون وحساب كلفة البياسة.</p>
                    </div>

                    <div
                      onClick={() => setConsultationMode('office')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-1 ${
                        consultationMode === 'office'
                          ? 'border-[#108a00] bg-[#f2f7f2]/50 ring-1 ring-[#108a00]'
                          : 'border-[#e4ebe4] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-700" />
                          <span>حضوري بالمكتب / Atelier</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {consultationTarget.consultationPriceMAD || 250} MAD
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">لمس عينات الأقمشة وتجربة المانيكان في استوديو الموديليست ({consultationTarget.city}).</p>
                    </div>
                  </div>

                  {consultationMode === 'office' && consultationTarget.officeAddress && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span><strong>العنوان المعتمد للزيارة:</strong> {consultationTarget.officeAddress}</span>
                    </div>
                  )}
                </div>

                {/* Step 2: Date & Time Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">2. حدد تاريخ الموعد:</label>
                    <input
                      type="date"
                      value={consultationDate}
                      onChange={e => setConsultationDate(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">3. التوقيت المفضل (45 دقيقة):</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['10:00', '11:30', '15:00', '17:00'].map(t => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setConsultationTime(t)}
                          className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer font-mono ${
                            consultationTime === t
                              ? 'bg-[#108a00] text-white border-[#108a00]'
                              : 'bg-[#f9fafb] text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3: Topic Selection */}
                <div className="space-y-1 text-xs">
                  <label className="text-slate-900 font-bold block">4. ما هو الموضوع الرئيسي للاستشارة؟</label>
                  <select
                    value={consultationTopic}
                    onChange={e => setConsultationTopic(e.target.value)}
                    className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                  >
                    <option value="تحديد وتحليل المنتج الرابح (Winner Product): دراسة ترندات السوق والقطع الأكثر مبيعاً وهوامش الربح">
                      تحديد وتحليل المنتج الرابح (Winner Product): دراسة ترندات السوق والقطع الأكثر مبيعاً وهوامش الربح
                    </option>
                    <option value="اختيار وتدقيق الأقمشة والمواد المناسبة للموديل مع احتساب تكلفة الإنتاج">
                      اختيار وتدقيق الأقمشة والمواد المناسبة للموديل مع احتساب تكلفة الإنتاج
                    </option>
                    <option value="مراجعة وتدقيق باترون موجود وحل مشاكل الفيتينغ والقصة (Fitting)">
                      مراجعة وتدقيق باترون موجود وحل مشاكل الفيتينغ والقصة (Fitting)
                    </option>
                    <option value="دراسة فنية لكوليكسيون جديدة كاملة وضبط جدول تدرج المقاسات (Gradation)">
                      دراسة فنية لكوليكسيون جديدة كاملة وضبط جدول تدرج المقاسات (Gradation)
                    </option>
                    <option value="إعداد البطاقة التقنية (Fiche Technique) وشروط التعامل مع معامل الخياطة">
                      إعداد البطاقة التقنية (Fiche Technique) وشروط التعامل مع معامل الخياطة
                    </option>
                  </select>
                </div>

                {/* Step 4: Client Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">اسمك / اسم علامتك التجارية: *</label>
                    <input
                      type="text"
                      required
                      placeholder="اسمك أو اسم البراند"
                      value={consultationClientName}
                      onChange={e => setConsultationClientName(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">رقم الهاتف / الواتساب: *</label>
                    <input
                      type="tel"
                      required
                      placeholder="06XXXXXXXX"
                      value={consultationClientPhone}
                      onChange={e => setConsultationClientPhone(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Submit Confirmation */}
                <button
                  type="button"
                  onClick={() => {
                    const slip = {
                      code: `BYA-RDV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      consultantName: consultationTarget.name,
                      mode: consultationMode,
                      modeLabel: consultationMode === 'visio' ? 'استشارة Live Visio (عن بعد مع مشاركة الشاشة)' : 'استشارة حضورية بالمكتب / Atelier',
                      date: consultationDate,
                      time: consultationTime,
                      topic: consultationTopic,
                      clientName: consultationClientName || userProfile.brandName || 'عميل BEYA'
                    };
                    setConsultationConfirmedSlip(slip);
                  }}
                  className="w-full py-3 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>تأكيد حجز موعد الاستشارة ({consultationMode === 'visio' ? 200 : (consultationTarget.consultationPriceMAD || 250)} MAD)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD CLIENT FEEDBACK & REVIEW (إضافة تقييم ورأي العميل)
      ───────────────────────────────────────────────────────────── */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg bg-white rounded-3xl overflow-hidden border border-[#e4ebe4] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-slate-900 space-y-0"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#e4ebe4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f2f7f2] text-[#108a00] flex items-center justify-center border border-[#d4e5d4]">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    شارك تجربتك مع استشارات BEYA
                  </h3>
                  <p className="text-xs text-slate-500">تقييمك يساعد علامات الأزياء الأخرى على اختيار المستشار المناسب</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddReviewModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newReviewComment.trim()) return;
                const newRev = {
                  id: `rev-${Date.now()}`,
                  authorName: newReviewAuthor || userProfile.name || 'صاحب علامة أزياء',
                  brandName: newReviewBrand || userProfile.brandName || 'علامة تجارية مستقلة',
                  city: newReviewCity || 'الدار البيضاء',
                  consultantName: newReviewConsultant,
                  rating: newReviewRating,
                  date: 'الآن',
                  sessionType: newReviewSessionType,
                  comment: newReviewComment,
                  verified: true
                };
                const updated = [newRev, ...consultationReviews];
                setConsultationReviews(updated);
                try {
                  localStorage.setItem('beya_consultation_reviews', JSON.stringify(updated));
                } catch {}
                setShowAddReviewModal(false);
                setNewReviewComment('');
              }}
              className="p-5 sm:p-6 space-y-4 text-xs"
            >
              {/* Rating Stars Selector */}
              <div className="space-y-1.5 text-center bg-[#f9fafb] p-3 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-900 block">حدد تقييمك للجلسة:</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewReviewRating(s)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= newReviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Author & Brand Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">اسمك الكامل: *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: يونس العلمي"
                    value={newReviewAuthor}
                    onChange={e => setNewReviewAuthor(e.target.value)}
                    className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">اسم العلامة التجارية / المصنع: *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Urban Couture"
                    value={newReviewBrand}
                    onChange={e => setNewReviewBrand(e.target.value)}
                    className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* City & Consultant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">المدينة:</label>
                  <select
                    value={newReviewCity}
                    onChange={e => setNewReviewCity(e.target.value)}
                    className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                  >
                    <option value="الدار البيضاء">الدار البيضاء</option>
                    <option value="الرباط">الرباط</option>
                    <option value="طنجة">طنجة</option>
                    <option value="فاس">فاس</option>
                    <option value="مراكش">مراكش</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">المستشار الذي تعاملت معه:</label>
                  <select
                    value={newReviewConsultant}
                    onChange={e => setNewReviewConsultant(e.target.value)}
                    className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                  >
                    {allProMembers.filter(m => m.pillar === 'modelistes').map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.categoryLabel || m.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review Comment */}
              <div className="space-y-1">
                <label className="text-slate-900 font-bold block">تفاصيل تجربتك وملاحظاتك الفنية: *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="كيف ساعدتك الاستشارة؟ كم وفرت في استهلاك القماش؟ كيف كانت جودة مشاركة الشاشة في Visio أو اللقاء بالمكتب؟..."
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر التقييم في المنصة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PRO REGISTRATION & ANTI-FRAUD VERIFICATION
          (تسجيل الموظف والمهني: نوعان - موديليست أو مستشار تقني + موافقة الإدارة)
      ───────────────────────────────────────────────────────────── */}
      {showProRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-xl bg-white rounded-3xl overflow-hidden border border-[#e4ebe4] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-slate-900 space-y-0"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#e4ebe4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f2f7f2] text-[#108a00] flex items-center justify-center border border-[#d4e5d4]">
                  <ShieldCheck className="w-5 h-5 text-[#108a00]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>طلب اعتماد مهني في BEYA NETWORK</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] font-semibold border border-[#d4e5d4]">
                      منظومة مكافحة النصب
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">تدقيق إداري وفني لضمان جودة المصانع ومطابقة الباترونات</p>
                </div>
              </div>

              <button
                onClick={() => { setShowProRegisterModal(false); setProRegisterSlip(null); }}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If Form Submitted -> Render Dossier Slip (Pending Approval) */}
            {proRegisterSlip ? (
              <div className="p-6 space-y-5">
                <div className="p-5 rounded-2xl bg-[#f2f7f2] border border-[#d4e5d4] text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-white text-[#108a00] flex items-center justify-center mx-auto border-2 border-[#108a00] shadow-xs">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 inline-block mb-1">
                      ملف الاعتماد قيد التدقيق الأمني والفني
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">تم تسجيل طلبك بنجاح</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      رقم ملف التحقق: <strong className="font-mono text-slate-900">{proRegisterSlip.code}</strong>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">الاسم / الأتولييه:</span>
                    <strong className="text-slate-900">{proRegisterSlip.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">الصفة المهنية:</span>
                    <span className="font-bold text-[#108a00]">{proRegisterSlip.typeLabel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">المدينة:</span>
                    <span className="text-slate-800 font-semibold">{proRegisterSlip.city}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">رقم الواتساب:</span>
                    <span className="font-mono text-slate-800 font-bold">{proRegisterSlip.whatsapp}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">حالة الحساب:</span>
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>قيد مراجعة الخبرة وسابقة الأعمال لمنع الاحتيال</span>
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>لماذا نطلب التحقق والموافقة الإدارية؟</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    لحماية المصانع والعلامات التجارية من أي نصب أو أخطاء قص تكلف آلاف الأمتار، تقوم إدارة BEYA بالتحقق من عينات ملفات CAD ومطابقة جداول المقاسات قبل تفعيل الحساب للتقديم على المشاريع.
                  </p>
                </div>

                {/* Instant Testing / Admin Mode Bypass Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setWorkerRole(proRegisterType);
                      try {
                        localStorage.setItem('beya_worker_role', proRegisterType);
                      } catch {}
                      setShowProRegisterModal(false);
                      setProRegisterSlip(null);
                    }}
                    className="w-full py-3 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>موافقة الإدارة وتفعيل الحساب فورياً (وضع المشرف Admin)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProRegisterModal(false);
                      setProRegisterSlip(null);
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full text-xs transition cursor-pointer"
                  >
                    إغلاق ومتابعة التصفح في وضع الانتظار
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!proRegisterName.trim() || !proRegisterWhatsapp.trim()) return;
                  const slip = {
                    code: `BYA-VERIF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: proRegisterName,
                    brand: proRegisterBrand || 'مستقل',
                    type: proRegisterType,
                    typeLabel: proRegisterType === 'designer' ? 'مصمم وموديليست باترون صناعي' : 'خبير ومستشار تقني في صناعة الأزياء',
                    city: proRegisterCity,
                    whatsapp: proRegisterWhatsapp,
                    skills: proRegisterSkills,
                    experience: proRegisterExperience,
                    submittedAt: new Date().toISOString()
                  };
                  setProRegisterSlip(slip);
                  setWorkerRole('pending');
                  try {
                    localStorage.setItem('beya_worker_role', 'pending');
                  } catch {}
                }}
                className="p-5 sm:p-6 space-y-4 text-xs"
              >
                {/* 1. Worker Role Type Selector (2 TYPES AS REQUESTED) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 block">
                    1. حدد التخصص المهني (الموظف نوعان): *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Type 1: Modéliste & Pattern Designer */}
                    <div
                      onClick={() => setProRegisterType('designer')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-1.5 ${
                        proRegisterType === 'designer'
                          ? 'border-[#108a00] bg-[#f2f7f2]/50 ring-1 ring-[#108a00]'
                          : 'border-[#e4ebe4] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Scissors className="w-4 h-4 text-[#108a00]" />
                          <span>نوع 1: مصمم وموديليست باترون</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2f7f2] text-[#108a00] font-semibold border border-[#d4e5d4]">
                          فصالة وباتورناج
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        إنجاز الباترونات الصناعية، تدريج المقاسات S-XXL، برامج Lectra / CLO 3D، وبطاقات Fiche Tech لمصانع الخياطة.
                      </p>
                    </div>

                    {/* Type 2: Expert Consultant */}
                    <div
                      onClick={() => setProRegisterType('consultant')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-1.5 ${
                        proRegisterType === 'consultant'
                          ? 'border-[#108a00] bg-[#f2f7f2]/50 ring-1 ring-[#108a00]'
                          : 'border-[#e4ebe4] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-amber-600" />
                          <span>نوع 2: خبير ومستشار تقني</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          استشارات وتوجيه
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        تقديم استشارات فنية للعلامات، تدقيق جودة النسيج، حساب مردودية الثوب، وجلسات Visio أو حضورية بالمصانع.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Business Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">الاسم الكامل / اسم المهني: *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: يونس المرابط"
                      value={proRegisterName}
                      onChange={e => setProRegisterName(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">اسم الأتولييه أو البراند (إن وجد):</label>
                    <input
                      type="text"
                      placeholder="مثال: Atelier Pattern Pro"
                      value={proRegisterBrand}
                      onChange={e => setProRegisterBrand(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. City & WhatsApp Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">المدينة: *</label>
                    <select
                      value={proRegisterCity}
                      onChange={e => setProRegisterCity(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                    >
                      <option value="الدار البيضاء">الدار البيضاء (عين السبع / البرنوصي / وسط المدينة)</option>
                      <option value="طنجة">طنجة (المنطقة الحرة TFZ / العوامة)</option>
                      <option value="الرباط">الرباط / سلا / تمارة</option>
                      <option value="فاس">فاس (سيدي ابراهيم)</option>
                      <option value="مراكش">مراكش (سيدي غانم)</option>
                      <option value="أكادير">أكادير</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">رقم الواتساب المهني المعتمد: *</label>
                    <input
                      type="tel"
                      required
                      placeholder="06XXXXXXXX"
                      value={proRegisterWhatsapp}
                      onChange={e => setProRegisterWhatsapp(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* 4. Experience & Portfolio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">سنوات الخبرة في مجال الأزياء:</label>
                    <select
                      value={proRegisterExperience}
                      onChange={e => setProRegisterExperience(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                    >
                      <option value="أقل من سنتين">أقل من سنتين (مبتدئ)</option>
                      <option value="من 2 إلى 5 سنوات">من 2 إلى 5 سنوات (متوسط)</option>
                      <option value="أكثر من 5 سنوات">أكثر من 5 سنوات (خبير صناعي)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-900 font-bold block">سابقة أعمال / ماركات تعاملت معها:</label>
                    <input
                      type="text"
                      placeholder="مثال: Zara, Marwa, أو أتولييهات محلية"
                      value={proRegisterPortfolio}
                      onChange={e => setProRegisterPortfolio(e.target.value)}
                      className="w-full bg-[#f9fafb] text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#108a00] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. Anti-Fraud Pledge Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] text-slate-700">
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <Shield className="w-3.5 h-3.5 text-[#108a00]" />
                    <span>ميثاق الشرف ومكافحة النصب والاحتيال:</span>
                  </div>
                  <p className="leading-relaxed">
                    أتعهد بدقة القياسات وجودة ملفات CAD المسلمة ومطابقتها للمواصفات المطلوبة من المصانع. تخضع جميع التعاملات لضمان BEYA Escrow ولا يتم تحويل المستحقات إلا بعد مطابقة الباترون والعينة.
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkerRole(proRegisterType);
                      try {
                        localStorage.setItem('beya_worker_role', proRegisterType);
                      } catch {}
                      setShowProRegisterModal(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    تفعيل فوري مباشر (وضع المعاينة السريعة)
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowProRegisterModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold rounded-full transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>إرسال الملف للتدقيق والاعتماد</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PORTFOLIO ITEM HD LIGHTBOX MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            className="w-full max-w-4xl bg-[#232428] rounded-3xl overflow-hidden border border-[#383a40] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white flex flex-col md:flex-row"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Image Preview Container */}
            <div className="md:w-3/5 bg-black/60 relative min-h-[300px] md:min-h-[480px] flex items-center justify-center">
              <img
                src={selectedPortfolioItem.item.image}
                alt={selectedPortfolioItem.item.title}
                className="max-h-[70vh] w-full object-contain p-2"
              />
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-amber-300 text-xs font-black border border-white/10">
                {selectedPortfolioItem.item.tag}
              </span>
            </div>

            {/* Side Information Panel */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-r border-[#383a40]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">معاينة الباترون والتصميم</span>
                  <button
                    onClick={() => setSelectedPortfolioItem(null)}
                    className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{selectedPortfolioItem.item.title}</h3>
                  <p className="text-xs text-amber-300 font-bold mt-0.5">تصميم وإنجاز: {selectedPortfolioItem.author}</p>
                </div>

                {/* Specs Box */}
                <div className="p-3.5 rounded-2xl bg-[#1e1f22] border border-white/5 space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 block">المواصفات التقنية للفصالة:</span>
                  <p className="text-slate-200 font-medium leading-relaxed">
                    {selectedPortfolioItem.item.specs || 'باترون هندسي مضبوط مع تدريج المقاسات XS-XXL وجدول استهلاك الأقمشة بدقة عالية.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>ملفات CAD جاهزة للقص الفوري: DXF AAMA, RUL, PDF 1:1, ومحاكاة 3D.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-[#383a40]">
                <button
                  onClick={() => {
                    const match = allProMembers.find(m => m.name === selectedPortfolioItem.author || m.id === selectedPortfolioItem.proId);
                    if (match) {
                      setEscrowTarget(match);
                      setEscrowAmount(match.pricing?.basePattern ? match.pricing.basePattern + 100 : 350);
                      setEscrowServiceTitle(`طلب باترون: ${selectedPortfolioItem.item.title} + تدريج المقاسات XS-XXL`);
                      setEscrowSuccessSlip(null);
                      setShowEscrowModal(true);
                      setSelectedPortfolioItem(null);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>طلب نفس الموديل عبر BEYA Escrow</span>
                </button>

                <button
                  onClick={() => setSelectedPortfolioItem(null)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إغلاق المعاينة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          FABRIC DETAILS & HD GALLERY MODAL (FICHE TECHNIQUE)
      ───────────────────────────────────────────────────────────── */}
      {selectedDealForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-3xl bg-[#232428] rounded-3xl overflow-hidden border border-[#383a40] shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white space-y-0"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-[#383a40] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  البطاقة التقنية ومعاينة الأقمشة (Fiche Technique)
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  {selectedDealForDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDealForDetail(null)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">

              {/* Large HD Gallery Viewer */}
              <div className="space-y-3">
                <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-lg">
                  <img
                    src={selectedDealForDetail.images[activeDealImageIdx[selectedDealForDetail.id] || 0] || selectedDealForDetail.images[0]}
                    alt={selectedDealForDetail.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-xs text-xs font-bold text-slate-200">
                    معاينة النسيج والألياف بدقة عالية (Macro HD)
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedDealForDetail.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDealImageIdx(prev => ({ ...prev, [selectedDealForDetail.id]: idx }))}
                      className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        (activeDealImageIdx[selectedDealForDetail.id] || 0) === idx
                          ? 'border-amber-400 ring-2 ring-amber-500/30'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Technical Specifications Table */}
              <div className="p-4 rounded-2xl bg-[#1e1f22] border border-white/5 space-y-3">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4" />
                  <span>المواصفات الفنية المعتمدة من مختبر الجودة:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#2b2d31] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 font-bold">الوزن والغراماج (GSM):</span>
                    <span className="font-black text-white font-mono">{selectedDealForDetail.gsm}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#2b2d31] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 font-bold">التركيبة ونوع الخيط:</span>
                    <span className="font-black text-white">{selectedDealForDetail.composition}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#2b2d31] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 font-bold">عرض الثوب المفيد (Laize):</span>
                    <span className="font-black text-white font-mono">{selectedDealForDetail.width}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#2b2d31] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 font-bold">نسبة الانكماش بالماء:</span>
                    <span className="font-black text-emerald-400 font-mono">{selectedDealForDetail.shrinkage}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#2b2d31] border border-white/5 flex items-center justify-between sm:col-span-2">
                    <span className="text-slate-400 font-bold">المعالجة الخاصة:</span>
                    <span className="font-black text-slate-200">{selectedDealForDetail.treatment}</span>
                  </div>
                </div>
              </div>

              {/* Dual Price & Yield Detail Table */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 space-y-3">
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>جدول مقارنة الأسعار ومردودية الفصالة:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-[#1e1f22] border border-white/5">
                    <span className="text-slate-400 font-bold block mb-1">سعر الكيلو (بالشراء المشترك)</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {selectedDealForDetail.discountPrice} MAD / كلغ
                    </span>
                    <span className="text-[10px] text-slate-500 line-through block">
                      عادي: {selectedDealForDetail.regularPrice} MAD
                    </span>
                  </div>

                  {selectedDealForDetail.pricePerMeterEstimated && (
                    <div className="p-3 rounded-xl bg-[#1e1f22] border border-white/5">
                      <span className="text-slate-400 font-bold block mb-1">سعر المتر التقديري</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        ~{selectedDealForDetail.pricePerMeterEstimated.toFixed(2)} MAD / متر
                      </span>
                      <span className="text-[10px] text-slate-500 line-through block">
                        عادي: ~{selectedDealForDetail.regularPricePerMeterEstimated?.toFixed(2)} MAD
                      </span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#1e1f22] border border-white/5">
                    <span className="text-slate-400 font-bold block mb-1">استهلاك البياسة</span>
                    <span className="text-xs font-black text-emerald-400 block mt-1">
                      {String(selectedDealForDetail.garmentYield || '').split('|')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Color Catalog */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">كتالوج الألوان المتوفرة حالياً:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedDealForDetail.colors.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDealColor(prev => ({ ...prev, [selectedDealForDetail.id]: c.name }))}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        (selectedDealColor[selectedDealForDetail.id] || selectedDealForDetail.colors[0]?.name) === c.name
                          ? 'bg-amber-500/20 border-amber-400'
                          : 'bg-[#1e1f22] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-lg border border-white/20 shadow-inner shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="truncate">
                        <p className="text-xs font-black text-white truncate">{String(c.name || '').split('(')[0]}</p>
                        <p className="text-[10px] text-slate-400">{c.tagAr}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Booking CTA inside Modal */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#383a40]">
                <div className="text-xs text-slate-300">
                  <span>المورد: <strong className="text-white">{selectedDealForDetail.supplier}</strong> ({selectedDealForDetail.supplierCity})</span>
                </div>

                <a
                  href={`https://wa.me/212675239885?text=${encodeURIComponent(
                    `السلام عليكم ورشة BEYA NETWORK، أرغب في حجز كمية من عرض: ${selectedDealForDetail.title}\n• اللون المفضل: ${selectedDealColor[selectedDealForDetail.id] || selectedDealForDetail.colors[0]?.name}\n• الكمية المبدئية: ${dealQuantities[selectedDealForDetail.id] || selectedDealForDetail.minCommitment} ${selectedDealForDetail.primaryUnitLabelAr}\n• براند: ${userProfile.brandName || 'علامتي التجارية'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تأكيد الحجز فـ الواتساب مع خبير الأقمشة</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUPAGE MODAL 1: JOIN GROUPAGE BOOKING MODAL (حجز فوري للشراء المشترك)
          ───────────────────────────────────────────────────────────── */}
      {bookingModalDeal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg bg-[#232428] rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-5 border-b border-[#383a40] flex items-center justify-between bg-gradient-to-r from-emerald-950/60 to-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">حجز كمية فـ الشراء المشترك بسعر الجملة</h3>
                  <p className="text-[10px] text-slate-400">{bookingModalDeal.supplier} • {bookingModalDeal.supplierCity}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalDeal(null)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Deal Selected Summary */}
              <div className="p-3 bg-[#1e1f22] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">القماش / المادة المختارة:</span>
                <p className="font-black text-white text-xs">{bookingModalDeal.title}</p>
                <p className="text-[11px] text-emerald-400 font-bold">
                  سعر الشراء المشترك: {bookingModalDeal.discountPrice} MAD / {bookingModalDeal.primaryUnitLabelAr}
                  <span className="text-slate-500 line-through mr-2 font-normal">عوض {bookingModalDeal.regularPrice} MAD</span>
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">اختر اللون المطلوب في طلبيتك:</label>
                <select
                  value={bookingForm.color}
                  onChange={e => setBookingForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {bookingModalDeal.colors.map((c, idx) => (
                    <option key={idx} value={c.name} className="bg-slate-900 text-white">
                      {c.name} ({c.tagAr})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Selector with Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300">الكمية المطلوبة ({bookingModalDeal.primaryUnitLabelAr}):</label>
                  <span className="text-[10px] text-amber-400">الحد الأدنى: {bookingModalDeal.minCommitment} {bookingModalDeal.primaryUnitLabelAr}</span>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    bookingModalDeal.minCommitment,
                    bookingModalDeal.minCommitment * 2,
                    bookingModalDeal.minCommitment * 4
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBookingForm(prev => ({ ...prev, quantity: preset }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        Number(bookingForm.quantity) === preset
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-[#1e1f22] text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      {preset} {bookingModalDeal.primaryUnitLabelAr}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={bookingModalDeal.minCommitment}
                    value={bookingForm.quantity}
                    onChange={e => setBookingForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-20 px-2.5 py-2 bg-[#1e1f22] border border-white/10 rounded-xl text-xs font-black text-amber-400 font-mono text-center focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Live Price Calculator */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">المجموع الإجمالي</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {(Number(bookingForm.quantity || 0) * bookingModalDeal.discountPrice).toLocaleString()} MAD
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">توفير الشراء المشترك</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    +{(Number(bookingForm.quantity || 0) * (bookingModalDeal.regularPrice - bookingModalDeal.discountPrice)).toLocaleString()} MAD
                  </span>
                </div>
              </div>

              {/* Brand and Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">اسم البراند / المشروع *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.brandName}
                    onChange={e => setBookingForm(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="مثال: Casablanca Wear"
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">اسم المسؤول *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.contactName}
                    onChange={e => setBookingForm(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="الاسم الكامل"
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">رقم الهاتف (واتساب) للتأكيد *</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.phone}
                    onChange={e => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="06XXXXXXXX"
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">المدينة للتوصيل *</label>
                  <select
                    value={bookingForm.city}
                    onChange={e => setBookingForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {['الدار البيضاء', 'طنجة', 'فاس', 'مراكش', 'الرباط', 'أكادير', 'تطوان', 'وجدة', 'مكناس', 'القنيطرة'].map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBookingModalDeal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  تأكيد الحجز والانضمام للشراء المشترك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUPAGE MODAL 2: BOOKING SUCCESS RECEIPT (وصل الحجز والتأكيد)
          ───────────────────────────────────────────────────────────── */}
      {bookingSuccessSlip && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-md bg-[#232428] rounded-3xl overflow-hidden border border-emerald-500 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white p-6 space-y-5 text-center"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                تم تسجيل حجزك بنجاح في الشراء المشترك
              </span>
              <h3 className="text-xl font-black text-white pt-2">وصل تأكيد الطلب #{bookingSuccessSlip.id}</h3>
              <p className="text-xs text-slate-300">
                مرحباً ببراند <strong>{bookingSuccessSlip.brandName}</strong>، تم تثبيت حصتكم وتحديث عداد الدفعة مباشرة!
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 bg-[#1e1f22] rounded-2xl border border-white/5 space-y-2 text-xs text-right">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">الدفعة المحجوزة:</span>
                <span className="font-bold text-white text-[11px] truncate max-w-[200px]">{bookingSuccessSlip.dealTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">الكمية المحجوزة:</span>
                <span className="font-mono font-black text-amber-400">{bookingSuccessSlip.quantity} {bookingSuccessSlip.unit}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">اللون المختار:</span>
                <span className="font-bold text-white">{bookingSuccessSlip.color}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">المجموع الصافي بسعر الجملة:</span>
                <span className="font-mono font-black text-white">{bookingSuccessSlip.totalPrice.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-emerald-400 font-bold">التوفير المحقق:</span>
                <span className="font-mono font-black text-emerald-400">+{bookingSuccessSlip.savingsMad.toLocaleString()} MAD</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/212675239885?text=${encodeURIComponent(
                  `السلام عليكم ورشة BEYA والموردين، قمت للتو بتأكيد حجز كمية في الشراء المشترك:

• رقم الوصل: ${bookingSuccessSlip.id}
• البراند: ${bookingSuccessSlip.brandName}
• الدفعة: ${bookingSuccessSlip.dealTitle}
• الكمية: ${bookingSuccessSlip.quantity} ${bookingSuccessSlip.unit}
• اللون: ${bookingSuccessSlip.color}
• المجموع: ${bookingSuccessSlip.totalPrice} MAD
• المدينة: ${bookingSuccessSlip.city}

أرغب في متابعة التأكيد واستلام العينة.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>مراسلة المورد والورشة فـ الواتساب لتأكيد الاستلام</span>
              </a>

              <button
                type="button"
                onClick={() => setBookingSuccessSlip(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
              >
                إغلاق والرجوع للمنصة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUPAGE MODAL 3: POST CUSTOM REQUEST (إضافة طلب تجميع أو استفسار قماش خاص)
          ───────────────────────────────────────────────────────────── */}
      {showCreateCustomRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg bg-[#232428] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-5 border-b border-[#383a40] flex items-center justify-between bg-gradient-to-r from-amber-950/60 to-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">إضافة طلب شراء أو تجميع قماش مخصص</h3>
                  <p className="text-[10px] text-slate-400">سيظهر طلبك مباشرة لكافة مستودعات الأقمشة والموردين لتقديم عروضهم</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateCustomRequestModal(false)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRequest} className="p-5 sm:p-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">عنوان الطلب *</label>
                <input
                  type="text"
                  required
                  value={newRequestForm.title}
                  onChange={e => setNewRequestForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: مطلوب 150 متر كريب باربي رويال أسود للعبايات"
                  className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">نوع القماش أو المادة *</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.materialNeeded}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, materialNeeded: e.target.value }))}
                    placeholder="مثال: كريب باربي 220g / جاباردين كارجو"
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">القسم</label>
                  <select
                    value={newRequestForm.category}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="tissu" className="bg-slate-900">أقمشة وثوب (Tissus)</option>
                    <option value="fournitures" className="bg-slate-900">فورنيتور ولوازم (Fournitures)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">الكمية المستهدفة *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRequestForm.targetQty}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, targetQty: Number(e.target.value) }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">الوحدة</label>
                  <select
                    value={newRequestForm.unit}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="متر" className="bg-slate-900">متر (m)</option>
                    <option value="كلغ" className="bg-slate-900">كيلوغرام (kg)</option>
                    <option value="قطعة" className="bg-slate-900">قطعة / طقم</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">السعر المستهدف (MAD)</label>
                  <input
                    type="number"
                    value={newRequestForm.targetPriceMAD}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, targetPriceMAD: Number(e.target.value) }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">اسم البراند *</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.brandName}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="اسم علامتك"
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">المدينة *</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.city}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="الدار البيضاء"
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">رقم الواتساب *</label>
                  <input
                    type="tel"
                    required
                    value={newRequestForm.phone}
                    onChange={e => setNewRequestForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="06XXXXXXXX"
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">تفاصيل ومواصفات إضافية</label>
                <textarea
                  rows={3}
                  value={newRequestForm.description}
                  onChange={e => setNewRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="حدد الألوان المطلوبة، نوع الاستخدام (عبايات، هوديات، سترات...)، وتاريخ الإطلاق التقريبي..."
                  className="w-full bg-[#1e1f22] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateCustomRequestModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  نشر الطلب لجميع الموردين
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUPAGE MODAL 4: SUPPLIER REPLY MODAL (تقديم عرض سعر كـ مورد)
          ───────────────────────────────────────────────────────────── */}
      {replyModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg bg-[#232428] rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto text-white"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-5 border-b border-[#383a40] flex items-center justify-between bg-gradient-to-r from-indigo-950/60 to-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">تقديم عرض سعر وتوريد للزبون</h3>
                  <p className="text-[10px] text-slate-400">الطلب: {replyModalRequest.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyModalRequest(null)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendSupplierReply} className="p-5 sm:p-6 space-y-3.5 text-xs">
              <div className="p-3 bg-[#1e1f22] rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">الزبون الطالب:</span>
                <p className="font-bold text-white text-xs">{replyModalRequest.brandName} ({replyModalRequest.city})</p>
                <p className="text-[11px] text-slate-300">الكمية المطلوبة: {replyModalRequest.targetQty} {replyModalRequest.unit}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">اسم المورد / المستودع *</label>
                  <select
                    value={supplierReplyForm.supplierName}
                    onChange={e => {
                      const name = e.target.value;
                      const city = name.includes('Tanger') || name.includes('طنجة') ? 'طنجة' : 'الدار البيضاء';
                      setSupplierReplyForm(prev => ({ ...prev, supplierName: name, supplierCity: city }));
                    }}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-400"
                  >
                    <option value="دار الكريب والأقمشة النسائية (Derb Omar)">دار الكريب والأقمشة النسائية (Derb Omar)</option>
                    <option value="مجمع أقمشة الشرق (Derb Omar)">مجمع أقمشة الشرق (Derb Omar)</option>
                    <option value="أقمشة المسيرة الشمالية (Tissus Nord Tanger)">أقمشة المسيرة الشمالية (Tissus Nord Tanger)</option>
                    <option value="مؤسسة الأناقة للوازم الخياطة (كراج علال)">مؤسسة الأناقة للوازم الخياطة (كراج علال)</option>
                    <option value="مستودع أقمشة الكتان والصيف الطبيعي">مستودع أقمشة الكتان والصيف الطبيعي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">المدينة</label>
                  <input
                    type="text"
                    value={supplierReplyForm.supplierCity}
                    onChange={e => setSupplierReplyForm(prev => ({ ...prev, supplierCity: e.target.value }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">السعر المقترح (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={supplierReplyForm.priceMAD}
                    onChange={e => setSupplierReplyForm(prev => ({ ...prev, priceMAD: Number(e.target.value) }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-black focus:outline-hidden focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">أدنى كمية (MOQ)</label>
                  <input
                    type="number"
                    value={supplierReplyForm.minQty}
                    onChange={e => setSupplierReplyForm(prev => ({ ...prev, minQty: Number(e.target.value) }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">مدة التسليم</label>
                  <input
                    type="text"
                    value={supplierReplyForm.deliveryTime}
                    onChange={e => setSupplierReplyForm(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    className="w-full bg-[#1e1f22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">تفاصيل العرض والعينة للزبون *</label>
                <textarea
                  rows={3}
                  required
                  value={supplierReplyForm.message}
                  onChange={e => setSupplierReplyForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="اشرح توفر القماش والمواصفات وإمكانية إرسال عينة تجريبية..."
                  className="w-full bg-[#1e1f22] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-indigo-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReplyModalRequest(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  إرسال العرض للزبون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
