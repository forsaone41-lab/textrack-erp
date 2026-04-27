import { Play, ShieldCheck, Zap, Users, ArrowRight, MessageCircle, Star, Package, Factory, Globe, Shirt, Scissors, CheckCircle, ImageIcon, X } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loadCompanyProfile, saveLead } from '../types';

export default function LandingPage() {
  const { isAr, toggle } = useLang();
  const [company] = useState(loadCompanyProfile());
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(isAr ? 'حجم الصورة كبير جداً (الأقصى 5MB)' : 'Photo trop grande (Max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const services = [
    {
      title: isAr ? 'الفصالة العصرية' : 'Coupe de Précision',
      desc: isAr ? 'أحدث التقنيات لضمان دقة متناهية في كل قطعة.' : 'Utilisation des dernières technologies pour une précision millimétrée.',
      icon: Factory,
      color: 'from-orange-500 to-rose-500'
    },
    {
      title: isAr ? 'خياطة احترافية' : 'Montage & Couture',
      desc: isAr ? 'فريق من الخبراء يضمنون جودة الخياطة والمتانة.' : 'Une équipe d\'experts garantissant la solidité et la finesse des finitions.',
      icon: Users,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: isAr ? 'مراقبة الجودة' : 'Contrôle Qualité',
      desc: isAr ? 'كل قطعة تخضع لفحص دقيق قبل التسليم.' : 'Chaque pièce subit une inspection rigoureuse avant expédition.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  // Helper to format video URL (Instagram or direct)
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('instagram.com')) {
      // Clean the URL and add /embed
      const cleanUrl = url.split('?')[0].replace(/\/$/, '');
      return `${cleanUrl}/embed`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(company.landingVideoUrl);

  const [showSuccess, setShowSuccess] = useState(false);

  // Dynamic SEO Title & Description
  useEffect(() => {
    const title = isAr 
      ? `BEYA CREATIVE - رائد صناعة الملابس بالمغرب 🇲🇦` 
      : `BEYA CREATIVE - Excellence en Confection Textile au Maroc 🇲🇦`;
    const desc = isAr
      ? 'نحن نوفر حلولاً متكاملة لصناعة الملابس بالمغرب. تيشيرت، قميص، جلابة، وملابس العمل بجودة عالمية.'
      : 'BEYA CREATIVE : Leader de la confection textile au Maroc. Fabrication de vêtements haute qualité et production 100% marocaine.';
    
    document.title = title;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
  }, [isAr]);

  return (
    <div className={`min-h-screen bg-white relative overflow-hidden ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              {isAr ? 'تم إرسال طلبكم!' : 'Demande Envoyée !'}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">
              {isAr 
                ? 'شكراً ليكم على اختيار BEYA. الفريق ديالنا غادي يراجع الطلب وغادي يتواصل معاكم فـ أقل من 24 ساعة.'
                : 'Merci d\'avoir choisi BEYA. Notre équipe examine votre demande et vous contactera en moins de 24 heures.'}
            </p>
            
            <div className="space-y-4">
              <a 
                href="https://wa.me/212600000000" 
                target="_blank"
                className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"
              >
                <MessageCircle className="w-5 h-5" />
                {isAr ? 'تواصل معنا الآن' : 'Contactez-nous via WhatsApp'}
              </a>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition-colors"
              >
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Clothing Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] overflow-hidden">
        <div className="absolute inset-0 flex flex-wrap gap-24 p-20 justify-around">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`transform rotate-${(i % 4) * 15}`}>
              {i % 2 === 0 ? <Shirt className="w-20 h-20" /> : <Scissors className="w-20 h-20" />}
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logoUrl && company.logoUrl !== '/logo.png' ? (
              <img src={company.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-xl" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Package className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                {company.name.split(' ')[0]}<span className="text-indigo-600">{company.name.split(' ').slice(1).join(' ')}</span>
              </span>
              <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">🇲🇦 Made in Morocco</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={toggle} className="text-xs font-black text-slate-500 hover:text-indigo-600 transition uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {isAr ? 'Français' : 'العربية'}
            </button>
            <Link to="/login" className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
              {isAr ? 'دخول' : 'Connexion'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-bounce">
            <Zap className="w-3 h-3" />
            {isAr ? 'رائد في صناعة الملابس بالمغرب 🇲🇦' : 'Leader de la Confection au Maroc 🇲🇦'}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
            {isAr ? 'نصنع الجودة،' : 'Nous créons la qualité,'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500">
              {isAr ? 'نصمم المستقبل.' : 'Nous façonnons l\'avenir.'}
            </span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            {isAr
              ? 'شريكك الاستراتيجي في إنتاج الملابس الجاهزة. جودة عالمية، دقة في المواعيد، وخبرة مغربية أصيلة.'
              : 'Votre partenaire stratégique en production de prêt-à-porter. Qualité internationale, respect des délais et expertise marocaine authentique.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-105 transition-all flex items-center justify-center gap-3">
              {isAr ? 'ابدأ مشروعك معنا' : 'Démarrer votre projet'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="https://wa.me/212600000000" target="_blank" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              {isAr ? 'تواصل معنا' : 'Contactez-nous'}
            </a>
          </div>
        </div>
      </section>

      {/* Video Presentation Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="relative group">
            {/* Background Decoration */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />

            {/* Video Container */}
            <div className="relative aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] border-8 border-white">
              {embedUrl ? (
                <iframe 
                  src={embedUrl} 
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070')] bg-cover bg-center opacity-60 mix-blend-overlay" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-slate-900/80 via-transparent to-transparent">
                    <button className="w-24 h-24 bg-white/20 backdrop-blur-2xl text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all group/play ring-8 ring-white/10 mb-8">
                      <Play className="w-10 h-10 fill-white" />
                    </button>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                      {isAr ? 'شاهد لماذا نحن الأفضل' : 'Découvrez notre savoir-faire'}
                    </h2>
                    <p className="text-white/70 font-bold max-w-xl uppercase tracking-widest text-xs">
                      {isAr ? 'جولة حصرية داخل مصنعنا: من الفكرة إلى القطعة النهائية' : 'Visite exclusive de notre atelier : de l\'idée à la pièce finale'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Lead Generation Form Section */}
          <div className="mt-20 bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-16 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-6 relative z-10">
                  {isAr ? 'ابدأ مشروعك اليوم' : 'Lancez votre collection'}
                </h3>
                <p className="text-slate-400 font-medium mb-12 relative z-10 leading-relaxed">
                  {isAr 
                    ? 'عمر هاد المعلومات وغادي نتواصلو معاك فـ أقل من 24 ساعة باش نعطيوك أحسن عرض ثمن.'
                    : 'Remplissez ce formulaire et notre équipe vous contactera en moins de 24h pour discuter de votre projet et vous proposer le meilleur tarif.'}
                </p>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Réponse Rapide</p>
                      <p className="text-sm font-bold">Moins de 24 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Qualité Garantie</p>
                      <p className="text-sm font-bold">Standards Internationaux</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 lg:p-16">
                <form 
                  className="space-y-6" 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    const formData = new FormData(e.currentTarget);
                    const countryCode = (e.currentTarget.querySelector('select') as HTMLSelectElement).value;
                    const rawPhone = formData.get('phone') as string;
                    const fullPhone = countryCode + rawPhone.replace(/\s/g, '');
                    
                    const leadData = {
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      phone: fullPhone,
                      type: formData.get('type') as string,
                      quantity: Number(formData.get('quantity')),
                      details: formData.get('details') as string,
                      photo: selectedPhoto || undefined
                    };
                    saveLead(leadData);
                    setShowSuccess(true);
                    setSelectedPhoto(null);
                    (e.currentTarget as HTMLFormElement).reset();
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الإسم الكامل' : 'Nom Complet'}</label>
                      <input type="text" name="name" placeholder="Ex: Ahmed Alami" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                      <input type="email" name="email" placeholder="email@example.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم الهاتف' : 'Téléphone / WhatsApp'}</label>
                      <div className="flex gap-2">
                        <div className="relative">
                          <select className="appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-4 pr-10 text-sm font-bold outline-none focus:border-indigo-600 transition-colors h-full">
                            <option value="+212">🇲🇦 +212</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+1">🇺🇸 +1</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <Star className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>
                        <input type="tel" name="phone" placeholder="6XXXXXXXX" className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس' : 'Type de Vêtement'}</label>
                      <select name="type" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors appearance-none">
                        <option>T-Shirt / Polo</option>
                        <option>T-Shirt Oversize</option>
                        <option>Sweat / Hoodie</option>
                        <option>Djellaba / Gandoura</option>
                        <option>Ensemble / Survêtement</option>
                        <option>Pyjama</option>
                        <option>Uniforme / Travail</option>
                        <option>Pantalon</option>
                        <option>{isAr ? 'آخر' : 'Autre'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الكمية التقديرية' : 'Quantité Estimeé'}</label>
                      <input type="number" name="quantity" placeholder="Min 100" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                    </div>
                    <div />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'تفاصيل إضافية' : 'Détails du Projet'}</label>
                      <textarea name="details" rows={4} placeholder={isAr ? 'اشرح لينا شنو باغي تصاوب...' : 'Décrivez votre projet...'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors resize-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'صورة الموديل (اختياري)' : 'Photo du Modèle (Optionnel)'}</label>
                      <div className="relative group h-[120px]">
                        {selectedPhoto ? (
                          <div className="relative h-full w-full rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-md">
                            <img src={selectedPhoto} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setSelectedPhoto(null)}
                              className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-full w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all group">
                            <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">{isAr ? 'إضافة صورة' : 'Ajouter une Photo'}</span>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    {isAr ? 'إرسال الطلب' : 'Envoyer ma demande'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 ${isAr ? 'md:flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : 'text-left'}>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
                {isAr ? 'خدماتنا الاحترافية' : 'Nos Services Experts'}
              </h2>
              <div className={`h-2 w-48 bg-indigo-600 rounded-full ${isAr ? 'mr-0 ml-auto' : ''}`} />
            </div>
            <p className={`text-slate-500 font-bold max-w-md ${isAr ? 'text-right' : 'text-left'}`}>
              {isAr 
                ? 'نحن نوفر حلولاً متكاملة لصناعة الملابس تبدأ من اختيار المواد الأولية وتصميم النماذج وصولاً إلى الإنتاج الضخم.'
                : 'Nous offrons des solutions complètes de fabrication textile, du choix des matières premières à la production de masse.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="group p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
                <div className={`w-16 h-16 rounded-[2rem] bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-8 shadow-lg transform group-hover:rotate-12 transition-transform`}>
                  <s.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{s.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className={isAr ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                {company.logoUrl && company.logoUrl !== '/logo.png' ? (
                  <img src={company.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-xl" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                )}
                <span className="text-2xl font-black uppercase tracking-tighter italic">
                   {company.name.split(' ')[0]}<span className="text-indigo-400">{company.name.split(' ').slice(1).join(' ')}</span>
                </span>
              </div>
              <p className="text-slate-400 max-w-sm font-medium">
                {isAr 
                  ? 'رؤيتنا هي أن نصبح المعيار العالمي للجودة في صناعة الملابس المغربية.'
                  : 'Notre vision هو d\'être la référence mondiale de qualité dans l\'industrie textile marocaine.'}
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{isAr ? 'تابعونا على' : 'Suivez-nous'}</p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/beyacreative/" target="_blank" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                  Instagram
                </a>
                <a href="https://ma.linkedin.com/in/beya-creative-265a9a322" target="_blank" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            &copy; 2024 BEYA CREATIVE PORTAL. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
