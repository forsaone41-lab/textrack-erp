import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Store,
  Phone,
  MessageCircle,
  PhoneCall,
  Video,
  CheckCircle,
  Clock,
  LogOut,
  Target,
  Search,
  X,
  DollarSign,
  UserCheck,
  Calculator,
  UserPlus,
  Scissors,
  MessageSquare,
  Edit2,
  Trash2
} from 'lucide-react';
import { 
  Lead,
  loadLeads,
  saveRecord,
  loadCompanyProfile,
  loadLeadPhoto
} from '../types';
import { useLang } from '../contexts/LangContext';

interface CommercialPortalProps {
  currentUser: any;
  onLogout: () => void;
}

export default function CommercialPortal({ currentUser, onLogout }: CommercialPortalProps) {
  const { isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const cachedLeads = localStorage.getItem('textrack_data_leads');
      if (cachedLeads) {
        const parsed = JSON.parse(cachedLeads);
        if (Array.isArray(parsed)) {
          const activeLeads = parsed.filter((l: any) => 
            l && !l.type?.startsWith('RECRUTEMENT:') && 
            (!l.crmStage || ['nouveau', 'contact_en_cours', 'rdv_fixe', 'attente_confirmation'].includes(l.crmStage))
          );
          activeLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return activeLeads;
        }
      }
    } catch { /* ignore */ }
    return [];
  });
  
  const [loading, setLoading] = useState(() => leads.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [accessFilter, setAccessFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [savedOk, setSavedOk] = useState(false);
  const [leadPhotos, setLeadPhotos] = useState<Record<string, string>>({});



  useEffect(() => {

    // 2. Fetch fresh data
    fetchLeads(false);

    // Auto-refresh every 10 seconds to feel real-time when Admin grants access
    const interval = setInterval(() => {
      fetchLeads(false); // background fetch, no loading spinner
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeads = async (showLoading = true) => {
    if (showLoading && leads.length === 0) setLoading(true);
    try {
      const data = await loadLeads();
      const activeLeads = data.filter(l => 
        !l.type.startsWith('RECRUTEMENT:') && 
        (!l.crmStage || ['nouveau', 'contact_en_cours', 'rdv_fixe', 'attente_confirmation'].includes(l.crmStage))
      );
      activeLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLeads(activeLeads);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    const isUnlocked = !!(l as any).commercialUnlocked;
    const matchAccess = accessFilter === 'all' || 
                        (accessFilter === 'unlocked' && isUnlocked) || 
                        (accessFilter === 'locked' && !isUnlocked);

    const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.phone.includes(searchQuery) ||
           l.type.toLowerCase().includes(searchQuery.toLowerCase());
           
    return matchAccess && matchSearch;
  });

  useEffect(() => {
    const fetchPhotos = async () => {
      const missingPhotos = filteredLeads.filter(l => (l.photoCount || 0) > 0 && !leadPhotos[l.id]);
      if (missingPhotos.length === 0) return;
      
      const newPhotos: Record<string, string> = {};
      await Promise.all(
        missingPhotos.map(async (l) => {
          try {
            const photo = await loadLeadPhoto(l.id);
            if (photo) newPhotos[l.id] = photo;
          } catch (e) {
            console.error('Failed to load photo for', l.id);
          }
        })
      );
      
      if (Object.keys(newPhotos).length > 0) {
        setLeadPhotos(prev => ({ ...prev, ...newPhotos }));
      }
    };
    fetchPhotos();
  }, [filteredLeads, leadPhotos]);

  const stats = useMemo(() => {
    return {
      nouveaux: leads.filter(l => !l.crmStage || l.crmStage === 'nouveau').length,
      enAttente: leads.filter(l => l.crmStage === 'attente_confirmation').length,
      totalActive: leads.length
    };
  }, [leads]);

  const handleSave = async (nextStage?: string) => {
    if (!selectedLead) return;
    try {
      const updatedLead = { ...selectedLead, ...editForm, ...(nextStage ? { crmStage: nextStage } : {}) };
      await saveRecord('leads', updatedLead);
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead as Lead : l));
      setSavedOk(true);
      setTimeout(() => { 
        setSavedOk(false); 
        if (nextStage === 'confirme' || nextStage === 'annule') {
           setSelectedLead(null);
           fetchLeads(); // Refresh to remove confirmed/cancelled from this view
        }
      }, 1200);
    } catch (e) {
      alert(isAr ? 'حدث خطأ' : 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-100 overflow-hidden">
          <div className="h-full bg-indigo-500 w-2/3 animate-pulse" />
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',backgroundSize:'30px 30px'}} />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        {/* Top bar */}
        <div className={`flex items-center justify-between mb-6 relative z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              {currentUser?.photo ? (
                <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border-2 border-white/30" alt="" />
              ) : (
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                  <Users className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-indigo-600 rounded-full" />
            </div>
            <div className={isAr ? 'text-right' : ''}>
              <p className="text-white font-black text-sm uppercase tracking-tight">{currentUser?.nom || 'Commercial'}</p>
              <p className="text-indigo-200 text-[9px] font-bold uppercase tracking-widest">{isAr ? 'تجاري' : 'Commercial'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="w-9 h-9 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white text-[10px] font-black flex items-center justify-center">
              {isAr ? 'FR' : 'AR'}
            </button>
            <button onClick={onLogout} className="w-9 h-9 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Title */}
        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em] mb-1 relative z-10">BEYA CREATIVE</p>
        <h1 className="text-2xl font-black text-white tracking-tight mb-6 relative z-10">
          {isAr ? 'لوحة التحكم التجارية' : 'Tableau de Bord Commercial'}
        </h1>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[
            { icon: Target, value: stats.totalActive, label: isAr ? 'إجمالي' : 'Total', color: 'bg-white/20' },
            { icon: UserPlus, value: stats.nouveaux, label: isAr ? 'جديد' : 'Nouveaux', color: 'bg-emerald-400/20' },
            { icon: Clock, value: stats.enAttente, label: isAr ? 'انتظار' : 'Attente', color: 'bg-amber-400/20' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content lifted over hero */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="relative mb-6">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isAr ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={isAr ? 'بحث عن زبون أو طلب...' : 'Rechercher un prospect...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 shadow-sm`}
          />
        </div>

        <div className="bg-slate-100/80 p-1.5 rounded-2xl mb-8 flex gap-1.5 border border-slate-200/50 backdrop-blur-md">
          <button
            onClick={() => setAccessFilter('all')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              accessFilter === 'all' 
                ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-900/5 scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
            {isAr ? 'الكل' : 'Tous'}
          </button>
          <button
            onClick={() => setAccessFilter('unlocked')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              accessFilter === 'unlocked' 
                ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-900/5 scale-[1.02]' 
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> 
            {isAr ? 'مسموح التواصل' : 'Accès Donné'}
          </button>
          <button
            onClick={() => setAccessFilter('locked')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              accessFilter === 'locked' 
                ? 'bg-white text-rose-600 shadow-md ring-1 ring-slate-900/5 scale-[1.02]' 
                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/50'
            }`}
          >
            <LogOut className="w-4 h-4" style={{ transform: 'rotate(180deg)' }} /> 
            {isAr ? 'مقفل' : 'Verrouillé'}
          </button>
        </div>

        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
             <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-300">
               <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
               <p className="text-slate-500 font-bold uppercase text-xs">{isAr ? 'لا توجد طلبات حالياً' : 'Aucun prospect pour le moment'}</p>
             </div>
          ) : (
            (() => {
              const groupedLeads = filteredLeads.reduce((acc, lead) => {
                const key = lead.name.toLowerCase().trim();
                if (!acc[key]) acc[key] = { client: { ...lead }, requests: [] };
                acc[key].requests.push(lead);
                return acc;
              }, {} as Record<string, { client: Lead, requests: Lead[] }>);

              return Object.values(groupedLeads).map(group => {
                const { client, requests } = group;
                // Check if ANY lead in the group has been unlocked (not just the first)
                const isUnlocked = requests.some(r => !!(r as any).commercialUnlocked) || !!(client as any).commercialUnlocked;
                const displayPhone = isUnlocked ? client.phone : client.phone.substring(0, 4) + ' ••• ••• •••';
                const hasPriority = requests.some(r => r.crmPriority);

                return (
                  <div key={client.phone + client.name} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all relative">
                    {/* CLIENT HEADER */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4 border-b border-slate-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 ${isUnlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            {client.name}
                            {hasPriority && <span className="text-xs">⭐</span>}
                            {!isUnlocked && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-black uppercase tracking-widest rounded shadow-sm">{isAr ? 'مقفل' : 'Verrouillé'}</span>}
                          </h3>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-slate-500 mt-1" dir="ltr">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-indigo-400" /> {displayPhone}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* CLIENT ACTIONS */}
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <>
                            <a href={`tel:${client.phone.replace(/\\D/g, '').startsWith('0') ? '212' + client.phone.replace(/\\D/g, '').substring(1) : client.phone.replace(/\\D/g, '')}`}
                              className="h-9 px-3 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2 text-xs font-black transition-all border border-slate-200 shadow-sm">
                              <PhoneCall className="w-4 h-4" /> {isAr ? 'اتصال' : 'Appel'}
                            </a>
                            <button onClick={() => {
                              const rawPhone = String(client.phone || '').replace(/\\D/g, '');
                              const phone = rawPhone.startsWith('2120') ? '212' + rawPhone.slice(3) : rawPhone.startsWith('0') ? '212' + rawPhone.slice(1) : rawPhone;
                              window.open(`https://wa.me/${phone}`, '_blank');
                            }}
                              className="h-9 px-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 border transition-all shadow-sm bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600">
                              <MessageCircle className="w-4 h-4" /> WhatsApp
                            </button>


                            <button onClick={() => alert(isAr ? 'ديفيز متوفر في الإدارة' : 'Le devis complet est géré par l\'administration')}
                              className="h-9 w-9 rounded-xl flex items-center justify-center border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm"
                            >
                              <Calculator className="w-4 h-4" />
                            </button>

                            <button onClick={() => alert(isAr ? 'تمت إضافة الزبون' : 'Le client est déjà enregistré')}
                              className="h-9 px-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl border border-emerald-200 text-[10px] font-black flex items-center gap-1 transition-all shadow-sm">
                              <CheckCircle className="w-4 h-4" /> {isAr ? 'تمت الإضافة كزبون' : 'Client Ajouté'}
                            </button>
                          </>
                        ) : (
                          <div className="h-9 px-3 bg-slate-50 text-slate-400 rounded-xl flex items-center gap-2 text-[10px] font-black border border-slate-200 shadow-sm cursor-not-allowed">
                            <Store className="w-3.5 h-3.5" /> {isAr ? 'بانتظار الصلاحية' : 'Accès requis'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* REQUESTS LIST */}
                    <div className="space-y-2">
                      {requests.map(req => (
                        <div key={req.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-xl border gap-4 transition-colors ${req.crmStage === 'confirme' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {leadPhotos[req.id] ? (
                              <img 
                                src={leadPhotos[req.id]} 
                                alt={req.type} 
                                onClick={() => window.open(leadPhotos[req.id], '_blank')}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                              />
                            ) : (
                              <div className="w-1.5 h-12 bg-indigo-100 rounded-full shrink-0"></div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="flex items-center gap-1 text-slate-700 font-black text-sm uppercase tracking-tight">
                                  {req.type} <span className="text-slate-400 text-xs font-bold">({req.quantity} pcs)</span>
                                </span>
                                {req.crmStage === 'confirme' && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> {isAr ? 'مؤكد' : 'Validé'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  <Clock className="w-3 h-3" /> {new Date(req.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                            {isUnlocked ? (
                              <>
                                <button onClick={async () => {
                                  const updated = { ...req, crmPriority: !req.crmPriority };
                                  setLeads(prev => prev.map(l => l.id === req.id ? updated : l));
                                  await saveRecord('leads', updated, true);
                                }} title={req.crmPriority ? 'Retirer priorité' : 'Marquer important'}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all border ${req.crmPriority ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-slate-200 opacity-50 hover:opacity-100'}`}>
                                  ⭐
                                </button>
                                
                                <div className="w-px h-5 bg-slate-200 mx-1" />

                                {req.crmStage !== 'annule' && req.crmStage !== 'confirme' && (
                                  <button onClick={async () => {
                                    if (window.confirm(isAr ? 'هل أنت متأكد من رفض هذا الطلب؟' : 'Voulez-vous vraiment refuser cette demande ?')) {
                                      const updated = { ...req, crmStage: 'annule' as const, rejectedAt: new Date().toISOString() };
                                      setLeads(prev => prev.map(l => l.id === req.id ? updated : l));
                                      await saveRecord('leads', updated, true);
                                    }
                                  }}
                                    className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                    ✕ {isAr ? 'رفض' : 'Refuser'}
                                  </button>
                                )}

                                {req.crmStage !== 'confirme' && req.crmStage !== 'annule' && (
                                  <>
                                    <button onClick={() => {
                                      setSelectedLead(req);
                                      setEditForm({
                                        crmStage: req.crmStage || 'nouveau',
                                        crmContactMethod: req.crmContactMethod,
                                        crmPrice: req.crmPrice,
                                        crmPriceConfirmed: req.crmPriceConfirmed,
                                        crmNotes: req.crmNotes
                                      });
                                    }}
                                      className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                      ✓ {isAr ? 'تأكيد' : 'Valider'}
                                    </button>

                                    <button onClick={() => alert(isAr ? 'تحليل الموديل متوفر في الإدارة' : 'L\'analyse de modèle est gérée par l\'administration')}
                                      className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-500 hover:text-white transition-all shadow-sm flex items-center gap-1">
                                      <Scissors className="w-3.5 h-3.5" /> {isAr ? 'تحليل الموديل' : 'Analyser Modèle'}
                                    </button>

                                    <button onClick={() => alert(isAr ? 'طلب تسعير الباترون متوفر في الإدارة' : 'Le prix de patronage est géré par l\'administration')}
                                      className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-500 hover:text-white transition-all shadow-sm flex items-center gap-1">
                                      <Scissors className="w-3.5 h-3.5" /> {isAr ? 'باترون' : 'Prix Patronage'}
                                    </button>
                                  </>
                                )}

                                <button onClick={() => {
                                  setSelectedLead(req);
                                  setEditForm({
                                    crmStage: req.crmStage || 'nouveau',
                                    crmContactMethod: req.crmContactMethod,
                                    crmPrice: req.crmPrice,
                                    crmPriceConfirmed: req.crmPriceConfirmed,
                                    crmNotes: req.crmNotes
                                  });
                                }} title="Notes"
                                  className="w-8 h-8 bg-white text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                
                                <button onClick={() => {
                                  setSelectedLead(req);
                                  setEditForm({
                                    crmStage: req.crmStage || 'nouveau',
                                    crmContactMethod: req.crmContactMethod,
                                    crmPrice: req.crmPrice,
                                    crmPriceConfirmed: req.crmPriceConfirmed,
                                    crmNotes: req.crmNotes
                                  });
                                }} title="Modifier"
                                  className="w-8 h-8 bg-white text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button onClick={async () => {
                                  if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Voulez-vous supprimer ce prospect ?')) {
                                    const updated = { ...req, crmStage: 'annule' as const };
                                    setLeads(prev => prev.map(l => l.id === req.id ? updated : l));
                                    await saveRecord('leads', updated, true);
                                  }
                                }} title="Supprimer"
                                  className="w-8 h-8 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button disabled className="h-8 px-3 rounded-lg text-[9px] font-black uppercase border bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed">
                                🔒 {isAr ? 'مغلق' : 'Bloqué'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">{isAr ? 'تأكيد الطلبية' : 'Confirmation Commande'}</h2>
              <button onClick={() => setSelectedLead(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              
              {/* Client Info */}
              <div className="flex items-center gap-4">
                {selectedLead.photo ? (
                  <img src={selectedLead.photo} className="w-14 h-14 rounded-full object-cover border border-slate-200" alt="" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg">
                    {selectedLead.name.substring(0,2)}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-800">{selectedLead.name}</h3>
                  <p className="text-xs font-bold text-slate-500" dir="ltr">{selectedLead.phone}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isAr ? 'المنتوج' : 'Produit'}</span>
                  <span className="text-sm font-bold text-slate-700">{selectedLead.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isAr ? 'الكمية' : 'Quantité'}</span>
                  <span className="text-sm font-bold text-slate-700">{selectedLead.quantity} pcs</span>
                </div>
              </div>

              {/* Confirmation Section (Blasa dial lconfirmation) */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {isAr ? 'منطقة التأكيد' : 'Zone de Confirmation'}
                </h4>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'ثمن القطعة (درهم)' : 'Prix Unitaire (DH)'}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={editForm.crmPrice || ''} 
                      onChange={(e) => setEditForm({ ...editForm, crmPrice: Number(e.target.value) })}
                      placeholder="0.00" 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-800 focus:ring-2 focus:ring-indigo-500/20" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'ملاحظات' : 'Notes (Options)'}</label>
                  <textarea 
                    value={editForm.crmNotes || ''} 
                    onChange={(e) => setEditForm({ ...editForm, crmNotes: e.target.value })}
                    rows={2} 
                    placeholder={isAr ? 'أضف ملاحظات...' : 'Ajoutez des notes...'}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 resize-none" 
                  />
                </div>

                {/* WhatsApp Confirmation Button */}
                <button
                    type="button"
                    onClick={() => {
                        let msg = isAr 
                            ? `مرحباً بك أستاذ(ة) *${selectedLead.name}* 👋\n\nنشكرك على تواصلك مع *BEYA CREATIVE* 🇲🇦.\nهذا تلخيص للطلبية ديالك باش نأكدوها:\n\n`
                            : `Bonjour M./Mme *${selectedLead.name}* 👋\n\nMerci d'avoir contacté *BEYA CREATIVE* 🇲🇦.\nVoici le récapitulatif de votre commande pour confirmation :\n\n`;

                        msg += isAr ? `📦 *المنتوج:* ${selectedLead.type}\n` : `📦 *Produit :* ${selectedLead.type}\n`;
                        msg += isAr ? `🔢 *الكمية:* ${selectedLead.quantity} قطعة\n` : `🔢 *Quantité :* ${selectedLead.quantity} pièces\n`;
                        
                        if (editForm.crmPrice) {
                            const unitPrice = editForm.crmPrice;
                            const qty = selectedLead.quantity || 1;
                            const totalPrice = unitPrice * qty;
                            const avance = (totalPrice * 0.5).toFixed(2);
                            
                            msg += isAr ? `🏷️ *ثمن القطعة:* ${unitPrice} درهم\n` : `🏷️ *Prix unitaire :* ${unitPrice} MAD\n`;
                            msg += isAr ? `💰 *السعر الإجمالي:* ${totalPrice} درهم\n` : `💰 *Prix total :* ${totalPrice} MAD\n`;
                            msg += isAr ? `💳 *التسبيق المطلوب (50%):* ${avance} درهم\n` : `💳 *Avance requise (50%) :* ${avance} MAD\n`;
                        }

                        const bName = company.bankName || 'CIH';
                        const bRib = company.rib || '230 000 0000000000000000 00';
                        const bBenef = company.bankBeneficiary || company.name || 'BEYA CREATIVE';

                        msg += isAr 
                            ? `\n🏦 *المعلومات البنكية (RIB):*\nالاسم/الشركة: ${bBenef}\nبنك: ${bName}\nRIB: ${bRib}\n\nالمرجو تأكيد الطلب بإرسال صورة التحويل (Reçu) باش نبداو الخدمة إن شاء الله ✨.\n\nتحياتنا!`
                            : `\n🏦 *Coordonnées Bancaires (RIB):*\nNom/Entreprise : ${bBenef}\nBanque : ${bName}\nRIB : ${bRib}\n\nMerci de confirmer la commande en nous envoyant le reçu du virement pour lancer la production ✨.\n\nCordialement!`;

                        let phone = selectedLead?.phone || '';
                        if (phone) {
                            phone = phone.replace(/\D/g, '');
                            if (phone.startsWith('0')) phone = '212' + phone.substring(1);
                        }
                        const encoded = encodeURIComponent(msg);
                        window.open(phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`, '_blank');
                        
                        // Automatically update stage to attente_confirmation when sending message
                        setEditForm(prev => ({ ...prev, crmStage: 'attente_confirmation' }));
                    }}
                    className="w-full py-4 bg-[#25D366] text-white font-black rounded-2xl hover:bg-[#128C7E] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 mt-4"
                >
                    <MessageCircle className="w-5 h-5" />
                    {isAr ? 'إرسال رسالة التأكيد عبر واتساب' : 'Envoyer Confirmation via WhatsApp'}
                </button>
              </div>

              {savedOk && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-center text-sm font-bold animate-in zoom-in">
                  {isAr ? 'تم حفظ التغييرات بنجاح!' : 'Modifications enregistrées !'}
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => handleSave('attente_confirmation')}
                className="flex-1 py-3.5 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-colors text-xs uppercase tracking-widest"
              >
                {isAr ? 'في الانتظار' : 'En Attente'}
              </button>
              <button 
                onClick={() => handleSave('confirme')}
                className="flex-[1.5] py-3.5 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isAr ? 'تأكيد الطلبية ✓' : 'Confirmer ✓'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
