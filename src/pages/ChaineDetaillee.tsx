import { useState, useEffect, useMemo } from 'react';
import { 
  Factory, 
  Settings, 
  Users, 
  Clock, 
  Save, 
  Plus, 
  Trash2, 
  ChevronRight, 
  TrendingUp, 
  AlertCircle,
  LayoutDashboard,
  CheckCircle2,
  Timer,
  QrCode,
  Printer,
  Calendar,
  UserPlus,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Commande, 
  Employe, 
  OperationModele, 
  SuiviHoraire, 
  loadData, 
  saveRecord, 
  genId,
  deleteRecord
} from '../types';
import { useLang } from '../contexts/LangContext';

const HEURES_TRAVAIL = [
  '00:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00',
  '04:00 - 05:00', '05:00 - 06:00', '06:00 - 07:00', '07:00 - 08:00',
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
  '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
  '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00'
];

interface AssignmentDetail {
  empId: string;
  startHour: string;
  endHour: string;
}

export default function ChaineDetaillee() {
  const { isAr } = useLang();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [operations, setOperations] = useState<OperationModele[]>([]);
  const [suivi, setSuivi] = useState<SuiviHoraire[]>([]);
  
  const [selectedCmdId, setSelectedCmdId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'config' | 'suivi' | 'stats' | 'planning'>('planning');
  const [activeShift, setActiveShift] = useState<'jour' | 'nuit'>('jour');
  const [loading, setLoading] = useState(true);

  // Planning state
  const [assignments, setAssignments] = useState<Record<string, AssignmentDetail>>({});
  const [syncing, setSyncing] = useState(false);

  // Form states
  const [showOpModal, setShowOpModal] = useState(false);
  const [opForm, setOpForm] = useState<Partial<OperationModele>>({});
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrPost, setQrPost] = useState<OperationModele | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<Employe>('employes'),
      loadData<OperationModele>('operations_modele'),
      loadData<SuiviHoraire>('suivi_horaire')
    ]).then(([cmds, emps, ops, s]) => {
      setCommandes(cmds.filter(c => c.statut === 'en_cours'));
      setEmployes(emps.filter(e => e.actif));
      setOperations(ops);
      setSuivi(s);
      
      if (cmds.length > 0 && !selectedCmdId) {
        const first = cmds.find(c => c.statut === 'en_cours');
        if (first) setSelectedCmdId(first.id);
      }
      setLoading(false);
    });
  }, []);

  const selectedCmd = useMemo(() => 
    commandes.find(c => c.id === selectedCmdId), [commandes, selectedCmdId]);

  const modelOps = useMemo(() => 
    operations.filter(o => o.modele === selectedCmd?.modele)
    .sort((a, b) => a.ordre_sequence - b.ordre_sequence), [operations, selectedCmd]);

  const today = new Date().toISOString().split('T')[0];
  const todaySuivi = useMemo(() => 
    suivi.filter(s => s.commande_id === selectedCmdId && s.date_production === today), 
    [suivi, selectedCmdId, today]);

  const filteredHours = useMemo(() => {
    if (activeShift === 'jour') {
      return HEURES_TRAVAIL.filter(h => {
        const hour = parseInt(h.split(':')[0]);
        return hour >= 8 && hour < 20;
      });
    } else {
      return HEURES_TRAVAIL.filter(h => {
        const hour = parseInt(h.split(':')[0]);
        return hour >= 20 || hour < 8;
      });
    }
  }, [activeShift]);

  const availableHours = useMemo(() => {
    const hours = filteredHours.map(h => h.split(' - ')[0]);
    // Add the final end hour if needed, but for range 08:00 to 18:00, we need the slots
    return hours;
  }, [filteredHours]);

  // Load current assignments from existing suivi
  useEffect(() => {
    if (modelOps.length > 0 && todaySuivi.length > 0) {
      const currentMap: Record<string, AssignmentDetail> = {};
      modelOps.forEach(op => {
        const entries = todaySuivi.filter(s => s.operation_id === op.id && s.employe_id);
        if (entries.length > 0) {
          // Sort by time to find range
          const sorted = entries.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
          currentMap[op.id] = {
            empId: sorted[0].employe_id!,
            startHour: sorted[0].heure_debut,
            endHour: sorted[sorted.length - 1].heure_debut // simplified for now
          };
        }
      });
      // Merge with default values for ops not found
      modelOps.forEach(op => {
        if (!currentMap[op.id]) {
          currentMap[op.id] = {
            empId: '',
            startHour: availableHours[0] || '08:00',
            endHour: availableHours[availableHours.length - 1] || '18:00'
          };
        }
      });
      setAssignments(currentMap);
    } else if (modelOps.length > 0) {
       const initial: Record<string, AssignmentDetail> = {};
       modelOps.forEach(op => {
         initial[op.id] = {
           empId: '',
           startHour: availableHours[0] || '08:00',
           endHour: availableHours[availableHours.length - 1] || '18:00'
         };
       });
       setAssignments(initial);
    }
  }, [modelOps, todaySuivi, availableHours]);

  async function handleAddOperation() {
    if (!selectedCmd || !opForm.nom_operation) return;
    
    const newOp: OperationModele = {
      id: genId(),
      modele: selectedCmd.modele,
      nom_operation: opForm.nom_operation,
      target_heure: opForm.target_heure || 40,
      ordre_sequence: modelOps.length + 1
    };

    const updated = [...operations, newOp];
    setOperations(updated);
    setShowOpModal(false);
    setOpForm({});
    await saveRecord('operations_modele', newOp);
  }

  async function handleDeleteOp(id: string) {
    if (!confirm('Supprimer cette opération ?')) return;
    setOperations(operations.filter(o => o.id !== id));
    await deleteRecord('operations_modele', id);
  }

  async function handleUpdateSuivi(opId: string, empId: string, heure: string, qte: number) {
    const [hDebut, hFin] = heure.split(' - ');
    
    const existing = todaySuivi.find(s => 
      s.operation_id === opId && 
      s.heure_debut === hDebut
    );

    const newEntry: any = {
      id: existing?.id || genId(),
      commande_id: selectedCmdId,
      employe_id: empId || null,
      operation_id: opId,
      heure_debut: hDebut,
      heure_fin: hFin,
      quantite_realisee: qte,
      date_production: today
    };

    if (!empId && (!qte || qte === 0)) {
      if (existing) {
        setSuivi(suivi.filter(s => s.id !== existing.id));
        await deleteRecord('suivi_horaire', existing.id);
      }
      return;
    }

    const updatedSuivi = existing 
      ? suivi.map(s => s.id === existing.id ? newEntry : s)
      : [...suivi, newEntry];
    
    setSuivi(updatedSuivi);
    await saveRecord('suivi_horaire', newEntry);
  }

  async function applyPlanning() {
    if (!selectedCmdId) return;
    setSyncing(true);
    
    const promises: Promise<void>[] = [];
    const newSuiviEntries: SuiviHoraire[] = [...suivi];

    for (const opId of Object.keys(assignments)) {
      const detail = assignments[opId];
      if (!detail.empId) continue;

      // Filter hours within the selected range
      const hoursInRange = filteredHours.filter(tranche => {
        const start = tranche.split(' - ')[0];
        return start >= detail.startHour && start <= detail.endHour;
      });

      for (const tranche of hoursInRange) {
        const [hDebut, hFin] = tranche.split(' - ');
        const existing = todaySuivi.find(s => s.operation_id === opId && s.heure_debut === hDebut);
        
        const entry: SuiviHoraire = {
          id: existing?.id || genId(),
          commande_id: selectedCmdId,
          employe_id: detail.empId,
          operation_id: opId,
          heure_debut: hDebut,
          heure_fin: hFin,
          quantite_realisee: existing?.quantite_realisee || 0,
          date_production: today
        };

        promises.push(saveRecord('suivi_horaire', entry));
        
        const idx = newSuiviEntries.findIndex(s => s.id === entry.id);
        if (idx !== -1) newSuiviEntries[idx] = entry;
        else newSuiviEntries.push(entry);
      }
    }

    await Promise.all(promises);
    setSuivi(newSuiviEntries);
    setSyncing(false);
    setActiveTab('suivi');
    alert(isAr ? 'تم توزيع المهام بنجاح!' : 'Planning distribué avec succès !');
  }

  const getProduction = (opId: string, heureDebut: string) => {
    return todaySuivi.find(s => s.operation_id === opId && s.heure_debut === heureDebut);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 -mx-4 md:mx-0 px-4 md:px-0">
      {/* Header & Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-0 z-[40] md:relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-slate-200">
            <Factory className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight uppercase">Pilotage Séquentiel</h1>
            <p className="hidden md:block text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60">Gestion détaillée des postes de travail</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select 
            value={selectedCmdId}
            onChange={e => setSelectedCmdId(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 md:py-4 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          >
            {commandes.map(c => (
              <option key={c.id} value={c.id}>{c.reference} — {c.modele}</option>
            ))}
          </select>
          
          <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {(['planning', 'suivi', 'config', 'stats'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-[1rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'planning' ? (isAr ? 'توزيع المهام' : 'Planning') :
                 t === 'suivi' ? (isAr ? 'تتبع' : 'Pointage') : 
                 t === 'config' ? (isAr ? 'إعداد' : 'Config') : 
                 (isAr ? 'أداء' : 'Perf')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'planning' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-10">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{isAr ? 'توزيع المهام اليومية' : 'Distribution des Missions'}</h2>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Assignez un ouvrier et une plage horaire à chaque poste</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button onClick={() => setActiveShift('jour')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeShift === 'jour' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Jour</button>
                      <button onClick={() => setActiveShift('nuit')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeShift === 'nuit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Nuit</button>
                   </div>
                   <button 
                     onClick={applyPlanning}
                     disabled={syncing}
                     className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
                   >
                      {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                      {isAr ? 'تفعيل التوزيع' : 'Lancer la Production'}
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modelOps.map((op, idx) => (
                  <div key={op.id} className="group p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/10" />
                     
                     <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm">
                           {idx + 1}
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cible Horaire</p>
                           <p className="text-lg font-black text-slate-900">{op.target_heure} <span className="text-[10px]">pcs/h</span></p>
                        </div>
                     </div>

                     <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-6 relative z-10">{op.nom_operation}</h3>
                     
                     <div className="space-y-4 relative z-10">
                        <div className="relative">
                           <select 
                             value={assignments[op.id]?.empId || ''}
                             onChange={e => setAssignments({...assignments, [op.id]: { ...assignments[op.id], empId: e.target.value }})}
                             className="w-full bg-white border-2 border-slate-100 rounded-xl py-4 px-4 text-xs font-black text-slate-800 appearance-none outline-none focus:border-indigo-500 transition-all shadow-sm"
                           >
                              <option value="">-- Choisir un ouvrier --</option>
                              {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <UserPlus className="w-4 h-4 text-slate-300" />
                           </div>
                        </div>

                        {/* Range Selectors */}
                        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
                           <div className="flex-1">
                              <p className="text-[7px] font-black text-slate-400 uppercase mb-1 ml-1">Début</p>
                              <select 
                                value={assignments[op.id]?.startHour || '08:00'}
                                onChange={e => setAssignments({...assignments, [op.id]: { ...assignments[op.id], startHour: e.target.value }})}
                                className="w-full bg-white border-none rounded-lg py-2 px-2 text-[10px] font-black text-slate-700 outline-none shadow-sm"
                              >
                                {availableHours.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                           </div>
                           <ArrowRight className="w-4 h-4 text-slate-300 mt-4" />
                           <div className="flex-1">
                              <p className="text-[7px] font-black text-slate-400 uppercase mb-1 ml-1">Fin</p>
                              <select 
                                value={assignments[op.id]?.endHour || '18:00'}
                                onChange={e => setAssignments({...assignments, [op.id]: { ...assignments[op.id], endHour: e.target.value }})}
                                className="w-full bg-white border-none rounded-lg py-2 px-2 text-[10px] font-black text-slate-700 outline-none shadow-sm"
                              >
                                {availableHours.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                           </div>
                        </div>
                        
                        {assignments[op.id]?.empId && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-600 text-[8px] font-black uppercase animate-in slide-in-from-top-1">
                             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                             Mission Assignée ({assignments[op.id].startHour} - {assignments[op.id].endHour})
                          </div>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-indigo-600" />
                  Gamme Opératoire : {selectedCmd?.modele}
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setQrPost(null);
                      setShowQrModal(true);
                    }}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer QR
                  </button>
                  <button 
                    onClick={() => setShowOpModal(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Ajouter un poste
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {modelOps.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase">Aucun poste défini pour ce modèle</p>
                  </div>
                ) : (
                  modelOps.map((op, idx) => (
                    <div key={op.id} className="flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl transition-all border border-transparent hover:border-slate-200 group">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm border border-slate-100">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase">{op.nom_operation}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Cible : {op.target_heure} pcs / heure</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setQrPost(op);
                            setShowQrModal(true);
                          }}
                          className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Générer QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOp(op.id)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                <Timer className="w-5 h-5 text-indigo-400" />
                Résumé Gamme
              </h3>
              <div className="space-y-6">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Nombre de postes</p>
                  <p className="text-2xl font-black">{modelOps.length}</p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Capacité Max (H)</p>
                  <p className="text-2xl font-black">{modelOps.length > 0 ? Math.min(...modelOps.map(o => o.target_heure)) : 0} pcs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suivi' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 md:px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              Saisie par Heure ({today})
            </h2>
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
              <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setActiveShift('jour')}
                  className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeShift === 'jour' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {isAr ? 'النهار' : 'Jour'}
                </button>
                <button
                  onClick={() => setActiveShift('nuit')}
                  className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeShift === 'nuit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {isAr ? 'الليل' : 'Nuit'}
                </button>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] md:text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 sticky top-0 z-[30]">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky left-0 bg-slate-50 z-10 w-48">
                    Heure
                  </th>
                  {modelOps.map(op => (
                    <th key={op.id} className="px-4 py-6 text-xs md:text-sm font-black text-slate-900 uppercase tracking-tighter border-b border-slate-200 border-l border-slate-100 bg-slate-50/80">
                      <div className="flex flex-col">
                        <span className="leading-none">{op.nom_operation}</span>
                        <span className="text-[10px] md:text-xs text-indigo-600 mt-1 font-bold">Cible: {op.target_heure}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHours.map(tranche => (
                  <tr key={tranche} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-4 font-black text-slate-500 text-xs tabular-nums sticky left-0 bg-white z-10 border-r border-slate-100 shadow-sm">
                      {tranche}
                    </td>
                    {modelOps.map(op => {
                      const prod = getProduction(op.id, tranche.split(' - ')[0]);
                      const isBelowTarget = prod && prod.quantite_realisee < op.target_heure;
                      return (
                        <td key={op.id} className="px-4 py-4 border-l border-slate-100">
                          <div className="space-y-3">
                            <select 
                              value={prod?.employe_id || ''}
                              onChange={e => handleUpdateSuivi(op.id, e.target.value, tranche, prod?.quantite_realisee || 0)}
                              className="w-full bg-slate-100 border-none rounded-xl text-xs font-black text-slate-800 py-3 px-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
                            >
                              <option value="">Ouvrier</option>
                              {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                            </select>
                            <input 
                              type="number"
                              value={prod?.quantite_realisee ?? ''}
                              onChange={e => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                handleUpdateSuivi(op.id, prod?.employe_id || '', tranche, val);
                              }}
                              placeholder="Qté"
                              className={`w-full px-3 py-2.5 rounded-xl text-sm font-black tabular-nums outline-none transition-all border-2 ${
                                !prod ? 'bg-white border-slate-100 text-slate-400' :
                                isBelowTarget ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              }`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white">
                <tr>
                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                    Total Quotidien
                  </td>
                  {modelOps.map(op => {
                    const totalOp = todaySuivi
                      .filter(s => s.operation_id === op.id)
                      .reduce((a, b) => a + b.quantite_realisee, 0);
                    return (
                      <td key={op.id} className="px-4 py-6 border-l border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-xl font-black tabular-nums">{totalOp}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Pièces</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="block md:hidden p-4 space-y-6">
            {modelOps.map(op => {
              const totalOp = todaySuivi
                .filter(s => s.operation_id === op.id)
                .reduce((a, b) => a + b.quantite_realisee, 0);
              
              return (
                <div key={op.id} className="bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 bg-white border-b-2 border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter">{op.nom_operation}</h3>
                      <p className="text-xs font-bold text-indigo-600 uppercase">Cible: {op.target_heure} pcs/h</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-600 uppercase">Total</p>
                      <p className="text-2xl font-black text-slate-900">{totalOp}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 overflow-x-auto flex gap-4 scrollbar-hide bg-slate-50/50">
                    {filteredHours.map(tranche => {
                      const prod = getProduction(op.id, tranche.split(' - ')[0]);
                      const isBelowTarget = prod && prod.quantite_realisee < op.target_heure;
                      
                      return (
                        <div key={tranche} className="flex-none w-32 space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black text-slate-500 text-center border-b border-slate-50 pb-2 mb-2">
                            {tranche.split(' - ')[0]}
                          </p>
                          
                          <select 
                            value={prod?.employe_id || ''}
                            onChange={e => handleUpdateSuivi(op.id, e.target.value, tranche, prod?.quantite_realisee || 0)}
                            className="w-full bg-slate-100 border-none rounded-xl text-xs font-black text-slate-900 py-3 px-2 outline-none shadow-sm"
                          >
                            <option value="">Ouvrier</option>
                            {employes.map(e => <option key={e.id} value={e.id}>{e.prenom}</option>)}
                          </select>
                          
                          <input 
                            type="number"
                            value={prod?.quantite_realisee ?? ''}
                            onChange={e => {
                              const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                              handleUpdateSuivi(op.id, prod?.employe_id || '', tranche, val);
                            }}
                            placeholder="Qté"
                            className={`w-full px-3 py-2 rounded-xl text-center text-sm font-black tabular-nums outline-none border-2 ${
                              !prod ? 'bg-slate-50 border-transparent text-slate-400' :
                              isBelowTarget ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelOps.map(op => {
            const opSuivi = todaySuivi.filter(s => s.operation_id === op.id);
            const total = opSuivi.reduce((a, b) => a + b.quantite_realisee, 0);
            const avg = opSuivi.length > 0 ? total / opSuivi.length : 0;
            const perf = (avg / op.target_heure) * 100;
            
            return (
              <div key={op.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-8 -mt-8 transition-transform group-hover:scale-110 ${
                  perf >= 100 ? 'text-emerald-500' : perf >= 70 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  <TrendingUp className="w-full h-full" />
                </div>

                <h3 className="text-sm font-black text-slate-800 uppercase mb-6">{op.nom_operation}</h3>
                
                <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficience</p>
                      <p className={`text-4xl font-black tabular-nums ${
                        perf >= 100 ? 'text-emerald-600' : perf >= 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>{Math.round(perf)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Moyenne</p>
                      <p className="text-xl font-black text-slate-800 tabular-nums">{Math.round(avg)}/h</p>
                    </div>
                  </div>

                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        perf >= 100 ? 'bg-emerald-500' : perf >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, perf)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl">
                    <CheckCircle2 className={`w-4 h-4 ${perf >= 100 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {perf >= 100 ? 'Objectif Atteint' : `Manque ${Math.max(0, op.target_heure - Math.round(avg))} pcs/h`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Operation Modal */}
      {showOpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-md shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Nouveau Poste</h2>
              <button onClick={() => setShowOpModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom de l'opération (Poste)</label>
                <input 
                  autoFocus
                  value={opForm.nom_operation || ''} 
                  onChange={e => setOpForm({...opForm, nom_operation: e.target.value})} 
                  placeholder="Ex: Jib, Ourlet, Montage..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Objectif de Production (Pièces / Heure)</label>
                <input 
                  type="number"
                  value={opForm.target_heure || ''} 
                  onChange={e => setOpForm({...opForm, target_heure: parseInt(e.target.value) || 0})} 
                  placeholder="40"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all" 
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50">
              <button 
                onClick={handleAddOperation}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                Confirmer le poste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Codes QR de Production</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Scannez pour enregistrer la production</p>
              </div>
              <button onClick={() => setShowQrModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50" id="qr-print-area">
              {(qrPost ? [qrPost] : modelOps).map(op => (
                <div key={op.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
                  <div className="mb-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <QRCodeSVG 
                      value={`beya-prod://${selectedCmdId}/${op.id}`} 
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs font-black text-slate-800 uppercase mb-1">{op.nom_operation}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">{selectedCmd?.reference} — {selectedCmd?.modele}</p>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100">
                    ID: {op.id.slice(0,8)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                <Printer className="w-5 h-5" />
                Imprimer les codes
              </button>
              <button 
                onClick={() => setShowQrModal(false)}
                className="flex-1 h-16 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
