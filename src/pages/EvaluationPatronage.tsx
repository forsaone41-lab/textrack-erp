import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Search, Save, Package, Phone, CheckCircle, ChevronDown, Check, Scissors, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { Lead, saveRecord } from '../types';
import { useLang } from '../contexts/LangContext';


export default function EvaluationPatronage() {
  const { isAr } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [priceInput, setPriceInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; onConfirm?: () => void; isError?: boolean } | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('leads').select('*').order('date', { ascending: false });
      if (error) throw error;
      if (data) {
        const filtered = data.filter(l => {
           let details: any = {};
           try { details = JSON.parse(l.details || '{}'); } catch(e) {}
           return details.patronageStatus === 'requested' || details.patronageStatus === 'priced';
        });
        
        const mapped = filtered.map(l => {
          let extra: any = {};
          try { extra = JSON.parse(l.details || '{}'); } catch(e) {}
          return {
            ...l,
            ...extra,
            id: l.id
          };
        });
        setLeads(mapped);
      }
    } catch (e) {
      console.error(e);
      setCustomAlert({
        title: isAr ? 'خطأ ❌' : 'Erreur ❌',
        message: isAr ? 'خطأ في التحميل' : 'Erreur de chargement',
        isError: true
      });
    }
    setLoading(false);
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setPriceInput(lead.patronagePrice ? String(lead.patronagePrice) : '');
    setNotesInput(lead.patronageNotes || '');
  };

  const handleSavePrice = async () => {
    if (!selectedLead) return;
    if (!priceInput) {
      setCustomAlert({
        title: isAr ? 'تنبيه' : 'Attention',
        message: isAr ? 'أدخل الثمن أولا' : 'Veuillez entrer un prix',
        isError: true
      });
      return;
    }

    try {
      const newDetails = {
        ...(selectedLead as any),
        patronageStatus: 'priced',
        patronagePrice: Number(priceInput),
        patronageNotes: notesInput
      };
      
      const dbLead = {
        id: selectedLead.id,
        name: selectedLead.name,
        phone: selectedLead.phone,
        ville: selectedLead.ville,
        type: selectedLead.type,
        quantity: selectedLead.quantity,
        status: selectedLead.status,
        date: selectedLead.date,
        details: JSON.stringify(newDetails)
      };
      
      await saveRecord('leads', dbLead, true);
      setCustomAlert({
        title: isAr ? 'تم بنجاح! 🎉' : 'Succès! 🎉',
        message: isAr ? 'تم حفظ الثمن بنجاح' : 'Prix enregistré avec succès',
      });
      fetchLeads();
      setSelectedLead(null);
    } catch (e) {
      setCustomAlert({
        title: isAr ? 'خطأ ❌' : 'Erreur ❌',
        message: isAr ? 'حدث خطأ أثناء الحفظ' : 'Erreur lors de la sauvegarde',
        isError: true
      });
    }
  };

  const filteredLeads = leads.filter(l => 
    l.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-4 md:p-8 space-y-6 ${isAr ? 'font-sans rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Scissors className="w-6 h-6" />
            </div>
            {isAr ? 'تقييم وتسعير الباترون' : 'Évaluation Patronage'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isAr ? 'تحديد تكلفة الباترون للموديلات المطلوبة من طرف الزبائن' : 'Définir le coût de patronage pour les modèles demandés'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
            <input 
              type="text" 
              placeholder={isAr ? "بحث بالموديل، العميل..." : "Rechercher par modèle, client..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold outline-none focus:border-amber-500 focus:bg-white transition-all`}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div></div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold">
            {isAr ? 'لا توجد أي طلبات تسعير حالياً' : 'Aucune demande de prix pour le moment'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="border-2 border-slate-100 rounded-2xl p-5 hover:border-amber-200 transition-colors bg-slate-50 relative overflow-hidden group">
                {lead.patronageStatus === 'priced' && (
                  <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-1.5 bg-emerald-100 text-emerald-600 rounded-lg`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
                
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {lead.photo || (lead.photos && lead.photos[0]) ? (
                      <img 
                        src={lead.photo || (lead.photos && lead.photos[0])} 
                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300" 
                        alt="" 
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(lead.photo || (lead.photos && lead.photos[0]) as string); }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm line-clamp-2">{lead.type.replace(' (CMT - Client Tissu)', '')}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{lead.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(lead.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {lead.patronageStatus === 'priced' ? (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-100 text-center">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{isAr ? 'تم التسعير' : 'Prix fixé'}</p>
                    <p className="text-xl font-black text-emerald-700">{lead.patronagePrice} MAD</p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                    <p className="text-xs font-black text-amber-600 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {isAr ? 'في انتظار التسعير' : 'En attente de prix'}
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => handleSelectLead(lead)}
                  className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors"
                >
                  {lead.patronageStatus === 'priced' ? (isAr ? 'تعديل الثمن' : 'Modifier le prix') : (isAr ? 'إعطاء ثمن الباترون' : 'Donner le prix')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-500" />
                {isAr ? 'تسعير الباترون للموديل' : 'Prix du Patronage'}
              </h3>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-20 h-20 rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200 shrink-0">
                  {selectedLead.photo || (selectedLead.photos && selectedLead.photos[0]) ? (
                      <img 
                        src={selectedLead.photo || (selectedLead.photos && selectedLead.photos[0])} 
                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300" 
                        alt="" 
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedLead.photo || (selectedLead.photos && selectedLead.photos[0]) as string); }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-slate-300" /></div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-black text-slate-800 text-sm">{selectedLead.type.replace(' (CMT - Client Tissu)', '')}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{selectedLead.quantity} Pièces</p>
                  {selectedLead.type.includes('CMT') && (
                    <span className="mt-2 w-fit px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded">
                      ✂️ Tissu Client (CMT)
                    </span>
                  )}
                </div>
              </div>

              {((selectedLead as any).clientNotes || (selectedLead.details && !selectedLead.details.trim().startsWith('{'))) && (
                <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{isAr ? 'التفاصيل / ملاحظات الكليان' : 'Détails du client'}</p>
                  <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap">{(selectedLead as any).clientNotes || selectedLead.details}</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">
                    {isAr ? 'ثمن الفصالة / الباترون (MAD)' : 'Prix de Patronage (MAD)'}
                  </label>
                  <input 
                    type="number" 
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Ex: 150"
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-xl font-black text-amber-600 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">
                    {isAr ? 'ملاحظات المودليست (اختياري)' : 'Notes du Modéliste (Optionnel)'}
                  </label>
                  <textarea 
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows={3}
                    placeholder={isAr ? 'مثلا: هذا الموديل يتطلب وقتا إضافيا...' : 'Ex: Modèle complexe...'}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleSavePrice}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isAr ? 'حفظ الثمن' : 'Enregistrer le prix'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Custom Alert Modal */}
      {customAlert && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[40px] border-2 border-slate-100 w-full max-w-md p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            {/* Top decorative badge */}
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${
              customAlert.isError 
                ? 'bg-rose-50 border border-rose-100 text-rose-500 shadow-rose-200/50' 
                : 'bg-emerald-50 border border-emerald-100 text-emerald-500 shadow-emerald-200/50'
            }`}>
              {customAlert.isError ? <X className="w-8 h-8" /> : <Check className="w-8 h-8" />}
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">{customAlert.title}</h3>
            <p className="text-sm font-semibold leading-relaxed text-slate-500 mb-6">{customAlert.message}</p>

            <button
              onClick={() => {
                const onConf = customAlert.onConfirm;
                setCustomAlert(null);
                if (onConf) onConf();
              }}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md ${
                customAlert.isError
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {isAr ? 'موافق' : 'D\'accord'}
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200" 
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)} 
            className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all z-10 border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-3xl shadow-2xl" 
            alt="Full screen" 
            onClick={e => e.stopPropagation()} 
          />
        </div>
      )}

    </div>
  );
}
