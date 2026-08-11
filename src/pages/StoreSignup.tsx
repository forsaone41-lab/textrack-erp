import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, AlertCircle, Lock, User as UserIcon, CheckCircle, Store, ArrowRight, Loader2, Eye, EyeOff, Crown, MessageCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';

export default function StoreSignup({ onLogin }: { onLogin?: (user: any) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'login' ? 'login' : 'signup';
  const selectedPlan = queryParams.get('plan');

  const { isAr } = useLang();
  const company = loadCompanyProfile();
  const premiumPrice = company.storePremiumPrice || '499';

  const [mode, setMode] = useState<'signup' | 'login' | 'recovery'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

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
          if (selectedPlan === 'PREMIUM' || selectedPlan === 'ZIRORISK') {
            // Paid plans require payment confirmation via WhatsApp before full onboarding
            setPendingUser(userObj);
          } else {
            if (onLogin) onLogin(userObj);
            navigate('/store-onboarding');
          }
        } else {
          // Email confirmation is required
          setSuccess(isAr 
            ? 'تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.' 
            : 'Compte créé avec succès ! Veuillez vérifier votre email pour confirmer votre compte.');
        }

      } else if (mode === 'login') {
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
      } else if (mode === 'recovery') {
        // PASSWORD RECOVERY - redirect back to the app root so AppContent can show the new-password modal
        const siteUrl = window.location.origin + window.location.pathname;
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: siteUrl
        });
        if (resetErr) throw resetErr;
        setSuccess(isAr ? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني' : 'Un lien de réinitialisation a été envoyé à votre email');
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue'));
    } finally {
      setLoading(false);
    }
  };

  if (pendingUser) {
    const isZirorisk = selectedPlan === 'ZIRORISK';
    const planName = isZirorisk ? 'ZIRORISK (Setup)' : 'PREMIUM';
    const planPriceText = isZirorisk ? '800' : premiumPrice;

    const whatsappUrl = `https://wa.me/${(company.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
      isAr
        ? `مرحباً، أنشأت حسابي (${pendingUser.email}) وأريد تفعيل باقة ${planName} (${planPriceText} درهم).`
        : `Bonjour, j'ai créé mon compte (${pendingUser.email}) et je souhaite activer le plan ${planName} (${planPriceText} MAD).`
    )}`;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 bg-slate-900 text-white text-center">
              <div className="w-16 h-16 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-2xl font-black mb-1">
                {isAr ? 'خطوة واحدة قبل التفعيل' : 'Une dernière étape avant l\'activation'}
              </h1>
              <p className="text-slate-400 text-sm">
                {isAr 
                  ? `تم إنشاء حسابك بنجاح. باقة ${planName} تتطلب تأكيد الدفع (${planPriceText} درهم).` 
                  : `Votre compte a été créé. Le plan ${planName} nécessite une confirmation de paiement (${planPriceText} MAD).`}
              </p>
            </div>

            <div className="p-8 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-black text-slate-900 mb-3 text-sm">
                  {isAr ? 'طرق الدفع المتاحة (المغرب)' : 'Moyens de paiement (Maroc)'}
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 text-xs font-semibold text-slate-600">
                  <div className="flex-1 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200">
                    🏦 {isAr ? 'تحويل بنكي (CIH، التجاري وفا...)' : 'Virement bancaire (CIH, Attijari...)'}
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200">
                    💸 Cash Plus / Wafacash
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  {isAr
                    ? 'بعد إرسال وصل الدفع عبر واتساب، سيقوم فريقنا بتفعيل باقة PREMIUM على حسابك يدوياً خلال دقائق.'
                    : 'Après envoi du reçu de paiement via WhatsApp, notre équipe active manuellement votre plan PREMIUM en quelques minutes.'}
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {isAr ? 'تأكيد الدفع عبر واتساب' : 'Confirmer le paiement via WhatsApp'}
              </a>

              <button
                onClick={() => { if (onLogin) onLogin(pendingUser); navigate('/store-builder'); }}
                className="w-full py-3 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors"
              >
                {isAr ? 'المتابعة إلى لوحة التحكم (سأدفع لاحقاً)' : 'Continuer vers mon tableau de bord (je paierai plus tard)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <Link to="/" className="flex items-center gap-2 justify-center mb-6 group transition-opacity hover:opacity-90" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mt-0.5 uppercase">STORES</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {mode === 'signup' 
              ? (isAr ? 'أنشئ متجرك الآن' : 'Créez votre boutique') 
              : mode === 'recovery'
              ? (isAr ? 'استعادة كلمة المرور' : 'Récupération du mot de passe')
              : (isAr ? 'تسجيل الدخول لمتجرك' : 'Connectez-vous à votre boutique')}
          </h1>
          <p className="text-slate-500 font-medium">
            {mode === 'signup'
              ? (isAr ? 'انضم إلينا وابدأ البيع عبر الإنترنت باحترافية وأمان.' : 'Rejoignez-nous et commencez à vendre en ligne en toute sécurité.')
              : mode === 'recovery'
              ? (isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' : 'Entrez votre email et nous vous enverrons un lien de réinitialisation.')
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

                {mode !== 'recovery' && (
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
                          onClick={() => { setError(''); setMode('recovery'); }}
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
                )}

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
                  ) : mode === 'recovery' ? (
                    isAr ? 'إرسال رابط الاستعادة' : 'Envoyer le lien'
                  ) : (
                    isAr ? 'تسجيل الدخول' : 'Se connecter'
                  )}
                </button>
              </form>
              </>
            )}
          </div>
          
          {!success && (
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-500">
                {mode === 'signup' 
                  ? (isAr ? 'لديك حساب بالفعل؟' : 'Vous avez déjà un compte ?')
                  : mode === 'recovery'
                  ? (isAr ? 'تذكرت كلمة المرور؟' : 'Vous vous souvenez du mot de passe ?')
                  : (isAr ? 'ليس لديك حساب؟' : 'Vous n\'avez pas de compte ?')}
                {' '}
                <button 
                  type="button"
                  onClick={() => { setError(''); setMode(mode === 'signup' ? 'login' : mode === 'recovery' ? 'login' : 'signup'); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {mode === 'signup' 
                    ? (isAr ? 'تسجيل الدخول' : 'Se connecter')
                    : mode === 'recovery'
                    ? (isAr ? 'العودة لتسجيل الدخول' : 'Retour à la connexion')
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

