import { useState, useEffect } from 'react';
import { Search, Info, MessageCircle, CheckCircle2, AlertTriangle, User, Calendar, Reply, Sparkles, Trash2 } from 'lucide-react';
import { Reclamation, loadReclamations, saveReclamation, deleteRecord } from '../types';
import { useLang } from '../contexts/LangContext';

export default function Reclamations() {
  const { isAr } = useLang();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [search, setSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState<Reclamation | null>(null);
  const [reponse, setReponse] = useState('');

  useEffect(() => {
    loadReclamations().then(data => {
      setReclamations(data || []);
    });
  }, []);

  const filtered = reclamations
    .filter(r => r.sujet.toLowerCase().includes(search.toLowerCase()) || r.employeNom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.dateReclamation).getTime() - new Date(a.dateReclamation).getTime());

  const handleReply = async () => {
    if (!replyingTo || !reponse) return;

    const updatedRec: Reclamation = {
      ...replyingTo,
      reponse: reponse,
      dateReponse: new Date().toISOString(),
      statut: 'traite'
    };

    const updatedList = reclamations.map(r => r.id === updatedRec.id ? updatedRec : r);
    setReclamations(updatedList);
    await saveReclamation(updatedRec);

    setReplyingTo(null);
    setReponse('');
  };

  const handleMarkPending = async (rec: Reclamation) => {
    const updatedRec: Reclamation = {
      ...rec,
      statut: 'en_attente'
    };
    const updatedList = reclamations.map(r => r.id === updatedRec.id ? updatedRec : r);
    setReclamations(updatedList);
    await saveReclamation(updatedRec);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد أنك تريد حذف هذه الشكاية؟' : 'Voulez-vous vraiment supprimer cette plainte ?')) return;
    
    setReclamations(prev => prev.filter(r => r.id !== id));
    await deleteRecord('leads', id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir={isAr ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100`}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? 'شكايات العمال' : 'Plaintes & Réclamations'}
            </h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
              {isAr ? 'متابعة المشاكل والشكايات وحلها' : 'Suivi et résolution des problèmes des employés'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input 
              type="text" 
              placeholder={isAr ? "بحث بالاسم أو الموضوع..." : "Chercher..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`pl-10 pr-10 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold w-64 focus:ring-2 focus:ring-rose-500 transition-all`} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
            <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold uppercase text-slate-400">{isAr ? 'لا توجد شكايات' : 'Aucune plainte'}</h3>
          </div>
        ) : (
          filtered.map(rec => (
            <div key={rec.id} className={`bg-white rounded-[2rem] p-6 shadow-sm border ${rec.statut === 'en_attente' ? 'border-rose-200 shadow-rose-100' : 'border-slate-100'} hover:shadow-md transition-shadow relative overflow-hidden`}>
              {rec.statut === 'en_attente' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4" />
              )}
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rec.statut === 'en_attente' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{rec.employeNom}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(rec.dateReclamation).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    rec.statut === 'traite' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {rec.statut === 'traite' ? (isAr ? 'تمت المعالجة' : 'Traitée') : (isAr ? 'في الانتظار' : 'En attente')}
                  </span>
                  <button 
                    onClick={() => handleDelete(rec.id)} 
                    className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors" 
                    title={isAr ? 'حذف الشكاية' : 'Supprimer'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4 relative z-10 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  {rec.target && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${rec.target === 'worker' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {rec.target === 'worker' ? (isAr ? 'العمال' : 'Ouvriers') : (isAr ? 'الإدارة' : 'Direction')}
                    </span>
                  )}
                  <h5 className="font-bold text-slate-800">{rec.sujet}</h5>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{rec.description}</p>
              </div>

              {rec.reponse ? (
                <div className="bg-indigo-50 rounded-xl p-4 relative z-10 border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                      <Reply className="w-3 h-3" /> {isAr ? 'رد الإدارة' : 'Réponse Administration'}
                    </p>
                    {rec.dateReponse && (
                      <span className="text-[9px] font-bold text-indigo-400">{new Date(rec.dateReponse).toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-indigo-900 leading-relaxed">{rec.reponse}</p>
                  <button onClick={() => handleMarkPending(rec)} className="mt-3 text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase">
                    {isAr ? 'إعادة الفتح' : 'Rouvrir'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setReplyingTo(rec)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Reply className="w-4 h-4" /> {isAr ? 'إضافة رد أو حل' : 'Ajouter une réponse'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {replyingTo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">{isAr ? 'الرد على الشكاية' : 'Répondre à la plainte'}</h3>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{replyingTo.employeNom}</span>
                <span className="text-slate-300">•</span>
                {replyingTo.target && (
                  <>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${replyingTo.target === 'worker' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {replyingTo.target === 'worker' ? (isAr ? 'العمال' : 'Ouvriers') : (isAr ? 'الإدارة' : 'Direction')}
                    </span>
                    <span className="text-slate-300">•</span>
                  </>
                )}
                <span className="text-xs font-bold text-indigo-500">{replyingTo.sujet}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">"{replyingTo.description}"</p>
            </div>

            <div className={`flex flex-wrap gap-2 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => setReponse(isAr ? 'تمت معالجة الشكاية بنجاح.' : 'Plainte traitée avec succès.')}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
              >
                {isAr ? 'تم المعالجة' : 'Traitée'}
              </button>
              <button 
                onClick={() => setReponse(isAr ? 'المرجو التوجه للإدارة للمزيد من التوضيح.' : 'Veuillez vous adresser à l\'administration.')}
                className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-colors"
              >
                {isAr ? 'التوجه للإدارة' : 'Voir Admin'}
              </button>
              <button 
                onClick={() => {
                  setReponse(isAr 
                    ? `مرحباً ${replyingTo.employeNom.split(' ')[0]}، لقد توصلنا بشكايتك بخصوص "${replyingTo.sujet}". الإدارة ستتخذ الإجراءات اللازمة قريباً.`
                    : `Bonjour ${replyingTo.employeNom.split(' ')[0]}, nous avons bien reçu votre plainte concernant "${replyingTo.sujet}". L'administration prendra les mesures nécessaires.`);
                }}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> {isAr ? 'رد ذكي' : 'Réponse Smart'}
              </button>
            </div>
            
            <textarea 
              value={reponse}
              onChange={e => setReponse(e.target.value)}
              placeholder={isAr ? "اكتب الحل أو الرد هنا..." : "Votre réponse..."}
              className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 min-h-[120px] mb-6 ${isAr ? 'text-right' : ''}`}
              dir={isAr ? 'rtl' : 'ltr'}
            />
            
            <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => {setReplyingTo(null); setReponse('');}} className="w-1/3 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:text-slate-700 transition-all">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={handleReply}
                disabled={!reponse}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:bg-slate-300 shadow-xl shadow-indigo-600/20"
              >
                {isAr ? 'إرسال الرد' : 'Envoyer la réponse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
