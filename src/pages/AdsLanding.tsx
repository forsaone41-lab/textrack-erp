import React, { useState, useEffect } from 'react';
import { Shirt, Scissors, Zap, ShieldCheck, ChevronRight, CheckCircle2, Factory, Loader2, Sparkles, Send } from 'lucide-react';
import { supabase } from '../supabase';
import { loadCompanyProfile, syncCompanyProfile, CompanyProfile } from '../types';

export default function AdsLanding() {
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    brand: '',
    modele: '',
    quantite: '100'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAr, setIsAr] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Basic formatting
      const rawPhone = formData.phone;
      const fullPhone = "+212" + (rawPhone.startsWith('0') ? rawPhone.substring(1) : rawPhone);
      
      const newLead = {
        id: Math.random().toString(36).slice(2),
        name: formData.name,
        email: formData.brand || 'Marque non spécifiée',
        phone: fullPhone,
        type: formData.modele,
        quantity: parseInt(formData.quantite) || 100,
        status: 'new',
        source: 'FB_ADS_LANDING',
        ville: 'Non spécifié',
        date: new Date().toISOString(),
        photoCount: 0
      };

      await supabase.from('leads').insert([newLead]);

      // Show success
      setIsSuccess(true);
      setTimeout(() => {
        const adminPhone = company.phone ? company.phone.replace(/\D/g, '') : '212624465962';
        window.location.href = `https://wa.me/${adminPhone}?text=${encodeURIComponent(`مرحباً ${company.name}، لقد سجلت طلبي للتو باسم ${formData.name} لموديل ${formData.modele} (${formData.quantite} قطعة). أريد تفاصيل أكثر.`)}`;
      }, 2500);

    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue, veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 rtl">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">تم تسجيل طلبكم بنجاح!</h2>
          <p className="text-slate-600 mb-8 font-medium">سيتم توجيهكم الآن إلى الواتساب للتواصل المباشر وتأكيد التفاصيل...</p>
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans rtl selection:bg-indigo-500 selection:text-white" dir="rtl">
      
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
              <Sparkles className="w-4 h-4" /> مصنع خياطة بمعايير عالمية
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
              علامتك التجارية تستحق <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">جودة لا تُضاهى.</span>
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8 max-w-xl">
              هل تبحث عن مصنع يضمن لك الفصالة المتقنة، الجودة العالية، واحترام وقت التسليم؟ 
              نحن في <b>BEYA</b> نقدم لك حلاً متكاملاً من الفصالة إلى الإنتاج الشامل.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#devis" className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-all hover:scale-105">
                <Scissors className="w-5 h-5" />
                طلب عرض سعر الآن
              </a>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-400 px-4">
                <div className="flex -space-x-2 space-x-reverse">
                  {[1,2,3].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center`}>
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                  ))}
                </div>
                <div>+50 علامة تجارية<br/>تثق بنا</div>
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
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">لماذا تختار مصنع BEYA؟</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">لأننا نفهم مخاوفك، ونوفر لك بيئة عمل شفافة واحترافية.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">العينة أولاً (Échantillon)</h3>
              <p className="text-slate-600 font-medium leading-relaxed">لا نبدأ الإنتاج الشامل حتى نصنع لك العينة الأولى وتوافق عليها 100% لتكون مرتاحاً تماماً لطلبيتك.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">سرعة وشفافية</h3>
              <p className="text-slate-600 font-medium leading-relaxed">نلتزم بوقت التسليم المتفق عليه، ونبقيك على اطلاع دائم بمراحل الإنتاج الخاصة بموديلاتك.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Factory className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">قدرة إنتاجية عالية</h3>
              <p className="text-slate-600 font-medium leading-relaxed">سواء كنت تحتاج 100 قطعة أو 10,000 قطعة، نمتلك الفريق والمعدات لتلبية طلبك بأعلى جودة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="devis" className="py-20 px-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-800 mb-4">احصل على عرض سعر اليوم</h2>
              <p className="text-slate-500 font-medium">املأ الاستمارة وسنتواصل معك فوراً عبر الواتساب لتزويدك بجميع التفاصيل والأسعار.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 outline-none transition-colors" placeholder="اسمك" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الواتساب</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 outline-none transition-colors text-left" dir="ltr" placeholder="06XXXXXXXX" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم علامتك التجارية (اختياري)</label>
                <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 outline-none transition-colors" placeholder="مثال: Maison Fashion" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نوع الموديل (مثال: T-shirt, Robe)</label>
                  <div className="relative">
                    <Shirt className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" required value={formData.modele} onChange={e => setFormData({...formData, modele: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pr-12 pl-5 py-4 font-bold focus:border-indigo-500 outline-none transition-colors" placeholder="ماذا تريد أن تصنع؟" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الكمية التقديرية</label>
                  <input type="number" min="10" required value={formData.quantite} onChange={e => setFormData({...formData, quantite: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 outline-none transition-colors" placeholder="100" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-70 mt-8">
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-2" />}
                أرسل الطلب الآن
              </button>
              <p className="text-center text-xs font-bold text-slate-400 mt-4">معلوماتك آمنة ولن يتم مشاركتها مع أي طرف ثالث.</p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-center border-t border-white/10">
        <div className="flex justify-center items-center gap-2 text-white/50 text-sm font-bold">
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white text-xs">B</div>
          BEYA CREATIVE © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
