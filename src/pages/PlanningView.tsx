import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Factory, 
  Printer, 
  ArrowLeft, 
  Clock, 
  Package, 
  User, 
  QrCode,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Commande, 
  Employe, 
  OperationModele, 
  SuiviHoraire, 
  loadData,
  PHASE_LABELS
} from '../types';
import { useLang } from '../contexts/LangContext';

export default function PlanningView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAr } = useLang();
  
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [operations, setOperations] = useState<OperationModele[]>([]);
  const [suivi, setSuivi] = useState<SuiviHoraire[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<Employe>('employes'),
      loadData<OperationModele>('operations_modele'),
      loadData<SuiviHoraire>('suivi_horaire')
    ]).then(([cmds, emps, ops, s]) => {
      setCommandes(cmds || []);
      setEmployes(emps || []);
      setOperations(ops || []);
      setSuivi(s || []);
      setLoading(false);
    });
  }, []);

  const cmd = useMemo(() => commandes.find(c => c.id === id), [commandes, id]);
  
  const modelOps = useMemo(() => 
    operations.filter(o => o.modele === cmd?.modele)
    .sort((a, b) => a.ordre_sequence - b.ordre_sequence), [operations, cmd]);

  const planningEntries = useMemo(() => 
    suivi.filter(s => s.commande_id === id && s.date_production === today), 
    [suivi, id, today]);

  // Group assignments by operation
  const assignments = useMemo(() => {
    const map: Record<string, { emp: Employe | undefined; start: string; end: string; target: number }> = {};
    modelOps.forEach(op => {
      const entries = planningEntries.filter(s => s.operation_id === op.id && s.employe_id);
      if (entries.length > 0) {
        const sorted = entries.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
        const emp = employes.find(e => e.id === entries[0].employe_id);
        map[op.id] = {
          emp,
          start: sorted[0].heure_debut,
          end: sorted[sorted.length - 1].heure_fin,
          target: entries.length * op.target_heure
        };
      }
    });
    return map;
  }, [modelOps, planningEntries, employes]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!cmd) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-800 uppercase">Commande non trouvée</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold">Retour</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 pb-20 print:bg-white print:pb-0" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Navbar - Hidden on print */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Fiche de Pilotage <span className="text-indigo-600 font-light italic">Atelier</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document non modifiable — Vue Production</p>
          </div>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
        >
          <Printer className="w-4 h-4" />
          {isAr ? 'طباعة' : 'Imprimer la Fiche'}
        </button>
      </div>

      <div className="max-w-[1000px] mx-auto p-4 md:p-10 space-y-8 print:p-0 print:max-w-full">
        {/* Main Document Header */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm overflow-hidden relative print:border-none print:shadow-none print:rounded-none print:p-0">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 print:hidden" />
           
           <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                    <Factory className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{cmd.reference}</h2>
                    <p className="text-indigo-600 text-sm font-black uppercase tracking-widest mt-1">{cmd.modele}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Production</p>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        {today}
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phase Actuelle</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="text-sm font-black text-slate-800 uppercase italic">Montage</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center min-w-[200px] print:bg-white print:border-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Objectif Quotidien</p>
                 <p className="text-5xl font-black text-slate-900 tabular-nums">{cmd.quantite}</p>
                 <p className="text-xs font-bold text-slate-400 uppercase mt-1">Pièces Total</p>
              </div>
           </div>
        </div>

        {/* Planning Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
           <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4 print:bg-white print:px-0">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">{isAr ? 'توزيع المهام والوحدات' : 'Distribution des Missions'}</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white">
                   <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">#</th>
                   <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Poste / Opération</th>
                   <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Ouvrier Assigné</th>
                   <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Horaire</th>
                   <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Cible (PCS)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {modelOps.map((op, idx) => {
                   const detail = assignments[op.id];
                   return (
                     <tr key={op.id} className={!detail ? 'opacity-40 grayscale' : ''}>
                       <td className="px-10 py-6 text-sm font-black text-slate-300 tabular-nums">{idx + 1}</td>
                       <td className="px-6 py-6">
                         <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{op.nom_operation}</p>
                         <p className="text-[9px] font-bold text-indigo-400 uppercase">Vitesse: {op.target_heure} pc/h</p>
                       </td>
                       <td className="px-6 py-6">
                         {detail ? (
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-400" />
                              </div>
                              <span className="text-sm font-black text-slate-700 uppercase">{detail.emp?.prenom} {detail.emp?.nom}</span>
                           </div>
                         ) : (
                           <span className="text-xs font-bold text-slate-300 italic">Non assigné</span>
                         )}
                       </td>
                       <td className="px-6 py-6 text-center">
                         {detail ? (
                           <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black tabular-nums">
                             {detail.start} — {detail.end}
                           </span>
                         ) : '-'}
                       </td>
                       <td className="px-10 py-6 text-right">
                         {detail ? (
                           <span className="text-lg font-black text-slate-900 tabular-nums">{detail.target}</span>
                         ) : '0'}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>

        {/* Workstation QR Codes - The requested "QR DIAL LPOSTAT" */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm print:border-none print:shadow-none print:rounded-none print:p-0">
          <div className="flex items-center gap-4 mb-10 print:mb-6">
             <QrCode className="w-6 h-6 text-indigo-600" />
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{isAr ? 'بطاقات الباركود للمراكز' : 'QR Codes des Postes'}</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
            {modelOps.map((op, idx) => {
              const detail = assignments[op.id];
              // Data encoded in QR: Table:OperationID:CommandeID
              const qrData = `operations_modele:${op.id}:${cmd.id}`;
              
              return (
                <div key={op.id} className="border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col items-center text-center space-y-4 hover:border-indigo-200 transition-all print:border-slate-300 print:rounded-2xl">
                   <div className="w-full border-b border-slate-100 pb-3 mb-2 flex justify-between items-center">
                      <span className="w-6 h-6 bg-slate-900 text-white rounded-md text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Poste de Travail</span>
                   </div>
                   
                   <p className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-tight h-8 flex items-center justify-center">
                     {op.nom_operation}
                   </p>
                   
                   <div className="p-4 bg-white rounded-2xl border-2 border-slate-50 shadow-sm print:p-2 print:border-none">
                     <QRCodeSVG 
                       value={qrData}
                       size={120}
                       level="H"
                       includeMargin={false}
                     />
                   </div>
                   
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-600 uppercase">{detail?.emp?.prenom || 'N/A'}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{cmd.reference}</p>
                   </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - Verification Stamp */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 print:opacity-100">
           <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planification validée par le Pilotage</p>
           </div>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">BEYA ERP PRO • Document Généré le {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
