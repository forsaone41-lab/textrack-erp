import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, ShoppingCart, 
  Package, Scissors, Activity, Receipt, PieChart, TrendingUp, UserCheck, Globe, X, ClipboardCheck, Trophy, ShieldCheck, QrCode, User as UserIcon, CheckCircle,
  Sparkles,
  RefreshCw,
  CalendarDays,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall
} from 'lucide-react';

import { User, CompanyProfile, loadPermissions, AppPage, syncCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

interface SidebarProps {
  onOpenClientPortal: () => void;
  currentUser: User;
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (val: boolean) => void;
  company: CompanyProfile;
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

const LogoIconOnly = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
    );
  }
  return <img src={src} className="w-10 h-10 object-contain rounded-xl" alt={alt} onError={() => setError(true)} />;
};

export default function Sidebar({ currentUser, onLogout, mobileOpen, setMobileOpen, company }: SidebarProps) {
  const { lang, isAr, toggle } = useLang();
  const [collapsed, setCollapsed] = React.useState(false);
  
  const permissions = loadPermissions();
  let userRoleRaw = (currentUser.role || '').toLowerCase();
  if (userRoleRaw === 'agent' || userRoleRaw.includes('pointage')) userRoleRaw = 'agent_pointage';
  const userRole = userRoleRaw as keyof typeof permissions;
  const allowedPages = permissions[userRole] || [];
  
  const can = (page: AppPage) => allowedPages.includes(page);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center ${collapsed ? 'justify-center px-0 py-2' : 'justify-between px-3 py-3'} rounded-2xl text-[13px] font-bold transition-all duration-300 relative overflow-visible ${
      isActive 
        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  const closeMobile = () => setMobileOpen?.(false);

  const NavItem = ({ to, icon: Icon, label, end = false, pro = false }: { to: string; icon: any; label: string; end?: boolean; pro?: boolean }) => (
    <NavLink to={to} className={linkClass} onClick={closeMobile} end={end} title={collapsed ? label : undefined}>
      {({ isActive }) => (
        <>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3.5'} relative`}>
            {/* Icon Box */}
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              transition-all duration-300
              ${isActive
                ? 'bg-indigo-500 shadow-lg shadow-indigo-500/40'
                : 'bg-white/5 group-hover:bg-indigo-500/20 group-hover:scale-110'
              }
            `}>
              <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-300'}`} />
            </div>

            {/* Tooltip when collapsed */}
            {collapsed && (
              <div className={`
                absolute ${isAr ? 'right-full mr-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2
                pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[300]
                bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl
                whitespace-nowrap shadow-xl border border-white/10
              `}>
                {label}
                {pro && <span className="ml-1 text-amber-400">✦</span>}
              </div>
            )}

            {!collapsed && (
              <>
                <span className={isActive ? 'text-indigo-300 font-bold' : 'group-hover:text-white'}>{label}</span>
                {pro && !isActive && <Sparkles className="w-3 h-3 text-amber-500/50" />}
              </>
            )}
          </div>
          {isActive && (
            <div className={`absolute ${isAr ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-${isAr ? 'l' : 'r'}-full shadow-[0_0_10px_#4f46e5]`} />
          )}
        </>
      )}
    </NavLink>
  );

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[280px]';

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
        ${sidebarWidth} bg-[#0b0f1a] border-r border-white/5
        flex flex-col h-screen transition-all duration-300 ease-in-out
        lg:sticky lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')}
      `}>
        {/* Sidebar Header */}
        <div className={`${collapsed ? 'px-3 pt-6 pb-4' : 'px-8 pt-10 pb-6'} space-y-2 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {collapsed
                ? <LogoIconOnly src={company.logoAdmin || company.logoUrl} alt={company.name} />
                : <LogoWithFallback src={company.logoAdmin || company.logoUrl} alt={company.name} />
              }
            </div>
            <button onClick={closeMobile} className="lg:hidden w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {!collapsed && (
            <div className="flex items-center gap-2 mt-2">
               <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
                  Elite Factory OS
               </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <div className={`${collapsed ? 'px-3' : 'px-4'} mb-2`}>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-300 transition-all duration-300 border border-transparent hover:border-indigo-500/20 group"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
              : (
                <>
                  <PanelLeftClose className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? 'طي' : 'Réduire'}</span>
                </>
              )
            }
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-4'} space-y-6 overflow-y-auto scrollbar-hide py-4 transition-all duration-300`}>
          
          {/* Group 1: Access */}
          <div className="space-y-1">
            {can('dashboard') && <NavItem to="/" icon={LayoutDashboard} label={t('dashboard', lang)} end />}
            {can('worker_portal') && <NavItem to="/worker-portal" icon={UserIcon} label={isAr ? 'فضاء العامل' : 'Espace Ouvrier'} />}
            {can('chef_chaine_portal') && <NavItem to="/chef-portal" icon={ShieldCheck} label={isAr ? 'بوابة رئيس السلسلة' : 'Portail Chef Chaîne'} />}
            {can('partenaire_portal') && <NavItem to="/partenaire-portal" icon={Globe} label={isAr ? 'بوابة الشركاء' : 'Portail Partenaire'} />}
          </div>

          {/* Group 2: Commercial */}
          {(can('demandes') || can('crm') || can('clients')) && (
            <div className="space-y-1">
              {!collapsed && <SectionTitle title={isAr ? 'التجاري' : 'Commercial'} isAr={isAr} />}
            {can('demandes') && <NavItem to="/demandes" icon={Users} label={isAr ? 'الزبناء المحتملون' : 'Prospects'} />}
            {can('crm') && <NavItem to="/pipeline" icon={PhoneCall} label={isAr ? 'تتبع الزبناء (CRM)' : 'Suivi Prospects'} />}
            {can('demandes') && <NavItem to="/echantillons" icon={Scissors} label={isAr ? 'العينات' : 'Échantillons'} />}
            {can('clients') && <NavItem to="/clients" icon={UserCheck} label={isAr ? 'قاعدة الزبناء' : 'Clients'} />}
            </div>
          )}

          {/* Group 3: Production */}
          {(can('commandes') || can('stocks') || can('fiches') || can('ai_space') || can('ordres') || can('chaine')) && (
            <div className="space-y-1">
              {!collapsed && <SectionTitle title={isAr ? 'الإنتاج' : 'Production'} isAr={isAr} />}
            {can('commandes') && (
              <>
                <NavItem to="/commandes" icon={ShoppingCart} label={isAr ? 'الطلبيات' : 'Commandes'} />
                {can('agenda') && <NavItem to="/agenda" icon={CalendarDays} label={isAr ? 'الأجندة' : 'Agenda'} />}
                <NavItem to="/commandes/manage" icon={Sparkles} label={isAr ? 'إعداد طلبية (PRO)' : 'Master Setup (PRO)'} pro />
              </>
            )}
            {can('stocks') && (
              <>
                <NavItem to="/achats" icon={ShoppingCart} label={isAr ? 'المشتريات' : 'Achats'} />
                <NavItem to="/stocks" icon={Package} label={isAr ? 'المخزون' : 'Stocks'} />
                <NavItem to="/fournisseurs" icon={UserCheck} label={isAr ? 'الموردين' : 'Fournisseurs'} />
              </>
            )}
            {can('fiches') && (
              <NavItem to="/fiches-techniques" icon={FileText} label={isAr ? 'البطاقات التقنية' : 'Fiches Tech.'} />
            )}
            {can('ai_space') && (
              <NavItem to="/ai-space" icon={Sparkles} label={isAr ? 'المساعد الذكي' : 'Assistant IA'} pro />
            )}
            {can('ordres') && <NavItem to="/ordres-de-coupe" icon={Scissors} label={isAr ? 'أوامر القص' : 'Ordres de Coupe'} />}
            {can('chaine') && (
              <>
                <NavItem to="/chaine-montage" icon={Activity} label={isAr ? 'تتبع التركيب' : 'Suivi Montage'} />
                <NavItem to="/pilotage-chaine" icon={TrendingUp} label={isAr ? 'لوحة القيادة' : 'Pilotage'} />
              </>
            )}
            </div>
          )}

          {/* Group 4: Finance */}
          {(can('bilan') || can('factures') || can('charges')) && (
            <div className="space-y-1">
              {!collapsed && <SectionTitle title={isAr ? 'المالية' : 'Finance'} isAr={isAr} />}
            {can('bilan') && <NavItem to="/bilan" icon={PieChart} label={isAr ? 'جدول البيانات' : 'Tableau de Bord'} />}
            {can('factures') && <NavItem to="/devis" icon={FileText} label={isAr ? 'عروض الأسعار' : 'Devis'} />}
            {can('factures') && <NavItem to="/factures" icon={Receipt} label={isAr ? 'الفواتير' : 'Factures'} />}
            {can('factures') && <NavItem to="/recus" icon={CheckCircle} label={isAr ? 'إيصالات الدفع' : 'Reçus'} />}
            {can('factures') && <NavItem to="/prix-marche" icon={TrendingUp} label={isAr ? 'أسعار السوق' : 'Prix Marché'} />}
            {can('charges') && <NavItem to="/charges" icon={TrendingUp} label={isAr ? 'المصاريف' : 'Charges'} />}
            </div>
          )}

          {/* Group 5: System Admin */}
          {(can('rh') || can('pointage') || can('fast_scanner') || can('performance') || can('utilisateurs') || can('parametres')) && (
            <div className="space-y-1">
              {!collapsed && <SectionTitle title={isAr ? 'النظام' : 'Système'} isAr={isAr} />}
            {can('rh') && <NavItem to="/rh" icon={Users} label={isAr ? 'الموارد البشرية' : 'RH'} />}
            {can('rh') && <NavItem to="/liste-attente" icon={Clock} label={isAr ? 'لائحة الانتظار' : "Liste d'Attente"} />}
            {can('pointage') && <NavItem to="/pointage" icon={ClipboardCheck} label={isAr ? 'تسجيل الحضور' : 'Pointage'} />}
            {can('fast_scanner') && <NavItem to="/fast-scanner" icon={QrCode} label={isAr ? 'الماسح الضوئي' : 'Scanner PRO'} />}
            {can('performance') && <NavItem to="/performance" icon={Trophy} label={isAr ? 'الأداء والإنتاجية' : 'Performance'} />}
            {can('utilisateurs') && <NavItem to="/utilisateurs" icon={ShieldCheck} label={isAr ? 'المستخدمين' : 'Utilisateurs'} />}
            {can('parametres') && <NavItem to="/parametres" icon={Settings} label={isAr ? 'الإعدادات' : 'Paramètres'} />}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className={`${collapsed ? 'p-2' : 'p-4'} space-y-3 bg-[#080b14] border-t border-white/5 transition-all duration-300`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              {/* Lang toggle icon */}
              <button
                onClick={toggle}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-[10px] font-black text-white"
                title={isAr ? 'Français' : 'عربية'}
              >
                {isAr ? 'FR' : 'ع'}
              </button>
              {/* Sync icon */}
              <button
                onClick={async () => {
                  localStorage.removeItem('textrack_permissions');
                  await syncCompanyProfile();
                  window.location.reload();
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20 group"
                title={isAr ? 'تحديث' : 'Sync'}
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              </button>
              {/* Logout icon */}
              <button
                onClick={onLogout}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                title={isAr ? 'خروج' : 'Quitter'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <button 
                  onClick={toggle}
                  className="flex-1 flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform">
                    {isAr ? 'ع' : 'FR'}
                  </div>
                  <span className="text-xs font-bold text-slate-300">{isAr ? 'العربية' : 'Français'}</span>
                </button>
                <button 
                  onClick={async () => {
                    localStorage.removeItem('textrack_permissions');
                    await syncCompanyProfile();
                    window.location.reload();
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20 group"
                  title={isAr ? 'تحديث النظام' : 'Mise à jour'}
                >
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                </button>
              </div>

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
                
                <button 
                  onClick={onLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-bold border border-rose-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل الخروج' : 'Quitter la session'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ title, isAr }: { title: string; isAr: boolean }) {
  return (
    <div className={`mt-4 mb-2 px-2 flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
      <div className="w-1 h-1 rounded-full bg-indigo-500" />
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{title}</p>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}
