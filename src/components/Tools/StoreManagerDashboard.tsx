import React, { useState, useEffect } from 'react';
// Vercel deployment trigger
import { Plus, Settings, ExternalLink, Crown, ArrowRight, ArrowLeft, TrendingUp, Sparkles, LayoutDashboard, Loader2, Trash2, AlertTriangle, X, Lock, User, LogOut, Globe, Layers } from 'lucide-react';
import { supabase } from '../../supabase';
import CreateStoreWizardModal from './CreateStoreWizardModal';

export default function StoreManagerDashboard({ onSelectStore, onOpenAI, storeIsAr, isAr, appCurrentUser }: any) {
   const [stores, setStores] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [loadingStoreId, setLoadingStoreId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const [currentUser, setCurrentUser] = useState<any>(() => {
      if (appCurrentUser) return appCurrentUser;
      try {
         const saved = localStorage.getItem('textrack_auth');
         return saved ? JSON.parse(saved) : null;
      } catch {
         return null;
      }
   });
   const [userProfile, setUserProfile] = useState<any>(null);
   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
   const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

   const getDeletedStoreIds = (): string[] => {
      try {
         const raw = localStorage.getItem('beya_deleted_store_ids');
         const list: string[] = raw ? JSON.parse(raw) : [];
         const tRaw = localStorage.getItem('textrack_deleted_ids');
         const tList: string[] = tRaw ? JSON.parse(tRaw) : [];
         return Array.from(new Set([...list, ...tList]));
      } catch {
         return [];
      }
   };

   const markStoreDeletedLocally = (id: string) => {
      try {
         const raw = localStorage.getItem('beya_deleted_store_ids');
         const list: string[] = raw ? JSON.parse(raw) : [];
         if (!list.includes(id)) {
            list.push(id);
            localStorage.setItem('beya_deleted_store_ids', JSON.stringify(list));
         }
         const tRaw = localStorage.getItem('textrack_deleted_ids');
         const tList: string[] = tRaw ? JSON.parse(tRaw) : [];
         if (!tList.includes(id)) {
            tList.push(id);
            localStorage.setItem('textrack_deleted_ids', JSON.stringify(tList));
         }
      } catch (e) {
         console.warn("Could not save deleted id locally", e);
      }
   };

   const getStoreVisitUrl = (store: any) => {
      if (!store?.url) return '#';
      const cleanDomain = String(store.url).replace(/^https?:\/\//, '').replace(/\/$/, '');
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocal) {
         const subdomain = cleanDomain.split('.')[0];
         return `/#/store/${subdomain}`;
      }
      return `https://${cleanDomain}`;
   };


   // Self-contained dashboard language (FR/EN/AR), independent of the storefront's own language config.
   const [dashLang, setDashLang] = useState<'fr' | 'en' | 'ar'>(() => {
      const saved = localStorage.getItem('beya_dash_lang');
      if (saved === 'fr' || saved === 'en' || saved === 'ar') return saved;
      return (storeIsAr || isAr) ? 'ar' : 'fr';
   });
   const isRtl = dashLang === 'ar';
   const t = (fr: string, en: string, ar: string) => (dashLang === 'ar' ? ar : dashLang === 'en' ? en : fr);
   const setLang = (l: 'fr' | 'en' | 'ar') => {
      localStorage.setItem('beya_dash_lang', l);
      setDashLang(l);
   };

   const fetchStores = async () => {
      setIsLoading(true);
      try {
         // Get current user to enforce Multi-Tenant isolation.
         // Two identity systems coexist in this app: the real Supabase Auth session (used by
         // merchants who signed up via /store-signup) and the app-level custom `users` table
         // session (appCurrentUser / textrack_auth, used by the rest of the ERP).
         const { data: sessionData } = await supabase.auth.getSession();
         const user = sessionData?.session?.user;
         const localAuth = (() => {
            try {
               const saved = localStorage.getItem('textrack_auth');
               return saved ? JSON.parse(saved) : null;
            } catch {
               return null;
            }
         })();
         const effectiveUser = user || appCurrentUser || localAuth;
         const effectiveEmail = effectiveUser?.email;
         const effectiveId = effectiveUser?.id;
         let userRole = effectiveUser?.user_metadata?.role || effectiveUser?.role || 'merchant';
         const isAdminOrOwner =
            effectiveEmail === '00.emaily.zero@gmail.com' ||
            effectiveEmail === 'fashlow@gmail.com' ||
            userRole === 'admin' ||
            userRole === 'superadmin';

         if (isAdminOrOwner) {
            userRole = 'admin';
         }
         if (effectiveUser) setCurrentUser(effectiveUser);
         const userId = effectiveId;

         // Fetch the profile and the stores list in parallel.
         // CRITICAL FIX: We select lightweight columns + JSON extracted fields instead of select('*').
         // Selecting entire config_json across all platform stores transfers tens of megabytes of raw image data,
         // causing Postgres statement timeouts (error 57014) which resulted in stores disappearing.
         const [profileResult, storesResult] = await Promise.all([
            effectiveId
               ? Promise.resolve(supabase.from('users').select('*').eq('id', effectiveId).single()).catch(() => ({ data: null } as any))
               : Promise.resolve({ data: null } as any),
            supabase
               .from('stores')
               .select('id, name, domain, subscription_tier, created_at, updated_at, owner_email:config_json->owner_email, owner_id:config_json->owner_id, stats:config_json->stats, plan:config_json->plan')
               .order('created_at', { ascending: false })
         ]);

         if (profileResult?.data) setUserProfile(profileResult.data);
         const { data, error } = storesResult;

         if (error) {
            console.error("Supabase fetch stores error:", error);
         }

         if (data) {
            const deletedIds = getDeletedStoreIds();
            let realStores = data
               .filter((st: any) => {
                  if (!st) return false;
                  if (st.domain === 'latest_saved_store') return false;
                  if (deletedIds.includes(st.id)) return false;
                  if (st.name === '__DELETED__' || (typeof st.domain === 'string' && st.domain.startsWith('__DELETED__'))) return false;
                  return true;
               })
               .map((st: any) => {
                  const rawOwnerEmail = st.owner_email ? String(st.owner_email).replace(/^"|"$/g, '').trim() : '';
                  const rawOwnerId = st.owner_id ? String(st.owner_id).replace(/^"|"$/g, '').trim() : '';
                  return {
                     id: st.id,
                     name: st.name || 'Boutique Sans Nom',
                     url: st.domain || `${st.id}.beyacreative.com`,
                     plan: (isAdminOrOwner && localStorage.getItem('beya_godmode_simulated_plan'))
                           ? localStorage.getItem('beya_godmode_simulated_plan')!
                           : (st.subscription_tier || st.plan || 'NORMAL'),
                     status: 'Active',
                     visitors: st.stats?.visitors || 0,
                     revenue: st.stats?.revenue ? `${st.stats.revenue} MAD` : '0 MAD',
                     owner_id: rawOwnerId,
                     owner_email: rawOwnerEmail,
                     config_json: null
                  };
               });

            // STRICT MULTI-TENANT DATA ISOLATION (SECURITY HARDENED):
            if (!isAdminOrOwner) {
               if (effectiveEmail || userId) {
                  const userEmailLower = effectiveEmail ? effectiveEmail.toLowerCase().trim() : '';
                  const userIdStr = userId ? String(userId).trim() : '';
                  realStores = realStores.filter((st: any) => {
                     const stEmailLower = st.owner_email ? st.owner_email.toLowerCase().trim() : '';
                     const isOwnerByEmail = userEmailLower && stEmailLower && stEmailLower === userEmailLower;
                     const isOwnerById = userIdStr && st.owner_id && String(st.owner_id).trim() === userIdStr;
                     return isOwnerByEmail || isOwnerById;
                  });
               } else {
                  // Anonymous / Local account: ONLY show stores where owner_email is undefined/null and owner_id is undefined/null
                  realStores = realStores.filter((st: any) =>
                     !st.owner_id && !st.owner_email
                  );
               }
            }

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

   useEffect(() => {
      fetchStores();
   }, []);

   const handleManageStore = async (store: any) => {
      if (store.config_json && Object.keys(store.config_json).length > 0) {
         onSelectStore(store);
         return;
      }
      setLoadingStoreId(store.id);
      try {
         const { data, error } = await supabase.from('stores').select('config_json').eq('id', store.id).single();
         if (error) throw error;
         onSelectStore({
            ...store,
            config_json: data?.config_json || {}
         });
      } catch (err) {
         console.warn("Could not fetch full store config, fallback to basic:", err);
         onSelectStore(store);
      } finally {
         setLoadingStoreId(null);
      }
   };

   const handleDeleteStore = async () => {
      if (!deleteTarget) return;
      const { id } = deleteTarget;
      setIsDeleting(true);
      try {
         // 1. Immediately record in persistent local blacklist so it NEVER shows up again
         markStoreDeletedLocally(id);

         // 2. Remove from React state immediately
         setStores(prev => prev.filter(s => s.id !== id));

         // 3. Perform hard delete in Supabase
         if (!id.startsWith('mock')) {
            try {
               await supabase.from('stores').delete().eq('id', id);
            } catch (delErr) {
               console.warn("Supabase hard delete error:", delErr);
            }

            // 4. Soft-delete backup in database so no client re-fetches it
            try {
               await supabase.from('stores').update({ name: '__DELETED__' }).eq('id', id);
            } catch (updErr) {
               console.warn("Supabase soft delete update error:", updErr);
            }

            // 5. Delete associated store products if any
            try {
               await supabase.from('store_products').delete().eq('store_id', id);
            } catch {
               // ignore
            }
         }
         setDeleteTarget(null);
      } catch (err) {
         console.error('Failed to delete store:', err);
         setStores(prev => prev.filter(s => s.id !== id));
         setDeleteTarget(null);
      } finally {
         setIsDeleting(false);
      }
   };

   // Store creation quota: NORMAL/PRO merchants get 1 boutique, PREMIUM up to 5. Admins are unrestricted.
   const isAdminUser = currentUser?.email === '00.emaily.zero@gmail.com' || currentUser?.email === 'fashlow@gmail.com' || currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
   const highestPlan = stores.some(s => s.plan === 'PREMIUM') ? 'PREMIUM' : stores.some(s => s.plan === 'PRO') ? 'PRO' : 'NORMAL';
   const storeLimit = highestPlan === 'PREMIUM' ? 5 : 1;
   const canCreateStore = isAdminUser || stores.length < storeLimit;

   const handleCreateStoreClick = () => {
      if (!canCreateStore) {
         alert(t(
            `Votre plan actuel (${highestPlan}) est limité à ${storeLimit} boutique${storeLimit > 1 ? 's' : ''}. Passez au plan PREMIUM pour créer jusqu'à 5 boutiques.`,
            `Your current plan (${highestPlan}) is limited to ${storeLimit} store${storeLimit > 1 ? 's' : ''}. Upgrade to PREMIUM to create up to 5 stores.`,
            `خطتك الحالية (${highestPlan}) محدودة بـ ${storeLimit} متجر. رقّي لباقة PREMIUM باش تقدر تخلق حتى 5 متاجر.`
         ));
         return;
      }
      setIsCreateWizardOpen(true);
   };

   return (
      <div className={`max-w-6xl mx-auto w-full space-y-8 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Mes Boutiques', 'My Stores', 'متاجري')}</h1>
                  <p className="text-slate-500 mt-1">{t('Gérez vos boutiques, abonnements et outils avancés.', 'Manage your stores, subscriptions and advanced tools.', 'إدارة المتاجر الخاصة بك، والاشتراكات، والأدوات المتقدمة.')}</p>
               </div>
            </div>
            <div className={`flex flex-wrap items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
               {/* BEYA Portal Switcher Button */}
               <button
                  onClick={() => {
                     window.location.hash = '#/portal';
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer group"
                  title={t('Basculer vers BEYA Portal', 'Switch to BEYA Portal', 'الانتقال إلى بوابة BEYA')}
               >
                  <Layers className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span>BEYA PORTAL</span>
                  <ArrowRight className={`w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
               </button>

               {/* Language Switcher (Small Icon FR/AR Toggle) */}
               <button
                  onClick={() => setLang(dashLang === 'ar' ? 'fr' : 'ar')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 cursor-pointer"
                  title={dashLang === 'ar' ? 'Passer en Français (FR)' : 'التغيير إلى العربية (AR)'}
               >
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{dashLang === 'ar' ? 'FR' : 'AR'}</span>
               </button>

               {/* Sleek Unified Account Pill Button */}
               <div className="flex items-center bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-1.5 shadow-sm hover:shadow-md transition-all">
                  <button
                     onClick={() => setIsProfileModalOpen(true)}
                     className="flex items-center gap-2.5 px-2.5 py-1 hover:bg-slate-50 rounded-xl transition-all text-left"
                     title={t('Mon compte & Abonnement', 'My account & Subscription', 'معلومات الحساب والاشتراك')}
                  >
                     <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                           {userProfile?.name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || t('Merchant', 'Merchant', 'تاجر')}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mt-0.5 leading-none">
                           {(() => {
                              const hasProStore = stores.some(s => s.plan === 'PRO');
                              const isAdmin = currentUser?.email === '00.emaily.zero@gmail.com' || currentUser?.email === 'fashlow@gmail.com' || currentUser?.role === 'admin';
                              if (isAdmin) return t('ADMIN / GÉRANT', 'ADMIN / MANAGER', 'مدير النظام (ADMIN)');
                              if (hasProStore) return t('GÉRANT (PRO)', 'MANAGER (PRO)', 'تاجر PRO');
                              return t('GÉRANT', 'MANAGER', 'تاجر (GÉRANT)');
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
                     title={t('Déconnexion', 'Logout', 'تسجيل الخروج')}
                  >
                     <LogOut className="w-4 h-4" />
                  </button>
               </div>

               <button
                  onClick={isLoading ? undefined : handleCreateStoreClick}
                  disabled={isLoading}
                  title={!isLoading && !canCreateStore ? t(
                     `Limite atteinte (${storeLimit} boutique${storeLimit > 1 ? 's' : ''} max sur le plan ${highestPlan})`,
                     `Limit reached (${storeLimit} store${storeLimit > 1 ? 's' : ''} max on the ${highestPlan} plan)`,
                     `الحد الأقصى (${storeLimit} متجر) لخطة ${highestPlan}`
                  ) : undefined}
                  className={`flex items-center gap-2 px-6 py-3 h-11 rounded-xl font-bold transition-colors shadow-lg active:scale-95 ${
                     isLoading
                        ? 'bg-slate-100 text-slate-400 shadow-none cursor-wait'
                        : canCreateStore
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                        : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                  }`}
               >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : canCreateStore ? <Plus className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  <span className="hidden sm:inline">{t('Créer boutique', 'Create store', 'إنشاء متجر')}</span>
                  <span className="sm:hidden">{t('Nouveau', 'New', 'جديد')}</span>
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
                           <Lock className="w-3 h-3" /> {t('Verrouillé', 'Locked', 'ميزة مقفلة')}
                        </span>
                     )}
                     <span className="text-indigo-200 text-sm font-medium">{t('Outils Exclusifs', 'Exclusive Tools', 'أدوات حصرية')}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                     {t('Trouvez les produits gagnants avec notre Assistant', 'Find winning products with our Assistant', 'اكتشف المنتجات المربحة مع المساعد الذكي')}
                  </h2>
                  <p className="text-indigo-100/80 mb-6 max-w-xl text-lg">
                     {t(
                        'Fonctionnalité exclusive au plan PRO. Analysez le marché marocain, découvrez les prix des concurrents et trouvez des niches rentables.',
                        'Exclusive to the PRO plan. Analyze the Moroccan market, discover competitor prices and find profitable niches.',
                        'ميزة حصرية للمشتركين في خطة PRO. قم بتحليل السوق المغربي، اعرف أسعار المنافسين، واكتشف مجالات (Niches) مربحة قبل الجميع.'
                     )}
                  </p>
                  {hasProStore ? (
                     <button onClick={onOpenAI} className="flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 group">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        {t('Lancer l\'Assistant PRO', 'Launch the PRO Assistant', 'إطلاق المساعد الخبير')}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                     </button>
                  ) : (
                     <button onClick={() => alert(t('Vous devez passer au plan PRO pour utiliser cette fonctionnalité.', 'You need to upgrade to the PRO plan to use this feature.', 'يجب ترقية متجرك إلى خطة PRO لاستخدام هذه الميزة.'))} className="flex items-center gap-3 bg-white/10 border border-white/20 text-white/50 px-8 py-4 rounded-xl font-black cursor-not-allowed shadow-xl group">
                        <Lock className="w-5 h-5 text-slate-400" />
                        {t('Lancer l\'Assistant PRO (Verrouillé)', 'Launch the PRO Assistant (Locked)', 'إطلاق المساعد الخبير (مقفل)')}
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
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('Vos Boutiques', 'Your Stores', 'متاجرك الحالية')}</h3>

            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">{t('Chargement des boutiques...', 'Loading stores...', 'جاري تحميل المتاجر...')}</p>
               </div>
            ) : stores.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm text-center">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                     <LayoutDashboard className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                     {t('Aucune boutique trouvée', 'No store found', 'لم يتم العثور على أي متجر')}
                  </h4>
                  <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
                     {t(
                        'Vous n\'avez pas encore créé de boutique ou aucune boutique n\'est associée à ce compte.',
                        'You haven\'t created a store yet or no store is linked to this account.',
                        'لم تقم بإنشاء أي متجر بعد أو لا يوجد متجر مرتبط بهذا الحساب.'
                     )}
                  </p>
                  {canCreateStore && (
                     <button
                        onClick={handleCreateStoreClick}
                        className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
                     >
                        <Plus className="w-5 h-5" />
                        <span>{t('Créer ma boutique', 'Create my store', 'إنشاء متجري')}</span>
                     </button>
                  )}
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
                                 <a href={getStoreVisitUrl(store)} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-1 transition-colors">
                                    {store.url} <ExternalLink className="w-3 h-3" />
                                 </a>
                              </div>
                           </div>
                           {store.plan === 'PREMIUM' ? (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                 <Crown className="w-3 h-3" /> PREMIUM
                              </span>
                           ) : store.plan === 'PRO' ? (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                 <Crown className="w-3 h-3" /> PRO
                              </span>
                           ) : (
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-amber-100 hover:text-amber-700 transition-colors" title={t('Passer au PRO', 'Upgrade to PRO', 'قم بالترقية إلى PRO')}>
                                 NORMAL
                              </span>
                           )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('Visiteurs (30j)', 'Visitors (30d)', 'الزوار (30 يوم)')}</p>
                              <p className="text-xl font-black text-slate-900">{store.visitors.toLocaleString()}</p>
                           </div>
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('Chiffre d\'Affaires', 'Revenue', 'المبيعات')}</p>
                              <p className="text-xl font-black text-slate-900">{store.revenue}</p>
                           </div>
                        </div>

                        <div className="flex gap-3">
                           <a 
                              href={getStoreVisitUrl(store)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/15 active:scale-95 flex items-center justify-center gap-2 group/btn"
                              title={t('Visiter la boutique en direct', 'Visit live store', 'زيارة المتجر مباشرة')}
                           >
                              <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              <span>{t('Visiter la boutique', 'Visit store', 'زيارة المتجر')}</span>
                           </a>
                           <button 
                              onClick={() => handleManageStore(store)} 
                              disabled={loadingStoreId === store.id}
                              className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                              title={t('Réglages & Configuration (modifier si vous avez oublié des réglages)', 'Settings & Configuration (manage store settings)', 'الإعدادات والتهيئة (تعديل الإعدادات والتحكم بالمتجر)')}
                           >
                              {loadingStoreId === store.id ? (
                                 <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                              ) : (
                                 <Settings className="w-5 h-5" />
                              )}
                           </button>
                           <button 
                              onClick={() => setDeleteTarget({ id: store.id, name: store.name })} 
                              className="w-12 h-12 flex items-center justify-center bg-white border border-rose-200 text-rose-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors active:scale-95" 
                              title={t('Supprimer la boutique', 'Delete store', 'حذف المتجر')}
                           >
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
                        {t('Supprimer cette boutique ?', 'Delete this store?', 'حذف هذا المتجر؟')}
                     </h3>
                     <p className="text-sm text-slate-500 font-medium mb-6">
                        {dashLang === 'ar'
                           ? <>أنت على وشك حذف <span className="font-bold text-slate-700">{deleteTarget.name}</span> بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.</>
                           : dashLang === 'en'
                           ? <>You are about to permanently delete <span className="font-bold text-slate-700">{deleteTarget.name}</span>. This action cannot be undone.</>
                           : <>Vous êtes sur le point de supprimer définitivement <span className="font-bold text-slate-700">{deleteTarget.name}</span>. Cette action est irréversible.</>}
                     </p>
                     <div className="flex gap-3">
                        <button
                           type="button"
                           onClick={() => setDeleteTarget(null)}
                           disabled={isDeleting}
                           className="flex-1 px-6 py-3.5 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-60"
                        >
                           {t('Annuler', 'Cancel', 'إلغاء')}
                        </button>
                        <button
                           type="button"
                           onClick={handleDeleteStore}
                           disabled={isDeleting}
                           className="flex-1 px-6 py-3.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                           {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                           {isDeleting ? t('Suppression...', 'Deleting...', 'جاري الحذف...') : t('Supprimer définitivement', 'Delete permanently', 'حذف نهائياً')}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Sleek Premium Merchant Account Details Modal */}
         {isProfileModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}>
               <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  {/* Elegant Light-Mode Header */}
                  <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white p-7 border-b border-slate-100 relative">
                     <button
                        onClick={() => setIsProfileModalOpen(false)}
                        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-all shadow-sm border border-slate-200/60"
                     >
                        <X className="w-4 h-4" />
                     </button>

                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/25 shrink-0 border-2 border-white">
                           {(userProfile?.name || currentUser?.email || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900 tracking-tight">
                              {userProfile?.name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || t('Marchand BEYA', 'BEYA Merchant', 'تاجر BEYA')}
                           </h3>
                           <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.email || t('Compte local', 'Local account', 'حساب محلي')}</p>
                           <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                              {(() => {
                                 const hasProStore = stores.some(s => s.plan === 'PRO');
                                 const isAdmin = currentUser?.email === '00.emaily.zero@gmail.com' || currentUser?.email === 'fashlow@gmail.com' || currentUser?.role === 'admin';
                                 if (isAdmin) return t('👑 GÉRANT (ADMIN)', '👑 MANAGER (ADMIN)', '👑 مدير النظام (ADMIN)');
                                 if (hasProStore) return t('👑 MARCHAND (PRO)', '👑 MERCHANT (PRO)', '👑 حساب تاجر PRO');
                                 return t('🏪 MARCHAND (NORMAL)', '🏪 MERCHANT (NORMAL)', '🏪 حساب تاجر (العادية)');
                              })()}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Modern Stats Grid & Details */}
                  <div className="p-6 space-y-5">
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Plan BEYA STORE', 'BEYA STORE Plan', 'خطة الاشتراك')}</p>
                           <p className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
                              <span>{(() => {
                                 const hasProStore = stores.some(s => s.plan === 'PRO');
                                 if (hasProStore) return t('👑 Plan PRO', '👑 PRO Plan', '👑 المتجر PRO');
                                 return t('Plan NORMAL', 'NORMAL Plan', 'الخطة العادية');
                              })()}</span>
                           </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Boutiques actives', 'Active stores', 'المتاجر النشطة')}</p>
                           <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-slate-900">{stores.length}</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                 {t('Actif', 'Active', 'نشط')}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Info List */}
                     <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-semibold">{t('Nom du compte', 'Account name', 'اسم التاجر / الحساب')}</span>
                           <span className="text-slate-900 font-bold">{userProfile?.name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Marchand BEYA'}</span>
                        </div>
                        <div className="h-px bg-slate-200/50" />
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-semibold">{t('Email de connexion', 'Login email', 'البريد الإلكتروني المتصل')}</span>
                           <span className="text-slate-900 font-mono font-bold truncate max-w-[200px]">{currentUser?.email || t('Non connecté', 'Not connected', 'غير متصل')}</span>
                        </div>
                     </div>

                     <div className="pt-1">
                        <button
                           onClick={async () => {
                              await supabase.auth.signOut();
                              window.location.href = '/';
                           }}
                           className="w-full py-3.5 bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl transition-all duration-300 shadow-md hover:shadow-rose-500/25 flex items-center justify-center gap-2 group"
                        >
                           <LogOut className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                           <span>{t('Se déconnecter', 'Log out', 'تسجيل الخروج من الحساب')}</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Step-by-Step Store Creation Wizard */}
         <CreateStoreWizardModal
            isOpen={isCreateWizardOpen}
            onClose={() => setIsCreateWizardOpen(false)}
            onStoreCreated={(createdStore) => {
               setIsCreateWizardOpen(false);
               onSelectStore(createdStore);
            }}
            currentUser={currentUser || appCurrentUser}
            isAr={isRtl}
         />

      </div>
   );
}
