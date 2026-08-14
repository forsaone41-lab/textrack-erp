import React, { useEffect, useState, useCallback } from 'react';
import { Handshake, Loader2, Check, X, PlayCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';
import { loadCompanyProfile, Affiliate, AffiliateResale, AffiliateDeal, AffiliatePayout } from '../types';
import { useLang } from '../contexts/LangContext';

type Tab = 'affiliates' | 'resales' | 'deals' | 'payouts';

export default function AffiliateAdmin() {
  const { isAr } = useLang();
  const [tab, setTab] = useState<Tab>('affiliates');
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [resales, setResales] = useState<AffiliateResale[]>([]);
  const [deals, setDeals] = useState<AffiliateDeal[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runningMonthly, setRunningMonthly] = useState(false);
  const [monthlyResult, setMonthlyResult] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: aff }, { data: res }, { data: dl }, { data: pay }] = await Promise.all([
      supabase.from('affiliates').select('*').order('created_at', { ascending: false }),
      supabase.from('affiliate_resales').select('*').order('created_at', { ascending: false }),
      supabase.from('affiliate_deals').select('*').order('created_at', { ascending: false }),
      supabase.from('affiliate_payouts').select('*').order('requested_at', { ascending: false }),
    ]);
    setAffiliates((aff as Affiliate[]) || []);
    setResales((res as AffiliateResale[]) || []);
    setDeals((dl as AffiliateDeal[]) || []);
    setPayouts((pay as AffiliatePayout[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateAffiliateStatus = async (id: string, status: Affiliate['status']) => {
    setBusyId(id);
    await supabase.from('affiliates').update({ status, updated_at: new Date() }).eq('id', id);
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setBusyId(null);
  };

  const updateRate = async (id: string, field: keyof Affiliate, value: number) => {
    await supabase.from('affiliates').update({ [field]: value, updated_at: new Date() }).eq('id', id);
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const confirmResale = async (resale: AffiliateResale, approve: boolean) => {
    setBusyId(resale.id);
    const newStatus = approve ? 'confirmed' : 'rejected';
    await supabase.from('affiliate_resales').update({ status: newStatus }).eq('id', resale.id);
    setResales(prev => prev.map(r => r.id === resale.id ? { ...r, status: newStatus } : r));

    if (approve) {
      const affiliate = affiliates.find(a => a.id === resale.affiliate_id);
      const rate = Number(affiliate?.commission_rate_reseller || 0);
      const amount = Math.round((resale.sale_amount * rate) / 100);
      await supabase.from('affiliate_commissions').insert({
        id: crypto.randomUUID(),
        affiliate_id: resale.affiliate_id,
        track: 'reseller',
        source_type: 'resale',
        source_id: resale.id,
        amount,
        rate_applied: rate,
        base_amount: resale.sale_amount,
        status: 'pending'
      });
    }
    setBusyId(null);
  };

  const confirmDeal = async (deal: AffiliateDeal, approve: boolean) => {
    setBusyId(deal.id);
    const newStatus = approve ? 'confirmed' : 'rejected';
    await supabase.from('affiliate_deals').update({ status: newStatus }).eq('id', deal.id);
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, status: newStatus } : d));

    if (approve) {
      const affiliate = affiliates.find(a => a.id === deal.affiliate_id);
      const rate = deal.deal_type === 'supplier'
        ? Number(affiliate?.commission_rate_supplier || 0)
        : Number(affiliate?.commission_rate_atelier || 0);
      const amount = Math.round((deal.amount * rate) / 100);
      await supabase.from('affiliate_commissions').insert({
        id: crypto.randomUUID(),
        affiliate_id: deal.affiliate_id,
        track: deal.deal_type,
        source_type: 'deal',
        source_id: deal.id,
        amount,
        rate_applied: rate,
        base_amount: deal.amount,
        status: 'pending'
      });
    }
    setBusyId(null);
  };

  const markPayout = async (payout: AffiliatePayout, status: AffiliatePayout['status']) => {
    setBusyId(payout.id);
    await supabase.from('affiliate_payouts').update({ status, processed_at: new Date() }).eq('id', payout.id);
    if (status === 'paid') {
      const ids = payout.commission_ids || [];
      if (ids.length > 0) {
        await supabase.from('affiliate_commissions').update({ status: 'paid' }).in('id', ids);
      }
    }
    setPayouts(prev => prev.map(p => p.id === payout.id ? { ...p, status } : p));
    setBusyId(null);
  };

  const runMonthlyCommissions = async () => {
    setRunningMonthly(true);
    setMonthlyResult(null);
    try {
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: stores } = await supabase
        .from('stores')
        .select('id, subscription_tier, created_by_affiliate_id')
        .not('created_by_affiliate_id', 'is', null)
        .neq('subscription_tier', 'NORMAL');

      if (!stores || stores.length === 0) {
        setMonthlyResult(isAr ? 'لا توجد مواقع مؤهلة هذا الشهر.' : 'Aucun site éligible ce mois-ci.');
        return;
      }

      const company = loadCompanyProfile();
      let created = 0;
      for (const store of stores) {
        const { data: existing } = await supabase
          .from('affiliate_commissions')
          .select('id')
          .eq('source_type', 'store_recurring')
          .eq('source_id', store.id)
          .eq('period', period)
          .maybeSingle();
        if (existing) continue;

        const affiliate = affiliates.find(a => a.id === store.created_by_affiliate_id);
        if (!affiliate || affiliate.status !== 'approved') continue;

        const baseAmount = store.subscription_tier === 'PREMIUM' ? Number(company.storePremiumPrice || 499) : Number(company.storeProPrice || 299);
        const rate = Number(affiliate.commission_rate_builder_recurring || 0);
        const amount = Math.round((baseAmount * rate) / 100);

        await supabase.from('affiliate_commissions').insert({
          id: crypto.randomUUID(),
          affiliate_id: store.created_by_affiliate_id,
          track: 'builder',
          source_type: 'store_recurring',
          source_id: store.id,
          amount,
          rate_applied: rate,
          base_amount: baseAmount,
          period,
          status: 'pending'
        });
        created++;
      }
      setMonthlyResult(isAr ? `تم توليد ${created} عمولة شهرية لـ ${period}.` : `${created} commissions récurrentes générées pour ${period}.`);
    } catch (e) {
      console.error('Failed to run monthly commissions', e);
      setMonthlyResult(isAr ? 'حدث خطأ.' : 'Une erreur est survenue.');
    } finally {
      setRunningMonthly(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="p-6 md:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
          <Handshake className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">{isAr ? 'الشركاء والعمولات' : 'Partenaires & Commissions'}</h1>
          <p className="text-xs font-semibold text-slate-500">{isAr ? 'إدارة الشركاء، تأكيد المبيعات، ودفع العمولات.' : 'Gérez les partenaires, confirmez les ventes, traitez les paiements.'}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['affiliates', 'resales', 'deals', 'payouts'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {t === 'affiliates' ? (isAr ? 'الشركاء' : 'Affiliés') : t === 'resales' ? (isAr ? 'المبيعات' : 'Reventes') : t === 'deals' ? (isAr ? 'الصفقات' : 'Affaires B2B') : (isAr ? 'المدفوعات' : 'Paiements')}
          </button>
        ))}
      </div>

      {tab === 'affiliates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={runMonthlyCommissions} disabled={runningMonthly}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors">
              {runningMonthly ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {isAr ? 'تشغيل العمولات الشهرية' : 'Lancer les commissions du mois'}
            </button>
          </div>
          {monthlyResult && <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-xl">{monthlyResult}</div>}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الاسم' : 'Nom'}</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'كود الإحالة' : 'Code'}</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'المسارات' : 'Tracks'}</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Setup %</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Recurring %</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Resale %</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Supplier %</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Atelier %</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الحالة' : 'Statut'}</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-bold text-slate-800">{a.full_name}<div className="text-[10px] text-slate-400 font-semibold">{a.email}</div></td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{a.referral_code}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{(a.tracks || []).join(', ')}</td>
                    <td className="px-5 py-3">
                      <input type="number" defaultValue={a.commission_rate_builder_setup} onBlur={e => updateRate(a.id, 'commission_rate_builder_setup', Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td className="px-5 py-3">
                      <input type="number" defaultValue={a.commission_rate_builder_recurring} onBlur={e => updateRate(a.id, 'commission_rate_builder_recurring', Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td className="px-5 py-3">
                      <input type="number" defaultValue={a.commission_rate_reseller} onBlur={e => updateRate(a.id, 'commission_rate_reseller', Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td className="px-5 py-3">
                      <input type="number" defaultValue={a.commission_rate_supplier} onBlur={e => updateRate(a.id, 'commission_rate_supplier', Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td className="px-5 py-3">
                      <input type="number" defaultValue={a.commission_rate_atelier} onBlur={e => updateRate(a.id, 'commission_rate_atelier', Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : a.status === 'suspended' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {busyId === a.id ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
                        a.status === 'approved' ? (
                          <button onClick={() => updateAffiliateStatus(a.id, 'suspended')} className="text-xs font-bold text-rose-600 hover:underline">{isAr ? 'تعليق' : 'Suspendre'}</button>
                        ) : (
                          <button onClick={() => updateAffiliateStatus(a.id, 'approved')} className="text-xs font-bold text-emerald-600 hover:underline">{isAr ? 'موافقة' : 'Approuver'}</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {affiliates.length === 0 && (
                  <tr><td colSpan={10} className="px-5 py-10 text-center text-slate-400 text-sm font-semibold">{isAr ? 'لا يوجد شركاء بعد.' : 'Aucun affilié pour le moment.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'resales' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الزبون' : 'Client'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'المنتج' : 'Produit'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'المبلغ' : 'Montant'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الحالة' : 'Statut'}</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {resales.map(r => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-bold text-slate-800">{r.client_name}</td>
                  <td className="px-5 py-3 text-slate-500">{r.product}</td>
                  <td className="px-5 py-3 font-black text-slate-900">{r.sale_amount} MAD</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : r.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => confirmResale(r, true)} className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100"><Check className="w-4 h-4" /></button>
                        <button onClick={() => confirmResale(r, false)} className="w-7 h-7 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-100"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {resales.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm font-semibold">{isAr ? 'لا توجد مبيعات بعد.' : 'Aucune revente pour le moment.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'deals' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الطرف الآخر' : 'Contrepartie'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'النوع' : 'Type'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'المبلغ' : 'Montant'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الحالة' : 'Statut'}</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-bold text-slate-800">{d.counterparty_name}<div className="text-[10px] text-slate-400 font-semibold">{d.counterparty_contact}</div></td>
                  <td className="px-5 py-3 text-slate-500 text-xs uppercase">{d.deal_type}</td>
                  <td className="px-5 py-3 font-black text-slate-900">{d.amount} MAD</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${d.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : d.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {busyId === d.id ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : d.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => confirmDeal(d, true)} className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100"><Check className="w-4 h-4" /></button>
                        <button onClick={() => confirmDeal(d, false)} className="w-7 h-7 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-100"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm font-semibold">{isAr ? 'لا توجد صفقات بعد.' : 'Aucune affaire pour le moment.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'التاريخ' : 'Date'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'المبلغ' : 'Montant'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الطريقة' : 'Méthode'}</th>
                <th className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">{isAr ? 'الحالة' : 'Statut'}</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(p.requested_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-black text-slate-900">{p.amount} MAD</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{p.method || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : p.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {busyId === p.id ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : p.status === 'requested' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => markPayout(p, 'paid')} className="text-xs font-bold text-emerald-600 hover:underline">{isAr ? 'تم الدفع (WhatsApp مؤكد)' : 'Marquer payé (confirmé WhatsApp)'}</button>
                        <button onClick={() => markPayout(p, 'rejected')} className="text-xs font-bold text-rose-600 hover:underline">{isAr ? 'رفض' : 'Rejeter'}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm font-semibold">{isAr ? 'لا توجد طلبات دفع بعد.' : 'Aucune demande de paiement.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 text-xs text-slate-400 font-semibold">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{isAr ? 'العمولات الشهرية المتكررة تُولَّد يدوياً من هنا كل شهر. الدفع يتم تأكيده يدوياً بعد التحقق عبر واتساب.' : 'Les commissions récurrentes mensuelles se génèrent manuellement ici chaque mois. Les paiements sont confirmés manuellement après vérification WhatsApp.'}</p>
      </div>
    </div>
  );
}
