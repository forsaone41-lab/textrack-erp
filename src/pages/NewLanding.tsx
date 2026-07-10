import React, { useState, useEffect } from 'react';
import { Building2, User, Sparkles, ShoppingCart, Rocket, ChevronRight, CheckCircle2, ArrowRight, X, Phone, Mail, Instagram, ImageIcon, MousePointerClick, MessageSquareText, PhoneCall, Sun, Moon } from 'lucide-react';
import { saveRecord } from '../types';
import { useLang } from '../contexts/LangContext';

export default function NewLanding() {
  const { isAr, toggle } = useLang();
  const [isDark, setIsDark] = useState(() => {
    const hour = new Date().getHours();
    // Dark mode from 19:00 to 06:59
    return hour >= 19 || hour < 7;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientType: '',
    companyName: '',
    companySector: '',
    budget: '',
    intent: '',
    deadline: '',
    photo: '',
    phone: '',
    email: '',
    name: '',
    details: ''
  });

  const [newClientCode, setNewClientCode] = useState<{name: string, code: string, email: string} | null>(null);

  const sectors = [
    { id: 'restaurant', labelFr: 'Restaurant / Café', labelAr: 'مطعم / مقهى' },
    { id: 'hotel', labelFr: "Hôtel / Maison d'hôtes", labelAr: 'فندق / رياض' },
    { id: 'hopital', labelFr: 'Hôpital / Clinique', labelAr: 'مستشفى / مصحة' },
    { id: 'ecole', labelFr: 'École / Institution', labelAr: 'مدرسة / مؤسسة تعليمية' },
    { id: 'usine', labelFr: 'Usine / Industrie', labelAr: 'مصنع / صناعة' },
    { id: 'cabinet', labelFr: 'Cabinet (Médical, Dentaire...)', labelAr: 'عيادة (طبية، أسنان...)' },
    { id: 'agence', labelFr: 'Agence (Sécurité, Nettoyage...)', labelAr: 'وكالة (أمن، نظافة...)' },
    { id: 'autre', labelFr: 'Autre secteur...', labelAr: 'قطاع آخر...' },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const clientTypes = [
    { id: 'entreprise', labelFr: 'Entreprise / Société', labelAr: 'شركة / مؤسسة', icon: Building2, descFr: 'Vous avez déjà une entreprise établie', descAr: 'لديك بالفعل شركة أو مؤسسة قائمة' },
    { id: 'marque', labelFr: 'Marque de vêtements', labelAr: 'علامة تجارية للأزياء', icon: ShoppingCart, descFr: 'Vous gérez une marque existante', descAr: 'أنت تدير علامة تجارية حالية' },
    { id: 'modeliste', labelFr: 'Modéliste / Créateur', labelAr: 'مصمم أزياء / مبدع', icon: User, descFr: 'Vous êtes un(e) créateur(trice) indépendant(e)', descAr: 'أنت مصمم أزياء أو صانع محتوى مستقل' },
    { id: 'ecom', labelFr: 'E-commerce', labelAr: 'تجارة إلكترونية', icon: Rocket, descFr: 'Vous vendez exclusivement en ligne', descAr: 'أنت تبيع عبر الإنترنت حصرياً' },
    { id: 'debutant', labelFr: 'Je veux juste commencer', labelAr: 'أريد فقط أن أبدأ', icon: Sparkles, descFr: 'Vous avez une idée et souhaitez vous lancer', descAr: 'لديك فكرة وترغب في إطلاقها' },
  ];

  const budgets = [
    { id: '<5000', labelFr: 'Moins de 5 000 DH', labelAr: 'أقل من 5,000 درهم' },
    { id: '5000-10000', labelFr: '5 000 - 10 000 DH', labelAr: '5,000 - 10,000 درهم' },
    { id: '10000-50000', labelFr: '10 000 - 50 000 DH', labelAr: '10,000 - 50,000 درهم' },
    { id: '>50000', labelFr: 'Plus de 50 000 DH', labelAr: 'أكثر من 50,000 درهم' },
  ];

  const deadlines = [
    { id: 'urgent', labelFr: 'Très urgent (Moins de 2 sem)', labelAr: 'مزروب بزاف (أقل من جوج سيمانات)' },
    { id: 'normal', labelFr: 'Normal (2 à 4 semaines)', labelAr: 'عادي (من 2 لـ 4 سيمانات)' },
    { id: 'flexible', labelFr: 'Flexible (Plus d\'un mois)', labelAr: 'عندي الوقت (أكثر من شهر)' },
  ];

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
      alert(isAr ? 'الصورة كبيرة جداً (الحد الأقصى 10MB)' : 'Photo trop grande (Max 10MB)'); 
      return; 
    }
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
        if (ctx) { 
           ctx.drawImage(img, 0, 0, w, h); 
           setFormData(prev => ({ ...prev, photo: canvas.toDataURL('image/jpeg', 0.6) }));
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        id: `lead-${Date.now()}`,
        name: formData.name || 'Nouveau Lead',
        phone: formData.phone,
        type: 'Demande via New Landing',
        details: `Type: ${formData.clientType} | Nom: ${formData.companyName || 'N/A'} ${formData.companySector ? `(${formData.companySector})` : ''} | Budget: ${formData.budget} | Délai: ${formData.deadline} | Objectif: ${formData.intent} | Notes: ${formData.details}`,
        status: 'nouveau'
      };
      
      // Ajout de la photo si elle existe
      if (formData.photo) {
        payload.photo = formData.photo;
        payload.photos = [formData.photo];
      }

      await saveRecord('leads', payload);
      const newId = `user-${Date.now()}`;
      const autoCode = Math.floor(100000 + Math.random() * 900000).toString();
      const userPayload = {
        id: newId,
        nom: formData.name || 'Client',
        role: 'client',
        email: formData.email.trim().toLowerCase(),
        password: autoCode,
        pinCode: autoCode,
        telephone: formData.phone,
        actif: true,
        ville: '',
        adresse: ''
      };
      await saveRecord('users', userPayload);
      setCredentials({ email: formData.email.trim().toLowerCase(), code: autoCode });

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert(isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى.' : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const usageSteps = [
    { 
      icon: MousePointerClick, 
      titleFr: "1. Cliquez sur Démarrer", 
      titleAr: "1. اضغط على ابدأ مشروعك", 
      descFr: "Trouvez le bouton en haut ou au milieu de la page.", 
      descAr: "ابحث عن الزر في أعلى أو وسط الصفحة." 
    },
    { 
      icon: MessageSquareText, 
      titleFr: "2. Répondez aux questions", 
      titleAr: "2. أجب عن أسئلة بسيطة", 
      descFr: "Parlez-nous de vous et votre projet en 3 étapes rapides.", 
      descAr: "أخبرنا من أنت وعن مشروعك في 3 خطوات سريعة." 
    },
    { 
      icon: PhoneCall, 
      titleFr: "3. On vous contacte", 
      titleAr: "3. سنتصل بك فوراً", 
      descFr: "Notre équipe vous appellera pour confirmer et lancer votre projet.", 
      descAr: "سيتصل بك فريقنا في أقرب وقت لتأكيد طلبك والبدء." 
    }
  ];

  const processSteps = [
    { titleFr: "1. Prise de Contact", titleAr: "1. تواصل معنا", descFr: "Dites-nous qui vous êtes et ce que vous cherchez via notre formulaire intelligent.", descAr: "أخبرنا من أنت وماذا تبحث عنه عبر نموذجنا الذكي." },
    { titleFr: "2. Étude & Conseil", titleAr: "2. دراسة واستشارة", descFr: "Notre équipe analyse votre projet et vous propose la meilleure approche technique et financière.", descAr: "يقوم فريقنا بتحليل مشروعك ويقترح أفضل نهج تقني ومالي." },
    { titleFr: "3. Prototypage", titleAr: "3. صنع العينة", descFr: "Nous réalisons le patronage et le premier échantillon (prototype) pour votre validation.", descAr: "نحن نقوم بصنع الباترون والعينة الأولى لكي تؤكدها." },
    { titleFr: "4. Production", titleAr: "4. الإنتاج", descFr: "Une fois validé, nous lançons la production en série avec un contrôle qualité strict.", descAr: "بمجرد التأكيد، نبدأ الإنتاج بالجملة مع مراقبة جودة صارمة." },
    { titleFr: "5. Livraison", titleAr: "5. التوصيل", descFr: "Vos articles sont prêts, emballés avec soin et livrés selon vos délais.", descAr: "منتجاتك جاهزة، مغلفة بعناية ويتم توصيلها في الوقت المحدد." },
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500/30 transition-colors duration-300 ${isDark ? 'bg-[#020617] text-slate-50' : 'bg-slate-50 text-slate-900'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-[#020617]/80 border-white/5' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Beya Creative" 
              className={`h-12 md:h-14 object-contain transition-all duration-300 ${isDark ? 'invert hue-rotate-180 brightness-110' : ''}`} 
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'}`}
              title={isDark ? 'Mode Jour' : 'Mode Nuit'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggle}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border text-[10px] font-black ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'}`}
              title={isAr ? 'Français' : 'عربية'}
            >
              {isAr ? 'FR' : 'ع'}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`px-6 py-2.5 font-semibold rounded-full transition-colors text-sm ${isDark ? 'bg-white text-black hover:bg-indigo-50' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
            >
              {isAr ? 'ابدأ مشروعك' : 'Démarrer un projet'}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-8 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {isAr ? 'التميز في صناعة النسيج بالمغرب' : "L'excellence en confection textile au Maroc"}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            {isAr ? 'أعطِ الحياة لعلامتك التجارية مع' : 'Donnez vie à votre marque avec'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Beya Creative</span>
          </h1>
          <p className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isAr ? 'من الفكرة إلى الإنتاج النهائي. نرافق الشركات والماركات والمصممين في تحقيق تشكيلاتهم بجودة استثنائية.' : "De l'idée à la production finale. Nous accompagnons les entreprises, les marques et les créateurs dans la réalisation de leurs collections de vêtements avec une qualité premium."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
            >
              {isAr ? 'أطلق مشروعك' : 'Lancer votre projet'} <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <section className={`py-16 relative z-10 border-t transition-colors duration-300 ${isDark ? 'bg-[#020617] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{isAr ? 'كيفاش تسجل الطلب ديالك؟' : 'Comment soumettre votre demande ?'}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{isAr ? 'خطوات بسيطة باش تبدا معانا الخدمة.' : 'Des étapes simples pour commencer avec nous.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className={`hidden md:block absolute top-1/2 left-10 right-10 h-0.5 -translate-y-1/2 z-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            
            {usageSteps.map((step, idx) => (
              <div key={idx} className={`relative z-10 border p-6 rounded-2xl flex flex-col items-center text-center transition-colors ${isDark ? 'bg-slate-900 border-white/10 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50 shadow-sm'}`}>
                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAr ? step.titleAr : step.titleFr}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{isAr ? step.descAr : step.descFr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-24 border-y relative z-10 transition-colors duration-300 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{isAr ? 'كيف نعمل ؟' : 'Comment ça marche ?'}</h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{isAr ? 'مسار واضح، شفاف واحترافي.' : 'Un processus clair, transparent et professionnel.'}</p>
          </div>

          <div className="relative">
            <div className={`hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative z-10 group">
                  <div className={`border p-6 rounded-2xl h-full transition-all duration-300 hover:border-indigo-500 hover:shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)] hover:-translate-y-2 relative overflow-hidden ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-black text-xl mb-6">
                      {index + 1}
                    </div>
                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{(isAr ? step.titleAr : step.titleFr).split('. ')[1]}</h3>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{isAr ? step.descAr : step.descFr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className={`py-12 border-t text-center text-slate-500 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <p>© {new Date().getFullYear()} Beya Creative. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className={`relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300 ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between p-6 border-b shrink-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAr ? 'ابدأ مشروعك' : 'Démarrer votre projet'}</h3>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className={`p-2 rounded-full ${isDark ? 'text-slate-400 hover:text-white bg-white/5' : 'text-slate-500 hover:text-slate-900 bg-slate-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              {isSuccess ? (
                <div className="text-center pb-8 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{isAr ? 'تم إرسال طلبك بنجاح !' : 'Demande envoyée !'}</h3>
                  <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{isAr ? 'تم إنشاء حسابك في المنصة الخاصة بنا لتتبع طلبك.' : 'Votre compte a été créé sur notre plateforme pour suivre votre commande.'}</p>
                  
                  {credentials && (
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 mb-6 relative overflow-hidden text-left">
                      <h4 className="text-sm font-bold text-indigo-400 mb-4 text-center">{isAr ? 'معلومات الدخول لحسابك' : 'Vos informations de connexion'}</h4>
                      <div className={`rounded-xl p-4 md:p-6 mb-4 text-center border ${isDark ? 'bg-slate-800 border-white/5' : 'bg-slate-800 border-slate-700'}`}>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">IDENTIFIANT</p>
                        <p className="text-white font-mono text-lg md:text-xl font-bold tracking-tight">{credentials.email}</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                        <p className="text-[10px] text-emerald-400 uppercase mb-1">{isAr ? 'الرمز السري' : 'Code Secret'}</p>
                        <p className="text-2xl font-black text-emerald-400 tracking-widest font-mono">{credentials.code}</p>
                      </div>
                    </div>
                  )}

                  <a 
                    href={`https://wa.me/212624465962?text=${encodeURIComponent(isAr ? `مرحباً BEYA CREATIVE، لقد سجلت طلبي للتو باسم ${formData.name}. الرمز السري الخاص بي هو: ${credentials?.code}. أريد تأكيد الطلب.` : `Bonjour BEYA CREATIVE, je viens de passer ma commande sous le nom ${formData.name}. Mon code secret est : ${credentials?.code}. Je souhaite confirmer ma commande.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 mb-4 shadow-lg shadow-emerald-600/20"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    {isAr ? 'تأكيد الطلب عبر الواتساب' : 'Confirmer via WhatsApp'}
                  </a>
                  
                  <button onClick={() => { setIsModalOpen(false); setIsSuccess(false); setStep(1); setFormData({ clientType: '', companyName: '', companySector: '', budget: '', intent: '', deadline: '', photo: '', phone: '', name: '', email: '', details: '' }); }} className="text-slate-400 hover:text-white text-sm font-medium">
                    {isAr ? 'إغلاق' : 'Fermer'}
                  </button>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h4 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAr ? 'من أنت ؟' : 'Qui êtes-vous ?'}</h4>
                      <div className="grid gap-3">
                        {clientTypes.map(type => (
                          <button
                            key={type.id}
                            onClick={() => {
                              setFormData({ ...formData, clientType: type.id });
                              setTimeout(handleNext, 150);
                            }}
                            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                                formData.clientType === type.id 
                                  ? 'border-indigo-500 bg-indigo-500/10' 
                                  : isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                              }`}
                            dir={isAr ? 'rtl' : 'ltr'}
                          >
                            <div className={`p-3 rounded-xl shrink-0 ${formData.clientType === type.id ? 'bg-indigo-500 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                              <type.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex flex-col flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                              <div className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAr ? type.labelAr : type.labelFr}</div>
                              <div className="text-sm text-slate-400">{isAr ? type.descAr : type.descFr}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h4 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAr ? 'حدثنا عن نفسك أكثر' : 'Parlez-nous de vous'}</h4>
                      
                      {formData.clientType !== 'debutant' && (
                        <div className="mb-6">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                            {isAr 
                              ? `اسم ${formData.clientType === 'marque' ? 'علامتك التجارية' : 'شركتك / مشروعك'} *` 
                              : `Nom de votre ${formData.clientType === 'marque' ? 'marque' : 'entreprise/projet'} *`
                            }
                          </label>
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} focus:ring-1 focus:ring-indigo-500 ${isAr ? 'text-right' : 'text-left'}`}
                            placeholder={isAr ? 'مثال: Beya Brand...' : 'Ex: Beya Brand...'}
                          />
                        </div>
                      )}

                      {formData.clientType === 'entreprise' && (
                        <div className="mb-6 animate-in fade-in duration-300">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                            {isAr ? 'تخصص أو نوع الشركة / المؤسسة *' : "Secteur d'activité de l'entreprise *"}
                          </label>
                          <div className="relative">
                            <select
                              value={formData.companySector}
                              onChange={(e) => setFormData({ ...formData, companySector: e.target.value })}
                              className={`w-full appearance-none rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} ${isAr ? 'text-right pl-10' : 'text-left pr-10'}`}
                            >
                              <option value="" disabled>{isAr ? 'اختر التخصص...' : 'Sélectionnez le secteur...'}</option>
                              {sectors.map(s => (
                                <option key={s.id} value={s.id}>{isAr ? s.labelAr : s.labelFr}</option>
                              ))}
                            </select>
                            <div className={`absolute inset-y-0 ${isAr ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                          {isAr ? 'الميزانية التقديرية لهذا المشروع *' : 'Votre budget estimé pour ce projet *'}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                          {budgets.map(b => (
                            <button
                              key={b.id}
                              onClick={() => setFormData({ ...formData, budget: b.id })}
                              className={`p-4 rounded-xl border text-center transition-all ${
                                formData.budget === b.id
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white font-bold'
                                  : isDark ? 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/30' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-500/30'
                              }`}
                            >
                              {isAr ? b.labelAr : b.labelFr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                          {isAr ? 'شنو هو الهدف ديالك حالياً؟ *' : 'Quel est votre objectif actuel ? *'}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir={isAr ? 'rtl' : 'ltr'}>
                          <button
                            onClick={() => setFormData({ ...formData, intent: 'production' })}
                            className={`p-4 rounded-xl border text-center transition-all ${
                                formData.intent === 'production'
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white font-bold'
                                  : isDark ? 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/30' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-500/30'
                              }`}
                          >
                            <span className="block text-sm font-bold mb-1">{isAr ? 'عندي موديل بغيت نصاوب بحالو' : "J'ai un modèle à confectionner"}</span>
                            <span className="block text-xs font-normal opacity-70">{isAr ? '(رفع صورة)' : '(Télécharger photo)'}</span>
                          </button>
                          <button
                            onClick={() => setFormData({ ...formData, intent: 'discussion', photo: '' })}
                            className={`p-4 rounded-xl border text-center transition-all ${
                                formData.intent === 'discussion'
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white font-bold'
                                  : isDark ? 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/30' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-500/30'
                              }`}
                          >
                            <span className="block text-sm font-bold mb-1">{isAr ? 'بغيت غير نناقش الفكرة ديالي' : 'Je veux juste discuter de mon idée'}</span>
                            <span className="block text-xs font-normal opacity-70">{isAr ? '(بدون صورة)' : '(Sans photo)'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                          {isAr ? 'فوقاش محتاج هاد الطلبية توجد؟ *' : 'Quand souhaitez-vous recevoir votre commande ? *'}
                        </label>
                        <div className="flex flex-col gap-3" dir={isAr ? 'rtl' : 'ltr'}>
                          {deadlines.map(d => (
                            <button
                              key={d.id}
                              onClick={() => setFormData({ ...formData, deadline: d.id })}
                              className={`p-4 rounded-xl border text-center transition-all ${
                                formData.deadline === d.id
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white font-bold'
                                  : isDark ? 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/30' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-500/30'
                              }`}
                            >
                              {isAr ? d.labelAr : d.labelFr}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.intent === 'production' && (
                        <div className="mb-6 animate-in fade-in duration-300">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                            {isAr ? 'صورة الموديل (إجباري، باش نعطيوك ثمن دقيق) *' : 'Photo du modèle (Obligatoire, pour un devis précis) *'}
                          </label>
                          {formData.photo ? (
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-sm mx-auto sm:mx-0">
                              <img src={formData.photo} className="w-full h-full object-cover" alt="Modèle" />
                              <button type="button" onClick={() => setFormData({...formData, photo: ''})}
                                className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all ${isDark ? 'bg-slate-900 border-white/20' : 'bg-slate-50 border-slate-300'}`}>
                              <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                              <span className="text-sm font-bold text-slate-300">{isAr ? 'اضغط هنا لرفع صورة الموديل' : 'Cliquez ici pour télécharger la photo'}</span>
                              <span className="text-xs text-slate-500 mt-1">JPG, PNG (Max 10MB)</span>
                              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                            </label>
                          )}
                        </div>
                      )}

                      <div className={`flex gap-3 mt-8 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <button onClick={handleBack} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                          {isAr ? 'رجوع' : 'Retour'}
                        </button>
                        <button 
                          onClick={handleNext}
                          disabled={!formData.budget || !formData.deadline || !formData.intent || (formData.clientType !== 'debutant' && !formData.companyName) || (formData.clientType === 'entreprise' && !formData.companySector) || (formData.intent === 'production' && !formData.photo)}
                          className={`flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}
                        >
                          {isAr ? 'التالي' : 'Suivant'} <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h4 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAr ? 'معلومات الاتصال الخاصة بك' : 'Vos coordonnées'}</h4>
                      
                      <div className="space-y-4 mb-8">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{isAr ? 'الاسم الكامل *' : 'Votre Nom Complet *'}</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} ${isAr ? 'text-right' : 'text-left'}`}
                            placeholder={isAr ? 'الاسم والنسب' : 'Nom et Prénom'}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{isAr ? 'البريد الإلكتروني *' : 'Votre Email *'}</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} ${isAr ? 'text-right' : 'text-left'} dir-ltr`}
                            placeholder="email@exemple.com"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{isAr ? 'رقم الهاتف (يفضل واتساب) *' : 'Numéro de téléphone (WhatsApp de préférence) *'}</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} ${isAr ? 'text-left' : 'text-left'} dir-ltr`}
                            placeholder="06 XX XX XX XX"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{isAr ? 'تفاصيل إضافية (اختياري)' : 'Détails supplémentaires (Optionnel)'}</label>
                          <textarea
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} min-h-[100px] ${isAr ? 'text-right' : 'text-left'}`}
                            placeholder={isAr ? 'هل لديك تفاصيل أخرى تود إضافتها ؟' : 'Avez-vous des détails à ajouter ?'}
                          />
                        </div>
                      </div>

                      <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <button onClick={handleBack} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                          {isAr ? 'رجوع' : 'Retour'}
                        </button>
                        <div className="flex-1 flex flex-col">
                          <button 
                            onClick={handleSubmit}
                            disabled={!formData.name || !formData.email || !formData.phone || isSubmitting}
                            className={`w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}
                          >
                            {isSubmitting ? (
                              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                {isAr ? 'إرسال الطلب' : 'Envoyer la demande'} 
                                <CheckCircle2 className="w-5 h-5" />
                              </>
                            )}
                          </button>
                          {(!formData.name || !formData.email || !formData.phone) && (
                            <p className="text-rose-500 text-[10px] text-center mt-2 font-medium">
                              {isAr ? '* المرجو ملء جميع الخانات الإجبارية' : '* Veuillez remplir tous les champs obligatoires'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Progress Bar inside Modal */}
            {!isSuccess && (
              <div className={`w-full h-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className={`bg-indigo-500 h-full transition-all duration-300 ${isAr ? 'ml-auto' : 'mr-auto'}`} style={{ width: `${(step / 3) * 100}%` }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
