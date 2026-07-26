import React, { useState, useEffect } from 'react';
// Vercel deployment trigger
import { Plus, Settings, ExternalLink, Crown, ArrowRight, ArrowLeft, TrendingUp, Sparkles, LayoutDashboard, Loader2, Trash2, AlertTriangle, X, Lock, User, LogOut } from 'lucide-react';
import { supabase } from '../../supabase';

export default function StoreManagerDashboard({ onSelectStore, onOpenAI, storeIsAr }: any) {
   const [stores, setStores] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const [currentUser, setCurrentUser] = useState<any>(null);
   const [userProfile, setUserProfile] = useState<any>(null);
   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

   useEffect(() => {
      const fetchStores = async () => {
         try {
            // Get current user to enforce Multi-Tenant isolation
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData?.session?.user;
            let userRole = user?.user_metadata?.role || 'merchant';
            const isAdminOrOwner = 
               user?.email === '00.emaily.zero@gmail.com' || 
               user?.email === 'fashlow@gmail.com' || 
               userRole === 'admin';

            if (isAdminOrOwner) {
               userRole = 'admin';
            }
            if (user) {
               setCurrentUser(user);
               try {
                  const { data: profData } = await supabase.from('users').select('*').eq('id', user.id).single();
                  if (profData) setUserProfile(profData);
               } catch (e) {}
            }
            const userId = user?.id;

            const { data, error } = await supabase
               .from('stores')
               .select('*')
               .order('created_at', { ascending: false });
            
            if (data) {
               // Map real data or mix with mock stats if stats are missing
               let realStores = data
                  .filter((st: any) => st.domain !== 'latest_saved_store')
                  .map((st: any) => ({
                     id: st.id,
                     name: st.name || 'Boutique Sans Nom',
                     url: st.domain || `${st.id}.beyacreative.com`,
                     plan: st.subscription_tier || st.config_json?.plan || 'NORMAL',
                     status: 'Active',
                     visitors: st.config_json?.stats?.visitors || 0,
                     revenue: st.config_json?.stats?.revenue ? `${st.config_json.stats.revenue} MAD` : '0 MAD',
                     config_json: st.config_json,
                     owner_id: st.config_json?.owner_id
                  }));

               // STRICT MULTI-TENANT DATA ISOLATION:
               // Only system admin or fashlow@gmail.com / 00.emaily.zero@gmail.com see all stores.
               // Normal merchants MUST ONLY see their own stores!
               if (!isAdminOrOwner && user) {
                  const userEmailLower = user.email ? user.email.toLowerCase() : '';
                  realStores = realStores.filter((st: any) => {
                     const stEmailLower = st.config_json?.owner_email ? st.config_json.owner_email.toLowerCase() : '';
                     const isOwnerByEmail = stEmailLower && stEmailLower === userEmailLower;
                     const isOwnerById = (st.owner_id && st.owner_id === userId) || (st.config_json?.owner_id && st.config_json?.owner_id === userId);
                     return isOwnerByEmail || isOwnerById;
                  });
               }

               // Set to realStores.
               setStores(realStores);
            } else {
                setStores([]);
            }
         } catch (err) {
            console.warn("Supabase fetch failed", err);
            setStores([]);
         } finally {
            setIsLoading(false);
         }
      };

      fetchStores();
   }, []);

   const handleDeleteStore = async () => {
      if (!deleteTarget) return;
      const { id } = deleteTarget;
      setIsDeleting(true);
      try {
         if (!id.startsWith('mock')) {
            const { error } = await supabase.from('stores').delete().eq('id', id);
            if (error) throw error;
         }
         setStores(stores.filter(s => s.id !== id));
         setDeleteTarget(null);
      } catch (err) {
         console.error('Failed to delete store:', err);
         alert(storeIsAr ? 'حدث خطأ أثناء حذف المتجر.' : 'Erreur lors de la suppression de la boutique.');
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <div className={`max-w-6xl mx-auto w-full space-y-8 ${storeIsAr ? 'text-right' : 'text-left'}`}>
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className={`flex items-center gap-4 ${storeIsAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
               <button 
                  onClick={() => window.location.href = '/'} 
                  className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 flex-shrink-0"
                  title={storeIsAr ? 'الرجوع للرئيسية' : 'Retour à l\'accueil'}
               >
                  {storeIsAr ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
               </button>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{storeIsAr ? 'متاجري' : 'Mes Boutiques'}</h1>
                  <p className="text-slate-500 mt-1">{storeIsAr ? 'إدارة المتاجر الخاصة بك، والاشتراكات، والأدوات المتقدمة.' : 'Gérez vos boutiques, abonnements et outils avancés.'}</p>
               </div>
            </div>
            <div className={`flex flex-wrap items-center gap-3 ${storeIsAr ? 'flex-row-reverse' : ''}`}>
               {/* Language Switcher */}
               <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                 {(['fr', 'en', 'ar'] as const).map(langOption => {
                   const isActive = (localStorage.getItem('beya_dash_lang') || (storeIsAr ? 'ar' : 'fr')) === langOption;
                   return (
                     <button 
                       key={langOption}
                       onClick={() => { localStorage.setItem('beya_dash_lang', langOption); window.location.reload(); }} 
                       className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                     >
                       {langOption}
                     </button>
                   );
                 })}
               </div>

               {/* Sleek Unified Account Pill Button */}
               <div className="flex items-center bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-1.5 shadow-sm hover:shadow-md transition-all">
                  <button 
                     onClick={() => setIsProfileModalOpen(true)}
                     className="flex items-center gap-2.5 px-2.5 py-1 hover:bg-slate-50 rounded-xl transition-all text-left"
                     title={storeIsAr ? 'معلومات الحساب والاشتراك' : 'Mon compte & Abonnement'}
                  >
                     <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                           {userProfile?.name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || (storeIsAr ? 'تاجر' : 'Merchant')}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mt-0.5 leading-none">
                           {(() => {
                              const hasProStore = stores.some(s => s.plan === 'PRO');
                              const isAdmin = currentUser?.email === '00.emaily.zero@gmail.com' || currentUser?.email === 'fashlow@gmail.com' || currentUser?.role === 'admin';
                              if (isAdmin) return storeIsAr ? 'مدير النظام (ADMIN)' : 'ADMIN / GÉRANT';
                              if (hasProStore) return storeIsAr ? 'تاجر PRO' : 'GÉRANT (PRO)';
                              return storeIsAr ? 'تاجر (GÉRANT)' : 'GÉRANT';
                           })()}
                        </p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20 shrink-0">
                        {(userProfile?.name || currentUser?.email || 'M').charAt(0).toUpperCase()}
                     </div>
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <button
                     onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/';
                     }}
                     className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                     title={storeIsAr ? 'تسجيل الخروج' : 'Déconnexion'}
                  >
                     <LogOut className="w-4 h-4" />
                  </button>
               </div>

               <button onClick={onSelectStore} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 h-11 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">{storeIsAr ? 'إنشاء متجر' : 'Créer boutique'}</span>
                  <span className="sm:hidden">{storeIsAr ? 'جديد' : 'Nouveau'}</span>
               </button>
            </div>
         </div>

         {/* PRO Assistant Banner */}
         {(() => {
            const hasProStore = stores.some(s => s.plan === 'PRO');
            return (
               <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                     {!hasProStore && (
                        <span className="px-3 py-1 bg-slate-800/50 backdrop-blur text-slate-300 border border-slate-700/50 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                           <Lock className="w-3 h-3" /> {storeIsAr ? 'ميزة مقفلة' : 'Verrouillé'}
                        </span>
                     )}
                     <span className="text-indigo-200 text-sm font-medium">{storeIsAr ? 'أدوات حصرية' : 'Outils Exclusifs'}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                     {storeIsAr ? 'اكتشف المنتجات المربحة مع المساعد الذكي' : 'Trouvez les produits gagnants avec notre Assistant'}
                  </h2>
                  <p className="text-indigo-100/80 mb-6 max-w-xl text-lg">
                     {storeIsAr 
                        ? 'ميزة حصرية للمشتركين في خطة PRO. قم بتحليل السوق المغربي، اعرف أسعار المنافسين، واكتشف مجالات (Niches) مربحة قبل الجميع.'
                        : 'Fonctionnalité exclusive au plan PRO. Analysez le marché marocain, découvrez les prix des concurrents et trouvez des niches rentables.'}
                  </p>
                  {hasProStore ? (
                     <button onClick={onOpenAI} className="flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 group">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        {storeIsAr ? 'إطلاق المساعد الخبير' : 'Lancer l\'Assistant PRO'}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                     </button>
                  ) : (
                     <button onClick={() => alert(storeIsAr ? 'يجب ترقية متجرك إلى خطة PRO لاستخدام هذه الميزة.' : 'Vous devez passer au plan PRO pour utiliser cette fonctionnalité.')} className="flex items-center gap-3 bg-white/10 border border-white/20 text-white/50 px-8 py-4 rounded-xl font-black cursor-not-allowed shadow-xl group">
                        <Lock className="w-5 h-5 text-slate-400" />
                        {storeIsAr ? 'إطلاق المساعد الخبير (مقفل)' : 'Lancer l\'Assistant PRO (Verrouillé)'}
                     </button>
                  )}
               </div>
               
               <div className="hidden md:block shrink-0 relative">
                  <div className="w-48 h-48 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-2xl absolute inset-0 opacity-50 animate-pulse"></div>
                  <div className="w-48 h-48 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl relative z-10 flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                     <TrendingUp className="w-24 h-24 text-amber-400" />
                  </div>
               </div>
            </div>
         </div>
      );
   })()}

         {/* Store List */}
         <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{storeIsAr ? 'متاجرك الحالية' : 'Vos Boutiques'}</h3>
            
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">{storeIsAr ? 'جاري تحميل المتاجر...' : 'Chargement des boutiques...'}</p>
               </div>
            ) : (
               <div className="grid md:grid-cols-2 gap-6">
                  {stores.map(store => (
                     <div key={store.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                 <LayoutDashboard className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-slate-900">{store.name}</h4>
                                 <a href={`https://${store.url}`} target="_blank" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-1 transition-colors">
                                    {store.url} <ExternalLink className="w-3 h-3" />
                                 </a>
                              </div>
                           </div>
                           {store.plan === 'PRO' ? (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                 <Crown className="w-3 h-3" /> PRO
                              </span>
                           ) : (
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-amber-100 hover:text-amber-700 transition-colors" title={storeIsAr ? 'قم بالترقية إلى PRO' : 'Passer au PRO'}>
                                 NORMAL
                              </span>
                           )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'الزوار (30 يوم)' : 'Visiteurs (30j)'}</p>
                              <p className="text-xl font-black text-slate-900">{store.visitors.toLocaleString()}</p>
                           </div>
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'المبيعات' : 'Chiffre d\'Affaires'}</p>
                              <p className="text-xl font-black text-slate-900">{store.revenue}</p>
                           </div>
                        </div>
                        
                        <div className="flex gap-3">
                           <button onClick={() => onSelectStore(store)} className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors active:scale-95">
                              {storeIsAr ? 'إدارة المتجر' : 'Gérer la boutique'}
                           </button>
                           <button onClick={() => onSelectStore(store)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors active:scale-95">
                              <Settings className="w-5 h-5" />
                           </button>
                           <button onClick={() => setDeleteTarget({ id: store.id, name: store.name })} className="w-12 h-12 flex items-center justify-center bg-white border border-rose-200 text-rose-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors active:scale-95" title={storeIsAr ? 'حذف المتجر' : 'Supprimer la boutique'}>
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Delete Store Confirmation Modal */}
         {deleteTarget && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)}>
               <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="p-6 md:p-8">
                     <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                           <AlertTriangle className="w-7 h-7" />
                        </div>
                        <button onClick={() => !isDeleting && setDeleteTarget(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                           <X className="w-5 h-5" />
                        </button>
                     </div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                        {storeIsAr ? 'حذف هذا المتجر؟' : 'Supprimer cette boutique ?'}
                     </h3>
                     <p className="text-sm text-slate-500 font-medium mb-6">
                        {storeIsAr
                           ? <>أنت على وشك حذف <span className="font-bold text-slate-700">{deleteTarget.name}</span> بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.</>
                           : <>Vous êtes sur le point de supprimer définitivement <span className="font-bold text-slate-700">{deleteTarget.name}</span>. Cette action est irréversible.</>}
                     </p>
                     <div className="flex gap-3">
                        <button
                           type="button"
                           onClick={() => setDeleteTarget(null)}
                           disabled={isDeleting}
                           className="flex-1 px-6 py-3.5 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-60"
                        >
                           {storeIsAr ? 'إلغاء' : 'Annuler'}
                        </button>
                        <button
                           type="button"
                           onClick={handleDeleteStore}
                           disabled={isDeleting}
                           className="flex-1 px-6 py-3.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                           {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                           {isDeleting ? (storeIsAr ? 'جاري الحذف...' : 'Suppression...') : (storeIsAr ? 'حذف نهائياً' : 'Supprimer définitivement')}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Merchant Account Details Modal */}
         {isProfileModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}>
               <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white relative">
                     <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
                        <X className="w-4 h-4" />
                     </button>
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-black text-white shadow-inner">
                           {(userProfile?.name || currentUser?.email || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-white">
                              {userProfile?.name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || (storeIsAr ? 'تاجر BEYA' : 'Marchand BEYA')}
                           </h3>
                           <p className="text-xs text-indigo-200 font-mono mt-0.5">{currentUser?.email || (storeIsAr ? 'حساب محلي' : 'Compte local')}</p>
                           <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                              {(() => {
                                 const hasProStore = stores.some(s => s.plan === 'PRO');
                                 const isAdmin = currentUser?.email === '00.emaily.zero@gmail.com' || currentUser?.role === 'admin';
                                 if (isAdmin) return storeIsAr ? '👑 مدير النظام (Admin)' : '👑 Administrateur BEYA';
                                 if (hasProStore) return storeIsAr ? '👑 حساب تاجر PRO' : '👑 Marchand BEYA (PRO)';
                                 return storeIsAr ? '🏪 حساب تاجر (العادية)' : '🏪 Marchand BEYA (NORMAL)';
                              })()}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 space-y-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-semibold">{storeIsAr ? 'اسم التاجر / الحساب' : 'Nom du compte'}</span>
                           <span className="text-slate-800 font-bold">{userProfile?.name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Marchand BEYA'}</span>
                        </div>
                        <div className="h-px bg-slate-200/60" />
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-semibold">{storeIsAr ? 'البريد الإلكتروني المتصل' : 'Email de connexion'}</span>
                           <span className="text-slate-800 font-mono font-bold">{currentUser?.email || 'Non connecté'}</span>
                        </div>
                        <div className="h-px bg-slate-200/60" />
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-semibold">{storeIsAr ? 'نوع الاشتراك في BEYA STORE' : 'Plan BEYA STORE'}</span>
                           <span className="text-indigo-600 font-bold flex items-center gap-1">
                              {(() => {
                                 const hasProStore = stores.some(s => s.plan === 'PRO');
                                 if (hasProStore) return storeIsAr ? '👑 المتجر الاحترافي (PRO)' : '👑 Abonnement PRO';
                                 return storeIsAr ? 'الخطة العادية (NORMAL)' : 'Plan NORMAL';
                              })()}
                           </span>
                        </div>
                        <div className="h-px bg-slate-200/60" />
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-semibold">{storeIsAr ? 'عدد المتاجر التابعة لك' : 'Nombre de boutiques'}</span>
                           <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700">{stores.length}</span>
                        </div>
                     </div>

                     <div className="pt-2">
                        <button
                           onClick={async () => {
                              await supabase.auth.signOut();
                              window.location.href = '/';
                           }}
                           className="w-full py-3 bg-rose-50 hover:bg-rose-100/80 text-rose-600 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                           <X className="w-4 h-4" />
                           <span>{storeIsAr ? 'تسجيل الخروج من الحساب' : 'Se déconnecter'}</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

