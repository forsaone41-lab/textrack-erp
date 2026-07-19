import React, { useState, useEffect } from 'react';
import { Plus, Settings, ExternalLink, Crown, ArrowRight, TrendingUp, Sparkles, LayoutDashboard, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';

export default function StoreManagerDashboard({ onSelectStore, onOpenAI, storeIsAr }: any) {
   const [stores, setStores] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchStores = async () => {
         try {
            const { data, error } = await supabase
               .from('stores')
               .select('*')
               .order('created_at', { ascending: false });
            
            if (data) {
               // Map real data or mix with mock stats if stats are missing
               const realStores = data.map((st: any) => ({
                  id: st.id,
                  name: st.name || 'Boutique Sans Nom',
                  url: st.domain || `${st.id}.beyacreative.com`,
                  plan: 'PRO', // SaaS defaults to PRO for now
                  status: 'Active',
                  visitors: Math.floor(Math.random() * 5000), // Mocked stats for demo
                  revenue: `${Math.floor(Math.random() * 20000)} MAD`
               }));
               // If no real stores, fallback to a mock one to show the UI
               setStores(realStores.length > 0 ? realStores : [
                  { id: 'mock1', name: 'Fashlow Maroc', url: 'fashlow.store', plan: 'PRO', status: 'Active', visitors: 1240, revenue: '12,450 MAD' }
               ]);
            } else {
                setStores([{ id: 'mock1', name: 'Fashlow Maroc', url: 'fashlow.store', plan: 'PRO', status: 'Active', visitors: 1240, revenue: '12,450 MAD' }]);
            }
         } catch (err) {
            console.warn("Supabase fetch failed", err);
            setStores([{ id: 'mock1', name: 'Fashlow Maroc', url: 'fashlow.store', plan: 'PRO', status: 'Active', visitors: 1240, revenue: '12,450 MAD' }]);
         } finally {
            setIsLoading(false);
         }
      };

      fetchStores();
   }, []);

   return (
      <div className={`max-w-6xl mx-auto w-full space-y-8 ${storeIsAr ? 'text-right' : 'text-left'}`}>
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">{storeIsAr ? 'متاجري' : 'Mes Boutiques'}</h1>
               <p className="text-slate-500 mt-1">{storeIsAr ? 'إدارة المتاجر الخاصة بك، والاشتراكات، والأدوات المتقدمة.' : 'Gérez vos boutiques, abonnements et outils avancés.'}</p>
            </div>
            <button onClick={onSelectStore} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95">
               <Plus className="w-5 h-5" />
               {storeIsAr ? 'إنشاء متجر جديد' : 'Créer une boutique'}
            </button>
         </div>

         {/* PRO Assistant Banner */}
         <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                     <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20">
                        <Crown className="w-3 h-3" /> Plan PRO
                     </span>
                     <span className="text-indigo-200 text-sm font-medium">{storeIsAr ? 'أدوات حصرية' : 'Outils Exclusifs'}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                     {storeIsAr ? 'اكتشف المنتجات المربحة مع المساعد الذكي' : 'Trouvez les produits gagnants avec notre Assistant'}
                  </h2>
                  <p className="text-indigo-100/80 mb-6 max-w-xl text-lg">
                     {storeIsAr 
                        ? 'ميزة حصرية للمشتركين في خطة PRO. قم بتحليل السوق المغربي، اعرف أسعار المنافسين، واكتشف مجالات (Niches) مربحة قبل الجميع.'
                        : 'Fonctionnalité exclusive au plan PRO. Analysez le marché marocain, découvrez les prix des concurrents et trouvez des niches rentables.'}
                  </p>
                  <button onClick={onOpenAI} className="flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 group">
                     <Sparkles className="w-5 h-5 text-indigo-600" />
                     {storeIsAr ? 'إطلاق المساعد الخبير' : 'Lancer l\'Assistant PRO'}
                     <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
               
               <div className="hidden md:block shrink-0 relative">
                  <div className="w-48 h-48 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-2xl absolute inset-0 opacity-50 animate-pulse"></div>
                  <div className="w-48 h-48 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl relative z-10 flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                     <TrendingUp className="w-24 h-24 text-amber-400" />
                  </div>
               </div>
            </div>
         </div>

         {/* Store List */}
         <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{storeIsAr ? 'متاجرك الحالية' : 'Vos Boutiques'}</h3>
            
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">{storeIsAr ? 'جاري تحميل المتاجر...' : 'Chargement des boutiques...'}</p>
               </div>
            ) : (
               <div className="grid md:grid-cols-2 gap-6">
                  {stores.map(store => (
                     <div key={store.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                 <LayoutDashboard className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-slate-900">{store.name}</h4>
                                 <a href={`https://${store.url}`} target="_blank" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-1 transition-colors">
                                    {store.url} <ExternalLink className="w-3 h-3" />
                                 </a>
                              </div>
                           </div>
                           {store.plan === 'PRO' ? (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                 <Crown className="w-3 h-3" /> PRO
                              </span>
                           ) : (
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-amber-100 hover:text-amber-700 transition-colors" title={storeIsAr ? 'قم بالترقية إلى PRO' : 'Passer au PRO'}>
                                 NORMAL
                              </span>
                           )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'الزوار (30 يوم)' : 'Visiteurs (30j)'}</p>
                              <p className="text-xl font-black text-slate-900">{store.visitors.toLocaleString()}</p>
                           </div>
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'المبيعات' : 'Chiffre d\'Affaires'}</p>
                              <p className="text-xl font-black text-slate-900">{store.revenue}</p>
                           </div>
                        </div>
                        
                        <div className="flex gap-3">
                           <button onClick={onSelectStore} className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors active:scale-95">
                              {storeIsAr ? 'إدارة المتجر' : 'Gérer la boutique'}
                           </button>
                           <button onClick={onSelectStore} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors active:scale-95">
                              <Settings className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}

