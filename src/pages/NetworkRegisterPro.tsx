import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Scissors, Building2, Package, Palette, Sparkles, CheckCircle2,
  ArrowRight, ArrowLeft, Phone, MapPin, Mail, Globe, ShieldCheck,
  MessageCircle, Star, Award, Layers, Clock, Plus, Trash2, Check,
  Camera, Upload, Eye, FileText, ChevronRight
} from 'lucide-react';

export type ProCategory = 'modeliste' | 'tissu' | 'fournitures' | 'impression' | 'broderie';

interface RegisteredProProfile {
  id: string;
  name: string;
  avatar: string;
  cover: string;
  pillar: ProCategory;
  pillarLabelAr: string;
  roleBadge: string;
  roleColor: string;
  badgeGradient: string;
  specialty: string;
  specialtyTag?: string;
  fabricCategory?: string;
  city: string;
  district: string;
  whatsapp: string;
  phone: string;
  email: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  cadSoftware?: string[];
  startingRate: string;
  rateType: string;
  minQty?: string;
  skills: string[];
  catalog?: Array<{ name: string; specs: string; price: string }>;
  responseTime: string;
  completedJobs: number;
  verified: boolean;
  isRegisteredUser: boolean;
  registeredAt: string;
  proCode: string;
}

const MOROCCO_CITIES = [
  'الدار البيضاء (درب عمر / كراج علال)',
  'الدار البيضاء (سيدي معروف / عين السبع)',
  'طنجة (المنطقة الحرة / المجد)',
  'فاس (المدينة الجديدة / بنسودة)',
  'مراكش (سيدي غانم)',
  'مكناس (المنطقة الصناعية سيدي بوزكري)',
  'الرباط / سلا (تمارة / حي الرياض)',
  'القنيطرة (المنطقة الصناعية الحرة)',
  'أكادير (أنزا / تاسيلا)',
  'تطوان (المنطقة الصناعية)',
  'وجدة',
  'آسفي',
  'الجديدة',
  'بني ملال'
];

const MODALISTE_SOFTWARES = [
  'Lectra Modaris V8',
  'CLO 3D Simulation',
  'Gerber Accumark',
  'Optitex PDS',
  'Richpeace CAD',
  'Audaces 360',
  'Illustrator Fashion Design'
];

const FABRIC_CATEGORIES = [
  { id: 'streetwear', label: 'مولطون وجيرسي ستريتوير (Molleton 340g / Jersey)' },
  { id: 'crepe', label: 'كريب وحرير وساتان عبايات وفساتين (Crêpe / Satin / Soie)' },
  { id: 'denim', label: 'جينز ودينيم أصلي (Denim Jeans & Chambray)' },
  { id: 'cargo', label: 'كانفاس وجابردين للسترات والكارجو (Canvas / Gabardine)' },
  { id: 'lin', label: 'كتان وبوبلين صيفي فاخر (Lin Pur & Popeline)' },
  { id: 'velours', label: 'مخمل وفولور شتوي (Velours & Corduroy)' }
];

const DEFAULT_AVATARS: Record<ProCategory, string[]> = {
  modeliste: [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  ],
  tissu: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80'
  ],
  fournitures: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80'
  ],
  impression: [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80'
  ],
  broderie: [
    'https://images.unsplash.com/photo-1558769132-cb1fac08c04a?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80'
  ]
};

export default function NetworkRegisterPro() {
  const navigate = useNavigate();

  // Step state: 1 (Category), 2 (Contact & Identity), 3 (Services & Pricing), 4 (Portfolio & Bio), 5 (Success)
  const [step, setStep] = useState<number>(1);
  const [pillar, setPillar] = useState<ProCategory>('modeliste');

  // Form Fields
  const [name, setName] = useState('');
  const [city, setCity] = useState(MOROCCO_CITIES[0]);
  const [district, setDistrict] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experienceYears, setExperienceYears] = useState('3 إلى 5 سنوات');
  const [specialtyTitle, setSpecialtyTitle] = useState('');
  const [fabricSpecialty, setFabricSpecialty] = useState('streetwear');
  const [selectedSoftwares, setSelectedSoftwares] = useState<string[]>(['Lectra Modaris V8', 'CLO 3D Simulation']);
  const [startingRate, setStartingRate] = useState('180');
  const [rateType, setRateType] = useState('للباترون الأساسي والتدريج');
  const [minQty, setMinQty] = useState('رولو واحد (25 كلغ) أو 20 متر');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('Gradation XS-XXL, Fiche Technique, Coupe 3D');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS.modeliste[0]);
  const [cover, setCover] = useState('https://images.unsplash.com/photo-1558769132-cb1fac08c04a?auto=format&fit=crop&w=1200&q=80');

  // Sample catalog items
  const [catalogItems, setCatalogItems] = useState([
    { name: 'خدمة أساسية أو منتج 1', specs: 'مواصفات وتفاصيل الجودة', price: '180 MAD' }
  ]);

  // Created Profile Result
  const [createdProfile, setCreatedProfile] = useState<RegisteredProProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch default avatar when pillar changes
  const handlePillarChange = (newPillar: ProCategory) => {
    setPillar(newPillar);
    if (DEFAULT_AVATARS[newPillar] && DEFAULT_AVATARS[newPillar][0]) {
      setAvatar(DEFAULT_AVATARS[newPillar][0]);
    }
    if (newPillar === 'modeliste') {
      setRateType('للباترون الأساسي والتدريج');
      setStartingRate('180');
      setSpecialtyTitle('موديليست وباتروناج رقمي ستريتوير وأوفرسايز');
    } else if (newPillar === 'tissu') {
      setRateType('للكيلو / المتر بالجملة');
      setStartingRate('44');
      setSpecialtyTitle('مورد ومستودع أقمشة قطنية شتوية وصيفية');
    } else if (newPillar === 'fournitures') {
      setRateType('للقطعة / الطقم');
      setStartingRate('1.20');
      setSpecialtyTitle('مورد سحابات YKK ولوازم الخياطة والتغليف');
    } else if (newPillar === 'impression') {
      setRateType('للطبعة DTF عالية الدقة');
      setStartingRate('8');
      setSpecialtyTitle('ورشة طباعة نسيج DTF وسيريجرافي عصرية');
    } else if (newPillar === 'broderie') {
      setRateType('للطرز 3D ثلاثي الأبعاد');
      setStartingRate('12');
      setSpecialtyTitle('مشغل تطريز إلكتروني 3D وماكينات تاجيما');
    }
  };

  const toggleSoftware = (sw: string) => {
    setSelectedSoftwares(prev =>
      prev.includes(sw) ? prev.filter(s => s !== sw) : [...prev, sw]
    );
  };

  const addCatalogItem = () => {
    setCatalogItems(prev => [
      ...prev,
      { name: '', specs: '', price: '' }
    ]);
  };

  const removeCatalogItem = (index: number) => {
    setCatalogItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateCatalogItem = (index: number, field: 'name' | 'specs' | 'price', val: string) => {
    setCatalogItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  // Submit Handler: Saves to LocalStorage & Updates System
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم المهني أو اسم الورشة / المحل');
      return;
    }
    if (!whatsapp.trim() && !phone.trim()) {
      alert('يرجى إدخال رقم الواتساب أو الهاتف للتواصل');
      return;
    }

    setIsSubmitting(true);

    const cleanWhatsapp = (whatsapp || phone || '0675239885').replace(/\D/g, '');
    const cleanPhone = phone || whatsapp || '0675239885';
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const proCode = `BEYA-${pillar.toUpperCase().slice(0, 3)}-${randCode}`;
    const newId = `pro-custom-${Date.now()}`;

    // Pillar labels and badges
    const pillarLabelAr =
      pillar === 'modeliste' ? 'موديليست وباتورناج' :
      pillar === 'tissu' ? 'مالين الثوب والأقمشة' :
      pillar === 'fournitures' ? 'مالين الفورنيتور والمستلزمات' :
      pillar === 'impression' ? 'مالين الإمبريسيون والطباعة' : 'مالين الطرز والبرودري';

    const roleBadge =
      pillar === 'modeliste' ? '✂️ موديليست معتمد' :
      pillar === 'tissu' ? (
        fabricSpecialty === 'crepe' ? '👗 كريب وفساتين' :
        fabricSpecialty === 'denim' ? '👖 جينز ودينيم' :
        fabricSpecialty === 'cargo' ? '🦺 جاباردين وكارجو' :
        fabricSpecialty === 'lin' ? '🌿 كتان وبوبلين' :
        fabricSpecialty === 'velours' ? '❄️ مخمل وشتاء' : '🧥 ستريتوير ومولطون'
      ) :
      pillar === 'fournitures' ? '📦 فورنيتور معتمد' :
      pillar === 'impression' ? '🎨 إمبريسيون معتمد' : '🪡 برودري معتمد';

    const roleColor =
      pillar === 'modeliste' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' :
      pillar === 'tissu' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
      pillar === 'fournitures' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
      pillar === 'impression' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
      'bg-rose-500/15 text-rose-300 border-rose-500/30';

    const badgeGradient =
      pillar === 'modeliste' ? 'from-indigo-600 to-purple-600' :
      pillar === 'tissu' ? 'from-emerald-600 to-teal-600' :
      pillar === 'fournitures' ? 'from-amber-500 to-orange-600' :
      pillar === 'impression' ? 'from-sky-500 to-cyan-600' :
      'from-rose-500 to-pink-600';

    const finalSkills = skillsText
      ? skillsText.split(',').map(s => s.trim()).filter(Boolean)
      : (pillar === 'modeliste' ? selectedSoftwares : ['BEYA Verified', 'جودة عالية', 'توصيل سريع']);

    const validCatalog = catalogItems.filter(item => item.name.trim());

    const newProfile: RegisteredProProfile = {
      id: newId,
      name: name.trim(),
      avatar: avatar || DEFAULT_AVATARS[pillar][0],
      cover: cover || 'https://images.unsplash.com/photo-1558769132-cb1fac08c04a?auto=format&fit=crop&w=1200&q=80',
      pillar,
      pillarLabelAr,
      roleBadge,
      roleColor,
      badgeGradient,
      specialty: specialtyTitle.trim() || (pillar === 'modeliste' ? 'موديليست معتمد' : 'مورد معتمد'),
      specialtyTag: pillar === 'tissu' ? fabricSpecialty : undefined,
      fabricCategory: pillar === 'tissu' ? fabricSpecialty : undefined,
      city: district ? `${city} (${district})` : city,
      district: district || '',
      whatsapp: cleanWhatsapp,
      phone: cleanPhone,
      email: email.trim(),
      experience: experienceYears,
      rating: 5.0,
      reviewsCount: 1,
      bio: bio.trim() || `${name} مهني معتمد فـ شبكة BEYA لنخبة صناع الموضة بالمغرب. تقديم خدمات عالية الدقة مع التزام صارم بالجودة ومواعيد التسليم.`,
      cadSoftware: pillar === 'modeliste' ? selectedSoftwares : undefined,
      startingRate: startingRate ? `ابتداءً من ${startingRate} MAD` : 'اتصل لمعرفة السعر',
      rateType,
      minQty: minQty || undefined,
      skills: finalSkills,
      catalog: validCatalog.length > 0 ? validCatalog : undefined,
      responseTime: '⚡ رد سريع (أقل من ساعة)',
      completedJobs: 1,
      verified: true,
      isRegisteredUser: true,
      registeredAt: new Date().toISOString(),
      proCode
    };

    // Save to LocalStorage
    try {
      const existingRaw = localStorage.getItem('beya_network_registered_pros');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      // Prepend so new registrations show at the very top of BEYA Network Directory
      const updatedList = [newProfile, ...existingList.filter((p: any) => p.id !== newProfile.id)];
      localStorage.setItem('beya_network_registered_pros', JSON.stringify(updatedList));

      // Also set as user's active registered pro session
      localStorage.setItem('beya_network_my_pro_account', JSON.stringify(newProfile));
    } catch (err) {
      console.error('Error saving pro registration:', err);
    }

    setCreatedProfile(newProfile);
    setIsSubmitting(false);
    setStep(5); // Go to celebration / success step
  };

  const whatsappVerificationUrl = createdProfile
    ? `https://wa.me/212675239885?text=${encodeURIComponent(
        `السلام عليكم إدارة BEYA Creative، قمت بإنشاء حساب مهني جديد في شبكة BEYA NETWORK:\n\n• الاسم: ${createdProfile.name}\n• التخصص: ${createdProfile.pillarLabelAr} (${createdProfile.specialty})\n• المدينة: ${createdProfile.city}\n• كود المهني: ${createdProfile.proCode}\n• رقم الواتساب: ${createdProfile.whatsapp}\n\nأرغب في تفعيل شارة التوثيق الذهبية (Badge Vérifié) في دليل المهنيين والموردين.`
      )}`
    : '#';

  return (
    <div className="min-h-screen bg-[#111214] text-[#dbdee1] flex flex-col font-sans select-none antialiased" dir="rtl">

      {/* TOP NAVBAR */}
      <header className="h-16 bg-[#1e1f22] border-b border-[#2b2d31] px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/network" className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/30">
            <span>B</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm tracking-wide">BEYA NETWORK</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase border border-indigo-500/30">
                PRO ENROLLMENT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">تسجيل الموديليست وموردي النسيج بالمغرب</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/network"
            className="px-4 py-2 bg-[#2b2d31] hover:bg-[#35373c] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/5 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للسيرفر</span>
          </Link>
        </div>
      </header>

      {/* MAIN REGISTRATION CONTAINER */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6">

        {/* STEP PROGRESS BAR */}
        {step < 5 && (
          <div className="bg-[#1e1f22] rounded-3xl p-5 border border-[#2b2d31] shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>الخطوة {step} من 4: {
                  step === 1 ? 'اختر صفتك المهنية (موديليست أو مورد)' :
                  step === 2 ? 'معلومات الاتصال والورشة' :
                  step === 3 ? 'التخصص والخدمات والأسعار' : 'الشعار والكتالوج التعريفي'
                }</span>
              </span>
              <span className="text-slate-400 font-mono font-bold">{step * 25}%</span>
            </div>

            <div className="w-full h-2 bg-[#2b2d31] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 1: SELECT PILLAR (ROLE SELECTION)
        ───────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-wider border border-indigo-500/20 inline-block">
                اختر صفتك المهنية
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                كيفاش باغي تخدم فـ شبكة BEYA NETWORK؟
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                سواء كنت موديليست فريلانسر أو صاحب مشغل باترون، أو مورد أقمشة ومستلزمات، حسابك غايظهر مباشرة لأصحاب براندات الملابس بالمغرب للطلب والتواصل الفوري.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Modéliste */}
              <div
                onClick={() => handlePillarChange('modeliste')}
                className={`p-5 rounded-3xl border-2 transition cursor-pointer space-y-3 relative ${
                  pillar === 'modeliste'
                    ? 'bg-[#2b2d31] border-indigo-500 shadow-xl shadow-indigo-500/10'
                    : 'bg-[#1e1f22] border-[#2b2d31] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Scissors className="w-6 h-6" />
                  </div>
                  {pillar === 'modeliste' && (
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">✂️ موديليست وباترونيست (Modéliste Pro)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    تصميم الباترونات الرقمية (Lectra, CLO 3D)، تدريج المقاسات (Gradation)، فصالة العينات، وإعداد الفيش تكنيك للبراندات.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/5">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-indigo-300 font-bold">Lectra Modaris</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-indigo-300 font-bold">CLO 3D</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-indigo-300 font-bold">Gradation</span>
                </div>
              </div>

              {/* Option 2: Fournisseur Tissu */}
              <div
                onClick={() => handlePillarChange('tissu')}
                className={`p-5 rounded-3xl border-2 transition cursor-pointer space-y-3 relative ${
                  pillar === 'tissu'
                    ? 'bg-[#2b2d31] border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : 'bg-[#1e1f22] border-[#2b2d31] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  {pillar === 'tissu' && (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">🧵 مورد أقمشة وثوب (Fournisseur Tissus)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    مستودع أو محل لبيع الأقمشة بالجملة (مولطون 340g، جيرسي قطن، كريب، جينز، كانفاس كارجو، كتان وبوبلين).
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/5">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-emerald-300 font-bold">درب عمر</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-emerald-300 font-bold">طنجة</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-emerald-300 font-bold">بالكيلو والمتر</span>
                </div>
              </div>

              {/* Option 3: Fournitures */}
              <div
                onClick={() => handlePillarChange('fournitures')}
                className={`p-5 rounded-3xl border-2 transition cursor-pointer space-y-3 relative ${
                  pillar === 'fournitures'
                    ? 'bg-[#2b2d31] border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-[#1e1f22] border-[#2b2d31] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Package className="w-6 h-6" />
                  </div>
                  {pillar === 'fournitures' && (
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">📦 لوازم الخياطة والتغليف (Fournitures & Zips)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    سحابات YKK الأصلية، أكياس بولي باغ مطبوعة (Polybags Ziplock)، أزرار، خيوط، كوردونات وهانغتيك.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/5">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-amber-300 font-bold">Zips YKK</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-amber-300 font-bold">Polybags</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-amber-300 font-bold">Hangtags</span>
                </div>
              </div>

              {/* Option 4: Impression & Broderie */}
              <div
                onClick={() => handlePillarChange('impression')}
                className={`p-5 rounded-3xl border-2 transition cursor-pointer space-y-3 relative ${
                  pillar === 'impression' || pillar === 'broderie'
                    ? 'bg-[#2b2d31] border-sky-500 shadow-xl shadow-sky-500/10'
                    : 'bg-[#1e1f22] border-[#2b2d31] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <Palette className="w-6 h-6" />
                  </div>
                  {(pillar === 'impression' || pillar === 'broderie') && (
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">🎨 ورشة طباعة أو تطريز (Impression & Broderie)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    طباعة DTF عالية الدقة، سيريجرافي بلاستيزول، Puff 3D، أو تطريز إلكتروني ثلاثي الأبعاد بماكينات تاجيما.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPillar('impression'); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${pillar === 'impression' ? 'bg-sky-500 text-white' : 'bg-white/5 text-sky-300'}`}
                  >
                    إمبريسيون (DTF)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPillar('broderie'); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${pillar === 'broderie' ? 'bg-rose-500 text-white' : 'bg-white/5 text-rose-300'}`}
                  >
                    طرز وبرودري 3D
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
              >
                <span>متابعة إدخال المعلومات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 2: BASIC CONTACT & WORKSHOP LOCATION
        ───────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-[#1e1f22] rounded-3xl p-6 sm:p-8 border border-[#2b2d31] shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2b2d31] pb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-400" />
                <span>معلومات الاتصال والورشة (Coordonnées)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                هذه المعلومات ستظهر في بروفايلك ليتمكن أصحاب البراندات من مراسلتك على الواتساب والاتصال بك.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {pillar === 'modeliste' ? 'الاسم الكامل للموديليست *' : 'اسم المحل / الورشة / المستودع *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={pillar === 'modeliste' ? 'مثال: سميرة المنصوري' : 'مثال: أقمشة الفتح (Derb Omar)'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم الواتساب للطلبيات (WhatsApp) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="06XXXXXXXX أو 2126XXXXXXXX"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    dir="ltr"
                  />
                  <span className="absolute left-3 top-3 text-[11px] text-emerald-400 font-bold">WA</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم الهاتف للاتصال المباشر
                </label>
                <input
                  type="tel"
                  placeholder="06XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white font-mono focus:outline-hidden focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني المهني
                </label>
                <input
                  type="email"
                  placeholder="contact@atelier.ma"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white font-mono focus:outline-hidden focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المدينة الرئيسية *
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  {MOROCCO_CITIES.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الحي أو العنوان التفصيلي (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: زنقة فاس، عمارة الأقمشة، الطابق 2"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#2b2d31]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 bg-[#2b2d31] hover:bg-[#35373c] text-slate-300 font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) { alert('يرجى كتابة الاسم'); return; }
                  if (!whatsapp.trim() && !phone.trim()) { alert('يرجى إدخال رقم الواتساب'); return; }
                  setStep(3);
                }}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
              >
                <span>متابعة (الخدمات والأسعار)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 3: SERVICES, PRICING & SPECIALTIES
        ───────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-[#1e1f22] rounded-3xl p-6 sm:p-8 border border-[#2b2d31] shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2b2d31] pb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>الخدمات، التخصص والأسعار التقديرية</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                حدد أسعارك المبدئية ونوع التخصص باش البراندات يلقاوك بسهولة فـ الفلترة.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  عنوان التخصص أو الوصف البارز *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    pillar === 'modeliste'
                      ? 'مثال: موديليست متخصصة في الهوديات الأوفرسايز والستريتوير 340g'
                      : 'مثال: مستودع أقمشة الملتون والقطن الممشط الفاخر بدرب عمر'
                  }
                  value={specialtyTitle}
                  onChange={e => setSpecialtyTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* If Supplier of Fabrics: Category picker */}
              {pillar === 'tissu' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    تصنيف القماش الأساسي المعروض *
                  </label>
                  <select
                    value={fabricSpecialty}
                    onChange={e => setFabricSpecialty(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-emerald-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                  >
                    {FABRIC_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* If Modéliste: Softwares Picker */}
              {pillar === 'modeliste' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    البرامج المعتمدة في إعداد الباترونات (انقر لتحديد ما تتقنه):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MODALISTE_SOFTWARES.map((sw, idx) => {
                      const isSelected = selectedSoftwares.includes(sw);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSoftware(sw)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                              : 'bg-[#2b2d31] text-slate-300 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          <span>{sw}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pricing & Units */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    السعر الافتتاحي (MAD) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="180"
                      value={startingRate}
                      onChange={e => setStartingRate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-black text-amber-400 font-mono focus:outline-hidden focus:border-amber-500"
                    />
                    <span className="absolute left-3 top-3 text-[11px] text-amber-400 font-bold">MAD</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    نوع الوحدة أو الخدمة
                  </label>
                  <input
                    type="text"
                    placeholder="للباترون والتدرج / للمتر / للكيلو"
                    value={rateType}
                    onChange={e => setRateType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {pillar === 'modeliste' ? 'سنوات الخبرة' : 'الحد الأدنى للطلب (MOQ)'}
                  </label>
                  {pillar === 'modeliste' ? (
                    <select
                      value={experienceYears}
                      onChange={e => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="1 إلى 2 سنوات">سنة إلى سنتين</option>
                      <option value="3 إلى 5 سنوات">3 إلى 5 سنوات</option>
                      <option value="6 إلى 9 سنوات">6 إلى 9 سنوات</option>
                      <option value="أكثر من 10 سنوات">أكثر من 10 سنوات خبرة</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="مثال: رولو واحد (25 كلغ)"
                      value={minQty}
                      onChange={e => setMinQty(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الكلمات المفتاحية والمهارات (افصل بينها بفاصلة)
                </label>
                <input
                  type="text"
                  placeholder="Molleton 340g, Coton 100%, Jersey, Gradation, 3D"
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  نبذة تعريفية بالخبرة والورشة (Bio) *
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب نبذة قصيرة ومقنعة عن خبرتك، البراندات اللي خدمتي معاهم، وجودة الفينيسيون ديالك..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#2b2d31]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 bg-[#2b2d31] hover:bg-[#35373c] text-slate-300 font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
              >
                <span>متابعة (الكتالوج والشعار)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 4: LOGO, PORTFOLIO & SAMPLE CATALOG
        ───────────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-[#1e1f22] rounded-3xl p-6 sm:p-8 border border-[#2b2d31] shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2b2d31] pb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                <span>الشعار، الغلاف، ونماذج من الأسعار والخدمات</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                اختر صورة لبروفايلك وأضف عينة من خدماتك لتظهر مباشرة فـ كتالوج بطاقتك.
              </p>
            </div>

            {/* Quick Avatar Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                صورة البروفايل أو الشعار (اختر من النماذج الاحترافية أو ضع رابط صورتك):
              </label>

              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {(DEFAULT_AVATARS[pillar] || DEFAULT_AVATARS.modeliste).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(img)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition cursor-pointer shrink-0 relative ${
                      avatar === img
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="avatar" className="w-full h-full object-cover" />
                    {avatar === img && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white absolute bottom-1 right-1 flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="url"
                  placeholder="أو الصق رابط صورة مخصص (URL)"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#2b2d31] border border-white/10 rounded-xl text-xs font-mono text-slate-300 focus:outline-hidden focus:border-indigo-500"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Catalog Items / Services Sample */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>عينة من الأسعار والخدمات للظهور في الكتالوج:</span>
                </label>
                <button
                  type="button"
                  onClick={addCatalogItem}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-amber-400 text-xs font-bold rounded-lg transition flex items-center gap-1 border border-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة خدمة</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {catalogItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#2b2d31] border border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="اسم الخدمة أو القماش (مثال: باترون هودي أوفرسايز)"
                        value={item.name}
                        onChange={e => updateCatalogItem(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1e1f22] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="المواصفات (Drop Shoulder, Gradation)"
                        value={item.specs}
                        onChange={e => updateCatalogItem(idx, 'specs', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1e1f22] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="السعر (200 MAD)"
                        value={item.price}
                        onChange={e => updateCatalogItem(idx, 'price', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1e1f22] border border-white/10 rounded-xl text-xs font-mono font-black text-amber-400 focus:outline-hidden text-center"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-center">
                      {catalogItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCatalogItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-6 flex items-center justify-between border-t border-[#2b2d31]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-3 bg-[#2b2d31] hover:bg-[#35373c] text-slate-300 font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitRegistration}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-2xl text-xs transition shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري إنشاء الحساب...' : 'تأكيد ونشر الحساب فـ BEYA NETWORK 🚀'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 5: CELEBRATION & PROFILE CARD CONFIRMATION
        ───────────────────────────────────────────────────────────── */}
        {step === 5 && createdProfile && (
          <div className="bg-[#1e1f22] rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30 inline-block">
                تم تسجيل حسابك بنجاح ✓
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                مرحباً بك {createdProfile.name} في شبكة BEYA NETWORK! 🚀
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                تم نشر بروفايلك المهني في دليل المهنيين والموردين. يمكن لأصحاب البراندات الآن العثور على خدماتك والتواصل معك مباشرة عبر الواتساب.
              </p>
            </div>

            {/* Digital Pro Card Preview */}
            <div className="max-w-md mx-auto bg-[#2b2d31] rounded-3xl overflow-hidden border border-[#383a40] text-right shadow-2xl">
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative">
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-amber-400 font-mono font-bold">
                  {createdProfile.proCode}
                </span>
              </div>

              <div className="p-5 pt-0 relative space-y-3">
                {/* Floating Avatar */}
                <div className="flex items-end justify-between -mt-10 mb-2">
                  <div className="relative">
                    <img
                      src={createdProfile.avatar}
                      alt={createdProfile.name}
                      className="w-18 h-18 rounded-2xl object-cover border-4 border-[#2b2d31] shadow-lg"
                    />
                    <span className="w-4 h-4 rounded-full bg-emerald-500 absolute bottom-1 right-1 border-2 border-[#2b2d31]" />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>عضو مسجل معتمد</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{createdProfile.name}</h3>
                  <p className="text-xs text-indigo-300 font-bold">{createdProfile.specialty}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span>{createdProfile.city}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#1e1f22] border border-white/5 text-xs text-slate-300 leading-relaxed font-medium">
                  {createdProfile.bio}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400 font-bold">{createdProfile.rateType}:</span>
                  <span className="text-sm font-black text-amber-400 font-mono">{createdProfile.startingRate}</span>
                </div>
              </div>
            </div>

            {/* Actions CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/network"
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة حسابي مباشرة في BEYA NETWORK</span>
              </Link>

              <a
                href={whatsappVerificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تفعيل شارة التوثيق عبر واتساب الإدارة</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-500">
              يمكنك تعديل معلومات بروفايلك أو تحديث أسعارك وكتالوجك في أي وقت من لوحة حسابك.
            </p>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-[#2b2d31] text-center text-xs text-slate-500">
        BEYA NETWORK &copy; {new Date().getFullYear()} — شبكة نخبة الموديليست، وموردي الأقمشة والمستلزمات بالمغرب.
      </footer>
    </div>
  );
}
