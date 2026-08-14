import React, { useEffect, useState } from 'react';
import { Store, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';
import { loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';

const TIERS = ['NORMAL', 'PRO', 'PREMIUM'] as const;

const TIER_STYLES: Record<string, string> = {
   NORMAL: 'bg-slate-100 text-slate-600',
   PRO: 'bg-amber-100 text-amber-700',
   PREMIUM: 'bg-indigo-100 text-indigo-700',
};

export default function StorePlans() {
   const { isAr } = useLang();
   const [stores, setStores] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [savingDomain, setSavingDomain] = useState<string | null>(null);

   const fetchStores = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
         .from('stores')
         .select('id, domain, name, subscription_tier, updated_at, created_by_affiliate_id')
         .neq('domain', 'latest_saved_store')
         .order('updated_at', { ascending: false });
      if (!error && data) setStores(data);
      setIsLoading(false);
   };

   useEffect(() => { fetchStores(); }, []);

   const handleChangePlan = async (domain: string, tier: string) => {
      setSavingDomain(domain);
      const store = stores.find(s => s.domain === domain);
      setStores(prev => prev.map(s => s.domain === domain ? { ...s, subscription_tier: tier } : s));
      await supabase.from('stores').update({ subscription_tier: tier }).eq('domain', domain);

      // Track A affiliate commission: first paid-tier upgrade of a referred store
      if (store?.created_by_affiliate_id && tier !== 'NORMAL' && (store.subscription_tier || 'NORMAL') === 'NORMAL') {
         await generateSetupCommission(store, tier);
      }
      setSavingDomain(null);
   };

   const generateSetupCommission = async (store: any, tier: string) => {
      try {
         const { data: existing } = await supabase
            .from('affiliate_commissions')
            .select('id')
            .eq('source_type', 'store_setup')
            .eq('source_id', store.id)
            .maybeSingle();
         if (existing) return;

         const { data: affiliate } = await supabase
            .from('affiliates')
            .select('commission_rate_builder_setup')
            .eq('id', store.created_by_affiliate_id)
            .maybeSingle();
         if (!affiliate) return;

         const company = loadCompanyProfile();
         const baseAmount = tier === 'PREMIUM' ? Number(company.storePremiumPrice || 499) : Number(company.storeProPrice || 299);
         const rate = Number(affiliate.commission_rate_builder_setup || 0);
         const amount = Math.round((baseAmount * rate) / 100);

         await supabase.from('affiliate_commissions').insert({
            id: crypto.randomUUID(),
            affiliate_id: store.created_by_affiliate_id,
            track: 'builder',
            source_type: 'store_setup',
            source_id: store.id,
            amount,
            rate_applied: rate,
            base_amount: baseAmount,
            status: 'pending'
         });
      } catch (e) {
         console.error('Failed to generate affiliate setup commission', e);
      }
   };

   return (
      <div className="p-6 md:p-8" dir={isAr ? 'rtl' : 'ltr'}>
         <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
               <Store className="w-5 h-5" />
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-900">{isAr ? 'باقات المتاجر' : 'Plans des Boutiques'}</h1>
               <p className="text-xs font-semibold text-slate-500">
                  {isAr
                     ? 'حدد باقة كل متجر (Normal / PRO / Premium). التغيير هنا فقط، التاجر ما يقدرش يبدلها بروحو.'
                     : "Définit le plan de chaque boutique (Normal / PRO / Premium). Seul un admin peut le changer ici — le marchand ne peut plus le faire lui-même."}
               </p>
            </div>
         </div>

         {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
               <Loader2 className="w-6 h-6 animate-spin" />
            </div>
         ) : stores.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm font-semibold">
               {isAr ? 'لا يوجد أي متجر بعد.' : 'Aucune boutique pour le moment.'}
            </div>
         ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
               <table className="w-full text-sm">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200 text-left">
                        <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'المتجر' : 'Boutique'}</th>
                        <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'النطاق' : 'Domaine'}</th>
                        <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الباقة' : 'Plan'}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {stores.map(store => {
                        const tier = store.subscription_tier || 'NORMAL';
                        return (
                           <tr key={store.domain} className="border-b border-slate-100 last:border-0">
                              <td className="px-5 py-3 font-bold text-slate-800">{store.name || '—'}</td>
                              <td className="px-5 py-3 text-slate-500">{store.domain}</td>
                              <td className="px-5 py-3">
                                 <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${TIER_STYLES[tier] || TIER_STYLES.NORMAL}`}>
                                       {savingDomain === store.domain ? <Loader2 className="w-3 h-3 animate-spin inline" /> : (tier === 'PREMIUM' ? (isAr ? 'بريميوم' : 'Premium') : tier)}
                                    </span>
                                    <select
                                       value={tier}
                                       onChange={e => handleChangePlan(store.domain, e.target.value)}
                                       disabled={savingDomain === store.domain}
                                       className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-400"
                                    >
                                       {TIERS.map(t => <option key={t} value={t}>{t === 'PREMIUM' ? (isAr ? 'بريميوم' : 'Premium') : t === 'PRO' ? 'PRO' : (isAr ? 'عادي' : 'Normal')}</option>)}
                                    </select>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         )}

         <div className="mt-6 flex items-start gap-2 text-xs text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{isAr
               ? 'باقة Normal: تصميمين فقط. PRO و Premium: كل التصاميم مفتوحة.'
               : 'Plan Normal : 2 thèmes seulement. PRO et Premium : tous les thèmes débloqués.'}</p>
         </div>
      </div>
   );
}
