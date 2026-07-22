import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '../supabase';

export default function AuthForm({ storeIsAr, storeLang, mode, onModeChange, storeDomain, onAuthed }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const lang = storeLang || (storeIsAr ? 'ar' : 'fr');
  const t = (fr: string, en: string, ar: string) => lang === 'ar' ? ar : lang === 'en' ? en : fr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, phone } }
        });
        if (signUpError) throw signUpError;

        if (data.session && data.user) {
          await supabase.from('store_customers').insert({
            id: data.user.id,
            store_domain: storeDomain,
            name,
            phone,
            email
          });
          onAuthed(data.user, { name, phone, email });
        } else {
          setInfoMessage(t('Vérifiez votre email pour confirmer votre compte.', 'Check your email to confirm your account.', 'تحقق من بريدك الإلكتروني لتأكيد حسابك.'));
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (data.user) {
          let { data: profile } = await supabase.from('store_customers').select('*').eq('id', data.user.id).single();
          if (!profile) {
            const fallbackProfile = {
              id: data.user.id,
              store_domain: storeDomain,
              name: data.user.user_metadata?.name || '',
              phone: data.user.user_metadata?.phone || '',
              email: data.user.email
            };
            await supabase.from('store_customers').upsert(fallbackProfile);
            profile = fallbackProfile as any;
          }
          onAuthed(data.user, profile);
        }
      }
    } catch (err: any) {
      setError(err.message || t('Une erreur est survenue.', 'Something went wrong.', 'حدث خطأ ما.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{t('Nom Complet', 'Full Name', 'الاسم الكامل')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('Ex: Mohammed Alaoui', 'Ex: Mohammed Alaoui', 'الاسم الكامل')}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@email.com"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{t('Numéro de Téléphone', 'Phone Number', 'رقم الهاتف')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{t('Mot de passe', 'Password', 'كلمة المرور')}</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {error && (
          <p className={`text-rose-500 text-xs font-bold flex items-center gap-1 ${storeIsAr ? 'flex-row-reverse text-right' : ''}`}>
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}

        {infoMessage && (
          <p className={`text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-50 p-3 rounded-xl ${storeIsAr ? 'flex-row-reverse text-right' : ''}`}>
            <Mail className="w-4 h-4 shrink-0" /> {infoMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          {loading
            ? t('Chargement...', 'Loading...', 'جاري التحميل...')
            : mode === 'signup'
              ? t('Créer mon compte', 'Create my account', 'إنشاء الحساب')
              : t('Se connecter', 'Sign in', 'تسجيل الدخول')}
        </button>
      </form>

      <p className="text-center text-xs font-semibold text-slate-500 mt-6">
        {mode === 'signup'
          ? t('Vous avez déjà un compte ?', 'Already have an account?', 'لديك حساب بالفعل؟')
          : t("Vous n'avez pas de compte ?", "Don't have an account?", 'ليس لديك حساب؟')}{' '}
        <button
          type="button"
          onClick={() => { setError(''); setInfoMessage(''); onModeChange(mode === 'signup' ? 'login' : 'signup'); }}
          className="text-indigo-600 font-bold hover:underline"
        >
          {mode === 'signup' ? t('Se connecter', 'Sign in', 'تسجيل الدخول') : t('Créer un compte', 'Create an account', 'إنشاء حساب')}
        </button>
      </p>
    </div>
  );
}
