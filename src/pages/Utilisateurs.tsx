import { useState, useEffect, Fragment, ElementType } from 'react';
import {
  Plus, Search, Edit2, Trash2,
  ShieldCheck, HardHat, ShoppingBag,
  Eye, Copy, RefreshCw, KeyRound, UserX,
  LayoutDashboard, FileText, Scissors, Factory, Package,
  Users, ShoppingCart, Receipt, TrendingDown, ClipboardCheck, Clock,
  Globe, Trophy, UserCircle, RotateCcw, Lock, Zap, MousePointer2, UserCheck, BarChart3, Settings, X, Sparkles, Inbox as InboxIcon, Mail, Video
} from 'lucide-react';
import {
  User, AppPage, RolePermMap,
  loadData, saveRecord, deleteRecord, genId,
  loadPermissions, savePermissions, DEFAULT_PERMISSIONS,
} from '../types';
import { useLang } from '../contexts/LangContext';

// ─── Role Config ───────────────────────────────────────────
const ROLE_CFG = {
  admin: {
    label: 'Administrateur', labelAr: 'مدير (Admin)', icon: ShieldCheck,
    bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
    ring: 'ring-indigo-400', avatar: 'from-indigo-500 to-purple-600', dot: 'bg-indigo-500',
    desc: 'Accès complet à toutes les fonctionnalités',
    access: ['Dashboard', 'Production', 'RH', 'Finance', 'Contrôle Qualité'],
  },
  pointeur: {
    label: 'Chef de Production', labelAr: 'رئيس ورشة (Chef)', icon: HardHat,
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
    ring: 'ring-blue-400', avatar: 'from-blue-500 to-cyan-600', dot: 'bg-blue-500',
    desc: 'Gestion de production, ouvriers et commandes',
    access: ['Production', 'Pointage', 'Contrôle Qualité'],
  },
  client: {
    label: 'Client', labelAr: 'زبون (Client)', icon: ShoppingBag,
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    ring: 'ring-emerald-400', avatar: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500',
    desc: 'Accès au portail client uniquement',
    access: ['Portail Client'],
  },
  worker: {
    label: 'Ouvrier', labelAr: 'عامل (Employé)', icon: Users,
    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
    ring: 'ring-purple-400', avatar: 'from-purple-500 to-indigo-600', dot: 'bg-purple-500',
    desc: 'Accès aux outils de pointage et scanner',
    access: ['Pointage', 'Espace Ouvrier'],
  },
  coupeur: {
    label: 'Coupeur', labelAr: 'فصّال (Coupeur)', icon: Scissors,
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
    ring: 'ring-orange-400', avatar: 'from-orange-500 to-amber-600', dot: 'bg-orange-500',
    desc: 'Gestion des ordres de coupe uniquement',
    access: ['Ordres de Coupe'],
  },
  modeliste: {
    label: 'Modéliste', labelAr: 'موديليست (Modéliste)', icon: FileText,
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
    ring: 'ring-blue-400', avatar: 'from-blue-500 to-indigo-600', dot: 'bg-blue-500',
    desc: 'Gestion des fiches techniques',
    access: ['Fiches Techniques'],
  },
  controleur: {
    label: 'Contrôleur Qualité', labelAr: 'مراقبة الجودة (QC)', icon: ShieldCheck,
    bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200',
    ring: 'ring-rose-400', avatar: 'from-rose-500 to-orange-600', dot: 'bg-rose-500',
    desc: 'Contrôle qualité et suivi des pièces',
    access: ['Contrôle Qualité', 'Scan Production'],
  },
  agent_pointage: {
    label: 'Agent Pointage', labelAr: 'مكلف بالpointage', icon: Clock,
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    ring: 'ring-emerald-400', avatar: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500',
    desc: 'Enregistrement des présences',
    access: ['Pointage', 'Suivi RH'],
  },
  partenaire: {
    label: 'Façonnier', labelAr: 'فاصونيي (Façonnier)', icon: Globe,
    bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
    ring: 'ring-indigo-400', avatar: 'from-slate-700 to-slate-900', dot: 'bg-slate-700',
    desc: 'Accès au portail partenaires',
    access: ['Portail Partenaire'],
  },
  chef_chaine: {
    label: 'Chef de Chaîne', labelAr: 'شاف دو شين', icon: Users,
    bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200',
    ring: 'ring-teal-400', avatar: 'from-teal-500 to-emerald-600', dot: 'bg-teal-500',
    desc: 'Gestion de la chaîne et de la production',
    access: ['Portail Chef de Chaîne'],
  },
} as const;



// ─── Pages Definition ──────────────────────────────────────
interface PageDef { key: AppPage; label: string; icon: ElementType; group: string; labelAr: string; }
const ALL_PAGES: PageDef[] = [
  { key: 'dashboard', label: 'Dashboard', labelAr: 'لوحة القيادة العامة', icon: LayoutDashboard, group: 'Général' },
  { key: 'demandes', label: 'Prospects (Leads)', labelAr: 'الزبناء المحتملون', icon: Users, group: 'Général' },
  { key: 'inbox', label: 'Boîte de Réception', labelAr: 'صندوق الرسائل', icon: InboxIcon, group: 'Général' },
  { key: 'gmail', label: 'Boîte Gmail', labelAr: 'البريد الوارد (Gmail)', icon: Mail, group: 'Général' },
  
  { key: 'fiches', label: 'Fiches Techniques', labelAr: 'البطاقات التقنية', icon: FileText, group: 'Production' },
  { key: 'ai_space', label: 'Assistant IA', labelAr: 'المساعد الذكي (AI Space)', icon: Sparkles, group: 'Production' },
  { key: 'ordres', label: 'Ordres de Coupe', labelAr: 'أوامر القص', icon: Scissors, group: 'Production' },
  { key: 'chaine', label: 'Chaîne de Montage', labelAr: 'تتبع التركيب', icon: Factory, group: 'Production' },
  { key: 'pilotage', label: 'Pilotage & Chaine', labelAr: 'قيادة خط الإنتاج', icon: MousePointer2, group: 'Production' },
  { key: 'scan_production', label: 'Scan Production', labelAr: 'سكانير تتبع القطع', icon: Zap, group: 'Production' },
  { key: 'controle_qualite', label: 'Contrôle Qualité', labelAr: 'مراقبة الجودة', icon: ShieldCheck, group: 'Production' },
  
  { key: 'stocks', label: 'Stock Matériaux', labelAr: 'مخزن السلع', icon: Package, group: 'Stocks' },
  { key: 'fournisseurs', label: 'Fournisseurs', labelAr: 'الموردين', icon: UserCheck, group: 'Stocks' },
  { key: 'achats', label: 'Achats', labelAr: 'المشتريات', icon: ShoppingCart, group: 'Stocks' },
  
  { key: 'rh', label: 'Suivi RH & العمال', labelAr: 'الموارد البشرية والعمال', icon: Users, group: 'RH & Finance' },
  { key: 'plaintes', label: 'Plaintes', labelAr: 'الشكايات', icon: FileText, group: 'RH & Finance' },
  { key: 'clients', label: 'Base Clients', labelAr: 'قاعدة الزبناء', icon: UserCheck, group: 'RH & Finance' },
  { key: 'commandes', label: 'Commandes', labelAr: 'الطلبيات', icon: ShoppingCart, group: 'RH & Finance' },
  { key: 'factures', label: 'Factures', labelAr: 'الفواتير', icon: Receipt, group: 'RH & Finance' },
  { key: 'charges', label: 'Charges & Dépenses', labelAr: 'المصاريف', icon: TrendingDown, group: 'RH & Finance' },
  { key: 'bilan', label: 'Bilan Financier', labelAr: 'الميزانية والأرباح', icon: BarChart3, group: 'RH & Finance' },
  
  { key: 'fast_scanner', label: 'Fast Scanner (PRO)', labelAr: 'الماسح السريع (PRO)', icon: Zap, group: 'Outils' },
  { key: 'pointage', label: 'Pointage', labelAr: 'تسجيل الحضور', icon: ClipboardCheck, group: 'Outils' },
  { key: 'portail_client', label: 'Portail Client', labelAr: 'بوابة الزبون', icon: ShoppingBag, group: 'Portails' },
  { key: 'worker_portal', label: 'Espace Ouvrier', labelAr: 'فضاء العامل', icon: UserCircle, group: 'Portails' },
  { key: 'partenaire_portal', label: 'Portail Partenaire', labelAr: 'بوابة الشركاء', icon: Globe, group: 'Portails' },
  { key: 'chef_chaine_portal', label: 'Portail Chef de Chaîne', labelAr: 'بوابة رئيس السلسلة', icon: Users, group: 'Portails' },
  { key: 'performance', label: 'Performance', labelAr: 'أداء العمال', icon: Trophy, group: 'Outils' },
  { key: 'utilisateurs', label: 'Gestion Utilisateurs', labelAr: 'إدارة المستخدمين', icon: UserCircle, group: 'Outils' },
  { key: 'parametres', label: 'Paramètres', labelAr: 'الإعدادات', icon: Settings, group: 'Outils' },
  { key: 'visio', label: 'Salle de Réunion (Visio)', labelAr: 'قاعة الاجتماعات', icon: Video, group: 'Outils' },
];

const PAGE_GROUPS = ['Général', 'Production', 'Stocks', 'RH & Finance', 'Portails', 'Outils'];
const PAGE_GROUPS_AR: Record<string, string> = {
  'Général': 'عام',
  'Production': 'الإنتاج',
  'Stocks': 'المخزن',
  'RH & Finance': 'الموارد والمالية',
  'Portails': 'البوابات الخارجية',
  'Outils': 'أدوات ونظام'
};

// Pages locked per role (cannot be removed)
const LOCKED: Partial<Record<'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste' | 'controleur' | 'agent_pointage' | 'partenaire' | 'chef_chaine', AppPage[]>> = {
  admin: ['utilisateurs'],
  client: ['portail_client'],
  chef_chaine: ['chef_chaine_portal'],
};

// ─── Helpers ───────────────────────────────────────────────
function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function initials(nom: string) {
  return nom.split(' ').filter(Boolean).map(n => n?.[0] || '').join('').substring(0, 2).toUpperCase() || '??';
}

// ─── Toggle Switch ─────────────────────────────────────────
function Toggle({ checked, onChange, locked }: { checked: boolean; onChange: () => void; locked?: boolean }) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onChange}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function Utilisateurs() {
  const { isAr } = useLang();
  const [tab, setTab] = useState<'users' | 'permissions'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [showFormPass, setShowFormPass] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Permissions state
  const [perms, setPerms] = useState<RolePermMap>(loadPermissions());
  const [permsSaved, setPermsSaved] = useState(false);

  useEffect(() => {
    async function loadAll() {
      const uList = await loadData<User>('users');
      setUsers(uList || []);
    }
    loadAll();
  }, []);

  // ── User helpers ──────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (filterRole === 'all' || u.role === filterRole);
  });

  function openCreate() {
    setEditId(null);
    setForm({ nom: '', email: '', role: 'pointeur', password: generatePassword() });
    setShowFormPass(true);
    setShowModal(true);
  }
  function openEdit(u: User) {
    setEditId(u.id);
    setForm({ ...u });
    setShowFormPass(false);
    setShowModal(true);
  }
  async function save() {
    if (!form.nom || !form.email) return;
    const isNew = !editId;
    const uId = editId || genId();
    const uData = { id: uId, ...form, email: (form.email || '').toLowerCase().trim() } as User;
    const updated = isNew ? [...users, uData] : users.map(u => (u.id === editId ? uData : u));
    setUsers(updated);
    setShowModal(false);
    await saveRecord('users', uData);
  }
  async function doDelete(id: string) {
    const u = users.find(u => u.id === id);
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    setDeleteConfirm(null);
    await deleteRecord('users', id, u?.email);
  }

  // ── Permissions helpers ───────────────────────────────────
  function togglePerm(role: 'admin' | 'pointeur' | 'chef_chaine' | 'client' | 'worker' | 'coupeur' | 'modeliste' | 'controleur' | 'agent_pointage' | 'partenaire', page: AppPage) {
    const locked = LOCKED[role] || [];
    if (locked.includes(page)) return;
    const current = perms[role] || [];
    const updated: RolePermMap = {
      ...perms,
      [role]: current.includes(page)
        ? current.filter(p => p !== page)
        : [...current, page],
    };
    setPerms(updated);
    savePermissions(updated);
    setPermsSaved(true);
    setTimeout(() => setPermsSaved(false), 2000);
  }

  function resetRole(role: 'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste' | 'controleur' | 'agent_pointage' | 'partenaire' | 'chef_chaine') {
    const updated: RolePermMap = { ...perms, [role]: [...(DEFAULT_PERMISSIONS[role] || [])] };
    setPerms(updated);
    savePermissions(updated);
    setPermsSaved(true);
    setTimeout(() => setPermsSaved(false), 2000);
  }

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'إدارة المستخدمين والصلاحيات' : 'Gestion Utilisateurs & Permissions'}</h1>
          <p className="text-slate-500 text-sm font-medium">{isAr ? 'الحسابات، الأدوار، كلمات المرور وصلاحيات الوصول' : 'Comptes, rôles, mots de passe et permissions'}</p>
        </div>
        {tab === 'users' && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> {isAr ? 'مستخدم جديد' : 'Nouvel Utilisateur'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {[
          { key: 'users', label: isAr ? 'المستخدمون' : 'Utilisateurs' },
          { key: 'permissions', label: isAr ? 'الأدوار والصلاحيات' : 'Rôles & Permissions' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${tab === t.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: USERS ══════════════════════════════════════════ */}
      {tab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(['admin', 'pointeur', 'chef_chaine', 'client', 'worker', 'coupeur', 'modeliste', 'controleur', 'agent_pointage', 'partenaire'] as const).map(role => {
              const cfg = ROLE_CFG[role];
              const Icon = cfg.icon;
              const active = filterRole === role;
              return (
                <button key={role} onClick={() => setFilterRole(active ? 'all' : role)}
                  className={`text-right bg-white rounded-3xl border-2 p-5 transition-all hover:shadow-lg ${active ? `${cfg.border} ring-4 ring-indigo-500/10` : 'border-slate-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${cfg.text}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">{users.filter(u => u.role === role).length}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{isAr ? cfg.labelAr : cfg.label}</p>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isAr ? 'right-4' : 'left-4'}`} />
            <input type="text" placeholder={isAr ? 'بحث عن مستخدم بالاسم أو البريد...' : "Rechercher par nom ou email..."} value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full bg-white border-2 border-slate-50 rounded-[20px] py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(u => {
              const cfg = ROLE_CFG[u.role as keyof typeof ROLE_CFG] || ROLE_CFG.worker;
              const Icon = cfg.icon;
              const isRevealed = revealed.has(u.id);
              return (
                <div key={u.id} className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.avatar} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                        {initials(u.nom)}
                      </div>
                      <div className={isAr ? 'text-right' : ''}>
                        <h3 className="font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px]">{u.nom}</h3>
                        <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{u.email}</p>
                      </div>
                    </div>
                    <div className={`flex gap-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <button onClick={() => openEdit(u)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(u.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-2xl ${cfg.bg} border ${cfg.border} mb-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                    <Icon className={`w-4 h-4 ${cfg.text}`} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{isAr ? cfg.labelAr : cfg.label}</p>
                  </div>
                  <div className={`flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 flex-1 min-w-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className={`text-xs tabular-nums truncate ${isRevealed ? 'font-black text-slate-900' : 'text-slate-300 tracking-widest'}`}>
                        {isRevealed ? u.password : '••••••••••'}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <button onClick={() => {
                        const n = new Set(revealed);
                        if (n.has(u.id)) n.delete(u.id); else n.add(u.id);
                        setRevealed(n);
                      }} className="p-1.5 text-slate-400 hover:text-slate-900"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => {
                        navigator.clipboard.writeText(u.password || '');
                        setCopied(u.id);
                        setTimeout(() => setCopied(null), 2000);
                      }} className="p-1.5 text-slate-400 hover:text-indigo-600">
                        {copied === u.id ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ TAB: PERMISSIONS ════════════════════════════════════ */}
      {tab === 'permissions' && (
        <div className="space-y-6">
          <div className={`flex items-center justify-between p-6 bg-indigo-50 rounded-[32px] border-2 border-indigo-100 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg"><Lock className="w-6 h-6 text-indigo-600" /></div>
               <div>
                 <h3 className="font-black text-indigo-900 uppercase tracking-tighter">{isAr ? 'مصفوفة التحكم في الوصول' : 'Matrice de Contrôle d\'Accès'}</h3>
                 <p className="text-xs font-bold text-indigo-600/70">{isAr ? 'قم بتفعيل أو تعطيل الصفحات لكل دور وظيفي' : 'Activez ou désactivez les pages pour chaque rôle'}</p>
               </div>
            </div>
            {permsSaved && <span className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">{isAr ? 'تم الحفظ!' : 'Sauvegardé!'}</span>}
          </div>

          <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className={`p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الصفحة / الوحدة' : 'Module / Page'}</th>
                  {(['admin', 'pointeur', 'chef_chaine', 'client', 'worker', 'coupeur', 'modeliste', 'controleur', 'agent_pointage', 'partenaire'] as const).map(role => (
                    <th key={role} className="p-6 border-b border-slate-100 border-l border-slate-50 min-w-[120px]">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${ROLE_CFG[role].text}`}>
                          {isAr ? ROLE_CFG[role].labelAr.split(' ')[0] : ROLE_CFG[role].label.split(' ')[0]}
                        </span>
                        <button onClick={() => resetRole(role)} className="p-1 hover:bg-slate-100 rounded-lg"><RotateCcw className="w-3 h-3 text-slate-300" /></button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAGE_GROUPS.map(group => (
                  <Fragment key={group}>
                    <tr className="bg-slate-50/30">
                      <td colSpan={11} className={`px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ${isAr ? 'text-right' : 'text-left'}`}>
                        {isAr ? PAGE_GROUPS_AR[group] : group}
                      </td>
                    </tr>
                    {ALL_PAGES.filter(p => p.group === group).map(page => (
                      <tr key={page.key} className="hover:bg-slate-50/50 transition-colors">
                        <td className={`p-6 border-b border-slate-50 ${isAr ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <page.icon className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700">{isAr ? page.labelAr : page.label}</span>
                          </div>
                        </td>
                        {(['admin', 'pointeur', 'chef_chaine', 'client', 'worker', 'coupeur', 'modeliste', 'controleur', 'agent_pointage', 'partenaire'] as const).map(role => {
                          const locked = (LOCKED[role] || []).includes(page.key);
                          const active = (perms[role] || []).includes(page.key);
                          return (
                            <td key={role} className="p-4 border-b border-slate-50 border-l border-slate-50">
                              <div className="flex items-center justify-center gap-2">
                                <Toggle checked={active} onChange={() => togglePerm(role, page.key)} locked={locked} />
                                {locked && <Lock className="w-3 h-3 text-slate-200" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10"><UserX className="w-10 h-10" /></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">{isAr ? 'حذف المستخدم؟' : 'Supprimer l\'utilisateur ?'}</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">{isAr ? 'هذا الإجراء نهائي ولا يمكن التراجع عنه.' : 'Cette action est définitive et le compte sera supprimé.'}</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">{isAr ? 'إلغاء' : 'Annuler'}</button>
              <button onClick={() => doDelete(deleteConfirm)} className="flex-1 h-14 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/20">{isAr ? 'حذف نهائي' : 'Confirmer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{editId ? (isAr ? 'تعديل مستخدم' : 'Modifier Utilisateur') : (isAr ? 'مستخدم جديد' : 'Nouvel Utilisateur')}</h2>
               <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center transition-all hover:rotate-90"><X className="w-6 h-6 text-slate-900" /></button>
            </div>
            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الاسم الكامل *' : 'Nom Complet *'}</label>
                <input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all ${isAr ? 'text-right' : ''}`} />
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'البريد الإلكتروني *' : 'Email *'}</label>
                <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all ${isAr ? 'text-left' : ''}`} />
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{isAr ? 'الدور الوظيفي' : 'Rôle'}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['admin', 'pointeur', 'chef_chaine', 'client', 'worker', 'coupeur', 'modeliste', 'controleur', 'agent_pointage', 'partenaire'] as const).map(r => (
                    <button key={r} onClick={() => setForm({ ...form, role: r })} 
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${form.role === r ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.role === r ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                        {(() => { const Icon = ROLE_CFG[r].icon; return <Icon className="w-5 h-5" />; })()}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${form.role === r ? 'text-indigo-900' : 'text-slate-400'}`}>
                        {isAr ? ROLE_CFG[r].labelAr.split(' ')[0] : ROLE_CFG[r].label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'كلمة المرور' : 'Mot de passe'}</label>
                <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <input type={showFormPass ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} className={`flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all tabular-nums ${isAr ? 'text-right' : ''}`} />
                  <button onClick={() => setForm({ ...form, password: generatePassword() })} className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border-2 border-indigo-100"><RefreshCw className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
            <div className={`p-8 bg-slate-50 flex gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
               <button onClick={() => setShowModal(false)} className="flex-1 h-14 bg-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-slate-100">{isAr ? 'إلغاء' : 'Annuler'}</button>
               <button onClick={save} className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20">{isAr ? 'حفظ الحساب' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
