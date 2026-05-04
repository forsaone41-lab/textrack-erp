import { useState, useEffect, useMemo } from 'react';
import { 
  User as UserIcon, 
  Trophy, 
  Target, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  QrCode,
  Layout,
  Star,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Wallet,
  Calendar,
  CreditCard,
  Medal,
  Zap,
  Info,
  LogOut,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { 
  Employe, 
  Commande, 
  OperationModele, 
  SuiviHoraire, 
  PaiementSalaire,
  loadData 
} from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { useLang } from '../contexts/LangContext';

interface WorkerPortalProps {
  currentUser?: any;
}

export default function WorkerPortal({ currentUser }: WorkerPortalProps) {
  const { isAr } = useLang();
  const [loading, setLoading] = useState(true);
  // Auto-detect worker from logged-in user account
  const selectedWorkerId = currentUser?.employeId || '';
  const [activeTab, setActiveTab] = useState<'mission' | 'paiements' | 'profil'>('mission');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [data, setData] = useState<{
    employes: Employe[];
    commandes: Commande[];
    operations: OperationModele[];
    suivi: SuiviHoraire[];
    paiements: PaiementSalaire[];
  }>({
    employes: [],
    commandes: [],
    operations: [],
    suivi: [],
    paiements: []
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<Commande>('commandes'),
      loadData<OperationModele>('operations_modele'),
      loadData<SuiviHoraire>('suivi_horaire'),
      loadData<PaiementSalaire>('paiements_salaires')
    ]).then(([emps, cmds, ops, suiv, pays]) => {
      setData({
        employes: emps.filter(e => e.actif),
        commandes: cmds,
        operations: ops,
        suivi: suiv,
        paiements: pays
      });
      setLoading(false);
    });
  }, []);

  const currentWorker = data.employes.find(e => e.id === selectedWorkerId);
  
  const handlePhotoChange = async () => {
    if (!currentWorker) return;
    const url = prompt(isAr ? 'أدخل رابط الصورة الجديدة:' : 'Entrez l\'URL de la nouvelle photo:');
    if (url) {
      setIsUploading(true);
      const updated = { ...currentWorker, photo: url };
      // Save to employees table
      const { saveRecord } = await import('../types');
      await saveRecord('employes', updated);
      
      // Update local state
      setData(prev => ({
        ...prev,
        employes: prev.employes.map(e => e.id === updated.id ? updated : e)
      }));
      setIsUploading(false);
    }
  };

  const workerPaiements = data.paiements
    .filter(p => p.employeId === selectedWorkerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const today = new Date().toLocaleDateString('en-CA');

  const workerSuiviToday = useMemo(() => 
    data.suivi.filter(s => s.employe_id === selectedWorkerId && s.date_production === today),
  [data.suivi, selectedWorkerId, today]);

  const lastEntry = workerSuiviToday[workerSuiviToday.length - 1];
  const activeOp = data.operations.find(o => o.id === lastEntry?.operation_id);
  const activeCmd = data.commandes.find(c => c.id === lastEntry?.commande_id);

  const totalPcsToday = workerSuiviToday.reduce((acc, curr) => acc + curr.quantite_realisee, 0);
  const totalTarget = activeOp ? activeOp.target_heure * 8 : 0; 
  const progressPercent = totalTarget > 0 ? Math.min(Math.round((totalPcsToday / totalTarget) * 100), 100) : 0;

  const getRank = (efficiency: number) => {
    if (efficiency >= 90) return { label: isAr ? 'معلم حرفي' : 'Maître Artisan', color: 'text-amber-400', bg: 'bg-amber-400/10' };
    if (efficiency >= 70) return { label: isAr ? 'خبير' : 'Expert', color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
    return { label: isAr ? 'محترف' : 'Professionnel', color: 'text-slate-400', bg: 'bg-slate-400/10' };
  };
  const rank = getRank(progressPercent);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-bold uppercase tracking-widest animate-pulse">{isAr ? 'جاري التحميل...' : 'Initialisation...'}</p>
      </div>
    </div>
  );

  // If user has no linked employee profile, show a clear message
  if (!selectedWorkerId) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl ring-4 ring-slate-900">
          <ShieldCheck className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter mb-3 text-center">
          {isAr ? 'الحساب غير مرتبط' : 'Compte non associé'}
        </h1>
        <p className="text-slate-400 text-sm font-bold text-center max-w-xs leading-relaxed">
          {isAr 
            ? 'حسابك غير مرتبط بأي موظف. يرجى التواصل مع المدير لإضافة معرف الموظف لحسابك.'
            : "Votre compte n'est pas lié à un employé. Contactez l'administrateur pour associer votre profil."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Premium Sticky Header */}
      <div className="bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            {currentWorker?.photo ? (
              <img src={currentWorker.photo} className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-indigo-500/20 border-2 border-indigo-500" alt="Avatar" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
                {currentWorker?.prenom[0]}{currentWorker?.nom[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h2 className="text-sm font-bold uppercase tracking-tight">{currentWorker?.prenom} {currentWorker?.nom}</h2>
               <span className={`text-[8px] px-1.5 py-0.5 rounded ${rank.bg} ${rank.color} font-bold uppercase`}>{rank.label}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentWorker?.poste}</p>
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex p-2 gap-2 bg-slate-900 mx-6 mt-6 rounded-2xl border border-white/5">
        {[
          { id: 'mission', icon: <Target className="w-4 h-4" />, label: isAr ? 'المهام' : 'Missions' },
          { id: 'paiements', icon: <Wallet className="w-4 h-4" />, label: isAr ? 'الأداء' : 'Paiements' },
          { id: 'profil', icon: <UserIcon className="w-4 h-4" />, label: isAr ? 'حسابي' : 'Profil' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto">
        
        {activeTab === 'mission' && (
          <>
            {/* Greeting */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight italic">{isAr ? 'مرحباً' : 'Bonjour'} {currentWorker?.prenom} !</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{isAr ? 'تتبع مسار عملك اليومي' : 'Suivi de votre roadmap aujourd\'hui'}</p>
            </div>

            {/* Roadmap Stepper */}
            {workerSuiviToday.length > 0 && (
              <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  {(() => {
                    const sortedOpIds = Array.from(new Set(workerSuiviToday.map(s => s.operation_id)))
                      .sort((a, b) => {
                         const entryA = workerSuiviToday.find(s => s.operation_id === a);
                         const entryB = workerSuiviToday.find(s => s.operation_id === b);
                         return (entryA?.heure_debut || '').localeCompare(entryB?.heure_debut || '');
                      });

                    return sortedOpIds.map((opId, idx) => {
                      const op = data.operations.find(o => o.id === opId);
                      const opEntries = workerSuiviToday.filter(s => s.operation_id === opId);
                      const opPcs = opEntries.reduce((acc, curr) => acc + curr.quantite_realisee, 0);
                      const opTarget = op ? op.target_heure * opEntries.length : 0;
                      const opProgress = opTarget > 0 ? Math.min(Math.round((opPcs / opTarget) * 100), 100) : 0;
                      const isDone = opProgress >= 100;
                      const isActive = !isDone && (idx === 0 || (sortedOpIds[idx-1] && workerSuiviToday.filter(s => s.operation_id === sortedOpIds[idx-1]).reduce((a,b) => a+b.quantite_realisee,0) >= (data.operations.find(o => o.id === sortedOpIds[idx-1])?.target_heure || 0) * workerSuiviToday.filter(s => s.operation_id === sortedOpIds[idx-1]).length));

                      return (
                        <div key={opId} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                          {/* Line between steps */}
                          {idx < sortedOpIds.length - 1 && (
                            <div className="absolute left-1/2 w-full h-[2px] bg-white/10 top-4 -z-10" />
                          )}
                          
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 shadow-lg ${
                            isDone ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                            isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 animate-pulse' : 
                            'bg-slate-800 text-slate-500'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-tighter text-center max-w-[60px] truncate ${
                            isActive ? 'text-indigo-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
                          }`}>
                            {op?.nom_operation}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Missions List */}
            {workerSuiviToday.length > 0 ? (
              <div className="space-y-8">
                {(() => {
                  const sortedOpIds = Array.from(new Set(workerSuiviToday.map(s => s.operation_id)))
                    .sort((a, b) => {
                       const entryA = workerSuiviToday.find(s => s.operation_id === a);
                       const entryB = workerSuiviToday.find(s => s.operation_id === b);
                       return (entryA?.heure_debut || '').localeCompare(entryB?.heure_debut || '');
                    });

                  let allPreviousDone = true;

                  return sortedOpIds.map((opId, idx) => {
                    const op = data.operations.find(o => o.id === opId);
                    const cmd = data.commandes.find(c => c.id === workerSuiviToday.find(s => s.operation_id === opId)?.commande_id);
                    
                    const opEntries = workerSuiviToday.filter(s => s.operation_id === opId);
                    const opPcs = opEntries.reduce((acc, curr) => acc + curr.quantite_realisee, 0);
                    const opTarget = op ? op.target_heure * opEntries.length : 0;
                    const opProgress = opTarget > 0 ? Math.min(Math.round((opPcs / opTarget) * 100), 100) : 0;
                    const isDone = opProgress >= 100;

                    const isLocked = !allPreviousDone;
                    
                    // Update tracker for next iteration
                    if (!isDone) allPreviousDone = false;

                    if (!op) return null;

                    if (isLocked) {
                      return (
                        <div key={opId} className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-50">
                           <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                              <ShieldCheck className="w-6 h-6 text-slate-600" />
                           </div>
                           <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'مهمة مقفولة' : 'Mission Verrouillée'}</h4>
                           <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 italic">{isAr ? 'أكمل المهمة السابقة لفتح هذه المهمة' : 'Terminez la mission précédente pour débloquer'}</p>
                        </div>
                      );
                    }

                    return (
                      <div key={opId} className="space-y-4">
                        <div 
                          onClick={() => !isLocked && setExpandedMissionId(expandedMissionId === opId ? null : opId)}
                          className={`bg-gradient-to-br ${isDone ? 'from-emerald-600 to-teal-800' : 'from-indigo-600 to-violet-800'} rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all cursor-pointer hover:scale-[0.99] active:scale-[0.97]`}
                        >
                          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                          
                          <div className="flex items-center justify-between mb-8">
                            <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                              {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-300" /> : <Zap className="w-3 h-3 fill-white" />}
                              {isDone ? (isAr ? 'مكتملة' : 'Terminée') : (isAr ? 'اضغط للعرض' : 'Cliquez pour voir QR')}
                            </div>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                              {opEntries[0].heure_debut} — {opEntries[opEntries.length - 1].heure_fin}
                            </span>
                          </div>

                          <div className="space-y-8">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-3xl font-bold uppercase tracking-tighter leading-none mb-3">{op.nom_operation}</h3>
                                <div className="flex items-center gap-2 text-white/70">
                                   <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-300' : 'bg-emerald-400 animate-ping'}`} />
                                   <span className="text-[10px] font-bold uppercase tracking-widest">Réf: {cmd?.reference}</span>
                                </div>
                              </div>
                              {cmd?.modelePhoto && (
                                <div className="relative">
                                  <img src={cmd.modelePhoto} className="w-20 h-20 rounded-3xl object-cover border-4 border-white/20 shadow-2xl rotate-3" alt="Modèle" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-3 bg-black/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                              <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-white/60 uppercase">{isAr ? 'التقدم' : 'Progression'}</p>
                                  <p className="text-2xl font-bold">{opProgress}%</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-white/60 uppercase">{isAr ? 'المحقق' : 'Produit'}</p>
                                  <p className={`text-2xl font-bold ${isDone ? 'text-emerald-300' : 'text-emerald-400'}`}>{opPcs}</p>
                                </div>
                              </div>
                              <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                                <div 
                                  className={`h-full ${isDone ? 'bg-white' : 'bg-gradient-to-r from-emerald-400 to-cyan-300'} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.5)]`} 
                                  style={{ width: `${opProgress}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                 <span className="text-[9px] font-bold text-white/60 uppercase flex items-center gap-1">
                                    <Target className="w-3 h-3" /> {isAr ? 'الهدف' : 'Objectif'}: {opTarget}
                                 </span>
                                 <span className="text-[9px] font-bold text-white/60 uppercase flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {op.target_heure} {isAr ? 'قطعة/ساعة' : 'pcs/h'}
                                 </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR for this specific mission - Show only if expanded */}
                        {!isDone && expandedMissionId === opId && (
                          <div className="bg-white rounded-[2rem] p-6 text-slate-900 flex flex-col items-center shadow-lg border border-slate-100 animate-in zoom-in-95 duration-200">
                            <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">{isAr ? 'رمز التحقق النشط' : 'QR Validation Actif'}</h4>
                            <QRCodeSVG value={`beya-prod://${cmd?.id}/${op.id}`} size={160} level="H" includeMargin />
                            <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">{op.nom_operation}</p>
                            <button 
                              onClick={() => setExpandedMissionId(null)}
                              className="mt-6 text-[10px] font-bold text-indigo-600 uppercase tracking-widest py-2 px-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              {isAr ? 'إخفاء الرمز' : 'Masquer le QR'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center border border-dashed border-slate-800">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layout className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold uppercase mb-3">{isAr ? 'في الانتظار' : 'En attente'}</h3>
                <p className="text-sm text-slate-500 font-bold max-w-[200px] mx-auto leading-relaxed">
                  {isAr ? 'لم يتم تعيين أي مهمة لك من طرف المشرف بعد' : "Votre superviseur n'a pas encore assigné de mission."}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'paiements' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between px-2">
                <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'سجل الأداء' : 'Mes Paiements'}</h1>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                   <Wallet className="w-5 h-5" />
                </div>
             </div>

             {workerPaiements.length === 0 ? (
               <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center border border-dashed border-slate-800">
                 <p className="text-slate-500 font-bold uppercase text-xs">{isAr ? 'لا يوجد سجل للأداء حالياً' : 'Aucun paiement enregistré pour le moment.'}</p>
               </div>
             ) : (
               <div className="space-y-4">
                  {workerPaiements.map((p, i) => (
                    <div key={p.id} className="bg-slate-900 border border-white/5 p-6 rounded-3xl hover:bg-slate-800/50 transition-colors">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400">
                                <Calendar className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.mois}</p>
                                <p className="text-base font-bold text-white">{new Date(p.date).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-bold text-emerald-400">{p.montant} <span className="text-[10px]">MAD</span></p>
                             <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-slate-400 font-bold uppercase">{p.methode}</span>
                          </div>
                       </div>
                       {p.notes && (
                         <div className="pt-4 border-t border-white/5 flex gap-2 items-center">
                            <Info className="w-3 h-3 text-slate-500" />
                            <p className="text-[10px] text-slate-400 font-medium italic">{p.notes}</p>
                         </div>
                       )}
                    </div>
                  ))}
               </div>
             )}

             <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <Trophy className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-white">{isAr ? 'مكافأة الأداء' : 'Récompense Bonus'}</h3>
                </div>
                <p className="text-xs text-slate-400 font-bold leading-relaxed mb-4">
                  {isAr ? 'أكمل أهدافك بنسبة 100٪ لمدة 5 أيام متتالية للحصول على مكافأة أداء!' : 'Terminez vos objectifs à 100% pendant 5 jours consécutifs pour recevoir une prime de performance !'}
                </p>
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                   <div className="w-[40%] h-full bg-amber-500" />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'profil' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col items-center text-center pb-8 border-b border-white/5 relative">
                <div className="relative group">
                  <div className="w-28 h-28 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-bold shadow-2xl shadow-indigo-500/20 mb-6 border-4 border-slate-900 ring-2 ring-indigo-500/20 overflow-hidden">
                    {currentWorker?.photo ? (
                      <img src={currentWorker.photo} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <span>{currentWorker?.prenom[0]}{currentWorker?.nom[0]}</span>
                    )}
                  </div>
                  <button 
                    onClick={handlePhotoChange}
                    className="absolute bottom-4 right-0 w-10 h-10 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all border-4 border-slate-900"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">{currentWorker?.prenom} {currentWorker?.nom}</h2>
                <div className="mt-2 px-4 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                   {currentWorker?.poste}
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                         <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CIN</p>
                         <p className="text-sm font-bold">{currentWorker?.cin || '---'}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                         <Info className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RIB Bancaire</p>
                         <p className="text-sm font-bold font-mono tracking-tighter">{currentWorker?.rib || '---'}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                         <Medal className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'طريقة الأداء' : 'Type de Rémunération'}</p>
                         <p className="text-sm font-bold uppercase">{currentWorker?.remunerationType || (isAr ? 'بالقطعة' : 'À la tâche')}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-6">
                <div className="p-6 bg-indigo-600 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-indigo-500 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                         <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white uppercase tracking-tight">{isAr ? 'شارة الأمان' : 'Badge de Sécurité'}</p>
                         <p className="text-[10px] text-indigo-100 font-bold uppercase opacity-80">{isAr ? 'عرض بطاقتي الرقمية' : 'Afficher mon badge digital'}</p>
                      </div>
                   </div>
                   <ArrowRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
