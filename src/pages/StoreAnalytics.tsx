import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, TrendingUp, Users, Package, Crown, Loader2, Megaphone } from 'lucide-react';
import { supabase } from '../supabase';

interface StoreAnalyticsProps {
  currentUser: any;
}

export default function StoreAnalytics({ currentUser }: StoreAnalyticsProps) {
  const navigate = useNavigate();
  const [dashLang, setDashLang] = useState<'fr' | 'en' | 'ar'>(() => (localStorage.getItem('beya_dash_lang') as any) || 'fr');
  const t = (fr: string, en: string, ar: string) => (dashLang === 'ar' ? ar : dashLang === 'en' ? en : fr);
  const isAr = dashLang === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [topClients, setTopClients] = useState<{ name: string; phone: string; orders: number; total: number }[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const authUser = sessionData?.session?.user;
        const email = (authUser?.email || currentUser?.email || '').toLowerCase();
        const userId = authUser?.id || currentUser?.id;
        const isAdmin = email === '00.emaily.zero@gmail.com' || email === 'fashlow@gmail.com' || currentUser?.role === 'admin';

        const { data: allStores } = await supabase.from('stores').select('name, domain, config_json');
        const myStores = isAdmin
          ? (allStores || [])
          : (allStores || []).filter((s: any) => {
              const ownerEmail = (s.config_json?.owner_email || '').toLowerCase();
              return (email && ownerEmail === email) || (userId && s.config_json?.owner_id === userId);
            });
        const storeNames = [...new Set(myStores.map((s: any) => s.name).filter(Boolean))];

        if (storeNames.length === 0) {
          setTotalRevenue(0);
          setTotalOrders(0);
          setTopProducts([]);
          setTopClients([]);
          return;
        }

        const orClause = storeNames.map(n => `tissu.ilike.Store: ${n}%`).join(',');
        const { data: commandes } = await supabase
          .from('commandes')
          .select('modele, quantite, prix, client, tissu, statut')
          .or(orClause);

        const rows = (commandes || []).filter((c: any) => {
          const st = (c.statut || '').toLowerCase();
          return !['annulée', 'annulation_demandee', 'refusé', 'refusée'].includes(st);
        });

        let revenue = 0;
        const productMap: Record<string, { qty: number; revenue: number }> = {};
        const clientMap: Record<string, { phone: string; orders: number; total: number }> = {};

        rows.forEach((c: any) => {
          const price = parseFloat(c.prix) || 0;
          const qty = parseInt(c.quantite) || 1;
          revenue += price;

          const productName = c.modele || t('Produit sans nom', 'Unnamed product', 'منتج بدون اسم');
          if (!productMap[productName]) productMap[productName] = { qty: 0, revenue: 0 };
          productMap[productName].qty += qty;
          productMap[productName].revenue += price;

          const clientRaw = c.client || '';
          const phoneMatch = clientRaw.match(/ - (\S+)$/);
          const clientPhone = phoneMatch ? phoneMatch[1] : '';
          const clientName = (phoneMatch ? clientRaw.slice(0, phoneMatch.index) : clientRaw).trim() || t('Client inconnu', 'Unknown client', 'زبون غير معروف');
          const clientKey = clientPhone || clientName;
          if (!clientMap[clientKey]) clientMap[clientKey] = { phone: clientPhone, orders: 0, total: 0 };
          clientMap[clientKey].orders += 1;
          clientMap[clientKey].total += price;
        });

        setTotalRevenue(revenue);
        setTotalOrders(rows.length);
        setTopProducts(
          Object.entries(productMap)
            .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5)
        );
        setTopClients(
          Object.entries(clientMap)
            .map(([key, v]) => ({ name: key, phone: v.phone, orders: v.orders, total: v.total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
        );
      } catch (err) {
        console.error('Failed to load store analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-50" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`flex items-center gap-4 mb-8 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => navigate('/')}
            className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('Statistiques de vente', 'Sales Analytics', 'إحصائيات المبيعات')}
            </h1>
            <p className="text-slate-500 mt-1">
              {t('Vue d\'ensemble de vos ventes, meilleurs produits et meilleurs clients.', 'An overview of your sales, best products and best customers.', 'نظرة شاملة على مبيعاتك، أفضل منتجاتك، وأفضل زبنائك.')}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">{t('Chargement des statistiques...', 'Loading analytics...', 'جاري تحميل الإحصائيات...')}</p>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Ventes Totales', 'Total Sales', 'إجمالي المبيعات')}</p>
                <p className="text-2xl font-black text-slate-900">{totalRevenue.toLocaleString('fr-FR')} <span className="text-sm text-slate-400">MAD</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Commandes', 'Orders', 'الطلبات')}</p>
                <p className="text-2xl font-black text-slate-900">{totalOrders}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                  <Package className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Panier Moyen', 'Avg. Order', 'متوسط الطلب')}</p>
                <p className="text-2xl font-black text-slate-900">{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('fr-FR') : 0} <span className="text-sm text-slate-400">MAD</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Clients', 'Customers', 'الزبناء')}</p>
                <p className="text-2xl font-black text-slate-900">{topClients.length > 0 ? new Set(topClients.map(c => c.name)).size : 0}+</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Top Products */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-5 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-500" /> {t('Produits les plus vendus', 'Best Selling Products', 'المنتجات الأكثر مبيعاً')}
                </h3>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">{t('Pas encore de ventes', 'No sales yet', 'لا توجد مبيعات بعد')}</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${idx === 0 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.qty} {t('vendus', 'sold', 'مباع')} · {p.revenue.toLocaleString('fr-FR')} MAD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Clients */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-5 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" /> {t('Meilleurs clients', 'Top Customers', 'أفضل الزبناء')}
                </h3>
                {topClients.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">{t('Pas encore de clients', 'No customers yet', 'لا يوجد زبناء بعد')}</p>
                ) : (
                  <div className="space-y-3">
                    {topClients.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${idx === 0 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.orders} {t('commande(s)', 'order(s)', 'طلب')}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-emerald-600 shrink-0">{c.total.toLocaleString('fr-FR')} MAD</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Affiliate / Marketer performance - placeholder for future data */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Megaphone className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">
                    {t('Bientôt disponible', 'Coming soon', 'قريباً')}
                  </span>
                  <h3 className="text-lg font-black mb-1">
                    {t('Performance des marketeurs et affiliés', 'Marketer & affiliate performance', 'أداء المسوقين والشركاء')}
                  </h3>
                  <p className="text-sm text-slate-300 max-w-xl">
                    {t(
                      'Suivez ici les ventes générées par chaque partenaire commercial et leurs commissions.',
                      'Track sales generated by each affiliate partner and their commissions here.',
                      'تتبع هنا المبيعات اللي جابها كل شريك مسوق والعمولات ديالو.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
