import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Scissors, Factory, Package,
  Users, ShoppingCart, Receipt, ClipboardCheck, Globe,
  ChevronDown, ChevronRight, UserCircle, Trophy,
  TrendingDown, LogOut, ShieldCheck, HardHat, BarChart3, Settings as SettingsIcon
} from 'lucide-react';
import { useState } from 'react';
import { User, loadPermissions, AppPage, loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

interface SidebarProps {
  onOpenClientPortal: () => void;
  currentUser: User;
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (val: boolean) => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-indigo-500/20 text-indigo-300',
  pointeur: 'bg-blue-500/20 text-blue-300',
  client: 'bg-emerald-500/20 text-emerald-300',
};

export default function Sidebar({ onOpenClientPortal, currentUser, onLogout, mobileOpen, setMobileOpen }: SidebarProps) {
  const company = loadCompanyProfile();
  const [prodOpen, setProdOpen] = useState(true);
  const [stockOpen, setStockOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(true);
  const { lang, toggle, isAr } = useLang();

  const allowed = loadPermissions()[currentUser.role] ?? [];
  const can = (page: AppPage) => allowed.includes(page);

  const hasProd    = can('fiches') || can('ordres') || can('chaine');
  const hasStock   = can('stocks');
  const hasFinance = can('bilan') || can('factures') || can('charges');

  const roleLabel = currentUser.role === 'admin'
    ? t('role_admin', lang)
    : currentUser.role === 'client'
    ? t('role_client', lang)
    : t('role_chef', lang);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 group ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 font-bold scale-[1.02]'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile overlay - Premium Blur */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 h-screen w-72 bg-slate-900 text-white flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] flex-shrink-0 z-50
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${mobileOpen ? 'translate-x-0' : (isAr ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}
        ${isAr ? 'right-0 border-l border-white/5' : 'left-0 border-r border-white/5'}
      `}>
        {/* Mobile close button - Styled */}
        <button 
          onClick={() => setMobileOpen?.(false)}
          className={`md:hidden absolute top-4 ${isAr ? 'left-4' : 'right-4'} text-slate-400 hover:text-white z-50 p-2.5 bg-white/5 rounded-xl border border-white/10 active:scale-90 transition-all`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Section - Enhanced */}
        <div className="px-7 py-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex flex-col">
            <div className={`flex flex-col mb-8 ${isAr ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
                  {company.name.split(' ')[0]}
                </span>
                <span className="text-2xl font-light text-indigo-400 uppercase tracking-tight opacity-90">
                  {company.name.split(' ').slice(1).join(' ')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium mt-2">
                {company.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Better Spacing & Scrollbar */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          {can('dashboard') && (
            <NavLink to="/" className={linkClass} end>
              <LayoutDashboard className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="tracking-wide">{t('dashboard', lang)}</span>
            </NavLink>
          )}

          {/* Production Section */}
          {hasProd && (
            <div className="pt-4">
              <button
                onClick={() => setProdOpen(!prodOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] hover:text-slate-300 transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <Factory className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  {t('section_production', lang)}
                </span>
                <div className={`transition-transform duration-300 ${prodOpen ? '' : (isAr ? '-rotate-90' : 'rotate-90')}`}>
                  <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                </div>
              </button>
              <div className={`mt-1.5 space-y-1 transition-all duration-300 overflow-hidden ${prodOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {can('fiches') && (
                  <NavLink to="/fiches-techniques" className={linkClass}>
                    <FileText className="w-5 h-5 opacity-80" />
                    <span className="tracking-wide">{t('fiches', lang)}</span>
                  </NavLink>
                )}
                {can('ordres') && (
                  <NavLink to="/ordres-de-coupe" className={linkClass}>
                    <Scissors className="w-5 h-5 opacity-80" />
                    <span className="tracking-wide">{t('ordres', lang)}</span>
                  </NavLink>
                )}
                {can('chaine') && (
                  <NavLink to="/chaine-montage" className={linkClass}>
                    <Factory className="w-5 h-5 opacity-80" />
                    <span className="tracking-wide">{t('chaine', lang)}</span>
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Stock Section */}
          {hasStock && (
            <div className="pt-2">
              <button
                onClick={() => setStockOpen(!stockOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] hover:text-slate-300 transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  {t('section_stocks', lang)}
                </span>
                <div className={`transition-transform duration-300 ${stockOpen ? '' : (isAr ? '-rotate-90' : 'rotate-90')}`}>
                  <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                </div>
              </button>
              <div className={`mt-1.5 space-y-1 transition-all duration-300 overflow-hidden ${stockOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <NavLink to="/stocks" className={linkClass}>
                  <Package className="w-5 h-5 opacity-80" />
                  <span className="tracking-wide">{t('stocks', lang)}</span>
                </NavLink>
              </div>
            </div>
          )}

          <div className="pt-2 space-y-1">
            {can('rh') && (
              <NavLink to="/rh" className={linkClass}>
                <Users className="w-5 h-5 opacity-80" />
                <span className="tracking-wide">{t('rh', lang)}</span>
              </NavLink>
            )}

            {can('commandes') && (
              <NavLink to="/commandes" className={linkClass}>
                <ShoppingCart className="w-5 h-5 opacity-80" />
                <span className="tracking-wide">{t('commandes', lang)}</span>
              </NavLink>
            )}

            {can('clients') && (
              <NavLink to="/clients" className={linkClass}>
                <UserCircle className="w-5 h-5 opacity-80" />
                <span className="tracking-wide">{t('clients', lang)}</span>
              </NavLink>
            )}
          </div>

          {/* Finance Section */}
          {hasFinance && (
            <div className="pt-2">
              <button
                onClick={() => setFinanceOpen(!financeOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] hover:text-slate-300 transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <BarChart3 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  {t('section_finance', lang)}
                </span>
                <div className={`transition-transform duration-300 ${financeOpen ? '' : (isAr ? '-rotate-90' : 'rotate-90')}`}>
                  <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                </div>
              </button>
              <div className={`mt-1.5 space-y-1 transition-all duration-300 overflow-hidden ${financeOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {can('bilan') && (
                  <NavLink to="/bilan" className={linkClass}>
                    <BarChart3 className="w-5 h-5 opacity-80" />
                    <span className="tracking-wide">{t('bilan', lang)}</span>
                  </NavLink>
                )}
                {can('factures') && (
                  <NavLink to="/factures" className={linkClass}>
                    <Receipt className="w-5 h-5 opacity-80" />
                    <span className="tracking-wide">{t('factures', lang)}</span>
                  </NavLink>
                )}
                {can('charges') && (
                  <NavLink to="/charges" className={linkClass}>
                    <TrendingDown className="w-5 h-5 opacity-80" />
                    <span className="tracking-wide">{t('charges', lang)}</span>
                  </NavLink>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-white/5 my-5 mx-2" />

          <div className="space-y-1">
            {can('pointage') && (
              <NavLink to="/pointage" className={linkClass}>
                <ClipboardCheck className="w-5 h-5 opacity-80" />
                <span className="tracking-wide">{t('pointage', lang)}</span>
              </NavLink>
            )}

            {can('portail_client') && (
              <button
                onClick={onOpenClientPortal}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all w-full group"
              >
                <Globe className="w-5 h-5 opacity-80 group-hover:animate-pulse" />
                <span className="tracking-wide">{t('portail_client', lang)}</span>
              </button>
            )}

            {can('performance') && (
              <NavLink to="/performance" className={linkClass}>
                <Trophy className="w-5 h-5 opacity-80" />
                <span className="tracking-wide">{t('performance', lang)}</span>
              </NavLink>
            )}

            {can('utilisateurs') && (
              <NavLink to="/utilisateurs" className={linkClass}>
                <UserCircle className="w-5 h-5 opacity-80" />
                <span className="tracking-wide">{t('utilisateurs', lang)}</span>
              </NavLink>
            )}

            {can('parametres') && (
              <NavLink to="/parametres" className={linkClass}>
                <SettingsIcon className="w-5 h-5 opacity-80" />
                <span className="tracking-wide">{t('parametres', lang)}</span>
              </NavLink>
            )}
          </div>
        </nav>

        {/* Bottom Section - Language & User */}
        <div className="p-4 space-y-3 bg-gradient-to-t from-black/20 to-transparent">
          {/* Language Toggle - Compact & Pro */}
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5 group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform">
              {lang === 'fr' ? 'ar' : 'fr'}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                {lang === 'fr' ? 'اللغة العربية' : 'Langue Française'}
              </p>
              <p className="text-[9px] text-slate-500 font-medium">
                {lang === 'fr' ? 'Changer de langue' : 'تبديل اللغة'}
              </p>
            </div>
            <div className="w-7 h-3.5 bg-slate-800 rounded-full relative border border-white/10">
              <div className={`w-2 h-2 bg-indigo-400 rounded-full absolute top-0.5 transition-all shadow-[0_0_8px_rgba(129,140,248,0.5)] ${lang === 'ar' ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>

          {/* User info - Premium Card */}
          <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                {currentUser.role === 'admin'
                  ? <ShieldCheck className="w-5 h-5 text-white" />
                  : <HardHat className="w-5 h-5 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate leading-tight">{currentUser.nom}</p>
                <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${ROLE_COLORS[currentUser.role]}`}>
                  {roleLabel}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('deconnexion', lang)}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
