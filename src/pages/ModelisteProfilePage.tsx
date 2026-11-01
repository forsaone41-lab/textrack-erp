import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Star, Clock, MapPin, Phone, Award, ThumbsUp, 
  Layers, ExternalLink, ChevronRight, Share2, Sparkles, ShieldCheck, 
  ArrowRight, Download, Eye, Send, Scissors, ArrowLeft, Check
} from 'lucide-react';
import { MODELISTES_DATA, getModelisteById, ModelisteProfile } from '../data/modelistesData';

export default function ModelisteProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load modeliste by id or default to the first one (Fatima-Zahra Omrani)
  const mod: ModelisteProfile = (id ? getModelisteById(id) : null) || MODELISTES_DATA[0];

  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'pricing' | 'reviews'>('about');
  const [endorsed, setEndorsed] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('beya_modeliste_endorsements');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [hasEndorsedThis, setHasEndorsedThis] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const totalEndorsements = (mod.endorsementsBase || 50) + (endorsed[mod.id] || 0);

  const handleEndorse = () => {
    if (hasEndorsedThis) return;
    const next = { ...endorsed, [mod.id]: (endorsed[mod.id] || 0) + 1 };
    setEndorsed(next);
    setHasEndorsedThis(true);
    try {
      localStorage.setItem('beya_modeliste_endorsements', JSON.stringify(next));
    } catch {}
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const otherModelistes = MODELISTES_DATA.filter(m => m.id !== mod.id);

  const waMessage = encodeURIComponent(
    `السلام عليكم أستاذ(ة) ${mod.name}، تواصلت معك من خلال بروفايلك الرسمي على منصة BEYA NETWORK وبغيت نستفسر على باترون وتفاصيل الخدمة لبراند ملابس.`
  );
  const waUrl = `https://wa.me/${mod.whatsapp}?text=${waMessage}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* ───────────────── TOP NAV / BREADCRUMB ───────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/network')}
              className="p-2 -mr-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="الرجوع إلى BEYA NETWORK"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">العودة لدليل الموديليست</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link to="/network" className="hover:text-indigo-600 transition-colors font-bold text-indigo-950">BEYA NETWORK</Link>
              <span>/</span>
              <span className="text-slate-400">موديليست معتمد</span>
              <span>/</span>
              <span className="font-bold text-slate-800 truncate max-w-[140px] sm:max-w-xs">{mod.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 md:px-3.5 md:py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
              <span className="hidden md:inline">{copiedLink ? 'تم نسخ الرابط ✓' : 'مشاركة البروفايل'}</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>واتساب مباشر</span>
            </a>
          </div>
        </div>
      </header>

      {/* ───────────────── MAIN PROFILE WRAPPER ───────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/90 overflow-hidden">
          
          {/* Cover Banner */}
          <div className="h-48 sm:h-64 md:h-72 relative overflow-hidden bg-slate-900">
            <img src={mod.banner} alt={mod.name} className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

            <div className="absolute top-4 right-4 flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-xs font-black border border-amber-400/30 shadow-md">
                {mod.categoryLabel}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{mod.availability}</span>
              </span>
            </div>
          </div>

          {/* Profile Header Block */}
          <div className="px-6 sm:px-10 pb-6 relative border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-20 sm:-mt-24 mb-5">
              {/* Avatar */}
              <div className="relative self-start">
                <img 
                  src={mod.avatar} 
                  alt={mod.name} 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-4 border-white shadow-2xl bg-slate-100 ring-1 ring-slate-900/5"
                />
                {mod.verified && (
                  <div className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full border-2 border-white shadow-md" title="موديليست معتمد من BEYA">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Main CTA Actions */}
              <div className="flex items-center gap-2.5 flex-wrap sm:mb-2">
                <button
                  type="button"
                  onClick={handleEndorse}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs ${
                    hasEndorsedThis 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasEndorsedThis ? 'text-indigo-600 fill-indigo-600' : 'text-slate-600'}`} />
                  <span>توصية ({totalEndorsements})</span>
                  {hasEndorsedThis && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">تمت</span>}
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs md:text-sm font-black shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>واتساب مباشر</span>
                </a>
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{mod.name}</h1>
                <span className="px-3 py-1 bg-amber-100/80 text-amber-900 text-xs font-black rounded-xl border border-amber-200">
                  {mod.studio}
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{mod.badge}</span>
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-700 leading-relaxed max-w-3xl">
                {mod.headline}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap pt-1">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{mod.city}</span>
                </span>
                <span>•</span>
                <span>الهاتف: <strong className="font-mono text-slate-800 font-bold">{mod.phone}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">تسليم الباترون فـ {mod.turnaround}</span>
              </div>
            </div>

            {/* 4 Core Pro Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1">الباترونات المنجزة</span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono leading-none">{mod.completedPatterns}+</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1">سنوات الخبرة</span>
                <span className="text-lg sm:text-2xl font-black text-indigo-700 font-mono leading-none">{mod.experienceYears}</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1">التقييم العام</span>
                <span className="text-lg sm:text-2xl font-black text-amber-500 font-mono flex items-center justify-center gap-1 leading-none">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                  <span>{mod.rating} / 5</span>
                </span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1">مدة الإنجاز</span>
                <span className="text-sm sm:text-base font-black text-emerald-700 font-mono leading-tight">{mod.turnaround}</span>
              </div>
            </div>
          </div>

          {/* Interactive Profile Navigation Tabs */}
          <div className="px-6 sm:px-10 bg-slate-50/70 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {[
              { key: 'about', label: 'السيرة والنبذة المهنية (À propos)' },
              { key: 'portfolio', label: `معرض النماذج (${mod.portfolio.length})` },
              { key: 'pricing', label: 'الأسعار والخدمات' },
              { key: 'reviews', label: `توصيات الزبائن (${mod.reviews.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-3 sm:px-4 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key 
                    ? 'border-indigo-600 text-indigo-900 bg-white shadow-2xs rounded-t-xl' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Body */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* 1. À PROPOS */}
            {activeTab === 'about' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Bio Statement */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>نبذة مهنية (À PROPOS)</span>
                  </h3>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                    {mod.about}
                  </p>
                </div>

                {/* Software & CAD Systems */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    البرمجيات والأنظمة المعتمدة (Logiciels CAO/DAO)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {mod.software.map((soft, sIdx) => (
                      <div key={sIdx} className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-center">
                        <span className="text-xs font-black text-indigo-950 font-mono block">{soft}</span>
                        <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">معتمد ومفعل ✓</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    التخصصات الدقيقة وأنواع الموديلات
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {mod.specialities.map((spec, spIdx) => (
                      <span key={spIdx} className="px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200/80">
                        ✨ {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    المسار المهني والخبرات الميدانية (Expériences)
                  </h3>
                  <div className="space-y-3">
                    {mod.experiences.map((exp, eIdx) => (
                      <div key={eIdx} className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{exp.role}</h4>
                          <span className="text-xs font-mono font-bold text-slate-400">{exp.period}</span>
                        </div>
                        <p className="text-xs font-bold text-indigo-700">{exp.company}</p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">{exp.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education & Certs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الدبلوم والتكوين الأكاديمي</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{mod.education}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الشهادات والاعتمادات</span>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {mod.certifications.map((cert, cIdx) => (
                        <span key={cIdx} className="px-2.5 py-1 bg-white text-indigo-900 text-xs font-bold rounded-lg border border-slate-200">
                          🎖️ {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    معرض أعمال الباترون والمحاكاة ثلاثية الأبعاد (3D & Patterns)
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">كل موديل قابل للتصدير فالحين</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {mod.portfolio.map((item, pIdx) => (
                    <div key={pIdx} className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs group hover:shadow-md transition">
                      <div className="h-52 relative overflow-hidden bg-slate-900">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-black border border-white/20">
                          {item.tag}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-black text-slate-900 leading-snug">{item.title}</h4>
                        <p className="text-xs text-slate-500 font-mono">{item.specs}</p>
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-700 font-bold">جاهز للفصالة بالليزر ✓</span>
                          <a
                            href={`https://wa.me/${mod.whatsapp}?text=${encodeURIComponent(`السلام عليكم، شفت موديل "${item.title}" فالبورتفوليو ديالك فـ BEYA NETWORK وبغيت نخدم بحالو.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition"
                          >
                            <span>طلب نفس الموديل</span>
                            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PRICING & SERVICES */}
            {activeTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    جدول الأسعار المعتمد لخدمات الباترون والتدريج
                  </h3>
                  <span className="text-xs text-emerald-700 font-bold">شفافية كاملة وبدون مصاريف خفية</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">الباترون الأساسي (Patron de Base)</span>
                      <span className="text-base font-black text-indigo-950 font-mono">{mod.pricing.basePattern} MAD</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      إعداد الباترون الأولي بدقة لمقاس أساسي واحد (Taille de base)، متوافق مع نوع ثوبك.
                    </p>
                  </div>

                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">تدريج المقاسات (Gradation)</span>
                      <span className="text-base font-black text-indigo-950 font-mono">+{mod.pricing.gradation} MAD / مقاس</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      تدريج صناعي مضبوط من XS إلى 3XL مع جدول قياسات مغربي أو أوروبي معتمد.
                    </p>
                  </div>

                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">محاكاة 3D واقعية (Simulation CLO 3D)</span>
                      <span className="text-base font-black text-indigo-950 font-mono">+{mod.pricing.simulation3d} MAD</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      رؤية الموديل على مانيكان رقمي بحركة واقعية وانسكاب مطابق لنوع القماش قبل قص السلعة.
                    </p>
                  </div>

                  <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">البطاقة التقنية والميطراج (Fiche Tech)</span>
                      <span className="text-base font-black text-indigo-950 font-mono">+{mod.pricing.ficheTech} MAD</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      ملف مفصل لاستهلاك الثوب (Placement)، ترتيب المراحل، ومواصفات الخياطة للورشة.
                    </p>
                  </div>
                </div>

                {/* Guarantee Banner */}
                <div className="p-5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950">ضمان BEYA لمطابقة الباترون</h4>
                      <p className="text-xs text-emerald-800">تعديل مجاني للباترون في حالة وجود أي ملاحظة تقنية بعد تفصيل العينة الأولى.</p>
                    </div>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition active:scale-95 shadow-sm"
                  >
                    حجز موعد عمل الآن
                  </a>
                </div>
              </div>
            )}

            {/* 4. REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    توصيات وآراء أصحاب البراندات الموثقة (Recommandations)
                  </h3>
                  <span className="text-xs text-amber-600 font-bold">تقييم ممتاز 5.0 / 5</span>
                </div>

                <div className="space-y-3">
                  {mod.reviews.map((rev, rIdx) => (
                    <div key={rIdx} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{rev.author}</h4>
                          <span className="text-xs font-bold text-indigo-700">{rev.brand}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block">{rev.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ───────────────── OTHER MODELISTES DISCOVERY ───────────────── */}
        <div className="mt-12 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">موديليست آخرون معتمدون في BEYA NETWORK</h2>
              <p className="text-xs text-slate-500">تخصصات متنوعة لتلبية احتياجات مجموعاتك القادمة</p>
            </div>
            <Link to="/network" className="text-xs font-bold text-indigo-600 hover:underline">
              عرض كل الموديليست ({MODELISTES_DATA.length}) ←
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {otherModelistes.map(other => (
              <div
                key={other.id}
                onClick={() => navigate(`/modeliste/${other.id}`)}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <img src={other.avatar} alt={other.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{other.name}</h3>
                    <p className="text-[10px] text-slate-400 truncate">{other.categoryLabel}</p>
                    <span className="text-[10px] font-mono font-bold text-amber-600">⭐ {other.rating} ({other.reviewsCount})</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold">{other.turnaround}</span>
                  <span className="font-black text-indigo-950">{other.startPriceMAD} MAD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ───────────────── FIXED BOTTOM STICKY ACTION BAR ───────────────── */}
      <aside className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={mod.avatar} alt={mod.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">{mod.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md">متاح الآن 🟢</span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate">
                بدء العمل: الباترون من {mod.startPriceMAD} MAD • التسليم فـ {mod.turnaround}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 sm:px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Phone className="w-4 h-4" />
              <span>تواصل ف الواتساب للاتفاق على الموديل</span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
