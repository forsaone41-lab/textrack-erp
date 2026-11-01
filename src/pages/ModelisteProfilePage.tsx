import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Star, Clock, MapPin, Phone, Award, ThumbsUp, 
  Layers, ChevronRight, Share2, Sparkles, ShieldCheck, 
  ArrowRight, Eye, Send, Scissors, ArrowLeft, Check,
  MessageCircle, X, Minus, Maximize2, Minimize2, Smile, Paperclip,
  Briefcase, GraduationCap, Ruler, MessageSquare
} from 'lucide-react';
import { MODELISTES_DATA, getModelisteById, ModelisteProfile } from '../data/modelistesData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'modeliste';
  text: string;
  time: string;
}

export default function ModelisteProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load modeliste by id or default to the first one (Fatima-Zahra Omrani)
  const mod: ModelisteProfile = (id ? getModelisteById(id) : null) || MODELISTES_DATA[0];

  // LinkedIn Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'about' | 'portfolio' | 'pricing' | 'reviews'>('all');
  
  // Endorsements
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

  // Skill Endorsements (LinkedIn style)
  const [skillEndorsements, setSkillEndorsements] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`beya_skills_${mod.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Facebook Messenger Floating & Inline Chat States
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [isMessengerMinimized, setIsMessengerMinimized] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const initialWelcomeText = `السلام عليكم! مرحباً بك، أنا ${mod.name} 🧵✨ موديليست متخصصة فـ الباترون والتدريج الرقمي (Lectra & CLO 3D). كيفاش نقدر نعاونك فـ الكوليكسيون ديالك؟ سألني على الثمن، الوقت، أو نوع الموديل!`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`modeliste_chat_${mod.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-init',
        sender: 'modeliste',
        text: initialWelcomeText,
        time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const sidebarChatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

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

  const handleSkillEndorse = (skillName: string) => {
    const current = skillEndorsements[skillName] || 0;
    const updated = { ...skillEndorsements, [skillName]: current + 1 };
    setSkillEndorsements(updated);
    try {
      localStorage.setItem(`beya_skills_${mod.id}`, JSON.stringify(updated));
    } catch {}
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Pre-set FAQ Suggestions for Facebook Messenger Chat
  const quickSuggestions = [
    { label: '💰 شحال كيدير باترون وتدريج؟', q: 'شحال كيدير ثمن الباترون وتدريج المقاسات؟' },
    { label: '⚡ شحال كياخد الوقت د الإنجاز؟', q: 'شحال كتاخد وقت إعداد العينة الأولى والباترون؟' },
    { label: '📐 واش كتصيفطو ملفات DXF / الليزر؟', q: 'واش الملفات جاهزة ومطابقة لماكينات القص بالليزر و Lectra؟' },
    { label: '🛡️ واش كاين تعديل مجاني بعد العينة؟', q: 'واش كاين ضمان تعديل القياسات مجاناً بعد خياطة أول قطعة؟' }
  ];

  const triggerSmartReply = (userQuestion: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let replyText = '';
      const lower = userQuestion.toLowerCase();

      if (lower.includes('ثمن') || lower.includes('شحال') || lower.includes('prix') || lower.includes('tarif')) {
        replyText = `بالنسبة للأسعار: الباترون الأساسي كيبدا من ${mod.pricing.basePattern} درهم، وتدريج كل مقاس إضافي (Gradation) بـ ${mod.pricing.gradation} درهم. المحاكاة ثلاثية الأبعاد بـ ${mod.pricing.simulation3d} درهم، والبطاقة التقنية بـ ${mod.pricing.ficheTech} درهم. وكلشي مضمون ومضبوط.`;
      } else if (lower.includes('وقت') || lower.includes('مدة') || lower.includes('délai') || lower.includes('temps')) {
        replyText = `مدة التسليم والإنجاز سريعة بزاف: ${mod.turnaround} كيكون الملف والباترون واجدين عندك باش تبدا تفصل وتجرب أول عينة فوراً.`;
      } else if (lower.includes('ليزر') || lower.includes('dxf') || lower.includes('lectra') || lower.includes('gerber') || lower.includes('ملف')) {
        replyText = `أكيد! كنخدم بـ ${mod.software.join(' و ')}، وكنصيفط ليك ملفات DXF-AAMA, RUL, PDF مقاس 1:1 جاهزة مباشرة للطباعة أو للقص الأوتوماتيكي بماكينات الليزر فالورشة.`;
      } else if (lower.includes('تعديل') || lower.includes('ضمان') || lower.includes('عينة') || lower.includes('retouche')) {
        replyText = `طبعاً! مع ضمان BEYA NETWORK، كنوفر ليك مراجعة وتعديل مجاني 100% بعد خياطة أول عينة للتأكد من الملاءمة والقياسات (Fit & Fall) قبل الإنتاج الكبير.`;
      } else {
        replyText = `شكراً على رسالتك! بخصوص هذا الموديل، نقدر نخدمو ليك بأعلى جودة. تقدر تصيفط ليا الصورة أو السكيتش ديالك مباشرة فالواتساب باش نحددو التفاصيل بدقة ونبداو دابا.`;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'modeliste',
        text: replyText,
        time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => {
        const next = [...prev, botMsg];
        try {
          localStorage.setItem(`modeliste_chat_${mod.id}`, JSON.stringify(next));
        } catch {}
        return next;
      });
      setIsTyping(false);

      if (!isMessengerOpen && isMessengerMinimized) {
        setUnreadCount(c => c + 1);
      }
    }, 900);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => {
      const next = [...prev, userMsg];
      try {
        localStorage.setItem(`modeliste_chat_${mod.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setChatInput('');
    triggerSmartReply(text);
  };

  const openMessengerChat = () => {
    setIsMessengerOpen(true);
    setIsMessengerMinimized(false);
    setUnreadCount(0);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 150);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    sidebarChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const otherModelistes = MODELISTES_DATA.filter(m => m.id !== mod.id);

  const waMessage = encodeURIComponent(
    `السلام عليكم أستاذ(ة) ${mod.name}، شفت البروفايل ديالك على LinkedIn / BEYA NETWORK وبغيت نطلب خدمة باترون وتدريج لموديل جديد.`
  );
  const waUrl = `https://wa.me/${mod.whatsapp}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-28 selection:bg-indigo-600 selection:text-white" dir="rtl">
      
      {/* ───────────────── LINKEDIN STYLE TOP NAV BAR ───────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/network')}
              className="p-2 -mr-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="الرجوع إلى BEYA NETWORK"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">العودة لدليل الموديليست</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link to="/network" className="hover:text-indigo-600 transition-colors font-bold text-slate-700">BEYA NETWORK</Link>
              <span>/</span>
              <span className="text-slate-400">موديليست محترف</span>
              <span>/</span>
              <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-xs">{mod.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copiedLink ? 'تم نسخ الرابط ✓' : 'مشاركة'}</span>
            </button>

            <button
              type="button"
              onClick={openMessengerChat}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دردشة فورية</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </a>
          </div>
        </div>
      </header>

      {/* ───────────────── MAIN LINKEDIN TWO-COLUMN CONTAINER ───────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ══════════ LEFT / CENTER PRIMARY COLUMN (8 COLS) ══════════ */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 1. LINKEDIN MAIN HERO PROFILE CARD */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Cover Banner */}
              <div className="h-44 sm:h-56 relative overflow-hidden bg-slate-900">
                <img src={mod.banner} alt={mod.name} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[11px] font-black border border-amber-400/30 shadow-xs">
                    {mod.categoryLabel}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{mod.availability}</span>
                  </span>
                </div>
              </div>

              {/* Overlapping Avatar & Header Info */}
              <div className="px-6 sm:px-8 pb-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
                  {/* Avatar */}
                  <div className="relative self-start">
                    <div className="relative">
                      <img 
                        src={mod.avatar} 
                        alt={mod.name} 
                        className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-lg bg-slate-100 ring-1 ring-slate-900/10"
                      />
                      {mod.verified && (
                        <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-md" title="موديليست موثق ومعتمد">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="نشط(ة) الآن" />
                    </div>
                  </div>

                  {/* LinkedIn Action Row */}
                  <div className="flex items-center gap-2 flex-wrap sm:mb-1">
                    {/* FB Messenger Chat Button */}
                    <button
                      type="button"
                      onClick={openMessengerChat}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>رسالة فـ الشات (Messenger)</span>
                    </button>

                    {/* WhatsApp Direct */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>واتساب مباشر</span>
                    </a>

                    {/* Endorse Button */}
                    <button
                      type="button"
                      onClick={handleEndorse}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        hasEndorsedThis 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasEndorsedThis ? 'text-indigo-600 fill-indigo-600' : 'text-slate-500'}`} />
                      <span>توصية ({totalEndorsements})</span>
                    </button>
                  </div>
                </div>

                {/* Profile Identity Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{mod.name}</h1>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-md border border-blue-200/80">
                      LinkedIn Pro Member
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 text-[11px] font-black rounded-md border border-amber-200/80">
                      {mod.studio}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-slate-700 leading-snug">
                    {mod.headline}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap pt-1">
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{mod.city}</span>
                    </span>
                    <span>•</span>
                    <span className="text-blue-700 font-bold">أكثر من {totalEndorsements} توصية مهنية</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">تسليم الباترون فـ {mod.turnaround}</span>
                  </div>
                </div>

                {/* 4 Stats Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">الباترونات المنجزة</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{mod.completedPatterns}+</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">سنوات الخبرة</span>
                    <span className="text-lg font-black text-blue-700 font-mono">{mod.experienceYears}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">التقييم العام</span>
                    <span className="text-lg font-black text-amber-500 font-mono flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{mod.rating}</span>
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">مدة الإنجاز</span>
                    <span className="text-sm font-black text-emerald-700 font-mono leading-tight">{mod.turnaround}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. LINKEDIN ABOUT (نبذة مهنية) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>حول ونبذة مهنية (À propos)</span>
                </h2>
                <span className="text-xs font-bold text-slate-400">سيرة ذاتية موثقة</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {mod.about}
              </p>
              
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">التخصصات البارزة:</span>
                {mod.specialities.map((spec, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200">
                    ✨ {spec}
                  </span>
                ))}
              </div>
            </section>

            {/* 3. LINKEDIN FEATURED WORK & PORTFOLIO (المشاريع المميزة) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-blue-600" />
                    <span>المشاريع والنماذج المنفذة (Sélection & Projets)</span>
                  </h2>
                  <p className="text-xs text-slate-500">نماذج باترون جاهزة للقص بالليزر ومحاكاة 3D</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {mod.portfolio.length} نماذج معروضة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mod.portfolio.map((item, pIdx) => (
                  <div key={pIdx} className="bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs group hover:shadow-md transition">
                    <div className="h-44 relative overflow-hidden bg-slate-900">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                        {item.tag}
                      </span>
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <h3 className="text-xs font-black text-slate-900 truncate">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{item.specs}</p>
                      
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-700 font-bold">Gradation جاهزة ✓</span>
                        <a
                          href={`https://wa.me/${mod.whatsapp}?text=${encodeURIComponent(`السلام عليكم أستاذ(ة) ${mod.name}، شفت موديل "${item.title}" فـ بورتفوليو LinkedIn ديالك وبغيت نخدم بحالو.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition"
                        >
                          <span>طلب الموديل</span>
                          <ChevronRight className="w-3 h-3 rotate-180" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. LINKEDIN EXPERIENCE TIMELINE (المسار المهني) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>المسار المهني والخبرة الميدانية (Expérience)</span>
              </h2>

              <div className="space-y-4 divide-y divide-slate-100">
                {mod.experiences.map((exp, eIdx) => (
                  <div key={eIdx} className={`${eIdx > 0 ? 'pt-4' : ''} space-y-1.5`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900">{exp.role}</h3>
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-blue-700">{exp.company}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. LINKEDIN SKILLS & ENDORSEMENTS (المهارات والتوصيات) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>المهارات والأنظمة المعتمدة (Compétences & Logiciels)</span>
                  </h2>
                  <p className="text-xs text-slate-500">كليكي على زر "توصية" لتأكيد مهارة الموديليست</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ...mod.software.map(s => ({ name: s, defaultCount: 42, icon: '💻' })),
                  { name: 'Gradation industrielle (XS إلى 3XL)', defaultCount: 56, icon: '📐' },
                  { name: 'Optimisation Placement & الميطراج', defaultCount: 38, icon: '✂️' },
                  { name: 'Fiche Technique & Dossier Prod', defaultCount: 34, icon: '📋' },
                  { name: 'Contrôle Qualité & Fit Correction', defaultCount: 49, icon: '🎯' }
                ].map((skill, sIdx) => {
                  const extra = skillEndorsements[skill.name] || 0;
                  const total = skill.defaultCount + extra;
                  const hasUserEndorsedThisSkill = extra > 0;

                  return (
                    <div key={sIdx} className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{skill.icon}</span>
                          <strong className="text-xs font-black text-slate-900 truncate block">{skill.name}</strong>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          أوصى بها <strong className="text-blue-700 font-bold">{total}</strong> من زملاء المهنة
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSkillEndorse(skill.name)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition active:scale-95 shrink-0 cursor-pointer ${
                          hasUserEndorsedThisSkill
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 hover:bg-blue-50 text-slate-700'
                        }`}
                        title="أوصي بهذه المهارة"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{hasUserEndorsedThisSkill ? 'تمت ✓' : 'توصية +1'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 6. LINKEDIN EDUCATION & CERTIFICATIONS (التكوين والشهادات) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>التكوين والشهادات الأكاديمية (Formation & Certificats)</span>
              </h2>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الدبلوم الأكاديمي</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{mod.education}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الشهادات المهنية المعتمدة</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {mod.certifications.map((cert, cIdx) => (
                    <span key={cIdx} className="px-3 py-1.5 bg-blue-50 text-blue-900 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>{cert}</span>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. PRICING & GUARANTEE TABLE (الأسعار والخدمات) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-blue-600" />
                    <span>جدول أسعار الخدمات والباترونات (Tarifs)</span>
                  </h2>
                  <p className="text-xs text-slate-500">أسعار واضحة مع إمكانية الفاتورة والاتفاق المباشر</p>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                  تسليم فـ {mod.turnaround}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">الباترون الأساسي (Base)</span>
                    <span className="text-sm font-black text-blue-800 font-mono">{mod.pricing.basePattern} MAD</span>
                  </div>
                  <p className="text-[11px] text-slate-500">إعداد الباترون الأولي بدقة لمقاس أساسي واحد متوافق مع نوع الثوب.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">تدريج المقاسات (Gradation)</span>
                    <span className="text-sm font-black text-blue-800 font-mono">+{mod.pricing.gradation} MAD / مقاس</span>
                  </div>
                  <p className="text-[11px] text-slate-500">تدريج صناعي من XS إلى 3XL متوافق مع جدول القياسات المطلوب.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">محاكاة 3D (Simulation CLO)</span>
                    <span className="text-sm font-black text-blue-800 font-mono">+{mod.pricing.simulation3d} MAD</span>
                  </div>
                  <p className="text-[11px] text-slate-500">رؤية واقعية للموديل على مانيكان بحركة حقيقية قبل قص السلعة.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">البطاقة التقنية (Fiche Tech)</span>
                    <span className="text-sm font-black text-blue-800 font-mono">+{mod.pricing.ficheTech} MAD</span>
                  </div>
                  <p className="text-[11px] text-slate-500">حساب الميطراج بدقة وتحديد مراحل الخياطة والماكينات للورشة.</p>
                </div>
              </div>

              {/* BEYA Guarantee */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="text-xs font-black text-emerald-950">ضمان BEYA لمطابقة القياسات 100%</h3>
                    <p className="text-[11px] text-emerald-800">تعديل مجاني على الباترون في حال وجود أي ملاحظة بعد خياطة أول قطعة.</p>
                  </div>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition active:scale-95 shadow-xs"
                >
                  حجز موعد العمل
                </a>
              </div>
            </section>

            {/* 8. CLIENT RECOMMENDATIONS & REVIEWS (التوصيات) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>توصيات أصحاب البراندات والورشات (Recommandations)</span>
                </h2>
                <span className="text-xs font-mono font-bold text-amber-600">⭐ {mod.rating} / 5</span>
              </div>

              <div className="space-y-3">
                {mod.reviews.map((rev, rIdx) => (
                  <div key={rIdx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-xs text-slate-900 block">{rev.author}</strong>
                        <span className="text-[11px] text-blue-700 font-bold">{rev.brand}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block">{rev.date}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ══════════ RIGHT SIDEBAR COLUMN (4 COLS): FACEBOOK CHAT + WIDGETS ══════════ */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* 💬 INLINE FACEBOOK MESSENGER CHAT BOX (DIRECT IN PROFILE) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden sticky top-20">
              
              {/* Facebook Messenger Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={mod.avatar} alt={mod.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black truncate max-w-[170px] leading-tight">{mod.name}</h2>
                    <span className="text-[10px] text-blue-100 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>نشط(ة) الآن على Facebook Chat</span>
                    </span>
                  </div>
                </div>

                <a 
                  href={waUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                  title="فتح في الواتساب"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Chat Messages List */}
              <div className="p-3.5 bg-slate-50/70 h-72 overflow-y-auto space-y-2.5 custom-scrollbar text-xs">
                <div className="text-center my-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-medium font-mono">
                    دردشة آمنة عبر BEYA Messenger
                  </span>
                </div>

                {messages.map((m) => {
                  const isMe = m.sender === 'user';
                  return (
                    <div 
                      key={m.id} 
                      className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img src={mod.avatar} alt={mod.name} className="w-6 h-6 rounded-full object-cover shrink-0 mb-1" />
                      )}
                      <div className="max-w-[82%] space-y-0.5">
                        <div 
                          className={`p-2.5 rounded-2xl leading-relaxed text-xs shadow-2xs ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-xs' 
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className={`text-[9px] text-slate-400 block px-1 ${isMe ? 'text-left' : 'text-right'}`}>
                          {m.time} {isMe && '✓✓'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                    <img src={mod.avatar} alt={mod.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="animate-pulse">{mod.name} يكتب الآن...</span>
                  </div>
                )}
                <div ref={sidebarChatEndRef} />
              </div>

              {/* Quick Prompt Chips (Click to ask) */}
              <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">أسئلة سريعة (كليك واحد):</span>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                  {quickSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(s.q)}
                      className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-bold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 border border-slate-200/80"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Field */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5"
              >
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`اكتب رسالة لـ ${mod.name.split(' ')[0]}...`}
                  className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition active:scale-95 cursor-pointer shrink-0"
                  title="إرسال"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* WhatsApp Handover Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>أو تواصل مباشرة عبر الواتساب الرسمي ←</span>
                </a>
              </div>
            </div>

            {/* Quick Contact & Verified Studio Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">بيانات الاتصال الموثقة</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>الهاتف المباشر:</span>
                  <strong className="font-mono text-slate-900">{mod.phone}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>المدينة:</span>
                  <strong className="text-slate-900">{mod.city}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>سرعة الرد:</span>
                  <span className="text-emerald-700 font-bold">أقل من 15 دقيقة 🟢</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>طريقة العمل:</span>
                  <span className="font-bold text-blue-700">عن بعد + حضوري فـ الورشة</span>
                </div>
              </div>
            </div>

            {/* Other Modélistes (LinkedIn "People also viewed") */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">موديليست آخرون مقترحون</h3>
                <Link to="/network" className="text-[11px] text-blue-600 hover:underline font-bold">عرض الكل</Link>
              </div>

              <div className="space-y-3">
                {otherModelistes.slice(0, 3).map(other => (
                  <div
                    key={other.id}
                    onClick={() => navigate(`/modeliste/${other.id}`)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer flex items-center gap-2.5 group"
                  >
                    <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{other.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{other.categoryLabel}</p>
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-amber-600 font-bold">⭐ {other.rating}</span>
                        <span className="font-mono font-bold text-slate-700">ابتداءً من {other.startPriceMAD} DH</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ───────────────── FLOATING FACEBOOK MESSENGER DOCK (BOTTOM RIGHT / LEFT) ───────────────── */}
      <div className="fixed bottom-4 left-4 z-50">
        {!isMessengerOpen ? (
          <button
            type="button"
            onClick={openMessengerChat}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer border-2 border-white"
          >
            <div className="relative">
              <img src={mod.avatar} alt={mod.name} className="w-8 h-8 rounded-full object-cover border border-white" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
            </div>
            <div className="text-right">
              <span className="text-xs font-black block leading-none">دردشة مع {mod.name.split(' ')[0]}</span>
              <span className="text-[10px] text-blue-100 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>متصل(ة) الآن على Facebook</span>
              </span>
            </div>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ) : (
          <div 
            className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-92 overflow-hidden flex flex-col transition-all duration-300 ${
              isMessengerMinimized ? 'h-14' : 'h-[460px]'
            }`}
          >
            {/* Messenger Window Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img src={mod.avatar} alt={mod.name} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black truncate">{mod.name}</h3>
                  <span className="text-[10px] text-blue-100 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>نشط الآن</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMessengerMinimized(!isMessengerMinimized)}
                  className="p-1 rounded-md hover:bg-white/20 text-white transition cursor-pointer"
                  title={isMessengerMinimized ? 'تكبير' : 'تصغير'}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMessengerOpen(false)}
                  className="p-1 rounded-md hover:bg-white/20 text-white transition cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messenger Window Body */}
            {!isMessengerMinimized && (
              <>
                <div className="flex-1 p-3 bg-slate-50/80 overflow-y-auto space-y-2.5 text-xs custom-scrollbar">
                  <div className="text-center my-1">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-medium">
                      Facebook Messenger • BEYA Direct
                    </span>
                  </div>

                  {messages.map((m) => {
                    const isMe = m.sender === 'user';
                    return (
                      <div 
                        key={m.id} 
                        className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img src={mod.avatar} alt={mod.name} className="w-6 h-6 rounded-full object-cover shrink-0 mb-1" />
                        )}
                        <div className="max-w-[80%] space-y-0.5">
                          <div 
                            className={`p-2.5 rounded-2xl leading-relaxed text-xs shadow-2xs ${
                              isMe 
                                ? 'bg-blue-600 text-white rounded-br-xs' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                            }`}
                          >
                            {m.text}
                          </div>
                          <span className={`text-[9px] text-slate-400 block px-1 ${isMe ? 'text-left' : 'text-right'}`}>
                            {m.time} {isMe && '✓✓'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                      <img src={mod.avatar} alt={mod.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="animate-pulse">{mod.name} يكتب الآن...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Chips inside Floating Messenger */}
                <div className="p-1.5 bg-white border-t border-slate-100 flex items-center gap-1 overflow-x-auto custom-scrollbar">
                  {quickSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(s.q)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-md whitespace-nowrap transition cursor-pointer shrink-0"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5"
                >
                  <input 
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالة سريعة..."
                    className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
