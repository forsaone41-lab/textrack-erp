import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { Commande, loadData, saveRecord } from '../types';
import { Scissors, CheckCircle, Package, Clock, Palette, Ruler, FileText, Image as ImageIcon } from 'lucide-react';

export default function Echantillons() {
  const { isAr } = useLang();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cmds = await loadData<Commande>('commandes');
      setCommandes(cmds.filter(c => c.statut.startsWith('echantillon')));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (c: Commande) => {
    if (!window.confirm(isAr ? 'هل وافق الكليان على العينة؟' : 'Le client a-t-il validé l\'échantillon ?')) return;
    
    const updated = {
      ...c,
      statut: 'echantillon_valide',
      suivi: [...c.suivi, { phase: c.phase, date: new Date().toISOString(), note: 'Échantillon validé par le client' }]
    };
    
    await saveRecord('commandes', updated as any);
    setCommandes(prev => prev.map(cmd => cmd.id === c.id ? updated as Commande : cmd));
  };

  const handleLaunch = async (c: Commande) => {
    if (!window.confirm(isAr ? 'إطلاق الإنتاج وإرسال الطلبية إلى الفصالة؟' : 'Lancer la production globale ?')) return;
    
    const updated = {
      ...c,
      statut: 'en_cours',
      phase: 'coupe',
      suivi: [...c.suivi, { phase: 'coupe', date: new Date().toISOString(), note: 'Production globale lancée' }]
    };
    
    await saveRecord('commandes', updated as any);
    setCommandes(prev => prev.filter(cmd => cmd.id !== c.id)); // Remove from echantillons view
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
          {isAr ? 'إدارة العينات' : 'Gestion des Échantillons'}
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          {isAr ? 'تتبع عينات الكليان قبل الإنتاج الشامل' : 'Suivi des échantillons avant production'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {commandes.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Scissors className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              {isAr ? 'لا توجد عينات حالياً' : 'Aucun échantillon en cours'}
            </p>
          </div>
        ) : (
          commandes.map(c => (
            <div key={c.id} className="bg-white rounded-[2rem] border-2 border-indigo-50 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              {/* Status Badge */}
              <div className={`absolute top-0 ${isAr ? 'left-0 rounded-br-2xl' : 'right-0 rounded-bl-2xl'} px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ${
                c.statut === 'echantillon_valide' ? 'bg-emerald-500' : 'bg-fuchsia-500'
              }`}>
                {c.statut === 'echantillon_valide' ? (isAr ? 'مقبولة' : 'Validé') : (isAr ? 'في الانتظار' : 'En Attente')}
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200 shrink-0">
                  {c.client.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">{c.client}</h3>
                  <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                    <Package className="w-3.5 h-3.5" /> {c.modele} <span className="text-slate-400">({c.quantite} pcs)</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                  <Palette className="w-4 h-4 text-rose-400 mt-0.5" />
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الثوب والألوان' : 'Tissu & Couleurs'}</span>
                    <span className="text-xs font-bold text-slate-700">{c.tissu}</span>
                    {c.couleurs && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(Array.isArray(c.couleurs) 
                          ? c.couleurs 
                          : String(c.couleurs).replace(/[{}[\]"]/g, '').split(',')
                        ).map((color: string, i: number) => {
                          const cleanColor = color.trim();
                          if (!cleanColor) return null;
                          return (
                            <span key={i} className="px-1.5 py-0.5 bg-white text-rose-600 rounded text-[9px] font-black uppercase border border-rose-100">
                              {cleanColor}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                  <Ruler className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'المقاسات' : 'Tailles'}</span>
                    {c.tailles && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(c.tailles).filter(([_, v]) => v > 0).map(([k, v]) => (
                          <span key={k} className="px-1.5 py-0.5 bg-white text-emerald-600 rounded text-[9px] font-black uppercase border border-emerald-100">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                  <FileText className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'المالية' : 'Finance'}</span>
                    <div className="text-xs font-bold text-slate-700">Prix: <span className="text-amber-600">{c.prix} MAD</span></div>
                    {c.avance ? <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Avance: {c.avance} MAD</div> : null}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'التسليم' : 'Livraison'}</span>
                    <span className="text-xs font-bold text-slate-700">{c.dateLivraisonPrevue ? new Date(c.dateLivraisonPrevue).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              </div>

              {c.tissuPhoto && (
                <div className="mb-6 rounded-xl overflow-hidden border border-slate-100 h-32 relative group/img">
                  <div className="absolute inset-0 bg-slate-900/10 z-10" />
                  <img src={c.tissuPhoto} alt="Tissu" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                    <ImageIcon className="w-3 h-3 text-indigo-600" />
                    <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">{isAr ? 'صورة الثوب' : 'Photo'}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-auto">
                {c.statut === 'echantillon_en_cours' && (
                  <button
                    onClick={() => handleAccept(c)}
                    className="flex-1 bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-600 hover:text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> {isAr ? 'موافقة الكليان' : 'Valider'}
                  </button>
                )}
                {c.statut === 'echantillon_valide' && (
                  <button
                    onClick={() => handleLaunch(c)}
                    className="flex-1 bg-teal-500 text-white hover:bg-teal-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
                  >
                    <Package className="w-4 h-4" /> {isAr ? 'إطلاق الإنتاج' : 'Lancer Production'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
