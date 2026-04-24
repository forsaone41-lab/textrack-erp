import { useState, useEffect } from 'react';
import { LogIn, LogOut, UserCheck, UserX, Clock, Users, CalendarDays, QrCode, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Employe, Presence, loadData, saveRecord, genId } from '../types';

const HEURE_LIMITE_RETARD = '08:30';

function heureNow() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function dateNow() {
  return new Date().toISOString().split('T')[0];
}

function duree(entree: string, sortie: string) {
  const [h1, m1] = entree.split(':').map(Number);
  const [h2, m2] = sortie.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins <= 0) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`;
}

export default function Pointage() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [selectedDate, setSelectedDate] = useState(dateNow());
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<Presence>('presences')
    ]).then(([emps, pres]) => {
      setEmployes(emps);
      setPresences(pres);
    });
  }, []);

  const actifs = employes.filter(e => e.actif);

  function getPresence(empId: string) {
    return presences.find(p => p.employeId === empId && p.date === selectedDate) ?? null;
  }

  async function marquerEntree(empId: string) {
    const now = heureNow();
    const statut = now > HEURE_LIMITE_RETARD ? 'retard' : 'present';
    const existing = getPresence(empId);
    
    let updatedRecord: Presence;
    if (existing) {
      updatedRecord = { ...existing, heureEntree: now, statut };
    } else {
      updatedRecord = { id: genId(), employeId: empId, date: selectedDate, heureEntree: now, heureSortie: null, statut };
    }
    
    const updatedList = existing 
      ? presences.map(p => p.id === existing.id ? updatedRecord : p)
      : [...presences, updatedRecord];
      
    setPresences(updatedList);
    await saveRecord('presences', updatedRecord);
  }

  async function marquerSortie(empId: string) {
    const now = heureNow();
    const existing = getPresence(empId);
    if (!existing) return;
    
    const updatedRecord = { ...existing, heureSortie: now };
    const updatedList = presences.map(p => p.id === existing.id ? updatedRecord : p);
    
    setPresences(updatedList);
    await saveRecord('presences', updatedRecord);
  }

  async function marquerAbsent(empId: string) {
    const existing = getPresence(empId);
    let updatedRecord: Presence;
    
    if (existing) {
      updatedRecord = { ...existing, heureEntree: null, heureSortie: null, statut: 'absent' };
    } else {
      updatedRecord = { id: genId(), employeId: empId, date: selectedDate, heureEntree: null, heureSortie: null, statut: 'absent' };
    }
    
    const updatedList = existing 
      ? presences.map(p => p.id === existing.id ? updatedRecord : p)
      : [...presences, updatedRecord];
      
    setPresences(updatedList);
    await saveRecord('presences', updatedRecord);
  }

  const empName = (e: Employe) => e.prenom ? `${e.prenom} ${e.nom}` : e.nom;

  const presents = actifs.filter(e => { const p = getPresence(e.id); return p && p.statut !== 'absent'; });
  const absents = actifs.filter(e => { const p = getPresence(e.id); return !p || p.statut === 'absent'; });
  const retards = actifs.filter(e => { const p = getPresence(e.id); return p && p.statut === 'retard'; });
  const enCours = actifs.filter(e => { const p = getPresence(e.id); return p && p.heureEntree && !p.heureSortie; });

  async function handleScan(text: string) {
    if (!text) return;
    
    // Check if the text matches an employee ID or CIN
    const emp = employes.find(e => e.id === text || e.cin === text);
    
    if (!emp) {
      setScanStatus({ msg: `Ouvrier non trouvé (${text})`, type: 'error' });
      setTimeout(() => setScanStatus(null), 3000);
      return;
    }
    
    const p = getPresence(emp.id);
    if (!p || !p.heureEntree) {
      await marquerEntree(emp.id);
      setScanStatus({ msg: `Entrée enregistrée: ${empName(emp)}`, type: 'success' });
    } else if (!p.heureSortie) {
      await marquerSortie(emp.id);
      setScanStatus({ msg: `Sortie enregistrée: ${empName(emp)}`, type: 'success' });
    } else {
      setScanStatus({ msg: `${empName(emp)} a déjà complété sa journée`, type: 'error' });
    }
    
    setTimeout(() => {
      setScanStatus(null);
      setShowScanner(false);
    }, 2500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pointage Présences</h1>
          <p className="text-slate-500 text-sm">Suivi des entrées et sorties du personnel</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            Scanner Badge
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-sm text-slate-700 outline-none"
            />
          </div>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" /> Scanner un Badge
              </h3>
              <button onClick={() => setShowScanner(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 relative">
              {scanStatus ? (
                <div className={`p-4 rounded-xl text-center mb-4 ${scanStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="font-bold">{scanStatus.msg}</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden shadow-inner border-2 border-indigo-100">
                  <Scanner 
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        handleScan(result[0].rawValue);
                      }
                    }} 
                  />
                </div>
              )}
              <p className="text-center text-xs text-slate-400 mt-4">Placez le QR Code de l'employé au centre de la caméra</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs text-slate-500">Présents</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{presents.length}</p>
          <p className="text-xs text-slate-400">/ {actifs.length} employés</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-4 h-4 text-red-500" />
            <span className="text-xs text-slate-500">Absents</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{absents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500">Retards</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{retards.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">En cours</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{enCours.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Liste du Personnel</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {actifs.map(emp => {
            const p = getPresence(emp.id);
            const isAbsent = !p || p.statut === 'absent';
            const hasEntree = p && p.heureEntree;
            const hasSortie = p && p.heureSortie;
            const isRetard = p && p.statut === 'retard';

            return (
              <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                {/* Employé info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${
                    emp.type === 'atelier' ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-blue-400 to-indigo-600'
                  }`}>
                    {emp.prenom ? emp.prenom[0] : emp.nom[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{empName(emp)}</p>
                    <p className="text-xs text-slate-400">{emp.poste}</p>
                  </div>
                </div>

                {/* Statut badge */}
                <div className="flex-shrink-0">
                  {isAbsent && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                      <UserX className="w-3 h-3" /> Absent
                    </span>
                  )}
                  {hasEntree && !hasSortie && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isRetard ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Clock className="w-3 h-3" /> {isRetard ? 'Retard' : 'En cours'}
                    </span>
                  )}
                  {hasEntree && hasSortie && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                      <UserCheck className="w-3 h-3" /> Terminé
                    </span>
                  )}
                </div>

                {/* Heures */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center min-w-[60px]">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Entrée</p>
                    <p className={`text-sm font-semibold ${hasEntree ? (isRetard ? 'text-amber-600' : 'text-green-600') : 'text-slate-300'}`}>
                      {p?.heureEntree ?? '--:--'}
                    </p>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Sortie</p>
                    <p className={`text-sm font-semibold ${hasSortie ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {p?.heureSortie ?? '--:--'}
                    </p>
                  </div>
                  <div className="text-center min-w-[50px]">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Durée</p>
                    <p className="text-sm font-semibold text-slate-600">
                      {hasEntree && hasSortie ? duree(p!.heureEntree!, p!.heureSortie!) : '-'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {selectedDate === dateNow() && (
                    <>
                      {!hasEntree && (
                        <>
                          <button
                            onClick={() => marquerEntree(emp.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition font-medium"
                          >
                            <LogIn className="w-3.5 h-3.5" /> Entrée
                          </button>
                          <button
                            onClick={() => marquerAbsent(emp.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition font-medium"
                          >
                            <UserX className="w-3.5 h-3.5" /> Absent
                          </button>
                        </>
                      )}
                      {hasEntree && !hasSortie && (
                        <button
                          onClick={() => marquerSortie(emp.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 transition font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sortie
                        </button>
                      )}
                      {hasSortie && (
                        <span className="text-xs text-slate-400 italic">Journée terminée</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {actifs.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun employé actif trouvé</p>
        </div>
      )}
    </div>
  );
}
