import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle2, ExternalLink, 
  ChevronRight, LogOut, LayoutDashboard, FileText, 
  Bell, Settings, User as UserIcon,
  Search, Calendar, MessageSquare, Save, Shield, Globe, MessageCircle, Download
} from 'lucide-react';
import { User, Commande, loadData, saveRecord, loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';

interface PartenairePortalProps {
  currentUser: User;
  onLogout: () => void;
}

export default function PartenairePortal({ currentUser, onLogout }: PartenairePortalProps) {
  const { isAr, toggle } = useLang();
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

  // Mock notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: isAr ? 'تم تعيين مهمة جديدة' : 'Nouvelle mission assignée', desc: isAr ? 'تم تعيين مهمة خياطة جديدة لك (REF-2024-001).' : 'Une nouvelle mission de couture vous a été assignée.', time: isAr ? 'منذ ساعتين' : 'Il y a 2 heures', icon: Package, color: 'indigo', urgent: false, read: false },
    { id: 2, title: isAr ? 'اقتراب الموعد النهائي' : 'Délai proche', desc: isAr ? 'المهمة (REF-2024-005) تنتهي غداً.' : 'La mission arrive à échéance demain.', time: isAr ? 'منذ 5 ساعات' : 'Il y a 5 heures', icon: Clock, color: 'amber', urgent: true, read: false },
  ]);

  // Settings state
  const [profileForm, setProfileForm] = useState({ nom: currentUser.nom, email: currentUser.email });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    fetchData();
  }, []);

  const downloadFile = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const unread = notifications.some(n => !n.read);
    setHasUnread(unread);
  }, [notifications]);

  const markNotifRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const fetchData = async () => {
    try {
      const allCmds = await loadData<Commande>('commandes') || [];
      let assigned = [];
      
      if (currentUser?.role === 'admin') {
        // Admin sees all assigned missions
        assigned = allCmds.filter(c => 
          (c.partenaireId && c.partenaireId.trim().length > 0) || 
          (Array.isArray(c.externalTasks) && c.externalTasks.some(t => t.partenaireId && t.partenaireId.trim().length > 0))
        );
      } else {
        // Partners see only their own
        assigned = allCmds.filter(c => 
          c.partenaireId === currentUser.id || 
          c.partenaireId === currentUser.employeId ||
          (c.externalTasks || []).some(t => t.partenaireId === currentUser.id || t.partenaireId === currentUser.employeId)
        );
      }
      setCommandes(assigned);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResultUpload = async (e: React.ChangeEvent<HTMLInputElement>, cmdId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setSuccessMsg(isAr ? 'الملف كبير جداً (الأقصى 5MB)' : 'Fichier trop lourd (Max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const cmd = commandes.find(c => c.id === cmdId);
        if (cmd) {
           const myTaskIdx = (cmd.externalTasks || []).findIndex(t => t.partenaireId === currentUser.id || currentUser.role === 'admin');
           if (myTaskIdx !== -1) {
              const tasks = [...(cmd.externalTasks || [])];
              const results = tasks[myTaskIdx].partnerResultFiles || [];
              tasks[myTaskIdx] = { ...tasks[myTaskIdx], partnerResultFiles: [...results, base64] };
              const updatedCmd = { ...cmd, externalTasks: tasks };
              await saveRecord('commandes', updatedCmd);
              setCommandes(prev => prev.map(c => c.id === cmdId ? updatedCmd : c));
              setSuccessMsg(isAr ? 'تم رفع الملف بنجاح!' : 'Fichier envoyé avec succès !');
           }
        }
      };
      reader.readAsDataURL(file);
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
    setSuccessMsg(isAr ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profil mis à jour avec succès !');
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
      {/* ========================================== */}
      {/* DESKTOP SIDEBAR (Keep as is) */}
      {/* ========================================== */}
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

      {/* ========================================== */}
      {/* MOBILE UI (Pro Design) */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 flex items-center justify-between shrink-0 sticky top-0 z-[100]">
           <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                 <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                 <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight leading-none">{company.name.split(' ')[0]}</h2>
                 <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest mt-1 italic">{isAr ? 'بوابة الشركاء' : 'Partner Hub'}</p>
              </div>
           </div>
           <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div 
                onClick={() => setActiveTab('settings')}
                className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-xs shadow-sm overflow-hidden"
              >
                {currentUser.nom[0]}
              </div>
           </div>
        </header>

        {/* Desktop Header (Hidden on Mobile) */}
        <header className={`hidden lg:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={isAr ? 'text-right' : ''}>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              {activeTab === 'tasks' ? (isAr ? 'المهام الحالية' : 'Missions en cours') : 
               activeTab === 'history' ? (isAr ? 'الأرشيف والسجل' : 'Archives & Historique') : 
               activeTab === 'notifications' ? (isAr ? 'التنبيهات' : 'Notifications') : 
               (isAr ? 'إعدادات الحساب' : 'Paramètres du compte')}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
              {isAr ? 'مرحباً بك،' : 'Bienvenue,'} {currentUser.nom}
            </p>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50/50 pb-32 lg:pb-8">
          {activeTab === 'tasks' || activeTab === 'history' ? (
            <>
              {/* Stats Bar */}
              <div className={`flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 mb-8 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 hide-scrollbar snap-x ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="snap-center shrink-0 w-[280px] lg:w-auto">
                   <StatCard label={isAr ? 'المهام النشطة' : 'Missions actives'} value={commandes.filter(c => c.statut === 'en_cours').length} icon={<LayoutDashboard className="w-5 h-5" />} color="indigo" isAr={isAr} />
                </div>
                <div className="snap-center shrink-0 w-[280px] lg:w-auto">
                   <StatCard label={isAr ? 'المنتهية (30 يوماً)' : 'Terminées (30j)'} value={commandes.filter(c => c.statut === 'terminé' || c.statut === 'livré').length} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" isAr={isAr} />
                </div>
                <div className="snap-center shrink-0 w-[280px] lg:w-auto">
                   <StatCard label={isAr ? 'متوسط الإنجاز' : 'Temps moyen'} value={isAr ? '4.2 يوم' : '4.2j'} icon={<Clock className="w-5 h-5" />} color="amber" isAr={isAr} />
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-6">
                 <div className={`flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                    <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label={isAr ? 'الكل' : 'Toutes'} />
                    <FilterBtn active={filter === 'active'} onClick={() => setFilter('active')} label={isAr ? 'النشطة' : 'Actives'} />
                    <FilterBtn active={filter === 'done'} onClick={() => setFilter('done')} label={isAr ? 'المنتهية' : 'Terminées'} />
                 </div>
              </div>

              {/* List Section - Responsive Container */}
              <div className="bg-white lg:rounded-[2rem] rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`p-6 border-b border-slate-100 hidden lg:flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 ${isAr ? 'md:flex-row-reverse' : ''}`}>
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

                {/* Mobile Title */}
                <div className="lg:hidden p-5 border-b border-slate-50">
                   <h3 className={`text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      {activeTab === 'tasks' ? (isAr ? 'المهام الحالية' : 'Missions Actuelles') : (isAr ? 'السجل' : 'Historique')}
                   </h3>
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
                      <div key={cmd.id} onClick={() => setSelectedCmd(cmd)} className="p-5 lg:p-6 hover:bg-slate-50 transition-all group cursor-pointer">
                        {/* Desktop Item Layout */}
                        <div className={`hidden lg:flex flex-row items-center justify-between gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0 bg-slate-50">
                              {(() => {
                                const myTask = cmd.externalTasks?.find(t => t.partenaireId === currentUser.id || currentUser.role === 'admin');
                                const displayPhoto = myTask?.photo || cmd.modelePhoto;
                                return displayPhoto ? (
                                  <img src={displayPhoto} className="w-full h-full object-cover" alt="" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-[10px] uppercase tracking-widest italic text-center p-2 leading-tight">BEYA</div>
                                );
                              })()}
                            </div>
                            <div className={isAr ? 'text-right' : ''}>
                              <div className={`flex items-center gap-2 mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{cmd.reference}</span>
                                {cmd.externalTasks?.filter(t => t.partenaireId === currentUser.id || currentUser.role === 'admin').map(t => (
                                  <span key={t.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[8px] font-black uppercase tracking-tighter border border-indigo-100">{t.type}</span>
                                ))}
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

                          <div className={`flex items-center gap-8 ${isAr ? 'flex-row-reverse' : ''}`}>
                             <div className={`flex flex-col gap-2 ${isAr ? 'items-end' : 'items-start'}`}>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
                                   <Download className="w-3 h-3" /> {isAr ? 'تحميل الوثائق' : 'Documents Admin'}
                                </label>
                                <div className="flex gap-2">
                                   {(() => {
                                      const myTask = cmd.externalTasks?.find(t => t.partenaireId === currentUser.id || currentUser.role === 'admin');
                                      const hasFiles = (myTask?.attachments?.length || 0) > 0 || cmd.modelePhoto || cmd.preuveValidation;
                                      
                                      if (!hasFiles) return <span className="text-[10px] font-bold text-slate-300 italic uppercase">{isAr ? 'لا توجد ملفات' : 'Aucun doc'}</span>;
                                      
                                      return (
                                        <>
                                          {cmd.modelePhoto && (
                                            <button onClick={(e) => { e.stopPropagation(); downloadFile(cmd.modelePhoto!, `Model_${cmd.reference}`); }} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">Photo</button>
                                          )}
                                          {(myTask?.attachments || []).map((f, i) => (
                                            <button key={i} onClick={(e) => { e.stopPropagation(); downloadFile(f, `Doc_${i+1}_${cmd.reference}`); }} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">Doc {i+1}</button>
                                          ))}
                                        </>
                                      );
                                   })()}
                                </div>
                             </div>

                             <div className={`flex flex-col gap-2 ${isAr ? 'items-end' : 'items-start'}`}>
                                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none flex items-center gap-2">
                                   <FileText className="w-3 h-3" /> {isAr ? 'إرسال النتيجة' : 'Envoyer Résultat'}
                                </label>
                                <div className="flex gap-2 items-center">
                                   <label onClick={e => e.stopPropagation()} className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm border border-emerald-100">
                                      {isAr ? 'رفع الملف' : 'Upload File'}
                                      <input type="file" className="hidden" onChange={e => handleResultUpload(e, cmd.id)} />
                                   </label>
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

                        {/* ========================================== */}
                        {/* MOBILE ITEM LAYOUT (Modern Pro Design) */}
                        {/* ========================================== */}
                        <div className="lg:hidden flex flex-col gap-5">
                           <div className={`flex items-start justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                              <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                                 <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-slate-100 shrink-0 bg-slate-50">
                                    {(() => {
                                      const myTask = cmd.externalTasks?.find(t => t.partenaireId === currentUser.id || currentUser.role === 'admin');
                                      const displayPhoto = myTask?.photo || cmd.modelePhoto;
                                      return displayPhoto ? (
                                        <img src={displayPhoto} className="w-full h-full object-cover" alt="" loading="lazy" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-[8px] uppercase tracking-tighter text-center p-1 leading-tight">BEYA</div>
                                      );
                                    })()}
                                 </div>
                                 <div className={isAr ? 'text-right' : ''}>
                                    <div className={`flex items-center gap-2 mb-0.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                                       <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{cmd.reference}</span>
                                       <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[7px] font-black uppercase border border-indigo-100">{cmd.externalTasks?.find(t => t.partenaireId === currentUser.id || currentUser.role === 'admin')?.type || 'Mission'}</span>
                                    </div>
                                    <h4 className="text-base font-black text-slate-950 uppercase tracking-tight leading-tight mb-1">{cmd.modele}</h4>
                                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cmd.quantite} {isAr ? 'قطعة' : 'Pcs'}</span>
                                       <div className="w-1 h-1 rounded-full bg-slate-200" />
                                       <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{new Date(cmd.dateLivraisonPrevue).toLocaleDateString()}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 shrink-0 ${
                                cmd.statut === 'en_cours' 
                                  ? 'bg-amber-50 border-amber-500/20 text-amber-600' 
                                  : cmd.statut === 'terminé' || cmd.statut === 'livré'
                                  ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}>
                                 {isAr ? (cmd.statut === 'en_cours' ? 'نشطة' : 'مكتملة') : cmd.statut.split('_')[0]}
                              </div>
                           </div>

                           <div className={`grid grid-cols-2 gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const myTask = cmd.externalTasks?.find(t => t.partenaireId === currentUser.id || currentUser.role === 'admin');
                                  const photo = myTask?.photo || cmd.modelePhoto;
                                  if (photo) downloadFile(photo, `Model_${cmd.reference}`);
                                }}
                                className={`flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 active:scale-95 transition-all ${isAr ? 'flex-row-reverse' : ''}`}
                              >
                                 <Download className="w-3.5 h-3.5" />
                                 {isAr ? 'تحميل الملفات' : 'Docs Admin'}
                              </button>
                              <label onClick={e => e.stopPropagation()} className={`flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer ${isAr ? 'flex-row-reverse' : ''}`}>
                                 <FileText className="w-3.5 h-3.5" />
                                 {isAr ? 'إرسال النتيجة' : 'Upload Result'}
                                 <input type="file" className="hidden" onChange={e => handleResultUpload(e, cmd.id)} />
                              </label>
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
                    <p className="text-indigo-100 text-xs font-bold leading-relaxed">{isAr ? 'ابق على اطلاع دائم بآخر المهام والمستجدات مباشرة.' : 'Soyez informé instantanément des nouvelles missions assignées.'}</p>
                  </div>
                  <button 
                    onClick={handleRequestPermission}
                    className="relative z-10 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95 shrink-0"
                  >
                    {isAr ? 'تفعيل الآن' : 'Activer Maintenant'}
                  </button>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Bell className="w-5 h-5 text-rose-500" />
                    {isAr ? 'آخر التنبيهات' : 'Dernières Notifications'}
                  </h3>
                  {hasUnread && (
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                      {isAr ? 'تحديد الكل كمقروء' : 'Tout marquer lu'}
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotifRead(n.id)}
                      className={`p-6 hover:bg-slate-50 transition-all cursor-pointer flex gap-5 ${isAr ? 'flex-row-reverse text-right' : ''} ${!n.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className={`w-12 h-12 bg-${n.color}-100 text-${n.color}-600 rounded-2xl flex items-center justify-center shrink-0 border border-${n.color}-200`}>
                        <n.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center justify-between gap-4 mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <h4 className={`text-sm font-black text-slate-900 uppercase tracking-tight truncate ${!n.read ? 'pr-4' : ''}`}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className={`p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center text-center`}>
                  <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-indigo-600/20 mb-4 border-4 border-white">
                    {currentUser.nom[0]}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{currentUser.nom}</h3>
                  <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">{isAr ? 'فاصونيي معتمد' : 'Partenaire Particulier'}</p>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={isAr ? 'text-right' : ''}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'الاسم الكامل' : 'Nom Complet'}</label>
                      <input 
                        type="text" 
                        value={profileForm.nom}
                        onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })}
                        className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isAr ? 'text-right' : ''}`}
                      />
                    </div>
                    <div className={isAr ? 'text-right' : ''}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'البريد الإلكتروني' : 'Email Professionnel'}</label>
                      <input 
                        type="email" 
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isAr ? 'text-right' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      onClick={handleUpdateProfile}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Save className="w-4 h-4" /> {isAr ? 'حفظ التغييرات' : 'Enregistrer le profil'}
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full mt-4 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut className="w-4 h-4" /> {isAr ? 'تسجيل الخروج' : 'Se déconnecter'}
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                        <Shield className="w-6 h-6" />
                     </div>
                     <div className={isAr ? 'text-right' : ''}>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{isAr ? 'أمان الحساب' : 'Sécurité du compte'}</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5 leading-relaxed">{isAr ? 'حسابك محمي بتشفير متقدم (End-to-End).' : 'Votre compte est protégé par cryptage avancé.'}</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ========================================== */}
        {/* MOBILE BOTTOM NAVIGATION (PRO) */}
        {/* ========================================== */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl z-[200] flex items-center justify-around px-4">
           <MobileNavBtn active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<LayoutDashboard className="w-6 h-6" />} isAr={isAr} />
           <MobileNavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock className="w-6 h-6" />} isAr={isAr} />
           <div className="relative">
              <MobileNavBtn active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell className="w-6 h-6" />} isAr={isAr} />
              {hasUnread && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950" />}
           </div>
           <MobileNavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<UserIcon className="w-6 h-6" />} isAr={isAr} />
        </nav>
      </div>

      {/* Task Details Modal */}
      {selectedCmd && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-8">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedCmd(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className={`p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAr ? 'md:flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : ''}>
                <div className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedCmd.reference}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedCmd.modele}</span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{isAr ? 'تفاصيل المهمة' : 'Détails Mission'}</h3>
              </div>
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${
                  selectedCmd.statut === 'en_cours' 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {isAr ? (selectedCmd.statut === 'en_cours' ? 'نشطة' : 'مكتملة') : selectedCmd.statut.replace('_', ' ')}
                </div>
                <button onClick={() => setSelectedCmd(null)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                  <ExternalLink className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="aspect-video bg-slate-50 rounded-[2.5rem] overflow-hidden border-2 border-slate-100 group relative">
                   {(() => {
                      const myTask = selectedCmd.externalTasks?.find(t => t.partenaireId === currentUser.id || currentUser.role === 'admin');
                      const displayPhoto = myTask?.photo || selectedCmd.modelePhoto;
                      return displayPhoto ? (
                        <img src={displayPhoto} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase tracking-[0.3em] italic">BEYA CREATIVE</div>
                      );
                   })()}
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 ${isAr ? 'text-right' : ''}`}>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{isAr ? 'الكمية الإجمالية' : 'Quantité Totale'}</p>
                    <p className="text-xl font-black text-slate-900">{selectedCmd.quantite} <span className="text-[10px]">{isAr ? 'قطعة' : 'Pcs'}</span></p>
                  </div>
                  <div className={`p-5 bg-rose-50/50 rounded-3xl border border-rose-100/50 ${isAr ? 'text-right' : ''}`}>
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">{isAr ? 'الموعد النهائي' : 'Date de Livraison'}</p>
                    <p className="text-xl font-black text-slate-900">{new Date(selectedCmd.dateLivraisonPrevue).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                    <Save className="w-4 h-4" /> {isAr ? 'إدارة الحالة' : 'Gestion du Statut'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => updateStatus(selectedCmd.id, 'en_cours')}
                      className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        selectedCmd.statut === 'en_cours' 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {isAr ? 'قيد الإنجاز' : 'En Cours'}
                    </button>
                    <button 
                      onClick={() => updateStatus(selectedCmd.id, 'terminé')}
                      className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        selectedCmd.statut === 'terminé' 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {isAr ? 'مكتملة' : 'Terminé'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-[2000]">
          <div className="bg-slate-900/90 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-2xl">
             <CheckCircle2 className="w-6 h-6 text-emerald-400" />
             <p className="text-sm font-black uppercase tracking-tight">{successMsg}</p>
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

function MobileNavBtn({ active, onClick, icon, isAr }: { active: boolean, onClick: () => void, icon: React.ReactNode, isAr?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' 
          : 'text-slate-500 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}

function FilterBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-slate-900 text-white shadow-md scale-105' 
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
