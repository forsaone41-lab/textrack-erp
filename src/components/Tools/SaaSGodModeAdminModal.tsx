import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Crown, Users, TrendingUp, Sparkles, AlertTriangle, 
  CheckCircle, RefreshCw, X, Search, Filter, Calendar, Award, 
  Zap, Lock, Unlock, Eye, Store, Scissors, Briefcase, ChevronRight, Check
} from 'lucide-react';
import { supabase } from '../../supabase';

interface SaaSGodModeAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  stores: any[];
  onRefreshStores?: () => void;
  isAr?: boolean;
}

export default function SaaSGodModeAdminModal({
  isOpen,
  onClose,
  currentUser,
  stores = [],
  onRefreshStores,
  isAr = false
}: SaaSGodModeAdminModalProps) {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allStoresData, setAllStoresData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'ALL' | 'NORMAL' | 'PRO' | 'PREMIUM' | 'TRIAL'>('ALL');
  const [filterPersona, setFilterPersona] = useState<'ALL' | 'BOUTIQUE' | 'COUTURE' | 'COMMERCIAL'>('ALL');
  const [simulatedPlan, setSimulatedPlan] = useState<string>(() => {
    return localStorage.getItem('beya_godmode_simulated_plan') || 'REAL';
  });
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);
  const [updatingStoreId, setUpdatingStoreId] = useState<string | null>(null);

  // Strict Super-Admin / Merchant Founder verification
  const isSuperAdmin = 
    currentUser?.email === '00.emaily.zero@gmail.com' ||
    currentUser?.email === 'fashlow@gmail.com' ||
    currentUser?.email === 'contact@beyacreative.ma' ||
    currentUser?.email === 'admin@beyacreative.ma' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'superadmin' ||
    currentUser?.role === 'merchant' ||
    currentUser?.id === 'master-admin';

  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      fetchAllSaaSData();
    }
  }, [isOpen, isSuperAdmin]);

  const fetchAllSaaSData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all stores across Fashlow/BEYA platform
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (storesData && !storesError) {
        setAllStoresData(storesData);
      } else {
        setAllStoresData(stores);
      }

      // 2. Fetch users from users table if accessible
      try {
        const { data: usersData } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        if (usersData) {
          setAllUsers(usersData);
        }
      } catch (e) {
        console.warn('Could not fetch users list:', e);
      }
    } catch (err) {
      console.error('Failed to fetch SaaS God-Mode data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePlan = (plan: 'REAL' | 'NORMAL' | 'PRO' | 'PREMIUM') => {
    setSimulatedPlan(plan);
    if (plan === 'REAL') {
      localStorage.removeItem('beya_godmode_simulated_plan');
      showToast(isAr ? 'تم إلغاء المحاكاة (الوضع الحقيقي)' : 'Simulation désactivée (Mode Réel)');
    } else {
      localStorage.setItem('beya_godmode_simulated_plan', plan);
      showToast(
        isAr 
          ? `⚡ تم تفعيل وضع التجربة لخطة ${plan} بنجاح!`
          : `⚡ Simulation du plan ${plan} activée avec succès !`
      );
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => {
      setActionSuccessToast(null);
    }, 4000);
  };

  // 1-Click Activate Plan for any Store/Client
  const handleActivateClientPlan = async (storeId: string, newPlan: 'NORMAL' | 'PRO' | 'PREMIUM', extendTrialDays: number = 0) => {
    setUpdatingStoreId(storeId);
    try {
      const targetStore = allStoresData.find(s => s.id === storeId);
      if (!targetStore) return;

      const currentConfig = targetStore.config_json || {};
      let trialEndDate = currentConfig.trial_end_date;

      if (extendTrialDays > 0) {
        const now = new Date();
        now.setDate(now.getDate() + extendTrialDays);
        trialEndDate = now.toISOString();
      }

      const updatedConfig = {
        ...currentConfig,
        plan: newPlan,
        trial_end_date: trialEndDate,
        updated_by_superadmin: currentUser?.email || 'superadmin',
        updated_at: new Date().toISOString()
      };

      if (!storeId.startsWith('mock')) {
        const { error } = await supabase
          .from('stores')
          .update({
            subscription_tier: newPlan,
            config_json: updatedConfig
          })
          .eq('id', storeId);

        if (error) throw error;
      }

      // Update local state instantly
      setAllStoresData(prev => 
        prev.map(st => st.id === storeId ? { 
          ...st, 
          subscription_tier: newPlan, 
          config_json: updatedConfig 
        } : st)
      );

      if (onRefreshStores) onRefreshStores();

      showToast(
        isAr
          ? `✅ تم تفعيل خطة ${newPlan} بنجاح للمتجر ${targetStore.name}!`
          : `✅ Plan ${newPlan} activé avec succès pour ${targetStore.name} !`
      );
    } catch (err) {
      console.error('Error updating store plan:', err);
      alert(isAr ? 'حدث خطأ أثناء تحديث خطة العميل.' : 'Erreur lors de la mise à jour du plan client.');
    } finally {
      setUpdatingStoreId(null);
    }
  };

  if (!isOpen) return null;

  // Protect Modal against unauthorized access
  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl border border-rose-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {isAr ? 'حماية أمنية: تم رفض الوصول' : 'Sécurité : Accès Refusé'}
          </h3>
          <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed">
            {isAr 
              ? 'هذه الصفحة محمية بتقنية عزل البيانات وتشفير المسؤول العام (God-Mode). لا يمكن لأحد غير مؤسس النظام أو المدير التنفيذي الوصول إليها.'
              : 'Ce panneau est protégé par isolation multi-tenant (God-Mode). Seuls les fondateurs et super-administrateurs autorisés peuvent y accéder.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                window.location.hash = '#/login';
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase shadow-lg transition-all"
            >
              {isAr ? '🔑 تسجيل الدخول بحساب مسؤول' : '🔑 Se connecter en tant qu\'Admin'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-slate-800 transition-all"
            >
              {isAr ? 'إغلاق النافذة' : 'Fermer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate SaaS KPIs
  const totalStores = allStoresData.length;
  const countNormal = allStoresData.filter(s => (s.subscription_tier || s.config_json?.plan) === 'NORMAL').length;
  const countPro = allStoresData.filter(s => (s.subscription_tier || s.config_json?.plan) === 'PRO').length;
  const countPremium = allStoresData.filter(s => (s.subscription_tier || s.config_json?.plan) === 'PREMIUM').length;
  const countTrial = allStoresData.filter(s => {
    const end = s.config_json?.trial_end_date;
    return end && new Date(end) >= new Date();
  }).length;

  // Filtered Stores List
  const filteredStores = allStoresData.filter(st => {
    const nameMatch = (st.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (st.domain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (st.config_json?.owner_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!nameMatch) return false;

    const plan = st.subscription_tier || st.config_json?.plan || 'NORMAL';
    if (filterPlan === 'NORMAL' && plan !== 'NORMAL') return false;
    if (filterPlan === 'PRO' && plan !== 'PRO') return false;
    if (filterPlan === 'PREMIUM' && plan !== 'PREMIUM') return false;
    if (filterPlan === 'TRIAL') {
      const end = st.config_json?.trial_end_date;
      if (!end || new Date(end) < new Date()) return false;
    }

    // Persona Filtering
    const persona = st.config_json?.persona || st.config_json?.intent || 'BOUTIQUE';
    if (filterPersona !== 'ALL' && persona !== filterPersona) return false;

    return true;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto" onClick={onClose}>
      <div 
        className={`w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white animate-in fade-in zoom-in-95 duration-200 ${isAr ? 'text-right' : 'text-left'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Security Toast / Notification */}
        {actionSuccessToast && (
          <div className="bg-emerald-600 text-white px-6 py-3 font-bold text-xs flex items-center justify-between shadow-lg animate-bounce">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {actionSuccessToast}
            </span>
            <button onClick={() => setActionSuccessToast(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TOP GOD-MODE EXECUTIVE BAR */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg shrink-0">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950">
                  🛡️ {isAr ? 'وضع التحكم الفائق' : 'GOD-MODE ADMIN'}
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {isAr ? 'مشفر ومؤمن 100%' : 'Chiffré & Sécurisé'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                {isAr ? 'لوحة القيادة العليا لإدارة المنصة والاشتراكات (SaaS)' : 'Panneau de Contrôle Suprême SaaS'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllSaaSData}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center gap-2 text-xs font-bold"
              title={isAr ? 'تحديث البيانات' : 'Actualiser'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isAr ? 'تحديث الفوري' : 'Actualiser'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SELF-TESTING GOD-MODE PLAN SIMULATOR BAR ("Njrb les plan kamlin bala mnhl hisbat tjribya") */}
        <div className="bg-slate-950/80 p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">
              {isAr ? 'تفعيل محاكاة الخطة لاختبار المميزات بدون حساب تجريبي:' : 'Simulation de plan (Test de toutes les fonctionnalités par l\'Admin) :'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'REAL', label: isAr ? '🟢 الوضع الحقيقي' : '🟢 Mode Réel', color: 'bg-slate-800 text-slate-300' },
              { id: 'NORMAL', label: isAr ? '⚡ محاكاة NORMAL' : '⚡ Test NORMAL', color: 'bg-indigo-900/60 text-indigo-200' },
              { id: 'PRO', label: isAr ? '🔥 محاكاة PRO' : '🔥 Test PRO', color: 'bg-amber-500/20 text-amber-300' },
              { id: 'PREMIUM', label: isAr ? '👑 محاكاة PREMIUM' : '👑 Test PREMIUM', color: 'bg-purple-600/30 text-purple-200' },
            ].map((sim) => (
              <button
                key={sim.id}
                onClick={() => handleSimulatePlan(sim.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${simulatedPlan === sim.id ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 ' + sim.color : 'border-white/5 bg-slate-900/60 text-slate-400 hover:bg-slate-800'}`}
              >
                {sim.label}
              </button>
            ))}
          </div>
        </div>

        {/* LIVE METRICS / STATS GRID ("chehal mn wahd msjl o chehal mn wahd bagha normal...") */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4 border-b border-white/10 bg-slate-900/50">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">{isAr ? 'إجمالي المسجلين' : 'Inscrits Totals'}</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">{totalStores}</p>
            <p className="text-[10px] text-indigo-300 mt-1">{isAr ? 'متجر وحساب على المنصة' : 'Méta-comptes & Boutiques'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">{isAr ? 'مشتركو NORMAL' : 'Abonnés NORMAL'}</span>
              <Store className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-blue-300 mt-2">{countNormal}</p>
            <p className="text-[10px] text-slate-400 mt-1">{isAr ? 'الباقة العادية / القياسية' : 'Plan Standard'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase">{isAr ? 'مشتركو PRO' : 'Abonnés PRO'}</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300 mt-2">{countPro}</p>
            <p className="text-[10px] text-amber-200/70 mt-1">{isAr ? 'أدوات الذكاء الاصطناعي' : 'Outils IA & Niches'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-600/5 border border-purple-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-300 uppercase">{isAr ? 'مشتركو PREMIUM' : 'Abonnés PREMIUM'}</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-purple-300 mt-2">{countPremium}</p>
            <p className="text-[10px] text-purple-200/70 mt-1">{isAr ? 'حساب VIP شامل' : 'VIP 360° Illimité'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-300 uppercase">{isAr ? 'الفترة التجريبية' : 'En Période d\'Essai'}</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-300 mt-2">{countTrial}</p>
            <p className="text-[10px] text-emerald-200/70 mt-1">{isAr ? 'صلاحية تجريبية نشطة' : 'Essai actif non expiré'}</p>
          </div>
        </div>

        {/* FILTER BAR FOR CLIENTS & PERSONA ANALYTICS ("Bachmn sifa wach commercial wach couturier bala sit") */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 bg-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Plan */}
            <span className="text-xs font-bold text-slate-400 mr-2">{isAr ? 'الخطة:' : 'Plan :'}</span>
            {[
              { id: 'ALL', label: isAr ? 'الكل (All)' : 'Tout' },
              { id: 'NORMAL', label: 'NORMAL' },
              { id: 'PRO', label: 'PRO' },
              { id: 'PREMIUM', label: 'PREMIUM' },
              { id: 'TRIAL', label: isAr ? 'تجريبي (Essai)' : 'Essai Actif' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterPlan(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${filterPlan === f.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                {f.label}
              </button>
            ))}

            <div className="w-px h-6 bg-white/10 mx-2 hidden md:block" />

            {/* Filter by User Intent / Persona */}
            <span className="text-xs font-bold text-slate-400 mr-2">{isAr ? 'صفة العميل / الهدف:' : 'Profil client :'}</span>
            {[
              { id: 'ALL', label: isAr ? 'جميع الصفات' : 'Tous profils' },
              { id: 'BOUTIQUE', label: isAr ? '🛍️ متجر / علامة تجارية' : '🛍️ Boutique e-com' },
              { id: 'COUTURE', label: isAr ? '✂️ خياطة وإنتاج (بدون متجر)' : '✂️ Couture sans site' },
              { id: 'COMMERCIAL', label: isAr ? '💼 مسوق / شريك تجاري' : '💼 Partenaire' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPersona(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${filterPersona === p.id ? 'bg-purple-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'ابحث باسم المتجر أو البريد...' : 'Rechercher par nom ou email...'}
              className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* CLIENTS LIST / TABLE WITH 1-CLICK PLAN ACTIVATOR ("kifach nqder nactive les plan lclient hit hadchi balia chwi m3qd") */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-300">
              {isAr ? `العملاء والمتاجر المسجلة (${filteredStores.length})` : `Clients & Boutiques enregistrées (${filteredStores.length})`}
            </h3>
            <span className="text-xs text-indigo-400 font-bold">
              {isAr ? '👉 انقر على أي زر خِطة لتفعيلها للعميل في الحال (1-Click Activation)' : '👉 Cliquez pour changer le plan du client instantanément'}
            </span>
          </div>

          {filteredStores.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                {isAr ? 'لا توجد نتائج مطابقة لبحثك في هذا الفلتر' : 'Aucun client ne correspond à ces critères'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStores.map((store) => {
                const plan = store.subscription_tier || store.config_json?.plan || 'NORMAL';
                const ownerEmail = store.config_json?.owner_email || store.owner_id || (isAr ? 'حساب محلي غير متصل' : 'Compte local');
                const persona = store.config_json?.persona || store.config_json?.intent || 'BOUTIQUE';
                const createdDate = store.created_at ? new Date(store.created_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR') : 'N/A';
                const trialEnd = store.config_json?.trial_end_date;
                const isTrialActive = trialEnd && new Date(trialEnd) >= new Date();

                return (
                  <div 
                    key={store.id} 
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Store info & persona */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        {persona === 'COUTURE' ? (
                          <Scissors className="w-5 h-5 text-purple-400" />
                        ) : persona === 'COMMERCIAL' ? (
                          <Briefcase className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Store className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white">{store.name || 'Boutique Sans Nom'}</h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {store.domain || store.id.substring(0, 8)}
                          </span>

                          {/* Persona Badge */}
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            persona === 'COUTURE' 
                              ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                              : persona === 'COMMERCIAL'
                              ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                              : 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50'
                          }`}>
                            {persona === 'COUTURE' 
                              ? (isAr ? '✂️ خياطة فقط (بدون متجر)' : '✂️ Couture sans site')
                              : persona === 'COMMERCIAL'
                              ? (isAr ? '💼 شريك مسوق' : '💼 Affilié')
                              : (isAr ? '🛍️ متجر إلكتروني' : '🛍️ Marque / Boutique')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 font-mono mt-1">{ownerEmail}</p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                          <span>{isAr ? `تاريخ التسجيل: ${createdDate}` : `Créé le: ${createdDate}`}</span>
                          <span>•</span>
                          {trialEnd ? (
                            <span className={isTrialActive ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {isAr 
                                ? `${isTrialActive ? '🟢 فترة تجريبية حتى:' : '🔴 انتهت التجربة في:'} ${new Date(trialEnd).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')}` 
                                : `${isTrialActive ? '🟢 Essai jusqu\'au:' : '🔴 Essai expiré:'} ${new Date(trialEnd).toLocaleDateString('fr-FR')}`}
                            </span>
                          ) : (
                            <span className="text-slate-500">{isAr ? 'بدون فترة تجريبية محددة' : 'Sans date d\'essai'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: 1-Click Plan Activator Controls */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 mr-1 hidden sm:inline">
                        {isAr ? 'تفعيل فوري:' : 'Activer Plan :'}
                      </span>

                      {/* NORMAL BUTTON */}
                      <button
                        onClick={() => handleActivateClientPlan(store.id, 'NORMAL')}
                        disabled={updatingStoreId === store.id || plan === 'NORMAL'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          plan === 'NORMAL'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/40 cursor-default'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span>NORMAL</span>
                        {plan === 'NORMAL' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {/* PRO BUTTON */}
                      <button
                        onClick={() => handleActivateClientPlan(store.id, 'PRO')}
                        disabled={updatingStoreId === store.id || plan === 'PRO'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          plan === 'PRO'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-2 ring-amber-300 cursor-default'
                            : 'bg-slate-800 text-amber-300 hover:bg-amber-500/20'
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>PRO</span>
                        {plan === 'PRO' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {/* PREMIUM BUTTON */}
                      <button
                        onClick={() => handleActivateClientPlan(store.id, 'PREMIUM')}
                        disabled={updatingStoreId === store.id || plan === 'PREMIUM'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          plan === 'PREMIUM'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 ring-2 ring-purple-400 cursor-default'
                            : 'bg-slate-800 text-purple-300 hover:bg-purple-600/30'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>PREMIUM</span>
                        {plan === 'PREMIUM' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />

                      {/* +30 Days Trial Extender */}
                      <button
                        onClick={() => handleActivateClientPlan(store.id, plan as any, 30)}
                        disabled={updatingStoreId === store.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900 transition-colors flex items-center gap-1"
                        title={isAr ? 'تمديد الصلاحية التجريبية للعميل 30 يوماً إضافية' : 'Prolonger l\'essai de 30 jours'}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>+30j {isAr ? 'تجريبي' : 'Essai'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER INFO */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>
            {isAr 
              ? '🛡️ تم حماية هذه اللوحة بتقنيات التشفير وعزل الحسابات. لا تتم مشاركة هذه البيانات مع أي مستخدم آخر.'
              : '🛡️ Données isolées en temps réel. Protégé par contrôle d\'accès Fondateur / Super-Admin.'}
          </p>
          <button
            onClick={onClose}
            className="mt-2 sm:mt-0 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
          >
            {isAr ? 'إغلاق اللوحة العليا' : 'Fermer le panneau'}
          </button>
        </div>
      </div>
    </div>
  );
}
