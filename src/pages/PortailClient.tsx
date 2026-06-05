import { useState, useEffect } from 'react';
import { Search, Package, CircleCheck, Clock, Truck, Globe, Bell, Receipt, MessageCircle, ArrowRight, X, Download, Scissors, Layers, Sparkles, Wind, ShieldCheck, Box, FileText, Eye, Plus, Camera, RotateCw, CreditCard, Building, Upload, Send, Check } from 'lucide-react';
import {
  Commande, Facture, FicheTechnique, loadData, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, User, CompanyProfile, loadCompanyProfile, saveLead, syncCompanyProfile, saveRecord, Lead, loadLeads, loadLeadPhoto
} from '../types';
import { useLang } from '../contexts/LangContext';
import { printElement } from '../utils/pdf';
import { subscribeToPush } from '../utils/pushNotifications';
import { compressImage } from '../utils/image';
import { printFicheTechnique as printFT } from '../utils/print';
import { InvoicePRO } from '../components/InvoicePRO';
import ClientInfo from './ClientInfo';
import { PageLoader } from '../components/PageLoader';

interface PortailClientProps {
  currentUser?: User | null;
  onLogout?: () => void;
}

const LogoWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Package className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-black uppercase tracking-tighter italic flex-1">
          {alt.split(' ')[0]}<span className="text-indigo-400">Portal</span>
        </span>
      </div>
    );
  }
  return <img src={src} className="h-10 object-contain" alt={alt} onError={() => setError(true)} />;
};

export default function PortailClient({ currentUser, onLogout }: PortailClientProps) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [fiches, setFiches] = useState<any[]>([]);
  const [mesDemandes, setMesDemandes] = useState<Lead[]>([]);
  const [leadPhotos, setLeadPhotos] = useState<Record<string, string>>({});
  const [reference, setReference] = useState('');
  const [found, setFound] = useState<Commande[]>([]);
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());
  const { isAr, toggle } = useLang();

  useEffect(() => {
    const sync = async () => {
      const remote = await syncCompanyProfile();
      setCompany(remote);
    };
    sync();
  }, []);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'demandes' | 'docs' | 'payments' | 'support' | 'info'>('overview');
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMesuresFiche, setViewMesuresFiche] = useState<FicheTechnique | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    modele: '',
    quantite: '',
    details: '',
    photo: null as string | null,
    tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' } as Record<string, string>
  });
  const [sendingOrder, setSendingOrder] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPreuve, setUploadingPreuve] = useState<string | null>(null);
  const [annulationModal, setAnnulationModal] = useState<{ cmdId: string, cmdRef: string } | null>(null);
  const [annulationRaison, setAnnulationRaison] = useState('');
  const [annulationSending, setAnnulationSending] = useState(false);

  // Virement states
  const [virementPhoto, setVirementPhoto] = useState<string | null>(null);
  const [virementMontant, setVirementMontant] = useState('');
  const [virementCommandeId, setVirementCommandeId] = useState('');
  const [sendingVirement, setSendingVirement] = useState(false);
  const [virementSent, setVirementSent] = useState(false);
  const [ribCopied, setRibCopied] = useState(false);

  // Helper for translating phase names
  const phaseAr: Record<string, string> = { 
    coupe: 'الفصالة', 
    montage: 'الخياطة', 
    finition: 'الفينيسيون', 
    repassage: 'المصلوح', 
    controle: 'مراقبة الجودة',
    emballage: 'التغليف',
    livré: 'تسلّمات' 
  };

  const phaseIcons: Record<string, any> = {
    coupe: <Scissors className="w-5 h-5" />,
    montage: <Layers className="w-5 h-5" />,
    finition: <Sparkles className="w-5 h-5" />,
    repassage: <Wind className="w-5 h-5" />,
    controle: <ShieldCheck className="w-5 h-5" />,
    emballage: <Box className="w-5 h-5" />,
    livré: <Truck className="w-5 h-5" />
  };

  useEffect(() => {
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<Facture>('factures'),
      loadData<any>('fiches'),
      loadLeads()
    ]).then(([allCommandes, allFactures, allFiches, allLeads]) => {
      setCommandes(allCommandes);
      setFactures(allFactures);
      setFiches(allFiches);

      // If a client is logged in, show their orders automatically
      if (currentUser?.role === 'client') {
        const myCommandes = allCommandes.filter(c =>
          (c.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase()
        );
        const myLeads = allLeads.filter(l =>
          (l.name || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase() ||
          ((l.email || '').trim().toLowerCase() === (currentUser?.email || '').trim().toLowerCase() && currentUser?.email) ||
          ((l.phone || '').trim() === (currentUser?.telephone || '').trim() && currentUser?.telephone)
        );
        setFound(myCommandes);
        setMesDemandes(myLeads);
        
        // Load photos for these leads asynchronously
        myLeads.forEach(async (lead) => {
          const photo = await loadLeadPhoto(lead.id);
          if (photo) {
            setLeadPhotos(prev => ({ ...prev, [lead.id]: photo }));
          }
        });
        
        // Auto-subscribe to push notifications silently
        subscribeToPush(currentUser.username || currentUser.nom).catch(() => {});
      }
      setLoading(false);
    });
  }, [currentUser]);

  function handleSearch() {
    const results = commandes.filter(c =>
      c.reference.toLowerCase() === reference.toLowerCase() ||
      (c.referenceClient && c.referenceClient.toLowerCase() === reference.toLowerCase()) ||
      (c.client || '').toLowerCase().includes(reference.toLowerCase())
    );
    setFound(results);
  }

  const handleDemandeAnnulation = async () => {
    if (!annulationModal) return;
    setAnnulationSending(true);
    try {
      const cmd = found.find(c => c.id === annulationModal.cmdId);
      if (!cmd) return;
      const updated = { ...cmd, statut: 'annulation_demandee' as any, annulationRaison: annulationRaison || 'Raison non précisée' };
      await saveRecord('commandes', updated);
      setFound(prev => prev.map(c => c.id === annulationModal.cmdId ? updated : c));
      // Notify admin
      try {
        const { sendPushToAll } = await import('../utils/pushNotifications');
        sendPushToAll(
          isAr ? '⚠️ طلب إلغاء طلبية' : '⚠️ Demande d\'annulation',
          `${cmd.client} — ${cmd.reference}`,
          '/commandes'
        );
      } catch (_) {}
      setAnnulationModal(null);
      setAnnulationRaison('');
    } catch (err) {
      console.error(err);
    } finally {
      setAnnulationSending(false);
    }
  };

  const handleUploadPreuveClient = async (factureId: string, file: File) => {
    setUploadingPreuve(factureId);
    try {
      const compressed = await compressImage(file);
      const updated = factures.map(f => f.id === factureId
        ? { ...f, preuveClient: compressed, statut: 'en_verification' as const }
        : f
      );
      setFactures(updated);
      const facture = updated.find(f => f.id === factureId);
      if (facture) {
        await saveRecord('factures', { ...facture, preuveClient: compressed, statut: 'en_verification' }, true);
        // Notify admin
        try {
          const { sendPushToAll } = await import('../utils/pushNotifications');
          sendPushToAll(
            isAr ? '💳 إثبات دفع جديد' : '💳 Nouvelle preuve de paiement',
            `${facture.client} — ${facture.numero}`,
            '/recus'
          );
        } catch (_) {}
      }
    } catch (err) {
      console.error('Upload preuve failed:', err);
    } finally {
      setUploadingPreuve(null);
    }
  };

  const handleOrderPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file).then(res => { setNewOrderForm({ ...newOrderForm, photo: res }); }).catch(console.error);
    }
  };

  const submitNewOrder = async () => {
    if (!newOrderForm.modele || !newOrderForm.quantite || !currentUser) return;
    
    if (!newOrderForm.photo) {
      alert(isAr ? "من فضلك أضف صورة الموديل (إجباري)" : "Veuillez ajouter une photo du modèle (Obligatoire)");
      return;
    }

    setSendingOrder(true);
    
    try {
      const sizeQuantities: Record<string, number> = {};
      Object.entries(newOrderForm.tailles).forEach(([s, q]) => {
        if (q && parseInt(q) > 0) sizeQuantities[s] = parseInt(q);
      });

      const leadPayload = {
        name: currentUser.nom,
        email: currentUser.email || '',
        phone: currentUser.telephone || '',
        ville: '',
        type: newOrderForm.modele,
        quantity: parseInt(newOrderForm.quantite),
        photo: newOrderForm.photo,
        details: newOrderForm.details,
        tailles: sizeQuantities
      };
      
      await saveLead(leadPayload);
      
      setOrderSent(true);
      setTimeout(() => {
        setOrderSent(false);
        setShowNewOrderModal(false);
        setNewOrderForm({ 
          modele: '', 
          quantite: '', 
          details: '', 
          photo: null,
          tailles: { 'XS': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '' }
        });
      }, 2000);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      alert(isAr ? "وقع خطأ فإرسال الطلب: " + err.message : "Erreur lors de l'envoi : " + err.message);
    } finally {
      setSendingOrder(false);
    }
  };

  function getPhaseIndex(phase: string): number {
    return PHASE_ORDER.indexOf(phase as any);
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 ${isAr ? 'right-0' : 'left-0'} z-[101] w-64 md:w-72 bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')
      } lg:block`}>
        <div className="flex flex-col h-full">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-10">
              <LogoWithFallback src={company.logoClient || company.logoUrl} alt={company.name} />
              <button 
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'overview', icon: <Globe className="w-5 h-5" />, label: isAr ? 'نظرة عامة' : 'Vue d\'ensemble' },
                { id: 'demandes', icon: <MessageCircle className="w-5 h-5" />, label: isAr ? 'طلباتي' : 'Mes Demandes' },
                { id: 'orders', icon: <Package className="w-5 h-5" />, label: isAr ? 'طلبياتي' : 'Mes Commandes' },
                { id: 'docs', icon: <Receipt className="w-5 h-5" />, label: isAr ? 'الفواتير والوثائق' : 'Factures & Docs' },
                { id: 'payments', icon: <CreditCard className="w-5 h-5" />, label: isAr ? 'الدفع والأداء' : 'Paiements' },
                { id: 'support', icon: <Bell className="w-5 h-5" />, label: isAr ? 'الدعم الفني VIP' : 'Support VIP' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${
                    activeTab === item.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-white/5">
             {currentUser && (
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                   {currentUser.nom[0]}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate uppercase tracking-tight">{currentUser.nom}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{isAr ? 'زبون ممتاز' : 'Client Premium'}</p>
                 </div>
               </div>
             )}
             <button 
               onClick={onLogout}
               className="w-full py-4 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-transparent hover:border-rose-500/20"
             >
               {isAr ? 'تسجيل الخروج' : 'Déconnexion'}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ${isAr ? 'lg:mr-64 md:lg:mr-72' : 'lg:ml-64 md:lg:ml-72'} min-h-screen relative`}>
        {/* Top Header */}
        <header className="h-16 md:h-24 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-3 md:px-10 sticky top-0 z-40">
           <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl border border-slate-200"
              >
                <Layers className="w-5 h-5" />
              </button>
              <h2 className="text-base md:text-2xl font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">
                {activeTab === 'overview' ? (isAr ? 'لوحة التحكم' : 'Tableau de Bord') :
                 activeTab === 'orders' ? (isAr ? 'الطلبيات' : 'Commandes') :
                 activeTab === 'payments' ? (isAr ? 'الدفع والأداء' : 'Paiements') :
                 activeTab === 'docs' ? (isAr ? 'الوثائق' : 'Documents') :
                 activeTab === 'info' ? (isAr ? 'معلومات وأسعار' : 'Infos & Prix') :
                 (isAr ? 'الدعم' : 'Support')}
              </h2>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={async () => {
                  const remote = await syncCompanyProfile();
                  setCompany(remote);
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                title={isAr ? 'تحديث' : 'Actualiser'}
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button onClick={toggle} className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                 {isAr ? 'FR' : 'عربية'}
              </button>
              
              <div className="relative">
                 <button 
                   onClick={() => setShowNotifs(!showNotifs)}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                     showNotifs ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                   }`}
                 >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                 </button>

                 {showNotifs && (
                   <>
                     <div className="fixed inset-0 z-10" onClick={() => setShowNotifs(false)} />
                     <div className={`absolute top-full mt-4 ${isAr ? 'left-0' : 'right-0'} w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300`}>
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                           <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">{isAr ? 'آخر التحديثات' : 'Notifications'}</h3>
                           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest">New</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                           {found.flatMap(cmd => cmd.suivi.map(s => ({ ...s, cmdRef: cmd.reference }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((notif, idx) => (
                             <div key={idx} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="flex gap-4">
                                   <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PHASE_COLORS[notif.phase]}`} />
                                   <div>
                                      <p className="text-xs font-bold text-slate-900 leading-relaxed mb-1">
                                         {isAr ? `الطلبية ${notif.cmdRef} انتقلت لـ ${phaseAr[notif.phase]}` : `Commande ${notif.cmdRef} est passée à ${PHASE_LABELS[notif.phase]}`}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-medium italic">{notif.date}</p>
                                   </div>
                                </div>
                             </div>
                           ))}
                           {found.length === 0 && (
                             <div className="p-10 text-center">
                                <Bell className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune notification</p>
                             </div>
                           )}
                        </div>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="w-full py-4 bg-slate-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-colors"
                        >
                           {isAr ? 'عرض جميع الطلبيات' : 'Voir tout le suivi'}
                        </button>
                     </div>
                   </>
                 )}
              </div>
           </div>
        </header>

        <div className="p-1 md:p-10 max-w-6xl mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Welcome Hero */}
               <div className="bg-slate-900 rounded-2xl md:rounded-[3rem] p-4 md:p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-48 -mt-48" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 text-center md:text-left">
                       <h1 className="text-xl md:text-5xl font-black mb-3 md:6 leading-tight">
                         {isAr ? `مرحباً بك، ${currentUser?.nom || 'عزيزي الزبون'}` : `Heureux de vous revoir, ${currentUser?.nom || 'Cher Client'}`}
                       </h1>
                       <p className="text-slate-400 text-sm md:text-lg font-medium max-w-xl mb-8">
                         {isAr ? 'تبع طلبياتك، حمل فواتيرك، وتواصل مع الفريق ديالنا. حنا هنا باش نسهلو ليك الخدمة.' 
                              : 'Suivez vos productions, gérez vos documents et communiquez avec notre équipe en toute simplicité.'}
                       </p>
                       <button 
                         onClick={() => setShowNewOrderModal(true)}
                         className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-3 mx-auto md:mx-0"
                       >
                         <Plus className="w-5 h-5" />
                         {isAr ? 'طلب جديد' : 'Nouvelle Commande'}
                       </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                       <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center">
                          <p className="text-3xl font-black mb-1">{found.length}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isAr ? 'طلبيات' : 'Commandes'}</p>
                       </div>
                       <div className="bg-indigo-500 border border-indigo-400 p-6 rounded-3xl text-center shadow-lg shadow-indigo-500/20">
                          <p className="text-3xl font-black mb-1">{found.filter(c => c.statut === 'en_cours').length}</p>
                          <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-widest">{isAr ? 'في الإنتاج' : 'Actives'}</p>
                       </div>
                    </div>
                  </div>

                  {/* WhatsApp Notification — CallMeBot setup */}
                  {currentUser?.role === 'client' && currentUser.telephone && (
                    <div className="mt-8 md:mt-12 p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] md:rounded-[2.5rem]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">
                            {isAr ? 'تنبيهات الواتساب' : 'Notifications WhatsApp'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isAr ? 'تفعيل مرة واحدة، يصلك كل شيء تلقائياً' : 'Activer une fois, recevez tout automatiquement'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/10">
                        <p className="text-[11px] text-white/70 font-medium mb-3">
                          {isAr
                            ? '📲 خطوة واحدة فقط: أرسل هذه الرسالة من هاتفك عبر واتساب:'
                            : '📲 Une seule étape : envoyez ce message depuis votre WhatsApp :'}
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-black/30 text-emerald-300 text-xs font-mono px-3 py-2 rounded-xl truncate">
                            I allow callmebot to send me messages
                          </code>
                          <button
                            onClick={() => navigator.clipboard?.writeText('I allow callmebot to send me messages')}
                            className="px-2 py-2 bg-white/10 rounded-xl text-white/60 hover:bg-white/20 transition text-[10px]"
                          >📋</button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {isAr ? 'أرسل للرقم: ' : 'Envoyer à : '}
                          <strong className="text-white/70">+34 644 59 78 07</strong>
                          {' → '}
                          <a
                            href={`https://wa.me/34644597807?text=${encodeURIComponent('I allow callmebot to send me messages')}`}
                            target="_blank" rel="noreferrer"
                            className="text-emerald-400 underline font-bold"
                          >
                            {isAr ? 'افتح واتساب' : 'Ouvrir WhatsApp'}
                          </a>
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium text-center">
                        {isAr
                          ? '✅ بعد الإرسال ستصلك رسالة تأكيد — بعدها تصلك تحديثات طلبيتك تلقائياً'
                          : '✅ Après envoi, vous recevrez un message de confirmation — puis toutes les mises à jour automatiquement'}
                      </p>
                    </div>
                  )}
               </div>

               {/* Recent Orders Overview */}
               <div>
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">{isAr ? 'آخر الطلبيات' : 'Commandes Récentes'}</h3>
                     <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">{isAr ? 'عرض الكل' : 'Voir tout'}</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {found.slice(0, 2).map(cmd => {
                      const progress = (getPhaseIndex(cmd.phase) / (PHASE_ORDER.length - 1)) * 100;
                      const isActive = cmd.statut !== 'livré';
                      return (
                        <div key={cmd.id} className="bg-white/70 backdrop-blur-xl p-4 md:p-10 rounded-2xl md:rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50 group hover:border-indigo-400 transition-all duration-500 relative overflow-hidden">
                          {/* Live Indicator */}
                          {isActive && (
                            <div className="absolute top-6 left-6 flex items-center gap-2">
                               <span className="relative flex h-3 w-3">
                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                 <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                               </span>
                               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'مباشر' : 'Live'}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-10 pt-4">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isAr ? 'رقم الطلبية' : 'Référence'}</span>
                                <span className="text-sm font-black text-indigo-600 uppercase tracking-tighter">{cmd.reference}</span>
                             </div>
                             <div className="text-right">
                                <span className={`inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                                  cmd.statut === 'livré' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                  {isAr ? phaseAr[cmd.phase] : PHASE_LABELS[cmd.phase]}
                                </span>
                             </div>
                          </div>

                          <div className="mb-10 text-center md:text-left">
                             <h4 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{cmd.modele}</h4>
                             <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                <span>Quantité:</span>
                                <span className="text-slate-900">{cmd.quantite} pcs</span>
                             </div>
                          </div>
                          
                          <div className="space-y-6">
                             <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'حالة التقدم' : 'Progression'}</p>
                                <p className="text-xl font-black text-indigo-600">{Math.round(progress)}%</p>
                             </div>
                             <div className="h-4 w-full bg-slate-50 rounded-full p-1 border border-slate-100 shadow-inner mb-8">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-200" 
                                  style={{ width: `${progress}%` }} 
                                />
                             </div>
                             
                             {/* Production Roadmap Icons */}
                             <div className="relative pt-4 px-2">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                                <div className="relative z-10 flex justify-between items-center">
                                   {PHASE_ORDER.map((p, idx) => {
                                     const isCompleted = getPhaseIndex(cmd.phase) >= idx;
                                     const isCurrent = cmd.phase === p;
                                     return (
                                       <div key={p} className="flex flex-col items-center gap-1 md:gap-2 group/step">
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                            isCompleted 
                                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                                              : 'bg-white text-slate-300 border border-slate-100'
                                          } ${isCurrent ? 'ring-4 ring-indigo-50' : ''}`}>
                                             {phaseIcons[p]}
                                          </div>
                                          <span className={`text-[8px] font-black uppercase tracking-tighter ${isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>
                                             {isAr ? phaseAr[p] : PHASE_LABELS[p]}
                                          </span>
                                       </div>
                                     );
                                   })}
                                </div>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'demandes' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-center md:text-left">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{isAr ? 'تتبع طلباتي' : 'Mes Demandes'}</h1>
                    <p className="text-slate-500 font-medium italic">{isAr ? 'حالة الطلبات اللي صيفطتي' : 'Statut de vos demandes envoyées'}</p>
                  </div>
               </div>

               {mesDemandes.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                   <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <MessageCircle className="w-10 h-10 text-indigo-300" />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 mb-2">{isAr ? 'ماكاين حتى طلب' : 'Aucune demande'}</h3>
                   <p className="text-slate-500">{isAr ? 'باقي ما صيفطتي لينا حتى موديل' : 'Vous n\'avez encore envoyé aucun modèle.'}</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {mesDemandes.map(d => {
                     const isAccepted = d.crmStage === 'confirme';
                     const isRejected = d.crmStage === 'annule';
                     const isPending = !isAccepted && !isRejected;
                     
                     return (
                       <div key={d.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group">
                         <div className="h-48 bg-slate-100 relative overflow-hidden">
                           {leadPhotos[d.id] ? (
                             <img src={leadPhotos[d.id]} alt={d.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                           ) : (
                             <div className="w-full h-full flex flex-col gap-2 items-center justify-center bg-slate-50 text-slate-300">
                               <Camera className="w-10 h-10" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? 'بدون صورة' : 'Pas de photo'}</span>
                             </div>
                           )}
                           <div className="absolute top-4 left-4">
                             {isAccepted && <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">{isAr ? 'مقبول ✅' : 'Accepté ✅'}</span>}
                             {isRejected && <span className="px-3 py-1 bg-rose-500/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">{isAr ? 'مرفوض ❌' : 'Refusé ❌'}</span>}
                             {isPending && <span className="px-3 py-1 bg-amber-500/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">{isAr ? 'قيد المراجعة ⏳' : 'En attente ⏳'}</span>}
                           </div>
                         </div>
                         <div className="p-6">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">REF: {d.id.substring(0, 8)}</div>
                           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 truncate" title={d.type}>{d.type}</h3>
                           <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl inline-block">
                             {isAr ? 'الكمية:' : 'Quantité :'} <span className="text-indigo-600">{d.quantity}</span>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-center md:text-left">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{isAr ? 'تتبع الإنتاج' : 'Mes Productions'}</h1>
                    <p className="text-slate-500 font-medium italic">{isAr ? 'إليك تفاصيل كاملة عن سير أعمالك' : 'Détails complets de vos commandes en cours'}</p>
                  </div>
                  <div className="relative mx-auto md:mx-0 w-full md:w-auto">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Référence..."
                       className="pl-11 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200/50 outline-none focus:border-indigo-600 transition-all w-full md:w-64"
                       value={reference}
                       onChange={(e) => setReference(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                     />
                  </div>
               </div>

               <div className="space-y-4 md:space-y-8">
                 {found.map(cmd => (
                   <div key={cmd.id} id={`order-card-${cmd.id}`} className="bg-white rounded-xl md:rounded-[3rem] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden group transition-all duration-500 hover:shadow-indigo-100">
                      {/* PRO Gradient Header */}
                      <div className="p-3 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8 relative overflow-hidden text-center md:text-left">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                         <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10 w-full md:w-auto">
                            <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden shrink-0">
                               {(cmd as any).modelePhoto || (cmd as any).photo ? (
                                  <img src={(cmd as any).modelePhoto || (cmd as any).photo} className="w-full h-full object-cover" alt={cmd.modele} />
                               ) : (
                                  <Package className="w-5 h-5 md:w-10 md:h-10" />
                               )}
                            </div>
                            <div>
                               <div className="flex items-center justify-center md:justify-start gap-3 mb-1.5 md:mb-2">
                                  <span className="px-3 py-1 bg-indigo-500/30 border border-white/20 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{cmd.reference}</span>
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                               </div>
                               <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none">{cmd.modele}</h3>
                               
                               {/* Status centered below for mobile */}
                               <div className="mt-3 md:hidden">
                                  <span className="px-5 py-2 bg-white/10 backdrop-blur-xl text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-2xl inline-block">
                                     {isAr ? phaseAr[cmd.phase] : PHASE_LABELS[cmd.phase]}
                                  </span>
                               </div>
                            </div>
                         </div>

                         {/* Status on Right for Desktop */}
                         <div className="hidden md:flex items-center gap-8 relative z-10">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 opacity-80">{isAr ? 'الحالة الحالية للإنتاج' : 'Statut Actuel'}</p>
                                <span className="px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-xl inline-block group-hover:bg-indigo-500 transition-colors">
                                   {isAr ? phaseAr[cmd.phase] : PHASE_LABELS[cmd.phase]}
                                </span>
                             </div>
                         </div>
                      </div>

                      {/* Roadmap Section */}
                      <div className="p-2 md:p-8 text-center md:text-left">
                          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 mb-4 md:mb-8">
                             <div className="flex flex-col items-center md:items-start gap-1 w-full md:w-auto">
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                                   <span className="relative flex h-2 w-2">
                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                     <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                   </span>
                                   <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-[0.2em]">{isAr ? 'تتبع مباشر' : 'Live Tracking'}</span>
                                </div>
                                <h4 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest mt-1">{isAr ? 'مسار الإنتاج الدقيق' : 'Precision Production Flow'}</h4>
                             </div>
                             
                             <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl w-full md:w-auto justify-center">
                                   <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-sm" />
                                   <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'جودة مضمونة' : 'Crafted with Precision'}</span>
                                </div>
                                <div className="text-indigo-600 font-black text-xl bg-indigo-50 px-5 py-1.5 rounded-xl border border-indigo-100 shadow-sm w-full md:w-auto text-center">{Math.round((getPhaseIndex(cmd.phase) / (PHASE_ORDER.length - 1)) * 100)}%</div>
                             </div>
                          </div>
                          
                          <div className="relative pt-2 md:pt-4 pb-1 md:pb-2 overflow-x-auto no-scrollbar">
                             <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full min-w-[320px] md:min-w-0" />
                             <div className="relative z-10 flex justify-between items-center min-w-[320px] md:min-w-0 px-2 md:px-0">
                                {PHASE_ORDER.map((p, idx) => {
                                  const isCompleted = getPhaseIndex(cmd.phase) >= idx;
                                  const isCurrent = cmd.phase === p;
                                  return (
                                    <div key={p} className="flex flex-col items-center gap-1 md:gap-2 group/step">
                                       <div className={`w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                         isCompleted 
                                           ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                           : 'bg-white text-slate-300 border-2 border-slate-100'
                                       } ${isCurrent ? 'ring-4 md:ring-6 ring-indigo-50 scale-110 shadow-xl shadow-indigo-500/20 border-indigo-200' : ''}`}>
                                          {phaseIcons[p]}
                                       </div>
                                       <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-tighter text-center max-w-[50px] md:max-w-[70px] leading-tight ${isCompleted ? 'text-indigo-700' : 'text-slate-500'}`}>
                                          {isAr ? phaseAr[p] : PHASE_LABELS[p]}
                                       </span>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                      </div>
                      
                      {/* Annulation status banner */}
                      {cmd.statut === 'annulation_demandee' && (
                        <div className="mx-4 md:mx-8 mb-3 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
                          <span className="text-lg">⏳</span>
                          <div>
                            <p className="text-xs font-black text-orange-700 uppercase tracking-wide">
                              {isAr ? 'طلب الإلغاء قيد المعالجة' : 'Demande d\'annulation en cours'}
                            </p>
                            <p className="text-[10px] text-orange-500 font-medium">
                              {isAr ? 'في انتظار تأكيد الفريق' : 'En attente de confirmation par notre équipe'}
                            </p>
                          </div>
                        </div>
                      )}
                      {cmd.statut === 'annulé' && (
                        <div className="mx-4 md:mx-8 mb-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                          <span className="text-lg">❌</span>
                          <p className="text-xs font-black text-red-700 uppercase tracking-wide">
                            {isAr ? 'تم إلغاء الطلبية' : 'Commande annulée'}
                          </p>
                        </div>
                      )}

                      {/* Footer Section with Separator */}
                      <div className="px-4 md:px-8 pb-4 md:pb-6 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6 border-t border-slate-100 pt-3 md:pt-6 bg-slate-50/40 text-center md:text-left">
                         <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                            <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                               <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-500" />
                               {isAr ? 'موعد التسليم:' : 'Livraison:'} <span className="text-slate-950 ml-1 font-black">{cmd.dateLivraisonPrevue}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                               <Truck className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-500" />
                               {isAr ? 'الكمية:' : 'Quantité:'} <span className="text-slate-950 ml-1 font-black">{cmd.quantite} Pcs</span>
                            </div>
                         </div>
                         
                         {/* Annulation button */}
                         {cmd.statut !== 'annulé' && cmd.statut !== 'annulation_demandee' && cmd.statut !== 'livré' && (
                           <button
                             onClick={() => { setAnnulationModal({ cmdId: cmd.id, cmdRef: cmd.reference }); setAnnulationRaison(''); }}
                             className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all"
                           >
                             ✕ {isAr ? 'طلب الإلغاء' : 'Annuler'}
                           </button>
                         )}

                         {/* Secondary Countdown Badge - Full width on Mobile */}
                         <div className="flex items-center justify-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-200 w-full md:w-auto">
                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{isAr ? 'الوقت المتبقي' : 'Temps Restant'}</span>
                            <div className="flex gap-2.5 text-xs font-black text-emerald-400">
                               <span className="flex items-baseline gap-0.5">02<span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">d</span></span>
                               <span className="flex items-baseline gap-0.5">14<span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">h</span></span>
                               <span className="flex items-baseline gap-0.5 animate-pulse">45<span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">m</span></span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-10 text-center md:text-left">
                  <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{isAr ? 'الفواتير والوثائق' : 'Documents & Factures'}</h1>
                  <p className="text-slate-500 font-medium">{isAr ? 'إدارة كاملة لجميع وثائقك المحاسبية والتقنية' : 'Gérez l\'ensemble de vos documents comptables et techniques'}</p>
               </div>

               {/* Technical Sheets Section */}
               <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                     <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center"><Scissors className="w-4 h-4" /></div>
                     {isAr ? 'الملفات التقنية' : 'Dossiers Techniques'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {fiches.filter(f => (f.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase()).map(f => (
                        <div key={f.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-indigo-200 transition-all">
                           <div className="relative aspect-[4/5] bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                              {f.photo ? (
                                 <img src={f.photo} alt={f.modele} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                                    <FileText className="w-12 h-12" />
                                    <span className="text-[10px] font-black uppercase mt-2">No Visual</span>
                                 </div>
                              )}
                              <div className="absolute top-4 left-4">
                                 <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-indigo-600 shadow-sm border border-white">
                                    {f.type || (isAr ? 'موديل' : 'Modèle')}
                                 </span>
                              </div>
                           </div>
                           <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">{f.modele}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{f.tailles.length} {isAr ? 'مقاسات متاحة' : 'Tailles disponibles'}</p>
                           
                           <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setViewMesuresFiche(f)}
                                className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                              >
                                 <Eye className="w-3.5 h-3.5" /> {isAr ? 'عرض' : 'Voir'}
                              </button>
                              <button 
                                onClick={() => printFT(f)}
                                className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                              >
                                 <Download className="w-3.5 h-3.5" /> PDF
                              </button>
                           </div>
                        </div>
                     ))}
                     {fiches.filter(f => (f.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase()).length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                           <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">{isAr ? 'لا يوجد ملف تقني حاليا' : 'Aucun dossier technique disponible'}</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Financial Documents Sections */}
               {(() => {
                 const clientDocs = factures.filter(f => (f.client || '').trim().toLowerCase() === (currentUser?.nom || '').trim().toLowerCase());
                 const devisList = clientDocs.filter(f => f.typeDoc === 'devis');
                 const recusList = clientDocs.filter(f => f.typeDoc === 'recu');
                 const facturesList = clientDocs.filter(f => !f.typeDoc || f.typeDoc === 'facture');
                 
                 const renderList = (list: Facture[], titleAr: string, titleFr: string, bgClass: string, textClass: string, bgLightClass: string, hoverBorderClass: string) => (
                   list.length > 0 && (
                     <div className="mb-10">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                           <div className={`w-8 h-8 ${bgClass} text-white rounded-lg flex items-center justify-center`}><Receipt className="w-4 h-4" /></div>
                           {isAr ? titleAr : titleFr}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {list.map(f => (
                              <div key={f.id} className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all ${hoverBorderClass}`}>
                                 {f.preuvePaiement ? (
                                   <div 
                                     onClick={() => { const w = window.open(); w?.document.write(`<img src="${f.preuvePaiement}" style="max-width:100%;" />`); }}
                                     className="absolute top-6 right-6 w-28 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform z-20 bg-slate-50 flex items-center justify-center group/img"
                                     title="Voir l'image"
                                   >
                                     <img src={f.preuvePaiement} alt="Preuve" className="w-full h-full object-cover group-hover/img:opacity-80 transition-opacity" />
                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                       <Eye className="w-5 h-5 text-slate-900 drop-shadow-md" />
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                      <Receipt className={`w-24 h-24 ${textClass}`} />
                                   </div>
                                 )}
                                 <div className="relative z-10 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                                       <div className={`w-10 h-10 ${bgLightClass} rounded-xl flex items-center justify-center ${textClass}`}>
                                          <Receipt className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                             {f.typeDoc === 'devis' ? 'Devis' : f.typeDoc === 'recu' ? 'Reçu d\'avance' : 'Facture'}
                                          </p>
                                          <p className="text-sm font-black text-slate-900 uppercase mb-0.5">{f.numero}</p>
                                          <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {(() => {
                                              const dateStr = (f as any).created_at || f.date;
                                              if (!dateStr) return '—';
                                              const d = new Date(dateStr);
                                              // Check if it has time component
                                              if (dateStr.includes('T') || (f as any).created_at) {
                                                return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }).replace(',', ' à');
                                              }
                                              return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                            })()}
                                          </p>
                                       </div>
                                    </div>
                                    
                                    {f.typeDoc === 'recu' ? (
                                      <div className="space-y-2 mb-8">
                                        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'إجمالي الطلب' : 'Total commande'}</p>
                                          <p className="text-sm font-black text-slate-700">{f.montant.toLocaleString()} MAD</p>
                                        </div>
                                        <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5">
                                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">✓ {isAr ? 'أفونس مدفوع' : 'Avance payée'}</p>
                                          <p className="text-sm font-black text-emerald-700">{(f.avance || 0).toLocaleString()} MAD</p>
                                        </div>
                                        {(() => {
                                          const reste = f.montant - (f.avance || 0);
                                          return reste > 0 ? (
                                            <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-2.5">
                                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{isAr ? 'المتبقي للأداء' : 'Reste à payer'}</p>
                                              <p className="text-sm font-black text-amber-700">{reste.toLocaleString()} MAD</p>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5">
                                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'المتبقي للأداء' : 'Reste à payer'}</p>
                                              <p className="text-sm font-black text-emerald-700">0 MAD ✓</p>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    ) : (
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'المبلغ' : 'Montant'}</p>
                                          <p className={`text-xl font-black ${textClass}`}>{f.montant.toLocaleString()} MAD</p>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الحالة' : 'Statut'}</p>
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            f.statut === 'payée' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                          }`}>
                                             {isAr ? (f.statut === 'payée' ? 'مؤداة' : 'في الانتظار') : f.statut}
                                          </span>
                                       </div>
                                    </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                      {/* PDF Download */}
                                      <button
                                        onClick={() => { setSelectedFacture(f); setShowInvoiceView(true); }}
                                        className={`w-full py-4 ${bgClass} text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl`}
                                      >
                                         <Download className="w-4 h-4" />
                                         {isAr
                                           ? f.typeDoc === 'recu' ? 'وصل الأداء الرسمي' : f.typeDoc === 'devis' ? 'تحميل العرض' : 'الفاتورة الرسمية'
                                           : f.typeDoc === 'recu' ? 'Reçu d\'Avance Officiel' : f.typeDoc === 'devis' ? 'Télécharger le Devis' : 'Facture Officielle'
                                         }
                                      </button>

                                      {/* Admin-uploaded proof — shown as visible image */}
                                      {f.preuvePaiement && (
                                        <div className="rounded-2xl overflow-hidden border-2 border-emerald-200 bg-emerald-50/50">
                                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-100">
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                              <span className="text-white text-[10px] font-black">✓</span>
                                            </div>
                                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex-1">
                                              {isAr ? 'وصل الاستلام الرسمي' : 'Reçu officiel BEYA'}
                                            </p>
                                            <button
                                              onClick={() => {
                                                const a = document.createElement('a');
                                                a.href = f.preuvePaiement!;
                                                a.download = `Preuve_${f.numero || 'recu'}.jpg`;
                                                a.target = '_blank';
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                              }}
                                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-all"
                                              title="Télécharger"
                                            >
                                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                                            </button>
                                          </div>
                                          <img
                                            src={f.preuvePaiement}
                                            alt="Preuve paiement"
                                            className="w-full object-cover cursor-zoom-in"
                                            style={{ maxHeight: '200px' }}
                                            onClick={() => window.open(f.preuvePaiement, '_blank')}
                                          />
                                        </div>
                                      )}

                                      {/* Client proof upload zone — only for reçu */}
                                      {f.typeDoc === 'recu' && (
                                        <div className="mt-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                              {isAr ? 'إثبات الدفع' : 'Ma Preuve de Paiement'}
                                            </span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                          </div>

                                          {f.statut === 'en_verification' || f.preuveClient ? (
                                            /* Already uploaded */
                                            <div className="rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/50">
                                              {f.preuveClient && (
                                                <div className="relative">
                                                  <img src={f.preuveClient} alt="Preuve" className="w-full h-24 object-cover" />
                                                  <div className="absolute inset-0 bg-amber-900/10" />
                                                </div>
                                              )}
                                              <div className="flex items-center gap-2 px-4 py-3">
                                                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                </div>
                                                <div className="flex-1">
                                                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">
                                                    {isAr ? 'في انتظار التأكيد' : 'En attente de vérification'}
                                                  </p>
                                                  <p className="text-[9px] text-amber-500 font-medium">
                                                    {isAr ? 'سيتم التأكيد خلال 24 ساعة' : 'Confirmation sous 24h'}
                                                  </p>
                                                </div>
                                                {/* Re-upload option */}
                                                <label className="cursor-pointer">
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadPreuveClient(f.id, file); e.target.value = ''; }}
                                                  />
                                                  <span className="text-[9px] text-amber-500 font-black uppercase underline cursor-pointer">
                                                    {isAr ? 'تغيير' : 'Changer'}
                                                  </span>
                                                </label>
                                              </div>
                                            </div>
                                          ) : (
                                            /* Upload zone */
                                            <label className="cursor-pointer block">
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadPreuveClient(f.id, file); e.target.value = ''; }}
                                              />
                                              <div className={`w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 py-5 px-4
                                                ${uploadingPreuve === f.id
                                                  ? 'border-indigo-300 bg-indigo-50/50'
                                                  : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
                                                }`}>
                                                {uploadingPreuve === f.id ? (
                                                  <>
                                                    <RotateCw className="w-5 h-5 text-indigo-500 animate-spin" />
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase">{isAr ? 'جاري الرفع...' : 'Envoi...'}</p>
                                                  </>
                                                ) : (
                                                  <>
                                                    <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                                                      <Camera className="w-4.5 h-4.5 text-slate-400" />
                                                    </div>
                                                    <div className="text-center">
                                                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">
                                                        {isAr ? 'أرسل صورة الدفع' : 'Envoyer screenshot virement'}
                                                      </p>
                                                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                                        {isAr ? 'صورة من التطبيق البنكي' : 'Photo app bancaire / chèque'}
                                                      </p>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </label>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )
                 );

                 return (
                   <>
                     {renderList(devisList, 'عروض الأسعار (Devis)', 'Devis et Estimations', 'bg-indigo-600', 'text-indigo-600', 'bg-indigo-50', 'hover:border-indigo-200')}
                     {renderList(recusList, 'وصولات الأداء والأفونس', 'Reçus de Paiement', 'bg-emerald-600', 'text-emerald-600', 'bg-emerald-50', 'hover:border-emerald-200')}
                     {renderList(facturesList, 'الفواتير المالية', 'Factures Financières', 'bg-slate-800', 'text-slate-800', 'bg-slate-100', 'hover:border-slate-300')}
                     
                     {clientDocs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                           <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">{isAr ? 'لا توجد وثائق حاليا' : 'Aucun document disponible'}</p>
                        </div>
                     )}
                   </>
                 );
               })()}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">{isAr ? 'الدفع والأداء' : 'Paiements & Virements'}</h2>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bank Info */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                     <Building className="w-12 h-12 text-indigo-400 mb-6 relative z-10" />
                     <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-indigo-100 relative z-10">{isAr ? 'المعلومات البنكية' : 'Coordonnées Bancaires'}</h3>
                     
                     <div className="space-y-4 relative z-10">
                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                           <div>
                             <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">{isAr ? 'البنك' : 'Banque'}</p>
                             <p className="text-lg font-bold tracking-tight">{company.bankName || 'CIH BANK'}</p>
                           </div>
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                             {(company.bankName || 'CIH BANK').toLowerCase().includes('cih') ? (
                               <img src="/cih-logo.png" className="w-8 h-8 object-contain" alt="CIH BANK" />
                             ) : (
                               <Building className="w-6 h-6 text-indigo-300" />
                             )}
                           </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                           <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1">{isAr ? 'اسم المستفيد' : 'Bénéficiaire'}</p>
                           <p className="text-lg font-bold tracking-tight">{company.bankBeneficiary || company.name}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 group cursor-pointer hover:bg-white/20 transition-all relative overflow-hidden" onClick={() => {
                          navigator.clipboard.writeText(company.rib || '230000000000000000000000');
                          setRibCopied(true);
                          setTimeout(() => setRibCopied(false), 2000);
                        }}>
                           <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2 ${ribCopied ? 'opacity-100 translate-y-6 z-20' : 'opacity-0 translate-y-0 -z-10'}`}>
                              <Check className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'تم النسخ بنجاح' : 'RIB Copié !'}</span>
                           </div>
                           <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-1 relative z-10">{isAr ? 'رقم الحساب (RIB)' : 'RIB (24 chiffres)'}</p>
                           <div className="flex items-center justify-between relative z-10 gap-4">
                             <p className="text-sm sm:text-base md:text-lg font-black tracking-wider font-mono whitespace-nowrap overflow-x-auto no-scrollbar">{company.rib || '230 000 00000000000000 00'}</p>
                             {ribCopied ? (
                               <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                 <Check className="w-4 h-4 text-emerald-400" />
                                 <span className="text-[10px] font-black uppercase text-emerald-400">{isAr ? 'تم' : 'Copié'}</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 group-hover:bg-white/20 group-hover:border-white/30 transition-all">
                                 <FileText className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors" />
                                 <span className="text-[10px] font-black uppercase text-indigo-300 group-hover:text-white transition-colors">{isAr ? 'نسخ' : 'Copier'}</span>
                               </div>
                             )}
                           </div>
                        </div>

                        {company.bankQrCode && (
                          <div className="mt-6 flex flex-col items-center">
                            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-3">{isAr ? 'مسح QR Code للدفع السريع' : 'Scanner pour payer'}</p>
                            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/20">
                              <img src={company.bankQrCode} alt="Bank QR Code" className="w-40 h-40 object-cover rounded-xl" />
                            </div>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Upload Receipt */}
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-slate-800">{isAr ? 'تأكيد الدفع' : 'Confirmer un paiement'}</h3>
                     <p className="text-xs text-slate-500 font-bold mb-6">{isAr ? 'أرسل لنا صورة من التوصيل البنكي أو السكرينشوت' : 'Envoyez-nous le reçu ou screenshot de votre virement'}</p>
                     
                     {virementSent ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 animate-in zoom-in duration-500">
                           <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-4 shadow-lg shadow-emerald-100">
                             <CircleCheck className="w-10 h-10" />
                           </div>
                           <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{isAr ? 'تم الإرسال بنجاح!' : 'Reçu envoyé !'}</h4>
                           <p className="text-sm font-medium text-slate-500">{isAr ? 'سيتم مراجعة التوصيل وتأكيد الدفع في أقرب وقت.' : 'Votre paiement sera validé prochainement.'}</p>
                           <button onClick={() => setVirementSent(false)} className="mt-6 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                              {isAr ? 'إرسال توصيل آخر' : 'Nouveau paiement'}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-6 flex-1 flex flex-col">
                           <div className="grid grid-cols-1 gap-6">
                             <div>
                                <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'الطلبية المعنية (اختياري)' : 'Commande concernée (Optionnel)'}</label>
                                <select
                                  value={virementCommandeId}
                                  onChange={e => setVirementCommandeId(e.target.value)}
                                  className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer ${isAr ? 'text-right' : ''}`}
                                >
                                  <option value="">{isAr ? '— بدون تحديد طلبية —' : '— Sans commande spécifique —'}</option>
                                  {found.map(c => (
                                    <option key={c.id} value={c.id}>{c.reference} — {c.modele}</option>
                                  ))}
                                </select>
                             </div>

                             <div>
                                <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'المبلغ المحول (درهم)' : 'Montant viré (MAD)'}</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    value={virementMontant}
                                    onChange={e => setVirementMontant(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black outline-none focus:border-indigo-500 transition-colors ${isAr ? 'text-right' : ''}`}
                                  />
                                  <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 font-black ${isAr ? 'left-5' : 'right-5'}`}>MAD</span>
                                </div>
                             </div>
                           </div>
                           
                           <div className="flex-1">
                              <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'صورة التوصيل' : 'Photo du reçu'}</label>
                              <div className="relative h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-400 transition-colors cursor-pointer group">
                                {virementPhoto ? (
                                  <>
                                    <img src={virementPhoto} className="w-full h-full object-cover" />
                                    <button onClick={() => setVirementPhoto(null)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg"><X className="w-4 h-4" /></button>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                      <Upload className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{isAr ? 'اضغط لرفع الصورة' : 'Cliquez pour uploader'}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const compressed = await compressImage(file);
                                          setVirementPhoto(compressed);
                                        } catch (err) {}
                                      }
                                    }} />
                                  </label>
                                )}
                              </div>
                           </div>

                           <button 
                             disabled={sendingVirement || !virementPhoto || !virementMontant}
                             onClick={async () => {
                               if(!currentUser || !virementMontant || !virementPhoto) return;
                               setSendingVirement(true);
                               try {
                                 const newFacture: Partial<Facture> = {
                                   id: Math.random().toString(36).substr(2, 9),
                                   numero: `REC-${Date.now().toString().slice(-6)}`,
                                   client: currentUser.nom,
                                   commandeId: virementCommandeId || undefined,
                                   date: new Date().toISOString(),
                                   echeance: new Date().toISOString().split('T')[0],
                                   montant: parseFloat(virementMontant),
                                   typeDoc: 'recu',
                                   statut: 'en_verification',
                                   banque: 'virement',
                                   articles: [],
                                   preuveClient: virementPhoto
                                 };
                                 await saveRecord('factures', newFacture);
                                 try {
                                   const { sendPushToAll } = await import('../utils/pushNotifications');
                                   sendPushToAll(isAr ? '💰 توصيل دفع جديد' : '💰 Nouveau Reçu', `${currentUser.nom} - ${virementMontant} MAD`, '/recus');
                                 } catch (_) {}
                                 setVirementSent(true);
                                 setVirementMontant('');
                                 setVirementCommandeId('');
                                 setVirementPhoto(null);
                               } catch (err) {
                                 console.error(err);
                               } finally {
                                 setSendingVirement(false);
                               }
                             }}
                             className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/30"
                           >
                             {sendingVirement ? <RotateCw className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                             {isAr ? 'إرسال التوصيل' : 'Envoyer le reçu'}
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'DISABLED_atelier' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Hero banner */}
              <div className="relative rounded-[2.5rem] overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63)' }}>
                {company.aboutPhotoUrl && (
                  <img src={company.aboutPhotoUrl} alt="Atelier" className="w-full h-52 object-cover opacity-30 mix-blend-luminosity" />
                )}
                <div className={`${company.aboutPhotoUrl ? 'absolute inset-0' : 'py-12'} flex flex-col items-center justify-center text-center p-8`}>
                  <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                    <Scissors className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                    {isAr ? company.aboutTitleAr || 'مصنعنا' : company.aboutTitleFr || 'Notre Atelier'}
                  </h2>
                  <p className="text-white/60 text-sm font-medium max-w-sm">
                    {isAr ? 'نصنع بدقة وشغف منذ سنوات' : 'Fabrication avec précision et passion'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: company.experienceYears || '5+', label: isAr ? 'سنوات خبرة' : 'Ans d\'exp.', icon: '🏆' },
                  { value: '50+', label: isAr ? 'زبون راضٍ' : 'Clients', icon: '🤝' },
                  { value: '1000+', label: isAr ? 'قطعة منجزة' : 'Pièces', icon: '👗' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-4 text-center">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="text-xl font-black text-slate-900">{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* About text */}
              {(company.aboutTextFr || company.aboutTextAr) && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    {isAr ? 'من نحن' : 'Qui sommes-nous'}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {isAr ? company.aboutTextAr : company.aboutTextFr}
                  </p>
                </div>
              )}

              {/* Production steps */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  {isAr ? 'مراحل الإنتاج' : 'Notre Process de Production'}
                </h3>
                <div className="space-y-3">
                  {[
                    { step: '01', icon: '📐', labelFr: 'Patronage & Modélisme', labelAr: 'الباترون والتصميم', descFr: 'Création du patron de base selon vos mesures', descAr: 'إنشاء الباترون حسب قياساتكم' },
                    { step: '02', icon: '✂️', labelFr: 'Coupe', labelAr: 'الفصالة', descFr: 'Découpe précise du tissu', descAr: 'قص دقيق للقماش' },
                    { step: '03', icon: '🧵', labelFr: 'Montage & Couture', labelAr: 'الخياطة', descFr: 'Assemblage soigné de toutes les pièces', descAr: 'تجميع دقيق لجميع القطع' },
                    { step: '04', icon: '✨', labelFr: 'Finition', labelAr: 'الفينيسيون', descFr: 'Broderie, étiquettes, détails finaux', descAr: 'تطريز، ملصقات، التفاصيل النهائية' },
                    { step: '05', icon: '🔍', labelFr: 'Contrôle Qualité', labelAr: 'مراقبة الجودة', descFr: 'Vérification rigoureuse avant livraison', descAr: 'فحص دقيق قبل التسليم' },
                    { step: '06', icon: '📦', labelFr: 'Emballage & Livraison', labelAr: 'التغليف والتسليم', descFr: 'Emballage soigné et livraison sécurisée', descAr: 'تغليف عناية وتسليم آمن' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg shrink-0">{p.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-800">{isAr ? p.labelAr : p.labelFr}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{isAr ? p.descAr : p.descFr}</p>
                      </div>
                      <span className="text-[10px] font-black text-indigo-300">{p.step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications / Engagements */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isAr ? 'التزاماتنا' : 'Nos Engagements'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '✅', labelFr: 'Échantillon validé', labelAr: 'عينة معتمدة' },
                    { icon: '🔒', labelFr: 'Confidentialité design', labelAr: 'سرية التصميم' },
                    { icon: '📸', labelFr: 'Photos de production', labelAr: 'صور الإنتاج' },
                    { icon: '💬', labelFr: 'Suivi WhatsApp', labelAr: 'متابعة واتساب' },
                    { icon: '🏷️', labelFr: 'Étiquettes sur mesure', labelAr: 'ملصقات مخصصة' },
                    { icon: '🚚', labelFr: 'Livraison assurée', labelAr: 'توصيل مضمون' },
                  ].map((e, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl px-3 py-2.5">
                      <span className="text-base">{e.icon}</span>
                      <p className="text-[11px] font-bold text-slate-700">{isAr ? e.labelAr : e.labelFr}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vision/Mission */}
              {(company.visionTextFr || company.missionTextFr) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.visionTextFr && (
                    <div className="bg-indigo-50 rounded-[2rem] border border-indigo-100 p-6">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">👁 {isAr ? 'رؤيتنا' : 'Notre Vision'}</p>
                      <p className="text-sm text-indigo-900 font-medium leading-relaxed">{isAr ? company.visionTextAr : company.visionTextFr}</p>
                    </div>
                  )}
                  {company.missionTextFr && (
                    <div className="bg-violet-50 rounded-[2rem] border border-violet-100 p-6">
                      <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">🎯 {isAr ? 'مهمتنا' : 'Notre Mission'}</p>
                      <p className="text-sm text-violet-900 font-medium leading-relaxed">{isAr ? company.missionTextAr : company.missionTextFr}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isAr ? 'معلومات وأسعار' : 'Infos & Prix'}
                </h2>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/#/info`;
                    if (navigator.share) {
                      navigator.share({ title: `${company.name} — Info`, url });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert(isAr ? '✅ تم نسخ الرابط' : '✅ Lien copié !');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {isAr ? 'مشاركة الرابط' : 'Partager'}
                </button>
              </div>
              <ClientInfo company={company} />
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               {/* Info page quick link */}
               <a href="/#/info" target="_blank" rel="noreferrer"
                 className="flex items-center gap-4 p-5 rounded-[2rem] border border-indigo-100 hover:border-indigo-300 transition-all group"
                 style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' }}>
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>📋</div>
                 <div className="flex-1">
                   <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">
                     {isAr ? 'الأسعار، المواعيد والخدمات' : 'Prix, Délais & Services'}
                   </p>
                   <p className="text-[11px] text-indigo-500 font-medium mt-0.5">
                     {isAr ? 'اطلع على الأسئلة الشائعة قبل تواصلك معنا' : 'Consultez la FAQ avant de nous contacter'}
                   </p>
                 </div>
                 <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
               </a>

               <div className="text-center max-w-2xl mx-auto mb-16">
                 <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-xl shadow-indigo-100">
                    <MessageCircle className="w-10 h-10" />
                 </div>
                 <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{isAr ? 'الدعم الفني المباشر' : 'Support VIP Direct'}</h1>
                 <p className="text-slate-500 font-medium text-lg italic">
                   {isAr ? 'فريق بيا كرياتيف رهن إشارتكم لأي استفسار أو مناقشة' : 'Notre équipe est à votre disposition pour toute question أو discussion stratégique.'}
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <a href={`https://wa.me/${company.phone.replace(/\D/g, '')}`} target="_blank" className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
                     <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">WhatsApp Business</h3>
                     <p className="text-slate-400 text-sm font-medium mb-8 italic">{isAr ? 'تواصل مباشر وسريع' : 'Réponse instantanée'}</p>
                     <div className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-100">{isAr ? 'ابدأ المحادثة' : 'Démarrer Discussion'}</div>
                  </a>

                  <a 
                    href={`https://wa.me/${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      isAr 
                        ? `مرحباً فريق ${company.name}، أنا ${currentUser?.nom}. بغيت نطلب موعد لمناقشة تقنية بخصوص الموديلات ديالي.`
                        : `Bonjour l'équipe ${company.name}, je suis ${currentUser?.nom}. J'aimerais demander un rendez-vous pour une discussion technique concernant mes modèles.`
                    )}`}
                    target="_blank"
                    className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:border-indigo-200 transition-all"
                  >
                     <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <ArrowRight className="rotate-[-45deg] w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{isAr ? 'المناقشة التقنية' : 'Discussion Technique'}</h3>
                     <p className="text-slate-400 text-sm font-medium mb-8 italic">{isAr ? 'اطلب موعد لمناقشة التصميم' : 'Prendre rendez-vous technique'}</p>
                     <div className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all group-hover:bg-indigo-600">
                        {isAr ? 'طلب موعد' : 'Prendre Rendez-vous'}
                     </div>
                  </a>
               </div>
            </div>
          )}
        </div>
      </main>


      {/* Annulation Modal */}
      {annulationModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 text-lg">✕</div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {isAr ? 'طلب إلغاء الطلبية' : 'Demander l\'annulation'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">{annulationModal.ref}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-amber-700">
                  {isAr
                    ? '⚠️ طلبك سيُرسل للمراجعة. لن يُلغى تلقائياً حتى يوافق فريقنا.'
                    : '⚠️ Votre demande sera examinée. Elle ne sera pas annulée automatiquement sans confirmation de notre équipe.'
                  }
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  {isAr ? 'سبب الإلغاء' : 'Raison de l\'annulation'}
                </label>
                <textarea
                  value={annulationRaison}
                  onChange={e => setAnnulationRaison(e.target.value)}
                  placeholder={isAr ? 'اشرح سبب طلب الإلغاء...' : 'Expliquez la raison de votre demande...'}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-rose-400 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setAnnulationModal(null); setAnnulationRaison(''); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase hover:bg-slate-200 transition-all"
                >
                  {isAr ? 'رجوع' : 'Retour'}
                </button>
                <button
                  onClick={handleDemandeAnnulation}
                  disabled={annulationSending}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase hover:bg-rose-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {annulationSending ? <RotateCw className="w-4 h-4 animate-spin" /> : '✕'}
                  {isAr ? 'إرسال الطلب' : 'Envoyer la demande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoiceView && selectedFacture && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[200] p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Receipt className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{isAr ? 'معاينة الفاتورة' : 'Aperçu Document'}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{selectedFacture.numero}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setShowInvoiceView(false)} className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">{isAr ? 'إغلاق' : 'Fermer'}</button>
                 <button onClick={() => printElement(`invoice-${selectedFacture.id}`)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-3">
                    <Download className="w-4 h-4" />
                    {isAr ? 'حفظ / طباعة' : 'Imprimer PDF'}
                 </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
               <InvoicePRO 
                  id={`invoice-${selectedFacture.id}`}
                  facture={selectedFacture}
                  commande={commandes.find(c => c.id === selectedFacture.commandeId)}
                  company={company}
               />
            </div>
          </div>
        </div>
      )}

      {/* Technical Measurements Preview Modal */}
      {viewMesuresFiche && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'تفاصيل القياسات' : 'Détails des Mesures'}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{viewMesuresFiche.modele} • {viewMesuresFiche.client}</p>
              </div>
              <button onClick={() => setViewMesuresFiche(null)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all group">
                <X className="w-6 h-6 text-slate-900 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto no-scrollbar flex-grow">
              <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className={`px-6 py-5 font-black uppercase tracking-widest text-[10px] ${isAr ? 'text-right' : 'text-left'}`}>
                          {isAr ? 'نقطة القياس' : 'Point de Mesure'}
                        </th>
                        {viewMesuresFiche.tailles.map(t => (
                          <th key={t} className="px-6 py-5 text-center font-black uppercase tracking-widest text-[10px]">
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewMesuresFiche.mesures.map((m, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                          <td className={`px-6 py-4 font-bold text-slate-700 ${isAr ? 'text-right' : 'text-left'}`}>
                            {m.nom}
                          </td>
                          {viewMesuresFiche.tailles.map(taille => (
                            <td key={taille} className="px-6 py-4 text-center font-black text-indigo-600">
                              {m.valeurs?.[taille] || 0}<span className="text-[10px] font-normal text-slate-400 ml-1">{isAr ? 'سم' : 'cm'}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center flex-shrink-0">
               <button onClick={() => setViewMesuresFiche(null)} className="px-10 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 text-xs font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95">
                 {isAr ? 'إغلاق' : 'Fermer'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'طلب إنتاج جديد' : 'Nouvelle Commande'}</h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {orderSent ? (
                <div className="text-center py-10 animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                    <CircleCheck className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">{isAr ? 'تم إرسال طلبك!' : 'Commande Envoyée !'}</h4>
                  <p className="text-slate-500 text-sm font-medium">{isAr ? 'سنتواصل معك في أقرب وقت لتأكيد التفاصيل.' : 'Notre équipe vous contactera sous peu.'}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'نوع الموديل' : 'Type de Modèle'}</label>
                      <input 
                        type="text" 
                        value={newOrderForm.modele}
                        onChange={e => setNewOrderForm({...newOrderForm, modele: e.target.value})}
                        placeholder={isAr ? 'مثلاً: قميص بولو' : 'Ex: Polo Shirt'}
                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all ${isAr ? 'text-right' : ''}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'الكمية التقديرية' : 'Quantité Estimée'}</label>
                      <input 
                        type="number" 
                        value={newOrderForm.quantite}
                        onChange={e => setNewOrderForm({...newOrderForm, quantite: e.target.value})}
                        placeholder="100"
                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all ${isAr ? 'text-right' : ''}`}
                      />
                    </div>

                    {/* Size Breakdown */}
                    <div className="space-y-3">
                       <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>
                          {isAr ? 'تفصيل القياسات (اختياري)' : 'Répartition par Tailles (Optionnel)'}
                       </label>
                       <div className="grid grid-cols-3 gap-2">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <div key={size} className="relative">
                               <input
                                 type="number"
                                 placeholder={size}
                                 value={newOrderForm.tailles[size]}
                                 onChange={(e) => setNewOrderForm({
                                   ...newOrderForm,
                                   tailles: { ...newOrderForm.tailles, [size]: e.target.value }
                                 })}
                                 className={`w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-center outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300`}
                               />
                               <span className="absolute -top-2 left-2 px-1 bg-white text-[8px] font-black text-slate-400 uppercase">{size}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>
                        {isAr ? 'صورة الموديل' : 'Photo du Modèle'}
                        <span className="text-rose-500 ml-2">({isAr ? 'إجباري' : 'Obligatoire'} *)</span>
                      </label>
                      <div className="relative h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-400 transition-colors cursor-pointer">
                        {newOrderForm.photo ? (
                          <>
                            <img src={newOrderForm.photo} className="w-full h-full object-cover" />
                            <button onClick={() => setNewOrderForm({...newOrderForm, photo: null})} className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <Camera className="w-6 h-6 text-slate-300 mb-2" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'تحميل الصورة' : 'Ajouter une photo'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleOrderPhoto} />
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'تفاصيل إضافية' : 'Détails Supplémentaires'}</label>
                      <textarea 
                        value={newOrderForm.details}
                        onChange={e => setNewOrderForm({...newOrderForm, details: e.target.value})}
                        rows={3}
                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all resize-none ${isAr ? 'text-right' : ''}`}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={sendingOrder || !newOrderForm.modele || !newOrderForm.quantite || !newOrderForm.photo}
                    onClick={submitNewOrder}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-100"
                  >
                    {sendingOrder ? <RotateCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    {isAr ? 'إرسال الطلب' : 'Envoyer la Commande'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
