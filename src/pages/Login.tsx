import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, UserCircle, ShieldCheck, KeyRound, Mail, CheckCircle2, Loader2, X } from 'lucide-react';
import { User, Employe, loadData, loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';

// Fallback passwords for existing installs
const DEFAULT_PASSWORDS: Record<string, string[]> = {
  'admin@beya.ma': ['Admin123', 'HHyassin136'],
  'admin@texttrack.ma': ['Admin123', 'HHyassin136'],
  'admin@beyacreative.com': ['Admin123', 'HHyassin136'],
  'admin@beya.com': ['Admin123', 'HHyassin136'],
  'admin': ['Admin123', 'HHyassin136'],
  'fatima@texttrack.ma': ['Chef123'],
  'rachid@texttrack.ma': ['Chef123'],
  'lalla@client.ma': ['Client123'],
  'zellij@client.ma': ['Client123'],
  'soraya@client.ma': ['Client123'],
  'kids@client.ma': ['Client123'],
};

import { supabase } from '../supabase';

function withTimeout<T = any>(promise: any, ms = 3500): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_ERROR')), ms))
  ]);
}

async function verifyLogin(identifier: string, password: string): Promise<User | null> {
  const trimId = identifier.toLowerCase().trim();
  const trimPass = password.trim();

  const checkFallback = (): User | null => {
    // Check locally saved override passwords from Profile page
    const localOverride = localStorage.getItem(`beya_override_pass_${trimId}`) ||
                          (trimId.includes('admin') ? localStorage.getItem('beya_admin_pass') : null);

    const validPassList = DEFAULT_PASSWORDS[trimId] || [];
    const isMatched = (localOverride && localOverride.trim() === trimPass) ||
                      validPassList.some(p => p.toLowerCase() === trimPass.toLowerCase());

    if (isMatched) {
      localStorage.setItem('textrack_auth', 'true');
      const role = trimId.includes('fatima') || trimId.includes('rachid')
        ? 'chef_chaine'
        : trimId.includes('client')
        ? 'client'
        : 'admin';
      const nom = trimId.includes('fatima')
        ? 'Fatima Ezzahra'
        : trimId.includes('rachid')
        ? 'Rachid Alami'
        : trimId.includes('client')
        ? 'Client BEYA'
        : 'Admin BEYA';

      withTimeout(
        supabase.auth.signInWithPassword({
          email: 'admin@beya.ma',
          password: 'Admin123'
        }),
        2000
      ).catch(() => {});

      const isMasterAdmin = trimId === 'admin@beya.ma' || trimId === 'admin@texttrack.ma' || trimId === 'admin';
      const savedPhone = localStorage.getItem(`beya_user_phone_${trimId}`) || '+212 600 000 000';

      return {
        id: isMasterAdmin ? 'master-admin' : `${role}-local`,
        nom: isMasterAdmin ? 'Admin BEYA' : nom,
        email: trimId.includes('@') ? trimId : 'admin@beya.ma',
        role: role as any,
        telephone: savedPhone,
        password: trimPass
      };
    }
    return null;
  };

  try {
    let userRecord: User | null = null;
    let sysEmail: string | null = null;
    let sysPass: string | null = null;

    // 1. Call the secure RPC function to verify the user (with 3.5s timeout to prevent hanging on paused Supabase)
    try {
      const { data, error } = await withTimeout(
        supabase.rpc('verify_erp_login', {
          p_email: trimId,
          p_password: trimPass
        }),
        3500
      );

      if (!error && data && data.user) {
        userRecord = data.user as User;
        if (userRecord && userRecord.role === "merchant") userRecord.role = "client";
        sysEmail = data.sys_email;
        sysPass = data.sys_pass;
      }
    } catch (rpcErr) {
      console.warn("RPC Login error or timeout:", rpcErr);
    }

    // 2. Direct users table fallback (solves duplicates or RPC quirks, with 3.5s timeout)
    if (!userRecord) {
      try {
        const { data: matchedUsers, error: uErr } = await withTimeout(
          supabase
            .from('users')
            .select('*')
            .ilike('email', trimId),
          3500
        );

        if (!uErr && matchedUsers && matchedUsers.length > 0) {
          // Prefer master-admin over duplicate rows
          const sortedUsers = [...matchedUsers].sort((a: any, b: any) => (a.id === 'master-admin' ? -1 : 1));
          const matched = sortedUsers.find((u: any) => {
            const uPass = (u.password || '').toString().trim();
            const uPin = (u.pinCode || u.pin_code || '').toString().trim();
            return (uPass && uPass === trimPass) || (uPin && uPin === trimPass);
          });

          if (matched) {
            userRecord = {
              id: matched.id,
              nom: matched.nom,
              email: matched.email,
              role: matched.role === 'merchant' ? 'client' : matched.role,
              photo: matched.photo,
              telephone: matched.telephone,
              employeId: matched.employeId
            } as User;

            // Remember valid password locally
            localStorage.setItem(`beya_override_pass_${trimId}`, trimPass);

            // Unlock system credentials via admin RPC if possible
            try {
              const { data: authData } = await withTimeout(
                supabase.rpc('verify_erp_login', {
                  p_email: 'admin@beya.ma',
                  p_password: 'Admin123'
                }),
                2000
              );
              if (authData?.sys_email && authData?.sys_pass) {
                sysEmail = authData.sys_email;
                sysPass = authData.sys_pass;
              }
            } catch {}
          }
        }
      } catch (directErr) {
        console.warn("Direct user query fallback failed or timed out:", directErr);
      }
    }

    // 3. LocalStorage offline fallback
    if (!userRecord) {
      try {
        const rawLocal = localStorage.getItem('textrack_data_users');
        if (rawLocal) {
          const localUsers: any[] = JSON.parse(rawLocal);
          const found = localUsers.find(u => 
            (u.email || '').toLowerCase().trim() === trimId &&
            (((u.password || '').toString().trim() === trimPass) || ((u.pinCode || u.pin_code || '').toString().trim() === trimPass))
          );
          if (found) {
            localStorage.setItem('textrack_auth', 'true');
            return found as User;
          }
        }
      } catch {}

      return checkFallback();
    }

    // 4. Silently sign in to Supabase Auth using the system credentials to unlock RLS
    if (sysEmail && sysPass) {
      withTimeout(
        supabase.auth.signInWithPassword({
          email: sysEmail,
          password: sysPass
        }),
        2500
      ).then(({ error: authError }) => {
        if (authError) {
          console.warn("Auth unlock failed, proceeding with authenticated user:", authError);
        }
      }).catch(() => {});
    }

    localStorage.setItem('textrack_auth', 'true');
    return userRecord;
  } catch (err) {
    console.warn("Login exception, checking local fallbacks:", err);
    return checkFallback();
  }
}

async function verifyWorkerLogin(cin: string, pin: string): Promise<User | null> {
  try {
    let employe: Employe | null = null;
    const { data, error } = await withTimeout(
      supabase
        .from('employes')
        .select('*')
        .eq('cin', cin.trim().toUpperCase())
        .eq('pin_code', pin.trim())
        .limit(1),
      3500
    ).catch(() => ({ data: null, error: new Error('TIMEOUT') }));

    if (!error && data && data.length > 0) {
      employe = data[0] as Employe;
    } else {
      // Fallback to local storage if offline or not synced yet
      try {
        const localData = localStorage.getItem('textrack_data_employes');
        if (localData) {
          const employes: Employe[] = JSON.parse(localData);
          const localEmp = employes.find(e => 
            e.cin?.trim().toUpperCase() === cin.trim().toUpperCase() && 
            e.pin_code?.trim() === pin.trim()
          );
          if (localEmp) {
            employe = localEmp;
          }
        }
      } catch {}
    }

    if (!employe) {
      console.warn("Worker login failed: Invalid CIN or PIN");
      return null;
    }

    // Optional: unlock RLS anonymously or using a shared worker account if necessary.
    localStorage.setItem('textrack_auth', 'true');

    // Force unlock RLS so workers can read their data on their phones (which have no local cache)
    try {
      const { data: authData } = await withTimeout(
        supabase.rpc('verify_erp_login', {
          p_email: 'admin@beya.ma',
          p_password: 'Admin123'
        }),
        2000
      );
      if (authData?.sys_email && authData?.sys_pass) {
        withTimeout(
          supabase.auth.signInWithPassword({
            email: authData.sys_email,
            password: authData.sys_pass
          }),
          2000
        ).catch(() => {});
      }
    } catch(e) {
      console.error("Worker RLS unlock failed", e);
    }

    return {
      id: `worker-${employe.id}`,
      nom: `${employe.prenom} ${employe.nom}`,
      email: `${employe.cin?.toLowerCase() || 'worker'}@beya.local`,
      role: 'worker',
      employeId: employe.id,
      photo: employe.photo
    } as User;
  } catch (err) {
    console.error("Worker login exception:", err);
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

  // Mot de passe oublié states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetMsg, setResetMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSendResetEmail(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (cooldown > 0 || resetLoading) return;

    const email = resetEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setResetStatus('error');
      setResetMsg(isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Veuillez saisir une adresse email valide.');
      return;
    }

    setResetLoading(true);
    setResetStatus('idle');
    setResetMsg('');

    try {
      const siteUrl = window.location.origin + window.location.pathname;

      // 1. Envoyer le lien de réinitialisation sécurisé via Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: siteUrl
      });

      if (error) {
        const errLower = (error.message || '').toLowerCase();
        if (errLower.includes('not found') || errLower.includes('user') || error.status === 400) {
          let foundNom = '';
          let foundRole = 'worker';

          // Recherche dans la table users
          const { data: matchedUsers } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email);

          if (matchedUsers && matchedUsers.length > 0) {
            foundNom = matchedUsers[0].nom || 'Employé BEYA';
            foundRole = matchedUsers[0].role || 'worker';
          } else {
            // Recherche dans la table employes
            const { data: matchedEmp } = await supabase
              .from('employes')
              .select('*')
              .ilike('email', email);

            if (matchedEmp && matchedEmp.length > 0) {
              foundNom = `${matchedEmp[0].prenom || ''} ${matchedEmp[0].nom || ''}`.trim() || 'Employé BEYA';
              foundRole = 'worker';
            }
          }

          if (foundNom) {
            // Provisionner temporairement dans Supabase Auth pour permettre l'envoi du mail officiel
            const tempPass = 'Beya@' + Math.random().toString(36).slice(-8) + 'A1!';
            await supabase.auth.signUp({
              email: email,
              password: tempPass,
              options: {
                data: {
                  full_name: foundNom,
                  role: foundRole
                }
              }
            }).catch(() => {});

            // Réessayer l'envoi de réinitialisation
            const { error: retryErr } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: siteUrl
            });
            if (retryErr) throw retryErr;
          }
        } else {
          throw error;
        }
      }

      setResetStatus('success');
      setResetMsg(
        isAr
          ? `تم إرسال رابط استعادة كلمة المرور بنجاح إلى: ${email}`
          : `Un lien sécurisé de réinitialisation a été envoyé à : ${email}`
      );
      setCooldown(60);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setResetStatus('error');
      setResetMsg(
        err?.message || (isAr ? 'تعذر إرسال رابط الاستعادة. يرجى التأكد من البريد أو المحاولة لاحقاً.' : 'Impossible d\'envoyer le lien de réinitialisation.')
      );
    } finally {
      setResetLoading(false);
    }
  }

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      let user: User | null = null;
      
      if (!identifier || !password) {
        setError(isAr ? 'المرجو إدخال المعلومات المطلوبة.' : 'Veuillez remplir tous les champs.');
        setLoading(false);
        return;
      }
      
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        user = await verifyLogin(identifier, password);
      } else {
        user = await verifyWorkerLogin(identifier, password);
      }

      if (user) {
        if (user.role === "merchant") user.role = "client";
        onLogin(user);
      } else {
        setError(isAr ? '❌ المعلومات غير صحيحة.' : '❌ Informations incorrectes.');
      }
    } catch {
      setError(isAr ? 'خطأ في الاتصال. حاول مرة أخرى.' : 'Erreur de connexion. Réessayez.');
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
                  {isAr ? 'بريد إلكتروني وكلمة السر' : 'Email et mot de passe'}
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

              {/* Password field */}
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
                {/* Mot de passe oublié */}
                <div className="flex justify-end pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (identifier && identifier.includes('@')) {
                        setResetEmail(identifier.trim());
                      }
                      setShowResetModal(true);
                      setResetStatus('idle');
                      setResetMsg('');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline transition-colors focus:outline-none"
                  >
                    {isAr ? 'نسيت كلمة المرور ؟' : 'Mot de passe oublié ?'}
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

        <p className="text-center text-slate-600 text-xs mt-6">© {new Date().getFullYear()} {company.name}</p>
      </div>

      {/* Modal Mot de passe oublié */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
            
            <button
              type="button"
              onClick={() => {
                setShowResetModal(false);
                setResetStatus('idle');
                setResetMsg('');
              }}
              className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600 shadow-sm shadow-indigo-100">
                <KeyRound className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                {isAr ? 'استعادة كلمة المرور' : 'Mot de passe oublié ?'}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                {isAr
                  ? 'أدخل بريدك الإلكتروني المسجل في النظام. سنرسل لك رابطاً مشفراً وآمناً لتغيير كلمة المرور.'
                  : 'Entrez l\'adresse email associée à votre compte. Un lien sécurisé de réinitialisation vous sera envoyé par email.'}
              </p>

              {resetStatus === 'success' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-950 mb-1">
                        {isAr ? 'تم إرسال الرابط بنجاح!' : 'Lien envoyé avec succès !'}
                      </p>
                      <p>{resetMsg}</p>
                      <p className="mt-2 text-emerald-700 font-medium">
                        {isAr
                          ? 'يرجى مراجعة بريدك الإلكتروني (بما في ذلك مجلد Spams) والضغط على الرابط لتعيين كلمة مرور جديدة.'
                          : 'Veuillez vérifier votre boîte de réception (ainsi que vos courriers indésirables / spams) puis cliquez sur le lien.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={cooldown > 0 || resetLoading}
                      onClick={handleSendResetEmail}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      {cooldown > 0
                        ? (isAr ? `إعادة الإرسال (${cooldown})` : `Renvoyer (${cooldown}s)`)
                        : (isAr ? 'إعادة الإرسال' : 'Renvoyer')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetModal(false);
                        setResetStatus('idle');
                        setResetMsg('');
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition"
                    >
                      {isAr ? 'إغلاق' : 'Fermer'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendResetEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {isAr ? 'البريد الإلكتروني' : 'Adresse Email'}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'} w-4 h-4 text-slate-400`} />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder="example@beyacreative.com"
                        className={`w-full ${isAr ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all`}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {resetStatus === 'error' && (
                    <div className="flex items-start gap-2 bg-rose-50 text-rose-600 p-3 rounded-xl text-xs border border-rose-100 font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{resetMsg}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetModal(false);
                        setResetStatus('idle');
                        setResetMsg('');
                      }}
                      className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                    >
                      {isAr ? 'إلغاء' : 'Annuler'}
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading || cooldown > 0}
                      className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isAr ? 'جاري الإرسال...' : 'Envoi en cours...'}</span>
                        </>
                      ) : cooldown > 0 ? (
                        <span>{isAr ? `انتظر ${cooldown} ثانية` : `Patientez ${cooldown}s`}</span>
                      ) : (
                        <span>{isAr ? 'إرسال رابط الاستعادة' : 'Envoyer le lien'}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isAr ? 'نظام استعادة آمن ومشفّر' : 'Système de récupération sécurisé et chiffré'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
