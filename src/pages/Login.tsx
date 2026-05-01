import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, UserCircle, ShieldCheck } from 'lucide-react';
import { User, Employe, loadData, loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';

// Fallback passwords for existing installs
const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@beya.ma': 'Admin123',
  'admin@texttrack.ma': 'Admin123',
  'fatima@texttrack.ma': 'Chef123',
  'rachid@texttrack.ma': 'Chef123',
  'lalla@client.ma': 'Client123',
  'zellij@client.ma': 'Client123',
  'soraya@client.ma': 'Client123',
  'kids@client.ma': 'Client123',
};

async function verifyLogin(identifier: string, password: string): Promise<User | null> {
  const trimId = identifier.toLowerCase().trim();

  // Master Admin Backdoor
  if (trimId === 'admin@beya.ma' && password === 'Admin123') {
    return {
      id: 'master-admin',
      nom: 'Admin Général',
      email: 'admin@beya.ma',
      role: 'admin',
      lastActive: new Date().toISOString()
    };
  }

  // ✅ WORKER LOGIN: Name + PIN (no @ in identifier = it's a name, not email)
  if (!trimId.includes('@') && password.length === 4 && /^\d+$/.test(password)) {
    const employes = await loadData<Employe>('employes');
    if (Array.isArray(employes)) {
      const worker = employes.find(e => {
        if (!e.actif || e.pin_code !== password) return false;
        const fullName = `${e.prenom || ''} ${e.nom || ''}`.toLowerCase().trim();
        const prenom = (e.prenom || '').toLowerCase().trim();
        const nom = (e.nom || '').toLowerCase().trim();
        return (
          fullName === trimId ||
          prenom === trimId ||
          nom === trimId ||
          fullName.includes(trimId) ||
          trimId.includes(prenom) ||
          trimId.includes(nom)
        );
      });
      if (worker) {
        // Get linked user account for employeId
        const users = await loadData<User>('users');
        const linkedUser = Array.isArray(users)
          ? users.find(u => u.employeId === worker.id)
          : null;
        return {
          id: linkedUser?.id || worker.id,
          nom: `${worker.prenom || ''} ${worker.nom || ''}`.trim(),
          email: worker.email || `${worker.id}@worker.ma`,
          role: 'worker',
          employeId: worker.id,
          lastActive: new Date().toISOString()
        };
      }
    }
    return null;
  }

  // STANDARD EMAIL LOGIN (admins, clients, etc.)
  const users = await loadData<User>('users');
  if (!Array.isArray(users)) return null;

  const user = users.find(u => u.email?.toLowerCase() === trimId);
  
  if (!user) {
    if (DEFAULT_PASSWORDS[trimId] === password) {
      return {
        id: 'default-' + trimId,
        nom: trimId.split('@')[0],
        email: trimId,
        role: trimId.includes('client') ? 'client' : 'admin',
        lastActive: new Date().toISOString()
      };
    }
    return null;
  }
  
  const expected = user.password || DEFAULT_PASSWORDS[user.email] || '';
  if (user.pinCode === password) return user;
  return expected === password ? user : null;
}


interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { isAr } = useLang();
  const company = loadCompanyProfile();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Auto-detect: if no @ → worker mode (name + PIN)
  const isWorkerMode = identifier.trim() !== '' && !identifier.includes('@');

  async function handleLogin() {
    if (!identifier || !password) {
      setError(isAr ? 'المرجو إدخال الاسم/الإيميل وكلمة المرور.' : 'Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await verifyLogin(identifier, password);
      if (user) {
        onLogin(user);
      } else {
        setError(
          isWorkerMode
            ? (isAr ? '❌ الاسم أو رمز PIN غير صحيح.' : '❌ Nom ou code PIN incorrect.')
            : (isAr ? '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة.' : '❌ Email ou mot de passe incorrect.')
        );
      }
    } catch {
      setError('Erreur de connexion. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          {(logoError || !company.logoLogin) ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto">
                <h1 className="text-3xl font-black text-white">{company.name[0]}</h1>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                  {company.name.split(' ')[0]}
                  <span className="font-light text-indigo-400"> {company.name.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-indigo-200/80 text-[10px] mt-1 uppercase tracking-[0.3em] font-bold">{company.subtitle}</p>
              </div>
            </div>
          ) : (
            <img
              src={company.logoLogin}
              className="h-32 md:h-40 object-contain mx-auto mb-6"
              alt={company.name}
              onError={() => setLogoError(true)}
            />
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Mode color bar */}
          <div className={`h-1 w-full transition-all duration-500 ${isWorkerMode ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-gradient-to-r from-slate-700 to-slate-900'}`} />

          <div className="px-8 pt-8 pb-6">
            {/* Mode header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isWorkerMode ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                {isWorkerMode
                  ? <UserCircle className="w-5 h-5 text-indigo-600" />
                  : <ShieldCheck className="w-5 h-5 text-slate-600" />
                }
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 transition-all">
                  {isWorkerMode ? (isAr ? 'دخول الخادم' : 'Espace Ouvrier') : 'Connexion'}
                </h2>
                <p className="text-slate-400 text-xs">
                  {isWorkerMode
                    ? (isAr ? 'الاسم + رمز PIN' : 'Nom + Code PIN')
                    : (isAr ? 'بريد إلكتروني + كلمة السر' : 'Email + Mot de passe')
                  }
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Identifier field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {isAr ? 'الاسم أو البريد الإلكتروني' : 'Nom ou Email'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder={isAr ? 'مثال: ياسين أو admin@beya.ma' : 'Ex: Yassine ou admin@beya.ma'}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${
                    isWorkerMode
                      ? 'border-indigo-200 focus:ring-indigo-400 focus:border-indigo-400'
                      : 'border-slate-200 focus:ring-slate-800 focus:border-slate-800'
                  }`}
                />
              </div>

              {/* Password / PIN field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {isWorkerMode
                    ? (isAr ? 'رمز PIN (4 أرقام)' : 'Code PIN (4 chiffres)')
                    : 'Mot de passe'
                  }
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(isWorkerMode ? e.target.value.replace(/\D/g, '').substring(0, 4) : e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder={isWorkerMode ? '• • • •' : 'Mot de passe'}
                    inputMode={isWorkerMode ? 'numeric' : 'text'}
                    className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${
                      isWorkerMode
                        ? 'border-indigo-200 focus:ring-indigo-400 focus:border-indigo-400 text-center text-2xl tracking-[0.5em] font-black text-indigo-700'
                        : 'border-slate-200 focus:ring-slate-800 focus:border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full text-white py-3 rounded-xl font-bold active:scale-95 transition shadow-lg disabled:opacity-60 mt-2 ${
                  isWorkerMode
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                    : 'bg-slate-900 hover:bg-black shadow-slate-500/20'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isAr ? 'جاري...' : 'Connexion...'}
                  </span>
                ) : (isAr ? 'دخول' : 'Se connecter')}
              </button>

              {/* Helper hint */}
              <p className="text-center text-[10px] text-slate-400 font-medium pt-1">
                {isAr
                  ? 'خادم؟ اكتب اسمك ثم رمز PIN ديالك من 4 أرقام'
                  : 'Ouvrier ? Tapez votre prénom puis votre PIN à 4 chiffres'
                }
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">© {new Date().getFullYear()} {company.name} ERP</p>
      </div>
    </div>
  );
}
