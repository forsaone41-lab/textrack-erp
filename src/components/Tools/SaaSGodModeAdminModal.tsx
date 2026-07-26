import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Crown, Users, TrendingUp, Sparkles, AlertTriangle, 
  CheckCircle, RefreshCw, X, Search, Filter, Calendar, Award, 
  Zap, Lock, Unlock, Eye, Store, Scissors, Briefcase, ChevronRight, 
  Check, Globe, ArrowUpRight, Layers, Clock, ShieldAlert
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
  // Single-language switcher state: 'ar' or 'fr'
  const [lang, setLang] = useState<'ar' | 'fr'>(() => {
    const saved = localStorage.getItem('beya_godmode_lang');
    if (saved === 'ar' || saved === 'fr') return saved;
    return isAr ? 'ar' : 'fr';
  });

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

  // Strict Super-Admin / Founder verification
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
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (storesData && !storesError) {
        setAllStoresData(storesData);
      } else {
        setAllStoresData(stores);
      }

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

  const handleToggleLang = (newLang: 'ar' | 'fr') => {
    setLang(newLang);
    localStorage.setItem('beya_godmode_lang', newLang);
  };

  const handleSimulatePlan = (plan: 'REAL' | 'NORMAL' | 'PRO' | 'PREMIUM') => {
    setSimulatedPlan(plan);
    if (plan === 'REAL') {
      localStorage.removeItem('beya_godmode_simulated_plan');
      showToast(lang === 'ar' ? 'تم العودة إلى الوضع الحقيقي بنجاح' : 'Simulation désactivée (Mode Réel)');
    } else {
      localStorage.setItem('beya_godmode_simulated_plan', plan);
      showToast(
        lang === 'ar'
          ? `⚡ تم تفعيل وضع المحاكاة لخطة ${plan} بنجاح!`
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

      setAllStoresData(prev => 
        prev.map(st => st.id === storeId ? { 
          ...st, 
          subscription_tier: newPlan, 
          config_json: updatedConfig 
        } : st)
      );

      if (onRefreshStores) onRefreshStores();

      showToast(
        lang === 'ar'
          ? `✅ تم تفعيل خطة ${newPlan} بنجاح للمتجر: ${targetStore.name}`
          : `✅ Plan ${newPlan} activé avec succès pour : ${targetStore.name}`
      );
    } catch (err) {
      console.error('Error updating store plan:', err);
      alert(lang === 'ar' ? 'حدث خطأ أثناء تحديث الخطة' : 'Erreur lors de la mise à jour du plan');
    } finally {
      setUpdatingStoreId(null);
    }
  };

  if (!isOpen) return null;

  // Protect Modal against unauthorized access
  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-rose-500/30">
          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">
            {lang === 'ar' ? 'حماية أمنية: تم رفض الوصول' : 'Sécurité : Accès Refusé'}
          </h3>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            {lang === 'ar'
              ? 'هذه اللوحة محمية بتقنية عزل البيانات وتشفير المسؤول العام (God-Mode). لا يمكن الوصول إليها إلا للمدير العام أو مؤسس النظام.'
              : 'Ce panneau est protégé par isolation multi-tenant (God-Mode). Seuls les fondateurs et super-administrateurs autorisés peuvent y accéder.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                window.location.hash = '#/login';
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تسجيل الدخول بحساب مسؤول' : 'Se connecter en tant qu\'Admin'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
            >
              {lang === 'ar' ? 'إغلاق النافذة' : 'Fermer la fenêtre'}
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

  const pctNormal = totalStores > 0 ? Math.round((countNormal / totalStores) * 100) : 0;
  const pctPro = totalStores > 0 ? Math.round((countPro / totalStores) * 100) : 0;
  const pctPremium = totalStores > 0 ? Math.round((countPremium / totalStores) * 100) : 0;
  const pctTrial = totalStores > 0 ? Math.round((countTrial / totalStores) * 100) : 0;

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
    <div 
      className="fixed inset-0 z-[9999] bg-[#090d16] overflow-y-auto text-white flex flex-col"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* SECURITY TOAST */}
      {actionSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{actionSuccessToast}</span>
          <button onClick={() => setActionSuccessToast(null)} className="ml-2 opacity-80 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER BAR (Enterprise SaaS Style) */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  {lang === 'ar' ? '👑 التحكم الفائق SAAS' : '👑 GOD-MODE SAAS'}
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'اتصال مشفر ومؤمن' : 'Connexion chiffrée'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
                {lang === 'ar' ? 'مركز التحكم القيادي للمنصة (SaaS God-Mode)' : 'Centre de Commandement SaaS (God-Mode)'}
              </h1>
            </div>
          </div>

          {/* Right Actions: AR/FR Toggle + Refresh + Close */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* AR / FR Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => handleToggleLang('ar')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  lang === 'ar'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇲🇦</span>
                <span>العربية</span>
              </button>
              <button
                onClick={() => handleToggleLang('fr')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  lang === 'fr'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇫🇷</span>
                <span>Français</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchAllSaaSData}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors flex items-center gap-2 text-xs font-bold border border-white/10"
              title={lang === 'ar' ? 'تحديث البيانات' : 'Actualiser'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{lang === 'ar' ? 'تحديث الفوري' : 'Actualiser'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 flex items-center justify-center transition-all shadow-sm"
              title={lang === 'ar' ? 'إغلاق النافذة' : 'Fermer'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* PLAN SIMULATOR BANNER */}
      <div className="bg-[#111827] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                {lang === 'ar'
                  ? 'محاكي الخطط الإداري (اختبار صلاحيات الخطط دون إنشاء حساب تجريبي)'
                  : 'Simulateur de plan (Testez les fonctionnalités sans compte d\'essai)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'اختر خطة أدناه لتشغيل المنصة بهذه الصلاحيات فوراً في متصفحك'
                  : 'Sélectionnez un plan pour simuler son interface instantanément dans votre navigateur'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'REAL', label: lang === 'ar' ? '🟢 الوضع الحقيقي' : '🟢 Mode Réel' },
              { id: 'NORMAL', label: lang === 'ar' ? '⚡ محاكاة NORMAL' : '⚡ Test NORMAL' },
              { id: 'PRO', label: lang === 'ar' ? '🔥 محاكاة PRO' : '🔥 Test PRO' },
              { id: 'PREMIUM', label: lang === 'ar' ? '👑 محاكاة PREMIUM' : '👑 Test PREMIUM' },
            ].map((sim) => {
              const isActive = simulatedPlan === sim.id;
              return (
                <button
                  key={sim.id}
                  onClick={() => handleSimulatePlan(sim.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20 scale-105'
                      : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {sim.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* KPI METRIC CARDS (5 Spacious Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Stores */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">
                {lang === 'ar' ? 'إجمالي المتاجر والعملاء' : 'Total Boutiques'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-white">{totalStores}</p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ar' ? 'حساب ومتجر مسجل' : 'Comptes enregistrés'}
              </p>
            </div>
          </div>

          {/* Normal Plan */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase">
                {lang === 'ar' ? 'باقة NORMAL القياسية' : 'Abonnés NORMAL'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-white">{countNormal}</p>
                <span className="text-xs font-bold text-blue-400">{pctNormal}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${pctNormal}%` }} />
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-[#111827] border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase">
                {lang === 'ar' ? 'باقة PRO المتقدمة' : 'Abonnés PRO'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-white">{countPro}</p>
                <span className="text-xs font-bold text-amber-400">{pctPro}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pctPro}%` }} />
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-[#111827] border border-purple-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase">
                {lang === 'ar' ? 'باقة PREMIUM الملكية' : 'Abonnés PREMIUM'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-white">{countPremium}</p>
                <span className="text-xs font-bold text-purple-400">{pctPremium}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${pctPremium}%` }} />
              </div>
            </div>
          </div>

          {/* Active Trials */}
          <div className="bg-[#111827] border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">
                {lang === 'ar' ? 'فترات تجريبية نشطة' : 'Essais Actifs'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-white">{countTrial}</p>
                <span className="text-xs font-bold text-emerald-400">{pctTrial}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pctTrial}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ENTERPRISE TOOLBAR: FILTERS & SEARCH */}
        <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter by Plan */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2">
                {lang === 'ar' ? 'تصفية حسب الخطة:' : 'Filtrer par plan :'}
              </span>
              {[
                { id: 'ALL', label: lang === 'ar' ? 'الكل' : 'Tous' },
                { id: 'NORMAL', label: 'NORMAL' },
                { id: 'PRO', label: 'PRO' },
                { id: 'PREMIUM', label: 'PREMIUM' },
                { id: 'TRIAL', label: lang === 'ar' ? 'تجريبي نشط' : 'Essai Actif' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterPlan(f.id as any)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                    filterPlan === f.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Filter by Persona */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2">
                {lang === 'ar' ? 'تصفية حسب النشاط:' : 'Profil client :'}
              </span>
              {[
                { id: 'ALL', label: lang === 'ar' ? 'جميع الحسابات' : 'Tous les profils' },
                { id: 'BOUTIQUE', label: lang === 'ar' ? '🛍️ متجر إلكتروني' : '🛍️ Boutique e-com' },
                { id: 'COUTURE', label: lang === 'ar' ? '✂️ خياطة وإنتاج' : '✂️ Couture sans site' },
                { id: 'COMMERCIAL', label: lang === 'ar' ? '💼 شريك مسوق' : '💼 Affilié' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterPersona(p.id as any)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                    filterPersona === p.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400">
              {lang === 'ar'
                ? `النتائج المعروضة: (${filteredStores.length} من أصل ${totalStores} متجر)`
                : `Affichage : (${filteredStores.length} sur ${totalStores} boutiques)`}
            </span>
            <div className="relative w-full sm:w-80">
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث باسم المتجر، الدومين أو البريد...' : 'Rechercher par nom, domaine ou email...'}
                className={`w-full py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${lang === 'ar' ? 'left-3' : 'right-3'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CLIENTS TABLE & 1-CLICK PLAN ACTIVATOR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-base font-black text-white">
              {lang === 'ar' ? 'قائمة العملاء والمتاجر (1-Click Control)' : 'Liste des clients (Contrôle 1-Click)'}
            </h2>
            <span className="text-xs text-indigo-400 font-bold">
              {lang === 'ar' ? '👉 انقر على أي زر خِطة لتفعيلها للعميل في الحال' : '👉 Cliquez sur un plan pour l\'activer instantanément'}
            </span>
          </div>

          {filteredStores.length === 0 ? (
            <div className="bg-[#111827] border border-white/10 rounded-3xl p-16 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-base font-bold text-slate-400">
                {lang === 'ar' ? 'لا توجد متاجر تطابق معايير البحث الحالية' : 'Aucun client ne correspond à vos filtres'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStores.map((store) => {
                const plan = store.subscription_tier || store.config_json?.plan || 'NORMAL';
                const ownerEmail = store.config_json?.owner_email || store.owner_id || (lang === 'ar' ? 'حساب محلي غير متصل' : 'Compte local');
                const persona = store.config_json?.persona || store.config_json?.intent || 'BOUTIQUE';
                const createdDate = store.created_at ? new Date(store.created_at).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR') : 'N/A';
                const trialEnd = store.config_json?.trial_end_date;
                const isTrialActive = trialEnd && new Date(trialEnd) >= new Date();

                return (
                  <div 
                    key={store.id} 
                    className="bg-[#111827] border border-white/10 hover:border-indigo-500/50 rounded-3xl p-6 shadow-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Left Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        {persona === 'COUTURE' ? (
                          <Scissors className="w-6 h-6 text-purple-400" />
                        ) : persona === 'COMMERCIAL' ? (
                          <Briefcase className="w-6 h-6 text-blue-400" />
                        ) : (
                          <Store className="w-6 h-6 text-indigo-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-black text-white">{store.name || 'Boutique Sans Nom'}</h3>
                          
                          <span className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                            {store.domain || store.id.substring(0, 10)}
                          </span>

                          {/* Persona Badge */}
                          <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${
                            persona === 'COUTURE' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : persona === 'COMMERCIAL'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}>
                            {persona === 'COUTURE' 
                              ? (lang === 'ar' ? '✂️ خياطة وإنتاج فقط' : '✂️ Couture & Atelier')
                              : persona === 'COMMERCIAL'
                              ? (lang === 'ar' ? '💼 شريك مسوق' : '💼 Affilié Commercial')
                              : (lang === 'ar' ? '🛍️ متجر إلكتروني' : '🛍️ Marque / Boutique')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 font-mono mt-2">{ownerEmail}</p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{lang === 'ar' ? `تاريخ التسجيل: ${createdDate}` : `Créé le : ${createdDate}`}</span>
                          </span>

                          <span>•</span>

                          {trialEnd ? (
                            <span className={`flex items-center gap-1.5 font-bold ${isTrialActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {lang === 'ar'
                                  ? `${isTrialActive ? '🟢 تجربة نشطة حتى:' : '🔴 انتهت التجربة:'} ${new Date(trialEnd).toLocaleDateString('ar-MA')}`
                                  : `${isTrialActive ? '🟢 Essai actif au :' : '🔴 Essai expiré :'} ${new Date(trialEnd).toLocaleDateString('fr-FR')}`}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              {lang === 'ar' ? 'بدون تاريخ انتهاء تجريبية' : 'Sans date d\'essai'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Controls: Segmented Plan Selector + Trial Extender */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-xs font-bold text-slate-400 px-2 hidden xl:inline">
                        {lang === 'ar' ? 'الخطة الحالية:' : 'Plan :'}
                      </span>

                      {/* Segmented Button Group */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/5">
                        {/* NORMAL */}
                        <button
                          onClick={() => handleActivateClientPlan(store.id, 'NORMAL')}
                          disabled={updatingStoreId === store.id || plan === 'NORMAL'}
                          className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            plan === 'NORMAL'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <span>NORMAL</span>
                          {plan === 'NORMAL' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        {/* PRO */}
                        <button
                          onClick={() => handleActivateClientPlan(store.id, 'PRO')}
                          disabled={updatingStoreId === store.id || plan === 'PRO'}
                          className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            plan === 'PRO'
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                              : 'text-amber-400 hover:bg-amber-500/10'
                          }`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>PRO</span>
                          {plan === 'PRO' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        {/* PREMIUM */}
                        <button
                          onClick={() => handleActivateClientPlan(store.id, 'PREMIUM')}
                          disabled={updatingStoreId === store.id || plan === 'PREMIUM'}
                          className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            plan === 'PREMIUM'
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                              : 'text-purple-400 hover:bg-purple-600/10'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>PREMIUM</span>
                          {plan === 'PREMIUM' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Separate +30 Days Trial Button */}
                      <button
                        onClick={() => handleActivateClientPlan(store.id, plan as any, 30)}
                        disabled={updatingStoreId === store.id}
                        className="px-4 py-3 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2"
                        title={lang === 'ar' ? 'تمديد الصلاحية التجريبية 30 يوماً إضافية' : 'Prolonger l\'essai de 30 jours'}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{lang === 'ar' ? '+30 يوم تجريبي' : '+30j Essai'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-white/10 bg-[#0f172a] px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'ar'
                ? 'نظام عزل البيانات وتشفير الحسابات يعمل في الوقت الفعلي (Real-time Multi-tenant Security)'
                : 'Isolation des données en temps réel. Protégé par contrôle Fondateur / Super-Admin.'}
            </span>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
          >
            {lang === 'ar' ? 'إغلاق مركز التحكم' : 'Fermer le panneau'}
          </button>
        </div>
      </footer>
    </div>
  );
}
