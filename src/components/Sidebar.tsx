import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, ShoppingCart, 
  Package, Scissors, Activity, Receipt, CreditCard, PieChart, TrendingUp, UserCheck, Shirt, Globe, X, Menu, ClipboardCheck, Trophy, ShieldCheck, UserCircle, QrCode, User as UserIcon
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

export default function Sidebar({ onOpenClientPortal, currentUser, onLogout, mobileOpen, setMobileOpen }: SidebarProps) {
  const { lang, isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  
  const permissions = loadPermissions();
  const userRole = (currentUser.role || '').toLowerCase() as keyof typeof permissions;
  const allowedPages = permissions[userRole] || [];
  
  const can = (page: AppPage) => userRole === 'admin' || allowedPages.includes(page);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 px-6 py-4 rounded-[1.2rem] text-sm font-bold transition-all duration-300 relative ${
      isActive 
        ? 'bg-[#4f46e5] text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] scale-[1.02] z-10' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  const closeMobile = () => setMobileOpen?.(false);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[150] lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside className={`
        fixed inset-y-0 ${isAr ? 'right-0' : 'left-0'} z-[200] 
        w-[300px] bg-[#0f172a] border-r border-white/5
        flex flex-col h-screen transition-transform duration-300
        lg:sticky lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')}
      `}>
        {/* Sidebar Header */}
        <div className="p-8 space-y-1">
          <div className="flex items-center justify-between lg:justify-start">
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-baseline">
              BEYA <span className="text-slate-500 font-light ml-2 uppercase text-xl">CREATIVE</span>
            </h1>
            <button onClick={closeMobile} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] opacity-80">
            CONFECTION DE VÊTEMENT
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide py-4">
          {can('dashboard') && (
            <NavLink to="/" className={linkClass} onClick={closeMobile} end>
              <LayoutDashboard className="w-5 h-5" />
              <span>{t('dashboard', lang)}</span>
            </NavLink>
          )}

          <NavLink to="/profil" className={linkClass} onClick={closeMobile}>
            <UserCircle className="w-5 h-5" />
            <span>Mon Profil</span>
          </NavLink>

          <NavLink to="/worker-portal" className={linkClass} onClick={closeMobile}>
            <UserIcon className="w-5 h-5 text-indigo-500" />
            <span className="font-black text-indigo-600">Espace Ouvrier</span>
          </NavLink>
          
          {(can('demandes') || can('fiches') || can('ordres') || can('chaine')) && (
            <SectionTitle title="GESTION DE PRODUCTION" isAr={isAr} />
          )}
          
          {can('demandes') && (
            <NavLink to="/demandes" className={linkClass} onClick={closeMobile}>
              <Users className="w-5 h-5" />
              <span>{t('demandes', lang)}</span>
            </NavLink>
          )}
          {can('commandes') && (
            <NavLink to="/commandes" className={linkClass} onClick={closeMobile}>
              <ShoppingCart className="w-5 h-5" />
              <span>{t('commandes', lang)}</span>
            </NavLink>
          )}
          {can('fiches') && (
            <NavLink to="/fiches-techniques" className={linkClass} onClick={closeMobile}>
              <FileText className="w-5 h-5" />
              <span>{t('fiches', lang)}</span>
            </NavLink>
          )}
          {can('ordres') && (
            <NavLink to="/ordres-de-coupe" className={linkClass} onClick={closeMobile}>
              <Scissors className="w-5 h-5" />
              <span>{t('ordres', lang)}</span>
            </NavLink>
          )}
          {can('chaine') && (
            <>
              <NavLink to="/chaine-montage" className={linkClass} onClick={closeMobile}>
                <Activity className="w-5 h-5" />
                <span>{t('chaine', lang)}</span>
              </NavLink>
              <NavLink to="/pilotage-chaine" className={linkClass} onClick={closeMobile}>
                <TrendingUp className="w-5 h-5" />
                <span>Pilotage Chaîne</span>
              </NavLink>
              <NavLink to="/scan-production" className={linkClass} onClick={closeMobile}>
                <QrCode className="w-5 h-5" />
                <span>Scanner QR</span>
              </NavLink>
            </>
          )}

          {(can('bilan') || can('factures') || can('charges')) && (
            <SectionTitle title="GESTION FINANCIÈRE" isAr={isAr} />
          )}

          {can('bilan') && (
            <NavLink to="/bilan" className={linkClass} onClick={closeMobile}>
              <PieChart className="w-5 h-5" />
              <span>{t('bilan', lang)}</span>
            </NavLink>
          )}
          {can('factures') && (
            <NavLink to="/factures" className={linkClass} onClick={closeMobile}>
              <Receipt className="w-5 h-5" />
              <span>{t('factures', lang)}</span>
            </NavLink>
          )}
          {can('charges') && (
            <NavLink to="/charges" className={linkClass} onClick={closeMobile}>
              <TrendingUp className="w-5 h-5" />
              <span>Charges & Dépenses</span>
            </NavLink>
          )}

          <div className="h-px bg-white/5 my-6 mx-4" />

          {can('pointage') && (
            <NavLink to="/pointage" className={linkClass} onClick={closeMobile}>
              <ClipboardCheck className="w-5 h-5" />
              <span>Pointage Présences</span>
            </NavLink>
          )}
          {can('portal') && (
            <button onClick={() => { onOpenClientPortal(); closeMobile(); }} className={linkClass({ isActive: false })}>
              <Globe className="w-5 h-5" />
              <span>Portail Client</span>
            </button>
          )}
          {can('performance') && (
            <NavLink to="/performance" className={linkClass} onClick={closeMobile}>
              <Trophy className="w-5 h-5" />
              <span>Performance Ouvriers</span>
            </NavLink>
          )}
          {can('clients') && (
            <NavLink to="/clients" className={linkClass} onClick={closeMobile}>
              <Users className="w-5 h-5" />
              <span>Gestion Clients</span>
            </NavLink>
          )}
          {can('utilisateurs') && (
            <NavLink to="/utilisateurs" className={linkClass} onClick={closeMobile}>
              <UserCheck className="w-5 h-5" />
              <span>Gestion Utilisateurs</span>
            </NavLink>
          )}
          {can('rh') && (
            <NavLink to="/rh" className={linkClass} onClick={closeMobile}>
              <Users className="w-5 h-5" />
              <span>Employés & RH</span>
            </NavLink>
          )}
          {can('parametres') && (
            <NavLink to="/parametres" className={linkClass} onClick={closeMobile}>
              <Settings className="w-5 h-5" />
              <span>{t('parametres', lang)}</span>
            </NavLink>
          )}
        </nav>

        {/* Footer Cards */}
        <div className="p-4 space-y-4 border-t border-white/5 bg-black/20">
          {/* Language Switcher Card */}
          <div className="bg-white/5 rounded-[1.5rem] p-4 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                {isAr ? 'ar' : 'fr'}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white">{isAr ? 'اللغة العربية' : 'Langue Française'}</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Changer de langue</span>
              </div>
            </div>
            <button 
              onClick={toggle}
              className={`w-10 h-5 rounded-full transition-all relative ${isAr ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isAr ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="bg-white/5 rounded-[1.5rem] p-5 border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4f46e5] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white">Admin Général</span>
                <span className="text-[9px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 w-fit">
                  ADMIN
                </span>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full text-slate-400 hover:text-white transition-all text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ title, isAr }: { title: string; isAr: boolean }) {
  return (
    <div className={`pt-8 pb-3 px-6 ${isAr ? 'text-right' : 'text-left'}`}>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
    </div>
  );
}
