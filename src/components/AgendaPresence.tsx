import React, { useState, useMemo } from 'react';
import { Employe, Presence } from '../types';
import { useLang } from '../contexts/LangContext';
import { Calendar, Clock, AlertTriangle, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  employes: Employe[];
  presences: Presence[];
}

function calculateHours(entree: string | null, sortie: string | null) {
  if (!entree || !sortie) return 0;
  try {
    const [eH, eM] = entree.split(':').map(Number);
    const [sH, sM] = sortie.split(':').map(Number);
    const diff = (sH + sM / 60) - (eH + eM / 60);
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

export default function AgendaPresence({ employes, presences }: Props) {
  const { isAr } = useLang();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  
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

    filtered.forEach(emp => {
      // Find all valid work days this month (Mon-Sat usually, but let's just count days up to today if current month)
      const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
      const daysToCount = isCurrentMonth ? new Date().getDate() : daysInMonth;

      for (let i = 1; i <= daysToCount; i++) {
        const dateStr = `${currentMonthStr}-${String(i).padStart(2, '0')}`;
        // Skip Sundays
        const d = new Date(year, month, i);
        if (d.getDay() === 0) continue;

        const p = thisMonthPresences.find(x => x.employeId === emp.id && x.date === dateStr);
        if (p) {
          if (p.statut === 'retard') totalRetards++;
          if (p.statut === 'present' || p.statut === 'retard') totalPresent++;
          if (p.statut === 'absent') totalAbsences++;
        } else {
          // If no record and it's a past day, it's an absence
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
              {isAr ? 'أجندة الحضور الشهري' : 'Agenda des Présences'}
            </h2>
            <p className="text-sm font-bold text-slate-500">{monthName.toUpperCase()}</p>
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
            <span className="text-sm font-black text-slate-700 min-w-[100px] text-center">{monthName}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
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
            <p className="text-xs font-black text-rose-600/70 uppercase tracking-widest">{isAr ? 'غيابات' : 'Absences'}</p>
            <p className="text-2xl font-black text-rose-700">{stats.totalAbsences}</p>
          </div>
        </div>
      </div>

      {/* Agenda Table */}
      <div className="overflow-x-auto p-6">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-white p-3 border-b-2 border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">
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
              <th className="p-3 border-b-2 border-slate-200 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
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
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
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
                    
                    let bgClass = "bg-slate-100/50";
                    let tooltip = isAr ? 'لا يوجد تسجيل' : 'Aucun pointage';

                    if (p) {
                      totalMonthHours += calculateHours(p.heureEntree, p.heureSortie);
                      if (p.statut === 'present') {
                        bgClass = "bg-emerald-100 text-emerald-600";
                        tooltip = `Entrée: ${p.heureEntree || '--'} | Sortie: ${p.heureSortie || '--'}`;
                      } else if (p.statut === 'retard') {
                        bgClass = "bg-amber-100 text-amber-600";
                        tooltip = `Retard - Entrée: ${p.heureEntree || '--'} | Sortie: ${p.heureSortie || '--'}`;
                      } else if (p.statut === 'absent') {
                        bgClass = "bg-rose-100 text-rose-600";
                        tooltip = "Absent";
                      }
                    } else if (isSunday) {
                      bgClass = "bg-slate-50";
                    }

                    return (
                      <td key={day} className="p-1.5 text-center">
                        <div 
                          className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-transform hover:scale-110 ${bgClass}`}
                          title={tooltip}
                        >
                          {p?.statut === 'present' ? 'P' : p?.statut === 'retard' ? 'R' : p?.statut === 'absent' ? 'A' : ''}
                        </div>
                      </td>
                    );
                  })}

                  <td className="p-3 text-center">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-black rounded-lg text-xs">
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
