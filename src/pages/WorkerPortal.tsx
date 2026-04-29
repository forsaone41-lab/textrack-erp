import { useState, useEffect, useMemo } from 'react';
import { 
  User, 
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
  Image as ImageIcon
} from 'lucide-react';
import { 
  Employe, 
  Commande, 
  OperationModele, 
  SuiviHoraire, 
  loadData 
} from '../types';
import { QRCodeSVG } from 'qrcode.react';

export default function WorkerPortal() {
  const [loading, setLoading] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [data, setData] = useState<{
    employes: Employe[];
    commandes: Commande[];
    operations: OperationModele[];
    suivi: SuiviHoraire[];
  }>({
    employes: [],
    commandes: [],
    operations: [],
    suivi: []
  });

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<Commande>('commandes'),
      loadData<OperationModele>('operations_modele'),
      loadData<SuiviHoraire>('suivi_horaire')
    ]).then(([emps, cmds, ops, suiv]) => {
      setData({
        employes: emps.filter(e => e.actif),
        commandes: cmds,
        operations: ops,
        suivi: suiv
      });
      setLoading(false);
    });
  }, []);

  const currentWorker = data.employes.find(e => e.id === selectedWorkerId);
  const today = new Date().toLocaleDateString('en-CA');

  // Find worker's current active mission (last entry today)
  const workerSuiviToday = useMemo(() => 
    data.suivi.filter(s => s.employe_id === selectedWorkerId && s.date_production === today),
  [data.suivi, selectedWorkerId, today]);

  const lastEntry = workerSuiviToday[workerSuiviToday.length - 1];
  const activeOp = data.operations.find(o => o.id === lastEntry?.operation_id);
  const activeCmd = data.commandes.find(c => c.id === lastEntry?.commande_id);

  // Stats
  const totalPcsToday = workerSuiviToday.reduce((acc, curr) => acc + curr.quantite_realisee, 0);
  const totalTarget = activeOp ? activeOp.target_heure * 8 : 0; // Assuming 8h shift
  const progressPercent = totalTarget > 0 ? Math.min(Math.round((totalPcsToday / totalTarget) * 100), 100) : 0;

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse">Initialisation du Portail...</div>;

  if (!selectedWorkerId) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-8 text-center">Accès Espace Ouvrier</h1>
        <div className="w-full max-w-sm space-y-4">
          <select 
            value={selectedWorkerId}
            onChange={e => setSelectedWorkerId(e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-800 text-white p-5 rounded-2xl font-black appearance-none outline-none focus:border-indigo-500 transition-all shadow-xl"
          >
            <option value="">Sélectionnez votre nom</option>
            {data.employes.map(e => (
              <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
            ))}
          </select>
          <p className="text-slate-500 text-center text-xs font-bold uppercase tracking-widest">Veuillez choisir votre profil pour voir vos missions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10">
      {/* App Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">
            {currentWorker?.prenom[0]}{currentWorker?.nom[0]}
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight">{currentWorker?.prenom} {currentWorker?.nom}</h2>
            <p className="text-[10px] font-bold text-emerald-400 uppercase">En ligne • Mission Active</p>
          </div>
        </div>
        <button onClick={() => setSelectedWorkerId('')} className="p-2 bg-white/5 rounded-xl">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Mission Status Card */}
        {activeOp ? (
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest">Mission Actuelle</div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">{activeOp.nom_operation}</h3>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest opacity-80">Commande: {activeCmd?.reference}</p>
                </div>
                {activeCmd?.photo ? (
                  <img src={activeCmd.photo} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg" alt="Modèle" />
                ) : (
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-white/10">
                    <ImageIcon className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span>Objectif Journalier</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-indigo-200 uppercase">
                  <span>{totalPcsToday} Pièces faites</span>
                  <span>Cible: {totalTarget}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center border border-white/5">
            <Layout className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-black uppercase mb-2 text-slate-400">Aucune mission</h3>
            <p className="text-xs text-slate-500 font-bold">Veuillez scanner un poste pour commencer votre journée.</p>
          </div>
        )}

        {/* Digital QR Access */}
        {activeOp && (
          <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 flex flex-col items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Votre QR Poste Digital</h4>
            <div className="p-4 bg-slate-50 rounded-[2rem] border-4 border-slate-100 mb-6">
              <QRCodeSVG 
                value={`beya-prod://${activeCmd?.id}/${activeOp.id}`} 
                size={160}
                level="H"
              />
            </div>
            <p className="text-center text-xs font-black uppercase text-slate-900 px-4">
              Scannez ce code pour enregistrer votre production rapidement
            </p>
          </div>
        )}

        {/* Recent Performance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Performance Récente</h4>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-3xl p-5 border border-white/5">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Efficacité</p>
              <p className="text-xl font-black">{totalTarget > 0 ? Math.round((totalPcsToday / totalTarget) * 100) : 0}%</p>
            </div>
            <div className="bg-slate-900 rounded-3xl p-5 border border-white/5">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Score Jour</p>
              <p className="text-xl font-black">{totalPcsToday} <span className="text-[10px] text-slate-500">pcs</span></p>
            </div>
          </div>
        </div>

        {/* History / Timeline */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/5 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Séquence du jour</h4>
          <div className="space-y-3">
            {workerSuiviToday.slice(-3).reverse().map((entry, idx) => {
              const op = data.operations.find(o => o.id === entry.operation_id);
              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-[10px] font-bold">
                      {entry.heure_debut.split(':')[0]}h
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase">{op?.nom_operation}</p>
                      <p className="text-[9px] font-bold text-slate-500">{entry.quantite_realisee} pièces validées</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
