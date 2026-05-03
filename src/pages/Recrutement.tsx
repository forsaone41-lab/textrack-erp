import React, { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { Shirt, Scissors, Users, ArrowRight, CheckCircle, Send, Phone, MapPin, Briefcase, Globe, Upload, Trash2 } from 'lucide-react';
import { saveLead } from '../types';

export default function Recrutement() {
  const { isAr, toggle } = useLang();
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cvFile, setCvFile] = useState<string>('');

  const specialties = [
    { id: 'piqueuse', fr: 'Piqueuse / Machiniste', ar: 'خياطة / بيكوز' },
    { id: 'coupeur', fr: 'Coupeur', ar: 'فصّال' },
    { id: 'repasseur', fr: 'Repasseur', ar: 'بريسور / مصلوح' },
    { id: 'controleur', fr: 'Contrôleur Qualité', ar: 'مراقب جودة' },
    { id: 'chef', fr: 'Chef de Chaîne', ar: 'شاف دو شين' },
    { id: 'autre', fr: 'Autre', ar: 'تخصص آخر' }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    const formData = new FormData(e.currentTarget);
    
    const leadData = {
      name: formData.get('name') as string,
      email: 'recrutement@beya.ma', // Placeholder for recruitment type
      phone: formData.get('phone') as string,
      ville: formData.get('ville') as string,
      type: 'RECRUTEMENT: ' + formData.get('specialty'),
      quantity: 0,
      details: `Expérience: ${formData.get('experience')} ans. Message: ${formData.get('message')}`,
      photo: '', // Optional for recruitment
      cv: cvFile
    };

    try {
      await saveLead(leadData);
      setIsSending(false);
      setShowSuccess(true);
    } catch (err) {
      setIsSending(false);
      alert('Error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            {isAr ? 'تم تسجيل طلبك!' : 'Candidature Reçue !'}
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            {isAr ? 'شكراً ليك على الاهتمام بالعمل مع BEYA. الفريق ديالنا غادي يراجع الطلب وغادي يتواصل معاك قريباً.' : 'Merci pour votre intérêt. Notre équipe examinera votre profil et vous contactera très prochainement.'}
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
            {isAr ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 relative overflow-hidden pb-20 ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} z-50`}>
        <button 
          onClick={toggle}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          {isAr ? 'FRANÇAIS' : 'العربية'}
        </button>
      </div>

      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="pt-20 pb-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm border border-slate-100 mb-8">
          <Users className="w-4 h-4" />
          {isAr ? 'انضم إلى فريق BEYA' : 'Rejoignez l\'équipe BEYA'}
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-6">
          {isAr ? 'كن جزءاً من' : 'Devenez acteur de'} <br />
          <span className="text-indigo-600">{isAr ? 'نجاحنا' : 'notre succès'}</span>
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
          {isAr ? 'نحن نبحث عن محترفين في الخياطة والفصالة للعمل في بيئة احترافية ومحفزة.' : 'Nous recherchons des talents passionnés par la confection textile pour renforcer notre atelier.'}
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAr ? 'الإسم الكامل' : 'Nom Complet'}</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="name" type="text" required placeholder="Ahmed Alami" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="phone" type="tel" required placeholder="06XXXXXXXX" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAr ? 'المدينة' : 'Ville'}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="ville" type="text" required placeholder="Casablanca" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAr ? 'التخصص' : 'Spécialité'}</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select name="specialty" required className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none">
                    {specialties.map(s => (
                      <option key={s.id} value={s.fr}>{isAr ? s.ar : s.fr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAr ? 'سنوات الخبرة' : 'Années d\'expérience'}</label>
              <input name="experience" type="number" required placeholder="Ex: 5" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAr ? 'السيرة الذاتية (CV)' : 'Votre CV (PDF ou Image)'}</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center gap-3 px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-white hover:border-indigo-600 transition-all group">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600">
                    {cvFile ? (isAr ? 'تم اختيار الملف ✅' : 'Fichier sélectionné ✅') : (isAr ? 'اختر ملف CV...' : 'Choisir un fichier...')}
                  </span>
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
                </label>
                {cvFile && (
                  <button type="button" onClick={() => setCvFile('')} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAr ? 'رسالة إضافية (اختياري)' : 'Message (Optionnel)'}</label>
              <textarea name="message" rows={4} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all resize-none" />
            </div>

            <button 
              disabled={isSending}
              type="submit" 
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSending ? (isAr ? 'جاري الإرسال...' : 'Envoi...') : (isAr ? 'إرسال ترشيحي' : 'Envoyer ma candidature')}
              {!isSending && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
