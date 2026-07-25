import React from 'react';
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

export default function Terms() {
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
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                {isAr ? 'شروط الخدمة' : 'Conditions d\'utilisation'}
              </h1>
              <p className="text-slate-500 font-medium">
                {isAr ? 'آخر تحديث: يوليو 2026' : 'Dernière mise à jour : Juillet 2026'}
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-a:text-blue-600 space-y-8">
            {isAr ? (
              <>
                <section>
                  <h2 className="text-xl">1. قبول الشروط</h2>
                  <p className="text-slate-600 leading-relaxed">
                    من خلال الوصول إلى منصة BEYACREATIVE أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يجوز لك الوصول إلى الخدمة.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. وصف الخدمة</h2>
                  <p className="text-slate-600 leading-relaxed">
                    توفر BEYACREATIVE منصة لإنشاء وإدارة المتاجر الإلكترونية مع أدوات متكاملة لإدارة الطلبات والإنتاج.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. التزامات المستخدم</h2>
                  <p className="text-slate-600 leading-relaxed">
                    أنت توافق على استخدام الخدمة فقط للأغراض القانونية وبطريقة لا تنتهك حقوق أو تقيد استخدام أي طرف ثالث للخدمة.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">4. الخصوصية</h2>
                  <p className="text-slate-600 leading-relaxed">
                    يخضع استخدامك لـ BEYACREATIVE أيضاً لسياسة الخصوصية الخاصة بنا. يرجى مراجعة سياستنا لفهم ممارساتنا.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl">1. Acceptation des conditions</h2>
                  <p className="text-slate-600 leading-relaxed">
                    En accédant ou en utilisant la plateforme BEYACREATIVE, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'êtes pas d'accord avec une partie des conditions, vous ne pouvez pas accéder au service.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. Description du service</h2>
                  <p className="text-slate-600 leading-relaxed">
                    BEYACREATIVE fournit une plateforme pour créer et gérer des boutiques en ligne avec des outils intégrés de gestion des commandes et de production.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. Obligations de l'utilisateur</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Vous acceptez de n'utiliser le Service qu'à des fins légales et d'une manière qui ne viole pas les droits de, ni ne restreint ou n'empêche l'utilisation du Service par un tiers.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">4. Confidentialité</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Votre utilisation de BEYACREATIVE est également soumise à notre Politique de confidentialité. Veuillez consulter notre politique pour comprendre nos pratiques.
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
