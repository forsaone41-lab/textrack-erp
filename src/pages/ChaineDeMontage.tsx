import { useState, useEffect } from 'react';
import { Factory, ArrowRight, ArrowLeft, Clock, Package, TriangleAlert, ClipboardCheck, X } from 'lucide-react';
import {
  Commande, PointageEntry, Employe, loadData, saveRecord, genId, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, Phase,
} from '../types';

export default function ChaineDeMontage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [showPointageModal, setShowPointageModal] = useState(false);
  const [ptForm, setPtForm] = useState<Partial<PointageEntry>>({});
  const [selectedCmd, setSelectedCmd] = useState<Commande | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { 
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<PointageEntry>('pointages'),
      loadData<Employe>('employes')
    ]).then(([cmds, pts, emps]) => {
      setCommandes(cmds);
      setPointages(pts);
      setEmployes(emps);
    });
  }, []);

  function openPointage(c: Commande) {
    setSelectedCmd(c);
    setPtForm({
      id: genId(),
      commandeId: c.id,
      date: today,
      phase: c.phase,
      piecesCompletees: 0,
      rebut: 0,
      retouche: 0
    });
    setShowPointageModal(true);
  }

  async function savePointage() {
    if (!ptForm.employeId || !ptForm.piecesCompletees || !selectedCmd) return;
    const entry = ptForm as PointageEntry;
    setPointages([...pointages, entry]);
    setShowPointageModal(false);
    await saveRecord('pointages', entry);
  }

  async function updatePhase(cmdId: string, newPhase: Phase) {
    let updatedCmd: Commande | null = null;
    const updated = commandes.map(c => {
      if (c.id === cmdId) {
        const newSuivi = [...c.suivi, { phase: newPhase, date: new Date().toISOString().split('T')[0], note: `Passé en ${PHASE_LABELS[newPhase]}` }];
        const c2 = { ...c, phase: newPhase, suivi: newSuivi, statut: newPhase === 'livré' ? 'livré' as const : 'en_cours' as const, quantiteLivre: newPhase === 'livré' ? c.quantite : c.quantiteLivre };
        updatedCmd = c2;
        return c2;
      }
      return c;
    });
    setCommandes(updated);
    if (updatedCmd) await saveRecord('commandes', updatedCmd);
  }

  function joursDepuis(dateStr: string): number {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function joursEnPhase(cmd: Commande): number {
    const dernierSuivi = [...cmd.suivi].reverse().find(s => s.phase === cmd.phase);
    return dernierSuivi ? joursDepuis(dernierSuivi.date) : joursDepuis(cmd.dateCommande);
  }

  function joursRestants(cmd: Commande): number {
    return Math.floor((new Date(cmd.dateLivraisonPrevue).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const enCours = commandes.filter(c => c.statut !== 'livré' && c.phase !== 'coupe');
  const filtered = selectedPhase === 'all' ? enCours : enCours.filter(c => c.phase === selectedPhase);

  const totalPiecesEnCours = enCours.reduce((a, c) => a + c.quantite, 0);
  const retardees = enCours.filter(c => joursRestants(c) < 0).length;
  const urgentes = enCours.filter(c => { const j = joursRestants(c); return j >= 0 && j <= 3; }).length;

  const phaseStats = PHASE_ORDER.map(phase => ({
    phase,
    label: PHASE_LABELS[phase],
    count: enCours.filter(c => c.phase === phase).length,
    pieces: enCours.filter(c => c.phase === phase).reduce((a, c) => a + c.quantite, 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Chaîne de Montage</h1>
        <p className="text-slate-500 text-sm">Suivi de la production poste par poste</p>
      </div>

      {/* KPI Cards - Redesigned PRO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
             <Factory className="w-20 h-20 text-indigo-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En Production</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-black text-slate-800 tabular-nums">{enCours.length}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Commandes</span>
          </div>
          <div className="mt-3 w-10 h-1 bg-indigo-500 rounded-full" />
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
             <Package className="w-20 h-20 text-blue-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pièces en cours</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-black text-blue-600 tabular-nums">{totalPiecesEnCours}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Unités</span>
          </div>
          <div className="mt-3 w-10 h-1 bg-blue-500 rounded-full" />
        </div>

        <div className={`rounded-[1.5rem] border p-5 shadow-sm transition-all relative overflow-hidden group ${retardees > 0 ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'}`}>
          <div className="absolute -right-2 -top-2 opacity-[0.05]">
             <TriangleAlert className={`w-20 h-20 ${retardees > 0 ? 'text-red-500' : 'text-slate-200'}`} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En Retard</p>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-3xl font-black tabular-nums ${retardees > 0 ? 'text-red-600' : 'text-slate-300'}`}>{retardees}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Retards</span>
          </div>
          <div className={`mt-3 w-10 h-1 rounded-full ${retardees > 0 ? 'bg-red-500' : 'bg-slate-200'}`} />
        </div>

        <div className={`rounded-[1.5rem] border p-5 shadow-sm transition-all relative overflow-hidden group ${urgentes > 0 ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-slate-100'}`}>
          <div className="absolute -right-2 -top-2 opacity-[0.05]">
             <Clock className={`w-20 h-20 ${urgentes > 0 ? 'text-amber-500' : 'text-slate-200'}`} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Urgentes</p>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-3xl font-black tabular-nums ${urgentes > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{urgentes}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Proches</span>
          </div>
          <div className={`mt-3 w-10 h-1 rounded-full ${urgentes > 0 ? 'bg-amber-500' : 'bg-slate-200'}`} />
        </div>
      </div>

      {/* SECTION: TABLEAU RÉSUMÉ PRO */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Résumé de Production</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tabular-nums">{enCours.length} Commandes</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[10px] font-black text-white uppercase tabular-nums shadow-md shadow-indigo-100">{totalPiecesEnCours} Pièces</span>
          </div>
        </div>
        
        {enCours.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Aucun flux de production actif</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Référence</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Client / Marque</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100">Phase</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100">Qté</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100">Attente</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100">Âge</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-100">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enCours.map(cmd => {
                const jP = joursEnPhase(cmd);
                const jT = joursDepuis(cmd.dateCommande);
                const jR = joursRestants(cmd);
                const atCouleur = jP >= 14 ? 'text-red-500' : jP >= 7 ? 'text-amber-500' : 'text-emerald-500';
                const delCouleur = jR < 0 ? 'text-red-600 bg-red-50' : jR <= 3 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
                return (
                  <tr key={cmd.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4">
                      <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{cmd.reference}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{cmd.client}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${PHASE_COLORS[cmd.phase]} text-white shadow-sm`}>
                        {PHASE_LABELS[cmd.phase]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-black text-slate-700 tabular-nums">{cmd.quantite}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-black tabular-nums ${atCouleur}`}>{jP === 0 ? "Auj." : `${jP}j`}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-bold text-slate-400 tabular-nums">{jT}j</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tabular-nums shadow-sm ${delCouleur}`}>
                        {jR < 0 ? `RETARD ${Math.abs(jR)}J` : jR === 0 ? 'AUJOURD\'HUI' : `+${jR}J`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 border-t border-slate-800">
              <tr>
                <td colSpan={3} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Total du Flux Actif
                </td>
                <td className="px-4 py-5 text-center text-lg font-black text-white tabular-nums border-x border-slate-800">
                  {totalPiecesEnCours}
                </td>
                <td colSpan={3} className="px-8 py-5 text-right text-[10px] font-bold text-slate-500 italic uppercase">
                  {enCours.length} Commandes en cours
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* SECTION: VUE MOBILE CARDS (VISIBLE SUR TÉLÉPHONE UNIQUEMENT) */}
      <div className="md:hidden space-y-4">
        <h3 className="text-sm font-bold text-slate-700 px-1">Commandes en production ({enCours.length})</h3>
        {enCours.map(cmd => {
          const jR = joursRestants(cmd);
          return (
            <div key={cmd.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${jR < 0 ? 'border-red-200 bg-red-50/20' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{cmd.reference}</p>
                  <p className="text-xs text-slate-500">{cmd.modele}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white ${PHASE_COLORS[cmd.phase]}`}>
                  {PHASE_LABELS[cmd.phase]}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Pièces</span>
                  <span className="font-bold text-indigo-600">{cmd.quantite} pcs</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Délai</span>
                  <span className={`font-bold ${jR < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                    {jR < 0 ? `Retard ${Math.abs(jR)}j` : `${jR}j restants`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Visual - PRO */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
             <div className="bg-slate-900 p-2.5 rounded-[1rem] shadow-lg shadow-slate-200">
                <Factory className="w-5 h-5 text-white" />
             </div>
             <div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em] leading-none mb-1.5">Flux de Production</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Répartition temps réel des commandes par poste</p>
             </div>
          </div>
          <button 
            onClick={() => setSelectedPhase('all')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${selectedPhase === 'all' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
          >
            Vue d'ensemble
          </button>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {PHASE_ORDER.map((phase, idx) => {
            const stat = phaseStats.find(s => s.phase === phase);
            const isActive = selectedPhase === phase;
            return (
              <div key={phase} className="flex items-center gap-4 min-w-fit">
                <button
                  onClick={() => setSelectedPhase(isActive ? 'all' : phase)}
                  className={`relative flex flex-col items-center p-6 rounded-[1.75rem] border-2 transition-all min-w-[135px] group ${isActive
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xl shadow-indigo-100'
                      : 'border-slate-50 hover:border-indigo-100 bg-white hover:shadow-xl hover:shadow-slate-100/50'
                    }`}
                >
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${PHASE_COLORS[phase]} shadow-sm group-hover:scale-125 transition-transform`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest mb-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{PHASE_LABELS[phase]}</span>
                  <span className={`text-3xl font-black tabular-nums leading-none mb-3 ${isActive ? 'text-indigo-800' : 'text-slate-800'}`}>{stat?.count || 0}</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-colors ${
                    isActive ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}>
                     <Package className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                     <span className="text-[11px] font-black tabular-nums uppercase tracking-tight">
                       {stat?.pieces || 0} <span className="opacity-70">pcs</span>
                     </span>
                  </div>
                </button>
                {idx < PHASE_ORDER.length - 1 && (
                  <div className="flex flex-col items-center opacity-10">
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Commandes dans la phase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            {selectedPhase === 'all' ? 'Toutes les commandes en cours' : `Phase: ${PHASE_LABELS[selectedPhase as Phase]}`}
            <span className="ml-2 text-slate-400 font-normal">({filtered.length} commandes)</span>
          </h3>
          {selectedPhase !== 'all' && (
            <button onClick={() => setSelectedPhase('all')} className="text-xs text-indigo-600 hover:text-indigo-700">Voir tout</button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(cmd => {
            const phaseIdx = PHASE_ORDER.indexOf(cmd.phase);
            const canAdvance = phaseIdx < PHASE_ORDER.length - 1;
            const canGoBack = phaseIdx > 0;
            const nextPhase = canAdvance ? PHASE_ORDER[phaseIdx + 1] : null;
            const prevPhase = canGoBack ? PHASE_ORDER[phaseIdx - 1] : null;
            const jPhase = joursEnPhase(cmd);
            const jRest = joursRestants(cmd);
            const attenteCouleur = jPhase >= 14 ? 'bg-red-100 text-red-700 border-red-200'
              : jPhase >= 7 ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-green-100 text-green-700 border-green-200';
            
            const cmdPointages = pointages.filter(p => p.commandeId === cmd.id && p.phase === cmd.phase);
            const piecesProduites = cmdPointages.reduce((a, p) => a + p.piecesCompletees, 0);
            const rebutTotal = cmdPointages.reduce((a, p) => a + p.rebut, 0);
            const retoucheTotal = cmdPointages.reduce((a, p) => a + p.retouche, 0);

            return (
              <div key={cmd.id} className={`bg-white rounded-2xl border shadow-sm p-4 md:p-6 ${jRest < 0 ? 'border-red-300' : 'border-slate-200'}`}>
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm md:text-base font-bold text-slate-800 truncate">{cmd.reference}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${PHASE_COLORS[cmd.phase]} text-white shadow-sm`}>
                          {PHASE_LABELS[cmd.phase]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">{cmd.modele} · {cmd.client}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`px-4 py-2 rounded-2xl border-2 flex flex-col items-center justify-center animate-pulse-slow ${
                        jRest < 0 ? 'bg-red-50 border-red-500 text-red-600' :
                        jRest <= 3 ? 'bg-amber-50 border-amber-500 text-amber-600' :
                        'bg-emerald-50 border-emerald-500 text-emerald-600'
                      }`}>
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">Délai Final</span>
                        <p className="text-lg font-black leading-none mt-1">{cmd.dateLivraisonPrevue}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {jRest < 0 ? `Retard: ${Math.abs(jRest)}j` : jRest === 0 ? 'Aujourd\'hui !' : `${jRest}j restants`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      {PHASE_ORDER.map((p, i) => (
                        <div key={p} className={`h-1.5 flex-1 rounded-full ${i <= phaseIdx ? PHASE_COLORS[p] : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span>{PHASE_LABELS[PHASE_ORDER[0]]}</span>
                      <span>{PHASE_LABELS[PHASE_ORDER[PHASE_ORDER.length-1]]}</span>
                    </div>
                  </div>

                  {/* Quality Scorecard - Redesigned PRO */}
                  <div className="bg-slate-50/80 rounded-[1.5rem] border border-slate-100 p-4 shadow-inner">
                    <div className="flex items-center justify-between gap-2">
                       <div className="flex-1 text-center py-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Bonnes</span>
                         <span className="text-xl font-black text-indigo-600 tabular-nums leading-none">{piecesProduites}</span>
                       </div>
                       <div className="w-px h-8 bg-slate-200" />
                       <div className="flex-1 text-center py-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Rebut</span>
                         <span className="text-xl font-black text-red-600 tabular-nums leading-none">{rebutTotal}</span>
                       </div>
                       <div className="w-px h-8 bg-slate-200" />
                       <div className="flex-1 text-center py-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Retouche</span>
                         <span className="text-xl font-black text-amber-600 tabular-nums leading-none">{retoucheTotal}</span>
                       </div>
                       <div className="w-px h-8 bg-indigo-200" />
                       <div className="flex-[1.3] text-center bg-indigo-600 rounded-xl py-2 shadow-lg shadow-indigo-100 border border-indigo-500">
                         <span className="text-[8px] font-black text-indigo-100 uppercase tracking-widest mb-1 block">Total Phase</span>
                         <span className="text-xl font-black text-white tabular-nums leading-none">{piecesProduites + rebutTotal + retoucheTotal}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${attenteCouleur}`}>
                          <Clock className="w-3 h-3" />
                          {jPhase === 0 ? "Aujourd'hui" : `${jPhase}j en phase`}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">{cmd.quantite} <span className="text-[10px] text-slate-400 uppercase tracking-tight">Pièces Total</span></span>
                      </div>
                    </div>

                    {/* Pointage Button - Premium & Breathable */}
                    <button 
                      onClick={() => openPointage(cmd)}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all border border-blue-400/20 px-6"
                    >
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                      POINTAGE PRODUCTION
                    </button>

                    <div className="flex items-center gap-2">
                      {canGoBack && (
                        <button
                          onClick={() => updatePhase(cmd.id, prevPhase!)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-4 border-2 border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                          title={`Retour en ${PHASE_LABELS[prevPhase!]}`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      )}
                      {canAdvance && (
                        <button
                          onClick={() => updatePhase(cmd.id, nextPhase!)}
                          className="flex-[3] flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-black transition-all uppercase tracking-widest"
                        >
                          Démarrer {PHASE_LABELS[nextPhase!]} <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Production History Summary */}
                  {cmd.suivi.length > 0 && (
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Parcours de production</p>
                      <div className="flex flex-wrap gap-2">
                        {cmd.suivi.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1 text-[10px] border border-slate-100">
                            <div className={`w-1.5 h-1.5 rounded-full ${PHASE_COLORS[s.phase]}`} />
                            <span className="font-bold text-slate-600">{PHASE_LABELS[s.phase]}</span>
                            <span className="text-slate-400 tabular-nums">{s.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-xs font-bold uppercase tracking-widest">Aucune commande dans cette phase</p>
          </div>
        )}
      </div>
      {/* Pointage Modal */}
      {showPointageModal && selectedCmd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-10 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Nouveau Pointage</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Phase: {PHASE_LABELS[selectedCmd.phase]}</p>
              </div>
              <button onClick={() => setShowPointageModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Ouvrier / Sous-traitant</label>
                <select 
                  value={ptForm.employeId || ''} 
                  onChange={e => setPtForm({ ...ptForm, employeId: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                >
                  <option value="">— Sélectionner —</option>
                  {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} ({e.poste})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-indigo-600">Pièces Réussies (Bonnes)</label>
                <input 
                  type="number" 
                  value={ptForm.piecesCompletees || ''} 
                  onChange={e => setPtForm({ ...ptForm, piecesCompletees: parseInt(e.target.value) || 0 })}
                  className="w-full px-5 py-4 border-2 border-indigo-50 rounded-2xl text-sm font-bold outline-none bg-indigo-50/30 focus:bg-white focus:border-indigo-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-red-500">Perdues (Rebut)</label>
                  <input 
                    type="number" 
                    value={ptForm.rebut || ''} 
                    onChange={e => setPtForm({ ...ptForm, rebut: parseInt(e.target.value) || 0 })}
                    className="w-full px-5 py-4 border-2 border-red-50 rounded-2xl text-sm font-bold outline-none bg-red-50/30 focus:bg-white focus:border-red-500 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-amber-500">À Refaire (Retouche)</label>
                  <input 
                    type="number" 
                    value={ptForm.retouche || ''} 
                    onChange={e => setPtForm({ ...ptForm, retouche: parseInt(e.target.value) || 0 })}
                    className="w-full px-5 py-4 border-2 border-amber-50 rounded-2xl text-sm font-bold outline-none bg-amber-50/30 focus:bg-white focus:border-amber-500 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Date</label>
                <input 
                  type="date" 
                  value={ptForm.date || ''} 
                  onChange={e => setPtForm({ ...ptForm, date: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => setShowPointageModal(false)} 
                className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={savePointage} 
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
