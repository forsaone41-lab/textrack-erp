import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, ShoppingBag, Plus, Bell, Settings, LogOut, ChevronRight, BarChart3, TrendingUp, Users, Smartphone, Zap } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

interface MerchantDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function MerchantDashboard({ currentUser, onLogout }: MerchantDashboardProps) {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir={isAr ? 'rtl' : 'ltr'}>
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
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">{currentUser?.nom || 'Merchant'}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Gérant de boutique</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer border-2 border-white">
                  {currentUser?.nom?.charAt(0).toUpperCase() || 'M'}
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Déconnexion"
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
        
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">
            {isAr ? `مرحباً، ${currentUser?.nom}` : `Bonjour, ${currentUser?.nom}`}
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            {isAr ? 'ماذا تريد أن تفعل اليوم؟' : 'Que souhaitez-vous faire aujourd\'hui ?'}
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
                {isAr ? 'تعديل متجري' : 'Gérer ma boutique'}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                {isAr 
                  ? 'قم بتخصيص تصميم متجرك، أضف منتجات، وعدّل الإعدادات.' 
                  : 'Personnalisez le design, ajoutez des produits et gérez vos paramètres.'}
              </p>
              <div className="flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                {isAr ? 'فتح المحرر' : 'Ouvrir l\'éditeur'} <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Action: Request Production */}
          <div 
            onClick={() => alert(isAr ? 'قريباً: تقديم طلب تصنيع منتجات جديدة' : 'Bientôt : Demander la production de nouveaux articles')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-100/50"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isAr ? 'طلب تصنيع سلع' : 'Demander une production'}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                {isAr 
                  ? 'اطلب تصنيع ملابس جديدة لمتجرك مباشرة من مصنع BEYA.' 
                  : 'Commandez la fabrication de nouveaux vêtements directement depuis l\'usine BEYA.'}
              </p>
              <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                {isAr ? 'إنشاء طلب جديد' : 'Créer une demande'} <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Action: Track Orders */}
          <div 
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-blue-100/50"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isAr ? 'طلبيات الزبناء' : 'Commandes clients'}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                {isAr 
                  ? 'تتبع مبيعاتك، تجهيز الطلبيات وإدارتها بكل سهولة.' 
                  : 'Suivez vos ventes, préparez et gérez les commandes facilement.'}
              </p>
              <div className="flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                {isAr ? 'عرض الطلبيات' : 'Voir les commandes'} <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

        </div>

        {/* Quick Stats Placeholder */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isAr ? 'نظرة عامة على متجرك' : 'Aperçu de votre boutique'}
            </h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
              {isAr ? 'عرض التفاصيل' : 'Voir les détails'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'المبيعات' : 'Ventes'}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">0.00 MAD</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'الطلبات' : 'Commandes'}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">0</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'الزوار' : 'Visiteurs'}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">0</div>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'معدل التحويل' : 'Taux Conv.'}</span>
              </div>
              <div className="text-2xl font-black text-slate-900">0%</div>
            </div>
          </div>

          {/* Getting Started Banner */}
          <div className="mt-8 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-500/20 p-2 rounded-xl">
                  <Zap className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isAr ? 'أكمل إعداد متجرك' : 'Finalisez votre boutique'}
                </h3>
              </div>
              <p className="text-indigo-200 text-sm max-w-xl font-medium">
                {isAr 
                  ? 'متجرك قيد الإنشاء. قم بإضافة منتجاتك، تعديل الألوان، والبدء في استقبال الطلبات اليوم.' 
                  : 'Votre boutique est en cours de création. Ajoutez vos produits, personnalisez les couleurs et commencez à vendre aujourd\'hui.'}
              </p>
            </div>
            <div className="relative z-10 w-full md:w-auto">
              <button 
                onClick={() => navigate('/store-builder')}
                className="w-full md:w-auto px-8 py-3.5 bg-white text-indigo-900 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-xl flex items-center justify-center gap-2"
              >
                {isAr ? 'متابعة التصميم' : 'Continuer le design'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}