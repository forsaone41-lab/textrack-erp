import React, { useState, useMemo } from 'react';
import { Employe, Presence } from '../types';
import { useLang } from '../contexts/LangContext';
import { Calendar, Clock, AlertTriangle, CheckCircle, Search, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { isHoliday, calculateWorkingHours } from '../utils/beyaRules';

interface Props {
  employes: Employe[];
  presences: Presence[];
}



export default function AgendaPresence({ employes, presences }: Props) {
  const { isAr } = useLang();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });

  const actifs = employes.filter(e => e.actif && e.type !== 'sous_traitance');
  const filtered = actifs.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.poste && e.poste.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = useMemo(() => {
    let totalRetards = 0;
    let totalAbsences = 0;
    let totalPresent = 0;

    const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const thisMonthPresences = presences.filter(p => p.date.startsWith(currentMonthStr));

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    filtered.forEach(emp => {
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentMonthStr}-${String(i).padStart(2, '0')}`;
        const d = new Date(year, month, i);
        
        // Skip Sundays and Holidays
        if (d.getDay() === 0 || isHoliday(dateStr)) continue;

        const p = thisMonthPresences.find(x => x.employeId === emp.id && x.date === dateStr);
        
        const isPastDay = dateStr < todayStr;
        const isToday = dateStr === todayStr;
        const shouldCountAbsence = isPastDay || (isToday && today.getHours() >= 10);

        if (p) {
          if (p.statut === 'retard') totalRetards++;
          if (p.statut === 'present' || p.statut === 'retard') totalPresent++;
          if (p.statut === 'absent') totalAbsences++;
        } else if (shouldCountAbsence) {
          totalAbsences++;
        }
      }
    });

    return { totalRetards, totalAbsences, totalPresent };
  }, [filtered, presences, month, year]);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {isAr ? 'أجندة الحضور' : 'Agenda des Présences'}
            </h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{monthName} | BEYA CREATIVE SYSTEM</p>
          </div>
        </div>

        <div className="flex flex-1 w-full lg:w-auto items-center justify-end gap-4">
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder={isAr ? 'البحث عن موظف...' : 'Rechercher...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none ${isAr ? 'pr-10 pl-4' : ''}`}
            />
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'}`} />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-sm font-black text-slate-700 min-w-[100px] text-center capitalize">{monthName}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-3 flex items-center gap-3">
        <Calculator className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
          {isAr 
            ? "يتم حساب الساعات خصماً لفترات الاستراحة (فطور: 11:00-11:15 | غداء: 14:00-14:45 | الجمعة: 13:30-14:45)"
            : "Les heures sont calculées en déduisant les pauses (11h00-11h15 | 14h00-14h45 | Vendredi 13h30-14h45)"}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-slate-100">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-black text-emerald-600/70 uppercase tracking-widest">{isAr ? 'أيام الحضور' : 'Jours Présents'}</p>
            <p className="text-2xl font-black text-emerald-700">{stats.totalPresent}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-black text-amber-600/70 uppercase tracking-widest">{isAr ? 'تأخيرات' : 'Retards'}</p>
            <p className="text-2xl font-black text-amber-700">{stats.totalRetards}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-black text-rose-600/70 uppercase tracking-widest">{isAr ? 'غيابات غير مبررة' : 'Absences'}</p>
            <p className="text-2xl font-black text-rose-700">{stats.totalAbsences}</p>
          </div>
        </div>
      </div>

      {/* Agenda Table */}
      <div className="overflow-x-auto p-6">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="sticky start-0 z-20 bg-white p-3 border-b-2 border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px] shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                {isAr ? 'الموظف' : 'Employé'}
              </th>
              {daysArray.map(day => (
                <th key={day} className="p-3 border-b-2 border-slate-200 text-center text-[10px] font-black text-slate-500 w-8">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400">{new Date(year, month, day).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { weekday: 'short' }).charAt(0)}</span>
                    <span className="text-sm text-slate-800">{day}</span>
                  </div>
                </th>
              ))}
              <th className="sticky end-0 z-20 bg-white p-3 border-b-2 border-slate-200 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                {isAr ? 'الساعات' : 'Heures'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(emp => {
              let totalMonthHours = 0;
              const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
              const thisMonthPresences = presences.filter(p => p.employeId === emp.id && p.date.startsWith(currentMonthStr));

              return (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="sticky start-0 z-10 bg-white group-hover:bg-slate-50 p-3 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                        {(emp.prenom?.[0] || '') + (emp.nom?.[0] || '')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{emp.prenom} {emp.nom}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.poste}</p>
                      </div>
                    </div>
                  </td>
                  
                  {daysArray.map(day => {
                    const dateStr = `${currentMonthStr}-${String(day).padStart(2, '0')}`;
                    const p = thisMonthPresences.find(x => x.date === dateStr);
                    
                    const d = new Date(year, month, day);
                    const isSunday = d.getDay() === 0;
                    const isFerie = isHoliday(dateStr);
                    
                    let bgClass = "bg-slate-100/50 text-slate-300";
                    let tooltip = isAr ? 'لا يوجد تسجيل' : 'Aucun pointage';
                    let cellText = '';

                    if (p) {
                      const hours = calculateWorkingHours(p.heureEntree, p.heureSortie, dateStr);
                      totalMonthHours += hours;
                      
                      if (p.statut === 'present') {
                        bgClass = "bg-emerald-100 text-emerald-600";
                        tooltip = `Entrée: ${p.heureEntree || '--'} | Sortie: ${p.heureSortie || '--'} (${hours.toFixed(1)}h)`;
                        cellText = 'P';
                      } else if (p.statut === 'retard') {
                        bgClass = "bg-amber-100 text-amber-600";
                        tooltip = `Retard - Entrée: ${p.heureEntree || '--'} | Sortie: ${p.heureSortie || '--'} (${hours.toFixed(1)}h)`;
                        cellText = 'R';
                      } else if (p.statut === 'absent') {
                        bgClass = "bg-rose-100 text-rose-600";
                        tooltip = "Absent";
                        cellText = 'A';
                      }
                    } else if (isSunday) {
                      bgClass = "bg-slate-50";
                    } else if (isFerie) {
                      bgClass = "bg-sky-100 text-sky-600";
                      tooltip = isAr ? "يوم عطلة / عيد" : "Jour Férié";
                      cellText = 'H';
                    }

                    return (
                      <td key={day} className="p-1.5 text-center">
                        <div 
                          className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-transform hover:scale-110 ${bgClass}`}
                          title={tooltip}
                        >
                          {cellText}
                        </div>
                      </td>
                    );
                  })}

                  <td className="sticky end-0 z-10 bg-white group-hover:bg-slate-50 p-3 text-center shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black rounded-lg text-xs">
                      {totalMonthHours.toFixed(1)}h
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
