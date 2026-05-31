import React, { useState, useEffect } from 'react';
import { 
  Users, Phone, MapPin, Search, Calendar, 
  MessageCircle, PhoneCall, Video, Store,
  CheckCircle, Clock, XCircle, FileText,
  DollarSign, Mail, Edit3, Save, X
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { Lead, loadLeads, saveRecord } from '../types';


const STAGES = [
  { id: 'nouveau', labelAr: 'جديد', labelFr: 'Nouveau', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'contact_en_cours', labelAr: 'قيد التواصل', labelFr: 'En Contact', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'rdv_fixe', labelAr: 'موعد محدد', labelFr: 'RDV Fixé', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'attente_confirmation', labelAr: 'في انتظار التأكيد', labelFr: 'Attente Conf.', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'confirme', labelAr: 'مؤكد', labelFr: 'Confirmé', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'annule', labelAr: 'ملغى', labelFr: 'Annulé', color: 'bg-rose-100 text-rose-700 border-rose-200' }
] as const;

export default function Pipeline() {
  const { isAr } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const data = await loadLeads();
    setLeads(data.filter(l => l.status !== 'completed' || l.crmStage)); // Show active leads or those already in CRM
    setLoading(false);
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery) ||
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedLead) return;
    try {
      const updatedLead = { ...selectedLead, ...editForm };
      
      // We use saveRecord instead of saveLead because it's an update
      await saveRecord('leads', updatedLead);
      
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      alert(isAr ? 'تم الحفظ بنجاح' : 'Enregistré avec succès');
      setSelectedLead(null);
    } catch (e) {
      alert(isAr ? 'حدث خطأ' : 'Une erreur est survenue');
    }
  };

  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(l => (l.crmStage || 'nouveau') === stageId);
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isAr ? 'تتبع الزبناء (CRM)' : 'Suivi des Prospects (CRM)'}
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              {isAr ? 'تتبع مراحل التواصل وتأكيد الطلبيات' : 'Gérez vos prospects et confirmations'}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={isAr ? 'بحث بالاسم أو الهاتف...' : 'Rechercher...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${isAr ? 'pr-10 pl-4' : ''}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {STAGES.map(stage => (
            <div key={stage.id} className="flex-none w-[320px] snap-center">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 h-[calc(100vh-220px)] overflow-y-auto flex flex-col gap-3">
                
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${stage.color}`}>
                    {isAr ? stage.labelAr : stage.labelFr}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                    {getLeadsByStage(stage.id).length}
                  </span>
                </div>

                {/* Lead Cards */}
                {getLeadsByStage(stage.id).map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => {
                      setSelectedLead(lead);
                      setEditForm({
                        crmStage: lead.crmStage || 'nouveau',
                        crmContactMethod: lead.crmContactMethod,
                        crmRdvDate: lead.crmRdvDate,
                        crmNotes: lead.crmNotes,
                        crmPrice: lead.crmPrice
                      });
                    }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex flex-col gap-3 active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800">{lead.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-1">
                          <Phone className="w-3 h-3" />
                          <span dir="ltr">{lead.phone}</span>
                        </div>
                      </div>
                      {lead.photo ? (
                        <img src={lead.photo} alt={lead.name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase border border-indigo-100">
                          {lead.name.substring(0,2)}
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      {lead.type} ({lead.quantity} pcs)
                    </div>

                    {/* Quick Info Badges */}
                    <div className="flex flex-wrap gap-2">
                      {lead.crmContactMethod && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100 flex items-center gap-1">
                          {lead.crmContactMethod === 'appel' ? <PhoneCall className="w-3 h-3"/> :
                           lead.crmContactMethod === 'live' ? <Video className="w-3 h-3"/> :
                           lead.crmContactMethod === 'visite' ? <Store className="w-3 h-3"/> : 
                           <MessageCircle className="w-3 h-3"/>}
                          {lead.crmContactMethod}
                        </span>
                      )}
                      {lead.crmRdvDate && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-50 text-amber-600 rounded-md border border-amber-100 flex items-center gap-1">
                          <Calendar className="w-3 h-3"/>
                          {new Date(lead.crmRdvDate).toLocaleDateString()}
                        </span>
                      )}
                      {lead.crmPrice ? (
                        <span className="text-[10px] font-black px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 flex items-center gap-1">
                          <DollarSign className="w-3 h-3"/>
                          {lead.crmPrice} DH
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">
                {isAr ? 'تحديث معلومات الزبون' : 'Mise à jour du prospect'}
              </h2>
              <button 
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Client Info Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                {selectedLead.photo ? (
                  <img src={selectedLead.photo} alt={selectedLead.name} className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-slate-400 font-bold text-xl uppercase">{selectedLead.name.substring(0, 2)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">{selectedLead.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4"/> <span dir="ltr">{selectedLead.phone}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {selectedLead.ville}</div>
                    <div className="flex items-center gap-2 sm:col-span-2"><Store className="w-4 h-4"/> {selectedLead.type} - {selectedLead.quantity} {isAr ? 'قطعة' : 'pièces'}</div>
                  </div>
                </div>
              </div>

              {/* CRM Form */}
              <div className="space-y-4">
                
                {/* Stage */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {isAr ? 'المرحلة' : 'Étape'}
                  </label>
                  <select
                    value={editForm.crmStage || 'nouveau'}
                    onChange={(e) => setEditForm({ ...editForm, crmStage: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{isAr ? s.labelAr : s.labelFr}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Method & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {isAr ? 'طريقة التواصل' : 'Méthode de contact'}
                    </label>
                    <select
                      value={editForm.crmContactMethod || ''}
                      onChange={(e) => setEditForm({ ...editForm, crmContactMethod: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">{isAr ? '-- اختر --' : '-- Choisir --'}</option>
                      <option value="appel">{isAr ? 'اتصال هاتفي' : 'Appel téléphonique'}</option>
                      <option value="whatsapp">{isAr ? 'واتساب' : 'WhatsApp'}</option>
                      <option value="live">{isAr ? 'مكالمة فيديو' : 'Appel Visio'}</option>
                      <option value="visite">{isAr ? 'زيارة للمحل' : 'Visite sur place'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {isAr ? 'تاريخ الموعد' : 'Date RDV'}
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.crmRdvDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, crmRdvDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Price Quote */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {isAr ? 'السعر المقترح (درهم)' : 'Prix proposé (DH)'}
                  </label>
                  <input
                    type="number"
                    value={editForm.crmPrice || ''}
                    onChange={(e) => setEditForm({ ...editForm, crmPrice: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {isAr ? 'ملاحظات وتفاصيل' : 'Notes & Détails'}
                  </label>
                  <textarea
                    value={editForm.crmNotes || ''}
                    onChange={(e) => setEditForm({ ...editForm, crmNotes: e.target.value })}
                    rows={4}
                    placeholder={isAr ? 'أضف ملاحظات حول الاتصال، شروط العميل...' : 'Ajoutez des notes sur le prospect...'}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isAr ? 'حفظ التحديث' : 'Enregistrer'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
