import React from 'react';
import { ArrowRight, Code, Megaphone, PackageSearch, CheckCircle2, DollarSign, Factory } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';

export default function Partners() {
  const { isAr, toggle } = useLang();

  return (
    <div className={`min-h-screen bg-slate-50 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform rotate-12">
              <span className="text-white font-black text-xl -rotate-12">B</span>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">BEYACREATIVE</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase">
              {isAr ? 'FR' : 'AR'}
            </button>
            <Link to="/partner-signup" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
              {isAr ? 'انضم إلينا' : 'Rejoignez-nous'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-br from-indigo-50 via-white to-amber-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-700 rounded-2xl mb-6">
            <DollarSign className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {isAr ? 'برنامج شركاء BEYA' : 'Programme Partenaires BEYA'}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            {isAr
              ? 'نظام بيئي متكامل يجمع بين المطورين، المسوقين، والموردين. انضم إلى أقوى شبكة تجارة إلكترونية وحقق أرباحاً مستدامة.'
              : 'Un écosystème complet réunissant développeurs, marketeurs et fournisseurs. Rejoignez notre réseau et générez des revenus récurrents.'}
          </p>
          <Link to="/partner-directory" className="inline-block mt-6 text-sm font-bold text-indigo-600 hover:underline">
            {isAr ? 'شاهد دليل الموردين والورشات ←' : 'Voir l\'annuaire des fournisseurs & ateliers →'}
          </Link>
        </div>
      </main>

      {/* 3 Pillars Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Developers / Agencies */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/20 hover:-translate-y-2 transition-all">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Code className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">
              {isAr ? 'برنامج الوكالات والمطورين' : 'Pour Agences & Développeurs'}
            </h3>
            <p className="text-slate-600 mb-8 h-24">
              {isAr 
                ? 'قم بإنشاء متاجر احترافية لعملائك باستخدام منصتنا. تحكم كامل، علامة بيضاء، وعمولة شهرية مستمرة.'
                : 'Créez des boutiques pro pour vos clients. Marque blanche, contrôle total et revenus récurrents.'}
            </p>
            <ul className="space-y-3 mb-8">
              {[
                isAr ? 'متاجر غير محدودة لعملائك' : 'Boutiques illimitées',
                isAr ? 'العلامة البيضاء (White-label)' : 'Marque blanche (White-label)',
                isAr ? 'دخل شهري متكرر (MRR)' : 'Revenus récurrents (MRR)',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/partner-signup" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors">
              {isAr ? 'انضم كوكالة' : 'Devenir Agence'} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* Marketers / Influencers */}
          <div className="bg-gradient-to-b from-indigo-600 to-indigo-900 rounded-3xl p-8 border border-indigo-500 shadow-2xl shadow-indigo-500/30 hover:-translate-y-2 transition-all text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
            <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 relative z-10">
              {isAr ? 'برنامج المسوقين والمؤثرين' : 'Pour Marketeurs & Influenceurs'}
            </h3>
            <p className="text-indigo-100 mb-8 h-24 relative z-10">
              {isAr 
                ? 'سوق لمنتجات متاجر BEYA أو اجلب تجاراً جدداً للمنصة واربح عمولات ضخمة على المبيعات والاشتراكات.'
                : 'Promouvez les produits de nos marchands ou parrainez de nouveaux vendeurs pour gagner de grosses commissions.'}
            </p>
            <ul className="space-y-3 mb-8 relative z-10">
              {[
                isAr ? 'عمولة تصل إلى 30% على المبيعات' : 'Jusqu\'à 30% de commission',
                isAr ? 'منتجات حصرية وعالية الجودة' : 'Produits exclusifs & haute qualité',
                isAr ? 'لوحة تحكم لتتبع أرباحك لحظة بلحظة' : 'Dashboard de suivi en temps réel',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-indigo-50 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/partner-signup" className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors relative z-10">
              {isAr ? 'انضم كمسوق' : 'Devenir Marketeur'} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* Suppliers / Wholesalers */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/20 hover:-translate-y-2 transition-all">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <PackageSearch className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">
              {isAr ? 'برنامج الموردين والجملة' : 'Pour Fournisseurs & Grossistes'}
            </h3>
            <p className="text-slate-600 mb-8 h-24">
              {isAr 
                ? 'هل أنت مستورد أو مصنع للأثواب والمواد الخام؟ اربط اتصالك مباشرة بـ +500 متجر ومصنع داخل منصتنا.'
                : 'Vous fournissez de la matière première ou des tissus ? Connectez-vous directement avec +500 marchands et ateliers.'}
            </p>
            <ul className="space-y-3 mb-8">
              {[
                isAr ? 'سوق ضخم (B2B)' : 'Immense marché B2B',
                isAr ? 'بيع بالجملة مضمون' : 'Vente en gros garantie',
                isAr ? 'شراكات استراتيجية طويلة المدى' : 'Partenariats stratégiques durables',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/partner-signup" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-colors">
              {isAr ? 'انضم كمورد' : 'Devenir Fournisseur'} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* Factories / Ateliers */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700 shadow-xl shadow-slate-900/20 hover:-translate-y-2 transition-all">
            <div className="w-14 h-14 bg-slate-800 text-amber-400 rounded-2xl flex items-center justify-center mb-6">
              <Factory className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">
              {isAr ? 'برنامج المعامل وورشات الخياطة' : 'Pour Ateliers & Usines'}
            </h3>
            <p className="text-slate-400 mb-8 h-24">
              {isAr 
                ? 'هل لديك معمل أو ورشة خياطة؟ قدم خدمات التفصيل والتصنيع بالجملة لمئات المتاجر الإلكترونية النشطة في منصتنا.'
                : 'Vous avez un atelier de confection ? Proposez vos services de production en gros à des centaines de boutiques actives.'}
            </p>
            <ul className="space-y-3 mb-8">
              {[
                isAr ? 'طلبات تصنيع مستمرة (B2B)' : 'Commandes B2B continues',
                isAr ? 'التعامل المباشر مع أصحاب الماركات' : 'Contact direct avec les marques',
                isAr ? 'ضمان الدفع عبر المنصة' : 'Paiement garanti via la plateforme',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/partner-signup" className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-bold transition-colors">
              {isAr ? 'انضم كمعمل' : 'Devenir Atelier Partenaire'} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 text-center text-slate-400 text-sm mt-16 border-t border-slate-100">
        <p>© 2026 BEYACREATIVE Ecosystem. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
      </footer>
    </div>
  );
}
