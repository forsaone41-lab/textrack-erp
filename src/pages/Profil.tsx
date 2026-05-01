import { useState } from 'react';
import { User as UserIcon, Mail, Phone, Shield, Calendar, Save, Camera, Lock } from 'lucide-react';
import { User, saveRecord } from '../types';
import { useLang } from '../contexts/LangContext';
import WorkerPortal from './WorkerPortal';

interface ProfilProps {
  currentUser: User;
}

export default function Profil({ currentUser }: ProfilProps) {
  const { isAr } = useLang();
  
  // Redirect workers to specialized Espace Ouvrier
  if (currentUser.role === 'worker') {
    return <WorkerPortal currentUser={currentUser} />;
  }

  const [formData, setFormData] = useState({
    nom: currentUser.nom,
    email: currentUser.email,
    telephone: currentUser.telephone || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveRecord('users', { ...currentUser, ...formData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert(isAr ? 'خطأ أثناء الحفظ' : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className={`space-y-2 ${isAr ? 'text-right' : 'text-left'}`}>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{currentUser.nom}</h1>
        <div className={`flex flex-wrap gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm shadow-indigo-100/50">
            {currentUser.role.toUpperCase()}
          </span>
          <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
            ID: {currentUser.id.substring(0, 8)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              {isAr ? 'المعلومات الشخصية' : 'Informations Personnelles'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isAr ? 'الاسم الكامل' : 'Nom Complet'}</label>
                <div className="relative">
                  <UserIcon className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input 
                    type="text" 
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50 border-none rounded-[1.2rem] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all`}
                    dir={isAr ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="relative">
                  <Mail className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50 border-none rounded-[1.2rem] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all`}
                    dir={isAr ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
                <div className="relative">
                  <Phone className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input 
                    type="tel" 
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    placeholder="+212 600 000 000"
                    className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50 border-none rounded-[1.2rem] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all`}
                    dir={isAr ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-[#4f46e5] text-white rounded-[1.2rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {success ? (isAr ? 'تم الحفظ' : 'Enregistré') : (isAr ? 'حفظ التغييرات' : 'Enregistrer')}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl space-y-6">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-400" />
              {isAr ? 'الأمن' : 'Sécurité'}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{isAr ? 'الدور الحالي' : 'Rôle Actuel'}</p>
                <p className="text-sm font-bold">{currentUser.role.toUpperCase()}</p>
              </div>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold">{isAr ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
              <Calendar className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-widest">{isAr ? 'آخر اتصال' : 'Dernière Connexion'}</p>
            </div>
            <p className="text-sm font-black text-slate-800">
              {currentUser.lastActive ? new Date(currentUser.lastActive).toLocaleString(isAr ? 'ar-MA' : 'fr-FR') : (isAr ? 'أبداً' : 'Jamais')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
    </svg>
  );
}
