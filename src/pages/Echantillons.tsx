import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { Commande, loadData, saveRecord, deleteRecord } from '../types';
import { compressImage } from '../utils/image';
import { Scissors, CheckCircle, Package, Clock, Palette, Ruler, FileText, Image as ImageIcon, MessageSquare, PhoneCall, Handshake, Globe, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Echantillons() {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Validation Modal State
  const [validateModal, setValidateModal] = useState<{ open: boolean, commande: Commande | null }>({ open: false, commande: null });
  const [validateMethod, setValidateMethod] = useState<'whatsapp' | 'phone' | 'in_person' | 'portal'>('whatsapp');
  const [validateNote, setValidateNote] = useState('');
  const [preuveFile, setPreuveFile] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmLaunch, setConfirmLaunch] = useState<Commande | null>(null);
  const [showSuccess, setShowSuccess] = useState<{ message: string, sub?: string } | null>(null);
  const [editingPrixId, setEditingPrixId] = useState<string | null>(null);
  const [editingPrixVal, setEditingPrixVal] = useState<string>('');
  
  // PRO Feedback State
  const [portalFeedback, setPortalFeedback] = useState({
    rating: 5,
    fabricNotes: '',
    sizeNotes: '',
    generalNotes: ''
  });

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

  const handleAccept = (c: Commande) => {
    setValidateMethod('whatsapp');
    setValidateNote('');
    setPreuveFile('');
    setPortalFeedback({ rating: 5, fabricNotes: '', sizeNotes: '', generalNotes: '' });
    setValidateModal({ open: true, commande: c });
  };

  const confirmValidation = async () => {
    if (!validateModal.commande || isValidating) return;
    setIsValidating(true);
    
    try {
      const c = validateModal.commande;
      
      let methodText = '';
      if (validateMethod === 'whatsapp') methodText = 'WhatsApp';
      if (validateMethod === 'phone') methodText = 'Téléphone';
      if (validateMethod === 'in_person') methodText = 'En personne';
      if (validateMethod === 'portal') methodText = 'Portail Client';

      let finalNote = `Échantillon validé par le client (Via: ${methodText})${validateNote ? ' - Preuve: ' + validateNote : ''}`;
      
      if (validateMethod === 'portal') {
        const feedbackJson = JSON.stringify({ ...portalFeedback, approved: true });
        finalNote = `[FEEDBACK_JSON]${feedbackJson}`;
      }

      const updated = {
        ...c,
        statut: 'echantillon_valide',
        preuveValidation: preuveFile || undefined,
        suivi: [...(c.suivi || []), { phase: c.phase, date: new Date().toISOString(), note: finalNote }]
      };
      
      await saveRecord('commandes', updated as any);
      setCommandes(prev => prev.map(cmd => cmd.id === c.id ? updated as Commande : cmd));
      
      setValidateModal({ open: false, commande: null });
      setValidateNote('');
      setPreuveFile('');
      
      // Redirect to the client's profile with a small delay for the modal to close smoothly
      setTimeout(() => {
        navigate('/clients', { state: { openClientName: c.client } });
      }, 300);
    } catch (error) {
      console.error("Validation error:", error);
      alert(isAr ? 'حدث خطأ أثناء التأكيد' : 'Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const handleLaunch = async (c: Commande) => {
    setConfirmLaunch(c);
  };

  const confirmLaunchProduction = async (targetPhase: 'coupe' | 'patronage') => {
    if (!confirmLaunch) return;
    const c = confirmLaunch;
    
    const updated = {
      ...c,
      statut: 'en_cours',
      phase: targetPhase,
      suivi: [...(c.suivi || []), { phase: targetPhase, date: new Date().toISOString(), note: `Production lancée vers: ${targetPhase}` }]
    };
    
    await saveRecord('commandes', updated as any);
    setCommandes(prev => prev.filter(cmd => cmd.id !== c.id));
    setConfirmLaunch(null);

    setShowSuccess({
      message: isAr ? 'تم الإرسال بنجاح!' : 'Envoyé avec succès !',
      sub: isAr 
        ? (targetPhase === 'coupe' ? 'الطلبية الآن في الفصالة.' : 'الطلبية الآن في الباترون/السيرية.') 
        : (targetPhase === 'coupe' ? 'La commande est à la coupe.' : 'La commande est au patronage.')
    });
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteRecord('commandes', confirmDeleteId);
      setCommandes(prev => prev.filter(c => c.id !== confirmDeleteId));
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmDeleteId(null);
    }
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

      {/* Validation Modal */}
      {validateModal.open && validateModal.commande && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-200">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {isAr ? 'تأكيد الموافقة' : 'Validation de l\'Échantillon'}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{validateModal.commande.client}</p>
                </div>
              </div>
              <button onClick={() => setValidateModal({ open: false, commande: null })} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest">
                {isAr ? 'كيف تمت الموافقة؟' : 'Comment l\'échantillon a-t-il été validé ?'}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setValidateMethod('whatsapp')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${validateMethod === 'whatsapp' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  <MessageSquare className={`w-6 h-6 ${validateMethod === 'whatsapp' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                </button>
                
                <button 
                  onClick={() => setValidateMethod('phone')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${validateMethod === 'phone' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  <PhoneCall className={`w-6 h-6 ${validateMethod === 'phone' ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'مكالمة هاتفية' : 'Appel Téléphonique'}</span>
                </button>

                <button 
                  onClick={() => setValidateMethod('in_person')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${validateMethod === 'in_person' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  <Handshake className={`w-6 h-6 ${validateMethod === 'in_person' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'حضورياً' : 'En Personne'}</span>
                </button>

                <button 
                  onClick={() => setValidateMethod('portal')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${validateMethod === 'portal' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  <Globe className={`w-6 h-6 ${validateMethod === 'portal' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'نموذج احترافي' : 'Formulaire PRO'}</span>
                </button>
              </div>

              {validateMethod === 'portal' ? (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">
                        {isAr ? 'تقييم العينة' : 'Évaluation'}
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setPortalFeedback(prev => ({ ...prev, rating: star }))}
                            className={`p-1 rounded-lg transition-all ${star <= portalFeedback.rating ? 'text-amber-400 bg-amber-50 shadow-sm' : 'text-slate-300 bg-white hover:bg-slate-50'}`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{isAr ? 'الثوب واللون' : 'Tissu & Couleur'}</label>
                      <input type="text" value={portalFeedback.fabricNotes} onChange={e => setPortalFeedback(prev => ({ ...prev, fabricNotes: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:border-blue-400 outline-none" placeholder={isAr ? 'جيد جداً...' : 'Très bien...'} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{isAr ? 'القياسات' : 'Mensurations'}</label>
                      <input type="text" value={portalFeedback.sizeNotes} onChange={e => setPortalFeedback(prev => ({ ...prev, sizeNotes: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:border-blue-400 outline-none" placeholder={isAr ? 'هل القياسات مضبوطة؟...' : 'Tailles correctes ?'} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{isAr ? 'ملاحظات وتعديلات' : 'Remarques générales'}</label>
                      <textarea value={portalFeedback.generalNotes} onChange={e => setPortalFeedback(prev => ({ ...prev, generalNotes: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:border-blue-400 outline-none h-[34px] resize-none overflow-hidden" placeholder={isAr ? 'أي تعديلات...' : 'Modifications...'} />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">
                    {isAr ? 'ملاحظة أو دليل نصي (اختياري)' : 'Note (Optionnel)'}
                  </label>
                  <textarea 
                    value={validateNote}
                    onChange={(e) => setValidateNote(e.target.value)}
                    placeholder={isAr ? "أضف ملاحظة أو الصق نصاً هنا..." : "Collez une note ici..."}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-medium h-20 focus:border-fuchsia-500 outline-none transition-all resize-none mb-4"
                  />

                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">
                    {isAr ? 'إرفاق دليل مرئي أو صوتي (إجباري للواتساب)' : 'Preuve visuelle/audio (Obligatoire pour WhatsApp)'}
                  </label>
                  {preuveFile ? (
                    <div className="relative w-full h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden group">
                      {preuveFile.startsWith('data:audio') ? (
                        <audio controls src={preuveFile} className="w-full px-4" />
                      ) : (
                        <img src={preuveFile} alt="Preuve" className="h-full object-contain" />
                      )}
                      <button 
                        onClick={() => setPreuveFile('')}
                        className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-white font-black uppercase text-[10px] tracking-widest">{isAr ? 'حذف' : 'Supprimer'}</span>
                      </button>
                    </div>
                  ) : (
                    <label className={`w-full h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                      validateMethod === 'whatsapp' ? 'border-rose-300 hover:border-rose-500 hover:bg-rose-50 bg-rose-50/30' : 'border-slate-300 hover:border-fuchsia-400 hover:bg-slate-50'
                    }`}>
                      <ImageIcon className={`w-6 h-6 mb-1 ${validateMethod === 'whatsapp' ? 'text-rose-400' : 'text-slate-400'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${validateMethod === 'whatsapp' ? 'text-rose-500' : 'text-slate-500'}`}>
                        {isAr ? 'رفع صورة (Screenshot) أو ملف صوتي' : 'Uploader Image/Audio'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*,audio/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setPreuveFile(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setValidateModal({ open: false, commande: null })}
                className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                disabled={(validateMethod === 'whatsapp' && !preuveFile) || isValidating}
                onClick={confirmValidation}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  (validateMethod === 'whatsapp' && !preuveFile) || isValidating
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-fuchsia-200'
                }`}
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isAr ? 'جاري التأكيد...' : 'Validation...'}
                  </>
                ) : (
                  <>{isAr ? 'تأكيد الموافقة' : 'Confirmer Validation'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
            commandes.map(c => {
              // Extract feedback data
              const feedbackSuivi = c.suivi?.find(s => s.note?.startsWith('[FEEDBACK_JSON]'));
              let feedbackData: any = c.sampleFeedback;
              if (!feedbackData && feedbackSuivi) {
                try {
                  feedbackData = JSON.parse(feedbackSuivi.note.replace('[FEEDBACK_JSON]', ''));
                } catch(e) {}
              }

              return (
                <div key={c.id} className="bg-white rounded-[2rem] border-2 border-indigo-50 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              {/* Status Badge */}
              <div className={`absolute top-0 ${isAr ? 'left-0 rounded-br-2xl' : 'right-0 rounded-bl-2xl'} flex items-center gap-2`}>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ${
                  c.statut === 'echantillon_valide' ? 'bg-emerald-500' : 'bg-fuchsia-500'
                }`}>
                  {c.statut === 'echantillon_valide' ? (isAr ? 'مقبولة' : 'Validé') : (isAr ? 'في الانتظار' : 'En Attente')}
                </div>
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

                <div className={`p-3 rounded-xl border flex items-start gap-3 ${(c as any).prixValide ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <FileText className={`w-4 h-4 mt-0.5 ${(c as any).prixValide ? 'text-emerald-500' : 'text-amber-400'}`} />
                  <div className="flex-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {isAr ? 'السعر' : 'Prix'} {(c as any).prixValide ? '✅' : <span className="text-amber-500">(non validé)</span>}
                    </span>
                    {editingPrixId === c.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={editingPrixVal}
                          onChange={e => setEditingPrixVal(e.target.value)}
                          className="w-24 px-2 py-1 border border-indigo-300 rounded-lg text-xs font-bold outline-none"
                          autoFocus
                        />
                        <span className="text-[10px] font-bold text-slate-500">MAD</span>
                        <button
                          onClick={async () => {
                            const newPrix = Number(editingPrixVal) || 0;
                            const updated = { ...c, prix: newPrix, prixUnitaire: newPrix, prixValide: false } as any;
                            setCommandes(prev => prev.map(x => x.id === c.id ? updated : x));
                            await saveRecord('commandes', updated);
                            setEditingPrixId(null);
                          }}
                          className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black"
                        >✓</button>
                        <button onClick={() => setEditingPrixId(null)} className="px-2 py-1 bg-slate-200 rounded-lg text-[9px] font-black">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${(c as any).prixValide ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {c.prix || 0} MAD
                        </span>
                        <button
                          onClick={() => { setEditingPrixId(c.id); setEditingPrixVal(String(c.prix || 0)); }}
                          className="text-[9px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                        >✏️</button>
                        {!((c as any).prixValide) && (c.prix || 0) > 0 && (
                          <button
                            onClick={async () => {
                              const updated = { ...c, prixValide: true } as any;
                              setCommandes(prev => prev.map(x => x.id === c.id ? updated : x));
                              await saveRecord('commandes', updated);
                            }}
                            className="text-[9px] px-2 py-0.5 bg-emerald-500 text-white rounded font-black hover:bg-emerald-600 transition-all"
                          >✅ Valider</button>
                        )}
                      </div>
                    )}
                    {c.avance ? <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Avance: {c.avance} MAD</div> : null}
                    {!(c as any).prixValide && (c.prix || 0) > 0 && (
                      <p className="text-[9px] text-amber-500 font-bold mt-1">⚠️ {isAr ? 'غير محسوب في المالية حتى التأكيد' : 'Non compté en finance avant validation'}</p>
                    )}
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

              {(c.tissuPhoto || c.modelePhoto) && (
                <div className="mb-6 grid grid-cols-2 gap-2">
                  {c.tissuPhoto && (
                    <div className="rounded-xl overflow-hidden border border-slate-100 h-32 relative group/img">
                      <div className="absolute inset-0 bg-slate-900/10 z-10" />
                      <img src={c.tissuPhoto} alt="Tissu" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                        <ImageIcon className="w-3 h-3 text-indigo-600" />
                        <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">{isAr ? 'الثوب' : 'Tissu'}</span>
                      </div>
                    </div>
                  )}
                  {c.modelePhoto && (
                    <div className="rounded-xl overflow-hidden border border-slate-100 h-32 relative group/img">
                      <div className="absolute inset-0 bg-slate-900/10 z-10" />
                      <img src={c.modelePhoto} alt="Modele" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                        <ImageIcon className="w-3 h-3 text-fuchsia-600" />
                        <span className="text-[9px] font-black text-fuchsia-900 uppercase tracking-widest">{isAr ? 'الموديل' : 'Modèle'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Client Feedback Display (PRO Version) */}
              {feedbackData && (
                <div className={`mb-6 p-5 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-inner ${isAr ? 'text-right' : 'text-left'}`}>
                  <div className={`flex items-center gap-3 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">{isAr ? 'تعليقات الزبون' : 'Retour Client'}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg key={star} className={`w-3 h-3 ${star <= (feedbackData.rating || 0) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {feedbackData.fabricNotes && (
                      <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <Palette className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{isAr ? 'الثوب واللون' : 'Tissu & Couleur'}</span>
                          <p className="text-sm font-bold text-slate-700">{feedbackData.fabricNotes}</p>
                        </div>
                      </div>
                    )}
                    
                    {feedbackData.sizeNotes && (
                      <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <Ruler className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{isAr ? 'القياسات' : 'Mensurations'}</span>
                          <p className="text-sm font-bold text-slate-700">{feedbackData.sizeNotes}</p>
                        </div>
                      </div>
                    )}

                    {feedbackData.generalNotes && (
                      <div className={`flex items-start gap-2 pt-2 border-t border-indigo-100/50 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{isAr ? 'ملاحظات عامة' : 'Remarques générales'}</span>
                          <p className="text-sm font-bold text-slate-700">{feedbackData.generalNotes}</p>
                        </div>
                      </div>
                    )}
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
            );
          })
        )}
      </div>
      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-sm shadow-rose-100">
              <Trash2 className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{isAr ? 'حذف العينة؟' : 'Supprimer l\'échantillon ?'}</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              {isAr ? 'هل أنت متأكد من حذف هذه العينة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Cette action est irréversible. Voulez-vous vraiment supprimer cet échantillon ?'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all">
                {isAr ? 'تأكيد الحذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Launch Modal */}
      {confirmLaunch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 text-center animate-in zoom-in duration-300 border border-emerald-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-xl shadow-emerald-100/50">
              <Package className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{isAr ? 'أين تريد توجيه الطلبية؟' : 'Où envoyer la commande ?'}</h3>
            <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed uppercase tracking-tight">
              {isAr ? 'حدد الخطوة التالية بعد موافقة الكليان:' : 'Sélectionnez la prochaine étape après validation :'}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => confirmLaunchProduction('coupe')} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3">
                <Scissors className="w-5 h-5" />
                {isAr ? 'إرسال للفصالة مباشرة (مستعجل)' : 'Envoyer à la Coupe (Direct)'}
              </button>
              
              <button onClick={() => confirmLaunchProduction('patronage')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3">
                <Ruler className="w-5 h-5" />
                {isAr ? 'عمل السيرية / باترون (Patronage)' : 'Créer Série / Patronage'}
              </button>

              <button onClick={() => setConfirmLaunch(null)} className="w-full py-3 mt-2 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-colors">
                {isAr ? 'إلغاء الرجوع' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[400] animate-in slide-in-from-top duration-500">
          <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-200/50 border-2 border-emerald-100 p-2 pl-6 pr-6 flex items-center gap-4 min-w-[320px]">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-none mb-1">{showSuccess.message}</p>
              {showSuccess.sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{showSuccess.sub}</p>}
            </div>
            <button onClick={() => setShowSuccess(null)} className="ml-4 w-8 h-8 hover:bg-slate-50 rounded-xl flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
