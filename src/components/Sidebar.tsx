import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Scissors, Factory, Package,
  Users, ShoppingCart, Receipt, ClipboardCheck, Globe,
  ChevronDown, ChevronRight, UserCircle, Trophy,
  TrendingDown, LogOut, ShieldCheck, HardHat, BarChart3, Hexagon
} from 'lucide-react';
import { useState } from 'react';
import { User, loadPermissions, AppPage } from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

interface SidebarProps {
  onOpenClientPortal: () => void;
  currentUser: User;
  onLogout: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-indigo-500/20 text-indigo-300',
  pointeur: 'bg-blue-500/20 text-blue-300',
  client: 'bg-emerald-500/20 text-emerald-300',
};

export default function Sidebar({ onOpenClientPortal, currentUser, onLogout }: SidebarProps) {
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
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
      isActive
        ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
    } ${isAr ? 'flex-row-reverse text-right' : ''}`;

  return (
    <aside className={`w-64 min-h-screen bg-slate-900 text-white flex flex-col shadow-2xl flex-shrink-0`}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-slate-700 shadow-lg flex-shrink-0">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <div className={isAr ? 'text-right' : ''}>
            <h1 className="text-lg font-bold tracking-tight text-white">BEYA<span className="font-light">CREATIVE</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t('erp_subtitle', lang)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {can('dashboard') && (
          <NavLink to="/" className={linkClass} end>
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>{t('dashboard', lang)}</span>
          </NavLink>
        )}

        {/* Production Section */}
        {hasProd && (
          <div className="pt-3">
            <button
              onClick={() => setProdOpen(!prodOpen)}
              className={`flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors ${isAr ? 'flex-row-reverse' : ''}`}
            >
              <span className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Factory className="w-3.5 h-3.5" />
                {t('section_production', lang)}
              </span>
              {prodOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {prodOpen && (
              <div className="ml-2 mt-1 space-y-1">
                {can('fiches') && (
                  <NavLink to="/fiches-techniques" className={linkClass}>
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{t('fiches', lang)}</span>
                  </NavLink>
                )}
                {can('ordres') && (
                  <NavLink to="/ordres-de-coupe" className={linkClass}>
                    <Scissors className="w-4 h-4 flex-shrink-0" />
                    <span>{t('ordres', lang)}</span>
                  </NavLink>
                )}
                {can('chaine') && (
                  <NavLink to="/chaine-montage" className={linkClass}>
                    <Factory className="w-4 h-4 flex-shrink-0" />
                    <span>{t('chaine', lang)}</span>
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stock Section */}
        {hasStock && (
          <div>
            <button
              onClick={() => setStockOpen(!stockOpen)}
              className={`flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors ${isAr ? 'flex-row-reverse' : ''}`}
            >
              <span className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Package className="w-3.5 h-3.5" />
                {t('section_stocks', lang)}
              </span>
              {stockOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {stockOpen && (
              <div className="ml-2 mt-1 space-y-1">
                <NavLink to="/stocks" className={linkClass}>
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span>{t('stocks', lang)}</span>
                </NavLink>
              </div>
            )}
          </div>
        )}

        {can('rh') && (
          <NavLink to="/rh" className={linkClass}>
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>{t('rh', lang)}</span>
          </NavLink>
        )}

        {can('commandes') && (
          <NavLink to="/commandes" className={linkClass}>
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            <span>{t('commandes', lang)}</span>
          </NavLink>
        )}

        {/* Finance Section */}
        {hasFinance && (
          <div>
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              className={`flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors ${isAr ? 'flex-row-reverse' : ''}`}
            >
              <span className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <BarChart3 className="w-3.5 h-3.5" />
                {t('section_finance', lang)}
              </span>
              {financeOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {financeOpen && (
              <div className="ml-2 mt-1 space-y-1">
                {can('bilan') && (
                  <NavLink to="/bilan" className={linkClass}>
                    <BarChart3 className="w-4 h-4 flex-shrink-0" />
                    <span>{t('bilan', lang)}</span>
                  </NavLink>
                )}
                {can('factures') && (
                  <NavLink to="/factures" className={linkClass}>
                    <Receipt className="w-4 h-4 flex-shrink-0" />
                    <span>{t('factures', lang)}</span>
                  </NavLink>
                )}
                {can('charges') && (
                  <NavLink to="/charges" className={linkClass}>
                    <TrendingDown className="w-4 h-4 flex-shrink-0" />
                    <span>{t('charges', lang)}</span>
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-700/50 my-3" />

        {can('pointage') && (
          <NavLink to="/pointage" className={linkClass}>
            <ClipboardCheck className="w-4 h-4 flex-shrink-0" />
            <span>{t('pointage', lang)}</span>
          </NavLink>
        )}

        {can('portail_client') && (
          <button
            onClick={onOpenClientPortal}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all w-full ${isAr ? 'flex-row-reverse text-right' : ''}`}
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>{t('portail_client', lang)}</span>
          </button>
        )}

        {can('performance') && (
          <NavLink to="/performance" className={linkClass}>
            <Trophy className="w-4 h-4 flex-shrink-0" />
            <span>{t('performance', lang)}</span>
          </NavLink>
        )}

        {can('utilisateurs') && (
          <NavLink to="/utilisateurs" className={linkClass}>
            <UserCircle className="w-4 h-4 flex-shrink-0" />
            <span>{t('utilisateurs', lang)}</span>
          </NavLink>
        )}
      </nav>

      {/* Language Toggle */}
      <div className="px-4 py-3 border-t border-slate-700/50">
        <button
          onClick={toggle}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition-all border border-slate-700/50 ${isAr ? 'flex-row-reverse' : ''}`}
          title={lang === 'fr' ? 'Switch to Arabic' : 'التبديل إلى الفرنسية'}
        >
          <span className="text-lg leading-none">{lang === 'fr' ? '🇲🇦' : '🇫🇷'}</span>
          <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
            <p className="text-xs font-bold text-white">
              {lang === 'fr' ? 'عربي' : 'Français'}
            </p>
            <p className="text-[10px] text-slate-400">
              {lang === 'fr' ? 'التبديل إلى العربية' : 'Passer en français'}
            </p>
          </div>
          <div className="w-8 h-4 bg-slate-600 rounded-full relative flex-shrink-0">
            <div className={`w-3 h-3 bg-slate-300 rounded-full absolute top-0.5 transition-all ${lang === 'ar' ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </button>
      </div>

      {/* User info + Logout */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className={`flex items-center gap-3 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
            {currentUser.role === 'admin'
              ? <ShieldCheck className="w-4 h-4 text-indigo-300" />
              : <HardHat className="w-4 h-4 text-blue-300" />}
          </div>
          <div className={`min-w-0 flex-1 ${isAr ? 'text-right' : ''}`}>
            <p className="text-sm font-semibold text-white truncate">{currentUser.nom}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${ROLE_COLORS[currentUser.role]}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${isAr ? 'flex-row-reverse' : ''}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>{t('deconnexion', lang)}</span>
        </button>
      </div>
    </aside>
  );
}
