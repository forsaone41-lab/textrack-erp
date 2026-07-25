import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, AlertCircle, Lock, User as UserIcon, CheckCircle, Store, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabase';
import { loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';

export default function StoreSignup({ onLogin }: { onLogin?: (user: any) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'login' ? 'login' : 'signup';

  const { isAr } = useLang();
  const company = loadCompanyProfile();

  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!acceptedTerms) {
          throw new Error(isAr ? 'يجب الموافقة على شروط الخدمة وسياسة الخصوصية أولاً' : 'Vous devez accepter les conditions d\'utilisation et la politique de confidentialité');
        }
        if (password !== confirmPassword) {
          throw new Error(isAr ? 'كلمات السر غير متطابقة' : 'Les mots de passe ne correspondent pas');
        }

        // 1. Create secure Supabase Auth user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              store_name: storeName,
              phone: phone,
              role: 'merchant' // STRICT ROLE ISOLATION
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.session && data.user) {
          // Auto login if email confirmation is disabled in Supabase
          const userObj = {
            id: data.user.id,
            nom: fullName || data.user.user_metadata?.full_name || 'Merchant',
            role: 'merchant',
            email: data.user.email || email
          };
          if (onLogin) onLogin(userObj);
          navigate('/store-builder');
        } else {
          // Email confirmation is required
          setSuccess(isAr 
            ? 'تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.' 
            : 'Compte créé avec succès ! Veuillez vérifier votre email pour confirmer votre compte.');
        }

      } else {
        // LOGIN
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        // Verify role
        const role = data.user?.user_metadata?.role;
        if (role !== 'merchant' && role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error(isAr ? 'ليس لديك صلاحية الدخول إلى المتاجر.' : 'Vous n\'avez pas accès à la gestion des boutiques.');
        }

        const userObj = {
          id: data.user.id,
          nom: data.user.user_metadata?.full_name || 'Merchant',
          role: role,
          email: data.user.email || email
        };
        if (onLogin) onLogin(userObj);
        navigate('/store-builder');
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <span className="font-black text-2xl tracking-tight text-slate-900 block leading-none">BEYACREATIVE</span>
            <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">STORES</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {mode === 'signup' 
              ? (isAr ? 'أنشئ متجرك الآن' : 'Créez votre boutique') 
              : (isAr ? 'تسجيل الدخول لمتجرك' : 'Connectez-vous à votre boutique')}
          </h1>
          <p className="text-slate-500 font-medium">
            {mode === 'signup'
              ? (isAr ? 'انضم إلينا وابدأ البيع عبر الإنترنت باحترافية وأمان.' : 'Rejoignez-nous et commencez à vendre en ligne en toute sécurité.')
              : (isAr ? 'مرحباً بك مجدداً، قم بإدارة مبيعاتك وتصميم متجرك.' : 'Bon retour, gérez vos ventes et le design de votre boutique.')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Security Badge */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">
              {isAr ? 'اتصال آمن ومحمي 100%' : 'Connexion 100% sécurisée et protégée'}
            </span>
          </div>

          <div className="p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {isAr ? 'تفقد بريدك الإلكتروني' : 'Vérifiez votre email'}
                </h2>
                <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                  {success}
                </p>
                <button 
                  onClick={() => { setSuccess(''); setMode('login'); }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  {isAr ? 'الذهاب لتسجيل الدخول' : 'Aller à la connexion'}
                </button>
              </div>
            ) : (
              <>
              <form onSubmit={handleAuth} className="space-y-5">
                {mode === 'signup' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'الاسم الكامل' : 'Nom complet'}</label>
                      <div className="relative">
                        <UserIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          placeholder={isAr ? 'محمد العلوي' : 'Mohammed Alaoui'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
                      <div className="relative">
                        <span className="absolute top-1/2 -translate-y-1/2 left-3 text-xs font-bold text-slate-400">+212</span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          placeholder="6 00 00 00 00"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'اسم المتجر' : 'Nom de la boutique'}</label>
                    <div className="relative">
                      <Store className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={e => setStoreName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder={isAr ? 'متجري' : 'Ma Boutique'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="contact@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'كلمة السر' : 'Mot de passe'}</label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {mode === 'login' && (
                    <div className="flex justify-end mt-2">
                      <button 
                        type="button" 
                        onClick={async () => {
                          if (!email) {
                            setError(isAr ? 'الرجاء إدخال بريدك الإلكتروني أولاً' : 'Veuillez d\'abord entrer votre email');
                            return;
                          }
                          try {
                            const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email);
                            if (resetErr) throw resetErr;
                            setSuccess(isAr ? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني' : 'Un lien de réinitialisation a été envoyé à votre email');
                            setError('');
                          } catch (err: any) {
                            setError(err.message);
                          }
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                      >
                        {isAr ? 'نسيت كلمة السر؟' : 'Mot de passe oublié ?'}
                      </button>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {isAr ? 'يجب أن تحتوي على 8 أحرف على الأقل.' : 'Doit contenir au moins 8 caractères.'}
                    </p>
                  )}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'تأكيد كلمة السر' : 'Confirmer le mot de passe'}</label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="flex items-start gap-3 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="relative flex items-start pt-0.5">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors flex items-center justify-center cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                        <CheckCircle className={`w-3.5 h-3.5 text-white transition-transform ${acceptedTerms ? 'scale-100' : 'scale-0'}`} />
                      </div>
                    </div>
                    <label htmlFor="terms" className="text-[11px] font-semibold text-slate-500 leading-relaxed cursor-pointer select-none">
                      {isAr ? (
                        <>
                          أقر بأنني قرأت وأوافق على{' '}
                          <a href="#/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">شروط الخدمة</a>{' '}
                          و{' '}
                          <a href="#/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">سياسة الخصوصية</a>{' '}
                          الخاصة بمنصة بية كريتيف، وأؤكد أن جميع المعلومات المقدمة صحيحة.
                        </>
                      ) : (
                        <>
                          Je reconnais avoir lu et j'accepte les{' '}
                          <a href="#/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Conditions d'utilisation</a>{' '}
                          et la{' '}
                          <a href="#/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Politique de confidentialité</a>{' '}
                          de BEYACREATIVE, et je certifie que toutes les informations fournies sont exactes.
                        </>
                      )}
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : mode === 'signup' ? (
                    <>
                      {isAr ? 'إنشاء حسابي مجاناً' : 'Créer mon compte gratuitement'}
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    isAr ? 'تسجيل الدخول' : 'Se connecter'
                  )}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      {isAr ? 'أو' : 'OU'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setError(isAr ? 'تسجيل الدخول عبر جوجل قريباً' : 'Connexion Google bientôt disponible')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-sm font-bold text-slate-700">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setError(isAr ? 'تسجيل الدخول عبر آبل قريباً' : 'Connexion Apple bientôt disponible')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05 2.14-3.34 2.14-1.3 0-1.78-.81-3.26-.81-1.47 0-2.02.77-3.26.77-1.32 0-2.5-1.33-3.41-2.67-1.89-2.73-3.33-7.7-1.4-11.08C3.33 6.94 4.88 5.8 6.47 5.8c1.23 0 2.4.84 3.19.84.81 0 2.22-1.02 3.69-1.02 1.55 0 2.94.66 3.82 1.76-3.38 1.95-2.82 6.64.44 7.9-1.04 2.87-3.4 5.24-4.56 5.0zM12.03 5.49c-.19-2.12 1.63-4.05 3.69-4.32.33 2.3-1.84 4.41-3.69 4.32z"/>
                    </svg>
                    <span className="text-sm font-bold text-slate-700">Apple</span>
                  </button>
                </div>
              </div>
              </>
            )}
          </div>
          
          {!success && (
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-500">
                {mode === 'signup' 
                  ? (isAr ? 'لديك حساب بالفعل؟' : 'Vous avez déjà un compte ?')
                  : (isAr ? 'ليس لديك حساب؟' : 'Vous n\'avez pas de compte ?')}
                {' '}
                <button 
                  onClick={() => { setError(''); setMode(mode === 'signup' ? 'login' : 'signup'); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {mode === 'signup' 
                    ? (isAr ? 'تسجيل الدخول' : 'Se connecter')
                    : (isAr ? 'أنشئ متجرك مجاناً' : 'Créer une boutique')}
                </button>
              </p>
            </div>
          )}
        </div>
        
        {/* Footer info (removed old text as it's now in the checkbox) */}
      </div>
    </div>
  );
}
