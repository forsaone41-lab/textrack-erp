import { useState } from 'react';
import { User as UserIcon, Mail, Phone, Shield, Calendar, Save, Camera, Lock } from 'lucide-react';
import { User, saveRecord } from '../types';
import { useLang } from '../contexts/LangContext';

interface ProfilProps {
  currentUser: User;
}

export default function Profil({ currentUser }: ProfilProps) {
  const { isAr } = useLang();
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
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-6">
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200">
            {currentUser.nom[0].toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all border border-slate-100">
            <Camera className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{currentUser.nom}</h1>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-100">
              {currentUser.role}
            </span>
            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-100">
              ID: {currentUser.id.substring(0, 8)}
            </span>
          </div>
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Nom Complet</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.2rem] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.2rem] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    placeholder="+212 600 000 000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.2rem] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
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
              Sécurité
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Rôle Actuel</p>
                <p className="text-sm font-bold">{currentUser.role.toUpperCase()}</p>
              </div>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold">Changer le mot de passe</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
              <Calendar className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Dernière Connexion</p>
            </div>
            <p className="text-sm font-black text-slate-800">
              {currentUser.lastActive ? new Date(currentUser.lastActive).toLocaleString() : 'Jamais'}
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
