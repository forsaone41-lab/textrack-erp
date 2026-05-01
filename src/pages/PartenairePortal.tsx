import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle, ExternalLink, 
  ChevronRight, LogOut, LayoutDashboard, FileText, 
  Bell, Settings, User as UserIcon, HelpCircle, 
  Search, Filter, Calendar, MessageSquare
} from 'lucide-react';
import { User, Commande, loadData, saveRecord, loadCompanyProfile } from '../types';

interface PartenairePortalProps {
  currentUser: User;
  onLogout: () => void;
}

export default function PartenairePortal({ currentUser, onLogout }: PartenairePortalProps) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const company = loadCompanyProfile();
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allCmds = await loadData<Commande>('commandes') || [];
      // Filter commands assigned to this partner (by ID or Email/Name match as fallback)
      const assigned = allCmds.filter(c => 
        c.partenaireId === currentUser.id || 
        c.partenaireId === currentUser.employeId
      );
      setCommandes(assigned);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (cmd: Commande, newStatus: Commande['statut']) => {
    // Subcontractors usually mark their part as finished
    // For now, let's just update the main status or add a tracking note
    const updated = {
      ...cmd,
      suivi: [...(cmd.suivi || []), { 
        phase: cmd.phase, 
        date: new Date().toISOString(), 
        note: `Mise à jour par partenaire (${currentUser.nom})` 
      }]
    };
    await saveRecord('commandes', updated);
    setCommandes(prev => prev.map(c => c.id === cmd.id ? updated : c));
  };

  const filtered = commandes.filter(c => 
    c.reference.toLowerCase().includes(search.toLowerCase()) || 
    c.modele.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Pro Design */}
      <div className="hidden lg:flex w-72 bg-slate-900 flex-col border-r border-slate-800">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-tighter uppercase leading-none">{company.name.split(' ')[0]}</h1>
              <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1">Partner Hub</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavBtn active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<LayoutDashboard className="w-5 h-5" />} label="Tableau de bord" />
            <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock className="w-5 h-5" />} label="Historique" />
            <div className="pt-4 mt-4 border-t border-slate-800">
              <NavBtn active={false} onClick={() => {}} icon={<Bell className="w-5 h-5" />} label="Notifications" />
              <NavBtn active={false} onClick={() => {}} icon={<Settings className="w-5 h-5" />} label="Paramètres" />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black">
                {currentUser.nom[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-black uppercase truncate">{currentUser.nom}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase truncate">{currentUser.role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {activeTab === 'tasks' ? 'Missions en cours' : 'Archives & Historique'}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Bienvenue, {currentUser.nom}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Chercher une mission..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 w-64 outline-none transition-all"
              />
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Missions actives" value={commandes.filter(c => c.statut === 'en_cours').length} icon={<LayoutDashboard className="w-5 h-5" />} color="indigo" />
            <StatCard label="Terminées (30j)" value={commandes.filter(c => c.statut === 'terminé').length} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
            <StatCard label="Temps moyen" value="4.2j" icon={<Clock className="w-5 h-5" />} color="amber" />
          </div>

          {/* List Section */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Liste des Missions
              </h3>
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement...</div>
              ) : filtered.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black uppercase tracking-tight">Aucune mission trouvée</p>
                    <p className="text-slate-500 text-xs mt-1 font-bold">Vous n'avez pas de travaux assignés pour le moment.</p>
                  </div>
                </div>
              ) : (
                filtered.map(cmd => (
                  <div key={cmd.id} className="p-6 hover:bg-slate-50 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0">
                          {cmd.modelePhoto ? (
                            <img src={cmd.modelePhoto} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-black">?</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{cmd.reference}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cmd.client}</span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{cmd.modele}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              {cmd.quantite} Pièces
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Délai: {new Date(cmd.dateLivraisonPrevue).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                          cmd.statut === 'en_cours' 
                            ? 'bg-amber-50 border-amber-500/20 text-amber-600' 
                            : 'bg-emerald-50 border-emerald-500/20 text-emerald-600'
                        }`}>
                          {cmd.statut.replace('_', ' ')}
                        </div>
                        <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm uppercase tracking-tighter ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: 'indigo' | 'emerald' | 'amber' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className={`p-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center border shadow-sm`}>
        {icon}
      </div>
    </div>
  );
}
