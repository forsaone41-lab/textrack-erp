import React from 'react';
import {
  ArrowRight, CheckCircle2, Rocket, Globe, Code2, Layers, ShieldCheck,
  Scissors, Ruler, Package, Zap, Store, Sparkles, MapPin, Award, Layout, Cpu,
  Database, CreditCard, Workflow, Factory, Shirt, ClipboardCheck, BadgeCheck,
  Timer, Wallet, Building2, MousePointerClick, Phone
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function AboutStory() {
  const { isAr, toggle } = useLang();
  const whatsappUrl = `https://wa.me/212675239885?text=${encodeURIComponent(
    isAr
      ? 'مرحباً BEYA CREATIVE، قريت الصفحة ديالكم وبغيت نتواصل معاكم.'
      : 'Bonjour BEYA CREATIVE, j\'ai lu votre page et je souhaite vous contacter.'
  )}`;

  return (
    <div className={`min-h-screen bg-white ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">CREATIVE</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('web')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">{isAr ? 'التطوير الرقمي' : 'Digital'}</button>
            <button onClick={() => document.getElementById('store')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">BeyaStore</button>
            <button onClick={() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Beya Setup</button>
            <button onClick={() => document.getElementById('production')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Beya Production</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggle} className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase hidden sm:block">
              {isAr ? 'FR' : 'AR'}
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5">
              {isAr ? 'تواصل معانا' : 'Nous contacter'}
            </a>
          </div>
        </div>
      </nav>

      {/* ============ 1. HERO — BRAND STORY ============ */}
      <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm mb-8 shadow-sm">
              <MapPin className="w-4 h-4" />
              <span>{isAr ? 'المغرب — البيئة الرقمية و الصناعية' : 'Maroc — Écosystème Digital & Industriel'}</span>
            </div>

            <h1 className={`font-black text-slate-900 tracking-tight mb-8 ${isAr ? 'text-4xl md:text-6xl lg:text-[64px] leading-[1.4]' : 'text-5xl md:text-7xl lg:text-[76px] leading-[1.05]'}`}>
              {isAr ? (
                <>مننجز الفكرة ديالك <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">من الكود حتى للقماش.</span></>
              ) : (
                <>Du code source <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">au tissu réel.</span></>
              )}
            </h1>

            {isAr ? (
              <div className="text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-loose text-right space-y-5">
                <p>
                  <strong className="text-slate-900">Beya Creative</strong> ماشي غير وكالة ديجيتال، وماشي غير مصنع نسيج. حنا <strong className="text-blue-700">Ecosystem</strong> متكامل، الهدف ديالو هو يربط بين جوج عوالم كيبانو بعيدين عن بعضياتهم: العالم ديال البرمجة الرقمية الاحترافية (Software Engineering) والعالم ديال الصناعة التقليدية والحديثة (Manufacturing).
                </p>
                <p>
                  من جهة، عندنا فريق ديال <strong className="text-slate-900">Full-Stack Developers</strong> كيخدمو بأحدث التقنيات باش يبنيو ليك متجر إلكتروني ولا Dashboard احترافي، بسرعة و أمان عالميين.
                </p>
                <p>
                  ومن جهة أخرى، عندنا <strong className="text-slate-900">Atelier Industriel</strong> حقيقي، فيه معدات دقيقة وخياطين محترفين، كيصاوبو الملابس ديالك — من التصميم التقني (Tech Pack) حتى المنتج النهائي جاهز للبيع.
                </p>
                <p className="text-slate-800 font-bold">
                  هادشي هو اللي كيخلينا مختلفين: ماشي غير كنبيعوك خدمة، كنبنيو معاك المشروع من الصفر — الفكرة، الموقع، المتجر، وحتى المنتج الفيزيائي، تحت سقف واحد.
                </p>
              </div>
            ) : (
              <p className="text-lg md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Beya Creative n'est ni une simple agence digitale, ni une simple usine textile. Nous sommes un écosystème intégré qui relie l'ingénierie logicielle de pointe à la fabrication industrielle réelle — pour transformer une idée en marque complète, de la technologie jusqu'au tissu.
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg transition-all shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2">
                {isAr ? 'ابدا المشروع ديالك' : 'Démarrer mon projet'}
                <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </a>
              <button onClick={() => document.getElementById('web')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-slate-300 transition-all hover:bg-slate-50">
                {isAr ? 'اكتشف الخدمات' : 'Découvrir nos services'}
              </button>
            </div>
          </div>

          {/* Duality strip */}
          <div className="grid md:grid-cols-2 gap-6 mt-20 max-w-4xl mx-auto">
            <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-8 flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Code2 className="w-7 h-7" />
              </div>
              <div dir={isAr ? 'rtl' : 'ltr'}>
                <h3 className="font-black text-slate-900 text-lg mb-1">{isAr ? 'الجانب الرقمي' : 'Le Pôle Digital'}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{isAr ? 'تطبيقات الويب · لوحات تحكم متقدمة · متاجر سريعة' : 'Applications Web · Dashboards Avancés · Boutiques Rapides'}</p>
              </div>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-8 flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Factory className="w-7 h-7" />
              </div>
              <div dir={isAr ? 'rtl' : 'ltr'}>
                <h3 className="font-black text-slate-900 text-lg mb-1">{isAr ? 'الجانب الصناعي' : 'Le Pôle Industriel'}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{isAr ? 'Atelier مجهز · Tech Packs · تصنيع دقيق' : 'Atelier équipé · Tech Packs · Fabrication de précision'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. WEB DEVELOPMENT & SOFTWARE ENGINEERING ============ */}
      <section id="web" className="py-24 lg:py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-300 font-bold text-xs uppercase tracking-widest mb-6">
              <Cpu className="w-4 h-4" /> {isAr ? 'الهندسة البرمجية' : 'Software Engineering'}
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              {isAr ? 'ما كنبنيوش مواقع، كنبنيو أنظمة تخدم.' : 'Nous ne construisons pas des sites, nous construisons des systèmes.'}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              {isAr
                ? 'الفريق التقني ديالنا متخصص فبناء تطبيقات ويب حقيقية (Web Applications)، ماشي قوالب جاهزة معدلة. كل مشروع كيتبنى ب Architecture نظيفة، قابلة للتوسع (Scalable)، ومصممة باش تعيش معاك على المدى الطويل.'
                : 'Notre équipe technique conçoit de vraies applications web, pas des templates modifiés. Chaque projet repose sur une architecture propre, évolutive, et pensée pour durer.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                titleAr: 'تطبيقات ويب مخصصة (Custom Web Apps)',
                titleFr: 'Applications Web Sur-Mesure',
                descAr: 'كنطوروا ليك تطبيقات ديال Web بحسب الحاجيات ديال البزنس ديالك، من صفحة Landing Page بسيطة، حتى Platform معقدة ب Users multiples، Roles، و Permissions.',
                descFr: 'Développement d\'applications web adaptées à vos besoins métier — d\'une landing page simple à une plateforme complexe multi-utilisateurs.',
              },
              {
                icon: Store,
                titleAr: 'إعداد متاجر إلكترونية آلية',
                titleFr: 'Setups E-commerce Automatisés',
                descAr: 'من ربط بوابات الدفع (Payment Gateways) حتى أتمتة الطلبيات و الشحن، كنصاوبو ليك متجر كيخدم وحدو من غير ما تكون واقف عليه ساعة بساعة.',
                descFr: 'De l\'intégration des moyens de paiement à l\'automatisation des commandes et de la livraison, une boutique qui fonctionne sans supervision constante.',
              },
              {
                icon: Rocket,
                titleAr: 'استضافة عالية الأداء',
                titleFr: 'Hébergement Haute Performance',
                descAr: 'الموقع ديالك كيتنشر على سيرفورات متطورة، اللي كتعطيك سرعة تحميل خيالية، Uptime 99.9%، و CDN عالمي — يعني الزبون ديالك، فين ما كان، الموقع غادي يفتح ليه بسرعة البرق.',
                descFr: 'Vos projets sont déployés sur des serveurs avancés : vitesse de chargement exceptionnelle, disponibilité 99.9% et CDN mondial pour une expérience fluide partout.',
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1" dir={isAr ? 'rtl' : 'ltr'}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-black text-lg mb-3 leading-snug">{isAr ? s.titleAr : s.titleFr}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{isAr ? s.descAr : s.descFr}</p>
                </div>
              );
            })}
          </div>


        </div>
      </section>

      {/* ============ 3. BEYASTORE — ZERO RISK ============ */}
      <section id="store" className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div dir={isAr ? 'rtl' : 'ltr'}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-6">
                <ShieldCheck className="w-4 h-4" /> BeyaStore — {isAr ? 'زيرو ريسك' : 'Zéro Risque'}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
                {isAr ? (
                  <>متبقاش خايف تبدا. <br /><span className="text-emerald-600">خلص غير إلا بعت.</span></>
                ) : (
                  <>Ne payez que <br /><span className="text-emerald-600">lorsque vous vendez.</span></>
                )}
              </h2>

              {isAr ? (
                <div className="space-y-5 text-lg text-slate-600 leading-loose">
                  <p>
                    غالبية الشباب المغربي اللي بغا يبدا فالتجارة الإلكترونية كيتوقف قبل ما يبدا، بسبب حاجة وحدة: <strong className="text-slate-900">الخوف المادي (Financial Anxiety)</strong>. تخلص Abonnement شهري، تخلص Design، تخلص Hosting... وأنت مازال ما بعتيش ولا سلعة وحدة!
                  </p>
                  <p>
                    <strong className="text-emerald-700">BeyaStore</strong> جات باش تحل هاد المشكل جذريا بنموذج اسمو <strong>"Zero Risk"</strong>: كنبنيو ليك المتجر الإلكتروني ديالك بكامل المواصفات الاحترافية، وما كنطلبوش منك Abonnement شهري ديال <strong>199 درهم</strong> إلا من بعد ما تحقق أول بيعة حقيقية عندك.
                  </p>
                  <p>
                    بمعنى آخر: <strong className="text-slate-900">ما كتخسرش فلوسك قبل ما تبدا تربح.</strong> هادشي كيبدل الطريقة اللي بيها التاجر المبتدئ كيدخل للسوق — من "مخاطرة مالية" إلى "فرصة بلا ضغط".
                  </p>
                </div>
              ) : (
                <p className="text-lg text-slate-600 leading-relaxed">
                  La majorité des entrepreneurs marocains abandonnent avant même de démarrer, freinés par l'anxiété financière : payer un abonnement, un design, un hébergement — avant d'avoir vendu un seul produit. BeyaStore élimine cette barrière avec le modèle « Zero Risk » : nous construisons votre boutique professionnelle complète, et l'abonnement mensuel de 199 MAD n'est facturé qu'après votre première vente réelle.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="text-3xl font-black text-slate-900 mb-1">199 MAD</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'بعد أول بيعة فقط' : 'Après 1ère vente'}</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="text-3xl font-black text-slate-900 mb-1">0 MAD</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'قبل البيعة' : 'Avant la vente'}</div>
                </div>
              </div>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-10 font-bold text-emerald-700 hover:text-emerald-800 text-lg">
                {isAr ? 'ابدا متجرك بزيرو ريسك' : 'Démarrer ma boutique Zero Risk'}
                <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-50 transform rotate-3 rounded-[3rem] -z-10" />
              <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-8" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{isAr ? 'كيفاش كيخدم النموذج' : 'Comment ça marche'}</h4>
                  </div>
                </div>
                <ul className="space-y-5">
                  {[
                    { ar: 'كنبنيو ليك المتجر ديالك بكامل التصميم والفيتشرز', fr: 'Nous créons votre boutique complète, design et fonctionnalités' },
                    { ar: 'كتبدا تبيع مباشرة، بلا ما تخلص والو', fr: 'Vous commencez à vendre immédiatement, sans rien payer' },
                    { ar: 'بمجرد ما توصل أول Commande مأكدة، كيتفعل Abonnement 199 درهم', fr: 'À votre première commande confirmée, l\'abonnement de 199 MAD s\'active' },
                    { ar: 'من بعد، Abonnement شهري بسيط باش تكمل تطور المتجر', fr: 'Ensuite, un abonnement mensuel simple pour continuer à développer votre boutique' },
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0 text-sm">{i + 1}</div>
                      <p className="text-slate-700 font-medium leading-relaxed">{isAr ? step.ar : step.fr}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4. BEYA SETUP — 800 MAD TURNKEY ============ */}
      <section id="setup" className="py-24 lg:py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 font-bold text-xs uppercase tracking-widest mb-6">
              <Package className="w-4 h-4" /> Beya Setup — 800 MAD
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
              {isAr ? 'باقة كاملة، جاهزة للبيع من أول يوم.' : 'Un pack complet, prêt à vendre dès le premier jour.'}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              {isAr
                ? 'Beya Setup هي الباقة "Turnkey" ديالنا — كتخلص مرة وحدة 800 درهم، وكنسلموك المتجر كامل، مجهز، ومربوط بكل الأدوات اللي خاصك باش تبدا تبيع بجد.'
                : 'Beya Setup est notre pack clé en main : un paiement unique de 800 MAD, et vous recevez une boutique complète, équipée et connectée à tous les outils nécessaires pour vendre sérieusement.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Globe,
                num: '01',
                titleAr: 'تسجيل دومين .com احترافي',
                titleFr: 'Enregistrement du domaine .com',
                descAr: 'كنسجلو ليك اسم الدومين ديال المتجر (Yourbrand.com) باش يكون عندك حضور رقمي احترافي 100%، ماشي رابط ديال Subdomain مجاني كيبين هاوي.',
                descFr: 'Nous enregistrons votre nom de domaine (VotreMarque.com) pour une présence digitale 100% professionnelle, loin des sous-domaines gratuits peu crédibles.',
              },
              {
                icon: Layout,
                num: '02',
                titleAr: 'تصميم UI/UX متجر بريميوم',
                titleFr: 'Design UI/UX Premium',
                descAr: 'المتجر كيتصمم بحسب الهوية ديال الماركة ديالك، بتجربة استخدام (UX) مدروسة باش تزيد نسبة التحويل (Conversion Rate) وتخلي الزبون يشري بلا تردد.',
                descFr: 'La boutique est conçue selon l\'identité de votre marque, avec une expérience utilisateur pensée pour maximiser le taux de conversion.',
              },
              {
                icon: MousePointerClick,
                num: '03',
                titleAr: 'دمج تطبيقات Upsell',
                titleFr: 'Intégration d\'applications Upsell',
                descAr: 'كنركبو ليك أدوات Upsell و Cross-sell ذكية اللي كتقترح على الزبون منتجات إضافية فلحظة الشراء — هادشي وحدو ممكن يزيد فالمبيعات ديالك ب 20 إلى 30%.',
                descFr: 'Des outils Upsell et Cross-sell intelligents proposent des produits complémentaires au moment de l\'achat — souvent +20 à 30% de chiffre d\'affaires.',
              },
              {
                icon: Workflow,
                num: '04',
                titleAr: 'أتمتة طلبيات COD',
                titleFr: 'Automatisation des commandes COD',
                descAr: 'كل Commande "الدفع عند الاستلام" (COD) كتتبعث أوتوماتيكيا لشركة الشحن — بلا ما تدخل يدويا حتى معلومة، وبلا ما تنسى ولا طلبية.',
                descFr: 'Chaque commande en paiement à la livraison (COD) est automatiquement transmise à la société de livraison, sans saisie manuelle et sans oubli.',
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300" dir={isAr ? 'rtl' : 'ltr'}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-4xl font-black text-slate-100">{step.num}</span>
                  </div>
                  <h3 className="font-black text-xl text-slate-900 mb-3">{isAr ? step.titleAr : step.titleFr}</h3>
                  <p className="text-slate-600 leading-relaxed">{isAr ? step.descAr : step.descFr}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl">
              {isAr ? 'احجز Beya Setup ب 800 درهم' : 'Réserver Beya Setup à 800 MAD'}
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </a>
          </div>
        </div>
      </section>

      {/* ============ 5. BEYA PRODUCTION — INDUSTRIAL WORKSHOP ============ */}
      <section id="production" className="py-24 lg:py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] -z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div dir={isAr ? 'rtl' : 'ltr'}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-300 font-bold text-xs uppercase tracking-widest mb-6">
                <Factory className="w-4 h-4" /> Beya Production
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8">
                {isAr ? (
                  <>مصنع حقيقي، <br /><span className="text-emerald-400">ماشي غير Dropshipping.</span></>
                ) : (
                  <>Un vrai atelier, <br /><span className="text-emerald-400">pas du dropshipping.</span></>
                )}
              </h2>

              {isAr ? (
                <div className="space-y-5 text-lg text-slate-300 leading-loose">
                  <p>
                    عندنا <strong className="text-white">Atelier صناعي حقيقي</strong>، مجهز بالمعدات المتخصصة والخياطين ذوي الخبرة، فين كنصنعو المنتجات ديالك بجودة و دقة عاليين — ماشي غير كنستوردو ونعيدو التسمية.
                  </p>
                  <p>
                    كل مشروع كيبدا ب<strong className="text-white">Tech Pack احترافي</strong>: وثيقة تقنية دقيقة فيها المقاسات، الألوان، نوع القماش، طرق الخياطة، وكل التفاصيل اللي خاصها الحرفي باش ينتج المنتج بالضبط بحسب التصميم المطلوب.
                  </p>
                  <p>
                    متخصصين بشكل خاص فتصنيع <strong className="text-white">الأزياء المهنية الدقيقة</strong>: سترات الشيف (Chef Coats)، الزي الموحد (Uniformes) ديال الفنادق والمطاعم والشركات — منتجات كتتطلب دقة فالخياطة وجودة فالقماش ما كتسامحش فيها.
                  </p>
                </div>
              ) : (
                <p className="text-lg text-slate-300 leading-relaxed">
                  Nous disposons d'un véritable atelier industriel, équipé de machines spécialisées et de couturiers expérimentés. Chaque projet démarre par un Tech Pack professionnel détaillant mesures, coloris, matières et techniques d'assemblage. Nous sommes spécialisés dans la confection de précision : vestes de chef, uniformes hôteliers et corporate — des produits qui n'admettent aucune approximation.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: Ruler, ar: 'أتيلي صناعي مجهز', fr: 'Atelier industriel équipé' },
                { icon: ClipboardCheck, ar: 'Tech Pack احترافي', fr: 'Tech Pack professionnel' },
                { icon: Shirt, ar: 'سترات الشيف والزي الموحد', fr: 'Chef coats & Uniformes' },
                { icon: BadgeCheck, ar: 'مواصفات جودة صارمة', fr: 'Standards qualité stricts' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-white/10 transition-colors">
                    <Icon className="w-8 h-8 text-emerald-400" />
                    <span className="font-bold text-sm">{isAr ? item.ar : item.fr}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality standards */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12" dir={isAr ? 'rtl' : 'ltr'}>
            <h3 className="text-2xl md:text-3xl font-black mb-8 text-center">{isAr ? 'المعايير ديالنا فالجودة' : 'Nos standards de qualité'}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Package,
                  titleAr: 'اختيار القماش',
                  titleFr: 'Sélection des matières',
                  descAr: 'كنختاروا غير الأقمشة اللي عندها مقاومة عالية للغسيل المتكرر والاستعمال اليومي، خاصة للأزياء المهنية.',
                  descFr: 'Nous sélectionnons uniquement des tissus résistants aux lavages répétés et à l\'usage quotidien intensif.',
                },
                {
                  icon: Timer,
                  titleAr: 'الدقة فالمقاسات',
                  titleFr: 'Précision des mesures',
                  descAr: 'كل قطعة كتتفصل بحسب المقاسات المضبوطة فالTech Pack، بلا هامش خطأ، باش يكون المنتج مطابق 100% للتصميم.',
                  descFr: 'Chaque pièce est coupée selon les mesures exactes du Tech Pack, sans marge d\'erreur, pour une conformité totale au design.',
                },
                {
                  icon: CheckCircle2,
                  titleAr: 'مراقبة الجودة',
                  titleFr: 'Contrôle qualité',
                  descAr: 'كل قطعة كتفحص قبل التسليم: الخياطة، اللمسة النهائية، والمطابقة الكاملة مع المواصفات المتفق عليها.',
                  descFr: 'Chaque pièce est inspectée avant livraison : couture, finitions, et conformité totale au cahier des charges.',
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i}>
                    <Icon className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="font-black text-lg mb-2">{isAr ? s.titleAr : s.titleFr}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{isAr ? s.descAr : s.descFr}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10" dir={isAr ? 'rtl' : 'ltr'}>
          <Building2 className="w-14 h-14 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            {isAr ? 'من الفكرة، للكود، للقماش — حنا معاك.' : 'De l\'idée au code, jusqu\'au tissu — nous sommes avec vous.'}
          </h2>
          <p className="text-xl text-blue-100 mb-12 font-medium max-w-2xl mx-auto">
            {isAr
              ? 'واحد الفريق، بزوج التخصصات: ديجيتال و صناعي. باش ما تكونش محتاج تخدم مع 3 ولا 4 مزودين مختلفين.'
              : 'Une seule équipe, deux expertises complémentaires : digital et industriel. Fini les multiples prestataires à coordonner.'}
          </p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all hover:scale-105 shadow-2xl">
            <Phone className="w-6 h-6" />
            {isAr ? 'تكلم مع خبير الآن' : 'Parler à un expert maintenant'}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-slate-100 text-center text-slate-500 text-sm font-medium">
        <p>© {new Date().getFullYear()} BEYA CREATIVE. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
      </footer>
    </div>
  );
}
