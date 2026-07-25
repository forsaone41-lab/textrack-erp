import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, ShoppingBag, Plus, Bell, Settings, LogOut, ChevronRight, BarChart3, TrendingUp, Users, Smartphone, Zap, X, Send, Crown } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../supabase';

interface MerchantDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function MerchantDashboard({ currentUser, onLogout }: MerchantDashboardProps) {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [dashLang, setDashLang] = useState<'fr' | 'en' | 'ar'>(() => (localStorage.getItem('beya_dash_lang') as any) || (isAr ? 'ar' : 'fr'));
  const isArDash = dashLang === 'ar';
  const setLang = (l: 'fr' | 'en' | 'ar') => {
    localStorage.setItem('beya_dash_lang', l);
    setDashLang(l);
  };
  const t = (fr: string, en: string, ar: string) => (dashLang === 'ar' ? ar : dashLang === 'en' ? en : fr);

  const [showProductionModal, setShowProductionModal] = useState(false);
  const [prodForm, setProdForm] = useState({ category: '', quantity: '50', targetPrice: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeCount, setStoreCount] = useState<number | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ 
    nom: currentUser?.nom || '', 
    telephone: currentUser?.telephone || '',
    password: '' 
  });
  const [storeStats, setStoreStats] = useState({ visitors: 0, revenue: 0, orders: 0, convRate: 0 });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  React.useEffect(() => {
     if(currentUser?.id) {
       supabase.from('stores')
         .select('config_json, created_at')
         .eq('config_json->>owner_id', currentUser.id)
         .then(({data, error}) => {
            if (data && data.length > 0) {
               setStoreCount(data.length);
               if (data[0].created_at) {
                  const createdAt = new Date(data[0].created_at);
                  const diffDays = Math.floor(Math.abs(new Date() - createdAt) / (1000 * 60 * 60 * 24));
                  setTrialDaysLeft(Math.max(0, 14 - diffDays));
               }
               let totalVisitors = 0;
               let totalRevenue = 0;
               let totalOrders = 0;
               
               data.forEach(st => {
                 const stats = st.config_json?.stats || {};
                 totalVisitors += (parseInt(stats.visitors) || 0);
                 totalRevenue += (parseFloat(stats.revenue) || 0);
                 totalOrders += (parseInt(stats.orders) || 0);
               });
               
               const convRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : 0;
               
               setStoreStats({
                 visitors: totalVisitors,
                 revenue: totalRevenue,
                 orders: totalOrders,
                 convRate: parseFloat(convRate as string)
               });
            } else {
               setStoreCount(0);
            }
         });
     }
  }, [currentUser]);

  const handleProductionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('demandes').insert({
        client: currentUser?.nom || 'Merchant',
        telephone: currentUser?.telephone || '',
        article: prodForm.category,
        quantite: parseInt(prodForm.quantity) || 50,
        budget_unitaire: prodForm.targetPrice,
        notes: prodForm.description,
        source: 'Dashboard Merchant'
      });
      if (error) throw error;
      
      alert(t('Votre demande a été envoyée avec succès ! L\'usine vous contactera bientôt.', 'Your request was sent successfully! The factory will contact you soon.', 'تم إرسال طلبك بنجاح! سيتواصل معك المصنع قريباً.'));
      setShowProductionModal(false);
      setProdForm({ category: '', quantity: '50', targetPrice: '', description: '' });
    } catch (err: any) {
      alert(t('Erreur: ', 'Error: ', 'حدث خطأ: ') + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updates: any = { data: { full_name: profileForm.nom, phone: profileForm.telephone } };
      if (profileForm.password) {
        updates.password = profileForm.password;
      }
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      alert(t('Profil mis à jour avec succès', 'Profile updated successfully', 'تم تحديث الملف الشخصي بنجاح'));
      setShowProfileModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(t('Erreur: ', 'Error: ', 'حدث خطأ: ') + err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir={isArDash ? 'rtl' : 'ltr'}>
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">BEYACREATIVE</span>
                <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">STORES</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 rounded-full p-1 gap-0.5">
                {(['fr', 'en', 'ar'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${dashLang === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 px-3 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                  title={t('Modifier le profil', 'Edit Profile', 'تعديل الملف الشخصي')}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none">{currentUser?.nom || 'Merchant'}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">{t('Gérant de boutique', 'Store Manager', 'مسير المتجر')}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                    {currentUser?.nom?.charAt(0).toUpperCase() || 'M'}
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors ml-1 bg-slate-50 hover:bg-rose-50 rounded-xl"
                  title={t('Déconnexion', 'Log out', 'تسجيل الخروج')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        
        {/* Trial Banner */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                 <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                 <h3 className="font-bold text-amber-900">{isAr ? 'فترة تجريبية مجانية' : 'Essai Gratuit'}</h3>
                 <p className="text-sm font-medium text-amber-700">
                    {isAr ? `متبقي ${trialDaysLeft} أيام في فترتك التجريبية.` : `Il vous reste ${trialDaysLeft} jours d'essai.`}
                 </p>
              </div>
           </div>
           <button onClick={() => setShowUpgradeModal(true)} className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap shadow-md shadow-amber-500/20">
              {isAr ? 'ترقية الحساب الآن' : 'Mettre à niveau'}
           </button>
        </div>

        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">
            {t(`Bonjour, ${currentUser?.nom}`, `Hello, ${currentUser?.nom}`, `مرحباً، ${currentUser?.nom}`)}
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            {t('Que souhaitez-vous faire aujourd\'hui ?', 'What would you like to do today?', 'ماذا تريد أن تفعل اليوم؟')}
          </p>
        </div>

        {/* Primary Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Action: Edit Store */}
          <div 
            onClick={() => navigate('/store-builder')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-100/50"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t('Gérer ma boutique', 'Manage my store', 'تعديل متجري')}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                {t(
                  'Personnalisez le design, ajoutez des produits et gérez vos paramètres.',
                  'Customize the design, add products and manage your settings.',
                  'قم بتخصيص تصميم متجرك، أضف منتجات، وعدّل الإعدادات.'
                )}
              </p>
              <div className="flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                {t('Ouvrir l\'éditeur', 'Open the editor', 'فتح المحرر')} <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Action: Request Production */}
          <div 
            onClick={() => window.location.hash = '#/portal'}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-100/50"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t('Demander une production', 'Request a production', 'طلب تصنيع سلع')}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                {t(
                  'Commandez la fabrication de nouveaux vêtements directement depuis l\'usine BEYA.',
                  'Order the manufacturing of new garments directly from the BEYA factory.',
                  'اطلب تصنيع ملابس جديدة لمتجرك مباشرة من مصنع BEYA.'
                )}
              </p>
              <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                {t('Créer une demande', 'Create a request', 'إنشاء طلب جديد')} <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Action: Track Orders */}
          <div 
            onClick={() => alert(t('Cette fonctionnalité sera bientôt disponible.', 'This feature will be available soon.', 'هذه الخاصية قيد التطوير وستكون متاحة قريباً!'))}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-blue-100/50"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t('Commandes clients', 'Customer orders', 'طلبيات الزبناء')}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                {t(
                  'Suivez vos ventes, préparez et gérez les commandes facilement.',
                  'Track your sales, prepare and manage orders easily.',
                  'تتبع مبيعاتك، تجهيز الطلبيات وإدارتها بكل سهولة.'
                )}
              </p>
              <div className="flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                {t('Voir les commandes', 'View orders', 'عرض الطلبيات')} <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

        </div>

        {/* Quick Stats Placeholder */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t('Aperçu de votre boutique', 'Store overview', 'نظرة عامة على متجرك')}
            </h2>
            <button 
              onClick={() => alert(t('Cette fonctionnalité sera bientôt disponible.', 'This feature will be available soon.', 'هذه الخاصية قيد التطوير وستكون متاحة قريباً!'))}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              {t('Voir les détails', 'View details', 'عرض التفاصيل')}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Ventes', 'Sales', 'المبيعات')}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{storeStats.revenue.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MAD</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Commandes', 'Orders', 'الطلبات')}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{storeStats.orders.toLocaleString()}</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Visiteurs', 'Visitors', 'الزوار')}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{storeStats.visitors.toLocaleString()}</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Taux Conv.', 'Conv. Rate', 'معدل التحويل')}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{storeStats.convRate}%</div>
            </div>
          </div>

          {/* Getting Started Banner */}
          <div className="mt-8 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-500/20 p-2 rounded-xl">
                  {storeCount && storeCount > 0 ? (
                     <Store className="w-5 h-5 text-indigo-300" />
                  ) : (
                     <Zap className="w-5 h-5 text-indigo-300" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {storeCount && storeCount > 0 
                     ? t('Votre boutique est prête', 'Your store is ready', 'متجرك جاهز للعمل')
                     : t('Finalisez votre boutique', 'Finish setting up your store', 'أكمل إعداد متجرك')
                  }
                </h3>
              </div>
              <p className="text-indigo-200 text-sm max-w-xl font-medium">
                {storeCount && storeCount > 0 
                   ? t(
                      'Votre boutique est maintenant en ligne. Suivez vos analyses de visiteurs et de ventes pour développer votre activité.',
                      'Your store is now online. Track visitor and sales analytics to grow your business.',
                      'متجرك الآن متصل بالإنترنت. قم بمتابعة تحليلات الزوار والمبيعات لتنمية أعمالك وتحليل الأداء.'
                     )
                   : t(
                      'Votre boutique est en cours de création. Ajoutez vos produits, personnalisez les couleurs et commencez à vendre aujourd\'hui.',
                      'Your store is being set up. Add your products, customize the colors and start selling today.',
                      'متجرك قيد الإنشاء. قم بإضافة منتجاتك، تعديل الألوان، والبدء في استقبال الطلبات اليوم.'
                     )
                }
              </p>
            </div>
            <div className="relative z-10 w-full md:w-auto">
              <button
                onClick={() => navigate('/store-builder')}
                className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-black text-sm transition-colors shadow-xl flex items-center justify-center gap-2 ${
                  storeCount && storeCount > 0 
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-white text-indigo-900 hover:bg-indigo-50'
                }`}
              >
                {storeCount && storeCount > 0
                   ? t('Gérer & Analyser', 'Manage & Analyze', 'إدارة وتحليل المتجر')
                   : t('Continuer le design', 'Continue designing', 'متابعة التصميم')
                }
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Production Request Modal */}
      {showProductionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                    {t('Nouvelle Demande de Production', 'New Production Request', 'طلب تصنيع جديد')}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {t('Entrez les détails des vêtements que vous souhaitez fabriquer.', 'Enter the details of the garments you want to manufacture.', 'أدخل تفاصيل الملابس التي تريد تصنيعها لمتجرك.')}
                  </p>
                </div>
                <button 
                  onClick={() => setShowProductionModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductionRequest} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('Type de vêtement (Modèle)', 'Garment type (Model)', 'نوع الملابس (الموديل)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.category}
                    onChange={e => setProdForm({...prodForm, category: e.target.value})}
                    placeholder={t('ex: T-shirt Oversize, Abaya...', 'ex: Oversize T-shirt, Abaya...', 'مثال: تيشرت أوفر سايز، عباية...')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t('Quantité estimée', 'Estimated quantity', 'الكمية التقريبية')}
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={prodForm.quantity}
                      onChange={e => setProdForm({...prodForm, quantity: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t('Prix cible (Unité)', 'Target price (Unit)', 'السعر المستهدف (للقطعة)')}
                    </label>
                    <input
                      type="text"
                      value={prodForm.targetPrice}
                      onChange={e => setProdForm({...prodForm, targetPrice: e.target.value})}
                      placeholder="ex: 120 MAD"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('Notes / Détails', 'Notes / Details', 'ملاحظات / تفاصيل أخرى')}
                  </label>
                  <textarea
                    rows={4}
                    value={prodForm.description}
                    onChange={e => setProdForm({...prodForm, description: e.target.value})}
                    placeholder={t('Couleurs, tailles, type de tissu...', 'Colors, sizes, fabric type...', 'ألوان، مقاسات، نوع الثوب...')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-900 resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowProductionModal(false)}
                    className="px-6 py-3.5 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {t('Annuler', 'Cancel', 'إلغاء')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t('Envoi...', 'Sending...', 'جاري الإرسال...') : t('Envoyer la demande', 'Send the request', 'إرسال الطلب')}
                    {!isSubmitting && <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-6 md:p-8 bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex items-start justify-between relative z-10">
                  <div>
                     <h2 className="text-3xl font-black mb-2">{isAr ? 'اختر الباقة المناسبة لك' : 'Choisissez votre forfait'}</h2>
                     <p className="text-slate-400 font-medium">{isAr ? 'قم بترقية حسابك للوصول إلى كافة المزايا.' : 'Mettez à niveau votre compte pour accéder à toutes les fonctionnalités.'}</p>
                  </div>
                  <button onClick={() => setShowUpgradeModal(false)} className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md">
                     <X className="w-5 h-5" />
                  </button>
               </div>
            </div>
            
            <div className="p-6 md:p-8">
               <div className="grid md:grid-cols-2 gap-6">
                  {/* PRO Plan */}
                  <div className="border-2 border-slate-200 hover:border-indigo-500 rounded-3xl p-6 transition-all relative group flex flex-col">
                     <h3 className="text-xl font-black text-slate-900 mb-1">PRO</h3>
                     <div className="flex items-end gap-1 mb-4">
                        <span className="text-4xl font-black text-slate-900">299</span>
                        <span className="text-slate-500 font-bold mb-1">MAD / {isAr ? 'شهر' : 'mois'}</span>
                     </div>
                     <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div> {isAr ? 'متجر إلكتروني احترافي' : 'Boutique professionnelle'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div> {isAr ? 'منتجات غير محدودة' : 'Produits illimités'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div> {isAr ? 'دعم فني عادي' : 'Support standard'}</li>
                     </ul>
                     <a href="https://wa.me/212600000000?text=Je%20veux%20passer%20au%20plan%20PRO" target="_blank" rel="noreferrer" className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-center hover:bg-indigo-600 transition-colors block">
                        {isAr ? 'اختيار باقة PRO' : 'Choisir le plan PRO'}
                     </a>
                  </div>
                  
                  {/* PREMIUM Plan */}
                  <div className="border-2 border-amber-400 bg-amber-50/30 rounded-3xl p-6 transition-all relative flex flex-col shadow-lg shadow-amber-500/10">
                     <div className="absolute -top-4 right-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                        {isAr ? 'الأكثر طلباً' : 'Populaire'}
                     </div>
                     <h3 className="text-xl font-black text-amber-600 mb-1 flex items-center gap-2"><Crown className="w-5 h-5" /> PREMIUM</h3>
                     <div className="flex items-end gap-1 mb-4">
                        <span className="text-4xl font-black text-slate-900">499</span>
                        <span className="text-slate-500 font-bold mb-1">MAD / {isAr ? 'شهر' : 'mois'}</span>
                     </div>
                     <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><div className="w-2 h-2 bg-amber-500 rounded-full"></div></div> {isAr ? 'كل مزايا PRO' : 'Tous les avantages PRO'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><div className="w-2 h-2 bg-amber-500 rounded-full"></div></div> {isAr ? 'أولوية في التصنيع' : 'Priorité de production'}</li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><div className="w-2 h-2 bg-amber-500 rounded-full"></div></div> {isAr ? 'مدير حساب شخصي' : 'Account manager dédié'}</li>
                     </ul>
                     <a href="https://wa.me/212600000000?text=Je%20veux%20passer%20au%20plan%20PREMIUM" target="_blank" rel="noreferrer" className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-center hover:opacity-90 transition-opacity shadow-md shadow-amber-500/25 block">
                        {isAr ? 'اختيار باقة PREMIUM' : 'Choisir le plan PREMIUM'}
                     </a>
                  </div>
               </div>
               
               <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h4 className="font-black text-slate-900 mb-4 text-center">{isAr ? 'طرق الدفع المتاحة (المغرب)' : 'Moyens de paiement (Maroc)'}</h4>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium text-slate-600">
                     <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        🏦 Virement Bancaire (CIH, Attijari, etc.)
                     </div>
                     <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        💸 Cash Plus / Wafacash
                     </div>
                  </div>
                  <p className="text-xs text-center text-slate-500 mt-4 max-w-lg mx-auto">
                     {isAr 
                        ? 'بعد اختيار الباقة، سيتم توجيهك إلى واتساب لتأكيد طلبك. سيتم تفعيل حسابك فور إرسال صورة وصل الدفع (Reçu).'
                        : 'Après avoir choisi votre plan, vous serez redirigé vers WhatsApp pour confirmer. Votre compte sera activé dès l\'envoi du reçu.'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}


      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                    {t('Mon Profil', 'My Profile', 'الملف الشخصي')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('Modifiez vos informations.', 'Edit your info.', 'تعديل معلومات حسابك.')}
                  </p>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('Nom complet', 'Full name', 'الاسم الكامل')}
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.nom}
                    onChange={e => setProfileForm({...profileForm, nom: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('Téléphone', 'Phone', 'رقم الهاتف')}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.telephone}
                    onChange={e => setProfileForm({...profileForm, telephone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('Nouveau mot de passe', 'New password', 'كلمة السر الجديدة')}
                  </label>
                  <input
                    type="password"
                    placeholder={t('(Optionnel)', '(Optional)', '(اختياري)')}
                    value={profileForm.password}
                    onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-900"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full px-6 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isUpdatingProfile ? t('Enregistrement...', 'Saving...', 'جاري الحفظ...') : t('Enregistrer', 'Save', 'حفظ التغييرات')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}