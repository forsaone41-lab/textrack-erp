import { useState, useEffect, useMemo } from 'react';
import { User as UserIcon, Mail, Phone, Shield, Calendar, Save, Camera, Lock } from 'lucide-react';
import { User, saveRecord, loadData, OperationModele, Commande, SuiviHoraire } from '../types';
import { useLang } from '../contexts/LangContext';
import { QRCodeSVG } from 'qrcode.react';

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
  const [missions, setMissions] = useState<{
    suivi: SuiviHoraire[];
    operations: OperationModele[];
    commandes: Commande[];
  }>({ suivi: [], operations: [], commandes: [] });

  useEffect(() => {
    Promise.all([
      loadData<SuiviHoraire>('suivi_horaire'),
      loadData<OperationModele>('operations_modele'),
      loadData<Commande>('commandes')
    ]).then(([s, o, c]) => {
      setMissions({ suivi: s, operations: o, commandes: c });
    });
  }, []);

  const myCurrentMission = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    // Find latest assignment for this worker today
    const myEntries = missions.suivi.filter(s =>
      s.employe_id === currentUser.id && s.date_production === today
    );
    if (myEntries.length === 0) return null;

    const latest = myEntries[myEntries.length - 1];
    const op = missions.operations.find(o => o.id === latest.operation_id);
    const cmd = missions.commandes.find(c => c.id === latest.commande_id);

    const totalDone = myEntries.reduce((acc, curr) => acc + curr.quantite_realisee, 0);
    const target = (op?.target_heure || 0) * 8; // Assuming 8h shift

    return { latest, op, cmd, totalDone, target };
  }, [missions, currentUser.id]);

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
        {/* Mission Dashboard for Workers */}
        {myCurrentMission && (
          <div className="md:col-span-3 animate-in fade-in slide-in-from-top duration-700">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                {/* Product Image */}
                <div className="w-full lg:w-48 h-64 lg:h-48 rounded-3xl overflow-hidden bg-white/10 border border-white/10 shadow-inner">
                  {myCurrentMission.cmd?.photo ? (
                    <img src={myCurrentMission.cmd.photo} className="w-full h-full object-cover" alt="Modèle" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Shield className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Mission Details */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                      Mission en cours
                    </span>
                    <h2 className="text-3xl font-black mt-2 tracking-tight">
                      {myCurrentMission.op?.nom_operation || 'Poste Assigné'}
                    </h2>
                    <p className="text-indigo-300 font-bold">
                      {myCurrentMission.cmd?.reference} — {myCurrentMission.cmd?.modele}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                      <span>Progression</span>
                      <span>{Math.round((myCurrentMission.totalDone / myCurrentMission.target) * 100)}%</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (myCurrentMission.totalDone / myCurrentMission.target) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase text-center lg:text-left">
                      {myCurrentMission.totalDone} / {myCurrentMission.target} Pièces (Objectif Jour)
                    </p>
                  </div>
                </div>

                {/* QR Code for Pointing */}
                <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-3">
                  <QRCodeSVG
                    value={`beya-prod://${myCurrentMission.cmd?.id}/${myCurrentMission.op?.id}`}
                    size={120}
                    level="H"
                    includeMargin={false}
                  />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scanner pour Pointer</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
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
