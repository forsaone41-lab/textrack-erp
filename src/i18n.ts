export type Lang = 'fr' | 'ar';

export const T = {
  // Brand
  erp_subtitle:        { fr: 'ERP Textile',               ar: 'نظام إدارة النسيج' },

  // Nav labels
  dashboard:           { fr: 'Tableau de bord',           ar: 'لوحة التحكم' },
  fiches:              { fr: 'Fiches Techniques',          ar: 'البطاقات التقنية' },
  ordres:              { fr: 'Ordres de Coupe',            ar: 'أوامر القطع' },
  chaine:              { fr: 'Chaîne de Montage',          ar: 'خط التجميع' },
  stocks:              { fr: 'Stock Matériaux',            ar: 'مخزون المواد' },
  rh:                  { fr: 'Suivi RH & Façonniers',      ar: 'الموارد البشرية' },
  commandes:           { fr: 'Commandes',                  ar: 'الطلبيات' },
  factures:            { fr: 'Factures',                   ar: 'الفواتير' },
  charges:             { fr: 'Charges & Dépenses',         ar: 'المصاريف والنفقات' },
  pointage:            { fr: 'Pointage Présences',         ar: 'الحضور والغياب' },
  portail_client:      { fr: 'Portail Client',             ar: 'بوابة الزبون' },
  performance:         { fr: 'Performance Ouvriers',       ar: 'أداء العمال' },
  utilisateurs:        { fr: 'Gestion Utilisateurs',       ar: 'إدارة المستخدمين' },

  bilan:               { fr: 'Bilan Financier',            ar: 'الملخص المالي' },

  // Section headers
  section_production:  { fr: 'Gestion de Production',     ar: 'إدارة الإنتاج' },
  section_stocks:      { fr: 'Gestion des Stocks',        ar: 'إدارة المخزون' },
  section_finance:     { fr: 'Gestion Financière',        ar: 'الإدارة المالية' },

  // Auth / user
  deconnexion:         { fr: 'Déconnexion',               ar: 'تسجيل الخروج' },
  role_admin:          { fr: 'Admin',                     ar: 'مدير' },
  role_chef:           { fr: 'Chef',                      ar: 'مشرف' },
  role_client:         { fr: 'Client',                    ar: 'زبون' },

  // Common actions
  new:                 { fr: 'Nouveau',                   ar: 'جديد' },
  save:                { fr: 'Enregistrer',               ar: 'حفظ' },
  cancel:              { fr: 'Annuler',                   ar: 'إلغاء' },
  delete:              { fr: 'Supprimer',                 ar: 'حذف' },
  edit:                { fr: 'Modifier',                  ar: 'تعديل' },
  search:              { fr: 'Rechercher...',              ar: 'بحث...' },
  all:                 { fr: 'Tous',                      ar: 'الكل' },
  close:               { fr: 'Fermer',                    ar: 'إغلاق' },
  confirm_delete:      { fr: 'Supprimer ?',               ar: 'تأكيد الحذف؟' },
  irreversible:        { fr: 'Cette action est irréversible.', ar: 'هذا الإجراء لا يمكن التراجع عنه.' },
  no_data:             { fr: 'Aucune donnée',             ar: 'لا توجد بيانات' },

  // Pages — Factures
  factures_title:      { fr: 'Factures',                  ar: 'الفواتير' },
  factures_subtitle:   { fr: 'facture(s) enregistrée(s)', ar: 'فاتورة مسجلة' },
  new_facture:         { fr: 'Nouvelle Facture',          ar: 'فاتورة جديدة' },
  total_facture:       { fr: 'Total Facturé',             ar: 'إجمالي الفواتير' },
  payees:              { fr: 'Payées',                    ar: 'مدفوعة' },
  en_attente:          { fr: 'En Attente',                ar: 'في الانتظار' },
  en_retard:           { fr: 'En Retard',                 ar: 'متأخرة' },
  statut_payee:        { fr: 'Payée',                     ar: 'مدفوعة' },
  statut_attente:      { fr: 'En attente',                ar: 'في الانتظار' },
  statut_impayee:      { fr: 'Impayée',                   ar: 'غير مدفوعة' },
  statut_retard:       { fr: 'En retard',                 ar: 'متأخرة' },
  mark_paid:           { fr: '✓ Marquer Payée',           ar: '✓ تسجيل كمدفوعة' },
  num_facture:         { fr: 'N° Facture',                ar: 'رقم الفاتورة' },
  client:              { fr: 'Client',                    ar: 'الزبون' },
  commande_liee:       { fr: 'Commande',                  ar: 'الطلبية' },
  montant:             { fr: 'Montant',                   ar: 'المبلغ' },
  date_emission:       { fr: 'Émission',                  ar: 'تاريخ الإصدار' },
  date_echeance:       { fr: 'Échéance',                  ar: 'تاريخ الاستحقاق' },
  statut:              { fr: 'Statut',                    ar: 'الحالة' },
  actions:             { fr: 'Actions',                   ar: 'إجراءات' },

  // Pages — Commandes
  commandes_title:     { fr: 'Gestion des Commandes',     ar: 'إدارة الطلبيات' },
  new_commande:        { fr: 'Nouvelle Commande',         ar: 'طلبية جديدة' },
  ca_total:            { fr: "Chiffre d'Affaires",        ar: 'رقم الأعمال' },
  en_cours:            { fr: 'En Cours',                  ar: 'جارية' },
  livrees:             { fr: 'Livrées',                   ar: 'مسلّمة' },
  en_retard_cmd:       { fr: 'En Retard',                 ar: 'متأخرة' },
  reference:           { fr: 'Référence',                 ar: 'المرجع' },
  client_modele:       { fr: 'Client / Modèle',           ar: 'الزبون / النموذج' },
  quantite:            { fr: 'Quantité',                  ar: 'الكمية' },
  avancement:          { fr: 'Avancement',                ar: 'التقدم' },
  phase:               { fr: 'Phase',                     ar: 'المرحلة' },
  valeur:              { fr: 'Valeur',                    ar: 'القيمة' },
  livraison:           { fr: 'Livraison',                 ar: 'التسليم' },
  liens:               { fr: 'Liens',                     ar: 'الروابط' },
  calc_tissu:          { fr: 'Calcul Tissu',              ar: 'حساب القماش' },
  generer_facture:     { fr: 'Générer Facture',           ar: 'إنشاء فاتورة' },
  login_title:         { fr: 'Connexion',                 ar: 'تسجيل الدخول' },
  login_email:         { fr: 'Adresse e-mail',            ar: 'البريد الإلكتروني' },
  login_password:      { fr: 'Mot de passe',              ar: 'كلمة المرور' },
  login_btn:           { fr: 'Se connecter',              ar: 'دخول' },
  login_error:         { fr: 'Email ou mot de passe incorrect', ar: 'البريد أو كلمة المرور غير صحيحة' },
} as const;

export type TKey = keyof typeof T;

export function t(key: TKey, lang: Lang): string {
  return T[key][lang];
}
