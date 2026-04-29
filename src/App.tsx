import { HashRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Menu, Package, Shirt } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Demandes from './pages/Demandes';
import FichesTechniques from './pages/FichesTechniques';
import OrdresDeCoupe from './pages/OrdresDeCoupe';
import ChaineDeMontage from './pages/ChaineDeMontage';
import ChaineDetaillee from './pages/ChaineDetaillee';
import ProductionScanner from './pages/ProductionScanner';
import StockMateriaux from './pages/StockMateriaux';
import SuiviRH from './pages/SuiviRH';
import Clients from './pages/Clients';
import Commandes from './pages/Commandes';
import Factures from './pages/Factures';
import Pointage from './pages/Pointage';
import PortailClient from './pages/PortailClient';
import Utilisateurs from './pages/Utilisateurs';
import Performance from './pages/Performance';
import Charges from './pages/Charges';
import BilanFinancier from './pages/BilanFinancier';
import Settings from './pages/Settings';
import Profil from './pages/Profil';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import { initMockData, User, loadPermissions, AppPage, loadCompanyProfile, loadData, saveRecord } from './types';
import { LangProvider, useLang } from './contexts/LangContext';

initMockData();

const AUTH_KEY = 'textrack_auth';

function AdminLayout({
  onOpenClientPortal,
  currentUser,
  onLogout,
  allUsers,
}: {
  onOpenClientPortal: () => void;
  currentUser: User;
  onLogout: () => void;
  allUsers: User[];
}) {
  const { isAr, toggle } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const company = loadCompanyProfile();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50/50" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Mobile Header - Premium Glassy "Zaji" Design */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-[140] flex items-center justify-between px-5 shadow-sm">
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">
            {company.name.split(' ')[0]} <span className="text-indigo-600 font-light italic ml-1">{company.name.split(' ').slice(1).join(' ')}</span>
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all bg-slate-100/50 rounded-xl border border-slate-200 active:scale-90"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <Sidebar
        onOpenClientPortal={onOpenClientPortal}
        currentUser={currentUser}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0 w-full relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] pointer-events-none" />
        
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function PointageLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="w-full min-h-screen p-4 md:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  console.log("Current Path:", location.pathname);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(AUTH_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [showClientPortal, setShowClientPortal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Heartbeat for presence
  useEffect(() => {
    if (!currentUser) return;

    const updateActivity = async () => {
      // Skip activity sync for backdoor or default users (not in DB)
      if (currentUser.id === 'master-admin' || currentUser.id.startsWith('default-')) return;
      
      const now = new Date().toISOString();
      await saveRecord('users', { ...currentUser, lastActive: now });
    };

    const fetchUsers = async () => {
      const users = await loadData<User>('users');
      setAllUsers(users);
    };

    updateActivity();
    fetchUsers();

    const interval = setInterval(() => {
      updateActivity();
      fetchUsers();
    }, 30000); // every 30s

    return () => clearInterval(interval);
  }, [currentUser]);


  function handleLogin(user: User) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setShowClientPortal(false);
    window.location.hash = '#/';
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
    setShowClientPortal(false);
    window.location.hash = '#/'; // Force go to login
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route element={<PointageLayout />}>
          <Route path="pointage" element={<Pointage onLogout={handleLogout} />} />
        </Route>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/portal" element={<PortailClient />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (currentUser.role === 'client') {
    return <PortailClient currentUser={currentUser} onLogout={handleLogout} />;
  }

  const permissions = loadPermissions();
  const userRole = (currentUser.role || '').toLowerCase() as keyof typeof permissions;
  const allowed = permissions[userRole] || [];
  const can = (page: AppPage) => userRole === 'admin' || allowed.includes(page);

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
        path="/"
        element={
          <AdminLayout
            onOpenClientPortal={() => setShowClientPortal(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
            allUsers={allUsers}
          />
        }
      >
        <Route index element={can('dashboard') ? <Dashboard allUsers={allUsers} /> : <Navigate to="/profil" replace />} />
        <Route path="dashboard" element={can('dashboard') ? <Dashboard allUsers={allUsers} /> : <Navigate to="/profil" replace />} />
        
        {/* User Profile */}
        <Route path="profil" element={<Profil currentUser={currentUser} />} />
        
        {/* Protected Production Routes */}
        <Route path="demandes" element={can('demandes') ? <Demandes /> : <Navigate to="/" replace />} />
        <Route path="fiches-techniques" element={can('fiches') ? <FichesTechniques /> : <Navigate to="/" replace />} />
        <Route path="ordres-de-coupe" element={can('ordres') ? <OrdresDeCoupe /> : <Navigate to="/" replace />} />
        <Route path="chaine-montage" element={can('chaine') ? <ChaineDeMontage /> : <Navigate to="/" replace />} />
        <Route path="pilotage-chaine" element={can('chaine') ? <ChaineDetaillee /> : <Navigate to="/" replace />} />
        <Route path="scan-production" element={can('chaine') ? <ProductionScanner /> : <Navigate to="/" replace />} />
        
        {/* Protected Finance Routes */}
        <Route path="factures" element={can('factures') ? <Factures /> : <Navigate to="/" replace />} />
        <Route path="charges" element={can('charges') ? <Charges /> : <Navigate to="/" replace />} />
        <Route path="bilan" element={can('bilan') ? <BilanFinancier /> : <Navigate to="/" replace />} />
        
        {/* Protected Admin & Other Routes */}
        <Route path="utilisateurs" element={can('utilisateurs') ? <Utilisateurs /> : <Navigate to="/" replace />} />
        <Route path="rh" element={can('rh') ? <SuiviRH /> : <Navigate to="/" replace />} />
        <Route path="clients" element={can('clients') ? <Clients /> : <Navigate to="/" replace />} />
        <Route path="performance" element={can('performance') ? <Performance /> : <Navigate to="/" replace />} />
        <Route path="parametres" element={can('parametres') ? <Settings /> : <Navigate to="/" replace />} />
        
        {/* Shared / Public ERP Routes */}
        <Route path="stocks" element={can('stocks') ? <StockMateriaux /> : <Navigate to="/" replace />} />
        <Route path="commandes" element={can('commandes') ? <Commandes /> : <Navigate to="/" replace />} />
      </Route>
      <Route element={<PointageLayout />}>
        <Route path="pointage" element={<Pointage onLogout={handleLogout} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 text-center">
          <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl">
            <h1 className="text-2xl font-black text-white mb-4">Oups! Une erreur est survenue</h1>
            <p className="text-slate-400 mb-6 text-sm">Le composant a crashé. Voici l'erreur :</p>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 text-left overflow-auto max-h-40">
              <code className="text-red-400 text-xs whitespace-pre-wrap">{this.state.error?.toString()}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LangProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </LangProvider>
    </ErrorBoundary>
  );
}
