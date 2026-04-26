import { useState, useEffect } from 'react';
import { Factory, ArrowRight, ArrowLeft, Clock, Package, TriangleAlert } from 'lucide-react';
import {
  Commande, loadData, saveRecord, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, Phase,
} from '../types';

export default function ChaineDeMontage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  useEffect(() => { loadData<Commande>('commandes').then(setCommandes); }, []);

  const enCours = commandes.filter(c => c.statut !== 'livré' && c.phase !== 'coupe');
  const filtered = selectedPhase === 'all' ? enCours : enCours.filter(c => c.phase === selectedPhase);

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

      {/* Tableau Résumé */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500" />
            Résumé des Commandes en Production
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

      {/* Pipeline Visual */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Factory className="w-4 h-4 text-indigo-500" />
          Pipeline de Production
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PHASE_ORDER.map((phase, idx) => {
            const stat = phaseStats.find(s => s.phase === phase);
            return (
              <div key={phase} className="flex items-center gap-2 min-w-fit">
                <button
                  onClick={() => setSelectedPhase(selectedPhase === phase ? 'all' : phase)}
                  className={`flex flex-col items-center px-5 py-4 rounded-xl border-2 transition-all min-w-[120px] ${selectedPhase === phase
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                >
                  <div className={`w-3 h-3 rounded-full ${PHASE_COLORS[phase]} mb-2`} />
                  <span className="text-xs font-semibold text-slate-700">{PHASE_LABELS[phase]}</span>
                  <span className="text-lg font-bold text-slate-800 mt-1">{stat?.count || 0}</span>
                  <span className="text-[10px] text-slate-400">{stat?.pieces || 0} pièces</span>
                </button>
                {idx < PHASE_ORDER.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
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

        {filtered.map(cmd => {
          const phaseIdx = PHASE_ORDER.indexOf(cmd.phase);
          const canAdvance = phaseIdx < PHASE_ORDER.length - 1;
          const canGoBack = phaseIdx > 0;
          const nextPhase = canAdvance ? PHASE_ORDER[phaseIdx + 1] : null;
          const prevPhase = canGoBack ? PHASE_ORDER[phaseIdx - 1] : null;
          const jPhase = joursEnPhase(cmd);
          const jTotal = joursDepuis(cmd.dateCommande);
          const jRest = joursRestants(cmd);
          const attenteCouleur = jPhase >= 14 ? 'bg-red-100 text-red-700 border-red-200'
            : jPhase >= 7 ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-green-100 text-green-700 border-green-200';
          const resteCouleur = jRest < 0 ? 'text-red-600' : jRest <= 3 ? 'text-amber-600' : 'text-green-600';
          return (
            <div key={cmd.id} className={`bg-white rounded-xl border shadow-sm p-5 ${jRest < 0 ? 'border-red-300' : 'border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">{cmd.reference}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PHASE_COLORS[cmd.phase]} text-white`}>
                      {PHASE_LABELS[cmd.phase]}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${attenteCouleur}`}>
                      <Clock className="w-3 h-3" />
                      {jPhase === 0 ? "Aujourd'hui" : `${jPhase}j dans cette phase`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-1">
                    <span>{cmd.modele} · {cmd.client} · {cmd.quantite} pièces</span>
                    <span className="text-slate-400">|</span>
                    <span>En prod depuis <strong className="text-slate-700">{jTotal}j</strong></span>
                    <span className="text-slate-400">|</span>
                    <span className={`font-semibold ${resteCouleur}`}>
                      {jRest < 0 ? `${Math.abs(jRest)}j de retard` : jRest === 0 ? 'Livraison aujourd\'hui' : `${jRest}j restants`}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                      {PHASE_ORDER.map((p, i) => (
                        <div key={p} className="flex-1 flex items-center gap-1">
                          <div className={`h-2 flex-1 rounded-full ${i <= phaseIdx ? PHASE_COLORS[p] : 'bg-slate-200'}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      {PHASE_ORDER.map(p => <span key={p}>{PHASE_LABELS[p]}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canGoBack && (
                    <button
                      onClick={() => updatePhase(cmd.id, prevPhase!)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition font-medium border border-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour en {PHASE_LABELS[prevPhase!]}
                    </button>
                  )}
                  {canAdvance && (
                    <button
                      onClick={() => updatePhase(cmd.id, nextPhase!)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-medium shadow-sm"
                    >
                      Passer en {PHASE_LABELS[nextPhase!]}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Livraison prévue</p>
                    <p className="text-sm font-medium text-slate-700">{cmd.dateLivraisonPrevue}</p>
                  </div>
                </div>
              </div>

              {/* Historique */}
              {cmd.suivi.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Historique</p>
                  <div className="flex flex-wrap gap-2">
                    {cmd.suivi.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 text-xs">
                        <div className={`w-2 h-2 rounded-full ${PHASE_COLORS[s.phase]}`} />
                        <span className="font-medium text-slate-700">{PHASE_LABELS[s.phase]}</span>
                        <span className="text-slate-400">{s.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
            <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune commande dans cette phase</p>
          </div>
        )}
      </div>
    </div>
  );
}
