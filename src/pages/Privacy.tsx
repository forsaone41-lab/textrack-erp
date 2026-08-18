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
                    نحن في BEYA CREATIVE نجمع المعلومات اللازمة لتقديم منظومتنا المتكاملة بفعالية. يشمل ذلك:
                    <br/>- <strong>بيانات التواصل:</strong> الاسم، رقم الهاتف، والبريد الإلكتروني عند طلب عرض سعر أو التسجيل.
                    <br/>- <strong>بيانات الإنتاج (Beya Production):</strong> تفاصيل المشاريع، المقاسات، والتصاميم التي تشاركها معنا لتصنيع ملابسك.
                    <br/>- <strong>بيانات المتاجر (Beya Store):</strong> معلومات المنتجات، والطلبيات الخاصة بمتجرك الإلكتروني الذي نستضيفه لك.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. استخدام المعلومات</h2>
                  <p className="text-slate-600 leading-relaxed">
                    نستخدم معلوماتك لضمان سير أعمالك بسلاسة داخل منظومتنا:
                    <br/>- معالجة طلبات الإنتاج وتتبع حالة التصنيع عبر (Beya Portal).
                    <br/>- إعداد وتخصيص المتاجر الإلكترونية لتتناسب مع علامتك التجارية.
                    <br/>- تقديم الدعم الفني، وإرسال تحديثات حول حالة الفواتير والشحنات.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. مشاركة وحماية البيانات</h2>
                  <p className="text-slate-600 leading-relaxed">
                    نحن نعتبر تصاميمك وبيانات عملائك (في متجرك الإلكتروني) سراً مهنياً. لا نقوم بمشاركة أي من هذه البيانات مع أطراف خارجية إلا لغرض تقديم الخدمة (مثل شركات الشحن والتوصيل). يتم تشفير قواعد البيانات وحمايتها بأحدث التقنيات لضمان خصوصيتك.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">4. حقوقك</h2>
                  <p className="text-slate-600 leading-relaxed">
                    بصفتك شريكاً أو عميلاً في منصة BEYA CREATIVE، يحق لك الوصول إلى بياناتك، طلب تعديلها، أو حذفها نهائياً من أنظمتنا عبر التواصل المباشر مع فريق الدعم الفني.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl">1. Collecte des informations</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Chez BEYA CREATIVE, nous recueillons les informations nécessaires pour fournir efficacement notre écosystème. Cela comprend :
                    <br/>- <strong>Coordonnées :</strong> Nom, téléphone et email lors de l'inscription ou d'une demande de devis.
                    <br/>- <strong>Données de production (Beya Production) :</strong> Détails de vos projets, tailles et designs partagés pour la confection.
                    <br/>- <strong>Données e-commerce (Beya Store) :</strong> Informations sur les produits et les commandes de la boutique que nous hébergeons pour vous.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">2. Utilisation des informations</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Nous utilisons vos informations pour assurer le bon fonctionnement de vos activités au sein de notre écosystème :
                    <br/>- Traitement de la production et suivi via le (Beya Portal).
                    <br/>- Création et personnalisation de votre boutique en ligne.
                    <br/>- Support technique et notifications sur l'état des factures et des livraisons.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">3. Partage et sécurité des données</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Nous considérons vos designs et les données de vos clients (sur votre boutique en ligne) comme un secret professionnel. Nous ne partageons ces données avec des tiers que pour la fourniture du service (ex: sociétés de livraison). Nos bases de données sont cryptées et sécurisées.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl">4. Vos droits</h2>
                  <p className="text-slate-600 leading-relaxed">
                    En tant que partenaire ou client de BEYA CREATIVE, vous avez le droit d'accéder, de modifier ou de demander la suppression de vos données de nos systèmes en contactant directement notre support technique.
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
