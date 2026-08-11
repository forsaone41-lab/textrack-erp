import React from 'react';
import { ArrowRight, ShoppingCart, Globe, CreditCard, Truck, BarChart2, Shield, PlayCircle, Store, Zap, Smartphone } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function StoreLandingV4() {
  const { isAr, toggle } = useLang();
  
  // YouCan-like purple color theme
  const primaryColor = "bg-[#6A35FF]";
  const primaryHover = "hover:bg-[#5824E5]";
  const textColor = "text-[#6A35FF]";

  return (
    <div className={`min-h-screen bg-white text-slate-900 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {/* YouCan style logo representation */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-[10px] ${primaryColor} text-white`}>
              <span className="font-black text-2xl">B</span>
            </div>
            <span className="font-black text-2xl tracking-tight">BEYA</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-black font-semibold text-sm transition-colors">{isAr ? 'المميزات' : 'Fonctionnalités'}</a>
            <a href="#solutions" className="text-slate-600 hover:text-black font-semibold text-sm transition-colors">{isAr ? 'الحلول' : 'Solutions'}</a>
            <a href="#pricing" className="text-slate-600 hover:text-black font-semibold text-sm transition-colors">{isAr ? 'الأسعار' : 'Tarifs'}</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggle} className="text-sm font-bold text-slate-500 hover:text-black flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {isAr ? 'Français' : 'العربية'}
            </button>
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2"></div>
            <Link to="/store-signup?mode=login" className="hidden sm:block text-sm font-bold text-slate-700 hover:text-black transition-colors">
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
            <Link to="/store-signup" className={`px-6 py-2.5 ${primaryColor} text-white text-sm font-bold rounded-lg ${primaryHover} transition-colors shadow-lg shadow-indigo-500/20`}>
              {isAr ? 'ابدأ مجاناً' : 'Démarrer gratuitement'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 text-center lg:text-start pt-10">
          <h1 className="text-5xl md:text-6xl lg:text-[64px] font-black leading-[1.1] mb-6 text-slate-900">
            {isAr ? (
              <>أقوى منصة <br/><span className={textColor}>للتجارة الإلكترونية</span></>
            ) : (
              <>La meilleure plateforme <br/><span className={textColor}>E-commerce</span></>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {isAr 
              ? 'كل ما تحتاجه لإنشاء متجرك الإلكتروني، وإدارة مبيعاتك، وتطوير أرباحك في مكان واحد وبكل سهولة. ابدأ اليوم ولا تدفع حتى تبدأ في البيع.'
              : 'Tout ce dont vous avez besoin pour créer votre boutique, gérer vos ventes et augmenter vos profits. Commencez aujourd\'hui sans frais.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link to="/store-signup" className={`w-full sm:w-auto px-8 py-4 ${primaryColor} text-white rounded-xl font-bold text-lg ${primaryHover} transition-colors flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25`}>
              {isAr ? 'أنشئ متجرك الآن' : 'Créer votre boutique'}
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" />
              {isAr ? 'كيف تعمل المنصة؟' : 'Comment ça marche ?'}
            </a>
          </div>
          
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-slate-500">
             <span className="flex items-center gap-2"><Check className={`w-4 h-4 ${textColor}`} /> {isAr ? 'بدون بطاقة بنكية' : 'Sans carte bancaire'}</span>
             <span className="flex items-center gap-2"><Check className={`w-4 h-4 ${textColor}`} /> {isAr ? 'إعداد في 3 دقائق' : 'Setup en 3 minutes'}</span>
          </div>
        </div>
        
        <div className="lg:w-1/2 relative">
           {/* Mockup Container similar to YouCan */}
           <div className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 z-10">
              <div className="bg-slate-100 rounded-t-xl h-8 flex items-center px-4 gap-2 border-b border-slate-200">
                 <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <img src="/ad-bg-2.png" alt="Dashboard" className="w-full h-auto rounded-b-xl border border-slate-100" />
           </div>
           
           {/* Decorative Elements */}
           <div className={`absolute top-10 -right-10 w-64 h-64 ${primaryColor} rounded-full opacity-10 blur-3xl -z-10`} />
           <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-400 rounded-full opacity-10 blur-3xl -z-10" />
        </div>
      </section>

      {/* Trusted By Section (Social Proof) */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
               {isAr ? 'يثق بنا أكثر من 10,000 تاجر' : 'Plus de 10,000 marchands nous font confiance'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
               {/* Dummy Logos placeholders */}
               <span className="text-2xl font-black font-serif">BrandName</span>
               <span className="text-2xl font-black tracking-widest">STORE</span>
               <span className="text-2xl font-bold italic">E-COM</span>
               <span className="text-2xl font-black">MARKET.</span>
            </div>
         </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900">{isAr ? 'كل ما تحتاجه للنجاح' : 'Tout ce qu\'il vous faut pour réussir'}</h2>
          <p className="text-lg text-slate-500">{isAr ? 'أدوات قوية وسهلة الاستخدام تساعدك على مضاعفة مبيعاتك وإدارة تجارتك باحترافية.' : 'Des outils puissants et simples pour gérer et scaler votre business.'}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Store, title: isAr ? 'واجهات متجر احترافية' : 'Thèmes Professionnels', desc: isAr ? 'قوالب جاهزة ومصممة خصيصاً لزيادة نسبة التحويل (Conversion Rate).' : 'Des thèmes optimisés pour maximiser le taux de conversion.' },
            { icon: Smartphone, title: isAr ? 'متوافق مع الهواتف' : 'Mobile First', desc: isAr ? 'أكثر من 80% من المشترين يستخدمون الهاتف، متجرك سيكون مثالياً لهم.' : 'Vos clients achètent sur mobile. Votre boutique sera parfaite.' },
            { icon: Truck, title: isAr ? 'نظام الدفع عند الاستلام' : 'Cash on Delivery', desc: isAr ? 'المنصة مهيأة بالكامل للعمل بنظام الدفع عند الاستلام (COD) مع استمارات سريعة.' : 'Plateforme 100% optimisée pour le COD avec des formulaires rapides.' },
            { icon: Zap, title: isAr ? 'سرعة فائقة' : 'Vitesse Ultra Rapide', desc: isAr ? 'سيرفرات سحابية تضمن تحميل متجرك في أجزاء من الثانية.' : 'Serveurs cloud garantissant un chargement instantané.' },
            { icon: BarChart2, title: isAr ? 'إحصائيات دقيقة' : 'Analyses Détaillées', desc: isAr ? 'تتبع زوار متجرك، المبيعات، ومعدلات التحويل في الوقت الفعلي.' : 'Suivez vos visiteurs et vos ventes en temps réel.' },
            { icon: Shield, title: isAr ? 'حماية وأمان' : 'Sécurité Maximale', desc: isAr ? 'بياناتك وبيانات عملائك مشفرة ومحمية بأحدث التقنيات العالمية.' : 'Vos données sont cryptées et protégées en permanence.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all group">
              <div className={`w-14 h-14 rounded-xl ${primaryColor} bg-opacity-10 text-[#6A35FF] flex items-center justify-center mb-6 group-hover:bg-[#6A35FF] group-hover:text-white transition-colors`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Zero Risk / Pricing Section like YouCan */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl">
              <div className="flex flex-col lg:flex-row">
                 <div className="lg:w-1/2 p-12 md:p-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-bold text-sm mb-8">
                       <CheckCircle2 className="w-4 h-4" />
                       {isAr ? 'زيرو ريسك - Zero Risk' : 'Zéro Risque'}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">
                       {isAr ? 'لا تدفع حتى تبدأ في البيع' : 'Ne payez que lorsque vous vendez'}
                    </h2>
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
                       {isAr 
                        ? 'في BEYA Store، نحن نؤمن بنجاحك. لذلك يمكنك إنشاء متجرك بالكامل وإضافة منتجاتك دون دفع أي رسوم اشتراك حتى تحقق أول مبيعاتك.'
                        : 'Nous croyons en votre succès. Créez votre boutique gratuitement et ne payez qu\'après avoir réalisé vos premières ventes.'}
                    </p>
                    <ul className="space-y-5 mb-10">
                       {[
                         isAr ? 'متجر إلكتروني متكامل' : 'Boutique E-commerce complète',
                         isAr ? 'دومين احترافي (.com)' : 'Nom de domaine PRO (.com)',
                         isAr ? 'ربط مباشر مع شركات التوصيل' : 'Liaison directe avec livreurs',
                       ].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                           <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                              <Check className="w-4 h-4" />
                           </div>
                           {item}
                         </li>
                       ))}
                    </ul>
                    <Link to="/store-signup" className={`inline-block px-10 py-4 ${primaryColor} text-white rounded-xl font-bold text-lg ${primaryHover} transition-colors shadow-lg shadow-indigo-500/20`}>
                       {isAr ? 'ابدأ تجربتك المجانية' : 'Démarrer l\'essai gratuit'}
                    </Link>
                 </div>
                 <div className="lg:w-1/2 bg-slate-900 p-12 md:p-16 text-white relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 ${primaryColor} rounded-full opacity-20 blur-3xl`} />
                    <h3 className="text-3xl font-black mb-12 relative z-10">{isAr ? 'لماذا يختارنا التجار؟' : 'Pourquoi nous choisir ?'}</h3>
                    
                    <div className="space-y-10 relative z-10">
                       <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full ${primaryColor} flex items-center justify-center shrink-0`}>
                             <span className="font-black">1</span>
                          </div>
                          <div>
                             <h4 className="text-xl font-bold mb-2">{isAr ? 'عمولة 0%' : '0% de commission'}</h4>
                             <p className="text-slate-400">{isAr ? 'احتفظ بجميع أرباحك. نحن لا نأخذ أي عمولة على مبيعاتك.' : 'Gardez 100% de vos profits. Aucune commission sur les ventes.'}</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full ${primaryColor} flex items-center justify-center shrink-0`}>
                             <span className="font-black">2</span>
                          </div>
                          <div>
                             <h4 className="text-xl font-bold mb-2">{isAr ? 'دعم فني استثنائي' : 'Support Exceptionnel'}</h4>
                             <p className="text-slate-400">{isAr ? 'فريق دعم متواجد دائماً لمساعدتك عبر الواتساب.' : 'Notre équipe est toujours là pour vous aider via WhatsApp.'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${primaryColor} py-20 text-center px-6`}>
         <h2 className="text-4xl md:text-5xl font-black text-white mb-8 max-w-3xl mx-auto leading-tight">
            {isAr ? 'هل أنت مستعد لبدء قصة نجاحك؟' : 'Prêt à commencer votre success story ?'}
         </h2>
         <Link to="/store-signup" className="inline-block px-10 py-5 bg-white text-slate-900 rounded-xl font-black text-xl hover:bg-slate-50 transition-colors shadow-2xl">
            {isAr ? 'أنشئ متجرك مجاناً' : 'Créer votre boutique gratuitement'}
         </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
           <div className="md:col-span-2">
             <Link to="/" className="flex items-center gap-2 mb-6">
               <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${primaryColor} text-white`}>
                 <span className="font-black text-xl">B</span>
               </div>
               <span className="font-black text-xl tracking-tight text-slate-900">BEYA</span>
             </Link>
             <p className="text-slate-500 max-w-sm leading-relaxed">
                {isAr 
                  ? 'المنصة الأفضل لإنشاء متجرك الإلكتروني في المغرب والشرق الأوسط. سهولة، سرعة، وأمان.' 
                  : 'La meilleure plateforme pour créer votre boutique E-commerce au Maroc. Simple, rapide et sécurisée.'}
             </p>
           </div>
           
           <div>
              <h4 className="font-bold text-slate-900 mb-4">{isAr ? 'المنصة' : 'Plateforme'}</h4>
              <ul className="space-y-3">
                 <li><a href="#" className="text-slate-500 hover:text-[#6A35FF] font-medium">{isAr ? 'المميزات' : 'Fonctionnalités'}</a></li>
                 <li><a href="#" className="text-slate-500 hover:text-[#6A35FF] font-medium">{isAr ? 'الأسعار' : 'Tarifs'}</a></li>
                 <li><a href="#" className="text-slate-500 hover:text-[#6A35FF] font-medium">{isAr ? 'تسجيل الدخول' : 'Connexion'}</a></li>
              </ul>
           </div>
           
           <div>
              <h4 className="font-bold text-slate-900 mb-4">{isAr ? 'مساعدة' : 'Aide'}</h4>
              <ul className="space-y-3">
                 <li><a href="#" className="text-slate-500 hover:text-[#6A35FF] font-medium">{isAr ? 'مركز المساعدة' : 'Centre d\'aide'}</a></li>
                 <li><a href="#" className="text-slate-500 hover:text-[#6A35FF] font-medium">{isAr ? 'تواصل معنا' : 'Contact'}</a></li>
                 <li><a href="#" className="text-slate-500 hover:text-[#6A35FF] font-medium">{isAr ? 'شروط الاستخدام' : 'Conditions'}</a></li>
              </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 text-center md:text-start flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-slate-400 font-medium text-sm">
             © {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
           </p>
           <div className="flex gap-4">
              <span className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">VISA</span>
              <span className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">MC</span>
              <span className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">COD</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
