import { HashRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FichesTechniques from './pages/FichesTechniques';
import OrdresDeCoupe from './pages/OrdresDeCoupe';
import ChaineDeMontage from './pages/ChaineDeMontage';
import StockMateriaux from './pages/StockMateriaux';
import SuiviRH from './pages/SuiviRH';
import Commandes from './pages/Commandes';
import Factures from './pages/Factures';
import Pointage from './pages/Pointage';
import PortailClient from './pages/PortailClient';
import Utilisateurs from './pages/Utilisateurs';
import Performance from './pages/Performance';
import Charges from './pages/Charges';
import BilanFinancier from './pages/BilanFinancier';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { initMockData, User, loadPermissions, AppPage, loadCompanyProfile } from './types';
import { LangProvider, useLang } from './contexts/LangContext';

initMockData();

const AUTH_KEY = 'textrack_auth';

function AdminLayout({
  onOpenClientPortal,
  currentUser,
  onLogout,
}: {
  onOpenClientPortal: () => void;
  currentUser: User;
  onLogout: () => void;
}) {
  const { isAr } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const company = loadCompanyProfile();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className={`flex min-h-screen bg-slate-50 ${isAr ? 'flex-row-reverse' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-40 flex items-center justify-between px-4 shadow-md">
        <div className="text-white font-bold tracking-tight uppercase">
          {company.name.split(' ')[0]} <span className="font-light text-indigo-400">{company.name.split(' ').slice(1).join(' ')}</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-slate-300 p-2 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>

      <Sidebar 
        onOpenClientPortal={onOpenClientPortal} 
        currentUser={currentUser} 
        onLogout={onLogout} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto mt-16 md:mt-0 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

function PointageLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-16 min-h-screen bg-slate-900 flex flex-col items-center py-5 gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(AUTH_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [showClientPortal, setShowClientPortal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('textrack_wiped_v2')) {
      const adminUser = { id: 'u1', nom: 'Admin Général', role: 'admin', email: 'admin@texttrack.ma', password: 'Admin123' };
      localStorage.setItem('textrack_users', JSON.stringify([adminUser]));
      
      const keys = ['fiches', 'commandes', 'ordres', 'tissus', 'fournitures', 'employes', 'pointages', 'factures', 'charges', 'paiements_salaires'];
      keys.forEach(k => localStorage.setItem(`textrack_${k}`, '[]'));
      
      localStorage.setItem('textrack_wiped_v2', 'true');
      window.location.reload();
    }
  }, []);

  function handleLogin(user: User) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setShowClientPortal(false);
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
    setShowClientPortal(false);
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser.role === 'client') {
    return <PortailClient currentUser={currentUser} onLogout={handleLogout} />;
  }

  const allowed = loadPermissions()[currentUser.role as 'admin' | 'pointeur' | 'client'] ?? [];
  const can = (page: AppPage) => allowed.includes(page);

  if (showClientPortal) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowClientPortal(false)}
          className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition shadow-lg"
        >
          ← Retour à l'ERP
        </button>
        <PortailClient currentUser={currentUser} onLogout={() => setShowClientPortal(false)} />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        element={
          <AdminLayout
            onOpenClientPortal={() => setShowClientPortal(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        }
      >
        {can('dashboard')
          ? <Route index element={<Dashboard />} />
          : <Route index element={<Navigate to={can('fiches') ? '/fiches-techniques' : can('ordres') ? '/ordres-de-coupe' : can('chaine') ? '/chaine-montage' : '/pointage'} replace />} />
        }
        {can('fiches') ? <Route path="fiches-techniques" element={<FichesTechniques />} /> : <Route path="fiches-techniques" element={<Navigate to="/" replace />} />}
        {can('ordres') ? <Route path="ordres-de-coupe" element={<OrdresDeCoupe />} /> : <Route path="ordres-de-coupe" element={<Navigate to="/" replace />} />}
        {can('chaine') ? <Route path="chaine-montage" element={<ChaineDeMontage />} /> : <Route path="chaine-montage" element={<Navigate to="/" replace />} />}
        {can('stocks') ? <Route path="stocks" element={<StockMateriaux />} /> : <Route path="stocks" element={<Navigate to="/" replace />} />}
        {can('rh') ? <Route path="rh" element={<SuiviRH />} /> : <Route path="rh" element={<Navigate to="/" replace />} />}
        {can('commandes') ? <Route path="commandes" element={<Commandes />} /> : <Route path="commandes" element={<Navigate to="/" replace />} />}
        {can('performance') ? <Route path="performance" element={<Performance />} /> : <Route path="performance" element={<Navigate to="/" replace />} />}
        {can('factures') ? <Route path="factures" element={<Factures />} /> : <Route path="factures" element={<Navigate to="/" replace />} />}
        {can('charges') ? <Route path="charges" element={<Charges />} /> : <Route path="charges" element={<Navigate to="/" replace />} />}
        {can('bilan') ? <Route path="bilan" element={<BilanFinancier />} /> : <Route path="bilan" element={<Navigate to="/" replace />} />}
        {can('utilisateurs') ? <Route path="utilisateurs" element={<Utilisateurs />} /> : <Route path="utilisateurs" element={<Navigate to="/" replace />} />}
        {can('parametres') ? <Route path="parametres" element={<Settings />} /> : <Route path="parametres" element={<Navigate to="/" replace />} />}
      </Route>
      <Route element={<PointageLayout />}>
        <Route path="pointage" element={<Pointage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <LangProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </LangProvider>
  );
}
