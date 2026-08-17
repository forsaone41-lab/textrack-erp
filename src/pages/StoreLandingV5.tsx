import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { ArrowRight, ShoppingCart, Store, MessageCircle, AlertCircle, CheckCircle2, Paintbrush, TrendingUp, ShieldCheck, Zap, Globe, MousePointerClick } from 'lucide-react';

const styles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  @keyframes float-fast {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
  }
  .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
  .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
  .blob-shape {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    animation: morph 8s ease-in-out infinite alternate;
  }
  @keyframes morph {
    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
  }
`;

export default function StoreLandingV5() {
  const { isAr, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-500/30" dir={isAr ? 'rtl' : 'ltr'}>
      <style>{styles}</style>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Store className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-black tracking-tight">Beya<span className="font-light">Store</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-sm font-bold transition-colors">
              {isAr ? 'FR' : 'ع'}
            </button>
            <Link to="/login" className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-sm hover:scale-105 transition-transform shadow-md">
              {isAr ? 'دخول' : 'Connexion'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section: The Pain Point */}
      <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-400/20 blob-shape blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/20 blob-shape blur-3xl pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Text Content */}
          <div className="text-center lg:text-left rtl:lg:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 bg-rose-50 text-rose-600 text-sm font-bold mb-6 animate-in slide-in-from-bottom-4 duration-700">
              <AlertCircle className="w-4 h-4" />
              {isAr ? 'توقف عن تضييع مبيعاتك!' : 'Arrêtez de perdre vos ventes !'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-100">
              {isAr ? 'عندك مشروع بلا موقع؟' : 'Vous avez un projet sans site web ?'} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                {isAr ? 'راك كتضيع فلوسك!' : 'Vous perdez de l\'argent !'}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-200 max-w-xl mx-auto lg:mx-0">
              {isAr 
                ? 'ميساجات كيتلفو، كليان كيتسنى الثمن، وحسابات عشوائية. الإبداع ديالك كيستاهل متجر إلكتروني احترافي يخدم بلا بيك 24/7.'
                : 'Messages perdus, clients qui attendent les prix, gestion chaotique. Votre créativité mérite une boutique pro qui vend pour vous 24/7.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link to="/setup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white font-black text-lg transition-all shadow-[0_0_30px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 group">
                {isAr ? 'صمم متجرك الآن' : 'Créer ma boutique'}
                <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Link>
              <div className="text-sm font-bold text-slate-500 flex flex-col items-center sm:items-start rtl:sm:items-start">
                 <span>{isAr ? 'مخاطرة 0%' : 'Zéro Risque'}</span>
                 <span className="text-indigo-600">{isAr ? 'خلص حتى تبيع!' : 'Payez après la 1ère vente!'}</span>
              </div>
            </div>
          </div>

          {/* Visual: Chaos vs Order */}
          <div className="relative h-[500px] w-full hidden md:block animate-in fade-in zoom-in duration-1000">
            {/* The Chaos (WhatsApp/Messages) */}
            <div className="absolute top-10 right-20 w-64 p-4 bg-white rounded-2xl shadow-xl border border-rose-100 rotate-6 animate-float-fast z-10">
               <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-2">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-sm">Client #142</span>
               </div>
               <p className="text-xs text-slate-600 mb-2">{isAr ? 'بشحال هادي عافاك؟ واش كاينة فـ الكحل؟' : 'C\'est combien svp ? Dispo en noir ?'}</p>
               <div className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded-md inline-block">{isAr ? 'لم يتم الرد منذ ساعتين' : 'En attente depuis 2h'}</div>
            </div>

            <div className="absolute top-40 left-10 w-56 p-4 bg-white rounded-2xl shadow-xl border border-rose-100 -rotate-3 animate-float-slow z-20">
               <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-sm">Commande Perdue</span>
               </div>
               <p className="text-xs text-slate-600 mb-2">{isAr ? 'سمحلي تعطلتي عليا شريتها من بلاصة أخرى' : 'Désolé c\'est trop tard, j\'ai acheté ailleurs'}</p>
            </div>

            {/* The Solution (BeyaStore) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 p-6 glass-card rounded-3xl border border-indigo-200 z-30 shadow-2xl">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                     <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-slate-800">{isAr ? 'متجر إلكتروني' : 'Boutique en ligne'}</div>
                    <div className="text-xs font-bold text-indigo-600">BeyaStore</div>
                  </div>
               </div>
               <div className="space-y-3">
                 <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 w-[100%]" />
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500">{isAr ? 'المبيعات اليوم' : 'Ventes du jour'}</span>
                    <span className="text-emerald-500">+12,500 DH</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{isAr ? 'طلبات أوتوماتيكية' : 'Commandes auto.'}</span>
                    <span className="font-bold text-slate-700">42 {isAr ? 'طلب' : 'Commandes'}</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* Creativity & Solution Section */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">{isAr ? 'الإبداع كيبدا من المتجر ديالك' : 'La créativité commence par votre boutique'}</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              {isAr ? 'متبقاش تبيع بطريقة عشوائية. عطي لمنتجاتك القيمة اللي كيستاهلو بمتجر إلكتروني احترافي كيعكس الإبداع ديالك.' : 'Ne vendez plus de façon aléatoire. Donnez à vos produits la valeur qu\'ils méritent avec une boutique pro qui reflète votre créativité.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Paintbrush className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">{isAr ? 'تصميم إبداعي' : 'Design Créatif'}</h3>
              <p className="text-slate-600 leading-relaxed">
                {isAr ? 'قوالب بريميوم مصممة خصيصاً باش تبين الجمالية ديال المنتوجات ديالك، ماشي غير سطور عادي.' : 'Des thèmes premium conçus spécifiquement pour sublimer la beauté de vos produits.'}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">{isAr ? 'رفع المبيعات أوتوماتيكياً' : 'Ventes Automatisées'}</h3>
              <p className="text-slate-600 leading-relaxed">
                {isAr ? 'أدوات الـ Upsell كتقترح منتجات أخرى على الكليان باش تزيد فالأرباح بلا ما تدير حتى مجهود.' : 'Outils d\'Upsell qui proposent d\'autres produits au client pour augmenter vos profits sans effort.'}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">{isAr ? 'إدارة منظمة' : 'Gestion Organisée'}</h3>
              <p className="text-slate-600 leading-relaxed">
                {isAr ? 'ودّع روينة الواتساب! الطلبات كتنزل منظمة فلوحة تحكم واحدة، وكتربط مباشرة مع شركات التوصيل.' : 'Fini le chaos WhatsApp ! Les commandes arrivent organisées et se lient directement à la livraison.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Offer Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">{isAr ? 'عرض لا يرفض. مخاطرة صفر.' : 'Offre irréfusable. Zéro Risque.'}</h2>
          <p className="text-lg text-slate-500 mb-12">
            {isAr ? 'حنا واثقين فالمنصة ديالنا، داكشي علاش ما تخلص والو حتى تجيب أول بيعة.' : 'Nous avons confiance en notre plateforme, c\'est pourquoi vous ne payez rien avant votre 1ère vente.'}
          </p>

          <div className="glass-card p-8 md:p-12 rounded-[40px] border border-indigo-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="text-left rtl:text-right flex-1">
                 <h3 className="text-2xl font-bold mb-2">{isAr ? 'اشتراك BeyaStore' : 'Abonnement BeyaStore'}</h3>
                 <p className="text-slate-500 mb-6">{isAr ? 'كل ما تحتاجه لإطلاق متجرك الاحترافي وإدارته.' : 'Tout ce dont vous avez besoin pour gérer votre boutique pro.'}</p>
                 <ul className="space-y-3 font-medium text-slate-700">
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> {isAr ? 'استضافة مجانية وسريعة' : 'Hébergement gratuit et rapide'}</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> {isAr ? 'قوالب مصممة لتحويل الزوار لمشترين' : 'Thèmes optimisés pour la conversion'}</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> {isAr ? 'إدارة الطلبات المتقدمة' : 'Gestion avancée des commandes'}</li>
                 </ul>
               </div>

               <div className="w-full md:w-auto p-8 rounded-3xl bg-slate-900 text-white text-center shadow-xl">
                 <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">{isAr ? 'ابتداءً من' : 'À partir de'}</div>
                 <div className="text-5xl font-black mb-1">199</div>
                 <div className="text-slate-400 mb-6">{isAr ? 'درهم / الشهر' : 'DH / Mois'}</div>
                 
                 <Link to="/setup" className="w-full block px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white font-black text-sm transition-all shadow-lg">
                   {isAr ? 'ابدأ الآن (خلص بعد البيع)' : 'Commencer (Payer après vente)'}
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 border-t border-slate-200">
        <p>© {new Date().getFullYear()} BeyaStore. {isAr ? 'الحل الذكي للتجارة الإلكترونية.' : 'La solution intelligente E-commerce.'}</p>
      </footer>
    </div>
  );
}
