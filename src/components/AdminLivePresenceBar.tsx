import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Scissors,
  Users,
  Briefcase,
  Shield,
  Phone,
  MessageSquare,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  Circle
} from 'lucide-react';
import { User, loadData } from '../types';
import { supabase } from '../supabase';
import { useLang } from '../contexts/LangContext';

export interface PresenceUser {
  id: string;
  nom: string;
  role: string;
  photo?: string | null;
  telephone?: string | null;
  email?: string | null;
  brandName?: string | null;
  page?: string;
  path?: string;
  onlineAt?: string;
  lastActive?: string;
  isLive?: boolean;
}

interface AdminLivePresenceBarProps {
  currentUser: User;
}

export default function AdminLivePresenceBar({ currentUser }: AdminLivePresenceBarProps) {
  const { isAr } = useLang();
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceUser>>({});
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [filterMode, setFilterMode] = useState<'live' | 'today'>('live');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('beya_admin_presence_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [selectedUser, setSelectedUser] = useState<PresenceUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Toggle collapse and persist
  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('beya_admin_presence_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // 1. Subscribe to Supabase Realtime Presence
  useEffect(() => {
    const channel = supabase.channel('beya-live-presence', {
      config: {
        presence: { key: currentUser.id }
      }
    });

    const updatePresenceState = () => {
      const state = channel.presenceState();
      const online: Record<string, PresenceUser> = {};
      Object.keys(state).forEach(key => {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          const latest = presences[presences.length - 1];
          if (latest && latest.id) {
            online[latest.id] = {
              id: latest.id,
              nom: latest.nom || 'Utilisateur',
              role: latest.role || 'client',
              photo: latest.photo,
              telephone: latest.telephone,
              email: latest.email,
              brandName: latest.brandName,
              page: latest.page || 'En navigation',
              path: latest.path || '/',
              onlineAt: latest.onlineAt || new Date().toISOString(),
              isLive: true
            };
          }
        }
      });
      setPresenceMap(online);
    };

    channel
      .on('presence', { event: 'sync' }, updatePresenceState)
      .on('presence', { event: 'join' }, updatePresenceState)
      .on('presence', { event: 'leave' }, updatePresenceState)
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({
              id: currentUser.id,
              nom: currentUser.nom,
              role: currentUser.role,
              photo: currentUser.photo,
              telephone: currentUser.telephone,
              email: currentUser.email,
              page: 'لوحة الإدارة',
              path: window.location.pathname,
              onlineAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Admin presence track error:', e);
          }
        }
      });

    return () => {
      try {
        channel.unsubscribe();
      } catch {}
    };
  }, [currentUser]);

  // 2. Fetch users with lastActive from DB periodically (optimized lightweight select)
  const fetchDbUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, nom, role, telephone, email, lastActive, photo')
        .order('lastActive', { ascending: false })
        .limit(120);

      if (!error && Array.isArray(data)) {
        setDbUsers(data as User[]);
      } else {
        const users = await loadData<User>('users');
        if (Array.isArray(users)) {
          setDbUsers(users);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch users for presence bar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbUsers();
    // Poll every 30s to keep recent activity fresh
    const timer = setInterval(fetchDbUsers, 30000);
    return () => clearInterval(timer);
  }, []);

  // 3. Compute active users (Realtime + DB lastActive)
  const allActiveUsers = useMemo(() => {
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const mergedMap = new Map<string, PresenceUser>();

    // Add Realtime presence users first (they are 100% live right now!)
    Object.values(presenceMap).forEach(u => {
      mergedMap.set(u.id, { ...u, isLive: true });
    });

    // Merge with DB users
    dbUsers.forEach(dbU => {
      if (!dbU || !dbU.id) return;
      if (dbU.id === 'master-admin' || dbU.id.startsWith('default-')) return;

      const lastActiveTime = dbU.lastActive ? new Date(dbU.lastActive).getTime() : 0;
      const isRecentlyActive = lastActiveTime > 0 && now - lastActiveTime < FIVE_MINUTES;
      const isActiveToday = lastActiveTime >= todayStart.getTime();

      const passesFilter = filterMode === 'live' ? isRecentlyActive : isActiveToday;

      if (passesFilter || mergedMap.has(dbU.id)) {
        const existing = mergedMap.get(dbU.id);
        mergedMap.set(dbU.id, {
          id: dbU.id,
          nom: dbU.nom || existing?.nom || 'Utilisateur',
          role: dbU.role || existing?.role || 'client',
          photo: dbU.photo || existing?.photo,
          telephone: dbU.telephone || existing?.telephone,
          email: dbU.email || existing?.email,
          brandName: (dbU as any).brandName || existing?.brandName,
          lastActive: dbU.lastActive || existing?.lastActive,
          page: existing?.page || (isRecentlyActive ? 'نشط بالنظام' : 'سجل الدخول اليوم'),
          path: existing?.path || '/',
          isLive: Boolean(existing?.isLive || isRecentlyActive)
        });
      }
    });

    return Array.from(mergedMap.values());
  }, [presenceMap, dbUsers, filterMode]);

  // 4. Categorize users into the 3 groups requested + team
  // "bghit lmodelts bohfhom olclint bhdhom olkhdama bhdhom"
  const modelistes = useMemo(() => {
    return allActiveUsers.filter(u => u.role === 'modeliste' || (u as any).networkRole === 'modeliste');
  }, [allActiveUsers]);

  const clients = useMemo(() => {
    return allActiveUsers.filter(
      u => u.role === 'client' || u.role === 'merchant' || (u as any).networkRole === 'brand'
    );
  }, [allActiveUsers]);

  const workers = useMemo(() => {
    return allActiveUsers.filter(u =>
      ['worker', 'coupeur', 'pointeur', 'chef_chaine', 'controleur'].includes(u.role)
    );
  }, [allActiveUsers]);

  const team = useMemo(() => {
    return allActiveUsers.filter(u =>
      ['admin', 'superadmin', 'commercial', 'partenaire', 'affiliate'].includes(u.role)
    );
  }, [allActiveUsers]);

  const totalOnlineCount = allActiveUsers.filter(u => u.isLive).length;

  // Format phone number to clean Moroccan international format
  const formatWhatsAppUrl = (phone?: string | null) => {
    if (!phone) return null;
    const clean = phone.replace(/\D/g, '');
    const finalPhone = clean.startsWith('0') ? '212' + clean.substring(1) : clean.startsWith('212') ? clean : '212' + clean;
    return `https://wa.me/${finalPhone}`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'modeliste':
        return { label: isAr ? 'موديليست' : 'Modéliste', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'client':
      case 'merchant':
        return { label: isAr ? 'زبون' : 'Client', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'worker':
      case 'coupeur':
      case 'pointeur':
      case 'chef_chaine':
        return { label: isAr ? 'عامل ورشة' : 'Ouvrier', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'commercial':
        return { label: isAr ? 'تجاري' : 'Commercial', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const renderAvatarCircle = (
    u: PresenceUser,
    borderClass: string,
    fallbackBg: string,
    fallbackText: string
  ) => {
    const initials = (u.nom || 'U')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div
        key={u.id}
        onClick={() => setSelectedUser(u)}
        className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shrink-0"
        title={`${u.nom} (${u.role}) — ${u.isLive ? (isAr ? 'متصل الآن' : 'En ligne') : (isAr ? 'نشط اليوم' : 'Actif')}`}
      >
        {/* Circle Avatar */}
        <div className="relative">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 shadow-sm flex items-center justify-center font-black text-xs sm:text-sm select-none ${borderClass} ${
              u.photo ? 'bg-white' : fallbackBg + ' ' + fallbackText
            }`}
          >
            {u.photo ? (
              <img src={u.photo} alt={u.nom} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Green Online Dot */}
          {u.isLive ? (
            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          ) : (
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-slate-400 border-2 border-white"
              title={isAr ? 'نشط اليوم' : 'Actif aujourd\'hui'}
            />
          )}
        </div>

        {/* User Name label below circle */}
        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate max-w-[68px] sm:max-w-[76px] mt-1 text-center group-hover:text-indigo-600">
          {u.nom.split(' ')[0]}
        </span>

        {/* Short page / activity hint */}
        {u.page && (
          <span className="text-[8.5px] font-bold text-slate-400 truncate max-w-[68px] sm:max-w-[76px] leading-tight text-center">
            {u.page.split(' ')[0]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-full mb-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-3.5 sm:p-5 shadow-sm transition-all"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ─── Top Header Strip ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {isAr ? 'المتصلون الآن بالنظام (Live)' : 'Utilisateurs Connectés en Direct'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              {totalOnlineCount} {isAr ? 'متصل حالياً' : 'en ligne'}
            </span>
            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
              ({allActiveUsers.length} {isAr ? 'مسجل اليوم' : 'aujourd\'hui'})
            </span>
          </div>
        </div>

        {/* Right Controls: Filter Switch & Toggle */}
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={fetchDbUsers}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isAr ? 'تحديث الآن' : 'Actualiser'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black">
            <button
              onClick={() => setFilterMode('live')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'live'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🟢 {isAr ? 'متصل الآن' : 'En ligne'} ({totalOnlineCount})
            </button>
            <button
              onClick={() => setFilterMode('today')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'today'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🕒 {isAr ? 'نشط اليوم' : 'Aujourd\'hui'} ({allActiveUsers.length})
            </button>
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={toggleCollapse}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isCollapsed ? (isAr ? 'إظهار شريط المتصلين' : 'Déplier') : (isAr ? 'طي الشريط' : 'Replier')}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── Collapsed Quick View ────────────────────────────────────── */}
      {isCollapsed ? (
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'الموديليست:' : 'Modélistes:'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
              {modelistes.filter(u => (filterMode === 'live' ? u.isLive : true)).length}{' '}
              {isAr ? 'متصل' : 'connecté'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'الزبائن:' : 'Clients:'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              {clients.filter(u => (filterMode === 'live' ? u.isLive : true)).length}{' '}
              {isAr ? 'متصل' : 'connecté'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'الخدامة والورشة:' : 'Ouvriers:'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
              {workers.filter(u => (filterMode === 'live' ? u.isLive : true)).length}{' '}
              {isAr ? 'متصل' : 'connecté'}
            </span>
          </div>
        </div>
      ) : (
        /* ─── Expanded View: 3 SEPARATED GROUPS (AS REQUESTED) ────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-3.5">
          {/* ─── GROUP 1: الموديليست (Modélistes) ───────────────────────── */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50/80 via-indigo-50/30 to-purple-50/40 dark:from-purple-950/20 dark:to-indigo-950/10 border border-purple-200/90 dark:border-purple-800/40 p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-tight">
                    {isAr ? 'الموديليست (Patronage)' : 'Modélistes (Patronage)'}
                  </h3>
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold block">
                    {isAr ? 'المسؤولون عن الباترونات والتدريج' : 'Designers & Gradation'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200/80 text-purple-900 border border-purple-300">
                {modelistes.filter(u => (filterMode === 'live' ? u.isLive : true)).length}
              </span>
            </div>

            {/* Avatars List */}
            <div className="flex items-center gap-3 overflow-x-auto py-1 min-h-[72px]">
              {modelistes.length === 0 ? (
                <div className="text-[11px] text-purple-400 font-medium italic py-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'لا يوجد موديليست متصل حالياً' : 'Aucun modéliste en ligne'}</span>
                </div>
              ) : (
                modelistes.map(u =>
                  renderAvatarCircle(
                    u,
                    'border-purple-500 ring-2 ring-purple-100',
                    'bg-purple-600',
                    'text-white'
                  )
                )
              )}
            </div>
          </div>

          {/* ─── GROUP 2: الزبائن (Clients) ──────────────────────────────── */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-emerald-50/40 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/90 dark:border-emerald-800/40 p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-tight">
                    {isAr ? 'الزبائن (Clients & Marques)' : 'Clients & Marques'}
                  </h3>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    {isAr ? 'أصحاب الطلبيات المتصلون بفضاء الزبون' : 'Connectés au Portail Client'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                {clients.filter(u => (filterMode === 'live' ? u.isLive : true)).length}
              </span>
            </div>

            {/* Avatars List */}
            <div className="flex items-center gap-3 overflow-x-auto py-1 min-h-[72px]">
              {clients.length === 0 ? (
                <div className="text-[11px] text-emerald-500 font-medium italic py-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'لا يوجد زبون متصل حالياً' : 'Aucun client en ligne'}</span>
                </div>
              ) : (
                clients.map(u =>
                  renderAvatarCircle(
                    u,
                    'border-emerald-500 ring-2 ring-emerald-100',
                    'bg-emerald-600',
                    'text-white'
                  )
                )
              )}
            </div>
          </div>

          {/* ─── GROUP 3: الخدامة والورشة (Ouvriers / Khdama) ────────────── */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-amber-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/90 dark:border-amber-800/40 p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-tight">
                    {isAr ? 'الخدامة والورشة (Ouvriers)' : 'Personnel Atelier (Ouvriers)'}
                  </h3>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block">
                    {isAr ? 'عمال الخياطة، الفصالة وسلسلة الإنتاج' : 'Coupe, Montage & Finition'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-900 border border-amber-300">
                {workers.filter(u => (filterMode === 'live' ? u.isLive : true)).length}
              </span>
            </div>

            {/* Avatars List */}
            <div className="flex items-center gap-3 overflow-x-auto py-1 min-h-[72px]">
              {workers.length === 0 ? (
                <div className="text-[11px] text-amber-500 font-medium italic py-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'لا يوجد عامل ورشة متصل حالياً' : 'Aucun ouvrier en ligne'}</span>
                </div>
              ) : (
                workers.map(u =>
                  renderAvatarCircle(
                    u,
                    'border-amber-500 ring-2 ring-amber-100',
                    'bg-amber-600',
                    'text-white'
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Compact Team Footer (Admins & Commerciaux) ───────────────── */}
      {!isCollapsed && team.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              💼 {isAr ? 'فريق الإدارة والتجاريين المتصلون:' : 'Équipe Admin & Commercial:'}
            </span>
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {team.map(u => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-800 text-white text-[9px] font-black flex items-center justify-center cursor-pointer hover:scale-110 transition shadow-2xs relative"
                  title={`${u.nom} (${u.role})`}
                >
                  {u.photo ? (
                    <img src={u.photo} alt={u.nom} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{u.nom.charAt(0)}</span>
                  )}
                  {u.isLive && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {team.filter(u => u.isLive).length} {isAr ? 'متصل من الإدارة' : 'membres connectés'}
          </span>
        </div>
      )}

      {/* ─── Quick Interactive Popover Modal ──────────────────────────── */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative space-y-4"
            onClick={e => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full bg-slate-50 dark:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* User Header */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-200 bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-lg">
                  {selectedUser.photo ? (
                    <img src={selectedUser.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedUser.nom.charAt(0)}</span>
                  )}
                </div>
                {selectedUser.isLive && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                  {selectedUser.nom}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      getRoleBadge(selectedUser.role).bg
                    }`}
                  >
                    {getRoleBadge(selectedUser.role).label}
                  </span>
                  {selectedUser.isLive ? (
                    <span className="text-[10px] font-bold text-emerald-600">
                      🟢 {isAr ? 'متصل الآن' : 'En direct'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      🕒 {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isAr ? 'نشط اليوم' : 'Aujourd\'hui')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              {selectedUser.page && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {isAr ? 'الصفحة الحالية:' : 'Emplacement:'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedUser.page}
                  </span>
                </div>
              )}
              {selectedUser.telephone && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {isAr ? 'الهاتف:' : 'Téléphone:'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono" dir="ltr">
                    {selectedUser.telephone}
                  </span>
                </div>
              )}
              {selectedUser.email && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {isAr ? 'البريد:' : 'Email:'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" dir="ltr">
                    {selectedUser.email}
                  </span>
                </div>
              )}
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {selectedUser.telephone ? (
                <>
                  <a
                    href={formatWhatsAppUrl(selectedUser.telephone) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${selectedUser.telephone.replace(/\D/g, '')}`}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isAr ? 'اتصال' : 'Appel'}</span>
                  </a>
                </>
              ) : (
                <div className="col-span-2 text-center text-[11px] text-slate-400 italic py-1">
                  {isAr ? 'لا يوجد رقم هاتف مسجل لهذا المستخدم' : 'Aucun numéro disponible'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
