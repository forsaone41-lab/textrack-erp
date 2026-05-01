import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle, ExternalLink, 
  ChevronRight, LogOut, LayoutDashboard, FileText, 
  Bell, Settings, User as UserIcon, HelpCircle, 
  Search, Filter, Calendar, MessageSquare, Save, UserCheck, Shield, Key, Globe, MessageCircle
} from 'lucide-react';
import { User, Commande, loadData, saveRecord, loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

interface PartenairePortalProps {
  currentUser: User;
  onLogout: () => void;
}

export default function PartenairePortal({ currentUser, onLogout }: PartenairePortalProps) {
  const { lang, isAr, toggle } = useLang();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const company = loadCompanyProfile();
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'notifications' | 'settings'>('tasks');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [selectedCmd, setSelectedCmd] = useState<Commande | null>(null);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Settings state
  const [profileForm, setProfileForm] = useState({ nom: currentUser.nom, email: currentUser.email });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications') {
      setHasUnread(false);
    }
  }, [activeTab]);

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

  const handleRequestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotifPermission(permission);
        if (permission === 'granted') {
          new Notification(isAr ? 'تم تفعيل التنبيهات!' : 'Notifications activées !', {
            body: isAr ? 'ستصلك التنبيهات هنا مباشرة.' : 'Vous recevrez les alertes ici.',
            icon: '/logo192.png'
          });
        }
      });
    }
  };

  const handleUpdateProfile = async () => {
    const updatedUser = { ...currentUser, ...profileForm };
    await saveRecord('users', updatedUser);
    alert(isAr ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profil mis à jour avec succès !');
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
    <div className={`min-h-screen bg-slate-50 flex font-sans ${isAr ? 'flex-row-reverse text-right' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar - Pro Design */}
      <div className="hidden lg:flex w-72 bg-slate-900 flex-col border-r border-slate-800 shrink-0">
        <div className="p-8">
          <div className={`flex items-center gap-3 mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className={isAr ? 'text-right' : ''}>
              <h1 className="text-white font-black text-lg tracking-tighter uppercase leading-none">{company.name.split(' ')[0]}</h1>
              <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1">{isAr ? 'بوابة الشركاء' : 'Partner Hub'}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavBtn active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<LayoutDashboard className="w-5 h-5" />} label={isAr ? 'لوحة القيادة' : 'Tableau de bord'} isAr={isAr} />
            <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock className="w-5 h-5" />} label={isAr ? 'الأرشيف' : 'Historique'} isAr={isAr} />
            <div className="pt-4 mt-4 border-t border-slate-800">
              <NavBtn active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell className="w-5 h-5" />} label={isAr ? 'الإشعارات' : 'Notifications'} isAr={isAr} />
              <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} label={isAr ? 'الإعدادات' : 'Paramètres'} isAr={isAr} />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div 
            onClick={toggle}
            className={`flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 mb-4 cursor-pointer group ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isAr ? 'اللغة العربية' : 'Français'}</span>
            </div>
            <ChevronRight className={`w-3 h-3 text-slate-500 group-hover:text-white transition-all ${isAr ? 'rotate-180' : ''}`} />
          </div>

          <div className={`bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-6 cursor-pointer hover:bg-slate-800 transition-all ${isAr ? 'text-right' : ''}`} onClick={() => setActiveTab('settings')}>
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black">
                {currentUser.nom[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-black uppercase truncate">{currentUser.nom}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase truncate">{isAr ? 'فاصونيي' : 'Façonnier'}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <LogOut className="w-4 h-4" /> {isAr ? 'تسجيل الخروج' : 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className={`h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={isAr ? 'text-right' : ''}>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              {activeTab === 'tasks' ? (isAr ? 'المهام الحالية' : 'Missions en cours') : 
               activeTab === 'history' ? (isAr ? 'الأرشيف والسجل' : 'Archives & Historique') : 
               activeTab === 'notifications' ? (isAr ? 'التنبيهات' : 'Notifications') : 
               (isAr ? 'إعدادات الحساب' : 'Paramètres du compte')}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{isAr ? 'مرحباً بك،' : 'Bienvenue,'} {currentUser.nom}</p>
          </div>

          <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="relative hidden md:block">
              <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
              <input 
                type="text" 
                placeholder={isAr ? 'بحث...' : 'Chercher...'} 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-64 py-2 bg-slate-100 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isAr ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
              />
            </div>
            <div 
              onClick={() => setActiveTab('notifications')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative cursor-pointer ${
                activeTab === 'notifications' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : hasUnread 
                    ? 'bg-indigo-50 text-indigo-600 animate-pulse border-2 border-indigo-200' 
                    : 'bg-slate-100 text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Bell className={`w-5 h-5 ${hasUnread ? 'animate-bounce' : ''}`} />
              {hasUnread && (
                <span className={`absolute top-2 ${isAr ? 'left-2' : 'right-2'} w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm shadow-rose-500/50 animate-ping`}></span>
              )}
              {hasUnread && (
                <span className={`absolute top-2 ${isAr ? 'left-2' : 'right-2'} w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm shadow-rose-500/50`}></span>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
          {activeTab === 'tasks' || activeTab === 'history' ? (
            <>
              {/* Stats Bar */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8`}>
                <StatCard label={isAr ? 'المهام النشطة' : 'Missions actives'} value={commandes.filter(c => c.statut === 'en_cours').length} icon={<LayoutDashboard className="w-5 h-5" />} color="indigo" isAr={isAr} />
                <StatCard label={isAr ? 'المنتهية (30 يوماً)' : 'Terminées (30j)'} value={commandes.filter(c => c.statut === 'terminé' || c.statut === 'livré').length} icon={<CheckCircle className="w-5 h-5" />} color="emerald" isAr={isAr} />
                <StatCard label={isAr ? 'متوسط الإنجاز' : 'Temps moyen'} value={isAr ? '4.2 يوم' : '4.2j'} icon={<Clock className="w-5 h-5" />} color="amber" isAr={isAr} />
              </div>

              {/* List Section */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className={`p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 ${isAr ? 'md:flex-row-reverse' : ''}`}>
                  <h3 className={`font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <FileText className="w-5 h-5 text-indigo-500" />
                    {activeTab === 'tasks' ? (isAr ? 'قائمة المهام' : 'Liste des Missions') : (isAr ? 'أرشيف المهام' : 'Archives des Missions')}
                  </h3>
                  
                  {activeTab === 'tasks' && (
                    <div className={`flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label={isAr ? 'الكل' : 'Toutes'} />
                      <FilterBtn active={filter === 'active'} onClick={() => setFilter('active')} label={isAr ? 'قيد الإنجاز' : 'En cours'} />
                      <FilterBtn active={filter === 'done'} onClick={() => setFilter('done')} label={isAr ? 'المنتهية' : 'Terminées'} />
                    </div>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">{isAr ? 'جاري التحميل...' : 'Chargement...'}</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center">
                        <Package className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black uppercase tracking-tight">{isAr ? 'لا توجد مهام' : 'Aucune mission trouvée'}</p>
                        <p className="text-slate-500 text-xs mt-1 font-bold">{isAr ? 'لا يوجد شيء لعرضه هنا حالياً.' : 'Rien à afficher ici.'}</p>
                      </div>
                    </div>
                  ) : (
                    filtered.map(cmd => (
                      <div key={cmd.id} onClick={() => setSelectedCmd(cmd)} className="p-6 hover:bg-slate-50 transition-all group cursor-pointer">
                        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAr ? 'md:flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0 bg-slate-50">
                              {cmd.modelePhoto ? (
                                <img src={cmd.modelePhoto} className="w-full h-full object-cover" alt="" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase tracking-widest italic text-center p-2">BEYA</div>
                              )}
                            </div>
                            <div className={isAr ? 'text-right' : ''}>
                              <div className={`flex items-center gap-2 mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{cmd.reference}</span>
                              </div>
                              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{cmd.modele}</h4>
                              <div className={`flex items-center gap-4 mt-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                <span className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isAr ? 'flex-row-reverse' : ''}`}>
                                  <Package className="w-3.5 h-3.5 text-slate-400" />
                                  {cmd.quantite} {isAr ? 'قطعة' : 'Pièces'}
                                </span>
                                <span className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isAr ? 'flex-row-reverse' : ''}`}>
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {isAr ? 'الأجل:' : 'Délai:'} {new Date(cmd.dateLivraisonPrevue).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={`flex items-center gap-3 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                              cmd.statut === 'en_cours' 
                                ? 'bg-amber-50 border-amber-500/20 text-amber-600' 
                                : cmd.statut === 'terminé' || cmd.statut === 'livré'
                                ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              {isAr ? (cmd.statut === 'en_cours' ? 'قيد الإنجاز' : cmd.statut === 'terminé' ? 'مكتمل' : 'تم التسليم') : cmd.statut.replace('_', ' ')}
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
            <div className="max-w-3xl mx-auto space-y-6">
              {notifPermission !== 'granted' && (
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                  <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{isAr ? 'فعل التنبيهات على هاتفك' : 'Activez les notifications'}</h3>
                    <p className="text-indigo-100 text-xs font-bold max-w-xs">{isAr ? 'توصل بكل جديد (مهام، مواعيد) مباشرة على شاشة هاتفك في الحين.' : 'Recevez les nouvelles missions et les alertes de délai directement sur votre écran.'}</p>
                  </div>
                  <button 
                    onClick={handleRequestPermission}
                    className="relative z-10 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95"
                  >
                    {isAr ? 'تفعيل الآن' : 'Activer maintenant'}
                  </button>
                  <Bell className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>
              )}

              <div className="space-y-4">
                {[
                  { id: 1, title: isAr ? 'تم تعيين مهمة جديدة' : 'Nouvelle mission assignée', desc: isAr ? 'تم تعيين مهمة خياطة جديدة لك (REF-2024-001).' : 'Une nouvelle mission de couture vous a été assignée.', time: isAr ? 'منذ ساعتين' : 'Il y a 2 heures', icon: Package, color: 'indigo', urgent: false },
                  { id: 2, title: isAr ? 'اقتراب الموعد النهائي' : 'Délai proche', desc: isAr ? 'المهمة (REF-2024-005) تنتهي غداً.' : 'La mission arrive à échéance demain.', time: isAr ? 'منذ 5 ساعات' : 'Il y a 5 heures', icon: Clock, color: 'amber', urgent: true },
                ].map(notif => (
                  <div key={notif.id} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-colors cursor-pointer group ${isAr ? 'flex-row-reverse' : ''} ${notif.urgent ? 'border-l-4 border-l-rose-500 animate-in fade-in slide-in-from-right duration-500' : ''}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      notif.urgent ? 'bg-rose-50 text-rose-500 animate-pulse' :
                      notif.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      <notif.icon className={`w-6 h-6 ${notif.urgent ? 'animate-bounce' : ''}`} />
                    </div>
                    <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
                      <h4 className={`font-black uppercase tracking-tighter text-sm group-hover:text-indigo-600 transition-colors ${notif.urgent ? 'text-rose-600' : 'text-slate-900'}`}>
                        {notif.title}
                        {notif.urgent && <span className="mx-2 px-2 py-0.5 bg-rose-500 text-white text-[8px] rounded-full animate-pulse inline-block align-middle">{isAr ? 'عاجل' : 'URGENT'}</span>}
                      </h4>
                      <p className="text-slate-500 text-xs font-bold mt-1">{notif.desc}</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase mt-3 tracking-widest">{notif.time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.urgent ? 'bg-rose-500 animate-ping' : 'bg-indigo-500'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className={`p-8 border-b border-slate-100 bg-slate-50/50 ${isAr ? 'text-right' : ''}`}>
                  <h3 className={`text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Settings className="w-5 h-5 text-slate-400" />
                    {isAr ? 'الملف الشخصي والإعدادات' : 'Mon Profil & Paramètres'}
                  </h3>
                </div>
                <div className={`p-10 grid grid-cols-1 md:grid-cols-3 gap-10 ${isAr ? 'md:grid-cols-3-reverse' : ''}`}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl text-white font-black shadow-xl shadow-indigo-600/20">
                      {currentUser.nom[0]}
                    </div>
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{isAr ? 'تغيير الصورة' : 'Changer la photo'}</button>
                  </div>
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest block ${isAr ? 'mr-2' : 'ml-2'}`}>{isAr ? 'الاسم الكامل' : 'Nom Complet'}</label>
                        <div className="relative">
                          <UserIcon className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300`} />
                          <input 
                            type="text" 
                            value={profileForm.nom}
                            onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })}
                            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all ${isAr ? 'text-right pr-12 pl-6' : 'pl-12 pr-6'}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest block ${isAr ? 'mr-2' : 'ml-2'}`}>{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                        <div className="relative">
                          <MessageSquare className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300`} />
                          <input 
                            type="email" 
                            value={profileForm.email}
                            onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all ${isAr ? 'text-right pr-12 pl-6' : 'pl-12 pr-6'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`pt-6 border-t border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{isAr ? 'أمان الحساب' : 'Sécurité du compte'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'متصل بصفتك فاصونيي' : `Connecté en tant que ${currentUser.role}`}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleUpdateProfile}
                        className={`bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}
                      >
                        <Save className="w-4 h-4" /> {isAr ? 'حفظ التعديلات' : 'Enregistrer'}
                      </button>
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
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : ''}>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'تفاصيل المهمة' : 'Détails de la Mission'}</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedCmd.reference}</p>
              </div>
              <button onClick={() => setSelectedCmd(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                <LogOut className={`w-5 h-5 text-slate-400 ${isAr ? '' : 'rotate-180'}`} />
              </button>
            </div>

            <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${isAr ? 'md:grid-cols-2-reverse' : ''}`}>
              <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
                {selectedCmd.modelePhoto ? (
                  <img src={selectedCmd.modelePhoto} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-2xl uppercase tracking-widest italic text-center p-4">BEYA</div>
                )}
              </div>

              <div className="space-y-6">
                <div className={isAr ? 'text-right' : ''}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">{isAr ? 'إسم الموديل' : 'Nom du Modèle'}</label>
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedCmd.modele}</p>
                </div>

                <div className={`grid grid-cols-2 gap-4 ${isAr ? 'grid-cols-2-reverse' : ''}`}>
                  <div className={`p-4 bg-slate-50 rounded-2xl border border-slate-100 ${isAr ? 'text-right' : ''}`}>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'الكمية' : 'الكمية'}</label>
                    <p className="text-lg font-black text-slate-900">{selectedCmd.quantite} {isAr ? 'قطعة' : 'pcs'}</p>
                  </div>
                  <div className={`p-4 bg-slate-50 rounded-2xl border border-slate-100 ${isAr ? 'text-right' : ''}`}>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'الأجل' : 'الأجل'}</label>
                    <p className="text-lg font-black text-slate-900">{new Date(selectedCmd.dateLivraisonPrevue).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => window.open(`https://wa.me/${company.phone || ''}?text=Bonjour, je vous contacte concernant la mission ${selectedCmd.reference}`, '_blank')}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> {isAr ? 'تواصل معنا (WhatsApp)' : 'Contacter (WhatsApp)'}
                  </button>

                  {selectedCmd.statut !== 'terminé' && selectedCmd.statut !== 'livré' ? (
                    <button 
                      onClick={() => updateStatus(selectedCmd.id, 'terminé')}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> {isAr ? 'تحديد كمنتهي' : 'Marquer comme Terminé'}
                    </button>
                  ) : (
                    <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4" /> {isAr ? 'العمل مكتمل' : 'Travail Terminé'}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setSelectedCmd(null)}
                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    {isAr ? 'إغلاق' : 'Fermer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon, label, isAr }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isAr?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm uppercase tracking-tighter ${isAr ? 'flex-row-reverse text-right' : ''} ${
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

function StatCard({ label, value, icon, color, isAr }: { label: string, value: string | number, icon: React.ReactNode, color: 'indigo' | 'emerald' | 'amber', isAr?: boolean }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className={`p-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
      <div className={isAr ? 'text-right' : ''}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center border shadow-sm shrink-0`}>
        {icon}
      </div>
    </div>
  );
}
