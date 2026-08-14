import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, AlertCircle, Lock, User as UserIcon, CheckCircle, Handshake, ArrowRight, Loader2, Eye, EyeOff, Phone } from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../contexts/LangContext';

type Track = 'builder' | 'reseller' | 'supplier' | 'atelier';

function genReferralCode(name: string): string {
  const base = (name || 'partner').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 10) || 'partner';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

export default function AffiliateSignup({ onLogin }: { onLogin?: (user: any) => void }) {
  const navigate = useNavigate();
  const { isAr } = useLang();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tracks, setTracks] = useState<Track[]>(['builder']);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Directory profile fields (only needed for 'supplier' / 'atelier' tracks)
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const toggleTrack = (t: Track) => {
    setTracks(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const needsDirectoryProfile = tracks.includes('supplier') || tracks.includes('atelier');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!acceptedTerms) {
          throw new Error(isAr ? 'يجب الموافقة على شروط الخدمة أولاً' : 'Vous devez accepter les conditions d\'utilisation');
        }
        if (tracks.length === 0) {
          throw new Error(isAr ? 'اختر مسار واحد على الأقل' : 'Choisissez au moins un parcours');
        }
        if (password !== confirmPassword) {
          throw new Error(isAr ? 'كلمات السر غير متطابقة' : 'Les mots de passe ne correspondent pas');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              role: 'affiliate'
            }
          }
        });
        if (signUpError) throw signUpError;
        if (!data.user) {
          setSuccess(isAr
            ? 'تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.'
            : 'Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
          return;
        }

        const referralCode = genReferralCode(fullName || email.split('@')[0]);
        const { error: insertError } = await supabase.from('affiliates').insert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone,
          referral_code: referralCode,
          tracks,
          status: 'pending',
          ...(needsDirectoryProfile ? {
            business_name: businessName,
            category,
            description,
            city,
            whatsapp: whatsapp || phone
          } : {})
        });
        if (insertError) throw insertError;

        const userObj = { id: data.user.id, nom: fullName, role: 'affiliate', email };
        if (data.session) {
          if (onLogin) onLogin(userObj);
          navigate('/');
        } else {
          setSuccess(isAr
            ? 'تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.'
            : 'Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        const role = data.user?.user_metadata?.role;
        if (role !== 'affiliate' && role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error(isAr ? 'ليس لديك صلاحية الدخول إلى فضاء الشركاء.' : 'Vous n\'avez pas accès à l\'espace partenaires.');
        }

        const userObj = { id: data.user.id, nom: data.user.user_metadata?.full_name || 'Affilié', role, email: data.user.email || email };
        if (onLogin) onLogin(userObj);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="flex items-center gap-2 justify-center mb-6 group transition-opacity hover:opacity-90" dir="ltr">
            <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-gradient-to-br from-amber-500 to-blue-600 text-white shadow-sm shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="font-black text-[22px] leading-none tracking-tight text-[#0B1121]">BEYA</span>
              <span className="font-bold text-[11px] leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-blue-600 mt-0.5 uppercase">PARTNERS</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {mode === 'signup'
              ? (isAr ? 'انضم لبرنامج الشركاء' : 'Rejoignez le programme partenaires')
              : (isAr ? 'الدخول لفضاء الشركاء' : 'Connexion espace partenaires')}
          </h1>
          <p className="text-slate-500 font-medium">
            {mode === 'signup'
              ? (isAr ? 'اربح عمولات ببناء مواقع للتجار أو بإعادة بيع منتجاتنا.' : 'Gagnez des commissions en créant des sites pour des marchands ou en revendant nos produits.')
              : (isAr ? 'تتبع أرباحك وطلبات الدفع الخاصة بك.' : 'Suivez vos gains et vos demandes de paiement.')}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700">
              {isAr ? 'برنامج واحد بمسارين للربح' : 'Un programme, deux parcours de gains'}
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
                <p className="text-slate-600 mb-8 max-w-sm mx-auto">{success}</p>
                <button
                  onClick={() => { setSuccess(''); setMode('login'); }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  {isAr ? 'الذهاب لتسجيل الدخول' : 'Aller à la connexion'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-5">
                {mode === 'signup' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'الاسم الكامل' : 'Nom complet'}</label>
                      <div className="relative">
                        <UserIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                        <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                          placeholder={isAr ? 'محمد العلوي' : 'Mohammed Alaoui'} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
                      <div className="relative">
                        <Phone className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                          placeholder="6 00 00 00 00" />
                      </div>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">{isAr ? 'المسار (يمكن اختيار أكثر من واحد)' : 'Parcours (vous pouvez en choisir plusieurs)'}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button type="button" onClick={() => toggleTrack('builder')}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${tracks.includes('builder') ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                        <p className="font-bold text-sm text-slate-900">{isAr ? 'باني مواقع' : 'Builder'}</p>
                        <p className="text-xs text-slate-500 mt-1">{isAr ? 'ابني وبيع مواقع للتجار واربح عمولة' : 'Créez et vendez des sites aux marchands'}</p>
                      </button>
                      <button type="button" onClick={() => toggleTrack('reseller')}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${tracks.includes('reseller') ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                        <p className="font-bold text-sm text-slate-900">{isAr ? 'موزع' : 'Reseller'}</p>
                        <p className="text-xs text-slate-500 mt-1">{isAr ? 'أعد بيع Beya Creative والباقات' : 'Revendez Beya Creative et les plans'}</p>
                      </button>
                      <button type="button" onClick={() => toggleTrack('supplier')}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${tracks.includes('supplier') ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                        <p className="font-bold text-sm text-slate-900">{isAr ? 'مورد / جملة' : 'Fournisseur'}</p>
                        <p className="text-xs text-slate-500 mt-1">{isAr ? 'اظهر فدليل الشركاء وبع مواد أولية بالجملة' : 'Apparaissez dans l\'annuaire et vendez en gros'}</p>
                      </button>
                      <button type="button" onClick={() => toggleTrack('atelier')}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${tracks.includes('atelier') ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                        <p className="font-bold text-sm text-slate-900">{isAr ? 'معمل / ورشة' : 'Atelier'}</p>
                        <p className="text-xs text-slate-500 mt-1">{isAr ? 'قدم خدمات التصنيع للتجار والمنصة' : 'Proposez vos services de production'}</p>
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && needsDirectoryProfile && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-600">{isAr ? 'معلومات ستظهر في دليل الشركاء العام' : 'Informations affichées dans l\'annuaire public des partenaires'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required value={businessName} onChange={e => setBusinessName(e.target.value)}
                        placeholder={isAr ? 'اسم المقاولة / الورشة' : 'Nom de l\'entreprise / atelier'}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
                      <select required value={category} onChange={e => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500">
                        <option value="">{isAr ? 'اختر الفئة' : 'Choisir une catégorie'}</option>
                        <option value="tissu">{isAr ? 'أقمشة' : 'Tissus'}</option>
                        <option value="confection">{isAr ? 'تفصيل / خياطة' : 'Confection'}</option>
                        <option value="broderie">{isAr ? 'تطريز' : 'Broderie'}</option>
                        <option value="impression">{isAr ? 'طباعة' : 'Impression'}</option>
                        <option value="autre">{isAr ? 'أخرى' : 'Autre'}</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input value={city} onChange={e => setCity(e.target.value)}
                        placeholder={isAr ? 'المدينة' : 'Ville'}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
                      <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                        placeholder={isAr ? 'رقم واتساب (اختياري، سيُستعمل رقم الهاتف)' : 'WhatsApp (optionnel, sinon le téléphone)'}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
                    </div>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      placeholder={isAr ? 'وصف مختصر لما تقدمه' : 'Brève description de ce que vous proposez'}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                      placeholder="contact@email.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'كلمة السر' : 'Mot de passe'}</label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'تأكيد كلمة السر' : 'Confirmer le mot de passe'}</label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                        placeholder="••••••••" />
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
                      <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="peer sr-only" />
                      <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded peer-checked:bg-amber-600 peer-checked:border-amber-600 transition-colors flex items-center justify-center cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                        <CheckCircle className={`w-3.5 h-3.5 text-white transition-transform ${acceptedTerms ? 'scale-100' : 'scale-0'}`} />
                      </div>
                    </div>
                    <label htmlFor="terms" className="text-[11px] font-semibold text-slate-500 leading-relaxed cursor-pointer select-none">
                      {isAr ? (
                        <>أقر بأنني قرأت وأوافق على <a href="#/terms" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">شروط الخدمة</a> و <a href="#/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">سياسة الخصوصية</a> الخاصة ببرنامج شركاء بية كريتيف.</>
                      ) : (
                        <>Je reconnais avoir lu et j'accepte les <a href="#/terms" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Conditions d'utilisation</a> et la <a href="#/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Politique de confidentialité</a> du programme partenaires BEYACREATIVE.</>
                      )}
                    </label>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_rgba(245,158,11,0.25)] disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'signup' ? (
                    <>{isAr ? 'إنشاء حساب شريك' : 'Créer mon compte partenaire'} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} /></>
                  ) : (isAr ? 'تسجيل الدخول' : 'Se connecter')}
                </button>
              </form>
            )}
          </div>

          {!success && (
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-500">
                {mode === 'signup' ? (isAr ? 'لديك حساب بالفعل؟' : 'Vous avez déjà un compte ?') : (isAr ? 'ليس لديك حساب؟' : 'Vous n\'avez pas de compte ?')}
                {' '}
                <button type="button" onClick={() => { setError(''); setMode(mode === 'signup' ? 'login' : 'signup'); }} className="text-amber-600 font-bold hover:underline">
                  {mode === 'signup' ? (isAr ? 'تسجيل الدخول' : 'Se connecter') : (isAr ? 'أنشئ حساب شريك' : 'Créer un compte partenaire')}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
