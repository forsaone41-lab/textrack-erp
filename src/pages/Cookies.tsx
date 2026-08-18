import React from 'react';
import { Cookie, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

export default function Cookies() {
  const navigate = useNavigate();
  const { isAr } = useLang();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-medium transition-colors"
        >
          <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
          {isAr ? 'عودة' : 'Retour'}
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Cookie className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                {isAr ? 'سياسة ملفات تعريف الارتباط' : 'Politique des Cookies'}
              </h1>
              <p className="text-slate-500 font-medium">
                {isAr ? 'آخر تحديث: يوليو 2026' : 'Dernière mise à jour : Juillet 2026'}
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-a:text-indigo-600 space-y-8">
            {isAr ? (
              <>
                <section>
                  <h2 className="text-xl">1. ما هي ملفات تعريف الارتباط؟</h2>
                  <p className="text-slate-600 leading-relaxed">
                    ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم حفظها على جهازك عند زيارة موقعنا BEYA CREATIVE. نستخدم هذه الملفات لتحسين تجربتك، تذكر تفضيلاتك (مثل اللغة)، وتسهيل عملية تسجيل الدخول إلى لوحة التحكم الخاصة بك (Beya Portal).
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. كيف نستخدمها؟</h2>
                  <p className="text-slate-600 leading-relaxed">
                    نستخدم نوعين أساسيين من ملفات تعريف الارتباط:
                    <br/>- <strong>ملفات ضرورية:</strong> لا يمكن للمنصة العمل بدونها (مثل الحفاظ على جلسة تسجيل الدخول آمنة).
                    <br/>- <strong>ملفات تحليلية:</strong> لمساعدتنا في فهم كيفية تفاعلك مع خدماتنا وتحسين تجربة بناء المتاجر وطلب الإنتاج.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. إدارة ملفات تعريف الارتباط</h2>
                  <p className="text-slate-600 leading-relaxed">
                    يمكنك دائماً التحكم في ملفات تعريف الارتباط أو حذفها من خلال إعدادات المتصفح الخاص بك. يرجى ملاحظة أن تعطيل بعض الملفات قد يؤثر على عمل لوحة التحكم بشكل صحيح.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl">1. Que sont les cookies ?</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Les cookies sont de petits fichiers texte enregistrés sur votre appareil lorsque vous visitez notre plateforme BEYA CREATIVE. Nous les utilisons pour améliorer votre expérience, mémoriser vos préférences (comme la langue) et faciliter votre connexion à votre tableau de bord (Beya Portal).
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. Comment les utilisons-nous ?</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Nous utilisons principalement deux types de cookies :
                    <br/>- <strong>Cookies essentiels :</strong> Sans eux, la plateforme ne peut pas fonctionner (ex: maintien sécurisé de votre session).
                    <br/>- <strong>Cookies analytiques :</strong> Pour comprendre comment vous interagissez avec nos services et améliorer l'expérience de création de boutiques et de production.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. Gestion des cookies</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Vous pouvez toujours contrôler ou supprimer les cookies via les paramètres de votre navigateur. Notez que la désactivation de certains cookies peut empêcher le tableau de bord de fonctionner correctement.
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
