import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle2, XCircle, MapPin, Clock, DollarSign, Package, HelpCircle, Phone, Mail, MessageCircle, Globe, Sparkles } from 'lucide-react';
import { CompanyProfile, FaqItem, ServiceItem, loadCompanyProfile } from '../types';

const DEFAULT_FAQ: FaqItem[] = [
  { id: '1', emoji: '💰', category: 'prix', questionFr: 'Quels sont vos tarifs ?', questionAr: 'ما هي أسعاركم؟', answerFr: 'Nos prix varient selon la quantité, le modèle et les matières. Plus la quantité est grande, plus le prix unitaire baisse. Contactez-nous pour un devis personnalisé.', answerAr: 'أسعارنا تتفاوت حسب الكمية، النموذج والأقمشة. كلما زادت الكمية، انخفض السعر الفردي. تواصلوا معنا للحصول على عرض سعر مخصص.' },
  { id: '2', emoji: '📦', category: 'prix', questionFr: 'Quel est le minimum de commande (MOQ) ?', questionAr: 'ما هو الحد الأدنى للطلب؟', answerFr: 'Notre minimum est généralement 50 pièces par modèle/coloris. Pour les échantillons, on peut descendre à 1 pièce.', answerAr: 'الحد الأدنى عادةً 50 قطعة لكل نموذج/لون. للعينات يمكن طلب قطعة واحدة.' },
  { id: '3', emoji: '⏱️', category: 'delai', questionFr: 'Quel est le délai de production ?', questionAr: 'ما هو وقت الإنتاج؟', answerFr: 'En général 15 à 30 jours ouvrables selon la complexité et la quantité. Les échantillons sont livrés en 5-7 jours.', answerAr: 'عادةً من 15 إلى 30 يوم عمل حسب التعقيد والكمية. العينات تُسلَّم خلال 5-7 أيام.' },
  { id: '4', emoji: '📍', category: 'contact', questionFr: 'Où êtes-vous situés ?', questionAr: 'أين تقعون؟', answerFr: '__ADDRESS_FR__', answerAr: '__ADDRESS_AR__' },
  { id: '5', emoji: '🎨', category: 'services', questionFr: 'Pouvez-vous mettre notre logo ?', questionAr: 'هل يمكنكم وضع شعارنا؟', answerFr: 'Oui ! Broderie, sérigraphie, impression DTF ou étiquettes tissées. Envoyez-nous votre logo en haute définition.', answerAr: 'نعم! تطريز، حرير، طباعة DTF أو ملصقات منسوجة. أرسلوا لنا شعاركم بجودة عالية.' },
  { id: '6', emoji: '🧵', category: 'services', questionFr: 'On peut apporter notre propre tissu ?', questionAr: 'هل يمكن توفير القماش من طرفنا؟', answerFr: 'Bien sûr ! Vous pouvez apporter votre tissu ou on peut le sourcer pour vous au meilleur prix.', answerAr: 'بالطبع! يمكنكم إحضار قماشكم أو نحن نوفره لكم بأفضل سعر.' },
  { id: '7', emoji: '👗', category: 'services', questionFr: 'Faites-vous des échantillons avant production ?', questionAr: 'هل تصنعون عينة قبل الإنتاج؟', answerFr: 'Oui, on recommande toujours une étape échantillon pour valider les mesures, les matières et la qualité avant de lancer la production en série.', answerAr: 'نعم، دائماً ننصح بمرحلة العينة للتحقق من القياسات والأقمشة والجودة قبل الإنتاج الكامل.' },
  { id: '8', emoji: '💳', category: 'prix', questionFr: 'Quelles sont les modalités de paiement ?', questionAr: 'ما هي شروط الدفع؟', answerFr: 'On demande généralement 50% d\'avance à la commande et 50% à la livraison. Paiement par virement bancaire ou chèque.', answerAr: 'عادةً 50% مقدمًا عند الطلب و50% عند التسليم. الدفع عبر تحويل بنكي أو شيك.' },
  { id: '9', emoji: '✅', category: 'qualite', questionFr: 'Comment garantissez-vous la qualité ?', questionAr: 'كيف تضمنون الجودة؟', answerFr: 'Chaque commande passe par : patronage → coupe → montage → finition → contrôle qualité → emballage. Le client valide l\'échantillon avant production.', answerAr: 'كل طلب يمر بـ: باترون → فصالة → خياطة → فينيسيون → مراقبة جودة → تغليف. الزبون يوافق على العينة قبل الإنتاج.' },
  { id: '10', emoji: '🚚', category: 'delai', questionFr: 'Livrez-vous à domicile ?', questionAr: 'هل توصلون للمنزل؟', answerFr: 'Oui, on livre partout au Maroc via transporteur. La livraison internationale est également possible.', answerAr: 'نعم، نوصل في كل أنحاء المغرب عبر شركات النقل. التوصيل الدولي متاح أيضاً.' },
];

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 's1', labelFr: 'Confection sur mesure', labelAr: 'تفصيل حسب الطلب', available: true },
  { id: 's2', labelFr: 'Broderie & Logo', labelAr: 'تطريز وشعار', available: true },
  { id: 's3', labelFr: 'Sérigraphie / DTF', labelAr: 'طباعة حرير / DTF', available: true },
  { id: 's4', labelFr: 'Étiquettes tissées', labelAr: 'ملصقات منسوجة', available: true },
  { id: 's5', labelFr: 'Sourcing tissu', labelAr: 'توفير الأقمشة', available: true },
  { id: 's6', labelFr: 'Emballage personnalisé', labelAr: 'تغليف مخصص', available: true },
  { id: 's7', labelFr: 'Livraison nationale', labelAr: 'توصيل وطني', available: true },
  { id: 's8', labelFr: 'Livraison internationale', labelAr: 'توصيل دولي', available: true },
  { id: 's9', labelFr: 'Vente au détail', labelAr: 'بيع بالتجزئة', available: false },
  { id: 's10', labelFr: 'Réparation / Retouche', labelAr: 'إصلاح / ترميم', available: false },
  { id: 's11', labelFr: 'Location de vêtements', labelAr: 'كراء الملابس', available: false },
];

const CATEGORIES = [
  { key: 'all', labelFr: 'Tout', labelAr: 'الكل', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { key: 'prix', labelFr: 'Prix & MOQ', labelAr: 'الأسعار', icon: <DollarSign className="w-3.5 h-3.5" /> },
  { key: 'delai', labelFr: 'Délais', labelAr: 'المواعيد', icon: <Clock className="w-3.5 h-3.5" /> },
  { key: 'services', labelFr: 'Services', labelAr: 'الخدمات', icon: <Package className="w-3.5 h-3.5" /> },
  { key: 'qualite', labelFr: 'Qualité', labelAr: 'الجودة', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { key: 'contact', labelFr: 'Contact', labelAr: 'التواصل', icon: <MapPin className="w-3.5 h-3.5" /> },
];

interface ClientInfoProps {
  company?: CompanyProfile;
  standalone?: boolean;
}

export default function ClientInfo({ company: companyProp, standalone = false }: ClientInfoProps) {
  const company = companyProp || loadCompanyProfile();
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const isAr = lang === 'ar';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const addr = company.address || '';
  const faq = (company.faq?.length ? company.faq : DEFAULT_FAQ).map(item => ({
    ...item,
    answerFr: item.answerFr.replace('__ADDRESS_FR__', addr ? `Nous sommes situés au : ${addr}. On peut livrer partout au Maroc et à l'international.` : 'Contactez-nous pour plus d\'informations sur notre localisation.'),
    answerAr: item.answerAr.replace('__ADDRESS_AR__', addr ? `نحن موجودون في: ${addr}. نوصل في كل أنحاء المغرب وخارجه.` : 'تواصلوا معنا للمزيد من المعلومات حول موقعنا.'),
  }));
  const services = company.services?.length ? company.services : DEFAULT_SERVICES;

  const filtered = useMemo(() => {
    return faq.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || (isAr
        ? item.questionAr.toLowerCase().includes(q) || item.answerAr.toLowerCase().includes(q)
        : item.questionFr.toLowerCase().includes(q) || item.answerFr.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [faq, activeCategory, search, isAr]);

  const available = services.filter(s => s.available);
  const notAvailable = services.filter(s => !s.available);

  return (
    <div className={`${standalone ? 'min-h-screen' : ''} relative overflow-hidden`} dir={isAr ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Language toggle */}
          <div className={`absolute top-0 ${isAr ? 'left-0' : 'right-0'} flex items-center gap-1 bg-white/10 border border-white/20 rounded-full p-1 backdrop-blur-sm`}>
            <button
              onClick={() => setLang('fr')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${lang === 'fr' ? 'bg-white text-indigo-700' : 'text-white/60 hover:text-white'}`}
            >FR</button>
            <button
              onClick={() => setLang('ar')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${lang === 'ar' ? 'bg-white text-indigo-700' : 'text-white/60 hover:text-white'}`}
            >AR</button>
          </div>

          {(company.logoClient || company.logoLanding || company.logoUrl) && (
            <img src={company.logoClient || company.logoLanding || company.logoUrl} alt={company.name} className="h-16 mx-auto mb-5 object-contain drop-shadow-xl" />
          )}
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            {isAr ? 'مركز المعلومات' : 'Centre d\'Info'}
          </h1>
          <p className="text-sm text-white/60 font-medium">
            {isAr ? 'جميع أسئلتكم، بإجابات واضحة' : 'Toutes vos questions, répondues clairement'}
          </p>
        </div>

        {/* Quick contact chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {company.phone && (
            <a href={`https://wa.me/${company.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-black shadow hover:bg-emerald-600 transition-all">
              <MessageCircle className="w-3.5 h-3.5" />WhatsApp
            </a>
          )}
          {company.phone && (
            <a href={`tel:${company.phone}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-xs font-black backdrop-blur-sm hover:bg-white/20 transition-all">
              <Phone className="w-3.5 h-3.5" />{company.phone}
            </a>
          )}
          {company.email && (
            <a href={`mailto:${company.email}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-xs font-black backdrop-blur-sm hover:bg-white/20 transition-all">
              <Mail className="w-3.5 h-3.5" />{company.email}
            </a>
          )}
          {company.address && (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-white/10 border border-white/20 text-white/80 rounded-full text-xs font-bold backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-rose-300" />{company.address}
            </span>
          )}
        </div>

        {/* Services oui / non */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 mb-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500" />
            {isAr ? 'خدماتنا' : 'Nos Services'}
          </h2>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />{isAr ? 'ما نقدمه' : 'Ce qu\'on fait'}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {available.map(s => (
              <span key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                {isAr ? s.labelAr : s.labelFr}
              </span>
            ))}
          </div>
          {notAvailable.length > 0 && (
            <>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 mt-3">
                <XCircle className="w-3.5 h-3.5" />{isAr ? 'ما لا نقدمه' : 'Ce qu\'on ne fait pas'}
              </p>
              <div className="flex flex-wrap gap-2">
                {notAvailable.map(s => (
                  <span key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-400 rounded-full text-[11px] font-bold line-through opacity-70">
                    <XCircle className="w-3 h-3" />
                    {isAr ? s.labelAr : s.labelFr}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              {isAr ? 'الأسئلة الشائعة' : 'Questions Fréquentes'}
            </h2>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث عن سؤال...' : 'Rechercher une question...'}
                className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-indigo-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
              )}
            </div>
            {/* Category chips */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all ${
                    activeCategory === c.key
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {c.icon}
                  {isAr ? c.labelAr : c.labelFr}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                {isAr ? 'لا توجد نتائج' : 'Aucun résultat'}
              </div>
            ) : filtered.map(item => (
              <div key={item.id}>
                <button
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  className="w-full px-6 py-5 flex items-center gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <span className={`flex-1 text-sm font-bold text-slate-800 ${isAr ? 'text-right' : 'text-left'}`}>
                    {isAr ? item.questionAr : item.questionFr}
                  </span>
                  {openFaq === item.id
                    ? <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  }
                </button>
                {openFaq === item.id && (
                  <div className={`px-6 pb-5 ${isAr ? 'pr-16' : 'pl-16'}`}>
                    <div className="bg-indigo-50/60 rounded-2xl px-5 py-4 border border-indigo-100/50">
                      <p className={`text-sm text-slate-700 leading-relaxed font-medium ${isAr ? 'text-right' : 'text-left'}`}>
                        {isAr ? item.answerAr : item.answerFr}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2rem] p-6 text-white text-center shadow-xl shadow-indigo-200/50">
          <p className="text-lg font-black mb-1">{isAr ? 'لديك سؤال آخر؟' : 'Une autre question ?'}</p>
          <p className="text-indigo-200 text-sm mb-5 font-medium">
            {isAr ? 'فريقنا متاح للإجابة' : 'Notre équipe est disponible pour vous répondre'}
          </p>
          {company.phone && (
            <a
              href={`https://wa.me/${company.phone.replace(/\D/g,'')}?text=${encodeURIComponent(isAr ? 'السلام عليكم، عندي سؤال...' : 'Bonjour, j\'ai une question...')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-2xl text-sm font-black hover:bg-indigo-50 transition-all shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              {isAr ? 'تواصل عبر واتساب' : 'WhatsApp'}
            </a>
          )}
        </div>

        <p className="text-center text-[10px] text-white/30 mt-6 font-medium">
          {company.name} · {isAr ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
        </p>
      </div>
    </div>
  );
}
