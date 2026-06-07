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

import { supabase } from '../supabase';

async function verifyLogin(identifier: string, password: string): Promise<User | null> {
  const trimId = identifier.toLowerCase().trim();

  try {
    // 1. Call the secure RPC function to verify the user
    const { data, error } = await supabase.rpc('verify_erp_login', {
      p_email: trimId,
      p_password: password
    });

    if (error || !data) {
      console.warn("Login failed:", error?.message || "Invalid credentials");
      return null;
    }

    // 2. The RPC returns the user data AND the system credentials
    const { user, sys_email, sys_pass } = data;

    // 3. Silently sign in to Supabase Auth using the system credentials to unlock RLS
    if (sys_email && sys_pass) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: sys_email,
        password: sys_pass
      });
      
      if (authError) {
        console.error("Auth unlock failed:", authError);
        return null;
      }
      
      // ✅ Set a flag in localStorage so the app knows it's authenticated
      localStorage.setItem('textrack_auth', 'true');
    }

    return user as User;
  } catch (err) {
    console.error("Login exception:", err);
    return null;
  }
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

  async function handleLogin() {
    if (!identifier || !password) {

      setError(isAr ? 'المرجو إدخال البريد الإلكتروني وكلمة المرور.' : 'Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await verifyLogin(identifier, password);
      if (user) {
        onLogin(user);
      } else {
        setError(isAr ? '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة.' : '❌ Email ou mot de passe incorrect.');
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
          <div className="h-1 w-full transition-all duration-500 bg-gradient-to-r from-slate-700 to-slate-900" />

          <div className="px-8 pt-8 pb-6">
            {/* Mode header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isAr ? 'تسجيل الدخول' : 'Connexion'}
                </h2>
                <p className="text-slate-400 text-xs">
                  {isAr ? 'بريد إلكتروني + كلمة السر' : 'Email + Mot de passe'}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Identifier field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder={isAr ? 'مثال: example@beyacreative.com' : 'Ex: example@beyacreative.com'}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition-all"
                />
              </div>

              {/* Password / PIN field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {isAr ? 'كلمة السر' : 'Mot de passe'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder={isAr ? 'كلمة السر' : 'Mot de passe'}
                    className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition-all"
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
                className="w-full text-white py-3 rounded-xl font-bold active:scale-95 transition shadow-lg disabled:opacity-60 mt-2 bg-slate-900 hover:bg-black shadow-slate-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isAr ? 'جاري...' : 'Connexion...'}
                  </span>
                ) : (isAr ? 'دخول' : 'Se connecter')}
              </button>

            </div>
          </div>
        </div>


        <p className="text-center text-slate-600 text-xs mt-6">© {new Date().getFullYear()} {company.name} ERP</p>
      </div>
    </div>
  );
}
