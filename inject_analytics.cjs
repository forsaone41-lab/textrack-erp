const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

const marker = `                    {/* Recent Orders List */}`;
const injection = `
                    {/* Analytics PRO Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                       <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-amber-500" /> 
                             {isAr ? 'تحليلات المبيعات الذكية (PRO)' : 'Analytique des Ventes (PRO)'}
                          </h3>
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm">
                             <Crown className="w-3 h-3" /> Premium
                          </span>
                       </div>
                       
                       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Delivery & Returns Performance */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4">
                             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                                {isAr ? 'أداء التوصيل والشركات' : 'Performance Livraison'}
                             </h4>
                             
                             <div className="space-y-3">
                                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center"><Truck className="w-4 h-4 text-emerald-500" /></div>
                                      <div>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase">{isAr ? 'تم التوصيل' : 'Livrées'}</p>
                                         <p className="text-sm font-black text-slate-800">{storeOrders.filter((o: any) => !o.deleted && ['Livrée', 'تم التوصيل', 'Delivered'].includes(o.status)).length}</p>
                                      </div>
                                   </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center"><RotateCcw className="w-4 h-4 text-rose-500" /></div>
                                      <div>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase">{isAr ? 'المرتجعات' : 'Retours'}</p>
                                         <p className="text-sm font-black text-slate-800">{storeOrders.filter((o: any) => !o.deleted && ['Retour', 'Annulée'].includes(o.status)).length}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="mt-2 pt-3 border-t border-slate-200">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'شركات التوصيل النشطة' : 'Livreurs Actifs'}</p>
                                <div className="flex gap-2">
                                   <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">Amana</span>
                                   <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">Cathedis</span>
                                </div>
                             </div>
                          </div>

                          {/* Top Products */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 lg:col-span-1">
                             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                                {isAr ? 'المنتجات الأكثر مبيعاً' : 'Top Produits Vendus'}
                             </h4>
                             <div className="space-y-3">
                                {(() => {
                                   const productCounts: Record<string, any> = {};
                                   storeOrders.filter((o: any) => !o.deleted && !REFUSED_STATUSES.includes(o.status)).forEach((o: any) => {
                                      try {
                                         const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                                         if (Array.isArray(items)) {
                                            items.forEach((item: any) => {
                                               const pid = item.productId || item.name;
                                               if (!productCounts[pid]) productCounts[pid] = { name: item.name, count: 0, image: item.image || item.photo };
                                               productCounts[pid].count += (item.qty || item.quantity || 1);
                                            });
                                         }
                                      } catch(e) {}
                                   });
                                   const topProducts = Object.values(productCounts).sort((a: any, b: any) => b.count - a.count).slice(0, 3);
                                   return topProducts.length > 0 ? topProducts.map((tp: any, idx) => (
                                      <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
                                         {idx === 0 && <div className="absolute top-0 right-0 w-8 h-8 bg-amber-100 rotate-45 translate-x-4 -translate-y-4"></div>}
                                         {tp.image ? <img src={tp.image} className="w-10 h-10 rounded-md object-cover" /> : <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center"><Box className="w-4 h-4 text-slate-400" /></div>}
                                         <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{tp.name}</p>
                                            <p className="text-[10px] text-emerald-600 font-black">{tp.count} {isAr ? 'مبيعات' : 'Ventes'}</p>
                                         </div>
                                      </div>
                                   )) : <p className="text-xs text-slate-400">{isAr ? 'لا توجد مبيعات بعد' : 'Pas encore de ventes'}</p>;
                                })()}
                             </div>
                          </div>

                          {/* Inventory & Sizes Analysis */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4 lg:col-span-1">
                             <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                   {isAr ? 'تحليل المخزون' : 'Analyse Stocks & Tailles'}
                                </h4>
                                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <Package className="w-5 h-5 text-indigo-500" />
                                      <div>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase">{isAr ? 'نماذج متوفرة في المخزون' : 'Modèles en Stock'}</p>
                                         <p className="text-sm font-black text-slate-800">{storeProducts.length} {isAr ? 'منتج' : 'Produits'}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="mt-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                   <BarChart3 className="w-3 h-3 text-indigo-400" />
                                   {isAr ? 'المقاسات الأكثر طلباً' : 'Tailles Populaires'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                   {(() => {
                                      const sizeCounts: Record<string, number> = {};
                                      storeOrders.filter((o: any) => !o.deleted).forEach((o: any) => {
                                         try {
                                            const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                                            if (Array.isArray(items)) {
                                               items.forEach((item: any) => {
                                                  const sz = item.size || item.taille || (item.options ? item.options.match(/(?:Taille|Size):\s*([^,]+)/i)?.[1] : null);
                                                  if (sz) {
                                                     sizeCounts[sz] = (sizeCounts[sz] || 0) + (item.qty || item.quantity || 1);
                                                  }
                                               });
                                            }
                                         } catch(e) {}
                                      });
                                      const topSizes = Object.entries(sizeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
                                      return topSizes.length > 0 ? topSizes.map(([sz, count], idx) => (
                                         <div key={idx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                                            <span className="text-xs font-black text-slate-800">{sz}</span>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{count}</span>
                                         </div>
                                      )) : <p className="text-xs text-slate-400">{isAr ? 'غير متوفر' : 'N/A'}</p>;
                                   })()}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
`;

if (content.includes(marker) && !content.includes('Analytics PRO Section')) {
    content = content.replace(marker, injection + '\\n' + marker);
    // Let's ensure RotateCcw and BarChart3 are imported from lucide-react
    if (!content.includes('RotateCcw')) {
        content = content.replace('import { ', 'import { RotateCcw, BarChart3, ');
    }
    fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
    console.log('Analytics section injected successfully!');
} else {
    console.log('Marker not found or already injected.');
}
