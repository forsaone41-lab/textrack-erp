import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User, loadData, loadCompanyProfile } from '../types';

// Fallback passwords for existing installs (no password in localStorage yet)
const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@texttrack.ma': 'Admin123',
  'fatima@texttrack.ma': 'Chef123',
  'rachid@texttrack.ma': 'Chef123',
  'lalla@client.ma': 'Client123',
  'zellij@client.ma': 'Client123',
  'soraya@client.ma': 'Client123',
  'kids@client.ma': 'Client123',
};

async function verifyLogin(email: string, password: string): Promise<User | null> {
  const users = await loadData<User>('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return null;
  const expected = user.password || DEFAULT_PASSWORDS[user.email] || '';
  return expected === password ? user : null;
}


interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const company = loadCompanyProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setError('');
    setLoading(true);

    try {
      const user = await verifyLogin(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    } catch (e) {
      setError('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-4">
            <h1 className="text-3xl font-black text-white">B</h1>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            {company.name.split(' ')[0]}
            <span className="font-light text-indigo-400"> {company.name.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-indigo-200/80 text-xs mt-1 uppercase tracking-widest">{company.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Connexion</h2>
            <p className="text-slate-400 text-sm mb-6">Accès sécurisé à votre espace</p>



            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition"
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
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:bg-indigo-800 transition shadow-lg shadow-indigo-500/30 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : 'Se connecter'}
              </button>
            </div>
          </div>


        </div>

        <p className="text-center text-slate-600 text-xs mt-6">© {new Date().getFullYear()} {company.name} ERP</p>
      </div>
    </div>
  );
}
