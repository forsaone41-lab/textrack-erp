import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2,
  ShieldCheck, HardHat, ShoppingBag,
  Eye, EyeOff, Copy, RefreshCw, KeyRound, UserX,
  LayoutDashboard, FileText, Scissors, Factory, Package,
  Users, ShoppingCart, Receipt, TrendingDown, ClipboardCheck,
  Globe, Trophy, UserCircle, RotateCcw, Lock,
} from 'lucide-react';
import {
  User, AppPage, RolePermMap,
  loadData, saveRecord, deleteRecord, genId,
  loadPermissions, savePermissions, DEFAULT_PERMISSIONS,
} from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';
// ─── Role Config ───────────────────────────────────────────
const ROLE_CFG = {
  admin: {
    label: 'Admin', icon: ShieldCheck,
    bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
    ring: 'ring-indigo-400', avatar: 'from-indigo-500 to-purple-600', dot: 'bg-indigo-500',
    desc: 'Accès complet — toutes les fonctionnalités',
    access: ['Dashboard', 'Production', 'RH', 'Stocks', 'Commandes', 'Factures', 'Charges', 'Utilisateurs'],
  },
  pointeur: {
    label: 'Chef', icon: HardHat,
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
    ring: 'ring-blue-400', avatar: 'from-blue-500 to-cyan-600', dot: 'bg-blue-500',
    desc: 'Production, RH, Commandes, Stocks',
    access: ['Dashboard', 'Production', 'RH', 'Stocks', 'Commandes', 'Pointage', 'Performance'],
  },
  client: {
    label: 'Client', icon: ShoppingBag,
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    ring: 'ring-emerald-400', avatar: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500',
    desc: 'Portail client uniquement',
    access: ['Portail Client'],
  },
  worker: {
    label: 'Employé', icon: Users,
    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
    ring: 'ring-purple-400', avatar: 'from-purple-500 to-indigo-600', dot: 'bg-purple-500',
    desc: 'Accès restreint aux outils opérationnels',
    access: ['Pointage'],
  },
  coupeur: {
    label: 'Fossâl (Coupeur)', icon: Scissors,
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
    ring: 'ring-orange-400', avatar: 'from-orange-500 to-amber-600', dot: 'bg-orange-500',
    desc: 'Gestion des ordres de coupe uniquement',
    access: ['Ordres de Coupe'],
  },
  modeliste: {
    label: 'Modéliste', icon: FileText,
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
    ring: 'ring-blue-400', avatar: 'from-blue-500 to-indigo-600', dot: 'bg-blue-500',
    desc: 'Gestion des fiches techniques',
    access: ['Fiches Techniques'],
  },
} as const;

// ─── Pages Definition ──────────────────────────────────────
interface PageDef { key: AppPage; label: string; icon: React.ElementType; group: string; }
const ALL_PAGES: PageDef[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Général' },
  { key: 'fiches', label: 'Fiches Techniques', icon: FileText, group: 'Production' },
  { key: 'ordres', label: 'Ordres de Coupe', icon: Scissors, group: 'Production' },
  { key: 'chaine', label: 'Chaîne de Montage', icon: Factory, group: 'Production' },
  { key: 'stocks', label: 'Stock Matériaux', icon: Package, group: 'Stocks' },
  { key: 'rh', label: 'Suivi RH & Façonniers', icon: Users, group: 'RH & Finance' },
  { key: 'commandes', label: 'Commandes', icon: ShoppingCart, group: 'RH & Finance' },
  { key: 'factures', label: 'Factures', icon: Receipt, group: 'RH & Finance' },
  { key: 'charges', label: 'Charges & Dépenses', icon: TrendingDown, group: 'RH & Finance' },
  { key: 'pointage', label: 'Pointage', icon: ClipboardCheck, group: 'Outils' },
  { key: 'portail_client', label: 'Portail Client', icon: Globe, group: 'Outils' },
  { key: 'performance', label: 'Performance Ouvriers', icon: Trophy, group: 'Outils' },
  { key: 'utilisateurs', label: 'Gestion Utilisateurs', icon: UserCircle, group: 'Outils' },
];

const PAGE_GROUPS = ['Général', 'Production', 'Stocks', 'RH & Finance', 'Outils'];

// Pages locked per role (cannot be removed)
const LOCKED: Partial<Record<'admin' | 'pointeur' | 'client', AppPage[]>> = {
  admin: ['utilisateurs'],
  client: ['portail_client'],
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
  const { lang, isAr } = useLang();
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
  const [perms, setPerms] = useState<RolePermMap>(loadPermissions);
  const [permsSaved, setPermsSaved] = useState(false);

  useEffect(() => { loadData<User>('users').then(setUsers); }, []);

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
    const uData = { id: uId, ...form } as User;

    const updated = isNew
      ? [...users, uData]
      : users.map(u => (u.id === editId ? uData : u));

    setUsers(updated);
    setShowModal(false);

    await saveRecord('users', uData);
  }
  function confirmDelete(id: string) {
    const isLastAdmin = users.find(u => u.id === id)?.role === 'admin'
      && users.filter(u => u.role === 'admin').length <= 1;
    if (!isLastAdmin) setDeleteConfirm(id);
  }
  async function doDelete(id: string) {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    setDeleteConfirm(null);
    await deleteRecord('users', id);
  }
  function toggleReveal(id: string) {
    setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function copyPassword(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  // ── Permissions helpers ───────────────────────────────────
  function togglePerm(role: 'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste', page: AppPage) {
    const locked = LOCKED[role] || [];
    if (locked.includes(page)) return;
    const current = perms[role];
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

  function resetRole(role: 'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste') {
    const updated: RolePermMap = { ...perms, [role]: [...DEFAULT_PERMISSIONS[role]] };
    setPerms(updated);
    savePermissions(updated);
    setPermsSaved(true);
    setTimeout(() => setPermsSaved(false), 2000);
  }

  function resetAll() {
    setPerms({ ...DEFAULT_PERMISSIONS });
    savePermissions({ ...DEFAULT_PERMISSIONS });
    setPermsSaved(true);
    setTimeout(() => setPermsSaved(false), 2000);
  }

  const counts = {
    admin: users.filter(u => u.role === 'admin').length,
    pointeur: users.filter(u => u.role === 'pointeur').length,
    client: users.filter(u => u.role === 'client').length,
    worker: users.filter(u => u.role === 'worker').length,
    coupeur: users.filter(u => u.role === 'coupeur').length,
    modeliste: users.filter(u => u.role === 'modeliste').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-sm">Comptes, rôles, mots de passe et permissions</p>
        </div>
        {tab === 'users' && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" /> Nouvel Utilisateur
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: 'users', label: 'Utilisateurs' },
          { key: 'permissions', label: 'Rôles & Permissions' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: USERS ══════════════════════════════════════════ */}
      {tab === 'users' && (
        <>
          {/* Role Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {(['admin', 'pointeur', 'client', 'worker', 'coupeur', 'modeliste'] as const).map(role => {
              const cfg = ROLE_CFG[role];
              const Icon = cfg.icon;
              const active = filterRole === role;
              return (
                <button key={role} onClick={() => setFilterRole(active ? 'all' : role)}
                  className={`text-left bg-white rounded-xl border-2 p-4 transition hover:shadow-md ${active ? `${cfg.border} ring-2 ${cfg.ring} ring-offset-1` : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                    </div>
                    {active && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Filtré</span>}
                  </div>
                  <p className="text-2xl font-black text-slate-800">{counts[role]}</p>
                  <p className={`text-xs font-bold mt-0.5 ${cfg.text}`}>{cfg.label}s</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{cfg.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Rechercher par nom ou email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          {/* User Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(u => {
              const cfg = ROLE_CFG[u.role];
              const Icon = cfg.icon;
              const isRevealed = revealed.has(u.id);
              const password = u.password || '—';
              const isLastAdmin = u.role === 'admin' && counts.admin <= 1;
              return (
                <div key={u.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.avatar} flex items-center justify-center text-white font-black text-base shadow-inner`}>
                          {initials(u.nom)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 leading-tight">{u.nom}</h3>
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => !isLastAdmin && confirmDelete(u.id)}
                          className={`p-1.5 rounded-lg transition ${isLastAdmin ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-600 hover:bg-red-50'}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${cfg.bg} border ${cfg.border} mb-3`}>
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                      <div>
                        <p className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</p>
                        <p className="text-[10px] text-slate-500">{cfg.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className={`text-xs truncate ${isRevealed ? 'font-mono text-slate-700' : 'text-slate-400 tracking-widest'}`}>
                          {isRevealed ? password : '••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {copied === u.id && <span className="text-[10px] text-green-500 font-bold">Copié!</span>}
                        <button onClick={() => toggleReveal(u.id)} className="p-1 text-slate-400 hover:text-slate-700 transition">
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => copyPassword(password, u.id)} className="p-1 text-slate-400 hover:text-indigo-600 transition">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <UserX className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </>
      )}

      {/* ══ TAB: PERMISSIONS ════════════════════════════════════ */}
      {tab === 'permissions' && (
        <div className="space-y-5">
          {/* Info bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Activez ou désactivez les pages pour chaque rôle. Les modifications sont appliquées immédiatement.
            </p>
            <div className="flex items-center gap-3">
              {permsSaved && (
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  ✓ Sauvegardé
                </span>
              )}
              <button onClick={resetAll}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium">
                <RotateCcw className="w-3 h-3" />
                Réinitialiser tout
              </button>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Role header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              <div className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Page</div>
              {(['admin', 'pointeur', 'client', 'worker', 'coupeur', 'modeliste'] as const).map(role => {
                const cfg = ROLE_CFG[role];
                const Icon = cfg.icon;
                const count = perms[role].length;
                return (
                  <div key={role} className={`px-4 py-4 border-l border-slate-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                        </div>
                        <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      <button
                        onClick={() => resetRole(role)}
                        title="Réinitialiser ce rôle"
                        className="p-1 text-slate-300 hover:text-slate-500 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{count} page{count > 1 ? 's' : ''} autorisée{count > 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>

            {/* Page rows grouped */}
            {PAGE_GROUPS.map(group => {
              const pages = ALL_PAGES.filter(p => p.group === group);
              return (
                <div key={group}>
                  {/* Group separator */}
                  <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
                    <div className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-7">
                      {group}
                    </div>
                  </div>
                  {/* Page rows */}
                  {pages.map((page, idx) => {
                    const PageIcon = page.icon;
                    return (
                      <div
                        key={page.key}
                        className={`grid grid-cols-7 border-b border-slate-100 hover:bg-slate-50/30 transition-colors ${idx === pages.length - 1 ? '' : ''}`}
                      >
                        {/* Page name */}
                        <div className="px-5 py-3 flex items-center gap-2.5">
                          <PageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{page.label}</span>
                        </div>
                        {/* Toggle per role */}
                        {(['admin', 'pointeur', 'client', 'worker', 'coupeur', 'modeliste'] as const).map(role => {
                          const locked = (LOCKED[role] || []).includes(page.key);
                          const enabled = perms[role].includes(page.key);
                          return (
                            <div key={role} className="px-4 py-3 border-l border-slate-100 flex items-center gap-2">
                              <Toggle
                                checked={enabled}
                                onChange={() => togglePerm(role, page.key)}
                                locked={locked}
                              />
                              {locked && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Lock className="w-3 h-3" />
                                  <span>Verrouillé</span>
                                </div>
                              )}
                              {!locked && (
                                <span className={`text-[11px] font-medium ${enabled ? 'text-indigo-500' : 'text-slate-300'}`}>
                                  {enabled ? 'Activé' : 'Désactivé'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-indigo-500 rounded-full" />
              <span>Accès accordé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-slate-200 rounded-full" />
              <span>Accès refusé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>Permission fixe (non modifiable)</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (() => {
        const u = users.find(x => x.id === deleteConfirm);
        if (!u) return null;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Supprimer l'utilisateur ?</h3>
              <p className="text-sm text-slate-500 mb-5">
                <span className="font-semibold text-slate-700">{u.nom}</span> sera définitivement supprimé.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium">Annuler</button>
                <button onClick={() => doDelete(u.id)} className="flex-1 px-4 py-2.5 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium">Supprimer</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier' : 'Nouvel'} Utilisateur</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom complet *</label>
                <input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Rachid Alaoui"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Rôle & Permissions</label>
                <div className="space-y-2">
                  {(['admin', 'pointeur', 'client', 'worker', 'coupeur', 'modeliste'] as const).map(r => {
                    const cfg = ROLE_CFG[r];
                    const Icon = cfg.icon;
                    const selected = form.role === r;
                    return (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${selected ? `${cfg.bg} ${cfg.border}` : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                        <div className={`w-8 h-8 rounded-lg ${selected ? cfg.bg : 'bg-slate-100'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${selected ? cfg.text : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${selected ? cfg.text : 'text-slate-600'}`}>{cfg.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{cfg.desc}</p>
                        </div>
                        {selected && (
                          <div className={`w-5 h-5 rounded-full ${cfg.dot} flex items-center justify-center flex-shrink-0 mt-1`}>
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mot de passe</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type={showFormPass ? 'text' : 'password'} value={form.password || ''}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
                    <button type="button" onClick={() => setShowFormPass(!showFormPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showFormPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="button"
                    onClick={() => { setForm({ ...form, password: generatePassword() }); setShowFormPass(true); }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition" title="Générer">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition">Annuler</button>
              <button onClick={save} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold">
                {editId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
