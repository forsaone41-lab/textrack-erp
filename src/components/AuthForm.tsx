import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '../supabase';

export default function AuthForm({ storeIsAr, mode, onModeChange, storeDomain, onAuthed }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

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
          setInfoMessage(storeIsAr ? 'تحقق من بريدك الإلكتروني لتأكيد حسابك.' : 'Vérifiez votre email pour confirmer votre compte.');
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
      setError(err.message || (storeIsAr ? 'حدث خطأ ما.' : 'Une erreur est survenue.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{storeIsAr ? 'الاسم الكامل' : 'Nom Complet'}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={storeIsAr ? 'الاسم الكامل' : 'Ex: Mohammed Alaoui'}
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
            <label className="block text-xs font-bold text-slate-600 mb-1">{storeIsAr ? 'رقم الهاتف' : 'Numéro de Téléphone'}</label>
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
          <label className="block text-xs font-bold text-slate-600 mb-1">{storeIsAr ? 'كلمة المرور' : 'Mot de passe'}</label>
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
            ? (storeIsAr ? 'جاري التحميل...' : 'Chargement...')
            : mode === 'signup'
              ? (storeIsAr ? 'إنشاء الحساب' : 'Créer mon compte')
              : (storeIsAr ? 'تسجيل الدخول' : 'Se connecter')}
        </button>
      </form>

      <p className="text-center text-xs font-semibold text-slate-500 mt-6">
        {mode === 'signup'
          ? (storeIsAr ? 'لديك حساب بالفعل؟' : 'Vous avez déjà un compte ?')
          : (storeIsAr ? 'ليس لديك حساب؟' : "Vous n'avez pas de compte ?")}{' '}
        <button
          type="button"
          onClick={() => { setError(''); setInfoMessage(''); onModeChange(mode === 'signup' ? 'login' : 'signup'); }}
          className="text-indigo-600 font-bold hover:underline"
        >
          {mode === 'signup' ? (storeIsAr ? 'تسجيل الدخول' : 'Se connecter') : (storeIsAr ? 'إنشاء حساب' : 'Créer un compte')}
        </button>
      </p>
    </div>
  );
}
