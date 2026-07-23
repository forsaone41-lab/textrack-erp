import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, ShoppingCart, FileText, Image as ImageIcon, Download, Ruler, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OrdreDeCoupe, StockTissu, FicheTechnique, Commande, loadData, saveRecord, deleteRecord, genId } from '../types';
import { printFicheTechnique } from '../utils/print';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

export default function OrdresDeCoupe() {
  const { lang, isAr } = useLang();
  const [ordres, setOrdres] = useState<OrdreDeCoupe[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;
  
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OrdreDeCoupe>>({});
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [viewMesuresFiche, setViewMesuresFiche] = useState<FicheTechnique | null>(null);
  const [checks, setChecks] = useState<Record<string, { patron?: boolean, fiche?: boolean, mesures?: boolean }>>({});
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Refresh only metadata (fiches, stock, commands)
    refreshMetadata();
    // Load initial orders
    loadOrders(0, true);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const refreshMetadata = () => {
    Promise.all([
      loadData<StockTissu>('tissus'),
      loadData<FicheTechnique>('fiches'),
      loadData<Commande>('commandes')
    ]).then(([tiss, fchs, cmds]) => {
      setTissus(tiss || []);
      setFiches(fchs || []);
      setCommandes(cmds || []);
    });
  };

  const loadOrders = async (pageIdx: number, reset: boolean = false) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const from = pageIdx * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = (window as any).supabase
        .from('ordres')
        .select('*')
        .order('dateCoupe', { ascending: false })
        .range(from, to);
      
      if (search) {
        query = query.or(`modele.ilike.%${search}%,client.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setOrdres(prev => reset ? data : [...prev, ...data]);
        setHasMore(data.length === ITEMS_PER_PAGE);
        setPage(pageIdx);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCommands = commandes.filter(c =>
    c.phase === 'coupe' &&
    !ordres.some(o => o.commandeId === c.id) &&
    c.statut !== 'livré'
  );

  const planifies = ordres.filter(o => o.statut === 'planifié');
  const actifEtTermines = ordres.filter(o => o.statut !== 'planifié');

  const toggleCheck = (orderId: string, key: 'patron' | 'fiche' | 'mesures') => {
    setChecks(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [key]: true }
    }));
  };

  const isFullyChecked = (orderId: string) => {
    const c = checks[orderId];
    return c?.patron && c?.fiche && c?.mesures;
  };

  const startCutting = async (o: OrdreDeCoupe) => {
    const updated = { ...o, statut: 'en_cours' as const };
    setOrdres(prev => prev.map(item => item.id === o.id ? updated : item));
    await saveRecord('ordres', updated);
  };

  const finishCutting = async (o: OrdreDeCoupe) => {
    const updated = { ...o, statut: 'terminé' as const };
    setOrdres(prev => prev.map(item => item.id === o.id ? updated : item));
    await saveRecord('ordres', updated);

    // AUTOMATIC STOCK DEDUCTION
    if (o.rollId && o.metrage > 0) {
      const roll = tissus.find(t => t.id === o.rollId);
      if (roll) {
        const updatedRoll = { 
          ...roll, 
          metrage: Math.max(0, Number((roll.metrage - o.metrage).toFixed(2))) 
        };
        // Update local state
        setTissus(prev => prev.map(t => t.id === roll.id ? updatedRoll : t));
        // Save to DB
        await saveRecord('tissus', updatedRoll).catch(err => console.error("Error updating stock:", err));
      }
    }

    const cmd = commandes.find(c => c.id === o.commandeId);
    if (cmd) {
      // Use "Clean Update" to preserve data (like externalTasks) but avoid payload issues
      const cleanCmd = { ...cmd };
      delete (cleanCmd as any).modelePhoto;
      delete (cleanCmd as any).tissuPhoto;
      delete (cleanCmd as any).preuveValidation;
      
      cleanCmd.phase = 'montage' as any;
      await saveRecord('commandes', cleanCmd);
    }
  };

  const statutBadge = (s: string) => {
    const map: Record<string, string> = {
      planifié: 'bg-slate-100 text-slate-600',
      en_cours: 'bg-blue-100 text-blue-700',
      terminé: 'bg-green-100 text-green-700',
    };
    return map[s] || 'bg-slate-100 text-slate-600';
  };

  const statutLabel = (s: string) => {
    const map: Record<string, string> = {
      planifié: t('status_planifie', lang),
      en_cours: t('status_en_cours_ordre', lang),
      terminé: t('status_termine_ordre', lang),
    };
    return map[s] || s;
  };

  function downloadFile(data: string, filename: string) {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleModeleChange = (val: string) => {
    const fiche = fiches.find(f => f.modele === val);
    const conso = fiche?.tissuConsommation || 0;
    const qty = form.quantite || 0;
    setForm({ ...form, modele: val, metrage: Number((conso * qty).toFixed(2)) });
  };

  const handleQtyChange = (val: number) => {
    const fiche = fiches.find(f => f.modele === form.modele);
    const conso = fiche?.tissuConsommation || 0;
    setForm({ ...form, quantite: val, metrage: Number((conso * val).toFixed(2)) });
  };

  async function save() {
    if (!form.modele) {
      setShowSuccess(isAr ? 'الموديل مطلوب' : 'Modèle requis');
      return;
    }
    
    // Ensure tissu is NEVER null to satisfy DB constraint
    const finalTissu = form.tissu || 'NON SPECIFIÉ';
    
    const isNew = !editId;
    const oId = editId || genId();
    const ordreData = { 
      ...form, 
      id: oId, 
      tissu: finalTissu,
      statut: form.statut || 'planifié',
      metrage: form.metrage || 0,
      quantite: form.quantite || 0,
      dateCoupe: (form as any).dateCoupe || new Date().toISOString().split('T')[0]
    } as OrdreDeCoupe;
    
    setOrdres(prev => isNew ? [...prev, ordreData] : prev.map(o => o.id === editId ? ordreData : o));
    setShowModal(false);
    
    try {
      await saveRecord('ordres', ordreData);
      setShowSuccess(isAr ? 'تم حفظ أمر القطع بنجاح' : 'Ordre de coupe enregistré avec succès');
    } catch (e: any) {
      setShowSuccess(isAr ? `خطأ في الحفظ: ${e.message}` : `Erreur de sauvegarde: ${e.message}`);
    }
  }

  async function handleReject() {
    if (!form.commandeId) return;
    if (!rejectReason.trim()) {
      setShowSuccess(isAr ? 'يرجى كتابة سبب الرفض' : 'Veuillez saisir la raison du refus');
      return;
    }

    const cmd = commandes.find(c => c.id === form.commandeId);
    if (cmd) {
      const updatedCmd = { 
        ...cmd, 
        phase: 'patronage' as any, // Send back to patronage
        statut: 'en_cours' as any,
        rejectionNote: rejectReason,
        suivi: [
          ...(cmd.suivi || []),
          { phase: 'coupe' as any, date: new Date().toISOString(), note: `REFUS: ${rejectReason}` }
        ]
      };
      
      // Remove photos to avoid payload issues if they exist as base64
      delete (updatedCmd as any).modelePhoto;
      delete (updatedCmd as any).tissuPhoto;
      delete (updatedCmd as any).preuveValidation;

      try {
        await saveRecord('commandes', updatedCmd);
        setCommandes(prev => prev.map(c => c.id === updatedCmd.id ? updatedCmd : c));
        setShowModal(false);
        setShowRejectForm(false);
        setRejectReason('');
        setShowSuccess(isAr ? 'تم رفض الطلبية وإعادتها للإدارة' : 'Ordre refusé et renvoyé à l\'administration');
      } catch (e: any) {
        setShowSuccess(`Erreur: ${e.message}`);
      }
    }
  }

  async function remove(id: string) {
    setOrdres(ordres.filter(o => o.id !== id));
    await deleteRecord('ordres', id);
  }

  const AssetsBlock = ({ fiche, orderId }: { fiche: FicheTechnique, orderId: string }) => (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{t('assets_docs', lang)}</p>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={!fiche.patronagePhoto}
            onClick={() => {
              downloadFile(fiche.patronagePhoto!, fiche.patronageFileName || `Patron_${fiche.modele}`);
              toggleCheck(orderId, 'patron');
            }}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all relative ${fiche.patronagePhoto
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200'
              : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
              }`}
          >
            <FileText className="w-3.5 h-3.5" /> PATRON {checks[orderId]?.patron && '✅'}
          </button>
          <button
            onClick={() => {
              printFicheTechnique(fiche);
              toggleCheck(orderId, 'fiche');
            }}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
          >
            <Download className="w-3.5 h-3.5" /> FICHE PDF {checks[orderId]?.fiche && '✅'}
          </button>
        </div>
        <button
          onClick={() => {
            setViewMesuresFiche(fiche);
            toggleCheck(orderId, 'mesures');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-50 hover:border-indigo-500 transition-all shadow-sm"
        >
          <Ruler className="w-3.5 h-3.5" /> {t('voir_mesures', lang)} {checks[orderId]?.mesures && '✅'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('ordres', lang)}</h1>
          <p className="text-slate-500 text-sm">{t('ordres_subtitle', lang)}</p>
        </div>
      </div>

      {/* SECTION 1: FILE D'ATTENTE (À FAIRE) - BOX LFOQ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 leading-none">{t('file_attente', lang)}</h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{(planifies.length + pendingCommands.length)} {t('ordres_attente', lang)}</p>
          </div>
        </div>

        {(planifies.length > 0 || pendingCommands.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* NEW COMMANDS FROM MASTER SETUP */}
            {pendingCommands.map(c => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === c.modele.toLowerCase());
              return (
                <div key={c.id} className="bg-indigo-50/50 border-2 border-indigo-200 border-dashed rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/5 flex flex-col hover:border-indigo-400 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4"><span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse">NOUVEAU</span></div>
                  <div className="flex gap-6 mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-white overflow-hidden flex-shrink-0 border border-indigo-100 shadow-sm">
                      {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-indigo-100" /></div>}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-lg font-black text-slate-800 truncate mb-1 uppercase tracking-tight">{c.modele}</h3>
                      <p className="text-xs font-bold text-indigo-600 mb-2">{c.client}</p>
                      <span className="px-3 py-1 bg-white border border-indigo-100 rounded-full text-[9px] font-black uppercase text-indigo-500">{c.quantite} {t('pcs', lang)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const fiche = fiches.find(f => f.modele.toLowerCase() === c.modele.toLowerCase());
                      const conso = fiche?.tissuConsommation || 0;
                      const totalMetrage = Number((conso * c.quantite).toFixed(2));
                      
                      setForm({
                        commandeId: c.id,
                        modele: c.modele,
                        client: c.client,
                        quantite: c.quantite,
                        tissu: c.tissu,
                        couleur: c.couleurs?.[0] || '',
                        statut: 'planifié',
                        metrage: Number(((c as any).tissus?.reduce((acc: number, t: any) => acc + (c.quantite * (t.conso || 0)), 0) || (c.quantite * (fiche?.tissuConsommation || 0))).toFixed(2)),
                        tissus: (c as any).tissus || []
                      });
                      setEditId(null);
                      setShowModal(true);
                    }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4" /> 
                    PLANIFIER LA COUPE
                  </button>
                </div>
              );
            })}

            {/* ALREADY PLANNED ORDERS */}
            {planifies.map(o => {
              const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
              return (
                <div key={o.id} className="bg-white border-2 border-amber-100 rounded-[2.5rem] p-8 shadow-xl shadow-amber-500/5 flex flex-col hover:border-amber-300 transition-all group">
                  <div className="flex gap-6 mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner">
                      {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-200" /></div>}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-xl font-black text-slate-800 truncate mb-1 uppercase tracking-tight">{o.modele}</h3>
                      <p className="text-sm font-bold text-amber-600 mb-4">{o.client}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">{o.quantite} {t('pcs', lang)}</span>
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">{o.tissu}</span>
                      </div>
                    </div>
                  </div>
                  
                  {fiche && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <AssetsBlock fiche={fiche} orderId={o.id} />
                    </div>
                  )}

                  <button 
                    disabled={!isFullyChecked(o.id)}
                    onClick={() => startCutting(o)}
                    className={`w-full py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest ${
                      isFullyChecked(o.id)
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Scissors className="w-4 h-4" /> 
                    {isFullyChecked(o.id) ? t('demarrer_coupe', lang) : t('docs_requis', lang)}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t('no_data', lang)}</p>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* SECTION 2: PRODUCTION ACTIVE & HISTORIQUE */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Scissors className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-none">{t('prod_active_hist', lang)}</h2>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{actifEtTermines.length} {t('ordres_cours_term', lang)}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={t('filtrer_placeholder', lang)} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">{t('ordre_modele', lang)}</th>
                  <th className="px-8 py-5">{t('metrage_assets', lang)}</th>
                  <th className="px-8 py-5 text-center">{t('quantite', lang)}</th>
                  <th className="px-8 py-5 text-center">{t('statut_action', lang)}</th>
                  <th className="px-8 py-5 text-center">{t('actions', lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actifEtTermines.filter(o => o.modele.toLowerCase().includes(search.toLowerCase())).map(o => {
                  const fiche = fiches.find(f => f.modele.toLowerCase() === o.modele.toLowerCase());
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                            {fiche?.photo ? <img src={fiche.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase">{o.modele}</p>
                            <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase tracking-tighter">{o.client} · {o.tissu}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-6">
                           <div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{o.metrage} m</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">{o.couleur}</p>
                           </div>
                           {fiche && <div className="w-48 scale-75 origin-left opacity-60"><AssetsBlock fiche={fiche} orderId={o.id} /></div>}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <p className="text-lg font-black text-slate-900 tracking-tighter">{o.quantite} <span className="text-[10px] font-bold text-slate-400 uppercase">{t('pcs', lang)}</span></p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {o.statut === 'en_cours' ? (
                          <button 
                            onClick={() => finishCutting(o)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                          >
                            <ChevronRight className="w-3.5 h-3.5" /> {t('terminer_envoyer_montage', lang)}
                          </button>
                        ) : (
                          <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statutBadge(o.statut)}`}>
                            {statutLabel(o.statut)}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setEditId(o.id); setForm(o); setShowModal(true); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(o.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="p-8 border-t border-slate-50 flex justify-center bg-slate-50/30">
              <button 
                onClick={() => loadOrders(page + 1)}
                disabled={loading}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Afficher plus d\'ordres'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Modal Header Premium */}
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transform rotate-3">
                   <Scissors className="w-6 h-6" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">{editId ? t('modifier_ordre', lang) : t('lancer_ordre', lang)}</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Workspace de Planification</p>
                 </div>
               </div>
               <button onClick={() => { setShowModal(false); setShowRejectForm(false); }} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-lg transition-all text-slate-400">×</button>
            </div>

            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
               {showRejectForm ? (
                 <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                       <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{t('refuser_ordre' as any, lang)}</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('raison_refus' as any, lang)}</p>
                    </div>
                    <textarea 
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder={isAr ? 'اكتب سبب الرفض هنا...' : 'Expliquez pourquoi vous refusez cet ordre...'}
                      className={`w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-rose-500 text-sm font-bold ${isAr ? 'text-right' : ''}`}
                    />
                 </div>
               ) : (
                 <>
              {/* Main Info Card */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Modèle</label>
                    <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">{form.modele || '—'}</p>
                 </div>
                 <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                    <label className="block text-[9px] font-black text-indigo-400 uppercase mb-2">Quantité</label>
                    <p className="text-lg font-black text-indigo-700 tracking-tighter">{form.quantite || 0} PCS</p>
                 </div>
              </div>

              {/* Sizes Breakdown - NEW */}
              {form.commandeId && (
                <div className="space-y-4">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Répartition des Tailles</label>
                   <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {commandes.find(cmd => cmd.id === form.commandeId)?.tailles && 
                        Object.entries(commandes.find(cmd => cmd.id === form.commandeId)!.tailles!).map(([size, qty]) => (
                          <div key={size} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{size}</p>
                             <p className="text-sm font-black text-slate-800">{qty as number}</p>
                          </div>
                        ))
                      }
                   </div>
                </div>
              )}

              {/* FABRIC SUMMARY - THE "WOW" BLOCK */}
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[50px] -mr-16 -mt-16 group-hover:bg-indigo-600/40 transition-colors" />
                  
                  {(form as any).tissus && (form as any).tissus.length > 0 ? (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center border-b border-white/10 pb-4">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan de Coupe (Multi-Tissus)</span>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Métrage par Ligne</span>
                       </div>
                       <div className="space-y-4">
                          {(form as any).tissus.map((t: any, i: number) => {
                            const rowMetrage = ((form.quantite || 0) * (t.conso || 0)).toFixed(2);
                            return (
                              <div key={t.id || i} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                   <div>
                                      <p className="text-sm font-black uppercase">{t.couleur} {t.type}</p>
                                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Conso: {t.conso}m/pc</p>
                                   </div>
                                </div>
                                <p className="text-xl font-black text-white">{rowMetrage}<span className="text-[10px] text-slate-500 ml-1">M</span></p>
                              </div>
                            );
                          })}
                       </div>
                       <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Global</span>
                          <p className="text-2xl font-black text-indigo-400">{form.metrage}<span className="text-sm ml-1">M</span></p>
                       </div>
                    </div>
                  ) : (
                    <div className="relative flex justify-between items-end">
                      <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tissu & Couleur</span>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                <p className="text-xl font-black uppercase tracking-tight">{form.tissu || '—'} <span className="text-slate-500 ml-2">({form.couleur || '—'})</span></p>
                            </div>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Métrage Total Requis</span>
                          <div className="flex items-baseline justify-end gap-1 mt-1">
                            <p className="text-5xl font-black text-white leading-none">{(form.metrage || 0).toLocaleString()}</p>
                            <span className="text-lg font-black text-slate-500">M</span>
                          </div>
                      </div>
                    </div>
                  )}
              </div>
               </>
               )}
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              {showRejectForm ? (
                <>
                  <button onClick={() => setShowRejectForm(false)} className="px-6 py-4 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Retour</button>
                  <button 
                    onClick={handleReject} 
                    className="px-12 py-5 bg-rose-600 text-white rounded-2xl text-[11px] font-black hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all uppercase tracking-widest transform active:scale-95"
                  >
                    {t('confirmer_refus' as any, lang)}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-4">
                    <button onClick={() => { setShowModal(false); setShowRejectForm(false); }} className="px-6 py-4 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Annuler</button>
                    {form.commandeId && (
                      <button 
                        onClick={() => setShowRejectForm(true)} 
                        className="px-6 py-4 text-[10px] font-black text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-all uppercase tracking-widest flex items-center gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {t('refuser_ordre' as any, lang)}
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={save} 
                    className="px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest transform active:scale-95"
                  >
                    {t('enregistrer_ordre', lang)}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mesures Modal */}
      {viewMesuresFiche && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5"><div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100"><Ruler className="w-7 h-7 text-white" /></div><div><h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('tableau_mesures', lang)}</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{viewMesuresFiche.modele} <span className="mx-2">·</span> {viewMesuresFiche.client}</p></div></div>
              <button onClick={() => setViewMesuresFiche(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-auto p-10"><div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm"><table className="w-full text-sm border-collapse"><thead><tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-[0.15em]"><th className="px-8 py-5 text-left border-r border-slate-800">{t('point_mesure_label', lang)}</th>{viewMesuresFiche.tailles.map(t => <th key={t} className="px-6 py-5 text-center border-r border-slate-800 last:border-r-0">{t}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{viewMesuresFiche.mesures.map((m, i) => (<tr key={i} className="hover:bg-indigo-50/30 transition-colors group"><td className="px-8 py-5 font-black text-slate-700 bg-slate-50 group-hover:bg-indigo-50/50 border-r border-slate-200 transition-colors uppercase tracking-tight">{m.nom}</td>{viewMesuresFiche.tailles.map(t => (<td key={t} className="px-6 py-5 text-center font-bold text-indigo-600 border-r border-slate-100 last:border-r-0 group-hover:bg-white transition-colors">{m.valeurs[t] || '—'}</td>))}</tr>))}</tbody></table></div></div>
            <div className="p-8 border-t border-slate-100 flex justify-center bg-slate-50/50"><button onClick={() => setViewMesuresFiche(null)} className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">{t('fermer_tableau', lang)}</button></div>
          </div>
        </div>
      )}
      {/* Modern Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10 border-2 border-emerald-100/50">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {isAr ? 'تم بنجاح!' : 'Félicitations !'}
              </h3>
              <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed uppercase tracking-widest">
                {showSuccess}
              </p>
              <button 
                onClick={() => setShowSuccess(null)}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
              >
                {isAr ? 'حسناً' : 'Continuer'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
