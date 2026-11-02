import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Star, Clock, MapPin, Phone, Award, ThumbsUp, 
  Layers, ChevronRight, Share2, Sparkles, ShieldCheck, 
  ArrowRight, Eye, Send, Scissors, ArrowLeft, Check,
  MessageCircle, X, Minus, Maximize2, Minimize2, Smile, Paperclip,
  Briefcase, GraduationCap, Ruler, MessageSquare, ExternalLink,
  Truck, Tag, AlertCircle, ShoppingBag, Box, Filter
} from 'lucide-react';
import { SUPPLIERS_DATA, getSupplierById, SupplierProfile } from '../data/suppliersData';

interface SupplierProfilePageProps {
  supplierId?: string;
  onBack?: () => void;
}

export default function SupplierProfilePage({ supplierId: propSupplierId, onBack }: SupplierProfilePageProps) {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const id = propSupplierId || routeId;
  const supplier: SupplierProfile = (id ? getSupplierById(id) : null) || SUPPLIERS_DATA[1]; // default to Tissus Nord Tanger

  const [activeTab, setActiveTab] = useState<'catalog' | 'reviews' | 'about' | 'tamyoz'>('catalog');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Custom reviews saved by users
  const [supplierCustomReviews, setSupplierCustomReviews] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem('beya_supplier_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({ author: '', brand: '', rating: 5, text: '' });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/network');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.text.trim()) return;
    const rev = {
      author: newReviewForm.author.trim() || 'صاحب براند',
      brand: newReviewForm.brand.trim() || 'علامة تجارية مغربية',
      rating: Number(newReviewForm.rating) || 5,
      date: 'الآن (مباشر)',
      text: newReviewForm.text.trim()
    };
    const supId = supplier.id;
    setSupplierCustomReviews(prev => {
      const nextReviews = [rev, ...(prev[supId] || [])];
      const updated = { ...prev, [supId]: nextReviews };
      try { localStorage.setItem('beya_supplier_reviews', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setNewReviewForm({ author: '', brand: '', rating: 5, text: '' });
    setShowAddReviewModal(false);
  };

  const allReviews = [
    ...(supplierCustomReviews[supplier.id] || []),
    ...(supplier.reviews || [])
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32 selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {/* ───────────────── TOP STICKY NAVIGATION BAR ───────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black transition active:scale-95 cursor-pointer border border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
            <span>← الرجوع إلى دليل الموردين</span>
          </button>

          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>مورد معتمد في شبكة BEYA</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
            title="مشاركة رابط المورد"
          >
            <Share2 className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">{copiedLink ? 'تم نسخ الرابط ✓' : 'مشاركة'}</span>
          </button>

          <a
            href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معكم عبر شبكة BEYA بخصوص الكتالوج وأسعار الجملة لـ ${supplier.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>تواصل واتساب (سعر VIP)</span>
          </a>
        </div>
      </header>

      {/* ───────────────── MAIN FULL PAGE CONTAINER ───────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. HERO COVER & SUPPLIER IDENTITY CARD */}
        <section className="bg-slate-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
          {/* Cover Photo */}
          <div className="relative h-56 sm:h-72 w-full bg-slate-950 overflow-hidden">
            <img 
              src={supplier.cover} 
              alt={supplier.name} 
              className="w-full h-full object-cover opacity-80 scale-100 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

            {/* Badges on top of cover */}
            <div className="absolute top-4 right-4 flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1.5 bg-white/95 text-slate-950 rounded-xl text-xs font-black shadow-lg">
                🏷️ {supplier.categoryLabel}
              </span>
              <span className="px-3 py-1.5 bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{supplier.rating}</span>
              </span>
              <span className="px-3 py-1.5 bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg">
                📍 {supplier.city}
              </span>
            </div>

            {/* Verified seal badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-emerald-500/90 text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>معتمد ورشة BEYA</span>
              </span>
            </div>
          </div>

          {/* Identity & Main Info Header */}
          <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Large Logo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 shadow-2xl shrink-0 overflow-hidden border-4 border-slate-900">
                  <img 
                    src={supplier.logo} 
                    alt={supplier.name} 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                {/* Names & Addresses */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {supplier.name}
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{supplier.district}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                    {supplier.desc}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معكم من شبكة BEYA CREATIVE بخصوص طلبيات الأقمشة.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-110 text-white rounded-2xl text-xs font-black shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>تواصل فـ الواتساب مباشرة</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(true)}
                  className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
                  title="أضف تقييمك لهذا المورد"
                >
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">أضف تقييم</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">الحد الأدنى للطلب (MOQ)</span>
                <span className="text-sm sm:text-base font-black text-indigo-300">{supplier.minQty}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">متوسط الأسعار (سعر الجملة)</span>
                <span className="text-sm sm:text-base font-black text-emerald-400">{supplier.priceRange}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">سرعة التوصيل</span>
                <span className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>{supplier.deliveryTime.split('•')[0]}</span>
                </span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">تقييمات البراندات الشريكة</span>
                <span className="text-sm sm:text-base font-black text-amber-400 flex items-center gap-1">
                  <span>⭐ {supplier.rating}</span>
                  <span className="text-xs text-slate-400 font-normal">({allReviews.length} تقييم)</span>
                </span>
              </div>
            </div>

            {/* Special BEYA VIP Guarantee Ribbon */}
            <div className="mt-4 p-3.5 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-indigo-200 font-bold">
                  {supplier.beyaAdvantage}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-300 rounded-lg text-[10px] font-black shrink-0">
                امتياز BEYA VIP
              </span>
            </div>
          </div>
        </section>

        {/* 2. NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>الكتالوج والأقمشة المتوفرة</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{supplier.catalog?.length || 0}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>تقييمات وتجارب البراندات</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{allReviews.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>عن المورد وموقع المستودع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tamyoz')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'tamyoz'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ضمان BEYA ومقارنة فيسبوك</span>
          </button>
        </div>

        {/* 3. TAB CONTENT 1: CATALOG & FABRIC LIST */}
        {activeTab === 'catalog' && (
          <section className="space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 rounded-2xl border border-white/5">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>قائمة الأقمشة والسلع الجاهزة فالمستودع</span>
                  <span className="text-xs font-bold text-emerald-400">✓ أسعار خاصة بأعضاء BEYA</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  جميع الأسعار مباشرة من المصنع/المستورد بدون وسيط أو زيادة
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>تحديث أسبوعي للمخزون</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(supplier.catalog || []).map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-400">نوع النسيج: {item.type}</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold shrink-0">
                        {item.stockStatus}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-400 font-bold">سعر الجملة المعتمد:</span>
                        <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">{item.price}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {item.specs}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">الألوان المتوفرة في المخزن:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.colors.map((c: string, ci: number) => (
                          <span key={ci} className="px-2.5 py-1 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-xs font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار أو طلب قماش: ${item.name} المعروض في كتالوج ${supplier.name} بشبكة BEYA.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>طلب هذا القماش عبر واتساب</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. TAB CONTENT 2: REVIEWS */}
        {activeTab === 'reviews' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            {/* Reviews Summary Card */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">{supplier.rating}</span>
                  <div className="flex items-center justify-center gap-1 text-amber-400 mt-1">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star key={st} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">بناءً على {allReviews.length} تقييم</span>
                </div>
                <div className="h-16 w-px bg-white/10 hidden sm:block" />
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white">تجارب حقيقية من صناع الموضة</h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    كل التقييمات صادرة من علامات تجارية مغربية وورشات خياطة مسجلة في منصة BEYA اشترت وجربت جودة الأقمشة.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddReviewModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black shadow-lg transition active:scale-95 cursor-pointer shrink-0"
              >
                + أضف تجربتك وتقييمك
              </button>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReviews.map((rev, idx) => (
                <div key={idx} className="p-5 bg-slate-900/80 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-sm font-black text-white block">{rev.author}</strong>
                      <span className="text-[11px] text-indigo-300 font-bold">{rev.brand}</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: Math.round(rev.rating) }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-white/5 font-medium">
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. TAB CONTENT 3: ABOUT & LOCATION */}
        {activeTab === 'about' && (
          <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-black text-white mb-2">نبذة تفصيلية عن المورد</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {supplier.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">العنوان والموقع الجغرافي:</span>
                <span className="text-sm font-black text-white block">{supplier.district}</span>
                <span className="text-xs text-indigo-300 font-medium">مدينة {supplier.city}</span>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">رقم الهاتف والتواصل التجاري:</span>
                <span className="text-sm font-black text-emerald-400 font-mono block dir-ltr text-right">{supplier.phone}</span>
                <span className="text-xs text-slate-400">متاح طيلة أيام الأسبوع من 9:00 إلى 18:30</span>
              </div>
            </div>

            <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <strong className="text-sm font-black text-indigo-200">بغيتي تمشي تزور المستودع فـ {supplier.city}؟</strong>
                <p className="text-xs text-slate-300">
                  يمكنك مراسلتهم على الواتساب وأخذ موعد للمعاينة الميدانية وأخذ عينات قبل اعتماد الكميات الكبيرة.
                </p>
              </div>
              <a
                href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، أرغب في تحديد موعد لزيارة مستودعكم بـ ${supplier.district} لمعاينة الأقمشة.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md shrink-0 transition cursor-pointer"
              >
                تحديد موعد زيارة المستودع
              </a>
            </div>
          </section>
        )}

        {/* 6. TAB CONTENT 4: TAMYOZ & FACEBOOK COMPARISON */}
        {activeTab === 'tamyoz' && (
          <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="px-3.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold">
                ميثاق الأمان والشفافية
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                علاش تشري عبر BEYA NETWORK أحسن وأضمن من كروبات فيسبوك؟
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20 space-y-3">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                  <X className="w-4 h-4" /> المخاطر فالمجموعات المفتوحة (Facebook / WhatsApp)
                </span>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>إمكانية النصب في الأوزان أو نقصان الأمتار في الرولوات.</li>
                  <li>اختلاف العينة التي رأيتها في الصورة عن السلعة الحقيقية بعد الشحن.</li>
                  <li>غياب أي ضمان أو وسيط قانوني يرجع لك أموالك في حالة وجود عيب.</li>
                  <li>تغيير الأسعار عشوائياً عند معرفة أنك مبتدئ في المجال.</li>
                </ul>
              </div>

              <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-3">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> الامتيازات المضمونة مع BEYA NETWORK
                </span>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>جميع الموردين خضعوا لمعاينة ميدانية في مستودعاتهم من طرف فريق BEYA.</li>
                  <li>تطبيق أسعار الجملة المباشرة مع خصم VIP خاص بالأعضاء.</li>
                  <li>إمكانية طلب رولو تجريبي أو عينات ألوان قبل شراء الكمية الكاملة.</li>
                  <li>حماية تامة ووساطة من إدارة BEYA في حالة حدوث أي خلاف في الجودة.</li>
                </ul>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ───────────────── FLOATING MOBILE BAR ───────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-3 sm:hidden z-40 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[11px] font-black text-white block truncate">{supplier.name}</span>
          <span className="text-[10px] text-emerald-400 font-bold">{supplier.priceRange}</span>
        </div>
        <a
          href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`السلام عليكم، تواصلت معكم عبر شبكة BEYA بخصوص أقمشة ومستلزمات ${supplier.name}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>تواصل واتساب VIP</span>
        </a>
      </div>

      {/* ───────────────── ADD REVIEW MODAL ───────────────── */}
      {showAddReviewModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full border border-white/10 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">تقييم المورد: {supplier.name}</h3>
              <button onClick={() => setShowAddReviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">اسمك الشخصي أو المهني</label>
                <input
                  type="text"
                  value={newReviewForm.author}
                  onChange={e => setNewReviewForm({ ...newReviewForm, author: e.target.value })}
                  placeholder="مثلاً: يونس / أمين"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">اسم البراند أو الورشة</label>
                <input
                  type="text"
                  value={newReviewForm.brand}
                  onChange={e => setNewReviewForm({ ...newReviewForm, brand: e.target.value })}
                  placeholder="مثلاً: علامة Casablanca Streetwear"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">التقييم (من 1 إلى 5 نجوم)</label>
                <select
                  value={newReviewForm.rating}
                  onChange={e => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5) ممتاز جداً</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5) جيد جداً</option>
                  <option value={3}>⭐⭐⭐ (3/5) متوسط</option>
                  <option value={2}>⭐⭐ (2/5) دون المتوقع</option>
                  <option value={1}>⭐ (1/5) سيء</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">تفاصيل تجربتك مع الأقمشة والتوصيل</label>
                <textarea
                  rows={3}
                  value={newReviewForm.text}
                  onChange={e => setNewReviewForm({ ...newReviewForm, text: e.target.value })}
                  placeholder="اكتب ملاحظاتك على جودة القماش، الأمتار، وسرعة المعاملة..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer"
                >
                  نشر التقييم في شبكة BEYA
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
