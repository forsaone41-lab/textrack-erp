import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Activity, 
  Clock, 
  LogOut,
  ShieldCheck,
  Zap,
  Target,
  CheckCircle2,
  TrendingUp,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { 
  Employe, 
  SuiviHoraire, 
  OperationModele,
  Commande,
  loadData 
} from '../types';
import { useLang } from '../contexts/LangContext';

interface ChefChainePortalProps {
  currentUser: any;
  onLogout: () => void;
}

export default function ChefChainePortal({ currentUser, onLogout }: ChefChainePortalProps) {
  const { isAr } = useLang();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'equipe' | 'production'>('equipe');
  
  const [data, setData] = useState<{
    employes: Employe[];
    suivi: SuiviHoraire[];
    operations: OperationModele[];
    commandes: Commande[];
    candidats: any[];
  }>({
    employes: [],
    suivi: [],
    operations: [],
    commandes: [],
    candidats: []
  });

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<SuiviHoraire>('suivi_horaire'),
      loadData<OperationModele>('operations_modele'),
      loadData<Commande>('commandes')
    ]).then(([emps, suiv, ops, cmds]) => {
      const storedCandidats = JSON.parse(localStorage.getItem('textrack_liste_attente') || '[]');
      const managementKeywords = ['chef', 'responsable', 'admin', 'directeur', 'rh', 'manager'];
      const isWorker = (poste: string) => {
        const p = (poste || '').toLowerCase();
        return !managementKeywords.some(kw => p.includes(kw));
      };

      setData({
        employes: emps.filter(e => e.actif && e.type === 'atelier' && isWorker(e.poste)),
        suivi: suiv,
        operations: ops,
        commandes: cmds,
        candidats: storedCandidats
      });
      setLoading(false);
    });
  }, []);

  const today = new Date().toLocaleDateString('en-CA');

  // Calculate team stats
  const teamStats = useMemo(() => {
    const todaySuivi = data.suivi.filter(s => s.date_production === today);
    const activeWorkersIds = new Set(todaySuivi.map(s => s.employe_id));
    
    let totalPieces = 0;
    todaySuivi.forEach(s => {
      totalPieces += s.quantite_realisee;
    });

    return {
      totalWorkers: data.employes.length,
      activeWorkers: activeWorkersIds.size,
      totalPieces
    };
  }, [data.suivi, data.employes, today]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-bold uppercase tracking-widest animate-pulse">
            {isAr ? 'جاري التحميل...' : 'Initialisation...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Premium Sticky Header */}
      <div className="bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            {currentUser?.photo ? (
              <img src={currentUser.photo} className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-indigo-500/20 border-2 border-indigo-500" alt="Avatar" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-tight">{currentUser?.nom || 'Chef Chaine'}</h2>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
              {isAr ? 'رئيس سلسلة الإنتاج' : 'Chef de Chaîne'}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Stats */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight italic mb-6">
          {isAr ? 'نظرة عامة على السلسلة' : 'Aperçu de la Chaîne'}
        </h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">{isAr ? 'العمال الحاضرون' : 'Équipe Active'}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black">{teamStats.activeWorkers}</span>
              <span className="text-sm font-bold text-indigo-200 mb-1">/ {teamStats.totalWorkers}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">{isAr ? 'إنتاج اليوم' : 'Production Jour'}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black">{teamStats.totalPieces}</span>
              <span className="text-xs font-bold text-emerald-200 mb-1.5 uppercase">{isAr ? 'قطعة' : 'Pcs'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-2 gap-2 bg-slate-900 mx-6 mt-4 rounded-2xl border border-white/5">
        {[
          { id: 'equipe', icon: <Users className="w-4 h-4" />, label: isAr ? 'فريقي' : 'Mon Équipe' },
          { id: 'production', icon: <Activity className="w-4 h-4" />, label: isAr ? 'الإنتاج' : 'Production' },
          { id: 'candidats', icon: <UserIcon className="w-4 h-4" />, label: isAr ? 'مترشحين للتجربة' : 'En Test' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.id === 'candidats' && data.candidats.filter(c => ['piqueuse', 'machiniste', 'surjeteuse', 'finition', 'coupeur', 'repasseur'].some(p => (c.poste || '').toLowerCase().includes(p)) && !c.chefFeedback).length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse border-2 border-slate-900" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'equipe' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.employes.length === 0 ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center border border-dashed border-slate-800">
                <p className="text-slate-500 font-bold uppercase text-xs">{isAr ? 'لا يوجد عمال في فريقك' : 'Aucun ouvrier dans votre équipe'}</p>
              </div>
            ) : (
              data.employes.map(worker => {
                const workerTodaySuivi = data.suivi.filter(s => s.employe_id === worker.id && s.date_production === today);
                const isPresent = workerTodaySuivi.length > 0;
                const piecesProduced = workerTodaySuivi.reduce((acc, curr) => acc + curr.quantite_realisee, 0);
                const lastEntry = workerTodaySuivi[workerTodaySuivi.length - 1];
                const activeOp = lastEntry ? data.operations.find(o => o.id === lastEntry.operation_id) : null;

                return (
                  <div key={worker.id} className="bg-slate-900 p-5 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {worker.photo ? (
                            <img src={worker.photo} className="w-12 h-12 rounded-xl object-cover" alt={worker.nom} />
                          ) : (
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                              {worker.prenom[0]}{worker.nom[0]}
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${isPresent ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-tight text-white">{worker.prenom} {worker.nom}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{worker.poste}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-400">{piecesProduced}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">{isAr ? 'قطعة منجزة' : 'Pcs Réalisées'}</p>
                      </div>
                    </div>

                    {activeOp ? (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-bold text-indigo-300 uppercase truncate max-w-[150px]">
                            {activeOp.nom_operation}
                          </span>
                        </div>
                        <span className="text-[9px] text-indigo-400 font-bold uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lastEntry.heure_debut} - {lastEntry.heure_fin}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-800/50 rounded-2xl p-3 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{isAr ? 'في انتظار استلام مهمة' : 'En attente de mission'}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'production' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-white">{isAr ? 'أداء السلسلة' : 'Performance Chaîne'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'إحصائيات اليوم' : 'Statistiques du jour'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">{isAr ? 'معدل الحضور' : 'Taux de présence'}</span>
                  <span className="text-xl font-black text-white">
                    {teamStats.totalWorkers > 0 ? Math.round((teamStats.activeWorkers / teamStats.totalWorkers) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">{isAr ? 'متوسط الإنتاج/عامل' : 'Moyenne Prod/Ouvrier'}</span>
                  <span className="text-xl font-black text-white">
                    {teamStats.activeWorkers > 0 ? Math.round(teamStats.totalPieces / teamStats.activeWorkers) : 0} <span className="text-sm text-slate-500">pcs</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-6 border border-dashed border-slate-800 text-center">
              <Target className="w-8 h-8 text-indigo-500/50 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                {isAr 
                  ? 'هذه الشاشة توفر لك نظرة سريعة على فريقك. لتفاصيل أكثر أو إدارة أوامر القص، يمكنك الدخول من جهاز الكمبيوتر.' 
                  : "Cet écran vous donne un aperçu rapide de votre équipe. Pour plus de détails ou gérer les ordres, connectez-vous sur PC."}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'candidats' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.candidats.filter(c => ['piqueuse', 'machiniste', 'surjeteuse', 'finition', 'coupeur', 'repasseur'].some(p => (c.poste || '').toLowerCase().includes(p))).length === 0 ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center border border-dashed border-slate-800">
                <p className="text-slate-500 font-bold uppercase text-xs">{isAr ? 'لا يوجد مترشحين في طور التجربة' : 'Aucun candidat en test'}</p>
              </div>
            ) : (
              data.candidats.filter(c => ['piqueuse', 'machiniste', 'surjeteuse', 'finition', 'coupeur', 'repasseur'].some(p => (c.poste || '').toLowerCase().includes(p))).map(candidat => (
                <div key={candidat.id} className="bg-slate-900 p-5 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-tight text-white">{candidat.prenom} {candidat.nom}</h3>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase mt-0.5">{candidat.poste}</p>
                        {candidat.confirmedBy && (
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                            {isAr ? 'من طرف:' : 'Par:'} {candidat.confirmedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {candidat.chefFeedback ? (
                    <div className={`p-3 rounded-2xl flex items-center justify-center gap-2 ${candidat.chefFeedback === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {candidat.chefFeedback === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {candidat.chefFeedback === 'approved' ? (isAr ? 'مقبول (RH ستكمل الإجراءات)' : 'Approuvé (RH finalise)') : (isAr ? 'مرفوض' : 'Rejeté')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const newList = data.candidats.map(c => c.id === candidat.id ? { ...c, chefFeedback: 'approved' } : c);
                          localStorage.setItem('textrack_liste_attente', JSON.stringify(newList));
                          setData(prev => ({ ...prev, candidats: newList }));
                        }}
                        className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-emerald-500/20"
                      >
                        {isAr ? 'قبول العامل' : 'Approuver'}
                      </button>
                      <button 
                        onClick={() => {
                          const newList = data.candidats.map(c => c.id === candidat.id ? { ...c, chefFeedback: 'rejected' } : c);
                          localStorage.setItem('textrack_liste_attente', JSON.stringify(newList));
                          setData(prev => ({ ...prev, candidats: newList }));
                        }}
                        className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-rose-500/20"
                      >
                        {isAr ? 'رفض العامل' : 'Rejeter'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
