import React, { useState, useEffect } from 'react';
import { Shirt, Scissors, Zap, ShieldCheck, ChevronRight, CheckCircle2, Factory, Loader2, Sparkles, Send, X, ChevronDown, ImageIcon, ArrowRight, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabase';
import { loadCompanyProfile, syncCompanyProfile, CompanyProfile, saveLead } from '../types';
import { sendEmailNotification } from './LandingPage';
import { trackPixelEvent } from '../utils/pixel';

export default function AdsLanding() {
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [totalEstimate, setTotalEstimate] = useState<{min: number, max: number} | null>(null);
  const [submittedName, setSubmittedName] = useState('');
  const [isAr, setIsAr] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  interface ModelEntry {
    id: string;
    type: string;
    customType: string;
    quantity: string;
    tailles: Record<string, string>;
    details: string;
    photo: string | null;
    photos: string[];
  }

  const emptyModel = (): ModelEntry => ({
    id: Math.random().toString(36).slice(2),
    type: 'T-Shirt', customType: '', quantity: '',
    tailles: { XS: '', S: '', M: '', L: '', XL: '', XXL: '' },
    details: '', photo: null, photos: []
  });

  const [models, setModels] = useState<ModelEntry[]>([emptyModel()]);

  const updateModel = (id: string, field: Partial<ModelEntry>) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...field } : m));
  };

  const calculateEstimate = (type: string, qtyStr: string) => {
    const quantity = parseInt(qtyStr) || 0;
    if (quantity === 0) return null;
    
    let baseMin = 0;
    let baseMax = 0;
    
    switch(type) {
      case 'T-Shirt': baseMin = 35; baseMax = 45; break;
      case 'Polo': baseMin = 60; baseMax = 75; break;
      case 'T-Shirt Oversize': baseMin = 45; baseMax = 60; break;
      case 'Sweat / Hoodie': baseMin = 120; baseMax = 150; break;
      case 'Djellaba / Gandoura': baseMin = 150; baseMax = 250; break;
      case 'Ensemble / Survêtement': baseMin = 180; baseMax = 260; break;
      case 'Pyjama': baseMin = 80; baseMax = 120; break;
      case 'Uniforme / Travail': baseMin = 100; baseMax = 180; break;
      case 'Pantalon': baseMin = 80; baseMax = 130; break;
      default: return null; // For 'Autre'
    }

    // Adjust price based on quantity
    if (quantity < 100) {
      baseMin *= 1.15;
      baseMax *= 1.15;
    } else if (quantity >= 500) {
      baseMin *= 0.9;
      baseMax *= 0.9;
    }

    return {
      min: Math.round(baseMin),
      max: Math.round(baseMax),
      totalMin: Math.round(baseMin * quantity),
      totalMax: Math.round(baseMax * quantity)
    };
  };

  const updateModelTaille = (id: string, size: string, val: string) => {
    setModels(prev => prev.map(m => {
      if (m.id !== id) return m;
      const newTailles = { ...m.tailles, [size]: val };
      const total = Object.values(newTailles).reduce((a, v) => a + (Number(v) || 0), 0);
      return { ...m, tailles: newTailles, quantity: total > 0 ? total.toString() : m.quantity };
    }));
  };

  const handleModelPhoto = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErrorMsg(isAr ? 'الصورة كبيرة جداً (Max 10MB)' : 'Photo trop grande (Max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h = h * MAX / w; w = MAX; }
        else if (h > MAX) { w = w * MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        let newPhoto = '';
        if (ctx) { ctx.drawImage(img, 0, 0, w, h); newPhoto = canvas.toDataURL('image/jpeg', 0.6); }
        else { newPhoto = ev.target?.result as string; }
        
        setModels(prev => prev.map(m => {
          if (m.id !== id) return m;
          const currentPhotos = m.photos || (m.photo ? [m.photo] : []);
          const newPhotos = [...currentPhotos, newPhoto];
          return { ...m, photo: newPhotos[0], photos: newPhotos };
        }));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeModelPhoto = (id: string, index: number) => {
    setModels(prev => prev.map(m => {
      if (m.id !== id) return m;
      const currentPhotos = m.photos || (m.photo ? [m.photo] : []);
      const newPhotos = currentPhotos.filter((_, i) => i !== index);
      return { ...m, photo: newPhotos.length > 0 ? newPhotos[0] : null, photos: newPhotos };
    }));
  };

  // Auto-redirect to Arabic because it's for Moroccan FB ads
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    setIsAr(true);
    const sync = async () => {
      const remote = await syncCompanyProfile();
      setCompany(remote);
    };
    sync();
    return () => {
      document.documentElement.dir = 'ltr';
    };
  }, []);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 rtl font-sans" dir="rtl">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] max-w-lg w-full text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">تم تسجيل طلبك بنجاح!</h2>
          <p className="text-slate-500 mb-8 font-medium text-lg leading-relaxed">
            مرحباً <span className="font-bold text-slate-800">{submittedName}</span>، شكراً على ثقتك في BEYA CREATIVE. لقد توصلنا بطلبك وسنقوم بدراسته.
          </p>

          {totalEstimate && (
            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-widest">التكلفة التقديرية الإجمالية</p>
              <div className="text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
                <span>{totalEstimate.min.toLocaleString()}</span>
                <span className="text-slate-400 font-medium text-xl">-</span>
                <span>{totalEstimate.max.toLocaleString()}</span>
                <span className="text-sm font-bold text-slate-500 ml-1">درهم</span>
              </div>
              <p className="text-[10px] text-indigo-400 mt-3 font-bold">* هذا الثمن تقديري وقد يتغير حسب نوع الثوب والتفاصيل المحددة.</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-600 mb-4">لتسريع العملية والبدء في تصنيع العينة (Échantillon)، يرجى تأكيد الطلب عبر الواتساب:</p>
            <a 
              href={`https://wa.me/${company.phone ? company.phone.replace(/\D/g, '') : '212624465962'}?text=${encodeURIComponent(`مرحباً BEYA CREATIVE، لقد سجلت طلبي للتو باسم ${submittedName}. أريد تأكيد الطلب والبدء في العينة. ${totalEstimate ? `(التكلفة التقديرية التي ظهرت لي: ${totalEstimate.min} - ${totalEstimate.max} درهم)` : ''}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3"
            >
              تأكيد الطلب عبر الواتساب
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </a>
            <a href="/" className="block py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors">
              العودة إلى الصفحة الرئيسية
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans rtl selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {errorMsg && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setErrorMsg(null)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-center text-slate-800 mb-2">تنبيه</h4>
            <p className="text-center text-slate-500 font-medium mb-6">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors active:scale-95">
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">B</div>
            <span className="font-black text-xl tracking-tight text-slate-800">BEYA <span className="text-indigo-600">CREATIVE</span></span>
          </div>
          <a href="#devis" className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-indigo-600 hover:shadow-indigo-200 transition-all flex items-center gap-2">
            احصل على عرض سعر <ChevronRight className="w-4 h-4 rotate-180" />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1fac08c04a?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> البرنامج الخاص بأصحاب العلامات التجارية والتجارة الإلكترونية
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
              ركز على المبيعات والتسويق، <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">وخلي الإنتاج علينا.</span>
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8 max-w-xl">
              أنت صاحب <b>Brand</b> أو خدام فـ <b>E-commerce</b>؟ مصنع BEYA CREATIVE هو الشريك الاستراتيجي ديالك. 
              كنوفروا ليك جودة عالمية باش تبني الثقة مع الكليان ديالك، مع إمكانية تجربة السوق بكميات معقولة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#devis" className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-all hover:scale-105">
                <Zap className="w-5 h-5" />
                احسب تكلفة الإنتاج مجاناً
              </a>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-400 px-4">
                <div className="flex -space-x-2 space-x-reverse">
                  {[1,2,3].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center`}>
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                  ))}
                </div>
                <div>+50 Brand<br/>بدأت ونجحت معنا</div>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-[3rem] rotate-3 opacity-20 blur-2xl"></div>
            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80" alt="Atelier de confection" className="relative z-10 w-full aspect-square object-cover rounded-[3rem] shadow-2xl border border-white/10" />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl z-20 flex items-center gap-4 border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">ضمان الجودة</p>
                <p className="text-sm font-black text-slate-800">صناعة العينة قبل الإنتاج</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Process */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">ليش كاع الـ Brands كايخدمو معانا؟</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">وفرنا ليك البيئة المثالية باش تكبر الـ Brand ديالك بلا مشاكل د الإنتاج.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-300 transition-colors">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">بدا وجرب السوق (Test)</h3>
              <p className="text-slate-600 font-medium leading-relaxed">كنعرفو باللي باش تطلق Brand جديدة خاصك تجرب. كنعطيوك الفرصة تبدا بكميات صغيرة (100 بياسة) باش تـ Testi المنتوج ديالك.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:border-emerald-300 transition-colors">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">العينة قبل كلشي (Échantillon)</h3>
              <p className="text-slate-600 font-medium leading-relaxed">المعقول هو الأساس! كنصايبو ليك العينة الأولى، كتقيسها وتأكد من جودة الثوب والفصالة 100% عاد كنبداو الإنتاج الشامل.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:border-blue-300 transition-colors">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Factory className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">توسع وكبر (Scaling)</h3>
              <p className="text-slate-600 font-medium leading-relaxed">ملي المنتوج ديالك كيضرب وكيتباع بزاف، المصنع ديالنا مستعد يوفر ليك 10,000 قطعة فـ وقت قياسي باش مايوقفش الإشهار ديالك.</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black text-slate-800 mb-3">الأسئلة الشائعة (FAQ)</h3>
              <p className="text-slate-500 font-medium">كل ما يخص الإنتاج والتعامل معنا</p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> شنو هي أقل كمية (Minimum Order)؟</h4>
                <p className="text-slate-600 font-medium text-sm pr-4">لدعم أصحاب الـ Brands الجديدة، أقل كمية للبدء هي 100 قطعة للموديل (موزعة على المقاسات التي تختارها). هذه الكمية ممتازة لتجربة السوق.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> واش كديرو الثوب ولا خاصني نجيبو؟</h4>
                <p className="text-slate-600 font-medium text-sm pr-4">نحن نقدم خدمة متكاملة (Full Package). نتكلف بالثوب، الفصالة، الخياطة، الطباعة/الطرز، والتغليف. نستخدم أفضل الأثواب التركية والمحلية لضمان جودة الـ Brand.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> كيفاش كنعرف الأثمنة ديالكم؟</h4>
                <p className="text-slate-600 font-medium text-sm pr-4">الثمن يعتمد على نوع اللباس والكمية. يمكنك استخدام <a href="#devis" className="text-indigo-600 font-bold underline">سيميلاطور الأثمنة أسفله</a>، قم بإدخال الموديل والكمية وسيعطيك تقديراً فورياً.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="devis" className="py-20 px-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-800 mb-4">سيميلاطور الأثمنة والطلب</h2>
              <p className="text-slate-500 font-medium">أدخل الموديلات التي ترغب في تصنيعها للحصول على تقدير فوري للتكلفة.</p>
            </div>

            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                const formElement = e.currentTarget;
                const formData = new FormData(formElement);
                const countryCode = (formElement.querySelector('select[name="countryCode"]') as HTMLSelectElement)?.value || '+212';
                const rawPhone = formData.get('phone') as string;
                const fullPhone = countryCode + (rawPhone.startsWith('0') ? rawPhone.substring(1) : rawPhone);
                const clientName = formData.get('name') as string;
                const clientEmail = formData.get('email') as string || 'Non spécifié';
                const clientVille = formData.get('ville') as string || 'Non spécifié';

                if (!clientName.trim().includes(' ')) {
                  setErrorMsg('المرجو إدخال الإسم الكامل (الشخصي والعائلي)');
                  return;
                }

                const missingPhoto = models.find(m => !m.photo && (!m.photos || m.photos.length === 0));
                if (missingPhoto) {
                  setErrorMsg('كل موديل خاصو عندو صورة (إجباري)');
                  return;
                }

                setIsSending(true);
                try {
                  let totMin = 0;
                  let totMax = 0;
                  
                  for (const m of models) {
                    const finalType = (m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type;
                    const est = calculateEstimate(m.type, m.quantity);
                    if (est) {
                      totMin += est.totalMin;
                      totMax += est.totalMax;
                    }
                    
                    await saveLead({
                      name: clientName,
                      email: clientEmail,
                      phone: fullPhone,
                      ville: clientVille,
                      type: finalType,
                      quantity: Number(m.quantity) || 1,
                      tailles: Object.fromEntries(Object.entries(m.tailles).filter(([_, v]) => v !== '').map(([k, v]) => [k, Number(v)])),
                      details: m.details,
                      photo: m.photos?.[0] || m.photo!,
                      photos: m.photos || (m.photo ? [m.photo] : []),
                    });
                  }
                  
                  // Track Facebook Pixel Lead event
                  trackPixelEvent('Lead', {
                    content_name: models.map(m => m.type).join(', '),
                    content_category: 'Confection Lead',
                    value: models.reduce((acc, m) => acc + (Number(m.quantity) || 1), 0),
                    currency: 'MAD'
                  });

                  setSubmittedName(clientName);
                  if (totMin > 0) {
                    setTotalEstimate({ min: totMin, max: totMax });
                  } else {
                    setTotalEstimate(null);
                  }

                  setIsSending(false);
                  setIsSuccess(true);
                  
                  // Do NOT auto open whatsapp. Let them read the success page and click.

                  setModels([emptyModel()]);
                  formElement.reset();
                } catch (err: any) {
                  setIsSending(false);
                  console.error("Error in AdsLanding:", err);
                  setErrorMsg('وقع خطأ أثناء الإرسال. المرجو التأكد من أن جميع الخانات صحيحة.');
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">الإسم الكامل</label>
                  <input type="text" name="name" placeholder="Ex: Ahmed Alami" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">Email (اختياري)</label>
                  <input type="email" name="email" placeholder="email@example.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">المدينة (اختياري)</label>
                  <input type="text" name="ville" placeholder="مثال: الدار البيضاء" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">رقم الهاتف / الواتساب</label>
                  <div className="flex gap-3">
                    <div className="relative w-[100px] flex-shrink-0">
                      <select name="countryCode" className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-4 pr-8 text-xs font-black outline-none focus:border-indigo-600 transition-colors h-[58px]">
                        <option value="+212">🇲🇦 212</option>
                        <option value="+33">🇫🇷 33</option>
                        <option value="+34">🇪🇸 34</option>
                        <option value="+1">🇺🇸 1</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <input type="tel" name="phone" placeholder="6XXXXXXXX" className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-indigo-600 transition-colors h-[58px]" dir="ltr" required />
                  </div>
                </div>
              </div>

              {/* Dynamic models */}
              {models.map((m, idx) => (
                <div key={m.id} className="border-2 border-indigo-100 rounded-2xl p-4 md:p-6 space-y-4 bg-indigo-50/30 relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-100/50 px-3 py-1.5 rounded-lg">
                      الموديل {idx + 1}
                    </p>
                    {models.length > 1 && (
                      <button type="button" onClick={() => setModels(prev => prev.filter(x => x.id !== m.id))}
                        className="w-8 h-8 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-all text-xs font-black shadow-sm">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">نوع اللباس</label>
                      <div className="relative">
                        <select value={m.type} onChange={e => updateModel(m.id, { type: e.target.value })}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors appearance-none">
                          {['T-Shirt','Polo','T-Shirt Oversize','Sweat / Hoodie','Djellaba / Gandoura','Ensemble / Survêtement','Pyjama','Uniforme / Travail','Pantalon'].map(t => <option key={t}>{t}</option>)}
                          <option value="Autre">نوع آخر</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {m.type === 'Autre' && (
                        <input type="text" value={m.customType} onChange={e => updateModel(m.id, { customType: e.target.value })}
                          placeholder="حدد النوع"
                          className="mt-2 w-full bg-indigo-50 border-2 border-indigo-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600" required />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">الكمية الإجمالية للموديل</label>
                      <input type="number" min="1" placeholder="100" value={m.quantity} onChange={e => updateModel(m.id, { quantity: e.target.value })}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 h-[50px]" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">المقاسات (اختياري - وزع الكمية)</label>
                    <div className="grid grid-cols-6 gap-2">
                      {['XS','S','M','L','XL','XXL'].map(size => (
                        <div key={size} className="relative group">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 bg-indigo-50 text-[8px] font-black text-indigo-600 rounded-full border border-indigo-100 z-10">{size}</div>
                          <input type="number" value={m.tailles[size]} onChange={e => updateModelTaille(m.id, size, e.target.value)} placeholder="0"
                            className="w-full bg-white border-2 border-slate-200 rounded-xl pt-3 pb-1 px-1 text-center text-xs font-black outline-none focus:border-indigo-600 h-[50px]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">تفاصيل الطلب (ألوان، نوع الثوب...)</label>
                      <textarea rows={3} value={m.details} onChange={e => updateModel(m.id, { details: e.target.value })}
                        placeholder="اشرح شنو باغي..."
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 resize-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">
                        صورة الموديل <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(m.photos || (m.photo ? [m.photo] : [])).map((p, pIdx) => (
                          <div key={pIdx} className="relative w-[100px] h-[100px] rounded-xl overflow-hidden border-2 border-indigo-200 shadow-sm">
                            <img src={p} className="w-full h-full object-cover" alt="" />
                            <button type="button" onClick={() => removeModelPhoto(m.id, pIdx)}
                              className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(m.photos || (m.photo ? [m.photo] : [])).length < 5 && (
                          <label className="flex flex-col items-center justify-center w-[100px] h-[100px] bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all shrink-0">
                            <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1 leading-tight">إضافة صورة</span>
                            <input type="file" accept="image/*" onChange={e => handleModelPhoto(m.id, e)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Simulator display */}
                  {(() => {
                    const est = calculateEstimate(m.type, m.quantity);
                    if (!est) return null;
                    return (
                      <div className="mt-4 p-4 bg-white border-2 border-emerald-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">التكلفة التقديرية للموديل</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">بناءً على {m.quantity} قطعة من نوع {m.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-800">{est.min} - {est.max} MAD <span className="text-xs text-slate-500">/ قطعة</span></p>
                          <p className="text-xs font-bold text-emerald-500">الإجمالي: {est.totalMin.toLocaleString()} - {est.totalMax.toLocaleString()} MAD</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}

              {/* Add model button */}
              <button type="button" onClick={() => setModels(prev => [...prev, emptyModel()])}
                className="w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-600 bg-indigo-50/50 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                + إضافة موديل آخر
              </button>

              <button type="submit" disabled={isSending} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-60 mt-4">
                {isSending ? 'جاري الإرسال...' : `أرسل الطلب الآن ${models.length > 1 ? `(${models.length} موديلات)` : ''}`}
                {!isSending && <Send className="w-5 h-5 ml-2" />}
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 mt-4">معلوماتك آمنة ولن يتم مشاركتها مع أي طرف ثالث.</p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-center border-t border-white/10 mt-20">
        <div className="flex justify-center items-center gap-2 text-white/50 text-sm font-bold">
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white text-xs">B</div>
          BEYA CREATIVE © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

