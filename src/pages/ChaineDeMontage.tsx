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
      rebut: 0
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-slate-500">En production</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">{enCours.length}</p>
          <p className="text-xs text-slate-400">commandes actives</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">Pièces en cours</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{totalPiecesEnCours}</p>
          <p className="text-xs text-slate-400">pièces à produire</p>
        </div>
        <div className={`rounded-xl border p-4 ${retardees > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <TriangleAlert className={`w-4 h-4 ${retardees > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            <span className="text-xs text-slate-500">En retard</span>
          </div>
          <p className={`text-2xl font-bold ${retardees > 0 ? 'text-red-600' : 'text-slate-400'}`}>{retardees}</p>
          <p className="text-xs text-slate-400">date dépassée</p>
        </div>
        <div className={`rounded-xl border p-4 ${urgentes > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${urgentes > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="text-xs text-slate-500">Urgentes</span>
          </div>
          <p className={`text-2xl font-bold ${urgentes > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{urgentes}</p>
          <p className="text-xs text-slate-400">livraison ≤ 3 jours</p>
        </div>
      </div>

      {/* SECTION: TABLEAU RÉSUMÉ (VISIBLE SUR PC UNIQUEMENT) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500" />
            Résumé des Commandes (Vue PC)
          </h3>
          <span className="text-xs text-slate-400">{enCours.length} commandes · {totalPiecesEnCours} pièces</span>
        </div>
        {enCours.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucune commande en cours</p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Commande</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Phase</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Pièces</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Attente phase</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total prod</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Délai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enCours.map(cmd => {
                const jP = joursEnPhase(cmd);
                const jT = joursDepuis(cmd.dateCommande);
                const jR = joursRestants(cmd);
                const atCouleur = jP >= 14 ? 'text-red-600 font-bold' : jP >= 7 ? 'text-amber-600 font-semibold' : 'text-green-600';
                const delCouleur = jR < 0 ? 'text-red-600 font-bold' : jR <= 3 ? 'text-amber-600 font-semibold' : 'text-green-600';
                return (
                  <tr key={cmd.id} className={`hover:bg-slate-50 transition-colors ${jR < 0 ? 'bg-red-50/40' : ''}`}>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-800">{cmd.reference}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{cmd.client}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PHASE_COLORS[cmd.phase]} text-white`}>
                        {PHASE_LABELS[cmd.phase]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-indigo-600">{cmd.quantite}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className={atCouleur}>{jP === 0 ? "auj." : `${jP}j`}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">{jT}j</td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className={delCouleur}>
                        {jR < 0 ? `−${Math.abs(jR)}j` : jR === 0 ? 'auj.' : `+${jR}j`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-indigo-50 border-t-2 border-indigo-200">
              <tr>
                <td colSpan={3} className="px-5 py-3 text-sm font-bold text-indigo-700">
                  TOTAL — {enCours.length} commandes
                </td>
                <td className="px-4 py-3 text-center text-sm font-bold text-indigo-700">{totalPiecesEnCours}</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-indigo-700">
                  {enCours.reduce((a, c) => a + joursEnPhase(c), 0)}j
                </td>
                <td className="px-4 py-3 text-center text-sm font-bold text-indigo-700">
                  {enCours.reduce((a, c) => a + joursDepuis(c.dateCommande), 0)}j
                </td>
                <td className="px-4 py-3" />
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

      {/* Pipeline Visual */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Factory className="w-4 h-4 text-indigo-500" />
          Pipeline de Production
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {PHASE_ORDER.map((phase, idx) => {
            const stat = phaseStats.find(s => s.phase === phase);
            return (
              <div key={phase} className="flex items-center gap-2 min-w-fit">
                <button
                  onClick={() => setSelectedPhase(selectedPhase === phase ? 'all' : phase)}
                  className={`flex flex-col items-center px-4 py-3 md:px-5 md:py-4 rounded-xl border-2 transition-all min-w-[100px] md:min-w-[120px] ${selectedPhase === phase
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                >
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${PHASE_COLORS[phase]} mb-2`} />
                  <span className="text-[10px] md:text-xs font-semibold text-slate-700">{PHASE_LABELS[phase]}</span>
                  <span className="text-base md:text-lg font-bold text-slate-800 mt-1">{stat?.count || 0}</span>
                </button>
                {idx < PHASE_ORDER.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
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
            const resteCouleur = jRest < 0 ? 'text-red-600' : jRest <= 3 ? 'text-amber-600' : 'text-green-600';
            return (
              <div key={cmd.id} className={`bg-white rounded-2xl border shadow-sm p-4 md:p-6 ${jRest < 0 ? 'border-red-300' : 'border-slate-200'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm md:text-base font-bold text-slate-800 truncate">{cmd.reference}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${PHASE_COLORS[cmd.phase]} text-white`}>
                          {PHASE_LABELS[cmd.phase]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{cmd.modele} · {cmd.client}</p>
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
                          <span className="text-xs font-bold uppercase">
                            {jRest < 0 ? `Retard: ${Math.abs(jRest)}j` : jRest === 0 ? 'Aujourd\'hui !' : `${jRest}j restants`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-friendly Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {PHASE_ORDER.map((p, i) => (
                        <div key={p} className={`h-1.5 flex-1 rounded-full ${i <= phaseIdx ? PHASE_COLORS[p] : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between text-[8px] md:text-[10px] text-slate-400 font-bold uppercase">
                      <span>{PHASE_LABELS[PHASE_ORDER[0]]}</span>
                      <span>{PHASE_LABELS[PHASE_ORDER[PHASE_ORDER.length-1]]}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${attenteCouleur}`}>
                        <Clock className="w-3 h-3" />
                        {jPhase === 0 ? "Auj." : `${jPhase}j phase`}
                      </span>
                      <span className="text-xs font-bold text-indigo-600">{cmd.quantite} pcs</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => openPointage(cmd)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        + Pointage
                      </button>

                      {canGoBack && (
                        <button
                          onClick={() => updatePhase(cmd.id, prevPhase!)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 border-2 border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {canAdvance && (
                        <button
                          onClick={() => updatePhase(cmd.id, nextPhase!)}
                          className="flex-[2] flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest"
                        >
                          Démarrer {PHASE_LABELS[nextPhase!]} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Historique - REPOSITIONNÉ CORRECTEMENT */}
                {cmd.suivi.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Historique de production</p>
                    <div className="flex flex-wrap gap-2">
                      {cmd.suivi.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1 text-[10px]">
                          <div className={`w-1.5 h-1.5 rounded-full ${PHASE_COLORS[s.phase]}`} />
                          <span className="font-bold text-slate-600">{PHASE_LABELS[s.phase]}</span>
                          <span className="text-slate-400">{s.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Pièces Finies</label>
                  <input 
                    type="number" 
                    value={ptForm.piecesCompletees || ''} 
                    onChange={e => setPtForm({ ...ptForm, piecesCompletees: parseInt(e.target.value) || 0 })}
                    className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                    placeholder="Ex: 50"
                  />
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
