import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Package, 
  Scissors, 
  Trash2, 
  X,
  AlertCircle,
  CheckCircle2,
  Bell,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  loadData, 
  saveRecord, 
  deleteRecord, 
  genId, 
  Commande, 
  Lead as Demande, 
  Appointment 
} from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

export default function Agenda() {
  const { lang, isAr } = useLang();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [newAppt, setNewAppt] = useState<Partial<Appointment>>({
    type: 'reunion',
    priority: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cmds, dems, appts] = await Promise.all([
        loadData<Commande>('commandes'),
        loadData<Demande>('leads'),
        loadData<Appointment>('appointments')
      ]);
      setCommandes(cmds || []);
      setDemandes(dems || []);
      setAppointments(appts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = useMemo(() => {
    return currentDate.toLocaleString(lang === 'ar' ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });
  }, [currentDate, lang]);

  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    
    // Empty days from prev month
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    
    return days;
  }, [currentDate]);

  const getDayEvents = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    
    const cmdEvents = commandes
      .filter(c => c.dateLivraisonPrevue && c.dateLivraisonPrevue.startsWith(dStr))
      .map(c => ({ id: c.id, title: c.modele, type: 'livraison' as const, reference: c.reference }));
      
    const demoEvents = demandes
      .filter(d => d.date && d.date.startsWith(dStr))
      .map(d => ({ id: d.id, title: d.name, type: 'echantillon' as const, reference: 'DEM' }));
      
    const customEvents = appointments
      .filter(a => a.date && a.date.startsWith(dStr))
      .map(a => ({ id: a.id, title: a.title, type: a.type, reference: 'APPT' }));
      
    return [...cmdEvents, ...demoEvents, ...customEvents];
  };

  const handleSaveAppt = async () => {
    if (!newAppt.title || !newAppt.date) return;
    const appt: Appointment = {
      ...newAppt as Appointment,
      id: genId()
    };
    await saveRecord('appointments', appt);
    setAppointments([...appointments, appt]);
    setShowModal(false);
    setNewAppt({ type: 'reunion', priority: 'medium' });
  };

  const handleDeleteAppt = async (id: string) => {
    if (!confirm(isAr ? 'هل تريد حذف هذا الموعد؟' : 'Supprimer ce rendez-vous ?')) return;
    await deleteRecord('appointments', id);
    setAppointments(appointments.filter(a => a.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header PRO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transform -rotate-3 transition-transform">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{isAr ? 'أجندة الإنتاج' : 'Agenda de Production'}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">BEYA Elite Planning Hub</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={goToToday}
            className="px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
          >
            {isAr ? 'اليوم' : "Aujourd'hui"}
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? 'إضافة موعد' : 'Nouveau RDV'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar View */}
        <div className={`${isFullWidth ? 'lg:col-span-12' : 'lg:col-span-8'} bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col transition-all duration-500`}>
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{monthName}</h2>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setIsFullWidth(!isFullWidth)}
                 className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 mr-2 group"
                 title={isAr ? 'عرض كامل' : 'Plein écran'}
               >
                 {isFullWidth ? <Minimize2 className="w-5 h-5 text-indigo-600" /> : <Maximize2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />}
               </button>
               <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
               <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-50">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="py-4 text-center text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tight md:tracking-widest border-r border-slate-50 last:border-r-0">
                {isAr ? (d === 'Lun' ? 'إثن' : d === 'Mar' ? 'ثلا' : d === 'Mer' ? 'أرب' : d === 'Jeu' ? 'خمي' : d === 'Ven' ? 'جمع' : d === 'Sam' ? 'سبت' : 'أحد') : d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/30 border-r border-b border-slate-50 h-32 md:h-40" />;
              
              const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
              const events = getDayEvents(day);
              
              return (
                <div key={day.toISOString()} className={`relative border-r border-b border-slate-50 h-32 md:h-40 p-4 transition-colors hover:bg-slate-50/50 group/day ${isToday ? 'bg-indigo-50/20' : ''}`}>
                  <span className={`text-xs font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg' : 'text-slate-400 group-hover/day:text-indigo-600'}`}>
                    {day.getDate()}
                  </span>
                  
                  <div className="mt-2 space-y-1 overflow-y-auto max-h-[80%] no-scrollbar">
                    {events.map(ev => {
                      const colors = {
                        livraison: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                        reunion: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                        paiement: 'bg-amber-50 text-amber-600 border-amber-100',
                        echantillon: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
                        autre: 'bg-slate-50 text-slate-500 border-slate-100'
                      };
                      return (
                        <div 
                          key={ev.id} 
                          className={`
                            px-1.5 md:px-2 py-0.5 md:py-1 
                            rounded-md md:rounded-lg border 
                            text-[7px] md:text-[8px] 
                            font-black uppercase 
                            leading-[1.1] md:leading-normal
                            break-words line-clamp-2 md:line-clamp-none
                            ${colors[ev.type as keyof typeof colors]}
                          `}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming & Legend */}
        {!isFullWidth && (
          <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-right duration-500">
             {/* legend */}
             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Bell className="w-4 h-4 text-indigo-500" /> {isAr ? 'دليل الألوان' : 'Légende Agenda'}</h3>
                <div className="grid grid-cols-1 gap-2">
                   <LegendItem color="bg-emerald-500" label={isAr ? 'تسليم طلبيات' : 'Livraisons Commandes'} />
                   <LegendItem color="bg-fuchsia-500" label={isAr ? 'عينات وطلبات' : 'Échantillons & Leads'} />
                   <LegendItem color="bg-indigo-500" label={isAr ? 'اجتماعات ومواعيد' : 'Réunions & RDV'} />
                   <LegendItem color="bg-amber-500" label={isAr ? 'دفعات مالية' : 'Paiements & Échéances'} />
                </div>
             </div>

             {/* Upcoming Events */}
             <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-indigo-400"><Clock className="w-4 h-4" /> {isAr ? 'المواعيد القادمة' : 'Prochains Événements'}</h3>
                <div className="space-y-4">
                  {appointments.length === 0 && <p className="text-[10px] text-slate-500 italic uppercase">{isAr ? 'لا توجد مواعيد مخصصة' : 'Aucun RDV programmé'}</p>}
                  {appointments.slice(0, 5).map(appt => (
                    <div key={appt.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{appt.title}</p>
                        <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">{new Date(appt.date).toLocaleDateString()} · {appt.type}</p>
                      </div>
                      <button onClick={() => handleDeleteAppt(appt.id)} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden p-10 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'إضافة موعد جديد' : 'Nouveau Rendez-vous'}</h3>
                 <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{isAr ? 'العنوان' : 'Titre du RDV'}</label>
                    <input type="text" value={newAppt.title || ''} onChange={e => setNewAppt({ ...newAppt, title: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 text-sm font-black outline-none focus:border-indigo-500 transition-all" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{isAr ? 'التاريخ' : 'Date'}</label>
                       <input type="date" value={newAppt.date || ''} onChange={e => setNewAppt({ ...newAppt, date: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 text-[10px] font-black outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{isAr ? 'النوع' : 'Catégorie'}</label>
                       <select value={newAppt.type} onChange={e => setNewAppt({ ...newAppt, type: e.target.value as any })} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 text-[10px] font-black outline-none focus:border-indigo-500 transition-all appearance-none">
                          <option value="reunion">Réunion</option>
                          <option value="livraison">Livraison</option>
                          <option value="paiement">Paiement</option>
                          <option value="autre">Autre</option>
                       </select>
                    </div>
                 </div>

                 <button 
                   onClick={handleSaveAppt}
                   className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                 >
                   <CheckCircle2 className="w-4 h-4" /> {isAr ? 'حفظ الموعد' : 'Enregistrer le RDV'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}
