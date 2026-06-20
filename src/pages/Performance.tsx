import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Trophy, TrendingUp, Target, Users, Medal } from 'lucide-react';
import { Employe, PointageEntry, Presence, loadData } from '../types';
import { useLang } from '../contexts/LangContext';
import AgendaPresence from '../components/AgendaPresence';

interface EmpStats {
  emp: Employe;
  totalPieces: number;
  totalRebut: number;
  efficiency: number;
  presenceRate: number;
  score: number;
  sessions: number;
}

function calcStats(employes: Employe[], pointages: PointageEntry[], presences: Presence[]): EmpStats[] {
  const today = new Date().toISOString().split('T')[0];
  const allDates = [...new Set(presences.map(p => p.date))];

  return employes
    .filter(e => e.actif)
    .map(emp => {
      const pts = pointages.filter(p => p.employeId === emp.id);
      const totalPieces = pts.reduce((a, p) => a + p.piecesCompletees, 0);
      const totalRebut = pts.reduce((a, p) => a + p.rebut, 0);
      const bonnes = totalPieces - totalRebut;
      const efficiency = totalPieces > 0 ? Math.round((bonnes / totalPieces) * 100) : 0;

      const empPresences = presences.filter(p => p.employeId === emp.id && p.date <= today);
      const daysPresent = empPresences.filter(p => p.statut !== 'absent').length;
      const presenceRate = allDates.length > 0 ? Math.round((daysPresent / allDates.length) * 100) : 0;

      const score = Math.round(efficiency * 0.6 + presenceRate * 0.4);

      return { emp, totalPieces, totalRebut, efficiency, presenceRate, score, sessions: pts.length };
    })
    .filter(s => s.totalPieces > 0 || s.sessions > 0)
    .sort((a, b) => b.score - a.score);
}

const MEDAL_COLORS = ['from-yellow-400 to-amber-500', 'from-slate-300 to-slate-400', 'from-orange-400 to-amber-600'];
const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

const empInitials = (e: Employe) => {
  if (!e) return '??';
  if (e.prenom && e.nom) return (e.prenom?.[0] || '') + (e.nom?.[0] || '');
  return (e.nom || '??').substring(0, 2).toUpperCase();
};
const empName = (e: Employe) => e.prenom ? `${e.prenom} ${e.nom}` : e.nom;

export default function Performance() {
  const { isAr } = useLang();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [view, setView] = useState<'production' | 'presence'>('production');

  useEffect(() => {
    Promise.all([
      loadData<Employe>('employes'),
      loadData<PointageEntry>('pointages'),
      loadData<Presence>('presences')
    ]).then(([emp, pts, pres]) => {
      setEmployes(emp);
      setPointages(pts);
      setPresences(pres);
    });
  }, []);

  const stats = calcStats(employes, pointages, presences);
  const top3 = stats.slice(0, 3);

  const barData = stats.map(s => ({
    name: s.emp.prenom || s.emp.nom.split(' ')[0],
    Efficacité: s.efficiency,
    Présence: s.presenceRate,
  }));

  const radarData = [
    { subject: isAr ? 'الكفاءة' : 'Efficacité', ...Object.fromEntries(top3.map(s => [s.emp.prenom || s.emp.nom.split(' ')[0], s.efficiency])) },
    { subject: isAr ? 'الحضور' : 'Présence', ...Object.fromEntries(top3.map(s => [s.emp.prenom || s.emp.nom.split(' ')[0], s.presenceRate])) },
    { subject: isAr ? 'القطع' : 'Pièces', ...Object.fromEntries(top3.map(s => [s.emp.prenom || s.emp.nom.split(' ')[0], Math.min(s.totalPieces, 120)])) },
    { subject: isAr ? 'الجلسات' : 'Sessions', ...Object.fromEntries(top3.map(s => [s.emp.prenom || s.emp.nom.split(' ')[0], Math.min(s.sessions * 10, 120)])) },
    { subject: isAr ? 'الجودة' : 'Qualité', ...Object.fromEntries(top3.map(s => [s.emp.prenom || s.emp.nom.split(' ')[0], s.totalPieces > 0 ? Math.min(100 - (s.totalRebut / s.totalPieces) * 100, 120) : 0])) },
  ];

  const radarColors = ['#6366f1', '#22c55e', '#f59e0b'];

  const totPieces = stats.reduce((a, s) => a + s.totalPieces, 0);
  const totRebut = stats.reduce((a, s) => a + s.totalRebut, 0);
  const avgEff = stats.length > 0 ? Math.round(stats.reduce((a, s) => a + s.efficiency, 0) / stats.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{isAr ? "أداء العمال" : "Performance des Ouvriers"}</h1>
        <p className="text-slate-500 text-sm">{isAr ? "تتبع الإنتاجية والجودة" : "Suivi de la productivité et de la qualité"}</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl"><TrendingUp className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <p className="text-xs text-slate-400">{isAr ? "متوسط الكفاءة" : "Efficacité moyenne"}</p>
            <p className="text-2xl font-bold text-indigo-600">{avgEff}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl"><Target className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-xs text-slate-400">{isAr ? "القطع المنتجة" : "Pièces produites"}</p>
            <p className="text-2xl font-bold text-green-600">{totPieces}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl"><Users className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-xs text-slate-400">{isAr ? "إجمالي التالف" : "Total rebut"}</p>
            <p className="text-2xl font-bold text-red-500">{totRebut}</p>
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((s, i) => (
            <div key={s.emp.id} className={`relative rounded-xl p-5 bg-gradient-to-br ${MEDAL_COLORS[i]} text-white shadow-lg overflow-hidden`}>
              <div className="absolute top-3 right-3 text-2xl">{MEDAL_ICONS[i]}</div>
              <div className="absolute top-3 left-3">
                <Medal className="w-5 h-5 opacity-60" />
              </div>
              <div className="mt-6 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg mb-3">
                  {empInitials(s.emp)}
                </div>
                <p className="font-bold text-lg leading-tight">{empName(s.emp)}</p>
                <p className="text-xs opacity-70 mt-0.5">{s.emp.poste}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wide">{isAr ? "القطع" : "Pièces"}</p>
                  <p className="text-2xl font-bold">{s.totalPieces}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wide">{isAr ? "الكفاءة" : "Efficacité"}</p>
                  <p className="text-2xl font-bold">{s.efficiency}%</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs opacity-70 mb-1">
                  <span>{isAr ? "النقاط الإجمالية" : "Score global"}</span><span>{s.score}%</span>
                </div>
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${s.score}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            {isAr ? "الكفاءة لكل عامل" : "Efficacité par Ouvrier"}
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 120]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="Efficacité" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400 text-center py-16">{isAr ? "لا توجد بيانات متاحة" : "Aucune donnée disponible"}</p>}
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            {isAr ? "تحليل شامل" : "Analyse Globale"}
          </h3>
          {top3.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 120]} tick={{ fontSize: 10 }} />
                {top3.map((s, i) => (
                  <Radar
                    key={s.emp.id}
                    name={s.emp.prenom || s.emp.nom.split(' ')[0]}
                    dataKey={s.emp.prenom || s.emp.nom.split(' ')[0]}
                    stroke={radarColors[i]}
                    fill={radarColors[i]}
                    fillOpacity={0.2}
                  />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400 text-center py-16">{isAr ? "لا توجد بيانات متاحة" : "Aucune donnée disponible"}</p>}
        </div>
      </div>

      {/* Full Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">{isAr ? "التصنيف الكامل" : "Classement Complet"}</h3>
        </div>
        {stats.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isAr ? "لا توجد بيانات تسجيل متاحة" : "Aucune donnée de pointage disponible"}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{isAr ? "العامل" : "Ouvrier"}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{isAr ? "القطع" : "Pièces"}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{isAr ? "التالف" : "Rebut"}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{isAr ? "الكفاءة" : "Efficacité"}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{isAr ? "الحضور" : "Présence"}</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{isAr ? "النقاط" : "Score"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((s, i) => (
                <tr key={s.emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-bold text-slate-400">
                    {i < 3 ? <span className="text-lg">{MEDAL_ICONS[i]}</span> : i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${s.emp.type === 'atelier' ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-blue-400 to-indigo-600'
                        }`}>{empInitials(s.emp)}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{empName(s.emp)}</p>
                        <p className="text-xs text-slate-400">{s.emp.poste}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">{s.totalPieces}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-red-500">{s.totalRebut}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.efficiency >= 90 ? 'bg-green-500' : s.efficiency >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${s.efficiency}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-10">{s.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">{s.presenceRate}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${s.score >= 85 ? 'bg-green-100 text-green-700' :
                        s.score >= 65 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-600'
                      }`}>{s.score}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
