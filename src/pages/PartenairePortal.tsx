import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle, ExternalLink, 
  ChevronRight, LogOut, LayoutDashboard, FileText, 
  Bell, Settings, User as UserIcon, HelpCircle, 
  Search, Filter, Calendar, MessageSquare, Save, UserCheck, Shield, Key
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
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'notifications' | 'settings'>('tasks');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [selectedCmd, setSelectedCmd] = useState<Commande | null>(null);

  // Settings state
  const [profileForm, setProfileForm] = useState({ nom: currentUser.nom, email: currentUser.email });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allCmds = await loadData<Commande>('commandes') || [];
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

  const handleUpdateProfile = async () => {
    const updatedUser = { ...currentUser, ...profileForm };
    await saveRecord('users', updatedUser);
    alert('Profil mis à jour avec succès !');
  };

  const updateStatus = async (cmdId: string, newStatus: Commande['statut']) => {
    const cmd = commandes.find(c => c.id === cmdId);
    if (!cmd) return;
    
    const updated = {
      ...cmd,
      statut: newStatus,
      suivi: [...(cmd.suivi || []), { 
        phase: cmd.phase, 
        date: new Date().toISOString(), 
        note: `Mis à jour via Portail Partenaire (Statut: ${newStatus})` 
      }]
    };
    await saveRecord('commandes', updated);
    setCommandes(prev => prev.map(c => c.id === cmdId ? updated : c));
    setSelectedCmd(updated);
  };

  const filtered = commandes.filter(c => {
    const matchSearch = c.reference.toLowerCase().includes(search.toLowerCase()) || 
                       c.modele.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'history') {
      return matchSearch && (c.statut === 'terminé' || c.statut === 'livré');
    }
    
    if (filter === 'active') return matchSearch && c.statut === 'en_cours';
    if (filter === 'done') return matchSearch && (c.statut === 'terminé' || c.statut === 'livré');
    
    return matchSearch;
  });

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
              <NavBtn active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell className="w-5 h-5" />} label="Notifications" />
              <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} label="Paramètres" />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-6 cursor-pointer hover:bg-slate-800 transition-all" onClick={() => setActiveTab('settings')}>
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
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              {activeTab === 'tasks' ? 'Missions en cours' : 
               activeTab === 'history' ? 'Archives & Historique' : 
               activeTab === 'notifications' ? 'Notifications' : 
               'Paramètres du compte'}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Bienvenue, {currentUser.nom}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Chercher..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 w-64 outline-none transition-all"
              />
            </div>
            <div 
              onClick={() => setActiveTab('notifications')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative cursor-pointer ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:text-indigo-600'}`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
          {activeTab === 'tasks' || activeTab === 'history' ? (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Missions actives" value={commandes.filter(c => c.statut === 'en_cours').length} icon={<LayoutDashboard className="w-5 h-5" />} color="indigo" />
                <StatCard label="Terminées (30j)" value={commandes.filter(c => c.statut === 'terminé' || c.statut === 'livré').length} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
                <StatCard label="Temps moyen" value="4.2j" icon={<Clock className="w-5 h-5" />} color="amber" />
              </div>

              {/* List Section */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    {activeTab === 'tasks' ? 'Liste des Missions' : 'Archives des Missions'}
                  </h3>
                  
                  {activeTab === 'tasks' && (
                    <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                      <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label="Toutes" />
                      <FilterBtn active={filter === 'active'} onClick={() => setFilter('active')} label="En cours" />
                      <FilterBtn active={filter === 'done'} onClick={() => setFilter('done')} label="Terminées" />
                    </div>
                  )}
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
                        <p className="text-slate-500 text-xs mt-1 font-bold">Rien à afficher ici.</p>
                      </div>
                    </div>
                  ) : (
                    filtered.map(cmd => (
                      <div key={cmd.id} onClick={() => setSelectedCmd(cmd)} className="p-6 hover:bg-slate-50 transition-all group cursor-pointer">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0 bg-slate-50">
                              {cmd.modelePhoto ? (
                                <img src={cmd.modelePhoto} className="w-full h-full object-cover" alt="" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase">BEYA</div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{cmd.reference}</span>
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
                                : cmd.statut === 'terminé' || cmd.statut === 'livré'
                                ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              {cmd.statut.replace('_', ' ')}
                            </div>
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : activeTab === 'notifications' ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { id: 1, title: 'Nouvelle mission assignée', desc: 'Une nouvelle mission de couture (REF-2024-001) vous a été assignée.', time: 'Il y a 2 heures', icon: Package, color: 'indigo' },
                { id: 2, title: 'Délai proche', desc: 'La mission T-SHIRT (REF-2024-005) arrive à échéance demain.', time: 'Il y a 5 heures', icon: Clock, color: 'amber' },
                { id: 3, title: 'Mission validée', desc: 'Votre travail sur la mission ECHANTILLON a été validé par le responsable.', time: 'Hier', icon: CheckCircle, color: 'emerald' },
              ].map(notif => (
                <div key={notif.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    notif.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                    notif.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                    'bg-emerald-50 text-emerald-500'
                  }`}>
                    <notif.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 uppercase tracking-tighter text-sm group-hover:text-indigo-600 transition-colors">{notif.title}</h4>
                    <p className="text-slate-500 text-xs font-bold mt-1">{notif.desc}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-3 tracking-widest">{notif.time}</p>
                  </div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Mon Profil & Paramètres
                  </h3>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl text-white font-black shadow-xl shadow-indigo-600/20">
                      {currentUser.nom[0]}
                    </div>
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Changer la photo</button>
                  </div>
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nom Complet</label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="text" 
                            value={profileForm.nom}
                            onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="email" 
                            value={profileForm.email}
                            onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Sécurité du compte</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connecté en tant que {currentUser.role}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleUpdateProfile}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Enregistrer
                      </button>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-900 uppercase tracking-tight italic">Mot de passe</p>
                        <p className="text-[10px] font-bold text-amber-700/70">Pour changer votre mot de passe, veuillez contacter l'administrateur de l'usine BEYA.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedCmd && (
        <div className="fixed inset-0 z-[300] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Détails de la Mission</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedCmd.reference}</p>
              </div>
              <button onClick={() => setSelectedCmd(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                <LogOut className="w-5 h-5 text-slate-400 rotate-180" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
                {selectedCmd.modelePhoto ? (
                  <img src={selectedCmd.modelePhoto} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-2xl uppercase tracking-widest italic text-center p-4">PAS DE PHOTO</div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">Nom du Modèle</label>
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedCmd.modele}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Quantité</label>
                    <p className="text-lg font-black text-slate-900">{selectedCmd.quantite} pcs</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Délai</label>
                    <p className="text-lg font-black text-slate-900">{new Date(selectedCmd.dateLivraisonPrevue).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Mettre à jour le statut</label>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCmd.statut !== 'terminé' && selectedCmd.statut !== 'livré' ? (
                      <button 
                        onClick={() => updateStatus(selectedCmd.id, 'terminé')}
                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Marquer comme Terminé
                      </button>
                    ) : (
                      <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                        <CheckCircle className="w-4 h-4" /> Travail Terminé
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setSelectedCmd(null)}
                      className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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

function FilterBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-slate-900 text-white shadow-sm' 
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
      }`}
    >
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
