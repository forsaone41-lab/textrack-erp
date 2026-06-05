import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const RECRUTEMENT_STAGES = [
  { id: 'nouveau', labelAr: 'جديد', labelFr: 'Nouveau', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'entretien', labelAr: 'مقابلة (Entretien)', labelFr: 'Entretien', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'test_pratique', labelAr: 'اختبار تطبيقي', labelFr: 'Test Pratique', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'accepte', labelAr: 'مقبول', labelFr: 'Accepté', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'refuse', labelAr: 'مرفوض', labelFr: 'Refusé', color: 'bg-rose-100 text-rose-700 border-rose-200' }
] as const;

export default function Pipeline() {
  const { isAr } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'clients' | 'recrutement'>('clients');
  const [quickFilter, setQuickFilter] = useState<'all' | 'devis_sent' | 'attente' | 'confirme' | 'annule'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<string>('nouveau');
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const activeStages = category === 'recrutement' ? RECRUTEMENT_STAGES : STAGES;

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const isRecrutement = l.type.startsWith('RECRUTEMENT:');
      if (category === 'clients' && isRecrutement) return false;
      if (category === 'recrutement' && !isRecrutement) return false;

      const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        l.type.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (quickFilter === 'devis_sent') return (l.crmPrice || 0) > 0;
      if (quickFilter === 'attente') return l.crmStage === 'attente_confirmation';
      if (quickFilter === 'confirme') return l.crmStage === 'confirme';
      if (quickFilter === 'annule') return l.crmStage === 'annule';
      return true;
    });
  }, [leads, category, searchQuery, quickFilter]);

  const [savedOk, setSavedOk] = useState(false);

  const handleSave = async (nextStage?: string) => {
    if (!selectedLead) return;
    try {
      const updatedLead = { ...selectedLead, ...editForm, ...(nextStage ? { crmStage: nextStage } : {}) };
      await saveRecord('leads', updatedLead);
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead as Lead : l));
      setSavedOk(true);
      setTimeout(() => { setSavedOk(false); setSelectedLead(null); }, 1200);
    } catch (e) {
      alert(isAr ? 'حدث خطأ' : 'Une erreur est survenue');
    }
  };

  const getNextStage = (currentStage: string) => {
    const idx = activeStages.findIndex(s => s.id === currentStage);
    if (idx >= 0 && idx < activeStages.length - 2) return activeStages[idx + 1];
    return null;
  };

  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    activeStages.forEach(s => { grouped[s.id] = []; });
    filteredLeads.forEach(l => {
      const stage = l.crmStage || 'nouveau';
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(l);
    });
    return grouped;
  }, [filteredLeads, activeStages]);

  const getLeadsByStage = (stageId: string) => {
    return leadsByStage[stageId] || [];
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg text-white ${category === 'clients' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {isAr ? 'تتبع المراحل (CRM)' : 'Suivi Pipeline (CRM)'}
              </h1>
              <div className="flex items-center gap-2 mt-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button onClick={() => { setCategory('clients'); setActiveStage('nouveau'); setQuickFilter('all'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${category === 'clients' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {isAr ? 'الزبناء' : 'Clients'}
                </button>
                <button onClick={() => { setCategory('recrutement'); setActiveStage('nouveau'); setQuickFilter('all'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${category === 'recrutement' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {isAr ? 'التوظيف' : 'Recrutement'}
                </button>
              </div>
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

        {/* Quick filters (Only for clients) */}
        {category === 'clients' && (
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: isAr ? 'الكل' : 'Tous', color: 'bg-slate-100 text-slate-600 border-slate-200' },
              { id: 'devis_sent', label: isAr ? 'أُرسل لهم ديفيز' : 'Devis envoyé', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
              { id: 'attente', label: isAr ? 'قيد الانتظار' : 'En attente conf.', color: 'bg-amber-50 text-amber-600 border-amber-200' },
              { id: 'confirme', label: isAr ? 'مؤكد ✓' : 'Validé ✓', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
              { id: 'annule', label: isAr ? 'ملغى' : 'Annulé', color: 'bg-rose-50 text-rose-600 border-rose-200' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setQuickFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${
                  quickFilter === f.id
                    ? f.color + ' shadow-sm scale-105'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-60">
                  {f.id === 'all' ? filteredLeads.length :
                   f.id === 'devis_sent' ? filteredLeads.filter(l => (l.crmPrice || 0) > 0).length :
                   f.id === 'attente' ? filteredLeads.filter(l => l.crmStage === 'attente_confirmation').length :
                   f.id === 'confirme' ? filteredLeads.filter(l => l.crmStage === 'confirme').length :
                   filteredLeads.filter(l => l.crmStage === 'annule').length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Mobile: stage tabs */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2 snap-x">
            {activeStages.map(stage => (
              <button key={stage.id} onClick={() => setActiveStage(stage.id)}
                className={`flex-none snap-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeStage === stage.id ? stage.color + ' shadow-sm' : 'bg-white text-slate-400 border-slate-200'
                }`}>
                {isAr ? stage.labelAr : stage.labelFr}
                <span className="bg-white/60 px-1.5 py-0.5 rounded-md text-[9px]">{getLeadsByStage(stage.id).length}</span>
              </button>
            ))}
          </div>

          {/* Desktop: scroll with arrows */}
          <div className="hidden md:flex items-start gap-2">
            <button onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
              className="shrink-0 mt-16 w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
              ‹
            </button>
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-4 flex-1 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {activeStages.map(stage => (
            <div key={stage.id} className="flex-none w-[280px]">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 h-[calc(100vh-260px)] overflow-y-auto flex flex-col gap-2">
                
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
                        crmPrice: lead.crmPrice,
                        crmPriceConfirmed: lead.crmPriceConfirmed
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
                        <img src={lead.photo} alt={lead.name} onClick={e => { e.stopPropagation(); setZoomedPhoto(lead.photo!); }} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shadow-sm cursor-zoom-in hover:scale-110 transition-transform" />
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
            <button onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
              className="shrink-0 mt-16 w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
              ›
            </button>
          </div>

          {/* Mobile: single stage view */}
          <div className="md:hidden">
            {activeStages.filter(s => s.id === activeStage).map(stage => (
              <div key={stage.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 min-h-[60vh] flex flex-col gap-2">
                {getLeadsByStage(stage.id).length === 0 ? (
                  <p className="text-center text-slate-400 text-xs font-bold py-10 uppercase tracking-widest">Aucun prospect</p>
                ) : getLeadsByStage(stage.id).map(lead => (
                  <div key={lead.id} onClick={() => { setSelectedLead(lead); setEditForm({ crmStage: lead.crmStage || 'nouveau', crmContactMethod: lead.crmContactMethod, crmRdvDate: lead.crmRdvDate, crmNotes: lead.crmNotes, crmPrice: lead.crmPrice, crmPriceConfirmed: lead.crmPriceConfirmed }); }}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer active:scale-[0.98] flex items-center gap-3">
                    {lead.photo ? (
                      <img src={lead.photo} className="w-10 h-10 rounded-full object-cover border border-indigo-100 shrink-0" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase border border-indigo-100 shrink-0">{lead.name.substring(0,2)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-slate-500 truncate">{lead.type} ({lead.quantity} pcs)</p>
                      {lead.crmPrice ? <p className="text-xs font-black text-emerald-600">{lead.crmPrice.toLocaleString()} MAD</p> : null}
                    </div>
                    <span className="text-slate-300 text-lg">›</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {selectedLead && (() => {
        const currentStage = activeStages.find(s => s.id === (editForm.crmStage || 'nouveau'));
        const nextStage = getNextStage(editForm.crmStage || 'nouveau');
        return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                {selectedLead.photo ? (
                  <img
                    src={selectedLead.photo}
                    alt={selectedLead.name}
                    onClick={() => setZoomedPhoto(selectedLead.photo!)}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-100 cursor-zoom-in hover:scale-105 transition-transform"
                    title="Cliquer pour zoomer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase border border-indigo-100">
                    {selectedLead.name.substring(0,2)}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-black text-slate-900">{selectedLead.name}</h2>
                  <p className="text-xs text-slate-400 font-bold" dir="ltr">{selectedLead.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current stage pill */}
            <div className="px-6 pb-4 flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-bold">{selectedLead.type} — {selectedLead.quantity} pcs</span>
              <span className={`ml-auto text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${currentStage?.color}`}>
                {isAr ? currentStage?.labelAr : currentStage?.labelFr}
              </span>
            </div>

            {/* Next stage button — prominent */}
            {nextStage && (
              <div className="px-6 pb-4">
                <button
                  onClick={() => { setEditForm(f => ({ ...f, crmStage: nextStage.id as any })); handleSave(nextStage.id); }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  → {isAr ? nextStage.labelAr : nextStage.labelFr}
                </button>
              </div>
            )}

            {savedOk && (
              <div className="mx-6 mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-emerald-700 text-sm font-bold">
                <CheckCircle className="w-4 h-4" /> {isAr ? 'تم الحفظ' : 'Enregistré !'}
              </div>
            )}

            <div className="px-6 pb-4 overflow-y-auto space-y-4 border-t border-slate-100 pt-4">

              {/* Stage selector */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'المرحلة' : 'Étape actuelle'}</label>
                <select
                  value={editForm.crmStage || 'nouveau'}
                  onChange={(e) => setEditForm({ ...editForm, crmStage: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                >
                  {activeStages.map(s => <option key={s.id} value={s.id}>{isAr ? s.labelAr : s.labelFr}</option>)}
                </select>
              </div>

              {/* Contact method & RDV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'طريقة التواصل' : 'Contact'}</label>
                  <select
                    value={editForm.crmContactMethod || ''}
                    onChange={(e) => setEditForm({ ...editForm, crmContactMethod: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">--</option>
                    <option value="appel">Appel</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="live">Visio</option>
                    <option value="visite">Visite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">RDV</label>
                  <input type="datetime-local" value={editForm.crmRdvDate || ''} onChange={(e) => setEditForm({ ...editForm, crmRdvDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>

              {/* Price + confirmed toggle (Only for clients) */}
              {category === 'clients' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'السعر (درهم)' : 'Prix proposé (DH)'}</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={editForm.crmPrice || ''} onChange={(e) => setEditForm({ ...editForm, crmPrice: Number(e.target.value) })}
                      placeholder="0" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20" />
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, crmPriceConfirmed: !editForm.crmPriceConfirmed })}
                      className={`shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        editForm.crmPriceConfirmed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <CheckCircle className={`w-4 h-4 ${editForm.crmPriceConfirmed ? 'text-emerald-500' : 'text-slate-300'}`} />
                      {editForm.crmPriceConfirmed ? (isAr ? 'مقبول ✓' : 'Accepté ✓') : (isAr ? 'بانتظار' : 'En attente')}
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'ملاحظات' : 'Notes'}</label>
                <textarea value={editForm.crmNotes || ''} onChange={(e) => setEditForm({ ...editForm, crmNotes: e.target.value })}
                  rows={3} placeholder={isAr ? 'ملاحظات...' : 'Notes sur le prospect...'}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 resize-none" />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setSelectedLead(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={() => handleSave()} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors text-sm flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {isAr ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>

          </div>
        </div>
        );
      })()}

      {/* Zoom Photo Modal */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <button onClick={() => setZoomedPhoto(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img
            src={zoomedPhoto}
            alt="Zoom"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
