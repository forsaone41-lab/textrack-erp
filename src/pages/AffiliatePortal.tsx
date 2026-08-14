import React, { useState, useEffect, useCallback } from 'react';
import {
  Handshake, LogOut, LayoutDashboard, Users, Wallet, Settings,
  Copy, Check, Store, Package, Clock, TrendingUp, Plus, X, Globe, ChevronRight, Boxes
} from 'lucide-react';
import { supabase } from '../supabase';
import { User, Affiliate, AffiliateResale, AffiliateCommission, AffiliatePayout, AffiliateDeal } from '../types';
import { useLang } from '../contexts/LangContext';

interface AffiliatePortalProps {
  currentUser: User;
  onLogout: () => void;
}

type Tab = 'overview' | 'referrals' | 'payouts' | 'settings';

export default function AffiliatePortal({ currentUser, onLogout }: AffiliatePortalProps) {
  const { isAr, toggle } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [resales, setResales] = useState<AffiliateResale[]>([]);
  const [deals, setDeals] = useState<AffiliateDeal[]>([]);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Log-a-resale form
  const [showResaleForm, setShowResaleForm] = useState(false);
  const [resaleClientName, setResaleClientName] = useState('');
  const [resaleClientEmail, setResaleClientEmail] = useState('');
  const [resaleProduct, setResaleProduct] = useState('beya_creative');
  const [resaleAmount, setResaleAmount] = useState('');

  // Log-a-deal form (supplier / atelier tracks)
  const [showDealForm, setShowDealForm] = useState(false);
  const [dealCounterparty, setDealCounterparty] = useState('');
  const [dealContact, setDealContact] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealNotes, setDealNotes] = useState('');

  // Settings form
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id || currentUser.id;

      const { data: aff } = await supabase.from('affiliates').select('*').eq('id', uid).maybeSingle();
      if (aff) {
        setAffiliate(aff as Affiliate);
        setPayoutMethod(aff.payout_method || '');
        setPayoutDetails(aff.payout_details ? JSON.stringify(aff.payout_details) : '');
        setBusinessName(aff.business_name || '');
        setCategory(aff.category || '');
        setDescription(aff.description || '');
        setCity(aff.city || '');
        setWhatsapp(aff.whatsapp || '');
      }

      const [{ data: storesData }, { data: resalesData }, { data: dealsData }, { data: commissionsData }, { data: payoutsData }] = await Promise.all([
        supabase.from('stores').select('id, name, domain, subscription_tier, created_at').eq('created_by_affiliate_id', uid),
        supabase.from('affiliate_resales').select('*').eq('affiliate_id', uid).order('created_at', { ascending: false }),
        supabase.from('affiliate_deals').select('*').eq('affiliate_id', uid).order('created_at', { ascending: false }),
        supabase.from('affiliate_commissions').select('*').eq('affiliate_id', uid).order('created_at', { ascending: false }),
        supabase.from('affiliate_payouts').select('*').eq('affiliate_id', uid).order('requested_at', { ascending: false }),
      ]);
      setStores(storesData || []);
      setResales((resalesData as AffiliateResale[]) || []);
      setDeals((dealsData as AffiliateDeal[]) || []);
      setCommissions((commissionsData as AffiliateCommission[]) || []);
      setPayouts((payoutsData as AffiliatePayout[]) || []);
    } catch (e) {
      console.error('Failed to load affiliate data', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalEarned = commissions.filter(c => c.status === 'approved' || c.status === 'paid').reduce((s, c) => s + Number(c.amount), 0);
  const totalPending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.amount), 0);
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.amount), 0);
  const availableForPayout = totalEarned - totalPaid;
  const hasMarketplaceTrack = !!affiliate?.tracks?.some(t => t === 'supplier' || t === 'atelier');

  const referralLink = affiliate ? `${window.location.origin}${window.location.pathname}#/store-signup?ref=${affiliate.referral_code}` : '';

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitResale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;
    const amount = parseFloat(resaleAmount);
    if (!resaleClientName || !amount || amount <= 0) return;
    const id = crypto.randomUUID();
    const { error } = await supabase.from('affiliate_resales').insert({
      id,
      affiliate_id: affiliate.id,
      client_name: resaleClientName,
      client_email: resaleClientEmail || null,
      product: resaleProduct,
      sale_amount: amount,
      status: 'pending'
    });
    if (!error) {
      setResaleClientName(''); setResaleClientEmail(''); setResaleAmount('');
      setShowResaleForm(false);
      setSuccessMsg(isAr ? 'تم تسجيل عملية البيع، بانتظار تأكيد الإدارة.' : 'Vente enregistrée, en attente de confirmation admin.');
      fetchData();
    }
  };

  const submitDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;
    const amount = parseFloat(dealAmount);
    if (!dealCounterparty || !amount || amount <= 0) return;
    const dealType = affiliate.tracks?.includes('supplier') ? 'supplier' : 'atelier';
    const id = crypto.randomUUID();
    const { error } = await supabase.from('affiliate_deals').insert({
      id,
      affiliate_id: affiliate.id,
      deal_type: dealType,
      counterparty_name: dealCounterparty,
      counterparty_contact: dealContact || null,
      amount,
      notes: dealNotes || null,
      status: 'pending'
    });
    if (!error) {
      setDealCounterparty(''); setDealContact(''); setDealAmount(''); setDealNotes('');
      setShowDealForm(false);
      setSuccessMsg(isAr ? 'تم تسجيل الصفقة، بانتظار تأكيد الإدارة.' : 'Affaire enregistrée, en attente de confirmation admin.');
      fetchData();
    }
  };

  const requestPayout = async () => {
    if (!affiliate || availableForPayout <= 0) return;
    const eligibleIds = commissions.filter(c => c.status === 'approved').map(c => c.id);
    const id = crypto.randomUUID();
    const { error } = await supabase.from('affiliate_payouts').insert({
      id,
      affiliate_id: affiliate.id,
      amount: availableForPayout,
      commission_ids: eligibleIds,
      status: 'requested',
      method: affiliate.payout_method || null
    });
    if (!error) {
      setSuccessMsg(isAr ? 'تم إرسال طلب الدفع.' : 'Demande de paiement envoyée.');
      fetchData();
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;
    let details: any = null;
    try { details = payoutDetails ? JSON.parse(payoutDetails) : { note: payoutDetails }; } catch { details = { note: payoutDetails }; }
    const { error } = await supabase.from('affiliates').update({
      payout_method: payoutMethod,
      payout_details: details,
      ...(hasMarketplaceTrack ? { business_name: businessName, category, description, city, whatsapp } : {}),
      updated_at: new Date()
    }).eq('id', affiliate.id);
    if (!error) setSuccessMsg(isAr ? 'تم حفظ الإعدادات.' : 'Paramètres enregistrés.');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm">{isAr ? 'جار التحميل...' : 'Chargement...'}</div>;
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans ${isAr ? 'flex-row-reverse text-right' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-72 bg-slate-900 flex-col border-r border-slate-800 shrink-0">
        <div className="p-8">
          <div className={`flex items-center gap-3 mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <div className={isAr ? 'text-right' : ''}>
              <h1 className="text-white font-black text-lg tracking-tighter uppercase leading-none">BEYA</h1>
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mt-1">{isAr ? 'فضاء الشركاء' : 'Partner Hub'}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard className="w-5 h-5" />} label={isAr ? 'نظرة عامة' : "Vue d'ensemble"} isAr={isAr} />
            <NavBtn active={activeTab === 'referrals'} onClick={() => setActiveTab('referrals')} icon={<Users className="w-5 h-5" />} label={isAr ? 'الإحالات' : 'Mes Référés'} isAr={isAr} />
            <NavBtn active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} icon={<Wallet className="w-5 h-5" />} label={isAr ? 'المدفوعات' : 'Paiements'} isAr={isAr} />
            <div className="pt-4 mt-4 border-t border-slate-800">
              <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} label={isAr ? 'الإعدادات' : 'Paramètres'} isAr={isAr} />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div onClick={toggle} className={`flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 mb-4 cursor-pointer group ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isAr ? 'اللغة العربية' : 'Français'}</span>
            </div>
            <ChevronRight className={`w-3 h-3 text-slate-500 group-hover:text-white transition-all ${isAr ? 'rotate-180' : ''}`} />
          </div>

          <div className={`bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-6 ${isAr ? 'text-right' : ''}`}>
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black">
                {currentUser.nom?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-black uppercase truncate">{currentUser.nom}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase truncate">
                  {affiliate?.status === 'approved' ? (isAr ? 'شريك معتمد' : 'Partenaire approuvé') : (isAr ? 'بانتظار الموافقة' : 'En attente d\'approbation')}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className={`w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${isAr ? 'flex-row-reverse' : ''}`}>
            <LogOut className="w-4 h-4" /> {isAr ? 'تسجيل الخروج' : 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="lg:hidden h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 flex items-center justify-between shrink-0 sticky top-0 z-[100]">
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Handshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight leading-none">BEYA</h2>
              <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mt-1 italic">{isAr ? 'فضاء الشركاء' : 'Partner Hub'}</p>
            </div>
          </div>
          <button onClick={onLogout} className="text-slate-400"><LogOut className="w-5 h-5" /></button>
        </header>

        <main className="flex-1 p-6 lg:p-10 pb-28 lg:pb-10 max-w-6xl w-full mx-auto">
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl">
              {successMsg}
            </div>
          )}

          {affiliate?.status === 'pending' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl">
              {isAr ? 'حسابك بانتظار موافقة الإدارة. سيتم إعلامك عند التفعيل.' : 'Votre compte est en attente d\'approbation par l\'administration.'}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">{isAr ? 'نظرة عامة' : "Vue d'ensemble"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label={isAr ? 'إجمالي الأرباح' : 'Total gagné'} value={`${totalEarned.toLocaleString()} MAD`} icon={<TrendingUp className="w-6 h-6" />} color="emerald" isAr={isAr} />
                <StatCard label={isAr ? 'قيد الانتظار' : 'En attente'} value={`${totalPending.toLocaleString()} MAD`} icon={<Clock className="w-6 h-6" />} color="amber" isAr={isAr} />
                <StatCard label={isAr ? 'تم دفعه' : 'Déjà payé'} value={`${totalPaid.toLocaleString()} MAD`} icon={<Wallet className="w-6 h-6" />} color="indigo" isAr={isAr} />
              </div>

              {affiliate && (
                <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رابط الإحالة الخاص بك' : 'Votre lien de parrainage'}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input readOnly value={referralLink} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600" />
                    <button onClick={copyLink} className="px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? (isAr ? 'تم النسخ' : 'Copié') : (isAr ? 'نسخ' : 'Copier')}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">
                    {isAr ? 'شارك هذا الرابط مع التجار. عمولات إعادة البيع (Beya Creative) تُسجَّل يدوياً من تبويب "الإحالات".' : 'Partagez ce lien avec des marchands. Les ventes de revente (Beya Creative) se déclarent manuellement dans l\'onglet "Mes Référés".'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">{isAr ? 'الإحالات' : 'Mes Référés'}</h2>

              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <div className={`flex items-center gap-2 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <Store className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">{isAr ? 'مواقع تم بناؤها (Track A)' : 'Sites créés (Track A)'}</h3>
                </div>
                {stores.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold">{isAr ? 'لا توجد مواقع بعد.' : 'Aucun site pour le moment.'}</p>
                ) : (
                  <div className="space-y-2">
                    {stores.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-700">{s.name || s.domain}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{s.subscription_tier || 'NORMAL'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <div className={`flex items-center justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Package className="w-5 h-5 text-amber-500" />
                    <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">{isAr ? 'عمليات إعادة البيع (Track B)' : 'Reventes (Track B)'}</h3>
                  </div>
                  <button onClick={() => setShowResaleForm(true)} className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700">
                    <Plus className="w-4 h-4" /> {isAr ? 'تسجيل بيع' : 'Log a resale'}
                  </button>
                </div>
                {resales.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold">{isAr ? 'لا توجد عمليات بعد.' : 'Aucune revente pour le moment.'}</p>
                ) : (
                  <div className="space-y-2">
                    {resales.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{r.client_name} — {r.product}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{r.sale_amount} MAD</p>
                          <span className={`text-[9px] font-black uppercase ${r.status === 'confirmed' ? 'text-emerald-500' : r.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>{r.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {hasMarketplaceTrack && (
                <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                  <div className={`flex items-center justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <Boxes className="w-5 h-5 text-amber-500" />
                      <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">{isAr ? 'الصفقات (مورد / معمل)' : 'Affaires (Fournisseur / Atelier)'}</h3>
                    </div>
                    <button onClick={() => setShowDealForm(true)} className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700">
                      <Plus className="w-4 h-4" /> {isAr ? 'تسجيل صفقة' : 'Log a deal'}
                    </button>
                  </div>
                  {deals.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold">{isAr ? 'لا توجد صفقات بعد.' : 'Aucune affaire pour le moment.'}</p>
                  ) : (
                    <div className="space-y-2">
                      {deals.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-700">{d.counterparty_name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{new Date(d.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">{d.amount} MAD</p>
                            <span className={`text-[9px] font-black uppercase ${d.status === 'confirmed' ? 'text-emerald-500' : d.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>{d.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">{isAr ? 'المدفوعات' : 'Paiements'}</h2>
              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'متاح للسحب' : 'Disponible pour paiement'}</p>
                  <p className="text-3xl font-black text-slate-900">{availableForPayout.toLocaleString()} MAD</p>
                </div>
                <button onClick={requestPayout} disabled={availableForPayout <= 0}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors">
                  {isAr ? 'طلب الدفع' : 'Demander le paiement'}
                </button>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight mb-4">{isAr ? 'سجل الطلبات' : 'Historique des demandes'}</h3>
                {payouts.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold">{isAr ? 'لا توجد طلبات بعد.' : 'Aucune demande pour le moment.'}</p>
                ) : (
                  <div className="space-y-2">
                    {payouts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-semibold">{new Date(p.requested_at).toLocaleDateString()}</p>
                        <p className="text-sm font-black text-slate-900">{p.amount} MAD</p>
                        <span className={`text-[9px] font-black uppercase ${p.status === 'paid' ? 'text-emerald-500' : p.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">{isAr ? 'الإعدادات' : 'Paramètres'}</h2>
              <form onSubmit={saveSettings} className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'طريقة الدفع' : 'Méthode de paiement'}</label>
                  <select value={payoutMethod} onChange={e => setPayoutMethod(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <option value="">{isAr ? 'اختر' : 'Choisir'}</option>
                    <option value="bank_transfer">{isAr ? 'تحويل بنكي' : 'Virement bancaire'}</option>
                    <option value="cashplus">Cash Plus</option>
                    <option value="wafacash">Wafacash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{isAr ? 'تفاصيل الدفع (RIB / رقم الهاتف)' : 'Détails de paiement (RIB / téléphone)'}</label>
                  <textarea value={payoutDetails} onChange={e => setPayoutDetails(e.target.value)} rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="RIB / GSM" />
                </div>
                <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors">
                  {isAr ? 'حفظ' : 'Enregistrer'}
                </button>
              </form>

              {hasMarketplaceTrack && (
                <form onSubmit={saveSettings} className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4">
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">{isAr ? 'ملف دليل الشركاء العام' : 'Profil annuaire public'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                      placeholder={isAr ? 'اسم المقاولة / الورشة' : 'Nom de l\'entreprise / atelier'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                      <option value="">{isAr ? 'اختر الفئة' : 'Choisir une catégorie'}</option>
                      <option value="tissu">{isAr ? 'أقمشة' : 'Tissus'}</option>
                      <option value="confection">{isAr ? 'تفصيل / خياطة' : 'Confection'}</option>
                      <option value="broderie">{isAr ? 'تطريز' : 'Broderie'}</option>
                      <option value="impression">{isAr ? 'طباعة' : 'Impression'}</option>
                      <option value="autre">{isAr ? 'أخرى' : 'Autre'}</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={city} onChange={e => setCity(e.target.value)} placeholder={isAr ? 'المدينة' : 'Ville'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    placeholder={isAr ? 'وصف مختصر' : 'Brève description'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors">
                    {isAr ? 'حفظ الملف' : 'Enregistrer le profil'}
                  </button>
                </form>
              )}
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 rounded-full shadow-2xl flex items-center gap-1 p-2 z-[100]">
          <MobileNavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard className="w-5 h-5" />} />
          <MobileNavBtn active={activeTab === 'referrals'} onClick={() => setActiveTab('referrals')} icon={<Users className="w-5 h-5" />} />
          <MobileNavBtn active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} icon={<Wallet className="w-5 h-5" />} />
          <MobileNavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} />
        </div>
      </div>

      {showResaleForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowResaleForm(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-slate-900">{isAr ? 'تسجيل عملية بيع' : 'Log a resale'}</h3>
              <button onClick={() => setShowResaleForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitResale} className="space-y-4">
              <input required placeholder={isAr ? 'اسم الزبون' : 'Nom du client'} value={resaleClientName} onChange={e => setResaleClientName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <input type="email" placeholder={isAr ? 'بريد الزبون (اختياري)' : 'Email du client (optionnel)'} value={resaleClientEmail} onChange={e => setResaleClientEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <select value={resaleProduct} onChange={e => setResaleProduct(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="beya_creative">Beya Creative</option>
                <option value="PREMIUM">Plan PREMIUM</option>
                <option value="ZIRORISK">Plan ZIRORISK</option>
              </select>
              <input required type="number" min="1" step="0.01" placeholder={isAr ? 'مبلغ البيع (درهم)' : 'Montant de la vente (MAD)'} value={resaleAmount} onChange={e => setResaleAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors">
                {isAr ? 'تسجيل' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDealForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowDealForm(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-slate-900">{isAr ? 'تسجيل صفقة' : 'Log a deal'}</h3>
              <button onClick={() => setShowDealForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitDeal} className="space-y-4">
              <input required placeholder={isAr ? 'اسم الطرف الآخر' : 'Nom de la contrepartie'} value={dealCounterparty} onChange={e => setDealCounterparty(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <input placeholder={isAr ? 'رقم التواصل (اختياري)' : 'Contact (optionnel)'} value={dealContact} onChange={e => setDealContact(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <input required type="number" min="1" step="0.01" placeholder={isAr ? 'مبلغ الصفقة (درهم)' : 'Montant de l\'affaire (MAD)'} value={dealAmount} onChange={e => setDealAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <textarea placeholder={isAr ? 'ملاحظات (اختياري)' : 'Notes (optionnel)'} value={dealNotes} onChange={e => setDealNotes(e.target.value)} rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors">
                {isAr ? 'تسجيل' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon, label, isAr }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isAr?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm uppercase tracking-tighter ${isAr ? 'flex-row-reverse text-right' : ''} ${
        active ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}>
      {icon}
      {label}
    </button>
  );
}

function MobileNavBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40' : 'text-slate-500 hover:text-white'}`}>
      {icon}
    </button>
  );
}

function StatCard({ label, value, icon, color, isAr }: { label: string; value: string | number; icon: React.ReactNode; color: 'indigo' | 'emerald' | 'amber'; isAr?: boolean }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <div className={`p-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
      <div className={isAr ? 'text-right' : ''}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center border shadow-sm shrink-0`}>
        {icon}
      </div>
    </div>
  );
}
