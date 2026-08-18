import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, Scissors, MonitorSmartphone, TrendingUp, CheckCircle2, ShoppingCart, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import ProjectRequestModal from '../components/ProjectRequestModal';

function useOnScreen(ref: React.RefObject<Element>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIntersecting(true);
      },
      { rootMargin }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, rootMargin]);
  return isIntersecting;
}

const FadeIn = ({ children, delay = 0, className = '' }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref, '-50px');
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
    >
      {children}
    </div>
  );
};

export default function BeyaFunnel() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 font-arabic selection:bg-indigo-500/30" dir="rtl">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img src="/logo-blue.png" alt="Beya Creative" className="w-8 h-8 rounded-lg brightness-0 invert" />
            <span className="font-black text-xl tracking-widest uppercase">BEYA CREATIVE</span>
          </div>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2.5 bg-white text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            ابدأ الآن
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f172a] to-[#0f172a]"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">النظام المتكامل الأول في المغرب</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={200}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
              أطلق علامتك <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">التجارية</span><br />
              من الفكرة إلى المبيعات
            </h1>
          </FadeIn>
          
          <FadeIn delay={300}>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              نحن لا نصنع ملابسك فقط، بل نبني متجرك الإلكتروني ونربطه بذكاء لتتمكن من البيع في يومك الأول.
            </p>
          </FadeIn>
          
          <FadeIn delay={400}>
            <button 
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto hover:bg-white/5 transition-colors animate-bounce"
            >
              <ArrowDown className="w-6 h-6 text-slate-400" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="py-32 bg-[#0a0f1c] relative">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">الطريقة القديمة (معاناة)</h2>
              <p className="text-xl text-slate-400">أغلب من يبدأ في مجال الملابس يستسلم في الشهر الأول بسبب هذه المشاكل:</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-rose-500/20 hover:border-rose-500/40 transition-colors">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">تصنيع بطيء ورديء</h3>
                <p className="text-slate-400 leading-relaxed">البحث عن خياطين موثوقين يأخذ وقتاً طويلاً، وغالباً ما تكون الجودة غير مطابقة لتوقعاتك ومواعيد التسليم متأخرة.</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-rose-500/20 hover:border-rose-500/40 transition-colors">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                  <MonitorSmartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">تكاليف متجر باهظة</h3>
                <p className="text-slate-400 leading-relaxed">يطلب منك المبرمجون مبالغ خيالية لإنشاء موقعك، وفي النهاية تحصل على متجر بطيء ولا يتناسب مع السوق المغربي.</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-rose-500/20 hover:border-rose-500/40 transition-colors">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">تشتت في التسيير</h3>
                <p className="text-slate-400 leading-relaxed">تضيع وقتك بين المعمل، استوديو التصوير، وتتبع الطلبيات، مما يمنعك من التركيز على التسويق والمبيعات.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The BEYA Solution */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-24">
              <span className="text-indigo-400 font-black tracking-widest uppercase text-sm mb-4 block">الحل المتكامل</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6">BEYA CREATIVE</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">مكان واحد يجمع التصنيع العالي الجودة مع أحدث تكنولوجيا التجارة الإلكترونية.</p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Production */}
            <FadeIn delay={100} className="order-2 lg:order-1">
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-white/5 transform -rotate-6">
                    <Scissors className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-3">1. BEYA Production</h3>
                    <p className="text-slate-400 leading-relaxed mb-4">نحن نتكفل بصناعة ملابسك من الألف إلى الياء. أثواب ممتازة، فصالة عصرية، وخياطة بمعايير التصدير.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-slate-300 font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> تتبع مباشر لمراحل الخياطة من حسابك</li>
                      <li className="flex items-center gap-2 text-sm text-slate-300 font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> احترام تام لمواعيد التسليم</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-indigo-500/20 transform rotate-6">
                    <MonitorSmartphone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-3">2. BEYA Store</h3>
                    <p className="text-slate-400 leading-relaxed mb-4">نبني لك متجراً إلكترونياً ذكياً ومحسّناً للسوق المغربي بنسبة 100%.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-slate-300 font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> الدفع عند الاستلام (COD) سريع جداً</li>
                      <li className="flex items-center gap-2 text-sm text-slate-300 font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ربط أوتوماتيكي مع شركات التوصيل (eGrow)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-start gap-4">
                  <Zap className="w-8 h-8 text-emerald-400 shrink-0 mt-1 animate-pulse" />
                  <div>
                    <h4 className="text-lg font-black text-white mb-1">الميزة الخارقة (Push to Store)</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">بمجرد الانتهاء من خياطة ملابسك، يتم إرسالها آلياً إلى متجرك مع الكمية الصحيحة لتصبح جاهزة للبيع فوراً!</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Right: Visual */}
            <FadeIn delay={200} className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                <div className="relative bg-[#1e293b] border border-white/10 rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-[4/5] flex flex-col group">
                  <div className="w-full flex-1 bg-[url('/premium_streetwear_hoodie.png')] bg-cover bg-center rounded-[2.5rem] relative overflow-hidden transition-transform duration-700 group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-black">Hoodie Premium</span>
                            <span className="text-emerald-400 font-black">450 MAD</span>
                          </div>
                          <div className="w-full bg-white text-slate-900 text-center py-2.5 rounded-xl font-black text-xs uppercase tracking-widest mt-2 cursor-pointer hover:bg-emerald-400 hover:text-white transition-colors">
                            إضافة للسلة
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-32 bg-[#0a0f1c] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-1 rounded-[3rem] shadow-2xl shadow-indigo-900/50">
              <div className="bg-[#0f172a] p-10 md:p-16 rounded-[2.8rem]">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center transform rotate-12 mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                    <Star className="w-10 h-10 text-white -rotate-12" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4">هل أنت مستعد للبدء؟</h2>
                  <p className="text-slate-400 text-lg">أدخل معلوماتك وسنتواصل معك فوراً لتحديد موعد والبدء في مشروعك.</p>
                </div>

                <div className="flex justify-center pb-8">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/10 flex justify-center items-center gap-2"
                  >
                    ابدأ الآن
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-white/5 text-slate-500 text-sm font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} BEYA CREATIVE. Tous droits réservés.
      </footer>

      {/* Contact Request Modal */}
      <ProjectRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isDark={true} 
      />
    </div>
  );
}
