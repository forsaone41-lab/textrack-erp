import React from 'react';
import { Lock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

export default function Privacy() {
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
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                {isAr ? 'سياسة الخصوصية' : 'Politique de confidentialité'}
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
                  <h2 className="text-xl">1. جمع المعلومات</h2>
                  <p className="text-slate-600 leading-relaxed">
                    نحن نجمع المعلومات التي تقدمها لنا مباشرة عند استخدامك لمنصة BEYACREATIVE، بما في ذلك عند إنشاء حساب أو تحديث ملفك الشخصي أو التواصل معنا.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. استخدام المعلومات</h2>
                  <p className="text-slate-600 leading-relaxed">
                    نستخدم المعلومات التي نجمعها لتوفير وصيانة وتحسين خدماتنا، وتطوير خدمات جديدة، وحماية BEYACREATIVE ومستخدمينا.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. مشاركة المعلومات</h2>
                  <p className="text-slate-600 leading-relaxed">
                    نحن لا نشارك معلوماتك الشخصية مع شركات أو منظمات أو أفراد خارج BEYACREATIVE إلا في الحالات التالية: بموافقتك، أو لأسباب قانونية.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">4. أمن البيانات</h2>
                  <p className="text-slate-600 leading-relaxed">
                    نحن نعمل بجد لحماية BEYACREATIVE ومستخدمينا من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف للمعلومات التي نحتفظ بها.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl">1. Collecte des informations</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Nous recueillons les informations que vous nous fournissez directement lorsque vous utilisez la plateforme BEYACREATIVE, y compris lorsque vous créez un compte, mettez à jour votre profil ou communiquez avec nous.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. Utilisation des informations</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Nous utilisons les informations que nous recueillons pour fournir, maintenir et améliorer nos services, développer de nouveaux services et protéger BEYACREATIVE ainsi que nos utilisateurs.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. Partage des informations</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Nous ne partageons pas vos informations personnelles avec des entreprises, des organisations ou des personnes extérieures à BEYACREATIVE, sauf dans les cas suivants : avec votre consentement, ou pour des raisons légales.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">4. Sécurité des données</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Nous travaillons dur pour protéger BEYACREATIVE et nos utilisateurs contre l'accès non autorisé, l'altération, la divulgation ou la destruction des informations que nous détenons.
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
