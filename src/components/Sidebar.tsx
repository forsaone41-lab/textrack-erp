import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, ShoppingCart, 
  Package, Scissors, Activity, Receipt, CreditCard, PieChart, TrendingUp, UserCheck, Shirt, Globe, X, Menu, ClipboardCheck, Trophy, ShieldCheck, UserCircle, QrCode, User as UserIcon,
  Sparkles,
  ChevronRight,
  RotateCw
} from 'lucide-react';
import { User, loadCompanyProfile, loadPermissions, AppPage } from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

interface SidebarProps {
  onOpenClientPortal: () => void;
  currentUser: User;
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (val: boolean) => void;
}

const LogoWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter italic">
          {alt.split(' ')[0]}<span className="text-slate-500 font-medium not-italic ml-0.5">.</span>
        </h1>
      </div>
    );
  }
  return <img src={src} className="h-10 object-contain" alt={alt} onError={() => setError(true)} />;
};

export default function Sidebar({ onOpenClientPortal, currentUser, onLogout, mobileOpen, setMobileOpen }: SidebarProps) {
  const { lang, isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  
  const permissions = loadPermissions();
  const userRole = (currentUser.role || '').toLowerCase() as keyof typeof permissions;
  const allowedPages = permissions[userRole] || [];
  
  const can = (page: AppPage) => allowedPages.includes(page);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-500 relative overflow-hidden ${
      isActive 
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  const closeMobile = () => setMobileOpen?.(false);

  return (
    <>
      {/* Mobile Overlay with Blur */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[150] lg:hidden animate-in fade-in duration-300"
          onClick={closeMobile}
        />
      )}

      <aside className={`
        fixed inset-y-0 ${isAr ? 'right-0' : 'left-0'} z-[200] 
        w-[280px] bg-[#0b0f1a] border-r border-white/5
        flex flex-col h-screen transition-all duration-500 ease-in-out
        lg:sticky lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')}
      `}>
        {/* Sidebar Header - Premium Look */}
        <div className="px-8 pt-10 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoWithFallback src={company.logoAdmin || company.logoUrl} alt={company.name} />
            </div>
            <button onClick={closeMobile} className="lg:hidden w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
               Elite Factory OS
             </p>
          </div>
        </div>

        {/* Navigation Links - Refined Groups */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide py-4">
          <div className="space-y-1">
            {can('dashboard') && (
              <NavLink to="/" className={linkClass} onClick={closeMobile} end>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                  <span>{t('dashboard', lang)}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
              </NavLink>
            )}

            <NavLink to="/profil" className={linkClass} onClick={closeMobile}>
              <div className="flex items-center gap-3">
                <UserCircle className="w-[18px] h-[18px]" />
                <span>{isAr ? 'حسابي' : 'Mon Profil'}</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>

            <NavLink to="/worker-portal" className="group flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-500 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 mb-4" onClick={closeMobile}>
              <div className="flex items-center gap-3">
                <UserIcon className="w-[18px] h-[18px]" />
                <span className="font-extrabold">{isAr ? 'فضاء العامل' : 'Espace Ouvrier'}</span>
              </div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            </NavLink>
          </div>
          
          {(can('demandes') || can('fiches') || can('ordres') || can('chaine')) && (
            <SectionTitle title={isAr ? 'الإنتاج' : 'Production'} isAr={isAr} />
          )}
          
          <div className="space-y-1">
            {can('demandes') && (
              <NavLink to="/demandes" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <Users className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'الزبناء المحتملون' : 'Prospects'}</span>
                </div>
              </NavLink>
            )}
            {can('demandes') && (
              <NavLink to="/echantillons" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <Scissors className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'العينات' : 'Échantillons'}</span>
                </div>
              </NavLink>
            )}
            {can('clients') && (
              <NavLink to="/clients" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'قاعدة الزبناء' : 'Clients'}</span>
                </div>
              </NavLink>
            )}
            {can('commandes') && (
              <NavLink to="/commandes" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'الطلبيات' : 'Commandes'}</span>
                </div>
              </NavLink>
            )}
            {can('stocks') && (
              <NavLink to="/stocks" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <Package className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'مخزون السلع' : 'Stock Matières'}</span>
                </div>
              </NavLink>
            )}
            {can('fiches') && (
              <NavLink to="/fiches-techniques" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <FileText className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'البطاقات التقنية' : 'Fiches Tech.'}</span>
                </div>
              </NavLink>
            )}
            {can('ordres') && (
              <NavLink to="/ordres-de-coupe" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <Scissors className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'أوامر القص' : 'Ordres de Coupe'}</span>
                </div>
              </NavLink>
            )}
            {can('chaine') && (
              <>
                <NavLink to="/chaine-montage" className={linkClass} onClick={closeMobile}>
                  <div className="flex items-center gap-3">
                    <Activity className="w-[18px] h-[18px]" />
                    <span>{isAr ? 'تتبع التركيب' : 'Suivi Montage'}</span>
                  </div>
                </NavLink>
                <NavLink to="/pilotage-chaine" className={linkClass} onClick={closeMobile}>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-[18px] h-[18px]" />
                    <span>{isAr ? 'لوحة القيادة' : 'Pilotage'}</span>
                  </div>
                </NavLink>
              </>
            )}
          </div>

          {(can('bilan') || can('factures') || can('charges')) && (
            <SectionTitle title={isAr ? 'المالية' : 'Finance'} isAr={isAr} />
          )}

          <div className="space-y-1">
            {can('bilan') && (
              <NavLink to="/bilan" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <PieChart className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'جدول البيانات' : 'Tableau de Bord'}</span>
                </div>
              </NavLink>
            )}
            {can('factures') && (
              <NavLink to="/factures" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <Receipt className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'الفواتير' : 'Factures'}</span>
                </div>
              </NavLink>
            )}
            {can('charges') && (
              <NavLink to="/charges" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'المصاريف' : 'Charges'}</span>
                </div>
              </NavLink>
            )}
          </div>

          <SectionTitle title={isAr ? 'النظام' : 'Système'} isAr={isAr} />

          <div className="space-y-1">
            {can('rh') && (
              <>
                <NavLink to="/rh" className={linkClass} onClick={closeMobile}>
                  <div className="flex items-center gap-3">
                    <Users className="w-[18px] h-[18px]" />
                    <span>{isAr ? 'الموارد البشرية' : 'RH & Employés'}</span>
                  </div>
                </NavLink>
                {can('performance') && (
                  <NavLink to="/performance" className={linkClass} onClick={closeMobile}>
                    <div className="flex items-center gap-3">
                      <Trophy className="w-[18px] h-[18px]" />
                      <span>{isAr ? 'أداء العمال' : 'Performance'}</span>
                    </div>
                  </NavLink>
                )}
              </>
            )}
            {can('pointage') && (
              <NavLink to="/pointage" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'تسجيل الحضور' : 'Pointage'}</span>
                </div>
              </NavLink>
            )}
            {can('fast_scanner') && (
              <NavLink to="/fast-scanner" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <QrCode className="w-[18px] h-[18px] text-indigo-400" />
                  <span className="font-black">{isAr ? 'الماسح الضوئي (PRO)' : 'Scanner (PRO)'}</span>
                </div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#4f46e5]" />
              </NavLink>
            )}
            {can('utilisateurs') && (
              <NavLink to="/utilisateurs" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'إدارة المستخدمين' : 'Gestion Utilisateurs'}</span>
                </div>
              </NavLink>
            )}
            {can('parametres') && (
              <NavLink to="/parametres" className={linkClass} onClick={closeMobile}>
                <div className="flex items-center gap-3">
                  <Settings className="w-[18px] h-[18px]" />
                  <span>{isAr ? 'الإعدادات' : 'Paramètres'}</span>
                </div>
              </NavLink>
            )}
          </div>
        </nav>

        {/* Modern Footer Section */}
        <div className="p-4 space-y-3 bg-[#080b14] border-t border-white/5">
          {/* Theme/Lang Minimal Toggle */}
          <button 
            onClick={toggle}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform">
                {isAr ? 'ع' : 'FR'}
              </div>
              <span className="text-xs font-bold text-slate-300">{isAr ? 'اللغة العربية' : 'Langue Française'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-all ${isAr ? 'bg-indigo-600' : 'bg-slate-700'}`}>
               <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isAr ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>

          {/* Premium Profile Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-4 border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{currentUser.nom || 'Admin'}</span>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                  {currentUser.role}
                </span>
              </div>
            </div>
            
            {currentUser.role === 'admin' && (
              <button 
                onClick={() => {
                  localStorage.removeItem('textrack_auth');
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 mb-2"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحديث إجباري' : 'Forcer la mise à jour'}</span>
              </button>
            )}

            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-bold border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الخروج' : 'Quitter la session'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ title, isAr }: { title: string; isAr: boolean }) {
  return (
    <div className={`mt-6 mb-2 px-6 flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
      <div className="w-1 h-1 rounded-full bg-indigo-500" />
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{title}</p>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}
