import { HashRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import * as React from 'react';
import { useState, useEffect, Component, ReactNode, lazy, Suspense } from 'react';
import { Menu, Package } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Calculator from './components/Tools/Calculator';
import NotificationCenter from './components/Tools/NotificationCenter';
import { CompanyProfile, loadCompanyProfile } from './types';

// ✅ Lazy load all pages - each page loads only when visited
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Demandes         = lazy(() => import('./pages/Demandes'));
const Pipeline         = lazy(() => import('./pages/Pipeline'));
const FichesTechniques = lazy(() => import('./pages/FichesTechniques'));
const OrdresDeCoupe    = lazy(() => import('./pages/OrdresDeCoupe'));
const ChaineDeMontage  = lazy(() => import('./pages/ChaineDeMontage'));
const ChaineDetaillee  = lazy(() => import('./pages/ChaineDetaillee'));
const ProductionScanner= lazy(() => import('./pages/ProductionScanner'));
const WorkerPortal     = lazy(() => import('./pages/WorkerPortal'));
const StockMateriaux   = lazy(() => import('./pages/StockMateriaux'));
const SuiviRH          = lazy(() => import('./pages/SuiviRH'));
const Echantillons     = lazy(() => import('./pages/Echantillons'));
const Clients          = lazy(() => import('./pages/Clients'));
const Commandes        = lazy(() => import('./pages/Commandes'));
const ManageOrder      = lazy(() => import('./pages/ManageOrder'));
const Factures         = lazy(() => import('./pages/Factures'));
const Devis            = lazy(() => import('./pages/Devis'));
const Recus            = lazy(() => import('./pages/Recus'));
const PrixMarche       = lazy(() => import('./pages/PrixMarche'));
const Pointage         = lazy(() => import('./pages/Pointage'));
const PortailClient    = lazy(() => import('./pages/PortailClient'));
const ClientInfo       = lazy(() => import('./pages/ClientInfo'));
const Utilisateurs     = lazy(() => import('./pages/Utilisateurs'));
const Performance      = lazy(() => import('./pages/Performance'));
const Charges          = lazy(() => import('./pages/Charges'));
const BilanFinancier   = lazy(() => import('./pages/BilanFinancier'));
const Settings         = lazy(() => import('./pages/Settings'));
const Login            = lazy(() => import('./pages/Login'));
const LandingPage      = lazy(() => import('./pages/LandingPage'));
const KioskScanner     = lazy(() => import('./pages/KioskScanner'));
const FastScanner      = lazy(() => import('./pages/FastScanner'));
const PlanningView     = lazy(() => import('./pages/PlanningView'));
const PartenairePortal = lazy(() => import('./pages/PartenairePortal'));
const Agenda           = lazy(() => import('./pages/Agenda'));
const Recrutement     = lazy(() => import('./pages/Recrutement'));
const ListeAttente    = lazy(() => import('./pages/ListeAttente'));
const Notifications   = lazy(() => import('./pages/Notifications'));
const AISpace         = lazy(() => import('./pages/AISpace'));

import { PageLoader } from './components/PageLoader';

import { initMockData, User, loadPermissions, AppPage, loadCompanyProfile, syncCompanyProfile, loadData, saveRecord } from './types';
import { LangProvider, useLang } from './contexts/LangContext';

initMockData();


const AUTH_KEY = 'textrack_auth';

const MobileLogoWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return (
      <>
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Package className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">
          {alt.split(' ')[0]} <span className="text-indigo-600 font-light italic ml-1">{alt.split(' ').slice(1).join(' ')}</span>
        </span>
      </>
    );
  }
  return <img src={src} className="h-8 object-contain" alt={alt} onError={() => setError(true)} />;
};

function AdminLayout({
  onOpenClientPortal,
  currentUser,
  onLogout,
  company,
}: {
  onOpenClientPortal: () => void;
  currentUser: User;
  onLogout: () => void;
  company: CompanyProfile;
}) {
  const { isAr } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50/50" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Mobile Header - Premium Glassy "Zaji" Design */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-[140] flex items-center justify-between px-5 shadow-sm">
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <MobileLogoWithFallback src={company.logoMobileHeader || company.logoUrl} alt={company.name} />
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && location.pathname === '/' && (
            <div className="scale-75 origin-right">
              <NotificationCenter />
            </div>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all bg-slate-100/50 rounded-xl border border-slate-200 active:scale-90"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Mobile Calculator - Bottom Right - Admin Only */}
      {currentUser.role === 'admin' && location.pathname !== '/partenaire-portal' && (
        <div className={`md:hidden fixed bottom-6 ${isAr ? 'left-6' : 'right-6'} z-[140] scale-90`}>
          <Calculator />
        </div>
      )}

      <Sidebar
        onOpenClientPortal={onOpenClientPortal}
        currentUser={currentUser}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        company={company}
      />
      
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0 w-full relative">
        {/* Global Tools Bar - Notification only on Dashboard Page for Admin */}
        {currentUser.role === 'admin' && (
          <div className={`fixed top-8 ${isAr ? 'right-12' : 'right-12'} z-[130] hidden md:flex items-center gap-4`}>
            {location.pathname === '/' && <NotificationCenter />}
          </div>
        )}

        {/* Floating Calculator - Admin Only */}
        {currentUser.role === 'admin' && location.pathname !== '/partenaire-portal' && (
          <div className={`fixed bottom-8 ${isAr ? 'right-8' : 'right-8'} z-[130] hidden md:block`}>
            <Calculator />
          </div>
        )}

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] pointer-events-none" />
        
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto relative z-10">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function PointageLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="w-full min-h-screen p-4 md:p-6 lg:p-8 overflow-y-auto">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

function ClientInfoRoute() {
  const company = loadCompanyProfile();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ClientInfo company={company} standalone={true} />
    </Suspense>
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());

  // Heartbeat for presence & Sync settings
  useEffect(() => {
    const syncSettings = async () => {
      const remote = await syncCompanyProfile();
      setCompany(remote);

      // Dynamic Branding Update
      const finalIcon = remote.logoAppIcon || "/logo.png";
      
      // Update Favicon
      const icon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (icon) icon.href = finalIcon;
      
      const appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (appleIcon) appleIcon.href = finalIcon;

      // Update Manifest (PWA Icon)
      const existingManifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (existingManifest) {
        const manifestContent = {
          name: remote.name || "Beya Creative",
          short_name: remote.name || "Beya Creative",
          description: "Système de gestion textile",
          start_url: "/",
          display: "standalone",
          background_color: "#0f172a",
          theme_color: "#4f46e5",
          icons: [
            { src: finalIcon, sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: finalIcon, sizes: "512x512", type: "image/png", purpose: "any maskable" }
          ]
        };
        const stringManifest = JSON.stringify(manifestContent);
        const blob = new Blob([stringManifest], {type: 'application/json'});
        const manifestURL = URL.createObjectURL(blob);
        existingManifest.href = manifestURL;
      }

      // Update Document Title
      if (remote.name) {
        if (window.location.hash === '#/' || window.location.hash === '') {
          document.title = "BEYA CREATIVE - Excellence en Confection Textile au Maroc";
        } else {
          document.title = remote.name;
        }
      }
    };

    const updateActivity = async () => {
      if (!currentUser) return;
      // Skip activity sync for backdoor or default users (not in DB)
      if (currentUser.id === 'master-admin' || currentUser.id.startsWith('default-')) return;
      
      const now = new Date().toISOString();
      try {
        await saveRecord('users', { ...currentUser, lastActive: now }, true);
      } catch (e) {
        // Silent fail for background tasks to avoid disturbing the user
        console.warn("Background lastActive update failed:", e);
      }
    };

    const fetchUsers = async () => {
      const users = await loadData<User>('users');
      if (users) {
        setAllUsers(users);
        
        // ✅ Sync current user state with database (handles photo persistence)
        if (currentUser) {
          const latest = users.find(u => u.id === currentUser.id);
          if (latest && latest.photo !== currentUser.photo) {
            setCurrentUser(latest);
            localStorage.setItem(AUTH_KEY, JSON.stringify(latest));
          }
        }
      }
    };
    syncSettings();
    if (!currentUser) return;
    updateActivity();
    fetchUsers();

    const interval = setInterval(() => {
      updateActivity();
      // REMOVED fetchUsers() here to make the app lighter and stop fetching all users every 30s
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
          <Route path="kiosk" element={<KioskScanner />} />
          <Route path="fast-scanner" element={<FastScanner />} />
        </Route>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/portal" element={<PortailClient />} />
        <Route path="/info" element={<ClientInfoRoute />} />
        <Route path="/recrutement" element={<Recrutement />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (currentUser.role === 'client') {
    return <PortailClient currentUser={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === 'partenaire') {
    return <PartenairePortal currentUser={currentUser} onLogout={handleLogout} />;
  }

  const permissions = loadPermissions();
  const userRole = (currentUser.role || '').toLowerCase() as keyof typeof permissions;
  const allowed = permissions[userRole] || [];
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
        path="/"
        element={
          <AdminLayout
            onOpenClientPortal={() => setShowClientPortal(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
            company={company}
          />
        }
      >
        <Route index element={can('dashboard') ? <Dashboard allUsers={allUsers} /> : <Navigate to={can('worker_portal') ? "/worker-portal" : "/"} replace />} />
        <Route path="dashboard" element={can('dashboard') ? <Dashboard allUsers={allUsers} /> : <Navigate to={can('worker_portal') ? "/worker-portal" : "/"} replace />} />
        
        {/* Recruitment & Other */}
        <Route path="recrutement" element={<Recrutement />} />
        
        {/* Protected Production Routes */}
        <Route path="demandes" element={can('demandes') ? <Demandes /> : <Navigate to="/" replace />} />
        <Route path="pipeline" element={can('crm') ? <Pipeline /> : <Navigate to="/" replace />} />
        <Route path="echantillons" element={can('demandes') ? <Echantillons /> : <Navigate to="/" replace />} />
        <Route path="fiches-techniques" element={can('fiches') ? <FichesTechniques /> : <Navigate to="/" replace />} />
        <Route path="ordres-de-coupe" element={can('ordres') ? <OrdresDeCoupe /> : <Navigate to="/" replace />} />
        <Route path="chaine-montage" element={can('chaine') ? <ChaineDeMontage /> : <Navigate to="/" replace />} />
        <Route path="pilotage-chaine" element={can('pilotage') ? <ChaineDetaillee /> : <Navigate to="/" replace />} />
        <Route path="scan-production" element={can('scan_production') ? <ProductionScanner /> : <Navigate to="/" replace />} />
        <Route path="worker-portal" element={<WorkerPortal currentUser={currentUser} />} />
        <Route path="partenaire-portal" element={<PartenairePortal currentUser={currentUser} onLogout={handleLogout} />} />
        
        {/* Protected Finance Routes */}
        <Route path="factures" element={can('factures') ? <Factures /> : <Navigate to="/" replace />} />
        <Route path="devis" element={can('factures') ? <Devis /> : <Navigate to="/" replace />} />
        <Route path="recus" element={can('factures') ? <Recus /> : <Navigate to="/" replace />} />
        <Route path="prix-marche" element={<PrixMarche />} />
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
        <Route path="agenda" element={can('agenda') ? <Agenda /> : <Navigate to="/" replace />} />
        <Route path="commandes/manage" element={can('commandes') ? <ManageOrder /> : <Navigate to="/" replace />} />
        <Route path="liste-attente" element={can('rh') ? <ListeAttente /> : <Navigate to="/" replace />} />
        <Route path="notifications" element={can('notifications') ? <Notifications /> : <Navigate to="/" replace />} />
        <Route path="ai-space" element={can('ai_space') ? <AISpace /> : <Navigate to="/" replace />} />
        <Route path="planning-view/:id" element={<PlanningView />} />

      </Route>
      <Route element={<PointageLayout />}>
        <Route path="pointage" element={can('pointage') ? <Pointage onLogout={handleLogout} /> : <Navigate to="/" replace />} />
        <Route path="kiosk" element={<KioskScanner />} />
        <Route path="fast-scanner" element={can('fast_scanner') ? <FastScanner /> : <Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: any }> {
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
      const isChunkError = this.state.error?.toString().includes('chunk') || 
                          this.state.error?.toString().includes('dynamically imported module');

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 text-center">
          <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl">
            <h1 className="text-2xl font-black text-white mb-4">
              {isChunkError ? "Nouvelle version disponible" : "Oups! Une erreur est survenue"}
            </h1>
            <p className="text-slate-400 mb-6 text-sm">
              {isChunkError 
                ? "Une mise à jour du système a été effectuée. Veuillez recharger pour appliquer les changements." 
                : "Le composant a crashé. Voici l'erreur :"}
            </p>
            {!isChunkError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 text-left overflow-auto max-h-40">
                <code className="text-red-400 text-xs whitespace-pre-wrap">{this.state.error?.toString()}</code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
            >
              {isChunkError ? "Mettre à jour maintenant" : "Recharger la page"}
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
